# Tomate — fertigation-recipe · learnings

Rejected alternatives and historical decisions for this subproject. Live values + REQ-tied derivations live in `derivation.md`. The spec (`spec.md`) is the floor and ceiling for what's actually built.

---

## REQ-155 uptake-factor cert-2 defaults — literature basis (2026-05-15)

Defaults `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL = { K: 0.90, Mg: 0.85, B: 0.80 }`. Specialist accepted the model-challenger's 2026-05-15 B2-REV mid-band numbers as defensible; refinement is tissue-anchored, not literature-anchored (triggers in `derivation.md` "Uptake-efficiency factor").

### K = 0.90 (cert 2) — Ca-K cation competition

K⁺ uptake competes with Ca²⁺ at the root cation channel. On Décembre's Ca-saturated CEC (Ca 10 989 kg/ha, ~75-85 % of CEC), literature reports 5-15 % K uptake suppression. 0.90 is conservative-middle. Magnitude at our Ca:K ratio not pinned to our soil — petiole K is the canonical refiner.

### Mg = 0.85 (cert 2) — Ca-Mg competition + dripper equilibration

Two compounding mechanisms:

1. **Cation competition.** Mg²⁺ binds more weakly than Ca²⁺ at root sites; sharper effect than K. Literature 10-20 % suppression on Ca-rich beds.
2. **Dripper-bed equilibration.** Fertigation Mg arrives concentrated at the plume; estimated 5-10 % additional discount from dripper geometry. Not shared by compost-released Mg (bed-distributed), so the factor under-discounts compost Mg slightly. Accepted at cert 2; tissue refines.

Combined literature 10-25 % range, 0.85 is mid-band.

### B = 0.80 (cert 2) — Soil B adsorption in Ca-rich beds at pH > 7

Original draft framed B discount as H₃BO₃ ↔ B(OH)₄⁻ equilibrium (pKa 9.24); at pH 7.3 borate fraction is ~1 %, so molecular-form discount is negligible — challenger acknowledged the overestimate in B2-REV. Real mechanism: **soil B adsorption** to Fe/Al oxides + Ca-borate complexes in Ca-rich high-pH soils. Literature 15-25 % adsorption discount, some sources to 35 %. 0.80 is conservative-middle. Specialist held at 0.80 (not 0.75) because: (a) Solubor hydrolyzes to H₃BO₃ in dilute solution, non-ionic and faster-equilibrating than the borate fraction the adsorption literature typically measures; (b) Ca-borate kinetics in young (first-season) compost amendments aren't well-characterized — may over-count adsorption.

### Stacked-cert caveat

All three factors compound with `COMPOST_RELEASE_PER_WEEK` (cert 2-3, Mg cert 1-2 no label data) and `TOMATO_FRUIT_EXPORT` / `BIOMASS_DEMAND` (cert 3 macros, 1-2 micros). The cert-2 × cert-2 × cert-3 stack gives a wide effective band. Block 7/8 drift gauge displays point-estimate STORED vs FP only — band not surfaced (deterministic operator prose per `feedback_no_unspecced_narrative.md`).

### Refinement priority order (when tissue data lands)

1. **Mg first** — petiole Mg in the 2026-05-11 panel; widest stacked-cert spread (Mg uptake-factor cert 2 × compost-Mg cert 1-2 × Sonneveld 0.25× ratio), so an off-band tissue read drives the largest defensible refit. Cation antagonism on the Ca-saturated bed sharpens the Mg leverage further.
2. **K second** — petiole K not always in standard panel; if present, refines 0.90. Else stays cert 2.
3. **B last** — needs dedicated foliar B test, not on cadence. 0.80 stays cert 2 longest. Qualitative signals: leaf-margin scorch (toxicity), interveinal yellowing (deficiency).

### What the factors do NOT cover

- **Micros (Mn/Zn/Cu/Fe/Mo)** — not in `computeStageRecipe`; fertigation isn't the channel at current pH (REQ-061 cascade locks to foliar). Add per-micro factors when soil pH < 7.0 makes sulfate-metal fertigation viable.
- **N** — sidedress channel. `SIDEDRESS_MIN_EFF` plays the efficiency role; whether an additional uptake-factor layer is needed on top of mineralization efficiency is a sidedress-domain decision (probably yes — Ca-rich-soil volatilization + immobilization losses).
- **P, Ca** — soil-bank-credit elements (REQ-098); fertigation resolves to zero regardless of uptake factor.

---

## REQ-098 compost-subtraction amendment-then-reversal cycle (2026-05-07 → 2026-05-15)

Lesson: **compost release is current-week supply to the bed, not a long-term bank; it belongs in fertigation sizing as a subtraction term.**

**Timeline:**

- **2026-04-XX — Original REQ-098 (with compost-subtraction).** Formula `fertigation = max(0, demand − compost − sidedress)`. PA Taillon April 2026 anchor (K 5 167 / Mg 1 379 at T5) matched by construction.
- **2026-05-07 — Framing comment shift.** Comment in `calc.js` framed compost as "soil-bank, not fertigation-credit" — intent: avoid silent under-feeding when compost ages out (cert 1-2 Mg, finite 18-24 mo decline). Code still subtracted compost; policy-vs-implementation drift for 5 days.
- **2026-05-12 — REQ-098 amendment.** Compost-subtraction dropped from K and Mg branches; spec rewritten ("Compost release is NOT subtracted"). Verifier recalibrated. T5 FP jumped: K 5 167 → 5 322 (+3 %), Mg 1 379 → 3 319 (**+141 %**).
- **2026-05-13 — Challenger codified P-02** ("keep policy direction; forget about pleasing the agronomist"). PA Taillon anchor framed as "legacy calibration against retired formula." Specialist B1 approved on this framing.
- **2026-05-14 — Specialist REQ-154 refit landed.** `wireFpFertigation()` rewritten to populate `FIRST_PRINCIPLES_T5_FERTIGATION` from `computeStageRecipe('T5')` at boot; PA Taillon 5 167 / 1 379 retired to `learnings.md`. Block 7/8 surfaced STORED 1 396 vs FP 3 319 Mg (~140 %).
- **2026-05-14 — Challenger self-correction (B1-REV).** Mg over-supply: refit produces 854 mg Mg/m²/wk fertigation; compost releases ~500 mg Mg/m²/wk to same bed same week; total 1 354 vs demand 855 = **158 % of demand**. Excess ~100 kg Mg/ha/season into already-Mg-loaded soil (1 646 kg/ha). Compost release is current-week supply, not long-term bank.
- **2026-05-14 — Guillaume's reversal:** "fertigation recipe should be calculated from post-soil-bank-for-P-and-Ca-post-compost-post-side-dress. So it should bring 355mg not 855." Soil-bank credit set narrowed to {P, Ca} only (P drawdown via Banque sol; Ca in surplus from calcitic-lime compost).
- **2026-05-15 — Specialist B1-REV refit landed.** Compost+sidedress subtraction restored; REQ-098 rewritten to `max(0, demand − compost − sidedress − {P,Ca}-only bank credit)`; verifier recalibrated. Live T5: K 4 953 (sidedress credit included, ~−214 g vs PA Taillon 5 167), Mg 1 378 (matches PA Taillon 1 379 within rounding). REQ-154 invariant + boot-time pin survive.

**Lessons recorded:**

1. **Compost release is current-week supply, not long-term bank.** The 2026-05-07 framing was wrong category. Subtract it from fertigation sizing.
2. **Soil-bank credit is element-specific.** {P, Ca} are managed-by-bank at Décembre; N / K / Mg / micros use fertigation-as-gap-filler. Don't blanket-apply.
3. **P-02 retired.** "Forget about pleasing the agronomist" retired the wrong target — the agronomist's number was right by physics; framing of its origin was what needed updating.
4. **PA Taillon's anchor vindicated by physics, not deference.** Mg T5: demand 855 − compost 500 = 355 mg/m²/wk → 1 378 g MgSO₄·7H₂O. PA Taillon: 1 379 g. Match within rounding.
5. **K branch picked up a sidedress credit post-anchor.** Live T5 K is 4 953 g (sidedress 234 mg/m²/wk + compost 400 mg/m²/wk subtracted), not 5 167 g. Whether to drop Actisol from T5 sidedress (REQ-089 / SME P-lockout) shifts this back — separate decision.

**Refinement triggers (post-reversal):**

- If tissue petiole shows persistent Mg deficiency at current weighed Mg dose, `COMPOST_RELEASE_PER_WEEK.Mg = 0.50 g/m²/wk` (cert 1-2, no label data) may be too generous. Tighten by tissue, not formula.
- If soil-bank credit needs to fire for K or Mg (future strategy change), add the element explicitly in REQ-098.

---

## PA Taillon April 2026 fertigation anchor — vindicated by physics (history preserved 2026-05-15)

> **Reframe note (2026-05-15):** Originally written 2026-05-14 to capture the anchor as "retired legacy" under the 2026-05-12 REQ-098 amendment that dropped compost-subtraction. That amendment was reverted 2026-05-15 (B1-REV); anchor is now recovered by the mass-balance derivation itself. Block kept for audit-trail completeness; framing flipped: the anchor wasn't deference, it was the right physics.

T5 fertigation anchor recommended by PA Taillon (agronomist), April 2026:

| Product       | Anchor dose | Mass-balance derivation                                       | Cert |
|---------------|-------------|---------------------------------------------------------------|------|
| K₂SO₄         | 5 167 g     | T5 — offtake 6 000 − compost 400 = 5 600 mg/m²/wk → 5 167 g (sidedress credit was zero at anchor time; current code subtracts ~234 mg/m²/wk, output 4 953 g). | 3 |
| MgSO₄·7H₂O    | 1 379 g     | T5 — offtake 855 − compost 500 = 355 mg/m²/wk → 1 379 g. Current code: 1 378 g (1-g rounding). | 3 |
| Solubore      | 9 g         | Single-channel B at T5 (unchanged — still live in `data.js`). | 3 |

**Why the match isn't coincidence:** agronomist's recommendation came from the same mass-balance principle the model uses; once demand + compost-release flow through `max(0, demand − compost − sidedress)`, model output equals recommendation. 2026-05-12 amendment broke the match (141 % Mg gap); reversal restored it.

**Audit-trail intent:** preserved for organic-cert (FP target in service since April 2026 at this anchor, brief excursion to 3 319 g Mg on 2026-05-14 — both states reproducible from model history) and for re-evaluation if inputs shift materially.

**STORED was never on this anchor (audit-trail repair 2026-05-16).** The anchor describes the FP target only. `STORED_RECIPE.tomato.fertigation.T5.kSulfate` has been Haifa-heritage 3 489 g since the 2026-05-09 commit (`11cccfc`) and never moved to PA Taillon's 5 167 g. `git log --all -S "kSulfate: 5167"` returns zero hits on STORED. `RECIPE_HISTORY` carries the same 3 489 as the "retired 2026-05-07 Haifa-anchored values × multipliers" snapshot — Haifa was retired from the FP target (TOMATO_STAGES → `computeStageRecipe`) but left intact in STORED. The STORED-vs-FP K drift at peak production (3 489 stored vs ~5 568 FP after B2-REV uptake-factor inflation) is genuine, not a documentation artefact. Operator-facing prose elsewhere that says "STORED is locked at PA Taillon's recommendation" is misleading and needs correction (filed for coder lane — operator-display surfaces).

---

## Compost subtraction in K/Mg mass-balance — retired 2026-05-12, restored 2026-05-15

REQ-098 amended 2026-05-12 to drop compost release from K/Mg mass-balance: `computeStageRecipe(stage)` replenished FULL plant offtake (fruit export + biomass), sidedress credited on K only, Mg pure offtake. Compost contribution tracked separately as soil-bank input in `nutrition/compost-contribution/spec.md`. Reverted 2026-05-15 (see B1-REV cycle above). Prior formula preserved for audit + future re-evaluation.

### Prior formula (with compost subtraction)

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

Prior `calc.js` body:

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

### Policy-vs-implementation drift history

2026-05-07 framing comment ("COMPOST IS NOT SUBTRACTED") expressed policy direction: replenish full offtake, treat compost as margin-of-safety bank. Intent: avoid silent under-feeding when compost ages out (Mg cert 1-2, no label data, finite 18-24 mo).

Implementation lagged 2026-05-07 → 2026-05-12 — code still subtracted compost. Downstream consumers (Block 7 stored-vs-FP gauge, `calcNutrSupply` fp mode, REQ-013/014 supply bounds, REQ-024 predictedCE) calibrated against WITH-subtraction values:

- T5 K: offtake 6 000 − sidedress 0 − compost 400 = 5 600 mg/m²/wk → K₂SO₄ 5 167 g (matched PA Taillon anchor by construction).
- T5 Mg: offtake 855 − compost 500 = 355 mg/m²/wk → MgSO₄·7H₂O 1 379 g (matched PA Taillon anchor by construction).

Asymmetry with `computeStageSidedress` (subtracts compost for N) was intentional — N channel and K/Mg channel extracted at different policy-evolution points.

### Reconciliation outcome (2026-05-12)

Drift-period plan ("bundle no-compost-subtraction with PA Taillon refit") was superseded: REQ-098 amended to remove subtraction in spec + `calc.js`; PA Taillon `FP_RECIPE_T5.fertigation` anchor (5 167 / 1 379) kept fixed. Drift between bare mass-balance output (5 322 / 3 319 at T5) and anchor framed as normal field correction at Block 7 gauge.

### Why this is preserved

Compost-subtraction policy carried calibration weight against REQ-014 supply bound (T4/T5 Mg), REQ-024 predictedCE (T2), and PA Taillon T5 anchor's mass-balance correspondence. If future tissue data motivates re-introducing an explicit compost credit, prior formula + relationships above are the starting point. Re-introduction would require: (a) tissue Mg panels confirming luxury accumulation under full-offtake policy, (b) refresh of REQ-014 / REQ-024 calibration against restored formula, (c) refit (or explicit drift framing) of PA Taillon T5 anchor.

---

## REQ-151 `computeFertigationSupply` — recipe-arg shape decision (2026-05-12)

Three signatures considered before locking the canonical g-keyed shape.

**Option A — Canonical g-keyed input (selected).** Function expects exactly `{ kSulfate_g, mgSulfate_g, solubore_g }`. Caller reshapes from any upstream source.

**Option B — Polymorphic input.** Accepts FP literal shape (`{ 'K2SO4', 'MgSO4-7H2O', 'Solubore' }`) or stored shape (`{ kSulfate, mgSulfate }`) and normalizes internally. *Rejected:* violates SRP at model boundary (`feedback_model_srp.md`). Shape detection is glue, belongs to caller. Polymorphic boundaries accumulate dead branches.

**Option C — Stage-mode signature.** Takes `(stage, { mode: 'fp' | 'stored' })` and reaches into `FP_RECIPE_T5` or `STORED_RECIPE`. *Rejected:* breaks pure-function discipline (model reads globals — `feedback_pure_code.md`), breaks SRP (mode flags smuggle source-selection into model), breaks symmetry with `computeFoliarSupply` (verifier exercises recipe arg directly with stub recipes; stage-mode would lose that lever).

**Principle (saved to `feedback_model_srp.md`):** model/calc functions accept pre-normalized inputs and apply one rule. Shape detection, source selection, reshape — caller-side glue. No mode flags at model boundary.

---

## `details` in the supply return — caller-built, not function-built (2026-05-12)

Contribution-channel functions must return flat `mg` map + `details` sibling with per-element `{cert, cap}` (REQ-136). Two implementations possible:

**Option A — `details` built inside model function.** Returns `{ perM2_mg, details }`; cap detection (K capped at CE, B single-channel) lives in supply function.

**Option B — `details` built at caller, flat return from model (selected).** Returns flat `mg` map; caller composes `details` from supplied values + page state (current pH, lockout flag).

Selected B: fertigation cap detection depends on context the model shouldn't know (current pH, sourced elements in current recipe, which pages render the block). Pushing in would require `{ currentPh, phLocked, sourcedElements }` opts — glue inside. Matches `computeFoliarSupply` precedent (flat return; details composed in `nutrition/tomato/shell/logic.js`). When caller surface is ready for unified `{ perM2_mg, details }` across all channels, foliar + fertigation retrofitted together — separate REQ.

---

## Mode-aware mixing factor — retired 2026-05-10

`MIXING_FACTOR_FERT` (split `_STORED = 0.5` / `_FP = 1.0`, REQ-100) introduced 2026-05-05 on the premise that ~50 % of stored-mode fertigation re-enters the SME pool and would double-count if summed on top of `supply.soil`. Retired 2026-05-10 — fertigation supply reports full barrel mass; SME is a separate channel in the supply readout so users compare rather than blend. The 0.5 was cert 2-3, no measured anchor at Décembre. REQ-100 deleted from spec; constants removed from `data.js` and `window.FertigationRecipeTomato`. Number not reused per project policy.

---

## What got extracted from `app/index.html` into this subproject (2026-05-XX)

- `FP_RECIPE_T5.fertigation` values (`K2SO4: 5167`, `MgSO4-7H2O: 1379`, `Solubore: 9`) — moved to `data.js` as `FIRST_PRINCIPLES_T5_FERTIGATION`, populated by `wireFpFertigation()` IIFE from `computeStageRecipe('T5')` at boot.
- `MIXING_FACTOR_FERT` — retired 2026-05-10 (see above).
- `computeStageRecipe(stage)` — moved to `calc.js`.
- `wireFpFertigation()` — new IIFE in `calc.js` overwriting `FP_RECIPE_T5.fertigation` from `data.js` + recomputed T5 mass-balance. Mirrors `wireFpSidedress()`.

Left in place: `FP_RECIPE_T5` const declaration (parent object shared across fertigation/sidedress/foliar wire-IIFEs), `STORED_RECIPE.tomato.fertigation` (operational, `/retire-recipe` governed), `LUXURY_FACTOR` (supply-side, next to `calcNutrSupply`), `RECIPE_INPUTS` (shared model inputs).
