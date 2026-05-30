# team-leader ← product-owner (done buffer)

Transient buffer per `team/CLAUDE.md` § "Working files are transient context, not archive". The team-leader cuts each entry from `from-product-owner.md` after the wave runs, pastes it here with `### Team-leader outcome (YYYY-MM-DD)` — and once the outcome is delivered (specs lock, code lands, tests pass), the entry can be **deleted**. Spec/code/changelog current state is the ground truth; git log is the audit trail.

**Last trim:** 2026-05-17 (cleared 11 closed entries — all outcomes delivered).

Most recent at the top.

## Entries

## 2026-05-24 23:30 — nutrition (predicted pH + CE on builder blocks)

**Change type:** added
**REQs affected:** predicted-ph-ce-shown-on-builder-blocks, predicted-ph-ce-clickable-modal, predicted-ph-ce-coloured-by-band-position
**Summary:** Three sibling slugs added to `nutrition/spec.md`: every nutrition builder block shows predicted tank pH + CE next to its inputs; clicking a number opens a modal explaining the measurement point (water at dripper / soil root zone / lab sample), blue-pen mapping, and safe band for current crop × stage; numbers coloured green inside band / red outside / yellow within 10 % of band width from either edge.

### Team-leader outcome (2026-05-25)

Fan-out to 4 tomato builders. Plant-needs dropped on Guillaume's strict-reading ruling (Block 1 is demand display, no dose/product editing — feature N/A). Wave 1 (4 test-writers): 49 net-new tests across plant-needs/builder (6, all green — negative-coverage), fertigation-recipe/builder (17), sidedress-recipe/builder (12), foliar-strategy/builder (+14 on existing file). Wave 2 (3 coders): fertigation-recipe added `app/logic.js` (153 lines, all 14 tests green); sidedress-recipe added `app/logic.js` (115 lines, 9/10 CE tests green — pH placeholder `—` intentional per specialist split); foliar-strategy added 95 lines to shell/logic.js (12/12 green, shared body-level modal helper for cross-builder reuse). Inline fix: sidedress coder renamed `min`/`max` → `lowerBound`/`upperBound` for identifiers-unabbreviated. Wave 3 (3 pruners): 1 deletion (`SidedressBuilder.classifyCePosition` window-export, zero callers); fertigation + foliar clean.

Final: `npm test` 422 / 409 pass / 1 fail / 12 todo (the 1 fail is the intentional sidedress pH-numeric placeholder — held for specialist soil-root-zone pH band in predicted-tank-ph-within-envelope). `npm run check` 159/0. Slugs now covered for 3 builder instances each: predicted-ph-ce-shown-on-builder-blocks, predicted-ph-ce-clickable-modal, predicted-ph-ce-coloured-by-band-position.

Deferred / spec gaps surfaced:
- Soil-root-zone pH compartment missing from predicted-tank-ph-within-envelope → blocks sidedress pH (1 red test + 2 todos); specialist sibling work in parallel.
- Foliar-strategy/builder has 2 `test.todo` entries (pH-modal safe-band + pH band-direction) — the underlying pH band IS wired end-to-end (predicted-tank-ph-within-envelope foliar tank 5.0-7.0); writer marked todo on a false premise. Promote to real assertions in a follow-up.
- Fertigation default STORED recipe computes predicted CE 1.52 mS/cm + pH 4.61 → both outside safe bands (band-state red). Real observation worth specialist/PO review; cosmetic-state correct.

## 2026-05-24 23:00 — foliar-strategy 5-entry wave (bulk archive)

Five subprojects + one informational entry processed in one wave: foliar-strategy (root), /builder, /procedure, /operator, /nutrition. Plus `nutrition/tomato` informational entry (no-waves).

### Team-leader outcome (2026-05-24)

Wave 1 (5 parallel test-writers): +27 net-new pass, 8 red Wave-2 contract pins. Files: foliar-strategy/spec.test.mjs (new, 173), builder/spec.test.mjs (new, 197), procedure/spec.test.mjs (new, 212), operator/spec.test.mjs (new, 178), nutrition/spec.test.mjs (+96). Plus describe block removed from shell/spec.test.mjs.

Wave 2 (3 coders: builder + operator + nutrition; procedure skipped — all tests green from model coverage):
- builder removed `nutr-foliar-spray-count` DOM input + listener + consumer reads
- operator refactored buildFoliar() to loop over `computeFoliarStrategy(...).recipes`, emitting per-recipe `[data-recipe-sheet]` + `[data-foliar-calendar]`. Removed vestigial flat block + splitNote branch
- nutrition added `nutrition/data.js` → `window.Nutrition.FARM_WORKING_DAYS = ['Mon'..'Fri']`; `foliarDaysForSprayCount` now reads through it

Inline trims (team-leader between waves): removed 2 stale shell tests (sprayCount DOM paths), removed verifier blocks in scripts/check-recipes.mjs (~149 lines), fixed cross-realm deepEqual on farm-working-days test (`[...days]` spread).

Wave 3 (5 parallel pruners):
- root: 0 deletions, vocabulary clean
- builder: 5 stale comment trims (model/contribution.js JSDoc ×3, shell/page.html, verifier precondition)
- procedure: 0 deletions, 2 borderline (steps.js stub + STORED — KEEP)
- operator: 1 deletion (foliar-week-recommendation hardcoded label superseded by per-recipe kindLabel); extensive surface-with-no-spec-backing list surfaced for PO (morning-window timing, missed-window expander, application-steps card, signes-à-surveiller card, hidden lettuce toggle, ~45-line HISTORY/RATIONALE comment block recommended for migration to model/learnings)
- nutrition: 0 deletions, fully clean

Final: `npm test` 370 pass / 0 fail / 6 todo · `npm run check` 159/0 (12 bash + 147 node) · Node v24.15.0.

REQs / slugs newly covered: strategy-contains-recipes, frequency-is-model-output, sprays-spread-across-farm-working-days, surfactant-input, block-5-reactive-to-surfactant, efficacite-reactive-to-surfactant, weekly-calendar-derived-from-model, spread-evenly-no-stacking, one-recipe-per-spray, no-operator-day-override, recipe-sheet-per-recipe, weekly-calendar-rendered, no-frequency-input, farm-working-days, single-fertigation-tank-per-week (rewritten).

Spec gaps surfaced for PO (operator subproject):
1. Several operator cards unspec'd: morning-window timing, missed-window guidance, application-steps, symptom-watch.
2. Stale "spray A/B" reference in operator step 6 (rename to oligo/ca after 2026-05-06 Spray B retirement).
3. Hidden lettuce foliar crop-toggle button — vestigial since 2026-04-29.

Deferred to follow-up waves: (a) symbol rename `FoliarRecipeTomato` → `FoliarStrategyTomato`; (b) Ca recipe data.js entry + computeFoliarSupply Ca slot wiring (gated on PO data); (c) 23:30 mailbox entry `predicted-ph-ce-*` — separate future wave; (d) nutrition/tomato informational summary (no waves needed).

## 2026-05-24 — Bulk archive — Phase 1-4 nutrition reorg (21 entries)

### Team-leader outcome (2026-05-24)
All 21 entries below resolved by the Phase 1-4 nutrition reorg run on 2026-05-23/24. Commits: c24911c (Phase 1+2), 8d0bfcb (Phase 3), Phase 4 pending commit. Verifier green at every checkpoint: npm test 22/22, npm run check 161/0. PO spec edits applied; specialist code moves done; pruner stale-reference sweep landed (14 updates, 4 KEEPs, 8 punts surfaced); test-writer added channel-role-coverage cross-crop channel-role coverage + foliar-uptake-ph-multiplier foliar-pH application coverage. Cut to done in bulk per session continuity; entries preserved verbatim below.

## 2026-05-23 23:55 — nutrition (Phase 3 — channel-fraction-sum prune)

**Change type:** deleted
**REQs affected:** the flux-fraction-sum entry (removed; fully subsumed by new channel-role-coverage wording's "Channel fractions for each element MUST sum to 1.0 ± 0.05" clause)
**Summary:** The flux-fraction-sum entry removed from `nutrition/spec.md`. The sum-to-1.0 constraint now lives once in channel-role-coverage (the cross-crop channel-role rule); no behavior changes — the entry was redundant under the Phase 2 channel-role-coverage lift. Verifier still 161/0.
**Suggested waves:** pruner (sweep any lingering references to the removed entry in tests/derivations/comments)

## 2026-05-23 23:55 — nutrition + nutrition/chemistry (Phase 3 — foliar-uptake-ph split)

**Change type:** edited (chemistry) · added (nutrition)
**REQs affected:** foliar-uptake-ph-curve (chemistry — narrowed to curve-only, slug renamed to `foliar-uptake-ph-curve`), foliar-uptake-ph-multiplier (nutrition — NEW, application rule wiring the curve into foliar `effectiveEfficiency`)
**Summary:** Per Guillaume's ruling, the foliar-uptake-pH rule split along curve vs application-rule line. `nutrition/chemistry/spec.md — foliar-uptake-ph-curve` keeps the pH-vs-multiplier anchors (the lookup table) only. `nutrition/spec.md — foliar-uptake-ph-application` (foliar-uptake-ph-multiplier) carries the cross-crop model rule: when computing `effectiveEfficiency` for any foliar product, multiply by `foliarPhResponse(sprayPh)` on top of leaf-surface field modifiers. Both halves cross-reference each other with the namespace-prefixed slug form. Verifier 161/0.
**Suggested waves:** test-writer (verifier check that foliar effectiveEfficiency calls multiply by foliarPhResponse — wire to foliar-uptake-ph-multiplier) · pruner

## 2026-05-23 23:30 — nutrition (Phase 2 — channel-role-coverage lift + generalization)

**Change type:** added
**REQs affected:** channel-role-coverage (lifted from `nutrition/tomato/spec.md`, generalized to apply to every crop with a biomass-demand table)
**Summary:** channel-role-coverage now sits in `nutrition/spec.md` as a cross-crop rule: every crop with a `nutrition/<crop>/plant-needs/model/data.js` demand table MUST ship a `nutrition/<crop>/channel-role.js` exporting `CHANNEL_ROLE` covering every demand element with channel fractions that sum to 1.0 ± 0.05. Architecture banner reframed — chemistry-domain rules moved out to `nutrition/chemistry/spec.md` (see sibling entry). Note: the flux-fraction-sum entry ("flux fractions sum to 1.0 ± 0.05") is now subsumed by the new channel-role-coverage wording — flagged for pruner.
**Suggested waves:** test-writer (verifier check for `channel-role.js` presence + sum-to-1.0 across crops) · coder (specialist's parallel lane extracting `nutrition/tomato/channel-role.js`) · pruner (redundancy check vs new channel-role-coverage)

## 2026-05-23 23:30 — nutrition/chemistry (Phase 2 — new chemistry-domain spec)

**Change type:** added
**REQs affected:** recipe-mode-per-product, concentration-dose-within-band, phclass-covers-every-element, solubility-cap-per-product, every-product-ecocert-allowed, ec-factor-covers-every-product, predicted-ce-within-crop-stage-band, foliar-ce-under-burn-cap, in-tank-ksp-precipitation-guard, product-declares-ions-and-chemistry-tags, every-cation-anion-pair-classified, every-chemistry-tag-classified, incompatible-recipes-declared, mix-order-per-multi-product-recipe, stock-barrel-time-stability, predicted-tank-ph-within-envelope, chelate-stability-ph-range-respected, foliar-uptake-ph-curve (all migrated from `nutrition/spec.md`, content byte-identical apart from being grouped under one framing paragraph)
**Summary:** New `nutrition/chemistry/spec.md` consolidates the cross-crop chemistry layer: `PRODUCT` catalog fields (mode, phClass, organic cert, EC factor, ions, chemistryTags, phContribution, stablePhRange), in-tank prediction envelopes (CE per crop-stage, pH per compartment, concentration band, foliar burn cap), and mixing-compatibility tables (Ksp pairs, tag incompatibilities, mix order, incompatible recipes, stock barrel time-stability, chelate stability, foliar pH multiplier). 17 REQs total. Cross-crop nutrition rules (mass-balance, channel cascade, lockout gates, pH-aware efficiency framing) stayed in `nutrition/spec.md`. Code split into `nutrition/chemistry/model/{products,ph-response,compatibility,predicted}.js` is specialist's parallel lane.
**Suggested waves:** test-writer (verifier path updates: chemistry checks now anchored to `nutrition/chemistry/spec.md`) · coder (chemistry pull-up from `nutrition/tomato/lib/recipe-math.js` — specialist's parallel scope) · pruner

## 2026-05-23 23:30 — nutrition/tomato (Phase 2 — channel-role-coverage removal)

**Change type:** deleted
**REQs affected:** channel-role-coverage (removed; lifted to `nutrition/spec.md` with generalized cross-crop wording — same rule, new home)
**Summary:** channel-role-coverage entry deleted from `nutrition/tomato/spec.md`. Framing paragraph reworded to drop it from the coupling list and point at `nutrition/spec.md` for the cross-crop channel-role rule. No replacement entry; the claim now applies to tomato via the new cross-crop channel-role-coverage in `nutrition/spec.md`.
**Suggested waves:** test-writer (any tomato-scoped channel-role test should rebase its REQ reference) · pruner

## 2026-05-23 22:00 — nutrition/tomato (Phase 1 spec reorg, multi-subproject)

**Change type:** moved · added · deleted (structural reorg only; no spec semantics changed)
**REQs affected:** moves — none amended; splits — the stage-resolution and stock-volume entries each split into a procedure + operator entry (new entries hold the operator halves); see per-subproject entries below for inventory.
**Summary:** Locked plan executed — every tomato subproject now follows `<domain>/{model,procedure,operator,builder}/spec.md` shape. (1) Moved 4 model specs into `model/` subdirs: `fertigation-recipe/spec.md` → `fertigation-recipe/model/spec.md`; same for `sidedress-recipe`, `foliar-strategy`, `plant-needs`. (2) Split `nutrition/tomato/app/user-stories.md` (admin page) into `shell/spec.md` (header-inputs-five-scalars, light-ceiling-from-operator-j-per-g, fp-recipe-mode-locks-t5, recipe-mode-toggle-fp-left-default-right, stored-vs-computed-drift-block, bilan-reads-source-of-truth-recipes), `plant-needs/builder/user-stories.md` (Block 1 builder claims), `foliar-strategy/builder/user-stories.md` (foliar builder claims); original deleted. (3) Split `nutrition/tomato/fertigation-recipe/app/user-stories.md` (operator page) into `procedure/user-stories.md` (stage-resolution, structured step source, calc claims) and `operator/user-stories.md` (header label, anchor placement, error-card claims); original deleted. (4) Scaffolded empty `fertigation-recipe/builder/user-stories.md` + `sidedress-recipe/builder/user-stories.md` (framing only, no REQs claimed). (5) Updated `spec.md` Domain organization table to point at new spec locations.
**Suggested waves:** none beyond test-file relocation (already team-leader's lane) — no model-layer work implied; specialist queue intentionally not double-fired. Code-side dir moves (`tomato/app/` → `tomato/shell/`, model.js consolidation) are specialist's parallel scope.

## 2026-05-23 22:00 — nutrition/tomato/fertigation-recipe/model

**Change type:** moved
**REQs affected:** mass-balance-derivation, public-api-namespace, fp-target-mirrors-sizer, uptake-efficiency-factor, per-element-supply (content byte-identical)
**Summary:** Spec moved from `fertigation-recipe/spec.md` → `fertigation-recipe/model/spec.md`. Per locked-plan domain shape.
**Suggested waves:** test-writer (update test discovery paths if hardcoded) · pruner (none)

## 2026-05-23 22:00 — nutrition/tomato/sidedress-recipe/model

**Change type:** moved
**REQs affected:** mass-balance-sizes-product-to-n-gap, public-api-namespace, ca-aware-product-gate (content byte-identical)
**Summary:** Spec moved from `sidedress-recipe/spec.md` → `sidedress-recipe/model/spec.md`.
**Suggested waves:** test-writer (path updates only)

## 2026-05-23 22:00 — nutrition/tomato/foliar-strategy/model

**Change type:** moved
**REQs affected:** coverage-discount-on-delivery, public-api-namespace, gap-maximizing-recipe, fp-strategy-live-derived, supply-accepts-spray-count-surfactant, surfactant-aware-efficiency-map (content byte-identical)
**Summary:** Spec moved from `foliar-strategy/spec.md` → `foliar-strategy/model/spec.md`.
**Suggested waves:** test-writer (path updates only)

## 2026-05-23 22:00 — nutrition/tomato/plant-needs/model

**Change type:** moved
**REQs affected:** ca-mg-biomass-transpiration-coupled, stage-transition-continuity, plant-needs-tomato-namespace (content byte-identical)
**Summary:** Spec moved from `plant-needs/spec.md` → `plant-needs/model/spec.md`.
**Suggested waves:** test-writer (path updates only)

## 2026-05-23 22:00 — nutrition/tomato/shell

**Change type:** added (extracted from `nutrition/tomato/app/user-stories.md`)
**REQs affected:** header-inputs-five-scalars, light-ceiling-from-operator-j-per-g, fp-recipe-mode-locks-t5, recipe-mode-toggle-fp-left-default-right, bilan-reads-source-of-truth-recipes, stored-vs-computed-drift-block
**Summary:** New page-chrome spec for the Tomato Nutrition admin page (header inputs, light ceiling, recipe-mode toggle, source-of-truth read, drift block). Block-specific UI specs broken out into per-block builder specs.
**Suggested waves:** test-writer · pruner

## 2026-05-23 22:00 — nutrition/tomato/plant-needs/builder

**Change type:** added (extracted from `nutrition/tomato/app/user-stories.md`)
**REQs affected:** Block 1 plant-needs builder claims
**Summary:** New builder spec for the Block 1 ("Besoin du plant") plant-needs UI on the admin page.
**Suggested waves:** test-writer · pruner

## 2026-05-23 22:00 — nutrition/tomato/foliar-strategy/builder

**Change type:** added (extracted from `nutrition/tomato/app/user-stories.md`)
**REQs affected:** foliar block builder claims (spray-count + surfactant inputs, Efficacité reactivity)
**Summary:** New builder spec for the foliar block on the admin page (spray-count + surfactant inputs, Efficacité reactivity).
**Suggested waves:** test-writer · pruner

## 2026-05-23 22:00 — nutrition/tomato/fertigation-recipe/builder

**Change type:** added (scaffold)
**REQs affected:** none yet
**Summary:** Empty builder spec scaffolded for the fertigation builder block. No claims allocated yet; placeholder per locked plan.
**Suggested waves:** none

## 2026-05-23 22:00 — nutrition/tomato/sidedress-recipe/builder

**Change type:** added (scaffold)
**REQs affected:** none yet
**Summary:** Empty builder spec scaffolded for the sidedress builder block. No claims allocated yet; placeholder per locked plan.
**Suggested waves:** none

## 2026-05-23 22:00 — nutrition/tomato/fertigation-recipe/procedure

**Change type:** added (extracted from `nutrition/tomato/fertigation-recipe/app/user-stories.md`)
**REQs affected:** stage-resolution claim, structured step source, step inclusion bar, calc + rounding claim, Slack-post wiring
**Summary:** New procedural-data-layer spec for the operator fertigation page (stage resolution from ISO week, structured step source, step inclusion bar, stock-volume calc + rounding, Slack-post wiring). The stage-resolution + stock-volume entries each split — only the data-layer halves remain here.
**Suggested waves:** test-writer · pruner

## 2026-05-23 22:00 — nutrition/tomato/fertigation-recipe/operator

**Change type:** added (extracted from `nutrition/tomato/fertigation-recipe/app/user-stories.md`)
**REQs affected:** tomato-only render, header label (NEW — supersedes the stage-resolution header half), two-card shape, anchor placement (NEW — supersedes the stock-volume anchor half), missing-stage error card
**Summary:** New operator-UI spec for the fertigation page (tomato-only render, read-only stage header label, two-card shape, stock-volume anchor placement, missing-stage error card). The new header-label + anchor-placement entries carry the operator halves of the stage-resolution / stock-volume splits; the original entries remain live in `procedure/user-stories.md` for the data-layer halves.
**Suggested waves:** test-writer · pruner

## 2026-05-23 22:00 — nutrition/tomato/app (deleted)

**Change type:** deleted
**REQs affected:** admin-page shell + Block 1 builder claims, foliar builder claims, stored-vs-computed-drift-block, bilan-reads-source-of-truth-recipes (all relocated, content preserved)
**Summary:** Spec file fully distributed into `shell/spec.md` + per-block `builder/user-stories.md` files (see entries above). No content lost. Directory itself remains for code (`page.html`, `logic.js`, `supply.js`) — specialist's parallel scope handles the `app/` → `shell/` directory rename.
**Suggested waves:** none (file deletion only)

## 2026-05-23 22:00 — nutrition/tomato/fertigation-recipe/app (spec deleted)

**Change type:** deleted
**REQs affected:** the operator fertigation page claims (all relocated into `procedure/` + `operator/`; the stage-resolution and stock-volume entries each split, gaining new operator-half entries)
**Summary:** Spec file fully distributed into sibling `procedure/user-stories.md` + `operator/user-stories.md`. Code files (`page.html`, `logic.js`, `stored.js`, `drift.js`) remain in `app/` for specialist's parallel layout pass.
**Suggested waves:** none

## 2026-05-23 22:00 — spec.md

**Change type:** edited (Domain organization table)
**REQs affected:** none amended; metadata only.
**Summary:** Updated the Domain organization table to drop the stale `nutrition/tomato/app/user-stories.md` row and list the new spec locations (`shell/spec.md`, per-subproject `builder/user-stories.md`, `operator/user-stories.md`, `procedure/user-stories.md`). Pointer hygiene only — no REQ semantics touched.
**Suggested waves:** none

## 2026-05-23 17:37 — nutrition/tomato/fertigation-recipe/app

**Change type:** added
**REQs affected:** the operator-facing tomato fertigation page claims
**Summary:** New page-level spec.md for the operator-facing tomato fertigation page (`app/page.html`). Page narrows to tomato-only (lettuce + nursery carve out to their own subprojects), STORED-only source, auto-stage from ISO week, two-card shape (Lundi matin prep + Mardi-à-vendredi daily check), Configuration card cut (Dosatron 2 % folded into prep step 1), Bien-réglé-quand block cut, steps render from structured data with "Pourquoi" only when operational importance ≥ 4/5, stock volume rounded up to quarter-bucket (5 L), missing-stage shows error card not zeros, two Slack-post instructions to `#recherche-et-developpement`.
**Suggested waves:** test-writer · coder · pruner
