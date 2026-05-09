// Public API for the tomate foliar-recipe model.
//
// Spec:    nutrition/tomato/foliar-recipe/spec.md
// REQ-103: this namespace exists at runtime with the keys below.
//
// Consumers (Bilan supply chain via calcNutrSupply, "Recette proposée"
// admin card, future yucca-decision drift gauge) should reach for
// `window.FoliarRecipeTomato` instead of the bare constants — the
// internal coverage model + recipe parsing can then be reshaped (yucca
// on/off, per-stage doses, B back to foliar) without breaking call sites.
window.FoliarRecipeTomato = {
  // Tomato bed area used for per-m² conversion. Live value re-read each
  // call so a future bed-reconfiguration through TOMATO_NUM_BEDS /
  // TOMATO_BED_AREA flows here automatically.
  get AREA_M2() { return TOMATO_NUM_BEDS * TOMATO_BED_AREA; },
  // Coverage % without surfactant (REQ-101 default). 0.30, cert 4.
  FOLIAR_COVERAGE_DEFAULT:    FOLIAR_COVERAGE_DEFAULT,
  // Coverage % with yucca (cert 4). Not currently consumed; exposed for
  // future toggle code when yucca returns to the program.
  FOLIAR_COVERAGE_WITH_YUCCA: FOLIAR_COVERAGE_WITH_YUCCA,
  // Delivery function (REQ-101 + REQ-103). Returns the 11-element
  // mg/m²/wk shape under the no-yucca coverage discount.
  computeFoliarSupply,
};
