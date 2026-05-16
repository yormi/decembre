// Tests for nutrition/lettuce/plant-needs/spec.md.
//
// One node:test file pinning every REQ in the subproject's spec:
//   REQ-165 — Public API namespace window.PlantNeedsLettuce.
//   REQ-166 — Demand scales linearly with mass-gain and inversely with cycleDays.
//   REQ-167 — Supply composition: total = soil + fert + frontload.
//   REQ-168 — Demand certainty floor (macros cert 4 / micros cert 3) — pinned
//             via structural shape of LETTUCE_TISSUE_DW + demand output;
//             per-element cert prose lives in derivation.md.
//   REQ-169 — Canopy factor bounded [0.2, 0.7].
//   INV-1   — Element coverage closed across demand + every supply channel.
//
// Loaded source (data.js + calc.js + model.js) runs inside node:vm with a
// `window` host object; see test-helpers.mjs.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { loadPlantNeedsLettuce } from './test-helpers.mjs';

const { namespace } = loadPlantNeedsLettuce();

const ALL_ELEMENTS = ['N', 'P', 'K', 'Ca', 'Mg', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];

// Default dependency bag for supply tests. Numerically realistic but kept
// deterministic so assertions don't drift with app-level constant edits.
const TEST_DEPENDENCIES = {
  weeklyMassFlowL: 50,                               // L/m²/wk
  smeLettucePpm: {
    N: 72.6, P: 0.8, K: 54.4, Ca: 114.4, Mg: 30.2,
    Fe: 0.22, Mn: 0, Zn: 0, B: 0.17, Cu: 0.03, Mo: 0.02,
  },
  lettuceRecipe: { kSulfate: 2996, mgSulfate: 467, feSulfate: 7.5 },
  productPct: {
    K2SO4_K: 0.42, MgSO4_Mg: 0.0986, FeSO4_Fe: 0.20, FarinePlumes_N: 0.13,
  },
  featherMealMineralizationEfficiency: 0.75,
  frontloadDefaults: { featherMeal_g_per_m2: 50, mineralizationWeeks: 4 },
};

describe('REQ-165 — window.PlantNeedsLettuce public API surface', () => {
  const REQUIRED_KEYS = [
    'LETTUCE_DM_FRACTION',
    'LETTUCE_TISSUE_DW',
    'LETTUCE_FRONTLOAD_DEFAULTS',
    'SME_LETTUCE_PPM',
    'calculateLettuceNutritionDemand',
    'calculateLettuceNutritionSupply',
  ];

  test('REQ-165 — namespace exists and is an object', () => {
    assert.ok(namespace, 'window.PlantNeedsLettuce must be defined after model.js loads');
    assert.equal(typeof namespace, 'object');
    assert.notEqual(namespace, null);
  });

  test('REQ-165 — LETTUCE_DM_FRACTION is a number in (0, 1)', () => {
    assert.equal(typeof namespace.LETTUCE_DM_FRACTION, 'number');
    assert.ok(namespace.LETTUCE_DM_FRACTION > 0 && namespace.LETTUCE_DM_FRACTION < 1,
      `LETTUCE_DM_FRACTION must be in (0,1), got ${namespace.LETTUCE_DM_FRACTION}`);
  });

  for (const key of ['LETTUCE_TISSUE_DW', 'LETTUCE_FRONTLOAD_DEFAULTS', 'SME_LETTUCE_PPM']) {
    test(`REQ-165 — ${key} is a non-null object on the namespace`, () => {
      assert.equal(typeof namespace[key], 'object',
        `window.PlantNeedsLettuce.${key} must be an object`);
      assert.notEqual(namespace[key], null);
    });
  }

  for (const key of ['calculateLettuceNutritionDemand', 'calculateLettuceNutritionSupply']) {
    test(`REQ-165 — ${key} is a function on the namespace`, () => {
      assert.equal(typeof namespace[key], 'function',
        `window.PlantNeedsLettuce.${key} must be a function`);
    });
  }
});

describe('REQ-166 — Demand scales linearly with mass-gain, inversely with cycleDays', () => {
  test('REQ-166 — doubling (targetG - transplantG) doubles demand per element (±0.1 %)', () => {
    const baseline = namespace.calculateLettuceNutritionDemand(30, 100, 14, 43);
    const doubled  = namespace.calculateLettuceNutritionDemand(30, 170, 14, 43);  // gain 140 vs 70
    for (const element of ALL_ELEMENTS) {
      if (baseline[element] === 0) continue;
      const ratio = doubled[element] / baseline[element];
      assert.ok(Math.abs(ratio - 2.0) / 2.0 < 0.001,
        `${element}: doubling gain should double demand, ratio=${ratio.toFixed(5)}`);
    }
  });

  test('REQ-166 — doubling density doubles demand per element (±0.1 %)', () => {
    const baseline = namespace.calculateLettuceNutritionDemand(30, 100, 14, 30);
    const doubled  = namespace.calculateLettuceNutritionDemand(30, 100, 14, 60);
    for (const element of ALL_ELEMENTS) {
      if (baseline[element] === 0) continue;
      const ratio = doubled[element] / baseline[element];
      assert.ok(Math.abs(ratio - 2.0) / 2.0 < 0.001,
        `${element}: doubling density should double demand, ratio=${ratio.toFixed(5)}`);
    }
  });

  test('REQ-166 — doubling cycleDays halves demand per element (±0.1 %)', () => {
    const short = namespace.calculateLettuceNutritionDemand(30, 100, 14, 43);
    const long  = namespace.calculateLettuceNutritionDemand(30, 100, 28, 43);
    for (const element of ALL_ELEMENTS) {
      if (short[element] === 0) continue;
      const ratio = long[element] / short[element];
      assert.ok(Math.abs(ratio - 0.5) / 0.5 < 0.001,
        `${element}: doubling cycleDays should halve demand, ratio=${ratio.toFixed(5)}`);
    }
  });

  test('REQ-166 — targetG ≤ transplantG → demand is zero for every element', () => {
    const demand = namespace.calculateLettuceNutritionDemand(100, 30, 14, 43);
    for (const element of ALL_ELEMENTS) {
      assert.equal(demand[element], 0,
        `${element}: demand must be 0 when targetG ≤ transplantG, got ${demand[element]}`);
    }
  });
});

describe('REQ-167 — Supply composition: total = soil + fert + frontload', () => {
  test('REQ-167 — total[element] === soil + fert + frontload, per element', () => {
    const supply = namespace.calculateLettuceNutritionSupply(50, 100, 43, false, 50, TEST_DEPENDENCIES);
    for (const element of ALL_ELEMENTS) {
      const expected = (supply.soil[element] || 0) + (supply.fert[element] || 0) + (supply.frontload[element] || 0);
      assert.ok(Math.abs(supply.total[element] - expected) < 1e-9,
        `${element}: total ${supply.total[element]} must equal soil+fert+frontload ${expected}`);
    }
  });

  test('REQ-167 — phLocked gates P/Mn/Zn soil mass-flow at ≤ 100 mg/m²/wk', () => {
    // Construct a dependency bag where ppm × flowL × canopyFactor would exceed 100.
    const heavyPpm = { ...TEST_DEPENDENCIES.smeLettucePpm, P: 100, Mn: 100, Zn: 100 };
    const heavyDeps = { ...TEST_DEPENDENCIES, smeLettucePpm: heavyPpm, weeklyMassFlowL: 50 };
    const supply = namespace.calculateLettuceNutritionSupply(50, 100, 43, true, 0, heavyDeps);
    for (const element of ['P', 'Mn', 'Zn']) {
      assert.ok(supply.soil[element] <= 100 + 1e-9,
        `${element}: phLocked soil supply must be ≤ 100 mg/m²/wk, got ${supply.soil[element]}`);
    }
  });

  test('REQ-167 — phLocked Fe soil × 0.15', () => {
    const unlocked = namespace.calculateLettuceNutritionSupply(50, 100, 43, false, 0, TEST_DEPENDENCIES);
    const locked   = namespace.calculateLettuceNutritionSupply(50, 100, 43, true,  0, TEST_DEPENDENCIES);
    if (unlocked.soil.Fe > 0) {
      const ratio = locked.soil.Fe / unlocked.soil.Fe;
      assert.ok(Math.abs(ratio - 0.15) < 0.001,
        `Fe soil supply ratio (locked/unlocked) should be 0.15, got ${ratio.toFixed(4)}`);
    }
  });

  test('REQ-167 — frontload delivers N only', () => {
    const supply = namespace.calculateLettuceNutritionSupply(50, 100, 43, false, 50, TEST_DEPENDENCIES);
    for (const element of ALL_ELEMENTS) {
      if (element === 'N') {
        assert.ok(supply.frontload.N > 0,
          `frontload.N must be > 0 when frontload_g_per_m2 > 0, got ${supply.frontload.N}`);
      } else {
        assert.equal(supply.frontload[element], 0,
          `${element}: frontload must be 0 for non-N elements, got ${supply.frontload[element]}`);
      }
    }
  });

  test('REQ-167 — frontload.efficiency.N set to mineralization efficiency when N > 0', () => {
    const supply = namespace.calculateLettuceNutritionSupply(50, 100, 43, false, 50, TEST_DEPENDENCIES);
    assert.equal(supply.frontload.efficiency.N, TEST_DEPENDENCIES.featherMealMineralizationEfficiency,
      `frontload.efficiency.N must equal featherMealMineralizationEfficiency`);
  });

  test('REQ-167 — known-good fertigation supply at default LETTUCE recipe', () => {
    // K  = 2996 g × 0.42  × 1000 / 100 = 12 583.2 mg K/m²/wk
    // Mg =  467 g × 0.0986 × 1000 / 100 =    460.46 mg Mg/m²/wk
    // Fe =  7.5 g × 0.20  × 1000 / 100 =     15.0 mg Fe/m²/wk (unlocked)
    const supply = namespace.calculateLettuceNutritionSupply(50, 100, 43, false, 0, TEST_DEPENDENCIES);
    assert.ok(Math.abs(supply.fert.K  - 12583.2) < 1e-3,
      `fert.K should be 12583.2, got ${supply.fert.K}`);
    assert.ok(Math.abs(supply.fert.Mg - 460.462) < 1e-2,
      `fert.Mg should be 460.46, got ${supply.fert.Mg}`);
    assert.ok(Math.abs(supply.fert.Fe - 15.0) < 1e-6,
      `fert.Fe should be 15.0 unlocked, got ${supply.fert.Fe}`);
  });
});

describe('REQ-168 — Demand certainty floor: 5 macros + 6 micros structurally present', () => {
  // The spec ties per-element demand cert to LETTUCE_TISSUE_DW source quality
  // (macros cert 4, micros cert 3). Per-element cert annotations live in
  // derivation.md prose; the testable claim here is structural — every macro
  // and every micro carries a positive numeric entry in the tissue table and
  // a positive numeric entry in the demand output (cert floor cannot be
  // satisfied if the element is missing or zero).
  const MACROS = ['N', 'P', 'K', 'Ca', 'Mg'];
  const MICROS = ['Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];

  test('REQ-168 — LETTUCE_TISSUE_DW carries 5 macros, each numeric > 0', () => {
    const tissue = namespace.LETTUCE_TISSUE_DW;
    for (const element of MACROS) {
      assert.equal(typeof tissue[element], 'number',
        `macro ${element} must be numeric on LETTUCE_TISSUE_DW`);
      assert.ok(tissue[element] > 0,
        `macro ${element} must be > 0, got ${tissue[element]}`);
    }
  });

  test('REQ-168 — LETTUCE_TISSUE_DW carries 6 micros, each numeric > 0', () => {
    const tissue = namespace.LETTUCE_TISSUE_DW;
    for (const element of MICROS) {
      assert.equal(typeof tissue[element], 'number',
        `micro ${element} must be numeric on LETTUCE_TISSUE_DW`);
      assert.ok(tissue[element] > 0,
        `micro ${element} must be > 0, got ${tissue[element]}`);
    }
  });

  test('REQ-168 — demand output carries a positive entry for every macro + micro', () => {
    const demand = namespace.calculateLettuceNutritionDemand(30, 100, 14, 43);
    for (const element of [...MACROS, ...MICROS]) {
      assert.equal(typeof demand[element], 'number',
        `demand.${element} must be numeric`);
      assert.ok(demand[element] > 0,
        `demand.${element} must be > 0 for non-trivial cycle, got ${demand[element]}`);
    }
  });
});

describe('REQ-169 — Canopy factor bounded [0.2, 0.7]', () => {
  for (const [label, currentG, targetG] of [
    ['stunted (currentG ≪ targetG)', 1, 100],
    ['mid-cycle',                    50, 100],
    ['mature (currentG ≈ targetG)', 100, 100],
    ['over-target',                 200, 100],
  ]) {
    test(`REQ-169 — canopyFactor ∈ [0.2, 0.7] for ${label}`, () => {
      const supply = namespace.calculateLettuceNutritionSupply(
        currentG, targetG, 43, false, 0, TEST_DEPENDENCIES);
      assert.ok(supply.canopyFactor >= 0.2 - 1e-9 && supply.canopyFactor <= 0.7 + 1e-9,
        `canopyFactor for ${label} must be in [0.2, 0.7], got ${supply.canopyFactor}`);
    });
  }
});

describe('INV-1 — Element coverage closed across demand + every supply channel', () => {
  test('INV-1 — demand carries a numeric entry for every element in LETTUCE_TISSUE_DW', () => {
    const demand = namespace.calculateLettuceNutritionDemand(30, 100, 14, 43);
    for (const element of Object.keys(namespace.LETTUCE_TISSUE_DW)) {
      assert.equal(typeof demand[element], 'number',
        `demand.${element} must be numeric, got ${typeof demand[element]}`);
      assert.ok(isFinite(demand[element]),
        `demand.${element} must be finite, got ${demand[element]}`);
    }
  });

  test('INV-1 — every supply channel carries a numeric entry per element', () => {
    const supply = namespace.calculateLettuceNutritionSupply(50, 100, 43, false, 50, TEST_DEPENDENCIES);
    for (const channel of ['soil', 'fert', 'frontload', 'total']) {
      for (const element of Object.keys(namespace.LETTUCE_TISSUE_DW)) {
        assert.equal(typeof supply[channel][element], 'number',
          `supply.${channel}.${element} must be numeric, got ${typeof supply[channel][element]}`);
        assert.ok(isFinite(supply[channel][element]),
          `supply.${channel}.${element} must be finite, got ${supply[channel][element]}`);
      }
    }
  });

  test('INV-1 — LETTUCE_TISSUE_DW covers exactly the 11 canonical elements', () => {
    const actual = Object.keys(namespace.LETTUCE_TISSUE_DW);
    assert.deepEqual(actual.sort(), [...ALL_ELEMENTS].sort(),
      `LETTUCE_TISSUE_DW must cover exactly the 11 canonical elements`);
  });
});
