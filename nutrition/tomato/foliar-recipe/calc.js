// Foliar-recipe — delivery function.
//
// Spec:        nutrition/tomato/foliar-recipe/spec.md
// Derivation:  nutrition/tomato/foliar-recipe/derivation.md
//
// REQ-101: delivered_mg/m²/wk = recipe_g × element_pct × 1000 / area
//                              × FOLIAR_COVERAGE_DEFAULT
// REQ-103: namespace exposes this function via window.FoliarRecipeTomato.

// computeFoliarSupply(stage) — per-element delivered mg/m²/wk under the
// coverage discount, reading from STORED_RECIPE.tomato.foliaire (the
// locked operational recipe, /retire-recipe-governed).
//
// `stage` is plumbed for contract-uniformity with sidedress / fertigation
// siblings; the current STORED foliar recipe is stage-invariant by PA
// Taillon design (oligos are tissue-baseline anchored, not yield-scaled).
// A future per-stage spray (e.g. Mn ramp at flowering) can land here
// without changing call sites — read STORED_RECIPE.tomato.foliaire[stage]
// instead of .A when that lands.
//
// Returns the 11-element shape matching TOMATO_FRUIT_EXPORT keys. Macros
// (N / P / K / Ca / Mg) are explicit zeros — see derivation.md "no-macro
// by design". Foliar Ca was Spray B (CaCl₂); retired 2026-05-06.
function computeFoliarSupply(stage) {
  // Stage parameter consumed for contract uniformity; STORED foliar is
  // currently stage-invariant. void(stage) silences linters once a real
  // per-stage path lands.
  void stage;

  const area = TOMATO_NUM_BEDS * TOMATO_BED_AREA;        // 382.9 m²
  const cov = FOLIAR_COVERAGE_DEFAULT;                   // 0.30 (no yucca)

  // Read the locked recipe label-string array. Each entry has shape
  // { name: 'MnSO₄ (31.5% Mn)', master: '22 g', note?: '...' }. Parse
  // the gram value from `master`; the percentage in `name` is for human
  // readability — actual element % comes from PRODUCT_PCT, which is the
  // single source of truth.
  const A = STORED_RECIPE.tomato.foliaire.A || [];
  const parseG = function(s) { return parseFloat(String(s).replace(',', '.')) || 0; };
  const findG = function(substr) {
    const item = A.find(function(x) { return (x.name || '').indexOf(substr) >= 0; });
    return item ? parseG(item.master) : 0;
  };

  const mnSO4_g = findG('MnSO₄');
  const znSO4_g = findG('ZnSO₄');
  const sb_g    = findG('Solubore');     // boric acid; non-ionic
  const cuSO4_g = findG('CuSO₄');
  const moNa_g  = findG('Molybdate');
  const feSO4_g = findG('FeSO₄');         // FeSO₄·7H₂O

  // Per-element delivered mg/m²/wk = (g × element_pct × 1000) / area × coverage.
  // PRODUCT_PCT lives upstream (declared in app/index.html alongside STORED_RECIPE).
  const deliver = function(grams, pct) {
    if (!grams || !pct || !area) return 0;
    return (grams * pct * 1000) / area * cov;
  };

  return {
    // Macros — no foliar channel. See derivation.md "no-macro by design".
    N: 0,
    P: 0,
    K: 0,
    Ca: 0,                                              // Spray B (CaCl₂) retired 2026-05-06
    Mg: 0,
    // Micros — actively delivered under coverage discount.
    Fe: deliver(feSO4_g, PRODUCT_PCT.FeSO4_Fe),         // FeSO₄·7H₂O at 20 % Fe
    Mn: deliver(mnSO4_g, PRODUCT_PCT.MnSO4_Mn),         // 31.5 % Mn
    Zn: deliver(znSO4_g, PRODUCT_PCT.ZnSO4_Zn),         // 35.5 % Zn
    B:  deliver(sb_g,    PRODUCT_PCT.Solubore_B),       // 20.5 % B (boric acid)
    Cu: deliver(cuSO4_g, PRODUCT_PCT.CuSO4_Cu),         // 25 % Cu
    Mo: deliver(moNa_g,  PRODUCT_PCT.NaMoO4_Mo),        // 39.6 % Mo
  };
}
