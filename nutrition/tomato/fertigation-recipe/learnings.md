# Tomate — fertigation-recipe · learnings

Rejected alternatives and historical decisions for this subproject. Current live values + REQ-tied derivations live in `derivation.md`. The spec
(`spec.md`) is the floor and ceiling for what's actually built.

---

## PA Taillon April 2026 fertigation anchor — retired 2026-05-14

Hand-locked T5 fertigation anchor recommended by PA Taillon (agronomist) in April 2026:

| Product       | Anchor dose | Rationale at the time                                          | Cert |
|---------------|-------------|----------------------------------------------------------------|------|
| K₂SO₄         | 5 167 g     | Mass-balance T5 with compost-credit subtraction (K offtake 6 000 mg/m²/wk less compost K release ≈ 232 mg/m²/wk, scaled). | 3    |
| MgSO₄·7H₂O    | 1 379 g     | Mass-balance T5 with compost-credit subtraction (Mg offtake 355 mg/m²/wk less compost Mg release ≈ 220 mg/m²/wk, scaled).  | 3    |
| Solubore      | 9 g         | Single-channel B at T5 (unchanged — still live in `data.js`). | 3    |

**Retired because:** the model's reference frame shifted on 2026-05-12 when REQ-098 was amended to drop compost-subtraction from the K and Mg branches of `computeStageRecipe`. PA Taillon's K 5 167 / Mg 1 379 numbers were calibrated against the *retired* compost-credited formula and could only be reproduced from the model with that credit term in place. Holding them as the FP target while the model moved on created an artificial 58 % Mg gap that the prior derivation framed as "normal field correction" — a category mismatch (compost-credited anchor vs offtake-only model), not field correction in the agronomic sense.

Guillaume's call (2026-05-13, captured as principle P-02): "keep policy direction; forget about pleasing the agronomist." Compost-as-soil-bank reframe stays; PA Taillon's anchor goes legacy. The live FP target is now the bare mass-balance output (K ≈ 5 322 / Mg ≈ 3 319 at T5), pinned to `computeStageRecipe('T5')` by REQ-154.

**Refinement trigger — when to revisit:**
- If tissue petiole consistently shows luxury Mg accumulation (Mg > 0.7 % DW) while the team is weighing-to-FP under the new target, the model's no-compost-subtraction policy may be overshooting. Path back: re-introduce a compost-credit term in `computeStageRecipe` (would require its own spec change, not a hand-locked FP override).
- If PA Taillon shifts to a new anchor, change the **model inputs** (`TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`, sidedress mineralization) rather than overriding the FP target.

**Audit-trail intent:** preserved here for organic-cert (the FP recipe in service of the team through April-May 2026 was the PA Taillon anchor) and for future re-evaluation if the model's reference frame ever shifts back to compost-credited offtake.

---

## Compost subtraction in K/Mg mass-balance — retired 2026-05-13

REQ-098 amended 2026-05-12 to drop compost release from the K and Mg
mass-balance: `computeStageRecipe(stage)` now replenishes the FULL plant
offtake (fruit export + biomass demand), with sidedress credited on K
only. Mg is pure offtake. Compost contribution is tracked separately as
a soil-bank input in `nutrition/compost-contribution/spec.md` and no
longer enters the fertigation cascade math. The prior policy (with
compost subtraction) and its reconciliation history are preserved below
for organic-cert audit and future re-evaluation.

### Prior formula (with compost subtraction)

```
totalArea_m2          = TOMATO_NUM_BEDS × TOMATO_BED_AREA  // 7 × 54.7 = 382.9 m²
compost_K_mg/m²/wk    = CompostContribution.releasePerWeek.K × 1000
compost_Mg_mg/m²/wk   = CompostContribution.releasePerWeek.Mg × 1000

// ── K ──
k_offtake_mg/m²/wk    = TOMATO_FRUIT_EXPORT.K × stageYield × 1000 + BIOMASS_DEMAND[stage].K
k_sidedress_mg/m²/wk  = STORED_RECIPE.tomato.sidedress[stage].actisol_g
                         × PRODUCT_PCT.Actisol_K × SIDEDRESS_MIN_EFF.K × 1000
                         / SIDEDRESS_AREA_PER_PLANCHE
k_needed_mg/m²/wk     = max(0, k_offtake − k_sidedress − compost_K)
kSulfate_g_total      = round(k_needed / 1000 / PRODUCT_PCT.K2SO4_K × totalArea_m2)

// ── Mg ──
mg_offtake_mg/m²/wk   = TOMATO_FRUIT_EXPORT.Mg × stageYield × 1000 + BIOMASS_DEMAND[stage].Mg
mg_needed_mg/m²/wk    = max(0, mg_offtake − compost_Mg)   // sidedress carries no Mg
mgSulfate_g_total     = round(mg_needed / 1000 / PRODUCT_PCT.MgSO4_Mg × totalArea_m2)
```

Prior `calc.js` body:

```js
function computeStageRecipe(stage) {
  const y = RECIPE_INPUTS.stageYield[stage] || 0;
  const totalArea = TOMATO_NUM_BEDS * TOMATO_BED_AREA;
  const sd = STORED_RECIPE.tomato.sidedress[stage] || { actisol_g: 0, farine_g: 0 };
  const biomass = BIOMASS_DEMAND[stage] || {};
  const compost = window.CompostContribution.releasePerWeek;

  // K offtake − sidedress − compost
  const k_offtake_mg = (TOMATO_FRUIT_EXPORT.K.g * 1000 * y) + (biomass.K || 0);
  const k_sd_mg = (sd.actisol_g * PRODUCT_PCT.Actisol_K
                   * (SIDEDRESS_MIN_EFF.K || 0.85) * 1000)
                   / SIDEDRESS_AREA_PER_PLANCHE;
  const k_compost_mg = (compost.K || 0) * 1000;
  const k_needed_mg_per_m2 = Math.max(0, k_offtake_mg - k_sd_mg - k_compost_mg);
  const kSulfate = Math.round((k_needed_mg_per_m2 / 1000 / PRODUCT_PCT.K2SO4_K) * totalArea);

  // Mg offtake − compost (no sidedress contribution)
  const mg_offtake_mg = (TOMATO_FRUIT_EXPORT.Mg.g * 1000 * y) + (biomass.Mg || 0);
  const mg_compost_mg = (compost.Mg || 0) * 1000;
  const mg_needed_mg_per_m2 = Math.max(0, mg_offtake_mg - mg_compost_mg);
  const mgSulfate = Math.round((mg_needed_mg_per_m2 / 1000 / PRODUCT_PCT.MgSO4_Mg) * totalArea);

  return { mgSulfate, kSulfate };
}
```

### Policy-vs-implementation drift history

The framing comment that landed 2026-05-07 ("COMPOST IS NOT SUBTRACTED")
expressed a *policy direction* — fertigation should replenish full plant
offtake regardless of compost contribution, treating compost as a
margin-of-safety bank rather than a fertigation credit. Intent: avoid
silent under-feeding when compost ages out (compost release is uncertain,
especially Mg at cert 1-2 with no label data, and finite over 18-24
months).

The *implementation* lagged the comment from 2026-05-07 → 2026-05-12 —
the code still subtracted compost from both K and Mg even after the
framing comment shifted. At the time, the live code paths that consumed
`computeStageRecipe(stage)` (Block 7 stored-vs-FP drift gauge,
`calcNutrSupply` in fp mode, downstream supply bound assertions
REQ-013/014, predictedCE in REQ-024) were calibrated against the
WITH-subtraction values:

- T5 K: offtake 6 000 − sidedress 0 − compost 400 = 5 600 mg/m²/wk →
  K₂SO₄ 5 167 g (matched PA Taillon April 2026 anchor by construction).
- T5 Mg: offtake 855 − compost 500 = 355 mg/m²/wk → MgSO₄·7H₂O 1 379 g
  (matched PA Taillon April 2026 anchor by construction).

The asymmetry with `computeStageSidedress` (which subtracts compost for
N — a separate channel/element with its own accounting) was intentional;
the N channel and the K/Mg channel were extracted at different points in
the policy evolution.

### Reconciliation outcome (2026-05-12)

The reconciliation plan documented during the drift period — "bundle the
no-compost-subtraction policy update with a refit of the FP T5 anchor
(PA Taillon retune) so all REQs move in lockstep" — was superseded by a
simpler resolution: REQ-098 was amended to remove the subtraction term
in spec + calc.js, and the PA Taillon `FP_RECIPE_T5.fertigation` anchor
(5 167 / 1 379) was kept fixed. The drift between the bare mass-balance
output (5 322 / 3 319 at T5 under the no-subtraction policy) and the
anchor (5 167 / 1 379) is now framed as normal field correction at the
Block 7 stored-vs-FP gauge — the same framing used for any agronomist-
adjusted T5 anchor against the unrounded mass-balance.

### Why this is preserved here

The compost-subtraction policy carried calibration weight against three
downstream invariants: REQ-014 supply bound at T4/T5 Mg, REQ-024
predictedCE at T2, and the PA Taillon T5 anchor's mass-balance
correspondence. If future tissue data ever motivates re-introducing an
explicit compost credit, the prior formula + the calibration
relationships above are the starting point — they don't need to be
re-derived from scratch. Re-introducing would require: (a) tissue Mg
panels confirming luxury accumulation under the current full-offtake
policy, (b) a refresh of REQ-014 / REQ-024 calibration against the
restored formula, and (c) a refit (or explicit drift framing) of the
PA Taillon T5 anchor.

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
