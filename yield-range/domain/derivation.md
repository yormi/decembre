# Yield Range — derivation

Why-this-number trace for the live spec entries in `spec.md`. Rejected
alternatives and superseded decisions live in `learnings.md`. Empirical
anchor (live cohort data): `doc/yield-range-calibration-2026-spring.md`.

The 2026-07-04 rewrite unified nursery + field on one carbon-balance engine
with senescence, retiring the logistic `predictNurseryYield` and its
`best-non-light-conditions` senescence exclusion (Guillaume decision
2026-07-04; see `learnings/senescence-branch-rejected-for-prediction-model.md`
for the superseded stance).

---

## carbon-balance-growth

`dW_dry/dt = ε·DLI·A_ground·(1 − exp(−k·LAI))`, `LAI = W_dry·SLA/A_ground`,
clamped to the volume cap. One Beer–Lambert interception term, no `min()`:

- small LAI (open canopy) → `fi ≈ k·LAI` → gain ≈ `ε·DLI·k·SLA·W` = `Rm·W`,
  exponential. `A_ground` cancels, so below closure equal-DLI seedlings weigh
  the same regardless of spacing (domain invariant).
- large LAI (closed canopy) → `fi → 1` → gain → `ε·DLI·A_ground`, linear.
  Crowding enters through `A_ground` alone (small cell → low ceiling; field
  spacing → big head).
- between them RGR sags smoothly from `Rm` toward 0 as the canopy fills —
  replacing the former `min(Rm·W, ε·DLI·A)` hard knee, which held `Rm` flat to
  closure and overstated growth through the LAI 1→3 band
  (`learnings/expolinear-beer-law.md`).

Constants (all from the validated seedling sandbox; `domain.md`):

- `GROWTH_RGR = 0.20 /day` — open-canopy exponential rate, now the small-LAI
  limit of the interception curve (`ε·DLI·k·SLA`). Anchored by the day-10
  open-canopy observation refuting the logistic 0.30
  (`learnings/day10-open-canopy-refutes-rm-030.md`); `SPECIFIC_LEAF_AREA` is
  back-solved from it so the anchor stays load-bearing.
- `LEAF_AREA_EXTINCTION_K = 0.7` — canopy light-extinction coefficient
  (Beer–Lambert), cert 2 lettuce literature.
- `SPECIFIC_LEAF_AREA` — **derived, not free**: `GROWTH_RGR /
  (RADIATION_USE_EFFICIENCY·NURSERY_DLI_CEILING_BY_WEEK[1]·LEAF_AREA_EXTINCTION_K)`
  = 0.01855 m²/g dry. Chosen so the small-LAI limit equals exactly `GROWTH_RGR·W`
  **at the day-10 open-canopy anchor's stage**: day 10 is sowing age 9, which
  falls in sowing-week 2 (days 8–14), whose usable DLI is the week-2 ceiling
  (14), not the full `DLI_TARGET` the cotyledon-week plug cannot use. Index `[1]`
  and its own justification **disagreed until the 2026-07-26 sowing rebase** —
  under the retired 3-day germination lag day 10 mapped to tissue age 6, band
  index 0, ceiling 10. The rebase repairs that without moving the value.
  Derived at 14 rather than 17, SLA rises 0.015→0.019 so the day-10 rate stays
  `GROWTH_RGR`.
  Refinement trigger: first leaf-area / SLA measurement → free `SLA` and refit `k`.
- `EMERGENCE_DRY_MASS_G = 0.013 g` — dry mass the photosynthetic curve starts from at `emergenceDay`, fitted (see Day axis).
  **Fitted, not weighed:** back-solved so a stressed (ε 0.85) 50-cell packed
  no-thin nursery reproduces cohort D's earliest weighed point, 0.5 g at day 12
  → **0.49 g** (0.98×). Two significant figures, against a datum sitting on a
  ±20% scale floor. A real lettuce seed is ~1 mg; started at 1 mg this engine
  reaches only 0.06 g by day 12 (8× short), because a single `ε·DLI·fi` law
  cannot represent the heterotrophic emergence phase. It is the one constant
  that absorbs emergence — as a level, not an offset (see Day axis below).
  Refit trigger: any move in `GROWTH_RGR`, either ε, the ceiling bands,
  `SPECIFIC_LEAF_AREA` or `PLUG_DRY_MATTER_FRACTION`.
- `RADIATION_USE_EFFICIENCY = 1.1 g dry/mol` PAR — clean-root, well-watered
  lettuce RUE, cert 2 literature. Used clean; the nursery under drought+heat
  uses `NURSERY_STRESS_RUE` instead.
- `NURSERY_STRESS_RUE = 0.85 g dry/mol` — effective ε for the nursery under
  drought + high heat. Originally back-solved so a 50-cell at DLI 17 with plug
  DM 0.07 reached 5 g (biggest) at day 25 — the real Décembre datum
  (`doc/data-points.md`, cohort C, 2026-07 batch). That justification is
  **withdrawn** (a biggest-plant datum cannot calibrate a mean-plant engine);
  the value is kept at the number it was fitted to before the wk3+ ceiling moved
  to 25, now unanchored. cert 1. Falls out near the domain's documented
  pH/EC-stress ε (0.85), reused for heat/drought. Applied via `nurseryStress`;
  the field always runs clean. See Validation — the raised ceiling now puts the
  stressed engine *above* that datum, the strongest argument that 0.85 is too
  high.
- Dry-matter fraction is **stage-specific**, not one value — the plug never
  reaches its volume cap (real plug ~5 g vs a 25 g cap), so DM sets its fresh
  weight *directly* (it is not the inert cap-parameter an earlier single-value
  pass assumed):
  - `PLUG_DRY_MATTER_FRACTION = 0.07` — nursery plug, firm young tissue, drier
    under drought. cert 3. This is the *same physical quantity* the nursery
    lane calls `LETTUCE_NURSERY_DM_FRACTION` (0.07); still separate consumers.
  - `DRY_MATTER_FRACTION = 0.045` — hydrated field/mature head. cert 2. DM
    steps *up* at transplant (0.07→0.045), lifting fresh weight — the
    rehydration gain.
  - Not unified: a single field 0.045 would over-state the plug ~1.56×; a
    single plug 0.07 in the field would cut field sales ~40 % in the uncapped
    short routine.
- `DLI_TARGET = 17 mol/m²/j` — the nursery-space DLI (Guillaume: the propagation
  space delivers ~17) and the field photosynthetic optimum. The growth term
  caps it at the age ceiling (see Light fold below).

**Validation.** No weight anchor is currently reproduced. All observations live
in `doc/data-points.md`; days below are on that file's axis — **sowing = day 1**,
which is also the model's axis (`calc.js`).

**Cohort C — 5 g biggest, day 25** (drought+heat, DLI assumed 17). A
*biggest-plant* datum against a mean-plant engine, so it cannot calibrate — that
is why it is a data point, not an anchor
(`learnings/5g-day25-drought-heat-primary-anchor.md`). The stressed engine now
returns **5.34 g** at day 25 — 1.07× *above* a biggest plant, in a
mortality-thinned tray, at an assumed (never measured) DLI of 17 while the engine
runs the nursery at 25. A mean-plant engine above a biggest-plant observation is
directionally wrong, and it is the strongest evidence that `NURSERY_STRESS_RUE =
0.85` is too high for the raised wk3+ ceiling. Deliberately **not** refit against
it: a recorded datum is not an anchor.

**Cohort D — measured light.** Converting the raw 12 226 J/cm² over 7 days:
1 747 J/cm²/d = 17.47 MJ/m²/d; × 0.45 PAR fraction × 4.57 µmol/J = 2.06 mol/MJ →
**35.9 mol/m²/d outside**; × `GH_LIGHT_TRANSMISSION_DOUBLE_POLY` 0.65 →
**23.3 mol/m²/d on the bench**. Both coefficients are assumptions. 35.9 is 62% of
`CLEAR_DAY_MAXIMUM_DLI_BY_MONTH[6]` = 58, between the `partly` sky factor and
clear — the first site support for that cert-2 constant. The engine had been
driving the nursery at 17, which is what moved the wk3+ ceiling to 25
(`learnings/nursery-dli-ceiling-by-stage.md`).

Against the engine:

50-cell packed, no thin, day-1 mass 0.009 g:

| Day | Observed | Stressed ε 0.85 | Clean ε 1.1 |
|---|---|---|---|
| 12 | 0.5 g | **0.49 g** (0.98×) | 0.71 g (1.42×) |
| 19 | 1.4 g | 1.88 g (1.34×) | 3.44 g (2.46×) |
| 26 | 9.2 g | 6.10 g (0.66×) | **8.34 g** (0.91×) |

**Neither ε fits all three — the gap is in the shape, not the level.** The
stressed regime reproduces the day-12 level to within 2%, which is the point
`EMERGENCE_DRY_MASS_G` is fitted to. Its day-19 over-prediction **widened from
1.06× to 1.34×** at the sowing rebase, because the wk3+ ceiling of 25 now
arrives on day 15 instead of day 18; the day-26 shortfall **narrowed from 0.58×
to 0.66×**. No choice of day-1 mass fixes day 19 — it sets the level, not the
slope, and fitting day 19 instead (0.0063 g) would put day 12 at 0.34 g, 0.66×
of a ±20% datum, worse. That spread is the honest price of reading the bands on
sowing age. Clean lands within 9% at day 26 only by over-predicting day 19 by
2.46× and starting that week 2.5× heavy.

**The per-cell energy balance is the hard constraint.** One 50-cell footprint is
30.5 cm², receiving 0.0712 mol/day at 23.3 DLI. At clean ε that caps fresh gain
at **1.119 g/day**. Cohort D's day 19 → 26 average was **1.114 g/day** — 99.6% of
a ceiling that assumes 100% interception for the whole week, from a canopy at
LAI 0.60 (~34% interception) when the week started. Integrating forward from the
*observed* 1.4 g, no ε reaches 9.2 g on measured light. Candidates, in order of
suspicion: (1) `PLUG_DRY_MATTER_FRACTION = 0.07`, set for a droughted plug and
unmeasured — the balance only becomes physical near 0.045–0.05; (2) stand
patchiness, since survivors beside empty cells intercept more than one cell's
share and the engine gives each plant exactly one; (3) the assumed 0.65
transmission.

**Canopy cover is still not reproduced**, and the rebase neither caused nor fixed
it. The 2026-07-04 photos read ~25% cover at day 10 with the tray only just
closing at day 21; the stressed engine gives **~10% cover at day 10 and closure
around day 27** (~11% and day 28 before the rebase). Same shape gap as the
weights, read on coverage instead of grams.

The former "16 g @ d28 / 40 g @ d35" anchors stay retired (salt-stalled /
unsourced). Both ε values (1.1 clean, 0.85 stressed) are unanchored.


**Day axis.** The model runs on **days from sowing, day 1 = sowing** — the same
axis as `doc/data-points.md`, so no conversion is needed anywhere. The DLI
ceiling steps on `day − 1` bucketed in sevens (days 1–7 → 10, days 8–14 → 14,
day 15 on → 25). Every day number in the code, the tests, the charts and
`doc/data-points.md` means this and nothing else.


**Germination is modelled, not assumed (2026-07-26).** Time from sowing to
emergence is an **output** of soil temperature, via thermal time:

```
germinationDays = GERMINATION_THERMAL_TIME_DEGREE_DAYS / (T_soil − GERMINATION_BASE_TEMPERATURE_C)
emergenceDay    = 1 + germinationDays
```

null — and `predictYield` throws — when `T_soil ≤ 4 °C` (nothing accumulates) or
`T_soil > 24 °C` (thermo-dormancy, `domain/propagation.md`). Light-driven gain is
zero before `emergenceDay`; the seed is heterotrophic there.

| T_soil (°C) | Days to emergence | Emergence day |
|---|---|---|
| 16 | 4.17 | 5.17 |
| 18 | 3.57 | 4.57 |
| **19.5** (default, midpoint of the 18–21 viable band) | **3.23** | **4.23** |
| 21 | 2.94 | 3.94 |
| 23 | 2.63 | 3.63 |
| > 24 | — | dormant, throws |

Base 4 °C and 50 °Cd are **cert 2 literature values for lettuce** — no Décembre
cohort has logged a sowing→emergence interval. The 19.5 °C default returns 3.2
days, which is why the retired hardcoded `GERMINATION_LAG_DAYS = 3` looked right:
it was the thermal-time answer at Décembre's own nursery temperature, frozen into
a constant. Refinement trigger: **one logged emergence date with its soil
temperature** — cohort E already has a logged sowing date, so it needs only the
emergence observation.


**What is modelled and what is still absorbed.** Emergence *timing* is physics
now; the heterotrophic *mass* transition is not:

- `EMERGENCE_DRY_MASS_G = 0.013 g` is the dry mass the photosynthetic curve
  starts from at `emergenceDay`, **fitted** to cohort D day 12 = 0.5 g (stressed
  ε, 50-cell packed, no thin).

- It is not a weighed seed. A lettuce seed is ~1 mg, and starting there this
  engine reaches only ~0.06 g by day 12 — 8× short — because a single
  `ε·DLI·fi` law cannot represent seed reserves becoming cotyledons.

- So the level still absorbs the heterotrophic phase. The honest statement is:
  **when the seed fires is modelled; how much mass appears when it does is
  fitted.** Closing that second gap needs an age-dependent
  `SPECIFIC_LEAF_AREA` — a young seedling builds thin, cheap leaves and
  intercepts far more light per gram than the engine's constant allows. That is
  the next real modelling step, and it is independent of this one.

- `EMERGENCE_DRY_MASS_G` is fitted, so it rots silently unless re-solved on
  every move of the constants listed at its bullet above, now including the
  germination constants — a warmer default shortens the growth window and the
  intercept must rise to still land on cohort D day 12.

- Trajectory days 1 to `emergenceDay` are flat at the emergence level, which is
  a placeholder for seed mass, not a prediction of it. Only the level from
  day 12 on is defended.

**Rejected — an emergence threshold on leaf area.** It needs a threshold nobody
has measured, and any value it took would be tuned to put the 3-day delay back.
Thermal time was chosen instead (see Day axis) and is a different animal: it is a
**response function**, so 3.2 days at 19.5 °C is an output, not a target. Its two
parameters are literature values that were not tuned against any Décembre datum,
and it makes a falsifiable prediction at every other temperature — 4.2 days at
16 °C, 2.9 at 21 °C, dormancy above 24 °C. One logged emergence date refutes or
confirms it. The honest caveat stands: base 4 °C and 50 °Cd are cert 2, not
measured here.

Still rejected, as hidden offsets: holding the DLI band boundaries at sowing days
11 and 18 by any means — an offset table, a `+3` in the divisor, a "stage-onset"
constant. The bands step on `day − 1` in sevens; a boundary that is not a
multiple of seven days from sowing is the lag wearing a different hat. Note the
emergence gate does NOT move them: it zeroes gain before emergence, it does not
shift what week a day belongs to.

**Light fold — age-stepped ceiling (`NURSERY_DLI_CEILING_BY_WEEK`).** The
carbon-balance gain is linear in DLI with no saturation, so the nursery growth
term drives on `nurseryLightCeiling(day)`, not a flat 17 (the field drives on
`DLI_TARGET`). The
ceiling is the DLI the tissue can *use* at its **age from sowing** — young tissue
saturates low and tipburns above it, so light past the ceiling buys no growth:

- wk1 cotyledon **10** (days 1–7), wk2 true-leaf **14** (days 8–14) — tops of
  the `light/domain.md` bands (8–10 / 12–14). wk3+ plug **25** (day 15 on),
  deliberately above the band: a Décembre 50-cell converted a measured
  23.3 mol/m²/j bench DLI in week 4 without tipburn (pyranometer, July, no LED),
  which is nursery week 4 on either age reading. Field ages drive on
  `DLI_TARGET`, so the nursery ceiling never touches field predictions.
- The bands are named by **developmental stage** in `light/domain.md` ("week 1
  cotyledon", "week 2+ true leaves + roots", "≥2–3 wk plugs tolerate full
  bed-level DLI"), and propagators count those weeks from sowing — nobody logs
  germination, which is why the retired lag had to be assumed at all. At the
  18–21 °C germination band lettuce emerges day 2–4 and cotyledons are the
  operative tissue through ~day 7, so sowing-week 1 **is** the cotyledon week
  and contains emergence by construction; true leaves from ~day 10 put
  sowing-week 2 in the true-leaf band.
- Weak point: sowing-week 3 starting on **day 15** at 25 mol. Cohort E showed
  only 2–4 true leaves at day 17, which is not obviously a hardened plug;
  `light/domain.md`'s own "≥2–3 wk" is fuzzy enough to cover it, so the values
  hold. Refinement trigger: a measured light response or a tipburn observation
  between days 15 and 21.
- This replaces the earlier flat-17 fold, which over-lit the cotyledon and
  true-leaf weeks — growth the fragile plug cannot realize (the `#3` fix). It
  makes the early curve slower and physiologically honest. `SPECIFIC_LEAF_AREA`
  is anchored at the week-2 ceiling, so raising the wk3+ step left the day-10
  open-canopy anchor untouched.
- Below-4 stall never triggers at Décembre's lighting. Whether sun + LED
  actually *delivers* the ceiling is the lighting-feasibility concern
  (`light/`), decoupled from what the plant can use.
- **Directional only** — the 10/14/25 steps are band-tops, cert 2 from the
  light domain, not a Décembre light-response measurement. Refinement trigger:
  a staged-DLI nursery cohort weighed weekly.
- See `learnings/nursery-dli-ceiling-by-stage.md`.

---

## canopy-closure-detection / senescence-past-closure

Closure = the step where `LAI ≥ 3` (`fi ≥ 0.88`) — the canopy fully shades its
ground and growth is light-limited. (The old cliff bound at `LAI = 1/k ≈ 1.4`,
an artifact of the `min()`; the Beer–Lambert form lets closure sit at the
physical LAI≈3 the domain names.) `daysClosed` counts consecutive closed days
and resets when the canopy re-opens — a checker-thin or transplant
doubles/swaps `A_ground` and drops `LAI` back below 3, and a senescing plant
shrinks back below the closure LAI. So thinning *early* (before the plant
outgrows even the doubled area) delays senescence; thinning a plant already
large past closure does not rescue it.

`SENESCENCE_ONSET_DAYS = 1.7` and `SENESCENCE_DECLINE_RATE = 0.04 /day` —
**UNCALIBRATED, cert 1.**

Mechanism modeled: **crowding self-shading only.** Once the canopy holds
`LAI ≥ 3` long enough, its lower/inner leaves sit below the light compensation
point, respire net-negative, senesce and die. Loose-leaf Salanova is picked
leaf-by-leaf, so each dead leaf is lost sellable mass — the `−DECLINE·W`
biomass-loss form is correct for this product (not a whole-head marketability
haircut). Crowding recurs in the field (a held bed self-shades the same way),
so this is the durable driver the labor-routine tradeoff needs.

Salt is deliberately **excluded**: it is being driven to safe (nursery
salt-flush, CE cap 1.0), so it is an input at optimum, not a modeled decline.

Anchor is an **upper bound, not a clean fit.** The only decline datum is the
spring cohort: 16 g → 10 g over d28–d35 = ~−0.066/day — but that is crowding
**+ salt (Na 3166 ppm, leachate EC 5+) + heat/bolting** combined. With no
clean-salt cohort to decompose it, the crowding-only rate is unknown, bounded
above by 0.066/day. `0.04` is held as a placeholder below that ceiling.

Onset was `7` under the old `min()` cliff (closure at effective LAI≈1.4).
Moving closure to the physical `LAI ≥ 3` pushes field closure to the very end
of the 2-week window, so the plant then oscillates around LAI 3 (senescence
shrink re-opens the canopy, growth resumes). Onset was retuned `7 → 1.7` to
keep the labor-routine tradeoff *directional* (hold longer → lose more).

**Caveat — the strict 2wk<3wk<4wk ordering is now phase-sensitive.** With
closure at the end of the 2-week window and the LAI-3 oscillation, the
directional signal is robust only for *over-holding past the closure peak*
(4wk < 3wk). Whether the 2-week harvest reads below the 3-week one depends on
where the oscillation phase falls, which `1.7` tunes. Together onset + rate
keep the tradeoff directional, not quantitative.

**Refinement triggers:**

- First **salt-controlled** held cohort (nursery 50-cell or field bed) weighed
  serially past closure → sets the crowding-only `SENESCENCE_DECLINE_RATE` and
  `SENESCENCE_ONSET_DAYS`, replacing the salt-contaminated upper bound.
- First field cohort at harvest vs `harvestWeightG` at the operational spacing
  + routine → cross-checks the rate.

---

## nursery-canopy-cap / field-canopy-cap-by-density

Volume cap = ground area × canopy mass-loading (height × foliage density).

- Packed nursery: 0.10 m × 82 kg/m³ = 8.2 kg/m². 50-cell (0.00305 m²) → 25 g.
- Spaced (post-thin / field): 0.18 m × 55 kg/m³ = 9.9 kg/m². 43 heads/m²
  (0.0233 m²) → 230 g.

cert 2 — only the mass-loading product is breeder-grounded; the split into
individual height and density is back-derived. Total kg/m² of canopy is set by
the areal loading, so kg/bed is ~flat across spacing configs; density trades
head size for head count. Refinement trigger: first Décembre cohort weight at
the operational density (field) or non-50-cell tray (nursery).

---

## field-spacing-config

Density = `rows / (BED_WIDTH_M × inRowInch × IN_TO_M)`. The bedtop width
(30 in = 0.762 m) is divided by the row count to place rows; the in-row step
sets plants per row-metre. Example 5r × 6": `5 / (0.762 × 0.1524) = 43.1`
heads/m². Geometric, cert 3.

---

## labor-routine-cadence / throughput-and-sales

The 4 beds run as a rotation: a bed is cut and replanted every `fieldDays`, so
one bed's worth of heads leaves the field every `fieldDays` days. Steady state
gives Little's law throughput:

- `bedsPerWeek = BED_COUNT ÷ (fieldDays / 7)` — 4 beds ÷ cycle-weeks.
- `headsPerWeek = bedsPerWeek × headsPerBed`; kg/week = heads × harvest weight.
- Monthly = weekly × 52/12; yearly = weekly × 52; sales = yearly × `PRICE_PER_KG`.
- `traysInNursery = (heads/day) × Σ trays-per-head over nursery age`. Every day
  `heads/day` seedlings sit at each age 0..`nurseryDays`; post-thin ages occupy
  2× trays. So the integral is `nurseryDays/cells` (no thin) or
  `thinDay/cells + (nurseryDays − thinDay)·2/cells` (thin).

`BED_AREA_M2 = 0.762 × 30.48 = 23.23 m²` (30 in × 100 ft). `PRICE_PER_KG = 25`
(Salanova wholesale, Guillaume input 2026-07-04).

---

## Supplemental-lighting feasibility — double-poly transmission

Bench sun DLI = `clearDayMax × conditionFactor × GH_LIGHT_TRANSMISSION_DOUBLE_POLY`.
Two explicit constants, not one baked-in composite, so a film swap or aging
touches one value:

- `DLI_SUN_OUTDOOR_QC_ANNUAL = 30 mol/m²/d` — Quebec annual-average outdoor PAR
  DLI; cert 2 from public climate summaries.
- `GH_LIGHT_TRANSMISSION_DOUBLE_POLY = 0.65` — PAR transmission, fresh/clean
  6-mil double-poly; cert 3 (published 0.50–0.65 fresh; ~0.45 aged). Update at
  film swap.
- `LED_PPFD = 200 µmol/m²/s` — installed bench capacity; cert 4 datasheet.
- `SKY_CONDITION_FACTORS` — day-type attenuation (sunny 1.0 / partly 0.60 /
  cloudy 0.25), cert 2.

---

## Refinement triggers (consolidated)

| Trigger | Refines | When |
|---|---|---|
| First field cohort harvest weight vs `harvestWeightG` | `SENESCENCE_DECLINE_RATE`; `RADIATION_USE_EFFICIENCY` | at first field weigh-in |
| Serial weights across a held bed | `SENESCENCE_ONSET_DAYS` | when a bed is sampled over its cycle |
| Cohort weight at non-50-cell tray / operational field density | `FOLIAGE_HEIGHT_M`·density split; field cap | per calibration doc "add observations" |
| Salanova-specific RGR primary source | `GROWTH_RGR` | when the doc lands |
| First leaf-area / SLA measurement | `SPECIFIC_LEAF_AREA`, `LEAF_AREA_EXTINCTION_K` | when a cohort's leaf area is measured |
| Any move in `GROWTH_RGR`, either ε, the ceiling bands, `SPECIFIC_LEAF_AREA`, `PLUG_DRY_MATTER_FRACTION`, or the germination constants | `EMERGENCE_DRY_MASS_G` — re-solve against cohort D day 12 | in the same edit, or the fit rots |
| Measured light response or tipburn observation between days 15 and 21 | `NURSERY_DLI_CEILING_BY_WEEK` wk3+ onset day | when a staged-DLI cohort is weighed |
| Poly film replacement or aging | `GH_LIGHT_TRANSMISSION_DOUBLE_POLY` | at film swap (0.65 → 0.45) |
| Site pyranometer dataset | `DLI_SUN_OUTDOOR_QC_ANNUAL` | when equipment lands |
