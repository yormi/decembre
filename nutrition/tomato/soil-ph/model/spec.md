# Tomato — soil pH correction

How much elemental sulphur, applied when, moves the tomato-bed soil pH into the root-zone target band — and whether correction is even feasible given the soil's free-carbonate load.

This file is the *spec*. Derivations (carbonate stoichiometry, dose tables, worked examples) live in `derivation.md`; decision history lives in `learnings/`.

The model answers exactly one question: **"What elemental-sulphur programme, if any, corrects tomato-bed soil pH toward the root-zone target?"**

It does NOT answer:
- Soil nutrient banks / weekly supply — `nutrition/soil-contribution/spec.md`.
- Fertigation tank/dripper pH bands — `nutrition/chemistry/spec.md`.
- The root-zone target pH band itself — currently an unspecced PO gap (`nutrition/tomato/spec — soil-root-zone-ph-band`, not yet written); this model consumes the band as an input once defined.

---

## Cert scale

Same scale as `nutrition/tomato/plant-needs/spec.md`.

---

<!-- spec entries (slug headings) to be added — see to-specs skill -->
<!-- Blocked on: the PO soil-root-zone pH band (nutrition/tomato/spec) + a calcimeter free-carbonate reading. First entries land once the carbonate gate is measured. -->

---

## Inherited specs

- **`nutrition/tomato/spec — soil-root-zone-ph-band`** — soil-root-zone pH band. *Not yet written* (PO gap); this model is blocked on it for the target band.
- **Soil bank Ca / pH data** (`nutrition/soil-contribution/data.js`) — Mehlich-3 Ca, SME pH, bulk-density / soil-mass basis (200 kg/m² at 20 cm).
