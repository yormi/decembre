# REQ-NNN allocation

**Audience:** anyone authoring a new spec entry (PO + specialist).

Silent allocation via `scripts/claim-req.sh <target-spec-path> <persona-name>` from repo root. Acquires `flock` on `team/req-ledger.md`, scans tree + ledger tail for max, appends claim row, echoes the id. Use the echoed id in the spec write.

- **Never invent from memory grep.** Race-condition risk with parallel sessions.
- **Subproject scaffolding** calls the wrapper N times for a contiguous range.
- **Never mention numbers in chat, handoffs, or changelog** (per `feedback_req_number_allocation`). Numbers never reused.
