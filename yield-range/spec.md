# Yield Range — Salanova nursery time-to-canopy-cap model

Predicts how many days a Salanova seedling needs to approach its
canopy-density cap, under best non-light conditions, packed-only.
Inputs: tray choice (32 or 50-cell) and supplemental-LED hours.
Outputs: canopy cap (g/plant) and the daily growth trajectory for a
chart of head weight vs. days from germination.

This file is the *spec* (what the model must do). Math derivation,
constant choices, and the reasoning trail live in `derivation.md`.
Empirical anchor: `yield-range/doc/yield-range-calibration-2026-spring.md`.
App-side specs in `yield-range/app/spec.md`.

## Contract

### Inputs (one cohort)
- `plateauSize` — `18`, `24`, `32`, or `50` (cells per tray; always packed end-to-end)
- `ledHours` — number 0–18, hours of supplemental LED at 200 µmol/m²/s

### Outputs
- `canopyCapG` — biomass asymptote at this packed density (g/plant)
- `daysToPotential` — first integer day where W(d) ≥ 0.95 × `canopyCapG`,
  or `null` if not reached within the trajectory window
- `trajectory` — array of `{ day, weight_g }` from day 0 to day 49 (50 entries)

### Assumptions
- Trays packed end-to-end throughout cycle. No spread.
- All non-light stress factors fixed at 1.0 (T, T_night, CE, VPD, CO₂,
  nutrients, no disease, no bolting, no decay).
- Solar contribution = annual-average Quebec outdoor PAR DLI ×
  double-poly greenhouse transmission factor (both constants explicit
  in `data.js`; no seasonal lookup).
- Days are days-from-germination (not days-from-sow).

Cert scale per `nutrition/tomato/plant-needs/spec.md`.

---

## REQ-112 — Canopy cap is the operative ceiling

**Statement:** The growth ceiling is `canopyCapG`, a density-driven
biomass asymptote derived from Salanova breeder data. The Hochmuth
root-volume cap (cellVol × 1.6) is NOT used as the prediction ceiling.

**Rationale:** At packed densities (215–333 plants/m²) the canopy
binds far before root volume. Root cap is achievable only at fully
spread densities, which Décembre does not run.

**Verification:** Deferred — wired when model lands. `CANOPY_CAP_BY_PLATEAU`
constant present; `predictNurseryYield()` ceiling uses it; no `RootCap`
or `cellVolumeML × 1.6` reference in the prediction integration.

**Cert:** 5

---

## REQ-113 — Best non-light conditions assumed

**Statement:** The integration applies no stress multipliers other
than `f_light(dliPerPlant)`. No `f_Tday`, `f_Tnight`, `f_CE`, `f_VPD`,
`f_CO2`, `f_pH` in the daily growth term.

**Rationale:** The page answers "given everything else is best, how
long until I'm at potential?" — a strategy planner, not a what-if
calculator. Stress modeling adds inputs without sharpening the
operational question.

**Verification:** Deferred — wired when model lands. Predict function
contains no calls to `f_Tday`, `f_Tnight`, `f_CE`, `f_VPD`, `f_CO2`,
`f_pH`.

**Cert:** 5

---

## REQ-114 — DLI = annual sun (transmitted) + LED contribution

**Statement:** Bench DLI is `DLI_SUN_GH_ANNUAL_AVG_QC + (LED_PPFD ×
ledHours × 3600 / 1e6)`, where `DLI_SUN_GH_ANNUAL_AVG_QC =
DLI_SUN_OUTDOOR_QC_ANNUAL × GH_LIGHT_TRANSMISSION_DOUBLE_POLY` (see
REQ-131). All constants live in `data.js`. No seasonal sun lookup;
single annual constant.

**Rationale:** Operator-controllable lever is LED hours. Sun is a
fixed annual constant for this iteration — adding seasonal sun input
bloats the contract before it's needed.

**Verification:** Deferred — wired when model lands.
`DLI_SUN_GH_ANNUAL_AVG_QC` and `LED_PPFD` constants present; bench
DLI formula matches.

**Cert:** 4

---

## REQ-131 — Double-poly transmission decomposed in data.js

**Statement:** Bench sun DLI is computed as
`DLI_SUN_OUTDOOR_QC_ANNUAL × GH_LIGHT_TRANSMISSION_DOUBLE_POLY`. Both
constants are declared explicitly in `data.js`; no hardcoded
post-transmission value.

**Rationale:** Makes the transmission factor auditable and lets the
operator update it if greenhouse film changes (e.g., aged 6-mil
inflated double-poly drops from ~0.55 to ~0.45). Without the split,
the post-transmission constant silently bundles two distinct inputs.

**Verification:** Deferred — wired when verifier checks both
constants present and that `DLI_SUN_GH_ANNUAL_AVG_QC` matches
`DLI_SUN_OUTDOOR_QC_ANNUAL × GH_LIGHT_TRANSMISSION_DOUBLE_POLY`.

**Cert:** 4

---

## REQ-115 — Logistic growth, no decay

**Statement:** Daily integration:
`W(d+1) = W(d) × (1 + RGR_MAX × (1 − W/canopyCapG) × f_light(dliPerPlant(d)))`.
No senescence branch, no decay, no negative-growth flip.

**Rationale:** Per operator instruction — decay/senescence are out
of scope. Plants asymptote to `canopyCapG` and stay there.

**Verification:** Deferred — wired when model lands. Trajectory is
monotonically non-decreasing; no decay or senescence branch in code.

**Cert:** 5

---

## REQ-116 — Packed-canopy spacing always applied

**Statement:** Per-plant DLI is `dliBenchAvg × spacing_factor(d)`,
where `spacing_factor` decays from 1.0 (d ≤ 14) to 0.40 (d ≥ 28).
No spread-schedule input.

**Rationale:** Décembre operates packed only.

**Verification:** Deferred — wired when model lands. `spacing_factor`
constant present with floor ≤ 0.40 at d ≥ 28; no spread-schedule
input on `predictNurseryYield()`.

**Cert:** 5

---

## REQ-117 — Days-to-potential output

**Statement:** Output `daysToPotential` = first integer day where
W(d) ≥ 0.95 × `canopyCapG`. Returns `null` if not reached within the
trajectory window (49 days).

**Rationale:** "How long until I get full value?" is the operator's
primary question.

**Verification:** Deferred — wired when model lands. Output present
and integer-valued (or null).

**Cert:** 5

---

## REQ-118 — Trajectory output for chart

**Statement:** Output `trajectory` is an array of `{ day, weight_g }`
from day 0 to day 49 inclusive (50 entries).

**Rationale:** App page renders a chart of W(d).

**Verification:** Deferred — wired when model lands. Output array
length = 50; first entry day = 0; last entry day = 49.

**Cert:** 5

---

## Inherited / cross-references

- App-side spec: `yield-range/app/spec.md`
- Empirical anchor: `yield-range/doc/yield-range-calibration-2026-spring.md`
