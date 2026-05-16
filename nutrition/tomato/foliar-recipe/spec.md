# Tomate — foliar-recipe

Specs for the model that delivers the weekly foliar oligo spray —
Mn / Zn / Cu / Mo / Fe. Input: stage. Output: per-element mg/m²/wk
delivered after cuticle-coverage discount.

Framing (burn-cap-constrained, not mass-balance-derived), per-element
delivered table, no-yucca trade-off, refinement triggers and
implementation map live in `derivation.md`. The operational *stored*
spray (`STORED_RECIPE.tomato.foliaire`) is governed by `/retire-recipe`,
not by this spec.

The model answers: **"how much of element X arrives at the plant per
m² per week from the spray at stage S, after cuticle-coverage losses?"**

Out of scope: backpack dose (`STORED_RECIPE.tomato.foliaire`), supply-vs-demand
check (REQ-013/014 in `nutrition/tomato/spec.md`), FP dose growing with
demand (foliar is burn-cap-pinned — see `derivation.md`).

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

Stored recipe is stage-invariant (PA Taillon — oligos are tissue-baseline
anchored). `stage` is plumbed through for contract uniformity with
sidedress / fertigation and to allow a future stage-aware spray.

### Output

`computeFoliarSupply(stage)` returns per-element mg/m²/wk delivered:

```js
{ N: 0, P: 0, K: 0, Ca: 0, Mg: 0,
  Fe: number, Mn: number, Zn: number, B: number, Cu: number, Mo: number }
```

Masses are mg per m² per week at tomato bed area
(`TOMATO_NUM_BEDS × TOMATO_BED_AREA = 382.9 m²`). Macros are explicit
zeros — current oligo spray carries no macros, and foliar physiology bars
N / P / Ca / Mg (see `derivation.md`). Element coverage stays closed at the
11 canonical elements in `TOMATO_FRUIT_EXPORT`.

---

## Cert scale

Same scale as `nutrition/tomato/plant-needs/spec.md` ("Cert scale" —
canonical).

---

## INV-1 — Element coverage is closed

For every stage in `RECIPE_INPUTS.stageYield`, `computeFoliarSupply(stage)`
returns numeric, finite, non-negative values for every element in
`TOMATO_FRUIT_EXPORT` (currently 11). No `undefined`, `NaN`, or negative
values.

---

## REQ-101 — Coverage discount applied to foliar delivery

For each element and stage:

```
delivered_mg/m²/wk = (recipe_g × element_pct × 1000) / area_m² × FOLIAR_COVERAGE_DEFAULT
```

where `FOLIAR_COVERAGE_DEFAULT = 0.30` while operating without surfactant
(yucca decision 2026-05-05, not on order).

**Cert:** 3 (literature mid-band 25-40 % without surfactant; pinned at
0.30 as working assumption, not measured at Décembre. See `derivation.md`
for full uncertainty breakdown — Sentís et al. 2017 penetration vs
retention, cost-sensitivity 0.20 vs 0.40 doubles/halves delivery, refinement
trigger via 2026-05-12 petiole panel).

---

## REQ-103 — Public API namespace `window.FoliarRecipeTomato`

At runtime, `window.FoliarRecipeTomato` exists and exposes:

| Key                              | Type     |
|----------------------------------|----------|
| `AREA_M2`                        | number   |
| `FOLIAR_COVERAGE_DEFAULT`        | number   |
| `FOLIAR_COVERAGE_WITH_YUCCA`     | number   |
| `efficiency`                     | object   |
| `computeFoliarSupply`            | function |

`efficiency` (REQ-157) is the channel-side contract for the Efficacité
column (REQ-156): per-element foliar delivery fraction at current no-yucca
regime and default spray-tank pH, uniform 0.27 across the six oligo
elements (Mn / Zn / Cu / Fe / Mo); B absent because single-channel by
REQ-061 (fertigation owns B). Yucca return flips coverage 0.30 → 0.80 and
updates the map in lockstep.

**Cert:** 5 (structural assertion).

---

## REQ-115 — `computeFoliarRecipeForGap(gap, opts)` builds gap-maximizing recipe

`computeFoliarRecipeForGap(gap, { sprayCount = 1, surfactant = false } = {})`
returns a foliar recipe per 15 L master tank, sized to maximize coverage
of `gap` (per-element residual mg/m²/wk) subject to per-element burn cap,
per-tank predicted-CE cap (REQ-025), and an operational dosing floor.

**Algorithm:**

1. For each foliar element `el ∈ {Mn, Zn, Cu, Fe, Mo, B}` with `gap[el] > 0`:
   - `ideal_g = gap[el] × area_m² / (element_pct × 1000 × coverage × sprayCount)`
   - If `ideal_g < 0.5` → `0` (operational floor — sub-half-gram doses aren't measurable on an organic-farm scale).
   - Else cap at `burnCapG(el, surfactant)`; round up to nearest 0.5 g.
2. Compute `predictedCE` on the proposed recipe. If
   `predictedCE > REQ-025 cap × 0.95`: scale all non-zero doses by
   `target_CE / predicted_CE`, re-round up to 0.5 g, recompute CE.
   Bound at 4 iterations to guarantee termination.
3. Return `{ MnSO4_g, ZnSO4_g, CuSO4_g, FeSO4_g, NaMoO4_g, Solubore_g }`.

**Surfactant scope — coverage axis only:** affects penetration/coverage
(REQ-101 0.30 → 0.80 with yucca, cert 4 — Sentís et al. *Crop Protection*
2017). Does NOT affect burn cap: `burnCapG(el) = BURN_CAP_BASE_G[el]`
regardless of surfactant flag. Rejected per-element-multiplier alternative
in `learnings.md`.

**Cert:** 3 (research-grounded surfactant framing + per-element burn-cap
base values from foliar-uptake literature mid-band; refinable when
Décembre tissue + lesion data lands).

---

## REQ-116 — FP foliar recipe is live-derived from current residual gap

At Bilan render time, the FP-mode foliar recipe shown in Block 5 (and
consumed by Block 7 drift gauge vs `STORED_RECIPE.tomato.foliaire`) is
computed by calling `computeFoliarRecipeForGap` with the residual gap
**after compost + sidedress + fertigation are applied**. No hand-pinned
`FP_RECIPE_T5.foliaire` literal. Updates whenever any upstream supply
or operator lever changes.

**Cert:** 4 (structural — derivation chain).

---

## REQ-112 — `computeFoliarSupply` accepts spray count + surfactant

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

Out of scope: burn-cap warning when surfactant=false but recipe sized
with surfactant in mind — that's `/retire-recipe` + REQ-025 territory.

**Cert:** 5 (structural).

---

## Pending — yucca-coverage refinement trigger

If yucca returns, `FOLIAR_COVERAGE_DEFAULT` flips `0.30 → 0.80` and every
element's effective delivery jumps ~2.7×. Recipe-history context: when
yucca was dropped (2026-05-05), Cu 4 → 2 g, Mn 22 → 18 g, Zn 22 → 16 g
to stay under burn cap. Restoration relaxes those dose limits
(re-evaluate against REQ-025).

When wired: `/retire-recipe` first (doses in `STORED_RECIPE.tomato.foliaire`
change — that's the trigger), then flip `FOLIAR_COVERAGE_DEFAULT` here.
Recipe edit first so the audit snapshot lands on the old recipe.

---

## Inherited specs

Consumed by foliar:

- **REQ-083** (`nutrition/tomato/plant-needs/spec.md`) — `PlantNeedsTomato.demandTotal` is canonical demand source.

Consume foliar output or govern tank behavior:

- **REQ-013 / REQ-014** (`nutrition/tomato/spec.md`) — supply chain bounds; foliar is one of four channels. Mn / Zn / Fe / Cu have no other channel while pH ≥ 7.
- **REQ-018** (`nutrition/spec.md`) — no decorative products at current pH; coverage discount cuts headline to ~30 %, fires if a product drops below 5 % effective after coverage.
- **REQ-022** (`nutrition/spec.md`) — Ecocert-allowed only. MnSO₄ / ZnSO₄ / CuSO₄ / Solubore / Na molybdate / FeSO₄·7H₂O all on CAN/CGSB-32.310/311. CaCl₂ (Spray B) removed 2026-05-06 (Teris industrial-grade listing unverified).
- **REQ-025** (`nutrition/spec.md`) — foliar tank predicted CE under burn cap (10 mS/cm tomato); wired in `scripts/check-recipes.mjs`.
- **REQ-053 / REQ-055** (`nutrition/spec.md`) — predicted tank pH + cuticle-pH multiplier. Tank pH ~5 (sulfate dominant), within `foliarPhResponse` peak 5.5-6.0.
- **REQ-061** (`nutrition/spec.md`) — cascade order. Foliar carries residual gap; Mn / Zn / Fe / Cu have no other channel today (sulfates precipitate at root-zone pH 7.4), so foliar IS the earliest active channel for those — verifier accommodates.
- **REQ-062** (`nutrition/spec.md`) — single foliar spray per week. `STORED_RECIPE.tomato.foliaire` carries exactly one spray-recipe key (`A`); enforced by REQ-062 verifier.
