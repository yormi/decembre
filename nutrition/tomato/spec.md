# Nutrition — tomate (specs modèle / recette / biologie)

Tomato-specific nutrition specs: per-stage demand values, fruit export,
biomass demand, channel-ownership for tomato elements, recipe-side macro
coverage bounds.

Cross-crop nutrition rules (chemistry, products, organic cert, mass-balance
framing) live in `nutrition/spec.md`. UI-side specs for the Tomato Nutrition
admin page live in `nutrition/tomato/app/spec.md`.

---

## REQ-011 — `CHANNEL_ROLE` covers every demand element

**Statement:** A `CHANNEL_ROLE` constant maps every element appearing in
`BIOMASS_DEMAND[stage]` (and `TOMATO_FRUIT_EXPORT`) to its delivery
channel(s) — `fertigation`, `sidedress`, `frontload`, `foliar`, `passive` —
with explicit fractions per channel.

**Rationale:** Without an explicit ownership table, "is fertigation supplying
enough K?" has no formal answer. Forgotten elements get silently undelivered.

**Verification:** Script extracts the union of element keys across
`BIOMASS_DEMAND.T1..T5` and asserts each appears in `CHANNEL_ROLE`.

---

## REQ-013 — Flux supply ≥ demand × 0.9 (under-fert guard)

**Statement:** For every (flux element × stage), `Σ(channel_supply) ≥
0.9 × demand_total[stage, element]`. Channel supply uses pH-aware effective
efficiency (REQ-017). Below 0.9 requires explicit `acceptedDeficit: { reason:
'...' }` annotation on the stage entry — silent failure not allowed.

**Rationale:** The whole point of a model. Below 90% means real plant deficit
is on the way; an explicit override forces the operator to acknowledge it.

**Verification:** Runtime test runs `calcNutrSupply` and `calcNutrDemand`
for every (crop, stage, element); fails on any element below threshold
without override.

---

## REQ-014 — Flux supply ≤ demand × 1.3 (luxury / waste guard)

**Statement:** For every (flux element × stage), `Σ(channel_supply) ≤
1.3 × demand_total`. Above 1.3× = luxury feeding, antagonism risk, waste,
or burn risk.

**Rationale:** Over-feeding is a model failure too. Excess K antagonizes Mg
uptake; excess N pushes vegetative; excess micros approach toxicity. In an
organic operation, luxury feeding also burns input budget.

**Verification:** Same runtime test as REQ-013, opposite bound.

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

**Verification:** Node verifier reads `TOMATO_REMOVAL` from instrumented
`window` and asserts each macro is ≥ inter-source mean from the hardcoded
reference table above.
