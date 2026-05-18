// ─── yield-range/model.js — public API for the two-regime yield model ─
//
// Spec: yield-range/spec.md (REQ-112..118, REQ-171..175).
window.YieldRange = {
  predictNurseryYield,
  dliBenchAvg,
  f_light,
  fieldCanopyCapByDensity,
  perPlantDliShareField,

  RGR_MAXIMUM_LETTUCE_NURSERY,
  W_INIT_GERMINATED_G,
  LED_PPFD,
  DLI_SUN_OUTDOOR_QC_ANNUAL,
  GH_LIGHT_TRANSMISSION_DOUBLE_POLY,
  DLI_SUN_GH_ANNUAL_AVG_QC,
  CANOPY_CAP_BY_PLATEAU,
  FOLIAGE_HEIGHT_M,
  FOLIAGE_DENSITY_KG_PER_M3,
  FIELD_CANOPY_HEIGHT_M,
  FIELD_FOLIAGE_DENSITY_KG_PER_M3,
  LEAF_PROJECTED_AREA_M2_PER_G,
  TRAJECTORY_MAXIMUM_DAYS,
  POTENTIAL_THRESHOLD,
  F_LIGHT_BREAKPOINTS,
};
