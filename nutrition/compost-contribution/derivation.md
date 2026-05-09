# Compost-contribution · derivation

How the model is built. The **spec** (what it must do or be) is in
`spec.md`. This file is everything else: source product, mass-balance
formula, per-element values + rationale, cert per element, edge cases,
caveats, refinement triggers.

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
| Coverage               | All production beds — both tomato and lettuce       |

This amendment is the *root cause* of the current pH crisis: it added
~2 788 kg Ca/ha to soil that was already near saturation. The
contribution model is therefore both an asset (residual N + K + Mg
release reduces fertigation requirements) and the source of the
soil-chemistry problem — see `farm info/farm-baseline-updated.md`.

---

## Formula

For each element `el`:

```
applied_g_per_m2 = applicationRateKgPerM2 × 1000 × LABEL_PCT[el]
annual_release_g = applied_g_per_m2 × MINERALIZATION_YEAR1[el]
release_per_week = (annual_release_g / 52) × SEASONAL_FACTOR
```

`SEASONAL_FACTOR = 1.5` represents a flat-band Q10 boost across the warm
production window (T3-T5). Cert 2 — textbook Q10 ≈ 2 for soil microbial
activity, scaled to the mid-band of greenhouse soil temperature (12-22 °C
across seasons; production months sit closer to the upper end so 1.5×
the annual mean is the realistic effective rate).

---

## Per-element table

Values in `g/m²/wk`. Calculation: `(applied_g_m² × year1_fraction / 52) × 1.5`.

| Element | Label %     | Applied g/m² | Year-1 mineralization | Theoretical g/m²/wk | Stored g/m²/wk | Cert | Notes |
|---------|-------------|--------------|----------------------|---------------------|----------------|------|-------|
| N       | 0.5 %       | 127          | 30 %                 | 1.099               | **1.10**       | 2    | Standard organic-N rate (Stanford & Smith) |
| K       | 0.1 % (K₂O → K factor 0.83) | 21.1 | 65 %       | 0.395               | **0.40**       | 2    | Highly soluble in compost |
| Ca      | 1.1 %       | 279          | 60 %                 | 4.83                | **4.82**       | 3    | Released as carbonate matrix degrades. Part of the Ca-saturation problem. |
| Mg      | ~0.3 % assumed (NOT on label) | 76 | 30 %    | 0.658               | **0.50**       | 1    | Conservative override — rounded DOWN from theoretical because Mg % is missing from Savaria label and the assumption is data-gap. Verify with vendor. |
| P       | 0.1 % (P₂O₅ → P factor 0.437) | 11.1 | 5 % | 0.016              | **0.016**      | 2    | pH-locked at current soil pH 7.3-7.5 → effective release very low. |

The "Stored" column is what consumers read via
`window.CompostContribution.releasePerWeek`. The "Theoretical" column is
what `theoreticalReleasePerWeek(el)` returns. The verifier (REQ-079)
asserts the stored values fall within `[0.5×, 1.5×]` of theoretical so
typos surface; conservative overrides like Mg pass.

### Why Mg gets a manual override

The Savaria label declares N / P / K / Ca explicitly. Mg is absent. We
assume ~0.3 % (low-end shrimp-base compost). The theoretical value at
0.3 % runs 0.658 g/m²/wk; the stored value sits at 0.50 — about 25 %
below theoretical. Rationale:
- Label gap → cert 1 on the underlying assumption.
- Conservative-down on supply protects against silent under-fertigation
  (we'd add Mg if needed, vs. silently relying on compost Mg that
  may not be there).
- If a future Savaria QC sheet confirms Mg %, recompute and remove the
  override.

---

## Cert per element

Compost-release cert per element on the merged transferability scale
(`min` across the contributing inputs):

| Element | Label cert | Mineralization rate cert | Effective cert |
|---------|------------|--------------------------|----------------|
| N       | 4 (label)  | 2 (textbook)             | **2**          |
| K       | 4          | 2                        | **2**          |
| Ca      | 4          | 3 (consistent with Berger soil-test signal post-application) | **3** |
| Mg      | 1 (label gap) | 2                     | **1**          |
| P       | 4          | 2                        | **2**          |

Ca cert 3 is the only one that climbs above 2 — the Berger Mehlich-3
results post-application (10 612-10 989 kg Ca/ha) confirm the released-Ca
order of magnitude, dragging the cert one tier closer to "Décembre-
adjacent measurement".

---

## Caveats and known limitations

- **Flat year-1 rate, no decline curve.** The current model holds release
  constant through ~2027-04 (18 months post-application). After that the
  labile fraction depletes and the rate should drop — but the curve
  shape isn't known yet without measured data. See `spec.md → Pending`.
- **Cross-bed uniform.** Application was uniform 2-inch coverage; soil
  tests confirm similar Ca-saturation across tomato + lettuce planches.
  If future soil tests show drift, model would need per-bed scaling.
- **Mg label gap.** Conservative-down assumption (see above). Confirm
  with vendor QC if Mg becomes operationally critical.
- **Sonotube Ca leaching not modeled here.** The 60 concrete sonotubes
  installed summer 2025 leach Ca slowly and indefinitely; they're a
  *separate* contribution (sidedress / no-amendment context) and live
  outside this subproject. Reflects in pH program design, not in the
  per-week compost release.
- **Q10 seasonal factor is a single 1.5×.** Could be split into per-month
  multipliers if the Bilan ever needs sub-stage temporal resolution.
  Today's stage-aware demand model already smooths this; deferred.

---

## Refinement triggers

Update the model when:

- **Compost ages out (~2027-04).** Mineralization rate drops as labile
  fraction depletes. Replace flat year-1 with a piecewise or exponential
  decline curve; target shape from organic-N residue literature
  (Stanford & Smith, ~50 % year-1, ~25 % year-2, ~12 % year-3 for
  high-quality compost).
- **New compost amendment is applied.** Either (a) extend
  `COMPOST_AMENDMENT` to a list of overlapping amendments and sum
  contributions, or (b) replace the constant when the new amendment
  dominates. The mass-balance formula is identical per amendment.
- **Mg vendor QC arrives.** Drop the manual override and recompute Mg
  release from the actual label %.
- **Soil-test re-test reveals drift.** If Mehlich-3 N or K changes
  significantly faster than the model predicts (cumulative drawdown
  vs. compost release should net out), the year-1 mineralization
  fractions are off — refit.

---

## Implementation map

| File                                          | Owns                                                           |
|-----------------------------------------------|----------------------------------------------------------------|
| `nutrition/compost-contribution/data.js`      | `COMPOST_AMENDMENT`, `COMPOST_LABEL_PCT`, `COMPOST_MINERALIZATION_YEAR1`, `COMPOST_SEASONAL_FACTOR`, `COMPOST_RELEASE_PER_WEEK` |
| `nutrition/compost-contribution/calc.js`      | `theoreticalReleasePerWeek(el)`                                |
| `nutrition/compost-contribution/model.js`     | `window.CompostContribution` namespace wrapper                 |
| `nutrition/compost-contribution/spec.md`      | Spec — what the model must do or be                            |
| `nutrition/compost-contribution/derivation.md`| This file                                                      |

`app/index.html` includes them in dependency order: `data.js` → `calc.js`
→ `model.js`, all before any consumer. Consumers (tomato and lettuce
Bilan, recipe calculators) read via the public
`window.CompostContribution.releasePerWeek` namespace.
