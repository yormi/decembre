## 2026-07-12 — review of nutrition/tomato/domain/foliar/model/derivation.md (HEAD working-tree diff)

No-op pass — diff repoints the Implementation-map table + include-order line to the `domain/foliar/model/` layout (`calc.js`→`recipe.js`, `model.js`→`contribution.js`, adds `computeFoliarRecipeForGap`/`computeFoliarStrategy` to the owner cell). No constant, dose, cert, stage, formula, or derivation logic moved. Body carries no stale old-layout path (grep clean) — fully migrated, no doc-hygiene flag, unlike the fertigation sibling below.


## 2026-07-12 — review of nutrition/tomato/domain/sidedress/derivation.md (HEAD working-tree diff)

No-op on model content — diff repoints the Implementation-map table to the `domain/sidedress/` layout (`calc.js`→`recipe.js`, `model.js` folded into `recipe.js`, adds `contribution.js` owning `computeSidedressContribution`, `learnings.md`→`learnings/`). No constant, dose, cert, stage, formula, or derivation logic moved.

One doc-hygiene flag (flag-don't-fix):
- **Half-migrated file references.** The map now names `recipe.js`/`contribution.js`, but the load-order paragraph immediately below still reads "Internal order: `data.js` → `calc.js` → `model.js`". Map says `recipe.js`, prose says `calc.js`/`model.js` — same files, two names in one doc. Finish the rename in that paragraph. · `PENDING`

## 2026-07-12 — review of nutrition/tomato/domain/fertigation/derivation.md (HEAD working-tree diff)

No-op on model content — diff repoints the Implementation-map table + include-order line to the `domain/fertigation/` layout (`calc.js`→`recipe.js`, `model.js` folded in, adds `contribution.js`, `learnings.md`→`learnings/`). No constant, dose, cert, stage, formula, or derivation logic moved.

One doc-hygiene flag (flag-don't-fix):
- **Half-migrated file references.** The map now names `recipe.js` as owner of `computeStageRecipe`, but the body still cites the old `calc.js` in three spots: "Implemented in `calc.js`" (§ Mass-balance derivation), "pin in `calc.js`" and the parallel "same pin-by-construction discipline" (§ Mo algorithmic detail). Map says `recipe.js`, prose says `calc.js` — same file, two names in one doc. Finish the rename in the body. · `PENDING`

## 2026-05-30 — review of yield-range/derivation.md (HEAD working-tree diff)

No-op pass on model content — diff is slug heading/reference migration only (→`canopy-cap-is-ceiling`/`nursery-canopy-cap-by-plateau`, →`best-non-light-conditions`, →`dli-annual-sun-plus-led`/`double-poly-transmission-decomposed`, →`logistic-growth-no-decay`). No constant, dose, cert, stage, or derivation logic moved. Sibling `spec.md` is already fully slug-migrated — every cited slug resolves to a real heading, so no dangling refs (unlike the nursery entry below).

One doc-hygiene flag (flag-don't-fix):
- **Half-migrated consolidated trigger table.** Migration left three rows bare: `GH_LIGHT_TRANSMISSION_DOUBLE_POLY`, `NURSERY_SPACING_PACKED shape`, `FOLIAGE_HEIGHT_M / FOLIAGE_DENSITY_KG_PER_M3`. The double-poly transmission row is inconsistent *within the same table* — slugged (`double-poly-transmission-decomposed`) in the pyranometer row, bare in the film-replacement row. Finish the table or it reads half-converted. · `PENDING`

## 2026-05-30 — foliar-strategy/model/derivation.md (HEAD working-tree diff)

Diff is a slug reference migration (→ under-fert/luxury-feeding-guard; → replenishment-cascade-earliest-first). No claim, value, cert, or mechanism moved — near no-op pass.

One defect introduced by the migration:
- **Duplicate requirement reference in CE-cap section.** The slug was appended without retiring the inline "cascade order": "no alternative channel under cascade order at current pH 7.4 lockout under `nutrition — replenishment-cascade-earliest-first`." Same requirement named twice in one clause (double "under"). Slug the first mention too, or drop the trailing slug. · `PENDING`

## 2026-05-30 — review of nutrition/nursery/fertigation/derivation.md (HEAD working-tree diff)

No-op pass on model content — diff is slug reference migration only (→`predicted-ce-under-nursery-cap`, →`predicted-tank-ph-in-nursery-envelope`, →`default-recipe-p-supply-half-demand`). No number, dose, cert, or derivation logic moved.

Two doc-hygiene flags (not model critiques, flag-don't-fix):
- **Stray `(placeholder)` line** inserted under §6 refinement trigger 5 — accidental leftover, no content. · `PENDING`
- **Dangling slug refs.** Derivation now cites slugs (`predicted-ce-under-nursery-cap`, `predicted-tank-ph-in-nursery-envelope`, `default-recipe-p-supply-half-demand`) but sibling `spec.md` headings are still the old numbered form — spec side wasn't migrated, so these point at headings that don't exist yet. Also §6 trigger 5 still reads un-migrated. · `PENDING`

## 2026-05-30 — review of nutrition/tomato/domain/soil-ph/derivation.md (HEAD working-tree diff)

Scope: new subsection "What the cap governs — total acid, NOT oxidation rate (cert 4)" under the per-pass safety cap. No spec entries (sibling `spec.md` still has zero slugs — blocked on PO band + calcimeter). Adds reasoning claims, no new numbers/doses.

### Blindspots
**B1 — Microthiol named as a comparison product; cert status not flagged inline** · `PENDING`
- **What the spec assumes:** "Microthiol 9 µm" works as a neutral illustration of a fine/fast product; the cap claim is product-agnostic.
- **What might be ignored:** the on-hand product is Tiger 90CR (cert-0, OMRI/Ecocert unverified per § product). Introducing a *second* named off-shelf product into the derivation without its cert status risks an unflagged non-approved mention. The new `learnings/microthiol-kumulus-soil-use-agronomic-risks` suggests it's under active consideration, not hypothetical → cert status becomes load-bearing.
- **How to test it:** confirm Microthiol DF / Kumulus CAN/CGSB-32.311 (OMRI) listing; if the learnings file already resolved it, cite the cert there and drop the bare name here.
- **Cost if real:** low (doc hygiene, not a dose error).

### Complexity
**C1 — fast-product peak-flattening branch governs a product not on hand** · `PENDING`
- **Specialist added:** "for a fast product, hold the mass ceiling but flatten the peak — split increments, retest pH at 2 wk (not 4), never dose waterlogged."
- **Test:** changes a team action now? No — stock is Tiger 90CR (bentonite pastille, slow dispersion); § product explicitly keeps the 4-wk retest. The 2-wk-retest guidance only bites if they switch to micronized.
- **MVP version:** keep the load-bearing core (cap = f(mass), particle-size-independent — this *does* settle "can a faster product blow the cap?": no). Mark the peak-flattening paragraph as conditional on a micronized switch, so an operator doesn't read "2-wk retest" as current practice.
- **Why it might stay:** the Microthiol/Kumulus learnings file implies a switch is being weighed → forward-looking guidance may be deliberate, not speculative.

### Cert defense
No challenge. cert 4 on "total acid = f(mass), not f(rate)" is if anything conservative — S(32)→H₂SO₄(98) is ~3.06×, textbook stoichiometry (cert 5). The cap's per-pass *numbers* still inherit the cert-3 extension-rate basis; the new subsection doesn't claim otherwise. Fine as written.

### Verdict
Ship after addressing C1 framing (flag the fast-product branch as conditional) + B1 (Microthiol cert status). Both low-cost doc fixes; no rework, no number moved.

## 2026-05-30 — review of nutrition/tomato/domain/soil-ph/derivation.md (HEAD working-tree diff, peak-hazard expansion)

Scope: per-pass-cap subsection "What the cap governs". Prior 2-line "rate hazard, flatten the peak" paragraph expanded into (a) a 30× instantaneous-acid-flux figure (9 µm wettable vs micronized) and (b) a two-regime split — buffered (carbonate present) vs unbuffered (carbonate exhausted) acid-microzone hazard. No spec entries (sibling still zero-slug). No dose number moved. Builds directly on the prior entry's B1/C1 (lines 23-45) — read those first; not re-raising the Microthiol-cert / product-not-on-hand points.

### Blindspots
**B1 — 30× flux figure doesn't follow from the half-lives quoted in the same sentence** · `PENDING`
- **What the spec assumes:** "9 µm wettable (half-life ~1.5–3 d) vs micronized (~6–10 d) ≈ 30× the instantaneous acid flux."
- **What might be ignored:** flux scales roughly inverse to half-life → the quoted half-lives give ~2–7× (10/1.5 ≈ 6.7 worst case), not 30×. The 30× appears to fold in surface-area/particle-count (9 µm vs ~75 µm ≈ 200-mesh → ~8× linear, ~64× area), but that basis isn't stated, so the number reads as derived from the half-lives it sits beside — and it isn't. Either state the surface-area basis or drop the order-of-magnitude claim to the ~few-× the half-lives support.
- **How to test it:** write the flux ratio explicitly (half-life term × particle-count/area term); see if 30× survives.
- **Cost if real:** low — it's a hazard-illustration multiplier on a product not on hand (Tiger 90CR disperses to ~micronized 6–10 d, not 1.5–3 d). No dose depends on it. But a number that doesn't follow from its own stated basis is a cert-3 claim masquerading as arithmetic.

### Complexity
**C1 — unbuffered-regime microzone branch governs a state that is months-to-cycles away AND a product not stocked** · `PENDING`
- **Specialist added:** full "carbonate exhausted → CEC-only → 30× burst outruns buffering → acid microzone → root-tip burn / H₂S" paragraph + "as carbonate thins, drop the per-pass increment, retest at 2 wk" protocol.
- **Test:** changes a team action now? No, twice over: (1) the starting regime is buffered (pH 7.28, carbonate present) and the text itself says "fast product is safe at the mass cap here"; (2) the unbuffered hazard only exists for a fast 9 µm product the farm doesn't own. The on-hand Tiger 90CR + the carbonate sink put this state past the current crop.
- **MVP version:** keep the one load-bearing sentence — buffered regime swallows the spike, so cadence/peak worry is deferred until pH actually starts moving. Fold the rest into the `microthiol-kumulus...` learnings file (where the fast-product + future-state analysis belongs) rather than the live derivation.
- **Why it might stay:** the regime *switch trigger* (pH starts to drop = carbonate thinning) is a genuinely useful operator cue, and it's already tied to the pH retest. If kept, lead with that cue, not the H₂S microzone mechanism.

### Cert defense
No new cert challenge beyond B1. The regime-dependent claim (cert 3) is mechanistically sound; the issue is altitude (belongs in learnings), not correctness.

### Verdict
Ship after addressing B1 (fix or drop the 30×) + C1 (move the unbuffered-state mechanism to learnings, keep the pH-cue trigger). No rework, no dose moved; both are altitude/arithmetic hygiene on a not-yet-built, not-current-crop lever.

## 2026-05-30 — review of nutrition/tomato/domain/fertigation/derivation.md (HEAD working-tree diff)

No-op pass — diff is slug reference migration only (→`mass-balance-derivation`, →`uptake-efficiency-factor`, →`fp-target-mirrors-sizer`, →`ca-aware-product-gate`, →`only-ca-p-participate-in-gap-chain`). No claim, number, or derivation logic moved. Nothing to critique.
## 2026-05-30 — review of nutrition/tomato/domain/foliar/model/derivation.md (HEAD working-tree diff)

No-op pass — diff is slug/namespace reference migration only (→`nutrition/chemistry — foliar-ce-under-burn-cap`, →`coverage-discount-on-delivery`, →`weekly-leaf-tolerance-cap`, →`gap-maximizing-recipe`). No dose, cert, or derivation logic moved. Nothing to critique.

## 2026-05-30 — review of nutrition/tomato/domain/foliar/model/derivation.md (working-tree diff)

No-op pass. Diff is a pure slug citation migration (→ `foliar-ce-under-burn-cap`, → `coverage-discount-on-delivery`, → `weekly-leaf-tolerance-cap`, → `gap-maximizing-recipe`). No claim, constant, cert, or number moved. Nothing to critique.

## 2026-05-30 — review of nutrition/tomato/domain/foliar/model/derivation.md (HEAD working-tree diff)

No-op pass — diff is slug reference migration only (→`nutrition/chemistry — foliar-ce-under-burn-cap`, →`coverage-discount-on-delivery`, →`weekly-leaf-tolerance-cap`, →`gap-maximizing-recipe`). No constant, cap, cert, or claim moved. Nothing to critique.

## 2026-05-30 — review of nutrition/tomato/domain/foliar/model/derivation.md (HEAD working-tree diff)

No-op pass — same slug citation migration as the four entries above (→`foliar-ce-under-burn-cap`, →`coverage-discount-on-delivery`, →`weekly-leaf-tolerance-cap`, →`gap-maximizing-recipe`, →`surfactant-aware-efficiency-map`, →`foliar-uptake-ph-curve`, →`in-tank-ksp-precipitation-guard`). No dose, cap, cert, or derivation logic moved. Nothing to critique.

## 2026-05-30 — review of nutrition/nursery/fertigation/derivation.md (HEAD working-tree diff)

No-op pass — slug citation migration only (→`default-recipe-p-supply-half-demand`, →`predicted-ce-under-nursery-cap`, →`predicted-tank-ph-in-nursery-envelope`). No constant, cap, cert, or claim moved. Nothing to critique.

## 2026-05-30 — review of nutrition/tomato/domain/fertigation/derivation.md HEAD

No-op pass. Diff is citation-format migration only (→ slug names `under-fert-guard` / `luxury-feeding-guard` / `replenishment-cascade-earliest-first`). No constant, factor, stage, or claim moved. Nothing to critique.

## 2026-05-30 — review of nutrition/tomato/domain/fertigation/derivation.md (HEAD working-tree diff)

No-op pass — continuation of the same slug citation migration, now covering the channel-efficiency-map + Mo sections (→`nutrition — channel-efficiency-capability-map`, →`ph-aware-effective-efficiency`, →`no-decorative-products-at-current-ph`, →`replenishment-cascade-earliest-first`). No constant, ratio, cert, or derivation logic moved. Nothing to critique.

## 2026-05-30 — review of nutrition/tomato/domain/fertigation/derivation.md (HEAD working-tree diff)

No-op pass — same slug citation migration already logged above (active-channels-sum + Solubore + channel-efficiency-map + Mo + no-pH-gate + flat-return sections; →`under-fert-guard`/`luxury-feeding-guard`, →`replenishment-cascade-earliest-first`, →`channel-efficiency-capability-map`, →`ph-aware-effective-efficiency`, →`no-decorative-products-at-current-ph`, →`contribution-channel-details-payload`). No constant, factor, ratio, cert, or derivation logic moved. Nothing to critique. · `PENDING`

## 2026-05-30 — review of nutrition/tomato/domain/foliar/model/derivation.md (HEAD working-tree diff)

No-op pass — same slug citation migration (→`under-fert-guard`/`luxury-feeding-guard`, →`replenishment-cascade-earliest-first` ×2). No constant, factor, floor, cert, or band moved. Nothing to critique.

## 2026-05-30 — review of nutrition/tomato/domain/sidedress/derivation.md (HEAD working-tree diff)

No-op pass — same slug citation migration (→`channel-efficiency-capability-map`, →`luxury-feeding-guard`, →`release-values-within-mass-balance-band`). No constant, factor, eff, cert, or derivation logic moved. Nothing to critique.

## 2026-05-30 — review of nutrition/tomato/domain/plant-needs/derivation.md HEAD

No-op pass — trivial diff: lone reference-label migration (→ slug `nutrition/tomato — tomato-removal-biased-high`) in the macro back-test refinement trigger. No claim, number, or cert moved. · `PENDING`

## 2026-05-30 — foliar-strategy/model/derivation.md (HEAD working-tree diff, bare-reference removal)

No-op pass. Diff deletes a single bare reference in the channel-efficiency-map section ("Block 5 toggle that the page-side reads") — bare-reference elimination migration. No constant, dose, cert, stage, branch, or mechanism moved. Sibling clause already names the slug (`surfactant-aware-efficiency-map`), so the removal leaves no dangling reference. · `PENDING`

## 2026-05-31 — review of nutrition/tomato/domain/soil-ph/derivation.md (HEAD working-tree diff)

Scope: new subsection "Target band (the correction endpoint)" added above the feasibility gate. Cert-3 endpoint band (Mehlich-3 water pH 6.4–6.8, aim 6.5, hard floor 6.2) lifted from the new `learnings/define-soil-root-zone-ph-target-band.md` into the live derivation. No dose number moved; the band was already the implicit endpoint the dose tables drive toward. Sibling `spec.md` still zero-slug.

### Blindspots
**B1 — aim-point 6.5 deliberately sits at the Mn knee while tissue Mn is already over-supply** · `PENDING`
- **What the spec assumes:** aim 6.5 = peak P availability, "the knee just above where Mn²⁺ solubility steepens" — the band's lower half (6.4) is acceptable.
- **What might be ignored:** the T5 panel (wash-confirmed) already reads Mn over-supply *before* any acidification, and the foliar-Mn trim is still pending. Driving toward 6.5 (and tolerating 6.4) deliberately parks steady-state at the start of the ~100×/2-pH-unit Mn climb on this calcareous soil. The learnings rejected going *lower* (6.0–6.2) on exactly this Mn argument — but did not test whether the same argument should push the **aim up** (6.6–6.8), trading shallow sub-6.5 P gains for Mn headroom, given the AMF bridge is meant to deliver the residual P by direct uptake anyway.
- **How to test it:** a Mn soil-availability reading at the post-correction pH (the refinement trigger the learnings already names) → set an explicit tissue-Mn stop-dose trigger; if soil Mn at 6.5 is already in watch range, raise the aim into the upper half.
- **Cost if real:** medium — over-driving pH into the Mn knee on already-élevé tissue is a toxicity-side error, and the band is the dose-stop target the whole programme rides on. Mitigant: the derivation's own "undershoot is the real risk, pH rebounds toward 6.5–6.8" note means practice likely drifts up regardless — but the *stated aim* still anchors operator dose-stop behaviour.

### Complexity
**C1 — target band now stated in three places, one of them stale and contradicting** · `PENDING`
- **Specialist added:** the band as a full subsection in `derivation.md`, duplicating `learnings/define-soil-root-zone-ph-target-band.md` (canonical rationale) and overlapping the older specialist note in `nutrition/tomato/domain/spec.md` (lines 41–59).
- **Test:** changes a team action? The duplication itself doesn't — but the **parent spec.md note still frames the band as an unwritten PO gap** ("`soil-root-zone-ph-band` does not yet exist… Recommend the PO write the entry") and quotes **operational midpoint ~6.6**, which the new decision reverses (specialist-owned, aim **6.5**). A reader landing on the parent spec gets the superseded ownership + a different number.
- **MVP version:** keep the band in `learnings/` (rationale) + a one-line pointer from `derivation.md`; flag the parent `spec.md` note (lines 41–59) for the specialist to prune/reverse-in-place per the no-vestigial rule. Challenger doesn't edit spec — flag only.
- **Why it might stay:** a short endpoint table in the derivation is reasonable (the dose tables sit right below it and reference 6.5/6.2). The defect is the un-reversed parent note, not the derivation copy.

### Cert defense
No new challenge. cert 3 on the band is honestly stated (extension P/micro curves, not Décembre-tissue-calibrated) with symmetric refinement triggers already named in the learnings. The bounds are a judgment call inside the cert band, not an over-claimed number.

### Verdict
Ship the derivation subsection after addressing C1 (reverse/prune the stale parent `spec.md` note — specialist's edit, the 6.6/PO-gap framing now contradicts) + logging B1 (Mn-knee aim direction needs the soil-Mn reading before locking 6.5 vs an upper-half aim). No dose moved; B1 is the only finding that could shift the endpoint.

## 2026-05-31 — re-trigger, soil-ph/model/derivation.md (no-op)

Hook re-fired on the unchanged target-band diff. Already reviewed above (2026-05-31, lines 122–144: B1 Mn-knee aim · C1 stale parent note). No new claim moved → no-op pass. · `PENDING`

## 2026-05-31 — review of nutrition/tomato/domain/soil-ph/derivation.md (band-lowered diff)

Scope: **distinct from the prior entries** — the band was *lowered* this edit (6.4–6.8/aim 6.5/floor 6.2 → **6.0–6.5/aim 6.3/floor 5.8**), per a same-day Guillaume call ("we control the foliar Mn source"). Diff adds the new Target-band table, rewires the pH guardrail bullet (stop 6.3, floor 5.8), and edits the refinement-trigger line. The band *value* is Guillaume's decision — not challenged. Two correctness/coherence defects + one cert ask below.

### Blindspots
**B1 — the same diff states two different bands; refinement-trigger line left at the OLD numbers** · `PENDING`
- **What the spec assumes:** the edit lowered the band to 6.0–6.5 / aim 6.3 / floor 5.8 (new table + guardrail bullet both updated).
- **What might be ignored:** the refinement-trigger line edited in the *same diff* reads "Target band → **defined** (6.4–6.8, aim 6.5, floor 6.2; ...)" — the **superseded** numbers. One file now asserts two different hard floors (5.8 in two places, 6.2 in the trigger list) and two aims (6.3 vs 6.5). The dose-stop guardrail is the single most operationally load-bearing line in this model; an operator scanning the refinement list reads a stop-point 0.4–0.5 unit off the actual decision.
- **How to test it:** none needed — internal contradiction, visible in the diff. Trigger line should read 6.0–6.5 / 6.3 / 5.8.
- **Cost if real:** high — ambiguous dose-stop on the lever the whole programme rides on (undershoot past 6.0 into the uncontrollable Mn/Al zone, or premature stop). Flag-don't-fix; specialist's edit.

**B2 — floor dropped a near-full unit (6.2→5.8, aim 6.5→6.3) on an unquantified Mn offset; cert held at 3** · `PENDING`
- **What the spec assumes:** zeroing the foliar Mn programme buys enough tissue-Mn headroom to safely dose ~0.4 unit deeper, because total tissue Mn = soil uptake + foliar and the foliar half is controllable.
- **What might be ignored:** the offset is never sized. Acidification raises *soil* Mn²⁺ ~100×/2 pH units (the learning's own figure); dropping the floor 6.2→5.8 walks ~0.4 unit further into that climb. Removing the foliar contribution subtracts a *fixed* tissue increment; the soil-Mn rise is *exponential* in pH. Whether the fixed foliar credit covers the exponential soil gain at 5.8 vs 6.2 is asserted ("real headroom"), not computed. T5 tissue Mn was already over-supply *before* any acidification.
- **How to test it:** the Mn soil-availability reading at post-correction pH the learning already names as a cert-4 trigger — but it must land *before* dosing to the lowered floor, not after. Set the explicit tissue-Mn stop-dose number from it.
- **Cost if real:** high — Mn toxicity on already-élevé tissue; the floor is a hard stop, so a mis-set floor is the failure mode with no further guardrail beneath it.

### Complexity
No new complexity finding. The guardrail bullet now carries "zero foliar Mn through the drawdown; tissue Mn is the stop-dose gauge" — that *is* load-bearing (it's the precondition the lowered band is conditioned on), keep it.

### Cert defense
**D1 — lowered band carries the same cert 3 as the more conservative first draft (stated cert 3)** · `PENDING`
- **Specialist's defense:** extension P/micro availability curves for calcareous mineral soils; bounds are a judgment call inside the band.
- **What I'd need to accept cert ≥ 3 on the *lowered* floor:** the band got bolder (floor −0.4 unit, into the steepening Mn zone) on a conditional argument, while the cert label didn't move. Per `refit-not-relabel` — a value made more aggressive on an unquantified condition shouldn't inherit the prior, more-conservative value's cert. Want the soil-Mn-at-target reading (B2's test) to anchor the 5.8 floor before it reads cert 3.
- **My read:** the 5.8 floor specifically is cert 2 until the Mn reading lands; the 6.0–6.5 *aim/upper* region stays cert 3 (well inside published P-release window). Split the cert — the floor is the part now leaning on the unmeasured Mn offset.

### Coherence (cross-surface drift, flag-don't-fix)
The lowered band did not propagate. Four surfaces still carry 6.4–6.8 / aim 6.5 / floor 6.2:
- `learnings/define-soil-root-zone-ph-target-band.md` § "Practical note — undershoot" ("landing anywhere in 6.4–6.8 is a win… floor 6.2") and § "Why 6.0–6.5… not 6.0–6.4" header still says 6.0–6.4 in the heading — the *canonical* rationale file self-contradicts its own new table.
- sibling `soil-ph/model/spec.md` (lines 12, 23) — old band.
- parent `nutrition/tomato/domain/spec.md` (lines 43–48) — old band.
Per the no-vestigial rule these are the specialist's to reverse-in-place. The learning's own internal contradiction (new table vs stale Practical-note) is the most urgent — that file is cited as the source of truth from three places.

### Verdict
Land the band-lowering after: fixing B1 (trigger line → new numbers — pure defect, in this diff), gating B2/D1 on the soil-Mn-at-target reading before dosing to the 5.8 floor (Guillaume owns the band value, but the *floor's cert* and the dose-to-it should wait on the Mn number), and propagating the new band to the 4 stale surfaces. The band *value* is not challenged; its evidence basis at the floor and its self-consistency across files are.

## 2026-05-31 — re-trigger, soil-ph/model/derivation.md (no-op)

Hook re-fired on the band-lowering diff already reviewed above (lines 150–184: B1 trigger-line contradiction · B2 floor-drop on unquantified Mn · D1 cert split · Coherence 4 stale surfaces). Confirmed independently — same findings, no new claim moved. No-op pass. · `PENDING`

## 2026-05-31 — re-trigger, soil-ph/model/derivation.md (no-op)

Hook re-fired again on the same band-lowering diff (6.0–6.5 / aim 6.3 / floor 5.8). Ran the full three-angle pass independently; landed on the identical findings already captured at lines 150–184. No new claim moved → no-op pass, no duplicate entry. · `PENDING`

## 2026-06-02 — review of nutrition/tomato/domain/soil-ph/derivation.md (HEAD working-tree diff)

Scope: **two genuinely new claims beyond the band-lowering already reviewed at lines 150–184.** (1) Tiger 90CR cert flipped **0 → 4** ("Ecocert certified, allowed") in both the § product block and the refinement-trigger line. (2) Stage-2 dose bumped to **~12 kg S/bed** for the deeper 6.3 aim (vs ~10 kg for 6.5). The band-lowering's prior B1 (trigger line stuck on old numbers) is now **resolved** — trigger line reads 6.0–6.5 / 6.3 / 5.8. Band value itself remains Guillaume's call, unchallenged.

### Cert defense
**D1 — Tiger 90CR cert flipped 0 → 4 with no certificate on file (stated cert 4)** · `PENDING`
- **Specialist's defense:** "the specific Tiger 90CR formulation is Ecocert-listed — cleared for use."
- **What I'd need to accept cert ≥ 4:** the actual OMRI / Ecocert listing (number or certificate). The only Tiger doc on file is `soil-ph/doc/tiger-90cr-organic-sulphur-label.pdf` — and that directory's own index explicitly says: *"this sheet carries NO OMRI / Ecocert / CAN-CGSB-32.311 listing number. Do not treat as proof of organic approval — pull the actual OMRI/Ecocert certificate to clear the derivation's cert-0 product flag."* No new certificate document was added in this diff. The cert-4 assertion has no evidence behind it on file.
- **My read:** cert should stay **0–1** (UNKNOWN) until the certificate lands, OR the diff must cite where the Ecocert confirmation now lives (a doc file, a supplier email logged in `doc/`). This is the one finding that touches Catherine's audit directly — an organic-cert claim with zero documentary backing is exactly the failure mode the cert flag exists to catch. Flag-don't-fix; either re-add the cert-0 flag or land the certificate doc first.
- **Cost if real:** high — sulphur is the entire pH-correction lever; if the formulation turns out non-listed, the whole programme uses a prohibited input on a certified-organic bed.

### Complexity
No new finding. The stage-2 ~12 kg figure is a proportional bump on the existing cert-2 buffer estimate (deeper aim → more acid); it doesn't add a constant or branch, and it's already the softest-cert row in the table. No challenge.

### Blindspots
No new finding beyond the band-lowering's B2 (floor-drop on unquantified Mn offset, lines 161–165) — still PENDING, not re-raised.

### Verdict
Land the dose bump (cert-2, proportional, fine). **Block the Tiger 90CR cert flip** (D1) until the Ecocert certificate is on file or cited — revert to cert-0/UNKNOWN otherwise. This is an organic-cert claim with no document behind it; the on-file label is disclaimed as proof by its own index. · `PENDING`

## 2026-06-02 — review of nutrition/tomato/domain/soil-ph/derivation.md (HEAD working-tree diff)

Scope: new "Target band" subsection (6.0–6.5 / aim 6.3 / floor 5.8); dose-stop guardrail 6.5/6.2 → 6.3/5.8; Tiger 90CR cert 0 → 4 (Ecocert); new "Field application log" with first empirical pH titration (5 reads, cert 2); stage-table endpoint 6.5 → 6.3 (~12 kg S); two refinement triggers resolved. No sibling `spec.md` slugs (still blocked on calcimeter).

### Blindspots
**B1 — Empirical −0.2 read sits exactly on the probe noise floor** · `PENDING`
- **What the spec assumes:** the 7.3 → 7.1 reading is a real signal — "abort gate cleared," "buffer thin/titratable," "headroom confirmed, green-light full cap."
- **What might be ignored:** the same block states field-probe noise is ±0.1–0.2, and the move is exactly 0.2 — i.e. the signal is at the detection floor. A single point at the noise edge can't distinguish real titration from probe scatter. Four downstream conclusions (gate cleared, buffer thin, no overshoot, dose full cap) all rest on it. No same-probe pre-dose baseline is logged — "7.3" appears to be the model's 7.28 assumption, not a measured pre-dose pair.
- **How to test it:** one confirmatory retest (the block's own last line) before treating the slope as real; log an actual same-probe pre-dose baseline next cycle.
- **Cost if real:** medium — over-confident "dose full cap" on a noise read steepens overshoot risk toward floor 5.8.

**B2 — Empirical move contradicts the model's own flat-stage prediction** · `PENDING`
- **What the spec assumes:** Stage 1 = pH FLAT until free lime consumed (~3.5 kg S/bed); pH drawdown only begins in Stage 2.
- **What might be ignored:** dose 1 delivered ~1.0 kg elemental S — well under the 3.5 kg the model says carbonate titration needs — yet pH allegedly moved −0.2 already. Either (a) the carbonate pool is far smaller than the 0.1% assumption (good news, but then the whole Stage-1/Stage-2 dose table mis-sizes), or (b) the move is noise (see B1). The diff reads the move as confirmation while it actually undercuts the flat-stage stoichiometry. Both can't hold.
- **How to test it:** the pending calcimeter resolves which; until then don't let one ambiguous point both confirm feasibility AND leave the carbonate dose-table intact.
- **Cost if real:** medium — mis-sized carbonate stage propagates into total-S and timeline.

### Complexity
**C1 — Target-band table now triplicated across three files, already drifting** · `PENDING`
- **Specialist added:** a third copy of the 6.0–6.5 / 6.3 / 5.8 band table (now in derivation, sibling `spec.md`, and `learnings/define-soil-root-zone-ph-target-band.md`).
- **Test:** changes a team action vs. one canonical copy + pointers? No — the operative guardrail is the one in § pass cadence.
- **MVP version:** keep the band table in one home (the learning, which owns the rationale), have derivation + spec point to it. The drift is already real: the learning's "Practical note — undershoot is the real risk" still says **floor 6.2** and "landing anywhere in 6.4–6.8 is a win" — the pre-lowering 6.4–6.8 numbers, now contradicting the 6.0–6.5 / 5.8 band the same file defines above. Vestigial, violates no-vestigial.
- **Why it might stay:** derivation needs the numbers inline for the dose-stop guardrail to be self-contained — fine, but then it should be the single source and spec/learning point to it. Pick one.

### Cert defense
**D1 — Tiger 90CR cert 0 → 4 ("Ecocert certified, allowed"), contradicted by the doc on file** · `PENDING`
- **Specialist's defense:** "the specific Tiger 90CR formulation is Ecocert-listed — cleared for use."
- **What I'd need to accept cert ≥ 4:** the actual Ecocert/OMRI certificate or listing number. The doc index `soil-ph/doc/CLAUDE.md` (current) explicitly says the opposite: "'Organic' is the brand name; this sheet carries NO OMRI/Ecocert/CAN-CGSB-32.311 listing number. Do not treat as proof of organic approval — pull the actual certificate to clear the cert-0 flag." The on-file label PDF (©2015, TS5525) is a product spec sheet, not a certificate. Nothing in the diff cites a new certificate.
- **My read:** cert should stay **0 (unverified)** until a certificate is referenced, OR the diff must cite where the Ecocert listing was obtained — and the doc index must be updated in lockstep (it still says unverified). Mis-call cost is high: a non-listed input fails Catherine's organic audit. `Guillaume call needed:` did a certificate actually arrive, or was the label's "Organic" brand name read as proof?

### Verdict
Land after addressing D1 (cert evidence — highest stakes) and the B1/B2 noise-vs-signal ambiguity; fold C1's triplication and fix the learning's stale 6.2/6.4–6.8 Practical note. The band-definition and guardrail wiring themselves are sound.

## 2026-06-13 — review of yield-range/derivation.md (HEAD working-tree diff)

Scope: `GH_LIGHT_TRANSMISSION_DOUBLE_POLY` 0.55 → 0.65 in the `dli-annual-sun-plus-led ↔ double-poly-transmission-decomposed` section + the consolidated refinement-triggers row. Cert held at 3. `data.js:18` already carries 0.65 (live). No sibling `spec.md` slug text changed (spec states the formula, not the value).

### Blindspots
**B1 — The constant bump wasn't propagated into the section's own worked example; the d44 headline timing now contradicts the live value** · `PENDING`
- **What the spec assumes:** the `logistic-growth-no-decay` integrator-output block (lines ~122-135) is a faithful trace of the live constants — `DLI_bench = sun(16.5) + LED(11.5) = 28.02`, `f_light ≈ 0.70 for d ≤ 14`, `daysToTransplantPotential = d44` at 50-cell / 16 LED-h.
- **What might be ignored:** `sun(16.5)` = 30 × **0.55**. With 0.65 the sun term is 19.5, bench = 19.5 + 11.52 = **31.0**, not 28.02. Every number downstream of it (the 28.02 bench, the per-plant-DLI reads driving `f_light ≈ 0.70`, the d44 ready-day) is now stale — derived from the constant this diff just retired. d44 is the surface's headline timing number; a PO or operator citing it is citing a 0.55-world result against a 0.65-world model.
- **How to test it:** recompute the integrator at 0.65 and refresh the worked example (specialist lane — flag, don't fix); confirm whether d44 actually moves (early-nursery per-plant DLI is already in the ≥22 saturation floor, so the shift may be 0-2 d, but the printed 28.02/16.5 are wrong regardless).
- **Cost if real:** medium — internal inconsistency in the one block operators read for "when is it ready"; erodes trust in the trace even if the day-number barely moves.

**B2 — Top-of-band transmission stacked on a best-case model = compounded optimism; the value choice rests on unverified film condition** · `PENDING`
- **What the spec assumes:** Décembre's poly justifies the top of the published fresh band ("newer/clean 6-mil film", 0.65).
- **What might be ignored:** the model is already explicitly "best non-light conditions" (every stress factor pinned at 1.0). Picking the optimistic extreme of the transmission range on top of that double-counts optimism. Published fresh range is 0.50-0.65; aged/fouled drops to ~0.45. If the actual film is mid-life or dusty (typical small-greenhouse reality), true transmission is 0.50-0.55 and the model over-states sun DLI by 18-30%. Nothing in the diff cites the film's actual age/install date.
- **How to test it:** `Guillaume call needed:` what's the real age/condition of the double-poly right now — freshly installed/clean (0.65 defensible) or mid-life (drop to 0.55)? A one-time PAR-meter reading under-film vs open-sky settles it directly.
- **Cost if real:** medium — over-stated bench DLI inflates the best-case timing/yield surface; matters most at lower LED-hours where sun is the larger DLI term.

### Complexity
No new constant, stage, or branch — a single value moved. Nothing to cut.

### Cert defense
**D1 — `GH_LIGHT_TRANSMISSION_DOUBLE_POLY = 0.65`, cert held at 3** · `PENDING`
- **Specialist's defense:** 0.65 is within the published fresh-film range (0.50-0.65), so the cert-3 published-range basis is unchanged from 0.55.
- **What I'd need to accept cert ≥ 3:** the published-range grounding does carry to 0.65 — it's the band's top edge, still cited, not extrapolated. So cert 3 holds on *literature* grounds. What it does NOT establish is that 0.65 (vs 0.55) is the right pick for *this* film — that's a field-condition call, not a literature-cert call.
- **My read:** cert 3 fine. But the cert is doing different work than before: at 0.55 it was "typical film, mid-band"; at 0.65 it's "best-case film, top edge". The number is now a field-reality bet (see B2), not just a literature read — the cert label hides that shift. Recommend a one-line note that 0.65 presumes fresh/clean film and steps down with age, which the prose half-says ("drop toward 0.55-0.45 as film ages") but the trigger table still frames as a swap-time event, not a continuous derate.

### Verdict
Land after refreshing the stale worked example (B1 — concrete defect, highest priority) and confirming film condition justifies top-of-band (B2/D1 — Guillaume call). The constant choice itself is defensible if the film is genuinely fresh; the trace just hasn't caught up to the new value.

## 2026-07-05 — review of nutrition/nursery/plant-needs/derivation.md (HEAD working-tree diff)

Scope: `LETTUCE_NURSERY_DM_FRACTION` section only. No number moved — DM held 0.07, cert held 3. Adds (a) "held-long crowded plugs run drier still (≥ 0.07)" and (b) a bold "not the same as yield-range's `DRY_MATTER_FRACTION = 0.045`" paragraph forbidding unification, citing a ~36 % demand cut and "mask the salt-driven under-supply." Touches `nitrogen-demand-in-band-at-defaults` (spec.md) only indirectly — the 63 mg worked example still rides on 0.07.

### Blindspots
**B1 — DM value defended by appeal to its own convenient downstream conclusion** · `PENDING`
- **What the spec assumes:** 0.07 is right partly because "dropping this to 0.045 would … mask the salt-driven under-supply." The under-supply diagnosis is used as a reason to hold DM high.
- **What might be ignored:** this inverts the derivation direction. DM is an input; it must stand on tissue-physics grounds (firm younger tissue, moderate moisture) — which the paragraph *also* states, and which is sufficient. Coupling the input's defense to the output it produces is the `refit-not-relabel` failure mode: if true plug DM were nearer 0.05, the honest response is to update the under-supply read, not to protect DM because it yields the wanted story. The physical basis carries the value alone; the "mask the under-supply" clause adds motivated reasoning, not evidence.
- **How to test it:** the end-of-cycle DW measurement already named in the refinement triggers — it settles DM on its own, independent of any downstream diagnosis. Until it lands, defend 0.07 on tissue grounds only.
- **Cost if real:** low — no number moved, doc/reasoning-discipline only. But it's the exact input-defended-by-output pattern the persona exists to catch.

**B2 — "≥ 0.07" widens the claim to a floor, but only the downside is guarded** · `PENDING`
- **What the spec assumes:** the new "held-long crowded plugs run drier still (≥ 0.07)" reframes 0.07 from a point estimate to a lower bound, while the formula still feeds it as a single point linearly.
- **What might be ignored:** if plugs genuinely run 0.08–0.10, computed demand is *under*-stated ~15–40 % — the opposite tail from the 0.045 concern, and it points the *same direction* as the under-supply worry (demand even higher than modelled). The note defends hard against the low side (don't unify to 0.045) and asserts the high side (≥ 0.07) without carrying either tail into a cert or trigger. Asymmetric — the value is now a bound in prose but a point in the math.
- **How to test it:** same DW measurement; log the actual spread, not just a floor. If it reads 0.09, the 63 mg N band example and the whole demand table shift up too.
- **Cost if real:** low-medium — nursery demand-sizing, docs only; matters if the ≥0.07 hint is real and the demand table is quietly low.

### Complexity
**C1 — the "don't unify" note is worth keeping; the under-supply justification clause is not** · `PENDING`
- **Specialist added:** full bold paragraph = (i) "different quantity, don't unify 0.07 with yield-range 0.045" + (ii) "would cut demand ~36 % and mask the salt-driven under-supply."
- **Test:** changes a team action? (i) yes-ish — it prevents a real footgun (two same-named DM constants, different values across subprojects; a future editor could unify them). (ii) no — the under-supply clause guides no edit; it only couples the value to a diagnosis (see B1).
- **MVP version:** keep (i) and the ~36 % figure (arithmetic checks: 0.045/0.07 = 0.64 → −36 %, correct — it quantifies the footgun). Drop (ii)'s "mask the salt-driven under-supply" tail — the physical-basis sentence already justifies the value.
- **Why it might stay:** if the under-supply read is the reason this cross-reference was written at all, the specialist may want the motivation on record — but that belongs in `learnings/`, not as the value's justification in the live derivation.

### Cert defense
No challenge. DM cert 3 (operator notes, no lab) is honestly stated and unchanged; the refinement trigger to bump 3→4 on a ±0.5 % DW measurement is already in place. The "≥ 0.07" widening loosens the claim slightly but stays inside the operator-notes basis.

### Verdict
Ship the cross-reference note (the footgun guard + correct ~36 % figure are useful) after trimming the "mask the under-supply" justification (B1/C1 — decouple input from output) and deciding whether ≥0.07 should carry into the demand math or stay prose (B2). No dose moved; findings are reasoning-discipline + one asymmetry, all low-cost.

## 2026-06-13 — re-trigger, yield-range/derivation.md (no-op)
Hook re-fired on the same `GH_LIGHT_TRANSMISSION_DOUBLE_POLY` 0.55 → 0.65 diff already reviewed above (lines 247-274: B1 stale d44 worked example · B2 top-of-band optimism / film-condition · D1 cert-3 holds on literature but now a field-reality bet). Ran the three-angle pass independently; landed on the same findings (plus the annual-average-sun × peak-fresh-transmission time-axis framing, already covered by B2's optimism point). No new claim moved → no-op pass, no duplicate entry. · `PENDING`


## 2026-07-05 — review of yield-range/derivation.md (full rewrite: logistic → carbon-balance + senescence)

Scope: entire derivation rewritten. Retired `logistic-growth-no-decay`, `best-non-light-conditions`, `packed-canopy-spacing`, per-plant DLI-share. New live entries: `carbon-balance-growth`, `canopy-closure-detection` / `senescence-past-closure`, `nursery-canopy-cap` / `field-canopy-cap-by-density`, `field-spacing-config`, `labor-routine-cadence` / `throughput-and-sales`. New sales surface ($/kg × kg/year). Guillaume decision 2026-07-04.

### Blindspots
**B1 — RUE 1.1 (clean) drives the full-cycle sales surface, but the only anchors are stressed (ε≈0.85); the field output is a +29% extrapolation with no intermediate data point** · `PENDING`
- **What the spec assumes:** the params "reproduce the observed stressed anchors — 16 g @ d28, 40 g @ d35 — in `seedling-thinning.js`", and `predictYield` "shares the constants". Fit + headline treated as one validated engine.
- **What might be ignored:** the anchor fit runs at stressed ε≈0.85 (domain.md, day10 learning), but the headline `predictYield` / sales surface runs at clean `RADIATION_USE_EFFICIENCY = 1.1`. Field fresh weight ≈ stressed-anchor × (1.1 / 0.85) ≈ **+29%**, unvalidated against any observation. This is structurally the same move the challenger already rejected once — the 0.40 RGR jump "had no intermediate data point" ([[refit-not-relabel]]). Fresh weight also scales inversely with `DRY_MATTER_FRACTION = 0.045` (also cert 2) in any *uncapped* short-routine config, so two cert-2 multipliers stack into the same sales number.
- **How to test it:** one clean (destressed) cohort weighed at a known day/spacing that is NOT cap-bound → back out ε at Décembre and check it lands near 1.1; until then the field surface is literature-scaled, not anchored.
- **Cost if real:** high — every $ in `yearlySalesDollars` scales ~linearly with ε (and 1/DM in uncapped configs).

**B2 — Growth held at DLI_TARGET = 17 makes the whole sales surface a "light always optimal" number; QC winter feasibility is deferred to `light/` but the $ output doesn't carry the caveat** · `PENDING`
- **What the spec assumes:** growth DLI pinned at 17; whether sun + LED reaches it is decoupled as a `light/` feasibility concern, "not a growth input".
- **What might be ignored:** the old engine coupled growth to *actual* per-plant DLI (sun × transmission + LED, minus canopy-share decay). The rewrite removes that coupling entirely — the engine never sees a shortfall. `kgPerYear` / `yearlySalesDollars` are therefore best-case-light annual figures. In QC winter, aged poly (0.45), and cloudy strings (`SKY_CONDITION_FACTORS` down to 0.25), the fixture may not close the gap to 17 for weeks — real annual kg would fall below the surface with no in-model signal.
- **How to test it:** `Guillaume call needed:` is the annual-sales surface meant as best-case-light (planning ceiling) or light-feasible-adjusted (bookable revenue)? If the latter, throughput must weight by the fraction of the year `light/` says 17 is reachable.
- **Cost if real:** high — a headline revenue number read as achievable when it's a lighting-optimal ceiling.

**B3 — Senescence (cert 1, uncalibrated) feeds harvestWeightG → kgPerYear → sales; and the nursery reuses the field rate 0.04, under its own observed 0.066 anchor** · `PENDING`
- **What the spec assumes:** `SENESCENCE_ONSET_DAYS = 7`, `SENESCENCE_DECLINE_RATE = 0.04` make the labor-routine tradeoff "directional, not quantitative".
- **What might be ignored:** onset 7 d after closure with field routines of 14/21/28 d means most configs harvest *inside* the senescence regime → `harvestWeightG` (hence all $ output) depends on a cert-1 number, not just the routine ranking. Separately, `senescingAtTransplant` applies the same 0.04 in the nursery, but the nursery's own anchor was −0.066/day (16→10 g d28–35) — so the nursery decline is modeled ~40% gentler than the one observation it has. Directional-only is the stated claim, but the sales tiles read as quantitative.
- **How to test it:** first field cohort weighed at harvest at the operational routine (already the named refinement trigger) — but flag in-app that sales figures inherit a cert-1 rate until it lands.
- **Cost if real:** medium-high — routine *ranking* likely survives; routine *magnitude* and absolute sales do not.

**B4 — No marketable-fraction / survival haircut on the sales surface, and the prior open marketability question (150-160 g sellable?) was dropped, not resolved** · `PENDING`
- **What the spec assumes:** Little's-law throughput → `yearlySalesDollars = kgPerYear × 25` with 100% bed occupancy, zero germination loss, zero cull, every gram sellable.
- **What might be ignored:** the retired derivation carried an explicit Guillaume-owned open input — "does 200 g matter or is 150-160 g sellable? drives whether 43/m² is final density". The rewrite deletes that block. If it was answered, the answer isn't recorded; if not, a live commercial decision was dropped silently ([[feedback_no_vestigial]]). Also no marketable-fraction multiplier — real ops lose 10-20% to culls/failures before sale.
- **How to test it:** `Guillaume call needed:` was the min-sellable-head-size / density decision settled? And should sales carry a marketable-fraction factor, or is best-case (every head sold) the intended surface?
- **Cost if real:** medium — dropped decision + unhaircut sales both inflate the revenue read.

### Complexity
**C1 — `SENESCENCE_ONSET_DAYS` and `SENESCENCE_DECLINE_RATE` are two cert-1 knobs for a result the spec says is only directional** · `PENDING`
- **Specialist added:** separate onset (7 d) + rate (0.04) parameters, each with its own refinement trigger.
- **Test:** for a *directional* "held longer → lose more" tradeoff, does splitting onset from rate change a team action vs a single decline-from-closure param? Not until field data calibrates both.
- **MVP version:** could fold to one param (decline begins at closure, or a single days-to-loss) until the first field weigh-in splits them.
- **Why it might stay:** the two map to distinct observables (peak-day vs slope) with clean separate triggers, and the second field-weight series is already named to calibrate onset — so the split pre-positions the calibration cleanly. Steelman holds; low-value cut. Flagging for completeness, not pressing.

Note: the rewrite is net *complexity-reducing* (removed f_light piecewise, per-plant DLI-share, best-non-light framing). The two-DM-fraction choice (0.045 field vs 0.07 nursery-nutrient) is well-argued in the trace — unify-either-way distorts one lane — no cut.

### Cert defense
**D1 — `RADIATION_USE_EFFICIENCY = 1.1 g dry/mol`, stated "cert 2 literature"** · `PENDING`
- **Specialist's defense:** clean-root lettuce RUE from literature.
- **What I'd need to accept cert ≥ 2:** an on-disk primary source. The retired derivation itself flagged the [[P-10]] missing-doc gap — no growth-physiology source in `nutrition/doc/` (only fertigation-chemistry PDFs). Same gap now applies to RUE 1.1: literature-asserted, unverified on disk ([[read-vendor-doc-first]]).
- **My read:** cert 2 holds *only if* the RUE source lands in `nutrition/doc/`; until then it's a literature assertion (effective cert 1-2). This is load-bearing (B1) — the whole field surface scales on it, so the missing doc matters more here than it did for RGR.

**D2 — `GROWTH_RGR = 0.20`, cert unstated in the new trace** · `PENDING`
- **Specialist's defense:** day-10 open-canopy photo refutes 0.30; spring back-fit corroborates 0.22 (`learnings/day10-open-canopy-refutes-rm-030.md`).
- **What I'd need to accept:** nothing more — the coverage-based refutation of 0.30 is sound and the two-photo argument is honest about wanting a 3-plant d10 weigh to tighten. Reasoning fine.
- **My read:** defense fine; but the new `carbon-balance-growth` block prints no cert on `GROWTH_RGR` where the old block stated one. Flag: state the cert (2, per the photo-coverage basis) so the trace doesn't leave the engine's primary rate uncerted.

### Verdict
Land after addressing B1 (clean-ε anchor gap — highest, the field/sales surface is a +29% unvalidated scale-up) and D1 (RUE source doc). B2 + B4 are Guillaume calls on what the sales number *means* (best-case-light + every-head-sold vs bookable). B3 directional claim is fine but the app must not present cert-1-derived $ as firm. C1/D2 are low-value cleanups. Engine rewrite itself is coherent and net-simpler; the exposure is that a dollars surface now rides on two cert-2 multipliers + one cert-1 rate + a best-case-light assumption, none yet anchored at Décembre.

## 2026-07-05 — re-trigger, yield-range/derivation.md (no-op)
Hook re-fired on the same logistic → carbon-balance rewrite already reviewed above (lines 310-360: B1 clean-ε +29% anchor gap · B2 DLI_TARGET=17 best-case-light sales · B3 senescence cert-1 into $ + nursery reuses 0.04 under 0.066 · B4 no marketable-fraction / dropped 150-160 g question · C1 two senescence knobs · D1 RUE-1.1 missing doc · D2 GROWTH_RGR cert unstated). Ran the three-angle pass independently; landed on the identical findings — the validation block still calibrates the "optimum-stress" curve to the stressed 16 g/40 g anchors (their B1), `GROWTH_RGR` still prints no cert (D2), senescence still `cert 1` feeding sales (B3). No new claim, constant, or cert moved → no-op pass, no duplicate entry. · `PENDING`

## 2026-07-08 — review of yield-range/derivation.md (evolution since the 2026-07-05 rewrite)

Scope: **not** the full rewrite (already at lines 310-360). This diff evolves it: anchor swapped `16 g@d28 / 40 g@d35` → **`5 g (biggest) @ d25`, drought+heat** (old anchors retired as salt-stalled/unsourced); new constant `NURSERY_STRESS_RUE = 0.85` (field still clean `1.1`); `min()` cliff → Beer–Lambert interception (`SLA` back-derived, `k = 0.7` new); senescence onset retuned **`7 → 1.7`**, closure `LAI 1.4 → 3`.

**Still standing, not re-raised (2026-07-05 PENDING):** B1 clean-ε drives the whole $ surface, only anchor stressed — now *sharper*, derivation itself admits "clean ε (1.1) is unanchored — no well-watered 50-cell weighed yet". B2 DLI_TARGET=17 best-case-light. B4 marketable-fraction / the 150-160 g density question — the "Extension-pending" block that held it is **deleted** this diff, so that Guillaume-owned commercial input is now gone from the file, still unresolved. D1 RUE-1.1 missing doc. D2 GROWTH_RGR still prints no cert.

### Blindspots
**B1 — the anchor is the tray's *biggest* plant; ε calibrated to the max, applied to every head in `kgPerYear`** · `PENDING`
- **What the spec assumes:** reproducing "5 g (biggest) @ d25" validates the growth engine; `throughput-and-sales` then multiplies `harvestWeightG` across `headsPerWeek` (all heads).
- **What might be ignored:** "biggest" is the population max, not the mean. Calibrating ε (and the transplant weight it sets) to the largest seedling propagates a max-of-population weight onto *every* head in the sales roll-up. With no survival/marketable haircut (B4), mean < biggest → `kgPerYear` and `yearlySalesDollars` are systematically over-read. The bias is baked into the *calibration philosophy*, so it will re-infect the clean field ε the moment that cohort is weighed the same way.
- **How to test it:** weigh the **mean** (or a distribution) of the next anchor cohort, not the biggest; anchor ε to the mean. If only a max is ever recorded, carry an explicit biggest→mean derate into throughput.
- **Cost if real:** high — direct multiplier on the headline revenue surface.

**B2 — senescence retune makes the 2wk-vs-3wk labor comparison unreliable, but that IS the lever the model is built to inform** · `PENDING`
- **Guillaume call needed:** does the operator surface present a 2-week vs 3-week routine choice as decision-grade?
- **What the spec assumes:** onset `1.7` + rate `0.04` keep the labor-routine tradeoff "directional (hold longer → lose more)".
- **What might be ignored:** the derivation now *admits* the strict `2wk < 3wk < 4wk` ordering is "phase-sensitive" — only over-holding past the peak (`4wk < 3wk`) is robust; whether 2wk reads below 3wk "depends on where the LAI-3 oscillation phase falls, which `1.7` tunes". The app compares 2/3/4-week routines (`labor-routine-cadence`). So the model is directional exactly where it doesn't matter (nobody debates 4wk) and phase-dependent where the real call sits (2 vs 3).
- **How to test it:** first field cohort weighed at 2wk and 3wk at the operational spacing → check the model reproduces the *sign* of the 2-vs-3 gap before any surface presents it as a routine recommendation.
- **Cost if real:** medium-high — an operational lever presented as decision-grade over a comparison the model can't reliably order.

### Complexity
**C1 — `SENESCENCE_ONSET_DAYS` retuned `7 → 1.7` to preserve a qualitative behavior, not to fit data** · `PENDING`
- **Specialist added:** onset dropped to 1.7 explicitly "to keep the labor-routine tradeoff *directional*" after closure moved to LAI 3.
- **Test:** changes a team action vs leaving onset uncalibrated? No — it's a free knob tuned to make the model's own output monotone, on zero senescence data.
- **MVP version:** hold onset at a physically-motivated placeholder and let the ordering be whatever the physics gives, OR collapse onset+rate to one days-to-loss param until the salt-controlled cohort lands — don't tune a cert-1 knob to manufacture a directional signal the data can't yet support. This is the [[refit-not-relabel]] pattern: a parameter moved to hit a desired result (there RGR 0.40 → chosen asymptote; here onset 1.7 → chosen ordering).
- **Why it might stay:** directionality is the stated purpose and the field trigger is named — but tuning to preserve it, then labeling the result "directional," is circular. Flag the tune as a placeholder, don't present the ordering as a model finding.

### Cert defense
**D1 — "Validation" oversells a single-scalar fit of a two-parameter (ε × DM) engine** · `PENDING`
- **Specialist's defense:** the params "reproduce the one real Décembre weight — 5 g biggest @ d25" in both `calc.js` and the chart view.
- **What I'd need to accept "validated":** more than one datum. `5 g = ε_stress × DM × f(day, DLI)` is one equation in two unknowns — the learnings table itself shows **`(DM 0.045, ε 0.68)` and `(DM 0.07, ε 0.85)` both hit 5 g**. The 0.07/0.85 pair was chosen to reuse an existing constant, not because the datum distinguishes it. One scalar can't validate a curve; it can only be *consistent* with it.
- **My read:** downgrade the language from "validated" to "consistent with the single stressed datum". `NURSERY_STRESS_RUE` cert 1 is honest; but `PLUG_DRY_MATTER_FRACTION` carrying **cert 3** while co-determining that same fit overstates — its cert rests on the nursery-lane tissue basis, not on this reproduction, so the derivation shouldn't lean the "reproduces the anchor" claim on it. Split: the *fit* is cert 1 (one point, degenerate); the plug-DM *value* keeps its own cert 3 on tissue grounds, but not by virtue of the 5 g match.

### Verdict
Land the engine evolution (Beer–Lambert + derived SLA is a genuine improvement — net-simpler, kills the LAI-1.4 cliff artifact). But three new exposures ride on top of the still-open 2026-07-05 set: the anchor is a population **max** feeding a mean surface (B1, high), the senescence retune makes the **2-vs-3-week lever unreliable** in the range that matters (B2, Guillaume call), and "validated" overstates a **degenerate one-point fit** (D1). None block the math; all bear on whether the sales/labor surfaces can be read as decision-grade. · `PENDING`


## 2026-07-11 — review of yield-range/derivation.md (HEAD working-tree diff: age-stepped DLI ceiling + SLA re-anchor)

Scope: `carbon-balance-growth`. Two moves: flat-17 light fold → `NURSERY_DLI_CEILING_BY_WEEK = [10,14,17]`, growth on `min(DLI_TARGET, nurseryLightCeiling(day))` (`calc.js:136`); `SPECIFIC_LEAF_AREA` re-derived at the week-2 ceiling (14) not `DLI_TARGET` (17), 0.015 → 0.019. Not re-raised: the 2026-07-08 / 07-05 PENDING set (max-anchor, senescence-lever, one-point fit) all still stand.

**Steelman first (why this diff is net-good):** day 10 sits in the week bucket that gets ceiling 14, so deriving `SLA` at 14 makes the small-LAI limit `ε·DLI·k·SLA·W` actually equal `GROWTH_RGR·W` *at the anchor's real DLI* — deriving at 17 (prior state) was an internal inconsistency this fixes. And the stepped ceiling removes the flat-17 over-lighting of fragile cotyledon/true-leaf plugs (the named `#3` fix). Both are improvements. The findings below are narrow.

### Blindspots
**B1 — sibling `spec.md` contract still says flat `DLI_TARGET`; code + derivation moved to the age-stepped `min()`** · `PENDING`
- **What the contract states:** `spec.md` § carbon-balance-growth line 71 `gain = ε × DLI_TARGET × A_ground × fi`; lines 86-88 "folds into `ε × DLI_TARGET` (no separate `f_light` multiplier)"; Assumptions line 50 "Growth DLI held at `DLI_TARGET`".
- **What the model now does:** `calc.js:136` `effectiveDli = Math.min(DLI_TARGET, nurseryLightCeiling(day))` and this derivation's age-stepped fold. All three contract statements now contradict the code. The contract is the read surface — it understates the model.
- **How to test it:** n/a — coherence, not physics. Specialist / context-coherence lane updates `spec.md` § carbon-balance-growth pseudo-code + Assumptions to the `min(DLI_TARGET, nurseryLightCeiling(day))` form.
- **Cost if real:** low on yield; but live drift on the contract surface — the exact vestigial-hold pattern the shop bans.

**B2 — `SLA` is now pinned to an unmeasured directional band-top, and `SLA` sets closure/senescence timing model-wide** · `PENDING`
- **What the spec assumes:** `SLA = GROWTH_RGR/(ε·NURSERY_DLI_CEILING_BY_WEEK[1]·k)` is "**derived, not free**" — reads as anchored.
- **What might be ignored:** the anchor DLI (14) is itself a cert-2 band-top from `light/domain.md`, self-labeled "directional only, not a Décembre measurement." Moving the anchor DLI 17→14 lifted `SLA` ~27 % (0.015→0.019). `SLA` feeds `LAI → closure day → senescence onset → the whole labor-routine trajectory`. So an unmeasured nursery light band now propagates into field yield + senescence predictions, and the next band revision moves `SLA` again.
- **How to test it:** first leaf-area / SLA measurement at week 2 (already the named trigger). Until then, closure timing inherits the band's cert 2 — the derivation's "derived, not free" should read "derived from the week-2 band (cert 2), not measured."
- **Cost if real:** medium — closure/senescence timing is exactly what the 2-vs-3-week labor lever (B2, 07-08) rides on; an SLA shift re-phases the LAI-3 oscillation that lever depends on.

### Complexity
**C1 — three-step ceiling `[10, 14, 17]`** · `PENDING`
- **Specialist added:** per-week 3-value lookup + `nurseryLightCeiling(day)`.
- **Test:** changes a team action vs a single early-nursery sub-ceiling, or vs just anchoring? The 5 g @ d25 anchor lands either way (4.9 g); field ages all sit at 17, so the steps only bite wk1-2.
- **MVP version:** could fold to one "fragile-plug" sub-ceiling — but the SLA anchor now needs the week-2 value (14) named explicitly, and the 3 steps carry no extra data cost.
- **Why it might stay:** it is the `#3` over-lighting fix *and* the SLA-at-14 coherence needs the week-2 step. Weak cut — lean **stays**.

### Verdict
Ship — net a coherence improvement (SLA now consistent with the day-10 anchor's actual DLI; fragile-plug over-lighting removed). Two follow-ups, neither a math blocker: `spec.md` contract is now stale vs the `min()`-form code (B1, low-yield / live drift — route to coherence lane), and the derived `SLA` inherits the unmeasured week-2 band's cert 2 and propagates it into closure/senescence timing that the labor lever depends on (B2, medium). · `PENDING`

## 2026-07-11 — re-trigger, yield-range/derivation.md (no-op)
Hook re-fired on the same age-stepped-ceiling + SLA-re-anchor diff already reviewed above (lines 402-429: B1 spec.md flat-`DLI_TARGET` drift · B2 SLA pinned to unmeasured cert-2 band-top → closure/senescence timing · C1 three-step ceiling lean-stays). Ran the three-angle pass independently and landed the identical findings. One extra angle considered and dropped: whether the `GROWTH_RGR = 0.20` day-10 anchor lived at clean ε (1.1) vs stressed (0.85) — the SLA back-solve uses clean 1.1, so a stressed-cohort 0.20 would over-set SLA ~1.3×; steelmanned away because the day-10 refutation of 0.30 is coverage-geometric (ε-independent, `learnings/day10-open-canopy-refutes-rm-030.md`), so 0.20 stands as a clean rate. No new claim, constant, or cert moved → no-op pass, no duplicate entry. · `PENDING`

## 2026-07-11 — supplement, same diff (one finding the 402-429 pass + the two re-triggers all missed)

Not a re-trigger no-op: the passes above ran the three-angle sweep and converged, but none noticed the field-side consequence of the SLA re-anchor. The 402-429 steelman ("deriving SLA at 14 makes the small-LAI limit equal `GROWTH_RGR·W` at the anchor's real DLI") is circular — "real DLI = 14" is *imposed by the new ceiling model*, not measured. Only this one finding; B1/B2/C1 above stand as written.

### Blindspots
**B1 — SLA back-solved at DLI 14 while the engine runs field + late-nursery at DLI 17 → field open-canopy RGR silently became 0.24, not the 0.20 anchor; the "open-canopy limit = GROWTH_RGR" invariant now holds only at nursery week 2** · `PENDING`
- **What the spec assumes:** `derivation.md` `carbon-balance-growth` and `spec.md:85` state the small-LAI limit equals `GROWTH_RGR·W` as an **unqualified invariant** ("derived so this limit is exact"). The 402-429 C1 treats "field ages all sit at 17, so the steps only bite wk1-2" as benign.
- **What might be ignored:** open-canopy RGR = `ε·DLI·k·SLA`, *linear in the operating DLI*. SLA was pinned to make that = 0.20 at DLI 14. The engine runs field plants (and day ≥ 14 nursery) at `effectiveDli = 17`, where the rate is `1.1·17·0.7·0.019 = 0.243/day` — **+21% over GROWTH_RGR = 0.20**. Post-transplant a head sits deeply open-canopy (LAI ≈ 0.3 at field spacing) for much of the field window, so this faster exponential phase feeds `harvestWeightG → kgPerYear → yearlySalesDollars`. Field yield rode up as a side effect of a change whose stated purpose (`#3`) was the *early* plug. The d25 nursery anchor can't catch it — there the plug is near-closed (light-limited), so SLA↑ and ceiling↓ cancel (5 → 4.9 g). Validation sits exactly where the bias is invisible.
- **Why the steelman is circular:** "the anchor's real DLI is 14" comes from the new ceiling model (day 10 → week bucket → 14), not a measurement. It's only right if the day-10 cohort was genuinely light-limited to ~14. If the propagation space delivered ~17 and the plug grew at 0.20, then 0.20 is the rate at 17, SLA should derive off 17 (stays 0.015), and this diff over-derives SLA and inflates field growth.
- **How to test it:** `Guillaume call needed:` what usable DLI did the day-10 open-canopy anchor cohort actually see — full propagation-space 17, or young-tissue-limited ~14? Independent back-check: a clean field cohort weighed at a non-cap-bound day/spacing shows whether field open-canopy RGR is 0.20 or 0.24. MVP alternative if the ceiling effect is wanted only early: keep SLA off 17 (0.015) so the invariant holds at the field DLI, and let the wk1/2 ceiling slow only the early plug — isolates the `#3` fix without the field inflation.
- **Cost if real:** high — a ~21% multiplier on the field open-canopy phase, i.e. on the headline revenue surface, introduced silently by the SLA re-anchor.

### Verdict
Hold the SLA re-derivation pending the day-10-anchor-DLI call. The 402-429 "net coherence improvement" read holds only if that cohort was truly light-limited to 14; if it saw 17, the re-anchor breaks the open-canopy invariant in the field and lifts sold-weight ~21% with no anchor to catch it. The age-stepped ceiling mechanism itself is fine — the exposure is coupling it to the SLA back-solve rather than leaving SLA anchored at the field DLI. · `PENDING`

## 2026-07-12 — review of nutrition/tomato/domain/fertigation/derivation.md HEAD (no-op)
Mechanical rename tracking the domain-split refactor (commit c5e4760): title `fertigation-recipe`→`fertigation`, `calc.js`→`recipe.js`, `model.js`→`contribution.js`, `learnings.md`→`learnings/`, plus implementation-map path updates. No claim, constant, cert, or model logic moved. Trivial → no-op pass, no findings.
