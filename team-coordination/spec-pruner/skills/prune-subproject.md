# Procedure — prune one subproject

**Trigger:** Guillaume names a subproject to prune (e.g. "prune `nutrition/tomato/fertigation-recipe/`"). One session = one subproject.

## Inputs to read at trigger time

1. That subproject's `spec.md`
2. Sibling `derivation.md` + `learnings.md`
3. `calc.js`, `model.js`, `data.js` in scope
4. `*/app/` partial if present
5. `spec.md` (full) — for cross-app REQ traceability

## Per-subproject phases

**Phase −1 — Clean tree.** `git status`. Dirty → refuse, ask Guillaume to commit/stash. Every prune session starts clean so it reverts with `git reset --hard HEAD`. Never bypass.

**Phase 0 — Inventory.** Read subproject's `spec.md`, list every REQ-NNN owned. Read `derivation.md`, `learnings.md`, `calc.js`, `model.js`, `data.js`, any `*/app/` partial. List files + line counts.

**Phase 1 — REQ → code map.** Per REQ, identify which functions / constants / render blocks / derivation sections implement it. Surface gaps both ways:
- REQ with no implementation → escalate to specialist.
- Implementation with no REQ → your candidates.

**Phase 2 — Walk file-by-file, surface candidates.** Numbered list. Don't delete yet.

**Phase 3 — Apply confirmed.** Edit only what Guillaume CONFIRMed. Skip KEEP / NEED_MORE_INFO.

**Phase 4 — Verify.** `npm run check`. Failed → report which check broke + which deletion caused it. Offer revert.

**Phase 5 — Changelog + handoff.** Append `YYYY-MM-DD HH:MM — short description` to `working files/changelog.md`. Ask which subproject is next.

## Candidate format

```
### C1 — <file>:<line-range>

**What it does:** [one sentence]
**Traces to REQ:** none in `<subproject>/spec.md` or `spec.md`. [or: "supports REQ-NNN" — not a candidate]
**Used by:** [call sites with file:line, or "no caller found" — show the grep used]
**Cascade if removed:** [observable behavior change]
**My read:** [REMOVE / BORDERLINE / KEEP, surfaced for review]

[CONFIRM / KEEP / NEED_MORE_INFO]
```

Default toward KEEP at cert ≤ 3. Cost of an extra constant ≪ cost of breaking a passing verifier.

## What you prune

### Operator-facing UI — aggressive

`*/app/page.html`, `*/app/logic.js`, page partials. Per `feedback_no_unspecced_narrative.md`:

- Intro paragraphs, "hypothèses" bullets, framing copy, non-auto-derived advice strings.
- `// stable —` / `data-prose-source="stable:..."` escape hatches.
- Render branches not traceable to a REQ.
- Helper text explaining calculation rather than the team action.

Cutting rule (CLAUDE.md): operator-facing content excludes anything not a dynamic input or not useful to know what action to take.

### `calc.js`, `model.js`, `data.js`

- Dead functions (no caller anywhere).
- Unused constants.
- Branches for scenarios no REQ requires (crops, stages, products not in spec).
- Old calibration left next to current without REQ tie.
- **Trace comments.** Per CLAUDE.md (2026-05-12): trace lives in `<subproject>/derivation.md` + `learnings.md`. Move first if info isn't already there, then delete from code.

**Keep:** spec-mandated invariants (`// REQ-082` pointers), minimum local context (single-line unit annotations are fine; multi-line derivation isn't).

### `derivation.md`

Move first to `<subproject>/learnings.md` (create if missing), then delete:
- Defenses against rejected alternatives no current REQ requires.
- Rationale for behavior no current REQ requires.
- Citations for superseded values.

**Never just nuke.** Rejected-alternative reasoning is load-bearing for organic-cert audits and re-evaluation when new data arrives.

**Keep:** why-this-number for every constant a current REQ depends on.

### Never touch (during pruning)

- `spec.md` — PO + specialist own those.
- `STORED_RECIPE.tomato.fertigation` / `.sidedress` / `.foliaire` — `/retire-recipe` only.
- `RECIPE_HISTORY` — audit trail.
- Cross-app infrastructure for `spec.md` REQs (REQ-005 page registry, `CROP_PAGES`, `setPage`, `syncHash`).
- `working files/` — not production.
- `data.js` calibration values that look unused — verify across the whole spec tree first.

## Spec gaps

> **Spec gap surfaced:** `calc.js:88-104` implements Ca↔Mg antagonism but no REQ mentions it. Spec missing a REQ, or code should go. Hand to PO/specialist; do not decide.

Surface, don't fix.

## STORED-recipe drift

> **Stored-recipe item surfaced:** STORED_RECIPE.tomato.fertigation includes X at Y g/L, no REQ requires it. **Not my call** — `/retire-recipe`. Flagging for awareness.
