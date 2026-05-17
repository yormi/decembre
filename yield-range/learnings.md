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

## 24 / 18-cell `canopyCapG` extrapolated, not measured

50-cell + 32-cell anchored on Décembre + general scaling cert 2.
24-cell and 18-cell extrapolated from those two anchors via the
W ∝ density^-1.585 power-law fit. No direct cohort data exists for
those densities. Will be refit when 24 / 18 cohorts run; flagged in
the calibration-doc "Future cohorts to log" priority list.

## Tomato-zone temperature flagged but not modeled

Spring cohort observation: T_day setpoint optimized for tomato
(~22-26 °C) is above lettuce optimum (18-22 °C). Bolting + senescence
at d28 → d35 consistent with chronic mild heat stress (Jordane /
Guillaume hypothesis: "trop chaud dans la serre pour faire des semis
de laitue de qualité"). Per REQ-113, no T_day multiplier in the
growth term — the model intentionally answers the best-case question.
Move-to-cooler-zone is an operational call, not a model parameter.
