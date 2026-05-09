# Tomate — plant-needs · derivation

How the model is built. The **spec** (what it must do or be) is in
`spec.md`. This file is everything else: formulas, source tables, per-
element rationale, current cert values, edge-case behaviour, caveats,
refinement triggers. When a number changes, this is where the *why* lives.

---

## Formula

```
demand[el] = TOMATO_FRUIT_EXPORT[el] × yieldKgPerM2 × 1 000  +  BIOMASS_DEMAND[stage][el]
              ├──────────── fruit-export term ────────────┤    ├──── biomass term ────┤
                  scales linearly with target yield             stage-driven, fixed/wk
```

Implemented in `nutrition/tomato/plant-needs/calc.js`:

```js
const TRANSP_COUPLED_BIOMASS = { Ca: true, Mg: true };  // REQ-081

function calcNutrDemand(yieldKgPerM2, stage, transpFactor = 1.0) {
  const out = {};
  const bio = BIOMASS_DEMAND[stage] || {};
  Object.keys(TOMATO_FRUIT_EXPORT).forEach(el => {
    const fe         = TOMATO_FRUIT_EXPORT[el];
    const fruit_mg   = yieldKgPerM2 * fe.g * 1000;
    let biomass_mg   = bio[el] || 0;
    if (TRANSP_COUPLED_BIOMASS[el]) biomass_mg *= transpFactor;
    out[el] = { fruit: fruit_mg, biomass: biomass_mg, total: fruit_mg + biomass_mg };
  });
  return out;
}
```

The two terms are **non-overlapping by construction** (split applied
2026-05-04). The Bilan modal always shows them separately so the operator
sees what leaves the farm in fruit vs. what stays in canopy and new
structures.

---

## Term 1 — Fruit export (`TOMATO_FRUIT_EXPORT`)

Nutrients that **physically leave the farm** in harvested fruit. Derived
from whole-plant uptake (`TOMATO_REMOVAL`) × Yara fruit-vs-canopy split:

| Element | TOMATO_REMOVAL g/kg | Fruit fraction | TOMATO_FRUIT_EXPORT g/kg | Cert |
|---------|---------------------|----------------|--------------------------|------|
| N       | 2.7                 | 60 %           | 1.62                     | 2    |
| P       | 0.44                | 60 %           | 0.264                    | 2    |
| K       | 4.0                 | 60 %           | 2.40                     | 2    |
| Ca      | 1.5                 | 5 %            | 0.075                    | 2    |
| Mg      | 0.57                | 25 %           | 0.143                    | 2    |
| Fe / Mn / Zn / B / Cu / Mo | (mg/kg, see code) | 60 % default | (data gap) | 1 |

Why the splits differ:

- **N / P / K** are phloem-mobile. Significant fraction redistributes from
  canopy to fruit during fill (Yara: 60 % to fruit at production).
- **Ca** is **xylem-mobile only**. Once deposited in a leaf via
  transpiration it does not move to fruit. ~95 % stays in canopy. (This
  is also why BER is a *transpiration* problem, not a soil-Ca problem —
  Décembre's Ca-saturated soil has zero bearing on whether fruit gets
  enough Ca.)
- **Mg** is partially phloem-mobile; ~75 % stays in canopy, ~25 % to fruit.
- **Micros** use a 60 % default in the absence of per-element Yara figures
  — explicit data gap, refine when tissue tests separate fruit and leaf.

### Unit convention quirk

Both macros and micros use the field name `g` on `TOMATO_FRUIT_EXPORT[el]`,
but the *unit* is `g/kg fruit` for macros and `mg/kg fruit` for micros (the
`unit` field on each entry documents which). The `× 1000` in the formula
converts both to mg/m²/wk uniformly because:

- macro `g/kg × kg/m² × 1000 = mg/m²`
- micro `mg/kg × kg/m² × 1` should be mg/m², so the same `× 1000` drives
  the value to the right magnitude only because the underlying micro
  numbers are stored in `g`-equivalent (e.g. Fe `g: 0.010` is 10 mg/kg
  expressed as 0.010 g/kg).

This is brittle. Refining to a single explicit unit per element is a
candidate cleanup; for now the inline comments (`unit: 'g'` / `unit: 'mg'`)
mark the contract.

---

## Term 2 — Biomass build-out (`BIOMASS_DEMAND[stage]`)

Ongoing nutrient uptake for **new canopy and structures** that don't leave
the farm — leaves, stems, roots, trusses still on the plant. Stage-driven,
in mg/m²/wk:

| Stage | Weeks post-transplant | Phenology              | Cert anchor                                          |
|-------|-----------------------|------------------------|------------------------------------------------------|
| T1    | 1-4                   | Établissement          | Haifa days 1-20, QC winter ~20 % discount (cert 2)   |
| T2    | 5-8                   | Croissance végétative  | Haifa days 21-40 (cert 2)                            |
| T3    | 9-11                  | Floraison              | Haifa days 41-60 — P + K + Mg spike (cert 2)         |
| T4    | Production montante   | Canopy still expanding | T5 × 0.85 (cert 1 — extrapolation of cert-2)         |
| T5    | Pleine production     | Canopy maintenance     | TOMATO_REMOVAL × 1500 − fruit_export × 1500 (cert 2) |

T1-T3 values are **bottom-up** from the Haifa F-144 commercial program
(transparent kg/ha/day per stage table preserved in the BIOMASS_DEMAND
comment block in code), discounted ~20 % at T1 for Quebec winter light.

T5 values are **top-down**: anchored to the whole-plant `TOMATO_REMOVAL`
ratio at the 1.5 kg/m²/wk target yield, minus what fruit export already
accounts for. By construction this gives an exact split-sum reconciliation
at target yield (this is a *definition*, not an invariant — see spec INV
section for context).

T4 = T5 × 0.85 (cert 1 — midpoint extrapolation; refine when stage-
stratified weekly tissue tests come in).

### Sources

Source-quality is high (peer-reviewed literature, vendor agronomic
publications), but transferability cert is capped at 2 because every
source context is Mediterranean and / or hydroponic.

| Source | Used for | Source quality | Transferability cert |
|--------|----------|----------------|----------------------|
| Haifa F-144 "Daniela" greenhouse program | T1-T3 N/P/K kg/ha/day per stage | High | 2 |
| Sonneveld & Voogt 2009 *Plant Nutrition of Greenhouse Crops* | Ca/Mg ratios, validation | High | 2 |
| ISHS 893_112 (hydroponic tomato vegetative uptake) | Confirms Haifa ramp shape | High | 2 |
| MDPI Agriculture 11(4):292 (phenological-stage uptake by EC) | Order P<Mg<Ca<K<N during vegetative | Moderate | 2 |
| Yara crop nutrition (qualitative) | Mg flowering peak, Ca canopy retention | High | 2 |

### Conversion used (Haifa → mg/m²/wk)

`1 kg/ha = 0.1 g/m² = 100 mg/m²`. Multiply by 7 days → 700 mg/m²/wk per
1 kg/ha/day. So Haifa "1.0 kg N/ha/day at days 1-10" → 700 mg N/m²/wk
for T1.

---

## Per-stage cert (`TOMATO_DEMAND_CERT`)

Total demand cert per (stage, element) = `min(TOMATO_FRUIT_EXPORT cert,
BIOMASS_DEMAND[stage] cert)` on the merged transferability scale:

| Stage | N | P | K | Ca | Mg | Fe / Mn / Zn / B / Cu / Mo |
|-------|---|---|---|----|----|----------------------------|
| T1    | 2 | 2 | 2 | 2  | 2  | 1                          |
| T2    | 2 | 2 | 2 | 2  | 2  | 1                          |
| T3    | 2 | 2 | 2 | 2  | 2  | 1                          |
| T4    | 1 | 1 | 1 | 1  | 1  | 1                          |
| T5    | 2 | 2 | 2 | 2  | 2  | 1                          |

Macros are cert 2 across T1-T3 and T5 because every value transitively
inherits from Mediterranean-hydroponic sources (Yara / Sonneveld / Haifa).
T4 macros are cert 1 because they're a `T5 × 0.85` extrapolation —
extrapolating a cert-2 value gives cert 1 honestly. Micros stay cert 1
across all stages because the underlying `TOMATO_REMOVAL` micros are
themselves estimates and the 60 % fruit-share is a default, not a
per-element Yara figure.

The Bilan modal surfaces this cert per (stage, element) on row click via
`PN.certFor(stage, el)`.

---

## Edge cases (current behaviour)

- **Invalid stage** (`undefined`, `'T0'`, `'T6'`): `BIOMASS_DEMAND[stage]`
  returns `undefined`, the inner `bio = … || {}` falls back to an empty
  object, and demand collapses to fruit-export only. Acceptable today (T6
  was retired 2026-05-07); silent fallback is undesirable longer-term —
  consider throwing or returning a sentinel.
- **Negative yield** (`yieldKgPerM2 < 0`): not validated. The fruit term
  goes negative; depending on biomass term, total may go negative.
  Validate at the Bilan input layer (the input has `min="0"` already).
- **Zero yield at T5**: legitimate — biomass term still applies (canopy
  is still being maintained even if fruit isn't being harvested this
  week). The split sum equals `BIOMASS_DEMAND[T5]` exactly.

---

## Caveats and known limitations

- **Transpiration coupling — Ca and Mg only (REQ-081, applied 2026-05-09).**
  Ca and Mg biomass terms are multiplied by `transpFactor` (`current ÷
  target` yield ratio, floor 0.4) because both elements are partly or
  wholly xylem-mobile and their uptake **is** mass-flow. N, P, K, and
  the micros keep the un-scaled biomass term — phloem redistribution and
  active-transport kinetics decouple them from instantaneous transpiration.
  This was the single biggest design bug in the v1 demand model.

- **No N storage carry-over.** The model is per-week with no cross-week N
  pool. Compost residual + sidedress mineralization smooths weekly variance
  in practice. If retained N becomes a meaningful driver, the model would
  need a soil-N inventory state — deferred until tissue-test or yield
  data flags it.

- **Fruit export uses target yield, not measured yield.** Intentional —
  the Bilan answers *"what would the plant need to hit target?"*, not
  "what did it actually consume last week." For retrospective analysis,
  run with measured yield as input.

- **Light ceiling decoupled.** The Bilan separately surfaces a light-
  limited yield ceiling (≈ `weekly_J_cm² ÷ 7000` kg/m²/wk). When
  `y_target > ceiling`, the demand value reflects a yield the light
  cannot actually produce that week. Header card flags it; the demand
  math itself does not cap because the operator should still see "if the
  sun showed up, this is what would be needed."

- **Bottom-up T1-T3 vs. top-down T4-T5 shape mismatch.** The two
  derivations use different methodologies and could drift if Haifa is
  updated without re-checking the T5 anchor (or vice versa). Spot-check
  at boundary transitions when retuning either table.

---

## Refinement triggers

Update the model when:

- **Tissue test results land.** Petiole NO₃-N + Mg + Cu/Mn/Zn panel
  ordered 2026-05-05; results expected ~2026-05-12. If measured tissue
  concentrations diverge >25 % from the cert-3+ assumed values, refine
  `TOMATO_REMOVAL` and re-derive T5 (which propagates to T4).
- **Yield ceiling shifts.** If sustained yield exceeds 1.5 kg/m²/wk for
  >3 weeks, T5 numbers may underestimate. Re-derive at the new target
  yield and document what changed.
- **Stage-stratified data appear.** If T4 gets independent measurement
  (not T5 × 0.85), it can graduate to its own cert anchor.
- **Per-element micro splits arrive.** The 60 % fruit-share default for
  Fe, Mn, Zn, B, Cu, Mo is a placeholder. Replace as soon as Yara or
  peer-reviewed data lands.

---

## Implementation map

All plant-needs internals live in this subproject:

| File                                          | Owns                                                      |
|-----------------------------------------------|-----------------------------------------------------------|
| `nutrition/tomato/plant-needs/data.js`        | `TOMATO_REMOVAL`, `TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`, `TOMATO_DEMAND_CERT` |
| `nutrition/tomato/plant-needs/calc.js`        | `TRANSP_COUPLED_BIOMASS`, `calcNutrDemand`                |
| `nutrition/tomato/plant-needs/model.js`       | `window.PlantNeedsTomato` namespace wrapper               |
| `nutrition/tomato/plant-needs/spec.md`        | Spec — what the model must do or be                       |
| `nutrition/tomato/plant-needs/derivation.md`  | This file                                                 |

`app/index.html` includes them in dependency order: `data.js` (early,
alongside other domain constants) → `calc.js` (after the supply model
defs that share scope) → `model.js` (immediately after, exposing the
public API). Consumers (`nutrition/tomato/app/logic.js`, future recipe
calculators) come later in the build and reach for `window.PlantNeedsTomato`.
