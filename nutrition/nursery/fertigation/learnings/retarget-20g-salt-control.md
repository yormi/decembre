# Re-target 90 g → 20 g for salt control (2026-06-20)

## Decision

Plug target lowered 90 g → 20 g, fertigation recipe re-derived
(Ocean 7/Acadie 6/kelp 2 → Ocean 2/Acadie 1.5/kelp 1), CE cap 3.0 → 1.0,
tank-pH waterPh default 7.0 → 6.26 (real Décembre source).

## Why

Field diagnosis: leachate EC 5.1–5.6, plug tissue Na 3166 ppm, tip-burn
across the cohort, plugs stalled ~16 g. Root cause = a salty fish-fed feed
(~2.0 mS/cm) concentrating in a no-drainage cell over 5 weeks with zero
leaching. The old recipe sat just under a 3.0 cap whose rationale (substrate
1.5–2.5) conflicts with the domain salt-sensitive band (root-zone 1.0–1.2,
hold > 1.5). Field + domain win → cap dropped to 1.0 bucket.

## The hard constraint found

**Fish-N and salt are physically coupled.** Meeting the 90 g N floor
(1 400 mg/tray) needs Ocean ~7.5 g/L → CE ~1.5 from Ocean alone, ~2.5 full
recipe — a ~3–4× collision with the ~0.6–0.8 salt-safe feed. You cannot
dilute to safety and still feed the N in one weekly feed.

## Rejected this session

- **Decouple via frequency at 40–50 g (3–5 feeds/wk).** Technically cleanest
  (split weekly N → low per-feed CE), but rejected for now: too much added
  hand-watering labour. Kept as the lever for when the target is raised again.
- **1 feed/wk at ~30 g.** Feasible at CE ~1.0 but tighter margin; Guillaume
  chose a smaller still-safer 20 g interim plug.
- **Raise feed N to chase a big plug.** Rejected — that is exactly what salted
  the cohort.

## Status

Interim ("for now"). As pour-through EC holds in band, step the target back up
(see derivation §6 trigger 5) — the collision returns and frequency becomes
the lever. The old 90 g Pareto walk in `nursery-recipe-default-pareto-walk.md`
is historical.

## Bench adoption + retired recipe (audit trail, 2026-06-20)

Adopted as the live operator recipe on the Fertigation → Semis card (the bench
switched over). **Retired bench recipe** (what was poured before, per 1.25 L/tray):

| Product | Retired | Adopted |
|---|---|---|
| EZ-GRO Ocean 15-1-1 | — (absent) | 2.0 g/L |
| Acadie poisson | 13 mL/L | 1.5 mL/L |
| Acadie kelp | 2 mL/L | 1.0 mL/L |
| Sulfate de fer 20 % | 15 mg/L | 15 mg/L (= 0.015 g/L, unchanged) |

The organic-cert audit record now lives in the retired-recipe scheme:
`STORED_RECIPE.nursery.fertigation` (live) + a `RECIPE_HISTORY` entry
(`app/historique-nutriments/history.js`, retired 2026-06-20) rendered on the
Historique des nutriments page. Future feed changes go through /retire-recipe.
This table is kept as engineering context.
