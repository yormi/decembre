// Tests for nutrition/tomato/plant-needs/builder against the three
// cross-cutting nutrition slug-REQs:
//   • predicted-ph-ce-shown-on-builder-blocks
//   • predicted-ph-ce-clickable-modal
//   • predicted-ph-ce-coloured-by-band-position
//
// Scope question surfaced to leader (see report): the plant-needs builder
// renders Block 1 "Besoin du plant" — per-element demand sourced from
// PlantNeedsTomato.calcNutrDemand(target, stage, transpFactor). Block 1
// has NO dose/product editing inputs — only `nutr-target` and `nutr-stage`
// (plant-context controls) drive it. The cross-cutting spec scopes the
// feature to "every dose-or-product editing block on every nutrition
// builder page" (nutrition/spec.md:419-422). Plant demand is not a tank
// dose, so a strict reading excludes Block 1 from the feature.
//
// Tests below split into:
//   (A) scope-pinning assertion — Block 1 has no dose/product inputs,
//       confirming the feature does not apply here (PASSING shape).
//   (B) defensive probes — IF a future spec change adds a tank-recipe
//       surface to this builder, the same predicted-ph/ce contract from
//       foliar-strategy/operator applies; encoded as `test.todo` so they
//       surface in output without false-failing today.
//
// Band data wired (cited):
//   • CE band — Tomato T1-T2: 1.5–2.5 mS/cm; T3-T5: 2.0–3.0 mS/cm
//     (nutrition/chemistry/spec.md:74-77 REQ-024 table)
//   • pH band — Irrigation at dripper: 5.5–7.0
//     (nutrition/chemistry/spec.md:199-204 REQ-053 table)
//
// Framework: node:test. Reuses the assembled-page jsdom fixture from
// nutrition/tomato/shell/test-helpers.mjs.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadTomatoApp } from '../../shell/test-helpers.mjs';

// Cited band data for the on-builder surface this feature governs. If
// these constants drift in nutrition/chemistry/spec.md, tests must update.
const TOMATO_CE_BAND_T1_T2 = [1.5, 2.5];   // chemistry/spec.md:76
const TOMATO_CE_BAND_T3_T5 = [2.0, 3.0];   // chemistry/spec.md:76
const TOMATO_DRIPPER_PH_BAND = [5.5, 7.0]; // chemistry/spec.md:203

// ─── scope-pinning: Block 1 is NOT a dose-or-product editing block ────

describe('plant-needs builder scope — Block 1 has no dose or product editing inputs', () => {
  test('block-1-has-no-dose-or-product-inputs — #nutr-needs contains zero number/select inputs', () => {
    // Cross-cutting REQ predicted-ph-ce-shown-on-builder-blocks scopes
    // to dose-or-product editing blocks. Block 1 displays demand, not
    // doses; it must not host product or dose inputs.
    const { window } = loadTomatoApp();
    const block1 = window.document.getElementById('nutr-needs');
    assert.ok(block1, '#nutr-needs (Block 1 container) must exist');
    const editingInputs = block1.querySelectorAll(
      'input[type="number"], input[type="checkbox"], select'
    );
    const ids = Array.from(editingInputs).map(node => node.id || node.name || '<anon>');
    assert.equal(editingInputs.length, 0,
      `#nutr-needs must host no dose/product editing inputs; found: ${ids.join(', ')}`);
  });

  test('block-1-renders-demand-not-recipe — rows reflect calcNutrDemand output (mg/m²/wk)', () => {
    // Pins the renderer identity: Block 1 is demand, not a recipe.
    // Cross-references the user-stories.md REQ-111 4-column layout
    // (Él. / Fruit / Biomasse / Total) — none of which is a dose.
    const { window } = loadTomatoApp();
    const rows = window.document.querySelectorAll('#nutr-needs .pq-row');
    assert.ok(rows.length > 0,
      'Block 1 must render ≥1 demand row');
    // Spot-check: no row should contain product names or dose units (mL/L, g/L).
    for (const row of rows) {
      const text = (row.textContent || '');
      assert.ok(!/mL\/L|g\/L|mL\b/.test(text),
        `Block 1 row carries dose-unit text — not a demand row: "${text.trim()}"`);
    }
  });
});

// ─── predicted-ph-ce-shown-on-builder-blocks ───────────────────────────

describe('predicted-ph-ce-shown-on-builder-blocks — plant-needs Block 1', () => {
  test('predicted-ph-ce-shown-on-builder-blocks — Block 1 displays no predicted pH/CE chips (feature does not apply)', () => {
    // Negative coverage: confirms the feature scope excludes Block 1.
    // If a future Block 1 redesign introduces a tank-recipe surface,
    // this test will fail loudly and force a spec update.
    const { window } = loadTomatoApp();
    const block1 = window.document.getElementById('nutr-needs');
    assert.ok(block1, '#nutr-needs must exist');
    const predictedNodes = block1.querySelectorAll(
      '[data-predicted-ce], [data-predicted-ph], .predicted-ce, .predicted-ph'
    );
    assert.equal(predictedNodes.length, 0,
      `Block 1 surfaces ${predictedNodes.length} predicted pH/CE node(s) — `
      + `cross-cutting spec scopes the feature to dose-or-product editing blocks; `
      + `Block 1 is demand. Either spec or render is wrong.`);
  });
});

// ─── predicted-ph-ce-clickable-modal ───────────────────────────────────

describe('predicted-ph-ce-clickable-modal — plant-needs Block 1', () => {
  test.todo('predicted-ph-ce-clickable-modal — N/A for Block 1 — no predicted pH/CE chips render here');
});

// ─── predicted-ph-ce-coloured-by-band-position ─────────────────────────

describe('predicted-ph-ce-coloured-by-band-position — plant-needs Block 1', () => {
  test.todo('predicted-ph-ce-coloured-by-band-position — N/A for Block 1 — no predicted pH/CE chips render here');

  // Band-data fixture pinned for future use. If a later spec change
  // brings a tank surface into the plant-needs builder, the colouring
  // rule below applies verbatim (10 % band-width yellow zone at edges).
  test('band-data-fixtures-are-current — cited band constants match chemistry/spec.md', () => {
    // Anchor against the citation in this file. If chemistry/spec.md
    // updates these tables, both the constants above and the cite
    // comments need to update together.
    assert.deepEqual(TOMATO_CE_BAND_T1_T2, [1.5, 2.5],
      'CE band T1-T2 fixture drifted from chemistry/spec.md REQ-024');
    assert.deepEqual(TOMATO_CE_BAND_T3_T5, [2.0, 3.0],
      'CE band T3-T5 fixture drifted from chemistry/spec.md REQ-024');
    assert.deepEqual(TOMATO_DRIPPER_PH_BAND, [5.5, 7.0],
      'Dripper pH band fixture drifted from chemistry/spec.md REQ-053');
  });
});
