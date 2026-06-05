# product-owner ← team-leader

Backlinks from team-leader to product-owner: spec gaps surfaced during wave execution, cleanup items team-leader saw but can't author (REQ writes are PO's lane), and surface-with-no-spec-backing findings that need a slug-or-prune decision.

PO reads this file when running their triage procedure. When triaged (either spec written or item dismissed), the entry is cut from this file and pasted into `from-team-leader-done.md` with `### PO outcome (YYYY-MM-DD)`.

## Format

Append at the top (most recent first):

```
## YYYY-MM-DD HH:MM — <subproject-path>

**Type:** spec-gap | stale-content | vestigial | cleanup
**Items:** 1-line summary per item (or bullets if multiple)
**Wave context:** which wave surfaced it (test-writer / coder / pruner) + brief why
**Suggested action:** slug | prune | re-spec | confirm
```

## Entries

## 2026-05-24 23:45 — nutrition/tomato/foliar-strategy/operator

**Type:** spec-gap (×4) + stale-content (×1) + vestigial (×1) + cleanup (×1)
**Items:**
- Operator card "Quand pulvériser" (`page.html:25-44` + morning-window `getSunTimes` math in `logic.js:116-126`) — operator timing guidance with no spec slug. Either write a slug or prune.
- Operator "missed-window" expander (`toggleMissedWindow` in `logic.js:56-62`, DOM in `page.html:32-42`) — no spec backing. Slug or prune.
- Operator application-steps card (`page.html:53-96`, 6 steps incl. "Signer le registre") — no spec backing. Slug or prune.
- Operator "Signes à surveiller" card (`page.html:107-124`) — symptom guide, no spec slug. Slug or prune.
- Stale Spray A/B reference in operator application-steps step 6 — "spray (A ou B)" wording predates the 2026-05-06 Spray B retirement + the 2026-05-24 oligo/ca rename. Should read `oligo` (or whatever the relevant recipe-kind is at that step).
- Hidden lettuce foliar crop-toggle button (`page.html:10-17`) — `display:none` since 2026-04-29 lettuce foliar removal. Safe to prune entirely (toggle now has only the Tomates button).
- Operator/logic.js header HISTORY/RATIONALE comment block (`logic.js:9-54`, ~45 lines) — design trace in renderer per memory `feedback_no_trace_comments` belongs in `model/learnings/NNNN-*.md`, not the renderer. Recommend migration.

**Wave context:** surfaced by Wave 3 spec-pruner on `foliar-strategy/operator` during the 5-entry mailbox wave 2026-05-24. Pruner kept these in place at cert ≤ 3 (live operator-visible UI without spec backing → leader/PO call, not pruner's).
**Suggested action:** slug-or-prune for the 4 unspec'd cards; rename for Spray A/B step; prune for hidden lettuce button; migrate for the trace comment block.
