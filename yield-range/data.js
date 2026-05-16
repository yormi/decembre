// ─── yield-range/data.js — constants for the Salanova nursery time-to-canopy-cap model ─
//
// Spec: yield-range/spec.md (REQ-112 to REQ-118).
// Calibration anchor: yield-range/doc/yield-range-calibration-2026-spring.md.
//
// All constants live here; calc.js consumes them, model.js exposes the public API.
// Per the spec discipline rule, we declare ONLY what the math model demands.

// ─── Growth-rate anchor (REQ-115 logistic growth) ───
//
// Refit anchor: best non-light conditions (Π other stress = 1.0), 50-cell packed,
// DLI = sun(16.5) + LED(11.5) = 28.0, RGR_MAX = 0.40, canopyCap = 25g
// → asymptotes around d28 to d35. Matches the upper bound of "best case" for
// Décembre's observed 16g (heat-stressed, sub-optimal). Cert 3, will need refit
// when more cohort data lands.
const RGR_MAXIMUM_LETTUCE_NURSERY = 0.40;

// ─── Initial seedling weight at germination (day 0) ───
// Salanova germinated radicle + cotyledon, peat substrate; cert 4.
const W_INIT_GERMINATED_G = 0.015;

// ─── Décembre supplemental lighting (LED bench above the nursery) ───
// 200 µmol/m²/s installed PPFD; ledHours user-input drives total LED DLI.
const LED_PPFD = 200;

// ─── Quebec greenhouse annual-average sun DLI (REQ-114, REQ-131) ───
// Single annual constant — no seasonal lookup. Decomposed into the two
// inputs that produce it so the transmission factor is auditable and
// updateable independently of the outdoor-DLI baseline (REQ-131).
//
//   DLI_SUN_OUTDOOR_QC_ANNUAL — Quebec annual-average outdoor PAR DLI
//     (mol/m²/d). Cert 2 — public climate-data summaries; refit when a
//     site-specific pyranometer dataset lands.
//   GH_LIGHT_TRANSMISSION_DOUBLE_POLY — PAR transmission factor for a
//     typical 6-mil inflated double-poly film (cert 3 — published range
//     0.50–0.65; aged poly drops to ~0.45). Update when the film is
//     replaced or aged.
//   DLI_SUN_GH_ANNUAL_AVG_QC — derived: outdoor × transmission.
//     30 × 0.55 = 16.5 mol/m²/d (was hardcoded 16 prior to the
//     decomposition; now anchored to declared inputs).
const DLI_SUN_OUTDOOR_QC_ANNUAL = 30;       // mol/m²/d, Quebec annual-avg outdoor PAR DLI, cert 2
const GH_LIGHT_TRANSMISSION_DOUBLE_POLY = 0.55;  // typical 6-mil inflated double-poly, cert 3
const DLI_SUN_GH_ANNUAL_AVG_QC = DLI_SUN_OUTDOOR_QC_ANNUAL * GH_LIGHT_TRANSMISSION_DOUBLE_POLY;  // 16.5 mol/m²/d

// ─── Canopy-density biomass cap (REQ-112 — operative ceiling) ───
//
// Derived from a 2-anchor power-law fit (W ∝ density^-1.585) on the
// 50-cell + 32-cell estimates, extrapolated for 24-cell and 18-cell.
// Packed end-to-end:
//   50-cell tray (333 plants/m²) → ~25 g/plant
//   32-cell tray (215 plants/m²) → ~50 g/plant
//   24-cell tray (161 plants/m²) → ~80 g/plant
//   18-cell tray (121 plants/m²) → ~120 g/plant
// Root-volume cap (cellVol × 1.6) is NOT used — at packed densities the
// canopy binds far before root volume.
// Cert 2 (50/32 are educated estimates from 1 Décembre cohort + general
// scaling; 24/18 are extrapolations from those two anchors). Refit when
// Rijk Zwaan grower density curves load or when 24/18 cohorts run.
const CANOPY_CAP_BY_PLATEAU = { 50: 25, 32: 50, 24: 80, 18: 120 };

// ─── Trajectory window (REQ-118) ───
// 50 entries from day 0 to day 49 inclusive.
const TRAJECTORY_MAXIMUM_DAYS = 49;

// ─── "At potential" threshold (REQ-117 — daysToPotential output) ───
// W ≥ 0.95 × canopyCapG triggers the daysToPotential marker.
const POTENTIAL_THRESHOLD = 0.95;

// ─── f_light piecewise-linear breakpoints (per-plant DLI → growth multiplier) ───
//
// Light-response curve for lettuce (cert 3, literature-anchored):
//   < 4 mol/m²/d  → photosynthesis stalls (f_light = 0)
//   4 → 12        → linear ramp up to optimum
//   12 → 17       → optimum plateau (f_light = 1.0)
//   17 → 22       → diminishing returns (down to 0.7)
//   ≥ 22          → saturation floor (0.7)
const F_LIGHT_BREAKPOINTS = [
  { x: 0,  y: 0   },
  { x: 4,  y: 0   },
  { x: 12, y: 1.0 },
  { x: 17, y: 1.0 },
  { x: 22, y: 0.7 },
  { x: 50, y: 0.7 },
];

// ─── Packed-canopy spacing factor (REQ-116) ───
//
// Per-plant DLI is bench DLI × spacing_factor(d). Trays packed end-to-end
// throughout cycle — no spread schedule. Curve:
//   d ≤ 14   → 1.0  (cotyledons + first true leaves; canopy not yet binding)
//   d 14→28  → linear decay (canopies overlap progressively)
//   d ≥ 28   → 0.40 (fully bound canopy)
const NURSERY_SPACING_PACKED = [
  { day: 0,  factor: 1.0  },
  { day: 14, factor: 1.0  },
  { day: 28, factor: 0.40 },
  { day: 99, factor: 0.40 },
];
