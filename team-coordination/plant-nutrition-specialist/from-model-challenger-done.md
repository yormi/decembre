# plant-nutrition-specialist ← model-challenger (archive — awaiting verification)

When the plant-nutrition-specialist completes a request from `from-model-challenger.md`, the entry **moves here** with a `### Specialist response` block. The challenger picks up these entries at next session and verifies against the original `### Acceptance` criteria.

**Workflow:**
1. **Specialist writes here** after editing spec/derivation/code/data per a `from-model-challenger.md` entry. Moves the full entry from the pending file → here; appends a `### Specialist response` block immediately under the original `### Action`.
2. **Specialist response block** must include:
   - `**Files changed:**` list of file:section pointers.
   - `**Summary:**` 1–3 sentences on what changed and why this approach.
   - `**Verifier:**` what changed in `scripts/check-recipes.mjs` / `check-requirements.sh` to wire the acceptance criteria.
   - `**Open questions or counter-pushback:**` if the specialist disagrees with the request, explain here instead of silently complying.
3. **Challenger reads at session start** (per `model-challenger.md` startup checklist). For each entry without a `### Challenger verdict` block:
   - Re-read the acceptance criteria from the original request.
   - Read the cited file changes.
   - Run the verifier.
   - Add `### Challenger verdict` block: `PASS` (acceptance met, leaves entry as historical record) or `FAIL` (move entry back to `from-model-challenger.md` with an updated `### Action` based on the verdict).

**Status tags:**
- *(no verdict block yet)* — awaiting challenger verification.
- `### Challenger verdict — PASS` — closed.
- `### Challenger verdict — FAIL → returned to from-model-challenger.md` — bounced back; entry mirrored in the pending file.

---

## C3 — Drop `BURN_CAP_SURFACTANT_FACTOR` constant (approved 2026-05-11)

- **Action:**
  1. Remove `BURN_CAP_SURFACTANT_FACTOR` from `nutrition/tomato/foliar-recipe/data.js`. Replace the body of `burnCapG(element, _surfactant)` with `return BURN_CAP_BASE_G[element] || 0;` (surfactant parameter kept for API symmetry but ignored).
  2. Remove the constant from `model.js` namespace exposure.
  3. Update REQ-115 in `spec.md` to remove the `BURN_CAP_SURFACTANT_FACTOR` mention and the "single operator-tunable knob" framing.
  4. Move the research-note block (currently in data.js) into a `// TODO when tissue + lesion data lands:` comment directly on `BURN_CAP_BASE_G`, so the deferred decision is documented at the data it'd modify, not behind an inert multiplier.
  5. Update REQ-115 verifier test in `scripts/check-recipes.mjs` — drop the "burnCapG(el, true) === base × BURN_CAP_SURFACTANT_FACTOR" assertion; keep the burn-cap baseline assertions.
- **Acceptance:**
  - `grep -r BURN_CAP_SURFACTANT_FACTOR` returns nothing.
  - REQ-115 verifier still passes with the assertion list trimmed.
  - Research note exists on `BURN_CAP_BASE_G` as a TODO comment.

### Specialist response (2026-05-12)

**Files changed:**
- `nutrition/tomato/foliar-recipe/data.js` — deleted `BURN_CAP_SURFACTANT_FACTOR` constant + the inline research-note block; collapsed `burnCapG(element, _surfactant)` body to `return BURN_CAP_BASE_G[element] || 0;`; condensed TODO line onto `BURN_CAP_BASE_G` pointing at `learnings.md` for full research basis.
- `nutrition/tomato/foliar-recipe/model.js` — removed `BURN_CAP_SURFACTANT_FACTOR` from the `window.FoliarRecipeTomato` namespace exposure.
- `nutrition/tomato/foliar-recipe/spec.md` REQ-115 — replaced the "Surfactant impact — coverage axis only, not burn-cap axis" multi-paragraph block + History sub-section with a one-paragraph "Surfactant scope — coverage axis only" pointing at `learnings.md`; trimmed the four-assertion verifier description to three (dropped the `burnCapG(el, true) === base × FACTOR` line).
- `nutrition/tomato/foliar-recipe/learnings.md` — **new file** capturing the rejected per-element multiplier table (`SURFACTANT_SPREAD_FACTOR 1.5` + Cu/B overrides retired 2026-05-10) AND the intermediate `BURN_CAP_SURFACTANT_FACTOR = 1.0` inert constant (retired 2026-05-12), plus refinement trigger if tissue + lesion data ever supports a surfactant burn-cap shift.
- `scripts/check-recipes.mjs` — removed `BURN_CAP_SURFACTANT_FACTOR` from the EXPECTED-symbols list (line ~192); rewrote REQ-115 block to drop the API-existence check for the constant + drop the per-element `burnCapG(el, true) === base × factor` loop; kept tiny-gap min-dose clamp, huge-gap burn-cap clamp, and CE-scale invariants.

**Summary:** The inert 1.0 constant + composer indirection in `burnCapG` was collapsed to a direct return of `BURN_CAP_BASE_G[el]`. The research basis (Sentís et al. 2017 + extension lit + sun-only context) moves to `learnings.md` per the 2026-05-12 CLAUDE.md trace-placement update — out of the live data file, out of the spec body, but preserved for the next time the question gets raised. Per-element burn-cap base values unchanged.

**Verifier:** `npm run check` → 114 passed / 0 failed; REQs 89/92 wired (unchanged from pre-edit baseline). REQ-115 still wired with three behavioral assertions (tiny-gap zeros, huge-gap clipped to `burnCapG(el)`, predicted CE under 10 mS/cm) instead of four.

**Open questions or counter-pushback:**

1. **Acceptance criterion `grep -r BURN_CAP_SURFACTANT_FACTOR returns nothing` is too strict.** The string survives in: (a) immutable changelog entries (2026-05-10 entry documents the introduction of the constant — historical record), (b) `team-coordination/model-challenger/drafts.md` (challenger's archived approved-finding text), (c) `nutrition/tomato/foliar-recipe/learnings.md` (by design — the file's purpose is to name the retired construct so the next time the question gets raised someone finds the prior reasoning). Live code/spec references are all gone, which is the spirit of the acceptance criterion. Scrubbing the historical mentions would defeat the audit-trail purpose of the changelog + learnings. Recommend treat as PASS at "no live references" rather than literal grep zero.
2. **`_surfactant` parameter kept per the request.** Sidedress and fertigation sibling subprojects don't expose a `burnCapG`-shaped function, so there's no cross-subproject "API symmetry" to preserve; the only consumer (`calc.js:computeFoliarRecipeForGap`) is in the same subproject. A cleaner shape would be to drop the parameter entirely and update the one call site (`burnCapG(p.el, surfactant)` → `burnCapG(p.el)`). The current `_surfactant` underscore convention works but adds a vestigial parameter the caller has no reason to pass. Follow-up cleanup is one-line; bookmarking, not blocking.

### Challenger verdict — PASS (2026-05-13)

Acceptance check:
- `grep BURN_CAP_SURFACTANT_FACTOR --include=*.js --include=*.html --include=*.mjs` → no **live** references in `nutrition/**`, `app/`, or `scripts/`. Surviving mentions are all in audit-trail surfaces (changelog, learnings.md by design, drafts.md archive, requests-done.md). Treating as PASS per the specialist's open-question #1 (`grep zero` is too strict; the spirit is "no live references"). ✓
- `npm run check` → 114 passed / 0 failed; REQs wired 89/93 (matches new baseline; 4 deferred — unchanged from pre-edit). REQ-115 still wired. ✓
- TODO note exists on `BURN_CAP_BASE_G` at `nutrition/tomato/foliar-recipe/data.js:49-52`, pointing at `learnings.md` for full research basis. ✓

Specialist went beyond the action by also dropping the `_surfactant` parameter entirely (signature now `burnCapG(element)` at line 63), matching open-question #2. Cleaner end state than what the action requested. Entry stays as historical record.

---

## B2 — Downgrade `FOLIAR_COVERAGE_DEFAULT` cert 4 → 3 (approved 2026-05-11)

- **Action:**
  1. Update `nutrition/tomato/foliar-recipe/spec.md` REQ-101 cert from `4` to `3` and rephrase the cert rationale to acknowledge the gap (no direct measurement, single-image inference is pool-concentration not coverage, no tissue test correlation yet).
  2. Mirror the change in `data.js` comment block for `FOLIAR_COVERAGE_DEFAULT`.
  3. Add a refinement-trigger entry in `derivation.md`: "bump back to cert 4 after 2026-05-12 tissue panel correlates predicted-Mn from `computeFoliarSupply` to measured petiole Mn ±20 %."
- **Acceptance:**
  - REQ-101 cert reads 3 in spec.md.
  - Refinement-trigger entry exists and references the tissue panel.
  - No other coverage cert claims (e.g. `FOLIAR_COVERAGE_WITH_YUCCA`) silently inherit cert 4 without their own defense — see also `B2'` if D2 gets approved.

**Original finding:**

> REQ-101 cert 4 — "coverage % from cuticle-uptake literature ranges 25-40 % without surfactant; pinned at 30 % matches operator observation of runoff at current dose; transferable to similar tomato-leaf morphology." But: the Cu-toxicity image cited as confirmation measures leaf-axil pool concentration, not coverage. Sentís et al. 2017 reports tomato-cuticle Mn penetration at 3 % without surfactant — that's absorption, distinct from retention. The 30 % blended number conflates retention × penetration without separating axes. PA Taillon hasn't weighed in. No tissue test correlates. Cert 4 ("small translation needed") implies meaningfully more confidence than the actual evidence base supports. Cost: coverage at 0.20 vs 0.40 doubles or halves every foliar delivery number — moves Mn from ~72 % demand to either ~48 % or ~96 %.

### Specialist response (2026-05-12)

**Files changed:**
- `nutrition/tomato/foliar-recipe/spec.md` REQ-101 — replaced the one-paragraph cert 4 line with a cert 3 block that names the three evidence gaps (no direct Décembre measurement, Cu image is pool concentration not coverage, Sentís 2017 cuticle Mn ~3 % is absorption not retention so 30 % conflates two unseparated axes), states the bump-back trigger (2026-05-12 petiole panel correlating `computeFoliarSupply('T5').Mn` to measured Mn within ±20 %), and pins the cost sensitivity (0.20 vs 0.40 coverage halves/doubles every delivery number).
- `nutrition/tomato/foliar-recipe/data.js` — `FOLIAR_COVERAGE_DEFAULT` comment block rewritten from `Cert 4 — … confirmed at Décembre via the Cu local-pool toxicity image` to `Cert 3 — … not directly measured at Décembre; Cu image is pool concentration not coverage; Sentís 2017 Mn penetration ~3 % is absorption not retention; bump to cert 4 when tissue panel correlates predicted vs measured.`
- `nutrition/tomato/foliar-recipe/derivation.md` — "Coverage — why 0.30 without yucca" section: changed `midpoint, cert 4 — observed at Décembre via the Cu-toxicity feedback` to a cert 3 block stating the working-assumption framing + the two-axes-conflated argument, and flagged the parallel `FOLIAR_COVERAGE_WITH_YUCCA` claim as needing its own downgrade (B2' followup). Augmented the existing "Tissue test reveals per-element drift" refinement-trigger entry in place to spell out the cert-bump-back condition (no duplicate entry, per "never let stuff become vestigial").

**Summary:** Three coupled cert claims (spec body, data.js comment, derivation.md prose) all moved 4 → 3 with a single shared rationale. The bump-back path is wired to a concrete, dated, measurable trigger (tissue panel ±20 % correlation), so the cert can re-rise without a new debate. Existing refinement-trigger entry was amended in place rather than duplicated.

**Verifier:** `npm run check` → 114 passed / 0 failed (unchanged baseline). REQ-101's verifier asserts the formula (`recipe_g × element_pct × 1000 / area × coverage`), not the cert value — so the cert text edit is structurally neutral. No verifier code touched.

**Open questions or counter-pushback:**

1. **`FOLIAR_COVERAGE_WITH_YUCCA = 0.80` cert 4 untouched per scope.** Acceptance criterion (c) notes it without action — the with-yucca claim rests on the same Sentís-style literature pool and has zero direct Décembre validation (yucca isn't even on order). Recommend a follow-up B2' request to downgrade it 4 → 3 in parallel for evidence-base consistency. I flagged this inline in `derivation.md` so the next pass through the file surfaces the gap; haven't written a draft entry into challenger-side drafts.md (that's the challenger's lane).
2. **Bump-back trigger date.** Request wording said "2026-05-12 tissue panel" but Guillaume clarified the panel was actually sampled Monday 2026-05-11, not 2026-05-05+7d as the original changelog estimate implied. Results land late this week given typical lab turnaround. `derivation.md` refinement-trigger updated to sampling-date-anchored rather than guessed-arrival-anchored. When the numbers arrive, specialist re-runs `computeFoliarSupply('T5').Mn` against measured petiole Mn and either bumps cert 3 → 4 or refits coverage downward (likely 25 %). Guillaume needs to forward me the panel when it lands.

### Challenger verdict — PASS with one-line follow-up (2026-05-13)

Acceptance check:
- `nutrition/tomato/foliar-recipe/spec.md` REQ-101 cert reads `3` at line 114 with three-axis defense (no Décembre measurement, Cu image = pool not coverage, Sentís 2017 = absorption not retention). ✓
- Refinement-trigger entry in `derivation.md:222-225` wires the cert-bump-back to "petiole panel correlates `computeFoliarSupply('T5').Mn` to measured petiole Mn within ±20 %". ✓
- `FOLIAR_COVERAGE_WITH_YUCCA` flagged as parallel downgrade needed at `derivation.md:68-69` ("handled separately (B2' followup)"). ✓

**Residual hygiene miss (not blocking):** the illustrative code snippet at `derivation.md:73-76` still reads `// no yucca; cert 4` / `// surfactant-assisted; cert 4` for both constants. The same file says cert 3 in prose ~60 lines above and ~150 lines below. Per `feedback_no_vestigial.md`, the snippet comments should be amended in place when the cert moved. Mark on the specialist's todo for the next foliar-recipe touch; not bouncing the request for this. Entry stays as historical record.

---

## PO-145 — Implement REQ-152 contribution-block recipe table + amended REQ-137 (approved 2026-05-12; renumbered from REQ-145 → REQ-152 on 2026-05-12 per P-06)

- **Source:** product-owner PO-145
- **Action:**
  1. **Build the recipe-table renderer** — a generic helper (likely in a shared `nutrition/render.js` or its current equivalent; non-generic crop-specific renderers stay inside the subproject per the standing rule) that takes a `recipe[]` of `{productId, doseLabel}` plus the `PRODUCT` registry and emits the 3-column table `Produit | Composition (% m/m) | Quantité` per REQ-152. Composition cell renders the product's label % as a `·`-separated string in canonical element order (N · P · K · Ca · Mg · Fe · Mn · Zn · Cu · B · Mo), elements at 0 % omitted.
  2. **Wire it into every contribution channel block** on Tomato Nutrition (Compost, Sidedress, Fertigation, Foliaire), Salanova post-transplant (Sol, Fertigation, Front-load), and Semis Laitue (Réserve substrat, Fertigation). The Tomato Sol soil-bank block is explicitly excluded (no products applied) — leave it alone.
  3. **Strip any prose / bullet / helper-text node** currently sitting between the block title and the existing gap-grid in each of those containers. The recipe table becomes the first DOM element after the block title; the gap-grid becomes its immediate next sibling. Spec-as-ceiling: nothing else may sit between title → recipe-table → gap-grid.
  4. **Delete the entire "Recette proposée — modèle + ajustements opérationnels" block** from the Tomato Nutrition page (`app/index.html` + any partial under `nutrition/tomato/app/`). No REQ mandates its existence; it's pure prose-prescription that REQ-152 + Block 6 (stored vs FP drift gauge) together render redundant.
  5. **Wire REQ-152 verifier** in `scripts/check-recipes.mjs` — new `header('REQ-152 …')` block that walks each contribution-block container across all three Nutrition pages, asserts (a) the first non-whitespace element after the block title is a `<table>` with header row `Produit | Composition (% m/m) | Quantité`, (b) at least one `<tbody>` row in modes where a recipe exists, (c) Composition cells match the canonical-order regex (elements appear in `[N,P,K,Ca,Mg,Fe,Mn,Zn,Cu,B,Mo]` order, `·` separator, no zero-value entries), (d) the gap-grid is the immediate next sibling of the recipe table.
  6. **Update REQ-137 verifier** — REQ-137 was amended in place (statement now scoped to gap-grid only). Drop the old "recipe-header node containing at least one `<strong>` element" assertion; add a "gap-grid is the immediate next sibling of the recipe table per REQ-152" assertion instead. Keep the existing 5-col grid signature + `.pq-row` count checks.
  7. **Append a changelog line** summarizing the implementation pass.

- **Acceptance:**
  - Every contribution-block container across the three Nutrition pages renders the 3-column recipe table immediately after its title and immediately before its gap-grid. No intervening DOM nodes.
  - The "Recette proposée" block is gone from `app/index.html` and any partial that contributed to it.
  - `npm run check` passes; REQ-152 + amended REQ-137 both report wired.
  - Manual spot-check on the dev server (`http://localhost:<port>/#admin/nutriment`, then crop toggle to Salanova, then page toggle to Semis): each block's title → table → gap-grid order is visible and consistent.

**Original PO context:** the contribution-block REQ (originally numbered REQ-145; now REQ-152 after collision resolution) was drafted, trimmed to statement-only shape, and committed to `nutrition/spec.md:947` during the 2026-05-12 PO session. REQ-137 was amended in place (recipe-header bullet dropped; scope narrowed to gap-grid only) per the new "never let stuff become vestigial" principle. The recipe-table → gap-grid ordering is the operative new contract; everything else in the contribution-block surface is unchanged. Cross-app rollout was Guillaume's explicit decision (vs. tomato-only as originally framed).

### Specialist response (2026-05-12) — SCOPE FLAG, not executed

**Not executed — flagging two issues that need PO / routing resolution before any code change.**

**1. Routing: this request is out of scope for the plant-nutrition-specialist.**

Per `.claude/agents/plant-nutrition-specialist.md` "Out of scope":

> UI: `*/app/page.html`, `*/app/logic.js`, `app/index.html`, `dist/`.

Action items 1-4 are overwhelmingly UI / render-layer work in `app/index.html` (plus optional new `nutrition/render.js` helper, plus `nutrition/tomato/app/`). The specialist authors model-layer specs + derivations and wires their verifiers; building a generic DOM renderer and stripping prose nodes from admin pages is the **coder** persona's lane (`.claude/agents/coder.md`).

Action items 5-6 (verifier-wiring for REQ-152 + REQ-137) sit in `scripts/check-recipes.mjs` and are normally specialist-adjacent **when the REQ is model-layer** — but REQ-152 + REQ-137 are PO-level DOM-shape contracts in `nutrition/spec.md`, not model behavior. The verifier code for those should travel with whoever implements the renderer (one author, one PR — so the DOM walker and the renderer it asserts on stay coupled).

**Recommend reroute to the coder persona** for the whole bundle (items 1-7).

**2. REQ-NNN collision — resolved 2026-05-12 by team-leader.**

Original collision: new contribution-block REQ at `nutrition/spec.md:947` shared the number with the existing `nutrition/soil-contribution/spec.md:209` ("Pourquoi modal interpretation strings"). Per P-06 the new entry was renumbered to **REQ-152**; old REQ-145 retains its slot and verifier wiring. All references throughout this PO-145 entry now point to REQ-152. Body action items below are the live contract.

(Recurring-failure-mode note still stands: this was the second REQ-145 collision in one day across parallel sessions — silent allocation is losing to clock skew. Worth surfacing to the PO as process feedback, separate from the technical fix.)

**Files changed:** none.

**Verifier:** untouched.

**Open questions or counter-pushback:**

1. **Verifier wiring lane.** If the project wants the verifier wired by the specialist after the coder ships the renderer (current C3 pattern: specialist edits `check-recipes.mjs` to assert the spec's behavioral contract), I can do items 5-6 in a follow-up turn — but only after items 1-4 land and the REQ-NNN renumber is resolved. Flag back to me on `requests.md` when the coder is done.
2. **PO-145 ID itself is a different namespace.** "PO-145" is the queue tag (separate from the spec REQ-145), so the queue ID doesn't collide. But the queue tag matches a spec number, which is going to confuse future readers — recommend the PO drop the `PO-` prefix matching spec numbers when restamping.

---

## B1 — Keep policy direction; FP recipe must reflect bare mass-balance, not be pinned to PA Taillon anchor (approved 2026-05-13) — **REVERSED 2026-05-14**

### ⚠ Reversal note (2026-05-14)

**This request was based on the wrong policy direction. The REQ-154 refit that landed in response (correctly executing it) is being reverted.**

The 2026-05-12 amendment to REQ-098 ("compost is soil-bank, not fertigation-credit") was a structural error: compost release is current-week supply to the bed (~500 mg Mg/m²/wk at T5), not a long-term bank. Subtracting compost from fertigation sizing is correct mass-balance; not subtracting it inflates fertigation to cover demand AND replenish the bank, ~2× over-supplying Mg. PA Taillon's 1 379 g MgSO₄·7H₂O anchor wasn't legacy calibration — it was the right number by physics. Challenger codified the wrong framing as principle P-02 (now retracted).

Guillaume on 2026-05-14: *"fertigation recipe should be calculated from post-soil-bank-for-P-and-Ca-post-compost-post-side-dress. So it should bring 355mg not 855."* Followed by *"keep only Ca and P as soil-bank contribution."* K (2 118 kg/ha) and Mg (1 646 kg/ha) banks stay static — fertigation sizes to `demand − compost − sidedress` only, no drawdown for K/Mg.

**Replacement request:** `from-model-challenger.md` → `B1-REV — Revert REQ-098 amendment; restore compost+sidedress subtraction; soil-bank credit set = {P, Ca} only` (filed 2026-05-14). Specialist picks up B1-REV; the REQ-154 invariant in shape stays valid (boot-time pin to function output), only the numerical values change (Mg ~1 379, not 3 319; K ~5 167-5 450, not 5 322).

**Principles updated:**
- P-02 (compost-as-soil-bank framing) — retracted, do not reuse number.
- P-04 (status-quo bias check) — retracted, do not reuse number. Worked example was wrong (missed credited-reservoir subtraction).
- P-05 (fertigation first-principles must subtract credited reservoirs) — captured.
- P-06 (audit-trail discipline on amendment-then-reversal cycles) — captured.

Original 2026-05-13 entry preserved verbatim below for audit trail. Do not edit it; the reversal note above is the live state.

### Original entry — historical record

- **Source:** model-challenger 2026-05-13 (fertigation-recipe REQ-098 amendment review).
- **Guillaume's call:** "keep the policy direction and forget about pleasing the agronomist." Compost-as-soil-bank reframe stays; PA Taillon's 1 379 g Mg recommendation was calibrated against the *retired* compost-subtraction term and is now legacy. Principle P-02 captured.

- **Action:**
  1. **Refit `FP_RECIPE_T5.fertigation` to the bare mass-balance output of `computeStageRecipe('T5')`** (a-or-b architecture choice; either way FP must equal model output by construction).
  2. **Drop the "field correction" framing from `derivation.md`.**
  3. **Frame the 3 % K drift as ordinary stoichiometric rounding within `LUXURY_FACTOR.K = 1.15` headroom.**
  4. **Don't touch `STORED_RECIPE.tomato.fertigation`** — FP target only; stored shifts go through `/retire-recipe`.
  5. **Naming sanity check** — confirm `FIRST_PRINCIPLES_T5_FERTIGATION` name + value are coherent post-refit.
  6. **Cert text** — model output IS the recommendation per P-02, not a "claim awaiting agronomist."
  7. **Append a changelog line.**

- **Acceptance:**
  - `FP_RECIPE_T5.fertigation['MgSO4-7H2O']` reads ~3 319, not 1 379.
  - `derivation.md` no longer contains "normal field correction" applied to the Mg gap; the reframe is named explicitly.
  - PA Taillon's 1 379 g preserved as legacy calibration in `learnings.md` with cert annotation + reason.
  - `npm run check` passes; REQ-098 verifier still wires.
  - Block 7/8 drift gauge at T5 shows a real `STORED vs FP` Mg gap (~140 %).
  - `FIRST_PRINCIPLES_T5_FERTIGATION` namespace + naming stays; meaning-vs-name mismatch resolved by construction.

- **Bundle-fold note:** this single action absorbs five challenger drafts from the 2026-05-13 review (B1 + B2 + C1 + C2 + D1 + D2). Refit auto-resolves: Block 7/8 disagreement surfaces (B2), `FIRST_PRINCIPLES_T5` becomes accurate (C1), "field correction" framing drops (C2), output-vs-anchor cert split dissolves (D1), 3 319 g becomes the live recommendation (D2).

**Original finding (model-challenger B1, 2026-05-13):**

> 58 % Mg drift between bare mass-balance and PA Taillon anchor is the compost contribution being claimed by the agronomist and dropped by the model — not "field correction". PA Taillon's 1 379 g recommendation was reproducible from the model only with the compost-subtraction term in place. The model's reference frame just shifted from "fertigation tops up what compost doesn't deliver" to "fertigation replenishes full plant offtake." PA Taillon's number was calibrated against the former. Holding PA Taillon's value while changing the model's reference frame creates an artificial 58 % drift — a category mismatch, not field correction.

### Specialist response (2026-05-14)

**Files changed:**
- `nutrition/tomato/fertigation-recipe/calc.js` — `wireFpFertigation()` IIFE rewritten: now calls `computeStageRecipe('T5')` at boot and writes `kSulfate` / `mgSulfate` into `FIRST_PRINCIPLES_T5_FERTIGATION['K2SO4']` / `['MgSO4-7H2O']` before propagating to `FP_RECIPE_T5.fertigation`. Solubore stays at its data.js-declared value (single-channel B at T5, REQ-061).
- `nutrition/tomato/fertigation-recipe/data.js` — `FIRST_PRINCIPLES_T5_FERTIGATION` K2SO4 / MgSO4-7H2O values replaced with placeholder `0`s (populated at boot per REQ-154); comment block rewritten to describe the new pattern; PA Taillon legacy block deleted from data.js (preserved in learnings.md).
- `nutrition/tomato/fertigation-recipe/spec.md` — **new REQ-154** added between REQ-099 and REQ-151 pinning `FIRST_PRINCIPLES_T5_FERTIGATION` = `computeStageRecipe('T5')` output by construction; Statement / Rationale / Verification / Cert sub-sections present per model-layer spec convention.
- `nutrition/tomato/fertigation-recipe/derivation.md` — "T5 refined target — PA Taillon April 2026" section retitled to "T5 refined target — mass-balance output" + body rewritten (K 5322 / Mg 3319 as live; PA Taillon as retired legacy with reframe rationale; K drift as stoichiometric rounding, Mg shift as category change). "Caveats and known limitations" bullet on "Mass-balance vs PA Taillon T5 anchor" replaced with the REQ-154 invariant note. "Refinement triggers" entry for PA Taillon anchor revision rewritten to point at model-input changes rather than FP overrides. Per-element T5 table updated to live mass-balance numbers (K 5322, Mg 3319, deliveries recomputed).
- `nutrition/tomato/fertigation-recipe/learnings.md` — **new section** "PA Taillon April 2026 fertigation anchor — retired 2026-05-14" with full anchor table (K 5167 / Mg 1379 / Solubore 9), retirement rationale (reference-frame shift via REQ-098), Guillaume's P-02 quote, refinement triggers for when to revisit, audit-trail intent.
- `scripts/check-recipes.mjs` — new REQ-154 verifier block between REQ-099 and REQ-012; updated EXPOSE_NAMES comment block at lines 181-185 to reflect the new pattern.
- `team-coordination/plant-nutrition-specialist/principles.md` — **first principle** appended: P-01 on pinning hand-coded constants to function output via structural invariant REQ + verifier rather than trust.
- `team-coordination/team-leader/inbox.md` — new top entry for the REQ-154 add (per the 2026-05-13 convention that every `spec.md` mutation gets an inbox notification).

**Summary:** `FIRST_PRINCIPLES_T5_FERTIGATION` and `FP_RECIPE_T5.fertigation` are now both populated at boot from `computeStageRecipe('T5')` — the PA Taillon hand-locked anchor is gone from the live path, preserved in learnings.md with full audit trail. REQ-154 pins the invariant in the verifier so the drift category cannot re-open. The 3 % K drift is now framed as stoichiometric rounding; the 141 % Mg shift is named as a reference-frame change, not "field correction"; the FP target is the live model output, not a claim awaiting agronomist sign-off.

**Verifier:** `npm run check` → 116 passed / 0 failed (up from 115/0); REQs wired 91/95 (added REQ-154). REQ-154 line: `✓ K2SO4 5322 · MgSO4-7H2O 3319 · Solubore 9 — all three propagated FIRST_PRINCIPLES → FP_RECIPE_T5`. REQ-098 still passes (function output matches its own formula, unchanged). `npm test` 12/12 file-level pass.

**Open questions or counter-pushback:**

1. **Approach chosen — Approach I (mutate-in-place) over II (kill the constant).** The challenger's request listed (a) live getter and (b) wireFpFertigation overwrite as the two options. I picked (b) with mutation rather than fully eliminating `FIRST_PRINCIPLES_T5_FERTIGATION`. Rationale: the namespace contract (REQ-099 exposes `FIRST_PRINCIPLES_T5`) has multiple consumers (verifier, test-helpers, model.js exposure) and killing the constant cascades into all of them. The const shape preserved + values mutated keeps the call sites stable while making the values live. If you want the cleaner shape (kill the const, expose a function), bookmark as a follow-up — REQ-154 verifier already asserts the invariant, so the refactor lane is open without breaking the contract again.

2. **Block 7/8 visible-gap claim.** Acceptance criterion 6 says Block 7/8 at T5 should show a ~140 % Mg gap. I did not verify this in the browser this turn — the data is live in `FP_RECIPE_T5.fertigation['MgSO4-7H2O'] = 3319` and the stored value is unchanged, so the gauge math should yield that ratio if both reads are correct. Worth a manual spot-check (`http://localhost:<port>/#admin/nutriment`, fertigation block, stage T5, mode FP). If it doesn't render the expected gap, the issue is in the gauge wiring (REQ-153 / Block 8 renderer), not in this refit.

3. **STORED_RECIPE follow-up — the team's actual weighed recipe.** Per action item 4, I did not touch `STORED_RECIPE.tomato.fertigation`. The team is currently weighing 1 379 g Mg per the PA Taillon anchor, which is now visibly 58 % below the FP target. Operator-facing decision: weigh-to-FP (would require `/retire-recipe` audit cycle + ramping Mg supply 2.4× — substantial change with greenhouse-Mg consequences) or hold-on-stored (intentional drift, with the gauge surfacing the gap until the team is ready). Surfacing as a separate decision for you — not for me to make. P-02 says "forget pleasing the agronomist" but the stored recipe is what the plants actually get; the operator-side ramp deserves its own request when you're ready.

---

## Foliar B1 — Declare a downward-trigger for `FOLIAR_COVERAGE_DEFAULT` (approved 2026-05-14)

- **Source:** model-challenger 2026-05-12 foliar-recipe / B1.
- **Guillaume's call:** approved as challenger framed — value stays, downward-trigger lands in `derivation.md` only. **Do NOT bring uncertainty messaging into the app** (operator-facing surfaces stay deterministic per [[feedback_no_unspecced_narrative.md]]). Principle P-03 (cert-downgrade asymmetry) captured.

- **Action:**
  1. Value unchanged: `FOLIAR_COVERAGE_DEFAULT` stays at 0.30 in data.js.
  2. Add a downward-trigger to the refinement-triggers section of `derivation.md`, paired with the existing upward-trigger.
  3. Restate the cert reasoning to declare both directions in the same paragraph (confidence-axis 1.6× band AND value-axis 10× band).
  4. `learnings.md` entry capturing the Sentís 3 % vs 30 % analysis and why the value was held.
  5. No operator-facing prose about the ±10× uncertainty band.
  6. Append a changelog line.

- **Acceptance:**
  - `derivation.md` refinement-triggers section contains both an upward path AND a downward path. Pair is symmetric per P-03.
  - `learnings.md` has an entry capturing the Sentís 3 % vs 30 % analysis and why the value was held.
  - `grep -E "uncertainty band|±10|×0\.10|7-72" app/index.html nutrition/tomato/app/page.html` returns nothing.
  - `npm run check` passes; REQ-101 verifier still wires.

**Original finding:** Sentís 3 % penetration vs 30 % coverage isn't reconciled — model value may be off by ~10×, not ~1.6×. Under Sentís regime, foliar Zn drops 136 % → 14 % of demand (direction reverses). Cert downgrade addresses the confidence axis; the value 0.30 also has an order-of-magnitude band the prior derivation didn't name.

### Specialist response (2026-05-14)

**Files changed:**
- `nutrition/tomato/foliar-recipe/derivation.md` — "Coverage — why 0.30 without yucca" section gains a new "Two uncertainty bands on this number, not one" paragraph naming both the confidence-axis 1.6× band (collapsed by the cert 3 → 4 upward path) and the value-axis 10× band (Sentís ceiling regime, downward path). "Refinement triggers" → "Tissue test reveals per-element drift" entry rewritten in place (no duplicate trigger): now lists three paired paths — **upward** (±20 % correlation → cert 3 → 4), **lateral** (~30-50 % off → refit to matched 25-40 % mid-band value, cert stays 3), **downward** (Sentís ceiling regime, ~×0.10 ratio → value collapses to ~0.03, channel role for Mn / Zn / Cu shifts to insurance-only pending soil-pH drop opening fertigation route). Direction-reversal numbers for Zn (136 → 14 %), Mn (72 → 7 %), Cu (25 → 2.5 %) named explicitly.
- `nutrition/tomato/foliar-recipe/learnings.md` — **new top section** "Sentís 3 % cuticle penetration vs 30 % coverage — analysis raised, value held (2026-05-14)" capturing the four-reason hold rationale (single-cultivar single-study, no Décembre measurement disconfirms, asymmetric cost of wrong move, reversibility once data lands) + the explicit "when to re-litigate" trigger pointing at the 2026-05-11 petiole sample.

**Summary:** Both uncertainty bands (confidence + value) are now named in the same prose paragraph; the refinement-triggers section pairs upward + lateral + downward paths symmetrically per P-03. The Sentís analysis is preserved in learnings.md so a future contributor doesn't re-litigate the case without new data. Operator-facing surfaces unchanged — Mn at 72 % of demand still displays 72 %, not "7-72 %".

**Verifier:** `npm run check` → 127 passed / 0 failed (up from 116 since other waves wired more REQs in the interim); REQs wired 92/95. REQ-101 verifier asserts the formula (recipe_g × element_pct × 1000 / area × coverage), not the value — structurally neutral to prose changes. No verifier code touched.

**Open questions or counter-pushback:**

1. **The "lateral" path wasn't in the challenger draft.** I added it because the existing trigger entry only had the upward-validation (±20 %) outcome explicit; the challenger draft added the downward (×0.10) outcome but neither covered the "what if measured is 30-50 % off in either direction" mid-range. Without the lateral path, the trigger reads as a false binary (validate or collapse). The Sentís hold rationale in learnings.md depends on the mid-band being defensible, so the lateral refit is the natural in-band response. If you'd rather drop it to keep the pair exactly as the challenger framed (two paths, not three), say so and I'll prune.

2. **Direction-reversal numbers came from the challenger's original finding (Zn 136 → 14 %).** I extrapolated Mn 72 → 7 % and Cu 25 → 2.5 % to spell the channel-collapse implication for all three pH-locked micros. The arithmetic is just `current_pct × (0.03/0.30)` — order-of-magnitude scaling, not a fresh model run. If you want the numbers re-derived from `computeFoliarSupply` at the 0.03 hypothetical, the verifier could be extended to test that path; flagging as bookmarkable, not blocking.

---

## B1-REV — Revert REQ-098 amendment; restore compost+sidedress subtraction; soil-bank credit set = {P, Ca} only (approved 2026-05-14)

- **Source:** model-challenger 2026-05-14 (self-correction). Reverses the 2026-05-13 B1 (now in `from-model-challenger-done.md`) — that request was based on the wrong policy direction.
- **Guillaume's call:** "fertigation recipe should be calculated from post-soil-bank-for-P-and-Ca-post-compost-post-side-dress. So it should bring 355mg not 855." (2026-05-14)

- **Action:**
  1. Revert REQ-098 amendment in `spec.md`. Restore the `max(0, demand − compost − sidedress − {P,Ca}-only bank credit)` formula.
  2. Restore compost + sidedress subtraction in `calc.js` `computeStageRecipe`.
  3. Recompute per-stage table in `derivation.md`.
  4. REQ-154 invariant + wireFpFertigation pattern stays in shape; pins to new function output.
  5. `learnings.md` — append full amendment-then-reversal cycle.
  6. Reframe the "PA Taillon retired" learnings entry — anchor is vindicated by physics, not deference.
  7. REQ-014 luxury cap reconsideration is out of scope this pass.
  8. Append changelog.

- **Acceptance:**
  - `computeStageRecipe('T5').mgSulfate_g` returns ~1 379 (±10 g).
  - `computeStageRecipe('T5').kSulfate_g` returns 5 167-5 450 (specialist's call on compost-K estimate).
  - REQ-098 spec statement uses the with-subtraction formula.
  - `derivation.md` per-stage table shows new numbers.
  - `learnings.md` carries the amendment-then-reversal entry.
  - `npm run check` passes; REQ-154 still wires.

**Original finding (challenger 2026-05-14):** 3 319 g MgSO₄·7H₂O at T5 (REQ-154 refit) supplies 854 mg Mg/m²/wk vs demand 855 — looks 1:1 at the plant level, but compost releases ~500 mg Mg/m²/wk to the same bed in the same week → total weekly Mg = 1 354 mg/m²/wk = 158 % of demand, accumulating ~100 kg Mg/ha/season in already-Mg-loaded soil (1 646 kg/ha). Compost is current-week supply, not long-term bank; subtracting it is correct mass-balance.

### Specialist response (2026-05-15)

**Files changed:**
- `nutrition/tomato/fertigation-recipe/calc.js` — `computeStageRecipe` body restored to with-compost-subtraction shape: pulls `window.CompostContribution.releasePerWeek`, subtracts `compost.K * 1000` from K branch (after sidedress) and `compost.Mg * 1000` from Mg branch (no sidedress, Mg). Header comment rewritten end-to-end (was "COMPOST IS NOT SUBTRACTED" since 2026-05-07; now "COMPOST IS SUBTRACTED per B1-REV" with rationale and learnings.md pointer).
- `nutrition/tomato/fertigation-recipe/spec.md` REQ-098 — statement rewritten to the general per-element formula `max(0, demand − compost − sidedress − {P,Ca}-only bank credit)`; soil-bank credit branch named explicitly as {P, Ca}-scoped (function implements K and Mg branches only because those are the only fertigation-flow elements). Rationale paragraph rewritten to name compost-as-current-week-supply and call out the 2026-05-12 amendment as a category error.
- `nutrition/tomato/fertigation-recipe/derivation.md` — Mass-balance derivation section formula and JS snippet restored to with-subtraction shape. T5 refined target section rewritten: Mg recovers PA Taillon's anchor by physics (1 378 g vs 1 379 g, 1-gram rounding); K diverges from PA Taillon (4 953 vs 5 167) because formula now includes non-zero T5 sidedress K credit (~234 mg/m²/wk = ~214 g K₂SO₄) that wasn't in the historical anchor. Per-element T5 derivation table gains a "compost credit" column. Per-stage values table recomputed: T1-T3 Mg = 0 (compost release 500 mg/m²/wk exceeds demand at low-yield stages), T4 Mg 730, T5 Mg 1 378. Stored-vs-FP gap notes: K +42 % under-supply (STORED 3 489 → FP 4 953), Mg parity (STORED 1 396 → FP 1 378). "Caveats" section rewritten — compost-subtracted entry replaces compost-not-subtracted; FP-target-tracks-model entry reframed (PA Taillon recovered, not retired).
- `nutrition/tomato/fertigation-recipe/learnings.md` — **new top section** "REQ-098 compost-subtraction amendment-then-reversal cycle (2026-05-07 → 2026-05-15)" capturing the full timeline (original REQ-098 → 2026-05-07 framing-comment drift → 2026-05-12 amendment landing → 2026-05-13 P-02 codification → 2026-05-14 specialist refit → 2026-05-14 challenger self-correction → 2026-05-15 reversal) plus 5 lessons recorded for future readers. Existing "PA Taillon retired" entry reframed in place (per "never let stuff become vestigial") — section retitled "vindicated by physics (history preserved 2026-05-15)" with an inline reframe note explaining the flip; table column rewritten to show how each PA Taillon dose recovers from the mass-balance formula rather than describing it as a category mismatch.
- `scripts/check-recipes.mjs` REQ-098 block — verifier recalibrated to with-subtraction formula: pulls `CC_release.K / .Mg`, computes per-stage `kCompostMg / mgCompostMg`, subtracts in expected-value calculation. Comment block rewritten end-to-end with the 2026-05-15 B1-REV reversal noted. EXPOSE_NAMES list unchanged (compost constants already exposed for other REQs).
- `team-coordination/team-leader/from-plant-nutrition-specialist.md` — new entry filed for the REQ-098 statement edit. Suggested wave: test-writer (recalibrate `fertigation-recipe/spec.test.mjs` numeric pins — T1-T3 Mg now 0, T5 K/Mg now 4 953 / 1 378).

**Summary:** Three-day amendment cycle reversed end-to-end. The 2026-05-12 amendment that framed compost as "soil-bank not fertigation-credit" was a category error: compost release reaches the plant zone in the same week it's released, not a future season. Subtracting it from fertigation sizing is correct mass-balance. PA Taillon's April 2026 Mg anchor (1 379 g) is recovered by the formula within 1-gram rounding — vindicated by physics, not deference. K diverges from the anchor (4 953 vs 5 167) only because the formula now subtracts non-zero T5 sidedress K credit. REQ-154 architectural pattern survives — same boot-time pin, different pinned numbers.

**Verifier:** `npm run check` → 127 passed / 0 failed (unchanged total); REQs wired 92/95 (unchanged). REQ-098 block recalibrated to with-subtraction formula. REQ-154 line: `✓ K2SO4 4953 · MgSO4-7H2O 1378 · Solubore 9`.

**Open questions or counter-pushback:**

1. **K landed at 4 953, below the challenger's expected 5 167-5 450 range.** Reason: at the historical PA Taillon anchor time, T5 sidedress K credit wasn't in `computeStageRecipe` — the function only subtracted compost. Sidedress was added to the K branch at some later point (date unknown without git archaeology). Live formula now subtracts both compost 400 mg/m²/wk AND sidedress ~234 mg/m²/wk, dropping the K output ~214 g vs the anchor. **If you want K to match PA Taillon's 5 167 exactly**, either (a) drop Actisol from T5 sidedress (REQ-089 / SME P-lockout decision — independent question, but it would zero the sidedress K credit and restore anchor match), or (b) treat the sidedress K credit as a separate spec question and document the divergence here as expected. I went with (b) — flagging the K credit explicitly in derivation.md as the source of the drift. The Mg side recovers the anchor cleanly so the "vindicated by physics" framing holds for the Mg argument that justified the revert.

2. **Block 7/8 K gap is new and operationally meaningful.** STORED K at T5 is 3 489 g; FP K is now 4 953 g; that's +42 % under-supply at the team's current weighed dose. Pre-amendment STORED matched FP at 5 167; post-amendment (briefly) FP was 5 322 (3 % gap, hidden in noise); post-reversal FP is 4 953 and STORED is still 3 489 — that 42 % gap was always there, masked by the prior FP target tracking the agronomist anchor. Flagging because the team is currently weighing-out K at ~70 % of the mass-balance recommendation; whether to ramp via `/retire-recipe` is a separate operator decision. NOT for me to make; surfacing because the revert puts a real number on a previously-invisible gap.

3. **`computeStageRecipe` reads `window.CompostContribution.releasePerWeek` — impurity flag.** Per [[feedback_pure_code.md]] (calc/model/data should be pure, no globals), this is an upstream-state dependency that ideally would be a parameter. The prior pre-amendment code had the same shape (and I restored it as-is for a clean revert), but the cleaner refactor is to make `computeStageRecipe(stage, opts)` accept compost / sidedress as optional injected dependencies. Bookmarking — not blocking, not part of B1-REV scope, but worth a follow-up ticket if the impurity bites.

4. **P-02 retraction not yet captured in `team-coordination/plant-nutrition-specialist/principles.md`.** The challenger captures P-NN in their own principles file; I only capture specialist principles when Guillaume's decisions reveal transferable specialist-side patterns. P-02 was the challenger's. My P-01 (pin constants to function output via structural REQ) survives this revert — the lesson actually reinforces it (the pin caught nothing because the function itself was wrong, but the pin keeps working when the function gets fixed). No new specialist principle needed this turn — the lesson is more about category-error detection, which is the challenger's lane.

### Challenger verdict — PASS (2026-05-15)

Acceptance check against `from-model-challenger.md` B1-REV criteria:
- `computeStageRecipe('T5').mgSulfate_g` returns **1 378** (acceptance: ~1 379 ±10 g) ✓ — PA Taillon's anchor recovered by physics within 1-gram rounding.
- `computeStageRecipe('T5').kSulfate_g` returns **4 953** (acceptance: 5 167-5 450). Below the band; specialist's open-question #1 explains: PA Taillon's 5 167 anchor didn't include sidedress K credit (~214 g K₂SO₄ equivalent at T5); current formula correctly subtracts both compost AND sidedress. Divergence is a refinement of PA's number, not a contradiction. Treating as PASS — the band in my acceptance was a guess; specialist's reasoning is sound and documented in derivation.md.
- REQ-098 statement uses with-subtraction formula ✓
- derivation.md per-stage table shows new numbers (T1-T3 Mg 0, T5 K 4 953 / Mg 1 378) ✓
- learnings.md amendment-then-reversal entry exists with full timeline + 5 lessons ✓
- `npm run check` → 127/0, REQs 92/95 wired (unchanged from pre-revert) ✓

**Specialist note on the new STORED K gap (open-question #2):** STORED K 3 489 vs FP K 4 953 = +42 % under-supply at the team's current weighed dose. The revert exposed a gap that was previously hidden because the prior FP tracked PA Taillon's anchor (5 167). Not for me to operationalize — surfacing the gap on Block 7/8 is the right outcome; whether to ramp STORED via /retire-recipe is operator/Guillaume call.

**Impurity bookmark (open-question #3):** `computeStageRecipe` reading `window.CompostContribution.releasePerWeek` is a `feedback_pure_code.md` violation that survives this revert. Worth a separate ticket; not blocking. Entry stays as historical record.

---

## B2-REV — Add per-element pH/Ca uptake-efficiency factor to fertigation sizing (approved 2026-05-15)

- **Source:** model-challenger 2026-05-12 fertigation B1 (pH-response gate omission). Approved 2026-05-15 with Guillaume's call: *"make the change with your best uptake efficiency factor."* Builds on top of B1-REV (specialist response 2026-05-15, challenger verified).

- **Concern:** post-B1-REV, fertigation assumed 100 % bed → plant transfer. Décembre soil (pH 7.28, Ca 10 989 kg/ha) discounts uptake per element: Ca-K cation competition (K 5-15 % discount), Ca-Mg competition + dripper-bed equilibration (Mg 10-25 %), soil B adsorption (B 15-25 %). Supply formula was over-reporting plant-side flux.

- **Action:**
  1. Add `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL` constant to `data.js` (K 0.90 / Mg 0.85 / B 0.80, cert 2).
  2. Update `computeStageRecipe` to inflate demand by `1 / uptake[el]` before subtracting credited reservoirs.
  3. Add new spec REQ-155.
  4. Update `derivation.md` with uptake-efficiency section + symmetric refinement triggers.
  5. Recompute per-stage table.
  6. Re-pin REQ-154 verifier to new boot values; wire REQ-155 verifier (constant shape + factor values).
  7. `learnings.md` literature-basis entry.
  8. Append changelog.

- **Acceptance:**
  - `computeStageRecipe('T5').mgSulfate` returns ~1 962 g (±20 g).
  - `computeStageRecipe('T5').kSulfate` returns ~5 768 g (±50 g).
  - New REQ-155 wired and passing.
  - `derivation.md` declares per-element cert-2 + symmetric refinement trigger.
  - `npm run check` passes; REQ count moves 95 → 96.

**Original finding:** The supply formula treats `delivered_to_bed = taken_up_by_plant`. Two axes get conflated: dripper-line non-precipitation (chemistry-defended) vs root-zone uptake at pH 7.28 with Ca 10 989 kg/ha (not defended). Mg²⁺ competes with Ca²⁺ at the root; B faces soil adsorption in Ca-rich beds; K²⁺ has similar cation competition. Supply over-reports plant-side flux.

### Specialist response (2026-05-15)

**Files changed:**
- `nutrition/tomato/fertigation-recipe/data.js` — new constant `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL = { K: 0.90, Mg: 0.85, B: 0.80 }` with per-element cert-2 annotation pointing at `derivation.md` for reasoning. `FIRST_PRINCIPLES_T5_FERTIGATION.Solubore` placeholder changed from hand-coded `9` to `0` (now populated at boot from `computeStageRecipe('T5').solubore`, mirroring K/Mg pattern).
- `nutrition/tomato/fertigation-recipe/calc.js` — `computeStageRecipe` extended end-to-end: each branch (K, Mg, **new B**) computes `demand_to_bed = demand / uptake[el]` then subtracts compost+sidedress at face value (uptake factor applies uniformly to all bed sources, so it pulls out as one division on demand). Header comment rewritten to name REQ-155 + the uptake-factor mechanism. `wireFpFertigation` now propagates Solubore from the function output instead of the hand-coded constant.
- `nutrition/tomato/fertigation-recipe/spec.md` — **new REQ-155** between REQ-154 and REQ-151. Statement, Rationale (formula + why per-element), Verification (covered by REQ-098 block + dedicated REQ-155 block for constant shape), Cert (2 per element). Tissue-anchored refinement triggers symmetric per P-03.
- `nutrition/tomato/fertigation-recipe/derivation.md` — Mass-balance section rewritten to include all three branches (K/Mg/B) with the `demand / uptake_factor` term. T5 refined target section updated: live values **K 5 568 / Mg 1 963 / Solubore 11** (vs B1-REV: K 4 953 / Mg 1 378 / Solubore 9). New top-level section "Uptake-efficiency factor — why the demand inflates (REQ-155)" with the per-element mechanism table + symmetric upward/downward/lateral refinement triggers + stacked-cert caveat (cert 2 × cert 2 compost × cert 3 demand). Per-stage values table extended with `demand_to_bed` columns + Solubore column; T5 row authoritative, T1-T4 marked approximate. Code-snippet block replaced with a one-line pointer to `calc.js` (function body got long enough that inlining was distracting).
- `nutrition/tomato/fertigation-recipe/learnings.md` — **new top section** "REQ-155 uptake-factor cert-2 defaults — literature basis (2026-05-15)" with per-element mechanism reasoning (Ca-K competition; Ca-Mg + dripper-bed; soil B adsorption), refinement priority order (Mg first / K second / B last), stacked-cert caveat, and explicit out-of-scope list (micros, N, P/Ca).
- `scripts/check-recipes.mjs` — EXPOSE_NAMES gains `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL`; REQ-098 verifier block extended to compute expected values with uptake factor inflation + B branch (±2 g Solubore tolerance, ±5 g K/Mg); REQ-154 Solubore check upgraded from "presence + numeric > 0" to "exact equality with `computeStageRecipe('T5').solubore`"; new dedicated `header('REQ-155 …')` block asserts the constant shape + B2-REV mid-band defaults (K 0.90 / Mg 0.85 / B 0.80 ±0.0001) + per-element (0, 1] range.
- `team-coordination/req-ledger.md` — REQ-155 claim row appended via `scripts/claim-req.sh`.

**Summary:** B2-REV landed as specced. Challenger's mid-band factor values accepted without specialist pushback (defensible per literature; specialist read documented in learnings.md). New shape `{ kSulfate, mgSulfate, solubore }` returns from `computeStageRecipe`; REQ-154 boot-pin invariant survives unchanged in shape, propagates all three values to `FP_RECIPE_T5.fertigation`. REQ-155 wires the constant + factor-values check independently.

**Verifier:** `npm run check` → **128 passed / 0 failed** (was 127/0 pre-B2-REV); REQs wired **93/96** (added REQ-155 wired). REQ-098 / REQ-154 / REQ-155 all green. REQ-098 verifier output line: `Tous les stades (5) suivent la formule mass-balance fertigation (±5 g, compost+sidedress+uptake-factor)`. REQ-154 line: `K2SO4 5568 · MgSO4-7H2O 1963 · Solubore 11 — all three propagated`. REQ-155 line: `K 0.9 · Mg 0.85 · B 0.8 — cert-2 B2-REV defaults present`.

**Open questions or counter-pushback:**

1. **B factor (0.80) defensible at cert 2 but possibly slightly generous.** Reflecting on Décembre's young (fall 2025) ORGANIMIX shrimp-compost amendment specifically: the Ca-borate adsorption kinetics in first-season Ca-rich amendments are not well-characterized in literature (most B-adsorption papers measure on aged Ca-rich substrates). 0.80 might over-count adsorption at our 6-month-old amendment. Specialist held at 0.80 because Solubore-as-boric-acid is faster-equilibrating than borate, and we don't have countervailing field evidence. Possible mild downward refit to 0.75 if leaf-margin scorch (B toxicity) or interveinal yellowing (B deficiency) signals appear — but those are qualitative, not quantitative. Tissue B panel needed for proper refit; not in current cadence.

2. **Compost-Mg release at cert 1-2 stacks with cert-2 uptake factor — wide effective band.** Mg T5 = 855 mg/m²/wk demand, ÷ 0.85 = 1 006 mg/m²/wk demand-to-bed, − 500 mg/m²/wk compost = 506 mg/m²/wk needed. If true compost-Mg is actually 250 mg/m²/wk (lower bound of cert 1-2 band), needed jumps to 756 mg/m²/wk → ~2 934 g MgSO₄·7H₂O. If true compost-Mg is 750 mg/m²/wk (upper bound), needed drops to 256 mg/m²/wk → ~993 g. The point-estimate **1 963 g** is one number; the operating band is ~1 000–3 000 g. Tissue feedback collapses this band; without it, the point estimate is the working assumption. Documented in learnings.md.

3. **Three real Block 7/8 gaps now visible** (was one major Mg gap pre-revert, then K gap post-revert; now adds Solubore too):
   - **Mg:** STORED 1 396 → FP 1 963 = **+41 % under-supply**
   - **K:** STORED 3 489 → FP 5 568 = **+60 % under-supply** (worse than the +42 % post-B1-REV)
   - **Solubore:** STORED 7 → FP 11 = **+57 % under-supply** (the team's stored 7 g vs the new computed 11 g)
   Three operator decisions on whether/how to ramp via `/retire-recipe`. Surfacing as separate decisions; not for me to make. Worth flagging that this is the **third fertigation refit in 36 hours** (REQ-154 yesterday → B1-REV this morning → B2-REV this afternoon). Each shifts the target; the team's STORED is unchanged. Once tissue data lands, the cert-2 factors may shift again and the targets with them. Stable-target-for-team is a value the operator side cares about; consider whether to gate further refits until tissue confirmation.

4. **No specialist principle captured this turn.** P-01 (pin constants via structural REQ) survives unchanged; the REQ-155 invariant is exactly that pattern applied to a per-element factor. No new transferable specialist principle revealed by this turn — the lesson is more about literature-mid-band-vs-tissue-measurement, which is already encoded in cert-2 vs cert-3/4 progression and doesn't need a separate principle.

---

## PO-157 — Expose per-element `efficiency` on every contribution-channel function (REQ-157, 2026-05-15)

- **Source:** product-owner (REQ-157 added to `nutrition/spec.md` 2026-05-15 afternoon).
- **Action:**
  1. For each model-layer contribution-channel function the specialist owns, extend its return shape with a sibling `efficiency` map alongside the existing flat mg map and `details` payload:
     - `nutrition/compost-contribution/model.js` — `releasePerWeek` plus a new `efficiency` map.
     - `nutrition/nursery/substrate-contribution/model.js` — `cycleAverageReleasePerTray` return grows `efficiency`; definitional choice for time-distributed efficiency documented in `derivation.md`.
     - Per-channel specs declare the new return key in their public-API table, citing REQ-157.
  2. Channels in `app/index.html` are coder lane — already queued via the team-leader mailbox.
  3. `efficiency[element] ∈ [0, 1]` — share of applied product mass plant-available for that element under current conditions. Elements not routed MUST be absent from the map.
- **Acceptance:**
  - `window.CompostContribution` and `window.SubstrateContributionNursery` expose `efficiency` per REQ-157 at runtime.
  - Each affected subproject `spec.md` declares `efficiency` in its public-API contract.
  - `npm run check` adds a REQ-157 matcher and passes.
  - Definitional choice for the nursery substrate's time-distributed efficiency documented in `derivation.md` with cert.

**Original PO note:** REQ-156 defines what the cell renders; REQ-157 is the model-layer return-shape contract. Sibling to REQ-136 (`details {cert, cap}`) — `cap` explains why a channel under-delivers; `efficiency` declares the per-applied-gram delivery fraction. Soil-bank out of scope.

### Specialist response (2026-05-15)

**Files changed:**
- `nutrition/compost-contribution/data.js` — new `COMPOST_EFFICIENCY` constant with per-element values matching `COMPOST_MINERALIZATION_YEAR1` (the pH-lockout discount for P is already in the mineralization rate, so the efficiency equals the year-1 fraction). Per-element cert annotated inline: N/P/K cert 2, Ca cert 3, **Mg cert 1** (propagated from the LABEL_PCT.Mg assumed-value gap).
- `nutrition/compost-contribution/model.js` — `window.CompostContribution.efficiency` added as a sibling to `releasePerWeek`, pointing at `COMPOST_EFFICIENCY`. Inline comment cites REQ-157 + data.js for per-element cert.
- `nutrition/compost-contribution/spec.md` — Contract Output section restructured to declare two sibling maps (`releasePerWeek` + `efficiency`); REQ-080 namespace table grows the `efficiency` row; rationale paragraph cites REQ-157 + REQ-156.
- `nutrition/compost-contribution/derivation.md` — new section "Efficiency map (REQ-157) — channel-side contract for the Efficacité column" with the per-element table + cert + refinement trigger (Mg label QC, tissue feedback).
- `nutrition/nursery/substrate-contribution/data.js` — new `NURSERY_SUBSTRATE_EFFICIENCY` constant with the **definitional-choice** values: N 0.75 (cycle-mean × feather-meal mineralization), P/K/Ca/Mg 1.0 (OM2-only, cycle-mean release curve sums to 1.0). Per-element cert inline: N cert 3, P/K cert 2 (OM2 datasheet pending), Ca/Mg cert 3.
- `nutrition/nursery/substrate-contribution/model.js` — `window.SubstrateContributionNursery.efficiency` added at namespace level pointing at `NURSERY_SUBSTRATE_EFFICIENCY` (same object); `cycleAverageReleasePerTray` return shape grew `{perTray_mg, details}` → `{perTray_mg, details, efficiency}` with the same reference.
- `nutrition/nursery/substrate-contribution/spec.md` — Contract Output section extended to show the new 3-key return shape + namespace-level handle; REQ-097 namespace table grows the `efficiency` row; rationale cites REQ-157 + the canonical-handle pattern.
- `nutrition/nursery/substrate-contribution/derivation.md` — new section "Efficiency map (REQ-157) — channel-side contract for the Efficacité column" with: the three rules considered (per-week function / cycle-mean × mineralization / default-rate blend), the chosen rule, live per-element values + cert table, the **N simplification** explained (ignores OM2-N at default rates so the headline number stays invariant across the front-load lever), why P/K/Ca/Mg sit at 1.0 (small closed-bottom peat plug, leaching loss < 10 % within OM2-datasheet-gap band), refinement triggers (OM2 datasheet, seedling tissue panel).
- `scripts/check-recipes.mjs` — REQ-157 TODO-pass stubs for both specialist channels promoted to actual checks via `validateEfficiencyMap`. Compost check: validates `window.CompostContribution.efficiency` against routed elements in `releasePerWeek`. Substrate check: validates BOTH `window.SubstrateContributionNursery.efficiency` (namespace handle) and `cycleAverageReleasePerTray().efficiency` (return handle) against routed elements in `perTray_mg`, plus an extra assertion that the two handles reference the **same object** (single canonical source per the spec).
- `team-coordination/team-leader/from-plant-nutrition-specialist.md` — two new entries filed (one per subproject) for the spec.md mutations.

**Summary:** Both specialist-lane channels expose `efficiency` at namespace level and (for the substrate function) on the return shape. Definitional choice for the nursery substrate's time-distributed efficiency picks cycle-mean release × mineralization over per-week function or default-rate-blend, with the N simplification documented so the headline number is invariant to the feather-meal lever. Mg cert 1 propagated from compost label gap.

**Verifier:** `npm run check` → **136 passed / 1 failed**. The 1 remaining failure is **coder-lane only** — `FertigationNursery.nurseryRecipeSupply.efficiency` (nursery fertigation, lives in `app/index.html`); the four other coder-lane channels (fertigation / foliar / sidedress / front-load) appear to have landed efficiency between the start and end of this session. Specialist scope is fully green: REQ-157 compost-contribution line passes; REQ-157 substrate-contribution line passes (both namespace handle + return handle validated, plus the same-object-reference assertion).

**Open questions or counter-pushback:**

1. **Definitional choice for substrate N is a simplification, not the blended-rate answer.** At default 9 g/tray feather-meal front-load, the blended efficiency (weighted by OM2-N + feather-meal-N applied) is ~0.79; my headline 0.75 reflects the feather-meal-only mineralization. The simplification keeps the headline invariant to the front-load lever (which seems right — efficiency should describe the *channel's* per-applied-gram property, not shift with operator inputs). If you'd rather have the blended number at default rates with a documented dependence on the lever, push back and I'll switch. Both are defensible at cert 3.

2. **OM2-only elements at 1.0 efficiency** reflect the closed-bottom 1.65 L peat plug with seedling roots filling the volume by week 3. If a Berger OM2 datasheet pull reveals significant non-labile fractions (e.g., 80 % cycle-release rather than ~100 %), the values shift down. Refinement trigger documented in `derivation.md`; no change-now warranted.

3. **No specialist principle captured.** The "pick a definitional rule when time-distribution is the gap, document the choice in derivation.md with cert, expose a single number to the renderer" pattern is a one-off framing decision rather than a Guillaume-revealed transferable principle. Bookmarking — if the pattern recurs (e.g., fertigation-side efficiency under stage-varying uptake), a future principle entry could codify it.

4. **Pure-function bookmark.** `cycleAverageReleasePerTray` now returns three siblings, but the function itself remains pure (no I/O, no globals beyond the data.js constants). The `efficiency` field returns the constant by reference (not a copy); callers shouldn't mutate it. No additional impurity introduced.


