# Tomate — foliar-strategy — procedure

Generates the weekly spray calendar from the model output. The
calendar lists, for each farm working day in the current week,
which recipe (if any) is sprayed that day.

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
