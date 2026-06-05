# Rejected: back-calculated RGR_max from cap-asymptote target

Pre-2026-05-17 `RGR_MAXIMUM_LETTUCE_NURSERY = 0.40 d⁻¹`. Defended as
"refit anchor: 50-cell packed, DLI = sun(16.5) + LED(11.5) = 28.0,
canopyCap = 25 g asymptotes between d28 and d35. Matches upper bound
of best case for the Décembre cohort's observed 16 g (heat-stressed,
sub-optimal lower bound). Cert 3."

Rejected per Guillaume's 2026-05-17 ruling (option 2 — refit the
number, keep cert 3 framing — rather than option 1, downgrade cert
to 2 and keep 0.40). The 0.40 value was **back-calculated**: it is
the RGR_max that, when integrated under cap = 25 g + DLI = 28 +
spacing-factor packed-canopy-spacing + f_light logistic-growth-no-decay, produces the d28-d35
asymptote target. But the target itself (asymptote-by-d28-d35) is
the prediction, not the data anchor — the cap (25 g) is the
breeder-anchored data point (nursery-canopy-cap-by-plateau), and RGR_max should *predict*
asymptote timing under that cap, not be tuned to hit a chosen
timing. Circular by construction; cert 3 implies rock-anchored to
mechanism + data, but here it was rock-anchored to a target with no
independent data anchor.

Calibration evidence available at the time: 2026-spring cohort hit
observed peak 16 g/plant at d28 under heat-stress, back-fit to
`RGR ≈ 0.22` (see `doc/yield-range-calibration-2026-spring.md`).
The jump from 0.22 (observed-stressed) → 0.40 (assumed best-case)
was +82 % with no intermediate best-case data point. The
re-integration under the rejected value shows the asymptote
actually lands at d35, not the claimed d28-d35 range (the d28
boundary was aspirational; integrator output never lit it under
the stated DLI = 28 anchor — see scratch trace in 2026-05-17
changelog).

Replaced (logistic-growth-no-decay) by `RGR_MAXIMUM_LETTUCE_NURSERY = 0.30 d⁻¹`,
anchored on cross-cultivar butterhead seedling RGR_max literature
(typical pre-canopy-closure band 0.25-0.30 d⁻¹, Wageningen /
Hoogendoorn-line CE-chamber publications). Cert 3 now reflects
cross-cultivar literature transferability; missing-doc gap (no
Salanova-specific RGR_max primary source on disk) named explicitly
in `derivation.md` logistic-growth-no-decay trace per [[P-10]]. Operational
consequence: `daysToTransplantPotential` at 50-cell / DLI = 28 /
16 LED-h shifts from the previous nominal d28-d35 framing to
integrator-output d44 (+9 to +16 days). Less-aspirational forecast,
matches what cohorts will actually show; first Décembre best-case
cohort closes the loop within one cycle.
