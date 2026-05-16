# Substrate-contribution (nursery)

Specs for the model that estimates the **weekly per-element nutrient
release from the seedling substrate** (Berger OM2 peat-based organic mix
front-loaded with feather meal at potting; 50-cell trays, ~1.65 L/tray).

Spec only. Formulas, source tables, per-element rationale, label values,
current cert per element, and refinement triggers live in `derivation.md`.

Question answered: **"how much of element X does the substrate release
per tray per week, given the front-load rate and substrate volume?"**

Out of scope: plant demand (`nutrition/nursery/.../plant-needs/`),
fertigation contribution (`nutrition/nursery/.../fertigation`),
substrate/product selection (operational).

---

## Contract

### Inputs

- `week` (1-5).
- `featherMealPerTrayG` — front-load rate g/tray. Defaults to
  `NURSERY_FEATHER_MEAL_DEFAULT_G_PER_TRAY` (= 9 g). Capped by
  `LIMITS.maxFeatherMealPerTrayG` (REQ-094).

### Output

`window.SubstrateContributionNursery.theoreticalSubstrateReleasePerWeek(week, fmG)`
→ object keyed by element, values in **mg/tray/wk**:

```
{ N, P, K, Ca, Mg }
```

`window.SubstrateContributionNursery.cycleAverageReleasePerTray(fmG)`
→ cycle-averaged result:

```
{
  perTray_mg: { N, P, K, Ca, Mg },     // mg/tray/wk averaged across cycle
  details:    { el: {cert, cap}, … },  // REQ-136 per-element payload
  efficiency: { N, P, K, Ca, Mg },     // REQ-157, ∈ [0, 1] per element
}
```

`window.SubstrateContributionNursery.efficiency` also exposed at namespace
level (REQ-157) — same object as the function's `efficiency` key.

OM2 contributes the 5 macros; feather meal contributes ONLY N (label
13-0-0). Element coverage closed at the 5 macros (INV-1).

---

## Cert scale

Same single-cert transferability scale as `nutrition/tomato/plant-needs/spec.md`
("Cert scale" section — canonical).

---

## INV-1 — Element coverage closure

`keys(OM2_STARTER_CHARGE_PPM) ⊆ {N, P, K, Ca, Mg}` and feather meal
contributes only the `N` channel.

---

## INV-2 — Release curves sum to ≈ 1.0 ± 0.05

`Σ OM2_RELEASE_CURVE_BY_WEEK ∈ [0.95, 1.05]` and
`Σ FEATHER_MEAL_RELEASE_CURVE_BY_WEEK ∈ [0.95, 1.05]`.

---

## REQ-094 — Feather meal front-load cap (germination protection)

`LIMITS.maxFeatherMealPerTrayG ≤ 9`. Substrate front-load capped at
9 g feather meal per tray; higher risks germination loss in Salanova.

**Cert:** 4 (operational ceiling, observed by team + Sonneveld).

---

## REQ-095 — Linearity in feather meal input

For any week `w`,
`theoreticalSubstrateReleasePerWeek(w, 2X).N − theoreticalSubstrateReleasePerWeek(w, X).N`
equals `theoreticalSubstrateReleasePerWeek(w, X).N − theoreticalSubstrateReleasePerWeek(w, 0).N`.
OM2 component (P/K/Ca/Mg + OM2-N fraction) unchanged when feather meal
rate doubles.

**Cert:** 5 (structural).

---

## REQ-096 — Cycle-average matches mass-balance

`cycleAverageReleasePerTray(fmG).N ≈ (fmG × FEATHER_MEAL_LABEL_PCT.N ×
FEATHER_MEAL_MINERALIZATION_FRAC × 1000) / weeksInCycle + (OM2 N
contribution avg)` within ±10 %.

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
| `efficiency`                           | object   |
| `theoreticalSubstrateReleasePerWeek`   | function |
| `cycleAverageReleasePerTray`           | function |

`efficiency` added per REQ-157 — channel-side contract for the
Efficacité column (REQ-156).

**Cert:** 5 (structural assertion).

---

## Pending

- **OM2 datasheet pull** — `OM2_STARTER_CHARGE_PPM` is cert 2 placeholder
  until Berger OM2 technical sheet lands in `nutrition/nursery/doc/`;
  vendor values then raise cert to 4.
- **Tissue-test calibration** — feather meal mineralization (75 %) and
  per-week curve shape are textbook-derived (Sonneveld & Voogt); first
  seedling tissue tests will calibrate (cert 3 → 4 or refit).

---

## Inherited specs

- **REQ-022** (`nutrition/spec.md`) — Every product Ecocert-allowed.
  Feather meal: CAN/CGSB-32.311 ✓. OM2: CAN/CGSB-32.311 ✓.
