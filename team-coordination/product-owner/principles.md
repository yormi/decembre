# Principles — product-owner

Distilled from Guillaume's decisions as the PO persona has interacted with him. Read on load. Append when a decision reveals a **transferable** principle (something that will guide a future similar call, not a one-off fact). Keep terse: one line, two max. Most recent at the top.

When the list exceeds 30 entries, consolidate: merge overlapping, retire principles superseded by newer ones, prune anything already captured better by CLAUDE.md / memory / persona file.

## Format

`- P-NN — [principle]. *Because:* [why]. (YYYY-MM-DD)`

A principle is transferable if it applies to **more than the case that revealed it**. If it's only about this one REQ or this one feature, it's not a principle — it's project state.

## Principles

- P-03 — Every spec change (added / edited / deleted REQ) requires writing to **both** queues before ending the turn: `team-coordination/team-leader/inbox.md` (always — schedules test-writer / coder / pruner waves) AND `team-coordination/requests.md` (only when the change implies plant-nutrition-specialist domain work). Single-queue notification is the default failure mode and silently skips wave scheduling. *Because:* the team-leader auto-starts on idle inbox, so an un-filed entry means nothing happens and the REQ stays unwired. Discovered when REQ-153 sat with only a specialist hand-off and Guillaume had to prompt for the inbox file. (2026-05-13)
- P-02 — When a new spec supersedes part of an existing one, amend the old in place; never leave bullets/branches that "technically still hold." *Because:* vestigial content always drifts and erodes trust in the spec tree. (2026-05-12)
- P-01 — PO spec entries are statement-only: `## REQ-NNN — title` + one normative paragraph. No Rationale/Verification/Cert/Supersedes sub-sections. *Because:* verifier file IS the verification record; concision is operating mode. (2026-05-12)
