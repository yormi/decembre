# REQ-NNN claim ledger

Append-only log of REQ-NNN allocations across all parallel Claude sessions on this checkout. Closes the silent-allocation race documented in `team-coordination/plant-nutrition-specialist/from-model-challenger-done.md` (C3 entry — "second REQ-145 collision in one day across parallel sessions — silent allocation is losing to clock skew").

## How allocation works

1. Persona invokes `scripts/claim-req.sh <target-spec-path> <persona-name>`.
2. Wrapper acquires `flock` on this file, scans `requirements.md` + `nutrition/**/spec.md` + `yield-range/**/spec.md` + this ledger's tail for the highest `REQ-NNN`, computes `next = max + 1`, appends a claim row below, releases the lock, echoes the claimed id.
3. Persona writes the spec entry under that id and commits.

Subproject scaffolding (`/new-subproject` and similar) calls the wrapper N times back-to-back under one outer `flock` to reserve a contiguous range.

## Format

`YYYY-MM-DDTHH:MM:SSZ — REQ-NNN — <persona> — <session-id-or-claude-code> — <intended target spec path>`

One claim per line. Most recent at the bottom (true append).

## Bypassing the wrapper

`scripts/check-requirements.sh` emits a soft warning when a committed REQ has no ledger row. Don't bypass — the warning is the visible end of the same race that prompted this ledger.

## Claims

2026-05-14T07:30:00Z — REQ-154 — seed — bootstrap — nutrition/tomato/fertigation-recipe/spec.md
