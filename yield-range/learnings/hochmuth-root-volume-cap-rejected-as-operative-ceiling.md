# Hochmuth root-volume cap rejected as the operative ceiling

Original design (b377b60, 2026-05-09) used `cellVol × 1.6` as the
biomass ceiling (Hochmuth root-volume rule of thumb): 50-cell ~33 mL
cell volume × 1.6 = 52.8 g cap. At packed densities this is the wrong
binding constraint — the canopy closes (per-plant DLI drops to the
0.40 floor) long before roots fill the cell. The 2026 spring cohort
hit observed peak 16 g/plant at d28 (heat-stressed; predicted best
case ~25 g) — far from the root-cap value.

Replaced (canopy-cap-is-ceiling) with `canopyCapG`, a density-driven biomass
asymptote derived from Salanova breeder data. Root cap retained in
the design conversation only as a counterfactual upper bound on what
the cell could theoretically support — not used in the integration.
