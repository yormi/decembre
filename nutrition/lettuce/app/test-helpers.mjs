// Test helpers for nutrition/lettuce/app spec tests.
//
// Mirrors nutrition/tomato/app/test-helpers.mjs: rebuild dist/index.html via
// scripts/build.mjs, load it into a single shared jsdom context, expose the
// window for assertions. The lettuce Bilan lives behind the Salanova crop
// toggle (#nutr-crop-lettuce) and is rendered by window.buildNutrimentLettuce
// dispatched from window.buildNutriment when nutrCrop === 'lettuce'.

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
  execSync(`node ${BUILD_SCRIPT}`, { cwd: REPO_ROOT, stdio: 'pipe' });
  buildRan = true;
}

let cachedDom = null;

// Load dist/index.html into a shared jsdom context, then flip the Nutrition
// crop sub-toggle to Salanova so #nutr-lettuce-content renders. Reuses the
// same DOM across tests for speed; individual tests reset input state at the
// top of the test body if they need a clean baseline.
export function loadLettuceApp() {
  if (cachedDom) return cachedDom;
  ensureBuilt();
  const html = readFileSync(DIST_INDEX, 'utf8');
  const virtualConsole = new VirtualConsole();
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
  // Flip Nutrition page to Salanova so buildNutrimentLettuce runs and
  // #nutr-lettuce-content is visible.
  if (typeof dom.window.setNutrCrop === 'function') {
    dom.window.setNutrCrop('lettuce');
  }
  cachedDom = dom;
  return dom;
}

// Read the source of nutrition/lettuce/app/logic.js — used by the
// structural-fallback grep on the render-path (calc-of-demand call shape +
// no bare-global access to LETTUCE_TISSUE_DW / LETTUCE_DM_FRACTION inside
// buildNutrimentLettuce).
export function readLogicJs() {
  return readFileSync(join(HERE, 'logic.js'), 'utf8');
}
