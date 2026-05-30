# Yucca return as a refinement trigger — dropped

## Yucca return as a refinement trigger — dropped (2026-05-17)

**Rejected claim:** spec + derivation carried a "Yucca decision flips" refinement trigger asserting that if yucca returns to the program, `FOLIAR_COVERAGE_DEFAULT` flips `0.30 → 0.80` AND the per-element doses go back up to pre-2026-05-05 values (Cu 2 → 4 g, Mn 18 → 22 g, Zn 16 → 22 g). Two problems compounded:

1. **Dose-restoration claim contradicted by burn-cap reasoning.** The same subproject's burn-cap research (vendor + extension literature) flags yucca's wet-film property under sun as a residue-concentrating burn-risk *amplifier*, not a relaxer. Raising coverage from 0.30 → 0.80 increases effective leaf delivery ~2.7× by itself; coupling that with a dose increase compounds the burn risk that motivated the surfactant-multiplier rejection (see § "Surfactant impact on burn cap"). The "doses go back up" half of the trigger never had a defensible empirical basis.

2. **Fabricated historical anchor.** The trigger's framing leaned on a parallel claim that Mn 22 → 18 g and Zn 22 → 16 g were cut at the 2026-05-05 yucca drop. That cut never landed — STORED foliaire has carried 22 / 22 g for both since the 2026-04-29 45 L → 15 L volume restructure (verified against RECIPE_HISTORY, which records only the Cu 4 → 2 g retirement; no Mn / Zn entries exist). Whatever the trigger "restored" was already in place.

**Decision (2026-05-17):** drop the entire "yucca returns" refinement trigger. Yucca is not on order and is not tracked as a return path. If coverage ever flips back to a surfactant-assisted regime, that's a separate model-side decision and rebalancing call — not a back-fill of fabricated historical doses. Burn caps re-pinned to live STORED 22 / 22 at cert 2 (see `derivation.md` § "Mn / Zn certainty exception"). No PA Taillon ask attached (per P-08 — move forward, don't wait on external acks).

**Re-litigate when:** never, on this framing. A future surfactant-on regime would land via fresh observation + tissue data, not via this trigger.
