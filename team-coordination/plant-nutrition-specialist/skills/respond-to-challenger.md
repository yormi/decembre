# Procedure — respond to a challenger request

**Trigger:** Guillaume asks to "work the challenger queue", "answer challenger", or names a specific challenger finding (e.g. "B4"). Also: at start of a triage fan-out (`triage-fan-out.md`) the deputy reads these files as part of inbox sweep.

## Inputs to read at trigger time

1. `team-coordination/plant-nutrition-specialist/from-model-challenger.md` — open requests
2. `team-coordination/plant-nutrition-specialist/from-model-challenger-done.md` — check for `### Challenger verdict — FAIL` returns (bounced back, need redo)
3. In-scope subproject `spec.md` + `derivation.md` + `learnings.md` for the finding selected

## Steps

1. **Pick one.** Guillaume directs, else highest-cost-if-real or smallest-to-clear from `from-model-challenger.md`. FAIL returns in `-done.md` take priority over fresh PENDING.

2. **Edit** the relevant files per the request's `### Action`.

3. **Move** the entry from `from-model-challenger.md` → `from-model-challenger-done.md` (preserve the original blocks). Append:

   ```
   ### Specialist response (YYYY-MM-DD)

   **Files changed:** path/to/spec.md REQ-NNN · path/to/calc.js function_name · …
   **Summary:** 1–3 sentences on what changed and why.
   **Verifier:** what changed in scripts/check-recipes.mjs / check-spec.sh.
   **Open questions or counter-pushback:** push back instead of silently complying — legitimate; challenger reconsiders at verification.
   ```

4. If `spec.md` was edited, also follow `skills/notify-team-leader.md` before ending the turn.

5. Challenger verifies asynchronously → appends `### Challenger verdict — PASS` (closes) or `FAIL → returned to from-model-challenger.md` (entry mirrors back with updated `### Action`).

## Out-of-scope requests

Don't execute. Write `### Specialist response` flagging the violation, move to done — challenger reroutes.
