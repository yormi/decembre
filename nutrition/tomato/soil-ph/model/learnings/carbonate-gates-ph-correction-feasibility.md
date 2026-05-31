# Carbonate measurement gates pH-correction feasibility; acid amendment rejected

**Date:** 2026-05-29
**Status:** accepted

Bulk-soil pH correction on the tomato bed is gated on a calcimeter /
HCl-effervescence reading of free carbonate. The pH 7.28 came from a
6.09 → 7.28 jump after calcitic-lime (CaCO₃) ORGANIMIX compost — the
free-carbonate signature — but the pool is unmeasured. Oxidised
sulphur's acid titrates carbonate before net pH moves, so no sulphur
total is trustworthy until the calcimeter % picks the dose-table row
(`derivation.md`). Concrete sonotubes leach Ca/alkalinity indefinitely,
so any programme is a holding loop, not a one-shot finish line.

Dose rule: **S = 0.32 kg per kg CaCO₃** (S:CaCO₃ mass ratio 32:100).

## Considered

| Option | Result |
|---|---|
| **Acid soil amendment (sulphuric)** | **Rejected.** ~375–1 500 kg of concentrated H₂SO₄ for our likely carbonate load; CAN/CGSB-32.311 permissibility of sulphuric acid is *unresolved* in the farm baseline; every mole that hits carbonate becomes CaSO₄ (gypsum) → trades a pH problem for a CE/salinity one. Confirmed unworkable with a second agent. |
| **Fast bulk pH recovery** | **Rejected.** No fast lever survives the carbonate sink + structural Ca re-supply; speed only buys overshoot risk (acid microzones, root/microbe kill). |
| **Citric acid in fertigation** | Kept as a *separate* lever — micronutrient (Fe/Mn/Zn) chelation in the wetted root zone, transient, cert-allowed. Not a bulk-pH correction and not for phosphorus (P-lockout overstated here). Belongs in a fertigation derivation if specced. |
| **Fertigate elemental sulphur (drip)** | **Rejected.** S⁰ is water-insoluble — a suspension, not a solution. It settles in the tank and clogs filters/emitters; even 9 µm micronized drops out. And it offers no speed gain: acidification is microbial-oxidation-gated regardless of placement. Fertigation acidifies via a dissolved acid (citric = weak/transient; sulphuric = cert-unresolved), not via S⁰. Elemental S stays a soil-applied (surface-band/tilled) amendment. |
| **Elemental sulphur, calcimeter-gated** | **Picked.** Slow microbial-oxidation trim, dosed off a measured carbonate %, two-tier per-pass cap (below), apply-and-retest. Below ~0.1% carbonate it's a real lever; 0.5%+ it's impractical → manage *around* high pH instead. |

## Per-pass cap revised — two tiers (2026-05-29)

Original "2 kg/100 m²" was a turf-surface number mislabeled "per bed" against the 382.9 m² **whole block**. Corrected: cap is per-unit-area; **bed = 54.7 m², block = 7 × 54.7 = 382.9 m²**. Guillaume's call — aim the high end of each tier to move faster:

- **Tilled-in (bare bed):** ~9.8 kg/100 m² → **~5.4 kg/bed/pass** (veg-garden incorporated ceiling; acid diluted through tilled 15–20 cm).
- **Standing crop (tomatoes in ground):** ~4.5 kg/100 m² → **~2.5 kg/bed/pass** (established-planting ceiling; surface/band only, acid-microzone risk near live roots).

Both cert 3 (extension literature, not tomato-specific). Sources: UMaine Extension, OSU Ohioline, Agvise, Purdue.

## Cadence — oxidation-gated (2026-05-29)

Monthly passes feasible **only with micronized powder (~200 mesh)** — oxidises mostly in first ~28 days at 20–30 °C in warm/moist/aerated greenhouse soil (cert 4). Prilled/pelletized takes months–years → accumulates unoxidised then crashes pH. While free carbonate remains, acid is buffered → monthly is overshoot-safe; near carbonate exhaustion switch to ≥8-week retest-gated. Monthly shrinks calendar time (~1 yr vs ~3 yr at 0.5%+), not total sulphur/passes.

## Annual cap is monitorable, not a hard ceiling — monthly validated (2026-05-29)

Deep research (sources: MSU, Agvise, Ohioline, Mosaic/OkState, Springer micronized-S kinetics, FAO salt tolerance). Resolves the challenger's "annual cap misread" FATAL.

- **Why the "≤400 lb/acre/yr" cap exists:** primarily a microbial-oxidation *throughput* limit + an anaerobic-H₂S safety margin. pH-independent in origin; a conservative default for growers who don't measure. NOT a pH-overshoot or sulphate-toxicity ceiling.
- **Monthly is defensible (cert 3), arguably better than one annual slug**, because warm-soil micronized oxidation (half-life ~6–10 d at 20 °C) reaches steady state — a monthly dose is mostly consumed before the next, no runaway stacking if aerobic.
- **Gypsum salinity self-limits (cert 4):** CaSO₄ mass = S × 4.25; solubility ~2.4 g/L caps dissolved gypsum at ~8 kg/bed → excess precipitates inert + leaches; soil-solution EC self-caps ~2.0–2.2 dS/m. Salt buildup largely a red herring on irrigated calcareous soil.
- **Replace cap with guardrails:** ECe ≤ 2.5 dS/m (≈1.0–1.2 on 1:2); pH retest q4wk, stop 6.5 / floor 6.2; never dose waterlogged bed. Dose ~1.5–2.0 → up to 2.5 kg/bed/month after a verification cycle.
- **Sonotube re-supply dropped from scope** — Guillaume: those beds excluded; focus on sonotube-free beds.
- **Still the real gate:** measure CCE/free-lime first. High carbonate → S buys rhizosphere acidification + micronutrient availability, not durable bulk-pH drop (Agvise: pH-8 soil needing ~16 000 lb/acre got 10 000 → rebounded).

## Citric feed-water lever closed; water test corroborates soil-only carbonate (2026-05-31)

Source-water analysis on file (`nutrition/doc/analyse d'eau.pdf`,
Berger 596618, "eau serre 9 avril 2026") resolves the citric /
feed-water-acid question:

- **Alcalinité 24.68 ppm CaCO₃** (norm 0–50; ≈0.49 meq/L) — low.
  Threshold to bother acidifying irrigation water is ~100–120 ppm;
  we're at 25. **No feed-water bicarbonate to knock down.**
- **Source pH 6.26** — water is already mildly acidic. Acidifying
  it further has no target. **CE 0.10** — clean.
- Citric as a feed-water acidifier is therefore **not worth it**;
  the rhizosphere-chelation use also fails (micros aren't the
  deficiency — Mn already over-supply; soil re-buffers the dip in
  minutes, duty cycle ~5–7 % of day at 5 irrigations). cert 4.

**Corroboration:** mildly acidic water (pH 6.26) entering 5×/day
while soil still reads 7.4 means a **large soil carbonate buffer**
swallows it each pass → high pH is soil-carbonate-sourced, not
feed-water. Strengthens the carbonate-sink thesis above. The water
is NOT the lever; bulk-pH drawdown via sulphur stays the only
durable correction.

## Cert

Elemental sulphur — allowed (CAN/CGSB-32.311), named product + certificate still to be sourced/filed.
Sulphuric acid — **unknown/unresolved**, treat as not-cleared.
Citric acid — allowed.
Calcitic lime (CaCO₃) — allowed, and is what caused this.

## Consequence

The subproject's first spec entries are blocked on two inputs: the
calcimeter free-carbonate reading and the PO soil-root-zone target pH
band. Cross-ref: `nutrition/soil-contribution` (soil bank data),
`nutrition/tomato/spec — soil-root-zone-ph-band` (target band gap, not yet written).
