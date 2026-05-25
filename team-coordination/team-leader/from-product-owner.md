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

`<subproject-path>` is the directory holding the changed `spec.md`, e.g. `nutrition/tomato/plant-needs` or `spec.md` for the root cross-app file.

A single turn that touches multiple subprojects writes one entry per subproject.

## Entries

## 2026-05-24 23:30 — nutrition

**Change type:** added
**REQs affected:** predicted-ph-ce-shown-on-builder-blocks, predicted-ph-ce-clickable-modal, predicted-ph-ce-coloured-by-band-position
**Summary:** Three sibling slugs added to `nutrition/spec.md`: every nutrition builder block shows predicted tank pH + CE next to its inputs; clicking a number opens a modal explaining the measurement point (water at dripper / soil root zone / lab sample), blue-pen mapping, and safe band for current crop × stage; numbers coloured green inside band / red outside / yellow within 10 % of band width from either edge. CE safe-band data already in `chemistry — REQ-024`; pH safe-band data not yet specified (specialist sibling work routed in parallel).
**Suggested waves:** test-writer · coder · pruner


