# Yield Range — Salanova nursery time-to-canopy-cap model

Predicts how many days a Salanova seedling needs to approach its
canopy-density cap, under best non-light conditions, packed-only.
Inputs: tray choice (32 or 50-cell) and supplemental-LED hours.
Outputs: canopy cap (g/plant) and the daily growth trajectory.

Math derivation, constant choices, refinement triggers, and reasoning
trail live in `derivation.md`. Rejected alternatives and historical
decisions in `learnings.md`. Empirical anchor:
`yield-range/doc/yield-range-calibration-2026-spring.md`. App-side
specs in `yield-range/app/user-stories.md`.

## Contract

### Inputs (one cohort, two-regime)
- `plateauSize` — `18`, `24`, `32`, or `50` (cells per tray; always packed end-to-end in nursery)
- `ledHours` — number 0–18, hours of supplemental LED at 200 µmol/m²/s
- `nurseryDays` — integer ≥ 1, days in nursery before transplant
- `fieldDays` — integer ≥ 1, days in field after transplant
- `fieldDensityHeadsPerM2` — number, plants per m² in field beds
- `nurseryAreaM2` — number, bench area dedicated to nursery (m²)
- `fieldAreaM2` — number, bed area dedicated to field (m²)

### Outputs
- `nurseryCanopyCapG` — biomass asymptote at packed tray density (g/plant)
- `fieldCanopyCapG` — biomass asymptote at field density (g/plant)
- `transplantWeightG` — weight at day `nurseryDays` (g/plant)
- `harvestWeightG` — weight at day `nurseryDays + fieldDays` (g/plant)
- `daysToTransplantPotential` — first integer day in nursery where
  W(d) ≥ 0.95 × `nurseryCanopyCapG`, or `null` if not reached
  (`days-to-potential-by-regime`)
- `daysToHarvestPotential` — first integer day in field where
  W(d) ≥ 0.95 × `fieldCanopyCapG`, or `null` if not reached
  (`days-to-potential-by-regime`)
- `trajectory` — array of `{ day, weight_g, regime }` from day 0
  through day `nurseryDays + fieldDays` (`trajectory-output-shape`)
- `annualYieldKg` — annual harvested kg/year at steady state
  (`annual-yield-from-throughput`)
- `bottleneckStage` — `'nursery' | 'field'`
  (`annual-yield-from-throughput`)

### Assumptions
- Trays packed end-to-end throughout the nursery regime; field at
  uniform spacing throughout the field regime. No within-regime
  spread schedule.
- All non-light stress factors fixed at 1.0 (T, T_night, CE, VPD, CO₂,
  nutrients, no disease, no bolting, no decay).
- Solar contribution = annual-average Quebec outdoor PAR DLI ×
  double-poly greenhouse transmission factor (both constants explicit
  in `data.js`; no seasonal lookup). Same bench DLI applies in both
  regimes (both stages under LEDs at Décembre).
- Days are days-from-germination (not days-from-sow).
- Steady-state continuous operation: nursery and field cohorts overlap
  in parallel, weekly harvest cadence emerges automatically.

---

## canopy-cap-is-ceiling

The growth ceiling is `canopyCapG`, a density-driven biomass
asymptote derived from Salanova breeder data. The Hochmuth root-volume
cap (cellVol × 1.6) is NOT used as the prediction ceiling.

---

## best-non-light-conditions

The integration applies no stress multipliers other than
`f_light(dliPerPlant)`. No `f_Tday`, `f_Tnight`, `f_CE`, `f_VPD`,
`f_CO2`, `f_pH` in the daily growth term.

---

## dli-annual-sun-plus-led

Bench DLI is `DLI_SUN_GH_ANNUAL_AVG_QC + (LED_PPFD × ledHours × 3600
/ 1e6)`, where `DLI_SUN_GH_ANNUAL_AVG_QC = DLI_SUN_OUTDOOR_QC_ANNUAL
× GH_LIGHT_TRANSMISSION_DOUBLE_POLY` (see
`double-poly-transmission-decomposed`). All constants live in
`data.js`. No seasonal sun lookup; single annual constant.

---

## double-poly-transmission-decomposed

Bench sun DLI is computed as `DLI_SUN_OUTDOOR_QC_ANNUAL ×
GH_LIGHT_TRANSMISSION_DOUBLE_POLY`. Both constants are declared
explicitly in `data.js`; no hardcoded post-transmission value.

---

## logistic-growth-no-decay

Daily integration:
`W(d+1) = W(d) × (1 + RGR_MAX × (1 − W/canopyCapG) × f_light(dliPerPlant(d)))`.
No senescence branch, no decay, no negative-growth flip.

---

## packed-canopy-spacing

Per-plant DLI is `dliBenchAvg × spacing_factor(d)`, where
`spacing_factor` is `1.0` for `d ≤ 14`, linearly interpolated between
`d = 14` and `d = 28`, and `0.40` for `d ≥ 28`. No spread-schedule
input.

---

## days-to-potential-by-regime

`daysToTransplantPotential` = first integer day `d ∈ [1, nurseryDays]`
where `W(d) ≥ 0.95 × nurseryCanopyCapG`, or `null` if the nursery
trajectory does not reach the threshold by day `nurseryDays`.
`daysToHarvestPotential` = first integer day
`d ∈ [nurseryDays + 1, nurseryDays + fieldDays]` where
`W(d) ≥ 0.95 × fieldCanopyCapG`, or `null` if the field trajectory
does not reach the threshold by day `nurseryDays + fieldDays`. Each
output binds to its regime's cap unambiguously; the `0.95` threshold
is shared.

---

## trajectory-output-shape

Output `trajectory` is an array of `{ day, weight_g, regime }` from
day 0 through day `nurseryDays + fieldDays` inclusive
(`nurseryDays + fieldDays + 1` entries). `regime ∈ { 'nursery',
'field' }`, transitioning from `'nursery'` to `'field'` at
`day = nurseryDays + 1`. Trajectory length is dynamic, not capped at
49 days; the legacy `TRAJECTORY_MAXIMUM_DAYS` constant in `data.js`
is repurposed as a sanity ceiling on the sum `nurseryDays + fieldDays`
(coder lane).

---

## two-regime-integrator

Daily integration spans nursery + field in a single loop running from
`day = 1` through `day = nurseryDays + fieldDays`. For
`day ≤ nurseryDays`, the step uses the nursery canopy cap (from
`CANOPY_CAP_BY_PLATEAU[plateauSize]`, `nursery-canopy-cap-by-plateau`)
and the nursery per-plant DLI share (`NURSERY_SPACING_PACKED`,
`packed-canopy-spacing`). For `day > nurseryDays`, the step uses the
field canopy cap (from `fieldCanopyCapByDensity(fieldDensityHeadsPerM2)`,
`field-canopy-cap-by-density`) and the field per-plant DLI share
(`perPlantDliShareField(weight, fieldDensityHeadsPerM2)`,
`field-per-plant-dli-share`). `RGR_MAX`, `f_light`, and the
multiplicative logistic update of `logistic-growth-no-decay` are
unchanged across the regime boundary. The function exposes
`transplantWeightG`, `harvestWeightG`, and the full per-day trajectory
tagged with regime.

---

## nursery-canopy-cap-by-plateau

`CANOPY_CAP_BY_PLATEAU` covers all four `plateauSize` values:
`{ 18: 69, 24: 52, 32: 39, 50: 25 }` (g/plant). Each entry is
`area_per_cell × FOLIAGE_HEIGHT_M × FOLIAGE_DENSITY_KG_PER_M3 × 1000`,
where `area_per_cell = 0.1525 / plateauSize` on a 1020 tray frame
(28 × 54 cm = 0.1525 m²), `FOLIAGE_HEIGHT_M = 0.10`, and
`FOLIAGE_DENSITY_KG_PER_M3 = 82`. The 50-cell value is anchored to
Salanova breeder spec sheets (cert 3); 32 / 24 / 18 follow by
holding the canopy mass-loading product (`h × ρ ≈ 8.2 kg/m²`)
constant across cell footprints. Cert 2 at 32 / 24 / 18 — same
single-anchor dependence as the 50-cell pin (only `h × ρ` is
breeder-grounded; the split into individual `h` and `ρ` is
back-derived, not independently measured). Bumps to cert 3 when
`FOLIAGE_HEIGHT_M` lands on an independent anchor (Décembre cohort
photo measurement at 50-cell d28 packed density, or a published
Salanova / butterhead canopy-height value at packed nursery
densities). Refinement triggers: cohort weighing at non-50-cell
trays (18-cell highest-priority); `FOLIAGE_HEIGHT_M` independent
anchor.

---

## field-canopy-cap-by-density

`fieldCanopyCapByDensity(fieldDensityHeadsPerM2)` returns the per-plant
cap (g) at a given field spacing:

```
fieldCanopyCapByDensity(d) =
  (1 / d) × FIELD_CANOPY_HEIGHT_M × FIELD_FOLIAGE_DENSITY_KG_PER_M3 × 1000
```

With `FIELD_CANOPY_HEIGHT_M = 0.18` and
`FIELD_FOLIAGE_DENSITY_KG_PER_M3 = 55` (geometric basis for mature
Salanova: 18 cm tall × 55 kg/m³ fresh foliage density). At 43
heads/m²: cap = 230 g/head. Cert 2 — geometric basis, no breeder
anchor at field densities; refinement trigger is first Décembre
cohort weight at the operational density.

---

## field-per-plant-dli-share

`perPlantDliShareField(weightG, fieldDensityHeadsPerM2)` returns the
share of bench DLI a single plant integrates as effective input
post-transplant:

```
perPlantDliShareField(w, d) =
  max(0.40,
      min(1.0,
          1 / (LEAF_PROJECTED_AREA_M2_PER_G × w × d)))
```

With `LEAF_PROJECTED_AREA_M2_PER_G = 0.00035` m²/g (Salanova
empirical: 200 g head ≈ 30 cm rosette ≈ 700 cm² projected leaf
area). Share holds at `1.0` until the rosette covers the per-plant
bench footprint (`w × d × LEAF_PROJECTED_AREA_M2_PER_G ≥ 1.0`), then
decays as `1 / leaf_cover`. Floor `0.40` mirrors
`NURSERY_SPACING_PACKED` (`packed-canopy-spacing`) — at full canopy closure, plants
still integrate ~40 % of bench DLI via gaps, sunflecks, and scattered
radiation. Cert 2 on both the leaf-area-per-gram constant and the
floor value; refinement trigger is cohort leaf-area measurement or
Beer-Lambert canopy modelling.

---

## annual-yield-from-throughput

`annualYieldKg` is computed at steady state from the throughput
balance between nursery output and field intake:

```
trayCellsPerM2      = plateauSize / 0.1525
nurseryOutputPerDay = (nurseryAreaM2 × trayCellsPerM2) / nurseryDays
fieldIntakePerDay   = (fieldAreaM2 × fieldDensityHeadsPerM2) / fieldDays
headsPerDay         = min(nurseryOutputPerDay, fieldIntakePerDay)
annualYieldKg       = headsPerDay × 365 × harvestWeightG / 1000
```

`bottleneckStage` returns `'nursery'` if `nurseryOutputPerDay` was
the `min`, else `'field'`. The `min` enforces that nursery cannot
supply faster than its area × density / days, and field cannot
absorb faster than its area × density / days; whichever is smaller
caps the operation.

---

## Inherited / cross-references

- App-side spec: `yield-range/app/user-stories.md`
- Empirical anchor: `yield-range/doc/yield-range-calibration-2026-spring.md`

---

## Specialist note (2026-05-17) — extension pending

Decision (Guillaume, 2026-05-16): extend yield-range to cover
nursery + field + throughput balance. Objective:
**maximize annual harvested kg**.

Model plan in `working files/yield-range-extension-draft.md` —
function signature, two-stage integrator, throughput formula,
constant list, settled + open inputs, and requirement queue.

Settled 2026-05-17: `bench_dli_mol_per_m2_per_day` (`dli-annual-sun-plus-led`
formula preserved, `ledHours` stays a dynamic operator input up to 18);
nursery cap basis (breeder-anchored, 50-cell = 25 g pinned; other
trays scaled by geometric proportion); `per_plant_dli_share_field`
shape (1.0 until rosette covers spacing, then decays with 0.40 floor,
cert 2).

Extension landing gated on the marketability constraint on head size
(commercial input — does 200 g matter or is 150-160 g sellable?
yield/m² ≈ flat across 25-50 heads/m² so density choice is
commercial, not biological). When that lands, the extension claims a
contiguous block of ledger ids (regime-switch integrator,
`annual_yield_kg` output, nursery + field cap accessors,
`per_plant_dli_share_field`, `canopy_geometry`) through
`scripts/claim-req.sh`.
