# Tomate — plant-needs · derivation

Why each number is what it is. Spec lives in `spec.md`. Rejected
alternatives and deferred refinements live in `learnings.md`.

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

Two terms are non-overlapping by construction (split applied 2026-05-04).
Bilan modal shows them separately.

---

## Term 1 — Fruit export (`TOMATO_FRUIT_EXPORT`)

Nutrients that physically leave the farm in harvested fruit. Derived from
whole-plant uptake (`TOMATO_REMOVAL`) × Yara fruit-vs-canopy split:

| Element | TOMATO_REMOVAL g/kg | Fruit fraction | TOMATO_FRUIT_EXPORT g/kg | Cert |
|---------|---------------------|----------------|--------------------------|------|
| N       | 2.7                 | 60 %           | 1.62                     | 2    |
| P       | 0.44                | 60 %           | 0.264                    | 2    |
| K       | 4.0                 | 60 %           | 2.40                     | 2    |
| Ca      | 1.5                 | 5 %            | 0.075                    | 2    |
| Mg      | 0.57                | 25 %           | 0.143                    | 2    |
| Fe / Mn / Zn / B / Cu / Mo | (mg/kg, see code) | 60 % default | (data gap) | 1 |

Splits (Yara):

- **N / P / K** phloem-mobile, 60 % redistributes to fruit at production.
- **Ca** xylem-mobile only, ~95 % stays in canopy. (BER is a transpiration
  problem, not a soil-Ca problem — Décembre's Ca-saturated soil has no
  bearing on fruit Ca.)
- **Mg** partially phloem-mobile, ~25 % to fruit.
- **Micros** 60 % default — explicit data gap.

### Unit convention quirk

`TOMATO_FRUIT_EXPORT[el].g` is `g/kg fruit` for macros, `mg/kg fruit` for
micros; the `unit` field documents which. `× 1000` works for both because
micros are stored in `g`-equivalent (Fe `g: 0.010` = 10 mg/kg). Brittle —
see `learnings.md`.

---

## Term 2 — Biomass build-out (`BIOMASS_DEMAND[stage]`)

Ongoing uptake for canopy and structures that don't leave the farm.
Stage-driven, mg/m²/wk:

| Stage | Weeks post-transplant | Phenology              | Cert anchor                                          |
|-------|-----------------------|------------------------|------------------------------------------------------|
| T1    | 1-4                   | Établissement          | Haifa days 1-20, QC winter ~20 % discount (cert 2)   |
| T2    | 5-8                   | Croissance végétative  | Haifa days 21-40 (cert 2)                            |
| T3    | 9-11                  | Floraison              | Haifa days 41-60 — P + K + Mg spike (cert 2)         |
| T4    | Production montante   | Canopy still expanding | T5 × 0.85 (cert 1 — extrapolation of cert-2)         |
| T5    | Pleine production     | Canopy maintenance     | TOMATO_REMOVAL × 1500 − fruit_export × 1500 (cert 2) |

- T1-T3: bottom-up from Haifa F-144 kg/ha/day table (preserved in
  `BIOMASS_DEMAND` comment block), ~20 % T1 discount for QC winter light.
- T5: top-down, `TOMATO_REMOVAL` ratio at 1.5 kg/m²/wk minus fruit export.
  Split-sum reconciles by construction at target yield.
- T4 = T5 × 0.85 (midpoint extrapolation; refine with stage-stratified
  tissue tests).

### Sources

Source-quality high; transferability cert capped at 2 because every
context is Mediterranean and / or hydroponic.

| Source | Used for | Source quality | Transferability cert |
|--------|----------|----------------|----------------------|
| Haifa F-144 "Daniela" greenhouse program | T1-T3 N/P/K kg/ha/day per stage | High | 2 |
| Sonneveld & Voogt 2009 *Plant Nutrition of Greenhouse Crops* | Ca/Mg ratios, validation | High | 2 |
| ISHS 893_112 (hydroponic tomato vegetative uptake) | Confirms Haifa ramp shape | High | 2 |
| MDPI Agriculture 11(4):292 (phenological-stage uptake by EC) | Order P<Mg<Ca<K<N during vegetative | Moderate | 2 |
| Yara crop nutrition (qualitative) | Mg flowering peak, Ca canopy retention | High | 2 |

### Conversion (Haifa → mg/m²/wk)

`1 kg/ha = 0.1 g/m² = 100 mg/m²`. × 7 days = 700 mg/m²/wk per 1 kg/ha/day.
Haifa "1.0 kg N/ha/day at days 1-10" → 700 mg N/m²/wk for T1.

---

## Per-stage cert (`TOMATO_DEMAND_CERT`)

Total demand cert per (stage, element) = `min(TOMATO_FRUIT_EXPORT cert,
BIOMASS_DEMAND[stage] cert)`:

| Stage | N | P | K | Ca | Mg | Fe / Mn / Zn / B / Cu / Mo |
|-------|---|---|---|----|----|----------------------------|
| T1    | 2 | 2 | 2 | 2  | 2  | 1                          |
| T2    | 2 | 2 | 2 | 2  | 2  | 1                          |
| T3    | 2 | 2 | 2 | 2  | 2  | 1                          |
| T4    | 1 | 1 | 1 | 1  | 1  | 1                          |
| T5    | 2 | 2 | 2 | 2  | 2  | 1                          |

Macros cert 2 on T1-T3 and T5 (Mediterranean-hydroponic inheritance).
T4 macros cert 1 (extrapolating cert-2 = cert 1). Micros cert 1 across
all stages (estimated `TOMATO_REMOVAL` micros + default 60 % split).

Surfaced per (stage, element) via `PN.certFor(stage, el)` on row click.

---

## Edge cases

- **Invalid stage** (`undefined`, `'T0'`, `'T6'`): demand collapses to
  fruit-export only via `bio || {}` fallback. T6 retired 2026-05-07.
- **Negative yield**: not validated. Bilan input has `min="0"`.
- **Zero yield at T5**: legitimate — biomass term still applies; split
  sum equals `BIOMASS_DEMAND[T5]`.

---

## Caveats

- **Transpiration coupling — Ca and Mg only (REQ-081, applied 2026-05-09).**
  Ca/Mg biomass × `transpFactor` (current ÷ target yield, floor 0.4); Ca
  is xylem-only, Mg partly xylem. N/P/K/micros unscaled — phloem
  redistribution and active transport decouple them weekly.
- **Fruit export uses target yield, not measured.** Bilan answers "what
  would the plant need to hit target?" — run with measured yield for
  retrospective analysis.
- **Light ceiling decoupled.** Bilan surfaces light-limited yield
  ceiling (≈ `weekly_J_cm² ÷ 7000` kg/m²/wk) separately; header card
  flags `y_target > ceiling`. Demand math does not cap.

---

## Refinement triggers

- **Tissue test results.** Petiole NO₃-N + Mg + Cu/Mn/Zn ordered
  2026-05-05; expected ~2026-05-12. If measured diverges >25 % from
  cert-3+ assumed values, refine `TOMATO_REMOVAL` and re-derive T5 → T4.
- **Yield ceiling shifts.** Sustained >1.5 kg/m²/wk for >3 weeks → T5
  may underestimate; re-derive at new target.
- **Stage-stratified data.** T4 with independent measurement graduates
  off `T5 × 0.85`.
- **Per-element micro splits.** Replace 60 % default for Fe/Mn/Zn/B/Cu/Mo
  when Yara or peer-reviewed data lands.

---

## Implementation map

| File                                          | Owns                                                      |
|-----------------------------------------------|-----------------------------------------------------------|
| `nutrition/tomato/plant-needs/data.js`        | `TOMATO_REMOVAL`, `TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`, `TOMATO_DEMAND_CERT` |
| `nutrition/tomato/plant-needs/calc.js`        | `TRANSP_COUPLED_BIOMASS`, `calcNutrDemand`                |
| `nutrition/tomato/plant-needs/model.js`       | `window.PlantNeedsTomato` namespace wrapper               |
| `nutrition/tomato/plant-needs/spec.md`        | Spec                                                      |
| `nutrition/tomato/plant-needs/derivation.md`  | This file                                                 |
| `nutrition/tomato/plant-needs/learnings.md`   | Rejected alternatives, deferred refinements               |

Build order in `app/index.html`: `data.js` → `calc.js` → `model.js`.
Consumers reach for `window.PlantNeedsTomato`.
