# Yield Range — derivation

Why-this-number trace for the currently live REQs in `spec.md`. Rejected
alternatives and superseded decisions live in `learnings.md`. Empirical
anchor (live cohort data) lives in
`yield-range/doc/yield-range-calibration-2026-spring.md`.

---

## REQ-112 — `canopyCapG` values per tray

`yield-range/data.js:CANOPY_CAP_BY_PLATEAU` = `{ 50: 25, 32: 50, 24: 80,
18: 120 }`. Two-anchor power-law fit (W ∝ density^-1.585) on the 50-cell
+ 32-cell estimates; 24-cell and 18-cell are extrapolations from that
fit. Packed end-to-end. Cert 2 — 50/32 are educated estimates from one
Décembre cohort (2026-spring batch) + general scaling; 24/18 are
extrapolations.

Why not Hochmuth root-volume cap (cellVol × 1.6)? At packed densities
the canopy binds far before root volume does — root cap predicts
50-cell ≈ 56 g, but the calibration cohort never crossed 16 g before
senescence under stressed conditions, and the breeder anchor pins
best-case 50-cell to ~25 g. Canopy density dominates; root cap is the
wrong ceiling. Archived in `learnings.md`.

Refinement trigger: live `predictNurseryYield` against the calibration
table when n ≥ 5 under matching conditions; refit `canopyCapG` to
minimize squared residual.

## REQ-113 — Why no stress multipliers in the daily growth term

The model is the upper-bound "best-case" prediction. Tomato-zone
calibration data (heat-stressed, sub-optimal for lettuce) shows
~16 g/plant peak at d28 — below the modeled ~25 g — because in-zone
T_day stayed in the 22-26 °C range that bolts lettuce. The model
intentionally answers "what could this cohort do if non-light
conditions are optimal", not "what did this cohort do in the
tomato zone". Senescence + bolting + heat (the operational d28 → d35
mass-loss observed at Décembre) are deliberately excluded — those
collapse the model into a calibration to one specific stressed
condition rather than a planning surface.

If a stress-aware variant is ever needed, it belongs in a separate
spec, not as a multiplier into REQ-115's growth term. See learnings.md
for the rejected senescence-branch alternative.

## REQ-114 ↔ REQ-131 — DLI decomposition

Bench DLI is the sum of two transparent terms:

```
DLI_SUN_OUTDOOR_QC_ANNUAL × GH_LIGHT_TRANSMISSION_DOUBLE_POLY
  + (LED_PPFD × ledHours × 3600 / 1e6)
```

REQ-131 owns the sun-side decomposition. Why two constants instead of
one post-transmission baked-in value? The film transmission updates
independently of the outdoor-DLI baseline — when poly is replaced or
ages (0.55 fresh → 0.45 aged), the operator-side adjustment touches
one constant, not a recomputed composite.

Constant choices:
- `DLI_SUN_OUTDOOR_QC_ANNUAL = 30 mol/m²/d` — Quebec annual-average
  outdoor PAR DLI; cert 2 from public climate-data summaries. Refit
  when a site-specific pyranometer dataset lands.
- `GH_LIGHT_TRANSMISSION_DOUBLE_POLY = 0.55` — PAR transmission for a
  typical 6-mil inflated double-poly film; cert 3 (published range
  0.50-0.65 fresh; aged drops to ~0.45). Update when film is replaced
  or aged.
- `LED_PPFD = 200 µmol/m²/s` — installed bench LED capacity; cert 4
  (datasheet-anchored).

## REQ-115 — Logistic growth, no decay

```
W(d+1) = W(d) × (1 + RGR_MAX × (1 − W/cap) × f_light(dpp))
```

Pure logistic in W with light-modulated growth rate. When `f_light → 0`
(insufficient DLI) or `W → cap` (density ceiling), the increment
collapses to 0; W never decreases. This is the "no senescence branch"
spec claim — the model never flips to negative growth.

`RGR_MAXIMUM_LETTUCE_NURSERY = 0.40` — refit anchor: 50-cell packed,
DLI = sun(16.5) + LED(11.5) = 28.0, canopyCap = 25 g asymptotes
between d28 and d35. Matches upper bound of best case for the
Décembre cohort's observed 16 g (heat-stressed, sub-optimal lower
bound). Cert 3; refit when n ≥ 5 cohorts under best non-light
conditions land.

`f_light` piecewise-linear breakpoints (cert 3, lettuce literature):

| Per-plant DLI (mol/m²/d) | f_light |
|---|---|
| < 4 | 0 (photosynthesis stalls) |
| 4 → 12 | linear ramp 0 → 1.0 |
| 12 → 17 | 1.0 (optimum plateau) |
| 17 → 22 | linear ramp 1.0 → 0.7 (saturation) |
| ≥ 22 | 0.7 (saturation floor) |

## REQ-116 — Spacing-factor decay shape

Per-plant DLI = bench DLI × spacing_factor(d). The decay between bound
endpoints (1.0 at d ≤ 14, 0.40 at d ≥ 28) is **linearly interpolated**
between d=14 and d=28 via `piecewiseLinear` in `calc.js`. Linear is
the defensible default: no breeder-anchored shape data exists for
Salanova packed-canopy spacing; the linear interpolation is the
minimum-assumption span.

`NURSERY_SPACING_PACKED = [{0, 1.0}, {14, 1.0}, {28, 0.40}, {99, 0.40}]`.
Cert 3 on the bound endpoints (photo evidence from spring cohort
anchors canopy closure d21-28 visually); cert 2 on the linear-decay
shape (no measured intra-window data).

Refinement trigger: per-plant PAR measurements (or inferred from
photo coverage analysis) at d=18, d=21, d=24 — if the curve is
significantly non-linear (e.g. sigmoidal at canopy-closure threshold),
refit to a 4-breakpoint shape.

## REQ-117 — Days-to-potential threshold

`POTENTIAL_THRESHOLD = 0.95`. First integer d where W ≥ 0.95 × cap.
Logistic asymptote is approached but never reached; 95 % is the
operator-meaningful "ready" mark.

## REQ-118 — Trajectory window

50 entries from day 0 to day 49 inclusive. `TRAJECTORY_MAXIMUM_DAYS = 49`
covers the longest plausible nursery cycle (worst-case low-LED,
low-density) plus headroom for the chart to show the asymptote.

---

## Refinement triggers (consolidated)

Live triggers across REQs:

| Trigger | What it refines | When |
|---|---|---|
| n ≥ 5 cohorts under best non-light conditions | `RGR_MAXIMUM_LETTUCE_NURSERY` (REQ-115) + `CANOPY_CAP_BY_PLATEAU` (REQ-112) | per `doc/yield-range-calibration-2026-spring.md` § "How to add new observations" |
| Site-specific pyranometer dataset | `DLI_SUN_OUTDOOR_QC_ANNUAL` (REQ-131) | when measurement equipment lands |
| Poly film replacement or aging | `GH_LIGHT_TRANSMISSION_DOUBLE_POLY` (REQ-131) | at film swap; 0.55 fresh → 0.45 aged |
| Per-plant PAR at d=18/21/24 | `NURSERY_SPACING_PACKED` shape (REQ-116) | when measurement equipment lands or photo-coverage analysis runs |
| Rijk Zwaan breeder density curves | `CANOPY_CAP_BY_PLATEAU` 24/18-cell extrapolations (REQ-112) | when curves load |

---

## Extension-pending — nursery + field + throughput

Decision (Guillaume, 2026-05-16): extend yield-range to cover nursery +
field + throughput balance. Objective: **maximize annual harvested kg**.
Daily grain throughout.

Model plan lives in `working files/yield-range-extension-draft.md`.
Settled inputs (2026-05-17):
- `bench_dli_mol_per_m2_per_day` — `ledHours` stays a dynamic operator
  input (max 18); existing REQ-114 formula preserved.
- Nursery cap basis — breeder-anchored (50-cell = 25 g pinned;
  32 / 24 / 18 derived by geometric scaling of breeder h × ρ across
  cell footprints).
- `per_plant_dli_share_field` curve — 1.0 until rosette covers
  spacing, then decays with 0.40 floor (cert 2 borrowed from packed
  nursery; refinement trigger = field cohort data).

Open inputs (block REQ landing):
- **Marketability constraint on head size** — does 200 g matter or is
  150-160 g sellable? Drives whether 43/m² is final density or we
  drop for bigger heads. Yield/m² ≈ flat across 25-50 heads/m²;
  commercial decision, not biological. Guillaume-owned.

REQ landing is scheduled when the marketability question lands —
not part of the 2026-05-17 audit pass. The extension model adds 6+
new REQs (regime-switch integrator, annual-yield wrapper, nursery /
field cap accessors, per-plant DLI share, canopy-geometry constants);
those claim through `scripts/claim-req.sh` in a contiguous block
once Guillaume signals the density call.
