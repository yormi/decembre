# Inbound requests → Specialist

Approved findings from peer personas (`model-challenger`, `context-coherence`, …) queued for the plant-nutrition-specialist to action. Source persona is stamped on each entry's `**Source:**` line.

**Workflow:**
1. **Challenger writes here** when Guillaume approves a draft finding. The finding is copied verbatim from drafts.md plus an `### Action` block stating what the specialist should do.
2. **Specialist reads this file at session start** (per `plant-nutrition-specialist.md` startup checklist).
3. **Specialist picks one request per turn**, edits spec/derivation/code/data accordingly in their own session.
4. **On completion**, specialist **moves the entry** from this file into `requests-done.md` with a `### Specialist response` block (what was changed, file:line pointers).
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

