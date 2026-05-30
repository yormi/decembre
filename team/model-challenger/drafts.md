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
