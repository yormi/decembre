# Yield Range — Salanova nursery time-to-canopy-cap model

Predicts how many days a Salanova seedling needs to approach its
canopy-density cap, under best non-light conditions, packed-only.
Inputs: tray choice (32 or 50-cell) and supplemental-LED hours.
Outputs: canopy cap (g/plant) and the daily growth trajectory.

Math derivation, constant choices, and reasoning trail live in
`derivation.md`. Empirical anchor:
`yield-range/doc/yield-range-calibration-2026-spring.md`. App-side
specs in `yield-range/app/spec.md`.

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

---

## REQ-112 — Canopy cap is the operative ceiling

The growth ceiling is `canopyCapG`, a density-driven biomass
asymptote derived from Salanova breeder data. The Hochmuth root-volume
cap (cellVol × 1.6) is NOT used as the prediction ceiling.

---

## REQ-113 — Best non-light conditions assumed

The integration applies no stress multipliers other than
`f_light(dliPerPlant)`. No `f_Tday`, `f_Tnight`, `f_CE`, `f_VPD`,
`f_CO2`, `f_pH` in the daily growth term.

---

## REQ-114 — DLI = annual sun (transmitted) + LED contribution

Bench DLI is `DLI_SUN_GH_ANNUAL_AVG_QC + (LED_PPFD × ledHours × 3600
/ 1e6)`, where `DLI_SUN_GH_ANNUAL_AVG_QC = DLI_SUN_OUTDOOR_QC_ANNUAL
× GH_LIGHT_TRANSMISSION_DOUBLE_POLY` (see REQ-131). All constants
live in `data.js`. No seasonal sun lookup; single annual constant.

---

## REQ-131 — Double-poly transmission decomposed in data.js

Bench sun DLI is computed as `DLI_SUN_OUTDOOR_QC_ANNUAL ×
GH_LIGHT_TRANSMISSION_DOUBLE_POLY`. Both constants are declared
explicitly in `data.js`; no hardcoded post-transmission value.

---

## REQ-115 — Logistic growth, no decay

Daily integration:
`W(d+1) = W(d) × (1 + RGR_MAX × (1 − W/canopyCapG) × f_light(dliPerPlant(d)))`.
No senescence branch, no decay, no negative-growth flip.

---

## REQ-116 — Packed-canopy spacing always applied

Per-plant DLI is `dliBenchAvg × spacing_factor(d)`, where
`spacing_factor` decays from 1.0 (d ≤ 14) to 0.40 (d ≥ 28). No
spread-schedule input.

---

## REQ-117 — Days-to-potential output

Output `daysToPotential` = first integer day where W(d) ≥ 0.95 ×
`canopyCapG`. Returns `null` if not reached within the trajectory
window (49 days).

---

## REQ-118 — Trajectory output for chart

Output `trajectory` is an array of `{ day, weight_g }` from day 0 to
day 49 inclusive (50 entries).

---

## Inherited / cross-references

- App-side spec: `yield-range/app/spec.md`
- Empirical anchor: `yield-range/doc/yield-range-calibration-2026-spring.md`
