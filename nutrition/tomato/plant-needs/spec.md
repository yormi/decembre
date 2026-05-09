# Tomate — plant-needs

Specs for the model that estimates the **weekly nutrient uptake of the
tomato plant**, per element, at a given target yield and crop stage.

This file is the *spec* (what the model must do or be). Formulas,
derivations, source tables, cert values per (stage, element), edge-case
notes, caveats, and refinement triggers live in `derivation.md` next door.

The model answers exactly one question: **"how much of element X does the
plant need to take up this week to hit target yield Y at stage S?"**

It does NOT answer:
- How much is *available* to the plant (that's the supply chain).
- How much was *actually* taken up last week (that's tissue tests).
- How much should be *added to the soil* (that's the recipe — supply minus
  passive sources).

---

## Contract

### Inputs

| Name           | Type   | Range                            |
|----------------|--------|----------------------------------|
| `yieldKgPerM2` | number | 0 ≤ y ≤ ~3                       |
| `stage`        | string | `T1` / `T2` / `T3` / `T4` / `T5` |
| `transpFactor` | number | 0.4 ≤ tf ≤ 1.0 (default `1.0`)   |

### Output

`calcNutrDemand(yieldKgPerM2, stage, transpFactor)` returns an object keyed
by element, each entry shaped `{ fruit, biomass, total }` in mg/m²/wk.

Element coverage is fixed at the 11 elements present in
`TOMATO_FRUIT_EXPORT` (currently N, P, K, Ca, Mg, Fe, Mn, Zn, B, Cu, Mo).

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
and `keys(TOMATO_DEMAND_CERT[stage]) ⊆ keys(TOMATO_FRUIT_EXPORT)`. Adding
an element requires updating all three tables in lockstep.

**Verification:** `scripts/check-recipes.mjs` — symmetric difference of
keys must be empty.

---

## REQ-081 — Ca and Mg biomass demand coupled to transpiration

For elements `Ca` and `Mg`, the biomass term is multiplied by
`transpFactor`. N, P, K, and the micros are not. Fruit-export term is
never scaled.

**Rationale:** Ca is xylem-mobile only; its uptake *is* mass-flow ×
solution concentration. Mg is partially xylem-mobile. Phloem-mobile macros
and active-transport micros decouple from instantaneous transpiration over
weekly windows.

**Verification:** `scripts/check-recipes.mjs` REQ-081 — `calcNutrDemand`
called at tf=1.0 vs tf=0.5 must halve Ca/Mg `biomass` term within ±1 %
and leave N/P/K/micros unchanged.

**Cert:** 4 (physiological grounding in xylem-only Ca behaviour).

---

## REQ-082 — Stage-transition continuity

For every adjacent stage pair `(Tn, Tn+1)` and every element in
`BIOMASS_DEMAND`, `|demand[Tn+1] − demand[Tn]| / demand[Tn] ≤ 2.5`.

**Rationale:** Catches order-of-magnitude hand-edit errors (typo, unit
slip) while allowing legitimate phenological spikes (P at flowering, Fe
drop at production montante).

**Verification:** `scripts/check-recipes.mjs` REQ-082 — bound asserted
on every pair × every element.

**Cert:** 4 (bound calibrated to current data, not a published threshold).

---

## REQ-083 — Public API namespace `window.PlantNeedsTomato`

At runtime, `window.PlantNeedsTomato` exists and exposes:

| Key                       | Type     |
|---------------------------|----------|
| `TOMATO_FRUIT_EXPORT`     | object   |
| `BIOMASS_DEMAND`          | object   |
| `TOMATO_DEMAND_CERT`      | object   |
| `TOMATO_REMOVAL`          | object   |
| `TRANSP_COUPLED_BIOMASS`  | object   |
| `calcNutrDemand`          | function |
| `demandTotal`             | function |
| `certFor`                 | function |

**Rationale:** Consumers (Bilan UI, recipe calculators, future ports to
lettuce / nursery) read demand from this namespace. Renaming any internal
fails at check time, not at runtime.

**Verification:** `scripts/check-recipes.mjs` REQ-083 — namespace presence
+ key set + shape of `demandTotal` and `certFor` return values.

**Cert:** 5 (structural assertion).

---

## Pending — tissue-test back-test invariant

When tissue test data lands (~2026-05-12) and a back-test runs against
2025-2026 actual fertigation + compost mineralization + measured yield:

> Predicted demand (annual) − measured uptake (estimated from tissue-test
> concentration × estimated dry biomass at crop-out) shall fall within
> ±25 % per macro and ±50 % per micro.

Will replace the v1 "split-sum reconciles" identity with an actual check
against external data.

---

## Inherited specs

- **REQ-033** (`nutrition/tomato/spec.md`) — `TOMATO_REMOVAL` macros must
  sit at or above the inter-source mean of {Yara, Sonneveld, Koller}.
  Anchors Term 1 and the T5 derivation of Term 2.

Specs that *consume* the demand output:

- **REQ-013** (`nutrition/tomato/spec.md`) — supply ≥ 0.9 × demand
- **REQ-014** (`nutrition/tomato/spec.md`) — supply ≤ 1.3 × demand
- **REQ-011** (`nutrition/tomato/spec.md`) — `CHANNEL_ROLE` covers every
  element in `BIOMASS_DEMAND`
