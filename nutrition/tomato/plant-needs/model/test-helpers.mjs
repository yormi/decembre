// Test helpers for nutrition/tomato/plant-needs.
//
// The subproject's three source files (data.js / calc.js / model.js) use bare
// `const` declarations + a final `window.PlantNeedsTomato = {…}` assignment.
// In the live app they're concatenated into dist/index.html via @include and
// run inside a single browser window. For unit tests we mirror that with a
// node:vm context where `window` is the only host object — same pattern as
// scripts/check-recipes.mjs uses for the nursery subproject.

import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export function loadPlantNeedsTomato() {
  const dataSource   = readFileSync(join(HERE, 'data.js'),   'utf8');
  const demandSource = readFileSync(join(HERE, 'demand.js'), 'utf8');

  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(
    dataSource + '\n' + demandSource,
    sandbox,
    { filename: 'plant-needs-tomato-bundle.js' },
  );
  return {
    namespace: sandbox.window.PlantNeedsTomato,
    window: sandbox.window,
  };
}
