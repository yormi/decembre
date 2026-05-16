# team-leader ← product-owner (archive)

Processed entries from `from-product-owner.md`. The team-leader cuts each entry from that file after the wave runs and pastes it here, appending a one-line outcome under the original block:

```
### Team-leader outcome (YYYY-MM-DD)
Wave(s) run: test-writer · coder · pruner. Subagent reports: N tests added, M lines pruned. npm test + npm run check status.
```

Most recent at the top.

## Entries

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
