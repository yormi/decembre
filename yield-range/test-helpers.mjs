// Test helpers for yield-range.
//
// Mirrors nutrition/tomato/plant-needs/test-helpers.mjs: load data.js +
// calc.js + model.js into a node:vm sandbox with `window` as host, return
// the namespace plus the raw window so tests can inspect read-only
// constants (CANOPY_CAP_BY_PLATEAU, geometric inputs, etc.) without
// committing to a particular public-API key list — yield-range is mid-
// extension and the surface is being expanded in Wave 2.

import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export function loadYieldRange() {
  const dataSource  = readFileSync(join(HERE, 'data.js'),  'utf8');
  const calcSource  = readFileSync(join(HERE, 'calc.js'),  'utf8');
  const modelSource = readFileSync(join(HERE, 'model.js'), 'utf8');

  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(
    dataSource + '\n' + calcSource + '\n' + modelSource,
    sandbox,
    { filename: 'yield-range-bundle.js' },
  );
  return {
    namespace: sandbox.window.YieldRange,
    window: sandbox.window,
  };
}
