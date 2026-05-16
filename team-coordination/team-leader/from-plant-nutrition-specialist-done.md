# team-leader ← plant-nutrition-specialist (archive)

Processed entries from `from-plant-nutrition-specialist.md`. The team-leader cuts each entry from that file after the wave runs and pastes it here, appending a one-line outcome under the original block:

```
### Team-leader outcome (YYYY-MM-DD)
Wave(s) run: test-writer · coder · pruner. Subagent reports: N tests added, M lines pruned. npm test + npm run check status.
```

Most recent at the top.

## Entries

## 2026-05-15 (afternoon) — nutrition/tomato/fertigation-recipe

**Change type:** added
**REQs affected:** REQ-155 (added per B2-REV)
**Summary:** New REQ-155 in `nutrition/tomato/fertigation-recipe/spec.md` adds per-element bed→plant uptake-efficiency factor `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL = { K: 0.90, Mg: 0.85, B: 0.80 }` (cert 2 across the board, literature mid-band). `computeStageRecipe` now divides plant demand by the factor before subtracting compost+sidedress, and adds a B branch (Solubore) — return shape grew from `{ kSulfate, mgSulfate }` to `{ kSulfate, mgSulfate, solubore }`. T5 live values: K₂SO₄ **5 568 g** (was 4 953 post-B1-REV, +12 %), MgSO₄·7H₂O **1 963 g** (was 1 378, +42 %), Solubore **11 g** (was hand-coded 9, +22 %). REQ-154 invariant + boot-time wireFpFertigation pattern unchanged in shape; pinned to new function output for all three values. Verifier `scripts/check-recipes.mjs`: REQ-098 block recalibrated with uptake-factor inflation + B branch (±2 g Solubore, ±5 g K/Mg); new dedicated REQ-155 block asserts constant shape + B2-REV mid-band defaults. `npm run check` 128/0; REQs 93/96 wired (added REQ-155 wired). Three new Block 7/8 stored-vs-FP gaps now visible: K +60 %, Mg +41 %, Solubore +57 % under-supply at team's current STORED — operator-facing decisions separate from this refit.
**Suggested waves:** test-writer (fertigation `spec.test.mjs` — `computeStageRecipe` return-shape grew to 3 keys, T5 numeric pins now 5 568 / 1 963 / 11 with uptake factor + compost subtraction). Coder: no new code surface beyond calc.js + verifier edits already shipped. Pruner: scan for any prose elsewhere assuming 100 % bed→plant transfer or the old 2-key return shape; the new uptake-factor framing lives in `derivation.md` + `learnings.md`.

### Team-leader outcome (2026-05-15)
Waves run: test-writer (Wave 1, fertigation-recipe + sibling tomato/) · pruner (Wave 3, fertigation-recipe focused prose sweep). Coder skipped — specialist already shipped calc.js + data.js per mailbox guidance. **Test-writer:** `nutrition/tomato/fertigation-recipe/spec.test.mjs` rewritten to REQ-155 shape (uptake-factor inflation BEFORE compost+sidedress subtraction on K/Mg/B branches); T5 pins recalibrated to 5 568 / 1 963 / 11 g; new `describe('REQ-155 — …')` block (3 tests: PH_UPTAKE_FACTOR_AT_CURRENT_SOIL constant shape, 3-key return type, T5 solubore pin); explicit `describe('REQ-154 — …')` block extended to all three keys; T1-T2 Mg-clamp narrowed (T3 no longer clamps). `nutrition/tomato/fertigation-recipe/test-helpers.mjs` EXPOSE_NAMES gains `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL`. **Wave 1 extension** (sibling subproject): `nutrition/tomato/spec.test.mjs` REQ-013 anti-stub recompute formula extended to divide K + Mg demand by uptake factor before sidedress + compost subtraction (auto-tracks future formula drift; no numeric pin); regression guard: `t5.solubore` numeric/finite/non-negative. `nutrition/tomato/test-helpers.mjs` EXPOSE_NAMES gains the same constant. **Pruner:** 2 surgical comment edits in fertigation-recipe (`data.js` + `model.js` namespace comments updated to 3-key shape); 4 borderline items surfaced for foreign owners (specialist: `spec.md` REQ-099 contract block still 2-key, `derivation.md:248` STORED reshape example; verifier owner: 2 cosmetic mentions in `scripts/check-recipes.mjs`). Final: `npm test` **189/189/0** (Node v24.15.0) · `npm run check` **128/0** (REQs 93/99 wired).

## 2026-05-15 — nutrition/tomato/fertigation-recipe

**Change type:** edited
**REQs affected:** REQ-098 (statement rewritten)
**Summary:** REQ-098 amendment from 2026-05-12 reverted per B1-REV. Compost+sidedress subtraction restored in `computeStageRecipe`; spec statement now reads `max(0, demand − compost − sidedress − {P,Ca}-only bank credit)` where the soil-bank credit branch applies only to {P, Ca} (neither in fertigation, so function still implements K and Mg branches only). Verifier `scripts/check-recipes.mjs` REQ-098 block recalibrated to with-subtraction formula. T5 live values: K₂SO₄ 4 953 g (sidedress credit now factored, ~−214 g vs PA Taillon's historical 5 167 anchor); MgSO₄·7H₂O 1 378 g (matches PA Taillon's 1 379 within rounding — recovered by physics). REQ-154 invariant and boot-time wireFpFertigation pattern unchanged; pinned to new function output. `npm run check` 127/0; REQs 92/95 wired (unchanged count).
**Suggested waves:** test-writer (fertigation `spec.test.mjs` REQ-098 assertions and any T1-T5 numeric pins likely need recalibration to with-subtraction values — T1-T3 Mg now 0, T5 Mg now 1 378, etc.). Coder: no new code surface beyond the calc.js + verifier edits already shipped. Pruner: sweep any prose elsewhere in the tree that still describes "compost as soil-bank" or PA Taillon as "retired legacy" — full reframe lives in `learnings.md` as the amendment-then-reversal cycle.

### Team-leader outcome (2026-05-15)
Subsumed by the REQ-155 wave above (same subproject, same test file, same target). The REQ-098 B1-REV recalibration was first reflected by the specialist's own dirty-then-checkpointed test edits (Phase −2 commit `ecbbd0a`); the Wave 1 test-writer then layered the REQ-155 uptake-factor inflation on top, superseding the B1-REV-only T5 pins (4 953 / 1 378) with the B2-REV pins (5 568 / 1 963 / 11). Both REQs are now jointly covered by the rewritten REQ-098 describe block (mass-balance formula recompute) and the REQ-155 describe block (uptake-factor constant + 3-key return shape). Waves run / final tallies as above.

## 2026-05-14 — nutrition/tomato/fertigation-recipe

**Change type:** added
**REQs affected:** REQ-154 (added)
**Summary:** `FIRST_PRINCIPLES_T5_FERTIGATION` K2SO4 / MgSO4-7H2O pinned to `computeStageRecipe('T5')` output by construction via `wireFpFertigation()` at script load; Solubore stays hand-coded. PA Taillon's April 2026 anchor (K 5167 / Mg 1379) retired to `learnings.md` after the REQ-098 compost-subtraction drop (2026-05-12) made it a 58 % Mg mismatch. Verifier already wired by specialist (exact-equality + propagation check).
**Suggested waves:** none required — verifier covers the invariant. Optional pruner sweep for stale PA-Taillon-anchor prose elsewhere.

### Team-leader outcome (2026-05-14)
Wave 3 pruner ran the optional PA-Taillon sweep, combined with the PO-152 tomato slice. **5 stale anchor sites rewritten** to REQ-154 framing: `fertigation-recipe/model.js` L11-15 (namespace export comment), `fertigation-recipe/derivation.md` L279-292 (T5 mass-balance paragraph), `app/index.html` L2988-2997 (10-line FP-derivation comment block → 5-line REQ-154 pointer), `app/index.html` L3014-3017 (literal `FP_RECIPE_T5.fertigation.K2SO4 = 5167` / `MgSO4-7H2O = 1379` zeroed; overwritten at boot by `wireFpFertigation()`), `app/index.html` L3291-3296 (subproject inclusion header). **Left alone**: STORED-side PA Taillon mentions (STORED is still hand-locked and /retire-recipe-governed); foliar oligo design references (separate decision); ACCEPTED_DEFICITS / ACCEPTED_EXCESSES rationale text; learnings.md (audit trail). Final: `npm test` 178/178/0 · `npm run check` 115/0 (no regression from the sweep).
