// Per-channel contribution function for fertigation, extracted from
// the inline FP/stored slice of calculateNutritionSupply in
// app/admin/nutrition/bilan/tomato.backup/contribution-orchestrator.js. Pure: no DOM reads, no window.* reads,
// no Date.now(). Caller resolves recipeMode + storedFert + fpFertigation
// + multipliers and passes everything explicit.
//
// Returns the per-element supply vector (mg/m²/wk) the fertigation channel
// contributes BEFORE soil/foliar/sidedress aggregation. Non-zero elements:
// K, Mg (soluble cations), Mn, Zn (cation micros, rendered to the drip
// 2026-07-11 after sprays retired), B (Solubore) and Mo (Na molybdate).
// N, P, Ca, Fe, Cu stay 0 — off-channel (see block-5 pourquoi).

// computeFertigationContribution
//   stage           : 'T1'..'T5'
//   recipeMode      : 'fp' | 'stored'
//   storedFert      : { kSulfate, mgSulfate, mnSulfate, znSulfate, borax,
//                      naMolybdate } in grams (total tomato area)
//   fpFertigation   : FP_RECIPE_T5.fertigation snapshot (object with
//                      'K2SO4', 'MgSO4-7H2O', 'Solubore', 'NaMolybdate') — FP mode
//   fpStageRecipe   : computeStageRecipe(stage) snapshot (fallback for non-T5
//                      FP mode), { kSulfate, mgSulfate, mnSulfate, znSulfate,
//                      solubore, naMolybdate } or null
//   multK, multMg   : stored-mode multipliers (getMultK() / getMultMg())
//   area            : tomato bed area m² (= TOMATO_NUMBER_BEDS × TOMATO_BED_AREA)
//   productPct      : PRODUCT_PCT slice with K2SO4_K, MgSO4_Mg, MnSO4_Mn,
//                      ZnSO4_Zn, Solubore_B, NaMoO4_Mo
//
// Returns { K, Mg, Mn, Zn, B, Mo, _raw: { k_g_total, mg_g_total, mn_g_total,
//   zn_g_total, sb_fert_g, mo_g_total } }. Only non-zero elements are keyed
// on the vector; _raw always carries all product grams for the recipe table.
function computeFertigationContribution({
  stage, recipeMode, storedFert, fpFertigation, fpStageRecipe,
  multK, multMg, area, productPct, efficiency,
}) {
  const mode = recipeMode === 'fp' ? 'fp' : 'stored';
  let k_g_total, mg_g_total, mn_g_total, zn_g_total, sb_fert_g, mo_g_total;
  if (mode === 'fp') {
    const fp = fpFertigation || {};
    const stageFp = fpStageRecipe || {};
    if (stage === 'T5') {
      k_g_total  = (fp['K2SO4']      != null) ? fp['K2SO4']      : (stageFp.kSulfate  || 0);
      mg_g_total = (fp['MgSO4-7H2O'] != null) ? fp['MgSO4-7H2O'] : (stageFp.mgSulfate || 0);
      sb_fert_g  = (fp['Solubore']    != null) ? fp['Solubore']    : (stageFp.solubore    || 0);
      mo_g_total = (fp['NaMolybdate'] != null) ? fp['NaMolybdate'] : (stageFp.naMolybdate || 0);
    } else {
      k_g_total  = stageFp.kSulfate  || 0;
      mg_g_total = stageFp.mgSulfate || 0;
      sb_fert_g  = stageFp.solubore    || 0;
      mo_g_total = stageFp.naMolybdate || 0;
    }
    mn_g_total = stageFp.mnSulfate || 0;
    zn_g_total = stageFp.znSulfate || 0;
  } else {
    const sf = storedFert || {};
    k_g_total  = (sf.kSulfate  || 0) * (multK  || 1);
    mg_g_total = (sf.mgSulfate || 0) * (multMg || 1);
    mn_g_total = sf.mnSulfate   || 0;
    zn_g_total = sf.znSulfate   || 0;
    sb_fert_g  = sf.borax       || 0;
    mo_g_total = sf.naMolybdate || 0;
  }
  // Delivered = plant-EFFECTIVE mg/m²/wk: gross barrel mass × channel
  // efficiency (product→bed fraction). K/Mg/B/Mo = 1.0; Mn/Zn = 0.75 at pH 6.5
  // (sulfate-metal loss). Net delivery keeps the gap chain honest — the recipe
  // grosses the micro dose up by 1/efficiency, so net delivery equals the need.
  const channelEfficiency = efficiency || {};
  const deliver = (grams, pct, element) => (grams * pct) / area * 1000 * (channelEfficiency[element] != null ? channelEfficiency[element] : 1);
  const fertK  = deliver(k_g_total,  productPct.K2SO4_K,   'K');
  const fertMg = deliver(mg_g_total, productPct.MgSO4_Mg,  'Mg');
  const fertMn = deliver(mn_g_total, productPct.MnSO4_Mn,  'Mn');
  const fertZn = deliver(zn_g_total, productPct.ZnSO4_Zn,  'Zn');
  const fertB  = deliver(sb_fert_g,  productPct.Solubore_B, 'B');
  const fertMo = deliver(mo_g_total, productPct.NaMoO4_Mo, 'Mo');
  const out = { K: fertK, Mg: fertMg };
  if (fertMn > 0) out.Mn = fertMn;
  if (fertZn > 0) out.Zn = fertZn;
  if (fertB  > 0) out.B  = fertB;
  if (fertMo > 0) out.Mo = fertMo;
  out._raw = { k_g_total, mg_g_total, mn_g_total, zn_g_total, sb_fert_g, mo_g_total };
  return out;
}
void computeFertigationContribution;
