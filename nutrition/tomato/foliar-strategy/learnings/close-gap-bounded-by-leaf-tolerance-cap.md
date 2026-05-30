# Optimization: close per-element gap, bounded per-recipe by leaf-tolerance cap

**Date:** 2026-05-24
**Status:** accepted

With frequency as model output ([[frequency-as-model-output]]),
"optimal" needed a definition. The grill considered four
criteria.

## Considered

| Criterion | Result for Ca (gap 315 mg/m²/wk) |
|---|---|
| **1. Close gap fully, bounded by leaf-tolerance cap** | 2-3 sprays/wk Ca (until cuticle damage budget hit). **Picked.** |
| 2. Close gap to a target fraction (e.g. 80 %) | Requires per-element targets the spec doesn't have today; "80 %" is arbitrary. |
| 3. Minimum operator load that moves tissue | Throws away the model's ability to *recommend* a cadence — defeats the point. |
| 4. Maximum efficacité subject to operator-load cap (joint across recipes) | Adds a cross-recipe cap with no current grounding. Operator load is real but Décembre is small-team and spray itself is cheap (sanitation + humidity are the real load levers per the disease appendix). Joint optimization adds complexity for a problem nobody's surfaced yet. |

## Per-recipe independence

Each recipe is optimized independently. No joint cap across
recipes. If the future surfaces operator-load pressure, criterion
4 is the next stop — for now criterion 1 is simpler and matches
field reality.

## What bounds the count

The **weekly leaf-tolerance cap** per recipe (defined in
`nutrition/tomato/foliar-strategy/CONTEXT.md`) — cumulative
cuticle damage / burn risk on sprays/week. For Ca recipe the
cap = 3 (per Path C anchor in the historical foliar derivation).
For oligo recipe the cap = whatever the existing STORED cadence
implies (Wednesday-only = 1).

The leaf-tolerance cap is **distinct from foliar-ce-under-burn-cap** (in-tank EC
limit, which bounds *dose per tank*, not sprays per week). Both
constraints fire; specialist's model/spec.md carries the formal
contract.

## Why this is honest

The model returns `min(sprays-to-close-gap, leaf-tolerance-cap)`
per recipe. When the cap binds (Ca at 3 sprays/wk against a gap
that wants 5.6), the spec captures *why* the model recommends 3
not 6. Operator sees the recommendation and the cap; can ramp
beyond at their own discretion via tissue feedback, but the
default is the modelled optimum.

## Consequences

- Per-recipe leaf-tolerance cap becomes spec data the model
  reads (specialist's `model/spec.md`).
- Bank (Block 8) reflects the bounded contribution, not the
  uncapped what-if.
- Sibling [[frequency-as-model-output]] for the day-spread
  rule once counts are picked.
