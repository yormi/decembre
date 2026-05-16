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
// REQ-136 — returns { perTray_mg, details, efficiency } where
//   details[el] = { cert, cap } (REQ-136)
//   efficiency[el] = NURSERY_SUBSTRATE_EFFICIENCY (REQ-157 sibling map;
//     same object returned to all callers — defined in data.js)
// Cap fires for N when featherMealPerTrayG hits LIMITS.maxFeatherMealPerTrayG
// (germination protection — REQ-094).
//
// Backwards-compat note: this function previously returned a flat
// {N, P, K, Ca, Mg} map. After REQ-136 it returned `{perTray_mg, details}`;
// after REQ-157 (2026-05-15) it returns `{perTray_mg, details, efficiency}`.
// Callers reading `result.perTray_mg[el]` are unaffected.
function cycleAverageReleasePerTray(featherMealPerTrayG) {
  const W = OM2_RELEASE_CURVE_BY_WEEK.length;
  const sum = { N: 0, P: 0, K: 0, Ca: 0, Mg: 0 };
  for (let w = 1; w <= W; w++) {
    const r = theoreticalSubstrateReleasePerWeek(w, featherMealPerTrayG);
    for (const el of Object.keys(sum)) sum[el] += r[el] || 0;
  }
  const perTray_mg = {};
  for (const el of Object.keys(sum)) perTray_mg[el] = sum[el] / W;

  // REQ-136 (revised 2026-05-10 evening) — per-element details. `cap`
  // describes the structural reason this channel may under-deliver, not
  // whether a numerical limit currently binds. The UI shows the emoji only
  // when manque sortant > 0; otherwise the emoji stays hidden even though
  // cap is non-null. This separation lets the calc declare "if this
  // element is short via this channel, here's why" without needing to know
  // demand at calc time.
  const fmCap = LIMITS.maxFeatherMealPerTrayG;
  // REQ-136 (4-field schema 2026-05-11): constraint / limit / lever, no prose.
  const details = {
    N: {
      cert: 2,
      cap: {
        kind: 'damage',
        constraint: 'Protection germination',
        limit: 'max ' + fmCap + ' g farine / plateau',
        lever: '↑ poisson hydrolysé fertigation',
        uncappedMg: perTray_mg.N * 2,
      },
    },
    P:  { cert: 2, cap: { kind: 'other', constraint: 'Charge OM2 figée',  limit: 'sans levier substrat',     lever: '↑ poisson hydrolysé fertigation', uncappedMg: 0 } },
    K:  { cert: 2, cap: { kind: 'other', constraint: 'Charge OM2 figée',  limit: 'sans levier substrat',     lever: 'ajouter K₂SO₄ fertigation',       uncappedMg: 0 } },
    Ca: { cert: 2, cap: { kind: 'other', constraint: 'Chaux OM2 figée',   limit: 'sans levier substrat',     lever: 'Ca soluble Ecocert (rare)',       uncappedMg: 0 } },
    Mg: { cert: 2, cap: { kind: 'other', constraint: 'Chaux OM2 figée',   limit: 'sans levier substrat',     lever: 'ajouter MgSO₄·7H₂O fertigation', uncappedMg: 0 } },
  };
  return { perTray_mg, details, efficiency: NURSERY_SUBSTRATE_EFFICIENCY };
}
