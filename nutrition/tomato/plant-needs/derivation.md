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

### Cert-floor source per (stage, element)

Every cert-1 cell traces to one of three named gaps. When refining, target
the named source — don't bump cert without addressing it.

| Cert-1 cell                                     | Source-of-cert-floor                                                                  |
|-------------------------------------------------|---------------------------------------------------------------------------------------|
| T4 macros (N / P / K / Ca / Mg)                 | T5 × 0.85 extrapolation — no independent stage-stratified data for T4                 |
| T1-T5 micros (Fe / Mn / Zn / B / Cu / Mo) — fruit term | `TOMATO_FRUIT_EXPORT` 60 % default split (Yara fruit-vs-canopy data gap for micros)   |
| T1-T5 micros — biomass term                     | `TOMATO_REMOVAL` micros are extrapolated whole-plant estimates (no peer-reviewed source) |
| Ca / Mg biomass (any stage)                     | `transpFactor` coupling cert ceiling — REQ-081 is cert 4 mechanism, but the input `transpFactor` itself is operator-supplied (cert 2-3 transpiration-to-yield ratio) |

### T4 cert-1 — load-bearing for the Bilan modal

`PN.certFor(stage, element)` is consumed by `nutrition/tomato/app/logic.js`
to stamp the per-element cert badge on the Bilan modal Pourquoi row (see
`registerPourquoi('demand.<element>', { cert: dCert, … })` at logic.js:172).
Operator sees cert 1 explicitly when reviewing T4 demand rows. This is
**acceptable** today: T4 spans weeks ~10-18 (production montante), and
the operator-visible decisions at that stage (recipe selection, ramping
fertigation CE, sidedress timing) are not cert-1-sensitive — they hinge on
fruit export which scales linearly with measured yield (cert 3, anchored
to `TOMATO_REMOVAL`), not on the cert-1 biomass extrapolation. The
biomass term at T4 is ~30-40 % of total demand at target yield, so a
±15 % T4-vs-T5 extrapolation error moves total demand by ≤6 %.

Bumping T4 to cert 2 requires either (a) independent T4 stage-stratified
data (no peer-reviewed source yet — see refinement trigger below) or
(b) a Décembre tissue panel separating T4 vs T5 tissue. Until then,
cert 1 with transparent operator surfacing is the right floor.

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

Each trigger names the **observable** (number / event that fires the
refinement), the **action** (what changes), and the **target** (file +
identifier to edit). Triggers fire on Guillaume's surfacing per
`feedback_no_polling_external_signals` — this section is the playbook,
not a polling queue.

- **Tissue panel back-test — macros.** *Observable:* petiole NO₃-N / P /
  K / Ca / Mg tissue results land (sampled 2026-05-11, regardless of
  report date). *Action:* compute `predicted_annual = TOMATO_REMOVAL ×
  measured_yield_kg_per_m²` vs measured uptake; if |Δ| ≤ 25 % per macro,
  bump T1-T3 + T5 macro cert 2 → 3 in `TOMATO_DEMAND_CERT`. If |Δ| > 25
  %, refit `TOMATO_REMOVAL[macro].g` in `data.js` (REQ-033 Tier-B floor
  binds — stay at or above {Yara, Sonneveld, Koller} mean), then
  re-derive `BIOMASS_DEMAND[T5]` per the top-down formula and
  `BIOMASS_DEMAND[T4] = T5 × 0.85`.
- **Tissue panel back-test — micros.** *Observable:* leaf-tissue Fe / Mn
  / Zn / B / Cu / Mo concentrations land. *Action:* if |Δ| ≤ 50 % per
  micro, bump cert 1 → 2 across all stages for that element in
  `TOMATO_DEMAND_CERT`. If |Δ| > 50 %, refit `TOMATO_REMOVAL[micro].g` in
  `data.js` AND replace the 60 % fruit-share default for that element in
  `TOMATO_FRUIT_EXPORT` (use measured fruit / leaf tissue ratio).
- **Yield ceiling shifts.** *Observable:* sustained measured yield >
  1.5 kg/m²/wk for ≥ 3 consecutive weeks at T5. *Action:* re-anchor T5
  derivation at new target yield by updating the `× 1500` constant in
  the `BIOMASS_DEMAND[T5]` derivation formula (header comment in
  `data.js` ~line 147) to `× new_target_mg_per_m²_per_wk`, then
  recompute every T5 cell and recompute T4 = T5 × 0.85.
- **Stage-stratified T4 data.** *Observable:* an independent T4 (weeks
  10-18 post-transplant) tissue / uptake measurement lands — Décembre
  panel split by stage, or peer-reviewed source with T4-equivalent
  resolution. *Action:* drop the `× 0.85` extrapolation; rewrite
  `BIOMASS_DEMAND.T4` directly from the measurement in `data.js`. Bump
  T4 macro cert 1 → 2 (or 3 if Décembre-measured) in
  `TOMATO_DEMAND_CERT.T4`.
- **Per-element micro splits — Sonneveld micros table.** *Observable:*
  Sonneveld 2009 § "tomato micro fruit-vs-canopy partitioning" or
  equivalent peer-reviewed split lands (currently default 60 % per micro
  — see "Refinement priority — micros gap" below). *Action:* replace per
  -micro fruit fraction in `TOMATO_FRUIT_EXPORT` (currently `× 0.60`),
  bump micro fruit-term cert 1 → 2 in `TOMATO_DEMAND_CERT`.

## Refinement priority — micros gap (long-standing TBD)

The cert-1 micro cells in `TOMATO_DEMAND_CERT` are the largest single
cert deficit in this subproject. Per P-07 (decide-and-ship on low
yield-impact) and P-08 (no PA-asks): default plan, no fork to Guillaume.

**Yield-impact assessment.** Micros are foliar-channel routed per
`CHANNEL_ROLE` (Fe / Mn / Zn / B / Cu / Mo all foliar-only at Décembre's
current high-pH lockout regime). Foliar dose is capped by burn ceiling
(REQ-115 in `nutrition/tomato/foliar-recipe/spec.md`), not by
plant-demand readout. So cert-1 micros in `BIOMASS_DEMAND` drive the
Bilan delivered-vs-demand gap visualization but do NOT drive operator
weighing — the foliar recipe is independently capped. **Low yield-impact**
for cert-1 micros today.

**Defensible default sources** (ranked by transferability cert that would
land if the source were wired in):

| Source                                                     | Would deliver                                       | Cert if wired |
|------------------------------------------------------------|-----------------------------------------------------|---------------|
| Sonneveld & Voogt 2009 § tomato micros (whole-plant g/yr)  | Whole-plant micros / yr → per-stage prorated split  | 2             |
| Yara tomato micros table (if published per-element fruit fraction) | Direct fruit / canopy ratio per micro       | 2-3           |
| Décembre leaf + fruit tissue panel separated by stage      | Direct measurement                                  | 3-4           |

**Default plan.** Hold cert 1 with documented data gap. Replacement
fires on tissue-panel back-test (above). If tissue panel does not
disambiguate fruit-vs-canopy micro split (typical — most labs return
whole-leaf only), pursue Sonneveld micros table refit as the next
defensible step. Not gated on Guillaume's review — this is the
defensible default per P-07.

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
