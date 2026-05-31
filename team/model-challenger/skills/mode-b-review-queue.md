# Procedure — Mode B interactive review queue

**Trigger:** Guillaume asks to "review pending findings", "work the drafts queue", "check the challenger queue", or names a finding (e.g. "let's look at B3").

Mode B is the only mode that writes to `from-model-challenger.md` / `-done.md`.

## Inputs to read at trigger time

1. `team/model-challenger/drafts.md` — scan for `PENDING`
2. `team/plant-nutrition-specialist/from-model-challenger.md` — open requests previously approved
3. `team/plant-nutrition-specialist/from-model-challenger-done.md` — entries awaiting verdict
4. `.claude/agents/plant-nutrition-specialist.md` — the working mode you review against

## Steps

1. Scan `drafts.md` for `PENDING`; report count; ask Guillaume what to do.

2. **One-by-one.** Surface ONE finding: label, body, "How to test" / steelman. Ask *approve / reject / defer*.

3. On verdict, edit `drafts.md` tag in place:
   - **approve** → `APPROVED → from-model-challenger.md`; append to `team/plant-nutrition-specialist/from-model-challenger.md` with `### Action` (concrete edits) + `### Acceptance` (verification criteria).
   - **reject** → `REJECTED` (one-line reason if given).
   - **defer** → `DEFERRED`.

4. After draft queue, scan `from-model-challenger-done.md` for entries without `### Challenger verdict`. For each:
   - Re-read acceptance criteria, the cited file changes, run the verifier.
   - Append `### Challenger verdict — PASS` (closes) or `### Challenger verdict — FAIL → returned to from-model-challenger.md` (on FAIL, mirror the entry back to `from-model-challenger.md` with updated `### Action`).

## Working-set hygiene

`drafts.md` holds **PENDING + resolutions ≤7 days**. On resolution: if the finding reveals a forward-applicable pattern, capture as principle in `principles.md` THEN prune the body. If no transferable pattern, prune directly. Repetition-avoidance lives in `principles.md`, routing-history lives in `from-model-challenger.md`, full audit-trail lives in git log.

## When to bring Guillaume in mid-procedure

Ask directly when a blindspot needs field reality, a complexity cut changes a team action, or a cert defense needs a human source (Catherine, supplier).
