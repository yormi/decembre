# Procedure — multi-subproject triage fan-out

**Trigger:** work spans 4+ subprojects in one session — tree-wide hygiene sweep, model-wide reframe, post-batch cleanup, or Guillaume says "fan out" / "triage".

Overrides "one REQ per turn" at the orchestrator level. That rule still binds each Phase 1 deputy inside its own lane.

## When to fan-out vs single-turn

- **Fan-out**: 4+ subprojects in scope, tree-wide hygiene, post-batch sweep, cross-cutting reframe touching many subprojects.
- **Single-turn** (the default Working-mode rule, "one REQ per turn, then pause"): 1-2 REQ touches, focused challenger response, one fork to resolve.

## Phase 0 — Triage deputy (1 sub-agent, blocking)

Spawn ONE triage deputy. It does NOT execute work — it plans.

Triage reads: all inbox files in `team-coordination/plant-nutrition-specialist/` (`from-product-owner.md`, `from-model-challenger.md`, `from-team-leader.md` if exists), each affected subproject's `spec.md` / `derivation.md` / `learnings.md`, that subproject's code (read-only, for grounding), and any existing `todo/*.md` (resume mode after crash).

For each inbox entry, triage decides one of three:

- **DONE-in-spec already** (most stale entries) — cut to `from-*-done.md` with a `### Challenger verdict — PASS (auto-verified by triage YYYY-MM-DD)` or `### Specialist response` outcome block citing file:line evidence in current spec.
- **OUT-OF-SCOPE per P-06** (e.g. PO-153 editing `app/index.html` only) — cut to done with violation flag + `Out-of-scope — coder lane` note; surface to team-leader inbox for rerouting.
- **GENUINELY OPEN** — keep the original entry in the inbox until a Phase 1 deputy ships the work; route a synthesized task line into the subproject's todo file.

`from-product-owner.md` may be empty (header only); skip if so.

For each in-scope subproject, triage writes `team-coordination/plant-nutrition-specialist/todo/<subproject>.md` (creating the `todo/` dir as needed). Naming: `<crop>_<topic>.md` for nested (`tomato_plant-needs.md`); flat for top-level (`soil-contribution.md`, `yield-range.md`).

Each todo file leads with a custom Commander's intent — not a generic template, synthesized from the inbox items + the subproject's actual state:

```
## Commander's intent

PURPOSE
<one paragraph: where this subproject's spec needs to land after
this batch. Concrete — what state we're moving from → to.>

KEY TASKS
1. <verb-led, with file:section pointers and expected outcome>
2. ...

END STATE
- <concrete criterion — not "spec is solid", but specifics
  like "REQ-141 rationale rephrased so a cold reader sees the
  bank/sizer split without re-reading the path-1 rejection">

RULES OF ENGAGEMENT
- Lane: own spec.md / derivation.md / learnings.md / this todo file
- Forbidden (P-06): app/index.html, */app/page.html, */app/logic.js,
  dist/, calc.js, model.js, data.js, requirements.md
- Verifier scripts (scripts/check-recipes.mjs, check-requirements.sh):
  MAY edit if REQ changes
- REQ claims: `scripts/claim-req.sh <spec-path> plant-nutrition-specialist`
  (flock race-safe across parallel deputies)
- Changelog: one line per material change, no trimming
- Deviation from intent: only with explicit justification in report

## Items
- [ ] <item, source-tagged if from inbox: "(from challenger B4)">
```

Subproject with no inbox items still gets a todo file — the deputy will do gap-hunting + spec hygiene from a custom intent.

Triage returns inline: per-subproject one-paragraph mission + count, plus inbox sweep summary (N PASS-archived / N out-of-scope / N routed).

## Phase 1 — Parallel deputies (1 per subproject, single batch)

Dispatch all subproject deputies in one parallel batch (single tool-use message, multiple Agent calls). Each deputy reads:

1. Persona file + principles file (apply P-01 through P-08, especially P-06 lane discipline + P-08 never-poll-PA-Taillon).
2. Its `todo/<subproject>.md` (Commander's intent + items).
3. Own `spec.md` / `derivation.md` / `learnings.md` + ancestor `doc/CLAUDE.md` files + own code (read-only).
4. Recent `working files/changelog.md` (~20 entries).

Each deputy executes the intent with judgment. Item states are delete-inline by default:

- **Done in lane** — delete the line outright. Outcome lives in the spec edit + changelog entry + team-leader inbox entry; the todo file is workflow state, not an audit log.
- **Rejected** — delete the line; archive the rationale to `learnings.md` if non-obvious.
- **Deferred** — keep with `- [ ] [DEFERRED: <reason>] <item>`; orchestrator picks up next round.
- **Cross-cutting / out of lane** — keep with `- [ ] [CROSS-CUTTING: flagged inline in report] <item>`; orchestrator routes.

Sub-agent inline report: completed (with REQ refs) · deferred · what's still imprecise · cross-cutting flags · files written. The report is where completion is visible; the todo file just shows what remains open.

Sub-agents append team-leader inbox per spec mutation (following `procedures/notify-team-leader.md`) + one changelog line per material change (no trim — Phase 2 cleans up if count overshoots). REQ claims race-safe via `claim-req.sh`'s flock; changelog/team-leader-inbox appends are short enough that loss risk is acceptable.

## Phase 2 — Synthesis + cleanup

After all deputies return:

- Read each report; synthesize one "what needs precision to call each subproject's spec solid" digest for Guillaume.
- Delete fully-resolved todo files outright. Audit trail lives in changelog + team-leader inbox + git history — keeping done todos as archive duplicates signal. **No `todo/done/` sibling.**
- Todo files with only `[DEFERRED]` or `[CROSS-CUTTING]` lines remaining stay open; resume mode picks them up next round.
- Route cross-cutting concerns: team-leader inbox for coder cascades (page-level wiring, test pins, pruner sweeps), PO escalation for REQ-collision or PO-spec gaps.
- Trim changelog only if it overshot (sub-agents skipped trim by design).
