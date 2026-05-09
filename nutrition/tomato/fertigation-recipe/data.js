// Fertigation-recipe — source data.
//
// Spec:        nutrition/tomato/fertigation-recipe/spec.md
// Derivation:  nutrition/tomato/fertigation-recipe/derivation.md
//
// Fertigation is the liquid replenishment of K, Mg, and B (boric acid) at
// the dripper per tomato stage. computeStageRecipe(stage) returns
// { kSulfate, mgSulfate } in grams of product per total tomato area
// (TOMATO_NUM_BEDS × TOMATO_BED_AREA = 7 × 54.7 = 382.9 m²) per week.

// ─── MIXING_FACTOR — mode-aware (REQ-100) ───────────────────────────────
//
// Drip irrigation delivers liquid solution to the active root zone; ~half
// is absorbed by roots before the solution mixes with the bulk soil pool.
// The other half joins the soil pool and is captured in the next SME
// reading.
//
// In `stored` mode, supply.soil is computed from SME × transpiration
// (mass-flow potential) — SME already contains last week's fertigation
// residue, so summing the full barrel on top would double-count. The 0.5
// factor estimates the *additional* fraction this week beyond what SME
// already reflects.
//
// In `fp` mode (mass-balance pure, 2026-05-08 philosophy shift), supply.soil
// is dropped for fertigation-deliverable elements (K, Mg, B, N, Fe, Mn, Zn,
// Cu, Mo) — only Ca and P keep their SME credit. With no SME credit, no
// double-count risk; the full barrel counts as fresh supply, factor = 1.0.
//
// Mechanism cert 3. Specific 0.5 value cert 2-3 — operational reasoning,
// no measured anchor at Décembre yet.

const MIXING_FACTOR_FERT_STORED = 0.5;
const MIXING_FACTOR_FERT_FP     = 1.0;

// Legacy alias: `calcNutrSupply` reads `MIXING_FACTOR_FERT` directly via
// `(mode === 'fp') ? 1.0 : MIXING_FACTOR_FERT`. Keeping the name as an
// alias to MIXING_FACTOR_FERT_STORED preserves that call site verbatim
// — no consumer edits needed, and the mode-awareness is now wired through
// the two named constants for verifier visibility (REQ-100).
const MIXING_FACTOR_FERT = MIXING_FACTOR_FERT_STORED;

// ─── FIRST_PRINCIPLES_T5_FERTIGATION — T5-only refined target ───────────
//
// PA Taillon April 2026 fertigation anchor for tomatoes — three products:
//   K2SO4         5 167 g (cert 3): mass-balance T5 — replenishes offtake K
//                                  (6 000 mg/m²/sem ÷ 0.415 × 382.9 m² ÷ 1000)
//   MgSO4-7H2O    1 379 g (cert 3): mass-balance T5 — replenishes offtake Mg
//                                  (355 mg/m²/sem ÷ 0.0986 × 382.9 ÷ 1000;
//                                  legacy comment refs an old compost-credited
//                                  value — current derivation is offtake-only,
//                                  no compost subtraction; see derivation.md)
//   Solubore          9 g (cert 3 dose, cert 1-2 demand): boric acid non-ionic,
//                                  100% efficiency at pH 7,4 (REQ-018 OK).
//                                  9 × 0.205 / 382.9 × 1000 = 4.82 mg/m²/sem
//                                  = 107% T5 demand. Foliaire B = 0
//                                  (single-channel: fertigation owns B,
//                                  REQ-061). Ecocert validated 2026-05-08.
//
// Wired into FP_RECIPE_T5.fertigation by wireFpFertigation() in calc.js at
// script load. Single source of truth = this constant. To re-tune the T5
// target, edit here, not in app/index.html.
const FIRST_PRINCIPLES_T5_FERTIGATION = {
  'K2SO4':       5167,   // mass-balance T5 — replenishes offtake K
  'MgSO4-7H2O':  1379,   // mass-balance T5 — replenishes offtake Mg
  'Solubore':       9,   // boric acid non-ionic, 100% eff at pH 7,4 — sole B channel
};
