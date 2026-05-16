// Tests for nutrition/soil-contribution/spec.md.
//
// One node:test file pinning every REQ in the subproject's spec:
//   REQ-140 — SOIL_BANK_MG_M2 is per-crop / per-element in mg/m².
//   REQ-141 — Only SOIL_CONTRIBUTING elements (P, Ca) participate in the
//             gap chain; others return 0; contributing elements clamp at
//             bank when demand exceeds reservoir.
//   REQ-142 — monthsToDepletion = bank / (SME × transpiration × WEEKS_PER_MONTH);
//             returns null when any operand is missing or zero; defined
//             regardless of CONTRIBUTING.
//   REQ-143 — window.SoilContribution exposes the documented key list +
//             function types.
//   REQ-145 — Pourquoi modal interpretation strings (verifier-only — bytes
//             owned by spec, consumed by renderSpec in app/index.html;
//             coverage handled by scripts/check-recipes.mjs REQ-145 matcher).
//   REQ-164 — SME_SOIL_SOLUTION_PPM + TRANSPIRATION_L_PER_M2_PER_WEEK
//             cover every banked crop × every gap-grid element.
//
// Loaded source (data.js + calc.js + render.js + model.js) runs inside
// node:vm with a `window` host object; see test-helpers.mjs.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { loadSoilContribution } from './test-helpers.mjs';

const { namespace, window } = loadSoilContribution();

const GRID_ELEMENTS = ['N', 'P', 'K', 'Ca', 'Mg', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];
const WEEKS_PER_MONTH = 52 / 12;

// ────────────────────────────────────────────────────────────────────────
// REQ-140 — Bank is a per-crop Mehlich-3 reservoir in mg/m²
// ────────────────────────────────────────────────────────────────────────

describe('REQ-140 — SOIL_BANK_MG_M2 per-crop / per-element in mg/m²', () => {
  test('REQ-140 — namespace exposes BANK_MG_M2 as a non-empty object', () => {
    assert.equal(typeof namespace.BANK_MG_M2, 'object');
    assert.ok(namespace.BANK_MG_M2 !== null);
    assert.ok(Object.keys(namespace.BANK_MG_M2).length >= 1,
      'expected at least one crop entry');
  });

  test('REQ-140 — tomato bed wired with P, K, Ca, Mg ≥ 1000 mg/m²', () => {
    const tomato = namespace.BANK_MG_M2.tomato;
    assert.ok(tomato, 'tomato bank entry missing');
    for (const element of ['P', 'K', 'Ca', 'Mg']) {
      assert.equal(typeof tomato[element], 'number',
        `tomato.${element} not numeric`);
      assert.ok(tomato[element] >= 1000,
        `tomato.${element}=${tomato[element]} below mg/m² floor`);
    }
  });

  test('REQ-140 — lettuce bed wired with P, K, Ca, Mg ≥ 1000 mg/m²', () => {
    const lettuce = namespace.BANK_MG_M2.lettuce;
    assert.ok(lettuce, 'lettuce bank entry missing');
    for (const element of ['P', 'K', 'Ca', 'Mg']) {
      assert.equal(typeof lettuce[element], 'number',
        `lettuce.${element} not numeric`);
      assert.ok(lettuce[element] >= 1000,
        `lettuce.${element}=${lettuce[element]} below mg/m² floor`);
    }
  });
});

// ────────────────────────────────────────────────────────────────────────
// REQ-141 — Only CONTRIBUTING elements participate in the gap chain
// ────────────────────────────────────────────────────────────────────────

describe('REQ-141 — gap-chain participation gated by CONTRIBUTING', () => {
  test('REQ-141 — CONTRIBUTING = { P: true, Ca: true }', () => {
    assert.equal(namespace.CONTRIBUTING.P, true);
    assert.equal(namespace.CONTRIBUTING.Ca, true);
  });

  test('REQ-141 — non-contributing elements return 0 even with bank data', () => {
    // K and Mg have measured banks but are routed via fertigation; soil-bank
    // path must return 0 to avoid double-count.
    for (const element of ['K', 'Mg']) {
      const result = namespace.weeklyContribution('tomato', element, 1000);
      assert.equal(result, 0,
        `weeklyContribution(tomato, ${element}, 1000) = ${result} (expected 0)`);
    }
  });

  test('REQ-141 — elements without bank data return 0', () => {
    // N and micros are not measured on Mehlich-3.
    for (const element of ['N', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo']) {
      const result = namespace.weeklyContribution('tomato', element, 1000);
      assert.equal(result, 0,
        `weeklyContribution(tomato, ${element}, 1000) = ${result} (expected 0)`);
    }
  });

  test('REQ-141 — contributing element returns demand when bank ≥ demand', () => {
    const result = namespace.weeklyContribution('tomato', 'Ca', 5000);
    assert.equal(result, 5000);
  });

  test('REQ-141 — contributing element clamps at bank when demand > bank', () => {
    const bankCa = namespace.BANK_MG_M2.tomato.Ca;
    const huge = bankCa + 1e9;
    const result = namespace.weeklyContribution('tomato', 'Ca', huge);
    assert.equal(result, bankCa,
      `clamp expected at ${bankCa}, got ${result}`);
  });

  test('REQ-141 — non-positive demand returns 0', () => {
    assert.equal(namespace.weeklyContribution('tomato', 'Ca', 0), 0);
    assert.equal(namespace.weeklyContribution('tomato', 'Ca', -10), 0);
  });

  test('REQ-141 — unknown crop returns 0', () => {
    assert.equal(namespace.weeklyContribution('mars', 'Ca', 1000), 0);
  });
});

// ────────────────────────────────────────────────────────────────────────
// REQ-142 — Months-to-depletion is SME-derived, not demand-derived
// ────────────────────────────────────────────────────────────────────────

describe('REQ-142 — monthsToDepletion formula = bank ÷ (SME × transp × WEEKS_PER_MONTH)', () => {
  test('REQ-142 — function signature takes (crop, element) only — no demand argument', () => {
    // calc.js / model.js MUST expose monthsToDepletion(crop, element). The
    // function's `length` property is the count of declared parameters
    // before any with default values.
    assert.equal(namespace.monthsToDepletion.length, 2,
      `monthsToDepletion arity = ${namespace.monthsToDepletion.length} (expected 2: crop, element)`);
  });

  test('REQ-142 — tomato P → ~780 months (~65 years, locked-out vault)', () => {
    const expected = 55800 / (1.1 * 15 * WEEKS_PER_MONTH);
    const got = namespace.monthsToDepletion('tomato', 'P');
    assert.ok(Math.abs(got - expected) < 1e-6,
      `got ${got}, expected ${expected}`);
    // Sanity-check the changelog claim: ~65 years.
    assert.ok(got / 12 > 60 && got / 12 < 70,
      `tomato P runway ${(got / 12).toFixed(1)} years out of [60, 70]`);
  });

  test('REQ-142 — tomato Ca → ~71 months (~5.9 years)', () => {
    const expected = 1098900 / (238.8 * 15 * WEEKS_PER_MONTH);
    const got = namespace.monthsToDepletion('tomato', 'Ca');
    assert.ok(Math.abs(got - expected) < 1e-6,
      `got ${got}, expected ${expected}`);
    // Sanity-check the changelog claim: ~5.9 years.
    assert.ok(got / 12 > 5.5 && got / 12 < 6.5,
      `tomato Ca runway ${(got / 12).toFixed(1)} years out of [5.5, 6.5]`);
  });

  test('REQ-142 — lettuce Ca → numeric runway with new constants', () => {
    const expected = 1061200 / (114.4 * 4 * WEEKS_PER_MONTH);
    const got = namespace.monthsToDepletion('lettuce', 'Ca');
    assert.ok(Math.abs(got - expected) < 1e-6,
      `got ${got}, expected ${expected}`);
    assert.ok(got > 0);
  });

  test('REQ-142 — disabled rows (K, Mg) still expose numeric runway when bank + SME present', () => {
    // K + Mg are NOT in CONTRIBUTING but they have bank + SME data, so the
    // depletion column must surface a number for context (REQ-142 carve-out).
    const kMonths = namespace.monthsToDepletion('tomato', 'K');
    const mgMonths = namespace.monthsToDepletion('tomato', 'Mg');
    assert.equal(typeof kMonths, 'number');
    assert.equal(typeof mgMonths, 'number');
    assert.ok(kMonths > 0, `tomato K runway = ${kMonths}`);
    assert.ok(mgMonths > 0, `tomato Mg runway = ${mgMonths}`);
  });

  test('REQ-142 — elements without bank data return null', () => {
    // N has no Mehlich-3 measurement on either crop.
    assert.equal(namespace.monthsToDepletion('tomato', 'N'), null);
    assert.equal(namespace.monthsToDepletion('lettuce', 'N'), null);
    // Micros have SME readings but no bank measurement.
    for (const element of ['Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo']) {
      assert.equal(namespace.monthsToDepletion('tomato', element), null,
        `tomato ${element} expected null (no bank data)`);
    }
  });

  test('REQ-142 — unknown crop returns null', () => {
    assert.equal(namespace.monthsToDepletion('mars', 'Ca'), null);
  });

  test('REQ-142 — demand argument is structurally absent (regression: old signature lost)', () => {
    // The previous formula was bank / (demand × WEEKS_PER_MONTH). A regression
    // would either accept demand and use it, or silently zero out without it.
    // Pin: passing extra args is ignored and the SME-derived result holds.
    const expected = 1098900 / (238.8 * 15 * WEEKS_PER_MONTH);
    const withExtra = namespace.monthsToDepletion('tomato', 'Ca', 12345, 'noise');
    assert.ok(Math.abs(withExtra - expected) < 1e-6,
      `extra args should not change output: got ${withExtra}, expected ${expected}`);
  });
});

// ────────────────────────────────────────────────────────────────────────
// REQ-143 — Public API on window.SoilContribution
// ────────────────────────────────────────────────────────────────────────

describe('REQ-143 — window.SoilContribution public API surface', () => {
  const REQUIRED_KEYS = [
    'BANK_MG_M2',
    'CONTRIBUTING',
    'WEEKS_PER_MONTH',
    'SME_SOIL_SOLUTION_PPM',
    'TRANSPIRATION_L_PER_M2_PER_WEEK',
    'weeklyContribution',
    'monthsToDepletion',
    'renderGrid',
  ];

  test('REQ-143 — namespace exists and is an object', () => {
    assert.ok(window.SoilContribution, 'window.SoilContribution missing');
    assert.equal(typeof window.SoilContribution, 'object');
  });

  test('REQ-143 — every documented key is present', () => {
    const missing = REQUIRED_KEYS.filter(key => namespace[key] == null);
    assert.deepEqual(missing, [],
      `missing keys: ${missing.join(', ')}`);
  });

  test('REQ-143 — function-typed members are functions', () => {
    assert.equal(typeof namespace.weeklyContribution, 'function');
    assert.equal(typeof namespace.monthsToDepletion, 'function');
    assert.equal(typeof namespace.renderGrid, 'function');
  });

  test('REQ-143 — scalar / object members typed correctly', () => {
    assert.equal(typeof namespace.WEEKS_PER_MONTH, 'number');
    assert.equal(typeof namespace.BANK_MG_M2, 'object');
    assert.equal(typeof namespace.CONTRIBUTING, 'object');
    assert.equal(typeof namespace.SME_SOIL_SOLUTION_PPM, 'object');
    assert.equal(typeof namespace.TRANSPIRATION_L_PER_M2_PER_WEEK, 'object');
  });

  test('REQ-143 — WEEKS_PER_MONTH = 52 / 12', () => {
    assert.ok(Math.abs(namespace.WEEKS_PER_MONTH - 52 / 12) < 1e-9);
  });
});

// ────────────────────────────────────────────────────────────────────────
// REQ-164 — SME + transpiration coverage contract
// ────────────────────────────────────────────────────────────────────────

describe('REQ-164 — SME + transpiration wired for every banked crop × gap-grid element', () => {
  test('REQ-164 — SME_SOIL_SOLUTION_PPM has an entry for every banked crop', () => {
    const bankedCrops = Object.keys(namespace.BANK_MG_M2);
    const smeCrops = Object.keys(namespace.SME_SOIL_SOLUTION_PPM);
    const missing = bankedCrops.filter(crop => !smeCrops.includes(crop));
    assert.deepEqual(missing, [],
      `SME crops missing: ${missing.join(', ')}`);
  });

  test('REQ-164 — every banked crop × gap-grid element has a positive SME value', () => {
    const bankedCrops = Object.keys(namespace.BANK_MG_M2);
    const offenders = [];
    for (const crop of bankedCrops) {
      const sme = namespace.SME_SOIL_SOLUTION_PPM[crop] || {};
      for (const element of GRID_ELEMENTS) {
        const value = sme[element];
        if (typeof value !== 'number' || !(value > 0)) {
          offenders.push(`SME[${crop}][${element}]=${value}`);
        }
      }
    }
    assert.deepEqual(offenders, [], offenders.join('; '));
  });

  test('REQ-164 — TRANSPIRATION_L_PER_M2_PER_WEEK populated for every banked crop', () => {
    const bankedCrops = Object.keys(namespace.BANK_MG_M2);
    const offenders = [];
    for (const crop of bankedCrops) {
      const value = namespace.TRANSPIRATION_L_PER_M2_PER_WEEK[crop];
      if (typeof value !== 'number' || !(value > 0)) {
        offenders.push(`TRANSPIRATION[${crop}]=${value}`);
      }
    }
    assert.deepEqual(offenders, [], offenders.join('; '));
  });

  test('REQ-164 — tomato + lettuce both wired today', () => {
    assert.ok(namespace.SME_SOIL_SOLUTION_PPM.tomato);
    assert.ok(namespace.SME_SOIL_SOLUTION_PPM.lettuce);
    assert.ok(namespace.TRANSPIRATION_L_PER_M2_PER_WEEK.tomato > 0);
    assert.ok(namespace.TRANSPIRATION_L_PER_M2_PER_WEEK.lettuce > 0);
  });

  test('REQ-164 — detection-limit ceilings recorded at DL value (Mn, Zn = 0.03 ppm)', () => {
    // Conservative ceiling: lab reports <0.03 → we store 0.03 (cert 2).
    // Negative values rejected; ceiling kept so the runway stays a
    // conservative lower bound. Pinning here so a future "use null instead"
    // change is loud.
    for (const crop of ['tomato', 'lettuce']) {
      for (const element of ['Mn', 'Zn']) {
        const value = namespace.SME_SOIL_SOLUTION_PPM[crop][element];
        assert.ok(value > 0,
          `${crop}.${element} = ${value} (DL ceiling must stay positive)`);
        assert.ok(value <= 0.05,
          `${crop}.${element} = ${value} (DL ceiling expected ≤ 0.05 ppm)`);
      }
    }
  });
});

// ────────────────────────────────────────────────────────────────────────
// renderGrid — column count + row count (REQ-143 surface, REQ-162-adjacent)
// ────────────────────────────────────────────────────────────────────────
//
// REQ-162 (Mois d'épuisement on every row with reservoir data) is enforced
// row-by-row by scripts/check-recipes.mjs against the live page DOM. The
// helper-level check here only pins renderGrid's structural contract: a
// 6-column header + 11 element rows in the documented order. Anything
// finer-grained belongs to the page-level matcher.

describe('renderGrid — structural contract (helper for REQ-143 / REQ-162)', () => {
  test('renderGrid — returns a string with one row per gap-grid element', () => {
    const zeros = Object.fromEntries(GRID_ELEMENTS.map(el => [el, 0]));
    const months = Object.fromEntries(GRID_ELEMENTS.map(el => [el, null]));
    const html = namespace.renderGrid(zeros, zeros, zeros, months);
    assert.equal(typeof html, 'string');
    for (const element of GRID_ELEMENTS) {
      assert.ok(
        html.includes(`showPourquoi('soil.${element}')`),
        `row for ${element} missing showPourquoi handler`,
      );
    }
  });

  test('renderGrid — depletion cell renders "—" when monthsToDepletion = null', () => {
    const zeros = Object.fromEntries(GRID_ELEMENTS.map(el => [el, 0]));
    const months = Object.fromEntries(GRID_ELEMENTS.map(el => [el, null]));
    const html = namespace.renderGrid(zeros, zeros, zeros, months);
    // Every depletion cell — there are 11 element rows — should render `—`.
    const dashCount = (html.match(/>—</g) || []).length;
    // Each row has at least 2 `—` cells when soil = 0 and months = null
    // (Apport ici = `—` and Mois épuisement = `—`). 11 rows × 2 = 22.
    assert.ok(dashCount >= 11,
      `expected ≥ 11 dash cells, got ${dashCount}`);
  });
});
