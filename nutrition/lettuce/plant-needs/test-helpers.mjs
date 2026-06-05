// Test helpers for nutrition/lettuce/plant-needs.
//
// Same pattern as nutrition/tomato/plant-needs/test-helpers.mjs: load the
// three source files into a node:vm sandbox with a `window` host object,
// return the namespace + window for assertions.

import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export function loadPlantNeedsLettuce() {
  const dataSource  = readFileSync(join(HERE, 'data.js'),  'utf8');
  const calcSource  = readFileSync(join(HERE, 'calc.js'),  'utf8');
  const modelSource = readFileSync(join(HERE, 'model.js'), 'utf8');

  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(
    dataSource + '\n' + calcSource + '\n' + modelSource,
    sandbox,
    { filename: 'plant-needs-lettuce-bundle.js' },
  );
  return {
    namespace: sandbox.window.PlantNeedsLettuce,
    window: sandbox.window,
  };
}
