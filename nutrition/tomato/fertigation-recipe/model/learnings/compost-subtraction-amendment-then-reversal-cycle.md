# Compost-subtraction amendment-then-reversal cycle

## compost-subtraction amendment-then-reversal cycle (2026-05-07 → 2026-05-15)

Lesson: **compost release is current-week supply to the bed, not a long-term bank; it belongs in fertigation sizing as a subtraction term.**

**Timeline:**

- **2026-04-XX — Original mass-balance-derivation (with compost-subtraction).** Formula `fertigation = max(0, demand − compost − sidedress)`. PA Taillon April 2026 anchor (K 5 167 / Mg 1 379 at T5) matched by construction.
- **2026-05-07 — Framing comment shift.** Comment in `calc.js` framed compost as "soil-bank, not fertigation-credit" — intent: avoid silent under-feeding when compost ages out (cert 1-2 Mg, finite 18-24 mo decline). Code still subtracted compost; policy-vs-implementation drift for 5 days.
- **2026-05-12 — mass-balance-derivation amendment.** Compost-subtraction dropped from K and Mg branches; spec rewritten ("Compost release is NOT subtracted"). Verifier recalibrated. T5 FP jumped: K 5 167 → 5 322 (+3 %), Mg 1 379 → 3 319 (**+141 %**).
- **2026-05-13 — Challenger codified P-02** ("keep policy direction; forget about pleasing the agronomist"). PA Taillon anchor framed as "legacy calibration against retired formula." Specialist B1 approved on this framing.
- **2026-05-14 — Specialist fp-target-mirrors-sizer refit landed.** `wireFpFertigation()` rewritten to populate `FIRST_PRINCIPLES_T5_FERTIGATION` from `computeStageRecipe('T5')` at boot; PA Taillon 5 167 / 1 379 retired to `learnings.md`. Block 7/8 surfaced STORED 1 396 vs FP 3 319 Mg (~140 %).
- **2026-05-14 — Challenger self-correction (B1-REV).** Mg over-supply: refit produces 854 mg Mg/m²/wk fertigation; compost releases ~500 mg Mg/m²/wk to same bed same week; total 1 354 vs demand 855 = **158 % of demand**. Excess ~100 kg Mg/ha/season into already-Mg-loaded soil (1 646 kg/ha). Compost release is current-week supply, not long-term bank.
- **2026-05-14 — Guillaume's reversal:** "fertigation recipe should be calculated from post-soil-bank-for-P-and-Ca-post-compost-post-side-dress. So it should bring 355mg not 855." Soil-bank credit set narrowed to {P, Ca} only (P drawdown via Banque sol; Ca in surplus from calcitic-lime compost).
- **2026-05-15 — Specialist B1-REV refit landed.** Compost+sidedress subtraction restored; mass-balance-derivation rewritten to `max(0, demand − compost − sidedress − {P,Ca}-only bank credit)`; verifier recalibrated. Live T5: K 4 953 (sidedress credit included, ~−214 g vs PA Taillon 5 167), Mg 1 378 (matches PA Taillon 1 379 within rounding). fp-target-mirrors-sizer invariant + boot-time pin survive.

**Lessons recorded:**

1. **Compost release is current-week supply, not long-term bank.** The 2026-05-07 framing was wrong category. Subtract it from fertigation sizing.
2. **Soil-bank credit is element-specific.** {P, Ca} are managed-by-bank at Décembre; N / K / Mg / micros use fertigation-as-gap-filler. Don't blanket-apply.
3. **P-02 retired.** "Forget about pleasing the agronomist" retired the wrong target — the agronomist's number was right by physics; framing of its origin was what needed updating.
4. **PA Taillon's anchor vindicated by physics, not deference.** Mg T5: demand 855 − compost 500 = 355 mg/m²/wk → 1 378 g MgSO₄·7H₂O. PA Taillon: 1 379 g. Match within rounding.
5. **K branch picked up a sidedress credit post-anchor.** Live T5 K is 4 953 g (sidedress 234 mg/m²/wk + compost 400 mg/m²/wk subtracted), not 5 167 g. Whether to drop Actisol from T5 sidedress (ca-aware-product-gate / SME P-lockout) shifts this back — separate decision.

**Refinement triggers (post-reversal):**

- If tissue petiole shows persistent Mg deficiency at current weighed Mg dose, `COMPOST_RELEASE_PER_WEEK.Mg = 0.50 g/m²/wk` (cert 1-2, no label data) may be too generous. Tighten by tissue, not formula.
- If soil-bank credit needs to fire for K or Mg (future strategy change), add the element explicitly in mass-balance-derivation.
