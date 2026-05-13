# Semis laitue — plant-needs

Specs for the model that estimates the **weekly nutrient uptake of a
Salanova lettuce seedling**, per element, at a given target weight, cycle
length, and tray density.

This file is the *spec* (what the model must do or be). Formulas, source
tables, per-element rationale, cert values, edge-case notes, caveats, and
refinement triggers live in `derivation.md` next door.

The model answers exactly one question: **"how much of element X does a
seedling need to take up this week to hit target weight T at density D
over cycle C days?"**

It does NOT answer:

- How much is *supplied* (substrate-contribution + fertigation, sister
  subprojects).
- Whether the cell volume can support that biomass (operational, not a
  nutrition question — handled in `nutrition/nursery/app/spec.md`).
- Per-stage demand within the cycle (cycle is treated as flat — no T1/T2
  sub-stages for lettuce nursery; deferred until tissue-stratified data
  lands).

Cross-crop scope: lettuce nursery only. Spinach nursery uses a separate
recipe (different target weight, different DW%) and is out of scope.

---

## Contract

### Inputs

| Name           | Type   | Default                          |
|----------------|--------|----------------------------------|
| `targetG`      | number | `NURSERY_TARGETS.targetG_default` (90 g) |
| `cycleDays`    | number | `NURSERY_TARGETS.cycleDays_default` (35 d) |
| `cellsPerTray` | number | `NURSERY_TARGETS.cellsPerTray_default` (50) |

### Output

`calcNurseryDemand(targetG, cycleDays, cellsPerTray)` returns an object
keyed by element, each entry shaped `{ perPlant_mg, perTray_mg }` —
weekly demand.

Element coverage is fixed at the 11 elements declared in
`LETTUCE_NURSERY_TISSUE_DW` (N, P, K, Ca, Mg, Fe, Mn, Zn, B, Cu, Mo).

---

## Cert scale

Same single-cert transferability scale as `nutrition/tomato/plant-needs/spec.md`
("Cert scale" section — canonical).

---

## INV-1 — Element coverage is closed

`keys(LETTUCE_NURSERY_TISSUE_DW)` is exactly the 11 elements: `N, P, K,
Ca, Mg, Fe, Mn, Zn, B, Cu, Mo`. Adding or removing any element requires
updating the verifier's expected set in lockstep.

---

## REQ-090 — Demand linear in target weight

For every element, `calcNurseryDemand(2 g, days, cells)` returns exactly
2× the value of `calcNurseryDemand(1 g, days, cells)` on both
`perPlant_mg` and `perTray_mg`.

**Rationale:** The formula is `targetG × DM × (7 / cycleDays) × tissue ×
1000`; doubling `targetG` must double the output for every element.
Catches accidental introduction of a non-linear adjustment (capping,
saturation curve, stage-mix) that would silently distort the supply
balance at non-default targets.

**Cert:** 5 (structural — falls out of the formula by definition).

---

## REQ-091 — Demand inverse-linear in cycle length

For every element, `calcNurseryDemand(g, 70, cells).perTray_mg` is
exactly half of `calcNurseryDemand(g, 35, cells).perTray_mg`.

**Rationale:** The `7 / cycleDays` factor expresses "weekly share of
the total uptake budget"; doubling the cycle halves the per-week
demand. A regression where someone replaces the factor with a fixed
constant or a non-1/x function would silently miscalibrate every
recipe — this asserts the inverse-linear shape.

**Cert:** 5 (structural).

---

## REQ-092 — N demand per plant in 50-70 mg/wk band at defaults

At default targets (90 g, 35 d, 50 cells), the N entry of
`calcNurseryDemand(...).perPlant_mg` falls in `[50, 70]` mg/wk.

**Rationale:** Sanity gate for the DM × tissue × cycle product. A typo
(0.05 → 0.5 on N tissue, or 0.07 → 0.7 on DM, or 35 → 3.5 on cycle)
silently pushes demand by 10× and corrupts every recipe downstream.
The 50-70 band is wide enough to absorb tissue refits within cert-3
range and tight enough to fail on order-of-magnitude errors.

Numerically: `90 × 0.07 × (7/35) × 0.05 × 1000 = 63 mg/plant/wk` — sits
in the middle of the band by construction.

**Cert:** 4 (band calibrated to current data, not a published threshold).

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

`calcNurseryDemand` returns objects shaped `{ perPlant_mg, perTray_mg }`
per element. `demandPerTray(el)` returns a number (mg/tray/wk at
default targets).

**Rationale:** Same as `PlantNeedsTomato` (REQ-083) and
`CompostContribution` (REQ-080): consumers (Semis subpage UI, future
nursery recipe calculators) read demand through this namespace so
internals can be refactored without breaking call sites.

**Cert:** 5 (structural assertion).

---

## Pending — tissue-test back-test invariant

When a Salanova nursery tissue panel returns (timing TBD; not part of
the 2026-05-12 tomato batch), a back-test runs against measured tissue
concentration × estimated dry biomass at transplant:

> Predicted demand (cycle total) − measured uptake shall fall within
> ±25 % per macro and ±50 % per micro.

Will replace this section with a wired REQ. Tracked as a deferred
enforcement; until then the model is calibrated against literature
(Hochmuth, Sonneveld) with cert 2-3 caps.

---

## Inherited specs

- **REQ-022** (`nutrition/spec.md`) — Every product mentioned in the app
  is Ecocert-allowed. Plant-needs declares no products; consumers (recipe
  calculators) must satisfy this when they translate demand → recipe.
