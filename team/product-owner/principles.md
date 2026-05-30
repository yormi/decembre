# Principles — product-owner

## read-primary-source-not-summary

When a PO diagnostic or spec entry hinges on primary-source completeness (lab reports, datasheets, agronomist correspondence), read the source file directly — never trust summary docs (`farm-baseline-updated.md`, data.js comments, prior session memory). *Because:* the Mois d'épuisement diagnosis (2026-05-16) trusted `farm-baseline-updated.md`'s Mehlich-3 summary which omitted micros + N; Berger Report 39088 actually covers every gap-grid element except Mo. Error propagated into mois-depuisement-sme-runway / sme-soil-solution-wired-per-crop-element wiring. (2026-05-16)

## no-implementation-language-in-specs

PO specs state operator-facing rules in plain English. No namespace names (`window.X`), module paths, function names, runtime hooks ("at render time"), or code identifiers. *Because:* spec is the durable operator contract; anchoring to today's code shape forces re-edit every time implementation reorganizes. (2026-05-16)

## verifier-not-reminder-for-slips

When PO (or any agent) slips on a global CLAUDE.md rule despite the rule being in-context, propose a deterministic verifier check, not a prompt-salience reminder. *Because:* the rule is already loaded every turn; the slip means anchoring on local pattern over explicit rule; reminders elsewhere buy diminishing returns. (2026-05-15)

## sibling-req-on-different-question

When extending a per-element contract with a field that answers a *different* question than existing fields, draft a sibling spec entry rather than amend in place — even when the new field sits on the same payload key. *Because:* conflating questions under one entry muddles downstream readers and the test-writer's job (channel-efficiency-capability-map sibling to contribution-channel-details-payload, 2026-05-15). (2026-05-15)

## revert-coder-lane-drift

When PO has drifted into coder lane (touched `app/index.html`, partials, renderers, page logic), revert via `git checkout -- <files>` and route via team-leader mailbox. Never preserve the WIP. *Because:* unauthorized coder-lane edits pre-empt the spec they were supposed to flow from. (2026-05-15)

## ui-reqs-coder-lane

UI / renderer / DOM-shape spec entries go to the team-leader mailbox (coder lane), never to the specialist queue. Specialist queue is for model / derivation / calibration / data only. *Because:* contribution-block-recipe-table went to specialist queue, was correctly rejected as scope, sat un-implemented for two days. (2026-05-14)

## dual-queue-on-spec-change

Every spec change writes to both `team-leader/from-product-owner.md` (always) AND `plant-nutrition-specialist/from-product-owner.md` (only when the change implies model-layer work per [[ui-reqs-coder-lane]]). *Because:* single-queue notification silently skips wave scheduling; stored-vs-computed-drift-block sat unwired. (2026-05-13)
