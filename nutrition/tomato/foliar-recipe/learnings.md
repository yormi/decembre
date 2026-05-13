# Tomate — foliar-recipe · learnings

Rejected alternatives and historical decisions that no longer support a
live REQ but must survive for organic-cert audit + future re-evaluation
when new data lands. Live REQ-tied trace lives in `derivation.md`.

---

## Surfactant impact on burn cap — rejected

**Decision (2026-05-12):** Surfactant has no effect on the burn-cap axis.
`burnCapG(el, _surfactant) = BURN_CAP_BASE_G[el]` regardless of the
surfactant flag. The `_surfactant` parameter is kept in the signature
for caller-side API symmetry with the coverage-axis lever, but is
ignored by the function body.

**Why:**

Research basis (2026-05-10 web pass — Sentís et al. *Crop Protection*
2017; vendor + extension literature on yucca; Cornell / U. Delaware /
U. Missouri foliar guidance):

- Surfactant raises COVERAGE / cuticle penetration substantially:
  organosilicone on tomato cuticle bumps Mn penetration 3 → 20 %
  (Sentís et al. 2017). Already in model via `FOLIAR_COVERAGE_DEFAULT
  0.30 → FOLIAR_COVERAGE_WITH_YUCCA 0.80`.
- Surfactant impact on the BURN CAP axis (max safe tank concentration)
  is NOT well-supported by published data. Yucca specifically is a
  wetting agent, not a penetration enhancer. Vendor + extension
  literature describes yucca as "non-phytotoxic" but flags that the
  longer wet-film property under intense sun can CONCENTRATE residue
  during evaporation — actively a burn-risk amplifier, not a relaxer.
- Décembre is sun-only on tomato; the longer-wet-film effect under
  direct sun argues against any burn-cap relaxation.
- Standard extension foliar guidance gives the same per-element
  concentration bands (0.1–0.3 % MnSO₄, 0.05–0.1 % CuSO₄, etc.)
  regardless of surfactant. Surfactant is treated as a coverage tool,
  not a tank-concentration tool.

## Earlier surfactant-multiplier table — retired 2026-05-10

`SURFACTANT_SPREAD_FACTOR = 1.5` with per-element overrides (`Cu 1.2×`,
`B 1.0×`) was retired 2026-05-10. The per-element ratios were
operator-mid-band heuristics with no published basis (cert 2 at best).

## `BURN_CAP_SURFACTANT_FACTOR` inert constant — retired 2026-05-12

Brief intermediate state (2026-05-10 → 2026-05-12): replaced the
multiplier table with a single `BURN_CAP_SURFACTANT_FACTOR = 1.0`
constant, framed as a "single operator-tunable knob" reserved for
future bump if tissue + lesion data lands. Retired 2026-05-12 — a
constant pinned at 1.0 is inert; surface area (constant + composer
function + namespace exposure + 3 docs) signalled "this is a real knob"
which it wasn't. Collapsed to direct return of `BURN_CAP_BASE_G[el]`;
the deferred-bump TODO now lives directly on `BURN_CAP_BASE_G` in
`data.js`.

## Refinement trigger

Reintroduce a surfactant multiplier (or per-element override) only when
Décembre accumulates direct tissue + lesion evidence over multiple
spray cycles that a yucca-bearing tank tolerates higher per-element
concentrations than the no-yucca tank. Until then, the burn cap is
single-axis.
