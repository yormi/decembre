# Flood irrigation — the build

What the finished system is. On hand: `on-hand.md`.
Per zone: `nursery/` and `greenhouse/`, each `water-supply.md` · `fertigation-station.md` ·
`waste.md` · `control.md`; nursery adds `rack.md` + `rack-water.md` + `rack-lighting.md`, `floor-drain.md`; greenhouse adds `table.md` + `table-water.md`. Every-tray parts: `tray-fill-drop.md`, `tray-ports.md`. Germination room: `germination-room/`. Barn rooms (construction, cladding, office floor, rodent closure): `barn-rooms/`; room dimensions: `../domain/barn-rooms.md`. Open questions: `for-later.md`. Build schedule: `schedule/`.

## Purpose

Automated ebb-and-flow watering + feeding for Salanova seedlings, sowing → transplant
(5 weeks), replacing hand watering. Single pass, drain to waste, one Orisha zone per
sowing week.

## Footprint

| Zone | Where | Units | Growing shelves / tables | Flats (+3 %) |
|---|---|---|---|---|
| Week 1, water only | Nursery racks | 2 racks | 8 shelves | 29 |
| Week 2 | Nursery racks | 2 racks | 8 shelves | 29 |
| Week 3, spaced 2:1 | Nursery racks | 3–4 racks | 15 shelves | 58 |
| Week 4, spaced 4:1, two valves | Nursery racks | 6–7 racks | 29 shelves | 116 |
| Week 5 | Greenhouse table | 16 xTrays 3×6 | 16 tables | 116 (cap 144) |
| **Nursery, flood** | | **14 racks** | **63 of 70 shelves** · 3 spare | |
| Other, assigned later | Nursery racks | 6 racks | 30 shelves | — |

Flood rack: 5 growing tiers, one 2×4 flood tray per used tier, 4 flats each; trays per rack
follow the room plan.
Room plan: app `admin/croquis`.

## Racks

| Rack type | Files | Qty | $ CA / rack (5 trays) |
|---|---|---|---|
| Week rack (wk 1–4), flood, lit | `nursery/rack.md` + `rack-water.md` + `rack-lighting.md` | 14 | ~2 613 |
| Other rack, lit; flood gear on a later grant | `nursery/rack.md` + `rack-lighting.md` | 6 | ~1 489 |
| **Total** | | **20** | |

Sources: 8 existing + 12 new. 5 new racks stay boxed until needed (`on-hand.md`).

Each tier without a tray: ~209 less (`nursery/rack-water.md`).

## Tables

| Table type | Files | Qty | $ CA / table |
|---|---|---|---|
| Flood | `greenhouse/table.md` + `table-water.md` | 16 | ~244 |

## Water path

- Bib → dual check → **water-only line** (tee, own 10 psi regulator, 15 pi PE) → week-1 valve.
- Bib → dual check → 50 psi regulator → Dosatron A (1:10) → Dosatron B (1:100) → filter
  → 10 psi regulator → ¾ PE main → Orisha fill valve per zone (wk 2, wk 3, wk 4a, wk 4b;
  2 on main ends, 2 on take-off tees) → zone branch along the racks → one fixed-orifice ¼ po
  drop per tray (~3,3 L/min).
- Greenhouse: pump manifold valve → its own Dosatron pair → 10 psi regulator → 1½ po header
  → one drop per xTray. One Orisha zone.

## Drain path

- Every tray: drain port + overflow standpipe (`tray-ports.md`).
- Rack: glued 1½ ABS downpipe, 2 tee branches per tray (drain + overflow), spa flex
  horizontal line at the foot → 3 po ABS collector along the rack rows → settling box →
  nursery floor drain → sewer
  (`nursery/waste.md`).
- Greenhouse: 2 po ABS drain main + 1½ po ABS overflow line → shared waste run → existing settling box
  (`greenhouse/waste.md`).
- Floor drain → sewer: `nursery/floor-drain.md`.
- No shared wet path between cohorts. No recirculation.

## Control

Orisha: 6 irrigation zones (wk 1 · wk 2 · wk 3 · wk 4a · wk 4b · greenhouse), each
its own schedule. Hardware: `nursery/control.md`, `greenhouse/control.md`.

## Counts

| Item | Qty |
|---|---|
| Racks | 20 (§ Racks) |
| Rack trays 2×4 | 63 |
| Tables | 16 (§ Tables) |
| Tray port kits | 79 |
| Fill drops | 79 |
| Downpipes | 14 |
| Orisha zones | 6 |
| Fertigation stations | 2 |
| Floor drain + sewer tie-in | 1 |
