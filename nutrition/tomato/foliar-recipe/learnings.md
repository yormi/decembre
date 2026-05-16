# Tomate — foliar-recipe · learnings

Rejected alternatives and historical decisions that no longer support a live REQ but must survive for organic-cert audit + future re-evaluation. Live REQ trace in `derivation.md`.

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
