// Shared jsdom fixture for nutrition/tomato/ integration tests.
//
// Loads `app/index.html` plus every `<!-- @include path -->` it pulls in,
// boots jsdom against the assembled source (NOT against `dist/index.html` —
// per test-writer rule "Don't write tests against dist/index.html"), and
// exposes the runtime objects on a single namespace so individual tests
// don't each pay the boot cost.
//
// The include resolver mirrors `scripts/build.mjs` (whole-line @include
// markers, recursion ≤ 8); the instrumentation script mirrors the pattern
// used by `scripts/check-recipes.mjs` to surface module-scope `const`
// bindings via `window.__TEST_GLOBALS__`.

import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..', '..');
const SOURCE = resolve(PROJECT_ROOT, 'app', 'index.html');

const INCLUDE_RE = /^[ \t]*<!--\s*@include\s+(\S+?)\s*-->[ \t]*\r?\n?/gm;

async function resolveIncludes(content, sourcePath, depth = 0) {
  if (depth > 8) throw new Error(`@include depth > 8 (cycle?) at ${sourcePath}`);
  const matches = [...content.matchAll(INCLUDE_RE)];
  for (const m of matches) {
    const partialPath = resolve(PROJECT_ROOT, m[1]);
    const partial = await readFile(partialPath, 'utf8');
    const resolved = await resolveIncludes(partial, partialPath, depth + 1);
    content = content.replace(m[0], resolved);
  }
  return content;
}

// Names exposed on window.__TEST_GLOBALS__ for assertion. Mirrors the
// `exposeNames` list in scripts/check-recipes.mjs but trimmed to what the
// nutrition/tomato/ integration tests need (REQ-011, REQ-013, REQ-014,
// REQ-033).
const EXPOSE_NAMES = [
  // Plant-needs subproject
  'BIOMASS_DEMAND', 'TOMATO_FRUIT_EXPORT', 'TOMATO_REMOVAL',
  'TOMATO_DEMAND_CERT', 'TRANSP_COUPLED_BIOMASS',
  'calcNutrDemand',
  // Channel ownership + accepted gaps
  'CHANNEL_ROLE',
  'ACCEPTED_DEFICITS', 'ACCEPTED_EXCESSES',
  // Recipe inputs (per-stage yield, etc.)
  'RECIPE_INPUTS',
  // Fertigation-recipe subproject
  'computeStageRecipe', 'FIRST_PRINCIPLES_T5_FERTIGATION', 'FP_RECIPE_T5',
  'PH_UPTAKE_FACTOR_AT_CURRENT_SOIL',
  // Sidedress-recipe subproject
  'computeStageSidedress', 'FIRST_PRINCIPLES_SIDEDRESS',
  'SIDEDRESS_AREA_PER_PLANCHE', 'SIDEDRESS_MIN_EFF', 'SIDEDRESS_PRODUCTS',
  // Foliar-recipe subproject
  'computeFoliarSupply', 'computeFoliarRecipeForGap',
  'FOLIAR_COVERAGE_DEFAULT', 'FOLIAR_COVERAGE_WITH_YUCCA',
  'BURN_CAP_BASE_G', 'burnCapG',
  // Cross-cutting model layer used by the integration math
  'PRODUCT', 'PRODUCT_PCT', 'STORED_RECIPE',
  'TOMATO_NUM_BEDS', 'TOMATO_BED_AREA',
  'effectiveEff', 'predictedCE',
  // Compost release feeds the supply chain (REQ-013/014)
  'COMPOST_RELEASE_PER_WEEK',
];

let cachedFixture = null;

// loadFixture() — boot jsdom once, return the populated namespace handle.
// Subsequent calls return the same handle (cheap reuse across describe-blocks).
export async function loadFixture() {
  if (cachedFixture) return cachedFixture;

  const tpl = await readFile(SOURCE, 'utf8');
  const assembled = await resolveIncludes(tpl, SOURCE);

  const exposeScript = `<script>
    try {
      ${EXPOSE_NAMES.map(n => `if (typeof ${n} !== 'undefined') window.__TEST_GLOBALS__ = window.__TEST_GLOBALS__ || {}, window.__TEST_GLOBALS__.${n} = ${n};`).join('\n      ')}
      window.__TEST_LOADED__ = true;
    } catch (e) { window.__TEST_ERR__ = String(e); }
  </script>`;

  const bodyClose = '</body>';
  const idx = assembled.lastIndexOf(bodyClose);
  const instrumentedHtml = idx >= 0
    ? assembled.slice(0, idx) + exposeScript + assembled.slice(idx)
    : assembled + exposeScript;

  // Silence the page's runtime errors (history.json fetch, etc.). Real
  // assertion failures still surface through node:test.
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

  const win = dom.window;
  const globals = win.__TEST_GLOBALS__ || {};

  cachedFixture = {
    window: win,
    globals,
    loaded: !!win.__TEST_LOADED__,
    error: win.__TEST_ERR__ || null,
  };
  return cachedFixture;
}
