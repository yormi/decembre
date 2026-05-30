// Sidedress-recipe — first-principles derivation function.
//
// Spec:        nutrition/tomato/sidedress-recipe/spec.md
// Derivation:  nutrition/tomato/sidedress-recipe/derivation.md
//
// mass-balance-sizes-product-to-n-gap: g_per_planche sized to the N gap left after compost residual.
// ca-aware-product-gate: chosen product must have ca_pct === 0.

// computeStageSidedress(stage, product = 'FarinePlumes') — N-only mass-balance.
//   N_offtake_mg/m²/wk = TOMATO_FRUIT_EXPORT.N × stageYield × 1000 + BIOMASS_DEMAND[stage].N
//   N_compost_mg/m²/wk = window.CompostContribution.releasePerWeek.N × 1000
//   N_needed           = max(0, N_offtake − N_compost)
//   g_per_m²           = N_needed / (product.n_pct × product.efficiency) / 1000
//   g_per_planche      = round(g_per_m² × SIDEDRESS_AREA_PER_PLANCHE)
//
// `product` must be a key of SIDEDRESS_PRODUCTS whose ca_pct === 0
// (ca-aware-product-gate). Passing a Ca-bearing product (e.g. 'Actisol' while
// soil is Ca-saturated) makes the function fall back to all-zeros — the gate
// closes silently rather than throws, so the bank-trajectory display can still
// render with a warning rather than crashing.
//
// Returns flat shape:
//   { actisol_g, farine_g, alfalfa_g, chosen, g_per_planche }
// where `chosen` is the product key, `g_per_planche` is the dose for the
// chosen product, and the per-product fields hold 0 for unselected products.
// Flat fields preserve backwards-compat with callers reading
// `recipe.actisol_g` / `recipe.farine_g`. `chosen` is what the ca-aware-product-gate verifier reads.
function computeStageSidedress(stage, product) {
  const chosen = product || 'FarinePlumes';
  const empty  = { actisol_g: 0, farine_g: 0, alfalfa_g: 0, chosen, g_per_planche: 0 };

  const spec = SIDEDRESS_PRODUCTS[chosen];
  // Ca-aware gate (ca-aware-product-gate). Caller cannot bypass — a Ca-bearing product
  // returns all-zeros even if explicitly requested. Soil is Ca-saturated
  // (10 989 kg/ha tomato per Berger Apr 2026); adding Ca extends the pH crisis.
  if (!spec || (spec.ca_pct || 0) > 0) {
    return empty;
  }

  const y = RECIPE_INPUTS.stageYield[stage] || 0;
  const biomass = BIOMASS_DEMAND[stage] || {};
  const compost = window.CompostContribution.releasePerWeek;

  const n_offtake_mg = (TOMATO_FRUIT_EXPORT.N.g * 1000 * y) + (biomass.N || 0);
  const n_compost_mg = (compost.N || 0) * 1000;
  const n_needed_mg_per_m2 = Math.max(0, n_offtake_mg - n_compost_mg);

  const g_per_m2      = n_needed_mg_per_m2 / (spec.n_pct * spec.efficiency) / 1000;
  const g_per_planche = Math.round(g_per_m2 * SIDEDRESS_AREA_PER_PLANCHE);

  // Flat shape: per-product fields named after the product key (lowercased
  // legacy aliases for actisol / farine to keep additionFor consumers happy).
  const out = { actisol_g: 0, farine_g: 0, alfalfa_g: 0, chosen, g_per_planche };
  if (chosen === 'Actisol')      out.actisol_g = g_per_planche;
  else if (chosen === 'FarinePlumes') out.farine_g  = g_per_planche;
  else if (chosen === 'AlfalfaMeal')  out.alfalfa_g = g_per_planche;
  return out;
}

// Wire the FP recipe table at script load. FP_RECIPE_T5.sidedress and
// FIRST_PRINCIPLES_SIDEDRESS were hand-set placeholders in v1; this
// IIFE overrides them with mass-balance values from
// computeStageSidedress(stage) so the Banque sol comparison reflects
// first principles. Single source of truth = computeStageSidedress.
//
// Default product = 'FarinePlumes'. Switching default to 'AlfalfaMeal'
// (Eco-luzerne) is an operator decision: it triples the dose mass (3 % N
// vs 13 % N) but stays Ca-free and organic-cert-clean. Such a swap also
// changes the team's weighed-out STORED_RECIPE, which means it requires a
// `/retire-recipe` audit cycle — the FP target alone shifts here, but the
// stored recipe must follow before the team's actions reflect the new product.
(function wireFpSidedress() {
  for (const stage of ['T1', 'T2', 'T3', 'T4', 'T5']) {
    FIRST_PRINCIPLES_SIDEDRESS[stage] = computeStageSidedress(stage);
  }
  const t5 = FIRST_PRINCIPLES_SIDEDRESS.T5;
  FP_RECIPE_T5.sidedress = {
    'Actisol-5-3-2': t5.actisol_g,  // 0 — Ca-aware gated out (soil Ca-saturated)
    'FarinePlumes':  t5.farine_g,
  };
})();

// Browser-globals export
// Public API for the tomate sidedress-recipe model.
//
// Spec:    nutrition/tomato/sidedress-recipe/spec.md
// public-api-namespace: this namespace exists at runtime with the keys below.
//
// Consumers (Banque sol page, future per-stage drift gauges, recipe
// calculators) should reach for
// `window.SidedressRecipeTomato` instead of the bare constants — the
// internal mineralization model and product mix can then be reshaped
// (e.g. swap default product to alfalfa) without breaking call sites.
window.SidedressRecipeTomato = {
  // Planche area used for per-planche conversion (m²)
  AREA_PER_PLANCHE:           SIDEDRESS_AREA_PER_PLANCHE,
  // Per-product chemistry + mineralization. ca-aware-product-gate reads ca_pct here.
  PRODUCTS:                   SIDEDRESS_PRODUCTS,
  // Per-(product, element) mineralization efficiency at steady-state
  // (legacy view kept for backwards-compat — derived from PRODUCTS).
  MINIMUM_EFFICIENCY:         SIDEDRESS_MINIMUM_EFFICIENCY,
  // Per-element efficiency (channel-efficiency-capability-map) — channel delivery fraction at
  // current FP-default product (FarinePlumes; Actisol ca-aware-product-gate-gated out
  // on Ca-saturated soil). N-only: 0.75 (Sonneveld mineralization).
  efficiency:                 SIDEDRESS_EFFICIENCY_AT_CURRENT_PRODUCTS,
  // Per-stage FP target { actisol_g, farine_g, alfalfa_g, chosen, g_per_planche },
  // populated at script load
  FIRST_PRINCIPLES_BY_STAGE:  FIRST_PRINCIPLES_SIDEDRESS,
  // Mass-balance derivation function (mass-balance-sizes-product-to-n-gap)
  computeStageSidedress,
};
