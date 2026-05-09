# Requirements challenges — adversarial review

Date: 2026-05-05.

## Summary

24 challenges total. By severity: **6 blocking**, **12 important**, **6 minor**.

**Top 3 priorities:**
1. **Challenge 1 (REQ-005)** — `setSoiltargetCrop` is a routed-state setter that mutates `soiltargetCrop` (which `cropFor()` reads for the URL hash on the soltarget page) but it is *not* in the verification list. The "list of setters" is enumerated by hand and grew stale the moment soltarget shipped. Same risk for any future page-local crop / stage state.
2. **Challenge 2 (REQ-022 + the future `PRODUCT` registry)** — `organicAllowed: true` is a binary flag, but Ecocert input listings are conditional, time-limited, and supplier-specific (CaCl₂ Teris case, Finding 9 in coherence audit). Boolean field + grep gives false confidence; the requirement passes while a non-listed supplier ships under a listed substance name.
3. **Challenge 14 (REQ-016) — ±5% drift threshold is below the noise floor of the inputs.** Many label analyses are ±5%, manual weighing on a kitchen scale is ±2-3%, and the Dosatron is ±5-10%. A model-vs-stored comparison with a tighter threshold than the underlying measurements will flag noise as drift, train operators to ignore the alert, and lose the signal.

A pattern across many challenges: REQs 010-032 and 053-057 are explicitly "target spec, not currently wired" yet none of them carry a TODO/owner/scheduled date or a `pending: true` annotation. The script is silent about them. A reader skimming requirements.md cannot tell at a glance which REQs are *invariants* (REQ-001..009) and which are *aspirational*. Easy fix: a column or header tag.

A second pattern: text-content greps (REQ-001, 006, 007) are robust against literals but blind to template literals, attribute interpolation, and innerHTML construction. They catch handwritten regressions; they don't catch programmatic ones.

---

## Challenge 1 — REQ-005's setter list misses `setSoiltargetCrop` (and any future page-local setter)

**REQ:** REQ-005
**Challenge:** The verification asserts `setPage`, `setCrop`, `setDiagCrop` each call `syncHash()`. But `setSoiltargetCrop` (index.html:3944) is also a routed-state setter — `soiltargetCrop` is exactly what `cropFor('soltarget')` returns, so it goes into the URL hash. It does call `syncHash()` (line 3959), but only by luck: nothing in the script forces it. If a future refactor drops the call, REQ-005 still passes. The same risk applies to any future page-local setter (e.g., `setSoiltargetStage`, `setNutrCrop`).
**Severity:** important
**Why it matters:** REQ-005's whole point is "the check has to fail loudly for new pages." It enumerates setters by hand; it does not enumerate them from the code. So it fails loudly for forgetting `PAGES`, but quietly for forgetting `syncHash()` in a new setter.
**Options:**
- Option A: Append `setSoiltargetCrop` to the explicit list. Fast; remains brittle for the *next* setter.
- Option B: Derive the setter list from `CROP_PAGES` keys + a known-setter pattern (e.g., assert that every page in `CROP_PAGES` has a corresponding `set<Page>Crop` or that `setCrop`/its peer for that page calls `syncHash()`). More robust but more grep gymnastics.
- Option C: Rewrite `parseHash`/`syncHash` so setters call a single `routedStateChanged()` helper, then assert that helper exists and is called from each setter. Refactor cost is real but the invariant becomes structural.
**Recommendation:** Option A this week (close the immediate gap), Option C at next routing refactor. Cert 5 on the gap; cert 3 that Option C is the cleanest long-term shape.

---

## Challenge 2 — REQ-022's `organicAllowed: true` is binary; reality is conditional

**REQ:** REQ-022
**Challenge:** "Build fails if any active recipe references a product where `organicAllowed` is false or unset." A binary flag treats "the substance CaCl₂ is allowed under CAN/CGSB-32.311" the same as "this specific Teris industrial-grade SKU is on the Ecocert input list this year." Coherence audit Finding 9 already documented exactly this: CaCl₂ Teris is in active recipe with a comment saying "Ecocert listing not yet verified." Once REQ-022 ships, somebody marks `organicAllowed: true` from the substance argument and the build passes — the supplier-specific gap stays open.
**Severity:** blocking
**Why it matters:** Audit risk is Décembre-existential. A flag that conflates substance allow-listing with SKU verification is worse than no flag because it provides false confidence. CLAUDE.md memory `feedback_organic_cert_flag` already says state CAN/CGSB-32.311 status (allowed/prohibited/unknown) — three values, not two. The requirement's verification crystallizes the wrong shape.
**Options:**
- Option A: Replace `organicAllowed: true|false` with `organicStatus: 'listed' | 'substance-allowed-supplier-pending' | 'prohibited' | 'unknown'`, plus `listingRef: 'Québec Vrai 2026-01' | null` and `verifiedDate: 'YYYY-MM-DD'`. Build-fails on `prohibited`/`unknown`; warns on `substance-allowed-supplier-pending` if `verifiedDate` is older than 12 months.
- Option B: Keep boolean, add separate `supplierVerified: { date, source }` field with its own check. More fields, same shape.
- Option C: Leave binary; document in REQ-022 that `organicAllowed: true` requires SKU-level verification not just substance-level. Relies on reviewer discipline.
**Recommendation:** Option A. Cert 4 that the boolean shape will produce a Finding-9-style miss again.

---

## Challenge 3 — REQ-029's "Ksp at 20°C" ignores the actual barrel temperature range

**REQ:** REQ-029 (and REQ-021, same issue)
**Challenge:** REQ-029's table gives Ksp thresholds without naming a temperature, but the rationale paragraph implies a single value. REQ-021 says the cap is "stored at 5°C reference, not 20°C" — but Ksp values for the pairs in REQ-029 (gypsum, struvite, FePO₄, Fe(OH)₂) are all temperature-dependent, and the barrel is 5°C in winter morning and 25°C+ in summer afternoon. A pair within Ksp at 20°C can be supersaturated at 5°C; conversely, FeSO₄ in a stock barrel that warmed to 30°C in July oxidizes faster than at 20°C, shifting the *kinetic* (REQ-032) bound, not the *thermodynamic* (REQ-029) one.
**Severity:** important
**Why it matters:** The Ksp check claims to be a precipitation guard. Run at 20°C reference while real water is 5-25°C, the guard reports clean for borderline pairs that actually precipitate in the cold morning. Same shape as REQ-021 — that one explicitly names the issue and uses a 5°C cap. REQ-029 doesn't, so the two requirements use different thermal references.
**Options:**
- Option A: Pick the binding-case temperature per pair (5°C for solubility/Ksp where cold reduces solubility, e.g. K₂SO₄, gypsum; 25°C+ for cases where heat drives the kinetic problem) and document it in the table.
- Option B: Compute the predicted concentration at the actual logged barrel temp and compare against a temperature-dependent Ksp curve. Honest but a lot of work for cert-3 numbers anyway.
- Option C: Add a worst-case multiplier (e.g., evaluate at 0.85× concentration to cover thermal margin) and document the assumption.
**Recommendation:** Option A. Cert 4 that picking 5°C for the precipitation-on-cooling pairs is the right call; the temperature dependence of CaSO₄ solubility flips around 40°C so cold is harsher.

---

## Challenge 4 — REQ-029a/b/c "build fails" mechanism is hand-wavy

**REQ:** REQ-029a, REQ-029b, REQ-029c
**Challenge:** Each says "build fails if X." But the project has no build system — `index.html` is a single static file, validated by `scripts/check-requirements.sh`. None of these checks exist in the script today (REQs 010+ are flagged "target spec, not currently wired"). The phrase "build fails" implies an enforcement mechanism that doesn't exist. When 029a/b/c get implemented, will the script (a) parse JS source as text via grep, (b) execute the JS in node and assert at runtime, or (c) run a separate JS-side test harness? Each path has very different fidelity. REQ-029b's cartesian-product check across all cation × anion declarations specifically requires either a JS evaluator or a JSON sidecar — bash + grep cannot do it cleanly.
**Severity:** important
**Why it matters:** A REQ that promises automated enforcement without specifying the enforcement layer will quietly degrade to "manual review" when implementation hits friction. coherence-audit Finding 13 already shows this dynamic: REQ-028's 90% cert-coverage is a target spec, current code is 38%, and the gap is being deferred indefinitely.
**Options:**
- Option A: Specify the implementation layer per REQ ("REQ-029b verified by node-based test in scripts/check-recipes.mjs that imports PRODUCT and runs the cartesian check"). Forces an architectural decision now.
- Option B: Reframe "build fails" as "release-candidate validator fails" and commit to a node-script approach for REQ-010+. Single new tool, structural.
- Option C: Mark REQ-010+ as "manual review until verifier exists" in the requirements doc itself. Honest, but defers the structural question.
**Recommendation:** Option B. Cert 4: bash+grep cannot reasonably enforce structural invariants over a JS object graph. Decide on the verifier shape before implementing the model, or you'll redesign mid-flight.

---

## Challenge 5 — REQ-001's grep table is bypassed by template literals and attribute interpolation

**REQ:** REQ-001
**Challenge:** All seven patterns in the script start with a literal `>EC` or French-phrase + literal `EC`. They do not match: (a) text injected via `el.textContent = 'EC ' + value`, (b) template literals like `` `EC ${val} mS/cm` ``, (c) attribute-set strings used by frameworks (`title="EC trop élevée"`), (d) localized JSON pulled from a future config file. The current code is mostly literal HTML so the check works *today*, but as the codebase grows the grep loses coverage silently — no signal that it's narrower than the requirement statement.
**Severity:** important (the requirement is structurally important to UX consistency; verification is brittle in a way the README doesn't acknowledge)
**Why it matters:** REQ-001 says "all user-facing UI text uses CE." The grep covers a particular subset of how text reaches the DOM. As soon as a single `` `${foo} EC` `` slips in, the script keeps passing while the UI degrades. Catches handwritten regressions; misses programmatic ones.
**Options:**
- Option A: Render the page in a headless browser (puppeteer/jsdom), walk the DOM, regex the resulting text content. Robust; ~30 min of tooling.
- Option B: Constrain the codebase to literal text in HTML (no `textContent =` writes, no template literals containing user-language) and document that constraint in REQ-001. Cheap; trades flexibility for grep simplicity.
- Option C: Add JS-side patterns to the grep (`textContent\s*=\s*['"\`].*EC ` etc). Catches some cases; still fundamentally regex.
**Recommendation:** Option A when a second instance of this brittleness shows up; Option B documented now to set expectations. Cert 4 that A is the right long-term shape; Cert 3 that the team will hit Option B's constraint within 6 months as the app grows.

---

## Challenge 6 — REQ-007's `JARGON_DENY` only contains one term

**REQ:** REQ-007
**Challenge:** The denylist today is `["dryback"]`. The requirement statement names "*ouvrier agricole québécois* wouldn't readily understand" as the bar. Words a French-speaking *ouvrier agricole* would need to look up appear all over the app: "transpiration," "dryback," "fertigation" itself (the page name), "tensiometric," "ppm," "Mehlich-3," "SME," "pH-buffer," "cation-saturated," "dripper," "Dosatron," "dosatron 2%," "pour-through" (REQ-001 coexists awkwardly with a translated jargon term — "lessivat" is in line 1297 but "pour-through" appears in tooltips). The mechanism for adding terms ("when a term comes up that the team can't parse, append") relies entirely on user reports; there's no proactive scan.
**Severity:** important (UX risk; team mistakes downstream)
**Why it matters:** The list is a denylist with one entry. Most jargon is currently in the app and undetected. The requirement creates a false sense that jargon is being audited.
**Options:**
- Option A: Expand `JARGON_DENY` based on a one-time review of the app text by a non-specialist French speaker. Document Catherine's role here (per `feedback_review_workflow`).
- Option B: Invert the rule — maintain a small allowlist of approved technical terms (CE, mS/cm, ppm, kg/ha, Mehlich-3 — terms the team has been trained on) and flag any term outside that list. Stricter; more false positives.
- Option C: Leave as-is. Reactive denylist works for the small team; new violations get caught when somebody flags them.
**Recommendation:** Option A through Catherine's review pass before next major rollout. Cert 4 that the current denylist is missing real jargon.

---

## Challenge 7 — REQ-008's `4 -` pattern matches anything, anywhere in the function

**REQ:** REQ-008
**Challenge:** The check looks for the literal substrings `|| 7` and `4 -` inside `getWeekNumber()`'s body. Both can appear in unrelated code that does not implement the Thursday-pivot. Examples: `// off-by-one fix from 2026 — 4 - month adjustment commented out`, `if (weekday || 7 === something)`. Either fragment in a comment is enough to pass. Conversely, a refactor using `dayNum - 4` instead of `4 - dayNum` (the algebraic equivalent if you flip the sign elsewhere) would silently fail the check while the algorithm remains correct.
**Severity:** minor (the actual algorithm is small and stable; cosmetic refactor risk is real but bounded)
**Why it matters:** The check is brittle on purpose, per the requirement text. But "brittle on purpose" passes if the two fragments appear *anywhere* in the body — including comments. A defensive comment like `// previous formula used 4 - jan4.getDay()` would pass the check after the actual algorithm was deleted.
**Options:**
- Option A: Replace the two greps with a small JS test — execute `getWeekNumber()` against a known pinned date (e.g., 2026-01-04 should return 1, 2025-12-29 should return 1) via node. Real correctness check.
- Option B: Tighten the grep: pattern must include both fragments on non-comment lines, in the right order, within a small line distance.
- Option C: Leave as-is. The brittle-on-purpose bet is OK if the function stays small.
**Recommendation:** Option A. Cert 5 that a node-driven runtime test on pinned dates is shorter than the current grep prose and unambiguously catches the regression. The reason this isn't done already is presumably that scripts/check-requirements.sh is bash-only — see Challenge 4.

---

## Challenge 8 — REQ-009's "weeks 19-52 fall back to monthly, cert 3" with no UI surfacing

**REQ:** REQ-009
**Challenge:** Today is week 19. The model is *right now* using the monthly fallback. The REQ acknowledges "Cert drops to 3 for those weeks" but the verification only checks weeks 1-18. There is no requirement that the UI surface the cert drop. Coherence audit Finding 10 already raised this, so I won't re-litigate the UX gap — but the *requirement* is incomplete as written: it specifies what the array must contain for weeks 1-18 and is silent on the visible behaviour for 19-52. A clean REQ would either pin the full year or specify the UI treatment of the fallback.
**Severity:** minor (REQ scope mismatch with operational reality)
**Why it matters:** The verification passes today and will pass throughout weeks 19-52, while the model accuracy degrades silently. The REQ as written is internally consistent but doesn't cover the period where the team actually uses it.
**Options:**
- Option A: Extend the REQ to "weeks 1-52, cert 5 for any week with weekly data, cert 3 displayed in UI for any week using monthly fallback." Add the UI cert tag check.
- Option B: Resolve coherence-audit Finding 10 Option A (extend the table to 52 weeks) and update REQ-009 accordingly. The requirement becomes simpler.
- Option C: Leave it; document that REQ-009 is a partial-year invariant by design.
**Recommendation:** Option B. Single clean fix. Cert 5 that the data exists.

---

## Challenge 9 — REQ-013/014 thresholds (0.9× / 1.3×) are unjustified

**REQ:** REQ-013, REQ-014
**Challenge:** Why 0.9 and not 0.85 or 0.95? Why 1.3 and not 1.5 or 1.2? The rationale gives the *direction* (under-fert is bad, luxury is bad) but no agronomic basis for the specific thresholds. The under-fert side has a real-world anchor (visible deficiency typically appears at ~70-85% of demand depending on element and stage); the luxury side is fuzzier (K-Mg antagonism kicks in at K:Mg ratios, not absolute K excess). A blanket 1.3× ceiling will flag the current K luxury feeding (coherence-audit Finding 2 says current K is 2.18× demand at T5) — fine, that's the point. But a small mode adjustment that pushes K to 1.31× at T5 would also fail, which is operationally the same recipe.
**Severity:** important
**Why it matters:** Thresholds without justification don't survive operator pushback. When the model flags "K supply 1.31× demand: luxury feeding" the operator either accepts every flag (alert fatigue) or starts editing the threshold to suppress it. Either path defeats the requirement.
**Options:**
- Option A: Element-specific bands. K and Mg can run higher (1.5× — soil reservoir absorbs excess); micros tighter (1.2× — toxicity risk closer); N tighter still (1.15× — vegetative push, fruit dilution). Justify each per element with an inline comment.
- Option B: Stage-aware bands (T1-T2 wider — small absolute amounts, large relative noise; T4-T5 tighter — recipe is calibrated and matters).
- Option C: Keep 0.9/1.3 as default but allow per-element override declared in `BIOMASS_DEMAND` or a parallel `DEMAND_BANDS` table.
**Recommendation:** Option C — gives the model a uniform rule with explicit per-element exceptions. Cert 3 on the agronomic asymmetry between elements; cert 4 that uniform 1.3× is operationally too tight on K specifically.

---

## Challenge 10 — REQ-013's `acceptedDeficit` annotation has no expiry

**REQ:** REQ-013
**Challenge:** "Below 0.9 requires explicit `acceptedDeficit: { reason: '...' }` annotation on the stage entry — silent failure not allowed." But `acceptedDeficit` once added stays added; no requirement that the reason be revisited. Coherence audit Finding 6 (Iron lettuce fertigation) is exactly the shape of "this is decorative but we keep it for X" — in 18 months X may no longer apply, but the annotation persists. Same risk for any deficit explicitly accepted: by year 2 the rationale is folklore.
**Severity:** minor
**Why it matters:** Override mechanisms degrade over time. Without an expiry or review-by date, every accepted deficit becomes permanent.
**Options:**
- Option A: Require `acceptedDeficit: { reason, until: 'YYYY-MM-DD', cert: N }`. Verifier fails if `until` passed.
- Option B: Annual review process documented in the requirement (manual).
- Option C: Leave as-is; trust that `acceptedDeficit` annotations get reviewed during recipe revisions.
**Recommendation:** Option A. Cert 4 that without a date the override becomes invisible.

---

## Challenge 11 — REQ-015's efficacy/safety bands need a source-of-truth, not just a structural slot

**REQ:** REQ-015
**Challenge:** The REQ says "in-tank concentration falls within `[efficacy_min, safety_max]` declared in `PRODUCT[product]`." Where do these numbers come from? CaCl₂ for BER has a 1500-3000 ppm Ca²⁺ literature window, cert 3-4. Mn foliar 100-500 ppm, cert 2-3. Cu foliar much narrower. The REQ specifies the *slot* but not how the values get filled or who validates them. A future Claude session populating these from a single google-search will produce numbers that pass the type check and fail the agronomy test.
**Severity:** important
**Why it matters:** REQ-015's whole point is to bound concentration-mode products. Bands of unknown provenance defeat the bound. This shape (specify a slot, leave the values to "later") is how cert-1 numbers get baked in as if they were cert-4.
**Options:**
- Option A: Require `efficacy_min` and `safety_max` to carry a `source` field (literature ref / extension service / product datasheet) and a `cert` field. Verifier fails on missing source/cert.
- Option B: Maintain a separate `BANDS_LITERATURE_REFS.md` doc that REQ-015 cites by hand. Less mechanical pressure.
- Option C: Pin the bands in REQ-015's text directly so the source-of-truth is the requirement, not the code.
**Recommendation:** Option A. Cert 5 that bands without provenance are next year's bug.

---

## Challenge 12 — REQ-024 "predicted CE" — per-shot vs time-averaged ambiguity not resolved

**REQ:** REQ-024
**Challenge:** Coherence audit Finding 8 already raised that the lettuce 1.2-1.8 mS/cm band could be either per-shot (irrigation at dripper while fertigation is active) or time-averaged across the week (mixed fertigated + plain water). The current per-shot CE in lettuce is ~5.9 mS/cm; time-averaged is ~2.0. REQ-024 says "Irrigation at dripper" without disambiguating. The verification "runs `predictedCE` for every (crop, stage), asserts within band" — but `predictedCE`'s contract is undefined for this distinction, so the test reflects whichever interpretation the implementer baked in.
**Severity:** blocking (the lettuce situation is operationally significant per coherence audit)
**Why it matters:** A REQ whose verification can pass under either interpretation is no constraint. Whichever interpretation the implementation picks, the other interpretation hides a real risk.
**Options:**
- Option A: Two separate bands: `CE_at_dripper_active` (per-shot) and `CE_at_dripper_timeavg` (over the week). Both must hold. Tomato T5: per-shot 2.0-3.0 (current band), time-avg 1.5-2.5.
- Option B: Single band, declared explicitly as time-averaged. Per-shot may exceed; substrate buffering absorbs the spike.
- Option C: Single band, declared explicitly as per-shot. Stricter; implies recipe restructuring for lettuce.
**Recommendation:** Option A. The two bands answer different physical questions (osmotic stress at the dripper vs steady-state substrate accumulation). Cert 4 that conflating them is the root of Finding 8.

---

## Challenge 13 — REQ-024 has no transition / hysteresis behaviour between stages

**REQ:** REQ-024
**Challenge:** Tomato T2 max is 2.5 mS/cm; T3 min is 2.0 (fine, overlaps). But T5→T1 wrap (week 27 starts T1 again at 1.5-2.5? actually T1 winter only) has a step. In practice the recipe transitions abruptly at stage boundaries (week 6 → week 7 jumps from 1297 g K₂SO₄ to 1689 g, +30%). REQ-024 checks per-stage compliance but is silent on whether the stage-to-stage delta is acceptable. A 30% jump in one week creates root osmotic shock if not ramped over 2-3 cycles.
**Severity:** minor (the current stages are coarse enough that operators don't perceive a discrete jump because solar/transpiration ramp continuously and the recipe matches solar; but the REQ is silent)
**Why it matters:** A REQ specifying band per stage doesn't specify trajectory between stages. Future: a steeper recipe ramp could pass per-stage and damage roots in transition.
**Options:**
- Option A: Add `delta_max` between consecutive stages (e.g., week-over-week CE change ≤ 20%). New REQ.
- Option B: Document that stage transitions are gradual per `getStageFromWeek` boundaries and ramp behaviour is implicit in recipe design. No new check.
- Option C: Leave it; operationally not currently a problem.
**Recommendation:** Option C. Cert 4 that current ramp is fine; revisit if a future recipe does aggressive jumps.

---

## Challenge 14 — REQ-016's ±5% threshold is below the noise floor of inputs

**REQ:** REQ-016
**Challenge:** `computeRecipe` would derive expected dose from demand, base efficiency, pH response, etc. — each input has its own uncertainty. PRODUCT_PCT (label-stated, ±2-5% typical), Dosatron actual ratio (calibration ±5-10% per Bluelab field check), manual weighing (kitchen scale, ±2-3%), efficiency curve points (cert 3, easily ±20%). Stacked, the realistic uncertainty on a stored recipe vs computed value is **±15-25%**. A ±5% threshold means almost every recipe will fail the check on first run, the team learns to ignore it, signal lost.
**Severity:** blocking (alert-fatigue defeats the requirement structurally)
**Why it matters:** Same shape as REQ-013/014 thresholds (Challenge 9), but worse here because every recipe is checked. This is the requirement that's supposed to keep the model honest as recipes evolve; if it noise-floods on day 1 it gets disabled or relaxed to 30% and provides no signal.
**Options:**
- Option A: Loosen to ±15% (matches realistic compounded input uncertainty).
- Option B: Two thresholds — green ≤ 5%, yellow 5-20%, red > 20%. Differentiate "model and stored agree" from "model and stored have drifted."
- Option C: Tier by element — macros (K, N, Mg) tighter (10%) since recipes are precise; micros wider (25%) since efficiency uncertainty dominates.
**Recommendation:** Option B. Three-state output gives the operator information rather than a binary panic. Cert 5 that 5% is the wrong threshold.

---

## Challenge 15 — REQ-017's `phResponse` curve has no required cert annotation

**REQ:** REQ-017
**Challenge:** `phResponse[phClass](currentSoilPh)` — the curve points themselves carry no cert annotation requirement under REQ-017 (REQ-028 covers this conceptually, but REQ-028 is at 38% coverage per coherence-audit Finding 13). The Cadre framework page (`index.html:1522` and surrounding) lists "FeSO₄ in fertigation at pH 7.4: 10-20%" — that's a 2× spread on a number that drives effectiveness. A curve passing through the midpoint with cert 1 is treated identically to a curve through cert-5 measurements. The model layer can't surface uncertainty it doesn't know about.
**Severity:** important
**Why it matters:** This is the load-bearing curve. Treating cert-1 and cert-5 points the same is exactly the kind of "calibrated uncertainty" miss CLAUDE.md repeatedly flags.
**Options:**
- Option A: Each `PH_RESPONSE` curve point is `{ ph, eff, cert }`. Bilan UI surfaces cert-weighted uncertainty bars on supply numbers.
- Option B: Per-curve cert (single number for the whole curve). Less granular; less work.
- Option C: Defer to REQ-028 (which has the same intent at 90% coverage). Document that REQ-017 inherits REQ-028.
**Recommendation:** Option B. Cert 4: per-curve cert is enough fidelity for this purpose; per-point is gold-plating.

---

## Challenge 16 — REQ-018's 0.05 efficiency floor is arbitrary

**REQ:** REQ-018
**Challenge:** "Products below 5% effective efficiency must be removed or flagged." Why 5% and not 10% or 1%? At pH 7.4 with current SME, FeSO₄ in fertigation is *exactly* in the 10-20% range per Cadre framework — passes REQ-018 (above 5%) but is in the explicit "do not fertigate" red zone in another view (coherence-audit Finding 6). The REQ's threshold legitimizes a recipe that another part of the app warns against. Two requirements expressing different rules about the same product: REQ-018 says "0.10 efficiency is fine"; coherence audit Finding 6 says "framework calls this red zone."
**Severity:** important
**Why it matters:** Internal contradiction. REQ-018 will pass the lettuce FeSO₄ ferti; the Cadre framework rule (which is *also* in code) flags it. Operator sees both signals and doesn't know which authority wins.
**Options:**
- Option A: Raise floor to 0.20 (matches the framework's "marginal" boundary). Forces re-examination of borderline recipes.
- Option B: Tier the floor by channel (foliar 0.05 fine — surface uptake; soil 0.20 — uptake competes with reservoir).
- Option C: Codify the Cadre framework as the source of truth and replace REQ-018's threshold with "must satisfy the framework's color-zone rule." Higher integration cost; resolves the contradiction.
**Recommendation:** Option C. Cert 4 that the framework table is the better authority since it's already cited operationally.

---

## Challenge 17 — REQ-022 doesn't catch products listed in PRODUCT but never used

**REQ:** REQ-022
**Challenge:** "Build fails if any **active recipe** references a product where `organicAllowed` is false." Products in `PRODUCT` but not in any active recipe sneak through unchecked. Today this is an edge case, but the recipe-model rebuild (REQ-010+) anticipates `PRODUCT` as a registry of available inputs, including ones commented out / future / on the bench. A non-allowed product sitting in `PRODUCT` with `organicAllowed: false` and *not* used is dormant — until a copy-paste during a hot-fix puts it in an active recipe and somebody forgets to flip the flag back. The REQ as written allows the hazardous state.
**Severity:** minor
**Why it matters:** Defense-in-depth principle says don't ship a sharp tool you never plan to use. A `PRODUCT` registry containing prohibited inputs is a future foot-gun.
**Options:**
- Option A: Build fails if **any** entry in `PRODUCT` has `organicAllowed: false|unset`. Stricter.
- Option B: Move prohibited-product reference data to a separate `PRODUCT_ARCHIVE` constant outside the active registry, and verify `PRODUCT` itself is clean.
- Option C: Leave as-is; trust operator review.
**Recommendation:** Option B. Cert 4 that the operational `PRODUCT` table should be 100% allowed and the archive should be an explicit "do not use" list.

---

## Challenge 18 — REQ-026's 15% drift threshold ignores temperature dependence of CE

**REQ:** REQ-026
**Challenge:** CE measurements are temperature-corrected to 25°C in lab pens (Bluelab does this automatically) but the substrate is rarely at 25°C (typically 16-22°C in greenhouse). At 18°C uncorrected, CE reads ~13% lower than corrected; corrected reading is fine. If the team measures at sensor temperature without correction (which happens — operators sometimes use a non-Bluelab pen), 15% drift is exactly within the temperature-confound zone. REQ-026 fires alerts that are temperature artifacts.
**Severity:** minor
**Why it matters:** Defining "drift" without specifying temperature reference makes the alert ambiguous. A hot afternoon vs cold morning measurement of the same substrate gives a 15% reading delta with no actual chemistry change.
**Options:**
- Option A: Require all logged measurements to be temperature-corrected. Enforce by recording the reading and the temperature.
- Option B: Widen drift threshold to 25% (covers temperature confound).
- Option C: Document that REQ-026 assumes temperature-corrected readings (implicit in Bluelab usage).
**Recommendation:** Option C with a note in the UI logging form. Cert 4 that all current measurements are Bluelab-pen.

---

## Challenge 19 — REQ-027's "0.5 mS/cm over 2 cycles" — different cycle durations for lettuce vs tomato

**REQ:** REQ-027
**Challenge:** Lettuce nursery cycle ≈ 5 days top-watering. Tomato bed "cycle" not defined — could be a single irrigation event, could be a fertigation period (every shot), could be calendar week. REQ-027 says "2 consecutive cycles (lettuce nursery) or 2 consecutive weeks (tomato bed)" — different units for different crops, and "cycle" undefined for nursery beyond context. A leach event triggered by 2 measurements 5 days apart for lettuce vs 14 days apart for tomato is operationally fine, but the REQ doesn't make the asymmetry explicit. Future stretched cycle (4-6 weeks lettuce, current crisis) means lettuce "cycle" expands; the threshold doesn't adjust.
**Severity:** minor
**Why it matters:** The drift threshold is per pair of measurements — not per unit time. Long cycles dilute the signal; short cycles oversample noise. Threshold should probably be normalized per week.
**Options:**
- Option A: Restate as "+0.5 mS/cm over 14 days, regardless of crop / cycle length."
- Option B: Per-crop threshold tables, per-stage if needed.
- Option C: Leave as-is; the team knows what cycle means in context.
**Recommendation:** Option A. Cert 4 that time-normalized is the right unit.

---

## Challenge 20 — REQ-028's 90% coverage threshold is currently at ~38%

**REQ:** REQ-028
**Challenge:** Coherence-audit Finding 13 measured ~38% inline cert coverage on a sample, against the 90% threshold. REQ-028 says "fails if coverage < 90%." So the requirement, if its verification ran today against the current code, would fail the script. But REQ-028 isn't in `check-requirements.sh` (it's in the target-spec block REQ-010-032). The requirement is defined to fail; it's silent because it's not wired. This is the pattern for several REQs in the target-spec block — they describe the desired end state but the requirements doc gives no path or owner for getting there.
**Severity:** important
**Why it matters:** "Target spec" REQs that would fail today are deferred indefinitely. The doc creates a false impression that these are aspirational; in practice they are unmaintained drift surfaces.
**Options:**
- Option A: Reframe target-spec REQs as `status: pending` with a planned-implementation date. Track completion explicitly.
- Option B: Lower REQ-028's threshold to current state (40%) plus a glide path (50% by end-Q3, 90% by year-end).
- Option C: Mark REQ-028 explicitly "deferred until recipe-model rebuild (REQ-010 implementation)."
**Recommendation:** Option C, paired with a top-of-doc table that names every deferred REQ and its blocker. Cert 5 that the target-spec block is currently undifferentiated from active invariants.

---

## Challenge 21 — REQ-053's foliar pH band [5.0, 7.0] versus REQ-055's curve peak at 5.5-6.0

**REQ:** REQ-053 vs REQ-055
**Challenge:** REQ-053 sets the foliar tank pH envelope to [5.0, 7.0] for "cuticle uptake window + leaf safety." REQ-055's foliarPhResponse curve gives multiplier 0.9 at pH 5.0 (i.e., 10% efficiency loss at the edge of the allowed band) and 0.85 at pH 7.0 (15% loss). The two REQs treat the boundary differently: REQ-053 says pH 7.0 is allowed; REQ-055 says pH 7.0 costs 15% uptake. A recipe with predictedTankPh = 6.95 passes REQ-053 cleanly and REQ-055 silently hands the operator a recipe delivering 85% of label dose. Worse: the operator gets no signal that 5.5-6.0 is the optimum. The model is internally consistent (each curve is what it is), but the *requirements* don't pin a target pH — only an envelope. Recipes will drift to the easy edge of the envelope (whatever's cheapest to achieve) and lose efficiency.
**Severity:** important
**Why it matters:** Two pH-related REQs that don't reference each other. Their interaction is undefined.
**Options:**
- Option A: Add a target pH (5.5-6.0) to REQ-053 with a soft warning band; hard-fail outside [5.0, 7.0]. REQ-055 multiplier becomes the soft-warning surface.
- Option B: Drop REQ-053's hard band, keep only REQ-055's curve. Implicit envelope: efficiency below 0.5 (= pH ≤ 4 or ≥ 8) blocks the recipe.
- Option C: Keep both; document the interaction in REQ-055 as "REQ-053's envelope defines absolute limits; REQ-055's curve defines uptake quality within the envelope."
**Recommendation:** Option A. Cert 4 that "anywhere in the envelope is fine" creates worse recipes than "target with margins."

---

## Challenge 22 — REQ-055's foliar pH curve is asymmetric; cert-3 framing is honest but the *shape* may still be wrong

**REQ:** REQ-055
**Challenge:** The curve drops from 1.0 at 5.5-6.0 to 0.5 at pH 4.0 (50% loss in 1.5-2.0 pH units). It also drops from 1.0 to 0.5 at pH 8.0 (50% loss in 2.0-2.5 pH units). REQ statement says "cert 3 explicitly captures that" — fair on the values themselves. But the *shape* (symmetric around 5.75) is also a guess. Real cuticle absorption literature for tomato shows: (a) micros (Mn, Zn, Fe²⁺) absorbed better at acidic pH (< 5.5) due to ionic form; (b) anions (B, Mo) absorbed better at neutral-alkaline; (c) chelates (Fe-EDDHA, Fe-DTPA) less pH-sensitive than free salts; (d) Ca²⁺ uptake is *not* a strong function of foliar pH — translocation is the bottleneck, not cuticle entry. A single curve for "the foliar channel" averages four very different curves. Cert 3 covers the value error but not the shape error.
**Severity:** important (the curve drives every foliar efficiency calc)
**Why it matters:** A foliar Ca recipe pH 6.5 is reduced 5% by REQ-055 (multiplier 0.95) when in reality Ca foliar at 6.5 is fine. A foliar Mn recipe pH 6.5 should be reduced more like 25% (post-peak by 1 full pH unit, harder shoulder for cations). Single-curve = wrong both directions.
**Options:**
- Option A: Per-element curves keyed off `chemistryTags` — `cation`, `anion`, `chelate`, `non-ionic` — each with its own curve. Cert 3 per curve, but stratified.
- Option B: Single curve flagged "applies to free cations on cuticle; not chelates, not anions, not Ca translocation." Manually exclude products where the curve doesn't apply. Operator burden.
- Option C: Drop the curve entirely; just hard-fail outside REQ-053's [5.0, 7.0] envelope and treat all in-envelope sprays as 100%. Loses fidelity but doesn't lie.
**Recommendation:** Option A. Cert 4 that single-curve averages too many distinct chemistries; Option C is the honest fallback if Option A is too much work.

---

## Challenge 23 — REQ-055's curve is multiplicative with leaf-surface mods (yucca, window timing); compounding can drive total efficiency near zero

**REQ:** REQ-055
**Challenge:** "`base × foliarPhResponse(predictedTankPh) × leafSurfaceMods`." If `leafSurfaceMods` includes coverage (0.30 without yucca) and `foliarPhResponse` is 0.85 at pH 7.0, total foliar efficiency = 1.0 × 0.85 × 0.30 = **0.255 = 25.5%**. Compounding three or four ≤1 multipliers drops effective dose to <30% quickly. Combine with REQ-018's 0.05 floor and you can have a "still active" recipe that delivers 5-7% of label and passes all checks. The issue isn't the math; it's that no requirement bounds *total* effective efficiency, only individual factors.
**Severity:** important
**Why it matters:** Per-factor checks pass while the product becomes decorative through compounded losses. REQ-018 was supposed to prevent this but its 0.05 floor is below the compounded-multipliers can reach.
**Options:**
- Option A: Raise REQ-018 floor and/or add a compound-efficiency floor (e.g., total effective efficiency ≥ 0.30 for foliar products).
- Option B: Cap the product of all efficiency multipliers at a soft warning (0.50 = "below half label efficacy") and a hard floor (0.20).
- Option C: Document that REQ-018 is per-factor; trust operator to spot total-efficiency degradation.
**Recommendation:** Option B. Cert 4 that compounded losses are the realistic foliar failure mode and no requirement bounds them today.

---

## Challenge 24 — Missing REQ: irrigation volume / transpiration assumption is a load-bearing input with no requirement

**REQ:** N/A — this is a missing requirement
**Challenge:** Coherence-audit Finding 2 hinges on "25.5 L/m²/wk transpiration" feeding the soil mass-flow estimate. Finding 8 hinges on weekly irrigation volume = stockBarrel × Dosatron × cycle count. Neither input is governed by any REQ. They're constants/calculations in code that could change without any verification firing. A 20% change in assumed transpiration shifts every "soil supply" number by 20% and the lockout banner in the Bilan flips behaviour. This is the most leveraged unverified input in the model.
**Severity:** blocking (un-governed input that drives every Bilan number)
**Why it matters:** The requirements doc verifies recipe constants and UI text; it doesn't verify the *physical assumptions* that translate one to the other. Transpiration is the bridge between solar (REQ-009) and supply (REQ-013/014). No requirement, no verification.
**Options:**
- Option A: Add REQ-058: transpiration model declared explicitly (per-stage liters/m²/day driven by solar via Penman-Monteith or similar), with cert annotation; verifier asserts the function exists and produces reasonable values for known cases (e.g., week 18 tomato T4 = ~3.5 L/m²/d, cert 3).
- Option B: Document the assumption in REQ-009 ("solar drives transpiration via [link to constant]"). Lighter-weight.
- Option C: Leave it; treat transpiration as an internal-model detail.
**Recommendation:** Option A. Cert 4 that transpiration is the highest-leverage un-verified number in the model. If the team disagrees with 25.5 L/m²/wk for week 18, every supply finding changes.

---
