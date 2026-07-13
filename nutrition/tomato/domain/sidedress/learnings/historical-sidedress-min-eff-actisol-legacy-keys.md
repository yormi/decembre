# Historical: SIDEDRESS_MIN_EFF / `Actisol_P` / `Actisol_K` legacy keys

`SIDEDRESS_MIN_EFF` is a derived backwards-compat view kept because
`app/index.html` consumers (`calcNutrSupply`, `computeStageRecipe`,
`additionFor`) still read the legacy keys directly. `Actisol_P` (0.50)
and `Actisol_K` (0.85) efficiencies retained for the same reason —
Actisol itself is gated out at runtime but its `eff` entries remain
referenced.
