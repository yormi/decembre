# team-leader ← plant-nutrition-specialist

Spec-change notifications from the plant-nutrition-specialist persona. Each entry names one subproject whose `spec.md` changed (REQs added, edited, or deleted) and signals to the team-leader that test / code / prune work is now pending there.

The team-leader reads this file at session start. When it processes an entry — by running the relevant wave(s) for that subproject — it cuts the entry from this file and appends it to `from-plant-nutrition-specialist-done.md` with a one-line outcome.

## Format

Append at the top (most recent first):

```
## YYYY-MM-DD HH:MM — <subproject-path-relative-to-repo>

**Change type:** added | edited | deleted (one or more)
**REQs affected:** REQ-NNN, REQ-NNN, ...
**Summary:** 1–2 sentences on what changed in the spec.
**Suggested waves:** test-writer · coder · pruner (any/all — leader decides final scope)
```

`<subproject-path>` is the directory holding the changed `spec.md`, e.g. `nutrition/tomato/fertigation-recipe`.

A single turn that touches multiple subprojects writes one entry per subproject.

## Entries

## 2026-05-17 15:10 — nutrition/tomato/sidedress-recipe

**Change type:** edited
**REQs affected:** none (REQ-022 inheritance section wording only)
**Summary:** Eco-luzerne 3-0.5-2 cert framing reworded under the REQ-022 inheritance bullet — gate is now stated as filesystem-conditioned (cert PDF filed under `nutrition/doc/eco-luzerne-3-0-5-2/`, directory does not yet exist) rather than "TBD pending Ecocert evaluation"; no calendar, no recommendation, no operator nudge. No REQ identities moved.
**Suggested waves:** pruner (one prose-only check, low priority)

## 2026-05-17 14:30 — yield-range

**Change type:** edited
**REQs affected:** REQ-116 (statement tightened, no identity mutation); Specialist note 2026-05-17 reframed condition-based
**Summary:** REQ-116 spec body tightened — "decays from 1.0 (d ≤ 14) to 0.40 (d ≥ 28)" → "is `1.0` for `d ≤ 14`, linearly interpolated between `d = 14` and `d = 28`, and `0.40` for `d ≥ 28`" (the linear shape was implicit in `data.js:NURSERY_SPACING_PACKED` but absent from the normative claim). Specialist-note extension-pending block reframed: settled inputs enumerated (DLI formula preserved, breeder-anchored caps, field DLI share curve), REQ landing now gated on Guillaume's marketability-on-head-size commercial call (commercial input, P-08 keeps it off end-of-turn). Header block updated to cite newly scaffolded `derivation.md` + `learnings.md`. New scaffolds: `yield-range/derivation.md` (live REQ trace + consolidated refinement-trigger table) and `yield-range/learnings.md` (rejected Hochmuth root-cap, rejected senescence branch, rejected LED-only DLI, rejected seasonal lookup). No REQ-NNN identity mutations; no model.js / data.js / calc.js touched.
**Suggested waves:** pruner only (REQ-116 yield-range has no identifier-keyed matcher in `scripts/check-recipes.mjs` — the REQ-116 matcher there binds to `nutrition/tomato/foliar-recipe/spec.md`; yield-range REQs in the 112-116 range are exercised through `yield-range/` behavioral tests, not the global verifier).

**CROSS-CUTTING (orchestrator routing):** REQ-112 / REQ-113 / REQ-114 / REQ-115 / REQ-116 are claimed by BOTH `yield-range/spec.md` AND `nutrition/tomato/foliar-recipe/spec.md` (or `nutrition/tomato/app/spec.md`). The verifier in `scripts/check-recipes.mjs` matches the foliar-recipe semantics — yield-range REQs in that range have no verifier binding by identifier. Ledger only starts at REQ-154 — collision predates the ledger. Renumbering is PO scope. Recommend PO assigns yield-range a fresh contiguous block above REQ-170 via `scripts/claim-req.sh` and reroutes the in-tree identifiers (spec.md + data.js + calc.js + model.js + app/logic.js + tests) in one PR.

## 2026-05-17 11:57 — nutrition/tomato/fertigation-recipe

**Change type:** edited
**REQs affected:** REQ-098, REQ-099, REQ-154 (+ Contract section)
**Summary:** Mo carve-out (REQ-061 amendment 2026-05-16) now load-bearing across spec/derivation/verifier. `computeStageRecipe(stage)` return-shape contract extended to include `naMolybdate` (flat 0.5 g/wk floor, operator-weighing-anchored, NOT mass-balance-derived). REQ-098 statement now distinguishes mass-balance branches (K/Mg/B) from the flat-floor Mo branch. REQ-099 `FIRST_PRINCIPLES_T5` shape extended with `NaMolybdate` key. REQ-154 invariant covers all four products (K2SO4 / MgSO4-7H2O / Solubore / NaMolybdate) by construction. `scripts/check-recipes.mjs` REQ-154 verifier extended — NaMolybdate added to equality check + FP propagation loop (now 4-key, was 3-key). 149/0 passing. Derivation also got an inline active-channels vs REQ-013/014 envelope cross-reference table at T5 (bed-side + plant-side ratios) so Bilan readers don't bounce to nutrition/tomato/spec.md; B cert table reframed (stale "PA Taillon recommendation" prose replaced with mass-balance cert-stack reasoning).
**Suggested waves:** coder (verify `computeStageRecipe` return shape on `nutrition/tomato/fertigation-recipe/calc.js` matches the four-key contract — already does per my read; defensive in case the integrator-side has a consumer destructuring only the old two-key shape) · pruner (sweep for any "K2SO4 + MgSO4-7H2O + Solubore" enumeration leaving NaMolybdate off, especially in spec-string interpolation / Block 7 drift renderer / FP comparison surfaces)

## 2026-05-17 11:57 — nutrition/soil-contribution

**Change type:** edited
**REQs affected:** REQ-145
**Summary:** REQ-145 micros-gap closed. New `micros-foliar-routed` key declared (covers Fe / Mn / Zn / B / Cu — all measured banks, all routed via foliar per CHANNEL_ROLE). Element-to-key dispatcher mapping table added to spec body so future readers don't need to grep consumer logic. Verifier `expectedKeys` updated 6 → 7. **Coder follow-up REQUIRED:** dispatcher in `nutrition/tomato/app/logic.js` (lines 200-215) currently routes `B → 'B-fert-routed'`, a key a prior parallel session added to spec but I REMOVED today — B routes via foliar (Solubore in the foliar spray, CHANNEL_ROLE `B: {foliar:0.5, passive:0.5}`), not fertigation. Dispatcher branch `else if (element === 'B')` must be deleted so B falls into the `Fe / Mn / Zn / Cu / B → 'micros-foliar-routed'` branch (i.e. extend that branch's condition to include B). Until coder ships, runtime modal for B reads empty (SPEC_STRINGS lookup miss). Also stale comment in `nutrition/tomato/foliar-recipe/data.js:66` saying B is "single-channel via fertigation" — wrong, contradicts CHANNEL_ROLE; comment-only fix.
**Suggested waves:** coder (dispatcher fix + foliar-recipe/data.js:66 comment) · test-writer (pin micros-foliar-routed key reached for B at runtime once dispatcher fixed) · pruner (sweep any other B-routing references)

## 2026-05-17 — nutrition/tomato/plant-needs

**Change type:** edited
**REQs affected:** Pending block (tissue-test back-test invariant; no numbered REQ)
**Summary:** Pending block reframed condition-based — drops the "~2026-05-12" calendar anchor so the invariant fires when tissue results land regardless of date. Derivation work alongside (cert-floor source table per (stage, element), T4 cert-1 load-bearing defense, refinement triggers rewritten with observable / action / target file:identifier, new micros-gap refinement-priority section) — derivation-only by persona convention.
**Suggested waves:** none — wording-only spec edit; no numbered REQ to verify, no verifier matcher to add. Surfaced for awareness only.

## 2026-05-17 — nutrition/tomato/foliar-recipe

**Change type:** edited
**REQs affected:** REQ-101, REQ-115
**Summary:** REQ-101 cert paragraph reframed condition-based — calendar-anchored "trigger via 2026-05-12 petiole panel" replaced with "cert bump to 4 when tissue Mn / Zn / Cu correlates predicted within ±20 %". REQ-115 algorithm step 1 → step 2 transition got an explicit cross-reference to derivation's worked-example table (Cu fire-range table) so cold readers follow spec → derivation → numeric example without dead-reckoning.
**Suggested waves:** pruner (REQ-101 / REQ-115 matchers in `scripts/check-recipes.mjs` still match post-edit headers — verifier scrub is no-op; pruner sweep for stragglers citing "2026-05-12 petiole panel" elsewhere if any).

## 2026-05-17 — nutrition/compost-contribution

**Change type:** edited (spec.md Pending block + verifier added)
**REQs affected:** INV-1 (now enforced by new verifier), Pending decline-curve block reframed condition-based; no REQ-NNN identity mutations (REQ-079 / REQ-080 / inherited-specs unchanged)
**Summary:** Spec's Pending decline-curve block reframed from calendar-bound (`~2027-04`) to condition-based triggers; INV-1 four-map closure now enforced in `scripts/check-recipes.mjs` after REQ-080. Derivation + learnings gained Mg conservative-down ratio (0.76), cross-bed-uniformity observable (Mehlich-3 Ca-saturation > 20 % drift), and Sonotube informational-stance note.
**Suggested waves:** pruner (sweep any straggler references to the 2027-04 calendar bound in adjacent subprojects; very low likelihood since the calendar date only appeared in compost-contribution files); test-writer / coder not needed (verifier already updated in lane, no new REQ).

_(Inbox empty pre-this-entry. 2026-05-17 entries archived after sub-wave I: REQ-062 retirement follow-up (I.A), soil-contribution REQ-141/142/145 routing (I.B), foliar-recipe REQ-115 cap pin (I.C), fertigation-recipe inherited-specs note (no action needed — verifier expectations unchanged), nutrition/spec.md PO-action note (superseded by REQ-062 retirement follow-up). Plus team-leader-initiated I.D test-helper refactor + I.E SME convention dedup, both shipped. Prior 2026-05-16 entries — STORED-vs-anchor + soil-contribution REQ-162 follow-up (H), foliar-recipe (G), lettuce/plant-needs + soil-contribution (F), Mo-move (E) — also archived.)_
