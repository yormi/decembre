# plant-nutrition-specialist ← model-challenger

Approved findings from the model-challenger persona queued for the plant-nutrition-specialist to action.

Peer personas (`context-coherence`, …) route through this channel via the challenger's gatekeeping — source is stamped on each entry's `**Source:**` line.

**Workflow:**
1. **Challenger writes here** when Guillaume approves a draft finding. The finding is copied verbatim from drafts.md plus an `### Action` block stating what the specialist should do.
2. **Specialist reads this file at session start** (per `plant-nutrition-specialist.md` startup checklist).
3. **Specialist picks one request per turn**, edits spec/derivation/code/data accordingly in their own session.
4. **On completion**, specialist **moves the entry** from this file into `from-model-challenger-done.md` with a `### Specialist response` block (what was changed, file:line pointers).
5. **Challenger verifies** at next session — pass → leave in done; fail → move back here with an updated Action.

**Request schema per entry:**
- `**Source:**` originating persona + draft tag (e.g. `model-challenger B1`, `context-coherence F1`).
- `**Action:**` concrete edit(s) the specialist should make.
- `**Acceptance:**` what the originating persona will check to verify.
- Original finding body copied below the action.

---

## B1 — Reconcile foliar-recipe derivation demand table with `plant-needs/data.js` (approved 2026-05-11)

- **Action:**
  1. Replace the hand-typed "Per-element delivered mg/m²/wk vs demand at T5" table in `nutrition/tomato/foliar-recipe/derivation.md` with a live computation: either (a) inline a derivation block that reads `BIOMASS_DEMAND.T5[el] + TOMATO_FRUIT_EXPORT[el].g × 1500` and shows the working, or (b) regenerate the table at verifier-time so drift is caught automatically.
  2. Update the prose "Mn delivered at ~60 % of demand" / "Cu at ~25 %" calls to match the corrected percentages.
  3. Decide what to do with the **Zn 136 % over-luxury** and **Mo 413 % over-luxury** facts the corrected table surfaces. Options: (i) cut Zn / Mo from the foliar spray entirely (move to fertigation or accept zero supply), (ii) raise REQ-014's luxury cap for Zn/Mo with documented rationale (cert + soil-bank justification), (iii) annotate as `acceptedDeficit`-style override on the over-supply side. This is a real decision, not just bookkeeping — escalate to Guillaume if needed.
- **Acceptance:**
  - Demand numbers in derivation.md table match `PlantNeedsTomato.demandTotal('T5')` ±5 %.
  - REQ-014 verifier passes (or has documented overrides for Zn / Mo).
  - Refresh changelog entry.

**Original finding:**

> derivation.md table "Per-element delivered mg/m²/wk vs demand at T5" anchors every % demand call. Arithmetic from current `BIOMASS_DEMAND.T5 + TOMATO_FRUIT_EXPORT × 1500` (1.5 kg/m²/wk yield) gives Mn 7.5 (not ~9), Zn 4.5 (not ~6), Mo **0.075** (not ~0.3), Fe 15 (not ~13). Cu ~1.5 matches. At the current STORED recipe under 0.30 coverage:
> - Mn delivered 5.4 / demand 7.5 = **72 %** (not 60 %)
> - Zn delivered 6.1 / demand 4.5 = **136 %** — over REQ-014's 1.3× luxury cap on the foliar channel alone
> - Mo delivered 0.31 / demand 0.075 = **413 %** — 4× over luxury cap
> - Fe delivered 12.5 / demand 15 = **83 %** (not 95 %)
>
> Either the table uses a different yield, uses pre-Koller-aligned demand numbers (pre-2026-05-06), or was hand-typed and never reconciled with the data source.

---

## B3 — Replace proportional CE-scaling with "drop highest-CE-contributor first" (approved 2026-05-11)

- **Action:**
  1. Rewrite `nutrition/tomato/foliar-recipe/calc.js` `computeFoliarRecipeForGap` step 2 (CE-cap-and-scale loop). Instead of scaling all non-zero doses proportionally, identify the highest CE-contributor per iteration and reduce only that element (or drop it to 0 if reducing wouldn't help). Termination: predicted CE ≤ target OR no further reductions possible (all doses already at min-dose floor or 0).
  2. Update REQ-115 spec algorithm description in `nutrition/tomato/foliar-recipe/spec.md` to match.
  3. Update `derivation.md` to explain why "drop highest-CE-contributor" beats proportional scaling: it preserves the pH-locked micros (Mn, Cu, Mo, B) that have no alternative channel under REQ-061 cascade order, instead of stripping them when Fe drives CE excess.
  4. Update REQ-115 verifier test in `scripts/check-recipes.mjs` to assert: feed a Fe-heavy gap that pushes CE over cap → Mn/Cu/Mo/B stay non-zero (or at min-dose floor), Fe gets reduced first.
- **Acceptance:**
  - Synthetic test (Fe-heavy gap, CE over cap) passes with Mn/Cu/Mo/B preserved.
  - Spec, derivation, and code all describe "drop highest-CE-contributor", not proportional scaling.

**Original finding:**

> REQ-115 step 2: if predicted CE > target, scale all non-zero doses by `target_CE / predicted_CE`. But FeSO₄·7H₂O (80 g) is mass-dominant; CE excess almost always traces to Fe. Proportional scaling penalizes Mn, Cu, Mo, B — the elements with no alternative channel at current soil pH 7.4 (REQ-061 cascade-order locks them to foliar). The min-dose 0.5 g clamp then zeroes the small elements first on subsequent iterations. Net effect: a CE-cap event preferentially strips the pH-locked micros that the foliar channel exists to deliver.

---

## B5 — Resolve yucca-return contradiction; ask PA Taillon (approved 2026-05-11)

- **Action:**
  1. Reconcile the contradiction in `nutrition/tomato/foliar-recipe/derivation.md` between the "Refinement triggers — yucca decision flips" section (assumes doses go back up to 22/22/4 with yucca return) and the burn-cap research note in `data.js` (yucca's wet-film property under sun amplifies burn risk, no cap relaxation supported by literature).
  2. Resolution path A: drop the "doses go back up" claim. Yucca return is a coverage-only flip (0.30 → 0.80); doses stay at 18/16/2. Update derivation.md refinement trigger accordingly. Mn delivery improvement: 5.4 → 14.4 mg/m²/wk via coverage alone (no dose change needed).
  3. Resolution path B: keep the dose-restoration claim, but document the field evidence supporting it (PA Taillon's view, prior season data at 22/22/4 + yucca with no observed burn).
  4. Flag to Guillaume: needs PA Taillon ask. Question for PA: "If yucca returns to the program, do the foliar doses (Mn/Zn/Cu) come back up to the pre-2026-05-05 values (22/22/4 g/15 L), or stay at the post-cut values (18/16/2 g/15 L)? What's your field evidence either way?" — escalate to Guillaume to send this to PA Taillon and report back.
- **Acceptance:**
  - derivation.md no longer asserts both "yucca raises coverage" and "yucca relaxes burn cap" without distinguishing them.
  - PA Taillon's answer (if obtained) is captured in derivation.md with cert annotation.
  - If PA hasn't answered yet, the spec defaults to path A and the question is parked in `derivation.md` as an open refinement trigger.

**Original finding:**

> The single biggest refinement trigger in the subproject is internally contradictory. Spec asserts "yucca returns ⇒ doses can go back up to 22/22/4" AND data.js asserts "yucca's wet-film under sun is a burn-risk amplifier, no cap relaxation by literature". If the second is right, the first is wrong. Restoring yucca improves coverage but doesn't license higher doses.

---

## C1 — Drop `sprayCount` lever (REQ-112) or escalate REQ-062 to PO (approved 2026-05-11)

- **Action:**
  1. Remove `sprayCount` parameter from `nutrition/tomato/foliar-recipe/calc.js` `computeFoliarSupply` and `computeFoliarRecipeForGap` signatures. Remove it from REQ-112 in `spec.md` and from `derivation.md`. Remove the corresponding UI lever and namespace exposure in `model.js`.
  2. **OR** if Guillaume confirms the team is actually spraying multiple times per week for spike scenarios: don't remove. Instead, escalate to PO-level by adding a `**Specialist note**` to `nutrition/spec.md` REQ-062 noting the contradiction and requesting Guillaume relax REQ-062 explicitly. Do NOT edit REQ-062 directly.
  3. Default to path (1) unless Guillaume signals path (2) when reviewing this request.
- **Acceptance:**
  - `sprayCount` is either removed everywhere OR there's an explicit PO-level REQ relaxing REQ-062 for multi-spray weeks.
  - Verifier check on REQ-062 (`scripts/check-recipes.mjs`) still passes.

**Original finding:**

> REQ-112 introduces `sprayCount` clamped 1–3, but REQ-062 (inherited spec in foliar-recipe/spec.md) reads: "single foliar spray per week. STORED_RECIPE.tomato.foliaire carries exactly one spray-recipe key (`A`); enforced by REQ-062's verifier." So `sprayCount=2` violates REQ-062 by construction. The model exposes a knob that can't be set without violating an inherited spec.

---

## F1 — Carve `nutrition/lettuce/plant-needs/` subproject (approved 2026-05-12)

- **Source:** context-coherence F1.
- **Action:**
  1. Scaffold `nutrition/lettuce/plant-needs/` via `/new-subproject` skill (or by hand mirroring `nutrition/tomato/plant-needs/`): `spec.md` + `derivation.md` + `data.js` + `calc.js` + `model.js`. Allocate any new REQ numbers silently per `feedback_req_number_allocation`.
  3. **Move out of `app/index.html`** into the new subproject (verbatim, then clean up):
     - `data.js`: `LETTUCE_DM_FRACTION` (line 3042), `LETTUCE_TISSUE_DW` (3047), `LETTUCE_FRONTLOAD_DEFAULTS` (3067), `SME_LETTUCE_PPM` (3481).
     - `calc.js` (pure, per `feedback_pure_code.md` + `feedback_model_srp.md`): `calcLettuceNutrDemand` (3077–3092) + `calcLettuceNutrSupply` (3095–3133). Accept pre-normalized inputs, no mode flags.
     - `model.js`: `window.LettucePlantNeeds` namespace exposing the two calc functions and the data constants (mirror `window.PlantNeedsTomato` shape).
  4. **Move out of `app/index.html`** into `nutrition/lettuce/app/logic.js` (create):
     - `buildNutrimentLettuce` (5283), `lettuceLeverFor` (referenced by Block 5-equivalent for lettuce).
  5. **Keep in `app/index.html` (integrator/routing layer):**
     - `setNutrCrop` (5258) + crop-toggle DOM (1164–1170). These are routing, not lettuce-model.
     - The `@include` lines for the new partials (alongside compost-contribution / soil-contribution).
  6. **Fix the cross-domain leak:** `nutrition/tomato/app/logic.js:6` currently calls `buildNutrimentLettuce()`. Replace with integrator-level dispatch on `nutrCrop` — tomato's logic.js should not know lettuce exists.
  7. **Trace placement (per CLAUDE.md 2026-05-12 update):** any "why this number" prose for lettuce constants goes in `nutrition/lettuce/plant-needs/derivation.md`. Rejected alternatives (e.g., stage-based lettuce model considered then dropped) go in `learnings.md`. **No trace in code comments.**
  8. **Spec scoping:** REQs for the lettuce model's normative claims (DM fraction, tissue conc shape, front-load assumption) — split between domain-level (`nutrition/lettuce/spec.md`, escalate to PO via separate channel) and subproject-level (`nutrition/lettuce/plant-needs/spec.md`). Don't author domain-level REQs yourself; flag what belongs there.
  9. Run `npm run check` after the carve; expect REQ count to bump as new subproject REQs wire in.
  10. Append a changelog line summarizing the carve.

- **Acceptance:**
  - `grep -E "SME_LETTUCE_PPM|LETTUCE_TISSUE_DW|LETTUCE_DM_FRACTION|LETTUCE_FRONTLOAD_DEFAULTS|calcLettuceNutrDemand|calcLettuceNutrSupply|buildNutrimentLettuce|lettuceLeverFor" app/index.html` returns only `@include` lines and routing-level dispatch references — no definitions, no body.
  - `nutrition/tomato/app/logic.js` contains zero `lettuce` references.
  - `nutrition/lettuce/plant-needs/{spec,derivation,data,calc,model}.js` exist; `npm run check` passes.
  - New REQs all wired (none deferred) or each deferred has documented trigger per spec discipline.
  - Salanova subpage still renders and produces the same numbers as before the carve (functional parity).

**Original finding (from context-coherence walk 2026-05-11):**

> Salanova model dumped into integrator, not extracted to `nutrition/lettuce/`. Every prior crop-model carve-out went the other way — compost-contribution, soil-contribution, plant-needs, fertigation-recipe, foliar-recipe, sidedress-recipe, nursery all live as siblings under `nutrition/<crop>/<topic>/`. Salanova landed 4 constants + 2 calc functions + 1 builder + 1 lever helper directly in `app/index.html`, with `nutrition/tomato/app/logic.js:6` reaching across to call the lettuce builder. SRP violations: `app/index.html` now changes for integrator wiring AND lettuce-model edits; `nutrition/tomato/app/logic.js` changes for tomato page logic AND lettuce page bootstrap. Memory `feedback_req_number_allocation` already encodes the rule ("non-generic renderers go inside their subproject"). Important severity — not blocking the season, but accreting fast and the eventual extraction gets harder every day.

---

## PO-153 — Implement Block 8 drift ratio FP / Stockée + clean up retired-REQ-016 references (approved 2026-05-13, refreshed 2026-05-13)

- **Source:** product-owner PO-153
- **Action:**
  1. Flip the drift gauge ratio in `renderPhase1Comparison` (defined at **`app/index.html:4394`** — the function is rendered into `#nutr-phase1` by the call site at `nutrition/tomato/app/logic.js:701`, but the body lives in `app/index.html`). Two edits inside the function body:
     - Line 4450: `const ratio = stored / fp;` → `const ratio = fp / stored;`
     - Line 4466: `(stored / fp).toFixed(2) + '×'` → `(fp / stored).toFixed(2) + '×'`
     - Line 4449 sentinel needs a flip too: today `if (fp === 0) return '#b03030'; // stored > 0 vs FP 0 → red (over-feed)`. After the ratio direction flip, the divide-by-zero guard becomes `if (stored === 0) return '#b03030';` with comment `// FP > 0 vs stored 0 → red (under-feed vs FP target)`. Mirror in `row()` line 4465's `else if (fp === 0)` guard → `else if (stored === 0)`.
     - Keep the colour bands as-is — `colorOf` already uses `Math.abs(ratio − 1.0)` (line 4451), so it's direction-agnostic and needs no change. Same goes for the `5 % / 30 %` thresholds in the intro copy at line 4425.
     - Operator semantic after flip: 100 % = parity, > 100 % ⇒ stored under-supplies vs FP, < 100 % ⇒ stored over-supplies.
  2. **P-02 cleanup, same pass — every live `REQ-016` reference outside the audit trail:**
     - `nutrition/tomato/app/page.html:127` — `(REQ-016)` on the Block 8 container → `(REQ-153)`.
     - `nutrition/tomato/app/logic.js:695` — `Phase 1 model — drift detection (REQ-016)` → `(REQ-153)`.
     - `app/index.html:4241` — `// REQ-016 — Compute the recipe a channel SHOULD use, from first principles.` Misattributed: REQ-016 was the drift gauge, not recipe computation. Strip the `REQ-016` token (drop the prefix; the rest of the comment stands on its own).
     - `yield-range/app/logic.js:83` — `// Tier thresholds match the project's existing 3-tier convention (per REQ-016 in the tomato Block 7 drift gauge): ≤5%, ≤30%, and >30%.` Strip the parenthetical pointer; the threshold values themselves stay. Suggested rewrite: `// Tier thresholds: ≤5% (green), ≤30% (yellow), >30% (red) — same green/yellow/red palette signals "near optimum / partial / off-band".`
     - **STAY (audit trail):** `app/index.html:3381` REASON string explaining REQ-016's retirement, and `scripts/check-recipes.mjs:1495` retirement comment. Both are legitimate history.
     - **OUT OF SCOPE for this hand-off:** the fifth ghost — `yield-range/app/spec.md:137` `Mirrors the project's 3-tier convention (REQ-016).` — sits in PO-owned spec prose. Guillaume will handle it in his own pass; do NOT touch it from the implementer side.
  3. **Wire REQ-153 verifier** in `scripts/check-recipes.mjs` — new `header('REQ-153 — Block 8 drift ratio FP / Stockée')` block. Suggested approach: stub `STORED_RECIPE.tomato.fertigation.T5` and `FP_RECIPE_T5.fertigation` so that for one element (e.g. `K2SO4`) `FP / Stored = 1.5`, set `nutrStage = 'T5'` in jsdom, call `renderPhase1Comparison()`, and assert the rendered K2SO4 ratio cell contains `1.50×` (the format is `(ratio).toFixed(2) + '×'`). Asserts on the FP-numerator direction; would fail if direction silently flipped back.
  4. **Append a changelog line** summarizing the implementation pass.
- **Acceptance:**
  - Block 8 on the Tomato Nutrition admin page (FP mode, T5) shows `FP ÷ Stored` for every element. A row where stored = 1000 g and FP = 1500 g reads `1.50×` (was `0.67×`).
  - `grep -rn "REQ-016" app/ nutrition/ yield-range/ scripts/` returns only the two audit-trail entries (`app/index.html:3381`, `scripts/check-recipes.mjs:1495`) plus the PO-owned `yield-range/app/spec.md:137`.
  - `npm run check` passes; REQ-153 reports wired.

**Refresh note (2026-05-13):** Original hand-off had three stale pointers — function pinned to `logic.js` instead of `app/index.html:4394`; cleanup list missed `app/index.html:4241` + both yield-range references; speculative band-direction caveat was unnecessary because `colorOf` already uses `|ratio − 1|`. All corrected above.

**Original PO context:** Guillaume opened the topic 2026-05-13: "make ratio FP/Stocké (right now it's the inverse)." There was no existing REQ pinning the direction (REQ-016 covered the gauge's three-tier deviation thresholds and was retired with TOMATO_STAGES on 2026-05-08; the block was rétabli 08:10 same day but no replacement REQ was filed). Block 8 drift ratio FP / Stockée (REQ-153) fills the gap with a statement-only direction lock; the verifier check is the audit handle.

---

## B4 — Reconcile Solubore chemistry naming (approved 2026-05-16)

- **Source:** model-challenger 2026-05-12 fertigation-recipe / B4 (re-fire pass).

- **Confirmed product identity:** `nutrition/doc/context.md` links to the supplier page for "Solubore 20 % B — Eti Maden Etidot-67." Etidot-67 is Eti Maden's trade name for **disodium octaborate tetrahydrate** (Na₂B₈O₁₃·4H₂O, ~20.8 % elemental B), matching the project-wide 20.5 % constant. Organic-cert status: CAN-CGSB-32.311 lists sodium borates as allowed micronutrient sources — disodium octaborate qualifies.

- **Action:**
  1. In `nutrition/tomato/fertigation-recipe/derivation.md`, replace the prose framing Solubore as "Boric acid (H₃BO₃, ~17.5 % B mass)" with "Solubor / disodium octaborate tetrahydrate (Na₂B₈O₁₃·4H₂O, 20.5 % B mass — Eti Maden Etidot-67, supplier link in `nutrition/doc/context.md`)."
  2. Rerun the inline B-delivery example at 20.5 % so it matches the per-element table: 9 g × 20.5 % B / 382.9 m² × 1000 ≈ 4.82 mg B/m² (was 4.11 mg/m² at the wrong 17.5 %).
  3. Sweep the rest of the spec / derivation / learnings tree for any other "boric acid" or "H₃BO₃" mentions referring to Solubore and reconcile to the disodium octaborate wording. Generic chemistry mentions ("H₃BO₃ is non-ionic at pH ≤ 9," etc., describing the species in solution) can stay if they're about chemistry, not product identity.
  4. Append a changelog line.

- **Acceptance:**
  - `grep -nri "boric acid\|H₃BO₃\|H3BO3\|17\.5 *% *B" nutrition/tomato/fertigation-recipe/` returns no live references to Solubore-the-product; only generic chemistry mentions if any.
  - The inline example B-delivery figure in `derivation.md` matches the per-element table within rounding (~4.82 mg B/m² at the current 9 g Solubore dose).
  - `npm run check` passes; no verifier change required for this fix (the constant `PRODUCT_PCT.Solubore_B = 0.205` is already correct and was the source of truth all along).

- **Out of scope:** the certainty defense on the live 9 g dose itself, and the soil-adsorption-at-Ca-rich-bed uptake discount captured under REQ-155 (B factor 0.80) — separate concerns, not part of this naming fix.

**Original finding (model-challenger 2026-05-12 / B4 re-fire):**

> derivation.md prose at lines 134-138 frames Solubore as "Boric acid (H₃BO₃, ~17.5 % B mass) ... 9 g × 17.5 % B / 1000 ≈ 4.11 mg B/m²" while the NEW per-element table introduced by the same diff uses `element_pct = 0.205`. The rest of the project (`PRODUCT_PCT.Solubore_B`, the verifier script, the nutrient-model-reference doc) converges on 20.5 % — disodium octaborate tetrahydrate. The H₃BO₃ prose is documentation leftover from before the product identity got pinned. Operationally low impact (the dose is 9 g either way; the supply calc uses the constant, not the prose), but the audit surface — Catherine reading derivation.md prose for CAN-CGSB-32.311 review — sees "boric acid" while the bag says "Solubor / Etidot-67" (disodium octaborate). Sodium borates are explicitly allowed; boric acid framing is fuzzier and reads as a different product.

---

## YUCCA-CERT — Downgrade `FOLIAR_COVERAGE_WITH_YUCCA` certainty 4 → 3 in `data.js` (approved 2026-05-16)

- **Source:** model-challenger 2026-05-11 foliar-recipe / D2 + 2026-05-12 foliar-recipe / B2 (same finding raised twice). Autonomous challenger approval per P-08 — impact 2/5, hygiene fix.

- **Concern:** `nutrition/tomato/foliar-recipe/data.js` line 28 still reads `// With-yucca coverage; cert 4 — surfactant-assisted droplet spread + cuticle wetting jumps real uptake to 70-85 % (literature)`. The companion constant `FOLIAR_COVERAGE_DEFAULT` was downgraded from 4 to 3 on 2026-05-12 (request B2, shipped). The derivation.md prose already flags `FOLIAR_COVERAGE_WITH_YUCCA` for a parallel downgrade as a "B2' followup," but the data.js comment never caught up. Same evidence base (Sentís 2017 + literature mid-band, no Décembre tissue correlation, retention-vs-penetration axes unseparated), same certainty floor.

- **Action:**
  1. Rewrite the `FOLIAR_COVERAGE_WITH_YUCCA` comment block in `nutrition/tomato/foliar-recipe/data.js` to read certainty 3 with the same three-axis rationale used for `FOLIAR_COVERAGE_DEFAULT` (no direct Décembre measurement; literature 70-85 % range conflates retention with penetration; bump-back trigger when tissue panel correlates predicted vs measured uptake within ±20 %).
  2. Drop the "B2' followup" callout in `derivation.md` since the followup is now landed (per `feedback_no_vestigial.md`).
  3. No verifier change required; the certainty annotation isn't enforced by code.
  4. Append a changelog line.

- **Acceptance:**
  - `data.js` line 28 comment block reads certainty 3 (not 4), with rationale matching the default-coverage downgrade.
  - `derivation.md` no longer mentions "B2' followup" or "handled separately" for the yucca-coverage certainty downgrade.
  - `grep -n "WITH_YUCCA.*cert 4\|with-yucca.*cert 4" nutrition/tomato/foliar-recipe/` returns no live references.
  - `npm run check` passes.

- **Operational impact:** none. `FOLIAR_COVERAGE_WITH_YUCCA` isn't consumed by live code today (yucca dropped from program 2026-05-05, not on order). The certainty claim becomes load-bearing only if yucca returns and the constant gets wired into Block 7 or refinement-trigger math. Fix is preventive — close the loop now so the constant doesn't carry an over-stated certainty when it next gets read.

**Original findings (bundled):**

> **2026-05-11 D2:** `FOLIAR_COVERAGE_WITH_YUCCA = 0.80` (stated cert 4). Specialist's defense: "surfactant-assisted droplet spread + cuticle wetting jumps real uptake to 70-85 % (literature)." Citation is missing from `derivation.md`. Sentís 2017 (cited next door for the burn-cap research note) reports surfactant-assisted Mn penetration at 20 % on tomato cuticle, not 80 %. The discrepancy may be retention-vs-penetration framing again, but the spec doesn't say. Provenance gap.
>
> **2026-05-12 B2:** The "B2' followup" framing is a loose-loop TODO that slips for weeks. `data.js` line 28 still reads cert 4 while the same subproject's `derivation.md` says it should be downgraded. Tying the resolution to a process artifact would close the loop; the current wording is "trust we'll get to it."

---

## MIN-DOSE-FLOOR — Replace uniform 0.5 g foliar min-dose floor with per-element floors (approved 2026-05-16)

- **Source:** model-challenger 2026-05-11 foliar-recipe / B4. Autonomous challenger approval per P-08 — impact 2/5, hygiene with Cu narrow-toxicity edge.

- **Concern:** REQ-115 in `nutrition/tomato/foliar-recipe/spec.md` currently defines a uniform "if `ideal_g < 0.5` → `0`, else `clamp(ideal_g, 0.5, burnCapG(element))`" floor in `computeFoliarRecipeForGap`. The floor is element-blind. For tiny-demand elements (Cu, Mo), the floor produces a guaranteed luxury-cap violation any time the algorithm's ideal dose lands above 0 but below 0.5 g. Cu has narrow root-uptake toxicity (the 4 → 2 g cut on 2026-05-06 happened for exactly this reason — local-pool toxicity image diagnostic). A future CE-cap reduction or Cu-gap recompute that lands at ideal_g = 0.2 g would get bumped to 0.5 g floor and deliver 2.5× the modelled need.

- **Action:**
  1. Replace the uniform 0.5 g floor in `nutrition/tomato/foliar-recipe/calc.js` `computeFoliarRecipeForGap` with a per-element floor map keyed by element, exported from `data.js`. Suggested values (your call on the exact numbers, subject to operator weigh-scale realism):
     - K, Mg, Fe, B: 0.5 g (uniform stays — these are mass-dominant and not toxicity-narrow)
     - Mn, Zn: 0.5 g (same — burn-cap is the binding constraint, not luxury)
     - Cu: 0.2 g (narrow toxicity, no benefit to forcing higher mass)
     - Mo: 0.1 g (Sonneveld 50-200 mg/L band tolerates wide range; tiny demand)
  2. Add an alternative or complementary guard: if applying the floor would push `delivered_per_gap > 1.3 × luxury_cap`, drop the element to 0 instead. This catches the edge case where even the per-element floor is too coarse.
  3. Update REQ-115 statement in `nutrition/tomato/foliar-recipe/spec.md` to describe the per-element floor (or the guard, whichever you choose — both work; the spec just needs to declare which rule is in force).
  4. Update `derivation.md` with the rationale (operator scale resolution × per-element luxury-cap risk; Cu the load-bearing case).
  5. Update REQ-115 verifier in `scripts/check-recipes.mjs` — add an assertion: `computeFoliarRecipeForGap({Cu: 0.05 * area / 1000}, {})` should produce a Cu dose ≤ 0.2 g (or 0 if the guard kicks in), not 0.5 g.
  6. Append a changelog line.

- **Acceptance:**
  - Per-element floor map (or luxury-cap guard) lives in `data.js`; `computeFoliarRecipeForGap` reads from it.
  - REQ-115 spec statement and `derivation.md` describe whichever rule is in force.
  - REQ-115 verifier asserts the Cu edge case can't trip 2.5× luxury via the floor.
  - `npm run check` passes.

- **Operational impact today:** none. The current STORED recipe doesn't go through `computeFoliarRecipeForGap` for active dosing; the function feeds the FP-target side of Block 7/8. The fix is preventive — preserves correctness for the next time the algorithm recomputes a CE-constrained recipe with a small Cu gap.

**Original finding (model-challenger 2026-05-11 / B4):**

> REQ-115 — "If `ideal_g < 0.5` → `0` (operational floor — sub-half-gram doses aren't measurable on an organic-farm scale)." For Cu and Mo, the 0.5 g floor doesn't trigger a zero — it triggers a zero OR a delivery at the floor mass, which is ~2-4× demand for small-demand elements. Effectively the min-dose floor is a guaranteed luxury-cap violation for tiny-demand elements when the gap is non-trivial. Spec frames the floor as a safety / dosing-realism rule; doesn't acknowledge it's element-blind and violates REQ-014 on small-demand elements. Cu the load-bearing case (narrow toxicity, 4 → 2 g cut on 2026-05-06 happened for exactly this reason); Mo wide tolerance, lower stakes.

---

## CU-BURN-CERT — Downgrade `BURN_CAP_BASE_G.Cu` certainty 3 → 2; other elements stay at 3 (approved 2026-05-16)

- **Source:** model-challenger 2026-05-11 foliar-recipe / D3. Autonomous challenger approval per P-08 — impact 2/5, certainty-provenance hygiene.

- **Concern:** `BURN_CAP_BASE_G` in `nutrition/tomato/foliar-recipe/data.js` declares all six element caps at certainty 3, defended as "mid-band of Sonneveld, Yara, Cornell, U. Delaware, U. Missouri extension publications." Cu is the outlier: the live 2 g/15 L value came from a Décembre Cu-toxicity image diagnostic on 2026-05-06 (a halving from PA Taillon's original 4 g), not from extension mid-band. Extension publications support 0.05-0.1 % Cu solutions = 7.5-15 g CuSO₄/15 L, several × Décembre's 2 g. The Décembre observation is solid (certainty 3 within Décembre), but the transferability claim implicit in "extension mid-band" is wrong — that's a certainty 2 transferability bar, not 3.

- **Action:**
  1. Restructure the certainty annotation on `BURN_CAP_BASE_G` in `nutrition/tomato/foliar-recipe/data.js` to declare per-element certainties instead of the current single block: Mn/Zn/Fe/Mo/B stay at certainty 3 (extension mid-band defensible); Cu drops to certainty 2 with rationale "Décembre-internal observation 2026-05-06 — Cu local-pool-toxicity image triggered halving from PA Taillon's 4 g to 2 g; extension publications support 7.5-15 g CuSO₄/15 L on conventional ops; the lower Décembre value is defensible by local observation but not transferable."
  2. Mirror the per-element certainty split in `nutrition/tomato/foliar-recipe/derivation.md` and `spec.md` REQ-115 (whichever already carries the certainty annotation).
  3. Refinement-trigger entry: if tissue + lesion data across multiple seasons stabilizes the Cu cap, bump Cu back to certainty 3 (Décembre-empirical, transferable to similar Ca-saturated soil ops).
  4. No verifier change required.
  5. Append a changelog line.

- **Acceptance:**
  - `BURN_CAP_BASE_G` certainty annotation declares Cu at 2, other elements at 3.
  - Derivation prose names Décembre-internal-observation as the Cu source, distinguishes from extension mid-band.
  - Refinement trigger declares the bump-back path.
  - `npm run check` passes.

**Original finding (model-challenger 2026-05-11 / D3):**

> The 2 g/15 L Cu cap came from a Décembre-specific event (Cu local-pool toxicity image, 2026-05-05) — a halving from PA Taillon's original 4 g. That's a Décembre measurement (certainty 3 within Décembre, certainty 2 transferability), not an inter-source midpoint. The extension publications support 0.05-0.1 % Cu = 7.5-15 g CuSO₄/15 L, several × Décembre's 2 g. So the Cu value is below extension guidance, defensible by Décembre observation but not by the cited sources. Cu specifically should be certainty 2; other elements (Mn 18, Zn 16, Fe 80, Mo 1, B 9) can stay certainty 3.

