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
  ≈ 0.019 m²/g dry. Chosen so the small-LAI limit equals exactly `GROWTH_RGR·W`
  **at the day-10 anchor's stage** (week 2), whose usable DLI is the week-2
  ceiling (14), not the full `DLI_TARGET` the cotyledon-week plug cannot use.
  Derived at 14 rather than 17, SLA rises 0.015→0.019 so the day-10 rate stays
  `GROWTH_RGR`; the stressed 5 g @ d25 anchor is preserved (reproduces 4.9 g).
  Refinement trigger: first leaf-area / SLA measurement → free `SLA` and refit `k`.
- `RADIATION_USE_EFFICIENCY = 1.1 g dry/mol` PAR — clean-root, well-watered
  lettuce RUE, cert 2 literature. Used clean; the nursery under drought+heat
  uses `NURSERY_STRESS_RUE` instead.
- `NURSERY_STRESS_RUE = 0.85 g dry/mol` — effective ε for the nursery under
  drought + high heat. **Anchored, not assumed:** back-solved so a 50-cell at
  DLI 17 with plug DM 0.07 reaches 5 g (biggest) @ d25 — the real Décembre
  datum (`doc/…-2026-spring.md`, 2026-07 batch). cert 1 (single stressed
  cohort). Falls out near the domain's documented pH/EC-stress ε (0.85),
  reused for heat/drought. Applied via `nurseryStress`; the field always runs
  clean.
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

**Validation.** The anchored params reproduce the one real Décembre weight —
**5 g biggest @ d25**, 50-cell, drought+heat, DLI 17 — in both `calc.js`
(`predictYield`, `nurseryStress: true`) and the `seedling-thinning.js` chart
view, which share the constants via `data.js`. The former "16 g @ d28 / 40 g @
d35" anchors are retired (salt-stalled / unsourced;
`learnings/5g-day25-drought-heat-primary-anchor.md`). The clean-condition ε
(1.1) is unanchored — no well-watered 50-cell weighed yet.

**Light fold — age-stepped ceiling (`NURSERY_DLI_CEILING_BY_WEEK`).** The
carbon-balance gain is linear in DLI with no saturation, so the growth term
drives on `min(DLI_TARGET, nurseryLightCeiling(day))`, not a flat 17. The
ceiling is the DLI the tissue can *use* at its age — young tissue saturates
low and tipburns above it, so light past the ceiling buys no growth:

- wk1 cotyledon **10**, wk2 true-leaf **14**, wk3+ plug/field **17** — top of
  the `light/domain.md` bands (8–10 / 12–14 / ~17). Field ages sit at 17, so
  the ceiling only bites in the early nursery.
- This replaces the earlier flat-17 fold, which over-lit the cotyledon and
  true-leaf weeks — growth the fragile plug cannot realize (the `#3` fix). It
  makes the early curve slower and physiologically honest; the stressed 5 g @
  d25 anchor still lands (4.9 g) because `SPECIFIC_LEAF_AREA` is anchored at
  the week-2 ceiling.
- Below-4 stall never triggers at Décembre's lighting. Whether sun + LED
  actually *delivers* the ceiling is the lighting-feasibility concern
  (`light/`), decoupled from what the plant can use.
- **Directional only** — the 10/14/17 steps are band-tops, cert 2 from the
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
| Poly film replacement or aging | `GH_LIGHT_TRANSMISSION_DOUBLE_POLY` | at film swap (0.65 → 0.45) |
| Site pyranometer dataset | `DLI_SUN_OUTDOOR_QC_ANNUAL` | when equipment lands |
