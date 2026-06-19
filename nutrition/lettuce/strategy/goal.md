# Goal — salanova growing protocol (mix → crop-out)

Strategy kernel part 2+3 of 3 (Rumelt: diagnosis → **guiding
policy → coherent action**). Diagnosis: `problem.md`. Mechanism +
setpoints: `../domain.md`. Forks: `learnings/`.

## Guiding policy — outrun the heat

Décembre can't cool the house (passive vents only; no active
cooling, evap out). It **can** control *where* and *how fast* the
crop grows. So:

**Grow the bolt-vulnerable nursery cold, ship a heavy de-stressed
plug, finish in a short dense bed flip, and keep GA low (cool +
unstressed) everywhere — so the heat-exposed window stays under the
bolt threshold without shade.**

Yield is booked as **kg/bed, not g/head**: head size × density
flexes by season (bigger/looser in cool months, smaller/denser/
faster in summer), respecting the canopy net-positive window
(`../domain.md` § Canopy closure).

Rules **in**: cold barn nursery, 3″-pot 40 g plug, bolt-tolerant
variety, de-salt, short bed flip, night-flush venting, HAF.
Rules **out**: shade, active/evap cooling, more marine feed,
chasing yellow with N, running it like the tomatoes
(`problem.md` § Bad strategy).

## The bolt clock — why no-shade summer works on paper

Bolting model + thresholds: `../domain.md` § Bolting (750 sensitive
→ 1250 bolt-tolerant °C·d). The clock never stops above 4 °C — the
barn *slows* it (14 °C·d/day at 18 °C vs 28 at 26 °C), it doesn't
freeze it. So the play is to spend the long phase at the slow rate
and keep the fast-rate phase short.

Peak-summer cycle, totted up:

| Phase | Length | Temp | °C·d |
|---|---|---|---|
| Barn nursery | 4 wk | 18 °C | 392 |
| Bed flip | 3 wk | 26 °C | 588 |
| **Total** | **7 wk** | | **980** |

980 < 1250 → a **bolt-tolerant line clears**; an average line
(1000) sits on the edge; a sensitive line (750) bolts. **Variety
threshold is the decisive lever**, then short bed, then cold barn,
then night-flush, then de-stress (insurance against GA-raising
stress lowering the bar).

**Read the margin as slim, not comfortable.** Two caveats
(`../learnings/bolting-thermal-time-broken-stick.md`): (1) the clock
integrates *hourly* temps — swingy summer days bank ~20% more than
this flat-24h-mean total, so the real bed figure runs higher (~700,
total ~1090) and the bolt-tolerant margin shrinks to a handful of
days; (2) the 750–1250 threshold + k=2 are **unvalidated literature
placeholders** — any bolt date is an estimate until Décembre logs
hourly temp + observed bolt date for 1–2 crops. **Conclusion:**
bolt-tolerant line + ≤3 wk bed + night-flush are **necessary, not
optional**, and the first summer crop is a calibration run.

## The protocol spine

Failures each stage must defeat: `problem.md`. Setpoints: the
referenced `../domain.md` bands — not restated here.

| # | Stage | Decision | Defeats |
|---|---|---|---|
| 1 | Tray mix | clean peat base, EC ≤1; + dolomitic lime (Ca/Mg buffer) | Mg-0.27 yellowing; pre-load Ca |
| 2 | Vehicle + variety | **3″ pot → 40 g plug**; bolt-tolerant **Salanova Hydroponic** line | light plug; bolt; tipburn |
| 3 | Nursery climate | **barn @ 18 °C + lamps** (decouple light from sun-heat) | cooked plug; bolt clock |
| 4 | Feed + leach | de-salt: cut marine feed + leach trays; 3″ media shares buffering | nursery Na (the fish) |
| 5 | Pull age | **4 wk / 40 g**, before bolt-competence | over-aged, pre-bolt plug |
| 6 | Bed prep | **OPEN** — soil salt drawdown, pH, marine-shrimp-compost question | root-hostile soil, Na 4443 |
| 7 | Transplant | **OPEN** — 2-wk shock; peat-plug ↔ calcareous-bed interface | re-root stall |
| 8 | Field climate | no shade + **night-flush venting** + HAF + short dense flip; **Ca/tipburn OPEN** | field heat; tipburn |
| 9 | Crop-out | **OPEN** — head-size × density × kg/bed math | calling it done under target |

### Stage notes (filled stages)

**Stage 2 — vehicle + variety.** 3″ pot proven 40 g/5 wk (4 wk
targeted); big root volume = head-start into the short bed flip +
media buffers salt. Reverses the earlier 50-cell call —
`learnings/crowding-is-overaging-not-cell-size.md`. Variety:
Salanova Hydroponic series (Red Oakleaf / Red Butter) bred for fast
growth + bolt + tipburn tolerance = the high-threshold line the
bolt math needs.

**Stage 3 — nursery climate.** Barn held ~18 °C all day (June 10,
vs 24.1 °C house) → cool, bolt-safe (cold never bolts lettuce,
`../domain.md` § Bolting). Lamps (200 µmol capacity) give DLI
without sun-heat → cool *and* bright, impossible under summer glass.
**Open guardrail:** seedling setpoints want root-zone 20–22 °C for
fast rooting (`../domain.md` § Seedlings); flat 18 °C barn roots
slower → possible **bottom-heat** sub-decision (warm roots, cool
air).

**Stage 8 — field climate (climate half).** No shade. Night-flush
venting to pull bed night <16 °C (kills half the day>24/night>16
bolt trigger + lowers 24 h-avg). HAF already installed (convection
+ keeps leaf-VPD a live sink + drives inner-heart Ca,
`../domain.md` § Calcium). Tipburn/Ca lever set OPEN — `../domain.md`
gives DLI_critical ≈ 24; manage DLI under it + heart HD/HAF +
foliar-Ca backstop.

## Monitoring

- bolt clock: 24 h-avg house + barn temp (you have daily) vs the  
  °C·d model

- plug: weight at pull (target 40 g/4 wk), no purpling/stretch

- salt: tray EC pen (target ≤1.0–1.2, `../domain.md` § Seedlings);  
  feed Na test still open (`problem.md`)

- field: soil EC (Bluelab Pulse) + tissue Ca/Na on the open gates

## Open (carry into next grill)

Stages 6 (bed/soil), 7 (transplant), 8-Ca/density, 9 (targets) +
the Stage-3 bottom-heat guardrail. Confirmatory gates inherited
from `problem.md`: feed Na test, good-plug trial.
