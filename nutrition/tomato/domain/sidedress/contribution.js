// Per-channel contribution function for sidedress, extracted from the
// inline sidedress slice of calculateNutritionSupply in
// nutrition/tomato/app/shell/contribution-orchestrator.js. Pure: no DOM reads, no window.* reads.
//
// Returns { N, P, K } in mg/m²/wk for the sidedress channel at `stage`.
// Caller selects the sd source (stored vs FP).

// computeSidedressContribution
//   stage                     : 'T1'..'T5'
//   sd                        : { actisol_g, farine_g } — sidedress dose to score
//   productPct                : PRODUCT_PCT slice with Actisol_N/P/K, FarinePlumes_N
//   areaPerPlanche            : SIDEDRESS_AREA_PER_PLANCHE (m² per planche)
//   minimumEfficiency         : SIDEDRESS_MINIMUM_EFFICIENCY map
//                                (Actisol_N, Actisol_K, FarinePlumes_N)
//
// Returns { N, P, K }.
function computeSidedressContribution({
  stage, sd, productPct, areaPerPlanche, minimumEfficiency,
}) {
  void stage;
  const source = sd || { actisol_g: 0, farine_g: 0 };
  const sdAreaFactor = 1000 / areaPerPlanche;
  // P availability factor: freshly mineralized Actisol phosphate reaches the
  // plant at ~50 % (organic release rate) at the current root-zone pH.
  const phosphateFactor_P = 0.50;
  const N = (source.actisol_g * productPct.Actisol_N    * minimumEfficiency.Actisol_N
           + source.farine_g  * productPct.FarinePlumes_N * minimumEfficiency.FarinePlumes_N
            ) * sdAreaFactor;
  const P = source.actisol_g * productPct.Actisol_P * phosphateFactor_P * sdAreaFactor;
  const K = source.actisol_g * productPct.Actisol_K * minimumEfficiency.Actisol_K * sdAreaFactor;
  return { N, P, K };
}
void computeSidedressContribution;
