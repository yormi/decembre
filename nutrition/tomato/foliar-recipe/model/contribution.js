// Per-channel contribution function for foliar, extracted from the inline
// foliar slice of calculateNutritionSupply in nutrition/tomato/shell/supply.js.
// Pure: no DOM reads, no window.* reads.
//
// Returns the per-element supply vector (mg/m²/wk) the foliar channel
// delivers. Macros 0 (foliar = micros-only by design); Ca explicitly 0
// (Spray B retired 2026-05-06). Micros via computeFoliarSupply.
//
// The caller has already resolved:
//   - which recipe array to score (stored A or FP-derived array)
//   - the operator levers (sprayCount, surfactant) from DOM
//   - the REQ-116 mutation of FP_RECIPE_T5.foliar (orchestrator concern;
//      this function consumes the resulting array, doesn't compute it)

// computeFoliarContribution
//   stage              : 'T1'..'T5' (for contract uniformity; stage-invariant today)
//   recipeArray        : label-string array, shape of STORED_RECIPE.tomato.foliaire.A
//                         (entries with .name + .master). FP callers pass the
//                         FP_RECIPE_T5.foliar reshape; stored callers can pass
//                         null and computeFoliarSupplyFunction defaults internally.
//   foliarOpts         : { sprayCount, surfactant } from DOM
//   computeFoliarSupplyFunction : window.FoliarRecipeTomato.computeFoliarSupply
//
// Returns { N, P, K, Ca, Mg, Fe, Mn, Zn, Cu, B, Mo } in mg/m²/wk
// (macros + Ca explicit 0; micros from computeFoliarSupplyFunction).
function computeFoliarContribution({
  stage, recipeArray, foliarOpts, computeFoliarSupplyFunction,
}) {
  const supply = computeFoliarSupplyFunction(stage, foliarOpts || {}, recipeArray || undefined);
  return {
    N: 0, P: 0, K: 0,
    Ca: 0, // Spray B (CaCl₂) retired 2026-05-06
    Mg: 0,
    Mn: supply.Mn, Zn: supply.Zn, B: supply.B,
    Cu: supply.Cu, Mo: supply.Mo, Fe: supply.Fe,
  };
}
void computeFoliarContribution;
