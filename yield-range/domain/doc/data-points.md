# Data points — Décembre observations

Every measured observation behind the `yield-range/` model, in one place.

**This file holds data and the context needed to read it. Nothing else.** No
model comparison, no derivation, no fitted constants, no conclusions. Those live
in `../derivation.md` and `../learnings/`. If a line here argues rather than
records, it is in the wrong file.

**Day axis: days from sowing, day 1 = the sowing day.** Every day number below is
on this axis. Elapsed days = day − 1.

⚠ marks a problem with the datum itself, not an interpretation of it.


## Nursery — Salanova, 50-cell

**Bench labels.** `wednesday-N` = **N complete weeks since sowing**, read on the
Wednesday photo day. Confirmed across Cohorts E (16 d), G (23 d) and F (30 d),
all sown on Mondays. It does not count Wednesdays. A label plus a photo date
gives a sowing date, and vice versa.

**Shoot only**: no roots, no substrate.

### Cohort A — 2026 spring, Tray 50 test 1

Sown ≈ 2026-03-25 (week of; back-calculated). Packed end-to-end all cycle, no
spread schedule. Peat substrate ~33–35 mL/cell. Tomato-zone greenhouse.
Source: Jordane photo log.

| Date | Day | FW (g/plant) | Quality notes |
|---|---|---|---|
| 2026-04-15 | 22 | **4** | normal; one plant poisoned 2026-04-17 |
| 2026-04-22 | 29 | **16** | peak observed |
| 2026-04-30 | 37  | **10** | yellowing, white spots, stressed/crowded |


Plant-selection basis : most representative


### Cohort B — 2026 spring, second cohort

| Date | Day | FW (g/plant) | Quality notes |
|---|---|---|---|
| 2026-05-08 | ⚠ not on cohort A's axis | **12** | mold in trays, bolting |

⚠ Recorded as "≈35" while sitting 44 elapsed days after cohort A's sow date. It
is a different cohort at its own week 5. Its own sow date was not recorded.


### Cohort C — 2026-07, drought + high heat

Water-starved under high heat. Patchy heat mortality — empty cells across the
tray. Nursery-space DLI **17 mol/m²/j, assumed by decision, never measured**.
Source: Décembre operator (Guillaume), 2026-07 photos + report.

| Day | FW (g/plant) | Basis | Notes |
|---|---|---|---|
| 25 | **5** | **biggest** plant | bushy survivors, canopy locally closed; stand thinned by mortality |

Germination date not logged.


### Cohort D — 2026-07, measured light

Weekly destructive sampling — one plant removed per week, chosen as the most
**representative** of the tray, not the biggest. Stressed; severity not decomposed.
**No LED** across days 19–26. Source: Décembre operator (Guillaume), 2026-07-26 notes.

| Day | FW (g/plant) | Notes |
|---|---|---|
| 5 | below scale resolution | scale floor ~0.1 g |
| 12 | **0.5** | at the scale floor — ±20% on resolution alone |
| 19 | **1.4** | leaves already touching |
| 26 | **9.2** | |

n = 1 per timepoint; each row is an independent plant, not a tracked individual.
Germination date not logged. Cell occupancy not recorded.


### Cohort E — 2026-07, first 2.5 in pot / 32-per-tray generation

Photos: `nursery-32pot-wednesday2-2026-07-22/`. The first cohort grown on the
32-pot 2.5 in tray (the 50 g plug target adopted 2026-07-19), so the first
cohort whose tray type matches the live nursery default.

**Sown 2026-07-06** (Monday) — reported by Guillaume. The first cohort here with
a sowing date at all; every other cohort's day axis is reconstructed.

| Label | Date | Day | Observation |
|---|---|---|---|
| wednesday-2 | 2026-07-22 | 17 | 2–4 true leaves, one seedling per pot, wide bare substrate between plants; three trays on the outdoor bench |

⚠ No weight taken — this cohort is **photographic only** so far.

Label reads on the convention below: 16 days elapsed = 2 complete weeks.

This is the cohort the 50 g step-up is waiting on: a pour-through plus a tissue
weight here is what would anchor `PLUG_DRY_MATTER_FRACTION` (0.07, assumed) and
re-justify `NURSERY_STRESS_RUE`.


### Cohorts F and G — 2026-06 sowings, 50-cell, transplant-ready

Photos: `nursery-wednesday3-4-50cell-2026-07-22/` (three). Both trays
photographed **2026-07-22 19:28** (EXIF, GMT-04:00), the same walk-around as
Cohort E.

| Cohort | Label | Sown | Day on 2026-07-22 | Observation |
|---|---|---|---|---|
| F | wednesday-4 | 2026-06-22 | 31 | canopy fully closed over the tray, leaves spilling past the tray edge, no bare substrate; mixed green + red leaf; transplant-ready |
| G | wednesday-3 | 2026-06-29 | 24 | as above — the two trays are visually indistinguishable at this age |

Sowing dates reported by Guillaume. **50-cell**, also reported.

⚠ **The three photos are not attributable to one tray or the other** — both
trays appear across the set and Guillaume confirms they look the same at this
age. Treat the photos as evidence for the pair, never as a per-cohort image.

⚠ No weight taken for either cohort — photographic only, like Cohort E.

⚠ The vessels in these photos look like the deep square pots of Cohort E rather
than 50-cell plugs. Tray type here is **as reported, not as read off the
photo** — do not identify tray type from these images.


## Light


### Cohort D bench week — 2026-07, days 19 to 26

Pyranometer, sited **outside** the greenhouse. Total shortwave.

| Quantity | Value |
|---|---|
| Total over 7 days | **12 226 J/cm²** |
| Daily mean | 1 747 J/cm² = 17.47 MJ/m²/d |

Raw instrument reading. Any conversion to PAR or to a bench value depends on
assumed coefficients — see `../derivation.md`.

The only measured light figure at Décembre. Every other DLI in the model is
assumed or literature-derived.


## Canopy coverage — 2026-07-04 photos

Files: `seedling-canopy-closure-2026-07-04/`. Salanova 50-cell, two photos:
bench overview (a "day-21" tray beside "day-10" trays), and a top-down of the
"day-10" trays. Same stressed cohort as cohort A's conditions.

| Observation | Value |
|---|---|
| "day-10" 50-cell canopy coverage | ~25%, bare substrate between 2–4-leaf seedlings |

⚠ The "day 10" and "day 21" labels predate the sowing-axis convention and their
basis was not recorded. Reads coverage, not grams; resolution and camera angle
limit precision.


## Field head — 2026-07-09

File: `field-head-180g-aphids-2026-07-09.jpeg`. Single scale photo, CAS scale.
One large green-leaf/butterhead head off a light-supplemented bed.

| Quantity | Value |
|---|---|
| Fresh weight | **180 g** |
| Time in bed | ~6 weeks ⚠ |

⚠ Time in bed is a Guillaume estimate, not read from a logged transplant date.
Heavy aphid pressure on that bed. The only mature field-harvest weight recorded;
every other weight here is a nursery seedling.


## Field cut yield — 2026-07-26

Photos: `field-cut-yield-2026-07-26/`. Cut-and-come-again harvest off a
4-row mixed-Salanova bed (green + red leaf), before and after the cut.

| Quantity | Value |
|---|---|
| Cut fresh weight | **1,6 kg per 10 linear feet of bed** |
| Trim loss | very low ⚠ |
| Leaf quality | good — no tipburn or rot noted ⚠ |
| Nursery duration before transplant | 4 weeks ⚠ |

⚠ Loss and quality are Guillaume's field read, not a graded or weighed figure.
Nursery duration is a Guillaume recollection ("suspect 4 weeks instead of 5"),
not a logged transplant date; sowing date unrecorded. Bed row count is read off
the photo. This is the first **per-bed-length** yield recorded — everything
else here is a single head or a nursery seedling — and it is a cut yield, not a
whole-head harvest, so it is not comparable to the 180 g field head.


## Nursery solution — 2026 spring

| Quantity | Value |
|---|---|
| Leachate sodium | **3166 ppm** |
| Leachate EC | **5+ mS/cm** |

⚠ Date and method not recorded; carried over from the spring calibration
write-up. Method matters for EC — see `protocol/measure-ph-ec/`.


## Adding an observation

1. Append a row to the matching cohort, or start a new lettered cohort. Cell
   type, zone, stress, and plant-selection basis are part of the key — do not
   pool unlike cohorts.

2. Record on the sowing axis, day 1 = sowing. Log the **actual sowing and
   germination dates**; both are missing for every cohort above.

3. State the **plant-selection basis** — biggest, representative, or median of
   n. Cohorts C and D differ on exactly this, and it is not recoverable after
   the fact.

4. State whether the weight is shoot-only or includes roots.

5. Put the numbers here and the reasoning elsewhere. If you find yourself
   writing "which means", stop and move that sentence to `../derivation.md` or a
   learning.
