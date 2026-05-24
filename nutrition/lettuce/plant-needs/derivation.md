# Salanova — plant-needs · derivation

Why each number is what it is. Spec lives in `spec.md`. Rejected
alternatives and deferred refinements live in `learnings.md`.

---

## Formula — demand

```
demand[el] = (targetG − transplantG) × density / 1 000           // kg/m² gain over the cycle
              × LETTUCE_DM_FRACTION                              // → DW kg/m² over the cycle
              × 1 000                                            // → g DW/m² over the cycle
              × (7 / cycleDays)                                  // → g DW/m²/wk
              × LETTUCE_TISSUE_DW[el] × 1 000                    // → mg el/m²/wk
```

Implemented in `nutrition/lettuce/plant-needs/calc.js`:

```js
function calculateLettuceNutritionDemand(transplantG, targetG, cycleDays, density) {
  const massGain_kg_m2 = Math.max(0, (targetG - transplantG)) * density / 1000;
  const days = Math.max(1, cycleDays);
  const dwPerWk_g_m2 = massGain_kg_m2 * LETTUCE_DM_FRACTION * 1000 * (7 / days);
  const out = {};
  Object.keys(LETTUCE_TISSUE_DW).forEach(element => {
    out[element] = dwPerWk_g_m2 * LETTUCE_TISSUE_DW[element] * 1000;
  });
  return out;
}
```

Lettuce demand is a single continuous post-transplant integral — no
stage axis. The post-transplant Salanova life-cycle is monotonic mass
accumulation; no flowering / fruit-set discontinuity to bracket the
curve at. Stage-driven modelling considered then dropped — see
`learnings.md`.

---

## Formula — supply

Three additive channels:

```
soil[el]      = SME_LETTUCE_PPM[el] × weeklyMassFlowL × canopyFactor   // ± pH-lockout gates
fert[el]      = LETTUCE.{kSulfate|mgSulfate|feSulfate} × PRODUCT_PCT.* × 1000 / 100   // per 100 m²/wk
frontload[el] = (el === 'N') ? frontload_g_per_m2 × FarinePlumes_N × efficiency × 1000 / fmWeeks : 0
total[el]     = soil[el] + fert[el] + frontload[el]
```

`canopyFactor = clamp(currentG / targetG × 0.7, 0.2, 0.7)` (REQ-169).
Smaller plants pull less per m² (less canopy area + less transpiration);
mature plants saturate at 0.7.

The 0.7 ceiling is the head-stage transpiration multiplier vs the
full-cover butterhead reference (open-canopy Salanova never closes the
floor mid-bed at Décembre's 43 plants/m² density, so 1.0 is unreachable).
The 0.2 floor matches a stunted-but-alive transpiration minimum — root
pressure + osmotic flow keep the soil-mass-flow channel from going dry.

`phLocked` gates:
- P / Mn / Zn → `min(mass_flow, 100 mg/m²/wk)` (REQ-020 inherited cap;
  cert 3). Mechanism: at pH ≥ 7 in Ca-saturated soil, P precipitates as
  Ca-phosphate (variscite / hydroxyapatite) before reaching the root
  surface; Mn²⁺ oxidises to insoluble Mn³⁺/Mn⁴⁺ oxides; Zn²⁺ adsorbs
  to CEC and precipitates as Zn-hydroxide. The 100 mg/m²/wk absolute
  ceiling is a safety upper-bound against SME spikes after lockout
  breaks (e.g. a recoated bed reading anomalously high P before the
  next reading triages the cause). With the 2026-04-10 SME state
  (lettuce-bed P 0.8 ppm, Mn/Zn < DL per P-04), mass-flow currently
  reads ≈ 2 mg/m²/wk for P and 0 for Mn/Zn, so the cap is non-binding
  in today's data. It becomes load-bearing only when soil pH drops and
  Mn/Zn lift back above detection.
- Fe → × 0.15 (cert 3). Mechanism: Fe³⁺ to Fe²⁺ reduction by root
  ferric-chelate reductase (FRO2 family) is competitively inhibited by
  bicarbonate buffering in calcareous soil at pH 7.2-7.4. The 0.15
  midpoint matches the 10-20 % residual-uptake range documented in the
  Décembre Cadre page; aligned to the tomato `soilWeeklyAvailable`
  branch (`nutrition/soil-contribution/integrator.js`) which uses the
  same 0.15 factor with the same mechanism. Refines on tissue Fe after
  pH drops < 6.5.

---

## Source tables

### `LETTUCE_TISSUE_DW` — per-element DW concentration

| Element | DW fraction | Source                                       | Cert |
|---------|-------------|----------------------------------------------|------|
| N       | 4.5 %       | Hochmuth 1991 + Sonneveld 2009 Ch.6          | 4    |
| P       | 0.5 %       | Hochmuth 1991                                | 4    |
| K       | 7.0 %       | Hochmuth 1991 (range 6-8)                    | 4    |
| Ca      | 1.5 %       | Sonneveld 2009 Ch.6                          | 4    |
| Mg      | 0.4 %       | Sonneveld 2009 Ch.6                          | 4    |
| Fe      | 200 ppm     | Hochmuth 1991 leafy-greens norm              | 3    |
| Mn      |  50 ppm     | Sonneveld 2009                               | 3    |
| Zn      |  40 ppm     | Sonneveld 2009                               | 3    |
| B       |  30 ppm     | Sonneveld 2009                               | 3    |
| Cu      |   8 ppm     | Sonneveld 2009                               | 3    |
| Mo      | 0.5 ppm     | Sonneveld 2009                               | 3    |

Macros cert 4 — well-documented for greenhouse butterhead; transferability
to Salanova (cultivar within the same morphotype) holds because the
Hochmuth-norm range itself spans cultivar variation. Micros cert 3 — broader
ranges, varies with light + genetics.

### `LETTUCE_DM_FRACTION = 0.05` (cert 4)

Butterhead literature: typical 4-6 % DW; greenhouse-grown ≈ 5 %. Cert 4 —
Salanova-typical for the cycle window used at Décembre (14 d post-transplant
to ~100 g head). Refine on tissue tests if measured DW% drifts outside [4 %, 6 %].

### `LETTUCE_FRONTLOAD_DEFAULTS` (cert 3)

`featherMeal_g_per_m2 = 50` — Décembre standard pre-transplant rate.
`mineralizationWeeks = 4` — conservative organic-N mineralization window
in cool greenhouse soil; literature says 4-6 weeks at warm-soil. We assume
4 to stay conservative on weekly supply (over-estimates the rate, which
under-estimates the residual gap → operator sees the real shortfall sooner).

Frontload is N-only by REQ-167. The supply implementation reinforces this
in two ways: (a) the frontload object is initialised with every element
in `LETTUCE_TISSUE_DW` set to 0 (explicit zero, not undefined — keeps
INV-1 element-coverage invariant intact); (b) only `frontload.N` is then
reassigned from the feather-meal formula. P / K / Ca / Mg / micros are
zero by both construction and absence-from-formula. Feather meal label is
13-0-0 so the zero is mechanistically correct, not a placeholder.

### `SME_LETTUCE_PPM` (cert 4 — direct measurement)

Berger Labs SME, sample 596616, laitue 1, 2026-04-10. Each entry tagged
in-line with in-spec / lockout status. Refresh on every Berger reorder.

---

## Per-element cert table (demand)

| Element | Cert | Notes                                                      |
|---------|------|------------------------------------------------------------|
| N       | 4    | Macro, well-documented                                     |
| P       | 4    | Macro, well-documented                                     |
| K       | 4    | Macro, well-documented                                     |
| Ca      | 4    | Macro, well-documented                                     |
| Mg      | 4    | Macro, well-documented                                     |
| Fe      | 3    | Micro, broader literature range                            |
| Mn      | 3    | Micro                                                      |
| Zn      | 3    | Micro                                                      |
| B       | 3    | Micro                                                      |
| Cu      | 3    | Micro                                                      |
| Mo      | 3    | Micro                                                      |

Per-element cert surfaced via the `lettuce-demand.<element>` pourquoi
modal built by the integrator.

---

## Refinement triggers

- **Tissue-test data lands** → re-fit `LETTUCE_TISSUE_DW` per element;
  graduate cert from 3/4 to 4/5 if measured matches within ±25 %.
- **Cycle length shifts** beyond 14 d (e.g. winter slower growth, summer
  faster) → re-check `LETTUCE_DM_FRACTION` on cycle-stratified samples;
  observable: cycle-stratified DW% drifts outside [4 %, 6 %].
- **Soil pH drops < 6.5** → relax P/Mn/Zn cap in the supply lockout gate;
  reread Berger SME first to confirm uptake. Observable: Mn/Zn SME values
  lift above the 0.03 ppm detection limit on two consecutive Berger
  readings; P SME passes 5 ppm (bottom of the soilless in-spec band, used
  here as a directional indicator only since SME ranges don't strictly
  apply to soil per Mehlich-3 + tissue lead).
- **Canopy-factor bounds** (currently `[0.2, 0.7]`) → revisit on either
  side:
  - *Floor 0.2*: drop if a stunted-bed transpiration measurement (e.g.
    bed-level water-balance over a stunted cycle vs a healthy one) shows
    actual transpiration < 20 % of mature-bed. Lift if Salanova drought
    response tightens stomata earlier than expected at low canopy.
  - *Ceiling 0.7*: lift toward 1.0 only if a tissue-test back-test at
    mature head (≥ 80 g currentG) shows soil mass-flow under-supplying
    macros that fertigation should not be sized for (Ca / Mg / K
    secondaries). Cap stays at 0.7 absent that signal — mass-flow
    over-pull beyond transpiration would over-credit soil and starve
    fertigation.
- **Foliar program ever wired for lettuce** → would add a foliar-supply
  channel to `calculateLettuceNutritionSupply`; out of scope today, no
  active lettuce foliar program, no return path tracked (the surfactant-
  on / yucca-return scenario in tomato derivation is also retired —
  `nutrition/tomato/foliar-strategy/learnings.md` § "Yucca return as a
  refinement trigger").

---

## Caveats

- **No stage axis.** Lettuce post-transplant is continuous; the Bilan does
  not bracket by phenology like tomato T1-T5. If a cultivar shift introduces
  a meaningful bolting / pre-bolt phase, revisit.
- **Density assumed uniform per-m².** The model treats every m² of
  Salanova bed as identical. Edge-row variance (more light + air at bed
  edges) is below the cert-3 floor of the rest of the model.
- **Supply demands a dependency bag.** `calculateLettuceNutritionSupply`
  reads no globals — every external input (recipe constants, soil ppm,
  irrigation volume, product analysis) is passed in. This keeps the model
  testable but moves shape-detection (e.g. mode-dispatch on STORED vs FP
  recipe) to the integrator at the call site, per the model-SRP rule.

---

## Implementation map

| File                                            | Owns                                                                                  |
|-------------------------------------------------|---------------------------------------------------------------------------------------|
| `nutrition/lettuce/plant-needs/data.js`         | `LETTUCE_DM_FRACTION`, `LETTUCE_TISSUE_DW`, `LETTUCE_FRONTLOAD_DEFAULTS`, `SME_LETTUCE_PPM` |
| `nutrition/lettuce/plant-needs/calc.js`         | `calculateLettuceNutritionDemand`, `calculateLettuceNutritionSupply`                  |
| `nutrition/lettuce/plant-needs/model.js`        | `window.PlantNeedsLettuce` namespace wrapper                                          |
| `nutrition/lettuce/plant-needs/spec.md`         | Spec                                                                                  |
| `nutrition/lettuce/plant-needs/derivation.md`   | This file                                                                             |
| `nutrition/lettuce/plant-needs/learnings.md`    | Rejected alternatives, deferred refinements                                           |

Build order in `app/index.html`: `data.js` → `calc.js` → `model.js`.
Consumers reach for `window.PlantNeedsLettuce`. The Salanova subpage
builder (`buildNutrimentLettuce` in `nutrition/lettuce/app/logic.js`)
supplies the dependency bag for `calculateLettuceNutritionSupply`.
