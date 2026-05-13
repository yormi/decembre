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

---


