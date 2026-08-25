// Nursery feed — hand-stored audit channel for the retired-recipe scheme.
//
// STORED_RECIPE.nursery.fertigation is the currently-APPLIED nursery feed,
// mirroring the adopted NURSERY_RECIPE_DEFAULT (per-litre concentrations;
// powders g/L, liquids mL/L ≈ g/L). It exists so RECIPE_HISTORY can diff a
// retired recipe against the live one on the Historique des nutriments page,
// keeping the organic-cert audit trail intact.
//
// Changing the nursery feed: go through /retire-recipe — snapshot the OLD
// values into RECIPE_HISTORY (app/admin/nutrition/historique/history.js) BEFORE
// editing here, then keep this in step with NURSERY_RECIPE_DEFAULT.
(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  window.STORED_RECIPE = window.STORED_RECIPE || {};
  window.STORED_RECIPE.nursery = {
    fertigation: {
      Gypsum:        0.14,   // g/L — dissolve first, stir
      Ocean_15_1_1:  0.29,   // g/L
      AcadiePoisson: 0.39,   // mL/L
      KSulfate:      0.29,   // g/L
      MgSulfate:     0.058,  // g/L
      IronSulfate:   0.015,  // g/L (≈ 15 mg/L → ~3 ppm Fe)
      MicroStock:    0.1,    // mL/L (stock bottle: MnSO₄ 3.3 / ZnSO₄ 3.7 / Solubor 3.1 / CuSO₄ 0.7 g per L)
    },
  };
})();
