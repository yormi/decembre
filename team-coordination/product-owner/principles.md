# Principles — product-owner

Distilled from Guillaume's decisions as the PO persona has interacted with him. Read on load. Append when a decision reveals a **transferable** principle (something that will guide a future similar call, not a one-off fact). Keep terse: one line, two max. Most recent at the top.

When the list exceeds 30 entries, consolidate: merge overlapping, retire principles superseded by newer ones, prune anything already captured better by CLAUDE.md / memory / persona file.

## Format

`- P-NN — [principle]. *Because:* [why]. (YYYY-MM-DD)`

A principle is transferable if it applies to **more than the case that revealed it**. If it's only about this one REQ or this one feature, it's not a principle — it's project state.

## Principles

- P-06 — REQ-NNN allocation goes through `scripts/claim-req.sh <target-spec-path> product-owner` (file-locked claim against `team-coordination/req-ledger.md`) — never a hand-grep of the spec tree. The wrapper is the only legitimate source of a new REQ id. Bypass shows up as "REQs un-ledgered" in `npm run check`'s informational tally; the count drifting up = new bypass. *Because:* hand-grep allocation collided twice in one day on 2026-05-12 across parallel sessions; the wrapper makes collision impossible-by-construction at the file boundary. (2026-05-14)
- ~~P-05~~ — *Retired 2026-05-14 — superseded by P-06.* (Was: interim "re-grep immediately before write" while the wrapper was being rolled out.)
- P-04 — UI / renderer / DOM-shape REQs are **coder lane, never specialist lane**. They go in the team-leader mailbox only — never `plant-nutrition-specialist/from-model-challenger.md`. The plant-nutrition-specialist's out-of-scope explicitly excludes `*/app/page.html`, `*/app/logic.js`, `app/index.html`, `dist/`. Use the specialist queue only when the spec change touches model/derivation/calibration/data — i.e. when the specialist would actually run a tissue panel correlation, refresh `derivation.md`, or change a `data.js` constant. *Because:* the contribution-block REQ-152 hand-off (PO-145, 2026-05-12) went to the specialist queue because it carried implementation detail; specialist correctly rejected it as scope, the work sat un-implemented for two days, and the team-leader mailbox got nothing. P-03 already says "specialist queue only when domain work is implied"; this tightens "implied" to mean "model layer specifically", since renderer work always feels implied by a DOM-shape REQ but isn't. (2026-05-14)
- P-03 — Every spec change (added / edited / deleted REQ) requires writing to **both** queues before ending the turn: `team-coordination/team-leader/from-product-owner.md` (always — schedules test-writer / coder / pruner waves) AND `team-coordination/plant-nutrition-specialist/from-model-challenger.md` (only when the change implies plant-nutrition-specialist domain work — see P-04 for what counts). Single-queue notification is the default failure mode and silently skips wave scheduling. *Because:* the team-leader auto-starts on idle mailbox, so an un-filed entry means nothing happens and the REQ stays unwired. Discovered when REQ-153 sat with only a specialist hand-off and Guillaume had to prompt for the team-leader mailbox file. (2026-05-13)
- P-02 — When a new spec supersedes part of an existing one, amend the old in place; never leave bullets/branches that "technically still hold." *Because:* vestigial content always drifts and erodes trust in the spec tree. (2026-05-12)
- P-01 — PO spec entries are statement-only: `## REQ-NNN — title` + one normative paragraph. No Rationale/Verification/Cert/Supersedes sub-sections. *Because:* verifier file IS the verification record; concision is operating mode. (2026-05-12)
