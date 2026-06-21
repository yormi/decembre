# Nursery fertigation — derivation

Why each number in `data.js` and `NURSERY_RECIPE_DEFAULT` has its value.
Cert per number on 0–5. Rejected alternatives in `learnings.md`.

## 1. Per-product analysis

### EZ-GRO Ocean 15-1-1 (Higrocorp; powder)

Source: manufacturer label PDF (`nutrition/info/EZ-GRO Ocean 15-1-1.pdf`).

| Field | Value | Math / source | Cert |
|---|---|---|---|
| N (elemental) | 0.150 | label "Azote total 15 %" | 4 |
| P (elemental) | 0.00437 | 1 % P₂O₅ × (62 / 142) | 4 |
| K (elemental) | 0.00828 | 1 % K₂O × (78 / 94.2) | 4 |
| amino acids | 80 % | label | 4 |
| fish-protein peptide | 65 % | label | 4 |
| organic-cert | CAN/CGSB-32.311 OK | hydrolysed fish protein, listed | 4 |
| label hydroponic dose | 2 g/L weekly | label "Hydroponique et Cannabis 2 g/L" | 4 |

Primary N source: 15 % N vs Acadie's 2 % = 7.5 × concentration advantage.

`ions / chemistryTags`: amino-N as `NH4+` analogue (mineralizes quickly in
peat), bulk as `organic-matrix`. Tags `organic-matrix` + `protein-hydrolysate`.
cert 2 — chemistry simplification; no acid/base groups tracked.

### Acadie Poisson Hydrolysé 2-4-0.5 (Acadian Seaplants; liquid)

Source: existing global `PRODUCT['AcadiePoissonHydrolyse']` (cert 4 label,
cert 2 derived chemistry). Reused unchanged except local `ecFactor` (§3).

| Field | Value | Math | Cert |
|---|---|---|---|
| N (elemental) | 0.020 | label 2 % | 4 |
| P (elemental) | 0.0175 | 4 % P₂O₅ × (62 / 142) | 4 |
| K (elemental) | 0.00414 | 0.5 % K₂O × (78 / 94.2) | 4 |
| density assumption | 1.0 g/mL | typical liquid hydrolysate | 3 |

Role: P balance. 1.75 % P = 4 × Ocean's P. Closes default-recipe-p-supply-half-demand (50 % P-supply)
where Ocean alone can't reach.

### Acadie Algues liquides (Acadian Seaplants; liquid kelp)

Source: existing global `PRODUCT['AcadieAlguesLiquides']`. Reused unchanged
except local `ecFactor` (§3).

| Field | Value | Math | Cert |
|---|---|---|---|
| K (elemental) | 0.010 | label "approx 1 %" — Acadian datasheet | 2 |
| density assumption | 1.0 g/mL | typical | 3 |
| micros | trace Fe/Mn/Zn/B/Mo at <100 ppm | not modelled per-element | 1 |
| biostimulant | alginates, betaines | `chemistryTags: biostimulant` | 4 |

Role: K + micro baseline. 25 mg K/tray at 2 mL/L (doesn't move macro needle)
+ trace B/Mo coverage for seedling stage. Per-micro cert 1 — needs fresh
manufacturer datasheet to upgrade.

### Sulfate de fer (FeSO₄·7H₂O, 20 % Fe)

Bench practice folded into the model 2026-06-20: team adds ~1.4 g / 94 L
(≈ 0.015 g/L) for seedling iron. Kelp alone under-sources Fe (trace), so this
is the real Fe channel.

| Field | Value | Math | Cert |
|---|---|---|---|
| Fe (elemental) | 0.20 | label "20 % Fe" | 3 |
| SO₄ fraction | 0.345 | 96 / 278 (FeSO₄·7H₂O) | 3 |
| ecFactor | 1.2 | divalent-sulfate analogy; reconcile w/ global PRODUCT FeSO₄ | 2 |
| Fe delivered | 3.75 mg/tray | 0.015 × 1.25 × 0.20 × 1000 (~3 ppm feed) | 3 |

Available here (unlike the field): tank pH ~5.8 + acidic peat keep Fe²⁺
soluble; field soil pH 7.48 precipitates the same salt. EC add negligible
(~0.018 mS/cm at this dose). Organic-allowed (CAN/CGSB-32.311).

## 2. Demand calculation (20 g / 35 d / 50 cells)

Target lowered 90 → 20 g (2026-06-20, salt-control phase — see plant-needs
derivation). Per `calculateNurseryDemand(20, 35, 50)`:

```
DW per plant per week = 20 × LETTUCE_NURSERY_DM_FRACTION × (7 / 35)
                      = 20 × 0.07 × 0.2 = 0.28 g / plant / week
```

× tissue % × 1000 → mg/plant/week; × 50 cells → mg/tray/week:

| Element | Tissue % | mg/plant/wk | mg/tray/wk | 50 % floor |
|---|---|---|---|---|
| N  | 5.0 %  | 14   | 700 | 350 |
| P  | 0.5 %  | 1.4  | 70  | 35  |
| K  | 6.0 %  | 16.8 | 840 | — |
| Ca | 2.0 %  | 5.6  | 280 | — |
| Mg | 0.4 %  | 1.12 | 56  | — |

Halving the plug target halves every demand. The N floor drops 1 400 → 350 mg
— that is what lets the feed sit in the salt-safe CE band. Cert 3 across the
board.

## 3. ecFactor calibration (LOCAL override, cert 3)

Field measurement (Bluelab pen, in-bucket, April 2026, Acadie 13 mL/L +
kelp 2 mL/L): **1.9–2.6 mS/cm**. Calibration anchored on this point:

```
13 g/L × ec_acadie + 2 g/L × ec_kelp + 0.10 ≈ 2.0
assume ec_kelp ≈ 0.05 (very weak, low-salt kelp extract)
→ ec_acadie ≈ (2.0 − 0.10 − 0.10) / 13 ≈ 0.138    round to 0.15  (cert 3)
ec_kelp ≈ 0.10  (cert 2 — single-point, weakly constrained)
```

Ocean: no in-tank measurement yet. By analogy with Acadie (similar fish
hydrolysate, slightly higher salt) ~30 % above Acadie per-mass: **0.20**
(cert 2). Upgrade to cert 3 on first Ocean-in-tank measurement.

Values live in `NURSERY_PRODUCTS[*].ecFactor`. Global PRODUCT table left
alone — see `learnings.md`.

## 4. Recipe sizing — `NURSERY_RECIPE_DEFAULT`

Constraints (re-derived 2026-06-20 at 20 g target + lowered cap):
- **CE** ≤ 1.0 mS/cm bucket (predicted-ce-under-nursery-cap; cell ~1.5× via dry-down → peak ~1.2 with per-feed leaching)
- **pH** ∈ [4.5, 6.5] (predicted-tank-ph-in-nursery-envelope; waterPh 6.26)
- **N supply** ≥ 350 mg/tray (50 % of 700 demand at 20 g, `n-supply-half-demand-floor`)
- **P supply** ≥ 35 mg/tray (50 % of 70, default-recipe-p-supply-half-demand)

Mass-flow per knob (per tray, per week, mg element):

```
Ocean  X g/L:  N = X × 1.25 × 0.15  × 1000 = 187.5 X
                P = X × 1.25 × 0.00437 × 1000 = 5.46 X
                K = X × 1.25 × 0.00828 × 1000 = 10.4 X
                CE contribution = 0.20 × X
                pH contribution = -0.15 × X
Acadie Y g/L:  N = Y × 1.25 × 0.02   × 1000 = 25 Y
                P = Y × 1.25 × 0.0175 × 1000 = 21.9 Y
                K = Y × 1.25 × 0.00414 × 1000 = 5.18 Y
                CE = 0.15 × Y
                pH = -0.10 × Y
Kelp   Z g/L:  K = Z × 1.25 × 0.0498 × 1000 = 62.3 Z
                CE = 0.10 × Z
                pH = +0.02 × Z
```

Search heuristic: with the floors quartered, find the smallest doses that
still clear them while CE stays ≤ 1.0. Picked `X = 2, Y = 1.5, Z = 1`:
- N 412 mg = supply (375 Ocean + 37 Acadie) ≥ 350 floor ✓.
- P 44 mg (33 Acadie + 11 Ocean) ≥ 35 floor ✓.
- CE 0.73 + 0.10 baseline = 0.83 mS/cm (under 1.0 cap; cell peak ~1.2).
- pH 5.83 (in [4.5, 6.5], waterPh 6.26).

Old 90 g recipe (X 7 / Y 6 / Z 2, CE 2.65) + its Pareto walk retired to
`learnings.md`.

K / Ca / Mg under-supply at default — accepted; see `learnings.md`.

## 5. Predicted CE / pH at default (verifier numbers)

```
nurseryRecipeCE(NURSERY_RECIPE_DEFAULT, 1)
  = 0.10 + 0.20 × 2.0 + 0.15 × 1.5 + 0.10 × 1.0 + 1.2 × 0.015
  = 0.10 + 0.40 + 0.225 + 0.10 + 0.018
  = 0.85 mS/cm                                       cert 2 (calibration anchor + analogy)

nurseryRecipeTankPh(NURSERY_RECIPE_DEFAULT)        waterPh default 6.26
  = 6.26 + (-0.15) × 2.0 + (-0.10) × 1.5 + (0.02) × 1.0 + (-0.10) × 0.015
  = 6.26 − 0.30 − 0.15 + 0.02 − 0.0015
  = 5.83                                             cert 2 (linear sum, no buffering)

nurseryRecipeSupply(NURSERY_RECIPE_DEFAULT, 1.25).perTray_mg
  N:  412      cert 3
  P:   44      cert 3
  K:   90      cert 2  (kelp matrix not fully captured)
  Fe: 3.75     cert 3  (iron sulfate, ~3 ppm in feed)
```

## 6. Refinement triggers

Recompute recipe or ecFactor calibration when:

1. **First in-bucket EC measurement of Ocean-containing recipe.** If measured
   diverges >25 % from `nurseryRecipeCE` prediction, recalibrate
   `NURSERY_PRODUCTS.Ocean_15_1_1.ecFactor`; upgrade Ocean ecFactor cert 2 → 3.
2. **Pour-through EC after the salt flush.** Confirms the dry-down factor
   behind the 1.0 cap. Cell consistently <1.2 with room → consider raising
   the bucket cap; still >1.5 → drop doses or raise feed frequency.
3. **Tissue test on transplant-ready trays.** N <4 % DW or P <0.4 % DW
   → push doses up. Ca <1.5 % or Mg <0.3 % → source organic supplement.
4. **Manufacturer EC datasheet.** Acadie technical sheet conductivity per
   dilution would replace single-point calibration.
5. **Salinity under control → raise the plug target.** When pour-through holds
   in band, step `targetG_default` back up (20 → 30 → …); demand, floors, and
   doses shift in lockstep, and the N-vs-salt collision returns — frequency
   (more feeds/wk) is the lever to hold the band at a bigger plug.
