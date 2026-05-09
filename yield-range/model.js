// ─── yield-range/model.js — public API namespace ────────────────────────────
//
// Spec: yield-range/spec.md, yield-range/derivation.md, yield-range/app/spec.md
//
// Mirrors the plant-needs convention (window.PlantNeedsTomato): consumers go
// through this namespace so internals can be refactored without breaking the
// page. Symbols still live in the same global scope as the rest of the
// build-time-included files; this wrapper makes the boundary explicit.
//
// REQ-068 — VARIETY_LIBRARY exposed read-only so the verifier can scan the
//           key set (Salanova-only until calibration data lands).
window.YieldRange = {
  // Core prediction functions (REQ-067 / 069 / 070 / 071 surfaced here).
  predictNurseryYield,
  computeBestStrategy,

  // Stress functions — exposed for inspection / future per-day climate data.
  piecewiseLinear,
  f_light,
  f_Tday,
  f_Tnight,
  f_CE,
  f_VPD,
  f_CO2,
  spacing_factor,
  rootCap,

  // Read-only constants. The Yield Range admin page reads these directly so
  // info-block values never drift from the source-of-truth (REQ-060 spirit;
  // REQ-078 explicit for the seven-item info block).
  RGR_MAX_LETTUCE_NURSERY,
  SHOOT_PER_ML_SUBSTRATE,
  SENESCENCE_GROWTH_THRESH,
  SENESCENCE_STRESS_THRESH,
  DECAY_RATE,
  YIELD_BAND_FACTOR_LOW,
  YIELD_BAND_FACTOR_HIGH,
  W_INIT_FALLBACK_G,
  W_INIT_GERMINATED_G,
  BOLTING_TDAY_THRESHOLD_C,
  DLI_LED,
  DLI_SUN_GH_ANNUAL_AVG_QC,
  DLI_BENCH_AVG_DEFAULT,
  TRAY_AREA_M2,
  VARIETY_LIBRARY,

  // Stress tables — exposed for the page's "what curve gave you that
  // multiplier?" inspection and for the verifier to assert REQ-063 floor.
  F_LIGHT_BREAKPOINTS,
  F_TDAY_BREAKPOINTS,
  F_TNIGHT_BREAKPOINTS,
  F_CE_BREAKPOINTS,
  F_VPD_BREAKPOINTS_GM3,
  F_CO2_BREAKPOINTS_PPM,
  NURSERY_SPACING_PACKED,
};
