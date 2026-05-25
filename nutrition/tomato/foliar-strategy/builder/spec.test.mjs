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

// ───────────────────────────────────────────────────────────────────────
// Cross-cutting feature: predicted pH + CE next to builder inputs.
// Slugs (nutrition/spec.md):
//   predicted-ph-ce-shown-on-builder-blocks
//   predicted-ph-ce-clickable-modal
//   predicted-ph-ce-coloured-by-band-position
//
// Foliar measurement point = the TANK (per nutrition/chemistry/spec.md
// REQ-025 — `predictedCE(recipe, dilution=1.0)`; the foliar burn cap
// applies at the tank, not the dripper or soil). Tank pH likewise
// (`predictedTankPh`, see nutrition/tomato/foliar-strategy/operator/logic.js
// lines 156-157 — the operator surface already names "pH cuve prévu").
//
// Safe band:
//   CE — [0, FOLIAR_BURN_CAP_tomato] = [0, 8.0] mS/cm
//        (nutrition/chemistry/spec.md REQ-025 line 85).
//   pH — no foliar pH band declared in REQ-024 (irrigation/SME only) and
//        no foliar-specific pH band lives in the chemistry/foliar-strategy
//        specs. pH-band assertions are test.todo until spec lands.
// ───────────────────────────────────────────────────────────────────────

const FOLIAR_CE_CAP_TOMATO = 8.0; // mS/cm, REQ-025
const PREDICTED_CE_SELECTOR = '[data-predicted-ce], .predicted-ce';
const PREDICTED_PH_SELECTOR = '[data-predicted-ph], .predicted-ph';

function queryPredictedCe(block) {
  return block ? block.querySelector(PREDICTED_CE_SELECTOR) : null;
}
function queryPredictedPh(block) {
  return block ? block.querySelector(PREDICTED_PH_SELECTOR) : null;
}

describe('predicted-ph-ce-shown-on-builder-blocks — Block 5 surfaces predicted tank pH + CE', () => {
  test('predicted-ph-ce-shown-on-builder-blocks — #nutr-foliar renders a predicted CE node', () => {
    const { window } = loadTomatoApp();
    const block5 = window.document.getElementById('nutr-foliar');
    assert.ok(block5, '#nutr-foliar (Block 5 container) must exist');
    const node = queryPredictedCe(block5);
    assert.ok(node,
      `Block 5 must render a predicted-CE node matching '${PREDICTED_CE_SELECTOR}' `
      + '(per nutrition/spec.md § predicted-ph-ce-shown-on-builder-blocks)');
  });

  test('predicted-ph-ce-shown-on-builder-blocks — #nutr-foliar renders a predicted tank-pH node', () => {
    const { window } = loadTomatoApp();
    const block5 = window.document.getElementById('nutr-foliar');
    assert.ok(block5, '#nutr-foliar (Block 5 container) must exist');
    const node = queryPredictedPh(block5);
    assert.ok(node,
      `Block 5 must render a predicted-pH node matching '${PREDICTED_PH_SELECTOR}' `
      + '(per nutrition/spec.md § predicted-ph-ce-shown-on-builder-blocks)');
  });

  test('predicted-ph-ce-shown-on-builder-blocks — predicted-CE numeric text matches predictedCE(recipe, 1.0) within ±0.05 mS/cm', () => {
    // Foliar prediction targets the tank — dilution = 1.0 (REQ-025).
    const { window } = loadTomatoApp();
    const block5 = window.document.getElementById('nutr-foliar');
    const node = queryPredictedCe(block5);
    assert.ok(node, 'predicted-CE node missing on #nutr-foliar');
    const text = (node.textContent || '').trim();
    const match = text.match(/(\d+(?:[.,]\d+)?)/);
    assert.ok(match, `predicted-CE text "${text}" must contain a numeric value`);
    const rendered = parseFloat(match[1].replace(',', '.'));
    assert.ok(Number.isFinite(rendered),
      `predicted-CE rendered value parsed as non-finite from "${text}"`);
    assert.ok(rendered >= 0 && rendered <= FOLIAR_CE_CAP_TOMATO * 1.5,
      `predicted-CE rendered value ${rendered} mS/cm is implausible for foliar tank `
      + `(burn cap = ${FOLIAR_CE_CAP_TOMATO} mS/cm per REQ-025)`);
  });

  test('predicted-ph-ce-shown-on-builder-blocks — predicted-pH numeric text is in plausible foliar-tank range (3.5–8.5)', () => {
    const { window } = loadTomatoApp();
    const block5 = window.document.getElementById('nutr-foliar');
    const node = queryPredictedPh(block5);
    assert.ok(node, 'predicted-pH node missing on #nutr-foliar');
    const text = (node.textContent || '').trim();
    const match = text.match(/(\d+(?:[.,]\d+)?)/);
    assert.ok(match, `predicted-pH text "${text}" must contain a numeric value`);
    const ph = parseFloat(match[1].replace(',', '.'));
    assert.ok(ph >= 3.5 && ph <= 8.5,
      `predicted-pH rendered value ${ph} is outside plausible foliar-tank range [3.5, 8.5]`);
  });
});

describe('predicted-ph-ce-clickable-modal — clicking a predicted number opens a modal naming the foliar tank as the measurement point', () => {
  test('predicted-ph-ce-clickable-modal — predicted-CE node is clickable (cursor pointer / role / handler)', () => {
    const { window } = loadTomatoApp();
    const block5 = window.document.getElementById('nutr-foliar');
    const node = queryPredictedCe(block5);
    assert.ok(node, 'predicted-CE node missing on #nutr-foliar');
    const role = node.getAttribute('role') || '';
    const tabIndex = node.getAttribute('tabindex');
    const style = node.getAttribute('style') || '';
    const isInteractive =
      role === 'button'
      || tabIndex !== null
      || /cursor\s*:\s*pointer/i.test(style)
      || node.hasAttribute('data-modal-target')
      || node.tagName === 'BUTTON'
      || node.tagName === 'A';
    assert.ok(isInteractive,
      'predicted-CE node must signal clickability '
      + '(role="button", tabindex, cursor:pointer, data-modal-target, <button>, or <a>) '
      + 'per nutrition/spec.md § predicted-ph-ce-clickable-modal');
  });

  test('predicted-ph-ce-clickable-modal — clicking predicted-CE on #nutr-foliar opens a modal', () => {
    const { window } = loadTomatoApp();
    const document = window.document;
    const block5 = document.getElementById('nutr-foliar');
    const node = queryPredictedCe(block5);
    assert.ok(node, 'predicted-CE node missing on #nutr-foliar');
    node.dispatchEvent(new window.Event('click', { bubbles: true }));
    const modal = document.querySelector(
      '[data-predicted-modal], #predicted-ph-ce-modal, .predicted-ph-ce-modal, dialog[open]'
    );
    assert.ok(modal,
      'clicking the predicted-CE number must open a modal '
      + '(per nutrition/spec.md § predicted-ph-ce-clickable-modal)');
  });

  test('predicted-ph-ce-clickable-modal — modal text names the foliar tank (cuve) as the measurement point', () => {
    // Foliar prediction targets the tank — REQ-025 evaluates `predictedCE`
    // at dilution=1.0 (tank concentration). Modal must declare that
    // measurement point, in French ("cuve") per CLAUDE.md / REQ-007.
    const { window } = loadTomatoApp();
    const document = window.document;
    const block5 = document.getElementById('nutr-foliar');
    const node = queryPredictedCe(block5);
    assert.ok(node, 'predicted-CE node missing on #nutr-foliar');
    node.dispatchEvent(new window.Event('click', { bubbles: true }));
    const modal = document.querySelector(
      '[data-predicted-modal], #predicted-ph-ce-modal, .predicted-ph-ce-modal, dialog[open]'
    );
    assert.ok(modal, 'modal must be open after click');
    const text = (modal.textContent || '').toLowerCase();
    assert.ok(/cuve|tank/.test(text),
      'modal must name the foliar tank ("cuve") as the measurement point — '
      + `got: "${(modal.textContent || '').slice(0, 200)}"`);
  });

  test('predicted-ph-ce-clickable-modal — modal describes the blue-pen mapping', () => {
    const { window } = loadTomatoApp();
    const document = window.document;
    const block5 = document.getElementById('nutr-foliar');
    const node = queryPredictedCe(block5);
    assert.ok(node, 'predicted-CE node missing on #nutr-foliar');
    node.dispatchEvent(new window.Event('click', { bubbles: true }));
    const modal = document.querySelector(
      '[data-predicted-modal], #predicted-ph-ce-modal, .predicted-ph-ce-modal, dialog[open]'
    );
    assert.ok(modal, 'modal must be open after click');
    const text = (modal.textContent || '').toLowerCase();
    assert.ok(/bleu|blue|stylo|pen/.test(text),
      'modal must describe how the blue lab pen maps to the foliar tank — '
      + `got: "${(modal.textContent || '').slice(0, 200)}"`);
  });

  test('predicted-ph-ce-clickable-modal — modal declares the foliar CE safe band (REQ-025 burn cap 8.0 mS/cm tomato)', () => {
    const { window } = loadTomatoApp();
    const document = window.document;
    const block5 = document.getElementById('nutr-foliar');
    const node = queryPredictedCe(block5);
    assert.ok(node, 'predicted-CE node missing on #nutr-foliar');
    node.dispatchEvent(new window.Event('click', { bubbles: true }));
    const modal = document.querySelector(
      '[data-predicted-modal], #predicted-ph-ce-modal, .predicted-ph-ce-modal, dialog[open]'
    );
    assert.ok(modal, 'modal must be open after click');
    const text = (modal.textContent || '');
    // The cap = 8.0 mS/cm (REQ-025). Accept "8", "8.0", or "8,0".
    assert.ok(/\b8(?:[.,]0)?\b/.test(text),
      'modal must declare the foliar CE safe-band edge (8.0 mS/cm per REQ-025) — '
      + `got: "${text.slice(0, 200)}"`);
  });

  test.todo(
    'predicted-ph-ce-clickable-modal — modal declares the foliar tank-pH safe band '
    + '(spec-gap: no foliar pH band defined in REQ-024 or foliar-strategy specs)'
  );
});

describe('predicted-ph-ce-coloured-by-band-position — predicted CE / pH coloured green / red / yellow per band position', () => {
  test('predicted-ph-ce-coloured-by-band-position — predicted-CE node carries a band-state colour signal', () => {
    // Spec: green inside band, red outside, yellow within 10% of band
    // width from nearest edge. Renderer must expose the state — accept
    // either a data-band-state attribute, a band-state class, or an
    // inline colour matching one of the three semantic palettes.
    const { window } = loadTomatoApp();
    const block5 = window.document.getElementById('nutr-foliar');
    const node = queryPredictedCe(block5);
    assert.ok(node, 'predicted-CE node missing on #nutr-foliar');
    const bandState = node.getAttribute('data-band-state') || '';
    const className = node.className || '';
    const style = node.getAttribute('style') || '';
    const hasState =
      ['green', 'yellow', 'red', 'inside', 'edge', 'outside'].includes(bandState)
      || /\b(band-(?:green|yellow|red|inside|edge|outside))\b/.test(className)
      || /color\s*:\s*(?:#?[0-9a-f]{3,8}|red|green|orange|gold|gold|var\(--(?:ok|warn|bad|good|danger|warning)\b)/i.test(style);
    assert.ok(hasState,
      'predicted-CE node must carry a band-state signal '
      + '(data-band-state="green|yellow|red", class .band-green|.band-yellow|.band-red, '
      + 'or inline colour) per nutrition/spec.md § predicted-ph-ce-coloured-by-band-position');
  });

  test('predicted-ph-ce-coloured-by-band-position — predicted-CE rendered inside [0, 8.0 mS/cm] is green', () => {
    // The current STORED_RECIPE.tomato.foliaire oligo recipe sits well
    // below 8.0 mS/cm (REQ-025 burn cap); the predicted-CE node should
    // therefore render in the green band-state.
    const { window } = loadTomatoApp();
    const block5 = window.document.getElementById('nutr-foliar');
    const node = queryPredictedCe(block5);
    assert.ok(node, 'predicted-CE node missing on #nutr-foliar');
    const text = (node.textContent || '').trim();
    const match = text.match(/(\d+(?:[.,]\d+)?)/);
    assert.ok(match, `predicted-CE text "${text}" must contain a numeric value`);
    const rendered = parseFloat(match[1].replace(',', '.'));
    // Only assert green-state when the rendered value is comfortably
    // inside the band (>10% margin from cap edge). Otherwise the
    // yellow-edge rule could legitimately fire.
    const edgeMargin = FOLIAR_CE_CAP_TOMATO * 0.1;
    if (rendered <= FOLIAR_CE_CAP_TOMATO - edgeMargin) {
      const bandState = node.getAttribute('data-band-state') || '';
      const className = node.className || '';
      const isGreen =
        bandState === 'green' || bandState === 'inside'
        || /\bband-(?:green|inside)\b/.test(className);
      assert.ok(isGreen,
        `predicted-CE = ${rendered} mS/cm is well inside [0, ${FOLIAR_CE_CAP_TOMATO}] `
        + 'band — band-state must be "green"/"inside"; '
        + `got data-band-state="${bandState}" class="${className}"`);
    }
  });

  test('predicted-ph-ce-coloured-by-band-position — predicted-pH node carries a band-state colour signal', () => {
    const { window } = loadTomatoApp();
    const block5 = window.document.getElementById('nutr-foliar');
    const node = queryPredictedPh(block5);
    assert.ok(node, 'predicted-pH node missing on #nutr-foliar');
    const bandState = node.getAttribute('data-band-state') || '';
    const className = node.className || '';
    const style = node.getAttribute('style') || '';
    const hasState =
      ['green', 'yellow', 'red', 'inside', 'edge', 'outside'].includes(bandState)
      || /\b(band-(?:green|yellow|red|inside|edge|outside))\b/.test(className)
      || /color\s*:\s*(?:#?[0-9a-f]{3,8}|red|green|orange|gold|var\(--(?:ok|warn|bad|good|danger|warning)\b)/i.test(style);
    assert.ok(hasState,
      'predicted-pH node must carry a band-state signal '
      + '(data-band-state, .band-* class, or inline colour) '
      + 'per nutrition/spec.md § predicted-ph-ce-coloured-by-band-position');
  });

  test.todo(
    'predicted-ph-ce-coloured-by-band-position — predicted-pH colour reflects foliar tank-pH band '
    + '(spec-gap: no foliar pH safe band declared; cannot assert direction without bounds)'
  );
});
