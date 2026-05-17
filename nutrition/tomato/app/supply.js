// Tomato — Bilan supply orchestrator + status helper.
//
// Reads STORED_RECIPE.tomato.{fertigation,sidedress,foliaire} (live operational
// state) or FP_RECIPE_T5 + computeStageRecipe(stage) (first-principles target)
// per the `recipeMode` argument, runs the gap chain (compost → sidedress →
// fertigation → foliar) for FP mode's REQ-116 gap-derived foliar recipe, and
// returns the per-channel + total supply ledger consumed by buildNutrimentTomato
// in nutrition/tomato/app/logic.js and the Block 7 drift gauge.
//
// Consumes (all script-global at this script position):
//   - STORED_RECIPE.tomato.* (operator-side stored.js partials)
//   - FP_RECIPE_T5 (declared in app/index.html main script)
//   - PRODUCT_PCT (nutrition/lib/product-pct.js)
//   - SIDEDRESS_AREA_PER_PLANCHE, SIDEDRESS_MINIMUM_EFFICIENCY
//     (nutrition/tomato/sidedress-recipe/data.js)
//   - computeStageRecipe (nutrition/tomato/fertigation-recipe/calc.js)
//   - calculateNutritionDemand (nutrition/tomato/plant-needs/calc.js)
//   - TOMATO_FRUIT_EXPORT, BIOMASS_DEMAND (nutrition/tomato/plant-needs/data.js)
//   - window.FoliarRecipeTomato (computeFoliarSupply, computeFoliarRecipeForGap,
//     efficiencyFor)
//   - window.FertigationRecipeTomato.efficiency
//   - window.SidedressRecipeTomato.efficiency
//   - window.CompostContribution.releasePerWeek
//   - soilWeeklyAvailable (nutrition/soil-contribution/integrator.js)
//   - TOMATO_NUMBER_BEDS, TOMATO_BED_AREA (app/operator/state.js)

// nutrStage / nutrRecipeMode — page-local state for the Nutrition page (Bilan).
// `setNutrStage` and `setNutrRecipeMode` (in nutrition/tomato/app/logic.js)
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
//
// Effect today (April 2026 SME):
//   - K SME 292 ppm × ~28 L/m²/wk × tf ≈ 6 800-7 500 mg/m²/wk mass-flow potential,
//     but T5 demand × 1.15 ≈ 6 037 → cap binds → real uptake ≈ 6 037.
//   - Mg SME 79 ppm: similar story, cap binds.
//   - P SME 1.1 ppm: mass-flow ≈ 25-30 mg/m²/wk; demand × 1.0 ≈ 1 500 mg → cap doesn't bind.
//   - Fe/Mn/Zn at high pH: mass-flow already bottlenecks; cap inert.
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
  // Recipe source: stored = STORED_RECIPE.tomato.{fertigation,sidedress,foliaire}
  // (live operational state — what the team weighs). fp = FP_RECIPE_T5 +
  // computeStageRecipe (mass-balance target, T5 only — caller is responsible
  // for snapping nutrStage to T5 when mode='fp').
  // FP fertigation skips multipliers (FP is the absolute target, not user-tuned).
  const storedFert = STORED_RECIPE.tomato.fertigation[stage] || { mgSulfate: 0, kSulfate: 0 };
  let k_g_total, mg_g_total;
  if (mode === 'fp') {
    // FP fertigation: computeStageRecipe(stage) is the mass-balance derivation
    // from RECIPE_INPUTS. FP_RECIPE_T5.fertigation is the T5-only refined
    // override (currently zeroed — bank meets demand passively at T5). When
    // FP_RECIPE_T5 has a non-zero override for stage T5, prefer it; otherwise
    // fall back to computeStageRecipe so other stages get a meaningful FP value.
    const fpStage = computeStageRecipe(stage) || { mgSulfate: 0, kSulfate: 0 };
    if (stage === 'T5') {
      k_g_total  = (FP_RECIPE_T5.fertigation['K2SO4']      != null) ? FP_RECIPE_T5.fertigation['K2SO4']      : fpStage.kSulfate;
      mg_g_total = (FP_RECIPE_T5.fertigation['MgSO4-7H2O'] != null) ? FP_RECIPE_T5.fertigation['MgSO4-7H2O'] : fpStage.mgSulfate;
    } else {
      k_g_total  = fpStage.kSulfate;
      mg_g_total = fpStage.mgSulfate;
    }
  } else {
    const mK = getMultK(), mM = getMultMg();
    k_g_total  = storedFert.kSulfate * mK;
    mg_g_total = storedFert.mgSulfate * mM;
  }
  // Fertigation per m²/week, mg — barrel-loaded mass per m²/sem, full
  // delivery, no mixing-factor discount. Mode-aware mixing factor retired
  // 2026-05-10 (was 0.5 stored / 1.0 FP).
  const fertK  = (k_g_total  * PRODUCT_PCT.K2SO4_K)  / area * 1000;
  const fertMg = (mg_g_total * PRODUCT_PCT.MgSO4_Mg) / area * 1000;
  // Boric acid (Solubore) in fertigation — FP only, single-channel for B.
  // Non-ionic: 100% efficiency at pH 7,4 (REQ-018 OK), no Ksp pair, no chelate.
  const sb_fert_g = (mode === 'fp') ? (FP_RECIPE_T5.fertigation['Solubore'] || 0) : 0;
  const fertB  = (sb_fert_g * PRODUCT_PCT.Solubore_B) / area * 1000;

  // ─── REQ-116 — FP foliar recipe is live-derived from the pre-foliar gap.
  // In FP mode, BEFORE building the foliar branch, compute the residual gap
  // after compost + sidedress + fertigation, then call
  // computeFoliarRecipeForGap(gap, opts) and mutate FP_RECIPE_T5.foliar so
  // the existing FP foliar branch (which reads FP_RECIPE_T5.foliar) and all
  // downstream readers (renderPhase1Comparison Block 7 drift gauge,
  // "Recette proposée" admin card) see the live values.
  //
  // Stored mode is untouched — STORED_RECIPE.tomato.foliaire.A is
  // /retire-recipe-governed and not derived. Spec:
  // nutrition/tomato/foliar-recipe/spec.md → REQ-116. Implementation in
  // nutrition/tomato/foliar-recipe/calc.js → computeFoliarRecipeForGap.
  if (mode === 'fp') {
    // Pre-foliar fertigation supply per-element (mg/m²/wk).
    const fertPre = { K: fertK, Mg: fertMg };
    if (fertB > 0) fertPre.B = fertB;
    // Pre-foliar FP sidedress doses (mirrors the sidedress block below for
    // the FP branch only — duplicated minimally to keep the gap computation
    // inline; the canonical sidedress object is rebuilt below for the
    // returned `supply.sidedress` so admin views read identical values).
    const sdFp = {
      actisol_g: FP_RECIPE_T5.sidedress['Actisol-5-3-2'] || 0,
      farine_g:  FP_RECIPE_T5.sidedress['FarinePlumes']  || 0,
    };
    const sdAreaFactor_pre = 1000 / SIDEDRESS_AREA_PER_PLANCHE;
    const phLockoutFactor_P_pre = phLocked ? 0.10 : 0.50;
    const sidedressPre = {
      N: (sdFp.actisol_g * PRODUCT_PCT.Actisol_N    * SIDEDRESS_MINIMUM_EFFICIENCY.Actisol_N
        + sdFp.farine_g  * PRODUCT_PCT.FarinePlumes_N * SIDEDRESS_MINIMUM_EFFICIENCY.FarinePlumes_N
         ) * sdAreaFactor_pre,
      P: sdFp.actisol_g * PRODUCT_PCT.Actisol_P * phLockoutFactor_P_pre * sdAreaFactor_pre,
      K: sdFp.actisol_g * PRODUCT_PCT.Actisol_K * SIDEDRESS_MINIMUM_EFFICIENCY.Actisol_K * sdAreaFactor_pre,
    };
    // Compost release (g/m²/wk → mg/m²/wk). Source: window.CompostContribution
    // (REQ-080) — single source of truth, mirrors the gap chain in
    // nutrition/tomato/app/logic.js → buildNutriment.
    const CC_pre = (typeof window !== 'undefined' && window.CompostContribution) ? window.CompostContribution : null;
    const tf_pre = transpFactor || 1.0;
    const ty_pre = (typeof targetYield === 'number' && targetYield > 0) ? targetYield : 1.5;
    const demandPre = calculateNutritionDemand(ty_pre, stage, tf_pre);
    // Per-element pre-foliar gap = max(0, demand − compost − sidedress − fert).
    // Only foliar-relevant elements (Mn/Zn/Cu/Fe/Mo/B) need to be in the gap;
    // computeFoliarRecipeForGap ignores keys it doesn't recognize.
    const FOLIAR_ELS = ['Mn', 'Zn', 'Cu', 'Fe', 'Mo', 'B'];
    const gapPre = {};
    FOLIAR_ELS.forEach(function(element) {
      const dem = (demandPre[element] && demandPre[element].total) || 0;
      const compostMg_el = (CC_pre && CC_pre.releasePerWeek[element] != null) ? CC_pre.releasePerWeek[element] * 1000 : 0;
      const sdMg_el = sidedressPre[element] || 0;
      const fertMg_el = fertPre[element] || 0;
      gapPre[element] = Math.max(0, dem - compostMg_el - sdMg_el - fertMg_el);
    });
    // Operator levers — same DOM inputs the stored-mode foliar path reads
    // (REQ-112). Defaults match the function's declared defaults.
    const sprayCountInpFp = document.getElementById('nutr-foliar-spray-count');
    const surfactantInpFp = document.getElementById('nutr-foliar-surfactant');
    const foliarOptsFp = {
      sprayCount: sprayCountInpFp ? parseFloat(sprayCountInpFp.value) : 1,
      surfactant: surfactantInpFp ? surfactantInpFp.checked : false,
    };
    // Derive the gap-maximizing recipe and mutate FP_RECIPE_T5.foliar in-place.
    // Defensive: fall back to the existing literal if the call throws or
    // returns malformed (e.g., predictedCE not yet defined). Verifier guards
    // against this with a try/catch.
    try {
      const derived = window.FoliarRecipeTomato.computeFoliarRecipeForGap(gapPre, foliarOptsFp);
      if (derived && typeof derived === 'object') {
        FP_RECIPE_T5.foliar['MnSO4']        = derived.MnSO4_g    || 0;
        FP_RECIPE_T5.foliar['ZnSO4']        = derived.ZnSO4_g    || 0;
        FP_RECIPE_T5.foliar['CuSO4']        = derived.CuSO4_g    || 0;
        FP_RECIPE_T5.foliar['FeSO4-7H2O']   = derived.FeSO4_g    || 0;
        FP_RECIPE_T5.foliar['NaMolybdate']  = derived.NaMoO4_g   || 0;
        FP_RECIPE_T5.foliar['Solubore']     = derived.Solubore_g || 0;
      }
    } catch (e) {
      // Leave FP_RECIPE_T5.foliar at its prior value — the existing FP foliar
      // branch below reads it as a fallback. Logged to console so a real
      // breakage surfaces in dev.
      if (typeof console !== 'undefined') console.warn('[REQ-116] computeFoliarRecipeForGap failed; falling back to FP_RECIPE_T5.foliar literal:', e);
    }
  }

  // Foliar Spray A (weekly): delivered per-element mg/m²/wk under cuticle
  // coverage discount. Both modes route through
  // window.FoliarRecipeTomato.computeFoliarSupply — single source of
  // truth for the delivery formula (recipe_g × element_pct × 1000 / area
  // × coverage × sprayCount). REQ-101 (coverage) + REQ-103 (namespace) +
  // REQ-112 (sprayCount + surfactant + optional `recipe` arg) live in
  // nutrition/tomato/foliar-recipe/spec.md.
  // - Stored mode: no recipe arg → defaults to STORED_RECIPE.tomato.foliaire.A.
  // - FP mode: FP_RECIPE_T5.foliar (REQ-116-derived above from the live
  //   pre-foliar gap chain) is reshaped as a label-string array and
  //   passed as the third arg.
  const parseG = (s) => parseFloat(String(s).replace(',', '.')) || 0;
  const A = STORED_RECIPE.tomato.foliaire.A;
  const get = (substr) => A.find(x => x.name.includes(substr));

  // Per-product gram doses by mode — kept for raw{} traceability + the
  // "Recette proposée" Fe display label. NOT used to compute supply
  // anymore; supply flows through computeFoliarSupply for both modes.
  let mnSO4_g, znSO4_g, sb_g, cuSO4_g, moNa_g, feSO4_g;
  if (mode === 'fp') {
    const fp = FP_RECIPE_T5.foliar;
    mnSO4_g = fp['MnSO4']        || 0;
    znSO4_g = fp['ZnSO4']        || 0;
    sb_g    = fp['Solubore']     || 0;
    cuSO4_g = fp['CuSO4']        || 0;
    moNa_g  = fp['NaMolybdate']  || 0;
    feSO4_g = fp['FeSO4-7H2O']   || 0;
  } else {
    mnSO4_g = parseG(get('MnSO₄').master);
    znSO4_g = parseG(get('ZnSO₄').master);
    sb_g    = parseG(get('Solubore').master);
    cuSO4_g = parseG(get('CuSO₄').master);
    moNa_g  = parseG(get('Molybdate').master);
    const feSO4_entry = A.find(x => x.name.includes('FeSO₄'));
    feSO4_g = feSO4_entry ? parseG(feSO4_entry.master) : 0;
  }
  const feApplied_g = feSO4_g * PRODUCT_PCT.FeSO4_Fe;

  // Foliar mg/m²/week (effective after coverage × spray count).
  let foliar;
  if (mode === 'fp') {
    // FP mode: route the gap-derived FP_RECIPE_T5.foliar object through
    // computeFoliarSupply by reshaping it as a label-string array. The
    // substring-matched names below align with the `findG` searches in
    // calc.js ('MnSO₄', 'ZnSO₄', 'Solubore', 'CuSO₄', 'Molybdate',
    // 'FeSO₄'). Spray count + surfactant read from the same operator
    // inputs as stored-mode (foliarOptsFp built above is block-scoped to
    // the REQ-116 derivation block; re-read here to keep this branch
    // self-contained).
    const sprayCountInpFp2 = document.getElementById('nutr-foliar-spray-count');
    const surfactantInpFp2 = document.getElementById('nutr-foliar-surfactant');
    const foliarOptsFp2 = {
      sprayCount: sprayCountInpFp2 ? parseFloat(sprayCountInpFp2.value) : 1,
      surfactant: surfactantInpFp2 ? surfactantInpFp2.checked : false,
    };
    const fpFoliarArray = [
      { name: 'MnSO₄ (31,5 % Mn)',     master: (FP_RECIPE_T5.foliar['MnSO4']       || 0) + ' g' },
      { name: 'ZnSO₄ (35,5 % Zn)',     master: (FP_RECIPE_T5.foliar['ZnSO4']       || 0) + ' g' },
      { name: 'Solubore (20,5 % B)',   master: (FP_RECIPE_T5.foliar['Solubore']    || 0) + ' g' },
      { name: 'CuSO₄ (25 % Cu)',       master: (FP_RECIPE_T5.foliar['CuSO4']       || 0) + ' g' },
      { name: 'Molybdate (39,6 % Mo)', master: (FP_RECIPE_T5.foliar['NaMolybdate'] || 0) + ' g' },
      { name: 'FeSO₄·7H₂O (20 % Fe)',  master: (FP_RECIPE_T5.foliar['FeSO4-7H2O']  || 0) + ' g' },
    ];
    const supply = window.FoliarRecipeTomato.computeFoliarSupply(stage, foliarOptsFp2, fpFoliarArray);
    foliar = {
      Mn: supply.Mn, Zn: supply.Zn, B: supply.B,
      Cu: supply.Cu, Mo: supply.Mo, Fe: supply.Fe,
    };
  } else {
    // Stored mode: defaults read STORED_RECIPE.tomato.foliaire.A.
    // REQ-112: spray count + surfactant from the operator inputs in
    // Block 5; the function multiplies delivery accordingly.
    const sprayCountInp = document.getElementById('nutr-foliar-spray-count');
    const surfactantInp = document.getElementById('nutr-foliar-surfactant');
    const foliarOpts = {
      sprayCount: sprayCountInp ? parseFloat(sprayCountInp.value) : 1,
      surfactant: surfactantInp ? surfactantInp.checked : false,
    };
    const supply = window.FoliarRecipeTomato.computeFoliarSupply(stage, foliarOpts);
    foliar = {
      Mn: supply.Mn, Zn: supply.Zn, B: supply.B,
      Cu: supply.Cu, Mo: supply.Mo, Fe: supply.Fe,
    };
  }

  // Spray B (CaCl₂ anti-BER) removed 2026-05-06 — no foliar Ca contribution.
  // BER risk is addressed via ventilation + humidity control on the operations
  // side, not on the supply ledger. Block 5 lever for Ca reflects this.
  foliar.Ca = 0;

  // Soil contributions — direct mass-flow from SME × transpiration × canopy factor.
  // Lockout shows up automatically in the SME data (P 1.1 ppm, Mn/Zn below detection).
  // Fe gets a calcareous-chemistry discount inside soilWeeklyAvailable.
  // transpFactor (0,4-1,0) scales mass-flow down for stunted plants; full canopy = 1,0.
  //
  // Demand-bounding cap (LUXURY_FACTOR): mass-flow potential overstates real
  // uptake at high SME for transporter-saturating elements (K, Ca, Mg, partially
  // N). At saturating concentrations, real uptake ≈ demand × small luxury
  // fraction; the rest stays on CEC, in solution, or leaches. The cap is taken
  // against demand_total (fruit + biomass per stage at target yield) — same
  // number Block 1 of the Nutrition page renders. For solution-limited elements
  // (P at SME 1.1 ppm, Fe/Mn/Zn under detection), mass-flow IS the bottleneck
  // and the cap doesn't bind.
  const tf = transpFactor || 1.0;
  const ty = (typeof targetYield === 'number' && targetYield > 0) ? targetYield : 1.5;
  // REQ-081: pass tf so Ca/Mg biomass terms scale with canopy transpiration.
  const demandBreakdown = calculateNutritionDemand(ty, stage, tf);
  const soil = {};
  // FP mode (2026-05-08): drop SME credit for everything fertigation/foliar can
  // deliver (K, Mg, N, Fe, Mn, Zn, B, Cu, Mo). Keep SME for Ca (saturated, can't
  // add) and P (pH-locked, banque scavenging is the accepted strategy via
  // ACCEPTED_DEFICITS). Stored mode unchanged — SME-based supply for all elements.
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

  // Side-dressing contributions (granular, weekly, per stage). Reads from
  // STORED_RECIPE.tomato.sidedress source-of-truth constant. Per-element delivery:
  //   element_mg/m²/wk = (g/planche × pct × min_eff × phFactor) / planche_area × 1000
  // Mineralization steady-state: weekly application = weekly available release.
  //
  // P pH-lockout factor (audit Finding 7, cert 3): at pH ≥ 7, freshly
  // mineralized phosphate from Actisol meets Ca²⁺ in solution and precipitates
  // as Ca-phosphate before plant uptake. Cadre framework gives 5-15% effective
  // (midpoint ~10%); we apply 0.10 when phLocked, 0.50 (full mineralization
  // efficiency) when pH drops. This stays honest under the new model since
  // sidedress no longer claims this-week supply — only bank-maintenance addition.
  // Sidedress source: stored = STORED_RECIPE.tomato.sidedress[stage],
  // fp = FP_RECIPE_T5.sidedress (FP_RECIPE_T5 is T5-only; same g/planche unit).
  const sd = mode === 'fp'
    ? {
        actisol_g: FP_RECIPE_T5.sidedress['Actisol-5-3-2'] || 0,
        farine_g:  FP_RECIPE_T5.sidedress['FarinePlumes']  || 0,
      }
    : STORED_RECIPE.tomato.sidedress[stage];
  const sdAreaFactor = 1000 / SIDEDRESS_AREA_PER_PLANCHE; // → mg/m²/wk per gram of product
  const phLockoutFactor_P = phLocked ? 0.10 : 0.50;
  const sidedress = {
    N: (sd.actisol_g * PRODUCT_PCT.Actisol_N    * SIDEDRESS_MINIMUM_EFFICIENCY.Actisol_N
      + sd.farine_g  * PRODUCT_PCT.FarinePlumes_N * SIDEDRESS_MINIMUM_EFFICIENCY.FarinePlumes_N
       ) * sdAreaFactor,
    P: sd.actisol_g * PRODUCT_PCT.Actisol_P * phLockoutFactor_P * sdAreaFactor,
    K: sd.actisol_g * PRODUCT_PCT.Actisol_K * SIDEDRESS_MINIMUM_EFFICIENCY.Actisol_K * sdAreaFactor,
  };
  sidedress.efficiency = window.SidedressRecipeTomato.efficiency;

  // Fertigation contributions — barrel-loaded mass per m²/sem, full
  // delivery (no mixing-factor discount; concept retired 2026-05-10).
  // B only present in FP mode (Solubore added 2026-05-08, single-channel for B).
  const fert = { K: fertK, Mg: fertMg };
  if (fertB > 0) fert.B = fertB;
  fert.efficiency = window.FertigationRecipeTomato.efficiency;

  // REQ-157 (amended 2026-05-16) — capability map for the foliar channel
  // sourced from window.FoliarRecipeTomato. Declares per-element coverage
  // regardless of whether the channel doses the element this call.
  // REQ-163 — surfactant-aware: thread the Block 5 surfactant lever through
  // efficiencyFor(surfactant) so the Efficacité column updates on toggle.
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
