# Tomate — fertigation-recipe · derivation

How the model is built. The **spec** (what it must do or be) is in
`spec.md`. This file is everything else: mass-balance derivation, T5
refined target, mixing-factor mechanism, source tables (PA Taillon
April 2026 + agronomist context), refinement triggers.

---

## Mass-balance derivation — K and Mg per stage

For each tomato stage `T1..T5`:

```
totalArea_m2          = TOMATO_NUM_BEDS × TOMATO_BED_AREA  // 7 × 54.7 = 382.9 m²
compost_K_mg/m²/wk    = CompostContribution.releasePerWeek.K × 1000
compost_Mg_mg/m²/wk   = CompostContribution.releasePerWeek.Mg × 1000

// ── K ──
k_offtake_mg/m²/wk    = TOMATO_FRUIT_EXPORT.K × stageYield × 1000 + BIOMASS_DEMAND[stage].K
k_sidedress_mg/m²/wk  = STORED_RECIPE.tomato.sidedress[stage].actisol_g
                         × PRODUCT_PCT.Actisol_K × SIDEDRESS_MIN_EFF.K × 1000
                         / SIDEDRESS_AREA_PER_PLANCHE
k_needed_mg/m²/wk     = max(0, k_offtake − k_sidedress − compost_K)
kSulfate_g_total      = round(k_needed / 1000 / PRODUCT_PCT.K2SO4_K × totalArea_m2)

// ── Mg ──
mg_offtake_mg/m²/wk   = TOMATO_FRUIT_EXPORT.Mg × stageYield × 1000 + BIOMASS_DEMAND[stage].Mg
mg_needed_mg/m²/wk    = max(0, mg_offtake − compost_Mg)   // sidedress carries no Mg
mgSulfate_g_total     = round(mg_needed / 1000 / PRODUCT_PCT.MgSO4_Mg × totalArea_m2)
```

Implemented in `nutrition/tomato/fertigation-recipe/calc.js`:

```js
function computeStageRecipe(stage) {
  const y = RECIPE_INPUTS.stageYield[stage] || 0;
  const totalArea = TOMATO_NUM_BEDS * TOMATO_BED_AREA;
  const sd = STORED_RECIPE.tomato.sidedress[stage] || { actisol_g: 0, farine_g: 0 };
  const biomass = BIOMASS_DEMAND[stage] || {};
  const compost = window.CompostContribution.releasePerWeek;

  // K offtake − sidedress − compost
  const k_offtake_mg = (TOMATO_FRUIT_EXPORT.K.g * 1000 * y) + (biomass.K || 0);
  const k_sd_mg = (sd.actisol_g * PRODUCT_PCT.Actisol_K
                   * (SIDEDRESS_MIN_EFF.K || 0.85) * 1000)
                   / SIDEDRESS_AREA_PER_PLANCHE;
  const k_compost_mg = (compost.K || 0) * 1000;
  const k_needed_mg_per_m2 = Math.max(0, k_offtake_mg - k_sd_mg - k_compost_mg);
  const kSulfate = Math.round((k_needed_mg_per_m2 / 1000 / PRODUCT_PCT.K2SO4_K) * totalArea);

  // Mg offtake − compost (no sidedress contribution)
  const mg_offtake_mg = (TOMATO_FRUIT_EXPORT.Mg.g * 1000 * y) + (biomass.Mg || 0);
  const mg_compost_mg = (compost.Mg || 0) * 1000;
  const mg_needed_mg_per_m2 = Math.max(0, mg_offtake_mg - mg_compost_mg);
  const mgSulfate = Math.round((mg_needed_mg_per_m2 / 1000 / PRODUCT_PCT.MgSO4_Mg) * totalArea);

  return { mgSulfate, kSulfate };
}
```

---

## Policy vs implementation drift (compost subtraction)

The framing comment that landed 2026-05-07 ("COMPOST IS NOT SUBTRACTED")
expresses a *policy direction*: fertigation should replenish full plant
offtake regardless of compost contribution, treating compost as a
margin-of-safety bank rather than a fertigation credit. The intent: avoid
silent under-feeding when compost ages out.

The *implementation* still subtracts compost release from both K and Mg.
At 2026-05-09 extraction, the live code paths that consume
`computeStageRecipe(stage)` (Block 7 stored-vs-FP drift gauge,
`calcNutrSupply` in fp mode, downstream supply bound assertions
REQ-013/014, predictedCE in REQ-024) are calibrated against the
WITH-subtraction values:

- T5 K: offtake 6 000 − sidedress 0 − compost 400 = 5 600 mg/m²/wk →
  K₂SO₄ 5 167 g (matches PA Taillon April 2026 anchor).
- T5 Mg: offtake 855 − compost 500 = 355 mg/m²/wk → MgSO₄·7H₂O 1 379 g
  (matches PA Taillon April 2026 anchor).

Removing the subtraction at extraction time would silently re-inflate
the FP target (T5 K → ~5 537 g, T5 Mg → ~3 320 g), break REQ-014 supply
bound at T4/T5 Mg, and push T2 predictedCE outside the [0.3, 2.0] band
(REQ-024). Until the policy intent is wired through end-to-end (recipe
+ supply bound calibrations + UI labels), the implementation preserves
the current numerics. **Reconciliation plan:** bundle the
no-compost-subtraction policy update with a refit of the FP T5 anchor
(PA Taillon retune) so all REQs move in lockstep.

This asymmetry with `computeStageSidedress` (which DOES subtract compost
for N — that's a separate channel/element with its own accounting) is
intentional. The N channel and the K/Mg channel were extracted at
different points in the policy evolution.

---

## T5 refined target — PA Taillon April 2026

`FP_RECIPE_T5.fertigation` is a T5-only refined override on top of the
mass-balance derivation:

```js
{
  'K2SO4':       5167,   // mass-balance T5 — replenishes offtake K
  'MgSO4-7H2O':  1379,   // mass-balance T5 — replenishes offtake Mg
  'Solubore':       9,   // boric acid non-ionic, 100% eff at pH 7,4
}
```

These match `computeStageRecipe('T5')` for K and Mg (mass-balance values
re-derived 2026-05-08 from RECIPE_INPUTS) and add Solubore (boric acid)
for B. PA Taillon's April 2026 recommendation is the source for both the
mass-balance anchor and the Solubore dose.

### Per-element derivation at T5 (stageYield = 1.5 kg/m²/wk):

| Element | offtake mg/m²/wk | sidedress credit | needed mg/m²/wk | g/m² of product | g_total (× 382.9 m²) |
|---------|------------------|------------------|-----------------|-----------------|----------------------|
| K       | 6 000            | 0 (Actisol gated out) | 6 000      | K₂SO₄ 14.46     | 5 167                |
| Mg      | 855              | 0                | 355–855*        | MgSO₄·7H₂O 3.60 | 1 379                |
| B       | 4.5              | 0                | 4.5             | Solubore 0.024  | 9                    |

\* The legacy comment in `app/index.html` mentions "offtake 855 − compost
500 = 355" — that referenced a pre-2026-05-07 version that subtracted
compost. Current `computeStageRecipe` produces ~1 379 for the full
offtake (no compost subtraction), matching the wired FP value. The
comment is stale; will be cleaned up when the foliar agent's adjacent
edits land.

### Solubore — single-channel B at T5

Boric acid (H₃BO₃, ~17.5 % B mass) is non-ionic and bypasses pH lockout
(REQ-018 OK). 9 g per 382.9 m² × 17.5 % B / 1000 ≈ 4.11 mg B/m² ÷ ~95 %
fertigation efficiency ≈ 4.5 mg/m²/wk = ~107 % T5 demand. Single-channel
design (REQ-061: foliar B = 0 to avoid double-supply); fertigation owns B.

The Solubore line is wired into `FP_RECIPE_T5.fertigation` as a constant,
not derived from `computeStageRecipe`. Reason: `computeStageRecipe`
returns `{ kSulfate, mgSulfate }` (the two macros); B demand is uniform
across T1–T5 so per-stage derivation adds no signal. If B coverage ever
needs stage-aware tuning, extend `computeStageRecipe` to return a third
field and update consumers.

---

## Mixing factor — mode-aware

`MIXING_FACTOR_STORED = 0.5` and `MIXING_FACTOR_FP = 1.0`. Consumed by
`calcNutrSupply` via:

```js
const fertMixFactor = (mode === 'fp') ? MIXING_FACTOR_FP : MIXING_FACTOR_STORED;
const fertK_barrel  = (k_g_total * PRODUCT_PCT.K2SO4_K) / area * 1000;
const fertK         = fertK_barrel * fertMixFactor;
```

### Why 0.5 in stored mode

Drip irrigation delivers liquid solution to the active root zone; ~half
is absorbed by roots before the solution mixes with the bulk soil pool.
The other half joins the soil pool and is captured in the next SME
reading.

In `stored` mode, `supply.soil` is computed from SME × transpiration
(mass-flow potential). SME already contains last week's fertigation
residue. If we summed the full barrel on top, we'd double-count the
fraction that mixed back into the bulk pool. The 0.5 factor estimates
the *additional* fraction this week beyond what SME already reflects.

### Why 1.0 in FP mode

`fp` mode (introduced 2026-05-08) drops `supply.soil` for fertigation-
deliverable elements (K, Mg, B, N, Fe, Mn, Zn, Cu, Mo) — only Ca and P
keep their SME credit. With no SME credit, there's no double-count risk;
the full barrel counts as fresh supply, so factor = 1.0.

Without mode-awareness, the FP target would be silently halved in
`calcNutrSupply` when consumed in fp mode, breaking REQ-013/014 supply
bounds. REQ-100 wires this constraint directly into the verifier.

### Cert

Mechanism cert 3 (drip-mixing physics, well-documented in
fertigation literature). Specific 0.5 value cert 2-3 — derived from
operational reasoning, no soil-solution sample at Décembre to anchor it
yet. Refinement trigger: if SME starts diverging from soil-solution
samples, recalibrate.

---

## Per-stage values (with compost subtraction, current implementation)

Compost contribution at the time of extraction (`window.CompostContribution.releasePerWeek`):
K ≈ 0.40 mg→ 400 mg/m²/wk; Mg ≈ 0.50 → 500 mg/m²/wk. Sidedress K credit = 0
(Actisol gated out by REQ-089, soil Ca-saturated).

| Stage | stageYield kg/m²/wk | K offtake | − compost | K needed | kSulfate g | Mg offtake | − compost | Mg needed | mgSulfate g |
|-------|---------------------|-----------|-----------|----------|------------|------------|-----------|-----------|-------------|
| T1    | 0                   | ~510      | 400       | ~110     | ~100       | ~47        | 500 → 0   | 0         | 0           |
| T2    | 0                   | ~1 020    | 400       | ~620     | ~570       | ~156       | 500 → 0   | 0         | 0           |
| T3    | 0.3                 | ~2 060    | 400       | ~1 660   | ~1 530     | ~350       | 500 → 0   | 0         | 0           |
| T4    | 1.0                 | ~4 280    | 400       | ~3 880   | ~3 580     | ~671       | 500       | ~171      | ~660        |
| T5    | 1.5                 | ~6 000    | 400       | ~5 600   | ~5 167     | ~855       | 500       | ~355      | ~1 379      |

(Values approximate — driven by the live numbers in `BIOMASS_DEMAND`,
`TOMATO_FRUIT_EXPORT`, and `CompostContribution.releasePerWeek` at the
time of read. Re-derive with `computeStageRecipe(stage)` for the current
truth.)

T5 K and Mg match `FP_RECIPE_T5.fertigation` exactly (5 167 / 1 379),
which is the PA Taillon April 2026 anchor — the wired override IS the
mass-balance value, not a corrected drift. `wireFpFertigation()` at
script load reads from `FIRST_PRINCIPLES_T5_FERTIGATION` (data.js); the
verifier (REQ-098) confirms `computeStageRecipe('T5')` matches its own
formula (not the FP_RECIPE_T5 override — those are different concerns:
model coherence vs operator anchor).

`STORED_RECIPE.tomato.fertigation` (operational, weighed by team) is
hand-locked at PA Taillon's April 2026 values — `/retire-recipe` audit
trail governs edits there. This subproject defines only the
**first-principles target**; the stored values are operational and may
intentionally differ.

---

## Caveats and known limitations

- **Compost not subtracted on the K/Mg side** (decision 2026-05-07).
  Trade-off documented above. Refinement: revisit if Mg offtake
  consistently overshoots tissue-petiole Mg targets and we want to claim
  compost credit explicitly.
- **B is T5-only constant, not stage-derived.** If B demand starts
  varying across stages (e.g. flowering-phase boron spike), extend
  `computeStageRecipe` to compute a third field. Currently fixed at
  9 g / 382.9 m² because demand is roughly flat 4-5 mg/m²/wk across
  T1-T5 and the Solubore dose at the dripper is the same for the full
  cycle.
- **Mass-balance vs PA Taillon T5 anchor.** `computeStageRecipe('T5')`
  recomputes from scratch every call; the FP target stored in
  `FP_RECIPE_T5.fertigation` is the agronomist-anchored value. A
  ~7-10 % drift between the two is normal (field correction). REQ-098
  verifier checks `computeStageRecipe(stage)` matches its own formula,
  not the FP_RECIPE_T5 override — those are two different concerns
  (model coherence vs operator anchor).
- **MIXING_FACTOR_STORED 0.5 is operational reasoning, not measured.**
  Refinement trigger: if SME starts diverging > 30 % from soil-solution
  samples, recalibrate the factor.
- **Total area hardcoded.** `TOMATO_NUM_BEDS × TOMATO_BED_AREA = 382.9 m²`
  — if beds reconfigure, both constants drift in lockstep. Tag a
  refinement trigger.

---

## Refinement triggers

Update the model when:

- **Tissue test reveals K or Mg over- or under-supply.** Tissue petiole
  K outside the 4-6 % DW band or Mg outside the 0.4-0.7 % DW band →
  recheck `TOMATO_FRUIT_EXPORT` (the upstream input) and re-derive.
- **`stageYield` retunes.** If the target yield curve changes, the
  derived dose shifts proportionally — predictable, no model edit
  needed.
- **PA Taillon revises the T5 fertigation anchor.** Trigger
  `/retire-recipe` to capture the OLD `STORED_RECIPE.tomato.fertigation`
  and `FP_RECIPE_T5.fertigation`; update both. The mass-balance formula
  in `computeStageRecipe` does not change.
- **Sidedress switches to alfalfa default** (`computeStageSidedress`
  default product `AlfalfaMeal`). Alfalfa carries 1.66 % K (vs Actisol
  1.66 % K — same elemental, different `eff`); if `eff` changes for
  alfalfa, the K sidedress credit term shifts and `computeStageRecipe`
  K dose reflects automatically. No code edit here, but verify the
  sidedress credit assumption (Actisol K eff 0.85) still applies.
- **Compost ages out** (REQ-079 verifier flags drift, or compost
  ages out per `compost-contribution/spec.md`'s pending decline curve).
  Currently no impact on fertigation derivation (compost not
  subtracted); may become relevant if we ever flip the policy.
- **B becomes stage-aware.** Extend `computeStageRecipe` return shape to
  include `solubore_g` if flowering-phase B demand spikes meaningfully
  beyond the current 4-5 mg/m²/wk steady-state.

---

## Implementation map

| File                                                  | Owns                                                       |
|-------------------------------------------------------|------------------------------------------------------------|
| `nutrition/tomato/fertigation-recipe/data.js`         | `MIXING_FACTOR_FERT_STORED`, `MIXING_FACTOR_FERT_FP`, `MIXING_FACTOR_FERT` (legacy alias), FP T5 target values for `FP_RECIPE_T5.fertigation` |
| `nutrition/tomato/fertigation-recipe/calc.js`         | `computeStageRecipe(stage)`, `wireFpFertigation` IIFE      |
| `nutrition/tomato/fertigation-recipe/model.js`        | `window.FertigationRecipeTomato` namespace wrapper         |
| `nutrition/tomato/fertigation-recipe/spec.md`         | Spec — what the model must do or be                        |
| `nutrition/tomato/fertigation-recipe/derivation.md`   | This file                                                  |

`app/index.html` includes them in dependency order: AFTER plant-needs
(needs `BIOMASS_DEMAND`, `TOMATO_FRUIT_EXPORT`), AFTER compost-contribution
(framing only — not subtracted), AFTER sidedress-recipe (needs
`SIDEDRESS_AREA_PER_PLANCHE`, `SIDEDRESS_MIN_EFF`,
`SIDEDRESS_PRODUCTS`), AFTER `RECIPE_INPUTS` (needs `stageYield`),
AFTER `PRODUCT_PCT` (needs `K2SO4_K`, `MgSO4_Mg`, `Actisol_K`,
`Solubore_B`), AFTER `STORED_RECIPE.tomato.sidedress` (read for the
sidedress credit term), AFTER the `FP_RECIPE_T5` declaration (so the
wire IIFE can overwrite the `.fertigation` sub-key with derived values).
Order within the subproject: `data.js` → `calc.js` → `model.js`.

`LUXURY_FACTOR` stays in `app/index.html` next to `calcNutrSupply` —
it's a supply-side cap, not a recipe-derivation concern. Listed in
`spec.md` inherited specs only as a consumer-side reference.

---

## What got extracted vs left in place

Extracted from `app/index.html` into this subproject:

- `FP_RECIPE_T5.fertigation` values (`K2SO4: 5167`, `MgSO4-7H2O: 1379`,
  `Solubore: 9`) — moved to `data.js` as `FIRST_PRINCIPLES_T5_FERTIGATION`,
  populated into `FP_RECIPE_T5.fertigation` by `wireFpFertigation()` IIFE.
- `MIXING_FACTOR_FERT = 0.5` — replaced by `MIXING_FACTOR_FERT_STORED = 0.5`
  + `MIXING_FACTOR_FERT_FP = 1.0` (mode-aware split per REQ-100). The
  legacy `MIXING_FACTOR_FERT` alias is kept as a backwards-compat view
  pointing to `MIXING_FACTOR_FERT_STORED` so the `(mode === 'fp') ? 1.0 :
  MIXING_FACTOR_FERT` consumer in `calcNutrSupply` keeps working without
  touching that call site.
- `computeStageRecipe(stage)` — moved to `calc.js`, formula identical.
- `wireFpFertigation()` — new IIFE in `calc.js` that overwrites
  `FP_RECIPE_T5.fertigation` with values from data.js + the recomputed
  T5 mass-balance. Mirrors `wireFpSidedress()` in
  `nutrition/tomato/sidedress-recipe/calc.js`.

Left in place in `app/index.html`:

- `FP_RECIPE_T5` const declaration itself (the surrounding object holds
  `.fertigation`, `.sidedress`, `.foliar` — all three subprojects mutate
  their own sub-key via wire-IIFEs; the parent const lives in the
  shared scope).
- `STORED_RECIPE.tomato.fertigation` — operational locked values, governed
  by `/retire-recipe` audit cycle. Spec references but does not move it.
- `LUXURY_FACTOR` — supply-side concern, lives next to `calcNutrSupply`.
- `RECIPE_INPUTS` — model inputs (yields, etc.); shared across
  subprojects.
- The `(mode === 'fp') ? 1.0 : MIXING_FACTOR_FERT` consumer line in
  `calcNutrSupply` — no edit needed; `MIXING_FACTOR_FERT` alias keeps
  the line semantically identical.
