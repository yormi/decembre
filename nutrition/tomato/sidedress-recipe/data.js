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
// `n_pct`, `ca_pct` are elemental mass fractions (label-stated). `eff` is
// steady-state mineralization. Source / cert / per-product-cycle rationale
// live in derivation.md.
const SIDEDRESS_PRODUCTS = {
  Actisol: {
    n_pct:  PRODUCT_PCT.Actisol_N,        // 0.05
    ca_pct: 0.03,                         // ~3 % Ca (label-stated, calcitic carrier)
    eff:    0.60,
  },
  FarinePlumes: {
    n_pct:  PRODUCT_PCT.FarinePlumes_N,   // 0.13
    ca_pct: 0,
    eff:    0.75,
  },
  AlfalfaMeal: {
    n_pct:  0.03,                         // 3 % N (label-stated)
    ca_pct: 0,
    eff:    0.65,
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
