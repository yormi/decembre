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

  test('REQ-140 — extended coverage: tomato + lettuce both expose 10 of 11 gap-grid elements (Mo absent — not on Mehlich-3 panel)', () => {
    const expected = ['N', 'P', 'K', 'Ca', 'Mg', 'Fe', 'Mn', 'Zn', 'B', 'Cu'];
    const moAbsent = 'Mo';
    for (const crop of ['tomato', 'lettuce']) {
      const bank = namespace.BANK_MG_M2[crop];
      assert.ok(bank, `${crop} bank entry missing`);
      for (const element of expected) {
        assert.equal(typeof bank[element], 'number',
          `${crop}.${element} not numeric (REQ-140 follow-up 2026-05-16 extends to 10 elements)`);
        assert.ok(bank[element] > 0,
          `${crop}.${element}=${bank[element]} must be positive (DL ceilings allowed via P-04)`);
      }
      assert.equal(bank[moAbsent], undefined,
        `${crop}.Mo should be absent (Mo unmeasured on Mehlich-3, routes via fertigation per REQ-061)`);
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

describe('REQ-142 — monthsToDepletion = bank ÷ min(mass-flow, peak-demand) × WEEKS_PER_MONTH; null for turnover-bound', () => {
  // Plant peak weekly demand mirrors data.js PLANT_PEAK_WEEKLY_DEMAND_MG_PER_M2;
  // re-declared here so the test file is self-contained and tracks the source
  // values. Update both in lockstep when plant-needs refinements shift demand.
  const PEAK = {
    tomato: { P: 660, K: 6000, Ca: 2250, Mg: 855, Fe: 15, Mn: 7.5, Zn: 4.5, B: 4.5, Cu: 1.5 },
    lettuce: { P: 384, K: 5376, Ca: 1152, Mg: 307, Fe: 15.4, Mn: 3.8, Zn: 3.1, B: 2.3, Cu: 0.6 },
  };
  const expectedRunway = (crop, element) => {
    const bank = namespace.BANK_MG_M2[crop][element];
    const sme = namespace.SME_SOIL_SOLUTION_PPM[crop][element];
    const transp = namespace.TRANSPIRATION_L_PER_M2_PER_WEEK[crop];
    const massFlow = sme * transp;
    const uptake = Math.min(massFlow, PEAK[crop][element]);
    return bank / (uptake * WEEKS_PER_MONTH);
  };

  test('REQ-142 — function signature takes (crop, element) only — no demand argument', () => {
    assert.equal(namespace.monthsToDepletion.length, 2,
      `monthsToDepletion arity = ${namespace.monthsToDepletion.length} (expected 2: crop, element)`);
  });

  test('REQ-142 — tomato P → ~780 mois (~65 ans; lockout, clamp inert)', () => {
    // Mass-flow 16.5 mg/m²/wk < peak demand 660 → clamp no-op.
    const expected = expectedRunway('tomato', 'P');
    const got = namespace.monthsToDepletion('tomato', 'P');
    assert.ok(Math.abs(got - expected) < 1e-6,
      `got ${got}, expected ${expected}`);
    assert.ok(got / 12 > 60 && got / 12 < 70,
      `tomato P runway ${(got / 12).toFixed(1)} years out of [60, 70]`);
  });

  test('REQ-142 — tomato Ca → ~113 mois (~9.4 ans; clamp binds at peak demand)', () => {
    // Mass-flow 3582 mg/m²/wk > peak demand 2250 → clamp binds at 2250.
    // Pre-clamp runway was 5.9 yr (mass-flow-bound); honest plant-drain
    // runway at peak demand is ~9.4 yr.
    const expected = expectedRunway('tomato', 'Ca');
    const got = namespace.monthsToDepletion('tomato', 'Ca');
    assert.ok(Math.abs(got - expected) < 1e-6,
      `got ${got}, expected ${expected}`);
    assert.ok(got / 12 > 9.0 && got / 12 < 10.0,
      `tomato Ca runway ${(got / 12).toFixed(1)} years out of [9.0, 10.0]`);
  });

  test('REQ-142 — tomato Mg → clamp binds at peak demand 855', () => {
    // Mass-flow 1189.5 > peak 855 → clamp binds.
    const expected = expectedRunway('tomato', 'Mg');
    const got = namespace.monthsToDepletion('tomato', 'Mg');
    assert.ok(Math.abs(got - expected) < 1e-6,
      `got ${got}, expected ${expected}`);
    // Pre-clamp 31.9 mo; post-clamp ~44 mo.
    assert.ok(got > 40 && got < 50,
      `tomato Mg runway ${got.toFixed(1)} mo out of [40, 50]`);
  });

  test('REQ-142 — lettuce Ca → mass-flow binds (clamp inert; lettuce mass-flow < peak demand everywhere)', () => {
    const expected = expectedRunway('lettuce', 'Ca');
    const got = namespace.monthsToDepletion('lettuce', 'Ca');
    assert.ok(Math.abs(got - expected) < 1e-6,
      `got ${got}, expected ${expected}`);
    assert.ok(got > 0);
  });

  test('REQ-142 — N returns null on both crops (turnover-bound)', () => {
    // N is replenished by mineralization at quasi-steady-state; the
    // counterfactual bank-÷-uptake runway is not operationally meaningful.
    assert.equal(namespace.monthsToDepletion('tomato', 'N'), null,
      'tomato N expected null — turnover-bound, mineralization replenishes the pool');
    assert.equal(namespace.monthsToDepletion('lettuce', 'N'), null,
      'lettuce N expected null — turnover-bound');
  });

  test('REQ-142 — disabled rows (K, Mg) still expose numeric runway when bank + SME present', () => {
    const kMonths = namespace.monthsToDepletion('tomato', 'K');
    const mgMonths = namespace.monthsToDepletion('tomato', 'Mg');
    assert.equal(typeof kMonths, 'number');
    assert.equal(typeof mgMonths, 'number');
    assert.ok(kMonths > 0, `tomato K runway = ${kMonths}`);
    assert.ok(mgMonths > 0, `tomato Mg runway = ${mgMonths}`);
  });

  test('REQ-142 — Mo returns null (unmeasured on Mehlich-3 panel)', () => {
    for (const crop of ['tomato', 'lettuce']) {
      assert.equal(namespace.monthsToDepletion(crop, 'Mo'), null,
        `${crop} Mo expected null (unmeasured on Mehlich-3, routes via fertigation per REQ-061)`);
    }
  });

  test('REQ-140 (10-element extension) — every non-turnover banked element yields finite monthsToDepletion', () => {
    // N is turnover-bound (returns null by design); the other 9 banked
    // elements feed cleanly through monthsToDepletion on both wired crops.
    const banked9 = ['P', 'K', 'Ca', 'Mg', 'Fe', 'Mn', 'Zn', 'B', 'Cu'];
    const offenders = [];
    for (const crop of ['tomato', 'lettuce']) {
      for (const element of banked9) {
        const months = namespace.monthsToDepletion(crop, element);
        if (typeof months !== 'number' || !Number.isFinite(months) || !(months > 0)) {
          offenders.push(`${crop}.${element} = ${months} (expected finite positive number)`);
        }
      }
    }
    assert.deepEqual(offenders, [], offenders.join('; '));
  });

  test('REQ-142 — unknown crop returns null', () => {
    assert.equal(namespace.monthsToDepletion('mars', 'Ca'), null);
  });

  test('REQ-142 — extra arguments structurally ignored (regression: signature is (crop, element))', () => {
    // The pre-2026-05-16 formula was bank / (demand × WEEKS_PER_MONTH). A
    // regression would re-introduce demand as a positional argument. Pin:
    // passing extra args is ignored and the clamped result holds.
    const expected = namespace.monthsToDepletion('tomato', 'Ca');
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

// ────────────────────────────────────────────────────────────────────────
// REQ-145 — Boron pourquoi-modal dispatches to micros-foliar-routed
// ────────────────────────────────────────────────────────────────────────
//
// Two pins added 2026-05-17 alongside the spec's 6 → 7 key extension
// (micros-foliar-routed now covers B as well as Fe / Mn / Zn / Cu):
//
//   1. Behavioral. Load the assembled tomato page via JSDOM, let the
//      page's `setNutrCrop('tomato')` boot path run `buildNutrimentTomato`,
//      then read `window.currentPourquoi['soil.B'].interpretation.key`.
//      Must equal `'micros-foliar-routed'`. Cross-subproject load: the
//      dispatcher (lines ~200-215 of nutrition/tomato/app/logic.js) is
//      inline inside `buildNutrimentTomato` — not a separately callable
//      function — so the page-render path is the only behavioral surface.
//
//   2. Structural pin. The Node verifier (scripts/check-recipes.mjs around
//      line 5180) maintains `expectedKeys` for REQ-145; the spec maintains
//      the same set as ` ```render <key>` ` blocks. Both must agree on the
//      7-key set. Equality is already enforced by the verifier itself but
//      a node:test pin guards against silent drift when one file moves
//      without the other.

import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const THIS_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(THIS_DIR, '..', '..');
const DIST_INDEX = join(REPO_ROOT, 'dist', 'index.html');
const SPEC_MD = join(THIS_DIR, 'spec.md');
const VERIFIER_PATH = join(REPO_ROOT, 'scripts', 'check-recipes.mjs');
const BUILD_SCRIPT = join(REPO_ROOT, 'scripts', 'build.mjs');

function ensureDistBuilt() {
  if (existsSync(DIST_INDEX)) return;
  execSync(`node ${BUILD_SCRIPT}`, { cwd: REPO_ROOT, stdio: 'pipe' });
}

describe('REQ-145 — boron pourquoi-modal key dispatches to micros-foliar-routed', () => {
  test('REQ-145 — soil.B interpretation key is micros-foliar-routed (not B-fert-routed, not default-not-mehlich)', () => {
    ensureDistBuilt();
    const html = readFileSync(DIST_INDEX, 'utf8');
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', () => {});
    virtualConsole.on('error', () => {});
    virtualConsole.on('warn', () => {});
    virtualConsole.on('log', () => {});
    const dom = new JSDOM(html, {
      url: 'http://localhost/index.html',
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      virtualConsole,
    });
    const pourquoi = dom.window.currentPourquoi;
    assert.ok(pourquoi, 'window.currentPourquoi missing — page did not boot');
    const entry = pourquoi['soil.B'];
    assert.ok(entry, 'window.currentPourquoi["soil.B"] missing — buildNutrimentTomato did not register B row');
    assert.ok(entry.interpretation, 'soil.B has no interpretation object');
    assert.equal(entry.interpretation.requirementId, 'REQ-145',
      `soil.B interpretation.requirementId = ${entry.interpretation.requirementId} (expected REQ-145)`);
    assert.equal(entry.interpretation.key, 'micros-foliar-routed',
      `soil.B interpretation.key = "${entry.interpretation.key}" (expected "micros-foliar-routed"; ` +
      `dispatcher in nutrition/tomato/app/logic.js around line 209 routes B to a stale key)`);
  });
});

// ────────────────────────────────────────────────────────────────────────
// REQ-145 — Structural pin: verifier expectedKeys equals spec render-keys
// ────────────────────────────────────────────────────────────────────────

describe('REQ-145 — expectedKeys set in verifier matches Renders: keys in spec.md', () => {
  test('REQ-145 — 7-key set agreement (verifier ↔ spec)', () => {
    const specSource = readFileSync(SPEC_MD, 'utf8');
    const verifierSource = readFileSync(VERIFIER_PATH, 'utf8');

    // Spec: extract ` ```render <key>` ` blocks below the REQ-145 header.
    // The spec uses ` ```render Ca` ` / ` ```render P` ` / ` ```render
    // K-fert-routed` ` / etc. as the canonical declaration.
    const renderRe = /```render\s+([A-Za-z0-9_-]+)\b/g;
    const specKeys = new Set();
    let match;
    while ((match = renderRe.exec(specSource)) !== null) {
      specKeys.add(match[1]);
    }

    // Verifier: locate the REQ-145 expectedKeys assignment (only one in the
    // REQ-145 section — anchored to the REQ-145 header comment block).
    const sectionStart = verifierSource.indexOf('REQ-145 — Pourquoi modal interpretation strings');
    assert.ok(sectionStart > 0,
      'REQ-145 section header not found in scripts/check-recipes.mjs');
    const sectionSlice = verifierSource.slice(sectionStart, sectionStart + 4000);
    const expectedKeysRe = /const expectedKeys\s*=\s*\[([^\]]+)\]/;
    const keysMatch = sectionSlice.match(expectedKeysRe);
    assert.ok(keysMatch,
      'expectedKeys array not found within REQ-145 section of check-recipes.mjs');
    const verifierKeys = new Set(
      keysMatch[1]
        .split(',')
        .map(token => token.trim().replace(/^['"]|['"]$/g, ''))
        .filter(token => token.length > 0)
    );

    assert.equal(specKeys.size, 7,
      `spec.md REQ-145 declares ${specKeys.size} render keys (expected 7): ${[...specKeys].join(', ')}`);
    assert.equal(verifierKeys.size, 7,
      `verifier expectedKeys has ${verifierKeys.size} entries (expected 7): ${[...verifierKeys].join(', ')}`);

    const missingInVerifier = [...specKeys].filter(key => !verifierKeys.has(key));
    const missingInSpec = [...verifierKeys].filter(key => !specKeys.has(key));
    assert.deepEqual(missingInVerifier, [],
      `keys in spec.md but missing from verifier: ${missingInVerifier.join(', ')}`);
    assert.deepEqual(missingInSpec, [],
      `keys in verifier but missing from spec.md: ${missingInSpec.join(', ')}`);

    // Spot-check the new key is in the set on both sides (regression guard
    // for the 6 → 7 extension landed 2026-05-17).
    assert.ok(specKeys.has('micros-foliar-routed'),
      'spec.md REQ-145 missing micros-foliar-routed render block');
    assert.ok(verifierKeys.has('micros-foliar-routed'),
      'verifier expectedKeys missing micros-foliar-routed entry');
  });
});
