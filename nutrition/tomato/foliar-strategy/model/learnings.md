# Tomate — foliar-strategy · learnings

Rejected alternatives and historical decisions that no longer support a live REQ but must survive for organic-cert audit + future re-evaluation. Live REQ trace in `derivation.md`.

---

## Yucca return as a refinement trigger — dropped (2026-05-17)

**Rejected claim:** spec + derivation carried a "Yucca decision flips" refinement trigger asserting that if yucca returns to the program, `FOLIAR_COVERAGE_DEFAULT` flips `0.30 → 0.80` AND the per-element doses go back up to pre-2026-05-05 values (Cu 2 → 4 g, Mn 18 → 22 g, Zn 16 → 22 g). Two problems compounded:

1. **Dose-restoration claim contradicted by burn-cap reasoning.** The same subproject's burn-cap research (vendor + extension literature) flags yucca's wet-film property under sun as a residue-concentrating burn-risk *amplifier*, not a relaxer. Raising coverage from 0.30 → 0.80 increases effective leaf delivery ~2.7× by itself; coupling that with a dose increase compounds the burn risk that motivated the surfactant-multiplier rejection (see § "Surfactant impact on burn cap"). The "doses go back up" half of the trigger never had a defensible empirical basis.

2. **Fabricated historical anchor.** The trigger's framing leaned on a parallel claim that Mn 22 → 18 g and Zn 22 → 16 g were cut at the 2026-05-05 yucca drop. That cut never landed — STORED foliaire has carried 22 / 22 g for both since the 2026-04-29 45 L → 15 L volume restructure (verified against RECIPE_HISTORY, which records only the Cu 4 → 2 g retirement; no Mn / Zn entries exist). Whatever the trigger "restored" was already in place.

**Decision (2026-05-17):** drop the entire "yucca returns" refinement trigger. Yucca is not on order and is not tracked as a return path. If coverage ever flips back to a surfactant-assisted regime, that's a separate model-side decision and rebalancing call — not a back-fill of fabricated historical doses. Burn caps re-pinned to live STORED 22 / 22 at cert 2 (see `derivation.md` § "Mn / Zn certainty exception"). No PA Taillon ask attached (per P-08 — move forward, don't wait on external acks).

**Re-litigate when:** never, on this framing. A future surfactant-on regime would land via fresh observation + tissue data, not via this trigger.

---

## Mn / Zn burn caps held at extension mid-band 18 / 16 (pre-2026-05-17)

**Rejected state:** `BURN_CAP_BASE_G.Mn = 18` and `.Zn = 16`, cert 3 with rationale "Extension mid-band of Sonneveld 2009 + Yara + Cornell / U. Delaware / U. Missouri extension publications." Caps lived in the model layer while STORED foliaire ran 22 / 22 in the field since the 2026-04-29 restructure.

**Why retired:** the caps were tighter than empirical reality. STORED has run 22 g for both Mn and Zn continuously since 2026-04-29 with no burn observed under Wednesday-AM operator timing — that's a Décembre-internal observation period of multiple weeks across the active production window. Block 7/8 fires a drift signal (cap-vs-STORED) whose meaning was "the cap is decorative" rather than actionable. The Cu cert-2 carve-out from 2026-05-16 (Cu diverges *below* extension by Décembre-internal observation) is the parallel; Mn and Zn diverge *above* extension by the same evidence class. Caps raised to 22 / 22 with cert 2 transferability (non-portable to ops at different timing / volume / soil regimes).

**Re-litigate when:** any operator-timing-window shift (afternoon spray, post-irrigation high-leaf-moisture), tank-volume restructure (return to 45 L or other), or tissue panel surfaces Mn / Zn over-luxury signals (>120 ppm DW Sonneveld guideline) or leaf-tip phytotoxicity. Cap drops back to extension mid-band 18 / 16 on any of those triggers; the historical state is preserved here for the audit.

---

## Sentís 3 % cuticle penetration vs 30 % coverage — analysis raised, value held (2026-05-14)

**Discrepancy:** Sentís et al. *Crop Protection* 2017 — tomato cuticle Mn penetration ~3 % without surfactant. `FOLIAR_COVERAGE_DEFAULT = 0.30` (cert 3 per 2026-05-12 B2 downgrade). Order of magnitude apart. If Sentís is rate-limiter, retention × runoff geometry is irrelevant — plant-side uptake caps at ~3 % of label dose. Under that regime: Zn 136 % → ~14 % of demand, Mn ~72 % → ~7 %, Cu ~25 % → ~2.5 %. Channel collapses for Mn/Zn/Cu → insurance-only.

**Decision:** held 0.30 cert 3. Declared downward-trigger in `derivation.md` refinement-triggers (paired with upward-trigger per P-03 cert-downgrade asymmetry). Uncertainty band stays out of operator-facing surfaces (per [[feedback_no_unspecced_narrative.md]]).

**Reasons for the hold:**
1. **Single-cultivar single-study.** Sentís 2017 is one paper on one cultivar — informative, not pre-emptively dispositive against the broader 25-40 % literature mid-band.
2. **No Décembre measurement disconfirms 0.30.** The 2026-05-12 downgrade was about evidence base, not a measurement landing outside the mid-band. Without local tissue data, the prior wins.
3. **Asymmetric cost.** If 0.30 right and we move to 0.03 on Sentís alone → team believes foliar is useless for Mn/Zn/Cu while it's delivering ~near-target → unnecessary fertigation ramp under high pH where sulfate-metal channels are blocked. If 0.30 wrong by 10× and we hold → tissue panel surfaces it (Mn at ~7 % of demand in petiole instead of ~72 %), we move with data.
4. **Reversibility.** Downward refit to 0.03 is mechanical once data lands. Cost of holding = one panel cycle.

**Re-litigate when:** measured petiole Mn from 2026-05-11 sample lands. Downward-trigger names ±0.10 ratio threshold; panel below that gate → hold is wrong, value moves. Within ±20 % of prediction → hold vindicated, cert 3 → 4.

---

## Surfactant impact on burn cap — rejected (2026-05-12)

`burnCapG(el, _surfactant) = BURN_CAP_BASE_G[el]` regardless of surfactant flag. `_surfactant` parameter kept for caller-side API symmetry with the coverage-axis lever, ignored by body.

**Research basis** (2026-05-10 web pass — Sentís et al. 2017; vendor + extension literature on yucca; Cornell / U. Delaware / U. Missouri):
- Surfactant raises COVERAGE / cuticle penetration substantially (organosilicone bumps Mn penetration 3 → 20 % per Sentís). Already modeled via `FOLIAR_COVERAGE_DEFAULT 0.30 → FOLIAR_COVERAGE_WITH_YUCCA 0.80`.
- Surfactant impact on BURN CAP axis NOT well-supported. Yucca is a wetting agent, not a penetration enhancer. Vendor lit describes yucca as "non-phytotoxic" but flags that longer wet-film under intense sun CONCENTRATES residue during evaporation — burn-risk amplifier, not relaxer.
- Décembre sun-only on tomato; longer-wet-film effect argues against burn-cap relaxation.
- Standard extension foliar guidance gives same per-element concentration bands (0.1-0.3 % MnSO₄, 0.05-0.1 % CuSO₄, …) regardless of surfactant.

## Earlier surfactant-multiplier table — retired 2026-05-10

`SURFACTANT_SPREAD_FACTOR = 1.5` with per-element overrides (`Cu 1.2×`, `B 1.0×`) retired 2026-05-10. Per-element ratios were operator-mid-band heuristics, no published basis (cert 2 at best).

## `BURN_CAP_SURFACTANT_FACTOR` inert constant — retired 2026-05-12

Brief intermediate state (2026-05-10 → 2026-05-12): replaced the multiplier table with `BURN_CAP_SURFACTANT_FACTOR = 1.0` as a "single operator-tunable knob" reserved for future bump. Retired 2026-05-12 — constant pinned at 1.0 is inert; surface area (constant + composer + namespace + 3 docs) signalled "this is a real knob" which it wasn't. Collapsed to direct `BURN_CAP_BASE_G[el]` return; deferred-bump TODO lives directly on `BURN_CAP_BASE_G` in `data.js`.

## Refinement trigger

Reintroduce surfactant multiplier (or per-element override) only when Décembre accumulates direct tissue + lesion evidence over multiple spray cycles that yucca-bearing tank tolerates higher per-element concentrations than no-yucca. Until then, burn cap is single-axis.
