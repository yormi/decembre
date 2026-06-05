// Soil-contribution — source data.
//
// Spec: nutrition/soil-contribution/spec.md
//
// Mehlich-3 soil bank from Berger Labs Report 39088 (April 2026), samples
// 596615 (tomate 2 9 avril 2026) and 596617 (laitue 2 9 avril 2026). Values
// converted to mg/m² so consumer arithmetic operates in the same unit as
// the rest of the weekly gap chain.
//
// Two reporting conventions in the lab report:
//   - kg/ha for P, K, Ca, Mg, Na: convert × 100 (1 ha = 10 000 m²).
//   - ppm for B, Cu, Fe, Mn, Zn, Al, N-NO3, N-NH4: convert × 200.
// The ppm convention assumes a 20 cm sample depth × 1.0 g/cm³ effective
// bulk density (Berger's kg/ha = ppm × 2 convention scaled to mg/m²).
// Cert 4 on the conversion factor (Berger lab convention).
//
// Element coverage: 10 of the 11 gap-grid elements. Mo is unmeasured on
// the Mehlich-3 panel — consistent with the Mo carve-out (replenishment-cascade-earliest-first: Mo
// routes via fertigation as an anion, not via the soil bank). Na and Al
// are reported but not on the gap-grid; excluded from this map.
//
// Below-detection-limit handling (P-04):
//   - Lettuce B `< 0.1` ppm → recorded as ceiling 20 mg/m², cert 2.
//   - Tomato N-NH4 `< 0.06` ppm → recorded as ceiling 12 mg/m², cert 2
//     (combined with NO3 36.3 ppm = 7272 mg/m² total N at the ceiling).
//
// Refinement trigger: next Berger reading. When pH drops below 6.5 expect
// the cation-micro side to climb out of lockout; re-source from new report.

const SOIL_REPORT_PPM_TO_MG_PER_M2 = 200;  // Berger 20 cm × 1.0 g/cm³ convention; cert 4

const SOIL_BANK_MG_M2 = {
  tomato: {
    N:   7272,     // NO3-N 36.3 ppm + NH4-N <0.06 ppm (DL ceiling); cert 2
    P:   55770,    // 557.7 kg/ha — vault, locked at pH 7.28 (SME 1.1 ppm)
    K:   211840,   // 2118.4 kg/ha — in spec, SME 292 ppm
    Ca:  1098910,  // 10989.1 kg/ha — Ca-saturated, root cause crise pH
    Mg:  164630,   // 1646.3 kg/ha — in spec, SME 79 ppm
    Fe:  62180,    // 310.9 ppm; cert 4
    Mn:  10140,    // 50.7 ppm; cert 4
    Zn:  2300,     // 11.5 ppm; cert 4
    B:   60,       // 0.3 ppm; cert 4
    Cu:  920,      // 4.6 ppm; cert 4
    // Mo not measured on Mehlich-3 panel; routes via fertigation per replenishment-cascade-earliest-first carve-out.
  },
  lettuce: {
    N:   14340,    // NO3-N 69.4 ppm + NH4-N 2.3 ppm; cert 4
    P:   67840,    // 678.4 kg/ha — vault, locked at pH 7.48 (SME 0.8 ppm)
    K:   64490,    // 644.9 kg/ha — within spec window
    Ca:  1061240,  // 10612.4 kg/ha — Ca-saturated (same root cause)
    Mg:  93400,    // 934.0 kg/ha — within spec window
    Fe:  64340,    // 321.7 ppm; cert 4
    Mn:  12740,    // 63.7 ppm; cert 4
    Zn:  2160,     // 10.8 ppm; cert 4
    B:   20,       // <0.1 ppm (DL ceiling); cert 2
    Cu:  1220,     // 6.1 ppm; cert 4
    // Mo not measured on Mehlich-3 panel.
  },
};

// Elements whose soil bank participates in the weekly gap chain.
// Spec only-ca-p-participate-in-gap-chain. Scoped to Ca + P today — banks large enough to carry the
// plant's full weekly need without external resupply, no operator lever
// turns these off. K + Mg have measured banks but their gap-chain coverage
// flows through fertigation (K₂SO₄ + MgSO₄); routing them via the soil
// bank too would double-count.
const SOIL_CONTRIBUTING = {
  P:  true,
  Ca: true,
};

// Elements whose soil-bank reservoir is replenished by ongoing turnover
// rather than acting as a fixed depleting stock. The Mehlich-3 N pool
// (NO3-N + NH4-N) sits at quasi-steady-state with mineralization of soil
// organic matter + compost amendments; the displayed "runway" computed
// from bank ÷ uptake is a counterfactual ("weeks until empty IF
// mineralization stopped") that never materialises operationally. For
// these elements the runway column renders blank — see months-to-depletion-clamped-by-peak-demand + the
// pourquoi-modal `N-not-mehlich` strings. Add S here when sulfur is wired.
const TURNOVER_BOUND_ELEMENTS = ['N'];

// Plant peak weekly demand per crop × element (mg/m²/wk). Clamps the
// depletion-runway denominator at the actual plant-uptake ceiling rather
// than mass-flow capacity (SME × transpiration). For elements where
// mass-flow exceeds demand (Ca / Mg on the tomato bed), the plant draws
// only what it needs and the bank drains at the demand rate. For locked-
// out elements (P / Mn / Zn at pH 7.4) mass-flow is below demand and the
// clamp doesn't bind — the runway formula reduces to the SME-throttled
// version. Spec months-to-depletion-clamped-by-peak-demand.
//
// Sources:
//   - Tomato: nutrition/tomato/plant-needs/data.js TOMATO_REMOVAL × yield
//     1.5 kg/m²/wk (whole-plant Koller-aligned ratio at T5 production peak;
//     cert 3 for macros, cert 1-2 for micros — inherits per-element from
//     plant-needs).
//   - Lettuce: nutrition/lettuce/plant-needs/data.js LETTUCE_TISSUE_DW ×
//     ~75 g DW/m²/wk head-formation peak (1.5× cycle-mean of a Salanova
//     transplant 30 g → target 350 g × density 16 plants/m² × 35-day
//     cycle; cert 4 macros, cert 3 micros).
//
// N intentionally omitted — N is turnover-bound (TURNOVER_BOUND_ELEMENTS);
// runway returns null regardless of demand.
//
// Refinement trigger: any shift in TOMATO_REMOVAL, BIOMASS_DEMAND[T5],
// LETTUCE_TISSUE_DW, or a tissue-test recalibration of peak demand.
const PLANT_PEAK_WEEKLY_DEMAND_MG_PER_M2 = {
  tomato: {
    P:  660,
    K:  6000,
    Ca: 2250,
    Mg:  855,
    Fe:   15,
    Mn:    7.5,
    Zn:    4.5,
    B:     4.5,
    Cu:    1.5,
  },
  lettuce: {
    P:   384,
    K:  5376,
    Ca: 1152,
    Mg:  307,
    Fe:   15.4,
    Mn:    3.8,
    Zn:    3.1,
    B:     2.3,
    Cu:    0.6,
  },
};

// 52 weeks / 12 months. Used to convert the bank-to-uptake ratio into
// months for the depletion runway column.
const WEEKS_PER_MONTH = 52 / 12;

// SME (Saturated Media Extract) soil-solution concentrations in ppm
// (= mg/L of soil solution). Spec sme-soil-solution-wired-per-crop-element. Source: Berger Labs SME Report
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

// Weekly transpiration estimate per crop (L/m²/wk). Spec sme-soil-solution-wired-per-crop-element.
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
