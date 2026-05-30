// Public API for the compost-contribution model.
//
// Spec:    nutrition/compost-contribution/spec.md
// public-api-namespace: this namespace exists at runtime with the keys below.
//
// Consumers (Bilan UI for tomato + lettuce, future recipe calculators)
// should reach for `window.CompostContribution` instead of the bare
// constants below — internals can then be reshaped, e.g. to add a decay
// curve or a per-bed scaling, without breaking call sites.
//
// Cross-crop scope: the same Savaria amendment was applied to both tomato
// and lettuce planches, so this single namespace serves both subpages.
window.CompostContribution = {
  // Source product + application
  AMENDMENT:               COMPOST_AMENDMENT,
  // Per-element label percentages (mass fraction). Mg is the assumed/
  // data-gap entry — see derivation.md.
  LABEL_PCT:               COMPOST_LABEL_PCT,
  // Per-element year-1 mineralization fractions (0-1).
  MINERALIZATION_YEAR1:    COMPOST_MINERALIZATION_YEAR1,
  // Q10 seasonal multiplier (1.5× the annual mean during T3-T5).
  SEASONAL_FACTOR:         COMPOST_SEASONAL_FACTOR,
  // Per-element weekly release in g/m²/wk — what consumers read.
  releasePerWeek:          COMPOST_RELEASE_PER_WEEK,
  // Per-element efficiency (channel-efficiency-capability-map) — fraction of applied compost mass
  // plant-available within year 1, accounting for pH lockout (P) and
  // label-gap uncertainty (Mg). See data.js for per-element cert.
  efficiency:              COMPOST_EFFICIENCY,
  // Mass-balance check helper. Returns the formula value (which the
  // stored release is allowed to drift from within ±50% per release-values-within-mass-balance-band;
  // Mg is the only current divergence).
  theoreticalReleasePerWeek,
};
