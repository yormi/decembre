# Yield Range — Salanova nursery yield prediction model

Specs for the math model that predicts seedling fresh-weight yield (per
plant, per tray, per cohort) for Salanova in the Décembre nursery.
RGR-multiplier model with environmental stress factors and a hard
root-volume cap.

This file is the *spec* (what the model must do or be). Formulas,
stress-function tables, constants and their history, calibration
narrative, refinement triggers, and the implementation map live in
`derivation.md` next door. Raw cohort observations live in
`calibration-data.md`. App-side specs (page layout, controls, rendering)
live in `yield-range/app/spec.md`.

---

## Contract

### Inputs (one value per cohort)

- `varietyKey` — enum, `'salanova'` only (REQ-068)
- `cellVolumeML` — 35 (50-cell) or 90 (32-cell)
- `cellsPerTray` — int, 50 or 32
- `traysPerCohort` — int, default 50
- `cycleDays` — days from sow/transplant to harvest
- `dliBenchAvg` — mol/m²/d, bench-level Daily Light Integral, cycle average
- `tDayAvgC` — °C, daily-period mean temperature, cycle average
- `tNightAvgC` — °C, night-period mean temperature, cycle average
- `ceAvg` — mS/cm, applied fertigation CE, cycle average
- `vpdPhotoperiodAvgGM3` — g/m³, VPD averaged over photosynthesis hours only (REQ-065, REQ-066)
- `co2PhotoperiodAvgPpm` — ppm, CO₂ averaged over photosynthesis hours only (REQ-065)
- `wInitG` — g, initial weight (transplant or 0.001 for seed)

### Outputs

`predictNurseryYield(cohort)` returns an object with at least:

- `wPredictedG`, `wLowG`, `wHighG` — predicted weight ±15 % band (REQ-067)
- `wPeakG` — maximum W(d) across the cycle
- `yieldPerTrayG`, `yieldPerCohortKg`
- `optimalHarvestDay` — last day before senescence (REQ-070)
- `daysToRootCap`
- `bindingConstraint` — the dominant limiting factor (REQ-069)
- `topLevers` — sorted list of stress factors, top 3 surfaced
- `riskFlags` — set including `bolting` when triggered (REQ-071), plus `tipburn` / `etiolation` / `water_stress` / `disease` / `co2_misaligned`
- `regressionWarning` — true if `cycleDays > optimalHarvestDay`

Cert scale per `nutrition/tomato/plant-needs/spec.md` (single
transferability scale, 0–5).

---

## REQ-063 — Packed-canopy spacing decay

**Statement:** The nursery yield model uses a hardcoded packed-canopy
spacing decay (`spacing_factor` floor ≤ 0.40 for `d > 18`). Spreading
schedules are not exposed as a user input.

**Rationale:** Décembre keeps trays packed end-to-end as a fixed
operational constraint. Modeling spread schedules would let the user
silently change the dominant yield assumption.

**Verification:** Deferred — wired when model lands. `NURSERY_SPACING_PACKED`
constant present with floor ≤ 0.40; no spread-schedule input on
`predictNurseryYield()`.

**Cert:** 5

---

## REQ-064 — No pH-lockout multiplier

**Statement:** The nursery yield model MUST NOT apply a pH-lockout
penalty to growth. The CE stress function depends on CE only.

**Rationale:** Nursery substrate is peat-based, not the calcium-saturated
field soil. Importing the field-soil pH penalty (used in
`nutrition/lettuce/` model) would double-penalize.

**Verification:** Deferred — wired when model lands. Verifier scans the
nursery yield-model code path for absence of `pH_lockout` / `f_pH`
references.

**Cert:** 5

---

## REQ-065 — Photoperiod-weighted environmental inputs

**Statement:** VPD and CO₂ inputs to the nursery yield model are
photoperiod-averaged, not 24-hour averaged. Variable names must reflect
this (`vpdPhotoperiodAvgGM3`, `co2PhotoperiodAvgPpm`).

**Rationale:** 24 h averages overstate CO₂ enrichment value (Décembre's
enrichment runs strongest at night when vents are shut, collapses at
midday with vent opening) and understate VPD problems (morning
condensation hours dilute the metric).

**Verification:** Deferred — wired when model lands. Variable-name grep
on yield-model function signatures.

**Cert:** 5

---

## REQ-066 — VPD reported in g/m³

**Statement:** VPD inputs and outputs are in g/m³, not kPa. Matches
Décembre's climate dashboard unit.

**Rationale:** Mixing units between the app and the dashboard creates
operator error.

**Verification:** Deferred — wired when model lands. Variable-name
suffix `_GM3` on all VPD-bearing identifiers.

**Cert:** 5

---

## REQ-067 — Yield range presented as ±15 % band by default

**Statement:** Predicted yield outputs include `wLowG` / `wPredictedG` /
`wHighG`, with low/high derived from `YIELD_BAND_FACTOR_LOW = 0.85` and
`YIELD_BAND_FACTOR_HIGH = 1.15`. Wider band when uncalibrated.

**Rationale:** Single-point predictions invite overconfidence.

**Verification:** Deferred — wired when model lands. Output-shape check
on `predictNurseryYield()` return.

**Cert:** 5

---

## REQ-068 — Salanova-only variety scope

**Statement:** Variety library contains exactly `'salanova'`; no other
cultivar constants until calibration data exists.

**Rationale:** Adding cultivars before calibration data lands invents
numbers.

**Verification:** Deferred — wired when model lands. `VARIETY_LIBRARY`
(or equivalent) key set equals `{'salanova'}`.

**Cert:** 5

---

## REQ-069 — Binding constraint surfaced

**Statement:** Every prediction returns a `bindingConstraint` field
identifying the dominant limiting factor (one of: `light`, `Tday`,
`Tnight`, `CE`, `VPD`, `CO2`, `root`, `senescence`).

**Rationale:** Predictions without a binding constraint are not
actionable — the operator cannot tell what to change.

**Verification:** Deferred — wired when model lands. Output-shape check
on `predictNurseryYield()` return.

**Cert:** 5

---

## REQ-070 — Senescence branch + optimalHarvestDay

**Statement:** The model includes a senescence branch that flips daily
biomass change negative when cumulative stress and growth stagnation
trigger thresholds (`SENESCENCE_GROWTH_THRESH = 0.02`,
`SENESCENCE_STRESS_THRESH = 0.5`). Output includes `optimalHarvestDay` =
last day before senescence triggers.

**Rationale:** Décembre's 2026 spring batch lost ~6 g (38 %) between
d28 and d35 due to packed-canopy + heat-stress senescence. A model that
only decelerates growth would miss this and predict harvest at
cycle-end, not at peak. `optimalHarvestDay` is the headline operational
output of the page.

**Verification:** Deferred — wired when model lands. Senescence
constants present; `predictNurseryYield()` return includes
`optimalHarvestDay`.

**Cert:** 5

---

## REQ-071 — Bolting flag for sustained T_day > 26 °C

**Statement:** The model surfaces a `bolting` risk flag when
cycle-average T_day exceeds 26 °C
(`BOLTING_TDAY_THRESHOLD_C = 26`).

**Rationale:** Lettuce bolts (premature flowering, quality collapse) at
sustained mild heat well below the temperature where raw growth rate
falls. Décembre's nursery shares the tomato zone (typical setpoint
22–26 °C); the operator's hypothesis that this is the dominant problem
needs an explicit flag.

**Verification:** Deferred — wired when model lands.
`BOLTING_TDAY_THRESHOLD_C` constant present; `riskFlags` includes
`bolting` when input `tDayAvgC > 26`.

**Cert:** 5

---

## Inherited / cross-references

Specs that *consume* the yield-model output (app-side):

- **REQ-072 to REQ-078, REQ-084** (`yield-range/app/spec.md`) — page
  inputs, outputs, info block, DLI slider.

Cross-domain divergence preserved:

- **`nutrition/lettuce/` field-soil model** uses a pH-lockout multiplier;
  this nursery model deliberately does not (REQ-064). Both must coexist
  without one being reused for the other crop's substrate.

Cross-app specs that apply when the page lands:

- **REQ-001** (`requirements.md`) — French CE, not EC, in user-facing text
- **REQ-005** (`requirements.md`) — URL hash routing for the new page slug
