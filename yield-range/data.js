// ─── yield-range/data.js — Salanova nursery yield model constants ──────────
//
// Source-of-truth for every constant declared in `yield-range/spec.md` and
// `yield-range/derivation.md`. Pure data (no logic). Consumers go through
// `yield-range/calc.js` (pure functions) and `yield-range/model.js` (the
// `window.YieldRange` namespace).
//
// REQ scope (yield-range model invariants — see yield-range/spec.md):
//   REQ-063 — packed-canopy spacing decay (floor ≤ 0.40 past d28)
//   REQ-064 — NO pH-lockout multiplier (peat substrate, divergence from
//             nutrition/lettuce/ field-soil model — must be preserved)
//   REQ-065 — photoperiod-weighted env inputs (variable suffixes reflect)
//   REQ-066 — VPD in g/m³ (suffix _GM3 on every VPD-bearing identifier)
//   REQ-067 — ±15% prediction band via YIELD_BAND_FACTOR_LOW/HIGH
//   REQ-068 — Salanova-only variety scope (VARIETY_LIBRARY = {salanova})
//   REQ-070 — senescence thresholds + DECAY_RATE
//   REQ-071 — bolting flag at BOLTING_TDAY_THRESHOLD_C = 26
//
// Cert scale per nutrition/tomato/plant-needs/spec.md (transferability 0–5).
// Stress-function tables are encoded as arrays of {x, y} breakpoints; the
// piecewiseLinear helper in calc.js does the interpolation with clamped ends.

// ─── Growth + senescence kinetics ───────────────────────────────────────────
const RGR_MAX_LETTUCE_NURSERY = 0.22;       // g/g/day, cert 3 — refit 2026-05-09 with corrected DLI (n=4 Décembre)
const SHOOT_PER_ML_SUBSTRATE  = 1.6;        // g FW per mL of cell substrate, cert 3 — Hochmuth-anchored

// REQ-070: senescence branch. Triggered when daily growth would be below
// SENESCENCE_GROWTH_THRESH AND compound stress is below SENESCENCE_STRESS_THRESH.
// Decay magnitude scales with (0.5 − Π_stress), capped by DECAY_RATE.
const SENESCENCE_GROWTH_THRESH = 0.02;      // < 2 %/day daily growth
const SENESCENCE_STRESS_THRESH = 0.5;       // Π stress factors below this
const DECAY_RATE               = 0.10;      // /day, max biomass loss in senescence

// REQ-067: ±15% prediction band default (Salanova nursery cert 3).
const YIELD_BAND_FACTOR_LOW  = 0.85;
const YIELD_BAND_FACTOR_HIGH = 1.15;

// Initial weight defaults (override via `wInitG` input).
const W_INIT_FALLBACK_G   = 0.001;          // seed mass, when sowing from scratch
const W_INIT_GERMINATED_G = 0.015;          // post-germination (~d5–7), cotyledons + first true leaf

// REQ-071: bolting flag threshold (cycle-average T_day above this → quality
// collapse before raw growth rate falls). Décembre's nursery shares the
// tomato zone (setpoint 22–26 °C) → chronic mild bolting pressure.
const BOLTING_TDAY_THRESHOLD_C = 26;

// ─── DLI inputs ─────────────────────────────────────────────────────────────
// DLI_LED       = 200 µmol/m²/s × 16 h × 3600 / 1e6 = 11.5 mol/m²/d
// DLI_SUN_GH_ANNUAL_AVG_QC = Quebec greenhouse, ~55% PAR transmission, annual mean
// DLI_BENCH_AVG_DEFAULT    = sun + LED (16h) — default for the slider, REQ-084
const DLI_LED                  = 11.5;      // mol/m²/d
const DLI_SUN_GH_ANNUAL_AVG_QC = 16.0;      // mol/m²/d, cert 2
const DLI_BENCH_AVG_DEFAULT    = 27.5;      // mol/m²/d — sun + LED 16h (REQ-084 slider default)

// ─── Tray geometry (REQ-076 — yield/m²/year formula uses this) ─────────────
const TRAY_AREA_M2 = 0.149;                 // standard 11" × 21" tray (50 or 32 cell)

// ─── Variety library (REQ-068 — Salanova only until calibration data lands) ─
const VARIETY_LIBRARY = { salanova: { rgrMaxFactor: 1.0 } };

// ─── Stress-function breakpoint tables ──────────────────────────────────────
// Encoded as arrays of {x, y} pairs, sorted by x. Values outside the range
// clamp to the nearest endpoint (handled by piecewiseLinear in calc.js).
//
// f_light(DLI_per_plant) — REQ-066 unit ppm not relevant; mol/m²/d.
//   <4: 0 (photosynthesis floor)
//   4 → 12 linear 0 → 1.0
//   12 – 17 plateau 1.0
//   17 → 22 linear 1.0 → 0.7
//   >22: 0.7 (excess; tipburn-flag handled in calc)
const F_LIGHT_BREAKPOINTS = [
  { x: 4,  y: 0    },
  { x: 12, y: 1.0  },
  { x: 17, y: 1.0  },
  { x: 22, y: 0.7  },
];

// f_Tday(T) — °C
//   <10 : 0
//   10 → 18 linear 0 → 1.0
//   18 – 22 plateau 1.0
//   22 → 26 linear 1.0 → 0.85
//   26 → 32 linear 0.85 → 0.4 (bolting risk if cycle-avg > BOLTING_TDAY_THRESHOLD_C)
//   >32 : 0.4 (heat-stress flag in calc)
const F_TDAY_BREAKPOINTS = [
  { x: 10, y: 0    },
  { x: 18, y: 1.0  },
  { x: 22, y: 1.0  },
  { x: 26, y: 0.85 },
  { x: 32, y: 0.4  },
];

// f_Tnight(T) — °C
//   <8 : 0.5
//   8 → 14 linear 0.5 → 1.0
//   14 – 18 plateau 1.0
//   18 → 24 linear 1.0 → 0.7  (stretch / etiolation flag)
//   >24 : 0.6
const F_TNIGHT_BREAKPOINTS = [
  { x: 8,  y: 0.5 },
  { x: 14, y: 1.0 },
  { x: 18, y: 1.0 },
  { x: 24, y: 0.7 },
];
const F_TNIGHT_FLOOR_HIGH = 0.6;            // applied when T_night > 24 (overrides last bp tail)

// f_CE(CE) — mS/cm. REQ-064: NO pH-lockout multiplier (peat substrate).
//   <0.5 : 0 (acutely N-limited)
//   0.5 → 1.5 linear 0 → 1.0
//   1.5 – 2.7 plateau 1.0
//   2.7 – 3.4 plateau 1.05 (luxury push, tipburn risk)
//   3.4 → 4.5 linear 1.05 → 0.7
//   >4.5 : 0.5 (salt-stress flag in calc)
const F_CE_BREAKPOINTS = [
  { x: 0.5, y: 0    },
  { x: 1.5, y: 1.0  },
  { x: 2.7, y: 1.0  },
  { x: 3.4, y: 1.05 },
  { x: 4.5, y: 0.7  },
];
const F_CE_FLOOR_HIGH = 0.5;                // applied when CE > 4.5

// f_VPD(VPD_GM3) — g/m³. REQ-066 unit suffix _GM3.
//   <2 : 0.7 (tipburn + disease flag)
//   2 → 3 linear 0.7 → 1.0
//   3 – 7 plateau 1.0
//   7 → 11 linear 1.0 → 0.7
//   >11 : 0.5 (water-stress flag)
const F_VPD_BREAKPOINTS_GM3 = [
  { x: 2,  y: 0.7 },
  { x: 3,  y: 1.0 },
  { x: 7,  y: 1.0 },
  { x: 11, y: 0.7 },
];
const F_VPD_FLOOR_LOW_GM3  = 0.7;           // applied when VPD < 2
const F_VPD_FLOOR_HIGH_GM3 = 0.5;           // applied when VPD > 11

// f_CO2(CO2_photoperiod_ppm) — REQ-065 photoperiod-weighted only.
//   300 ppm → 0.85
//   400      → 1.0
//   500      → 1.05
//   600      → 1.10
//   800      → 1.20
//  ≥1000     → 1.25
const F_CO2_BREAKPOINTS_PPM = [
  { x: 300,  y: 0.85 },
  { x: 400,  y: 1.0  },
  { x: 500,  y: 1.05 },
  { x: 600,  y: 1.10 },
  { x: 800,  y: 1.20 },
  { x: 1000, y: 1.25 },
];

// ─── Spacing / packed-canopy decay ──────────────────────────────────────────
// REQ-063: hardcoded packed-canopy curve, NOT a user input. Spreading is out
// of scope; spec floor ≤ 0.40 for d > 18. Curve calibrated to match Décembre
// 2026 spring batch (peak ≈ d28, regression by d35).
//   d ≤ 14: 1.0
//   14 < d ≤ 28: linear 1.0 → 0.40
//   d > 28: 0.40
const NURSERY_SPACING_PACKED = [
  { x: 0,   y: 1.0  },
  { x: 14,  y: 1.0  },
  { x: 28,  y: 0.40 },
  { x: 999, y: 0.40 },
];
