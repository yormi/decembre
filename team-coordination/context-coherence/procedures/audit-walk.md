# Procedure — coherence audit walk

**Trigger:** Guillaume asks to "walk the tree", "audit coherence", "sweep drift", or names a slice to walk.

## Inputs to read at trigger time

1. `requirements.md` (cross-app REQs — for layer-drift checks).
2. Full spec tree (`find . -name spec.md ...`) — skim headings, full-read on walk scope.
3. `working files/changelog.md` (full file, not 25-line slice).
4. `MEMORY.md` + scan `memory/*.md`.
5. `.claude/agents/*.md` (know what each persona owns → know where to route).
6. `working files/coherence-audit.md` if present (resume mode).

## Three lenses, in order

### 1. Cross-reference rot

For each pointer in the graph (REQ-NNN mentions, file paths, symbols, persona refs, memory entries, changelog claims), check the referent still exists and means what the pointer thinks.

Probe: retired REQs cited as live; moved/renamed files; renamed constants/symbols; changelog claims contradicting current grep; `dist/index.html` diverging from `app/index.html` + partials.

### 2. Single-responsibility violations

For each file, ask: **what reasons does this file change for?** > 1 → propose split.

Defaults: `spec.md` should be normative claims only (derivation prose → `derivation.md`); `derivation.md` is "why this number" (not DOM/process notes); root `CLAUDE.md` is farm + spec discipline (directory indices have "reach for this when"); persona files describe working mode + scope (not domain content); memory files = one type each; subprojects don't reach across siblings; `app/index.html` is the integrator (non-generic renderers belong in subprojects per `feedback_req_number_allocation`).

### 3. Layer drift

Layers: cross-app REQ → domain REQ → subproject REQ → derivation → data → calc → model → app. Lower answers to higher, never reverse.

Probe: PO REQs prescribing HOW (mechanism belongs in derivation); derivations supporting un-REQ'd behavior (delete or push up a new REQ via PO); code asserting facts no REQ states; `CLAUDE.md` rules that should be auto-enforceable specs; memory entries contradicting current code.

## Finding format

```
### F<N> — <one-line title>

**Where:** <path:line or path/dir>
**Lens:** [Cross-ref rot | SRP | Layer drift]
**Drift:** <one sentence>
**Why one-too-many responsibilities** (SRP only): <the two reasons this file changes>
**Severity:** [blocking | important | minor]
  - blocking = wrong action, cert violation, broken verifier, rotted load-bearing pointer
  - important = misleads reader / future Claude; compounds if ignored
  - minor = cleanup, low blast radius
**Proposed move:** <concrete restructure — extract to X, retire REQ-N, update memory M, delete dead ref R>
**Owner of the fix:** [self (mechanical) | product-owner | plant-nutrition-specialist | model-challenger | code agent | Guillaume]
**Cert:** 0–5 on the *drift claim itself*
```

Cert ≤ 2 → recommend verification with owner before acting.

## Walks vs drills

- **Walk mode** — sweep a slice end-to-end, numbered findings, end with triage (top 3, route the rest, defer). Default at trigger time.
- **Drill mode** — Guillaume picks one finding; confirm cert, propose exact restructure, route.

## When to edit directly vs propose

Direct (state in turn, do it, changelog line):
- Directory `CLAUDE.md` index entry pointing at moved/deleted file.
- `MEMORY.md` line or memory body referencing renamed/deleted target.
- Factual typo in *past* changelog entry (correction only, never rewrite).

Everything else: propose, wait, route.

> **F4 proposed restructure** — move REQ-072 from `yield-range/spec.md` to `yield-range/app/spec.md` (page-level, not domain). Side effects: update verifier pattern, add cross-ref. Confirm and I'll execute; PO session re-reads both after.

## Triage end of walk

> **Top to address now:** F<X>, F<Y>, F<Z> — one line each.
> **Route the rest:** [list] → PO / specialist / challenger / code.
> **Defer:** [list] — minor, safe to log.

## Changelog hygiene

Append `YYYY-MM-DD HH:MM — short description` to `working files/changelog.md` when you make material changes (index edits, memory updates, executed restructures). Walks producing only findings don't log — findings are working state.

## `app/index.html` reminder

5829 lines (~75k tokens). Never full-Read it — `grep -n` to locate sections, then Read with `offset`+`limit`. Walking the integrator with full Reads is the main driver of >200k-token sessions.
