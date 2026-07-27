# 5 g @ day 25 (drought + heat) is the primary nursery anchor (2026-07-08)

> **Axis note (added 2026-07-26).** Every "d25" below is a **sowing** day
> (sowing = day 1) = **model day 21**. The 2026-07-08 text read it as a model
> day; see the correction section at the end.
>
> **Amended 2026-07-26 (same day, later).** The germination lag is gone: the
> model axis is sowing-only, day 1 = the sowing day, so **model day = sowing
> day**. Every "model day N" conversion below is superseded — read every day
> number as a sowing day. The stressed engine now returns **5.34 g** at day 25,
> *above* this biggest-plant datum; see `../derivation.md` § Validation.

## Decision

The 50-cell nursery weight scale is anchored to **5 g (biggest) at day 25**,
Décembre-weighed, under **drought + high heat**. This retires the former
16 g @ d28 and the unsourced 40 g @ d35 "anchors."

## Why the old anchors went

- **16 g @ d28** was salt-stalled *and* now contradicted: a real 50-cell tops
  at ~5 g @ d25, so 16 g @ d28 would need ~3× growth in 5 days. Not credible.
- **40 g @ d35 (9 in²)** was never in the calibration data — unsourced.

## The datum is stress-reduced, not clean

The tray was water-starved in high heat (and shows patchy heat mortality). So
5 g @ d25 anchors the **stressed** growth regime, not the clean optimum. Same
discipline as the salt anchor in [[senescence-crowding-only-loose-leaf]]: do
not bake a transient, avoidable stressor into the clean-condition default.

## How it reproduces (DLI held at 17)

Guillaume fixed the nursery-space DLI at **17** (rejecting a lower plug-DLI).
So the growth reduction is a **stress factor on ε**, not a DLI cut. At DLI 17
the model hits 5 g @ d25 with:

| Plug DM | stress ε | note |
|---|---|---|
| 0.045 | ε 0.68 (×0.62) | needs a heavier, un-documented stress |
| **0.07** | ε **0.85** (×0.76) | = the domain's existing pH/EC-stress ε, reused |

The 0.07 path reuses an already-documented constant and is physically right
for a droughted (dry) plug → preferred, but it reopens the #1 DM decision
(yield-range currently 0.045; that call rested on a "cap-dominated" premise the
5 g datum refutes — the plug tops at ~5 g, never near the 25 g cap).

## Consequences

- **Clean default unchanged** — base ε stays 1.1 (literature); a well-watered,
  cooler 50-cell runs larger. This 5 g is the stressed check, not the ceiling.
- **Plug never closes** at this growth → no crowding senescence *in the
  nursery*; the onset knob is a field-only concern.
- **25 g cap is never reached** in the nursery — likely too high (foliage
  density 82 kg/m³ ≈ solid tissue), but not binding, so low priority.

## Open

- Heat mortality (stand loss) is unmodeled — candidate to add or keep out of
  scope with "water + cooler nursery" as the operational fix.
- A clean (well-watered, cooler) 50-cell weighing would anchor the clean ε.


## 2026-07-25 — demoted from anchor to data point

Kept as a recorded datum; the model no longer fits it. Guillaume's call.

**Why it stopped being an anchor**

- **Basis mismatch** — the datum is the *biggest* plant; `predictYield` returns a
  *representative* plant. It was calibrating a mean against a maximum. This is
  the whole reason, and it is sufficient.

- **Its DLI was assumed, not measured** — 17 by decision. A separate July cohort
  measured **23.3 mol/m²/j** on the bench (pyranometer, no LED), which moved
  `NURSERY_DLI_CEILING_BY_WEEK` wk3+ from 17 to 25. A weaker provenance than the
  measured cohort, but not itself disqualifying.

**Correction (same day): it was NOT demoted for failing to fit.**

An earlier read here claimed the ceiling change lifted the d25 plug to ~7.6 g so
the 5 g could no longer land. That was an **axis error**. The source table
(`../doc/data-points.md`, cohort C) labels its day 25 as a
**sowing** day; with sowing = day 1 and a 3-day germination lag that is **model
day 21**, where the stressed engine returns **4.56 g** — a 9% fit, and closer
than before the ceiling moved. Comparing a sowing-axis datum at model day 25 is
what produced the false 7.6 g.

The same axis fix changes the cross-cohort comparison: the measured-light cohort's
9.2 g sits at model day 22, not day 23, so it is **one day older** than this
datum, not two days younger. A representative plant still beating a biggest
plant at a comparable age remains the substantive tension.

**What this leaves unanchored**

`NURSERY_STRESS_RUE = 0.85` existed only to reproduce this datum. Value kept,
justification withdrawn. Not retuned — `PLUG_DRY_MATTER_FRACTION = 0.07` is set
for a droughted plug, unmeasured, and the carbon balance on the 9.2 g cohort
only closes near 0.045–0.05. Refitting ε before drying a plug would move the
error around rather than remove it.

**Refinement trigger**

Weigh a representative plug fresh, dry at 60–70 °C to constant weight, weigh
again → replace 0.07 → then refit ε against the 9.2 g cohort.
