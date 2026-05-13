// Fertigation-recipe — source data.
//
// Spec:        nutrition/tomato/fertigation-recipe/spec.md
// Derivation:  nutrition/tomato/fertigation-recipe/derivation.md
//
// Fertigation is the liquid replenishment of K, Mg, and B (boric acid) at
// the dripper per tomato stage. computeStageRecipe(stage) returns
// { kSulfate, mgSulfate } in grams of product per total tomato area
// (TOMATO_NUM_BEDS × TOMATO_BED_AREA = 7 × 54.7 = 382.9 m²) per week.

// ─── MIXING_FACTOR retired 2026-05-10 ───────────────────────────────────
// Previously this file declared MIXING_FACTOR_FERT_STORED = 0.5 and
// MIXING_FACTOR_FERT_FP = 1.0 (REQ-100, mode-aware split, added
// 2026-05-05). The concept has been retired: fertigation supply is now
// reported at the full barrel-loaded mass per m²/sem, in both modes. SME
// is reported as a separate channel; users compare them rather than
// blending. The 0.5 stored-mode discount was a cert 2-3 guess and the
// double-count framing was artificial. REQ-100 deleted; never reuse the
// number.

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
