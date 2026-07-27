# Step-up 20 g → 50 g on the 2.5"-deep pot (2026-07-19)

## Decision

Salanova nursery moves from 50-cell trays (20 g interim plug) to **2.5"-deep
pots, 32 per tray, 50 g plug**. This becomes THE nursery default (replaces the
20 g / 50-cell line; that retires to history like the 90 g before it).

Model changes:
- `targetG_default` 20 → 50, `cellsPerTray_default` 50 → 32 (`plant-needs/data.js`).
- `trayVolumeL` 1.25 → 3.84 (`fertigation/data.js`) = 32 pots × ~120 mL/plant
  (was 50 cells × 25 mL).
- **Recipe concentrations unchanged** (Ocean 2 / Acadie 1.5 / kelp 1 / Fe 0.015).

## Why it works — volume, not concentration

The 50 g plug carries 2.5× the per-plant N demand of the 20 g interim. The old
trap (June cohort) was that meeting a big plug's N in a 40 mL no-drain cell
forced a hot feed → salt. The 2.5"-deep pot holds ~5× the substrate (~200 mL),
so:

- Salt density per mL **drops** even as the plug grows.
- The higher demand is met by **more feed volume** (3.84 L/tray) at the same
  salt-safe 0.85 mS/cm bucket — no hotter feed, no frequency increase.
- Predicted feed CE stays 0.85, pH 5.83 — both invariants unchanged.
- The recipe now clears **full** N (1290 ≥ 1120) and P (138 ≥ 112), not just the
  50 % floor the 20 g feed hit.

So the N-vs-salt collision the derivation feared on a step-up did NOT return —
container volume absorbed it. Frequency stays in reserve for a future step-up in
a smaller container.

## Correction folded in — drainage was never the missing lever

Earlier reasoning credited "the draining pot" with resetting salt. Guillaume
corrected: the **old 50-cell trays already had drainage cracks**. They drained
and *still* salted to leachate 5+ in June. So the June disaster was
**concentration × time**, not trapped water.

Consequence: drainage is not passive protection. Two things hold pour-through in
band, and only the first is automatic:

1. The **weak 0.85 feed** (3× below June's ~2.6) — the real protection.
2. **Deliberate leaching** — water each feed to ~15 % visible runoff. Passive
   cracks don't flush salt; you must over-water past container capacity. This is
   an operator gesture, not a container property.

## Open / cert 2 items

- `trayVolumeL 3.84` is an estimate from ~120 mL/plant; **pending pot-brim
  measurement**. Refine when measured.
- `targetG_default 50` is cert 2 (planned, not yet field-run). Upgrade after the
  first 50 g cohort's pour-through + tissue come back.
- Low-alkalinity source water means pH will still drift down over the cycle; the
  durable lever is substrate lime charge at fill, not the feed.
