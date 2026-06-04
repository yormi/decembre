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

## 2026-06-03 — nutrition/tomato/fertigation-recipe (code-only, no spec change)

**Change type:** code refactor (no spec.md edit, no REQ)
**REQs affected:** none — data-key rename + render alignment.
**Summary:** `STORED_RECIPE.tomato.fertigation` carries its boron value under the key `borax`, but the product is now Solubore (boric acid), 11 g all stages. The render path already labels this key "Solubore" (`fertigation-recipe/operator/drift.js` maps `storedFert.borax` → 'Solubore'; `historique-nutriments/logic.js` OLIGO map has `borax: 'Bore'`). Rename the live key `borax` → `solubore` so the data name matches the product. Touch points: `nutrition/tomato/fertigation-recipe/procedure/stored.js`, `drift.js`, `historique-nutriments/logic.js`. Leave existing RECIPE_HISTORY snapshots verbatim (historical record — they legitimately carry `borax`). Keep `bash scripts/check-spec.sh` green (currently bash 12/0, node 146/1 — the 1 is the pre-existing Canna `ecocert-only-products` scan, unrelated).
**Suggested waves:** coder (+ test-writer if a behavior test should pin the key name)

