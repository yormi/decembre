# Tomate — fertigation-recipe

Specs for the model that **derives the first-principles weekly fertigation
dose** (liquid replenishment of K, Mg, and B at the dripper) per tomato
production stage, in grams of product per total tomato area per week.

This file is the *spec* (what the model must do or be). Mass-balance
derivation, T5 refined target rationale, mixing-factor mode-aware
mechanism, source tables (PA Taillon April 2026), refinement triggers
live in `derivation.md` next door. Operational *stored* values that the
team currently weighs out (`STORED_RECIPE.tomato.fertigation`, hand-locked
at PA Taillon's April 2026 recommendation) are governed by the
`/retire-recipe` audit-trail skill, not by this spec.

The model answers exactly one question: **"how many grams of K₂SO₄ +
MgSO₄·7H₂O (and Solubore B at T5) per tomato bed-area per week does the
plant need at stage S to replenish offtake from the soil bank, given
sidedress and compost mineralization?"**

It does NOT answer:
- What the team currently weighs out (that's
  `STORED_RECIPE.tomato.fertigation`).
- How much K/Mg/B is *available* this week — that's the supply chain
  (soil mass-flow + sidedress + foliar). See `calcNutrSupply` in
  `app/index.html`.
- The barrel-mixing or injection schedule (operations, not modeling).
- LUXURY_FACTOR cap on supply.soil — that's a supply-side concern,
  remains with `calcNutrSupply`. Listed in inherited specs only as a
  consumer-side reference.

Cross-channel scope: fertigation is *part of* the weekly replenishment
chain (compost → sidedress → fertigation → foliar). This subproject owns
the **fertigation-only** sizing. The chain itself is in
`nutrition/tomato/spec.md` (REQ-013 / REQ-014 supply bounds).

---

## Contract

### Inputs

| Name    | Type   | Range                            | Source                            |
|---------|--------|----------------------------------|-----------------------------------|
| `stage` | string | `T1` / `T2` / `T3` / `T4` / `T5` | Tomato production stage selector  |

All other dependencies (fruit export, biomass demand, sidedress dose,
compost residual, product chemistry, total tomato area) are pulled from
upstream subprojects / constants — see derivation.

### Output

`computeStageRecipe(stage)` returns:

```js
{ kSulfate: number, mgSulfate: number }
```

Both masses in **grams of product per total tomato area per week**
(area = `TOMATO_NUM_BEDS × TOMATO_BED_AREA = 7 × 54.7 = 382.9 m²`).
`kSulfate` is grams of K₂SO₄; `mgSulfate` is grams of MgSO₄·7H₂O.
Boric acid (Solubore B) is wired into `FP_RECIPE_T5.fertigation` as a
T5-only constant — see derivation; not in the per-stage `computeStageRecipe`
return because B demand is uniform across stages and the dose ramps with
no stage signal.

---

## Cert scale

Same single-cert transferability scale as
`nutrition/tomato/plant-needs/spec.md` ("Cert scale" section — canonical).

---

## INV-1 — Stage coverage is closed

For every stage in `RECIPE_INPUTS.stageYield`, `computeStageRecipe(stage)`
returns numeric `kSulfate` and `mgSulfate`. No `undefined`, `NaN`, or
negative values.

**Verification:** `scripts/check-recipes.mjs` — call once per stage and
assert numeric ≥ 0 for both fields.

---

## REQ-098 — Mass-balance derivation matches the formula

For each stage, `computeStageRecipe(stage)` returns values that match the
mass-balance derivation (compost subtracted from offtake, sidedress
subtracted from K only — Mg sidedress is zero by product chemistry):

```
compost_K_mg/m²/wk   = CompostContribution.releasePerWeek.K × 1000
compost_Mg_mg/m²/wk  = CompostContribution.releasePerWeek.Mg × 1000

k_offtake_mg/m²/wk   = TOMATO_FRUIT_EXPORT.K × stageYield × 1000 + BIOMASS_DEMAND[stage].K
k_sidedress_mg/m²/wk = STORED_RECIPE.tomato.sidedress[stage].actisol_g
                        × PRODUCT_PCT.Actisol_K × SIDEDRESS_MIN_EFF.K × 1000
                        / SIDEDRESS_AREA_PER_PLANCHE
k_needed_mg/m²/wk    = max(0, k_offtake − k_sidedress − compost_K)
kSulfate_g_total     = round(k_needed / 1000 / PRODUCT_PCT.K2SO4_K × total_area)

mg_offtake_mg/m²/wk  = TOMATO_FRUIT_EXPORT.Mg × stageYield × 1000 + BIOMASS_DEMAND[stage].Mg
mg_needed_mg/m²/wk   = max(0, mg_offtake − compost_Mg)   // sidedress carries no Mg
mgSulfate_g_total    = round(mg_needed / 1000 / PRODUCT_PCT.MgSO4_Mg × total_area)
```

Compost release IS subtracted (current implementation at 2026-05-09
extraction). The "no compost subtraction" framing in the comment block
expresses an intended policy direction (mass-balance pure, replenish
offtake regardless of compost) but the code has not yet been updated to
match — see derivation.md "policy vs implementation drift" for the
trade-off and reconciliation plan.

The mass-balance is K- and Mg-only — those are the two macros where
fertigation is the dominant channel. N stays with sidedress (organic-N
concentrate, REQ-087); micros stay with foliar (cuticle uptake bypasses
soil lockout); B is the one micro on fertigation (single-channel, REQ-061
foliar-only-when-needed) and is fixed at T5 by refined target (see
derivation).

**Rationale:** Same logic as REQ-087 (sidedress mass-balance). Grounding
fertigation sizing in plant-needs offtake minus sidedress makes the dose
a function of inputs that already have their own specs (REQ-013/014
bounds, REQ-083 plant-needs, REQ-087 sidedress, REQ-080 compost). Drift
surfaces at the upstream-spec level instead of being hidden inside a
recipe number. Fertigation has historically been the heaviest-touched
recipe channel (50+ references in Bilan + Banque sol pages); pinning the
derivation in one place means future tuning happens here, not in scattered
call sites.

**Verification:** `scripts/check-recipes.mjs` REQ-098 — recomputes the
formula from upstream constants and asserts every
`computeStageRecipe(stage)` output is within ±5 g of the expected value
(rounding tolerance) for both `kSulfate` and `mgSulfate`.

**Cert:** 3 (mass-balance is well-defined; values inherit cert 3 from
plant-needs and cert 3 from sidedress mineralization; effective cert
min = 3; formula application itself is structural, cert 4).

---

## REQ-099 — Public API namespace `window.FertigationRecipeTomato`

At runtime, `window.FertigationRecipeTomato` exists and exposes:

| Key                          | Type     |
|------------------------------|----------|
| `MIXING_FACTOR_STORED`       | number   |
| `MIXING_FACTOR_FP`           | number   |
| `FIRST_PRINCIPLES_T5`        | object   |
| `computeStageRecipe`         | function |

**Rationale:** Same as `PlantNeedsTomato` (REQ-083),
`CompostContribution` (REQ-080), `SidedressRecipeTomato` (REQ-088).
Consumers (`calcNutrSupply`, `renderProposedRecipe`,
`renderPhase1Comparison`, future per-stage drift gauges) read fertigation
through this namespace so internals can be reshaped without breaking call
sites. `FIRST_PRINCIPLES_T5` mirrors the wired
`FP_RECIPE_T5.fertigation` shape (`K2SO4`, `MgSO4-7H2O`, `Solubore`).

**Verification:** `scripts/check-recipes.mjs` REQ-099 — namespace presence
+ key set + spot-check of `computeStageRecipe('T5').kSulfate` shape.

**Cert:** 5 (structural assertion).

---

## REQ-100 — Mixing factor is mode-aware

Two mixing-factor constants exist:

- `MIXING_FACTOR_STORED = 0.5` — applied when `calcNutrSupply` runs in
  `mode === 'stored'`.
- `MIXING_FACTOR_FP = 1.0` — applied when `calcNutrSupply` runs in
  `mode === 'fp'`.

`MIXING_FACTOR_STORED < MIXING_FACTOR_FP` (strict inequality), and
`MIXING_FACTOR_FP === 1.0`.

**Rationale:** In `stored` mode (live operation), supply.soil already
includes last week's residue (SME measurement captures it), so summing
the full barrel on top would double-count. The 0.5 factor estimates the
*additional* fraction this week beyond what SME already reflects (drip
delivers liquid to the active root zone; ~half is absorbed before mixing
with the bulk pool). In `fp` mode (mass-balance pure, no SME credit per
2026-05-08 philosophy shift), supply.soil is dropped for fertigation-
deliverable elements — the full barrel counts as fresh supply, so factor
= 1.0. Without mode-awareness, the FP target would be silently halved
when consumed in fp mode, breaking REQ-013/014 supply bounds.

**Verification:** `scripts/check-recipes.mjs` REQ-100 — assert the two
constants are exposed on `window.FertigationRecipeTomato` with the
expected numeric inequality and the FP value pinned at 1.0.

**Cert:** 3 (mechanism cert 3 — drip mixing physics; specific 0.5 value
cert 2-3 from operational reasoning, no measured anchor at Décembre yet).

---

## Inherited specs

Fertigation consumes plant-needs, sidedress, and stored-recipe outputs:

- **REQ-083** (`nutrition/tomato/plant-needs/spec.md`) —
  `PlantNeedsTomato.demandTotal` is the canonical demand source
  (`TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`).
- **REQ-087 / REQ-088** (`nutrition/tomato/sidedress-recipe/spec.md`) —
  sidedress contribution subtracted in the K offtake.

Specs that *consume* the fertigation output:

- **REQ-013 / REQ-014** (`nutrition/tomato/spec.md`) — supply chain bounds.
  Fertigation K, Mg, B are channels summed against demand.
- **REQ-022** (`nutrition/spec.md`) — every product is Ecocert-allowed.
  K₂SO₄, MgSO₄·7H₂O, and Solubore (boric acid) are all on the certified-
  input list.
- **REQ-002** (`nutrition/spec.md`) — no forbidden products.
- **REQ-061** (`requirements.md`) — foliar dose only when earlier channels
  insufficient. Fertigation owns B as the single channel; foliar B = 0.

The `LUXURY_FACTOR` supply cap in `app/index.html` is a *consumer-side*
concern — it caps `supply.soil` (not fertigation supply) at `demand ×
luxury`. Stays with `calcNutrSupply`; not part of this subproject's
contract.
