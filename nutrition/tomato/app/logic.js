function buildNutrimentTomato() {
  const PN = window.PlantNeedsTomato;
  const target  = parseFloat(document.getElementById('nutr-target').value)  || 1.5;
  const solarPerGram = parseFloat(document.getElementById('nutr-solar-per-gram').value) || 7;
  const phLocked = document.getElementById('nutr-phlocked').checked;

  // REQ-104: header inputs are exactly five scalars (target, solarPerGram,
  // stage, phLocked, recipeMode). The "current yield" input was retired
  // 2026-05-09 — page now answers "what's needed at target", not "what's
  // needed given current canopy". REQ-081 Ca/Mg biomass × transpFactor
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
  const supply  = calculateNutritionSupply(nutrStage, phLocked, transpFactor, target, nutrRecipeMode);
  const r = supply.raw;
  const order = ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'];

  // Pourquoi modal registry — wiped + repopulated each render. Each block
  // below registers `${blockKey}.${element}` entries; renderGapGrid + Block 1
  // grid hand `pqKeyPrefix` so rows get a click handler.
  window.currentPourquoi = {};

  // Product registry for the REQ-152 recipe tables. Composition values are
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
  // replenished by four channels in order: compost → sidedress → fertigation
  // → foliar. After each station, the per-element "remaining gap" feeds the
  // next as input. Block 2 here is a static reservoir read — bank size +
  // depletion runway.
  //
  // Compost release per element (g/m²/wk) → mg/m²/wk for the gap chain.
  const CC = window.CompostContribution;
  const compostMg = {};
  order.forEach(element => {
    const gPerWk = CC.releasePerWeek[element];
    compostMg[element] = (gPerWk != null ? gPerWk : 0) * 1000;
  });

  // Block 2 — soil bank residual. Per REQ-141: only Ca and P contribute to
  // the gap chain (Mehlich-3 vault is large enough to carry the plant's full
  // weekly need for years/decades); other elements pass through unchanged
  // and render as disabled rows. Per REQ-142: months-to-depletion is
  // surfaced for any element with bank data, regardless of participation.
  const SC = window.SoilContribution;
  const soilMg = {};
  const monthsToDepletion = {};
  order.forEach(element => {
    const dem = demand[element] || 0;
    soilMg[element] = SC.weeklyContribution('tomato', element, dem);
    monthsToDepletion[element] = SC.monthsToDepletion('tomato', element);
  });

  const gapAfterDemand    = {};   // = demand (nothing covered yet)
  const gapAfterSoil      = {};   // demand − soil (Ca/P only)
  const gapAfterCompost   = {};   // gapAfterSoil − compost
  const gapAfterSidedress = {};   // gapAfterCompost − sidedress
  const gapAfterFert      = {};   // gapAfterSidedress − fert
  const gapAfterFoliar    = {};   // gapAfterFert − foliar
  order.forEach(element => {
    gapAfterDemand[element]    = demand[element] || 0;
    gapAfterSoil[element]      = Math.max(0, gapAfterDemand[element]    - (soilMg[element]            || 0));
    gapAfterCompost[element]   = Math.max(0, gapAfterSoil[element]      - (compostMg[element]         || 0));
    gapAfterSidedress[element] = Math.max(0, gapAfterCompost[element]   - (supply.sidedress[element]  || 0));
    gapAfterFert[element]      = Math.max(0, gapAfterSidedress[element] - (supply.fert[element]       || 0));
    gapAfterFoliar[element]    = Math.max(0, gapAfterFert[element]      - (supply.foliar[element]     || 0));
  });

  // ─── Light-limited yield ceiling (header card) — REQ-105 ───
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
  // REQ-105: ⚠ message rendered ONLY when target > ceiling. Paired with the
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

  // REQ-107: products-in-play list retired 2026-05-09 — replaced by the
  // per-block product names that already appear inline in each Block 1-5
  // card body. Header stays minimal.

  // ─── Block 1: Weekly plant needs ───
  // Cert: TOMATO_FRUIT_EXPORT is cert 3 (Yara split applied to whole-plant);
  // BIOMASS_DEMAND is cert 3 (Haifa F-144 + Sonneveld extrapolation). Modal
  // shows the per-element split + interpretation.
  const fruitExport_g = (PN && PN.TOMATO_FRUIT_EXPORT) ? PN.TOMATO_FRUIT_EXPORT : {};
  const biomassDmd = (PN && PN.BIOMASS_DEMAND && PN.BIOMASS_DEMAND[nutrStage]) ? PN.BIOMASS_DEMAND[nutrStage] : {};
  const block1HeaderRow = `<div style="display:grid; grid-template-columns:0.5fr 0.9fr 0.9fr 0.9fr; gap:4px 10px;">
    <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Él.</div>
    <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Fruit</div>
    <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Biomasse</div>
    <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Total / m²/sem</div>
  </div>`;
  let html1 = `<div style="font-size:12px;">${block1HeaderRow}`;
  order.forEach(element => {
    const b = demandBreakdown[element];
    // REQ-109: modal exposes only cert + equation + plugged numbers.
    // Per-element interpretation prose is intentionally omitted — it lives
    // in nutrition/tomato/plant-needs/derivation.md (single source).
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
    html1 += `<div class="pq-row" onclick="showPourquoi('demand.${element}')" style="display:grid; grid-template-columns:0.5fr 0.9fr 0.9fr 0.9fr; gap:4px 10px; padding:2px 4px; border-radius:3px;">
      <div style="font-weight:600;">${element}</div>
      <div style="font-family:'DM Mono',monospace; color:var(--text-muted);">${b.fruit > 0 ? formatValue(b.fruit) : '—'}</div>
      <div style="font-family:'DM Mono',monospace; color:var(--text-muted);">${b.biomass > 0 ? '+ ' + formatValue(b.biomass) : '—'}</div>
      <div style="font-family:'DM Mono',monospace; font-weight:600;">${formatValue(b.total)}</div>
    </div>`;
  });
  html1 += `</div>`;
  document.getElementById('nutr-needs').innerHTML = html1;

  // ─── Block 2: Sol — banque résiduelle (Mehlich-3, Berger Labs avril 2026) ───
  // Subproject: nutrition/soil-contribution/. soilMg + monthsToDepletion
  // already computed above via window.SoilContribution; this section only
  // registers the per-element pourquoi entries and dispatches the render.
  let html2 = '';
  const bankMap = SC.BANK_MG_M2.tomato || {};
  order.forEach(element => {
    const bankMg = bankMap[element];
    const dem = demand[element] || 0;
    const months = monthsToDepletion[element];
    const contributing = !!SC.CONTRIBUTING[element];
    // REQ-145 — interpretation prose owned by spec (bytes in
    // nutrition/soil-contribution/spec.md). Each branch selects a render
    // key; renderSpec() resolves at runtime against window.SPEC_STRINGS.
    let interpretationKey;
    if (element === 'N') {
      interpretationKey = 'N-not-mehlich';
    } else if (contributing) {
      interpretationKey = element === 'Ca' ? 'Ca' : 'P';
    } else if (element === 'K') {
      interpretationKey = 'K-fert-routed';
    } else if (element === 'Mg') {
      interpretationKey = 'Mg-fert-routed';
    } else {
      interpretationKey = 'default-not-mehlich';
    }
    const interpretation = { requirementId: 'REQ-145', key: interpretationKey, interp: { element } };
    const eq = contributing
      ? `soil[${element}] = min(demand, bank) ; mois_épuisement = bank / (SME × transp × ${SC.WEEKS_PER_MONTH.toFixed(2)})`
      : `soil[${element}] = 0 (élément non-contributif — banque informationnelle seulement)`;
    const monthsString = months != null
      ? (months >= 12 ? (months / 12).toFixed(1) + ' ans (' + months.toFixed(0) + ' mois)' : months.toFixed(1) + ' mois')
      : '—';
    let plugged;
    if (contributing && bankMg > 0) {
      plugged = `Banque <strong>${formatValue(bankMg)}/m²</strong> · demande <strong>${formatValue(dem)}/m²/sem</strong> → apport hebdo <strong>${formatValue(soilMg[element] || 0)}/m²/sem</strong> · épuisement théorique <strong>${monthsString}</strong>`;
    } else if (bankMg > 0) {
      plugged = `Banque <strong>${formatValue(bankMg)}/m²</strong> · demande <strong>${formatValue(dem)}/m²/sem</strong> · épuisement théorique <strong>${monthsString}</strong> (rangée désactivée — pas d\'apport routé)`;
    } else {
      plugged = `Aucune banque mesurée (élément non couvert par le test Mehlich-3). Rangée désactivée.`;
    }
    registerPourquoi(`soil.${element}`, {
      title: `${element} — banque sol (Mehlich-3)`,
      cert: bankMg > 0 ? 3 : 2,
      equation: eq,
      plugged: plugged,
      interpretation: interpretation,
    });
  });
  html2 += `<div style="font-size:11.5px; color:var(--text-muted); margin-bottom:4px;">Sortie hebdo → manque restant après tirage de la banque sol :</div>`;
  html2 += SC.renderGrid(gapAfterDemand, soilMg, gapAfterSoil, monthsToDepletion);
  document.getElementById('nutr-soil').innerHTML = html2;

  // ─── Block 3: Compost résiduel (Savaria ORGANIMIX, fall 2025) ───
  // Reads window.CompostContribution.releasePerWeek (g/m²/wk per element) —
  // single source of truth (REQ-004, REQ-080). Annual mineralization ×
  // seasonal Q10 boost; declines over 18-24 months as the compost ages out.
  // First active replenishment channel after the soil-bank tap (Block 2):
  // soil → compost → sidedress → fertigation → foliar.
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
      ? '⚠ Le Ca du compost a contribué à la sursaturation calcique du sol (racine de la crise pH 7,4). Pas un manque à combler — un excès à laisser décliner par lessivage.'
      : (element === 'Mg'
        ? 'Mg % NON déclaré sur l\'étiquette Savaria (assomption conservatrice ~0,3 %). Cert 1-2 — vérifier auprès du fournisseur si le poste devient critique.'
        : (element === 'P'
          ? 'P verrouillé à pH ≥ 7 : Ca²⁺ précipite le phosphate fraîchement minéralisé en Ca-P avant absorption. Apport effectif très faible tant que le pH reste haut.'
          : 'Minéralisation année 1 × facteur saisonnier (Q10 ≈ 2 sur l\'activité microbienne pendant la fenêtre T3-T5 chaude).'));
    registerPourquoi(`compost.${element}`, {
      title: `${element} — compost résiduel (Savaria ORGANIMIX)`,
      cert: element === 'Mg' ? 1 : (element === 'Ca' ? 3 : 2),
      equation: `compost[${element}] = window.CompostContribution.releasePerWeek[${element}] × 1000`,
      plugged: `${gPerWk.toFixed(3)} g/m²/sem × 1000 = <strong>${mgPerWk.toFixed(0)} mg/m²/sem</strong> &nbsp;·&nbsp; total tomate (${TOMATO_AREA.toFixed(0)} m²) = ${totalGPerWk.toFixed(1)} g/sem`,
      interpretation: note
    });
  });
  // REQ-136..138 (4-field schema 2026-05-11) — compost block.
  const compostDetails = {};
  ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    const cert = element === 'Mg' ? 1 : (element === 'Ca' ? 3 : 2);
    let cap;
    if (element === 'P' && phLocked) {
      cap = {
        kind: 'precipitation',
        constraint: 'Précipitation Ca-P',
        limit: 'facteur 0,10 à pH ≥ 7',
        lever: 'soufre → baisser pH',
        uncappedMg: (compostMg.P || 0) * 10,
      };
    } else if (element === 'Ca') {
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
  // REQ-157 — compost channel efficiency is specialist-scope (model-layer);
  // pass {} for now so all cells render `—` until the specialist ships
  // window.CompostContribution.efficiency.
  html3c += renderGapGrid(gapAfterSoil, compostMg, gapAfterCompost, 'compost', compostDetails, 'compost', {});
  document.getElementById('nutr-compost').innerHTML = html3c;

  // ─── Block 4: Engrais sol granulaire (Actisol + farine de plumes) ───
  // Reads STORED_RECIPE.tomato.sidedress[stage] source-of-truth (REQ-004).
  // Per-element supply computed in calculateNutritionSupply (supply.sidedress) using
  // PRODUCT_PCT analysis × SIDEDRESS_MINIMUM_EFFICIENCY mineralization × pH-lockout
  // factor for P. Second replenishment channel in the mass-balance gap chain.
  let html3sd = renderRecipeTable(
    [
      { productId: 'Actisol',      doseLabel: `${fmtGrams(r.sd_actisol_g)} / planche / sem` },
      { productId: 'FarinePlumes', doseLabel: `${fmtGrams(r.sd_farine_g)} / planche / sem` },
    ],
    PRODUCT_REGISTRY,
  );
  // Per-element sidedress pourquoi entries.
  ['N','P','K'].forEach(element => {
    const v = supply.sidedress[element] || 0;
    let eq, note;
    if (element === 'N') {
      eq = 'sidedress[N] = (Actisol_g × Actisol_N × eff_N + Farine_g × Farine_N × eff_N) × 1000 / planche_area';

      note = 'Apport N effectif au régime stade établi : ~4-8 sem d\'applications hebdomadaires se chevauchent en minéralisation steady-state. La farine de plumes domine (75 % efficace, 13 % N) ; l\'Actisol contribue plus lentement (60 %, 5 %).';
    } else if (element === 'P') {
      eq = 'sidedress[P] = Actisol_g × Actisol_P × phLockoutFactor_P × 1000 / planche_area';

      note = phLocked
        ? 'P verrouillé à pH ≥ 7 : Ca²⁺ en solution précipite le phosphate fraîchement minéralisé en Ca-P avant absorption racinaire. Facteur 10 % appliqué (Cadre 5-15 %, midpoint). Programme soufre = seul levier durable (pH < 6,5 → P passe à 30-50 % efficace).'
        : 'pH ajusté : minéralisation P de l\'Actisol à 50 % d\'efficacité (l\'organique relâche plus lentement que le N).';
    } else { // K
      eq = 'sidedress[K] = Actisol_g × Actisol_K × eff_K × 1000 / planche_area';

      note = 'K majoritairement soluble dans les granules d\'Actisol → efficacité 85 % rapide. Apport modeste vs la fertigation, mais maintient la banque K.';
    }
    registerPourquoi(`sidedress.${element}`, {
      title: `${element} — engrais sol granulaire (stade ${nutrStage})`,
      cert: 3,
      equation: eq,
      plugged: `<strong>${v.toFixed(1)} mg/m²/sem</strong> (Actisol ${r.sd_actisol_g} g + farine ${r.sd_farine_g} g par planche, sur ${SIDEDRESS_AREA_PER_PLANCHE} m²)`,
      interpretation: note
    });
  });
  // Other elements: no sidedress contribution. Stable note.
  ['Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    registerPourquoi(`sidedress.${element}`, {
      title: `${element} — pas d'apport granulaire`,
      cert: 3,
      equation: `sidedress[${element}] = 0`,
      plugged: `Apport granulaire = 0 mg/m²/sem`,

      interpretation: `Les produits granulaires actifs (Actisol 5-3-2 + farine de plumes 13-0-0) ne livrent que N/P/K. ${element} doit venir d'un autre canal (compost, fertigation, foliaire).`
    });
  });
  // REQ-136..138 (4-field schema) — sidedress block.
  const sdDetails = {};
  ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    let cap;
    if (element === 'P' && phLocked) {
      cap = {
        kind: 'precipitation',
        constraint: 'Précipitation Ca-P',
        limit: 'facteur 0,10 à pH ≥ 7',
        lever: 'soufre → baisser pH',
        uncappedMg: (supply.sidedress.P || 0) / 0.10,
      };
    } else if (element === 'N' || element === 'P' || element === 'K') {
      cap = {
        kind: 'other',
        constraint: 'Régime stade établi',
        limit: 'dose × minéralisation hebdo',
        lever: '↑ farine plumes / Actisol',
        uncappedMg: 0,
      };
    } else {
      cap = {
        kind: 'other',
        constraint: 'Pas dans les granulaires',
        limit: 'Actisol+farine = N/P/K seul',
        lever: 'fertigation ou foliaire',
        uncappedMg: 0,
      };
    }
    sdDetails[element] = { cert: 3, cap };
  });
  html3sd += renderGapGrid(gapAfterCompost, supply.sidedress, gapAfterSidedress, 'sidedress', sdDetails, 'sidedress', supply.sidedress.efficiency || {});
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
  const fertRows = [
    { productId: 'K2SO4', doseLabel: `${fmtGrams(r.k_g_total)} / sem` },
    { productId: 'MgSO4', doseLabel: `${fmtGrams(r.mg_g_total)} / sem` },
  ];
  const sb_fert_g_row = (nutrRecipeMode === 'fp') ? (FP_RECIPE_T5.fertigation['Solubore'] || 0) : 0;
  if (sb_fert_g_row > 0) {
    fertRows.push({ productId: 'Solubore', doseLabel: `${fmtGrams(sb_fert_g_row)} / sem` });
  }
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
  // FP-mode Solubore in fertigation: register a real B entry; otherwise the
  // generic "not in fert" reason below applies.
  const sb_fert_g = isFpMode ? (FP_RECIPE_T5.fertigation['Solubore'] || 0) : 0;
  if (sb_fert_g > 0) {
    registerPourquoi('fert.B', {
      title: 'B — apport fertigation (Solubore 20-B)',
      cert: 3,
      equation: `fert[B] = Solubore_g × Solubore_B_analysis / area × 1000`,
      plugged: `${sb_fert_g} g × ${PRODUCT_PCT.Solubore_B} × 1000 / ${r.area.toFixed(0)} m² = <strong>${supply.fert.B.toFixed(2)} mg B/m²/sem</strong>`,
      interpretation: `Acide borique (Solubore 20-B) — non-ionique, 100 % d'efficacité au pH 7,4 (REQ-018 OK, pas de Ksp). Seul micro qui traverse le baril sans pertes chimiques. Ecocert validé 2026-05-08. Foliaire B = 0 (canal unique : la fertigation porte tout le B).`
    });
  }
  // Other elements: register a generic "not in fertigation" entry so a row
  // click still produces a useful answer instead of opening an empty modal.
  // Reasons below are stable — domain chemistry, not dependent on dose values.
  const fertSkipEls = sb_fert_g > 0
    ? ['N','P','Ca','Fe','Mn','Zn','Cu','Mo']
    : ['N','P','Ca','Fe','Mn','Zn','B','Cu','Mo'];
  fertSkipEls.forEach(element => {
    const reason = element === 'N'

      ? 'N retiré de la fertigation : risque de biofilm dans le baril (matière organique des poissons hydrolysés non utilisée en production) et la minéralisation organique (Actisol + farine de plumes) couvre la sortie. Apport via granulaire au sol + compost.'
      : (element === 'Ca' || element === 'Mg' || element === 'P')

        ? `${element} non ajouté en fertigation : ${element === 'Ca' ? 'sol Ca-saturé — surplus inutile' : (element === 'P' ? 'le P précipite avec Ca²⁺ à pH ≥ 7 avant d\'atteindre les racines' : '')}.`

        : `${element} retiré de la fertigation 2026-04-26 : à pH ≥ 7 les sulfates d'oligos précipitent (oxydation, hydroxydes, phosphates de Ca) avant absorption. Foliaire bypasse cette chimie. Réintroduction en fertigation seulement si pH &lt; 6,5.`;
    registerPourquoi(`fert.${element}`, {
      title: `${element} — pas en fertigation`,
      cert: 3,
      equation: `fert[${element}] = 0 (élément absent de STORED_RECIPE.tomato.fertigation)`,
      plugged: `Apport fertigation = 0 mg/m²/sem`,
      interpretation: reason
    });
  });
  // REQ-136..138 (4-field schema) — fertigation block.
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
        kind: 'precipitation',
        constraint: 'Précipitation Ca-P',
        limit: 'inutile à pH ≥ 7',
        lever: 'soufre → baisser pH',
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
    } else {
      cap = {
        kind: 'other',
        constraint: 'Sulfates oligos précipitent',
        limit: 'décoratif à pH ≥ 7',
        lever: 'foliaire bypass',
        uncappedMg: 0,
      };
    }
    fertDetails[element] = { cert: 4, cap };
  });
  html3 += renderGapGrid(gapAfterSidedress, supply.fert, gapAfterFert, 'fert', fertDetails, 'fert', supply.fert.efficiency || {});
  document.getElementById('nutr-fert').innerHTML = html3;

  // ─── Block 6: Foliar (micros — bypass root lockout at pH 7,4) ───
  // Mass-balance numbering 2026-05-11: 1 besoin · 2 sol (banque) ·
  // 3 compost · 4 sidedress · 5 fertigation · 6 foliaire · 7 leviers ·
  // 8 stockée vs FP.
  const foliarDoseUnit = `g / ${STORED_RECIPE.tomato.foliaire.masterVol} L`;
  const foliarRows = [
    { productId: 'MnSO4',    doseLabel: `${r.mnSO4_g} ${foliarDoseUnit}` },
    { productId: 'ZnSO4',    doseLabel: `${r.znSO4_g} ${foliarDoseUnit}` },
    { productId: 'Solubore', doseLabel: `${r.sb_g} ${foliarDoseUnit}` },
    { productId: 'CuSO4',    doseLabel: `${r.cuSO4_g} ${foliarDoseUnit}` },
    { productId: 'NaMoO4',   doseLabel: `${r.moNa_g} ${foliarDoseUnit}` },
    { productId: 'FeSO4',    doseLabel: `${r.feSO4_g} ${foliarDoseUnit}` },
  ];
  let html4 = renderRecipeTable(foliarRows, PRODUCT_REGISTRY);
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
  Object.entries(foliarMap).forEach(([element, m]) => {
    registerPourquoi(`foliar.${element}`, {
      title: `${element} — apport foliaire (${m.product})`,
      cert: element === 'Cu' ? 3 : 4,
      equation: `foliar[${element}] = ${m.product}_g × analysis / area × 1000 × coverage`,
      plugged: `${m.g} g × ${m.analysis} × 1000 / ${r.area.toFixed(0)} m² × ${cov} = <strong>${(supply.foliar[element]||0).toFixed(2)} mg ${element}/m²/sem</strong>`,

      // window is invariant chemistry. Fe-margin claim stripped 2026-05-08
      // (depended on a specific dose vs T5 demand, both can change).
      interpretation: `Coverage ${Math.round(cov*100)}% sans yucca (cert 4). Foliaire bypasse le verrouillage racinaire à pH 7,4 — la cuticule n'est pas affectée par la saturation Ca du sol.${element === 'Cu' ? ' ⚠ Cu : fenêtre de sécurité étroite (toxicité observée sans surfactant — pooling concentre localement).' : ''}`
    });
  });
  registerPourquoi('foliar.Ca', {
    title: 'Ca — apport foliaire (retiré)',
    cert: 4,
    equation: 'foliar[Ca] = 0 (Spray B retiré 2026-05-06)',
    plugged: 'Apport foliaire Ca = 0 mg/m²/sem',

    interpretation: `Spray B retiré 2026-05-06 — Ecocert input listing non vérifié (REQ-002). Prévention BER désormais via ventilation + humidité (le Ca xylémique suit le flux de transpiration). Si BER persiste, application externe événementielle hors app.`
  });
  // Reasons below are stable — domain chemistry (foliar inefficiency for N/P).
  ['N','P','K','Mg'].forEach(element => {
    registerPourquoi(`foliar.${element}`, {
      title: `${element} — pas en foliaire`,
      cert: 4,
      equation: `foliar[${element}] = 0`,
      plugged: `Pas de produit foliaire pour ${element}.`,
      interpretation: element === 'N'

        ? 'N foliaire = inefficace en mass-flow (urée brûle, NO₃ peu absorbé par cuticule). Apport via fertigation/sol uniquement.'
        : element === 'P'

          ? 'P foliaire peu efficace ; précipitation Ca-P sur la feuille (pH du film d\'eau monte rapidement).'
          : `${element} couvert par fertigation + sol ; foliaire pas nécessaire.`
    });
  });
  // REQ-136..138 (4-field schema) — foliar block.
  const foliarDetails = {};
  ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    const supplied = (supply.foliar[element] || 0) > 0;
    let cap;
    if (supplied) {
      cap = {
        kind: 'damage',
        constraint: 'Brûlure feuillage',
        limit: element === 'Cu' ? 'max 2 g/15 L (Cu étroit)' : 'dose bornée par sel tank',
        lever: '↑ dose dans la marge brûlure',
        uncappedMg: 0,
      };
    } else if (element === 'N') {
      cap = {
        kind: 'precipitation',
        constraint: 'Cuticule N inefficace',
        limit: 'urée brûle, NO₃ peu absorbé',
        lever: 'sidedress + compost',
        uncappedMg: 0,
      };
    } else if (element === 'P') {
      cap = {
        kind: 'precipitation',
        constraint: 'Précipitation feuille',
        limit: 'Ca-P sur film d\'eau',
        lever: 'aucun canal foliaire viable',
        uncappedMg: 0,
      };
    } else {
      cap = {
        kind: 'other',
        constraint: 'Couvert ailleurs',
        limit: 'fertigation + sol suffisent',
        lever: 'aucun (pas nécessaire)',
        uncappedMg: 0,
      };
    }
    foliarDetails[element] = { cert: 3, cap };
  });
  html4 += renderGapGrid(gapAfterFert, supply.foliar, gapAfterFoliar, 'foliar', foliarDetails, 'foliar', supply.foliar.efficiency || {});
  document.getElementById('nutr-foliar').innerHTML = html4;

  // ─── Block 7: Leviers (final residual + auto-derived per-element actions) ───
  // Mass-balance numbering (2026-05-11): the supply chain is sol (banque) →
  // compost → sidedress → fert → foliar — one passive bank tap + four active
  // replenishment channels. The residual after all five stations is the gap
  // that needs a lever.
  const missingElems = order.filter(element => gapAfterFoliar[element] > 0);
  // Lever advice is auto-derived from the live data state per element instead
  // of being hand-written. This eliminates stale advice when recipes / channel
  // state change. Inputs read by deriveLever:
  //   - gapAfterFoliar[element]                residual gap after the 4 channels
  //   - phLocked                          pH state (drives P sulfur lever)
  //   - supply.{fert,foliar,sidedress}[element] which channel owns it
  // Returns an HTML string (lever advice) or '' (no entry).
  // Foliar-channel elements (Mn/Zn/Cu/Fe/B/Mo) share the same no-yucca
  // template — coverage is the dominant constraint without surfactant.
  const FOLIAR_ELEMS = ['Mn', 'Zn', 'B', 'Cu', 'Mo', 'Fe'];
  function deriveLever(element) {
    const gap = gapAfterFoliar[element] || 0;
    if (gap <= 0) return '';
    // P + phLocked → sulfur is the only durable lever (stable domain context).
    if (element === 'P' && phLocked) {
      return '<strong>Verrouillage chimique du sol</strong> au pH actuel — programme soufre = seul levier durable. Foliar P peu efficace (précipitation Ca-P sur la feuille) ; fertigation P précipite avant absorption.';
    }
    // N → mass-balance check: compost + sidedress should cover the bulk; if
    // gap remains, the obvious lever is to step up the granular dose at the
    // current stage (STORED_RECIPE.tomato.sidedress[stage]) or wait for compost
    // mineralization.
    if (element === 'N') {
      return 'Augmenter le dosage granulaire (STORED_RECIPE.tomato.sidedress[stade] : Actisol + farine de plumes) ou attendre la minéralisation du compost. La fertigation N reste retirée (risque biofilm). Si la carence visible persiste, valider par foliaire pétiole NO₃-N (bande adéquate 800-1 200 ppm).';
    }
    // Foliar-channel elements + no-yucca state → coverage is the dominant
    // constraint. Single template applies to Mn/Zn/Cu/Fe/B/Mo regardless of
    // sulfate in recipe. No-yucca state is fixed today
    // (STORED_RECIPE.tomato.foliaire.A has no yucca slot).
    if (FOLIAR_ELEMS.indexOf(element) >= 0 && (supply.foliar[element] || 0) > 0) {
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
    const severity = (element) => {
      const ratio = gapAfterFoliar[element] / Math.max(demand[element], 1);
      return ratio > 0.5 ? '🔴' : (ratio > 0.2 ? '🟡' : '🟢');
    };
    html5 += `<div style="font-size:12.5px; color:var(--text-muted); margin-bottom:10px; line-height:1.5;">Après les 4 canaux de réapprovisionnement (compost, granulaire, fertigation, foliaire), voici ce qui n'est pas couvert. Chaque ligne = le levier qui ferme le gap (dérivé de l'état actuel des canaux + pH).</div>`;
    html5 += `<ol style="padding-left:20px; font-size:13px; line-height:1.5; margin:0;">`;
    sorted.forEach(element => {
      const gap = gapAfterFoliar[element];
      const dem = demand[element];
      const pct = (gap / dem * 100).toFixed(0);
      const lever = deriveLever(element);
      html5 += `<li style="margin-bottom:10px;">${severity(element)} <strong>${element}</strong> — il manque ${formatValue(gap)}/m²/sem (${pct}% de la demande). <br><span style="color:var(--text-muted); font-size:12px;">${lever}</span></li>`;
    });
    html5 += `</ol>`;
  }
  // Always-on structural reminder when pH is locked.

  // (P precipitates Ca-P ; Fe/Mn/Zn oxidize to insoluble forms) is invariant.
  if (phLocked) {
    html5 += `<div style="background:var(--accent-tomato-light); border:1.5px solid var(--accent-tomato-border); border-radius:6px; padding:10px 12px; margin-top:12px; font-size:12.5px; line-height:1.5;"><strong style="color:var(--accent-tomato);">Action structurelle :</strong> tant que le pH du sol reste ≥ 7, P / Mn / Zn / Fe restent foliaire-only. Programme soufre = seul vrai levier durable.</div>`;
  }
  document.getElementById('nutr-missing').innerHTML = html5;

  // ─── Phase 1 model — drift detection (REQ-153) ───
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
  // REQ-107: helper note text retired 2026-05-09 — toggle + active-state
  // styling carry the mode signal; further description belongs downstream.
  if (note) note.innerHTML = '';
}
