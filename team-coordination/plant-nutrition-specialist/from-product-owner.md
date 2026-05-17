# plant-nutrition-specialist ← product-owner

Spec-change notifications from the product-owner persona when the change implies plant-nutrition-specialist domain work (model layer, derivation, calibration, data — per principles P-03 + P-04 in `team-coordination/product-owner/principles.md`). UI / renderer / DOM-shape REQs are coder lane and go to the team-leader queue only, never here.

The specialist reads this file at session start. When it processes an entry — by amending the relevant `*/spec.md`, `derivation.md`, `data.js`, or model module — it cuts the entry from this file and appends it to `from-product-owner-done.md` with a one-line outcome.

## Format

Append at the top (most recent first):

```
## YYYY-MM-DD HH:MM — <subproject-path-relative-to-repo>

**Change type:** added | edited | deleted (one or more)
**REQs affected:** REQ-NNN, REQ-NNN, ...
**Summary:** 1–2 sentences on what changed in the PO spec and what model-side work it implies.
**Specialist scope:** specific model-layer files / functions / data sources the specialist should touch.
```

`<subproject-path>` is the directory of the model module the change affects (e.g. `nutrition/tomato/foliar-recipe`, `nutrition/soil-contribution`).

A single turn that touches multiple model subprojects writes one entry per subproject.

## Entries

