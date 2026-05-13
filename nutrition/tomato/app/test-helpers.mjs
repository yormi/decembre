// Test helpers for nutrition/tomato/app spec tests.
//
// page.html + logic.js are author-time partials that scripts/build.mjs
// concatenates into dist/index.html. Most REQs in this subproject are
// page-level (DOM rendering, listener wiring, modal behaviour) and depend
// on globals defined throughout app/index.html (STORED_RECIPE, PRODUCT_PCT,
// TOMATO_NUM_BEDS, calcNutrSupply, registerPourquoi, fmtVal, etc.) plus
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

// Read app/index.html source for cross-file REQs (REQ-106 default-mode
// declaration, REQ-113 listener wiring array, REQ-004 source-of-truth
// references in calcNutrSupply).
export function readAppIndexHtml() {
  return readFileSync(join(REPO_ROOT, 'app', 'index.html'), 'utf8');
}
