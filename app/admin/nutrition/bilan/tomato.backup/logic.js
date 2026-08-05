function buildNutrimentTomato() {
  const PN = window.PlantNeedsTomato;
  const target  = parseFloat(document.getElementById('nutr-target').value)  || 1.5;
  const solarPerGram = parseFloat(document.getElementById('nutr-solar-per-gram').value) || 7;

  // header-inputs-four-scalars: header inputs are exactly four scalars (target,
  // solarPerGram, stage, recipeMode). The "current yield" input was retired
  // 2026-05-09 — page now answers "what's needed at target", not "what's
  // needed given current canopy". ca-mg-biomass-transpiration-coupled Ca/Mg biomass × transpFactor
  // still applies, but transpFactor pins to 1.0 (full-canopy assumption).
  // Re-add a transpFactor knob if mid-cycle stunted-plant correction
  // becomes operationally important.
  const transpFactor = 1.0;

  // Demand is now stage-aware: fruit removal (yield-driven) + biomass build-out
  // (stage-driven). demandBreakdown[element] = {fruit, biomass, total}; we keep a
  // flat `demand[element] = total` view for the existing gap-chain + Block 5 levers
  // that reason on a single number per element.
  const demandBreakdown = PN.calculateNutritionDemand(target, nutrStage, transpFactor);
  const demand = {};
  Object.keys(demandBreakdown).forEach(element => { demand[element] = demandBreakdown[element].total; });
  const supply  = calculateNutritionSupply(nutrStage, transpFactor, target, nutrRecipeMode);
  const r = supply.raw;
  const order = ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'];

  // Pourquoi modal registry — wiped + repopulated each render. Each block
  // below registers `${blockKey}.${element}` entries; renderGapGrid + Block 1
  // grid hand `pqKeyPrefix` so rows get a click handler.
  window.currentPourquoi = {};

  // Product registry for the contribution-block-recipe-table recipe tables. Composition values are
  // mass fractions (label-stated %). Source: PRODUCT_PCT + compost label
  // (window.CompostContribution.COMPOST_LABEL_PCT).
  const PRODUCT_REGISTRY = {
    OrganimixSavaria: { label: 'Savaria ORGANIMIX marin',
      composition: { N: 0.005, P: 0.000437, K: 0.00083, Ca: 0.011, Mg: 0.003 } },
    Actisol:       { label: 'Actisol 5-3-2',
      composition: { N: PRODUCT_PCT.Actisol_N, P: PRODUCT_PCT.Actisol_P, K: PRODUCT_PCT.Actisol_K } },
    FarinePlumes:  { label: 'Farine de plumes 13-0-0',
      composition: { N: PRODUCT_PCT.FarinePlumes_N } },
    K2SO4:         { label: 'K₂SO₄',
      composition: { K: PRODUCT_PCT.K2SO4_K } },
    MgSO4:         { label: 'MgSO₄·7H₂O',
      composition: { Mg: PRODUCT_PCT.MgSO4_Mg } },
    Solubore:      { label: 'Solubore 20-B',
      composition: { B: PRODUCT_PCT.Solubore_B } },
    MnSO4:         { label: 'MnSO₄',
      composition: { Mn: PRODUCT_PCT.MnSO4_Mn } },
    ZnSO4:         { label: 'ZnSO₄',
      composition: { Zn: PRODUCT_PCT.ZnSO4_Zn } },
    CuSO4:         { label: 'CuSO₄',
      composition: { Cu: PRODUCT_PCT.CuSO4_Cu } },
    NaMoO4:        { label: 'Molybdate de sodium',
      composition: { Mo: PRODUCT_PCT.NaMoO4_Mo } },
    FeSO4:         { label: 'FeSO₄·7H₂O',
      composition: { Fe: PRODUCT_PCT.FeSO4_Fe } },
  };
  const fmtGrams = (g) => Math.round(g).toLocaleString('fr-CA') + ' g';

  // Mass-balance gap chain (2026-05-11): offtake (fruit + biomass) draws on
  // the soil bank first (Ca + P only, both reservoir-dominant), then is
  // replenished by three displayed channels in order: compost → sidedress →
  // fertigation. After each station, the per-element "remaining gap" feeds the
  // next as input. Block 2 here is a static reservoir read — bank size +
  // depletion runway. (Foliar supply still enters the model total via
  // calculateNutritionSupply, but the retired-spray channel is no longer a
  // displayed gap-chain station.)
  //
  // Compost release per element (g/m²/wk) → mg/m²/wk for the gap chain.
  const CC = window.CompostContribution;
  const compostMg = {};
  order.forEach(element => {
    const gPerWk = CC.releasePerWeek[element];
    compostMg[element] = (gPerWk != null ? gPerWk : 0) * 1000;
  });

  // Cascade anchored on Block 2, not raw demand: the soil pool feeds the
  // plant; the downstream channels (compost → sidedress → fert)
  // maintain the pool. Incoming gap per element = Block 2 min maintenance
  // dose for pool-formers, Block 2b weekly removal for mobile (N,B,Mo) + Fe.
  const SC = window.SoilContribution;
  const PM = window.PoolMaintenance;
  const bankMap = SC.BANK_MG_M2.tomato || {};
  const ppmByElement = {};
  order.forEach(element => {
    if (bankMap[element] != null) ppmByElement[element] = PM.poolPpmFromBankMg(bankMap[element]);
  });
  // Elements the soil already covers → zero incoming gap, not the Block 1
  // plant-demand value. Fe: bank ~310 ppm, passive (channel-role). Mo: anionic
  // molybdate amply available at pH ≥ 6. Same 0-pinning as Block 2b.
  const SOIL_COVERED = ['Fe', 'Mo'];
  const cascadeEntry = {};
  order.forEach(element => {
    if (PM.POOL_FORMING_ELEMENTS.includes(element)) {
      const band = PM.bandPpm(element, ppmByElement);
      cascadeEntry[element] = PM.maintenanceDose(element, ppmByElement[element], demand[element] || 0, band).dose;
    } else if (SOIL_COVERED.includes(element)) {
      cascadeEntry[element] = 0;  // soil covers offtake — no channel gap
    } else {
      cascadeEntry[element] = demand[element] || 0;  // N, B: weekly removal (channel-replenished)
    }
  });

  const gapAfterCompost   = {};   // cascadeEntry − compost
  const gapAfterSidedress = {};   // gapAfterCompost − sidedress
  const gapAfterFert      = {};   // gapAfterSidedress − fert
  order.forEach(element => {
    gapAfterCompost[element]   = Math.max(0, (cascadeEntry[element]   || 0) - (compostMg[element]        || 0));
    gapAfterSidedress[element] = Math.max(0, gapAfterCompost[element]       - (supply.sidedress[element] || 0));
    gapAfterFert[element]      = Math.max(0, gapAfterSidedress[element]     - (supply.fert[element]      || 0));
  });

  // ─── Light-limited yield ceiling (header card) — light-ceiling-from-operator-j-per-g ───
  //   weekly_J_cm² = getSolarRad() (daily) × 7
  //   ceiling kg/m²/wk = weekly_J_cm² ÷ (solarPerGram × 1000)
  // solarPerGram is operator-set (default 7 J/g ≈ 14 g/MJ at canopy).
  const dailyJ = getSolarRad();
  const weeklyJ = dailyJ * 7;
  const lightCeiling = weeklyJ / (solarPerGram * 1000);
  const overTarget = target > lightCeiling;
  const headlineColor = overTarget ? '#8a3e1e' : 'var(--text)';
  const ceilingBg     = overTarget ? '#fef0e8' : 'var(--input-bg)';
  const ceilingBord   = overTarget ? '#e8c4a8' : 'var(--border)';
  const headlineElement = document.getElementById('nutr-light-ceiling-headline');
  if (headlineElement) {
    headlineElement.textContent = `${lightCeiling.toFixed(2)} kg / m² / sem`;
    headlineElement.style.color = headlineColor;
  }
  const ceilingCard = document.getElementById('nutr-light-ceiling');
  ceilingCard.style.background   = ceilingBg;
  ceilingCard.style.borderColor  = ceilingBord;
  // light-ceiling-from-operator-j-per-g: ⚠ message rendered ONLY when target > ceiling. Paired with the
  // orange-bg color flip above so both visual signals appear together.
  const ceilingWarn = document.getElementById('nutr-light-ceiling-warning');
  if (ceilingWarn) {
    if (overTarget) {
      ceilingWarn.innerHTML = `⚠ Cible ${target.toFixed(2)} kg/m²/sem au-dessus du plafond lumière (${lightCeiling.toFixed(2)} à ${solarPerGram} J/g) — atteignable seulement si la conversion lumière→fruit est meilleure que l'hypothèse.`;
      ceilingWarn.style.display = 'block';
    } else {
      ceilingWarn.innerHTML = '';
      ceilingWarn.style.display = 'none';
    }
  }

  // recipe-mode-toggle-fp-left-default-right: products-in-play list retired 2026-05-09 — replaced by the
  // per-block product names that already appear inline in each Block 1-5
  // card body. Header stays minimal.

  // ─── Block 1: Weekly plant needs ───
  // Cert: TOMATO_FRUIT_EXPORT is cert 3 (Yara split applied to whole-plant);
  // BIOMASS_DEMAND is cert 3 (Haifa F-144 + Sonneveld extrapolation). Modal
  // shows the per-element split + interpretation.
  const fruitExport_g = (PN && PN.TOMATO_FRUIT_EXPORT) ? PN.TOMATO_FRUIT_EXPORT : {};
  const biomassDmd = (PN && PN.BIOMASS_DEMAND && PN.BIOMASS_DEMAND[nutrStage]) ? PN.BIOMASS_DEMAND[nutrStage] : {};
  const block1HeaderRow = `<div style="display:grid; grid-template-columns:0.5fr 0.9fr; gap:4px 10px;">
    <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Él.</div>
    <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">mg/m²/week</div>
  </div>`;
  let html1 = `<div style="font-size:12px;">${block1HeaderRow}`;
  order.forEach(element => {
    const b = demandBreakdown[element];
    // Modal exposes only cert + equation + plugged numbers.
    // Per-element interpretation prose is intentionally omitted — it lives
    // in nutrition/tomato/domain/plant-needs/derivation.md (single source).
    const fxG = fruitExport_g[element];
    const fruitExportString = (fxG && fxG.g != null) ? `${fxG.g} g/kg` : (fxG != null ? `${fxG} g/kg` : '—');
    const biomassString = (biomassDmd[element] != null) ? `${biomassDmd[element]} mg/m²/sem` : '—';
    const dCert = PN.certFor(nutrStage, element);
    const isTranspCoupled = (element === 'Ca' || element === 'Mg');
    const equationString = isTranspCoupled
      ? `demand[${element}] = fruitExport[${element}] × yield + biomass[${nutrStage}][${element}] × transpFactor`
      : `demand[${element}] = fruitExport[${element}] × yield + biomass[${nutrStage}][${element}]`;
    const bioPlugged = isTranspCoupled
      ? `${biomassString} × ${transpFactor.toFixed(2)}`
      : biomassString;
    registerPourquoi(`demand.${element}`, {
      title: `${element} — besoin hebdomadaire (stade ${nutrStage})`,
      cert: dCert,
      equation: equationString,
      plugged: `fruit ${formatValue(b.fruit)} (${fruitExportString} × ${target.toFixed(2)} kg/m²/sem) + biomasse ${formatValue(b.biomass)} (${bioPlugged}) = <strong>${formatValue(b.total)} / m²/sem</strong>`,
    });
    html1 += `<div class="pq-row" onclick="showPourquoi('demand.${element}')" style="display:grid; grid-template-columns:0.5fr 0.9fr; gap:4px 10px; padding:2px 4px; border-radius:3px;">
      <div style="font-weight:600;">${element}</div>
      <div style="font-family:'DM Mono',monospace; font-weight:600;">${formatMg(b.total)}</div>
    </div>`;
  });
  html1 += `</div>`;
  document.getElementById('nutr-needs').innerHTML = html1;

  // ─── Block 2: Soil pool maintenance (Mehlich-3, Berger Labs avril 2026) ───
  // Pool-maintenance render (domain/soil-maintenance.md control law). Governs the
  // seven pool-forming nutrients; the mobile/Fe four render in the parked
  // block below. PM, bankMap, ppmByElement are computed above (they also
  // anchor the downstream cascade).
  const fmtPpm = (v) => (v == null ? '—' : (v < 10 ? v.toFixed(1) : Math.round(v).toLocaleString('fr-CA')));
  const fmtBand = (band) => (band ? `${fmtPpm(band[0])}–${fmtPpm(band[1])}` : '—');
  const fmtRunway = (weeks) => {
    if (weeks == null) return '—';
    if (weeks === 0) return 'Reached';
    if (weeks >= 52) return (weeks / 52).toFixed(1) + ' yr';
    return Math.round(weeks) + ' wk';
  };
  const gateLabel = { hold: 'reserve', floor: 'K floor', build: 'build' };
  // Clickable K-floor marker — opens a modal explaining the intensity floor.
  registerPourquoi('soil.k-floor-info', {
    title: '⚓ K intensity floor',
    cert: 3,
    equation: 'min tank K = 20% × weekly removal',
    plugged: 'The K row is held at a minimum dose even when the pool is over-band. 20% of maintenance keeps the soil-solution concentration high enough to feed the diffusion shell at the root surface (domain/soil-maintenance.md § Intensity floor).',
  });

  const poolHeader = `<div style="display:grid; grid-template-columns:0.4fr 0.8fr 0.9fr 0.8fr 0.9fr; gap:4px 10px;">
    ${['El.', 'Current (ppm)', 'Optimal (ppm)', 'To mid-band', 'Min dose (mg/m²/week)'].map(h =>
      `<div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">${h}</div>`).join('')}
  </div>`;
  let html2 = `<div style="font-size:12px;">${poolHeader}`;
  PM.POOL_FORMING_ELEMENTS.forEach(element => {
    const dem = demand[element] || 0;
    const currentPpm = ppmByElement[element];
    const band = PM.bandPpm(element, ppmByElement);
    const weeks = band ? PM.weeksToMidBand(currentPpm, dem, (band[0] + band[1]) / 2) : null;
    const d = PM.maintenanceDose(element, currentPpm, dem, band);
    const eq = element === 'K'
      ? `dose = max( intensity floor 20% × uptake , uptake × 1.25 if pool@100d < mid-band )`
      : `dose = uptake × 1.25 if pool@100d < mid-band, else 0 ; pool@100d = M3 − uptake/day × 100`;
    registerPourquoi(`soil.${element}`, {
      title: `${element} — pool maintenance (Mehlich-3)`,
      cert: d.gate === 'build' ? 1 : 3,
      equation: eq,
      plugged: `Current M3 <strong>${fmtPpm(currentPpm)} ppm</strong> · band <strong>${fmtBand(band)} ppm</strong> · pool@100d <strong>${fmtPpm(d.pool100d)} ppm</strong> · depletion <strong>${fmtRunway(weeks)}</strong> → min dose <strong>${formatMg(d.dose)} mg/m²/week</strong> (${gateLabel[d.gate]})`,
    });
    html2 += `<div class="pq-row" onclick="showPourquoi('soil.${element}')" style="display:grid; grid-template-columns:0.4fr 0.8fr 0.9fr 0.8fr 0.9fr; gap:4px 10px; padding:2px 4px; border-radius:3px;">
      <div style="font-weight:600;">${element}</div>
      <div style="font-family:'DM Mono',monospace; color:var(--text-muted);">${fmtPpm(currentPpm)}</div>
      <div style="font-family:'DM Mono',monospace; color:var(--text-muted);">${fmtBand(band)}</div>
      <div style="font-family:'DM Mono',monospace; color:var(--text-muted);">${fmtRunway(weeks)}</div>
      <div style="font-family:'DM Mono',monospace; font-weight:600;">${formatMg(d.dose)}${d.gate === 'floor' ? ` <span onclick="event.stopPropagation(); showPourquoi('soil.k-floor-info')" title="K floor" style="cursor:pointer;">⚓</span>` : ''}</div>
    </div>`;
  });
  html2 += `</div>`;
  document.getElementById('nutr-soil').innerHTML = html2;

  // Parked block: mobile (N, B, Mo) + ungoverned Fe — no M3 band, excluded
  // from the pool law. Shows weekly removal only (the amount leaving the
  // system); the actual dose rule is per-element and TBD (N front-load net of
  // mineralization, Mo trace floor, Fe broadcast+tissue, B tank÷efficiency).
  // domain/soil-maintenance.md § Nutrient classification.
  const parkedElements = ['N', 'B', 'Mo', 'Fe'];
  const parkedHeader = `<div style="display:grid; grid-template-columns:0.4fr 0.9fr; gap:4px 10px;">
    ${['El.', 'Weekly removal (mg/m²/week)'].map(h =>
      `<div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">${h}</div>`).join('')}
  </div>`;
  let html2b = `<div style="font-size:12px;">${parkedHeader}`;
  parkedElements.forEach(element => {
    // Fe is pinned to 0 — the soil bank (~310 ppm) over-supplies it, so no
    // weekly replacement is warranted; tissue is the backstop.
    // Mo is pinned to 0 — anionic molybdate stays plant-available at pH ≥ 6,
    // so the soil covers offtake with no weekly replacement.
    const removalCell = element === 'Fe'
      ? `0 <span style="font-family:inherit; color:var(--text-muted); font-weight:400;">— Probably over-supplied. Challenge if pale heads</span>`
      : element === 'Mo'
        ? `0 <span style="font-family:inherit; color:var(--text-muted); font-weight:400;">— Amply available at pH ≥ 6</span>`
        : formatMg(demand[element] || 0);
    html2b += `<div style="display:grid; grid-template-columns:0.4fr 0.9fr; gap:4px 10px; padding:2px 4px;">
      <div style="font-weight:600;">${element}</div>
      <div style="font-family:'DM Mono',monospace; color:var(--text-muted);">${removalCell}</div>
    </div>`;
  });
  html2b += `</div>`;
  const parkedContainer = document.getElementById('nutr-soil-mobile');
  if (parkedContainer) parkedContainer.innerHTML = html2b;

  // ─── Block 3: Compost résiduel (Savaria ORGANIMIX, fall 2025) ───
  // Reads window.CompostContribution.releasePerWeek (g/m²/wk per element) —
  // single source of truth (bilan-reads-source-of-truth-recipes, public-api-namespace). Annual mineralization ×
  // seasonal Q10 boost; declines over 18-24 months as the compost ages out.
  // First active replenishment channel after the soil-bank tap (Block 2):
  // soil → compost → sidedress → fertigation.
  const TOMATO_AREA = TOMATO_NUMBER_BEDS * TOMATO_BED_AREA;
  let html3c = renderRecipeTable(
    [{ productId: 'OrganimixSavaria', doseLabel: '25,4 kg/m² (automne 2025)' }],
    PRODUCT_REGISTRY,
  );
  // Per-element compost-supply pourquoi entries — modal opens on row click.
  // Interpretation: stable domain context. Live values come from
  // window.CompostContribution.releasePerWeek (single source of truth).
  order.forEach(element => {
    const gPerWk = CC.releasePerWeek[element];
    if (gPerWk == null) {
      // Element not declared on Savaria label → no compost contribution tracked.
      registerPourquoi(`compost.${element}`, {
        title: `${element} — compost résiduel`,
        cert: 2,
        equation: `compost[${element}] = 0 (non listé dans window.CompostContribution.releasePerWeek)`,
        plugged: `Apport compost = 0 mg/m²/sem`,

        interpretation: `${element} n'est pas suivi dans la libération du compost (étiquette Savaria ne déclare que macros). Apport supposé négligeable à l'échelle hebdomadaire.`
      });
      return;
    }
    const mgPerWk = gPerWk * 1000;
    const totalGPerWk = gPerWk * TOMATO_AREA;

    const note = element === 'Ca'
      ? '⚠ Le Ca du compost a contribué à la sursaturation calcique du sol. Pas un manque à combler — un excès à laisser décliner par lessivage.'
      : (element === 'Mg'
        ? 'Mg % NON déclaré sur l\'étiquette Savaria (assomption conservatrice ~0,3 %). Cert 1-2 — vérifier auprès du fournisseur si le poste devient critique.'
        : (element === 'P'
          ? 'P du compost : libération organique lente (minéralisation année 1). Disponibilité racinaire normale au pH actuel.'
          : 'Minéralisation année 1 × facteur saisonnier (Q10 ≈ 2 sur l\'activité microbienne pendant la fenêtre T3-T5 chaude).'));
    registerPourquoi(`compost.${element}`, {
      title: `${element} — compost résiduel (Savaria ORGANIMIX)`,
      cert: element === 'Mg' ? 1 : (element === 'Ca' ? 3 : 2),
      equation: `compost[${element}] = window.CompostContribution.releasePerWeek[${element}] × 1000`,
      plugged: `${gPerWk.toFixed(3)} g/m²/sem × 1000 = <strong>${mgPerWk.toFixed(0)} mg/m²/sem</strong> &nbsp;·&nbsp; total tomate (${TOMATO_AREA.toFixed(0)} m²) = ${totalGPerWk.toFixed(1)} g/sem`,
      interpretation: note
    });
  });
  // contribution-channel-details-payload / contribution-block-gap-grid / apport-ici-clickable-cert-and-cap-modals (4-field schema 2026-05-11) — compost block.
  const compostDetails = {};
  ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    const cert = element === 'Mg' ? 1 : (element === 'Ca' ? 3 : 2);
    let cap;
    if (element === 'Ca') {
      cap = {
        kind: 'other',
        constraint: 'Sol Ca-sursaturé',
        limit: 'surplus, pas un manque',
        lever: 'laisser décliner (lessivage)',
        uncappedMg: 0,
      };
    } else {
      cap = {
        kind: 'other',
        constraint: 'Minéralisation lente',
        limit: 'libération annuelle × Q10',
        lever: '↑ sidedress ou fertigation',
        uncappedMg: 0,
      };
    }
    compostDetails[element] = { cert, cap };
  });
  html3c += renderGapGrid(cascadeEntry, compostMg, gapAfterCompost, 'compost', compostDetails, 'compost');
  document.getElementById('nutr-compost').innerHTML = html3c;

  // ─── Block 4: Engrais sol granulaire (Actisol + farine de plumes) ───
  // Reads STORED_RECIPE.tomato.sidedress[stage] source-of-truth (bilan-reads-source-of-truth-recipes).
  // Per-element supply computed in calculateNutritionSupply (supply.sidedress) using
  // PRODUCT_PCT analysis × SIDEDRESS_MINIMUM_EFFICIENCY mineralization × P
  // mineralization factor. Second replenishment channel in the mass-balance gap chain.
  let html3sd = renderRecipeTable(
    [
      { productId: 'FarinePlumes', doseLabel: `${fmtGrams(r.sd_farine_g)} / bed / week` },
    ],
    PRODUCT_REGISTRY,
  );
  // Feather meal is 13-0-0 → the side-dress channel delivers N only (Actisol
  // retired 2026-07-18, all stages). N is the sole active element.
  registerPourquoi('sidedress.N', {
    title: `N — side-dress (stage ${nutrStage})`,
    cert: 3,
    equation: 'sidedress[N] = Farine_g × Farine_N × eff_N × 1000 / bed_area',
    plugged: `<strong>${(supply.sidedress.N || 0).toFixed(1)} mg/m²/week</strong> (feather meal ${r.sd_farine_g} g per bed over ${SIDEDRESS_AREA_PER_PLANCHE} m²; 13% N × 70% mineralization efficiency)`,
    interpretation: 'Effective N at established-stage regime: ~4-8 weeks of weekly applications overlap into steady-state mineralization. Feather meal only (Actisol removed).'
  });
  // Every other element: no side-dress contribution (feather meal is 13-0-0).
  ['P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    registerPourquoi(`sidedress.${element}`, {
      title: `${element} — no side-dress supply`,
      cert: 3,
      equation: `sidedress[${element}] = 0`,
      plugged: `Side-dress supply = 0 mg/m²/week`,
      interpretation: `Feather meal (13-0-0) delivers N only. ${element} must come from another channel (compost, fertigation).`
    });
  });
  // contribution-channel-details-payload / contribution-block-gap-grid / apport-ici-clickable-cert-and-cap-modals (4-field schema) — sidedress block.
  const sdDetails = {};
  ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    const cap = element === 'N'
      ? {
          kind: 'other',
          constraint: 'Established-stage regime',
          limit: 'dose × weekly mineralization',
          lever: '↑ feather meal',
          uncappedMg: 0,
        }
      : {
          kind: 'other',
          constraint: 'Not in feather meal',
          limit: 'feather meal = N only',
          lever: 'fertigation',
          uncappedMg: 0,
        };
    sdDetails[element] = { cert: 3, cap };
  });
  html3sd += renderGapGrid(gapAfterCompost, supply.sidedress, gapAfterSidedress, 'sidedress', sdDetails, 'sidedress');
  document.getElementById('nutr-sidedress').innerHTML = html3sd;

  // ─── Block 5: Fertigation (mass-balance — replaces what offtake removes
  //   after soil + compost + sidedress contributions). ───
  // supply.fert.* values are the barrel-loaded mass per m²/sem — full
  // delivery, what the team weighs out. Mixing factor retired 2026-05-10.
  // Fertigation doses come from STORED_RECIPE.tomato.fertigation[stage]
  // (hand-stored current values, Haifa-heritage at kSulfate / mgSulfate;
  // PA Taillon recommendation anchors the FP target, not STORED;
  // audit-trail captured in RECIPE_HISTORY). The Block 8 drift gauge
  // compares stored vs computeStageRecipe (FP target, mass-balance from
  // RECIPE_INPUTS).
  // Recipe table lists every fertigated product carrying a non-zero weekly
  // dose (mode-correct grams from the contribution _raw). Cation micros +
  // Solubore + molybdate joined K/Mg at the drip 2026-07-11 (sprays retired).
  // K/Mg drop out when cut to 0 (stored surplus-correction).
  const fertRows = [
    { productId: 'K2SO4',    grams: r.k_g_total  },
    { productId: 'MgSO4',    grams: r.mg_g_total },
    { productId: 'MnSO4',    grams: r.mn_g_total },
    { productId: 'ZnSO4',    grams: r.zn_g_total },
    { productId: 'Solubore', grams: r.sb_fert_g  },
    { productId: 'NaMoO4',   grams: r.mo_g_total },
  ]
    .filter(row => (row.grams || 0) > 0)
    .map(row => ({ productId: row.productId, doseLabel: `${fmtGrams(row.grams)} / sem` }));
  let html3 = renderRecipeTable(fertRows, PRODUCT_REGISTRY);
  // Per-element fertigation pourquoi entries — modal opens on row click.
  // K and Mg: full equation (barrel × analysis / area).
  // Other elements: no contribution from current fertigation (stated in modal).
  const k_g = r.k_g_total;
  const mg_g = r.mg_g_total;
  const isFpMode = nutrRecipeMode === 'fp';
  registerPourquoi('fert.K', {
    title: 'K — apport fertigation (K₂SO₄)',
    cert: 4,
    equation: `fert[K] = k_g_total × K2SO4_K_analysis / area × 1000`,
    plugged: `${k_g.toFixed(0)} g × ${PRODUCT_PCT.K2SO4_K} × 1000 / ${r.area.toFixed(0)} m² = <strong>${supply.fert.K.toFixed(0)} mg K/m²/sem</strong>`,
    interpretation: isFpMode
      ? `Recette FP_RECIPE_T5.fertigation['K2SO4'] = ${k_g.toFixed(0)} g (mass-balance T5). Masse barrel complète au m²/sem. Cert 3.`
      : `Recette STORED_RECIPE.tomato.fertigation[${nutrStage}].kSulfate × multiplicateur K (${getMultK()}). Valeur stockée (recette pesée à la main — héritage Haifa ; la recommandation PA Taillon avril 2026 ancre la cible FP, pas STORED). Masse barrel complète au m²/sem.`
  });
  registerPourquoi('fert.Mg', {
    title: 'Mg — apport fertigation (MgSO₄·7H₂O)',
    cert: 4,
    equation: `fert[Mg] = mg_g_total × MgSO4_Mg_analysis / area × 1000`,
    plugged: `${mg_g.toFixed(0)} g × ${PRODUCT_PCT.MgSO4_Mg.toFixed(4)} × 1000 / ${r.area.toFixed(0)} m² = <strong>${supply.fert.Mg.toFixed(0)} mg Mg/m²/sem</strong>`,
    interpretation: isFpMode
      ? `Recette FP_RECIPE_T5.fertigation['MgSO4-7H2O'] = ${mg_g.toFixed(0)} g (mass-balance T5). Masse barrel complète au m²/sem.`
      : `Recette STORED_RECIPE.tomato.fertigation[${nutrStage}].mgSulfate × multiplicateur Mg (${getMultMg()}). Valeur stockée (recette pesée à la main — héritage Haifa ; la recommandation PA Taillon avril 2026 ancre la cible FP, pas STORED). Le compost résiduel + la fertigation bouclent la sortie hebdo.`
  });
  void isFpMode;
  // Mn / Zn / B / Mo joined the drip 2026-07-11 (sprays retired). Register a
  // real per-element entry when the product carries a non-zero dose (grams are
  // mode-correct: stored recipe or FP mass-balance target); a 0-dose stage
  // falls back to a "not fertigated this stage" entry so no gap-grid click
  // opens an empty modal.
  const registerFertMicro = (element, productId, productLabel, grams, analysis, why) => {
    if (grams > 0) {
      registerPourquoi(`fert.${element}`, {
        title: `${element} — apport fertigation (${productLabel})`,
        cert: element === 'B' ? 3 : 4,
        equation: `fert[${element}] = ${productId}_g × ${element}_analysis / area × 1000`,
        plugged: `${grams.toFixed(0)} g × ${analysis} × 1000 / ${r.area.toFixed(0)} m² = <strong>${(supply.fert[element] || 0).toFixed(2)} mg ${element}/m²/sem</strong>`,
        interpretation: why,
      });
    } else {
      registerPourquoi(`fert.${element}`, {
        title: `${element} — pas en fertigation ce stade`,
        cert: 3,
        equation: `fert[${element}] = 0`,
        plugged: `Apport fertigation = 0 mg/m²/sem`,
        interpretation: `${productLabel} = 0 g ce stade/mode.`,
      });
    }
  };
  registerFertMicro('Mn', 'MnSO4', 'MnSO₄', r.mn_g_total, PRODUCT_PCT.MnSO4_Mn,
    `Sulfate de manganèse rendu au fertigation 2026-07-11 (spray retiré). Verrou sulfate-métal levé à pH sol 6,5 (efficacité canal 0,10→0,75) ; dose = demande pleine à efficacité 0,75, sans rabais crédit-sol. Ecocert CAN/CGSB-32.310/311.`);
  registerFertMicro('Zn', 'ZnSO4', 'ZnSO₄', r.zn_g_total, PRODUCT_PCT.ZnSO4_Zn,
    `Sulfate de zinc rendu au fertigation 2026-07-11 (spray retiré). Même chimie que Mn : verrou sulfate-métal levé à pH 6,5, dose = demande pleine à efficacité canal 0,75. Ecocert CAN/CGSB-32.310/311.`);
  registerFertMicro('B', 'Solubore', 'Solubore 20-B', r.sb_fert_g, PRODUCT_PCT.Solubore_B,
    `Acide borique (Solubore 20-B) — non-ionique, 100 % d'efficacité au pH actuel (pas de Ksp). Seul micro qui traverse le baril sans pertes chimiques. Canal unique : le foliaire B = 0. Ecocert validé 2026-05-08.`);
  registerFertMicro('Mo', 'NaMoO4', 'molybdate de sodium', r.mo_g_total, PRODUCT_PCT.NaMoO4_Mo,
    `Molybdate de sodium (anionique) — plus disponible à pH élevé, absorption racinaire élevée ; plancher opérateur 0,5 g tous stades (large tolérance du Mo). Ecocert CAN/CGSB-32.310/311.`);
  // Off-channel elements: generic "not in fertigation" entry so a gap-grid
  // click still answers. Reasons are stable domain chemistry.
  const fertSkipEls = ['N','P','Ca','Fe','Cu'];
  fertSkipEls.forEach(element => {
    const reason = element === 'N'

      ? 'N retiré de la fertigation : risque de biofilm dans le baril (matière organique des poissons hydrolysés non utilisée en production) et la minéralisation organique (Actisol + farine de plumes) couvre la sortie. Apport via granulaire au sol + compost.'
      : (element === 'Ca' || element === 'Mg' || element === 'P')

        ? `${element} non ajouté en fertigation : ${element === 'Ca' ? 'sol Ca-saturé — surplus inutile' : (element === 'P' ? 'P porté par le compost + engrais sol granulaire, pas par la fertigation' : '')}.`

        : element === 'Fe'

          ? 'Fe non fertigé : le sol le couvre à pH 6,5 (banque 310 ppm, mass-flow ~86 %, tissu suff 80 ppm) et le FeSO₄ s\'oxyde dans la cuve maître 5 jours (Fe²⁺→Fe³⁺ → colmatage goutteurs). Fe routé passif. Fallback : FeSO₄ granulaire en sidedress si un tissu montre une carence (Mn/Zn eux restent fertigés — tank-stables). '

          : 'Cu non nourri : sol normal + tissu élevé, aucune carence à combler ; fenêtre suffisance→toxicité la plus étroite des micros + charge sol cert-tracked → ROI négatif.';
    registerPourquoi(`fert.${element}`, {
      title: `${element} — pas en fertigation`,
      cert: 3,
      equation: `fert[${element}] = 0 (élément absent de STORED_RECIPE.tomato.fertigation)`,
      plugged: `Apport fertigation = 0 mg/m²/sem`,
      interpretation: reason
    });
  });
  // contribution-channel-details-payload / contribution-block-gap-grid / apport-ici-clickable-cert-and-cap-modals (4-field schema) — fertigation block.
  const fertDetails = {};
  ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    const supplied = (supply.fert[element] || 0) > 0;
    let cap;
    if (supplied && (element === 'K' || element === 'Mg' || element === 'B')) {
      const prod = element === 'K' ? 'K₂SO₄' : element === 'Mg' ? 'MgSO₄·7H₂O' : 'Solubore';
      cap = {
        kind: 'damage',
        constraint: 'CE bidon + solubilité',
        limit: 'dose ' + prod + ' bornée',
        lever: '↑ dose dans la marge CE',
        uncappedMg: 0,
      };
    } else if (element === 'N') {
      cap = {
        kind: 'other',
        constraint: 'N retiré du baril',
        limit: 'biofilm matière organique',
        lever: '↑ farine plumes sidedress',
        uncappedMg: 0,
      };
    } else if (element === 'P') {
      cap = {
        kind: 'other',
        constraint: 'Canal sol/sidedress',
        limit: 'P porté par le granulaire',
        lever: '↑ Actisol sidedress',
        uncappedMg: 0,
      };
    } else if (element === 'Ca') {
      cap = {
        kind: 'precipitation',
        constraint: 'Sol Ca-sursaturé',
        limit: 'ajout = surplus inutile',
        lever: 'aucun (laisser décliner)',
        uncappedMg: 0,
      };
    } else if (supplied && (element === 'Mn' || element === 'Zn')) {
      const prod = element === 'Mn' ? 'MnSO₄' : 'ZnSO₄';
      cap = {
        kind: 'damage',
        constraint: 'Efficacité canal 0,75 (sulfate-metal, pH sol 6,5) + CE bidon',
        limit: 'dose ' + prod + ' = demande pleine (aucun rabais crédit-sol)',
        lever: 'SME à 6,5 → créditer le sol, réduire la dose',
        uncappedMg: 0,
      };
    } else if (element === 'Fe') {
      cap = {
        kind: 'other',
        constraint: 'Sol le couvre (passif)',
        limit: 'FeSO₄ s\'oxyde en cuve → colmatage',
        lever: 'FeSO₄ granulaire sidedress si carence',
        uncappedMg: 0,
      };
    } else {
      cap = {
        kind: 'other',
        constraint: element === 'Cu' ? 'Non nourri (sol OK, tissu élevé)' : 'Trace / anion racinaire',
        limit: element === 'Cu' ? 'aucune carence' : 'dose minime',
        lever: element === 'Cu' ? 'aucun' : '—',
        uncappedMg: 0,
      };
    }
    fertDetails[element] = { cert: 4, cap };
  });
  html3 += renderGapGrid(gapAfterSidedress, supply.fert, gapAfterFert, 'fert', fertDetails, 'fert');
  document.getElementById('nutr-fert').innerHTML = html3;


  // ─── Phase 1 model — drift detection (stored-vs-computed-drift-block) ───
  // Renders stored-vs-computed recipe deltas. Admin-only block; doesn't
  // change any team-facing surface. Fenced as a visible "this is the model
  // talking, not the operations recipe".
  try {
    const phase1Element = document.getElementById('nutr-phase1');
    if (phase1Element) phase1Element.innerHTML = renderPhase1Comparison();
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
  // recipe-mode-toggle-fp-left-default-right: helper note text retired 2026-05-09 — toggle + active-state
  // styling carry the mode signal; further description belongs downstream.
  if (note) note.innerHTML = '';
}
