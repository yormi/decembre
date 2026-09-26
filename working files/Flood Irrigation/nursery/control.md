# Nursery control — Orisha zones, schedules, sensors (weeks 1–4)

Supply hardware: `water-supply.md`. Drain hardware and valve power: `waste.md`.
Per-rack drops and valves: `rack.md`.

## Zones

One fill valve + one drain output per sowing-week zone. Not per shelf, not per rack.

| Zone | Racks | Fill | Drain output | Feed |
|---|---|---|---|---|
| wk 1 | 2 | water-only line, own regulator | 1 | none (EC < 1) |
| wk 2 | 2 | manifold branch | 1 | station |
| wk 3 | 3–4 | manifold branch | 1 | station |
| wk 4a | 3–4 | manifold branch, ≤ 16 drops | 1 | station |
| wk 4b | 3–4 | manifold branch, ≤ 16 drops | 1 | station |

Week 4 is two valves: 31 drops × 3,3 L/min ≈ 100 L/min exceeds the 10 psi regulator
(57 L/min) and the Dosatron ceiling (53 L/min). Same schedule, run back to back.

## Cycle

- Timed fill → hold 20–30 min → drain. Feed floods 1 po (timer stops short of the
  standpipe); plain-water floods 2 po (standpipe-capped). Single pass, drain to waste,
  complete drain-back, no cascade between zones.
- Drain valves normally open: the zone's Orisha output powers them closed for the hold.
  Power loss = trays drain.
- Fill time per zone at ~12 L per rack tray, 1 po: wk 2 ~100 L (2 min), wk 3 ~190 L
  (4 min), wk 4a/4b ~185 L each (4 min). 2 po doubles. Nursery ~660 L feed/day + wk 1 water.
- Commissioning: jug + stopwatch 30 s on one drop → zone fill timer from that flow.

## Programs (draft — tensiometers tune frequency)

| Zone | Water | Frequency | Contact |
|---|---|---|---|
| wk 1 | plain, 2 po | every 2–3 d (overwatering = damping-off) | short |
| wk 2 | feed, 1 po | every 1–2 d | 15–20 min |
| wk 3 | feed, 1 po | daily | 20–30 min |
| wk 4a / 4b | feed, 1 po | daily | 20–30 min |
| all | plain, 2 po | weekly deep wetting | 20–30 min |

Plain-water day on a feed zone: Dosatron bypass off at the station.

## Hardware

| Item | Qty | Note |
|---|---|---|
| Orisha irrigation automation | 2 | fill valves included; 1 on hand from the prototype |
| Orisha tensiometer 6" mini | 4 | 1 per rack zone (wk 1, 2, 3, 4) |
| Relais 24 V | 5 | 1/zone, Orisha output → drain-valve PSU bus (`waste.md`) |

## Total

| Block | $ CA |
|---|---|
| Orisha irrigation automation × 2 | ~2 400 |
| Tensiometers × 4 | ~400 |
| **Nursery control** | **~2 800** |
