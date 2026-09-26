# Nursery water supply — bib → fill valves (weeks 1–4)

Absolute quantities for 14 racks, 6 zones. Per-rack parts: `rack.md`. Waste side:
`waste.md`. Zones, schedules, Orisha: `control.md`.

## Path

- **Feed line (weeks 2–4):** bib (¾ MHT) → accouplement pivotant ¾ FHT × FPT →
  adaptateur ¾ MPT × insert → ¾ PE 10 pi → fertigation station (`fertigation-station.md`,
  ends on a PSR-2 10 psi that pins the header at 0,7 bar → fixed-orifice fill, no
  calibration) → adaptateur → ¾ PE 10 pi → main ¾ PE 50 pi along the racks → manifold →
  zone branches wk 2 · wk 3 · wk 4a · wk 4b.
- **Water-only line (week 1):** tee in the bib PE after the dual check, before the
  Dosatrons → own PSR-2 10 psi → ¾ PE 75 pi → week-1 Orisha valve. Germination never
  sees feed (EC < 1, `domain/propagation.md`). Own zone + schedule.
- Phase 1 = water only: the bib PE lands straight on the PSR-2; the station inserts
  later in that 10 pi without touching anything downstream.
- GHT threads half-way into NPT and leaks — never mix them.
- Buried ¾ PE 6 po deep, 2 pi inside the exterior wall is safe at 15 °C 24/7; drain the
  line (unscrew the end bouchon) if heat goes down in winter.
- Week 4 is two valves: 31 drops × 3,3 L/min ≈ 100 L/min exceeds the PSR-2 (57 L/min) and
  the Dosatron ceiling (53 L/min) → ≤ 16 drops per valve, same schedule, back to back.

## Bib → station

| Item | Qty | Note |
|---|---|---|
| [Accouplement laiton pivotant ¾ FHT × ¾ FPT (Dubois)](https://duboisag.com/ca_fr/fht-x-fpt-swivel-brass-coupling.html) | 1 | threads onto the bib without rotating the chain |
| [Mamelon fileté ¾ po MPT × MPT, SCH 80 (Dubois)](https://duboisag.com/ca_fr/mamelon-pvc-filete-2211.html) | 1 | only if the kit threads directly on the swivel |
| [Adaptateur mâle ¾ po MPT × ¾ po insert](https://duboisag.com/ca_fr/adaptateur-male-mpt-x-insert.html) | 2 | swivel → PE, PE → dual check |
| [Boyau PE standard ¾ po × 100 pi, 75 psi (BO CO-075-75-1)](https://duboisag.com/ca_fr/boyau-flexible-standard-en-polyethylene-bobine.html) | 10 pi | |
| [Coude 90 insertion ¾ po — cédule 40](https://duboisag.com/ca_fr/insert-ell-90-1399.html) | 3 | |
| [Collier inox 304 19–29 mm, 20-pack Amazon](https://www.amazon.ca/dp/B091GJWGHQ) | 8 | 1/barb |

## Fertigation station

`fertigation-station.md` — dual check → PMR 50 → Dosatron A → B → filter → PSR-2 10 psi. Phase 2.

## Water-only line (week 1)

| Item | Qty | Note |
|---|---|---|
| [Té insertion ¾ po — cédule 40 (II 1401007)](https://duboisag.com/ca_fr/te-insertion.html) | 1 | in the bib PE, after the dual check |
| [Senninger PSR-2 10 psi, ¾ po FPT (IV PR-075-L-10)](https://duboisag.com/ca_fr/regulateur-de-pression-senninger.html) | 1 | this line bypasses the station regulator |
| [Adaptateur mâle ¾ po MPT × ¾ po insert](https://duboisag.com/ca_fr/adaptateur-male-mpt-x-insert.html) | 2 | regulator in + out |
| [Boyau PE standard ¾ po × 100 pi, 75 psi (BO CO-075-75-1)](https://duboisag.com/ca_fr/boyau-flexible-standard-en-polyethylene-bobine.html) | 75 pi | |
| [Coude 90 insertion ¾ po — cédule 40](https://duboisag.com/ca_fr/insert-ell-90-1399.html) | 6 | |
| [Collier inox 304 19–29 mm, 20-pack Amazon](https://www.amazon.ca/dp/B091GJWGHQ) | 17 | té × 3, coudes × 12, adapters × 2 |

Feeds the week-1 zone branch below (its valve inlet adapter is counted there).

## Station → main → manifold (weeks 2–4)

| Item | Qty | Note |
|---|---|---|
| [Boyau PE standard ¾ po × 100 pi, 75 psi (BO CO-075-75-1)](https://duboisag.com/ca_fr/boyau-flexible-standard-en-polyethylene-bobine.html) | 10 + 50 + 75 pi | station → main → distribution along the racks |
| [Coude 90 insertion ¾ po — cédule 40](https://duboisag.com/ca_fr/insert-ell-90-1399.html) | 2 + 2 + 6 | |
| [Té insertion ¾ po — cédule 40 (II 1401007)](https://duboisag.com/ca_fr/te-insertion.html) | 3 | manifold splits to 4 branches |
| [Collier inox 304 19–29 mm, 20-pack Amazon](https://www.amazon.ca/dp/B091GJWGHQ) | 30 | 1/barb + 25 % |

## Zone branches (6: wk 1 · wk 2 · wk 3 · wk 4a · wk 4b — greenhouse in `../greenhouse/water-supply.md`)

Per branch: Orisha valve → rack A → hop → rack B → … → end cap. 5 nursery branches.

| Item | Qty | Note |
|---|---|---|
| Orisha fill valve 1 po | 5 | included with the Orisha automation (`control.md`); 1 on hand |
| [Adaptateur mâle réduit 1 po MPT × ¾ po insert](https://duboisag.com/ca_fr/adaptateur-male-reduit-mpt-x-insert.html) | 10 | valve in + out |
| [Boyau PE standard ¾ po × 100 pi, 75 psi (BO CO-075-75-1)](https://duboisag.com/ca_fr/boyau-flexible-standard-en-polyethylene-bobine.html) | ~10 pi/rack → 140 pi | rack-to-rack hops |
| [Coude 90 insertion ¾ po — cédule 40](https://duboisag.com/ca_fr/insert-ell-90-1399.html) | 14 | 1/rack |
| [Adaptateur mâle ¾ po MPT × ¾ po insert](https://duboisag.com/ca_fr/adaptateur-male-mpt-x-insert.html) | 5 | branch-end closure |
| Bouchon femelle ¾ po FPT (cap) | 5 | screws onto the end adapter, unscrew to flush; téflon |
| [Collier de serrage inox](https://duboisag.com/ca_fr/collet-acier-inoxydable.html) ¾ po | 55 | 1/barb + 25 % |

Fill drops (1/tray, punched in the branch): `rack.md` § Fill drops.

## Spares

| Item | Qty | Note |
|---|---|---|
| Coude 45 insertion ¾ po | 3 | |
| Mamelon insertion ¾ × ¾ po (PE coupling) | 2 | joins 2 PE lengths; 2 clamps each |

## Total

| Block | $ CA |
|---|---|
| Bib → station | ~135 |
| Water-only line | ~110 |
| Station → main → manifold | ~120 |
| Zone branches, less Orisha | ~250 |
| **Nursery supply** | **~620** (station in `fertigation-station.md`) |
