// Chemistry — pH-response curves + foliar-uptake curve + effective efficiency.
//
// Pure functions over PRODUCT (declared in sibling products.js). Carved out
// of nutrition/tomato/lib/recipe-math.js 2026-05-23 (Phase 2 chemistry
// pull-up).

// ph-aware-effective-efficiency — pH-aware effective efficiency curves.
// Each function takes soilPh and returns a multiplier 0..1.
// Source: Cadre framework table (see nutrient-model-reference.md §3.4) +
// Marschner soil-chemistry curves. Cert 3-4.
const PH_RESPONSE = {
  // Cation exchange + soluble salt: K, Mg, Ca all flat across agronomic pH.
  // Tiny drop above 7.5 reflects competition with Ca-saturation. cert 4
  'soluble-cation': function(ph) {
    if (ph <= 7.0) return 1.0;
    if (ph >= 8.0) return 0.85;
    return 1.0 - 0.15 * (ph - 7.0);
  },
  // Sulfate-form transition metals (Fe, Mn, Zn, Cu): sigmoid drop.
  // 1.0 at pH 6.0; 0.50 at pH 7.0; 0.10 at pH 7.4; 0.05 at pH 7.8+. cert 4
  'sulfate-metal': function(ph) {
    if (ph <= 6.0) return 1.0;
    if (ph >= 7.8) return 0.05;
    // Logistic-shaped piecewise
    if (ph <= 7.0) return 1.0 - 0.50 * (ph - 6.0);
    if (ph <= 7.4) return 0.50 - 1.00 * (ph - 7.0);    // 0.50 → 0.10
    return 0.10 - 0.125 * (ph - 7.4);                   // 0.10 → 0.05
  },
  // EDTA: stable to pH ~6.5 then collapses. cert 4
  'chelate-edta': function(ph) {
    if (ph <= 6.5) return 1.0;
    if (ph >= 7.5) return 0.10;
    return 1.0 - 0.90 * (ph - 6.5);
  },
  // EDDHA: flat across full agronomic pH. cert 5
  'chelate-eddha': function(ph) {
    return (ph >= 4.0 && ph <= 9.0) ? 1.0 : 0.5;
  },
  // DTPA: stable to ~7.5. cert 4
  'chelate-dtpa': function(ph) {
    if (ph <= 7.5) return 1.0;
    if (ph >= 8.5) return 0.20;
    return 1.0 - 0.80 * (ph - 7.5);
  },
  // Organic N mineralization: temperature-dependent, pH less so but mild
  // suppression > 7.5 from Ca saturation slowing microbes. cert 3
  'organic-N': function(ph) {
    if (ph <= 7.5) return 1.0;
    if (ph >= 8.5) return 0.7;
    return 1.0 - 0.30 * (ph - 7.5);
  },
  // Organic P mineralization × Ca-P precipitation. cert 4 (matches Cadre 5-15%).
  'organic-P': function(ph) {
    if (ph <= 6.0) return 1.0;
    if (ph >= 7.4) return 0.10;
    return 1.0 - 0.643 * (ph - 6.0);
  },
  // Borate: flat, slight rise in availability with pH up to 8 (boric acid → B(OH)4⁻). cert 3
  'borate': function(ph) {
    return 1.0;
  },
  // Molybdate: prefers alkaline (anion). cert 4
  'molybdate': function(ph) {
    if (ph <= 5.5) return 0.30;
    if (ph >= 7.0) return 1.0;
    return 0.30 + 0.467 * (ph - 5.5);
  },
  // Foliar bypass — soil pH irrelevant (different curve = foliarPhResponse for spray pH). cert 5
  'foliar-bypass': function(ph) {
    return 1.0;
  },
};

// foliar-uptake-ph-curve — Foliar uptake pH multiplier (cuticle absorption window).
// Curve from foliar-uptake-ph-curve table; linear interpolation between anchors. cert 3.
function foliarPhResponse(ph) {
  if (ph <= 4.0) return 0.5;
  if (ph <= 4.5) return 0.5 + (0.7 - 0.5) * (ph - 4.0) / 0.5;
  if (ph <= 5.0) return 0.7 + (0.9 - 0.7) * (ph - 4.5) / 0.5;
  if (ph <= 5.5) return 0.9 + (1.0 - 0.9) * (ph - 5.0) / 0.5;
  if (ph <= 6.0) return 1.0;
  if (ph <= 6.5) return 1.0 + (0.95 - 1.0) * (ph - 6.0) / 0.5;
  if (ph <= 7.0) return 0.95 + (0.85 - 0.95) * (ph - 6.5) / 0.5;
  if (ph <= 7.5) return 0.85 + (0.70 - 0.85) * (ph - 7.0) / 0.5;
  if (ph <= 8.0) return 0.70 + (0.50 - 0.70) * (ph - 7.5) / 0.5;
  return 0.5;
}

// ph-aware-effective-efficiency, no-decorative-products-at-current-ph, foliar-uptake-ph-curve — Effective efficiency for a (product, element).
// Returns 0..1 representing fraction of label-stated mass that reaches plant.
//
// Routing rule (no-decorative-products-at-current-ph):
//   - Soil/fertigation channels: apply PH_RESPONSE[phClass](soilPh).
//     Soil pH gates rhizosphere availability via Ksp / chelate stability.
//   - Foliar channel: SKIP soil-pH penalty entirely. Cuticle uptake is
//     governed by the spray tank pH (foliarPhResponse) + coverage factor.
//     Mn/Zn/Cu sulfates carry phClass:'sulfate-metal' for documentation
//     consistency, but in the foliar context that curve is irrelevant —
//     soil pH never touches the leaf surface.
//   - Verifier note: no-decorative-products-at-current-ph should pass sprayPh (or rely on the foliar
//     branch below) when checking foliar products. Calling
//     effectiveEfficiency('MnSO4','Mn', soilPh) without a foliar context would
//     STILL bypass soil-pH for foliar products by design here.
function effectiveEfficiency(productName, element, soilPh, sprayPh) {
  if (sprayPh === undefined) sprayPh = null;
  const p = PRODUCT[productName];
  if (!p || !p.base || !p.base[element]) return 0;
  const cls = (typeof p.phClass === 'string') ? p.phClass : (p.phClass || {})[element];
  const base = 1.0;                                  // efficiency, not mass fraction (mass fraction handled by p.base[element])
  let phMod = 1.0;
  let fieldMod = 1.0;
  if (p.ch === 'foliar') {
    // Foliar: soil pH irrelevant by definition (cuticle uptake bypasses
    // rhizosphere). Use foliarPhResponse(tankPh) + coverage factor only.
    fieldMod *= foliarPhResponse(sprayPh != null ? sprayPh : 5.5);
    fieldMod *= 0.30;                                // coverage factor — fixed 0.30 (no yucca per 2026-05-05 decision)
  } else {
    // Soil/fertigation: apply rhizosphere pH curve.
    if (cls && PH_RESPONSE[cls]) phMod = PH_RESPONSE[cls](soilPh);
  }
  return base * phMod * fieldMod;
}

// Browser-globals export
window.NutritionPhResponse = { PH_RESPONSE, foliarPhResponse, effectiveEfficiency };
