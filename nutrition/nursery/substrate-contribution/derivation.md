# Substrate-contribution (nursery) · derivation

Rationale for each constant in `spec.md`. Rejected alternatives in
`learnings.md`.

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

## Per-tray geometry — 2 cups/sac → 9 g/tray

```
2 cups        ≈ 480 mL
density       ~ 0.55 g/mL  (cert 2 — feather meal flake bulk density 0.5-0.6)
total per sac ≈ 480 × 0.55 = 264 g

OM2 sac       = 50 L
trays per sac = 50 L / 1.65 L/tray ≈ 30 trays

per-tray feather meal = 264 g / 30 trays ≈ 8.8 g  →  rounded to 9 g
```

Cert 3. Density 0.50 → 8 g/tray, 0.60 → 9.6 g/tray; both round to 9 g
for slider purposes.

---

## Why the front-load cap = 9 g (germination protection)

Codified as `LIMITS.maxFeatherMealPerTrayG` (`feather-meal-front-load-cap`). Salanova
germination drops above ~9 g/tray (salt + ammonia pulse from week-1
mineralization inhibits radicle emergence in peat). Empirical Décembre
operator note + Sonneveld & Voogt peat salt-sensitivity guidance
converge on the threshold. HARD UPPER bound, not a soft target — model
exposes `LIMITS` so the Semis page slider clamps to it; raising
requires a documented germination-trial sign-off.

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

The 1000 conversion lifts feather-meal grams-of-N into mg so the result
is mg/tray/wk consistent with OM2.

---

## OM2 starter charge — per-element table

Values in **ppm** (mg per L of fresh substrate).

| Element | OM2 ppm | Cert | Rationale |
|---------|---------|------|-----------|
| N       | 175     | 2    | Typical peat-based organic-mix starter (150-200 ppm range). Refine with Berger OM2 datasheet. |
| P       | 50      | 2    | Peat is naturally P-poor; Berger relies on limestone + organic fertilizer pre-charge. |
| K       | 150     | 2    | K-bearing organic fertilizer pre-charge contributes most. |
| Ca      | 200     | 3    | Limestone-buffered peat → Ca adequate for seedling cycle. |
| Mg      | 50      | 3    | Limestone often dolomitic → Mg present. Conservative low-end. |

Cert 2 entries lift to 4 when the OM2 datasheet lands.

Unit is per-tray (not g/m²/wk) because tray IS the operational unit —
fertigation, recipe author, and Bilan card all think in mg/tray/wk.

---

## OM2 release curve — `[0.50, 0.30, 0.15, 0.05, 0.00]`

Peat-based organic mix releases its labile fraction front-loaded:

- **Week 1 (50 %):** soluble pre-charge salts dissolve, bulk of starter-N hits seedling.
- **Week 2 (30 %):** residual soluble + first wave of organic fertilizer mineralization.
- **Week 3 (15 %):** mineralization tail; soluble pool nearly depleted.
- **Week 4 (5 %):** trace residual.
- **Week 5 (0 %):** depleted; fertigation drives all delivery.

Cert 2 — qualitative match to organic-mix release behaviour, not
calibrated to Décembre PourThru data. Refinement trigger: 5-week
PourThru EC time-series in a no-fertigation control trial.

---

## Feather meal — per-week release curve `[0.10, 0.25, 0.25, 0.25, 0.15]`

Sonneveld & Voogt cool-greenhouse mineralization profile:

- **Week 1 (10 %):** lag — microbial colonization of front-loaded feather meal in cool peat.
- **Weeks 2-4 (25 % each):** peak mineralization.
- **Week 5 (15 %):** tail — remaining labile N + late protein hydrolysis.

Sum = 1.00. Cert 3 — Sonneveld curve scaled to 5-week cycle; refine if
seedling tissue-test N timing disagrees.

### Total mineralizable N per tray at 9 g front-load

```
9 g × 0.13 N × 0.75 mineralization × 1000 mg/g = 877.5 mg N total
                                                = 175.5 mg N/tray/wk avg
```

Bilan supply credit against per-tray weekly N demand.

---

## Efficiency map (REQ-157) — channel-side contract for Efficacité column

`window.SubstrateContributionNursery.efficiency` (REQ-157, also returned
by `cycleAverageReleasePerTray` under `efficiency` key) declares the
per-element share of applied substrate-product mass that becomes
plant-available across the 5-week cycle.

Time-fold rule: cycle-mean release × mineralization (alternatives
considered in `learnings.md`).

| Element | Formula                                                         | Value | Cert |
|---------|-----------------------------------------------------------------|-------|------|
| N       | `Σ(OM2_RELEASE_CURVE) × FEATHER_MEAL_MINERALIZATION_FRAC`         | 0.75  | 3    |
| P       | `Σ(OM2_RELEASE_CURVE)`                                            | 1.0   | 2    |
| K       | `Σ(OM2_RELEASE_CURVE)`                                            | 1.0   | 2    |
| Ca      | `Σ(OM2_RELEASE_CURVE)`                                            | 1.0   | 3    |
| Mg      | `Σ(OM2_RELEASE_CURVE)`                                            | 1.0   | 3    |

`Σ(OM2_RELEASE_CURVE_BY_WEEK) = 0.50 + 0.30 + 0.15 + 0.05 + 0.00 = 1.00`
(INV-2 asserts ∈ [0.95, 1.05]).

N pinned at 0.75 (feather-meal-only mineralization) to stay invariant
against the front-load lever — see `learnings.md` for the blended-rate
alternative and its swing behaviour.

P/K/Ca/Mg = 1.0 reflects cycle-mean release ceiling in a closed-bottom
peat plug; < 10 % leaching loss absorbed within cert-2 band.

**Refinement triggers:**
- OM2 datasheet lands → P/K/Ca/Mg cert 2 → 4.
- Seedling tissue panel correlates N → N cert 3 → 4.

---

## Caveats and known limitations

- **OM2 starter charge = placeholders.** Cert 2. Real vendor values
  could shift ±50 % without invalidating model structure.
- **No batch-to-batch variation.** Each OM2 sac treated identical;
  fold per-batch substrate-EC measurements into an OM2 multiplier if/when collected.
- **Mineralization rate single 75 %.** Mid-cool-greenhouse value. Real
  rate varies with substrate temp, moisture, microbial seed load.
- **Release curves flat across batches/seasons.** No Q10 multiplier —
  nursery sits in heated greenhouse, narrow temp band. Add multiplier
  if team runs un-heated batches.
- **Linearity (`linear-in-feather-meal-input`).** OM2 and feather meal treated as independent
  additive contributions. Real biology has small interaction (more FM →
  more microbial activity → faster OM2 mineralization); below cert-2
  noise floor.

---

## Refinement triggers

- **Berger OM2 datasheet pulled.** Drop PDF in `nutrition/nursery/doc/`,
  update CLAUDE.md index, replace `OM2_STARTER_CHARGE_PPM` with vendor
  values. Cert macros 2 → 4, Ca/Mg 3 → 4.
- **First seedling tissue tests.** Refit
  `FEATHER_MEAL_RELEASE_CURVE_BY_WEEK` if N timing off, or
  `FEATHER_MEAL_MINERALIZATION_FRAC` if cumulative gap drifts. Cert 3 → 4.
- **Front-load product change** (e.g., blood meal, Selectus 4-2-5). Add
  parallel `FRONT_LOAD_LABEL_PCT` table for all elements the new
  product carries. Don't reuse feather-meal slot — keep separate for
  audit trail / recipe history.
- **PourThru EC time-series collected.** Refit
  `OM2_RELEASE_CURVE_BY_WEEK` against no-fertigation control week-by-week
  EC drop. Cert 2 → 3 (or 4 across multiple cohorts).
- **Tray format change** (50-cell → 32-cell). Update
  `NURSERY_TRAY_SUBSTRATE_VOL_L` from 1.65 to measured volume. Re-derive
  `NURSERY_FEATHER_MEAL_DEFAULT_G_PER_TRAY` from 2-cups-per-sac convention.

---

## Implementation map

| File                                                          | Owns                                                                                        |
|---------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| `nutrition/nursery/substrate-contribution/data.js`            | OM2 + feather meal constants, tray geometry, `LIMITS`                                       |
| `nutrition/nursery/substrate-contribution/calc.js`            | `theoreticalSubstrateReleasePerWeek(w, fmG)`, `cycleAverageReleasePerTray(fmG)`             |
| `nutrition/nursery/substrate-contribution/model.js`           | `window.SubstrateContributionNursery` namespace wrapper                                     |
| `nutrition/nursery/substrate-contribution/spec.md`            | Spec — what the model must do or be                                                         |
| `nutrition/nursery/substrate-contribution/derivation.md`      | This file                                                                                    |
| `nutrition/nursery/substrate-contribution/learnings.md`       | Rejected alternatives, historical decisions                                                  |

Integrator wires three `@include` markers into `app/index.html`
(data → calc → model, before Semis block 2 consumer). Bilan card
"Réserve substrat" reads via the public namespace.
