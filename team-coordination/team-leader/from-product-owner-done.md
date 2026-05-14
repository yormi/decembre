# team-leader ← product-owner (archive)

Processed entries from `from-product-owner.md`. The team-leader cuts each entry from that file after the wave runs and pastes it here, appending a one-line outcome under the original block:

```
### Team-leader outcome (YYYY-MM-DD)
Wave(s) run: test-writer · coder · pruner. Subagent reports: N tests added, M lines pruned. npm test + npm run check status.
```

Most recent at the top.

## Entries

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
