# What got extracted from `app/index.html` into this subproject

## What got extracted from `app/index.html` into this subproject (2026-05-XX)

- `FP_RECIPE_T5.fertigation` values (`K2SO4: 5167`, `MgSO4-7H2O: 1379`, `Solubore: 9`) — moved to `data.js` as `FIRST_PRINCIPLES_T5_FERTIGATION`, populated by `wireFpFertigation()` IIFE from `computeStageRecipe('T5')` at boot.
- `MIXING_FACTOR_FERT` — retired 2026-05-10 (see above).
- `computeStageRecipe(stage)` — moved to `calc.js`.
- `wireFpFertigation()` — new IIFE in `calc.js` overwriting `FP_RECIPE_T5.fertigation` from `data.js` + recomputed T5 mass-balance. Mirrors `wireFpSidedress()`.

Left in place: `FP_RECIPE_T5` const declaration (parent object shared across fertigation/sidedress/foliar wire-IIFEs), `STORED_RECIPE.tomato.fertigation` (operational, `/retire-recipe` governed), `LUXURY_FACTOR` (supply-side, next to `calcNutrSupply`), `RECIPE_INPUTS` (shared model inputs).
