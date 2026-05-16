// Test helpers for nutrition/soil-contribution.
//
// Same pattern as nutrition/tomato/plant-needs/test-helpers.mjs: load the
// four source files (data.js / calc.js / render.js / model.js) into a
// node:vm sandbox with a `window` host object, return the namespace +
// window for assertions.

import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export function loadSoilContribution() {
  const dataSource   = readFileSync(join(HERE, 'data.js'),   'utf8');
  const calcSource   = readFileSync(join(HERE, 'calc.js'),   'utf8');
  const renderSource = readFileSync(join(HERE, 'render.js'), 'utf8');
  const modelSource  = readFileSync(join(HERE, 'model.js'),  'utf8');

  // render.js references a module-scope `formatMg` helper that lives in
  // app/index.html in the live bundle. Stub it here with the same
  // observable contract (return a string with the rounded mg value) so
  // renderGrid runs without ReferenceError. Sandbox-only — production
  // unaffected.
  const formatMgStub = `function formatMg(value) { return String(Math.round(Number(value) || 0)); }\n`;

  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(
    formatMgStub + dataSource + '\n' + calcSource + '\n' + renderSource + '\n' + modelSource,
    sandbox,
    { filename: 'soil-contribution-bundle.js' },
  );
  return {
    namespace: sandbox.window.SoilContribution,
    window: sandbox.window,
  };
}
