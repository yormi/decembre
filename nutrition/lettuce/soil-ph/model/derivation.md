# Lettuce — soil pH correction · derivation

How the model is built. Spec is in `spec.md`. This file: lettuce soil state, the shared sulphur chemistry re-anchored on lettuce numbers, two-tier cap, cadence + guardrails, refinement triggers. Crop-agnostic chemistry is owned by `nutrition/tomato/soil-ph/model/derivation.md`; here it is applied to lettuce. Decision history (rejected alternatives) lives in `learnings/`.

## Soil state (anchors)

| Quantity | Value | Cert | Source |
|---|---|---|---|
| SME root-zone pH (lettuce) | 7.48 | 4 | Berger 39088, sample 596617, Apr 2026 |
| Mehlich-3 water pH (lettuce bed) | ~7.77 (estimated) | 2 | SME + ~0.29 method offset (tomato: water 7.28 vs SME 6.99); no direct water-pH on file |
| Mehlich-3 Ca (exchangeable) | 10 612 kg/ha | 4 | Berger 39088 |
| Free carbonate (CaCO₃) | **unmeasured** | 0 | — (calcimeter pending) |
| Soil mass basis | 200 kg/m² (20 cm × 1.0 g/cm³) | 3 | `soil-contribution/data.js` |
| Lettuce bed area | 30.4 m² | 4 | `app/operator/state.js` (`LETTUCE_BED_AREA`) |
| Lettuce number of beds | 4.5 | 4 | `app/operator/state.js` (`LETTUCE_NUMBER_BEDS`) |

Whole lettuce block = 4.5 × 30.4 = **136.8 m²**. Total topsoil mass = 200 × 136.8 = **27 360 kg**.

**Lettuce is more alkaline than tomato** (SME 7.48 vs 6.99) and Ca-saturated from the same calcitic-lime (CaCO₃) compost — the textbook free-carbonate signature. So correction is more, not less, needed than on the tomato bed. Carbonate pool still **unmeasured**; calcimeter % is the go/no-go input (same gate as tomato).

## Sulphur dose rule (carbonate-titration term)

Shared chemistry (`tomato/soil-ph`): S + 1.5 O₂ + H₂O → H₂SO₄; H₂SO₄ + CaCO₃ → CaSO₄ + H₂O + CO₂. 1 mol S neutralises 1 mol CaCO₃, mass ratio 32:100.

**S to titrate carbonate = 0.32 × (CaCO₃ mass).** Carbonate mass = (calcimeter % / 100) × 27 360 kg (whole lettuce block).

### Per-pass safety cap — two tiers (per-unit-area; rates shared with tomato, re-scaled to the 30.4 m² lettuce bed)

| Tier | When | Rate | Per bed (30.4 m²) | Whole block (136.8 m²) |
|---|---|---|---|---|
| **Tilled-in** | bare bed at crop flip (the lettuce default) | ~9.8 kg/100 m² | **~3.0 kg/pass** | ~13.4 kg/pass |
| **Standing crop** | lettuce in ground, surface/band | ~4.5 kg/100 m² | **~1.4 kg/pass** | ~6.2 kg/pass |

**Do NOT port the tomato 5.4 kg tilled dose to a lettuce bed** — that is the tomato 54.7 m² number; on a 30.4 m² lettuce bed it is ~17.8 kg/100 m², ~2× the tilled ceiling.

### Passes to titrate carbonate (tilled tier, 3.0 kg/bed = 13.4 kg/block)

| Calcimeter % | CaCO₃ (kg) | S to titrate (kg) | Passes @ 3.0 kg/bed |
|---|---|---|---|
| ~0 (no fizz) | ~0 | buffer-only ~18–43 (cert 1) | 1–3 |
| 0.1% | 27 | ~9 | ~1 |
| 0.5% | 137 | ~44 | ~3 |
| 1% | 274 | ~88 | ~7 |
| 2% | 547 | ~175 | ~13 |

Buffer-only range = tomato's 50–120 kg scaled by topsoil-mass ratio (27 360 / 76 580 = 0.357); uncalibrated (cert 1) until an SMP buffer-pH reading lands.

### Cadence — turnover-aligned, oxidation-gated

- **Lettuce flips every few weeks → the tilled-at-flip tier is the DEFAULT mode**, not the exception. Each flip is a natural bare-bed incorporation window; tilled passes land roughly monthly by the crop rhythm itself.
- Micronized powder (~200 mesh) at greenhouse 20–30 °C half-oxidises in ~6–10 days → mostly consumed within a flip cycle; no runaway stacking (shared finding, cert 4).
- The "≤400 lb/acre/yr" annual cap is a throughput/unmonitored-grower default, not a hard ceiling — replaced by measured guardrails below (shared finding, cert 3-4).

### Guardrails — TIGHTER than tomato (lettuce is salt-sensitive)

| Guardrail | Lettuce threshold | vs tomato | Action |
|---|---|---|---|
| EC (root zone) | **ECe ≤ 1.3 dS/m** (≈0.5–0.6 on 1:2) | ~half tomato's 2.5 | near it → skip/cut next pass; **check EC before transplant**, not just after |
| pH retest | every flip / ~4 weeks | same | stop at 6.5, hard floor 6.0 |
| Aeration | never dose a waterlogged bed | same | S⁰ → H₂S root burn |

Lettuce salinity threshold ECe ~1.3 dS/m (cert 4, FAO); yield falls fast above it. Gypsum salinity still self-limits (CaSO₄ solubility ~2.4 g/L, EC self-caps ~2.0–2.2 dS/m) — but lettuce's lower threshold means the transient EC pulse matters more, and it lands right as fast-cycle seedlings go in. Hence the pre-transplant EC check.

## Refinement triggers

- Calcimeter / inorganic-carbon reading → replaces the cert-0 carbonate row; picks the dose-table row.
- Direct Mehlich-3 water-pH reading → replaces the cert-2 estimated 7.77.
- Buffer-pH (SMP) reading → calibrates the "no fizz" buffer-only estimate.
- Lettuce root-zone target pH band (PO gap) → sets the endpoint.
- Incorporation depth/method → changes the soil mass titrated.

## pH scale

Anchor on Mehlich-3 water pH per the SME-is-soilless rule; track SME as a secondary guardrail. We currently hold only SME 7.48 for lettuce + an estimated water pH — a direct water-pH reading is the first refinement. Never mix the two scales (~0.3 unit apart) in one calculation.
