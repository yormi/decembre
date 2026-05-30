# Supply belongs in plant-needs? — accepted with watch

Strict mirror of `nutrition/tomato/plant-needs/` would keep plant-needs to
the demand side only and split supply into a sibling subproject (e.g.
`nutrition/lettuce/fertigation-recipe/` or `nutrition/lettuce/supply/`).

Carve-out 2026-05-16 shipped supply inside plant-needs per the F1 challenger
request's explicit action list. Reasonable today because:
- Lettuce supply is a single function (vs tomato's multi-channel recipe
  cascade across 3+ subprojects).
- The function is pure with all dependencies injected — moving it sideways
  later is a file-shuffle, not a re-design.

Watch: if lettuce gains a foliar program (yucca-return triggers a foliar
spray) or the supply function grows mode-dispatch logic, split into
`nutrition/lettuce/fertigation-recipe/` mirroring the tomato shape.
