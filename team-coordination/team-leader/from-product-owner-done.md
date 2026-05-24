# team-leader ← product-owner (done buffer)

Transient buffer per `team-coordination/CLAUDE.md` § "Working files are transient context, not archive". The team-leader cuts each entry from `from-product-owner.md` after the wave runs, pastes it here with `### Team-leader outcome (YYYY-MM-DD)` — and once the outcome is delivered (specs lock, code lands, tests pass), the entry can be **deleted**. Spec/code/changelog current state is the ground truth; git log is the audit trail.

**Last trim:** 2026-05-17 (cleared 11 closed entries — all outcomes delivered).

Most recent at the top.

## Entries

_(none — last trim cleared all closed entries.)_

## 2026-05-24 — Bulk archive — Phase 1-4 nutrition reorg (21 entries)

### Team-leader outcome (2026-05-24)
All 21 entries below resolved by the Phase 1-4 nutrition reorg run on 2026-05-23/24. Commits: c24911c (Phase 1+2), 8d0bfcb (Phase 3), Phase 4 pending commit. Verifier green at every checkpoint: npm test 22/22, npm run check 161/0. PO spec edits applied; specialist code moves done; pruner stale-reference sweep landed (14 updates, 4 KEEPs, 8 punts surfaced); test-writer added REQ-011 cross-crop channel-role coverage + REQ-194 foliar-pH application coverage. Cut to done in bulk per session continuity; entries preserved verbatim below.

## 2026-05-23 23:55 — nutrition (Phase 3 — REQ-012 prune)

**Change type:** deleted
**REQs affected:** REQ-012 (removed; fully subsumed by new REQ-011 wording's "Channel fractions for each element MUST sum to 1.0 ± 0.05" clause)
**Summary:** REQ-012 entry removed from `nutrition/spec.md`. The sum-to-1.0 constraint now lives once in REQ-011 (the cross-crop channel-role rule); no behavior changes — REQ-012 was redundant under the Phase 2 REQ-011 lift. Verifier still 161/0.
**Suggested waves:** pruner (sweep any lingering REQ-012 references in tests/derivations/comments)

## 2026-05-23 23:55 — nutrition + nutrition/chemistry (Phase 3 — REQ-055 split)

**Change type:** edited (chemistry) · added (nutrition)
**REQs affected:** REQ-055 (chemistry — narrowed to curve-only, slug renamed to `foliar-uptake-ph-curve`), REQ-194 (nutrition — NEW, application rule wiring the curve into foliar `effectiveEfficiency`)
**Summary:** Per Guillaume's ruling, REQ-055 split along curve vs application-rule line. `nutrition/chemistry/spec.md — foliar-uptake-ph-curve` keeps the pH-vs-multiplier anchors (the lookup table) only. `nutrition/spec.md — foliar-uptake-ph-application` (REQ-194) carries the cross-crop model rule: when computing `effectiveEfficiency` for any foliar product, multiply by `foliarPhResponse(sprayPh)` on top of leaf-surface field modifiers. Both halves cross-reference each other with the namespace-prefixed slug form. Verifier 161/0.
**Suggested waves:** test-writer (verifier check that foliar effectiveEfficiency calls multiply by foliarPhResponse — wire to REQ-194) · pruner

## 2026-05-23 23:30 — nutrition (Phase 2 — REQ-011 lift + generalization)

**Change type:** added
**REQs affected:** REQ-011 (lifted from `nutrition/tomato/spec.md`, generalized to apply to every crop with a biomass-demand table)
**Summary:** REQ-011 now sits in `nutrition/spec.md` as a cross-crop rule: every crop with a `nutrition/<crop>/plant-needs/model/data.js` demand table MUST ship a `nutrition/<crop>/channel-role.js` exporting `CHANNEL_ROLE` covering every demand element with channel fractions that sum to 1.0 ± 0.05. Architecture banner reframed — chemistry-domain REQs moved out to `nutrition/chemistry/spec.md` (see sibling entry). Note: REQ-012 ("flux fractions sum to 1.0 ± 0.05") is now subsumed by the new REQ-011 wording — flagged for pruner.
**Suggested waves:** test-writer (verifier check for `channel-role.js` presence + sum-to-1.0 across crops) · coder (specialist's parallel lane extracting `nutrition/tomato/channel-role.js`) · pruner (REQ-012 redundancy check vs new REQ-011)

## 2026-05-23 23:30 — nutrition/chemistry (Phase 2 — new chemistry-domain spec)

**Change type:** added
**REQs affected:** REQ-010, REQ-015, REQ-019, REQ-021, REQ-022, REQ-023, REQ-024, REQ-025, REQ-029, REQ-029a, REQ-029b, REQ-029c, REQ-030, REQ-031, REQ-032, REQ-053, REQ-054, REQ-055 (all migrated from `nutrition/spec.md`, content byte-identical apart from being grouped under one framing paragraph)
**Summary:** New `nutrition/chemistry/spec.md` consolidates the cross-crop chemistry layer: `PRODUCT` catalog fields (mode, phClass, organic cert, EC factor, ions, chemistryTags, phContribution, stablePhRange), in-tank prediction envelopes (CE per crop-stage, pH per compartment, concentration band, foliar burn cap), and mixing-compatibility tables (Ksp pairs, tag incompatibilities, mix order, incompatible recipes, stock barrel time-stability, chelate stability, foliar pH multiplier). 17 REQs total. Cross-crop nutrition rules (mass-balance, channel cascade, lockout gates, pH-aware efficiency framing) stayed in `nutrition/spec.md`. Code split into `nutrition/chemistry/model/{products,ph-response,compatibility,predicted}.js` is specialist's parallel lane.
**Suggested waves:** test-writer (verifier path updates: chemistry checks now anchored to `nutrition/chemistry/spec.md`) · coder (chemistry pull-up from `nutrition/tomato/lib/recipe-math.js` — specialist's parallel scope) · pruner

## 2026-05-23 23:30 — nutrition/tomato (Phase 2 — REQ-011 removal)

**Change type:** deleted
**REQs affected:** REQ-011 (removed; lifted to `nutrition/spec.md` with generalized cross-crop wording — same id, new home)
**Summary:** REQ-011 entry deleted from `nutrition/tomato/spec.md`. Framing paragraph reworded to drop REQ-011 from the coupling list and point at `nutrition/spec.md` for the cross-crop channel-role rule. No replacement entry; the claim now applies to tomato via the new cross-crop REQ-011 in `nutrition/spec.md`.
**Suggested waves:** test-writer (any tomato-scoped channel-role test should rebase its REQ reference) · pruner

## 2026-05-23 22:00 — nutrition/tomato (Phase 1 spec reorg, multi-subproject)

**Change type:** moved · added · deleted (structural reorg only; no spec semantics changed)
**REQs affected:** moves — none amended; splits — REQ-182 + REQ-188 each split into a procedure + operator REQ (new ids REQ-192, REQ-193 hold the operator halves); see per-subproject entries below for inventory.
**Summary:** Locked plan executed — every tomato subproject now follows `<domain>/{model,procedure,operator,builder}/spec.md` shape. (1) Moved 4 model specs into `model/` subdirs: `fertigation-recipe/spec.md` → `fertigation-recipe/model/spec.md`; same for `sidedress-recipe`, `foliar-recipe`, `plant-needs`. (2) Split `nutrition/tomato/app/spec.md` (admin page) into `shell/spec.md` (REQ-104..107, REQ-153, REQ-004), `plant-needs/builder/spec.md` (REQ-108..111), `foliar-recipe/builder/spec.md` (REQ-113, REQ-114, REQ-163); original deleted. (3) Split `nutrition/tomato/fertigation-recipe/app/spec.md` (operator page) into `procedure/spec.md` (REQ-182 stage-resolution, REQ-183, REQ-185..188 calc, REQ-190, REQ-191) and `operator/spec.md` (REQ-181, REQ-192 header label, REQ-184, REQ-193 anchor placement, REQ-189); original deleted. (4) Scaffolded empty `fertigation-recipe/builder/spec.md` + `sidedress-recipe/builder/spec.md` (framing only, no REQs claimed). (5) Updated `requirements.md` Domain organization table to point at new spec locations.
**Suggested waves:** none beyond test-file relocation (already team-leader's lane) — no model-layer work implied; specialist queue intentionally not double-fired. Code-side dir moves (`tomato/app/` → `tomato/shell/`, model.js consolidation) are specialist's parallel scope.

## 2026-05-23 22:00 — nutrition/tomato/fertigation-recipe/model

**Change type:** moved
**REQs affected:** REQ-098, REQ-099, REQ-154, REQ-155, REQ-151 (content byte-identical)
**Summary:** Spec moved from `fertigation-recipe/spec.md` → `fertigation-recipe/model/spec.md`. Per locked-plan domain shape.
**Suggested waves:** test-writer (update test discovery paths if hardcoded) · pruner (none)

## 2026-05-23 22:00 — nutrition/tomato/sidedress-recipe/model

**Change type:** moved
**REQs affected:** REQ-087, REQ-088, REQ-089 (content byte-identical)
**Summary:** Spec moved from `sidedress-recipe/spec.md` → `sidedress-recipe/model/spec.md`.
**Suggested waves:** test-writer (path updates only)

## 2026-05-23 22:00 — nutrition/tomato/foliar-recipe/model

**Change type:** moved
**REQs affected:** REQ-101, REQ-103, REQ-115, REQ-116, REQ-112, REQ-170 (content byte-identical)
**Summary:** Spec moved from `foliar-recipe/spec.md` → `foliar-recipe/model/spec.md`.
**Suggested waves:** test-writer (path updates only)

## 2026-05-23 22:00 — nutrition/tomato/plant-needs/model

**Change type:** moved
**REQs affected:** REQ-081, REQ-082, REQ-083 (content byte-identical)
**Summary:** Spec moved from `plant-needs/spec.md` → `plant-needs/model/spec.md`.
**Suggested waves:** test-writer (path updates only)

## 2026-05-23 22:00 — nutrition/tomato/shell

**Change type:** added (extracted from `nutrition/tomato/app/spec.md`)
**REQs affected:** REQ-104, REQ-105, REQ-106, REQ-107, REQ-004, REQ-153
**Summary:** New page-chrome spec for the Tomato Nutrition admin page (header inputs, light ceiling, recipe-mode toggle, source-of-truth read, drift block). Block-specific UI specs broken out into per-block builder specs.
**Suggested waves:** test-writer · pruner

## 2026-05-23 22:00 — nutrition/tomato/plant-needs/builder

**Change type:** added (extracted from `nutrition/tomato/app/spec.md`)
**REQs affected:** REQ-108, REQ-109, REQ-110, REQ-111
**Summary:** New builder spec for the Block 1 ("Besoin du plant") plant-needs UI on the admin page.
**Suggested waves:** test-writer · pruner

## 2026-05-23 22:00 — nutrition/tomato/foliar-recipe/builder

**Change type:** added (extracted from `nutrition/tomato/app/spec.md`)
**REQs affected:** REQ-113, REQ-114, REQ-163
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

**Change type:** added (extracted from `nutrition/tomato/fertigation-recipe/app/spec.md`)
**REQs affected:** REQ-182 (stage-resolution claim), REQ-183, REQ-185, REQ-186, REQ-187, REQ-188 (calc + rounding claim), REQ-190, REQ-191
**Summary:** New procedural-data-layer spec for the operator fertigation page (stage resolution from ISO week, structured step source, step inclusion bar, stock-volume calc + rounding, Slack-post wiring). REQ-182 + REQ-188 each split — only the data-layer halves remain here.
**Suggested waves:** test-writer · pruner

## 2026-05-23 22:00 — nutrition/tomato/fertigation-recipe/operator

**Change type:** added (extracted from `nutrition/tomato/fertigation-recipe/app/spec.md`)
**REQs affected:** REQ-181, REQ-192 (NEW — header label, supersedes REQ-182 header half), REQ-184, REQ-193 (NEW — anchor placement, supersedes REQ-188 anchor half), REQ-189
**Summary:** New operator-UI spec for the fertigation page (tomato-only render, read-only stage header label, two-card shape, stock-volume anchor placement, missing-stage error card). REQ-192 + REQ-193 carry the operator halves of the REQ-182 / REQ-188 splits; original numbers remain live in `procedure/spec.md` for the data-layer halves.
**Suggested waves:** test-writer · pruner

## 2026-05-23 22:00 — nutrition/tomato/app (deleted)

**Change type:** deleted
**REQs affected:** REQ-104..111, REQ-113, REQ-114, REQ-163, REQ-153, REQ-004 (all relocated, content preserved)
**Summary:** Spec file fully distributed into `shell/spec.md` + per-block `builder/spec.md` files (see entries above). No content lost. Directory itself remains for code (`page.html`, `logic.js`, `supply.js`) — specialist's parallel scope handles the `app/` → `shell/` directory rename.
**Suggested waves:** none (file deletion only)

## 2026-05-23 22:00 — nutrition/tomato/fertigation-recipe/app (spec deleted)

**Change type:** deleted
**REQs affected:** REQ-181..191 (all relocated into `procedure/` + `operator/`; REQ-182 and REQ-188 each split, gaining REQ-192 / REQ-193)
**Summary:** Spec file fully distributed into sibling `procedure/spec.md` + `operator/spec.md`. Code files (`page.html`, `logic.js`, `stored.js`, `drift.js`) remain in `app/` for specialist's parallel layout pass.
**Suggested waves:** none

## 2026-05-23 22:00 — requirements.md

**Change type:** edited (Domain organization table)
**REQs affected:** none amended; metadata only.
**Summary:** Updated the Domain organization table to drop the stale `nutrition/tomato/app/spec.md` row and list the new spec locations (`shell/spec.md`, per-subproject `builder/spec.md`, `operator/spec.md`, `procedure/spec.md`). Pointer hygiene only — no REQ semantics touched.
**Suggested waves:** none

## 2026-05-23 17:37 — nutrition/tomato/fertigation-recipe/app

**Change type:** added
**REQs affected:** REQ-181, REQ-182, REQ-183, REQ-184, REQ-185, REQ-186, REQ-187, REQ-188, REQ-189, REQ-190, REQ-191
**Summary:** New page-level spec.md for the operator-facing tomato fertigation page (`app/page.html`). Page narrows to tomato-only (lettuce + nursery carve out to their own subprojects), STORED-only source, auto-stage from ISO week, two-card shape (Lundi matin prep + Mardi-à-vendredi daily check), Configuration card cut (Dosatron 2 % folded into prep step 1), Bien-réglé-quand block cut, steps render from structured data with "Pourquoi" only when operational importance ≥ 4/5, stock volume rounded up to quarter-bucket (5 L), missing-stage shows error card not zeros, two Slack-post instructions to `#recherche-et-developpement`.
**Suggested waves:** test-writer · coder · pruner
