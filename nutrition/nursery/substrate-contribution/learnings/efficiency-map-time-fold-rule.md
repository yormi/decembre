# Efficiency map (REQ-157) — time-fold rule: cycle-mean release × mineralization chosen

## Efficiency map (REQ-157) — time-fold rule alternatives considered

| Rule | Description | Outcome |
|------|-------------|---------|
| Per-week function `efficiency(week, fmG)[el]` returning a curve point per week | Renderer reads a scalar per element, not a curve — function-shape would force per-week UI re-renders that don't match the cycle-level Block 7/8 framing. | Rejected. |
| Cycle-mean release × mineralization (`Σ(release_curve) × mineralization_frac`) | Matches the cycle-level supply credit already used by `cycleAverageReleasePerTray`. Single number per element. | **Accepted.** |
| Default-rate blend — weighted average of OM2-N and feather-meal-N at default 9 g/tray | Efficiency would silently shift with the front-load lever, hiding what the channel does per applied gram. | Rejected for N. |
