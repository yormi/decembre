// Public API for the tomate fertigation-recipe model.
//
// Spec:    nutrition/tomato/fertigation-recipe/spec.md
// REQ-099: this namespace exists at runtime with the keys below.
// REQ-100: MIXING_FACTOR_STORED < MIXING_FACTOR_FP, FP value pinned at 1.0.
//
// Consumers (calcNutrSupply, renderProposedRecipe, renderPhase1Comparison,
// future per-stage drift gauges) should reach for
// `window.FertigationRecipeTomato` instead of the bare constants — the
// internal mass-balance and T5 anchor can then be reshaped without
// breaking call sites.
window.FertigationRecipeTomato = {
  // Mode-aware mixing factors (REQ-100)
  MIXING_FACTOR_STORED:  MIXING_FACTOR_FERT_STORED,
  MIXING_FACTOR_FP:      MIXING_FACTOR_FERT_FP,
  // T5 refined first-principles target (PA Taillon April 2026 anchor),
  // wired into FP_RECIPE_T5.fertigation by wireFpFertigation() at script load
  FIRST_PRINCIPLES_T5:   FIRST_PRINCIPLES_T5_FERTIGATION,
  // Mass-balance derivation function (REQ-098) — { kSulfate, mgSulfate } per stage
  computeStageRecipe,
};
