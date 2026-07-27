# Seedling expolinear Rm ≈ 0.20 — day-10 open canopy refutes 0.30

Concerns `SEEDLING_RGR` in `yield-range/domain/seedling-thinning.js` (the merged
expolinear + cap seedling model, `yield-range/domain/domain.md`). This is the
**unthrottled** exponential rate in `dW/dt = min(Rm·W, ε·DLI·A)` — NOT the
logistic `RGR_MAXIMUM_LETTUCE_NURSERY = 0.30` in `data.js`, which is throttled
every step by `(1−W/cap)·f_light`. The two are different parameters; a
throttled 0.30 ≈ an unthrottled ~0.20.

## The question

Fitting the model to the stressed anchors (16 g @ d28 4 in², 40 g @ d35 9 in²
— `doc/yield-range-calibration-2026-spring.md`), both points sit in the
post-closure linear phase, which is governed by ε (the slope), not Rm. So the
grams alone leave Rm and ε degenerate. Guillaume's challenge: the anchors are
stressed, so a full destress should raise Rm — maybe to 0.30.

## What settled it

Two 50-cell nursery photos, 2026-07-04 (`doc/seedling-canopy-closure-2026-07-04/`):
day-10 trays show an **open canopy, ~25% cover**, bare substrate between 2–4-leaf
seedlings; the day-21 tray is only just closing.

Pre-closure coverage depends on Rm alone (exponential leaf-area buildup),
independent of ε — the one observation the grams-only anchors could not give.
Closure-day prediction for 50-cell (ε=0.85 stressed, W0=0.015):

> **Amendment 2026-07-26.** Superseded inputs: the day-1 mass is now
> `EMERGENCE_DRY_MASS_G = 0.013` (fitted) applied at an emergence day derived
> from thermal time (day 4.2 at 19.5 °C soil), the axis is days-from-sowing, and
> the engine's closure day is ~25.9 stressed at 50-cell. The Rm 0.30 refutation still stands — it turns on
> pre-closure coverage, which depends on Rm alone — but the day numbers below
> are pre-rebase. Do not read them as current.

- Rm = 0.30 → canopy closes ~**day 7.6** → would be closed by day 10. **Refuted.**
- Rm = 0.20 → closes ~**day 13** → open at day 10, closed by day 21. **Matches.**

The day-21 tray closing even a touch later than day 13 is consistent with these
being stressed trays (stress lowers Rm → later closure); clean closes marginally
sooner, so 0.20 is a fair-to-generous clean value.

Independently corroborated: the 2026-spring cohort back-fit `RGR ≈ 0.22`
(see [[back-calculated-rgr-max-from-cap-asymptote-target-rejected]]).

## Consequence

`SEEDLING_RGR = 0.20` held. Raising it toward 0.30 mostly inflates the d21/d28
columns and pulls closure earlier (breaking the "thin@7 ≡ thin@14" result); d35
stays cap-bound either way. Reads canopy *coverage*, not grams — a 3-plant
day-10 weigh would tighten it further but the open-vs-closed call already
resolves Rm on the low side.
