# min() growth cliff → Beer–Lambert interception

**Decision (2026-07-05):** replace the hard `min(Rm·W, ε·DLI·A)` growth
switch with one Beer–Lambert interception term
`ε·DLI·A·(1 − exp(−k·LAI))`, `LAI = W_dry·SLA/A`.

## Rejected — the `min()` cliff

- Held `Rm = 0.20/day` (3.5-day doubling) flat right up to the switch, then
  dropped instantly to the linear slope.
- 3.5-day doubling is realistic only while the plant is small and unshaded
  (LAI ≲ 1). Self-shading drops RGR steadily through LAI 1→3; the cliff
  ignored that band and **overstated** mid-canopy growth.
- Effective closure sat at `LAI = 1/k ≈ 1.4`, contradicting the domain's
  physical "LAI at closure ≈ 3".

## Chosen — Beer–Lambert interception

- `fi = 1 − exp(−k·LAI)` rolls exponential → linear smoothly; RGR sags from
  `Rm` toward 0 as the canopy fills. No knee.
- Small-LAI limit is exactly `Rm·W` when `SLA = Rm/(ε·DLI·k)` — so `SLA` is
  **derived**, the day-10 anchor still fixes the early rate, and only `k = 0.7`
  is genuinely new.
- Closure now at the physical `LAI ≥ 3` (`fi ≈ 0.88`), matching the domain.

## Consequences

- Mid-canopy trajectory drops vs the cliff → 14-day field head sits somewhat
  below the old ~130 g. Reinforces that a healthy 186 g is not a model default.
- Senescence onset (uncalibrated, directional) shifts later with closure moving
  1.4 → 3; `SENESCENCE_ONSET_DAYS` may be re-tuned to keep the directional
  ordering (4wk < 3wk < 2wk).
