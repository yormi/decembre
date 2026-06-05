// Per-channel contribution function for sidedress, extracted from the
// inline sidedress slice of calculateNutritionSupply in
// nutrition/tomato/shell/contribution-orchestrator.js. Pure: no DOM reads, no window.* reads.
//
// Returns { N, P, K } in mg/m²/wk for the sidedress channel at `stage`.
// Caller selects the sd source (stored vs FP) and passes phLocked.

// computeSidedressContribution
//   stage                     : 'T1'..'T5'
//   sd                        : { actisol_g, farine_g } — sidedress dose to score
//   phLocked                  : boolean — toggles P availability factor
//   productPct                : PRODUCT_PCT slice with Actisol_N/P/K, FarinePlumes_N
//   areaPerPlanche            : SIDEDRESS_AREA_PER_PLANCHE (m² per planche)
//   minimumEfficiency         : SIDEDRESS_MINIMUM_EFFICIENCY map
//                                (Actisol_N, Actisol_K, FarinePlumes_N)
//
// Returns { N, P, K }.
function computeSidedressContribution({
  stage, sd, phLocked, productPct, areaPerPlanche, minimumEfficiency,
}) {
  void stage;
  const source = sd || { actisol_g: 0, farine_g: 0 };
  const sdAreaFactor = 1000 / areaPerPlanche;
  // P pH-lockout factor (audit Finding 7, cert 3): at pH ≥ 7 freshly
  // mineralized phosphate from Actisol meets Ca²⁺ and precipitates as
  // Ca-phosphate before plant uptake; effective ~10 %. Below pH-locked
  // threshold full 0.50 mineralization rate.
  const phLockoutFactor_P = phLocked ? 0.10 : 0.50;
  const N = (source.actisol_g * productPct.Actisol_N    * minimumEfficiency.Actisol_N
           + source.farine_g  * productPct.FarinePlumes_N * minimumEfficiency.FarinePlumes_N
            ) * sdAreaFactor;
  const P = source.actisol_g * productPct.Actisol_P * phLockoutFactor_P * sdAreaFactor;
  const K = source.actisol_g * productPct.Actisol_K * minimumEfficiency.Actisol_K * sdAreaFactor;
  return { N, P, K };
}
void computeSidedressContribution;
