# Salanova — plant-needs

Specs for the model that estimates the **weekly nutrient uptake of the
Salanova lettuce plant** post-transplant, per element, and the weekly
**supply** decomposed into soil mass-flow + fertigation + front-load.

Spec only. Formulas, derivations, source tables, per-element cert,
edge-case notes and refinement triggers live in `derivation.md`.
Rejected alternatives (stage-based modelling, prior recipe-anchored
demand, etc.) live in `learnings.md`.

Question answered: **"how much of element X does the post-transplant
Salanova head need to take up this week, given current/target head mass,
density, and cycle length — and how much is supplied passively vs.
through fertigation?"**

Out of scope: nursery seedling stage (covered by `nutrition/nursery/`);
actual uptake (tissue tests); soil amendment recipe sizing.

---

## Contract

### Inputs — demand

| Name           | Type   | Range                          |
|----------------|--------|--------------------------------|
| `transplantG`  | number | 5 ≤ t ≤ 80 (typical 30 g)      |
| `targetG`      | number | t < target ≤ ~250 (typ. 100 g) |
| `cycleDays`    | number | 7 ≤ d ≤ 35 (typical 14)        |
| `density`      | number | 20 ≤ d ≤ 60 plants/m² (typ. 43)|

### Output — demand

`calculateLettuceNutritionDemand(transplantG, targetG, cycleDays, density)`
→ object keyed by element, each entry a number in mg/m²/wk.

### Inputs — supply

| Name                    | Type    | Notes                                          |
|-------------------------|---------|------------------------------------------------|
| `currentG`              | number  | Current head mass; drives canopy factor        |
| `targetG`               | number  | Same as demand input                           |
| `density`               | number  | plants/m²                                      |
| `phLocked`              | boolean | True when soil pH ≥ 7 (lockout gate)           |
| `frontload_g_per_m2`    | number  | Farine de plumes application rate              |
| `dependencies`          | object  | Pure-function dependency bag (see below)       |

`dependencies` carries the five external inputs needed to keep the
function pure: `weeklyMassFlowL` (L/m²/wk), `smeLettucePpm` (per-element
soil ppm), `lettuceRecipe` (`{kSulfate, mgSulfate, feSulfate}` g/100m²/wk),
`productPct` (PRODUCT_PCT map with K2SO4_K / MgSO4_Mg / FeSO4_Fe /
FarinePlumes_N), `featherMealMineralizationEfficiency` (number, 0-1),
`frontloadDefaults` (`LETTUCE_FRONTLOAD_DEFAULTS` shape).

### Output — supply

`calculateLettuceNutritionSupply(...)` → `{ soil, fert, frontload, total,
canopyFactor }`. Each per-channel object is keyed by element in mg/m²/wk;
`total` is the per-element sum; `canopyFactor` is the [0.2, 0.7] scalar
applied to soil mass-flow.

Element coverage fixed at the 11 elements in `LETTUCE_TISSUE_DW`
(N, P, K, Ca, Mg, Fe, Mn, Zn, B, Cu, Mo).

---

## Cert scale — single transferability cert

Every cert value in the plant-needs subproject is a **transferability
cert** (0-5). Same shape as the tomato subproject (see
`nutrition/tomato/plant-needs/spec.md` → "Cert scale").

| Cert | Meaning |
|------|---------|
| 5    | Measured at Décembre on Décembre's plants |
| 4    | Measured in same context (organic soil greenhouse, similar latitude / cultivar) |
| 3    | Adjacent context, ≤ 1 major translation |
| 2    | Adapted from non-comparable context |
| 1    | Default placeholder / data gap |
| 0    | Pure guess |

Effective cert when two values combine = `min(cert_a, cert_b)`.

---

## INV-1 — Element coverage is closed

For every element in `LETTUCE_TISSUE_DW`, the demand output and every
supply channel (`soil`, `fert`, `frontload`, `total`) carry a numeric
entry (zero is acceptable; `undefined` is not).

---

## public-api-namespace

At runtime, `window.PlantNeedsLettuce` exists and exposes:

| Key                                  | Type     |
|--------------------------------------|----------|
| `LETTUCE_DM_FRACTION`                | number   |
| `LETTUCE_TISSUE_DW`                  | object   |
| `LETTUCE_FRONTLOAD_DEFAULTS`         | object   |
| `SME_LETTUCE_PPM`                    | object   |
| `calculateLettuceNutritionDemand`    | function |
| `calculateLettuceNutritionSupply`    | function |

**Cert:** 5 (structural assertion).

---

## demand-scales-with-mass-and-cycle

For every element in `LETTUCE_TISSUE_DW`, doubling `(targetG − transplantG)`
or `density` doubles the per-element demand; doubling `cycleDays` halves it
(±0.1 %). The biomass-gain term is the only stage-like driver — lettuce has
no flowering/fruit transition so no stage axis is exposed.

**Cert:** 4 (physiological grounding — Salanova post-transplant is monotonic
mass accumulation; tissue concentration is held constant on DW basis per
Hochmuth + Sonneveld leafy-greens norms).

---

## supply-composition-soil-fert-frontload

For every element in `LETTUCE_TISSUE_DW`, `total[element] = soil[element]
+ fert[element] + frontload[element]` (exactly, no rounding). Soil mass-flow
is gated by `phLocked` for P/Mn/Zn (REQ-020 lockout cap) and Fe (× 0.15
root-reductase suppression). Fert is sourced from `lettuceRecipe`
(K₂SO₄ + MgSO₄·7H₂O + FeSO₄·7H₂O per 100 m²/wk; Fe also × 0.15 if phLocked).
Front-load delivers N only via feather meal × mineralization efficiency
÷ mineralization window.

**Cert:** 3 (canopy factor and lockout discounts are calibrated, not
peer-reviewed; refinement triggers in derivation.md).

---

## demand-certainty-floor

Per-element demand inherits cert from `LETTUCE_TISSUE_DW`. Macros (N, P, K,
Ca, Mg): cert 4. Micros (Fe, Mn, Zn, B, Cu, Mo): cert 3. Surfaced per element
on click via the `lettuce-demand.<element>` pourquoi entries built by the
integrator (`nutrition/lettuce/app/logic.js` once carved out).

**Cert:** 4 (macros) / 3 (micros) — see derivation.md cert table.

---

## canopy-factor-bounded

For every supply call, `canopyFactor = clamp(currentG / targetG × 0.7, 0.2, 0.7)`.
Bounded so stunted plants (very small `currentG`) keep a minimum mass-flow
floor and fully-mature plants don't over-pull soil solution beyond
transpiration-realistic ceilings.

**Cert:** 3 (bounds calibrated to current Salanova climate, not published
threshold).

---

## Pending — tissue-test back-test invariant

When Salanova tissue test data lands, back-test predicted demand vs measured
uptake at end-of-cycle: within ±25 % per macro and ±50 % per micro across
3+ harvest weeks. Will replace the current cert-3 placeholder for the
supply lockout discounts.

---

## Inherited specs

- **REQ-020** (`nutrition/spec.md`) — pH-locked soil-solution cap for P/Mn/Zn
  when `phLocked = true`.
- **REQ-157** (`nutrition/spec.md`) — channel efficiency map exposed alongside
  supply. Front-load `efficiency.N` set when N > 0 (`supply-composition-soil-fert-frontload` supply output).

Specs that *consume* demand/supply output:

- `nutrition/lettuce/app/user-stories.md` — Salanova subpage block layout, gap-chain
  cascade (demand → compost → front-load → fertigation → leviers).
