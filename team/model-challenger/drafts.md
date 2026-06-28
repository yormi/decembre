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

## 2026-06-13 — re-trigger, yield-range/derivation.md (no-op)
Hook re-fired on the same `GH_LIGHT_TRANSMISSION_DOUBLE_POLY` 0.55 → 0.65 diff already reviewed above (lines 247-274: B1 stale d44 worked example · B2 top-of-band optimism / film-condition · D1 cert-3 holds on literature but now a field-reality bet). Ran the three-angle pass independently; landed on the same findings (plus the annual-average-sun × peak-fresh-transmission time-axis framing, already covered by B2's optimism point). No new claim moved → no-op pass, no duplicate entry. · `PENDING`

## 2026-06-20 — review of nutrition/nursery/fertigation/derivation.md (HEAD working-tree diff)

Scope: salt-control re-derivation. §2 plug target 90 → 20 g (halves all demand: N floor 1 400 → 350, P 158 → 35). §4 constraints block: CE cap 3.0 → 1.0 mS/cm bucket (cell ~1.5× via dry-down → peak ~1.2 with per-feed leaching), waterPh 6.26. Live `data.js` re-sized coherently (Ocean 7/6/2 → 2.0/1.5/1.0, CE 2.6 → 0.83, pH 5.83). Affects `predicted-ce-under-nursery-cap`, `n-supply-half-demand-floor`, `default-recipe-p-supply-half-demand`.

### Coherence (cross-surface drift — flag-don't-fix, highest priority)
**Stale §4 recipe-pick + §5 verifier block describe the RETIRED 90 g recipe** · `PENDING`
- The diff edited §2 demand + §4 *constraints* intro only. The §4 "Search heuristic / Picked `X=7, Y=6, Z=2`" bullets and the entire §5 "Predicted CE / pH at default" block were NOT touched.
- They now contradict both the just-edited constraints AND live `data.js`:
  - §4 pick: `X=7,Y=6,Z=2`; "CE 2.55+0.10=2.65 (~0.4 head-room under **3.0** cap)"; "N 1463 = 52 % of **2800**"; "P 170 = 54 % of 315". Live recipe is 2.0/1.5/1.0, CE 0.83, N 412 ≥ 350, cap 1.0.
  - §5: `nurseryRecipeCE = 2.60`, `nurseryRecipeTankPh = 7.00 − … = 5.25`, supply N 1463/P 170/K 88. Live: CE 0.83, pH 5.83 (waterPh **6.26**, not 7.00), N 412.
  - §4 mass-flow formulas still use pH baseline 7.0 and **kelp pH = −0.05×Z**; `data.js` predicted-pH comment now uses **kelp +0.02** (sign flip, undocumented in derivation).
- The derivation's whole job is to justify the live numbers; §4/§5 currently justify numbers that no longer exist. A PO/operator reading §5 sees CE 2.60 against a 1.0 cap. Specialist's edit — refresh §4 pick + §5 block to the 2.0/1.5/1.0 recipe, waterPh 6.26, kelp +0.02. **Cost if unfixed: high** (the live verifier check `predicted-ce-under-nursery-cap` asserts ≤1.0 against the real recipe; the derivation reads as if it'd fail).

### Blindspots
**B1 — field failure was Na-specific (Na 3166), but the model controls total CE, not sodium** · `PENDING`
- **What the spec assumes:** lowering bucket CE 3.0 → 1.0 fixes the salt damage (leachate 5+, Na 3166, tip-burn cited as the trigger).
- **What might be ignored:** the damaging ion named is **sodium**, and the two largest dose-carriers are marine-derived (fish hydrolysate + liquid kelp) — both Na-rich feedstocks. CE measures total dissolved salt; it doesn't distinguish Na from nutritive K/Ca/Mg. Cutting dose cuts Na here (helpful, correlated), but the model has no Na term, so it can't tell whether the residual Na at CE 0.83 still clears the tip-burn threshold — or whether the source water itself carries the Na. A future recipe that raises CE with *low-Na* salts would be flagged, while a low-CE high-Na feed would pass.
- **How to test it:** Na on the three product datasheets + source-water Na; leachate Na (not just EC) after one cycle on the new recipe. If Na is water-borne, no fertilizer cut closes it.
- **Cost if real:** high — tip-burn persists at CE 0.83 if Na, not total salt, was the driver.

**B2 — 20 g plug viability at 35 d treated as a free lever** · `PENDING`
- **What the spec assumes:** "halving the plug target halves demand" — framed purely as the knob that drops the feed into the salt-safe band; "revisit upward as salinity controlled."
- **What might be ignored:** a 78 % cut in target plug size (90 → 20 g) is also an agronomic call — whether a 20 g Salanova plug at 5 weeks transplants well (root-ball integrity, not leggy/undersized) isn't addressed. The derivation reasons only from the salt side. If 20 g plugs transplant poorly, the salt fix has a stand-establishment cost the model doesn't price.
- **How to test it:** field obs on the first 20 g cohort at transplant (root-ball hold, survival, days-to-establish) vs the prior 90 g plugs.
- **Cost if real:** medium — interim target, explicitly revisitable; but "halve the plug" shouldn't read as cost-free.

### Complexity
No new constant, stage, or branch — this diff lowers/removes. Nothing to cut. The dry-down 1.5× factor is the one unmeasured load-bearing number; cert honestly dropped to 2 and flagged in §6 trigger 1/2. No challenge.

### Cert defense
No new challenge. `predicted-ce-under-nursery-cap` cert dropped 3 → 2 (dry-down factor unmeasured) — honest, conservative. The 350/35 mg floors inherit cert 3 from the tissue-% × DW chain, unchanged in basis (just rescaled by the 20 g target). Fine.

### Verdict
Land after refreshing the stale §4 pick + §5 verifier block (Coherence finding — concrete defect, the derivation describes a retired recipe) and logging B1 (Na-vs-CE — the field trigger was Na-specific, the model isn't) for a Guillaume/field call. B2 is a watch-item on the first cohort. The re-derivation direction is sound and `data.js` is internally coherent; the derivation prose just didn't follow §4/§5 down to the new recipe.

## 2026-06-20 — re-review, fertigation/derivation.md (specialist refreshed §4/§5; one stale surface remains)

Scope: re-fire after the specialist carried the re-derivation down into §4 (pick now `X=2/Y=1.5/Z=1`) and §5 (CE 0.83, pH 5.83 at waterPh 6.26, N 412/P 44/K 90) — i.e. the prior entry's top **Coherence** defect (stale §4 pick + §5 block, lines 283-290) is now **RESOLVED**, and the undocumented kelp pH sign flip is now stated in §4 (kelp pH `+0.02`). B1 (Na-vs-CE) + B2 (20 g plug viability) from the prior entry still stand — not re-raised. One genuinely new finding below.

### Coherence (cross-surface drift — flag-don't-fix)
**§1 per-product table still describes the OLD kelp K (5× low) and an obsolete "needs datasheet" note** · `PENDING`
- §4 mass-flow + §5 supply + live `data.js` all now use **kelp K = 0.0498** (6.0 % K₂O → 4.98 % K element, cert 4, grounded in `nutrition/doc/Acadie Fresh Seaweed Concentrate.pdf`).
- But §1's "Acadie Algues liquides" table (lines 48-57) was **not touched** — it still reads **K = 0.010** ("approx 1 % — Acadian datasheet", **cert 2**) and closes with "Per-micro cert 1 — needs fresh manufacturer datasheet to upgrade." The datasheet has since landed; data.js used it to move K 1 % → 6 % K₂O and the cert 2 → 4. §1 is the last surface describing a kelp K that's 5× below the live value, at a cert two steps stale.
- The K-supply number (90 vs the ~40 the old 1 % factor would give) and the K-coverage / frequency-as-DOF narrative all ride on 0.0498. A reader cross-checking §4's `62.3 Z` against §1's 0.010 hits a 5× contradiction. Specialist's edit — refresh §1 to 4.98 % K / cert 4 / datasheet-on-file. **Cost if unfixed: medium** (doc-coherence, not a live-number error — data.js is already correct).

### Blindspots
**B1 — kelp product identity: "approx 1 %" Algues liquides vs "6 % K₂O" Fresh Seaweed Concentrate — same product or a swap?** · `PENDING`
- **What the spec assumes:** §1 names the product "Acadie Algues liquides … approx 1 %"; `data.js` names it "Acadie Fresh Seaweed Concentrate (= Acadie Algues liquides)" at 6.0 % K₂O. Treated as one product, datasheet just upgraded.
- **What might be ignored:** a 1 % → 6 % K₂O jump is a 6× concentration step. If "Fresh Seaweed Concentrate" is a *more concentrated* SKU than the "Algues liquides" the farm was dosing, then the `ecFactor 0.10` (calibrated on the old field measurement: Acadie 13 + kelp **2 mL/L**) and the per-mL dose semantics may not transfer to the new product. The CE-cap satisfaction (0.83) leans on that ecFactor.
- **How to test it:** confirm the physical product on the shelf matches the datasheet SKU (label name + guaranteed analysis); if it's a different concentration, re-anchor kelp `ecFactor` on an in-bucket reading of the actual product.
- **Cost if real:** medium — mis-anchored kelp ecFactor shifts predicted CE; the cap is the whole point of this re-derivation.

### Complexity / Cert defense
No new finding. Kelp K cert 4 is grounded (datasheet on file) — not challenged. CE cert 3 → 2 already logged honest in the prior entry.

### Verdict
Land after refreshing §1 (Coherence — the last stale surface; data.js is already correct, so this is doc-only) and confirming the kelp product-identity / ecFactor transfer (B1). Prior entry's B1 (Na) + B2 (plug viability) remain the substantive open items.

## 2026-06-20 — re-trigger, fertigation/derivation.md (no-op)
Hook re-fired on the same salt-control re-derivation diff (90 → 20 g, CE cap 3.0 → 1.0, recipe 2.0/1.5/1.0, waterPh 6.26, kelp K 0.0498 / pH +0.02) already reviewed in the two entries above (lines 279-335). Ran the full three-angle pass independently against `data.js`: arithmetic verifies (demand 700/70, supply 412/44, CE 0.83, pH 5.83) and §4/§5 match the live constants. Landed on the identical findings — §1 kelp table still at the stale 1 % K / cert 2 (Coherence, lines 319-322), dry-down 1.5× the one unmeasured load-bearing constant on a weekly interval (Complexity, line 306 + §6 trigger 2), Na-vs-total-CE (B1, lines 293-297), 20 g plug viability (B2, lines 299-303). No new claim moved → no-op pass, no duplicate entry. · `PENDING`

## 2026-06-20 — review of fertigation/derivation.md (NEW content: iron sulfate channel)

Scope: the working-tree diff now carries a **fourth product not in any prior 2026-06-20 entry** — §1 "Sulfate de fer (FeSO₄·7H₂O, 20 % Fe)" block + the §5 `Fe: 3.75 cert 3` supply row + the iron CE/pH terms (`1.2 × 0.015`, `−0.10 × 0.015`). "Bench practice folded into the model 2026-06-20." `data.js` `IronSulfate` entry is schema-complete (ions, chemistryTags, phContribution −0.10, organicAllowed, ecFactor 1.2) → `products-schema-complete-organic-only` passes. Prior entries' open items (§1 kelp 1 % stale · Na-vs-CE · 20 g plug viability · dry-down 1.5×) still stand, not re-raised.

### Blindspots
**B1 — Fe dose is bench-anchored, not demand- or tissue-anchored; no Fe floor to check it against** · `PENDING`
- **What the spec assumes:** 0.015 g/L (≈3 ppm feed, 3.75 mg/tray) is the right Fe rate because it's what the team already pours.
- **What might be ignored:** §2 demand table has no Fe row (N/P/K/Ca/Mg only), so unlike N/P there is no `½-demand` floor or verifier check on the 3.75 mg — the number is documented, never validated against seedling need. 3 ppm sits at the upper end of the typical 1–3 ppm hydroponic Fe band; on acidic peat with Fe²⁺ held soluble (the derivation's own point), upper-band Fe + kelp's trace Fe could over-supply. "Matches the as-poured feed" justifies *modeling* it, not the *rate*.
- **How to test it:** Fe on the transplant-tray tissue panel (the §6 trigger-3 tissue test already lands — add Fe to it); if Fe is ample, the bench rate is a candidate to trim, not a floor to defend.
- **Cost if real:** low–medium — Fe is cheap and the window is wide; a watch-item, not a dose error.

**B2 — flat "organic-allowed" on a micronutrient salt; CAN/CGSB-32.311 micronutrient use is conditional** · `PENDING`
- **What the spec assumes:** FeSO₄ `organicAllowed: true` / "Organic-allowed (CAN/CGSB-32.311)", cert 4, same footing as the listed fish/kelp inputs.
- **What might be ignored:** iron sulfate is a listed substance, but CAN/CGSB-32.311 generally gates synthetic micronutrient additions on a *documented deficiency* (soil or tissue showing need), not free use. The derivation states the allowance unconditionally. If Catherine's audit asks "where's the Fe-deficiency record justifying this input," the model has none on file — and B1 notes there's no demand/tissue anchor either.
- **How to test it:** confirm the listing's use-condition; if deficiency-documentation is required, the §6 tissue trigger doubles as the cert record — note that link.
- **Cost if real:** medium — an input used without its required justification is exactly the organic-audit failure mode the cert flag exists to catch. `Guillaume call needed:` is there a documented Fe-deficiency basis, or is this preventive?

### Complexity
**C1 — fourth product added — but it documents an existing pour, so no cut** · `PENDING`
- **Specialist added:** IronSulfate as a 4th recipe product with its own ecFactor / phContribution / CE term.
- **Test:** changes a team action? No — the team *already* adds the iron; folding it in makes the model match the bucket (the CE/pH predictions were silently under-counting a real input). That's the right direction, not speculative complexity.
- **MVP version:** keep. The one observation: its CE contribution is 0.018 of 0.85 (~2 %) — negligible for the cap, so the value of including it is coherence (model = as-poured), not CE accuracy. No change requested.

### Cert defense
**D1 — ecFactor 1.2 (cert 2), self-flagged "reconcile w/ global PRODUCT FeSO₄" — unresolved** · `PENDING`
- **Specialist's defense:** "divalent-sulfate analogy" — FeSO₄ is a strong mineral electrolyte, so ~6–10× the organic hydrolysates' 0.10–0.20 ecFactor is physically sensible.
- **What I'd need to accept cert ≥ 2:** cert 2 is honestly low; no challenge to the *number*. The defect is the dangling reconciliation note — a global `PRODUCT` FeSO₄ presumably already carries an ecFactor, and the local 1.2 was set by analogy without checking it. Either cite the global value (and why local diverges, as the other three products do in the `data.js` header) or drop the "reconcile" note once done.
- **My read:** cert 2 fine. The CE contribution is ~2 % of total, so even a 2× error here is <2 % on the cap — low stakes. Close as "honest cert + finish the reconciliation note."

### Verdict
Land — the iron channel is a sound model-matches-reality addition. Address B2 (organic-cert conditionality — the only audit-touching item, Guillaume call) before relying on it for Catherine; fold Fe into the tissue panel to close B1; finish the D1 reconciliation note. No dose challenged.

## 2026-06-20 — review of nutrition/lettuce/soil-ph/model/derivation.md (HEAD working-tree diff)

Scope: one new paragraph under § Guardrails — "Live breach (2026-06)": June field SME CE 4.01 dS/m, "~3× the 1.3 guardrail", up from 1.08 in April → sulphur on HOLD until leaching. Cites `../learnings/field-sme-salinity-climbed-2026-06.md`. No constant/dose/cert/stage moved; sibling `spec.md` still zero-slug (blocked on PO band + calcimeter). The HOLD direction itself is well-founded — not challenged.

### Blindspots
**B1 — "~3× the 1.3 guardrail" compares SME (saturated-media extract) against an ECe (saturation-paste) guardrail — cross-method multiple** · `PENDING`
- **What the spec assumes:** CE 4.01 (Berger SME) ÷ 1.3 (the guardrail) = ~3× over.
- **What might be ignored:** the guardrail row reads **ECe ≤ 1.3 dS/m** (FAO saturation-extract basis), and the file's own pH section forbids mixing scales "~0.3 unit apart … never in one calculation." SME and ECe are different extracts; Berger SME is calibrated for soilless mixes, applied here to a mineral bed. The *trend* (1.08 → 4.01, same lab/method) is apples-to-apples and solid — but the *absolute* "~3× over the guardrail" silently equates SME dS/m with ECe dS/m. The same memo that warns against the pH scale-mix performs the EC scale-mix one paragraph later.
- **How to test it:** one paired reading — SME vs saturation-paste (or 1:1/1:2 with the stated conversion) on the same sample — to fix the SME→ECe offset; until then state the multiple as "SME 4.01 vs an SME-equivalent of the 1.3 ECe guardrail," not a bare 3×.
- **Cost if real:** low **for the HOLD** (the 4× same-method climb justifies holding regardless of the offset) — but feeds B2.

**B2 — the HOLD's release gate is undefined: "EC back under the guardrail" on which scale?** · `PENDING`
- **What the spec assumes:** resume sulphur once "leaching brings EC back under the guardrail" (1.3).
- **What might be ignored:** if the operator waits for **SME** ≤ 1.3, that's essentially the April baseline (1.08) — coincidentally near-right but not derived; if they read 1.3 as **ECe** and convert, the SME resume-threshold is some higher number. The gate is the only thing standing between "salt-stressed crop" and "add more salt." Resume too early → S⁰/gypsum EC pulse onto a scorch-band crop right as fast-cycle seedlings go in (the file's own worry). Resume too late → defers needed pH correction on a confirmed calcareous/Ca-saturated bed. B1's unresolved offset is exactly what makes this gate ambiguous.
- **How to test it:** set the resume number in the scale actually being measured (SME) — e.g. "resume when field SME CE ≤ X," X anchored on the April-normal SME band, not the FAO ECe figure.
- **Cost if real:** medium — wrong-direction either way on the lever the whole programme rides on.

### Complexity
No cut. The note changes a team action (HOLD sulphur) → it stays. One hygiene flag (flag-don't-fix): the HOLD has no entry in § Refinement triggers — the list says what *picks/refines* a dose but not what *clears the hold*. A future reader scanning triggers won't see "EC retest under threshold → resume." Add a clear-condition row when B2's number is set.

### Cert defense
No new challenge. The note states CE 4.01 as fact — accurate (that's the lab read), and the learning is honest about provenance (single sample, unlabelled bag "sac non identifié", "minor provenance wobble"). The soft part is the interpretive "~3×" (B1), not the datum. The learning correctly keeps SME pH 6.68 as a secondary-guardrail point, not a new anchor — consistent with this file's anchor-on-Mehlich rule.

### Verdict
Ship the HOLD — it's the right call and well-evidenced by the 4× same-method climb. Address B1 (restate the multiple in one scale, or footnote the SME→ECe offset) and B2 (set the resume threshold in measured-SME terms) before the bed is leached and someone has to decide when to resume — that's when the undefined gate bites. Both are low-effort precision fixes, no dose moved.

## 2026-06-20 — addendum, soil-ph/model/derivation.md (§ pH-scale change — not covered above)

The entry directly above reviewed only the § Guardrails "Live breach" paragraph (B1 SME-vs-ECe basis · B2 resume-gate). The **same diff also edited § pH scale** — added the June SME pH 6.68 as a second point and the claim "the Ca-saturated carbonate picture is **unchanged**." That second change wasn't reviewed; one finding on it, not a re-raise of B1/B2.

### Blindspots
**B3 — "carbonate picture unchanged" ignores that the bed self-acidified 0.8 unit — the carbonate-titration dose table may now overshoot** · `PENDING`
- **What the spec assumes:** the June SME-pH drop is purely a "secondary-guardrail signal," so the dose table (S = 0.32 × CaCO₃, full-pool titration) stands as-is.
- **What might be ignored:** the same field SME shows **sulfate 417 ppm + nitrate-N 388 ppm** (fish-N nitrification) — both acid-generating — and SME pH fell **0.8 unit in one season**. That in-situ acid load is *already consuming carbonate* the dose table assumes elemental sulphur must neutralise. "Unchanged" answers "still alkaline/Ca-saturated?" (yes) but not "how much carbonate has the season's own acid already titrated?" Dosing the full table-S on top double-counts neutralising capacity → overshoot toward the salt-sensitive 6.0 floor once leaching resumes.
- **How to test it:** take the pending calcimeter *after* this acid load (not against the April assumption); net table-S against the observed self-acidification (the 0.8-unit/season SME drop is a first estimate of the rate the bed acidifies unaided).
- **Cost if real:** medium — overshoot on a crop whose own root-zone pH band is still PO-pending (no defined endpoint to titrate toward yet), with no guardrail beneath the 6.0 floor.

### Verdict
The "not a new anchor" framing for 6.68 is correct (consistent with anchor-on-Mehlich). The gap is the unexamined "carbonate unchanged" → dose-table-stands inference: the bed is now acidifying itself, which the full-pool titration doesn't credit. Gate the next dose on a *post-acid-load* calcimeter, not the April carbonate picture. No dose moved this diff.

## 2026-06-28 — review of nutrition/lettuce/soil-ph/model/derivation.md (HEAD working-tree diff)

Scope: the § Guardrails "Live breach" paragraph reviewed at lines 372–396 **changed its operative decision** — from *sulphur on HOLD until leaching* to **program continues; leach under the guardrail before each pass** (Guillaume call 2026-06-20, per the learning). Plus: aeration row now links `protocol/bed-drainage-test.md`; § pH scale gains the June SME pH 6.68 as a second point. No constant/dose/cert/stage moved; sibling `spec.md` still zero-slug.

**Carry-forward, not re-raised:**
- Prior **B2** (HOLD resume-gate undefined, line 383) is now **MOOT** — there is no HOLD; it's continuous leach-before-pass.
- Prior **B1** (the bare "~3× the 1.3 guardrail" mixes Berger **SME** dS/m against an **ECe** guardrail, line 377) **carries forward and now bites harder** — the live decision *gates each sulphur pass* on that guardrail. The leach protocol does define a conversion for its own trigger (1:1 slurry 0.65 ≈ ECe 1.3, `salt-leach.md`), but the derivation's "CE 4.01 vs 1.3 = 3×" still equates SME with ECe with no offset stated. Three scales now in play (SME 4.01 / ECe 1.3 guardrail / 1:1 0.65 leach trigger).
- Prior **B3** (line 403, "carbonate unchanged" ignores the 0.8-unit self-acidification → full-pool dose table may overshoot) still stands — the pH-scale edit is the same change, no new claim.

### Blindspots
**B1 — "program continues" rests on a cert-1 leach-efficacy rule never validated on THIS bed; on fast-flip beds the leach must outpace each pass's gypsum-EC or salt ratchets** · `PENDING`
- **What the spec assumes:** leaching reliably pulls the bed back under guardrail before each sulphur pass, so dosing can continue at a 3×-breached, salt-sensitive bed.
- **What might be ignored:** the efficacy number is the protocol's own **cert-1** FAO reclamation rule (~100 L/m² over 2–3 passes from 4 dS/m, `salt-leach.md` step 6), gated on a drainage pre-check that isn't yet confirmed on this bed. Lettuce flips every few weeks (the file's own cadence point) → each cycle must complete a multi-pass leach *and* a sulphur pass within that window. If leach throughput lags the flip rhythm, or drainage perches (the pre-check's own failure mode), each gypsum-EC pulse stacks on a bed not yet cleared → salt ratchets up on the crop the guardrail exists to protect. The derivation states the continue-decision as settled; the cert-1 basis + drainage precondition live only in the protocol, invisible to a derivation reader.
- **How to test it:** first-cycle field validation — paired 1:1 slurry EC before leach / after leach / after the subsequent sulphur pass on the actual bed; confirm one full cycle lands back under 0.65 within the flip window before relying on the rule.
- **Cost if real:** **high** — salt-sensitive crop, yield falls fast above ECe 1.3; a leach that can't keep pace means continued dosing actively worsens the constraint the whole strategy is fighting.

**B2 — the saline-not-sodic "keep dosing" call rests on a single RAS 1.29 from an unlabelled-bag sample** · `PENDING`
- *Guillaume call needed (already decided 2026-06-20 — surface for confirmation, not relitigation):* the continue-vs-pause fork was Guillaume's, on the basis that the salt is leachable (RAS 1.29, sulfate/nitrate-dominated, not sodic).
- **What the spec assumes:** RAS 1.29 = low → neutral salts → leachable → safe to keep dosing.
- **What might be ignored:** that RAS is one mid-season SME, and the report flags the bag was unlabelled ("sac non identifié"). The entire continue-dosing decision pivots on this one number being right. The learning acknowledges the wobble + cross-checks tissue Na (3166) for the *direction*, but RAS itself is single-point.
- **How to test it:** a second field SME RAS on a labelled sample next cycle confirms the salt stays sub-sodic before further passes; if Na/RAS is climbing (the field trend Na 40 → 124 already shows accumulation), the "leachable" premise weakens.
- **Cost if real:** medium — if the salt trends sodic, plain-water leaching stops working and continued dosing compounds it; but it's a slow-moving, retest-catchable failure, and Guillaume owns the call.

### Complexity
No cut. No new constant, stage, or branch — the diff changes a decision (HOLD → continue+leach) and adds two pointers. The aeration `bed-drainage-test.md` link is a pure improvement: it surfaces inline the exact drainage precondition the leach protocol's pre-check depends on (and that B1 leans on). Keep.

### Cert defense
No new challenge. CE 4.01 / RAS 1.29 / Na 124 are stated as lab facts — accurate. The interpretive softness is in B1 (cert-1 leach rule presented as a settled mechanism) and B2 (single-sample RAS), both logged as blindspots, not cert mislabels — the derivation doesn't over-stamp a cert on either.

### Verdict
The continue+leach direction is Guillaume's call and defensible *if* the bed leaches as the FAO rule predicts — but that "if" is the whole bet and is cert-1, unvalidated on this bed, and time-pressured by the flip cadence. Land the diff; gate ongoing dosing on B1's first-cycle leach validation (does one real cycle return under 0.65 in the flip window?) and B2's second RAS read. Carry-forward B1-scale / B3-carbonate remain open from the prior entries. No dose moved this diff.
