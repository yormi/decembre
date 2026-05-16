// Tests for nutrition/tomato/sidedress-recipe/spec.md
//
// Covers:
//   INV-1   — stage coverage closed (shape + non-negativity)
//   REQ-087 — mass-balance: chosen product sized to N gap after compost
//   REQ-088 — window.SidedressRecipeTomato public API namespace
//   REQ-089 — Ca-aware product gate
//
// Loads dist/index.html via jsdom (see ./test-helpers.mjs) so the model
// runs against its real dependency wiring (RECIPE_INPUTS, BIOMASS_DEMAND,
// TOMATO_FRUIT_EXPORT, PRODUCT_PCT, window.CompostContribution). Same
// boot pattern as scripts/check-recipes.mjs.
//
// Top-level await loads jsdom once before any describe block registers.
// node:test's `before` hook fires after describe-collection, which made
// the dynamic per-stage / per-product test loops below see `undefined`.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadAppWindow } from './test-helpers.mjs';

const { window, ph1 } = await loadAppWindow();

// ────────────────────────────────────────────────────────────────────────
// INV-1 — Stage coverage is closed
// ────────────────────────────────────────────────────────────────────────

describe('INV-1 — stage coverage is closed (shape + non-negativity)', () => {
  test('INV-1 — every stage in RECIPE_INPUTS.stageYield returns a numeric shape', () => {
    const offenders = [];
    for (const stage of Object.keys(ph1.RECIPE_INPUTS.stageYield)) {
      const result = ph1.computeStageSidedress(stage);
      for (const field of ['actisol_g', 'farine_g', 'alfalfa_g', 'g_per_planche']) {
        const value = result[field];
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
          offenders.push(`${stage}.${field}=${value}`);
        }
      }
      if (typeof result.chosen !== 'string' || result.chosen.length === 0) {
        offenders.push(`${stage}.chosen=${result.chosen}`);
      }
    }
    assert.deepEqual(offenders, [], offenders.join('; '));
  });
});

// ────────────────────────────────────────────────────────────────────────
// REQ-087 — Mass-balance: chosen product sized to N gap after compost
// ────────────────────────────────────────────────────────────────────────

describe('REQ-087 — chosen product sized to N gap after compost', () => {
  // Product field-name in the flat output. Mirrors the mapping inside
  // calc.js so a rename there fails this test loudly.
  const FIELD_FOR = {
    FarinePlumes: 'farine_g',
    AlfalfaMeal:  'alfalfa_g',
    Actisol:      'actisol_g',
  };

  function expectedGPerPlanche(stage, productKey) {
    const p = ph1.SIDEDRESS_PRODUCTS[productKey];
    const y = ph1.RECIPE_INPUTS.stageYield[stage] || 0;
    const biomassN = (ph1.BIOMASS_DEMAND[stage] && ph1.BIOMASS_DEMAND[stage].N) || 0;
    const compostN = window.CompostContribution.releasePerWeek.N;
    const offtake_mg = ph1.TOMATO_FRUIT_EXPORT.N.g * 1000 * y + biomassN;
    const compost_mg = compostN * 1000;
    const needed_mg  = Math.max(0, offtake_mg - compost_mg);
    const g_per_m2   = needed_mg / (p.n_pct * p.efficiency) / 1000;
    return Math.round(g_per_m2 * ph1.SIDEDRESS_AREA_PER_PLANCHE);
  }

  // Generate one test per (Ca-free product × stage). Stages come from
  // RECIPE_INPUTS.stageYield so the suite tracks any future stage addition.
  for (const productKey of ['FarinePlumes', 'AlfalfaMeal']) {
    for (const stage of ['T1', 'T2', 'T3', 'T4', 'T5']) {
      test(`REQ-087 — ${productKey} @ ${stage}: g_per_planche matches mass-balance ±5 g`, () => {
        const expected = expectedGPerPlanche(stage, productKey);
        const result   = ph1.computeStageSidedress(stage, productKey);
        const actual   = result[FIELD_FOR[productKey]];
        assert.equal(typeof actual, 'number');
        assert.ok(
          Math.abs(actual - expected) <= 5,
          `${productKey}/${stage}: ${FIELD_FOR[productKey]}=${actual} vs expected ${expected}`
        );
        // g_per_planche mirrors the chosen-product field
        assert.ok(
          Math.abs(result.g_per_planche - expected) <= 5,
          `${productKey}/${stage}: g_per_planche=${result.g_per_planche} vs expected ${expected}`
        );
      });
    }
  }

  test('REQ-087 — formula is product-agnostic (alfalfa : farine ratio = inverse of n_pct × eff at T5)', () => {
    // Same N gap, different denominators → ratio of doses equals the inverse
    // ratio of (n_pct × eff). Pinning this guards against a regression that
    // would couple the formula to one product's chemistry.
    const farine  = ph1.computeStageSidedress('T5', 'FarinePlumes').farine_g;
    const alfalfa = ph1.computeStageSidedress('T5', 'AlfalfaMeal').alfalfa_g;
    const fp = ph1.SIDEDRESS_PRODUCTS.FarinePlumes;
    const ap = ph1.SIDEDRESS_PRODUCTS.AlfalfaMeal;
    const expectedRatio = (fp.n_pct * fp.efficiency) / (ap.n_pct * ap.efficiency);
    const actualRatio   = alfalfa / farine;
    // 5 % tolerance to absorb rounding to whole grams at low doses.
    assert.ok(
      Math.abs(actualRatio - expectedRatio) / expectedRatio < 0.05,
      `T5 alfalfa/farine ratio=${actualRatio.toFixed(3)} vs expected ${expectedRatio.toFixed(3)}`
    );
  });

  test('REQ-087 — T1/T2 zero (vegetative N covered by compost residual alone)', () => {
    // Per derivation.md: at T1/T2 offtake ≤ compost release, so n_needed
    // clamps to 0. Pinned because the team relies on this to skip sidedress
    // before fruit set.
    for (const stage of ['T1', 'T2']) {
      const r = ph1.computeStageSidedress(stage, 'FarinePlumes');
      assert.equal(r.farine_g, 0, `${stage}: farine_g should be 0, got ${r.farine_g}`);
      assert.equal(r.g_per_planche, 0, `${stage}: g_per_planche should be 0`);
    }
  });

  test('REQ-087 — n_needed clamps at 0 (no negative dose when compost > offtake)', () => {
    // Defensive: if a future yield-curve revision brings stage demand below
    // compost release, the model must clamp instead of returning a negative
    // dose. T1/T2 already exercise this in current data; this test pins the
    // invariant explicitly across every stage.
    for (const stage of Object.keys(ph1.RECIPE_INPUTS.stageYield)) {
      const r = ph1.computeStageSidedress(stage, 'FarinePlumes');
      assert.ok(r.g_per_planche >= 0, `${stage}: g_per_planche=${r.g_per_planche} (must be ≥ 0)`);
      assert.ok(r.farine_g >= 0,      `${stage}: farine_g=${r.farine_g} (must be ≥ 0)`);
    }
  });
});

// ────────────────────────────────────────────────────────────────────────
// REQ-088 — Public API namespace window.SidedressRecipeTomato
// ────────────────────────────────────────────────────────────────────────

describe('REQ-088 — window.SidedressRecipeTomato public API', () => {
  test('REQ-088 — namespace exists at runtime', () => {
    assert.ok(window.SidedressRecipeTomato, 'window.SidedressRecipeTomato is missing');
  });

  test('REQ-088 — exposes required keys', () => {
    const SR = window.SidedressRecipeTomato;
    const expectedKeys = [
      'AREA_PER_PLANCHE',
      'PRODUCTS',
      'MINIMUM_EFFICIENCY',
      'FIRST_PRINCIPLES_BY_STAGE',
      'computeStageSidedress',
    ];
    const missing = expectedKeys.filter(k => SR[k] == null);
    assert.deepEqual(missing, [], `missing keys: ${missing.join(', ')}`);
  });

  test('REQ-088 — AREA_PER_PLANCHE is a positive number', () => {
    assert.equal(typeof window.SidedressRecipeTomato.AREA_PER_PLANCHE, 'number');
    assert.ok(window.SidedressRecipeTomato.AREA_PER_PLANCHE > 0);
  });

  test('REQ-088 — PRODUCTS is an object keyed by product name with n_pct/eff/ca_pct', () => {
    const products = window.SidedressRecipeTomato.PRODUCTS;
    assert.equal(typeof products, 'object');
    // PRODUCTS surfaces the table REQ-089 reads from. Each entry must
    // declare ca_pct so the gate has data to test against.
    for (const [key, p] of Object.entries(products)) {
      assert.equal(typeof p.ca_pct, 'number', `${key}.ca_pct must be a number`);
      assert.equal(typeof p.n_pct,  'number', `${key}.n_pct must be a number`);
      assert.equal(typeof p.efficiency, 'number', `${key}.efficiency must be a number`);
    }
  });

  test('REQ-088 — computeStageSidedress is a function returning the documented shape', () => {
    const SR = window.SidedressRecipeTomato;
    assert.equal(typeof SR.computeStageSidedress, 'function');
    const t5 = SR.computeStageSidedress('T5');
    assert.equal(typeof t5.farine_g,      'number');
    assert.equal(typeof t5.actisol_g,     'number');
    assert.equal(typeof t5.alfalfa_g,     'number');
    assert.equal(typeof t5.g_per_planche, 'number');
    assert.equal(typeof t5.chosen,        'string');
  });

  test('REQ-088 — FIRST_PRINCIPLES_BY_STAGE populated for every stage', () => {
    // wireFpSidedress IIFE in calc.js fills this at script load. Pinning
    // it here catches a regression where a renaming or load-order issue
    // leaves the skeleton object empty.
    const fp = window.SidedressRecipeTomato.FIRST_PRINCIPLES_BY_STAGE;
    for (const stage of ['T1', 'T2', 'T3', 'T4', 'T5']) {
      assert.ok(fp[stage], `FIRST_PRINCIPLES_BY_STAGE.${stage} missing`);
      assert.equal(typeof fp[stage].g_per_planche, 'number',
        `FIRST_PRINCIPLES_BY_STAGE.${stage}.g_per_planche not numeric`);
    }
  });

  test('REQ-088 — MINIMUM_EFFICIENCY retains backwards-compat keys for legacy consumers', () => {
    // Legacy consumers (calculateNutritionSupply, computeStageRecipe,
    // buildNutriment) still read these specific keys. Spec REQ-088 calls
    // out MINIMUM_EFFICIENCY explicitly as the derived backwards-compat view.
    const minimumEfficiency = window.SidedressRecipeTomato.MINIMUM_EFFICIENCY;
    for (const key of ['Actisol_N', 'Actisol_P', 'Actisol_K', 'FarinePlumes_N']) {
      assert.equal(typeof minimumEfficiency[key], 'number', `MINIMUM_EFFICIENCY.${key} must be a number`);
      assert.ok(minimumEfficiency[key] > 0 && minimumEfficiency[key] <= 1,
        `MINIMUM_EFFICIENCY.${key}=${minimumEfficiency[key]} must be in (0, 1]`);
    }
  });
});

// ────────────────────────────────────────────────────────────────────────
// REQ-089 — Ca-aware product gate
// ────────────────────────────────────────────────────────────────────────

describe('REQ-089 — Ca-aware product gate', () => {
  test('REQ-089 — chosen product is always Ca-free (default invocation, every stage)', () => {
    const stages = Object.keys(ph1.RECIPE_INPUTS.stageYield);
    const offenders = [];
    for (const stage of stages) {
      const r = ph1.computeStageSidedress(stage);
      const spec = ph1.SIDEDRESS_PRODUCTS[r.chosen];
      if (!spec) {
        offenders.push(`${stage}: chosen='${r.chosen}' not in SIDEDRESS_PRODUCTS`);
        continue;
      }
      if ((spec.ca_pct || 0) !== 0) {
        offenders.push(`${stage}: chosen='${r.chosen}' has ca_pct=${spec.ca_pct} (gate breached)`);
      }
    }
    assert.deepEqual(offenders, [], offenders.join('; '));
  });

  test('REQ-089 — explicit Ca-bearing request returns g_per_planche === 0 (defensive gate)', () => {
    // Iterate every entry with ca_pct > 0 — any new Ca-bearing product
    // gets gated automatically without verifier edits.
    const caBearing = Object.entries(ph1.SIDEDRESS_PRODUCTS)
      .filter(([_, p]) => (p.ca_pct || 0) > 0)
      .map(([k]) => k);
    assert.ok(
      caBearing.length >= 1,
      'expected ≥ 1 Ca-bearing product in SIDEDRESS_PRODUCTS for the defensive gate test (e.g. Actisol)'
    );
    const offenders = [];
    for (const product of caBearing) {
      for (const stage of Object.keys(ph1.RECIPE_INPUTS.stageYield)) {
        const r = ph1.computeStageSidedress(stage, product);
        if (r.g_per_planche !== 0) {
          offenders.push(`${product}/${stage}: g_per_planche=${r.g_per_planche} (expected 0)`);
        }
        // The per-product field for the rejected product must also be 0.
        const fieldFor = { FarinePlumes: 'farine_g', AlfalfaMeal: 'alfalfa_g', Actisol: 'actisol_g' };
        const field = fieldFor[product];
        if (field && r[field] !== 0) {
          offenders.push(`${product}/${stage}: ${field}=${r[field]} (expected 0 — Ca-bearing)`);
        }
      }
    }
    assert.deepEqual(offenders, [], offenders.join('; '));
  });

  test('REQ-089 — Actisol carries Ca > 0 in SIDEDRESS_PRODUCTS (gate has something to reject)', () => {
    // If Actisol's ca_pct ever drops to 0 (e.g. supplier reformulation or a
    // typo), the defensive-gate test above could pass vacuously. Pin the
    // input shape explicitly.
    const actisol = ph1.SIDEDRESS_PRODUCTS.Actisol;
    assert.ok(actisol, 'SIDEDRESS_PRODUCTS.Actisol missing — defensive-gate fixture removed');
    assert.ok(
      (actisol.ca_pct || 0) > 0,
      `expected Actisol.ca_pct > 0 for the gate fixture, got ${actisol.ca_pct}`
    );
  });

  test('REQ-089 — unknown product key returns g_per_planche === 0 (no crash)', () => {
    // Defensive: a typo or renamed product key should fall back to
    // all-zeros, not throw. Mirrors the `if (!spec || ...)` early-return
    // in calc.js.
    const r = ph1.computeStageSidedress('T5', 'NotARealProduct');
    assert.equal(r.g_per_planche, 0);
    assert.equal(r.farine_g, 0);
    assert.equal(r.actisol_g, 0);
    assert.equal(r.alfalfa_g, 0);
  });
});
