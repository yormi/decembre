// Fertigation-recipe — source data.
//
// Spec:        nutrition/tomato/fertigation-recipe/spec.md
// Derivation:  nutrition/tomato/fertigation-recipe/derivation.md
//
// Fertigation is the liquid replenishment of K, Mg, and B (Solubor /
// disodium octaborate tetrahydrate, 20.5 % B) at the dripper per tomato
// stage. computeStageRecipe(stage) returns { kSulfate, mgSulfate, solubore }
// in grams of product per total tomato area
// (TOMATO_NUMBER_BEDS × TOMATO_BED_AREA = 7 × 54.7 = 382.9 m²) per week.

// ─── MIXING_FACTOR retired 2026-05-10 ───────────────────────────────────
// Previously this file declared MIXING_FACTOR_FERT_STORED = 0.5 and
// MIXING_FACTOR_FERT_FP = 1.0 (mode-aware split, added
// 2026-05-05). The concept has been retired: fertigation supply is now
// reported at the full barrel-loaded mass per m²/sem, in both modes. SME
// is reported as a separate channel; users compare them rather than
// blending. The 0.5 stored-mode discount was a cert 2-3 guess and the
// double-count framing was artificial. Mode-aware split deleted; never reuse the
// number.

// ─── FIRST_PRINCIPLES_T5_FERTIGATION — T5-only refined target ───────────
//
// Canonical product-keyed shape for the T5 fertigation FP target. K2SO4
// and MgSO4-7H2O values are placeholders ONLY — they are overwritten at
// boot by wireFpFertigation() in calc.js from computeStageRecipe('T5')
// output (single source of truth = the mass-balance derivation mass-balance-derivation).
// Solubore is hand-coded because B is the one micro on fertigation by
// single-channel design (single-fertigation-tank-per-week) and is not in the computeStageRecipe
// surface.
//
// Solubore 9 g dose: 9 × 0.205 / 382.9 × 1000 = 4.82 mg B/m²/sem = 107 % T5
// demand. Foliaire B = 0 (fertigation owns B). Ecocert validated 2026-05-08.
// Cert 3 dose, cert 1-2 demand.
//
// PA Taillon's April 2026 anchor (K 5167 / Mg 1379) is the agronomist
// recommendation for the FP target (NOT for STORED — STORED.T5.kSulfate
// has been Haifa-heritage 3489 g since the 2026-05-09 commit and has
// never carried PA Taillon values). Live FP values at boot are
// K ≈ 5568 / Mg ≈ 1963 / Solubore 11 / NaMolybdate 0.5
// (computeStageRecipe('T5'), post-mass-balance-derivation restoration + uptake-efficiency-factor uptake
// factor + single-fertigation-tank-per-week Mo carve-out). See `learnings.md` for the full
// calibration history including the 2026-05-12 amendment cycle.
//
// fp-target-mirrors-sizer pins the invariant: this constant's K2SO4 / MgSO4-7H2O values
// equal computeStageRecipe('T5') output by construction at boot.
const FIRST_PRINCIPLES_T5_FERTIGATION = {
  'K2SO4':       0,    // populated at boot from computeStageRecipe('T5').kSulfate
  'MgSO4-7H2O':  0,    // populated at boot from computeStageRecipe('T5').mgSulfate
  'Solubore':    0,    // populated at boot from computeStageRecipe('T5').solubore
  'NaMolybdate': 0.5,  // populated at boot from computeStageRecipe('T5').naMolybdate (single-fertigation-tank-per-week Mo carve-out 2026-05-16, flat 0.5 g/wk)
};

// ─── PH_UPTAKE_FACTOR_AT_CURRENT_SOIL — bed → plant transfer efficiency ──
//
// Per-element fraction of bed-released ions that the plant actually takes up,
// at current Décembre soil chemistry (pH 6.5, bed EC 1:1 9 July 2026; Ca
// 10 989 kg/ha — Ca-saturation persists, it's structural not pH-driven). Models the
// gap between "released to bed" and "taken up by plant" due to root-zone
// effects independent of channel of delivery — applies uniformly to compost,
// sidedress, and fertigation bed sources. Multiplies plant demand in
// computeStageRecipe to inflate the bed-side target: deliver enough that
// uptake = demand after the bed→plant discount.
//
// uptake-efficiency-factor. See derivation.md for per-element reasoning; learnings.md for
// the literature basis. Refinement trigger lands in derivation.md: tissue
// petiole correlation ±20 % bumps cert 2 → 3; ±10 % bumps to 4.
const PH_UPTAKE_FACTOR_AT_CURRENT_SOIL = {
  K:  0.90,   // cert 2 — Ca-K cation competition on Ca-saturated CEC; 5-15 % literature discount, mid-band 10 %
  Mg: 0.85,   // cert 2 — Ca-Mg competition (Mg²⁺ loses to Ca²⁺ at root membrane) + dripper-bed equilibration; 10-25 % range, mid 15 %
  B:  0.80,   // cert 2 — soil B adsorption in Ca-rich beds at pH > 7 (Fe/Al oxides + Ca-borate complexes); 15-25 % range, mid 20 %
  Mn: 1.00,   // cert 1 — bed→plant micro uptake not separately discounted; the sulfate-metal pH curve (channel→bed, 0.75 at pH 6.5) carries the loss. Placeholder 1.0 pending tissue correlation (2026-07-11). Fe absent — soil-covered, not fertigated (channel-role Fe = passive)
  Zn: 1.00,   // cert 1 — idem
};

// Per-element efficiency for the Efficacité column (channel-efficiency-capability-map) — share of
// applied fertigation-product mass that reaches the bed as plant-available
// form per applied gram, under current soil pH 6.5 chemistry. This is the
// channel → bed axis (dripper-line chemistry); the bed → plant uptake
// inefficiency is a separate axis declared in PH_UPTAKE_FACTOR_AT_CURRENT_SOIL
// above (uptake-efficiency-factor).
//
// Values reflect the PH_RESPONSE curves at current Décembre tomato-block
// soil pH 6.5 (bed EC 1:1, 9 July 2026, 7-bed average, range 6.1-6.8):
//   K  (K2SO4 → 'soluble-cation' class): 1.0 (no penalty below pH 7.0)
//   Mg (MgSO4-7H2O → 'soluble-cation' class):                       1.00
//   B  (Solubor disodium octaborate → 'borate' class, non-ionic):   1.00
//   Mo (sodium molybdate → 'molybdate' class, anion):               1.00
//   Mn/Zn (sulfate salts → 'sulfate-metal' class): 1.0 − 0.50×(6.5−6.0)
//       = 0.75 (was 0.10 at pH 7.4 — lockout). Rendus au canal 2026-07-11
//       quand le pH sol est repassé sous 7,0. Fe exclu — sol le couvre
//       (310 ppm, tissu suff) + FeSO₄ s'oxyde dans la cuve 5 jours → passif.
//
// Cert 4 — pH curves are well-characterized (`sulfate-metal` / `soluble-cation`
// curves at cert 4 in PH_RESPONSE source); current bed pH is cert 3 (bed EC
// 1:1 method, operator-measured, not yet SME-lab-confirmed). Refinement
// triggers in derivation.md; next Berger SME re-sources the micro side.
//
// Elements absent from the map (N / P / Ca / Cu) are not routed by the
// fertigation channel under STORED — N to sidedress, Ca not fertigated
// (soil-saturated), P drawn down via soil bank, Cu foliar-routed but unfed.
const FERTIGATION_EFFICIENCY_AT_CURRENT_SOIL = {
  K:  1.00,   // soluble-cation curve at pH 6.5: no penalty below 7.0 (1.0 − 0.15×max(0,6.5−7.0)); was 0.94 at pH 7.4
  Mg: 1.00,   // idem
  B:  1.00,
  Mo: 1.00,
  Mn: 0.75,   // sulfate-metal curve at pH 6.5: 1.0 − 0.50×(6.5−6.0) = 0.75; was 0.10 at pH 7.4 (lockout). Rendu au canal 2026-07-11
  Zn: 0.75,   // idem
  // Fe absent — soil-covered at 6.5 + FeSO₄ oxidizes in the 5-day tank; routed passive (channel-role Fe), not fertigated.
};
