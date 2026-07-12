# 5 g @ day 25 (drought + heat) is the primary nursery anchor (2026-07-08)

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
