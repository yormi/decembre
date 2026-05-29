# team-leader ← spec-pruner (done)

Archive of processed mailbox entries with team-leader outcome blocks.


## 2026-05-24 — Bulk archive — Phase 1-4 nutrition reorg (1 entries)

### Team-leader outcome (2026-05-24)
All 1 entries below resolved by the Phase 1-4 nutrition reorg run on 2026-05-23/24. Commits: c24911c (Phase 1+2), 8d0bfcb (Phase 3), Phase 4 pending commit. Verifier green at every checkpoint: npm test 22/22, npm run check 161/0. PO spec edits applied; specialist code moves done; pruner stale-reference sweep landed (14 updates, 4 KEEPs, 8 punts surfaced); test-writer added REQ-011 cross-crop channel-role coverage + REQ-194 foliar-pH application coverage. Cut to done in bulk per session continuity; entries preserved verbatim below.

## 2026-05-24 — stale-reference sweep (post-reorg c24911c + 8d0bfcb)

**Scope:** Tree-wide grep for `recipe-math` / `tomato/app/user-stories.md` / `tomato/app/logic.js` / `shell/supply.js` / `REQ-012` / `computeRecipe` / `passiveSupplyMassFlow` after the Phase 1-3 reorg commits. Surface: source comments (non-test code), `derivation.md`, `learnings.md`, `scripts/check-recipes.mjs`. Excluded per lane: `*.spec.md` (PO), `*.test.mjs` (test-writer), `team/`, `working files/`.

**Updates (14):**
- `app/index.html:566` `tomato/app/logic.js` → `tomato/shell/logic.js`
- `app/index.html:576` same
- `app/operator/nutriment.js:16` same
- `nutrition/tomato/fertigation-recipe/model/contribution.js:3` `shell/supply.js` → `shell/contribution-orchestrator.js`
- `nutrition/tomato/sidedress-recipe/model/contribution.js:3` same
- `nutrition/tomato/foliar-strategy/model/contribution.js:2,43,69` same (3 hits in one file)
- `nutrition/tomato/fertigation-recipe/model/derivation.md:191` `app/logic.js` → `shell/logic.js`
- `nutrition/tomato/fertigation-recipe/model/learnings.md:193` same
- `nutrition/tomato/plant-needs/model/derivation.md:145` same
- `nutrition/tomato/channel-role.js:8` REQ-012 dropped (folded into REQ-011 in `nutrition/spec.md`)
- `scripts/check-recipes.mjs:18,1322,1324` REQ-012 → REQ-011 (header + comment + label)
- `scripts/check-recipes.mjs:1749` `tomato/app/user-stories.md` → `tomato/shell/spec.md` (REQ-153 new home)
- `scripts/check-recipes.mjs:3374` `tomato/app/user-stories.md` → `tomato/shell/spec.md` (REQ-104..107 new home)
- `scripts/check-recipes.mjs:3531` → `tomato/plant-needs/builder/user-stories.md` (REQ-108..111)
- `scripts/check-recipes.mjs:3866,3909` → `tomato/foliar-strategy/builder/user-stories.md` (REQ-113, REQ-114)
- `scripts/check-recipes.mjs:5570,6041` → `tomato/foliar-strategy/builder/user-stories.md` (REQ-163)

**Deletions:** none. Every stale reference had a legitimate new home — updates only.

**KEEP decisions (audit-trail / historical / not-stale):**
- `app/index.html:531-540` — Phase 2 chemistry pull-up audit comment; names retired `recipe-math.js` as historical origin of the four chemistry files. Load-bearing for future readers.
- `nutrition/chemistry/model/{products,ph-response,compatibility,predicted}.js` headers naming `recipe-math.js` — same audit-trail rationale.
- `nutrition/tomato/channel-role.js:3` carve-out audit comment.
- All `calculateNutritionSupply` mentions — function name preserved across the move; no stale path.
- `nutrition/spec.md:9`, `nutrition/tomato/spec.md:9`, `nutrition/soil-contribution/spec.md:221,235` — `spec.md` is PO lane; surfaced but not touched. **Surface to PO:** these three spec bodies still point at deleted `nutrition/tomato/app/user-stories.md` and `nutrition/tomato/lib/recipe-math.js`; updates are PO's call.
- `working files/changelog.md` + `team/**/*.md` — audit trail.

**Punted (out of pruner lane):**
- `nutrition/lettuce/app/spec.test.mjs:5`, `nutrition/soil-contribution/spec.test.mjs:417,470`, `nutrition/tomato/shell/spec.test.mjs:1,803`, `nutrition/tomato/foliar-strategy/model/test-helpers.mjs:3`, `nutrition/tomato/shell/test-helpers.mjs:63` — all `*.test.mjs` / `test-helpers.mjs`. Stale `tomato/app/user-stories.md` and `tomato/app/logic.js` pointers in test comments. Route to test-writer.
- `nutrition/spec.md:9`, `nutrition/tomato/spec.md:9`, `nutrition/soil-contribution/spec.md:221,235` — stale pointers in `spec.md` bodies. Route to PO.

**Verifier:** `npm test` 22/22 · `bash scripts/check-spec.sh` 161/0 · `npm run check` 161/0.
