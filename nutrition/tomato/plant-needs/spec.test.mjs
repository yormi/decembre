// Tests for nutrition/tomato/plant-needs/spec.md.
//
// Coverage:
//   REQ-081 — Ca and Mg biomass demand coupled to transpiration.
//   REQ-082 — Stage-transition continuity (|Δ|/prev ≤ 2.5 per element).
//   REQ-083 — Public API namespace window.PlantNeedsTomato shape.
//
// Out of scope here (covered by scripts/check-recipes.mjs already):
//   INV-1 — Element coverage closed across BIOMASS_DEMAND / TOMATO_DEMAND_CERT
//           / TOMATO_FRUIT_EXPORT.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { loadPlantNeedsTomato } from './test-helpers.mjs';

const { namespace } = loadPlantNeedsTomato();

describe('REQ-081 — Ca/Mg biomass term scales with transpFactor; others do not', () => {
  const COUPLED_ELEMENTS = ['Ca', 'Mg'];
  const DECOUPLED_ELEMENTS = ['N', 'P', 'K', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];
  const STAGE = 'T5';
  const YIELD = 1.5;
  const TOLERANCE = 0.01; // ±1 % per spec

  test('REQ-081 — calcNutrDemand is callable with (yield, stage, transpFactor)', () => {
    assert.equal(typeof namespace.calcNutrDemand, 'function');
    const result = namespace.calcNutrDemand(YIELD, STAGE, 1.0);
    assert.equal(typeof result, 'object');
    assert.equal(typeof result.Ca, 'object');
    assert.equal(typeof result.Ca.biomass, 'number');
    assert.equal(typeof result.Ca.fruit, 'number');
    assert.equal(typeof result.Ca.total, 'number');
  });

  test('REQ-081 — Ca biomass term halves when transpFactor goes 1.0 → 0.5', () => {
    const fullTransp = namespace.calcNutrDemand(YIELD, STAGE, 1.0);
    const halfTransp = namespace.calcNutrDemand(YIELD, STAGE, 0.5);
    assert.ok(fullTransp.Ca.biomass > 0,
      'precondition: Ca biomass term must be positive at T5');
    const ratio = halfTransp.Ca.biomass / fullTransp.Ca.biomass;
    assert.ok(Math.abs(ratio - 0.5) < TOLERANCE,
      `Ca biomass ratio at tf=0.5 should be ~0.5, got ${ratio.toFixed(4)}`);
  });

  test('REQ-081 — Mg biomass term halves when transpFactor goes 1.0 → 0.5', () => {
    const fullTransp = namespace.calcNutrDemand(YIELD, STAGE, 1.0);
    const halfTransp = namespace.calcNutrDemand(YIELD, STAGE, 0.5);
    assert.ok(fullTransp.Mg.biomass > 0,
      'precondition: Mg biomass term must be positive at T5');
    const ratio = halfTransp.Mg.biomass / fullTransp.Mg.biomass;
    assert.ok(Math.abs(ratio - 0.5) < TOLERANCE,
      `Mg biomass ratio at tf=0.5 should be ~0.5, got ${ratio.toFixed(4)}`);
  });

  for (const element of DECOUPLED_ELEMENTS) {
    test(`REQ-081 — ${element} biomass term unchanged at tf=0.5`, () => {
      const fullTransp = namespace.calcNutrDemand(YIELD, STAGE, 1.0);
      const halfTransp = namespace.calcNutrDemand(YIELD, STAGE, 0.5);
      assert.equal(halfTransp[element].biomass, fullTransp[element].biomass,
        `${element} biomass should be untouched by transpFactor`);
    });
  }

  test('REQ-081 — fruit-export term is never scaled by transpFactor', () => {
    const fullTransp = namespace.calcNutrDemand(YIELD, STAGE, 1.0);
    const halfTransp = namespace.calcNutrDemand(YIELD, STAGE, 0.5);
    const elements = [...COUPLED_ELEMENTS, ...DECOUPLED_ELEMENTS];
    for (const element of elements) {
      assert.equal(halfTransp[element].fruit, fullTransp[element].fruit,
        `${element} fruit term must be invariant under transpFactor`);
    }
  });

  test('REQ-081 — TRANSP_COUPLED_BIOMASS exposes exactly Ca and Mg', () => {
    const coupled = namespace.TRANSP_COUPLED_BIOMASS;
    assert.equal(typeof coupled, 'object');
    const truthyKeys = Object.keys(coupled).filter(key => coupled[key]);
    assert.deepEqual(truthyKeys.sort(), ['Ca', 'Mg'].sort(),
      `TRANSP_COUPLED_BIOMASS truthy keys should be exactly Ca + Mg, got ${truthyKeys.join(',')}`);
  });

  test('REQ-081 — default transpFactor is 1.0 (no scaling when omitted)', () => {
    const explicit = namespace.calcNutrDemand(YIELD, STAGE, 1.0);
    const defaulted = namespace.calcNutrDemand(YIELD, STAGE);
    for (const element of [...COUPLED_ELEMENTS, ...DECOUPLED_ELEMENTS]) {
      assert.equal(defaulted[element].biomass, explicit[element].biomass,
        `${element} biomass with default transpFactor must equal tf=1.0 result`);
      assert.equal(defaulted[element].fruit, explicit[element].fruit,
        `${element} fruit with default transpFactor must equal tf=1.0 result`);
    }
  });
});

describe('REQ-082 — Stage-transition continuity (|Δ|/prev ≤ 2.5 per element)', () => {
  const MAX_RELATIVE_JUMP = 2.5;

  test('REQ-082 — BIOMASS_DEMAND exposes the expected stages', () => {
    const stages = Object.keys(namespace.BIOMASS_DEMAND);
    assert.deepEqual(stages, ['T1', 'T2', 'T3', 'T4', 'T5'],
      `Stage order must be T1..T5 in declaration order, got ${stages.join(',')}`);
  });

  test('REQ-082 — every adjacent (Tn, Tn+1) pair stays within ±250 % per element', () => {
    const biomass = namespace.BIOMASS_DEMAND;
    const stages = Object.keys(biomass);
    const offenders = [];
    for (let stageIndex = 1; stageIndex < stages.length; stageIndex++) {
      const previousStage = stages[stageIndex - 1];
      const currentStage = stages[stageIndex];
      const elements = new Set([
        ...Object.keys(biomass[previousStage]),
        ...Object.keys(biomass[currentStage]),
      ]);
      for (const element of elements) {
        const previousValue = biomass[previousStage][element] || 0;
        const currentValue = biomass[currentStage][element] || 0;
        if (previousValue <= 0) continue;
        const relativeJump = Math.abs(currentValue - previousValue) / previousValue;
        if (relativeJump > MAX_RELATIVE_JUMP) {
          offenders.push(
            `${previousStage}→${currentStage} ${element}: ${previousValue} → ${currentValue} (Δ=${(relativeJump * 100).toFixed(0)}%)`
          );
        }
      }
    }
    assert.equal(offenders.length, 0,
      `Stage transitions exceeding ±250 %:\n  ${offenders.join('\n  ')}`);
  });
});

describe('REQ-083 — Public API namespace window.PlantNeedsTomato', () => {
  const REQUIRED_KEYS = [
    'TOMATO_FRUIT_EXPORT',
    'BIOMASS_DEMAND',
    'TOMATO_DEMAND_CERT',
    'TOMATO_REMOVAL',
    'TRANSP_COUPLED_BIOMASS',
    'calcNutrDemand',
    'demandTotal',
    'certFor',
  ];

  test('REQ-083 — window.PlantNeedsTomato exists after model.js loads', () => {
    assert.ok(namespace, 'window.PlantNeedsTomato must be defined after loading model.js');
    assert.equal(typeof namespace, 'object');
  });

  for (const key of REQUIRED_KEYS) {
    test(`REQ-083 — namespace exposes ${key}`, () => {
      assert.notEqual(namespace[key], undefined,
        `window.PlantNeedsTomato.${key} must be present`);
      assert.notEqual(namespace[key], null,
        `window.PlantNeedsTomato.${key} must be non-null`);
    });
  }

  test('REQ-083 — TOMATO_FRUIT_EXPORT, BIOMASS_DEMAND, TOMATO_DEMAND_CERT, TOMATO_REMOVAL, TRANSP_COUPLED_BIOMASS are objects', () => {
    for (const key of [
      'TOMATO_FRUIT_EXPORT',
      'BIOMASS_DEMAND',
      'TOMATO_DEMAND_CERT',
      'TOMATO_REMOVAL',
      'TRANSP_COUPLED_BIOMASS',
    ]) {
      assert.equal(typeof namespace[key], 'object',
        `${key} must be an object table`);
    }
  });

  test('REQ-083 — calcNutrDemand, demandTotal, certFor are functions', () => {
    for (const key of ['calcNutrDemand', 'demandTotal', 'certFor']) {
      assert.equal(typeof namespace[key], 'function',
        `${key} must be a function`);
    }
  });

  test('REQ-083 — demandTotal returns flat {element → total mg/m²/wk} map', () => {
    const totals = namespace.demandTotal(1.5, 'T5', 1.0);
    assert.equal(typeof totals, 'object');
    const elements = Object.keys(namespace.TOMATO_FRUIT_EXPORT);
    for (const element of elements) {
      assert.equal(typeof totals[element], 'number',
        `demandTotal()[${element}] must be a number`);
      assert.ok(Number.isFinite(totals[element]),
        `demandTotal()[${element}] must be finite`);
    }
  });

  test('REQ-083 — demandTotal[el] equals fruit + biomass from calcNutrDemand', () => {
    const detailed = namespace.calcNutrDemand(1.5, 'T5', 1.0);
    const totals = namespace.demandTotal(1.5, 'T5', 1.0);
    for (const element of Object.keys(detailed)) {
      assert.equal(totals[element], detailed[element].total,
        `demandTotal[${element}] must equal calcNutrDemand[${element}].total`);
    }
  });

  test('REQ-083 — certFor returns a number on the 0-5 transferability scale', () => {
    const cert = namespace.certFor('T5', 'Ca');
    assert.equal(typeof cert, 'number');
    assert.ok(cert >= 0 && cert <= 5,
      `certFor must return value in [0, 5], got ${cert}`);
  });

  test('REQ-083 — certFor falls back to 1 (default placeholder) for unknown stage/el', () => {
    const unknownStage = namespace.certFor('T99', 'Ca');
    const unknownElement = namespace.certFor('T5', 'Xx');
    assert.equal(unknownStage, 1,
      'certFor must fall back to 1 for unknown stage');
    assert.equal(unknownElement, 1,
      'certFor must fall back to 1 for unknown element');
  });
});
