// Substrate-contribution (nursery) — derivation functions.
//
// Spec:        nutrition/nursery/substrate-contribution/spec.md
// Derivation:  nutrition/nursery/substrate-contribution/derivation.md
//
// Pure functions — same inputs (OM2 starter charge, feather meal g/tray,
// release curves, tray volume) → same output. Returns mg of element
// released per tray per week.
//
// Two contributions to per-tray release:
//   (1) OM2 starter charge for {N, P, K, Ca, Mg}:
//         starter_mg_per_tray[el]   = OM2_STARTER_CHARGE_PPM[el] × NURSERY_TRAY_SUBSTRATE_VOL_L
//         week_release_mg[el]       = starter_mg_per_tray[el] × OM2_RELEASE_CURVE_BY_WEEK[w-1]
//   (2) Feather meal (N only):
//         total_N_mg_per_tray       = featherMealPerTrayG × FEATHER_MEAL_LABEL_PCT.N × FEATHER_MEAL_MINERALIZATION_FRAC × 1000
//         week_release_mg.N         += total_N_mg_per_tray × FEATHER_MEAL_RELEASE_CURVE_BY_WEEK[w-1]
//
// Output shape: { N, P, K, Ca, Mg } in mg/tray/wk.

function theoreticalSubstrateReleasePerWeek(week, featherMealPerTrayG) {
  // Bounds: clamp week to [1, curveLen]; if out of range and curve has 0
  // for the week, that simply means "no release in that week."
  const wIdx = (typeof week === 'number' && week >= 1) ? Math.floor(week) - 1 : 0;
  const fmG = (typeof featherMealPerTrayG === 'number' && isFinite(featherMealPerTrayG))
            ? featherMealPerTrayG
            : NURSERY_FEATHER_MEAL_DEFAULT_G_PER_TRAY;

  // (1) OM2 starter charge — every element in the table.
  const om2Frac = OM2_RELEASE_CURVE_BY_WEEK[wIdx] || 0;
  const out = { N: 0, P: 0, K: 0, Ca: 0, Mg: 0 };
  for (const el of Object.keys(OM2_STARTER_CHARGE_PPM)) {
    const starter_mg = OM2_STARTER_CHARGE_PPM[el] * NURSERY_TRAY_SUBSTRATE_VOL_L;
    out[el] = starter_mg * om2Frac;
  }

  // (2) Feather meal — N only.
  const fmFrac = FEATHER_MEAL_RELEASE_CURVE_BY_WEEK[wIdx] || 0;
  const fmTotalN_mg = fmG * (FEATHER_MEAL_LABEL_PCT.N || 0)
                          * FEATHER_MEAL_MINERALIZATION_FRAC * 1000;
  out.N += fmTotalN_mg * fmFrac;

  return out;
}

// Convenience: average release across the 5 weeks of the cycle (mg/tray/wk).
// Used by the Bilan card to show "what the substrate is contributing on
// average over the seedling cycle" — supply credit against the per-tray demand.
function cycleAverageReleasePerTray(featherMealPerTrayG) {
  const W = OM2_RELEASE_CURVE_BY_WEEK.length;
  const sum = { N: 0, P: 0, K: 0, Ca: 0, Mg: 0 };
  for (let w = 1; w <= W; w++) {
    const r = theoreticalSubstrateReleasePerWeek(w, featherMealPerTrayG);
    for (const el of Object.keys(sum)) sum[el] += r[el] || 0;
  }
  const avg = {};
  for (const el of Object.keys(sum)) avg[el] = sum[el] / W;
  return avg;
}
