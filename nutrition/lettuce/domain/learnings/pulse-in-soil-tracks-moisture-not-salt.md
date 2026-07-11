# In-soil Pulse EC tracks soil moisture, not salt — can't be offset to the 1:1 slurry

2026-06-13: Paired six beds two ways — Bluelab Pulse in a 1:1 soil:water slurry vs the Pulse stuck directly in the bed. The two **do not reconcile**; across the six beds they ~anti-correlate (Pearson r ≈ −0.36). The bed with the most salt by slurry (A, 3.56) read near-low in-soil (1.33); the lowest-slurry bed (C, 2.07) read high in-soil (1.73). Source grid: `../doc/bed-grid-2026-06-13/`.

**Why.** The in-soil reading is a *bulk* EC across water + air + particles, dominated by how wet the soil was at probe time. Wetter spot → more continuous conductive path → higher number at the *same* salt; drier → lower. The 1:1 slurry fixes the water added, so it isolates salt. Guillaume didn't know the moisture at reading time — that unknown **is** the confound the in-soil number is secretly tracking, not a side issue.

**Consequence for the bands.** This kills the simple "take paired Pulse + 1:1 readings, derive a constant offset" action in `setpoint-band-provenance.md` and `prefer-true-root-zone-bands.md` (bed rows "method-tagged until paired offsets exist"). No constant offset exists while moisture floats — the offset moves with VWC. So:

- Trust the **1:1 slurry** as the salinity measure. The earlier pore-water estimate (slurry × ~3–5, root zone saline ~6–14 mS/cm) stands; the in-soil run does not overturn it.

- The in-soil Pulse is only meaningful for **trend at a fixed moisture**. To use it: irrigate the spot to container capacity, let it drain to the same state every time, *then* read. Pairing Pulse-at-container-capacity with a 1:1 slurry on a few beds can build a *local* multiplier — a single random-moisture pairing cannot.

**First-principles dilution note (for the slurry→pore-water step).** `EC_porewater = EC_slurry × (1 + 1/θ)`, θ = volumetric water content of the soil as scooped into the 1:1. θ ≈ 0.5 → ×3, 0.33 → ×4, 0.25 → ×5. θ is the one missing input; with it the ×4 mid-guess becomes a single number.
