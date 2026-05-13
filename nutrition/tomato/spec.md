# Nutrition — tomate (specs modèle / recette / biologie)

Tomato-specific nutrition specs: per-stage demand values, fruit export,
biomass demand, channel-ownership for tomato elements, recipe-side macro
coverage bounds.

Cross-crop nutrition rules (chemistry, products, organic cert, mass-balance
framing) live in `nutrition/spec.md`. UI-side specs for the Tomato Nutrition
admin page live in `nutrition/tomato/app/spec.md`.

## Subprojects

- **`plant-needs/spec.md`** — model that estimates the plant's weekly
  nutrient uptake (the *demand* side of the Bilan): formula, fruit-export
  + biomass-build-out terms, stage definitions, cert per (stage, element),
  invariants, edge cases, refinement triggers. Owns `calcNutrDemand`,
  `TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`, `TOMATO_REMOVAL`,
  `TOMATO_DEMAND_CERT`.
- **`sidedress-recipe/spec.md`** — first-principles weekly granular dose
  per stage (N gap left after compost mineralization). Owns
  `computeStageSidedress(stage, product)`, `SIDEDRESS_PRODUCTS`,
  `SIDEDRESS_AREA_PER_PLANCHE`. REQ-087/088/089.
- **`foliar-recipe/spec.md`** — cuticle-uptake delivery model for the
  weekly oligo spray (Mn / Zn / Cu / Mo / Fe). Burn-cap-constrained,
  not mass-balance-derived: dose pinned at burn-safe maximum, model
  computes delivered mg/m²/wk under `FOLIAR_COVERAGE_DEFAULT` (0.30
  no-yucca; 0.80 with-yucca refinement trigger). Owns
  `computeFoliarSupply(stage)`, `FOLIAR_COVERAGE_DEFAULT`,
  `FOLIAR_COVERAGE_WITH_YUCCA`. REQ-101/103 (REQ-025 burn cap inherited
  from `nutrition/spec.md`).

The specs below cover the *coupling* between plant-needs and the supply
chain (REQ-011, REQ-013, REQ-014) plus the demand-anchor source-of-truth
invariant (REQ-033).

---

## REQ-011 — `CHANNEL_ROLE` covers every demand element

**Statement:** A `CHANNEL_ROLE` constant maps every element appearing in
`BIOMASS_DEMAND[stage]` (and `TOMATO_FRUIT_EXPORT`) to its delivery
channel(s) — `fertigation`, `sidedress`, `frontload`, `foliar`, `passive` —
with explicit fractions per channel.

**Rationale:** Without an explicit ownership table, "is fertigation supplying
enough K?" has no formal answer. Forgotten elements get silently undelivered.

---

## REQ-013 — Flux supply ≥ demand × 0.9 (under-fert guard)

**Statement:** For every (flux element × stage), `Σ(channel_supply) ≥
0.9 × demand_total[stage, element]`. Channel supply uses pH-aware effective
efficiency (REQ-017). Below 0.9 requires explicit `acceptedDeficit: { reason:
'...' }` annotation on the stage entry — silent failure not allowed.

**Rationale:** The whole point of a model. Below 90% means real plant deficit
is on the way; an explicit override forces the operator to acknowledge it.

---

## REQ-014 — Flux supply ≤ demand × 1.3 (luxury / waste guard)

**Statement:** For every (flux element × stage), `Σ(channel_supply) ≤
1.3 × demand_total`. Above 1.3× = luxury feeding, antagonism risk, waste,
or burn risk.

**Rationale:** Over-feeding is a model failure too. Excess K antagonizes Mg
uptake; excess N pushes vegetative; excess micros approach toxicity. In an
organic operation, luxury feeding also burns input budget.

---

## REQ-033 — TOMATO_REMOVAL biased toward high end of published references

**Statement:** For every macro element with multi-source published demand
data (N, P, K, Mg), the value used in `TOMATO_REMOVAL` is at or above the
inter-source mean of `{Yara high-end, Sonneveld 2009, Koller 2016 average}`.
Going below the mean requires explicit `acceptedDeficit: { reason: '...' }`
annotation on that element — silent drift below the threshold is not allowed.

**Rationale:** Décembre targets top-tier organic yields (30-45 kg/m²/yr
tomato — see baseline). Hitting those yields requires nutrient demand
modeled at the upper end of demand observed in productive operations, not
the average. Under-supply caps yield even when other inputs are optimized;
over-supply in organic context costs only product cost + modest EC
accumulation. Risk asymmetry → bias upward.

The OAQ ligne directrice (MAPAQ/Taillon committee) explicitly uses Koller
2016 averages in its reference annexe. Pushing demand modeling toward
Koller and Sonneveld upper aligns with the regulatory framework while
positioning the model for yield ceiling, not survival.

**Reference table** (g uptake per kg fresh fruit, tomato):

| Element | Yara high | Sonneveld 2009 | Koller 2016 avg | Inter-source mean |
|---------|-----------|----------------|-----------------|-------------------|
| N       | 2.3       | 2.5            | 2.9             | 2.57              |
| P       | 0.36      | 0.57           | 0.39            | 0.44              |
| K       | 3.3       | 4.0            | 4.48            | 3.93              |
| Mg      | 0.54      | 0.67           | 0.5             | 0.57              |

**Scope:** Applies to the demand-side anchor (`TOMATO_REMOVAL`,
`TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`). Recipe-side coverage of demand
is REQ-013/REQ-014's responsibility (deferred to Phase 2.5).

