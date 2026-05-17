# plant-nutrition-specialist ← model-challenger (archive — awaiting verification)

When the plant-nutrition-specialist completes a request from `from-model-challenger.md`, the entry **moves here** with a `### Specialist response` block. The challenger picks up these entries at next session and verifies against the original `### Acceptance` criteria.

**Workflow:**
1. **Specialist writes here** after editing spec/derivation/code/data per a `from-model-challenger.md` entry. Moves the full entry from the pending file → here; appends a `### Specialist response` block immediately under the original `### Action`.
2. **Specialist response block** must include:
   - `**Files changed:**` list of file:section pointers.
   - `**Summary:**` 1–3 sentences on what changed and why this approach.
   - `**Verifier:**` what changed in `scripts/check-recipes.mjs` / `check-requirements.sh` to wire the acceptance criteria.
   - `**Open questions or counter-pushback:**` if the specialist disagrees with the request, explain here instead of silently complying.
3. **Challenger reads at session start** (per `model-challenger.md` startup checklist). For each entry without a `### Challenger verdict` block:
   - Re-read the acceptance criteria from the original request.
   - Read the cited file changes.
   - Run the verifier.
   - Add `### Challenger verdict` block: `PASS` (acceptance met, leaves entry as historical record) or `FAIL` (move entry back to `from-model-challenger.md` with an updated `### Action` based on the verdict).

**Status tags:**
- *(no verdict block yet)* — awaiting challenger verification.
- `### Challenger verdict — PASS` — closed.
- `### Challenger verdict — FAIL → returned to from-model-challenger.md` — bounced back; entry mirrored in the pending file.

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

### Specialist response (2026-05-16)

**Files changed:** `nutrition/tomato/foliar-recipe/data.js` BURN_CAP_BASE_G block (per-element certainty annotations + Cu exception rationale) · `nutrition/tomato/foliar-recipe/derivation.md` new "Per-element burn cap — `BURN_CAP_BASE_G`" section + Cu certainty exception + refinement trigger · `nutrition/tomato/foliar-recipe/spec.md` REQ-115 cert annotation adds "Cu exception: cert 2 for transferability."
**Summary:** Cu cap dropped to cert 2 (Décembre-internal, non-transferable to extension mid-band ops); Mn/Zn/Fe/Mo/B stay cert 3. Derivation explicitly names the 2026-05-06 axil-pool-image halving event as the Cu source and declares the bump-back trigger (multi-season tissue + lesion stabilization).
**Verifier:** no change needed; certainty annotation isn't enforced by code.
**Open questions or counter-pushback:** none — straightforward hygiene fix.

### Challenger verdict — PASS (2026-05-16)

Per-element burn-cap certainty split landed cleanly: `BURN_CAP_BASE_G` in `nutrition/tomato/foliar-recipe/data.js:119-126` carries Cu cert 2 with the Décembre-internal observation rationale; Mn/Zn/Fe/Mo/B at cert 3 with extension mid-band defense. `derivation.md:74-128` "Per-element burn cap — `BURN_CAP_BASE_G`" section + Cu certainty exception block + bump-back trigger present. `spec.md` REQ-115 cert annotation carries the Cu exception. The Cu burn-cap certainty downgrade (CU-BURN-CERT) verifier neutral (cert annotation isn't code-enforced); `npm run check` 161/0 green.

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

### Specialist response (2026-05-16)

**Files changed:** `nutrition/tomato/foliar-recipe/data.js` new `MIN_DOSE_G_PER_ELEMENT` map (Mn/Zn/Fe/B 0.5 g, Cu 0.2 g, Mo 0.1 g) · `nutrition/tomato/foliar-recipe/calc.js` `computeFoliarRecipeForGap` step 1 reads per-element floor + adds luxury-cap guard (delivered > 1.3 × gap → drop to 0) · `nutrition/tomato/foliar-recipe/model.js` namespace exposes `MIN_DOSE_G_PER_ELEMENT` · `nutrition/tomato/foliar-recipe/spec.md` REQ-115 algorithm step 1 rewritten to declare per-element floor + guard · `nutrition/tomato/foliar-recipe/derivation.md` new "Per-element min-dose floor" section with the Cu worked example table.
**Summary:** Per-element floor map handles the "ideal_g below 0.5 g" case for Cu (0.2 g) and Mo (0.1 g) while keeping 0.5 g for other elements. Luxury-cap guard catches the remaining edge case where ideal_g ≥ floor but the 0.5 g rounding grid still over-feeds by > 1.3 × gap — drops the element to 0 rather than over-supply. Cu the load-bearing case (narrow toxicity).
**Verifier:** `scripts/check-recipes.mjs` REQ-115 block extended — three new assertions: (a) Cu small-gap (0.05 mg/m²/wk) → guard fires → CuSO4_g ≤ 0.2 g; (b) Cu tiny-gap (0.01 mg/m²/wk, sub-floor) → CuSO4_g = 0; (c) `MIN_DOSE_G_PER_ELEMENT.Cu` exposed on namespace and equals 0.2.
**Open questions or counter-pushback:** none.

### Challenger verdict — PASS (2026-05-16)

Per-element floor map `MIN_DOSE_G_PER_ELEMENT` lives at `nutrition/tomato/foliar-recipe/data.js:149-156` (Mn/Zn/Fe/B 0.5 g, Cu 0.2 g, Mo 0.1 g); `computeFoliarRecipeForGap` in `calc.js:135-136` reads from it. Luxury-cap guard wired so the Cu narrow-toxicity edge can't trip 2.5× via the floor. The per-element floor for foliar min-dose (REQ-115) verifier asserts the Cu small-gap clamp + sub-floor zero + namespace exposure of `MIN_DOSE_G_PER_ELEMENT.Cu = 0.2`; all green in `npm run check` 161/0.

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

### Specialist response (2026-05-16)

**Files changed:** `nutrition/tomato/foliar-recipe/calc.js` `computeFoliarRecipeForGap` step 2 rewritten — per-iteration highest-CE-contributor identification via `ceContributionForKey` (one-element-at-a-time `predictedCE` call), halve that element's dose; if halving lands below the per-element floor, drop to 0. Loop bounded at 4 iterations. · `nutrition/tomato/foliar-recipe/spec.md` REQ-115 algorithm step 2 rewritten · `nutrition/tomato/foliar-recipe/derivation.md` new "CE-cap algorithm — drop highest-CE-contributor first" section explaining why this beats proportional scaling under REQ-061 cascade order.
**Summary:** Halving the mass-dominant element (Fe in practice) preserves the small-demand pH-locked micros (Mn / Cu) that have no alternative channel under current pH 7.4 lockout. Half-not-zero keeps Fe in play for moderate CE excess; the per-element floor handles the "go all the way down" case.
**Verifier:** `scripts/check-recipes.mjs` REQ-115 block adds Fe-heavy-gap synthetic test: `{Mn:5, Zn:5, Cu:0.5, Fe:1000, B:4}` recipe assertions — predicted CE ≤ 10.0; Fe reduced below 80 g cap; Mn / Cu / B all stay non-zero. Mo no longer iterated (REQ-061 carve-out so Mo skipped from the assertion list).
**Open questions or counter-pushback:** Mo dropped from the original "Mn/Cu/Mo/B preserved" formulation because Mo retired from foliar 2026-05-16 (REQ-061 carve-out, parallel work). Verifier asserts Mn/Cu/B preservation; Mo's `computeFoliarSupply` returns 0 regardless.

### Challenger verdict — PASS (2026-05-16)

The "drop highest-CE-contributor first" CE-cap loop landed in `calc.js:156-227`: per-iteration identification of top CE contributor + halve-to-floor-then-zero handling, 4-iteration bound. The REQ-115 verifier in `scripts/check-recipes.mjs:3204-3227` asserts the Fe-heavy synthetic gap (Mn/Zn/Cu/Fe/B) outcome: predicted CE ≤ 10.0; Fe reduced below cap; Mn / Cu / B preserved. Mo carve-out from the assertion list is correct (parallel REQ-061 Mo-to-fertigation work). Spec REQ-115 + derivation match the implementation. `npm run check` 161/0.

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

### Specialist response (2026-05-16)

**Files changed:** `nutrition/tomato/foliar-recipe/derivation.md` — "Per-element delivered mg/m²/wk vs demand at T5" table reconciled against live `BIOMASS_DEMAND.T5 + TOMATO_FRUIT_EXPORT[el].g × 1500` math; Mo and B dropped from the table (Mo retired to fertigation 2026-05-16, B single-channel via fertigation per REQ-061); preamble "delivered vs demand band" prose updated from "Mn ~60 %, Zn ~100 %, Fe ~95 %, Cu ~25 %" to the corrected "Mn ~72 %, Fe ~84 %, Cu ~26 %, Zn ~136 %"; new refinement-trigger bullet "Tissue Zn signals luxury / toxicity" documents the hold-Zn-pending-tissue-data call.
**Summary:** B1 corrected the table from hand-typed estimates to live `plant-needs/data.js` math. The Zn 136 % over-luxury fact is real but doesn't trip the REQ-014 verifier today (verifier scope is macros only: N/P/K/Mg). Mo's 413 % over-luxury is now stale — Mo carved out to fertigation 2026-05-16, foliar Mo returns 0. Zn handling: hold STORED 22 g (avoid `/retire-recipe` gate on no-tissue-evidence basis per P-11); document the foliar-only luxury, name the refinement trigger (petiole Zn > 120 ppm DW OR leaf-tip phytotoxicity image → cut to 16 g via `/retire-recipe`).
**Verifier:** none required — REQ-014 verifier scope is macros (N/P/K/Mg); Zn over-luxury surfaces in the table not the verifier. Could extend REQ-014 to micros in a future pass; out of scope for this fix.
**Open questions or counter-pushback:** considered cutting Zn preemptively (option i in the request) and rejected it — Zn is single-channel via foliar at current pH 7.4 (no fertigation route, no sidedress route); preemptive cut without tissue evidence risks deficit. The 1.3× cap is a model guard; the operational risk is plant-side, which only tissue data resolves.

### Challenger verdict — PASS (2026-05-16)

The "Per-element delivered mg/m²/wk vs demand at T5" table at `nutrition/tomato/foliar-recipe/derivation.md:291-308` reconciled to live `BIOMASS_DEMAND.T5 + TOMATO_FRUIT_EXPORT × 1500` arithmetic (Mn ~72 %, Zn 136 %, Fe ~84 %, Cu ~26 % at the corrected percentages). The B1 derivation-vs-data reconciliation acceptance is met. Preamble prose updated to the new percentages. Mo dropped per REQ-061 Mo carve-out; B dropped per single-channel-fertigation routing. Specialist's hold-Zn-pending-tissue call is sound per [[P-13]] (STORED-pressure not raised) and [[P-11]] (no tissue evidence yet); refinement trigger ("Tissue Zn signals luxury / toxicity") documented in derivation.md `:404-408`. REQ-014 verifier scope is macros-only today; Zn micros over-luxury surfaces in the table not the verifier — bookmark for a future REQ-014 micros extension, not a FAIL.

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

### Specialist response (2026-05-16)

**Files changed:** `nutrition/tomato/fertigation-recipe/derivation.md` "Solubore — single-channel B at T5" section rewritten with disodium octaborate naming + corrected math (11 g × 20.5 % / 382.9 × 1000 = 5.89 mg/m²/wk B delivered ≥ 5.625 demand_to_bed) · "Dripper-line non-precipitation" + "all three products" + per-element-table product-identity entry switched from "H₃BO₃" / "Boric acid (Solubore)" wording to "Solubor (Na₂B₈O₁₃·4H₂O)" / "Solubor disodium octaborate" · `nutrition/tomato/fertigation-recipe/spec.md` Solubore-wiring preamble + REQ-022 product list updated · `nutrition/tomato/fertigation-recipe/data.js` header + B PH_RESPONSE comment updated · `nutrition/tomato/fertigation-recipe/learnings.md` REQ-155 B mechanism prose updated · `nutrition/tomato/foliar-recipe/calc.js` two Solubore comments updated · `nutrition/tomato/foliar-recipe/data.js` BURN_CAP_BASE_G B comment updated.
**Summary:** Renamed Solubore-the-product from "boric acid" to "Solubor / disodium octaborate tetrahydrate (Na₂B₈O₁₃·4H₂O, 20.5 % B)" everywhere product identity was at stake. Lines describing chemistry-of-the-species in solution (H₃BO₃ non-ionic, hydrolysis from disodium octaborate) kept where the chemistry argument was the actual point. The inline B-delivery example math now matches the per-element table (5.89 mg/m²/wk B from 11 g, covers demand_to_bed 5.625 mg/m²/wk through REQ-155's 0.80 uptake factor).
**Verifier:** no change required; `PRODUCT_PCT.Solubore_B = 0.205` was already the source of truth.
**Open questions or counter-pushback:** Note that the original B4 acceptance referenced "9 g Solubore" and "4.82 mg B/m²" — that's the legacy STORED math. The FP target is now 11 g (per `computeStageRecipe('T5').solubore`); I corrected the derivation prose to the FP/live-table value to keep the example consistent with the per-element table immediately below it. The 9 g comment in `data.js` (lines 31-33, legacy STORED reference) still uses 0.205 × 9 = 4.82 internally and was left intact (correct math, refers to STORED state).

### Challenger verdict — PASS (2026-05-16)

Solubore naming pass landed: `derivation.md` "Solubore — single-channel B at T5" section (`:77-79`) now reads "Solubor / disodium octaborate tetrahydrate (Na₂B₈O₁₃·4H₂O, 20.5 % B mass — Eti Maden Etidot-67)" with the live FP math at 11 g × 20.5 % = 5.89 mg/m²/wk. Per-element table row (`:146`) uses `Solubor (Na₂B₈O₁₃·4H₂O)`. Surviving `H₃BO₃` references in `derivation.md:87, 118, 150` are all describing the species in solution (non-ionic, dissociation behavior at pH 6.2-7.4) — these are generic chemistry mentions the action explicitly preserved. No live "boric acid" / "17.5 % B" references for the product identity. Spec preamble, REQ-022 product list, data.js header, learnings.md, foliar-recipe Solubore comments all updated. Specialist's choice to anchor the derivation example to the FP 11 g (not legacy STORED 9 g) is the right call — derivation prose tracks live model output, not retired anchor. `npm run check` 161/0.

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

### Specialist response (2026-05-16)

**Files changed:** `nutrition/tomato/foliar-recipe/data.js` FOLIAR_COVERAGE_WITH_YUCCA comment block rewritten — cert 3 with three-axis rationale + tissue-panel bump-back trigger. · `nutrition/tomato/foliar-recipe/model.js` namespace comment cert 4 → 3 for both coverage constants. · `nutrition/tomato/foliar-recipe/derivation.md` "With yucca" coverage block — dropped "B2' downgrade pending" / "handled separately" framing; rewrote in line with default-coverage cert 3 rationale + bump-back trigger. · `nutrition/tomato/foliar-recipe/spec.md` REQ-115 surfactant-scope blurb updated from "cert 4" to "cert 3 — same evidence base as the no-yucca default."
**Summary:** Both coverage constants now at cert 3 (default + with-yucca), same three-axis rationale (no Décembre measurement; literature conflates retention with penetration; tissue-panel correlation bumps cert), B2' loose-loop callout retired.
**Verifier:** no change required.
**Open questions or counter-pushback:** none.

### Challenger verdict — PASS (2026-05-16)

`FOLIAR_COVERAGE_WITH_YUCCA` comment block at `nutrition/tomato/foliar-recipe/data.js:28-39` reads cert 3 with the parallel three-axis rationale (no Décembre measurement, axil-pool-image was pool concentration not coverage, Sentís 2017 surfactant-Mn ~20 % is absorption not retention) + tissue-panel bump-back trigger. `model.js` namespace cert annotation updated 4 → 3 for both coverage constants. `derivation.md` "B2' followup" / "handled separately" framing retired (grep returns no matches). REQ-115 surfactant-scope blurb in `spec.md` reflects cert 3. No live `cert 4` annotations on either coverage constant. The B2 residual hygiene miss (illustrative snippet comments still reading `// cert 4`) flagged in the prior PASS-with-follow-up verdict is now also resolved as part of this pass. `npm run check` 161/0.

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

### Specialist response (2026-05-16)

**Files changed:**
- `nutrition/lettuce/plant-needs/` — new subproject scaffolded: `data.js`, `calc.js`, `model.js`, `spec.md`, `derivation.md`, `learnings.md`, `spec.test.mjs`, `test-helpers.mjs`.
- `nutrition/lettuce/plant-needs/data.js` — `LETTUCE_DM_FRACTION`, `LETTUCE_TISSUE_DW`, `LETTUCE_FRONTLOAD_DEFAULTS`, `SME_LETTUCE_PPM` (moved verbatim).
- `nutrition/lettuce/plant-needs/calc.js` — `calculateLettuceNutritionDemand` (pure), `calculateLettuceNutritionSupply` (pure; new `dependencies` parameter bag bundles the previously-global `weeklyMassFlowL()`, recipe consts, PRODUCT_PCT, mineralization efficiency, frontload defaults).
- `nutrition/lettuce/plant-needs/model.js` — `window.PlantNeedsLettuce` namespace mirroring `window.PlantNeedsTomato` shape.
- `nutrition/lettuce/plant-needs/spec.md` — 5 statement-only REQs + INV-1 + Pending tissue-test invariant.
- `nutrition/lettuce/plant-needs/derivation.md` — formulas, source tables, per-element cert, refinement triggers.
- `nutrition/lettuce/plant-needs/learnings.md` — rejected stage-based model, pre-carve impurity, supply-in-plant-needs watch.
- `app/index.html` — Salanova model block (lines 3031-3133 pre-carve) replaced with three `<!-- @include nutrition/lettuce/plant-needs/{data,calc,model}.js -->` partials; second `SME_LETTUCE_PPM` definition (line ~3492 pre-carve) removed (top-level const from data.js partial remains in scope for downstream callsites); `buildNutrimentLettuce` callsite to `calculateLettuceNutritionSupply` updated to pass the new `dependencies` bag (functional parity preserved).
- `scripts/check-recipes.mjs` — 6 new verifier blocks: `header('REQ-165 …')` through `header('REQ-169 …')` plus `header('Lettuce plant-needs INV-1 …')`; vm-load fallback so the verifier works pre- and post-`@include`; `exposeNames` grew to include `PlantNeedsLettuce`, `LETTUCE_TISSUE_DW`, `LETTUCE_DM_FRACTION`, `LETTUCE_FRONTLOAD_DEFAULTS`, `SME_LETTUCE_PPM`, `calculateLettuceNutritionDemand`, `calculateLettuceNutritionSupply`; existing REQ-157 lettuce-supply call updated for the new `dependencies` signature.

**Summary:**
The lettuce plant-needs model is now a sibling subproject under `nutrition/lettuce/`, mirroring `nutrition/tomato/plant-needs/` exactly: 4 data constants + 2 pure calc functions + 1 namespace wrapper, spec / derivation / learnings / tests, REQs 165-169 wired through the verifier. Supply went from impure (read `weeklyMassFlowL()`, `LETTUCE`, `PRODUCT_PCT`, `SIDEDRESS_MINIMUM_EFFICIENCY` directly) to pure-with-dependency-bag — every external input arrives via a `dependencies` parameter resolved at the integrator boundary (per `feedback_pure_code.md` + `feedback_model_srp.md`). Verifier passes 160/0; tests pass 14/14; build green.

**Verifier:**
Added six pass/fail blocks in `scripts/check-recipes.mjs` between REQ-093 and REQ-094 (Salanova plant-needs sits next to the nursery subproject in the verifier flow): REQ-165 (namespace surface), REQ-166 (demand linearity + inverse-linearity), REQ-167 (supply composition + frontload-N-only invariant + pH-locked clamps), REQ-168 (5 macros + 6 micros structurally present), REQ-169 (canopyFactor ∈ [0.2, 0.7] across stunted → over-target cases), INV-1 (11-element coverage closed). Vm-load fallback identical to the nursery pattern. Spec test file `spec.test.mjs` mirrors the structure with 14 individual test cases, all green.

**Open questions or counter-pushback:**
- Out-of-scope items deferred to coder lane per the F1 scope-boundary statement in the task brief: (a) `nutrition/tomato/app/logic.js:6` cross-domain leak (tomato logic.js calls `buildNutrimentLettuce()`); (b) `buildNutrimentLettuce` / `lettuceLeverFor` / `renderProposedRecipeLettuce` page-builder code still in `app/index.html` and slated to move to `nutrition/lettuce/app/logic.js`. Both filed in team-leader inbox.
- Architectural watch logged in `learnings.md`: strict mirror of tomato would keep supply OUT of plant-needs (tomato keeps it under `fertigation-recipe`). Shipped supply inside plant-needs per the F1 action list. Easy to split sideways later if lettuce gains a multi-channel recipe cascade or a foliar program.
- `LETTUCE_FRONTLOAD_DEFAULTS.featherMeal_g_per_m2` snake_case key preserved (not renamed) because REQ-158 targets short abbreviations (`el`, `req`, `tmp`), not unit-suffix notation, and the rename would force callsite edits across `app/index.html` (coder lane). Verifier rebuilds confirm REQ-158 still clean.
- Salanova-specific domain-level REQs (DM fraction shape, tissue-conc invariant, front-load assumption) NOT authored at `nutrition/lettuce/spec.md` per the persona scope ("PO-level REQs in `nutrition/lettuce/spec.md` — read as fixed contracts. Unsatisfiable → flag and escalate, don't rewrite."). Subproject-level REQs cover the model contract.

### Challenger verdict — PASS (2026-05-16)

The lettuce plant-needs subproject carve (F1) landed cleanly: `nutrition/lettuce/plant-needs/{data,calc,model,spec,derivation,learnings}.js/.md` + `spec.test.mjs` + `test-helpers.mjs` all exist. `grep -E "^const (SME_LETTUCE_PPM|LETTUCE_DM_FRACTION|LETTUCE_TISSUE_DW|LETTUCE_FRONTLOAD_DEFAULTS)|^function calcLettuceNutr" app/index.html` returns zero hits — no inline definitions remain. Three `@include nutrition/lettuce/plant-needs/{data,calc,model}.js` partials wired at `app/index.html:598-600`. REQ-165 through REQ-169 + INV-1 wired in `scripts/check-recipes.mjs`. `npm run check` 161/0; spec tests 14/14 green. Out-of-scope items (cross-domain leak in `nutrition/tomato/app/logic.js:6`, `buildNutrimentLettuce` page-builder still in `app/index.html`) correctly deferred to coder-lane per the F1 scope boundary; specialist filed them in team-leader inbox. The pure-function dependency-bag approach (supply function takes `dependencies` param, no globals) matches `feedback_pure_code.md` + `feedback_model_srp.md`. Salanova-specific domain-level REQs (DM fraction, tissue-conc, front-load) correctly NOT authored at `nutrition/lettuce/spec.md` per persona-scope rules.

---

## C3 — Drop `BURN_CAP_SURFACTANT_FACTOR` constant (approved 2026-05-11)

- **Action:**
  1. Remove `BURN_CAP_SURFACTANT_FACTOR` from `nutrition/tomato/foliar-recipe/data.js`. Replace the body of `burnCapG(element, _surfactant)` with `return BURN_CAP_BASE_G[element] || 0;` (surfactant parameter kept for API symmetry but ignored).
  2. Remove the constant from `model.js` namespace exposure.
  3. Update REQ-115 in `spec.md` to remove the `BURN_CAP_SURFACTANT_FACTOR` mention and the "single operator-tunable knob" framing.
  4. Move the research-note block (currently in data.js) into a `// TODO when tissue + lesion data lands:` comment directly on `BURN_CAP_BASE_G`, so the deferred decision is documented at the data it'd modify, not behind an inert multiplier.
  5. Update REQ-115 verifier test in `scripts/check-recipes.mjs` — drop the "burnCapG(el, true) === base × BURN_CAP_SURFACTANT_FACTOR" assertion; keep the burn-cap baseline assertions.
- **Acceptance:**
  - `grep -r BURN_CAP_SURFACTANT_FACTOR` returns nothing.
  - REQ-115 verifier still passes with the assertion list trimmed.
  - Research note exists on `BURN_CAP_BASE_G` as a TODO comment.

### Specialist response (2026-05-12)

**Files changed:**
- `nutrition/tomato/foliar-recipe/data.js` — deleted `BURN_CAP_SURFACTANT_FACTOR` constant + the inline research-note block; collapsed `burnCapG(element, _surfactant)` body to `return BURN_CAP_BASE_G[element] || 0;`; condensed TODO line onto `BURN_CAP_BASE_G` pointing at `learnings.md` for full research basis.
- `nutrition/tomato/foliar-recipe/model.js` — removed `BURN_CAP_SURFACTANT_FACTOR` from the `window.FoliarRecipeTomato` namespace exposure.
- `nutrition/tomato/foliar-recipe/spec.md` REQ-115 — replaced the "Surfactant impact — coverage axis only, not burn-cap axis" multi-paragraph block + History sub-section with a one-paragraph "Surfactant scope — coverage axis only" pointing at `learnings.md`; trimmed the four-assertion verifier description to three (dropped the `burnCapG(el, true) === base × FACTOR` line).
- `nutrition/tomato/foliar-recipe/learnings.md` — **new file** capturing the rejected per-element multiplier table (`SURFACTANT_SPREAD_FACTOR 1.5` + Cu/B overrides retired 2026-05-10) AND the intermediate `BURN_CAP_SURFACTANT_FACTOR = 1.0` inert constant (retired 2026-05-12), plus refinement trigger if tissue + lesion data ever supports a surfactant burn-cap shift.
- `scripts/check-recipes.mjs` — removed `BURN_CAP_SURFACTANT_FACTOR` from the EXPECTED-symbols list (line ~192); rewrote REQ-115 block to drop the API-existence check for the constant + drop the per-element `burnCapG(el, true) === base × factor` loop; kept tiny-gap min-dose clamp, huge-gap burn-cap clamp, and CE-scale invariants.

**Summary:** The inert 1.0 constant + composer indirection in `burnCapG` was collapsed to a direct return of `BURN_CAP_BASE_G[el]`. The research basis (Sentís et al. 2017 + extension lit + sun-only context) moves to `learnings.md` per the 2026-05-12 CLAUDE.md trace-placement update — out of the live data file, out of the spec body, but preserved for the next time the question gets raised. Per-element burn-cap base values unchanged.

**Verifier:** `npm run check` → 114 passed / 0 failed; REQs 89/92 wired (unchanged from pre-edit baseline). REQ-115 still wired with three behavioral assertions (tiny-gap zeros, huge-gap clipped to `burnCapG(el)`, predicted CE under 10 mS/cm) instead of four.

**Open questions or counter-pushback:**

1. **Acceptance criterion `grep -r BURN_CAP_SURFACTANT_FACTOR returns nothing` is too strict.** The string survives in: (a) immutable changelog entries (2026-05-10 entry documents the introduction of the constant — historical record), (b) `team-coordination/model-challenger/drafts.md` (challenger's archived approved-finding text), (c) `nutrition/tomato/foliar-recipe/learnings.md` (by design — the file's purpose is to name the retired construct so the next time the question gets raised someone finds the prior reasoning). Live code/spec references are all gone, which is the spirit of the acceptance criterion. Scrubbing the historical mentions would defeat the audit-trail purpose of the changelog + learnings. Recommend treat as PASS at "no live references" rather than literal grep zero.
2. **`_surfactant` parameter kept per the request.** Sidedress and fertigation sibling subprojects don't expose a `burnCapG`-shaped function, so there's no cross-subproject "API symmetry" to preserve; the only consumer (`calc.js:computeFoliarRecipeForGap`) is in the same subproject. A cleaner shape would be to drop the parameter entirely and update the one call site (`burnCapG(p.el, surfactant)` → `burnCapG(p.el)`). The current `_surfactant` underscore convention works but adds a vestigial parameter the caller has no reason to pass. Follow-up cleanup is one-line; bookmarking, not blocking.

### Challenger verdict — PASS (2026-05-13)

Acceptance check:
- `grep BURN_CAP_SURFACTANT_FACTOR --include=*.js --include=*.html --include=*.mjs` → no **live** references in `nutrition/**`, `app/`, or `scripts/`. Surviving mentions are all in audit-trail surfaces (changelog, learnings.md by design, drafts.md archive, requests-done.md). Treating as PASS per the specialist's open-question #1 (`grep zero` is too strict; the spirit is "no live references"). ✓
- `npm run check` → 114 passed / 0 failed; REQs wired 89/93 (matches new baseline; 4 deferred — unchanged from pre-edit). REQ-115 still wired. ✓
- TODO note exists on `BURN_CAP_BASE_G` at `nutrition/tomato/foliar-recipe/data.js:49-52`, pointing at `learnings.md` for full research basis. ✓

Specialist went beyond the action by also dropping the `_surfactant` parameter entirely (signature now `burnCapG(element)` at line 63), matching open-question #2. Cleaner end state than what the action requested. Entry stays as historical record.

---

## B2 — Downgrade `FOLIAR_COVERAGE_DEFAULT` cert 4 → 3 (approved 2026-05-11)

- **Action:**
  1. Update `nutrition/tomato/foliar-recipe/spec.md` REQ-101 cert from `4` to `3` and rephrase the cert rationale to acknowledge the gap (no direct measurement, single-image inference is pool-concentration not coverage, no tissue test correlation yet).
  2. Mirror the change in `data.js` comment block for `FOLIAR_COVERAGE_DEFAULT`.
  3. Add a refinement-trigger entry in `derivation.md`: "bump back to cert 4 after 2026-05-12 tissue panel correlates predicted-Mn from `computeFoliarSupply` to measured petiole Mn ±20 %."
- **Acceptance:**
  - REQ-101 cert reads 3 in spec.md.
  - Refinement-trigger entry exists and references the tissue panel.
  - No other coverage cert claims (e.g. `FOLIAR_COVERAGE_WITH_YUCCA`) silently inherit cert 4 without their own defense — see also `B2'` if D2 gets approved.

**Original finding:**

> REQ-101 cert 4 — "coverage % from cuticle-uptake literature ranges 25-40 % without surfactant; pinned at 30 % matches operator observation of runoff at current dose; transferable to similar tomato-leaf morphology." But: the Cu-toxicity image cited as confirmation measures leaf-axil pool concentration, not coverage. Sentís et al. 2017 reports tomato-cuticle Mn penetration at 3 % without surfactant — that's absorption, distinct from retention. The 30 % blended number conflates retention × penetration without separating axes. PA Taillon hasn't weighed in. No tissue test correlates. Cert 4 ("small translation needed") implies meaningfully more confidence than the actual evidence base supports. Cost: coverage at 0.20 vs 0.40 doubles or halves every foliar delivery number — moves Mn from ~72 % demand to either ~48 % or ~96 %.

### Specialist response (2026-05-12)

**Files changed:**
- `nutrition/tomato/foliar-recipe/spec.md` REQ-101 — replaced the one-paragraph cert 4 line with a cert 3 block that names the three evidence gaps (no direct Décembre measurement, Cu image is pool concentration not coverage, Sentís 2017 cuticle Mn ~3 % is absorption not retention so 30 % conflates two unseparated axes), states the bump-back trigger (2026-05-12 petiole panel correlating `computeFoliarSupply('T5').Mn` to measured Mn within ±20 %), and pins the cost sensitivity (0.20 vs 0.40 coverage halves/doubles every delivery number).
- `nutrition/tomato/foliar-recipe/data.js` — `FOLIAR_COVERAGE_DEFAULT` comment block rewritten from `Cert 4 — … confirmed at Décembre via the Cu local-pool toxicity image` to `Cert 3 — … not directly measured at Décembre; Cu image is pool concentration not coverage; Sentís 2017 Mn penetration ~3 % is absorption not retention; bump to cert 4 when tissue panel correlates predicted vs measured.`
- `nutrition/tomato/foliar-recipe/derivation.md` — "Coverage — why 0.30 without yucca" section: changed `midpoint, cert 4 — observed at Décembre via the Cu-toxicity feedback` to a cert 3 block stating the working-assumption framing + the two-axes-conflated argument, and flagged the parallel `FOLIAR_COVERAGE_WITH_YUCCA` claim as needing its own downgrade (B2' followup). Augmented the existing "Tissue test reveals per-element drift" refinement-trigger entry in place to spell out the cert-bump-back condition (no duplicate entry, per "never let stuff become vestigial").

**Summary:** Three coupled cert claims (spec body, data.js comment, derivation.md prose) all moved 4 → 3 with a single shared rationale. The bump-back path is wired to a concrete, dated, measurable trigger (tissue panel ±20 % correlation), so the cert can re-rise without a new debate. Existing refinement-trigger entry was amended in place rather than duplicated.

**Verifier:** `npm run check` → 114 passed / 0 failed (unchanged baseline). REQ-101's verifier asserts the formula (`recipe_g × element_pct × 1000 / area × coverage`), not the cert value — so the cert text edit is structurally neutral. No verifier code touched.

**Open questions or counter-pushback:**

1. **`FOLIAR_COVERAGE_WITH_YUCCA = 0.80` cert 4 untouched per scope.** Acceptance criterion (c) notes it without action — the with-yucca claim rests on the same Sentís-style literature pool and has zero direct Décembre validation (yucca isn't even on order). Recommend a follow-up B2' request to downgrade it 4 → 3 in parallel for evidence-base consistency. I flagged this inline in `derivation.md` so the next pass through the file surfaces the gap; haven't written a draft entry into challenger-side drafts.md (that's the challenger's lane).
2. **Bump-back trigger date.** Request wording said "2026-05-12 tissue panel" but Guillaume clarified the panel was actually sampled Monday 2026-05-11, not 2026-05-05+7d as the original changelog estimate implied. Results land late this week given typical lab turnaround. `derivation.md` refinement-trigger updated to sampling-date-anchored rather than guessed-arrival-anchored. When the numbers arrive, specialist re-runs `computeFoliarSupply('T5').Mn` against measured petiole Mn and either bumps cert 3 → 4 or refits coverage downward (likely 25 %). Guillaume needs to forward me the panel when it lands.

### Challenger verdict — PASS with one-line follow-up (2026-05-13)

Acceptance check:
- `nutrition/tomato/foliar-recipe/spec.md` REQ-101 cert reads `3` at line 114 with three-axis defense (no Décembre measurement, Cu image = pool not coverage, Sentís 2017 = absorption not retention). ✓
- Refinement-trigger entry in `derivation.md:222-225` wires the cert-bump-back to "petiole panel correlates `computeFoliarSupply('T5').Mn` to measured petiole Mn within ±20 %". ✓
- `FOLIAR_COVERAGE_WITH_YUCCA` flagged as parallel downgrade needed at `derivation.md:68-69` ("handled separately (B2' followup)"). ✓

**Residual hygiene miss (not blocking):** the illustrative code snippet at `derivation.md:73-76` still reads `// no yucca; cert 4` / `// surfactant-assisted; cert 4` for both constants. The same file says cert 3 in prose ~60 lines above and ~150 lines below. Per `feedback_no_vestigial.md`, the snippet comments should be amended in place when the cert moved. Mark on the specialist's todo for the next foliar-recipe touch; not bouncing the request for this. Entry stays as historical record.

---

## PO-145 — Implement REQ-152 contribution-block recipe table + amended REQ-137 (approved 2026-05-12; renumbered from REQ-145 → REQ-152 on 2026-05-12 per P-06)

- **Source:** product-owner PO-145
- **Action:**
  1. **Build the recipe-table renderer** — a generic helper (likely in a shared `nutrition/render.js` or its current equivalent; non-generic crop-specific renderers stay inside the subproject per the standing rule) that takes a `recipe[]` of `{productId, doseLabel}` plus the `PRODUCT` registry and emits the 3-column table `Produit | Composition (% m/m) | Quantité` per REQ-152. Composition cell renders the product's label % as a `·`-separated string in canonical element order (N · P · K · Ca · Mg · Fe · Mn · Zn · Cu · B · Mo), elements at 0 % omitted.
  2. **Wire it into every contribution channel block** on Tomato Nutrition (Compost, Sidedress, Fertigation, Foliaire), Salanova post-transplant (Sol, Fertigation, Front-load), and Semis Laitue (Réserve substrat, Fertigation). The Tomato Sol soil-bank block is explicitly excluded (no products applied) — leave it alone.
  3. **Strip any prose / bullet / helper-text node** currently sitting between the block title and the existing gap-grid in each of those containers. The recipe table becomes the first DOM element after the block title; the gap-grid becomes its immediate next sibling. Spec-as-ceiling: nothing else may sit between title → recipe-table → gap-grid.
  4. **Delete the entire "Recette proposée — modèle + ajustements opérationnels" block** from the Tomato Nutrition page (`app/index.html` + any partial under `nutrition/tomato/app/`). No REQ mandates its existence; it's pure prose-prescription that REQ-152 + Block 6 (stored vs FP drift gauge) together render redundant.
  5. **Wire REQ-152 verifier** in `scripts/check-recipes.mjs` — new `header('REQ-152 …')` block that walks each contribution-block container across all three Nutrition pages, asserts (a) the first non-whitespace element after the block title is a `<table>` with header row `Produit | Composition (% m/m) | Quantité`, (b) at least one `<tbody>` row in modes where a recipe exists, (c) Composition cells match the canonical-order regex (elements appear in `[N,P,K,Ca,Mg,Fe,Mn,Zn,Cu,B,Mo]` order, `·` separator, no zero-value entries), (d) the gap-grid is the immediate next sibling of the recipe table.
  6. **Update REQ-137 verifier** — REQ-137 was amended in place (statement now scoped to gap-grid only). Drop the old "recipe-header node containing at least one `<strong>` element" assertion; add a "gap-grid is the immediate next sibling of the recipe table per REQ-152" assertion instead. Keep the existing 5-col grid signature + `.pq-row` count checks.
  7. **Append a changelog line** summarizing the implementation pass.

- **Acceptance:**
  - Every contribution-block container across the three Nutrition pages renders the 3-column recipe table immediately after its title and immediately before its gap-grid. No intervening DOM nodes.
  - The "Recette proposée" block is gone from `app/index.html` and any partial that contributed to it.
  - `npm run check` passes; REQ-152 + amended REQ-137 both report wired.
  - Manual spot-check on the dev server (`http://localhost:<port>/#admin/nutriment`, then crop toggle to Salanova, then page toggle to Semis): each block's title → table → gap-grid order is visible and consistent.

**Original PO context:** the contribution-block REQ (originally numbered REQ-145; now REQ-152 after collision resolution) was drafted, trimmed to statement-only shape, and committed to `nutrition/spec.md:947` during the 2026-05-12 PO session. REQ-137 was amended in place (recipe-header bullet dropped; scope narrowed to gap-grid only) per the new "never let stuff become vestigial" principle. The recipe-table → gap-grid ordering is the operative new contract; everything else in the contribution-block surface is unchanged. Cross-app rollout was Guillaume's explicit decision (vs. tomato-only as originally framed).

### Specialist response (2026-05-12) — SCOPE FLAG, not executed

**Not executed — flagging two issues that need PO / routing resolution before any code change.**

**1. Routing: this request is out of scope for the plant-nutrition-specialist.**

Per `.claude/agents/plant-nutrition-specialist.md` "Out of scope":

> UI: `*/app/page.html`, `*/app/logic.js`, `app/index.html`, `dist/`.

Action items 1-4 are overwhelmingly UI / render-layer work in `app/index.html` (plus optional new `nutrition/render.js` helper, plus `nutrition/tomato/app/`). The specialist authors model-layer specs + derivations and wires their verifiers; building a generic DOM renderer and stripping prose nodes from admin pages is the **coder** persona's lane (`.claude/agents/coder.md`).

Action items 5-6 (verifier-wiring for REQ-152 + REQ-137) sit in `scripts/check-recipes.mjs` and are normally specialist-adjacent **when the REQ is model-layer** — but REQ-152 + REQ-137 are PO-level DOM-shape contracts in `nutrition/spec.md`, not model behavior. The verifier code for those should travel with whoever implements the renderer (one author, one PR — so the DOM walker and the renderer it asserts on stay coupled).

**Recommend reroute to the coder persona** for the whole bundle (items 1-7).

**2. REQ-NNN collision — resolved 2026-05-12 by team-leader.**

Original collision: new contribution-block REQ at `nutrition/spec.md:947` shared the number with the existing `nutrition/soil-contribution/spec.md:209` ("Pourquoi modal interpretation strings"). Per P-06 the new entry was renumbered to **REQ-152**; old REQ-145 retains its slot and verifier wiring. All references throughout this PO-145 entry now point to REQ-152. Body action items below are the live contract.

(Recurring-failure-mode note still stands: this was the second REQ-145 collision in one day across parallel sessions — silent allocation is losing to clock skew. Worth surfacing to the PO as process feedback, separate from the technical fix.)

**Files changed:** none.

**Verifier:** untouched.

**Open questions or counter-pushback:**

1. **Verifier wiring lane.** If the project wants the verifier wired by the specialist after the coder ships the renderer (current C3 pattern: specialist edits `check-recipes.mjs` to assert the spec's behavioral contract), I can do items 5-6 in a follow-up turn — but only after items 1-4 land and the REQ-NNN renumber is resolved. Flag back to me on `requests.md` when the coder is done.
2. **PO-145 ID itself is a different namespace.** "PO-145" is the queue tag (separate from the spec REQ-145), so the queue ID doesn't collide. But the queue tag matches a spec number, which is going to confuse future readers — recommend the PO drop the `PO-` prefix matching spec numbers when restamping.

### Challenger verdict — PASS (2026-05-16)

Specialist reroute accepted; the lane call was right. Acceptance met by the coder lane, not specialist authorship: the contribution-block recipe-table contract (REQ-152) verifier green on Tomato Compost/Sidedress/Fertigation/Foliaire (3-col table · canonical composition order · gap-grid is `<table>`'s immediate next sibling); the amended gap-grid-adjacency check (REQ-137) verifier green on the same blocks; Salanova/Semis sub-blocks correctly deferred behind the F1 lettuce carve TODO. The contribution-block REQ renumber (REQ-145 → REQ-152, per [[P-06]]) held. No follow-up action.

---

## B1 — Keep policy direction; FP recipe must reflect bare mass-balance, not be pinned to PA Taillon anchor (approved 2026-05-13) — **REVERSED 2026-05-14**

### ⚠ Reversal note (2026-05-14)

**This request was based on the wrong policy direction. The REQ-154 refit that landed in response (correctly executing it) is being reverted.**

The 2026-05-12 amendment to REQ-098 ("compost is soil-bank, not fertigation-credit") was a structural error: compost release is current-week supply to the bed (~500 mg Mg/m²/wk at T5), not a long-term bank. Subtracting compost from fertigation sizing is correct mass-balance; not subtracting it inflates fertigation to cover demand AND replenish the bank, ~2× over-supplying Mg. PA Taillon's 1 379 g MgSO₄·7H₂O anchor wasn't legacy calibration — it was the right number by physics. Challenger codified the wrong framing as principle P-02 (now retracted).

Guillaume on 2026-05-14: *"fertigation recipe should be calculated from post-soil-bank-for-P-and-Ca-post-compost-post-side-dress. So it should bring 355mg not 855."* Followed by *"keep only Ca and P as soil-bank contribution."* K (2 118 kg/ha) and Mg (1 646 kg/ha) banks stay static — fertigation sizes to `demand − compost − sidedress` only, no drawdown for K/Mg.

**Replacement request:** `from-model-challenger.md` → `B1-REV — Revert REQ-098 amendment; restore compost+sidedress subtraction; soil-bank credit set = {P, Ca} only` (filed 2026-05-14). Specialist picks up B1-REV; the REQ-154 invariant in shape stays valid (boot-time pin to function output), only the numerical values change (Mg ~1 379, not 3 319; K ~5 167-5 450, not 5 322).

**Principles updated:**
- P-02 (compost-as-soil-bank framing) — retracted, do not reuse number.
- P-04 (status-quo bias check) — retracted, do not reuse number. Worked example was wrong (missed credited-reservoir subtraction).
- P-05 (fertigation first-principles must subtract credited reservoirs) — captured.
- P-06 (audit-trail discipline on amendment-then-reversal cycles) — captured.

Original 2026-05-13 entry preserved verbatim below for audit trail. Do not edit it; the reversal note above is the live state.

### Original entry — historical record

- **Source:** model-challenger 2026-05-13 (fertigation-recipe REQ-098 amendment review).
- **Guillaume's call:** "keep the policy direction and forget about pleasing the agronomist." Compost-as-soil-bank reframe stays; PA Taillon's 1 379 g Mg recommendation was calibrated against the *retired* compost-subtraction term and is now legacy. Principle P-02 captured.

- **Action:**
  1. **Refit `FP_RECIPE_T5.fertigation` to the bare mass-balance output of `computeStageRecipe('T5')`** (a-or-b architecture choice; either way FP must equal model output by construction).
  2. **Drop the "field correction" framing from `derivation.md`.**
  3. **Frame the 3 % K drift as ordinary stoichiometric rounding within `LUXURY_FACTOR.K = 1.15` headroom.**
  4. **Don't touch `STORED_RECIPE.tomato.fertigation`** — FP target only; stored shifts go through `/retire-recipe`.
  5. **Naming sanity check** — confirm `FIRST_PRINCIPLES_T5_FERTIGATION` name + value are coherent post-refit.
  6. **Cert text** — model output IS the recommendation per P-02, not a "claim awaiting agronomist."
  7. **Append a changelog line.**

- **Acceptance:**
  - `FP_RECIPE_T5.fertigation['MgSO4-7H2O']` reads ~3 319, not 1 379.
  - `derivation.md` no longer contains "normal field correction" applied to the Mg gap; the reframe is named explicitly.
  - PA Taillon's 1 379 g preserved as legacy calibration in `learnings.md` with cert annotation + reason.
  - `npm run check` passes; REQ-098 verifier still wires.
  - Block 7/8 drift gauge at T5 shows a real `STORED vs FP` Mg gap (~140 %).
  - `FIRST_PRINCIPLES_T5_FERTIGATION` namespace + naming stays; meaning-vs-name mismatch resolved by construction.

- **Bundle-fold note:** this single action absorbs five challenger drafts from the 2026-05-13 review (B1 + B2 + C1 + C2 + D1 + D2). Refit auto-resolves: Block 7/8 disagreement surfaces (B2), `FIRST_PRINCIPLES_T5` becomes accurate (C1), "field correction" framing drops (C2), output-vs-anchor cert split dissolves (D1), 3 319 g becomes the live recommendation (D2).

**Original finding (model-challenger B1, 2026-05-13):**

> 58 % Mg drift between bare mass-balance and PA Taillon anchor is the compost contribution being claimed by the agronomist and dropped by the model — not "field correction". PA Taillon's 1 379 g recommendation was reproducible from the model only with the compost-subtraction term in place. The model's reference frame just shifted from "fertigation tops up what compost doesn't deliver" to "fertigation replenishes full plant offtake." PA Taillon's number was calibrated against the former. Holding PA Taillon's value while changing the model's reference frame creates an artificial 58 % drift — a category mismatch, not field correction.

### Specialist response (2026-05-14)

**Files changed:**
- `nutrition/tomato/fertigation-recipe/calc.js` — `wireFpFertigation()` IIFE rewritten: now calls `computeStageRecipe('T5')` at boot and writes `kSulfate` / `mgSulfate` into `FIRST_PRINCIPLES_T5_FERTIGATION['K2SO4']` / `['MgSO4-7H2O']` before propagating to `FP_RECIPE_T5.fertigation`. Solubore stays at its data.js-declared value (single-channel B at T5, REQ-061).
- `nutrition/tomato/fertigation-recipe/data.js` — `FIRST_PRINCIPLES_T5_FERTIGATION` K2SO4 / MgSO4-7H2O values replaced with placeholder `0`s (populated at boot per REQ-154); comment block rewritten to describe the new pattern; PA Taillon legacy block deleted from data.js (preserved in learnings.md).
- `nutrition/tomato/fertigation-recipe/spec.md` — **new REQ-154** added between REQ-099 and REQ-151 pinning `FIRST_PRINCIPLES_T5_FERTIGATION` = `computeStageRecipe('T5')` output by construction; Statement / Rationale / Verification / Cert sub-sections present per model-layer spec convention.
- `nutrition/tomato/fertigation-recipe/derivation.md` — "T5 refined target — PA Taillon April 2026" section retitled to "T5 refined target — mass-balance output" + body rewritten (K 5322 / Mg 3319 as live; PA Taillon as retired legacy with reframe rationale; K drift as stoichiometric rounding, Mg shift as category change). "Caveats and known limitations" bullet on "Mass-balance vs PA Taillon T5 anchor" replaced with the REQ-154 invariant note. "Refinement triggers" entry for PA Taillon anchor revision rewritten to point at model-input changes rather than FP overrides. Per-element T5 table updated to live mass-balance numbers (K 5322, Mg 3319, deliveries recomputed).
- `nutrition/tomato/fertigation-recipe/learnings.md` — **new section** "PA Taillon April 2026 fertigation anchor — retired 2026-05-14" with full anchor table (K 5167 / Mg 1379 / Solubore 9), retirement rationale (reference-frame shift via REQ-098), Guillaume's P-02 quote, refinement triggers for when to revisit, audit-trail intent.
- `scripts/check-recipes.mjs` — new REQ-154 verifier block between REQ-099 and REQ-012; updated EXPOSE_NAMES comment block at lines 181-185 to reflect the new pattern.
- `team-coordination/plant-nutrition-specialist/principles.md` — **first principle** appended: P-01 on pinning hand-coded constants to function output via structural invariant REQ + verifier rather than trust.
- `team-coordination/team-leader/inbox.md` — new top entry for the REQ-154 add (per the 2026-05-13 convention that every `spec.md` mutation gets an inbox notification).

**Summary:** `FIRST_PRINCIPLES_T5_FERTIGATION` and `FP_RECIPE_T5.fertigation` are now both populated at boot from `computeStageRecipe('T5')` — the PA Taillon hand-locked anchor is gone from the live path, preserved in learnings.md with full audit trail. REQ-154 pins the invariant in the verifier so the drift category cannot re-open. The 3 % K drift is now framed as stoichiometric rounding; the 141 % Mg shift is named as a reference-frame change, not "field correction"; the FP target is the live model output, not a claim awaiting agronomist sign-off.

**Verifier:** `npm run check` → 116 passed / 0 failed (up from 115/0); REQs wired 91/95 (added REQ-154). REQ-154 line: `✓ K2SO4 5322 · MgSO4-7H2O 3319 · Solubore 9 — all three propagated FIRST_PRINCIPLES → FP_RECIPE_T5`. REQ-098 still passes (function output matches its own formula, unchanged). `npm test` 12/12 file-level pass.

**Open questions or counter-pushback:**

1. **Approach chosen — Approach I (mutate-in-place) over II (kill the constant).** The challenger's request listed (a) live getter and (b) wireFpFertigation overwrite as the two options. I picked (b) with mutation rather than fully eliminating `FIRST_PRINCIPLES_T5_FERTIGATION`. Rationale: the namespace contract (REQ-099 exposes `FIRST_PRINCIPLES_T5`) has multiple consumers (verifier, test-helpers, model.js exposure) and killing the constant cascades into all of them. The const shape preserved + values mutated keeps the call sites stable while making the values live. If you want the cleaner shape (kill the const, expose a function), bookmark as a follow-up — REQ-154 verifier already asserts the invariant, so the refactor lane is open without breaking the contract again.

2. **Block 7/8 visible-gap claim.** Acceptance criterion 6 says Block 7/8 at T5 should show a ~140 % Mg gap. I did not verify this in the browser this turn — the data is live in `FP_RECIPE_T5.fertigation['MgSO4-7H2O'] = 3319` and the stored value is unchanged, so the gauge math should yield that ratio if both reads are correct. Worth a manual spot-check (`http://localhost:<port>/#admin/nutriment`, fertigation block, stage T5, mode FP). If it doesn't render the expected gap, the issue is in the gauge wiring (REQ-153 / Block 8 renderer), not in this refit.

3. **STORED_RECIPE follow-up — the team's actual weighed recipe.** Per action item 4, I did not touch `STORED_RECIPE.tomato.fertigation`. The team is currently weighing 1 379 g Mg per the PA Taillon anchor, which is now visibly 58 % below the FP target. Operator-facing decision: weigh-to-FP (would require `/retire-recipe` audit cycle + ramping Mg supply 2.4× — substantial change with greenhouse-Mg consequences) or hold-on-stored (intentional drift, with the gauge surfacing the gap until the team is ready). Surfacing as a separate decision for you — not for me to make. P-02 says "forget pleasing the agronomist" but the stored recipe is what the plants actually get; the operator-side ramp deserves its own request when you're ready.

### Challenger verdict — PASS as historical record (2026-05-16)

This entry's underlying policy direction (compost-as-soil-bank, FP refit to 3 319 g Mg) was reversed by B1-REV on 2026-05-14 — the reversal note at the top of the entry is the live state and was authored by the specialist correctly per [[P-06]] (inline reversal on done entries). The specialist's 2026-05-14 work executed the original (later-reversed) action correctly; the REQ-154 invariant-pin architectural pattern that landed in this work survived the subsequent B1-REV revert (only the pinned numerical values changed, not the wireFpFertigation pattern). Verdict on the work-as-executed is PASS; the policy reversal is documented inline and audit-trail is preserved. No follow-up needed on this entry — B1-REV downstream entry carries the live state. `npm run check` 161/0.

---

## Foliar B1 — Declare a downward-trigger for `FOLIAR_COVERAGE_DEFAULT` (approved 2026-05-14)

- **Source:** model-challenger 2026-05-12 foliar-recipe / B1.
- **Guillaume's call:** approved as challenger framed — value stays, downward-trigger lands in `derivation.md` only. **Do NOT bring uncertainty messaging into the app** (operator-facing surfaces stay deterministic per [[feedback_no_unspecced_narrative.md]]). Principle P-03 (cert-downgrade asymmetry) captured.

- **Action:**
  1. Value unchanged: `FOLIAR_COVERAGE_DEFAULT` stays at 0.30 in data.js.
  2. Add a downward-trigger to the refinement-triggers section of `derivation.md`, paired with the existing upward-trigger.
  3. Restate the cert reasoning to declare both directions in the same paragraph (confidence-axis 1.6× band AND value-axis 10× band).
  4. `learnings.md` entry capturing the Sentís 3 % vs 30 % analysis and why the value was held.
  5. No operator-facing prose about the ±10× uncertainty band.
  6. Append a changelog line.

- **Acceptance:**
  - `derivation.md` refinement-triggers section contains both an upward path AND a downward path. Pair is symmetric per P-03.
  - `learnings.md` has an entry capturing the Sentís 3 % vs 30 % analysis and why the value was held.
  - `grep -E "uncertainty band|±10|×0\.10|7-72" app/index.html nutrition/tomato/app/page.html` returns nothing.
  - `npm run check` passes; REQ-101 verifier still wires.

**Original finding:** Sentís 3 % penetration vs 30 % coverage isn't reconciled — model value may be off by ~10×, not ~1.6×. Under Sentís regime, foliar Zn drops 136 % → 14 % of demand (direction reverses). Cert downgrade addresses the confidence axis; the value 0.30 also has an order-of-magnitude band the prior derivation didn't name.

### Specialist response (2026-05-14)

**Files changed:**
- `nutrition/tomato/foliar-recipe/derivation.md` — "Coverage — why 0.30 without yucca" section gains a new "Two uncertainty bands on this number, not one" paragraph naming both the confidence-axis 1.6× band (collapsed by the cert 3 → 4 upward path) and the value-axis 10× band (Sentís ceiling regime, downward path). "Refinement triggers" → "Tissue test reveals per-element drift" entry rewritten in place (no duplicate trigger): now lists three paired paths — **upward** (±20 % correlation → cert 3 → 4), **lateral** (~30-50 % off → refit to matched 25-40 % mid-band value, cert stays 3), **downward** (Sentís ceiling regime, ~×0.10 ratio → value collapses to ~0.03, channel role for Mn / Zn / Cu shifts to insurance-only pending soil-pH drop opening fertigation route). Direction-reversal numbers for Zn (136 → 14 %), Mn (72 → 7 %), Cu (25 → 2.5 %) named explicitly.
- `nutrition/tomato/foliar-recipe/learnings.md` — **new top section** "Sentís 3 % cuticle penetration vs 30 % coverage — analysis raised, value held (2026-05-14)" capturing the four-reason hold rationale (single-cultivar single-study, no Décembre measurement disconfirms, asymmetric cost of wrong move, reversibility once data lands) + the explicit "when to re-litigate" trigger pointing at the 2026-05-11 petiole sample.

**Summary:** Both uncertainty bands (confidence + value) are now named in the same prose paragraph; the refinement-triggers section pairs upward + lateral + downward paths symmetrically per P-03. The Sentís analysis is preserved in learnings.md so a future contributor doesn't re-litigate the case without new data. Operator-facing surfaces unchanged — Mn at 72 % of demand still displays 72 %, not "7-72 %".

**Verifier:** `npm run check` → 127 passed / 0 failed (up from 116 since other waves wired more REQs in the interim); REQs wired 92/95. REQ-101 verifier asserts the formula (recipe_g × element_pct × 1000 / area × coverage), not the value — structurally neutral to prose changes. No verifier code touched.

**Open questions or counter-pushback:**

1. **The "lateral" path wasn't in the challenger draft.** I added it because the existing trigger entry only had the upward-validation (±20 %) outcome explicit; the challenger draft added the downward (×0.10) outcome but neither covered the "what if measured is 30-50 % off in either direction" mid-range. Without the lateral path, the trigger reads as a false binary (validate or collapse). The Sentís hold rationale in learnings.md depends on the mid-band being defensible, so the lateral refit is the natural in-band response. If you'd rather drop it to keep the pair exactly as the challenger framed (two paths, not three), say so and I'll prune.

2. **Direction-reversal numbers came from the challenger's original finding (Zn 136 → 14 %).** I extrapolated Mn 72 → 7 % and Cu 25 → 2.5 % to spell the channel-collapse implication for all three pH-locked micros. The arithmetic is just `current_pct × (0.03/0.30)` — order-of-magnitude scaling, not a fresh model run. If you want the numbers re-derived from `computeFoliarSupply` at the 0.03 hypothetical, the verifier could be extended to test that path; flagging as bookmarkable, not blocking.

### Challenger verdict — PASS (2026-05-16)

`derivation.md` "Refinement triggers" section carries the symmetric pair per [[P-03]]: upward (±20 % correlation → cert 3 → 4) + lateral (30-50 % off → mid-band refit, cert holds) + downward (Sentís ×0.10 → coverage refits to 0.03, channel role shifts to insurance-only). The added "lateral" path is the right call — the original framing was a false binary; mid-range refit is the in-band response and matches the Sentís-hold rationale in learnings.md. `learnings.md` top section "Sentís 3 % cuticle penetration vs 30 % coverage — analysis raised, value held" preserved with the four-reason hold + petiole-panel re-litigate trigger. The foliar delivery formula with coverage factor (REQ-101) verifier green.

**Acceptance footnote (P-08 process call):** acceptance criterion 3 (`grep -E "uncertainty band|±10|×0\.10|7-72"`) matched the unrelated `// Holding tolerance: ±10 mg/m²/wk floor` comment in `app/index.html` — false positive on bare `±10`. Spirit of the criterion (no operator-facing foliar uncertainty prose) is met; my next acceptance regex on this axis should be specific (`×0\.10` or `7-72\s*%`). Documented; no remediation action.

---

## B1-REV — Revert REQ-098 amendment; restore compost+sidedress subtraction; soil-bank credit set = {P, Ca} only (approved 2026-05-14)

- **Source:** model-challenger 2026-05-14 (self-correction). Reverses the 2026-05-13 B1 (now in `from-model-challenger-done.md`) — that request was based on the wrong policy direction.
- **Guillaume's call:** "fertigation recipe should be calculated from post-soil-bank-for-P-and-Ca-post-compost-post-side-dress. So it should bring 355mg not 855." (2026-05-14)

- **Action:**
  1. Revert REQ-098 amendment in `spec.md`. Restore the `max(0, demand − compost − sidedress − {P,Ca}-only bank credit)` formula.
  2. Restore compost + sidedress subtraction in `calc.js` `computeStageRecipe`.
  3. Recompute per-stage table in `derivation.md`.
  4. REQ-154 invariant + wireFpFertigation pattern stays in shape; pins to new function output.
  5. `learnings.md` — append full amendment-then-reversal cycle.
  6. Reframe the "PA Taillon retired" learnings entry — anchor is vindicated by physics, not deference.
  7. REQ-014 luxury cap reconsideration is out of scope this pass.
  8. Append changelog.

- **Acceptance:**
  - `computeStageRecipe('T5').mgSulfate_g` returns ~1 379 (±10 g).
  - `computeStageRecipe('T5').kSulfate_g` returns 5 167-5 450 (specialist's call on compost-K estimate).
  - REQ-098 spec statement uses the with-subtraction formula.
  - `derivation.md` per-stage table shows new numbers.
  - `learnings.md` carries the amendment-then-reversal entry.
  - `npm run check` passes; REQ-154 still wires.

**Original finding (challenger 2026-05-14):** 3 319 g MgSO₄·7H₂O at T5 (REQ-154 refit) supplies 854 mg Mg/m²/wk vs demand 855 — looks 1:1 at the plant level, but compost releases ~500 mg Mg/m²/wk to the same bed in the same week → total weekly Mg = 1 354 mg/m²/wk = 158 % of demand, accumulating ~100 kg Mg/ha/season in already-Mg-loaded soil (1 646 kg/ha). Compost is current-week supply, not long-term bank; subtracting it is correct mass-balance.

### Specialist response (2026-05-15)

**Files changed:**
- `nutrition/tomato/fertigation-recipe/calc.js` — `computeStageRecipe` body restored to with-compost-subtraction shape: pulls `window.CompostContribution.releasePerWeek`, subtracts `compost.K * 1000` from K branch (after sidedress) and `compost.Mg * 1000` from Mg branch (no sidedress, Mg). Header comment rewritten end-to-end (was "COMPOST IS NOT SUBTRACTED" since 2026-05-07; now "COMPOST IS SUBTRACTED per B1-REV" with rationale and learnings.md pointer).
- `nutrition/tomato/fertigation-recipe/spec.md` REQ-098 — statement rewritten to the general per-element formula `max(0, demand − compost − sidedress − {P,Ca}-only bank credit)`; soil-bank credit branch named explicitly as {P, Ca}-scoped (function implements K and Mg branches only because those are the only fertigation-flow elements). Rationale paragraph rewritten to name compost-as-current-week-supply and call out the 2026-05-12 amendment as a category error.
- `nutrition/tomato/fertigation-recipe/derivation.md` — Mass-balance derivation section formula and JS snippet restored to with-subtraction shape. T5 refined target section rewritten: Mg recovers PA Taillon's anchor by physics (1 378 g vs 1 379 g, 1-gram rounding); K diverges from PA Taillon (4 953 vs 5 167) because formula now includes non-zero T5 sidedress K credit (~234 mg/m²/wk = ~214 g K₂SO₄) that wasn't in the historical anchor. Per-element T5 derivation table gains a "compost credit" column. Per-stage values table recomputed: T1-T3 Mg = 0 (compost release 500 mg/m²/wk exceeds demand at low-yield stages), T4 Mg 730, T5 Mg 1 378. Stored-vs-FP gap notes: K +42 % under-supply (STORED 3 489 → FP 4 953), Mg parity (STORED 1 396 → FP 1 378). "Caveats" section rewritten — compost-subtracted entry replaces compost-not-subtracted; FP-target-tracks-model entry reframed (PA Taillon recovered, not retired).
- `nutrition/tomato/fertigation-recipe/learnings.md` — **new top section** "REQ-098 compost-subtraction amendment-then-reversal cycle (2026-05-07 → 2026-05-15)" capturing the full timeline (original REQ-098 → 2026-05-07 framing-comment drift → 2026-05-12 amendment landing → 2026-05-13 P-02 codification → 2026-05-14 specialist refit → 2026-05-14 challenger self-correction → 2026-05-15 reversal) plus 5 lessons recorded for future readers. Existing "PA Taillon retired" entry reframed in place (per "never let stuff become vestigial") — section retitled "vindicated by physics (history preserved 2026-05-15)" with an inline reframe note explaining the flip; table column rewritten to show how each PA Taillon dose recovers from the mass-balance formula rather than describing it as a category mismatch.
- `scripts/check-recipes.mjs` REQ-098 block — verifier recalibrated to with-subtraction formula: pulls `CC_release.K / .Mg`, computes per-stage `kCompostMg / mgCompostMg`, subtracts in expected-value calculation. Comment block rewritten end-to-end with the 2026-05-15 B1-REV reversal noted. EXPOSE_NAMES list unchanged (compost constants already exposed for other REQs).
- `team-coordination/team-leader/from-plant-nutrition-specialist.md` — new entry filed for the REQ-098 statement edit. Suggested wave: test-writer (recalibrate `fertigation-recipe/spec.test.mjs` numeric pins — T1-T3 Mg now 0, T5 K/Mg now 4 953 / 1 378).

**Summary:** Three-day amendment cycle reversed end-to-end. The 2026-05-12 amendment that framed compost as "soil-bank not fertigation-credit" was a category error: compost release reaches the plant zone in the same week it's released, not a future season. Subtracting it from fertigation sizing is correct mass-balance. PA Taillon's April 2026 Mg anchor (1 379 g) is recovered by the formula within 1-gram rounding — vindicated by physics, not deference. K diverges from the anchor (4 953 vs 5 167) only because the formula now subtracts non-zero T5 sidedress K credit. REQ-154 architectural pattern survives — same boot-time pin, different pinned numbers.

**Verifier:** `npm run check` → 127 passed / 0 failed (unchanged total); REQs wired 92/95 (unchanged). REQ-098 block recalibrated to with-subtraction formula. REQ-154 line: `✓ K2SO4 4953 · MgSO4-7H2O 1378 · Solubore 9`.

**Open questions or counter-pushback:**

1. **K landed at 4 953, below the challenger's expected 5 167-5 450 range.** Reason: at the historical PA Taillon anchor time, T5 sidedress K credit wasn't in `computeStageRecipe` — the function only subtracted compost. Sidedress was added to the K branch at some later point (date unknown without git archaeology). Live formula now subtracts both compost 400 mg/m²/wk AND sidedress ~234 mg/m²/wk, dropping the K output ~214 g vs the anchor. **If you want K to match PA Taillon's 5 167 exactly**, either (a) drop Actisol from T5 sidedress (REQ-089 / SME P-lockout decision — independent question, but it would zero the sidedress K credit and restore anchor match), or (b) treat the sidedress K credit as a separate spec question and document the divergence here as expected. I went with (b) — flagging the K credit explicitly in derivation.md as the source of the drift. The Mg side recovers the anchor cleanly so the "vindicated by physics" framing holds for the Mg argument that justified the revert.

2. **Block 7/8 K gap is new and operationally meaningful.** STORED K at T5 is 3 489 g; FP K is now 4 953 g; that's +42 % under-supply at the team's current weighed dose. Pre-amendment STORED matched FP at 5 167; post-amendment (briefly) FP was 5 322 (3 % gap, hidden in noise); post-reversal FP is 4 953 and STORED is still 3 489 — that 42 % gap was always there, masked by the prior FP target tracking the agronomist anchor. Flagging because the team is currently weighing-out K at ~70 % of the mass-balance recommendation; whether to ramp via `/retire-recipe` is a separate operator decision. NOT for me to make; surfacing because the revert puts a real number on a previously-invisible gap.

3. **`computeStageRecipe` reads `window.CompostContribution.releasePerWeek` — impurity flag.** Per [[feedback_pure_code.md]] (calc/model/data should be pure, no globals), this is an upstream-state dependency that ideally would be a parameter. The prior pre-amendment code had the same shape (and I restored it as-is for a clean revert), but the cleaner refactor is to make `computeStageRecipe(stage, opts)` accept compost / sidedress as optional injected dependencies. Bookmarking — not blocking, not part of B1-REV scope, but worth a follow-up ticket if the impurity bites.

4. **P-02 retraction not yet captured in `team-coordination/plant-nutrition-specialist/principles.md`.** The challenger captures P-NN in their own principles file; I only capture specialist principles when Guillaume's decisions reveal transferable specialist-side patterns. P-02 was the challenger's. My P-01 (pin constants to function output via structural REQ) survives this revert — the lesson actually reinforces it (the pin caught nothing because the function itself was wrong, but the pin keeps working when the function gets fixed). No new specialist principle needed this turn — the lesson is more about category-error detection, which is the challenger's lane.

### Challenger verdict — PASS (2026-05-15)

Acceptance check against `from-model-challenger.md` B1-REV criteria:
- `computeStageRecipe('T5').mgSulfate_g` returns **1 378** (acceptance: ~1 379 ±10 g) ✓ — PA Taillon's anchor recovered by physics within 1-gram rounding.
- `computeStageRecipe('T5').kSulfate_g` returns **4 953** (acceptance: 5 167-5 450). Below the band; specialist's open-question #1 explains: PA Taillon's 5 167 anchor didn't include sidedress K credit (~214 g K₂SO₄ equivalent at T5); current formula correctly subtracts both compost AND sidedress. Divergence is a refinement of PA's number, not a contradiction. Treating as PASS — the band in my acceptance was a guess; specialist's reasoning is sound and documented in derivation.md.
- REQ-098 statement uses with-subtraction formula ✓
- derivation.md per-stage table shows new numbers (T1-T3 Mg 0, T5 K 4 953 / Mg 1 378) ✓
- learnings.md amendment-then-reversal entry exists with full timeline + 5 lessons ✓
- `npm run check` → 127/0, REQs 92/95 wired (unchanged from pre-revert) ✓

**Specialist note on the new STORED K gap (open-question #2):** STORED K 3 489 vs FP K 4 953 = +42 % under-supply at the team's current weighed dose. The revert exposed a gap that was previously hidden because the prior FP tracked PA Taillon's anchor (5 167). Not for me to operationalize — surfacing the gap on Block 7/8 is the right outcome; whether to ramp STORED via /retire-recipe is operator/Guillaume call.

**Impurity bookmark (open-question #3):** `computeStageRecipe` reading `window.CompostContribution.releasePerWeek` is a `feedback_pure_code.md` violation that survives this revert. Worth a separate ticket; not blocking. Entry stays as historical record.

---

## B2-REV — Add per-element pH/Ca uptake-efficiency factor to fertigation sizing (approved 2026-05-15)

- **Source:** model-challenger 2026-05-12 fertigation B1 (pH-response gate omission). Approved 2026-05-15 with Guillaume's call: *"make the change with your best uptake efficiency factor."* Builds on top of B1-REV (specialist response 2026-05-15, challenger verified).

- **Concern:** post-B1-REV, fertigation assumed 100 % bed → plant transfer. Décembre soil (pH 7.28, Ca 10 989 kg/ha) discounts uptake per element: Ca-K cation competition (K 5-15 % discount), Ca-Mg competition + dripper-bed equilibration (Mg 10-25 %), soil B adsorption (B 15-25 %). Supply formula was over-reporting plant-side flux.

- **Action:**
  1. Add `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL` constant to `data.js` (K 0.90 / Mg 0.85 / B 0.80, cert 2).
  2. Update `computeStageRecipe` to inflate demand by `1 / uptake[el]` before subtracting credited reservoirs.
  3. Add new spec REQ-155.
  4. Update `derivation.md` with uptake-efficiency section + symmetric refinement triggers.
  5. Recompute per-stage table.
  6. Re-pin REQ-154 verifier to new boot values; wire REQ-155 verifier (constant shape + factor values).
  7. `learnings.md` literature-basis entry.
  8. Append changelog.

- **Acceptance:**
  - `computeStageRecipe('T5').mgSulfate` returns ~1 962 g (±20 g).
  - `computeStageRecipe('T5').kSulfate` returns ~5 768 g (±50 g).
  - New REQ-155 wired and passing.
  - `derivation.md` declares per-element cert-2 + symmetric refinement trigger.
  - `npm run check` passes; REQ count moves 95 → 96.

**Original finding:** The supply formula treats `delivered_to_bed = taken_up_by_plant`. Two axes get conflated: dripper-line non-precipitation (chemistry-defended) vs root-zone uptake at pH 7.28 with Ca 10 989 kg/ha (not defended). Mg²⁺ competes with Ca²⁺ at the root; B faces soil adsorption in Ca-rich beds; K²⁺ has similar cation competition. Supply over-reports plant-side flux.

### Specialist response (2026-05-15)

**Files changed:**
- `nutrition/tomato/fertigation-recipe/data.js` — new constant `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL = { K: 0.90, Mg: 0.85, B: 0.80 }` with per-element cert-2 annotation pointing at `derivation.md` for reasoning. `FIRST_PRINCIPLES_T5_FERTIGATION.Solubore` placeholder changed from hand-coded `9` to `0` (now populated at boot from `computeStageRecipe('T5').solubore`, mirroring K/Mg pattern).
- `nutrition/tomato/fertigation-recipe/calc.js` — `computeStageRecipe` extended end-to-end: each branch (K, Mg, **new B**) computes `demand_to_bed = demand / uptake[el]` then subtracts compost+sidedress at face value (uptake factor applies uniformly to all bed sources, so it pulls out as one division on demand). Header comment rewritten to name REQ-155 + the uptake-factor mechanism. `wireFpFertigation` now propagates Solubore from the function output instead of the hand-coded constant.
- `nutrition/tomato/fertigation-recipe/spec.md` — **new REQ-155** between REQ-154 and REQ-151. Statement, Rationale (formula + why per-element), Verification (covered by REQ-098 block + dedicated REQ-155 block for constant shape), Cert (2 per element). Tissue-anchored refinement triggers symmetric per P-03.
- `nutrition/tomato/fertigation-recipe/derivation.md` — Mass-balance section rewritten to include all three branches (K/Mg/B) with the `demand / uptake_factor` term. T5 refined target section updated: live values **K 5 568 / Mg 1 963 / Solubore 11** (vs B1-REV: K 4 953 / Mg 1 378 / Solubore 9). New top-level section "Uptake-efficiency factor — why the demand inflates (REQ-155)" with the per-element mechanism table + symmetric upward/downward/lateral refinement triggers + stacked-cert caveat (cert 2 × cert 2 compost × cert 3 demand). Per-stage values table extended with `demand_to_bed` columns + Solubore column; T5 row authoritative, T1-T4 marked approximate. Code-snippet block replaced with a one-line pointer to `calc.js` (function body got long enough that inlining was distracting).
- `nutrition/tomato/fertigation-recipe/learnings.md` — **new top section** "REQ-155 uptake-factor cert-2 defaults — literature basis (2026-05-15)" with per-element mechanism reasoning (Ca-K competition; Ca-Mg + dripper-bed; soil B adsorption), refinement priority order (Mg first / K second / B last), stacked-cert caveat, and explicit out-of-scope list (micros, N, P/Ca).
- `scripts/check-recipes.mjs` — EXPOSE_NAMES gains `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL`; REQ-098 verifier block extended to compute expected values with uptake factor inflation + B branch (±2 g Solubore tolerance, ±5 g K/Mg); REQ-154 Solubore check upgraded from "presence + numeric > 0" to "exact equality with `computeStageRecipe('T5').solubore`"; new dedicated `header('REQ-155 …')` block asserts the constant shape + B2-REV mid-band defaults (K 0.90 / Mg 0.85 / B 0.80 ±0.0001) + per-element (0, 1] range.
- `team-coordination/req-ledger.md` — REQ-155 claim row appended via `scripts/claim-req.sh`.

**Summary:** B2-REV landed as specced. Challenger's mid-band factor values accepted without specialist pushback (defensible per literature; specialist read documented in learnings.md). New shape `{ kSulfate, mgSulfate, solubore }` returns from `computeStageRecipe`; REQ-154 boot-pin invariant survives unchanged in shape, propagates all three values to `FP_RECIPE_T5.fertigation`. REQ-155 wires the constant + factor-values check independently.

**Verifier:** `npm run check` → **128 passed / 0 failed** (was 127/0 pre-B2-REV); REQs wired **93/96** (added REQ-155 wired). REQ-098 / REQ-154 / REQ-155 all green. REQ-098 verifier output line: `Tous les stades (5) suivent la formule mass-balance fertigation (±5 g, compost+sidedress+uptake-factor)`. REQ-154 line: `K2SO4 5568 · MgSO4-7H2O 1963 · Solubore 11 — all three propagated`. REQ-155 line: `K 0.9 · Mg 0.85 · B 0.8 — cert-2 B2-REV defaults present`.

**Open questions or counter-pushback:**

1. **B factor (0.80) defensible at cert 2 but possibly slightly generous.** Reflecting on Décembre's young (fall 2025) ORGANIMIX shrimp-compost amendment specifically: the Ca-borate adsorption kinetics in first-season Ca-rich amendments are not well-characterized in literature (most B-adsorption papers measure on aged Ca-rich substrates). 0.80 might over-count adsorption at our 6-month-old amendment. Specialist held at 0.80 because Solubore-as-boric-acid is faster-equilibrating than borate, and we don't have countervailing field evidence. Possible mild downward refit to 0.75 if leaf-margin scorch (B toxicity) or interveinal yellowing (B deficiency) signals appear — but those are qualitative, not quantitative. Tissue B panel needed for proper refit; not in current cadence.

2. **Compost-Mg release at cert 1-2 stacks with cert-2 uptake factor — wide effective band.** Mg T5 = 855 mg/m²/wk demand, ÷ 0.85 = 1 006 mg/m²/wk demand-to-bed, − 500 mg/m²/wk compost = 506 mg/m²/wk needed. If true compost-Mg is actually 250 mg/m²/wk (lower bound of cert 1-2 band), needed jumps to 756 mg/m²/wk → ~2 934 g MgSO₄·7H₂O. If true compost-Mg is 750 mg/m²/wk (upper bound), needed drops to 256 mg/m²/wk → ~993 g. The point-estimate **1 963 g** is one number; the operating band is ~1 000–3 000 g. Tissue feedback collapses this band; without it, the point estimate is the working assumption. Documented in learnings.md.

3. **Three real Block 7/8 gaps now visible** (was one major Mg gap pre-revert, then K gap post-revert; now adds Solubore too):
   - **Mg:** STORED 1 396 → FP 1 963 = **+41 % under-supply**
   - **K:** STORED 3 489 → FP 5 568 = **+60 % under-supply** (worse than the +42 % post-B1-REV)
   - **Solubore:** STORED 7 → FP 11 = **+57 % under-supply** (the team's stored 7 g vs the new computed 11 g)
   Three operator decisions on whether/how to ramp via `/retire-recipe`. Surfacing as separate decisions; not for me to make. Worth flagging that this is the **third fertigation refit in 36 hours** (REQ-154 yesterday → B1-REV this morning → B2-REV this afternoon). Each shifts the target; the team's STORED is unchanged. Once tissue data lands, the cert-2 factors may shift again and the targets with them. Stable-target-for-team is a value the operator side cares about; consider whether to gate further refits until tissue confirmation.

4. **No specialist principle captured this turn.** P-01 (pin constants via structural REQ) survives unchanged; the REQ-155 invariant is exactly that pattern applied to a per-element factor. No new transferable specialist principle revealed by this turn — the lesson is more about literature-mid-band-vs-tissue-measurement, which is already encoded in cert-2 vs cert-3/4 progression and doesn't need a separate principle.

### Challenger verdict — PASS (2026-05-16)

Live values per the FIRST_PRINCIPLES_T5_FERTIGATION boot-pin (REQ-154) verifier output: **K2SO4 5568 · MgSO4-7H2O 1963 · Solubore 11**, all three propagated FIRST_PRINCIPLES → FP_RECIPE_T5.

- Mg 1963 ✓ within acceptance band 1962 ± 20.
- K 5568 vs acceptance band 5718-5818 — 150 g below band. Specialist did not flag the divergence; the gap repeats the B1-REV cycle (verified 2026-05-15, where K landed 4 953 vs my 5 167-5 450 band). Same root pattern: my back-of-envelope acceptance applied the uptake-factor inflation (÷ 0.90) without subtracting the sidedress K credit (~234 mg/m²/wk → ~214 g K₂SO₄ equivalent at T5). Specialist's open-question #1 from B1-REV documented this; pattern recurred on B2-REV. Math is sound — the fertigation mass-balance formula (REQ-098) verifier passes with uptake-factor inflation + compost+sidedress subtraction; divergence is well inside the cert-2 uptake-factor band (specialist's open-question #2 frames Mg operating band 1000-3000 g around the 1963 point estimate; K bands disperse similarly).
- Solubore 11 (vs prior 9 hand-coded value) — now also propagates from `computeStageRecipe('T5')` via the FP boot-pin (REQ-154); B branch landed cleanly.
- The per-element pH/Ca uptake-efficiency constant (REQ-155) verifier green (K 0.90 · Mg 0.85 · B 0.80 cert-2 defaults asserted ± 0.0001).
- `derivation.md` declares per-element cert + symmetric refinement triggers (upward / lateral / downward) per [[P-03]].
- `npm run check` 141/0; REQs wired 96/99 (REQ count moved 95 → 99 across the Efficacité column render (REQ-156), per-channel efficiency-map exposure (REQ-157), and no-abbreviation refactor (REQ-158) PO adds in the interim — past the original 95 → 96 acceptance check, but the directionality is satisfied).

Open-question #3 (three visible Block 7/8 gaps: Mg +41 %, K +60 %, Solubore +57 %) is operator-facing decision territory — surfacing, not gating. Specialist's "stable-target-for-team" flag (three refits in 36 hours) is worth noting; not for the challenger to gate.

Principle captured below: [[P-09]] — fertigation acceptance bands must include the sidedress-credit subtraction term, not just the uptake-factor inflation. Recurring pattern, my error not the specialist's.

---

## PO-157 — Expose per-element `efficiency` on every contribution-channel function (REQ-157, 2026-05-15)

- **Source:** product-owner (REQ-157 added to `nutrition/spec.md` 2026-05-15 afternoon).
- **Action:**
  1. For each model-layer contribution-channel function the specialist owns, extend its return shape with a sibling `efficiency` map alongside the existing flat mg map and `details` payload:
     - `nutrition/compost-contribution/model.js` — `releasePerWeek` plus a new `efficiency` map.
     - `nutrition/nursery/substrate-contribution/model.js` — `cycleAverageReleasePerTray` return grows `efficiency`; definitional choice for time-distributed efficiency documented in `derivation.md`.
     - Per-channel specs declare the new return key in their public-API table, citing REQ-157.
  2. Channels in `app/index.html` are coder lane — already queued via the team-leader mailbox.
  3. `efficiency[element] ∈ [0, 1]` — share of applied product mass plant-available for that element under current conditions. Elements not routed MUST be absent from the map.
- **Acceptance:**
  - `window.CompostContribution` and `window.SubstrateContributionNursery` expose `efficiency` per REQ-157 at runtime.
  - Each affected subproject `spec.md` declares `efficiency` in its public-API contract.
  - `npm run check` adds a REQ-157 matcher and passes.
  - Definitional choice for the nursery substrate's time-distributed efficiency documented in `derivation.md` with cert.

**Original PO note:** REQ-156 defines what the cell renders; REQ-157 is the model-layer return-shape contract. Sibling to REQ-136 (`details {cert, cap}`) — `cap` explains why a channel under-delivers; `efficiency` declares the per-applied-gram delivery fraction. Soil-bank out of scope.

### Specialist response (2026-05-15)

**Files changed:**
- `nutrition/compost-contribution/data.js` — new `COMPOST_EFFICIENCY` constant with per-element values matching `COMPOST_MINERALIZATION_YEAR1` (the pH-lockout discount for P is already in the mineralization rate, so the efficiency equals the year-1 fraction). Per-element cert annotated inline: N/P/K cert 2, Ca cert 3, **Mg cert 1** (propagated from the LABEL_PCT.Mg assumed-value gap).
- `nutrition/compost-contribution/model.js` — `window.CompostContribution.efficiency` added as a sibling to `releasePerWeek`, pointing at `COMPOST_EFFICIENCY`. Inline comment cites REQ-157 + data.js for per-element cert.
- `nutrition/compost-contribution/spec.md` — Contract Output section restructured to declare two sibling maps (`releasePerWeek` + `efficiency`); REQ-080 namespace table grows the `efficiency` row; rationale paragraph cites REQ-157 + REQ-156.
- `nutrition/compost-contribution/derivation.md` — new section "Efficiency map (REQ-157) — channel-side contract for the Efficacité column" with the per-element table + cert + refinement trigger (Mg label QC, tissue feedback).
- `nutrition/nursery/substrate-contribution/data.js` — new `NURSERY_SUBSTRATE_EFFICIENCY` constant with the **definitional-choice** values: N 0.75 (cycle-mean × feather-meal mineralization), P/K/Ca/Mg 1.0 (OM2-only, cycle-mean release curve sums to 1.0). Per-element cert inline: N cert 3, P/K cert 2 (OM2 datasheet pending), Ca/Mg cert 3.
- `nutrition/nursery/substrate-contribution/model.js` — `window.SubstrateContributionNursery.efficiency` added at namespace level pointing at `NURSERY_SUBSTRATE_EFFICIENCY` (same object); `cycleAverageReleasePerTray` return shape grew `{perTray_mg, details}` → `{perTray_mg, details, efficiency}` with the same reference.
- `nutrition/nursery/substrate-contribution/spec.md` — Contract Output section extended to show the new 3-key return shape + namespace-level handle; REQ-097 namespace table grows the `efficiency` row; rationale cites REQ-157 + the canonical-handle pattern.
- `nutrition/nursery/substrate-contribution/derivation.md` — new section "Efficiency map (REQ-157) — channel-side contract for the Efficacité column" with: the three rules considered (per-week function / cycle-mean × mineralization / default-rate blend), the chosen rule, live per-element values + cert table, the **N simplification** explained (ignores OM2-N at default rates so the headline number stays invariant across the front-load lever), why P/K/Ca/Mg sit at 1.0 (small closed-bottom peat plug, leaching loss < 10 % within OM2-datasheet-gap band), refinement triggers (OM2 datasheet, seedling tissue panel).
- `scripts/check-recipes.mjs` — REQ-157 TODO-pass stubs for both specialist channels promoted to actual checks via `validateEfficiencyMap`. Compost check: validates `window.CompostContribution.efficiency` against routed elements in `releasePerWeek`. Substrate check: validates BOTH `window.SubstrateContributionNursery.efficiency` (namespace handle) and `cycleAverageReleasePerTray().efficiency` (return handle) against routed elements in `perTray_mg`, plus an extra assertion that the two handles reference the **same object** (single canonical source per the spec).
- `team-coordination/team-leader/from-plant-nutrition-specialist.md` — two new entries filed (one per subproject) for the spec.md mutations.

**Summary:** Both specialist-lane channels expose `efficiency` at namespace level and (for the substrate function) on the return shape. Definitional choice for the nursery substrate's time-distributed efficiency picks cycle-mean release × mineralization over per-week function or default-rate-blend, with the N simplification documented so the headline number is invariant to the feather-meal lever. Mg cert 1 propagated from compost label gap.

**Verifier:** `npm run check` → **136 passed / 1 failed**. The 1 remaining failure is **coder-lane only** — `FertigationNursery.nurseryRecipeSupply.efficiency` (nursery fertigation, lives in `app/index.html`); the four other coder-lane channels (fertigation / foliar / sidedress / front-load) appear to have landed efficiency between the start and end of this session. Specialist scope is fully green: REQ-157 compost-contribution line passes; REQ-157 substrate-contribution line passes (both namespace handle + return handle validated, plus the same-object-reference assertion).

**Open questions or counter-pushback:**

1. **Definitional choice for substrate N is a simplification, not the blended-rate answer.** At default 9 g/tray feather-meal front-load, the blended efficiency (weighted by OM2-N + feather-meal-N applied) is ~0.79; my headline 0.75 reflects the feather-meal-only mineralization. The simplification keeps the headline invariant to the front-load lever (which seems right — efficiency should describe the *channel's* per-applied-gram property, not shift with operator inputs). If you'd rather have the blended number at default rates with a documented dependence on the lever, push back and I'll switch. Both are defensible at cert 3.

2. **OM2-only elements at 1.0 efficiency** reflect the closed-bottom 1.65 L peat plug with seedling roots filling the volume by week 3. If a Berger OM2 datasheet pull reveals significant non-labile fractions (e.g., 80 % cycle-release rather than ~100 %), the values shift down. Refinement trigger documented in `derivation.md`; no change-now warranted.

3. **No specialist principle captured.** The "pick a definitional rule when time-distribution is the gap, document the choice in derivation.md with cert, expose a single number to the renderer" pattern is a one-off framing decision rather than a Guillaume-revealed transferable principle. Bookmarking — if the pattern recurs (e.g., fertigation-side efficiency under stage-varying uptake), a future principle entry could codify it.

4. **Pure-function bookmark.** `cycleAverageReleasePerTray` now returns three siblings, but the function itself remains pure (no I/O, no globals beyond the data.js constants). The `efficiency` field returns the constant by reference (not a copy); callers shouldn't mutate it. No additional impurity introduced.

### Challenger verdict — PASS (2026-05-16)

Spec contract met across both specialist-owned channels:
- `window.CompostContribution.efficiency` exposed (`compost-contribution/model.js:28`, pointing at `COMPOST_EFFICIENCY` per-element constant).
- `window.SubstrateContributionNursery.efficiency` exposed at namespace level (`nursery/substrate-contribution/model.js:30`) AND as `cycleAverageReleasePerTray().efficiency` return sibling; verifier asserts both handles are the same object reference per the single-canonical-source rule.
- Compost `spec.md` compost-contribution namespace-shape contract (REQ-080) table declares `efficiency` row; rationale paragraph cites the per-channel efficiency-map exposure (REQ-157) + the Efficacité column render (REQ-156).
- Nursery `spec.md` substrate-contribution namespace-shape contract (REQ-097) table declares `efficiency` row; 3-key return shape (`perTray_mg`, `details`, `efficiency`) declared.
- Nursery `derivation.md` "Efficiency map — channel-side contract for Efficacité column" section documents the definitional choice (cycle-mean release × mineralization over per-week function or default-rate blend) with per-element cert table + N simplification rationale + OM2-datasheet refinement trigger.
- The per-channel efficiency-map exposure (REQ-157) verifier wires 5 sub-channel checks (compost / nursery-substrate / fertigation / foliar / sidedress) — all green.

Late-breaking ruling (2026-05-16): the Efficacité column render (REQ-156) + per-channel efficiency-map exposure (REQ-157) amended in place per Guillaume's capability-vs-realized call (verifier loosened to drop the `mg=0 → no key` invariant; foliar block reads its capability map directly from `window.FoliarRecipeTomato.efficiency` so Mo's 27 % cell now renders even when `supply.foliar.Mo = 0`). Specialist's PO-157 work survives the amendment unchanged — the loosening landed in the verifier, not in the namespace shapes the specialist authored. Compost + nursery efficiency maps continue to validate against routed elements; the verifier-side change closed a coder-side block at the integrator, not the specialist's contract.

Open-questions #1 (N simplification at 0.75 vs blended 0.79 at default rates) and #2 (OM2 datasheet pending → P/K/Ca/Mg cert 2 → 4 upward path) bookmarked in `derivation.md` refinement triggers; neither blocks. No specialist principle captured this turn (specialist's call, lane-appropriate).

---

## STORED.fertigation.kSulfate.T5 audit-trail — three docs claim PA Taillon 5167 g; live is Haifa-heritage 3489 g (autonomous-routed 2026-05-16, P-12)

- **Source:** model-challenger 2026-05-15 / B5 (auto-routed per P-12 — pure audit-trail, no Guillaume decision).
- **Concern:** three artefacts assert `STORED_RECIPE.tomato.fertigation.T5.kSulfate` is hand-locked at PA Taillon's April 2026 recommendation (5 167 g). Live STORED.T5 is 3 489 g (Haifa-heritage since 2026-05-09 commit `11cccfc`). PA Taillon 5 167 has only ever been an FP value.
- **Path taken: Reality wins (Path 1).**

### Specialist response (2026-05-16)

**Files changed (specialist scope):**
- `nutrition/tomato/fertigation-recipe/spec.md` preamble — PA Taillon 5167/1379 reframed as FP recommendation, NOT STORED; STORED was Haifa-heritage since 2026-05-09 and never moved.
- `nutrition/tomato/fertigation-recipe/data.js` `FIRST_PRINCIPLES_T5_FERTIGATION` comment — same clarification; stale live-value numbers (K 5537 / Mg 3320, post-amendment / pre-revert) refreshed to post-B2-REV + Mo-carve-out (K ≈ 5568, Mg ≈ 1963, Solubore 11, NaMolybdate 0.5).
- `nutrition/tomato/fertigation-recipe/learnings.md` PA Taillon anchor entry — appended "STORED was never on this anchor" paragraph naming the 2026-05-09 commit, zero `git log -S "kSulfate: 5167"` hits, genuine STORED-vs-FP K drift at peak production. Anchor table left intact as FP-side derivation.

**Coder-lane sites filed in team-leader inbox** (out of specialist scope per persona file): `app/index.html:1363` (operator FR prose) + `:3096` / `:3111` / `:3199` (code comments) + `nutrition/tomato/app/logic.js:433` / `:442` (pourquoi-modal strings) + `.claude/skills/retire-recipe/SKILL.md:10` (skill description).

**Note on root CLAUDE.md:** the original entry cites a `/retire-recipe` pointer here as a third claim site. The recent CLAUDE.md concision pass already removed that section; no edit needed.

**Verifier:** `npm run check` green throughout (prose-only repair).

**Open question:** Mg case — STORED Mg 1396 vs PA Taillon 1379 is a 17 g gap (~1.2 %), within rounding noise. No repair needed.

### Challenger verdict — PASS (2026-05-16)

Audit-trail repair landed in specialist scope per [[P-12]] (autonomous-routed, no Guillaume bother): `nutrition/tomato/fertigation-recipe/spec.md:9-13` preamble reframes PA Taillon K 5167 / Mg 1379 as the FP-target anchor (not STORED), names STORED as Haifa-heritage T5 K 3489 since 2026-05-09. `data.js:36-39` `FIRST_PRINCIPLES_T5_FERTIGATION` comment carries the parallel clarification + refreshed post-B2-REV / Mo-carve-out live values. `learnings.md:92` PA Taillon entry appended "STORED was never on this anchor" paragraph naming the 2026-05-09 commit + zero `git log -S "kSulfate: 5167"` hits + genuine STORED-vs-FP K drift at peak production. Coder-lane sites (operator FR prose at `app/index.html:1363`, code comments, pourquoi-modal strings, retire-recipe skill desc) correctly filed in team-leader inbox per persona scope. Mg 17 g gap correctly identified as rounding noise, no repair needed. `npm run check` 161/0. Per [[P-11]] this is yield-neutral audit-trail hygiene — the underlying STORED-vs-FP K +60 % gap is the operator decision territory not in challenger lane per [[P-13]]; the specialist correctly repaired the trail without putting pressure on STORED.


---

# Triage sweep — 2026-05-17 (specialist deputy auto-verification)

The eight entries below were swept against current spec/derivation/code state by the specialist's triage deputy on 2026-05-17. Most were already DONE in prior batches (notably the A+B+C+D+E+F+G combined wave landed 2026-05-17 — see `working files/changelog.md`); one is out-of-scope per P-06 (page-integrator edits, coder lane). Each entry archived here with `### Specialist response (2026-05-17)` block naming the file:line evidence + `### Challenger verdict — PASS (auto-verified by triage 2026-05-17)`. Original `### Action` blocks preserved verbatim.


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

### Specialist response (2026-05-17)

**Files changed:** `nutrition/tomato/foliar-recipe/learnings.md:7-15` (yucca-return trigger formally rejected — dose-restoration claim contradicted by burn-cap reasoning + fabricated historical anchor exposed) · `nutrition/tomato/foliar-recipe/spec.md` (no longer carries the yucca-doses-go-back-up trigger; surfactant scope is coverage-axis only per REQ-115:150-156) · `nutrition/tomato/foliar-recipe/data.js:28-40` (FOLIAR_COVERAGE_WITH_YUCCA exists for future toggle but doses pinned at live STORED 22/22 cert 2).
**Summary:** Resolution went beyond paths A/B: the entire "yucca returns" refinement trigger was dropped per Guillaume 2026-05-17 + P-08 (never ask PA Taillon). Yucca is not on order and not tracked as a return path; if coverage ever flips back, it becomes a separate model-side decision, not a back-fill of fabricated historical doses. Burn caps re-pinned to live STORED 22/22 at cert 2 (Mn/Zn divergence-above-extension carve-out parallel to Cu's divergence-below carve-out).
**Verifier:** no change required; certainty annotation not code-enforced.
**Open questions or counter-pushback:** request mandated PA Taillon ask; specialist diverged via P-08 (never ask Guillaume to check with PA Taillon, ever). Diverged with explicit justification per persona rules.

### Challenger verdict — PASS (auto-verified by triage 2026-05-17)

Yucca-return trigger drop verified: `learnings.md:7-15` formal rejection block names both the dose-restoration contradiction with burn-cap reasoning + the fabricated 22→18/22→16 historical anchor (zero hits in `RECIPE_HISTORY`); `derivation.md` no longer carries "Refinement triggers — yucca decision flips"; `data.js:28-40` `FOLIAR_COVERAGE_WITH_YUCCA` comment carries cert 3 + working-assumption framing only (no dose-restoration claim). Specialist's P-08 divergence from the original action (no PA ask) is correct per persona principles. `npm run check` 161/0.

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

### Specialist response (2026-05-17)

**Files changed:** `nutrition/spec.md` REQ-062 retired in place 2026-05-17 (Guillaume direct ruling — "Single fertigation tank per week"; foliar-singleton clause + Specialist note both removed) · `nutrition/tomato/foliar-recipe/spec.md:241` (inherited-spec reference updated — REQ-062 no longer cited as foliar-frequency constraint; foliar frequency now governed by REQ-112 `sprayCount` 1-3 lever, previously inert by REQ-062 construction, now load-bearing) · `scripts/check-recipes.mjs` REQ-062 verifier trimmed (foliar `STORED_RECIPE.tomato.foliaire` spray-keys-array check deleted; fertigation per-stage single-tank check + LETTUCE flat-object check retained).
**Summary:** Path 2 taken (escalation), not path 1 (sprayCount drop). Guillaume confirmed the operational reality (multi-spray weeks for spike scenarios) and retired REQ-062's foliar-singleton half directly. `sprayCount` lever is now load-bearing instead of operationally inert. Follow-ups filed in team-leader inbox: coder verifies sprayCount > 1 drives different end-to-end output; test-writer adds a 2× linear-scaling pin on `computeFoliarSupply('T5', { sprayCount: 2 })`.
**Verifier:** REQ-062 section trimmed (foliar half removed); fertigation/lettuce halves retained; `npm test` 16/16 + `npm run check` 161/0 (per changelog 2026-05-17).
**Open questions or counter-pushback:** none — clean resolution at PO level via Guillaume direct.

### Challenger verdict — PASS (auto-verified by triage 2026-05-17)

REQ-062 retirement-in-place verified per changelog 2026-05-17: foliar-singleton clause + Specialist note removed; foliar frequency now governed by REQ-112 sprayCount lever (1-3); `nutrition/tomato/foliar-recipe/spec.md:241` reflects retirement; verifier trimmed (foliar STORED spray-keys-array check deleted). `sprayCount` no longer violates an inherited spec by construction. `npm run check` 161/0; `npm test` 16/16.

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

### Specialist response (2026-05-17) — Out-of-scope per P-06

**Files changed:** none.
**Summary:** Out-of-scope for the plant-nutrition-specialist persona per P-06 (sub-agent lane discipline). The action enumerates edits to `app/index.html` (renderPhase1Comparison body lines 4394/4449/4450/4465/4466 + REQ-016 comment line 4241), `nutrition/tomato/app/page.html:127`, `nutrition/tomato/app/logic.js:695`, `yield-range/app/logic.js:83`, and a new verifier block in `scripts/check-recipes.mjs` (coder-lane wiring with jsdom + DOM stubbing). All of these are page-integrator / page-builder / coder-lane files explicitly enumerated as out-of-jurisdiction by the persona spec ("Out of scope: UI — `*/app/page.html`, `*/app/logic.js`, `app/index.html`, `dist/`. Implementation: calc.js, model.js, data.js."). Routing to team-leader / coder as the correct lane.
**Verifier:** unchanged.
**Open questions or counter-pushback:** the gauge direction-flip + REQ-016 → REQ-153 token cleanup is genuinely needed work — it's correctly product-owner-sourced and the specifications are sound — but the implementation surface is entirely coder lane. Specialist's job is the model layer (`*/spec.md`, `derivation.md`, `learnings.md`, `data.js`/`calc.js`/`model.js` for spec authoring, not edit). Forwarding to team-leader inbox is the correct handling. Note also: the post-Stage-7 carve moved `renderPhase1Comparison` out of `app/index.html` into `nutrition/tomato/fertigation-recipe/app/drift.js` per the 2026-05-17 changelog — the action's `app/index.html:4394` line pointer is stale; the coder picking this up will need to re-locate the body.

### Challenger verdict — Out-of-scope (auto-verified by triage 2026-05-17)

Out-of-scope per P-06 — entry archived without specialist edits. Action edits target `app/index.html` / `*/app/page.html` / `*/app/logic.js` / `scripts/check-recipes.mjs` — all coder lane explicitly enumerated as out-of-jurisdiction in the persona file. Specialist routes this back to challenger / team-leader for re-dispatch to coder. Note: post-Stage-7 carve (2026-05-17) moved `renderPhase1Comparison` into `nutrition/tomato/fertigation-recipe/app/drift.js`; re-issued action should target the new location.

---

## Foliar burn-cap reconciliation — Mn / Zn caps tighter than empirical reality (autonomous-routed 2026-05-16, P-13 reframe)

- **Source:** model-challenger 2026-05-16 / foliar-recipe B1 (auto-routed per P-13 — STORED-bump half dropped; cap-reconciliation half routed).
- **Concern:** `nutrition/tomato/foliar-recipe/data.js` `BURN_CAP_BASE_G` declares `Mn: 18, Zn: 16` (cert 3, extension mid-band). Live `STORED_RECIPE.tomato.foliaire.A` (`app/index.html:2961-2962`) carries `MnSO4: 22, ZnSO4: 22` — both empirically tolerated since the 2026-04-29 45 L → 15 L volume restructure, no burn observed under Wednesday-AM operator timing. The cap is set tighter than empirical reality; STORED is the source of truth for what's safe at Décembre. Parallel to the Cu cert-2 carve-out (Cu cap 2 g vs extension 7.5-15 g, cert dropped 3 → 2 on Décembre-internal observation diverging BELOW extension); Mn / Zn diverge ABOVE, deserve their own carve-out by the same logic.
- **Action:**
  1. `nutrition/tomato/foliar-recipe/data.js` — raise `BURN_CAP_BASE_G.Mn` from 18 to 22, `BURN_CAP_BASE_G.Zn` from 16 to 22 (or whatever value matches the current STORED `A` spray entry; check at write time so this doesn't lag a future STORED edit).
  2. `nutrition/tomato/foliar-recipe/derivation.md` — burn-cap table: drop Mn / Zn cert from 3 to **2** with Décembre-internal-observation framing parallel to Cu's existing cert-2 carve-out paragraph. Name the asymmetry explicitly (Cu diverges below extension; Mn / Zn diverge above; same evidence-class, same cert step).
  3. `nutrition/tomato/foliar-recipe/derivation.md` — "What dropping yucca cost" historical table (lines ~162-169): the rows that report Mn 22 → 18 g and Zn 22 → 16 g are fabricated history; no Mn / Zn cut was applied at the yucca drop. Correct to "Mn 22 g held; Zn 22 g held; cap-vs-observed reconciliation owed" or similar honest framing. Cross-check against `app/index.html` `RECIPE_HISTORY` entries (~line 3285+) for the 2026-05-05 yucca-drop snapshot.
  4. No STORED edits in this request — STORED is Guillaume's lever per P-13. If the cap reconciliation reveals an unrelated STORED concern, surface separately, do not bundle.
- **Acceptance:**
  - `BURN_CAP_BASE_G.Mn` and `.Zn` updated; cert 2 annotated parallel to Cu.
  - `computeFoliarRecipeForGap` (REQ-115) clipping behavior on a Mn-heavy synthetic gap matches the new cap.
  - `derivation.md` historical-context table reconciled to "held at 22 g" reality.
  - `npm run check` passes; REQ-101 / REQ-115 still wire.
- **Yield-impact:** medium-to-high. Today the FP foliar recipe clips Mn at 18 / Zn at 16 g while STORED runs at 22 / 22 — Block 7/8 fires a drift signal whose meaning is "the cap is decorative", not actionable. Reconciling closes the false drift signal + restores Mn delivery headroom in the FP recipe (Mn 18 g → 22 g raises FP Mn delivery from 4.44 to 5.44 mg/m²/wk, from 59 % to 72 % of demand). Mn is the standing lockout element at pH 7.4 (REQ-061 cation-micro cascade); recovering FP delivery headroom matters.

### Specialist response (2026-05-17)

**Files changed:** `nutrition/tomato/foliar-recipe/data.js:125-132` (`BURN_CAP_BASE_G.Mn` 18 → 22, `.Zn` 16 → 22; per-element cert annotations split Mn/Zn at cert 2 divergence-above with Décembre-internal-observation framing parallel to Cu's cert-2 divergence-below) · `nutrition/tomato/foliar-recipe/data.js:114-122` (per-element cert commentary explicitly names the Cu/Mn/Zn asymmetry) · `nutrition/tomato/foliar-recipe/derivation.md` "What dropping yucca cost" historical table corrected — fabricated Mn 22→18 / Zn 22→16 cuts replaced with "held at 22 g" reality · `nutrition/tomato/foliar-recipe/spec.md` REQ-115 cert annotation block extended (Mn/Zn per-element exception parallel to Cu) · `nutrition/tomato/foliar-recipe/spec.test.mjs` new pinned regression test "REQ-115 — BURN_CAP_BASE_G values pinned (Mn 22 / Zn 22 / Cu 2 / Fe 80 / Mo 2 / B 9)" · `nutrition/tomato/foliar-recipe/derivation.md:17` framing block updated ("capped at 22 g/15 L by Décembre-internal observation under Wednesday-AM operator timing since the 2026-04-29 restructure" replacing the misleading "current cap" claim that carried the extension mid-band).
**Summary:** Mn/Zn caps re-pinned to live STORED 22 g at cert 2 with divergence-above-extension carve-out parallel to Cu's divergence-below. Fabricated history corrected — no Mn/Zn cut at yucca drop ever happened; STORED has carried 22/22 since the 2026-04-29 restructure. Block 7/8 FP-vs-STORED Mn/Zn drift gauge now reads parity instead of decorative-cap-pressure.
**Verifier:** `npm run check` 160/0 (pinned regression test added; previously dynamic `FRT.burnCapG` lookup couldn't catch silent cap drift); `npm test` 258/0.
**Open questions or counter-pushback:** none.

### Challenger verdict — PASS (auto-verified by triage 2026-05-17)

Burn-cap reconciliation verified: `data.js:125-132` `BURN_CAP_BASE_G` reads `Mn: 22, Zn: 22` with cert 2 per-element annotations naming Décembre-internal observation since 2026-04-29 restructure. `data.js:114-122` cert commentary explicitly names the Cu (below-extension) vs Mn/Zn (above-extension) asymmetry. `derivation.md:17` framing reconciled. Pinned regression test added to `spec.test.mjs` per changelog 2026-05-17. No STORED edits (correctly held to model layer per P-13). `npm run check` 160/0; `npm test` 258/0.

---

## SME-bank K + Mg mass-flow delivery is structurally invisible to `computeStageRecipe` fertigation sizing (autonomous-routed 2026-05-16, P-13 reframe)

- **Source:** model-challenger 2026-05-16 / soil-contribution B1 (auto-routed per P-13 — model-correctness question, not STORED-pressure).
- **Concern:** `nutrition/soil-contribution/spec.md` REQ-141 declares `CONTRIBUTING = {P: true, Ca: true}` on the grounds that "K and Mg are routed via fertigation; counting them via the soil bank would double-count." But the sibling REQ-142 / REQ-164 derivation in the same subproject wires the math: K bank delivers `SME_K_ppm × transpiration_L_per_m²_per_wk = 292.3 × 15 = 4 385 mg/m²/wk` via mass-flow to the root surface; Mg bank delivers `79.3 × 15 = 1 190 mg/m²/wk`. Meanwhile `nutrition/tomato/fertigation-recipe/calc.js:35-36` confirms `computeStageRecipe` subtracts only `compost + sidedress` from K + Mg demand — there is no SME-bank subtraction term. Code check: `grep -nE "bank|SME|SoilContribution" nutrition/tomato/fertigation-recipe/calc.js` returns only the two comment lines documenting the no-bank policy. So the fertigation sizer believes it owes plant K demand minus 634 mg/m²/wk (compost + sidedress) and outputs 4 953 g K₂SO₄ at T5, while the bank is silently delivering 4 385 mg/m²/wk on top. Active-channel sum at FP STORED: 5 367 + 234 + 400 + 4 385 ≈ 10 386 mg/m²/wk vs demand 6 000 = 173 % of demand at T5 — well over REQ-014's 1.3× luxury cap. Mg similarly over by 7-15×. The "double-count" framing in REQ-141 is correct as a policy direction but is currently aspirational: the code doesn't implement the subtraction, so the bank-via-mass-flow delivery is counted twice (once implicitly through the lack of subtraction, once explicitly when the bank delivers it). [[P-05]] applies: subtract credited reservoirs before comparing to plant demand, on every channel.
- **Action (two paths, specialist call):**
  1. **Add SME-bank subtraction to `computeStageRecipe`** for K + Mg branches. Formula: `demand_K_net = max(0, demand_K - compost_K - sidedress_K - SME_K × transpiration)`, same for Mg. Pull `SME_K`, `SME_Mg`, `TRANSPIRATION_L_PER_M2_PER_WEEK[crop]` from `window.SoilContribution`. Re-pin REQ-154 verifier values (FP target K drops from 4 953 g → ~880 g; FP Mg drops from 1 963 g → ~120 g once REQ-155 uptake factor still applies — re-derive). Amend REQ-141 framing to say "CONTRIBUTING={P, Ca} surfaces in the gap-grid Apport ici column; K + Mg bank contribution is subtracted at the fertigation sizer instead of displayed as a separate channel." Operator-visible effect: FP K target drops dramatically; Block 7/8 STORED-vs-FP drift gauge reads STORED-over-FP rather than STORED-under-FP for K. **Note: this will surface a STORED-over-FP drift for K at T5 (and Mg). That drift is informational only per P-13 — Guillaume decides whether STORED edits follow, via /retire-recipe, in his time.**
  2. **Keep `computeStageRecipe` as-is, amend the REQ-141 / REQ-013 architecture** to declare explicitly that fertigation sizing is "channel-supply at-bed, ignoring soil-bank mass-flow"; REQ-013 0.9-floor evaluates against active channels only (compost + sidedress + fertigation + foliar), with soil-bank K + Mg treated as the headroom buffer that explains why the team operates fine below the floor today. This is the "model is doing one thing, document that thing honestly" path. Less work; bigger philosophical commitment to the active-channels-only framing.
- **Acceptance:** specialist picks Path 1 or Path 2 and lands it consistently across `spec.md` / `derivation.md` / `calc.js` (if Path 1) / `learnings.md` for the retired alternative. `npm run check` passes. Drift gauge reads consistently with the chosen path's framing.
- **Yield-impact:** high. Under Path 1, fertigation K at T5 drops by ~80 % (4 953 g → ~880 g). The team would not weigh that much less immediately (STORED is Guillaume's lever) but the FP target would correctly reflect that bank-K is doing the heavy lifting. Under Path 2, the model stays where it is but stops claiming a "double-count" reason that isn't implemented. Either way the silent over-supply is in K × Mg + K × Ca antagonism territory on a Ca-saturated bank (10 989 kg Ca/ha at the tomato block); REQ-024 at-dripper CE envelope may also be eaten by over-fertigation of K + Mg sulfates.

### Specialist response (2026-05-17)

**Files changed:** `nutrition/soil-contribution/spec.md:109-150` REQ-141 amended (active-channels-only architecture explicit: Ca + P route via bank, K + Mg + B + micros route via active channels; rejected path-1 archived in learnings.md) · `nutrition/soil-contribution/learnings.md:9-72` new "Path 1 — Subtract bank K + Mg from the fertigation sizer (rejected 2026-05-17)" section with full four-reason rationale (STORED-pressure axis, bank-as-headroom is real, antagonism risk on Ca-saturated bed, sole-source argument doesn't apply) · `nutrition/tomato/fertigation-recipe/spec.md:265-276` "Inherited specs" updated — REQ-013/REQ-014 supply-sum explicitly named active-channels-only with REQ-141 cross-reference.
**Summary:** Path 2 adopted (model documents what it does honestly, no sizer subtraction). The "double-count" framing in REQ-141 reworked to active-channels-only commitment with soil-bank K + Mg treated as operator-side headroom outside the sizer's scope. Path 1 archived in learnings.md with four-reason defense.
**Verifier:** `npm run check` passes (no calc.js / data.js changes; REQ-141 spec text revised; REQ-154 K2SO4/MgSO4 boot-pin values unchanged because the sizer formula is unchanged).
**Open questions or counter-pushback:** none — Path 2 was the right call per P-13 (STORED-pressure axis kept clean) + bank-as-headroom is empirically real (the team operates fine under REQ-013 0.9× floor today). Path 1 would have weaponised the bank against STORED via FP-target shifts.

### Challenger verdict — PASS (auto-verified by triage 2026-05-17)

Path 2 verified in spec + derivation + learnings: `soil-contribution/spec.md:109-150` REQ-141 amended naming Ca + P bank route + K + Mg active-channel route + bank-as-headroom framing; `soil-contribution/learnings.md:9-72` "Path 1 rejected 2026-05-17" archive with full STORED-pressure / antagonism / sole-source defense; `fertigation-recipe/spec.md:265-276` cross-reference active-channels-only commitment. `calc.js` unchanged (correct per Path 2 — no sizer subtraction). `npm run check` 160/0.

---

## Umbrella scrub — drop all specs / derivation / learnings prose that pressures STORED to change (autonomous-routed 2026-05-16, P-13)

- **Source:** Guillaume direct ruling 2026-05-16 — "how can we never talk about STORED? I'll decide when we update it. drop all specs that put pressure to change STORED." Captured as challenger principle [[P-13]]. STORED is Guillaume's lever, not a model diagnostic surface; the model is calibration scaffolding, and the two axes are intentionally separate.
- **Concern:** spec / derivation / learnings prose across the nutrition tree currently surfaces STORED-vs-target gaps as actionable signals to the operator (Guillaume) — "operator decision (bump or hold)", "STORED under-supplies vs FP", "stored-vs-FP drift gauge actionable", refinement triggers that fire on STORED-vs-model deltas. Under P-13 these are all out of scope: STORED edits land via `/retire-recipe` on Guillaume's call, in his time, with his information. The model side should describe what the model thinks is right (FP target) without pressuring STORED to follow.
- **Action — full sweep across the nutrition subproject tree:**
  1. **Identify and rewrite** every spec / derivation / learnings prose block that surfaces "stored-vs-FP" or "stored-vs-model" or "operator decision (bump or hold)" or "team currently weighs vs target" as an actionable signal. Reframe as informational drift gauge prose only (e.g. "Block 7/8 displays the stored-vs-FP gap for awareness; STORED edits land via `/retire-recipe` on operator call, no spec pressure"). Targets to check by grep: "operator decision", "bump or hold", "stored under-suppl", "stored over-suppl", "/retire-recipe" in derivation prose, refinement-trigger entries that name STORED.
  2. **REQ-013 / REQ-014 floor + cap architecture:** today the floor formula `Σ(channel_supply) ≥ 0.9 × demand` includes STORED implicitly (channels sum at-bed, STORED is the fertigation channel). That formula structurally pressures STORED whenever it falls below 0.9 × demand. Specialist call: should REQ-013 / REQ-014 evaluate against FP only (treating STORED as audit-trail, with the drift gauge as the only STORED-aware surface)? If yes, amend the floor/cap spec to evaluate against FP, and the verifier accordingly. If no, document the choice explicitly with the trade-off named.
  3. **Refinement triggers** in every fertigation-recipe / foliar-recipe / sidedress-recipe / nursery / compost-contribution / soil-contribution `derivation.md`: scrub any trigger entry whose action is "bump STORED" or "retire stored toward FP." Replace with tissue-test / soil-test / SME-driven triggers only.
  4. **CLAUDE.md `/retire-recipe` reference**: keep — it's the audit-trail path for STORED edits, used by Guillaume directly. No change.
  5. **Append a changelog entry** describing what was scrubbed and where.
- **Acceptance:**
  - `grep -nE "operator decision|bump or hold|stored under-suppl|stored over-suppl|retire toward|toward FP|bump STORED" nutrition/` returns only intentional residuals (e.g. /retire-recipe skill references, or `learnings.md` historical entries explicitly tagged as retired prose).
  - REQ-013 / REQ-014 spec text reflects the explicit FP-vs-STORED choice the specialist makes.
  - All refinement-trigger entries in active `derivation.md` files fire on tissue / soil / SME data, not on STORED-vs-target deltas.
  - `npm run check` passes; no verifier regression.
  - Changelog one-liner.
- **Yield-impact:** indirect but structural. P-13 is Guillaume's directive on how the model communicates with the operator; the scrub aligns the spec layer with that directive. Reduces noise / pressure on Guillaume; clarifies model-vs-audit-trail axes; preserves /retire-recipe as the only path STORED moves.

### Specialist response (2026-05-17)

**Files changed:** `nutrition/tomato/fertigation-recipe/derivation.md:62` "Stored-vs-FP gap" prose reframed informational ("FP / STORED = 1.41× informational; STORED moves on operator timing per P-13") · `nutrition/tomato/fertigation-recipe/learnings.md` Mg-first rationale reframed from STORED-vs-FP-gap to cert-spread + antagonism leverage · `nutrition/lettuce/plant-needs/derivation.md` "Yucca returns" trigger reframed crop-generic · `nutrition/tomato/fertigation-recipe/derivation.md:125` Mo carve-out wording — "Stored-recipe moves on both channels gated on `/retire-recipe` audit" (audit-trail framing, not pressure) · `nutrition/tomato/fertigation-recipe/derivation.md:200` "Stored-vs-FP gap surfaces at Block 7/8 as the drift gauge" framing kept (informational, not pressure-of-action). Sidedress/compost/nursery triggers already fired on tissue / soil-test (not STORED) — no edits needed.
**Summary:** Full sweep across nutrition tree; STORED-pressure phrasing removed from active derivation/learnings prose. REQ-013/014 retained as channel-sum bounds (active-channels-only commitment formalized in the SME-bank entry above; supply sum is what the channels deliver, not pressuring STORED specifically). Residual `operator decision` hits in `nutrition/lettuce/plant-needs/learnings.md:21` (stage-aware operator decision example, not STORED-pressure) and `nutrition/tomato/sidedress-recipe/derivation.md:114` (AlfalfaMeal default product swap, operator choice, not STORED-pressure) and `nutrition/tomato/sidedress-recipe/calc.js:67` (Eco-luzerne product-swap comment, operator choice) and `nutrition/tomato/foliar-recipe/derivation.md:445` (operator decision lands in fertigation Mn, not STORED) — all intentional residuals not under P-13 jurisdiction.
**Verifier:** `npm run check` passes (no verifier change required for prose scrub).
**Open questions or counter-pushback:** none.

### Challenger verdict — PASS (auto-verified by triage 2026-05-17)

Umbrella scrub verified by grep `-nE "operator decision|bump or hold|stored under-suppl|stored over-suppl|retire toward|toward FP|bump STORED" nutrition/` — five remaining hits are all intentional residuals (lettuce stage-aware example, sidedress AlfalfaMeal product-swap, sidedress Eco-luzerne calc.js comment, foliar Mn operator-decision fertigation-routing, spec.test.mjs comment about Block 7/8 semantic). Zero hits in active STORED-pressure phrasing. Fertigation derivation:62 + :200 + :125 reframed informational. Refinement triggers across fertigation / foliar / sidedress / compost / soil-contribution all fire on tissue / soil-test / SME data per the action acceptance. `npm run check` 160/0.

---

## Depletion-runway formula missing `min(demand, mass-flow)` clamp — overstates depletion for over-supplied elements (autonomous-routed 2026-05-16)

- **Source:** Guillaume direct question 2026-05-16 ("are you confident of the depletion column in the soil bank page?"). Routed to specialist per [[P-13]] (model-correctness, not STORED-pressure).
- **Concern:** `nutrition/soil-contribution/calc.js` `monthsToDepletion(crop, element)` uses the formula `bank_mg/m² ÷ (SME_ppm × transpiration_L/m²/wk × WEEKS_PER_MONTH)`. The denominator is the **mass-flow capacity** to the root surface — the maximum possible uptake — not the **actual** plant uptake. For elements where SME × transpiration > plant demand, the formula overstates depletion and the runway reads pessimistically. Concrete check at the current April 2026 Berger readings on the tomato bed:
  - **Ca:** SME 238.8 ppm × transpiration 15 L/m²/wk = 3 582 mg Ca/m²/wk mass-flow capacity. Real tomato Ca uptake is ~100-300 mg/m²/wk (literature; bounded by Ca demand at peak fruit-set + canopy growth). Bank 10 989 kg/ha = 1 098 900 mg/m². Formula runway: ~5.9 yr. Demand-bounded runway: ~50-100 yr. The 5.9 yr reads alarmist against the underlying physical reality of sonotube + 2026 compost Ca surplus.
  - **K:** SME 292.3 ppm × 15 = 4 385 mg/m²/wk capacity; real T4-T5 peak K demand 1 400-2 800 mg/m²/wk; formula understates K runway by 1.5-3×.
  - **Mg:** SME 79.3 ppm × 15 = 1 190 mg/m²/wk capacity; real peak Mg demand 80-180 mg/m²/wk; formula understates Mg runway by ~7-15×.
  - **P at pH 7.4:** SME 1.1 ppm × 15 = 16.5 mg/m²/wk capacity; real P demand 80-150 mg/m²/wk at T5; mass-flow is BELOW demand here (lockout regime) so the formula's mass-flow uptake equals actual uptake → 65 yr runway is the right number, defensible.
  - **Mn / Zn / B at pH 7.4:** same lockout regime as P → formula reads correctly (mass-flow is the binding constraint, demand is irrelevant).
- **Action:** add a `min(demand_weekly_mg_per_m2, SME × transpiration)` clamp on the denominator. Pseudo-code:
  ```
  uptake_mg_per_week = Math.min(
    plantNeeds.demand[crop][element],
    SME_ppm × transpiration_L_per_m2_per_week
  )
  runway_months = bank_mg_per_m2 / (uptake_mg_per_week × WEEKS_PER_MONTH)
  ```
  Source for `plantNeeds.demand[crop][element]`: `window.PlantNeedsTomato.demandTotal(stage)` aggregated across the season, OR a per-element peak-week demand constant (specialist call on which framing is honest). For lettuce: `window.PlantNeedsLettuce.calculateLettuceNutritionDemand` similarly.
- **Acceptance:**
  - `nutrition/soil-contribution/calc.js` `monthsToDepletion` clamps uptake at plant demand before dividing.
  - REQ-142 spec statement updated to name the clamp: "runway = bank ÷ (min(plant_demand, SME × transpiration) × WEEKS_PER_MONTH)".
  - `derivation.md` worked examples updated: Ca runway recalculates to ~50-100 yr; K and Mg runways jump by their respective scaling factors; P/Mn/Zn/B/Fe runways unchanged (mass-flow IS the gate at lockout).
  - Verifier REQ-142 expected-value calculations updated to reflect the clamp.
  - `npm run check` passes; REQ-142 / REQ-164 still wire.
  - One-line changelog entry.
- **Yield-impact:** indirect but operationally meaningful. Today the operator-facing Mois d'épuisement column reads "Ca 5.9 yr" — alarmist prose against a soil reality of Ca surplus that won't draw down for decades without active intervention. Same shape for K / Mg. An operator reading those numbers might consider adding Ca / K / Mg supplements that aren't needed (worst case → over-supply compounding the existing Ca-saturation problem the farm is actively trying to drain). Honest demand-bounded runway numbers prevent that mis-action. P / Mn / Zn / B columns read correctly under both formulations because lockout-bounded uptake is what the plant actually gets; no operator-decision change for those.

### Specialist response (2026-05-17)

**Files changed:** `nutrition/soil-contribution/calc.js:19-50` `soilMonthsToDepletion` switched from SME-throttled-only to `bank ÷ min(mass-flow, plant peak demand) × WEEKS_PER_MONTH` clamp · `nutrition/soil-contribution/data.js` new `PLANT_PEAK_WEEKLY_DEMAND_MG_PER_M2[crop][element]` constants (per-element peak-week demand framing) + new `TURNOVER_BOUND_ELEMENTS = ['N']` (sibling N-runway entry below) · `nutrition/soil-contribution/spec.md:154-178` REQ-142 spec rewritten naming the clamp explicitly · `nutrition/soil-contribution/derivation.md` worked examples updated: tomato Ca runway 5.9 → 9.4 yr (demand binds), tomato Mg 2.7 → 3.7 yr (demand binds modestly), tomato K 11 mo unchanged (mass-flow binds at our demand), tomato P 65 yr unchanged (lockout — clamp inert).
**Summary:** Clamp landed; runway honestly reflects demand-bound vs mass-flow-bound regime per element. Lockout elements (P/Mn/Zn/B/Cu/Fe at pH 7.4) unchanged. Over-supplied elements (Ca/Mg on tomato Ca-saturated bed) get honest plant-drain runway; lettuce all elements unchanged (mass-flow < demand everywhere at 4 L/m²/wk).
**Verifier:** REQ-142 verifier expected-value calculations updated; `npm run check` 160/0.
**Open questions or counter-pushback:** none.

### Challenger verdict — PASS (auto-verified by triage 2026-05-17)

Clamp implementation verified: `calc.js:36-50` `soilMonthsToDepletion` uses `Math.min(massFlowMg, peakDemandMg)` denominator; `PLANT_PEAK_WEEKLY_DEMAND_MG_PER_M2` declared in data.js; `spec.md:154-178` REQ-142 names the clamp formula; `derivation.md` worked-example blocks (tomato Ca 9.4 yr, Mg 3.7 yr, K 11 mo unchanged, P 65 yr unchanged) match the clamp behavior. Lettuce clamp-inert-everywhere confirmation present at `derivation.md:171-176`. `npm run check` 160/0.

---

## Depletion-runway N row is turnover-bound, not depletion-bound — operator-glance mis-read risk (autonomous-routed 2026-05-16)

- **Source:** model-challenger 2026-05-16 / soil-contribution B1 (Mode A pass on `nutrition/soil-contribution/derivation.md`). Auto-routed per [[P-13]] — model-correctness, not STORED-pressure. Sibling to the just-filed depletion-clamp request; specialist can land both in one pass.
- **Concern:** REQ-142's depletion-runway formula assumes a fixed-stock denominator. That holds for Ca / P / K / Mg / micros (slow-turnover Mehlich-3 banks). It does NOT hold for N — `SOIL_BANK_MG_M2.tomato.N = 7 272 mg/m²` is the NO₃-N + NH₄-N mineral pool at quasi-steady-state with mineralization, not a depleting reservoir. Mineralization from soil organic matter + compost amendments replenishes the pool weekly-to-daily; the displayed runway `7 272 / (45.4 × 15 × 4.33) ≈ 2.46 months` is the "weeks until bank empties IF mineralization stops" — a counterfactual that never materializes. **Operator-facing risk:** the tomato N row shows ~2 months — the shortest runway on the entire grid. An operator skimming the column without clicking the pourquoi modal reads this as the highest-urgency depletion warning and reaches for sidedress N or fertigation N supplementation. 2-3 weeks of operator over-N before tissue test catches it → cell-wall softening / BER / late-season disease pressure on tomato. The mitigating `pourquoi-modal/N-not-mehlich` text exists but is click-gated. Lettuce N runway 11 months reads less alarming so risk is concentrated on tomato.
- **Action:**
  1. Extend `nutrition/soil-contribution/calc.js` `monthsToDepletion(crop, element)` to return `null` for turnover-bound elements. Define the set: `TURNOVER_BOUND_ELEMENTS = ['N']` today (S if added later). Gate at the top of the function: `if (TURNOVER_BOUND_ELEMENTS.includes(element)) return null`.
  2. Renderer (gap-grid in `nutrition/render.js` / soil-bank block) renders `—` when `monthsToDepletion` returns `null`, parallel to the existing `—` for elements without bank or SME data.
  3. `pourquoi-modal/N-not-mehlich` content already covers the rationale ("N n'est pas mesuré par Mehlich-3..."); extend it to also explain why no runway is displayed (turnover-bound, not depletion-bound).
  4. REQ-142 spec statement updated: "Defined for slow-turnover elements where the Mehlich-3 bank is a depleting reservoir. Returns `null` for turnover-bound elements (N today; expanded if S added)." Sibling derivation block updated likewise.
  5. Verifier REQ-142 expected-value calculation: skip the N row's runway assertion; assert `monthsToDepletion('tomato', 'N')` returns `null` instead.
- **Acceptance:**
  - Tomato + lettuce soil-bank page N row renders `—` in the runway column.
  - `monthsToDepletion('tomato', 'N')` and `monthsToDepletion('lettuce', 'N')` return `null` at the unit-test layer.
  - Pourquoi-modal `N-not-mehlich` explains turnover-bound rationale.
  - `npm run check` passes; REQ-142 verifier updated.
  - Changelog one-liner.
- **Yield-impact:** medium. Closes the operator-glance mis-read path on the highest-visibility row of the depletion grid. Tomato is the primary yield concern; preventing reflexive over-N (compounded with the existing Ca-saturated soil exacerbates K × Ca / Mg × Ca antagonism) is the right direction. Lettuce-side payoff smaller (11-month runway reads less alarming) but consistency matters across the grid.

### Specialist response (2026-05-17)

**Files changed:** `nutrition/soil-contribution/calc.js:37` `if (TURNOVER_BOUND_ELEMENTS.includes(element)) return null` gate at top of `soilMonthsToDepletion` · `nutrition/soil-contribution/data.js` new `TURNOVER_BOUND_ELEMENTS = ['N']` constant · `nutrition/soil-contribution/spec.md:154-178` REQ-142 statement names the turnover-bound carve-out · `nutrition/soil-contribution/derivation.md:81-103` new "N runway intentionally blank — turnover-bound" section with full rationale (quasi-steady-state mineral pool, replenished by mineralization + compost + sidedress hydrolysis; 7272 / (45.4 × 15 × 4.33) ≈ 2.46 months counterfactual call-out) · `nutrition/soil-contribution/spec.md:245-247` `render N-not-mehlich` pourquoi-modal bytes revised to turnover-bound framing (the team-visible text now explains why no runway is displayed) · refinement trigger: if S enters the gap grid + is also turnover-bound, add to TURNOVER_BOUND_ELEMENTS.
**Summary:** N row renders `—` on both crops; pourquoi modal explains turnover-bound framing; operator-glance reflexive-over-N mis-read closed. `monthsToDepletion('tomato', 'N')` and `monthsToDepletion('lettuce', 'N')` return null at unit-test layer.
**Verifier:** REQ-142 verifier expected-value calculation skips N row's runway assertion; asserts null instead; `npm run check` 160/0.
**Open questions or counter-pushback:** none.

### Challenger verdict — PASS (auto-verified by triage 2026-05-17)

Turnover-bound carve-out verified: `calc.js:37` top-of-function gate returns null for elements in `TURNOVER_BOUND_ELEMENTS`; `data.js` declares the constant `['N']`; `spec.md:154-178` REQ-142 statement carries the turnover-bound carve-out; `derivation.md:81-103` "N runway intentionally blank" section with full rationale + counterfactual call-out; `spec.md:245-247` `N-not-mehlich` pourquoi modal bytes carry the turnover-bound framing (the team-visible text now explains why no runway is displayed). `npm run check` 160/0.
