# Challenger drafts — pending Guillaume review

Live working set per [[P-16]]: PENDING findings + resolutions ≤7 days old. Older history lives in git log; routed actions live in `from-model-challenger.md`; transferable lessons live in `principles.md`. Trim policy: on autonomous P-08 close → write principle if pattern generalizes, then prune body; on APPROVED-routed → prune body once routing entry lands; on no-op-pass / byte-identical re-fire → exit silent, do not append.

**Last trim:** 2026-05-17 (1986 → ~current lines; cleared 2026-05-11 through 2026-05-16 history per P-16 inversion of the prior "never delete" rule).

---

## 2026-05-23 — review of `nutrition/tomato/fertigation-recipe/derivation.md` (Ca-entry-candidate bullet under REQ-155 symmetric-refinement-triggers)

Scope: new bullet at `derivation.md:121` under § "Refinement triggers — symmetric per P-03" — "Symmetric extension — Ca entry candidate." Proposes future addition of a `Ca` entry to `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL` (starting value 0.85-0.90, cert 2 mid-band, "mirroring K's discount magnitude") gated on n ≥ 2 stage-tagged cohort tissue + paired Mehlich-3 + STORED-recipe traces. Frames mechanism as K⁺ + Mg²⁺ fertigation flux competing with Ca²⁺ at root-membrane transporters (reverse direction of the current K/Mg/B encoding). Rules out REQ-081 transpiration-coupling via operator cold-leaf observation. Cross-references `nutrition/tomato/research/tomato-t5-tissue-analysis-2026-05-23.md` § 4.7. Hypothesis-stage, no constant change. The same diff also adds a sulfate-S caveat at `derivation.md:228` — that hunk is already in PENDING review at the 2026-05-23 sulfate-form-S entry below; not re-critiqued here.

### Blindspots

**B1 — Consumer-less candidate: `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL` is consumed only by `computeStageRecipe` for K/Mg/B (the fertigated elements per REQ-098 / REQ-155). Ca isn't fertigated (`nutrition/soil-contribution/spec.md` REQ-141 P/Ca-only bank credit; spec.md "Ca not fertigated"); a Ca entry would be a dead constant unless a new consumer is named.** · `PENDING (specialist's lane — scope clarification; bundle with the sulfate-S B1 below for one specialist next-touch on the same derivation pass)`
- **What the spec assumes:** the constant is a per-element bed → plant uptake-inefficiency multiplier that `computeStageRecipe` divides plant demand by before subtracting compost + sidedress (REQ-155 statement). Reader infers "extension — Ca entry candidate" lands as a new key in the same constant.
- **What might be ignored:** the file's REQ-155 statement says "Fertigation sizing accounts for bed → plant uptake inefficiency... `computeStageRecipe` divides plant demand by this factor before subtracting compost release and sidedress release." For Ca there's no `computeStageRecipe` branch — Ca resolves to zero fertigation under the soil-bank credit branch (P/Ca via banque sol, Ca not fertigated). A `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL.Ca` entry would sit unread by `computeStageRecipe`. The hypothesis the bullet describes (K⁺ + Mg²⁺ fertigation flux suppressing Ca²⁺ uptake) IS literature-attested cation antagonism, but it's an inter-channel coupling (dose-dependent) not a soil-property constant — different epistemic shape than the K/Mg/B entries (which encode Ca-saturated-CEC suppressing K/Mg/B, a soil-property). Naming it "mirroring K's discount magnitude" inside the same constant elides the mechanism / math-shape difference. If the gate fires (n ≥ 2 cohorts) and the specialist next-touch adds a Ca key to `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL`, it would either (a) end up dead, or (b) force the specialist to add a Ca branch to `computeStageRecipe` that doesn't fit fertigation (Ca isn't fertigated). The Ca-antagonism mechanism would more naturally land in `nutrition/tomato/plant-needs/` (modify Ca demand-side) or `nutrition/soil-contribution/` (modify Ca delivery) — not as a fertigation-sizer entry.
- **How to test it:** specialist next-touch either (a) renames the bullet "Ca cation-antagonism hypothesis — scope deferred to plant-needs / soil-contribution subprojects" and clarifies that REQ-155's constant stays K/Mg/B-only by design, or (b) names the consumer that would be added alongside the constant (e.g., a Ca demand-side correction in plant-needs `calcNutrDemand`) and how it would consume `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL.Ca` — the latter is a larger scope change than the "symmetric extension" framing implies.
- **Cost if real:** medium. Misclassified hypothesis bullet propagates into the cohort-gate firing window — specialist lands a dead constant, or scope-creeps `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL` into a multi-purpose constant. Audit-trail confusion for Catherine + future readers on which subproject owns the cation-antagonism question.

**B2 — "Cold-leaf observation confirms healthy mid-day transpiration at the leaf-end, pointing at the root-uptake side" uses leaf-side evidence to rule out the fruit-xylem-Ca mechanism the sibling 2026-05-23 plant-needs entry already raised — and high VPD can amplify leaf transpiration relative to fruit transpiration, starving fruits of Ca.** · `PENDING (Guillaume call needed — PA Taillon field-read on T5 fruit BER lesion pattern vs canopy chlorosis; cascade-tied to 2026-05-23 plant-needs B1)`
- **What the spec assumes:** REQ-081 transpiration-coupling "alone doesn't fully explain" the Ca tissue gap because operator observed cold leaves at midday (= stomata open = transpiration active). Conclusion: the Ca driver lies on the root-uptake side, justifying a fertigation-sizer correction.
- **What might be ignored:** fruit Ca is xylem-mass-flow-delivered, NOT phloem-mobile (the same caveat already cited at `nutrition/tomato/plant-needs/derivation.md:57-59`: "BER is a transpiration problem, not a soil-Ca problem"). Fruit transpiration is much lower than leaf transpiration; xylem-Ca partition between leaves and fruits is the load-bearing variable. Under high VPD, leaf transpiration ramps faster than fruit transpiration, pulling xylem-Ca flow toward leaves and starving fruits — so "healthy leaf-end transpiration" is consistent with (possibly diagnostic of) low fruit-end Ca delivery. Leaf-end transpiration doesn't bound fruit-end xylem-Ca flow; ruling out transpiration via cold-leaf observation is wrong-direction inference. Sibling 2026-05-23 plant-needs B1 (drafts.md:186-190) explicitly raised xylem-flow-limited Ca as the alternative diagnosis on the same n=1 TOM #1 panel — this new bullet picks the opposite frame using the same evidence base. Two-derivation conflict on the same Ca data point.
- **How to test it:** PA Taillon field-read on next walk — T5 fruit BER lesion pattern (positional within fruit = transpiration-flow-limited; uniform within fruit = supply-limited) + canopy-level distribution (afternoon-wilt + outer-leaf positioning = VPD-stress; uniform chlorosis = supply gap). Cheap, no lab. Secondary: VPD log + irrigation event log over T5 weeks to disambiguate timing.
- **Cost if real:** medium-high. If the cation-antagonism refit lands (specialist next-touch adds Ca entry to `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL` at gate firing) when xylem-fruit transpiration is the actual driver, MgSO₄ trim hypothesis in the research file gets traction (the bullet flags this as STORED-side operator triage) while BER risk continues. BER under T5 transpiration limitation can lose 10-30 % of T5 fruit if uncorrected. Plausibly ≥10 % season-yield consequence per [[yield-impact-not-cert-fastidiousness]] — passes the ≥3/5 bar.

**B3 — n ≥ 2 cohort threshold for new-entry validation softer than n ≥ 5 used in `sidedress-recipe/derivation.md` for within-band refit of an existing factor; cross-derivation gate-inconsistency without stated justification.** · `PENDING (specialist's lane — gate-threshold harmonization or explicit justification of the asymmetry)`
- **What the spec assumes:** "Adding a `Ca` entry... would require n ≥ 2 stage-tagged cohort tissue + paired Mehlich-3 + STORED-recipe traces to validate." Reader infers n ≥ 2 is sufficient for the new-entry refit to land.
- **What might be ignored:** the sibling `sidedress-recipe/derivation.md` 2026-05-23 refit gate (FarinePlumes.eff refit-trigger) uses n ≥ 5 stage-tagged cohorts + petiole NO₃-N tracking for within-band refit of an existing factor. New-entry creation here gets a lower bar (n ≥ 2) than within-band refit there (n ≥ 5). Adding a new cert-2 entry is a larger epistemic step than within-band refit of an existing cert-3 entry; the threshold ought to be at least as tight, not looser. The bullet doesn't state why n ≥ 2 is the right gate here. If the gate fires on n=2 and the specialist lands the Ca entry, the same cohort sample that fired the gate becomes the sole evidence base for a new constant — same n=1-cert-inflation epistemic shape the sibling 2026-05-23 plant-needs D1 raised (drafts.md:198-201 — `min(5, 2, 3) = 2` on n=1 tissue).
- **How to test it:** specialist next-touch either (a) tighten n ≥ 2 to n ≥ 5 (parity with sidedress refit gate), or (b) name the justification for the lower threshold (e.g., "Ca entry is hypothesis-stage cert 2; sidedress refit is cert-3 within-band, hence higher bar" — would need to land in the bullet explicitly).
- **Cost if real:** low-medium. Refit-logic completeness; no current yield bar (no constant has moved). But the looser gate increases the probability that the dead-constant problem (B1) lands on n=2 evidence, compounding both findings at the gate-firing moment.

### Complexity

No surface. Bullet adds zero constants today, zero branches, zero REQs. "Hypothesis-stage only — no constant change until cohort validation lands" closes the immediate complexity surface. The complexity question reopens at gate firing (B1 + B3 cover the cohort-window risk).

### Cert defense

**D1 — "cert 2 mid-band, mirroring K's discount magnitude" — K's discount mechanism (Ca-saturated-CEC suppresses K) is a soil-property; hypothetical Ca discount mechanism (K-Mg-flux suppresses Ca) is a dose-property. Different mechanisms imply different math shapes and different magnitudes; "mirroring K" handwaves the mechanism mapping.** (stated cert 2) · `PENDING (borderline 2-3/5; specialist's lane on next-touch — bundle with B1 scope-clarification)`
- **Specialist's defense:** symmetric framing — Ca antagonism is the reverse direction of the K/Mg/B Ca-suppression encoding; magnitude can default to K's 0.90 on first hypothesis pass, refit on cohort data.
- **What I'd need to accept cert 2 on the mirrored-magnitude claim:** the dose-property mechanism would make the Ca uptake fraction depend on K + Mg flux at the root membrane, not on Ca soil baseline. A literature anchor on K-Ca / Mg-Ca cation antagonism at the dose levels Décembre runs (post-ramp FP K₂SO₄ 5 568 g + MgSO₄·7H₂O 1 963 g at T5) before defaulting to 0.85-0.90. Without an anchor, the "mirroring K's magnitude" framing is decorative — the magnitude could equally land at 0.50-0.95 depending on the actual flux-vs-baseline curve shape.
- **My read:** cert should be **1** (hypothesis pinned to "mirroring K" without literature on cation-antagonism magnitudes at Décembre dose levels) — or the magnitude framing drops to "to be anchored at gate firing; placeholder pending literature scan." [[yield-impact-not-cert-fastidiousness]] keeps this borderline (no constant moved, cert label on hypothesis); could close silent if B1 reframes the bullet to plant-needs / soil-contribution scope.

### Verdict

Land after Guillaume verdict on B2 (PA Taillon field-read routing — cascade-tied to 2026-05-23 plant-needs B1; one verdict binds both Ca-mechanism framings) + B1 + B3 specialist's lane on next derivation pass (scope-correction + gate-threshold harmonization, bundle with the still-PENDING 2026-05-23 sulfate-S B1 entry below for one specialist touch). D1 borderline; closes silent if B1 reframes scope per [[yield-impact-not-cert-fastidiousness]].

---

## 2026-05-23 — review of `nutrition/tomato/sidedress-recipe/derivation.md` (FarinePlumes.eff refit — gate cohort-eligibility follow-up)

Scope: same diff as the 2026-05-23 FarinePlumes.eff entry below (parallel-session coverage: B1 wording self-contradiction; B2 petiole-NO₃-N source-vs-uptake disambiguator + multi-cause cascade). One orthogonal angle the entry below doesn't surface: the n ≥ 5 cohort gate is silent on STORED-vs-FP-target delta at the cohort's reference stage, so cohort signals collected while STORED trails FP target replay the same operational-state confound regardless of n. Distinct from the gate's literal wording (B1 below) and from the cause-list / physiology disambiguator (B2 below) — concerns WHICH cohorts qualify into the n=5 set, not how to interpret each one.

### Blindspots

**B1 — n ≥ 5 cohort gate doesn't constrain on STORED-vs-FP-target alignment; cohorts collected at unramped STORED replay the source-vs-operational confound n times without disambiguating eff drift from ramp lag.** · `PENDING`
- **What the spec assumes:** future eff refit (below 0.70) fires on n ≥ 5 stage-tagged cohorts + petiole NO₃-N tracking. Cohort sufficiency lives at the count threshold.
- **What might be ignored:** at T5 in the cited cohort, STORED = 1 341 g/planche vs old FP target 1 655 g (-19 % under). N supply at STORED + old 0.75 eff = 2.39 + compost 1.10 = 3.49 g/m²/wk vs demand 4.05 = -14 % supply gap before any eff question. The -27 % tissue gap at n=1 is consistent with the -14 % operational supply gap (stock-vs-flux residual, leaf-N integration over weeks) without requiring eff drift as the explanation. If subsequent cohorts hit the n ≥ 5 threshold while STORED still trails FP by >5 %, all 5 panels carry the same operational confound — the gate fires on n-multiplied confounded evidence, not on disambiguating evidence. Per [[refit-not-relabel]] the refit principle is sound; the gate's cohort-eligibility criterion is under-specified relative to the operational state the model assumes the cohort represents. Orthogonal to the B2-below petiole-NO₃-N angle: that disambiguator interprets each cohort once collected (source-limited vs uptake-limited at the leaf); the STORED-vs-FP qualifier filters which cohorts count as evidence of model-side eff drift in the first place.
- **How to test it:** documentation-only edit on the gate criterion — "n ≥ 5 stage-tagged cohorts WITH STORED-vs-FP-target delta < 5 % at cohort reference stage." Lives on the model side (gate timing condition, not STORED action — preserves [[no-stored-pressure]]: the gate doesn't ask STORED to ramp, it defers refit firing to whenever STORED-vs-FP alignment naturally lands via Guillaume's /retire-recipe timing). Specialist's lane on next-touch — bundle with the B1+B2 cluster from the entry below.
- **Cost if real:** medium. Iterative refits on confounded signal drift eff past Sonneveld floor (already at 0.70, the floor of the 0.70-0.85 band); next iteration locks in below-band value and forces cert-3 downgrade or literature reframe with no theoretical anchor. Forward-applicable across cycles, not this-cycle yield-bleed. Catherine-audit-readability: the gate criterion should be defensible against the "but STORED was undersized" objection on the first re-read.

### Complexity

No surface — single qualifier addition to existing gate language.

### Cert defense

No surface — cert-3 defense per entry below (literature band-membership, not within-band placement).

### Verdict

Land after B1 — bundle into the same specialist next-touch as the entry below (B1 wording reconciliation + B2 candidate-cause expansion + this gate cohort-eligibility qualifier; three orthogonal refinements to the refit-evidence framework on the same derivation pass). Routes through specialist's lane per [[P-12]] (model-side documentation; gate is model-side timing constraint, respects [[no-stored-pressure]] by not asking STORED to ramp).

---

## 2026-05-23 — review of `nutrition/tomato/sidedress-recipe/derivation.md` (FarinePlumes.eff 0.75 → 0.70 refit + cert-3 hold)

Scope: substantive value move on top of the prior 2026-05-23 sidedress-recipe entry (tissue-bullet-only add). `SIDEDRESS_PRODUCTS.FarinePlumes.eff` 0.75 → 0.70 (literature mid-band → literature floor); Option A + Option B per-stage g/m²/wk and g/planche/wk tables re-rendered; channel efficiency map (REQ-157) N value 0.75 → 0.70; cert-3 defense paragraph rewritten to read "value sits at the literature floor after the 2026-05-23 refit ... Cert held at 3: single-cohort refit; further downward move gated on n ≥ 5 stage-tagged cohorts + petiole NO₃-N tracking"; refinement-triggers tissue-panel bullet (already in prior PENDING review for compost-cause omission, B1 still applicable — not re-flagged here per [[reversal-inline-on-original]]) carries the original "Refit gated on n ≥ 5 stage-tagged cohorts + petiole NO₃-N tracking before adjusting `eff`" framing.

### Blindspots

**B1 — Self-contradicting gate: refinement-trigger bullet says "Refit gated on n ≥ 5 cohorts before adjusting `eff`", cert defense says "single-cohort refit; further downward move gated on n ≥ 5" — and the same diff moves the value on n=1.** · `PENDING (specialist's lane — wording reconciliation; no Guillaume call)`
- **What the spec assumes:** the n ≥ 5 cohort gate constrains future refits but allows the current 0.75 → 0.70 within-literature-band nudge on n=1 tissue. Two-tier reading: (i) literature-floor selection within cert-3 band doesn't need n ≥ 5 evidence (the cert-3 anchor is "literature 0.70-0.85"); (ii) further moves below 0.70 do need n ≥ 5.
- **What might be ignored:** the file states the gate once without the two-tier carve-out, then breaks it once with a different framing. A reader (Catherine audit, future Claude session, specialist's own next-touch) reading the refinement-trigger bullet at line 199-204 ("Refit gated on n ≥ 5 ... before adjusting `eff`") cannot square it with the diff that just adjusted `eff` on n=1. Either (a) the two-tier reading is real and both passages need to name it ("within-band re-selection on n=1 OK; below-band refit needs n ≥ 5"), or (b) the gate was meant to be absolute and this refit jumped it. Either way, the gate self-erodes — if it slid on the first signal, it doesn't constrain the next signal either, and the n ≥ 5 discipline becomes nominal cover for opportunistic moves. Same shape as the [[refit-not-relabel]] tension: the cert-3 framework relies on disciplined refit gating, and ungated within-band moves blur the cert defense.
- **How to test it:** mechanical wording reconciliation in the file. Specialist's next-touch either (a) explicit two-tier gate ("within-band re-selection: n=1 acceptable; below-band: n ≥ 5") on both the refinement-trigger bullet and the cert defense paragraph, or (b) revert the eff move pending n ≥ 5 and keep the tissue panel as a refinement-trigger observation only. Option (a) is the [[P-15]]-aligned minimum-touch move.
- **Cost if real:** medium. Audit-trail readability + discipline erosion across future refits. Yield-impact is low at the current move (0.70 still well-anchored in literature) but compounds: the next n=1 anomaly hits the same broken gate and the eff slides again, this time with weaker literature backing.

**B2 — One-parameter refit on a multi-parameter shortfall; petiole NO₃-N would disambiguate source-limited vs uptake-limited before the next move.** · `PENDING (borderline 2-3/5; specialist's lane on next-touch if approved — extends prior B1 compost-cause finding)`
- **What the spec assumes:** the T5 tissue N gap is source-side — either `FarinePlumes.eff` was too generous (named cause a, this diff moves it) or early-stage cumulative mineralization fell short (named cause b, unmoved). Refit lands on (a) ahead of cohort-data disambiguation.
- **What might be ignored:** the 2026-05-22 panel showed cross-element shortfalls (N -27 %, P -54 %, K at floor, Ca -13.5 %). The plant-needs PENDING B1 (sibling entry below) raised Ca-transpiration as the alternative diagnosis for Ca. N is more soluble + has multiple uptake pathways (mass-flow + active transport) so transpiration-limit is weaker for N than for Ca, but at T5 (peak fruit load = peak transpiration demand under Décembre VPD) it is not negligible. If a fraction of the N gap is uptake-rate-limited at T5 (root activity throttled by canopy load, salinity from Ca-saturation, or VPD-driven xylem flow ceiling), source-side eff refit doesn't move tissue N — and a refitted eff = 0.70 with the actual driver elsewhere over-applies feather meal at T3-T4 (where transpiration ceiling is not binding) while T5 stays under-supplied. Petiole NO₃-N is already named in the n ≥ 5 cohort gate criteria — it disambiguates source-vs-uptake at low cost (low petiole NO₃ + low tissue N = source-limited, eff refit is the right lever; high petiole NO₃ + low tissue N = uptake-limited, transpiration / VPD / Ca-saturation / irrigation are the levers and eff refit is the wrong fix). Also: the prior PENDING B1 from this morning's sidedress entry still applies (compost residual ~28 % of T5 supply, not in candidate-causes list) — three plausible causes are now in scope; the refit picked one without disambiguation.
- **How to test it:** specialist's next-touch adds (i) petiole NO₃-N to the candidate-disambiguation step BEFORE refit (not just gate criteria — name it as the discriminator), and (ii) cause (c) compost-residual + cause (d) uptake-limited (transpiration-ceiling) to the candidate-causes list. Cheapest secondary: PA Taillon field-read at T5 cohort on canopy-vs-soil-supply visual pattern (uniform chlorosis = source-limited; afternoon-wilt + outer-leaf yellowing = transpiration-limited).
- **Cost if real:** medium. Refitting eff when source isn't the bottleneck propagates over-application across stages and locks model on the wrong lever; the persistent T5 gap doesn't close because the actual driver wasn't touched. Less severe than the Ca-transpiration angle (N more uptake-pathway-diverse), but the disambiguation cost is low (petiole NO₃-N already named in the gate) and the insurance value is high.

### Complexity

No surface. Eff value-edit + table re-renders + refinement-triggers bullet are mechanical follow-throughs on a single decision; zero new constants, zero new branches, zero new REQs. The cert-3 hold framing is the questionable surface (covered in B1).

### Cert defense

No surface ≥3/5. The cert-3 hold on `FarinePlumes.eff = 0.70` lands inside the literature band (Sonneveld & Voogt 2009 anchor 0.70-0.85) — the value itself is literature-anchor-defensible at cert 3, independent of the n=1 tissue evidence that motivated the within-band move. The "single-cohort refit" wording in the cert defense paragraph reads as if n=1 is load-bearing on the cert, when actually literature is. <3/5 on yield-bar per [[yield-impact-not-cert-fastidiousness]]; the wording confusion is covered by B1's wording-reconciliation action.

### Verdict

Land after B1 (mechanical wording reconciliation in the file — specialist's lane). B2 borderline; specialist's lane on next-touch if Guillaume approves, else closes per [[silent-under-3-of-5]]. No Guillaume call needed today (B1 is internal-file consistency; B2 extends the existing PENDING sibling-cascade discussion). Bundle with prior 2026-05-23 sidedress B1 (compost-cause) for one specialist touch on the candidate-causes list.

---

## 2026-05-23 — review of `nutrition/soil-contribution/derivation.md` (P-runway tissue-validation block + cert 3 → 4)

Scope: new "Tissue validation (2026-05-23)" block under § "Example runway: tomato P — lockout regime", citing TOM #1 T5 tissue P 0.23 % vs lab floor 0.50 % to bump the mass-flow-binds mechanism cert 3 → 4 on REQ-142's P claim. No REQ change; documentation-only cert relabel. Cross-references research file `nutrition/tomato/research/tomato-t5-tissue-analysis-2026-05-23.md` (read in scope). Sibling block in `nutrition/tomato/plant-needs/derivation.md` already in PENDING review below (2026-05-23 D1 on the same n=1 evidence base — cascade-tied).

### Blindspots

**B1 — Direction vs magnitude conflation: model predicts P supply -90 % of demand; tissue shows -54 % vs floor. Framed as confirmation; 36-point gap implies Actisol-P isn't passing through the same lockout the SME trickle does.** · `PENDING (specialist refit candidate; borderline 2-3/5)`
- **What the spec assumes:** "Total supply ~67 mg/m²/wk vs 660 demand (-90 %)" + "Tissue 0.23 % vs floor 0.50 % confirms" — direction-right validation framed as model-honest-on-magnitude.
- **What might be ignored:** the 36-point gap between predicted (-90 % of demand) and observed (-54 % of floor) is non-trivial. Tissue % is a stock-mix from cumulative stage supply, not a one-week snapshot — so some gap is expected. But the "Actisol mineralization passing through the same lockout" assumption built into the ~50 mg/m²/wk Actisol-P contribution is the soft term. Granular sidedress acidifies its microsite during decomposition; local pH drops can release organic-bound P independent of bulk soil pH 7.4. If real, the lockout multiplier as applied to organic-matter-bound P over-throttles Actisol; current model under-credits Actisol-P by some fraction of the 36-point gap.
- **How to test it:** (a) PA Taillon field-read on Actisol microsite acidification at peak season; (b) next Berger SME post-Actisol cycle — if SME P rises locally despite stable bulk pH, that's the lockout-bypass signature; (c) Mehlich + organic-amendment literature anchor on granular organic-P microsite pH drop.
- **Cost if real:** medium. Mis-attributing the magnitude gap to "model honest" instead of "Actisol-P over-throttled by lockout" could misframe next bed-cycle P strategy (over-invest in pH-drawdown vs leaning further into Actisol density). Yield consequence on next bed cycle, not this one.

### Complexity

No surface. Documentation-only addition; zero constants, branches, REQs. Sibling block in plant-needs validates a different load-bearing claim (crisis-pattern multiplier) so the parallel doesn't double-state. Cross-reference to research file is appropriate per derivation.md scope.

### Cert defense

**D1 — "Mass-flow-binds mechanism for P validated against peak-demand tissue (cert 3 → 4)" rides n=1 tissue past the file's own min-rule cert-arithmetic floor.** · `PENDING (sibling cascade to plant-needs 2026-05-23 D1 — same n=1 evidence, same min-rule arithmetic, same canonical cert-scale rule; Guillaume verdict on either binds both)`
- **Specialist's defense:** "Severely-déficient tissue confirms the lockout-regime prediction. The mass-flow-binds mechanism for P is validated against peak-demand tissue." Direction-right tissue + correctly-predicted-direction → mechanism cert bumps.
- **What I'd need to accept cert ≥ 4:** the cert-arithmetic rule the parent spec declares (`nutrition/tomato/plant-needs/spec.md` § "Cert scale" — canonical, inherited by `nutrition/soil-contribution/spec.md` REQ-142 cert clause): "Effective cert when two values combine = `min(cert_a, cert_b)`". Layered here: (i) ICP measurement = cert 5; (ii) one leaf at T5 representing the block at n=1, sampling protocol (leaf position, sun vs shade, canopy depth, time of day) unsurfaced in research file or block = cert 2; (iii) interpretive overlay onto pre-existing lockout narrative = cert 3. `min(5, 2, 3) = 2`. Cert-4 label rides analytical-instrument cert past the n=1 sampling-cert floor. Same epistemic move as plant-needs/derivation.md 2026-05-23 D1 — single tissue panel cited to cert-bump multiple structural claims across two files (crisis-pattern multiplier in plant-needs; mass-flow-binds mechanism here). Repeated-anchor cert inflation, same evidence base.
- **My read:** cert should be **3** (held, not bumped). Direction-right tissue with n=1 doesn't raise structural-mechanism cert under the file's own min-rule. Tissue evidence belongs in derivation.md as a refinement-trigger observation pointing toward the n ≥ 5 stage-tagged tissue cohort threshold already declared in `plant-needs/derivation.md` back-test trigger; doesn't trip an interim cert bump on its own. Cascade: if plant-needs D1 lands on "cert should be 2", this entry's cert-4 → 3 (already a half-step below). If plant-needs D1 defended at 4, the same logic carries this entry's 4. One verdict resolves both.

### Verdict

Land after Guillaume verdict on D1 (sibling cascade — verdict binds both 2026-05-23 D1 entries). B1 borderline 2-3/5 per [[yield-impact-not-cert-fastidiousness]] (yield consequence is next-cycle remediation routing, not this-cycle action); could close silent if specialist next-touch adds a magnitude-gap acknowledgment line ("36-point gap implies Actisol-P over-credits available pool") or queues the refit-Actisol-mineralization on the existing n ≥ 5 cohort trigger. Pure surfacing, no specialist action absent Guillaume's call on cascade.

---

## 2026-05-23 — review of `nutrition/tomato/fertigation-recipe/derivation.md` (sulfate-form S over-supply caveat add)

Scope: new Caveats bullet at `derivation.md:228` documenting "sulfate-form S over-supply at T5 is a known structural characteristic, not a dosing error" with tissue-panel validation pointer. No REQ change, no constant edit, no spec body touched. Pure caveat-prose addition.

### Blindspots

**B1 — Caveat anchors the "+300 % S over-supply" claim on STORED product masses (K₂SO₄ 3 489 g, MgSO₄·7H₂O 1 396 g) inside a file whose derivation chain delivers a FP target of 5 568 g + 1 963 g — the FP-target S over-supply lands ~+450 %, not +300 %.** · `PENDING (auto-route candidate per [[P-12]] — specialist's lane; channel-mix correction in the file's own framing, no Guillaume call)`
- **What the spec assumes:** S over-supply is "structural to the sulfate-based salt choice" → quantified with one number (+300 %) and one tissue confirmation (+227 %). Reader infers this is the characteristic the FP-target file is documenting.
- **What might be ignored:** the file's whole point is the FP target. FP target at T5 is K₂SO₄ 5 568 g + MgSO₄·7H₂O 1 963 g (T5 refined-target section + REQ-154 boot-pin), not STORED's 3 489 / 1 396. At ~18 % S in K₂SO₄ (stoichiometric: 32 / 174.26 ≈ 0.184) + ~13 % S in MgSO₄·7H₂O (32 / 246.47 ≈ 0.130), FP-target delivery is ~2 680 + ~666 = ~3 350 mg S/m²/wk → +458 % vs demand 600, not +300 %. The bullet's own next sentence ("any K dose bump compounds it mathematically") is exactly what the FP-target IS relative to STORED (+60 % K dose bump), and the file's REQ-154 + REQ-098 + REQ-155 commit to that bump — yet the caveat reads as if +300 % is the structural ceiling. Under `/retire-recipe` ramp toward FP target, actual delivered S over-supply will worsen ~50 % above the documented "structural" number; Catherine-audit-quoted +300 % won't match runtime once ramp lands. Independent finer point: tissue +227 % is a stock measurement at n=1; +300 % (or +450 %) is a flux measurement. "Confirmed by tissue +227 %" treats them as same-axis confirmation, but tissue confirms over-supply direction at peak demand, not the flux magnitude — the two numbers shouldn't be presented as same-axis confirmation.
- **How to test it:** mechanical recompute. Specialist re-derives S delivery at FP target T5: K₂SO₄ 5 568 × S_pct(K₂SO₄) / 382.9 × 1000 + MgSO₄·7H₂O 1 963 × S_pct(MgSO₄·7H₂O) / 382.9 × 1000. If the result is materially ≠ +300 %, rewrite the bullet to either (a) quote the FP-target number explicitly, or (b) declare two values (STORED current + FP target) with the gap noted, plus one sentence on tissue stock-vs-flux distinction.
- **Cost if real:** medium. Audit-trail readability for Catherine + future readers — a derivation file is the load-bearing source of truth for "why these numbers"; a number off by ~50 % from what the file actually derives breaks the FP-target → caveat-narrative coherence the file otherwise maintains. Also matters at the next /retire-recipe ramp moment — Guillaume reads the caveat to gauge ramp-tolerance for S; the +300 % anchor under-states the post-ramp S load.

### Complexity

No surface. Bullet adds zero constants, zero branches, zero REQs. Caveats section is the documented home for known-non-error structural artifacts. Single-bullet add, defensible scope.

### Cert defense

No surface ≥3/5. Two <3/5 wording angles closed silent per [[yield-impact-not-cert-fastidiousness]]: (a) "Trade-off acknowledged in PA Taillon's April 2026 recipe design" — no PA Taillon source in `nutrition/doc/` directly attests the sulfate-vs-KCl trade-off reasoning; the bullet attributes an inferred trade-off to a named external agronomist (cert-2 inference framed as cert-3 attribution). Yield-impact zero (recipe doesn't change either way); audit-only. (b) "Alternative low-S K salts (KCl) are also cert-listed" — KCl from mined sources IS CAN/CGSB-32.311-listed under Canadian organic standards; the bullet's claim is accurate but stops short of the explicit CAN/CGSB ref the [[organic-cert-flag]] feedback memory mandates. Specialist's lane to tighten on next-touch.

### Verdict

Land after B1 (mechanical recompute correction; specialist's lane via next derivation pass — channel-mix in the file's own framing, no Guillaume call). D1 / C closed silent per [[yield-impact-not-cert-fastidiousness]] + [[no-stored-pressure]] (the framing IS descriptive-not-prescriptive — keeps STORED unpressured).

---

## 2026-05-23 — review of `nutrition/tomato/sidedress-recipe/derivation.md` (`FarinePlumes.eff` 0.75 → 0.70 refit landing pass)

Scope: refit of `FarinePlumes.eff` from mid-band 0.75 to literature floor 0.70 in the `Mineralization efficiencies` table, with matching propagation through Option A's stage-table (T3/T4/T5 farine_g rises ~7 %), Option B's ratio comment (`(13×0.75)/(3×0.65) ≈ 5.0×` → `(13×0.70)/(3×0.65) ≈ 4.7×`), the `Channel efficiency map` (REQ-157 N: 0.75 → 0.70), and the per-product cert-defense paragraph (defense rewritten from "high-end-of-band defensible" to "lit-floor after 2026-05-23 refit; further downward gated on n ≥ 5 cohorts + petiole NO₃-N"). The existing `Tissue panel persistent N under-supply` refinement-trigger entry rewritten in parallel ("currently 0.70 floor ... after the 2026-05-23 single-cohort refit"). Cert held at 3. Sibling: the prior 2026-05-23 sidedress entry (TOM #1 T5 tissue-panel observation as new refinement-trigger bullet — `B1 = compost-residual as cause c`, still `PENDING`) covers candidate-cause completeness on the SAME refinement-trigger bullet that this entry's B1 also targets; bundle into one specialist next-touch. Sibling 2026-05-23 plant-needs `D1` (n=1 tissue cert-arithmetic) binds whether the refit's tissue-evidence basis was cert-3 or cert-2 — covered in cert-defense angle below.

### Blindspots

**B1 — Vestigial 0.75 inside the same diff that lands the 0.70 refit: refinement-trigger cause (a) reads "`FarinePlumes.eff = 0.75` at the high end of literature 0.70-0.85" verbatim post-diff while the table two sections up now declares the live value 0.70 at the lit floor.** · `PENDING (auto-route candidate; specialist's lane on next derivation touch; bundle with sibling 2026-05-23 sidedress B1 compost-cause-c — one paragraph surgery covers both)`
- **What the spec assumes:** the 2026-05-22 tissue-panel refinement-trigger bullet's cause-list documents the gap-explanation hypotheses; cause (a) names the eff-at-lit-high-end mechanism. The bullet was newly added in this same diff that also refit `eff`, but the bullet text references the OLD `eff = 0.75`.
- **What might be ignored:** post-diff the file carries two contradictory live statements on `FarinePlumes.eff` — the table + cert-defense paragraph declare 0.70 (lit floor, refit done 2026-05-23); the cause-list bullet declares 0.75 (lit high end, still framed as a present-tense candidate cause). The very next refinement-trigger bullet (`FarinePlumes.efficiency` re-examine) DID get past-tense rewritten ("currently 0.70 floor ... after the 2026-05-23 single-cohort refit") — asymmetric treatment of the two trigger bullets inside the same diff. Per the `feedback_no_vestigial.md` rule (CLAUDE.md → memory), the cause-bullet should be rewritten past-tense ("at the previous 0.75, eff sat at lit high end — addressed by the 2026-05-23 refit to floor 0.70") or folded into the cert-defense historical-context paragraph. Future reader (or Catherine audit) opens the cause-list and reads "0.75 high end" as the live `eff` value, contradicting the table.
- **How to test it:** textual cross-check — cause (a) string at refinement-triggers § `2026-05-22 tissue panel` vs the table row `FarinePlumes.eff (N) | 0.70 | 3` two sections up. If they reference different live values, rewrite cause (a) past-tense or fold the historical-context note into the existing cert-defense paragraph (which already carries the same `0.75 → 0.70` history).
- **Cost if real:** low-medium. Audit-trail readability — Catherine-audit and future-reader confusion about which `eff` value is live. No runtime / yield consequence (`data.js` is source of truth; this is documentation-internal inconsistency).

**B2 — Asymmetric refinement trigger: downward path explicit (n ≥ 5 cohorts + petiole NO₃-N), upward path unnamed; per [[symmetric-refinement-triggers]] the post-refit 0.70 is over-defended in the downward direction and under-anchored in the upward direction.** · `PENDING (auto-route candidate; specialist's lane; lower priority than B1)`
- **What the spec assumes:** "Cert held at 3: single-cohort refit; further downward move gated on n ≥ 5 stage-tagged cohorts + petiole NO₃-N tracking." Reader is told when to move 0.70 lower; not told when (or whether) to restore to mid-band 0.75.
- **What might be ignored:** 0.70 sits at literature floor — the upward path back to mid-band is the symmetric refit if subsequent cohorts contradict the n=1 tissue signal. Per [[symmetric-refinement-triggers]] (challenger principles): asymmetric triggers leave the value over-defended in one direction, under-anchored in the other. The principle's literal text addresses cert-downgrades-with-unchanged-value; here cert is unchanged + value moved — same epistemic shape, same risk: locked at lit-floor with no clear path back. Add upward trigger: "if next n ≥ 5 stage-tagged cohorts show median T5 tissue N at/above 3.10 % lab floor, restore `eff` to 0.75 mid-band". Cause (b) cumulative-mineralization-shortfall (still in the candidate-cause list) remains a live alternative explanation that an upward trigger would let surface without requiring `eff` to absorb the noise.
- **How to test it:** read the refinement-triggers § for `FarinePlumes.efficiency`. If only one direction is named, add the missing direction with the same cohort-threshold framing.
- **Cost if real:** low. Refit-logic completeness; no current yield bar (0.70 vs 0.75 is a ~7 % dose difference, well inside REQ-013 / REQ-014 envelope at T3-T5).

### Complexity

No surface. Refit adds zero constants, zero branches, zero REQs. Cert-defense paragraph rewrite + refinement-trigger paragraph rewrite both proportional to a load-bearing cert-3 model parameter shift. The Option A stage-table mass propagation (~7 % up at T3/T4/T5) is mechanical from the eff change; Option B's ratio annotation update is mechanical from the same. No over-reach.

### Cert defense

No surface ≥3/5. Cert held at 3 with explicit gating language ("single-cohort refit; further downward gated"). Literature anchor (Sonneveld & Voogt 2009, 0.70-0.85 band) bounds the value; 0.70 at floor remains literature-defensible. Sibling 2026-05-23 plant-needs `D1` (`min(5, 2, 3) = 2` argument on the n=1 tissue panel cert) is the load-bearing cert-arithmetic question — verdict on plant-needs `D1` binds whether this refit's tissue-evidence basis was cert-3-defensible or cert-2 (in which case the refit was triggered by cert-2 evidence, but the post-refit value 0.70 stays cert-3 on the literature scaffolding, not the tissue). The safety of landing at lit floor on n=1 is precisely that cert-3 label survives regardless of plant-needs `D1` outcome — that's the [[refit-not-relabel]] move executed correctly. The move itself is principle-aligned (refit value within literature band rather than relabel cert).

### Verdict

Land after specialist addresses B1 (rewrite cause (a) past-tense — bundle with sibling 2026-05-23 sidedress B1 add compost cause (c); one paragraph surgery covers both) + B2 (add upward refinement trigger). Both auto-route to specialist's lane per [[no-audit-trail-to-guillaume]] — no Guillaume call (refit decision itself is principle-aligned per [[refit-not-relabel]]; the two findings are completeness gaps, not the refit decision).

---

## 2026-05-23 — review of `nutrition/tomato/sidedress-recipe/derivation.md` (TOM #1 T5 tissue panel — Refinement-triggers entry)

Scope: one new bullet under § "Refinement triggers" recording the 2026-05-22 TOM #1 T5 tissue panel observation (leaf N 2.27 % vs lab floor 3.10 %, -27 %). Frames modelled STORED supply at 2.88 g N/m²/wk vs T5 demand 4.05 g N/m²/wk; lists two possible causes — (a) `FarinePlumes.eff = 0.75` at literature high end; (b) cumulative early-stage mineralization shortfall (March × 0.8, April × 1.0). Refit gated on n ≥ 5 cohorts + petiole NO₃-N. Full trace cross-referenced to `nutrition/tomato/research/tomato-t5-tissue-analysis-2026-05-23.md`. No spec / REQ / constant moved; documentation-only addition. Sibling 2026-05-23 plant-needs entry already covers the cross-element lockout-vs-transpiration angle — this review limits to sidedress-side framing of the N gap.

### Blindspots

**B1 — Compost-residual N (`CompostContribution.releasePerWeek.N = 1.10 g/m²/wk`, ~28 % of T5 STORED supply) absent from the candidate-causes list.** · `PENDING`
- **What the spec assumes:** the entry frames the gap closure as a one-of-two refit problem on the sidedress side — either `FarinePlumes.eff` is too generous (a) or early-stage cumulative mineralization fell short (b). Both candidates sit on the sidedress-product side of the supply formula.
- **What might be ignored:** at T5, supply decomposes Farine 2.39 g + Actisol 0.49 g + compost 1.10 g = 3.98 g N/m²/wk (STORED). Compost residual is the third-largest term, ~28 % of total. Cert on `CompostContribution.releasePerWeek.N` is 2-3 per derivation table (composted-manure pellet, weekly-stack steady-state) — same band as the products listed in the candidates. A 0.3 g/m²/wk overestimate on compost release would shift the modelled gap from -1.7 % to -9.1 %, closing roughly the same ground the entry attributes to (a) or (b). Not orthogonal — but missing from the list means a future refit at the n ≥ 5 cohort gate may tune `FarinePlumes.eff` downward when the compost side carries part of the actual gap. Over-corrected sidedress + intact compost overstatement leaves T1-T2 (sidedress hard-zero, compost-only N supply) under-supplied while T3-T5 lands at the new tuned point.
- **How to test it:** cross-check `nutrition/compost-contribution/spec.md` cert on `releasePerWeek.N` against an independent compost-N mineralization estimate. Cheapest near-term signal: next Berger Labs soil N panel pre/post amendment cycle. Operational gating: add compost residual as cause (c) in the candidate list now, before the n ≥ 5 cohort window closes and the refit lands on one of the two listed parameters by default.
- **Cost if real:** medium. Refitting the wrong parameter at the n ≥ 5 gate is not yield-bleeding at T5 (the model still lands roughly at the right total N) but propagates a model error across stages — T1-T2 hard-zero region depends entirely on compost residual, so an unflagged compost overstatement leaves those stages chronically under-supplied with no sidedress lever to compensate.

### Complexity

No surface. Entry adds zero constants, zero branches, zero REQs. n ≥ 5 cohort gate + petiole NO₃-N tracking is the right delay before refit. Body length proportional to the empirical-anchor weight; full trace correctly pushed to the research subdirectory.

### Cert defense

No surface. The added entry carries no explicit cert ≥ 3 claim — it states observed tissue values, names two candidate causes, gates refit on cohort accumulation. The cert-3 values it references (`FarinePlumes.eff = 0.75`, compost release) live in their existing sections of the same derivation; no cert is moved by this diff. Per [[yield-impact-not-cert-fastidiousness]] the framing of "modelled -10 % gap" vs the table arithmetic landing at ~-1.7 % (compost counted) or -29 % (demand-only) is a prose-reading ambiguity, not a yield-bar finding — specialist's lane on next-touch.

### Verdict

Land after specialist addresses B1 — one-line addition of compost-residual as cause (c) in the candidate list. Routes through specialist's lane (no Guillaume call needed — model-side parameter, within the [[fertigation-subtracts-credited-reservoirs]] family of "all credited reservoirs are co-candidates at refit time"). Bundle with the 2026-05-23 plant-needs B1 / D1 if specialist is touching the cross-element T5 narrative anyway.

---

## 2026-05-23 — review of `nutrition/tomato/plant-needs/derivation.md` (TOM #1 T5 tissue panel empirical-anchor add)

Scope: new "Empirical anchor — TOM #1 T5 tissue panel (Agro-Enviro-Lab, 22 mai 2026)" section. No spec-side / REQ change; cert-4 panel-reading + cert-4 crisis-pattern interpretation framed, cert 2 on T5 macros explicitly retained (back-test trigger correctly not fired — stock vs flux distinction holds). Section is documentation-only; nothing in `data.js` / `calc.js` / `TOMATO_DEMAND_CERT` shifts. Mn/Cu/S contamination dual-hypothesis well-handled (cert 3 contamination vs cert 2 over-supply, repeat-with-washed-leaf gating) — no surface there.

### Blindspots

**B1 — N / P / Ca collapsed into one "lockout" diagnosis masks three distinct mechanisms; Ca-side remediation routing risk at T5 (BER yield-bleed).** · `PENDING (Guillaume call needed — PA Taillon field-read on T5 transpiration-vs-supply pattern)`
- **What the spec assumes:** "Ca-saturated + pH 7.4 lockout story hits hardest at the most yield-load-bearing stage" — single causal frame across N (-27 % below floor), P (-54 %), Ca (-13.5 %), K (at floor).
- **What might be ignored:** lockout = pH-driven solubility, fits P very well, fits N somewhat. But Ca tissue deficiency is NOT pH-lockout — Ca-saturated soil + xylem-mobile-only Ca means tissue Ca is transpiration-flow-limited not supply-limited, per the same caveat already cited at derivation.md:57-59 ("BER is a transpiration problem, not a soil-Ca problem — Décembre's Ca-saturated soil has no bearing on fruit Ca"). Three mechanisms (P-lockout, N-supply-timing or mineralization-curve mismatch, Ca-transpiration / xylem-flow) bundled as one diagnosis. If Ca-transpiration is the dominant T5 Ca driver, supply-side remediation doesn't move tissue Ca and doesn't reduce BER risk.
- **How to test it:** PA Taillon field-read on next walk — T5 cohort visual pattern transpiration-limited (afternoon-wilt + outer-fruit BER lesions, positional within fruit) or uniform-supply-deficient (across-canopy + across-fruit-positions chlorosis)? Cheap, no lab. Secondary: VPD log + irrigation event log over T5 weeks would disambiguate transpiration-stress timing.
- **Cost if real:** medium-high. BER under T5 transpiration limitation can lose 10-30 % of T5 fruit if uncorrected. If remediation invests in Ca supply when transpiration / VPD lever is the actual fix, yield bleed continues while remediation appears to land.

### Complexity

No surface. Section adds zero constants, zero branches, zero REQs. Explicit "does NOT fire macro back-test trigger" preserves the existing refinement framework. Documentation-only.

### Cert defense

**D1 — "Crisis pattern at peak demand (cert 4)" + "panel readings cert 4" — conflates analytical cert with sampling cert at n=1.** (stated cert 4) · `PENDING (mechanical decomposition; specialist's lane if approved)`
- **Specialist's defense:** "panel readings cert 4 (direct ICP measurement) ... crisis-pattern interpretation cert 4 (matches the pre-existing lockout hypothesis already wired into the plant-available-fraction multiplier)" — interpretive cert anchored to prior model coherence + analytical-instrument cert.
- **What I'd need to accept cert ≥ 4:** the three-layer cert decomposition the file's own cert scale demands. Per `plant-needs/spec.md` § "Cert scale": "Effective cert when two values combine = `min(cert_a, cert_b)`". Layered here: (i) ICP measurement of prepared sample = cert 5 (analytical chemistry, instrument-grade); (ii) one leaf representing the block at n=1 with unsurfaced sampling protocol (leaf position, sun vs shade, canopy depth, time of day not stated) = cert 2 (single sample, no protocol-pinned representativeness — and the section itself raises this concern asymmetrically only for Mn/Cu/S contamination); (iii) interpretive overlay onto pre-existing lockout narrative = cert 3 (generic tomato norms, prior-model coherence, not cultivar-or-block-specific). `min(5, 2, 3) = 2`. The cert-4 label rides analytical cert past the n=1 sampling-cert floor.
- **My read:** cert should be **2** on both the crisis-pattern interpretation and the "panel readings" framing. Cert-breakdown paragraph at section bottom rewrites as: analytical cert 5 / sampling cert 2 (n=1, unsurfaced protocol) / interpretive cert 3 → effective cert 2 per the file's own min-rule. Aligns with the section's own existing decision to NOT fire the back-test trigger (same n=1 stock-vs-flux honesty applied consistently). Doesn't change direction of the read (supply gap exists, lockout story still the leading hypothesis); does moderate the confidence with which downstream subprojects ramp remediation off this single panel before the second confirmatory sample lands.

### Verdict

Land after Guillaume verdict on B1 (PA Taillon field-read routing — pure surfacing, no specialist action absent his call) + D1 (mechanical cert decomposition at section bottom; specialist's lane if approved — file's own cert-scale rule binds). C / N = 17.1 "independent corroboration" framing closes silent per [[yield-impact-not-cert-fastidiousness]] (C / N is algebraically required by low N + typical leaf C — same observation, not independent — but yield-impact <3/5, cert-inflation only, no remediation fork).

---

## 2026-05-23 — review of `yield-range/derivation.md` (32-cell cert-downgrade landing pass)

Scope: REQ-112 / REQ-172 — 32-cell per-tray cert dropped from 3 to 2; explicit "only `h × ρ ≈ 8.2 kg/m²` is breeder-grounded; split into individual `h = 0.10 m` and `ρ = 82 kg/m³` is back-derived from the 50-cell anchor" reasoning landed; bump-to-cert-3 trigger named (`FOLIAGE_HEIGHT_M` independent anchor). Closes 2026-05-17 D1 (Guillaume option 1 + 2 combined: drop now, queue independent-anchor refit as path back to cert 3). Spec/code consistent — `yield-range/data.js:22-23` carries the geometric constants; cert is derivation-only metadata, no runtime consumer.

### Blindspots

No findings ≥3/5. One <3/5 wording mismatch closed silent per [[yield-impact-not-cert-fastidiousness]]: REQ-112 section prose names only `FOLIAGE_HEIGHT_M` as the cert-3 bump trigger, while the consolidated refinement-trigger table (same file) names both `FOLIAGE_HEIGHT_M` / `FOLIAGE_DENSITY_KG_PER_M3` as independently-needing anchors via Rijk Zwaan curves. An independent `h` anchor at 50-cell leaves `ρ` derived from the constrained `h × ρ` product (one-equation-one-unknown), so cert-3 on h-alone is defensible; not a substantive contradiction. Specialist's lane to harmonize wording on next-touch.

### Complexity

No surface. Cert relabel is no-op in code; no new constants, branches, or REQs.

### Cert defense

No surface. The diff downgrades a cert (3 → 2); no new ≥3 claim added. The bump-trigger condition is a stated future-cert-3 path, not a current claim to defend.

### Verdict

Ship-as-is. Landing pass closes prior 2026-05-17 D1; no new PENDING for Guillaume.

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
