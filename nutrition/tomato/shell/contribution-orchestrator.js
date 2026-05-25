// Tomato — Nutrition supply orchestrator + status helper.
//
// Carved out of nutrition/tomato/shell/supply.js (Phase 3 of nutrition
// reorg, 2026-05-23). Reads STORED_RECIPE.tomato.{fertigation,sidedress,
// foliaire} (live operational state) or FP_RECIPE_T5 + computeStageRecipe
// (first-principles target) per the `recipeMode` argument, runs the gap
// chain (compost → sidedress → fertigation → foliar) for FP mode's
// REQ-116 gap-derived foliar recipe via deriveFoliarRecipeFromGap, and
// returns the per-channel + total supply ledger consumed by
// buildNutrimentTomato in nutrition/tomato/shell/logic.js + the Block 7
// drift gauge.
//
// Per-channel contribution slices are pure functions in the model/ dirs:
//   - nutrition/tomato/fertigation-recipe/model/contribution.js → computeFertigationContribution
//   - nutrition/tomato/sidedress-recipe/model/contribution.js   → computeSidedressContribution
//   - nutrition/tomato/foliar-strategy/model/contribution.js      → computeFoliarContribution + deriveFoliarRecipeFromGap
//
// DOM reads (spray count, surfactant) + cross-channel concerns
// (LUXURY_FACTOR demand cap on supply.soil, FP-vs-stored selection,
// REQ-116 FP_RECIPE_T5.foliar mutation, page-local nutrStage /
// nutrRecipeMode state, statusFor render helper) stay HERE — orchestrator
// layer is allowed to read inputs and mutate page state; pure model
// files are not.
//
// Consumes (all script-global at this script position):
//   - STORED_RECIPE.tomato.* (operator-side procedure/stored.js partials)
//   - FP_RECIPE_T5 (declared in app/index.html main script)
//   - PRODUCT_PCT (nutrition/lib/product-pct.js)
//   - SIDEDRESS_AREA_PER_PLANCHE, SIDEDRESS_MINIMUM_EFFICIENCY
//     (nutrition/tomato/sidedress-recipe/model/data.js)
//   - computeStageRecipe (nutrition/tomato/fertigation-recipe/model/recipe.js)
//   - calculateNutritionDemand (nutrition/tomato/plant-needs/model/demand.js)
//   - TOMATO_FRUIT_EXPORT, BIOMASS_DEMAND (nutrition/tomato/plant-needs/model/data.js)
//   - window.FoliarRecipeTomato (computeFoliarSupply, efficiencyFor)
//   - window.FertigationRecipeTomato.efficiency
//   - window.SidedressRecipeTomato.efficiency
//   - window.CompostContribution.releasePerWeek
//   - soilWeeklyAvailable (nutrition/soil-contribution/integrator.js)
//   - TOMATO_NUMBER_BEDS, TOMATO_BED_AREA (app/operator/state.js)

// nutrStage / nutrRecipeMode — page-local state for the Nutrition page (Bilan).
// `setNutrStage` and `setNutrRecipeMode` (in nutrition/tomato/shell/logic.js)
// mutate them; the hash router in app/operator/logic.js restores them on load.
let nutrStage = 'T5';

// Page-local recipe-source state for Nutrition Block 1-5. 'stored' = read the
// locked STORED_RECIPE.tomato.{fertigation, sidedress, foliaire} — what Jordane
// weighs out this week. 'fp' = read computeStageRecipe(stage) for fertigation
// + FP_RECIPE_T5 for sidedress/foliar (T5 only) — the first-principles target.
// Default 'fp' so reviewers land on the model view; team-facing pages always
// show the locked stored recipe regardless.
// Toggle in Cible & contexte. FP only defined for T5; switching to FP snaps
// nutrStage to T5, and switching nutrStage off T5 snaps mode back to 'stored'.
// Persisted in the URL hash (see parseHash/syncHash) so reload survives the choice.
let nutrRecipeMode = 'fp';

// LUXURY_FACTOR — cap on supply.soil per element, applied as
//   supply.soil[element] = min(SME[element] × transpiration, demand[element] × LUXURY_FACTOR[element])
// Mechanism: HAK/HKT transporter saturation + demand-driven feedback.
// Real uptake at saturating SME ≈ demand × small luxury fraction (vacuolar storage).
// Excess in solution stays on CEC, leaches, or remains in solution.
// References: Barber 1995, Marschner's Mineral Nutrition.
// Cert 3 mechanism. Cert 2-3 specific factor values.
const LUXURY_FACTOR = {
  N:  1.10,  // NO3 luxury uptake small; cert 3
  P:  1.00,  // closely demand-regulated; lockout usually binds first; cert 4
  K:  1.15,  // largest vacuolar K storage; cert 3
  Ca: 1.10,  // mass-flow + xylem; cert 3
  Mg: 1.10,  // similar to Ca; cert 3
  S:  1.00,  // closely demand-regulated; cert 3
  Fe: 1.00,  // micros: no significant luxury; cert 3
  Mn: 1.00,
  Zn: 1.00,
  B:  1.00,
  Cu: 1.00,
  Mo: 1.00,
};

function calculateNutritionSupply(stage, phLocked, transpFactor, targetYield, recipeMode) {
  const mode = recipeMode === 'fp' ? 'fp' : 'stored';
  const area = TOMATO_NUMBER_BEDS * TOMATO_BED_AREA; // 382.9 m²
  const tf = transpFactor || 1.0;
  const ty = (typeof targetYield === 'number' && targetYield > 0) ? targetYield : 1.5;

  // ── Fertigation contribution (K, Mg, B) ─────────────────────────────
  const storedFert = STORED_RECIPE.tomato.fertigation[stage] || { mgSulfate: 0, kSulfate: 0 };
  const fpStageRecipe = (mode === 'fp') ? (computeStageRecipe(stage) || { mgSulfate: 0, kSulfate: 0 }) : null;
  const fert = computeFertigationContribution({
    stage,
    recipeMode: mode,
    storedFert,
    fpFertigation: (mode === 'fp') ? FP_RECIPE_T5.fertigation : null,
    fpStageRecipe,
    multK:  (mode === 'stored') ? getMultK()  : 1,
    multMg: (mode === 'stored') ? getMultMg() : 1,
    area,
    productPct: PRODUCT_PCT,
  });
  const fertK  = fert.K  || 0;
  const fertMg = fert.Mg || 0;
  const fertB  = fert.B  || 0;
  const { k_g_total, mg_g_total, sb_fert_g } = fert._raw;
  void sb_fert_g;

  // ─── REQ-116 — FP foliar recipe live-derived from the pre-foliar gap.
  // In FP mode, BEFORE building the foliar branch, compute the FP-side
  // sidedress contribution + assemble pre-foliar fertigation map, then
  // call the pure deriveFoliarRecipeFromGap and mutate FP_RECIPE_T5.foliar
  // so the existing FP foliar branch + downstream readers see live values.
  //
  // Stored mode is untouched — STORED_RECIPE.tomato.foliaire.A is
  // /retire-recipe-governed and not derived. Spec:
  // nutrition/tomato/foliar-strategy/spec.md → REQ-116.
  if (mode === 'fp') {
    const fertPre = { K: fertK, Mg: fertMg };
    if (fertB > 0) fertPre.B = fertB;
    const sdFp = {
      actisol_g: FP_RECIPE_T5.sidedress['Actisol-5-3-2'] || 0,
      farine_g:  FP_RECIPE_T5.sidedress['FarinePlumes']  || 0,
    };
    const sidedressPre = computeSidedressContribution({
      stage,
      sd: sdFp,
      phLocked,
      productPct: PRODUCT_PCT,
      areaPerPlanche: SIDEDRESS_AREA_PER_PLANCHE,
      minimumEfficiency: SIDEDRESS_MINIMUM_EFFICIENCY,
    });
    const CC_pre = (typeof window !== 'undefined' && window.CompostContribution) ? window.CompostContribution : null;
    const demandPre = calculateNutritionDemand(ty, stage, tf);
    const surfactantInpFp = document.getElementById('nutr-foliar-surfactant');
    const foliarOptsFp = {
      surfactant: surfactantInpFp ? surfactantInpFp.checked : false,
    };
    // Call via window.FoliarRecipeTomato so REQ-139's registry check
    // resolves the consumer surface (orchestrator) → namespace
    // (foliar-strategy subproject). The bare function is reachable in
    // the same script bundle but routing through the namespace keeps
    // the subproject boundary visible.
    const derived = window.FoliarRecipeTomato.deriveFoliarRecipeFromGap({
      demand:         demandPre,
      compostRelease: CC_pre ? CC_pre.releasePerWeek : null,
      fertigationPre: fertPre,
      sidedressPre,
      foliarOpts:     foliarOptsFp,
    });
    if (derived) {
      FP_RECIPE_T5.foliar['MnSO4']        = derived['MnSO4'];
      FP_RECIPE_T5.foliar['ZnSO4']        = derived['ZnSO4'];
      FP_RECIPE_T5.foliar['CuSO4']        = derived['CuSO4'];
      FP_RECIPE_T5.foliar['FeSO4-7H2O']   = derived['FeSO4-7H2O'];
      FP_RECIPE_T5.foliar['NaMolybdate']  = derived['NaMolybdate'];
      FP_RECIPE_T5.foliar['Solubore']     = derived['Solubore'];
    }
  }

  // ── Foliar contribution (micros only) ─────────────────────────────
  // Per-product gram doses by mode — kept for raw{} traceability + the
  // "Recette proposée" Fe display label.
  const parseG = (s) => parseFloat(String(s).replace(',', '.')) || 0;
  const A = STORED_RECIPE.tomato.foliaire.A;
  const get = (substr) => A.find(x => x.name.includes(substr));
  let mnSO4_g, znSO4_g, sb_g, cuSO4_g, moNa_g, feSO4_g;
  let foliarRecipeArray = null;
  if (mode === 'fp') {
    const fp = FP_RECIPE_T5.foliar;
    mnSO4_g = fp['MnSO4']        || 0;
    znSO4_g = fp['ZnSO4']        || 0;
    sb_g    = fp['Solubore']     || 0;
    cuSO4_g = fp['CuSO4']        || 0;
    moNa_g  = fp['NaMolybdate']  || 0;
    feSO4_g = fp['FeSO4-7H2O']   || 0;
    foliarRecipeArray = [
      { name: 'MnSO₄ (31,5 % Mn)',     master: (fp['MnSO4']       || 0) + ' g' },
      { name: 'ZnSO₄ (35,5 % Zn)',     master: (fp['ZnSO4']       || 0) + ' g' },
      { name: 'Solubore (20,5 % B)',   master: (fp['Solubore']    || 0) + ' g' },
      { name: 'CuSO₄ (25 % Cu)',       master: (fp['CuSO4']       || 0) + ' g' },
      { name: 'Molybdate (39,6 % Mo)', master: (fp['NaMolybdate'] || 0) + ' g' },
      { name: 'FeSO₄·7H₂O (20 % Fe)',  master: (fp['FeSO4-7H2O']  || 0) + ' g' },
    ];
  } else {
    mnSO4_g = parseG(get('MnSO₄').master);
    znSO4_g = parseG(get('ZnSO₄').master);
    sb_g    = parseG(get('Solubore').master);
    cuSO4_g = parseG(get('CuSO₄').master);
    moNa_g  = parseG(get('Molybdate').master);
    const feSO4_entry = A.find(x => x.name.includes('FeSO₄'));
    feSO4_g = feSO4_entry ? parseG(feSO4_entry.master) : 0;
    // foliarRecipeArray stays null → computeFoliarSupply defaults to A.
  }
  const feApplied_g = feSO4_g * PRODUCT_PCT.FeSO4_Fe;
  const surfactantInp = document.getElementById('nutr-foliar-surfactant');
  const foliarOpts = {
    surfactant: surfactantInp ? surfactantInp.checked : false,
  };
  const foliar = computeFoliarContribution({
    stage,
    recipeArray: foliarRecipeArray,
    foliarOpts,
    computeFoliarSupplyFunction: window.FoliarRecipeTomato.computeFoliarSupply,
  });

  // Soil contributions — direct mass-flow from SME × transpiration × canopy factor.
  // Lockout shows up automatically in the SME data (P 1.1 ppm, Mn/Zn below detection).
  // Fe gets a calcareous-chemistry discount inside soilWeeklyAvailable.
  // Demand-bounding cap (LUXURY_FACTOR): mass-flow potential overstates real
  // uptake at high SME for transporter-saturating elements (K, Ca, Mg, partially
  // N). The cap is taken against demand_total (fruit + biomass per stage at
  // target yield).
  const demandBreakdown = calculateNutritionDemand(ty, stage, tf);
  const soil = {};
  // FP mode (2026-05-08): drop SME credit for everything fertigation/foliar can
  // deliver. Keep SME for Ca (saturated, can't add) and P (pH-locked).
  const FP_SOIL_KEEP = { Ca: true, P: true };
  ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    if (mode === 'fp' && !FP_SOIL_KEEP[element]) {
      soil[element] = 0;
      return;
    }
    const massFlowPotential = soilWeeklyAvailable(element, phLocked, tf);
    const demandTotal_element = (demandBreakdown[element] && demandBreakdown[element].total) || 0;
    const luxury = (LUXURY_FACTOR[element] != null) ? LUXURY_FACTOR[element] : 1.0;
    const demandCap = demandTotal_element * luxury;
    soil[element] = Math.min(massFlowPotential, demandCap);
  });

  // ── Sidedress contribution (granular, weekly, per stage) ──────────────
  // Sidedress source: stored = STORED_RECIPE.tomato.sidedress[stage],
  // fp = FP_RECIPE_T5.sidedress (FP_RECIPE_T5 is T5-only; same g/planche unit).
  const sd = mode === 'fp'
    ? {
        actisol_g: FP_RECIPE_T5.sidedress['Actisol-5-3-2'] || 0,
        farine_g:  FP_RECIPE_T5.sidedress['FarinePlumes']  || 0,
      }
    : STORED_RECIPE.tomato.sidedress[stage];
  const sidedress = computeSidedressContribution({
    stage,
    sd,
    phLocked,
    productPct: PRODUCT_PCT,
    areaPerPlanche: SIDEDRESS_AREA_PER_PLANCHE,
    minimumEfficiency: SIDEDRESS_MINIMUM_EFFICIENCY,
  });
  sidedress.efficiency = window.SidedressRecipeTomato.efficiency;

  // Fertigation contributions — barrel-loaded mass per m²/sem, full
  // delivery (no mixing-factor discount; concept retired 2026-05-10).
  fert.efficiency = window.FertigationRecipeTomato.efficiency;

  // REQ-157 + REQ-163 — surfactant-aware foliar efficiency map.
  const surfactantInputForEfficiency = document.getElementById('nutr-foliar-surfactant');
  const surfactantOnForEfficiency = surfactantInputForEfficiency ? surfactantInputForEfficiency.checked : false;
  foliar.efficiency = window.FoliarRecipeTomato.efficiencyFor(surfactantOnForEfficiency);

  // Total effective supply per element.
  // NOTE: sidedress is NOT summed here — past sidedress mineralization is
  // already captured in the SME reading (supply.soil). Adding it again would
  // double-count. Sidedress.* still computed; rendered in Block 3 as a bank-
  // maintenance view (drawdown vs. addition determines SME trajectory).
  const total = {};
  Object.keys(TOMATO_FRUIT_EXPORT).forEach(element => {
    total[element] = (fert[element] || 0) + (foliar[element] || 0) + (soil[element] || 0);
  });

  // Fe display label — uses the active recipe source (stored or fp).
  const feSourceLabel = feSO4_g > 0 ? `FeSO₄ ${feSO4_g} g` : '—';

  return {
    total, fert, foliar, soil, sidedress,
    raw: {
      mnSO4_g, znSO4_g, sb_g, cuSO4_g, moNa_g, feApplied_g, feSO4_g,
      k_g_total, mg_g_total, feSourceLabel, area,
      sd_actisol_g: sd.actisol_g, sd_farine_g: sd.farine_g,
    }
  };
}

function statusFor(supply, demand) {
  if (demand <= 0) return { icon: '—', cls: '', ratio: 1 };
  const ratio = supply / demand;
  if (ratio >= 1.0)  return { icon: '✅', cls: 'cert-5', ratio };
  if (ratio >= 0.7)  return { icon: '⚠',  cls: 'cert-3', ratio };
  return                    { icon: '❌', cls: 'cert-2', ratio };
}
