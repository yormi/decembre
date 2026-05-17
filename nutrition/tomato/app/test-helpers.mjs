// Test helpers for nutrition/tomato/app spec tests.
//
// page.html + logic.js are author-time partials that scripts/build.mjs
// concatenates into dist/index.html. Most REQs in this subproject are
// page-level (DOM rendering, listener wiring, modal behaviour) and depend
// on globals defined throughout app/index.html (STORED_RECIPE, PRODUCT_PCT,
// TOMATO_NUMBER_BEDS, calculateNutritionSupply, registerPourquoi, fmtVal, etc.) plus
// the per-subproject namespaces (window.PlantNeedsTomato,
// window.FoliarRecipeTomato, window.CompostContribution, …).
//
// The cleanest testable surface is the assembled artifact loaded via jsdom
// — same approach scripts/check-recipes.mjs already uses. We rebuild
// dist/index.html on demand so tests reflect the current source state of
// app/index.html + every @included partial.

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { JSDOM, VirtualConsole } from 'jsdom';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..', '..');
const DIST_INDEX = join(REPO_ROOT, 'dist', 'index.html');
const BUILD_SCRIPT = join(REPO_ROOT, 'scripts', 'build.mjs');

let buildRan = false;

function ensureBuilt() {
  if (buildRan && existsSync(DIST_INDEX)) return;
  // Always rebuild on first call so tests reflect current source.
  execSync(`node ${BUILD_SCRIPT}`, { cwd: REPO_ROOT, stdio: 'pipe' });
  buildRan = true;
}

let cachedDom = null;

// Load dist/index.html into a single jsdom context shared across tests.
// The page's inline script wires listeners + invokes setNutrCrop on load,
// which calls buildNutriment(). Returning the same dom instance keeps tests
// fast and deterministic.
export function loadTomatoApp() {
  if (cachedDom) return cachedDom;
  ensureBuilt();
  const html = readFileSync(DIST_INDEX, 'utf8');
  const virtualConsole = new VirtualConsole();
  // Page-script noise (fetch('history.json'), CSS errors, etc.) is unrelated
  // to the assertions below — silence it to keep test output focused.
  virtualConsole.on('jsdomError', () => {});
  virtualConsole.on('error', () => {});
  virtualConsole.on('warn', () => {});
  virtualConsole.on('log', () => {});
  const dom = new JSDOM(html, {
    url: 'http://localhost/index.html',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
  });
  cachedDom = dom;
  return dom;
}

// Read the source of the tomato/app/logic.js partial — used by source-grep
// REQs (REQ-106, REQ-108) that pin call-shape patterns regardless of what
// the assembled artifact happens to render today.
export function readLogicJs() {
  return readFileSync(join(HERE, 'logic.js'), 'utf8');
}

// Read dist/index.html (the assembled artifact) for cross-file REQs
// (REQ-106 default-mode declaration, REQ-113 listener wiring array,
// REQ-004 source-of-truth references in calculateNutritionSupply).
// After the Stage 7 carve, those identifiers live in partials that
// app/index.html @includes — the assembled dist file is the single
// concatenated text where the source-grep patterns resolve.
export function readAppIndexHtml() {
  ensureBuilt();
  return readFileSync(DIST_INDEX, 'utf8');
}

// Override one element of FP_RECIPE_T5.fertigation at runtime and force a
// re-render of #nutr-phase1 (Block 8 drift gauge). Returns a restore() that
// puts the original value back. Used by REQ-153 to set up an FP / Stored
// ratio of exactly 1.5 for one element without ever touching STORED_RECIPE
// (which is read-only per test-writer hard constraints).
//
// FP_RECIPE_T5 is module-scoped in the page script — reach it via window.eval.
// Re-render path: setNutrStage('T5') forces FP-eligible stage and calls
// buildNutriment(), which writes renderPhase1Comparison() into #nutr-phase1.
export function stubFpFertigation(window, element, value) {
  const previous = window.eval(`FP_RECIPE_T5.fertigation[${JSON.stringify(element)}]`);
  window.eval(`FP_RECIPE_T5.fertigation[${JSON.stringify(element)}] = ${value};`);
  // Ensure FP mode + T5 stage so renderPhase1Comparison emits a real table.
  if (typeof window.setNutrRecipeMode === 'function') window.setNutrRecipeMode('fp');
  if (typeof window.setNutrStage === 'function') window.setNutrStage('T5');
  return function restore() {
    if (previous === undefined) {
      window.eval(`delete FP_RECIPE_T5.fertigation[${JSON.stringify(element)}];`);
    } else {
      window.eval(`FP_RECIPE_T5.fertigation[${JSON.stringify(element)}] = ${previous};`);
    }
    if (typeof window.setNutrRecipeMode === 'function') window.setNutrRecipeMode('fp');
    if (typeof window.setNutrStage === 'function') window.setNutrStage('T5');
  };
}

// Read the STORED value the Block 8 drift gauge uses for a given fertigation
// element at stage T5. Same parse path as renderPhase1Comparison
// (storedFert.kSulfate × getMultK() for K2SO4, mgSulfate × getMultMg() for
// MgSO4·7H2O). Read-only — never mutates STORED_RECIPE.
export function readPhase1StoredFertigationT5(window, element) {
  if (element === 'K2SO4') {
    return window.eval('STORED_RECIPE.tomato.fertigation.T5.kSulfate * getMultK()');
  }
  if (element === 'MgSO4-7H2O') {
    return window.eval('STORED_RECIPE.tomato.fertigation.T5.mgSulfate * getMultMg()');
  }
  throw new Error(`readPhase1StoredFertigationT5: unsupported element "${element}"`);
}
