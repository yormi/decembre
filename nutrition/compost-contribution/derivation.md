# Compost-contribution · derivation

Source product, mass-balance formula, per-element values, cert.
Spec in `spec.md`. Rejected alternatives in `learnings.md`.

---

## Source — Savaria ORGANIMIX marin

| Field                  | Value                                              |
|------------------------|----------------------------------------------------|
| Product                | Savaria ORGANIMIX marin (calcitic-lime-amended)    |
| Type                   | Shrimp-base compost + lime                          |
| Organic-cert listing   | CAN/CGSB-32.311 §4.2 (soil amendment)               |
| Datasheet              | `nutrition/info/compost.pdf`                        |
| Application date       | Fall 2025                                            |
| Application rate       | ~25.4 kg/m² (≈ 2 inches × ~520 m² of bed surface)   |
| Coverage               | All production beds — tomato and lettuce            |

Root cause of current pH crisis: added ~2 788 kg Ca/ha to soil already
near saturation. See `farm info/farm-baseline-updated.md`.

---

## Formula

For each element `el`:

```
applied_g_per_m2 = applicationRateKgPerM2 × 1000 × LABEL_PCT[el]
annual_release_g = applied_g_per_m2 × MINERALIZATION_YEAR1[el]
release_per_week = (annual_release_g / 52) × SEASONAL_FACTOR
```

`SEASONAL_FACTOR = 1.5` — flat-band Q10 boost across T3-T5. Cert 2.
Derivation in `learnings.md`.

---

## Per-element table

Values in `g/m²/wk`. Calculation: `(applied_g_m² × year1_fraction / 52) × 1.5`.

| Element | Label %     | Applied g/m² | Year-1 mineralization | Theoretical g/m²/wk | Stored g/m²/wk | Cert | Notes |
|---------|-------------|--------------|----------------------|---------------------|----------------|------|-------|
| N       | 0.5 %       | 127          | 30 %                 | 1.099               | **1.10**       | 2    | Standard organic-N rate (Stanford & Smith) |
| K       | 0.1 % (K₂O → K factor 0.83) | 21.1 | 65 %       | 0.395               | **0.40**       | 2    | Highly soluble in compost |
| Ca      | 1.1 %       | 279          | 60 %                 | 4.83                | **4.82**       | 3    | Carbonate matrix degrades. Part of Ca-saturation problem. |
| Mg      | ~0.3 % assumed (NOT on label) | 76 | 30 %    | 0.658               | **0.50**       | 1    | Conservative override — label gap. See `learnings.md`. |
| P       | 0.1 % (P₂O₅ → P factor 0.437) | 11.1 | 5 % | 0.016              | **0.016**      | 2    | pH-locked at soil pH 7.3-7.5. |

Stored column → `window.CompostContribution.releasePerWeek`.
Theoretical column → `theoreticalReleasePerWeek(el)`.
REQ-079 asserts stored ∈ `[0.5×, 1.5×]` × theoretical.

---

## Cert per element

Merged transferability scale (`min` across contributing inputs):

| Element | Label cert | Mineralization rate cert | Effective cert |
|---------|------------|--------------------------|----------------|
| N       | 4 (label)  | 2 (textbook)             | **2**          |
| K       | 4          | 2                        | **2**          |
| Ca      | 4          | 3 (Berger Mehlich-3 post-application 10 612-10 989 kg Ca/ha confirms order of magnitude) | **3** |
| Mg      | 1 (label gap) | 2                     | **1**          |
| P       | 4          | 2                        | **2**          |

---

## Efficiency map (REQ-157)

`window.CompostContribution.efficiency[el] = COMPOST_MINERALIZATION_YEAR1[el]`.
Year-1 mineralization IS the efficiency for compost (pH-lockout already
encoded — P at 0.05 reflects pH 7.3-7.5; neutral-pH reference ≈ 0.20).
`SEASONAL_FACTOR` lives in `releasePerWeek`, NOT in `efficiency` —
keeps the operator-facing percent as a year-1 fraction (e.g. "65 % of K
applied → plant-available year 1") rather than peak-season flux.

Per-element cert (`min` of mineralization-rate cert and label-input cert):

| Element | Cert | Driver                                                |
|---------|------|-------------------------------------------------------|
| N       | 2    | Mineralization (Stanford & Smith textbook)           |
| P       | 2    | Mineralization (pH-locked at 7.3-7.5)                 |
| K       | 2    | Mineralization (highly soluble in compost)            |
| Ca      | 3    | Berger soil-test signal post-application              |
| Mg      | 1    | LABEL_PCT.Mg gap (assumed, not measured)              |

---

## Caveats

- **Flat year-1 rate.** Accurate through ~2027-04; decline curve deferred (spec.md → Pending; `learnings.md`).
- **Cross-bed uniform.** Berger tests confirm similar Ca-saturation tomato + lettuce. Per-bed scaling if future drift.
- **Mg label gap.** Conservative-down assumption. Confirm via vendor QC.
- **Sonotube Ca leaching.** Separate channel, not modeled here. Reflects in pH program.

---

## Refinement triggers

- **~2027-04** — labile fraction depletes → replace flat rate with decline curve (target shape in `learnings.md`).
- **New amendment applied** — extend `COMPOST_AMENDMENT` or replace (see `learnings.md`).
- **Mg vendor QC arrives** — drop override, recompute from measured %.
- **Soil-test drift** — if Mehlich-3 N/K shifts faster than predicted, refit year-1 mineralization fractions.
- **Tissue panel persistent under/over-supply on element X** — refit mineralization rate (and efficiency) for X.

---

## Implementation map

| File                                          | Owns                                                           |
|-----------------------------------------------|----------------------------------------------------------------|
| `nutrition/compost-contribution/data.js`      | `COMPOST_AMENDMENT`, `COMPOST_LABEL_PCT`, `COMPOST_MINERALIZATION_YEAR1`, `COMPOST_SEASONAL_FACTOR`, `COMPOST_RELEASE_PER_WEEK` |
| `nutrition/compost-contribution/calc.js`      | `theoreticalReleasePerWeek(el)`                                |
| `nutrition/compost-contribution/model.js`     | `window.CompostContribution` namespace wrapper                 |
| `nutrition/compost-contribution/spec.md`      | Spec                                                            |
| `nutrition/compost-contribution/derivation.md`| This file                                                       |
| `nutrition/compost-contribution/learnings.md` | Rejected alternatives, historical decisions                    |

Include order in `app/index.html`: `data.js` → `calc.js` → `model.js`,
before any consumer. Consumers read via `window.CompostContribution`.
