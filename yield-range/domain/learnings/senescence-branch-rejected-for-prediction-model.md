# Senescence branch — rejected, then adopted (2026-07-04)

**SUPERSEDED 2026-07-04.** Senescence is now modeled, inside the unified
carbon-balance engine (`spec.md` senescence-past-closure). Guillaume decided
to include it so the labor-routine choice (2 / 3 / 4 weeks per bed) carries a
real yield tradeoff — a bed held past the head's peak must be able to lose
weight, else longer routines look free. Kept for the record of the reversal.

## Original stance (pre-2026-07-04, rejected)

Initial conversation around d28 → d35 mass loss (16 g → 10-12 g observed in
the spring cohort) considered a senescence multiplier. Rejected for the
then-logistic prediction model: the observed loss is dominated by bolting +
heat + root-cap saturation in the tomato zone, not the "best non-light
conditions" framing. Adding it was judged to collapse the model into a
calibration to one stressed condition. That framing (`best-non-light-conditions`)
was itself retired in the 2026-07-04 unification.

## What was adopted

Form chosen (of three considered):

1. **Time-past-closure decline** *(adopted)* — once the canopy has been closed
   `SENESCENCE_ONSET_DAYS`, net growth flips to `−SENESCENCE_DECLINE_RATE·W`.
   One onset + one rate; directly anchored by the 16 → 10 g nursery decline;
   maps "held too long → lose."
2. Pure carbon-balance plateau (gain − maintenance respiration) — rejected: the
   volume cap dominates the respiration plateau at Décembre's geometry, so the
   maintenance term added a constant with negligible effect (and no decline,
   only a plateau).
3. Rising stress multiplier (continuous, no threshold) — deferred: smoother but
   more params, none fittable without field data. A later upgrade.

Both onset and rate are **uncalibrated (cert 1)** — only the stressed-nursery
decline anchors them; field values run gentler. Refinement triggers in
`derivation.md`.
