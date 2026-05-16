// Public API for the nursery plant-needs model.
//
// Spec:    nutrition/nursery/plant-needs/spec.md
// REQ-093: this namespace exists at runtime with the keys below.
//
// Consumers (Semis subpage UI, future nursery recipe calculators) should
// reach for `window.PlantNeedsNursery` instead of the bare constants
// below — internals can then be reshaped (e.g. add per-stage T1/T2
// sub-rows when tissue-stratified data lands, or split DM by week)
// without breaking call sites.
//
// Mirrors the convention used by `window.PlantNeedsTomato` and
// `window.CompostContribution`.
window.PlantNeedsNursery = {
  // Read-only data tables.
  LETTUCE_NURSERY_TISSUE_DW,
  LETTUCE_NURSERY_DM_FRACTION,
  NURSERY_TARGETS,

  // Core demand function. REQ-090 asserts linearity in targetG; REQ-091
  // asserts inverse-linearity in cycleDays.
  calculateNurseryDemand,

  // Convenience: per-tray demand at default targets, single element.
  // Used by the Semis admin grid to skip the call-site boilerplate.
  // Returns mg per tray per week.
  demandPerTray(el) {
    const d = calculateNurseryDemand(
      NURSERY_TARGETS.targetG_default,
      NURSERY_TARGETS.cycleDays_default,
      NURSERY_TARGETS.cellsPerTray_default
    );
    return d[el] ? d[el].perTray_mg : 0;
  },
};
