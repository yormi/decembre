# Frequency is a model output, days picked by the model

**Date:** 2026-05-24
**Status:** accepted

The previous shape had `sprayCount` (1-3) as an operator input
on Block 5 (retired this PR). With the strategy/recipe
hierarchy ([[strategy-recipe-hierarchy]]) Ca runs at 2×/wk,
oligo at 1×/wk — frequencies diverge per-recipe. Two shapes
considered.

## Considered

| Shape | Result |
|---|---|
| **A. Strategy-level single knob** ("how many sprays this week") | Doesn't fit — Ca and oligo cadences are independent. One knob conflates two recipes. |
| **B. Per-recipe operator inputs** (one sprayCount per recipe card) | Re-introduces an operator input we just retired in spirit. Same drift risk as legacy sprayCount: operator picks values that don't match plant rhythm, model reads green, tissue diverges. |
| **C. Frequency-as-model-output** — model picks per-recipe weekly count from gaps, recipe doses, leaf-tolerance cap | Operator has nothing to set; model recomputes when inputs change. Bank stays honest (no hidden cadence assumption). **Picked.** |

## Day assignment

Once the model decides counts per recipe, it spreads them across
the **farm working days** set (Mon-Fri at Décembre — defined in
`nutrition/spec.md — farm-working-days`). Spread is even; no
operator override on the procedure surface.

| Shape | Why not |
|---|---|
| Operator picks days | Same drift risk as B above; operator inputs that no operator should need to think about. |
| Model picks days, operator can override | Adds override state + audit for a problem nobody's reported. |
| **Model picks, no override** | Picked — operator can shift the farm-working-days set if reality changes (holidays, harvest weeks); calendar recomputes. |

## Why this changes the builder

The sprayCount input retires this PR. The builder trims to
surfactant-only re-render. Efficacité reactive to surfactant
holds verbatim.

The model contract gains a per-recipe weekly-count output;
specialist details in `model/spec.md`.

## Consequences

- Bank (Block 8) carries the model-computed foliar contribution
  honestly — no hidden cadence assumption to drift from.
- New input the spec must carry: the farm-working-days set
  (added to `nutrition/spec.md — farm-working-days`).
- Legacy `sprayCount` parameter on `computeFoliarSupply` /
  `computeFoliarRecipeForGap` kept as transitional back-compat
  in code; specialist decides whether the spec calls it out or
  drops it outright (model-layer call).
