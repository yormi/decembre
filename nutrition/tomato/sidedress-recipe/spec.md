# Tomate — sidedress-recipe

Specs for the model that **derives the first-principles weekly sidedress
dose** (granular pre-application of organic N to soil) per tomato stage,
in g per planche per week.

Spec only. Mass-balance derivation, per-stage table, mineralization
rationale, Ca-aware gate rationale, refinement triggers live in
`derivation.md`. Operational stored values (`STORED_RECIPE.tomato.sidedress`)
are governed by `/retire-recipe`, not this spec.

Question answered: **"how much of the chosen Ca-free sidedress product
per planche per week to cover the N gap left after compost residual
mineralization at stage S?"**

Out of scope: what the team weighs out (`STORED_RECIPE.tomato.sidedress`);
which Ca-free product to pick (operator); within-week timing (steady-state
assumed).

Cross-channel: sidedress is part of the replenishment chain (compost →
sidedress → fertigation → foliar). Chain bounds in `nutrition/tomato/spec.md`
(REQ-013 / REQ-014).

---

## Contract

### Inputs

| Name      | Type   | Range                            | Source                            |
|-----------|--------|----------------------------------|-----------------------------------|
| `stage`   | string | `T1` / `T2` / `T3` / `T4` / `T5` | Tomato production stage selector  |
| `product` | string | key of `SIDEDRESS_PRODUCTS` with `ca_pct === 0` (optional, default `'FarinePlumes'`) | Operator product choice |

Plant-needs offtake, compost residual, product chemistry, planche area
pulled from upstream — see derivation.

### Output

`computeStageSidedress(stage, product)` returns:

```js
{ actisol_g: number, farine_g: number, alfalfa_g: number,
  chosen: string,    g_per_planche: number }
```

All masses in **g per planche per week** (planche area =
`SIDEDRESS_AREA_PER_PLANCHE`). `chosen` is the selected product key;
`g_per_planche` is its dose. Per-product fields hold 0 for unselected.
`actisol_g` stays 0 in the Ca-aware variant (REQ-089 gate).

---

## Cert scale

Same single-cert transferability scale as
`nutrition/tomato/plant-needs/spec.md` ("Cert scale" — canonical).

---

## INV-1 — Stage coverage is closed

For every stage in `RECIPE_INPUTS.stageYield`, `computeStageSidedress(stage)`
returns numeric per-product fields and `g_per_planche`. No `undefined`,
`NaN`, or negative values.

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

N-only — sidedress's natural strength. Other elements covered upstream
(compost residual + fertigation + foliar). Formula is product-agnostic;
switching products changes `n_pct` and `eff` only.

**Cert:** 3 (mass-balance well-defined; values inherit cert 2 from
plant-needs and cert 2-3 from compost; effective cert min = 2; formula
itself structural, cert 4).

---

## REQ-088 — Public API namespace `window.SidedressRecipeTomato`

At runtime, `window.SidedressRecipeTomato` exists and exposes:

| Key                          | Type     |
|------------------------------|----------|
| `AREA_PER_PLANCHE`           | number   |
| `PRODUCTS`                   | object   |
| `MINIMUM_EFFICIENCY`         | object   |
| `efficiency`                 | object   |
| `FIRST_PRINCIPLES_BY_STAGE`  | object   |
| `computeStageSidedress`      | function |

`MINIMUM_EFFICIENCY` is a derived backwards-compat view for legacy
consumers in `app/index.html`. `efficiency` added per REQ-157 —
channel-side contract for Efficacité column (REQ-156); per-element
delivery fraction at the channel's current FP-default product
(FarinePlumes); N-only at 0.75 (Sonneveld mineralization); K / P / other
macros absent (no routing under current product mix).

**Cert:** 5 (structural assertion).

---

## REQ-089 — Ca-aware product gate

The product chosen by `computeStageSidedress(stage, product)` must have
`SIDEDRESS_PRODUCTS[chosen].ca_pct === 0`. Any product with `ca_pct > 0`
must return `g_per_planche === 0` even when explicitly requested
(defensive gate — caller cannot bypass).

Current Ca-free products: farine de plumes 13-0-0, Eco-luzerne 3-0.5-2.
Currently gated out: Actisol 5-3-2 (3 % Ca, calcitic carrier).

**Cert:** 4 (Ca-saturation measured at Décembre; product Ca % label-stated;
gate generalizes beyond Actisol-specific lock).

---

## Inherited specs

Sidedress consumes plant-needs and compost-contribution outputs:

- **REQ-083** (`nutrition/tomato/plant-needs/spec.md`) —
  `PlantNeedsTomato.demandTotal` canonical demand source.
- **REQ-080** (`nutrition/compost-contribution/spec.md`) —
  `CompostContribution.releasePerWeek` canonical compost source.

Specs that *consume* sidedress output:

- **REQ-013 / REQ-014** (`nutrition/tomato/spec.md`) — supply chain bounds.
  Sidedress N is one of four channels summed against demand.
- **REQ-022** (`nutrition/spec.md`) — every product Ecocert-allowed.
  Farine de plumes 13-0-0 ✓. Eco-luzerne 3-0.5-2 CAN/CGSB-32.311
  status unverified — no certificate on file under `nutrition/doc/` as
  of the last scan; directory `nutrition/doc/eco-luzerne-3-0-5-2/` has
  not been created. Alfalfa branch remains non-default until a cert
  PDF is filed under that path (gate is filesystem-condition, no
  calendar). When filed, this REQ inheritance flips to ✓ and the
  default-product swap becomes operator-callable (still gated by
  `/retire-recipe` for STORED).
- **REQ-002** (`nutrition/spec.md`) — no forbidden products.
