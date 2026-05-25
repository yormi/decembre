// Operator-surface spec tests — pins three SLUG rules in
// nutrition/tomato/foliar-strategy/operator/user-stories.md against the rendered DOM.
//
// SLUG coverage:
//   recipe-sheet-per-recipe   — one weighing block per recipe in the strategy
//   weekly-calendar-rendered  — operator surface includes the spray calendar
//                               derived from procedure/model output
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
  test('recipe-sheet-per-recipe — DOM weighing-block count equals strategy.recipes.length', () => {
    // Trigger the renderer so #foliar-strategy gets populated. buildFoliar
    // reads STORED_RECIPE.tomato.foliaire (oligo recipe today). When the
    // multi-recipe DOM loop ships in Wave 2, the renderer will emit one
    // recipe-sheet container per recipe in computeFoliarStrategy output.
    const FoliarRecipeTomato = win.FoliarRecipeTomato;
    const strategy = FoliarRecipeTomato.computeFoliarStrategy('T5', SAMPLE_GAP);
    const recipeCount = strategy.recipes.length;
    assert.ok(recipeCount >= 1,
      `strategy must contain ≥1 recipe; got ${recipeCount}`);

    if (typeof win.buildFoliar === 'function') {
      win.buildFoliar();
    }

    // A recipe-sheet block is the rendered weighing container per recipe.
    // Wave 2 contract: each block is a [data-recipe-sheet] node (or class
    // .recipe-sheet) emitted by the renderer, one per strategy.recipes.
    const document = win.document;
    const recipeSheets = document.querySelectorAll(
      '[data-recipe-sheet], .recipe-sheet'
    );
    assert.equal(recipeSheets.length, recipeCount,
      `DOM weighing-block count (${recipeSheets.length}) must equal `
      + `strategy.recipes.length (${recipeCount}); when only oligo ships, `
      + `count = 1; when Ca lands, count = 2.`);
  });

  test('recipe-sheet-per-recipe — each weighing block carries product list + predicted CE + predicted pH + surfactant flag', () => {
    // Spec: "Each block shows the product list with weighing quantities for
    // one tank, predicted CE, predicted tank pH, and the recipe's surfactant
    // requirement (yes / no)."
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
      const predictedCE = sheet.querySelector(
        '[data-predicted-ce], .predicted-ce'
      );
      assert.ok(predictedCE,
        'recipe-sheet must render predicted CE (per operator/user-stories.md § recipe-sheet-per-recipe)');
      const predictedPh = sheet.querySelector(
        '[data-predicted-ph], .predicted-ph'
      );
      assert.ok(predictedPh,
        'recipe-sheet must render predicted tank pH');
      const surfactantFlag = sheet.querySelector(
        '[data-surfactant], .surfactant-flag'
      );
      assert.ok(surfactantFlag,
        'recipe-sheet must render surfactant requirement (yes / no)');
    }
  });
});

describe('weekly-calendar-rendered — operator surface renders the weekly spray calendar', () => {
  test('weekly-calendar-rendered — a calendar surface exists in the operator DOM', () => {
    if (typeof win.buildFoliar === 'function') {
      win.buildFoliar();
    }
    const document = win.document;
    // Wave 2 contract: a single calendar container holding per-day slots.
    const calendar = document.querySelector(
      '[data-foliar-calendar], #foliar-calendar, .foliar-calendar'
    );
    assert.ok(calendar,
      'operator surface must include a weekly spray calendar container '
      + '(per operator/user-stories.md § weekly-calendar-rendered)');
  });

  test('weekly-calendar-rendered — calendar slot count reflects computeFoliarStrategy day assignments', () => {
    const FoliarRecipeTomato = win.FoliarRecipeTomato;
    const strategy = FoliarRecipeTomato.computeFoliarStrategy('T5', SAMPLE_GAP);
    const expectedSlotCount = strategy.recipes.reduce(
      (sum, recipe) => sum + recipe.days.length, 0);

    if (typeof win.buildFoliar === 'function') {
      win.buildFoliar();
    }
    const document = win.document;
    const slots = document.querySelectorAll(
      '[data-foliar-calendar-slot], .foliar-calendar-slot'
    );
    assert.equal(slots.length, expectedSlotCount,
      `calendar slot count (${slots.length}) must match the sum of `
      + `recipe.days lengths across strategy.recipes (${expectedSlotCount}); `
      + `procedure produces per-day assignments — operator renders them 1:1.`);
  });

  test('weekly-calendar-rendered — each calendar slot names a recipe (per procedure § one-recipe-per-spray)', () => {
    if (typeof win.buildFoliar === 'function') {
      win.buildFoliar();
    }
    const document = win.document;
    const slots = document.querySelectorAll(
      '[data-foliar-calendar-slot], .foliar-calendar-slot'
    );
    assert.ok(slots.length >= 1,
      'no calendar slots found — Wave 2 DOM contract not yet shipped');
    for (const slot of slots) {
      const recipeLabel = slot.querySelector(
        '[data-calendar-recipe], .calendar-recipe'
      );
      assert.ok(recipeLabel,
        'each calendar slot must name exactly one recipe '
        + '(per procedure/user-stories.md § one-recipe-per-spray)');
      assert.ok(recipeLabel.textContent.trim().length > 0,
        'calendar-slot recipe label must be non-empty text');
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
