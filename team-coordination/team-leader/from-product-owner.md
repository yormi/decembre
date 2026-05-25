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

## 2026-05-24 23:30 — nutrition

**Change type:** added
**REQs affected:** predicted-ph-ce-shown-on-builder-blocks, predicted-ph-ce-clickable-modal, predicted-ph-ce-coloured-by-band-position
**Summary:** Three sibling slugs added to `nutrition/spec.md`: every nutrition builder block shows predicted tank pH + CE next to its inputs; clicking a number opens a modal explaining the measurement point (water at dripper / soil root zone / lab sample), blue-pen mapping, and safe band for current crop × stage; numbers coloured green inside band / red outside / yellow within 10 % of band width from either edge. CE safe-band data already in `chemistry — REQ-024`; pH safe-band data not yet specified (specialist sibling work routed in parallel).
**Suggested waves:** test-writer · coder · pruner

## 2026-05-24 23:00 — nutrition/tomato/foliar-strategy

**Change type:** added
**REQs affected:** strategy-contains-recipes, frequency-is-model-output, sprays-spread-across-farm-working-days
**Summary:** New subproject-level spec.md locks the strategy/recipe/spray vocabulary as enforceable rules (strategy contains many REQ-029-clean recipes; frequency = model output; sprays spread across `nutrition — farm-working-days`). Cross-refs the specialist's REQ-195/196/197/198 in `model/spec.md`.
**Suggested waves:** test-writer · pruner

## 2026-05-24 23:00 — nutrition/tomato/foliar-strategy/builder

**Change type:** edited, deleted
**REQs affected:** REQ-113 (deleted), REQ-114 (trimmed → slug `block-5-reactive-to-surfactant`), REQ-163 (held → slug `efficacite-reactive-to-surfactant`), new slug `surfactant-input`
**Summary:** Spray-count input retired (REQ-113); Block 5 now carries surfactant checkbox alone. Reactive-to-surfactant rule (REQ-114 trimmed, REQ-163 verbatim) migrated to slug headers.
**Suggested waves:** coder · test-writer · pruner

## 2026-05-24 23:00 — nutrition/tomato/foliar-strategy/procedure

**Change type:** added
**REQs affected:** weekly-calendar-derived-from-model, spread-evenly-no-stacking, one-recipe-per-spray, no-operator-day-override
**Summary:** New spec for the weekly spray-calendar surface generated from model output. Calendar lists per-day recipe assignment over farm working days; read-only on the operator side.
**Suggested waves:** test-writer · coder · pruner

## 2026-05-24 23:00 — nutrition/tomato/foliar-strategy/operator

**Change type:** added
**REQs affected:** recipe-sheet-per-recipe, weekly-calendar-rendered, no-frequency-input
**Summary:** New spec for operator-facing surface: per-recipe weighing block (products, predicted CE/pH, surfactant flag) + weekly calendar render. No frequency input on this surface.
**Suggested waves:** test-writer · coder · pruner

## 2026-05-24 23:00 — nutrition

**Change type:** added, edited
**REQs affected:** farm-working-days (new), REQ-062 (foliar paragraph rewritten)
**Summary:** New slug `farm-working-days` (Mon-Fri at Décembre, cross-crop scheduling input). REQ-062 foliar paragraph fixed (stale REQ-112 reference replaced with `frequency-is-model-output` cross-ref).
**Suggested waves:** test-writer · pruner

## 2026-05-24 23:00 — nutrition/tomato

**Change type:** edited
**REQs affected:** none (subproject-summary refresh, no normative claim touched)
**Summary:** foliar-strategy subproject summary refreshed for the post-rework shape (multi-recipe + model-picks-frequency framing); no REQ changed.
**Suggested waves:** none (informational; spec.md prose only)

