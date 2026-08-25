# Yield Range — Salanova carbon-balance yield model

Predicts a Salanova cohort from sowing through field harvest on a
single carbon-balance growth engine, then rolls the per-plant harvest
weight into the operation's throughput: kg/month, yearly sales, and trays
held in the nursery at a time.

Growth law: `dW_dry/dt = ε·DLI·A_ground·(1 − exp(−k·LAI))`,
`LAI = W_dry·SLA/A_ground`, clamped to the canopy-volume cap; once the canopy
has been closed past an onset net gain stalls to 0 (senescence plateau).
Nursery and field are the same law with different ground area per plant.

Math derivation and constant choices live in `derivation.md`. Rejected
alternatives and superseded decisions live in `learnings.md`. Empirical
anchor: `doc/yield-range-calibration-2026-spring.md`. Domain model:
`domain.md`. App-side specs: `app/user-stories.md`. Supplemental-lighting
page: `light/`.

## Contract

### Inputs (`predictYield`)
- `fieldSpacingKey` — one of `FIELD_SPACING_CONFIGS` keys (`field-spacing-config`)
- `laborRoutineKey` — one of `LABOR_ROUTINES` keys (`labor-routine-cadence`)
- `nurseryTrayCells` — `50`, `32`, or `18` (`nursery-tray-config`)
- `thinEvents` — `[{ day, areaFactor }]`, days strictly ascending in
  `[1, nurseryDays]`, factors ≥ 1 and non-decreasing (absolute × the base
  cell area, not compounding); `[]`/omitted = no thin (`nursery-tray-config`)
- `nurseryDays` — integer ≥ 1, days in nursery before transplant
- `nurseryStress` — boolean (default `false`); `true` = drought + high-heat
  nursery (reduced ε, unanchored), `false` = clean/well-watered
  (`carbon-balance-growth`)

### Outputs
- `density` — field planting density (heads/m²), from the spacing config
- `fieldDays`, `bedsPerWeek` — from the labor routine
- `headsPerBed` — `BED_AREA_M2 × density`
- `nurseryCapPackedG`, `nurseryCapSpacedG`, `fieldCapG` — volume caps
  (g/plant); `nurseryCapSpacedG` at the final thin factor, = packed when
  never re-spaced
- `transplantWeightG` — fresh weight at day `nurseryDays` (g/plant)
- `harvestWeightG` — fresh weight at day `nurseryDays + fieldDays` (g/plant)
- `trajectory` — `{ day, weight_g, regime }` from day 1 to `nurseryDays + fieldDays` (`carbon-balance-growth`)
- `headsPerWeek`, `kgPerWeek`, `kgPerMonth`, `kgPerYear`, `yearlySalesDollars`, `traysInNursery`, `traysSeededPerWeek`, `traysByNurseryWeek` (`throughput-and-sales`)

### Assumptions
- Steady-state weekly rotation: one bed's cohorts cut and replanted on the
  labor cadence; nursery and field cohorts overlap in parallel.
- Growth DLI = the age ceiling in the nursery, `DLI_TARGET` in the field.
  Whether sun + LED reaches `DLI_TARGET` is the lighting-feasibility concern
  (`light/`), not a growth input.
- All non-light stress (VPD, CE, nutrients, disease) fixed at optimum except
  the emergent crowding/senescence the engine models — and the nursery
  drought+heat regime exposed by `nurseryStress` (unanchored — see
  `learnings/5g-day25-drought-heat-primary-anchor.md`).
- **Days are days from sowing, day 1 = the sowing day** — the same axis as every observation in `doc/data-points.md`, so no conversion is ever needed. **Time to emergence is modelled, not assumed**: `germinationDaysFromSoilTemperature(T)` = `GERMINATION_THERMAL_TIME_DEGREE_DAYS / (T − GERMINATION_BASE_TEMPERATURE_C)`, null below the base temperature and above `GERMINATION_INHIBITION_TEMPERATURE_C` (thermo-dormancy → `predictYield` throws). Light-driven gain is zero before `emergenceDay = 1 + germinationDays`. The nursery DLI ceiling steps on `day − 1`. `EMERGENCE_DRY_MASS_G` is the mass at emergence — a fitted level, not a weighed seed (`derivation.md` Day axis).
- Bed geometry: 4 beds, 30 in × 100 ft each (`BED_AREA_M2 = 23.23 m²`).

---

## carbon-balance-growth

Per-plant dry mass integrates in `GROWTH_STEP_DAYS` steps:

```
ε         = nursery ∧ nurseryStress ? NURSERY_STRESS_RUE : RADIATION_USE_EFFICIENCY
DM        = nursery ? PLUG_DRY_MATTER_FRACTION : DRY_MATTER_FRACTION
LAI       = W_dry × SPECIFIC_LEAF_AREA / A_ground
fi        = 1 − exp(−LEAF_AREA_EXTINCTION_K × LAI)
DLI_use   = nursery ? nurseryLightCeiling(day) : DLI_TARGET   # sowing-age ceiling: wk1 10 · wk2 14 · wk3+ 25
gain      = ε × DLI_use × A_ground × fi
net_dry   = daysClosed < SENESCENCE_ONSET_DAYS ? gain : 0
W_dry     = clamp(W_dry + net_dry × dt, 0, capFresh × DM)
W_fresh   = W_dry / DM
```

`ε` and `DM` are **stage-specific**. Nursery: plug DM (`0.07`, firm/dry) and,
when `nurseryStress`, the drought+heat ε (`NURSERY_STRESS_RUE = 0.85`) — the
pair no longer reproduces a weight anchor; 0.85 keeps the value it was fitted
to at DLI 17, before the wk3+ ceiling moved to 25.
Field: hydrated head DM (`0.045`) and clean ε (`1.1`). DM steps *up* at
transplant (nursery→field), lifting `W_fresh` — the rehydration gain. The plug
never reaches its volume cap, so plug DM sets its fresh weight directly.

`fi` is the fraction of light the canopy intercepts (Beer–Lambert). Open
canopy (small `LAI`) → `fi ≈ k·LAI` → gain ≈ `GROWTH_RGR × W` → exponential;
`SPECIFIC_LEAF_AREA` is derived so this limit is exact. Leaves fill the ground
→ `fi → 1` → gain → `ε × DLI_use × A_ground`, linear, slowing → volume cap.
RGR sags smoothly from `GROWTH_RGR` toward 0 across the band — no hard knee.
The light response folds into `ε × DLI_use` (no separate `f_light`
multiplier), where `DLI_use` is the DLI the plant can use at its age —
`nurseryLightCeiling(day)` in the nursery, stepping on sowing weeks — 10
(cotyledon, days 1–7) → 14 (true-leaf, days 8–14) → 25 (plug, day 15 on);
`DLI_TARGET` in the field. Light past the
stage ceiling buys no growth; this slows the early nursery to what the fragile
plug can realize and lets a hardened plug convert above the LED target
(derivation Light fold). `A_ground = areaFactor × TRAY_FRAME_M2 /
nurseryTrayCells` in the nursery — `areaFactor` = the latest `thinEvents`
factor (1 before any) — `1 / density` in the field. `trajectory` samples
integer days 1..`nurseryDays + fieldDays`, tagged `nursery` for
`day ≤ nurseryDays` else `field`.

---

## canopy-closure-detection

The canopy is "closed" on any step where `LAI ≥ LAI_CLOSURE` (= 3, `fi ≈
0.88`) — leaves fully shade the ground and growth is light-limited.
`daysClosed` accumulates while closed and **resets to 0** when the canopy
re-opens — which happens when ground area jumps (a thin event multiplies it;
transplant swaps tray area for field spacing).

---

## senescence-past-closure

Once `daysClosed ≥ SENESCENCE_ONSET_DAYS`, net growth **stalls to 0** —
**crowding** stall: a canopy held closed too long self-shades its lower/inner
leaves below the light compensation point; new-leaf gain is offset by
lower-leaf loss, so the head plateaus rather than gaining or losing mass.
Salt is **not** modeled: it is an input driven to safe (nursery salt-flush),
not a growth term. A longer labor routine therefore never *loses* yield — a
bed held past closure just stops accumulating. `SENESCENCE_ONSET_DAYS` is
**uncalibrated (cert 1)** — no clean crowding-only datum.

---

## field-spacing-config

`FIELD_SPACING_CONFIGS` is seven `{ key, label, rows, inRowInch }` options
(`6r × 4"` … `3r × 10"`). `fieldDensityFromConfig(config)` returns
`rows / (BED_WIDTH_M × inRowInch × IN_TO_M)` heads/m². Total kg/bed is ~flat
across configs (mass-loading dominates); density trades head size for count.

---

## labor-routine-cadence

`LABOR_ROUTINES` is three `{ key, label, fieldDays, cutDays }` options: 2/3/4
weeks per bed → `fieldDays` 14/21/28. `bedsPerWeek = BED_COUNT ÷ (fieldDays / 7)`
= 2.0 / 1.33 / 1.0.

---

## nursery-tray-config

`nurseryTrayCells ∈ {50, 32, 18}` sets nursery ground area per plant
(`TRAY_FRAME_M2 / cells`) and heads per transport tray. Each `thinEvents`
entry re-spaces the cohort to `areaFactor ×` the base cell area from its day
on (absolute, not compounding; survivors occupy `areaFactor ×` trays — see
`throughput-and-sales` trays).

---

## nursery-canopy-cap

`nurseryCapPackedFresh(cells) = (TRAY_FRAME_M2 / cells) × FOLIAGE_HEIGHT_M ×
FOLIAGE_DENSITY_KG_PER_M3 × 1000` (packed, 0.10 m × 82 kg/m³).
`nurseryCapSpacedFresh(cells, areaFactor)` uses `areaFactor ×` the base area
at field geometry (0.18 m × 55 kg/m³) — the post-thin ceiling. cert 2,
geometric; only the mass-loading product is breeder-grounded.

---

## field-canopy-cap-by-density

`fieldCanopyCapByDensity(d) = (1 / d) × FIELD_CANOPY_HEIGHT_M ×
FIELD_FOLIAGE_DENSITY_KG_PER_M3 × 1000`. With 0.18 m × 55 kg/m³: at 43
heads/m² → 230 g/head. Monotonic decreasing in `d`. cert 2, geometric; no
breeder anchor at field densities. Refinement trigger: first Décembre cohort
weight at the operational density.

---

## throughput-and-sales

Steady weekly rotation (Little's law):

```
headsPerBed        = BED_AREA_M2 × density
headsPerWeek       = bedsPerWeek × headsPerBed
kgPerWeek          = headsPerWeek × harvestWeightG / 1000
kgPerMonth         = kgPerWeek × 52 / 12
kgPerYear          = kgPerWeek × 52
yearlySalesDollars = kgPerYear × PRICE_PER_KG
traysInNursery     = (headsPerWeek / 7) × trayDayIntegral × (1 + NURSERY_BACKUP_FRACTION)
traysSeededPerWeek = headsPerWeek / cells × (1 + NURSERY_BACKUP_FRACTION)
traysByNurseryWeek = [{ week, trays }] for week 1..⌈(nurseryDays − 1) / 7⌉,
                     trays = traysSeededPerWeek × areaFactor at the week's
                     start day ((week − 1) × 7 + 1)
```

Every tray count carries the `NURSERY_BACKUP_FRACTION = 0.10` sowing margin
(germination misses, culls); heads/kg/sales do not — backup plants are not
sold.

`trayDayIntegral` = Σ over the `thinEvents` segments of
`segmentDays × areaFactor / cells` (factor 1 from day 0 to the first event;
a re-spaced cohort occupies `areaFactor ×` trays). No events →
`nurseryDays / cells`. `PRICE_PER_KG = 25 $/kg`.

---

## Supplemental-lighting feasibility (Lumière page)

Whether sun + LED can hit `DLI_TARGET` on a given day — the growth engine
assumes it does. `benchSunDli(clearDayMax, conditionFactor) = clearDayMax ×
conditionFactor × GH_LIGHT_TRANSMISSION_DOUBLE_POLY`; both constants explicit
in `data.js` (no baked-in post-transmission value). `supplementalLedHours(benchSunDli,
DLI_TARGET)` = LED hours to close the gap, floored at 0; capped healthily at
`MAXIMUM_HEALTHY_PHOTOPERIOD_HOURS`. `ledDli(hours)` = DLI the fixture
delivers. `SKY_CONDITION_FACTORS` and `CLEAR_DAY_MAXIMUM_DLI_BY_MONTH` feed
the operator table. Consumed by `light/operator/`.

---

## Inherited / cross-references

- App-side spec: `app/user-stories.md`
- Domain model: `domain.md`
- Empirical anchor: `doc/yield-range-calibration-2026-spring.md`
