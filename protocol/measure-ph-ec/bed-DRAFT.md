# Protocol — Bed pH + EC (1:1 by weight)

Official method for bed salinity + pH. All beds, all crops.
Read EC_1:1, read pH, compare to the per-crop band below.


## Kit (keep staged in one bin)

- Digital kitchen scale (1 g)

- 6 marked cups + spoon

- Squeeze bottle of water (tap is fine — ~0.10 mS/cm)

- Bluelab EC pen + Bluelab pH pen + calibration solution

- Log sheet


## Once per session

- Calibrate both pens → rinse.


## Once per season

- Check water EC. > ~0.15 mS/cm → subtract from readings; tap (~0.10) → ignore.


## Per round (batch all beds at once)

1. Each bed: 5 cores at root-zone depth (~10 cm), spread along the bed → combine in its cup, skip stones/roots.

2. Scoop soil into the cup → note its weight.

3. Add the same weight of water.

4. Stir each ~60 s.

5. One timer → whole batch stands 1 min.

6. Read EC → rinse pen → read pH → rinse → record.


## Record

- Date, bed ID, EC_1:1 (mS/cm), pH, soil temp.


## Interpretation — per-crop EC_1:1 band

Aim for the crop's target; the ceiling is the transplant/salt gate.

| Crop | Salt tolerance | ECe no-loss (dS/m) | Loss slope above | **Aim EC_1:1 (mS/cm)** | Ceiling EC_1:1 |
|---|---|---|---|---|---|
| Lettuce (Salanova) | moderately sensitive | 1.3 | 13% / dS/m | **≤ 0.65** | 1.6 |
| Tomato | tolerant | 2.5 | 9.9% / dS/m | **≤ 1.25** | 2.0 |

Loss slopes are Maas-Hoffman (FAO/USDA, UF/IFAS SS117), applied to **ECe**:
`loss% = slope × (ECe − threshold)`. Worked: EC_1:1 = 2 → ECe 4 →
tomato (4−2.5)×9.9 ≈ 15%, lettuce (4−1.3)×13 ≈ 35%. In peak-DLI months the
osmotic penalty runs above this — high evaporative demand + dry-back between
irrigations concentrate pore-water above the sampled value.

Lettuce loss-graded band:

| EC_1:1 | ECe (≈ ×2) | Read |
|---|---|---|
| ≤ 0.65 | ≤ 1.3 | target — no loss |
| 0.65–1.0 | 1.3–2.0 | caution — onset, ~10% loss |
| 1.0–1.6 | 2.0–3.2 | act — ~10–25% bulking loss |
| > 1.6 | > 3.2 | hostile — ≥25% loss, salt gate |

pH band (both crops): target 6.0–6.5 · caution > 7.0 (Fe/Mn/P lockout).


## Factors

- **Yield band:** `ECe = EC_1:1 × 2` (saturated-paste equivalent).
  Crop thresholds (Maas-Hoffman; FAO/USDA, UF/IFAS SS117) are stated in ECe.
  Range 1.8–2.1, soil-specific.

- **Model only:** pore-water `= EC_1:1 × 4` (Ψ_osmotic input). Never logged as data.

- ⚠️ Factor ~2 is soil-specific (calcareous soils especially). Calibrate with
  ONE paired sample (split: 1:1 slurry read + lab saturated-paste ECe) → replace
  the ~2. Until then the band is an estimate.


## Notes

- Tap (~0.10 mS/cm) is clean enough to ignore; no blank. Re-check water EC each season.

- ±20% with soil wetness — dominates the method's other uncertainties.

- Sulfate from elemental S inflates EC without being a sodium problem → pair a
  high read with a lab Na/sulfate subset to tell self-applied-sulfate salt from
  sodium salt.

- Lettuce transplants are salt-sensitive → hold EC_1:1 ≤ 1.6 (single-fertigation
  establishment reference); mature heads tolerate ~1.8.
