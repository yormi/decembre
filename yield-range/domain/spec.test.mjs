// Tests for yield-range/domain/spec.md — carbon-balance yield model.
//
// Pins the unified engine (ε·DLI·A·(1 − exp(−k·LAI)) → volume cap →
// senescence), the four operator inputs (field spacing, labor routine,
// nursery tray, thinning), and the throughput → kg/month + yearly sales +
// trays outputs.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { loadYieldRange } from './test-helpers.mjs';

const { namespace: ns } = loadYieldRange();

const BASE = {
  fieldSpacingKey: '5r6',
  laborRoutineKey: '2wk',
  nurseryTrayCells: 50,
  thinning: true,
  thinDay: 21,
  nurseryDays: 28,
};
const predict = (o = {}) => ns.predictYield({ ...BASE, ...o });

// ─── Inputs → geometry ───────────────────────────────────────
describe('field-spacing-config', () => {
  test('seven spacing configs, each rows × in-row inches', () => {
    assert.equal(ns.FIELD_SPACING_CONFIGS.length, 7);
    for (const c of ns.FIELD_SPACING_CONFIGS) {
      assert.ok(c.key && c.label && c.rows > 0 && c.inRowInch > 0);
    }
  });

  test('density = rows / (bedWidth × inRowSpacing); 5r×6" ≈ 43 heads/m²', () => {
    const cfg = ns.FIELD_SPACING_CONFIGS.find(c => c.key === '5r6');
    assert.ok(Math.abs(ns.fieldDensityFromConfig(cfg) - 43.06) < 0.5);
  });

  test('denser configs give more heads/m²', () => {
    const d = k => ns.fieldDensityFromConfig(ns.FIELD_SPACING_CONFIGS.find(c => c.key === k));
    assert.ok(d('6r4') > d('5r6'));
    assert.ok(d('5r6') > d('3r10'));
  });
});

describe('field-canopy-cap-by-density', () => {
  test('fieldCanopyCapByDensity(43) ≈ 230 g/head', () => {
    assert.ok(Math.abs(ns.fieldCanopyCapByDensity(43) - 230.23) < 1);
  });
  test('monotonic decreasing — denser → smaller heads', () => {
    assert.ok(ns.fieldCanopyCapByDensity(30) > ns.fieldCanopyCapByDensity(60));
  });
});

// ─── labor-routine-cadence ───────────────────────────────────
describe('labor-routine-cadence', () => {
  test('three routines: 14/21/28 field days', () => {
    assert.deepEqual(Array.from(ns.LABOR_ROUTINES, r => r.fieldDays), [14, 21, 28]);
  });
  test('beds/week = 4 ÷ (fieldDays/7): 2.0 / 1.33 / 1.0', () => {
    assert.ok(Math.abs(predict({ laborRoutineKey: '2wk' }).bedsPerWeek - 2.0) < 1e-9);
    assert.ok(Math.abs(predict({ laborRoutineKey: '3wk' }).bedsPerWeek - 4 / 3) < 1e-9);
    assert.ok(Math.abs(predict({ laborRoutineKey: '4wk' }).bedsPerWeek - 1.0) < 1e-9);
  });
});

// ─── carbon-balance-growth ───────────────────────────────────
describe('carbon-balance-growth', () => {
  test('trajectory spans day 1 (sowing)..nurseryDays+fieldDays with regime tags', () => {
    const out = predict();
    assert.equal(out.trajectory[0].day, 1);
    assert.equal(out.trajectory.at(-1).day, BASE.nurseryDays + 14);
    assert.equal(out.trajectory.length, BASE.nurseryDays + 14);
    for (const p of out.trajectory) {
      assert.equal(p.regime, p.day <= BASE.nurseryDays ? 'nursery' : 'field');
    }
  });

  test('flat until emergence, then a convex ramp', () => {
    const out = predict();
    const w = d => out.trajectory.find(p => p.day === d).weight_g;
    // Emergence is an OUTPUT of thermal time, so read it off the run.
    assert.ok(out.emergenceDay > 1);
    assert.equal(w(1), w(Math.floor(out.emergenceDay)));
    assert.ok(w(Math.ceil(out.emergenceDay) + 1) > w(1));
    // Convex once photosynthesising: the later 3-day gain exceeds the earlier.
    assert.ok(w(12) - w(9) > w(9) - w(6));
  });

  test('germination time falls out of soil temperature, not a constant', () => {
    const days = ns.germinationDaysFromSoilTemperature;
    // Thermal time: warmer soil fires the seed sooner, monotonically.
    assert.ok(days(21) < days(18));
    assert.ok(days(18) < days(15));
    // The band edges cannot germinate at all.
    assert.equal(days(ns.GERMINATION_BASE_TEMPERATURE_C), null);
    assert.equal(days(ns.GERMINATION_INHIBITION_TEMPERATURE_C + 1), null);
    // Degree-days above base, exactly.
    const temperature = 20;
    const expected = ns.GERMINATION_THERMAL_TIME_DEGREE_DAYS
      / (temperature - ns.GERMINATION_BASE_TEMPERATURE_C);
    assert.ok(Math.abs(days(temperature) - expected) < 1e-9);
    // A thermo-dormant nursery is an error, not a silent zero-growth run.
    assert.throws(() => predict({ nurserySoilTemperatureC: 30 }), /no germination/);
  });

  test('warmer soil emerges sooner and so transplants heavier', () => {
    const at = t => predict({ nurserySoilTemperatureC: t });
    assert.ok(at(21).emergenceDay < at(16).emergenceDay);
    assert.ok(at(21).transplantWeightG > at(16).transplantWeightG);
  });

  test('small-LAI gain ≈ GROWTH_RGR × W — SLA is derived at the week-2 ceiling', () => {
    // Beer–Lambert gain at small LAI must collapse to the anchored exponential
    // rate: ε·DLI·A·(1 − exp(−k·W·SLA/A)) → GROWTH_RGR·W as LAI → 0. The DLI is
    // the WEEK-2 ceiling, not DLI_TARGET — that is where SPECIFIC_LEAF_AREA is
    // back-solved (data.js). Using DLI_TARGET here is what made this red.
    const { RADIATION_USE_EFFICIENCY: eps, NURSERY_DLI_CEILING_BY_WEEK: ceiling,
      LEAF_AREA_EXTINCTION_K: k, SPECIFIC_LEAF_AREA: sla, GROWTH_RGR: rm } = ns;
    const dli = ceiling[1];
    const A = 0.003;                 // ground area per plant (m²)
    const W = 0.02;                  // tiny dry mass → LAI ≈ 0.1
    const gain = eps * dli * A * (1 - Math.exp(-k * W * sla / A));
    assert.ok(Math.abs(gain - rm * W) / (rm * W) < 0.05);
  });

  test('weight never exceeds the operative volume cap', () => {
    const out = predict();
    for (const p of out.trajectory) {
      const cap = p.regime === 'field' ? out.fieldCapG : out.nurseryCapSpacedG;
      assert.ok(p.weight_g <= cap + 1e-6, `day ${p.day} ${p.weight_g} > cap ${cap}`);
    }
  });
});

// ─── nursery stress regime (drought + heat) ──────────────────
describe('nursery-stress-regime', () => {
  // Sowing day 25 — the age of the 5 g drought+heat data point (doc/data-points.md).
  const plug = (o) => {
    const out = predict({ nurseryTrayCells: 50, nurseryDays: 28, thinning: false, thinDay: null, ...o });
    return out.trajectory.find(p => p.day === 25).weight_g;
  };

  // 5 g (biggest) @ d25 is a recorded datum, NOT reproduced: it was weighed at
  // an assumed DLI 17 on a biggest-plant basis, and the engine predicts a mean
  // plant at the wk3+ ceiling 25. No value assertion — see
  // learnings/5g-day25-drought-heat-primary-anchor.md.
  test('nursery drives on the age ceiling, field on DLI_TARGET', () => {
    // Array.from: the sandbox array is cross-realm, so deepStrictEqual fails
    // the prototype check even on identical contents.
    assert.deepEqual(Array.from(ns.NURSERY_DLI_CEILING_BY_WEEK), [10, 14, 25]);
    // wk3+ ceiling sits above DLI_TARGET: it lifts the plug, not the head.
    assert.ok(ns.NURSERY_DLI_CEILING_BY_WEEK[2] > ns.DLI_TARGET);
  });

  test('stress lowers the plug — clean runs larger than stressed', () => {
    assert.ok(plug({ nurseryStress: false }) > plug({ nurseryStress: true }));
  });

  test('a stressed (smaller) transplant harvests no heavier than a clean one', () => {
    const h = s => predict({ nurseryStress: s }).harvestWeightG;
    assert.ok(h(true) <= h(false) + 1e-9);
  });
});

// ─── senescence-past-closure ─────────────────────────────────
describe('senescence-past-closure', () => {
  test('2-week routine harvests near peak — not flagged senescing', () => {
    const out = predict({ laborRoutineKey: '2wk' });
    assert.equal(out.senescingAtHarvest, false);
    assert.ok(out.harvestWeightG >= out.peakWeightG * 0.98);
  });

  test('holding longer loses weight: 4wk harvest < 3wk < 2wk', () => {
    const h = k => predict({ laborRoutineKey: k }).harvestWeightG;
    assert.ok(h('4wk') < h('3wk'));
    assert.ok(h('3wk') < h('2wk'));
  });

  test('over-held head is flagged senescing and sits below its peak', () => {
    const out = predict({ laborRoutineKey: '4wk' });
    assert.equal(out.senescingAtHarvest, true);
    assert.ok(out.harvestWeightG < out.peakWeightG);
  });

  test('seedling held long past its nursery peak → senescingAtTransplant', () => {
    // 50-cell packed, 5-week nursery, no thin to relieve crowding: the plug
    // peaks in the tray then declines before transplant.
    const out = predict({ nurseryTrayCells: 50, nurseryDays: 35, thinning: false, thinDay: null });
    assert.equal(out.senescingAtTransplant, true);
    assert.ok(out.transplantWeightG < out.nurseryPeakWeightG);
  });

  test('short nursery transplanted at the plug peak → not senescingAtTransplant', () => {
    const out = predict({ nurseryTrayCells: 50, nurseryDays: 14, thinDay: 7 });
    assert.equal(out.senescingAtTransplant, false);
  });
});

// ─── throughput-and-sales ────────────────────────────────────
describe('throughput-and-sales', () => {
  test('headsPerBed = bed area × density; headsPerWeek = beds/week × headsPerBed', () => {
    const out = predict();
    assert.ok(Math.abs(out.headsPerBed - ns.BED_AREA_M2 * out.density) < 1e-6);
    assert.ok(Math.abs(out.headsPerWeek - out.bedsPerWeek * out.headsPerBed) < 1e-6);
  });

  test('kg/month, kg/year, sales chain from kg/week', () => {
    const out = predict();
    const kgPerWeek = out.headsPerWeek * out.harvestWeightG / 1000;
    assert.ok(Math.abs(out.kgPerWeek - kgPerWeek) < 1e-6);
    assert.ok(Math.abs(out.kgPerMonth - kgPerWeek * 52 / 12) < 1e-6);
    assert.ok(Math.abs(out.kgPerYear - kgPerWeek * 52) < 1e-6);
    assert.ok(Math.abs(out.yearlySalesDollars - out.kgPerYear * ns.PRICE_PER_KG) < 1e-6);
  });
});

// ─── nursery-tray-config + trays-at-a-time ───────────────────
describe('nursery-tray-config', () => {
  test('trays at a time = heads/day × nurseryDays / cells (no thinning)', () => {
    const out = predict({ thinning: false, thinDay: null });
    const expected = (out.headsPerWeek / 7) * BASE.nurseryDays / BASE.nurseryTrayCells;
    assert.ok(Math.abs(out.traysInNursery - expected) < 1e-6);
  });

  test('checker-thin adds trays — post-thin cohorts occupy 2× trays', () => {
    const withThin = predict({ thinning: true, thinDay: 21 }).traysInNursery;
    const without = predict({ thinning: false, thinDay: null }).traysInNursery;
    assert.ok(withThin > without);
  });

  test('coarser tray (18-cell) → fewer trays than 50-cell at equal throughput', () => {
    // Equalize head weight influence by comparing at the same spacing/routine.
    const t50 = predict({ nurseryTrayCells: 50, thinning: false, thinDay: null }).traysInNursery;
    const t18 = predict({ nurseryTrayCells: 18, thinning: false, thinDay: null });
    // 18-cell holds fewer heads/tray → but heads/week differs via head weight;
    // compare tray count per head instead.
    const perHead18 = t18.traysInNursery / (t18.headsPerWeek / 7);
    assert.ok(perHead18 > (t50 / (predict({ thinning: false, thinDay: null }).headsPerWeek / 7)));
  });
});

// ─── input validation ────────────────────────────────────────
describe('input validation', () => {
  test('unknown spacing / routine / tray throws', () => {
    assert.throws(() => predict({ fieldSpacingKey: 'nope' }));
    assert.throws(() => predict({ laborRoutineKey: 'nope' }));
    assert.throws(() => predict({ nurseryTrayCells: 999 }));
  });
  test('thinDay outside [1, nurseryDays] throws when thinning', () => {
    assert.throws(() => predict({ thinning: true, thinDay: 99 }));
  });
});
