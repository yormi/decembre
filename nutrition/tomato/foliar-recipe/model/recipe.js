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
  const sb_g    = findG('Solubore');     // disodium octaborate tetrahydrate (Na₂B₈O₁₃·4H₂O); non-ionic in solution
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
    B:  deliver(sb_g,    PRODUCT_PCT.Solubore_B),       // 20.5 % B (disodium octaborate tetrahydrate)
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
  const ceilToHalfGram = function(x) { return Math.ceil(x * 2) / 2; };

  // Step 1: per-element ideal_g → per-element min-dose floor → burn cap.
  // Per-element floors live in MIN_DOSE_G_PER_ELEMENT (data.js); Cu's 0.2 g
  // is the load-bearing case (narrow toxicity makes a 0.5 g uniform floor
  // a guaranteed luxury-cap violation when ideal_g lands in 0.2-0.5 g).
  // Luxury-cap guard: if floor-clamped delivery > 1.3× the gap, drop to 0
  // — catches the edge case where even the per-element floor is too coarse
  // (e.g. Cu gap so small that 0.2 g still over-feeds).
  const recipe = { MnSO4_g: 0, ZnSO4_g: 0, CuSO4_g: 0, FeSO4_g: 0, NaMoO4_g: 0, Solubore_g: 0 };
  for (var i = 0; i < PRODUCTS.length; i++) {
    var p = PRODUCTS[i];
    var g = (gap && gap[p.element]) || 0;
    if (g <= 0 || !p.pct || !area) { recipe[p.key] = 0; continue; }
    var idealG = (g * area) / (p.pct * 1000 * coverage * sprayCount);
    var minDoseG = (MIN_DOSE_G_PER_ELEMENT[p.element] != null)
                 ? MIN_DOSE_G_PER_ELEMENT[p.element]
                 : 0.5;
    if (idealG < minDoseG) {
      recipe[p.key] = 0;
      continue;
    }
    var capG = burnCapG(p.element);
    var doseG = Math.min(idealG, capG);
    var roundedDoseG = ceilToHalfGram(doseG);
    // Luxury-cap guard: floor-rounded doses can over-shoot the gap by more
    // than 1.3× for tiny-demand elements (Cu the load-bearing case).
    // Convert rounded dose back to delivered mg/m²/wk and compare to gap.
    var deliveredFromDose = (roundedDoseG * p.pct * 1000 / area) * coverage * sprayCount;
    if (deliveredFromDose > 1.3 * g) {
      recipe[p.key] = 0;
      continue;
    }
    recipe[p.key] = roundedDoseG;
  }

  // Step 2: drop-highest-CE-contributor-first loop. Per-iteration: if
  // predicted CE > target, identify the recipe element whose alone-in-tank
  // CE contribution is largest, halve its dose (or drop to 0 if halving
  // would put it below its per-element min-dose floor). Preserves
  // pH-locked micros (Mn / Cu / B) when Fe (mass-dominant) drives CE
  // excess — proportional scaling would have stripped the small elements
  // first via their min-dose floors. Bound at 4 iterations.
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
  // Per-element CE contribution: re-run predictedCE with only that element
  // non-zero, returns the per-element CE share.
  function ceContributionForKey(r, key) {
    if (typeof predictedCE !== 'function') return 0;
    var solo = { MnSO4_g: 0, ZnSO4_g: 0, CuSO4_g: 0, FeSO4_g: 0, NaMoO4_g: 0, Solubore_g: 0 };
    solo[key] = r[key];
    var ceValue = predictedCE(recipeAsLabelArray(solo), 1.0);
    return isFinite(ceValue) ? ceValue : 0;
  }
  // Map recipe-key → element so we can read the per-element floor when
  // halving. NaMoO4_g maps to Mo even though Mo is zeroed out by REQ-061
  // carve-out — keeps the lookup uniform if Mo returns.
  var KEY_TO_ELEMENT = {
    MnSO4_g: 'Mn', ZnSO4_g: 'Zn', CuSO4_g: 'Cu',
    FeSO4_g: 'Fe', NaMoO4_g: 'Mo', Solubore_g: 'B',
  };
  var BURN_CE_CAP = 10.0;            // REQ-025 tomato leaf burn cap
  var TARGET_CE = BURN_CE_CAP * 0.95; // 5 % safety margin
  for (var iter = 0; iter < 4; iter++) {
    if (typeof predictedCE !== 'function') break;
    var ce = predictedCE(recipeAsLabelArray(recipe), 1.0);
    if (!isFinite(ce) || ce <= TARGET_CE) break;
    // Find highest-CE-contributor among non-zero doses.
    var topKey = null;
    var topCe = -Infinity;
    for (var k in recipe) {
      if (recipe[k] > 0) {
        var c = ceContributionForKey(recipe, k);
        if (c > topCe) { topCe = c; topKey = k; }
      }
    }
    if (!topKey) break;  // nothing to reduce
    // Halve the top contributor; if halving would put it below its
    // per-element min-dose floor, drop to 0.
    var halvedG = ceilToHalfGram(recipe[topKey] / 2);
    var floorG = MIN_DOSE_G_PER_ELEMENT[KEY_TO_ELEMENT[topKey]] || 0.5;
    if (halvedG < floorG) {
      recipe[topKey] = 0;
    } else {
      recipe[topKey] = halvedG;
    }
  }

  return recipe;
}

// Browser-globals export
// Public API for the tomate foliar-recipe model.
//
// Spec:    nutrition/tomato/foliar-recipe/spec.md
// REQ-103: this namespace exists at runtime with the keys below.
//
// Consumers (Bilan supply chain via calculateNutritionSupply, future yucca-decision
// drift gauge) should reach for
// `window.FoliarRecipeTomato` instead of the bare constants — the
// internal coverage model + recipe parsing can then be reshaped (yucca
// on/off, per-stage doses, B back to foliar) without breaking call sites.
window.FoliarRecipeTomato = {
  // Tomato bed area used for per-m² conversion. Live value re-read each
  // call so a future bed-reconfiguration through TOMATO_NUMBER_BEDS /
  // TOMATO_BED_AREA flows here automatically.
  get AREA_M2() { return TOMATO_NUMBER_BEDS * TOMATO_BED_AREA; },
  // Coverage % without surfactant (REQ-101 default). 0.30, cert 3.
  FOLIAR_COVERAGE_DEFAULT:    FOLIAR_COVERAGE_DEFAULT,
  // Coverage % with yucca (cert 3). Consumed when surfactant=true.
  FOLIAR_COVERAGE_WITH_YUCCA: FOLIAR_COVERAGE_WITH_YUCCA,
  // Per-element efficiency (REQ-157) — default-regime map (surfactant=false).
  // Cert 3. Returns 0.27 uniform for Mn/Zn/Cu/Fe; B absent (single-channel
  // via fertigation, REQ-061); Mo absent (retired from foliar 2026-05-16,
  // REQ-061 carve-out). Caller-friendly for code that doesn't thread the
  // surfactant lever.
  efficiency:                 FOLIAR_EFFICIENCY_AT_CURRENT_CONDITIONS,
  // REQ-170 — surfactant-aware efficiency. Function returning the
  // per-element map; surfactant=true flips coverage 0.30 → 0.80 → uniform
  // value 0.27 → 0.72 across Mn/Zn/Cu/Fe. Cert 3. Consumers that thread
  // the Block 5 surfactant lever call this; static .efficiency stays for
  // back-compat with the default regime.
  efficiencyFor:              foliarEfficiency,
  // REQ-115 — per-element burn cap base (g per 15 L master tank). Cert 3 for
  // Mn/Zn/Fe/Mo/B (extension mid-band); cert 2 for Cu (Décembre-internal,
  // non-transferable).
  BURN_CAP_BASE_G,
  // REQ-115 — per-element burn cap (surfactant has no effect; see learnings.md).
  burnCapG,
  // REQ-115 — per-element min-dose floor map (g per 15 L master tank).
  // Cu's 0.2 g is the load-bearing case (narrow toxicity); others at 0.5 g.
  MIN_DOSE_G_PER_ELEMENT,
  // Delivery function (REQ-101 + REQ-103 + REQ-112).
  computeFoliarSupply,
  // REQ-115 / REQ-116 — gap-maximizing recipe derivation.
  computeFoliarRecipeForGap,
};
