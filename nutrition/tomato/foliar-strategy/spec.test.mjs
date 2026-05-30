// Subproject-level spec tests — pins the three SLUG-based rules in
// nutrition/tomato/foliar-strategy/spec.md against the live model output.
//
// SLUG coverage:
//   strategy-contains-recipes              — strategy.recipes is an array of
//                                            independent in-tank-ksp-precipitation-guard-clean recipes
//   frequency-is-model-output              — sprayCount comes from the model
//                                            (computeFoliarStrategy), not the
//                                            operator UI
//   sprays-spread-across-farm-working-days — recipe.days ⊆ {Mon..Fri}
//
// Layer-level (model) numerics are tested in
// foliar-strategy/model/spec.test.mjs. This file owns the subproject-level
// shape contract only.
//
// Framework: node:test only. Reuses the jsdom fixture from
// foliar-strategy/model/test-helpers.mjs.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFoliarFixture } from './model/test-helpers.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const win = loadFoliarFixture();

// Farm working days set per `nutrition — farm-working-days` in
// nutrition/spec.md. Kept inline here (no shared constant module yet — flagged
// in report).
const FARM_WORKING_DAYS = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

// Realistic non-zero gap that exercises all four oligo elements so the
// strategy produces a non-empty plan.
const SAMPLE_GAP = { Mn: 50, Zn: 20, Cu: 5, Fe: 80, B: 10 };

describe('strategy-contains-recipes — strategy comprises a list of independent recipes', () => {
  test('strategy-contains-recipes — computeFoliarStrategy returns { recipes: [...] }', () => {
    const FRT = win.FoliarRecipeTomato;
    const strategy = FRT.computeFoliarStrategy('T5', SAMPLE_GAP);
    assert.ok(strategy && typeof strategy === 'object',
      'strategy must be an object');
    assert.ok(Array.isArray(strategy.recipes),
      `strategy.recipes must be an array; got ${typeof strategy.recipes}`);
    assert.ok(strategy.recipes.length >= 1,
      `strategy must contain ≥1 recipe; got ${strategy.recipes.length}`);
  });

  test('strategy-contains-recipes — each recipe carries the per-recipe in-tank-ksp-precipitation-guard contract shape', () => {
    // Per spec.md § strategy-contains-recipes + model/spec.md strategy-is-independent-recipes:
    // each recipe is independent (own kind, own targetElements, own doses,
    // own sprayCount, own days, own weeklyLeafToleranceCap).
    const FRT = win.FoliarRecipeTomato;
    const { recipes } = FRT.computeFoliarStrategy('T5', SAMPLE_GAP);
    for (const recipe of recipes) {
      assert.equal(typeof recipe.kind, 'string',
        `recipe.kind must be string; got ${typeof recipe.kind}`);
      assert.ok(Array.isArray(recipe.targetElements),
        `recipe.targetElements must be array; got ${typeof recipe.targetElements}`);
      assert.ok(recipe.targetElements.length >= 1,
        `recipe.targetElements must be non-empty for kind=${recipe.kind}`);
      assert.equal(typeof recipe.doses, 'object',
        `recipe.doses must be object; got ${typeof recipe.doses}`);
      assert.equal(typeof recipe.sprayCount, 'number',
        `recipe.sprayCount must be number; got ${typeof recipe.sprayCount}`);
      assert.ok(Number.isInteger(recipe.sprayCount),
        `recipe.sprayCount must be integer; got ${recipe.sprayCount}`);
      assert.ok(Array.isArray(recipe.days),
        `recipe.days must be array; got ${typeof recipe.days}`);
      assert.equal(typeof recipe.weeklyLeafToleranceCap, 'number',
        `recipe.weeklyLeafToleranceCap must be number; got ${typeof recipe.weeklyLeafToleranceCap}`);
    }
  });

  test('strategy-contains-recipes — recipes are independent (distinct targetElements per kind)', () => {
    // Independence is structural: each recipe has its own target element set
    // (oligo → Mn/Zn/Cu/Fe/B; Ca → Ca when it lands). No element appears in
    // two recipe targetElements lists simultaneously (cross-recipe in-tank-ksp-precipitation-guard
    // satisfied automatically — see model/spec.md strategy-is-independent-recipes).
    const FRT = win.FoliarRecipeTomato;
    const { recipes } = FRT.computeFoliarStrategy('T5', SAMPLE_GAP);
    const seen = new Map(); // element -> kind
    for (const recipe of recipes) {
      for (const el of recipe.targetElements) {
        assert.ok(!seen.has(el),
          `element ${el} appears in two recipes (${seen.get(el)} and ${recipe.kind}) — recipes must be independent`);
        seen.set(el, recipe.kind);
      }
    }
  });
});

describe('frequency-is-model-output — sprayCount comes from the model, not the operator', () => {
  test('frequency-is-model-output — computeFoliarStrategy emits an integer sprayCount per recipe', () => {
    // Spec: "The number of times each recipe is sprayed per week is computed
    // by the model, not entered by the operator." Structural pin: the model
    // emits sprayCount; operator-side input is retired.
    const FRT = win.FoliarRecipeTomato;
    const { recipes } = FRT.computeFoliarStrategy('T5', SAMPLE_GAP);
    for (const recipe of recipes) {
      assert.ok(Number.isInteger(recipe.sprayCount),
        `recipe.sprayCount must be a model-computed integer for kind=${recipe.kind}; got ${recipe.sprayCount}`);
      assert.ok(recipe.sprayCount >= 0,
        `recipe.sprayCount must be ≥0; got ${recipe.sprayCount}`);
      assert.ok(recipe.sprayCount <= recipe.weeklyLeafToleranceCap,
        `recipe.sprayCount (${recipe.sprayCount}) must be ≤ weeklyLeafToleranceCap (${recipe.weeklyLeafToleranceCap}) for kind=${recipe.kind}`);
    }
  });

  test('frequency-is-model-output — sprayCount responds to gap input (deterministic model output)', () => {
    // If sprayCount were an operator input it would be invariant under gap
    // changes. Confirm the model varies sprayCount with the gap: zero gap →
    // zero sprays; non-zero gap → ≥1 spray on the targeted recipe.
    const FRT = win.FoliarRecipeTomato;
    const zeroGap = { Mn: 0, Zn: 0, Cu: 0, Fe: 0, B: 0 };
    const zeroStrategy = FRT.computeFoliarStrategy('T5', zeroGap);
    for (const recipe of zeroStrategy.recipes) {
      assert.equal(recipe.sprayCount, 0,
        `zero gap must yield zero sprays for kind=${recipe.kind}; got ${recipe.sprayCount}`);
    }
    const nonZeroStrategy = FRT.computeFoliarStrategy('T5', SAMPLE_GAP);
    const oligo = nonZeroStrategy.recipes.find(r => r.kind === 'oligo');
    assert.ok(oligo, 'oligo recipe must exist in strategy');
    assert.ok(oligo.sprayCount >= 1,
      `non-zero gap must yield ≥1 spray on oligo; got ${oligo.sprayCount}`);
  });

  test.todo('frequency-is-model-output — no operator-side sprayCount input in builder/operator/procedure (grep)', // eslint-disable-line
    // Structural grep would fail today because builder/operator/procedure
    // implementation files for the multi-recipe strategy haven't shipped
    // yet (only spec.md present in those dirs; operator/logic.js and
    // procedure/steps.js exist but contain no sprayCount references).
    // Enable when downstream code lands so we can pin "no sprayCount DOM
    // input → only reads from FRT.computeFoliarStrategy output".
  );
});

describe('sprays-spread-across-farm-working-days — recipe.days ⊆ {Mon..Fri}', () => {
  test('sprays-spread-across-farm-working-days — every day in every recipe is a farm working day', () => {
    const FRT = win.FoliarRecipeTomato;
    const { recipes } = FRT.computeFoliarStrategy('T5', SAMPLE_GAP);
    for (const recipe of recipes) {
      for (const day of recipe.days) {
        assert.ok(FARM_WORKING_DAYS.has(day),
          `recipe ${recipe.kind} scheduled on ${day}, which is not a farm working day (allowed: ${[...FARM_WORKING_DAYS].join(', ')})`);
      }
    }
  });

  test('sprays-spread-across-farm-working-days — recipe.days length matches sprayCount', () => {
    // The day-assignment rule must place exactly sprayCount days; no
    // duplicates, no extras, no gaps. Spread evenness is governed by
    // model/spec.md sprays-spread-across-farm-working-days and tested at the model layer; here we pin the
    // length contract.
    const FRT = win.FoliarRecipeTomato;
    const { recipes } = FRT.computeFoliarStrategy('T5', SAMPLE_GAP);
    for (const recipe of recipes) {
      assert.equal(recipe.days.length, recipe.sprayCount,
        `recipe ${recipe.kind}: days.length=${recipe.days.length} must equal sprayCount=${recipe.sprayCount}`);
      const unique = new Set(recipe.days);
      assert.equal(unique.size, recipe.days.length,
        `recipe ${recipe.kind}: days must be unique; got ${JSON.stringify(recipe.days)}`);
    }
  });

  test.todo('sprays-spread-across-farm-working-days — FARM_WORKING_DAYS read from shared constant', // eslint-disable-line
    // The set {Mon..Fri} is currently inlined in this test (matches
    // nutrition/spec.md § farm-working-days literal). When that slug lands
    // as a runtime constant (e.g. window.Nutrition.FARM_WORKING_DAYS),
    // replace the inline Set with the import and add an equality assertion.
  );
});
