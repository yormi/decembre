# Tomate — foliar-strategy — builder

## Problem

The foliar block on the admin page needs a single operator-level lever — surfactant on / off — that reactively rewrites all per-element delivered numbers and the Efficacité column without manual recompute.

## Solution

Block 5 / 6 ("Foliaire") on the Tomato Nutrition admin page renders one operator input (surfactant checkbox) that propagates through `window.FoliarRecipeTomato.computeFoliarSupply` to drive contribution numbers and Efficacité reactively. Reads from the foliar-strategy model (`*/foliar-strategy/model/spec.md`). Page chrome / header / drift block in `nutrition/tomato/shell/spec.md`.

---

## surfactant-input

Block 5 renders one operator input at the top of the card body:

- `nutr-foliar-surfactant` — `<input type="checkbox">`, default
  unchecked.

The id is present in `app/index.html` input-listener wiring so
toggling triggers `buildNutriment` re-render. The spray-count
input retired 2026-05-24 (frequency is now a model output, see
`nutrition/tomato/foliar-strategy — frequency-is-model-output`).

---

## block-5-reactive-to-surfactant

Toggling `nutr-foliar-surfactant` re-renders Block 5 with new
per-element delivered numbers. The supply path passes the lever
through to `window.FoliarRecipeTomato.computeFoliarSupply(stage, { surfactant })`.

---

## efficacite-reactive-to-surfactant

The Efficacité column on the foliar contribution block updates
when the operator toggles the surfactant lever in Block 5. With
surfactant engaged, foliar efficiency for routed elements is
higher than without.

---

## Out of Scope

- Spray-count input — retired 2026-05-24; frequency is now a model output (see `nutrition/tomato/foliar-strategy — frequency-is-model-output`).
- Day-picker / recipe-on-off toggles on the builder — model owns recipe and frequency selection.
