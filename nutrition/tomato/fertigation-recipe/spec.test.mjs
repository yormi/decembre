// Tests for nutrition/tomato/fertigation-recipe/spec.md.
//
// Coverage:
//   REQ-098 — Mass-balance derivation matches the formula (per stage,
//             ±5 g rounding tolerance for both kSulfate and mgSulfate).
//   REQ-099 — Public API namespace window.FertigationRecipeTomato shape.
//   REQ-151 — computeFertigationSupply(stage, opts, recipe) delivers
//             per-element supply (mg/m²/wk) from a canonical g-keyed recipe.
//             Tests pin the contract; if the function does not yet exist
//             the function-presence test fails informatively (Wave 2 coder
//             will land calc.js + model.js wiring).
//
// Out of scope here (covered by scripts/check-recipes.mjs):
//   INV-1 — Stage coverage closed across RECIPE_INPUTS.stageYield (the
//           verifier already loops every stage and asserts numeric ≥ 0).
//
// jsdom boot mirrors scripts/check-recipes.mjs — we load dist/index.html
// because calc.js / model.js depend on globals declared elsewhere in the
// page (RECIPE_INPUTS, BIOMASS_DEMAND, TOMATO_FRUIT_EXPORT, PRODUCT_PCT,
// SIDEDRESS_*, STORED_RECIPE, TOMATO_NUM_BEDS, TOMATO_BED_AREA,
// FP_RECIPE_T5, window.CompostContribution).

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';

import { loadAppWindow } from './test-helpers.mjs';

let window;
let ph1;

before(async () => {
  ({ window, ph1 } = await loadAppWindow());
});

describe('REQ-098 — computeStageRecipe matches mass-balance formula', () => {
  // Recompute the mass-balance derivation from upstream constants and
  // compare against computeStageRecipe(stage). Tolerance ±5 g matches
  // the verifier (rounding margin).
  const TOLERANCE_G = 5;

  test('REQ-098 — required upstream globals are exposed', () => {
    assert.equal(typeof ph1.computeStageRecipe, 'function',
      'computeStageRecipe must be exposed');
    assert.equal(typeof ph1.RECIPE_INPUTS, 'object',
      'RECIPE_INPUTS must be exposed');
    assert.equal(typeof ph1.RECIPE_INPUTS.stageYield, 'object',
      'RECIPE_INPUTS.stageYield must be an object');
    assert.equal(typeof ph1.TOMATO_FRUIT_EXPORT, 'object',
      'TOMATO_FRUIT_EXPORT must be exposed');
    assert.equal(typeof ph1.BIOMASS_DEMAND, 'object',
      'BIOMASS_DEMAND must be exposed');
    assert.equal(typeof ph1.PRODUCT_PCT, 'object',
      'PRODUCT_PCT must be exposed');
    assert.equal(typeof ph1.SIDEDRESS_AREA_PER_PLANCHE, 'number',
      'SIDEDRESS_AREA_PER_PLANCHE must be exposed');
    assert.equal(typeof ph1.SIDEDRESS_MIN_EFF, 'object',
      'SIDEDRESS_MIN_EFF must be exposed');
    assert.equal(typeof ph1.STORED_RECIPE, 'object',
      'STORED_RECIPE must be exposed');
    assert.equal(typeof ph1.TOMATO_NUM_BEDS, 'number',
      'TOMATO_NUM_BEDS must be exposed');
    assert.equal(typeof ph1.TOMATO_BED_AREA, 'number',
      'TOMATO_BED_AREA must be exposed');
    assert.equal(typeof window.CompostContribution, 'object',
      'window.CompostContribution must exist (compost subproject loads first)');
    assert.equal(typeof window.CompostContribution.releasePerWeek, 'object',
      'CompostContribution.releasePerWeek must be a per-element object');
  });

  test('REQ-098 — kSulfate matches the mass-balance formula for every stage', () => {
    const stages = Object.keys(ph1.RECIPE_INPUTS.stageYield);
    const totalArea = ph1.TOMATO_NUM_BEDS * ph1.TOMATO_BED_AREA;
    const compost = window.CompostContribution.releasePerWeek;
    const offenders = [];
    for (const stage of stages) {
      const stageYield = ph1.RECIPE_INPUTS.stageYield[stage] || 0;
      const sidedress = ph1.STORED_RECIPE.tomato.sidedress[stage]
        || { actisol_g: 0, farine_g: 0 };
      const biomass = ph1.BIOMASS_DEMAND[stage] || {};
      const kOfftakeMg = (ph1.TOMATO_FRUIT_EXPORT.K.g * 1000 * stageYield)
        + (biomass.K || 0);
      const kSidedressMg = (sidedress.actisol_g * ph1.PRODUCT_PCT.Actisol_K
        * (ph1.SIDEDRESS_MIN_EFF.K || 0.85) * 1000)
        / ph1.SIDEDRESS_AREA_PER_PLANCHE;
      const kCompostMg = (compost.K || 0) * 1000;
      const kNeededMg = Math.max(0, kOfftakeMg - kSidedressMg - kCompostMg);
      const expectedKsulfate = Math.round(
        (kNeededMg / 1000 / ph1.PRODUCT_PCT.K2SO4_K) * totalArea
      );
      const recipe = ph1.computeStageRecipe(stage) || {};
      if (typeof recipe.kSulfate !== 'number'
          || Math.abs(recipe.kSulfate - expectedKsulfate) > TOLERANCE_G) {
        offenders.push(`${stage}: got kSulfate=${recipe.kSulfate}, expected ${expectedKsulfate}`);
      }
    }
    assert.equal(offenders.length, 0,
      `kSulfate drift from mass-balance formula:\n  ${offenders.join('\n  ')}`);
  });

  test('REQ-098 — mgSulfate matches the mass-balance formula for every stage', () => {
    const stages = Object.keys(ph1.RECIPE_INPUTS.stageYield);
    const totalArea = ph1.TOMATO_NUM_BEDS * ph1.TOMATO_BED_AREA;
    const compost = window.CompostContribution.releasePerWeek;
    const offenders = [];
    for (const stage of stages) {
      const stageYield = ph1.RECIPE_INPUTS.stageYield[stage] || 0;
      const biomass = ph1.BIOMASS_DEMAND[stage] || {};
      // Sidedress carries no Mg by product chemistry (per spec).
      const mgOfftakeMg = (ph1.TOMATO_FRUIT_EXPORT.Mg.g * 1000 * stageYield)
        + (biomass.Mg || 0);
      const mgCompostMg = (compost.Mg || 0) * 1000;
      const mgNeededMg = Math.max(0, mgOfftakeMg - mgCompostMg);
      const expectedMgSulfate = Math.round(
        (mgNeededMg / 1000 / ph1.PRODUCT_PCT.MgSO4_Mg) * totalArea
      );
      const recipe = ph1.computeStageRecipe(stage) || {};
      if (typeof recipe.mgSulfate !== 'number'
          || Math.abs(recipe.mgSulfate - expectedMgSulfate) > TOLERANCE_G) {
        offenders.push(`${stage}: got mgSulfate=${recipe.mgSulfate}, expected ${expectedMgSulfate}`);
      }
    }
    assert.equal(offenders.length, 0,
      `mgSulfate drift from mass-balance formula:\n  ${offenders.join('\n  ')}`);
  });

  test('REQ-098 — every stage returns finite, non-negative kSulfate and mgSulfate', () => {
    const stages = Object.keys(ph1.RECIPE_INPUTS.stageYield);
    const offenders = [];
    for (const stage of stages) {
      const recipe = ph1.computeStageRecipe(stage);
      if (!recipe) {
        offenders.push(`${stage}: returned ${recipe}`);
        continue;
      }
      for (const key of ['kSulfate', 'mgSulfate']) {
        const value = recipe[key];
        if (typeof value !== 'number'
            || !Number.isFinite(value)
            || value < 0) {
          offenders.push(`${stage}.${key} = ${value}`);
        }
      }
    }
    assert.equal(offenders.length, 0,
      `Non-finite or negative output:\n  ${offenders.join('\n  ')}`);
  });
});

describe('REQ-099 — Public API namespace window.FertigationRecipeTomato', () => {
  const REQUIRED_KEYS = [
    'FIRST_PRINCIPLES_T5',
    'computeStageRecipe',
  ];

  test('REQ-099 — window.FertigationRecipeTomato exists', () => {
    assert.ok(window.FertigationRecipeTomato,
      'window.FertigationRecipeTomato must be declared (model.js include order)');
    assert.equal(typeof window.FertigationRecipeTomato, 'object');
  });

  for (const key of REQUIRED_KEYS) {
    test(`REQ-099 — namespace exposes ${key}`, () => {
      const namespace = window.FertigationRecipeTomato;
      assert.notEqual(namespace[key], undefined,
        `window.FertigationRecipeTomato.${key} must be present`);
      assert.notEqual(namespace[key], null,
        `window.FertigationRecipeTomato.${key} must be non-null`);
    });
  }

  test('REQ-099 — FIRST_PRINCIPLES_T5 is an object with K2SO4 / MgSO4-7H2O / Solubore', () => {
    const fp = window.FertigationRecipeTomato.FIRST_PRINCIPLES_T5;
    assert.equal(typeof fp, 'object');
    for (const productKey of ['K2SO4', 'MgSO4-7H2O', 'Solubore']) {
      assert.equal(typeof fp[productKey], 'number',
        `FIRST_PRINCIPLES_T5["${productKey}"] must be a numeric gram value`);
      assert.ok(Number.isFinite(fp[productKey]) && fp[productKey] > 0,
        `FIRST_PRINCIPLES_T5["${productKey}"] must be positive and finite`);
    }
  });

  test('REQ-099 — computeStageRecipe is a function', () => {
    assert.equal(typeof window.FertigationRecipeTomato.computeStageRecipe, 'function');
  });

  test('REQ-099 — computeStageRecipe("T5") returns numeric kSulfate and mgSulfate', () => {
    const t5 = window.FertigationRecipeTomato.computeStageRecipe('T5');
    assert.equal(typeof t5, 'object');
    assert.equal(typeof t5.kSulfate, 'number');
    assert.equal(typeof t5.mgSulfate, 'number');
    assert.ok(Number.isFinite(t5.kSulfate) && t5.kSulfate >= 0);
    assert.ok(Number.isFinite(t5.mgSulfate) && t5.mgSulfate >= 0);
  });
});

describe('REQ-151 — computeFertigationSupply(stage, opts, recipe)', () => {
  // Spec contract:
  //   - flat 11-element map { N,P,K,Ca,Mg,Fe,Mn,Zn,Cu,B,Mo } in mg/m²/wk
  //   - K     = recipe.kSulfate_g   × PRODUCT_PCT.K2SO4_K   × 1000 / total_area
  //   - Mg    = recipe.mgSulfate_g  × PRODUCT_PCT.MgSO4_Mg  × 1000 / total_area
  //   - B     = recipe.solubore_g   × PRODUCT_PCT.Solubore_B × 1000 / total_area
  //   - all other elements numerically 0
  //   - missing recipe keys default to 0
  //   - omitting recipe defaults to STORED_RECIPE.tomato.fertigation[stage]
  //     reshaped into the canonical g-keyed shape (kSulfate→kSulfate_g,
  //     mgSulfate→mgSulfate_g; no solubore — B is FP-only)
  //   - opts is reserved (no required keys today)
  //
  // If computeFertigationSupply does not yet exist in the namespace, the
  // first test fails loudly with the missing-key marker so the Wave 2 coder
  // sees exactly what's expected.
  const ELEMENTS_NON_FERT = ['N', 'P', 'Ca', 'Fe', 'Mn', 'Zn', 'Cu', 'Mo'];
  const ALL_ELEMENTS = ['N', 'P', 'K', 'Ca', 'Mg', 'Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo'];

  function getFn() {
    const namespace = window.FertigationRecipeTomato;
    return namespace && namespace.computeFertigationSupply;
  }

  test('REQ-151 — computeFertigationSupply is exposed on window.FertigationRecipeTomato', () => {
    const fn = getFn();
    assert.equal(typeof fn, 'function',
      'window.FertigationRecipeTomato.computeFertigationSupply must be a function');
  });

  test('REQ-151 — explicit recipe: K = kSulfate_g × K2SO4_K × 1000 / area (±1 mg)', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    const totalArea = ph1.TOMATO_NUM_BEDS * ph1.TOMATO_BED_AREA;
    const recipe = { kSulfate_g: 5167, mgSulfate_g: 1379, solubore_g: 9 };
    const supply = fn('T5', {}, recipe);
    const expectedK = 5167 * ph1.PRODUCT_PCT.K2SO4_K * 1000 / totalArea;
    assert.ok(Math.abs(supply.K - expectedK) < 1,
      `K supply: got ${supply.K}, expected ~${expectedK.toFixed(3)}`);
  });

  test('REQ-151 — explicit recipe: Mg = mgSulfate_g × MgSO4_Mg × 1000 / area (±1 mg)', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    const totalArea = ph1.TOMATO_NUM_BEDS * ph1.TOMATO_BED_AREA;
    const recipe = { kSulfate_g: 5167, mgSulfate_g: 1379, solubore_g: 9 };
    const supply = fn('T5', {}, recipe);
    const expectedMg = 1379 * ph1.PRODUCT_PCT.MgSO4_Mg * 1000 / totalArea;
    assert.ok(Math.abs(supply.Mg - expectedMg) < 1,
      `Mg supply: got ${supply.Mg}, expected ~${expectedMg.toFixed(3)}`);
  });

  test('REQ-151 — explicit recipe: B = solubore_g × Solubore_B × 1000 / area (±0.01 mg)', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    const totalArea = ph1.TOMATO_NUM_BEDS * ph1.TOMATO_BED_AREA;
    const recipe = { kSulfate_g: 5167, mgSulfate_g: 1379, solubore_g: 9 };
    const supply = fn('T5', {}, recipe);
    const expectedB = 9 * ph1.PRODUCT_PCT.Solubore_B * 1000 / totalArea;
    assert.ok(Math.abs(supply.B - expectedB) < 0.01,
      `B supply: got ${supply.B}, expected ~${expectedB.toFixed(4)}`);
  });

  test('REQ-151 — non-fertigation elements (N,P,Ca,Fe,Mn,Zn,Cu,Mo) are numerically 0', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    const supply = fn('T5', {}, { kSulfate_g: 5167, mgSulfate_g: 1379, solubore_g: 9 });
    for (const element of ELEMENTS_NON_FERT) {
      assert.equal(supply[element], 0,
        `${element} must be numerically 0 (fertigation channel only carries K, Mg, B)`);
    }
  });

  test('REQ-151 — return shape is the full 11-element map', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    const supply = fn('T5', {}, { kSulfate_g: 5167, mgSulfate_g: 1379, solubore_g: 9 });
    assert.equal(typeof supply, 'object');
    for (const element of ALL_ELEMENTS) {
      assert.equal(typeof supply[element], 'number',
        `supply.${element} must be a number (got ${typeof supply[element]})`);
      assert.ok(Number.isFinite(supply[element]),
        `supply.${element} must be finite`);
    }
  });

  test('REQ-151 — missing recipe keys default to 0', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    const totalArea = ph1.TOMATO_NUM_BEDS * ph1.TOMATO_BED_AREA;
    // Only kSulfate_g supplied — mgSulfate_g and solubore_g default to 0.
    const supply = fn('T5', {}, { kSulfate_g: 5167 });
    const expectedK = 5167 * ph1.PRODUCT_PCT.K2SO4_K * 1000 / totalArea;
    assert.ok(Math.abs(supply.K - expectedK) < 1,
      `K supply: got ${supply.K}, expected ~${expectedK.toFixed(3)}`);
    assert.equal(supply.Mg, 0, 'Mg must default to 0 when mgSulfate_g omitted');
    assert.equal(supply.B,  0, 'B must default to 0 when solubore_g omitted');
  });

  test('REQ-151 — opts defaults to {} (call signature accepts (stage, undefined, recipe))', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    const recipe = { kSulfate_g: 5167, mgSulfate_g: 1379, solubore_g: 9 };
    const withEmptyOpts   = fn('T5', {},        recipe);
    const withMissingOpts = fn('T5', undefined, recipe);
    for (const element of ['K', 'Mg', 'B']) {
      assert.equal(withMissingOpts[element], withEmptyOpts[element],
        `${element} must be identical with opts={} vs opts=undefined`);
    }
  });

  test('REQ-151 — default recipe arg reshapes from STORED_RECIPE.tomato.fertigation[stage]', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    // For each stage, the default-arg call must equal the explicit-recipe
    // call when given the stored grams. STORED_RECIPE uses kSulfate /
    // mgSulfate keys (no solubore — B is FP-only); the canonical shape uses
    // kSulfate_g / mgSulfate_g / solubore_g. The reshape lives inside the
    // function (default-source convenience per spec). Solubore_g defaults
    // to 0 because STORED_RECIPE has no B.
    const stages = Object.keys(ph1.STORED_RECIPE.tomato.fertigation);
    const offenders = [];
    for (const stage of stages) {
      const stored = ph1.STORED_RECIPE.tomato.fertigation[stage] || {};
      const equivalentRecipe = {
        kSulfate_g:  stored.kSulfate  || 0,
        mgSulfate_g: stored.mgSulfate || 0,
        solubore_g:  0,
      };
      const fromDefault  = fn(stage);
      const fromExplicit = fn(stage, {}, equivalentRecipe);
      for (const element of ['K', 'Mg', 'B']) {
        if (Math.abs(fromDefault[element] - fromExplicit[element]) > 0.001) {
          offenders.push(
            `${stage}.${element}: default=${fromDefault[element]} vs explicit=${fromExplicit[element]}`
          );
        }
      }
    }
    assert.equal(offenders.length, 0,
      `Default-arg reshape drift:\n  ${offenders.join('\n  ')}`);
  });

  test('REQ-151 — stage is used only for default-recipe lookup; explicit recipe is stage-independent', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    const recipe = { kSulfate_g: 5167, mgSulfate_g: 1379, solubore_g: 9 };
    const atT1 = fn('T1', {}, recipe);
    const atT5 = fn('T5', {}, recipe);
    for (const element of ['K', 'Mg', 'B']) {
      assert.equal(atT1[element], atT5[element],
        `${element} must be stage-independent when explicit recipe is supplied`);
    }
  });
});
