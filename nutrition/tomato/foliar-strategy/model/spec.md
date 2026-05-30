# Tomate — foliar-strategy

Specs for the model that produces the **foliar strategy** for the tomato
crop: the set of **foliar recipes** to spray each week, the
model-computed number of **sprays** per recipe, and the day on which
each spray runs (vocabulary locked in
`nutrition/tomato/foliar-strategy/CONTEXT.md`).

Today the strategy contains ONE recipe (the oligo recipe — Mn / Zn /
Cu / Fe). A Ca recipe (CaCl₂·2H₂O + surfactant, Test 1 Path B
2026-05-24) is the next recipe to be added; the model contract is
shaped to accommodate N recipes per strategy without further reshape.
Each recipe is REQ-029-clean independently of the others.

Framing (burn-cap-constrained, not mass-balance-derived), per-element
delivered tables, surfactant ratios, Ca obstacle chain, refinement
triggers and implementation map live in `derivation.md`. Decisions and
rejected alternatives live in `learnings.md` (flat today; will split to
`learnings/NNNN-slug.md` next touch per project convention). The
operational *stored* spray (`STORED_RECIPE.tomato.foliaire`) is governed
by `/retire-recipe`, not by this spec.

The model answers two questions:

1. **"What recipes do we spray this week, how many times each, and on
   which days?"** — the strategy output (`strategy-is-independent-recipes` / `model-computed-spray-count` / `sprays-spread-across-farm-working-days`).
2. **"How much of element X arrives at the plant per m² per week from
   recipe R at stage S, after cuticle-coverage losses?"** — the
   per-recipe delivery model (`coverage-discount-on-delivery` / `gap-maximizing-recipe`).

Out of scope: backpack dose (`STORED_RECIPE.tomato.foliaire`),
supply-vs-demand check (REQ-013/014 in `nutrition/tomato/spec.md`), FP
dose growing with demand (foliar is burn-cap-pinned — see
`derivation.md`).

Cross-channel: foliar is the LAST channel (compost → sidedress →
fertigation → foliar, REQ-061) and the only one bypassing root-zone
chemistry. Under current pH lockout it is the sole live channel for
Mn / Zn / Fe / Cu.

---

## Contract

### Inputs

| Name      | Type   | Range                            | Source                            |
|-----------|--------|----------------------------------|-----------------------------------|
| `stage`   | string | `T1` / `T2` / `T3` / `T4` / `T5` | Tomato production stage selector  |

Stored recipes are stage-invariant (PA Taillon — oligos are
tissue-baseline anchored; Ca dose is burn-cap-pinned). `stage` is
plumbed through for contract uniformity with sidedress / fertigation
and to allow a future stage-aware spray.

### Outputs

The strategy exposes two output shapes per the two questions above:

**Per-recipe delivery** — `computeFoliarSupply(stage, opts?, recipe?)`
returns per-element mg/m²/wk delivered for ONE recipe:

```js
{ N: 0, P: 0, K: 0, Ca: number, Mg: 0,
  Fe: number, Mn: number, Zn: number, B: number, Cu: number, Mo: number }
```

(Ca slot opens when the Ca recipe lands; today returns 0 — see
`derivation.md` § "Ca-specific cuticle coverage" + `no-macro by design`.)

**Strategy output** — `computeFoliarStrategy(stage, gap)` returns the
weekly plan: list of recipes, sprays/week per recipe, day-of-week per
spray (`strategy-is-independent-recipes` / `model-computed-spray-count` / `sprays-spread-across-farm-working-days`).

Masses are mg per m² per week at tomato bed area
(`TOMATO_NUM_BEDS × TOMATO_BED_AREA = 382.9 m²`). Macros (other than Ca
once routed) are explicit zeros — foliar physiology bars N / P / K / Mg
(see `derivation.md`). Element coverage stays closed at the 11
canonical elements in `TOMATO_FRUIT_EXPORT`.

---

## Cert scale

Same scale as `nutrition/tomato/plant-needs/spec.md` ("Cert scale" —
canonical).

---

## INV-1 — Element coverage is closed

For every stage in `RECIPE_INPUTS.stageYield`, `computeFoliarSupply(stage)`
returns numeric, finite, non-negative values for every element in
`TOMATO_FRUIT_EXPORT` (currently 11). No `undefined`, `NaN`, or negative
values. The invariant holds per-recipe (each recipe in the strategy)
and at strategy-aggregate level.

---

## coverage-discount-on-delivery

For each element and stage, per recipe:

```
delivered_mg/m²/wk = (recipe_g × element_pct × 1000) / area_m² × COVERAGE × sprayCount
```

where `COVERAGE` is the per-recipe, per-element coverage:

- Sulfate-cation-micro recipe (oligo): `FOLIAR_COVERAGE_DEFAULT = 0.30`
  no surfactant, `FOLIAR_COVERAGE_WITH_YUCCA = 0.80` with surfactant.
- Ca recipe (when routed): `FOLIAR_COVERAGE_CA_NO_SURFACTANT = 0.15`,
  `FOLIAR_COVERAGE_CA_WITH_SURFACTANT = 0.40` — half the sulfate-metal
  band at each surfactant state (see `derivation.md` § "Ca-specific
  cuticle coverage").

`sprayCount` per recipe is the model-computed weekly spray count
(`model-computed-spray-count`), bounded by the weekly leaf-tolerance cap (`weekly-leaf-tolerance-cap`).

**Cert:** 3 for the sulfate-metal regime (literature mid-band 25-40 %
without surfactant; pinned at 0.30 as working assumption, not measured
at Décembre). **Cert 2** for the Ca regime (Schönherr 2000 +
literature half-of-sulfate heuristic; no Décembre tissue under Ca
foliar yet). See `derivation.md` for full uncertainty breakdown and
refinement triggers.

---

## public-api-namespace

At runtime, `window.FoliarRecipeTomato` exists and exposes:

| Key                              | Type     |
|----------------------------------|----------|
| `AREA_M2`                        | number   |
| `FOLIAR_COVERAGE_DEFAULT`        | number   |
| `FOLIAR_COVERAGE_WITH_YUCCA`     | number   |
| `efficiency`                     | object   |
| `efficiencyFor`                  | function |
| `computeFoliarSupply`            | function |
| `computeFoliarRecipeForGap`      | function |
| `computeFoliarStrategy`          | function |

Symbol rename `FoliarRecipeTomato` → `FoliarStrategyTomato` is a
separate coder-lane task (subproject rename `foliar-recipe/` →
`foliar-strategy/` already in flight on this branch). Until the rename
ships, the namespace name remains `FoliarRecipeTomato`.

`efficiency` (REQ-157) is the channel-side contract for the Efficacité
column (REQ-156): per-element foliar delivery fraction at current
no-surfactant regime and default spray-tank pH, uniform 0.27 across the
four cation-micro oligos (Mn / Zn / Cu / Fe); B absent because
single-channel by REQ-061 (fertigation owns B); Mo absent because
retired from foliar 2026-05-16 (REQ-061 carve-out, fertigation owns Mo).

`efficiencyFor(surfactant)` (`surfactant-aware-efficiency-map`) is the surfactant-aware variant of
the same contract: returns the per-element map for the given lever
state. `efficiencyFor(false)` equals `efficiency` (back-compat).
`efficiencyFor(true)` returns 0.72 uniform across Mn/Zn/Cu/Fe.

**Cert:** 5 (structural assertion).

---

## strategy-is-independent-recipes

A foliar strategy for the tomato crop is a list of one or more **foliar
recipes**. Each recipe is REQ-029-clean within its own tank (no
in-tank ion precipitation among its product set); cross-recipe REQ-029
is satisfied automatically because each recipe occupies its own tank
on its own spray.

The model treats recipes independently:

- Per-recipe gap allocation (which elements each recipe targets) is
  static, set in `data.js` per recipe definition (oligo recipe targets
  Mn / Zn / Cu / Fe / B; Ca recipe targets Ca).
- Per-recipe delivery (`coverage-discount-on-delivery`), burn cap (`gap-maximizing-recipe`), weekly
  leaf-tolerance cap (`weekly-leaf-tolerance-cap`), and spray count (`model-computed-spray-count`) are computed
  per recipe in isolation.
- No joint cross-recipe optimization, no joint operator-load cap across
  recipes (see `learnings.md` for the rejected joint-load alternative
  next time learnings are migrated).

**Cert:** 4 (structural — separability follows from per-tank REQ-029
and per-recipe leaf-tolerance physics; not measured but mechanically
clean).

---

## weekly-leaf-tolerance-cap

Each recipe carries a `weeklyLeafToleranceCap` integer (sprays/week
upper bound) declared in `data.js`. This cap bounds the model's
recommended weekly spray count (`model-computed-spray-count`) regardless of how much of the
nutrient gap a higher count would close. Per-recipe, no aggregation
across recipes.

Initial values:

| Recipe | Cap (sprays/wk) | Anchor                                                  | Cert |
|--------|----------------:|---------------------------------------------------------|-----:|
| oligo  | 1               | Live STORED Wednesday-only cadence; see `derivation.md` § "What dropping yucca cost" | 3 |
| Ca     | 3               | Test 1 Path C 2026-05-24 anchor (CaCl₂·2H₂O burn-cap math, `nutrition/chemistry — foliar-ce-under-burn-cap` 9 mS/cm tank CE under 10 mS/cm cap); see `derivation.md` § "Per-element burn cap" Ca row | 3 |

The cap models cumulative cuticle-damage risk on sprays/week —
distinct from the in-tank predicted-CE burn cap (`nutrition/chemistry — foliar-ce-under-burn-cap`), which
governs concentration *within* one tank.

**Cert:** 3 (oligo cap matches multi-week no-burn empirical track at
Décembre; Ca cap follows from `nutrition/chemistry — foliar-ce-under-burn-cap` dose math, not yet field-tested
across multiple weeks of 3-spray cadence at Décembre).

---

## model-computed-spray-count

For each recipe in the strategy, the model computes the recommended
weekly spray count as:

```
sprayCount(recipe) = min(sprays-to-close-gap, weeklyLeafToleranceCap(recipe))
```

where `sprays-to-close-gap` is the smallest integer N such that
delivering N sprays of the recipe (at its per-element burn-cap-clipped
dose per `gap-maximizing-recipe`) closes the per-recipe element gap to within the
luxury-cap band (≤ 1.3× of demand on each element the recipe targets).

`computeFoliarRecipeForGap` (`gap-maximizing-recipe`) returns this `sprayCount` alongside
the per-element grams. The strategy aggregator
`computeFoliarStrategy(stage, gap)` invokes
`computeFoliarRecipeForGap` per recipe definition in `data.js` and
collects the per-recipe `sprayCount` values into the weekly plan.

**Cert:** 4 (structural — gap math + cap clamp are deterministic).

---

## sprays-spread-across-farm-working-days

For each recipe with `sprayCount(recipe) ≥ 1`, the model picks specific
days from `nutrition — farm-working-days` (Mon-Fri at Décembre,
declared in `nutrition/spec.md`), spread as evenly as possible across
that set.

Rules:

- 1 spray/week → Wednesday (mid-week default).
- 2 sprays/week → Monday + Thursday (maximum gap inside Mon-Fri).
- 3 sprays/week → Monday + Wednesday + Friday.
- 4-5 sprays/week → Mon-Thu / Mon-Fri (recipe-dependent cap never
  exceeds 5 today).

When two recipes land on the same day, both run that day in separate
tanks — recipes are independently REQ-029-clean (`strategy-is-independent-recipes`), and the
operator runs them as two separate sprays.

**Cert:** 4 (structural — even-spread rule is deterministic; cap on
farm working days lives in `nutrition/spec.md`).

---

## gap-maximizing-recipe

`computeFoliarRecipeForGap(gap, { surfactant = false, recipeKind = 'oligo' } = {})`
returns a foliar recipe per 15 L master tank, sized to maximize coverage
of `gap` (per-element residual mg/m²/wk) subject to per-element burn
cap, per-tank predicted-CE cap (`nutrition/chemistry — foliar-ce-under-burn-cap`), and an operational dosing
floor. Output:

```js
{
  doses: { MnSO4_g, ZnSO4_g, CuSO4_g, FeSO4_g, NaMoO4_g, Solubore_g,
           CaCl2_g /* when recipeKind = 'ca' */ },
  sprayCount: number,  // model-computed-spray-count: min(sprays-to-close-gap, weeklyLeafToleranceCap)
}
```

(`NaMoO4_g` always 0 per REQ-061 Mo carve-out; key preserved for
downstream consumer compatibility.)

**Algorithm (per recipe):**

1. For each element in the recipe's target set (`oligo` →
   `{Mn, Zn, Cu, Fe, B}`; `ca` → `{Ca}`) with `gap[el] > 0`:
   - `ideal_g = gap[el] × area_m² / (element_pct × 1000 × coverage × sprayCount)`
     where `sprayCount` is iterated upward from 1 (`model-computed-spray-count` search).
   - If `ideal_g < MIN_DOSE_G_PER_ELEMENT[el]` → `0` (per-element
     operational floor; Cu = 0.2 g, others = 0.5 g — narrow Cu toxicity
     forces a tighter floor to avoid a 2.5× luxury feed when ideal_g
     lands in 0.2-0.5 g).
   - Else cap at `burnCapG(el)`; round up to nearest 0.5 g.
   - Luxury-cap guard: if the rounded dose would deliver `> 1.3 × gap[el]`,
     drop to 0 (catches the edge case where even the per-element floor
     is too coarse for a tiny gap; see `derivation.md` § "Per-element
     min-dose floor" worked-example table for the Cu fire range).
2. Compute `predictedCE` on the proposed recipe. If
   `predictedCE > nutrition/chemistry — foliar-ce-under-burn-cap cap × 0.95`: drop the highest-CE-contributor's
   dose first (Fe is the typical mass-dominant case under FeSO₄·7H₂O);
   re-round, recompute CE. Preserves pH-locked micros (Mn / Cu / B) that
   have no alternative channel under REQ-061 cascade order. Bound at 4
   iterations to guarantee termination.
3. **`model-computed-spray-count` spray-count search.** Try `sprayCount = 1, 2, … ,
   weeklyLeafToleranceCap(recipe)`. Return the smallest `sprayCount`
   at which the recipe's delivered mg/m²/wk closes the gap to within
   the luxury-cap band on every targeted element. If even at
   `weeklyLeafToleranceCap` the gap is not closed, return that cap
   (the leaf-tolerance ceiling binds; under-fert is accepted).
4. Return `{ doses, sprayCount }`.

**Surfactant scope — coverage axis only:** affects penetration/coverage
(`coverage-discount-on-delivery` 0.30 → 0.80 with yucca for sulfate metals; 0.15 → 0.40 for
Ca, cert 3 / cert 2 — see `derivation.md`). Does NOT affect burn cap:
`burnCapG(el) = BURN_CAP_BASE_G[el]` regardless of surfactant flag.
Rejected per-element-multiplier alternative in `learnings.md`.

**Cert:** 3 baseline (research-grounded surfactant framing + per-element
burn-cap base values from foliar-uptake literature mid-band; refinable
when Décembre tissue + lesion data lands). **Per-element exceptions at
cert 2** for transferability (see `derivation.md`):
- **Cu** — divergence below extension mid-band; sourced from Décembre-
  internal axil-pool observation 2026-05-06.
- **Mn / Zn** — divergence above extension mid-band; cap pinned to live
  STORED 22 g (held since 2026-04-29 restructure with no burn observed
  under Wednesday-AM operator timing); cert 2 reflects non-portability
  to ops with different timing / volume regimes.
- **Ca** — Ca burn cap 100 g/15 L cert 3 from `nutrition/chemistry — foliar-ce-under-burn-cap` dose math;
  sprayCount cap at 3 (`weekly-leaf-tolerance-cap`) cert 3 from same math, not multi-week
  field-tested yet.

---

## fp-strategy-live-derived

At Bilan render time, the FP-mode foliar strategy shown in Block 5 (and
consumed by Block 7 drift gauge vs `STORED_RECIPE.tomato.foliaire`) is
computed by calling `computeFoliarStrategy(stage, gap)` with the
residual gap **after compost + sidedress + fertigation are applied**.
The strategy invokes `computeFoliarRecipeForGap` per recipe in
`data.js` and aggregates. No hand-pinned `FP_RECIPE_T5.foliaire`
literal, no hand-pinned spray-count or day assignment. Updates whenever
any upstream supply or operator lever changes.

**Cert:** 4 (structural — derivation chain).

---

## supply-accepts-spray-count-surfactant

Function signature is
`computeFoliarSupply(stage, { sprayCount = 1, surfactant = false } = {}, recipe?)`.
`sprayCount` is clamped to integer 1-3 at the model boundary. Optional
third argument `recipe` is a label-string array (same shape as
`STORED_RECIPE.tomato.foliaire.A`) and defaults to that stored recipe when
omitted, so the function stays single source of truth across stored-mode
and FP-mode callers. Output:

```
delivered_per_element = single_spray_delivery × sprayCount × coverage_factor
coverage_factor = surfactant ? FOLIAR_COVERAGE_WITH_YUCCA : FOLIAR_COVERAGE_DEFAULT
```

`computeFoliarSupply(stage)` without opts returns today's numbers exactly.

**Status: legacy override.** Under the multi-recipe strategy model
(`strategy-is-independent-recipes` / `model-computed-spray-count`), `sprayCount` is computed by the model
(`model-computed-spray-count`) and passed *into* `computeFoliarSupply` by
`computeFoliarStrategy`, not supplied by the caller. `supply-accepts-spray-count-surfactant` retains
the opts-driven signature as a transitional back-compat surface for
the in-flight rename / FP-mode call sites. Callers should migrate to
`computeFoliarStrategy(stage, gap)` for the recipe + count + days
bundle; direct `computeFoliarSupply` calls with explicit
`sprayCount` remain valid but bypass `model-computed-spray-count`'s cap-enforcement.

Out of scope: burn-cap warning when surfactant=false but recipe sized
with surfactant in mind — that's `/retire-recipe` + `nutrition/chemistry — foliar-ce-under-burn-cap` territory.

**Cert:** 5 (structural).

---

## surfactant-aware-efficiency-map

`window.FoliarRecipeTomato.efficiencyFor(surfactant)` returns the
per-element efficiency map at the given surfactant lever state.
`efficiencyFor(true)` is strictly greater than `efficiencyFor(false)` for
every routed element (the cuticle-uptake coverage axis: 0.30 → 0.80
without changing the spray-pH multiplier). Channel capability shape per
REQ-157 (only Mn / Zn / Cu / Fe routed today; B + Mo absent per REQ-061).
The page-side Efficacité cell (REQ-163) reads this surface and updates
when the operator toggles the lever.

**Cert:** 3 (coverage constants are both cert 3; surfactant-on regime
needs Décembre tissue correlation to bump cert 3 → 4. See `derivation.md`
"Channel efficiency map" + the with-yucca coverage derivation.)

---

---

## Inherited specs

Consumed by foliar:

- **`nutrition/tomato/plant-needs/model — plant-needs-tomato-namespace`** — `PlantNeedsTomato.demandTotal` is canonical demand source.
- **nutrition — farm-working-days** (`nutrition/spec.md`) — cross-crop set of weekdays the operator may run sprays; consumed by `sprays-spread-across-farm-working-days`.

Consume foliar output or govern tank behavior:

- **REQ-013 / REQ-014** (`nutrition/tomato/spec.md`) — supply chain bounds; foliar is one of four channels. Mn / Zn / Fe / Cu have no other channel while pH ≥ 7.
- **REQ-018** (`nutrition/spec.md`) — no decorative products at current pH; coverage discount cuts headline to ~30 %, fires if a product drops below 5 % effective after coverage.
- **`nutrition/chemistry — every-product-ecocert-allowed`** — Ecocert-allowed only. MnSO₄ / ZnSO₄ / CuSO₄ / Solubore / Na molybdate / FeSO₄·7H₂O all on CAN/CGSB-32.310/311. CaCl₂·2H₂O reactivated 2026-05-24 for Test 1 Path B (food-grade vendor + product Ecocert-verified by operator); Ca recipe routes via `strategy-is-independent-recipes` when its `data.js` entry lands.
- **`nutrition/chemistry — foliar-ce-under-burn-cap`** — foliar tank predicted CE under burn cap (10 mS/cm tomato); wired in `scripts/check-recipes.mjs`. Anchors the Ca recipe's per-tank dose ceiling and `weekly-leaf-tolerance-cap`'s weekly Ca leaf-tolerance cap.
- **`nutrition/chemistry — in-tank-ksp-precipitation-guard`** — in-tank ion-precipitation clean. Each recipe in the strategy (`strategy-is-independent-recipes`) is REQ-029-clean independently within its own tank.
- **`nutrition/chemistry — predicted-tank-ph-within-envelope` / `nutrition/chemistry — foliar-uptake-ph-curve`** — predicted tank pH + cuticle-pH multiplier. Tank pH ~5 (sulfate dominant), within `foliarPhResponse` peak 5.5-6.0.
- **REQ-061** (`nutrition/spec.md`) — cascade order. Foliar carries residual gap; Mn / Zn / Fe / Cu have no other channel today (sulfates precipitate at root-zone pH 7.4), so foliar IS the earliest active channel for those — verifier accommodates.
- **REQ-062** (`nutrition/spec.md`) — single fertigation tank per week (foliar-singleton half retired 2026-05-17). Foliar-frequency now governed by `model-computed-spray-count` (model-computed, bounded by `weekly-leaf-tolerance-cap` weekly leaf-tolerance cap) in this subproject; no cross-crop singleton constraint on foliar.
