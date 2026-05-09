# Tomate — foliar-recipe

Specs for the model that **delivers the weekly foliar oligo spray** —
Mn / Zn / Cu / Mo / Fe (and historically Solubore B, Ca via Spray B before
2026-05-06). The model takes a stage and returns the per-element
mg/m²/wk delivered to the plant via cuticle uptake, after a coverage
discount.

This file is the *spec* (what the model must do or be). The framing
(burn-cap-constrained vs mass-balance-derived), per-element delivered
table, no-yucca trade-off, refinement triggers and implementation map
live in `derivation.md` next door. The operational *stored* spray that
the team mixes (`STORED_RECIPE.tomato.foliaire`) is governed by the
`/retire-recipe` audit-trail skill, not by this spec.

The model answers exactly one question: **"how much of element X
arrives at the plant per m² per week from the spray at stage S, after
cuticle-coverage losses?"**

It does NOT answer:
- What dose to weigh into the backpack (that's `STORED_RECIPE.tomato.foliaire`,
  hand-locked to PA Taillon's April 2026 recommendation as adjusted for
  the no-yucca regime; edits go through `/retire-recipe`).
- Whether the recipe meets demand (that's the supply chain — the foliar
  output here is one of four channels summed against demand under
  REQ-013/014 in `nutrition/tomato/spec.md`).
- The first-principles dose that would meet demand — **foliar is
  burn-cap-constrained, not mass-balance-derived**. There is no FP
  derivation that grows freely with demand: the dose is pinned at the
  maximum that the cuticle tolerates without surfactant, then delivery
  is computed under the coverage discount and validated against demand
  band. See `derivation.md`.

Cross-channel scope: foliar is the LAST channel in the weekly
replenishment chain (compost → sidedress → fertigation → foliar) and
the only one that bypasses root-zone chemistry. That makes it the
single most important lever during the current pH-lockout crisis for
Mn / Zn / Fe / Cu. The chain itself is in `nutrition/tomato/spec.md`
(REQ-013 / REQ-014 supply bounds, REQ-061 cascade order).

---

## Contract

### Inputs

| Name      | Type   | Range                            | Source                            |
|-----------|--------|----------------------------------|-----------------------------------|
| `stage`   | string | `T1` / `T2` / `T3` / `T4` / `T5` | Tomato production stage selector  |

The current STORED foliar recipe is stage-invariant (PA Taillon design —
oligos are tissue-baseline anchored, not yield-scaled). The `stage`
argument is plumbed through anyway so the contract stays uniform with
sidedress / fertigation siblings, and so a future stage-aware spray can
land without changing call sites.

### Output

`computeFoliarSupply(stage)` returns the per-element mg/m²/wk delivered:

```js
{ N: 0, P: 0, K: 0, Ca: 0, Mg: 0,
  Fe: number, Mn: number, Zn: number, B: number, Cu: number, Mo: number }
```

All masses in **mg per m² per week** at the tomato bed area
(`TOMATO_NUM_BEDS × TOMATO_BED_AREA = 382.9 m²`). Macros (N / P / K / Ca / Mg)
are explicit zeros — the current oligo spray carries no macros, and
foliar physiology bars N / P / Ca / Mg from being viable foliar channels
(see `derivation.md` "no-macro by design"). Element coverage stays
closed at the 11 canonical elements present in `TOMATO_FRUIT_EXPORT`.

---

## Cert scale

Same single-cert transferability scale as
`nutrition/tomato/plant-needs/spec.md` ("Cert scale" section — canonical).

---

## INV-1 — Element coverage is closed

For every stage in `RECIPE_INPUTS.stageYield`, `computeFoliarSupply(stage)`
returns numeric, finite, non-negative values for every element in
`TOMATO_FRUIT_EXPORT` (currently 11). No `undefined`, `NaN`, or negative
values.

**Verification:** `scripts/check-recipes.mjs` — call once per stage and
assert the shape + non-negativity.

---

## REQ-101 — Coverage discount applied to foliar delivery

For each element in the spray and each stage, the delivered mg/m²/wk
equals:

```
delivered_mg/m²/wk = (recipe_g × element_pct × 1000) / area_m² × FOLIAR_COVERAGE_DEFAULT
```

where `FOLIAR_COVERAGE_DEFAULT = 0.30` while the program operates
without a surfactant (yucca decision 2026-05-05, not on order).

**Rationale:** Without yucca, droplet beading + runoff leaves only ~30 %
of the spray's active mass in cuticular contact long enough for uptake.
Reporting label dose as "delivered" overstates supply by ~3.3× and
silently hides under-fert when the Bilan compares supply to demand.
Wiring the discount into `computeFoliarSupply` makes the foliar branch
honest by construction; flipping back to ~80 % is a one-line edit
(yucca decision) that automatically propagates everywhere foliar supply
is read. Tied to REQ-018 (no decorative products): a foliar product
falling below 5 % effective uptake at the current coverage must be
flagged or removed.

**Verification:** `scripts/check-recipes.mjs` REQ-101 — for two pinned
elements (Mn, Fe), recompute the formula from
`STORED_RECIPE.tomato.foliaire` × `PRODUCT_PCT.{MnSO4_Mn, FeSO4_Fe}` ×
`FOLIAR_COVERAGE_DEFAULT` / area and assert
`computeFoliarSupply('T5').{Mn, Fe}` matches within 1 % of the expected
value. Mn pins the surfactant-coverage logic; Fe pins the Fe-specific
PRODUCT_PCT path (FeSO₄·7H₂O 20 % Fe).

**Cert:** 4 (coverage % is from cuticle-uptake literature ranges 25-40 %
without surfactant; pinned at 30 % matches operator observation of
runoff at current dose; transferable to similar tomato-leaf morphology).

---

## REQ-103 — Public API namespace `window.FoliarRecipeTomato`

At runtime, `window.FoliarRecipeTomato` exists and exposes:

| Key                              | Type     |
|----------------------------------|----------|
| `AREA_M2`                        | number   |
| `FOLIAR_COVERAGE_DEFAULT`        | number   |
| `FOLIAR_COVERAGE_WITH_YUCCA`     | number   |
| `computeFoliarSupply`            | function |

**Rationale:** Same as `PlantNeedsTomato` (REQ-083),
`SidedressRecipeTomato` (REQ-088), `CompostContribution` (REQ-080).
Consumers (Bilan supply chain, "Recette proposée" admin card, future
yucca-decision drift gauge) read foliar supply through this namespace
so internals can be reshaped (yucca on/off, per-stage dose differentiation,
addition of B back to foliar) without breaking call sites.

**Verification:** `scripts/check-recipes.mjs` REQ-103 — namespace
presence + key set + spot-check that `computeFoliarSupply('T5').Fe`
returns a positive finite number.

**Cert:** 5 (structural assertion).

---

## Pending — yucca-coverage refinement trigger

The single biggest lever in this subproject. If yucca surfactant
returns to the program, `FOLIAR_COVERAGE_DEFAULT` flips
`0.30 → 0.80` and every element's effective delivery jumps
~2.7×. RECIPE_HISTORY context: when yucca was dropped (decision
2026-05-05), Cu was cut 4 → 2 g, Mn 22 → 18 g, Zn 22 → 16 g to stay
under burn cap without the dispersing benefit of yucca. Restoration
would also relax those dose limits (re-evaluate against REQ-025 burn
cap with the higher per-element loads).

When wired: capture the decision via `/retire-recipe` (the doses change
inside `STORED_RECIPE.tomato.foliaire` — that's the trigger), then
flip `FOLIAR_COVERAGE_DEFAULT` here. Both are mechanical, but the
recipe edit must come first so the audit-trail snapshot lands on the
old recipe.

---

## Inherited specs

Foliar consumes plant-needs offtake to validate delivery against demand:

- **REQ-083** (`nutrition/tomato/plant-needs/spec.md`) —
  `PlantNeedsTomato.demandTotal` is the canonical demand source.

Specs that *consume* the foliar output OR that govern foliar tank
behavior independently:

- **REQ-013 / REQ-014** (`nutrition/tomato/spec.md`) — supply chain
  bounds. Foliar is one of four channels summed against demand. Foliar
  micros (Mn / Zn / Fe / Cu) are the only channel left while pH stays
  ≥ 7 — under-fert here surfaces as visible deficiency.
- **REQ-018** (`nutrition/spec.md`) — no decorative products at current
  pH. The coverage discount in REQ-101 cuts headline efficiency to
  ~30 % across the board; if a future product drops below the 5 %
  effective threshold *after* coverage, REQ-018 fires.
- **REQ-022** (`nutrition/spec.md`) — every product is Ecocert-allowed.
  MnSO₄ / ZnSO₄ / CuSO₄ / Solubore / Na molybdate / FeSO₄·7H₂O all on
  the certified-input list (CAN/CGSB-32.310/311). CaCl₂ (Spray B) was
  removed 2026-05-06 because the Teris industrial-grade listing
  couldn't be verified — REQ-022 in spirit even though the live recipe
  no longer carries it.
- **REQ-025** (`nutrition/spec.md`) — foliar tank predicted CE under
  burn cap (10 mS/cm tomato). This subproject does NOT define its own
  burn-cap REQ; the cross-crop REQ-025 already wires it in
  `scripts/check-recipes.mjs`. Editing foliar doses (via `/retire-recipe`)
  must keep the recipe under the cap or that check fires.
- **REQ-053 / REQ-055** (`nutrition/spec.md`) — predicted tank pH +
  cuticle-pH multiplier. Foliar tank pH lands ~5 (sulfate dominant),
  in the cuticle-uptake sweet spot (`foliarPhResponse` peaks 5.5-6.0).
  The current spray is well-positioned on this axis; the coverage
  discount in REQ-101 captures the *non*-pH part of effective
  efficiency.
- **REQ-061** (`nutrition/spec.md`) — cascade order. Foliar is the last
  channel; should only carry the residual gap. Mn / Zn / Fe / Cu have
  no other channel today (sulfates precipitate at root-zone pH 7.4),
  so foliar IS the earliest active channel for those elements —
  REQ-061's verifier already accommodates this.
- **REQ-062** (`nutrition/spec.md`) — single foliar spray per week.
  `STORED_RECIPE.tomato.foliaire` carries exactly one spray-recipe key
  (`A`); enforced by REQ-062's verifier.
