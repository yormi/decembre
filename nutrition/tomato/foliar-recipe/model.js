// Public API for the tomate foliar-recipe model.
//
// Spec:    nutrition/tomato/foliar-recipe/spec.md
// REQ-103: this namespace exists at runtime with the keys below.
//
// Consumers (Bilan supply chain via calculateNutritionSupply, future yucca-decision
// drift gauge) should reach for
// `window.FoliarRecipeTomato` instead of the bare constants — the
// internal coverage model + recipe parsing can then be reshaped (yucca
// on/off, per-stage doses, B back to foliar) without breaking call sites.
window.FoliarRecipeTomato = {
  // Tomato bed area used for per-m² conversion. Live value re-read each
  // call so a future bed-reconfiguration through TOMATO_NUMBER_BEDS /
  // TOMATO_BED_AREA flows here automatically.
  get AREA_M2() { return TOMATO_NUMBER_BEDS * TOMATO_BED_AREA; },
  // Coverage % without surfactant (REQ-101 default). 0.30, cert 4.
  FOLIAR_COVERAGE_DEFAULT:    FOLIAR_COVERAGE_DEFAULT,
  // Coverage % with yucca (cert 4). Consumed when surfactant=true.
  FOLIAR_COVERAGE_WITH_YUCCA: FOLIAR_COVERAGE_WITH_YUCCA,
  // Per-element efficiency (REQ-157) — coverage × foliarPhResponse at
  // current no-yucca regime and default spray tank pH. Cert 3. Returns
  // 0.27 uniform for Mn/Zn/Cu/Fe/Mo; B absent (single-channel via
  // fertigation, REQ-061).
  efficiency:                 FOLIAR_EFFICIENCY_AT_CURRENT_CONDITIONS,
  // REQ-115 — per-element burn cap base (g per 15 L master tank). Cert 3.
  BURN_CAP_BASE_G,
  // REQ-115 — per-element burn cap (surfactant has no effect; see learnings.md).
  burnCapG,
  // Delivery function (REQ-101 + REQ-103 + REQ-112).
  computeFoliarSupply,
  // REQ-115 / REQ-116 — gap-maximizing recipe derivation.
  computeFoliarRecipeForGap,
};
