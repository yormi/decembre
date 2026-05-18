# team-leader ← product-owner (archive)

Processed entries from `from-product-owner.md`. The team-leader cuts each entry from that file after the wave runs and pastes it here, appending a one-line outcome under the original block:

```
### Team-leader outcome (YYYY-MM-DD)
Wave(s) run: test-writer · coder · pruner. Subagent reports: N tests added, M lines pruned. npm test + npm run check status.
```

Most recent at the top.

## Entries

## 2026-05-17 — nutrition/lettuce/app — Block 2 bundle (REQ-177..180) + REQ-176 input-name fix

**Change type:** added, edited
**REQs affected:** REQ-176 (edited — input names snake_case → camelCase to match plant-needs spec convention); REQ-177 / REQ-178 / REQ-179 / REQ-180 (added — Block 2 plant-need bundle).
**Summary:**
- **REQ-176 amendment.** Input names rewritten `transplant_g` → `transplantG`, `target_g` → `targetG`, `cycle_days` → `cycleDays`. Aligns with `nutrition/lettuce/plant-needs/spec.md` REQ-165 signature and tomato REQ-104 convention. Behavior unchanged; spec-naming-only fix.
- **REQ-177** pins demand source: plant-need block reads `window.PlantNeedsLettuce.calculateLettuceNutritionDemand(transplantG, targetG, cycleDays, density)`; no bare-global access to `LETTUCE_TISSUE_DW` / `LETTUCE_DM_FRACTION` in the render path. Mirrors tomato REQ-108.
- **REQ-178** pins row layout: exactly 2 columns (`Él.` / `Besoin`) — no fruit/biomass split (Salanova is monotonic-mass-gain per REQ-166). Diverges from tomato REQ-111 (4-col with fruit/biomass) on purpose.
- **REQ-179** pins click-to-modal: every element in `LETTUCE_TISSUE_DW` is a clickable row; modal shows EXACTLY three pieces (cert badge per REQ-168 / symbolic equation / plugged numbers). Rejects the current modal's 4th piece (`interpretation` prose like "Macros Salanova bien documentés en littérature serre — cert 4."). Tomato REQ-109 lookalike.
- **REQ-180** pins reactivity: mutating any of `transplantG` / `targetG` / `cycleDays` / `density` re-renders the plant-need block; `phLocked` is supply-side per REQ-167 and excluded. Tomato REQ-110 lookalike scoped to the four demand-side scalars.

### Team-leader outcome (2026-05-17)
Sub-wave J. Three-pass test-writer + coder + pruner. **Test-writer (W1):** created `nutrition/lettuce/app/spec.test.mjs` (392 lines) covering REQ-176/177/178/179/180; shared boilerplate in new `nutrition/lettuce/app/test-helpers.mjs`. Initial pass: REQ-177 / REQ-178 / REQ-180 already green against existing code (demand source + 2-col layout + reactivity already aligned); REQ-176 + REQ-179 failed substantively (sixth front-load input present + interpretation prose still in modal payload). **Coder (W2):** removed front-load DOM input from lettuce Bilan header card at `nutrition/lettuce/app/page.html` (-7 lines), trimmed corresponding listener wiring at `app/operator/nutriment.js` (1-line glue trim), stripped `interpretation` key from `registerPourquoi` payload at `nutrition/lettuce/app/logic.js` line ~88 (REQ-179). **Pruner (W3):** verified cert-reasoning prose preservation in `nutrition/lettuce/plant-needs/derivation.md` BEFORE strip — confirmed per-element cert table captures macros cert 4 / micros cert 3 with Salanova-breeder-data + leafy-greens-generality defenses; no info loss across the strip. `npm test` 259 → 316 / 0 (+57 new tests green; REQ-176/179 flipped from red to green); `npm run check` 161/0 maintained.

**Owned-surface expansion (P-10 — surface-for-Guillaume):** `nutrition/lettuce/app/page.html` (DOM partial) and `app/operator/nutriment.js` (listener glue) touched by the wave but outside the strict team-leader owned-globs. Parallel to the 2026-05-15 expansion ratification (P-10 episode) when `app/index.html` / `nutrition/render.js` / `scripts/check-recipes.mjs` were folded into the persona's surface after a similar incident. Both files are post-Stage-7-carve fragments of `app/index.html`; same routing logic suggests folding `**/page.html` and `app/operator/**/*.js` into the persona body's owned-glob list. Awaiting Guillaume's ratification.

## 2026-05-16 22:00 — app/operator (new subproject — Stage 1 of 6-stage app/index.html carve)

**Change type:** added (structural refactor — no spec change; carves operator chrome out of `app/index.html` into `app/operator/`)
**REQs affected:** none — REQ-005 (cross-app page-registry + `setPage` + `setCrop` + `syncHash` + `CROP_PAGES`) keeps the same window-global identifier surface, only file location changes; spec text in `requirements.md` unchanged.
**Summary:** Stage 1 of 6-stage `app/index.html` carve plan (see `working files/index-html-carve-plan.md`). Extract operator chrome — top nav, page-toggle bar, crop selector, `setPage` / `setCrop` / `setCropBtn` / `setVigor` / `syncHash` JS, page/crop hash routing, vigor + stage levers — out of `app/index.html` (~200-400 lines) into `app/operator/{page.html, page.css, logic.js}`. Floor target after all 6 stages: `app/index.html` from 5521 → ~500-800 lines.
**Suggested waves:** test-writer · coder · pruner. Stages 2-6 stay queued until this entry is archived green.

### Team-leader outcome (2026-05-16) — ALL SIX STAGES SHIPPED IN ONE SESSION

Per Guillaume's "do the full 6 stages" ruling, the team-leader executed all six stages of the carve plan sequentially with verifier-green gates between each, in a single session. Six coder subagents, six commits, six verifier passes — all green throughout.

**Stage 1 (commit 0aaf229) — app/operator chrome carve:** moved top nav + page-toggle + crop selector + setPage/setCrop/setCropBtn/setVigor/syncHash + cropFor + toggleAdmin + init wiring + PAGES/ADMIN_PAGES/CROP_PAGES constants. Created `app/operator/{page.html (40), page.css (18), logic.js (347)}`. 4 TDZ-mandatory let state vars kept inline. REQ-005 window-global identifier surface preserved explicitly at bottom of logic.js. `app/index.html` 5523 → 5146 (-377).

**Stage 2 (commit 40fceae) — lettuce + nursery composites:** carved Salanova nutriment HTML scaffold into `nutrition/lettuce/app/page.html` (101); carved nursery composite from scratch into `nutrition/nursery/app/{page.html (75), logic.js (268)}`. No lettuce/nursery-specific CSS to extract. Cross-domain leak check clean — sub-wave F dispatch inversion held. `app/index.html` 5146 → 4710 (-436).

**Stage 3 (commit a871917) — recipe-page carves (highest risk):** created `nutrition/tomato/{fertigation,foliar}-recipe/app/{page.html, stored.js, logic.js}` + `nutrition/tomato/sidedress-recipe/app/stored.js`. STORED_RECIPE.tomato.{fertigation, foliaire, sidedress} paths preserved BYTE-IDENTICAL across the file move — single literal split into shell + 3 includes, inner-object bytes verbatim (T1-T5 numeric content, foliar arrays, sidedress per-stage entries unchanged). `/retire-recipe` skill workflow unaffected — `dist/index.html` has 63 grep hits across the 3 STORED paths. P-08 carve-out from the persona's "always escalate STORED" gate per plan body. `app/index.html` 4710 → 4092 (-618).

**Stage 4 (commit ae841eb) — cross-crop pages + per-crop sol/irrigation:** created `app/week/`, `app/diagnostic/`, `app/historique-nutriments/` (with RECIPE_HISTORY byte-identical move to `history.js`), plus `nutrition/{tomato,lettuce}/app/{sol,irrigation}/` subpages. 11 @include directives wired. RECIPE_HISTORY path preserved (11 dist hits). Sun-time helpers + TENSIO_CONFIG intentionally left inline for Stage 5 placement decision. `app/index.html` 4092 → 2889 (-1203).

**Stage 5 (commit 8bb96b4) — lib/ extraction:** moved 7 shared helpers to deepest-common-ancestor lib/ dirs: `lib/spec-strings.js` (renderSpec), `lib/sun.js` (SUN_TABLE + sun-time helpers), `nutrition/lib/{product-pct,format,pourquoi,render-gap-grid}.js` (PRODUCT_PCT, formatMg/formatValue, pourquoi modal infra, renderGapGrid), `nutrition/tomato/app/irrigation/logic.js` (TENSIO_CONFIG + buildTensio). `fmt` inlined into fertigation-recipe consumer; `fmtML` deleted as dead code. Single-consumer integrator soil-math (weeklyMassFlowL, transpirationFactor, etc.) and cross-page state-reading helpers (getRatio, getMultK, recalc, etc.) intentionally left inline. `app/index.html` 2889 → 2490 (-399).

**Stage 6 (commit 3b1aaa3) — per-page CSS split (FINAL):** carved chrome CSS block into 7 page.css / lib/styles.css files: `lib/global.css` (64 — :root tokens, base layout, .stage-*, .pq-modal*), `nutrition/lib/styles.css` (13 — input layout), `nutrition/tomato/lib/styles.css` (9 — .steps-list/.step-*), `nutrition/tomato/app/sol/page.css` (3), `nutrition/tomato/fertigation-recipe/app/page.css` (5 — .param-*), `app/week/page.css` (13), `app/diagnostic/page.css` (32 — .diag-* including .diag-cert-0..5 badges). 12 dead CSS rules deleted (.result-*, .bed-info*, .irr-grid, .irr-card*, .multi-row .multi-unit — vestiges of prior UI iteration). `app/index.html` `<style>` block reduced 159 → 10 lines (just @includes). `app/index.html` 2490 → 2341 (-149).

**Final stats across all 6 stages:**
- `app/index.html`: **5523 → 2341 lines (-3182, -57.6 %)**
- `dist/index.html`: 10159 → 10231 (+72 cumulative @include marker hygiene; well within tolerance)
- New subprojects: 7 cross-crop / per-crop `app/` dirs + 4 `lib/` dirs (top-level, nutrition-level, tomato-level)
- Files created: 31 (HTML + CSS + JS partials across 11 carved subprojects)
- STORED_RECIPE / RECIPE_HISTORY values byte-identical throughout; paths preserved; `/retire-recipe` skill workflow unaffected
- No DOM ID changes; no behavior change; window-global identifier surface preserved (REQ-005 invariant intact at every stage)
- `npm test` 255/0 maintained at every stage end
- `npm run check` 161/0 maintained at every stage end
- REQs wired 108/111 unchanged
- 8 commits total (Phase -2 snapshot + sub-wave H + 6 stage commits, each independently revertible)

Stages 2-6 were unblocked end-to-end after Stage 1 — no scope changes mid-execution. The plan's "one stage per session" cadence was overridden by Guillaume's direct ruling for this session. Future structural-refactor mailbox entries can use the same one-coder-subagent-per-stage / verifier-green-gate-between-each pattern.

## 2026-05-16 — nutrition/tomato/app

**Change type:** added
**REQs affected:** REQ-163 (added)
**Summary:** Foliar Efficacité column becomes surfactant-aware. Toggling the surfactant lever in Block 5 re-renders the Efficacité column with new values; with surfactant on, foliar efficiency for routed elements is higher than without. Sibling to REQ-114 (Block 5 reactivity to spray count + surfactant). Note: the model side — making the foliar channel's `efficiency` capability map respond to a surfactant flag — is a specialist change, filed in parallel on `plant-nutrition-specialist/from-product-owner.md`.
**Suggested waves:** test-writer (REQ-163 matcher: assert that the foliar channel's exposed efficiency map differs between `surfactant: true` and `surfactant: false` for at least one routed element; reactive-render test that toggling the lever triggers a re-render of the Efficacité column) · coder (Block 5 surfactant-toggle handler must re-trigger foliar block render; foliar consumer must pass the current surfactant state when reading the channel's efficiency map — waits on specialist exposing a surfactant-aware efficiency surface) · pruner (no work this entry — the change is additive on top of REQ-157's capability-view efficiency contract).

### Team-leader outcome (2026-05-16)
Sub-wave F.1. Wave 1 test-writer added 2 designed-to-fail jsdom tests in `nutrition/tomato/app/spec.test.mjs` (REQ-163(a) `supply.foliar.efficiency` passthrough between surfactant on/off; REQ-163(b) Block 5 reactive Efficacité re-render on toggle); REQ-163 verifier block in `scripts/check-recipes.mjs` flipped from pass-with-TODO to real designed-to-fail. Wave 2 coder swapped `app/index.html:4741` from static `window.FoliarRecipeTomato.efficiency` to `efficiencyFor(surfactant)`; threaded `#nutr-foliar-surfactant.checked` into the foliar branch — toggling now flips Mn/Zn/Cu/Fe from 27 % to 72 % on next render (Block 5 reactive path was already wired by REQ-114). Identifiers full-word per REQ-158. Pruner: no work (PO note correct — additive on REQ-157 capability-view). Specialist's parallel REQ-170 surfactant-aware efficiency surface (`efficiencyFor`) was already passing when sub-wave F.1 started. `npm test` 250/0 (was 248/2 with REQ-163 designed-to-fail); `npm run check` 161/0 (was 160/1). REQs wired 108/111.

## 2026-05-16 — nutrition (REQ-159/160/161 fully landed; REQ-162 pass-with-TODO)

**Change type:** added
**REQs affected:** REQ-159 (added), REQ-160 (added), REQ-161 (added), REQ-162 (added)
**Summary:** Lean-table sweep across every nutrition table. REQ-159 pins elemental-mass columns to milligrams (mg) — recipe-product mass tables in g/kg, including Block 7/8 « Recette stockée vs calculée (drift) », are carved out and stay as-is. REQ-160 moves the unit out of every cell into the column header once; cells carry only the numeric value (or `0`, `—`, `0 %`). REQ-161 drops the `(couvert)` annotation from the contribution-block gap-grid: the `Manque sortant` cell renders the bare digit `0`, color carrying the meaning per REQ-016. REQ-162 reframes the soil-bank block's Mois d'épuisement column as the Mehlich-3 reservoir divided by the weekly plant uptake currently sustainable at the measured SME plant-availability — every element row, not just the CONTRIBUTING ones. Note: REQ-162 is operator-facing only; the model-side switch from "Mehlich-3 ÷ stage demand" (REQ-142 today) to "Mehlich-3 ÷ SME-derived weekly uptake" requires a specialist data + math pass — filed in parallel on `plant-nutrition-specialist/from-product-owner.md`.

### Team-leader outcome (2026-05-16)
Wave 1 test-writer added 5 matchers in `scripts/check-recipes.mjs` (REQ-159 through REQ-163, the last spanning the sibling `nutrition/tomato/app` PO entry). Wave 2 coder landed REQ-159 + REQ-160 + REQ-161 in `app/index.html` (renderGapGrid: 3 elemental-mass column headers now suffixed `(mg)`, new `formatMg(mg)` helper for bare-numeric cells, `(couvert)` parenthetical dropped — bare `0` with REQ-016 green color carries the covered meaning) and `nutrition/soil-contribution/render.js` (mirror edits on the soil-bank block). REQ-162 stays pass-with-TODO matching the Salanova/Semis pattern — awaits specialist's Mehlich-3 ÷ SME-weekly-uptake math + data pass (filed in parallel on `plant-nutrition-specialist/from-product-owner.md`). Final: npm test 189/189/0 · npm run check 153/0 (REQs wired 101/104, +5 from this wave). Will re-fire once REQ-162's model-side data lands so the structural every-row-with-reservoir-data check can flip from TODO-pass to a real formula-source assertion.

## 2026-05-15 15:42 — requirements.md

**Change type:** added
**REQs affected:** REQ-158 (added)
**Summary:** New cross-app spec: function names, variable names, and object-property names in JS source (`app/`, `nutrition/`, `yield-range/`) plus backticked identifier references in `spec.md` files and `team-coordination/**` markdown MUST be full words — no abbreviations. Verifier owns a denylist of common abbreviations with a domain-term whitelist (`cert`, `cap`, `pH`, unit suffixes `mg`/`kg`/`g`/`L`/`m²`, `REQ-NNN`). Motivated by the `eff` slip on REQ-157 earlier this session: the global no-abbreviation rule (user CLAUDE.md) is salience-bound and slips through into spec writes against codebase-pattern anchoring; only a deterministic gate closes the loop (PO principles P-09).
**Suggested waves:** test-writer (matcher in `scripts/check-recipes.mjs` for REQ-158) · coder (wire the denylist + whitelist; refactor existing identifiers; **grandfathering question** for Guillaume — three options: (a) refactor before enable, (b) enable on new-files-only, (c) global with exempt path list).

### Team-leader outcome (2026-05-16)
Guillaume picked option (a) — refactor before enable. Wave 1 test-writer added the matcher to `scripts/check-recipes.mjs` (lines 4707-5027) walking JS files via regex on function/const/let/var/class/object-key/param/destructure declaration sites; denylist 35 PO-seeded tokens; whitelist exempts chemistry/units (`cert`, `cap`, `pH`, unit suffixes), STORED_RECIPE / RECIPE_HISTORY key names (audit-trail), product brand names (K2SO4, MgSO4-7H2O, Solubore, Actisol, FarinePlumes, FeSO4, etc.), idiomatic loop iterators (`i`/`j`/`k` in c-style for-loops only). Designed-to-fail at first run: 186 hits across 17 files (top: 41× `el`, 17× `maxStableHours`, 9× `num`, 8× `eff/effectiveEff`). Wave 2 coder refactored across 39 JS/HTML/MJS files in app source + test scaffolding. Public-API renames cascaded through `scripts/check-recipes.mjs` `exposeNames` and every `*.test.mjs` + `test-helpers.mjs`: `calcNutrSupply` → `calculateNutritionSupply`; `calcNutrDemand` → `calculateNutritionDemand`; `calcLettuceNutr{Supply,Demand}` → `calculateLettuceNutrition{Supply,Demand}`; `calcNurseryDemand` → `calculateNurseryDemand`; `effectiveEff` → `effectiveEfficiency`; `maxStableHours` → `maximumStableHours`; `minApplicationsPerWeek` → `minimumApplicationsPerWeek`; constants `SIDEDRESS_MIN_EFF` → `SIDEDRESS_MINIMUM_EFFICIENCY` (incl. namespace key `MIN_EFF` → `MINIMUM_EFFICIENCY`); `TOMATO_NUM_BEDS`/`LETTUCE_NUM_BEDS` → `TOMATO_NUMBER_BEDS`/`LETTUCE_NUMBER_BEDS`; `RGR_MAX_LETTUCE_NURSERY` → `RGR_MAXIMUM_LETTUCE_NURSERY`; `TRAJECTORY_MAX_DAYS` → `TRAJECTORY_MAXIMUM_DAYS`; object-literal keys `eff` → `efficiency` on SIDEDRESS_PRODUCTS; `req` (REQ-145 interpretation contract) → `requirementId` (verifier indirect-call regex updated in tandem). Mechanical local sweeps via word-boundary regex: `el → element` (~250), `idx → index`, `cur → current`, `prev → previous`, `num → number`, `fn → handler`, `cfg → config`, `init → initialize`, `tmp → temporary`, plus composites `blockEl → blockElement`, `headlineEl → headlineElement`, `totalMin → totalMinutes`, `dayNum → dayNumber`. Wave 3 pruner skipped — the refactor IS the prune. **Surfaced**: self-corrupting safe-rename pattern caught + reverted twice when the helper substituted denylist string literals INSIDE `scripts/check-recipes.mjs` itself (`'idx' → 'index'`, `'eff' → 'efficiency'` in DENYLIST set body); future refactors on the verifier file should skip its DENYLIST literals OR the matcher should load denylist from a separate constant module immune to refactor regex. Markdown sweep deferred (PO entry mentions backticked tokens in spec.md / team-coordination/** — not in this wave). Final: npm test **189/189/0** · npm run check **141/0/141** (REQ-158 `scanned 36 files · 0 denylist hits`; REQs wired 96/99).

## 2026-05-15 15:20 — nutrition (REQ-157 follow-up)

**Change type:** added
**REQs affected:** REQ-157 (added, sibling to REQ-136)
**Summary:** Channel-side contract for the Efficacité column landed: every contribution-channel function (compost, substrate, sidedress, fertigation, foliar, front-load, nursery substrate, nursery fertigation) MUST expose a per-element `efficiency` map alongside its flat mg map and `details` payload. `eff[el] ∈ [0, 1]` is the share of applied product mass plant-available for that element; elements not routed are absent from the map (renderer reads absence as `—` per REQ-156). Specialist mailbox notified for the model-layer subprojects (`compost-contribution/model.js`, `nursery/substrate-contribution/model.js`) — their per-channel specs need to declare `efficiency` in their public-API contracts too. Coder-lane channels (fertigation / foliar / sidedress / front-load / nursery fertigation, all living in `app/index.html`) remain on the prior nutrition entry.
**Suggested waves:** test-writer (add a REQ-157 matcher to `scripts/check-recipes.mjs` — every contribution-channel runtime namespace exposes `efficiency` with values in `[0, 1]` for routed elements, absent for non-routed) · coder (once specialist + coder-lane channels expose `efficiency`, swap the earlier "derive per-element efficiency" guidance to "read `efficiency[element]` from each channel's return"; this collapses the wiring across `renderGapGrid` callers) · pruner (no work this entry).

### Team-leader outcome (2026-05-15)
Wave 1 test-writer: REQ-157 matcher added to `scripts/check-recipes.mjs` walking every contribution-channel runtime via jsdom; asserts `efficiency[el] ∈ [0,1]` for routed elements (mg > 0 in the flat map) and absent for non-routed. 2 specialist-owned model-layer channels initially pass()-with-TODO (matching the Salanova/Semis pattern). Wave 2 coder: 5 coder-lane channels in `app/index.html` (fertigation: PH_RESPONSE × effectiveEff; foliar: FOLIAR_COVERAGE_DEFAULT × penetration; sidedress: SIDEDRESS_MIN_EFF mass-weighted N blend for Actisol + FarinePlumes; front-load: PH_RESPONSE; nursery fertigation: 1.0 per routed element pending pH-curve import) now expose `efficiency` map sibling of their flat per-element mg map. All 4 tomato + 3 lettuce + 2 nursery renderGapGrid callers updated to pass channel efficiency. Concurrent specialist evening edits shipped REQ-080 (compost-contribution `COMPOST_EFFICIENCY`) and REQ-097 (substrate-contribution `NURSERY_SUBSTRATE_EFFICIENCY`) and flipped the verifier's 2 TODO-passes to real `validateEfficiencyMap` checks — wave reflects this naturally. Final: npm test **189/189/0** · npm run check **137/0/137** (REQs wired 95/99, +2 from specialist's REQ-080 + REQ-097).

## 2026-05-15 15:07 — nutrition

**Change type:** edited, added
**REQs affected:** REQ-137 (edited), REQ-156 (added)
**Summary:** Standard contribution-block gap-grid grows from 5 to 6 columns with a new `Efficacité` slot between `Manque entrant` and `Apport ici` (REQ-137 amended in place). REQ-156 defines the cell: integer percent of applied product mass that the channel delivers as plant-available for that element under current conditions; `—` when no product routes the element. Applies to the standard contribution table — the Tomato Sol soil-bank block is out of scope (it is not a standard contribution channel; per REQ-141/142 it renders its own column shape in `nutrition/soil-contribution/`). Coder reads `efficiency[element]` per the REQ-157 contract (see the 15:20 follow-up entry above) rather than re-deriving from per-channel constants.
**Suggested waves:** test-writer (add REQ-137 column-count + REQ-156 cell-format matchers to `scripts/check-recipes.mjs`; row-format check accepting `\d+ %` or `—` in the new cell) · coder (`renderGapGrid` in `app/index.html` + every caller across tomato logic + lettuce + nursery blocks — read `efficiency[element]` from each channel's return per REQ-157; for the coder-lane channels living in `app/index.html` itself — fertigation / foliar / sidedress / front-load / nursery fertigation — populate `efficiency` inline from existing surfaces (`PH_RESPONSE`, `SIDEDRESS_MIN_EFF`, `effectiveEff`, foliar coverage); specialist owns the model-layer channel modules per the specialist mailbox) · pruner (re-scan the tree for any other "5-column" references not caught in `nutrition/nursery/app/spec.md`, plus stale code comments in `nutrition/render.js`).

### Team-leader outcome (2026-05-15)
Wave 1 test-writer: REQ-137 matcher amended in `scripts/check-recipes.mjs` (echo + column count + header text array → `['Él.', 'Manque entrant', 'Efficacité', 'Apport ici', 'Manque sortant', '']`). REQ-156 matcher added: 6-col gap-grid 3rd cell text matches `/^\s*\d+\s*%\s*$/` OR `'—'` per row. REQ-127 + REQ-128 cross-amended too (nursery substrate + nursery fertigation matchers shared the same 5-col template). Wave 2 coder: `renderGapGrid` in `app/index.html` (line ~4963) grows to 6 cols with new `efficiency = {}` arg; cell renders `Math.round(efficiency[el] * 100) + ' %'` if numeric, else `'—'`. All 9 renderGapGrid callers (4 tomato + 3 lettuce + 2 nursery) updated to pass channel.efficiency. Visual sanity check: NOT performed by Wave 2 (no live-server running; structural DOM checks in verifier confirm correctness against `dist/index.html`). Wave 3 pruner: 3 surgical comment edits (5-col → 6-col in `nutrition/render.js` + `app/index.html` + `scripts/check-recipes.mjs` transitional comment). **One borderline surfaced for specialist call**: `nutrition/soil-contribution/render.js:5` + `nutrition/soil-contribution/spec.md:78` describe the non-generic 6-col soil-bank grid WITHOUT Efficacité column — was intentionally excluded from REQ-137 per the entry's "Tomato Sol soil-bank block is out of scope" note, but REQ-156 wording could be read to extend; flagging for specialist decision. Final: npm test **189/189/0** · npm run check **137/0/137**.

## 2026-05-15 15:07 — nutrition/nursery/app

**Change type:** edited
**REQs affected:** inherited REQ-137 references swept; REQ-156 added to inherited list
**Summary:** Pruned three "5-column" references to "6-column" in REQ-127, REQ-128, and the inherited-specs block; added REQ-156 to the inherited list. No new REQs in this subproject.
**Suggested waves:** pruner (verify no other instances) · no test-writer / coder work in this subproject directly — handled by the cross-app `nutrition` entry above.

### Team-leader outcome (2026-05-15)
Wave 3 pruner verified the PO's spec.md sweep was complete on `nutrition/nursery/app/spec.md`. One residual flagged for foreign owner: line 33 has a historical "Rationale" paragraph still referencing the pre-amendment 5-col state — PO's call whether to amend in place or leave as historical context (spec.md = foreign surface, team-leader does not touch). REQ-127 + REQ-128 verifier matchers (in `scripts/check-recipes.mjs`) updated to 6-col as part of the cross-app REQ-137/156 wave above — REQ-127 and REQ-128 lines flipped green when Wave 2 coder shipped renderGapGrid. No code or test work needed in this subproject directly per the entry. Final tallies as above.

## 2026-05-14 07:22 — nutrition

**Change type:** added, edited
**REQs affected:** REQ-152 (added 2026-05-12), REQ-137 (amended in place 2026-05-12)
**Summary:** Two un-implemented PO-level DOM contracts in `nutrition/spec.md`. **REQ-152** — every contribution channel block on Tomato Nutrition, Salanova, and Semis Laitue must render a 3-col recipe table `Produit | Composition (% m/m) | Quantité` between title and gap-grid. **REQ-137** — gap-grid is the recipe table's immediate next sibling.
**Suggested waves:** coder · test-writer · pruner.

### Team-leader outcome (2026-05-14) — TOMATO SLICE COMPLETE; Salanova + Semis deferred to F1-post

Per Guillaume's "focus on tomato nutrition" directive (2026-05-13), this wave shipped the tomato slice only:

- **Wave 1 (test-writer)**: REQ-152 verifier added in `scripts/check-recipes.mjs` walking 4 tomato contribution blocks (Compost / Sidedress / Fertigation / Foliaire); Salanova (Sol / Fertigation / Front-load) and Semis (Réserve substrat / Fertigation) emit explicit `pass()`-with-`// TODO: wire after F1 lettuce carve` so the structural sweep is in place for all 9 blocks. REQ-137 amended in place: dropped strong-element bullet (didn't exist in REQ-137 — only in REQ-127); added gap-grid-as-recipe-table's-next-sibling assertion.
- **Wave 2 (coder)**: NEW `nutrition/render.js` (72 lines) — generic `renderRecipeTable(recipe, productRegistry)` emitting the 3-col HTML table; composition cell renders `${symbol} · ${pct} %` in canonical element order, zeros omitted, French-comma decimals. Wired into the 4 tomato blocks in `nutrition/tomato/app/logic.js`; 4 prose `<div>` summaries + 4 helper-text lines stripped (nothing else sits between title → table → gap-grid on tomato). Small cross-boundary edit at `app/index.html:4853` adding `feSO4_g` to `calcNutrSupply.raw` so the foliar table renders product weight (80 g FeSO₄·7H₂O) not elemental Fe (16 g).
- **Wave 3 (pruner)**: 5 PA-Taillon stale anchor prose sites rewritten to REQ-154 framing (combined with REQ-154 inbox's optional sweep); post-wiring residual prose check returned clean. STORED-side PA Taillon mentions correctly left alone — STORED is still hand-locked and /retire-recipe-governed.
- **Salanova + Semis remainder**: 5 contribution blocks (Salanova Sol / Fertigation / Front-load + Semis Réserve substrat / Fertigation) still emit `<div>` instead of `<table>`. Verifier covers them with `pass()`-with-TODO. **Awaiting F1 lettuce carve (`nutrition/lettuce/plant-needs/` extraction) before wiring** — postponed by Guillaume on 2026-05-13. PO should re-file an inbox entry for the Salanova/Semis slice once F1 lands.
- **Recette proposée block**: deleted in `128a3bb` 2026-05-13 (item 4 of original PO-145).

Final: `npm test` 178/178/0 · `npm run check` 115/0 (REQs 92/95 wired; +2 from REQ-152 + amended REQ-137 vs prior 90/95).

---

## 2026-05-13 08:19 — nutrition/tomato/app

**Change type:** added
**REQs affected:** REQ-153
**Summary:** New REQ pinning the Block 8 « Recette stockée vs calculée (drift) » ratio direction to `recette premiers principes ÷ recette stockée` (currently rendered as the inverse). 100 % = parity, > 100 % = stored under-supplies vs FP, < 100 % = over-supplies. Implementation + retired-REQ-016 cleanup queued to specialist as `team-coordination/plant-nutrition-specialist/from-model-challenger.md` PO-153.
**Suggested waves:** test-writer · coder · pruner.

### Team-leader outcome (2026-05-13)
Wave(s) run: test-writer · coder · pruner. Subagent reports: 1 failing test added (REQ-153 K row ratio pin), 2-line ratio flip + sentinel mirror in `app/index.html` `renderPhase1Comparison`, 4 REQ-016 ghost refs rewritten to REQ-153 / deleted (page.html:127, logic.js:695, app/index.html:4241, yield-range/app/logic.js:83). REQ-153 verifier wired in `scripts/check-recipes.mjs` (stubs FP/Stored=1.5 → asserts rendered "150"; guards inverse "67"). Final: `npm test` 178/178/0 · `npm run check` 115/0 (was 114; +1 from new REQ-153 check).
