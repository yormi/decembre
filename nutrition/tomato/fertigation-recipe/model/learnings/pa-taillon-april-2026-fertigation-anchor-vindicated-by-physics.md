# PA Taillon April 2026 fertigation anchor — vindicated by physics

## PA Taillon April 2026 fertigation anchor — vindicated by physics (history preserved 2026-05-15)

> **Reframe note (2026-05-15):** Originally written 2026-05-14 to capture the anchor as "retired legacy" under the 2026-05-12 mass-balance-derivation amendment that dropped compost-subtraction. That amendment was reverted 2026-05-15 (B1-REV); anchor is now recovered by the mass-balance derivation itself. Block kept for audit-trail completeness; framing flipped: the anchor wasn't deference, it was the right physics.

T5 fertigation anchor recommended by PA Taillon (agronomist), April 2026:

| Product       | Anchor dose | Mass-balance derivation                                       | Cert |
|---------------|-------------|---------------------------------------------------------------|------|
| K₂SO₄         | 5 167 g     | T5 — offtake 6 000 − compost 400 = 5 600 mg/m²/wk → 5 167 g (sidedress credit was zero at anchor time; current code subtracts ~234 mg/m²/wk, output 4 953 g). | 3 |
| MgSO₄·7H₂O    | 1 379 g     | T5 — offtake 855 − compost 500 = 355 mg/m²/wk → 1 379 g. Current code: 1 378 g (1-g rounding). | 3 |
| Solubore      | 9 g         | Single-channel B at T5 (unchanged — still live in `data.js`). | 3 |

**Why the match isn't coincidence:** agronomist's recommendation came from the same mass-balance principle the model uses; once demand + compost-release flow through `max(0, demand − compost − sidedress)`, model output equals recommendation. 2026-05-12 amendment broke the match (141 % Mg gap); reversal restored it.

**Audit-trail intent:** preserved for organic-cert (FP target in service since April 2026 at this anchor, brief excursion to 3 319 g Mg on 2026-05-14 — both states reproducible from model history) and for re-evaluation if inputs shift materially.

**STORED was never on this anchor (audit-trail repair 2026-05-16).** The anchor describes the FP target only. `STORED_RECIPE.tomato.fertigation.T5.kSulfate` has been Haifa-heritage 3 489 g since the 2026-05-09 commit (`11cccfc`) and never moved to PA Taillon's 5 167 g. `git log --all -S "kSulfate: 5167"` returns zero hits on STORED. `RECIPE_HISTORY` carries the same 3 489 as the "retired 2026-05-07 Haifa-anchored values × multipliers" snapshot — Haifa was retired from the FP target (TOMATO_STAGES → `computeStageRecipe`) but left intact in STORED. The STORED-vs-FP K drift at peak production (3 489 stored vs ~5 568 FP after B2-REV uptake-factor inflation) is genuine, not a documentation artefact. Operator-facing prose elsewhere that says "STORED is locked at PA Taillon's recommendation" is misleading and needs correction (filed for coder lane — operator-display surfaces).
