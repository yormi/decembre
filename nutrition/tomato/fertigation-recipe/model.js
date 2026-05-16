// Public API for the tomate fertigation-recipe model.
//
// Spec:    nutrition/tomato/fertigation-recipe/spec.md
// REQ-099: this namespace exists at runtime with the keys below.
//
// Consumers (calculateNutritionSupply, renderPhase1Comparison, future per-stage
// drift gauges) should reach for `window.FertigationRecipeTomato` instead
// of the bare constants — the internal mass-balance and T5 anchor can
// then be reshaped without breaking call sites.
window.FertigationRecipeTomato = {
  // T5 refined first-principles target. K2SO4 / MgSO4-7H2O values are
  // populated at boot from computeStageRecipe('T5') (REQ-154); Solubore is
  // hand-coded (single-channel B at T5, REQ-061). Propagated to
  // FP_RECIPE_T5.fertigation by wireFpFertigation() at script load.
  FIRST_PRINCIPLES_T5:   FIRST_PRINCIPLES_T5_FERTIGATION,
  // Per-element efficiency (REQ-157) — channel-product → bed delivery fraction
  // at current soil pH 7.4. Soluble-cation chemistry for K/Mg (K2SO4 + MgSO4),
  // borate chemistry for B (Solubore). Bed → plant axis lives separately in
  // PH_UPTAKE_FACTOR_AT_CURRENT_SOIL (REQ-155).
  efficiency:            FERTIGATION_EFFICIENCY_AT_CURRENT_SOIL,
  // Mass-balance derivation function (REQ-098) — { kSulfate, mgSulfate, solubore } per stage
  computeStageRecipe,
  // Per-element delivered mg/m²/wk (REQ-151) — K, Mg, B from a canonical
  // g-keyed recipe; default reshape from STORED_RECIPE.tomato.fertigation[stage]
  computeFertigationSupply,
};
