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
  // Coverage % without surfactant (REQ-101 default). 0.30, cert 3.
  FOLIAR_COVERAGE_DEFAULT:    FOLIAR_COVERAGE_DEFAULT,
  // Coverage % with yucca (cert 3). Consumed when surfactant=true.
  FOLIAR_COVERAGE_WITH_YUCCA: FOLIAR_COVERAGE_WITH_YUCCA,
  // Per-element efficiency (REQ-157) — default-regime map (surfactant=false).
  // Cert 3. Returns 0.27 uniform for Mn/Zn/Cu/Fe; B absent (single-channel
  // via fertigation, REQ-061); Mo absent (retired from foliar 2026-05-16,
  // REQ-061 carve-out). Caller-friendly for code that doesn't thread the
  // surfactant lever.
  efficiency:                 FOLIAR_EFFICIENCY_AT_CURRENT_CONDITIONS,
  // REQ-170 — surfactant-aware efficiency. Function returning the
  // per-element map; surfactant=true flips coverage 0.30 → 0.80 → uniform
  // value 0.27 → 0.72 across Mn/Zn/Cu/Fe. Cert 3. Consumers that thread
  // the Block 5 surfactant lever call this; static .efficiency stays for
  // back-compat with the default regime.
  efficiencyFor:              foliarEfficiency,
  // REQ-115 — per-element burn cap base (g per 15 L master tank). Cert 3 for
  // Mn/Zn/Fe/Mo/B (extension mid-band); cert 2 for Cu (Décembre-internal,
  // non-transferable).
  BURN_CAP_BASE_G,
  // REQ-115 — per-element burn cap (surfactant has no effect; see learnings.md).
  burnCapG,
  // REQ-115 — per-element min-dose floor map (g per 15 L master tank).
  // Cu's 0.2 g is the load-bearing case (narrow toxicity); others at 0.5 g.
  MIN_DOSE_G_PER_ELEMENT,
  // Delivery function (REQ-101 + REQ-103 + REQ-112).
  computeFoliarSupply,
  // REQ-115 / REQ-116 — gap-maximizing recipe derivation.
  computeFoliarRecipeForGap,
};
