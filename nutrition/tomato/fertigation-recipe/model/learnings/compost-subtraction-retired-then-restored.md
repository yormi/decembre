# Compost subtraction in K/Mg mass-balance — retired 2026-05-12, restored 2026-05-15

## Compost subtraction in K/Mg mass-balance — retired 2026-05-12, restored 2026-05-15

REQ-098 amended 2026-05-12 to drop compost release from K/Mg mass-balance: `computeStageRecipe(stage)` replenished FULL plant offtake (fruit export + biomass), sidedress credited on K only, Mg pure offtake. Compost contribution tracked separately as soil-bank input in `nutrition/compost-contribution/spec.md`. Reverted 2026-05-15 (see B1-REV cycle above). Prior formula preserved for audit + future re-evaluation.

### Prior formula (with compost subtraction)

```
totalArea_m2          = TOMATO_NUM_BEDS × TOMATO_BED_AREA  // 7 × 54.7 = 382.9 m²
compost_K_mg/m²/wk    = CompostContribution.releasePerWeek.K × 1000
compost_Mg_mg/m²/wk   = CompostContribution.releasePerWeek.Mg × 1000

// ── K ──
k_offtake_mg/m²/wk    = TOMATO_FRUIT_EXPORT.K × stageYield × 1000 + BIOMASS_DEMAND[stage].K
k_sidedress_mg/m²/wk  = STORED_RECIPE.tomato.sidedress[stage].actisol_g
                         × PRODUCT_PCT.Actisol_K × SIDEDRESS_MIN_EFF.K × 1000
                         / SIDEDRESS_AREA_PER_PLANCHE
k_needed_mg/m²/wk     = max(0, k_offtake − k_sidedress − compost_K)
kSulfate_g_total      = round(k_needed / 1000 / PRODUCT_PCT.K2SO4_K × totalArea_m2)

// ── Mg ──
mg_offtake_mg/m²/wk   = TOMATO_FRUIT_EXPORT.Mg × stageYield × 1000 + BIOMASS_DEMAND[stage].Mg
mg_needed_mg/m²/wk    = max(0, mg_offtake − compost_Mg)   // sidedress carries no Mg
mgSulfate_g_total     = round(mg_needed / 1000 / PRODUCT_PCT.MgSO4_Mg × totalArea_m2)
```

Prior `calc.js` body:

```js
function computeStageRecipe(stage) {
  const y = RECIPE_INPUTS.stageYield[stage] || 0;
  const totalArea = TOMATO_NUM_BEDS * TOMATO_BED_AREA;
  const sd = STORED_RECIPE.tomato.sidedress[stage] || { actisol_g: 0, farine_g: 0 };
  const biomass = BIOMASS_DEMAND[stage] || {};
  const compost = window.CompostContribution.releasePerWeek;

  // K offtake − sidedress − compost
  const k_offtake_mg = (TOMATO_FRUIT_EXPORT.K.g * 1000 * y) + (biomass.K || 0);
  const k_sd_mg = (sd.actisol_g * PRODUCT_PCT.Actisol_K
                   * (SIDEDRESS_MIN_EFF.K || 0.85) * 1000)
                   / SIDEDRESS_AREA_PER_PLANCHE;
  const k_compost_mg = (compost.K || 0) * 1000;
  const k_needed_mg_per_m2 = Math.max(0, k_offtake_mg - k_sd_mg - k_compost_mg);
  const kSulfate = Math.round((k_needed_mg_per_m2 / 1000 / PRODUCT_PCT.K2SO4_K) * totalArea);

  // Mg offtake − compost (no sidedress contribution)
  const mg_offtake_mg = (TOMATO_FRUIT_EXPORT.Mg.g * 1000 * y) + (biomass.Mg || 0);
  const mg_compost_mg = (compost.Mg || 0) * 1000;
  const mg_needed_mg_per_m2 = Math.max(0, mg_offtake_mg - mg_compost_mg);
  const mgSulfate = Math.round((mg_needed_mg_per_m2 / 1000 / PRODUCT_PCT.MgSO4_Mg) * totalArea);

  return { mgSulfate, kSulfate };
}
```

### Policy-vs-implementation drift history

2026-05-07 framing comment ("COMPOST IS NOT SUBTRACTED") expressed policy direction: replenish full offtake, treat compost as margin-of-safety bank. Intent: avoid silent under-feeding when compost ages out (Mg cert 1-2, no label data, finite 18-24 mo).

Implementation lagged 2026-05-07 → 2026-05-12 — code still subtracted compost. Downstream consumers (Block 7 stored-vs-FP gauge, `calcNutrSupply` fp mode, REQ-013/014 supply bounds, REQ-024 predictedCE) calibrated against WITH-subtraction values:

- T5 K: offtake 6 000 − sidedress 0 − compost 400 = 5 600 mg/m²/wk → K₂SO₄ 5 167 g (matched PA Taillon anchor by construction).
- T5 Mg: offtake 855 − compost 500 = 355 mg/m²/wk → MgSO₄·7H₂O 1 379 g (matched PA Taillon anchor by construction).

Asymmetry with `computeStageSidedress` (subtracts compost for N) was intentional — N channel and K/Mg channel extracted at different policy-evolution points.

### Reconciliation outcome (2026-05-12)

Drift-period plan ("bundle no-compost-subtraction with PA Taillon refit") was superseded: REQ-098 amended to remove subtraction in spec + `calc.js`; PA Taillon `FP_RECIPE_T5.fertigation` anchor (5 167 / 1 379) kept fixed. Drift between bare mass-balance output (5 322 / 3 319 at T5) and anchor framed as normal field correction at Block 7 gauge.

### Why this is preserved

Compost-subtraction policy carried calibration weight against REQ-014 supply bound (T4/T5 Mg), REQ-024 predictedCE (T2), and PA Taillon T5 anchor's mass-balance correspondence. If future tissue data motivates re-introducing an explicit compost credit, prior formula + relationships above are the starting point. Re-introduction would require: (a) tissue Mg panels confirming luxury accumulation under full-offtake policy, (b) refresh of REQ-014 / REQ-024 calibration against restored formula, (c) refit (or explicit drift framing) of PA Taillon T5 anchor.
