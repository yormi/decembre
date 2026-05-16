# Tomate — fertigation-recipe

Specs for the model that **derives the first-principles weekly fertigation
dose** (liquid replenishment of K, Mg, and B at the dripper) per tomato
production stage, in grams of product per total tomato area per week.

Mass-balance derivation, T5 refined target rationale, source tables (PA
Taillon April 2026), refinement triggers live in `derivation.md`. Rejected
alternatives and historical anchors (legacy PA Taillon K 5167 / Mg 1379)
live in `learnings.md`. Operational *stored* values
(`STORED_RECIPE.tomato.fertigation`) are governed by `/retire-recipe`, not
this spec.

The model answers two questions:

1. **Sizing** — `computeStageRecipe(stage)` returns grams of K₂SO₄ +
   MgSO₄·7H₂O (and Solubore at T5) per tomato bed-area per week to
   replenish offtake net of sidedress and compost (REQ-098).
2. **Supply** — `computeFertigationSupply(stage, opts, recipe)` returns
   mg/m²/wk of each element delivered to the bed (REQ-151).

Out of scope: `STORED_RECIPE.tomato.fertigation`, barrel-mixing/injection
schedule, `LUXURY_FACTOR` cap on `supply.soil` (consumer-side concern on
the soil channel), per-element cap/cert detail (built at caller per REQ-136).

Cross-channel: fertigation sits in the chain `compost → sidedress →
fertigation → foliar`. This subproject owns fertigation-only sizing; the
chain bounds live in `nutrition/tomato/spec.md` (REQ-013 / REQ-014).

---

## Contract

### Inputs

| Name    | Type   | Range                            | Source                            |
|---------|--------|----------------------------------|-----------------------------------|
| `stage` | string | `T1` / `T2` / `T3` / `T4` / `T5` | Tomato production stage selector  |

All other dependencies (fruit export, biomass demand, sidedress dose,
compost residual, product chemistry, total tomato area) pulled from
upstream subprojects / constants — see derivation.

### Output

`computeStageRecipe(stage)` returns:

```js
{ kSulfate: number, mgSulfate: number }
```

Both masses in **grams of product per total tomato area per week**
(area = `TOMATO_NUM_BEDS × TOMATO_BED_AREA = 7 × 54.7 = 382.9 m²`).
`kSulfate` is grams of K₂SO₄; `mgSulfate` is grams of MgSO₄·7H₂O.
Boric acid (Solubore) is wired into `FP_RECIPE_T5.fertigation` as a
T5-only constant (B demand uniform across stages, no stage signal to ramp).

---

## Cert scale

Same single-cert transferability scale as
`nutrition/tomato/plant-needs/spec.md` ("Cert scale" section — canonical).

---

## INV-1 — Stage coverage is closed

For every stage in `RECIPE_INPUTS.stageYield`, `computeStageRecipe(stage)`
returns numeric `kSulfate` and `mgSulfate`. No `undefined`, `NaN`, or
negative values.

---

## REQ-098 — Mass-balance derivation matches the formula

For each stage and each element, `computeStageRecipe(stage)` returns
values that match the mass-balance derivation:

```
fertigation_needed = max(0, plant_demand − compost_release − sidedress_release − soil_bank_credit)
```

where `soil_bank_credit` applies **only** to elements `{P, Ca}` and is
zero for all others. Compost release and sidedress release are
*current-week* deliveries from upstream channels, not bank reservoirs.

The function implements only the K and Mg branches (the two macros
where fertigation is the dominant channel); P and Ca resolve to zero
fertigation under the soil-bank credit branch (P drawdown via Banque
sol, Ca not fertigated), so they're not in the function's return.

```
k_offtake_mg/m²/wk    = TOMATO_FRUIT_EXPORT.K × stageYield × 1000 + BIOMASS_DEMAND[stage].K
k_sidedress_mg/m²/wk  = STORED_RECIPE.tomato.sidedress[stage].actisol_g
                         × PRODUCT_PCT.Actisol_K × SIDEDRESS_MIN_EFF.Actisol_K × 1000
                         / SIDEDRESS_AREA_PER_PLANCHE
k_compost_mg/m²/wk    = CompostContribution.releasePerWeek.K × 1000
k_needed_mg/m²/wk     = max(0, k_offtake − k_sidedress − k_compost)
kSulfate_g_total      = round(k_needed / 1000 / PRODUCT_PCT.K2SO4_K × total_area)

mg_offtake_mg/m²/wk   = TOMATO_FRUIT_EXPORT.Mg × stageYield × 1000 + BIOMASS_DEMAND[stage].Mg
mg_compost_mg/m²/wk   = CompostContribution.releasePerWeek.Mg × 1000
mg_needed_mg/m²/wk    = max(0, mg_offtake − mg_compost)   // sidedress carries no Mg
mgSulfate_g_total     = round(mg_needed / 1000 / PRODUCT_PCT.MgSO4_Mg × total_area)
```

N stays with sidedress (organic-N concentrate, REQ-087); micros stay
with foliar (cuticle uptake bypasses soil lockout); B is the one micro
on fertigation (single-channel, REQ-061) and is fixed at T5 by refined
target (see derivation).

**Cert:** 3 (mass-balance well-defined; values inherit cert 3 from
plant-needs and sidedress; compost release cert 2-3; effective cert
min = 2-3; formula application cert 4).

---

## REQ-099 — Public API namespace `window.FertigationRecipeTomato`

At runtime, `window.FertigationRecipeTomato` exists and exposes:

| Key                          | Type     |
|------------------------------|----------|
| `FIRST_PRINCIPLES_T5`        | object   |
| `efficiency`                 | object   |
| `computeStageRecipe`         | function |

`efficiency` (per REQ-157) is per-element delivery fraction at current
soil pH 7.4 chemistry (channel → bed axis). K/Mg follow the
`soluble-cation` PH_RESPONSE curve; B follows `borate` (non-ionic, flat
at 1.0). Orthogonal bed → plant uptake-inefficiency axis is
`PH_UPTAKE_FACTOR_AT_CURRENT_SOIL` (REQ-155).

REQ-099 covers the sizer surface. Supply-side `computeFertigationSupply`
is asserted independently by REQ-151. `FIRST_PRINCIPLES_T5` mirrors the
wired `FP_RECIPE_T5.fertigation` shape (`K2SO4`, `MgSO4-7H2O`, `Solubore`).

**Cert:** 5 (structural assertion).

---

## REQ-154 — `FIRST_PRINCIPLES_T5_FERTIGATION` mirrors `computeStageRecipe('T5')` by construction

**Statement:** At runtime, after `wireFpFertigation()` runs at script load,
`FIRST_PRINCIPLES_T5_FERTIGATION['K2SO4']` equals `computeStageRecipe('T5').kSulfate`
and `FIRST_PRINCIPLES_T5_FERTIGATION['MgSO4-7H2O']` equals
`computeStageRecipe('T5').mgSulfate`. `Solubore` is hand-coded (B is
single-channel by REQ-061, not in the `computeStageRecipe` surface).
The same values propagate to `FP_RECIPE_T5.fertigation` in the same
boot pass, so the FP target read by Block 7/8 drift gauges, the Banque
sol view, and the consumer-side cascade is a deterministic function of
the mass-balance derivation — not a hand-locked agronomist anchor.

**Rationale:** Closes the loop opened by REQ-098 — without this pin
the constant could drift from the function (REQ-098 verifier tests the
function, not the constant). Historical PA Taillon anchor preserved in
`learnings.md` for audit.

**Verification:** `scripts/check-recipes.mjs` REQ-154 — exact equality
of K2SO4 / MgSO4-7H2O between constant and `computeStageRecipe('T5')`
output; Solubore numeric-presence only; same triple propagates to
`FP_RECIPE_T5.fertigation`.

**Cert:** 5 (structural — invariant by construction).

---

## REQ-155 — Per-element bed→plant uptake-efficiency factor applied to fertigation sizing

**Statement:** Fertigation sizing accounts for bed → plant uptake
inefficiency at current Décembre soil chemistry (pH 7.28, Ca 10 989 kg/ha)
via a per-element factor `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL[el]` declared
in `nutrition/tomato/fertigation-recipe/data.js`. `computeStageRecipe`
divides plant demand by this factor before subtracting compost release
and sidedress release, so the bed-side target is inflated to deliver
enough that plant uptake equals plant demand after the discount. The
factor applies uniformly to all bed sources (compost, sidedress,
fertigation) — same multiplier on every bed → plant transfer, so it
pulls out cleanly as a division on the demand term alone.

Default factors (cert 2 across the board, refit on tissue correlation):

| Element | Factor | Mechanism                                                       |
|---------|--------|-----------------------------------------------------------------|
| K       | 0.90   | Ca-K cation competition on Ca-saturated CEC (5-15 % lit. range) |
| Mg      | 0.85   | Ca-Mg competition + dripper-bed equilibration (10-25 % range)   |
| B       | 0.80   | Soil B adsorption in Ca-rich beds at pH > 7 (15-25 % range)     |

Function implements K + Mg + B (Solubore) branches at full mass-balance —
uptake factor inflates demand for each. Return shape: `{ kSulfate,
mgSulfate, solubore }` in grams (rounded). REQ-154 boot-pin propagates
all three into `FIRST_PRINCIPLES_T5_FERTIGATION` and `FP_RECIPE_T5.fertigation`.

**Verification:** `scripts/check-recipes.mjs` REQ-098 block applies
`demand / uptake_factor[el]` before subtracting compost + sidedress;
output matches within ±5 g (K/Mg), ±2 g (Solubore). Drops if
`PH_UPTAKE_FACTOR_AT_CURRENT_SOIL` missing/malformed.

**Cert:** 2 per element — literature mid-band, not measured at Décembre.
Refinement trigger in `derivation.md`: petiole correlation within ±20 %
bumps cert 2 → 3; ±10 % → 4. Each element refines independently.

---

## REQ-151 — `computeFertigationSupply(stage, opts, recipe)` delivers per-element supply

**Statement:** `computeFertigationSupply(stage, opts = {}, recipe?)`
returns the per-element fertigation supply in mg/m²/wk delivered to the
total tomato bed area for one week of normal operation.

Contract:

- `stage`: string in `{T1, T2, T3, T4, T5}`. Used **only** to select the
  default recipe when `recipe` is omitted. No stage-dependent factors
  apply otherwise — fertigation delivery at given product mass is
  stage-independent.
- `opts`: reserved for future channel-level levers; default `{}`. No
  required keys today.
- `recipe`: optional recipe override in canonical g-keyed shape:

  ```js
  { kSulfate_g: <g>, mgSulfate_g: <g>, solubore_g: <g> }
  ```

  Each value is **grams of that product over total tomato bed area per
  week** (area = `TOMATO_NUM_BEDS × TOMATO_BED_AREA`). Missing keys
  default to `0`. When `recipe` is omitted the function reshapes
  `STORED_RECIPE.tomato.fertigation[stage]` (which uses `kSulfate` /
  `mgSulfate` keys, no solubore — B is FP-only) into the canonical
  shape internally as a default-source convenience. **Callers preparing
  a recipe from any other source (FP literal, computed sizer) are
  responsible for the reshape into canonical g-keys before calling.**

- Return: full 11-element map `{N, P, K, Ca, Mg, Fe, Mn, Zn, Cu, B, Mo}`
  of mg/m²/wk delivered. Elements outside the fertigation channel
  (everything except K, Mg, B) return `0` numerically. Flat shape
  matches `computeFoliarSupply` precedent; per-element cap and cert
  details (REQ-136) built at caller, not inside the model function.

**Rationale:** Promotes the inline `(g × element_pct × 1000) / area`
delivery formula out of `calcNutrSupply` into the subproject namespace,
extending the no-inline-reimplementation guarantee (REQ-139) to the
fertigation branch. Canonical g-keyed recipe is the SRP boundary: caller
selects the source, model applies one rule. No mode flags, no shape
detection at the model boundary.

**Cert:** 4 — bright-line normative rule; auto-enforcement partial in
the same shape as REQ-139 (registry catches deleted call sites,
blacklist catches new inline drift on the exact formula shape).

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

---

## Retired specs

- **REQ-100** retired 2026-05-10 — concept dropped, fertigation supply
  now reported at full barrel mass (no mixing-factor discount). Number
  not reused. Detail in `learnings.md`.
