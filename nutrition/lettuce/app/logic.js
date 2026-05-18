// ═══════════════ SALANOVA POST-TRANSPLANT BILAN ═══════════════
// Renders the lettuce subpage of the Nutrition page using the continuous
// post-transplant model (window.PlantNeedsLettuce). Mass-balance flow
// (2026-05-08, mirrored on tomato): demand → compost → front-load →
// fertigation → leviers. Soil mass-flow drops out of the supply chain — it
// draws on the bank, doesn't replenish.
function buildNutrimentLettuce() {
  const PN = window.PlantNeedsLettuce;
  const transplantG = parseFloat(document.getElementById('nutr-l-transplant').value) || 30;
  const targetG     = parseFloat(document.getElementById('nutr-l-target').value)     || 100;
  const cycleDays   = parseFloat(document.getElementById('nutr-l-days').value)       || 14;
  const density     = parseFloat(document.getElementById('nutr-l-density').value)    || 43;
  const frontloadG  = PN.LETTUCE_FRONTLOAD_DEFAULTS.featherMeal_g_per_m2;
  const phLocked    = document.getElementById('nutr-l-phlocked').checked;

  const demand = PN.calculateLettuceNutritionDemand(transplantG, targetG, cycleDays, density);
  // Pure-function dependency bag — resolved at the integrator boundary so
  // the calc layer reads no globals. Spec: nutrition/lettuce/plant-needs/spec.md.
  const supply = PN.calculateLettuceNutritionSupply(transplantG, targetG, density, phLocked, frontloadG, {
    weeklyMassFlowL: weeklyMassFlowL(),
    smeLettucePpm: PN.SME_LETTUCE_PPM,
    lettuceRecipe: LETTUCE,
    productPct: PRODUCT_PCT,
    featherMealMineralizationEfficiency: SIDEDRESS_MINIMUM_EFFICIENCY.FarinePlumes_N,
    frontloadDefaults: PN.LETTUCE_FRONTLOAD_DEFAULTS,
  });
  const order = ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'];
  const LETTUCE_AREA = LETTUCE_NUMBER_BEDS * LETTUCE_BED_AREA;

  // Pourquoi modal registry — wiped + repopulated each render. Keys use
  // `lettuce-${block}.${element}` so they don't collide with tomato entries.
  window.currentPourquoi = {};

  const massGainPerCycle = (targetG - transplantG) * density / 1000;
  const dwGain = massGainPerCycle * PN.LETTUCE_DM_FRACTION;

  // Context block — surface the assumptions driving the numbers below.
  const contextElement = document.getElementById('nutr-l-context');
  if (contextElement) {
    const tooBig = (transplantG >= targetG);
    const warn = tooBig
      ? ' <span style="color:#8a3e1e;">⚠ Cible ≤ transplant — aucun gain de masse, demande nulle.</span>'
      : '';
    contextElement.innerHTML =
      `Gain par tête : <strong style="color:var(--text);">${(targetG - transplantG).toFixed(0)} g</strong>`
      + ` sur ${cycleDays.toFixed(0)} jours · `
      + `gain m² : <strong style="color:var(--text);">${massGainPerCycle.toFixed(2)} kg/m²</strong>`
      + ` (${dwGain.toFixed(2)} kg DW/m²).`
      + warn;
  }

  // Compost residual per element (g/m²/wk → mg/m²/wk for the gap chain).
  // Same Savaria ORGANIMIX amendment was applied on lettuce beds in fall 2025;
  // window.CompostContribution.releasePerWeek is per-m² so it transfers directly.
  const compostMg = {};
  const CC = window.CompostContribution;
  order.forEach(element => {
    const gPerWk = CC.releasePerWeek[element];
    compostMg[element] = (gPerWk != null ? gPerWk : 0) * 1000;
  });

  // Front-load (farine de plumes pre-transplant) — N only; mineralization
  // window per LETTUCE_FRONTLOAD_DEFAULTS. Mirror compost structure for the
  // gap chain: per-element supply map (mostly 0).
  const frontloadMg = {};
  order.forEach(element => { frontloadMg[element] = 0; });
  frontloadMg.N = supply.frontload.N || 0;

  // Mass-balance gap chain: demand → compost → front-load → fertigation.
  // Soil mass-flow (supply.soil) is excluded — it draws on the bank.
  const gapAfterDemand    = {};
  const gapAfterCompost   = {};
  const gapAfterFront     = {};
  const gapAfterFert      = {};
  order.forEach(element => {
    gapAfterDemand[element]  = demand[element] || 0;
    gapAfterCompost[element] = Math.max(0, gapAfterDemand[element]  - (compostMg[element]      || 0));
    gapAfterFront[element]   = Math.max(0, gapAfterCompost[element] - (frontloadMg[element]    || 0));
    gapAfterFert[element]    = Math.max(0, gapAfterFront[element]   - (supply.fert[element]    || 0));
  });

  const fmt = v => (v == null || !isFinite(v)) ? '—'
    : (v >= 1000 ? Math.round(v).toLocaleString('fr-CA')
    : v >= 10   ? v.toFixed(0)
    : v >= 1    ? v.toFixed(1)
    :              v.toFixed(2));

  // ─── Block 1: Besoins (cert + DW tissu surfaced via modal on click) ───
  // Cert per element from the original certByEl map (cert 4 macros, cert 3
  // micros). DW tissue concentration moved out of the visible row into the
  // modal so the grid stays compact (per user request 2026-05-08).
  const certByEl = { N:4, P:4, K:4, Ca:4, Mg:4, Fe:3, Mn:3, Zn:3, B:3, Cu:3, Mo:3 };
  order.forEach(element => {
    const t = PN.LETTUCE_TISSUE_DW[element];
    const dryWeightString = t >= 1e-3 ? `${(t*100).toFixed(2)}%` : `${(t*1e6).toFixed(0)} ppm`;
    const dwGainPerWk_g = dwGain * 1000 * (7 / Math.max(1, cycleDays));
    registerPourquoi(`lettuce-demand.${element}`, {
      title: `${element} — besoin hebdomadaire (Salanova post-transplant)`,
      cert: certByEl[element],
      equation: `demand[${element}] = (gain frais × densité / 1000) × DM × (7 / cycleDays) × LETTUCE_TISSUE_DW[${element}] × 1 000`,
      plugged: `gain ${(targetG - transplantG).toFixed(0)} g × ${density.toFixed(0)} plants/m² / 1 000 = ${massGainPerCycle.toFixed(2)} kg/m² · DM ${(PN.LETTUCE_DM_FRACTION*100).toFixed(0)}% · sur ${cycleDays.toFixed(0)} j → DW ${dwGainPerWk_g.toFixed(1)} g/m²/sem · × ${dryWeightString} = <strong>${fmt(demand[element])} mg/m²/sem</strong>`,
    });
  });
  let needsHtml = `<div style="display:grid; grid-template-columns:0.6fr 1fr; gap:6px 12px; font-size:12px;">
    <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Él.</div>
    <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Besoin</div>
  </div>`;
  needsHtml += `<div style="font-size:12px;">`;
  order.forEach(element => {
    needsHtml += `<div class="pq-row" onclick="showPourquoi('lettuce-demand.${element}')" style="display:grid; grid-template-columns:0.6fr 1fr; gap:6px 12px; padding:2px 4px; border-radius:3px;">
      <div style="font-weight:600;">${element}</div>
      <div style="font-family:'DM Mono',monospace;">${fmt(demand[element])} <span style="color:var(--text-muted); font-size:10px;">mg/m²/sem</span></div>
    </div>`;
  });
  needsHtml += `</div>`;
  document.getElementById('nutr-l-needs').innerHTML = needsHtml;

  // ─── Block 2: Compost résiduel (Savaria ORGANIMIX, fall 2025) ───
  // Reads window.CompostContribution.releasePerWeek — same source-of-truth as
  // the tomato compost block (REQ-004). Per-element rows clickable for modal.
  let compostHtml = `<div style="font-size:12.5px; line-height:1.5; color:var(--text-muted); margin-bottom:10px;">Minéralisation hebdomadaire du compost Savaria ORGANIMIX appliqué à l'automne 2025 sur les planches Salanova (~25,4 kg/m², étiquette N 0,5 · P₂O₅ 0,1 · K₂O 0,1 · Ca 1,1 · Mg ~0,5 %). Décline avec le temps ; à revisiter quand le compost vieillit (~18-24 mois post-application).</div>`;
  order.forEach(element => {
    const gPerWk = CC.releasePerWeek[element];
    if (gPerWk == null) {
      registerPourquoi(`lettuce-compost.${element}`, {
        title: `${element} — compost résiduel`,
        cert: 2,
        equation: `compost[${element}] = 0 (non listé dans window.CompostContribution.releasePerWeek)`,
        plugged: `Apport compost = 0 mg/m²/sem`,
        // stable — Savaria label declares only macros + Ca; micros not tracked
        interpretation: `${element} n'est pas suivi dans la libération du compost (étiquette Savaria ne déclare que macros). Apport supposé négligeable à l'échelle hebdomadaire.`
      });
      return;
    }
    const mgPerWk = gPerWk * 1000;
    const totalGPerWk = gPerWk * LETTUCE_AREA;
    // stable — Ca-saturation context; mineralization model; Mg label gap; P pH lockout
    const note = element === 'Ca'
      ? '⚠ Le Ca du compost a contribué à la sursaturation calcique du sol (racine de la crise pH 7,4-7,5). Pas un manque à combler — un excès à laisser décliner par lessivage.'
      : (element === 'Mg'
        ? 'Mg % NON déclaré sur l\'étiquette Savaria (assomption conservatrice ~0,3 %). Cert 1-2 — vérifier auprès du fournisseur si le poste devient critique.'
        : (element === 'P'
          ? 'P verrouillé à pH ≥ 7 : Ca²⁺ précipite le phosphate fraîchement minéralisé en Ca-P avant absorption. Apport effectif très faible tant que le pH reste haut.'
          : 'Minéralisation année 1 × facteur saisonnier (Q10 ≈ 2 sur l\'activité microbienne).'));
    registerPourquoi(`lettuce-compost.${element}`, {
      title: `${element} — compost résiduel (Savaria ORGANIMIX)`,
      cert: element === 'Mg' ? 1 : (element === 'Ca' ? 3 : 2),
      equation: `compost[${element}] = window.CompostContribution.releasePerWeek[${element}] × 1 000`,
      plugged: `${gPerWk.toFixed(3)} g/m²/sem × 1 000 = <strong>${mgPerWk.toFixed(0)} mg/m²/sem</strong> &nbsp;·&nbsp; total Salanova (${LETTUCE_AREA.toFixed(0)} m²) = ${totalGPerWk.toFixed(1)} g/sem`,
      interpretation: note
    });
  });
  compostHtml += `<div style="font-size:11.5px; color:var(--text-muted); margin-bottom:4px;">Besoin hebdo → manque restant après libération du compost :</div>`;
  compostHtml += renderGapGrid(gapAfterDemand, compostMg, gapAfterCompost, 'lettuce-compost', undefined, undefined, {});
  document.getElementById('nutr-l-compost').innerHTML = compostHtml;

  // ─── Block 3: Front-load farine de plumes (slow-release N) ───
  // Compost-style presentation — descriptive intro + per-element gap grid
  // with click-to-modal rows. Only N is delivered; other rows surface "no
  // contribution" reasons in the modal.
  const fmWeeks = PN.LETTUCE_FRONTLOAD_DEFAULTS.mineralizationWeeks;
  const planches = LETTUCE_NUMBER_BEDS;
  const planchAreaM2 = LETTUCE_BED_AREA;
  const totalKg = (frontloadG * planches * planchAreaM2) / 1000;
  registerPourquoi(`lettuce-frontload.N`, {
    title: 'N — front-load farine de plumes (pré-transplant)',
    cert: 3,
    equation: `frontload[N] = taux × FarinePlumes_N × eff_N × 1 000 / mineralizationWeeks`,
    plugged: `${frontloadG.toFixed(0)} g/m² × ${PRODUCT_PCT.FarinePlumes_N} × ${SIDEDRESS_MINIMUM_EFFICIENCY.FarinePlumes_N} × 1 000 / ${fmWeeks} sem = <strong>${fmt(frontloadMg.N)} mg N/m²/sem</strong> &nbsp;·&nbsp; total ${planches} planches × ${planchAreaM2} m² = ${totalKg.toFixed(1)} kg`,
    // stable — feather meal mineralization rate + N-only profile
    interpretation: 'Farine de plumes 13-0-0 appliquée avant transplant et incorporée. Minéralisation 75 % sur ~4 sem de relâche en sol chaud (cert 3). Distribué uniformément sur la fenêtre — N effectif hebdo = N total × 75 % / nombre de semaines.'
  });
  ['P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
    registerPourquoi(`lettuce-frontload.${element}`, {
      title: `${element} — pas dans le front-load`,
      cert: 3,
      equation: `frontload[${element}] = 0`,
      plugged: `Apport front-load = 0 mg/m²/sem`,
      // stable — feather meal is N-only; P/Ca already saturated, others not delivered
      interpretation: element === 'P' || element === 'Ca'
        ? `Pas de ${element} dans le front-load — ${element === 'P' ? 'banque Mehlich saturée + lockout pH' : 'sol Ca-saturé, ajout anti-utile'}. Farine de plumes = 13-0-0 (N seul).`
        : `Farine de plumes = 13-0-0 (N seul). ${element} doit venir d'un autre canal.`
    });
  });
  let flHtml = `<div style="font-size:12.5px; line-height:1.5; color:var(--text-muted); margin-bottom:10px;">Farine de plumes 13-0-0 appliquée avant transplant à <strong style="color:var(--text);">${frontloadG.toFixed(0)} g/m²</strong> (~${totalKg.toFixed(1)} kg total sur ${planches} planches × ${planchAreaM2} m²). Minéralisation 75 % distribuée sur ~${fmWeeks} sem (cert 3). N seul — aucun P, aucun Ca (les deux déjà saturés au sol).</div>`;
  flHtml += `<div style="font-size:11.5px; color:var(--text-muted); margin-bottom:4px;">Manque entrant (après compost) → manque restant après front-load :</div>`;
  flHtml += renderGapGrid(gapAfterCompost, frontloadMg, gapAfterFront, 'lettuce-frontload', undefined, undefined, (supply.frontload && supply.frontload.efficiency) || {});
  document.getElementById('nutr-l-frontload-block').innerHTML = flHtml;

  // ─── Block 4: Fertigation actuelle (LETTUCE constant) ───
  // K₂SO₄ + MgSO₄·7H₂O + FeSO₄·7H₂O per 100 m²/wk. Fe × 0.15 if pH ≥ 7
  // (root reductase suppressed in calcareous soils).
  let fertHtml = `<div style="font-size:12px; color:var(--text-muted); line-height:1.6; padding:10px 12px; background:var(--input-bg); border-radius:var(--radius-sm); margin-bottom:10px;">`;
  fertHtml += `<div>K₂SO₄ ${LETTUCE.kSulfate} g → <strong style="color:var(--text);">${fmt(supply.fert.K)} mg K/m²/sem</strong></div>`;
  fertHtml += `<div>MgSO₄·7H₂O ${LETTUCE.mgSulfate} g → <strong style="color:var(--text);">${fmt(supply.fert.Mg)} mg Mg/m²/sem</strong></div>`;
  fertHtml += `<div>FeSO₄·7H₂O ${LETTUCE.feSulfate} g → <strong style="color:var(--text);">${fmt(supply.fert.Fe)} mg Fe/m²/sem</strong>${phLocked ? ' (× 0,15 à pH ≥ 7)' : ''}</div>`;
  fertHtml += `<div style="margin-top:6px; padding-top:6px; border-top:1px dashed var(--border); font-size:11px;">Recette LETTUCE par 100 m²/sem (constante app). Pas de N (biofilm baril) · pas d'oligos (verrouillage racinaire à pH actuel).</div>`;
  fertHtml += `</div>`;
  // Per-element fertigation pourquoi entries.
  registerPourquoi(`lettuce-fert.K`, {
    title: 'K — fertigation (K₂SO₄)',
    cert: 4,
    equation: `fert[K] = LETTUCE.kSulfate × K2SO4_K_analysis × 1 000 / 100`,
    plugged: `${LETTUCE.kSulfate} g × ${PRODUCT_PCT.K2SO4_K} × 1 000 / 100 m² = <strong>${fmt(supply.fert.K)} mg K/m²/sem</strong>`,
    // stable — K₂SO₄ is the canonical lettuce fertigation K source
    interpretation: 'Recette LETTUCE.kSulfate, hebdo. Si banque K SME tient (cible > 35 ppm), K luxe — surveiller au prochain SME, dose ajustable.'
  });
  registerPourquoi(`lettuce-fert.Mg`, {
    title: 'Mg — fertigation (MgSO₄·7H₂O)',
    cert: 4,
    equation: `fert[Mg] = LETTUCE.mgSulfate × MgSO4_Mg_analysis × 1 000 / 100`,
    plugged: `${LETTUCE.mgSulfate} g × ${PRODUCT_PCT.MgSO4_Mg.toFixed(4)} × 1 000 / 100 m² = <strong>${fmt(supply.fert.Mg)} mg Mg/m²/sem</strong>`,
    // stable — MgSO₄ is the canonical Mg source; antagonism context invariant
    interpretation: 'Recette LETTUCE.mgSulfate, hebdo. Antagonisme K:Mg possible mais non confirmé sans test foliaire.'
  });
  registerPourquoi(`lettuce-fert.Fe`, {
    title: 'Fe — fertigation (FeSO₄·7H₂O)',
    cert: 3,
    equation: `fert[Fe] = LETTUCE.feSulfate × FeSO4_Fe_analysis × 1 000 / 100 ${phLocked ? '× 0,15 (pH ≥ 7)' : ''}`,
    plugged: `${LETTUCE.feSulfate} g × ${PRODUCT_PCT.FeSO4_Fe} × 1 000 / 100 m² ${phLocked ? '× 0,15' : ''} = <strong>${fmt(supply.fert.Fe)} mg Fe/m²/sem</strong>`,
    // stable — Fe oxidation chemistry at high pH is invariant
    interpretation: 'À pH ≥ 7, Fe²⁺ → Fe³⁺ rapide (oxydation) ; réductase racinaire supprimée en sol calcaire. Apport effectif ~15 % de la dose. Foliaire Fe-EDDHA = bypass durable si la carence persiste.'
  });
  ['N','P','Ca','Mn','Zn','B','Cu','Mo'].forEach(element => {
    registerPourquoi(`lettuce-fert.${element}`, {
      title: `${element} — pas en fertigation`,
      cert: 3,
      equation: `fert[${element}] = 0 (élément absent de LETTUCE)`,
      plugged: `Apport fertigation = 0 mg/m²/sem`,
      // stable — N biofilm risk; Ca-saturated soil; sulfate-oligo high-pH precipitation
      interpretation: element === 'N'
        ? 'N retiré de la fertigation laitue : risque de biofilm dans le baril (matière organique). Le compost résiduel + le front-load couvrent.'
        : element === 'Ca'
          ? 'Sol Ca-saturé — apport supplémentaire anti-utile.'
          : element === 'P'
            ? 'P précipite avec Ca²⁺ à pH ≥ 7 avant d\'atteindre les racines. Banque Mehlich saturée (678 kg/ha).'
            : `${element} retiré de la fertigation à pH ≥ 7 (sulfates d'oligos précipitent en hydroxydes/phosphates de Ca avant absorption). Foliaire bypasse cette chimie. Réintroduire si pH < 6,5.`
    });
  });
  fertHtml += `<div style="font-size:11.5px; color:var(--text-muted); margin-bottom:4px;">Manque entrant (après front-load) → manque restant après fertigation :</div>`;
  fertHtml += renderGapGrid(gapAfterFront, supply.fert, gapAfterFert, 'lettuce-fert', undefined, undefined, {});
  document.getElementById('nutr-l-fert').innerHTML = fertHtml;

  // ─── Block 5: Leviers (auto-derived from gap chain residual) ───
  let missHtml = `<div style="font-size:11.5px; color:var(--text-muted); margin-bottom:8px;">Manque résiduel après les trois canaux (compost, front-load, fertigation). Trier par magnitude pour prioriser ; le levier propose comment fermer le gap.</div>`;
  const gaps = order.map(element => ({
    element,
    gap: gapAfterFert[element] || 0,
    demand: demand[element] || 0,
  })).filter(g => g.demand > 0 && g.gap > 0)
     .sort((a, b) => (b.gap / Math.max(1, b.demand)) - (a.gap / Math.max(1, a.demand)));

  if (gaps.length === 0) {
    missHtml += `<div style="padding:10px; background:#eef7f1; border:1px solid #b8d9c4; border-radius:6px; color:#1e6b2d; font-weight:600;">✓ Tous les besoins sont couverts au taux courant.</div>`;
  } else {
    missHtml += `<div style="display:grid; grid-template-columns:0.5fr 1fr 1fr 2fr; gap:6px 10px; font-size:12px;">
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Él.</div>
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Manque</div>
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">% besoin</div>
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Levier</div>`;
    gaps.forEach(g => {
      const pct = (g.gap / g.demand) * 100;
      const lever = lettuceLeverFor(g.element, phLocked);
      const pctColor = pct >= 80 ? '#8a3e1e' : pct >= 50 ? '#a86a1e' : 'var(--text)';
      missHtml += `
        <div style="font-weight:600;">${g.element}</div>
        <div style="font-family:'DM Mono',monospace;">${fmt(g.gap)}</div>
        <div style="font-family:'DM Mono',monospace; color:${pctColor};">${Math.round(pct)}%</div>
        <div style="font-size:11.5px; line-height:1.5;">${lever}</div>`;
    });
    missHtml += `</div>`;
  }
  document.getElementById('nutr-l-missing').innerHTML = missHtml;

  // ─── Recette proposée — admin model + manual safety overrides ───
  // Mirrors the tomato `nutr-proposed` card. Pinned to the current LETTUCE
  // recipe + LETTUCE_FRONTLOAD_DEFAULTS as the proposed target with rationale
  // per channel. Stage-independent (lettuce has no stages).
  try {
    const proposedElement = document.getElementById('nutr-l-proposed');
    if (proposedElement) proposedElement.innerHTML = renderProposedRecipeLettuce({
      demand, supply, frontloadMg, gapAfterFront, frontloadG,
    });
  } catch (e) {
    console.warn('[Lettuce proposed] render failed:', e);
  }
}

// ─── Recette proposée — Salanova ─────────────────────────────────────────
// First-principles target for the lettuce-side channels: front-load + fertigation
// + monthly sulfur. Rationale text references live demand / gap values from the
// current render so doses don't sit anchored to stale framing.
function renderProposedRecipeLettuce({ demand, supply, frontloadMg, gapAfterFront, frontloadG }) {
  const PN = window.PlantNeedsLettuce;
  const fmt = v => (v == null || !isFinite(v)) ? '—'
    : (v >= 1000 ? Math.round(v).toLocaleString('fr-CA')
    : v >= 10   ? v.toFixed(0)
    : v >= 1    ? v.toFixed(1)
    :              v.toFixed(2));
  const row = (productHtml, doseHtml, rationaleHtml, changed) => {
    const doseStyle = changed
      ? 'color:var(--text); font-weight:600;'
      : 'color:var(--text-muted);';
    return '<div style="display:grid; grid-template-columns:1.4fr 0.9fr 2fr; gap:6px 12px; padding:5px 0; border-bottom:1px dashed var(--border); font-size:12px; line-height:1.45;">'
      +   `<div style="color:var(--text-muted);">${productHtml}</div>`
      +   `<div style="font-family:'DM Mono',monospace; ${doseStyle}">${doseHtml}</div>`
      +   `<div style="color:var(--text-muted); font-size:11px;">${rationaleHtml}</div>`
      + '</div>';
  };
  const channelHeader = (label, sublabel) =>
    '<div style="margin-top:14px; margin-bottom:4px;">'
    +   `<div style="font-size:11.5px; font-weight:700; color:var(--text); text-transform:uppercase; letter-spacing:0.8px;">${label}</div>`
    +   (sublabel ? `<div style="font-size:10.5px; color:var(--text-muted); margin-top:1px;">${sublabel}</div>` : '')
    + '</div>';

  let h = '<div style="font-size:11.5px; color:var(--text-muted); line-height:1.5; margin-bottom:4px;">'
    + '<strong style="color:var(--text); font-size:12.5px;">Recette proposée — dérivée premiers principes</strong>'
    + '</div>';
  h += '<div style="font-size:11px; color:var(--text-muted); line-height:1.5; margin-bottom:8px; font-style:italic;">'
    + 'Demande → fourniture passive (compost) → rôle du canal → dose.'
    + '</div>';

  // Front-load — N coverage anchor
  const dN  = demand.N  || 0;
  const flN = frontloadMg.N || 0;
  const flPctN = dN > 0 ? Math.round(flN / dN * 100) : 0;
  const flDefault = PN.LETTUCE_FRONTLOAD_DEFAULTS.featherMeal_g_per_m2;
  h += channelHeader('Front-load', 'Avant transplant · par planche · cycle ' + PN.LETTUCE_FRONTLOAD_DEFAULTS.mineralizationWeeks + ' sem');
  h += row(
    'Farine de plumes 13-0-0',
    `${flDefault} g/m²`,
    `Cible : couvrir le gap N après compost (~${fmt(gapAfterFront.N + flN)} mg/m²/sem). À ${flDefault} g/m² × 13 % × 75 % / ${PN.LETTUCE_FRONTLOAD_DEFAULTS.mineralizationWeeks} sem = ${fmt(flN)} mg N/m²/sem effectif (~${flPctN} % du besoin courant : ${fmt(dN)}).`,
    frontloadG !== flDefault
  );
  h += pourquoiExpander(
    'dose<sub>front-load</sub> = (besoin N − compost N) ÷ (% N × efficacité × (1 / fenêtre minéralisation))',
    `${flDefault} g/m² × 0,13 N × 0,75 efficacité × 1 000 / ${PN.LETTUCE_FRONTLOAD_DEFAULTS.mineralizationWeeks} sem = <strong>${fmt(flN)} mg N/m²/sem</strong>`,
    'Efficacité 75 % = borne basse de minéralisation organique en régime établi (sol chaud). En sol froid ou fraîchement amendé, peut tomber à 50 % — surveiller couleur feuillage et ajuster.'
  );

  // Fertigation — current LETTUCE constant
  h += channelHeader('Fertigation', 'Lundi · hebdo · per 100 m²');
  const kPctL = dN > 0 && demand.K > 0 ? Math.round((supply.fert.K / demand.K) * 100) : 0;
  const mgPctL = demand.Mg > 0 ? Math.round((supply.fert.Mg / demand.Mg) * 100) : 0;
  const fePctL = demand.Fe > 0 ? Math.round((supply.fert.Fe / demand.Fe) * 100) : 0;
  h += row('K₂SO₄ (0-0-50)',         `${LETTUCE.kSulfate} g`,  `Couvre ~${kPctL} % du besoin K (${fmt(supply.fert.K)} / ${fmt(demand.K)} mg/m²/sem). Banque K SME laitue 54 ppm (en spec) — surveiller, dose ajustable.`, false);
  h += row('MgSO₄·7H₂O',              `${LETTUCE.mgSulfate} g`, `Couvre ~${mgPctL} % du besoin Mg (${fmt(supply.fert.Mg)} / ${fmt(demand.Mg)}). Antagonisme K:Mg à valider au tissue test si symptômes.`, false);
  h += row('FeSO₄·7H₂O',              `${LETTUCE.feSulfate} g`, `Couvre ~${fePctL} % du besoin Fe à pH ≥ 7 (× 0,15 d'efficacité). Foliaire Fe-EDDHA = bypass durable si carence visible.`, false);

  // Soufre élémentaire — monthly
  h += channelHeader('Soufre élémentaire', 'Par planche · mensuel');
  h += row('Salanova', '0,76 kg/mois', 'Standardisation 2,5 kg/100 m²/mois (planche 30,4 m² × 4,5 = 136,8 m²). Programme à long terme pour faire descendre le pH sous 7 — seul levier durable pour débloquer P/Mn/Zn/Fe au niveau racinaire.', false);

  // Foliar (no current program)
  h += channelHeader('Foliaire', 'Programme retiré 2026-04');
  h += '<div style="font-size:11.5px; color:var(--text-muted); padding:6px 0;">Pas de spray foliaire actif sur Salanova (cycle court 14 j, fenêtre d\'application limitée). Mn / Zn / B sans canal de livraison à pH 7,4. À revisiter quand pH baisse sous 6,5 ; en attendant, la foliaire Solubore + ZnSO₄/MnSO₄ peut être réintroduite événementiellement si symptômes visibles.</div>';

  // Conditions for becoming official
  h += channelHeader('Conditions pour devenir officielle', '');
  h += '<div style="padding:10px 12px; background:var(--input-bg); border-left:2px solid var(--border); border-radius:0 var(--radius-sm) var(--radius-sm) 0; font-family:\'DM Mono\',monospace; font-size:11px; line-height:1.7; color:var(--text-muted);">'
    +   '✗ Test foliaire laitue — confirme la couverture macros + statut micros<br>'
    +   '✗ SME laitue retest 4-6 sem — confirme trajectoire banque K/Mg/Fe<br>'
    +   '✗ Décision yucca — si réversée, foliaire micros peut reprendre'
    + '</div>';

  return h;
}

// Lever advice per element for the Salanova subpage. Auto-derived from
// element identity + pH state. Kept short so the Block 5 grid stays readable.
function lettuceLeverFor(element, phLocked) {
  if (element === 'N') {
    return 'Augmenter le front-load (farine de plumes) OU ajouter du poisson hydrolysé Acadie 2-4-0.5 à la fertigation (1-2 mL/L stock). Bypass quasi immédiat (1-3 jours) vs farine (1-2 sem). <strong>N est le plus gros gap structurel</strong> tant que la fertigation reste sans N.';
  }
  if (element === 'P') {
    return phLocked
      ? 'Lockout pH — soufre élémentaire à la planche (programme en cours). Pas d\'apport supplémentaire de P (banque Mehlich 678 kg/ha déjà saturée).'
      : 'Le bank Mehlich devrait suivre une fois le pH baissé. Pas d\'apport supplémentaire.';
  }
  if (element === 'Ca') {
    return 'Sol Ca-saturé — pas d\'apport. Si la cinétique de translocation devient limitante (tip-burn), gérer par climat (VPD, ventilation) plutôt que par apport.';
  }
  if (element === 'K' || element === 'Mg') {
    return 'Déjà luxe via fertigation actuelle ; ne pas augmenter.';
  }
  if (element === 'Fe') {
    return 'Programme actuel : nursery loading + FeSO₄ 7,5 g/100m²/sem (efficacité ~15% à pH 7,4). Foliaire Fe-EDDHA pourrait combler à court terme ; soufre + chute pH = solution durable.';
  }
  if (element === 'Mn' || element === 'Zn') {
    return `<strong>Aucun canal de livraison</strong> à pH 7,4 (lockout sol + foliaire laitue retiré). Réintroduire foliaire ${element}SO₄ pour les laitues tant que pH ≥ 6,5. À revisiter quand le soufre baisse le pH.`;
  }
  if (element === 'B') {
    return 'Bore Mehlich vide (<0,1 ppm) — amendement bore prévu sur la page Sol (déclenché à pH < 7). En attendant : foliaire Solubore avec spray laitue.';
  }
  if (element === 'Cu' || element === 'Mo') {
    return 'Demande absolue petite ; banque sol comble probablement. Surveiller au tissue test.';
  }
  return '';
}
