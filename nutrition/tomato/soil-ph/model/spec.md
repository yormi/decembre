# Tomato — soil pH correction

How much elemental sulphur, applied when, moves the tomato-bed soil pH into the root-zone target band — and whether correction is even feasible given the soil's free-carbonate load.

This file is the *spec*. Derivations (carbonate stoichiometry, dose tables, worked examples) live in `derivation.md`; decision history lives in `learnings/`.

The model answers exactly one question: **"What elemental-sulphur programme, if any, corrects tomato-bed soil pH toward the root-zone target?"**

It does NOT answer:
- Soil nutrient banks / weekly supply — `nutrition/soil-contribution/spec.md`.
- Fertigation tank/dripper pH bands — `nutrition/chemistry/spec.md`.
- The root-zone target pH band itself — **defined by this model** (specialist call, not a PO contract): Mehlich-3 water pH band 6.0–6.5, aim 6.3, hard floor 5.8 (conditioned on zeroing foliar Mn). Decision + rationale: `learnings/define-soil-root-zone-ph-target-band.md`.

---

## Cert scale

Same scale as `nutrition/tomato/plant-needs/spec.md`.

---

<!-- spec entries (slug headings) to be added — see to-specs skill -->
<!-- Target band now defined (learnings/define-soil-root-zone-ph-target-band.md). Remaining gate: a calcimeter free-carbonate reading (ordered). First entries land once the carbonate row is measured + code lands to test against. -->

---

## Inherited specs

- **Soil bank Ca / pH data** (`nutrition/soil-contribution/data.js`) — Mehlich-3 Ca, SME pH, bulk-density / soil-mass basis (200 kg/m² at 20 cm).
