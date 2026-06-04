# Tomato soil-root-zone pH target band — defined (specialist-owned, not a PO contract)

**Date:** 2026-05-31 (band lowered 6.4–6.8 → 6.0–6.5 same day, Guillaume — we control the foliar Mn source)
**Status:** decided — this is the correction endpoint the sulphur programme drives toward.

## Ownership

The target band is a **model decision, owned by the specialist** — not
a product-owner contract. Earlier framing (`soil-ph/model/spec.md`,
`nutrition/tomato/spec.md` specialist note) treated it as an unspecced
PO gap and recommended the PO write a `soil-root-zone-ph-band` entry.
Reversed 2026-05-31 (Guillaume): the agronomic endpoint of a soil
correction is a derivation call, the specialist's to make. The PO sets
*plant-facing* contracts (tissue bands, recipe guards); where the soil
pH should land to free those is the model's job.

## The band — Mehlich-3 water pH (the soil-bed scale the correction anchors on)

| Bound | Value | Set by |
|---|---|---|
| Acceptable steady-state band | **6.0 – 6.5** | P-unlock ↔ uncontrollable-Mn/Al floor |
| Aim-point — stop dosing here | **6.3** | deep P unlock, comfortable Mn margin |
| Hard floor — stop immediately | **5.8** | Mn/Zn/Al toxicity edge |

SME root-zone secondary equivalent ≈ 5.7–6.2 (~0.3 unit below
Mehlich-3 water; never mix the two scales in one calculation).

**Conditions that earn this band (vs the more conservative 6.4–6.8
first draft):** zero foliar Mn during the drawdown + make tissue Mn the
explicit stop-dose trigger on the next panel. See *The Mn lever is
partly ours* below.

## Why these bounds (cert 3)

- **Upper 6.5** — already well inside the Ca-phosphate-release window
  (Mehlich-3 total 557 kg/ha vs SME available 1.1 ppm); above it P
  unlock thins. This is "minimum acceptable progress."
- **Aim 6.3** — squarely in the peak soil-P availability window for
  calcareous mineral soil, with a comfortable margin above the steep
  Mn/Al zone. Dose-stop target so the buffered-soil lag doesn't
  overshoot.
- **Lower 6.0 / hard floor 5.8** — at 6.0 P-availability gains flatten
  and soil Mn²⁺/Zn²⁺/Al³⁺ mobilisation steepens; below 5.8 they leave
  the watch range for toxicity. This floor is set by the *soil* acidity
  response, which dosing can't undo — unlike the foliar Mn source.
  See `acidification-mobilises-mn-tension-with-high-tissue`.

## The Mn lever is partly ours — why the floor moved 6.4 → 5.8

The first draft floored at 6.4 because tissue Mn was already over-supply
(T5 panel) and acidification raises soil Mn²⁺ (~100×/2 pH units). But
that tissue Mn is **partly our own foliar Mn programme** — a controllable
input we're already trimming (22→18) and can zero. Total tissue Mn =
soil uptake + foliar. Remove the foliar half and the soil-Mn rise from
a deeper pH has real headroom before tissue Mn hits toxicity. So the
band can go lower **conditioned on** cutting foliar Mn, with tissue Mn
as the stop-dose gauge. The residual floor (5.8) is the part we can't
dose away: soil Mn/Zn/Al mobilisation is a pure pH effect.

## Why 6.0–6.5 (0.5 wide), not the tighter 6.0–6.4

We steer this high-CEC, carbonate-buffered soil coarsely — monthly dose
+ pH probe, no fine control. A target band must be **wider than our
landing precision** to be hittable; a 0.4-unit band we'd miss in both
directions. 0.5 unit is the practical minimum.

## Rejected — pushing below 6.0 for "max P"

Marginal: P-availability gains flatten below 6.0 while the
*uncontrollable* soil Mn/Zn/Al mobilisation steepens. The AMF bridge
(`../../../strategy/sg1-free-p.md`) delivers the remaining P by direct
uptake, so the pH lever needn't extract every last bit.

## Practical note — undershoot is the real risk, not overshoot

The bed is high-CEC buffered and the concrete sonotubes leach Ca/
alkalinity continuously, so pH resists moving down and rebounds up.
Expect steady-state to drift toward the upper half of the band (6.5–6.8)
between doses; landing anywhere in 6.4–6.8 is a win. The floor 6.2 is a
safety stop, not a place we expect to reach on a standing crop.

## Cert + refinement

cert 3 — extension P/micro availability curves for calcareous mineral
soils, not Décembre-tissue-calibrated. Raise to 4 with: a Mn
soil-availability reading at the post-correction pH (sets an explicit
tissue-Mn stop-dose trigger), or a Décembre P-vs-pH response once
dosing starts moving the probe.
