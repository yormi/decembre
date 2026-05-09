# Semis laitue — plant-needs · derivation

How the model is built. The **spec** (what it must do or be) is in
`spec.md`. This file is everything else: formula, source tables, per-
element rationale, cert per element, edge-case behaviour, caveats,
refinement triggers. When a number changes, this is where the *why* lives.

---

## Formula

```
dwPerPlantPerWk_g = targetG × DM × (7 / cycleDays)
perPlant_mg       = dwPerPlantPerWk_g × LETTUCE_NURSERY_TISSUE_DW[el] × 1000
perTray_mg        = perPlant_mg × cellsPerTray
```

Implemented in `nutrition/nursery/plant-needs/calc.js`:

```js
function calcNurseryDemand(targetG, cycleDays, cellsPerTray) {
  const days = Math.max(1, cycleDays);
  const cells = Math.max(0, cellsPerTray);
  const targetSafe = Math.max(0, targetG);
  const dwPerPlantPerWk_g = targetSafe * LETTUCE_NURSERY_DM_FRACTION * (7 / days);
  const out = {};
  Object.keys(LETTUCE_NURSERY_TISSUE_DW).forEach(el => {
    const perPlant_mg = dwPerPlantPerWk_g * LETTUCE_NURSERY_TISSUE_DW[el] * 1000;
    out[el] = { perPlant_mg, perTray_mg: perPlant_mg * cells };
  });
  return out;
}
```

The formula expresses the cycle as **flat** — total cycle uptake
distributed evenly across the weeks. Per-stage variation (T1
germination vs T2 true-leaves) is deliberately excluded; deferred
until tissue-stratified data lands.

---

## Source tables

### `LETTUCE_NURSERY_TISSUE_DW` — tissue concentration on DW basis

Mass fraction per element. Macros expressed as decimal (5 % → 0.050);
micros via `1e-6` (200 ppm → `200e-6`).

| Element | Value     | vs. mature | Rationale                                      | Cert |
|---------|-----------|------------|------------------------------------------------|------|
| N       | 5.0 %     | mature 4.5 % | Higher — rapid protein synthesis on new leaves | 3    |
| P       | 0.5 %     | mature 0.5 % | Approx parity                                 | 3    |
| K       | 6.0 %     | mature 7.0 % | Lower — less storage tissue (young plant)     | 3    |
| Ca      | 2.0 %     | mature 1.5 % | Higher — active cell-wall building            | 3    |
| Mg      | 0.4 %     | mature 0.4 % | Parity                                        | 3    |
| Fe      | 200 ppm   | n/a          | Standard greenhouse leafy mid-band            | 2    |
| Mn      | 50 ppm    | n/a          | Standard                                      | 2    |
| Zn      | 40 ppm    | n/a          | Standard                                      | 2    |
| B       | 30 ppm    | n/a          | Standard — cell-wall + meristem               | 2    |
| Cu      | 8 ppm     | n/a          | Standard — narrow safety window               | 2    |
| Mo      | 0.5 ppm   | n/a          | Standard — NO₃ reductase cofactor             | 2    |

### `LETTUCE_NURSERY_DM_FRACTION` — dry-matter at end of cycle

`0.07` (7 %). Cert 3 — Décembre-adjacent measurement. Mature heads sit
at ~5 %; seedlings are higher because:

- Younger tissue is more leaf-rich and less hydrated.
- Active growth = continuous protein/structural-carbohydrate build-out
  (dry matter) vs. mature plants which expand cell volume with water.
- Salanova nursery practice keeps moisture moderate to push root
  development → DM trends a touch higher than well-irrigated mature
  hydroponic figures.

### `NURSERY_TARGETS` — operational defaults

| Field                      | Value | Notes                                              |
|----------------------------|-------|----------------------------------------------------|
| `targetG_default`          | 90    | g per plant at end of cycle. **Default, not cap.** Operator may push to 120 g for slow-rotation slots or pull back to 60 g for tight schedules. Cert 4 — Décembre observed. |
| `cycleDays_default`        | 35    | 5-week cycle (germination → transplant-ready). Cert 4. |
| `cellsPerTray_default`     | 50    | Salanova plug tray standard. Cert 4. |
| `traysPerCohort_default`   | 50    | Cohort sized to fit fertigation barrel; approximate. Cert 4. |
| `trayAreaM2`               | 0.149 | 50-cell standard tray ≈ 11 in × 21 in. Cert 4. |

---

## Sources and transferability

| Source | Used for | Source quality | Transferability cert |
|--------|----------|----------------|----------------------|
| Hochmuth 1991 *Lettuce Petiole Sap Sufficiency Ranges* | Tissue-concentration anchors for Ca, Mg, K | High | 3 |
| Sonneveld & Voogt 2009 *Plant Nutrition of Greenhouse Crops* Ch. 6 | Greenhouse leafy crops nutrient composition; cross-validation | High | 3 |
| Décembre prior cohorts (qualitative DW notes) | DM fraction 7 % | Moderate (operator notes, no lab) | 3 |
| Generic greenhouse leafy micro-norms | Fe/Mn/Zn/B/Cu/Mo | Moderate | 2 |

Why every macro caps at cert 3 (not 4): the literature anchors are
hydroponic / soilless and / or non-Quebec; one major translation
applies (organic peat substrate vs. soilless rockwool, QC daylight vs.
Mediterranean). Décembre tissue data lifts the cert when it lands —
see Refinement triggers.

Why every micro caps at cert 2: no Décembre-adjacent measurement
exists for any micro; values are extrapolated from generic greenhouse
leafy norms. Refit on tissue test.

---

## Per-element cert summary

The cert annotated on each entry in `LETTUCE_NURSERY_TISSUE_DW` is the
**effective transferability cert** — the lower of the source-quality
cert and the transferability cert. Mature lettuce literature → seedling
adjustment is itself one translation; pile that on top of "Mediterranean
hydroponic → QC organic peat" and macros land at cert 3.

| Element | Effective cert |
|---------|----------------|
| N, P, K, Ca, Mg | 3 |
| Fe, Mn, Zn, B, Cu, Mo | 2 |

---

## Edge cases (current behaviour)

- **`targetG ≤ 0`**: clamped to 0 inside `calcNurseryDemand`. Output is
  all zeros. Acceptable — operator input layer should validate
  upstream.
- **`cycleDays ≤ 0` or absent**: clamped to a minimum of 1 day inside
  the function (so the `7 / cycleDays` factor doesn't explode).
  Returned demand becomes the full cycle's worth of uptake compressed
  into a "1-day week" — pathologically large, intentionally so the
  caller sees the bug. Validate upstream.
- **`cellsPerTray ≤ 0`**: `perTray_mg` becomes 0, but `perPlant_mg`
  remains correct. Acceptable — per-plant is the canonical unit; per-
  tray is a derived convenience.

---

## Caveats and known limitations

- **No within-cycle stage stratification.** A real seedling pulls more
  K and Ca during T2 (true-leaf expansion) than during T1 (cotyledon
  emergence). The flat-cycle model averages this out. Acceptable for
  the supply balance at weekly cadence; would matter if a stage-
  specific deficiency surfaces. Refine when tissue-stratified data
  comes in.
- **Seed mass treated as 0.** A Salanova seed is ~1 mg; the 90 g target
  makes the seed contribution invisible.
- **Single-tissue model.** Doesn't separate root vs. shoot. For
  nursery this is fine — the operational unit is "plug ready to
  transplant". Mature lettuce model splits to capture leaf-quality
  signals.
- **Defaults reflect current Décembre operations.** A second tray
  geometry (e.g., 32-cell) would need a fresh `cellsPerTray` default
  and likely a different `trayAreaM2` constant. The model itself is
  geometry-agnostic.
- **Linear in `targetG` and inverse-linear in `cycleDays` by
  construction.** This is correct for the "even uptake across cycle"
  framing. If reality shows accelerating uptake (W² growth), the
  formula would need a curve — refit on tissue data.

---

## Refinement triggers

Update the model when:

- **Salanova tissue panel results land.** Petiole or whole-plug tissue
  sample from a representative cohort would give per-element measured
  uptake. If measured concentrations diverge >25 % from the table
  values, refit and bump cert.
- **DW measurement lands at end-of-cycle.** A 7 % assumption verified
  to ±0.5 % graduates the DM cert from 3 to 4.
- **Tray geometry changes.** New `cellsPerTray` or `trayAreaM2`
  default; recompute the cohort-area conversion downstream.
- **Within-cycle data appears.** If T1 vs T2 uptake separates
  (e.g., tissue tests at d10 vs d28), introduce stage-stratification
  in `BIOMASS_DEMAND`-style.
- **Spinach nursery model needed.** Spinach has different DW and
  tissue concentrations; clone this subproject under a sibling
  `spinach-plant-needs/` rather than overload this one.

---

## Implementation map

| File                                              | Owns                                                              |
|---------------------------------------------------|-------------------------------------------------------------------|
| `nutrition/nursery/plant-needs/data.js`           | `LETTUCE_NURSERY_TISSUE_DW`, `LETTUCE_NURSERY_DM_FRACTION`, `NURSERY_TARGETS` |
| `nutrition/nursery/plant-needs/calc.js`           | `calcNurseryDemand`                                               |
| `nutrition/nursery/plant-needs/model.js`          | `window.PlantNeedsNursery` namespace wrapper                      |
| `nutrition/nursery/plant-needs/spec.md`           | Spec — what the model must do or be                               |
| `nutrition/nursery/plant-needs/derivation.md`     | This file                                                         |

`app/index.html` includes them in dependency order: `data.js` → `calc.js`
→ `model.js`, all before any consumer. Consumers (Semis admin subpage,
future nursery recipe calculators) reach for
`window.PlantNeedsNursery.calcNurseryDemand`.
