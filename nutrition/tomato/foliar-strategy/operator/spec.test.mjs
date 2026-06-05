// Operator-surface spec tests — pins three SLUG rules in
// nutrition/tomato/foliar-strategy/operator/user-stories.md against the rendered DOM.
//
// SLUG coverage:
//   recipe-sheet-per-recipe   — one weighing block per STORED.foliaire key
//   no-frequency-input        — no operator-side sprayCount / frequency input
//
// Framework: node:test only. Reuses the jsdom fixture from
// foliar-strategy/model/test-helpers.mjs (boots dist/index.html into jsdom and
// exposes window.FoliarRecipeTomato + page renderers).

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadFoliarFixture } from '../model/test-helpers.mjs';

const win = loadFoliarFixture();

// Realistic non-zero gap so computeFoliarStrategy returns a non-empty plan.
const SAMPLE_GAP = { Mn: 50, Zn: 20, Cu: 5, Fe: 80, B: 10 };

// Forbidden DOM-id / name fragments for the no-frequency-input slug. Any
// element whose id or name (case-insensitive) contains one of these is an
// operator-side frequency override and violates the spec.
const FORBIDDEN_FREQUENCY_FRAGMENTS = [
  'foliar-spray-count',
  'foliar-frequency',
  'foliar-sprays-per-week',
  'spray-count',
  'sprays-per-week',
  'recipe-frequency',
];

describe('recipe-sheet-per-recipe — one weighing block per foliar recipe', () => {
  test('recipe-sheet-per-recipe — DOM weighing-block count equals STORED.foliaire non-empty key count', () => {
    // Operator surface reads STORED_RECIPE.tomato.foliaire directly (same
    // pattern as fertigation + sidedress operator pages). One [data-recipe-sheet]
    // per non-empty top-level key (A oligos + B Ca²⁺ today).
    const stored = win.STORED_RECIPE && win.STORED_RECIPE.tomato && win.STORED_RECIPE.tomato.foliaire;
    assert.ok(stored, 'STORED_RECIPE.tomato.foliaire must be defined');
    const storedKindCount = ['A', 'B'].filter(k => Array.isArray(stored[k]) && stored[k].length > 0).length;
    assert.ok(storedKindCount >= 1,
      `STORED.foliaire must hold ≥1 non-empty recipe key; got ${storedKindCount}`);

    if (typeof win.buildFoliar === 'function') {
      win.buildFoliar();
    }

    const document = win.document;
    const recipeSheets = document.querySelectorAll(
      '[data-recipe-sheet], .recipe-sheet'
    );
    assert.equal(recipeSheets.length, storedKindCount,
      `DOM weighing-block count (${recipeSheets.length}) must equal STORED non-empty `
      + `recipe count (${storedKindCount}).`);
  });

  test('recipe-sheet-per-recipe — each weighing block carries product list (no predicted CE/pH/surfactant on operator)', () => {
    // Spec: "Each block shows the product list with weighing quantities for
    // one tank. Predicted CE, predicted tank pH, and the surfactant flag are
    // NOT surfaced on the operator page (builder-only)."
    if (typeof win.buildFoliar === 'function') {
      win.buildFoliar();
    }
    const document = win.document;
    const recipeSheets = document.querySelectorAll(
      '[data-recipe-sheet], .recipe-sheet'
    );
    assert.ok(recipeSheets.length >= 1,
      'no recipe-sheet blocks found — Wave 2 DOM contract not yet shipped');
    for (const sheet of recipeSheets) {
      const products = sheet.querySelectorAll(
        '[data-recipe-product], .recipe-product, .step-amount'
      );
      assert.ok(products.length >= 1,
        `recipe-sheet must list ≥1 product; got ${products.length}`);
      assert.equal(sheet.querySelector('[data-predicted-ce], .predicted-ce'), null,
        'predicted CE must NOT appear on operator recipe-sheet');
      assert.equal(sheet.querySelector('[data-predicted-ph], .predicted-ph'), null,
        'predicted pH must NOT appear on operator recipe-sheet');
      assert.equal(sheet.querySelector('[data-surfactant], .surfactant-flag'), null,
        'surfactant flag must NOT appear on operator recipe-sheet');
    }
  });
});

describe('no-frequency-input — operator surface carries no spray-count / frequency input', () => {
  test('no-frequency-input — no DOM input matches any forbidden id/name fragment', () => {
    // The model emits sprayCount; the operator surface is read-only on
    // frequency. Any input id/name carrying a forbidden fragment is an
    // operator-side override and violates the spec.
    const document = win.document;
    const inputs = document.querySelectorAll('input, select, textarea');
    const offenders = [];
    for (const node of inputs) {
      const id = (node.id || '').toLowerCase();
      const name = (node.getAttribute('name') || '').toLowerCase();
      for (const fragment of FORBIDDEN_FREQUENCY_FRAGMENTS) {
        if (id.includes(fragment) || name.includes(fragment)) {
          offenders.push(
            `<${node.tagName.toLowerCase()} id="${node.id}" name="${name}">`
            + ` matches forbidden fragment "${fragment}"`
          );
        }
      }
    }
    assert.equal(offenders.length, 0,
      'operator surface must carry no frequency / sprayCount input '
      + `(per operator/user-stories.md § no-frequency-input); offenders:\n`
      + offenders.join('\n'));
  });

  test('no-frequency-input — no day-picker or recipe-on/off toggle on the foliar surface', () => {
    // Spec: "no day-picker, no recipe-on / recipe-off toggle. The model
    // decides what gets sprayed and when."
    const document = win.document;
    const foliarPage = document.getElementById('page-foliar-content');
    assert.ok(foliarPage, '#page-foliar-content container must exist');
    const forbidden = foliarPage.querySelectorAll(
      '[data-day-picker], .day-picker, [data-recipe-toggle], .recipe-toggle'
    );
    assert.equal(forbidden.length, 0,
      `foliar page must carry no day-picker / recipe-toggle controls; `
      + `found ${forbidden.length} offender(s).`);
  });
});
