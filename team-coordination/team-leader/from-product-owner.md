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


## 2026-05-16 — nutrition/tomato/app

**Change type:** added
**REQs affected:** REQ-163 (added)
**Summary:** Foliar Efficacité column becomes surfactant-aware. Toggling the surfactant lever in Block 5 re-renders the Efficacité column with new values; with surfactant on, foliar efficiency for routed elements is higher than without. Sibling to REQ-114 (Block 5 reactivity to spray count + surfactant). Note: the model side — making the foliar channel's `efficiency` capability map respond to a surfactant flag — is a specialist change, filed in parallel on `plant-nutrition-specialist/from-product-owner.md`.
**Suggested waves:** test-writer (REQ-163 matcher: assert that the foliar channel's exposed efficiency map differs between `surfactant: true` and `surfactant: false` for at least one routed element; reactive-render test that toggling the lever triggers a re-render of the Efficacité column) · coder (Block 5 surfactant-toggle handler must re-trigger foliar block render; foliar consumer must pass the current surfactant state when reading the channel's efficiency map — waits on specialist exposing a surfactant-aware efficiency surface) · pruner (no work this entry — the change is additive on top of REQ-157's capability-view efficiency contract).

