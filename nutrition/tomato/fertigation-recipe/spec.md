# Tomate — fertigation-recipe

Specs for the model that **derives the first-principles weekly fertigation
dose** (liquid replenishment of K, Mg, and B at the dripper) per tomato
production stage, in grams of product per total tomato area per week.

This file is the *spec* (what the model must do or be). Mass-balance
derivation, T5 refined target rationale, source tables (PA Taillon
April 2026), refinement triggers
live in `derivation.md` next door. Operational *stored* values that the
team currently weighs out (`STORED_RECIPE.tomato.fertigation`, hand-locked
at PA Taillon's April 2026 recommendation) are governed by the
`/retire-recipe` audit-trail skill, not by this spec.

The model answers two questions:

1. **Sizing** — "how many grams of K₂SO₄ + MgSO₄·7H₂O (and Solubore B at
   T5) per tomato bed-area per week does the plant need at stage S to
   replenish offtake from the soil bank, given sidedress and compost
   mineralization?" Answered by `computeStageRecipe(stage)` —
   computed dose must match the mass-balance formula (REQ-098).
2. **Supply** — "given a fertigation recipe (in grams of product per
   total tomato area per week), how many mg/m²/wk of each element does
   the channel deliver to the bed?" Answered by
   `computeFertigationSupply(stage, opts, recipe)` — fertigation
   delivery must equal recipe mass × element fraction ÷ area (REQ-151).

It does NOT answer:
- What the team currently weighs out (that's
  `STORED_RECIPE.tomato.fertigation`).
- The barrel-mixing or injection schedule (operations, not modeling).
- LUXURY_FACTOR cap on supply.soil — that's a supply-side concern on
  the *soil* channel, remains with `calcNutrSupply`. Listed in inherited
  specs only as a consumer-side reference.
- Per-element cap / cert detail (REQ-136 `details` sibling) — built at
  the caller from the flat supply map + current pH state. Matches the
  foliar precedent.

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

---

## REQ-098 — Mass-balance derivation matches the formula

For each stage, `computeStageRecipe(stage)` returns values that match the
mass-balance derivation. Sidedress IS subtracted from K (Mg sidedress is
zero by product chemistry). **Compost release is NOT subtracted** —
fertigation replenishes offtake directly; compost contribution is
accounted for separately as a soil-bank input (see CompostContribution
domain), not as a fertigation-channel offset.

```
k_offtake_mg/m²/wk   = TOMATO_FRUIT_EXPORT.K × stageYield × 1000 + BIOMASS_DEMAND[stage].K
k_sidedress_mg/m²/wk = STORED_RECIPE.tomato.sidedress[stage].actisol_g
                        × PRODUCT_PCT.Actisol_K × SIDEDRESS_MIN_EFF.K × 1000
                        / SIDEDRESS_AREA_PER_PLANCHE
k_needed_mg/m²/wk    = max(0, k_offtake − k_sidedress)
kSulfate_g_total     = round(k_needed / 1000 / PRODUCT_PCT.K2SO4_K × total_area)

mg_offtake_mg/m²/wk  = TOMATO_FRUIT_EXPORT.Mg × stageYield × 1000 + BIOMASS_DEMAND[stage].Mg
mg_needed_mg/m²/wk   = max(0, mg_offtake)   // sidedress + compost both excluded
mgSulfate_g_total    = round(mg_needed / 1000 / PRODUCT_PCT.MgSO4_Mg × total_area)
```

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

**Cert:** 3 (mass-balance is well-defined; values inherit cert 3 from
plant-needs and cert 3 from sidedress mineralization; effective cert
min = 3; formula application itself is structural, cert 4).

---

## REQ-099 — Public API namespace `window.FertigationRecipeTomato`

At runtime, `window.FertigationRecipeTomato` exists and exposes:

| Key                          | Type     |
|------------------------------|----------|
| `FIRST_PRINCIPLES_T5`        | object   |
| `computeStageRecipe`         | function |

(REQ-099 covers the sizer surface. The supply-side function
`computeFertigationSupply` is asserted independently by REQ-151.)

**Rationale:** Same as `PlantNeedsTomato` (REQ-083),
`CompostContribution` (REQ-080), `SidedressRecipeTomato` (REQ-088).
Consumers (`calcNutrSupply`, `renderProposedRecipe`,
`renderPhase1Comparison`, future per-stage drift gauges) read fertigation
through this namespace so internals can be reshaped without breaking call
sites. `FIRST_PRINCIPLES_T5` mirrors the wired
`FP_RECIPE_T5.fertigation` shape (`K2SO4`, `MgSO4-7H2O`, `Solubore`).

**Cert:** 5 (structural assertion).

---

## REQ-151 — `computeFertigationSupply(stage, opts, recipe)` delivers per-element supply

**Statement:** `computeFertigationSupply(stage, opts = {}, recipe?)`
returns the per-element fertigation supply in mg/m²/wk delivered to the
total tomato bed area for one week of normal operation.

Contract:

- `stage`: string in `{T1, T2, T3, T4, T5}`. Used **only** to select the
  default recipe when `recipe` is omitted. No stage-dependent factors are
  applied otherwise — fertigation delivery at given product mass is
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
  details on every contribution channel (REQ-136) are built at the
  caller, not inside the model function.

**Rationale:** Closes the TODO under "app must call subproject
namespace, no inline reimplementation" (REQ-139). Fertigation is the
third channel in the replenishment chain (compost → sidedress →
fertigation → foliar) but its subproject only exposed the *sizer*
(`computeStageRecipe`). The consumer (`calcNutrSupply` in
`app/index.html`) currently inlines the delivery formula
`(g × element_pct × 1000) / area` for K, Mg, B — the same class of
inline drift the no-inline-reimplementation rule (REQ-139) was
written to prevent on the foliar branch. Promoting the delivery formula to the subproject
namespace lets the verifier blacklist extend to catch future drift on
the fertigation formula shape and lets the registry-driven positive
check assert at least one call site exists.

The canonical g-keyed recipe shape is the SRP boundary: the caller
selects the source (stored, FP literal, computed sizer) and reshapes
into the canonical input before calling. The model function applies one
rule — delivery math — on the pre-normalized input. No mode flags, no
shape detection.

**Cert:** 4 — bright-line normative rule; auto-enforcement is partial
in the same shape as REQ-139 (registry catches deleted call sites,
blacklist catches new inline drift on the exact formula shape; can't
enumerate every future inline reimplementation a priori).

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

---

## Retired specs

- **REQ-100** retired 2026-05-10 — concept dropped, fertigation supply
  now reported at full barrel mass (no mixing-factor discount). The 0.5
  stored-mode multiplier was a cert 2-3 guess and the double-count
  framing was artificial; SME is reported as a separate channel. Number
  not reused.
