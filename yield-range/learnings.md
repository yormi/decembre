# Yield Range — learnings

Rejected alternatives, superseded decisions, and historical context for
the yield-range model. Live REQ trace lives in `derivation.md`; cohort
data lives in `doc/yield-range-calibration-2026-spring.md`.

---

## Hochmuth root-volume cap rejected as the operative ceiling

Original design (b377b60, 2026-05-09) used `cellVol × 1.6` as the
biomass ceiling (Hochmuth root-volume rule of thumb): 50-cell ~33 mL
cell volume × 1.6 = 52.8 g cap. At packed densities this is the wrong
binding constraint — the canopy closes (per-plant DLI drops to the
0.40 floor) long before roots fill the cell. The 2026 spring cohort
hit observed peak 16 g/plant at d28 (heat-stressed; predicted best
case ~25 g) — far from the root-cap value.

Replaced (REQ-112) with `canopyCapG`, a density-driven biomass
asymptote derived from Salanova breeder data. Root cap retained in
the design conversation only as a counterfactual upper bound on what
the cell could theoretically support — not used in the integration.

## Senescence branch rejected for the prediction model

Initial conversation around d28 → d35 mass loss (16 g → 10-12 g
observed in the spring cohort) considered a senescence multiplier or
negative-growth branch. Rejected for the prediction model: the
observed mass loss is dominated by **bolting + heat + root-cap
saturation** in the tomato zone, not the model's "best non-light
conditions" framing (REQ-113). Adding a senescence term would collapse
the model into a calibration to one specific stressed condition rather
than a best-case planning surface.

Stress-aware behaviour (T_day bolting trigger, VPD pockets, mold)
remains a downstream concern for the operator, not a yield-range
spec. If a stress-aware variant is ever needed, it belongs in a
separate spec.

## Rejected: back-calculated RGR_max from cap-asymptote target

Pre-2026-05-17 `RGR_MAXIMUM_LETTUCE_NURSERY = 0.40 d⁻¹`. Defended as
"refit anchor: 50-cell packed, DLI = sun(16.5) + LED(11.5) = 28.0,
canopyCap = 25 g asymptotes between d28 and d35. Matches upper bound
of best case for the Décembre cohort's observed 16 g (heat-stressed,
sub-optimal lower bound). Cert 3."

Rejected per Guillaume's 2026-05-17 ruling (option 2 — refit the
number, keep cert 3 framing — rather than option 1, downgrade cert
to 2 and keep 0.40). The 0.40 value was **back-calculated**: it is
the RGR_max that, when integrated under cap = 25 g + DLI = 28 +
spacing-factor REQ-116 + f_light REQ-115, produces the d28-d35
asymptote target. But the target itself (asymptote-by-d28-d35) is
the prediction, not the data anchor — the cap (25 g) is the
breeder-anchored data point (REQ-172), and RGR_max should *predict*
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

Replaced (REQ-115) by `RGR_MAXIMUM_LETTUCE_NURSERY = 0.30 d⁻¹`,
anchored on cross-cultivar butterhead seedling RGR_max literature
(typical pre-canopy-closure band 0.25-0.30 d⁻¹, Wageningen /
Hoogendoorn-line CE-chamber publications). Cert 3 now reflects
cross-cultivar literature transferability; missing-doc gap (no
Salanova-specific RGR_max primary source on disk) named explicitly
in `derivation.md` REQ-115 trace per [[P-10]]. Operational
consequence: `daysToTransplantPotential` at 50-cell / DLI = 28 /
16 LED-h shifts from the previous nominal d28-d35 framing to
integrator-output d44 (+9 to +16 days). Less-aspirational forecast,
matches what cohorts will actually show; first Décembre best-case
cohort closes the loop within one cycle.

## DLI initially LED-only (rejected)

First fit (RGR_MAX = 0.35) assumed bench DLI = LED only (11.5
mol/m²/d at 200 µmol × 16 h). Wrong — greenhouse gets sun too,
attenuated by double-poly transmission. With corrected DLI ≈ 27.5
(sun 16 + LED 11.5), spacing decay no longer creates a
light-starvation cliff past d18, so RGR_max refit to 0.22 (and later
to 0.40 for the best-case anchor). The two-term sun + LED model is
now REQ-114 / REQ-131.

## Single annual sun constant chosen over seasonal lookup

Seasonal DLI lookup considered (winter ~10 mol/m²/d outdoor → summer
~50 mol/m²/d). Rejected for the v1 surface — operators planning
cohort cycles run on annual-average expectations; the seasonal lookup
adds an axis (sow date) that compounds with `ledHours` and tray
choice without delivering matching planning value at current Décembre
scale. If a "when in the year do I sow X" optimizer ever lands, the
seasonal lookup can be added on top.

## Rejected: two-anchor power-law extrapolation for canopy cap

Pre-2026-05-17 `CANOPY_CAP_BY_PLATEAU` was `{ 50: 25, 32: 50, 24: 80,
18: 120 }`, fit by `W ∝ density^-1.585` against two anchors (50-cell
and 32-cell). The 50-cell anchor was the only breeder-grounded value;
32-cell was an educated estimate; 24 and 18 were extrapolations from
that fit.

Rejected per Guillaume's 2026-05-17 ruling. The power-law implies
+100 % per-plant mass for +56 % per-plant area between 50 and 32-cell
(25 → 50 g) — non-physical past Salanova's `f_light` saturation floor
at DLI ≈ 22. Two unmeasured anchors do not support a power-law fit;
the fit coincides with breeder data at exactly one row (50-cell) and
overpredicts everywhere else. The 24 / 18-cell values (80 / 120 g)
were extrapolations on the same non-physical curve.

Replaced (REQ-112 / REQ-172) by breeder-anchored geometric scaling:
`cap = area_per_cell × h × ρ × 1000` with `h = 0.10 m` and
`ρ = 82 kg/m³` (back-derived from the 50-cell breeder anchor). The
geometric basis is the conservative-physics floor — any real
spacing-dependent canopy expansion (taller, denser fill at wider
spacing) adds mass on top of this prediction, never below.
Operationally the 50 → 32 narrative shifts from "+100 % per-plant
uplift" to "+56 %" (25 → 39 g), closer to what a 32-cell cohort
will actually show. 24 / 18-cell values land in the geometric scale
as 52 / 69 g (vs 80 / 120 g under the rejected power-law); refit
upward to actuals on first non-50-cell cohort weigh-in.

## Tomato-zone temperature flagged but not modeled

Spring cohort observation: T_day setpoint optimized for tomato
(~22-26 °C) is above lettuce optimum (18-22 °C). Bolting + senescence
at d28 → d35 consistent with chronic mild heat stress (Jordane /
Guillaume hypothesis: "trop chaud dans la serre pour faire des semis
de laitue de qualité"). Per REQ-113, no T_day multiplier in the
growth term — the model intentionally answers the best-case question.
Move-to-cooler-zone is an operational call, not a model parameter.
