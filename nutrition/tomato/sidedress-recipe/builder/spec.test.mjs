// Tests for nutrition/tomato/sidedress-recipe/builder.
//
// SLUG coverage (3, from nutrition/spec.md):
//   predicted-ph-ce-shown-on-builder-blocks
//     — Predicted tank pH + CE appear next to the inputs of every
//       dose-or-product editing block on every nutrition builder page.
//       Applied here to the sidedress builder block (#nutr-sidedress).
//   predicted-ph-ce-clickable-modal
//     — Clicking a predicted pH/CE number opens a modal declaring the
//       measurement point (sidedress targets SOIL ROOT ZONE), the blue
//       lab-pen → measurement-point mapping, and the safe band.
//   predicted-ph-ce-coloured-by-band-position
//     — Green inside the safe band, red outside, yellow within 10 % of
//       the band width to the nearest edge.
//
// Safe-band data (nutrition/chemistry/spec.md):
//   - CE (substrate / root zone, all tomato stages): 1.5 – 3.5 mS/cm — REQ-024.
//   - pH (soil root zone): NO band declared in REQ-053. The compartment list
//     covers foliar tank, fertigation stock, irrigation at dripper, nursery —
//     soil root zone is absent. All pH-modal + pH-colour assertions on the
//     sidedress block are therefore `test.todo` until the chemistry spec
//     declares a soil-root-zone pH envelope.
//
// Framework: node:test. Reuses the assembled-page jsdom fixture from
// nutrition/tomato/shell/test-helpers.mjs.
//
// Sidedress builder block has no current predicted-pH/CE display surface
// (greps show #nutr-sidedress is rendered by shell/logic.js without a
// predicted strip). All DOM assertions below will fail until Wave 2's coder
// implements the rendering — that's the intended red state per test-writer
// discipline.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadTomatoApp } from '../../shell/test-helpers.mjs';

// Safe-band constants from nutrition/chemistry/spec.md REQ-024 (substrate /
// root zone row). Tomato T1-T5 share the same substrate band 1.5 – 3.5.
const CE_BAND_SOIL_ROOT_ZONE = { min: 1.5, max: 3.5 };
const CE_BAND_WIDTH = CE_BAND_SOIL_ROOT_ZONE.max - CE_BAND_SOIL_ROOT_ZONE.min;
const CE_YELLOW_MARGIN = CE_BAND_WIDTH * 0.10;

// Inside #nutr-sidedress, predicted strips follow the foliar-strategy operator
// convention: data-predicted-ce / data-predicted-ph attributes on the display
// nodes (see foliar-strategy/operator/logic.js lines 156-157).
function findPredictedCe(window) {
  const block = window.document.getElementById('nutr-sidedress');
  if (!block) return null;
  return block.querySelector('[data-predicted-ce]');
}
function findPredictedPh(window) {
  const block = window.document.getElementById('nutr-sidedress');
  if (!block) return null;
  return block.querySelector('[data-predicted-ph]');
}

// ─── predicted-ph-ce-shown-on-builder-blocks ────────────────────────────

describe('predicted-ph-ce-shown-on-builder-blocks — sidedress block exposes predicted pH + CE', () => {
  test('predicted-ph-ce-shown-on-builder-blocks — #nutr-sidedress contains a [data-predicted-ce] node', () => {
    const { window } = loadTomatoApp();
    const block = window.document.getElementById('nutr-sidedress');
    assert.ok(block, '#nutr-sidedress (sidedress builder block) must exist');
    const ce = findPredictedCe(window);
    assert.ok(ce,
      'sidedress builder block must render a predicted CE element ([data-predicted-ce]) — '
      + 'per predicted-ph-ce-shown-on-builder-blocks');
  });

  test('predicted-ph-ce-shown-on-builder-blocks — #nutr-sidedress contains a [data-predicted-ph] node', () => {
    const { window } = loadTomatoApp();
    const block = window.document.getElementById('nutr-sidedress');
    assert.ok(block, '#nutr-sidedress (sidedress builder block) must exist');
    const ph = findPredictedPh(window);
    assert.ok(ph,
      'sidedress builder block must render a predicted pH element ([data-predicted-ph]) — '
      + 'per predicted-ph-ce-shown-on-builder-blocks');
  });

  test('predicted-ph-ce-shown-on-builder-blocks — predicted CE renders a numeric value with mS/cm unit', () => {
    const { window } = loadTomatoApp();
    const ce = findPredictedCe(window);
    assert.ok(ce, 'predicted CE element must exist (precondition)');
    const text = (ce.textContent || '').trim();
    assert.match(text, /\d+(\.\d+)?/,
      `predicted CE element text "${text}" must contain a numeric value`);
    // Per REQ-160 (unit in header) the strip is a label/value pair; the unit
    // can sit on the label or the value. Either presence is acceptable.
    const block = window.document.getElementById('nutr-sidedress');
    const blockText = (block.textContent || '');
    assert.ok(/mS\/cm/.test(blockText),
      `sidedress block must declare mS/cm somewhere near predicted CE; block text was "${blockText.slice(0, 200)}…"`);
  });

  test('predicted-ph-ce-shown-on-builder-blocks — predicted pH renders a numeric value', () => {
    const { window } = loadTomatoApp();
    const ph = findPredictedPh(window);
    assert.ok(ph, 'predicted pH element must exist (precondition)');
    const text = (ph.textContent || '').trim();
    assert.match(text, /\d+(\.\d+)?/,
      `predicted pH element text "${text}" must contain a numeric value`);
  });
});

// ─── predicted-ph-ce-clickable-modal ────────────────────────────────────

describe('predicted-ph-ce-clickable-modal — clicking opens a modal with measurement-point + safe-band info', () => {
  test('predicted-ph-ce-clickable-modal — predicted CE node is clickable (cursor / role)', () => {
    const { window } = loadTomatoApp();
    const ce = findPredictedCe(window);
    assert.ok(ce, 'predicted CE element must exist (precondition)');
    // Spec says "clicking … opens a modal" — assert affordance is present.
    // Either a click listener intent marker (role=button / tabindex) or an
    // inline cursor:pointer signals click-affordance.
    const role = ce.getAttribute('role');
    const tabindex = ce.getAttribute('tabindex');
    const style = ce.getAttribute('style') || '';
    const hasAffordance =
      role === 'button' || tabindex !== null || /cursor\s*:\s*pointer/.test(style);
    assert.ok(hasAffordance,
      'predicted CE node must signal click-affordance (role=button | tabindex | cursor:pointer)');
  });

  test('predicted-ph-ce-clickable-modal — clicking predicted CE opens a modal that names the measurement point (soil root zone)', () => {
    const { window } = loadTomatoApp();
    const ce = findPredictedCe(window);
    assert.ok(ce, 'predicted CE element must exist (precondition)');
    ce.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    // Modal surface: convention used elsewhere is a dialog-like node opened
    // after click. Look for any visible role=dialog OR a node containing the
    // French phrase identifying the measurement point. Sidedress targets the
    // SOIL ROOT ZONE (not the dripper, not the lab SME pen).
    const docText = (window.document.body.textContent || '').toLowerCase();
    const namesSoilRootZone =
      docText.includes('zone racinaire')
      || docText.includes('sol — zone racinaire')
      || docText.includes('racines au sol')
      || docText.includes('soil root zone');
    assert.ok(namesSoilRootZone,
      'sidedress predicted-CE modal must declare the measurement point as the soil root zone; '
      + 'searched for "zone racinaire" / "soil root zone" in the document');
  });

  test('predicted-ph-ce-clickable-modal — modal explains the blue-pen → measurement-point mapping', () => {
    const { window } = loadTomatoApp();
    const ce = findPredictedCe(window);
    assert.ok(ce, 'predicted CE element must exist (precondition)');
    ce.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    const docText = (window.document.body.textContent || '').toLowerCase();
    // Spec verbatim: "how the blue lab pen maps to that point". The blue pen
    // reads SME (lab sample) per nutrition/chemistry REQ-024 — the modal must
    // surface that mapping.
    const mentionsBluePen =
      docText.includes('stylo bleu')
      || docText.includes('crayon bleu')
      || docText.includes('blue pen')
      || docText.includes('blue lab pen')
      || docText.includes('sme');
    assert.ok(mentionsBluePen,
      'sidedress modal must explain how the blue lab pen / SME reading maps to the soil root zone');
  });

  test('predicted-ph-ce-clickable-modal — modal renders the CE safe band for the current crop/stage', () => {
    const { window } = loadTomatoApp();
    const ce = findPredictedCe(window);
    assert.ok(ce, 'predicted CE element must exist (precondition)');
    ce.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    const docText = window.document.body.textContent || '';
    // CE band for substrate / root zone is 1.5 – 3.5 mS/cm (REQ-024) across
    // tomato T1-T5. Numbers must appear in the modal.
    assert.ok(/1[.,]5/.test(docText) && /3[.,]5/.test(docText),
      `sidedress predicted-CE modal must show the safe band 1.5 – 3.5 mS/cm; `
      + `document text snippet: "${docText.slice(0, 300)}…"`);
  });

  // pH compartment list (REQ-053) does NOT declare a soil-root-zone band.
  // Until chemistry/spec.md adds one, the pH-modal claims cannot be tested.
  test.todo('predicted-ph-ce-clickable-modal — predicted pH modal declares the soil-root-zone pH safe band '
    + '(blocked: REQ-053 does not list a soil-root-zone pH compartment; '
    + 'nutrition/chemistry/spec.md must declare PH_MIN/PH_MAX for soil root zone first)');
});

// ─── predicted-ph-ce-coloured-by-band-position ──────────────────────────

describe('predicted-ph-ce-coloured-by-band-position — green inside, red outside, yellow within 10 % of edge', () => {
  // Read the rendered predicted CE numeric value to pick the expected
  // colour against the substrate root-zone band [1.5, 3.5]. The colour
  // assertion compares the element's resolved colour against the three
  // semantic tokens (green / yellow / red) declared elsewhere in the page —
  // we keep this generic by matching on CSS keywords / common hex codes.
  function classifyBandPosition(value, band, yellowMargin) {
    if (!Number.isFinite(value)) return null;
    if (value < band.min || value > band.max) return 'red';
    const distanceToEdge = Math.min(value - band.min, band.max - value);
    return distanceToEdge <= yellowMargin ? 'yellow' : 'green';
  }

  test('predicted-ph-ce-coloured-by-band-position — predicted CE element carries a colour signal matching its band position', () => {
    const { window } = loadTomatoApp();
    const ce = findPredictedCe(window);
    assert.ok(ce, 'predicted CE element must exist (precondition)');
    const value = parseFloat((ce.textContent || '').replace(',', '.'));
    const expected = classifyBandPosition(value, CE_BAND_SOIL_ROOT_ZONE, CE_YELLOW_MARGIN);
    assert.ok(expected !== null,
      `could not parse a numeric CE value from "${ce.textContent}"`);
    // Colour surface is one of: inline style color, data-band-position attr,
    // or a class. Accept any of these signals and check it matches `expected`.
    const style = ce.getAttribute('style') || '';
    const dataBand = (ce.getAttribute('data-band-position') || '').toLowerCase();
    const className = (ce.getAttribute('class') || '').toLowerCase();
    const inlineColour = (style.match(/color\s*:\s*([^;]+)/i) || [null, ''])[1].toLowerCase();
    const haystack = `${inlineColour} ${dataBand} ${className}`;
    const colourMap = {
      green: /(green|#0a0|#0c0|#080|var\(--ok\)|--ok|inside|safe|ok\b)/,
      yellow: /(yellow|gold|#fc0|#fa0|#ff0|var\(--warn\)|--warn|near.?edge|warning|warn\b)/,
      red: /(red|#f00|#c00|#a00|var\(--bad\)|--bad|outside|out-of-band|bad\b)/,
    };
    assert.ok(colourMap[expected].test(haystack),
      `predicted CE element should carry a "${expected}" colour signal for value ${value} `
      + `(band ${CE_BAND_SOIL_ROOT_ZONE.min}-${CE_BAND_SOIL_ROOT_ZONE.max}); `
      + `found style="${style}", data-band-position="${dataBand}", class="${className}"`);
  });

  test('predicted-ph-ce-coloured-by-band-position — classifier reference is correct (sanity)', () => {
    // Pin the classifier-rule numerics independently — this is the assertion
    // the production code must implement.
    assert.equal(classifyBandPosition(2.5, CE_BAND_SOIL_ROOT_ZONE, CE_YELLOW_MARGIN), 'green',
      '2.5 mS/cm is mid-band → green');
    assert.equal(classifyBandPosition(1.6, CE_BAND_SOIL_ROOT_ZONE, CE_YELLOW_MARGIN), 'yellow',
      '1.6 mS/cm is within 10 % (0.2) of lower edge 1.5 → yellow');
    assert.equal(classifyBandPosition(3.4, CE_BAND_SOIL_ROOT_ZONE, CE_YELLOW_MARGIN), 'yellow',
      '3.4 mS/cm is within 10 % of upper edge 3.5 → yellow');
    assert.equal(classifyBandPosition(1.4, CE_BAND_SOIL_ROOT_ZONE, CE_YELLOW_MARGIN), 'red',
      '1.4 mS/cm is below band → red');
    assert.equal(classifyBandPosition(3.6, CE_BAND_SOIL_ROOT_ZONE, CE_YELLOW_MARGIN), 'red',
      '3.6 mS/cm is above band → red');
  });

  test.todo('predicted-ph-ce-coloured-by-band-position — predicted pH element carries colour signal matching its band position '
    + '(blocked: REQ-053 does not declare a soil-root-zone pH band; chemistry spec must add PH_MIN/PH_MAX for soil root zone)');
});
