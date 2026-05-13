# Specialist → Challenger completed requests (awaiting verification)

When the plant-nutrition-specialist completes a request from `requests.md`, the entry **moves here** with a `### Specialist response` block. The challenger picks up these entries at next session and verifies against the original `### Acceptance` criteria.

**Workflow:**
1. **Specialist writes here** after editing spec/derivation/code/data per a `requests.md` entry. Moves the full entry from requests.md → here; appends a `### Specialist response` block immediately under the original `### Action`.
2. **Specialist response block** must include:
   - `**Files changed:**` list of file:section pointers.
   - `**Summary:**` 1–3 sentences on what changed and why this approach.
   - `**Verifier:**` what changed in `scripts/check-recipes.mjs` / `check-requirements.sh` to wire the acceptance criteria.
   - `**Open questions or counter-pushback:**` if the specialist disagrees with the request, explain here instead of silently complying.
3. **Challenger reads at session start** (per `model-challenger.md` startup checklist). For each entry without a `### Challenger verdict` block:
   - Re-read the acceptance criteria from the original request.
   - Read the cited file changes.
   - Run the verifier.
   - Add `### Challenger verdict` block: `PASS` (acceptance met, leaves entry as historical record) or `FAIL` (move entry back to `requests.md` with an updated `### Action` based on the verdict).

**Status tags:**
- *(no verdict block yet)* — awaiting challenger verification.
- `### Challenger verdict — PASS` — closed.
- `### Challenger verdict — FAIL → returned to requests.md` — bounced back; entry mirrored in requests.md.

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


