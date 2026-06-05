# Mode-aware mixing factor — retired

## Mode-aware mixing factor — retired 2026-05-10

`MIXING_FACTOR_FERT` (split `_STORED = 0.5` / `_FP = 1.0`) introduced 2026-05-05 on the premise that ~50 % of stored-mode fertigation re-enters the SME pool and would double-count if summed on top of `supply.soil`. Retired 2026-05-10 — fertigation supply reports full barrel mass; SME is a separate channel in the supply readout so users compare rather than blend. The 0.5 was cert 2-3, no measured anchor at Décembre. Spec entry deleted; constants removed from `data.js` and `window.FertigationRecipeTomato`. Number not reused per project policy.
