// Demand model = fruit export (yield-driven) + biomass build-out (stage-driven).
// The two terms are NON-OVERLAPPING by construction (2026-05-04 split):
//   fruit_mg    = TOMATO_FRUIT_EXPORT × yield  → only what leaves in fruit
//   biomass_mg  = BIOMASS_DEMAND[stage]        → ongoing canopy + new structures
// At T5 fruit dominates (yield-driven); at T1-T3 biomass IS the demand
// (little/no fruit yet). See BIOMASS_DEMAND comment block for sources.
//
// Returns an object per element with the breakdown:
//   { fruit: <mg/m²/wk from yield>, biomass: <mg/m²/wk from stage>, total }
// so the Bilan UI can show the split.
// REQ-081: Ca and Mg are xylem-mobile only; their uptake IS mass-flow, not
// a fixed "demand" decoupled from transpiration. When canopy or seasonal
// transpiration drops (QC winter ~40-60% of Mediterranean baseline), the
// plant cannot pull Ca/Mg at the rate BIOMASS_DEMAND assumes — apparent
// "demand" drops with it. Phloem-mobile macros (N, P, K) and active-transport
// micros are decoupled from instantaneous transpiration via redistribution
// and root-pump kinetics, so they keep the un-scaled biomass term.
const TRANSP_COUPLED_BIOMASS = { Ca: true, Mg: true };

function calculateNutritionDemand(yieldKgPerM2, stage, transpFactor = 1.0) {
  const out = {};
  const bio = BIOMASS_DEMAND[stage] || {};
  Object.keys(TOMATO_FRUIT_EXPORT).forEach(el => {
    const fe = TOMATO_FRUIT_EXPORT[el];
    // Fruit export: fe.g is g/kg fruit for macros, kg/kg×10⁻³ for micros
    // (uniform field "g" but unit interp differs). ×1000 converts both to mg.
    //   fruit_mg = yieldKgPerM2 × export_per_kg × 1000
    const fruit_mg = yieldKgPerM2 * fe.g * 1000;
    let biomass_mg = bio[el] || 0;
    if (TRANSP_COUPLED_BIOMASS[el]) biomass_mg *= transpFactor;
    const total_mg = fruit_mg + biomass_mg;
    out[el] = { fruit: fruit_mg, biomass: biomass_mg, total: total_mg };
  });
  return out;
}

// Browser-globals export
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
  calculateNutritionDemand,

  // Convenience: cert per (stage, el) on the merged transferability scale.
  // Stable fallback to 1 (default placeholder) if the table is missing
  // an entry. See "Cert scale" section in plant-needs/spec.md.
  certFor(stage, el) {
    const row = TOMATO_DEMAND_CERT && TOMATO_DEMAND_CERT[stage];
    return (row && row[el] != null) ? row[el] : 1;
  },
};
