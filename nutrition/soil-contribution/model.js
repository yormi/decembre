// Public API for the soil-contribution model.
//
// Spec:    nutrition/soil-contribution/spec.md
// REQ-143: this namespace exists at runtime with the keys below.
//
// Consumers (Bilan UI Block 2, future bank-trajectory + recipe-derivation
// surfaces) MUST reach for `window.SoilContribution` instead of the bare
// constants/functions above — internals can then be reshaped (per-bed
// scaling, depth-resolved bank, seasonal decay) without breaking call sites.
window.SoilContribution = {
  BANK_MG_M2:           SOIL_BANK_MG_M2,
  CONTRIBUTING:         SOIL_CONTRIBUTING,
  WEEKS_PER_MONTH:      WEEKS_PER_MONTH,
  weeklyContribution:   soilWeeklyContribution,
  monthsToDepletion:    soilMonthsToDepletion,
  renderGrid:           soilRenderGrid,
};
