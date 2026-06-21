// Nursery feed — hand-stored audit channel for the retired-recipe scheme.
//
// STORED_RECIPE.nursery.fertigation is the currently-APPLIED nursery feed,
// mirroring the adopted NURSERY_RECIPE_DEFAULT (per-litre concentrations;
// powders g/L, liquids mL/L ≈ g/L). It exists so RECIPE_HISTORY can diff a
// retired recipe against the live one on the Historique des nutriments page,
// keeping the organic-cert audit trail intact.
//
// Changing the nursery feed: go through /retire-recipe — snapshot the OLD
// values into RECIPE_HISTORY (app/historique-nutriments/history.js) BEFORE
// editing here, then keep this in step with NURSERY_RECIPE_DEFAULT.
(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  window.STORED_RECIPE = window.STORED_RECIPE || {};
  window.STORED_RECIPE.nursery = {
    fertigation: {
      Ocean_15_1_1:  2.0,    // g/L
      AcadiePoisson: 1.5,    // mL/L
      AcadieKelp:    1.0,    // mL/L
      IronSulfate:   0.015,  // g/L (≈ 15 mg/L → ~3 ppm Fe)
    },
  };
})();
