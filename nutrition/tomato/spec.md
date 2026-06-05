# Nutrition — tomate (specs modèle / recette / biologie)

Tomato-specific nutrition specs: per-stage demand values, fruit export,
biomass demand, channel-ownership for tomato elements, recipe-side macro
coverage bounds.

Cross-crop nutrition rules (chemistry, products, organic cert, mass-balance
framing) live in `nutrition/spec.md`. UI-side specs for the Tomato Nutrition
admin page live in `nutrition/tomato/shell/spec.md` (page-shell orchestration
+ layout) and `nutrition/tomato/{plant-needs,fertigation-recipe,sidedress-recipe,foliar-strategy}/builder/user-stories.md`
(per-block surface).

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
  `SIDEDRESS_AREA_PER_PLANCHE`. `sidedress-recipe/model —
  mass-balance-sizes-product-to-n-gap` / `public-api-namespace` /
  `ca-aware-product-gate`.
- **`foliar-strategy/spec.md`** — the tomato foliar program: one
  strategy per crop, one or more recipes per strategy (each = one
  tank's mix, `nutrition/chemistry — in-tank-ksp-precipitation-guard`-clean). Model picks per-recipe weekly count
  bounded by per-recipe weekly leaf-tolerance cap, spreads sprays
  across the `nutrition — farm-working-days` set. Builder block
  carries surfactant lever only (sprayCount input retired 2026-05-24).
  Layer files: `spec.md`, `model/spec.md`, `builder/user-stories.md`,
  `procedure/user-stories.md`, `operator/user-stories.md`. Vocabulary in `CONTEXT.md`.
- **`soil-ph/model/spec.md`** — whether/how much elemental sulphur
  corrects tomato-bed soil pH toward the root-zone target. Calcimeter
  free-carbonate reading is the feasibility gate; acid amendment
  rejected. Greenfield — spec entries blocked on the carbonate
  measurement (ordered). No code yet.

**Target band — specialist-owned, not a PO contract (resolved 2026-05-31):**
the soil-correction endpoint is a model decision, defined in
`soil-ph/model/` (Mehlich-3 water pH band 6.0–6.5, aim 6.3, floor 5.8;
`soil-ph/model/learnings/define-soil-root-zone-ph-target-band.md`). The
PO owns plant-facing contracts (tissue bands, recipe guards); the soil
pH that frees them is the model's call. The lettuce sibling needs its
own band defined (tighter, salt-sensitive, floor 6.0) — pending in
`nutrition/lettuce/soil-ph/model/`.

The specs below cover the *coupling* between plant-needs and the supply
chain (`under-fert-guard`, `luxury-feeding-guard`) plus the
demand-anchor source-of-truth invariant (`tomato-removal-biased-high`).
Channel-role coverage lives in `nutrition/spec —
channel-role-coverage` as a cross-crop rule.

---

## under-fert-guard

For every (flux element × stage), `Σ(channel_supply) ≥ 0.9 ×
demand_total[stage, element]`. Channel supply uses pH-aware effective
efficiency (`nutrition/spec — ph-aware-effective-efficiency`). Below
0.9 requires explicit `acceptedDeficit: { reason: '...' }` annotation
on the stage entry — silent failure not allowed.

---

## luxury-feeding-guard

For every (flux element × stage), `Σ(channel_supply) ≤ 1.3 ×
demand_total`. Above 1.3× = luxury feeding, antagonism risk, waste, or
burn risk.

---

## tomato-removal-biased-high

For every macro element with multi-source published demand data (N, P, K,
Mg), the value used in `TOMATO_REMOVAL` is at or above the inter-source
mean of `{Yara high-end, Sonneveld 2009, Koller 2016 average}`. Going
below the mean requires explicit `acceptedDeficit: { reason: '...' }`
annotation on that element — silent drift below the threshold is not
allowed.

**Reference table** (g uptake per kg fresh fruit, tomato):

| Element | Yara high | Sonneveld 2009 | Koller 2016 avg | Inter-source mean |
|---------|-----------|----------------|-----------------|-------------------|
| N       | 2.3       | 2.5            | 2.9             | 2.57              |
| P       | 0.36      | 0.57           | 0.39            | 0.44              |
| K       | 3.3       | 4.0            | 4.48            | 3.93              |
| Mg      | 0.54      | 0.67           | 0.5             | 0.57              |

**Scope:** Applies to the demand-side anchor (`TOMATO_REMOVAL`,
`TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`). Recipe-side coverage of
demand is the responsibility of `under-fert-guard` /
`luxury-feeding-guard` (deferred to Phase 2.5).
