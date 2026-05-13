# Tomate — foliar-recipe

Specs for the model that **delivers the weekly foliar oligo spray** —
Mn / Zn / Cu / Mo / Fe (and historically Solubore B, Ca via Spray B before
2026-05-06). The model takes a stage and returns the per-element
mg/m²/wk delivered to the plant via cuticle uptake, after a coverage
discount.

This file is the *spec* (what the model must do or be). The framing
(burn-cap-constrained vs mass-balance-derived), per-element delivered
table, no-yucca trade-off, refinement triggers and implementation map
live in `derivation.md` next door. The operational *stored* spray that
the team mixes (`STORED_RECIPE.tomato.foliaire`) is governed by the
`/retire-recipe` audit-trail skill, not by this spec.

The model answers exactly one question: **"how much of element X
arrives at the plant per m² per week from the spray at stage S, after
cuticle-coverage losses?"**

It does NOT answer:
- What dose to weigh into the backpack (that's `STORED_RECIPE.tomato.foliaire`,
  hand-locked to PA Taillon's April 2026 recommendation as adjusted for
  the no-yucca regime; edits go through `/retire-recipe`).
- Whether the recipe meets demand (that's the supply chain — the foliar
  output here is one of four channels summed against demand under
  REQ-013/014 in `nutrition/tomato/spec.md`).
- The first-principles dose that would meet demand — **foliar is
  burn-cap-constrained, not mass-balance-derived**. There is no FP
  derivation that grows freely with demand: the dose is pinned at the
  maximum that the cuticle tolerates without surfactant, then delivery
  is computed under the coverage discount and validated against demand
  band. See `derivation.md`.

Cross-channel scope: foliar is the LAST channel in the weekly
replenishment chain (compost → sidedress → fertigation → foliar) and
the only one that bypasses root-zone chemistry. That makes it the
single most important lever during the current pH-lockout crisis for
Mn / Zn / Fe / Cu. The chain itself is in `nutrition/tomato/spec.md`
(REQ-013 / REQ-014 supply bounds, REQ-061 cascade order).

---

## Contract

### Inputs

| Name      | Type   | Range                            | Source                            |
|-----------|--------|----------------------------------|-----------------------------------|
| `stage`   | string | `T1` / `T2` / `T3` / `T4` / `T5` | Tomato production stage selector  |

The current STORED foliar recipe is stage-invariant (PA Taillon design —
oligos are tissue-baseline anchored, not yield-scaled). The `stage`
argument is plumbed through anyway so the contract stays uniform with
sidedress / fertigation siblings, and so a future stage-aware spray can
land without changing call sites.

### Output

`computeFoliarSupply(stage)` returns the per-element mg/m²/wk delivered:

```js
{ N: 0, P: 0, K: 0, Ca: 0, Mg: 0,
  Fe: number, Mn: number, Zn: number, B: number, Cu: number, Mo: number }
```

All masses in **mg per m² per week** at the tomato bed area
(`TOMATO_NUM_BEDS × TOMATO_BED_AREA = 382.9 m²`). Macros (N / P / K / Ca / Mg)
are explicit zeros — the current oligo spray carries no macros, and
foliar physiology bars N / P / Ca / Mg from being viable foliar channels
(see `derivation.md` "no-macro by design"). Element coverage stays
closed at the 11 canonical elements present in `TOMATO_FRUIT_EXPORT`.

---

## Cert scale

Same single-cert transferability scale as
`nutrition/tomato/plant-needs/spec.md` ("Cert scale" section — canonical).

---

## INV-1 — Element coverage is closed

For every stage in `RECIPE_INPUTS.stageYield`, `computeFoliarSupply(stage)`
returns numeric, finite, non-negative values for every element in
`TOMATO_FRUIT_EXPORT` (currently 11). No `undefined`, `NaN`, or negative
values.

**Verification:** `scripts/check-recipes.mjs` — call once per stage and
assert the shape + non-negativity.

---

## REQ-101 — Coverage discount applied to foliar delivery

For each element in the spray and each stage, the delivered mg/m²/wk
equals:

```
delivered_mg/m²/wk = (recipe_g × element_pct × 1000) / area_m² × FOLIAR_COVERAGE_DEFAULT
```

where `FOLIAR_COVERAGE_DEFAULT = 0.30` while the program operates
without a surfactant (yucca decision 2026-05-05, not on order).

**Rationale:** Without yucca, droplet beading + runoff leaves only ~30 %
of the spray's active mass in cuticular contact long enough for uptake.
Reporting label dose as "delivered" overstates supply by ~3.3× and
silently hides under-fert when the Bilan compares supply to demand.
Wiring the discount into `computeFoliarSupply` makes the foliar branch
honest by construction; flipping back to ~80 % is a one-line edit
(yucca decision) that automatically propagates everywhere foliar supply
is read. Tied to REQ-018 (no decorative products): a foliar product
falling below 5 % effective uptake at the current coverage must be
flagged or removed.

**Verification:** `scripts/check-recipes.mjs` REQ-101 — for two pinned
elements (Mn, Fe), recompute the formula from
`STORED_RECIPE.tomato.foliaire` × `PRODUCT_PCT.{MnSO4_Mn, FeSO4_Fe}` ×
`FOLIAR_COVERAGE_DEFAULT` / area and assert
`computeFoliarSupply('T5').{Mn, Fe}` matches within 1 % of the expected
value. Mn pins the surfactant-coverage logic; Fe pins the Fe-specific
PRODUCT_PCT path (FeSO₄·7H₂O 20 % Fe).

**Cert:** 4 (coverage % is from cuticle-uptake literature ranges 25-40 %
without surfactant; pinned at 30 % matches operator observation of
runoff at current dose; transferable to similar tomato-leaf morphology).

---

## REQ-103 — Public API namespace `window.FoliarRecipeTomato`

At runtime, `window.FoliarRecipeTomato` exists and exposes:

| Key                              | Type     |
|----------------------------------|----------|
| `AREA_M2`                        | number   |
| `FOLIAR_COVERAGE_DEFAULT`        | number   |
| `FOLIAR_COVERAGE_WITH_YUCCA`     | number   |
| `computeFoliarSupply`            | function |

**Rationale:** Same as `PlantNeedsTomato` (REQ-083),
`SidedressRecipeTomato` (REQ-088), `CompostContribution` (REQ-080).
Consumers (Bilan supply chain, "Recette proposée" admin card, future
yucca-decision drift gauge) read foliar supply through this namespace
so internals can be reshaped (yucca on/off, per-stage dose differentiation,
addition of B back to foliar) without breaking call sites.

**Verification:** `scripts/check-recipes.mjs` REQ-103 — namespace
presence + key set + spot-check that `computeFoliarSupply('T5').Fe`
returns a positive finite number.

**Cert:** 5 (structural assertion).

---

## REQ-115 — `computeFoliarRecipeForGap(gap, opts)` builds gap-maximizing recipe

**Statement:** The model exposes
`computeFoliarRecipeForGap(gap, { sprayCount = 1, surfactant = false } = {})`
which returns a foliar recipe per 15 L master tank, sized to maximize
coverage of `gap` (per-element residual mg/m²/wk) subject to a per-element
burn cap, a per-tank predicted-CE cap (REQ-025), and an operational
dosing floor.

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

**Surfactant scope — coverage axis only:**

Surfactant affects cuticle penetration / coverage (REQ-101 0.30 → 0.80
with yucca, cert 4 — Sentís et al. *Crop Protection* 2017). It does
**not** affect the burn-cap axis: `burnCapG(el, _surfactant) =
BURN_CAP_BASE_G[el]` regardless of surfactant flag. Rejected
alternative (per-element multiplier with surfactant override) is in
`learnings.md`.

**Rationale:** Foliar recipe was burn-cap-pinned in the static model —
implicitly assumed gap = residual after upstream channels. That coupling
broke when sprayCount and surfactant became operator levers. A gap-
maximizing derivation closes the loop: levers + upstream state → recipe.
The CE-cap-and-scale guarantees REQ-025 stays satisfied even when ideal
doses aggregate above the per-element bound. The min-dose clamp
prevents operationally-absurd recipes (e.g., 0.0003 g Mo).

**Verification:** `scripts/check-recipes.mjs` REQ-115 — three behavioral
assertions:
- Tiny gap (every element 0.001 mg/m²/wk) → all doses = 0 (min-dose clamp).
- Huge gap (every element 1000 mg/m²/wk) → every element clipped to its
  `burnCapG(el)`.
- Predicted tank CE on every returned recipe ≤ REQ-025 cap.

**Cert:** 3 (research-grounded surfactant framing + per-element burn-cap
base values from foliar-uptake literature mid-band, refinable when
Décembre tissue + lesion data lands —
that refinement is deferred per the spec-discipline principle).

---

## REQ-116 — FP foliar recipe is live-derived from current residual gap

**Statement:** At Bilan render time, the FP-mode foliar recipe shown in
Block 5 (and consumed by Block 7 drift gauge vs `STORED_RECIPE.tomato.foliaire`)
is computed by calling `computeFoliarRecipeForGap` with the residual gap
**after compost + sidedress + fertigation are applied**. No hand-pinned
`FP_RECIPE_T5.foliaire` literal. Updates whenever any upstream supply
or operator lever changes.

**Rationale:** Today FP foliar mirrors stored — drift gauge is
uninformative for the foliar channel. Live derivation makes drift
meaningful: stored ≠ derived means the operator is leaving gap coverage
on the table or risking burn vs the FP target. Block 7 becomes
actionable for foliar.

**Verification:** `scripts/check-recipes.mjs` REQ-116 — call
`calcNutrSupply('T5', true, 1.0, 1.5, 'fp')` to capture baseline
`FP_RECIPE_T5.foliar.MnSO4`, then bump `window.CompostContribution
.releasePerWeek.Mn` to 1.0 g/m²/wk (≫ Mn demand), call `calcNutrSupply`
again, and assert `FP_RECIPE_T5.foliar.MnSO4 = 0` (gap closed → min-dose
clamp). Restores the original compost value and re-runs once at
baseline so canonical state is preserved for downstream tests. This
exercises the full integration: pre-foliar gap from compost + sidedress
+ fertigation, gap → `computeFoliarRecipeForGap`, mutation of
`FP_RECIPE_T5.foliar` consumed by Block 5 / Block 7 / "Recette
proposée".

**Cert:** 4 (structural — derivation chain).

---

## REQ-112 — `computeFoliarSupply` accepts spray count + surfactant

**Statement:** Function signature is
`computeFoliarSupply(stage, { sprayCount = 1, surfactant = false } = {}, recipe?)`.
`sprayCount` is clamped to integer 1-3 at the model boundary. The optional
third argument `recipe` is a label-string array (same shape as
`STORED_RECIPE.tomato.foliaire.A`) and defaults to that stored recipe when
omitted, so the function stays a single source of truth for the supply
formula across stored-mode and FP-mode callers. Output:

```
delivered_per_element = single_spray_delivery × sprayCount × coverage_factor
coverage_factor = surfactant ? FOLIAR_COVERAGE_WITH_YUCCA : FOLIAR_COVERAGE_DEFAULT
```

Calling `computeFoliarSupply(stage)` without opts returns today's numbers
exactly (defaults match the prior single-arg behavior).

**Rationale:** Two operationally real levers the model didn't expose.
Spray count is a recipe-cadence knob the team uses on Mn / Fe spike
weeks. Surfactant toggles between the documented coverage constants
that already lived in `data.js` but were unused — putting the lever in
the operator's hands closes that gap.

Out of scope: burn-cap warning when surfactant=false but recipe was
sized with surfactant in mind. That's a recipe-sizing concern governed
by `/retire-recipe` + REQ-025, not by this toggle.

**Verification:** `scripts/check-recipes.mjs` REQ-112 — calls
`computeFoliarSupply('T5')`, `…('T5', { sprayCount: 2 })`,
`…('T5', { surfactant: true })`, plus the same triplet against an
explicit stub `recipe` argument. Asserts (a) defaults match the prior
numbers, (b) sprayCount=2 doubles every element, (c) surfactant=true
multiplies by exactly `FOLIAR_COVERAGE_WITH_YUCCA / FOLIAR_COVERAGE_DEFAULT`,
(d) the same multiplicative behavior holds when an explicit `recipe`
label-string array is passed (pinning the recipe-agnostic property).

**Cert:** 5 (structural).

---

## Pending — yucca-coverage refinement trigger

The single biggest lever in this subproject. If yucca surfactant
returns to the program, `FOLIAR_COVERAGE_DEFAULT` flips
`0.30 → 0.80` and every element's effective delivery jumps
~2.7×. RECIPE_HISTORY context: when yucca was dropped (decision
2026-05-05), Cu was cut 4 → 2 g, Mn 22 → 18 g, Zn 22 → 16 g to stay
under burn cap without the dispersing benefit of yucca. Restoration
would also relax those dose limits (re-evaluate against REQ-025 burn
cap with the higher per-element loads).

When wired: capture the decision via `/retire-recipe` (the doses change
inside `STORED_RECIPE.tomato.foliaire` — that's the trigger), then
flip `FOLIAR_COVERAGE_DEFAULT` here. Both are mechanical, but the
recipe edit must come first so the audit-trail snapshot lands on the
old recipe.

---

## Inherited specs

Foliar consumes plant-needs offtake to validate delivery against demand:

- **REQ-083** (`nutrition/tomato/plant-needs/spec.md`) —
  `PlantNeedsTomato.demandTotal` is the canonical demand source.

Specs that *consume* the foliar output OR that govern foliar tank
behavior independently:

- **REQ-013 / REQ-014** (`nutrition/tomato/spec.md`) — supply chain
  bounds. Foliar is one of four channels summed against demand. Foliar
  micros (Mn / Zn / Fe / Cu) are the only channel left while pH stays
  ≥ 7 — under-fert here surfaces as visible deficiency.
- **REQ-018** (`nutrition/spec.md`) — no decorative products at current
  pH. The coverage discount in REQ-101 cuts headline efficiency to
  ~30 % across the board; if a future product drops below the 5 %
  effective threshold *after* coverage, REQ-018 fires.
- **REQ-022** (`nutrition/spec.md`) — every product is Ecocert-allowed.
  MnSO₄ / ZnSO₄ / CuSO₄ / Solubore / Na molybdate / FeSO₄·7H₂O all on
  the certified-input list (CAN/CGSB-32.310/311). CaCl₂ (Spray B) was
  removed 2026-05-06 because the Teris industrial-grade listing
  couldn't be verified — REQ-022 in spirit even though the live recipe
  no longer carries it.
- **REQ-025** (`nutrition/spec.md`) — foliar tank predicted CE under
  burn cap (10 mS/cm tomato). This subproject does NOT define its own
  burn-cap REQ; the cross-crop REQ-025 already wires it in
  `scripts/check-recipes.mjs`. Editing foliar doses (via `/retire-recipe`)
  must keep the recipe under the cap or that check fires.
- **REQ-053 / REQ-055** (`nutrition/spec.md`) — predicted tank pH +
  cuticle-pH multiplier. Foliar tank pH lands ~5 (sulfate dominant),
  in the cuticle-uptake sweet spot (`foliarPhResponse` peaks 5.5-6.0).
  The current spray is well-positioned on this axis; the coverage
  discount in REQ-101 captures the *non*-pH part of effective
  efficiency.
- **REQ-061** (`nutrition/spec.md`) — cascade order. Foliar is the last
  channel; should only carry the residual gap. Mn / Zn / Fe / Cu have
  no other channel today (sulfates precipitate at root-zone pH 7.4),
  so foliar IS the earliest active channel for those elements —
  REQ-061's verifier already accommodates this.
- **REQ-062** (`nutrition/spec.md`) — single foliar spray per week.
  `STORED_RECIPE.tomato.foliaire` carries exactly one spray-recipe key
  (`A`); enforced by REQ-062's verifier.
