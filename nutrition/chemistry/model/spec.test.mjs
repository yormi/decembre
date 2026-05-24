// Chemistry model — pH-response + effectiveEfficiency spec tests.
//
// Pins REQ-194: when computing effectiveEfficiency for any foliar-channel
// product, the result MUST be multiplied by foliarPhResponse(sprayPh) on
// top of leaf-surface field modifiers (yucca, window timing). Soil pH is
// passed through but is irrelevant for foliar products.
//
// Strategy: pick foliar-channel products from PRODUCT (MnSO4, ZnSO4,
// CuSO4), call effectiveEfficiency(name, element, soilPh, sprayPh) at
// two different sprayPh values, assert the ratio of returned efficiencies
// equals the ratio of foliarPhResponse(sprayPh) values. If the foliar
// branch correctly multiplies by foliarPhResponse(sprayPh) and applies a
// sprayPh-independent coverage factor, the ratio test isolates the
// foliar-pH dependence regardless of the coverage constant.
//
// Soil-pH-irrelevance is asserted independently: same sprayPh, two very
// different soilPh values → identical efficiency for a foliar product.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { loadFixture } from '../../tomato/test-helpers.mjs';

const fixture = await loadFixture();
if (!fixture.loaded) {
  throw new Error(`fixture failed to load: ${fixture.error || '__TEST_GLOBALS__ never populated'}`);
}
const chemistry = fixture.window.NutritionPhResponse;
if (!chemistry || typeof chemistry.effectiveEfficiency !== 'function'
    || typeof chemistry.foliarPhResponse !== 'function') {
  throw new Error('window.NutritionPhResponse.{effectiveEfficiency, foliarPhResponse} not available');
}
const { effectiveEfficiency, foliarPhResponse } = chemistry;
const PRODUCT = fixture.globals.PRODUCT;

// Picked from PRODUCT — all have ch:'foliar' and a single base element.
const FOLIAR_CASES = [
  { product: 'MnSO4', element: 'Mn' },
  { product: 'ZnSO4', element: 'Zn' },
  { product: 'CuSO4', element: 'Cu' },
];

const SOIL_PH = 7.4;                                   // current Décembre soil pH
const SPRAY_PH_A = 5.5;                                // foliarPhResponse = 1.0 (window peak)
const SPRAY_PH_B = 7.5;                                // foliarPhResponse = 0.70 (high-pH penalty)

test('REQ-194 — effectiveEfficiency for foliar products multiplies by foliarPhResponse(sprayPh)', () => {
  assert.ok(PRODUCT, 'PRODUCT not exposed on window');

  // Sanity-check the curve gives distinct values at the two pH anchors —
  // otherwise the ratio test is degenerate.
  const curveA = foliarPhResponse(SPRAY_PH_A);
  const curveB = foliarPhResponse(SPRAY_PH_B);
  assert.ok(Math.abs(curveA - curveB) > 0.1,
    `foliarPhResponse must differ at sprayPh ${SPRAY_PH_A} vs ${SPRAY_PH_B} for ratio test to be load-bearing (got ${curveA}, ${curveB})`);
  const expectedRatio = curveB / curveA;

  for (const { product, element } of FOLIAR_CASES) {
    assert.equal(PRODUCT[product]?.ch, 'foliar',
      `${product} must be a foliar-channel product for this test`);

    const effA = effectiveEfficiency(product, element, SOIL_PH, SPRAY_PH_A);
    const effB = effectiveEfficiency(product, element, SOIL_PH, SPRAY_PH_B);
    assert.ok(effA > 0, `${product}: effectiveEfficiency at sprayPh ${SPRAY_PH_A} must be > 0`);
    assert.ok(effB > 0, `${product}: effectiveEfficiency at sprayPh ${SPRAY_PH_B} must be > 0`);

    const observedRatio = effB / effA;
    assert.ok(Math.abs(observedRatio - expectedRatio) < 0.01,
      `${product}: effectiveEfficiency ratio sprayPh ${SPRAY_PH_B}/${SPRAY_PH_A} = ${observedRatio.toFixed(4)}, expected foliarPhResponse ratio ${expectedRatio.toFixed(4)} (REQ-194)`);
  }
});

test('REQ-194 — soil pH is ignored for foliar-channel effective efficiency', () => {
  // Foliar products bypass the rhizosphere; soil pH must not change the
  // returned efficiency at a fixed sprayPh.
  for (const { product, element } of FOLIAR_CASES) {
    const effLowSoil = effectiveEfficiency(product, element, 5.5, SPRAY_PH_A);
    const effHighSoil = effectiveEfficiency(product, element, 7.8, SPRAY_PH_A);
    assert.ok(Math.abs(effLowSoil - effHighSoil) < 1e-9,
      `${product}: soil pH affected foliar efficiency (low-soil ${effLowSoil}, high-soil ${effHighSoil}) — REQ-194 requires foliar bypass`);
  }
});
