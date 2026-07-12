# Surfactant impact on burn cap — rejected

## Surfactant impact on burn cap — rejected (2026-05-12)

`burnCapG(el, _surfactant) = BURN_CAP_BASE_G[el]` regardless of surfactant flag. `_surfactant` parameter kept for caller-side API symmetry with the coverage-axis lever, ignored by body.

**Research basis** (2026-05-10 web pass — Sentís et al. 2017; vendor + extension literature on yucca; Cornell / U. Delaware / U. Missouri):
- Surfactant raises COVERAGE / cuticle penetration substantially (organosilicone bumps Mn penetration 3 → 20 % per Sentís). Already modeled via `FOLIAR_COVERAGE_DEFAULT 0.30 → FOLIAR_COVERAGE_WITH_YUCCA 0.80`.
- Surfactant impact on BURN CAP axis NOT well-supported. Yucca is a wetting agent, not a penetration enhancer. Vendor lit describes yucca as "non-phytotoxic" but flags that longer wet-film under intense sun CONCENTRATES residue during evaporation — burn-risk amplifier, not relaxer.
- Décembre sun-only on tomato; longer-wet-film effect argues against burn-cap relaxation.
- Standard extension foliar guidance gives same per-element concentration bands (0.1-0.3 % MnSO₄, 0.05-0.1 % CuSO₄, …) regardless of surfactant.

## Refinement trigger

Reintroduce surfactant multiplier (or per-element override) only when Décembre accumulates direct tissue + lesion evidence over multiple spray cycles that yucca-bearing tank tolerates higher per-element concentrations than no-yucca. Until then, burn cap is single-axis.
