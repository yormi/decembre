# Tomate — fertigation-recipe · learnings

Rejected alternatives and historical decisions for this subproject. Current live values + REQ-tied derivations live in `derivation.md`. The spec
(`spec.md`) is the floor and ceiling for what's actually built.

---

## REQ-151 `computeFertigationSupply` — recipe-arg shape decision (2026-05-12)

Three candidate signatures were considered for the supply function before
the canonical g-keyed shape was locked.

**Option A — Canonical g-keyed input (selected).** Function expects exactly
`{ kSulfate_g, mgSulfate_g, solubore_g }`. Caller reshapes from any
upstream source.

**Option B — Polymorphic input.** Function accepts either FP literal shape
(`{ 'K2SO4', 'MgSO4-7H2O', 'Solubore' }`) or stored shape
(`{ kSulfate, mgSulfate }`) and normalizes internally. *Rejected:*
violates SRP at the model boundary (`feedback_model_srp.md`). Shape
detection is glue and belongs to the caller. Polymorphic boundaries
accumulate dead branches as upstream sources change; canonical
boundaries don't.

**Option C — Stage-mode signature.** Function takes
`(stage, { mode: 'fp' | 'stored' })` and reaches into `FP_RECIPE_T5` or
`STORED_RECIPE` itself. *Rejected:* breaks the pure-function discipline
— the model would read globals (see memory `feedback_pure_code.md`) —
AND breaks SRP, since mode flags smuggle source-selection into the
model. Also breaks symmetry with `computeFoliarSupply`, whose verifier
exercises the recipe arg directly with stub recipes; a stage-mode
signature would lose that lever.

**Principle (saved to memory `feedback_model_srp.md`):** model/calc
functions accept pre-normalized inputs and apply one rule. Shape
detection, source selection, reshape — all caller-side glue. No mode
flags at the model boundary.

---

## `details` in the supply return — caller-built, not function-built (2026-05-12)

Contribution-channel functions must return a flat `mg` map plus a
`details` sibling carrying per-element `{cert, cap}` (REQ-136).
Two implementations were possible for fertigation:

**Option A — `details` built inside the model function.** Function
returns `{ perM2_mg, details }`. Cap detection (K capped at CE, B
single-channel, etc.) lives in the supply function.

**Option B — `details` built at the caller, flat return from the model
(selected).** Function returns the flat `mg` map; caller composes
`details` from supplied values + page state (current pH, lockout flag).

Selected B because cap detection for fertigation depends on context the
model function shouldn't know about (current pH, which elements are
sourced in the current operational recipe, which pages render the
block). Pushing that into the model would require passing
`{ currentPh, phLocked, sourcedElements }` opts — back to glue inside.
Matches `computeFoliarSupply` precedent (returns flat; details composed
in `nutrition/tomato/app/logic.js`). When the caller surface is ready
for a unified `{ perM2_mg, details }` return shape across all channels,
both foliar and fertigation get retrofitted together — separate REQ.

---

## Mode-aware mixing factor (retired 2026-05-10 — referenced from derivation.md "Why no mixing factor")

`MIXING_FACTOR_FERT` (and its split into `_STORED = 0.5` / `_FP = 1.0`)
was introduced 2026-05-05 on the premise that ~50% of stored-mode
fertigation re-enters the SME pool and would double-count if summed on
top of `supply.soil`. Retired 2026-05-10 — fertigation supply must
report full barrel mass with no mixing-factor discount (was REQ-100,
deleted from spec; number not reused). The full derivation context
(why introduced, why dropped) lives in `derivation.md` "Why no mixing
factor" — kept there because the decision is referenced by the supply
formula's "no pH-response, no mixing-factor, no coverage discount"
statement and is load-bearing for understanding the current shape.
Listed here only as a pointer.
