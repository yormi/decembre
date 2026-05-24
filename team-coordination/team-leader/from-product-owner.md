# team-leader ← product-owner

Spec-change notifications from the product-owner persona. Each entry names one subproject whose `spec.md` changed (REQs added, edited, or deleted) and signals to the team-leader that test / code / prune work is now pending there.

The team-leader reads this file at session start. When it processes an entry — by running the relevant wave(s) for that subproject — it cuts the entry from this file and appends it to `from-product-owner-done.md` with a one-line outcome.

## Format

Append at the top (most recent first):

```
## YYYY-MM-DD HH:MM — <subproject-path-relative-to-repo>

**Change type:** added | edited | deleted (one or more)
**REQs affected:** REQ-NNN, REQ-NNN, ...
**Summary:** 1–2 sentences on what changed in the spec.
**Suggested waves:** test-writer · coder · pruner (any/all — leader decides final scope)
```

`<subproject-path>` is the directory holding the changed `spec.md`, e.g. `nutrition/tomato/plant-needs` or `requirements.md` for the root cross-app file.

A single turn that touches multiple subprojects writes one entry per subproject.

## Entries

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
