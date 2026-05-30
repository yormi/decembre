// Tests for nutrition/tomato/plant-needs/spec.md.
//
// One node:test file pinning every rule in the subproject's spec:
//   Ca and Mg biomass demand coupled to transpiration.
//   Stage-transition continuity (|Δ|/prev ≤ 2.5 per element).
//   Public API namespace window.PlantNeedsTomato.
//
// Loaded source (data.js + calc.js + model.js) is executed in a node:vm
// sandbox with a `window` host object; see test-helpers.mjs.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { loadPlantNeedsTomato } from './test-helpers.mjs';

const { namespace } = loadPlantNeedsTomato();

// Ca/Mg biomass scales with transpFactor;
// the rest of TOMATO_FRUIT_EXPORT does not. Kept inline (not derived from
// TRANSP_COUPLED_BIOMASS) so this test pins the spec, not the data table.
const COUPLED_ELEMENTS = ['Ca', 'Mg'];
const DECOUPLED_ELEMENTS = ['N', 'P', 'K', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];
const ALL_ELEMENTS = [...COUPLED_ELEMENTS, ...DECOUPLED_ELEMENTS];

const REPRESENTATIVE_YIELD = 1.5;     // target kg/m²/wk
const REPRESENTATIVE_STAGE = 'T5';    // pleine production — full BIOMASS_DEMAND
const FLOAT_TOLERANCE = 1e-9;         // exact-multiplication checks

describe('Ca and Mg biomass demand coupled to transpiration', () => {
  test('Ca biomass scales linearly with transpFactor across [0.4, 0.7, 1.0]', () => {
    const baseline = namespace.calculateNutritionDemand(REPRESENTATIVE_YIELD, REPRESENTATIVE_STAGE, 1.0);
    assert.ok(baseline.Ca.biomass > 0,
      'precondition: Ca biomass at tf=1.0 must be positive');
    for (const transpFactor of [0.4, 0.7, 1.0]) {
      const scaled = namespace.calculateNutritionDemand(REPRESENTATIVE_YIELD, REPRESENTATIVE_STAGE, transpFactor);
      const expected = baseline.Ca.biomass * transpFactor;
      assert.ok(Math.abs(scaled.Ca.biomass - expected) < FLOAT_TOLERANCE,
        `Ca biomass at tf=${transpFactor} should be ${expected}, got ${scaled.Ca.biomass}`);
    }
  });

  test('Mg biomass scales linearly with transpFactor across [0.4, 0.7, 1.0]', () => {
    const baseline = namespace.calculateNutritionDemand(REPRESENTATIVE_YIELD, REPRESENTATIVE_STAGE, 1.0);
    assert.ok(baseline.Mg.biomass > 0,
      'precondition: Mg biomass at tf=1.0 must be positive');
    for (const transpFactor of [0.4, 0.7, 1.0]) {
      const scaled = namespace.calculateNutritionDemand(REPRESENTATIVE_YIELD, REPRESENTATIVE_STAGE, transpFactor);
      const expected = baseline.Mg.biomass * transpFactor;
      assert.ok(Math.abs(scaled.Mg.biomass - expected) < FLOAT_TOLERANCE,
        `Mg biomass at tf=${transpFactor} should be ${expected}, got ${scaled.Mg.biomass}`);
    }
  });

  for (const element of DECOUPLED_ELEMENTS) {
    test(`${element} biomass unchanged across transpFactor in [0.4, 0.7, 1.0]`, () => {
      const baseline = namespace.calculateNutritionDemand(REPRESENTATIVE_YIELD, REPRESENTATIVE_STAGE, 1.0);
      for (const transpFactor of [0.4, 0.7, 1.0]) {
        const scaled = namespace.calculateNutritionDemand(REPRESENTATIVE_YIELD, REPRESENTATIVE_STAGE, transpFactor);
        assert.equal(scaled[element].biomass, baseline[element].biomass,
          `${element} biomass at tf=${transpFactor} must equal baseline ${baseline[element].biomass}`);
      }
    });
  }

  test('fruit-export term is never scaled by transpFactor (all 11 elements)', () => {
    const baseline = namespace.calculateNutritionDemand(REPRESENTATIVE_YIELD, REPRESENTATIVE_STAGE, 1.0);
    for (const transpFactor of [0.4, 0.7, 1.0]) {
      const scaled = namespace.calculateNutritionDemand(REPRESENTATIVE_YIELD, REPRESENTATIVE_STAGE, transpFactor);
      for (const element of ALL_ELEMENTS) {
        assert.equal(scaled[element].fruit, baseline[element].fruit,
          `${element} fruit at tf=${transpFactor} must match baseline (fruit never scaled)`);
      }
    }
  });

  test('total = fruit + biomass after transpFactor applied', () => {
    const result = namespace.calculateNutritionDemand(REPRESENTATIVE_YIELD, REPRESENTATIVE_STAGE, 0.6);
    for (const element of ALL_ELEMENTS) {
      const expectedTotal = result[element].fruit + result[element].biomass;
      assert.ok(Math.abs(result[element].total - expectedTotal) < FLOAT_TOLERANCE,
        `${element}.total must equal fruit + biomass (got total=${result[element].total}, ` +
        `fruit+biomass=${expectedTotal})`);
    }
  });

  test('default transpFactor is 1.0 (Ca/Mg biomass equal full-transp value)', () => {
    const explicit = namespace.calculateNutritionDemand(REPRESENTATIVE_YIELD, REPRESENTATIVE_STAGE, 1.0);
    const defaulted = namespace.calculateNutritionDemand(REPRESENTATIVE_YIELD, REPRESENTATIVE_STAGE);
    for (const element of ALL_ELEMENTS) {
      assert.equal(defaulted[element].biomass, explicit[element].biomass,
        `${element} biomass with default transpFactor must equal tf=1.0`);
      assert.equal(defaulted[element].fruit, explicit[element].fruit,
        `${element} fruit with default transpFactor must equal tf=1.0`);
    }
  });

  test('known-good numerical outputs at yield=1.5, T5, tf=1.0', () => {
    // Pins the formula: fruit = yield × export_g × 1000, biomass = BIOMASS_DEMAND[stage].
    // N : 2.7 × 0.60 = 1.62 g/kg → 2430 mg/m²/wk fruit; BIOMASS_DEMAND.T5.N = 1620
    // Ca: 1.5 × 0.05 = 0.075 g/kg → 112.5 mg/m²/wk fruit; BIOMASS_DEMAND.T5.Ca = 2138
    const result = namespace.calculateNutritionDemand(1.5, 'T5', 1.0);
    assert.ok(Math.abs(result.N.fruit - 2430) < 1e-6,
      `N fruit should be 2430 mg/m²/wk, got ${result.N.fruit}`);
    assert.ok(Math.abs(result.N.biomass - 1620) < 1e-6,
      `N biomass should be 1620 mg/m²/wk, got ${result.N.biomass}`);
    assert.ok(Math.abs(result.N.total - 4050) < 1e-6,
      `N total should be 4050 mg/m²/wk, got ${result.N.total}`);
    assert.ok(Math.abs(result.Ca.fruit - 112.5) < 1e-6,
      `Ca fruit should be 112.5 mg/m²/wk, got ${result.Ca.fruit}`);
    assert.ok(Math.abs(result.Ca.biomass - 2138) < 1e-6,
      `Ca biomass should be 2138 mg/m²/wk, got ${result.Ca.biomass}`);
  });

  test('known-good Ca biomass at yield=1.5, T5, tf=0.6 (= 2138 × 0.6 = 1282.8)', () => {
    const result = namespace.calculateNutritionDemand(1.5, 'T5', 0.6);
    assert.ok(Math.abs(result.Ca.biomass - 1282.8) < 1e-6,
      `Ca biomass at tf=0.6 should be 1282.8, got ${result.Ca.biomass}`);
    // Fruit term untouched
    assert.ok(Math.abs(result.Ca.fruit - 112.5) < 1e-6,
      `Ca fruit at tf=0.6 must remain 112.5, got ${result.Ca.fruit}`);
  });
});

describe('Stage-transition continuity |Δ|/prev ≤ 2.5 per element', () => {
  const MAX_RELATIVE_JUMP = 2.5;
  // Sort by numeric T-index, not insertion order — adjacent
  // stage pairs (Tn, Tn+1), which is a property of the stage axis, not the
  // BIOMASS_DEMAND object's key order.
  const stageIndex = key => Number(key.slice(1));

  test('BIOMASS_DEMAND covers T1..T5 contiguously', () => {
    const stages = Object.keys(namespace.BIOMASS_DEMAND).sort((a, b) => stageIndex(a) - stageIndex(b));
    assert.deepEqual(stages, ['T1', 'T2', 'T3', 'T4', 'T5'],
      `BIOMASS_DEMAND stages must be exactly T1..T5, got ${stages.join(',')}`);
  });

  test('every adjacent (Tn, Tn+1) per-element jump stays ≤ 2.5×', () => {
    const biomass = namespace.BIOMASS_DEMAND;
    const stages = Object.keys(biomass).sort((a, b) => stageIndex(a) - stageIndex(b));
    const offenders = [];
    for (let index = 1; index < stages.length; index++) {
      const previousStage = stages[index - 1];
      const currentStage = stages[index];
      const elements = new Set([
        ...Object.keys(biomass[previousStage]),
        ...Object.keys(biomass[currentStage]),
      ]);
      for (const element of elements) {
        const previousValue = biomass[previousStage][element] || 0;
        const currentValue = biomass[currentStage][element] || 0;
        // Spec uses denominator demand[Tn]. If previous is zero the ratio is
        // undefined; treat absence-then-presence as out-of-scope for the bound
        // (it's a coverage change, not a magnitude jump). Both zero → ratio 0.
        if (previousValue <= 0) continue;
        const relativeJump = Math.abs(currentValue - previousValue) / previousValue;
        if (relativeJump > MAX_RELATIVE_JUMP) {
          offenders.push(
            `${previousStage}→${currentStage} ${element}: ${previousValue} → ${currentValue} ` +
            `(|Δ|/prev=${relativeJump.toFixed(2)})`
          );
        }
      }
    }
    assert.equal(offenders.length, 0,
      `Stage-transition continuity violations:\n  ${offenders.join('\n  ')}`);
  });
});

describe('Public API namespace window.PlantNeedsTomato', () => {
  // Spec table fixes the eight keys + their kinds. Test = structural pin.
  const REQUIRED_OBJECTS = [
    'TOMATO_FRUIT_EXPORT',
    'BIOMASS_DEMAND',
    'TOMATO_DEMAND_CERT',
    'TOMATO_REMOVAL',
    'TRANSP_COUPLED_BIOMASS',
  ];
  const REQUIRED_FUNCTIONS = ['calculateNutritionDemand', 'certFor'];

  test('window.PlantNeedsTomato exists and is an object', () => {
    assert.ok(namespace, 'window.PlantNeedsTomato must be defined after model.js loads');
    assert.equal(typeof namespace, 'object');
    assert.notEqual(namespace, null);
  });

  for (const key of REQUIRED_OBJECTS) {
    test(`${key} is an object on the namespace`, () => {
      assert.notEqual(namespace[key], undefined,
        `window.PlantNeedsTomato.${key} must be present`);
      assert.equal(typeof namespace[key], 'object',
        `window.PlantNeedsTomato.${key} must be an object`);
      assert.notEqual(namespace[key], null,
        `window.PlantNeedsTomato.${key} must be non-null`);
    });
  }

  for (const key of REQUIRED_FUNCTIONS) {
    test(`${key} is a function on the namespace`, () => {
      assert.equal(typeof namespace[key], 'function',
        `window.PlantNeedsTomato.${key} must be a function`);
    });
  }

  test('certFor returns a number in [0, 5] on the transferability scale', () => {
    for (const stage of ['T1', 'T2', 'T3', 'T4', 'T5']) {
      for (const element of Object.keys(namespace.TOMATO_FRUIT_EXPORT)) {
        const cert = namespace.certFor(stage, element);
        assert.equal(typeof cert, 'number',
          `certFor(${stage}, ${element}) must return a number`);
        assert.ok(cert >= 0 && cert <= 5,
          `certFor(${stage}, ${element}) must be in [0, 5], got ${cert}`);
      }
    }
  });
});
