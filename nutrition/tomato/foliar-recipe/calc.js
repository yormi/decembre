// Foliar-recipe — delivery function.
//
// Spec:        nutrition/tomato/foliar-recipe/spec.md
// Derivation:  nutrition/tomato/foliar-recipe/derivation.md
//
// REQ-101: delivered_mg/m²/wk = recipe_g × element_pct × 1000 / area
//                              × coverage_factor × sprayCount
// REQ-103: namespace exposes this function via window.FoliarRecipeTomato.
// REQ-112: opts = { sprayCount = 1, surfactant = false }; sprayCount
//          multiplies delivery linearly (1-3); surfactant=true switches
//          coverage from FOLIAR_COVERAGE_DEFAULT (0.30) to
//          FOLIAR_COVERAGE_WITH_YUCCA (0.80). Optional 3rd arg `recipe`
//          accepts a label-string array (same shape as
//          STORED_RECIPE.tomato.foliaire.A) so FP-mode callers can pass
//          their derived recipe through the same supply formula instead
//          of inlining the arithmetic.

// computeFoliarSupply(stage, opts, recipe) — per-element delivered mg/m²/wk
// under the coverage discount × spray count. By default reads from
// STORED_RECIPE.tomato.foliaire.A (the locked operational recipe,
// /retire-recipe-governed); pass `recipe` to score an alternate
// label-string array (e.g. the FP-derived recipe) through the same
// formula.
//
// `stage` is plumbed for contract-uniformity with sidedress / fertigation
// siblings; the current STORED foliar recipe is stage-invariant by PA
// Taillon design (oligos are tissue-baseline anchored, not yield-scaled).
//
// Returns the 11-element shape matching TOMATO_FRUIT_EXPORT keys. Macros
// (N / P / K / Ca / Mg) are explicit zeros — see derivation.md "no-macro
// by design".
function computeFoliarSupply(stage, opts, recipe) {
  void stage;
  const o = opts || {};
  // Clamp sprayCount to integer 1-3 — UI prevents > 3 but defend at the
  // model boundary too.
  const sprayCount = Math.max(1, Math.min(3, Math.round(Number(o.sprayCount) || 1)));
  const surfactant = !!o.surfactant;

  const area = TOMATO_NUMBER_BEDS * TOMATO_BED_AREA;
  const cov = surfactant ? FOLIAR_COVERAGE_WITH_YUCCA : FOLIAR_COVERAGE_DEFAULT;

  // Read the recipe label-string array. Each entry has shape
  // { name: 'MnSO₄ (31.5% Mn)', master: '22 g', note?: '...' }. Parse
  // the gram value from `master`; the percentage in `name` is for human
  // readability — actual element % comes from PRODUCT_PCT, which is the
  // single source of truth. Default to STORED_RECIPE.tomato.foliaire.A
  // when no recipe is supplied (backwards-compatible with prior
  // two-arg call sites).
  const A = recipe || STORED_RECIPE.tomato.foliaire.A || [];
  const parseG = function(s) { return parseFloat(String(s).replace(',', '.')) || 0; };
  const findG = function(substr) {
    const item = A.find(function(x) { return (x.name || '').indexOf(substr) >= 0; });
    return item ? parseG(item.master) : 0;
  };

  const mnSO4_g = findG('MnSO₄');
  const znSO4_g = findG('ZnSO₄');
  const sb_g    = findG('Solubore');     // boric acid; non-ionic
  const cuSO4_g = findG('CuSO₄');
  const feSO4_g = findG('FeSO₄');         // FeSO₄·7H₂O
  // Mo retired from foliar 2026-05-16 (REQ-061 Mo carve-out — molybdate is
  // anionic, fully available at soil pH 7.4; routes via fertigation instead).
  // Foliar supply returns Mo: 0 regardless of recipe contents.

  // Per-element delivered mg/m²/wk = (g × element_pct × 1000) / area × coverage.
  // PRODUCT_PCT lives upstream (declared in app/index.html alongside STORED_RECIPE).
  const deliver = function(grams, pct) {
    if (!grams || !pct || !area) return 0;
    return (grams * pct * 1000) / area * cov * sprayCount;
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
    Mo: 0,                                              // Mo retired from foliar (REQ-061 carve-out 2026-05-16) — routes via fertigation
  };
}

// REQ-115 — gap-maximizing recipe derivation. Inputs:
//   gap[element] : per-element residual mg/m²/wk (after compost + sidedress
//             + fertigation; only foliar elements matter).
//   opts    : { sprayCount = 1, surfactant = false }.
// Returns: { MnSO4_g, ZnSO4_g, CuSO4_g, FeSO4_g, NaMoO4_g, Solubore_g }
//          per 15 L master tank.
//
// Algorithm: per-element ideal_g sized to close the gap; min-dose floor
// (< 0.5 g → 0); cap at burnCapG(element); then CE-cap-and-scale
// loop (max 4 iterations) to keep predictedCE under REQ-025 burn cap.
//
// REQ-116 — consumers call this with the live gap chain, replacing the
// previously-pinned FP_RECIPE_T5.foliaire literal.
function computeFoliarRecipeForGap(gap, opts) {
  const o = opts || {};
  const sprayCount = Math.max(1, Math.min(3, Math.round(Number(o.sprayCount) || 1)));
  const surfactant = !!o.surfactant;
  const coverage = surfactant ? FOLIAR_COVERAGE_WITH_YUCCA : FOLIAR_COVERAGE_DEFAULT;
  const area = TOMATO_NUMBER_BEDS * TOMATO_BED_AREA;

  // Foliar elements + product / pct table. Mo dropped 2026-05-16 (REQ-061
  // carve-out — Mo routes via fertigation now). NaMoO4_g stays in the return
  // shape (always 0) for downstream consumer compatibility (FP_RECIPE_T5.foliar).
  const PRODUCTS = [
    { element: 'Mn', key: 'MnSO4_g',    pct: PRODUCT_PCT.MnSO4_Mn },
    { element: 'Zn', key: 'ZnSO4_g',    pct: PRODUCT_PCT.ZnSO4_Zn },
    { element: 'Cu', key: 'CuSO4_g',    pct: PRODUCT_PCT.CuSO4_Cu },
    { element: 'Fe', key: 'FeSO4_g',    pct: PRODUCT_PCT.FeSO4_Fe },
    { element: 'B',  key: 'Solubore_g', pct: PRODUCT_PCT.Solubore_B },
  ];
  const MIN_DOSE_G = 0.5;
  const ceilToHalfGram = function(x) { return Math.ceil(x * 2) / 2; };

  // Step 1: per-element ideal_g → min-dose floor → burn cap.
  const recipe = { MnSO4_g: 0, ZnSO4_g: 0, CuSO4_g: 0, FeSO4_g: 0, NaMoO4_g: 0, Solubore_g: 0 };
  for (var i = 0; i < PRODUCTS.length; i++) {
    var p = PRODUCTS[i];
    var g = (gap && gap[p.element]) || 0;
    if (g <= 0 || !p.pct || !area) { recipe[p.key] = 0; continue; }
    var idealG = (g * area) / (p.pct * 1000 * coverage * sprayCount);
    if (idealG < MIN_DOSE_G) { recipe[p.key] = 0; continue; }
    var capG = burnCapG(p.element);
    var doseG = Math.min(idealG, capG);
    recipe[p.key] = ceilToHalfGram(doseG);
  }

  // Step 2: CE-cap-and-scale loop. Compute predictedCE for the recipe
  // shaped as STORED_RECIPE.tomato.foliaire.A would be (label-string
  // array), then if over-cap, scale all non-zero doses proportionally,
  // re-round, retry. Bound at 4 iterations.
  function recipeAsLabelArray(r) {
    return [
      { name: 'MnSO₄ (31,5 % Mn)',     master: r.MnSO4_g + ' g' },
      { name: 'ZnSO₄ (35,5 % Zn)',     master: r.ZnSO4_g + ' g' },
      { name: 'CuSO₄ (25 % Cu)',       master: r.CuSO4_g + ' g' },
      { name: 'FeSO₄·7H₂O (20 % Fe)',  master: r.FeSO4_g + ' g' },
      { name: 'NaMolybdate (39,6 % Mo)', master: r.NaMoO4_g + ' g' },
      { name: 'Solubore (20,5 % B)',   master: r.Solubore_g + ' g' },
    ];
  }
  var BURN_CE_CAP = 10.0;            // REQ-025 tomato leaf burn cap
  var TARGET_CE = BURN_CE_CAP * 0.95; // 5 % safety margin
  for (var iter = 0; iter < 4; iter++) {
    if (typeof predictedCE !== 'function') break;
    var ce = predictedCE(recipeAsLabelArray(recipe), 1.0);
    if (!isFinite(ce) || ce <= TARGET_CE) break;
    var scale = TARGET_CE / ce;
    for (var k in recipe) {
      if (recipe[k] > 0) {
        recipe[k] = ceilToHalfGram(recipe[k] * scale);
      }
    }
  }

  return recipe;
}
