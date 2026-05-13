# Inbox archive — team-leader

Processed entries from `inbox.md`. The team-leader cuts each entry from `inbox.md` after the wave runs and pastes it here, appending a one-line outcome under the original block:

```
### Team-leader outcome (YYYY-MM-DD)
Wave(s) run: test-writer · coder · pruner. Subagent reports: N tests added, M lines pruned. npm test + npm run check status.
```

Most recent at the top.

## Entries

## 2026-05-13 08:19 — product-owner — nutrition/tomato/app

**Change type:** added
**REQs affected:** REQ-153
**Summary:** New REQ pinning the Block 8 « Recette stockée vs calculée (drift) » ratio direction to `recette premiers principes ÷ recette stockée` (currently rendered as the inverse). 100 % = parity, > 100 % = stored under-supplies vs FP, < 100 % = over-supplies. Implementation + retired-REQ-016 cleanup queued to specialist as `team-coordination/requests.md` PO-153.
**Suggested waves:** test-writer · coder · pruner.

### Team-leader outcome (2026-05-13)
Wave(s) run: test-writer · coder · pruner. Subagent reports: 1 failing test added (REQ-153 K row ratio pin), 2-line ratio flip + sentinel mirror in `app/index.html` `renderPhase1Comparison`, 4 REQ-016 ghost refs rewritten to REQ-153 / deleted (page.html:127, logic.js:695, app/index.html:4241, yield-range/app/logic.js:83). REQ-153 verifier wired in `scripts/check-recipes.mjs` (stubs FP/Stored=1.5 → asserts rendered "150"; guards inverse "67"). Final: `npm test` 178/178/0 · `npm run check` 115/0 (was 114; +1 from new REQ-153 check).
