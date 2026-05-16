# Unified backlog — gaps + challenges + audit findings

Date: 2026-05-05. Status reflects decisions through 2026-05-05 end-of-session. Merges G1-G20 (gaps), Ch1-Ch24 (`requirements-challenges.md`), F1-F21 (`coherence-audit.md`).

Severity: **blocking** = wrong action / cert risk · **important** = misleads or future-fail · **minor** = cleanup.

Ch1-Ch8 decided (Ch1=C · Ch2=C · Ch3=A · Ch4=B · Ch5=A · Ch6=A · Ch7=A · Ch8=C). Ch9-Ch24 pending.

---

## Status counts

| Status | Count |
|---|---|
| pending-decision | 21 |
| blocked (external input) | 4 |
| decided-pending-implementation | 12 |
| resolved | 8 |
| **Total** | **45** |

---

## Top 5 pending priorities

1. **F9 / Ch2** — CaCl₂ Teris Ecocert SKU verification (blocking, organic cert audit risk).
2. **Ch12** — REQ-024 per-shot vs time-averaged CE ambiguity (blocking, drives lettuce recipe).
3. **F8** — Lettuce predicted CE ~5.9 mS/cm (blocking if per-shot; ties to F5).
4. **Ch24** — Missing REQ for transpiration / irrigation volume (blocking; drives every Bilan number).
5. **Ch14** — REQ-016 ±5% drift threshold below input noise floor (blocking; alert-flood on day 1).

---

# pending-decision

## blocking

### F9 — CaCl₂ Teris Ecocert SKU not verified
REQ-002 / REQ-022 violation. Substance allowed under CAN/CGSB-32.311; specific Teris industrial-grade SKU not on Ecocert input list. Phone call to Teris + Québec Vrai cross-check. Cert 4 it resolves to "allowed". **Cross-ref:** Ch2 same root cause (binary `organicAllowed` can't represent SKU-level conditional listing).

### Ch12 — REQ-024 per-shot vs time-averaged CE ambiguity
REQ-024 silent on whether 1.2-1.8 mS/cm lettuce band is per-shot or weekly time-average. Per-shot ~5.9 (3-4× band); time-avg ~2.0 (in band). Recommendation: split into `CE_at_dripper_active` + `CE_at_dripper_timeavg`. Cert 4. **Cross-ref:** F8.

### F8 — Lettuce predicted CE ~5.9 mS/cm during fertigation
**Recommendation:** Option A (cut `LETTUCE.kSulfate` 3× from 2996 to ~1000) **paired with** Option C (clarify per-shot vs time-avg in REQ-024). Measure pour-through first. Stock barrel concentration is 176 g/L K₂SO₄ — already above 100 g/L solubility cap. **Cross-ref:** F5 (no lettuce demand model), Ch12.

### Ch24 — Missing REQ for transpiration / irrigation volume
25.5 L/m²/wk transpiration assumption drives every "soil supply" number. No REQ guards it. 20% change shifts every supply 20%; lockout banner flips behavior. **Recommendation:** Option A (REQ-058 — transpiration model declared with cert + verifier).

### Ch14 — REQ-016 ±5% drift threshold below input noise floor
Compounded uncertainty stored-vs-computed is ~15-25% (PRODUCT_PCT ±5%, Dosatron ±5-10%, scale ±2-3%, efficiency curve ±20%). 5% = noise-floor alert flood → operators ignore → signal lost. **Recommendation:** Option B (3-tier: green ≤5%, yellow 5-20%, red >20%).

### Ch2 — REQ-022 `organicAllowed: true` is binary; reality is conditional
**Status:** decided-pending-implementation. **Decision:** Option C (leave binary; document SKU-level verification requirement in REQ-022 text). Trades structural integrity for simpler check. Addresses F9 by documentation only — cert 4 the boolean shape will produce a Finding-9-style miss again.

## important

### Ch1 — REQ-005's setter list misses `setSoiltargetCrop`
**Decision:** Option C (refactor: setters call a single `routedStateChanged()` helper, assert helper exists + is called). Option A (append name) closes immediate gap but stays brittle. Structural fix at next routing refactor.

### Ch3 — REQ-029's "Ksp at 20°C" ignores barrel temperature range
**Decision:** Option A (per-pair binding-case temperature — 5°C for cold-precipitation pairs e.g. K₂SO₄/gypsum; 25°C+ for kinetic e.g. FeSO₄ oxidation). REQ-021 uses 5°C. Cert 4.

### Ch4 — REQ-029a/b/c "build fails" mechanism is hand-wavy
**Decision:** Option B (node-script verifier for REQ-010+). Phase 2 in progress. Cert 4 bash + grep can't enforce structural invariants over JS object graph.

### Ch5 — REQ-001's grep table bypassed by template literals
**Decision:** Option A (headless render + DOM regex when second brittleness instance shows; document Option B constraint now — no template-literal user-text). Cert 4 A is right long-term shape.

### Ch6 — REQ-007's `JARGON_DENY` only contains one term
**Decision:** Option A (expand denylist via Catherine review pass before next major rollout). Cert 4 current denylist missing real jargon.

### F2 — K/Mg fertigation supplies 2-4× T5 demand (luxury feeding)
Bilan shows K 11 461 vs demand 5 250 (2.18×), Mg 4.27×, Ca 2.71× at T5. REQ-014 (≤1.3×) will fail when wired. **Recommendation:** Option A (cut K₂SO₄ multiplier to 0.5× at T5) **only after tissue test**. Cert 3 (sensitive to 25.5 L/m²/wk transpiration — Ch24). **Cross-ref:** F14 closed via sidedress reframe; this remains because fert+soil sums still exceed demand.

### F5 — Lettuce demand model entirely absent
`LETTUCE` recipe ungrounded; `computeRecipe('lettuce', ...)` returns null. K rate ~4× typical Salanova. **Recommendation:** Option B in 2 weeks (cut K₂SO₄ to ~750 g/100 m²/wk — closes F8 fast); Option A when REQ-010 work begins (full demand model). **Cross-ref:** F8, F20, Ch12.

### F6 — Iron coherence: 4 Fe channels mismatched
Lettuce production fertigation FeSO₄ contradicts Cadre framework "do not fertigate" red zone for sulfate metals at pH 7.4. **Recommendation:** Option B (keep, accept 85% waste, annotate `decorative: false, accepted: { reason }`) until lettuce cycles return to ≤3 wk. **Cross-ref:** Ch10 (annotation has no expiry).

### F10 — Solar weeks 19-52 silent fallback to monthly
**Status:** blocked (waiting on user data extension). **Recommendation:** Option A (extend `SOLAR_BY_WEEK` to 52 wk with 20-yr Quebec City data). Resolves Ch8 too. Cert drops 5 → 3 silently as of week 19 (today). **Cross-ref:** Ch8.

### F17 — "Stop watering 4 days before transplant" not in app UI
**Recommendation:** Option A (hardening card on nursery page with DLI-based formula 3-6 days). Critical for tray-finishing strategy.

### Ch9 — REQ-013/014 thresholds (0.9 / 1.3) unjustified
**Recommendation:** Option C (per-element override declared in DEMAND_BANDS or BIOMASS_DEMAND). Blanket 1.3× flags K luxury at 1.31× same as 2.18×. Element-specific bands needed (K wider, micros tighter, N tightest).

### Ch11 — REQ-015 efficacy/safety bands need source-of-truth
**Recommendation:** Option A (each band carries `source` + `cert`; verifier fails on missing).

### Ch15 — REQ-017 phResponse curve has no required cert annotation
**Recommendation:** Option B (per-curve cert; per-point gold-plates).

### Ch16 — REQ-018 0.05 efficiency floor is arbitrary
**Recommendation:** Option C (codify Cadre framework as source of truth; replace REQ-018 threshold with framework's color-zone rule). Contradiction: REQ-018 passes lettuce FeSO₄ fertigation; Cadre flags it red. **Cross-ref:** F6.

### Ch20 — REQ-028 90% coverage threshold currently at ~38%
**Recommendation:** Option C (mark deferred until recipe-model rebuild) + top-of-doc table naming every deferred REQ + blocker. **Cross-ref:** F13.

### Ch21 — REQ-053 envelope vs REQ-055 curve interaction undefined
**Recommendation:** Option A (target pH 5.5-6.0 to REQ-053 with soft warning band; hard-fail outside [5.0, 7.0]).

### Ch22 — REQ-055 foliar pH curve symmetric across element types
**Recommendation:** Option A (per-element curves keyed off `chemistryTags` — cation / anion / chelate / non-ionic). Option C (drop curve, hard-fail envelope) is honest fallback.

### Ch23 — REQ-055 multipliers compound to <30% effective
**Recommendation:** Option B (cap product of all efficiency multipliers: soft warning at 0.50, hard floor 0.20).

## minor

### F1 — BIOMASS_DEMAND[T5] split-sum is identity by construction
**Recommendation:** Option B (strip "sanity check passes" framing; state as identity).

### F3 — A↔B foliar warning references P (legacy)
**Recommendation:** Option A (update to gypsum framing — sulfates of A + Ca of B → CaSO₄). Defer Iron DL ligand-swap wording (Iron DL won't arrive — see 2026-05-05 decision).

### F4 — Spray A residue × Spray B CaCl₂ undocumented
**Recommendation:** Option A (code comment only; benign at current 22-22-7-2-1 g doses + 30% coverage; revisit if doses scale).

### F12 — Sulfur dose: tomato 2.0 vs lettuce 3.3 kg/100 m²
User must decide if higher lettuce dose was intentional. Cert 4 lettuce above baseline upper; cert 2 it's a practical problem.

### F13 — Cert annotation coverage ~38% (sample)
**Status:** defer per Option C until REQ-010+ rebuild. **Cross-ref:** Ch20.

### F20 — `LETTUCE.feSulfate` lacks per-element delivery surface
Subsumed by F5.

### Ch10 — REQ-013 `acceptedDeficit` annotation has no expiry
**Recommendation:** Option A (`acceptedDeficit: { reason, until: 'YYYY-MM-DD', cert }`; verifier fails when `until` passes). **Cross-ref:** F6 is the present-day instance.

### Ch13 — REQ-024 transition / hysteresis between stages
**Recommendation:** Option C (leave; current ramp not a problem).

### Ch17 — REQ-022 doesn't catch products in PRODUCT but never used
**Recommendation:** Option B (separate `PRODUCT_ARCHIVE` for prohibited/deprecated; verify operational `PRODUCT` is 100% allowed).

### Ch18 — REQ-026 15% drift ignores temperature dependence of CE
**Recommendation:** Option C (document temperature-corrected readings required; UI logging form notes Bluelab default).

### Ch19 — REQ-027 cycle units inconsistent for lettuce vs tomato
**Recommendation:** Option A (restate as "+0.5 mS/cm over 14 days" regardless of crop).

---

# blocked (waiting on external input)

| ID | Topic | Blocker |
|---|---|---|
| E5 | Solar weeks 19-52 data | User data extension (F10, Ch8) |
| E6 | Tissue test results | Test ordered. Drives F2, F6, BACKGROUND_N_FLUX direction, Cu toxicity diagnosis. Confirms Cu toxicity / N status / Mg via K antagonism. |
| F9 | CaCl₂ Teris Ecocert | Teris response |
| Ch6 | JARGON_DENY review | Catherine review session |

---

# decided-pending-implementation (summary)

| ID | Decision | Notes |
|---|---|---|
| Ch1 | Option C | refactor at next routing refactor |
| Ch2 | Option C | doc update only |
| Ch3 | Option A | per-pair temperature in KSP_PAIRS |
| Ch4 | Option B | Phase 2 verifier (in progress) |
| Ch5 | Option A | wait for second brittleness instance |
| Ch6 | Option A | Catherine review pass |
| Ch7 | Option A | Phase 2 verifier realizes |
| Ch8 | Option C | partial-year invariant; paired with F10 |
| Ch10 | Option A | `until` field on acceptedDeficit |
| Ch20 | Option C | top-of-doc table for deferred REQs |
| F10 | Option A | extend SOLAR_BY_WEEK to 52 wk |
| F17 | Option A | hardening card on nursery page |

---

# resolved (closed during 2026-05-05 session)

| ID | Resolution | Date |
|---|---|---|
| F3 | A↔B warning rewritten | pre-2026-05-05 |
| F4 | leaf-residue documented in code comment | pre-2026-05-05 |
| F7 | `phLockoutFactor_P` applied to Actisol P at pH 7.4 (Option C) — see `nutrition/tomato/sidedress-recipe/spec.md` | 2026-05-05 |
| F11 | Staleness threshold cut 12 wk → 6 wk (Option A) | 2026-05-05 |
| F14 | Sidedress reframed as bank-maintenance; dropped from supply sum | 2026-05-05 |
| F15 | `CHANNEL_ROLE` added with explicit fractions per element — `nutrition/tomato/spec.md` REQ-011 | 2026-05-05 |
| F16 | Iron DL + yucca dropped permanently; FeSO₄ 80 g/15 L canonical; coverage 0.30 fixed | 2026-05-05 |
| F18 | `NUTR_BIOMASS` dead constant removed | 2026-05-05 |
| F19 | Subsumed by F7 | 2026-05-05 |
| F21 | Subsumed by F7 | 2026-05-05 |

---

# Cross-reference matrix

| Root cause | Audit | Challenges | Status |
|---|---|---|---|
| Override decay (annotations don't expire) | F6 | Ch10 | pending |
| Cross-channel double-count | F14, F15 | (Ch9 related) | F14/F15 resolved |
| pH-lockout sidedress P | F7, F19, F21 | Ch16 | F7/F19/F21 resolved; Ch16 pending |
| Lettuce model gap | F5, F8, F20 | Ch12 | all pending; F8 blocking |
| CE band shape | F8 | Ch12, Ch13, Ch18, Ch19 | F8/Ch12 blocking |
| Organic cert verification | F9 | Ch2, Ch17 | F9 blocking; Ch2 decided-doc-only |
| Solar data | F10 | Ch8 | F10 blocked-on-data; Ch8 decided |
| Cert coverage | F13 | Ch20, Ch15 | defer to REQ-010+ |
| Foliar tank chemistry | F3, F4, F16 | Ch21, Ch22, Ch23 | F-side resolved; Ch-side pending |
| Threshold justification | F2, F12 | Ch9, Ch14, Ch16 | F12 pending; Ch14 blocking |
| Verifier mechanism | — | Ch4, Ch5, Ch7 | decided-pending-Phase 2 |
| Transpiration as input | F2 (sensitivity) | Ch24 | Ch24 blocking |
| Routing setter coverage | — | Ch1 | decided-pending-refactor |
