// Tests for nutrition/lettuce/app/user-stories.md.
//
// REQs covered (5): REQ-176, REQ-177, REQ-178, REQ-179, REQ-180.
//
// Strategy: mirror nutrition/tomato/app/spec.test.mjs — jsdom over the
// assembled dist/index.html, flip the Nutrition crop sub-toggle to Salanova
// so #nutr-lettuce-content renders, then assert against the live DOM.
//
// Baseline expectation (2026-05-17): REQ-176 (6th front-load input still in
// place), REQ-179 (4th `interpretation` field still in the registerPourquoi
// payload at logic.js ~line 102) MUST fail against current source. The Wave 2
// coder will flip them green. REQ-177, REQ-178, REQ-180 should pass today.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadLettuceApp, readLogicJs } from './test-helpers.mjs';

// ─── REQ-176 — Header inputs are exactly five scalars ──────────────────
//
// Spec names the five scalars in camelCase (transplantG, targetG, cycleDays,
// density, phLocked). The DOM-id convention on this subpage is `nutr-l-<x>`
// — assert by direct id lookup. Critically, REQ-176 rejects a sixth
// front-load operator input: the weekly feather-meal rate ships planted-in.

describe('REQ-176 — Salanova Bilan header inputs are exactly five scalars', () => {
  // Mapping spec scalar → DOM id on the Salanova header card.
  const SCALAR_TO_DOM_ID = {
    transplantG: 'nutr-l-transplant',
    targetG:     'nutr-l-target',
    cycleDays:   'nutr-l-days',
    density:     'nutr-l-density',
    phLocked:    'nutr-l-phlocked',
  };

  test('REQ-176 — every required scalar DOM id is present', () => {
    const { window } = loadLettuceApp();
    const missing = Object.entries(SCALAR_TO_DOM_ID)
      .filter(([, id]) => !window.document.getElementById(id))
      .map(([scalar, id]) => `${scalar} (${id})`);
    assert.deepEqual(missing, [], `missing scalar inputs: ${missing.join(', ')}`);
  });

  test('REQ-176 — sixth front-load input nutr-l-frontload is absent', () => {
    // Current source still ships `nutr-l-frontload` (and its sibling
    // logic.js front-load reads). REQ-176 rejects it — the weekly rate ships
    // as a planted-in default, not an operator knob. This test fails today
    // and flips green when the coder removes the field.
    const { window } = loadLettuceApp();
    assert.equal(
      window.document.getElementById('nutr-l-frontload'),
      null,
      'nutr-l-frontload must be retired (REQ-176: no sixth front-load input)',
    );
  });

  test('REQ-176 — types: 4× number, 1× checkbox', () => {
    const { window } = loadLettuceApp();
    const document = window.document;
    assert.equal(document.getElementById('nutr-l-transplant').type, 'number');
    assert.equal(document.getElementById('nutr-l-target').type, 'number');
    assert.equal(document.getElementById('nutr-l-days').type, 'number');
    assert.equal(document.getElementById('nutr-l-density').type, 'number');
    assert.equal(document.getElementById('nutr-l-phlocked').type, 'checkbox');
  });

  test('REQ-176 — header card body has no other top-level number/checkbox inputs beyond the 5', () => {
    // Behavioral guard: count every <input type="number"|"checkbox"> directly
    // inside the Salanova header card and assert each id is in the allowed
    // five-scalar set. Anything else (e.g. nutr-l-frontload) is an
    // unspecified header knob and breaks REQ-176.
    const { window } = loadLettuceApp();
    const headerCard = window.document.querySelector('#nutr-lettuce-content .card');
    assert.ok(headerCard, 'header card not found inside #nutr-lettuce-content');
    const scalarInputs = headerCard.querySelectorAll('input[type="number"], input[type="checkbox"]');
    const allowed = new Set(Object.values(SCALAR_TO_DOM_ID));
    const extras = Array.from(scalarInputs)
      .map(inp => inp.id)
      .filter(id => !allowed.has(id));
    assert.deepEqual(
      extras, [],
      `unexpected scalar inputs in Salanova header card: ${extras.join(', ')}`,
    );
  });
});

// ─── REQ-177 — Plant-need block demand source ──────────────────────────
//
// Spec pins the call shape: the render path must invoke
// window.PlantNeedsLettuce.calculateLettuceNutritionDemand(transplantG,
// targetG, cycleDays, density). No bare-global access to LETTUCE_TISSUE_DW /
// LETTUCE_DM_FRACTION in the render path source.

describe('REQ-177 — Plant-need block demand source', () => {
  test('REQ-177 — buildNutrimentLettuce calls PN.calculateLettuceNutritionDemand with four scalars', () => {
    // Behavioral spy. Patch the namespace function, force a re-render via
    // setNutrCrop('lettuce'), assert ≥1 call with the expected arg shape.
    const { window } = loadLettuceApp();
    const PN = window.PlantNeedsLettuce;
    assert.ok(PN, 'window.PlantNeedsLettuce must be defined');
    assert.equal(
      typeof PN.calculateLettuceNutritionDemand, 'function',
      'PN.calculateLettuceNutritionDemand must be a function',
    );
    const original = PN.calculateLettuceNutritionDemand;
    const calls = [];
    PN.calculateLettuceNutritionDemand = function spy(...args) {
      calls.push(args);
      return original.apply(this, args);
    };
    try {
      // Force a re-render: setNutrCrop('lettuce') invokes buildNutriment →
      // buildNutrimentLettuce → the call we're spying on.
      window.setNutrCrop('lettuce');
      assert.ok(calls.length >= 1,
        `expected ≥1 call to PN.calculateLettuceNutritionDemand, got ${calls.length}`);
      // First call's args: must be exactly (transplantG, targetG, cycleDays,
      // density) — 4 numbers, matching the input defaults from page.html.
      const [transplantG, targetG, cycleDays, density, ...extras] = calls[0];
      assert.equal(typeof transplantG, 'number', `transplantG arg not numeric: ${transplantG}`);
      assert.equal(typeof targetG,     'number', `targetG arg not numeric: ${targetG}`);
      assert.equal(typeof cycleDays,   'number', `cycleDays arg not numeric: ${cycleDays}`);
      assert.equal(typeof density,     'number', `density arg not numeric: ${density}`);
      assert.equal(extras.length, 0,
        `call shape must be 4-scalar (transplantG,targetG,cycleDays,density); got extras: ${JSON.stringify(extras)}`);
    } finally {
      PN.calculateLettuceNutritionDemand = original;
    }
  });

  test('REQ-177 (structural-only) — render-path source has no bare LETTUCE_TISSUE_DW / LETTUCE_DM_FRACTION access', () => {
    // Property-descriptor spies on the bare globals are invasive in jsdom
    // (the constants are declared with `const` inside the page-script IIFE
    // and are not configurable). Fall back to a structural grep on
    // logic.js: any `LETTUCE_TISSUE_DW[` or `LETTUCE_DM_FRACTION` that is
    // NOT preceded by a dot (PN.LETTUCE_TISSUE_DW[, window.PlantNeedsLettuce
    // .LETTUCE_TISSUE_DW[) is a bare access. String-literal occurrences
    // inside backtick template strings show up as bare too — explicitly
    // tolerate the equation/plugged display strings already audited at
    // logic.js lines 100-101 (registerPourquoi payload, not a read).
    const body = readLogicJs();
    // Strip backtick template literals before grepping so the equation
    // strings don't trip false positives.
    const sourceWithoutTemplates = body.replace(/`(?:\\.|[^`\\])*`/g, '``');
    const bareTissue = sourceWithoutTemplates.match(/(?<!\.)\bLETTUCE_TISSUE_DW\b/g) || [];
    const bareDmFrac = sourceWithoutTemplates.match(/(?<!\.)\bLETTUCE_DM_FRACTION\b/g) || [];
    assert.equal(bareTissue.length, 0,
      `render-path source has ${bareTissue.length} bare LETTUCE_TISSUE_DW reads — must go through window.PlantNeedsLettuce`);
    assert.equal(bareDmFrac.length, 0,
      `render-path source has ${bareDmFrac.length} bare LETTUCE_DM_FRACTION reads — must go through window.PlantNeedsLettuce`);
  });
});

// ─── REQ-178 — Plant-need block row layout: 2 columns ──────────────────
//
// Header row: 2 column-cells (Él. / Besoin). Each data row: 2 cells. No
// fruit/biomass split — diverges from tomato's 4-col layout per REQ-166
// (lettuce has no flowering transition).

describe('REQ-178 — Plant-need block row layout: 2 columns', () => {
  test('REQ-178 — #nutr-l-needs header strip has exactly 2 column-cells', () => {
    const { window } = loadLettuceApp();
    const needs = window.document.getElementById('nutr-l-needs');
    assert.ok(needs, '#nutr-l-needs must exist');
    // Header strip is the first child div of #nutr-l-needs; it uses the same
    // grid-template-columns:0.6fr 1fr layout as the data rows below.
    const headerStrip = needs.querySelector('div[style*="grid-template-columns:0.6fr 1fr"]');
    assert.ok(headerStrip, 'header strip not found in #nutr-l-needs');
    // The header strip itself contains the column-cells as direct children.
    assert.equal(
      headerStrip.children.length, 2,
      `header strip has ${headerStrip.children.length} cells, expected 2 (Él. / Besoin)`,
    );
  });

  test('REQ-178 — every .pq-row in #nutr-l-needs has exactly 2 child cells', () => {
    const { window } = loadLettuceApp();
    const rows = window.document.querySelectorAll('#nutr-l-needs .pq-row');
    assert.ok(rows.length > 0, 'expected at least one .pq-row in #nutr-l-needs');
    for (const row of rows) {
      assert.equal(
        row.children.length, 2,
        `row had ${row.children.length} cells, expected 2 (Él. / Besoin)`,
      );
    }
  });

  test('REQ-178 — row count matches LETTUCE_TISSUE_DW element count', () => {
    // Indirect: confirms the 2-col layout renders one row per element, not
    // a transposed 1-row-by-many-cols arrangement.
    const { window } = loadLettuceApp();
    const PN = window.PlantNeedsLettuce;
    const expected = Object.keys(PN.LETTUCE_TISSUE_DW).length;
    const rows = window.document.querySelectorAll('#nutr-l-needs .pq-row');
    assert.equal(
      rows.length, expected,
      `row count ${rows.length} ≠ LETTUCE_TISSUE_DW keys ${expected}`,
    );
  });
});

// ─── REQ-179 — Row click opens cert + calculation modal with 3 pieces ──
//
// Three accepted content pieces: cert badge (in pq-modal-title), demand
// equation symbolic (pq-modal-eq), plugged numbers (pq-modal-plugged).
// Reject a 4th interpretation prose piece (pq-modal-interpolation must be
// empty + no data-prose-source).
//
// Today the registerPourquoi call at nutrition/lettuce/app/logic.js ~line 102
// still passes an `interpretation` field — pq-modal-interpolation renders
// non-empty → these tests fail. Wave 2 coder strips the field.

describe('REQ-179 — Plant-need row click opens cert + equation + plugged modal (3 pieces)', () => {
  test('REQ-179 — every element row wires showPourquoi("lettuce-demand.<el>")', () => {
    const { window } = loadLettuceApp();
    const rows = window.document.querySelectorAll('#nutr-l-needs .pq-row');
    assert.ok(rows.length > 0, 'expected at least one row in #nutr-l-needs');
    for (const row of rows) {
      const onclick = row.getAttribute('onclick') || '';
      assert.match(
        onclick,
        /showPourquoi\(['"]lettuce-demand\.[A-Za-z]+['"]\)/,
        `row onclick must call showPourquoi('lettuce-demand.<el>'); got "${onclick}"`,
      );
    }
  });

  test('REQ-179 — opening a demand modal populates cert badge in pq-modal-title (piece 1/3)', () => {
    const { window } = loadLettuceApp();
    assert.equal(typeof window.showPourquoi, 'function', 'showPourquoi must be exposed');
    window.showPourquoi('lettuce-demand.N');
    const title = window.document.getElementById('pq-modal-title');
    assert.ok(title, 'pq-modal-title must exist');
    assert.match(
      title.innerHTML || '',
      /diag-cert-\d/,
      'cert badge (diag-cert-N) must render inside pq-modal-title',
    );
  });

  test('REQ-179 — opening a demand modal populates the equation (piece 2/3)', () => {
    const { window } = loadLettuceApp();
    window.showPourquoi('lettuce-demand.N');
    const equation = window.document.getElementById('pq-modal-eq');
    assert.ok(equation, 'pq-modal-eq must exist');
    assert.match(
      (equation.textContent || '').trim(),
      /demand\[N\]\s*=/,
      'equation node must contain `demand[N] = …`',
    );
  });

  test('REQ-179 — opening a demand modal populates plugged-in numbers (piece 3/3)', () => {
    const { window } = loadLettuceApp();
    window.showPourquoi('lettuce-demand.N');
    const plugged = window.document.getElementById('pq-modal-plugged');
    assert.ok(plugged, 'pq-modal-plugged must exist');
    const text = (plugged.textContent || '').trim();
    assert.ok(text.length > 0, 'plugged-numbers node must not be empty');
    assert.match(text, /\d/, 'plugged-numbers should contain at least one digit');
  });

  test('REQ-179 — opening a demand modal leaves the interpretation node empty (no 4th piece)', () => {
    // The pourquoi-modal DOM has a 4th slot (pq-modal-interpolation), but
    // REQ-179 says only 3 content pieces — cert, equation, plugged. The
    // interpretation slot must render empty when the page demand modals open
    // AND must NOT advertise a data-prose-source (which would mean prose IS
    // attached even if the empty fallback ran).
    const { window } = loadLettuceApp();
    // Test every element so we catch any element-specific leakage.
    const PN = window.PlantNeedsLettuce;
    const elements = Object.keys(PN.LETTUCE_TISSUE_DW);
    const offenders = [];
    for (const element of elements) {
      window.showPourquoi(`lettuce-demand.${element}`);
      const interp = window.document.getElementById('pq-modal-interpolation');
      assert.ok(interp, 'pq-modal-interpolation must exist');
      const text = (interp.textContent || '').trim();
      const proseSource = interp.getAttribute('data-prose-source');
      if (text.length > 0 || proseSource) {
        offenders.push(`${element}: text="${text.slice(0, 60)}" prose-source="${proseSource}"`);
      }
    }
    assert.deepEqual(
      offenders, [],
      `pq-modal-interpolation must be empty for every demand modal (REQ-179: 3 pieces only); offenders:\n  ${offenders.join('\n  ')}`,
    );
  });

  test('REQ-179 — registerPourquoi payload for lettuce-demand.* carries no `interpretation` key', () => {
    // Direct check on the registry: payloads land in window.currentPourquoi.
    // REQ-179 rejects the 4th interpretation prose piece — that means the
    // registration call itself must drop the field. (Today logic.js line ~102
    // still passes `interpretation: 'Concentration tissulaire DW …'`.)
    const { window } = loadLettuceApp();
    const registry = window.currentPourquoi || {};
    const PN = window.PlantNeedsLettuce;
    const offenders = [];
    for (const element of Object.keys(PN.LETTUCE_TISSUE_DW)) {
      const entry = registry[`lettuce-demand.${element}`];
      if (entry && entry.interpretation) {
        offenders.push(`lettuce-demand.${element}`);
      }
    }
    assert.deepEqual(
      offenders, [],
      `registerPourquoi payload for these keys still carries an interpretation field: ${offenders.join(', ')}`,
    );
  });
});

// ─── REQ-180 — Plant-need block reactive to demand-side header inputs ──
//
// Mutating transplantG | targetG | cycleDays | density → re-render with new
// numbers (innerHTML changes). Mutating phLocked → demand block unchanged
// (phLocked is supply-side per REQ-167; even if buildNutrimentLettuce re-runs,
// the demand result is independent of phLocked → #nutr-l-needs innerHTML
// must be byte-identical).

describe('REQ-180 — Plant-need block reactive to demand-side header inputs', () => {
  // Helper: mutate an input, dispatch the appropriate event, return the
  // current #nutr-l-needs innerHTML. Restore state afterwards.
  function readNeedsAfterMutation(window, inputId, mutator, eventName) {
    const input = window.document.getElementById(inputId);
    assert.ok(input, `${inputId} must exist`);
    const previousValue = input.type === 'checkbox' ? input.checked : input.value;
    mutator(input);
    input.dispatchEvent(new window.Event(eventName, { bubbles: true }));
    const html = window.document.getElementById('nutr-l-needs').innerHTML;
    // Restore.
    if (input.type === 'checkbox') input.checked = previousValue;
    else input.value = previousValue;
    input.dispatchEvent(new window.Event(eventName, { bubbles: true }));
    return html;
  }

  // For each demand-side input, mutating to a distinct value MUST change the
  // rendered plant-need block.
  const DEMAND_INPUT_CASES = [
    { scalar: 'transplantG', inputId: 'nutr-l-transplant', from: '30', to: '50', event: 'input' },
    { scalar: 'targetG',     inputId: 'nutr-l-target',     from: '100', to: '150', event: 'input' },
    { scalar: 'cycleDays',   inputId: 'nutr-l-days',       from: '14', to: '21', event: 'input' },
    { scalar: 'density',     inputId: 'nutr-l-density',    from: '43', to: '30', event: 'input' },
  ];

  for (const { scalar, inputId, from, to, event } of DEMAND_INPUT_CASES) {
    test(`REQ-180 — mutating ${scalar} (${inputId}) re-renders #nutr-l-needs`, () => {
      const { window } = loadLettuceApp();
      // Establish a known baseline before reading.
      const input = window.document.getElementById(inputId);
      input.value = from;
      input.dispatchEvent(new window.Event(event, { bubbles: true }));
      const before = window.document.getElementById('nutr-l-needs').innerHTML;
      input.value = to;
      input.dispatchEvent(new window.Event(event, { bubbles: true }));
      const after = window.document.getElementById('nutr-l-needs').innerHTML;
      // Restore.
      input.value = from;
      input.dispatchEvent(new window.Event(event, { bubbles: true }));
      assert.notEqual(
        before, after,
        `#nutr-l-needs innerHTML should change when ${scalar} mutates ${from} → ${to}`,
      );
    });
  }

  test('REQ-180 — mutating phLocked does NOT change #nutr-l-needs innerHTML', () => {
    // phLocked is supply-side per REQ-167. Even if buildNutrimentLettuce
    // re-runs on toggle, the demand block's innerHTML must be byte-identical
    // because calculateLettuceNutritionDemand has no phLocked input.
    const { window } = loadLettuceApp();
    const checkbox = window.document.getElementById('nutr-l-phlocked');
    assert.ok(checkbox, 'nutr-l-phlocked must exist');
    // Force baseline state.
    checkbox.checked = true;
    checkbox.dispatchEvent(new window.Event('change', { bubbles: true }));
    checkbox.dispatchEvent(new window.Event('input', { bubbles: true }));
    const before = window.document.getElementById('nutr-l-needs').innerHTML;
    // Toggle off.
    checkbox.checked = false;
    checkbox.dispatchEvent(new window.Event('change', { bubbles: true }));
    checkbox.dispatchEvent(new window.Event('input', { bubbles: true }));
    const after = window.document.getElementById('nutr-l-needs').innerHTML;
    // Restore (default is checked).
    checkbox.checked = true;
    checkbox.dispatchEvent(new window.Event('change', { bubbles: true }));
    checkbox.dispatchEvent(new window.Event('input', { bubbles: true }));
    assert.equal(
      before, after,
      'phLocked toggle must not affect the demand block — REQ-180 + REQ-167 say phLocked is supply-side only',
    );
  });
});
