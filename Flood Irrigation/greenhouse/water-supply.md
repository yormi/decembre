# Greenhouse water supply — manifold valve → fill drops (week 5)

Absolute quantities for 1 zone. Per-table parts: `table-water.md`. Waste side:
`waste.md`. Orisha: `control.md`.

## Path

- Pump manifold valve
    → fertigation station (`fertigation-station.md`, ends on the check valve)
    → PSR-2 10 psi
    → Orisha fill valve
    → 1½ po feed header, 100 pi, plugged far end
    → one fill drop per table (~3,3 L/min).
  Header pinned at 0,7 bar → deterministic orifice flow, ~53 L/min total, no tuning, no
  drift with filter loading.
- Line floats ~3–3,5 bar upstream of the PSR-2. ~53 L/min = 14 GPM, inside the PSR-2 range;
  Senninger 1 po starts at 20 psi, so bush ¾ into the 1 po line.
- Orifice equalization: identical 1,4 m tubes; 1½ po header loses ~0,04 bar over 100 pi
  at 50 L/min, ≥ 10× under the tube loss. A 1 po header (~0,25 bar) fails the rule.
- Timer set from one measured drop (`../tray-fill-drop.md`).

## Station

`fertigation-station.md`.

## Regulator → fill valve → header

- **Check valve → header:**
    - check valve (station outlet)
    → mamelon ¾ MPT × MPT
    → PSR-2 10 psi
    → mamelon ¾ MPT × MPT
    → réduit 1 MPT × ¾ FPT
    → Orisha fill valve (1 FPT inlet)
    → mamelon 1 MPT × MPT
    → réduit 1½ MPT × 1 FPT
    → adaptateur femelle 1½ FPT × insert
    → 1½ po header PE
    → bouchon insertion 1½ (far end)

| Item | Qty | Note |
|---|---|---|
| [Mamelon fileté ¾ po MPT × MPT, SCH 80 (Dubois)](https://duboisag.com/ca_fr/mamelon-pvc-filete-2211.html) | 2 | |
| [Senninger PSR-2 10 psi, ¾ po FPT, 0,5–15 GPM (IV PR-075-L-10)](https://duboisag.com/ca_fr/regulateur-de-pression-senninger.html) | 1 | |
| [Réduit PVC sch 40 1 po MPT × ¾ po FPT (bushing)](https://duboisag.com/ca_fr/reduit-mpt-x-fpt.html) | 1 | II 439131 |
| Orisha fill valve 1 po FPT × FPT | 1 | included with the Orisha automation (`control.md`) |
| [Feed header: 1½ po poly line](https://duboisag.com/ca_fr/boyau-flexible-standard-en-polyethylene-bobine.html) | ~30 m (100 pi) | along the table row |
| [Mamelon fileté PVC 1 po MPT × MPT, sch 80](https://duboisag.com/ca_fr/mamelon-pvc-filete-2219.html) | 1 | II 861133 |
| [Réduit PVC sch 40 1½ po MPT × 1 po FPT (bushing)](https://duboisag.com/ca_fr/reduit-mpt-x-fpt.html) | 1 | II 439211 |
| [Adaptateur femelle 1½ po FPT × 1½ po insert](https://duboisag.com/ca_fr/adaptateur-femelle-fpt-x-insert.html) | 1 | II 1435015 |
| [Bouchon insertion PVC 1½ po, sch 40](https://duboisag.com/ca_fr/bouchon-insertion.html) | 1 | II 1449015; header far end |
| [Collier inox 1½ po](https://duboisag.com/ca_fr/collet-acier-inoxydable.html) | 2 | adapter barb, plug barb |

Fill drops (1/table, punched in the header): `table-water.md` § Fill drop.

## Total

| Block | $ CA |
|---|---|
| Regulator → fill valve → header | ~185 (valve with the Orisha automation) |
| **Greenhouse supply** | **~185** (station in `fertigation-station.md`) |
