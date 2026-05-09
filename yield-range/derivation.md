# Yield Range — derivation

How the Salanova nursery yield model is built. The **spec** (what it must
do or be) is in `spec.md`. This file is everything else: model
formulation, formulas, stress-function tables, constants and their
history, RootCap math, spacing curve, output definitions, calibration
anchors, refinement triggers. When a number changes, this is where the
*why* lives.

---

## Model formulation

Logistic growth with environmental stress multipliers and a senescence
branch.

### Active-growth phase

```
growth_factor(d) = RGR_max × (1 − W(d)/RootCap) × Π stress_factors(d)
W(d+1)           = W(d) × (1 + growth_factor(d))
```

Where:
- `Π stress_factors(d) = f_light(d) × f_Tday × f_Tnight × f_CE × f_VPD × f_CO2`
- `f_light(d)` varies by day (spacing/canopy decay)
- Other multipliers are cycle-constant (cycle-average inputs)
- The `(1 − W/RootCap)` logistic term naturally decelerates growth as the
  plant approaches its root-volume ceiling (matches observed Décembre
  pattern: peak ≈ d28 at ~16 g in 50-cell)

### Senescence branch

When growth stagnates AND environmental stress is severe, biomass declines.
Triggered when:

- `growth_factor(d) < SENESCENCE_GROWTH_THRESH` (i.e., daily growth would
  be < 2 %), AND
- `Π stress_factors(d) < SENESCENCE_STRESS_THRESH` (compound environmental
  stress)

In senescence:

```
W(d+1) = W(d) × (1 − DECAY_RATE × (0.5 − Π stress_factors(d)))
```

Decay accelerates with worse stress. Captures the empirically observed
loss from 16 g (d28) → 10–12 g (d35) when packed-canopy + mild heat
stress + low-VPD pockets compound.

### Initial weight

`W(0) = wInitG` user input. Defaults:

- Post-transplant: actual transplant weight
- Post-germination (~d5–7 from sow): 0.015 g (cotyledons + first true leaf)
- From sow date: 0.001 g (model treats first ~5 days as germination, low
  effective growth)

### Why this shape (vs. limit-stacking)

RGR multiplier calibrates against **observable cycle outcomes** (FW at
harvest). Limit-stacking (Liebig-style) is mechanistically cleaner but
needs leaf-area + LUE estimates we cannot measure at this scale. The
±15 % prediction band absorbs the resolution loss from cycle-average
inputs vs. daily series.

---

## Constants

```
RGR_MAX_LETTUCE_NURSERY        = 0.22   g/g/day   cert 3 — refit 2026-05-09 with corrected DLI (n=4 Décembre)
SHOOT_PER_ML_SUBSTRATE         = 1.6    g FW/mL   cert 3 — Hochmuth-anchored
SENESCENCE_GROWTH_THRESH       = 0.02             trigger senescence when daily growth < 2%
SENESCENCE_STRESS_THRESH       = 0.5              trigger senescence when Π stress < 0.5
DECAY_RATE                     = 0.10  /day       max biomass loss rate in senescence
YIELD_BAND_FACTOR_LOW          = 0.85             ±15% prediction band
YIELD_BAND_FACTOR_HIGH         = 1.15
W_INIT_FALLBACK_G              = 0.001            seed mass when no transplant input
W_INIT_GERMINATED_G            = 0.015            cotyledons + first true leaf, post-germination
BOLTING_TDAY_THRESHOLD_C       = 26               sustained T_day > this triggers bolting flag
DLI_LED                        = 11.5  mol/m²/d   200 µmol/m²/s × 16h × 3600 / 1e6
DLI_SUN_GH_ANNUAL_AVG_QC       = 16.0  mol/m²/d   cert 2 — Quebec greenhouse, ~55% PAR transmission, annual avg
DLI_BENCH_AVG                  = 27.5  mol/m²/d   sun + LED, cycle-agnostic default
```

### `RGR_MAX_LETTUCE_NURSERY` history

| Date       | Value | Why                                                                                |
|------------|-------|------------------------------------------------------------------------------------|
| initial    | 0.20  | Lit value, mature lettuce                                                          |
| 2026-05-09 | 0.35  | Refit assuming `DLI_BENCH_AVG = 11.5` — light starvation absorbed too much explanation |
| 2026-05-09 | 0.22  | Refit again with corrected `DLI_BENCH_AVG = 27.5`. Closer to lit value because real light removes the spurious "light-starved past d18" contribution that 0.35 was compensating for. |

### `DLI_BENCH_AVG` history

| Date       | Value             | Why                                                                                |
|------------|-------------------|------------------------------------------------------------------------------------|
| initial    | 11.5              | LED only (200 µmol × 16 h × 3600 / 1e6) — wrong; the greenhouse gets sun too       |
| 2026-05-09 | 27.5 (= 16 + 11.5) | sun (Quebec GH annual avg, cert 2) + LED. With this, packed-canopy plants past d18 still get ~11.2 mol/m²/d per plant (× 0.40 spacing floor) → `f_light` near 0.9, not 0.08. Light is rarely limiting in the current setup. |

---

## Stress functions

Each is a piecewise-linear function returning a 0–1+ multiplier (luxury
bonuses allowed but capped at 1.05). Plateau at optimum, ramp down beyond.

### `f_light(DLI_per_plant)` — mol/m²/d

| DLI      | f                  | Notes                  |
|----------|--------------------|------------------------|
| <4       | 0                  | Photosynthesis floor   |
| 4 → 12   | linear 0 → 1.0     | Light-limited          |
| 12 – 17  | 1.0                | Optimum                |
| 17 → 22  | linear 1.0 → 0.7   | Saturation, mild stress|
| >22      | 0.7 + tipburn flag | Excess                 |

`DLI_per_plant(d) = dliBenchAvg × spacing_factor(d)` — see Spacing
section.

### `f_Tday(T_day)` — °C

| T        | f                   | Flag                                         |
|----------|---------------------|----------------------------------------------|
| <10      | 0                   | —                                            |
| 10 → 18  | linear 0 → 1.0      | —                                            |
| 18 – 22  | 1.0 (optimum)       | —                                            |
| 22 → 26  | linear 1.0 → 0.85   | —                                            |
| 26 → 32  | linear 0.85 → 0.4   | **bolting risk** if sustained (cycle-avg > 26) |
| >32      | 0.4 + heat-stress flag | bolting + heat-stress                     |

Bolting threshold (26 °C) sits **below** the temperate-stress cap
because lettuce quality (not just yield) collapses well before raw
growth rate does. Tomato zone setpoint typically 22–26 °C; if nursery
shares that zone, expect chronic mild bolting pressure. Empirically
observed at Décembre 2026 spring batch (see `calibration-data.md`).

### `f_Tnight(T_night)` — °C

| T       | f                                  |
|---------|------------------------------------|
| <8      | 0.5                                |
| 8 → 14  | linear 0.5 → 1.0                   |
| 14 – 18 | 1.0 (optimum)                      |
| 18 → 24 | linear 1.0 → 0.7 + stretch flag    |
| >24     | 0.6                                |

High night temps drive stretch (etiolation) and respiration losses.

### `f_CE(CE)` — mS/cm

No pH-lockout penalty (peat substrate; deliberate divergence from
`nutrition/lettuce/` field-soil model — see REQ-064).

| CE        | f                       | Notes                          |
|-----------|-------------------------|--------------------------------|
| <0.5      | 0                       | Acutely N-limited              |
| 0.5 → 1.5 | linear 0 → 1.0          | Sub-optimal                    |
| 1.5 – 2.7 | 1.0                     | Optimum                        |
| 2.7 – 3.4 | 1.05                    | Luxury push, tipburn risk flag |
| 3.4 → 4.5 | linear 1.05 → 0.7       | Salt stress                    |
| >4.5      | 0.5 + salt-stress flag  | Damaging                       |

### `f_VPD(VPD)` — g/m³

VPD reported in g/m³ to match Décembre's climate dashboard
(1 kPa ≈ 7.5 g/m³ at 20 °C).

| VPD     | f                                  | Notes                                                           |
|---------|------------------------------------|-----------------------------------------------------------------|
| <2      | 0.7 + tipburn + disease flag       | Poor Ca translocation; fungal risk (matches dashboard pink-zone)|
| 2 → 3   | linear 0.7 → 1.0                   | Ramp-up                                                         |
| 3 – 7   | 1.0                                | Optimum (Décembre's 3 g/m³ target = floor of band, not center)  |
| 7 → 11  | linear 1.0 → 0.7                   | Mild water stress                                               |
| >11     | 0.5 + water-stress flag            | Damaging                                                        |

### `f_CO2(CO2_photoperiod_ppm)` — ppm

| ppm   | f    |
|-------|------|
| 300   | 0.85 |
| 400   | 1.0  |
| 500   | 1.05 |
| 600   | 1.10 |
| 800   | 1.20 |
| ≥1000 | 1.25 |

Linear interpolation between anchors. Uses photoperiod-weighted CO₂; the
model must reject 24 h averages (they overstate enrichment value — see
REQ-065).

---

## RootCap

```
RootCap_g = cellVolumeML × SHOOT_PER_ML_SUBSTRATE
```

Anchors (cert 3, Hochmuth-derived):

| Cell volume         | RootCap | Empirical anchor                  |
|---------------------|---------|-----------------------------------|
| 35 mL (50-cell)     | 56 g    | Hochmuth 50–110 g range, lower-middle |
| 90 mL (32-cell)     | 144 g   | 150 g push target                 |
| 200 mL (rockwool block) | 320 g | Final-stage transplant cap       |

**Variety factor not currently applied** (Salanova-only — see REQ-068).
When other cultivars land, multiply by `varietyRootFactor`
(compact/mini types ≈ 0.8).

---

## Spacing — packed-canopy decay

Hardcoded; not a user input (see REQ-063). Curve calibrated to match
Décembre 2026 spring batch (peak ≈ d28, regression by d35) — see
`calibration-data.md`.

```
spacing_factor(d) =
  1.0                      for d ≤ 14
  linear 1.0 → 0.40        for 14 < d ≤ 28
  0.40                     for d > 28
```

Reflects 50-cell density (333 plants/m²) where canopy starts closing
around day 14, reaches near-floor at day 28, saturates at ~40 % of bench
DLI per plant past day 30. Earlier spec versions had closure at d7–18 —
too aggressive based on photo evidence. **This curve is the
single-largest yield cap on Décembre's nursery operation today.** The
model surfaces it as the dominant lever in nearly every prediction.

For 32-cell density (215/m²), the same curve shape applies but the floor
rises to ~0.55 (less self-shading). To be added if 32-cell becomes a
real cohort target.

### Why packed-only (not a user input)

Décembre keeps trays packed end-to-end as a fixed operational constraint.
Modeling spread schedules would let the operator silently change the
dominant yield assumption (REQ-063). The model surfaces the spacing cap
as the dominant lever — that's the model doing its job, not a flaw.

---

## Outputs

For each cohort:

| Output | Formula / definition |
|--------|----------------------|
| `wPredictedG`         | Daily integration at `cycleDays`, capped at RootCap |
| `wPeakG`              | Maximum W(d) across the cycle (may exceed `wPredictedG` if senescence kicks in before harvest) |
| `wLowG` / `wHighG`    | × 0.85 / × 1.15 of `wPredictedG` (REQ-067 ±15 % band) |
| `yieldPerTrayG`       | `wPredictedG × cellsPerTray`           |
| `yieldPerCohortKg`    | × `traysPerCohort` / 1000              |
| **`optimalHarvestDay`** | **Last day where dW/dt > 0 (i.e., before senescence flips growth negative). Headline operational output (REQ-070).** |
| `daysToRootCap`       | First day W(d) ≥ RootCap × 0.95 (Infinity if never) |
| `bindingConstraint`   | Lowest stress factor across cycle, OR `'root'` if cap binds first, OR `'senescence'` if model exits via senescence branch before `cycleDays` (REQ-069) |
| `topLevers`           | Stress factors sorted by `(1 − f) × estimated_sensitivity`; surface top 3 |
| `riskFlags`           | `tipburn` (CE>2.7 + VPD<2) / `etiolation` (DLI<8) / `water_stress` (VPD>11) / `disease` (VPD<2) / `bolting` (T_day>26 sustained, REQ-071) / `co2_misaligned` (if user provides night CO₂ separately and gap >200 ppm) |
| `regressionWarning`   | Boolean: true if `cycleDays > optimalHarvestDay` (operator is harvesting past peak) |

---

## Calibration anchors

The model is anchored to Décembre's 2026 spring batch (n=4) plus
literature. See `calibration-data.md` for raw observations.

1. **Décembre observed weights (calibrated 2026-05-09, n=4)** — Tray 50,
   test 1: d21=4 g, d28=16 g, d35=10 g, d35=12 g. Anchored
   `RGR_MAX_LETTUCE_NURSERY = 0.22` (post-DLI-correction) and spacing
   closure d14–28. **Status: minimum viable calibration. Refit
   recommended at n ≥ 5 with matching conditions.**
2. **Hochmuth butterhead** — 33–35 mL → 50–110 g over ~28 days at DLI
   ~12. Anchors `SHOOT_PER_ML_SUBSTRATE = 1.6`. (cert 3)
3. **Rijk Zwaan / Salanova breeder data** — variety-specific RGR where
   published. (cert 2 — vendor data, not peer-reviewed)

Until n ≥ 5 cohorts under matching conditions exist, the prediction band
remains ±15 % and the UI labels predictions as
`calibration: minimum viable (n=4)` rather than `uncalibrated` or
`calibrated`. Future cohort priorities listed in `calibration-data.md`.

### Why no pH-lockout penalty here (vs. `nutrition/lettuce/`)

Nursery substrate is peat-based, not the calcium-saturated field soil.
Importing the field-soil pH penalty (used in the lettuce field model)
would double-penalize. This is a deliberate divergence from
`nutrition/lettuce/` — preserved as REQ-064.

### Why photoperiod-weighted VPD and CO₂ (not 24 h)

Climate dashboards report 24 h averages, which are misleading.
Décembre's CO₂ enrichment runs strongest overnight (vents shut) and
collapses during the day (vents open) — exactly when photosynthesis
needs it. Same logic for VPD: morning condensation hours don't drive
growth or transpiration, only daylight VPD does. Codified as REQ-065.

---

## Refinement triggers

Update the model when:

- **n ≥ 5 matching cohorts logged.** Refit `RGR_MAX_LETTUCE_NURSERY` to
  minimize squared residual against the integration. Update
  `calibration-data.md` and the constant block above.
- **A cohort's measured FW falls outside ±25 % of the predicted band.**
  Investigate before refitting — likely an environmental anomaly worth
  capturing as a qualitative note rather than averaging into RGR_max.
- **32-cell becomes a real cohort target.** Add the d30+ spacing-floor
  rise (~0.55 vs. 0.40 for 50-cell).
- **Spread-tray protocol gets piloted.** Add a spacing-curve variant
  parameterised by spread-day (currently REQ-063 forbids spreading as
  user input — relax and re-derive the curve from data).
- **A non-Salanova cultivar lands.** Introduce `varietyRootFactor`
  (compact/mini ≈ 0.8) and unlock the variety library
  (currently REQ-068 forbids).

---

## Implementation map

Deferred — populated when the model lands in code. Will list:

- File(s) owning each constant block (`RGR_MAX_LETTUCE_NURSERY`,
  `SHOOT_PER_ML_SUBSTRATE`, senescence triggers, DLI defaults, …)
- File(s) owning each stress function (`f_light` … `f_CO2`)
- Public API namespace (likely `window.YieldRangeNursery` or similar)
  and the consumer pattern from `yield-range/app/`
- Verifier hooks for REQ-063 to REQ-071 in
  `scripts/check-recipes.mjs` / `scripts/check-requirements.sh`
