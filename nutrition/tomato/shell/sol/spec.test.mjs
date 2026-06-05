// Tests for the Fertilisation/sol tomato page — Tiger 90CR sulphur dose
// recommendation driven by the weekly pH reading.
//
// Rules (Guillaume 2026-06-04):
//   - base 1 kg/planche/semaine (1000 g).
//   - réduire à 0,5 kg (500 g) dès que pH < 6,8 OU le pH descend de plus que
//     0,2 en 1 semaine.
//   - arrêter (0) si pH ≤ 6,6 OU le pH descend de 0,4 ou plus en 1 semaine.
// Stop wins over reduce.
//
// Button bands → rule mapping (each band read at its nominal label value):
//   pH    : '6.6-' (≤6,6) · '6.7' · '6.8+' (≥6,8)
//   Δ-drop: '0.2-' (≤0,2) · '0.3' · '0.4+' (≥0,4)
// Bands that behaved identically were merged (6,8/6,9/7,0+ → 6.8+;
// 0,4/0,5+ → 0.4+).
//
// The pure decision fn is exposed at window.SulphurDoseTomato.recommendSulphurDose
// (window-namespace pattern, like FoliarRecipeTomato). DOM tests pin the render
// wiring (button click → Tiger tile text).

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadTomatoApp } from '../test-helpers.mjs';

const PH_BANDS = ['6.6-', '6.7', '6.8+'];
const DELTA_BANDS = ['0.2-', '0.3', '0.4+'];

// Expected grams per (pH, Δ). 0 = arrêter, 500 = réduire, 1000 = base.
const EXPECTED = {
  '6.6-': { '0.2-': 0,    '0.3': 0,   '0.4+': 0 },
  '6.7':  { '0.2-': 500,  '0.3': 500, '0.4+': 0 },
  '6.8+': { '0.2-': 1000, '0.3': 500, '0.4+': 0 },
};

describe('Tiger sulphur dose — recommendSulphurDose decision table', () => {
  test('window.SulphurDoseTomato.recommendSulphurDose is exposed', () => {
    const { window } = loadTomatoApp();
    assert.ok(window.SulphurDoseTomato, 'window.SulphurDoseTomato namespace missing');
    assert.equal(typeof window.SulphurDoseTomato.recommendSulphurDose, 'function',
      'recommendSulphurDose must be a function');
  });

  test('every (pH, Δ) band pair returns the rule-mandated grams', () => {
    const { window } = loadTomatoApp();
    const recommend = window.SulphurDoseTomato.recommendSulphurDose;
    for (const ph of PH_BANDS) {
      for (const delta of DELTA_BANDS) {
        const result = recommend(ph, delta);
        assert.ok(result, `no result for (${ph}, ${delta})`);
        assert.equal(result.grams, EXPECTED[ph][delta],
          `dose for pH=${ph}, Δ=${delta} should be ${EXPECTED[ph][delta]} g (got ${result.grams})`);
      }
    }
  });

  test('reduce trigger: pH 6,7 (< 6,8) drops base 1000 → 500 even with small Δ', () => {
    const { window } = loadTomatoApp();
    const recommend = window.SulphurDoseTomato.recommendSulphurDose;
    assert.equal(recommend('6.7', '0.2-').grams, 500,
      'pH < 6,8 must reduce to 500 g regardless of a small weekly change');
  });

  test('reduce trigger: weekly drop 0,3 (> 0,2) reduces to 500 at high pH', () => {
    const { window } = loadTomatoApp();
    const recommend = window.SulphurDoseTomato.recommendSulphurDose;
    assert.equal(recommend('6.8+', '0.3').grams, 500,
      'a >0,2 weekly drop must reduce to 500 g even at high pH');
  });

  test('stop trigger: pH ≤ 6,6 stops (0 g) for every Δ band', () => {
    const { window } = loadTomatoApp();
    const recommend = window.SulphurDoseTomato.recommendSulphurDose;
    for (const delta of DELTA_BANDS) {
      const result = recommend('6.6-', delta);
      assert.equal(result.grams, 0, `pH ≤ 6,6 must stop (Δ=${delta})`);
      assert.equal(result.word, 'Arrêt', 'stop result carries word "Arrêt"');
    }
  });

  test('stop trigger: weekly drop ≥ 0,4 stops (0 g) even at high pH', () => {
    const { window } = loadTomatoApp();
    const recommend = window.SulphurDoseTomato.recommendSulphurDose;
    assert.equal(recommend('6.8+', '0.4+').grams, 0, 'drop ≥ 0,4 must stop');
  });

  test('stop wins over reduce: pH 6,7 with drop ≥ 0,4 stops (not reduce)', () => {
    const { window } = loadTomatoApp();
    const recommend = window.SulphurDoseTomato.recommendSulphurDose;
    assert.equal(recommend('6.7', '0.4+').grams, 0,
      'a stop condition must override the reduce condition');
  });

  test('base dose: high pH (≥ 6,8) with slow change (≤ 0,2) is 1000 g', () => {
    const { window } = loadTomatoApp();
    const recommend = window.SulphurDoseTomato.recommendSulphurDose;
    assert.equal(recommend('6.8+', '0.2-').grams, 1000,
      'base 1000 g expected at pH ≥ 6,8, Δ ≤ 0,2');
  });

  test('returns null until both pH and Δ are chosen', () => {
    const { window } = loadTomatoApp();
    const recommend = window.SulphurDoseTomato.recommendSulphurDose;
    assert.equal(recommend(null, null), null);
    assert.equal(recommend('6.8+', null), null);
    assert.equal(recommend(null, '0.2-'), null);
  });
});

// ─── Render wiring: pH buttons drive the Tiger tile ──────────

describe('pH buttons drive the Tiger dose tile', () => {
  function clickBand(window, containerId, value) {
    const button = window.document.querySelector(
      `#${containerId} button[data-value="${value}"]`);
    assert.ok(button, `band button ${value} not found in #${containerId}`);
    button.dispatchEvent(new window.Event('click', { bubbles: true }));
  }

  test('selecting pH 6,8+ and Δ 0,2- renders Tiger 1 000 g', () => {
    const { window } = loadTomatoApp();
    clickBand(window, 'sol-ph-week-buttons', '6.8+');
    clickBand(window, 'sol-ph-delta-buttons', '0.2-');
    const doses = (window.document.getElementById('sol-tomato-doses').textContent || '');
    assert.match(doses, /Tiger/, 'Tiger tile must be present');
    // 1000 → fr-CA "1 000" (narrow/nbsp space). Match the digits loosely.
    assert.match(doses.replace(/\s/g, ''), /1000g/,
      `expected 1 000 g in Tiger tile, got: ${doses}`);
  });

  test('selecting pH 6,6- (dose 0) hides the Tiger tile', () => {
    const { window } = loadTomatoApp();
    clickBand(window, 'sol-ph-week-buttons', '6.6-');
    clickBand(window, 'sol-ph-delta-buttons', '0.2-');
    const doses = (window.document.getElementById('sol-tomato-doses').textContent || '');
    assert.doesNotMatch(doses, /Tiger/, 'Tiger tile must be hidden when dose is 0');
  });
});
