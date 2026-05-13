// ─── yield-range/model.js — public API for the time-to-canopy-cap model ─
//
// Spec: yield-range/spec.md (REQ-112 to REQ-118).
//
// Consumers (yield-range/app/logic.js, future ports) read predictions and
// constants through `window.YieldRange` so internals can be refactored
// without breaking call sites. Mirrors the
// `nutrition/tomato/plant-needs/model.js` pattern.
window.YieldRange = {
  // Core prediction function.
  predictNurseryYield,

  // Bench DLI helper exposed so the app UI can render the live DLI value
  // on the page (REQ-132 clickable display + f_light modal).
  dliBenchAvg,

  // f_light helper exposed so the app UI can derive the response-zone
  // colour of the bench-DLI display (REQ-135) without duplicating the
  // breakpoint table on the consumer side (REQ-060).
  f_light,

  // Read-only constants exposed for the app UI (chart axis bounds, label
  // text, threshold display, modal table render, etc.) — values live in
  // data.js.
  RGR_MAX_LETTUCE_NURSERY,
  W_INIT_GERMINATED_G,
  LED_PPFD,
  DLI_SUN_OUTDOOR_QC_ANNUAL,         // REQ-131
  GH_LIGHT_TRANSMISSION_DOUBLE_POLY, // REQ-131
  DLI_SUN_GH_ANNUAL_AVG_QC,
  CANOPY_CAP_BY_PLATEAU,
  TRAJECTORY_MAX_DAYS,
  POTENTIAL_THRESHOLD,
  F_LIGHT_BREAKPOINTS,               // REQ-132 modal table source
};
