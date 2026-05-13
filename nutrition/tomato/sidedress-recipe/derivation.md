# Tomate — sidedress-recipe · derivation

How the model is built. The **spec** (what it must do or be) is in
`spec.md`. This file is everything else: mass-balance derivation,
mineralization rationale, per-stage table per product option, Ca-aware
product gate trade-offs, refinement triggers.

---

## Mass-balance derivation

For each tomato stage `T1..T5` and chosen product `p = SIDEDRESS_PRODUCTS[chosen]`:

```
n_offtake_mg/m²/wk  = TOMATO_FRUIT_EXPORT.N × stageYield × 1 000
                    + BIOMASS_DEMAND[stage].N
n_compost_mg/m²/wk  = CompostContribution.releasePerWeek.N × 1 000
n_needed_mg/m²/wk   = max(0, n_offtake − n_compost)
g/m²/wk             = n_needed / (p.n_pct × p.eff) / 1 000
g/planche/wk        = g/m² × SIDEDRESS_AREA_PER_PLANCHE  (rounded)
```

The formula is product-agnostic; only `n_pct` and `eff` change between
products. Implemented in `nutrition/tomato/sidedress-recipe/calc.js`:

```js
function computeStageSidedress(stage, product) {
  const chosen = product || 'FarinePlumes';
  const spec = SIDEDRESS_PRODUCTS[chosen];
  if (!spec || (spec.ca_pct || 0) > 0) return /* all-zero */;

  const y = RECIPE_INPUTS.stageYield[stage] || 0;
  const biomass = BIOMASS_DEMAND[stage] || {};
  const compost = window.CompostContribution.releasePerWeek;

  const n_offtake_mg = (TOMATO_FRUIT_EXPORT.N.g * 1000 * y) + (biomass.N || 0);
  const n_compost_mg = (compost.N || 0) * 1000;
  const n_needed_mg_per_m2 = Math.max(0, n_offtake_mg - n_compost_mg);

  const g_per_m2      = n_needed_mg_per_m2 / (spec.n_pct * spec.eff) / 1000;
  const g_per_planche = Math.round(g_per_m2 * SIDEDRESS_AREA_PER_PLANCHE);
  /* ... pack into flat shape with chosen/g_per_planche fields ... */
}
```

---

## N-only by design

Sidedress is a **single-element channel** in the tomato model. Reasons per
element:

- **N**: organic-N concentrates (farine de plumes 13-0-0; alfalfa 3-0.5-2)
  are the natural home for ongoing N replenishment. Mineralization
  efficiencies cert 2-3.
- **K**: Actisol 5-3-2 carries only ~1.66 % K (elemental, after K₂O
  conversion). To deliver T5 K demand (~6 000 mg/m²/wk after compost +
  bank pull) via sidedress would require ~5 kg/m² Actisol per week —
  absurd. K stays in fertigation (K₂SO₄ 41.5 % K) where 1 g of product
  delivers ~10× more K than 1 g of Actisol. *Plus* Actisol carries ~3 % Ca
  — gated out by REQ-089 in the current Ca-saturated soil. Both
  constraints (K too dilute AND Ca-bearing) keep Actisol off the table.
- **P**: pH-locked at current 7.3-7.5 (REQ-018 no decorative products).
  Adding more P sidedress doesn't reach the plant; the Mehlich bank is
  already saturated. Sulfur program is the only durable P lever.
- **Ca / Mg**: covered by compost residual (Ca over-saturated, Mg
  fertigation MgSO₄ + compost residual). Adding via sidedress would
  worsen the Ca crisis — see REQ-089 product gate.
- **Micros**: doses are mg/m²/wk; granular delivery is too imprecise.
  Foliar bypasses root chemistry.

So the recipe output shape carries `actisol_g`, `farine_g`, `alfalfa_g`
fields but `actisol_g` is hard-zeroed by REQ-089's gate (Ca-bearing).
`farine_g` and `alfalfa_g` are mutually exclusive — operator picks one
via the `product` argument.

---

## Per-stage values — both Ca-free options

`stageYield × yield_factor + biomass_N` produces the per-stage demand.
Compost residual is constant. Same N gap; the dose mass differs because
13 % N farine vs 3 % N alfalfa flips the denominator (~4× more alfalfa
needed for the same N delivery).

### Option A — `chosen = 'FarinePlumes'` (current wired default)

| Stage | stageYield kg/m²/wk | offtake N mg/m²/wk | compost N mg/m²/wk | needed mg/m²/wk | farine_g/m²/wk | farine_g/planche/wk |
|-------|---------------------|--------------------|--------------------|-----------------|----------------|---------------------|
| T1    | 0                   | 700                | 1 100              | 0               | 0              | 0                   |
| T2    | 0                   | 1 050              | 1 100              | 0               | 0              | 0                   |
| T3    | 0.3                 | 1 750 + 486 = 2 236 | 1 100              | 1 136           | 11.65          | 637                 |
| T4    | 1.0                 | 1 377 + 1 620 = 2 997 | 1 100              | 1 897           | 19.46          | 1 064               |
| T5    | 1.5                 | 1 620 + 2 430 = 4 050 | 1 100              | 2 950           | 30.26          | 1 655               |

(Sample numbers reproduced from `wireFpSidedress` output 2026-05-08.)

### Option B — `chosen = 'AlfalfaMeal'` (Eco-luzerne 3-0.5-2)

Same N gap; product N % drops 13 → 3, eff drops 0.75 → 0.65 → ~4.3× more
mass needed.

| Stage | needed mg/m²/wk | alfalfa_g/m²/wk | alfalfa_g/planche/wk |
|-------|-----------------|------------------|----------------------|
| T1    | 0               | 0                | 0                    |
| T2    | 0               | 0                | 0                    |
| T3    | 1 136           | 58.3             | 3 188                |
| T4    | 1 897           | 97.3             | 5 322                |
| T5    | 2 950           | 151.3            | 8 274                |

(Computed: `g/m² = needed / (0.03 × 0.65) / 1000`. T5 ≈ 1 655 g farine →
8 274 g alfalfa, exactly the 5× ratio (13×0.75)/(3×0.65) ≈ 5.0× would
predict.)

T1 / T2 = 0 means **vegetative-phase N is fully covered by compost
residual alone** — no sidedress needed early in cycle, regardless of
product. The team applies sidedress starting at T3 (first fruit set)
because that's when offtake exceeds compost release.

---

## Mineralization efficiencies — `SIDEDRESS_PRODUCTS[*].eff`

Steady-state weekly availability assumes 4-8 weeks of accumulated
applications mineralizing simultaneously. Cert 2-3 — values within ranges
in Sonneveld & Voogt 2009 (Plant Nutrition of Greenhouse Crops, ch. 8) for
animal-protein products; alfalfa cert 2 from organic-N literature.

| Product · element     | Efficiency | Cert | Note                                                                 |
|-----------------------|-----------|------|----------------------------------------------------------------------|
| `Actisol.eff` (N)     | 0.60      | 3    | Composted manure pellet, slower than feather meal (~30-60 % yr-1).   |
| `Actisol_P` (legacy)  | 0.50      | 3    | Organic P slower than N; pH 7.4 also locks part as Ca-phosphate.     |
| `Actisol_K` (legacy)  | 0.85      | 3    | K mostly water-soluble in pellets; fast release (~70-90 % organics). |
| `FarinePlumes.eff`(N) | 0.75      | 3    | Animal protein, 70-85 % mineralizes in 6-8 weeks (warm GH soil).     |
| `AlfalfaMeal.eff` (N) | 0.65      | 2    | Plant protein, slightly slower than feather meal; cert 2 (literature). |

Cold-soul shoulder seasons would reduce these ~30-50 %. Décembre values
sit at the high end of literature ranges, justified by: (a) consistent
weekly application building up the steady-state stack; (b) warm
greenhouse soil during T3-T5 production window.

`SIDEDRESS_MIN_EFF` is a backwards-compat view of these — `app/index.html`
consumers (calcNutrSupply, computeStageRecipe, additionFor) still read
the legacy keys directly.

---

## Why g_per_planche is a hard zero at T1 / T2

`computeStageSidedress` clamps `n_needed = max(0, offtake − compost)`. At
T1 + T2 the offtake (vegetative biomass demand only — no fruit yet) is
700-1 050 mg N/m²/wk; compost releases ~1 100 mg N/m²/wk. The bank is in
*surplus* during establishment, regardless of product choice.
ACCEPTED_EXCESSES (`nutrition/tomato/spec.md`-adjacent) documents this is
intentional — banking N for later, not a recipe error.

---

## Caveats and known limitations

- **Steady-state mineralization assumed.** First 4-6 weeks after starting
  sidedress, the actual release ramps up as the application stack builds.
  The model treats every week as already-stacked. For T1 establishment
  this overstates initial g/planche if the team starts from zero — but
  computed dose is 0 at T1 anyway, so the issue doesn't manifest until
  T3 ramp-up where the stack has had ~6-8 weeks to stabilize.
- **Single-product per call.** `computeStageSidedress(stage, product)`
  picks one product — no blending. If operator wants a 50/50 farine +
  alfalfa blend, run twice and sum. Blend optimization (cost vs cert vs
  organic-N source diversity) is not modeled — the gate just enforces
  Ca-free.
- **Eco-luzerne organic-cert TBD.** Acti-Sol catalog is heavily certified
  but the Ecocert evaluation for this specific product line isn't in the
  repo yet. Until it lands in `nutrition/doc/eco-luzerne-3-0-5-2/`, the
  alfalfa branch should not be wired as default — REQ-022 inheritance
  flag.
- **No cold-season scalar.** Mineralization slows ~30-50 % below 12 °C
  soil temp. Décembre's greenhouse soil stays warm enough through T3-T5
  that the constant `eff` values hold; if the cycle ever extends into
  shoulder weather, add a temperature factor to each product's `eff`.
- **Planche area is hardcoded.** `SIDEDRESS_AREA_PER_PLANCHE = 54.7 m²`
  matches `TOMATO_BED_AREA`. If beds get reconfigured, both constants
  drift in lockstep — tag a refinement trigger.

---

## Refinement triggers

Update the model when:

- **Eco-luzerne becomes default product.** Operator decision once organic-
  cert is verified. Default-swap requires `/retire-recipe` audit cycle —
  the FP target alone shifts here, but the team's STORED weighed-out
  recipe must follow. The mass dose grows ~5× (3 % N vs 13 % N),
  re-validate cycle inventory + storage.
- **A new Ca-bearing organic-N product surfaces (e.g. Selectus 4-2-5,
  certain frass blends).** No code change needed for the gate — the
  `ca_pct > 0` declaration in its `SIDEDRESS_PRODUCTS` entry is sufficient
  for REQ-089 to reject it. Resolved by the gate generalization
  2026-05-09 (was Actisol-specific previously).
- **Tissue test reveals N over- or under-supply.** Tissue petiole NO₃-N
  outside the 800-1 200 ppm band → adjust the chosen product's `eff` (the
  most-uncertain input) and re-derive.
- **`stageYield` retunes.** If the target yield curve changes, the
  derived dose shifts proportionally — predictable, no model edit
  needed.
- **Compost release shifts** (REQ-079 verifier flags drift, or compost
  ages out per `compost-contribution/spec.md`'s pending decline curve).
  No code change in this subproject; the formula re-derives automatically.

---

## Implementation map

| File                                                | Owns                                                       |
|-----------------------------------------------------|------------------------------------------------------------|
| `nutrition/tomato/sidedress-recipe/data.js`         | `SIDEDRESS_AREA_PER_PLANCHE`, `SIDEDRESS_PRODUCTS`, `SIDEDRESS_MIN_EFF` (derived view), `FIRST_PRINCIPLES_SIDEDRESS` skeleton |
| `nutrition/tomato/sidedress-recipe/calc.js`         | `computeStageSidedress(stage, product)`, `wireFpSidedress` IIFE |
| `nutrition/tomato/sidedress-recipe/model.js`        | `window.SidedressRecipeTomato` namespace wrapper           |
| `nutrition/tomato/sidedress-recipe/spec.md`         | Spec — what the model must do or be                        |
| `nutrition/tomato/sidedress-recipe/derivation.md`   | This file                                                  |

`app/index.html` includes them in dependency order: AFTER plant-needs
(needs `BIOMASS_DEMAND`, `TOMATO_FRUIT_EXPORT`), AFTER compost-contribution
(needs `window.CompostContribution`), AFTER `RECIPE_INPUTS` (needs
`stageYield`), AFTER `PRODUCT_PCT` (needs `FarinePlumes_N`, `Actisol_N`,
etc.). Order: `data.js` → `calc.js` → `model.js`. Consumers
(`computeStageRecipe`'s context, Banque sol page) come later in the
build and reach for `window.SidedressRecipeTomato`.
