# Greenhouse water supply — manifold tee → fill drops (week 5)

Absolute quantities for 1 zone. Per-table parts: `table-water.md`. Waste side:
`waste.md`. Orisha: `control.md`.

## Path

- Pump manifold tee
    → fertigation station (`fertigation-station.md`, Orisha fill valve → … → check valve)
    → PSR-2 10 psi
    → 1½ po main to the middle of the table row
    → té 1 po → 2 × 1 po branches, 8 tables each, capped far ends (unscrew to flush)
    → one fill drop per table (~3,3 L/min).
  Branches pinned at 0,7 bar → deterministic orifice flow, ~53 L/min total, no tuning, no
  drift with filter loading.
- Line floats ~3–3,5 bar upstream of the PSR-2. ~53 L/min = 14 GPM, inside the PSR-2 range;
  Senninger 1 po starts at 20 psi, so bush ¾ into the 1 po line.
- Orifice equalization: identical 1,4 m tubes; each 1 po branch (8 tables, ~27 L/min) loses
  ~0,035 bar, ≥ 10× under the tube loss. One 1 po line for all 16 tables (~0,25 bar) fails the rule.
- Timer set from one measured drop (`../tray-fill-drop.md`).
- Each fertigated fill ends with a plain-water rinse (Dosatron bypass on) → header + drops hold clean water.
- Monthly: time 2–3 drops per branch vs the reference drop → slow drop → unscrew both end caps, flush.

## Station

`fertigation-station.md`.

## Regulator → branches

- **Check valve → main:**
    - check valve (station outlet)
    → mamelon ¾ MPT × MPT
    → PSR-2 10 psi
    → mamelon ¾ MPT × MPT
    → réduit 1 MPT × ¾ FPT
    → réduit 1½ MPT × 1 FPT
    → adaptateur femelle 1½ FPT × insert
    → 1½ po PE main, 4 coudes 90 insertion 1½ to turn it
- **Main → branches:**
    - 1½ po main
    → manchon réduit insertion 1½ × 1
    → té insertion 1 po
    → 2 × 1 po PE branch, 8 tables each
- **Each branch end:**
    - 1 po PE
    → adaptateur mâle 1 MPT × insert
    → bouchon femelle 1 FPT

| Item | Qty | Note |
|---|---|---|
| [Mamelon fileté ¾ po MPT × MPT, SCH 80 (Dubois)](https://duboisag.com/ca_fr/mamelon-pvc-filete-2211.html) | 2 | |
| [Senninger PSR-2 10 psi, ¾ po FPT, 0,5–15 GPM (IV PR-075-L-10)](https://duboisag.com/ca_fr/regulateur-de-pression-senninger.html) | 1 | |
| [Réduit PVC sch 40 1 po MPT × ¾ po FPT (bushing)](https://duboisag.com/ca_fr/reduit-mpt-x-fpt.html) | 1 | II 439131 |
| [Réduit PVC sch 40 1½ po MPT × 1 po FPT (bushing)](https://duboisag.com/ca_fr/reduit-mpt-x-fpt.html) | 1 | II 439211 |
| [Adaptateur femelle 1½ po FPT × 1½ po insert](https://duboisag.com/ca_fr/adaptateur-femelle-fpt-x-insert.html) | 1 | II 1435015 |
| [Main: 1½ po poly line](https://duboisag.com/ca_fr/boyau-flexible-standard-en-polyethylene-bobine.html) | station → middle of the row | |
| [Coude 90 insertion 1½ po](https://duboisag.com/ca_fr/insert-ell-90-1399.html) | 4 | turns the main |
| [Manchon réduit insertion 1½ × 1 po](https://duboisag.com/ca_fr/) | 1 | main → tee |
| [Té insertion 1 po](https://duboisag.com/ca_fr/te-insertion.html) | 1 | |
| [Branches: 1 po poly line](https://duboisag.com/ca_fr/boyau-flexible-standard-en-polyethylene-bobine.html) | 2 × half the row | |
| [Adaptateur mâle 1 po MPT × 1 po insert](https://duboisag.com/ca_fr/adaptateur-male-mpt-x-insert.html) | 2 | branch ends |
| Bouchon femelle PVC 1 po FPT (cap), sch 40 | 2 | unscrew to flush; téflon |
| [Collier inox 1½ po](https://duboisag.com/ca_fr/collet-acier-inoxydable.html) | 10 | adapter, 4 elbows × 2, coupling |
| [Collier inox 1 po](https://duboisag.com/ca_fr/collet-acier-inoxydable.html) | 6 | coupling, tee × 3, 2 end adapters |

Fill drops (1/table, punched or drilled 7/64 in the branches): `table-water.md` § Fill drop.

## Total

| Block | $ CA |
|---|---|
| Regulator → branches | ~200 |
| **Greenhouse supply** | **~200** (station in `fertigation-station.md`) |
