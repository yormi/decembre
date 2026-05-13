# Challenger drafts — pending Guillaume review

Raw findings written by the model-challenger persona, auto-triggered on `*/derivation.md` edits (PostToolUse hook → headless `claude -p` session loaded with `.claude/agents/model-challenger.md`).

**Status tags per finding:**
- `PENDING` — written by challenger, not yet reviewed by Guillaume.
- `APPROVED → requests.md` — Guillaume approved; entry copied to `team-coordination/requests.md` for specialist pickup.
- `REJECTED` — Guillaume rejected; entry kept here as a record of considered-and-declined.
- `DEFERRED` — Guillaume parked; re-present at next challenger session.

**Presentation mode:** at challenger-session start, the challenger scans this file for `PENDING` entries and presents them one-by-one to Guillaume; he answers approve / reject / defer; challenger updates the status tag inline and (on approve) appends to `requests.md`.

---

## 2026-05-11 — review of `nutrition/tomato/foliar-recipe/` (spec.md, derivation.md, data.js, calc.js, model.js — in-flight + committed at b377b60)

Scope: REQ-101, REQ-103, REQ-112, REQ-115, REQ-116, INV-1, plus derivation framing and supporting data. In-flight changes (uncommitted): REQ-112 sprayCount + surfactant levers, REQ-115 `computeFoliarRecipeForGap`, REQ-116 live-FP derivation, burn-cap research note. First-ever challenger session for this project.

### Blindspots

**B1 — Derivation demand table is out of sync with `plant-needs/data.js`** · `APPROVED → requests.md`
- **What the spec assumes:** derivation.md table "Per-element delivered mg/m²/wk vs demand at T5" anchors every % demand call: Mn at ~60 %, Zn at ~100 %, Cu at ~25 %, Mo at ~100 %, Fe at ~95 %.
- **What might be ignored:** arithmetic from current `BIOMASS_DEMAND.T5 + TOMATO_FRUIT_EXPORT × 1500` (1.5 kg/m²/wk yield) gives Mn 7.5 (not ~9), Zn 4.5 (not ~6), Mo **0.075** (not ~0.3), Fe 15 (not ~13). Cu ~1.5 matches. So at the current STORED recipe under 0.30 coverage:
  - Mn delivered 5.4 / demand 7.5 = **72 %** (not 60 % — under-fert call is less severe).
  - Zn delivered 6.1 / demand 4.5 = **136 %** (not 100 %) — **already over REQ-014's 1.3× luxury cap on the foliar channel alone**, before adding sidedress/compost residual Zn.
  - Mo delivered 0.31 / demand 0.075 = **413 %** — 4× over luxury cap. Hidden by the spec's "~100 %" claim.
  - Fe delivered 12.5 / demand 15 = **83 %** (not 95 %).
- **How to test it:** rerun the table from `PlantNeedsTomato.demandTotal('T5')` at the current target yield 1.5 kg/m²/wk. The table either uses a different yield (1.3 kg/m²/wk current?), uses pre-Koller-aligned demand numbers (pre-2026-05-06), or was hand-typed and never reconciled with the data source. Either way: lock the table to a live computation, not a frozen literal.
- **Cost if real:** **high.** This is the central narrative artefact for the whole subproject. "Mn primary under-fert call" and "Mo ~100 % demand" both ride on it. The Zn-over-luxury and Mo-grossly-over conclusions could trigger REQ-014 verifier fails as soon as the test runs against real demand; the under-fert framing for Mn may be overstating urgency vs the real ~72 % gap (still under REQ-013's 0.9 floor, but less dramatic). Whole prioritization order shifts: cutting Mo and Zn out of foliar gets more attention than restoring yucca.

**B2 — `FOLIAR_COVERAGE_DEFAULT = 0.30` cert 4 rides on one Cu image + literature midpoint, no direct measurement** · `APPROVED → requests.md`
- **What the spec assumes:** REQ-101 cert 4 — "coverage % from cuticle-uptake literature ranges 25-40 % without surfactant; pinned at 30 % matches operator observation of runoff at current dose; transferable to similar tomato-leaf morphology."
- **What might be ignored:** the Cu-toxicity image cited as confirmation measures **leaf-axil pool concentration**, not coverage. Inferring "local pool 3-4× concentration ⇒ rest of leaf got 30 % of label" requires knowing droplet retention distribution that wasn't measured. Sentís et al. 2017 (cited for burn-cap framing) found tomato-cuticle Mn penetration at **3 %** without surfactant — that's the absorption axis, distinct from retention. The 30 % blended number conflates retention × penetration, but at 3 % penetration the upper bound on uptake is set by penetration, not retention. PA Taillon — Décembre's field-experience anchor (per memory) — hasn't weighed in on coverage. No tissue test correlates. Cert 4 ("small translation needed") implies meaningfully more confidence than the actual evidence base supports.
- **How to test it:** (1) gravimetric leaf-wash post-spray on a control bed to measure deposit fraction; (2) tissue test correlation when 2026-05-12 petiole panel lands — compare delivered-Mn/Zn predicted vs measured tissue concentration; (3) ask PA Taillon what he's seen at comparable operations.
- **Cost if real:** **medium.** Coverage at 0.20 vs 0.40 doubles or halves every foliar delivery number — moves Mn from ~72 % demand to either ~48 % or ~96 %. Drives whether yucca return is "must-have" or "nice-to-have", and whether the current Mn cut is dangerous or safe. The 5-day-out tissue test will pressure-test this directly; the spec/cert should not commit to 4 before it lands.

**B3 — CE-cap-and-scale loop in `computeFoliarRecipeForGap` scales all elements proportionally** · `APPROVED → requests.md`
- **What the spec assumes:** REQ-115 algorithm step 2 — if predicted CE > target, scale all non-zero doses by `target_CE / predicted_CE` and re-round.
- **What might be ignored:** in this recipe, FeSO₄·7H₂O (80 g) is mass-dominant. CE excess almost always traces to Fe. Scaling everything proportionally penalizes Mn, Cu, Mo, B — the elements with no alternative channel at current soil pH 7.4 (REQ-061 cascade-order locks them to foliar). The min-dose 0.5 g clamp then zeroes the small elements first on subsequent iterations. Net effect: a CE-cap event preferentially strips the pH-locked micros that the foliar channel exists to deliver. "Fair" scaling is operationally inverted.
- **How to test it:** synthetic test — feed `computeFoliarRecipeForGap` a Fe-heavy gap that pushes CE over cap and observe whether Mn / Cu / Mo / B get clamped to 0 across iterations. Then compare against a "drop largest CE contributor first" strategy.
- **Cost if real:** **medium.** Bites when REQ-116 wires the live derivation into Block 7 drift gauge. If the gauge displays a recipe with stripped Mn/Cu under a CE-cap event, the operator sees an under-fert recommendation precisely on the elements where under-fert is dangerous. Edge-case-ish, but the algorithm doesn't have to be wrong to be misleading.

**B4 — Min-dose floor 0.5 g is uniform; pre-loads Mo into over-fert territory** · `PENDING`
- **What the spec assumes:** REQ-115 — "If `ideal_g < 0.5` → `0` (operational floor — sub-half-gram doses aren't measurable on an organic-farm scale)."
- **What might be ignored:** if Mo gap is tiny but non-zero, `ideal_g` for Mo can sit at 0.05–0.2 g. The 0.5 g floor doesn't trigger a zero — it triggers a zero **OR** the gap is large enough to push above 0.5 g and we're delivering 0.5 g floor mass = 0.155 mg/m²/wk (sprayCount=1, no surfactant) = ~2× demand. Effectively the min-dose floor for Mo and Cu (tiny demands) is a guaranteed luxury-cap violation any time the gap is non-trivial. Spec frames the floor as a safety / dosing-realism rule; doesn't acknowledge it's an element-blind rule that violates REQ-014 on small-demand elements.
- **How to test it:** call `computeFoliarRecipeForGap({ Mo: 0.05 }, {})` — expect 0; call `…({ Mo: 0.06 }, {})` — expect 0.5 g. Sweep to find the gap where Mo crosses floor; at that point deliver vs demand will already be ~4×.
- **Cost if real:** **low-medium.** Mo doesn't bite tomato hard at moderate excess; Cu's narrow toxicity threshold makes Cu the actual risk if min-dose forces 0.5 g CuSO₄ into a recipe when ideal would be 0.2 g (= 0.5/0.2 = 2.5× luxury). Worth either a per-element floor or an explicit "drop element if floor pushes >1.3× luxury" guard.

**B5 — Yucca-drop decision presented as supply-chain only; PA Taillon view not captured** · `APPROVED → requests.md`
- **What the spec assumes:** derivation.md "Decision 2026-05-05: yucca surfactant dropped from program (not on order, supply-chain timeline)." Refinement-trigger framing treats yucca return as a clean coverage flip + recipe rebalance.
- **What might be ignored:** the burn-cap research note (data.js, 2026-05-10) flags yucca's longer wet-film property under sun as a **burn-risk amplifier** — directly contradicts the "yucca returns ⇒ doses can go back up to 22 g Mn / 22 g Zn / 4 g Cu" assumption in the refinement trigger. The same spec asserts both "yucca raises coverage 0.30 → 0.80 ⇒ doses can come back up" AND "yucca's wet-film under sun concentrates residue ⇒ burn-cap doesn't relax". If the second is real, the first is wrong: restoring yucca improves coverage but *doesn't* license the higher doses. PA Taillon's April 2026 recommendation that the no-yucca recipe is anchored to — is he advising the cut, or is he advising the original yucca-on recipe and the cuts were Décembre-internal? Worth a direct check.
- **How to test it:** ask PA Taillon directly: (1) does he agree yucca should return, (2) if it returns, do the doses come back to the original (22/22/4) or stay near (18/16/2)?
- **Cost if real:** **high.** The single biggest refinement trigger in the subproject is wrong about what the trigger does. Yucca returning + doses going back up would lift Mn delivery from 5.4 to ~14 mg/m²/wk (the spec's stated upside) — but if burn-cap doesn't relax, doses stay at 18/16/2 and Mn only goes 5.4 → 5.4 × (0.80/0.30) = 14.4 anyway via coverage alone. The recipe-rebalance step is unnecessary. Cleaner story, fewer moving parts, but the spec doesn't capture this yet.

### Complexity

**C1 — `sprayCount` lever (REQ-112) — does the team actually spray multiple times per week?** · `APPROVED → requests.md`
- **Specialist added:** `sprayCount` clamped 1–3, multiplies delivery linearly; UI exposes the lever; data flows through `computeFoliarSupply` and `computeFoliarRecipeForGap`.
- **Test:** Does this change a team action vs omitting it?
- **MVP version:** If the team sprays exactly once per week (REQ-062: "single foliar spray per week" — listed in inherited specs of this very file), then `sprayCount` is dead state. The model exposes a knob that can't be set without violating REQ-062. Drop the lever; reintroduce only when REQ-062 is relaxed by a PO REQ.
- **Why it might stay:** Mn / Fe spike weeks (derivation references) suggest there's an operator-side intuition that some weeks deserve 2 sprays. If real, needs an explicit PO REQ relaxing REQ-062 for spike scenarios; otherwise the model offers a knob the spec forbids.

**C2 — CE-cap-and-scale iteration loop (REQ-115 step 2)** · `PENDING`
- **Specialist added:** 4-iteration loop that scales all doses, re-rounds, recomputes predictedCE.
- **Test:** Does this change a team action vs returning "would exceed CE cap, recipe unsafe"?
- **MVP version:** Compute ideal_g → clamp at burn cap → return. If predicted CE > REQ-025 cap, return a single flag (or the literal recipe with a `ceWarning: true` field); let the operator decide which element to cut. The iteration disguises the trade-off — it picks "scale everything proportionally" as if that's the right answer, which B3 already flags as operationally wrong.
- **Why it might stay:** Block 7 drift gauge needs a non-null recipe to display. Fine — return the over-cap recipe with a flag, render it in red, don't silently auto-fix. Iterating in the model is doing operator judgment work the operator should do.

**C3 — `BURN_CAP_SURFACTANT_FACTOR` constant with default 1.0** · `APPROVED → requests.md`
- **Specialist added:** new constant, plus `burnCapG(el, surfactant)` function, plus exposure through namespace, plus 3 places of documentation (spec, data.js, derivation.md).
- **Test:** Does a constant pinned at 1.0 change a team action vs omitting?
- **MVP version:** Drop `BURN_CAP_SURFACTANT_FACTOR`. `burnCapG(el, _surfactant) → BURN_CAP_BASE_G[el]`. When tissue + lesion data eventually supports a surfactant-related burn-cap shift, edit the constant table directly. Right now this is a future-tunable knob masquerading as a current axis; the surface area suggests there's something to tune, but the research note explicitly says there isn't.
- **Why it might stay:** the constant-with-research-note acts as a documented placeholder so when evidence arrives, the place to put it exists. Steelman: this is design intent communication. But the design intent is already in the comment block — putting the comment on `BURN_CAP_BASE_G` with a TODO for surfactant evidence achieves the same without an inert multiplier.

**C4 — REQ-116 live-derived FP recipe — is the Block 7 drift gauge actionable for foliar?** · `PENDING`
- **Specialist added:** REQ-116 wires `computeFoliarRecipeForGap` into the FP recipe consumed by Block 7 drift gauge.
- **Test:** Will the operator act on "stored vs derived" foliar drift?
- **MVP version:** derivation.md already states: "the 'first-principles foliar dose' is essentially equal to the stored recipe — both are pinned at the maximum dose that doesn't burn or pool-tox the cuticle." Foliar is burn-cap-constrained, not flux-derived. The drift gauge for fertigation and sidedress is meaningful because those are flux-derived; for foliar, the FP recipe will mirror stored unless upstream gap collapses (compost flooding, fertigation Mn coming online at lower pH), at which case the operator will already see it via Bilan supply curves. Block 7 for foliar is mostly going to display "drift = 0 always".
- **Why it might stay:** REQ-116 verification deliberately mutates compost Mn to 1.0 g/m²/wk and asserts foliar Mn drops to 0 — i.e. tests the "gap collapsed, foliar isn't needed anymore" case. Worth catching when soil pH eventually drops and Mn fertigation comes online. Steelman holds. Simpler version: keep `computeFoliarRecipeForGap` (REQ-115), don't wire it into Block 7 (REQ-116), surface drift via the supply-vs-demand bar instead.

### Cert defense

**D1 — `FOLIAR_COVERAGE_DEFAULT = 0.30` (stated cert 4)** · `PENDING`
- **Specialist's defense:** "coverage % is from cuticle-uptake literature ranges 25-40 % without surfactant; pinned at 30 % matches operator observation of runoff at current dose; transferable to similar tomato-leaf morphology."
- **What I'd need to accept cert ≥ 4:** (1) Sentís 2017 (or equivalent) measured penetration on Décembre's tomato cultivar, (2) tissue test correlation showing predicted Mn from `computeFoliarSupply` matches observed petiole Mn ±20 %, (3) PA Taillon confirmation that 30 % is in the band he's seen at comparable QC organic operations.
- **My read:** cert should be **3**. The literature range is wide (25–40 %, a ~1.6× span), the Cu image is not a measurement of coverage, and we have one (1) data point from one (1) farm at one (1) spray volume. Cert 3 ("moderate translation") is honest until 2026-05-12 tissue data validates. Drop to cert 3, then bump back to 4 if Mn-tissue correlation holds.

**D2 — `FOLIAR_COVERAGE_WITH_YUCCA = 0.80` (stated cert 4)** · `PENDING`
- **Specialist's defense:** "surfactant-assisted droplet spread + cuticle wetting jumps real uptake to 70-85 % (literature)."
- **What I'd need to accept cert ≥ 4:** citation. The 70–85 % number isn't anchored in derivation.md — Sentís 2017 (cited next door for the burn-cap research note) reports surfactant-assisted Mn penetration at 20 % on tomato cuticle, not 80 %. The discrepancy may be retention-vs-penetration framing again, but the spec doesn't say. Provenance gap.
- **My read:** cert **2 or 3** until the source for the 70–85 % range lands in derivation.md and the retention-vs-penetration split is explicit.

**D3 — `BURN_CAP_BASE_G.Cu = 2 g/15 L` (stated cert 3)** · `PENDING`
- **Specialist's defense:** mid-band of Sonneveld, Yara, Cornell, U. Delaware, U. Missouri extension publications.
- **What I'd need to accept cert ≥ 3:** the 2 g/15 L value came from a Décembre-specific event (Cu local-pool toxicity image, 2026-05-05) — a halving from PA Taillon's original 4 g. That's a Décembre measurement (cert 3 within Décembre, cert 2 transferability), not an inter-source midpoint. The extension publications support 0.05–0.1 % Cu = 7.5–15 g CuSO₄/15 L, several × Décembre's 2 g. So the value is below extension guidance, defensible by Décembre observation but not by the cited sources.
- **My read:** Cu specifically should be cert **2** (transferability — Décembre-specific without published basis), other elements (Mn 18, Zn 16, Fe 80, Mo 1, B 9) can stay cert 3.

### Verdict

**Hold — land after addressing B1 and B2 minimum.** The whole subproject's narrative rides on the derivation table; that table doesn't match the live demand data. B1 + B2 are blocking; B3/B5/C1/C3 are approved follow-ups; B4/C2/C4/D1/D2/D3 await one-by-one review.

---

## 2026-05-12 — review of `nutrition/tomato/fertigation-recipe/derivation.md` (working-tree diff, uncommitted)

Scope: Two changes — (a) MIXING_FACTOR (REQ-100) retired, supply now reports full barrel mass; (b) new `Supply derivation — computeFertigationSupply` section spec'ing REQ-145 (formula, caller-reshape patterns, no pH-response gate, no `details` in return, cert table). Spec.md REQ-145 verification declared deferred until calc.js lands the function.

### Blindspots

**B1 — pH-response gate omission defends dripper-line non-precipitation, not root-zone uptake at pH 7.4 — bites B and Mg first** · `PENDING`
- **What the spec assumes:** "K₂SO₄ and MgSO₄·7H₂O dissociate cleanly into K⁺ / Mg²⁺ / SO₄²⁻ in the dripper line at pH 6.2 (water input) and don't precipitate before reaching the root zone. H₃BO₃ is non-ionic at pH ≤ 9. The pH-response curves matter for soil-bound applications... not relevant to the products in the fertigation channel today."
- **What might be ignored:** the argument defends *no in-line precipitation* and then jumps to *no supply discount* — those are different axes. At soil pH 7.28-7.48 (current Berger April 2026), boric acid root uptake is suppressed: above pH ~7 the equilibrium shifts toward borate B(OH)₄⁻, which is less mobile through root membranes than neutral H₃BO₃. Mg²⁺ uptake competes against the Ca²⁺ flood on Ca-saturated soil (10,989 kg Ca/ha tomato block) — fertigation Mg arriving at the bed is not the same as Mg entering the plant. The supply formula reports 100 % of barrel mass and the model then sums it into Σ(channel_supply) for REQ-013/014 — a delivery number that overstates plant-side flux.
- **How to test it:** when the 2026-05-12 petiole panel returns, compare delivered-vs-tissue for Mg and B. If tissue B lags predicted supply by >25 % at the current pH, a fertigation-side pH multiplier needs to land (analogous to the soil-applied REQ-017 curve). PA Taillon should weigh in — has he seen tomato fertigation B at pH 7.4 deliver to tissue at the predicted rate, or has the dose always assumed a 0.3-0.7 uptake fraction?
- **Cost if real:** medium-to-high. Fertigation is the dominant channel for B (single-channel, REQ-061) and the dominant for Mg at T4-T5. Over-stating their supply silently masks the lockout the rest of the diagnostic system is trying to surface.

**B2 — Mixing-factor retirement assumes "channels are compared, not summed" while REQ-013/014 explicitly sum them** · `PENDING`
- **What the spec assumes:** "the double-count framing was artificial — SME is already a separate channel in the supply readout, so users compare them rather than blending."
- **What might be ignored:** REQ-013 statement is "`Σ(channel_supply) ≥ 0.9 × demand_total`" — channels ARE blended at the verifier and at `calcNutrSupply`. The previous MIXING_FACTOR_STORED = 0.5 was an estimate of the fraction of last week's fertigation already counted inside `supply.soil` (SME-derived). Dropping the factor doesn't make the double-count go away; it just stops accounting for it. The reasoning swap is: from "cert 2-3 estimate of 0.5" to "cert 2-3 estimate of 0 double-count" — same unanchored axis, opposite extreme. The retirement note frames this as "honest reporting" but it's an honest swap of one un-anchored number for another.
- **How to test it:** run REQ-013/REQ-014 verifier at T5 under the new full-barrel formula and observe whether K and Mg flip from "within band" to "luxury over-supply" — supply.soil at T5 K already runs ~1,500 mg/m²/wk (SME × transpiration); adding the full 5,597 mg/m²/wk fert delivery pushes Σ to ~7,100 mg vs demand 6,000 = 1.18× — still under the 1.3× cap, but B and Mg may not be so lucky. Concrete check: re-derive REQ-014 head-room per element at T5 with and without the retired factor, before declaring the retirement safe.
- **Cost if real:** medium. The diff doesn't break anything *by itself* because REQ-014 has 1.3× head-room above demand. But the head-room is now eaten by the double-count, leaving REQ-014 a thinner safety margin than its number suggests. If anything else nudges supply up (e.g. recipe retune, SME climbs), REQ-014 may fire on what looks like a legitimate dose. The cert 2-3 mixing-factor was at least an *attempt* to anchor; the retirement drops the attempt without replacing it.

**B3 — Fertigation channel has no luxury cap; LUXURY_FACTOR pre-caps supply.soil but not fertigation full-barrel delivery** · `PENDING`
- **What the spec assumes:** per inherited specs "LUXURY_FACTOR is a supply-side cap on `supply.soil`... not part of this subproject's contract." The new supply derivation accepts full barrel mass with no upper bound check.
- **What might be ignored:** LUXURY_FACTOR (K=1.15, Mg=1.10) caps `supply.soil` at demand × luxury, but Σ(channel_supply) = supply.soil + fertigation + foliar + ... has no aggregate cap *upstream* of REQ-014. REQ-014 fires at 1.3× total, which is downstream — by the time it fires the FP recipe has already been computed with the no-cap supply. The asymmetry (capped soil, uncapped fert) is unprincipled: either both should pre-cap or neither, with REQ-014 as the final fence.
- **How to test it:** synthetic — feed the FP target into Σ(channel_supply) per element at T5 and check whether Σ/demand falls inside REQ-014's 1.3 band for K and Mg. If the FP recipe (which IS the agronomist anchor) systemically produces 1.15-1.30× luxury per element when summed against soil + compost residual, that's not "the recipe is honest", it's "the channel split is over-counting".
- **Cost if real:** low-medium. Doesn't break operations, but introduces a silent over-supply pattern visible to whoever audits Bilan numbers. The honest fix is either to extend LUXURY_FACTOR to gate fertigation too, or to drop LUXURY_FACTOR on soil and let REQ-014 be the only fence — pick one.

### Complexity

**C1 — Default-source convenience (one-arg call) violates the SRP rule the spec itself states two paragraphs above** · `PENDING`
- **Specialist added:** "Default-source convenience: omitting `recipe` is equivalent to passing the reshape of `STORED_RECIPE.tomato.fertigation[stage]`. Provided so admin consumers that don't care about FP mode have a one-arg call site."
- **Test:** Does this change a team action vs. requiring callers always to pass `recipe`?
- **MVP version:** drop the no-arg form. The model function accepts the canonical `{kSulfate_g, mgSulfate_g, solubore_g}` shape and only that. Every caller reshapes upfront — matches the explicit "callers are responsible for the reshape into canonical g-keys before calling" rule one paragraph above. If admin code wants ergonomics, put `getFertigationRecipeFor(stage)` in `nutrition/tomato/app/logic.js`. Per `feedback_model_srp.md` (memory): "model/calc functions accept pre-normalized inputs and apply ONE rule; shape detection, source selection, reshape all live at the caller. No mode flags at the model boundary." The default-source case IS source selection at the model boundary.
- **Why it might stay:** convenience for two admin consumers. Steelman: matches the historical `computeStageRecipe(stage)` one-arg shape. Counter: `computeStageRecipe` IS the sizer (stage is its only legitimate input); `computeFertigationSupply` is the deliverer and its legitimate input is the recipe — defaulting it is a different category.

**C2 — Cert table conflates formula cert with dose-anchor cert under one number** · `PENDING`
- **Specialist added:** Cert table (K=4, Mg=4, B=3) with reasoning that mixes product chemistry, regulatory status, and dose-anchor source.
- **Test:** Does a single number per element answer both "is the delivery math sound?" and "is the dose number we feed into it field-anchored?" — the cert reader needs both.
- **MVP version:** drop the cert table from this file. The delivery formula `grams × element_pct × 1000 / area` is structural (effective cert 5 — chemistry-stoichiometry-area, all measured). The cert that actually shifts is the cert *of the recipe inputs* (PA Taillon T5 anchor, cert 3 for B, cert ~3 for stored-mode K/Mg) — that cert belongs with the recipe values (`FIRST_PRINCIPLES_T5_FERTIGATION` in data.js, `STORED_RECIPE.tomato.fertigation` in app/index.html), not with the supply function. Alternative: keep the table but split into "formula cert" and "anchor cert" columns so the reader sees both honestly.
- **Why it might stay:** REQ-145 says "Cert: 4 — bright-line normative rule; auto-enforcement is partial" — that's the cert for the SPEC itself, distinct from per-element delivery cert. Steelman: the table preserves the per-element cert that REQ-145's spec-level cert can't carry. Counter: the per-element cert that varies is the dose anchor, not the formula, so the table belongs next to the dose, not next to the function. The current placement creates the appearance that supply cert depends on chemistry when it depends on operator weigh + dose source.

### Cert defense

**D1 — K and Mg cert 4 — reasoning is about chemistry, not about supply math or anchor** · `PENDING`
- **Specialist's defense:** "K | 4 | K₂SO₄ structural, organic-cert-listed, sulfate dissociates cleanly. Mg | 4 | MgSO₄·7H₂O same product class."
- **What I'd need to accept cert ≥ 4:** the cert as written makes three claims (product type, regulatory status, in-tank dissociation) — none of which speak to "does this many mg/m²/wk actually reach the root and get taken up". For cert 4 on delivery: (a) gravimetric or volumetric confirmation that the barrel-into-dripper-into-bed path delivers within ±10 % of label across the 382.9 m², (b) confirmation that the per-element fraction is from PRODUCT_PCT not a hand-edited number, (c) acknowledgement that uptake at pH 7.4 is not 100 % (see B1).
- **My read:** cert should be **3** for K and Mg until the delivery loss across the dripper system at Décembre is at least back-of-envelope quantified. Cert 4 ("small translation needed") implies the gap from literature-to-Décembre is small — true for the chemistry, *unknown* for the operational delivery. Drop to cert 3 and bump back when tissue 2026-05-12 panel and/or PA Taillon weigh-in lands. (Mirrors the D1 finding on foliar coverage in the prior session — same flat-cert issue, different channel.)

**D2 — B cert 3 — defended as the dose anchor cert, but the table is per-element supply cert, which would be cert 5 (chemistry-structural)** · `PENDING`
- **Specialist's defense:** "B | 3 | Solubore (H₃BO₃) FP-only at T5; supply confirmed but the dose number itself is the cert-3 anchor (PA Taillon recommendation, not field-measured)."
- **What I'd need to accept cert ≥ 3:** the defense explicitly admits the cert is the *dose anchor cert*, not the *supply formula cert*. That's the conflation in C2 made literal. If the table is "supply cert", B should be 5 (delivery math is stoichiometric). If the table is "dose anchor cert", K/Mg should also reflect their anchor (PA Taillon April 2026 → cert 3). The current table is internally inconsistent: B reports anchor cert, K/Mg report chemistry cert.
- **My read:** either restate B as cert 5 (with a footnote that the dose itself is anchor cert 3) or restate K/Mg as cert 3 (their dose is also PA Taillon-anchored). Pick one axis. Either way, the table needs a single named meaning.

### Verdict

**Land after addressing B1 minimum; B2/B3/C1/C2/D1/D2 are approved follow-ups.** B1 is the only finding that could shift an operational call (tissue petiole 2026-05-12 will validate or invalidate). C1 is a quick clean-up. The mixing-factor retirement (B2) is defensible but the swap-of-one-unknown-for-another framing should be explicit in derivation.md, not hidden behind "honest reporting".

---

## 2026-05-12 — re-trigger pass on same `nutrition/tomato/fertigation-recipe/derivation.md` working-tree diff

Hook re-fired on the same uncommitted diff already reviewed in the prior 2026-05-12 entry above. Structural critique (pH-response, mixing-factor double-count, fertigation no-cap, SRP-on-no-arg, cert-table conflation, K/Mg/B cert reads) all stands from that prior pass. Two findings the prior pass missed:

### Blindspots

**B4 — Solubore chemistry: prose says boric acid (17.5 % B), new table + project constants say disodium octaborate (20.5 %)** · `PENDING`
- **What the spec assumes:** the prior (unchanged) paragraph at line 134-138 in derivation.md frames Solubore as "Boric acid (H₃BO₃, ~17.5 % B mass) ... 9 g per 382.9 m² × 17.5 % B / 1000 ≈ 4.11 mg B/m²". The NEW per-element table introduced by this diff uses `element_pct = 0.205` for Solubore. Both calculations live ~30 lines apart in the same file and disagree by ~17 %.
- **What might be ignored:** the rest of the project consistently identifies Solubore as **disodium octaborate tetrahydrate (Na₂B₈O₁₃·4H₂O, 20.5 % B)** — `scripts/check-recipes.mjs:2679` "Solubore (20,5 % B)", `working files/nutrient-model-reference.md:497` "Solubore (borate de sodium, 20.5% B)", `PRODUCT_PCT.Solubore_B = 0.205`. The H₃BO₃ framing in the prose section is a documentation leftover from before the product identity was pinned to Solubor-brand octaborate. The diff didn't introduce the inconsistency, but it doubled down on the 0.205 side without cleaning up the prose, so the file now self-contradicts more visibly than it did before. Cert-wise it also matters: organic CGSB-32.311 lists sodium borates (disodium octaborate is allowed); H₃BO₃ specifically is fuzzier — a Catherine review might trip on "boric acid" wording even if the actual product is allowed.
- **How to test it:** grep for the product label on the bag in the shed (or PA Taillon's product spec) to confirm it's Solubor-brand octaborate, not generic H₃BO₃. Then either: (a) replace "Boric acid (H₃BO₃, ~17.5 %)" with "Solubor / disodium octaborate (Na₂B₈O₁₃·4H₂O, 20.5 % B)" in the prose AND rerun the 4.11 mg/m² figure with 0.205 (lands at ~4.82 mg/m², matching the new table), or (b) if the product really IS H₃BO₃, the project-wide 0.205 constant is wrong and the table's 4.82 mg/m² is overstated by ~17 %. The four-place consistency (PRODUCT_PCT + verifier + reference doc + new table) strongly suggests (a).
- **Cost if real:** low operationally (the dose is the same 9 g either way; the supply calc uses the constant, not the prose). Medium for cert defense — Catherine's audit reads the prose, not PRODUCT_PCT, and "boric acid" in derivation while the bag says "Solubor" is the kind of small-mismatch that surfaces in a 32.311 review.

### Complexity

**C3 — `opts = {}` parameter reserved for future levers — no near-term lever planned, YAGNI on the public signature** · `PENDING`
- **Specialist added:** `computeFertigationSupply(stage, opts = {}, recipe)` with note "`opts`: reserved for future channel-level levers; default `{}`. No required keys today."
- **Test:** Does `opts` change a team action vs `computeFertigationSupply(stage, recipe)`?
- **MVP version:** drop `opts` from the signature. Three real callers and zero hypothetical knobs means the parameter is dead weight that every call site has to spell out. Add it when a real lever materializes (e.g. when CE-cap or sprayCount-equivalent surfaces on this channel). Foliar has `opts` because it carries `sprayCount` + `surfactant` — actual knobs; fertigation has none.
- **Why it might stay:** parallelism with `computeFoliarSupply(stage, opts)` is a real argument — keeps the supply-channel functions visually uniform for whoever reads them side-by-side. Counter: parallel-for-parallel-sake is the textbook YAGNI shape; the foliar opts exist because foliar has knobs, and fertigation should grow opts when fertigation grows knobs. The cost of dropping now and adding later is one signature edit.

### Verdict

**Two minor follow-ups on top of the prior pass.** B4 (Solubore chemistry naming) is the only finding that touches Catherine's audit surface — easy to fix and protective. C3 is signature hygiene. Neither blocks landing; both are clean-up candidates for the same edit pass that addresses B1/B2/C1/C2 from the prior 2026-05-12 entry above.

---

## 2026-05-12 (re-fire) — `nutrition/tomato/fertigation-recipe/derivation.md`

No-op pass. PostToolUse hook re-fired on a saved file; diff content (MIXING_FACTOR retirement + REQ-145 supply derivation section) is unchanged vs the 2026-05-12 review above. No new claim or constant moved; B1–B3, C1–C2, D1–D2 from the prior review still describe the current state.

## 2026-05-12 (re-fire #3) — `nutrition/tomato/fertigation-recipe/derivation.md`

No-op pass. Hook re-fired again on the same uncommitted working-tree diff; no new claim, constant, or numeric value moved since the original 2026-05-12 review. Prior findings (B1–B4, C1–C3, D1–D2) remain the active queue.

## 2026-05-12 (re-fire #4) — `nutrition/tomato/fertigation-recipe/derivation.md`

No-op pass. Same uncommitted working-tree diff as the original 2026-05-12 review (MIXING_FACTOR retirement + REQ-151 supply derivation section); no claim, constant, or numeric moved. Prior queue (B1–B4, C1–C3, D1–D2) unchanged.

---

## 2026-05-12 — review of `nutrition/tomato/foliar-recipe/derivation.md` (working-tree diff, uncommitted)

Scope: One block changed — the "Coverage — why 0.30 without yucca" framing. Cert downgraded 4 → 3, with explicit acknowledgement that the Cu-toxicity-image inference confused retention-with-penetration, that Sentís 2017 reports tomato-cuticle Mn penetration at ~3 % without surfactant, and that no Décembre tissue test correlates predicted vs measured uptake yet. With-yucca cert is also flagged for parallel downgrade as "B2' followup". Sibling `spec.md` REQ-101 cert is updated in lockstep. This is the specialist's direct response to the 2026-05-11 B2 / D1 findings (both APPROVED).

The cert downgrade is the right call and the new prose is honest. Two structural concerns and one open-loop TODO remain.

### Blindspots

**B1 — Sentís 3 % penetration vs 30 % coverage isn't reconciled — model value may be off by ~10×, not ~1.6×** · `PENDING`
- **What the spec assumes:** new prose pins coverage at 0.30 as a "mid-range working assumption" from cuticle-uptake literature 25-40 %, while explicitly citing Sentís et al. 2017 reporting tomato-cuticle Mn penetration at ~3 % without surfactant — "the absorption axis distinct from retention." The text acknowledges the 30 % number "blends retention × penetration along axes that haven't been separated".
- **What might be ignored:** if penetration is the rate-limiter at ~3 %, plant-side uptake is bounded by penetration, not by retention × penetration. Retention can be 50, 80, 100 % — none of that matters once the cuticle barrier caps absorbed mass at 3 % of what landed on the leaf. Reading 30 % as "delivered to plant" is then overstating actual uptake by **~10×**, not by the ~1.6× the cert-band sensitivity analysis (0.20 vs 0.40) suggests. The cert downgrade is honest about confusion but the model value 0.30 remains unchanged — the derivation acknowledges a possible order-of-magnitude error and then keeps the original number. If the 2026-05-12 petiole panel comes back with Mn tissue 3-5× *below* `computeFoliarSupply('T5').Mn`, that's the signal — and the spec should declare in advance what threshold flips the value, not just the cert.
- **How to test it:** when the 2026-05-12 petiole panel returns (expected today per the 2026-05-05 ordering note + 5-7 day window), check Mn / Zn tissue ratios vs predicted. If observed petiole Mn sits at ~30 % of `computeFoliarSupply('T5').Mn` predicted, 30 % coverage is approximately right (retention dominates, penetration assumption was wrong). If observed sits at ~3 %, Sentís 2017 is right and coverage should drop to ~0.03 — `computeFoliarSupply` overstates foliar supply by ~10× across every element, every stage, every block reading it. The cost sensitivity line in the new spec text frames 0.20 vs 0.40 as the live band — Sentís suggests 0.03 should be on the table too.
- **Cost if real:** **high.** The whole Bilan supply chain trusts `computeFoliarSupply`. If foliar Mn delivers 0.5 mg/m²/wk instead of 5.4, the under-fert call is severe, not the "manageable 72 % of demand" the prior B1 finding adjusted toward, and yucca restoration becomes existential rather than nice-to-have. Worse, REQ-014 luxury caps (Zn ~136 %, Mo ~413 % per prior B1) would then collapse to ~14 % and ~42 % — *under-fert*, not over-fert. Direction reverses. Worth pre-committing in the spec to a tissue-driven coverage refit before the panel lands.

**B2 — Data.js still claims cert 4 on `FOLIAR_COVERAGE_WITH_YUCCA` while derivation flags it for parallel downgrade** · `PENDING`
- **What the spec assumes:** new derivation text says "The with-yucca cert claim is on the same evidence base and should be downgraded in parallel — handled separately (B2' followup)."
- **What might be ignored:** "B2' followup" is not a tracked artifact. It's not in `drafts.md`, not in `team-coordination/requests.md`, not in any todo file. `data.js:28` still reads `// With-yucca coverage; cert 4 — surfactant-assisted droplet spread + cuticle wetting jumps real uptake to 70-85 % (literature).` and the new derivation text contradicts that comment in the same subproject. The "handled separately" framing is the kind of loose-loop TODO that slips for weeks — and it points at exactly the cert (D2 from 2026-05-11, still PENDING) that the prior review flagged as needing source provenance. Tying the resolution to a process artifact ("split into separate request now or attach to the same one as REQ-101") would close the loop; the current wording is "trust we'll get to it".
- **How to test it:** does `data.js` line 28 still say cert 4 the next time a `*/derivation.md` edit fires the hook? Or has D2 from 2026-05-11 been processed?
- **Cost if real:** **low operationally, medium for spec coherence.** With-yucca constant isn't currently consumed (yucca dropped, no toggle code). When yucca returns to the program, the cert claim becomes load-bearing for Block 7 drift gauge and the refinement-trigger math; landing yucca restoration on an unflagged cert-4 number reintroduces the exact provenance gap the rest of this diff cleans up.

### Complexity

(No complexity findings — diff is wording + cert revision only. Nothing added.)

### Cert defense

**D1 — `FOLIAR_COVERAGE_DEFAULT` cert 3 may still be too high if Sentís 2017 governs** · `PENDING`
- **Specialist's defense:** new spec text — "mid-range from cuticle-uptake literature 25-40 % without surfactant; pinned at 30 % as a working assumption, **not directly measured at Décembre**. … No tissue test correlates predicted delivery to measured uptake yet. Bump back to cert 4 once the 2026-05-12 petiole panel correlates `computeFoliarSupply('T5').Mn` to measured petiole Mn within ±20 %."
- **What I'd need to accept cert ≥ 3:** cert 3 ("moderate translation; pre-tissue-validation, mid-band literature pin") is reasonable IF Sentís 2017 is fringe and the 25-40 % range is dominant. But Sentís is sole-cited evidence in the new derivation text — the 25-40 % is generic "cuticle-uptake literature" with no specific cites. If the 25-40 % range is retention-not-penetration and Sentís is the only penetration measurement in the file, the model value 0.30 has *less* evidentiary support than the cert-3 framing implies. Cert 2 ("major translation needed; load-bearing literature contradicts working value") becomes plausible.
- **My read:** cert is at the boundary of 2 vs 3. The new prose acknowledges the conflation but doesn't resolve it; the cert downgrade addresses the confidence axis but the value 0.30 remains unchanged. Defensible at 3 IF the 2026-05-12 petiole panel lands within days and bumps to 4 (or drops to 2 with a value cut). Drift past ~2 weeks with no panel result + value still 0.30 = cert should drop to 2.

### Verdict

**Ship the cert downgrade — it's the right direction.** B1 is the structural concern worth surfacing as a request before the 2026-05-12 petiole panel lands; B2 closes the open loop on the with-yucca cert. D1 sharpens the cert reasoning but isn't urgent if the panel lands soon. The diff itself is good cleanup of the prior review's findings; it just doesn't go all the way to the value-side implications its own evidence raises.

## 2026-05-12 (re-fire) — `nutrition/tomato/foliar-recipe/derivation.md`

No-op pass. PostToolUse hook re-fired on the same uncommitted working-tree diff (cert 4 → 3 + Sentís 2017 citation + cert-bump-back trigger); no new claim, constant, or numeric moved since the original 2026-05-12 review above. Prior findings B1 / B2 / D1 from that review remain the active queue for this subproject.

## 2026-05-12 (re-fire #2) — `nutrition/tomato/foliar-recipe/derivation.md`

No-op pass. Hook re-fired again on the same uncommitted working-tree diff (cert 4 → 3 + Sentís 2017 citation + cert-bump-back trigger); diff content identical to the 2026-05-12 original review. Active queue (B1 / B2 / D1) unchanged.
