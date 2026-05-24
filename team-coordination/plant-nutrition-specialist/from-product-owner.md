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

## 2026-05-23 17:37 — nutrition/tomato/fertigation-recipe

**Change type:** added (page-level spec)
**REQs affected:** REQ-183 (stored-recipe-is-sole-source) implies model-side cleanup
**Summary:** New `nutrition/tomato/fertigation-recipe/app/spec.md` asserts the page applies no runtime adjustment factor on top of stored values. The current `getMultK()` / `getMultMg()` multiplier mechanism (`app/index.html`, applied at render time in `nutrition/tomato/fertigation-recipe/app/logic.js`) needs to retire — any K or Mg tuning between `/retire-recipe` cycles should flow through STORED, not a runtime knob. Additionally: `nutrition/tomato/fertigation-recipe/app/page.html` currently mixes tomato + lettuce + seedling-lettuce fertigation flows under a single crop toggle; per REQ-181 the lettuce and seedling flows carve out into sibling subprojects (`nutrition/lettuce/fertigation-recipe/` and `nutrition/nursery/fertigation-recipe/`). Flagging for specialist awareness — implementation is coder lane, but the multiplier retirement may touch model-layer assumptions.
**Specialist scope:** confirm multiplier retirement does not break any model-side consumer (search for `getMultK` / `getMultMg` outside the page render path); confirm tomato-only narrowing of `nutrition/tomato/fertigation-recipe/` model files (`calc.js`, `data.js`, `model.js`, `derivation.md`) remains consistent (subproject was already tomato-only; only the page mixed crops).

