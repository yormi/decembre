# team-leader ← plant-nutrition-specialist

Spec-change notifications from the plant-nutrition-specialist persona. Each entry names one subproject whose `spec.md` changed (REQs added, edited, or deleted) and signals to the team-leader that test / code / prune work is now pending there.

The team-leader reads this file at session start. When it processes an entry — by running the relevant wave(s) for that subproject — it cuts the entry from this file and appends it to `from-plant-nutrition-specialist-done.md` with a one-line outcome.

## Format

Append at the top (most recent first):

```
## YYYY-MM-DD HH:MM — <subproject-path-relative-to-repo>

**Change type:** added | edited | deleted (one or more)
**REQs affected:** REQ-NNN, REQ-NNN, ...
**Summary:** 1–2 sentences on what changed in the spec.
**Suggested waves:** test-writer · coder · pruner (any/all — leader decides final scope)
```

`<subproject-path>` is the directory holding the changed `spec.md`, e.g. `nutrition/tomato/fertigation-recipe`.

A single turn that touches multiple subprojects writes one entry per subproject.

## Entries

## 2026-05-16 — nutrition/tomato/foliar-recipe

**Change type:** edited
**REQs affected:** REQ-103 (namespace table extended)
**Summary:** Per the PO-157 extension, `window.FoliarRecipeTomato` now exposes `efficiency` alongside `AREA_M2` + coverage constants + `computeFoliarSupply`. New `FOLIAR_EFFICIENCY_AT_CURRENT_CONDITIONS` constant in `data.js` (Mn / Zn / Cu / Fe / Mo all at 0.27 = `FOLIAR_COVERAGE_DEFAULT × foliarPhResponse(5.0)` = 0.30 × 0.9). B absent — single-channel by REQ-061 (fertigation owns B). Cert 3 (coverage cert 3 dominates the chain). New "Channel efficiency map (REQ-157)" section in `derivation.md` with refinement triggers including the yucca-return flip (0.27 → 0.72) and the Sentís downward path (0.27 → 0.027). Verifier extended.
**Suggested waves:** test-writer (no `spec.test.mjs` change needed — verifier covers it); coder (integrator-side `supply.foliar.efficiency` inline derivation can now read the namespace); pruner (no work).

### Team-leader attempt (2026-05-16)
Sub-wave C coder attempted the namespace-read substitution `supply.foliar.efficiency = window.FoliarRecipeTomato.efficiency` — and reverted it. **Failure mode**: namespace constant `FOLIAR_EFFICIENCY_AT_CURRENT_CONDITIONS` declares Mo as a routed micro (efficiency 0.27), but the live integrator path `computeFoliarRecipeForGap` produces `NaMolybdate_g = 0` at FP T5 (Mo demand met upstream by sidedress + foliar lower stages → no Mo dose at T5 specifically). REQ-157 verifier asserts `efficiency[el]` MUST be ABSENT when `supply.foliar[el] = 0` (non-routed) — namespace's static "Mo: 0.27" key + integrator's `supply.foliar.Mo = 0` violates the invariant. Reverted to the original conditional-key inline derivation; verifier stayed green throughout. **Spec/data-shape mismatch surfaced** — three resolution paths: (a) namespace drops Mo from the static map; (b) integrator filters namespace keys by per-call routed-mg membership (`supply.foliar.efficiency = Object.fromEntries(Object.entries(window.FoliarRecipeTomato.efficiency).filter(([el]) => supply.foliar[el] > 0))` — defensive pattern, would also fix the analogous fertigation-B risk in STORED mode); (c) verifier loosens the `mg=0 → no key` invariant. **Specialist call** (or PO if it's a contract decision). The fertigation + sidedress sub-wave C substitutions were applied successfully and archived to `from-plant-nutrition-specialist-done.md`; this foliar entry remains here pending the resolution call.
