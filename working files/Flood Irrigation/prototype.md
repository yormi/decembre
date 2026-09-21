<!-- FROZEN 2026-09-21 — as-built record of the ordered prototype. Do not edit (enforced: .claude/settings.json deny + scripts/frozen-files-hook.sh). Design changes go to nursery-racks.md / more-nursery-space.md. -->

# Prototype — 4 trays on 2 racks + supply line

Water only (phase 1), one zone branch, 2 trays per rack.
Collector discharges into 2 × 20 L buckets (no floor drain yet).
Items and links: the files named per section.


## `nursery-common.md`

- **Bib → fertigation kit**

  - Accouplement laiton pivotant ¾ FHT × FPT × 1

  - Adaptateur ¾ MPT × ¾ insert × 2

  - PE ¾ × 10 pi

  - Coude 90 insertion ¾ × 3

  - Colliers ½–¾ × 8

- **Fertigation kit → main**

  - Senninger PSR-2 10 psi × 1

  - Adaptateur ¾ MPT × ¾ insert × 1

  - PE ¾ × 10 pi

  - Coude 90 insertion ¾ × 2

  - Colliers ½–¾ × 5

- **Main**

  - PE ¾ × 50 pi (full run, built once)

  - Coude 90 insertion ¾ × 2

  - Té insertion ¾ — later, with the table line

  - Colliers ½–¾ × 4

- **Main → table line** — skip

- **Fertigation station** — skip (phase 2)

- **Floor drain** — skip; buckets under the collector outlet


## `nursery-racks.md`

- **Tray** × 4

  - Botanicare Grow Rack Shallow Rack Tray × 4 (on hand)

  - Tray port kit × 4 (on hand)

- **Distribution** × 1

  - PE ¾ × ~10 pi (main té → branch)

  - Coude 90 insertion ¾ × 1

  - Colliers ½–¾ × 2

- **Zone branch** × 1

  - Orisha fill valve 1 po × 1

  - Adaptateur réduit 1 po MPT × ¾ insert × 2

  - PE ¾ × 10 pi

  - Coude 90 insertion ¾ × 1

  - Adaptateur femelle ¾ FPT × ¾ insert × 1

  - Bouchon galvanisé ¾ MPT × 1

  - Colliers ½–¾ × 5

  - Tray fill drop × 4

- **Drain** × 4

  - Vinyl ¾ ID × ~2,5 m (BOUGHT)

  - Adaptateur ¾ MPT × ¾ insert × 8

  - US Solid ¾ po SS NO valve × 4

  - Colliers ½–¾ × 16

- **Drain power** × 1

  - PSU 24 V 10 A × 1 (4 valves = 1 A; any 24 V ≥ 2 A does
    for the prototype)

- **Downpipe** × 2

  - PE 1½ × ~4 m

  - Té réduit insertion 1½ × 1½ × ¾ × 8 (2/shelf)

  - Colliers 40–63 mm × 16 (Glarks 20-pack)

- **Waste collection** × 1

  - ABS DWV 3 po × 7 sticks 12 pi (75 pi: 2 racks + run to
    the buckets)

  - Manchon ABS 3 po × 6, coude 45 × 1, coude 90 × 1

  - Té sanitaire ABS 3 × 3 × 1½ × 2

  - ABS 1½ stub × 2 (from 1 × 2 pi)

  - Pro-Connect raccord flexible 1½ × 2

  - Adaptateur cleanout ABS 3 po × 1

  - Bouchon mâle ABS 3 po × 1

  - Colle ABS × 1

  - Seau 20 L × 2 (under the collector outlet; 4 trays at
    2 po ≈ 150 L → empty between cycles or flood 1 po)

- **Overflow** × 4

  - Vinyl ¾ ID × ~1,6 m (BOUGHT)

  - Colliers ½–¾ × 8


## `tray-ports.md` — port kit × 4

- On hand (8 fittings, 8 screens, 8 extensions)


## `tray-drop.md` — fill drop × 4

- Valve barbée 0,18 po × 4

- MIXC ¼ po tubing × 5,6 m (1 roll)

- HORTIPOTS top-hat grommet ¼ × 4 (1 pack)

- Coude ¼ barbé × 4

- Poinçon 3 mm × 1 (on hand)

- Bouchon réparateur × 10


## `common.md`

- **Purchases — shared**

  - Orisha irrigation automation × 1 zone (fill valve
    included)

  - Wire 18/3 × 1 run (on hand; 4 drain valves in parallel)

  - Libraton ratcheting cutter × 1 (+ saw for 3 po ABS)


## Tools + consumables (not in any table)

- Pâte téflon (on hand; all MPT threads)

- Scie à métaux (on hand; 3 po ABS, cutter stops at 2½)

- Attaches zip UV extérieur × 1 pack (downpipes to rack
  corner, ¼ tubes to shelves)

- Scie-cloche ~1⅛ po (on hand; check Active Aqua fitting
  spec) — Botanicare trays are undrilled

- Mèche 3/8 po (on hand; grommet holes)

- Perceuse (on hand)

- Relais (on hand) — Orisha output switches the 24 V PSU
  line to the 4 drain valves


## Water path — bib → buckets

| Segment | Chain |
|---|---|
| Bib → PE | MHT bib → swivel FHT×FPT → adaptateur MPT×insert → PE ¾ |
| PE → regulator → PE | adaptateur → PSR-2 FPT → adaptateur |
| Main → zone branch | continuous PE off the bobine, coude → adaptateur réduit 1 po → Orisha valve → adaptateur réduit → PE ¾ |
| PE → tray | valve barbée punched → ¼ tube → grommet → coude ¼ |
| Branch end | adaptateur femelle FPT×insert + bouchon galvanisé MPT (GP-07 is a male plug) |
| Tray → downpipe | port kit → vinyl ¾ → adaptateur ¾ MPT × insert → US Solid ¾ SS → adaptateur → vinyl → té réduit 1½×1½×¾ |
| Downpipe → collector | PE 1½ (OD 1,9) → Pro-Connect 1½ → ABS 1½ stub → té sanitaire 3×3×1½ |
| Collector | ABS 3 po, cleanout + plug high end, open end over buckets |
| Power | PSU 24 V → relais (Orisha output) → 4 valves; wire 18/3 |

## Purchase list

On hand, not listed: 4 Botanicare trays, 4 port kits, Orisha zone + fill valve, relais,
vinyl ¾, poinçon 3 mm, perceuse, scie-cloche 1⅛, mèche 3/8, pâte téflon, scie à métaux, fil 18/3.

**Dubois** (free shipping ≥ 200 $; 10–15 % account discount not applied)

| Item | Code | Qty | Total ($ CA) |
|---|---|---|---|
| [Accouplement laiton pivotant ¾ FHT × ¾ FPT](https://duboisag.com/ca_fr/fht-x-fpt-swivel-brass-coupling.html) | IG BG-199S-1212 | 1 | ~19 |
| [Senninger PSR-2 10 psi ¾ FPT](https://duboisag.com/ca_fr/regulateur-de-pression-senninger.html) | IV PR-075-L-10 | 1 | ~20 |
| [Adaptateur mâle ¾ MPT × ¾ insert](https://duboisag.com/ca_fr/adaptateur-male-mpt-x-insert.html) | II 1436007 | 12 | ~19 |
| [Adaptateur mâle réduit 1 po MPT × ¾ insert](https://duboisag.com/ca_fr/adaptateur-male-reduit-mpt-x-insert.html) | II 1436131 | 2 | ~9 |
| [Boyau PE ¾ × 100 pi](https://duboisag.com/ca_fr/boyau-flexible-standard-en-polyethylene-bobine.html) | BO CO-075-75-1 | 1 | ~53 |
| [PE 1½ × 100 pi](https://duboisag.com/ca_fr/boyau-flexible-standard-en-polyethylene-bobine.html) | BO CO-150-75-1 | 1 | ~166 |
| [Coude 90 insertion ¾ — cédule 40](https://duboisag.com/ca_fr/insert-ell-90-1399.html) | II 1406007 | 9 | ~29 |
| [Bouchon galvanisé ¾ MPT (male plug)](https://duboisag.com/ca_fr/bouchon-galvanise.html) | IG GP-07 | 1 | ~3 |
| [Adaptateur femelle ¾ FPT × ¾ insert](https://duboisag.com/ca_fr/adaptateur-femelle-fpt-x-insert.html) — **not in the 2026-09-07 order** | II 1435007 | 1 | ~2 |
| [Valve barbée 0,18 po](https://duboisag.com/ca_fr/valve-barbee-en-plastique-0-18-pour-micro-tube-4-7.html) | IS 42155 | 4 | ~7 |
| [Coude ¼ barbé](https://duboisag.com/ca_fr/barb-elbow-1-4.html) | IB MI4-FEL250 | 4 | ~1 |
| [Bouchon réparateur](https://duboisag.com/ca_fr/bouchon-reparateur.html) | IB 31-AGP250 | 10 | ~10 |
| [Té réduit insertion 1½ × 1½ × ¾](https://duboisag.com/ca_fr/te-reduit-insertion.html) | II 1401210 | 8 | ~44 |
| **Dubois** | | | **~380** |

**Home Depot** — dans le panier 2026-09-08 (prix réels, Lebourgneuf, ramassage)

| Item | Qty | Total ($ CA) |
|---|---|---|
| [IPEX ABS DWV 3 po × 12 pi](https://www,homedepot,ca/product/ipex-cell-core-3-inch-x-12-feet-abs-dwv-pipe/1000120780) | 7 | 300,86 |
| [LESSO manchon ABS 3 po hub × hub](https://www,homedepot,ca/product/lesso-3-in-abs-coupling-all-hub/1000116135) | 6 | 20,88 |
| [LESSO coude 45 ABS 3 po hub × hub](https://www,homedepot,ca/product/lesso-3-in-abs-45-degree-sr-elbow-all-hub/1000421136) | 1 | 5,14 |
| [LESSO coude 90 long ABS 3 po hub × hub](https://www,homedepot,ca/product/lesso-3-in-abs-long-turn-90-degree-elbow-h-x-h/1000116337) | 1 | 6,98 |
| [LESSO té sanitaire ABS 3 × 3 × 1½](https://www,homedepot,ca/product/lesso-3-x-3-x-1-1-2-in-abs-sanitary-tee-h-x-h-x-h/1000116374) | 2 | 23,74 |
| [IPEX ABS DWV 1½ po × 3 pi (stubs)](https://www,homedepot,ca/product/ipex-cell-core-1-1-2-inch-x-3-feet-abs-dwv-pipe/1000423248) | 1 | 5,98 |
| [Pro-Connect raccord flexible 1½](https://www,homedepot,ca/product/pro-connect-flexible-coupling-11-2/1000119990) | 2 | 17,36 |
| [LESSO adaptateur cleanout ABS 3 po](https://www,homedepot,ca/product/lesso-3-in-abs-cleanout-adapter-spig-x-fipt/1000116166) | 1 | 11,84 |
| [LESSO bouchon mâle ABS 3 po MIPT](https://www,homedepot,ca/product/lesso-3-in-abs-male-plug-mipt/1000116111) | 1 | 2,04 |
| [Oatey colle ABS 473 mL](https://www,homedepot,ca/product/oatey-473-ml-abs-cement-yellow-c-/1000118514) | 1 | 15,30 |
| [Seau Home Depot 19 L](https://www,homedepot,ca/product/the-home-depot-orange-home-depot-logo-bucket-19-l/1000143871) | 2 | 8,94 |
| [Commercial Electric attaches zip UV ext, 8 po noir, 100-pack](https://www,homedepot,ca/product/commercial-electric-8-inch-uv-cable-tie-black-100-pack-/1000762529) | 3 | 21,45 |
| **Home Depot** | | **440,51** |

**Amazon.ca** — COMMANDÉ 2026-09-07 (Glarks : 2e commande 2026-09-08)

| Item | Qty | Total ($ CA) |
|---|---|---|
| [Collier inox 304 19–29 mm, 20-pack](https://www.amazon.ca/dp/B091GJWGHQ) | 3 | ~42 |
| [Glarks collier inox 304 40–63 mm, 20-pack](https://www.amazon.ca/dp/B07HL4TZWJ) | 1 | ~19 |
| [MIXC drip tubing ¼ po, 100 pi](https://www.amazon.ca/MIXC-Distribution-Tubing-Irrigation-Watering/dp/B07NZTJ29D) | 1 | ~16 |
| [HORTIPOTS grommet ¼ po, 25-pack](https://www.amazon.ca/HORTIPOTS-Grommet-Hydroponic-Systems-Irrigation/dp/B07MDNB45Y) | 1 | ~15 |
| [U.S. Solid motorized ball valve ¾ po SS full port NO](https://www.amazon.ca/dp/B0993GHNJT) | 4 | ~267 |
| WAGO 221 splicing connectors, 90-pack | 1 | ~64 |
| [PSU 24 V / 10 A](https://www.amazon.ca/Adapter-100-240V-Portable-Transformers-Security/dp/B0CDWHH2T3) | 1 | ~35 |
| [Libraton 2½ po ratcheting cutter](https://www.amazon.ca/s?k=LIBRATON+2-1%2F2+ratchet+PVC+pipe+cutter+adjustable+ranges) | 1 | ~42 |
| **Amazon.ca** | | **~500** |

**Total prototype: ~1 320 $ CA** (before Dubois 10–15 % discount ≈ -40 to -60)
