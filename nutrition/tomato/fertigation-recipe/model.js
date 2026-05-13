// Public API for the tomate fertigation-recipe model.
//
// Spec:    nutrition/tomato/fertigation-recipe/spec.md
// REQ-099: this namespace exists at runtime with the keys below.
//
// Consumers (calcNutrSupply, renderProposedRecipe, renderPhase1Comparison,
// future per-stage drift gauges) should reach for
// `window.FertigationRecipeTomato` instead of the bare constants — the
// internal mass-balance and T5 anchor can then be reshaped without
// breaking call sites.
window.FertigationRecipeTomato = {
  // T5 refined first-principles target (PA Taillon April 2026 anchor),
  // wired into FP_RECIPE_T5.fertigation by wireFpFertigation() at script load
  FIRST_PRINCIPLES_T5:   FIRST_PRINCIPLES_T5_FERTIGATION,
  // Mass-balance derivation function (REQ-098) — { kSulfate, mgSulfate } per stage
  computeStageRecipe,
  // Per-element delivered mg/m²/wk (REQ-151) — K, Mg, B from a canonical
  // g-keyed recipe; default reshape from STORED_RECIPE.tomato.fertigation[stage]
  computeFertigationSupply,
};
