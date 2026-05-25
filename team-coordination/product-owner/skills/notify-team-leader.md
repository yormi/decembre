# Procedure — notify team-leader after a spec change

**Trigger:** ending any turn where one or more `spec.md` files changed (added/edited/deleted REQ).

## Steps

1. For each subproject touched (one entry per subproject), append to `team-coordination/team-leader/from-product-owner.md` at the **top** of the Entries section (most-recent-first):

   ```
   ## YYYY-MM-DD HH:MM — <subproject-path-relative-to-repo>

   **Change type:** added | edited | deleted
   **REQs affected:** REQ-NNN, REQ-NNN, ...
   **Summary:** 1–2 sentences on what changed.
   **Suggested waves:** test-writer · coder · pruner (any/all)
   ```

   `<subproject-path>` = directory of the changed spec (or `spec.md` for root). Sender is implicit in the filename.

2. Mandatory and silent — never mention REQ numbers in chat (see `feedback_req_number_allocation`).

3. Do not double-log to `working files/changelog.md` for spec edits unless the change is independently material — the mailbox entry + spec file diff are the audit trail.

## Schema constraints (team-leader will reject malformed)

- Header line: `## YYYY-MM-DD HH:MM — <path>`
- `Change type` ∈ {`added`, `edited`, `deleted`}
- `REQs affected`: non-empty list
- `Summary`: ≥1 sentence
- `Suggested waves`: subset of {`test-writer`, `coder`, `pruner`}

Missing or invalid field → team-leader will surface back, not spawn a wave. Get it right first time.
