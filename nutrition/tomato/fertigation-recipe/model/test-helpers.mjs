// Shared jsdom boot for fertigation-recipe tests.
//
// Loads dist/index.html into jsdom and exposes the runtime constants the
// fertigation model depends on (RECIPE_INPUTS, BIOMASS_DEMAND,
// TOMATO_FRUIT_EXPORT, PRODUCT_PCT, SIDEDRESS_*, STORED_RECIPE,
// TOMATO_NUMBER_BEDS, TOMATO_BED_AREA, FP_RECIPE_T5, computeStageRecipe,
// FIRST_PRINCIPLES_T5_FERTIGATION, plus window.FertigationRecipeTomato
// and window.CompostContribution which are already on window).
//
// Mirrors the instrumentation pattern in scripts/check-recipes.mjs:
// inject a <script> just before </body> that copies the inline `const`
// bindings onto window.__PHASE1__ so node:test code can read them.
//
// Cached at module scope — jsdom init is the slow path (~hundreds of ms).
// Multiple test files in this subproject can share one boot.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const here = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(here, '..', '..', '..', '..');
const INDEX_HTML_PATH = join(REPO_ROOT, 'dist', 'index.html');

// Names this subproject's tests need to read off the page's inline scope.
const EXPOSE_NAMES = [
  'RECIPE_INPUTS',
  'BIOMASS_DEMAND',
  'TOMATO_FRUIT_EXPORT',
  'PRODUCT_PCT',
  'SIDEDRESS_AREA_PER_PLANCHE',
  'SIDEDRESS_MINIMUM_EFFICIENCY',
  'TOMATO_NUMBER_BEDS',
  'TOMATO_BED_AREA',
  'STORED_RECIPE',
  'FP_RECIPE_T5',
  'FIRST_PRINCIPLES_T5_FERTIGATION',
  'PH_UPTAKE_FACTOR_AT_CURRENT_SOIL',
  'computeStageRecipe',
];

let cached = null;

export async function loadAppWindow() {
  if (cached) return cached;

  if (!existsSync(INDEX_HTML_PATH)) {
    throw new Error(
      `dist/index.html not found at ${INDEX_HTML_PATH}. ` +
      `Run \`npm run build\` first.`
    );
  }

  const rawHtml = readFileSync(INDEX_HTML_PATH, 'utf8');

  const exposeScript = `<script>
    try {
      ${EXPOSE_NAMES.map(name =>
        `if (typeof ${name} !== 'undefined') { ` +
        `window.__PHASE1__ = window.__PHASE1__ || {}; ` +
        `window.__PHASE1__.${name} = ${name}; }`
      ).join('\n      ')}
      window.__PHASE1_LOADED__ = true;
    } catch (e) { window.__PHASE1_ERR__ = String(e); }
  </script>`;

  let instrumentedHtml;
  const bodyClose = '</body>';
  const bodyCloseIndex = rawHtml.lastIndexOf(bodyClose);
  if (bodyCloseIndex >= 0) {
    instrumentedHtml = rawHtml.slice(0, bodyCloseIndex)
      + exposeScript
      + rawHtml.slice(bodyCloseIndex);
  } else {
    instrumentedHtml = rawHtml + exposeScript;
  }

  // Silence the page's runtime errors (history.json fetch, etc.) — they fire
  // after our model constants are defined and would otherwise pollute test
  // output.
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

  const { window } = dom;
  if (!window.__PHASE1_LOADED__) {
    throw new Error(
      `Phase 1 globals never populated. __PHASE1_ERR__: ${window.__PHASE1_ERR__}`
    );
  }

  cached = { window, ph1: window.__PHASE1__ || {} };
  return cached;
}
