// nutrition/tomato/ — integration-level spec tests.
//
// Pins the four REQs declared in nutrition/tomato/spec.md:
//   - REQ-011 — CHANNEL_ROLE covers every demand element
//   - REQ-013 — Σ(channel_supply) ≥ 0.9 × demand (under-fert guard)
//   - REQ-014 — Σ(channel_supply) ≤ 1.3 × demand (luxury / waste guard)
//   - REQ-033 — TOMATO_REMOVAL biased toward high end of refs (N/P/K/Mg)
//
// These claims are integration-shaped: they assert how the children
// (plant-needs / fertigation-recipe / sidedress-recipe / foliar-recipe +
// the cross-cutting CHANNEL_ROLE / ACCEPTED_*) compose. The fixture in
// test-helpers.mjs assembles app/index.html + every @included partial in
// memory and boots jsdom so window.<Namespace> bindings populate.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadFixture } from './test-helpers.mjs';

// Top-level await — the fixture must populate window.__TEST_GLOBALS__ before
// any describe-block is registered (node:test resolves describe bodies
// synchronously at module load, then runs tests; before() hooks at module
// scope don't fire early enough for assertions inside describe-test bodies).
const fixture = await loadFixture();
if (!fixture.loaded) {
  throw new Error(`fixture failed to load: ${fixture.error || '__TEST_GLOBALS__ never populated'}`);
}
const G = fixture.globals;

// ─── REQ-011 — CHANNEL_ROLE covers every demand element ────────────────
//
// Demand elements = union of keys across BIOMASS_DEMAND.T1..T5 ∪
// TOMATO_FRUIT_EXPORT. CHANNEL_ROLE must declare an entry for each.

describe('REQ-011 — CHANNEL_ROLE covers every demand element', () => {
  test('CHANNEL_ROLE / BIOMASS_DEMAND / TOMATO_FRUIT_EXPORT exposed', () => {
    assert.ok(G.CHANNEL_ROLE, 'CHANNEL_ROLE missing on window');
    assert.ok(G.BIOMASS_DEMAND, 'BIOMASS_DEMAND missing on window');
    assert.ok(G.TOMATO_FRUIT_EXPORT, 'TOMATO_FRUIT_EXPORT missing on window');
  });

  test('REQ-011 — every BIOMASS_DEMAND[stage] element appears in CHANNEL_ROLE', () => {
    const demandElements = new Set();
    for (const stage of ['T1', 'T2', 'T3', 'T4', 'T5']) {
      const row = G.BIOMASS_DEMAND[stage] || {};
      for (const el of Object.keys(row)) demandElements.add(el);
    }
    const missing = [...demandElements].filter(el => !G.CHANNEL_ROLE[el]);
    assert.deepEqual(missing, [],
      `BIOMASS_DEMAND elements missing from CHANNEL_ROLE: ${missing.join(', ')}`);
  });

  test('REQ-011 — every TOMATO_FRUIT_EXPORT element appears in CHANNEL_ROLE', () => {
    const exportElements = Object.keys(G.TOMATO_FRUIT_EXPORT);
    const missing = exportElements.filter(el => !G.CHANNEL_ROLE[el]);
    assert.deepEqual(missing, [],
      `TOMATO_FRUIT_EXPORT elements missing from CHANNEL_ROLE: ${missing.join(', ')}`);
  });

  test('REQ-011 — each CHANNEL_ROLE entry uses only known channel keys', () => {
    const KNOWN = new Set(['fertigation', 'sidedress', 'frontload', 'foliar', 'passive']);
    const offenders = [];
    for (const [el, channels] of Object.entries(G.CHANNEL_ROLE)) {
      for (const channel of Object.keys(channels)) {
        if (!KNOWN.has(channel)) offenders.push(`${el}.${channel}`);
      }
    }
    assert.deepEqual(offenders, [],
      `CHANNEL_ROLE uses unknown channel keys: ${offenders.join(', ')}`);
  });
});

// ─── REQ-013 / REQ-014 — supply ratio bounds per (stage × macro) ──────
//
// Mirrors the supply chain in scripts/check-recipes.mjs:
//   supply = compost release + sidedress effective + fertigation effective
// Foliar is omitted from the macro check (foliar delivers micros only per
// CHANNEL_ROLE). MASS_BALANCE_ELEMENTS = N/P/K/Mg matches the verifier's
// scope. Soil pH = 7.4 (April 2026 Berger tomato bed; current crisis baseline).
//
// Stages with stageYield = 0 (T1, T2) still have biomass demand ≠ 0, so we
// assert the bound on every (stage, macro) where demand > 0.

const STAGES = ['T1', 'T2', 'T3', 'T4', 'T5'];
const MASS_BALANCE_ELEMENTS = ['N', 'P', 'K', 'Mg'];
const SOIL_PH_NOW = 7.4;

function stageDemandMg(stage, el) {
  if (!G.TOMATO_FRUIT_EXPORT || !G.BIOMASS_DEMAND || !G.RECIPE_INPUTS) return 0;
  const yieldKg = (G.RECIPE_INPUTS.stageYield || {})[stage] || 0;
  const fruit_g = (G.TOMATO_FRUIT_EXPORT[el] && G.TOMATO_FRUIT_EXPORT[el].g) || 0;
  const fruit_mg = fruit_g * 1000 * yieldKg;
  const bio_mg = (G.BIOMASS_DEMAND[stage] || {})[el] || 0;
  return fruit_mg + bio_mg;
}

function compostReleaseMg(el) {
  if (!G.COMPOST_RELEASE_PER_WEEK) return 0;
  return (G.COMPOST_RELEASE_PER_WEEK[el] || 0) * 1000;  // g→mg
}

function sidedressEffectiveMg(stage, el) {
  const sidedressTable = G.STORED_RECIPE && G.STORED_RECIPE.tomato
    && G.STORED_RECIPE.tomato.sidedress;
  if (!sidedressTable || !G.PRODUCT_PCT || !G.SIDEDRESS_MIN_EFF) return 0;
  const sidedress = sidedressTable[stage] || { actisol_g: 0, farine_g: 0 };
  const area = G.SIDEDRESS_AREA_PER_PLANCHE || 54.7;
  let mg_per_m2 = 0;
  if (el === 'N') {
    mg_per_m2 += (sidedress.actisol_g * (G.PRODUCT_PCT.Actisol_N || 0)
      * (G.SIDEDRESS_MIN_EFF.Actisol_N || 0.6) * 1000) / area;
    mg_per_m2 += (sidedress.farine_g * (G.PRODUCT_PCT.FarinePlumes_N || 0)
      * (G.SIDEDRESS_MIN_EFF.FarinePlumes_N || 0.75) * 1000) / area;
  } else if (el === 'P') {
    mg_per_m2 += (sidedress.actisol_g * (G.PRODUCT_PCT.Actisol_P || 0)
      * (G.SIDEDRESS_MIN_EFF.Actisol_P || 0.5) * 1000) / area;
  } else if (el === 'K') {
    mg_per_m2 += (sidedress.actisol_g * (G.PRODUCT_PCT.Actisol_K || 0)
      * (G.SIDEDRESS_MIN_EFF.Actisol_K || 0.85) * 1000) / area;
  }
  return mg_per_m2;
}

function fertigationEffectiveMg(stage, el, soilPh) {
  if (typeof G.computeStageRecipe !== 'function' || !G.PRODUCT_PCT
    || !G.TOMATO_NUM_BEDS || !G.TOMATO_BED_AREA) return 0;
  const recipe = G.computeStageRecipe(stage) || {};
  const totalArea = G.TOMATO_NUM_BEDS * G.TOMATO_BED_AREA;
  let mg_per_m2 = 0;
  if (el === 'K') {
    const eff = (G.effectiveEff && G.PRODUCT && G.PRODUCT.K2SO4)
      ? Math.max(0.05, G.effectiveEff('K2SO4', 'K', soilPh))
      : 1.0;
    const mg_total = (recipe.kSulfate || 0) * (G.PRODUCT_PCT.K2SO4_K || 0.415) * 1000 * eff;
    mg_per_m2 = mg_total / totalArea;
  } else if (el === 'Mg') {
    const eff = (G.effectiveEff && G.PRODUCT && G.PRODUCT['MgSO4-7H2O'])
      ? Math.max(0.05, G.effectiveEff('MgSO4-7H2O', 'Mg', soilPh))
      : 1.0;
    const mg_total = (recipe.mgSulfate || 0) * (G.PRODUCT_PCT.MgSO4_Mg || 0.0986) * 1000 * eff;
    mg_per_m2 = mg_total / totalArea;
  }
  return mg_per_m2;
}

function totalSupplyMg(stage, el) {
  return compostReleaseMg(el)
    + sidedressEffectiveMg(stage, el)
    + fertigationEffectiveMg(stage, el, SOIL_PH_NOW);
}

describe('REQ-013 — Σ(channel_supply) ≥ 0.9 × demand (under-fert guard)', () => {
  test('required globals exposed', () => {
    assert.equal(typeof G.computeStageRecipe, 'function', 'computeStageRecipe missing');
    assert.ok(G.STORED_RECIPE && G.STORED_RECIPE.tomato && G.STORED_RECIPE.tomato.sidedress,
      'STORED_RECIPE.tomato.sidedress missing');
    assert.ok(G.RECIPE_INPUTS, 'RECIPE_INPUTS missing');
    assert.ok(Array.isArray(G.ACCEPTED_DEFICITS), 'ACCEPTED_DEFICITS not an array');
  });

  test('REQ-013 — every (stage × macro) ≥ 0.9 × demand or annotated in ACCEPTED_DEFICITS', () => {
    const offenders = [];
    for (const stage of STAGES) {
      for (const el of MASS_BALANCE_ELEMENTS) {
        const demand = stageDemandMg(stage, el);
        if (demand <= 0) continue;
        const supply = totalSupplyMg(stage, el);
        const ratio = supply / demand;
        if (ratio < 0.90) {
          const accepted = G.ACCEPTED_DEFICITS.find(
            d => d.stage === stage && d.element === el);
          if (!accepted) {
            offenders.push(`${stage}.${el}: supply=${supply.toFixed(0)} `
              + `demand=${demand.toFixed(0)} ratio=${ratio.toFixed(2)} `
              + `(no ACCEPTED_DEFICITS annotation)`);
          }
        }
      }
    }
    assert.deepEqual(offenders, [],
      `REQ-013 violations:\n  ${offenders.join('\n  ')}`);
  });

  test('REQ-013 — every ACCEPTED_DEFICITS entry carries a non-empty `reason`', () => {
    const empty = G.ACCEPTED_DEFICITS.filter(d => !d.reason || !d.reason.trim());
    assert.equal(empty.length, 0,
      `ACCEPTED_DEFICITS entries without reason: ${empty.map(d => `${d.stage}.${d.element}`).join(', ')}`);
  });
});

describe('REQ-014 — Σ(channel_supply) ≤ 1.3 × demand (luxury / waste guard)', () => {
  test('required globals exposed', () => {
    assert.equal(typeof G.computeStageRecipe, 'function', 'computeStageRecipe missing');
    assert.ok(Array.isArray(G.ACCEPTED_EXCESSES), 'ACCEPTED_EXCESSES not an array');
  });

  test('REQ-014 — every (stage × macro) ≤ 1.3 × demand or annotated in ACCEPTED_EXCESSES', () => {
    const offenders = [];
    for (const stage of STAGES) {
      for (const el of MASS_BALANCE_ELEMENTS) {
        const demand = stageDemandMg(stage, el);
        if (demand <= 0) continue;
        const supply = totalSupplyMg(stage, el);
        const ratio = supply / demand;
        if (ratio > 1.3) {
          const accepted = G.ACCEPTED_EXCESSES.find(
            e => e.stage === stage && e.element === el);
          if (!accepted) {
            offenders.push(`${stage}.${el}: supply=${supply.toFixed(0)} `
              + `demand=${demand.toFixed(0)} ratio=${ratio.toFixed(2)} `
              + `(no ACCEPTED_EXCESSES annotation)`);
          }
        }
      }
    }
    assert.deepEqual(offenders, [],
      `REQ-014 violations:\n  ${offenders.join('\n  ')}`);
  });

  test('REQ-014 — every ACCEPTED_EXCESSES entry carries a non-empty `reason`', () => {
    const empty = G.ACCEPTED_EXCESSES.filter(e => !e.reason || !e.reason.trim());
    assert.deepEqual(empty, [],
      `ACCEPTED_EXCESSES entries without reason: ${empty.map(e => `${e.stage}.${e.element}`).join(', ')}`);
  });
});

// ─── REQ-033 — TOMATO_REMOVAL biased toward high end of references ────
//
// Spec table (g uptake per kg fresh fruit):
//   N : Yara 2.3, Sonneveld 2.5, Koller 2.9 → mean 2.566...
//   P : Yara 0.36, Sonneveld 0.57, Koller 0.39 → mean 0.44
//   K : Yara 3.3, Sonneveld 4.0, Koller 4.48 → mean 3.926...
//   Mg: Yara 0.54, Sonneveld 0.67, Koller 0.5 → mean 0.57
// TOMATO_REMOVAL[el].g must be ≥ inter-source mean for each.

describe('REQ-033 — TOMATO_REMOVAL ≥ inter-source mean (high-end bias)', () => {
  const REF_MEAN = {
    N:  (2.3 + 2.5 + 2.9) / 3,
    P:  (0.36 + 0.57 + 0.39) / 3,
    K:  (3.3 + 4.0 + 4.48) / 3,
    Mg: (0.54 + 0.67 + 0.5) / 3,
  };

  test('TOMATO_REMOVAL exposed', () => {
    assert.ok(G.TOMATO_REMOVAL, 'TOMATO_REMOVAL missing on window');
  });

  for (const [el, mean] of Object.entries(REF_MEAN)) {
    test(`REQ-033 — TOMATO_REMOVAL.${el} ≥ ${mean.toFixed(3)} g/kg (inter-source mean)`, () => {
      const entry = G.TOMATO_REMOVAL[el];
      assert.ok(entry, `TOMATO_REMOVAL.${el} missing`);
      assert.equal(typeof entry.g, 'number',
        `TOMATO_REMOVAL.${el}.g not numeric (got ${typeof entry.g})`);
      assert.ok(entry.g + 1e-9 >= mean,
        `TOMATO_REMOVAL.${el}.g = ${entry.g} < inter-source mean ${mean.toFixed(3)}`);
    });
  }
});
