# Semis laitue — plant-needs · derivation

Why each number is what it is. Spec in `spec.md`; rejected alternatives
in `learnings.md`.

---

## Formula

```
dwPerPlantPerWk_g = targetG × DM × (7 / cycleDays)
perPlant_mg       = dwPerPlantPerWk_g × LETTUCE_NURSERY_TISSUE_DW[el] × 1000
perTray_mg        = perPlant_mg × cellsPerTray
```

Cycle treated flat — total uptake distributed evenly across weeks.
Implementation: `calc.js::calcNurseryDemand`.

---

## `LETTUCE_NURSERY_TISSUE_DW` — tissue concentration, DW basis

Macros as decimal (5 % → 0.050); micros via `1e-6` (200 ppm → `200e-6`).

| Element | Value     | vs. mature   | Rationale                                | Cert |
|---------|-----------|--------------|------------------------------------------|------|
| N       | 5.0 %     | mature 4.5 % | Higher — rapid protein synthesis         | 3    |
| P       | 0.5 %     | mature 0.5 % | Parity                                   | 3    |
| K       | 6.0 %     | mature 7.0 % | Lower — less storage tissue              | 3    |
| Ca      | 2.0 %     | mature 1.5 % | Higher — active cell-wall building       | 3    |
| Mg      | 0.4 %     | mature 0.4 % | Parity                                   | 3    |
| Fe      | 200 ppm   | n/a          | Greenhouse leafy mid-band                | 2    |
| Mn      | 50 ppm    | n/a          | Standard                                 | 2    |
| Zn      | 40 ppm    | n/a          | Standard                                 | 2    |
| B       | 30 ppm    | n/a          | Cell-wall + meristem                     | 2    |
| Cu      | 8 ppm     | n/a          | Narrow safety window                     | 2    |
| Mo      | 0.5 ppm   | n/a          | NO₃ reductase cofactor                   | 2    |

Macros cap at cert 3: literature anchors are hydroponic / non-Quebec
(one translation: organic peat vs. rockwool, QC vs. Mediterranean).
Micros cap at cert 2: no Décembre-adjacent measurement; extrapolated
from generic greenhouse leafy norms. Refit on tissue panel.

## `LETTUCE_NURSERY_DM_FRACTION` — end-of-cycle DM

`0.07` (7 %). Cert 3 — Décembre operator notes, no lab. Mature heads
sit ~5 %; seedlings higher because younger tissue is leaf-rich and
less hydrated, active growth builds protein/structural carbohydrate,
and Salanova practice keeps moisture moderate to push roots.

## `NURSERY_TARGETS` — operational defaults

| Field                      | Value | Notes                                           |
|----------------------------|-------|-------------------------------------------------|
| `targetG_default`          | 90    | g/plant end of cycle. Default, not cap (60-120 range). Cert 4 — Décembre observed. |
| `cycleDays_default`        | 35    | 5-week germination → transplant-ready. Cert 4. |
| `cellsPerTray_default`     | 50    | Salanova plug tray standard. Cert 4.            |
| `traysPerCohort_default`   | 50    | Cohort sized to fertigation barrel. Cert 4.     |
| `trayAreaM2`               | 0.149 | 50-cell tray ≈ 11 in × 21 in. Cert 4.           |

---

## Sources

| Source | Used for | Quality | Transferability cert |
|--------|----------|---------|----------------------|
| Hochmuth 1991 *Lettuce Petiole Sap Sufficiency Ranges* | Ca, Mg, K anchors | High | 3 |
| Sonneveld & Voogt 2009 Ch. 6 | Greenhouse leafy cross-validation | High | 3 |
| Décembre prior cohorts (operator notes) | DM 7 % | Moderate | 3 |
| Generic greenhouse leafy micro-norms | Fe/Mn/Zn/B/Cu/Mo | Moderate | 2 |

Effective cert = lower of source-quality and transferability. Mature →
seedling adjustment adds one translation; macros land at cert 3.

---

## Edge cases (clamps in `calcNurseryDemand`)

- `targetG ≤ 0` → clamped to 0; output all zeros. Validate upstream.
- `cycleDays ≤ 0` → clamped to 1 day; output pathologically large by
  design so caller sees the bug.
- `cellsPerTray ≤ 0` → `perTray_mg = 0`; `perPlant_mg` stays correct
  (per-plant is canonical).

---

## Refinement triggers

- **Salanova tissue panel lands** → if measured concentrations diverge
  >25 % from table, refit and bump cert.
- **End-of-cycle DW measurement** → 7 % verified to ±0.5 % bumps DM
  cert 3 → 4.
- **Tray geometry change** → new `cellsPerTray` / `trayAreaM2`.
- **Within-cycle stage data** → introduce T1/T2 stratification (see
  `learnings.md`).
- **Spinach nursery needed** → clone to `spinach-plant-needs/`.

---

## Implementation map

| File                                          | Owns                                                              |
|-----------------------------------------------|-------------------------------------------------------------------|
| `nutrition/nursery/plant-needs/data.js`       | `LETTUCE_NURSERY_TISSUE_DW`, `LETTUCE_NURSERY_DM_FRACTION`, `NURSERY_TARGETS` |
| `nutrition/nursery/plant-needs/calc.js`       | `calcNurseryDemand`                                               |
| `nutrition/nursery/plant-needs/model.js`      | `window.PlantNeedsNursery` namespace                              |

Load order in `app/index.html`: `data.js` → `calc.js` → `model.js`,
before consumers. Consumers reach for
`window.PlantNeedsNursery.calcNurseryDemand`.
