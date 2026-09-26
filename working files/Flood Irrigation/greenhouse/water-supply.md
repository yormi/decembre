# Greenhouse water supply — tank → fill drops (week 5)

Absolute quantities for 16 tables, 1 zone. Per-table parts: `table.md`. Waste side:
`waste.md`. Zone, schedule, Orisha: `control.md`.

## Path

- Warm tank → fertigation station (`fertigation-station.md`, ends on a PSR-2 10 psi)
  → Orisha fill valve → 1½ po feed header, 100 pi, capped → one fill drop per table
  (~3,3 L/min). Header pinned at 0,7 bar → deterministic orifice flow, ~53 L/min total,
  no tuning, no drift with filter loading.
- Orifice equalization: identical 1,4 m tubes; 1½ po header loses ~0,04 bar over 100 pi
  at 50 L/min, ≥ 10× under the tube loss. A 1 po header (~0,25 bar) fails the rule.
- Timer set from one measured drop (`../tray-fill-drop.md`).

## Station

`fertigation-station.md` — pump → Dosatron A → B → filter → check valve → PSR-2 10 psi.

## Fill valve + header

| Item | Qty | Note |
|---|---|---|
| Orisha fill valve 1 po | 1 | included with the Orisha automation (`control.md`) |
| Feed header: 1½ po poly line, capped far end | ~30 m (100 pi) | along the table row |
| Adapters 1 po → 1½ po header | 2 | valve out, header in |

Fill drops (1/table, punched in the header): `table.md` § Fill drop.

## Total

| Block | $ CA |
|---|---|
| Fill valve + header | ~160 (valve with the Orisha automation) |
| **Greenhouse supply** | **~160** (station in `fertigation-station.md`) |
