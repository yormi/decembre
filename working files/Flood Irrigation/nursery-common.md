# Nursery — common infrastructure (racks, weeks 1–4)

Shared design for all zones: `common.md`. Served zone:
`nursery-racks.md`.


## Nursery water supply (bib → fill valves, weeks 1–4)

- **Phase 1 = water only.** Feed comes later by inserting
  the station (§ Nursery fertigation) in the 10 pi PE
  between the bib and the 10 psi regulator; everything
  downstream stays untouched.

- **Supply chain (garden hose bib = GHT, not NPT):**
  bib (¾ MHT)
  → accouplement laiton pivotant ¾ FHT × ¾ FPT
  → adaptateur ¾ MPT × ¾ insert → ¾ PE 10 pi
  → [phase 2: fertigation kit]
  → adaptateur ¾ MPT × ¾ insert → 10 psi regulator ¾ FPT
    (pins header at 0,7 bar → fixed-orifice fill, no
    calibration; 0,5–15 GPM covers one zone at a time,
    racks ≤ 9 drops ≈ 30 L/min)
  → adaptateur ¾ MPT × ¾ insert → ¾ PE 10 pi
  → main ¾ PE 50 pi along the racks
    → racks distribution, week-zones 2–4 (`nursery-racks.md` § Fill).
  GHT threads half-way into NPT and leaks — never mix them.

- **Water-only line (week 1):** tees off the bib PE **before**
  the fertigation kit (after the dual check) → its own 10 psi
  regulator → ¾ PE 75 pi → week-1 Orisha valve. Germination
  never sees feed (EC < 1, `domain/propagation.md`), no Dosatron
  bypass to remember. Week 1 keeps its own zone + schedule.

- Buried ¾ PE 6 po deep, 2 pi inside the exterior wall is
  safe with the room at 15 °C 24/7. Only a multi-day heat
  loss freezes it — drain the line (unscrew the end
  bouchon) if heat goes down in winter.

**Bib → fertigation kit** (bib → swivel → adapter → ¾ PE → adapter → kit; phase 1: the same PE lands on the 10 psi regulator, so it can sit anywhere along the run)

| Item | Qty | Note |
|---|---|---|
| [Accouplement laiton pivotant ¾ FHT × ¾ FPT (Dubois)](https://duboisag.com/ca_fr/fht-x-fpt-swivel-brass-coupling.html) | 1 | threads onto the bib without rotating the chain |
| [Mamelon fileté ¾ po MPT × MPT, SCH 80 (Dubois)](https://duboisag.com/ca_fr/mamelon-pvc-filete-2211.html) | 1 | only if kit threads directly on the swivel |
| [Adaptateur mâle ¾ po MPT × ¾ po insert](https://duboisag.com/ca_fr/adaptateur-male-mpt-x-insert.html) | 2 | swivel → PE, PE → kit (ph. 2) / regulator (ph. 1) |
| [Boyau PE standard ¾ po × 100 pi, 75 psi (BO CO-075-75-1)](https://duboisag.com/ca_fr/boyau-flexible-standard-en-polyethylene-bobine.html) | 10 pi | |
| [Coude 90 insertion ¾ po — cédule 40](https://duboisag.com/ca_fr/insert-ell-90-1399.html) | 3 | |
| [Collier inox 304 19–29 mm, 20-pack Amazon](https://www.amazon.ca/dp/B091GJWGHQ) | 8 | 1/barb: 2 adapters + 3 coudes × 2 |

**Fertigation kit → main**

| Item | Qty | Note |
|---|---|---|
| [Senninger PSR-2 10 psi, ¾ po FPT, 0,5–15 GPM (IV PR-075-L-10)](https://duboisag.com/ca_fr/regulateur-de-pression-senninger.html) | 1 | last of the kit; phase 1 = at the bib |
| [Adaptateur mâle ¾ po MPT × ¾ po insert](https://duboisag.com/ca_fr/adaptateur-male-mpt-x-insert.html) | 1 | regulator outlet → PE |
| [Boyau PE standard ¾ po × 100 pi, 75 psi (BO CO-075-75-1)](https://duboisag.com/ca_fr/boyau-flexible-standard-en-polyethylene-bobine.html) | 10 pi | |
| [Coude 90 insertion ¾ po — cédule 40](https://duboisag.com/ca_fr/insert-ell-90-1399.html) | 2 | |
| [Collier inox 304 19–29 mm, 20-pack Amazon](https://www.amazon.ca/dp/B091GJWGHQ) | 5 | 1/barb: adapter + 2 coudes × 2 |

**Water-only line** (bib PE → tee → regulator → 75 pi → week-1 valve)

| Item | Qty | Note |
|---|---|---|
| [Té insertion ¾ po — cédule 40 (II 1401007)](https://duboisag.com/ca_fr/te-insertion.html) | 1 | in the bib PE, upstream of the kit |
| [Senninger PSR-2 10 psi, ¾ po FPT (IV PR-075-L-10)](https://duboisag.com/ca_fr/regulateur-de-pression-senninger.html) | 1 | this line bypasses the main regulator |
| [Adaptateur mâle ¾ po MPT × ¾ po insert](https://duboisag.com/ca_fr/adaptateur-male-mpt-x-insert.html) | 2 | regulator in + out |
| [Boyau PE standard ¾ po × 100 pi, 75 psi (BO CO-075-75-1)](https://duboisag.com/ca_fr/boyau-flexible-standard-en-polyethylene-bobine.html) | 75 pi | |
| [Coude 90 insertion ¾ po — cédule 40](https://duboisag.com/ca_fr/insert-ell-90-1399.html) | 6 | |
| [Adaptateur mâle réduit 1 po MPT × ¾ po insert](https://duboisag.com/ca_fr/adaptateur-male-reduit-mpt-x-insert.html) | 1 | week-1 Orisha valve inlet (moved off the manifold) |
| [Collier inox 304 19–29 mm, 20-pack Amazon](https://www.amazon.ca/dp/B091GJWGHQ) | 18 | té × 3, coudes × 12, adapters × 3 |

**Main** (along the racks, week-zones 2–4)

| Item | Qty | Note |
|---|---|---|
| [Boyau PE standard ¾ po × 100 pi, 75 psi (BO CO-075-75-1)](https://duboisag.com/ca_fr/boyau-flexible-standard-en-polyethylene-bobine.html) | 50 pi | |
| [Coude 90 insertion ¾ po — cédule 40](https://duboisag.com/ca_fr/insert-ell-90-1399.html) | 2 | |
| [Collier inox 304 19–29 mm, 20-pack Amazon](https://www.amazon.ca/dp/B091GJWGHQ) | 4 | 1/barb: 2 coudes × 2 |

## Nursery fertigation (station, weeks 1–4 — phase 2)

- Lives in the nursery room off the heated line; serves
  the racks. Inserts between the bib adapter and the
  10 psi regulator: bib adapter → dual check → 50 psi
  regulator → Dosatron A → B → inline filter → 10 psi
  regulator (already installed in phase 1).

- Verify heated-line pressure ≥ 0,5 bar at the injectors.

**Fertigation station**

| Item | Qty | Note |
|---|---|---|
| Dosatron D14MZ10VFBPHY | 1 | stock A @10 %; ~1 800 landed, quote Dubois |
| Dosatron 1:100-class (D25RE2 / D14MZ2) | 1 | stock B @1 %; ~950 landed, quote Dubois |
| Dual check valve (backflow preventer) 3/4 po | 1 | first after the bib adapter (potable line) |
| [Senninger PMR 50 psi, ¾ po FPT, 2–20 GPM (IV PR-075-M-50)](https://duboisag.com/ca_fr/regulateur-de-pression-senninger.html) | 1 | Dosatron guard, after dual check |
| 100-mesh suction strainer | 1 | stock B suction line |
| Inline filter | 1 | post-injector |
| 20 L bucket with lid | 1 | stock B, daily mix |

PMR 50: 3,45 bar preset under the 85 psi Dosatron ceiling; 35 psi option if house pressure runs low.

On hand: 1× 200 L lidded drum (stock A).


## Nursery floor drain

See `nursery-floor-drain.md` — sewer tie-in, 5 900 $ CA
turnkey. Rack collectors discharge above its grate (air
gap).
