# Semis laitue — plant-needs

Specs for the model that estimates the **weekly nutrient uptake of a
Salanova lettuce seedling**, per element, at target weight, cycle length,
and tray density.

Spec only. Formulas, source tables, per-element rationale, cert values,
edge-case notes, caveats, and refinement triggers live in `derivation.md`.

Question answered: **"how much of element X does a seedling need to take
up this week to hit target weight T at density D over cycle C days?"**

Out of scope: supply (substrate-contribution + fertigation sister
subprojects); cell-volume feasibility (`nutrition/nursery/app/spec.md`);
per-stage demand within the cycle (flat — deferred until tissue-stratified
data lands).

Cross-crop: lettuce nursery only; spinach nursery out of scope.

---

## Contract

### Inputs

| Name           | Type   | Default                          |
|----------------|--------|----------------------------------|
| `targetG`      | number | `NURSERY_TARGETS.targetG_default` (90 g) |
| `cycleDays`    | number | `NURSERY_TARGETS.cycleDays_default` (35 d) |
| `cellsPerTray` | number | `NURSERY_TARGETS.cellsPerTray_default` (50) |

### Output

`calcNurseryDemand(targetG, cycleDays, cellsPerTray)` → object keyed by
element, each entry shaped `{ perPlant_mg, perTray_mg }` — weekly demand.

Element coverage fixed at the 11 elements declared in
`LETTUCE_NURSERY_TISSUE_DW` (N, P, K, Ca, Mg, Fe, Mn, Zn, B, Cu, Mo).

---

## Cert scale

Same single-cert transferability scale as `nutrition/tomato/plant-needs/spec.md`
("Cert scale" — canonical).

---

## INV-1 — Element coverage is closed

`keys(LETTUCE_NURSERY_TISSUE_DW)` is exactly the 11 elements: `N, P, K,
Ca, Mg, Fe, Mn, Zn, B, Cu, Mo`.

---

## REQ-090 — Demand linear in target weight

For every element, `calcNurseryDemand(2 g, days, cells)` returns exactly
2× the value of `calcNurseryDemand(1 g, days, cells)` on both
`perPlant_mg` and `perTray_mg`.

**Cert:** 5 (structural — falls out of formula by definition).

---

## REQ-091 — Demand inverse-linear in cycle length

For every element, `calcNurseryDemand(g, 70, cells).perTray_mg` is exactly
half of `calcNurseryDemand(g, 35, cells).perTray_mg`.

**Cert:** 5 (structural).

---

## REQ-092 — N demand per plant in 50-70 mg/wk band at defaults

At default targets (90 g, 35 d, 50 cells), the N entry of
`calcNurseryDemand(...).perPlant_mg` falls in `[50, 70]` mg/wk.

Numerically: `90 × 0.07 × (7/35) × 0.05 × 1000 = 63 mg/plant/wk`.

**Cert:** 4 (band calibrated to current data, not published threshold).

---

## REQ-093 — Public API namespace `window.PlantNeedsNursery`

At runtime, `window.PlantNeedsNursery` exists and exposes:

| Key                            | Type     |
|--------------------------------|----------|
| `LETTUCE_NURSERY_TISSUE_DW`    | object   |
| `LETTUCE_NURSERY_DM_FRACTION`  | number   |
| `NURSERY_TARGETS`              | object   |
| `calcNurseryDemand`            | function |
| `demandPerTray`                | function |

`calcNurseryDemand` returns `{ perPlant_mg, perTray_mg }` per element.
`demandPerTray(el)` returns a number (mg/tray/wk at default targets).

**Cert:** 5 (structural assertion).

---

## Pending — tissue-test back-test invariant

When a Salanova nursery tissue panel returns (timing TBD), back-test:
predicted demand (cycle total) − measured uptake within ±25 % per macro
and ±50 % per micro. Until then, calibrated against literature (Hochmuth,
Sonneveld) with cert 2-3 caps.

---

## Inherited specs

- **REQ-022** (`nutrition/spec.md`) — Every product Ecocert-allowed.
  Plant-needs declares no products; consumers satisfy this on demand →
  recipe translation.
