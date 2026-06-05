// Tests for nutrition/tomato/foliar-strategy/procedure/user-stories.md.
//
// SLUG coverage (4):
//   weekly-calendar-derived-from-model
//     — the procedure renders a weekly calendar surface DERIVED from
//       computeFoliarStrategy(stage, gap).recipes[].days. No independent
//       calendar state.
//   spread-evenly-no-stacking
//     — at most one recipe per day across the rendered week, until total
//       sprays exceeds farm-working-days count.
//   one-recipe-per-spray
//     — each calendar cell maps to exactly one recipe (no merged labels).
//   no-operator-day-override
//     — there is NO operator input that overrides the model's day
//       assignment. Read-only.
//
// Framework: node:test. Reuses the foliar fixture from
// nutrition/tomato/foliar-strategy/model/test-helpers.mjs — same jsdom
// bootstrap the model layer uses, includes computeFoliarStrategy on
// window.FoliarRecipeTomato.
//
// Wave 2 status: the procedure has no calendar.js / DOM target yet. Tests
// pin the model→calendar contract; DOM-side assertions check the future
// contract and stay red until the renderer ships. The four slugs above
// each have at least one assertion that runs against the live model.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadFoliarFixture } from '../model/test-helpers.mjs';

const FARM_WORKING_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// Pure derivation: the procedure's calendar is the flat list of
// (day, recipe-kind) pairs drawn from strategy.recipes[].days. This
// function encodes the contract — once a calendar.js / renderer ships,
// its output must match this projection.
function calendarFromStrategy(strategy) {
  const cells = [];
  for (const recipe of strategy.recipes) {
    for (const day of recipe.days) {
      cells.push({ day, kind: recipe.kind });
    }
  }
  return cells;
}

// ─── weekly-calendar-derived-from-model ────────────────────────────────

describe('weekly-calendar-derived-from-model — calendar is a projection of computeFoliarStrategy', () => {
  test('weekly-calendar-derived-from-model — calendar cell count equals sum of recipes[].days lengths', () => {
    const window = loadFoliarFixture();
    const FRT = window.FoliarRecipeTomato;
    const strategy = FRT.computeFoliarStrategy('T5',
      { Mn: 5, Zn: 5, Cu: 0.5, Fe: 20, B: 4 });
    const calendar = calendarFromStrategy(strategy);
    const expectedCellCount = strategy.recipes.reduce(
      (sum, r) => sum + r.days.length, 0);
    assert.equal(calendar.length, expectedCellCount,
      `calendar must contain exactly one cell per (recipe, day) pair from `
      + `strategy.recipes[].days; got ${calendar.length} cells, expected `
      + `${expectedCellCount}`);
  });

  test('weekly-calendar-derived-from-model — every calendar cell traces back to a recipe.days entry', () => {
    const window = loadFoliarFixture();
    const FRT = window.FoliarRecipeTomato;
    const strategy = FRT.computeFoliarStrategy('T5',
      { Mn: 5, Zn: 5, Cu: 0.5, Fe: 20, B: 4 });
    const calendar = calendarFromStrategy(strategy);
    for (const cell of calendar) {
      const recipe = strategy.recipes.find(r => r.kind === cell.kind);
      assert.ok(recipe,
        `calendar cell ${JSON.stringify(cell)}: kind "${cell.kind}" must `
        + `match a strategy.recipes[].kind`);
      assert.ok(recipe.days.includes(cell.day),
        `calendar cell ${JSON.stringify(cell)}: day "${cell.day}" must `
        + `appear in recipes["${cell.kind}"].days = `
        + `${JSON.stringify(recipe.days)}`);
    }
  });

  test('weekly-calendar-derived-from-model — recomputes when gap changes (no independent state)', () => {
    const window = loadFoliarFixture();
    const FRT = window.FoliarRecipeTomato;
    const empty = FRT.computeFoliarStrategy('T5',
      { Mn: 0, Zn: 0, Cu: 0, Fe: 0, B: 0 });
    const loaded = FRT.computeFoliarStrategy('T5',
      { Mn: 5, Zn: 5, Cu: 0.5, Fe: 20, B: 4 });
    const calEmpty = calendarFromStrategy(empty);
    const calLoaded = calendarFromStrategy(loaded);
    assert.equal(calEmpty.length, 0,
      `zero-gap input must produce an empty calendar (procedure derives, `
      + `does not persist); got ${calEmpty.length} cells`);
    assert.ok(calLoaded.length >= 1,
      `non-zero-gap input must produce at least one calendar cell; got `
      + `${calLoaded.length}`);
  });
});

// ─── spread-evenly-no-stacking ─────────────────────────────────────────

describe('spread-evenly-no-stacking — at most one recipe per day until threshold', () => {
  test('spread-evenly-no-stacking — single-recipe strategy has no day-stacking', () => {
    // Today only the oligo recipe is wired (Ca recipe gated on PO). With
    // one recipe, "no stacking" reduces to "the recipe's own days are
    // unique" — which holds by foliarDaysForSprayCount construction.
    const window = loadFoliarFixture();
    const FRT = window.FoliarRecipeTomato;
    const strategy = FRT.computeFoliarStrategy('T5',
      { Mn: 5, Zn: 5, Cu: 0.5, Fe: 20, B: 4 });
    const calendar = calendarFromStrategy(strategy);
    const dayCounts = {};
    for (const cell of calendar) {
      dayCounts[cell.day] = (dayCounts[cell.day] || 0) + 1;
    }
    const totalSprays = calendar.length;
    if (totalSprays <= FARM_WORKING_DAYS.length) {
      for (const day in dayCounts) {
        assert.equal(dayCounts[day], 1,
          `total sprays (${totalSprays}) ≤ farm-working-days `
          + `(${FARM_WORKING_DAYS.length}): day "${day}" must hold exactly `
          + `one recipe, got ${dayCounts[day]}`);
      }
    }
  });

  test('spread-evenly-no-stacking — calendar days are a subset of farm-working-days {Mon..Fri}', () => {
    const window = loadFoliarFixture();
    const FRT = window.FoliarRecipeTomato;
    const strategy = FRT.computeFoliarStrategy('T5',
      { Mn: 5, Zn: 5, Cu: 0.5, Fe: 20, B: 4 });
    const calendar = calendarFromStrategy(strategy);
    for (const cell of calendar) {
      assert.ok(FARM_WORKING_DAYS.includes(cell.day),
        `calendar cell day "${cell.day}" must be in farm-working-days `
        + `${JSON.stringify(FARM_WORKING_DAYS)} (spread-evenly only spreads `
        + `across the working-day set)`);
    }
  });
});

// ─── one-recipe-per-spray ──────────────────────────────────────────────

describe('one-recipe-per-spray — each calendar cell names exactly one recipe', () => {
  test('one-recipe-per-spray — every cell carries a single recipe kind (no merged labels)', () => {
    const window = loadFoliarFixture();
    const FRT = window.FoliarRecipeTomato;
    const strategy = FRT.computeFoliarStrategy('T5',
      { Mn: 5, Zn: 5, Cu: 0.5, Fe: 20, B: 4 });
    const calendar = calendarFromStrategy(strategy);
    for (const cell of calendar) {
      assert.equal(typeof cell.kind, 'string',
        `cell ${JSON.stringify(cell)}: kind must be a single string, got `
        + `${typeof cell.kind}`);
      assert.ok(cell.kind.length > 0,
        `cell ${JSON.stringify(cell)}: kind must be non-empty`);
      assert.ok(!cell.kind.includes('+') && !cell.kind.includes(','),
        `cell ${JSON.stringify(cell)}: kind must not encode a merged label `
        + `(no '+' or ','); got "${cell.kind}"`);
    }
  });

  test('one-recipe-per-spray — calendar projection produces N cells for N total sprays across recipes', () => {
    const window = loadFoliarFixture();
    const FRT = window.FoliarRecipeTomato;
    const strategy = FRT.computeFoliarStrategy('T5',
      { Mn: 5, Zn: 5, Cu: 0.5, Fe: 20, B: 4 });
    const totalSprays = strategy.recipes.reduce(
      (sum, r) => sum + (r.sprayCount || 0), 0);
    const calendar = calendarFromStrategy(strategy);
    assert.equal(calendar.length, totalSprays,
      `one cell per spray: calendar length (${calendar.length}) must equal `
      + `sum of recipes[].sprayCount (${totalSprays})`);
  });
});

// ─── no-operator-day-override ──────────────────────────────────────────

describe('no-operator-day-override — procedure surface is read-only on day assignment', () => {
  test('no-operator-day-override — no day-override input exists in foliar operator page', () => {
    // Guard: any DOM input wired to override the model's day assignment is
    // a regression. Watches for common ids; if any appear, the procedure
    // has grown an override surface the spec forbids.
    const window = loadFoliarFixture();
    const FORBIDDEN_IDS = [
      'foliar-day-override',
      'foliar-spray-day',
      'foliar-day-picker',
      'foliar-calendar-edit',
      'foliar-override-day',
    ];
    for (const id of FORBIDDEN_IDS) {
      const element = window.document.getElementById(id);
      assert.equal(element, null,
        `procedure must not expose operator-side day override; found `
        + `#${id} in DOM`);
    }
  });

  test('no-operator-day-override — computeFoliarStrategy signature accepts no operator-day argument', () => {
    // Defensive: contract check. The model takes (stage, gap, opts) — opts
    // does not carry an operator day-pick. Any future opts.dayOverride
    // would be a spec violation.
    const window = loadFoliarFixture();
    const FRT = window.FoliarRecipeTomato;
    const baseline = FRT.computeFoliarStrategy('T5',
      { Mn: 5, Zn: 5, Cu: 0.5, Fe: 20, B: 4 });
    const withAttemptedOverride = FRT.computeFoliarStrategy('T5',
      { Mn: 5, Zn: 5, Cu: 0.5, Fe: 20, B: 4 },
      { dayOverride: ['Tue'], days: ['Tue'], operatorDays: ['Tue'] });
    // Days for each recipe must be unchanged: passing override-shaped opts
    // must not shift the model's day assignment.
    for (let i = 0; i < baseline.recipes.length; i++) {
      assert.deepEqual(withAttemptedOverride.recipes[i].days,
        baseline.recipes[i].days,
        `recipe "${baseline.recipes[i].kind}": opts.dayOverride / .days / `
        + `.operatorDays must be ignored; baseline days `
        + `${JSON.stringify(baseline.recipes[i].days)} vs with-override `
        + `${JSON.stringify(withAttemptedOverride.recipes[i].days)}`);
    }
  });
});
