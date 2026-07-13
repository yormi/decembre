# Bolting clock — broken-stick thermal time, k=2

Decision (2026-06-07): model lettuce bolting as accumulated
thermal time with a **broken-stick** temperature weighting,
hot multiplier **k = 2**. Lives in `../domain.md` § Bolting.


## Why broken-stick over the alternatives

- Plain degree-days (k=1) understate the hot end — bolting
  accelerates disproportionately above ~20 °C, not linearly.

- Q10 exponential (rate = 2^((T−20)/10)) is biologically
  cleaner but drops the °C·d unit the domain already speaks
  and has no hard base temp. Rejected for opacity.

- Broken-stick keeps degree-days AND gives one honest dial
  (k) to tune the hot penalty against future bolt dates.


## Why k = 2

- Provisional, literature-shaped, not locally calibrated.

- k = 2 = "a degree at 26 °C costs the plant twice a degree
  at 18 °C." Defensible band was 2–3; took the low end to
  avoid over-penalising until our own bolt events calibrate.


## Convexity forces hourly, not 24 h mean

- Domain previously framed the clock on 24 h average temp.

- A convex response means f(mean) < mean(f) (Jensen): two
  days with the same mean but different swing bank different
  bolt-time. Same-mean worked example: flat 19 °C day = 15
  units; 12 °C-night / 26 °C-afternoon day = 18 units (+20%).

- So accumulation must integrate hourly temps. The 24 h-avg
  setpoint (16–17 °C) stays as a *control target* — holding
  the mean low keeps you below T_infl so the hot term rarely
  fires — but it is not the accumulation input.


## Calibration status — UNVALIDATED

- T_base 4 °C, T_infl 20 °C, k 2, threshold 750–1250 °C·d
  are all literature-shaped placeholders.

- The threshold is cultivar-dominated (±25%+). Only our own
  bolt-date-vs-accumulated-temp records will tighten it.
  Until then any predicted bolt date is an estimate.

- Next calibration input: log prop-house hourly temp + the
  observed bolt date for the next 1–2 Salanova crops, then
  back-solve the threshold.
