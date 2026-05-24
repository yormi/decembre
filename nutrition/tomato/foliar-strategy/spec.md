# Tomate — foliar-strategy

Subproject-level spec for the tomato foliar program. Vocabulary
lives in `CONTEXT.md` (foliar strategy, foliar recipe, spray,
weekly leaf-tolerance cap, farm working days).

Layer specs:

- `model/spec.md` — recipe contracts + per-element delivery +
  weekly cadence selection
- `builder/spec.md` — Tomato Nutrition admin block (Block 5 / 6)
- `procedure/spec.md` — weekly spray calendar generation
- `operator/spec.md` — operator-facing recipe sheet + calendar

---

## strategy-contains-recipes

A foliar strategy comprises one or more foliar recipes. Each
recipe is one tank's mix and is REQ-029-clean: ions within a
single recipe must not precipitate in-tank. Different recipes
may be sprayed back-to-back on the same day in separate tanks
(REQ-029 governs in-tank, not in-canopy).

---

## frequency-is-model-output

The number of times each recipe is sprayed per week is computed
by the model, not entered by the operator. Inputs to the model:
per-element gaps, per-recipe delivery, per-recipe leaf-tolerance
cap, farm working days set. Outputs: per-recipe weekly count +
day assignments. Operator-side UI for setting `sprayCount` is
retired.

---

## sprays-spread-across-farm-working-days

Recipe sprays are spread evenly across the set of farm working
days defined at `nutrition — farm-working-days`. The model
picks specific day assignments; operator does not override on
the procedure surface.
