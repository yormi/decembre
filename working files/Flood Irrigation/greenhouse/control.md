# Greenhouse control — Orisha zone, schedule, sensor (week 5)

Supply hardware: `water-supply.md`. Drain hardware: `waste.md`. Per-table drops: `table.md`.

## Zone

One fill valve + one drain output for the 16-table row.

| Zone | Tables | Fill | Drain output | Feed |
|---|---|---|---|---|
| wk 5 | 16 | pump → station → 1½ po header | 1 NO valve on the drain main | station |

## Cycle

- Timed fill → hold 20–30 min → drain. Feed 1 po, plain water 2 po (standpipe-capped).
  Single pass, drain to waste, complete drain-back.
- ~53 L/min at the header; 1 250 L feed flood in ~12 min; ~250 L/day delivered.
- Drain valve normally open, powered closed for the hold; power loss = tables drain.
  Overflow line is unvalved and always live.
- Pump runs on demand from the inline pressure controller; the Orisha fill valve is
  the only actuator on the fill side.
- Commissioning: jug + stopwatch 30 s on one drop → fill timer from that flow.

## Program (draft — tensiometer tunes frequency)

| Water | Frequency | Contact |
|---|---|---|
| feed, 1 po | daily | 20–30 min |
| plain, 2 po | weekly deep wetting | 20–30 min |

Plain-water day: Dosatron bypass off at the station.

## Hardware

| Item | Qty | Note |
|---|---|---|
| Orisha zone | 1 | on the nursery automation (`../nursery/control.md`); fill valve included |
| Orisha tensiometer 6" mini | 1 | in one mid-row table |
| Relais 24 V | 1 | Orisha output → NO drain valve (`waste.md`) |

## Total

| Block | $ CA |
|---|---|
| Orisha zone | in nursery control |
| Tensiometer | ~100 |
| **Greenhouse control** | **~100** |
