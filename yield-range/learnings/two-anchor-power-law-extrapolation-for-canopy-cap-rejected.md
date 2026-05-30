# Rejected: two-anchor power-law extrapolation for canopy cap

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

Replaced (canopy-cap-is-ceiling / nursery-canopy-cap-by-plateau) by breeder-anchored geometric scaling:
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
