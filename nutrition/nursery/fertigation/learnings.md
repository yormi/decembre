# Nursery fertigation — learnings

Rejected alternatives and historical decisions for this subproject. Live
REQ-tied values + math live in `derivation.md`. `spec.md` is floor + ceiling.

---

## Acadie-only N path rejected (2026-05-09)

Considered dropping Ocean and meeting N from Acadie alone. At 2 % N vs
Ocean's 15 %, 1 300 mg N/tray needs Acadie 1 300 / (0.02 × 1.25) = 52 mL/tray
= 41 mL/L — 3 × current dose, far outside REQ-098 CE envelope. Math doesn't
close without Ocean. Ocean retained as primary N source on 7.5 × concentration
advantage.

---

## NURSERY_RECIPE_DEFAULT — Pareto walk (2026-05-09)

Considered alternatives along the CE budget before locking
{X=7 Ocean, Y=6 Acadie, Z=2 kelp}:

| X (Ocean) | Y (Acadie) | CE | N mg | P mg | pH |
|---|---|---|---|---|---|
| 5  | 8 |  2.50 |  1138 |  202 |  5.45 |
| 6  | 7 |  2.55 |  1300 |  186 |  5.40 |
| 6  | 6 |  2.40 |  1275 |  164 |  5.50 |
| **7** | **6** | **2.55** | **1463** | **170** | **5.25** |
| 7  | 7 |  2.75 |  1488 |  192 |  5.15 |
| 8  | 6 |  2.80 |  1650 |  176 |  5.10 |
| 9  | 5 |  3.05 (FAIL CE) | … | … | … |

X=7/Y=6 chosen as the row that clears REQ-100 (N 52 % of 2 800 target) and
REQ-101 (P 54 % of 315) with ~0.4 mS/cm CE head-room and pH centred at 5.25.
X=8 left on the table pending first in-bucket EC measurement of Ocean-containing
recipe (Ocean ecFactor refinement may open the room).

Z = 2 g/L kelp locked at current production rate (cheap K + micros baseline;
cert 4 — observed at Décembre). Not re-optimized.

---

## K / Ca / Mg under-supply accepted at default (2026-05-09)

Default delivers ~88 mg K/tray ≈ 2 % of 3 780 demand; Ca 0; Mg 0. No
REQ-K-supply spec today. Accepted on the assumption peat starter is
calcitic-limed and supplies the residual (cert 1 — investigate). Refinement
path: tissue test on 5-week trays at transplant. <2 % Ca or <0.4 % Mg → source
soluble organic Ca-Mg supplement. Production LETTUCE recipe is the
post-transplant backstop.

---

## Global PRODUCT ecFactors left unchanged (2026-05-09)

Global `PRODUCT.EZGRO-Ocean-15-1-1.ecFactor = 0.8`,
`PRODUCT.AcadiePoissonHydrolyse.ecFactor = 0.5`,
`PRODUCT.AcadieAlguesLiquides.ecFactor = 0.3` predict 7.20 mS/cm vs measured
1.9-2.6 mS/cm at Acadie 13 mL/L + kelp 2 mL/L (Bluelab pen, in-bucket,
April 2026) — 3 × overshoot. Local `NURSERY_PRODUCTS[*].ecFactor` override
applied; global table left alone (out of scope per task brief). Reconcile
when nutrition model consolidates: copy local values upstream or generalize
the calibration framework.
