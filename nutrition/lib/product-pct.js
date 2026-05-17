// Element % by mass for each product (label-stated). Consumed cross-crop:
// nutrition/tomato/{fertigation,foliar,sidedress}-recipe, nutrition/tomato/app,
// nutrition/lettuce/{app,plant-needs}, verifier.
const PRODUCT_PCT = {
  K2SO4_K:    0.415,  // 50% K2O = 41.5% K
  MgSO4_Mg:   0.0986, // MgSO4·7H2O
  MnSO4_Mn:   0.315,
  ZnSO4_Zn:   0.355,
  Solubore_B: 0.205,
  CuSO4_Cu:   0.25,
  NaMoO4_Mo:  0.396,
  FeSO4_Fe:   0.20,   // FeSO4·7H2O 20% Fe (foliar active source)
  // CaCl2_Ca removed 2026-05-06 (Spray B retired)
  // Side-dressing products (granular, applied weekly to soil between rows)
  Actisol_N:      0.05,                  // 5% N (label 5-3-2)
  Actisol_P:      0.03 * 62/142,         // 3% P₂O₅ × 62/142 = 1.31% P (elemental)
  Actisol_K:      0.02 * 78/94.2,        // 2% K₂O × 78/94.2 = 1.66% K (elemental)
  FarinePlumes_N: 0.13,                  // 13% N (label 13-0-0)
};
