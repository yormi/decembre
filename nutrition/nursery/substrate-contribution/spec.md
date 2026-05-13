# Substrate-contribution (nursery)

Specs for the model that estimates the **weekly per-element nutrient
release from the seedling substrate** in the Salanova nursery (Berger OM2
peat-based organic mix front-loaded with feather meal at potting; 50-cell
trays, ~1.65 L substrate/tray).

This file is the *spec* (what the model must do or be). Formulas, source
tables, per-element rationale, label values, current cert per element, and
refinement triggers live in `derivation.md` next door.

The model answers exactly one question: **"how much of element X does the
substrate release per tray per week, given the front-load rate and the
substrate volume?"**

It does NOT answer:
- The plant's demand (that's `nutrition/nursery/...plant-needs/`).
- The fertigation contribution (that's `nutrition/nursery/.../fertigation`).
- Whether to switch substrates or front-load products (operational).

---

## Contract

### Inputs

- `week` (1-5) — week of the seedling cycle.
- `featherMealPerTrayG` — front-load rate, g of feather meal per tray.
  Defaults to `NURSERY_FEATHER_MEAL_DEFAULT_G_PER_TRAY` (= 9 g) when
  omitted. Bounded above by `LIMITS.maxFeatherMealPerTrayG` (REQ-094).

### Output

`window.SubstrateContributionNursery.theoreticalSubstrateReleasePerWeek(week, fmG)`
returns an object keyed by element, values in **mg/tray/wk**:

```
{ N, P, K, Ca, Mg }
```

`window.SubstrateContributionNursery.cycleAverageReleasePerTray(fmG)`
returns the same shape, averaged across the 5 weeks of the cycle.

OM2 contributes the 5 macros; feather meal contributes ONLY N (label
13-0-0). Element coverage is closed at the 5 macros (INV-1).

---

## Cert scale

Same single-cert transferability scale as `nutrition/tomato/plant-needs/spec.md`
("Cert scale" section — canonical).

---

## INV-1 — Element coverage closure

`keys(OM2_STARTER_CHARGE_PPM) ⊆ {N, P, K, Ca, Mg}` and feather meal
contributes only the `N` channel. Adding a non-macro to OM2 (e.g., S)
or a P/K-bearing front-load product requires extending this invariant
in lockstep.

---

## INV-2 — Release curves sum to ≈ 1.0 ± 0.05

`Σ OM2_RELEASE_CURVE_BY_WEEK ∈ [0.95, 1.05]` and
`Σ FEATHER_MEAL_RELEASE_CURVE_BY_WEEK ∈ [0.95, 1.05]`.

**Rationale:** Mass balance — every gram of OM2 starter or mineralizable
feather meal that's accounted for should be released across the cycle.
A curve drifting outside the band usually means a typo (e.g. dropped a
non-zero week) or that the model is silently dropping/double-counting
some fraction of the front-load.

---

## REQ-094 — Feather meal front-load cap (germination protection)

`LIMITS.maxFeatherMealPerTrayG ≤ 9`.

**Statement:** Substrate front-load is capped at 9 g feather meal per
tray. Going higher risks germination loss in Salanova (peat substrate +
salty feather-meal-N pulse → poor radicle emergence).

**Rationale:** This is an operational ceiling, not a soft target — the
team has observed germination drop-off above this threshold and
Sonneveld guidance for peat substrate salt sensitivity backs it. Surfaced
through the model so the Semis page slider clamps to it; otherwise a
recipe author could request a 15 g/tray front-load and silently kill the
cohort.

**Cert:** 4 (operational ceiling, observed by team + Sonneveld).

---

## REQ-095 — Linearity in feather meal input

For any week `w`,
`theoreticalSubstrateReleasePerWeek(w, 2X).N − theoreticalSubstrateReleasePerWeek(w, X).N`
equals `theoreticalSubstrateReleasePerWeek(w, X).N − theoreticalSubstrateReleasePerWeek(w, 0).N`
(feather meal N component scales linearly with the front-load rate).
The OM2 component (P / K / Ca / Mg, plus the OM2-N fraction) is unchanged
when the feather meal rate doubles.

**Rationale:** The model treats OM2 and feather meal as independent,
additive contributions. A bug that mixes them (e.g., scaling OM2 by
feather meal rate) silently corrupts the supply credit. This invariant
catches it.

**Cert:** 5 (structural).

---

## REQ-096 — Cycle-average matches mass-balance

`cycleAverageReleasePerTray(fmG).N ≈ (fmG × FEATHER_MEAL_LABEL_PCT.N ×
FEATHER_MEAL_MINERALIZATION_FRAC × 1000) / weeksInCycle + (OM2 N
contribution avg)` within ±10 %.

**Rationale:** If the per-week curve sums to 1.0 (INV-2), the average
must equal `total_mineralizable_N / 5`. Catches a curve that's "shaped
right but normalized wrong".

**Cert:** 5 (structural).

---

## REQ-097 — Public API namespace `window.SubstrateContributionNursery`

At runtime, `window.SubstrateContributionNursery` exists and exposes:

| Key                                    | Type     |
|----------------------------------------|----------|
| `OM2_STARTER_CHARGE_PPM`               | object   |
| `OM2_RELEASE_CURVE_BY_WEEK`            | array    |
| `FEATHER_MEAL_LABEL_PCT`               | object   |
| `FEATHER_MEAL_MINERALIZATION_FRAC`     | number   |
| `FEATHER_MEAL_RELEASE_CURVE_BY_WEEK`   | array    |
| `NURSERY_TRAY_SUBSTRATE_VOL_L`         | number   |
| `NURSERY_FEATHER_MEAL_DEFAULT_G_PER_TRAY` | number |
| `LIMITS`                               | object   |
| `theoreticalSubstrateReleasePerWeek`   | function |
| `cycleAverageReleasePerTray`           | function |

**Rationale:** Same pattern as `CompostContribution` (REQ-080) and
`PlantNeedsTomato` (REQ-083): the Semis page UI and any future recipe
calculators read substrate contribution through this namespace so
internals can be refactored without breaking call sites.

**Cert:** 5 (structural assertion).

---

## Pending — OM2 datasheet pull

OM2 starter charge values are cert 2 placeholders (typical peat-based
organic mix) until the Berger OM2 technical sheet is dropped into
`nutrition/nursery/doc/`. Refinement trigger: pull the datasheet,
replace `OM2_STARTER_CHARGE_PPM` with vendor-stated values, raise cert
to 4.

## Pending — tissue-test calibration

Feather meal mineralization rate (75 %) and the per-week release curve
shape are textbook-derived (Sonneveld & Voogt). Décembre's first
seedling tissue tests will calibrate them — bumping cert 3 → 4 on the
curve, or refitting if the shape disagrees.

---

## Inherited specs

- **REQ-022** (`nutrition/spec.md`) — Every product mentioned in the
  app is Ecocert-allowed. Feather meal: CAN/CGSB-32.311 ✓ (animal
  by-product). OM2: CAN/CGSB-32.311 ✓ (Berger organic mix).
