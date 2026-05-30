// Tests for nutrition/tomato/fertigation-recipe/builder/user-stories.md +
// nutrition/spec.md cross-cutting slugs:
//   predicted-ph-ce-shown-on-builder-blocks
//   predicted-ph-ce-clickable-modal
//   predicted-ph-ce-coloured-by-band-position
//
// This file pins the fertigation builder's instance of those cross-cutting
// claims. Target DOM container: #nutr-fert (rendered by
// nutrition/tomato/shell/logic.js into the Tomato Nutrition admin page).
//
// Safe-band data sources used here:
//   - CE (irrigation at dripper, tomato T3-T5): 2.0 – 3.0 mS/cm
//     nutrition/chemistry/spec.md § predicted-ce-within-crop-stage-band
//   - pH (irrigation at dripper compartment):  5.5 – 7.0
//     nutrition/chemistry/spec.md § predicted-tank-ph-within-envelope
//
// Framework: node:test. Reuses the assembled-page jsdom fixture from
// nutrition/tomato/shell/test-helpers.mjs.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadTomatoApp } from '../../shell/test-helpers.mjs';

// ─── predicted-ph-ce-shown-on-builder-blocks ───────────────────────────

describe('predicted-ph-ce-shown-on-builder-blocks — fertigation builder', () => {
  test('predicted-ph-ce-shown-on-builder-blocks — #nutr-fert contains a predicted pH node', () => {
    // Spec: "Predicted tank pH and predicted CE appear next to the inputs of
    // every dose-or-product editing block on every nutrition builder page."
    // Fertigation builder block = #nutr-fert. The predicted pH node carries a
    // stable hook so tests + listeners can locate it independent of layout
    // tweaks.
    const { window } = loadTomatoApp();
    const block = window.document.getElementById('nutr-fert');
    assert.ok(block, '#nutr-fert (fertigation builder block) must exist');
    const phNode = block.querySelector('[data-predicted="ph"]');
    assert.ok(phNode,
      '#nutr-fert must contain an element with [data-predicted="ph"] showing predicted tank pH');
  });

  test('predicted-ph-ce-shown-on-builder-blocks — #nutr-fert contains a predicted CE node', () => {
    const { window } = loadTomatoApp();
    const block = window.document.getElementById('nutr-fert');
    assert.ok(block, '#nutr-fert must exist');
    const ceNode = block.querySelector('[data-predicted="ce"]');
    assert.ok(ceNode,
      '#nutr-fert must contain an element with [data-predicted="ce"] showing predicted tank CE');
  });

  test('predicted-ph-ce-shown-on-builder-blocks — predicted pH node renders a numeric value', () => {
    // Tank pH for fertigation at dripper sits inside the irrigation-at-dripper
    // envelope (predicted-tank-ph-within-envelope, 5.5–7.0). Cap at agronomic plausibility 3.0–9.0 so
    // the test catches a node that renders an empty string, "—", or a label.
    const { window } = loadTomatoApp();
    const phNode = window.document.querySelector('#nutr-fert [data-predicted="ph"]');
    assert.ok(phNode, 'predicted pH node must exist');
    const text = (phNode.textContent || '').trim();
    const match = text.match(/(\d+(?:[.,]\d+)?)/);
    assert.ok(match,
      `predicted pH node must render a number; got textContent="${text}"`);
    const value = parseFloat(match[1].replace(',', '.'));
    assert.ok(value >= 3.0 && value <= 9.0,
      `predicted pH must be agronomically plausible (3.0–9.0); got ${value}`);
  });

  test('predicted-ph-ce-shown-on-builder-blocks — predicted CE node renders a numeric value', () => {
    // Predicted CE at the dripper for tomato fertigation sits in the
    // predicted-ce-within-crop-stage-band (1.5–3.0 across all stages). Bound at 0.1–8.0 to catch a
    // node rendering empty or non-numeric content.
    const { window } = loadTomatoApp();
    const ceNode = window.document.querySelector('#nutr-fert [data-predicted="ce"]');
    assert.ok(ceNode, 'predicted CE node must exist');
    const text = (ceNode.textContent || '').trim();
    const match = text.match(/(\d+(?:[.,]\d+)?)/);
    assert.ok(match,
      `predicted CE node must render a number; got textContent="${text}"`);
    const value = parseFloat(match[1].replace(',', '.'));
    assert.ok(value >= 0.1 && value <= 8.0,
      `predicted CE must be agronomically plausible (0.1–8.0 mS/cm); got ${value}`);
  });
});

// ─── predicted-ph-ce-clickable-modal ───────────────────────────────────

describe('predicted-ph-ce-clickable-modal — fertigation builder', () => {
  test('predicted-ph-ce-clickable-modal — clicking predicted pH opens a modal', () => {
    // Spec: "Clicking a displayed predicted pH or CE number opens a modal.
    // The modal declares the measurement point the prediction targets (water
    // at the dripper, soil root zone, or lab sample), how the blue lab pen
    // maps to that point, and the safe band for the current crop and stage."
    // Measurement point for fertigation builder = water at the dripper.
    const { window } = loadTomatoApp();
    const phNode = window.document.querySelector('#nutr-fert [data-predicted="ph"]');
    assert.ok(phNode, 'predicted pH node must exist');
    phNode.dispatchEvent(new window.Event('click', { bubbles: true }));
    const modal = window.document.querySelector('[data-modal="predicted-ph"]');
    assert.ok(modal,
      'clicking the predicted pH must open a modal with [data-modal="predicted-ph"]');
    const visible = modal.offsetParent !== null
      || (modal.style && modal.style.display !== 'none');
    assert.ok(visible || modal.hasAttribute('open'),
      'predicted-pH modal must be visible after click');
  });

  test('predicted-ph-ce-clickable-modal — pH modal names the measurement point (dripper)', () => {
    // Fertigation predicts the irrigation-at-dripper compartment per predicted-tank-ph-within-envelope.
    // The modal text must surface the measurement point so the operator
    // knows where to point the blue lab pen for comparison.
    const { window } = loadTomatoApp();
    const phNode = window.document.querySelector('#nutr-fert [data-predicted="ph"]');
    assert.ok(phNode, 'predicted pH node must exist');
    phNode.dispatchEvent(new window.Event('click', { bubbles: true }));
    const modal = window.document.querySelector('[data-modal="predicted-ph"]');
    assert.ok(modal, 'predicted-pH modal must exist after click');
    const text = (modal.textContent || '').toLowerCase();
    assert.ok(text.includes('goutteur') || text.includes('dripper'),
      `pH modal must name the measurement point (water at the dripper / goutteur); got "${text.slice(0, 200)}"`);
  });

  test('predicted-ph-ce-clickable-modal — pH modal declares the safe band', () => {
    // Spec: "the safe band for the current crop and stage". For fertigation
    // at the dripper, predicted-tank-ph-within-envelope pins 5.5 – 7.0. The numerical bounds must be
    // surfaced in the modal copy.
    const { window } = loadTomatoApp();
    const phNode = window.document.querySelector('#nutr-fert [data-predicted="ph"]');
    assert.ok(phNode, 'predicted pH node must exist');
    phNode.dispatchEvent(new window.Event('click', { bubbles: true }));
    const modal = window.document.querySelector('[data-modal="predicted-ph"]');
    assert.ok(modal, 'predicted-pH modal must exist after click');
    const text = modal.textContent || '';
    assert.ok(/5[.,]5/.test(text),
      `pH modal must declare the safe band lower bound (5.5); got "${text.slice(0, 200)}"`);
    assert.ok(/7[.,]0|7(?!\d)/.test(text),
      `pH modal must declare the safe band upper bound (7.0); got "${text.slice(0, 200)}"`);
  });

  test('predicted-ph-ce-clickable-modal — clicking predicted CE opens a modal', () => {
    const { window } = loadTomatoApp();
    const ceNode = window.document.querySelector('#nutr-fert [data-predicted="ce"]');
    assert.ok(ceNode, 'predicted CE node must exist');
    ceNode.dispatchEvent(new window.Event('click', { bubbles: true }));
    const modal = window.document.querySelector('[data-modal="predicted-ce"]');
    assert.ok(modal,
      'clicking predicted CE must open a modal with [data-modal="predicted-ce"]');
  });

  test('predicted-ph-ce-clickable-modal — CE modal names the measurement point (dripper)', () => {
    const { window } = loadTomatoApp();
    const ceNode = window.document.querySelector('#nutr-fert [data-predicted="ce"]');
    assert.ok(ceNode, 'predicted CE node must exist');
    ceNode.dispatchEvent(new window.Event('click', { bubbles: true }));
    const modal = window.document.querySelector('[data-modal="predicted-ce"]');
    assert.ok(modal, 'predicted-CE modal must exist after click');
    const text = (modal.textContent || '').toLowerCase();
    assert.ok(text.includes('goutteur') || text.includes('dripper'),
      `CE modal must name the measurement point; got "${text.slice(0, 200)}"`);
  });

  test('predicted-ph-ce-clickable-modal — CE modal declares the safe band for current stage', () => {
    // predicted-ce-within-crop-stage-band irrigation-at-dripper bands: T1-T2 1.5–2.5, T3-T5 2.0–3.0.
    // Default page stage may be either tomato segment; assert that one of
    // the two valid band pairs appears verbatim in the modal.
    const { window } = loadTomatoApp();
    const ceNode = window.document.querySelector('#nutr-fert [data-predicted="ce"]');
    assert.ok(ceNode, 'predicted CE node must exist');
    ceNode.dispatchEvent(new window.Event('click', { bubbles: true }));
    const modal = window.document.querySelector('[data-modal="predicted-ce"]');
    assert.ok(modal, 'predicted-CE modal must exist after click');
    const text = modal.textContent || '';
    const earlyBand = /1[.,]5/.test(text) && /2[.,]5/.test(text);
    const lateBand = /2[.,]0/.test(text) && /3[.,]0/.test(text);
    assert.ok(earlyBand || lateBand,
      `CE modal must declare the safe band — early (1.5–2.5) or late (2.0–3.0); got "${text.slice(0, 200)}"`);
  });

  test('predicted-ph-ce-clickable-modal — modal mentions the blue lab pen mapping', () => {
    // Spec: "how the blue lab pen maps to that point". The blue Bluelab pen
    // is what the operator carries — the mapping copy must surface so they
    // know what they're comparing the predicted number against.
    const { window } = loadTomatoApp();
    const ceNode = window.document.querySelector('#nutr-fert [data-predicted="ce"]');
    assert.ok(ceNode, 'predicted CE node must exist');
    ceNode.dispatchEvent(new window.Event('click', { bubbles: true }));
    const modal = window.document.querySelector('[data-modal="predicted-ce"]');
    assert.ok(modal, 'predicted-CE modal must exist after click');
    const text = (modal.textContent || '').toLowerCase();
    assert.ok(text.includes('bluelab') || text.includes('stylo') || text.includes('pen') || text.includes('bleu'),
      `CE modal must mention the blue lab pen mapping; got "${text.slice(0, 200)}"`);
  });
});

// ─── predicted-ph-ce-coloured-by-band-position ─────────────────────────

describe('predicted-ph-ce-coloured-by-band-position — fertigation builder', () => {
  test('predicted-ph-ce-coloured-by-band-position — predicted pH node carries a band-position class or attribute', () => {
    // Spec: "Each displayed predicted pH or CE number is rendered green when
    // inside the safe band, red when outside, and yellow when its distance
    // to the nearest band edge is at most 10 % of the band width."
    // The renderer must encode the position so CSS / tests can read it.
    // Accept any of: data-band-position="inside|edge|outside", or a class
    // matching /band-(inside|edge|outside|green|yellow|red)/.
    const { window } = loadTomatoApp();
    const phNode = window.document.querySelector('#nutr-fert [data-predicted="ph"]');
    assert.ok(phNode, 'predicted pH node must exist');
    const position = phNode.getAttribute('data-band-position');
    const classMatch = /band-(inside|edge|outside|green|yellow|red)/.test(phNode.className || '');
    assert.ok(['inside', 'edge', 'outside'].includes(position) || classMatch,
      `predicted pH node must declare band position via data-band-position or class; `
      + `got data-band-position="${position}" class="${phNode.className}"`);
  });

  test('predicted-ph-ce-coloured-by-band-position — predicted CE node carries a band-position class or attribute', () => {
    const { window } = loadTomatoApp();
    const ceNode = window.document.querySelector('#nutr-fert [data-predicted="ce"]');
    assert.ok(ceNode, 'predicted CE node must exist');
    const position = ceNode.getAttribute('data-band-position');
    const classMatch = /band-(inside|edge|outside|green|yellow|red)/.test(ceNode.className || '');
    assert.ok(['inside', 'edge', 'outside'].includes(position) || classMatch,
      `predicted CE node must declare band position via data-band-position or class; `
      + `got data-band-position="${position}" class="${ceNode.className}"`);
  });

  test('predicted-ph-ce-coloured-by-band-position — band position is consistent with the rendered value (CE)', () => {
    // Cross-check that the position attribute reflects the rendered number
    // against the predicted-ce-within-crop-stage-band dripper band. T3-T5 band 2.0–3.0; width 1.0;
    // 10% edge zone = [2.0, 2.1] ∪ [2.9, 3.0]. T1-T2 band 1.5–2.5; width 1.0;
    // 10% edge zone = [1.5, 1.6] ∪ [2.4, 2.5].
    const { window } = loadTomatoApp();
    const ceNode = window.document.querySelector('#nutr-fert [data-predicted="ce"]');
    assert.ok(ceNode, 'predicted CE node must exist');
    const match = (ceNode.textContent || '').match(/(\d+(?:[.,]\d+)?)/);
    assert.ok(match, 'predicted CE node must render a number to validate band position');
    const value = parseFloat(match[1].replace(',', '.'));
    const position = ceNode.getAttribute('data-band-position')
      || (/band-inside|band-green/.test(ceNode.className) ? 'inside'
          : /band-edge|band-yellow/.test(ceNode.className) ? 'edge'
          : /band-outside|band-red/.test(ceNode.className) ? 'outside' : null);
    assert.ok(position, 'predicted CE node must expose a band position');

    // Compute expected position against both possible stage bands; the page's
    // current stage is one of them. Test passes if the rendered position
    // matches the value against at least one valid stage band.
    function classify(value, low, high) {
      const width = high - low;
      const edge = width * 0.10;
      if (value < low || value > high) return 'outside';
      if (value - low <= edge || high - value <= edge) return 'edge';
      return 'inside';
    }
    const validForEarly = classify(value, 1.5, 2.5);
    const validForLate = classify(value, 2.0, 3.0);
    assert.ok(position === validForEarly || position === validForLate,
      `CE band position "${position}" inconsistent with value ${value} on either tomato stage band `
      + `(early[1.5,2.5] → ${validForEarly}, late[2.0,3.0] → ${validForLate})`);
  });
});
