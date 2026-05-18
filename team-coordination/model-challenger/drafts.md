# Challenger drafts — pending Guillaume review

Live working set per [[P-16]]: PENDING findings + resolutions ≤7 days old. Older history lives in git log; routed actions live in `from-model-challenger.md`; transferable lessons live in `principles.md`. Trim policy: on autonomous P-08 close → write principle if pattern generalizes, then prune body; on APPROVED-routed → prune body once routing entry lands; on no-op-pass / byte-identical re-fire → exit silent, do not append.

**Last trim:** 2026-05-17 (1986 → ~current lines; cleared 2026-05-11 through 2026-05-16 history per P-16 inversion of the prior "never delete" rule).

---

## 2026-05-17 — review of `yield-range/derivation.md` (d44 integrator-output prose — f_light × RGR identifiability)

Scope: complements the "RGR-refit landing pass" entry below — same diff, distinct angle. The landing pass covered code-side data.js lag + ship-as-is on the spec/derivation/learnings layer. This entry surfaces one blindspot the landing-pass review didn't raise: the new d44 integrator-output prose makes the unchanged `f_light` saturation table load-bearing for the operator-visible timing prediction, and the symmetric refinement trigger (per [[P-03]]) refits only `RGR_MAX` — a two-parameter problem with a one-parameter refit signal.

### Blindspots

**B1 — Symmetric refinement trigger refits `RGR_MAX` on the first best-case cohort signal, but the d44 prediction is jointly driven by `RGR_MAX × f_light(28)`; single-parameter refit on a two-parameter identifiability problem will over-correct.** · `PENDING (Mode B Guillaume call)`
- What the spec assumes: bench DLI ≥ 22 mol/m²/d drives `f_light = 0.70` (30 % photoinhibition floor, cert 3 "lettuce literature"). At the 50-cell anchor (bench DLI = 28), `f_light` clamps to 0.70 for d ≤ 14 — the entire exponential-growth phase, where small RGR penalties compound the most. Effective early-stage RGR = 0.30 × 0.70 = 0.21 d⁻¹, suspiciously close to the heat-stressed back-fit (~0.22) archived in `learnings.md` § "DLI initially LED-only (rejected)". Best-case model is barely distinguishable from stressed back-fit in early growth.
- What might be ignored: 30 % photoinhibition at sustained DLI ≥ 22 sits at the aggressive end of cert-3 lettuce literature — published Salanova / butterhead light-response curves typically saturate (flat, no inhibition) at DLI 17-22 unless temp is also elevated. If actual `f_light(28)` is 0.85-0.95 (mild saturation), `daysToTransplantPotential` drops from d44 to ~d36-d40 at 50-cell. When the first Décembre best-case cohort lands faster than d44, the current trigger refits `RGR_MAX` upward (e.g. 0.30 → 0.34) — but if the true driver was over-aggressive `f_light`, refitting RGR over-corrects and breaks 32 / 24 / 18-cell predictions (different per-plant DLI regimes, different `f_light` operating points along the trajectory).
- How to test it: (a) expand the symmetric trigger to name `f_light` saturation magnitude as a co-candidate — first best-case cohort signal refits `f_light(≥22)` magnitude first (larger leverage at the high-DLI early phase), then refits `RGR_MAX` on residual; (b) cross-regime disambiguation — first cohort at 32-cell + low LED (bench DLI ~17, optimum-plateau regime where `f_light` ≈ 1.0) isolates RGR; timing miss only at high-DLI regimes isolates `f_light`; (c) literature-anchor `f_light(≥22)` against a Salanova / butterhead light-response curve at controlled temp before the first cohort lands (if a primary source hits `nutrition/doc/`, refit the breakpoint and re-derive d44).
- Cost if real: medium — 4-9 day timing miscall at 50-cell translates to 5-15 % annual-throughput swing if nursery is the operational bottleneck (per REQ-175 `min(nursery, field)`); cross-regime refit-failure mode compounds the miscall across tray sizes once the first cohort lands and triggers a one-parameter RGR jump.

### Verdict

Recommend path (a) — expand the existing symmetric refinement trigger to name `f_light` as a co-candidate alongside `RGR_MAX`. [[P-15]]-aligned minimum-touch move (no literature scan required today, no constant edit); just ensures the refit logic the trigger declares will land on the right parameter when the first cohort signal arrives. Specialist's lane via `from-model-challenger.md` if approved.

---

## 2026-05-17 — review of `yield-range/derivation.md` (RGR-refit landing pass)

Scope: REQ-115 `RGR_MAXIMUM_LETTUCE_NURSERY` refit landed (0.40 → 0.30 d⁻¹ per Guillaume-approved D1 option 2, cross-cultivar Salanova-class butterhead CE seedling-RGR literature band, cert-3 framework per [[P-10]]). Missing-doc gap named explicitly. Symmetric upward/downward refinement triggers per [[P-03]]. Integrator-output trace at the d44 anchor point (50-cell / DLI 28 / 16 LED-h). "Why not 0.40" historical block archived to `learnings.md`. Consolidated refinement-triggers table touched (REQ-112 / REQ-172 ref added; Rijk Zwaan trigger row points at `FOLIAGE_HEIGHT_M` / `FOLIAGE_DENSITY_KG_PER_M3` independent anchors). Extension-pending block trimmed (nursery cap basis bullet retired now that it landed in the live REQ trace).

### Blindspots

**B1 — Spec ⟂ code: `yield-range/data.js:16` still carries `RGR_MAXIMUM_LETTUCE_NURSERY = 0.40`.** · `PENDING (auto-route candidate per [[P-12]] — extends the 2026-05-17 follow-up B1 scope from data.js:59 caps to data.js:16 RGR; same routing target, same shape; bundle into one specialist action)`
- Impact: 3/5. `calc.js` consumes the constant for the daily logistic step. With 0.40 the integrator asymptotes at d28-35 at the 50-cell anchor; with the landed 0.30 the asymptote slips to d44 (per the specialist's own integrator-output trace). Operator-facing `daysToTransplantPotential` is currently computed against the stale 0.40 (faster, optimistic) while spec/derivation/learnings now declare 0.30. Catherine-audit-readability drift; downstream throughput planning would land different annual-kg numbers depending on which surface the operator reads. Verifier matchers for REQ-115 don't read numeric values today so no regression expected — the fix is a constant-edit + comment-block update at `data.js:9-16` to match the literature-anchored narrative (drop the back-calculated anchor blurb).

### Complexity

No surface. The 0.30-anchor section (literature cite, missing-doc gap per [[P-10]], integrator-output trace, "why not 0.40" block, symmetric refit triggers) is appropriately rich for a load-bearing cert-3 claim driving a 9-16 day shift in operator-visible timing — fold-in would erode the cert defense.

### Cert defense

No surface. The cert-3 framework per [[P-10]] (one mechanistic step from breeder-anchored cap → literature seedling-RGR band) was approved-as-precedent on the prior pass. The literature-band reframe from Guillaume-routed "mid-band 0.30-0.35" to specialist-landed "upper-of-0.25-0.30" is narrative-only; value identical, no yield consequence. Audit-trail <3/5, silent autonomous per [[P-08]] + [[P-12]].

### Verdict

Ship-as-is on `derivation.md` / `learnings.md` / spec layer. Auto-route `data.js:16` (bundled with the prior PENDING B1 on `data.js:59`) to specialist as one code-side landing action — single edit pass on `yield-range/data.js`.

---

## 2026-05-17 — review of `yield-range/derivation.md` (specialist B1-fix follow-up; spec/code divergence + 32-cell cert framing)

Specialist landed the 2026-05-17 B1-approved basis switch in spec.md + derivation.md + learnings.md (geometric scaling `{50:25, 32:39, 24:52, 18:69}`, per-tray cert split, 18-cell upper-band trigger). Two new ≥3/5 findings from the follow-up review (two concurrent Mode A instances converged on the same pair; see audit note in git log).

**B1 — Spec ⟂ code: `yield-range/data.js:59` still carries the rejected power-law `{50:25, 32:50, 24:80, 18:120}`.** · `PENDING (auto-route candidate per [[P-12]] — un-landed code-side of already-approved B1 routing action item #2; specialist's lane)`
- Impact: 3/5. `predictNurseryYield({plateauSize: 32})` and `calc.js:58` compute against the rejected power-law constant. Operator-facing 32-cell narrative still rides on +100 % uplift; spec/derivation say +56 %. Catherine's audit reads consistent prose; runtime computes a different number. Mechanical fix; verifier matchers for REQ-112/REQ-172 don't read numeric values today so no regression expected.

**D1 — 32-cell cert 3 ("geometric physics-floor, defensible one density step from breeder anchor") rests on the same single-anchor dependence as 24/18-cell cert 2.** · `APPROVED → from-model-challenger.md (Guillaume 2026-05-17 — option 1 + 2 combined: drop cert to 2 now, queue FOLIAGE_HEIGHT_M independent-anchor refit as the path back to cert 3)`
- Impact: 3/5. `cap(plateauSize) = 25 × (50 / plateauSize)` exactly reproduces all four geometric values — only the product `h × ρ ≈ 8.2 kg/m²` is breeder-pinned (single anchor); `FOLIAGE_HEIGHT_M = 0.10` is unsourced. The "one density step" heuristic is qualitative. Per [[P-15]] two paths: (i) cert downgrade 32-cell → 2 (audit-trail-honest minimum-touch; matches 24/18 evidence base), or (ii) refit `FOLIAGE_HEIGHT_M` against an independent canopy-height anchor (Décembre cohort photo measurement at 50-cell d28 is the cheapest) — breaks single-anchor dependence, lets cert 3 stand on two-input evidence base. (ii) is the [[P-15]]-preferred move (physics-honest refit over relabel).

---

## 2026-05-17 — review of `yield-range/derivation.md` (whole-file introduction)

REQs 112-118 + 131. B1 (cap-basis conflict power-law vs Extension-pending geometric) + D1 (`RGR_MAXIMUM_LETTUCE_NURSERY = 0.40` back-calculated, no best-case data point) both walked with Guillaume, **APPROVED → routed** to `from-model-challenger.md`. B1 routes geometric basis amend-in-place + 18-cell underprediction trigger (P-14 captured: physics-first ranking on basis conflicts). D1 routes option 2 — refit number to Salanova literature mid-band 0.30-0.35 keeping cert 3 (P-15 captured: refit > relabel when cert ≥3 is back-calculated). Follow-up review caught data.js un-landed (entry above).

---

## 2026-05-17 — review of `nutrition/tomato/fertigation-recipe/derivation.md` (six-hunk diff vs HEAD)

Hunks: STORED-vs-FP P-13 reframe (closes prior B2 wording), active-channels-sum vs REQ-013/014 envelope, Solubore identity correction (`H₃BO₃ → disodium octaborate Na₂B₈O₁₃·4H₂O 20.5%`, completes prior APPROVED B4), REQ-155 B mechanism reword, REQ-157 Mo carve-out + algorithmic detail, B cert table re-rationalize. Three findings auto-rejected per [[P-08]] + [[P-11]] + [[P-12]]: B1 (REQ-014 cap reframed plant-side in derivation while PO spec writes bed-side — language drift, no operational consequence today), B2 (T1-T2 Mg 2.43× declared "acceptable" in prose without matching ACCEPTED_EXCESSES.Mg.T1/T2 annotation — asymmetric to T1.N/T2.N), D1 (cert "min over stack = 3" arithmetic — min(4, 2-3, 2) = 2 — reframe or downgrade). All <3/5; specialist lane via next derivation pass. Sibling spec.md REQ-099 + REQ-151 Mo-routing staleness bundled with prior B10 for amend-in-place sweep.

---

## 2026-05-17 — review of `nutrition/tomato/sidedress-recipe/derivation.md` (working-tree diff vs HEAD)

Substantive add: REQ-089 gate-release threshold (Mehlich-3 Ca < 7 500 kg/ha + base-saturation Ca % < 70 % "whichever resolves first"). Three findings auto-rejected at 1/5 (7 500 midpoint-not-mechanistic; CEC-coupling on dual criterion; cold-shoulder pointer/Caveats duplication) — specialist scaffolding for future re-derivation; Actisol stays gated OUT by `ca_pct === 0` regardless. No cert ≥3 claims moved. No Guillaume call.
