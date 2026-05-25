// Per-channel contribution function for foliar, extracted from the inline
// foliar slice of calculateNutritionSupply in nutrition/tomato/shell/contribution-orchestrator.js.
// Pure: no DOM reads, no window.* reads.
//
// Returns the per-element supply vector (mg/m²/wk) the foliar channel
// delivers. Macros 0 (foliar = micros-only by design); Ca explicitly 0
// (Spray B retired 2026-05-06). Micros via computeFoliarSupply.
//
// The caller has already resolved:
//   - which recipe array to score (stored A or FP-derived array)
//   - the operator levers (surfactant) from DOM
//   - the REQ-116 mutation of FP_RECIPE_T5.foliar (orchestrator concern;
//      this function consumes the resulting array, doesn't compute it)

// computeFoliarContribution
//   stage              : 'T1'..'T5' (for contract uniformity; stage-invariant today)
//   recipeArray        : label-string array, shape of STORED_RECIPE.tomato.foliaire.A
//                         (entries with .name + .master). FP callers pass the
//                         FP_RECIPE_T5.foliar reshape; stored callers can pass
//                         null and computeFoliarSupplyFunction defaults internally.
//   foliarOpts         : { surfactant } from DOM
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

// REQ-116 — gap-derived FP foliar recipe (pure).
//
// Extracted from the inline FP branch of calculateNutritionSupply in
// shell/contribution-orchestrator.js (Phase 3 of nutrition reorg). Takes pre-computed
// pre-foliar per-element contributions (compost + sidedress + fertigation)
// + weekly demand, builds the per-element residual gap for foliar elements,
// and routes it through computeFoliarRecipeForGap. Returns a fresh recipe
// object shaped for FP_RECIPE_T5.foliar consumption (orchestrator-side
// mutation, not done here).
//
// Inputs (all caller-resolved — no DOM reads, no window.* reads, no
// channel-orchestrator coupling):
//   demand          : per-element { total } map from calculateNutritionDemand
//                     (needs at least the 6 FOLIAR_ELS).
//   compostRelease  : per-element kg/ha/wk map from
//                     CompostContribution.releasePerWeek (or null/missing).
//                     Converted to mg/m²/wk via × 1000.
//   fertigationPre  : per-element mg/m²/wk map for the FP fertigation
//                     channel (only K/Mg/B carry values today).
//   sidedressPre    : per-element mg/m²/wk map for the FP sidedress
//                     channel.
//   foliarOpts      : { surfactant } from DOM (orchestrator already reads
//                     this for the live foliar branch).
//
// Returns: { MnSO4, ZnSO4, Solubore, CuSO4, NaMolybdate, 'FeSO4-7H2O' }
//          (the FP_RECIPE_T5.foliar shape) on success;
//          null when computeFoliarRecipeForGap is unavailable / returns
//          a non-object (caller falls back to the prior literal).
//
// Defensive try/catch dropped (was in shell/contribution-orchestrator.js to guard a window.*
// indirection that no longer exists — both functions live in the same
// script bundle now; fail loudly on real bugs).
const FOLIAR_GAP_ELEMENTS = ['Mn', 'Zn', 'Cu', 'Fe', 'Mo', 'B'];

function deriveFoliarRecipeFromGap({
  demand, compostRelease, fertigationPre, sidedressPre, foliarOpts,
}) {
  if (typeof computeFoliarRecipeForGap !== 'function') return null;
  const gap = {};
  FOLIAR_GAP_ELEMENTS.forEach(function(element) {
    const dem = (demand && demand[element] && demand[element].total) || 0;
    const compostMg = (compostRelease && compostRelease[element] != null)
      ? compostRelease[element] * 1000
      : 0;
    const sdMg   = (sidedressPre   && sidedressPre[element])   || 0;
    const fertMg = (fertigationPre && fertigationPre[element]) || 0;
    gap[element] = Math.max(0, dem - compostMg - sdMg - fertMg);
  });
  const derived = computeFoliarRecipeForGap(gap, foliarOpts || {});
  if (!derived || typeof derived !== 'object') return null;
  return {
    'MnSO4':       derived.MnSO4_g    || 0,
    'ZnSO4':       derived.ZnSO4_g    || 0,
    'CuSO4':       derived.CuSO4_g    || 0,
    'FeSO4-7H2O':  derived.FeSO4_g    || 0,
    'NaMolybdate': derived.NaMoO4_g   || 0,
    'Solubore':    derived.Solubore_g || 0,
  };
}
void deriveFoliarRecipeFromGap;
