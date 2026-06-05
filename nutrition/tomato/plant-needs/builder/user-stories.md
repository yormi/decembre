# Tomate — plant-needs — builder

UI invariants for the plant-needs block on the Tomato Nutrition admin
page (Block 1 — "Besoin du plant"). Reads from the plant-needs model
(`*/plant-needs/model/spec.md`). Page chrome / header / drift block in
`nutrition/tomato/shell/spec.md`.

---

## block-1-demand-from-plant-needs-tomato

Block 1 reads its per-element demand by calling
`window.PlantNeedsTomato.calcNutrDemand(target, stage, transpFactor)`.
No bare-global access to `BIOMASS_DEMAND` or `TOMATO_FRUIT_EXPORT` in
the Block 1 render path.

---

## block-1-row-opens-pourquoi-modal

Every element key in `PN.TOMATO_FRUIT_EXPORT` is rendered as a
clickable row in `#nutr-needs`. Clicking a row opens the pourquoi
modal showing **exactly three pieces of content**:

1. The cert badge for `(stage, el)` via `PN.certFor(stage, el)`.
2. The demand equation (formula symbolically — `demand[el] = …`).
3. The plugged-in numbers (formula with current values substituted).

No interpretation prose, no per-element rationale paragraphs, no
tissue-test caveats, no transpiration-coupling notes — those live in
`nutrition/tomato/plant-needs/derivation.md`.

---

## block-1-reactive-to-target-and-stage

Changing `nutr-target` or activating a different stage button
re-renders Block 1 with new per-element numbers.

---

## block-1-row-four-columns

Each row in `#nutr-needs` displays 4 columns: element symbol,
fruit-export term (mg/m²/wk), biomass term (mg/m²/wk), total
(mg/m²/wk). Numbers come from `PN.calcNutrDemand(...)` returning the
`{fruit, biomass, total}` shape per element.
