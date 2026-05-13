// Foliar-recipe test fixture — boots dist/index.html into jsdom once and
// exposes the page-level globals used by the spec tests (FoliarRecipeTomato,
// STORED_RECIPE, PRODUCT_PCT, predictedCE, calcNutrSupply, etc.).
//
// Why dist/index.html: the foliar model (calc.js / data.js / model.js) reads
// top-level constants declared in app/index.html (TOMATO_NUM_BEDS,
// PRODUCT_PCT, STORED_RECIPE, predictedCE) and exposes its public surface via
// window.FoliarRecipeTomato. Loading the assembled page is the only way to
// run the actual integrated functions without re-implementing the page's
// global scope. Mirrors the bootstrap pattern from scripts/check-recipes.mjs.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..', '..');
const INDEX_HTML_PATH = join(REPO_ROOT, 'dist', 'index.html');

// Names to copy from the page's script scope onto window, so tests can read
// them via the `window` object jsdom returns. Matches the subset
// scripts/check-recipes.mjs uses for foliar-related assertions.
const EXPOSE_NAMES = [
  'TOMATO_NUM_BEDS', 'TOMATO_BED_AREA',
  'PRODUCT_PCT', 'STORED_RECIPE',
  'TOMATO_FRUIT_EXPORT', 'RECIPE_INPUTS',
  'FP_RECIPE_T5',
  'FOLIAR_COVERAGE_DEFAULT', 'FOLIAR_COVERAGE_WITH_YUCCA',
  'BURN_CAP_BASE_G', 'burnCapG',
  'computeFoliarSupply', 'computeFoliarRecipeForGap',
  'predictedCE',
  'calcNutrSupply',
  // CompostContribution exposes the per-week release map FP foliar consumes
  // through the gap chain. REQ-116 mutates CC.releasePerWeek.Mn to verify
  // FP_RECIPE_T5.foliar.MnSO4 drops to 0 when the pre-foliar gap closes.
  'CompostContribution',
];

let cachedWindow = null;

export function loadFoliarFixture() {
  if (cachedWindow) return cachedWindow;
  if (!existsSync(INDEX_HTML_PATH)) {
    throw new Error(`dist/index.html missing at ${INDEX_HTML_PATH}; run "npm run build" first`);
  }
  const rawHtml = readFileSync(INDEX_HTML_PATH, 'utf8');

  const exposeScript = `<script>
    try {
      ${EXPOSE_NAMES.map(n => `if (typeof ${n} !== 'undefined') window.${n} = ${n};`).join('\n      ')}
      window.__FIXTURE_LOADED__ = true;
    } catch (e) { window.__FIXTURE_ERR__ = String(e); }
  </script>`;
  const bodyClose = '</body>';
  const idx = rawHtml.lastIndexOf(bodyClose);
  const instrumentedHtml = idx >= 0
    ? rawHtml.slice(0, idx) + exposeScript + rawHtml.slice(idx)
    : rawHtml + exposeScript;

  // Silence page runtime errors (history.json fetch etc.) — tests own the
  // assertion output.
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', () => {});
  virtualConsole.on('error', () => {});
  virtualConsole.on('warn', () => {});
  virtualConsole.on('log', () => {});

  const dom = new JSDOM(instrumentedHtml, {
    url: 'http://localhost/index.html',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
  });
  cachedWindow = dom.window;
  if (!cachedWindow.__FIXTURE_LOADED__) {
    throw new Error('foliar fixture: page script did not reach exposeScript — '
      + (cachedWindow.__FIXTURE_ERR__ || 'no error captured'));
  }
  return cachedWindow;
}

// Helper used by REQ-115 + REQ-116 tests — same shape as
// STORED_RECIPE.tomato.foliaire.A label-string array, derived from a recipe
// object returned by computeFoliarRecipeForGap.
export function recipeAsLabelArray(recipe) {
  return [
    { name: 'MnSO₄ (31,5 % Mn)',     master: recipe.MnSO4_g + ' g' },
    { name: 'ZnSO₄ (35,5 % Zn)',     master: recipe.ZnSO4_g + ' g' },
    { name: 'CuSO₄ (25 % Cu)',       master: recipe.CuSO4_g + ' g' },
    { name: 'FeSO₄·7H₂O (20 % Fe)',  master: recipe.FeSO4_g + ' g' },
    { name: 'NaMolybdate (39,6 % Mo)', master: recipe.NaMoO4_g + ' g' },
    { name: 'Solubore (20,5 % B)',     master: recipe.Solubore_g + ' g' },
  ];
}
