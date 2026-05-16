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
// Canonical product-keyed shape for the T5 fertigation FP target. K2SO4
// and MgSO4-7H2O values are placeholders ONLY — they are overwritten at
// boot by wireFpFertigation() in calc.js from computeStageRecipe('T5')
// output (single source of truth = the mass-balance derivation REQ-098).
// Solubore is hand-coded because B is the one micro on fertigation by
// single-channel design (REQ-061) and is not in the computeStageRecipe
// surface.
//
// Solubore 9 g dose: 9 × 0.205 / 382.9 × 1000 = 4.82 mg B/m²/sem = 107 % T5
// demand. Foliaire B = 0 (fertigation owns B). Ecocert validated 2026-05-08.
// Cert 3 dose, cert 1-2 demand.
//
// PA Taillon's April 2026 anchor (K 5167 / Mg 1379) is retired legacy —
// see `learnings.md` for the calibration history. Live values at boot are
// K ≈ 5537 / Mg ≈ 3320 (computeStageRecipe('T5'), no compost subtraction
// per REQ-098 amended 2026-05-12).
//
// REQ-154 pins the invariant: this constant's K2SO4 / MgSO4-7H2O values
// equal computeStageRecipe('T5') output by construction at boot.
const FIRST_PRINCIPLES_T5_FERTIGATION = {
  'K2SO4':       0,   // populated at boot from computeStageRecipe('T5').kSulfate
  'MgSO4-7H2O':  0,   // populated at boot from computeStageRecipe('T5').mgSulfate
  'Solubore':    0,   // populated at boot from computeStageRecipe('T5').solubore
};

// ─── PH_UPTAKE_FACTOR_AT_CURRENT_SOIL — bed → plant transfer efficiency ──
//
// Per-element fraction of bed-released ions that the plant actually takes up,
// at current Décembre soil chemistry (pH 7.28, Ca 10 989 kg/ha). Models the
// gap between "released to bed" and "taken up by plant" due to root-zone
// effects independent of channel of delivery — applies uniformly to compost,
// sidedress, and fertigation bed sources. Multiplies plant demand in
// computeStageRecipe to inflate the bed-side target: deliver enough that
// uptake = demand after the bed→plant discount.
//
// REQ-155. See derivation.md for per-element reasoning; learnings.md for
// the literature basis. Refinement trigger lands in derivation.md: tissue
// petiole correlation ±20 % bumps cert 2 → 3; ±10 % bumps to 4.
const PH_UPTAKE_FACTOR_AT_CURRENT_SOIL = {
  K:  0.90,   // cert 2 — Ca-K cation competition on Ca-saturated CEC; 5-15 % literature discount, mid-band 10 %
  Mg: 0.85,   // cert 2 — Ca-Mg competition (Mg²⁺ loses to Ca²⁺ at root membrane) + dripper-bed equilibration; 10-25 % range, mid 15 %
  B:  0.80,   // cert 2 — soil B adsorption in Ca-rich beds at pH > 7 (Fe/Al oxides + Ca-borate complexes); 15-25 % range, mid 20 %
};
