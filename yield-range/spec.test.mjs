// Tests for yield-range/spec.md (REQ-112 .. REQ-118, REQ-171 .. REQ-175).
//
// This file pins the NEW two-regime contract added in the 2026-05-17
// extension: nursery + field integrator, days-to-potential per regime,
// trajectory tagged with regime, geometric canopy caps, leaf-area-based
// field DLI share, and throughput-bounded annual yield.
//
// Wave 1 (test-writer) authors these tests; many WILL FAIL until Wave 2
// (coder) extends calc.js/data.js/model.js. Tests read namespace symbols
// defensively — when a symbol is missing, the test asserts "expected X to
// be defined" then short-circuits with `return` so the failure message
// names the missing surface instead of crashing on undefined.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { loadYieldRange } from './test-helpers.mjs';

const { namespace, window: bundleWindow } = loadYieldRange();

// Common deterministic inputs. Two-regime full lifecycle.
const BASE_INPUTS = {
  plateauSize: 50,
  ledHours: 12,
  nurseryDays: 21,
  fieldDays: 21,
  fieldDensityHeadsPerM2: 43,
  nurseryAreaM2: 10,
  fieldAreaM2: 100,
};

// Predict once for the shared inputs so most tests inspect the same
// object; per-test variants override what they need.
function predict(overrides = {}) {
  if (!namespace || typeof namespace.predictNurseryYield !== 'function') {
    return null;
  }
  return namespace.predictNurseryYield({ ...BASE_INPUTS, ...overrides });
}

// ─── REQ-117 — Days-to-potential outputs (both regimes) ────────────────
describe('REQ-117 — Days-to-potential outputs (both regimes)', () => {
  test('REQ-117 — daysToTransplantPotential is first day in [1, nurseryDays] where W ≥ 0.95 × nurseryCanopyCapG', () => {
    const out = predict();
    assert.ok(out, 'predictNurseryYield must return a result');
    assert.ok('daysToTransplantPotential' in out,
      'output must expose daysToTransplantPotential');
    assert.ok('nurseryCanopyCapG' in out,
      'output must expose nurseryCanopyCapG');
    if (out.daysToTransplantPotential === null) {
      // Acceptable only when trajectory never crosses the threshold.
      const inNursery = out.trajectory.filter(p => p.day >= 1 && p.day <= BASE_INPUTS.nurseryDays);
      const ever = inNursery.some(p => p.weight_g >= 0.95 * out.nurseryCanopyCapG);
      assert.equal(ever, false,
        'daysToTransplantPotential null only if trajectory never reaches threshold in nursery range');
    } else {
      const d = out.daysToTransplantPotential;
      assert.ok(Number.isInteger(d) && d >= 1 && d <= BASE_INPUTS.nurseryDays,
        `daysToTransplantPotential must be integer in [1, ${BASE_INPUTS.nurseryDays}], got ${d}`);
      // First-day claim: at day d, W ≥ 0.95 × cap; at day d-1, W < 0.95 × cap.
      const at = out.trajectory.find(p => p.day === d);
      const before = out.trajectory.find(p => p.day === d - 1);
      assert.ok(at && at.weight_g >= 0.95 * out.nurseryCanopyCapG,
        `W at day ${d} (${at && at.weight_g}) must be ≥ 0.95 × nurseryCap (${0.95 * out.nurseryCanopyCapG})`);
      if (d > 1) {
        assert.ok(before.weight_g < 0.95 * out.nurseryCanopyCapG,
          `W at day ${d-1} (${before.weight_g}) must be < 0.95 × nurseryCap; otherwise daysToTransplantPotential not first crossing`);
      }
    }
  });

  test('REQ-117 — daysToTransplantPotential === null when nursery trajectory never reaches threshold', () => {
    // Tiny nurseryDays + zero LED → almost no growth in nursery window.
    const out = predict({ nurseryDays: 3, ledHours: 0 });
    if (!out) return;
    assert.equal(out.daysToTransplantPotential, null,
      `daysToTransplantPotential must be null when nursery does not reach 0.95×cap by day nurseryDays`);
  });

  test('REQ-117 — daysToHarvestPotential is first day in [nurseryDays+1, nurseryDays+fieldDays] where W ≥ 0.95 × fieldCanopyCapG', () => {
    const out = predict();
    if (!out) return;
    assert.ok('daysToHarvestPotential' in out,
      'output must expose daysToHarvestPotential');
    assert.ok('fieldCanopyCapG' in out,
      'output must expose fieldCanopyCapG');
    const lo = BASE_INPUTS.nurseryDays + 1;
    const hi = BASE_INPUTS.nurseryDays + BASE_INPUTS.fieldDays;
    if (out.daysToHarvestPotential === null) {
      const inField = out.trajectory.filter(p => p.day >= lo && p.day <= hi);
      const ever = inField.some(p => p.weight_g >= 0.95 * out.fieldCanopyCapG);
      assert.equal(ever, false,
        'daysToHarvestPotential null only if trajectory never reaches threshold in field range');
    } else {
      const d = out.daysToHarvestPotential;
      assert.ok(Number.isInteger(d) && d >= lo && d <= hi,
        `daysToHarvestPotential must be integer in [${lo}, ${hi}], got ${d}`);
      const at = out.trajectory.find(p => p.day === d);
      assert.ok(at && at.weight_g >= 0.95 * out.fieldCanopyCapG,
        `W at day ${d} must be ≥ 0.95 × fieldCap`);
    }
  });

  test('REQ-117 — daysToHarvestPotential === null when field trajectory never reaches threshold', () => {
    // Tiny fieldDays after nursery → field portion too short to mature.
    const out = predict({ fieldDays: 2 });
    if (!out) return;
    assert.equal(out.daysToHarvestPotential, null,
      `daysToHarvestPotential must be null when field does not reach 0.95×fieldCap by day nurseryDays+fieldDays`);
  });

  test('REQ-117 — output does NOT carry legacy singular `daysToPotential` key', () => {
    const out = predict();
    if (!out) return;
    assert.equal('daysToPotential' in out, false,
      'singular legacy daysToPotential must be removed once daysTo{Transplant,Harvest}Potential land');
  });
});

// ─── REQ-118 — Trajectory output for chart ─────────────────────────────
describe('REQ-118 — Trajectory output for chart', () => {
  test('REQ-118 — trajectory length === nurseryDays + fieldDays + 1', () => {
    const out = predict();
    if (!out) return;
    assert.ok(Array.isArray(out.trajectory), 'trajectory must be an array');
    assert.equal(out.trajectory.length, BASE_INPUTS.nurseryDays + BASE_INPUTS.fieldDays + 1,
      `trajectory length must be nurseryDays + fieldDays + 1 = ${BASE_INPUTS.nurseryDays + BASE_INPUTS.fieldDays + 1}`);
  });

  test('REQ-118 — each trajectory entry carries { day, weight_g, regime }', () => {
    const out = predict();
    if (!out) return;
    for (const entry of out.trajectory) {
      assert.equal(typeof entry.day, 'number', `entry.day must be numeric, got ${entry.day}`);
      assert.equal(typeof entry.weight_g, 'number', `entry.weight_g must be numeric`);
      assert.ok('regime' in entry, `entry must carry regime key (got keys ${Object.keys(entry)})`);
      assert.ok(entry.regime === 'nursery' || entry.regime === 'field',
        `entry.regime must be 'nursery' or 'field', got '${entry.regime}'`);
    }
  });

  test('REQ-118 — regime === "nursery" for day ≤ nurseryDays, "field" for day ≥ nurseryDays + 1', () => {
    const out = predict();
    if (!out) return;
    for (const entry of out.trajectory) {
      if (entry.day <= BASE_INPUTS.nurseryDays) {
        assert.equal(entry.regime, 'nursery',
          `day ${entry.day} ≤ nurseryDays must be 'nursery', got '${entry.regime}'`);
      } else {
        assert.equal(entry.regime, 'field',
          `day ${entry.day} > nurseryDays must be 'field', got '${entry.regime}'`);
      }
    }
  });

  test('REQ-118 — trajectory length is dynamic, not capped at 49', () => {
    // 30 + 30 = 60 days > legacy TRAJECTORY_MAXIMUM_DAYS of 49.
    const out = predict({ nurseryDays: 30, fieldDays: 30 });
    if (!out) return;
    assert.equal(out.trajectory.length, 61,
      `trajectory must be 61 entries for nurseryDays=30 + fieldDays=30, not capped at 50`);
  });
});

// ─── REQ-171 — Two-regime growth integrator ────────────────────────────
describe('REQ-171 — Two-regime growth integrator', () => {
  test('REQ-171 — integrator covers day 1 through nurseryDays + fieldDays inclusive', () => {
    const out = predict({ nurseryDays: 14, fieldDays: 14 });
    if (!out) return;
    const days = out.trajectory.map(p => p.day);
    assert.equal(Math.min(...days), 0, 'trajectory must include day 0');
    assert.equal(Math.max(...days), 28, 'trajectory max day must be nurseryDays + fieldDays = 28');
  });

  test('REQ-171 — at day ≤ nurseryDays the operative cap is nurseryCanopyCapG (CANOPY_CAP_BY_PLATEAU[plateauSize])', () => {
    const out = predict();
    assert.ok(out, 'predictNurseryYield must return a result');
    const capByPlateau = namespace.CANOPY_CAP_BY_PLATEAU;
    assert.ok(capByPlateau, 'CANOPY_CAP_BY_PLATEAU must be reachable via the namespace');
    assert.equal(out.nurseryCanopyCapG, capByPlateau[BASE_INPUTS.plateauSize],
      `nurseryCanopyCapG must equal CANOPY_CAP_BY_PLATEAU[${BASE_INPUTS.plateauSize}]`);
    // Nursery weights never exceed the nursery cap.
    for (const entry of out.trajectory) {
      if (entry.day <= BASE_INPUTS.nurseryDays) {
        assert.ok(entry.weight_g <= out.nurseryCanopyCapG + 1e-6,
          `day ${entry.day} W=${entry.weight_g} must not exceed nurseryCap=${out.nurseryCanopyCapG}`);
      }
    }
  });

  test('REQ-171 — at day > nurseryDays the operative cap is fieldCanopyCapByDensity(fieldDensityHeadsPerM2)', () => {
    const out = predict();
    assert.ok(out, 'predictNurseryYield must return a result');
    const fn = namespace.fieldCanopyCapByDensity;
    assert.equal(typeof fn, 'function',
      'fieldCanopyCapByDensity must be exposed on YieldRange namespace');
    const expectedFieldCap = fn(BASE_INPUTS.fieldDensityHeadsPerM2);
    assert.ok(Math.abs(out.fieldCanopyCapG - expectedFieldCap) < 1e-6,
      `fieldCanopyCapG (${out.fieldCanopyCapG}) must equal fieldCanopyCapByDensity(${BASE_INPUTS.fieldDensityHeadsPerM2}) = ${expectedFieldCap}`);
    for (const entry of out.trajectory) {
      if (entry.day > BASE_INPUTS.nurseryDays) {
        assert.ok(entry.weight_g <= out.fieldCanopyCapG + 1e-6,
          `day ${entry.day} W=${entry.weight_g} must not exceed fieldCap=${out.fieldCanopyCapG}`);
      }
    }
  });

  test('REQ-171 — growth-term continuity: when nurseryCap === fieldCap, no discontinuity across the regime boundary', () => {
    // Force nursery and field caps equal by picking plateau 50 (cap=25g)
    // and a field density where fieldCanopyCapByDensity(d) ≈ 25. From
    // REQ-173: cap = (1/d) × 0.18 × 55 × 1000 = 9900 / d. 9900 / 25 = 396.
    const fn = namespace && (namespace.fieldCanopyCapByDensity || bundleWindow.fieldCanopyCapByDensity);
    assert.equal(typeof fn, 'function',
      'fieldCanopyCapByDensity must be a function on the YieldRange namespace');
    const dEqual = 9900 / 25;
    const equalCap = fn(dEqual);
    assert.ok(Math.abs(equalCap - 25) < 1.0,
      `precondition: fieldCanopyCapByDensity(${dEqual}) ≈ 25, got ${equalCap}`);
    const out = predict({ fieldDensityHeadsPerM2: dEqual, nurseryDays: 30, fieldDays: 10 });
    assert.ok(out, 'predictNurseryYield must return a result');
    const nurseryEnd = out.trajectory.find(p => p.day === 30);
    const fieldStart = out.trajectory.find(p => p.day === 31);
    assert.ok(nurseryEnd && fieldStart,
      `trajectory must include both day 30 (nursery end) and day 31 (field start)`);
    // No decay across boundary: weight is non-decreasing.
    assert.ok(fieldStart.weight_g >= nurseryEnd.weight_g - 1e-9,
      `field-start weight (${fieldStart.weight_g}) must be ≥ nursery-end (${nurseryEnd.weight_g}); no decay across boundary`);
  });
});

// ─── REQ-172 — Nursery canopy cap by tray cells ────────────────────────
describe('REQ-172 — Nursery canopy cap by tray cells', () => {
  test('REQ-172 — CANOPY_CAP_BY_PLATEAU has exactly the four keys 18, 24, 32, 50', () => {
    const table = namespace.CANOPY_CAP_BY_PLATEAU;
    assert.ok(table, 'CANOPY_CAP_BY_PLATEAU must be exposed on the YieldRange namespace');
    const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
    assert.deepEqual(keys, [18, 24, 32, 50],
      `CANOPY_CAP_BY_PLATEAU keys must be exactly {18, 24, 32, 50}; got ${keys.join(',')}`);
  });

  test('REQ-172 — values match geometric formula area_per_cell × FOLIAGE_HEIGHT_M × FOLIAGE_DENSITY × 1000 within ±1 g', () => {
    const table = namespace.CANOPY_CAP_BY_PLATEAU;
    assert.ok(table, 'CANOPY_CAP_BY_PLATEAU must be exposed on the YieldRange namespace');
    const FOLIAGE_HEIGHT_M = namespace.FOLIAGE_HEIGHT_M;
    const FOLIAGE_DENSITY = namespace.FOLIAGE_DENSITY_KG_PER_M3;
    assert.equal(typeof FOLIAGE_HEIGHT_M, 'number',
      'FOLIAGE_HEIGHT_M must be exposed on the YieldRange namespace');
    assert.equal(typeof FOLIAGE_DENSITY, 'number',
      'FOLIAGE_DENSITY_KG_PER_M3 must be exposed on the YieldRange namespace');
    const TRAY_FRAME_M2 = 0.1525;
    for (const plateau of [18, 24, 32, 50]) {
      const expected = (TRAY_FRAME_M2 / plateau) * FOLIAGE_HEIGHT_M * FOLIAGE_DENSITY * 1000;
      assert.ok(Math.abs(table[plateau] - expected) < 1.0,
        `CANOPY_CAP_BY_PLATEAU[${plateau}] = ${table[plateau]}; geometric expected ≈ ${expected.toFixed(2)} g`);
    }
  });

  test('REQ-172 — pinned values per spec: { 18: 69, 24: 52, 32: 39, 50: 25 } within ±1 g', () => {
    const table = namespace.CANOPY_CAP_BY_PLATEAU;
    assert.ok(table, 'CANOPY_CAP_BY_PLATEAU must be exposed on the YieldRange namespace');
    const expected = { 18: 69, 24: 52, 32: 39, 50: 25 };
    for (const [plateau, exp] of Object.entries(expected)) {
      assert.ok(Math.abs(table[plateau] - exp) < 1.0,
        `CANOPY_CAP_BY_PLATEAU[${plateau}] must be ≈ ${exp} g (spec), got ${table[plateau]}`);
    }
  });

  test('REQ-172 — FOLIAGE_HEIGHT_M = 0.10 m and FOLIAGE_DENSITY_KG_PER_M3 = 82 exposed via namespace', () => {
    assert.equal(namespace.FOLIAGE_HEIGHT_M, 0.10,
      `FOLIAGE_HEIGHT_M must be 0.10, got ${namespace.FOLIAGE_HEIGHT_M}`);
    assert.equal(namespace.FOLIAGE_DENSITY_KG_PER_M3, 82,
      `FOLIAGE_DENSITY_KG_PER_M3 must be 82, got ${namespace.FOLIAGE_DENSITY_KG_PER_M3}`);
  });
});

// ─── REQ-173 — Field canopy cap by density ─────────────────────────────
describe('REQ-173 — Field canopy cap by density', () => {
  test('REQ-173 — fieldCanopyCapByDensity(43) ≈ 230 g/head within ±1', () => {
    const fn = namespace && namespace.fieldCanopyCapByDensity;
    assert.equal(typeof fn, 'function',
      'fieldCanopyCapByDensity must be a function on the YieldRange namespace');
    const cap43 = fn(43);
    // (1/43) × 0.18 × 55 × 1000 = 230.23 g
    assert.ok(Math.abs(cap43 - 230) < 1.0,
      `fieldCanopyCapByDensity(43) must be ≈ 230 g (spec), got ${cap43}`);
  });

  test('REQ-173 — monotonic decreasing in d (denser → smaller per-plant cap)', () => {
    const fn = namespace && (namespace.fieldCanopyCapByDensity || bundleWindow.fieldCanopyCapByDensity);
    assert.equal(typeof fn, 'function',
      'fieldCanopyCapByDensity must be a function on the YieldRange namespace');
    const c30 = fn(30);
    const c43 = fn(43);
    const c60 = fn(60);
    assert.ok(c30 > c43, `cap at d=30 (${c30}) must be > cap at d=43 (${c43})`);
    assert.ok(c43 > c60, `cap at d=43 (${c43}) must be > cap at d=60 (${c60})`);
  });

  test('REQ-173 — at d = 1, returns FIELD_CANOPY_HEIGHT_M × FIELD_FOLIAGE_DENSITY × 1000 = 9900 g', () => {
    const fn = namespace && (namespace.fieldCanopyCapByDensity || bundleWindow.fieldCanopyCapByDensity);
    assert.equal(typeof fn, 'function',
      'fieldCanopyCapByDensity must be a function on the YieldRange namespace');
    const cap1 = fn(1);
    // 0.18 × 55 × 1000 = 9900
    assert.ok(Math.abs(cap1 - 9900) < 1.0,
      `fieldCanopyCapByDensity(1) must equal FIELD_HEIGHT × FIELD_DENSITY × 1000 = 9900 g, got ${cap1}`);
  });

  test('REQ-173 — FIELD_CANOPY_HEIGHT_M = 0.18 m and FIELD_FOLIAGE_DENSITY_KG_PER_M3 = 55 exposed via namespace', () => {
    assert.equal(namespace.FIELD_CANOPY_HEIGHT_M, 0.18,
      `FIELD_CANOPY_HEIGHT_M must be 0.18, got ${namespace.FIELD_CANOPY_HEIGHT_M}`);
    assert.equal(namespace.FIELD_FOLIAGE_DENSITY_KG_PER_M3, 55,
      `FIELD_FOLIAGE_DENSITY_KG_PER_M3 must be 55, got ${namespace.FIELD_FOLIAGE_DENSITY_KG_PER_M3}`);
  });
});

// ─── REQ-174 — Field per-plant DLI share ───────────────────────────────
describe('REQ-174 — Field per-plant DLI share', () => {
  test('REQ-174 — LEAF_PROJECTED_AREA_M2_PER_G constant equals 0.00035 (exposed via namespace)', () => {
    assert.equal(namespace.LEAF_PROJECTED_AREA_M2_PER_G, 0.00035,
      `LEAF_PROJECTED_AREA_M2_PER_G must be 0.00035 m²/g, got ${namespace.LEAF_PROJECTED_AREA_M2_PER_G}`);
  });

  test('REQ-174 — at w near 0, share === 1.0 (clamped at ceiling)', () => {
    const fn = namespace && namespace.perPlantDliShareField;
    assert.equal(typeof fn, 'function',
      'perPlantDliShareField must be a function on the YieldRange namespace');
    assert.equal(fn(0.01, 43), 1.0,
      `share at w=0.01, d=43 must be clamped to 1.0, got ${fn(0.01, 43)}`);
    assert.equal(fn(1, 43), 1.0,
      `share at w=1 g, d=43 must be 1.0 (rosette much smaller than spacing), got ${fn(1, 43)}`);
  });

  test('REQ-174 — at large w, share clamps at floor 0.40', () => {
    const fn = namespace && (namespace.perPlantDliShareField || bundleWindow.perPlantDliShareField);
    assert.equal(typeof fn, 'function',
      'perPlantDliShareField must be a function on the YieldRange namespace');
    const share = fn(1000, 43);
    assert.ok(Math.abs(share - 0.40) < 1e-9,
      `share at w=1000 g, d=43 must be clamped at 0.40, got ${share}`);
  });

  test('REQ-174 — monotonic non-increasing in w (heavier plant ≤ lighter share)', () => {
    const fn = namespace && (namespace.perPlantDliShareField || bundleWindow.perPlantDliShareField);
    assert.equal(typeof fn, 'function',
      'perPlantDliShareField must be a function on the YieldRange namespace');
    const samples = [20, 80, 150, 300].map(w => fn(w, 43));
    for (let i = 1; i < samples.length; i++) {
      assert.ok(samples[i] <= samples[i - 1] + 1e-9,
        `share must be non-increasing in w; samples[${i-1}]=${samples[i-1]}, samples[${i}]=${samples[i]}`);
    }
  });

  test('REQ-174 — transition: at w where leaf cover = 1.0 (w ≈ 66.4 g at d=43), share = 1.0; slightly above, share < 1.0', () => {
    const fn = namespace && (namespace.perPlantDliShareField || bundleWindow.perPlantDliShareField);
    assert.equal(typeof fn, 'function',
      'perPlantDliShareField must be a function on the YieldRange namespace');
    // w = 1 / (0.00035 × 43) = 66.445 g
    const transitionW = 1 / (0.00035 * 43);
    const atBoundary = fn(transitionW, 43);
    const above = fn(transitionW * 1.5, 43);
    assert.ok(Math.abs(atBoundary - 1.0) < 1e-6,
      `share at leaf-cover=1.0 boundary (w ≈ ${transitionW.toFixed(2)} g) must be 1.0, got ${atBoundary}`);
    assert.ok(above < 1.0,
      `share at w = 1.5 × transitionW must be < 1.0, got ${above}`);
    assert.ok(above >= 0.40 - 1e-9,
      `share at w = 1.5 × transitionW must respect floor 0.40, got ${above}`);
  });
});

// ─── REQ-175 — Throughput-bounded annual yield ─────────────────────────
describe('REQ-175 — Throughput-bounded annual yield', () => {
  test('REQ-175 — output exposes annualYieldKg and bottleneckStage', () => {
    const out = predict();
    if (!out) return;
    assert.ok('annualYieldKg' in out, 'output must expose annualYieldKg');
    assert.ok('bottleneckStage' in out, 'output must expose bottleneckStage');
    assert.ok(out.bottleneckStage === 'nursery' || out.bottleneckStage === 'field',
      `bottleneckStage must be 'nursery' or 'field', got '${out.bottleneckStage}'`);
  });

  test('REQ-175 — nursery bottleneck: tiny nurseryArea + huge fieldArea → bottleneckStage = "nursery"', () => {
    // nurseryOutputPerDay = (1 × 50/0.1525) / 21 = 15.61 heads/day
    // fieldIntakePerDay   = (1000 × 43) / 21    = 2047.6 heads/day
    // min = nursery → annual = 15.61 × 365 × harvestWeightG / 1000
    const out = predict({ nurseryAreaM2: 1, fieldAreaM2: 1000 });
    if (!out) return;
    assert.equal(out.bottleneckStage, 'nursery',
      `bottleneckStage must be 'nursery' when nurseryOutput < fieldIntake, got '${out.bottleneckStage}'`);
    const trayCellsPerM2 = BASE_INPUTS.plateauSize / 0.1525;
    const nurseryOutputPerDay = (1 * trayCellsPerM2) / BASE_INPUTS.nurseryDays;
    const expected = nurseryOutputPerDay * 365 * out.harvestWeightG / 1000;
    assert.ok(Math.abs(out.annualYieldKg - expected) / expected < 0.001,
      `annualYieldKg must equal nurseryOutputPerDay × 365 × harvestWeightG / 1000 = ${expected.toFixed(2)}, got ${out.annualYieldKg}`);
  });

  test('REQ-175 — field bottleneck: huge nurseryArea + tiny fieldArea → bottleneckStage = "field"', () => {
    // nurseryOutputPerDay = (1000 × 50/0.1525) / 21 ≈ 15610 heads/day
    // fieldIntakePerDay   = (1 × 43) / 21 ≈ 2.05 heads/day
    // min = field
    const out = predict({ nurseryAreaM2: 1000, fieldAreaM2: 1 });
    if (!out) return;
    assert.equal(out.bottleneckStage, 'field',
      `bottleneckStage must be 'field' when fieldIntake < nurseryOutput, got '${out.bottleneckStage}'`);
    const fieldIntakePerDay = (1 * BASE_INPUTS.fieldDensityHeadsPerM2) / BASE_INPUTS.fieldDays;
    const expected = fieldIntakePerDay * 365 * out.harvestWeightG / 1000;
    assert.ok(Math.abs(out.annualYieldKg - expected) / expected < 0.001,
      `annualYieldKg must equal fieldIntakePerDay × 365 × harvestWeightG / 1000 = ${expected.toFixed(2)}, got ${out.annualYieldKg}`);
  });

  test('REQ-175 — trayCellsPerM2 = plateauSize / 0.1525 (geometric pin via nursery-bottleneck case)', () => {
    // Pin the trayCellsPerM2 ratio: for plateau 50 it must be 50/0.1525 ≈ 327.87,
    // for plateau 32 → 32/0.1525 ≈ 209.84. We test by running two scenarios
    // and verifying the implied nurseryOutputPerDay ratio matches plateau ratio.
    const out50 = predict({ plateauSize: 50, nurseryAreaM2: 1, fieldAreaM2: 1000 });
    const out32 = predict({ plateauSize: 32, nurseryAreaM2: 1, fieldAreaM2: 1000 });
    assert.ok(out50 && out32, 'predictNurseryYield must return results for both plateau sizes');
    assert.equal(out50.bottleneckStage, 'nursery', 'precondition: nursery must bottleneck at plateau 50');
    assert.equal(out32.bottleneckStage, 'nursery', 'precondition: nursery must bottleneck at plateau 32');
    const ratio = (out50.annualYieldKg / out50.harvestWeightG) / (out32.annualYieldKg / out32.harvestWeightG);
    const expectedRatio = 50 / 32;
    assert.ok(Math.abs(ratio - expectedRatio) / expectedRatio < 0.01,
      `nursery-throughput ratio at plateau 50 vs 32 must match 50/32 = ${expectedRatio.toFixed(4)}, got ${ratio.toFixed(4)}`);
  });
});

// ─── Inherited REQ guards (NOT being amended in this wave) ─────────────
//
// These tests stay light — they pin the cross-REQ behaviour the extended
// model must preserve, NOT re-test the legacy REQs. If they fail it
// signals a regression Wave 2 introduced incidentally.
describe('Inherited — REQ-112/114/115 preserved across the extension', () => {
  test('REQ-112 — nurseryCanopyCapG remains the operative nursery ceiling', () => {
    const out = predict();
    if (!out) return;
    for (const entry of out.trajectory) {
      if (entry.day <= BASE_INPUTS.nurseryDays) {
        assert.ok(entry.weight_g <= out.nurseryCanopyCapG + 1e-6,
          `nursery W must respect nurseryCanopyCapG`);
      }
    }
  });

  test('REQ-114 — dliBenchAvg still exposed and equals sun + LED contribution', () => {
    const fn = namespace && namespace.dliBenchAvg;
    assert.equal(typeof fn, 'function', 'dliBenchAvg must remain on the YieldRange namespace');
    const sun = namespace.DLI_SUN_GH_ANNUAL_AVG_QC;
    const led = (namespace.LED_PPFD * 12 * 3600) / 1e6;
    const expected = sun + led;
    assert.ok(Math.abs(fn(12) - expected) < 1e-9,
      `dliBenchAvg(12) must equal sun + LED contribution = ${expected}, got ${fn(12)}`);
  });

  test('REQ-115 — W never decreases between consecutive days (no decay branch)', () => {
    const out = predict();
    if (!out) return;
    for (let i = 1; i < out.trajectory.length; i++) {
      assert.ok(out.trajectory[i].weight_g >= out.trajectory[i - 1].weight_g - 1e-9,
        `W must be non-decreasing; day ${out.trajectory[i].day} W=${out.trajectory[i].weight_g} < day ${out.trajectory[i-1].day} W=${out.trajectory[i-1].weight_g}`);
    }
  });
});
