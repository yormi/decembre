// ═══════════════ SEMIS LAITUE — NURSERY BILAN ═══════════════
// Renders the Semis subpage. Per-tray as primary unit (per-plant + per-cohort
// shown alongside). Gap chain: demand → substrate (OM2 + feather meal) →
// fertigation (Ocean + Acadie + kelp) → leviers.
//
// Inputs read from window namespaces (resolved at the integrator boundary):
//   window.PlantNeedsNursery            — demand model (calculateNurseryDemand)
//   window.SubstrateContributionNursery — OM2 + feather meal release
//   window.FertigationNursery           — Ocean + Acadie + kelp recipe + EC/pH
function buildNutrimentNursery() {
  const targetG     = parseFloat(document.getElementById('nutr-n-target').value)  || 50;
  const cycleDays   = parseFloat(document.getElementById('nutr-n-days').value)    || 35;
  const cellsPerTray= parseFloat(document.getElementById('nutr-n-cells').value)   || 50;
  const traysCohort = parseFloat(document.getElementById('nutr-n-trays').value)   || 50;
  const appsPerWeek = parseFloat(document.getElementById('nutr-n-applications')?.value) || 1;

  const demand = calculateNurseryDemand(targetG, cycleDays, cellsPerTray);
  const order = ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'];

  const dwPerPlant_g = targetG * LETTUCE_NURSERY_DM_FRACTION;
  const dwPerPlantPerWk_g = dwPerPlant_g * (7 / Math.max(1, cycleDays));
  const benchM2 = traysCohort * NURSERY_TARGETS.trayAreaM2;
  const totalPlants = cellsPerTray * traysCohort;

  // Cell-volume cap warning: published research (Hochmuth, butterhead) caps
  // 50-cell trays at ~50-110g; 32-cell at ~150-200g. If target > cap for the
  // current cell count, surface in context.
  const cellVolumeCap = cellsPerTray >= 60 ? 35
                      : cellsPerTray >= 40 ? 90
                      : cellsPerTray >= 24 ? 175
                      : 250;
  const overCap = targetG > cellVolumeCap;
  const capWarn = overCap
    ? ` <span style="color:#8a3e1e;">⚠ ${cellsPerTray}-cellules plafonne ~${cellVolumeCap}g/plant — cible ${targetG}g au-dessus du plafond physique de la cellule.</span>`
    : '';

  // Context block
  const contextElement = document.getElementById('nutr-n-context');
  if (contextElement) {
    contextElement.innerHTML =
      `Cible <strong style="color:var(--text);">${targetG.toFixed(0)} g/plant</strong> en `
      + `<strong style="color:var(--text);">${cycleDays.toFixed(0)} j</strong> · `
      + `gain DW/plant : <strong style="color:var(--text);">${dwPerPlant_g.toFixed(2)} g</strong> sur le cycle `
      + `(${dwPerPlantPerWk_g.toFixed(2)} g/sem) · `
      + `cohorte : <strong style="color:var(--text);">${traysCohort.toFixed(0)} plateaux × ${cellsPerTray.toFixed(0)} = ${totalPlants.toLocaleString('fr-CA')} plants</strong> sur ~${benchM2.toFixed(1)} m² de banc.`
      + capWarn;
  }

  const fmt = v => (v == null || !isFinite(v)) ? '—'
    : (v >= 1000 ? Math.round(v).toLocaleString('fr-CA')
    : v >= 10   ? v.toFixed(0)
    : v >= 1    ? v.toFixed(1)
    :              v.toFixed(2));

  // Block 1: per-element demand — 3-col table (Él / Par plant / Cert).
  // Per-tray and per-cohort numbers feed Blocks 2/3 inside the gap-chain math;
  // Block 1's job is the per-plant sanity check + cert visibility.
  let html = `<div style="font-size:11.5px; color:var(--text-muted); margin-bottom:6px;">Demande par plant et par semaine. Pour le détail par plateau ou par cohorte, voir Blocs 2-3.</div>`;
  html += `<div style="display:grid; grid-template-columns:0.5fr 1fr 0.6fr; gap:6px 12px; font-size:12px;">
    <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Él.</div>
    <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Par plant</div>
    <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Cert</div>`;
  const certByEl = { N:3, P:3, K:3, Ca:3, Mg:3, Fe:2, Mn:2, Zn:2, B:2, Cu:2, Mo:2 };
  order.forEach(element => {
    const d = demand[element] || { perPlant_mg: 0 };
    html += `
      <div style="font-weight:600;">${element}</div>
      <div style="font-family:'DM Mono',monospace;">${fmt(d.perPlant_mg)} <span style="color:var(--text-muted); font-size:10px;">mg/sem</span></div>
      <div style="color:var(--text-muted); font-size:11px;">cert ${certByEl[element]}</div>`;
  });
  html += `</div>`;
  document.getElementById('nutr-n-needs').innerHTML = html;

  // ─── Gap chain: demand → substrate → fertigation → leviers ───
  // Build flat demand[element] = perTray_mg for the renderGapGrid pipeline.
  const demandFlat = {};
  ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    demandFlat[element] = (demand[element] || {}).perTray_mg || 0;
  });

  // ─── Block 2: Substrate — recipe header + gap-grid table ───
  // Reads new {perTray_mg, details} shape (contribution-channel-details-payload).
  // Registers pourquoi entries per (block, element) cell + per cap for
  // apport-ici-clickable-cert-and-cap-modals click handlers.
  const SCN = window.SubstrateContributionNursery;
  const fmGperTray = SCN.NURSERY_FEATHER_MEAL_DEFAULT_G_PER_TRAY;
  const subResult = SCN.cycleAverageReleasePerTray(fmGperTray);
  const subAvg = subResult.perTray_mg || {};
  const subDetails = subResult.details || {};
  const subContrib = {};
  ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    subContrib[element] = subAvg[element] || 0;
  });
  const gapAfterSubstrate = {};
  ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    gapAfterSubstrate[element] = Math.max(0, demandFlat[element] - (subContrib[element] || 0));
  });
  // apport-ici-clickable-cert-and-cap-modals — register pourquoi entries (cell-cert + per-cap) for each element.
  ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    const v = subContrib[element] || 0;
    const det = subDetails[element] || { cert: null, cap: null };
    registerPourquoi('nursery-substrate.cell.' + element, {
      title: element + ' — Réserve substrat (semis)',
      cert: det.cert,
      equation: 'apport substrat moyen = OM2 starter × release_curve + farine × N_label × minéralisation × release_curve',
      plugged: '<strong>' + fmt(v) + ' mg/plateau/sem</strong> (moyenne sur ' + SCN.OM2_RELEASE_CURVE_BY_WEEK.length + ' sem du cycle)',
      interpretation: element === 'N'
        ? 'OM2 starter charge (cert 2 placeholder, fiche Berger pendante) + farine de plumes 13-0-0 minéralisée 75% en ~5 sem (cert 4 produit). Cert combiné = min(2, 4) = 2.'
        : 'Source: OM2 starter charge (cert 2 placeholder, fiche Berger pendante). Farine de plumes ne porte que du N. Cert raisé à 4 quand la fiche datasheet Berger sera intégrée.',
    });
    if (det.cap) {
      registerPourquoi('nursery-substrate.cap.' + element + '.' + det.cap.kind, {
        title: element + ' — plafond ' + (det.cap.kind === 'damage' ? 'plante 🔥' : det.cap.kind === 'precipitation' ? 'précipitation 💧' : 'autre ❗'),
        cert: det.cert,
        equation: '',
        plugged: det.cap.reason,
        interpretation: 'Sans plafond, l\'apport serait de <strong>' + fmt(det.cap.uncappedMg) + ' mg/plateau/sem</strong> (au lieu de ' + fmt(v) + ').',
      });
    }
  });
  const fmCapHit = fmGperTray >= SCN.LIMITS.maxFeatherMealPerTrayG;
  let subHtml = `<div style="font-size:11.5px; color:var(--text-muted); margin-bottom:6px;">`
    + `<strong>Farine de plumes ${fmGperTray} g/plateau</strong>`
    + (fmCapHit ? ` <span style="color:#a86a1e;">(plafond ${SCN.LIMITS.maxFeatherMealPerTrayG} g — protection germination)</span>` : '')
    + ` · OM2 starter charge `
    + `<span style="color:var(--text-muted); font-size:10.5px;">(cert 2 placeholder, fiche Berger pendante)</span>.`
    + ` Apport moyen sur ${SCN.OM2_RELEASE_CURVE_BY_WEEK.length} sem du cycle.`
    + `</div>`;
  subHtml += renderGapGrid(demandFlat, subContrib, gapAfterSubstrate, 'nursery-substrate', subDetails, 'nursery-substrate', (subResult && subResult.efficiency) || {});
  document.getElementById('nutr-n-substrate').innerHTML = subHtml;

  // ─── Block 3: Fertigation — recipe header + gap-grid table ───
  // Supply scales with applicationsPerWeek (supply-scales-linearly-with-applications).
  // EC + pH bind per fertigation, not per week (ec-cap-per-fertigation-not-per-week).
  const FN = window.FertigationNursery;
  const trayL = FN.NURSERY_FERTIGATION_DEFAULTS.trayVolumeL;
  const recipe = FN.NURSERY_RECIPE_DEFAULT;
  const supply = FN.nurseryRecipeSupply(recipe, trayL, appsPerWeek);
  const ce = FN.nurseryRecipeCE(recipe, 1);
  const tankPh = FN.nurseryRecipeTankPh(recipe);
  const ceCap = FN.NURSERY_CE_CAP_MS_CM;
  const phRange = FN.NURSERY_TANK_PH_RANGE;
  const phLo = phRange[0], phHi = phRange[1];
  const ceColor = ce <= ceCap ? '#1e6b2d' : '#8a3e1e';
  const phColor = (tankPh >= phLo && tankPh <= phHi) ? '#1e6b2d' : '#8a3e1e';
  // Build fert contrib map (already includes applicationsPerWeek scaling
  // because nurseryRecipeSupply was called with appsPerWeek).
  // contribution-channel-details-payload also exposes details per element.
  const fertContrib = {};
  const fertDetails = supply.details || {};
  ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    fertContrib[element] = (supply.perTray_mg || {})[element] || 0;
  });
  // Gap chain step 2 — feeds Block 4 (leviers) as residual.
  const gapAfterFert = {};
  ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    gapAfterFert[element] = Math.max(0, gapAfterSubstrate[element] - fertContrib[element]);
  });
  // apport-ici-clickable-cert-and-cap-modals — register pourquoi entries per (block, element) cell + cap.
  ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    const v = fertContrib[element] || 0;
    const det = fertDetails[element] || { cert: null, cap: null };
    if (v <= 0 && !det.cap) return;
    registerPourquoi('nursery-fert.cell.' + element, {
      title: element + ' — Fertigation (semis)',
      cert: det.cert,
      equation: 'apport = Σ (recipe[product].g/L × tray_volume × product.base[' + element + ']) × applications/sem',
      plugged: '<strong>' + fmt(v) + ' mg/plateau/sem</strong> à ' + appsPerWeek + '× /sem · CE bidon ' + ce.toFixed(2) + ' mS/cm.',
      interpretation: 'Cert combiné = min(cert) parmi les produits qui apportent ' + element + '. Augmenter applications/sem ou ajouter un produit pour combler le manque sortant.',
    });
    if (det.cap) {
      registerPourquoi('nursery-fert.cap.' + element + '.' + det.cap.kind, {
        title: element + ' — plafond ' + (det.cap.kind === 'damage' ? 'plante 🔥' : det.cap.kind === 'precipitation' ? 'précipitation 💧' : 'autre ❗'),
        cert: det.cert,
        equation: '',
        plugged: det.cap.reason,
        interpretation: 'Sans plafond, l\'apport serait de <strong>' + fmt(det.cap.uncappedMg) + ' mg/plateau/sem</strong> (au lieu de ' + fmt(v) + ').',
      });
    }
  });
  // Recipe header — scannable per-tray dose list + frequency annotation.
  let fertHtml = `<div style="font-size:11.5px; color:var(--text-muted); margin-bottom:6px;">`
    + `Recette par plateau (${trayL} L bidon, dissous à sec) <strong>×${appsPerWeek}/sem</strong> :`;
  Object.keys(recipe).forEach(name => {
    fertHtml += ` ${name} <strong style="color:var(--text);">${recipe[name].toFixed(1)} g/L</strong> ·`;
  });
  fertHtml = fertHtml.replace(/·$/, '.') + `</div>`;
  fertHtml += `<div style="display:grid; grid-template-columns:1.1fr 0.6fr 0.6fr; gap:4px 10px; font-size:12px; margin-bottom:8px;">
    <div style="color:var(--text-muted);">CE prédite (bidon)</div>
    <div style="font-family:'DM Mono',monospace; color:${ceColor};">${ce.toFixed(2)} mS/cm</div>
    <div style="color:var(--text-muted); font-size:11px;">cap ${ceCap.toFixed(1)}</div>
    <div style="color:var(--text-muted);">pH prédit</div>
    <div style="font-family:'DM Mono',monospace; color:${phColor};">${tankPh.toFixed(2)}</div>
    <div style="color:var(--text-muted); font-size:11px;">[${phLo}-${phHi}]</div>
  </div>`;
  fertHtml += renderGapGrid(gapAfterSubstrate, fertContrib, gapAfterFert, 'nursery-fert', fertDetails, 'nursery-fert', supply.efficiency || {});
  document.getElementById('nutr-n-fertigation').innerHTML = fertHtml;

  // ─── Block 4: Leviers (reads gapAfterFert as residual) ───
  // Includes (min-applications-solves-full-coverage) min applicationsPerWeek
  // to hit 100% on sourced elements, and (elements-sourced-vs-unsourced)
  // sourced vs unsourced classification.
  const gaps = [];
  ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    const d = demandFlat[element] || 0;
    const gap = gapAfterFert[element] || 0;
    if (d > 0) gaps.push({ element, gap, demand: d });
  });
  gaps.sort((a, b) => (b.gap / Math.max(1, b.demand)) - (a.gap / Math.max(1, a.demand)));

  // For the minimumApplicationsPerWeek + sourced/unsourced check, "demand the
  // fertigation must cover" = gapAfterSubstrate (substrate already in chain).
  const minimumApps = FN.minimumApplicationsPerWeek(recipe, gapAfterSubstrate, trayL, ceCap);
  const sourceSplit = FN.nurseryElementsBySource(recipe, gapAfterSubstrate, trayL);
  const minimumAppsLine = minimumApps === null
    ? `<span style="color:#8a3e1e;">⚠ Recette plafonnée : même à 7×/sem, certains éléments sourcés ne couvrent pas la demande. Augmenter dose par fertigation OU ajouter un produit.</span>`
    : `Pour couvrir 100% de N/P/K (sources actives, sans substrat) : <strong style="color:var(--text);">${minimumApps}×/sem</strong>${minimumApps > appsPerWeek ? ` (actuellement ${appsPerWeek}×)` : ''}.`;
  const unsourcedLine = sourceSplit.unsourced.length > 0
    ? ` Éléments sans source dans la recette (frequency ne ferme pas le gap) : <strong>${sourceSplit.unsourced.join(', ')}</strong>.`
    : '';

  let levHtml = `<div style="font-size:11.5px; color:var(--text-muted); margin-bottom:8px;">Manque = besoin − substrat − fertigation. Trié par % manquant.</div>`;
  levHtml += `<div style="margin-bottom:10px; padding:8px 10px; background:var(--input-bg); border:1px solid var(--border); border-radius:var(--radius-sm); font-size:11.5px; line-height:1.55;">${minimumAppsLine}${unsourcedLine}</div>`;
  const openGaps = gaps.filter(g => g.gap > 0);
  if (openGaps.length === 0) {
    levHtml += `<div style="padding:10px; background:#eef7f1; border:1px solid #b8d9c4; border-radius:6px; color:#1e6b2d; font-weight:600;">✓ Tous les besoins sont couverts au taux courant.</div>`;
  } else {
    levHtml += `<div style="display:grid; grid-template-columns:0.5fr 1fr 1fr 2.2fr; gap:6px 10px; font-size:12px;">
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Él.</div>
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Manque</div>
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">% besoin</div>
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Levier</div>`;
    openGaps.forEach(g => {
      const pct = (g.gap / g.demand) * 100;
      const lever = nurseryLeverFor(g.element);
      const pctColor = pct >= 80 ? '#8a3e1e' : pct >= 50 ? '#a86a1e' : 'var(--text)';
      levHtml += `
        <div style="font-weight:600;">${g.element}</div>
        <div style="font-family:'DM Mono',monospace;">${fmt(g.gap)}</div>
        <div style="font-family:'DM Mono',monospace; color:${pctColor};">${Math.round(pct)}%</div>
        <div style="font-size:11.5px; line-height:1.5;">${lever}</div>`;
    });
    levHtml += `</div>`;
  }
  document.getElementById('nutr-n-leviers').innerHTML = levHtml;
}

// Lever advice per element for the Semis subpage. Auto-derived from element
// identity (mirrors lettuceLeverFor on Salanova subpage). Cert 3.
function nurseryLeverFor(element) {
  if (element === 'N') {
    return 'Augmenter <strong>EZ-Gro Océan 15-1-1</strong> dans le bidon (15% N). Plafond pratique : CE bidon ≤ 3,0 mS/cm.';
  }
  if (element === 'P') {
    return 'Garder <strong>Acadie poisson 2-4-0.5</strong> à 6+ mL/L — c\'est la source P principale (Océan trop pauvre en P).';
  }
  if (element === 'K') {
    return 'Substrat OM2 livre peu de K. Si gap réelement : ajouter <strong>K₂SO₄</strong> au bidon (Ecocert ✓ — sulfate of potash).';
  }
  if (element === 'Ca') {
    return 'Pas de source Ca soluble Ecocert dans la recette. La chaux dans OM2 doit couvrir — confirmer via fiche Berger OM2 (cert 2 placeholder).';
  }
  if (element === 'Mg') {
    return 'Substrat partiel ; ajouter <strong>MgSO₄·7H₂O</strong> (Epsom, Ecocert ✓) au bidon si gap > 30%.';
  }
  if (element === 'Fe' || element === 'Mn' || element === 'Zn' || element === 'B' || element === 'Cu' || element === 'Mo') {
    return 'Algue Acadie 2 mL/L livre des traces (~1-5% du besoin selon élément). Si gap > 50% : augmenter le dose d\'algue OU ajouter un foliaire micros. Confirmer au tissue test.';
  }
  return '';
}
