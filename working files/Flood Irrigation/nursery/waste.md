# Nursery waste — downpipe foot → sewer (weeks 1–4)

Absolute quantities for 14 racks. Per-rack drain/overflow drops, downpipe and collector
tee: `rack.md`. Supply side: `water-supply.md`. Zones, drain outputs: `control.md`.

## Path

- Each rack's glued 1½ ABS downpipe → Pro-Connect → 1½ stub → 3 × 3 × 1½ sanitary tee
  in the 3 po ABS collector → collector runs along each rack row, ~1 % fall → discharges
  above the floor-drain grate (air gap) → sewer (`floor-drain.md`).
- Collector: one run per rack row (wall columns, island, below-corridor row); the
  corridor row crosses under a threshold plate or drops to the drain line directly.
- Drain valves are normally open: powered closed during hold from a 24 V bus switched
  by one Orisha output per zone; power loss = trays drain.
- No shared wet path between cohorts: valves sit upstream of the downpipe.

## Collector

| Item | Qty | Note |
|---|---|---|
| [IPEX Cell Core ABS DWV 3 po × 12 pi (Home Depot)](https://www.homedepot.ca/product/ipex-cell-core-3-inch-x-12-feet-abs-dwv-pipe/1000120780) | ~10 sticks (7 bought) | measure rack rows + run to the drain; rigid holds the fall |
| [LESSO manchon ABS 3 po hub × hub](https://www.homedepot.ca/product/lesso-3-in-abs-coupling-all-hub/1000116135) | ~10 (6 bought) | |
| [LESSO coude 45 / 90 long ABS 3 po](https://www.homedepot.ca/product/lesso-3-in-abs-45-degree-sr-elbow-all-hub/1000421136) | ~6 (2 bought) | row turns |
| [LESSO adaptateur cleanout ABS 3 po SPIG × FIPT](https://www.homedepot.ca/product/lesso-3-in-abs-cleanout-adapter-spig-x-fipt/1000116166) | 1/run (1 bought) | high-end flush port |
| [LESSO bouchon mâle ABS 3 po MIPT](https://www.homedepot.ca/product/lesso-3-in-abs-male-plug-mipt/1000116111) | 1/run (1 bought) | unscrew to flush |
| [Oatey colle ABS jaune 473 mL](https://www.homedepot.ca/product/oatey-473-ml-abs-cement-yellow-c-/1000118514) | 2 (1 bought) | no primer needed |

Sanitary tee + stub per rack: `rack.md` § Collector tie-in. Remainder sticks:
[3 pi](https://www.homedepot.ca/product/ipex-homerite-products-abs-pipe-3-inches-x-3-ft-cell-core/1000423249) /
[6 pi](https://www.homedepot.ca/product/ipex-homerite-products-abs-pipe-3-inches-x-6-ft-cell-core/1000120784).

## Drain-valve power

| Item | Qty | Note |
|---|---|---|
| [PSU 24 V / 10 A 240 W](https://www.amazon.ca/Adapter-100-240V-Portable-Transformers-Security/dp/B0CDWHH2T3) | 4 (1 bought) | ≤ 25 valves × 5 W ≈ 5,2 A held per PSU; barrel jack → terminal block; mount dry |
| Fil 18/3 | ~150 m | valve → bus |
| WAGO 221, 90-pack | 2 (1 bought) | |

## Floor drain + sewer tie-in

`floor-drain.md` — plumber turnkey, quote 2026-09-26: 5 900 $ CA.

## Total

| Block | $ CA |
|---|---|
| Collector, less prototype stock | ~500 |
| Drain-valve power | ~400 |
| Floor drain + sewer tie-in | 5 900 |
| **Nursery waste** | **~6 800** |
