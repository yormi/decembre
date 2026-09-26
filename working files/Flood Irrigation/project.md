# Flood irrigation — the build

What the finished system is. Purchases: `purchased.md`, `grant-purchase-2026-09.md`.
Per-unit design: `nursery-racks.md`, `greenhouse-table.md`, `tray-drop.md`, `tray-ports.md`.
Shared rules: `common.md`. Supply, stations, drain: `nursery-common.md`, `nursery-floor-drain.md`.

## Purpose

Automated ebb-and-flow watering + feeding for Salanova seedlings, sowing → transplant
(5 weeks), replacing hand watering. Single pass, drain to waste, one Orisha zone per
sowing week.

## Footprint

| Zone | Where | Units | Growing shelves / tables | Flats (+10 %) |
|---|---|---|---|---|
| Week 1, water only | Nursery racks | 2 racks | 8 shelves | 31 |
| Week 2 | Nursery racks | 2 racks | 8 shelves | 31 |
| Week 3, spaced 2:1 | Nursery racks | 3–4 racks | 16 shelves | 62 |
| Week 4, spaced 4:1, two valves | Nursery racks | 6–7 racks | 31 shelves | 124 |
| Week 5 | Greenhouse table | 16 xTrays 3×6 | 16 tables | 124 (cap 144) |
| **Nursery** | | **14 racks** | **63 of 70 shelves** | |

Rack = Uline epoxy wire 48 × 24 × 72 po on casters, 6 shelves: 5 growing tiers +
top shelf carrying the LED strips. One 2×4 flood tray per growing shelf, 4 flats each.
Racks on patio slabs, trays shimmed level. Room plan: app `admin/croquis`.

## Water path

- Bib → dual check → **water-only line** (tee, own 10 psi regulator, 75 pi PE) → week-1 valve.
- Bib → dual check → 50 psi regulator → Dosatron A (1:10) → Dosatron B (1:100) → filter
  → 10 psi regulator → ¾ PE main → manifold → one Orisha fill valve per zone
  (wk 2, wk 3, wk 4a, wk 4b) → zone branch along the racks → one fixed-orifice ¼ po
  drop per tray (~3,3 L/min).
- Greenhouse: warm tank → pump → its own Dosatron pair → 10 psi regulator → 1½ po header
  → one drop per xTray. One Orisha zone.
- Flood depths: feed 1 po (timed), plain water 2 po (standpipe-capped). Hold 20–30 min.

## Drain path

- Every tray: drain port with normally-open ¾ SS motorized valve (powered closed during
  hold, power loss = trays drain) + overflow standpipe ≈ 2,5 po, both Active Aqua ¾
  bulkheads, ¾ vinyl drops.
- Rack: glued 1½ ABS downpipe, 2 tee branches per shelf (drain + overflow), Pro-Connect
  at the foot → 3 po ABS collector along the rack rows → nursery floor drain → sewer.
- Greenhouse: 2 po drain main with NO valve + 1½ po overflow line → shared waste run → drain.
- No shared wet path between cohorts. No recirculation.

## Light

Barrina T8 42 W, 5 per shelf, 18 h, 05:00–23:00 (dark during the night heating peak).
Weeks 1–2 use the strips already on the existing racks. ~300 µmol/m²/s, 19,4 mol/d.

## Power

- 100 A subpanel off the 200 A main, one 15 A circuit per rack (~9,7 A each).
- Load-shed relay on the subpanel feed, threshold ~170 A on the service.
- Drain valves: 24 V PSUs, one Orisha output → relay → zone valves in parallel.

## Control

Orisha: 6 irrigation zones (wk 1 · wk 2 · wk 3 · wk 4a · wk 4b · greenhouse), each
its own schedule; drain-valve outputs; tensiometers 1 per rack zone + greenhouse.

## Counts

| Item | Qty |
|---|---|
| Racks | 14 (8 on hand + 6) |
| Rack trays 2×4 | 70 (64 on hand after 2026-09-25 + 6) |
| xTrays 3×6 | 16 (15 on hand + 1) |
| Tray port kits | 86 |
| Drain valves | 86 |
| Fill drops | 86 |
| Downpipes | 14 |
| Orisha zones | 6 (1 on hand) |
| Fertigation stations | 2 |
| Barrina T8 strips, new | 235 |
| Subpanel circuits | 14 |
