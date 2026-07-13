# Sentís 3 % cuticle penetration vs 30 % coverage — analysis raised, value held

## Sentís 3 % cuticle penetration vs 30 % coverage — analysis raised, value held (2026-05-14)

**Discrepancy:** Sentís et al. *Crop Protection* 2017 — tomato cuticle Mn penetration ~3 % without surfactant. `FOLIAR_COVERAGE_DEFAULT = 0.30` (cert 3 per 2026-05-12 B2 downgrade). Order of magnitude apart. If Sentís is rate-limiter, retention × runoff geometry is irrelevant — plant-side uptake caps at ~3 % of label dose. Under that regime: Zn 136 % → ~14 % of demand, Mn ~72 % → ~7 %, Cu ~25 % → ~2.5 %. Channel collapses for Mn/Zn/Cu → insurance-only.

**Decision:** held 0.30 cert 3. Declared downward-trigger in `derivation.md` refinement-triggers (paired with upward-trigger per P-03 cert-downgrade asymmetry). Uncertainty band stays out of operator-facing surfaces (per [[feedback_no_unspecced_narrative.md]]).

**Reasons for the hold:**
1. **Single-cultivar single-study.** Sentís 2017 is one paper on one cultivar — informative, not pre-emptively dispositive against the broader 25-40 % literature mid-band.
2. **No Décembre measurement disconfirms 0.30.** The 2026-05-12 downgrade was about evidence base, not a measurement landing outside the mid-band. Without local tissue data, the prior wins.
3. **Asymmetric cost.** If 0.30 right and we move to 0.03 on Sentís alone → team believes foliar is useless for Mn/Zn/Cu while it's delivering ~near-target → unnecessary fertigation ramp under high pH where sulfate-metal channels are blocked. If 0.30 wrong by 10× and we hold → tissue panel surfaces it (Mn at ~7 % of demand in petiole instead of ~72 %), we move with data.
4. **Reversibility.** Downward refit to 0.03 is mechanical once data lands. Cost of holding = one panel cycle.

**Re-litigate when:** measured petiole Mn from 2026-05-11 sample lands. Downward-trigger names ±0.10 ratio threshold; panel below that gate → hold is wrong, value moves. Within ±20 % of prediction → hold vindicated, cert 3 → 4.
