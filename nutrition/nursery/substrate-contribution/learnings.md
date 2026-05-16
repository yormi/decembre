# Substrate-contribution (nursery) · learnings

Rejected alternatives and historical decisions for the substrate-
contribution model. Live rationale is in `derivation.md`; spec is in
`spec.md`.

---

## Efficiency map (REQ-157) — time-fold rule alternatives considered

| Rule | Description | Outcome |
|------|-------------|---------|
| Per-week function `efficiency(week, fmG)[el]` returning a curve point per week | Renderer reads a scalar per element, not a curve — function-shape would force per-week UI re-renders that don't match the cycle-level Block 7/8 framing. | Rejected. |
| Cycle-mean release × mineralization (`Σ(release_curve) × mineralization_frac`) | Matches the cycle-level supply credit already used by `cycleAverageReleasePerTray`. Single number per element. | **Accepted.** |
| Default-rate blend — weighted average of OM2-N and feather-meal-N at default 9 g/tray | Efficiency would silently shift with the front-load lever, hiding what the channel does per applied gram. | Rejected for N. |

## N efficiency = 0.75 ignores OM2 N contribution

At default rates the blended efficiency would be
`(288.75 × 1.0 + 877.5 × 0.75) / (288.75 + 1170) ≈ 0.79`
(using 1170 mg applied-N from 9 g × 0.13 × 1000, and OM2 starter 288.75 mg =
175 ppm × 1.65 L). Headline pinned at 0.75 (feather-meal-only mineralization)
to stay invariant against the front-load lever — at zero front-load the
blended figure swings to 1.0 (OM2-only) and the renderer reports an
ill-defined "depends on the slider" number. Accepted as cert-3
simplification.

## P/K/Ca/Mg efficiency = 1.0 simplification

1.65 L closed-bottom peat tray, seedling roots fill most of the volume by
week 3. Some fraction (< 10 %) lost to leaching / substrate binding, but
within the cert-2 OM2-datasheet-gap band, so not separately discounted.
