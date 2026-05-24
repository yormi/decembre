# Procedure — process mailbox + spawn waves

**Trigger:** Guillaume asks to "check the mailbox", "process the queue", "kick off a wave", or names a subproject to wave.

**No auto-listener.** As of the procedures refactor, team-leader does not auto-poll the mailbox every turn. Mailbox processing is on-demand only.

## Inputs to read at trigger time

1. `team-coordination/team-leader/from-product-owner.md`
2. `team-coordination/team-leader/from-plant-nutrition-specialist.md`

Treat the pair as one logical queue, sender tagged by filename.

3. Every `*/spec.md` (scan headings) — needed for subagent dispatch context.

## State machine

- `idle` — no wave in flight, last wave green and archived. Procedure may proceed.
- `wave-in-flight` — at least one subagent dispatched. Procedure suspends until subagents return.
- `awaiting-Guillaume` — confirmation gate fired or schema violation. Suspended until he answers.
- `awaiting-clean-tree` — Phase −1 found owned-dirty paths. Surface once, stay quiet.

## Steps

1. Re-read both mailbox files. Both empty → report "Mailbox empty, nothing to do." Stop.

2. Any entry → validate schema (below). Malformed → `awaiting-Guillaume`, surface which entry + which field is missing; do NOT spawn a wave.

3. Valid → Phase −2 (auto-commit owned dirt) → Phase −1 (verify clean owned surface) → spawn incremental wave → `wave-in-flight`. One sentence to Guillaume: "Mailbox: N subprojects pending → incremental wave started."

### Schema validation

Each mailbox entry MUST contain: a subproject-path header line (`## YYYY-MM-DD HH:MM — <path>`), `**Change type:**` (one of `added` / `edited` / `deleted`), `**REQs affected:**` (non-empty list), `**Summary:**` (≥1 sentence), `**Suggested waves:**` (subset of `test-writer` / `coder` / `pruner`).

Missing field → malformed. `Change type` not in the allowed set → malformed. `Suggested waves` containing an unknown wave → malformed.

Don't auto-repair. Don't infer missing fields from the Summary. Refusal is the rule because the senders (PO, specialist) wrote the schema; a missing field is a sender error worth surfacing back, not papering over.

### Incremental wave scoping

- Scope = mailbox-cited subprojects only (dedup across files). Skip full-tree discovery.
- Per-entry wave selection by `Change type`:
  - `added` → test-writer + coder
  - `edited` → test-writer + coder
  - `deleted` → pruner + test-writer (remove orphaned `test('REQ-NNN — …')`)
  - Multi-type → union
- Order within subproject: test-writer → coder → pruner. Parallel across subprojects.

Wave execution mechanics live in `procedures/run-wave.md` — this procedure dispatches to it.

### Archive / retain

Wave green (`npm test` + `npm run check`) for a subproject:
- Cut entry from `from-<sender>.md`, paste into `from-<sender>-done.md` with `### Team-leader outcome (YYYY-MM-DD)`: waves run · subagent counts · check status.

Wave red:
- Leave entry. Append `### Team-leader attempt (YYYY-MM-DD)` inside the block: attempted / failed / blocking.

### Loop guard

≥ 2 failed attempt notes on one entry → `awaiting-Guillaume`. He fixes spec, redirects, or overrides.

## Full-sweep mode

Whole-tree walk. Only when Guillaume explicitly asks. Skip mailbox scoping; run `find . -name spec.md ...` discovery.
