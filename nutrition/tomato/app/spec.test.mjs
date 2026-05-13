// Tests for nutrition/tomato/app/spec.md.
//
// REQs covered (11): REQ-104, REQ-105, REQ-106, REQ-107, REQ-108, REQ-109,
// REQ-110, REQ-111, REQ-113, REQ-114, REQ-004.
//
// Page-level rendering REQs use a shared jsdom instance loaded via
// test-helpers.mjs (rebuilds dist/index.html on first call). Source-grep
// REQs read the relevant source file directly so they pin code shape
// regardless of runtime behavior.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadTomatoApp, readLogicJs, readAppIndexHtml } from './test-helpers.mjs';

// ─── REQ-104 — Header inputs are exactly five scalars ──────────────────

describe('REQ-104 — Header inputs are exactly five scalars', () => {
  const REQUIRED_IDS = [
    'nutr-target',
    'nutr-solar-per-gram',
    'nutr-stage-selector',
    'nutr-phlocked',
    'nutr-recipe-fp',
    'nutr-recipe-stored',
  ];

  test('REQ-104 — every required header input id is present in the DOM', () => {
    const { window } = loadTomatoApp();
    const missing = REQUIRED_IDS.filter(id => !window.document.getElementById(id));
    assert.deepEqual(missing, [], `missing ids: ${missing.join(', ')}`);
  });

  test('REQ-104 — nutr-current is absent (retired 2026-05-09)', () => {
    const { window } = loadTomatoApp();
    const current = window.document.getElementById('nutr-current');
    assert.equal(current, null, 'nutr-current should not exist in markup');
  });

  test('REQ-104 — nutr-recipe-fp + nutr-recipe-stored are buttons (recipeMode toggle)', () => {
    const { window } = loadTomatoApp();
    const fp = window.document.getElementById('nutr-recipe-fp');
    const stored = window.document.getElementById('nutr-recipe-stored');
    assert.equal(fp.tagName, 'BUTTON');
    assert.equal(stored.tagName, 'BUTTON');
  });

  test('REQ-104 — nutr-phlocked is a checkbox (boolean phLocked)', () => {
    const { window } = loadTomatoApp();
    const phLocked = window.document.getElementById('nutr-phlocked');
    assert.equal(phLocked.type, 'checkbox');
  });

  test('REQ-104 — nutr-target is a number input (kg/m²/wk)', () => {
    const { window } = loadTomatoApp();
    const target = window.document.getElementById('nutr-target');
    assert.equal(target.type, 'number');
  });
});

// ─── REQ-105 — Light ceiling derived from operator-driven J/g ──────────

describe('REQ-105 — Light ceiling derived from solarPerGram input', () => {
  test('REQ-105 — solar-per-gram input default value is 7', () => {
    const { window } = loadTomatoApp();
    const inp = window.document.getElementById('nutr-solar-per-gram');
    assert.equal(inp.value, '7');
  });

  test('REQ-105 — logic.js ceiling formula has no hardcoded /7000 literal', () => {
    const body = readLogicJs();
    assert.doesNotMatch(body, /lightCeiling\s*=\s*weeklyJ\s*\/\s*7000\b/);
  });

  test('REQ-105 — mutating solarPerGram from 7 → 14 changes the displayed ceiling text', () => {
    const { window } = loadTomatoApp();
    const inp = window.document.getElementById('nutr-solar-per-gram');
    const ceilingEl = window.document.getElementById('nutr-light-ceiling');
    inp.value = '7';
    inp.dispatchEvent(new window.Event('input', { bubbles: true }));
    const before = (ceilingEl.textContent || '').trim();
    inp.value = '14';
    inp.dispatchEvent(new window.Event('input', { bubbles: true }));
    const after = (ceilingEl.textContent || '').trim();
    inp.value = '7';
    inp.dispatchEvent(new window.Event('input', { bubbles: true }));
    assert.notEqual(before, after, `ceiling text unchanged after solarPerGram mutation: "${before}"`);
  });
});

// ─── REQ-106 — FP recipe mode locks stage to T5 ────────────────────────

describe('REQ-106 — FP recipe mode locks stage to T5', () => {
  test('REQ-106 — logic.js contains the auto-revert pattern (s !== T5 && fp → stored)', () => {
    const body = readLogicJs();
    assert.match(body, /s !== 'T5' && nutrRecipeMode === 'fp'/);
  });

  test('REQ-106 — logic.js contains the FP→snap-to-T5 pattern in setNutrRecipeMode', () => {
    const body = readLogicJs();
    assert.match(body, /nutrRecipeMode === 'fp' && nutrStage !== 'T5'/);
  });

  test("REQ-106 — default declaration is `let nutrRecipeMode = 'fp'`", () => {
    const html = readAppIndexHtml();
    assert.match(html, /let nutrRecipeMode\s*=\s*'fp'/);
  });

  test('REQ-106 — setNutrRecipeMode + setNutrStage call syncHash (hash router persists mode)', () => {
    const body = readLogicJs();
    // setNutrStage and setNutrRecipeMode each call syncHash so the URL hash
    // stays consistent with the (mode, stage) pair.
    const setStageBlock = body.match(/function setNutrStage[\s\S]*?\n\}/);
    const setModeBlock  = body.match(/function setNutrRecipeMode[\s\S]*?\n\}/);
    assert.ok(setStageBlock, 'setNutrStage function not found in logic.js');
    assert.ok(setModeBlock,  'setNutrRecipeMode function not found in logic.js');
    assert.match(setStageBlock[0], /syncHash\(\)/);
    assert.match(setModeBlock[0],  /syncHash\(\)/);
  });
});

// ─── REQ-107 — Recipe-mode toggle layout + label + products-in-play retired ─

describe('REQ-107 — Toggle: First principles left, default; products-in-play removed', () => {
  test('REQ-107 — FP button is the first BUTTON child of the toggle parent', () => {
    const { window } = loadTomatoApp();
    const fp = window.document.getElementById('nutr-recipe-fp');
    const stored = window.document.getElementById('nutr-recipe-stored');
    assert.equal(fp.parentElement, stored.parentElement, 'FP and Stockée must share a parent');
    const buttons = Array.from(fp.parentElement.children).filter(c => c.tagName === 'BUTTON');
    assert.equal(buttons[0], fp, `FP button is not first child (got id="${buttons[0]?.id}")`);
    assert.equal(buttons[1], stored, `Stockée button is not second child (got id="${buttons[1]?.id}")`);
  });

  test('REQ-107 — FP label text contains "First principles" (English term-of-art)', () => {
    const { window } = loadTomatoApp();
    const fp = window.document.getElementById('nutr-recipe-fp');
    const text = (fp.textContent || '').trim();
    assert.match(text, /First principles/);
    assert.doesNotMatch(text, /Premiers principes/);
  });

  test('REQ-107 — nutr-products list is removed from the page markup', () => {
    const { window } = loadTomatoApp();
    const products = window.document.getElementById('nutr-products');
    assert.equal(products, null, 'nutr-products should be retired from the header');
  });

  test('REQ-107 — recipe-mode helper note is empty (no unspecified prose)', () => {
    const { window } = loadTomatoApp();
    const note = window.document.getElementById('nutr-recipe-mode-note');
    if (note) {
      const text = (note.textContent || '').trim();
      assert.equal(text.length, 0, `helper note has ${text.length} chars of text — should be empty`);
    }
  });
});

// ─── REQ-108 — Block 1 demand sourced from PlantNeedsTomato ────────────

describe('REQ-108 — Block 1 demand sourced from PN.calcNutrDemand', () => {
  test('REQ-108 — logic.js calls PN.calcNutrDemand (no inline reimplementation)', () => {
    const body = readLogicJs();
    assert.match(body, /PN\.calcNutrDemand|window\.PlantNeedsTomato\.calcNutrDemand/);
  });

  test('REQ-108 — Block 1 render section has no bare BIOMASS_DEMAND[ access', () => {
    const body = readLogicJs();
    const block1 = body.match(/Block 1[\s\S]*?nutr-needs.*?innerHTML/);
    assert.ok(block1, 'Block 1 marker not found in logic.js');
    // Negative lookbehind for `.` excludes namespaced access (PN.BIOMASS_DEMAND).
    assert.doesNotMatch(block1[0], /(?<!\.)\bBIOMASS_DEMAND\s*\[/);
  });

  test('REQ-108 — Block 1 render section has no bare TOMATO_FRUIT_EXPORT[ access', () => {
    const body = readLogicJs();
    const block1 = body.match(/Block 1[\s\S]*?nutr-needs.*?innerHTML/);
    assert.ok(block1, 'Block 1 marker not found in logic.js');
    assert.doesNotMatch(block1[0], /(?<!\.)\bTOMATO_FRUIT_EXPORT\s*\[/);
  });
});

// ─── REQ-109 — Block 1 row click opens cert + equation + plugged modal ─

describe('REQ-109 — Block 1 row click opens minimal pourquoi modal', () => {
  test('REQ-109 — row count in #nutr-needs equals PN.TOMATO_FRUIT_EXPORT keys count', () => {
    const { window } = loadTomatoApp();
    const PN = window.PlantNeedsTomato;
    assert.ok(PN, 'window.PlantNeedsTomato must be defined');
    const expected = Object.keys(PN.TOMATO_FRUIT_EXPORT || {}).length;
    const rows = window.document.querySelectorAll('#nutr-needs .pq-row');
    assert.equal(rows.length, expected,
      `row count ${rows.length} ≠ TOMATO_FRUIT_EXPORT keys ${expected}`);
  });

  test('REQ-109 — every row wires showPourquoi("demand.<el>") on click', () => {
    const { window } = loadTomatoApp();
    const rows = window.document.querySelectorAll('#nutr-needs .pq-row');
    assert.ok(rows.length > 0, 'expected at least one row in #nutr-needs');
    for (const row of rows) {
      const onclick = row.getAttribute('onclick') || '';
      assert.match(onclick, /showPourquoi\(['"]demand\.[A-Za-z]+['"]\)/);
    }
  });

  test('REQ-109 — opening a demand modal leaves the interpretation node empty', () => {
    const { window } = loadTomatoApp();
    assert.equal(typeof window.showPourquoi, 'function', 'showPourquoi must be exposed');
    window.showPourquoi('demand.N');
    const interp = window.document.getElementById('pq-modal-interp');
    if (interp) {
      const text = (interp.textContent || '').trim();
      assert.equal(text.length, 0,
        'modal interpretation node should be empty per REQ-109');
    }
  });
});

// ─── REQ-110 — Block 1 reactive to target + stage ──────────────────────

describe('REQ-110 — Block 1 reactive to target + stage changes', () => {
  test('REQ-110 — mutating nutr-target re-renders Block 1 with new numbers', () => {
    const { window } = loadTomatoApp();
    const target = window.document.getElementById('nutr-target');
    const needs  = window.document.getElementById('nutr-needs');
    target.value = '1.5';
    target.dispatchEvent(new window.Event('input', { bubbles: true }));
    const before = (needs.textContent || '').trim();
    target.value = '0.5';
    target.dispatchEvent(new window.Event('input', { bubbles: true }));
    const after = (needs.textContent || '').trim();
    target.value = '1.5';
    target.dispatchEvent(new window.Event('input', { bubbles: true }));
    assert.notEqual(before, after, 'Block 1 text should change when target shifts');
  });

  test('REQ-110 — clicking a different stage button re-renders Block 1', () => {
    const { window } = loadTomatoApp();
    const needs = window.document.getElementById('nutr-needs');
    const t5 = window.document.querySelector('[data-nstage="T5"]');
    const t1 = window.document.querySelector('[data-nstage="T1"]');
    assert.ok(t5 && t1, 'stage buttons must exist');
    t5.dispatchEvent(new window.Event('click', { bubbles: true }));
    const before = (needs.textContent || '').trim();
    t1.dispatchEvent(new window.Event('click', { bubbles: true }));
    const after = (needs.textContent || '').trim();
    t5.dispatchEvent(new window.Event('click', { bubbles: true }));
    assert.notEqual(before, after, 'Block 1 text should change when stage shifts');
  });
});

// ─── REQ-111 — Block 1 row layout: 4 columns ───────────────────────────

describe('REQ-111 — Block 1 row layout: 4 columns (Él. / Fruit / Biomasse / Total)', () => {
  test('REQ-111 — header row contains "Fruit" and "Biomasse" labels', () => {
    const { window } = loadTomatoApp();
    const needs = window.document.getElementById('nutr-needs');
    const text = needs.textContent || '';
    assert.match(text, /Fruit/);
    assert.match(text, /Biomasse/);
  });

  test('REQ-111 — every row has exactly 4 child cells', () => {
    const { window } = loadTomatoApp();
    const rows = window.document.querySelectorAll('#nutr-needs .pq-row');
    assert.ok(rows.length > 0, 'expected at least one row in #nutr-needs');
    for (const row of rows) {
      assert.equal(row.children.length, 4,
        `row had ${row.children.length} cells, expected 4`);
    }
  });
});

// ─── REQ-113 — Block 5 inputs: sprayCount + surfactant ─────────────────

describe('REQ-113 — Block 5 exposes sprayCount + surfactant inputs', () => {
  test('REQ-113 — nutr-foliar-spray-count is a number input, default 1, min 1, max 3', () => {
    const { window } = loadTomatoApp();
    const inp = window.document.getElementById('nutr-foliar-spray-count');
    assert.ok(inp, 'nutr-foliar-spray-count must exist');
    assert.equal(inp.type, 'number');
    assert.equal(inp.value, '1');
    assert.equal(inp.min, '1');
    assert.equal(inp.max, '3');
  });

  test('REQ-113 — nutr-foliar-surfactant is a checkbox, default unchecked', () => {
    const { window } = loadTomatoApp();
    const inp = window.document.getElementById('nutr-foliar-surfactant');
    assert.ok(inp, 'nutr-foliar-surfactant must exist');
    assert.equal(inp.type, 'checkbox');
    assert.equal(inp.checked, false);
  });

  test('REQ-113 — both ids appear in the input-listener wiring array of app/index.html', () => {
    const html = readAppIndexHtml();
    assert.match(html, /['"]nutr-foliar-spray-count['"]/);
    assert.match(html, /['"]nutr-foliar-surfactant['"]/);
  });
});

// ─── REQ-114 — Block 5 reactive to spray count + surfactant ────────────

describe('REQ-114 — Block 5 reactive to sprayCount + surfactant changes', () => {
  test('REQ-114 — mutating sprayCount from 1 → 2 re-renders Block 5 text', () => {
    const { window } = loadTomatoApp();
    const spray = window.document.getElementById('nutr-foliar-spray-count');
    const surf  = window.document.getElementById('nutr-foliar-surfactant');
    const block5 = window.document.getElementById('nutr-foliar');
    spray.value = '1';
    surf.checked = false;
    spray.dispatchEvent(new window.Event('input', { bubbles: true }));
    const before = (block5.textContent || '').trim();
    spray.value = '2';
    spray.dispatchEvent(new window.Event('input', { bubbles: true }));
    const after = (block5.textContent || '').trim();
    spray.value = '1';
    spray.dispatchEvent(new window.Event('input', { bubbles: true }));
    assert.notEqual(before, after, 'Block 5 text should change when sprayCount shifts');
  });

  test('REQ-114 — toggling surfactant from off → on re-renders Block 5 text', () => {
    const { window } = loadTomatoApp();
    const spray = window.document.getElementById('nutr-foliar-spray-count');
    const surf  = window.document.getElementById('nutr-foliar-surfactant');
    const block5 = window.document.getElementById('nutr-foliar');
    spray.value = '1';
    surf.checked = false;
    surf.dispatchEvent(new window.Event('change', { bubbles: true }));
    const before = (block5.textContent || '').trim();
    surf.checked = true;
    surf.dispatchEvent(new window.Event('change', { bubbles: true }));
    const after = (block5.textContent || '').trim();
    surf.checked = false;
    surf.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.notEqual(before, after, 'Block 5 text should change when surfactant toggles');
  });
});

// ─── REQ-004 — Bilan reads from source-of-truth recipes ────────────────
//
// Spec table enumerates 5 source-of-truth bindings the Bilan supply
// function must reference. We pin each as a source-grep against
// app/index.html (the consumer file). This complements the bash verifier's
// patterns; the bash version greps dist/index.html, the test pins source.

describe('REQ-004 — Bilan reads from source-of-truth recipes', () => {
  test('REQ-004 — calcNutrSupply calls computeStageRecipe(stage)', () => {
    const html = readAppIndexHtml();
    assert.match(html, /computeStageRecipe\(stage\)/);
  });

  test('REQ-004 — Bilan reads STORED_RECIPE.tomato.foliaire.A (weekly spray)', () => {
    const html = readAppIndexHtml();
    assert.match(html, /STORED_RECIPE\.tomato\.foliaire\.A/);
  });

  test('REQ-004 — Bilan reads STORED_RECIPE.tomato.sidedress[stage] (granular)', () => {
    const html = readAppIndexHtml();
    assert.match(html, /STORED_RECIPE\.tomato\.sidedress\[stage\]/);
  });

  test('REQ-004 — Bilan reads BIOMASS_DEMAND[stage] (vegetative demand)', () => {
    const html = readAppIndexHtml();
    assert.match(html, /BIOMASS_DEMAND\[stage\]/);
  });

  test('REQ-004 — Bilan reads TOMATO_FRUIT_EXPORT[el] (fruit export per element)', () => {
    const html = readAppIndexHtml();
    assert.match(html, /TOMATO_FRUIT_EXPORT\[el\]/);
  });

  test('REQ-004 — runtime: calcNutrSupply returns supply.fert with K and Mg numbers', () => {
    const { window } = loadTomatoApp();
    assert.equal(typeof window.calcNutrSupply, 'function',
      'calcNutrSupply must be exposed on window');
    const supply = window.calcNutrSupply('T5', true, 1.0, 1.5, 'stored');
    assert.ok(supply && supply.fert, 'supply.fert should exist');
    assert.equal(typeof supply.fert.K, 'number');
    assert.equal(typeof supply.fert.Mg, 'number');
    assert.ok(supply.fert.K > 0, 'fert.K should be positive at T5');
  });
});
