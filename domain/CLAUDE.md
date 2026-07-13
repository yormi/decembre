# domain — cross-crop domain models

Domain models + protocols that span crops (not tied to one crop's
subtree under `nutrition/<crop>/domain/`). Crop-specific domain stays
in its crop; shared soil chemistry + methods live here.

- `greenhouse.md` — light **supply**: fixture power → PPFD → DLI.
  Hands crop DLI targets to each crop domain.
  **Reach for this when:** changing a fixture, zone PPFD, or the
  PPFD→DLI conversion.

- `propagation.md` — crop-agnostic seedling physics: germination
  conditions + container → root-volume → substrate cost. Lettuce
  seedling **nutrition** lives under `../nutrition/lettuce/domain/nursery/`.
  **Reach for this when:** changing germination temp/EC bands,
  container sizing, or substrate cost.

- `spinach.md` — spinach irrigation domain.
  **Reach for this when:** working spinach water scheduling.

- `fertigation.md` — pool-maintenance fertigation **method**
  (design, not yet wired). How weekly fertigation derives from soil
  pools: uptake-per-kg maintenance → M3 pool control law → measured
  transfer coefficient → K-only intensity floor. Cross-crop (tomato
  + lettuce).
  **Reach for this when:** changing how a fertigation dose is
  derived, deciding whether a nutrient goes in the tank vs
  front-load/foliar/AMF, or building the `poolDose()` calc.

- `fertilisation/lettuce.md` — lettuce N front-load sizing
  (feather-meal-only): removal-per-kg → available-N-per-gram →
  constant-supply dose on a fixed re-apply cycle. The N-front-load
  branch of `fertigation.md`, made concrete for lettuce.
  **Reach for this when:** setting the feather-meal front-load rate
  for lettuce, or wiring it into a calc/spec.

Related, elsewhere: nutrient mobility + scope →
`../nutrition/soil-contribution/domain.md`; uptake primitive →
`../nutrition/lettuce/domain/plant-needs/crop-removal.md`.
