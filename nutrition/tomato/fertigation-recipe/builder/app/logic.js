// Fertigation-recipe — builder predicted-CE / predicted-pH chips.
//
// Spec slugs (nutrition/spec.md):
//   - predicted-ph-ce-shown-on-builder-blocks
//   - predicted-ph-ce-clickable-modal
//   - predicted-ph-ce-coloured-by-band-position
//
// Renders two chips inside #nutr-fert showing the predicted tank pH and
// predicted dripper CE for the currently-rendered fertigation recipe. Each
// chip is clickable and opens a modal that names the measurement point
// (water at the dripper), how the blue Bluelab pen maps to that point, and
// the safe band for the current crop and stage.
//
// Safe bands (nutrition/chemistry/spec.md):
//   - CE at dripper, tomato T1-T2: 1.5 – 2.5 mS/cm; T3-T5: 2.0 – 3.0 mS/cm (predicted-ce-within-crop-stage-band)
//   - pH at dripper compartment:   5.5 – 7.0 (predicted-tank-ph-within-envelope)
//
// Tank geometry (procedure/stored.js): 170 L master tank, Dosatron 2 % →
// dilution 0.02. Predicted-CE / predicted-pH are pure functions over the
// in-tank g/L map (nutrition/chemistry/model/predicted.js).

// Tomato fertigation tank constants — single source for the chip math.
const FERTIGATION_TANK_VOLUME_L = 170;
const FERTIGATION_DOSATRON_DILUTION = 0.02;

// Safe-band lookup per stage. T1-T2 share the early band; T3-T5 share the
// late band. pH band is stage-independent at the dripper compartment.
function fertigationCeBandForStage(stage) {
  if (stage === 'T1' || stage === 'T2') return { low: 1.5, high: 2.5 };
  return { low: 2.0, high: 3.0 };
}
const FERTIGATION_PH_BAND = { low: 5.5, high: 7.0 };

// Classify a value against a band:
//   inside  — strictly inside, more than 10 % of band width from each edge
//   edge    — within the 10 % edge zone (either side)
//   outside — below low or above high
function classifyAgainstBand(value, low, high) {
  if (!(value >= low && value <= high)) return 'outside';
  const width = high - low;
  const edge = width * 0.10;
  if (value - low <= edge || high - value <= edge) return 'edge';
  return 'inside';
}

// Map band-position → operator-facing colour. Green inside, yellow edge,
// red outside. Inline style keeps the chip self-contained (no extra CSS
// file to wire into the build).
function bandPositionColor(position) {
  if (position === 'inside')  return '#1e6b2d';   // green
  if (position === 'edge')    return '#a37a00';   // yellow / amber
  return '#8a3e1e';                                // red
}

// Build the g/L-in-tank recipe map that predictedCE / predictedTankPh
// consume. Keys MUST match the PRODUCT registry (nutrition/chemistry/model/products.js).
// `r` is the supply.raw from buildNutrimentTomato — already carries weekly
// total grams per product (r.k_g_total, r.mg_g_total, etc.).
function tankRecipeFromSupplyRaw(r) {
  const out = {};
  if (r && r.k_g_total)  out['K2SO4']      = r.k_g_total  / FERTIGATION_TANK_VOLUME_L;
  if (r && r.mg_g_total) out['MgSO4-7H2O'] = r.mg_g_total / FERTIGATION_TANK_VOLUME_L;
  // Solubore only enters the fertigation tank in FP mode (replenishment-cascade-earliest-first single-channel B at T5);
  // STORED mode keeps B foliar-only and r.sb_fert_g is 0 there.
  if (r && r.sb_fert_g)  out['Solubore']   = r.sb_fert_g  / FERTIGATION_TANK_VOLUME_L;
  return out;
}

// Lazy-create a single hidden modal element. Returns the same node on
// repeated calls so click handlers can re-populate + re-show it.
function ensurePredictedModal(kind) {
  const attr = `data-modal="predicted-${kind}"`;
  let modal = document.querySelector(`[${attr}]`);
  if (modal) return modal;
  modal = document.createElement('div');
  modal.setAttribute('data-modal', `predicted-${kind}`);
  modal.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); '
    + 'background:#fff; border:1px solid #cfd6dc; border-radius:8px; padding:16px 18px; '
    + 'box-shadow:0 8px 24px rgba(0,0,0,0.18); max-width:420px; z-index:1000; display:none; '
    + 'font-size:13px; line-height:1.5; color:#1c2730;';
  modal.addEventListener('click', function (event) {
    if (event.target === modal) modal.style.display = 'none';
  });
  document.body.appendChild(modal);
  return modal;
}

function openPredictedPhModal(predictedValue, band) {
  const modal = ensurePredictedModal('ph');
  modal.innerHTML =
    `<div style="font-weight:600; font-size:14px; margin-bottom:8px;">pH prévu — eau au goutteur</div>`
    + `<div style="margin-bottom:8px;"><strong>Valeur prévue : ${predictedValue.toFixed(1)}</strong></div>`
    + `<div style="margin-bottom:8px;">Point de mesure : <strong>eau au goutteur</strong> `
    + `(dripper) — compartiment irrigation après injection Dosatron.</div>`
    + `<div style="margin-bottom:8px;">Stylo Bluelab pH (bleu) : mesurer directement l'eau qui sort `
    + `d'un goutteur en début de cycle. La valeur prévue est ce que le stylo bleu doit lire.</div>`
    + `<div>Bande sûre (irrigation au goutteur) : <strong>${band.low.toFixed(1)} – ${band.high.toFixed(1)}</strong>.</div>`
    + `<div style="margin-top:10px; text-align:right;"><button type="button" `
    + `data-modal-close style="font-size:12px; padding:4px 10px; cursor:pointer;">Fermer</button></div>`;
  modal.style.display = 'block';
  const close = modal.querySelector('[data-modal-close]');
  if (close) close.addEventListener('click', function () { modal.style.display = 'none'; });
}

function openPredictedCeModal(predictedValue, band, stage) {
  const modal = ensurePredictedModal('ce');
  modal.innerHTML =
    `<div style="font-weight:600; font-size:14px; margin-bottom:8px;">CE prévue — eau au goutteur</div>`
    + `<div style="margin-bottom:8px;"><strong>Valeur prévue : ${predictedValue.toFixed(2)} mS/cm</strong></div>`
    + `<div style="margin-bottom:8px;">Point de mesure : <strong>eau au goutteur</strong> `
    + `(dripper) — compartiment irrigation après injection Dosatron 2 %.</div>`
    + `<div style="margin-bottom:8px;">Stylo Bluelab CE (bleu) : mesurer directement l'eau qui sort `
    + `d'un goutteur. La valeur prévue est ce que le stylo bleu doit lire.</div>`
    + `<div>Bande sûre tomate ${stage} (irrigation au goutteur) : `
    + `<strong>${band.low.toFixed(1)} – ${band.high.toFixed(1)} mS/cm</strong>.</div>`
    + `<div style="margin-top:10px; text-align:right;"><button type="button" `
    + `data-modal-close style="font-size:12px; padding:4px 10px; cursor:pointer;">Fermer</button></div>`;
  modal.style.display = 'block';
  const close = modal.querySelector('[data-modal-close]');
  if (close) close.addEventListener('click', function () { modal.style.display = 'none'; });
}

// Append the two predicted chips into #nutr-fert and wire click handlers.
// Called from nutrition/tomato/shell/logic.js right after the fertigation
// block's innerHTML is written.
function renderFertigationPredictedChips(supplyRaw, stage) {
  const block = document.getElementById('nutr-fert');
  if (!block) return;
  const tankRecipe = tankRecipeFromSupplyRaw(supplyRaw);
  const ceValue = (typeof predictedCE === 'function')
    ? predictedCE(tankRecipe, FERTIGATION_DOSATRON_DILUTION) : 0;
  const phValue = (typeof predictedTankPh === 'function')
    ? predictedTankPh(tankRecipe) : 7.0;
  const ceBand = fertigationCeBandForStage(stage);
  const phBand = FERTIGATION_PH_BAND;
  const cePosition = classifyAgainstBand(ceValue, ceBand.low, ceBand.high);
  const phPosition = classifyAgainstBand(phValue, phBand.low, phBand.high);
  const ceColor = bandPositionColor(cePosition);
  const phColor = bandPositionColor(phPosition);

  const chipsWrapper = document.createElement('div');
  chipsWrapper.setAttribute('data-fertigation-predicted', '');
  chipsWrapper.style.cssText = 'display:flex; gap:12px; flex-wrap:wrap; font-size:12px; '
    + 'margin-top:10px; padding:8px 0; border-top:1px solid #e6e9ec;';
  chipsWrapper.innerHTML =
    `<span>pH cuve prévu (au goutteur) : `
    + `<strong data-predicted="ph" data-band-position="${phPosition}" `
    + `style="color:${phColor}; cursor:pointer; text-decoration:underline dotted;">`
    + `${phValue.toFixed(1)}</strong></span>`
    + `<span>CE prévue (au goutteur) : `
    + `<strong data-predicted="ce" data-band-position="${cePosition}" `
    + `style="color:${ceColor}; cursor:pointer; text-decoration:underline dotted;">`
    + `${ceValue.toFixed(2)} mS/cm</strong></span>`;
  block.appendChild(chipsWrapper);

  const phNode = block.querySelector('[data-predicted="ph"]');
  if (phNode) {
    phNode.addEventListener('click', function () {
      openPredictedPhModal(phValue, phBand);
    });
  }
  const ceNode = block.querySelector('[data-predicted="ce"]');
  if (ceNode) {
    ceNode.addEventListener('click', function () {
      openPredictedCeModal(ceValue, ceBand, stage);
    });
  }
}

// Browser-globals export — shell/logic.js calls this after writing
// #nutr-fert innerHTML.
window.FertigationBuilder = { renderFertigationPredictedChips };
