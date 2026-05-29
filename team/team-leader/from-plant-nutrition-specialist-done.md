# team-leader ← plant-nutrition-specialist (done buffer)

Transient buffer per `team/CLAUDE.md` § "Working files are transient context, not archive". The team-leader cuts each entry from `from-plant-nutrition-specialist.md` after the wave runs, pastes it here with `### Team-leader outcome (YYYY-MM-DD)` — and once the outcome is delivered (specs lock, code lands, tests pass), the entry can be **deleted**. Spec/code/changelog current state is the ground truth; git log is the audit trail.

**Last trim:** 2026-05-17 (cleared 31 closed entries spanning 2026-05-16 → 2026-05-17 — all outcomes delivered; specs/code/tests on main reflect each entry's landing state).

Most recent at the top.

## Entries

## 2026-05-24 21:24 — nutrition/tomato/foliar-strategy/model

**Change type:** added, edited
**REQs affected:** REQ-195 (added — multi-recipe strategy structure), REQ-196 (added — per-recipe weekly leaf-tolerance cap, oligo=1 Ca=3 cert 3), REQ-197 (added — `sprayCount = min(sprays-to-close-gap, leaf-tolerance-cap)` per recipe), REQ-198 (added — day-spread rule over `nutrition — farm-working-days`), REQ-115 (edited — returns `{doses, sprayCount}` bundle, opts `sprayCount` → `recipeKind`), REQ-116 (edited — reshaped around `computeFoliarStrategy(stage, gap)`), REQ-101 (edited — per-recipe coverage axis, Ca constants), REQ-103 (edited — `computeFoliarStrategy` added to namespace surface), REQ-112 (held transitionally — legacy override to avoid test churn this PR)
**Summary:** Model contract reshaped per the 2026-05-24 PO grill: strategy now contains many recipes; frequency is model output not operator input; per-recipe leaf-tolerance cap bounds the model-computed weekly count; day assignments spread over the farm-working-days set.
**Suggested waves:** test-writer · coder · pruner

### Team-leader outcome (2026-05-24)
Waves run: test-writer · coder · pruner (all three, foliar-strategy/model only — Guillaume scoped narrowly via option-2 override, deferred the five PO-channel siblings + Ca slot wiring + symbol rename).

- **test-writer:** +359 lines on `model/spec.test.mjs` (542 → 901). 15 new red tests pinning the Wave-2 contract; 8 net-new green derivation worked-example assertions.
- **coder:** `recipe.js` +~150 / −~57, `data.js` +35, `test-helpers.mjs` +11 (cross-realm `structuredClone` wrap on `computeFoliarStrategy` for jsdom→node Array deepEqual). 15 targeted REQ tests passing; `npm run check` green (transient REQ-158 hit on `var el` → `var element` fixed in-line).
- **pruner:** zero deletions (every symbol traces to a test, internal caller, or external consumer). 4 borderline items surfaced for future review (FOLIAR_GAP_ELEMENTS.Mo carve-out leftover, AREA_M2 doc block, cap-binds defensive branch, `void` cross-bundle markers).

Final state: `npm test` 347 / 342 pass / 1 fail / 4 todo · `npm run check` 161/0 READY · Node v24.15.0. The 1 failure is pre-existing `REQ-004 — Bilan reads TOMATO_FRUIT_EXPORT[element]` (`nutrition/tomato/shell/spec.test.mjs:716`) — surfaced separately, unrelated to this wave.

Flags for follow-up: (a) symbol rename `FoliarRecipeTomato` → `FoliarStrategyTomato` deferred; (b) Ca recipe `data.js` entry + `computeFoliarSupply` Ca slot wiring gated on PO data; (c) coder loosened Cu luxury-cap guard `> 1.3 × gap` → `> 1.31 × gap` (1 % FP slack to admit derivation row-5 "1.30× exactly at cap" without firing) — possible drift from blueprint, specialist to verify.

## 2026-05-24 — Bulk archive — Phase 1-4 nutrition reorg (9 entries)

### Team-leader outcome (2026-05-24)
All 9 entries below resolved by the Phase 1-4 nutrition reorg run on 2026-05-23/24. Commits: c24911c (Phase 1+2), 8d0bfcb (Phase 3), Phase 4 pending commit. Verifier green at every checkpoint: npm test 22/22, npm run check 161/0. PO spec edits applied; specialist code moves done; pruner stale-reference sweep landed (14 updates, 4 KEEPs, 8 punts surfaced); test-writer added REQ-011 cross-crop channel-role coverage + REQ-194 foliar-pH application coverage. Cut to done in bulk per session continuity; entries preserved verbatim below.

## 2026-05-24 02:05 — nutrition/tomato/shell

**Change type:** model-code-shift (no spec mutation in this lane)
**REQs affected:** none — structural reorg only (REQ-116 wiring preserved end-to-end)
**Summary:** Phase 3 carve. `nutrition/tomato/shell/supply.js` deleted in full; replaced by `nutrition/tomato/shell/contribution-orchestrator.js`. The orchestrator still owns `calculateNutritionSupply` (same signature) + `statusFor` + `nutrStage` / `nutrRecipeMode` page-local state + `LUXURY_FACTOR` demand cap + DOM reads for spray-count / surfactant. The REQ-116 inline gap-derivation block (compost + sidedress + fertigation → gap → recipe → mutate `FP_RECIPE_T5.foliar`) is now a one-line call to `window.FoliarRecipeTomato.deriveFoliarRecipeFromGap` followed by the FP_RECIPE_T5.foliar mutation. Defensive try/catch around the foliar derivation dropped (was a guard against a window.* indirection that no longer exists; both functions live in the same script bundle now). `app/index.html` @include line 559 rewired (`shell/supply.js` → `shell/contribution-orchestrator.js`). `scripts/check-recipes.mjs` REQ-139 registry row updated: `computeFoliarRecipeForGap` → `deriveFoliarRecipeFromGap` for the orchestrator's consumer surface (the raw function still has its own REQ-115 behavioral verifier block via the namespace). `npm test` 20/20; `npm run check` 161/0.
**Suggested waves:** pruner sweep — `nutrition/tomato/shell/test-helpers.mjs:72` and `nutrition/tomato/sidedress-recipe/model/data.js:46/86` carry `calculateNutritionSupply` comment refs that still resolve correctly (function name unchanged) but may benefit from a one-line note that the home file is now `contribution-orchestrator.js`; non-blocking.

## 2026-05-24 02:05 — nutrition/tomato/foliar-strategy

**Change type:** model-code-shift (no spec mutation in this lane)
**REQs affected:** REQ-116 (extraction only — behavior preserved)
**Summary:** Pure `deriveFoliarRecipeFromGap({ demand, compostRelease, fertigationPre, sidedressPre, foliarOpts })` added to `nutrition/tomato/foliar-strategy/model/contribution.js`. Wraps the per-element foliar-gap arithmetic (six FOLIAR_GAP_ELEMENTS — Mn / Zn / Cu / Fe / Mo / B — gap = max(0, demand − compost − sidedress − fertigation) per element) + the call into `computeFoliarRecipeForGap` + the reshape from `{ MnSO4_g, ZnSO4_g, … }` to the FP_RECIPE_T5.foliar key shape (`{ MnSO4, ZnSO4, Solubore, CuSO4, NaMolybdate, 'FeSO4-7H2O' }`). Returns null on derivation failure so the orchestrator can fall back to the prior FP_RECIPE_T5.foliar literal silently. Pure — no DOM reads, no `window.*` reads, no channel-orchestrator coupling (orchestrator pre-computes the sidedress + fertigation per-element maps via the existing sibling contribution functions and passes them in). Re-exported on `window.FoliarRecipeTomato` (recipe.js tail) so REQ-139 sees it under the namespace. `npm test` 20/20; `npm run check` 161/0.
**Suggested waves:** test-writer (optional) — direct unit on `deriveFoliarRecipeFromGap` (stub demand + compost + sidedress + fertigation maps; assert returned shape + null-on-no-derivation; matches behavior currently covered transitively by REQ-116 integration test at `scripts/check-recipes.mjs:3317-3365`).

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

## 2026-05-23 21:20 — nutrition/tomato/foliar-strategy

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
