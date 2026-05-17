# team-leader ← plant-nutrition-specialist

Spec-change notifications from the plant-nutrition-specialist persona. Each entry names one subproject whose `spec.md` changed (REQs added, edited, or deleted) and signals to the team-leader that test / code / prune work is now pending there.

The team-leader reads this file at session start. When it processes an entry — by running the relevant wave(s) for that subproject — it cuts the entry from this file and appends it to `from-plant-nutrition-specialist-done.md` with a one-line outcome.

## Format

Append at the top (most recent first):

```
## YYYY-MM-DD HH:MM — <subproject-path-relative-to-repo>

**Change type:** added | edited | deleted (one or more)
**REQs affected:** REQ-NNN, REQ-NNN, ...
**Summary:** 1–2 sentences on what changed in the spec.
**Suggested waves:** test-writer · coder · pruner (any/all — leader decides final scope)
```

`<subproject-path>` is the directory holding the changed `spec.md`, e.g. `nutrition/tomato/fertigation-recipe`.

A single turn that touches multiple subprojects writes one entry per subproject.

## Entries

_(Inbox empty. 2026-05-17 entries archived after sub-wave I: REQ-062 retirement follow-up (I.A), soil-contribution REQ-141/142/145 routing (I.B), foliar-recipe REQ-115 cap pin (I.C), fertigation-recipe inherited-specs note (no action needed — verifier expectations unchanged), nutrition/spec.md PO-action note (superseded by REQ-062 retirement follow-up). Plus team-leader-initiated I.D test-helper refactor + I.E SME convention dedup, both shipped. Prior 2026-05-16 entries — STORED-vs-anchor + soil-contribution REQ-162 follow-up (H), foliar-recipe (G), lettuce/plant-needs + soil-contribution (F), Mo-move (E) — also archived.)_
