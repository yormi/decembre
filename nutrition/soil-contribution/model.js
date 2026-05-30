// Public API for the soil-contribution model.
//
// Spec:    nutrition/soil-contribution/spec.md
// public-api-on-soil-contribution-namespace: this namespace exists at runtime with the keys below.
//
// Consumers (Bilan UI Block 2, future bank-trajectory + recipe-derivation
// surfaces) MUST reach for `window.SoilContribution` instead of the bare
// constants/functions above — internals can then be reshaped (per-bed
// scaling, depth-resolved bank, seasonal decay) without breaking call sites.
window.SoilContribution = {
  BANK_MG_M2:                          SOIL_BANK_MG_M2,
  CONTRIBUTING:                        SOIL_CONTRIBUTING,
  WEEKS_PER_MONTH:                     WEEKS_PER_MONTH,
  SME_SOIL_SOLUTION_PPM:               SME_SOIL_SOLUTION_PPM,
  TRANSPIRATION_L_PER_M2_PER_WEEK:     TRANSPIRATION_L_PER_M2_PER_WEEK,
  weeklyContribution:                  soilWeeklyContribution,
  monthsToDepletion:                   soilMonthsToDepletion,
  renderGrid:                          soilRenderGrid,
};
