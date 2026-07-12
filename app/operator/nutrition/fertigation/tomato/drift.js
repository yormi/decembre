// Tomato fertigation-recipe — Block 7 drift gauge renderer.
//
// Renders the stored-vs-first-principles drift table consumed by the Bilan
// admin page (#nutr-phase1). Pulls stored doses from
// STORED_RECIPE.tomato.{fertigation, sidedress, foliaire} (live operational
// state — what the team weighs) and FP target from FP_RECIPE_T5 +
// computeStageRecipe (mass-balance derivation). Color-codes 5% / 30% / >30%.
// T5 only — other stages render a placeholder pointing at Recette proposée.
// The drift is genuine: STORED_RECIPE.tomato.fertigation is hand-stored at
// its current weighed values (Haifa-heritage at kSulfate / mgSulfate; PA
// Taillon recommendation anchors the FP target, not STORED), while
// computeStageRecipe is derived from RECIPE_INPUTS via mass-balance.
function renderPhase1Comparison() {
  const stage = nutrStage;
  // Stored recipes summarized as { productName: gramsPerWeekTotal }
  const storedFert = STORED_RECIPE.tomato.fertigation[stage] || { mgSulfate: 0, kSulfate: 0, borax: 0, naMolybdate: 0 };
  const fertStored = {
    'K2SO4':       storedFert.kSulfate * getMultK(),
    'MgSO4-7H2O':  storedFert.mgSulfate * getMultMg(),
    'Solubore':    storedFert.borax || 0,
    'NaMolybdate': storedFert.naMolybdate || 0,
  };
  const sd = STORED_RECIPE.tomato.sidedress[stage];
  // Side-dress is g/planche/wk (NOT total area)
  const sidedressStored = {
    'Actisol-5-3-2': sd.actisol_g,
    'FarinePlumes':  sd.farine_g,
  };
  // Foliar parsed from STORED_RECIPE.tomato.foliaire.A label strings (g per 15 L master tank)
  const A = STORED_RECIPE.tomato.foliaire.A;
  const parseG = function(s) { return parseFloat(String(s).replace(',', '.')) || 0; };
  const find = function(sub) { return A.find(function(x) { return x.name.indexOf(sub) >= 0; }); };
  const foliarStored = {
    'MnSO4':        parseG((find('MnSO₄') || {}).master),
    'ZnSO4':        parseG((find('ZnSO₄') || {}).master),
    'CuSO4':        parseG((find('CuSO₄') || {}).master),
    'Solubore':     parseG((find('Solubore') || {}).master),
    'NaMolybdate':  parseG((find('Molybdate') || {}).master),
    'FeSO4-7H2O':   parseG((find('FeSO₄') || {}).master),
  };

  // stable — framing copy (intro + tier thresholds + table headers) is invariant
  // domain context. Numbers below come from constants (FP_RECIPE_T5 + stored).
  let html = '<div style="font-size:12px; color:var(--text-muted); line-height:1.5; margin-bottom:8px;">'
    + 'Recette stockée actuelle (ce que l\'équipe pèse cette semaine) vs cible premiers principes (Recette proposée — sidedress reframe + plafond demande + contraintes sans yucca). '
    + '<strong>Vert</strong> ≤5 % · <strong>jaune</strong> ≤30 % · <strong>rouge</strong> &gt;30 %. Stade <strong>' + stage + '</strong>.'
    + '</div>';

  // FP recipe is only derived for T5. Other stages get a placeholder.
  if (stage !== 'T5') {
    html += '<div style="padding:10px 12px; background:var(--input-bg); border-radius:var(--radius-sm); font-size:11.5px; color:var(--text-muted); line-height:1.5;">'
      + 'FP non dérivé pour ce stade — voir <strong style="color:var(--text);">Recette proposée</strong> pour T5.'
      + '</div>';
    return html;
  }

  // FP fertigation: prefer FP_RECIPE_T5 override when set; otherwise fall back
  // to computeStageRecipe(stage) (mass-balance derivation from RECIPE_INPUTS).
  // Mirrors the precedence in calculateNutritionSupply's FP branch.
  const fpStage = computeStageRecipe(stage) || { mgSulfate: 0, kSulfate: 0, solubore: 0, naMolybdate: 0 };
  const fertFp      = {
    'K2SO4':       (FP_RECIPE_T5.fertigation['K2SO4']       != null) ? FP_RECIPE_T5.fertigation['K2SO4']       : fpStage.kSulfate,
    'MgSO4-7H2O':  (FP_RECIPE_T5.fertigation['MgSO4-7H2O']  != null) ? FP_RECIPE_T5.fertigation['MgSO4-7H2O']  : fpStage.mgSulfate,
    'Solubore':    (FP_RECIPE_T5.fertigation['Solubore']    != null) ? FP_RECIPE_T5.fertigation['Solubore']    : fpStage.solubore,
    'NaMolybdate': (FP_RECIPE_T5.fertigation['NaMolybdate'] != null) ? FP_RECIPE_T5.fertigation['NaMolybdate'] : fpStage.naMolybdate,
  };
  const sidedressFp = FP_RECIPE_T5.sidedress;
  const foliarFp    = FP_RECIPE_T5.foliar;

  const colorOf = function(stored, fp) {
    if (stored === 0 && fp === 0) return '#9aa3ad';
    if (stored === 0) return '#b03030';
    const ratio = fp / stored;
    const dev = Math.abs(ratio - 1.0);
    if (dev <= 0.05) return '#1e6b2d';
    if (dev <= 0.30) return '#a08020';
    return '#b03030';
  };
  const fmtG = function(g) {
    if (g === 0) return '0 g';
    if (g >= 100) return Math.round(g) + ' g';
    if (g >= 1)   return g.toFixed(1) + ' g';
    return g.toFixed(2) + ' g';
  };
  const row = function(name, stored, fp, unit) {
    let ratioStr;
    if (stored === 0 && fp === 0) ratioStr = '—';
    else if (stored === 0)        ratioStr = '∞';
    else if (fp === 0)            ratioStr = '0 %';
    else                          ratioStr = (fp / stored * 100).toFixed(0) + ' %';
    return '<tr style="border-bottom:1px solid var(--border);">'
      + '<td style="padding:4px 8px; font-weight:600;">' + name + '</td>'
      + '<td style="padding:4px 8px; font-family:\'DM Mono\',monospace; text-align:right;">' + fmtG(stored) + ' ' + unit + '</td>'
      + '<td style="padding:4px 8px; font-family:\'DM Mono\',monospace; text-align:right;">' + fmtG(fp) + ' ' + unit + '</td>'
      + '<td style="padding:4px 8px; font-family:\'DM Mono\',monospace; text-align:right; color:' + colorOf(stored, fp) + '; font-weight:600;">' + ratioStr + '</td>'
      + '</tr>';
  };
  const section = function(title, stored, fp, unit) {
    let h = '<div style="margin-top:14px; font-weight:700; font-size:12.5px;">' + title + '</div>'
      + '<table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:4px;">'
      + '<thead><tr style="text-align:left; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">'
      + '<th style="padding:4px 8px;">Produit</th>'
      + '<th style="padding:4px 8px; text-align:right;">Stocké</th>'
      + '<th style="padding:4px 8px; text-align:right;">FP</th>'
      + '<th style="padding:4px 8px; text-align:right;">Ratio</th>'
      + '</tr></thead><tbody>';
    const all = new Set(Object.keys(stored).concat(Object.keys(fp)));
    all.forEach(function(name) {
      h += row(name, stored[name] || 0, fp[name] || 0, unit);
    });
    h += '</tbody></table>';
    return h;
  };

  html += section('Fertigation (g/sem · ' + (TOMATO_NUMBER_BEDS * TOMATO_BED_AREA).toFixed(0) + ' m²)', fertStored, fertFp, '');
  html += section('Engrais sol granulaire (g/planche/sem · 54,7 m²)', sidedressStored, sidedressFp, '');
  html += section('Foliaire (g par 15 L master)', foliarStored, foliarFp, '');
  return html;
}
