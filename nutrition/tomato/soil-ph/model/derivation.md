# Tomato — soil pH correction · derivation

How the model is built. Spec is in `spec.md`. This file: carbonate stoichiometry, sulphur dose rule, feasibility gate, refinement triggers. Decision history (rejected acid amendment etc.) lives in `learnings/`.

## Soil state (anchors)

| Quantity | Value | Cert | Source |
|---|---|---|---|
| Mehlich-3 water pH (tomato bed) | 7.28 | 4 | Berger Apr 2026 |
| SME root-zone pH (tomato) | 6.99 | 4 | Berger Apr 2026 |
| CEC | 33.1 meq/100g | 4 | Berger Apr 2026 |
| Mehlich-3 Ca (exchangeable) | ~10 989 kg/ha | 4 | Berger Apr 2026 |
| Free carbonate (CaCO₃) | **unmeasured** | 0 | — (calcimeter pending) |
| Soil mass basis | 200 kg/m² (20 cm × 1.0 g/cm³) | 3 | `soil-contribution/data.js` |
| Tomato bed area | 382.9 m² (7 × 54.7) | 4 | `app/operator/state.js` |

Total topsoil mass = 200 × 382.9 = **76 580 kg**.

## Feasibility gate — free carbonate

pH 7.28 is a >1-unit jump from the 6.09 pre-greenhouse baseline, driven by calcitic-lime (CaCO₃) ORGANIMIX compost. This is the textbook free-carbonate signature, but the carbonate pool is **unmeasured** — no calcimeter / HCl-effervescence reading on file.

Free carbonate is a sink: oxidised sulphur → H₂SO₄ → neutralises CaCO₃ *before* net pH moves. Until the pool is sized, no sulphur total is trustworthy. **Calcimeter % is the model's go/no-go input.**

Compounding: concrete sonotubes leach Ca/alkalinity continuously, so no finite dose *holds* pH — any programme is a holding loop, not a one-shot finish line.

## Sulphur dose rule (carbonate-titration term)

Reaction chain: S + 1.5 O₂ + H₂O → H₂SO₄; H₂SO₄ + CaCO₃ → CaSO₄ + H₂O + CO₂.
1 mol S neutralises 1 mol CaCO₃. Mass ratio S:CaCO₃ = 32:100.

**S to titrate carbonate = 0.32 × (CaCO₃ mass).**

Carbonate mass = (calcimeter % / 100) × 76 580 kg (whole tomato block, all 7 beds).

### Per-pass safety cap — two tiers (the agronomic ceiling per application, NOT a target)

Cap is per-unit-area. **One bed = 54.7 m²; whole tomato block = 7 × 54.7 = 382.9 m²** (`app/operator/state.js`). Tier depends on whether sulphur can be incorporated:

| Tier | When | Rate | Per bed (54.7 m²) | Whole block (382.9 m²) |
|---|---|---|---|---|
| **Tilled-in** | bare bed, between crops | ~9.8 kg/100 m² (20 lb/1000 ft²) | **~5.4 kg/pass** | ~37.8 kg/pass |
| **Standing crop** | tomatoes in ground, surface/band | ~4.5 kg/100 m² (400 lb/acre) | **~2.5 kg/pass** | ~17.5 kg/pass |

Basis: tilled = veg-garden incorporated ceiling (acid diluted through tilled 15–20 cm); standing-crop = established-planting ceiling (no till near live roots → acid-microzone risk). Both cert 3 (extension literature, not tomato-specific). The earlier "2 kg/100 m²" was a turf-surface number — superseded; it under-caps the tilled case.

#### What the cap governs — total acid, NOT oxidation rate (cert 4)

The per-pass cap is a **buffer/dilution ceiling**, not a throughput
limit. Every kg of S⁰ eventually yields the same ~3 kg H₂SO₄
regardless of particle size — total acid = f(mass), not f(rate). The
cap answers: how many moles of acid can this root-zone *volume* absorb
(carbonate + CEC buffer) and dilute (tilled 20 cm vs surface band)
before damaging acid microzones form near live roots. That ceiling is
stoichiometric + geometric → **particle-size-independent**: a fine,
fast product (Microthiol 9 µm) and a coarse one carry the same mass
cap. This is also why the two tiers split on *incorporation depth*,
not on speed.

Faster oxidation changes the **peak, not the total**: the same acid
delivered in a shorter burst → lower transient pH minimum + higher
*instantaneous* O₂ demand (sharper H₂S risk on a wet bed). That is a
**rate hazard, controlled by cadence + the guardrails (pH retest,
aeration, EC) — not by the per-pass mass cap.** For a fast product,
hold the mass ceiling but flatten the peak under it: split into
smaller increments, retest pH at 2 wk (not 4), never dose waterlogged.
See `learnings/microthiol-kumulus-soil-use-agronomic-risks`.

### Passes to titrate carbonate, by tier

| Calcimeter % | CaCO₃ (kg) | S to titrate (kg) | Passes @ 2.5 kg/bed | Passes @ 5.4 kg/bed | Read |
|---|---|---|---|---|---|
| ~0 (no fizz) | ~0 | buffer-only ~50–120 (cert 1) | 3–7 | 1–3 | sulphur is a real lever |
| 0.1% | 77 | ~25 | ~2 | ~1 | feasible in a season |
| 0.5% | 383 | ~122 | ~7 | ~3 | multi-year, marginal |
| 1% | 766 | ~245 | ~14 | ~6–7 | impractical |
| 2% | 1 532 | ~490 | ~28 | ~13 | forget correction |

The "no fizz" buffer-only estimate is uncalibrated (cert 1) until an SMP / lime-requirement buffer-pH reading lands.

### Pass cadence — oxidation-gated, not calendar-gated

Rate-limiter is microbial oxidation (S⁰ → H₂SO₄ via *Thiobacillus*). Particle size dominates; warm + moist + aerated speeds it (cert 4).

- **Micronized powder (~200 mesh)** half-oxidises in ~6–10 days at 20 °C; several half-lives fit in a month at greenhouse 20–30 °C. A monthly feed reaches **steady state — each dose is mostly consumed before the next, so it does NOT runaway-stack** (provided the bed stays aerobic). Prilled/pelletized is far slower → accumulates unoxidised then crashes pH; not for monthly cadence.
- **The "≤400 lb/acre/yr established-planting" annual cap is a throughput + anaerobic-H₂S safety default for unmonitored growers — NOT a pH-overshoot or toxicity ceiling, and pH-independent in origin** (cert 4). With direct EC + pH monitoring it does not bind; monthly splits totalling more than the annual figure are supported by published increment-and-retest guidance (cert 3 — principle sourced, no validated higher annual number).
- **Replace the annual cap with measured guardrails** (cert 3):
  - EC: keep root-zone ECe ≤ 2.5 dS/m (tomato salinity threshold; ≈1.0–1.2 dS/m on 1:2 soil:water). Near it → skip/cut next dose.
  - pH: retest every 4 weeks before dosing; stop at 6.5, hard floor 6.2.
  - Aeration: never dose a waterlogged bed (S⁰ → H₂S root burn).
- **Dose:** start ~1.5–2.0 kg micronized S/bed/month, verify EC+pH at 4 weeks, then hold up to ~2.0–2.5 kg/month if clean. Do not open at the high end blind.

**Gypsum salinity self-limits (cert 4):** acid + CaCO₃ → CaSO₄ (gypsum), mass = S × 4.25. Gypsum solubility ~2.4 g/L; the bed's soil-water dissolves at most ~8 kg before saturating, so excess precipitates as inert solid and leaches under fertigation. Soil-solution EC self-caps near a saturated CaSO₄ solution (~2.0–2.2 dS/m) regardless of dose. Salt buildup is largely a red herring here; the only real effect is a transient EC pulse on top of fertigation EC — hence the EC guardrail above.

Monthly cadence shrinks calendar time (~1 yr vs ~3 yr at 0.5%+), NOT total sulphur or total passes.

### Time-to-effect — oxidation is NOT the binding rate-limiter

The per-dose oxidation (~weeks) is fast. What sets the calendar to a
*measurable pH move* on the tomato bed is two slower things:

1. **The carbonate sink** — pH does not move until free carbonate in
   the treated zone is titrated. Months-before-movement, by calcimeter
   row, at the standing-crop cap 2.5 kg S/bed/month (one 54.7 m² bed,
   ~10 940 kg topsoil; 1% = ~109 kg CaCO₃ = ~35 kg S to titrate):

   | Calcimeter % | S to titrate / bed | Months of dosing before pH starts to move |
   |---|---|---|
   | ~0 (no fizz) | buffer-only | weeks |
   | 0.1% | ~3.5 kg | ~1.5 (within a season) |
   | 0.5% | ~17 kg | ~7 (≈ a whole standing crop; marginal) |
   | 1% | ~35 kg | >14 (impractical mid-crop) |

2. **Tomato is a standing crop → no till.** Capped at the lower
   surface/band rate (2.5 vs tilled 5.4 kg) with acid-microzone risk
   near live roots. The fast window to move tomato pH is the **bare-bed
   tilled tier between crops**, not mid-cycle.

**Consequence: sulphur is a between-cycles soil-prep lever for tomato,
NOT a current-crop rescue.** Even in the fast ≤0.1% case, rhizosphere
pH movement is ~2–3 months out; with carbonate present it is months-to-
multi-cycle, past the current crop. (Contrast lettuce: tills at every
flip → faster tier + constant bare-bed windows → the better near-term
target. See `nutrition/lettuce/soil-ph/model/learnings/stuck-browning-
roots-ph-indicated-salinity-cleared`.) cert 3 (titration stoichiometry
cert 5; which calcimeter row cert 0 until measured).

### Full chain to "healthy roots + sufficient P" (worked, 0.1% carbonate)

**P is locked, not absent** — Mehlich-3 P = 557.7 kg/ha (a large
vault) vs SME available 1.1 ppm. So pH-drawdown releases a real
reserve; this is not chasing P that isn't in the soil. cert 4.

End-to-end estimate at 0.1% carbonate, crop standing, 2.5 kg S/bed/mo:

| Stage | Mechanism | Time |
|---|---|---|
| 1 · titrate carbonate | pH flat until free lime consumed (~3.5 kg S/bed) | ~1.5 mo |
| 2 · pH drawdown 7.28 → ~6.5 | **CEC 33.1 = high buffer → the slow, cert-2 step** (~10 kg S/bed, ≈ handoff 68 kg/block ÷ 7); P unlocks progressively | ~3–4 mo |
| 3 · P solubilise + uptake | vault → soil solution, SME P climbs; root uptake (overlaps stage 2, weeks lag) | overlaps |
| 4 · new roots + tissue P | P-driven root flush ~6–8 wk; leaf 0.23% → >0.50% floor over leaf turnover | ~1–2 mo |

**At MONTHLY 2.5 kg/bed: realistic total ~6–8 months; earliest signs
~3–4 months.** The binding term is the CEC-buffered drawdown
(stage 2), not the carbonate titration.

**Cadence dependence — chemical stages compress, biology does not.**
Biweekly (5 kg/bed/mo) ~halves stages 1+2 (~4.5–5.5 → ~2.5–3 mo) but
stages 3+4 are plant-time-bound (~1.5–2 mo floor, uncompressible by
dose). So monthly ~6–8 mo → **biweekly ~4–5 mo** — compressed, not
halved. Biweekly is the practical floor for micronized (half-life
~6–10 d; tighter spacing stacks unoxidised S) and forces a 2-week
pH retest (the thin 0.1% carbonate buffer is consumed in ~3 weeks →
unbuffered overshoot zone). The genuine accelerator is a **tilled
bare-bed window** (5.4 kg rate, full 20 cm incorporation, no live-
root acid-microzone risk), not higher standing-crop frequency.

**First-sign layering (biweekly cadence), in order to watch:**

| Signal | When | Reads |
|---|---|---|
| Soil pH probe drops | ~3–4 wk | carbonate consumed, drawdown begun — earliest "it works" (soil) |
| SME / petiole-sap P rises | ~4–8 wk | vault unlocking + uptake — leading *plant* indicator |
| Visible improvement | ~8–12 wk | new apex growth greener/stronger (NEW tissue only) |

Old deficient leaves do not recover (P is phloem-mobile → exported
to new growth); judge on newest leaves/trusses. Built-in abort: if
the pH probe hasn't moved by ~4–5 wk, the 0.1% carbonate assumption
was wrong → stop, recheck, don't dose blind.

Caveats: sink competition means a fruiting T5 plant spends on fruit
before roots → the clean payoff is on new growth, not the existing
stressed tissue. cert 2 (CEC drawdown + biological lag are
extrapolated, not measured on Décembre beds).

## On-hand product — Tiger 90CR

The elemental sulphur on hand is **Tiger 90CR** (Tiger-Sul):
**90% elemental S + ~10% bentonite**, degradable pastille/granule.
All dose figures above are **elemental S** — convert to product:

**product dose = elemental S ÷ 0.90** (e.g. 2.0 kg S → ~2.22 kg product).

**Form vs the micronized-powder assumption (cert 3):** the cadence
argument (§ pass cadence) assumes micronized ~200-mesh powder. Tiger
90CR is a bentonite-bound pastille — on wetting the clay swells and
fractures it into fine S particles (the "degradable" mechanism), so
post-dispersion oxidation approaches the micronized rate. But there is
a **wetting/dispersion lag** (days, moisture-dependent) before fracture,
so effective oxidation start is slightly later than loose powder. Keep
the 4-week retest cadence — the lag is inside that window.

**Cert status — UNKNOWN, must verify before use (cert 0).** Elemental
sulphur and bentonite are both permitted under CAN/CGSB-32.311, but the
specific *formulation* needs an OMRI / Ecocert listing confirmation —
do not assume the branded product is approved. Tiger-Sul markets an
organic line; confirm THIS bag's listing. Refinement: pull the product's
OMRI/Ecocert certificate → raises cert to 4 (allowed) or forces a
substitute.

## Refinement triggers

- Calcimeter / inorganic-carbon reading → replaces the cert-0 carbonate row; picks the dose-table row.
- Buffer-pH (SMP) reading → calibrates the "no fizz" buffer-only estimate.
- PO root-zone target band (`nutrition/tomato/spec — soil-root-zone-ph-band`, not yet written) → sets the pH endpoint.
- Incorporation depth/method (tilled 20 cm vs surface-banded) → changes the soil mass titrated.
- Tiger 90CR OMRI/Ecocert certificate → resolves the cert-0 product status to allowed or forces a substitute.

## pH scale

Anchor correction on **Mehlich-3 water pH** (soil-bed measure) per the SME-is-soilless rule; track SME root-zone as a secondary guardrail. Never mix the two scales (~0.3 unit apart by method) in one calculation.
