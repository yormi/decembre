# Flood irrigation automation — common (all zones)

Replace manual watering of lettuce seedlings,
sow (week 1) → transplant (week 5). Delivers plain water and
the nursery feed (`STORED_RECIPE.nursery.fertigation`).

Per-zone files: `nursery/` (weeks 1–4: `rack.md`, `water-supply.md`,
`waste.md`, `floor-drain.md`), `greenhouse/` (week 5: `table.md`,
`water-supply.md`, `waste.md`). The build: `project.md`.
Tray fill drop, identical in all zones: `tray-fill-drop.md`.
Tray drain + overflow ports, identical: `tray-ports.md`.


## Zones (from `protocol/sequence-lettuce-full-production.md`)

| Weeks | Place | Trays (+10 %) |
|---|---|---|
| 1 | Germination rack (Uline) | 31 |
| 2 | Racks week 2 (Uline) | 31 |
| 3 | Racks week 3 (Uline), spaced 2:1 | 62 |
| 4 | Racks week 4 (Uline), spaced 4:1 | 124 |
| 5 | Greenhouse nursery table | 124 |

Rack trays (4 flats each): wk 1 8 · wk 2 8 · wk 3 16 · wk 4 31 = 63 of 75.


## Shared design (all zones)

- **Delivery: flood everywhere**, one fill valve + one drain
  valve per week-zone — 6 zones (week 4 split in two). Not per-shelf, not
  per-rack. Cycle: timed fill → hold 20–30 min → drain.

- **Flood depths**: feed = 1 po (timed, stops short of
  standpipe); plain water = 2 po (weekly deep wetting,
  level capped by standpipe). Shallow feed halves the
  single-pass feed waste.

- **Single-pass, drain-to-waste.** No recirculation (organic
  feed sours, biofilm); no return line. Complete drain-back
  between cycles. No cascade between week-zones (cross-
  cohort zoospores). Rack drains: one downpipe per rack,
  valves upstream — no shared wet path between cohorts.

- **Controller**: Orisha, climate + irrigation — one output
  per valve, manual override in the app. Drain valves NO →
  powered closed during hold; power loss = trays drain.

- **Injection**: 2 stations (nursery: heated line, weeks
  1–4; greenhouse: warm tanks, week 5). Per station, in
  series: D14MZ10 @10 % = stock A (gypsum 1,4 g/L + iron
  sulfate; gypsum saturation ~2,5 g/L forces the 1:10) +
  1:100-class unit @1 % = stock B (Ocean + Acadie +
  K sulfate 29 g/L + Mg sulfate + MicroStock — all soluble
  at 100×). Rule: Ca never meets fish P at stock
  concentration. Plain-water days: Dosatron bypass switch
  off. Dosatron doses proportional to flow — zone valves
  downstream are fine; keep zone fill < 53 L/min.

- **Stock vessels**: stock B ≈ 2,5–3 L/day → 20 L bucket per
  station, mixed daily. Stock A ≈ 25–29 L/day → 200 L
  lidded drum per station, 7-day batch (~280 g gypsum/
  200 L — stir warm, dissolves slowly; mineral stock keeps).

- **Week 1 exception**: germination is water-only,
  pour-through CE < 1. Own zone on a dedicated water-only
  line that tees off before the fertigation kit
  (`nursery/water-supply.md`) — never sees feed.

- **Per-zone irrigation programs** (draft — to validate with
  tensiometer data): water demand differs per week, so each
  zone runs its own Orisha schedule; depth stays uniform
  (1 po feed / 2 po water — set by pot wetting, not plant
  size), frequency + contact time vary. Week 1: water-only,
  light flood every 2-3 d (overwatering = damping-off).
  Week 2: feed every 1-2 d, ~15-20 min contact. Weeks 3-5:
  daily feed, 20-30 min contact. Tensiometers (1/rack zone
  + greenhouse table) tune frequency from data.

- **Fill times** @50 L/min: 1 po feed ≈ 12 L/rack tray net of
  pots → wk 2 ~100 L (2 min), wk 3 ~190 L (4 min), wk 4 ~370 L
  (7,5 min); 2 po water doubles. Daily delivered: nursery
  ~660 L feed + wk 1 water, greenhouse ~250 L.

- **Week-4 zone flow**: 31 drops × 3,3 L/min ≈ 100 L/min
  exceeds the 10 psi regulator (15 GPM ≈ 57 L/min) and the
  53 L/min Dosatron ceiling → split week 4 into two valves
  (≤ 16 drops each) on the same schedule, run back to back.
  Orisha zones: 6 (wk 1 · wk 2 · wk 3 · wk 4a · wk 4b · greenhouse).

- **Fill drops (every tray, all zones)**: one design,
  `tray-fill-drop.md` — 10 psi regulator pins header at 0,7 bar,
  fixed-length ¼ po tube = orifice, ~3,3 L/min.

**Open (shared):**

- Bench test: 1 po feed flood × 20–30 min on one tray —
  confirm pots wet to mid-profile.

- Pythium mitigation: Bacillus drench AT SEEDING (watering-
  can pass over 1020s at sowing) + re-application in weekly
  feed.

**Purchases — shared (all zones)**

| Item | Qty | Total est. ($ CA) | Note |
|---|---|---|---|
| Orisha irrigation automation | 3 | 3 600 | fill valves included |
| Orisha tensiometer 6" mini | 4 | 400 | |
| Dosatron rebuild/seal kit | 1 | ~100 | spare, warranty-distance hedge |
| Wire 18/3 | — | ~100 | drain-valve runs |
| [Libraton 2½ po ratcheting cutter + spare blade + deburrer](https://www.amazon.ca/s?k=LIBRATON+2-1%2F2+ratchet+PVC+pipe+cutter+adjustable+ranges) | 1 | ~42 | one cutter for all tubing |

Cutter: ¼ drip → 2 po PVC (3 po ABS = scie); no PVC cuts below ~10 °C (shatters).


## Just in case

| Item | Qty | Note |
|---|---|---|
| Coude 45 insertion ¾ po | 3 | |
| Mamelon insertion ¾ × ¾ po (PE coupling) | 2 | joins 2 PE lengths; 2 clamps each |


## Bonus

| Item | Prix ($ CA) | Note |
|---|---|---|
| [Aquascape 82000 silicone aquarium clair, 10,1 oz](https://www.amazon.ca/s?k=aquascape+82000+silicone) | ~19 | shim drain bulkheads → no algae puddle |

Poser sur plateau sec, cure 24–48 h avant inondation.
