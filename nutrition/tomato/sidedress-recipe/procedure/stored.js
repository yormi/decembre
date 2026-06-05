// Hand-stored sidedress recipe (granular N-source — Actisol 5-3-2 + farine
// de plumes 13-0-0). Per-planche g/wk; total across 7 planches = stored × 7.
// Side-dress effective N at T5 ≈ 2.23 g N/m²/wk (Farine 13%×70% efficiency,
// ca-aware-product-gate gates Actisol out on Ca-saturated soil) vs Tier B demand 4.05 g
// N/m²/wk at peak 1.5 kg/m²/wk yield. FP target at T5 = 1 773 g/planche/wk;
// STORED 1 341 g/planche under-applies by ~24 % — ramp gated on /retire-recipe.
//
// EDITS REQUIRE /retire-recipe SKILL FIRST. Path `STORED_RECIPE.tomato.sidedress`
// preserved verbatim; the skill greps for this identifier.
window.STORED_RECIPE.tomato.sidedress = {
  T1: { actisol_g: 57,  farine_g:  84  },  // sem 51-2 (4 sem)
  T2: { actisol_g: 180, farine_g:  267 },  // sem 3-6 (4 sem)
  T3: { actisol_g: 467, farine_g:  695 },  // sem 7-9 (3 sem)
  T4: { actisol_g: 755, farine_g: 1125 },  // sem 10-18 (9 sem)
  T5: { actisol_g: 0,   farine_g: 2000 },  // sem 19+ — Actisol retiré 2026-05-28 (alignement ca-aware-product-gate / Ca-saturation) ; farine bumpée 1341 → 2000 g/planche pour vigueur additionnelle
};
