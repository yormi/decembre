# Soil-contribution — learnings

Rejected alternatives and historical decisions that no longer support a
live REQ but must survive for organic-cert audit + future re-evaluation.
Live REQ trace in `derivation.md`.

---

## Path 1 — Subtract bank K + Mg from the fertigation sizer (rejected 2026-05-17)

**Rejected approach:** extend `computeStageRecipe` in
`nutrition/tomato/fertigation-recipe/calc.js` to subtract bank-K and
bank-Mg mass-flow delivery from the fertigation-output demand. Concrete
shape:

```
demand_K_net = max(0, demand_K - compost_K - sidedress_K - SME_K × transpiration)
demand_Mg_net = max(0, demand_Mg - compost_Mg - sidedress_Mg - SME_Mg × transpiration)
```

with `SME_K`, `SME_Mg`, `TRANSPIRATION_L_PER_M2_PER_WEEK[crop]` pulled
from `window.SoilContribution`. Operator-visible effect: FP K target at
T5 would drop from ~4 953 g to ~880 g; FP Mg target would drop from
~1 963 g to ~120 g (once REQ-155 uptake factors still apply); Block 7/8
drift gauge would flip from STORED-under-FP to STORED-over-FP for K + Mg.

**Decision (2026-05-17):** rejected. Adopted "path 2" — keep
`computeStageRecipe` as-is, declare the architectural choice in REQ-141
+ derivation explicitly: fertigation sizing covers the active-channels
delivery share (compost + sidedress + fertigation), the soil bank's
K + Mg mass-flow contribution is operator-side headroom outside the
sizer's scope. Guillaume direct ruling — STORED is operator lane per
P-13; the model's job is to describe the active-channel target without
pressuring STORED via FP target shifts.

**Reasons for the path 2 choice:**

1. **STORED-pressure axis.** Path 1 would crater the FP K + Mg target,
   surfacing a STORED-over-FP drift signal whose only operator action
   would be "consider reducing K₂SO₄ / MgSO₄ via /retire-recipe." Per
   P-13 the model side stops pressuring STORED via FP shifts; path 2
   keeps the model honest about its scope (active channels) without
   weaponising the bank against STORED.
2. **Bank-as-headroom is real.** The K bank delivers ~4 385 mg/m²/wk
   via mass-flow at current SME × transpiration. That delivery is
   really happening at the root surface and explains why the team
   operates fine when fertigation output runs below the REQ-013 0.9×
   floor on K. Documenting that headroom explicitly (in REQ-141 +
   derivation) is more honest than implementing a sizer subtraction
   that doubles the same fact.
3. **Antagonism risk in Path 1.** If the sizer subtracts bank K from
   demand, the fertigation output drops; under continued bank-K
   delivery the plant gets total K equal to demand. But: K × Ca and
   K × Mg root-uptake antagonism on the Ca-saturated bed argue for
   *deliberate* over-supply on K via fertigation (the team's current
   approach), not for matching demand exactly. Path 1 would push
   active K too low and amplify the Ca-driven K-uptake suppression.
4. **Sole-source argument doesn't apply.** Unlike P (where soil-bank
   routing is necessary because no active channel covers P at pH 7.4
   lockout) or Ca (no active Ca channel, bank is the only source), K
   and Mg have viable fertigation channels with reliable delivery.
   Forcing bank-attribution into the sizer would be solving a problem
   that the gap chain already solves at the recipe level.

**Re-litigate when:** (a) pH drops below 6.5 and Mehlich-3 K + Mg climb
out of the antagonism regime — the over-supply rationale weakens and
sizing against true demand becomes the right shape; (b) tissue K + Mg
panels confirm chronic luxury accumulation — Block 7/8 drift gauge fired
the right way for the wrong reason and the model needs to catch up;
(c) a soil-bank trajectory model lands that estimates bank refill from
compost amendments — at that point the "bank-as-headroom" framing gains
a closed loop and the sizer can credit a fraction without runaway.
