# Lettuce — soil pH correction

How much elemental sulphur, applied when, moves the lettuce-bed soil pH toward the root-zone target — and whether correction is feasible given the bed's free-carbonate load, lettuce's tighter salt tolerance, and fast crop turnover.

This file is the *spec*. Derivations (carbonate stoichiometry, dose tables, cadence + guardrails, worked examples) live in `derivation.md`; decision history lives in `learnings/`.

The model answers exactly one question: **"What elemental-sulphur programme, if any, corrects lettuce-bed soil pH toward the root-zone target?"**

It does NOT answer:
- Soil nutrient banks / weekly supply — `nutrition/soil-contribution/spec.md`.
- Fertigation tank/dripper pH bands — `nutrition/chemistry/spec.md`.
- The lettuce root-zone target pH band itself — a PO gap (no lettuce analogue to the tomato `soil-root-zone-ph-band` yet); this model consumes the band as an input once defined.
- The crop-agnostic sulphur chemistry — shared with `nutrition/tomato/soil-ph/`; this file re-anchors only the lettuce-specific soil state, geometry, salt ceiling, and turnover cadence.

---

## Cert scale

Same scale as `nutrition/tomato/plant-needs/spec.md`.

---

<!-- specs to be added — see CLAUDE.md "Specs" section -->
<!-- Blocked on: lettuce root-zone pH band (PO gap) + calcimeter free-carbonate reading (field/lab). First REQs land once the carbonate gate is measured. -->

---

## Inherited specs

- **Lettuce root-zone pH band** — PO gap, no slug yet (`nutrition/lettuce/spec.md`). This model is blocked on it for the target endpoint.
- **Lettuce soil bank Ca / pH data** (`nutrition/soil-contribution/data.js`) — Mehlich-3 Ca 10 612 kg/ha, SME pH 7.48, sample 596617 (Berger 39088, April 2026).
- **Crop-agnostic sulphur chemistry + caps + cadence** (`nutrition/tomato/soil-ph/model/derivation.md`) — S:CaCO₃ stoichiometry, two-tier per-pass cap, oxidation-gated cadence, gypsum self-limit. Re-applied here with lettuce numbers.
