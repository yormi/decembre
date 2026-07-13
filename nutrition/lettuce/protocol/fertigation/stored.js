// Lettuce fertigation — hand-stored audit channel for the retired-recipe scheme.
//
// STORED_RECIPE.lettuce.fertigation is the currently-APPLIED weekly lettuce
// fertigation recipe (grams dissolved in the stock barrel for the whole
// Salanova block, ~136,8 m²), mirroring LETTUCE_FERTIGATION_RECIPE in
// app/core/state.js. It exists so RECIPE_HISTORY can diff a retired recipe
// against the live one on the Historique des nutriments page, keeping the
// organic-cert audit trail intact.
//
// Both products Ecocert CAN/CGSB-32.311 : K₂SO₄ (sulfate de potasse minier),
// Solubore (acide borique, micronutriment — carence B sol < détection au
// dossier).
//
// Changing the lettuce fertigation feed: go through /retire-recipe — snapshot
// the OLD values into RECIPE_HISTORY (app/admin/nutrition/historique/history.js)
// BEFORE editing here, then keep this in step with LETTUCE_FERTIGATION_RECIPE.
(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  window.STORED_RECIPE = window.STORED_RECIPE || {};
  window.STORED_RECIPE.lettuce = {
    fertigation: {
      Potassium: 400,   // g/sem — Sulfate de potassium 0-0-50 (K₂SO₄)
      Bore:      1.3,   // g/sem — Solubore 20,5 % B
    },
  };
})();
