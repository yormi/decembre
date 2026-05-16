// Shared jsdom boot for sidedress-recipe tests.
//
// Loads dist/index.html into jsdom and exposes the runtime constants the
// sidedress model depends on (RECIPE_INPUTS, BIOMASS_DEMAND,
// TOMATO_FRUIT_EXPORT, PRODUCT_PCT, SIDEDRESS_*, computeStageSidedress,
// window.CompostContribution, window.SidedressRecipeTomato).
//
// Mirrors the instrumentation pattern in scripts/check-recipes.mjs:
// inject a <script> just before </body> that copies the inline `const`
// bindings onto window.__PHASE1__ so node:test code can read them.
//
// This helper exists so multiple test files can share one jsdom boot —
// jsdom init is the slow path (~hundreds of ms). Cached at module scope.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const here = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(here, '..', '..', '..');
const INDEX_HTML_PATH = join(REPO_ROOT, 'dist', 'index.html');

// Names this subproject's tests need to read off the page's inline scope.
const EXPOSE_NAMES = [
  'RECIPE_INPUTS',
  'BIOMASS_DEMAND',
  'TOMATO_FRUIT_EXPORT',
  'PRODUCT_PCT',
  'SIDEDRESS_AREA_PER_PLANCHE',
  'SIDEDRESS_PRODUCTS',
  'SIDEDRESS_MINIMUM_EFFICIENCY',
  'FIRST_PRINCIPLES_SIDEDRESS',
  'computeStageSidedress',
  'STORED_RECIPE',
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
      ${EXPOSE_NAMES.map(n =>
        `if (typeof ${n} !== 'undefined') { ` +
        `window.__PHASE1__ = window.__PHASE1__ || {}; ` +
        `window.__PHASE1__.${n} = ${n}; }`
      ).join('\n      ')}
      window.__PHASE1_LOADED__ = true;
    } catch (e) { window.__PHASE1_ERR__ = String(e); }
  </script>`;

  let instrumentedHtml;
  const bodyClose = '</body>';
  const idx = rawHtml.lastIndexOf(bodyClose);
  if (idx >= 0) {
    instrumentedHtml = rawHtml.slice(0, idx) + exposeScript + rawHtml.slice(idx);
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
