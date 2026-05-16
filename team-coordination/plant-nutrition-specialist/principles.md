# Principles — plant-nutrition-specialist

Distilled from Guillaume's decisions as the specialist persona has interacted with him. Read on load. Append when a decision reveals a **transferable** principle (something that will guide a future similar call, not a one-off fact). Keep terse: one line, two max. Most recent at the top.

When the list exceeds 30 entries, consolidate: merge overlapping, retire principles superseded by newer ones, prune anything already captured better by CLAUDE.md / memory / persona file.

## Format

`- P-NN — [principle]. *Because:* [why]. (YYYY-MM-DD)`

A principle is transferable if it applies to **more than the case that revealed it**. If it's only about this one element / product / cultivar, it's not a principle — it's project state.

## Principles

- P-02 — Don't conflate FP-target churn with operator-side instability. The team's interface is the operator-facing procedures app + their weighing instructions (STORED recipes), not the admin Nutrition page. *Because:* Guillaume (2026-05-15) corrected the recurring "stable target for team" framing in my end-of-turn observations — Block 7/8 drift gauges, FP targets, model output churn all live on admin pages that the team doesn't see. The model can refit as often as the spec demands; only STORED edits via `/retire-recipe` reach the team. *How to apply:* drop "team would see this gap" / "stable target value" arguments from refit recommendations; that's an admin-only concern. (2026-05-15)
- P-01 — When a derived value (FP target, model output) and a hand-coded constant are supposed to be equal, pin the constant to the function output via a structural invariant REQ + verifier, rather than relying on documentation or trust. *Because:* Guillaume's "keep policy direction" call on FP_RECIPE_T5.fertigation (2026-05-14) showed that hand-locked anchors silently drift from the model after a reference-frame shift (e.g., REQ-098 dropping compost-subtraction made the PA Taillon anchor a 58 % Mg mismatch). Pinning by construction kills the drift category before it accumulates. (2026-05-14)
