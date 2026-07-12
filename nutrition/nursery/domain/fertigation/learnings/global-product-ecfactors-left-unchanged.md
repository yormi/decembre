# Global PRODUCT ecFactors left unchanged

## Global PRODUCT ecFactors left unchanged (2026-05-09)

Global `PRODUCT.EZGRO-Ocean-15-1-1.ecFactor = 0.8`,
`PRODUCT.AcadiePoissonHydrolyse.ecFactor = 0.5`,
`PRODUCT.AcadieAlguesLiquides.ecFactor = 0.3` predict 7.20 mS/cm vs measured
1.9-2.6 mS/cm at Acadie 13 mL/L + kelp 2 mL/L (Bluelab pen, in-bucket,
April 2026) — 3 × overshoot. Local `NURSERY_PRODUCTS[*].ecFactor` override
applied; global table left alone (out of scope per task brief). Reconcile
when nutrition model consolidates: copy local values upstream or generalize
the calibration framework.
