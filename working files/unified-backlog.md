# Unified backlog — gaps + challenges + audit findings

Date: 2026-05-05. Merges:
- **G1-G20** (gaps from earlier coherence audit, mapped to audit `Finding N` IDs)
- **Ch1-Ch24** (requirements challenges, `requirements-challenges.md`)
- **F1-F21** (coherence audit findings, `coherence-audit.md`)

Severity: **blocking** = wrong action / cert risk · **important** = misleads
or future-fail · **minor** = cleanup. Status reflects all decisions through
2026-05-05 end-of-session.

Ch1-Ch8 carry their decisions (Ch1=C · Ch2=C · Ch3=A · Ch4=B · Ch5=A ·
Ch6=A · Ch7=A · Ch8=C). Ch9-Ch24 are pending-decision (user hasn't
walked them yet).

---

## Status counts

| Status | Count |
|---|---|
| pending-decision | 21 |
| blocked (waiting on external input) | 4 |
| decided-pending-implementation | 12 |
| resolved | 8 |
| **Total** | **45** |

---

## Top 5 highest-priority pending items (look at first)

1. **F9 / Ch2** — CaCl₂ Teris Ecocert SKU verification (blocking, organic cert audit risk)
2. **Ch12** — REQ-024 per-shot vs time-averaged CE ambiguity (blocking, drives lettuce recipe)
3. **F8** — Lettuce predicted CE ~5.9 mS/cm (blocking if per-shot interpretation; ties to F5)
4. **Ch24** — Missing REQ for transpiration / irrigation volume (blocking; drives every Bilan number)
5. **Ch14** — REQ-016 ±5% drift threshold below input noise floor (blocking; will alert-flood on day 1)

---

# pending-decision

## blocking

### F9 — CaCl₂ Teris Ecocert SKU not verified
**Type:** Audit (Finding 9)  · **Severity:** blocking
**Status:** pending-decision
**Notes:** REQ-002/REQ-022 violation. Substance is allowed under
CAN/CGSB-32.311; specific Teris industrial-grade SKU not yet on Ecocert
input list. Needs phone call to Teris + cross-check Québec Vrai. Cert 4
that this resolves to "yes, allowed" once verified.
**Cross-ref:** Ch2 addresses the same root cause (binary `organicAllowed`
field can't represent SKU-level conditional listings).

### Ch12 — REQ-024 per-shot vs time-averaged CE ambiguity
**Type:** Challenge  · **Severity:** blocking
**Status:** pending-decision
**Notes:** REQ-024 silent on whether the 1.2-1.8 mS/cm lettuce band is
per-shot at the dripper or weekly time-average. Lettuce per-shot is
~5.9 mS/cm (3-4× band); time-avg ~2.0 (in band). Recommendation: split
into `CE_at_dripper_active` + `CE_at_dripper_timeavg`. Cert 4.
**Cross-ref:** F8 (the operational manifestation).

### F8 — Lettuce predicted CE ~5.9 mS/cm during fertigation
**Type:** Audit (Finding 8)  · **Severity:** blocking (per-shot interpretation)
**Status:** pending-decision
**Decision (recommended):** Option A (cut `LETTUCE.kSulfate` 3× from 2996
to ~1000) **paired with** Option C (clarify per-shot vs time-avg in
REQ-024). Don't act blindly — measure pour-through first.
**Notes:** Stock barrel concentration is 176 g/L K₂SO₄ — already above
the 100 g/L solubility cap. Cuts both ways: if recipe were halved, stock
would dissolve and CE would be in band on either interpretation.
**Cross-ref:** F5 (no lettuce demand model to validate the cut), Ch12.

### Ch24 — Missing REQ for transpiration / irrigation volume
**Type:** Challenge  · **Severity:** blocking
**Status:** pending-decision
**Notes:** 25.5 L/m²/wk transpiration assumption drives every "soil
supply" number in the Bilan. No REQ guards it. A 20% change shifts every
supply number by 20%; lockout banner flips behavior. Recommendation:
Option A (REQ-058 — transpiration model declared with cert + verifier).

### Ch14 — REQ-016 ±5% drift threshold below input noise floor
**Type:** Challenge  · **Severity:** blocking
**Status:** pending-decision
**Notes:** Compounded uncertainty on stored-vs-computed recipe is
~15-25% (PRODUCT_PCT ±5%, Dosatron ±5-10%, scale ±2-3%, efficiency curve
±20%). 5% threshold = noise-floor alert flood → operators learn to ignore
→ signal lost. Recommendation: Option B (3-tier: green ≤5%, yellow 5-20%,
red >20%).

### Ch2 — REQ-022 `organicAllowed: true` is binary; reality is conditional
**Type:** Challenge  · **Severity:** blocking
**Status:** decided-pending-implementation
**Decision:** Ch2 = Option C (leave binary; document SKU-level
verification requirement in REQ-022 text).
**Notes:** Trades structural integrity for simpler check. Addresses F9 by
documentation, not by mechanism. Cert 4 that the boolean shape will
produce a Finding-9-style miss again.

## important

### Ch1 — REQ-005's setter list misses `setSoiltargetCrop` (and any future page-local setter)
**Type:** Challenge  · **Severity:** important
**Status:** decided-pending-implementation
**Decision:** Ch1 = Option C (refactor: setters call a single
`routedStateChanged()` helper, assert helper exists + is called).
**Notes:** Option A (append `setSoiltargetCrop` to explicit list) deferred
— closes immediate gap but stays brittle for next setter. Option C is
the structural fix at next routing refactor.

### Ch3 — REQ-029's "Ksp at 20°C" ignores the actual barrel temperature range
**Type:** Challenge  · **Severity:** important
**Status:** decided-pending-implementation
**Decision:** Ch3 = Option A (pick binding-case temperature per pair —
5°C for cold-precipitation pairs e.g. K₂SO₄/gypsum; 25°C+ for kinetic
issues e.g. FeSO₄ oxidation). Document in KSP_PAIRS table.
**Notes:** REQ-029 currently has no temperature reference; REQ-021 uses
5°C. Cert 4 that 5°C is the right call for precipitation-on-cooling pairs.

### Ch4 — REQ-029a/b/c "build fails" mechanism is hand-wavy
**Type:** Challenge  · **Severity:** important
**Status:** decided-pending-implementation
**Decision:** Ch4 = Option B (commit to node-script verifier for REQ-010+).
**Notes:** Phase 2 work (in progress) realizes this decision. Cert 4 that
bash + grep cannot enforce structural invariants over a JS object graph.

### Ch5 — REQ-001's grep table is bypassed by template literals
**Type:** Challenge  · **Severity:** important
**Status:** decided-pending-implementation
**Decision:** Ch5 = Option A (headless render + DOM regex when a second
instance of brittleness shows up; document Option B constraint now —
no template-literal user-text — to set expectations).
**Notes:** Today's grep covers literal HTML; programmatic text injection
slips. Cert 4 that A is the right long-term shape.

### Ch6 — REQ-007's `JARGON_DENY` only contains one term
**Type:** Challenge  · **Severity:** important
**Status:** decided-pending-implementation
**Decision:** Ch6 = Option A (expand denylist via Catherine review pass
before next major rollout).
**Notes:** Per CLAUDE.md `feedback_review_workflow`, Catherine handles
non-tech review. Cert 4 that current denylist is missing real jargon.

### F2 — K and Mg fertigation supplies 2-4× T5 demand (luxury feeding)
**Type:** Audit (Finding 2)  · **Severity:** important
**Status:** pending-decision (LUXURY_FACTOR cap mitigates the model
display but doesn't change the recipe)
**Notes:** Bilan shows K supply 11 461 mg/m²/wk vs demand 5 250 (2.18×),
Mg 2 560 vs 600 (4.27×), Ca 6 106 vs 2 250 (2.71×) at T5. REQ-014 (≤1.3×)
will fail when wired. Recommendation: Option A (cut K₂SO₄ multiplier
toward 0.5× at T5) **only after tissue test confirms K luxury isn't
masking another issue**. Cert 3 on the over-supply finding (sensitive to
25.5 L/m²/wk transpiration assumption — see Ch24).
**Cross-ref:** F14 closed via sidedress reframe; this remains because
fertigation+soil sums still exceed demand.

### F5 — Lettuce demand model entirely absent
**Type:** Audit (Finding 5)  · **Severity:** important
**Status:** pending-decision
**Notes:** `LETTUCE` recipe ungrounded; no `BIOMASS_DEMAND` for lettuce;
`computeRecipe('lettuce', ...)` returns null. K rate ~4× typical Salanova
demand. Recommendation: Option B in next 2 weeks (cut K₂SO₄ to ~750
g/100 m²/wk to close CE problem F8 fast); Option A when REQ-010 work
begins (full demand model).
**Cross-ref:** F8 (CE problem), F20 (Fe display gap), Ch12 (CE band shape).

### F6 — Iron coherence: 4 separate Fe channels with mismatched effective doses
**Type:** Audit (Finding 6)  · **Severity:** important
**Status:** pending-decision
**Notes:** Lettuce production fertigation FeSO₄ contradicts the Cadre
framework's "do not fertigate" red zone for sulfate metals at pH 7.4.
Recommendation: Option B (keep, accept 85% waste, annotate explicitly
with `decorative: false, accepted: { reason: ... }`) until cycles return
to ≤3 wk.
**Cross-ref:** Ch10 (acceptedDeficit annotation has no expiry).

### F10 — Solar weeks 19-52 silent fallback to monthly
**Type:** Audit (Finding 10)  · **Severity:** important
**Status:** blocked (waiting on user data extension)
**Decision (recommended):** Option A (extend `SOLAR_BY_WEEK` to 52 weeks
with 20-yr Quebec City data). Resolves Ch8 too.
**Notes:** Cert drops from 5 to 3 silently as of week 19 (today).
**Cross-ref:** Ch8 (REQ-009 partial-year scope).

### F17 — "Stop watering 4 days before transplant" not in app UI
**Type:** Audit (Finding 17)  · **Severity:** important
**Status:** pending-decision
**Decision (recommended):** Option A (add hardening card to nursery page
with DLI-based formula 3-6 days).
**Notes:** Critical for tray-finishing strategy. Operational rule lives
only in baseline doc.

### F21 — Bilan Block 5 P lever contradicts Block 3 sidedress P
**Type:** Audit (Finding 21)  · **Severity:** important
**Status:** resolved (subsumed via F7's `phLockoutFactor_P` — see resolved
section below). Listed here for cross-ref clarity.

### F7 — Side-dress P at pH 7.4 ignored Ca-P precipitation
**Type:** Audit (Finding 7)  · **Severity:** important
**Status:** resolved (decided 2026-05-05: `phLockoutFactor_P` applied to
Actisol P contribution at pH 7.4 — Option C).

### F14 — Cross-channel double-counting risk for K (and N)
**Type:** Audit (Finding 14)  · **Severity:** important
**Status:** resolved (sidedress reframe 2026-05-05 dropped sidedress from
supply sum; sidedress now feeds the Banque sol bank trajectory).

### Ch9 — REQ-013/014 thresholds (0.9 / 1.3) are unjustified
**Type:** Challenge  · **Severity:** important
**Status:** pending-decision
**Recommendation:** Option C (per-element override declared in
DEMAND_BANDS or BIOMASS_DEMAND).
**Notes:** Blanket 1.3× cap will flag K luxury at 1.31× as same severity
as 2.18×. Element-specific bands needed (K wider, micros tighter, N
tightest).

### Ch11 — REQ-015 efficacy/safety bands need source-of-truth
**Type:** Challenge  · **Severity:** important
**Status:** pending-decision
**Recommendation:** Option A (each band carries `source` + `cert` field;
verifier fails on missing).

### Ch15 — REQ-017 phResponse curve has no required cert annotation
**Type:** Challenge  · **Severity:** important
**Status:** pending-decision
**Recommendation:** Option B (per-curve cert; per-point gold-plates).

### Ch16 — REQ-018 0.05 efficiency floor is arbitrary
**Type:** Challenge  · **Severity:** important
**Status:** pending-decision
**Recommendation:** Option C (codify Cadre framework as source of truth;
replace REQ-018 threshold with framework's color-zone rule).
**Notes:** Internal contradiction: REQ-018 passes lettuce FeSO₄
fertigation; Cadre framework flags it red.
**Cross-ref:** F6.

### Ch20 — REQ-028 90% coverage threshold currently at ~38%
**Type:** Challenge  · **Severity:** important
**Status:** pending-decision
**Recommendation:** Option C (mark deferred until recipe-model rebuild)
+ top-of-doc table naming every deferred REQ + its blocker.
**Cross-ref:** F13.

### Ch21 — REQ-053 envelope vs REQ-055 curve interaction undefined
**Type:** Challenge  · **Severity:** important
**Status:** pending-decision
**Recommendation:** Option A (add target pH 5.5-6.0 to REQ-053 with soft
warning band; hard-fail outside [5.0, 7.0]).

### Ch22 — REQ-055 foliar pH curve symmetric across element types
**Type:** Challenge  · **Severity:** important
**Status:** pending-decision
**Recommendation:** Option A (per-element curves keyed off `chemistryTags` —
cation / anion / chelate / non-ionic). Option C (drop curve, hard-fail
envelope only) is honest fallback.

### Ch23 — REQ-055 multipliers compound to <30% effective
**Type:** Challenge  · **Severity:** important
**Status:** pending-decision
**Recommendation:** Option B (cap product of all efficiency multipliers:
soft warning at 0.50, hard floor 0.20).

## minor

### F1 — BIOMASS_DEMAND[T5] split-sum identity is by construction, not a sanity check
**Type:** Audit (Finding 1)  · **Severity:** minor
**Status:** pending-decision
**Recommendation:** Option B (strip "sanity check passes" framing from
the comment; state plainly as identity).

### F3 — A↔B foliar warning text references P (legacy)
**Type:** Audit (Finding 3)  · **Severity:** minor
**Status:** pending-decision
**Recommendation:** Option A (update warning to gypsum framing — sulfates
of A + Ca of B → CaSO₄). Defer Iron DL ligand-swap wording until Iron DL
arrives (it won't, see decision 2026-05-05).

### F4 — Spray A residue × Spray B CaCl₂ wash-off interaction undocumented
**Type:** Audit (Finding 4)  · **Severity:** minor
**Status:** pending-decision
**Recommendation:** Option A (document in code comment only; benign at
current 22-22-7-2-1 g doses + 30% coverage; revisit if doses scale).

### F11 — SME_TEST_DATE staleness threshold 12 wk vs baseline 4-6 wk
**Type:** Audit (Finding 11)  · **Severity:** minor
**Status:** resolved (decision 2026-05-05: cut threshold to 6 weeks —
Option A).

### F12 — Sulfur dose: tomato 2.0 vs lettuce 3.3 kg/100 m² inconsistent
**Type:** Audit (Finding 12)  · **Severity:** important (downgraded to
minor pending biological argument)
**Status:** pending-decision
**Notes:** User must decide if higher lettuce dose was intentional.
Cert 4 that current lettuce is above baseline upper bound; cert 2 on
whether that's actually a problem.

### F13 — Cert annotation coverage spotty (~38% on sample)
**Type:** Audit (Finding 13)  · **Severity:** minor
**Status:** pending-decision (defer per Option C until REQ-010+ rebuild)
**Cross-ref:** Ch20.

### F15 — REQ-012 violation: no CHANNEL_ROLE for micros (Cu, Mo, B)
**Type:** Audit (Finding 15)  · **Severity:** minor
**Status:** resolved (`CHANNEL_ROLE` added 2026-05-05 with B at 50/50
foliar/passive; Cu/Mo at 100% foliar).

### F16 — Yucca pending in Spray A description; FeSO₄ bridge active
**Type:** Audit (Finding 16)  · **Severity:** blocking (downgraded to
resolved 2026-05-05)
**Status:** resolved (Iron DL + yucca dropped permanently; FeSO₄ 80
g/15 L is now the canonical Spray A Fe; coverage fixed at 0.30 in code).

### F18 — `NUTR_BIOMASS = 1.0` is dead code
**Type:** Audit (Finding 18)  · **Severity:** minor
**Status:** resolved (removed; constant deleted from index.html).

### F19 — Side-dress P column missing pH-aware status in Bilan
**Type:** Audit (Finding 19)  · **Severity:** minor
**Status:** resolved (subsumed by F7's `phLockoutFactor_P`).

### F20 — `LETTUCE.feSulfate` lacks per-element delivery surface
**Type:** Audit (Finding 20)  · **Severity:** minor
**Status:** pending-decision (subsumed by F5).

### Ch7 — REQ-008 `4 -` pattern matches anything, anywhere
**Type:** Challenge  · **Severity:** minor
**Status:** decided-pending-implementation
**Decision:** Ch7 = Option A (replace greps with node test — pinned
dates).
**Notes:** Realized when Ch4's node verifier (Phase 2) lands.

### Ch8 — REQ-009 weeks 19-52 fallback silent in UI
**Type:** Challenge  · **Severity:** minor
**Status:** decided-pending-implementation (blocked on user data)
**Decision:** Ch8 = Option C (REQ-009 documented as partial-year invariant
by design); paired with F10 Option A (data extension closes both).

### Ch10 — REQ-013 `acceptedDeficit` annotation has no expiry
**Type:** Challenge  · **Severity:** minor
**Status:** pending-decision
**Recommendation:** Option A (`acceptedDeficit: { reason, until: 'YYYY-MM-DD',
cert }`; verifier fails when `until` passes).
**Cross-ref:** F6 — Iron lettuce fertigation is the present-day instance.

### Ch13 — REQ-024 transition / hysteresis between stages
**Type:** Challenge  · **Severity:** minor
**Status:** pending-decision
**Recommendation:** Option C (leave; current ramp not a problem).

### Ch17 — REQ-022 doesn't catch products in PRODUCT but never used
**Type:** Challenge  · **Severity:** minor
**Status:** pending-decision
**Recommendation:** Option B (separate `PRODUCT_ARCHIVE` for prohibited /
deprecated; verify operational `PRODUCT` is 100% allowed).

### Ch18 — REQ-026 15% drift threshold ignores temperature dependence of CE
**Type:** Challenge  · **Severity:** minor
**Status:** pending-decision
**Recommendation:** Option C (document temperature-corrected readings
required; UI logging form notes Bluelab default).

### Ch19 — REQ-027 cycle units inconsistent for lettuce vs tomato
**Type:** Challenge  · **Severity:** minor
**Status:** pending-decision
**Recommendation:** Option A (restate as "+0.5 mS/cm over 14 days"
regardless of crop).

---

# blocked (waiting on external input)

### E5 — Solar weeks 19-52 data
**Type:** Gap  · **Severity:** important
**Status:** blocked (data extension from user's 2026-05 source)
**Cross-ref:** F10, Ch8.

### E6 — Tissue test results
**Type:** Gap  · **Severity:** blocking (drives F2, F6, BACKGROUND_N_FLUX
direction, Cu toxicity diagnosis)
**Status:** blocked (test ordered, awaiting results)
**Notes:** Confirms / refutes:
- Cu toxicity (high tissue Cu → reduce CuSO₄ further)
- N status (low → restore Ocean drench or increase sidedress; high →
  cut Actisol)
- Mg via K antagonism (low Mg + adequate soil Mg → cut K₂SO₄ multiplier;
  realizes F2 cut decision)

### F9 — CaCl₂ Teris Ecocert SKU verification (also blocking, listed above)
**Status:** pending-decision but functionally blocked on Teris response.

### Ch6 — JARGON_DENY review pass
**Status:** blocked on Catherine review session.

---

# decided-pending-implementation

(See full entries above. Summary list:)

| ID | Decision | Notes |
|---|---|---|
| Ch1 | Option C | refactor at next routing refactor |
| Ch2 | Option C | doc update only |
| Ch3 | Option A | per-pair temperature reference in KSP_PAIRS |
| Ch4 | Option B | Phase 2 verifier (in progress) |
| Ch5 | Option A | wait for second brittleness instance; document constraint now |
| Ch6 | Option A | Catherine review pass |
| Ch7 | Option A | Phase 2 verifier realizes |
| Ch8 | Option C | partial-year invariant; paired with F10 data extension |
| Ch10 | Option A (recommended) | adds `until` field to acceptedDeficit |
| Ch20 | Option C (recommended) | top-of-doc table for deferred REQs |
| F10 | Option A (recommended) | extend SOLAR_BY_WEEK to 52 weeks |
| F11 | Option A | done — staleness threshold cut to 6 weeks |
| F17 | Option A (recommended) | hardening card on nursery page |

---

# resolved

(Closed during current session.)

| ID | Resolution | Date |
|---|---|---|
| F3 | Closed early — A↔B warning rewritten in earlier session | pre-2026-05-05 |
| F4 | Closed early — leaf-residue interaction documented in code comment | pre-2026-05-05 |
| F7 | Sidedress P pH-lockout factor (`phLockoutFactor_P`) applied at pH 7.4 (Option C) | 2026-05-05 |
| F11 | Staleness threshold cut from 12 wk to 6 wk (Option A) | 2026-05-05 |
| F14 | Sidedress reframed as bank-maintenance; dropped from supply sum | 2026-05-05 |
| F15 | `CHANNEL_ROLE` added with explicit fractions for every element including B/Mo/Cu | 2026-05-05 |
| F16 | Iron DL + yucca dropped permanently; FeSO₄ 80 g/15 L canonical; coverage 0.30 | 2026-05-05 |
| F18 | `NUTR_BIOMASS` dead constant removed | 2026-05-05 |
| F19 | Subsumed by F7 (sidedress P now pH-locked) | 2026-05-05 |
| F21 | Subsumed by F7 (Block 5 lever no longer contradicts Block 3 — both now respect lockout) | 2026-05-05 |

---

# Cross-reference matrix

| Root cause | Audit | Challenges | Status |
|---|---|---|---|
| Override decay (annotations don't expire) | F6 | Ch10 | pending-decision |
| Cross-channel double-count | F14, F15 | (Ch9 thresholds related) | F14/F15 resolved |
| pH-lockout sidedress P | F7, F19, F21 | Ch16 (REQ-018 floor) | F7/F19/F21 resolved; Ch16 pending |
| Lettuce model gap | F5, F8, F20 | Ch12 (REQ-024 ambiguity) | All pending; F8 blocking |
| CE band shape | F8 | Ch12, Ch13, Ch18, Ch19 | F8/Ch12 blocking |
| Organic cert verification | F9 | Ch2, Ch17 | F9 blocking; Ch2 decided-doc-only |
| Solar data | F10 | Ch8 | F10 blocked-on-data; Ch8 decided |
| Cert coverage | F13 | Ch20, Ch15 | All pending; defer to REQ-010+ |
| Foliar tank chemistry | F3, F4, F16 | Ch21, Ch22, Ch23 | F-side resolved; Ch-side pending |
| Threshold justification | F2, F12 | Ch9, Ch14, Ch16 | F12 pending; Ch14 blocking |
| Verifier mechanism | — | Ch4, Ch5, Ch7 | All decided-pending-Phase 2 |
| Transpiration as input | F2 (sensitivity) | Ch24 | Ch24 blocking |
| Routing setter coverage | — | Ch1 | decided-pending-refactor |
