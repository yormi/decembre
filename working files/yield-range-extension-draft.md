# Yield-range extension — model plan draft (2026-05-17)

Pre-spec draft. Lives here until requirements land.

Decision (Guillaume, 2026-05-16): extend yield-range to cover
nursery + field + throughput balance. Objective:
**maximize annual harvested kg**. Daily grain throughout (no
weekly aggregation).

Commercial context (Guillaume, 2026-05-17): sells in bulk
(kg), not per head — no marketability floor on individual
weight. Harvest cadence weekly with continuous availability
(every week some heads ready, not necessarily all heads).
Weekly cadence is automatic in continuous-process operation at
steady state; not an explicit model constraint.

Geometry (fixed inputs for Décembre): `nursery_area_m2` ≈ 11.6,
`field_area_m2` ≈ 104.5, `field_density_heads_per_m2` = 43
(5 rows × 6" × 6" on 30" bedtops). Tray frame = 1020
(28 × 54 cm = 0.1525 m²).

## Function signature

```
predictAnnualYield({
  // Geometry
  nursery_area_m2,
  field_area_m2,
  field_density_heads_per_m2,

  // Plant / tray
  tray_cell_count,                // 18 | 24 | 32 | 50
  tray_cells_per_m2,              // = cells / 0.1525
  nursery_canopy_cap_g,           // f(tray_cell_count)
  field_canopy_cap_g,             // f(field_density_heads_per_m2)

  // Light
  bench_dli_mol_per_m2_per_day,   // sun_transmitted + LED

  // Schedule (optimization knobs, days)
  nursery_days,
  field_days,
}) → {
  transplant_weight_g,
  harvest_weight_g,
  heads_per_year,
  annual_yield_kg,
  bottleneck_stage,               // 'nursery' | 'field'
  nursery_trajectory_g_per_day,
  field_trajectory_g_per_day,
}
```

## Constants (live in `data.js`)

```
relative_growth_rate_max_per_day              // existing 0.40
germinated_weight_g                           // existing 0.015
per_plant_dli_share_nursery(day)              // existing curve
per_plant_dli_share_field(weight_g, density)  // new (see below)
f_light(per_plant_dli)                        // existing
nursery_canopy_cap_by_tray_cells              // new (geometric)
field_canopy_cap_by_density                   // new (geometric)
canopy_geometry                               // new (regime → h, ρ)
leaf_projected_area_m2_per_g                  // new (empirical)
```

## Canopy-cap formula

```
canopy_cap_g(area_per_plant_m2, regime) =
    area_per_plant_m2
  × canopy_height_m_at_regime
  × foliage_density_kg_per_m3_at_regime
  × 1000
```

### Regime constants

Nursery anchored to breeder (50-cell = 25 g) by Guillaume's
ruling 2026-05-17. Geometric height × density product scaled to
match (h × ρ = 820 vs first-pass geometric 400 — equivalent to
~10 cm × 82 kg/m³ or 12 cm × 68 kg/m³, representing luxury
elongation past geometric canopy closure that the breeder figure
captures). Field stays geometric (no breeder anchor available);
literature ranges (200–250 g at 40/m² for Salanova) corroborate
the geometric estimate.

```
canopy_geometry = {
  nursery: {
    canopy_height_m: 0.10,          // breeder-anchored
    foliage_density_kg_per_m3: 82,  // breeder-anchored
  },
  field: {
    canopy_height_m: 0.18,          // 18 cm mature Salanova head
    foliage_density_kg_per_m3: 55,  // denser at maturity
  },
}
```

Cert 3 nursery (breeder anchor + geometric scaling).
Cert 2 field (geometric only; refinement trigger = first cohort
weights at 43/m²).

### Nursery cap by tray cells (1020 frame, breeder-anchored)

```
area_per_cell_m2 = 0.1525 / tray_cell_count

nursery_canopy_cap_by_tray_cells = {
  50: 25,   // 30.5 cm²/cell × 0.10 m × 82 kg/m³
  32: 39,   // 47.7 cm²/cell × 0.10 m × 82 kg/m³
  24: 52,   // 63.5 cm²/cell × 0.10 m × 82 kg/m³
  18: 69,   // 84.7 cm²/cell × 0.10 m × 82 kg/m³
}
```

50-cell pinned to breeder; 32 / 24 / 18 derived by scaling the
breeder h × ρ across cell footprints. Cert drops to 2 for
non-50-cell trays — no direct breeder data, geometric
proportionality only.

### Field cap by density

```
area_per_plant_m2 = 1 / field_density_heads_per_m2

field_canopy_cap_by_density(43) =
  (1/43) × 0.18 × 55 × 1000 = 230 g/head
```

| Density (heads/m²) | Area/plant (m²) | Cap (g/head) |
|--------------------|-----------------|--------------|
| 25                 | 0.040           | 396          |
| 30                 | 0.033           | 330          |
| 36                 | 0.028           | 275          |
| 43                 | 0.023           | 230          |
| 50                 | 0.020           | 198          |

Practical operating weight ≈ 0.7–0.8 × cap (logistic flattens
before asymptote). At 43/m²: harvest ≈ 160–185 g. Per-m² yield
is roughly flat across 25–50 heads/m² (smaller heads × more
heads ≈ same kg/m²) — density choice should be driven by
marketability constraints on head size, not yield maximization.

## Per-plant DLI share — field regime

Starts at 1.0 (no canopy interaction), decays once leaf rosette
fills its bench footprint.

```
leaf_projected_area_m2_per_g = 0.00035
  // Salanova empirical: 200 g head ≈ 30 cm rosette ≈ 700 cm²

leaf_projected_area_m2(weight_g) =
    leaf_projected_area_m2_per_g × weight_g

per_plant_dli_share_field(weight_g, density) =
    max(0.40,
        min(1.0,
            1 / (leaf_projected_area_m2(weight_g) × density)))
```

Floor 0.40 borrowed from `NURSERY_SPACING_PACKED` (existing
packed-canopy shared-light efficiency for lettuce in tray
nursery, REQ-116). Underlying assumption: at full canopy
closure, each plant integrates ~40 % of bench DLI as effective
input — light penetrates the canopy through gaps, sunflecks,
scattered radiation, so per-plant share is never reduced to
zero. Field at 43/m² vs packed 328/m²: ~8× sparser → less
mutual shading (floor argues higher, 0.45–0.55); but mature
heads taller → more self-shading (floor argues lower,
0.30–0.40). Net same-order; 0.40 is defensible starting value.
Cert 2 on the floor value; cert 2 on the 0.00035 m²/g
leaf-area constant. Refinement trigger: Beer-Lambert canopy
modelling or measured in-bed PAR.

Sanity check at 43 heads/m²:
- 50 g head: 0.0175 × 43 = 0.75 < 1 → share = 1.0 (no closure)
- 100 g head: 0.035 × 43 = 1.51 → share = 0.66
- 200 g head: 0.070 × 43 = 3.01 → share = 0.40 (floor)

Canopy closes around 65 g head weight at 43/m².

## Stage 1 — nursery growth integral (daily)

```
weight = germinated_weight_g
for day in 1..nursery_days:
  share = per_plant_dli_share_nursery(day)
  per_plant_dli = bench_dli_mol_per_m2_per_day × share
  weight *= 1
          + relative_growth_rate_max_per_day
          × (1 − weight / nursery_canopy_cap_g)
          × f_light(per_plant_dli)
transplant_weight_g = weight
```

## Stage 2 — field growth integral (daily)

```
weight = transplant_weight_g
for day in 1..field_days:
  share = per_plant_dli_share_field(
            weight,
            field_density_heads_per_m2)
  per_plant_dli = bench_dli_mol_per_m2_per_day × share
  weight *= 1
          + relative_growth_rate_max_per_day
          × (1 − weight / field_canopy_cap_g)
          × f_light(per_plant_dli)
harvest_weight_g = weight
```

## Throughput + annual yield

```
nursery_output_per_day =
    nursery_area_m2 × tray_cells_per_m2 / nursery_days
field_intake_per_day =
    field_area_m2 × field_density_heads_per_m2 / field_days
heads_per_day    = min(nursery_output_per_day,
                       field_intake_per_day)
bottleneck_stage = whichever side was the min
heads_per_year   = heads_per_day × 365
annual_yield_kg  = heads_per_year × harvest_weight_g / 1000
```

## Confirmed inputs

- Tray frame: 1020 (0.1525 m²).
- Daily grain throughout.
- `per_plant_dli_share_field` shape: 1.0 until rosette covers
  spacing, then decays (formula above).

## Confirmed inputs (2026-05-17)

- `bench_dli_mol_per_m2_per_day`: ledHours stays a dynamic
  operator input (max 18). Existing REQ-114 formula preserved.
- Nursery cap basis: breeder-anchored (50-cell = 25 g pinned;
  other trays scaled by geometric proportion).

## Open inputs

- Field 0.40 floor on `per_plant_dli_share_field` — borrowed
  from nursery; cert 2 starting value. Open to refinement on
  field cohort data.

All other inputs resolved: bulk sale removes the head-size
constraint, weekly cadence is automatic at steady state,
breeder-anchored caps confirmed, daily grain confirmed, 1020
frame confirmed, ledHours stays a dynamic operator input.

## Requirement queue (one per turn)

1. regime-switch integrator (stages 1 + 2 with transplant day)
2. `annual_yield_kg` output (throughput wrapper)
3. `nursery_canopy_cap_by_tray_cells` + 4-tray table
4. `field_canopy_cap_by_density` accessor (geometric formula)
5. `per_plant_dli_share_field` curve constant
6. `canopy_geometry` regime constants
