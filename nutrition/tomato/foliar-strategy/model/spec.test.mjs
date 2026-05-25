// Foliar-recipe spec tests — pins the normative claims in
// nutrition/tomato/foliar-strategy/spec.md against the live model.
//
// Coverage map:
//   INV-1   — Element coverage closed (numeric / finite / non-negative across all stages)
//   REQ-101 — Coverage discount applied to foliar delivery (Mn + Fe formula match)
//   REQ-103 — window.FoliarRecipeTomato public API surface (shape + spot-check)
//   REQ-112 — computeFoliarSupply(stage, opts, recipe) — sprayCount + surfactant + recipe-arg
//   REQ-115 — computeFoliarRecipeForGap (min-dose clamp, burn cap, CE-scale, 0.5 g grid)
//   REQ-116 — FP foliar recipe live-derived from pre-foliar gap chain
//
// Framework: node:test only. The fixture (test-helpers.mjs) boots
// dist/index.html into jsdom once and shares the window across tests.
//
// Strict assertions throughout — REQ-103/REQ-112 are cert 5 (structural);
// REQ-101 / REQ-116 are cert 4; REQ-115 is cert 3 (uses behavioral
// invariants — clamp, cap, CE bound — instead of pinning numeric burn-cap
// values that are flagged as refinable when tissue + lesion data lands).

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadFoliarFixture, recipeAsLabelArray } from './test-helpers.mjs';

// Eager fixture load at module scope — node:test top-level `before` does not
// reliably fire before tests nested inside `describe` blocks, so we load the
// (cached) jsdom window here. loadFoliarFixture is idempotent + memoized.
const win = loadFoliarFixture();

describe('INV-1 — Element coverage is closed (all stages × 11 elements)', () => {
  // Spec: for every stage in RECIPE_INPUTS.stageYield, computeFoliarSupply(stage)
  // returns numeric / finite / non-negative for every element in TOMATO_FRUIT_EXPORT.
  // No undefined, NaN, or negative.
  test('INV-1 — every (stage, element) returns a finite non-negative number', () => {
    const FRT = win.FoliarRecipeTomato;
    const stages = Object.keys(win.RECIPE_INPUTS.stageYield); // T1..T5
    const elements = Object.keys(win.TOMATO_FRUIT_EXPORT);    // 11 canonical
    assert.equal(elements.length, 11,
      `TOMATO_FRUIT_EXPORT must keep 11 canonical elements; got ${elements.length}`);
    for (const stage of stages) {
      const out = FRT.computeFoliarSupply(stage);
      for (const el of elements) {
        const v = out[el];
        assert.notEqual(typeof v, 'undefined',
          `stage=${stage} el=${el}: missing key`);
        assert.equal(typeof v, 'number',
          `stage=${stage} el=${el}: type=${typeof v}, value=${v}`);
        assert.ok(isFinite(v),
          `stage=${stage} el=${el}: not finite (${v})`);
        assert.ok(v >= 0,
          `stage=${stage} el=${el}: negative (${v})`);
      }
    }
  });

  test('INV-1 — macros (N/P/K/Ca/Mg) are explicit zeros at every stage', () => {
    // Spec contract + derivation "no-macro by design": foliar carries no macros.
    const FRT = win.FoliarRecipeTomato;
    const stages = Object.keys(win.RECIPE_INPUTS.stageYield);
    for (const stage of stages) {
      const out = FRT.computeFoliarSupply(stage);
      for (const macro of ['N', 'P', 'K', 'Ca', 'Mg']) {
        assert.equal(out[macro], 0,
          `stage=${stage} ${macro}: expected 0 (no foliar macro channel), got ${out[macro]}`);
      }
    }
  });
});

describe('REQ-101 — Coverage discount applied to foliar delivery', () => {
  // For pinned elements (Mn, Fe), recompute the formula
  //   delivered = recipe_g × element_pct × 1000 / area × FOLIAR_COVERAGE_DEFAULT
  // from STORED_RECIPE.tomato.foliaire and assert
  // computeFoliarSupply('T5').{Mn, Fe} matches within 1 %.
  test('REQ-101 — Mn delivery matches recipe_g × pct × 1000 / area × coverage', () => {
    const FRT = win.FoliarRecipeTomato;
    const A = win.STORED_RECIPE.tomato.foliaire.A;
    const area = win.TOMATO_NUMBER_BEDS * win.TOMATO_BED_AREA;
    const cov = FRT.FOLIAR_COVERAGE_DEFAULT;
    const mnEntry = A.find(x => (x.name || '').includes('MnSO₄'));
    const mnG = parseFloat(String(mnEntry.master).replace(',', '.'));
    const expected = (mnG * win.PRODUCT_PCT.MnSO4_Mn * 1000) / area * cov;
    const actual = FRT.computeFoliarSupply('T5').Mn;
    assert.ok(
      Math.abs(actual - expected) <= Math.max(0.01, expected * 0.01),
      `Mn: expected ${expected.toFixed(3)} mg/m²/wk, got ${actual.toFixed(3)} (g=${mnG}, pct=${win.PRODUCT_PCT.MnSO4_Mn}, cov=${cov})`
    );
  });

  test('REQ-101 — Fe delivery matches FeSO₄·7H₂O (20 % Fe) path under coverage', () => {
    const FRT = win.FoliarRecipeTomato;
    const A = win.STORED_RECIPE.tomato.foliaire.A;
    const area = win.TOMATO_NUMBER_BEDS * win.TOMATO_BED_AREA;
    const cov = FRT.FOLIAR_COVERAGE_DEFAULT;
    const feEntry = A.find(x => (x.name || '').includes('FeSO₄'));
    const feG = parseFloat(String(feEntry.master).replace(',', '.'));
    const expected = (feG * win.PRODUCT_PCT.FeSO4_Fe * 1000) / area * cov;
    const actual = FRT.computeFoliarSupply('T5').Fe;
    assert.ok(
      Math.abs(actual - expected) <= Math.max(0.01, expected * 0.01),
      `Fe: expected ${expected.toFixed(3)} mg/m²/wk, got ${actual.toFixed(3)} (g=${feG}, pct=${win.PRODUCT_PCT.FeSO4_Fe}, cov=${cov})`
    );
  });

  test('REQ-101 — FOLIAR_COVERAGE_DEFAULT is pinned at 0.30 (no-yucca regime)', () => {
    // Cert 4: pinned value from cuticle-uptake literature midpoint. Tight ±0.001
    // because the constant is a literal in data.js, not a derived quantity.
    assert.equal(win.FoliarRecipeTomato.FOLIAR_COVERAGE_DEFAULT, 0.30,
      'FOLIAR_COVERAGE_DEFAULT must stay 0.30 until yucca returns (REQ-101 + derivation.md).');
  });
});

describe('REQ-103 — window.FoliarRecipeTomato public API namespace', () => {
  test('REQ-103 — namespace exists at runtime', () => {
    assert.ok(win.FoliarRecipeTomato && typeof win.FoliarRecipeTomato === 'object',
      'window.FoliarRecipeTomato must be declared by model.js');
  });

  test('REQ-103 — exposes the four required keys with correct types', () => {
    const FRT = win.FoliarRecipeTomato;
    // Spec contract — minimum public surface.
    assert.equal(typeof FRT.AREA_M2, 'number');
    assert.equal(typeof FRT.FOLIAR_COVERAGE_DEFAULT, 'number');
    assert.equal(typeof FRT.FOLIAR_COVERAGE_WITH_YUCCA, 'number');
    assert.equal(typeof FRT.computeFoliarSupply, 'function');
  });

  test('REQ-103 — AREA_M2 reflects live TOMATO_NUMBER_BEDS × TOMATO_BED_AREA', () => {
    // The model.js exposes AREA_M2 as a getter so a future bed reconfig
    // propagates without code edits — pin that behavior.
    const expected = win.TOMATO_NUMBER_BEDS * win.TOMATO_BED_AREA;
    assert.equal(win.FoliarRecipeTomato.AREA_M2, expected);
  });

  test('REQ-103 — computeFoliarSupply("T5").Fe is a positive finite number', () => {
    const fe = win.FoliarRecipeTomato.computeFoliarSupply('T5').Fe;
    assert.equal(typeof fe, 'number');
    assert.ok(isFinite(fe), `Fe must be finite, got ${fe}`);
    assert.ok(fe > 0, `Fe must be > 0 with current STORED_RECIPE foliaire, got ${fe}`);
  });
});

describe('REQ-112 — computeFoliarSupply(stage, opts, recipe) — sprayCount + surfactant + recipe-arg', () => {
  // Defaults match prior single-arg behavior; sprayCount=2 doubles every
  // element; surfactant=true scales by FOLIAR_COVERAGE_WITH_YUCCA / DEFAULT;
  // explicit recipe arg behaves identically (recipe-agnostic property).
  const ELEMENTS = ['Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];

  test('REQ-112 — single-arg call equals { } default opts call', () => {
    const FRT = win.FoliarRecipeTomato;
    const single = FRT.computeFoliarSupply('T5');
    const noOpts = FRT.computeFoliarSupply('T5', undefined);
    for (const el of ELEMENTS) {
      assert.ok(
        Math.abs(single[el] - noOpts[el]) < 0.001,
        `${el}: single-arg=${single[el]} vs no-opt=${noOpts[el]}`
      );
    }
  });

  test('REQ-112 — sprayCount=2 doubles delivery for every element', () => {
    const FRT = win.FoliarRecipeTomato;
    const baseline = FRT.computeFoliarSupply('T5');
    const doubled  = FRT.computeFoliarSupply('T5', { sprayCount: 2 });
    for (const el of ELEMENTS) {
      if (baseline[el] <= 0) continue;
      const expected = 2 * baseline[el];
      assert.ok(
        Math.abs(doubled[el] - expected) <= Math.max(0.001, expected * 0.01),
        `${el}: expected ${expected}, got ${doubled[el]} (baseline=${baseline[el]})`
      );
    }
  });

  test('REQ-112 — sprayCount: 2 yields 2× single-spray delivery (linear scaling)', () => {
    // REQ-062 retired the foliar-singleton clause 2026-05-17; sprayCount > 1
    // is now load-bearing (previously operationally inert by REQ-062
    // construction). Pin the linear-scaling formula
    //   delivered = recipe_g × pct × 1000 / area × coverage × sprayCount
    // directly from STORED_RECIPE values for Mn (routed, single-channel
    // under pH ≥ 7 — load-bearing for lockout-regime multi-spray weeks).
    const FRT = win.FoliarRecipeTomato;
    const A = win.STORED_RECIPE.tomato.foliaire.A;
    const area = win.TOMATO_NUMBER_BEDS * win.TOMATO_BED_AREA;
    const cov = FRT.FOLIAR_COVERAGE_DEFAULT;
    const mnEntry = A.find(x => (x.name || '').includes('MnSO₄'));
    const mnG = parseFloat(String(mnEntry.master).replace(',', '.'));
    const singleSprayExpected = (mnG * win.PRODUCT_PCT.MnSO4_Mn * 1000) / area * cov;
    const twoSprayExpected = 2 * singleSprayExpected;
    const singleSpray = FRT.computeFoliarSupply('T5', { sprayCount: 1 }).Mn;
    const twoSpray    = FRT.computeFoliarSupply('T5', { sprayCount: 2 }).Mn;
    assert.ok(
      Math.abs(singleSpray - singleSprayExpected) <= Math.max(0.01, singleSprayExpected * 0.01),
      `Mn sprayCount=1: expected ${singleSprayExpected.toFixed(3)} mg/m²/wk, got ${singleSpray.toFixed(3)}`
    );
    assert.ok(
      Math.abs(twoSpray - twoSprayExpected) <= Math.max(0.01, twoSprayExpected * 0.01),
      `Mn sprayCount=2: expected ${twoSprayExpected.toFixed(3)} mg/m²/wk (2× single-spray ${singleSprayExpected.toFixed(3)}), got ${twoSpray.toFixed(3)}`
    );
    assert.ok(
      Math.abs(twoSpray - 2 * singleSpray) <= Math.max(0.001, singleSpray * 0.01),
      `Mn linear scaling broken: sprayCount=2 (${twoSpray}) should equal 2× sprayCount=1 (${2 * singleSpray})`
    );
  });

  test('REQ-112 — surfactant=true multiplies by FOLIAR_COVERAGE_WITH_YUCCA / DEFAULT', () => {
    const FRT = win.FoliarRecipeTomato;
    const ratio = FRT.FOLIAR_COVERAGE_WITH_YUCCA / FRT.FOLIAR_COVERAGE_DEFAULT;
    const baseline   = FRT.computeFoliarSupply('T5');
    const withYucca  = FRT.computeFoliarSupply('T5', { surfactant: true });
    for (const el of ELEMENTS) {
      if (baseline[el] <= 0) continue;
      const expected = baseline[el] * ratio;
      assert.ok(
        Math.abs(withYucca[el] - expected) <= Math.max(0.001, expected * 0.01),
        `${el}: expected ${expected.toFixed(3)} (×${ratio.toFixed(3)}), got ${withYucca[el].toFixed(3)}`
      );
    }
  });

  test('REQ-112 — sprayCount clamped to integer 1-3 at the model boundary', () => {
    const FRT = win.FoliarRecipeTomato;
    const baseline  = FRT.computeFoliarSupply('T5');
    const beyondMax = FRT.computeFoliarSupply('T5', { sprayCount: 5 });
    const beyondMin = FRT.computeFoliarSupply('T5', { sprayCount: 0 });
    const negative  = FRT.computeFoliarSupply('T5', { sprayCount: -2 });
    const fractional = FRT.computeFoliarSupply('T5', { sprayCount: 1.4 });
    const referenceMax = FRT.computeFoliarSupply('T5', { sprayCount: 3 });
    for (const el of ELEMENTS) {
      if (baseline[el] <= 0) continue;
      // sprayCount=5 clamped to 3
      assert.ok(
        Math.abs(beyondMax[el] - referenceMax[el]) <= Math.max(0.001, referenceMax[el] * 0.01),
        `${el}: sprayCount=5 should clamp to 3 (got ${beyondMax[el]}, expected ${referenceMax[el]})`
      );
      // sprayCount=0 / -2 clamped to 1 (== baseline)
      assert.ok(
        Math.abs(beyondMin[el] - baseline[el]) <= Math.max(0.001, baseline[el] * 0.01),
        `${el}: sprayCount=0 should clamp to 1 (got ${beyondMin[el]}, baseline ${baseline[el]})`
      );
      assert.ok(
        Math.abs(negative[el] - baseline[el]) <= Math.max(0.001, baseline[el] * 0.01),
        `${el}: sprayCount=-2 should clamp to 1 (got ${negative[el]}, baseline ${baseline[el]})`
      );
      // 1.4 rounded to 1
      assert.ok(
        Math.abs(fractional[el] - baseline[el]) <= Math.max(0.001, baseline[el] * 0.01),
        `${el}: sprayCount=1.4 should round to 1 (got ${fractional[el]}, baseline ${baseline[el]})`
      );
    }
  });

  test('REQ-112 — macros (N/P/K/Ca/Mg) remain 0 regardless of sprayCount / surfactant', () => {
    // Per spec: macros are explicit zeros; toggling levers can't materialize a
    // macro channel. Pin the invariant under both knobs together.
    const FRT = win.FoliarRecipeTomato;
    const variants = [
      FRT.computeFoliarSupply('T5'),
      FRT.computeFoliarSupply('T5', { sprayCount: 3 }),
      FRT.computeFoliarSupply('T5', { surfactant: true }),
      FRT.computeFoliarSupply('T5', { sprayCount: 3, surfactant: true }),
    ];
    for (const out of variants) {
      for (const macro of ['N', 'P', 'K', 'Ca', 'Mg']) {
        assert.equal(out[macro], 0,
          `${macro} must remain 0 under any opts combination, got ${out[macro]}`);
      }
    }
  });

  test('REQ-112 — explicit recipe arg drives the same multiplicative behavior', () => {
    const FRT = win.FoliarRecipeTomato;
    const stubRecipe = [
      { name: 'MnSO₄ (31,5 % Mn)',     master: '10 g'  },
      { name: 'ZnSO₄ (35,5 % Zn)',     master: '8 g'   },
      { name: 'Solubore (20,5 % B)',   master: '4 g'   },
      { name: 'CuSO₄ (25 % Cu)',       master: '1 g'   },
      { name: 'Molybdate (39,6 % Mo)', master: '0,5 g' },
      { name: 'FeSO₄·7H₂O (20 % Fe)',  master: '40 g'  },
    ];
    const ratio = FRT.FOLIAR_COVERAGE_WITH_YUCCA / FRT.FOLIAR_COVERAGE_DEFAULT;
    const stubBase   = FRT.computeFoliarSupply('T5', undefined,           stubRecipe);
    const stubDouble = FRT.computeFoliarSupply('T5', { sprayCount: 2 },   stubRecipe);
    const stubYucca  = FRT.computeFoliarSupply('T5', { surfactant: true }, stubRecipe);

    let anyPositive = false;
    for (const el of ELEMENTS) {
      if (stubBase[el] > 0) anyPositive = true;
    }
    assert.ok(anyPositive,
      'stub recipe arg should yield at least one positive element — third-arg path may be ignored');

    for (const el of ELEMENTS) {
      if (stubBase[el] <= 0) continue;
      const expectedDouble = 2 * stubBase[el];
      assert.ok(
        Math.abs(stubDouble[el] - expectedDouble) <= Math.max(0.001, expectedDouble * 0.01),
        `${el} (stub): sprayCount=2 should double (base=${stubBase[el]}, doubled=${stubDouble[el]})`
      );
      const expectedYucca = stubBase[el] * ratio;
      assert.ok(
        Math.abs(stubYucca[el] - expectedYucca) <= Math.max(0.001, expectedYucca * 0.01),
        `${el} (stub): surfactant=true should ×${ratio.toFixed(3)} (base=${stubBase[el]}, with=${stubYucca[el]}, expected=${expectedYucca.toFixed(3)})`
      );
    }
  });
});

describe('REQ-115 — computeFoliarRecipeForGap (min-dose clamp + burn cap + CE scale)', () => {
  test('REQ-115 — tiny gap (0.001 mg/m²/wk per element) → all doses 0 (min-dose clamp)', () => {
    const FRT = win.FoliarRecipeTomato;
    const tinyGap = { Mn: 0.001, Zn: 0.001, Cu: 0.001, Fe: 0.001, Mo: 0.001, B: 0.001 };
    const recipe = FRT.computeFoliarRecipeForGap(tinyGap);
    for (const k of Object.keys(recipe)) {
      assert.equal(recipe[k], 0,
        `${k}: expected 0 (min-dose clamp at 0.5 g), got ${recipe[k]}`);
    }
  });

  test('REQ-115 — huge gap → every element clipped at burnCapG(el)', () => {
    const FRT = win.FoliarRecipeTomato;
    // Mo dropped from iterated set 2026-05-16 (REQ-061 carve-out — Mo routes
    // via fertigation). NaMoO4_g stays in the return shape but always 0.
    const hugeGap = { Mn: 1000, Zn: 1000, Cu: 1000, Fe: 1000, B: 1000 };
    const recipe = FRT.computeFoliarRecipeForGap(hugeGap, { surfactant: false });
    const PAIRS = [
      { el: 'Mn', key: 'MnSO4_g' },
      { el: 'Zn', key: 'ZnSO4_g' },
      { el: 'Cu', key: 'CuSO4_g' },
      { el: 'Fe', key: 'FeSO4_g' },
      { el: 'B',  key: 'Solubore_g' },
    ];
    for (const p of PAIRS) {
      const cap = FRT.burnCapG(p.el);
      // After CE-scale loop the cap may be reduced to fit total CE budget,
      // so actual ≤ cap is the right invariant (matches the verifier).
      assert.ok(recipe[p.key] <= cap + 0.01,
        `${p.key}=${recipe[p.key]} exceeds burnCapG(${p.el})=${cap}`);
      // Non-zero with a 1000 mg gap: confirms the cap path actually fires
      // (otherwise the test passes vacuously).
      assert.ok(recipe[p.key] > 0,
        `${p.key}: expected > 0 with huge gap (cap path should fire), got ${recipe[p.key]}`);
    }
  });

  test('REQ-115 — predicted tank CE under REQ-025 cap (10 mS/cm), surfactant on + off', () => {
    const FRT = win.FoliarRecipeTomato;
    const hugeGap = { Mn: 1000, Zn: 1000, Cu: 1000, Fe: 1000, Mo: 1000, B: 1000 };
    for (const surfactant of [false, true]) {
      const recipe = FRT.computeFoliarRecipeForGap(hugeGap, { surfactant });
      const ce = win.predictedCE(recipeAsLabelArray(recipe), 1.0);
      assert.ok(isFinite(ce), `predictedCE returned ${ce} (surfactant=${surfactant})`);
      assert.ok(ce <= 10.0,
        `predictedCE=${ce.toFixed(2)} mS/cm exceeds REQ-025 cap of 10.0 (surfactant=${surfactant})`);
    }
  });

  test('REQ-115 — surfactant=true reduces ideal_g (coverage axis only, burn cap unchanged)', () => {
    const FRT = win.FoliarRecipeTomato;
    // Small gap so neither min-dose clamp nor burn cap binds across the
    // active iterated elements (Mn / Zn / Cu / Fe / B): surfactant should
    // shrink the recipe ~ratioYucca× because higher coverage closes the
    // gap with less product. Mo no longer iterated (REQ-061 carve-out
    // 2026-05-16 — Mo routes via fertigation).
    const midGap = { Mn: 1, Zn: 1, Cu: 0.5, Fe: 1, B: 1 };
    const noSurf = FRT.computeFoliarRecipeForGap(midGap, { surfactant: false });
    const yucca  = FRT.computeFoliarRecipeForGap(midGap, { surfactant: true });
    // For at least one element the with-surfactant dose should be strictly
    // smaller than without — otherwise the surfactant lever is ignored.
    let anyShrunk = false;
    for (const k of Object.keys(noSurf)) {
      if (noSurf[k] > 0 && yucca[k] < noSurf[k]) anyShrunk = true;
    }
    assert.ok(anyShrunk,
      `surfactant=true should reduce at least one dose; got noSurf=${JSON.stringify(noSurf)}, yucca=${JSON.stringify(yucca)}`);
  });

  test('REQ-115 — burnCapG returns BURN_CAP_BASE_G per element', () => {
    const FRT = win.FoliarRecipeTomato;
    for (const el of ['Mn', 'Zn', 'Cu', 'Fe', 'Mo', 'B']) {
      assert.equal(FRT.burnCapG(el), FRT.BURN_CAP_BASE_G[el],
        `burnCapG(${el}) must equal BURN_CAP_BASE_G[${el}]`);
    }
  });

  test('REQ-115 — BURN_CAP_BASE_G values pinned (Mn 22 / Zn 22 / Cu 2 / Fe 80 / Mo 2 / B 9)', () => {
    // Static-value regression. The other REQ-115 tests use dynamic
    // FRT.burnCapG(el) lookups so silent cap drift (e.g. Mn / Zn drifting
    // back to 18 / 16 extension mid-band, or any cap edit not paired with
    // STORED foliaire) would pass them. This test pins each cap to the
    // 2026-05-17 reconciled values — Mn / Zn raised 18 → 22 / 16 → 22 to
    // match live STORED at cert 2 (Décembre-internal observation, parallel
    // to Cu cert-2 carve-out); Cu / Fe / Mo / B at extension mid-band cert 3.
    // Any cap change must explicitly retire this pin.
    const FRT = win.FoliarRecipeTomato;
    const EXPECTED = { Mn: 22, Zn: 22, Cu: 2, Fe: 80, Mo: 2, B: 9 };
    for (const el of Object.keys(EXPECTED)) {
      assert.equal(FRT.BURN_CAP_BASE_G[el], EXPECTED[el],
        `BURN_CAP_BASE_G.${el} must be ${EXPECTED[el]} g (2026-05-17 reconciled), got ${FRT.BURN_CAP_BASE_G[el]}`);
    }
  });

  test('REQ-115 — recipe returns the six expected keys', () => {
    const FRT = win.FoliarRecipeTomato;
    const recipe = FRT.computeFoliarRecipeForGap({ Mn: 50 });
    const expectedKeys = ['MnSO4_g', 'ZnSO4_g', 'CuSO4_g', 'FeSO4_g', 'NaMoO4_g', 'Solubore_g'];
    for (const k of expectedKeys) {
      assert.ok(k in recipe, `recipe missing key ${k}`);
      assert.equal(typeof recipe[k], 'number', `recipe.${k} type=${typeof recipe[k]}`);
    }
  });

  test('REQ-115 — every non-zero dose is rounded up to nearest 0.5 g', () => {
    // Spec algorithm step 1: "round up to nearest 0.5 g". Pin the grid: every
    // returned dose × 2 is an integer (within floating-point slack).
    const FRT = win.FoliarRecipeTomato;
    const cases = [
      { gap: { Mn: 50, Zn: 50, Cu: 5, Fe: 200, Mo: 1, B: 20 }, opts: { surfactant: false } },
      { gap: { Mn: 1000, Zn: 1000, Cu: 1000, Fe: 1000, Mo: 1000, B: 1000 }, opts: { surfactant: false } },
      { gap: { Mn: 50, Zn: 50, Cu: 5, Fe: 200, Mo: 1, B: 20 }, opts: { surfactant: true } },
    ];
    for (const c of cases) {
      const recipe = FRT.computeFoliarRecipeForGap(c.gap, c.opts);
      for (const k of Object.keys(recipe)) {
        const doubled = recipe[k] * 2;
        const remainder = Math.abs(doubled - Math.round(doubled));
        assert.ok(remainder < 1e-6,
          `${k}=${recipe[k]} is not on the 0.5 g grid (${c.gap}, surfactant=${c.opts.surfactant})`);
      }
    }
  });

  test('REQ-115 — MIN_DOSE_G_PER_ELEMENT.Cu === 0.2 (narrow toxicity floor)', () => {
    // Cu's narrow toxicity threshold gets a 0.2 g floor distinct from the
    // 0.5 g default of Mn/Zn/Fe/B (Mo at 0.1 g). Pinned value assertion —
    // changing the Cu floor changes the algorithm's behavior in the
    // 0.2-0.5 g luxury-feed window.
    const FRT = win.FoliarRecipeTomato;
    assert.ok(FRT.MIN_DOSE_G_PER_ELEMENT && typeof FRT.MIN_DOSE_G_PER_ELEMENT === 'object',
      'window.FoliarRecipeTomato.MIN_DOSE_G_PER_ELEMENT must be exposed');
    assert.equal(FRT.MIN_DOSE_G_PER_ELEMENT.Cu, 0.2,
      `MIN_DOSE_G_PER_ELEMENT.Cu must be 0.2 g (narrow toxicity floor), got ${FRT.MIN_DOSE_G_PER_ELEMENT.Cu}`);
  });

  test('REQ-115 — Fe-heavy gap drop-highest preserves pH-locked micros Mn/Cu/B', () => {
    // Spec algorithm step 2: when predicted CE > target, drop the
    // highest-CE contributor (Fe under FeSO₄·7H₂O mass dominance). Mn / Cu /
    // B (pH-locked micros, REQ-061 cascade order) must remain at the doses
    // they would receive without the Fe pressure, since dropping them
    // strips the only live channel under pH ≥ 7. Parity with verifier
    // scripts/check-recipes.mjs REQ-115 block (Mn/Cu/B non-zero invariant).
    const FRT = win.FoliarRecipeTomato;
    const feHeavyGap   = { Mn: 5, Zn: 5, Cu: 0.5, Fe: 1000, B: 4 };
    const baselineGap  = { Mn: 5, Zn: 5, Cu: 0.5,           B: 4 };
    const feHeavyRecipe  = FRT.computeFoliarRecipeForGap(feHeavyGap,  { surfactant: false });
    const baselineRecipe = FRT.computeFoliarRecipeForGap(baselineGap, { surfactant: false });
    for (const key of ['MnSO4_g', 'CuSO4_g', 'Solubore_g']) {
      assert.ok(feHeavyRecipe[key] > 0,
        `${key}: pH-locked micro stripped to 0 under Fe-heavy gap (got ${feHeavyRecipe[key]}) — drop-highest must not strip Mn/Cu/B`);
      assert.equal(feHeavyRecipe[key], baselineRecipe[key],
        `${key}: Fe-heavy gap=${feHeavyRecipe[key]} differs from no-Fe baseline=${baselineRecipe[key]} — drop-highest stripped a pH-locked micro instead of Fe`);
    }
  });
});

describe('REQ-170 — Surfactant-aware foliar efficiency map', () => {
  test('REQ-170 — efficiencyFor(true) > efficiencyFor(false) strictly for every routed element', () => {
    // Spec: efficiencyFor(true) is strictly greater than efficiencyFor(false)
    // for every routed element (Mn / Zn / Cu / Fe — cuticle-uptake coverage
    // axis 0.30 → 0.80). B and Mo absent per REQ-061 (single-channel via
    // fertigation today).
    const FRT = win.FoliarRecipeTomato;
    assert.equal(typeof FRT.efficiencyFor, 'function',
      'window.FoliarRecipeTomato.efficiencyFor must be a function (REQ-170)');
    const noSurfactant   = FRT.efficiencyFor(false);
    const withSurfactant = FRT.efficiencyFor(true);
    for (const element of ['Mn', 'Zn', 'Cu', 'Fe']) {
      const off = noSurfactant[element];
      const on  = withSurfactant[element];
      assert.equal(typeof off, 'number',
        `efficiencyFor(false).${element}: expected number, got ${typeof off}`);
      assert.equal(typeof on, 'number',
        `efficiencyFor(true).${element}: expected number, got ${typeof on}`);
      assert.ok(on > off,
        `efficiencyFor(true).${element}=${on} must be strictly > efficiencyFor(false).${element}=${off}`);
    }
  });
});

describe('REQ-116 — FP foliar recipe live-derived from pre-foliar gap chain', () => {
  // Integration test: call calculateNutritionSupply twice in FP mode at T5. Bumping
  // CompostContribution.releasePerWeek.Mn closes the pre-foliar Mn gap, so
  // FP_RECIPE_T5.foliar.MnSO4 must drop (and hit the min-dose clamp == 0).
  // Restores compost release at the end so canonical state is preserved.
  test('REQ-116 — FP_RECIPE_T5.foliar.MnSO4 shrinks to 0 when compost.Mn closes the gap', () => {
    const calculateNutritionSupply = win.calculateNutritionSupply;
    const CC = win.CompostContribution;
    const fpFoliar = win.FP_RECIPE_T5 && win.FP_RECIPE_T5.foliar;
    assert.equal(typeof calculateNutritionSupply, 'function',
      'calculateNutritionSupply must be defined on window for FP-mode integration');
    assert.ok(CC && CC.releasePerWeek,
      'CompostContribution.releasePerWeek required to mutate Mn release');
    assert.ok(fpFoliar, 'FP_RECIPE_T5.foliar must exist');

    const originalMnRelease = CC.releasePerWeek.Mn;
    try {
      // Baseline: canonical state. T5, phLocked=true, transpFactor=1.0,
      // target=1.5 kg/m²/wk → match Bilan defaults.
      calculateNutritionSupply('T5', true, 1.0, 1.5, 'fp');
      const baselineMn = fpFoliar['MnSO4'];
      assert.ok(isFinite(baselineMn) && baselineMn >= 0,
        `baseline FP_RECIPE_T5.foliar.MnSO4=${baselineMn}; expected finite ≥ 0`);

      // Mutation: compost.Mn = 1 g/m²/wk = 1000 mg/m²/wk, far above any Mn
      // demand. Pre-foliar gap.Mn collapses to 0, so the gap-derived recipe
      // must drop MnSO4 to 0 (min-dose clamp).
      CC.releasePerWeek.Mn = 1.0;
      calculateNutritionSupply('T5', true, 1.0, 1.5, 'fp');
      const droppedMn = fpFoliar['MnSO4'];
      assert.ok(droppedMn < baselineMn,
        `after compost.Mn bump, expected MnSO4 < baseline ${baselineMn}, got ${droppedMn}`);
      assert.equal(droppedMn, 0,
        `after compost.Mn bump (gap=0), expected MnSO4=0 (min-dose clamp), got ${droppedMn}`);
    } finally {
      // Restore canonical compost state for any subsequent test.
      CC.releasePerWeek.Mn = originalMnRelease;
      try { calculateNutritionSupply('T5', true, 1.0, 1.5, 'fp'); } catch (_) { /* swallow */ }
    }
  });

  test('REQ-116 — FP_RECIPE_T5.foliar uses keys consumed by Block 5 / Block 7', () => {
    // Pin the shape so renames in the FP foliar branch can't silently drop
    // a key that downstream consumers (Block 5 render, Block 7 drift gauge)
    // read. Keys mirror the FP_RECIPE_T5.foliar literal in app/index.html.
    const fpFoliar = win.FP_RECIPE_T5.foliar;
    const expectedKeys = ['MnSO4', 'ZnSO4', 'CuSO4', 'Solubore', 'NaMolybdate', 'FeSO4-7H2O'];
    for (const k of expectedKeys) {
      assert.ok(k in fpFoliar, `FP_RECIPE_T5.foliar missing key ${k}`);
      assert.equal(typeof fpFoliar[k], 'number',
        `FP_RECIPE_T5.foliar.${k} type=${typeof fpFoliar[k]}`);
    }
  });
});

// =========================================================================
// Wave 2 — multi-recipe foliar strategy (added 2026-05-24 by specialist)
//
// REQs covered: REQ-195 / REQ-196 / REQ-197 / REQ-198 plus the reshaped
// halves of REQ-115 (returns { doses, sprayCount }) and REQ-103
// (namespace exposes computeFoliarStrategy).
//
// Per leader instructions for this wave:
//   - Tests target window.FoliarRecipeTomato (NOT FoliarStrategyTomato);
//     symbol rename is coder Wave 2 in lockstep.
//   - Ca recipe data.js entry + Ca slot wiring is BLOCKED on PO; the Ca
//     path is captured as test.todo with the gating reason inline.
//   - The aggregator computeFoliarStrategy is not yet in the runtime —
//     tests assert the contract and will FAIL until coder Wave 2 ships.
//     Per persona spec ("A test failing because the implementation is
//     wrong is correct"), failing red is the intended state here.
// =========================================================================

describe('REQ-103 — namespace exposes computeFoliarStrategy (Wave 2 aggregator)', () => {
  test('REQ-103 — window.FoliarRecipeTomato.computeFoliarStrategy is a function', () => {
    // Wave-2 addition: strategy aggregator joins the public surface
    // alongside computeFoliarSupply / computeFoliarRecipeForGap.
    const FRT = win.FoliarRecipeTomato;
    assert.equal(typeof FRT.computeFoliarStrategy, 'function',
      'window.FoliarRecipeTomato.computeFoliarStrategy must be exposed (REQ-103 + REQ-116)');
  });
});

describe('REQ-195 — Foliar strategy is a list of independent recipes', () => {
  // Spec: a strategy is a list of one or more foliar recipes; each recipe is
  // REQ-029-clean within its own tank; per-recipe gap allocation is static
  // in data.js. The aggregator returns a recipes array.
  test('REQ-195 — computeFoliarStrategy returns a non-empty recipes array', () => {
    const FRT = win.FoliarRecipeTomato;
    const out = FRT.computeFoliarStrategy('T5', { Mn: 5, Zn: 5, Cu: 0.5, Fe: 20, B: 4 });
    assert.ok(out && typeof out === 'object',
      `computeFoliarStrategy must return an object, got ${typeof out}`);
    assert.ok(Array.isArray(out.recipes),
      `expected out.recipes to be an array, got ${typeof out.recipes}`);
    assert.ok(out.recipes.length >= 1,
      `expected at least one recipe in strategy (oligo today), got ${out.recipes.length}`);
  });

  test('REQ-195 — oligo recipe targets exactly { Mn, Zn, Cu, Fe, B }', () => {
    // Per-recipe gap allocation is static in data.js per recipe definition;
    // oligo recipe target set is { Mn, Zn, Cu, Fe, B } (REQ-195 spec body).
    const FRT = win.FoliarRecipeTomato;
    const out = FRT.computeFoliarStrategy('T5', { Mn: 5, Zn: 5, Cu: 0.5, Fe: 20, B: 4 });
    const oligo = out.recipes.find(r => r.kind === 'oligo' || r.recipeKind === 'oligo');
    assert.ok(oligo, `expected an oligo recipe entry in out.recipes; got ${JSON.stringify(out.recipes.map(r => r.kind || r.recipeKind))}`);
    const targets = oligo.targetElements || oligo.targets;
    assert.ok(Array.isArray(targets),
      `oligo.targetElements must be an array; got ${typeof targets}`);
    const sorted = [...targets].sort();
    assert.deepEqual(sorted, ['B', 'Cu', 'Fe', 'Mn', 'Zn'],
      `oligo target elements must be { Mn, Zn, Cu, Fe, B }; got ${JSON.stringify(sorted)}`);
  });

  test('REQ-195 — each recipe entry carries its own doses + sprayCount + days', () => {
    // Per-recipe independence: per-recipe doses / sprayCount / days bound
    // to that recipe, not aggregated.
    const FRT = win.FoliarRecipeTomato;
    const out = FRT.computeFoliarStrategy('T5', { Mn: 5, Zn: 5, Cu: 0.5, Fe: 20, B: 4 });
    for (const r of out.recipes) {
      assert.ok(r.doses && typeof r.doses === 'object',
        `recipe ${r.kind || r.recipeKind}: missing doses object`);
      assert.equal(typeof r.sprayCount, 'number',
        `recipe ${r.kind || r.recipeKind}: sprayCount must be a number, got ${typeof r.sprayCount}`);
      assert.ok(Array.isArray(r.days),
        `recipe ${r.kind || r.recipeKind}: days must be an array, got ${typeof r.days}`);
    }
  });
});

describe('REQ-196 — Weekly leaf-tolerance cap per recipe', () => {
  // Spec: each recipe carries a weeklyLeafToleranceCap integer; oligo=1,
  // Ca=3. Bounds sprayCount regardless of gap size.
  test('REQ-196 — oligo recipe weeklyLeafToleranceCap === 1 (Wednesday-only cadence)', () => {
    // Per spec table: oligo cap = 1 (live STORED Wednesday-only cadence,
    // cert 3 — derivation.md § "What dropping yucca cost").
    const FRT = win.FoliarRecipeTomato;
    const out = FRT.computeFoliarStrategy('T5', { Mn: 5, Zn: 5, Cu: 0.5, Fe: 20, B: 4 });
    const oligo = out.recipes.find(r => (r.kind || r.recipeKind) === 'oligo');
    assert.ok(oligo, 'expected oligo recipe in strategy');
    assert.equal(oligo.weeklyLeafToleranceCap, 1,
      `oligo.weeklyLeafToleranceCap must be 1 (REQ-196 table); got ${oligo.weeklyLeafToleranceCap}`);
  });

  test('REQ-196 — huge gap on oligo cannot push sprayCount past the cap of 1', () => {
    // Cap binds regardless of how much gap a higher count would close;
    // under-fert accepted per REQ-115 algorithm step 3.
    const FRT = win.FoliarRecipeTomato;
    const out = FRT.computeFoliarStrategy('T5',
      { Mn: 10000, Zn: 10000, Cu: 10000, Fe: 10000, B: 10000 });
    const oligo = out.recipes.find(r => (r.kind || r.recipeKind) === 'oligo');
    assert.ok(oligo, 'expected oligo recipe in strategy');
    assert.ok(oligo.sprayCount <= 1,
      `oligo.sprayCount must be bounded by weeklyLeafToleranceCap=1 even under massive gap; got ${oligo.sprayCount}`);
  });

  test.todo('REQ-196 — Ca recipe weeklyLeafToleranceCap === 3 (Test 1 Path C anchor) — gated on Ca recipe data.js entry (PO lane)');
});

describe('REQ-197 — Model-computed optimal sprays per recipe', () => {
  // Spec: sprayCount(recipe) = min(sprays-to-close-gap, weeklyLeafToleranceCap).
  // computeFoliarRecipeForGap returns { doses, sprayCount } bundle.
  test('REQ-197 — computeFoliarRecipeForGap returns { doses, sprayCount } shape', () => {
    // Reshape of REQ-115 return signature: was flat doses object, now
    // bundle of { doses, sprayCount }.
    const FRT = win.FoliarRecipeTomato;
    const bundle = FRT.computeFoliarRecipeForGap(
      { Mn: 5, Zn: 5, Cu: 0.5, Fe: 20, B: 4 },
      { recipeKind: 'oligo' }
    );
    assert.ok(bundle && typeof bundle === 'object',
      'computeFoliarRecipeForGap must return an object');
    assert.ok(bundle.doses && typeof bundle.doses === 'object',
      `bundle.doses must be an object; got ${typeof bundle.doses}`);
    assert.equal(typeof bundle.sprayCount, 'number',
      `bundle.sprayCount must be a number; got ${typeof bundle.sprayCount}`);
    assert.ok(Number.isInteger(bundle.sprayCount),
      `bundle.sprayCount must be an integer; got ${bundle.sprayCount}`);
    assert.ok(bundle.sprayCount >= 1,
      `bundle.sprayCount must be >= 1; got ${bundle.sprayCount}`);
  });

  test('REQ-197 — sprayCount bounded by weeklyLeafToleranceCap on the recipe', () => {
    // min(sprays-to-close-gap, cap). Oligo cap=1 today → sprayCount <= 1
    // even under arbitrarily large gap.
    const FRT = win.FoliarRecipeTomato;
    const bundle = FRT.computeFoliarRecipeForGap(
      { Mn: 10000, Zn: 10000, Cu: 10000, Fe: 10000, B: 10000 },
      { recipeKind: 'oligo' }
    );
    assert.ok(bundle.sprayCount <= 1,
      `oligo sprayCount must be <= weeklyLeafToleranceCap=1; got ${bundle.sprayCount}`);
  });

  test('REQ-197 — zero gap yields sprayCount = 0 (nothing to deliver)', () => {
    // Sprays-to-close-gap = 0 when gap is already closed; min(0, cap) = 0.
    // No spray scheduled, no day assigned downstream (REQ-198).
    const FRT = win.FoliarRecipeTomato;
    const bundle = FRT.computeFoliarRecipeForGap(
      { Mn: 0, Zn: 0, Cu: 0, Fe: 0, B: 0 },
      { recipeKind: 'oligo' }
    );
    assert.equal(bundle.sprayCount, 0,
      `zero-gap oligo must yield sprayCount=0 (no spray needed); got ${bundle.sprayCount}`);
  });

  test('REQ-115 — opts.recipeKind drives recipe selection (oligo vs ca)', () => {
    // Reshape of REQ-115 opts: sprayCount removed (now model-computed),
    // recipeKind added (selects which recipe definition to size).
    const FRT = win.FoliarRecipeTomato;
    const bundle = FRT.computeFoliarRecipeForGap(
      { Mn: 5, Zn: 5, Cu: 0.5, Fe: 20, B: 4 },
      { recipeKind: 'oligo' }
    );
    // Oligo bundle.doses must carry the oligo product keys; Ca-only keys
    // (CaCl2_g) absent unless recipeKind='ca'.
    assert.ok('MnSO4_g' in bundle.doses,
      `oligo recipe doses must contain MnSO4_g; got keys ${Object.keys(bundle.doses).join(',')}`);
  });
});

describe('REQ-198 — Day assignment across farm working days', () => {
  // Spec rules:
  //   1 spray/week → [Wed]
  //   2 sprays/week → [Mon, Thu]
  //   3 sprays/week → [Mon, Wed, Fri]
  //   4-5 sprays/week → Mon-Thu / Mon-Fri (Ca cap is 3 today)
  // Day set drawn from nutrition — farm-working-days = {Mon..Fri}.

  // Helper to read a recipe's day array out of a strategy output.
  function daysForRecipe(strategy, kind) {
    const r = strategy.recipes.find(x => (x.kind || x.recipeKind) === kind);
    return r ? r.days : null;
  }

  test('REQ-198 — sprayCount=1 → days = [Wed]', () => {
    // Oligo today binds at cap=1; a real-gap call returns sprayCount=1,
    // mid-week Wednesday default per REQ-198 rule.
    const FRT = win.FoliarRecipeTomato;
    const out = FRT.computeFoliarStrategy('T5', { Mn: 5, Zn: 5, Cu: 0.5, Fe: 20, B: 4 });
    const days = daysForRecipe(out, 'oligo');
    assert.ok(Array.isArray(days), `oligo.days must be an array; got ${typeof days}`);
    if ((out.recipes.find(r => (r.kind || r.recipeKind) === 'oligo').sprayCount) === 1) {
      assert.deepEqual(days, ['Wed'],
        `1 spray/week must map to [Wed] (REQ-198 mid-week default); got ${JSON.stringify(days)}`);
    }
  });

  test('REQ-198 — sprayCount=0 → days = [] (no spray scheduled)', () => {
    // No work day assigned when nothing to spray. Verified via zero-gap.
    const FRT = win.FoliarRecipeTomato;
    const out = FRT.computeFoliarStrategy('T5', { Mn: 0, Zn: 0, Cu: 0, Fe: 0, B: 0 });
    for (const r of out.recipes) {
      if (r.sprayCount === 0) {
        assert.deepEqual(r.days, [],
          `recipe ${r.kind || r.recipeKind}: sprayCount=0 must yield days=[]; got ${JSON.stringify(r.days)}`);
      }
    }
  });

  test('REQ-198 — days are drawn from farm-working-days {Mon..Fri}', () => {
    // Every emitted day must be inside the {Mon..Fri} pool.
    const FRT = win.FoliarRecipeTomato;
    const out = FRT.computeFoliarStrategy('T5', { Mn: 5, Zn: 5, Cu: 0.5, Fe: 20, B: 4 });
    const ALLOWED = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    for (const r of out.recipes) {
      for (const day of (r.days || [])) {
        assert.ok(ALLOWED.has(day),
          `recipe ${r.kind || r.recipeKind}: day "${day}" not in farm-working-days {Mon..Fri}`);
      }
    }
  });

  test.todo('REQ-198 — sprayCount=2 → [Mon, Thu] (max-gap rule) — gated on a recipe with cap≥2 (Ca recipe lands cap=3, then a synthetic gap test can drive sprayCount=2)');
  test.todo('REQ-198 — sprayCount=3 → [Mon, Wed, Fri] — gated on Ca recipe data.js entry (PO lane)');
});

describe('REQ-101 — Per-recipe coverage axis (oligo + Ca contract shape)', () => {
  // Spec: COVERAGE is per-recipe, per-element:
  //   oligo: FOLIAR_COVERAGE_DEFAULT = 0.30, FOLIAR_COVERAGE_WITH_YUCCA = 0.80
  //   Ca:    FOLIAR_COVERAGE_CA_NO_SURFACTANT = 0.15,
  //          FOLIAR_COVERAGE_CA_WITH_SURFACTANT = 0.40
  // Ca constants are from derivation.md § "Ca-specific cuticle coverage"
  // (Test 1 Path B, cert 2).

  test('REQ-101 — oligo coverage constants pinned (0.30 / 0.80)', () => {
    // Already exercised by INV-1 + REQ-101 Mn/Fe formula tests above; this
    // pins the literal values one more time at the per-recipe axis level.
    const FRT = win.FoliarRecipeTomato;
    assert.equal(FRT.FOLIAR_COVERAGE_DEFAULT, 0.30,
      'oligo no-surfactant coverage must be 0.30 (derivation § Coverage)');
    assert.equal(FRT.FOLIAR_COVERAGE_WITH_YUCCA, 0.80,
      'oligo with-surfactant coverage must be 0.80 (derivation § Coverage)');
  });

  test('derivation — Ca coverage half-of-sulfate ratio at each surfactant state', () => {
    // derivation.md § "Ca-specific cuticle coverage" worked table:
    //   surfactant=false: oligo 0.30 → Ca 0.15 (ratio 0.50)
    //   surfactant=true:  oligo 0.80 → Ca 0.40 (ratio 0.50)
    // When Ca constants land on the namespace (coder Wave 2 ships
    // FOLIAR_COVERAGE_CA_NO_SURFACTANT / _WITH_SURFACTANT), this test pins
    // the half-of-sulfate invariant the derivation locks in. Until then,
    // it fails red — which is the correct state per persona spec.
    const FRT = win.FoliarRecipeTomato;
    const caNoSurf = FRT.FOLIAR_COVERAGE_CA_NO_SURFACTANT;
    const caYucca  = FRT.FOLIAR_COVERAGE_CA_WITH_SURFACTANT;
    assert.equal(typeof caNoSurf, 'number',
      'FOLIAR_COVERAGE_CA_NO_SURFACTANT must be exposed on the namespace (derivation § Ca-specific cuticle coverage)');
    assert.equal(typeof caYucca, 'number',
      'FOLIAR_COVERAGE_CA_WITH_SURFACTANT must be exposed on the namespace');
    assert.ok(Math.abs(caNoSurf - 0.15) < 1e-6,
      `FOLIAR_COVERAGE_CA_NO_SURFACTANT must be 0.15 (= 0.30 × 0.50); got ${caNoSurf}`);
    assert.ok(Math.abs(caYucca - 0.40) < 1e-6,
      `FOLIAR_COVERAGE_CA_WITH_SURFACTANT must be 0.40 (= 0.80 × 0.50); got ${caYucca}`);
    // The half-of-sulfate invariant itself:
    assert.ok(Math.abs(caNoSurf / FRT.FOLIAR_COVERAGE_DEFAULT - 0.50) < 1e-6,
      `Ca no-surfactant / oligo no-surfactant must equal 0.50; got ${caNoSurf / FRT.FOLIAR_COVERAGE_DEFAULT}`);
    assert.ok(Math.abs(caYucca / FRT.FOLIAR_COVERAGE_WITH_YUCCA - 0.50) < 1e-6,
      `Ca with-surfactant / oligo with-surfactant must equal 0.50; got ${caYucca / FRT.FOLIAR_COVERAGE_WITH_YUCCA}`);
  });

  test.todo('REQ-101 — computeFoliarSupply(stage, opts, recipe) Ca slot returns non-zero with Ca recipe routed — gated on Ca recipe data.js entry (PO lane)');
});

describe('derivation — worked examples (coefficient + algorithm regressions)', () => {
  // Pin the precise input → expected output assertions from derivation.md.
  // These catch coefficient drift and algorithm-step bugs the spec headers
  // alone don't pin (test-writer persona § "Also walk every worked example").

  test('derivation — T5 Mn delivered ≈ 5.43 mg/m²/wk @ recipe 22 g, 31.5 %, 0.30 cov', () => {
    // derivation.md § "Per-element delivered mg/m²/wk vs demand at T5":
    //   Mn: recipe 22 g × 31.5 % × 1000 / 382.9 m² × 0.30 = 5.43 mg/m²/wk.
    // The table prints 18.1 raw, × 0.30 = 5.43.
    const FRT = win.FoliarRecipeTomato;
    const mn = FRT.computeFoliarSupply('T5').Mn;
    assert.ok(Math.abs(mn - 5.43) <= 0.10,
      `derivation T5 Mn worked example: expected ≈ 5.43 mg/m²/wk; got ${mn.toFixed(3)}`);
  });

  test('derivation — T5 Zn delivered ≈ 6.12 mg/m²/wk @ recipe 22 g, 35.5 %, 0.30 cov', () => {
    // Zn row in same derivation table: 20.4 × 0.30 = 6.12 mg/m²/wk (the
    // over-luxury case at 136 % of demand 4.5).
    const FRT = win.FoliarRecipeTomato;
    const zn = FRT.computeFoliarSupply('T5').Zn;
    assert.ok(Math.abs(zn - 6.12) <= 0.10,
      `derivation T5 Zn worked example: expected ≈ 6.12 mg/m²/wk; got ${zn.toFixed(3)}`);
  });

  test('derivation — T5 Cu delivered ≈ 0.39 mg/m²/wk @ recipe 2 g, 25 %, 0.30 cov', () => {
    // Cu row: 1.31 raw × 0.30 = 0.39 mg/m²/wk. 26 % of demand 1.5 (the
    // narrow toxicity gap derivation accepts as structural).
    const FRT = win.FoliarRecipeTomato;
    const cu = FRT.computeFoliarSupply('T5').Cu;
    assert.ok(Math.abs(cu - 0.39) <= 0.05,
      `derivation T5 Cu worked example: expected ≈ 0.39 mg/m²/wk; got ${cu.toFixed(3)}`);
  });

  test('derivation — T5 Fe delivered ≈ 12.54 mg/m²/wk @ recipe 80 g, 20 %, 0.30 cov', () => {
    // Fe row: 41.8 raw × 0.30 = 12.54 mg/m²/wk. 84 % of demand 15.
    const FRT = win.FoliarRecipeTomato;
    const fe = FRT.computeFoliarSupply('T5').Fe;
    assert.ok(Math.abs(fe - 12.54) <= 0.20,
      `derivation T5 Fe worked example: expected ≈ 12.54 mg/m²/wk; got ${fe.toFixed(3)}`);
  });

  test('derivation — efficiencyFor(false).Mn === 0.27 (coverage 0.30 × pH 0.9)', () => {
    // derivation.md § "Channel efficiency map" worked table:
    //   surfactant=false: 0.30 × 0.9 = 0.27 uniform across Mn/Zn/Cu/Fe.
    //   surfactant=true:  0.80 × 0.9 = 0.72 uniform.
    const FRT = win.FoliarRecipeTomato;
    const eff = FRT.efficiencyFor(false);
    for (const el of ['Mn', 'Zn', 'Cu', 'Fe']) {
      assert.ok(Math.abs(eff[el] - 0.27) < 0.01,
        `efficiencyFor(false).${el} must be 0.27 (= 0.30 × 0.9); got ${eff[el]}`);
    }
  });

  test('derivation — efficiencyFor(true).Mn === 0.72 (coverage 0.80 × pH 0.9)', () => {
    const FRT = win.FoliarRecipeTomato;
    const eff = FRT.efficiencyFor(true);
    for (const el of ['Mn', 'Zn', 'Cu', 'Fe']) {
      assert.ok(Math.abs(eff[el] - 0.72) < 0.01,
        `efficiencyFor(true).${el} must be 0.72 (= 0.80 × 0.9); got ${eff[el]}`);
    }
  });

  test('derivation — Cu luxury-cap guard: Cu gap 0.039 mg/m²/wk → CuSO4_g = 0', () => {
    // derivation.md § "Per-element min-dose floor" worked table, row 2:
    //   Cu gap 0.039 → ideal_g 0.20 → rounds to 0.5 g → delivered 0.098
    //   (2.5× → guard fires → 0). Other elements zero so no cross-recipe
    //   contamination.
    const FRT = win.FoliarRecipeTomato;
    const bundle = FRT.computeFoliarRecipeForGap(
      { Cu: 0.039, Mn: 0, Zn: 0, Fe: 0, B: 0 },
      { recipeKind: 'oligo' }
    );
    const cuG = (bundle.doses ? bundle.doses.CuSO4_g : bundle.CuSO4_g);
    assert.equal(cuG, 0,
      `Cu luxury-cap guard (derivation worked-example row 2): Cu gap 0.039 → CuSO4_g must be 0 (2.5× over-luxury fires); got ${cuG}`);
  });

  test('derivation — Cu luxury-cap guard: Cu gap 0.30 mg/m²/wk → CuSO4_g = 2.0 (cap exact)', () => {
    // derivation.md table row 5: Cu gap 0.30 → ideal_g 1.53 → rounded 2.0 g
    // → delivered 0.392 / 0.30 = 1.30× (at cap, guard does NOT fire).
    const FRT = win.FoliarRecipeTomato;
    const bundle = FRT.computeFoliarRecipeForGap(
      { Cu: 0.30, Mn: 0, Zn: 0, Fe: 0, B: 0 },
      { recipeKind: 'oligo' }
    );
    const cuG = (bundle.doses ? bundle.doses.CuSO4_g : bundle.CuSO4_g);
    assert.equal(cuG, 2.0,
      `Cu luxury-cap guard (derivation worked-example row 5): Cu gap 0.30 → CuSO4_g must be 2.0 g (at 1.30× cap exactly); got ${cuG}`);
  });
});
