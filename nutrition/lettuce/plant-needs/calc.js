// Salanova — plant-needs pure-function layer.
//
// Two pure functions extracted from app/index.html on 2026-05-16:
//   calculateLettuceNutritionDemand — mass-gain × DM × tissue-concentration
//   calculateLettuceNutritionSupply — soil mass-flow + fertigation + front-load
//
// Both functions are pure: they accept every input explicitly and read no
// globals, no `window`, no `Date.now()`. Callers (today: the Salanova subpage
// builder in `nutrition/lettuce/app/logic.js`) resolve every dependency at
// the integrator boundary and pass them through the `dependencies` bag.
//
// Formula provenance, certainty, and refinement triggers live in
// `nutrition/lettuce/plant-needs/derivation.md`.
// Pre-carve global-reading history lives in `learnings.md`.

// Demand per element (mg/m²/wk) for a Salanova cycle gaining (targetG−transplantG)
// over `cycleDays` at `density` plants/m².
//   massGain_kg_m2_total = (target_g − transplant_g) × density / 1000
//   dwGain_g_m2_per_wk   = massGain × DM × 1000 × (7 / cycleDays)
//   demand_mg_m2_per_wk[element] = dwGain × LETTUCE_TISSUE_DW[element] × 1000
function calculateLettuceNutritionDemand(transplantG, targetG, cycleDays, density) {
  const massGain_kg_m2 = Math.max(0, (targetG - transplantG)) * density / 1000;
  const days = Math.max(1, cycleDays);
  const dwPerWk_g_m2 = massGain_kg_m2 * LETTUCE_DM_FRACTION * 1000 * (7 / days);
  const out = {};
  Object.keys(LETTUCE_TISSUE_DW).forEach(element => {
    out[element] = dwPerWk_g_m2 * LETTUCE_TISSUE_DW[element] * 1000;  // mg/m²/wk
  });
  return out;
}

// Supply per element (mg/m²/wk) decomposed into three contributions:
//   soil:      SME_LETTUCE_PPM × weeklyMassFlowL × canopyFactor; pH-locked
//              entries (P / Mn / Zn / Fe) gated when phLocked.
//   fert:      LETTUCE recipe constants × PRODUCT_PCT × 1000 / 100 (recipe
//              is per 100 m²/wk). Fe × 0.15 if phLocked.
//   frontload: feather meal N spread over LETTUCE_FRONTLOAD_DEFAULTS
//              mineralizationWeeks.
// Canopy factor: lettuce transpires less per m² than tomato (smaller plants,
// shorter cycle). Scale with current/target mass ratio × 0.7 cap; floor 0.2
// for stunted plants. Cert 3 — refine on tissue or bed-level transpiration data.
//
// Pure: every external constant arrives via the `dependencies` parameter so
// the function can be unit-tested without spinning up the full app context.
//   dependencies.weeklyMassFlowL          — number (L/m²/wk) — irrigation volume
//   dependencies.smeLettucePpm            — object — soil-solution per-element ppm
//   dependencies.lettuceRecipe            — { kSulfate, mgSulfate, feSulfate } (g/100m²/wk)
//   dependencies.productPct               — full PRODUCT_PCT map (K2SO4_K, MgSO4_Mg, FeSO4_Fe, FarinePlumes_N)
//   dependencies.featherMealMineralizationEfficiency — number — 0.75 default
//   dependencies.frontloadDefaults        — LETTUCE_FRONTLOAD_DEFAULTS shape
function calculateLettuceNutritionSupply(currentG, targetG, density, phLocked, frontload_g_per_m2, dependencies) {
  const flowL = dependencies.weeklyMassFlowL;
  const canopyFactor = Math.max(0.2, Math.min(0.7,
    (currentG / Math.max(1, targetG)) * 0.7));

  const soil = {};
  Object.keys(LETTUCE_TISSUE_DW).forEach(element => {
    const ppm = (dependencies.smeLettucePpm && dependencies.smeLettucePpm[element]) || 0;
    let mass = ppm * flowL * canopyFactor;
    if (phLocked && (element === 'P' || element === 'Mn' || element === 'Zn')) {
      mass = Math.min(mass, 100);     // passive-supply-lockout-gate
    }
    if (phLocked && element === 'Fe') {
      mass *= 0.15;                    // pH 7.4 root reductase suppressed (cert 3)
    }
    soil[element] = mass;
  });

  const area100 = 100;  // LETTUCE recipe constants are per 100 m²/wk
  const recipe = dependencies.lettuceRecipe;
  const productPct = dependencies.productPct;
  const fert = {};
  Object.keys(LETTUCE_TISSUE_DW).forEach(element => { fert[element] = 0; });
  fert.K  = (recipe.kSulfate  * productPct.K2SO4_K  * 1000) / area100;
  fert.Mg = (recipe.mgSulfate * productPct.MgSO4_Mg * 1000) / area100;
  const feLabelMg = (recipe.feSulfate * productPct.FeSO4_Fe * 1000) / area100;
  fert.Fe = phLocked ? feLabelMg * 0.15 : feLabelMg;

  const frontload = {};
  Object.keys(LETTUCE_TISSUE_DW).forEach(element => { frontload[element] = 0; });
  const fmWeeks = dependencies.frontloadDefaults.mineralizationWeeks;
  const featherMealEfficiency = dependencies.featherMealMineralizationEfficiency;
  frontload.N = (frontload_g_per_m2 || 0) * productPct.FarinePlumes_N
              * featherMealEfficiency * 1000 / fmWeeks;
  // channel-efficiency-capability-map — per-element efficiency for front-load channel. Farine de plumes
  // is N-only (13-0-0); efficiency = mineralization rate distributed over
  // the release window.
  frontload.efficiency = {};
  if (frontload.N > 0) frontload.efficiency.N = featherMealEfficiency;

  const total = {};
  Object.keys(LETTUCE_TISSUE_DW).forEach(element => {
    total[element] = (soil[element] || 0) + (fert[element] || 0) + (frontload[element] || 0);
  });
  return { soil, fert, frontload, total, canopyFactor };
}
