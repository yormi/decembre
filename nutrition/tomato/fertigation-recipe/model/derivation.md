# Tomate — fertigation-recipe · derivation

Why each number is what it is, for the live REQs in `spec.md`. Rejected alternatives and historical decisions live in `learnings.md`.

---

## Mass-balance derivation — K, Mg, B per stage

For each stage `T1..T5`, fertigation = plant demand inflated by per-element uptake factor, minus current-week supply from compost + sidedress. Soil-bank credit applies only to {P, Ca} (neither in fertigation), so K + Mg + B branches only.

Two corrections on top of pure offtake:

1. **Compost release is current-week supply, not a bank.** Subtract it (REQ-098). 2026-05-12 amendment that dropped this term was a category error, reverted 2026-05-15 per B1-REV (see `learnings.md`).
2. **Bed → plant transfer < 100 %** at Décembre soil (pH 7.28, Ca 10 989 kg/ha). `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL` inflates demand so plant uptake equals demand after the discount. Factor applies uniformly to all bed sources, so it pulls out as a single division on the demand term (REQ-155, added 2026-05-15 per B2-REV).

```
totalArea_m2          = TOMATO_NUM_BEDS × TOMATO_BED_AREA  // 7 × 54.7 = 382.9 m²

// ── K (uptake factor 0.90) ──
k_demand_mg/m²/wk     = TOMATO_FRUIT_EXPORT.K × stageYield × 1000 + BIOMASS_DEMAND[stage].K
k_demand_to_bed       = k_demand / PH_UPTAKE_FACTOR_AT_CURRENT_SOIL.K
k_sidedress_mg/m²/wk  = STORED_RECIPE.tomato.sidedress[stage].actisol_g
                         × PRODUCT_PCT.Actisol_K × SIDEDRESS_MIN_EFF.Actisol_K × 1000
                         / SIDEDRESS_AREA_PER_PLANCHE
k_compost_mg/m²/wk    = CompostContribution.releasePerWeek.K × 1000
k_needed_mg/m²/wk     = max(0, k_demand_to_bed − k_sidedress − k_compost)
kSulfate_g_total      = round(k_needed / 1000 / PRODUCT_PCT.K2SO4_K × totalArea_m2)

// ── Mg (uptake factor 0.85) ──
mg_demand_mg/m²/wk    = TOMATO_FRUIT_EXPORT.Mg × stageYield × 1000 + BIOMASS_DEMAND[stage].Mg
mg_demand_to_bed      = mg_demand / PH_UPTAKE_FACTOR_AT_CURRENT_SOIL.Mg
mg_compost_mg/m²/wk   = CompostContribution.releasePerWeek.Mg × 1000
mg_needed_mg/m²/wk    = max(0, mg_demand_to_bed − mg_compost)    // sidedress carries no Mg
mgSulfate_g_total     = round(mg_needed / 1000 / PRODUCT_PCT.MgSO4_Mg × totalArea_m2)

// ── B / Solubore (uptake factor 0.80) ──
b_demand_mg/m²/wk     = TOMATO_FRUIT_EXPORT.B × stageYield × 1000 + BIOMASS_DEMAND[stage].B
b_demand_to_bed       = b_demand / PH_UPTAKE_FACTOR_AT_CURRENT_SOIL.B
b_compost_mg/m²/wk    = (CompostContribution.releasePerWeek.B || 0) × 1000   // typically 0
b_needed_mg/m²/wk     = max(0, b_demand_to_bed − b_compost)
solubore_g_total      = round(b_needed / 1000 / PRODUCT_PCT.Solubore_B × totalArea_m2)
```

Implemented in `calc.js` — `computeStageRecipe(stage)` returns `{ kSulfate, mgSulfate, solubore }` in grams (× 382.9 m²).

---

## T5 refined target — mass-balance output

`FP_RECIPE_T5.fertigation` at T5 is the live `computeStageRecipe('T5')` reshape, wired at boot by `wireFpFertigation()`. REQ-154: `FIRST_PRINCIPLES_T5_FERTIGATION` equals function output by construction.

```js
{
  'K2SO4':       5568,   // computeStageRecipe('T5').kSulfate
  'MgSO4-7H2O':  1963,   // computeStageRecipe('T5').mgSulfate
  'Solubore':      11,   // computeStageRecipe('T5').solubore
}
```

B2-REV shifts (2026-05-15, uptake-factor inflation): K 4 953 → **5 568** (+12 %), Mg 1 378 → **1 963** (+42 %), Solubore 9 → **11** (+22 %). PA Taillon's pre-amendment anchor (K 5 167 / Mg 1 379) no longer matches by construction — anchor was set under an implicit 100 %-uptake assumption.

Stored-vs-FP drift values at Block 7/8 (informational; STORED moves on operator timing via `/retire-recipe`, not under FP-target pressure per P-13):
- **Mg:** STORED 1 396 g, FP 1 963 g (FP / STORED = 1.41×)
- **K:** STORED 3 489 g, FP 5 568 g (FP / STORED = 1.60×)
- **Solubore:** STORED 7 g, FP 11 g (FP / STORED = 1.57×)

### Per-element derivation at T5 (stageYield = 1.5 kg/m²/wk)

| Element | demand mg/m²/wk | uptake factor | demand_to_bed | − sidedress | − compost | needed mg/m²/wk | g_total (× 382.9 m²) |
|---------|-----------------|---------------|---------------|-------------|-----------|-----------------|----------------------|
| K       | 6 000           | 0.90          | 6 667         | 234*        | 400       | 6 033           | K₂SO₄ **5 568**      |
| Mg      | 855             | 0.85          | 1 006         | 0           | 500       | 506             | MgSO₄·7H₂O **1 963** |
| B       | 4.5             | 0.80          | 5.625         | 0           | 0         | 5.625           | Solubore **11**      |

\* Actisol K passed through at 0.85 mineralization efficiency. REQ-089 / SME P-lockout governs whether Actisol stays as the sidedress vehicle; formula does not gate Actisol K to zero.

#### Active-channels sum vs REQ-013 / REQ-014 envelope at T5

Active-channels sum = compost + sidedress + fertigation + foliar (REQ-013 / REQ-014 in `nutrition/tomato/spec.md`). Foliar K / Mg / B = 0 (foliar carries Mn / Zn / Cu / Fe only; B is single-channel fertigation per REQ-061). Bank K + Mg mass-flow is **outside** the sum by REQ-141 architectural choice.

| Element | Compost | Sidedress | Fertigation | Foliar | Active sum (bed) | Demand | Bed-side ratio | Plant-side ratio (× uptake factor) |
|---------|---------|-----------|-------------|--------|------------------|--------|----------------|-------------------------------------|
| K       | 400     | 234       | 6 033       | 0      | 6 667            | 6 000  | **1.11×**      | 1.00× (6 667 × 0.90 = 6 000)        |
| Mg      | 500     | 0         | 506         | 0      | 1 006            | 855    | **1.18×**      | 1.00× (1 006 × 0.85 = 855)          |
| B       | 0       | 0         | 5.89        | 0      | 5.89             | 4.5    | **1.31×**      | 1.05× (5.89 × 0.80 = 4.71)          |

All three elements land plant-side at 1.00-1.05× demand by construction of the uptake-factor-inflated sizer (REQ-155), well inside REQ-014's 1.3× cap. Bed-side ratio for B nicks 1.3× at the boundary; plant-side is the comparison REQ-013 / REQ-014 actually use (channel supply uses pH-aware effective efficiency per REQ-017, and uptake factor inflates demand uniformly across bed sources).

T1-T2 Mg is the only cell where the active-channels sum runs hot vs demand: at T1, compost Mg 500 × 0.85 = 425 mg/m²/wk plant-side vs demand 175 → **2.43× demand** (REQ-014 cap breach). Fertigation Mg = 0 at those stages; the overshoot comes entirely from compost release. Acceptable under REQ-098 reversal framing — compost-release surplus accumulates in the soil-bank Mg pool by design (already 1 646 kg/ha pre-existing pool; the calcitic-lime compost amendment is the root cause, not a recipe-side fix). Operator-side does not size against T1-T2 Mg cap.

### Solubore — single-channel B at T5

Solubor / disodium octaborate tetrahydrate (Na₂B₈O₁₃·4H₂O, 20.5 % B mass — Eti Maden Etidot-67; supplier link in `nutrition/doc/context.md`). Non-ionic in solution, bypasses pH lockout (REQ-018 OK). 11 g × 20.5 % B / 382.9 m² × 1000 ≈ 5.89 mg/m²/wk B delivered to bed — covers the per-element table's 5.625 mg/m²/wk demand_to_bed (plant demand 4.5 mg/m²/wk ÷ REQ-155 B uptake factor 0.80). Single-channel (REQ-061: foliar B = 0).

---

## Uptake-efficiency factor (REQ-155)

Supply formula prior to 2026-05-15 implicitly assumed `delivered_to_bed = taken_up_by_plant`. That conflated:

- **Dripper-line non-precipitation** — defended by chemistry (K₂SO₄ / MgSO₄·7H₂O dissociate cleanly at water-pH 6.2; Solubor hydrolyzes to H₃BO₃, non-ionic and non-precipitating in the dripper line).
- **Root-zone uptake at Décembre soil** (pH 7.28, Ca 10 989 kg/ha, CEC 28-33 meq/100g, Ca-saturated) — not defended by chemistry, actively discounted by literature.

REQ-155 makes the root-zone discount explicit. Factor applies uniformly to all bed sources (root competes with Ca-saturated CEC regardless of ion origin), so it pulls out as a single division on demand.

**Per-element factors (cert 2, literature mid-band):**

| Element | Factor | Mechanism                                                                                                                |
|---------|--------|--------------------------------------------------------------------------------------------------------------------------|
| K       | 0.90   | Ca²⁺ competes with K⁺ at root membrane. Literature 5-15 % suppression on Ca-rich beds; 0.90 = mid-band.                  |
| Mg      | 0.85   | Same competition, sharper (Mg²⁺ smaller divalent) + dripper-bed equilibration time. Literature 10-25 %; mid 15 %.        |
| B       | 0.80   | Ca-rich pH>7 soil B adsorption to Fe/Al oxides + Ca-borate complexes. Literature 15-25 %; mid 20 %. Molecular-form pKa discount at pH 7.3 negligible (borate fraction ~1 %). |

Full mechanism + stacked-cert caveat + refinement priority order: `learnings.md` REQ-155 entry.

**Refinement triggers — symmetric per P-03:**

- **Upward (validation per element).** Tissue `predicted_uptake = delivered × phUptakeFactor[el]` within ±20 % → cert 2 → 3. Within ±10 % → 3 → 4. Refit independently per element.
- **Downward (factor too generous).** Measured uptake < 50 % of predicted → refit downward (e.g., K 0.90 → 0.70). Most likely downward refits: B (Ca-borate more aggressive than literature) or Mg (dripper-bed equilibration shorter than assumed).
- **Lateral (modest refit).** 30-50 % off in either direction → refit within mid-band literature range (K 0.85-0.95, Mg 0.75-0.90, B 0.75-0.85); cert stays 2.
- **Symmetric extension — Ca entry candidate.** The 2026-05-22 TOM #1 T5 tissue panel surfaced a Ca tissue gap (3.46 % vs floor 4.00 %) that REQ-081 transpiration-coupling alone doesn't fully explain — the operator's cold-leaf observation confirms healthy mid-day transpiration at the leaf-end, pointing at the root-uptake side. Candidate mechanism: K⁺ + Mg²⁺ fertigation flux (K₂SO₄ 3 489 g + MgSO₄ 1 396 g/wk) competes with Ca²⁺ at the root-membrane transporters — the **reverse direction** of the antagonism this constant currently encodes. Adding a `Ca` entry (probable starting value 0.85-0.90, cert 2 mid-band, mirroring K's discount magnitude) would require n ≥ 2 stage-tagged cohort tissue + paired Mehlich-3 + STORED-recipe traces to validate. Full hypothesis trace + STORED-side operator triage (MgSO₄ trim candidate) in `nutrition/tomato/research/tomato-t5-tissue-analysis-2026-05-23.md` § 4.7. Hypothesis-stage only — no constant change until cohort validation lands.

---

## Channel efficiency map (REQ-157)

`window.FertigationRecipeTomato.efficiency` (REQ-157, exposed via model.js) declares the per-element **channel → bed** delivery fraction at current soil pH 7.4 — distinct from REQ-155's bed → plant uptake-factor.

| Element | Value | Source                                                          |
|---------|-------|-----------------------------------------------------------------|
| K       | 0.94  | `PH_RESPONSE['soluble-cation'](7.4)` — K₂SO₄ dissociation       |
| Mg      | 0.94  | `PH_RESPONSE['soluble-cation'](7.4)` — MgSO₄·7H₂O dissociation  |
| B       | 1.00  | `PH_RESPONSE['borate'](7.4)` — H₃BO₃ non-ionic, flat across pH  |
| Mo      | 1.00  | `PH_RESPONSE['molybdate'](7.4)` — anion, fully soluble at pH ≥ 7 |

Cert 4 — pH curves themselves are cert 4; soil pH measurement is cert 5 (Berger April 2026). Refinement: if soil pH drops below 7.0, K/Mg efficiency rises (curve returns 1.0 at pH ≤ 7.0); Mo efficiency drops sharply below pH 7 (molybdate curve sits at 0.30 below pH 5.5, linear ramp 0.30 → 1.0 between pH 5.5 and 7.0). Update the constants when the next Berger reading lands.

Elements absent from the map: N (sidedress channel), P / Ca ({P, Ca}-only bank credit, not fertigated), Fe / Mn / Zn / Cu (foliar channel by REQ-061 cascade order at current pH).

**Mo carve-out (REQ-061 amendment 2026-05-16).** Cation micros (Mn / Zn / Cu / Fe) stay on foliar because the foliar route bypasses pH lockout at the root. Mo is an anion (molybdate, MoO₄²⁻) — at our pH 7.4 it is *more* plant-available from the soil/dripper line, not less, so the foliar-bypass argument doesn't apply. Sodium molybdate joined the fertigation barrel at the team's smallest reliable barrel weight (0.5 g/week → roughly 0.5 mg Mo/m²/sem, about 7× peak demand, well within Mo's wide tolerance band). Foliar's Mo entry retired in lockstep. Stored-recipe moves on both channels gated on `/retire-recipe` audit.

**Mo algorithmic detail.** Mo is NOT mass-balance-derived like K / Mg / B. `computeStageRecipe(stage).naMolybdate` returns a **flat 0.5 g/wk** for every stage T1-T5 (pin in `calc.js`), bypassing the demand → uptake-factor → compost-subtract → product-mass chain. Rationale: peak Mo demand is ~0.07 mg/m²/wk (cert 1, micro-demand from `BIOMASS_DEMAND`); demand-driven sizing would land at fractional milligrams of sodium molybdate per week, well below the team's smallest reliable weighing increment (0.5 g). Flat 0.5 g/wk is the floor the operator can actually deliver. Even at 7× peak demand the dose stays well inside Mo's tolerance band (Mo deficiency below ~0.1 mg/kg DW tissue, toxicity above ~100 mg/kg; ~3-order-of-magnitude window). Cert 2 — operator-floor anchor, not field-measured. REQ-155 uptake factor entry is absent for Mo because no demand-side division applies; for parity with the REQ-157 channel→bed map (Mo = 1.00), if Mo were ever lifted into the mass-balance branch a default uptake factor of 1.00 is the right starting point (anion, no Ca competition argument, fully soluble at pH ≥ 7).

**Mo and the FP-pin (REQ-154).** `naMolybdate` propagates through `wireFpFertigation()` into `FIRST_PRINCIPLES_T5_FERTIGATION['NaMolybdate']` and `FP_RECIPE_T5.fertigation['NaMolybdate']` at boot exactly like Solubore — by construction the constants equal `computeStageRecipe('T5').naMolybdate = 0.5`. The flat-floor model is the FP target; STORED moves on operator timing via `/retire-recipe`. No "Mo FP literal" hand-coded anywhere — same pin-by-construction discipline as K / Mg.

---

## Supply derivation — `computeFertigationSupply` (REQ-151)

Given a recipe in g per total tomato area per week, returns mg per m² per week per element.

```
totalArea_m²        = TOMATO_NUM_BEDS × TOMATO_BED_AREA   // 7 × 54.7 = 382.9
delivered_mg_per_m² = (product_grams × element_pct × 1000) / totalArea_m²
```

`element_pct` from `PRODUCT_PCT`. No pH-response, no mixing-factor, no coverage discount: all three products (K₂SO₄, MgSO₄·7H₂O, Solubor disodium octaborate) are non-precipitating at pH 7.4 in the dripper line.

### Per-element table (canonical T5 recipe)

| Element | Product            | g/area/wk | `element_pct` | Delivered mg/m²/wk |
|---------|--------------------|-----------|---------------|--------------------|
| K       | K₂SO₄              | 5 568     | 0.4150        | 6 033              |
| Mg      | MgSO₄·7H₂O         | 1 963     | 0.0985        | 506                |
| B       | Solubor (Na₂B₈O₁₃·4H₂O) | 11   | 0.205         | 5.89               |

### Why no pH-response gate

Soil channels apply pH-aware effective efficiency (REQ-017). Fertigation skips it: K₂SO₄ / MgSO₄·7H₂O dissociate cleanly into K⁺ / Mg²⁺ / SO₄²⁻ at pH 6.2 (water input); H₃BO₃ non-ionic at pH ≤ 9. pH-response curves matter for soil-bound applications, not dripper-delivered ions. Future fertigation oligo-sulfate (e.g., FeSO₄) would revisit this — add phResponse hook then.

### Caller-side reshape patterns

Function accepts ONE canonical shape: `{ kSulfate_g, mgSulfate_g, solubore_g }`. Callers reshape from upstream source; function never branches on source. Shape-arg decision: `learnings.md` REQ-151 entry.

```js
// Stored mode
const stored = STORED_RECIPE.tomato.fertigation[stage];
const recipe = { kSulfate_g: stored.kSulfate || 0, mgSulfate_g: stored.mgSulfate || 0, solubore_g: 0 };

// FP mode
const fp = FP_RECIPE_T5.fertigation;
const recipe = { kSulfate_g: fp['K2SO4'] || 0, mgSulfate_g: fp['MgSO4-7H2O'] || 0, solubore_g: fp['Solubore'] || 0 };

const supply = window.FertigationRecipeTomato.computeFertigationSupply(stage, {}, recipe);
```

Omitting `recipe` defaults to the stored reshape (one-arg convenience for admin consumers).

### Why flat return (no `details`)

REQ-136 requires per-element `{cert, cap}` alongside flat `mg` map. For fertigation, cap detection depends on pH state + sourced elements (caller context, not model). Matches `computeFoliarSupply` precedent — flat return; details composed in `nutrition/tomato/shell/logic.js`. Unified retrofit is a separate REQ. Full options + rationale: `learnings.md` REQ-151 `details` entry.

### Cert table

| Element | Cert | Reasoning                                                  |
|---------|------|------------------------------------------------------------|
| K       | 4    | K₂SO₄ structural, organic-cert-listed, sulfate dissociates cleanly. |
| Mg      | 4    | MgSO₄·7H₂O same product class.                            |
| B       | 3    | Solubore single-channel (REQ-061); dose = mass-balance output (REQ-098) × REQ-155 B uptake factor 0.80 (cert 2 mid-band). Effective cert min over stack = 3 (product chemistry + organic-cert listing cert 4; biomass.B demand cert 2-3; uptake factor cert 2). Not field-measured at Décembre yet — refinement via foliar B test per REQ-155 trigger. |

---

## Per-stage values

Sidedress K credit = `STORED_RECIPE.tomato.sidedress[stage].actisol_g × PRODUCT_PCT.Actisol_K × SIDEDRESS_MIN_EFF.Actisol_K (0.85) × 1000 / SIDEDRESS_AREA_PER_PLANCHE (54.7)`. Compost K/Mg credits constant: 400 / 500 mg/m²/wk (`COMPOST_RELEASE_PER_WEEK.K = 0.40`, `.Mg = 0.50`). Uptake factors (K 0.90, Mg 0.85, B 0.80) per REQ-155 inflate demand before subtraction.

| Stage | yield | K demand | K demand_to_bed | − sd  | − compost K | kSulfate g | Mg demand | Mg demand_to_bed | − compost Mg | mgSulfate g | B demand | B demand_to_bed | solubore g |
|-------|-------|----------|-----------------|-------|-------------|------------|-----------|------------------|--------------|-------------|----------|-----------------|------------|
| T1    | 0     | 2 200    | 2 444           | 15    | 400         | 1 873      | 175       | 206              | 500          | 0           | ~1.0     | ~1.25           | ~2         |
| T2    | 0     | 2 950    | 3 278           | 46    | 400         | 2 613      | 265       | 312              | 500          | 0           | ~1.0     | ~1.25           | ~2         |
| T3    | 0.3   | 5 360    | 5 956           | 120   | 400         | 5 017      | 483       | 568              | 500          | 65          | ~1.3     | ~1.6            | ~3         |
| T4    | 1.0   | 4 440    | 4 933           | 194   | 400         | 4 003      | 688       | 809              | 500          | 1 198       | ~2.0     | ~2.5            | ~5         |
| T5    | 1.5   | 6 000    | 6 667           | 234   | 400         | **5 568**  | 855       | 1 006            | 500          | **1 963**   | 4.5      | 5.625           | **11**     |

(T1-T4 B columns approximate — biomass.B precision not pinned; T5 row is verifier-authoritative. Recomputed 2026-05-15.)

T5 values match `FP_RECIPE_T5.fertigation` by construction (REQ-154); `wireFpFertigation()` writes constants from `computeStageRecipe('T5')` at script load. REQ-098 verifies formula; REQ-154 verifies constants equal function output; REQ-155 verifies uptake factor.

`STORED_RECIPE.tomato.fertigation` is operational (hand-weighed, `/retire-recipe` governed). This subproject defines only the **first-principles target**. Stored-vs-FP gap surfaces at Block 7/8 as the drift gauge.

---

## Caveats

- **Compost release IS subtracted** (REQ-098 reverted 2026-05-15 per B1-REV). At T1-T3, compost Mg (500 mg/m²/wk) exceeds plant Mg demand → fertigation Mg = 0; surplus accumulates in bank by design. Full amendment-then-reversal cycle: `learnings.md`.
- **B is stage-aware now** (post-B2-REV) but treated as roughly flat 4-5 mg/m²/wk T1-T5; T5 row is authoritative, T1-T4 approximate. Extend `computeStageRecipe` if flowering-phase B demand spikes.
- **FP target cannot drift from model** (REQ-154 boot-pinning). PA Taillon's April 2026 Mg anchor (1 379 g) recovered by physics pre-B2-REV: demand 855 − compost 500 = 355 mg/m²/wk → 1 378 g MgSO₄·7H₂O. Post-B2-REV the anchor no longer matches (uptake factor inflates). Stored-vs-FP drift resolved through `/retire-recipe`, not hand-locked FP overrides.
- **Total area hardcoded** at `TOMATO_NUM_BEDS × TOMATO_BED_AREA = 382.9 m²`. Bed reconfiguration → both constants drift in lockstep.
- **Sulfate-form S over-supply at T5 is a known characteristic, not a dosing error.** K₂SO₄ (3 489 g) + MgSO₄·7H₂O (1 396 g) at T5 deliver ~2 200 mg S/m²/wk via sulfate chemistry vs tomato demand ~600 mg/m²/wk (+300 %). Confirmed by 2026-05-22 tissue panel (TOM #1 S = 2.29 % vs ceiling 0.70 %, +227 %). The over-supply is structural to the sulfate-based salt choice — any K dose bump compounds it mathematically. Trade-off acknowledged in PA Taillon's April 2026 recipe design: sulfate forms are organic-cert-listed, cheap, and dissociate cleanly at pH ≥ 6.2; alternative low-S K salts (KCl) are also cert-listed but introduce Cl management. Tissue validation in `nutrition/tomato/research/tomato-t5-tissue-analysis-2026-05-23.md`.

---

## Refinement triggers

- **Tissue test outside K 4-6 % DW or Mg 0.4-0.7 % DW band** → recheck `TOMATO_FRUIT_EXPORT` upstream, re-derive.
- **`stageYield` retune** → dose shifts proportionally, no model edit.
- **PA Taillon recommends model-input change** → edit `TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`, `RECIPE_INPUTS.stageYield`, or sidedress mineralization (not the output). FP target recomputes automatically.
- **Sidedress switches to alfalfa default** → verify `SIDEDRESS_MIN_EFF.Actisol_K = 0.85` still applies if `eff` changes for alfalfa.
- **B becomes stage-aware** → extend `computeStageRecipe` return shape if flowering-phase B spikes beyond 4-5 mg/m²/wk steady-state.
- **Uptake factor refinement** — per REQ-155 symmetric triggers above.

---

## Implementation map

| File                                                  | Owns                                                       |
|-------------------------------------------------------|------------------------------------------------------------|
| `nutrition/tomato/fertigation-recipe/data.js`         | `FIRST_PRINCIPLES_T5_FERTIGATION`                          |
| `nutrition/tomato/fertigation-recipe/calc.js`         | `computeStageRecipe(stage)`, `computeFertigationSupply(stage, opts, recipe)`, `wireFpFertigation` IIFE |
| `nutrition/tomato/fertigation-recipe/model.js`        | `window.FertigationRecipeTomato` namespace wrapper         |
| `nutrition/tomato/fertigation-recipe/spec.md`         | Spec — what the model must do or be                        |
| `nutrition/tomato/fertigation-recipe/derivation.md`   | This file                                                  |
| `nutrition/tomato/fertigation-recipe/learnings.md`    | Rejected alternatives, retired policies, extraction history |

`app/index.html` includes in dependency order: AFTER plant-needs, compost-contribution, sidedress-recipe, `RECIPE_INPUTS`, `PRODUCT_PCT`, `STORED_RECIPE.tomato.sidedress`, and the `FP_RECIPE_T5` declaration. Within subproject: `data.js` → `calc.js` → `model.js`. `LUXURY_FACTOR` lives next to `calcNutrSupply` (supply-side, not recipe-derivation).
