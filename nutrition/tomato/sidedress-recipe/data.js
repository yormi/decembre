// Sidedress-recipe — source data.
//
// Spec:        nutrition/tomato/sidedress-recipe/spec.md
// Derivation:  nutrition/tomato/sidedress-recipe/derivation.md
//
// Sidedress is the granular pre-application of organic N to soil per
// tomato production stage. Multi-product table (SIDEDRESS_PRODUCTS)
// declares chemistry + mineralization per product; computeStageSidedress
// picks any Ca-free product (REQ-089). Default = farine de plumes 13-0-0;
// Eco-luzerne 3-0.5-2 is the alfalfa alternative (also Ca-free).

// Planche area used to convert per-m² doses to per-planche doses for the
// team. Matches `TOMATO_BED_AREA = 54.7` — if beds reconfigure, both must
// move together.
const SIDEDRESS_AREA_PER_PLANCHE = 54.7;  // m²

// SIDEDRESS_PRODUCTS — per-product chemistry + mineralization efficiency.
//
// `ca_pct` is the gate REQ-089 enforces: products with `ca_pct > 0` cannot
// be selected by computeStageSidedress while soil is Ca-saturated. Generalizes
// the previous Actisol-specific lock — any future Ca-bearing product
// (Selectus 4-2-5 with 3.7-4.5% Ca, certain frass blends, lime-amended
// composts) is rejected automatically without code changes.
//
// `n_pct`, `p_pct`, `k_pct`, `ca_pct` are elemental mass fractions (label-stated,
// converted from oxide where applicable). `eff` is steady-state mineralization
// (cert 3 — values within Sonneveld & Voogt 2009 ch. 8 ranges; alfalfa cert 2,
// from organic-N literature). Cold-soul shoulder seasons would reduce ~30-50 %.
//
// Source-of-truth for product label %: still `PRODUCT_PCT` for Actisol/Farine
// (consumed by Bilan supply chain in calcNutrSupply, etc.); alfalfa N inlined
// here since `PRODUCT_PCT` doesn't yet carry it and adding a constant just
// for sidedress would over-couple. Promote to `PRODUCT_PCT.AlfalfaMeal_N` if
// alfalfa lands in another channel.
const SIDEDRESS_PRODUCTS = {
  Actisol: {
    label:  'Actisol 5-3-2',
    n_pct:  PRODUCT_PCT.Actisol_N,        // 0.05
    p_pct:  PRODUCT_PCT.Actisol_P,        // 0.0131 elemental
    k_pct:  PRODUCT_PCT.Actisol_K,        // 0.0166 elemental
    ca_pct: 0.03,                         // ~3 % Ca (label-stated, calcitic carrier)
    eff:    0.60,                         // composted manure pellet, slower than feather meal
    source: 'Sonneveld 2009 ch.8 manure-pellet range',
    cert:   3,
  },
  FarinePlumes: {
    label:  'Farine de plumes 13-0-0',
    n_pct:  PRODUCT_PCT.FarinePlumes_N,   // 0.13
    ca_pct: 0,                            // no Ca carrier
    eff:    0.75,                         // animal protein, 70-85 % mineralizes in 6-8 weeks
    source: 'Sonneveld 2009 ch.8 feather-meal range',
    cert:   3,
  },
  AlfalfaMeal: {
    label:  'Eco-luzerne 3-0.5-2',
    n_pct:  0.03,                         // 3 % N (label-stated)
    p_pct:  0.005 * 62/142,               // 0.5 % P₂O₅ → 0.218 % elemental P
    k_pct:  0.02  * 78/94.2,              // 2 % K₂O → 1.66 % elemental K
    ca_pct: 0,                            // pure alfalfa pellet, no Ca-loading carriers
    eff:    0.65,                         // plant-protein N, slightly slower than feather meal
    source: 'Alfalfa-meal organic-N literature (Acti-Sol product datasheet pending)',
    cert:   2,                            // organic-cert TBD; mineralization range cert 2 from literature
  },
};

// Backwards-compat derived view. `app/index.html` consumers (calcNutrSupply,
// computeStageRecipe, buildBanqueSol's additionFor, buildNutriment's footer)
// still read `SIDEDRESS_MIN_EFF.{Actisol_N, Actisol_P, Actisol_K, FarinePlumes_N}`
// directly. Migrating those to read from SIDEDRESS_PRODUCTS would touch a
// dozen call sites and isn't necessary for the gate generalization. Fold
// when those sites get refactored.
const SIDEDRESS_MIN_EFF = {
  Actisol_N:      SIDEDRESS_PRODUCTS.Actisol.eff,
  Actisol_P:      0.50,                         // P-specific eff (slower than N + pH lockout)
  Actisol_K:      0.85,                         // K mostly water-soluble in pellets; fast release
  FarinePlumes_N: SIDEDRESS_PRODUCTS.FarinePlumes.eff,
};

// FIRST_PRINCIPLES_SIDEDRESS — adapter that surfaces FP_RECIPE_T5.sidedress
// in the {actisol_g, farine_g, alfalfa_g, chosen} schema expected by
// buildBanqueSol(). T1-T5 entries are populated by `wireFpSidedress` IIFE
// in calc.js at script load. Single source of truth = computeStageSidedress.
//
// Read by buildBanqueSol() to render the bank-trajectory comparison side-by-
// side with the stored recipe; not consumed by calcNutrSupply (stored recipe
// remains REQ-004 source-of-truth for the Bilan supply numbers).
const FIRST_PRINCIPLES_SIDEDRESS = {
  // T1, T2, T3, T4, T5 filled in by wireFpSidedress(); see calc.js.
};
