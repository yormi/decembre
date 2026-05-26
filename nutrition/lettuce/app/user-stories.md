# Nutrition — Salanova — app UI specs

UI invariants for the Salanova Nutrition admin subpage. Crop-side recipe
specs live in `nutrition/lettuce/spec.md`; chemistry / cross-crop rules
in `nutrition/spec.md`; model-side demand/supply in
`nutrition/lettuce/plant-needs/spec.md`.

---

## bilan-header-inputs-are-five-scalars

The Salanova Bilan accepts exactly five operator inputs in the header
card: `transplantG` (g/head), `targetG` (g/head), `cycleDays` (days),
`density` (plants/m²), `phLocked` (boolean). Every other displayed
number is derived from these + source-of-truth constants. No
front-load input — the weekly feather-meal rate ships as a planted-in
default and is not weekly-tuned by the operator.

---

## plant-need-block-demand-source

The Salanova plant-need block reads its per-element demand by calling
`window.PlantNeedsLettuce.calculateLettuceNutritionDemand(transplantG,
targetG, cycleDays, density)`. No bare-global access to
`LETTUCE_TISSUE_DW` or `LETTUCE_DM_FRACTION` in the plant-need block
render path.

---

## plant-need-row-two-columns

Each row in the Salanova plant-need block displays exactly 2 columns:
element symbol and total weekly demand (mg/m²/wk). No fruit/biomass
split — Salanova demand has no flowering transition and is monotonic
in mass gain per `nutrition/lettuce/plant-needs/spec.md`.

---

## plant-need-row-opens-pourquoi-modal

Every element in `LETTUCE_TISSUE_DW` is rendered as a clickable row in
the Salanova plant-need block. Clicking a row opens the pourquoi modal
showing **exactly three pieces of content**:

1. The cert badge for the element (cert 4 macros, cert 3 micros — per
   `nutrition/lettuce/plant-needs/spec.md`).
2. The demand equation (formula symbolically — `demand[el] = …`).
3. The plugged-in numbers (formula with current values substituted).

No interpretation prose, no per-element rationale paragraphs, no
tissue-test caveats — those live in
`nutrition/lettuce/plant-needs/derivation.md`.

---

## plant-need-reactive-to-header-inputs

Mutating any of the four demand-side header inputs (`transplantG`,
`targetG`, `cycleDays`, `density`) re-renders the Salanova plant-need
block with new per-element numbers. The `phLocked` toggle is
supply-side per `nutrition/lettuce/plant-needs/spec.md` and does not
enter the demand block render.
