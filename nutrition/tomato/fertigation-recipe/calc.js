// Fertigation-recipe — first-principles derivation function.
//
// Spec:        nutrition/tomato/fertigation-recipe/spec.md
// Derivation:  nutrition/tomato/fertigation-recipe/derivation.md
//
// REQ-098: returned values match the mass-balance derivation.
// REQ-099: namespace exposed via window.FertigationRecipeTomato (model.js).

// ─── computeStageRecipe — MASS-BALANCE replenishment of K, Mg, B ────────
//
// FP target generator (mass-balance from RECIPE_INPUTS). NOT the team-facing
// stored fertigation — that's STORED_RECIPE.tomato.fertigation, the live
// weighed-out recipe (audit trail via /retire-recipe). computeStageRecipe
// is read by:
//   - FIRST_PRINCIPLES_T5_FERTIGATION boot-pin via wireFpFertigation()
//     (REQ-154 invariant) → FP_RECIPE_T5.fertigation
//   - Block 7 stored-vs-FP drift gauge (renderPhase1Comparison)
//   - calculateNutritionSupply when nutrRecipeMode === 'fp'
//   - computeStageSidedress (sidedress mass-balance variant — N-only)
//
// Formula (per element, total tomato area = 382.9 m²):
//   demand_mg/m²/wk      = TOMATO_FRUIT_EXPORT × stage_yield × 1000 + BIOMASS_DEMAND[stage]
//   demand_to_bed        = demand / PH_UPTAKE_FACTOR_AT_CURRENT_SOIL[el]   // REQ-155
//   sidedress_mg/m²/wk   = STORED_RECIPE.tomato.sidedress[stage].actisol_g
//                            × element_pct × min_eff × 1000 / SIDEDRESS_AREA_PER_PLANCHE
//   compost_mg/m²/wk     = CompostContribution.releasePerWeek[el] × 1000
//   needed_mg/m²/wk      = max(0, demand_to_bed − sidedress − compost)
//   product_g_total      = round(needed / 1000 / element_pct × total_area)
//
// "demand" = full plant uptake (fruit export + biomass build-out). Biomass
// nutrients leave the system at end of cycle (plants pulled, biomass removed
// off-site), so they count as demand too.
//
// COMPOST IS SUBTRACTED (REQ-098 restored 2026-05-15 per B1-REV): compost
// release is *current-week* supply to the bed, not a long-term bank. Soil
// bank credit applies only to {P, Ca} — neither is in the fertigation flow.
//
// UPTAKE FACTOR (REQ-155 added 2026-05-15 per B2-REV): bed → plant transfer
// efficiency is < 100 % at Décembre soil (pH 7.28, Ca 10 989 kg/ha) due to
// Ca-K / Ca-Mg cation competition and soil B adsorption. The factor applies
// uniformly to all bed sources (compost, sidedress, fertigation), so it
// pulls out as a division on demand alone. See data.js and derivation.md.
//
// Returns { kSulfate, mgSulfate, solubore } in grams (rounded). Total
// weekly dose for the 7-bed × 54.7 m² tomato area.
function computeStageRecipe(stage) {
  const y = RECIPE_INPUTS.stageYield[stage] || 0;
  const totalArea = TOMATO_NUMBER_BEDS * TOMATO_BED_AREA;
  const sd = STORED_RECIPE.tomato.sidedress[stage] || { actisol_g: 0, farine_g: 0 };
  const biomass = BIOMASS_DEMAND[stage] || {};
  const compost = (typeof window !== 'undefined' && window.CompostContribution && window.CompostContribution.releasePerWeek) || {};
  const uptake = PH_UPTAKE_FACTOR_AT_CURRENT_SOIL;

  // ── K ──
  const k_demand_mg = (TOMATO_FRUIT_EXPORT.K.g * 1000 * y) + (biomass.K || 0);
  const k_demand_to_bed = k_demand_mg / (uptake.K || 1);
  const k_sd_mg = (sd.actisol_g * PRODUCT_PCT.Actisol_K * (SIDEDRESS_MINIMUM_EFFICIENCY.K || 0.85) * 1000) / SIDEDRESS_AREA_PER_PLANCHE;
  const k_compost_mg = (compost.K || 0) * 1000;
  const k_fert_mg_per_m2 = Math.max(0, k_demand_to_bed - k_sd_mg - k_compost_mg);
  const kSulfate = Math.round((k_fert_mg_per_m2 / 1000 / PRODUCT_PCT.K2SO4_K) * totalArea);

  // ── Mg ──
  const mg_demand_mg = (TOMATO_FRUIT_EXPORT.Mg.g * 1000 * y) + (biomass.Mg || 0);
  const mg_demand_to_bed = mg_demand_mg / (uptake.Mg || 1);
  // Side-dress products carry no Mg; compost release subtracted.
  const mg_compost_mg = (compost.Mg || 0) * 1000;
  const mg_fert_mg_per_m2 = Math.max(0, mg_demand_to_bed - mg_compost_mg);
  const mgSulfate = Math.round((mg_fert_mg_per_m2 / 1000 / PRODUCT_PCT.MgSO4_Mg) * totalArea);

  // ── B (Solubore) — single-channel B at T5+ (REQ-061) ──
  // TOMATO_FRUIT_EXPORT[el].g uses uniform-field convention (×1000 → mg)
  // for both macros and micros — see plant-needs/calc.js calculateNutritionDemand.
  const b_demand_mg = (TOMATO_FRUIT_EXPORT.B.g * 1000 * y) + (biomass.B || 0);
  const b_demand_to_bed = b_demand_mg / (uptake.B || 1);
  const b_compost_mg = (compost.B || 0) * 1000;
  const b_fert_mg_per_m2 = Math.max(0, b_demand_to_bed - b_compost_mg);
  const solubore = Math.round((b_fert_mg_per_m2 / 1000 / PRODUCT_PCT.Solubore_B) * totalArea);

  return { mgSulfate, kSulfate, solubore };
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
  const area = TOMATO_NUMBER_BEDS * TOMATO_BED_AREA;
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

// Wire the FP recipe table at script load. FIRST_PRINCIPLES_T5_FERTIGATION
// in data.js declares the canonical product-keyed shape but is filled HERE
// with the live `computeStageRecipe('T5')` output for K2SO4, MgSO4-7H2O,
// and Solubore. Then FP_RECIPE_T5.fertigation in app/index.html is
// propagated from the same constant.
//
// Invariant (REQ-154): FIRST_PRINCIPLES_T5_FERTIGATION values match the
// computeStageRecipe('T5') reshape by construction — they cannot drift
// because they are written from one function call at boot. REQ-155 adds
// the per-element uptake-factor inflation inside computeStageRecipe; the
// pin invariant is unchanged in shape.
//
// Compost+sidedress subtraction restored 2026-05-15 per B1-REV; per-
// element uptake factor added same day per B2-REV. PA Taillon's April
// 2026 Mg anchor (1 379 g) recovered by physics under the with-compost
// formula; B2-REV uptake factor inflates it further to ~1 962 g.
// Learnings.md carries the full history.
//
// Editing the live STORED_RECIPE.tomato.fertigation requires `/retire-
// recipe` audit cycle; the FP target shifting here surfaces as drift in
// Block 7/8 until the team's weighed-out stored recipe follows.
(function wireFpFertigation() {
  const t5 = computeStageRecipe('T5') || {};
  FIRST_PRINCIPLES_T5_FERTIGATION['K2SO4']      = t5.kSulfate  || 0;
  FIRST_PRINCIPLES_T5_FERTIGATION['MgSO4-7H2O'] = t5.mgSulfate || 0;
  FIRST_PRINCIPLES_T5_FERTIGATION['Solubore']   = t5.solubore  || 0;
  if (typeof FP_RECIPE_T5 !== 'undefined' && FP_RECIPE_T5) {
    FP_RECIPE_T5.fertigation = {
      'K2SO4':       FIRST_PRINCIPLES_T5_FERTIGATION['K2SO4'],
      'MgSO4-7H2O':  FIRST_PRINCIPLES_T5_FERTIGATION['MgSO4-7H2O'],
      'Solubore':    FIRST_PRINCIPLES_T5_FERTIGATION['Solubore'],
    };
  }
})();
