# Yield Range — derivation

Why-this-number trace for the currently live REQs in `spec.md`. Rejected
alternatives and superseded decisions live in `learnings.md`. Empirical
anchor (live cohort data) lives in
`yield-range/doc/yield-range-calibration-2026-spring.md`.

---

## REQ-112 / REQ-172 — `canopyCapG` values per tray

`yield-range/data.js:CANOPY_CAP_BY_PLATEAU` = `{ 50: 25, 32: 39, 24: 52,
18: 69 }` (g/plant). Breeder-anchored geometric scaling: each entry is
`area_per_cell × FOLIAGE_HEIGHT_M × FOLIAGE_DENSITY_KG_PER_M3 × 1000`
on a 1020 tray (`tray_area = 0.1525 m²`, `28 × 54 cm`), with
`FOLIAGE_HEIGHT_M = 0.10` and `FOLIAGE_DENSITY_KG_PER_M3 = 82`. The
50-cell value pins the Salanova breeder anchor (cert 3); 32 / 24 / 18
follow by holding the canopy mass-loading product `h × ρ ≈ 8.2 kg/m²`
constant across cell footprints — the conservative-physics baseline
(any real spacing-dependent canopy expansion adds mass on top, never
below).

Per-tray cert: 50-cell breeder-anchored cert 3; 32 / 24 / 18 all
cert 2 — same single-anchor dependence (only the canopy
mass-loading product `h × ρ ≈ 8.2 kg/m²` is breeder-grounded; the
split into individual `h = 0.10 m` and `ρ = 82 kg/m³` is back-derived
from the 50-cell anchor, not independently measured). Cert 2
reflects the shared evidence base across the three extrapolated
rows; bumps to cert 3 when `FOLIAGE_HEIGHT_M` lands on an independent
anchor (see refinement-trigger table below). The constant-`h × ρ`
assumption is the floor, but lettuce given more space per plant
tends to grow taller and denser (plausible upper band at 18-cell:
`h ≈ 0.13-0.15 m`, `ρ ≈ 90-100 kg/m³`, asymptote 75-95 g vs predicted
69 g). Refit upward on first 18-cell cohort under best non-light
conditions; same shape but smaller magnitude expected at 24-cell
(+5 to +10 %).

Why not power-law extrapolation from two anchors? Archived in
`learnings.md` § "Rejected: two-anchor power-law extrapolation".
Why not Hochmuth root-volume cap? Archived in `learnings.md` §
"Hochmuth root-volume cap rejected as the operative ceiling".

Refinement trigger: cohort weighing at non-50-cell trays (18-cell
highest-priority gap). Refit `CANOPY_CAP_BY_PLATEAU` to observed
asymptote when n ≥ 5 cohorts under best non-light conditions land
for the relevant tray.

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

`RGR_MAXIMUM_LETTUCE_NURSERY = 0.30 d⁻¹` — anchored on cross-cultivar
butterhead seedling RGR_max literature. The 0.30 d⁻¹ value sits at the
upper end of the typical pre-canopy-closure seedling-RGR band
(0.25–0.30 d⁻¹) reported for Salanova-class butterhead in
controlled-environment (CE) chambers, Wageningen / Hoogendoorn-line
publications. Cert 3 reflects cross-cultivar literature
transferability under comparable regimes (DLI 25-30 mol/m²/d,
day-temp ~22 °C, packed-tray seedling phase 0-28 d) — not a
Décembre-specific or breeder-anchored measurement.

**Missing-doc gap (per [[P-10]]).** No Salanova / butterhead RGR_max
primary-source document currently lives in `nutrition/doc/`. The
nearest on-disk anchors (`fertigation oligos éléments tomate avril.pdf`,
`Recette fertigation oligo-éléments laitues - 1er mai 2026 PA.pdf`)
cover fertigation chemistry, not growth physiology. Cert ladder per
P-10: one mechanistic step from the breeder-anchored cap (REQ-172) is
the literature seedling-RGR band at cert 3; no further extrapolation
this turn. Refinement trigger names where the literature band is
expected to underpredict or overpredict for Décembre's regime.

**Integrator output at the anchor point.** 50-cell packed,
`DLI_bench = sun(16.5) + LED(11.5) = 28.02 mol/m²/d` (16 LED-hours),
`cap = 25 g`, `RGR = 0.30` → `daysToTransplantPotential = d44`
(W reaches `0.95 × 25 = 23.75 g` at d44). The asymptote curve under
the spacing-factor decay (REQ-116) and `f_light` saturation:
`f_light ≈ 0.70` for d ≤ 14 (per-plant DLI ≈ 28, above the 0.7
saturation floor); ramps to ≈ 0.90 by d = 28 (per-plant DLI = 11.2,
on the linear ramp toward the optimum plateau). Per-tray timing at
the same `DLI_bench`: 32-cell `cap = 39 g` → `d46`; 24-cell
`cap = 52 g` → ~d49; 18-cell `cap = 69 g` → falls past the
49-day `TRAJECTORY_MAXIMUM_DAYS` window. Lower `ledHours` push every
tray's timing later; at `ledHours ≤ ~8` the 50-cell asymptote also
slips past the window and the operator surface renders the
`Plein potentiel non atteint` annotation (REQ-121).

**Why not 0.40 (prior value).** Archived in `learnings.md` §
"Rejected: back-calculated RGR_max from cap-asymptote target". The
0.40 anchor was back-fit to produce a chosen d28–d35 asymptote at
the breeder-anchored 25 g cap — circular: cap is the data-anchored
target, RGR_max should independently predict timing under that cap
rather than be tuned to hit a target timing. The +82 % jump from
the 2026-spring cohort's observed-stressed back-fit (`RGR ≈ 0.22`,
heat-stressed) to the 0.40 best-case anchor had no intermediate
data point.

**Refinement triggers (symmetric per [[P-03]]):**
- Refit **upward** if a Décembre best-case cohort (n ≥ 5, best
  non-light conditions: cooler zone, no bolting, no VPD pockets, no
  mold) lands an asymptote *above* the literature band — i.e.
  `daysToTransplantPotential` observed < d44 at 50-cell / DLI=28 /
  16 LED-h. Signal: literature is too conservative for the Décembre
  regime; refit toward the observed value.
- Refit **downward** if the same cohort lands *below* the literature
  band (asymptote > d44 at the anchor point). Signal: the Décembre
  regime sub-performs vs CE chambers; refit toward observed.
- Refit either direction on landing a Salanova-specific or
  Rijk-Zwaan-cultivar-trial RGR_max primary source — overrides the
  literature-band cert 3 to the cited source's cert.

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
| Décembre best-case cohort (n ≥ 5, cooler zone, no bolting / VPD / mold) — asymptote vs d44 at 50-cell / DLI=28 / 16 LED-h | `RGR_MAXIMUM_LETTUCE_NURSERY` (REQ-115); refit **upward** if observed < d44 (literature too conservative for the regime), **downward** if > d44 — symmetric per [[P-03]] | per `doc/yield-range-calibration-2026-spring.md` § "How to add new observations" |
| Salanova-specific or Rijk-Zwaan cultivar-trial RGR_max primary source lands in `nutrition/doc/` | `RGR_MAXIMUM_LETTUCE_NURSERY` (REQ-115) — cert ladder overrides cross-cultivar literature transferability | when the doc lands; supersedes the [[P-10]] missing-doc gap in the REQ-115 trace |
| n ≥ 5 cohorts at non-50-cell trays | `CANOPY_CAP_BY_PLATEAU` (REQ-112 / REQ-172) | per `doc/yield-range-calibration-2026-spring.md` § "How to add new observations" |
| First 18-cell cohort under best non-light conditions | `CANOPY_CAP_BY_PLATEAU[18]` — geometric likely underpredicts (`h × ρ` rises at wider spacing); refit upward toward observed asymptote (plausible band 75-95 g vs predicted 69 g) | first 18-cell cohort weigh-in at d ≥ 28; smaller +5-10 % expected at 24-cell |
| Site-specific pyranometer dataset | `DLI_SUN_OUTDOOR_QC_ANNUAL` (REQ-131) | when measurement equipment lands |
| Poly film replacement or aging | `GH_LIGHT_TRANSMISSION_DOUBLE_POLY` (REQ-131) | at film swap; 0.55 fresh → 0.45 aged |
| Per-plant PAR at d=18/21/24 | `NURSERY_SPACING_PACKED` shape (REQ-116) | when measurement equipment lands or photo-coverage analysis runs |
| Rijk Zwaan breeder density curves | `FOLIAGE_HEIGHT_M` / `FOLIAGE_DENSITY_KG_PER_M3` independent anchors (REQ-172) — currently back-derived from the 50-cell anchor | when curves load |

---

## Extension-pending — nursery + field + throughput

Decision (Guillaume, 2026-05-16): extend yield-range to cover nursery +
field + throughput balance. Objective: **maximize annual harvested kg**.
Daily grain throughout.

Model plan lives in `working files/yield-range-extension-draft.md`.
Settled inputs (2026-05-17):
- `bench_dli_mol_per_m2_per_day` — `ledHours` stays a dynamic operator
  input (max 18); existing REQ-114 formula preserved.
- `per_plant_dli_share_field` curve — 1.0 until rosette covers
  spacing, then decays with 0.40 floor (cert 2 borrowed from packed
  nursery; refinement trigger = field cohort data).

Nursery cap basis landed in the live REQ trace (REQ-112 / REQ-172
section above); no separate pending entry.

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
