# Accept the ~±20% soil-moisture error in bed EC; don't control it

2026-06-14. The 1:1-by-weight slurry reads ~±20% with how wet the field soil is (reading ∝ 1/(1+2w)). We chose to **accept** it rather than control it. Rejected: **drying** the soil (removes it, but too slow / not operator-actionable), **fixed-volume** sampling (stabilizes the dry-soil/salt term but adds 10–20% packing error and is less reproducible operator-to-operator), and **timing sampling vs irrigation** (not actionable with automated fertigation).

Rationale: ±20% is **smaller than the chain's other uncertainties** — the ×4 slurry→pore-water factor and the −100/−200 kPa scorch band — so removing it changes no decision. Operators instead just run **all beds in one session**, so the residual is a common offset → bed-to-bed comparison and trend stay valid. Builds on [[adopt-1to1-by-weight-ec-method]].
