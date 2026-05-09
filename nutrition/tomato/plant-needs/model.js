// Public API for the tomate plant-needs model.
//
// Spec:    nutrition/tomato/plant-needs/spec.md
// REQ-083: this namespace exists at runtime with the keys below.
//
// Consumers (Bilan UI, recipe calculators) should never read the underlying
// globals directly — go through `window.PlantNeedsTomato` so internals can
// be refactored (constants moved, function signatures grown with optional
// args, tables re-shaped) without breaking call sites.
//
// Internal symbols still live alongside the rest of the demand model in
// `app/index.html` for now; this file is purely the wrapper. When the
// underlying constants/functions migrate into per-domain partials, this
// wrapper becomes the natural seam to import them from.
window.PlantNeedsTomato = {
  // Read-only data tables (REQ-033 anchors TOMATO_REMOVAL macros; REQ-082
  // guards stage-transition continuity on BIOMASS_DEMAND).
  TOMATO_FRUIT_EXPORT,
  BIOMASS_DEMAND,
  TOMATO_DEMAND_CERT,
  TOMATO_REMOVAL,
  TRANSP_COUPLED_BIOMASS,

  // Core demand function. REQ-081 applies transpFactor to Ca/Mg biomass
  // term only; phloem-mobile macros and active-transport micros decoupled.
  calcNutrDemand,

  // Convenience: collapse {fruit, biomass, total} into a flat {el → total}
  // map. Used by recipe calculators that only need the total.
  demandTotal(yieldKgPerM2, stage, transpFactor = 1.0) {
    const d = calcNutrDemand(yieldKgPerM2, stage, transpFactor);
    const out = {};
    Object.keys(d).forEach(el => { out[el] = d[el].total; });
    return out;
  },

  // Convenience: cert per (stage, el) on the merged transferability scale.
  // Stable fallback to 1 (default placeholder) if the table is missing
  // an entry. See "Cert scale" section in plant-needs/spec.md.
  certFor(stage, el) {
    const row = TOMATO_DEMAND_CERT && TOMATO_DEMAND_CERT[stage];
    return (row && row[el] != null) ? row[el] : 1;
  },
};
