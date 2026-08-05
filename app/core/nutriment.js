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
// based on the current `nutrCrop` toggle. Tomato is an Elm island
// (app/admin/nutrition/bilan/tomato/ — self-rendering, nothing to call);
// tomato.backup is the legacy stage-driven Bilan
// (app/admin/nutrition/bilan/tomato.backup/logic.js); Salanova uses the continuous
// post-transplant model (app/admin/nutrition/bilan/lettuce/logic.js); Semis uses
// the per-tray nursery model (app/admin/nutrition/bilan/nursery/logic.js).
function buildNutriment() {
  if (nutrCrop === 'lettuce') {
    buildNutrimentLettuce();
    return;
  }
  if (nutrCrop === 'nursery') {
    buildNutrimentNursery();
    return;
  }
  if (nutrCrop === 'tomato.backup') {
    buildNutrimentTomato();
    return;
  }
  // 'tomato' — Elm island, reactive on its own inputs.
}

// Switch between Tomate / Tomates (backup) / Salanova / Semis laitue.
const NUTR_CROP_UI = {
  'tomato':        { button: 'nutr-crop-tomato',        active: 'active-tomato',  container: 'nutr-tomato-content' },
  'tomato.backup': { button: 'nutr-crop-tomato-backup', active: 'active-tomato',  container: 'nutr-tomato-backup-content' },
  'lettuce':       { button: 'nutr-crop-lettuce',       active: 'active-lettuce', container: 'nutr-lettuce-content' },
  'nursery':       { button: 'nutr-crop-nursery',       active: 'active-lettuce', container: 'nutr-nursery-content' },
};
function setNutrCrop(crop) {
  nutrCrop = crop;
  for (const key in NUTR_CROP_UI) {
    const ui = NUTR_CROP_UI[key];
    const btn = document.getElementById(ui.button);
    if (btn) btn.className = key === crop ? 'crop-btn ' + ui.active : 'crop-btn';
    const div = document.getElementById(ui.container);
    if (div) div.style.display = key === crop ? 'block' : 'none';
  }
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
['nutr-target','nutr-solar-per-gram',
 'nutr-foliar-surfactant',
 'nutr-l-transplant','nutr-l-target','nutr-l-days','nutr-l-density',
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
