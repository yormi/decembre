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
