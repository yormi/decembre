// Per-channel contribution function for fertigation, extracted from
// the inline FP/stored slice of calculateNutritionSupply in
// nutrition/tomato/shell/contribution-orchestrator.js. Pure: no DOM reads, no window.* reads,
// no Date.now(). Caller resolves recipeMode + storedFert + fpFertigation
// + multipliers and passes everything explicit.
//
// Returns the per-element supply vector (mg/m²/wk) the fertigation channel
// contributes BEFORE soil/foliar/sidedress aggregation. Only K, Mg, B are
// non-zero today (per fertigation channel scope); other elements 0.

// computeFertigationContribution
//   stage           : 'T1'..'T5'
//   recipeMode      : 'fp' | 'stored'
//   storedFert      : { kSulfate, mgSulfate } in grams (total tomato area)
//   fpFertigation   : FP_RECIPE_T5.fertigation snapshot (object with
//                      'K2SO4', 'MgSO4-7H2O', 'Solubore') — used in FP mode
//   fpStageRecipe   : computeStageRecipe(stage) snapshot (fallback for non-T5
//                      FP mode), { kSulfate, mgSulfate } or null
//   multK, multMg   : stored-mode multipliers (getMultK() / getMultMg())
//   area            : tomato bed area m² (= TOMATO_NUMBER_BEDS × TOMATO_BED_AREA)
//   productPct      : PRODUCT_PCT slice with K2SO4_K, MgSO4_Mg, Solubore_B
//
// Returns { K, Mg, B, _raw: { k_g_total, mg_g_total, sb_fert_g } }.
function computeFertigationContribution({
  stage, recipeMode, storedFert, fpFertigation, fpStageRecipe,
  multK, multMg, area, productPct,
}) {
  const mode = recipeMode === 'fp' ? 'fp' : 'stored';
  let k_g_total, mg_g_total;
  if (mode === 'fp') {
    const fp = fpFertigation || {};
    const stageFp = fpStageRecipe || { mgSulfate: 0, kSulfate: 0 };
    if (stage === 'T5') {
      k_g_total  = (fp['K2SO4']      != null) ? fp['K2SO4']      : stageFp.kSulfate;
      mg_g_total = (fp['MgSO4-7H2O'] != null) ? fp['MgSO4-7H2O'] : stageFp.mgSulfate;
    } else {
      k_g_total  = stageFp.kSulfate;
      mg_g_total = stageFp.mgSulfate;
    }
  } else {
    const sf = storedFert || { kSulfate: 0, mgSulfate: 0 };
    k_g_total  = sf.kSulfate  * (multK  || 1);
    mg_g_total = sf.mgSulfate * (multMg || 1);
  }
  const fertK  = (k_g_total  * productPct.K2SO4_K)  / area * 1000;
  const fertMg = (mg_g_total * productPct.MgSO4_Mg) / area * 1000;
  // Boric acid (Solubore) — FP only, single-channel for B (replenishment-cascade-earliest-first).
  const sb_fert_g = (mode === 'fp' && fpFertigation) ? (fpFertigation['Solubore'] || 0) : 0;
  const fertB = (sb_fert_g * productPct.Solubore_B) / area * 1000;
  const out = { K: fertK, Mg: fertMg };
  if (fertB > 0) out.B = fertB;
  out._raw = { k_g_total, mg_g_total, sb_fert_g };
  return out;
}
void computeFertigationContribution;
