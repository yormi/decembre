// nutrition/nursery/fertigation/calc.js
//
// Pure functions for nursery weekly fertigation. No DOM, no globals.
// Reads NURSERY_PRODUCTS from window.__NURSERY_FERT_DATA__ (set by data.js).
//
//   nurseryRecipeSupply(recipe, trayVolumeL)
//     given  recipe  = { Ocean_15_1_1: gPerL, AcadiePoisson: gPerL, AcadieKelp: gPerL }
//     and    trayVolumeL = L per tray per application (default 1.25)
//     return { perTray_mg: { N, P, K, ... } }  weekly-delivered mg of each
//            element per tray (sum across products, base[element] × dose × volume).
//
//   nurseryRecipeCE(recipe, dilution = 1)
//     return mS/cm at 20 °C — water_baseline + Σ ecFactor × gPerL × dilution.
//     Mirrors index.html `predictedCE` shape; uses LOCAL ecFactor values
//     (calibrated from Décembre solution-EC measurements; see data.js).
//
//   nurseryRecipeTankPh(recipe, waterPh = 6.26)
//     return predicted tank pH = waterPh + Σ phContribution × gPerL.
//     Same linear sum as global `predictedTankPh`. Clamped to [2.0, 12.0].
//     Default waterPh = Décembre source water 6.26 (Berger 2026-04-10).

(function () {
  'use strict';

  function getProducts() {
    const d = (typeof window !== 'undefined') && window.__NURSERY_FERT_DATA__;
    return d ? d.NURSERY_PRODUCTS : {};
  }

  // Coerce applicationsPerWeek to integer ∈ [1, 7] (applications-per-week-positive-integer). Fractional
  // values are rounded; out-of-range values clamped. NaN/undefined → 1.
  function coerceApplications(N) {
    if (typeof N !== 'number' || !isFinite(N)) return 1;
    return Math.max(1, Math.min(7, Math.round(N)));
  }

  // Sum delivered mg of each element across all products in the recipe,
  // multiplied by tray volume × applicationsPerWeek (supply-scales-linearly-with-applications). Each product
  // contributes base[element] × g/L × L × 1000 mg per fertigation; multiply by
  // applicationsPerWeek for total weekly supply.
  // contribution-channel-details-payload — also returns `details[element] = { cert, cap }` per element. cap
  // fires when the recipe is at the EC cap and pushing higher would exceed
  // it (currently rare at default doses); otherwise null.
  function nurseryRecipeSupply(recipe, trayVolumeL, applicationsPerWeek) {
    if (typeof trayVolumeL !== 'number' || !isFinite(trayVolumeL) || trayVolumeL <= 0) {
      trayVolumeL = 1.25;
    }
    const N = coerceApplications(applicationsPerWeek);
    const PRODUCTS = getProducts();
    const perTray_mg = {};
    const details = {};
    const efficiency = {};
    if (!recipe || typeof recipe !== 'object') return { perTray_mg, details, efficiency };
    // Per-element cert: min(product cert) across contributing products.
    const elCertContrib = {};
    for (const name of Object.keys(recipe)) {
      const p = PRODUCTS[name];
      if (!p || !p.base) continue;
      const gPerL = Number(recipe[name]) || 0;
      if (gPerL <= 0) continue;
      const massPerTray_g = gPerL * trayVolumeL * N;   // total product mass per tray per week
      for (const element of Object.keys(p.base)) {
        const frac = Number(p.base[element]) || 0;
        if (frac <= 0) continue;
        const mg = massPerTray_g * frac * 1000;        // g → mg
        perTray_mg[element] = (perTray_mg[element] || 0) + mg;
        if (!elCertContrib[element]) elCertContrib[element] = [];
        elCertContrib[element].push(Number(p.cert) || 3);
      }
    }
    // contribution-channel-details-payload (revised 2026-05-10 evening) — per-element details. cap is
    // the structural reason this channel under-delivers when there's a gap.
    // Distinguishes:
    //   - `damage` (🔥) — element is sourced in the recipe but pushing the
    //     dose higher would breach EC cap (predicted-ce-under-nursery-cap)
    //   - `other`  (❗) — no product in the recipe carries this element
    //     (and other channels would need to source it instead)
    const data = (typeof window !== 'undefined' && window.__NURSERY_FERT_DATA__) || {};
    const ceCap = Number(data.NURSERY_CE_CAP_MS_CM) || 3.0;
    const ce = nurseryRecipeCE(recipe, 1);
    // Cover all elements the recipe COULD touch (sourced) and key elements
    // operators care about even if not sourced (Ca, Mg, micros).
    const allEls = ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'];
    // contribution-channel-details-payload (4-field schema 2026-05-11): per element classification.
    const FERT_SOURCE_LEVER = {
      K:  'ajouter K₂SO₄ à la recette',
      Mg: 'ajouter MgSO₄·7H₂O',
      Ca: 'source Ca soluble Ecocert',
      Fe: '↑ dose foliaire micros',
      Mn: '↑ dose foliaire micros',
      Zn: '↑ dose foliaire micros',
      Cu: '↑ dose foliaire micros',
      B:  '↑ dose foliaire micros',
      Mo: '↑ dose foliaire micros',
      N:  '↑ poisson hydrolysé',
      P:  '↑ Acadie poisson',
    };
    for (const element of allEls) {
      const supplied = perTray_mg[element] || 0;
      const certs = elCertContrib[element] || [3];
      const minCert = certs.reduce((a, b) => Math.min(a, b), 5);
      if (supplied > 0) {
        const headroom = (ceCap - ce) / Math.max(0.01, ce);
        details[element] = {
          cert: minCert,
          cap: {
            kind: 'damage',
            constraint: 'CE bidon',
            limit: 'max ' + ceCap.toFixed(1) + ' mS/cm (actuelle ' + ce.toFixed(2) + ')',
            lever: '↑ fréquence applications/sem',
            uncappedMg: supplied * (1 + Math.max(0, headroom)),
          },
        };
      } else {
        details[element] = {
          cert: minCert,
          cap: {
            kind: 'other',
            constraint: 'Pas de source dans la recette',
            limit: '0 mg via fertigation',
            lever: FERT_SOURCE_LEVER[element] || 'ajouter un produit porteur',
            uncappedMg: 0,
          },
        };
      }
    }
    // channel-efficiency-capability-map — per-element efficiency for nursery fertigation. Dissolved
    // delivery at tank pH 5-6 (predicted-tank-ph-in-nursery-envelope envelope); products bypass soil-pH
    // chemistry. Amino-N from fish hydrolysate is already in plant-available
    // form (no mineralization step). Routed elements (mg > 0) get 1.0;
    // non-routed elements stay absent.
    for (const element of allEls) {
      const supplied = perTray_mg[element] || 0;
      if (supplied > 0) efficiency[element] = 1.0;
    }
    return { perTray_mg, details, efficiency };
  }

  // Smallest integer N ∈ [1, 7] such that N × per-fertigation supply covers
  // demandPerTray for every element where the recipe has a source (min-applications-solves-full-coverage).
  // Returns null when:
  //   - per-fertigation EC > ceCap (recipe is dose-bound, not frequency-bound)
  //   - even at N = 7 some sourced element falls short of demand
  // Returns 1 when already covered at single weekly application.
  function minimumApplicationsPerWeek(recipe, demandPerTray, trayVolumeL, ceCap) {
    if (!recipe || typeof recipe !== 'object') return null;
    if (!demandPerTray || typeof demandPerTray !== 'object') return null;
    if (typeof trayVolumeL !== 'number' || !isFinite(trayVolumeL) || trayVolumeL <= 0) {
      trayVolumeL = 1.25;
    }
    if (typeof ceCap === 'number' && isFinite(ceCap) && ceCap > 0) {
      // Per-fertigation EC must clear cap regardless of frequency (ec-cap-per-fertigation-not-per-week).
      const CE = nurseryRecipeCE(recipe, 1);
      if (CE > ceCap) return null;
    }
    const sup1 = nurseryRecipeSupply(recipe, trayVolumeL, 1);
    let minimumN = 1;
    for (const element of Object.keys(demandPerTray)) {
      const need = Number(demandPerTray[element]) || 0;
      if (need <= 0) continue;
      const suppliedForElement = (sup1.perTray_mg || {})[element] || 0;
      if (suppliedForElement <= 0) continue;                        // unsourced — elements-sourced-vs-unsourced territory
      const required = Math.ceil(need / suppliedForElement);
      if (required > minimumN) minimumN = required;
    }
    if (minimumN > 7) return null;
    return minimumN;
  }

  // Classify demand elements as sourced (recipe delivers any of this
  // element via a product in NURSERY_PRODUCTS) vs unsourced (no product
  // in the recipe carries it) (elements-sourced-vs-unsourced). LITERAL interpretation — whether
  // frequency can cover the demand is a separate check (minimumApplicationsPerWeek
  // returns null in the dose-bound case). The two failure modes are
  // operationally different:
  //   - sourced + dose-bound: increase per-fert dose (until EC binds)
  //   - unsourced:            add a new product to the recipe
  function nurseryElementsBySource(recipe, demandPerTray, trayVolumeL) {
    if (typeof trayVolumeL !== 'number' || !isFinite(trayVolumeL) || trayVolumeL <= 0) {
      trayVolumeL = 1.25;
    }
    const sup1 = nurseryRecipeSupply(recipe, trayVolumeL, 1);
    const sourced = [];
    const unsourced = [];
    const els = (demandPerTray && typeof demandPerTray === 'object')
      ? Object.keys(demandPerTray)
      : ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'];
    for (const element of els) {
      const suppliedForElement = (sup1.perTray_mg || {})[element] || 0;
      if (suppliedForElement > 0) sourced.push(element);
      else unsourced.push(element);
    }
    return { sourced, unsourced };
  }

  // Predicted solution CE in the watering bucket (mS/cm at 20 °C).
  // dilution = 1 means measure the bucket directly (no Dosatron in nursery).
  // waterCE: clean tap baseline ~0.10 mS/cm (Berger 39086, April 2026).
  function nurseryRecipeCE(recipe, dilution) {
    if (typeof dilution !== 'number' || !isFinite(dilution)) dilution = 1.0;
    const PRODUCTS = getProducts();
    let CE = 0.10;                                     // water baseline; cert 4
    if (!recipe || typeof recipe !== 'object') return CE;
    for (const name of Object.keys(recipe)) {
      const p = PRODUCTS[name];
      if (!p) continue;
      const gPerL = Number(recipe[name]) || 0;
      if (gPerL <= 0) continue;
      CE += (Number(p.ecFactor) || 0) * gPerL * dilution;
    }
    return CE;
  }

  // Predicted tank pH (linear sum, no buffering). Same shape as global
  // predictedTankPh, but reads NURSERY_PRODUCTS so the local ecFactor /
  // phContribution calibration applies. Clamp to plausible range so a
  // miswritten recipe can't return pH = -3.
  function nurseryRecipeTankPh(recipe, waterPh) {
    // Default = Décembre source water pH 6.26 (Berger analysis 2026-04-10,
    // EC 0.10), not a generic 7.0. The leaner salt-control recipe adds little
    // acid, so the real source pH is what keeps the tank in [4.5, 6.5].
    if (typeof waterPh !== 'number' || !isFinite(waterPh)) waterPh = 6.26;
    const PRODUCTS = getProducts();
    let pH = waterPh;
    if (recipe && typeof recipe === 'object') {
      for (const name of Object.keys(recipe)) {
        const p = PRODUCTS[name];
        if (!p) continue;
        const gPerL = Number(recipe[name]) || 0;
        pH += (Number(p.phContribution) || 0) * gPerL;
      }
    }
    return Math.max(2.0, Math.min(12.0, pH));
  }

  if (typeof window !== 'undefined') {
    window.__NURSERY_FERT_CALC__ = {
      nurseryRecipeSupply,
      nurseryRecipeCE,
      nurseryRecipeTankPh,
      minimumApplicationsPerWeek,
      nurseryElementsBySource,
    };
  }
})();
