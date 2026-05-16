// Public API for the tomate sidedress-recipe model.
//
// Spec:    nutrition/tomato/sidedress-recipe/spec.md
// REQ-088: this namespace exists at runtime with the keys below.
//
// Consumers (Banque sol page, future per-stage drift gauges, recipe
// calculators) should reach for
// `window.SidedressRecipeTomato` instead of the bare constants — the
// internal mineralization model and product mix can then be reshaped
// (e.g. swap default product to alfalfa) without breaking call sites.
window.SidedressRecipeTomato = {
  // Planche area used for per-planche conversion (m²)
  AREA_PER_PLANCHE:           SIDEDRESS_AREA_PER_PLANCHE,
  // Per-product chemistry + mineralization. REQ-089 reads ca_pct here.
  PRODUCTS:                   SIDEDRESS_PRODUCTS,
  // Per-(product, element) mineralization efficiency at steady-state
  // (legacy view kept for backwards-compat — derived from PRODUCTS).
  MINIMUM_EFFICIENCY:         SIDEDRESS_MINIMUM_EFFICIENCY,
  // Per-element efficiency (REQ-157) — channel delivery fraction at
  // current FP-default product (FarinePlumes; Actisol REQ-089-gated out
  // on Ca-saturated soil). N-only: 0.75 (Sonneveld mineralization).
  efficiency:                 SIDEDRESS_EFFICIENCY_AT_CURRENT_PRODUCTS,
  // Per-stage FP target { actisol_g, farine_g, alfalfa_g, chosen, g_per_planche },
  // populated at script load
  FIRST_PRINCIPLES_BY_STAGE:  FIRST_PRINCIPLES_SIDEDRESS,
  // Mass-balance derivation function (REQ-087)
  computeStageSidedress,
};
