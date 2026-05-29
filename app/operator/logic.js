function setCrop(crop) {
  // Nursery is valid on Fertigation and Irrigation pages (not Foliaire).
  // If user is on Foliaire and somehow triggers nursery, force them to Fertigation.
  if (crop === 'nursery' && currentPage === 'foliar') {
    currentPage = 'fertigation';
  }

  currentCrop = crop;

  // Update all sub-toggle button states across all pages
  // Fertigation page: 3 buttons (tomato, lettuce, nursery)
  setCropBtn('fert-crop-tomato', crop === 'tomato', 'tomato');
  setCropBtn('fert-crop-lettuce', crop === 'lettuce', 'lettuce');
  setCropBtn('fert-crop-nursery', crop === 'nursery', 'nursery');
  // Foliar page: 2 buttons (no nursery)
  setCropBtn('foliar-crop-tomato', crop === 'tomato', 'tomato');
  setCropBtn('foliar-crop-lettuce', crop === 'lettuce', 'lettuce');
  // Irrigation page: 3 buttons (tomato, lettuce, nursery — nursery has its own seedling watering guide)
  setCropBtn('irr-crop-tomato', crop === 'tomato', 'tomato');
  setCropBtn('irr-crop-lettuce', crop === 'lettuce', 'lettuce');
  setCropBtn('irr-crop-nursery', crop === 'nursery', 'nursery');
  // Sol page: 1 button (tomato-only since 2026-05-28 — Salanova sol removed).
  setCropBtn('sol-crop-tomato', crop === 'tomato', 'tomato');

  const isField = crop === 'tomato' || crop === 'lettuce';

  // Toggle field vs nursery content inside the fertigation page
  document.getElementById('fert-field-content').style.display = isField ? 'block' : 'none';
  document.getElementById('fert-nursery-content').style.display = crop === 'nursery' ? 'block' : 'none';

  // Toggle field vs nursery content inside the irrigation page
  document.getElementById('irr-field-content').style.display = isField ? 'block' : 'none';
  document.getElementById('irr-nursery-content').style.display = crop === 'nursery' ? 'block' : 'none';

  // Sol page is tomato-only (Salanova sol page removed 2026-05-28 — no
  // STORED.lettuce.sidedress; soufre / bore / Ecocert cards retired).
  const solTomato = document.getElementById('sol-tomato-content');
  if (solTomato) solTomato.style.display = crop === 'tomato' ? 'block' : 'none';

  // Set accent color CSS variables
  const r = document.documentElement.style;
  if (crop === 'tomato') {
    r.setProperty('--accent-active', 'var(--accent-tomato)');
    r.setProperty('--accent-active-light', 'var(--accent-tomato-light)');
    r.setProperty('--accent-active-border', 'var(--accent-tomato-border)');
  } else if (crop === 'lettuce') {
    r.setProperty('--accent-active', 'var(--accent-lettuce)');
    r.setProperty('--accent-active-light', 'var(--accent-lettuce-light)');
    r.setProperty('--accent-active-border', 'var(--accent-lettuce-border)');
  } else {
    r.setProperty('--accent-active', 'var(--accent-nursery)');
    r.setProperty('--accent-active-light', 'var(--accent-nursery-light)');
    r.setProperty('--accent-active-border', 'var(--accent-nursery-border)');
  }


  if (isField) {
    // Field-crop-only cards visibility (only present in field-content)
    const stageCard = document.getElementById('stage-card');
    const lettuceNoteCard = document.getElementById('lettuce-note-card');
    const vigorCard = document.getElementById('vigor-card');
    if (stageCard) stageCard.style.display = crop === 'tomato' ? 'block' : 'none';
    if (lettuceNoteCard) lettuceNoteCard.style.display = crop === 'lettuce' ? 'block' : 'none';
    if (vigorCard) vigorCard.style.display = crop === 'tomato' ? 'block' : 'none';

    // Lettuce uses fixed 'normal' vigor — no slider needed for a 2-week cycle
    if (crop === 'lettuce') currentVigor = 'normal';
    recalc();
    buildFoliar();
  } else {
    recalcNursery();
  }
  syncHash();
}

// Helper: set active class on a crop button based on which crop it represents
function setCropBtn(id, isActive, cropType) {
  const element = document.getElementById(id);
  if (!element) return;
  if (isActive) {
    element.className = 'crop-btn active-' + cropType;
  } else {
    element.className = 'crop-btn';
  }
}

function setVigor(v) {
  currentVigor = v;
  document.querySelectorAll('[data-vigor]').forEach(b => b.classList.toggle('active', b.dataset.vigor === v));
  buildTensio();
}

function setPage(page) {
  // Foliaire doesn't support nursery or lettuce — auto-fallback to tomato.
  // Lettuce foliar removed (Fe moved to nursery fertigation).
  // Irrigation supports nursery (seedling watering guide).
  // Diagnostic has its own crop state (diagCrop), independent of currentCrop.
  // Set currentPage before any nested setCrop so syncHash sees the new page.
  currentPage = page;
  if (page === 'foliar' && (currentCrop === 'nursery' || currentCrop === 'lettuce')) {
    setCrop('tomato');
  }
  // Sol page is tomato-only (Salanova / nursery don't apply — Salanova page
  // removed 2026-05-28; nursery uses seedling watering, not field amendments).
  if (page === 'sol' && currentCrop !== 'tomato') {
    setCrop('tomato');
  }
  // Subtle text-only Semaine + Diagnostic buttons: darken color when active
  const weekBtn = document.getElementById('page-week');
  weekBtn.style.color = page === 'week' ? 'var(--text)' : 'var(--text-muted)';
  weekBtn.style.fontWeight = page === 'week' ? '600' : '500';
  const diagBtn = document.getElementById('page-diagnostic');
  diagBtn.style.color = page === 'diagnostic' ? 'var(--text)' : 'var(--text-muted)';
  diagBtn.style.fontWeight = page === 'diagnostic' ? '600' : '500';
  document.getElementById('page-irrigation').className = page === 'irrigation' ? 'page-btn active' : 'page-btn';
  document.getElementById('page-fertigation').className = page === 'fertigation' ? 'page-btn active' : 'page-btn';
  document.getElementById('page-sol').className = page === 'sol' ? 'page-btn active' : 'page-btn';
  document.getElementById('page-foliar').className = page === 'foliar' ? 'page-btn active' : 'page-btn';
  document.getElementById('page-week-content').style.display = page === 'week' ? 'block' : 'none';
  document.getElementById('page-irrigation-content').style.display = page === 'irrigation' ? 'block' : 'none';
  document.getElementById('page-fertigation-content').style.display = page === 'fertigation' ? 'block' : 'none';
  document.getElementById('page-sol-content').style.display = page === 'sol' ? 'block' : 'none';
  document.getElementById('page-foliar-content').style.display = page === 'foliar' ? 'block' : 'none';
  document.getElementById('page-diagnostic-content').style.display = page === 'diagnostic' ? 'block' : 'none';
  document.getElementById('page-nutriment-content').style.display = page === 'nutriment' ? 'block' : 'none';
  document.getElementById('page-historique-nutriments-content').style.display = page === 'historique-nutriments' ? 'block' : 'none';
  document.getElementById('page-rendement-content').style.display = page === 'rendement' ? 'block' : 'none';
  // Highlight the active admin tool button
  const nutrBtn = document.getElementById('page-nutriment');
  nutrBtn.style.color = page === 'nutriment' ? 'var(--text)' : 'var(--text-muted)';
  nutrBtn.style.fontWeight = page === 'nutriment' ? '600' : '500';
  const histBtn = document.getElementById('page-historique-nutriments');
  histBtn.style.color = page === 'historique-nutriments' ? 'var(--text)' : 'var(--text-muted)';
  histBtn.style.fontWeight = page === 'historique-nutriments' ? '600' : '500';
  const rendBtn = document.getElementById('page-rendement');
  if (rendBtn) {
    rendBtn.style.color = page === 'rendement' ? 'var(--text)' : 'var(--text-muted)';
    rendBtn.style.fontWeight = page === 'rendement' ? '600' : '500';
  }
  // Hide the main 3-page toggle on tool/admin pages. The ℹ icon (admin-only,
  // top-left of the header) is the back-nav primitive that returns to the
  // operational pages from any admin/tool view.
  document.getElementById('page-toggle').style.display = (page === 'week' || page === 'diagnostic' || page === 'nutriment' || page === 'historique-nutriments' || page === 'rendement') ? 'none' : 'flex';
  if (page === 'foliar') buildFoliar();
  if (page === 'week') buildWeek();
  if (page === 'nutriment') buildNutriment();
  if (page === 'historique-nutriments') buildHistoriqueNutriments();
  if (page === 'rendement') buildYieldRange();
  if (page === 'diagnostic') {
    // Apply the diagnostic crop's accent color when entering the page,
    // since it's independent of currentCrop.
    setDiagCrop(diagCrop);
  } else {
    // When leaving a page-local-crop view, restore the global accent.
    setCrop(currentCrop);
  }
  syncHash();
}

// Hash-encoded state: hierarchical, slash-separated. Format:
//   #[admin/]page[/crop]
// Examples: `#irrigation/tomato`, `#admin/diagnostic/lettuce`, `#admin`.
// Default page (fertigation) + default crop (tomato) collapse to `/` (no hash).
// Why: lets hot-reload / bookmarks land on the same page+crop, and keeps
// `admin` orthogonal to navigation rather than buried in a comma list.
const PAGES = ['fertigation','sol','foliar','irrigation','week','diagnostic','nutriment','historique-nutriments','rendement'];
const DEFAULT_PAGE = 'fertigation';
const DEFAULT_CROP = 'tomato';
const ADMIN_PAGES = ['week','diagnostic','nutriment','historique-nutriments','rendement'];
// Pages whose crop is part of the URL. foliar omitted (only tomato is valid;
// the page auto-redirects lettuce/nursery to tomato). Crop comes from
// `currentCrop`, except diagnostic which has its own page-local crop state
// (diagCrop).
const CROP_PAGES = {
  fertigation: ['tomato','lettuce','nursery'],
  irrigation:  ['tomato','lettuce','nursery'],
  sol:         ['tomato','lettuce'],
  diagnostic:  ['tomato','lettuce'],
  nutriment:   ['tomato','lettuce','nursery'],
};
function cropFor(page) {
  if (page === 'diagnostic') return diagCrop;
  if (page === 'nutriment')  return nutrCrop;
  if (CROP_PAGES[page]) return currentCrop;
  return null;
}
function parseHash() {
  const segs = location.hash.replace(/^#/, '').split('/').filter(Boolean);
  const admin = segs[0] === 'admin';
  const rest = admin ? segs.slice(1) : segs;
  const page = PAGES.includes(rest[0]) ? rest[0] : DEFAULT_PAGE;
  const allowed = CROP_PAGES[page] || [];
  const crop = allowed.includes(rest[1]) ? rest[1] : null;
  // Recipe-source segment — only meaningful on the nutriment page. Sanitized to
  // 'fp' | 'stored'; anything else (or missing) leaves recipe = null so the
  // caller falls back to the default ('fp'). FP is T5-only; the initialize block
  // forces nutrStage='T5' when recipe='fp' is restored from the hash.
  const recipe = (page === 'nutriment' && (rest[2] === 'fp' || rest[2] === 'stored'))
    ? rest[2]
    : null;
  return { admin, page, crop, recipe };
}
// Default recipe-source for the Nutrition page. Mirrors `let nutrRecipeMode = 'fp'`
// — kept as a named constant so syncHash and the initialize parser stay in sync.
const DEFAULT_NUTR_RECIPE = 'fp';

function syncHash() {
  const segs = [];
  if (parseHash().admin) segs.push('admin');
  const crop = cropFor(currentPage);
  const pageIsDefault = currentPage === DEFAULT_PAGE;
  const cropIsDefault = !crop || crop === DEFAULT_CROP;
  // Recipe segment lives only on the nutriment page; everything else returns null
  // so the third positional segment is dropped from the hash.
  const recipe = currentPage === 'nutriment' ? nutrRecipeMode : null;
  const recipeIsDefault = !recipe || recipe === DEFAULT_NUTR_RECIPE;
  // Emit page+crop only when something differs from default. Lets `#admin`
  // and `/` both stay clean instead of expanding to `#admin/fertigation/tomato`.
  // The recipe segment piggybacks on the same mechanism: if it's non-default we
  // need to also emit page + crop so the third positional slot has anchors.
  if (!pageIsDefault) {
    segs.push(currentPage);
    if (crop) segs.push(crop);
    else if (!recipeIsDefault) segs.push(DEFAULT_CROP); // placeholder so recipe slot stays positional
    if (!recipeIsDefault) segs.push(recipe);
  } else if (!cropIsDefault) {
    segs.push(currentPage, crop);
    if (!recipeIsDefault) segs.push(recipe);
  } else if (!recipeIsDefault) {
    // page=default + crop=default but recipe non-default — emit full triplet.
    segs.push(currentPage, DEFAULT_CROP, recipe);
  }
  const newHash = segs.length ? '#' + segs.join('/') : '';
  // replaceState (vs assigning location.hash) avoids firing hashchange,
  // which would re-enter setPage in a loop.
  if ((location.hash || '') !== newHash) {
    history.replaceState(null, '', location.pathname + location.search + newHash);
  }
}

// Admin mode: hidden tools (Diagnostic) revealed when URL hash starts with `admin/`.
// Why hash-gated: simplest reversible flag, no auth needed since this is a
// soft separation (everyone sees the URL bar). Bookmark `#admin` to keep it.
function isAdmin() { return parseHash().admin; }
function applyAdminMode() {
  const admin = isAdmin();
  document.getElementById('page-info').style.display = admin ? 'inline-block' : 'none';
  document.getElementById('page-week').style.display = admin ? 'inline-block' : 'none';
  document.getElementById('page-diagnostic').style.display = admin ? 'inline-block' : 'none';
  document.getElementById('page-nutriment').style.display = admin ? 'inline-block' : 'none';
  document.getElementById('page-historique-nutriments').style.display = admin ? 'inline-block' : 'none';
  const rendNavBtn = document.getElementById('page-rendement');
  if (rendNavBtn) rendNavBtn.style.display = admin ? 'inline-block' : 'none';
  document.getElementById('admin-toggle').classList.toggle('is-admin', admin);
  // If the user dropped out of admin mode while on an admin page, send them
  // back to the default operational view.
  if (!admin && ADMIN_PAGES.includes(currentPage)) {
    setPage(DEFAULT_PAGE);
  }
}
// Toggle admin via the footer dot. Built explicitly (not via syncHash) because
// syncHash reads the admin flag *from the URL* — exactly the bit we're flipping.
function toggleAdmin() {
  const wasAdmin = isAdmin();
  const segs = [];
  if (!wasAdmin) segs.push('admin');
  const crop = cropFor(currentPage);
  const pageIsDefault = currentPage === DEFAULT_PAGE;
  const cropIsDefault = !crop || crop === DEFAULT_CROP;
  // Mirror syncHash so toggling admin doesn't drop the nutriment recipe segment.
  const recipe = currentPage === 'nutriment' ? nutrRecipeMode : null;
  const recipeIsDefault = !recipe || recipe === DEFAULT_NUTR_RECIPE;
  if (!pageIsDefault) {
    segs.push(currentPage);
    if (crop) segs.push(crop);
    else if (!recipeIsDefault) segs.push(DEFAULT_CROP);
    if (!recipeIsDefault) segs.push(recipe);
  } else if (!cropIsDefault) {
    segs.push(currentPage, crop);
    if (!recipeIsDefault) segs.push(recipe);
  } else if (!recipeIsDefault) {
    segs.push(currentPage, DEFAULT_CROP, recipe);
  }
  const newHash = segs.length ? '#' + segs.join('/') : '';
  history.replaceState(null, '', location.pathname + location.search + newHash);
  applyAdminMode();
}
window.addEventListener('hashchange', () => {
  applyAdminMode();
  const { page, crop, recipe } = parseHash();
  const allowed = !ADMIN_PAGES.includes(page) || isAdmin();
  if (allowed && page !== currentPage) setPage(page);
  if (crop) {
    if (page === 'diagnostic' && crop !== diagCrop) setDiagCrop(crop);
    else if (page === 'nutriment' && crop !== nutrCrop) setNutrCrop(crop);
    else if (CROP_PAGES[page] && crop !== currentCrop) setCrop(crop);
  }
  // Restore the recipe-source toggle from the hash. setNutrRecipeMode handles
  // the FP→T5 stage snap internally, so we don't need to massage nutrStage here.
  if (page === 'nutriment') {
    const desired = recipe || DEFAULT_NUTR_RECIPE;
    if (desired !== nutrRecipeMode) setNutrRecipeMode(desired);
  }
});

// Init
{
  const initialize = parseHash(); // restore page+crop+recipe from URL (hot-reload / bookmark)
  currentPage = initialize.page;
  if (initialize.crop) {
    if (initialize.page === 'diagnostic') diagCrop = initialize.crop;
    else if (initialize.page === 'nutriment') nutrCrop = initialize.crop;
    else currentCrop = initialize.crop;
  }
  // Restore the Nutrition recipe-source toggle. Sanitization already happened
  // in parseHash (anything non-{fp,stored} → null). Null falls back to the
  // module default (DEFAULT_NUTR_RECIPE = 'fp'). FP requires T5 — when the hash
  // explicitly resolves to 'fp' we force nutrStage='T5' so demand and supply
  // stay stage-consistent regardless of any future stage segment.
  if (initialize.page === 'nutriment') {
    if (initialize.recipe === 'fp' || initialize.recipe === 'stored') nutrRecipeMode = initialize.recipe;
    else nutrRecipeMode = DEFAULT_NUTR_RECIPE;
    if (nutrRecipeMode === 'fp') nutrStage = 'T5';
  }
}
setCrop(currentCrop); // sets up sub-toggle button states + accent colors + visibility
setNutrCrop(nutrCrop); // sets up Nutrition page crop sub-toggle (calls buildNutriment internally)
setPage(currentPage); // shows the right page
renderDiag(); // pre-render the diagnostic page so it's ready when opened
applyAdminMode(); // reveal admin buttons if URL has #admin

// Window-global identifier surface (REQ-005). Inline `onclick=` handlers and
// other scripts reach these via `window.<name>` — classic-script function
// declarations already attach to window, but explicit assignment documents
// the contract.
window.setPage = setPage;
window.setCrop = setCrop;
window.setCropBtn = setCropBtn;
window.setVigor = setVigor;
window.syncHash = syncHash;
window.cropFor = cropFor;
window.toggleAdmin = toggleAdmin;
window.PAGES = PAGES;
window.ADMIN_PAGES = ADMIN_PAGES;
window.CROP_PAGES = CROP_PAGES;
window.DEFAULT_PAGE = DEFAULT_PAGE;
window.DEFAULT_CROP = DEFAULT_CROP;
