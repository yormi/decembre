// nutrition/ — domain-level cross-crop spec tests.
//
// Pins REQ-011 (channel-role coverage for every crop with a demand table
// at nutrition/<crop>/plant-needs/model/data.js).
//
// Discovery is filesystem-based: scans nutrition/<crop>/plant-needs/model/
// data.js, then asserts a sibling nutrition/<crop>/channel-role.js exists
// and that the CHANNEL_ROLE it exports covers every element in that crop's
// demand exports with channel fractions summing to 1.0 ± 0.05.
//
// Today only tomato qualifies (lettuce's demand table lives at
// nutrition/lettuce/plant-needs/data.js — different path). The test
// auto-extends when a future crop ships nutrition/<crop>/plant-needs/
// model/data.js + nutrition/<crop>/channel-role.js.
//
// Crop registry below names the demand-table variables to inspect per crop
// (variable names are crop-specific by design). Add an entry when a new
// crop qualifies; the discovery loop asserts coverage automatically.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadFixture } from './tomato/test-helpers.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Per-crop demand-table variable names exposed on the page's window scope.
// When a new crop adds nutrition/<crop>/plant-needs/model/data.js + a
// channel-role.js, register it here. The fixture's EXPOSE_NAMES list must
// also include any new variables.
const CROP_DEMAND_TABLES = {
  tomato: ['BIOMASS_DEMAND', 'TOMATO_FRUIT_EXPORT'],
};

const KNOWN_CHANNELS = new Set([
  'fertigation', 'sidedress', 'frontload', 'foliar', 'passive',
]);

// Discover crops with a demand table at the canonical path.
function discoverCrops() {
  const nutritionRoot = __dirname;
  const candidates = Object.keys(CROP_DEMAND_TABLES);
  return candidates.filter(crop =>
    existsSync(resolve(nutritionRoot, crop, 'plant-needs', 'model', 'data.js')));
}

// Collect element keys from a demand-table object. BIOMASS_DEMAND is keyed
// by stage → element → number; TOMATO_FRUIT_EXPORT is keyed by element →
// { g, unit }. Handle both shapes by walking one level then sniffing.
function collectDemandElements(table) {
  const elements = new Set();
  if (!table || typeof table !== 'object') return elements;
  for (const [key, value] of Object.entries(table)) {
    if (!value || typeof value !== 'object') continue;
    // Stage-keyed shape: value is { N: number, P: number, ... }
    const innerKeys = Object.keys(value);
    const looksLikeStage = innerKeys.length > 0
      && innerKeys.every(k => typeof value[k] === 'number');
    if (looksLikeStage) {
      for (const el of innerKeys) elements.add(el);
    } else {
      // Element-keyed shape: key is the element symbol itself.
      elements.add(key);
    }
  }
  return elements;
}

const fixture = await loadFixture();
if (!fixture.loaded) {
  throw new Error(`fixture failed to load: ${fixture.error || '__TEST_GLOBALS__ never populated'}`);
}
const G = fixture.globals;

test('REQ-011 — every crop with a demand table ships channel-role.js with full coverage + sum-to-1.0 ± 0.05', () => {
  const crops = discoverCrops();
  assert.ok(crops.length > 0, 'expected at least one crop with plant-needs/model/data.js');

  for (const crop of crops) {
    const channelRolePath = resolve(__dirname, crop, 'channel-role.js');
    assert.ok(existsSync(channelRolePath),
      `${crop}: nutrition/${crop}/channel-role.js missing (REQ-011)`);

    // CHANNEL_ROLE for tomato is exposed on window via the page boot.
    // For future crops, the fixture's EXPOSE_NAMES list must surface that
    // crop's CHANNEL_ROLE under a per-crop namespace; for now we read the
    // single CHANNEL_ROLE binding (tomato-only today).
    const channelRole = G.CHANNEL_ROLE;
    assert.ok(channelRole && typeof channelRole === 'object',
      `${crop}: CHANNEL_ROLE not exposed on window (boot order or include missing)`);

    // Union element set across all this crop's demand tables.
    const demandElements = new Set();
    for (const tableName of CROP_DEMAND_TABLES[crop]) {
      const table = G[tableName];
      assert.ok(table, `${crop}: demand table ${tableName} not exposed on window`);
      for (const el of collectDemandElements(table)) demandElements.add(el);
    }
    assert.ok(demandElements.size > 0,
      `${crop}: no demand elements discovered — demand table shape unexpected`);

    // Coverage: every demand element has a CHANNEL_ROLE entry.
    const missing = [...demandElements].filter(el => !channelRole[el]);
    assert.deepEqual(missing, [],
      `${crop}: demand elements missing from CHANNEL_ROLE: ${missing.join(', ')}`);

    // Sum-to-1.0 ± 0.05 per element + known channels only.
    for (const el of demandElements) {
      const channels = channelRole[el];
      assert.ok(channels && typeof channels === 'object',
        `${crop}: CHANNEL_ROLE.${el} is not an object`);
      const unknownChannels = Object.keys(channels)
        .filter(k => !KNOWN_CHANNELS.has(k));
      assert.deepEqual(unknownChannels, [],
        `${crop}: CHANNEL_ROLE.${el} uses unknown channel keys: ${unknownChannels.join(', ')}`);
      const sum = Object.values(channels).reduce((a, b) => a + b, 0);
      assert.ok(Math.abs(sum - 1.0) <= 0.05,
        `${crop}: CHANNEL_ROLE.${el} fractions sum to ${sum.toFixed(3)}, expected 1.0 ± 0.05`);
    }
  }
});

// ─── REQ-062 — Single fertigation tank per week ────────────────────────────
//
// Normative claims (rewritten 2026-05-24):
//   1. Tomato: at most ONE active fertigation recipe per stage
//      (STORED_RECIPE.tomato.fertigation[stage] is a single recipe object;
//      computeStageRecipe(stage) returns one recipe; no parallel sub-tanks
//      like {A: ..., B: ...}).
//   2. Lettuce: LETTUCE fertigation recipe is a FLAT object — one recipe,
//      no parallel sub-tanks (no nested {A,B}, no array shape).
//   3. The previous "single foliar spray per week" clause is RETIRED;
//      foliar frequency is governed by
//      nutrition/tomato/foliar-strategy — frequency-is-model-output.
//      Covered structurally: nutrition/spec.md REQ-062 must NOT pin any
//      foliar sprayCount ceiling. (Asserting that here would require
//      parsing spec.md prose; the cross-ref is captured by tests in
//      tomato/foliar-strategy/spec.test.mjs.)

test('REQ-062 — tomato fertigation: STORED_RECIPE.tomato.fertigation[stage] is a single recipe (no parallel sub-tanks)', () => {
  const stored = G.STORED_RECIPE;
  assert.ok(stored && stored.tomato && stored.tomato.fertigation,
    'STORED_RECIPE.tomato.fertigation not exposed on window');
  const fertigation = stored.tomato.fertigation;
  assert.ok(!Array.isArray(fertigation),
    'STORED_RECIPE.tomato.fertigation must be a stage-keyed object, not an array');
  const stages = Object.keys(fertigation);
  assert.ok(stages.length > 0,
    'STORED_RECIPE.tomato.fertigation has no stages');
  // Per stage: one recipe object, NOT a {A, B, ...} parallel-tank shape.
  // A parallel-tank shape would be detected by inner values themselves
  // being object recipes (each holding numeric product doses). A single
  // recipe holds numeric doses directly.
  for (const stage of stages) {
    const recipe = fertigation[stage];
    assert.ok(recipe && typeof recipe === 'object' && !Array.isArray(recipe),
      `STORED_RECIPE.tomato.fertigation.${stage} must be a recipe object`);
    const innerValues = Object.values(recipe);
    const parallelTanks = innerValues.filter(v =>
      v && typeof v === 'object' && !Array.isArray(v)
      && Object.values(v).some(x => typeof x === 'number'));
    assert.equal(parallelTanks.length, 0,
      `STORED_RECIPE.tomato.fertigation.${stage} appears to hold parallel sub-tanks `
      + `(${parallelTanks.length} nested recipe-shaped values); REQ-062 allows one recipe per stage`);
  }
});

test('REQ-062 — tomato fertigation: computeStageRecipe(stage) returns a single flat recipe (no parallel sub-tanks)', () => {
  const computeStageRecipe = G.computeStageRecipe;
  assert.equal(typeof computeStageRecipe, 'function',
    'computeStageRecipe not exposed on window');
  // Try common stage keys; tomato stages are T1..T6 per the model layer.
  const probeStages = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
  let probedAny = false;
  for (const stage of probeStages) {
    let recipe;
    try { recipe = computeStageRecipe(stage); } catch { continue; }
    if (!recipe || typeof recipe !== 'object') continue;
    probedAny = true;
    const parallelTanks = Object.values(recipe).filter(v =>
      v && typeof v === 'object' && !Array.isArray(v)
      && Object.values(v).some(x => typeof x === 'number'));
    assert.equal(parallelTanks.length, 0,
      `computeStageRecipe('${stage}') returned ${parallelTanks.length} nested recipe-shaped values; `
      + `REQ-062 requires a single flat recipe per stage`);
  }
  assert.ok(probedAny, 'computeStageRecipe accepted no probe stage from T1..T6');
});

test('REQ-062 — lettuce fertigation: LETTUCE is a flat object (one recipe, no parallel sub-tanks)', () => {
  const lettuce = G.LETTUCE;
  assert.ok(lettuce && typeof lettuce === 'object',
    'LETTUCE fertigation recipe not exposed on window (test-helpers EXPOSE_NAMES must include it)');
  assert.ok(!Array.isArray(lettuce),
    'LETTUCE must be a flat object, not an array');
  // Flat: every value is a number (a product dose). Any nested-object value
  // would indicate parallel sub-tanks ({A: {...}, B: {...}}).
  const nonNumericEntries = Object.entries(lettuce)
    .filter(([, v]) => typeof v !== 'number');
  assert.deepEqual(nonNumericEntries.map(([k]) => k), [],
    `LETTUCE has non-numeric entries (parallel sub-tanks?): ${nonNumericEntries.map(([k]) => k).join(', ')}`);
});

// ─── farm-working-days — single source-of-truth for the working-day set ────
//
// Per nutrition/spec.md § farm-working-days (added 2026-05-24): the set of
// weekdays Décembre's operator is on-farm. Currently {Mon, Tue, Wed, Thu,
// Fri}. Procedure-layer specs draw from this set. Until a Wave-2 coder
// lands the runtime constant, this test is RED — that is correct.
//
// Test pins option (a) from the leader's prompt: a runtime constant at
// `window.Nutrition.FARM_WORKING_DAYS` so every nutrition layer reads from
// one place. Foliar-strategy spec.test.mjs:167 already carries a `.todo`
// anticipating this exact shape.

test('farm-working-days — single source-of-truth runtime constant at window.Nutrition.FARM_WORKING_DAYS = [Mon..Fri]', () => {
  const nutrition = fixture.window.Nutrition;
  assert.ok(nutrition && typeof nutrition === 'object',
    'window.Nutrition namespace not present — farm-working-days runtime constant not yet wired (Wave 2)');
  const days = nutrition.FARM_WORKING_DAYS;
  assert.ok(Array.isArray(days),
    'window.Nutrition.FARM_WORKING_DAYS must be an array');
  assert.deepEqual([...days], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    `expected ['Mon','Tue','Wed','Thu','Fri']; got ${JSON.stringify(days)}`);
});
