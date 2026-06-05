# Canopy factor floor 0.2 — not zero

The clamp lower bound on `canopyFactor` is 0.2, not 0. Rationale: a stunted
seedling still transpires (root pressure + osmotic flow); the soil mass-flow
channel never goes fully dry while the plant is alive. 0.2 chosen as a
defensible minimum, refine if measured stunted-plant transpiration data
contradicts.
