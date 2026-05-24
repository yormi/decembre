// Foliar-recipe spec tests — pins the normative claims in
// nutrition/tomato/foliar-recipe/spec.md against the live model.
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
