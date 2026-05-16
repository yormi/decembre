# team-leader ← product-owner

Spec-change notifications from the product-owner persona. Each entry names one subproject whose `spec.md` changed (REQs added, edited, or deleted) and signals to the team-leader that test / code / prune work is now pending there.

The team-leader reads this file at session start. When it processes an entry — by running the relevant wave(s) for that subproject — it cuts the entry from this file and appends it to `from-product-owner-done.md` with a one-line outcome.

## Format

Append at the top (most recent first):

```
## YYYY-MM-DD HH:MM — <subproject-path-relative-to-repo>

**Change type:** added | edited | deleted (one or more)
**REQs affected:** REQ-NNN, REQ-NNN, ...
**Summary:** 1–2 sentences on what changed in the spec.
**Suggested waves:** test-writer · coder · pruner (any/all — leader decides final scope)
```

`<subproject-path>` is the directory holding the changed `spec.md`, e.g. `nutrition/tomato/plant-needs` or `requirements.md` for the root cross-app file.

A single turn that touches multiple subprojects writes one entry per subproject.

## Entries

## 2026-05-15 15:42 — requirements.md

**Change type:** added
**REQs affected:** REQ-158 (added)
**Summary:** New cross-app spec: function names, variable names, and object-property names in JS source (`app/`, `nutrition/`, `yield-range/`) plus backticked identifier references in `spec.md` files and `team-coordination/**` markdown MUST be full words — no abbreviations. Verifier owns a denylist of common abbreviations with a domain-term whitelist (`cert`, `cap`, `pH`, unit suffixes `mg`/`kg`/`g`/`L`/`m²`, `REQ-NNN`). Motivated by the `eff` slip on REQ-157 earlier this session: the global no-abbreviation rule (user CLAUDE.md) is salience-bound and slips through into spec writes against codebase-pattern anchoring; only a deterministic gate closes the loop (PO principles P-09).
**Suggested waves:** test-writer (matcher in `scripts/check-recipes.mjs` for REQ-158 — grep JS source for function/variable/property declarations and backticked tokens in markdown, fail on denylist hits not in whitelist) · coder (wire the denylist + whitelist; pick initial denylist seed — suggested: `eff`, `idx`, `req`, `temp`, `calc`, `cfg`, `init`, `min`, `max`, `el`, `ph`, `cb`, `cnt`, `prev`, `curr`, `tmp`, `fn`, `obj`, `el`, `arr`, `str`, `num`, `val`, `res`, `err`, `msg`, `ctx`, `ref`, `idx`, `pos`, `len`, `sz`, `cur`, `nxt`, `prv` — seed list is a starting point, coder owns final shape; **grandfathering question** for Guillaume to call: existing `effectiveEff` / `let eff` / `idx` / etc. in `app/index.html` will fail the check on first run — three options: (a) refactor existing identifiers in a single sweep before enabling the check, (b) enable the check only on files newer than today's date, (c) enable globally but exempt a path list of legacy files until refactored; coder escalates the call before flipping the switch) · pruner (no work this entry — the denylist itself is the prune mechanism going forward).

