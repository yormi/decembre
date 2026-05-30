# Tomate — plant-needs

Specs for the model that estimates the **weekly nutrient uptake of the
tomato plant**, per element, at target yield and crop stage.

Spec only. Formulas, derivations, source tables, cert values per (stage,
element), edge-case notes, caveats, and refinement triggers live in
`derivation.md`.

Question answered: **"how much of element X does the plant need to take
up this week to hit target yield Y at stage S?"**

Out of scope: availability (supply chain); actual uptake (tissue tests);
soil amendment (recipe = supply minus passive sources).

---

## Contract

### Inputs

| Name           | Type   | Range                            |
|----------------|--------|----------------------------------|
| `yieldKgPerM2` | number | 0 ≤ y ≤ ~3                       |
| `stage`        | string | `T1` / `T2` / `T3` / `T4` / `T5` |
| `transpFactor` | number | 0.4 ≤ tf ≤ 1.0 (default `1.0`)   |

### Output

`calcNutrDemand(yieldKgPerM2, stage, transpFactor)` → object keyed by
element, each entry shaped `{ fruit, biomass, total }` in mg/m²/wk.

Element coverage fixed at the 11 elements in `TOMATO_FRUIT_EXPORT`
(N, P, K, Ca, Mg, Fe, Mn, Zn, B, Cu, Mo).

---

## Cert scale — single transferability cert

Every cert value in the plant-needs subproject is a **transferability
cert** (0-5). The scale expresses *how much you should trust this number
for use at Décembre*, not the underlying study quality alone.

| Cert | Meaning |
|------|---------|
| 5    | Measured at Décembre on Décembre's plants |
| 4    | Measured in same context (organic soil greenhouse, similar latitude / cultivar) |
| 3    | Adjacent context, ≤ 1 major translation |
| 2    | Adapted from non-comparable context (Mediterranean hydroponic → QC organic) |
| 1    | Default placeholder / data gap |
| 0    | Pure guess |

Effective cert when two values combine = `min(cert_a, cert_b)`. Source
quality is implicit — a value can't have transfer cert > source cert.

---

## INV-1 — Element coverage is closed

For every stage, `keys(BIOMASS_DEMAND[stage]) ⊆ keys(TOMATO_FRUIT_EXPORT)`
and `keys(TOMATO_DEMAND_CERT[stage]) ⊆ keys(TOMATO_FRUIT_EXPORT)`.

---

## ca-mg-biomass-transpiration-coupled

For elements `Ca` and `Mg`, the biomass term is multiplied by
`transpFactor`. N, P, K, and micros are not. Fruit-export term is never
scaled.

**Cert:** 4 (physiological grounding in xylem-only Ca behaviour).

---

## stage-transition-continuity

For every adjacent stage pair `(Tn, Tn+1)` and every element in
`BIOMASS_DEMAND`, `|demand[Tn+1] − demand[Tn]| / demand[Tn] ≤ 2.5`.

**Cert:** 4 (bound calibrated to current data, not published threshold).

---

## plant-needs-tomato-namespace

At runtime, `window.PlantNeedsTomato` exists and exposes:

| Key                       | Type     |
|---------------------------|----------|
| `TOMATO_FRUIT_EXPORT`     | object   |
| `BIOMASS_DEMAND`          | object   |
| `TOMATO_DEMAND_CERT`      | object   |
| `TOMATO_REMOVAL`          | object   |
| `TRANSP_COUPLED_BIOMASS`  | object   |
| `calcNutrDemand`          | function |
| `certFor`                 | function |

**Cert:** 5 (structural assertion).

---

## Pending — tissue-test back-test invariant

When tissue test results land (regardless of sample / report date), back-test
against 2025-2026 actual fertigation + compost mineralization + measured
yield: predicted demand (annual) − measured uptake within ±25 % per macro
and ±50 % per micro. Will replace the v1 "split-sum reconciles" identity.

---

## Inherited specs

- **REQ-033** (`nutrition/tomato/spec.md`) — `TOMATO_REMOVAL` macros sit
  at or above the inter-source mean of {Yara, Sonneveld, Koller}.
  Anchors Term 1 and the T5 derivation of Term 2.

Specs that *consume* demand output:

- **REQ-013** (`nutrition/tomato/spec.md`) — supply ≥ 0.9 × demand
- **REQ-014** (`nutrition/tomato/spec.md`) — supply ≤ 1.3 × demand
- **REQ-011** (`nutrition/tomato/spec.md`) — `CHANNEL_ROLE` covers every
  element in `BIOMASS_DEMAND`
