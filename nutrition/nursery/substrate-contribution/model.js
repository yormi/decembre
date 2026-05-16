// Public API for the nursery substrate-contribution model.
//
// Spec:    nutrition/nursery/substrate-contribution/spec.md
// REQ-097: this namespace exists at runtime with the keys below.
//
// Consumers (Semis laitue Bilan card "Réserve substrat", future per-tray
// recipe calculators) reach for `window.SubstrateContributionNursery`
// instead of the bare globals — internals can then be reshaped (e.g.,
// per-batch OM2 sac analysis, alternate front-load product) without
// breaking call sites.
window.SubstrateContributionNursery = {
  // OM2 starter charge per element, ppm in fresh substrate.
  OM2_STARTER_CHARGE_PPM,
  // Fractional release per week of the 5-week cycle (sum ≈ 1.0).
  OM2_RELEASE_CURVE_BY_WEEK,
  // Feather meal label analysis (N only, %); mineralization fraction
  // and per-week release curve.
  FEATHER_MEAL_LABEL_PCT,
  FEATHER_MEAL_MINERALIZATION_FRAC,
  FEATHER_MEAL_RELEASE_CURVE_BY_WEEK,
  // Per-tray substrate geometry + default front-load.
  NURSERY_TRAY_SUBSTRATE_VOL_L,
  NURSERY_FEATHER_MEAL_DEFAULT_G_PER_TRAY,
  // Operational ceiling — germination protection.
  LIMITS,
  // Per-element efficiency (REQ-157) — fraction of applied substrate-product
  // mass plant-available across the 5-week cycle. See data.js + derivation.md
  // for the definitional choice (cycle-mean × mineralization for N;
  // cycle-mean for OM2-only elements).
  efficiency:                              NURSERY_SUBSTRATE_EFFICIENCY,
  // Per-week release function: returns { N, P, K, Ca, Mg } in mg/tray/wk.
  theoreticalSubstrateReleasePerWeek,
  // Cycle-average release: returns { perTray_mg, details, efficiency }.
  cycleAverageReleasePerTray,
};
