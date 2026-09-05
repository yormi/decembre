# Nursery — common infrastructure (racks + table, weeks 1–4)

Shared design for all zones: `common.md`. Served zones:
`nursery-racks.md`, `nursery-table.md`.


## Nursery water supply (bib → fill valves, weeks 1–4)

- **Phase 1 = water only.** Feed comes later by inserting
  the station (§ Nursery fertigation) between the bib
  adapter and the 10 psi regulator, all at the bib end;
  the PE run and everything downstream stay untouched.

- **Supply chain (garden hose bib = GHT, not NPT):**
  bib (¾ MHT)
  → accouplement laiton pivotant ¾ FHT × ¾ FPT
  → mamelon ¾ MPT × ¾ MPT
  → 10 psi regulator ¾ FPT at the bib (pins header at
    0,7 bar → fixed-orifice fill, no calibration; 0,5–15 GPM
    covers one zone at a time, racks ≤ 9 drops ≈ 30 L/min)
  → adaptateur ¾ MPT × ¾ insert
  → ¾ PE run to the racks (at 0,7 bar — far under the
    75 psi hose rating); buried 6 po deep, 2 pi inside
    the exterior wall = safe with the room at 15 °C 24/7;
    only a multi-day heat loss freezes it → drain the line
    (unscrew the end bouchon) if heat goes down in winter
  → adaptateur 1 po MPT × ¾ insert into the manifold inlet
  → 4× manifold 1 po (3 rack zones + nursery table)
  → Orisha fill valves (1 po), 1 per outlet
  → adaptateur 1 po MPT × ¾ insert → ¾ PE.
  GHT threads half-way into NPT and leaks — never mix them.
  Nursery-table fill valve hangs off the same regulator
  (`nursery-table.md`).

**Purchases — water supply**

| Item | Qty | Total est. ($ CA) | Note |
|---|---|---|---|
| [Accouplement laiton pivotant ¾ FHT × ¾ FPT (Dubois)](https://duboisag.com/ca_fr/fht-x-fpt-swivel-brass-coupling.html) | 1 | ~19 | swivel = threads onto the bib without rotating the chain |
| [Mamelon fileté ¾ po MPT × MPT, SCH 80 (Dubois)](https://duboisag.com/ca_fr/mamelon-pvc-filete-2211.html) | 1 | ~2 | joins the swivel's FPT to the regulator's FPT; teflon both ends; laiton quincaillerie = equivalent |
| [Senninger PSR-2 10 psi, ¾ po FPT, 0,5–15 GPM (IV PR-075-L-10)](https://duboisag.com/ca_fr/regulateur-de-pression-senninger.html) | 1 | ~20 | at the bib, after the swivel  |
| [Adaptateur mâle ¾ po MPT × ¾ po insert](https://duboisag.com/ca_fr/adaptateur-male-mpt-x-insert.html) | 1 | ~2 | regulator outlet → PE |
| [Boyau PE standard ¾ po × 100 pi, 75 psi (BO CO-075-75-1)](https://duboisag.com/ca_fr/boyau-flexible-standard-en-polyethylene-bobine.html) | 1 bobine | ~38 | bib → manifold run; measure, add a bobine if short |
| [Adaptateur mâle réduit 1 po MPT × ¾ po insert](https://duboisag.com/ca_fr/adaptateur-male-reduit-mpt-x-insert.html) | 1 | ~4 | manifold inlet; teflon on MPT, gear clamp on barb |
| [Coude 90 insertion ¾ po — cédule 40](https://duboisag.com/ca_fr/insert-ell-90-1399.html) | 10 | ~25 | turns on the bib → manifold PE run; 2 clamps each |
| [Collier de serrage inox](https://duboisag.com/ca_fr/collet-acier-inoxydable.html) ¾ po | 2 + 20 | ~50 | both PE ends + 2/coude |
| Manifold 4 sorties 1 po (irrigation, quincaillerie) | 1 | ~40 | 3 rack zones + nursery table; inlet takes the 1 po MPT × ¾ insert adapter |
| Orisha fill valves 1 po | 4 | — | 1/manifold outlet; in `common.md` § Purchases — shared |


## Nursery fertigation (station, weeks 1–4 — phase 2)

- Lives at the HPS table off the heated line; serves the
  racks + HPS table. Inserts between the bib adapter and the
  10 psi regulator: bib adapter → dual check → 50 psi
  regulator → Dosatron A → B → inline filter → 10 psi
  regulator (already installed in phase 1).

- Verify heated-line pressure ≥ 0,5 bar at the injectors.

**Purchases**

| Item | Qty | Total est. ($ CA) | Note |
|---|---|---|---|
| Dosatron D14MZ10VFBPHY | 1 | ~1 300 | stock A @10 % |
| Dosatron 1:100-class (D25RE2 / D14MZ2) | 1 | ~700 | stock B @1 %; landed price TBC |
| Dual check valve (backflow preventer) 3/4 po | 1 | ~50 | first element after the bib adapter — fertilizer injection into potable line |
| [Senninger PMR 50 psi, ¾ po FPT, 2–20 GPM (IV PR-075-M-50)](https://duboisag.com/ca_fr/regulateur-de-pression-senninger.html) | 1 | ~30 | Dosatron guard, after dual check; 3,45 bar preset, under the 85 psi ceiling; 35 psi option if house pressure runs low |
| 100-mesh suction strainer | 1 | ~30 | stock B suction line |
| Inline filter | 1 | ~70 | post-injector |
| 20 L bucket with lid | 1 | ~15 | stock B, daily mix |

On hand: 1× 200 L lidded drum (stock A).


## Nursery floor drain

See `nursery-floor-drain.md` — sewer tie-in, ~3 500 $ CA
turnkey. Rack collector + nursery-table drains discharge
above its grate (air gap).
