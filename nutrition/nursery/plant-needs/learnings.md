# Semis laitue — plant-needs · learnings

Rejected alternatives and deferred refinements. Live rationale lives in
`derivation.md`; this file is the graveyard.

---

## Within-cycle stage stratification (T1 vs T2) — deferred

Real seedlings pull more K and Ca during T2 (true-leaf expansion) than
T1 (cotyledon emergence). Model averages the cycle flat. Acceptable at
weekly cadence for supply balance; revisit if a stage-specific
deficiency surfaces. Reintroduce as `BIOMASS_DEMAND`-style
stratification when tissue tests at d10 vs d28 separate.

## Seed mass contribution — treated as 0

Salanova seed ≈ 1 mg vs 90 g target → invisible. Not modelled.

## Root vs shoot separation — out of scope for nursery

Operational unit is "plug ready to transplant"; single-tissue model
suffices. Mature lettuce model splits root/shoot to capture
leaf-quality signals; nursery does not.

## Non-linear uptake curve — rejected for now

Linear in `targetG`, inverse-linear in `cycleDays` by construction
(REQ-090, REQ-091). If tissue data shows accelerating uptake (W²
growth), refit to a curve. Until then, even-uptake framing holds.

## Spinach nursery — separate subproject

Spinach has different DW and tissue concentrations. Clone under
sibling `spinach-plant-needs/`; do not overload this model.

## Tray geometry alternatives — not modelled

Defaults assume 50-cell Salanova plug tray (`cellsPerTray=50`,
`trayAreaM2=0.149`). A 32-cell variant would need fresh defaults; the
formula itself is geometry-agnostic.
