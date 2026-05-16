# Nutrition — Semis laitue (specs modèle / recette)

Semis laitue (lettuce nursery) nutrition specs: seedling tissue composition
(DW%, mineral concentration), cell volume cap by tray size, per-tray demand
calculations.

Cross-crop nutrition rules live in `nutrition/spec.md`. UI-side specs for
the Semis subpage live in `nutrition/nursery/app/spec.md`.

No nursery-specific specs are wired today (2026-05-09). The supporting
constants (`LETTUCE_NURSERY_TISSUE_DW`, `LETTUCE_NURSERY_DM_FRACTION`,
`NURSERY_DEFAULTS`, `calcLettuceNurseryDemand`) exist in `index.html` but
have no enforcement specs yet. Add specs here as the model matures.

Allocate new REQ-NNN via `scripts/claim-req.sh <spec-path> <persona>`.
