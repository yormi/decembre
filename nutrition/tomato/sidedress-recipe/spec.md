# Tomate — sidedress-recipe

Specs for the model that **derives the first-principles weekly sidedress
dose** (granular pre-application of organic N to the soil) per tomato
production stage, in g per planche per week.

This file is the *spec* (what the model must do or be). The mass-balance
derivation, per-stage table, mineralization rationale, Ca-aware product
gate rationale and refinement triggers live in `derivation.md` next door.
Operational *stored* values that the team currently weighs out
(`STORED_RECIPE.tomato.sidedress`) are governed by the `/retire-recipe`
audit-trail skill, not by this spec.

The model answers exactly one question: **"how much of the chosen Ca-free
sidedress product per planche per week does the plant need at stage S to
cover the N gap left after compost residual mineralization?"**

It does NOT answer:
- What the team currently weighs out (that's `STORED_RECIPE.tomato.sidedress`).
- *Which* Ca-free product to pick (farine de plumes vs alfalfa) — operator
  decision; the Ca-aware gate (REQ-089) only enforces that whatever is
  picked has `ca_pct === 0`. Product comparisons live in `nutrition/doc/`.
- Sidedress timing within the week (single-shot vs split applications) —
  steady-state mineralization assumed; see derivation.

Cross-channel scope: sidedress is *part of* the weekly replenishment chain
(compost → sidedress → fertigation → foliar). This subproject owns the
**sidedress-only** sizing. The chain itself is in
`nutrition/tomato/spec.md` (REQ-013 / REQ-014 supply bounds).

---

## Contract

### Inputs

| Name      | Type   | Range                            | Source                            |
|-----------|--------|----------------------------------|-----------------------------------|
| `stage`   | string | `T1` / `T2` / `T3` / `T4` / `T5` | Tomato production stage selector  |
| `product` | string | key of `SIDEDRESS_PRODUCTS` with `ca_pct === 0` (optional, default `'FarinePlumes'`) | Operator product choice |

All other dependencies (plant-needs offtake, compost residual, product
chemistry, planche area) are pulled from upstream subprojects /
constants — see derivation.

### Output

`computeStageSidedress(stage, product)` returns:

```js
{ actisol_g: number, farine_g: number, alfalfa_g: number,
  chosen: string,    g_per_planche: number }
```

All masses in **grams per planche per week** (planche area =
`SIDEDRESS_AREA_PER_PLANCHE`). `chosen` is the product key that was actually
selected; `g_per_planche` is its dose. Per-product fields hold 0 for
unselected products. `actisol_g` stays at 0 in the Ca-aware variant — the
gate prevents Actisol from ever being selected while soil is Ca-saturated.

---

## Cert scale

Same single-cert transferability scale as
`nutrition/tomato/plant-needs/spec.md` ("Cert scale" section — canonical).

---

## INV-1 — Stage coverage is closed

For every stage in `RECIPE_INPUTS.stageYield`, `computeStageSidedress(stage)`
returns numeric per-product fields and `g_per_planche`. No `undefined`,
`NaN`, or negative values.

**Verification:** `scripts/check-recipes.mjs` — call once per stage and
assert the shape + non-negativity.

---

## REQ-087 — Mass-balance: chosen product sized to N gap after compost

For each stage, given the chosen product `p = SIDEDRESS_PRODUCTS[chosen]`:

```
n_offtake_mg/m²/wk = TOMATO_FRUIT_EXPORT.N × stageYield + BIOMASS_DEMAND[stage].N
n_compost_mg/m²/wk = CompostContribution.releasePerWeek.N × 1 000
n_needed_mg/m²/wk  = max(0, n_offtake − n_compost)
g/m²/wk            = n_needed_mg / (p.n_pct × p.eff) / 1 000
g/planche/wk       = g/m² × SIDEDRESS_AREA_PER_PLANCHE  (rounded)
```

The mass-balance is N-only — sidedress's natural strength (concentrated
organic-N pellets). Other elements are covered by upstream channels
(compost residual + fertigation + foliar).

**Rationale:** Sidedress sizing has historically drifted from agronomist
intuition over time. Grounding it in plant-needs offtake minus compost
release makes the dose a function of inputs that already have their own
specs (REQ-013/014 bounds, REQ-079 compost band). Drift surfaces at the
upstream-spec level instead of being hidden inside a recipe number. The
formula is product-agnostic — only `n_pct` and `eff` of the chosen
product change. Switching products (farine ↔ alfalfa) does not change
the model, only the dose.

**Verification:** `scripts/check-recipes.mjs` REQ-087 — recomputes the
formula from upstream constants for the wired-default product
(`'FarinePlumes'`) and asserts every `computeStageSidedress(stage).farine_g`
is within ±5 g of the expected value (rounding tolerance). Spot-checks the
alfalfa branch separately.

**Cert:** 3 (mass-balance is well-defined; values inherit cert 2 from
plant-needs and cert 2-3 from compost — effective cert min = 2;
formula application itself is structural, cert 4).

---

## REQ-088 — Public API namespace `window.SidedressRecipeTomato`

At runtime, `window.SidedressRecipeTomato` exists and exposes:

| Key                          | Type     |
|------------------------------|----------|
| `AREA_PER_PLANCHE`           | number   |
| `PRODUCTS`                   | object   |
| `MIN_EFF`                    | object   |
| `FIRST_PRINCIPLES_BY_STAGE`  | object   |
| `computeStageSidedress`      | function |

**Rationale:** Same as `PlantNeedsTomato` (REQ-083) and
`CompostContribution` (REQ-080). Consumers (Banque sol page, "Recette
proposée" admin card, future per-stage drift gauges) read sidedress
through this namespace so internals can be reshaped without breaking call
sites. `PRODUCTS` is the new entry — exposes the per-product chemistry
table that REQ-089 reads from. `MIN_EFF` retained as a derived
backwards-compat view for legacy consumers in `app/index.html`.

**Verification:** `scripts/check-recipes.mjs` REQ-088 — namespace presence
+ key set + spot-check of `computeStageSidedress('T5').farine_g` shape.

**Cert:** 5 (structural assertion).

---

## REQ-089 — Ca-aware product gate

The product chosen by `computeStageSidedress(stage, product)` must have
`SIDEDRESS_PRODUCTS[chosen].ca_pct === 0`. Any product with `ca_pct > 0`
must return `g_per_planche === 0` even when explicitly requested by the
caller (defensive gate — caller cannot bypass).

**Rationale:** The current soil is Ca-saturated (10 989 kg/ha tomato
planches per Berger Apr 2026) and pH is 7.28-7.48 — adding Ca extends the
pH crisis. The previous spec locked Actisol-specifically (`actisol_g === 0`),
which is too narrow: a future "let's try Selectus 4-2-5" or a new
Ca-bearing frass product would slip through. Generalizing the gate to
`ca_pct === 0` rejects any Ca-bearing sidedress automatically without
operator vigilance — pH-crisis safety wired into the model itself.
Currently certified Ca-free products: farine de plumes 13-0-0, Eco-luzerne
3-0.5-2 (alfalfa). Currently gated out: Actisol 5-3-2 (3 % Ca, calcitic
carrier).

**Verification:** `scripts/check-recipes.mjs` REQ-089 — for every stage,
read `chosen` from the return value and assert
`SIDEDRESS_PRODUCTS[chosen].ca_pct === 0`. Also assert that explicitly
requesting a Ca-bearing product (e.g. `'Actisol'`) returns `g_per_planche === 0`.

**Cert:** 4 (Ca-saturation is measured at Décembre; product Ca % is label-
stated; trade-off is well-grounded in current data; gate generalizes
beyond the specific Actisol-vs-farine pair).

---

## Inherited specs

Sidedress consumes plant-needs and compost-contribution outputs:

- **REQ-083** (`nutrition/tomato/plant-needs/spec.md`) —
  `PlantNeedsTomato.demandTotal` is the canonical demand source.
- **REQ-080** (`nutrition/compost-contribution/spec.md`) —
  `CompostContribution.releasePerWeek` is the canonical compost source.

Specs that *consume* the sidedress output:

- **REQ-013 / REQ-014** (`nutrition/tomato/spec.md`) — supply chain bounds.
  Sidedress N is one of four channels summed against demand.
- **REQ-022** (`nutrition/spec.md`) — every product is Ecocert-allowed.
  Farine de plumes 13-0-0 is on the certified-input list. Eco-luzerne
  3-0.5-2 organic-cert is **TBD** until the Ecocert evaluation lands in
  `nutrition/doc/eco-luzerne-3-0-5-2/` — the alfalfa branch should not be
  selected as default product until that cert chain extends.
- **REQ-002** (`nutrition/spec.md`) — no forbidden products.
