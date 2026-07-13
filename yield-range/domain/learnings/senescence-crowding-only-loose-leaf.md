# Senescence scoped to crowding only; biomass-loss form (2026-07-05)

## Decision

`senescence-past-closure` models **crowding self-shading only**, as a
biomass loss (`−SENESCENCE_DECLINE_RATE·W`). Salt is excluded by design.

## Why crowding-only

The 16 → 10 g d28–d35 anchor was originally read as generic senescence.
Cross-checking the nursery lane: that cohort was salt-poisoned (Na 3166 ppm,
leachate EC 5.1–5.6, no drainage over 5 weeks). Salt is being driven to safe
(salt-flush protocol, CE cap 1.0), so it is a controlled input, not a durable
growth term. What *does* recur — in the nursery tray and in a held field bed —
is crowding: a canopy held closed past over-closure self-shades its lower/inner
leaves below the light compensation point, they die, mass is lost. That is the
durable driver the labor-routine tradeoff needs.

## Why biomass-loss form (not a marketability haircut)

Considered reframing the field penalty as a marketable-yield downgrade rather
than a carbon loss. Rejected: Décembre sells Salanova as **loose leaves**,
picked leaf-by-leaf. A senesced leaf is never harvested → it is genuine lost
sellable mass, not a whole-head grade drop. So `−DECLINE·W` is the physically
correct form for this product. (Guillaume, 2026-07-05.)

## Anchor is an upper bound

16 → 10 g = ~−0.066/day is crowding + salt + heat combined. No clean-salt
cohort exists to decompose it, so the crowding-only rate is unknown, bounded
above by 0.066/day. `SENESCENCE_DECLINE_RATE = 0.04` is held as a placeholder
below that ceiling (cert 1); onset 7 days is a placeholder. Directional, not
quantitative — no decomposition number was invented.

## Rejected alternatives

- **Split nursery-decline vs field-decline constants.** More honest
  structurally, but every value is un-fittable today → inventing parameters on
  zero data. Deferred until a salt-controlled held cohort lands.
- **Nursery senescence → zero as salt control lands.** Wrong: only the salt
  share vanishes; the crowding share stays (a packed 50-cell held past closure
  self-shades regardless of salt).

## Refinement trigger

First salt-controlled held cohort (nursery 50-cell or field bed) weighed
serially past closure → sets the crowding-only rate + onset, replacing the
upper bound. See `doc/yield-range-calibration-2026-spring.md`.
