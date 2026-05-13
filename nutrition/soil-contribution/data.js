// Soil-contribution — source data.
//
// Spec: nutrition/soil-contribution/spec.md
//
// Mehlich-3 soil bank from Berger Labs Report 39088 (April 2026). Values
// converted from kg/ha to mg/m² by × 100 (since 1 ha = 10 000 m²) so the
// consumer arithmetic (min(demand_mg, bank_mg)) operates in the same unit
// as the rest of the weekly gap chain.
//
// Tomato bed is wired today (sample 596614). Lettuce bed (sample 596616,
// P 678 / Ca 10 612 / Mg 934 kg/ha) is measured but not yet wired — add
// a `lettuce` entry below when the Salanova subpage needs it.

const SOIL_BANK_MG_M2 = {
  tomato: {
    P:  55800,    // 558 kg/ha    — vault, locked at pH 7,4 (SME 1,1 ppm)
    K:  211800,   // 2 118 kg/ha  — in spec, SME 292 ppm
    Ca: 1098900,  // 10 989 kg/ha — Ca-saturated, root cause crise pH
    Mg: 164600,   // 1 646 kg/ha  — in spec, SME 79 ppm
    // N and micros (Fe/Mn/Zn/B/Cu/Mo) are not measured on the Berger test.
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

// 52 weeks / 12 months. Used to convert the bank-to-demand ratio into
// months for the depletion runway column.
const WEEKS_PER_MONTH = 52 / 12;
