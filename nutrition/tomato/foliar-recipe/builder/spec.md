# Tomate — foliar-recipe — builder

UI invariants for the foliar block on the Tomato Nutrition admin page
(Block 5 / Block 6 — "Foliaire (micros)"). Reads from the foliar-recipe
model (`*/foliar-recipe/model/spec.md`). Page chrome / header / drift
block in `nutrition/tomato/shell/spec.md`.

---

## REQ-113 — Block 5 exposes `sprayCount` and `surfactant` inputs

**Statement:** Block 5 (Foliaire) renders two operator inputs at the top
of the card body:

- `nutr-foliar-spray-count` — `<input type="number">`, default `1`,
  min `1`, max `3`, step `1`.
- `nutr-foliar-surfactant` — `<input type="checkbox">`, default unchecked.

Both ids are present in the `app/index.html` input-listener wiring so
changes trigger `buildNutriment` re-render.

---

## REQ-114 — Block 5 reactive to spray count + surfactant changes

**Statement:** Mutating `nutr-foliar-spray-count` or toggling
`nutr-foliar-surfactant` re-renders Block 5 with new per-element
delivered numbers. The supply path passes the inputs through to
`window.FoliarRecipeTomato.computeFoliarSupply(stage, { sprayCount, surfactant })`.

---

## REQ-163 — Foliar Efficacité reactive to surfactant lever

The Efficacité column on the foliar contribution block updates when the operator toggles the surfactant lever in Block 5. With surfactant engaged, foliar efficiency for routed elements is higher than without.
