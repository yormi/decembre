# Greenhouse waste — drain main → drain (week 5)

Absolute quantities for 16 tables. Per-table drain/overflow drops: `table.md`. Supply
side: `water-supply.md`. Zone, drain output: `control.md`.

## Path

- **Drain main, valved:** each drain drop → 2 × 2 × ¾ tee → 2 po PVC main, ~1 % fall to
  a 1 po NO motorized valve at the true low point → shared waste run → drain. 2 po carries
  ~100 L/min half-full vs ~53 needed (1 250 L in ~12 min); the main is the limiter, not
  the valve. Threaded end cap for seasonal flush.
- **Overflow line, unvalved:** each overflow drop → 1½ × 1½ × ¾ tee → 1½ po PVC line,
  parallel to the main, merging into the waste run just downstream of the NO valve
  (high-tee entry so drain surges can't back up). Passive and always live: the drain
  valve is closed during fill/hold, so standpipes into the valved main would back up
  and defeat the level cap.
- Geometry: table row ~100 pi, valve at the far end → ~100 pi of each main, then one
  shared ~80 pi run. ~1 % = ~30 cm over the mains + ~25 cm over the run; if the fall
  isn't there, upsize the shared run to 3 po at ~0,5 %. No bellies.
- Buried waste run: sand bedding, grade by string or laser before backfill, cleanout
  wye + riser at the upstream end, valve + merge accessible.

## Drain main

| Item | Qty | Note |
|---|---|---|
| Tuyau PVC sch 40 2 po × 10 pi (quincaillerie) | 10 sticks | ~100 pi along the row |
| [U.S. Solid motorized ball valve 1" SS full-port, NO](https://www.amazon.ca/Motorized-Valve-Normally-U-S-Solid/dp/B0993GKRLT) | 1 | at the true low point; fails open |
| Adaptateur PVC 2 po slip × FPT + bouchon MPT | 1 | end cap, not glued |
| Adapters 2 po → 1 po valve → 2 po | 2 | |

Drain drops (1/table): `table.md` § Drain drop.

## Overflow line

| Item | Qty | Note |
|---|---|---|
| Tuyau PVC sch 40 1½ po × 10 pi (quincaillerie) | 10 sticks | ~100 pi, parallel to the main |
| Té PVC 2 × 2 × 1½ po (high entry into the waste run) | 1 | after the NO valve |

Overflow drops (1/table): `table.md` § Overflow drop.

## Waste run

| Item | Qty | Note |
|---|---|---|
| Tuyau PVC 2 po buriable (DWV / SDR-35) | ~25 m (80 pi) | valve → drain |
| Cleanout wye 2 po + riser | 1 | upstream end |
| Colle PVC + apprêt | 1 | all PVC joints |

## Drain-valve power

Relay in `control.md`; 24 V from a nursery PSU (`../nursery/waste.md`) if the run allows, else a 2nd PSU (~35 $).

## Total

| Block | $ CA |
|---|---|
| Drain main + valve | ~330 |
| Overflow line | ~150 |
| Waste run | ~300 |
| Power | ~50 |
| **Greenhouse waste** | **~830** |
