// Compost-contribution — derivation function.
//
// Spec:        nutrition/compost-contribution/spec.md
// Derivation:  nutrition/compost-contribution/derivation.md
//
// Pure function: same inputs (label %, mineralization, seasonal, applied
// rate) → same output. No time-of-year axis yet (deferred — see spec
// "Pending — decline curve").

function theoreticalReleasePerWeek(el) {
  const labelPct        = COMPOST_LABEL_PCT[el];
  const year1Fraction   = COMPOST_MINERALIZATION_YEAR1[el];
  if (labelPct == null || year1Fraction == null) return 0;
  const applied_g_m2    = COMPOST_AMENDMENT.applicationRateKgPerM2 * 1000 * labelPct;
  const annual_g_m2     = applied_g_m2 * year1Fraction;
  return (annual_g_m2 / 52) * COMPOST_SEASONAL_FACTOR;
}
