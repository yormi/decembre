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

## 2026-05-30 — review of nutrition/tomato/soil-ph/model/derivation.md (HEAD working-tree diff)

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

## 2026-05-30 — review of nutrition/tomato/soil-ph/model/derivation.md (HEAD working-tree diff, peak-hazard expansion)

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

## 2026-05-30 — review of nutrition/tomato/fertigation-recipe/model/derivation.md (HEAD working-tree diff)

No-op pass — diff is slug reference migration only (→`mass-balance-derivation`, →`uptake-efficiency-factor`, →`fp-target-mirrors-sizer`, →`ca-aware-product-gate`, →`only-ca-p-participate-in-gap-chain`). No claim, number, or derivation logic moved. Nothing to critique.
## 2026-05-30 — review of nutrition/tomato/foliar-strategy/model/derivation.md (HEAD working-tree diff)

No-op pass — diff is slug/namespace reference migration only (→`nutrition/chemistry — foliar-ce-under-burn-cap`, →`coverage-discount-on-delivery`, →`weekly-leaf-tolerance-cap`, →`gap-maximizing-recipe`). No dose, cert, or derivation logic moved. Nothing to critique.

## 2026-05-30 — review of nutrition/tomato/foliar-strategy/model/derivation.md (working-tree diff)

No-op pass. Diff is a pure slug citation migration (→ `foliar-ce-under-burn-cap`, → `coverage-discount-on-delivery`, → `weekly-leaf-tolerance-cap`, → `gap-maximizing-recipe`). No claim, constant, cert, or number moved. Nothing to critique.

## 2026-05-30 — review of nutrition/tomato/foliar-strategy/model/derivation.md (HEAD working-tree diff)

No-op pass — diff is slug reference migration only (→`nutrition/chemistry — foliar-ce-under-burn-cap`, →`coverage-discount-on-delivery`, →`weekly-leaf-tolerance-cap`, →`gap-maximizing-recipe`). No constant, cap, cert, or claim moved. Nothing to critique.

## 2026-05-30 — review of nutrition/tomato/foliar-strategy/model/derivation.md (HEAD working-tree diff)

No-op pass — same slug citation migration as the four entries above (→`foliar-ce-under-burn-cap`, →`coverage-discount-on-delivery`, →`weekly-leaf-tolerance-cap`, →`gap-maximizing-recipe`, →`surfactant-aware-efficiency-map`, →`foliar-uptake-ph-curve`, →`in-tank-ksp-precipitation-guard`). No dose, cap, cert, or derivation logic moved. Nothing to critique.

## 2026-05-30 — review of nutrition/nursery/fertigation/derivation.md (HEAD working-tree diff)

No-op pass — slug citation migration only (→`default-recipe-p-supply-half-demand`, →`predicted-ce-under-nursery-cap`, →`predicted-tank-ph-in-nursery-envelope`). No constant, cap, cert, or claim moved. Nothing to critique.

## 2026-05-30 — review of nutrition/tomato/fertigation-recipe/model/derivation.md HEAD

No-op pass. Diff is citation-format migration only (→ slug names `under-fert-guard` / `luxury-feeding-guard` / `replenishment-cascade-earliest-first`). No constant, factor, stage, or claim moved. Nothing to critique.

## 2026-05-30 — review of nutrition/tomato/fertigation-recipe/model/derivation.md (HEAD working-tree diff)

No-op pass — continuation of the same slug citation migration, now covering the channel-efficiency-map + Mo sections (→`nutrition — channel-efficiency-capability-map`, →`ph-aware-effective-efficiency`, →`no-decorative-products-at-current-ph`, →`replenishment-cascade-earliest-first`). No constant, ratio, cert, or derivation logic moved. Nothing to critique.

## 2026-05-30 — review of nutrition/tomato/fertigation-recipe/model/derivation.md (HEAD working-tree diff)

No-op pass — same slug citation migration already logged above (active-channels-sum + Solubore + channel-efficiency-map + Mo + no-pH-gate + flat-return sections; →`under-fert-guard`/`luxury-feeding-guard`, →`replenishment-cascade-earliest-first`, →`channel-efficiency-capability-map`, →`ph-aware-effective-efficiency`, →`no-decorative-products-at-current-ph`, →`contribution-channel-details-payload`). No constant, factor, ratio, cert, or derivation logic moved. Nothing to critique. · `PENDING`

## 2026-05-30 — review of nutrition/tomato/foliar-strategy/model/derivation.md (HEAD working-tree diff)

No-op pass — same slug citation migration (→`under-fert-guard`/`luxury-feeding-guard`, →`replenishment-cascade-earliest-first` ×2). No constant, factor, floor, cert, or band moved. Nothing to critique.

## 2026-05-30 — review of nutrition/tomato/sidedress-recipe/model/derivation.md (HEAD working-tree diff)

No-op pass — same slug citation migration (→`channel-efficiency-capability-map`, →`luxury-feeding-guard`, →`release-values-within-mass-balance-band`). No constant, factor, eff, cert, or derivation logic moved. Nothing to critique.

## 2026-05-30 — review of nutrition/tomato/plant-needs/model/derivation.md HEAD

No-op pass — trivial diff: lone reference-label migration (→ slug `nutrition/tomato — tomato-removal-biased-high`) in the macro back-test refinement trigger. No claim, number, or cert moved. · `PENDING`

## 2026-05-30 — foliar-strategy/model/derivation.md (HEAD working-tree diff, bare-reference removal)

No-op pass. Diff deletes a single bare reference in the channel-efficiency-map section ("Block 5 toggle that the page-side reads") — bare-reference elimination migration. No constant, dose, cert, stage, branch, or mechanism moved. Sibling clause already names the slug (`surfactant-aware-efficiency-map`), so the removal leaves no dangling reference. · `PENDING`

## 2026-05-31 — review of nutrition/tomato/soil-ph/model/derivation.md (HEAD working-tree diff)

Scope: new subsection "Target band (the correction endpoint)" added above the feasibility gate. Cert-3 endpoint band (Mehlich-3 water pH 6.4–6.8, aim 6.5, hard floor 6.2) lifted from the new `learnings/define-soil-root-zone-ph-target-band.md` into the live derivation. No dose number moved; the band was already the implicit endpoint the dose tables drive toward. Sibling `spec.md` still zero-slug.

### Blindspots
**B1 — aim-point 6.5 deliberately sits at the Mn knee while tissue Mn is already over-supply** · `PENDING`
- **What the spec assumes:** aim 6.5 = peak P availability, "the knee just above where Mn²⁺ solubility steepens" — the band's lower half (6.4) is acceptable.
- **What might be ignored:** the T5 panel (wash-confirmed) already reads Mn over-supply *before* any acidification, and the foliar-Mn trim is still pending. Driving toward 6.5 (and tolerating 6.4) deliberately parks steady-state at the start of the ~100×/2-pH-unit Mn climb on this calcareous soil. The learnings rejected going *lower* (6.0–6.2) on exactly this Mn argument — but did not test whether the same argument should push the **aim up** (6.6–6.8), trading shallow sub-6.5 P gains for Mn headroom, given the AMF bridge is meant to deliver the residual P by direct uptake anyway.
- **How to test it:** a Mn soil-availability reading at the post-correction pH (the refinement trigger the learnings already names) → set an explicit tissue-Mn stop-dose trigger; if soil Mn at 6.5 is already in watch range, raise the aim into the upper half.
- **Cost if real:** medium — over-driving pH into the Mn knee on already-élevé tissue is a toxicity-side error, and the band is the dose-stop target the whole programme rides on. Mitigant: the derivation's own "undershoot is the real risk, pH rebounds toward 6.5–6.8" note means practice likely drifts up regardless — but the *stated aim* still anchors operator dose-stop behaviour.

### Complexity
**C1 — target band now stated in three places, one of them stale and contradicting** · `PENDING`
- **Specialist added:** the band as a full subsection in `derivation.md`, duplicating `learnings/define-soil-root-zone-ph-target-band.md` (canonical rationale) and overlapping the older specialist note in `nutrition/tomato/spec.md` (lines 41–59).
- **Test:** changes a team action? The duplication itself doesn't — but the **parent spec.md note still frames the band as an unwritten PO gap** ("`soil-root-zone-ph-band` does not yet exist… Recommend the PO write the entry") and quotes **operational midpoint ~6.6**, which the new decision reverses (specialist-owned, aim **6.5**). A reader landing on the parent spec gets the superseded ownership + a different number.
- **MVP version:** keep the band in `learnings/` (rationale) + a one-line pointer from `derivation.md`; flag the parent `spec.md` note (lines 41–59) for the specialist to prune/reverse-in-place per the no-vestigial rule. Challenger doesn't edit spec — flag only.
- **Why it might stay:** a short endpoint table in the derivation is reasonable (the dose tables sit right below it and reference 6.5/6.2). The defect is the un-reversed parent note, not the derivation copy.

### Cert defense
No new challenge. cert 3 on the band is honestly stated (extension P/micro curves, not Décembre-tissue-calibrated) with symmetric refinement triggers already named in the learnings. The bounds are a judgment call inside the cert band, not an over-claimed number.

### Verdict
Ship the derivation subsection after addressing C1 (reverse/prune the stale parent `spec.md` note — specialist's edit, the 6.6/PO-gap framing now contradicts) + logging B1 (Mn-knee aim direction needs the soil-Mn reading before locking 6.5 vs an upper-half aim). No dose moved; B1 is the only finding that could shift the endpoint.

## 2026-05-31 — re-trigger, soil-ph/model/derivation.md (no-op)

Hook re-fired on the unchanged target-band diff. Already reviewed above (2026-05-31, lines 122–144: B1 Mn-knee aim · C1 stale parent note). No new claim moved → no-op pass. · `PENDING`

## 2026-05-31 — review of nutrition/tomato/soil-ph/model/derivation.md (band-lowered diff)

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
- parent `nutrition/tomato/spec.md` (lines 43–48) — old band.
Per the no-vestigial rule these are the specialist's to reverse-in-place. The learning's own internal contradiction (new table vs stale Practical-note) is the most urgent — that file is cited as the source of truth from three places.

### Verdict
Land the band-lowering after: fixing B1 (trigger line → new numbers — pure defect, in this diff), gating B2/D1 on the soil-Mn-at-target reading before dosing to the 5.8 floor (Guillaume owns the band value, but the *floor's cert* and the dose-to-it should wait on the Mn number), and propagating the new band to the 4 stale surfaces. The band *value* is not challenged; its evidence basis at the floor and its self-consistency across files are.

## 2026-05-31 — re-trigger, soil-ph/model/derivation.md (no-op)

Hook re-fired on the band-lowering diff already reviewed above (lines 150–184: B1 trigger-line contradiction · B2 floor-drop on unquantified Mn · D1 cert split · Coherence 4 stale surfaces). Confirmed independently — same findings, no new claim moved. No-op pass. · `PENDING`

## 2026-05-31 — re-trigger, soil-ph/model/derivation.md (no-op)

Hook re-fired again on the same band-lowering diff (6.0–6.5 / aim 6.3 / floor 5.8). Ran the full three-angle pass independently; landed on the identical findings already captured at lines 150–184. No new claim moved → no-op pass, no duplicate entry. · `PENDING`

## 2026-06-02 — review of nutrition/tomato/soil-ph/model/derivation.md (HEAD working-tree diff)

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

## 2026-06-02 — review of nutrition/tomato/soil-ph/model/derivation.md (HEAD working-tree diff)

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
