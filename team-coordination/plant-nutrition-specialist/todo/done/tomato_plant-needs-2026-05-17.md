# Todo — nutrition/tomato/plant-needs

## Commander's intent

PURPOSE

Tomato plant-needs is the cleanest subproject in the tree post the 2026-05-17 A+G batch — every downstream consumer (fertigation sizer, sidedress, foliar delivered-vs-demand table, soil-contribution depletion clamp) reads `BIOMASS_DEMAND` + `TOMATO_FRUIT_EXPORT` + `PLANT_PEAK_WEEKLY_DEMAND_MG_PER_M2` as canonical demand source. This round: tighten the cert defenses that still read as "Mediterranean / hydroponic inheritance, transferability cert capped at 2", flag the spec-vs-derivation gap on `transpFactor` semantics (REQ-081 names Ca + Mg but the spec contract doesn't define the input range or default behavior beyond a table cell), and re-walk the Pending tissue-test back-test invariant now that tissue panel was sampled 2026-05-11 (cert-bump path needs concrete numbers, not "land when tissue lands").

KEY TASKS

1. Spec-vs-derivation hygiene walk: read `spec.md` + `derivation.md` + `learnings.md` end-to-end. Look for prose that exists in two places (spec contract Input table vs. derivation Formula block both describe `transpFactor` — confirm they agree on units / range / default and the spec doesn't carry derivation-tier explanation). Cut duplicate; spec stays statement-only, derivation stays the why-this-number.
2. T4 cert defense: T4 macros sit at cert 1 because they're `T5 × 0.85` extrapolation of cert-2 values. Decide whether T4 is load-bearing for any current operator-facing display (Bilan modal, gap-grid) — if no, fine; if yes, document explicitly in derivation.md whether the cert-1 readout is acceptable for the consumer's decisions or whether it triggers a refinement-priority entry.
3. Tissue-test back-test invariant: the Pending block in spec.md says "When tissue test data lands (~2026-05-12)" — tissue was sampled 2026-05-11 per the foliar-recipe REQ-101 derivation block. If results have not landed yet, restate the trigger as condition-based ("when tissue results land, regardless of date") rather than calendar-based. If results have landed (check with Guillaume's working files or the foliar-recipe refinement-trigger updates), execute the back-test and either bump cert 2 → 3 per element where ±25 % macros / ±50 % micros holds, or refit `TOMATO_REMOVAL` / `BIOMASS_DEMAND` per the divergence. Per P-08, do not poll for tissue results — surface what's deferred if results are not visible.
4. INV-1 coverage check: `keys(BIOMASS_DEMAND[stage]) ⊆ keys(TOMATO_FRUIT_EXPORT)` is asserted; cross-check actual data.js to confirm Mo / Cu / B / Zn / Mn / Fe / N / P / K / Ca / Mg all 11 elements present in every stage. Surface any missing element + propose default-value path (likely cert-1 placeholder, not blank).
5. Refinement-trigger walk: derivation.md "Refinement triggers" lists tissue test, yield ceiling shift, stage-stratified data, per-element micro splits. Each trigger should name a concrete observable (number / event) + the action it triggers. Today most are condition-only — name what changes in `data.js` per trigger.
6. Cert-2 micros gap: derivation.md Term 1 table notes Fe/Mn/Zn/B/Cu/Mo at cert 1 with "(data gap)" annotation. This is a long-standing TBD — propose a refinement-priority entry that names the next data source (Yara tomato micros table? Sonneveld micros? PA Taillon's bench data per P-08 surfaced via Guillaume's timing) and the value range each would deliver. Pick the most defensible default per P-07 (low yield-impact, ship a defensible call) without surfacing a fork to Guillaume.

END STATE

- spec.md statement-only (no duplicate derivation prose); REQ-081 + REQ-082 + REQ-083 + INV-1 + Pending block all sit at one paragraph each (current state already minimal — verify).
- derivation.md cert table per (stage, element) explicitly names the source-of-cert-floor for every cert-1 cell (TOMATO_REMOVAL micros data gap, T4 extrapolation, transp coupling cert).
- derivation.md refinement-trigger entries name observable + action + target file:section ("when tissue Mn measured ≤ 50 ppm DW → reduce TOMATO_REMOVAL.Mn from X to Y in `data.js`").
- Pending tissue-test block reframed condition-based (no calendar date).
- INV-1 element-closure verified across all 5 stages.
- No new REQs unless gap-hunting surfaces a normative claim that's currently relied on but not asserted (unlikely — this subproject is mature).

RULES OF ENGAGEMENT

- Lane: own spec.md / derivation.md / learnings.md / this todo file
- Forbidden (P-06): app/index.html, */app/logic.js, */app/page.html, dist/, calc.js, model.js, data.js, requirements.md
- Verifier scripts: may edit if REQ changes
- REQ claims: scripts/claim-req.sh <spec-path> plant-nutrition-specialist (flock race-safe)
- Changelog: one line per material change, no trimming
- Deviation from intent: only with explicit justification in report

## Items

- [x] Spec-vs-derivation duplicate-prose scrub (transpFactor framing, INV-1 framing). → No duplication found. `spec.md` Contract table defines `transpFactor` range 0.4-1.0 default 1.0 (one-line column); REQ-081 names which elements couple (Ca + Mg only) without restating the formula. INV-1 is a one-line set-containment claim. Formula and per-element coupling rationale live in `derivation.md` "Formula" + "Caveats — transpiration coupling" only. Verified clean — no edits needed.
- [x] T4 cert-1 defense — document load-bearing consumers or carve out. → Confirmed load-bearing: `PN.certFor` is consumed by Bilan modal at `nutrition/tomato/app/logic.js:162-172` (Pourquoi row cert badge). Documented in `derivation.md` § "T4 cert-1 — load-bearing for the Bilan modal" why cert 1 is acceptable today (T4 biomass term ~30-40% of total demand at target yield; ±15% extrapolation error → ≤6% on total). Refinement path named in trigger § "Stage-stratified T4 data".
- [x] Pending tissue-test invariant reframe (condition-based, not calendar). → `spec.md` "Pending — tissue-test back-test invariant" rewritten: "When tissue test results land (regardless of sample / report date)" replaces "(~2026-05-12)".
- [x] INV-1 element-closure verification across all 5 stages (cross-check data.js). → Verified all 11 elements (N/P/K/Ca/Mg/Fe/Mn/Zn/B/Cu/Mo) present in every stage of `BIOMASS_DEMAND` AND `TOMATO_DEMAND_CERT`. Zero missing, zero extras. INV-1 holds by construction across T1-T5.
- [x] Refinement-trigger entries name observable + action + target file:section. → `derivation.md` § "Refinement triggers" rewritten with 5 entries, each with explicit observable / action / target (file + identifier). Tissue back-test split into macros (±25% → cert 2→3, REQ-033 floor binds on refit) and micros (±50% → cert 1→2; refit `TOMATO_REMOVAL` + replace 60% default in `TOMATO_FRUIT_EXPORT`). Yield ceiling, T4 stage-stratified, Sonneveld micros split each cite the data.js identifier they would touch.
- [x] Cert-1 micros gap — propose refinement-priority entry per P-07 (defensible default, no Guillaume fork). → New `derivation.md` § "Refinement priority — micros gap" added. Yield-impact assessed low (foliar-routed micros capped by burn ceiling REQ-115, not by demand readout). Three defensible sources ranked (Sonneveld 2009 → cert 2, Yara micros table → cert 2-3, Décembre stage-stratified panel → cert 3-4). Default plan: hold cert 1, name Sonneveld micros refit as fallback if tissue panel doesn't disambiguate fruit-vs-canopy. No fork to Guillaume per P-07 (low impact + defensible default).
