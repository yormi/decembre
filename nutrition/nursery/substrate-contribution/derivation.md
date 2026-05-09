# Substrate-contribution (nursery) · derivation

How the model is built. The **spec** (what it must do or be) is in
`spec.md`. This file is everything else: source product values, mass-
balance formula, per-element rationale, cert per element, edge cases,
caveats, refinement triggers.

---

## Sources

| Field                         | Value                                                                |
|-------------------------------|----------------------------------------------------------------------|
| Substrate                     | Berger OM2 (peat-based organic mix, 50 L sac)                         |
| OM2 organic-cert listing      | CAN/CGSB-32.311 (Berger organic substrate line)                       |
| OM2 datasheet                 | NOT yet in `nutrition/nursery/doc/` — refinement trigger pending      |
| Front-load product            | Feather meal (farine de plumes), 13-0-0                               |
| Feather meal cert listing     | CAN/CGSB-32.311 (animal by-product, allowed organic input)            |
| Front-load convention         | 2 cups feather meal per OM2 sac, mixed in at potting                  |
| Tray format                   | 50-cell × ~33 mL/cell = 1.65 L substrate/tray                         |
| Cohort default                | 50 trays/cohort (≈ 2 500 plants), surface ≈ 7.4 m² per cohort          |

---

## Per-tray geometry — how 2 cups/sac translates to 9 g/tray

```
2 cups        ≈ 480 mL
density       ~ 0.55 g/mL  (cert 2 — feather meal flake bulk density 0.5-0.6)
total per sac ≈ 480 × 0.55 = 264 g

OM2 sac       = 50 L
trays per sac = 50 L / 1.65 L/tray ≈ 30 trays

per-tray feather meal = 264 g / 30 trays ≈ 8.8 g  →  rounded to 9 g
```

The 9 g/tray figure is therefore *computed* from operator convention,
not measured directly. Cert 3 — the only soft lever is the bulk density
assumption; calling it 0.50 g/mL gives 8 g/tray and 0.60 gives 9.6 g/tray.
Both round to the same operational number for slider purposes.

---

## Why the front-load cap = 9 g (germination protection)

This is the binding operational constraint, codified as
`LIMITS.maxFeatherMealPerTrayG`.

Salanova germinates poorly in salty substrate. Empirical observation
(Décembre operator note) + Sonneveld & Voogt guidance for peat substrate
salt sensitivity converge on the same threshold: somewhere around 9 g
of feather meal per tray, the salt + ammonia pulse from the first week
of mineralization starts inhibiting radicle emergence. We don't have a
clean dose-response curve — but we have enough signal to make this a
HARD UPPER bound, not a soft target.

The model therefore exposes the cap (`window.SubstrateContributionNursery.LIMITS`)
so the Semis page slider clamps to it. REQ-094 enforces the cap stays
≤ 9 in code; bumping the slider above the cap requires changing the
constant + a documented operational sign-off (germination trial result,
substrate-EC measurement protocol, etc.).

---

## Formula

Per tray, per week `w` (1-5), per element `el`:

```
release_mg(w, el) = OM2_starter_mg(el) × OM2_release_curve[w-1]
                  + (el === 'N' ? feather_meal_N_mg × FM_release_curve[w-1] : 0)

OM2_starter_mg(el)   = OM2_STARTER_CHARGE_PPM[el] × NURSERY_TRAY_SUBSTRATE_VOL_L
feather_meal_N_mg    = featherMealPerTrayG × FEATHER_MEAL_LABEL_PCT.N
                      × FEATHER_MEAL_MINERALIZATION_FRAC × 1000
```

The 1000 conversion lifts the feather-meal product from grams of N (= g)
into milligrams (mg) so the result is mg/tray/wk consistent with the
OM2 starter term.

---

## OM2 starter charge — per-element table

Values in **ppm** (mg per L of fresh substrate).

| Element | OM2 ppm | Cert | Rationale |
|---------|---------|------|-----------|
| N       | 175     | 2    | Typical peat-based organic-mix starter (150-200 ppm range). Refine with Berger OM2 datasheet. |
| P       | 50      | 2    | Same envelope; assumed mid-low because peat is naturally P-poor and Berger relies on limestone + organic fertilizer pre-charge for the bulk. |
| K       | 150     | 2    | Same envelope; K-bearing organic fertilizer pre-charge contributes most of this. |
| Ca      | 200     | 3    | Limestone-buffered peat → Ca adequate for seedling cycle; cert 3 because the limestone-loading is the single most-consistent feature of organic peat mixes. |
| Mg      | 50      | 3    | Limestone often dolomitic → Mg present. Conservative low-end estimate. |

The "Cert 2" entries are the OM2 datasheet pull's main beneficiaries.
Replace with vendor-stated values when the sheet lands.

### Why these come out as ppm not g/m²/wk

The compost-contribution model (residual, soil-applied) works in
g/m²/wk because the soil pool serves a 4 m × 30 m bed and demand is
expressed per m². The substrate model works *per tray* because the
tray IS the operational unit — fertigation is dosed per tray, recipe
author and Bilan card both think in mg/tray/wk. Keeping the unit native
to the channel saves a rescaling round-trip.

---

## OM2 release curve — `[0.50, 0.30, 0.15, 0.05, 0.00]`

Peat-based organic mix releases its labile fraction front-loaded:

- **Week 1 (50 %):** soluble pre-charge salts dissolve in the first
  irrigations; the bulk of starter-N hits the seedling immediately.
- **Week 2 (30 %):** residual soluble + the first wave of organic
  fertilizer mineralization.
- **Week 3 (15 %):** mineralization tail; soluble pool nearly depleted.
- **Week 4 (5 %):** trace residual mineralization.
- **Week 5 (0 %):** depleted; substrate is now a passive matrix and
  fertigation drives all delivery.

Cert 2 — qualitative match to organic-mix release behaviour, not
calibrated to Décembre PourThru data yet. Refinement trigger: 5-week
PourThru EC time-series in a no-fertigation control trial.

---

## Feather meal — per-week release curve `[0.10, 0.25, 0.25, 0.25, 0.15]`

Mineralization profile shape (Sonneveld & Voogt, conservative cool-
greenhouse fit):

- **Week 1 (10 %):** lag — microbial colonization of the front-loaded
  feather meal in cool peat substrate.
- **Weeks 2-4 (25 % each):** peak mineralization; this is when the bulk
  of the front-load shows up as plant-available N.
- **Week 5 (15 %):** tail; remaining labile N + late protein hydrolysis.

Sum = 1.00. Cert 3 — Sonneveld curve scaled to 5-week cycle; refine if
seedling tissue-test N timing disagrees.

### Total mineralizable N per tray at 9 g front-load

```
9 g × 0.13 N × 0.75 mineralization × 1000 mg/g = 877.5 mg N total
                                                = 175.5 mg N/tray/wk avg
```

This is the Bilan supply credit against the per-tray weekly N demand.

---

## Caveats and known limitations

- **OM2 starter charge values are placeholders.** Cert 2 — typical-
  organic-mix envelope. The model assumes 175 ppm N / 50 ppm P /
  150 ppm K / 200 ppm Ca / 50 ppm Mg. Real OM2 vendor values could
  shift any of these by ±50 % without invalidating the structure of
  the model. Refinement trigger below.
- **No batch-to-batch variation modeled.** Each OM2 sac is treated as
  identical; in reality vendor batches drift. If Décembre starts
  measuring per-batch substrate EC, that variation can be folded into
  the OM2 starter via a multiplier.
- **Mineralization rate is single 75 %.** Real rate varies with substrate
  temperature, moisture history, microbial seed load. Conservative
  bound — going lower would overstate the gap; going higher would
  understate it. The 75 % is mid-cool-greenhouse value.
- **Release curves are flat across batches and seasons.** No Q10
  seasonal multiplier yet — the nursery sits in the heated greenhouse
  at relatively narrow temp band, so seasonal variance is smaller than
  outdoor compost. Add a multiplier if the team starts running
  un-heated batches.
- **Linearity assumption (REQ-095).** The model treats OM2 and feather
  meal as independent additive contributions. Real biology probably has
  a small interaction (more feather meal → more microbial activity →
  faster OM2 mineralization). The interaction is below the cert-2 noise
  floor of the inputs.

---

## Refinement triggers

Update the model when:

- **Berger OM2 datasheet is pulled.** Drop the PDF in
  `nutrition/nursery/doc/`, update its CLAUDE.md index, and replace
  `OM2_STARTER_CHARGE_PPM` with vendor-stated values. Cert per element
  rises from 2 → 4 for the macros, 3 → 4 for Ca/Mg.
- **First seedling tissue tests land.** Compare predicted vs measured
  per-element uptake; refit `FEATHER_MEAL_RELEASE_CURVE_BY_WEEK` if
  N timing is off, or `FEATHER_MEAL_MINERALIZATION_FRAC` if the
  cumulative gap drifts. Cert 3 → 4 on the curve.
- **Front-load product changes.** If the team swaps feather meal for
  blood meal or a granular like Selectus 4-2-5, add a parallel
  `FRONT_LOAD_LABEL_PCT` table covering all elements the new product
  carries. Don't reuse the feather meal slot — keep them separate so
  the audit trail and recipe history stay clean.
- **PourThru substrate EC time-series is collected.** Refit
  `OM2_RELEASE_CURVE_BY_WEEK` against the no-fertigation control week-
  by-week EC drop. Cert 2 → 3 (or 4 if the trial is repeated across
  multiple cohorts).
- **Tray format changes (50-cell → 32-cell).** Update
  `NURSERY_TRAY_SUBSTRATE_VOL_L` from 1.65 to whatever the new tray's
  measured volume is. Re-derive `NURSERY_FEATHER_MEAL_DEFAULT_G_PER_TRAY`
  from the same 2-cups-per-sac convention.

---

## Implementation map

| File                                                          | Owns                                                                                        |
|---------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| `nutrition/nursery/substrate-contribution/data.js`            | OM2 + feather meal constants, tray geometry, `LIMITS`                                       |
| `nutrition/nursery/substrate-contribution/calc.js`            | `theoreticalSubstrateReleasePerWeek(w, fmG)`, `cycleAverageReleasePerTray(fmG)`             |
| `nutrition/nursery/substrate-contribution/model.js`           | `window.SubstrateContributionNursery` namespace wrapper                                     |
| `nutrition/nursery/substrate-contribution/spec.md`            | Spec — what the model must do or be                                                         |
| `nutrition/nursery/substrate-contribution/derivation.md`      | This file                                                                                    |

The integrator wires three `@include` markers into `app/index.html`
(data → calc → model order, before the Semis page block 2 consumer).
The Bilan card "Réserve substrat" reads via the public namespace.
