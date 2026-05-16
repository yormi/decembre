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

Role: P balance. 1.75 % P = 4 × Ocean's P. Closes REQ-101 (50 % P-supply)
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

## 2. Demand calculation (90 g / 35 d / 50 cells)

Per `index.html` `calcLettuceNurseryDemand(90, 35, 50)`:

```
DW per plant per week = 90 × LETTUCE_NURSERY_DM_FRACTION × (7 / 35)
                      = 90 × 0.07 × 0.2 = 1.26 g / plant / week
```

× tissue % × 1000 → mg/plant/week; × 50 cells → mg/tray/week:

| Element | Tissue % | mg/plant/wk | mg/tray/wk |
|---|---|---|---|
| N  | 5.0 %  | 63   | 3 150 |
| P  | 0.5 %  | 6.3  | 315   |
| K  | 6.0 %  | 75.6 | 3 780 |
| Ca | 2.0 %  | 25.2 | 1 260 |
| Mg | 0.4 %  | 5.04 | 252   |

REQ-100 inline-fallback target is **2 800 mg N / tray / week**, deliberately
conservative vs calculated 3 150 during 90 g calibration phase. Cert 3
across the board.

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

Constraints:
- **CE** ≤ 3.0 mS/cm (REQ-098)
- **pH** ∈ [4.5, 6.5] (REQ-099)
- **N supply** ≥ 1 400 mg/tray (50 % of inline 2 800, REQ-100)
- **P supply** ≥ 158 mg/tray (50 % of 315, REQ-101)

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
Kelp   Z g/L:  K = Z × 1.25 × 0.01   × 1000 = 12.5 Z
                CE = 0.10 × Z
                pH = -0.05 × Z
```

Search heuristic: lock Z = 2 g/L; solve {X, Y} for max(N supply) subject to
CE ≤ 3.0 and P ≥ 158. Picked `X = 7, Y = 6, Z = 2`:
- N 1 463 mg = 52 % of 2 800 target (clears REQ-100, edge-close).
- P 170 mg = 54 % of 315 (clears REQ-101 with room).
- CE 2.55 + 0.10 baseline = 2.65 mS/cm (~0.4 mS/cm head-room under 3.0 cap).
- pH 5.25 (centre of [4.5, 6.5]).

Pareto walk + rejected rows in `learnings.md`.

K / Ca / Mg under-supply at default — accepted; see `learnings.md`.

## 5. Predicted CE / pH at default (verifier numbers)

```
nurseryRecipeCE(NURSERY_RECIPE_DEFAULT, 1)
  = 0.10 + 0.20 × 7.0 + 0.15 × 6.0 + 0.10 × 2.0
  = 0.10 + 1.40 + 0.90 + 0.20
  = 2.60 mS/cm                                       cert 3 (calibration anchor + analogy)

nurseryRecipeTankPh(NURSERY_RECIPE_DEFAULT)
  = 7.00 + (-0.15) × 7.0 + (-0.10) × 6.0 + (-0.05) × 2.0
  = 7.00 − 1.05 − 0.60 − 0.10
  = 5.25                                             cert 2 (linear sum, no buffering)

nurseryRecipeSupply(NURSERY_RECIPE_DEFAULT, 1.25).perTray_mg
  N: 1463      cert 3
  P:  170      cert 3
  K:   88      cert 2  (kelp matrix not fully captured)
```

## 6. Refinement triggers

Recompute recipe or ecFactor calibration when:

1. **First in-bucket EC measurement of Ocean-containing recipe.** If measured
   diverges >25 % from `nurseryRecipeCE` prediction, recalibrate
   `NURSERY_PRODUCTS.Ocean_15_1_1.ecFactor`; upgrade Ocean ecFactor cert 2 → 3.
2. **Substrate EC drift** (post-watering, 30–60 min, 2–3 cells averaged).
   Consistently >2.5 or <1.5 → adjust doses. Bucket↔substrate has salt-
   accumulation lag; 2 weeks of data > 1 reading.
3. **Tissue test on 5-week trays at transplant.** N <4 % DW or P <0.4 % DW
   → push doses up. Ca <1.5 % or Mg <0.3 % → source organic supplement.
4. **Manufacturer EC datasheet.** Acadie technical sheet conductivity per
   dilution would replace single-point calibration.
5. **Tray-finishing pilot results (90 g → 110 g).** REQ-100 / REQ-101
   thresholds + default doses shift in lockstep.
6. **`nutrition/nursery/plant-needs` lands.** When
   `window.PlantNeedsNursery.demandPerTray('N')` is wired, REQ-100 reads
   dynamically; inline 2 800 fallback retires.
