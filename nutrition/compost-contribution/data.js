// Compost-contribution — source data.
//
// Spec:        nutrition/compost-contribution/spec.md
// Derivation:  nutrition/compost-contribution/derivation.md
//
// Savaria ORGANIMIX marin applied fall 2025, ~25.4 kg/m² across all
// production beds (tomato + lettuce). Composition from product label
// (`nutrition/info/compost.pdf`); Mg assumed conservatively because it
// is not declared on the label.
//
// Cert annotations per field reflect transferability, not source quality.
// Scale defined canonically in nutrition/tomato/plant-needs/spec.md.

const COMPOST_AMENDMENT = {
  product:                 'Savaria ORGANIMIX marin',  // CAN/CGSB-32.311 §4.2 (organic shrimp + lime)
  applicationDate:         '2025-fall',
  applicationRateKgPerM2:  25.4,                       // ≈ 2 inches × ~520 m² beds; cert 5 (operator measured)
  datasheet:               'nutrition/info/compost.pdf',
};

// Label-stated percentages (mass fraction). K and P need oxide → element
// conversion (K₂O × 0.83; P₂O₅ × 0.437). Mg is NOT on the label — assume
// 0.3% (low-end for shrimp-base compost) and flag with cert 1.
const COMPOST_LABEL_PCT = {
  N:  0.005,    // 0.5% label N; cert 4
  P:  0.000437, // 0.1% P₂O₅ × 0.437 = 0.0437% P; cert 4
  K:  0.00083,  // 0.1% K₂O × 0.83 = 0.083% K; cert 4
  Ca: 0.011,    // 1.1% label Ca; cert 4
  Mg: 0.003,    // ASSUMED — not on label; cert 1; verify with vendor QC
};

// Year-1 mineralization fraction (0-1). Cert 2-3 — textbook organic
// mineralization rates with Décembre-context adjustment.
const COMPOST_MINERALIZATION_YEAR1 = {
  N:  0.30,  // standard organic-N rate (Stanford & Smith); cert 2
  P:  0.05,  // pH-locked at current 7.3-7.5 → very low effective release; cert 2
  K:  0.65,  // highly soluble in compost; cert 2
  Ca: 0.60,  // released as carbonate matrix degrades; cert 3 (consistent with post-application Berger Ca readings)
  Mg: 0.30,  // similar kinetics to N; cert 2
};

// Q10 seasonal multiplier. Compost mineralization roughly doubles per
// 10 °C; greenhouse soil mid-band temp → 1.5× the annual mean rate
// during T3-T5 production window. Cert 2.
const COMPOST_SEASONAL_FACTOR = 1.5;

// Per-element weekly release in g/m²/wk. Derived from the inputs above
// via `(applied_g_per_m2 × year1_fraction / 52) × seasonal_factor`,
// EXCEPT Mg which carries a conservative manual override (rounded down
// from theoretical 0.658 → 0.50 because the underlying Mg % assumption
// is data-gap, cert 1). release-values-within-mass-balance-band verifier asserts every value is within
// [0.5×, 1.5×] of theoretical; the Mg override passes that band by
// design. Other elements are within rounding of the formula.
const COMPOST_RELEASE_PER_WEEK = {
  N:  1.10,
  P:  0.016,
  K:  0.40,
  Ca: 4.82,
  Mg: 0.50,
};

// Per-element efficiency for the Efficacité column (channel-efficiency-capability-map) — share of
// applied compost mass that becomes plant-available within year 1 under
// current Décembre conditions (pH 7.3-7.5, Ca-saturated bed). Numerically
// equals COMPOST_MINERALIZATION_YEAR1 because the pH-lockout discount is
// already baked into the per-element mineralization rate (notably P at
// 0.05 reflects the current-pH lockout, not a neutral-pH textbook 0.20).
// Re-exposed as a separate constant so public-api-namespace's namespace contract names
// it explicitly and renderers (efficacite-column-capability) read a single canonical handle.
//
// Per-element cert reflects the effective certainty on the plant-available
// fraction, propagating from the weaker of {mineralization-rate cert,
// label-input cert}:
//   N  cert 2 — MINERALIZATION_YEAR1.N (Stanford & Smith textbook)
//   P  cert 2 — MINERALIZATION_YEAR1.P (pH-locked at current 7.3-7.5)
//   K  cert 2 — MINERALIZATION_YEAR1.K (highly soluble in compost)
//   Ca cert 3 — MINERALIZATION_YEAR1.Ca (consistent with Berger post-application)
//   Mg cert 1 — LABEL_PCT.Mg is assumed (label gap); the mineralization
//                rate cert (2) is dominated by the upstream LABEL gap
const COMPOST_EFFICIENCY = {
  N:  0.30,
  P:  0.05,
  K:  0.65,
  Ca: 0.60,
  Mg: 0.30,
};
