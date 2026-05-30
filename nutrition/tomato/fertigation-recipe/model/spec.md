# Tomate — fertigation-recipe

Specs for the model that **derives the first-principles weekly fertigation
dose** (liquid replenishment of K, Mg, and B at the dripper) per tomato
production stage, in grams of product per total tomato area per week.

Mass-balance derivation, T5 refined target rationale, source tables (PA
Taillon April 2026 — applies to the FP target, NOT to STORED), refinement
triggers live in `derivation.md`. PA Taillon K 5167 / Mg 1379 is the FP
agronomist recommendation; the operational `STORED_RECIPE.tomato.fertigation`
has been Haifa-heritage (T5 K 3489) since 2026-05-09 and has never
carried PA Taillon values — only the FP target moved through the
2026-05-12 → 2026-05-15 amendment cycle. STORED is governed by
`/retire-recipe`, not this spec. Calibration history in `learnings.md`.

The model answers two questions:

1. **Sizing** — `computeStageRecipe(stage)` returns grams of K₂SO₄ +
   MgSO₄·7H₂O (and Solubore at T5) per tomato bed-area per week to
   replenish offtake net of sidedress and compost (`mass-balance-derivation`).
2. **Supply** — `computeFertigationSupply(stage, opts, recipe)` returns
   mg/m²/wk of each element delivered to the bed (`per-element-supply`).

Out of scope: `STORED_RECIPE.tomato.fertigation`, barrel-mixing/injection
schedule, `LUXURY_FACTOR` cap on `supply.soil` (consumer-side concern on
the soil channel), per-element cap/cert detail (built at caller per `nutrition — contribution-channel-details-payload`).

Cross-channel: fertigation sits in the chain `compost → sidedress →
fertigation → foliar`. This subproject owns fertigation-only sizing; the
chain bounds live in `nutrition/tomato/spec.md` (`nutrition/tomato — under-fert-guard` / `nutrition/tomato — luxury-feeding-guard`).

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
{ kSulfate: number, mgSulfate: number, solubore: number, naMolybdate: number }
```

All four masses in **grams of product per total tomato area per week**
(area = `TOMATO_NUM_BEDS × TOMATO_BED_AREA = 7 × 54.7 = 382.9 m²`).
`kSulfate` = K₂SO₄, `mgSulfate` = MgSO₄·7H₂O, `solubore` = Solubor
(disodium octaborate tetrahydrate, Na₂B₈O₁₃·4H₂O, 20.5 % B mass),
`naMolybdate` = sodium molybdate (Na₂MoO₄·2H₂O). K + Mg + Solubore are
mass-balance-derived per `mass-balance-derivation` / `uptake-efficiency-factor`. Sodium molybdate is a flat
0.5 g/wk floor across all stages T1-T5 (operator-weighing floor, not
demand-driven) per the `nutrition — replenishment-cascade-earliest-first` Mo carve-out 2026-05-16 — rationale in
`derivation.md` "Mo algorithmic detail".

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

## mass-balance-derivation

For each stage and each element, `computeStageRecipe(stage)` returns
values that match the mass-balance derivation:

```
fertigation_needed = max(0, plant_demand − compost_release − sidedress_release − soil_bank_credit)
```

where `soil_bank_credit` applies **only** to elements `{P, Ca}` and is
zero for all others. Compost release and sidedress release are
*current-week* deliveries from upstream channels, not bank reservoirs.

The function implements the K, Mg, and B (Solubore) branches at full
mass-balance — the macros + B where fertigation is the dominant channel.
Mo (sodium molybdate) is also in the return but **bypasses the mass-balance
formula**: `naMolybdate` is a flat 0.5 g/wk floor pinned by the team's
smallest reliable weighing increment, not derived from `naMolybdate_demand
− compost − sidedress` (peak Mo demand ~0.07 mg/m²/wk lands below any
realistic weighing precision). `nutrition — replenishment-cascade-earliest-first` Mo carve-out 2026-05-16; rationale
in `derivation.md` "Mo algorithmic detail". P and Ca resolve to zero
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

N stays with sidedress (organic-N concentrate,
`nutrition/tomato/sidedress-recipe/model — mass-balance-sizes-product-to-n-gap`); micros stay
with foliar (cuticle uptake bypasses soil lockout); B is the one micro
on fertigation (single-channel, `nutrition — replenishment-cascade-earliest-first`) and is fixed at T5 by refined
target (see derivation).

**Cert:** 3 (mass-balance well-defined; values inherit cert 3 from
plant-needs and sidedress; compost release cert 2-3; effective cert
min = 2-3; formula application cert 4).

---

## public-api-namespace

At runtime, `window.FertigationRecipeTomato` exists and exposes:

| Key                          | Type     |
|------------------------------|----------|
| `FIRST_PRINCIPLES_T5`        | object   |
| `efficiency`                 | object   |
| `computeStageRecipe`         | function |

`efficiency` (per `nutrition — channel-efficiency-capability-map`) is per-element delivery fraction at current
soil pH 7.4 chemistry (channel → bed axis). K/Mg follow the
`soluble-cation` PH_RESPONSE curve; B follows `borate` (non-ionic, flat
at 1.0). Orthogonal bed → plant uptake-inefficiency axis is
`PH_UPTAKE_FACTOR_AT_CURRENT_SOIL` (`uptake-efficiency-factor`).

`public-api-namespace` covers the sizer surface. Supply-side `computeFertigationSupply`
is asserted independently by `per-element-supply`. `FIRST_PRINCIPLES_T5` mirrors the
wired `FP_RECIPE_T5.fertigation` shape: `K2SO4`, `MgSO4-7H2O`, `Solubore`,
`NaMolybdate`. All four are populated by `wireFpFertigation()` at boot
from `computeStageRecipe('T5')` per `fp-target-mirrors-sizer`; `NaMolybdate` is the Mo
carve-out per `nutrition — replenishment-cascade-earliest-first` amendment 2026-05-16, flat-floor not mass-balance.

**Cert:** 5 (structural assertion).

---

## fp-target-mirrors-sizer

**Statement:** At runtime, after `wireFpFertigation()` runs at script load,
`FIRST_PRINCIPLES_T5_FERTIGATION` equals `computeStageRecipe('T5')` by
construction across all four keys:

- `K2SO4` ≡ `computeStageRecipe('T5').kSulfate` (mass-balance per `mass-balance-derivation`)
- `MgSO4-7H2O` ≡ `computeStageRecipe('T5').mgSulfate` (mass-balance per `mass-balance-derivation`)
- `Solubore` ≡ `computeStageRecipe('T5').solubore` (mass-balance per `mass-balance-derivation` / `uptake-efficiency-factor`)
- `NaMolybdate` ≡ `computeStageRecipe('T5').naMolybdate` (flat 0.5 g/wk floor per `nutrition — replenishment-cascade-earliest-first` Mo carve-out)

The same four values propagate to `FP_RECIPE_T5.fertigation` in the same
boot pass, so the FP target read by Block 7/8 drift gauges, the Banque
sol view, and the consumer-side cascade is a deterministic function of
`computeStageRecipe` — not a hand-locked agronomist anchor on any product.

**Rationale:** Closes the loop opened by `mass-balance-derivation` — without this pin
the constants could drift from the function (`mass-balance-derivation` verifier tests the
function, not the constants). Historical PA Taillon FP anchor (K 5 167 /
Mg 1 379 / Solubore 9 from April 2026) preserved in `learnings.md` for
audit; STORED was never on those values (Haifa-heritage since 2026-05-09).

**Verification:** `scripts/check-recipes.mjs` fp-target-mirrors-sizer — exact equality
of K2SO4 / MgSO4-7H2O / Solubore / NaMolybdate between constant and
`computeStageRecipe('T5')` output; same quadruple propagates to
`FP_RECIPE_T5.fertigation`.

**Cert:** 5 (structural — invariant by construction).

---

## uptake-efficiency-factor

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
mgSulfate, solubore }` in grams (rounded). `fp-target-mirrors-sizer` boot-pin propagates
all three into `FIRST_PRINCIPLES_T5_FERTIGATION` and `FP_RECIPE_T5.fertigation`.

**Verification:** `scripts/check-recipes.mjs` mass-balance-derivation block applies
`demand / uptake_factor[el]` before subtracting compost + sidedress;
output matches within ±5 g (K/Mg), ±2 g (Solubore). Drops if
`PH_UPTAKE_FACTOR_AT_CURRENT_SOIL` missing/malformed.

**Cert:** 2 per element — literature mid-band, not measured at Décembre.
Refinement trigger in `derivation.md`: petiole correlation within ±20 %
bumps cert 2 → 3; ±10 % → 4. Each element refines independently.

---

## per-element-supply

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
  details (`nutrition — contribution-channel-details-payload`) built at caller, not inside the model function.

**Rationale:** Promotes the inline `(g × element_pct × 1000) / area`
delivery formula out of `calcNutrSupply` into the subproject namespace,
extending the no-inline-reimplementation guarantee (`subproject-namespace-sole-source`) to the
fertigation branch. Canonical g-keyed recipe is the SRP boundary: caller
selects the source, model applies one rule. No mode flags, no shape
detection at the model boundary.

**Cert:** 4 — bright-line normative rule; auto-enforcement partial in
the same shape as `subproject-namespace-sole-source` (registry catches deleted call sites,
blacklist catches new inline drift on the exact formula shape).

---

## Inherited specs

Fertigation consumes plant-needs, sidedress, and stored-recipe outputs:

- **`nutrition/tomato/plant-needs/model — plant-needs-tomato-namespace`** —
  `PlantNeedsTomato.demandTotal` is the canonical demand source
  (`TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`).
- **`nutrition/tomato/sidedress-recipe/model — mass-balance-sizes-product-to-n-gap` / `public-api-namespace`** —
  sidedress contribution subtracted in the K offtake.

Specs that *consume* the fertigation output:

- **`nutrition/tomato — under-fert-guard` / `nutrition/tomato — luxury-feeding-guard`** (`nutrition/tomato/spec.md`) — supply chain bounds.
  Fertigation K, Mg, B are channels summed against demand. The supply
  sum is **active-channels only**: compost + sidedress + fertigation +
  foliar. The soil-bank K + Mg mass-flow delivery declared in
  `nutrition/soil-contribution — only-ca-p-participate-in-gap-chain` is **not** in the sum by
  architectural choice — bank K + Mg sit outside the sizer as operator-
  side headroom (see `nutrition/soil-contribution/learnings.md` for the
  rejected path-1 subtract-bank-from-sizer alternative).
- **`nutrition/chemistry — every-product-ecocert-allowed`** — every product is Ecocert-allowed.
  K₂SO₄, MgSO₄·7H₂O, and Solubor (disodium octaborate tetrahydrate) are
  all on the certified-input list (CAN/CGSB-32.311 sodium borates).
- **`nutrition — ecocert-only-products`** (`nutrition/spec.md`) — no forbidden products.
- **`nutrition — replenishment-cascade-earliest-first`** (`nutrition/spec.md`) — foliar dose only when earlier channels
  insufficient. Fertigation owns B as the single channel; foliar B = 0.

---

## Retired specs

- Retired 2026-05-10 — concept dropped, fertigation supply
  now reported at full barrel mass (no mixing-factor discount). Number
  not reused. Detail in `learnings.md`.
