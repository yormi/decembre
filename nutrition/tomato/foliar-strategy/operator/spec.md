# Tomate — foliar-strategy — operator

Operator-facing surface for the foliar program. Two views:
**recipe sheet** (per-recipe weighing instructions) and
**weekly calendar** (which recipe to spray which day).

---

## recipe-sheet-per-recipe

The recipe sheet renders one block per foliar recipe currently
in the strategy. Each block shows the product list with weighing
quantities for one tank, predicted CE, predicted tank pH, and
the recipe's surfactant requirement (yes / no).

---

## weekly-calendar-rendered

The weekly calendar renders the per-day assignments produced by
`nutrition/tomato/foliar-strategy/procedure — weekly-calendar-derived-from-model`.
Each calendar slot names the recipe to spray that day and links
to the recipe block on the same page.

---

## no-frequency-input

The surface carries no spray-count input, no day-picker, no
recipe-on / recipe-off toggle. The model decides what gets
sprayed and when; the operator surface is read-only on those
axes. Operator inputs that DO appear (e.g. tissue-read feedback
fields) are scoped to upstream model inputs, not strategy
overrides.
