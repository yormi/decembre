// Tests for nutrition/tomato/fertigation-recipe/spec.md.
//
// Coverage:
//   INV-1   — Stage coverage closed: every stage in RECIPE_INPUTS.stageYield
//             returns numeric, finite, non-negative kSulfate / mgSulfate /
//             solubore. Return shape grew to 3 keys per uptake-factor work.
//   Mass-balance derivation matches the formula (per stage,
//             ±5 g rounding tolerance for kSulfate and mgSulfate, ±2 g for
//             solubore). B1-REV (2026-05-15): compost release IS subtracted
//             from K, Mg, and B offtake (current-week supply, not bank).
//             Sidedress is subtracted from K only (Mg/B sidedress = 0 by
//             product chemistry). B2-REV (2026-05-15): plant demand is
//             divided by PH_UPTAKE_FACTOR_AT_CURRENT_SOIL[el] BEFORE the
//             subtractions — the bed→plant uptake-efficiency factor inflates
//             the bed-side target.
//   Public API namespace window.FertigationRecipeTomato shape
//             (FIRST_PRINCIPLES_T5 + computeStageRecipe).
//   wireFpFertigation pins FIRST_PRINCIPLES_T5_FERTIGATION and
//             FP_RECIPE_T5.fertigation to computeStageRecipe('T5') output
//             at boot. Covers all three keys (K2SO4, MgSO4-7H2O, Solubore).
//   Per-element bed→plant uptake-efficiency factor
//             PH_UPTAKE_FACTOR_AT_CURRENT_SOIL = { K: 0.90, Mg: 0.85,
//             B: 0.80 } applied to fertigation sizing. Function return shape
//             grew to { kSulfate, mgSulfate, solubore }.
//   computeFertigationSupply(stage, opts, recipe) delivers
//             per-element supply (mg/m²/wk) from a canonical g-keyed recipe.
//
// jsdom boot mirrors scripts/check-recipes.mjs — load dist/index.html
// because calc.js / model.js depend on globals declared elsewhere in the
// page (RECIPE_INPUTS, BIOMASS_DEMAND, TOMATO_FRUIT_EXPORT, PRODUCT_PCT,
// SIDEDRESS_*, STORED_RECIPE, TOMATO_NUMBER_BEDS, TOMATO_BED_AREA,
// FP_RECIPE_T5, FIRST_PRINCIPLES_T5_FERTIGATION,
// PH_UPTAKE_FACTOR_AT_CURRENT_SOIL).

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { loadAppWindow } from './test-helpers.mjs';

// Top-level await: the node:test runner does not reliably fire a top-level
// `before()` hook before subtests inside `describe()` blocks. Booting at
// module-load is the simplest reliable shape. The jsdom load is cached
// inside loadAppWindow() so repeated callers are cheap.
const { window, ph1 } = await loadAppWindow();

describe('INV-1 — Stage coverage is closed', () => {
  // For every stage in RECIPE_INPUTS.stageYield, computeStageRecipe(stage)
  // returns numeric kSulfate, mgSulfate, and solubore. No undefined, NaN,
  // negatives. Solubore added to the surface.
  test('INV-1 — every stage returns finite, non-negative kSulfate / mgSulfate / solubore', () => {
    const stages = Object.keys(ph1.RECIPE_INPUTS.stageYield);
    assert.ok(stages.length > 0, 'RECIPE_INPUTS.stageYield must enumerate stages');
    const offenders = [];
    for (const stage of stages) {
      const recipe = ph1.computeStageRecipe(stage);
      if (!recipe || typeof recipe !== 'object') {
        offenders.push(`${stage}: returned ${recipe}`);
        continue;
      }
      for (const key of ['kSulfate', 'mgSulfate', 'solubore']) {
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

describe('computeStageRecipe matches mass-balance formula (uptake-factor + compost + sidedress)', () => {
  // Recompute mass-balance from upstream constants and compare against
  // computeStageRecipe(stage). Formula per spec (B1-REV restored compost +
  // sidedress subtraction 2026-05-15; B2-REV added per-element uptake-factor
  // inflation same day:
  //
  //   demand_to_bed[el]   = demand[el] / PH_UPTAKE_FACTOR_AT_CURRENT_SOIL[el]
  //
  //   k_offtake_mg/m²/wk   = TOMATO_FRUIT_EXPORT.K × stageYield × 1000
  //                          + BIOMASS_DEMAND[stage].K
  //   k_sidedress_mg/m²/wk = STORED_RECIPE.tomato.sidedress[stage].actisol_g
  //                           × PRODUCT_PCT.Actisol_K × SIDEDRESS_MINIMUM_EFFICIENCY.Actisol_K × 1000
  //                           / SIDEDRESS_AREA_PER_PLANCHE
  //   k_compost_mg/m²/wk   = CompostContribution.releasePerWeek.K × 1000
  //   k_needed_mg/m²/wk    = max(0, k_demand_to_bed − k_sidedress − k_compost)
  //   kSulfate_g_total     = round(k_needed / 1000 / PRODUCT_PCT.K2SO4_K × total_area)
  //
  //   mg_offtake_mg/m²/wk  = TOMATO_FRUIT_EXPORT.Mg × stageYield × 1000
  //                          + BIOMASS_DEMAND[stage].Mg
  //   mg_compost_mg/m²/wk  = CompostContribution.releasePerWeek.Mg × 1000
  //   mg_needed_mg/m²/wk   = max(0, mg_demand_to_bed − mg_compost)   // sidedress carries no Mg
  //   mgSulfate_g_total    = round(mg_needed / 1000 / PRODUCT_PCT.MgSO4_Mg × total_area)
  //
  //   b_offtake_mg/m²/wk   = TOMATO_FRUIT_EXPORT.B × stageYield × 1000
  //                          + BIOMASS_DEMAND[stage].B
  //   b_compost_mg/m²/wk   = (CompostContribution.releasePerWeek.B || 0) × 1000
  //   b_needed_mg/m²/wk    = max(0, b_demand_to_bed − b_compost)
  //   solubore_g_total     = round(b_needed / 1000 / PRODUCT_PCT.Solubore_B × total_area)
  //
  // Tolerance ±5 g for K/Mg, ±2 g for Solubore — matches the verifier's
  // rounding margins (scripts/check-recipes.mjs mass-balance block).
  const TOLERANCE_KMG_G = 5;
  const TOLERANCE_B_G = 2;

  // CompostContribution.releasePerWeek is exposed on window (model.js
  // assigns window.CompostContribution at script load).
  const compostReleasePerWeek = (window.CompostContribution
    && window.CompostContribution.releasePerWeek) || {};

  test('required upstream globals are exposed', () => {
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
    assert.equal(typeof ph1.SIDEDRESS_MINIMUM_EFFICIENCY, 'object',
      'SIDEDRESS_MINIMUM_EFFICIENCY must be exposed');
    assert.equal(typeof ph1.STORED_RECIPE, 'object',
      'STORED_RECIPE must be exposed');
    assert.equal(typeof ph1.TOMATO_NUMBER_BEDS, 'number',
      'TOMATO_NUMBER_BEDS must be exposed');
    assert.equal(typeof ph1.TOMATO_BED_AREA, 'number',
      'TOMATO_BED_AREA must be exposed');
    assert.equal(typeof ph1.PH_UPTAKE_FACTOR_AT_CURRENT_SOIL, 'object',
      'PH_UPTAKE_FACTOR_AT_CURRENT_SOIL must be exposed');
    assert.equal(typeof window.CompostContribution, 'object',
      'window.CompostContribution must be exposed');
    assert.equal(typeof window.CompostContribution.releasePerWeek, 'object',
      'window.CompostContribution.releasePerWeek must be an object');
    assert.equal(typeof window.CompostContribution.releasePerWeek.K, 'number',
      'CompostContribution.releasePerWeek.K must be numeric');
    assert.equal(typeof window.CompostContribution.releasePerWeek.Mg, 'number',
      'CompostContribution.releasePerWeek.Mg must be numeric');
  });

  test('kSulfate matches (demand/uptake − sidedress − compost) for every stage', () => {
    const stages = Object.keys(ph1.RECIPE_INPUTS.stageYield);
    const totalArea = ph1.TOMATO_NUMBER_BEDS * ph1.TOMATO_BED_AREA;
    const kCompostMg = (compostReleasePerWeek.K || 0) * 1000;
    const uK = (ph1.PH_UPTAKE_FACTOR_AT_CURRENT_SOIL || {}).K || 1;
    const offenders = [];
    for (const stage of stages) {
      const stageYield = ph1.RECIPE_INPUTS.stageYield[stage] || 0;
      const sidedress = ph1.STORED_RECIPE.tomato.sidedress[stage]
        || { actisol_g: 0, farine_g: 0 };
      const biomass = ph1.BIOMASS_DEMAND[stage] || {};
      const kOfftakeMg = (ph1.TOMATO_FRUIT_EXPORT.K.g * 1000 * stageYield)
        + (biomass.K || 0);
      const kDemandToBedMg = kOfftakeMg / uK;
      // calc.js falls back to 0.85 if SIDEDRESS_MINIMUM_EFFICIENCY.K is undefined; the
      // canonical key is Actisol_K (also 0.85). Both produce identical math.
      const sidedressEfficiency = (ph1.SIDEDRESS_MINIMUM_EFFICIENCY && ph1.SIDEDRESS_MINIMUM_EFFICIENCY.Actisol_K) || 0.85;
      const kSidedressMg = (sidedress.actisol_g * ph1.PRODUCT_PCT.Actisol_K
        * sidedressEfficiency * 1000)
        / ph1.SIDEDRESS_AREA_PER_PLANCHE;
      const kNeededMg = Math.max(0, kDemandToBedMg - kSidedressMg - kCompostMg);
      const expectedKsulfate = Math.round(
        (kNeededMg / 1000 / ph1.PRODUCT_PCT.K2SO4_K) * totalArea
      );
      const recipe = ph1.computeStageRecipe(stage) || {};
      if (typeof recipe.kSulfate !== 'number'
          || Math.abs(recipe.kSulfate - expectedKsulfate) > TOLERANCE_KMG_G) {
        offenders.push(`${stage}: got kSulfate=${recipe.kSulfate}, expected ${expectedKsulfate}`);
      }
    }
    assert.equal(offenders.length, 0,
      `kSulfate drift from mass-balance formula:\n  ${offenders.join('\n  ')}`);
  });

  test('mgSulfate matches (demand/uptake − compost) for every stage (sidedress carries no Mg)', () => {
    const stages = Object.keys(ph1.RECIPE_INPUTS.stageYield);
    const totalArea = ph1.TOMATO_NUMBER_BEDS * ph1.TOMATO_BED_AREA;
    const mgCompostMg = (compostReleasePerWeek.Mg || 0) * 1000;
    const uMg = (ph1.PH_UPTAKE_FACTOR_AT_CURRENT_SOIL || {}).Mg || 1;
    const offenders = [];
    for (const stage of stages) {
      const stageYield = ph1.RECIPE_INPUTS.stageYield[stage] || 0;
      const biomass = ph1.BIOMASS_DEMAND[stage] || {};
      // Sidedress carries no Mg by product chemistry (spec); compost is
      // subtracted; demand divided by Mg uptake factor.
      const mgOfftakeMg = (ph1.TOMATO_FRUIT_EXPORT.Mg.g * 1000 * stageYield)
        + (biomass.Mg || 0);
      const mgDemandToBedMg = mgOfftakeMg / uMg;
      const mgNeededMg = Math.max(0, mgDemandToBedMg - mgCompostMg);
      const expectedMgSulfate = Math.round(
        (mgNeededMg / 1000 / ph1.PRODUCT_PCT.MgSO4_Mg) * totalArea
      );
      const recipe = ph1.computeStageRecipe(stage) || {};
      if (typeof recipe.mgSulfate !== 'number'
          || Math.abs(recipe.mgSulfate - expectedMgSulfate) > TOLERANCE_KMG_G) {
        offenders.push(`${stage}: got mgSulfate=${recipe.mgSulfate}, expected ${expectedMgSulfate}`);
      }
    }
    assert.equal(offenders.length, 0,
      `mgSulfate drift from mass-balance formula:\n  ${offenders.join('\n  ')}`);
  });

  test('solubore matches (demand/uptake − compost) for every stage (sidedress carries no B)', () => {
    const stages = Object.keys(ph1.RECIPE_INPUTS.stageYield);
    const totalArea = ph1.TOMATO_NUMBER_BEDS * ph1.TOMATO_BED_AREA;
    const bCompostMg = (compostReleasePerWeek.B || 0) * 1000;
    const uB = (ph1.PH_UPTAKE_FACTOR_AT_CURRENT_SOIL || {}).B || 1;
    const offenders = [];
    for (const stage of stages) {
      const stageYield = ph1.RECIPE_INPUTS.stageYield[stage] || 0;
      const biomass = ph1.BIOMASS_DEMAND[stage] || {};
      // B follows the same uniform-field convention as the macros: ×1000 →
      // mg/m²/wk regardless of the .unit annotation in TOMATO_FRUIT_EXPORT.
      const bOfftakeMg = (ph1.TOMATO_FRUIT_EXPORT.B.g * 1000 * stageYield)
        + (biomass.B || 0);
      const bDemandToBedMg = bOfftakeMg / uB;
      const bNeededMg = Math.max(0, bDemandToBedMg - bCompostMg);
      const expectedSolubore = Math.round(
        (bNeededMg / 1000 / ph1.PRODUCT_PCT.Solubore_B) * totalArea
      );
      const recipe = ph1.computeStageRecipe(stage) || {};
      if (typeof recipe.solubore !== 'number'
          || Math.abs(recipe.solubore - expectedSolubore) > TOLERANCE_B_G) {
        offenders.push(`${stage}: got solubore=${recipe.solubore}, expected ${expectedSolubore}`);
      }
    }
    assert.equal(offenders.length, 0,
      `solubore drift from mass-balance formula:\n  ${offenders.join('\n  ')}`);
  });

  // Per-stage numeric pins reported by the team-leader after B1-REV + B2-REV
  // (2026-05-15):
  //   T5 K₂SO₄        = 5 568 g (±5)  — was 4 953 pre-uptake-factor, +12 % lift
  //   T5 MgSO₄·7H₂O   = 1 963 g (±5)  — was 1 378, +42 %
  //   T5 Solubore     = 11 g (±2)     — was hand-coded 9, +22 %
  // These are derived numbers — the formula tests above are the load-bearing
  // assertions; these pins guard against silent shifts that match the
  // formula but contradict the agreed live values.
  test('T5 kSulfate pins at 5568 g (±5 g)', () => {
    const t5 = ph1.computeStageRecipe('T5') || {};
    assert.ok(typeof t5.kSulfate === 'number'
      && Math.abs(t5.kSulfate - 5568) <= TOLERANCE_KMG_G,
      `T5 kSulfate: got ${t5.kSulfate}, expected 5568 (±5)`);
  });

  test('T5 mgSulfate pins at 1963 g (±5 g)', () => {
    const t5 = ph1.computeStageRecipe('T5') || {};
    assert.ok(typeof t5.mgSulfate === 'number'
      && Math.abs(t5.mgSulfate - 1963) <= TOLERANCE_KMG_G,
      `T5 mgSulfate: got ${t5.mgSulfate}, expected 1963 (±5)`);
  });

  // Early-stage Mg clamp: with the uptake factor inflating demand by 1/0.85
  // (~+18 %), Mg no longer clamps to 0 across all of T1-T3. Live values per
  // probe: T1=0, T2=0, T3=264. Pin only the stages that still clamp.
  test('T1 and T2 mgSulfate clamp at 0 (compost > demand_to_bed)', () => {
    const offenders = [];
    for (const stage of ['T1', 'T2']) {
      const recipe = ph1.computeStageRecipe(stage) || {};
      if (recipe.mgSulfate !== 0) {
        offenders.push(`${stage}: got mgSulfate=${recipe.mgSulfate}, expected 0`);
      }
    }
    assert.equal(offenders.length, 0,
      `Early-stage Mg should clamp to 0 (compost release exceeds inflated demand):\n  ${offenders.join('\n  ')}`);
  });
});

describe('Public API namespace window.FertigationRecipeTomato', () => {
  const REQUIRED_KEYS = [
    'FIRST_PRINCIPLES_T5',
    'computeStageRecipe',
  ];

  test('window.FertigationRecipeTomato exists', () => {
    assert.ok(window.FertigationRecipeTomato,
      'window.FertigationRecipeTomato must be declared (model.js include order)');
    assert.equal(typeof window.FertigationRecipeTomato, 'object');
  });

  for (const key of REQUIRED_KEYS) {
    test(`namespace exposes ${key}`, () => {
      const namespace = window.FertigationRecipeTomato;
      assert.notEqual(namespace[key], undefined,
        `window.FertigationRecipeTomato.${key} must be present`);
      assert.notEqual(namespace[key], null,
        `window.FertigationRecipeTomato.${key} must be non-null`);
    });
  }

  test('FIRST_PRINCIPLES_T5 is an object with K2SO4 / MgSO4-7H2O / Solubore', () => {
    const fp = window.FertigationRecipeTomato.FIRST_PRINCIPLES_T5;
    assert.equal(typeof fp, 'object');
    for (const productKey of ['K2SO4', 'MgSO4-7H2O', 'Solubore']) {
      assert.equal(typeof fp[productKey], 'number',
        `FIRST_PRINCIPLES_T5["${productKey}"] must be a numeric gram value`);
      assert.ok(Number.isFinite(fp[productKey]) && fp[productKey] > 0,
        `FIRST_PRINCIPLES_T5["${productKey}"] must be positive and finite`);
    }
  });

  test('computeStageRecipe is a function', () => {
    assert.equal(typeof window.FertigationRecipeTomato.computeStageRecipe, 'function');
  });

  test('computeStageRecipe("T5") returns numeric kSulfate / mgSulfate / solubore', () => {
    const t5 = window.FertigationRecipeTomato.computeStageRecipe('T5');
    assert.equal(typeof t5, 'object');
    for (const key of ['kSulfate', 'mgSulfate', 'solubore']) {
      assert.equal(typeof t5[key], 'number',
        `computeStageRecipe('T5').${key} must be a number`);
      assert.ok(Number.isFinite(t5[key]) && t5[key] >= 0,
        `computeStageRecipe('T5').${key} must be finite and non-negative`);
    }
  });
});

describe('FIRST_PRINCIPLES_T5_FERTIGATION pinned to computeStageRecipe(T5) at boot', () => {
  // wireFpFertigation IIFE in calc.js writes computeStageRecipe('T5').
  // {kSulfate, mgSulfate, solubore} into FIRST_PRINCIPLES_T5_FERTIGATION
  // ['K2SO4' | 'MgSO4-7H2O' | 'Solubore'] at script load. Then the same
  // boot pass propagates those values into FP_RECIPE_T5.fertigation. With
  // the uptake-factor work the constant pins all three values (was two).
  // Exact equality — both sides come from the same function call at boot.
  test('FIRST_PRINCIPLES_T5_FERTIGATION.K2SO4 === computeStageRecipe(T5).kSulfate', () => {
    const t5 = ph1.computeStageRecipe('T5') || {};
    assert.equal(
      ph1.FIRST_PRINCIPLES_T5_FERTIGATION['K2SO4'],
      t5.kSulfate,
      `FIRST_PRINCIPLES.K2SO4=${ph1.FIRST_PRINCIPLES_T5_FERTIGATION['K2SO4']} vs computeStageRecipe.kSulfate=${t5.kSulfate}`
    );
  });

  test('FIRST_PRINCIPLES_T5_FERTIGATION["MgSO4-7H2O"] === computeStageRecipe(T5).mgSulfate', () => {
    const t5 = ph1.computeStageRecipe('T5') || {};
    assert.equal(
      ph1.FIRST_PRINCIPLES_T5_FERTIGATION['MgSO4-7H2O'],
      t5.mgSulfate,
      `FIRST_PRINCIPLES['MgSO4-7H2O']=${ph1.FIRST_PRINCIPLES_T5_FERTIGATION['MgSO4-7H2O']} vs computeStageRecipe.mgSulfate=${t5.mgSulfate}`
    );
  });

  test('FIRST_PRINCIPLES_T5_FERTIGATION.Solubore === computeStageRecipe(T5).solubore', () => {
    const t5 = ph1.computeStageRecipe('T5') || {};
    assert.equal(
      ph1.FIRST_PRINCIPLES_T5_FERTIGATION['Solubore'],
      t5.solubore,
      `FIRST_PRINCIPLES.Solubore=${ph1.FIRST_PRINCIPLES_T5_FERTIGATION['Solubore']} vs computeStageRecipe.solubore=${t5.solubore}`
    );
  });

  test('FP_RECIPE_T5.fertigation propagates the same three values', () => {
    const t5 = ph1.computeStageRecipe('T5') || {};
    const fert = (ph1.FP_RECIPE_T5 || {}).fertigation || {};
    assert.equal(fert['K2SO4'], t5.kSulfate,
      `FP_RECIPE_T5.fertigation.K2SO4=${fert['K2SO4']} vs ${t5.kSulfate}`);
    assert.equal(fert['MgSO4-7H2O'], t5.mgSulfate,
      `FP_RECIPE_T5.fertigation['MgSO4-7H2O']=${fert['MgSO4-7H2O']} vs ${t5.mgSulfate}`);
    assert.equal(fert['Solubore'], t5.solubore,
      `FP_RECIPE_T5.fertigation.Solubore=${fert['Solubore']} vs ${t5.solubore}`);
  });
});

describe('PH_UPTAKE_FACTOR_AT_CURRENT_SOIL: per-element bed→plant factor', () => {
  // Constant `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL` is declared in
  // nutrition/tomato/fertigation-recipe/data.js with B2-REV mid-band defaults
  // (cert 2 across the board). computeStageRecipe divides plant demand by
  // the per-element factor before subtracting compost+sidedress, AND adds a
  // B branch — return shape grew to { kSulfate, mgSulfate, solubore }.
  const EXPECTED_DEFAULTS = { K: 0.90, Mg: 0.85, B: 0.80 };

  test('PH_UPTAKE_FACTOR_AT_CURRENT_SOIL exposed with K=0.90, Mg=0.85, B=0.80', () => {
    const uf = ph1.PH_UPTAKE_FACTOR_AT_CURRENT_SOIL;
    assert.equal(typeof uf, 'object',
      'PH_UPTAKE_FACTOR_AT_CURRENT_SOIL must be declared in fertigation-recipe/data.js');
    const offenders = [];
    for (const el of Object.keys(EXPECTED_DEFAULTS)) {
      const value = uf[el];
      if (typeof value !== 'number' || !(value > 0) || value > 1) {
        offenders.push(`${el} must be a number in (0, 1], got ${value}`);
      } else if (Math.abs(value - EXPECTED_DEFAULTS[el]) > 1e-9) {
        offenders.push(`${el}=${value} vs expected B2-REV default ${EXPECTED_DEFAULTS[el]}`);
      }
    }
    assert.equal(offenders.length, 0,
      `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL shape/values:\n  ${offenders.join('\n  ')}`);
  });

  test('computeStageRecipe(T5) return value has all three keys (kSulfate, mgSulfate, solubore)', () => {
    const t5 = ph1.computeStageRecipe('T5') || {};
    for (const key of ['kSulfate', 'mgSulfate', 'solubore']) {
      assert.equal(typeof t5[key], 'number',
        `computeStageRecipe('T5').${key} must be a number (got ${typeof t5[key]})`);
      assert.ok(Number.isFinite(t5[key]),
        `computeStageRecipe('T5').${key} must be finite (got ${t5[key]})`);
      assert.ok(t5[key] >= 0,
        `computeStageRecipe('T5').${key} must be non-negative (got ${t5[key]})`);
    }
  });

  test('T5 solubore pins at 11 g (±2 g)', () => {
    const t5 = ph1.computeStageRecipe('T5') || {};
    assert.ok(typeof t5.solubore === 'number'
      && Math.abs(t5.solubore - 11) <= 2,
      `T5 solubore: got ${t5.solubore}, expected 11 (±2)`);
  });
});

describe('computeFertigationSupply(stage, opts, recipe)', () => {
  // Spec contract:
  //   - flat 11-element map { N,P,K,Ca,Mg,Fe,Mn,Zn,Cu,B,Mo } in mg/m²/wk
  //   - K     = recipe.kSulfate_g   × PRODUCT_PCT.K2SO4_K    × 1000 / total_area
  //   - Mg    = recipe.mgSulfate_g  × PRODUCT_PCT.MgSO4_Mg   × 1000 / total_area
  //   - B     = recipe.solubore_g   × PRODUCT_PCT.Solubore_B × 1000 / total_area
  //   - all other elements numerically 0
  //   - missing recipe keys default to 0
  //   - omitting recipe defaults to STORED_RECIPE.tomato.fertigation[stage]
  //     reshaped into the canonical g-keyed shape (kSulfate→kSulfate_g,
  //     mgSulfate→mgSulfate_g; no solubore — B is FP-only)
  //   - opts is reserved (no required keys today); opts=undefined must
  //     behave identically to opts={}
  const ELEMENTS_NON_FERT = ['N', 'P', 'Ca', 'Fe', 'Mn', 'Zn', 'Cu', 'Mo'];
  const ALL_ELEMENTS = ['N', 'P', 'K', 'Ca', 'Mg', 'Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo'];

  function getFn() {
    const namespace = window.FertigationRecipeTomato;
    return namespace && namespace.computeFertigationSupply;
  }

  test('computeFertigationSupply is exposed on window.FertigationRecipeTomato', () => {
    const fn = getFn();
    assert.equal(typeof fn, 'function',
      'window.FertigationRecipeTomato.computeFertigationSupply must be a function');
  });

  test('explicit recipe: K = kSulfate_g × K2SO4_K × 1000 / area (±1 mg)', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    const totalArea = ph1.TOMATO_NUMBER_BEDS * ph1.TOMATO_BED_AREA;
    const recipe = { kSulfate_g: 5568, mgSulfate_g: 1963, solubore_g: 11 };
    const supply = fn('T5', {}, recipe);
    const expectedK = 5568 * ph1.PRODUCT_PCT.K2SO4_K * 1000 / totalArea;
    assert.ok(Math.abs(supply.K - expectedK) < 1,
      `K supply: got ${supply.K}, expected ~${expectedK.toFixed(3)}`);
  });

  test('explicit recipe: Mg = mgSulfate_g × MgSO4_Mg × 1000 / area (±1 mg)', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    const totalArea = ph1.TOMATO_NUMBER_BEDS * ph1.TOMATO_BED_AREA;
    const recipe = { kSulfate_g: 5568, mgSulfate_g: 1963, solubore_g: 11 };
    const supply = fn('T5', {}, recipe);
    const expectedMg = 1963 * ph1.PRODUCT_PCT.MgSO4_Mg * 1000 / totalArea;
    assert.ok(Math.abs(supply.Mg - expectedMg) < 1,
      `Mg supply: got ${supply.Mg}, expected ~${expectedMg.toFixed(3)}`);
  });

  test('explicit recipe: B = solubore_g × Solubore_B × 1000 / area (±0.01 mg)', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    const totalArea = ph1.TOMATO_NUMBER_BEDS * ph1.TOMATO_BED_AREA;
    const recipe = { kSulfate_g: 5568, mgSulfate_g: 1963, solubore_g: 11 };
    const supply = fn('T5', {}, recipe);
    const expectedB = 11 * ph1.PRODUCT_PCT.Solubore_B * 1000 / totalArea;
    assert.ok(Math.abs(supply.B - expectedB) < 0.01,
      `B supply: got ${supply.B}, expected ~${expectedB.toFixed(4)}`);
  });

  test('non-fertigation elements (N,P,Ca,Fe,Mn,Zn,Cu,Mo) are numerically 0', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    const supply = fn('T5', {}, { kSulfate_g: 5568, mgSulfate_g: 1963, solubore_g: 11 });
    for (const element of ELEMENTS_NON_FERT) {
      assert.equal(supply[element], 0,
        `${element} must be numerically 0 (fertigation channel only carries K, Mg, B)`);
    }
  });

  test('return shape is the full 11-element map', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    const supply = fn('T5', {}, { kSulfate_g: 5568, mgSulfate_g: 1963, solubore_g: 11 });
    assert.equal(typeof supply, 'object');
    for (const element of ALL_ELEMENTS) {
      assert.equal(typeof supply[element], 'number',
        `supply.${element} must be a number (got ${typeof supply[element]})`);
      assert.ok(Number.isFinite(supply[element]),
        `supply.${element} must be finite`);
    }
  });

  test('missing recipe keys default to 0', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    const totalArea = ph1.TOMATO_NUMBER_BEDS * ph1.TOMATO_BED_AREA;
    // Only kSulfate_g supplied — mgSulfate_g and solubore_g default to 0.
    const supply = fn('T5', {}, { kSulfate_g: 5568 });
    const expectedK = 5568 * ph1.PRODUCT_PCT.K2SO4_K * 1000 / totalArea;
    assert.ok(Math.abs(supply.K - expectedK) < 1,
      `K supply: got ${supply.K}, expected ~${expectedK.toFixed(3)}`);
    assert.equal(supply.Mg, 0, 'Mg must default to 0 when mgSulfate_g omitted');
    assert.equal(supply.B,  0, 'B must default to 0 when solubore_g omitted');
  });

  test('opts defaults to {} (call signature accepts (stage, undefined, recipe))', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    const recipe = { kSulfate_g: 5568, mgSulfate_g: 1963, solubore_g: 11 };
    const withEmptyOpts   = fn('T5', {},        recipe);
    const withMissingOpts = fn('T5', undefined, recipe);
    for (const element of ['K', 'Mg', 'B']) {
      assert.equal(withMissingOpts[element], withEmptyOpts[element],
        `${element} must be identical with opts={} vs opts=undefined`);
    }
  });

  test('default recipe arg reshapes from STORED_RECIPE.tomato.fertigation[stage]', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    // For each stage, the default-arg call must equal the explicit-recipe
    // call when given the stored grams. STORED_RECIPE uses kSulfate /
    // mgSulfate keys (no solubore — B is FP-only); the canonical shape uses
    // kSulfate_g / mgSulfate_g / solubore_g. The reshape lives inside the
    // function (default-source convenience per spec). solubore_g defaults
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

  test('stage is used only for default-recipe lookup; explicit recipe is stage-independent', () => {
    const fn = getFn();
    if (typeof fn !== 'function') {
      assert.fail('computeFertigationSupply not yet implemented');
    }
    const recipe = { kSulfate_g: 5568, mgSulfate_g: 1963, solubore_g: 11 };
    const atT1 = fn('T1', {}, recipe);
    const atT5 = fn('T5', {}, recipe);
    for (const element of ['K', 'Mg', 'B']) {
      assert.equal(atT1[element], atT5[element],
        `${element} must be stage-independent when explicit recipe is supplied`);
    }
  });
});
