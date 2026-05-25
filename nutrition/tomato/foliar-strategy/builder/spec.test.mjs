// Tests for nutrition/tomato/foliar-strategy/builder/user-stories.md.
//
// SLUG coverage (3):
//   surfactant-input
//     — Block 5 carries exactly one operator input: a surfactant checkbox.
//       The sprayCount number input retired 2026-05-24 (frequency is now a
//       model output per foliar-strategy/spec.md § frequency-is-model-output).
//   block-5-reactive-to-surfactant
//     — toggling #nutr-foliar-surfactant re-renders Block 5 (dose card).
//   efficacite-reactive-to-surfactant
//     — same toggle changes the rendered Efficacité column per REQ-163's
//       verbatim wording (held — wording carries over from REQ-163).
//
// Framework: node:test. Reuses the assembled-page jsdom fixture from
// nutrition/tomato/shell/test-helpers.mjs (the only available bootstrap
// for Block 5 — the renderer is glued inside app/index.html). No new
// helpers introduced.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadTomatoApp } from '../../shell/test-helpers.mjs';

// Helper mirrors shell/spec.test.mjs REQ-163(b): the foliar gap-grid is the
// inner div under #nutr-foliar with inline `grid-template-columns:0.6fr...`
// (jsdom serializes inline style with no space after the colon). The 6
// columns are: Él. | Manque entrant | Efficacité | Apport ici | Manque
// sortant | emoji — Efficacité is index 2.
function findFoliarGapGridDataRows(window) {
  const block = window.document.getElementById('nutr-foliar');
  if (!block) return [];
  const inner = block.querySelector('div[style*="grid-template-columns:0.6fr"]');
  if (!inner) return [];
  const wrapper = inner.parentElement;
  return Array.from(wrapper.querySelectorAll('.pq-row'));
}

// ─── surfactant-input ──────────────────────────────────────────────────

describe('surfactant-input — Block 5 carries exactly the surfactant checkbox', () => {
  test('surfactant-input — #nutr-foliar-surfactant is a checkbox, default unchecked', () => {
    const { window } = loadTomatoApp();
    const input = window.document.getElementById('nutr-foliar-surfactant');
    assert.ok(input, '#nutr-foliar-surfactant must exist in Block 5');
    assert.equal(input.type, 'checkbox',
      `#nutr-foliar-surfactant must be a checkbox; got type="${input.type}"`);
    assert.equal(input.checked, false,
      '#nutr-foliar-surfactant must default to unchecked');
  });

  test('surfactant-input — #nutr-foliar-spray-count input is retired (must not exist)', () => {
    // Spec change 2026-05-24: sprayCount is a model output, not an operator
    // input. Any residual DOM input for sprayCount in Block 5 is a regression.
    const { window } = loadTomatoApp();
    const sprayCount = window.document.getElementById('nutr-foliar-spray-count');
    assert.equal(sprayCount, null,
      '#nutr-foliar-spray-count input must not exist — sprayCount is now a model output');
  });

  test('surfactant-input — Block 5 has no other top-level number/checkbox inputs beyond surfactant', () => {
    // Behavioral guard: prevents silent re-introduction of any other Block 5
    // operator knob. Only #nutr-foliar-surfactant is allowed inside #nutr-foliar.
    const { window } = loadTomatoApp();
    const block5 = window.document.getElementById('nutr-foliar');
    assert.ok(block5, '#nutr-foliar (Block 5 container) must exist');
    const scalarInputs = block5.querySelectorAll('input[type="number"], input[type="checkbox"]');
    const ids = Array.from(scalarInputs).map(inp => inp.id);
    const extras = ids.filter(id => id !== 'nutr-foliar-surfactant');
    assert.deepEqual(extras, [],
      `Block 5 has unexpected scalar inputs beyond #nutr-foliar-surfactant: ${extras.join(', ')}`);
  });
});

// ─── block-5-reactive-to-surfactant ────────────────────────────────────

describe('block-5-reactive-to-surfactant — toggling surfactant re-renders Block 5', () => {
  test('block-5-reactive-to-surfactant — toggling #nutr-foliar-surfactant off→on changes Block 5 text', () => {
    // Spec: "Toggling nutr-foliar-surfactant re-renders Block 5 with new
    // per-element delivered numbers." Stored mode renders the dose card
    // deterministically against STORED_RECIPE.tomato.foliaire.
    const { window } = loadTomatoApp();
    window.setNutrRecipeMode('stored');
    const surf = window.document.getElementById('nutr-foliar-surfactant');
    const block5 = window.document.getElementById('nutr-foliar');
    surf.checked = false;
    surf.dispatchEvent(new window.Event('change', { bubbles: true }));
    const before = (block5.textContent || '').trim();
    surf.checked = true;
    surf.dispatchEvent(new window.Event('change', { bubbles: true }));
    const after = (block5.textContent || '').trim();
    // Restore for downstream tests.
    surf.checked = false;
    surf.dispatchEvent(new window.Event('change', { bubbles: true }));
    window.setNutrRecipeMode('fp');
    assert.notEqual(before, after,
      'Block 5 text should change when surfactant toggles off→on');
  });

  test('block-5-reactive-to-surfactant — supply path threads surfactant into computeFoliarSupply', () => {
    // Spec: "The supply path passes the lever through to
    // window.FoliarRecipeTomato.computeFoliarSupply(stage, { surfactant })."
    // Pin the contract directly against the namespace, independent of
    // render rounding.
    const { window } = loadTomatoApp();
    const FRT = window.FoliarRecipeTomato;
    assert.ok(FRT && typeof FRT.computeFoliarSupply === 'function',
      'window.FoliarRecipeTomato.computeFoliarSupply must be exposed');
    const supplyOff = FRT.computeFoliarSupply('T5', { surfactant: false });
    const supplyOn = FRT.computeFoliarSupply('T5', { surfactant: true });
    assert.ok(supplyOff && typeof supplyOff === 'object',
      `computeFoliarSupply(T5, {surfactant:false}) must return an object; got ${typeof supplyOff}`);
    assert.ok(supplyOn && typeof supplyOn === 'object',
      `computeFoliarSupply(T5, {surfactant:true}) must return an object; got ${typeof supplyOn}`);
    // Routed elements: at least one delivered number must differ on toggle.
    const routed = ['Mn', 'Zn', 'Cu', 'Fe'];
    const differs = routed.some(element =>
      typeof supplyOff[element] === 'number'
      && typeof supplyOn[element] === 'number'
      && supplyOn[element] !== supplyOff[element]
    );
    assert.ok(differs,
      `computeFoliarSupply returned identical values for every routed element on surfactant toggle — `
      + `off=${JSON.stringify(supplyOff)} on=${JSON.stringify(supplyOn)}`);
  });
});

// ─── efficacite-reactive-to-surfactant ─────────────────────────────────

describe('efficacite-reactive-to-surfactant — Efficacité column updates on surfactant toggle', () => {
  test('efficacite-reactive-to-surfactant — toggling #nutr-foliar-surfactant changes ≥1 Efficacité cell text', () => {
    // Spec verbatim: "The Efficacité column on the foliar contribution
    // block updates when the operator toggles the surfactant lever in
    // Block 5. With surfactant engaged, foliar efficiency for routed
    // elements is higher than without."
    //
    // Narrows on the Efficacité column (index 2 in the 6-col gap-grid)
    // — block-5-reactive-to-surfactant pins that *some* Block 5 text
    // changes; this assertion pins the Efficacité column specifically.
    const { window } = loadTomatoApp();
    window.setNutrRecipeMode('stored');
    const surf = window.document.getElementById('nutr-foliar-surfactant');
    assert.ok(surf, '#nutr-foliar-surfactant must exist');

    const EFFICACITE_COL_INDEX = 2;
    const readEfficaciteCells = () => {
      const rows = findFoliarGapGridDataRows(window);
      return rows.map(row => {
        const cells = Array.from(row.children);
        return cells.length > EFFICACITE_COL_INDEX
          ? (cells[EFFICACITE_COL_INDEX].textContent || '').trim()
          : null;
      });
    };

    surf.checked = false;
    surf.dispatchEvent(new window.Event('change', { bubbles: true }));
    const cellsOff = readEfficaciteCells();
    surf.checked = true;
    surf.dispatchEvent(new window.Event('change', { bubbles: true }));
    const cellsOn = readEfficaciteCells();
    // Restore.
    surf.checked = false;
    surf.dispatchEvent(new window.Event('change', { bubbles: true }));
    window.setNutrRecipeMode('fp');

    assert.ok(cellsOff.length > 0,
      'Foliar gap-grid has no data rows — Efficacité column unreachable');
    assert.equal(cellsOff.length, cellsOn.length,
      `row count changed on toggle: off=${cellsOff.length} on=${cellsOn.length}`);
    const changed = cellsOff.some((text, index) => text !== cellsOn[index]);
    assert.ok(changed,
      `Efficacité column did not change when surfactant toggled — `
      + `off=[${cellsOff.join(' | ')}] on=[${cellsOn.join(' | ')}]`);
  });

  test('efficacite-reactive-to-surfactant — supply.foliar.efficiency rises for ≥1 routed element with surfactant ON', () => {
    // Spec second clause (verbatim): "With surfactant engaged, foliar
    // efficiency for routed elements is higher than without." Pin
    // direction, not just difference.
    const { window } = loadTomatoApp();
    const surf = window.document.getElementById('nutr-foliar-surfactant');
    assert.ok(surf, '#nutr-foliar-surfactant must exist');
    assert.equal(typeof window.calculateNutritionSupply, 'function',
      'window.calculateNutritionSupply must be exposed');

    surf.checked = false;
    surf.dispatchEvent(new window.Event('change', { bubbles: true }));
    const supplyOff = window.calculateNutritionSupply('T5', true, 1.0, 1.5, 'stored');
    const efficiencyOff = (supplyOff && supplyOff.foliar && supplyOff.foliar.efficiency) || {};

    surf.checked = true;
    surf.dispatchEvent(new window.Event('change', { bubbles: true }));
    const supplyOn = window.calculateNutritionSupply('T5', true, 1.0, 1.5, 'stored');
    const efficiencyOn = (supplyOn && supplyOn.foliar && supplyOn.foliar.efficiency) || {};

    // Restore.
    surf.checked = false;
    surf.dispatchEvent(new window.Event('change', { bubbles: true }));

    const routed = ['Mn', 'Zn', 'Cu', 'Fe'];
    const anyHigher = routed.some(element =>
      typeof efficiencyOff[element] === 'number'
      && typeof efficiencyOn[element] === 'number'
      && efficiencyOn[element] > efficiencyOff[element]
    );
    assert.ok(anyHigher,
      `surfactant=true did not raise efficiency for any routed element — `
      + `off=${JSON.stringify(efficiencyOff)} on=${JSON.stringify(efficiencyOn)}`);
  });
});
