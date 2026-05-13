# Tomate — fertigation-recipe · derivation

How the model is built. The **spec** (what it must do or be) is in
`spec.md`. This file is everything else: mass-balance derivation, T5
refined target, source tables (PA Taillon April 2026 + agronomist
context), refinement triggers.

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

## Supply derivation — `computeFertigationSupply` (REQ-151)

The supply side answers a separate question from the sizer: **"given a
recipe in grams per total tomato area per week, how many mg per m² per
week of each element does fertigation deliver?"**

### Formula (per element)

```
totalArea_m²        = TOMATO_NUM_BEDS × TOMATO_BED_AREA   // 7 × 54.7 = 382.9
delivered_mg_per_m² = (product_grams × element_pct × 1000) / totalArea_m²
```

`element_pct` is the mass fraction of the element in the product, drawn
from `PRODUCT_PCT` (declared upstream in `app/index.html`). The `× 1000`
converts grams to milligrams. No pH-response, no mixing-factor, no
coverage discount: all three products in current fertigation use are
non-precipitating at pH 7.4 in the dripper line (K₂SO₄, MgSO₄·7H₂O,
H₃BO₃), and the barrel delivers their full mass to the bed.

### Per-element table (canonical T5 recipe — PA Taillon April 2026 anchor)

| Element | Product            | g/area/wk | `element_pct` | Delivered mg/m²/wk |
|---------|--------------------|-----------|---------------|--------------------|
| K       | K₂SO₄              | 5 167     | 0.4150        | 5 597              |
| Mg      | MgSO₄·7H₂O         | 1 379     | 0.0985        | 355                |
| B       | Solubore (H₃BO₃)   | 9         | 0.205         | 4.82               |

(Numbers shift with the recipe; the table is illustrative at the
canonical T5 anchor — refresh from `data.js` × `computeFertigationSupply`
when re-checking.)

### Why no pH-response gate

The supply formula deliberately omits the `phResponse[phClass](currentPh)`
multiplier that `effectiveEff` applies to soil-applied micro-sulfates —
soil channels must apply pH-aware effective efficiency (REQ-017). Reason: K₂SO₄ and MgSO₄·7H₂O dissociate cleanly into K⁺ / Mg²⁺
/ SO₄²⁻ in the dripper line at pH 6.2 (water input) and don't
precipitate before reaching the root zone. H₃BO₃ is non-ionic at pH ≤ 9.
The pH-response curves matter for soil-bound applications (foliar Mn/Zn
sulfates on lockout soil, sidedress Fe-SO₄ on calcareous beds); they're
not relevant to the products in the fertigation channel today. If a
future fertigation recipe adds an oligo-sulfate (e.g. FeSO₄ at lower
soil pH), this section gets revisited and a phResponse hook lands in
the supply function.

### Caller-side reshape patterns

The model function accepts ONE canonical recipe shape:
`{ kSulfate_g, mgSulfate_g, solubore_g }`. Callers reshape into that
canonical input from whichever upstream source applies — the function
itself never branches on source.

Stored mode (`STORED_RECIPE.tomato.fertigation[stage]` shape):

```js
const stored = STORED_RECIPE.tomato.fertigation[stage];   // { kSulfate, mgSulfate }
const recipe = {
  kSulfate_g:  stored.kSulfate  || 0,
  mgSulfate_g: stored.mgSulfate || 0,
  solubore_g:  0,                                          // stored mode has no B
};
const supply = window.FertigationRecipeTomato.computeFertigationSupply(stage, {}, recipe);
```

FP mode (`FP_RECIPE_T5.fertigation` shape):

```js
const fp = FP_RECIPE_T5.fertigation;                       // { 'K2SO4', 'MgSO4-7H2O', 'Solubore' }
const recipe = {
  kSulfate_g:  fp['K2SO4']       || 0,
  mgSulfate_g: fp['MgSO4-7H2O']  || 0,
  solubore_g:  fp['Solubore']    || 0,
};
const supply = window.FertigationRecipeTomato.computeFertigationSupply(stage, {}, recipe);
```

Default-source convenience: omitting `recipe` is equivalent to passing
the reshape of `STORED_RECIPE.tomato.fertigation[stage]`. Provided so
admin consumers that don't care about FP mode have a one-arg call site.

### Why no `details` in the return

Contribution-channel functions must return per-element cert and cap
details alongside the flat `mg` map (REQ-136). For
fertigation, the cap detection depends on current pH state + which
elements are sourced — context that lives in the caller, not in the
model function (SRP). The `computeFoliarSupply` function set this
precedent: returns a flat map; details are built in
`nutrition/tomato/app/logic.js` at the caller from the supplied values
+ page state. Fertigation follows the same shape. Retrofitting both
into `{ perM2_mg, details }` is a separate REQ when the consumer is
ready.

### Cert table

| Element | Cert | Reasoning                                                  |
|---------|------|------------------------------------------------------------|
| K       | 4    | K₂SO₄ structural, organic-cert-listed, sulfate dissociates cleanly. |
| Mg      | 4    | MgSO₄·7H₂O same product class.                            |
| B       | 3    | Solubore (H₃BO₃) FP-only at T5; supply confirmed but the dose number itself is the cert-3 anchor (PA Taillon recommendation, not field-measured). |

Verifier asserts cert in `[0, 5]` per element with non-zero delivery
when the caller composes `details` (REQ-136 compliance lives at the
caller side; spec ref pinned in `app/spec.md` retrofit work, not here).

---

## Why no mixing factor (retired 2026-05-10)

Fertigation supply is reported at the full barrel-loaded mass per m²/sem
in both modes. Earlier (2026-05-05 → 2026-05-10) the consumer applied a
mode-aware split (`MIXING_FACTOR_STORED = 0.5`, `MIXING_FACTOR_FP = 1.0`,
REQ-100) on the premise that ~50 % of stored-mode fertigation re-enters
the SME pool and would double-count if summed on top of `supply.soil`.

Concept dropped: the 0.5 number was a cert 2-3 guess with no measured
anchor at Décembre, and the double-count framing was artificial — SME is
already a separate channel in the supply readout, so users compare them
rather than blending. Full barrel mass is the honest reporting.

REQ-100 deleted from spec; constants removed from `data.js` and
`window.FertigationRecipeTomato`. Number not reused (project policy).

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
| `nutrition/tomato/fertigation-recipe/data.js`         | FP T5 target values for `FP_RECIPE_T5.fertigation` (`FIRST_PRINCIPLES_T5_FERTIGATION`)        |
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
- `MIXING_FACTOR_FERT` — retired 2026-05-10. Was first split mode-aware
  (REQ-100, 2026-05-08) then dropped entirely. Fertigation supply is now
  reported at full barrel mass; consumer line in `calcNutrSupply` no
  longer multiplies by any factor.
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
