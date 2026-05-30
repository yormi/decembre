// Public API for the Salanova plant-needs model.
//
// Spec:    nutrition/lettuce/plant-needs/spec.md
// public-api-namespace: this namespace exists at runtime with the keys below.
//
// Consumers (Salanova subpage builder, recipe calculators) should never read
// the underlying globals directly — go through `window.PlantNeedsLettuce` so
// internals can be refactored (constants moved, signatures grown with optional
// args, tables re-shaped) without breaking call sites.
//
// Mirrors the shape of `window.PlantNeedsTomato`.
window.PlantNeedsLettuce = {
  // Read-only data tables.
  LETTUCE_DM_FRACTION,
  LETTUCE_TISSUE_DW,
  LETTUCE_FRONTLOAD_DEFAULTS,
  SME_LETTUCE_PPM,

  // Pure-function layer (demand-scales-with-mass-and-cycle, supply-composition-soil-fert-frontload).
  calculateLettuceNutritionDemand,
  calculateLettuceNutritionSupply,
};
