// Fertigation-recipe — first-principles derivation function.
//
// Spec:        nutrition/tomato/fertigation-recipe/spec.md
// Derivation:  nutrition/tomato/fertigation-recipe/derivation.md
//
// REQ-098: returned values match the mass-balance derivation.
// REQ-099: namespace exposed via window.FertigationRecipeTomato (model.js).

// ─── computeStageRecipe — MASS-BALANCE replenishment of K and Mg ────────
//
// FP target generator (mass-balance from RECIPE_INPUTS). NOT the team-facing
// stored fertigation — that's STORED_RECIPE.tomato.fertigation, hand-locked
// at PA Taillon's April 2026 values. computeStageRecipe is read by:
//   - Block 7 stored-vs-FP drift gauge (renderPhase1Comparison)
//   - calcNutrSupply when nutrRecipeMode === 'fp'
//   - computeStageSidedress (sidedress mass-balance variant — N-only)
//
// Formula (per element, total tomato area = 382.9 m²):
//   offtake_mg/m²/wk     = TOMATO_FRUIT_EXPORT × stage_yield × 1000 + BIOMASS_DEMAND[stage]
//   sidedress_mg/m²/wk   = STORED_RECIPE.tomato.sidedress[stage].actisol_g
//                            × element_pct × min_eff × 1000 / SIDEDRESS_AREA_PER_PLANCHE
//   compost_mg/m²/wk     = NOT subtracted (decision 2026-05-07; see derivation.md)
//   needed_mg/m²/wk      = max(0, offtake − sidedress)
//   product_g_total      = round(needed / 1000 / element_pct × total_area)
//
// "offtake" = full plant uptake (fruit export + biomass build-out). Biomass
// nutrients leave the system at end of cycle (plants pulled, biomass removed
// off-site), so they count as offtake too.
//
// COMPOST IS NOT SUBTRACTED (decision 2026-05-07): compost release is
// uncertain (especially Mg, cert 1-2 with no label data) and finite (declines
// over 18-24 months). Treating it as a deduction would silently under-feed
// when it runs out. Mass-balance principle: fertigation must replenish ALL
// plant consumption regardless of compost contribution. Compost becomes a
// margin of safety that grows the bank rather than a credit against
// fertigation. The Compost block on the Nutrition page still shows compost
// release for awareness but no longer enters the cascade math.
//
// Returns { kSulfate, mgSulfate } in grams (rounded). Total weekly dose for
// the 7-bed × 54.7 m² tomato area.
function computeStageRecipe(stage) {
  const y = RECIPE_INPUTS.stageYield[stage] || 0;
  const totalArea = TOMATO_NUM_BEDS * TOMATO_BED_AREA;
  const sd = STORED_RECIPE.tomato.sidedress[stage] || { actisol_g: 0, farine_g: 0 };
  const biomass = BIOMASS_DEMAND[stage] || {};

  // ── K ──
  const k_offtake_mg = (TOMATO_FRUIT_EXPORT.K.g * 1000 * y) + (biomass.K || 0);
  const k_sd_mg = (sd.actisol_g * PRODUCT_PCT.Actisol_K * (SIDEDRESS_MIN_EFF.K || 0.85) * 1000) / SIDEDRESS_AREA_PER_PLANCHE;
  const k_fert_mg_per_m2 = Math.max(0, k_offtake_mg - k_sd_mg);
  const kSulfate = Math.round((k_fert_mg_per_m2 / 1000 / PRODUCT_PCT.K2SO4_K) * totalArea);

  // ── Mg ──
  const mg_offtake_mg = (TOMATO_FRUIT_EXPORT.Mg.g * 1000 * y) + (biomass.Mg || 0);
  // Side-dress products carry no Mg.
  const mg_fert_mg_per_m2 = Math.max(0, mg_offtake_mg);
  const mgSulfate = Math.round((mg_fert_mg_per_m2 / 1000 / PRODUCT_PCT.MgSO4_Mg) * totalArea);

  return { mgSulfate, kSulfate };
}

// computeFertigationSupply(stage, opts, recipe) — per-element delivered
// mg/m²/wk for the fertigation channel (K, Mg, B only; all other elements
// are explicit zeros). REQ-151. Mirrors the foliar precedent
// (computeFoliarSupply) — caller picks the source and reshapes into the
// canonical g-keyed shape, model applies one rule.
//
// `stage` is used ONLY for the default-recipe lookup; given an explicit
// recipe the output is stage-independent (delivery at given product mass
// has no stage signal).
function computeFertigationSupply(stage, opts, recipe) {
  void opts;
  const area = TOMATO_NUM_BEDS * TOMATO_BED_AREA;
  let canonical = recipe;
  if (!canonical) {
    const stored = (STORED_RECIPE.tomato.fertigation || {})[stage] || {};
    canonical = {
      kSulfate_g:  stored.kSulfate  || 0,
      mgSulfate_g: stored.mgSulfate || 0,
      solubore_g:  0,
    };
  }
  const kSulfate_g  = Number(canonical.kSulfate_g)  || 0;
  const mgSulfate_g = Number(canonical.mgSulfate_g) || 0;
  const solubore_g  = Number(canonical.solubore_g)  || 0;
  const deliver = function(grams, pct) {
    if (!grams || !pct || !area) return 0;
    return (grams * pct * 1000) / area;
  };
  return {
    N: 0,
    P: 0,
    K:  deliver(kSulfate_g,  PRODUCT_PCT.K2SO4_K),
    Ca: 0,
    Mg: deliver(mgSulfate_g, PRODUCT_PCT.MgSO4_Mg),
    Fe: 0,
    Mn: 0,
    Zn: 0,
    Cu: 0,
    B:  deliver(solubore_g,  PRODUCT_PCT.Solubore_B),
    Mo: 0,
  };
}

// Wire the FP recipe table at script load. FP_RECIPE_T5.fertigation in
// app/index.html holds the T5-only refined target (PA Taillon April 2026
// anchor); this IIFE overwrites it with values from
// FIRST_PRINCIPLES_T5_FERTIGATION (data.js) so the source-of-truth lives in
// one place. The Banque sol comparison reflects first principles.
//
// Mirrors `wireFpSidedress()` in nutrition/tomato/sidedress-recipe/calc.js.
// Single source of truth for the T5 fertigation FP target =
// FIRST_PRINCIPLES_T5_FERTIGATION (data.js).
//
// To re-tune (e.g. PA Taillon revises the anchor), edit data.js. Editing
// the live STORED_RECIPE.tomato.fertigation requires `/retire-recipe` audit
// cycle — the FP target alone shifts here, but the team's weighed-out
// stored recipe must follow before the team's actions reflect the change.
(function wireFpFertigation() {
  if (typeof FP_RECIPE_T5 !== 'undefined' && FP_RECIPE_T5) {
    FP_RECIPE_T5.fertigation = {
      'K2SO4':       FIRST_PRINCIPLES_T5_FERTIGATION['K2SO4'],
      'MgSO4-7H2O':  FIRST_PRINCIPLES_T5_FERTIGATION['MgSO4-7H2O'],
      'Solubore':    FIRST_PRINCIPLES_T5_FERTIGATION['Solubore'],
    };
  }
})();
