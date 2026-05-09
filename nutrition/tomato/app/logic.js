function buildNutriment() {
  // Dispatch on crop sub-toggle. Salanova uses a continuous post-transplant
  // model (mass-gain-driven); Semis uses a per-tray nursery model; tomato
  // uses the existing stage-driven Bilan.
  if (nutrCrop === 'lettuce') {
    buildNutrimentLettuce();
    return;
  }
  if (nutrCrop === 'nursery') {
    buildNutrimentNursery();
    return;
  }
  const target  = parseFloat(document.getElementById('nutr-target').value)  || 1.5;
  const current = parseFloat(document.getElementById('nutr-current').value) || 1.3;
  const phLocked = document.getElementById('nutr-phlocked').checked;

  // Demand is now stage-aware: fruit removal (yield-driven) + biomass build-out
  // (stage-driven). demandBreakdown[el] = {fruit, biomass, total}; we keep a
  // flat `demand[el] = total` view for the existing gap-chain + Block 5 levers
  // that reason on a single number per element.
  const demandBreakdown = calcNutrDemand(target, nutrStage);
  const demand = {};
  Object.keys(demandBreakdown).forEach(el => { demand[el] = demandBreakdown[el].total; });
  // Transpiration factor — corrects soil mass-flow for canopy size (stunted
  // plants transpire less than their irrigation volume). 1,0 = full canopy at
  // target yield; floor 0,4 even for tiny seedlings.
  const transpFactor = transpirationFactor(current, target);
  const supply  = calcNutrSupply(nutrStage, phLocked, transpFactor, target, nutrRecipeMode);
  const r = supply.raw;
  const order = ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'];

  // Pourquoi modal registry — wiped + repopulated each render. Each block
  // below registers `${blockKey}.${el}` entries; renderGapGrid + Block 1
  // grid hand `pqKeyPrefix` so rows get a click handler.
  window.currentPourquoi = {};

  // Mass-balance gap chain (2026-05-07): offtake (fruit + biomass) is replaced
  // by four replenishment channels in this order: compost → sidedress →
  // fertigation → foliar. After each channel, the per-element "remaining gap"
  // feeds the next as input. Soil mass-flow (SME × transpiration) is NOT a
  // replenishment channel — it delivers nutrients to the plant by DRAWING on
  // the bank. Bank trajectory is tracked separately on the 🪨 Banque sol page.
  //
  // Compost release per element (g/m²/wk) → mg/m²/wk for the gap chain.
  const compostMg = {};
  order.forEach(el => {
    const gPerWk = RECIPE_INPUTS.compostReleasePerWeek[el];
    compostMg[el] = (gPerWk != null ? gPerWk : 0) * 1000;
  });
  const gapAfterDemand    = {};   // = demand (nothing covered yet)
  const gapAfterCompost   = {};   // demand − compost
  const gapAfterSidedress = {};   // gapAfterCompost − sidedress
  const gapAfterFert      = {};   // gapAfterSidedress − fert
  const gapAfterFoliar    = {};   // gapAfterFert − foliar
  order.forEach(el => {
    gapAfterDemand[el]    = demand[el] || 0;
    gapAfterCompost[el]   = Math.max(0, gapAfterDemand[el]    - (compostMg[el]         || 0));
    gapAfterSidedress[el] = Math.max(0, gapAfterCompost[el]   - (supply.sidedress[el]  || 0));
    gapAfterFert[el]      = Math.max(0, gapAfterSidedress[el] - (supply.fert[el]       || 0));
    gapAfterFoliar[el]    = Math.max(0, gapAfterFert[el]      - (supply.foliar[el]     || 0));
  });

  // ─── Light-limited yield ceiling (header card) ───
  // Heuristic: 1 kg fresh fruit per 7 kJ/cm² of weekly solar radiation.
  //   weekly_J_cm2 = getSolarRad() (daily) × 7
  //   ceiling kg/m²/wk = weekly_J_cm2 / 7000
  // This is the physical ceiling — nutrition cannot push yield above what
  // light supports. If the target is above the ceiling, flag it.
  const dailyJ = getSolarRad();
  const weeklyJ = dailyJ * 7;
  const lightCeiling = weeklyJ / 7000;
  const tgt = parseFloat(document.getElementById('nutr-target').value) || 1.5;
  const overTarget = tgt > lightCeiling;
  const ceilingColor = overTarget ? '#8a3e1e' : 'var(--text-muted)';
  const ceilingBg    = overTarget ? '#fef0e8' : 'var(--input-bg)';
  const ceilingBord  = overTarget ? '#e8c4a8' : 'var(--border)';
  const ceilingWarn  = overTarget
    ? ` ⚠ <strong>Cible ${tgt.toFixed(2)} > plafond</strong> — nutrition ne pourra pas combler le manque de lumière cette semaine.`
    : '';
  document.getElementById('nutr-light-ceiling').innerHTML =
    `<strong style="color:var(--text);">Plafond lumière ≈ ${lightCeiling.toFixed(2)} kg/m²/sem</strong>`
    + ` <span style="font-size:10px;">cert 2</span><br>`
    + `<span style="font-size:11px;">Radiation cette semaine : ${dailyJ} J/cm²/jour × 7 = ${weeklyJ.toLocaleString('fr-CA')} J/cm²/sem &nbsp;÷&nbsp; 7 kJ/cm² par kg de fruit ≈ <strong style="color:var(--text);">${lightCeiling.toFixed(2)} kg/m²/sem</strong>.${ceilingWarn}</span>`;
  document.getElementById('nutr-light-ceiling').style.color  = ceilingColor;
  document.getElementById('nutr-light-ceiling').style.background = ceilingBg;
  document.getElementById('nutr-light-ceiling').style.borderColor = ceilingBord;

  // ─── Products in play (header card) ───
  // Static names for fertigation salts (STORED_RECIPE.tomato.fertigation uses
  // kSulfate/mgSulfate keys without display labels) and granular sidedress
  // (STORED_RECIPE.tomato.sidedress uses actisol_g/farine_g). Foliar names come
  // straight from STORED_RECIPE.tomato.foliaire so any recipe rename or product
  // swap propagates automatically (REQ-004 spirit). All products listed are
  // CAN/CGSB-32.311 compliant (REQ-002).
  const fertigProducts = [
    'Sulfate de potassium (K₂SO₄, 0-0-50)',
    'Sulfate de magnésium (MgSO₄·7H₂O)',
  ];
  const sidedressProducts = [
    'Actisol 5-3-2 (compost de fumier granulé)',
    'Farine de plumes 13-0-0',
  ];
  const foliarA = STORED_RECIPE.tomato.foliaire.A.map(p => p.name);
  const renderProductGroup = (label, items) =>
    `<div style="margin-bottom:8px;"><div style="font-size:11px; font-weight:600; color:var(--text); margin-bottom:3px;">${label}</div>`
    + `<div style="color:var(--text-muted); padding-left:10px;">${items.map(i => `• ${i}`).join('<br>')}</div></div>`;
  document.getElementById('nutr-products').innerHTML =
      renderProductGroup('Fertigation (au goutteur)', fertigProducts)
    + renderProductGroup('Foliaire — Spray hebdomadaire (mer., oligos)', foliarA)
    + renderProductGroup('Granulaire au sol (planches)', sidedressProducts);

  // ─── Block 1: Weekly plant needs ───
  // Cert: TOMATO_FRUIT_EXPORT is cert 3 (Yara split applied to whole-plant);
  // BIOMASS_DEMAND is cert 3 (Haifa F-144 + Sonneveld extrapolation). Modal
  // shows the per-element split + interpretation.
  const fruitExport_g = (typeof TOMATO_FRUIT_EXPORT !== 'undefined') ? TOMATO_FRUIT_EXPORT : {};
  const biomassDmd = (typeof BIOMASS_DEMAND !== 'undefined' && BIOMASS_DEMAND[nutrStage]) ? BIOMASS_DEMAND[nutrStage] : {};
  const block1HeaderRow = `<div style="display:grid; grid-template-columns:0.5fr 0.9fr 0.9fr 0.9fr; gap:4px 10px;">
    <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Él.</div>
    <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Fruit</div>
    <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Biomasse</div>
    <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Total / m²/sem</div>
  </div>`;
  let html1 = `<div style="font-size:12px;">${block1HeaderRow}`;
  order.forEach(el => {
    const b = demandBreakdown[el];
    // Register pourquoi entry for this element.
    const fxG = fruitExport_g[el];
    const fxStr = (fxG && fxG.g != null) ? `${fxG.g} g/kg` : (fxG != null ? `${fxG} g/kg` : '—');
    const bioStr = (biomassDmd[el] != null) ? `${biomassDmd[el]} mg/m²/sem` : '—';
    const dCert = (typeof TOMATO_DEMAND_CERT !== 'undefined' && TOMATO_DEMAND_CERT[nutrStage])
      ? (TOMATO_DEMAND_CERT[nutrStage][el] != null ? TOMATO_DEMAND_CERT[nutrStage][el] : 2)
      : 2;
    const isMicro = ['Fe','Mn','Zn','B','Cu','Mo'].indexOf(el) >= 0;
    const microCaveat = isMicro
      ? ' ⚠ Cert 1 — TOMATO_FRUIT_EXPORT pour les micros utilise un split 60% par défaut (lacune de données), et BIOMASS_DEMAND.Cu/Mo est cert 1 toutes étapes confondues. Tissue test requis avant d\'agir sur un manque de micro.'
      : '';
    registerPourquoi(`demand.${el}`, {
      title: `${el} — besoin hebdomadaire (stade ${nutrStage})`,
      cert: dCert,
      equation: `demand[${el}] = TOMATO_FRUIT_EXPORT[${el}] × yield + BIOMASS_DEMAND[${nutrStage}][${el}]`,
      plugged: `fruit ${fmtVal(b.fruit)} (${fxStr} × ${target.toFixed(2)} kg/m²/sem) + biomasse ${fmtVal(b.biomass)} (${bioStr}) = <strong>${fmtVal(b.total)} / m²/sem</strong>`,
      interpretation: `Le poste fruit ne tient compte QUE de ce qui sort en récolte. Le poste biomasse couvre la canopée + nouvelles structures hebdomadaires (tiges, racines, jeunes feuilles). Au stade ${nutrStage}, ${b.fruit > b.biomass ? 'le fruit domine' : (b.biomass > b.fruit ? 'la biomasse domine' : 'fruit et biomasse sont équilibrés')}.${el === 'Ca' ? ' Note: Ca xylème uniquement → ~95% reste dans la canopée, seulement 5% part dans le fruit.' : ''}${microCaveat}`
    });
    html1 += `<div class="pq-row" onclick="showPourquoi('demand.${el}')" style="display:grid; grid-template-columns:0.5fr 0.9fr 0.9fr 0.9fr; gap:4px 10px; padding:2px 4px; border-radius:3px;">
      <div style="font-weight:600;">${el}</div>
      <div style="font-family:'DM Mono',monospace; color:var(--text-muted);">${b.fruit > 0 ? fmtVal(b.fruit) : '—'}</div>
      <div style="font-family:'DM Mono',monospace; color:var(--text-muted);">${b.biomass > 0 ? '+ ' + fmtVal(b.biomass) : '—'}</div>
      <div style="font-family:'DM Mono',monospace; font-weight:600;">${fmtVal(b.total)}</div>
    </div>`;
  });
  html1 += `</div>`;
  document.getElementById('nutr-needs').innerHTML = html1;

  // ─── Block 2: Compost résiduel (Savaria ORGANIMIX, fall 2025) ───
  // Reads RECIPE_INPUTS.compostReleasePerWeek (g/m²/wk per element) — single
  // source of truth (REQ-004). Annual mineralization × seasonal Q10 boost;
  // declines over 18-24 months as the compost ages out. First replenishment
  // channel in the mass-balance gap chain (offtake → compost → sidedress →
  // fertigation → foliar).
  const TOMATO_AREA = TOMATO_NUM_BEDS * TOMATO_BED_AREA;
  let html2 = `<div style="font-size:12.5px; line-height:1.5; color:var(--text-muted); margin-bottom:10px;">Minéralisation hebdomadaire du compost Savaria ORGANIMIX appliqué à l'automne 2025 (~25,4 kg/m², étiquette N 0,5 · P₂O₅ 0,1 · K₂O 0,1 · Ca 1,1 · Mg ~0,5 %). Décline avec le temps ; à revisiter quand le compost vieillit (~18-24 mois post-application).</div>`;
  // Per-element compost-supply pourquoi entries — modal opens on row click.
  // Interpretation: stable domain context. Live values come from
  // RECIPE_INPUTS.compostReleasePerWeek (single source of truth).
  order.forEach(el => {
    const gPerWk = RECIPE_INPUTS.compostReleasePerWeek[el];
    if (gPerWk == null) {
      // Element not declared on Savaria label → no compost contribution tracked.
      registerPourquoi(`compost.${el}`, {
        title: `${el} — compost résiduel`,
        cert: 2,
        equation: `compost[${el}] = 0 (non listé dans RECIPE_INPUTS.compostReleasePerWeek)`,
        plugged: `Apport compost = 0 mg/m²/sem`,
        // stable — Savaria label declares only macros + Ca; micros not tracked
        interpretation: `${el} n'est pas suivi dans la libération du compost (étiquette Savaria ne déclare que macros). Apport supposé négligeable à l'échelle hebdomadaire.`
      });
      return;
    }
    const mgPerWk = gPerWk * 1000;
    const totalGPerWk = gPerWk * TOMATO_AREA;
    // stable — Ca-saturation context; mineralization model; Mg label gap; P pH lockout
    const note = el === 'Ca'
      ? '⚠ Le Ca du compost a contribué à la sursaturation calcique du sol (racine de la crise pH 7,4). Pas un manque à combler — un excès à laisser décliner par lessivage.'
      : (el === 'Mg'
        ? 'Mg % NON déclaré sur l\'étiquette Savaria (assomption conservatrice ~0,3 %). Cert 1-2 — vérifier auprès du fournisseur si le poste devient critique.'
        : (el === 'P'
          ? 'P verrouillé à pH ≥ 7 : Ca²⁺ précipite le phosphate fraîchement minéralisé en Ca-P avant absorption. Apport effectif très faible tant que le pH reste haut.'
          : 'Minéralisation année 1 × facteur saisonnier (Q10 ≈ 2 sur l\'activité microbienne pendant la fenêtre T3-T5 chaude).'));
    registerPourquoi(`compost.${el}`, {
      title: `${el} — compost résiduel (Savaria ORGANIMIX)`,
      cert: el === 'Mg' ? 1 : (el === 'Ca' ? 3 : 2),
      equation: `compost[${el}] = RECIPE_INPUTS.compostReleasePerWeek[${el}] × 1000`,
      plugged: `${gPerWk.toFixed(3)} g/m²/sem × 1000 = <strong>${mgPerWk.toFixed(0)} mg/m²/sem</strong> &nbsp;·&nbsp; total tomate (${TOMATO_AREA.toFixed(0)} m²) = ${totalGPerWk.toFixed(1)} g/sem`,
      interpretation: note
    });
  });
  html2 += `<div style="font-size:11.5px; color:var(--text-muted); margin-bottom:4px;">Sortie hebdo (besoin du plant) → manque restant après libération du compost :</div>`;
  html2 += renderGapGrid(gapAfterDemand, compostMg, gapAfterCompost, 'compost');
  document.getElementById('nutr-compost').innerHTML = html2;

  // ─── Block 3: Engrais sol granulaire (Actisol + farine de plumes) ───
  // Reads STORED_RECIPE.tomato.sidedress[stage] source-of-truth (REQ-004).
  // Per-element supply computed in calcNutrSupply (supply.sidedress) using
  // PRODUCT_PCT analysis × SIDEDRESS_MIN_EFF mineralization × pH-lockout
  // factor for P. Second replenishment channel in the mass-balance gap chain.
  let html3sd = `<div style="font-size:12px; color:var(--text-muted); line-height:1.6; padding:10px 12px; background:var(--input-bg); border-radius:var(--radius-sm); margin-bottom:10px;">`;
  html3sd += `<div><strong style="color:var(--text);">Stade ${nutrStage}</strong> — Actisol 5-3-2 : ${r.sd_actisol_g} g/planche · farine de plumes 13-0-0 : ${r.sd_farine_g} g/planche (par semaine).</div>`;
  html3sd += `<div style="margin-top:6px;">N → <strong style="color:var(--text);">${supply.sidedress.N.toFixed(0)} mg/m²/sem</strong> · K → <strong style="color:var(--text);">${supply.sidedress.K.toFixed(0)} mg/m²/sem</strong> · P → <strong style="color:var(--text);">${supply.sidedress.P.toFixed(1)} mg/m²/sem</strong>${phLocked ? ' (pH ≥ 7 : P précipite en Ca-P avant absorption — facteur 10 % appliqué)' : ''}.</div>`;
  html3sd += `<div style="margin-top:4px; font-size:11px; color:var(--text-muted); line-height:1.5;">Efficacité minéralisation : Actisol N 60 % / P 50 % (× 10 % à pH ≥ 7) / K 85 % · farine N 75 %. Régime stade établi en serre tempérée (cert 3).</div>`;
  html3sd += `</div>`;
  // Per-element sidedress pourquoi entries.
  ['N','P','K'].forEach(el => {
    const v = supply.sidedress[el] || 0;
    let eq, note;
    if (el === 'N') {
      eq = 'sidedress[N] = (Actisol_g × Actisol_N × eff_N + Farine_g × Farine_N × eff_N) × 1000 / planche_area';
      // stable — N mineralization model + product analyses are invariant
      note = 'Apport N effectif au régime stade établi : ~4-8 sem d\'applications hebdomadaires se chevauchent en minéralisation steady-state. La farine de plumes domine (75 % efficace, 13 % N) ; l\'Actisol contribue plus lentement (60 %, 5 %).';
    } else if (el === 'P') {
      eq = 'sidedress[P] = Actisol_g × Actisol_P × phLockoutFactor_P × 1000 / planche_area';
      // stable — Ca-P precipitation chemistry; sulfur lever
      note = phLocked
        ? 'P verrouillé à pH ≥ 7 : Ca²⁺ en solution précipite le phosphate fraîchement minéralisé en Ca-P avant absorption racinaire. Facteur 10 % appliqué (Cadre 5-15 %, midpoint). Programme soufre = seul levier durable (pH < 6,5 → P passe à 30-50 % efficace).'
        : 'pH ajusté : minéralisation P de l\'Actisol à 50 % d\'efficacité (l\'organique relâche plus lentement que le N).';
    } else { // K
      eq = 'sidedress[K] = Actisol_g × Actisol_K × eff_K × 1000 / planche_area';
      // stable — K solubility chemistry
      note = 'K majoritairement soluble dans les granules d\'Actisol → efficacité 85 % rapide. Apport modeste vs la fertigation, mais maintient la banque K.';
    }
    registerPourquoi(`sidedress.${el}`, {
      title: `${el} — engrais sol granulaire (stade ${nutrStage})`,
      cert: 3,
      equation: eq,
      plugged: `<strong>${v.toFixed(1)} mg/m²/sem</strong> (Actisol ${r.sd_actisol_g} g + farine ${r.sd_farine_g} g par planche, sur ${SIDEDRESS_AREA_PER_PLANCHE} m²)`,
      interpretation: note
    });
  });
  // Other elements: no sidedress contribution. Stable note.
  ['Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(el => {
    registerPourquoi(`sidedress.${el}`, {
      title: `${el} — pas d'apport granulaire`,
      cert: 3,
      equation: `sidedress[${el}] = 0`,
      plugged: `Apport granulaire = 0 mg/m²/sem`,
      // stable — Actisol + farine carry only N/P/K at meaningful weekly doses
      interpretation: `Les produits granulaires actifs (Actisol 5-3-2 + farine de plumes 13-0-0) ne livrent que N/P/K. ${el} doit venir d'un autre canal (compost, fertigation, foliaire).`
    });
  });
  html3sd += `<div style="font-size:11.5px; color:var(--text-muted); margin-bottom:4px;">Manque entrant (après compost) → manque restant après granulaire :</div>`;
  html3sd += renderGapGrid(gapAfterCompost, supply.sidedress, gapAfterSidedress, 'sidedress');
  document.getElementById('nutr-sidedress').innerHTML = html3sd;

  // ─── Block 4: Fertigation (mass-balance — replaces what offtake removes
  //   after compost + sidedress contributions). ───
  // supply.fert.* values shown here are POST mixing factor — they are exactly
  // what enters the supply sum, so the gap math and the displayed numbers agree.
  // Fertigation doses come from STORED_RECIPE.tomato.fertigation[stage]
  // (locked PA Taillon values, audit-trail captured in RECIPE_HISTORY).
  // The Block 7 drift gauge compares stored vs computeStageRecipe (FP target,
  // mass-balance from RECIPE_INPUTS).
  let html3 = `<div style="font-size:12px; color:var(--text-muted); line-height:1.6; padding:10px 12px; background:var(--input-bg); border-radius:var(--radius-sm); margin-bottom:10px;">`;
  html3 += `<div>K₂SO₄ → <strong style="color:var(--text);">${supply.fert.K.toFixed(0)} mg K/m²/sem</strong></div>`;
  html3 += `<div>MgSO₄ → <strong style="color:var(--text);">${supply.fert.Mg.toFixed(0)} mg Mg/m²/sem</strong></div>`;
  if (supply.fert.B != null && supply.fert.B > 0) {
    html3 += `<div>Solubore → <strong style="color:var(--text);">${supply.fert.B.toFixed(2)} mg B/m²/sem</strong></div>`;
    html3 += `<div style="margin-top:6px; padding-top:6px; border-top:1px dashed var(--border); font-size:11.5px;">Pas de N (biofilm). Sulfates d'oligos (Mn/Zn/Cu/Fe) précipitent au pH actuel — foliaire les porte. Acide borique (Solubore) non-ionique : OK en fertigation à tout pH.</div>`;
  } else {
    html3 += `<div style="margin-top:6px; padding-top:6px; border-top:1px dashed var(--border); font-size:11.5px;">Pas de N (biofilm) · pas d'oligos (verrouillage racinaire à pH actuel).</div>`;
  }
  if (nutrRecipeMode === 'fp') {
    html3 += `<div style="margin-top:4px; font-size:11px; color:var(--text-muted); line-height:1.5;">Mode FP : aucun facteur de mélange (mass-balance pure, pas de crédit SME).</div>`;
  } else {
    html3 += `<div style="margin-top:4px; font-size:11px; color:var(--text-muted); line-height:1.5;">Facteur de mélange ${MIXING_FACTOR_FERT} appliqué : ~50% absorbé au goutteur avant mélange; le reste rejoint la réserve du sol.</div>`;
  }
  html3 += `</div>`;
  // Per-element fertigation pourquoi entries — modal opens on row click.
  // K and Mg: full equation (barrel × analysis × mixing factor / area).
  // Other elements: no contribution from current fertigation (stated in modal).
  const k_g = r.k_g_total;
  const mg_g = r.mg_g_total;
  const isFpMode = nutrRecipeMode === 'fp';
  const mixFactorLabel = isFpMode ? '1.0 (mass-balance pure, FP)' : `${MIXING_FACTOR_FERT}`;
  const mixFactorVal = isFpMode ? 1.0 : MIXING_FACTOR_FERT;
  registerPourquoi('fert.K', {
    title: 'K — apport fertigation (K₂SO₄)',
    cert: 4,
    equation: `fert[K] = (k_g_total × K2SO4_K_analysis / area × 1000) × ${mixFactorLabel}`,
    plugged: `(${k_g.toFixed(0)} g × ${PRODUCT_PCT.K2SO4_K} × 1000 / ${r.area.toFixed(0)} m²) × ${mixFactorVal} = <strong>${supply.fert.K.toFixed(0)} mg K/m²/sem</strong>`,
    interpretation: isFpMode
      ? `Recette FP_RECIPE_T5.fertigation['K2SO4'] = ${k_g.toFixed(0)} g (mass-balance T5). Mode FP : pas de facteur de mélange — mass-balance pure, pas de crédit SME. Cert 3.`
      : `Recette STORED_RECIPE.tomato.fertigation[${nutrStage}].kSulfate × multiplicateur K (${getMultK()}). Valeur stockée verrouillée (PA Taillon avril 2026, audit-trail RECIPE_HISTORY). ~50 % absorbé au goutteur ; le reste rejoint la réserve du sol. MIXING_FACTOR_FERT = ${MIXING_FACTOR_FERT} cert 2-3 (variable selon volume et fréquence d'irrigation).`
  });
  registerPourquoi('fert.Mg', {
    title: 'Mg — apport fertigation (MgSO₄·7H₂O)',
    cert: 4,
    equation: `fert[Mg] = (mg_g_total × MgSO4_Mg_analysis / area × 1000) × ${mixFactorLabel}`,
    plugged: `(${mg_g.toFixed(0)} g × ${PRODUCT_PCT.MgSO4_Mg.toFixed(4)} × 1000 / ${r.area.toFixed(0)} m²) × ${mixFactorVal} = <strong>${supply.fert.Mg.toFixed(0)} mg Mg/m²/sem</strong>`,
    interpretation: isFpMode
      ? `Recette FP_RECIPE_T5.fertigation['MgSO4-7H2O'] = ${mg_g.toFixed(0)} g (mass-balance T5). Mode FP : pas de facteur de mélange.`
      : `Recette STORED_RECIPE.tomato.fertigation[${nutrStage}].mgSulfate × multiplicateur Mg (${getMultMg()}). Valeur stockée verrouillée (PA Taillon avril 2026). Le compost résiduel + la fertigation bouclent la sortie hebdo.`
  });
  // FP-mode Solubore in fertigation: register a real B entry; otherwise the
  // generic "not in fert" reason below applies.
  const sb_fert_g = isFpMode ? (FP_RECIPE_T5.fertigation['Solubore'] || 0) : 0;
  if (sb_fert_g > 0) {
    registerPourquoi('fert.B', {
      title: 'B — apport fertigation (Solubore 20-B)',
      cert: 3,
      equation: `fert[B] = (Solubore_g × Solubore_B_analysis / area × 1000) × ${mixFactorLabel}`,
      plugged: `(${sb_fert_g} g × ${PRODUCT_PCT.Solubore_B} × 1000 / ${r.area.toFixed(0)} m²) × ${mixFactorVal} = <strong>${supply.fert.B.toFixed(2)} mg B/m²/sem</strong>`,
      interpretation: `Acide borique (Solubore 20-B) — non-ionique, 100 % d'efficacité au pH 7,4 (REQ-018 OK, pas de Ksp). Seul micro qui traverse le baril sans pertes chimiques. Ecocert validé 2026-05-08. Foliaire B = 0 (canal unique : la fertigation porte tout le B).`
    });
  }
  // Other elements: register a generic "not in fertigation" entry so a row
  // click still produces a useful answer instead of opening an empty modal.
  // Reasons below are stable — domain chemistry, not dependent on dose values.
  const fertSkipEls = sb_fert_g > 0
    ? ['N','P','Ca','Fe','Mn','Zn','Cu','Mo']
    : ['N','P','Ca','Fe','Mn','Zn','B','Cu','Mo'];
  fertSkipEls.forEach(el => {
    const reason = el === 'N'
      // stable — biofilm risk + organic mineralization rationale
      ? 'N retiré de la fertigation : risque de biofilm dans le baril (matière organique des poissons hydrolysés non utilisée en production) et la minéralisation organique (Actisol + farine de plumes) couvre la sortie. Apport via granulaire au sol + compost.'
      : (el === 'Ca' || el === 'Mg' || el === 'P')
        // stable — Ca-saturé / Ca-P precipitation chemistry
        ? `${el} non ajouté en fertigation : ${el === 'Ca' ? 'sol Ca-saturé — surplus inutile' : (el === 'P' ? 'le P précipite avec Ca²⁺ à pH ≥ 7 avant d\'atteindre les racines' : '')}.`
        // stable — sulfate-oligo precipitation chemistry at high pH; foliar bypass concept
        : `${el} retiré de la fertigation 2026-04-26 : à pH ≥ 7 les sulfates d'oligos précipitent (oxydation, hydroxydes, phosphates de Ca) avant absorption. Foliaire bypasse cette chimie. Réintroduction en fertigation seulement si pH &lt; 6,5.`;
    registerPourquoi(`fert.${el}`, {
      title: `${el} — pas en fertigation`,
      cert: 3,
      equation: `fert[${el}] = 0 (élément absent de STORED_RECIPE.tomato.fertigation)`,
      plugged: `Apport fertigation = 0 mg/m²/sem`,
      interpretation: reason
    });
  });
  html3 += `<div style="font-size:11.5px; color:var(--text-muted); margin-bottom:4px;">Manque entrant (après granulaire) → manque restant après fertigation :</div>`;
  html3 += renderGapGrid(gapAfterSidedress, supply.fert, gapAfterFert, 'fert');
  document.getElementById('nutr-fert').innerHTML = html3;

  // ─── Block 5: Foliar (micros — bypass root lockout at pH 7,4) ───
  // Mass-balance numbering 2026-05-07: 1 besoin · 2 compost · 3 sidedress ·
  // 4 fertigation · 5 foliaire · 6 leviers · 7 stockée vs FP.
  let html4 = `<div style="font-size:12px; color:var(--text-muted); line-height:1.6; padding:10px 12px; background:var(--input-bg); border-radius:var(--radius-sm); margin-bottom:10px;">`;
  html4 += `<div style="font-weight:600; color:var(--text); margin-bottom:4px;">Spray hebdomadaire (oligos)</div>`;
  html4 += `<div>MnSO₄ ${r.mnSO4_g} g · ZnSO₄ ${r.znSO4_g} g · Solubore ${r.sb_g} g · CuSO₄ ${r.cuSO4_g} g · NaMoO₄ ${r.moNa_g} g · ${r.feSourceLabel}</div>`;
  html4 += `<div style="font-size:11px; color:var(--text-muted); margin-top:6px;">Spray B (CaCl₂ anti-BER) retiré 2026-05-06 — Ca foliaire = 0 dans le bilan; BER géré par ventilation + humidité.</div>`;
  html4 += `</div>`;
  // Per-element foliar pourquoi entries — modal opens on row click.
  // Mn/Zn/B/Cu/Mo/Fe share the same equation shape (g × analysis / area × cov);
  // Ca was Spray B (retired 2026-05-06). Other elements not on a foliar.
  const cov = 0.30;
  const foliarMap = {
    Mn: { g: r.mnSO4_g, analysis: PRODUCT_PCT.MnSO4_Mn,  product: 'MnSO₄' },
    Zn: { g: r.znSO4_g, analysis: PRODUCT_PCT.ZnSO4_Zn,  product: 'ZnSO₄' },
    B:  { g: r.sb_g,    analysis: PRODUCT_PCT.Solubore_B, product: 'Solubore' },
    Cu: { g: r.cuSO4_g, analysis: PRODUCT_PCT.CuSO4_Cu,  product: 'CuSO₄' },
    Mo: { g: r.moNa_g,  analysis: PRODUCT_PCT.NaMoO4_Mo, product: 'Na₂MoO₄' },
    Fe: { g: r.feApplied_g, analysis: PRODUCT_PCT.FeSO4_Fe, product: 'FeSO₄·7H₂O' },
  };
  Object.entries(foliarMap).forEach(([el, m]) => {
    registerPourquoi(`foliar.${el}`, {
      title: `${el} — apport foliaire (${m.product})`,
      cert: el === 'Cu' ? 3 : 4,
      equation: `foliar[${el}] = ${m.product}_g × analysis / area × 1000 × coverage`,
      plugged: `${m.g} g × ${m.analysis} × 1000 / ${r.area.toFixed(0)} m² × ${cov} = <strong>${(supply.foliar[el]||0).toFixed(2)} mg ${el}/m²/sem</strong>`,
      // stable — coverage discount + foliar-bypass concept; Cu narrow safety
      // window is invariant chemistry. Fe-margin claim stripped 2026-05-08
      // (depended on a specific dose vs T5 demand, both can change).
      interpretation: `Coverage ${Math.round(cov*100)}% sans yucca (cert 4). Foliaire bypasse le verrouillage racinaire à pH 7,4 — la cuticule n'est pas affectée par la saturation Ca du sol.${el === 'Cu' ? ' ⚠ Cu : fenêtre de sécurité étroite (toxicité observée sans surfactant — pooling concentre localement).' : ''}`
    });
  });
  registerPourquoi('foliar.Ca', {
    title: 'Ca — apport foliaire (retiré)',
    cert: 4,
    equation: 'foliar[Ca] = 0 (Spray B retiré 2026-05-06)',
    plugged: 'Apport foliaire Ca = 0 mg/m²/sem',
    // stable — Spray B retirement rationale + BER physiology (Ca xylème-only)
    interpretation: `Spray B retiré 2026-05-06 — Ecocert input listing non vérifié (REQ-002). Prévention BER désormais via ventilation + humidité (le Ca xylémique suit le flux de transpiration). Si BER persiste, application externe événementielle hors app.`
  });
  // Reasons below are stable — domain chemistry (foliar inefficiency for N/P).
  ['N','P','K','Mg'].forEach(el => {
    registerPourquoi(`foliar.${el}`, {
      title: `${el} — pas en foliaire`,
      cert: 4,
      equation: `foliar[${el}] = 0`,
      plugged: `Pas de produit foliaire pour ${el}.`,
      interpretation: el === 'N'
        // stable — foliar N physiology (urea/NO3 cuticle inefficiency)
        ? 'N foliaire = inefficace en mass-flow (urée brûle, NO₃ peu absorbé par cuticule). Apport via fertigation/sol uniquement.'
        : el === 'P'
          // stable — Ca-P precipitation on leaf surface
          ? 'P foliaire peu efficace ; précipitation Ca-P sur la feuille (pH du film d\'eau monte rapidement).'
          : `${el} couvert par fertigation + sol ; foliaire pas nécessaire.`
    });
  });
  // gap chain: demand → soil → fert → foliar (sidedress is bank-maintenance, not in the chain).
  html4 += `<div style="font-size:11.5px; color:var(--text-muted); margin-bottom:4px;">Manque entrant (après fertigation) → manque restant après foliaire :</div>`;
  html4 += renderGapGrid(gapAfterFert, supply.foliar, gapAfterFoliar, 'foliar');
  document.getElementById('nutr-foliar').innerHTML = html4;

  // ─── Block 6: Leviers (final residual + auto-derived per-element actions) ───
  // Mass-balance numbering (2026-05-07): block was 5 in the previous
  // soil-mass-flow framing; the supply chain is now compost → sidedress →
  // fert → foliar (4 replenishment channels) and the residual after all four
  // is the gap that needs a lever.
  const missingElems = order.filter(el => gapAfterFoliar[el] > 0);
  // Lever advice is auto-derived from the live data state per element instead
  // of being hand-written. This eliminates stale advice when recipes / channel
  // state change. Inputs read by deriveLever:
  //   - gapAfterFoliar[el]                residual gap after the 4 channels
  //   - phLocked                          pH state (drives P sulfur lever)
  //   - supply.{fert,foliar,sidedress}[el] which channel owns it
  // Returns an HTML string (lever advice) or '' (no entry).
  // Foliar-channel elements (Mn/Zn/Cu/Fe/B/Mo) share the same no-yucca
  // template — coverage is the dominant constraint without surfactant.
  const FOLIAR_ELEMS = ['Mn', 'Zn', 'B', 'Cu', 'Mo', 'Fe'];
  function deriveLever(el) {
    const gap = gapAfterFoliar[el] || 0;
    if (gap <= 0) return '';
    // P + phLocked → sulfur is the only durable lever (stable domain context).
    if (el === 'P' && phLocked) {
      return '<strong>Verrouillage chimique du sol</strong> au pH actuel — programme soufre = seul levier durable. Foliar P peu efficace (précipitation Ca-P sur la feuille) ; fertigation P précipite avant absorption.';
    }
    // N → mass-balance check: compost + sidedress should cover the bulk; if
    // gap remains, the obvious lever is to step up the granular dose at the
    // current stage (STORED_RECIPE.tomato.sidedress[stage]) or wait for compost
    // mineralization.
    if (el === 'N') {
      return 'Augmenter le dosage granulaire (STORED_RECIPE.tomato.sidedress[stade] : Actisol + farine de plumes) ou attendre la minéralisation du compost. La fertigation N reste retirée (risque biofilm). Si la carence visible persiste, valider par foliaire pétiole NO₃-N (bande adéquate 800-1 200 ppm).';
    }
    // Foliar-channel elements + no-yucca state → coverage is the dominant
    // constraint. Single template applies to Mn/Zn/Cu/Fe/B/Mo regardless of
    // sulfate in recipe. No-yucca state is fixed today
    // (STORED_RECIPE.tomato.foliaire.A has no yucca slot).
    if (FOLIAR_ELEMS.indexOf(el) >= 0 && (supply.foliar[el] || 0) > 0) {
      return 'Foliaire actif mais couverture 30 % limite la dose sans surfactant. Restaurer yucca → couverture 80 % ; doses cibles deviennent ~⅓ pour la même livraison, et la marge de plafond brûlure permet de pousser le 100 % de demande.';
    }
    // Default fallback — gap exists but no specific lever derived (rare; means
    // the element is uncovered by all 4 channels with no obvious knob).
    return 'Gap non couvert par les canaux actifs ; vérifier la recette (canal manquant ou élément retiré).';
  }

  let html5 = '';
  // REQ-014 — surface bank-loading over-supply for the current stage. When
  // ACCEPTED_EXCESSES has entries matching nutrStage, warn the operator that
  // the over-supply is by-design (residual compost > vegetative demand) and
  // not a recipe error. Bank loads in vegetative stages, draws down through
  // fruit-fill — net stable over annual cycle.
  if (typeof ACCEPTED_EXCESSES !== 'undefined') {
    const stageExcesses = ACCEPTED_EXCESSES.filter(e => e.stage === nutrStage);
    if (stageExcesses.length > 0) {
      const els = stageExcesses.map(e => e.element).join(', ');
      html5 += `<div style="background:#fdf6e3; border:1.5px solid #e8d28a; border-radius:6px; padding:10px 12px; margin-bottom:12px; color:#7a5d12; font-size:12.5px; line-height:1.5;">⚠ <strong>Sur-apport accepté à ${nutrStage}</strong> pour ${els} — résiduel compost Savaria 2025 &gt; demande à ce stade. Pas une erreur de recette : la banque se charge en stade végétatif et se draine en T4-T5. Voir <code>ACCEPTED_EXCESSES</code> dans le code pour le détail par élément.</div>`;
    }
  }
  if (missingElems.length === 0) {
    html5 += `<div style="background:#eaf6ec; border:1.5px solid #b8d8c0; border-radius:6px; padding:10px 12px; margin-bottom:12px; color:#1e6b2d; font-size:13px;"><strong>✅ Couverture nutritionnelle complète</strong> pour la cible — sous réserve que biomasse, lumière, taille, IPM suivent.</div>`;
  } else {
    // Sort gaps by absolute size (descending) — biggest gap first
    const sorted = missingElems.slice().sort((a, b) => gapAfterFoliar[b] - gapAfterFoliar[a]);
    const severity = (el) => {
      const ratio = gapAfterFoliar[el] / Math.max(demand[el], 1);
      return ratio > 0.5 ? '🔴' : (ratio > 0.2 ? '🟡' : '🟢');
    };
    html5 += `<div style="font-size:12.5px; color:var(--text-muted); margin-bottom:10px; line-height:1.5;">Après les 4 canaux de réapprovisionnement (compost, granulaire, fertigation, foliaire), voici ce qui n'est pas couvert. Chaque ligne = le levier qui ferme le gap (dérivé de l'état actuel des canaux + pH).</div>`;
    html5 += `<ol style="padding-left:20px; font-size:13px; line-height:1.5; margin:0;">`;
    sorted.forEach(el => {
      const gap = gapAfterFoliar[el];
      const dem = demand[el];
      const pct = (gap / dem * 100).toFixed(0);
      const lever = deriveLever(el);
      html5 += `<li style="margin-bottom:10px;">${severity(el)} <strong>${el}</strong> — il manque ${fmtVal(gap)}/m²/sem (${pct}% de la demande). <br><span style="color:var(--text-muted); font-size:12px;">${lever}</span></li>`;
    });
    html5 += `</ol>`;
  }
  // Always-on structural reminder when pH is locked.
  // stable — does not depend on recipe/SME state; chemistry of pH ≥ 7 lockout
  // (P precipitates Ca-P ; Fe/Mn/Zn oxidize to insoluble forms) is invariant.
  if (phLocked) {
    html5 += `<div style="background:var(--accent-tomato-light); border:1.5px solid var(--accent-tomato-border); border-radius:6px; padding:10px 12px; margin-top:12px; font-size:12.5px; line-height:1.5;"><strong style="color:var(--accent-tomato);">Action structurelle :</strong> tant que le pH du sol reste ≥ 7, P / Mn / Zn / Fe restent foliaire-only. Programme soufre = seul vrai levier durable.</div>`;
  }
  document.getElementById('nutr-missing').innerHTML = html5;

  // ─── Recette proposée — admin-only model + manual safety overrides ───
  // Surfaces the architectural-rules + manual-override recipe (per channel)
  // alongside the operations-recipe display above. Numbers are pinned to the
  // T5 tomato decision set documented in working files/session-knowledge.md
  // (entries dated 2026-05-05 / 2026-05-06): foliar Cu cut 4→2 g, Mn/Zn 22→18 g
  // pending tissue analysis, soufre standardisé 2.5 kg/100 m²/mois mid-band,
  // Spray B (CaCl₂) retiré 2026-05-06 (Ecocert non vérifié). Stage-aware
  // gating below: only show numbers for tomato T5 (current); other stages
  // render a brief explainer placeholder.
  try {
    const proposedEl = document.getElementById('nutr-proposed');
    if (proposedEl) proposedEl.innerHTML = renderProposedRecipe(nutrStage);
  } catch (e) {
    console.warn('[Proposed] render failed:', e);
  }

  // ─── Phase 1 model — drift detection (REQ-016) ───
  // Renders stored-vs-computed recipe deltas. Admin-only block; doesn't
  // change any team-facing surface. Fenced as a visible "this is the model
  // talking, not the operations recipe".
  try {
    const phase1El = document.getElementById('nutr-phase1');
    if (phase1El) phase1El.innerHTML = renderPhase1Comparison();
  } catch (e) {
    console.warn('[Phase1] render failed:', e);
  }
}

// Wire stage selector + input listeners
function setNutrStage(s) {
  nutrStage = s;
  // FP_RECIPE_T5 only defined for T5 — switching off T5 forces mode back to
  // stored. Otherwise FP would silently render T5's recipe at e.g. T2 demand.
  let modeChanged = false;
  if (s !== 'T5' && nutrRecipeMode === 'fp') {
    nutrRecipeMode = 'stored';
    modeChanged = true;
  }
  document.querySelectorAll('[data-nstage]').forEach(b => b.classList.toggle('active', b.dataset.nstage === s));
  syncNutrRecipeModeUI();
  // Persist the auto-revert in the URL so reload doesn't resurrect the FP mode
  // at a non-T5 stage. Stage itself is page-local and intentionally not in the
  // hash — only the mode flip is.
  if (modeChanged && typeof syncHash === 'function') syncHash();
  buildNutriment();
}

// Wire recipe-source toggle (Stockée / Premiers principes). FP only defined
// for T5; switching to FP snaps the stage to T5 so demand and supply stay
// stage-consistent.
function setNutrRecipeMode(mode) {
  nutrRecipeMode = (mode === 'fp') ? 'fp' : 'stored';
  if (nutrRecipeMode === 'fp' && nutrStage !== 'T5') {
    nutrStage = 'T5';
    document.querySelectorAll('[data-nstage]').forEach(b => b.classList.toggle('active', b.dataset.nstage === 'T5'));
  }
  syncNutrRecipeModeUI();
  // Persist the toggle in the URL hash so reload / bookmark restores the choice.
  if (typeof syncHash === 'function') syncHash();
  buildNutriment();
}

// Refresh the toggle button styling + helper note. Called from setNutrStage,
// setNutrRecipeMode, and the initial setNutrCrop pass.
function syncNutrRecipeModeUI() {
  const storedBtn = document.getElementById('nutr-recipe-stored');
  const fpBtn     = document.getElementById('nutr-recipe-fp');
  const note      = document.getElementById('nutr-recipe-mode-note');
  if (!storedBtn || !fpBtn) return;
  const isFp = nutrRecipeMode === 'fp';
  storedBtn.style.background = isFp ? 'var(--input-bg)' : 'var(--text)';
  storedBtn.style.color      = isFp ? 'var(--text-muted)' : 'var(--bg)';
  fpBtn.style.background     = isFp ? 'var(--text)' : 'var(--input-bg)';
  fpBtn.style.color          = isFp ? 'var(--bg)' : 'var(--text-muted)';
  if (note) {
    note.innerHTML = isFp
      ? 'Recettes : <strong>FP_RECIPE_T5</strong> — fertigation 0/0 g · sidedress 0 Actisol + 1300 g farine · foliaire Mn18·Zn16·Cu2·Fe90·Mo0,5 g. Le stade est verrouillé sur T5.'
      : 'Recettes : <strong>stockées</strong> (STORED_RECIPE.tomato.{fertigation, sidedress, foliaire}) — ce que l\'équipe pèse cette semaine.';
  }
}
