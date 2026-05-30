// Chemistry — precipitation pairs, tag incompatibilities, mix order, plus the
// load-time coverage-validation IIFE (product-declares-ions-and-chemistry-tags /
// every-cation-anion-pair-classified / every-chemistry-tag-classified). Reads PRODUCT from sibling
// products.js. Carved out of nutrition/tomato/lib/recipe-math.js 2026-05-23
// (Phase 2 chemistry pull-up).

// in-tank-ksp-precipitation-guard — Cation × anion precipitation pairs.
// Threshold = combined ion mass (g/L) above which gypsum/phosphate/etc forms.
// Note: most pairs we list here involve PO4-3 and OH- which don't appear in
// our active product `ions` decls — they're documented as guidance for future
// products that introduce them. Coverage check (every-cation-anion-pair-classified) only enumerates
// pairs from product-declared ions.
const KSP_PAIRS = [
  { cation: 'Ca2+', anion: 'PO4-3', threshold_g_per_L_combined: 0.001, cert: 5,
    note: 'precipitates near zero; never co-mix Ca + foliar P' },
  { cation: 'Ca2+', anion: 'SO4-2', threshold_g_per_L_combined: 2.4, cert: 4,
    note: 'gypsum at high concentration; relevant Spray A × Spray B if mixed' },
  { cation: 'Mg2+', anion: 'PO4-3', threshold_g_per_L_combined: 0.5, cert: 3,
    note: 'rare in our recipes' },
  { cation: 'Fe2+', anion: 'PO4-3', threshold_g_per_L_combined: 0.01, cert: 4,
    note: 'low Ksp → most fertigated FeSO₄ + P → FePO₄' },
  { cation: 'Fe2+', anion: 'OH-', threshold_function_of_pH: function(ph) { return ph > 6.5 ? 0 : Infinity; }, cert: 4,
    note: 'Fe(OH)₂ above pH 6.5; stock barrel pH drift, foliar tank pH' },
  { cation: 'Mn2+', anion: 'OH-', threshold_function_of_pH: function(ph) { return ph > 8.0 ? 0 : Infinity; }, cert: 3,
    note: 'Mn(OH)₂ above pH 8; rare in tanks, relevant in soil' },
];

// every-cation-anion-pair-classified — Pairs from product-declared ions explicitly known not to
// precipitate in our tank conditions. Coverage requirement: every cation ×
// anion combination from the union of PRODUCT[*].ions must appear here OR
// in KSP_PAIRS. Generated from the cartesian product enumerated below.
//
// Cations declared: K+, Mg2+, Fe2+, Mn2+, Zn2+, Cu2+, Ca2+, Na+, NH4+, H+
// Anions declared:  SO4-2, Cl-, B(OH)4-, MoO4-2, organic-matrix
const KSP_SAFE = [
  // K+ × all
  { cation: 'K+', anion: 'SO4-2', reason: 'highly soluble (K₂SO₄ to ~120 g/L)' },
  { cation: 'K+', anion: 'Cl-', reason: 'KCl highly soluble' },
  { cation: 'K+', anion: 'B(OH)4-', reason: 'K-borate soluble' },
  { cation: 'K+', anion: 'MoO4-2', reason: 'K-molybdate soluble' },
  { cation: 'K+', anion: 'organic-matrix', reason: 'organic carrier, no co-dissolution mineral chemistry' },
  // Mg2+ × all
  { cation: 'Mg2+', anion: 'SO4-2', reason: 'MgSO₄ soluble to ~700 g/L' },
  { cation: 'Mg2+', anion: 'Cl-', reason: 'MgCl₂ very soluble' },
  { cation: 'Mg2+', anion: 'B(OH)4-', reason: 'Mg-borate soluble at low conc' },
  { cation: 'Mg2+', anion: 'MoO4-2', reason: 'Mg-molybdate soluble' },
  { cation: 'Mg2+', anion: 'organic-matrix', reason: 'organic carrier inert' },
  // Fe2+ × all (excluding OH-/PO4-3 which are in KSP_PAIRS but not declared in ions)
  { cation: 'Fe2+', anion: 'SO4-2', reason: 'FeSO₄ soluble to ~290 g/L; Fe²⁺ oxidation is the failure mode (stock-barrel-time-stability), not precipitation' },
  { cation: 'Fe2+', anion: 'Cl-', reason: 'FeCl₂ soluble' },
  { cation: 'Fe2+', anion: 'B(OH)4-', reason: 'low risk at our concs' },
  { cation: 'Fe2+', anion: 'MoO4-2', reason: 'low risk at trace Mo' },
  { cation: 'Fe2+', anion: 'organic-matrix', reason: 'organic carrier inert' },
  // Mn2+ × all
  { cation: 'Mn2+', anion: 'SO4-2', reason: 'MnSO₄ soluble to ~520 g/L' },
  { cation: 'Mn2+', anion: 'Cl-', reason: 'MnCl₂ soluble' },
  { cation: 'Mn2+', anion: 'B(OH)4-', reason: 'low risk at our concs' },
  { cation: 'Mn2+', anion: 'MoO4-2', reason: 'low risk at trace Mo' },
  { cation: 'Mn2+', anion: 'organic-matrix', reason: 'inert' },
  // Zn2+ × all
  { cation: 'Zn2+', anion: 'SO4-2', reason: 'ZnSO₄ soluble to ~580 g/L' },
  { cation: 'Zn2+', anion: 'Cl-', reason: 'ZnCl₂ very soluble' },
  { cation: 'Zn2+', anion: 'B(OH)4-', reason: 'low risk' },
  { cation: 'Zn2+', anion: 'MoO4-2', reason: 'low risk' },
  { cation: 'Zn2+', anion: 'organic-matrix', reason: 'inert' },
  // Cu2+ × all (KSP_PAIRS handles Cu-protein-gel via tags, not Ksp)
  { cation: 'Cu2+', anion: 'SO4-2', reason: 'CuSO₄ soluble to ~320 g/L' },
  { cation: 'Cu2+', anion: 'Cl-', reason: 'CuCl₂ soluble' },
  { cation: 'Cu2+', anion: 'B(OH)4-', reason: 'low risk' },
  { cation: 'Cu2+', anion: 'MoO4-2', reason: 'low risk' },
  { cation: 'Cu2+', anion: 'organic-matrix', reason: 'inert; Cu-protein gel handled by TAG_INCOMPATIBILITIES' },
  // Ca2+ × all (Ca × SO4-2 listed in KSP_PAIRS; Ca × PO4-3 not in our product ions)
  { cation: 'Ca2+', anion: 'Cl-', reason: 'CaCl₂ soluble to ~740 g/L' },
  { cation: 'Ca2+', anion: 'B(OH)4-', reason: 'low risk at trace B' },
  { cation: 'Ca2+', anion: 'MoO4-2', reason: 'CaMoO₄ low solubility but trace Mo levels keep us safe' },
  { cation: 'Ca2+', anion: 'organic-matrix', reason: 'inert' },
  // (Ca2+ × SO4-2 in KSP_PAIRS — gypsum)
  // Na+ × all
  { cation: 'Na+', anion: 'SO4-2', reason: 'Na₂SO₄ soluble' },
  { cation: 'Na+', anion: 'Cl-', reason: 'NaCl soluble' },
  { cation: 'Na+', anion: 'B(OH)4-', reason: 'Na-borate (Solubore source) soluble' },
  { cation: 'Na+', anion: 'MoO4-2', reason: 'Na-molybdate soluble' },
  { cation: 'Na+', anion: 'organic-matrix', reason: 'inert' },
  // NH4+ × all
  { cation: 'NH4+', anion: 'SO4-2', reason: '(NH₄)₂SO₄ soluble' },
  { cation: 'NH4+', anion: 'Cl-', reason: 'NH₄Cl soluble' },
  { cation: 'NH4+', anion: 'B(OH)4-', reason: 'soluble' },
  { cation: 'NH4+', anion: 'MoO4-2', reason: 'soluble' },
  { cation: 'NH4+', anion: 'organic-matrix', reason: 'inert (organic-N carriers)' },
  // H+ × all (only from elemental sulfur token; trace)
  { cation: 'H+', anion: 'SO4-2', reason: 'H₂SO₄ fully dissociated' },
  { cation: 'H+', anion: 'Cl-', reason: 'HCl fully dissociated' },
  { cation: 'H+', anion: 'B(OH)4-', reason: 'boric acid stable' },
  { cation: 'H+', anion: 'MoO4-2', reason: 'molybdic acid stable at trace' },
  { cation: 'H+', anion: 'organic-matrix', reason: 'inert' },
];

// every-chemistry-tag-classified — Tag interaction rules.
// Forbidden combinations + reasons (cert per row).
const TAG_INCOMPATIBILITIES = [
  { tags: ['free-Cu2+', 'protein-hydrolysate'], severity: 'forbidden',
    reason: 'Cu-protein gel — bouchage de buse', cert: 4 },
  { tags: ['chelate-Fe', 'free-Cu2+'], severity: 'forbidden',
    reason: 'ligand swap — Fe falls out of chelate', cert: 4 },
  { tags: ['chelate-Fe', 'chelate-Cu'], severity: 'caution',
    reason: 'ligand competition between chelates; separate barrels preferred', cert: 3 },
  { tags: ['live-microbial', 'transition-metal-sulfate'], severity: 'caution',
    reason: 'high metal sulfate concentration may suppress microbes', cert: 2 },
];

// every-chemistry-tag-classified — Tags with no known incompatibility, classified as inert.
// Every distinct tag in any PRODUCT[*].chemistryTags must appear here or in
// TAG_INCOMPATIBILITIES.
const TAGS_INERT = {
  'sulfate':                   'no known interaction with anions in our recipes; gypsum/Fe-PO₄ etc are pair-level (Ksp) not tag-level',
  'chloride':                  'soluble with all our cations',
  'free-K+':                   'no precipitation pairs in our recipes',
  'free-Mg2+':                 'no precipitation pairs in our recipes',
  'free-Fe2+':                 'oxidation handled by maximumStableHours; precipitation by Ksp pairs',
  'free-Mn2+':                 'no precipitation pairs in our active recipes',
  'free-Zn2+':                 'no precipitation pairs in our active recipes',
  'free-Cu2+':                 'precipitation pairs handled by TAG_INCOMPATIBILITIES (Cu-protein) and separate-spray rules',
  'free-Ca2+':                 'Ca×SO₄ handled by Ksp; Ca×Cl is soluble',
  'free-Na+':                  'soluble with everything',
  'transition-metal-sulfate':  'class label; per-metal interactions covered by sulfate-metal phClass and Ksp',
  'borate':                    'B(OH)₄⁻ fully soluble; non-ionic in soil',
  'non-ionic-soil':            'soil pH does not gate availability',
  'molybdate':                 'soluble; trace amounts keep Ksp safe',
  'organic-matrix':            'organic carrier; not in mineral Ksp chemistry',
  'protein-hydrolysate':       'incompatibility handled by TAG_INCOMPATIBILITIES (Cu)',
  'live-microbial':            'caution combo with high metal sulfates handled in TAG_INCOMPATIBILITIES',
  'biostimulant':              'no known mineral interaction',
  'solid-granular':            'not in tank; bypasses all tank chemistry checks',
  'pH-amendment':              'used standalone in soil; no tank chemistry',
};

// ─── INCOMPATIBLE_RECIPES — recipes that must never be mixed in the same tank ──
//
// incompatible-recipes-declared. Audit-trail for known incompatibilities. Empty in current state
// because Spray B (CaCl₂) was retired 2026-05-06 — that was the only
// incompatibility in active use (CaCl₂ + Fe-EDDHA → Fe-Cl precipitation /
// ligand swap; CaCl₂ + Spray A sulfates → CaSO₄ gypsum at high conc).
//
// If a future recipe is added that conflicts with an existing one, append
// here with the failure mode. The verifier (incompatible-recipes-declared) asserts this constant
// is declared and that each entry has {recipes: [≥2], reason: string}.
// Day-to-day enforcement is by the team reading this list.
const INCOMPATIBLE_RECIPES = [
  // Historical example (kept as documentation, commented out — does not count
  // toward verifier coverage since Spray B is retired):
  // {
  //   recipes: ['STORED_RECIPE.tomato.foliaire.A', 'STORED_RECIPE.tomato.foliaire.B (retired)'],
  //   reason: 'Fe-EDDHA in Spray A + CaCl₂ in Spray B → Ca-Fe precipitation, Fe-Cl insoluble compounds. Spray B retired 2026-05-06.',
  // },
];

// ─── MIX_ORDER — order to add products to each multi-product recipe ─────
//
// mix-order-per-multi-product-recipe. Order matters for two reasons:
//   1. Solubility: K₂SO₄ has low cold solubility (~120 g/L). Add first to
//      hot water; adding it after other salts can drop tank pH or cause
//      precipitation of K-containing complexes.
//   2. Stability: FeSO₄ oxidizes quickly in air (Fe²⁺ → Fe³⁺ within hours
//      — see PRODUCT['FeSO4-7H2O'].maximumStableHours = 4). Add LAST, just
//      before sealing the spray container.
//
// Verifier schema (mix-order-per-multi-product-recipe): array of { recipe: string, order: [productName, ...] }.
// Product names match PRODUCT keys.
const MIX_ORDER = [
  { recipe: 'fertigation.tomato',
    order: ['K2SO4', 'MgSO4-7H2O'] },
  // Spray A (Mn/Zn/B/Cu/Mo/Fe — no surfactant since 2026-05-06 yucca drop).
  // FeSO₄-7H₂O added last (oxidation) per maximumStableHours=4 on the product.
  { recipe: 'foliar.tomato.A',
    order: ['MnSO4', 'ZnSO4', 'Solubore', 'CuSO4', 'NaMolybdate', 'FeSO4-7H2O'] },
  // Lettuce production fertigation (K + Mg + Fe maintenance).
  { recipe: 'fertigation.lettuce',
    order: ['K2SO4', 'MgSO4-7H2O', 'FeSO4-7H2O'] },
];

// ─── Coverage / sanity checks for product-declares-ions-and-chemistry-tags /
// every-cation-anion-pair-classified / every-chemistry-tag-classified ───
// These run at script load time and console.warn if any product in PRODUCT
// has missing ions/tags, or any ion pair / tag is unclassified.
(function validatePhase1ModelCoverage() {
  try {
    const cations = new Set();
    const anions = new Set();
    const tags = new Set();
    const cationList = ['K+', 'Mg2+', 'Fe2+', 'Mn2+', 'Zn2+', 'Cu2+', 'Ca2+', 'Na+', 'NH4+', 'H+'];
    const anionList = ['SO4-2', 'Cl-', 'B(OH)4-', 'MoO4-2', 'organic-matrix', 'PO4-3', 'OH-', 'NO3-'];
    Object.keys(PRODUCT).forEach(function(name) {
      const p = PRODUCT[name];
      if (!p.ions || Object.keys(p.ions).length === 0) console.warn('[Phase1] missing ions:', name);
      if (!p.chemistryTags || p.chemistryTags.length === 0) console.warn('[Phase1] missing tags:', name);
      Object.keys(p.ions || {}).forEach(function(ion) {
        if (cationList.indexOf(ion) >= 0) cations.add(ion);
        else if (anionList.indexOf(ion) >= 0) anions.add(ion);
      });
      (p.chemistryTags || []).forEach(function(t) { tags.add(t); });
    });
    // every-cation-anion-pair-classified: every cation × anion pair from declared ions must appear in KSP_PAIRS or KSP_SAFE
    const safeKey = function(c, a) { return c + '|' + a; };
    const safeSet = new Set();
    KSP_SAFE.forEach(function(s) { safeSet.add(safeKey(s.cation, s.anion)); });
    KSP_PAIRS.forEach(function(s) { safeSet.add(safeKey(s.cation, s.anion)); });
    cations.forEach(function(c) {
      anions.forEach(function(a) {
        if (!safeSet.has(safeKey(c, a))) console.warn('[Phase1] unclassified pair:', c, '×', a);
      });
    });
    // every-chemistry-tag-classified: every tag must appear in TAG_INCOMPATIBILITIES or TAGS_INERT
    const tagsInIncomp = new Set();
    TAG_INCOMPATIBILITIES.forEach(function(r) { (r.tags || []).forEach(function(t) { tagsInIncomp.add(t); }); });
    tags.forEach(function(t) {
      if (!tagsInIncomp.has(t) && !TAGS_INERT[t]) console.warn('[Phase1] unclassified tag:', t);
    });
  } catch (e) { console.warn('[Phase1] coverage check failed:', e); }
})();

// Browser-globals export
window.NutritionCompatibility = {
  KSP_PAIRS, KSP_SAFE, TAG_INCOMPATIBILITIES, TAGS_INERT,
  MIX_ORDER, INCOMPATIBLE_RECIPES,
};
