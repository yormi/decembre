// ─── yield-range/domain/model.js — public API for the carbon-balance yield model ─
//
// Spec: yield-range/domain/spec.md.
window.YieldRange = {
  // Growth + throughput + sales
  predictYield,
  fieldDensityFromConfig,
  fieldCanopyCapByDensity,
  nurseryCapPackedFresh,
  nurseryCapSpacedFresh,

  // Input option sets
  FIELD_SPACING_CONFIGS,
  LABOR_ROUTINES,
  NURSERY_TRAY_CELLS,

  // Operation geometry
  BED_AREA_M2,
  BED_COUNT,
  PRICE_PER_KG,

  // Growth-engine constants
  GROWTH_RGR,
  RADIATION_USE_EFFICIENCY,
  NURSERY_STRESS_RUE,
  LEAF_AREA_EXTINCTION_K,
  SPECIFIC_LEAF_AREA,
  LAI_CLOSURE,
  DRY_MATTER_FRACTION,
  PLUG_DRY_MATTER_FRACTION,
  EMERGENCE_DRY_MASS_G,
  germinationDaysFromSoilTemperature,
  GERMINATION_BASE_TEMPERATURE_C,
  GERMINATION_THERMAL_TIME_DEGREE_DAYS,
  GERMINATION_INHIBITION_TEMPERATURE_C,
  NURSERY_SOIL_TEMPERATURE_C,
  SENESCENCE_ONSET_DAYS,
  SENESCENCE_DECLINE_RATE,
  FOLIAGE_HEIGHT_M,
  FOLIAGE_DENSITY_KG_PER_M3,
  FIELD_CANOPY_HEIGHT_M,
  FIELD_FOLIAGE_DENSITY_KG_PER_M3,

  // Supplemental-lighting feasibility (Lumière page)
  benchSunDli,
  supplementalLedHours,
  ledDli,
  LED_PPFD,
  DLI_SUN_GH_ANNUAL_AVG_QC,
  GH_LIGHT_TRANSMISSION_DOUBLE_POLY,
  CLEAR_DAY_MAXIMUM_DLI_BY_MONTH,
  SKY_CONDITION_FACTORS,
  DLI_TARGET,
  NURSERY_DLI_CEILING_BY_WEEK,
  MAXIMUM_HEALTHY_PHOTOPERIOD_HOURS,
};
