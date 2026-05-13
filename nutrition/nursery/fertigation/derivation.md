# Nursery fertigation — derivation

How the numbers in `data.js` and `NURSERY_RECIPE_DEFAULT` were chosen.
Spec.md states the normative claims; this file walks the math + judgement.

Cert per number (canonical 0–5 scale).

## 1. Per-product analysis (label → elemental → ions)

### EZ-GRO Ocean 15-1-1 (Higrocorp; powder, water-soluble)

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

Why Ocean is the primary N source: 15 % N vs Acadie's 2 % N is a 7.5 ×
concentration advantage. To deliver, say, 1 300 mg N/tray, Ocean needs
1 300 / (0.15 × 1.25) = 6 933 mg ≈ 7 g/tray. Acadie alone would need
1 300 / (0.02 × 1.25) = 52 000 mg ≈ 52 mL/tray = 41 mL/L — 3 × the current
dose, far outside the CE envelope (REQ-098). Without Ocean, the math doesn't
close.

`ions / chemistryTags`: amino-N treated as `NH4+` analogue (mineralizes
quickly in peat), bulk as `organic-matrix`. Tags `organic-matrix` +
`protein-hydrolysate`. cert 2 — chemistry simplification; no acid/base
groups tracked.

### Acadie Poisson Hydrolysé 2-4-0.5 (Acadian Seaplants; liquid)

Source: existing global `PRODUCT['AcadiePoissonHydrolyse']` entry (cert 4
for label, cert 2 for derived chemistry). Reused unchanged; only
`ecFactor` is recalibrated locally — see §3.

| Field | Value | Math | Cert |
|---|---|---|---|
| N (elemental) | 0.020 | label 2 % | 4 |
| P (elemental) | 0.0175 | 4 % P₂O₅ × (62 / 142) | 4 |
| K (elemental) | 0.00414 | 0.5 % K₂O × (78 / 94.2) | 4 |
| density assumption | 1.0 g/mL | typical liquid hydrolysate; mL ≈ g for dose math | 3 |

Why Acadie poisson stays in the recipe: P-balanced. 1.75 % P is 4 × Ocean's
P content. The 50 % P-supply spec (REQ-101) is closed by Acadie at moderate
doses where Ocean alone can't reach.

### Acadie Algues liquides (Acadian Seaplants; liquid kelp)

Source: existing global `PRODUCT['AcadieAlguesLiquides']`. Reused unchanged
except local `ecFactor` (§3).

| Field | Value | Math | Cert |
|---|---|---|---|
| K (elemental) | 0.010 | label "approx 1 %" — Acadian datasheet | 2 |
| density assumption | 1.0 g/mL | typical | 3 |
| micros | trace Fe/Mn/Zn/B/Mo at <100 ppm | not modelled per-element | 1 |
| biostimulant | alginates, betaines | not in `base[]`; `chemistryTags: biostimulant` | 4 |

Why kelp stays in the recipe: K + micros baseline. Doesn't move the macro
needle (25 mg K/tray at 2 mL/L), but the trace-micro spectrum covers the
seedling stage's boron / molybdenum requirement before the production-side
tank takes over. Cert 1 on per-micro mg/tray — would need a fresh
manufacturer datasheet to upgrade.

## 2. Demand calculation (90 g / 35 d / 50 cells)

Per `index.html` `calcLettuceNurseryDemand(90, 35, 50)`:

```
DW per plant per week = 90 × LETTUCE_NURSERY_DM_FRACTION × (7 / 35)
                      = 90 × 0.07 × 0.2 = 1.26 g / plant / week
```

Multiply by tissue concentration (`LETTUCE_NURSERY_TISSUE_DW`) and 1000 to
get mg/plant/week, then × 50 cells for mg/tray/week:

| Element | Tissue % | mg/plant/wk | mg/tray/wk |
|---|---|---|---|
| N  | 5.0 %  | 63   | 3 150 |
| P  | 0.5 %  | 6.3  | 315   |
| K  | 6.0 %  | 75.6 | 3 780 |
| Ca | 2.0 %  | 25.2 | 1 260 |
| Mg | 0.4 %  | 5.04 | 252   |

Spec REQ-100 inline-fallback target is **2 800 mg N / tray / week**,
slightly below the calculated 3 150 — the fallback was set deliberately
conservative to avoid over-spec'ing N during the 90 g calibration phase.
Discrepancy logged here so a future tightening can update both in lockstep.
Cert 3 across the board (tissue %, DM %, target g — all calibration-pending).

## 3. ecFactor calibration (LOCAL override, cert 3)

Global `PRODUCT` entries declare ecFactors at cert 2:

```
PRODUCT.EZGRO-Ocean-15-1-1 .ecFactor = 0.8   (cert 2)
PRODUCT.AcadiePoissonHydrolyse.ecFactor = 0.5 (cert 2)
PRODUCT.AcadieAlguesLiquides.ecFactor = 0.3   (cert 2)
```

These predict CE for the current production recipe (Acadie 13 mL/L + kelp
2 mL/L) at:

```
0.10 + 0.5 × 13 + 0.3 × 2 = 0.10 + 6.5 + 0.6 = 7.20 mS/cm
```

Field measurement (Bluelab pen, in-bucket, April 2026): **1.9–2.6 mS/cm**.
Predicted is 3 × measured — the global ecFactors are wrong for these
products by a factor of ~3.

The simplest calibration: anchor on the Acadie 13 mL/L bucket measurement.

```
13 g/L × ec_acadie + 2 g/L × ec_kelp + 0.10 ≈ 2.0
assume ec_kelp ≈ 0.05 (very weak, low-salt kelp extract)
→ ec_acadie ≈ (2.0 − 0.10 − 0.10) / 13 ≈ 0.138    round to 0.15  (cert 3)
ec_kelp ≈ 0.10  (cert 2 — single-point, weakly constrained)
```

Ocean: no in-tank measurement yet. By analogy with Acadie (similar fish
hydrolysate matrix, slightly higher salt content) — set conservatively
~30 % above Acadie's per-mass EC contribution: **0.20** (cert 2). Will be
upgraded to cert 3 once the first Ocean-in-tank measurement comes back.

These local values live in `NURSERY_PRODUCTS[*].ecFactor`. The global
`PRODUCT` table is left alone (out of scope per task brief). When the
nutrition model is consolidated, reconcile by either copying these values
upstream or generalizing the calibration framework.

## 4. Recipe sizing — derivation of `NURSERY_RECIPE_DEFAULT`

Constraints:
- **CE** ≤ 3.0 mS/cm (REQ-098)
- **pH** ∈ [4.5, 6.5] (REQ-099)
- **N supply** ≥ 1 400 mg/tray (50 % of inline 2 800)
- **P supply** ≥ 158 mg/tray (50 % of 315)

The optimization is small: three knobs (Ocean dose, Acadie dose, Kelp
dose), one CE binding constraint, two supply floors, one pH window.

Mass-flow per knob (per tray, per week, in mg of element):

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

Search heuristic: lock Z = 2 g/L (current production rate, cheap K + micros
baseline; cert 4 — observed at Décembre). Solve {X, Y} for max(N supply)
subject to CE ≤ 3.0 and P supply ≥ 158.

```
P constraint: 5.46 X + 21.9 Y ≥ 158
CE budget:    0.20 X + 0.15 Y + 0.10 × 2 + 0.10 ≤ 3.0
            → 0.20 X + 0.15 Y ≤ 2.7
N objective:  max 187.5 X + 25 Y
```

Pareto-walk along the CE budget (N rises 7.5 × faster per Ocean dose than
per Acadie dose, but Ocean is P-poor → the P floor pulls Y back up):

| X (Ocean) | Y (Acadie) | CE | N mg | P mg | pH |
|---|---|---|---|---|---|
| 5  | 8 |  2.50 |  1138 |  202 |  5.45 |
| 6  | 7 |  2.55 |  1300 |  186 |  5.40 |
| 6  | 6 |  2.40 |  1275 |  164 |  5.50 |
| **7** | **6** | **2.55** | **1463** | **170** | **5.25** |
| 7  | 7 |  2.75 |  1488 |  192 |  5.15 |
| 8  | 6 |  2.80 |  1650 |  176 |  5.10 |
| 9  | 5 |  3.05 (FAIL CE) | … | … | … |

Picked `X = 7, Y = 6, Z = 2`. Why this row:
- N supply 1 463 mg = 52 % of the 2 800 mg target. Just clears REQ-100 —
  closer to spec edge than I'd like; the next refinement (Ocean ecFactor
  drop after first measurement) opens room to push X to 8.
- P supply 170 mg = 54 % of 315. Same ratio. Clears REQ-101 with room.
- CE 2.55 + 0.10 baseline = 2.65 mS/cm in-bucket. Below 3.0 cap with
  ~0.4 mS/cm head-room.
- pH 5.25. Solid centre of [4.5, 6.5]. Bias toward 5.5 if K supply later
  needs more kelp (kelp is ~neutral, pulls pH back up slightly).

K supply is **NOT** specced today (no REQ-K-supply equivalent of REQ-100 /
REQ-101). At default the recipe delivers ~88 mg K/tray ≈ 2 % of the 3 780
demand. Seedlings get the rest from peat starter charge + kelp's
under-modelled K-rich matrix; once tissue tests confirm K adequacy in
nursery output we can either (a) add a K spec or (b) rely on the production
LETTUCE recipe to make up the gap post-transplant. cert 1 on the
peat-starter assumption — investigate.

Ca and Mg are similarly under-supplied at default (Ca 0 from these three
products; Mg 0). Acceptable today: peat starter is calcitic-limed
(carry-over from pH-corrected mix). Long-term: source a soluble organic
Ca-Mg supplement if tissue tests show <2 % Ca, <0.4 % Mg in nursery output.

## 5. Predicted CE / pH at default (the verifier numbers)

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

Recompute the recipe (or the ecFactor calibration) when any of these land:

1. **First in-bucket EC measurement of Ocean-containing recipe.**
   If measured CE diverges >25 % from `nurseryRecipeCE` prediction, recalibrate
   `NURSERY_PRODUCTS.Ocean_15_1_1.ecFactor`. Upgrade Ocean ecFactor cert 2 → 3.
2. **Substrate EC drift** (post-watering, 30–60 min, 2–3 cells averaged).
   If consistently >2.5 mS/cm or <1.5, adjust default-recipe doses. The
   relationship between bucket CE and substrate CE has a salt-accumulation
   lag (top-watering pushes salts to cell bottom), so 2 weeks of data > 1 reading.
3. **Tissue test on nursery output (5-week trays at transplant).**
   N <4 % DW or P <0.4 % DW → push doses up. Ca <1.5 % or Mg <0.3 % → source
   organic supplement.
4. **Manufacturer EC datasheet.** Acadie's technical sheet may list
   conductivity per dilution; would replace the single-point calibration.
5. **Tray-finishing pilot results (90 g target → 110 g).**
   If targets shift, REQ-100 / REQ-101 thresholds and the default doses
   shift in lockstep — recompute the table.
6. **Sister subproject `nutrition/nursery/plant-needs` lands.**
   When `window.PlantNeedsNursery.demandPerTray('N')` is wired, REQ-100
   reads it dynamically; the inline 2 800 fallback retires.
