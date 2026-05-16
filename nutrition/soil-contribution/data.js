// Soil-contribution — source data.
//
// Spec: nutrition/soil-contribution/spec.md
//
// Mehlich-3 soil bank from Berger Labs Report 39088 (April 2026). Values
// converted from kg/ha to mg/m² by × 100 (since 1 ha = 10 000 m²) so the
// consumer arithmetic (min(demand_mg, bank_mg)) operates in the same unit
// as the rest of the weekly gap chain.
//
// Tomato bed wired (sample 596614). Lettuce bed (sample 596616) also wired
// from the same April 2026 reading: P 678 / K 645 / Ca 10 612 / Mg 934 kg/ha
// (Salanova bed planches).

const SOIL_BANK_MG_M2 = {
  tomato: {
    P:  55800,    // 558 kg/ha    — vault, locked at pH 7,4 (SME 1,1 ppm)
    K:  211800,   // 2 118 kg/ha  — in spec, SME 292 ppm
    Ca: 1098900,  // 10 989 kg/ha — Ca-saturated, root cause crise pH
    Mg: 164600,   // 1 646 kg/ha  — in spec, SME 79 ppm
    // N and micros (Fe/Mn/Zn/B/Cu/Mo) are not measured on the Berger test.
  },
  lettuce: {
    P:  67800,    // 678 kg/ha    — vault, locked at pH 7,5 (SME 0,8 ppm)
    K:  64500,    // 645 kg/ha    — within spec window
    Ca: 1061200,  // 10 612 kg/ha — Ca-saturated (same root cause)
    Mg: 93400,    // 934 kg/ha    — within spec window
  },
};

// Elements whose soil bank participates in the weekly gap chain.
// Spec REQ-141. Scoped to Ca + P today — banks large enough to carry the
// plant's full weekly need without external resupply, no operator lever
// turns these off. K + Mg have measured banks but their gap-chain coverage
// flows through fertigation (K₂SO₄ + MgSO₄); routing them via the soil
// bank too would double-count.
const SOIL_CONTRIBUTING = {
  P:  true,
  Ca: true,
};

// 52 weeks / 12 months. Used to convert the bank-to-uptake ratio into
// months for the depletion runway column.
const WEEKS_PER_MONTH = 52 / 12;

// SME (Saturated Media Extract) soil-solution concentrations in ppm
// (= mg/L of soil solution). Spec REQ-164. Source: Berger Labs SME Report
// 39087, April 10 2026, samples 596614 (tomato 1) and 596616 (laitue 1).
//
// Below-detection-limit values (Mn, Zn on both crops; Cu on lettuce trace):
// the lab reports "< 0.03" — we record the detection-limit value with a
// negative sign convention is rejected; instead we keep the ceiling value
// 0.03 and flag the cert in `derivation.md` (cert 2 — upper bound, not a
// direct measurement). Resulting runways are conservative ceilings.
//
// N, Cu, Mo: direct measurements at low ppm; cert 4.
// All other macros + B: direct measurements; cert 4.
//
// Refinement trigger: next Berger SME reading. When pH drops below 6.5,
// expect P / Mn / Zn to climb out of lockout and these constants to
// jump — re-source from the new report.
const SME_SOIL_SOLUTION_PPM = {
  tomato: {
    N:  45.4,    // NO3-N 45,0 + NH4-N 0,4 = 45,4 (active mineral N pool)
    P:  1.1,     // ↓ lockout (spec 5-50)
    K:  292.3,
    Ca: 238.8,   // ↑ above spec 40-200 (Ca-saturated)
    Mg: 79.3,
    Fe: 0.86,
    Mn: 0.03,    // < 0.03 (below detection limit; conservative ceiling)
    Zn: 0.03,    // < 0.03 (below detection limit; conservative ceiling)
    B:  0.18,
    Cu: 0.04,
    Mo: 0.02,
  },
  lettuce: {
    N:  72.6,    // NO3-N 68,8 + NH4-N 3,8 = 72,6
    P:  0.8,     // ↓ lockout
    K:  54.4,
    Ca: 114.4,
    Mg: 30.2,
    Fe: 0.22,    // ↓ below spec 0,30
    Mn: 0.03,    // < 0.03 (detection limit)
    Zn: 0.03,    // < 0.03 (detection limit)
    B:  0.17,
    Cu: 0.03,
    Mo: 0.02,
  },
};

// Weekly transpiration estimate per crop (L/m²/wk). Spec REQ-164.
// Multiplied by SME ppm (mg/L) → weekly plant uptake at current
// soil-solution availability (mg/m²/wk), the denominator of the
// SME-derived depletion runway.
//
// Tomato 15 L/m²/wk: Quebec greenhouse cycle-weighted average; peak summer
// reaches 25-30 L/m²/wk, early-season ramp 5-8 L/m²/wk. Cert 2 — wide
// per-stage band; mid-band picked for a single defensible constant.
// Refinement trigger: in-house transpiration log or PA Taillon's bench
// measurements.
//
// Lettuce 4 L/m²/wk: Salanova production-cycle average; cool months 2-3,
// warm months 5-8. Cert 2 — same band-mid rationale.
//
// Both values represent net water uptake at the root surface — the carrier
// stream that delivers ions from soil solution to the plant. Spec
// derivation in `derivation.md` § "Weekly uptake from SME".
const TRANSPIRATION_L_PER_M2_PER_WEEK = {
  tomato:  15,
  lettuce:  4,
};
