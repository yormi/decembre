# Tomate — fertigation-recipe · derivation

How the model is built. The **spec** (what it must do or be) is in
`spec.md`. This file is everything else: mass-balance derivation, T5
refined target, source tables (PA Taillon April 2026 + agronomist
context), refinement triggers. Rejected alternatives and superseded
policies live in `learnings.md` next door.

---

## Mass-balance derivation — K and Mg per stage

For each tomato stage `T1..T5`:

```
totalArea_m2          = TOMATO_NUM_BEDS × TOMATO_BED_AREA  // 7 × 54.7 = 382.9 m²

// ── K ──
k_offtake_mg/m²/wk    = TOMATO_FRUIT_EXPORT.K × stageYield × 1000 + BIOMASS_DEMAND[stage].K
k_sidedress_mg/m²/wk  = STORED_RECIPE.tomato.sidedress[stage].actisol_g
                         × PRODUCT_PCT.Actisol_K × SIDEDRESS_MIN_EFF.Actisol_K × 1000
                         / SIDEDRESS_AREA_PER_PLANCHE
k_needed_mg/m²/wk     = max(0, k_offtake − k_sidedress)
kSulfate_g_total      = round(k_needed / 1000 / PRODUCT_PCT.K2SO4_K × totalArea_m2)

// ── Mg ──
mg_offtake_mg/m²/wk   = TOMATO_FRUIT_EXPORT.Mg × stageYield × 1000 + BIOMASS_DEMAND[stage].Mg
mg_needed_mg/m²/wk    = max(0, mg_offtake)    // sidedress carries no Mg; compost not subtracted
mgSulfate_g_total     = round(mg_needed / 1000 / PRODUCT_PCT.MgSO4_Mg × totalArea_m2)
```

Compost release is **not** subtracted from either K or Mg — the
fertigation channel replenishes full plant offtake, and compost
contribution is accounted for separately as a soil-bank input (see
`nutrition/compost-contribution/spec.md`). Why-this-policy + the prior
"with-compost-subtraction" implementation + the reconciliation history
live in `learnings.md` (REQ-098 amended 2026-05-12 / 2026-05-13).

Implemented in `nutrition/tomato/fertigation-recipe/calc.js`:

```js
function computeStageRecipe(stage) {
  const y = RECIPE_INPUTS.stageYield[stage] || 0;
  const totalArea = TOMATO_NUM_BEDS * TOMATO_BED_AREA;
  const sd = STORED_RECIPE.tomato.sidedress[stage] || { actisol_g: 0, farine_g: 0 };
  const biomass = BIOMASS_DEMAND[stage] || {};

  // K offtake − sidedress (no compost)
  const k_offtake_mg = (TOMATO_FRUIT_EXPORT.K.g * 1000 * y) + (biomass.K || 0);
  const k_sd_mg = (sd.actisol_g * PRODUCT_PCT.Actisol_K
                   * (SIDEDRESS_MIN_EFF.K || 0.85) * 1000)
                   / SIDEDRESS_AREA_PER_PLANCHE;
  const k_fert_mg_per_m2 = Math.max(0, k_offtake_mg - k_sd_mg);
  const kSulfate = Math.round((k_fert_mg_per_m2 / 1000 / PRODUCT_PCT.K2SO4_K) * totalArea);

  // Mg offtake only (no sidedress, no compost)
  const mg_offtake_mg = (TOMATO_FRUIT_EXPORT.Mg.g * 1000 * y) + (biomass.Mg || 0);
  const mg_fert_mg_per_m2 = Math.max(0, mg_offtake_mg);
  const mgSulfate = Math.round((mg_fert_mg_per_m2 / 1000 / PRODUCT_PCT.MgSO4_Mg) * totalArea);

  return { mgSulfate, kSulfate };
}
```

---

## T5 refined target — PA Taillon April 2026

`FP_RECIPE_T5.fertigation` is a T5-only refined override on top of the
mass-balance derivation:

```js
{
  'K2SO4':       5167,   // PA Taillon April 2026 anchor
  'MgSO4-7H2O':  1379,   // PA Taillon April 2026 anchor
  'Solubore':       9,   // boric acid non-ionic, 100% eff at pH 7,4
}
```

The K2SO4 and MgSO4·7H2O numbers are the PA Taillon agronomist anchor —
they are NOT the bare mass-balance output of `computeStageRecipe('T5')`
under the current no-compost-subtraction policy. Mass-balance currently
returns kSulfate ≈ 5 322 g and mgSulfate ≈ 3 319 g at T5 (see per-stage
table below); the 5 167 / 1 379 anchor is held intentionally at PA
Taillon's April 2026 recommendation. The drift is normal field
correction (~3 % K, ~58 % Mg) and tracked at the Block 7 stored-vs-FP
gauge. Solubore (boric acid) is added as the T5-only B dose — see below.

### Per-element derivation at T5 (stageYield = 1.5 kg/m²/wk):

| Element | offtake mg/m²/wk | sidedress credit | needed mg/m²/wk | g/m² of product | g_total (× 382.9 m²) |
|---------|------------------|------------------|-----------------|-----------------|----------------------|
| K       | 6 000            | 232 (Actisol gated by REQ-089*) | 5 768  | K₂SO₄ 13.90     | 5 322                |
| Mg      | 855              | 0                | 855             | MgSO₄·7H₂O 8.67 | 3 319                |
| B       | 4.5              | 0                | 4.5             | Solubore 0.024  | 9                    |

\* Actisol K is currently still passed through the mass-balance K credit
term at 0.85 mineralization efficiency. REQ-089 / SME P-lockout
discussion governs whether Actisol stays as the sidedress vehicle going
forward; the formula does not gate Actisol K to zero on its own.

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

## Per-stage values

Sidedress K credit applied per `STORED_RECIPE.tomato.sidedress[stage]
.actisol_g` × `PRODUCT_PCT.Actisol_K` × `SIDEDRESS_MIN_EFF.Actisol_K`
(0.85) × 1000 ÷ `SIDEDRESS_AREA_PER_PLANCHE` (54.7). No compost term in
either column.

| Stage | stageYield kg/m²/wk | K offtake | − sidedress | K needed | kSulfate g | Mg offtake | Mg needed | mgSulfate g |
|-------|---------------------|-----------|-------------|----------|------------|------------|-----------|-------------|
| T1    | 0                   | 2 200     | 15          | 2 185    | 2 016      | 175        | 175       | 680         |
| T2    | 0                   | 2 950     | 46          | 2 904    | 2 679      | 265        | 265       | 1 029       |
| T3    | 0.3                 | 5 360     | 120         | 5 240    | 4 835      | 483        | 483       | 1 875       |
| T4    | 1.0                 | 4 440     | 194         | 4 246    | 3 917      | 688        | 688       | 2 670       |
| T5    | 1.5                 | 6 000     | 232         | 5 768    | 5 322      | 855        | 855       | 3 319       |

(Recomputed 2026-05-13 from live `BIOMASS_DEMAND`, `TOMATO_FRUIT_EXPORT`,
`RECIPE_INPUTS.stageYield`, `STORED_RECIPE.tomato.sidedress`,
`PRODUCT_PCT`, `SIDEDRESS_MIN_EFF`, `SIDEDRESS_AREA_PER_PLANCHE` via the
fertigation-recipe test-helpers boot. Re-derive with
`computeStageRecipe(stage)` for the current truth.)

T5 kSulfate (5 322) and mgSulfate (3 319) differ from the wired
`FP_RECIPE_T5.fertigation` override (5 167 / 1 379) — that's the PA
Taillon April 2026 anchor, intentionally held by hand and not updated to
the bare mass-balance. `wireFpFertigation()` at script load reads from
`FIRST_PRINCIPLES_T5_FERTIGATION` (data.js); the verifier (REQ-098)
confirms `computeStageRecipe('T5')` matches its own formula (not the
FP_RECIPE_T5 override — those are different concerns: model coherence
vs operator anchor).

`STORED_RECIPE.tomato.fertigation` (operational, weighed by team) is
hand-locked at PA Taillon's April 2026 values — `/retire-recipe` audit
trail governs edits there. This subproject defines only the
**first-principles target**; the stored values are operational and may
intentionally differ.

---

## Caveats and known limitations

- **Compost not subtracted on the K/Mg side** (REQ-098 amended 2026-05-12
  to drop the subtraction). See `learnings.md` for the prior policy +
  reconciliation history. Refinement: revisit only if tissue petiole
  consistently shows luxury Mg accumulation that warrants claiming an
  explicit compost credit.
- **B is T5-only constant, not stage-derived.** If B demand starts
  varying across stages (e.g. flowering-phase boron spike), extend
  `computeStageRecipe` to compute a third field. Currently fixed at
  9 g / 382.9 m² because demand is roughly flat 4-5 mg/m²/wk across
  T1-T5 and the Solubore dose at the dripper is the same for the full
  cycle.
- **Mass-balance vs PA Taillon T5 anchor.** `computeStageRecipe('T5')`
  recomputes from scratch every call; the FP target stored in
  `FP_RECIPE_T5.fertigation` is the agronomist-anchored value. Drift is
  normal (field correction). REQ-098 verifier checks
  `computeStageRecipe(stage)` matches its own formula, not the
  FP_RECIPE_T5 override — those are two different concerns (model
  coherence vs operator anchor).
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
- **Compost subtraction reconsidered.** If tissue panels suggest the
  current full-offtake fertigation is over-supplying Mg consistently
  across multiple cycles, revisit the no-compost-subtraction policy
  (REQ-098, current). See `learnings.md` for the retired version of the
  policy and what it would take to re-introduce a credit.
- **B becomes stage-aware.** Extend `computeStageRecipe` return shape to
  include `solubore_g` if flowering-phase B demand spikes meaningfully
  beyond the current 4-5 mg/m²/wk steady-state.

---

## Implementation map

| File                                                  | Owns                                                       |
|-------------------------------------------------------|------------------------------------------------------------|
| `nutrition/tomato/fertigation-recipe/data.js`         | FP T5 target values for `FP_RECIPE_T5.fertigation` (`FIRST_PRINCIPLES_T5_FERTIGATION`)        |
| `nutrition/tomato/fertigation-recipe/calc.js`         | `computeStageRecipe(stage)`, `computeFertigationSupply(stage, opts, recipe)`, `wireFpFertigation` IIFE |
| `nutrition/tomato/fertigation-recipe/model.js`        | `window.FertigationRecipeTomato` namespace wrapper         |
| `nutrition/tomato/fertigation-recipe/spec.md`         | Spec — what the model must do or be                        |
| `nutrition/tomato/fertigation-recipe/derivation.md`   | This file                                                  |
| `nutrition/tomato/fertigation-recipe/learnings.md`    | Rejected alternatives, retired policies (compost subtraction, mixing factor) |

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
- `computeStageRecipe(stage)` — moved to `calc.js`, formula identical
  to the in-place version, with the 2026-05-12 amendment dropping the
  compost-subtraction term.
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
