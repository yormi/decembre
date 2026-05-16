// nutrition/nursery/fertigation/model.js
//
// Public namespace for the nursery weekly fertigation subproject. Wires
// data.js (constants) + calc.js (pure functions) onto window.FertigationNursery
// so the verifier (REQ-103) can reach them and the Salanova nursery admin
// page (sister subproject) can consume them.
//
// Load order in the bundled page is:
//   1. data.js   → window.__NURSERY_FERT_DATA__
//   2. calc.js   → window.__NURSERY_FERT_CALC__
//   3. model.js  → window.FertigationNursery (this file)

(function () {
  'use strict';

  if (typeof window === 'undefined') return;

  const D = window.__NURSERY_FERT_DATA__ || {};
  const C = window.__NURSERY_FERT_CALC__ || {};

  window.FertigationNursery = {
    // Constants (REQ-103 — namespace presence; per-key shapes verified by REQ-098/099/102)
    NURSERY_PRODUCTS:               D.NURSERY_PRODUCTS,
    NURSERY_FERTIGATION_DEFAULTS:   D.NURSERY_FERTIGATION_DEFAULTS,
    NURSERY_RECIPE_DEFAULT:         D.NURSERY_RECIPE_DEFAULT,
    NURSERY_CE_CAP_MS_CM:           D.NURSERY_CE_CAP_MS_CM,
    NURSERY_TANK_PH_RANGE:          D.NURSERY_TANK_PH_RANGE,

    // Pure functions
    nurseryRecipeSupply:            C.nurseryRecipeSupply,
    nurseryRecipeCE:                C.nurseryRecipeCE,
    nurseryRecipeTankPh:            C.nurseryRecipeTankPh,
    minimumApplicationsPerWeek:         C.minimumApplicationsPerWeek,
    nurseryElementsBySource:        C.nurseryElementsBySource,
  };
})();
