# team-leader ← plant-nutrition-specialist

Spec-change notifications from the plant-nutrition-specialist persona. Each entry names one subproject whose `spec.md` changed (REQs added, edited, or deleted) and signals to the team-leader that test / code / prune work is now pending there.

The team-leader reads this file at session start. When it processes an entry — by running the relevant wave(s) for that subproject — it cuts the entry from this file and appends it to `from-plant-nutrition-specialist-done.md` with a one-line outcome.

## Format

Append at the top (most recent first):

```
## YYYY-MM-DD HH:MM — <subproject-path-relative-to-repo>

**Change type:** added | edited | deleted (one or more)
**REQs affected:** REQ-NNN, REQ-NNN, ...
**Summary:** 1–2 sentences on what changed in the spec.
**Suggested waves:** test-writer · coder · pruner (any/all — leader decides final scope)
```

`<subproject-path>` is the directory holding the changed `spec.md`, e.g. `nutrition/tomato/fertigation-recipe`.

A single turn that touches multiple subprojects writes one entry per subproject.

## Entries

## 2026-05-23 21:40 — nutrition/chemistry

**Change type:** model-code-shift (new subproject, no spec)
**REQs affected:** none — structural reorg only (REQ-010 / REQ-017..029 / REQ-053..055 code-side still wired, just relocated)
**Summary:** Phase 2 chemistry pull-up. New `nutrition/chemistry/model/` with four split files extracted from the retired `nutrition/tomato/lib/recipe-math.js`: `products.js` (PRODUCT catalog, pure data, `window.NutritionProducts`), `ph-response.js` (PH_RESPONSE + foliarPhResponse + effectiveEfficiency, `window.NutritionPhResponse`), `compatibility.js` (KSP_PAIRS / KSP_SAFE / TAG_INCOMPATIBILITIES / TAGS_INERT / MIX_ORDER / INCOMPATIBLE_RECIPES + load-time validatePhase1ModelCoverage IIFE, `window.NutritionCompatibility`), `predicted.js` (predictedCE + predictedTankPh, `window.NutritionPredicted`). Top-level `const` bindings preserved verbatim so the verifier's sibling-script instrumentation still picks them up bare. No `spec.md` exists for this subproject yet — PO lane.
**Suggested waves:** none — no behavior change. Pruner sweep can later trim stale `recipe-math` mentions in source comments (e.g. `nutrition/nursery/fertigation/calc.js:14` references `predictedCE` shape, still correct; informational only).

## 2026-05-23 21:40 — nutrition/tomato

**Change type:** model-code-shift (CHANNEL_ROLE relocated, recipe-math.js removed)
**REQs affected:** REQ-011, REQ-012 (CHANNEL_ROLE now at `nutrition/tomato/channel-role.js` instead of inside `lib/recipe-math.js`); REQ-020 (`passiveSupplyMassFlow`) and the first-principles `computeRecipe(crop, stage, channel)` builder both deleted — neither had live callers (only doc-comment mentions in `app/index.html`).
**Summary:** New `nutrition/tomato/channel-role.js` (single export, `window.TomatoChannelRole = { CHANNEL_ROLE }`). `nutrition/tomato/lib/recipe-math.js` deleted in full (533 lines retired — content distributed across the four chemistry files + this channel-role file, with `computeRecipe` + `passiveSupplyMassFlow` deleted outright as dead code). `app/index.html` @include rewired: one include became five (products → ph-response → compatibility → predicted → tomato/channel-role) in dependency order. `scripts/check-recipes.mjs` stale `'computeRecipe'` expose-name + leading-comment references trimmed. `npm test` 20/20; `npm run check` 161/0.
**Suggested waves:** none required. Future: spec entry for `nutrition/chemistry/` is PO lane; per-crop channel-role spec sits in `nutrition/<crop>/spec.md` if PO wants to lock the routing claims.

## 2026-05-23 21:20 — nutrition/tomato/fertigation-recipe

**Change type:** model-code-shift (no spec mutation in this lane)
**REQs affected:** none — structural reorg only
**Summary:** Phase 1 reorg landed: `data.js` / `derivation.md` / `learnings.md` / `spec.test.mjs` / `test-helpers.mjs` moved into `model/`; `calc.js` renamed `model/recipe.js` with old `model.js` (`window.FertigationRecipeTomato` export) appended as tail. New `model/contribution.js` extracts the fertigation slice of `calculateNutritionSupply` (pure function, K/Mg/B). `app/` retired: `stored.js` → `procedure/stored.js`; `logic.js` / `page.html` / `page.css` / `drift.js` → `operator/`. New `procedure/steps.js` stub. Verifiers green.
**Suggested waves:** none required — code moved, no behavior change; downstream pruner sweep can clean stale path comments in `nutrition/lib/product-pct.js:2` + `nutrition/soil-contribution/spec.test.mjs:417,470` if/when convenient.

## 2026-05-23 21:20 — nutrition/tomato/sidedress-recipe

**Change type:** model-code-shift (no spec mutation in this lane)
**REQs affected:** none — structural reorg only
**Summary:** Phase 1 reorg landed: model files into `model/`; `calc.js` → `model/recipe.js` with `model.js` (`window.SidedressRecipeTomato`) tail-appended. New `model/contribution.js` exports `computeSidedressContribution({stage,sd,phLocked,productPct,areaPerPlanche,minimumEfficiency})` returning N/P/K. `app/stored.js` → `procedure/stored.js` (byte-identical to working-tree state — Guillaume's 2026-05-23 N-eff refit preserved). New `procedure/steps.js` stub. No operator/ directory (no logic.js for this channel).
**Suggested waves:** none required.

## 2026-05-23 21:20 — nutrition/tomato/foliar-recipe

**Change type:** model-code-shift (no spec mutation in this lane)
**REQs affected:** none — structural reorg only
**Summary:** Phase 1 reorg landed: model files into `model/`; `calc.js` → `model/recipe.js` with `model.js` (`window.FoliarRecipeTomato`) tail-appended. New `model/contribution.js` extracts foliar slice via `computeFoliarContribution({stage,recipeArray,foliarOpts,computeFoliarSupplyFunction})` returning the 11-element supply vector (macros + Ca explicit 0; micros from `computeFoliarSupply`). REQ-116 derivation (FP foliar live-derived from pre-foliar gap) stays in the shell orchestrator because it mutates `FP_RECIPE_T5.foliar` (global state). `stored.js` → `procedure/`, `logic.js` + `page.html` → `operator/`. New `procedure/steps.js` stub.
**Suggested waves:** none required.

## 2026-05-23 21:20 — nutrition/tomato/plant-needs

**Change type:** model-code-shift (no spec mutation in this lane)
**REQs affected:** none — structural reorg only
**Summary:** Phase 1 reorg landed: `data.js` / `derivation.md` / `learnings.md` / `spec.test.mjs` / `test-helpers.mjs` moved into `model/`; `calc.js` renamed `model/demand.js` with old `model.js` (`window.PlantNeedsTomato` export) appended as tail. `model/test-helpers.mjs` updated to read `data.js` + `demand.js` (model.js retired). No procedure/, no operator/ (plant-needs has no operator-facing channel of its own).
**Suggested waves:** none required.

## 2026-05-23 21:20 — nutrition/tomato (shell rename)

**Change type:** model-code-shift (no spec mutation in this lane)
**REQs affected:** none — structural reorg only
**Summary:** `nutrition/tomato/app/` → `nutrition/tomato/shell/` rename complete (`logic.js`, `supply.js`, `spec.test.mjs`, `test-helpers.mjs`, `irrigation/`, `sol/`, `page.html`). `supply.js` refactored: `calculateNutritionSupply` now calls the three per-channel `compute*Contribution` functions and aggregates; DOM reads (spray count, surfactant) + FP-vs-stored selection + REQ-116 `FP_RECIPE_T5.foliar` mutation stay at the shell layer. Top-of-file comment marks it `TRANSITIONAL — will move to shell/contribution-orchestrator.js in Phase 2`. `scripts/check-recipes.mjs` 4× source-grep paths updated `tomato/app/logic.js` → `tomato/shell/logic.js`. App-include paths in `app/index.html` updated (≈30 directives).
**Suggested waves:** none required.
