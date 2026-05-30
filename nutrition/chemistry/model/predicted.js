// Chemistry — predicted-CE + predicted tank-pH at the dripper / mix tank.
//
// Pure functions over PRODUCT (declared in sibling products.js). Carved out
// of nutrition/tomato/lib/recipe-math.js 2026-05-23 (Phase 2 chemistry
// pull-up).

// predicted-ce-within-crop-stage-band — Predicted irrigation CE at the dripper.
// recipe = { productName: gPerL_in_tank }; dilution = Dosatron ratio (e.g. 0.02).
// Returns mS/cm at 20°C reference.
function predictedCE(recipe, dilution, waterCE) {
  if (dilution === undefined) dilution = 1.0;
  if (waterCE === undefined) waterCE = 0.10;
  let CE = waterCE;
  for (const name in recipe) {
    if (!Object.prototype.hasOwnProperty.call(recipe, name)) continue;
    const p = PRODUCT[name];
    if (!p) continue;
    const gPerL = recipe[name];
    CE += (p.ecFactor || 0) * gPerL * dilution;
  }
  return CE;
}

// predicted-tank-ph-within-envelope — Predicted tank pH (linear sum of phContributions × g/L).
// Rough first-pass; assumes no buffering. cert 2-3.
function predictedTankPh(recipe, waterPh) {
  if (waterPh === undefined) waterPh = 7.0;
  let pH = waterPh;
  for (const name in recipe) {
    if (!Object.prototype.hasOwnProperty.call(recipe, name)) continue;
    const p = PRODUCT[name];
    if (!p) continue;
    pH += (p.phContribution || 0) * recipe[name];
  }
  return Math.max(2.0, Math.min(12.0, pH));
}

// Browser-globals export
window.NutritionPredicted = { predictedCE, predictedTankPh };
