# Tomate — foliar-strategy — procedure

## Problem

The foliar-strategy model gives per-recipe weekly spray counts, but no per-day assignment. The operator surface can't be rendered without a deterministic schedule that maps counts onto farm working days.

## Solution

A pure procedure consumes the model's per-recipe counts plus `nutrition — farm-working-days` and produces a per-day assignment over the week. Sprays spread evenly; multi-recipe days only emerge when counts exceed available working days.

---

## weekly-calendar-derived-from-model

For the current stage, the procedure consumes per-recipe weekly
counts from the foliar-strategy model (`nutrition/tomato/foliar-strategy/model — frequency-is-model-output`)
and the farm working days set (`nutrition — farm-working-days`)
and produces a per-day assignment over the week.

---

## spread-evenly-no-stacking

Spray assignments spread sprays evenly across farm working days.
Two recipes may share a day only when the total count of sprays
exceeds the number of available farm working days; until that
threshold, each spray sits on its own day.

---

## one-recipe-per-spray

Each spray on the calendar names exactly one recipe. Multi-recipe
days carry one calendar entry per recipe — no merged labels.

---

## no-operator-day-override

The procedure surface displays the calendar read-only. Operator
day-of-week overrides are out of scope for this subproject; if a
farm-working-day shift is needed, edit the `nutrition — farm-working-days`
data and the calendar recomputes.

---

## Out of Scope

- Operator day override — calendar is read-only on the operator surface; farm working days are the only adjustable axis (see `no-operator-day-override`).
- Multi-recipe merged labels — each spray names exactly one recipe (see `one-recipe-per-spray`).
