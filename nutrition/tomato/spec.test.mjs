// nutrition/tomato/ — domain-level integration spec tests.
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
//
// Each test is written to be LOAD-BEARING: it asserts on the actual
// numerical / structural claim of the REQ, not on the shape of any
// (now-removed) Verification clause. Tests should fail if the
// implementation is stubbed, returns zeros, or drifts numerically.

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

const STAGES = ['T1', 'T2', 'T3', 'T4', 'T5'];
const MASS_BALANCE_ELEMENTS = ['N', 'P', 'K', 'Mg'];
const SOIL_PH_NOW = 7.4;

// ─── REQ-011 — CHANNEL_ROLE covers every demand element ────────────────
//
// Normative claim: A CHANNEL_ROLE constant maps every element appearing in
// BIOMASS_DEMAND[stage] (and TOMATO_FRUIT_EXPORT) to its delivery channel(s)
// — fertigation, sidedress, frontload, foliar, passive — with explicit
// fractions per channel.

describe('REQ-011 — CHANNEL_ROLE covers every demand element', () => {
  test('CHANNEL_ROLE / BIOMASS_DEMAND / TOMATO_FRUIT_EXPORT exposed', () => {
    assert.ok(G.CHANNEL_ROLE, 'CHANNEL_ROLE missing on window');
    assert.ok(G.BIOMASS_DEMAND, 'BIOMASS_DEMAND missing on window');
    assert.ok(G.TOMATO_FRUIT_EXPORT, 'TOMATO_FRUIT_EXPORT missing on window');
  });

  test('REQ-011 — BIOMASS_DEMAND and TOMATO_FRUIT_EXPORT are populated (load-bearing)', () => {
    // Guard against silently-stubbed demand tables — REQ-011's coverage
    // claim is vacuously true if both inputs are empty.
    const stageElementCount = STAGES.reduce(
      (sum, s) => sum + Object.keys(G.BIOMASS_DEMAND[s] || {}).length, 0);
    assert.ok(stageElementCount >= 5 * 11,
      `BIOMASS_DEMAND under-populated: ${stageElementCount} stage×element entries (expected ≥ 55)`);
    const exportElements = Object.keys(G.TOMATO_FRUIT_EXPORT);
    assert.ok(exportElements.length >= 11,
      `TOMATO_FRUIT_EXPORT under-populated: ${exportElements.length} elements (expected ≥ 11)`);
  });

  test('REQ-011 — every BIOMASS_DEMAND[stage] element appears in CHANNEL_ROLE', () => {
    const demandElements = new Set();
    for (const stage of STAGES) {
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

  test('REQ-011 — each element has at least one channel with fraction > 0 (no orphans)', () => {
    // Spec: "explicit fractions per channel". An element whose channels map
    // exists but contains only zero-fractions is in CHANNEL_ROLE in name
    // only — it satisfies set-membership coverage but no channel actually
    // owns its delivery. The spec language ("explicit fractions per channel")
    // intends real ownership.
    const orphans = [];
    for (const [el, channels] of Object.entries(G.CHANNEL_ROLE)) {
      const anyNonZero = Object.values(channels).some(v => typeof v === 'number' && v > 0);
      if (!anyNonZero) orphans.push(el);
    }
    assert.deepEqual(orphans, [],
      `CHANNEL_ROLE entries with no channel claiming any fraction: ${orphans.join(', ')}`);
  });
});

// ─── Supply chain — mirrors scripts/check-recipes.mjs Phase 2.5 ───────
//
//   supply = compost release + sidedress effective + fertigation effective
// Foliar omitted from macro check (foliar delivers micros only per
// CHANNEL_ROLE). MASS_BALANCE_ELEMENTS = N/P/K/Mg matches the verifier's
// scope. Soil pH = 7.4 (April 2026 Berger tomato bed; current crisis baseline).

function stageDemandMg(stage, el) {
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

// ─── REQ-013 — Σ(channel_supply) ≥ 0.9 × demand (under-fert guard) ────
//
// Normative claim: For every (flux element × stage),
// Σ(channel_supply) ≥ 0.9 × demand_total[stage, element]. Below 0.9 requires
// explicit `acceptedDeficit: { reason: '...' }` annotation on the stage entry
// — silent failure not allowed.
//
// The model implements this via ACCEPTED_DEFICITS — an array of
// { stage, element, reason } entries. Each entry's `reason` must be
// non-empty (the spec's "silent failure not allowed" intent).

describe('REQ-013 — Σ(channel_supply) ≥ 0.9 × demand (under-fert guard)', () => {
  test('required globals exposed', () => {
    assert.equal(typeof G.computeStageRecipe, 'function', 'computeStageRecipe missing');
    assert.ok(G.STORED_RECIPE && G.STORED_RECIPE.tomato && G.STORED_RECIPE.tomato.sidedress,
      'STORED_RECIPE.tomato.sidedress missing');
    assert.ok(G.RECIPE_INPUTS, 'RECIPE_INPUTS missing');
    assert.ok(Array.isArray(G.ACCEPTED_DEFICITS), 'ACCEPTED_DEFICITS not an array');
  });

  test('REQ-013 — computeStageRecipe(T5) recomputed from upstream constants (load-bearing anti-stub)', () => {
    // Recompute the mass-balance formula from upstream constants per the
    // amended fertigation-recipe REQ-098 (no compost subtraction). The
    // domain test pins computeStageRecipe('T5') to this recomputation, so
    // the anti-stub guard auto-tracks future formula changes without a
    // numeric pin to maintain.
    const t5 = G.computeStageRecipe('T5');
    assert.ok(t5 && typeof t5 === 'object', 'computeStageRecipe(T5) did not return an object');
    assert.equal(typeof t5.kSulfate, 'number', 'computeStageRecipe(T5).kSulfate not numeric');
    assert.equal(typeof t5.mgSulfate, 'number', 'computeStageRecipe(T5).mgSulfate not numeric');

    const stageYield = G.RECIPE_INPUTS.stageYield.T5;
    const totalArea  = G.TOMATO_NUM_BEDS * G.TOMATO_BED_AREA;

    // K offtake − sidedress (compost NOT subtracted per REQ-098).
    const kOfftakeMg   = G.TOMATO_FRUIT_EXPORT.K.g * stageYield * 1000 + G.BIOMASS_DEMAND.T5.K;
    const kSidedressMg = G.STORED_RECIPE.tomato.sidedress.T5.actisol_g
                          * G.PRODUCT_PCT.Actisol_K * G.SIDEDRESS_MIN_EFF.Actisol_K * 1000
                          / G.SIDEDRESS_AREA_PER_PLANCHE;
    const kNeededMg    = Math.max(0, kOfftakeMg - kSidedressMg);
    const kExpected    = Math.round(kNeededMg / 1000 / G.PRODUCT_PCT.K2SO4_K * totalArea);

    // Mg offtake (neither sidedress nor compost subtracted per REQ-098).
    const mgOfftakeMg  = G.TOMATO_FRUIT_EXPORT.Mg.g * stageYield * 1000 + G.BIOMASS_DEMAND.T5.Mg;
    const mgExpected   = Math.round(Math.max(0, mgOfftakeMg) / 1000 / G.PRODUCT_PCT.MgSO4_Mg * totalArea);

    assert.ok(Math.abs(t5.kSulfate  - kExpected)  <= 5, `kSulfate ${t5.kSulfate} vs expected ${kExpected} (±5g)`);
    assert.ok(Math.abs(t5.mgSulfate - mgExpected) <= 5, `mgSulfate ${t5.mgSulfate} vs expected ${mgExpected} (±5g)`);
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

  test('REQ-013 — at least one (stage × macro) is materially evaluated (anti-stub)', () => {
    // Guard against the BIOMASS_DEMAND-stubbed-to-zero failure mode: the
    // (stage × macro) supply check above silently passes when demand = 0
    // everywhere. Assert that at least one combination has demand ≥ 1000
    // mg/m²/wk AND non-trivial supply, so the ratio loop actually exercises
    // its body.
    let materialChecks = 0;
    for (const stage of STAGES) {
      for (const el of MASS_BALANCE_ELEMENTS) {
        const demand = stageDemandMg(stage, el);
        const supply = totalSupplyMg(stage, el);
        if (demand >= 1000 && supply > 0) materialChecks++;
      }
    }
    assert.ok(materialChecks >= 5,
      `Only ${materialChecks} (stage × macro) pairs had demand≥1000 mg/m²/wk AND supply>0 — `
      + `the under-fert guard isn't exercising its body in a meaningful way`);
  });

  test('REQ-013 — every ACCEPTED_DEFICITS entry carries a non-empty `reason`', () => {
    const empty = G.ACCEPTED_DEFICITS.filter(d => !d.reason || !d.reason.trim());
    assert.equal(empty.length, 0,
      `ACCEPTED_DEFICITS entries without reason: ${empty.map(d => `${d.stage}.${d.element}`).join(', ')}`);
  });

  test('REQ-013 — ACCEPTED_DEFICITS does not blanket-accept every (stage × macro)', () => {
    // 5 stages × 4 macros = 20 (stage, macro) pairs. If ACCEPTED_DEFICITS
    // listed all 20, the guard would be silently disabled. Spec's intent:
    // an *explicit* annotation per gap, not a blanket waiver.
    const accepted = new Set(G.ACCEPTED_DEFICITS
      .filter(d => MASS_BALANCE_ELEMENTS.includes(d.element)
        && STAGES.includes(d.stage))
      .map(d => `${d.stage}.${d.element}`));
    assert.ok(accepted.size < 20,
      `ACCEPTED_DEFICITS covers ${accepted.size}/20 (stage × macro) pairs — looks like a blanket waiver`);
  });

});

// ─── REQ-014 — Σ(channel_supply) ≤ 1.3 × demand (luxury / waste guard) ─

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
    assert.equal(empty.length, 0,
      `ACCEPTED_EXCESSES entries without reason: ${empty.map(e => `${e.stage}.${e.element}`).join(', ')}`);
  });

  test('REQ-014 — ACCEPTED_EXCESSES does not blanket-accept every (stage × macro)', () => {
    const accepted = new Set(G.ACCEPTED_EXCESSES
      .filter(e => MASS_BALANCE_ELEMENTS.includes(e.element)
        && STAGES.includes(e.stage))
      .map(e => `${e.stage}.${e.element}`));
    assert.ok(accepted.size < 20,
      `ACCEPTED_EXCESSES covers ${accepted.size}/20 (stage × macro) pairs — looks like a blanket waiver`);
  });

  test('REQ-014 — no (stage × macro) is both in ACCEPTED_DEFICITS and ACCEPTED_EXCESSES', () => {
    // Same (stage, macro) can't simultaneously be < 0.9× AND > 1.3× of
    // demand. If both annotations exist, one is stale and the model has
    // drifted out from under its annotations.
    const deficits = new Set(G.ACCEPTED_DEFICITS.map(d => `${d.stage}.${d.element}`));
    const conflicts = G.ACCEPTED_EXCESSES
      .filter(e => deficits.has(`${e.stage}.${e.element}`))
      .map(e => `${e.stage}.${e.element}`);
    // assert.equal on length (not deepEqual on the array): G.ACCEPTED_EXCESSES
    // is a jsdom-realm array, and deepEqual across realms fails the
    // prototype check even when both sides are empty.
    assert.equal(conflicts.length, 0,
      `Same (stage, element) listed in both ACCEPTED_DEFICITS and ACCEPTED_EXCESSES: ${conflicts.join(', ')}`);
  });
});

// ─── REQ-033 — TOMATO_REMOVAL biased toward high end of references ────
//
// Normative claim: For every macro element with multi-source published demand
// data (N, P, K, Mg), the value used in TOMATO_REMOVAL is at or above the
// inter-source mean of {Yara high-end, Sonneveld 2009, Koller 2016 average}.
// Going below the mean requires explicit `acceptedDeficit` annotation on
// that element. Reference table (g uptake per kg fresh fruit):
//   N : Yara 2.3,  Sonneveld 2.5,  Koller 2.9  → mean 2.567
//   P : Yara 0.36, Sonneveld 0.57, Koller 0.39 → mean 0.44
//   K : Yara 3.3,  Sonneveld 4.0,  Koller 4.48 → mean 3.927
//   Mg: Yara 0.54, Sonneveld 0.67, Koller 0.5  → mean 0.57

describe('REQ-033 — TOMATO_REMOVAL ≥ inter-source mean (high-end bias)', () => {
  const REFS = {
    N:  { yara: 2.3,  sonneveld: 2.5,  koller: 2.9  },
    P:  { yara: 0.36, sonneveld: 0.57, koller: 0.39 },
    K:  { yara: 3.3,  sonneveld: 4.0,  koller: 4.48 },
    Mg: { yara: 0.54, sonneveld: 0.67, koller: 0.5  },
  };
  const REF_MEAN = Object.fromEntries(
    Object.entries(REFS).map(([el, src]) => [el, (src.yara + src.sonneveld + src.koller) / 3]));

  test('TOMATO_REMOVAL / TOMATO_FRUIT_EXPORT exposed', () => {
    assert.ok(G.TOMATO_REMOVAL, 'TOMATO_REMOVAL missing on window');
    assert.ok(G.TOMATO_FRUIT_EXPORT, 'TOMATO_FRUIT_EXPORT missing on window');
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

  test('REQ-033 — TOMATO_REMOVAL values within sane upper bound (typo guard)', () => {
    // The spec biases UPWARD toward the inter-source mean. It does NOT
    // license arbitrary inflation. A typo (e.g., N=27 instead of 2.7)
    // would pass the ≥ mean check trivially and silently inflate demand
    // across the entire model. Cap at 1.5× the highest single reference
    // value as a typo guard.
    const offenders = [];
    for (const [el, src] of Object.entries(REFS)) {
      const max = Math.max(src.yara, src.sonneveld, src.koller);
      const got = (G.TOMATO_REMOVAL[el] || {}).g;
      if (typeof got !== 'number') continue;
      if (got > 1.5 * max) {
        offenders.push(`${el}: ${got} > 1.5 × max(refs) = ${(1.5 * max).toFixed(2)}`);
      }
    }
    assert.deepEqual(offenders, [],
      `TOMATO_REMOVAL values implausibly high:\n  ${offenders.join('\n  ')}`);
  });

  test('REQ-033 — TOMATO_FRUIT_EXPORT macros tracks TOMATO_REMOVAL × fruit fraction', () => {
    // The REQ scope explicitly names TOMATO_FRUIT_EXPORT as part of the
    // demand-anchor. data.js documents the fruit-fraction split:
    //   N/P/K = 0.60, Ca = 0.05, Mg = 0.25.
    // The high-end bias on TOMATO_REMOVAL must propagate into the actively-
    // consumed TOMATO_FRUIT_EXPORT — otherwise the wired demand model
    // doesn't inherit the bias and the spec's REQ-033 protection is a dead
    // letter. Pin N/P/K/Mg fruit values to TOMATO_REMOVAL × fraction
    // within tight tolerance.
    const FRACTION = { N: 0.60, P: 0.60, K: 0.60, Mg: 0.25 };
    const offenders = [];
    for (const [el, frac] of Object.entries(FRACTION)) {
      const removalG = (G.TOMATO_REMOVAL[el] || {}).g;
      const exportG = (G.TOMATO_FRUIT_EXPORT[el] || {}).g;
      if (typeof removalG !== 'number' || typeof exportG !== 'number') {
        offenders.push(`${el}: removal=${removalG} export=${exportG} (non-numeric)`);
        continue;
      }
      const expected = removalG * frac;
      if (Math.abs(exportG - expected) > 0.01) {
        offenders.push(`${el}: export=${exportG} ≠ removal(${removalG}) × ${frac} = ${expected.toFixed(3)}`);
      }
    }
    assert.deepEqual(offenders, [],
      `TOMATO_FRUIT_EXPORT diverged from TOMATO_REMOVAL × fruit fraction:\n  ${offenders.join('\n  ')}`);
  });
});
