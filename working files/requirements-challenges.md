# Requirements challenges — adversarial review

Date: 2026-05-05. Status: largely superseded by the 2026-05 spec-tree rebuild
(REQ-010-032 + 053-055 are now wired across `nutrition/**/spec.md`).
Kept for the open issues below and for the Challenge 17 pointer cited from
`scripts/check-recipes.mjs:1243`.

---

## Still-open issues (not yet absorbed into spec)

### Challenge 14 — REQ-016 ±5% drift threshold below noise floor
Inputs stack to ±15-25% (label ±5%, scale ±2-3%, Dosatron ±5-10%, efficiency
curves ±20%). 5% threshold trains operators to ignore the alert.
**Recommendation:** three-state output (green ≤5%, yellow 5-20%, red >20%).
Cert 5.

### Challenge 17 — REQ-022: prohibited products dormant in PRODUCT registry
A non-allowed product sitting in `PRODUCT` with `organicAllowed: false` is a
copy-paste foot-gun. **Resolved direction:** every PRODUCT entry must be
allowed; archive prohibited products elsewhere. Already adopted in
`scripts/check-recipes.mjs:1247-1257` (checks all PRODUCT, not just active).

### Challenge 22 — REQ-055 single foliar pH curve averages four chemistries
Real curves differ for cation / anion / chelate / non-ionic; the single
curve over-corrects Ca and under-corrects free-cation micros.
**Recommendation:** per-element curves keyed off `chemistryTags`. Cert 4.

### Challenge 24 — Transpiration assumption ungoverned
Coherence-audit Finding 2 hinges on 25.5 L/m²/wk; no REQ verifies it.
Highest-leverage unverified input in the model. Status: still no REQ in
`nutrition/spec.md` or sibling specs governing the transpiration constant.

---

## Patterns observed (cross-cutting)

- Target-spec REQs without owner/date drift indefinitely. Mitigated by the
  2026-05 spec-tree migration but watch for new occurrences.
- Text-content greps catch handwritten regressions, miss template literals /
  attribute interpolation. (Affects REQ-001, 006, 007.)
- Thresholds without justification (0.9×, 1.3×, ±5%, 0.05 floor) produce
  alert fatigue. Element-aware or stage-aware bands recommended.

---

## Superseded — see spec tree

| Challenge | Topic | Now lives in |
|---|---|---|
| Ch1 (REQ-005 setter list) | Closed by P-08 ruling | `team-leader` notes |
| Ch2 (REQ-022 binary flag) | Closed: every PRODUCT checked | `scripts/check-recipes.mjs` |
| Ch3 (Ksp at 20°C vs barrel temp) | REQ-029 family | `nutrition/tomato/fertigation-recipe/spec.md` |
| Ch4 ("build fails" mechanism) | Resolved: node verifier | `scripts/check-recipes.mjs` |
| Ch5 (REQ-001 grep brittleness) | Same grep still in use | `scripts/check-requirements.sh` |
| Ch6 (JARGON_DENY only one term) | Catherine review pass | team process |
| Ch7 (REQ-008 `4 -` pattern brittle) | Unchanged | `scripts/check-requirements.sh` |
| Ch8 (REQ-009 weeks 19-52 fallback) | Cert 3 display surfaced | `requirements.md` REQ-009 |
| Ch9 (0.9× / 1.3× unjustified) | REQ-013 / REQ-014 active | `nutrition/spec.md` |
| Ch10 (`acceptedDeficit` no expiry) | Not implemented yet | — |
| Ch11 (efficacy/safety bands source) | REQ-015 wired | `nutrition/spec.md` |
| Ch12 (CE per-shot vs time-avg) | REQ-024 active | `nutrition/spec.md` |
| Ch13 (CE stage transition) | Deferred (Option C) | — |
| Ch15 (`phResponse` cert) | REQ-017 active | `nutrition/spec.md` |
| Ch16 (REQ-018 0.05 floor) | REQ-018 active | `nutrition/spec.md` |
| Ch18 (REQ-026 CE temp correction) | Bluelab implicit | `requirements.md` note |
| Ch19 (REQ-027 cycle unit asymmetry) | Deferred | — |
| Ch20 (REQ-028 90% vs 38% actual) | Reframed in spec tree | `nutrition/**` cert annotations |
| Ch21 (REQ-053 envelope vs REQ-055 curve) | REQ-053/055 active | `nutrition/tomato/foliar-recipe/spec.md` |
| Ch23 (compound efficiency floor) | Not bounded yet | — |
