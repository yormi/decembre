# Age-stepped usable-DLI ceiling in the nursery (2026-07-11)

## Decision

The growth engine now drives on `min(DLI_TARGET, nurseryLightCeiling(day))`
instead of a flat `DLI_TARGET = 17`. The ceiling steps by plug age:

| plug age | usable DLI | why |
|---|---|---|
| wk1 — cotyledon | 10 | fragile; tipburn/scorch above ~10–12 |
| wk2 — true-leaf | 14 | leaves hardening, band 12–14 |
| wk3+ — plug/field | 17 | tolerates the production optimum |

Values are the tops of the `light/domain.md` setpoint bands (8–10 / 12–14 /
~17). Applied by days-from-germination, so field ages (≥ wk3) sit at 17 and
the ceiling only bites in the early nursery.

## Why (the #3 fix)

The engine's gain is linear in DLI with no saturation, and it held DLI at 17
every day. But young tissue **can't use 17** — cotyledons saturate near 10 and
tipburn above it. So the flat-17 model over-lit weeks 1–2 and over-predicted
early growth: it credited carbon to light the plug physically cannot convert.

Light past the stage ceiling buys **no growth** (photosynthesis plateaus) and
only stresses the tissue — so the correct model caps usable DLI at the age
ceiling, regardless of what is delivered.

## The SLA coupling (why it didn't break the anchor)

`SPECIFIC_LEAF_AREA` is back-solved to make the small-LAI growth rate exactly
`GROWTH_RGR` (the day-10 open-canopy anchor). Day 10 is **week 2**, whose
usable DLI is the ceiling **14**, not 17. So SLA is now derived at 14:

`SLA = GROWTH_RGR / (RUE · NURSERY_DLI_CEILING_BY_WEEK[1] · k)` ≈ 0.019
(was 0.015 at 17).

Deriving at 14 keeps the day-10 rate at `GROWTH_RGR` and **preserves the
stressed anchor**: the model still reproduces 5 g (biggest) @ d25 for a
drought+heat 50-cell (4.9 g). Without the re-anchor the ceiling would have
dropped the day-10 rate to 0.20·14/17 ≈ 0.165 and violated the anchor.

## Effect

- Early nursery growth is slower and physiologically honest; a clean 50-cell
  no-thin now reaches ~16 g by d35 (was racing to the 25 g cap on light it
  couldn't use).
- Thin-timing ordering unchanged (earlier thin still bigger).
- Field unaffected (age ≥ wk3 → 17).

## Cert / refinement

Ceiling steps are **cert 2** — band-tops from the light domain, not a Décembre
light-response measurement. Refinement trigger: a **staged-DLI nursery cohort**
weighed weekly (or any cohort grown at a known sub-17 nursery DLI) → fit the
real per-stage ceiling and free SLA.

## Rejected

- **Keep flat 17, ignore the ceiling** — that is the #3 bug (over-lights the
  cotyledon weeks).
- **Add the ceiling but leave SLA derived at 17** — breaks the day-10 anchor
  (day-10 rate drops to ~0.165).
- **Smooth ramp instead of weekly steps** — more parameters, none fittable
  without staged-DLI data; the light domain describes bands, not a curve.
- **Model tipburn damage above the ceiling** — deferred; delivered DLI is
  assumed at the target, never above, so acute photoinhibition never triggers
  in the engine. It belongs with the marketable-yield ceiling, not growth.
