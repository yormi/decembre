# Compost-contribution

Specs for the model that estimates the **weekly per-element nutrient release
from past compost amendments** (currently: Savaria ORGANIMIX marin applied
fall 2025, ~25.4 kg/m² across all production beds).

This file is the *spec* (what the model must do or be). Formulas, source
tables, per-element rationale, label values, current cert per element, and
refinement triggers live in `derivation.md` next door.

The model answers exactly one question: **"how much of element X is the
soil expected to release this week from the residual compost amendment?"**

It does NOT answer:
- How much was applied originally (that's static historic state, in `data.js`).
- How fast the amendment decays year-over-year (the v1 model is a flat
  year-1 estimate; a decline curve is deferred — see refinement triggers
  in `derivation.md`).
- Per-bed or per-section variation (uniform across all beds; verified by
  Berger soil tests showing similar Ca-saturation on tomato + lettuce planches).
- Contributions from any other channel (sidedress, fertigation, foliar) —
  those have their own subprojects.

Cross-crop scope: tomato and lettuce planches received the same amendment,
so both read from this single source.

---

## Contract

### Inputs

None at runtime. The model is a parameter set declared in `data.js`. A
future seasonal-factor or decline-curve evolution would add inputs (e.g.
week-of-year, months-since-application).

### Output

`window.CompostContribution.releasePerWeek` — object keyed by element,
values in **g/m²/wk**:

```
{ N, P, K, Ca, Mg }
```

Element coverage is closed at the 5 macros declared on the Savaria label
(plus Mg, assumed conservative — see `derivation.md`). Adding a sixth
element requires entries in **all** of `COMPOST_LABEL_PCT`,
`COMPOST_MINERALIZATION_YEAR1`, and `COMPOST_RELEASE_PER_WEEK`.

---

## Cert scale

Same single-cert transferability scale as `nutrition/tomato/plant-needs/spec.md`
("Cert scale" section — canonical).

---

## INV-1 — Element coverage is closed

`keys(COMPOST_RELEASE_PER_WEEK) ⊆ keys(COMPOST_LABEL_PCT)` and
`keys(COMPOST_RELEASE_PER_WEEK) ⊆ keys(COMPOST_MINERALIZATION_YEAR1)`.
Adding an element to the release table requires updating both source tables
in lockstep.

**Verification:** `scripts/check-recipes.mjs` — symmetric difference of
keys must be empty.

---

## REQ-079 — Release values are within sanity band of mass-balance

For every element `el`, `COMPOST_RELEASE_PER_WEEK[el]` falls within
`[0.5×, 1.5×]` of the theoretical value computed by
`(applied_g_per_m2[el] × COMPOST_MINERALIZATION_YEAR1[el] / 52) ×
COMPOST_SEASONAL_FACTOR`.

**Rationale:** Catches order-of-magnitude transcription errors in the
release table (typo, decimal slip) while allowing conservative manual
overrides (e.g. Mg rounded down for label-gap conservatism — see
derivation). A tighter bound would force perfect formula match and
disallow that override; a looser bound would miss real bugs.

**Verification:** `scripts/check-recipes.mjs` REQ-079 — recomputes the
theoretical value from `COMPOST_AMENDMENT.applicationRateKgPerM2`,
`COMPOST_LABEL_PCT`, `COMPOST_MINERALIZATION_YEAR1`, `COMPOST_SEASONAL_FACTOR`
and asserts every release entry is within the band.

**Cert:** 4 (bound calibrated against current data, not a published threshold).

---

## REQ-080 — Public API namespace `window.CompostContribution`

At runtime, `window.CompostContribution` exists and exposes:

| Key                            | Type     |
|--------------------------------|----------|
| `AMENDMENT`                    | object   |
| `LABEL_PCT`                    | object   |
| `MINERALIZATION_YEAR1`         | object   |
| `SEASONAL_FACTOR`              | number   |
| `releasePerWeek`               | object   |
| `theoreticalReleasePerWeek`    | function |

**Rationale:** Same as `PlantNeedsTomato` (REQ-083): consumers (Bilan UI
for both crops, future recipe calculators) read compost data through this
namespace so internals can be refactored without breaking call sites.

**Verification:** `scripts/check-recipes.mjs` REQ-080 — namespace presence
+ key set + spot-check of `releasePerWeek.N` and `theoreticalReleasePerWeek('N')`
return shape.

**Cert:** 5 (structural assertion).

---

## Pending — decline curve

Year-1 mineralization is approximately flat across the application's first
12 months. After ~18 months, the mineralization rate drops as the labile
fraction depletes. The current model holds the rate constant — accurate
through ~2027-04, off by an unknown but increasing factor afterward. The
right next step is a piecewise rate that decays after month 12. Wired when
operator-facing decisions depend on the late-stage curve.

---

## Inherited specs

- **REQ-022** (`nutrition/spec.md`) — Every product mentioned in the app
  is Ecocert-allowed. Savaria ORGANIMIX is on the certified-input list
  (see `nutrition/info/compost.pdf`).
- **REQ-002** (`nutrition/spec.md`) — No forbidden products. Savaria is
  organic shrimp compost + calcitic lime (CAN/CGSB-32.311 §4.2).
