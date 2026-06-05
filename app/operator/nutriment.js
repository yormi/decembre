// Operator chrome — Nutrition page integrator-level dispatch + listener wiring +
// audit-trail snapshot helper + footer init.
//
// Crop-specific renderers live in nutrition/<crop>/app/logic.js; this file owns
// only the cross-crop glue (nutrCrop state + setNutrCrop button handler +
// buildNutriment dispatcher + DOM input listeners + the
// captureCurrentSnapshot() console helper for /retire-recipe).

// Page-local crop state for the Nutrition page (independent of currentCrop —
// like diagCrop on the Diagnostic page). Drives which sub-content (tomato vs
// salanova) renders. Routed via CROP_PAGES['nutriment'].
let nutrCrop = 'tomato';

// Top-level Nutrition page dispatch. Picks the crop-specific page builder
// based on the current `nutrCrop` toggle. Tomato uses the stage-driven Bilan
// (nutrition/tomato/shell/logic.js); Salanova uses the continuous post-transplant
// model (nutrition/lettuce/app/logic.js); Semis uses the per-tray nursery
// model (nutrition/nursery/app/logic.js). Each crop's logic.js is single-
// purpose — the dispatch lives here at the integrator boundary.
function buildNutriment() {
  if (nutrCrop === 'lettuce') {
    buildNutrimentLettuce();
    return;
  }
  if (nutrCrop === 'nursery') {
    buildNutrimentNursery();
    return;
  }
  buildNutrimentTomato();
}

// Switch between Tomate / Salanova / Semis laitue on the Nutrition page.
function setNutrCrop(crop) {
  nutrCrop = crop;
  const tomBtn = document.getElementById('nutr-crop-tomato');
  const letBtn = document.getElementById('nutr-crop-lettuce');
  const nurBtn = document.getElementById('nutr-crop-nursery');
  if (tomBtn) tomBtn.className = crop === 'tomato'  ? 'crop-btn active-tomato'  : 'crop-btn';
  if (letBtn) letBtn.className = crop === 'lettuce' ? 'crop-btn active-lettuce' : 'crop-btn';
  if (nurBtn) nurBtn.className = crop === 'nursery' ? 'crop-btn active-lettuce' : 'crop-btn';
  const tomDiv = document.getElementById('nutr-tomato-content');
  const letDiv = document.getElementById('nutr-lettuce-content');
  const nurDiv = document.getElementById('nutr-nursery-content');
  if (tomDiv) tomDiv.style.display = crop === 'tomato'  ? 'block' : 'none';
  if (letDiv) letDiv.style.display = crop === 'lettuce' ? 'block' : 'none';
  if (nurDiv) nurDiv.style.display = crop === 'nursery' ? 'block' : 'none';
  if (typeof syncHash === 'function') syncHash();
  syncNutrRecipeModeUI();
  buildNutriment();
}

// captureCurrentSnapshot() — workflow helper, call from the browser console:
//   copy(JSON.stringify(captureCurrentSnapshot(), null, 2))
// Captures the live applied recipe across all 3 channels — all three are now
// hand-stored constants under STORED_RECIPE.tomato:
//   - fertigation: STORED_RECIPE.tomato.fertigation (hand-stored current values; PA Taillon = FP target, not STORED)
//   - sidedress:   STORED_RECIPE.tomato.sidedress
//   - foliaire:    STORED_RECIPE.tomato.foliaire
// Returns a deep clone via structuredClone so subsequent edits to the live
// constant don't mutate the snapshot. Paste into a new RECIPE_HISTORY entry's
// `fullSnapshot` BEFORE editing any of the three. Not auto-invoked —
// future-maintainer convenience.
function captureCurrentSnapshot() {
  return structuredClone(STORED_RECIPE.tomato);
}

// Wire Bilan inputs (page is hidden by default; listeners are cheap to attach)
['nutr-target','nutr-solar-per-gram','nutr-phlocked',
 'nutr-foliar-surfactant',
 'nutr-l-transplant','nutr-l-target','nutr-l-days','nutr-l-density',
 'nutr-l-phlocked',
 'nutr-n-target','nutr-n-days','nutr-n-cells','nutr-n-trays','nutr-n-applications'].forEach(id => {
  const element = document.getElementById(id);
  if (element) element.addEventListener('input', buildNutriment);
});
// Checkbox elements only fire 'change' reliably on toggle, not 'input',
// in some older WebKit paths. Wire 'change' too for the surfactant box.
const surfBox = document.getElementById('nutr-foliar-surfactant');
if (surfBox) surfBox.addEventListener('change', buildNutriment);
document.querySelectorAll('[data-nstage]').forEach(b => {
  b.addEventListener('click', () => setNutrStage(b.dataset.nstage));
});

// Footer: show last published update date from history.json. Guarded for
// jsdom (no fetch in default config) — runtime browsers always have fetch,
// jsdom throws ReferenceError mid-script without the guard and aborts
// every downstream declaration (PAGES TDZ in operator/logic.js init block).
if (typeof fetch === 'function') {
  fetch('history.json?_=' + Date.now())
    .then(r => r.ok ? r.json() : [])
    .then(h => {
      if (h.length > 0) {
        const element = document.getElementById('last-update');
        if (element) element.textContent = 'Mis à jour le ' + (h[0].date_fr || h[0].date) + ' · ';
      }
    })
    .catch(() => {});
}
