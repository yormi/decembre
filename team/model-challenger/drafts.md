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

## 2026-07-19 — review of nutrition/lettuce/domain/nursery/fertigation/derivation.md HEAD

Scope: §2 demand recalc only. Plug target stepped 20 → 50 g, 50-cell → 32× 2.5"-pot, trayVolume 1.25 → 3.84 L. Floors, mg/tray, and the "more volume not hotter bucket" narrative rewritten. Sibling `spec.md` + `data.js` already carry the 50 g numbers (floor 560/56, supply ~1290/138, trayVolumeL 3.84 cert 2); this diff moved only §2 of the derivation.

### Blindspots
**B1 — §2 updated to 50 g, but §4/§5/§6 still describe the 20 g recipe → derivation now self-contradicts and lags its own spec** · `PENDING`
- **What the spec assumes:** §2 now floors N at 560, P at 56 (50 % of 1120/112). But §4 header still reads "re-derived 2026-06-20 at 20 g target"; its constraint bullets still say "N supply ≥ 350 (50 % of 700 demand at 20 g)" and "P ≥ 35"; the mass-flow block still multiplies by the old `trayVolumeL 1.25`; §5 still prints supply N 412 / P 44 and CE 0.85. A reader landing on §5 sees N 412 against the new 560 floor and concludes the default recipe is **under** the N floor — the opposite of what `spec.md` (supply ~1290 ≥ 1120) and `data.js` (~1290 mg) now assert.
- **What might be ignored:** the numbers *do* reconcile once you rescale §4/§5 by trayVolume 1.25 → 3.84 (412 × 3.07 ≈ 1266, 44 × 3.07 ≈ 135 — matches spec's 1290/138), and `nurseryRecipeCE` is trayVolume-independent so CE 0.85 legitimately holds. So the recipe (X2/Y1.5/Z1) and cap are fine — but the derivation *as written* is stale, not wrong-by-design. This is exactly the "never let stuff become vestigial" case: half a doc rewritten, the dependent half left holding the retired target.
- **How to test it:** recompute §4 mass-flow and §5 supply at trayVolumeL 3.84; rewrite the §4 constraint bullets to the 560/56 floors and the "re-derived" date; confirm §5 lands 1290/138 matching spec + data.js. Purely a coherence recompute — no field input.
- **Cost if real:** medium — the operator recipe is correct, but the canonical "why" doc reads as failing its own N floor; next reader either false-alarms or edits the recipe against a stale derivation.

**B2 — dry-down 1.5× cell-concentration factor was calibrated on 50-cell / ~40 mL substrate; 2.5"-pot geometry delivers ~5× the salt per pot per feed at unchanged bucket EC, yet the CE band is assumed to hold** · `PENDING`
- **What the spec assumes:** §2 argues the salt-safe band holds because feed grew (volume) not the bucket (concentration), and "larger substrate volume drops salt density per mL." CE cap stays 0.85, dry-down still 1.5× (predicted-ce-under-nursery-cap, cert 2).
- **What might be ignored:** salt deposited *per pot per feed* = feed_mL × bucket_EC. That went 25 mL → ~120 mL, i.e. ~5× more salt into each pot each week. Substrate rose only ~5× (40 → ~200 mL), so density per mL is roughly flat — but the 1.5× dry-down factor itself was an estimate for the small-cell weekly-dry-down cycle, not a 200 mL pot that dries slower and may accumulate differently across the longer 50 g hold. The "drops salt density" clause quietly assumes the two 5× ratios cancel; they only cancel if dry-down and leaching behave identically in the bigger pot, which is untested.
- **How to test it:** pour-through EC on a 2.5"-pot tray at the 50 g recipe (refinement trigger #2 already names this) — first read on the new geometry, not the 50-cell. Band-hold is a cert-2 assumption until that number exists.
- **Cost if real:** medium — if the bigger pot concentrates more than 1.5×, cell EC re-enters the tip-burn zone the 1.0 cap was lowered (3.0 → 1.0) to escape.

### Complexity
No constant, stage, or branch added — the change is a re-parameterization of one existing target. Nothing to cut.

### Cert defense
**D1 — "Cert 3 across the board" on the 50 g demand + "salt-safe CE band holds" (§2)** · `PENDING`
- **Specialist's defense:** demand is tissue % × DW × pots (same cert-3 chain as before); band holds because volume carries the load.
- **What I'd need to accept cert ≥ 3 on band-hold:** the demand *arithmetic* is fine at cert 3. But "band holds" rides on `trayVolumeL 3.84`, which `data.js` itself marks **cert 2 — pending pot-brim measure** and "~120 mL/plant" estimate. The full-demand-cleared claim (supply 1290 ≥ 1120) inherits that cert-2 volume. So the *coverage* conclusion is cert 2, not 3, until the pot volume is measured.
- **My read:** demand table cert 3 fine; the "band holds / full demand cleared" conclusion should read cert 2 (unmeasured feed volume + unmeasured new-geometry dry-down), matching the trayVolume cert in data.js.

### Verdict
Land after addressing B1 — the derivation must be recomputed at trayVolume 3.84 so §4/§5/§6 stop contradicting §2, spec.md, and data.js (coherence recompute, no field input). B2 + D1 are the standing evidence gap: first pour-through EC on the 2.5"-pot geometry decides whether the cap and the full-coverage claim survive; until then band-hold is cert 2. Recipe values and CE math themselves are not in question. · `PENDING`

## 2026-07-19 — review of nutrition/lettuce/domain/nursery/fertigation/derivation.md HEAD

Scope: §2 demand recalc (20 g/50 cells → 50 g/32 pots), §4 recipe-sizing constraint header, refinement-trigger #5 fired. Sibling `spec.md` floors already bumped to N≥560 / P≥56; parent nutrition/spec cross-crop rules unaffected.

### Blindspots
**B1 — "larger substrate drops salt density per mL" — the feed/substrate ratio is ~unchanged, so it doesn't** · `PENDING`
- **What the spec assumes:** §2 says the 2.5"-pot step-up is salt-safe because "the larger substrate volume (~200 mL vs 40 mL) drops salt density per mL."
- **What might be ignored:** salt retained per mL substrate tracks the *feed-to-substrate ratio*, not either volume alone. New: 120 mL feed / ~200 mL substrate = 0.60. Old: 25 mL / 40 mL = 0.625. Essentially identical — the larger pot also drinks proportionally more feed, so per-mL salt load after dry-down is unchanged, not lowered. The genuinely valid leg of the argument is the *other* one: bucket CE is concentration-only and holds at 0.85. That single fact carries the safety claim; the "bigger substrate dilutes" sentence is a second, wrong justification stacked on top.
- **How to test it:** pour-through EC on a 50 g / 2.5"-pot tray vs the 20 g / 50-cell baseline at matched days-since-feed; equal readings confirm the ratio argument, a rise flags it.
- **Cost if real:** low on the recipe (CE claim stands on its own), medium on the reasoning — a wrong safety justification invites a future step-up to lean on substrate size again where the ratio won't be constant.

**B2 — "the feared N-vs-salt collision did NOT return this time" stated as observed, but nothing at 50 g has been measured** · `PENDING`
- **What the spec assumes:** trigger #5 marks itself ✅ fired and reports the collision as absent, past-tense.
- **What might be ignored:** the 20 g target was set precisely because leachate hit 5+, Na 3166, tip-burn (spec `predicted-ce-under-nursery-cap`). The 50 g conclusion is a model prediction pre-transplant — bucket CE unchanged → predicted cell peak unchanged. No pour-through, no leachate Na, no tissue at the new format yet. "Did not return" is a forecast dressed as an observation.
- **How to test it:** first-tray pour-through EC + leachate Na after the salt flush at 50 g; that is the ground truth that would let #5 legitimately read as fired.
- **Cost if real:** medium — if the ~120 mL/pot feed actually deposits more absolute salt per pot (5× feed volume × same CE) and dry-down concentrates it, the tip-burn regime returns on the more valuable 50 g plug.

### Complexity
**C1 — §4 and §5 were left at the old 20 g numbers while §2 and `spec.md` moved to 50 g** · `PENDING`
- **Specialist added:** nothing new — this is stale scaffolding, not added complexity, but same lever (feedback_no_vestigial). §4 still reads "N 412 mg ≥ 350 floor ✓ / P 44 ≥ 35 floor ✓" and §5 still prints supply N:412 P:44 at trayVolumeL 1.25. §2 now claims trayVolumeL 1.25 → 3.84 and floors 560/56; `spec.md` says supply ~1290 N / ~138 P at the new volume.
- **Test:** a reader reconciling the recipe against the floors hits two contradictory floor sets and two trayVolumeL values in one file → real confusion cost.
- **MVP version:** flag only (challenger doesn't edit) — §4 mass-flow and §5 predicted-supply blocks need re-running at trayVolumeL 3.84 with the 560/56 floors, or an explicit note that §4/§5 are concentration-illustrative at 1.25.

### Cert defense
**D1 — "Cert 3 across the board" on §2 (stated cert 3)** · `PENDING`
- **Specialist's defense:** demand is arithmetic — targetG × DM fraction × tissue % × pots.
- **What I'd need to accept cert ≥ 3:** the arithmetic *is* cert 3 and fine. But the sentence appended to the same block — "so the salt-safe CE band holds" — is an unmeasured prediction (see B1/B2), not arithmetic, and inherits the cert-3 label by adjacency. Split them: demand math cert 3; salt-safety-at-50 g cert 2 until pour-through.
- **My read:** demand cert 3 fine; the salt-hold rider should read cert 2 with a downward trigger, not cert 3.

### Verdict
Land after addressing C1 (stale §4/§5 vs the 50 g §2 — live in-file drift) and trimming §2 to the one valid safety leg (bucket CE unchanged), demoting the substrate-dilution sentence (B1) and the past-tense "collision did not return" (B2) to pending-pour-through predictions. Recipe math itself doesn't move — CE is concentration-only — so no dose blocker; this is coherence + honest-cert, not rework. · `PENDING`

## 2026-07-19 — review of nutrition/lettuce/domain/nursery/fertigation/derivation.md HEAD

Scope: §2 demand recomputed for 50 g / 32 pots (was 20 g / 50 cells); §4 constraint floors doubled; trigger #5 marked fired. Demand arithmetic verified — 35 mg/plant N, 1120 mg/tray, 560 floor all consistent with `calculateNurseryDemand(50,35,32)`.

### Blindspots

**B1 — §2 + trigger #5 rewritten to the 3.84 L / 50 g regime, but §4 (Recipe sizing) and §5 (Predicted CE/pH) still run the old 1.25 L / 20 g numbers → the derivation now contradicts itself** · `PENDING`
- **What the spec assumes:** §2 says demand is met by feed volume `trayVolumeL 1.25 → 3.84`, floors are now N ≥ 560 / P ≥ 56, and "recipe clears full 1120 at 3.84 L". Trigger #5 says the step-up already fired.
- **What might be ignored:** §4 still opens "with the floors quartered", still cites the 350 / 35 floors, still picks X=2/Y=1.5/Z=1 against "N 412 ≥ 350 ✓ / P 44 ≥ 35 ✓", and the §4/§5 mass-flow lines still multiply by `1.25`. §5 still reports N 412 / P 44 per tray. At 3.84 L the same concentrations deliver ~1267 mg N / ~135 mg P — so the *conclusion* (clears 1120/112) is right, but every number the reader sees in §4/§5 is the retired 1.25 L set. A future reader recomputing off §5 gets the wrong tray supply and can't reproduce the §2 claim. This is exactly the vestigial-scaffolding failure — half the file moved, half didn't.
- **How to test it:** recompute §4 mass-flow and §5 predicted supply at `trayVolumeL = 3.84`; confirm `nurseryRecipeSupply(...,3.84)` matches what the verifier actually asserts. If the verifier still pins 1.25/412/44, the code side never moved either — check `data.js` `trayVolumeL` and the `n-supply-half-demand-floor` spec slug.
- **Cost if real:** medium — no greenhouse action changes today (doses X/Y/Z unchanged), but the derivation is internally inconsistent and the recorded floors/supply are unreproducible; next recompute inherits stale anchors.

**B2 — the salt-safety claim now rests on *bucket* CE (0.85, unchanged) but the removed line was the *cell* peak (dry-down ~1.5× → ~1.2); a deeper 2.5" pot dries down differently and peak cell EC is what stresses the seedling** · `PENDING`
- **What the spec assumes:** §4 old text carried "cell ~1.5× via dry-down → peak ~1.2 with per-feed leaching"; the edit deletes it and asserts CE is "concentration-only, unchanged at 0.85", treating bucket CE as the safety metric.
- **What might be ignored:** seedling salt injury tracks root-zone EC at dry-down, not bucket EC. Bucket concentration is genuinely unchanged, but the dry-down multiplier that set the real peak was dropped from the reasoning at the same moment the container geometry changed (40 → ~200 mL, shallow plug → 2.5" deep pot). Deeper pots hold more water and dry down more slowly per feed, which likely *helps* — but the file now asserts safety without re-deriving the factor it used to depend on. "Salt density per mL drops" (§2) is the substitute argument and it's quantitatively ~flat: feed-to-substrate ratio is 120/200 ≈ 0.60 vs 25/40 ≈ 0.625, essentially unchanged, so it does not support a *drop* in salt load per mL of substrate.
- **How to test it:** pour-through EC on the 2.5" pots at dry-down (trigger #2 already exists for this) — that is the number that confirms cell peak stayed ≤ ~1.2 at the new geometry. Until then the salt-safe claim at 50 g is cert 2, not the implied "holds".
- **Cost if real:** medium — if deeper-pot dry-down concentrates more than the shallow plug did, peak cell EC at 50 g could exceed the band the 20 g step was retreating from, re-opening the N-vs-salt collision the trigger declares closed.

### Complexity

Nothing to cut — this edit is a scale-up + a simplification (removed the dry-down qualifier). No new constant, stage, or branch. Skipped.

### Cert defense

**D1 — "the feared N-vs-salt collision did NOT return" (trigger #5, implicit cert 3)** · `PENDING`
- **Specialist's defense:** the ~5× larger substrate volume lets higher demand be met by feed volume at unchanged bucket CE, so no frequency increase needed.
- **What I'd need to accept cert ≥ 3:** one pour-through EC reading on a fed 2.5" pot at dry-down showing cell peak in band. The claim is currently derived entirely from the volume argument — no measurement at the new geometry, and the supporting §5 numbers are still the old-regime set (see B1).
- **My read:** cert should be **2** until pour-through confirms. The physics is plausible (bucket CE flat, more water) but "collision did not return" is stated as observed fact when it's a prediction. `Guillaume call needed:` has any pour-through / in-pot EC been taken on the 2.5" pots yet, or is this forward-looking?

### Verdict
Land after addressing B1 — the §4/§5 numbers must be brought to the 3.84 L regime or the file is self-contradicting. B2/D1 are the same underlying gap (salt-safety at the new geometry asserted, not yet measured); route the pour-through question to Guillaume. Model logic and demand arithmetic are sound. · `PENDING`


## 2026-07-26 — review of `yield-range/domain/derivation.md` (working-tree diff vs HEAD)

Scope: constants block (`SPECIFIC_LEAF_AREA`, new `INITIAL_DRY_MASS_G`, `NURSERY_STRESS_RUE`), **Validation** rewritten around cohorts C+D, new **Day axis** section, **Light fold** wk3+ ceiling 17 → 25.

### Blindspots

**B1 — cohorts C and D contradict each other by ~2× and the file reconciles neither** · `PENDING`
- **What the spec assumes:** cohort C (5 g biggest, d25) and cohort D (9.2 g, d26) are both usable July stressed observations; C "does still land" at 4.58 g, D's d26 drives the whole energy-balance argument.
- **What might be ignored:** they are 1 day apart and D's *representative* plant is 1.8× C's *biggest* plant. Both stressed, both July, both 50-cell. At least one of: the two cohorts' stress severity differs materially (D's is "not decomposed"), or D's day axis is wrong — `doc/data-points.md` records **no sowing date and no germination date for either**, so both axes are reconstructed. If D is actually ~7 days older than logged, 9.2 g at d33 sits inside the engine and the entire "shape gap / the balance is unphysical" section dissolves. The file treats the axis as given and spends its analysis on ε, DM and transmission instead.
- **How to test it:** cohort E is the first with a real sowing date — weigh it. Cheaper: ask whether D's sowing date is recoverable from operator notes, and whether C and D were the same bench/zone.
- **Cost if real:** high — `PLUG_DRY_MATTER_FRACTION` is now queued for a change (0.07 → 0.045–0.05) on the strength of a datum whose day number is reconstructed.

**B2 — the validation table's day-12 row is the fit, presented as agreement** · `PENDING`
- **What the spec assumes:** the table reads as three observations vs the engine; "stressed reproduces days 12 and 19 to within 6%".
- **What might be ignored:** `INITIAL_DRY_MASS_G = 0.009` was **back-solved from that exact day-12 point** (the diff says so, ten lines above the table). The 1.03× is arithmetic, not evidence. Day 19 is 7 days downstream of a fitted level in a near-exponential regime — largely inherited, not independent. Independent points in that table: **one** (day 26), and it misses by 1.75×. The prose "as close as the scale allows" overstates what two of the three rows show.
- **How to test it:** re-derive `INITIAL_DRY_MASS_G` from the day-19 point instead and report the day-12 residual; if day 12 then reads well outside ±20%, the "shape not level" conclusion is a level problem after all.
- **Cost if real:** medium — no greenhouse action moves, but the file's confidence that days 12–19 are solved is unearned, and that confidence is what points the blame at day 26.

**B3 — the Day axis section describes a `GERMINATION_LAG_DAYS = 3` that is not in the code and is denied by the sibling spec** · `PENDING`
- **What the spec assumes:** derivation states the constant exists, that growth is gated until day 1 + lag, that the DLI ceiling steps on tissue age `day − 1 − lag`, and that a "2026-07-26 sowing rebase" repaired an index/justification disagreement in `SPECIFIC_LEAF_AREA`.
- **What might be ignored:** `data.js` has no such constant (grep: zero hits anywhere in `yield-range/`); `nurseryLightCeiling` steps on `floor((day − 1)/7)`, i.e. **sowing** weeks, no lag; `calc.js` integrates from day 1 unconditionally. `domain/spec.md` Assumptions says the opposite in as many words — "Growth integrates from day 1, unconditionally: no emergence delay is represented anywhere" — and its `carbon-balance-growth` body says the ceiling steps on sowing weeks. So the derivation documents behaviour the model does not have, and the "repair" narrative describes a change that is not in the tree. The `SPECIFIC_LEAF_AREA` index-`[1]` justification itself is fine and matches the code (day 10 → sowing-week 2 → ceiling 14); only the lag framing around it is fiction.
- **How to test it:** grep `GERMINATION_LAG_DAYS`; reconcile against `domain/spec.md` line 56. One of the two files is wrong — this is a straight read, not a judgment call.
- **Cost if real:** medium — spec↔derivation↔code three-way disagreement on the day axis, in the exact section whose stated purpose is "one axis, no conversion anywhere". Any consumer reading `nurseryDays` off the derivation is off by 3 days.

**B4 — the wk3+ ceiling stopped being a ceiling and became the nursery's light supply** · `PENDING`
- **What the spec assumes:** "the DLI the tissue can *use* at its age — light past the ceiling buys no growth", and the fold now reads `nurseryLightCeiling(day)` rather than the old `min(DLI_TARGET, ceiling)`.
- **What might be ignored:** with the `min` gone and wk3+ raised to 25, the term is `ε × 25` unconditionally — the model now *asserts* the plug receives 25 mol/m²/j, above the one measured bench value (23.3, best July week, no LED) and well above the field's own `DLI_TARGET` 17. A November plug gets the same 25. The model's seedlings are now better lit than its field plants, permanently, in a greenhouse whose supplemental lighting is sized to 17.
- **How to test it:** run `predictYield` for a winter sowing and compare transplant weight against a summer one — if they are identical, the nursery has no seasonal light response at all.
- **Cost if real:** high — transplant weight feeds the whole throughput chain; a nursery that never sees weather over-predicts winter kg/month.

### Complexity

**C1 — two free parameters absorbing one unobserved phase** · `PENDING`
- **Specialist added:** `INITIAL_DRY_MASS_G` (fitted) plus, in prose, `GERMINATION_LAG_DAYS` (assumed, no cohort has logged a germination date).
- **Test:** changes a team action? No. Both shift the same early curve, in opposite directions, against one weighable point that sits on the scale floor. They are not jointly identifiable from any data Décembre currently has.
- **MVP version:** keep the fitted level; drop the lag entirely (which is also what the code and `spec.md` already do — see B3). Emergence is absorbed as a level, exactly as the file itself argues two sentences earlier.
- **Why it might stay:** if a germination date ever gets logged, a lag becomes observable and the level stops carrying two jobs. Not today.

### Cert defense

**D1 — "wk3+ plug 25, deliberately above the band" (implied cert 3)** · `PENDING`
- **Specialist's defense:** a Décembre 50-cell converted a measured 23.3 mol/m²/j bench DLI in week 4 without tipburn.
- **What I'd need to accept cert ≥ 3:** (a) 23.3 is not measured — 17.47 MJ/m²/d is, then multiplied by an assumed 0.45 PAR fraction and an assumed 0.65 transmission, both flagged as assumptions in the same paragraph; (b) *absence of tipburn* shows tolerance, not conversion — the conversion claim rests on cohort D's weights, the very series the file then argues is energetically impossible; (c) 25 exceeds even the assumed 23.3, so the top of the band is extrapolated past every number in the chain.
- **My read:** cert **2**, and the value should sit at or below the highest DLI actually supported (≈23.3), not above it. Raising the band-top above `light/domain.md` is defensible; overshooting the observation that justified it is not.

**D2 — `NURSERY_STRESS_RUE = 0.85`, defense withdrawn, value kept, cert 1** · `PENDING`
- **Specialist's defense:** honest — the anchor is explicitly retracted and the file even names the raised ceiling as evidence 0.85 is too high.
- **What I'd need to accept cert ≥ N:** nothing; the cert is right. The gap is procedural — per `symmetric-refinement-triggers`, a value kept while its justification is withdrawn needs both an upward and a downward refit trigger. `INITIAL_DRY_MASS_G` got a refit trigger; 0.85 got none, and it is now the constant the file most doubts. It is also still the `nurseryStress` default in `spec.md`.
- **My read:** defense fine, trigger missing. `Guillaume call needed:` the plug dry-matter measurement is the stated unblock for the whole cluster (0.85, the senescence reds, the day-26 gap) — is it scheduled, and does the 32-pot cohort E generation make the 50-cell numbers moot anyway?

### Verdict
Land after addressing **B3** (derivation documents a constant the code does not have and the sibling spec explicitly denies — a straight three-way contradiction) and **B1** (a reconstructed day axis is carrying a queued change to `PLUG_DRY_MATTER_FRACTION`). B2/D1 are honesty-of-framing, cheap to fix in prose. B4 is the one with real yield consequence and is worth a deliberate call, not a patch. The withdrawal of the 5 g anchor and the explicit "no weight anchor is currently reproduced" opening are the right kind of move — the file got more honest, then spent that credit on a ceiling it overshot. · `PENDING`

## 2026-07-26 — review of yield-range/domain/derivation.md (working-tree diff vs HEAD)

Scope: `INITIAL_DRY_MASS_G = 0.009` added (fitted); `NURSERY_STRESS_RUE = 0.85` justification withdrawn, value kept; wk3+ DLI ceiling 17 → 25; nursery growth term repointed from `min(DLI_TARGET, ceiling)` to `nurseryLightCeiling(day)` alone; Validation section rewritten around cohort C/D from `doc/data-points.md`; new Day axis section (sowing = day 1, germination lag retired). Spec slugs touched: `carbon-balance-growth`, Assumptions.

### Blindspots

**B1 — the nursery no longer has a light *input*; the age ceiling became the light *driver*, so every nursery prediction now asserts 25 mol/m²/d in wk3+ regardless of month, weather or LED state** · `PENDING`
- **What the spec assumes:** growth drives on `nurseryLightCeiling(day)` directly (`min(DLI_TARGET, ·)` removed). A wk3+ plug is fed 25 mol/day, always.
- **What might be ignored:** a ceiling is an upper bound on what tissue can *use*; it is not a statement about what the bench *delivers*. Collapsing the two removes the only place a cohort's actual light could enter. Consequences already visible in the file: cohort C ran at an assumed DLI 17 and is now predicted by an engine running it at 25 — that alone plausibly explains the whole 5.34 g vs 5 g inversion the file attributes to `NURSERY_STRESS_RUE`. It also means a February nursery and a July nursery grow identically, while `CLEAR_DAY_MAXIMUM_DLI_BY_MONTH` (already in `data.js`, month 6 = 58) and the `light/` feasibility math sit right there unused on the nursery side. Cohort D's own measurement, 23.3, is *below* the constant the engine drives on.
- **How to test it:** predict cohort D on its measured 23.3 instead of 25 and re-read the day-19/day-26 ratios; if they move materially, nursery DLI is a per-cohort input, not a constant. Structurally: restore `min(benchDli, nurseryLightCeiling(day))` with bench DLI from the `light/` chain, and only then judge ε.
- **Cost if real:** high — it is the difference between refitting ε against a light error and refitting it against reality, and every nursery number in the app inherits it.

**B2 — cohort D's weights are n = 1 per timepoint, chosen by eye as "representative"; the file treats them as mean-plant data and fits a constant to one of them** · `PENDING`
- **What the spec assumes:** 0.5 / 1.4 / 9.2 g are mean-plant observations on the model's axis, precise enough to fit `INITIAL_DRY_MASS_G` to 0.98× and to report 1.34× / 0.66× shape gaps.
- **What might be ignored:** `doc/data-points.md` records n = 1 per week, each a different plant, eye-selected, occupancy not recorded, germination not logged. Eye-selection in a patchy stand biases *up* — the same basis error the file just spent a paragraph correcting for cohort C (biggest-plant vs mean-plant), reappearing one cohort later in a weaker form. The per-cell energy balance concludes the day-19 → 26 gain is 99.6% of a full-interception ceiling — i.e. physically at the wall. The file lists three suspects (plug DM, stand patchiness, transmission) and omits the fourth and cheapest: **9.2 g is above the tray mean.** If so, driving `PLUG_DRY_MATTER_FRACTION` down to 0.045–0.05 to make the balance close would be fitting the model to a sampling artifact, and would land in the same place cohort C's anchor did.
- **How to test it:** next destructive sample, weigh **all** plants in a marked block of cells (n ≥ 8) and report mean + range, not one representative plant; record how many cells in the block are occupied. Cheap, one extra sampling session.
- **Cost if real:** medium-high — it does not change what the team does this week, but it is the sole basis for both new fitted numbers and for the pending plug-DM refit.

**B3 — two of the engine's free parameters are now fitted to the same three-point cohort, and the file says outright the law cannot represent the phase one of them absorbs** · `PENDING`
- **What the spec assumes:** `INITIAL_DRY_MASS_G` is a calibrated level (fitted to cohort D day 12), `NURSERY_STRESS_RUE` keeps 0.85 while unanchored, and the residual mismatch is "shape, not level".
- **What might be ignored:** with one cohort of three eye-sampled points and two adjustable parameters — plus plug DM flagged for refit and SLA derived off a ceiling index — the nursery branch has roughly as many knobs as data. The file is admirably explicit that a single `ε·DLI·fi` law cannot do heterotrophic emergence (1 mg seed reaches 0.06 g not 0.5 g by day 12, 8× short). That is an argument the engine's *validity window starts around day 12*, which the file states — but nothing in the code or spec marks it, so `trajectory` still ships day-1..day-11 points into charts and any downstream consumer reads them as predictions. The rejection of an emergence threshold is well argued ("the same hack with a physics-sounding name"); the alternative actually available and not considered is to **not predict before the calibrated window** rather than to intercept a curve back to sowing.
- **How to test it:** tag `trajectory` rows before the calibrated window (or start the series there) and see whether any consumer breaks — that tells you who is currently reading fictional early days. Separately: fit `INITIAL_DRY_MASS_G` and ε jointly against cohort D on measured light (B1) and check whether 0.85 survives.
- **Cost if real:** low-medium — internal honesty and chart truthfulness, not a greenhouse action. `Guillaume call needed:` does any team-facing surface show a nursery weight before ~day 12 (the 0.13 g fresh at day 1)? If yes it should not.

### Complexity

**C1 — three-entry `NURSERY_DLI_CEILING_BY_WEEK` whose top entry is above every DLI the site is known to deliver** · `PENDING`
- **Specialist added:** wk3+ = 25, deliberately above the `light/domain.md` band, from a measured 23.3 bench DLI.
- **Test:** changes a team action vs omitting? No. Nothing operational reads the ceiling; it only sets a model number. And as a *cap* the entry is inert — 25 exceeds the measured 23.3 and `DLI_TARGET` 17, so it can never bind. It changes predictions only because the `min()` was removed (B1), i.e. because it stopped being a ceiling.
- **MVP version:** with `min(benchDli, ceiling)` restored, set wk3+ to the measured value it came from (23.3) or leave the band top and let bench light bind. The extra 1.7 mol above the only measurement has no basis at all.
- **Why it might stay:** if the intent is genuinely "wk3+ tissue saturates nowhere near Décembre's light", a deliberately non-binding entry documents that — but then say so, and don't let it drive.

### Cert defense

**D1 — "a Décembre 50-cell converted a measured 23.3 mol/m²/j bench DLI in week 4 without tipburn" as basis for wk3+ = 25 (implicit cert 2)** · `PENDING`
- **Specialist's defense:** measured bench DLI, real cohort, no tipburn observed.
- **What I'd need to accept cert ≥ 2:** absence of tipburn shows the tissue *tolerated* 23.3; it does not show the tissue *used* it — and the same cohort is the one the file says the engine over-predicts at day 19 and that sits at the wall of its own energy balance. "Converted" is the load-bearing word and it is exactly what is unmeasured. I would want either a shade-vs-full comparison in wk3+ or the light-response inference redone once plug DM is measured.
- **My read:** cert **1** for "usable DLI is ≥ 23", and no support at all for 25 as distinct from 23.3. Tolerance-without-tipburn is a ceiling *floor*, not a saturation point.

**D2 — "the balance only becomes physical near 0.045–0.05" for `PLUG_DRY_MATTER_FRACTION` (stated as the leading suspect)** · `PENDING`
- **Specialist's defense:** per-cell energy balance at 23.3 DLI caps fresh gain at 1.119 g/day; observed 1.114; therefore DM must be lower.
- **What I'd need to accept it:** the inference is only as good as the 9.2 g datum (B2) and the 0.65 transmission and 0.45 PAR-fraction assumptions stacked in the 23.3 (both flagged in the file, then used as if firm). Three assumptions in series produce a 99.6%-of-ceiling coincidence — that pattern usually means an input is wrong, not that the system is miraculously at its limit. Order the suspects by cost-to-test, not by suspicion: mean-vs-representative weight (one sampling session) before plug DM (oven + scale) before transmission (pyranometer inside).
- **My read:** hold. Correctly listed as unmeasured with a refit trigger, so nothing to downgrade — but do not refit DM off this arithmetic until B2 is closed.

### Verdict
Land the day-axis rebase and the withdrawn `NURSERY_STRESS_RUE` justification — both are strict honesty gains, and retiring an assumed lag for a fitted level on the observation axis is the right trade. Hold the wk3+ 25 change pending B1: removing `min(DLI_TARGET, ceiling)` deleted the nursery's only light input, and the ε-is-too-high conclusion the Validation section reaches may be an artifact of driving cohort C at 25 when it ran at ~17. B2 gates the plug-DM refit. Next step: Guillaume call on B1 (is a per-cohort nursery bench DLI worth wiring from `light/`?) and on B3's chart question; specialist response on C1/D1. · `PENDING`

## 2026-07-26 — review of yield-range/domain/derivation.md (working-tree diff: sowing rebase, `INITIAL_DRY_MASS_G`, wk3+ ceiling 25, cohort C/D validation)

Scope: `SPECIFIC_LEAF_AREA` justification, new `INITIAL_DRY_MASS_G`, `NURSERY_STRESS_RUE` anchor withdrawn, Validation section rewritten around cohorts C/D, new **Day axis** block, wk3+ ceiling 10/14/17 → 10/14/25. Arithmetic re-checked and clean: 0.1525/50 = 30.5 cm²; ×23.3 = 0.0712 mol/d; ×1.1/0.07 = 1.119 g fresh/d; cohort D d19→d26 = 1.114 g/d; 17.47 MJ × 0.45 × 4.57 = 35.9; ×0.65 = 23.3. `nurseryLightCeiling` index for day 10 = 1 ✓.

### Blindspots

**B1 — the **Day axis** block describes a germination lag that does not exist in the code, and contradicts both `spec.md` and the paragraph three sections above it** · `PENDING`
- **What the spec assumes:** "`GERMINATION_LAG_DAYS = 3`, assumed… Growth starts at day 1 + lag; the DLI ceiling steps on *tissue* age, `day − 1 − lag`."
- **What might be ignored:** `grep GERMINATION_LAG` returns zero hits in `data.js` / `calc.js` / `seedling-thinning.js` — only docs, `learnings/nursery-dli-ceiling-by-stage.md` and the changelog. `nurseryLightCeiling(dayFromSowing)` steps on `Math.floor((day − 1) / 7)`; `calc.js` integrates from day 1 with no gate. `spec.md` line 56 states the opposite of the derivation: "no emergence delay is represented anywhere. The nursery DLI ceiling steps on `day − 1`". The same derivation section that asserts the lag then says wk3+ "arrives on day 15 instead of day 18" — day 15 is the *no-lag* answer; with a 3-day lag it is day 18. So the file argues both axes within one section, and the lag appears to have been reverted in code without the doc following. The SLA paragraph inherits it: day 10 → age 9 → index [1] is only true on the *no-lag* axis, yet the text credits "the sowing rebase" with a lag in it.
- **How to test it:** decide which axis ships, then read it off `calc.js` once: either `GERMINATION_LAG_DAYS` exists and gates growth, or the Day-axis block and the `learnings` line drop the term. No greenhouse test needed — this is doc-vs-code.
- **Cost if real:** medium. No prediction moves today (code has no lag), but every band index, the "widened 1.06× → 1.34×" narrative, and the operator meaning of `nurseryDays` are read off the axis. The specialist's own note to team-leader warns stored "nursery days" inputs shifted by the lag — if the lag isn't in the code, that warning is false and a UI change made on it would introduce the error it was meant to prevent.

**B2 — cohort D is n = 1 per week, judgment-picked, at the scale floor; the derivation reasons off it to 2–3 significant figures** · `PENDING`
- **What the spec assumes:** the table's 0.98× / 1.34× / 0.66× ratios, `INITIAL_DRY_MASS_G = 0.009` fitted to two figures, and "no choice of day-1 mass fixes day 19" (with 0.0063 g computed as the alternative).
- **What might be ignored:** `doc/data-points.md` says one plant per week, chosen as "most **representative**", stress severity not decomposed. That is a single judgment-selected draw, not a mean — its sampling spread on a 50-cell stressed tray plausibly rivals the 1.34× "over-prediction" being diagnosed. The day-12 datum is explicitly *at* the scale floor with ±20% on resolution alone, so "reproduces the level to within 2%" is precision the datum cannot carry, and it is the sole constraint on `INITIAL_DRY_MASS_G`. The file flags the ±20% then reasons past it.
- **How to test it:** next cohort, weigh **5–10 plants per sample day** and record mean + range; the shape claim (over at d19, short at d26) either survives the spread or dissolves. Cheap, no new equipment.
- **Cost if real:** medium — a fitted constant and a "the gap is in the shape, not the level" conclusion both rest on three single-plant draws; a spurious shape diagnosis is what would send `PLUG_DRY_MATTER_FRACTION` or ε chasing noise.

**B3 — the measured-light week is days 19–26, outside the greenhouse, total shortwave, no LED — and it is used to justify a ceiling that bites from day 15 and to validate a 26-day curve** · `PENDING`
- **What the spec assumes:** 23.3 mol/m²/d on the bench justifies wk3+ ceiling 25 and drives every nursery day from 15 on; the engine "had been driving the nursery at 17".
- **What might be ignored:** four separate extrapolations stack — (1) one week's sky applied to days 1–18, never measured; (2) an *outdoor* sensor plus an assumed 0.65 transmission standing in for a bench reading, when a quantum sensor **on the bench** is the direct measurement; (3) total shortwave × assumed 0.45 PAR fraction, when the July diffuse/direct mix moves that fraction; (4) that week ran **no LED**, so it cannot test whether the plug tolerates 25 — it tests 23.3, and Décembre's lettuce normally runs supplemental light on top. Raising the ceiling to 25 on this basis also *worsens* the d19 fit (1.06× → 1.34×) while leaving d26 short, which is the signal that light was not the binding term.
- **How to test it:** one quantum (PAR) sensor logging on the seedling bench for a full cohort — removes 0.65, 0.45 and the outdoor siting in one measurement, and covers days 1–18.
- **Cost if real:** medium-high — the ceiling raise is the one behaviour-moving change in this diff (transplant 13.7 → 16.4 g, and it broke a senescence test); if 23.3 is really ~18–20 on the bench, the raise partly encoded a sensor-conversion error as plant physiology.

**B4 — the energy-balance candidate list omits the cheapest test and the sampling explanation** · `PENDING`
- **What the spec assumes:** three ranked candidates for the impossible d19→d26 gain — plug DM 0.07, stand patchiness, 0.65 transmission.
- **What might be ignored:** (a) `PLUG_DRY_MATTER_FRACTION` is named as suspect #1 and "the balance only becomes physical near 0.045–0.05", yet the resolving measurement — oven-dry one tray of plugs, a one-day job with a scale and an oven — is written only as a refit trigger, never as the next action; (b) a fourth candidate is missing: the 9.2 g draw itself (B2) — one representative-picked plant needs no physics to be 30% high; (c) a fifth: bench-edge and lateral light, since a plant does not intercept only its own 30.5 cm² footprint on an open bench, which is the same geometric leak as patchiness but present even in a full tray.
- **How to test it:** oven-dry plug DM first (it is the ranked #1 *and* the cheapest), then re-run the balance before touching ε.
- **Cost if real:** low on the model, medium on sequencing — the file leaves the balance "unresolved" while the resolving measurement is a day of work.

### Complexity

**C1 — `GERMINATION_LAG_DAYS = 3`** · `PENDING`
- **Specialist added:** an assumed, unanchored constant plus a second age axis (tissue age vs sowing age) threaded through the ceiling lookup.
- **Test:** changes a team action? No. Nobody sows to a lag; the operator picks nursery days. And it is not in the code, so it currently changes nothing at all (B1).
- **MVP version:** drop the constant and the tissue-age axis; keep one axis (sowing, day 1 = sowing) and let `INITIAL_DRY_MASS_G` absorb emergence — which the file already says is its job ("as a level, not an offset"). Two mechanisms for one phenomenon.
- **Why it might stay:** if a cohort ever logs its germination date, a lag becomes measurable and the ceiling-by-tissue-age reading is the physiologically right one. Until then it is an assumed constant defended by another assumed constant.

### Cert defense

**D1 — "wk3+ plug **25**, deliberately above the band: a Décembre 50-cell converted a measured 23.3 mol/m²/j bench DLI in week 4 without tipburn" (stated as measured)** · `PENDING`
- **Specialist's defense:** measured pyranometer week + observed absence of tipburn + the growth actually recorded.
- **What I'd need to accept cert ≥ 3:** a bench-sited PAR reading (not outdoor × 0.65 × 0.45), and an argument that does not run in a circle — the same Validation section proves that the observed d19→d26 gain is **impossible** on 23.3 mol/m²/d at clean ε, i.e. the growth used to prove the plug "converted" 23.3 cannot have come from 23.3. One of the two claims must give. "No tipburn" is also absence-of-symptom, not conversion; a plug can sit under 23 without injury and still not use it.
- **My read:** the *value* 25 may well be right, but cert should be **1**, not the "measured" framing. Downward trigger missing per [[symmetric-refinement-triggers]]: state what would send it back toward 17 (bench PAR ≤ 20, or plug DM measuring 0.045–0.05 and closing the balance without extra light).

**D2 — `NURSERY_STRESS_RUE = 0.85` kept at "the number it was fitted to" after its anchor is withdrawn (stated cert 1)** · `PENDING`
- **Specialist's defense:** cert 1, explicitly unanchored, "deliberately not refit"; the pH/EC-stress ε in `domain.md` lands near 0.85 independently.
- **What I'd need to accept cert ≥ 1:** nothing — cert 1 is honest, and holding still while plug DM is a guess is the right call per [[refit-not-relabel]] read in reverse (don't refit onto a datum that can't calibrate). Two gaps remain: (a) the file argues in three places that 0.85 is *too high* yet the constant carries no downward refinement trigger, and `spec.md` line 80 states the kept-value fact without the "probably too high" read that the derivation reaches — the honest conclusion should travel to the spec; (b) "falls out near the domain's documented pH/EC-stress ε, reused for heat/drought" is a coincidence being used as corroboration — a drought+heat ε and a salinity ε agreeing to two figures is not evidence, and once the fitting basis is withdrawn that sentence is the only support left standing.
- **My read:** cert 1 fine. Ask the specialist to add the downward trigger and drop the pH/EC coincidence as corroboration.

### Verdict
Land after B1 — the file currently ships two mutually exclusive day axes and neither matches `calc.js`, which also makes the specialist's team-leader note about shifted `nurseryDays` inputs wrong. B3/D1 are one question (bench PAR sensor) and gate the only behaviour-moving change in the diff; B2/B4 both say the same thing — measure plug DM and sample more than one plant before any further refit. No dose or greenhouse action is blocked. · `PENDING`

## 2026-07-26 — review of yield-range/domain/derivation.md HEAD (working tree)

Scope: `INITIAL_DRY_MASS_G` introduced (fitted); `NURSERY_STRESS_RUE` anchor withdrawn, value kept; wk3+ DLI ceiling 17 → 25; Validation section rewritten around cohorts C/D + a per-cell energy balance; new "Day axis" paragraph. Reproduced the validation table against `calc.js` — 0.49 / 1.88 / 6.10 stressed and 0.71 / 3.44 / 8.34 clean all match exactly. Arithmetic is honest.

### Blindspots

**B1 — the "Day axis" paragraph describes a germination lag that exists nowhere in the model** · `PENDING`
- **What the spec assumes:** derivation states `GERMINATION_LAG_DAYS = 3` (assumed), growth starting at day 1 + lag, and the DLI ceiling stepping on tissue age `day − 1 − lag`.
- **What might be ignored:** `grep GERMINATION_LAG` over `yield-range/domain/` hits only `learnings/nursery-dli-ceiling-by-stage.md`. `data.js` has no such constant; `nurseryLightCeiling` steps on `Math.floor((day − 1) / 7)` — sowing age, no lag. `calc.js` integrates from day 1 unconditionally. `spec.md` § Assumptions says so explicitly: "no emergence delay is represented anywhere". The same derivation contradicts itself two screens up: the `SPECIFIC_LEAF_AREA` paragraph says day 10 → sowing-week 2 → index `[1]`, which is only true *without* a lag; under the lag the paragraph itself describes, day 10 → tissue age 6 → index 0 → ceiling 10, i.e. the exact defect it claims the rebase repaired. The validation table I reran matches the no-lag code, so the code is right and the prose is stale.
- **How to test it:** already tested — recompute done above. Decide which axis is intended, then make derivation, `spec.md`, `learnings/nursery-dli-ceiling-by-stage.md` line 24 and `data.js` say one thing.
- **Cost if real:** medium — no greenhouse action moves today, but every reader recomputing SLA or the ceiling steps off this file gets a 3-day offset, and the specialist's own mailbox note tells the team that stored `nurseryDays` inputs "shift by the lag in meaning". They don't.

**B2 — `INITIAL_DRY_MASS_G` is fitted to the single weakest observation in the register, then the same cohort is presented as validation** · `PENDING`
- **What the spec assumes:** 0.009 g back-solved so the stressed engine hits cohort D day 12 = 0.5 g (0.98×), quoted to two significant figures.
- **What might be ignored:** that datum is n = 1, a destructively sampled "representative" plant, sitting on the ±20% scale floor (`doc/data-points.md` flags it), with cell occupancy unrecorded. The derivation says so and fits it anyway. The table then reports 0.98× at day 12 as agreement — it is the fit residual, not evidence. Only days 19 and 26 are independent, and both miss (1.34×, 0.66×). Stated plainly: the engine currently reproduces zero independent weights, and the "within 2%" line reads stronger than that.
- **How to test it:** weigh 10 plugs at day 12 on a 0.01 g scale (pooled if needed) and refit; or drop the day-12 fit and fit the level to the day-19 / day-26 pair, reporting day 12 as the free check.
- **Cost if real:** low-medium — the level is the least consequential parameter for harvest weight, but it launders one soft datum into a validation claim.

**B3 — the wk3+ ceiling is set above the only observation supporting it, on an absence-of-symptom argument** · `PENDING`
- **What the spec assumes:** wk3+ = 25 mol/m²/j, "deliberately above the band", because a Décembre 50-cell converted a measured 23.3 bench DLI in week 4 without tipburn.
- **What might be ignored:** three gaps. (1) 23.3 does not support 25 — the ceiling is extrapolated ~7% past the only measurement. (2) 23.3 is itself two assumed coefficients deep (0.45 PAR fraction, 0.65 poly transmission), both flagged as assumptions in the same paragraph; a transmission of 0.55 puts the bench at 19.7 and the ceiling back inside the `light/domain.md` band. (3) "no tipburn" shows the plug was not *injured* at 23.3; the ceiling claims the plug *converted* it to growth. Cohort D says the opposite — the raised ceiling is what widened the day-19 over-prediction from 1.06× to 1.34×, i.e. the engine now grows the mid-nursery plug faster than the tray actually did under that light.
- **How to test it:** pyranometer or quantum sensor at bench height under the poly (measures transmission directly, removes coefficient 3); and a paired-tray week-3 dry-weight at two DLIs.
- **Cost if real:** medium — the ceiling drives transplant weight, which propagates through the whole field curve and the kg/month headline.

**B4 — the energy balance names `PLUG_DRY_MATTER_FRACTION = 0.07` as chief suspect, and that constant is upstream of the fit that is presented as working** · `PENDING`
- **What the spec assumes:** per-cell balance is only physical near DM 0.045–0.05; 0.07 stays live pending measurement.
- **What might be ignored:** every fresh-weight number in the validation table divides dry mass by 0.07, and `INITIAL_DRY_MASS_G` was back-solved through it. If DM is really ~0.05, the day-12 fit, the day-19 residual and the 0.009 g level all move together — so the "shape, not level" conclusion is conditional on the constant the same section calls least trustworthy. The section reads as if the suspects are independent of the fit; they aren't.
- **How to test it:** oven-dry 10 plugs at day 19 (shoot only, 65 °C to constant weight). One measurement collapses B2 and B4 and re-grounds the energy balance.
- **Cost if real:** medium — a 0.07 → 0.05 move changes predicted plug fresh weight ~40%, which is a transplant-timing decision.

### Complexity

**C1 — one phenomenon, two knobs** · `PENDING`
- **Specialist added:** `INITIAL_DRY_MASS_G` (fitted, "the one constant that absorbs emergence") plus, in prose, a 3-day germination lag (assumed, no cohort logged a germination date).
- **Test:** does the pair change a team action? No — both only shift where the curve starts, and with one weighed point near emergence they are not separately identifiable. The lag is not even in the code (B1).
- **MVP version:** keep the fitted level, delete the lag from the prose and from `learnings/nursery-dli-ceiling-by-stage.md`. One knob, one datum.
- **Why it might stay:** if a cohort ever logs its germination date, the lag becomes measured and the level becomes physical (~1 mg seed). That is a refinement trigger, not a reason to carry an assumed constant now.

### Cert defense

**D1 — wk3+ ceiling = 25 (implied cert 2, "measured")** · `PENDING`
- **Specialist's defense:** measured bench DLI 23.3, converted without tipburn, July, no LED.
- **What I'd need to accept cert ≥ 2:** a direct bench-level PAR measurement (not sun-J converted through two assumed coefficients), plus one paired-DLI week-3 dry weight showing the extra light actually became mass.
- **My read:** cert should be **1** at 25. The value the observation supports is at most 23.3, and only if both coefficients hold.

**D2 — `NURSERY_STRESS_RUE = 0.85` retained after its anchor was withdrawn (stated cert 1)** · `PENDING`
- **Specialist's defense:** cert honestly dropped, value "kept at the number it was fitted to before the wk3+ ceiling moved", with the too-high evidence written up in the same file.
- **What I'd need to accept ≥ 1:** nothing — cert 1 is right. The objection is the retention, not the label. This is [[refit-not-relabel]] with the sign flipped: a value fitted under retired conditions (DLI 17) is being carried forward under new ones (ceiling 25), while the file itself argues it is too high — the stressed mean-plant engine now returns 5.34 g against a 5 g *biggest*-plant observation, directionally impossible. "A recorded datum is not an anchor" is correct and does not license keeping the number that datum produced.
- **My read:** the value is unsupported in either direction. `Guillaume call needed:` refit after the plug dry-matter measurement (B4) lands, or drop `nurseryStress` from the engine until there is a clean-vs-stressed pair to fit — currently the flag switches between two unanchored numbers.

### Verdict
Land after addressing B1 — the file asserts a model axis the code does not implement and the sibling `spec.md` explicitly denies; that is live self-contradiction, not a nuance. B3/D1 (ceiling above its own evidence) and D2 (value kept past its conditions) are the two that move harvest predictions. B2/B4/C1 all collapse onto one bench action: oven-dry ten plugs. Arithmetic and the honesty of the Validation rewrite are not in question. · `PENDING`

## 2026-07-26 — review of yield-range/domain/derivation.md (HEAD → working tree, 175+/29−)

Scope: `NURSERY_DLI_CEILING_BY_WEEK` wk3+ 17 → **25**; new `INITIAL_DRY_MASS_G = 0.009` (fitted); `NURSERY_STRESS_RUE` justification withdrawn (value kept, now unanchored); day axis restated as sowing-based with no germination lag; Validation rewritten around cohorts C/D + a per-cell energy balance. Verified against `data.js` / `calc.js`: no `GERMINATION_LAG_DAYS` in code, `nurseryLightCeiling` steps on `floor((day−1)/7)`, `SPECIFIC_LEAF_AREA` derived at index `[1]` = 14 — derivation, sibling `spec.md` and code now agree on the axis. Arithmetic spot-checked: 30.5 cm² × 23.3 mol → 0.0712 mol/d; × 1.1 / 0.07 = 1.12 g fresh/d ✓.

### Blindspots

**B1 — the whole "shape gap" (and the call to move `PLUG_DRY_MATTER_FRACTION` to 0.045–0.05) rests on three n=1 destructive samples on a reconstructed day axis** · `PENDING`
- **What the spec assumes:** cohort D's 0.5 / 1.4 / 9.2 g at days 12 / 19 / 26 are a trajectory, tight enough to declare "the gap is in the shape, not the level" and to rank `PLUG_DRY_MATTER_FRACTION` as suspect #1 via a 1.114 vs 1.119 g/day energy-balance coincidence quoted to four figures.
- **What might be ignored:** `doc/data-points.md` states each row is one plant, a different individual each week, hand-picked as "most representative", cell occupancy unrecorded, and **cohort D's germination/sowing date not logged — its day axis is reconstructed**. One plant picked low at day 19 or high at day 26, or a 2–3 day error in the reconstructed labels, reproduces the entire "impossible" 1.114 g/day and dissolves the shape gap. A file whose central claim this week is axis exactness is drawing a physical impossibility off the one cohort with no sowing date.
- **How to test it:** cohort E has a real sowing date — weigh n ≥ 5 per timepoint at days 12/19/26 there before any constant moves. Cheaper interim: state the ±band from n=1 sampling next to the table and drop the four-figure comparison to three.
- **Cost if real:** high — suspect-#1 status is already steering a `PLUG_DRY_MATTER_FRACTION` refit, which propagates into `INITIAL_DRY_MASS_G`, the stressed ε and every kg/month figure.

**B2 — "plug DM only becomes physical near 0.045–0.05" contradicts the stage-specific-DM argument three sections above it** · `PENDING`
- **What the spec assumes:** the energy balance is a hard constraint, so `PLUG_DRY_MATTER_FRACTION` 0.07 must come down toward 0.045–0.05 to make cohort D's day-19→26 gain physical.
- **What might be ignored:** 0.045 **is** `DRY_MATTER_FRACTION`, the hydrated field head, and the same file argues at length that the plug is *firmer and drier* than a field head — that DM steps **up** at transplant is the rehydration gain the field prediction depends on. Pushing plug DM to field DM erases that step and, with it, the derivation's own justification for two DM values. Suspect #1 is the one candidate whose fix breaks a defended structure; candidates #2 (stand patchiness) and #3 (0.65 transmission) do not, and a fourth — sampling noise (B1) — is missing from the list entirely.
- **How to test it:** oven-dry a cohort E plug (the pending tissue weight already asks for it). If plug DM measures ≥ 0.065, the balance is not closed by DM and the ranking is wrong.
- **Cost if real:** medium — misdirects the next measurement round and the refit order.

**B3 — the ceiling was raised to 25 on the strength of a light number the same section lists as suspect, from a drought-stressed cohort, and 25 exceeds the only measurement** · `PENDING`
- **What the spec assumes:** wk3+ 25 mol, deliberately above the `light/domain.md` band, because a Décembre 50-cell "converted a measured 23.3 mol/m²/j bench DLI in week 4 without tipburn".
- **What might be ignored:** three separate gaps. (i) 23.3 supports a ceiling of ≥ 23.3, not 25 — 25 is 1.07× past the datum with no stated basis for the rounding. (ii) 23.3 is derived through an assumed 0.45 PAR fraction and an assumed 0.65 transmission, and 0.65 appears as suspect #3 in the energy balance on the same page: the constant justifying the change is on the file's own doubt list. (iii) "no tipburn" comes from a drought+heat cohort growing at ~0.66× the engine's rate — a stressed plant with suppressed growth is the weakest possible witness that light was non-saturating; absence of tipburn under drought shows tolerance, not conversion. The file's own Validation then reports the change made day 19 **worse** (1.06× → 1.34×), and cohort E shows 2–4 true leaves at day 17, i.e. not obviously a hardened plug on day 15.
- **How to test it:** hold 25 from day 22 instead of day 15 and recheck days 19 and 26 together; independently, one clean-watered cohort at bench DLI with a tipburn/leaf-count read between days 15 and 21 (the refinement trigger already written).
- **Cost if real:** medium — nursery-phase weight and transplant size only; field predictions drive on `DLI_TARGET` and do not move.

**B4 — the day-19 widening is absorbed as "the honest price of reading the bands on sowing age" rather than treated as a live disconfirmation** · `PENDING`
- **What the spec assumes:** the 1.34× day-19 over-prediction is an accepted cost of the axis choice; no refinement trigger attaches to it.
- **What might be ignored:** the axis and the ceiling-onset day are separable. The over-prediction arrives specifically because 25 mol now starts on day 15, which is the *other* change in this same diff — so the error is attributable to the ceiling value/onset, not to the sowing axis, and calling it an axis price closes an open question. Every other weak point in the file carries a trigger; this one does not.
- **How to test it:** the same day-15-vs-day-22 onset sweep as B3; whichever setting improves day 19 without breaking day 26 is the answer, and cohort E's true-leaf count at day 17 is a cheap prior.
- **Cost if real:** low-medium — a wrong nursery mid-curve mis-sizes transplant weight and the thinning-day recommendation.

### Complexity

**C1 — the Day-axis section spends ~50 lines proving the model has no germination lag** · `PENDING`
- **Specialist added:** "`INITIAL_DRY_MASS_G` is a calibrated level, not a lag in disguise" with three sub-proofs, a costs list, and a rejected-alternatives block naming four ways the lag could sneak back.
- **Test:** changes a team action vs. omitting? No — and it does not change a model value either. `calc.js` has no lag constant and no day-axis branch, which one sentence states.
- **MVP version:** keep the axis definition, the three numeric consequences of the rebase, and the honest "day 1–12 of every chart is not biology" cost. Move the not-a-lag-in-disguise defense and the four rejected re-entry routes to `learnings/` — that is what the learnings dir is for, and the retired-lag comparison numbers (0.015 g / lag-3 outputs) are already history.
- **Why it might stay:** the reversal is one day old and the temptation to re-add an offset is real; a short pointer to a learnings note carries that warning at a tenth the length.

**C2 — `NURSERY_STRESS_RUE` now has a withdrawn justification, a kept value, and a cert** · `PENDING`
- **Specialist added:** 0.85 retained at the number it was fitted to under the retired DLI-17 ceiling, justification explicitly withdrawn, cert 1, with the file arguing in two places that it is now too high.
- **Test:** changes a team action? No. But it is a constant the file itself says is wrong in a known direction, held pending an unrelated measurement.
- **MVP version:** no cut proposed — this is the right call while plug DM is unmeasured. The gap is that "keep it" is stated as a decision without the guard: add the downward refinement trigger explicitly (per `symmetric-refinement-triggers` the retention needs both directions), and drop the coincidence that 0.85 equals the documented pH/EC-stress ε from the defense — two unrelated stressors landing on one number is not corroboration.
- **Why it might stay:** refitting one unanchored constant against another unmeasured one moves the error around; deferring is correct.

### Cert defense

**D1 — "35.9 is 62% of `CLEAR_DAY_MAXIMUM_DLI_BY_MONTH[6]` = 58 … the first site support for that cert-2 constant"** · `PENDING`
- **Specialist's defense:** a measured pyranometer total, converted, lands between the `partly` and `clear` sky factors — plausible for a July week, so the clear-day constant is supported.
- **What I'd need to accept it as support:** a *clear-day* reading, not a 7-day mean. Any value between ~40% and ~100% of 58 is "consistent" with an unrecorded week of mixed sky, so the test cannot fail and therefore confirms nothing. The conversion also runs through the assumed 0.45 PAR fraction, and the sky-condition factors it is being checked against were themselves never measured at Décembre.
- **My read:** delete "first site support" or downgrade to "not inconsistent with". Keep the 35.9 / 23.3 derivation itself — that part is clean arithmetic with its assumptions labelled. `Guillaume call needed:` was the pyranometer week logged with daily totals? A single clear-day peak out of that dataset would turn this into real support.

**D2 — cohort C read as "the strongest evidence that `NURSERY_STRESS_RUE` is too high" (engine 5.34 g vs 5 g biggest)** · `PENDING`
- **Specialist's defense:** a mean-plant engine returning 1.07× a biggest-plant observation is directionally wrong, so ε is too high.
- **What I'd need to accept it:** the direction is right and the reasoning is sound, but "strongest" over-ranks it — cohort C's DLI is assumed, its day axis reconstructed, its tray mortality-thinned (unmodelled extra ground area per survivor, which pushes the engine *low*, not high), and 5 g is one plant. The genuinely stronger signal is on the same page: canopy cover ~10% modelled vs ~25% observed at day 10, an independent measurement channel that agrees on the direction.
- **My read:** claim holds, the superlative doesn't. Lead the ε-too-high case with the cover mismatch and cite cohort C as consistent.

### Verdict
Land after addressing B1 and B3 — the diff's two headline moves each rest on a single unreplicated reading (`23.3` for the ceiling, n=1 cohort D for the shape gap), and B2 shows the top-ranked fix would break the stage-specific-DM structure the field prediction depends on. Nothing here blocks a greenhouse action; the model is admitted-unanchored throughout and the file is unusually honest about it. Next step: cohort E weights + a dried plug, which settle B1, B2 and B3 at once. · `PENDING`

## 2026-07-26 — review of yield-range/domain/derivation.md HEAD (working tree)

Scope: new `INITIAL_DRY_MASS_G = 0.009` (fitted); `NURSERY_STRESS_RUE` justification withdrawn, value kept; `SPECIFIC_LEAF_AREA` band-index rationale repaired; Validation section rewritten around cohorts C/D (measured light, per-cell energy balance); new **Day axis** section (sowing = day 1, no germination lag); wk3+ DLI ceiling 17 → 25; two new refinement triggers.

The file is unusually self-critical — most of what a challenger would say about ε 0.85 and the shape gap, the specialist already says. Findings below are what it does *not* say.

### Blindspots

**B1 — the whole energy-balance verdict rests on cohort D's tray location, which is not recorded** · `PENDING`
- **What the spec assumes:** the pyranometer's 35.9 mol/m²/d outside × `GH_LIGHT_TRANSMISSION_DOUBLE_POLY` 0.65 = 23.3 on the bench, and cohort D's observed 1.114 g/day is then 99.6% of the per-cell ceiling — "the hard constraint" that makes `PLUG_DRY_MATTER_FRACTION` suspect #1 and puts 0.045–0.05 on the table.
- **What might be ignored:** `doc/data-points.md` records the pyranometer as sited **outside**, and nowhere states cohort D was **inside**. The one cohort in that file with a stated location (E, same month, same operator, same walk-around) is "three trays on the **outdoor bench**". If cohort D also sat outdoors, the 0.65 factor must not be applied at all: usable DLI is ~35.9, the per-cell ceiling rises ~1.54×, and 9.2 g at day 26 stops violating anything. The entire suspicion list — including a proposed near-halving of an unmeasured DM constant — is downstream of one unrecorded fact. Cost is asymmetric: applying 0.65 to an outdoor tray manufactures an impossibility, then refits real constants to explain it.
- **How to test it:** ask where cohort D's tray physically sat during days 19–26; log it in `data-points.md` as part of the cohort key. Recompute the balance at 35.9 before touching `PLUG_DRY_MATTER_FRACTION`. `Guillaume call needed:` was the weekly-sampled 50-cell tray inside the greenhouse or on the outdoor bench in July?
- **Cost if real:** high — it is the argument currently pointing at a DM refit and at "transmission" as suspect #3.

**B2 — wk3+ = 25 is justified by the same 9.2 g the file calls energetically impossible** · `PENDING`
- **What the spec assumes:** "a Décembre 50-cell converted a measured 23.3 mol/m²/j bench DLI in week 4 without tipburn" — the site support for stepping the ceiling above the `light/domain.md` band.
- **What might be ignored:** three separate gaps in one sentence. (a) 23.3 is not measured — it is 17.47 MJ/m²/d × two assumed coefficients × an assumed transmission (see B1); the *measured* number is the outdoor total. (b) "Converted it" is cohort D's day-19→26 gain, which the Validation section three paragraphs earlier argues no ε can produce on that light — the growth used as evidence of tolerance is the growth the file calls unreproducible. Either the light is higher (B1) or the weight is off; on neither reading does "converted 23.3" hold as stated. (c) "Without tipburn": no tipburn observation is logged for cohort D at all — `data-points.md` records leaf quality only for cohorts A, F/G and the field cut. Absence of record is being read as absence of symptom.
- **How to test it:** state the ceiling's basis as the *outdoor* measurement plus a location fact (B1), and log an explicit tipburn read (present/absent) on the next weekly sample so the tolerance claim has a datum rather than a silence.
- **Cost if real:** medium — 25 vs 17 lands mid-nursery and moves transplant weight (13.7 → 16.4 g), which is what pushed the field peak d51 → d56 and broke `senescence-past-closure`.

**B3 — `INITIAL_DRY_MASS_G` and `NURSERY_STRESS_RUE` are two free parameters fitted through one datum, so the 0.98× agreement validates nothing** · `PENDING`
- **What the spec assumes:** day-1 mass is back-solved so the stressed engine hits cohort D day 12 (0.49 vs 0.5 g, "to within 2%"), presented as the point the constant is fitted to; ε 0.85 is separately described as unanchored and probably too high.
- **What might be ignored:** with ε floating, (ε, day-1 mass) is a one-dimensional family through that single point — the 2% is arithmetic identity, not fit quality, and reads to a future reader as corroboration. Worse, the level is fitted **through the stressed engine**, so it is regime-contaminated: the clean-ε column in the same table starts from a day-1 mass calibrated under drought+heat, which is why clean reads 1.42× at day 12. A seed's dry mass is not a function of the stress regime. And the fit rests on n = 1 at the scale floor (±20% on resolution alone, per `data-points.md`) — the ±20% is acknowledged for the datum but not propagated: at 0.4–0.6 g the admissible day-1 mass spans roughly 0.007–0.011, so two significant figures overstates it.
- **How to test it:** fit day-1 mass under **clean** ε (it is the regime-independent quantity) and let the stressed column miss; or state plainly that it is a one-parameter shim carrying the ε error, not an independent level. Either way quote it to one significant figure with the band.
- **Cost if real:** medium — every clean-nursery prediction (the default, `nurseryStress: false`) inherits a level fitted to a droughted tray.

**B4 — `SPECIFIC_LEAF_AREA` is derived at clean ε but anchored to a stressed cohort's day-10 stage** · `PENDING`
- **What the spec assumes:** SLA is set so the small-LAI limit equals exactly `GROWTH_RGR·W` at the day-10 anchor's stage; `data.js:138` divides by `RADIATION_USE_EFFICIENCY` (1.1).
- **What might be ignored:** the day-10 stage is *nursery*, and every Décembre nursery cohort is stressed. Under ε 0.85 the exactness the bullet claims does not hold — the early rate is 0.77 × `GROWTH_RGR`. The rewritten bullet carefully repairs the band-index mismatch while leaving the ε mismatch in the same expression unmentioned.
- **How to test it:** pick the regime the derivation intends and say which; if the intent is clean, note that the identity is a clean-engine property and does not describe any observed cohort.
- **Cost if real:** low — internal-consistency and reader-trust, not a dose.

### Complexity

**C1 — the Day-axis section spends ~40 lines proving a negative** · `PENDING`
- **Specialist added:** three sub-arguments that `INITIAL_DRY_MASS_G` is "not a lag in disguise", a costs list, and a Rejected block enumerating four ways someone might smuggle the lag back.
- **Test:** changes a team action? No. Changes a *future editor's* action? Partly — the "no boundary off a multiple of seven" rule is a real guardrail worth one line.
- **MVP version:** keep the axis definition, the one-line guardrail, and the honest "first ~5 days are not biology" caveat. Drop the three-way proof and the piecewise-exponential argument — the retired lag is in git, and the file is arguing with a reader who is not there.
- **Why it might stay:** the axis was rebased once already this week and every day number in code/tests/charts depends on it; over-documenting a just-moved axis is cheap insurance. Weak but real.

**C2 — `INITIAL_DRY_MASS_G` is a hand-fitted literal with a five-constant refit trigger** · `PENDING`
- **Specialist added:** a literal `0.009` in `data.js` plus a trigger row saying re-solve it whenever `GROWTH_RGR`, either ε, the ceiling bands, `SPECIFIC_LEAF_AREA` or `PLUG_DRY_MATTER_FRACTION` moves — "in the same edit, or the fit rots".
- **Test:** the file predicts its own rot and asks a human to prevent it, in a codebase where `SPECIFIC_LEAF_AREA` is already **derived, not free** (`data.js:138`) for exactly this reason.
- **MVP version:** same treatment — derive it by back-solving the day-12 target in code so it cannot go stale, or accept it as a coarse one-sig-fig level (B3) that nobody needs to refit.
- **Why it might stay:** a back-solve needs the target datum in `data.js`, which puts an observation into a constants file. Flag only — I don't author.

### Cert defense

**D1 — "the 10/14/25 steps are band-tops, cert 2 from the light domain" (stated cert 2)** · `PENDING`
- **Specialist's defense:** the values are tops of the `light/domain.md` bands, cert 2 literature, directional only.
- **What I'd need to accept cert ≥ 2:** for 10 and 14, nothing — they are band-tops as described. But 25 is stated four lines above to be **deliberately above the band**, resting on the site argument B2 dismantles. A value placed outside its source band cannot inherit that band's cert; the bullet's own "Weak point" paragraph (cohort E showing 2–4 true leaves at day 17 — not obviously a hardened plug) concedes the stage read is soft, then concludes "so the values hold".
- **My read:** split the row — 10/14 cert 2; wk3+ 25 cert **1** until a staged-DLI cohort or a logged tipburn read exists. The refinement trigger already written for days 15–21 is the right one; it is the cert label that is generous.

**D2 — the withdrawn-but-retained `NURSERY_STRESS_RUE = 0.85` (stated cert 1)** · `PENDING`
- **Specialist's defense:** justification withdrawn (biggest-plant datum cannot calibrate a mean-plant engine), value kept at what it was fitted to before the ceiling moved, cert 1, deliberately not refit until `PLUG_DRY_MATTER_FRACTION` is measured.
- **What I'd need to accept cert ≥ 1:** cert 1 is honest and the hold-don't-refit call is right per [[refit-not-relabel]] read in reverse — refitting against cohort C would re-enter the tautology. Defense fine. One gap only: the file says 0.85 "falls out near the domain's documented pH/EC-stress ε (0.85), reused for heat/drought" — with the original fit withdrawn, that coincidence is now the *only* remaining support, and it is a different stressor. Say so, or the sentence reads as an independent second source.
- **My read:** cert 1 fine; the pH/EC coincidence should be labelled as the sole remaining (and off-stressor) support, not as corroboration.

### Verdict
Land after addressing **B1** — cohort D's tray location is a one-question fix and it decides whether the per-cell energy balance is a real constraint or an artefact of applying a poly-transmission factor to an outdoor bench; nothing downstream (a `PLUG_DRY_MATTER_FRACTION` refit, "transmission" as suspect) should move before that answer. **B2 + D1** are the same circularity and want the wk3+ cert dropped to 1 rather than the value changed. B3/B4 are honesty-of-fit, C1/C2 are doc-and-code weight, none blocking. No greenhouse action changes today. · `PENDING`


## 2026-07-26 — nursery/plant-needs/derivation.md (Mode A, no-op pass)

Diff is a one-cell wording clarification: `cycleDays_default` note "5-week germination → transplant-ready" → "5-week nursery, sowing → transplant-ready". Value 35, cert 4 unchanged; aligns the note with the sowing-based day axis. No claim moved — nothing to challenge. · `PENDING`

## 2026-07-26 — review of yield-range/domain/derivation.md HEAD (working tree)

Scope: nursery DLI ceiling wk3+ 17 → 25; day axis rebased germination → sowing (3-day lag retired); new `INITIAL_DRY_MASS_G = 0.009` fitted to cohort D day 12; `NURSERY_STRESS_RUE` justification withdrawn, value kept; `SPECIFIC_LEAF_AREA` restated at 0.01855; new Validation / Day axis sections with cohort C–D comparison tables.

### Blindspots

**B1 — the 23.3 mol/m²/j "measured bench DLI" is not measured; it is one week's outside pyranometer total run through two assumed coefficients, and it is the sole support for the 17 → 25 ceiling** · `PENDING`
- **What the spec assumes:** the Light-fold bullet reads "a Décembre 50-cell converted a measured 23.3 mol/m²/j bench DLI … (pyranometer, July, no LED)" — presented as a site measurement strong enough to push the ceiling 47% above the `light/domain.md` band top.
- **What might be ignored:** the file's own Validation section derives 23.3 as 12 226 J/cm² / 7 d × **0.45 assumed PAR fraction** × 4.57 × **0.65 assumed transmission**, and says so ("both coefficients are assumptions"). What was measured is 35.9 mol/m²/j *outside*. The bench number inherits the full error of both coefficients: at 0.50 PAR / 0.70 transmission the bench is 27.9; at 0.45/0.55 it is 19.7 — below the old 17-vs-25 decision boundary in one direction and past it in the other. A one-week July total also cannot represent the nursery weeks of any other cohort. The prose in Light fold and the arithmetic in Validation disagree on the word "measured"; a reader who only reads Light fold takes a cert-3 site datum where the file elsewhere holds a cert-1 conversion.
- **How to test it:** a quantum-sensor (PAR) reading on the bench itself, at midday plus a full-day integral — removes both coefficients at once. Second-best: a shaded/unshaded pyranometer pair to measure transmission directly.
- **Cost if real:** high — the ceiling drives nursery growth linearly from day 15 on. 25 vs 17 is a 1.47× carbon-gain step across the whole plug phase, so transplant weight and every downstream field date move with a number that is currently two assumptions deep.

**B2 — "no tipburn at 23.3" bounds damage, not usable light; the ceiling's stated meaning is what the tissue can *convert*, and no evidence in the file speaks to that** · `PENDING`
- **What the spec assumes:** absence of tipburn in a week-4 50-cell at ~23 mol licenses `nurseryLightCeiling` = 25, in a model where "the carbon-balance gain is linear in DLI with no saturation" and the ceiling is defined as "the DLI the tissue can *use* at its age".
- **What might be ignored:** tolerance and utilization are different curves. A plug can sit under 23 mol undamaged while converting at a saturating rate well below linear — the standard lettuce light-response flattens long before the tipburn threshold, which is why the `light/domain.md` bands are band-*tops* rather than optima. Worse, the cohort that received the higher light is the one the engine now **over-predicts** at day 19 (1.34×, widened from 1.06× at the rebase). The single observation cited as support for more usable light coincides with the model's largest fresh over-prediction — that is evidence against linear conversion to 25, read as evidence for it. Cohort E's 2–4 true leaves at day 17 (the file's own "weak point") points the same way.
- **How to test it:** the trigger already in the file (staged-DLI nursery cohort weighed weekly) is the right one, but the decision should not have preceded it. Cheaper interim: hold 25 for wk4+ only and leave wk3 at 17 — the day-19 over-prediction is exactly the window that would resolve.
- **Cost if real:** high — same lever as B1, and it biases the same direction (over-predicted transplant weight → under-scheduled nursery time → field cohorts that miss their date).

**B3 — the same measurement raised nursery *plant capacity* but left the field *light input* at 17; capacity and delivery are being read off one number** · `PENDING`
- **What the spec assumes:** `DLI_TARGET = 17` remains the field driver ("the field drives on `DLI_TARGET`, so the nursery ceiling never touches field predictions"), while the nursery ceiling moved to 25 because "the engine had been driving the nursery at 17" and the bench delivers ~23.
- **What might be ignored:** the trigger for the change was a *delivery* observation (the greenhouse supplies more light than 17), but the change was made to a *capacity* constant. Those are different objects: the ceiling is what the plant can use, `DLI_TARGET` is what the site provides. Fixing a delivery under-estimate by raising a plant-capacity constant leaves both wrong and makes the pair mutually inconsistent — the same benches grow field-stage plants at 17 while plug-stage plants are credited 25. If the bench really delivers 23.3 in July, the field term is the one under-called, and every field yield in the model is low. If 17 is the right season-average delivery, then the nursery has no delivery basis for 25 either.
- **How to test it:** decide which object the 23.3 belongs to before spending it. `Guillaume call needed:` is 17 meant as a season-average delivered DLI or a July peak? If season-average, a single July week cannot raise anything; if July peak, the field term needs a month axis too.
- **Cost if real:** high — season yield. A field driver stuck 35% below measured summer delivery under-predicts every harvest weight, which is the number the whole subproject exists to produce.

**B4 — three data points, two constants fitted, and the one carrying the fit is the weakest datum in the file** · `PENDING`
- **What the spec assumes:** `INITIAL_DRY_MASS_G` is fitted to cohort D day 12 (0.5 g) and reproduces it to 0.98×; `NURSERY_STRESS_RUE` is deliberately not refit; the residual day-19/day-26 spread is "the honest price of reading the bands on sowing age", i.e. a shape error, not a level error.
- **What might be ignored:** the day-12 row is annotated in `doc/data-points.md` as "at the scale floor — ±20% on resolution alone", with day 5 outright below resolution. The fit therefore pins the curve's level on the least reliable of cohort D's three weights, n = 1, on a plant selected as representative from a tray whose cell occupancy was not recorded. Choosing to fit the level constant rather than ε is not neutral: it forces all the error into slope, which is what then licenses the "shape, not level" reading. Fit ε to day 19 or day 26 instead and the same three points tell a different story about which constant is wrong. With two free unmeasured constants and three points (one at ±20%, one at n=1 after a week with no LED), the file's confident attribution of the residual to shape is under-determined.
- **How to test it:** refit both constants jointly against all three points and report the residual surface, so the reader sees which combinations the data actually excludes. Then weight day 12 down explicitly. Cheapest real fix: weigh at 0.01 g resolution with n ≥ 5 per timepoint — n = 1 against a bench with visible patchiness cannot separate ε from stand effects at all.
- **Cost if real:** medium — the constants stay in the same neighbourhood, but the *diagnosis* ("shape gap, so look at DM fraction / patchiness / transmission") drives what gets measured next, and it may be pointing at the wrong candidate.

**B5 — the energy-balance candidate list omits the possibility that the 9.2 g datum is not comparable to the others** · `PENDING`
- **What the spec assumes:** cohort D day 19 → 26 averaged 1.114 g/day against a 1.119 g/day per-cell ceiling at 100% interception, so "no ε reaches 9.2 g on measured light"; the three named suspects are `PLUG_DRY_MATTER_FRACTION`, stand patchiness, and the 0.65 transmission.
- **What might be ignored:** a fourth candidate sits in `doc/data-points.md` and is not listed — each row is a **different plant**, chosen by eye as representative, n = 1, on a tray with unrecorded occupancy. A 6.6× jump in one week from a hand-picked single plant is exactly where selection drift shows up, and the day-19 note ("leaves already touching") means the day-26 plant was picked from a closed patchy canopy where "representative" is hardest to judge. The file treats the three weights as one trajectory; they are three independent samples. Since the balance violation is what makes DM 0.07 the prime suspect and what would eventually move `PLUG_DRY_MATTER_FRACTION` to 0.045–0.05, a data-comparability explanation deserves to be ranked alongside the physical ones — it is also the cheapest to rule out.
- **How to test it:** n ≥ 5 per timepoint on the next cohort, plus record cell occupancy and whether the sampled plant had live neighbours on all four sides. Weigh dry as well as fresh on one timepoint — that measures DM directly and settles suspect (1) in the same pass.
- **Cost if real:** medium — no greenhouse action today, but it decides whether the next measurement effort goes at DM fraction or at sampling discipline.

### Complexity

**C1 — the wk1 / wk2 ceiling split (10 vs 14) lives entirely inside the region the file declares undefended, and it is what forces `SPECIFIC_LEAF_AREA` to be a derived index-`[1]` expression** · `PENDING`
- **Specialist added:** a three-band `NURSERY_DLI_CEILING_BY_WEEK` (10 / 14 / 25) with band tops at days 7 and 14, retained across the rebase.
- **Test:** changes a team action vs. omitting? No. The team has no lever that delivers 10 mol to a week-1 tray and 14 to a week-2 tray — same bench, same sun, LED off. Meanwhile the file states the first ~5 days "are meaningless as biology" and that "only the level from day 12 on is defended", so the entire effect of the 10-vs-14 distinction lands in the uncalibrated region and is then absorbed by refitting `INITIAL_DRY_MASS_G` at day 12. The split's one real consequence is structural: `SPECIFIC_LEAF_AREA` must be derived at `NURSERY_DLI_CEILING_BY_WEEK[1]`, an index that (per the diff's own admission) contradicted its stated justification until this rebase — a whole class of silent error that a single pre-plug ceiling cannot have.
- **MVP version:** two bands — one pre-plug nursery ceiling (14) and the plug/field step — with SLA derived at the pre-plug value by name rather than by index. Same day-12-onward behaviour, one less unmeasured constant, and the index bug becomes unexpressible.
- **Why it might stay:** if a staged-DLI cohort is genuinely coming, the 3-band shape is the thing it would test, and collapsing it now means re-splitting it later. Also, the bands mirror `light/domain.md` naming, and keeping the model's shape aligned with the light domain has coherence value beyond this file.

**C2 — the "not a lag in disguise" defence and the "Rejected — emergence threshold" block are ~40 lines defending an absence** · `PENDING`
- **Specialist added:** a three-way argument that `INITIAL_DRY_MASS_G` is a level not an offset, a cost list for the unconditional day-1 start, and a rejected-alternatives block ruling out emergence thresholds and any non-multiple-of-seven band boundary.
- **Test:** changes a team action? No — and it doesn't change a model value either. It is rationale, which per project convention belongs in `learnings/`, not in the derivation. The derivation already carries the operative facts in two lines (day 1 = sowing; day-1 level fitted, not physiological).
- **MVP version:** keep the two operative lines plus the honest "days 1–12 are uncalibrated" caveat in `derivation.md`; move the offset-vs-level proof and the rejected alternatives to `learnings/`. Note this is a *placement* call, not a "delete the reasoning" call — the argument itself is good and the pre-emption of a future re-introduced lag is worth keeping somewhere.
- **Why it might stay:** the lag is exactly the kind of thing that gets silently re-added by a future fit, and the boundary-offset ban is a real constraint on future edits rather than pure narrative. If it stays, it should read as a constraint list, not a proof.

### Cert defense

**D1 — wk3+ ceiling 25 mol, carried in the same "directional only … band-tops, cert 2 from the light domain" bullet as 10 and 14 (stated cert 2)** · `PENDING`
- **Specialist's defense:** the light domain's "≥2–3 wk plugs tolerate full bed-level DLI" is fuzzy enough to cover it, and a Décembre 50-cell converted ~23.3 mol in week 4 without tipburn.
- **What I'd need to accept cert ≥ 2:** 25 is not a band top — the file says it is "deliberately above the band", so the cert-2 light-domain provenance the bullet claims does not extend to it. To hold cert 2 I would want either a published lettuce light-response curve showing linear conversion to ~25 at plug stage, or the bench PAR measurement from B1 plus a weighed cohort at that light. Neither exists; what exists is one converted outside-pyranometer week and a no-tipburn observation (B2).
- **My read:** cert should be **1** for the wk3+ value specifically, split out of the shared cert-2 bullet so 10 and 14 keep their band-top provenance and 25 carries its own. The bullet already lists the right upward trigger; it needs a downward one too (per [[symmetric-refinement-triggers]]) — e.g. "day-19 over-prediction persists at n ≥ 5 → step back to 17".

**D2 — `NURSERY_STRESS_RUE = 0.85` kept at a value whose justification the same edit withdraws (stated cert 1)** · `PENDING`
- **Specialist's defense:** cert 1 is already the floor; refitting while `PLUG_DRY_MATTER_FRACTION` is unmeasured would move the error around rather than reduce it, and 0.85 coincides with the domain's documented pH/EC-stress ε.
- **What I'd need to accept cert ≥ 1:** cert 1 is defensible as a label — the issue is not the cert, it is that the file records the value as *known to be too high* ("the strongest argument that 0.85 is too high", engine 1.07× above a biggest-plant datum) and leaves it in service anyway. Per [[refit-not-relabel]], a withdrawn anchor should not leave the number sitting at two significant figures fitted to a superseded ceiling; per [[symmetric-refinement-triggers]] it needs a stated downward trigger, which the bullet lacks.
- **My read:** cert 1 fine; the defect is the missing downward trigger and the retained precision. State it as "0.85, an assumption inherited from the retired DLI-17 fit, ±0.15" with an explicit refit-on-DM-measurement trigger — the deliberate-no-refit decision itself is sound and I would not overturn it.

### Verdict
Land after addressing B1 and D1 — the wk3+ 25 is currently defended by a sentence ("measured bench DLI") that the same file's arithmetic contradicts, and it carries a borrowed cert. B3 is the finding with real season-yield exposure and needs Guillaume: one measurement was spent raising a plant-capacity constant while the site-delivery constant it actually speaks to stayed at 17. The sowing rebase itself is right and the axis is now clean end to end — that part ships as-is. · `PENDING`


## 2026-07-26 — review of yield-range/domain/derivation.md (HEAD working-tree diff)

Scope: `INITIAL_DRY_MASS_G = 0.009` introduced (fitted); `NURSERY_STRESS_RUE = 0.85` justification withdrawn, value kept; `NURSERY_DLI_CEILING_BY_WEEK` wk3+ 17 → 25; day axis rebased germination → sowing (3-day lag retired); Validation section rewritten around cohorts C/D; two new refinement-trigger rows. Spec slugs touched: `carbon-balance-growth`, Assumptions.

### Blindspots

**B1 — the nursery age ceiling is a *capacity* limit being used as a *supply* value, so the nursery now grows on more light than the field, year-round** · `PENDING`
- **What the spec assumes:** `effectiveDli = inNursery ? nurseryLightCeiling(day) : DLI_TARGET` (`calc.js:137`) — no `min` against anything delivered. The derivation's own words: the ceiling is "the DLI the tissue can *use* at its age", and whether the site delivers it is "decoupled" into `light/`.
- **What might be ignored:** that decoupling was harmless while the ceiling (17) sat at `DLI_TARGET`. At 25 it is no longer harmless: every nursery day from day 15 on is now integrated at 25 mol/m²/j, while the LED-supplemented field bed integrates at 17. A plug on an unlit bench out-lights a lit field bed by 47% in the engine. The single measurement behind 25 is one July week, outdoor pyranometer, no LED (23.3 bench). Nothing in the model prevents a January nursery from also running at 25. The prior flat-17 fold accidentally capped this; the raise removed the cap without replacing it.
- **How to test it:** recompute a winter-sown cohort's `transplantWeightG` with the ceiling folded as `min(nurseryLightCeiling(day), benchSunDli(month) + ledDli(hours))` versus as-is — the two constants and the function already exist in the lighting-feasibility block. If transplant weight moves materially by month, the ceiling-as-supply shortcut is load-bearing, not cosmetic.
- **Cost if real:** high — `transplantWeightG` feeds `harvestWeightG` feeds `kgPerYear` and `yearlySalesDollars`, and it drives the nursery-duration decision the operator actually makes.

**B2 — the day-26 energy-balance "impossibility" lists three physical suspects and omits the cheapest one: n = 1, eyeballed, shoot-only** · `PENDING`
- **What the spec assumes:** cohort D's 1.114 g/day over days 19–26 sits at 99.6% of a full-interception ceiling from a canopy that started the week at ~34% interception, so something in the physics is wrong — candidates ranked as plug DM, stand patchiness, transmission.
- **What might be ignored:** each cohort-D row is a *different single plant*, picked by eye as "most representative", weighed shoot-only, with cell occupancy unrecorded (`doc/data-points.md` § Cohort D). A by-eye "representative" pick at day 26 landing 1.5–2× the tray mean is entirely ordinary, and that alone dissolves the impossibility without touching a constant. Shoot-only cuts the other way and makes the gap wider still, which is worth stating. Ranking `PLUG_DRY_MATTER_FRACTION` as suspect #1 sets up a measurement that may be asked to absorb a sampling artifact — and 0.045–0.05 is named in the text as the value that "becomes physical", which is a target waiting to be hit.
- **How to test it:** at the next destructive sample, weigh **n ≥ 5** at one timepoint and record the spread, plus occupied-cell count. If the day-26 mean lands near 5–6 g with a 9 g top plant, the physics needs no repair.
- **Cost if real:** medium — no greenhouse action today, but it aims the one pending measurement (`PLUG_DRY_MATTER_FRACTION`) at the wrong quantity, and that constant is also the refit trigger for `INITIAL_DRY_MASS_G`.

**B3 — both changes in this diff degrade the only place the model is checkable, and the file records that without letting it count as evidence** · `PENDING`
- **What the spec assumes:** the sowing rebase is presented as a pure repair ("repairs that without moving the value") and the ceiling raise as measurement-driven; the fit table is reported afterward as descriptive.
- **What might be ignored:** the file states the day-19 over-prediction "widened from 1.06× to 1.34×" because the 25-mol step now lands on day 15 instead of day 18. Day 19 was the one point the engine was nearly right on, and both edits together broke it. The day-26 improvement (0.58× → 0.66×) is still a 34% shortfall, so it is not a trade of one fit for another. Two changes justified on independent grounds, jointly making the only three-point check worse, is a signal about the ceiling *onset day* — which is precisely the value the derivation separately calls its "weak point".
- **How to test it:** hold the rebase, sweep the wk3+ onset over days 15–22 and report the three-point residuals; if the fit is best near day 18–21, the band-boundary-must-be-a-multiple-of-seven rule is buying axis purity at the cost of the only calibration signal there is.
- **Cost if real:** medium — the fix is a constant, not a rework, but the current onset is defended by an argument about axis hygiene rather than by fit or observation.

**B4 — every operator-facing output is now unanchored, and neither `spec.md` nor the outputs carry a band** · `PENDING`
- **What the spec assumes:** "No weight anchor is currently reproduced… Both ε values are unanchored" — stated plainly in `derivation.md`. `spec.md` § Contract still lists `harvestWeightG`, `kgPerYear`, `yearlySalesDollars` as bare numbers.
- **What might be ignored:** the honest disclosure lives only in the derivation. The model's single calibrated point is 0.5 g at day 12 — a datum the register itself marks "at the scale floor — ±20% on resolution alone" — and `INITIAL_DRY_MASS_G` is quoted to two significant figures against it. The 1.34×/0.66× spread at the two neighbouring points is the real uncertainty, and it propagates unattenuated into a dollar figure someone will read as a plan.
- **How to test it:** run `predictYield` at ε 0.85 and ε 1.1 for the operational config and compare `yearlySalesDollars` — if the pair spans more than ~1.5×, the single-number output is the finding.
- **Cost if real:** medium-high on decisions, zero on the math. `Guillaume call needed:` is `yearlySalesDollars` being read as a planning number by anyone, or is it a sandbox display?

### Complexity

**C1 — ~45 lines defending the rebase against the alternative it replaced belong in `learnings/`, not `derivation.md`** · `PENDING`
- **Specialist added:** "Day axis", "`INITIAL_DRY_MASS_G` is a calibrated level, not a lag in disguise" (three-way proof, with a lag-3-vs-no-lag comparison table in prose), "What the unconditional day-1 start costs", and "Rejected — an emergence threshold", which also pre-rejects three specific ways someone might reintroduce the offset.
- **Test:** does it change a team action? No — the axis statement itself does (one sentence, already in `spec.md` Assumptions and `doc/CLAUDE.md`). The refutation of a retired alternative does not.
- **MVP version:** keep the axis definition + the `INITIAL_DRY_MASS_G` refit trigger in `derivation.md`; move the not-a-lag proof, the cost list and the rejection into `learnings/sowing-axis-over-germination-lag.md`. `learnings/` already carries eleven such files and this is the same species.
- **Why it might stay:** the pre-rejection of "an offset table, a `+3` in the divisor, a stage-onset constant" is load-bearing against a future re-introduction — but that is exactly what a learning file is read for.

### Cert defense

**D1 — wk3+ ceiling 25 from day 15 (stated cert 2, "directional only", band-tops)** · `PENDING`
- **Specialist's defense:** a Décembre 50-cell converted a measured 23.3 mol/m²/j bench DLI in week 4 without tipburn; `light/domain.md`'s "≥2–3 wk plugs tolerate full bed-level DLI" is fuzzy enough to cover week 3.
- **What I'd need to accept cert ≥ 2:** the observation is week 4 and the value is applied from day 15 — week 3, where the file's own cohort E shows 2–4 true leaves at day 17. Two separate extrapolations ride on one week of one cohort: from week 4 down to week 3, and from "no tipburn observed at 23.3" up to "usable at 25". The wk1/wk2 steps are band-tops from `light/domain.md`; 25 sits *above* that document's own top, so it does not inherit the band's cert. Tipburn is also the wrong endpoint for a growth ceiling — absence of injury is not evidence of conversion.
- **My read:** wk1/wk2 cert 2 fine. wk3+ **value** cert 2 is defensible (one measured site DLI, converted without visible injury). wk3+ **onset day 15** should read cert 1 with the downward trigger already written, and B3 says the fit disagrees with it.

**D2 — `NURSERY_STRESS_RUE = 0.85` kept after its anchor was withdrawn (stated cert 1)** · `PENDING`
- **Specialist's defense:** cert already 1, the value falls near the domain's documented pH/EC-stress ε, and deliberately not refit while `PLUG_DRY_MATTER_FRACTION` is a guess.
- **What I'd need to accept it:** the cert label is honest and the not-refitting discipline is right (refit-not-relabel cuts the other way here — there is nothing independent to refit against). What is not covered: the file argues in two directions at once. Validation says the raised ceiling puts the stressed engine at 5.34 g against a *biggest*-plant 5 g and calls that "the strongest evidence 0.85 is too high"; the constant's own bullet keeps it anyway. Either the cohort-C comparison is admissible or it is not — it is used to indict the value and then set aside as "a recorded datum is not an anchor".
- **My read:** cert 1 fine, value fine to hold. The inconsistency is rhetorical, not numeric — pick one reading of cohort C and state it once.

### Verdict
Land after B1 — the ceiling-as-supply shortcut is now a real behaviour change (nursery out-lights the field by 47%, unbounded by season) and it is the only finding here that moves an operator number today. B3 + D1 are one lane: the wk3+ onset day is the load-bearing unknown and the three-point fit already argues against day 15. B2 redirects the pending measurement before it is taken. C1 and D2 are hygiene. The rebase itself is right and the disclosure standard in this file is unusually honest — the findings are about where the honesty stops (`spec.md` outputs, B4) and where an argument is doing a measurement's job. · `PENDING`
