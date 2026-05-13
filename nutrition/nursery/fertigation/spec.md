# Nursery weekly fertigation — specs

Salanova lettuce nursery, 50-cell trays, weekly fertigation in the watering
bucket. Three Ecocert products: EZ-GRO Ocean 15-1-1 (powder), Acadie Poisson
Hydrolysé 2-4-0.5 (liquid), Acadie Algues liquides (liquid). Owned data:
`NURSERY_PRODUCTS`, `NURSERY_FERTIGATION_DEFAULTS`, `NURSERY_RECIPE_DEFAULT`,
`NURSERY_CE_CAP_MS_CM`, `NURSERY_TANK_PH_RANGE`. Owned functions:
`nurseryRecipeSupply`, `nurseryRecipeCE`, `nurseryRecipeTankPh`.

Cross-crop nutrition rules (chemistry table, mass-balance shape, organic
cert rules) defer to `nutrition/spec.md`. Cross-app routing rules defer to
`requirements.md`.

Cert scale (canonical, defined in `nutrition/tomato/plant-needs/spec.md`):
0 pure guess → 5 rock-solid lab/instrument-grade.

---

## INV-1 — Element coverage via global REQ-029a/b/c

**Statement (invariant, not a numbered REQ):** Every product in
`NURSERY_PRODUCTS` declares `ions` and `chemistryTags` of the same shape as
the global `PRODUCT` table, so the global precipitation-and-tag classifiers
(`KSP_PAIRS`, `KSP_SAFE`, `TAG_INCOMPATIBILITIES`, `TAGS_INERT`) cover them
without modification.

**Rationale:** Adding a fish hydrolysate or kelp doesn't introduce new ions
beyond `NH4+`, `K+`, `organic-matrix` — all already classified. Inheriting
the global checks means a future product that DOES introduce a new ion
(silicate, phosphite) will fail REQ-029b/c at build time.

**Verification path:** Inherited from REQ-029a/b/c (`scripts/check-recipes.mjs`).
NURSERY_PRODUCTS feeds into the same enumeration via REQ-102 below.

---

## REQ-098 — Predicted solution CE under nursery cap

**Statement:** `nurseryRecipeCE(NURSERY_RECIPE_DEFAULT, 1) ≤ NURSERY_CE_CAP_MS_CM`
(= 3.0 mS/cm).

**Rationale:** Substrate EC post-watering target is 1.5–2.5 mS/cm (cert 4).
Solution EC in the bucket sets the upper bound — week-1 trays have the
smallest roots and the least osmotic-stress buffer; >3.0 mS/cm in the
bucket carries to >3.0 in the cell on the way down and drives germination
suppression on re-seedings. Hard cap at 3.0; if a future recipe needs to
push higher for tray-finishing (90–110 g target), recalibrate substrate-EC
side too. Cert 3 — the cap is operationally chosen, not measured against
yield drop.

**Verification:** Node verifier — `header('REQ-098 …')` +
`window.FertigationNursery.nurseryRecipeCE(NURSERY_RECIPE_DEFAULT, 1) ≤ 3.0`.

---

## REQ-099 — Predicted tank pH inside nursery envelope

**Statement:** `nurseryRecipeTankPh(NURSERY_RECIPE_DEFAULT)` ∈
`NURSERY_TANK_PH_RANGE` (= [4.5, 6.5]).

**Rationale:** Mirrors REQ-053's nursery row. Peat-based seedling substrate
buffers in the 4.5–6.5 range; bucket pH outside this band either stalls
microbial activity (>6.5) or cooks the substrate (<4.5). Cert 4 — peat-pH
match is well established.

**Verification:** Node verifier — `header('REQ-099 …')` +
`tankPh = nurseryRecipeTankPh(NURSERY_RECIPE_DEFAULT)`,
`tankPh ≥ 4.5 && tankPh ≤ 6.5`.

---

## REQ-100 — Default recipe N supply ≥ 50 % of nursery demand

**Statement:** `nurseryRecipeSupply(NURSERY_RECIPE_DEFAULT, NURSERY_FERTIGATION_DEFAULTS.trayVolumeL).perTray_mg.N`
≥ `0.5 × demandPerTray_N_mg`.

`demandPerTray_N_mg` comes from the sister subproject
`nutrition/nursery/plant-needs` via
`window.PlantNeedsNursery.demandPerTray('N')`. If that namespace isn't
loaded yet, the verifier falls back to the inline target **2 800 mg N /
tray / week** at 90 g target / 35-day cycle / 50 cells / DM 0.07 / tissue N
0.05. Cert 3 — derived from `LETTUCE_NURSERY_TISSUE_DW.N` × DW per plant ×
50.

**Rationale:** N is the rate-limiting macro for seedling growth on peat. A
recipe that fails to deliver half of demand from the bucket means the
plant either eats the peat starter charge (variable batch-to-batch) or
slows down. 50 % is a soft floor — full demand is the goal once tissue
tests come back; we won't push >100 % until then because of CE pressure.

**Verification:** Node verifier — `header('REQ-100 …')` + supply ≥ threshold.

---

## REQ-101 — Default recipe P supply ≥ 50 % of nursery demand

**Statement:** `nurseryRecipeSupply(NURSERY_RECIPE_DEFAULT, NURSERY_FERTIGATION_DEFAULTS.trayVolumeL).perTray_mg.P`
≥ `0.5 × demandPerTray_P_mg`. Inline fallback target **315 mg P / tray /
week** at 90 g / 35 d / 50 cells / DM 0.07 / tissue P 0.005.

**Rationale:** P is the second-most-important macro at the seedling stage
(root development). The substrate's peat starter charge is unreliable
post-2-3 waterings. Acadie poisson 2-4-0.5 is the P workhorse — its 1.75 %
P (label 4 % P₂O₅) is 4× Ocean's P concentration, so the recipe leans on
Acadie for P even though it's a low-N source. Cert 3.

**Verification:** Node verifier — `header('REQ-101 …')` + supply ≥ threshold.

---

## REQ-102 — `NURSERY_PRODUCTS` schema is complete and organic-only

**Statement:** Every entry in `NURSERY_PRODUCTS` has:
- `mode` ∈ {`flux`, `concentration`}        (mirrors REQ-010)
- `organicAllowed: true`                    (mirrors REQ-022)
- `ecFactor: <number>`                      (mirrors REQ-023; explicit 0 OK)
- `phContribution: <number>`                (mirrors REQ-053 schema half)
- `ions:        {…}` non-empty              (mirrors REQ-029a)
- `chemistryTags: […]` non-empty            (mirrors REQ-029a)

**Rationale:** The global REQ-022 / REQ-023 / REQ-029a / REQ-053-schema
checks scan `PRODUCT[*]`. They don't see `NURSERY_PRODUCTS`. Without REQ-102,
a new nursery product could be added with a missing field and slip past the
global checks because they don't know to look here. REQ-102 is the local
mirror that closes the loophole. Cert 5 — pure schema check, no calibration.

**Verification:** Node verifier — `header('REQ-102 …')` + per-field schema
walk.

---

## REQ-103 — `window.FertigationNursery` namespace exposed

**Statement:** `typeof window.FertigationNursery === 'object'` and the namespace
holds at least: `NURSERY_PRODUCTS`, `NURSERY_FERTIGATION_DEFAULTS`,
`NURSERY_RECIPE_DEFAULT`, `NURSERY_CE_CAP_MS_CM`, `NURSERY_TANK_PH_RANGE`,
`nurseryRecipeSupply`, `nurseryRecipeCE`, `nurseryRecipeTankPh`.

**Rationale:** The Salanova nursery admin page consumes this namespace; if it
disappears (file rename, build mis-include) the page silently goes blank for
the fertigation card. Loud-failure on missing public surface, by analogy to
REQ-080-class namespace checks. Cert 5.

**Verification:** Node verifier — `header('REQ-103 …')` + presence walk.

---

## REQ-122 — Recipe supply scales linearly with applicationsPerWeek

**Statement:** `nurseryRecipeSupply(recipe, trayVolumeL, applicationsPerWeek)`
accepts a fourth integer parameter `applicationsPerWeek ∈ [1, 7]` (default
`1` for backwards compatibility) and returns per-tray-per-week supply
totals scaled linearly: for every element `el`,
`supply(recipe, V, N).perTray_mg[el] === N × supply(recipe, V, 1).perTray_mg[el]`
within ±0.1 %.

**Rationale:** Single-fertigation EC cap (REQ-098, 3.0 mS/cm) caps the
salt load per bucket. To hit 100 % of weekly demand at the 90 g target on
elements like K (where the recipe needs ~7 g/L K₂SO₄ to deliver demand
in one application — well above EC budget), the recipe needs **frequency
as a degree of freedom**, not just dose. Splitting the same recipe across
multiple weekly applications keeps each bucket's EC under the cap while
multiplying the per-week supply.

**Verification:** Runtime test — call `nurseryRecipeSupply` at N=1 and N=2
with the same recipe, assert ratio == 2 ± 0.001 for every sourced element.
Cert 5 — structural linearity assertion.

---

## REQ-123 — `minApplicationsPerWeek` solves for 100 % coverage

**Statement:** `minApplicationsPerWeek(recipe, demandPerTray, trayVolumeL,
ceCap)` returns the smallest integer `N ∈ [1, 7]` such that
`N × per_fertigation_supply[el] ≥ demandPerTray[el]` for every element where
the recipe has a non-zero source. Returns `null` when no `N ≤ 7` satisfies
all sourced elements (recipe is dose-bound; needs higher per-bucket
concentrations or a different product mix). Returns the integer `1` when
already covered.

**Rationale:** Operational planning needs a clear answer to *"how often
must we mix this recipe to hit 100 % demand on the elements it covers?"*
Capped at `7` (daily) — beyond that is operationally implausible for the
nursery team's current routine. Hitting the `null` return signals that
frequency alone can't close the gap; recipe must change.

**Verification:** Runtime test — at default recipe + 90 g demand + 1.25 L
+ 3.0 mS/cm cap, `minApplicationsPerWeek` returns the integer ceiling of
`max(demand[el] / per_fert_supply[el])` over sourced elements; assert
returned value is finite and ≤ 7 OR explicitly `null`. Cert 4.

---

## REQ-124 — Element classification: sourced vs unsourced

**Statement:** `nurseryElementsBySource(recipe, demandPerTray)` returns
`{ sourced: string[], unsourced: string[] }`. An element is **sourced**
iff at least one product in `recipe` has `base[el] > 0` and a non-zero
dose — i.e. the recipe delivers any positive amount of that element per
fertigation. Otherwise **unsourced**. Whether the per-fert supply is
*enough* (at any frequency ≤ 7) to cover demand is a separate question
answered by `minApplicationsPerWeek` (REQ-123, returns `null` for
dose-bound elements).

**Rationale:** Two operationally distinct failure modes need different
interventions:
- **sourced + dose-bound** (e.g. K at default recipe — Ocean + Acadie +
  kelp all carry K, but per-fert supply × 7 < demand): increase per-fert
  dose (until EC binds), or add another K source.
- **unsourced** (e.g. Mo at default recipe — no product carries it):
  frequency and dose are both irrelevant; the recipe needs a new product.

The literal "any source" semantics keeps these two cases distinguishable.
A stricter "frequency can cover at N ≤ 7" check would lump them together
under "unsourced" and hide the difference from the operator.

**Verification:** Runtime test — at default recipe + 11-element demand,
assert `sourced` ⊇ {`N`, `P`, `K`} (recipe delivers all three);
`unsourced` ⊇ {`Mo`} (no product carries Mo); union covers the demand
key set with no overlap. Cert 4.

---

## REQ-125 — EC cap respected per-fertigation, not per-week

**Statement:** `nurseryRecipeCE(recipe, dilution)` is a function of recipe
composition and dilution only. It does NOT take `applicationsPerWeek` as
an input. The cap (REQ-098) binds *per fertigation event*; weekly
frequency is decoupled from per-bucket salt concentration.

**Rationale:** Salt damage to seedling roots is a *per-application*
concern — each watering deposits a slug of solution at the EC of the
bucket, which the cells then dilute via substrate water and, over hours,
mineralize. Increasing weekly frequency adds more events at the same
per-event EC; it doesn't raise the per-event EC. This is the chemistry
that makes frequency a useful degree of freedom in the first place.
Mixing the two would silently break the cap by treating cumulative weekly
EC as the bound.

**Verification:** Source-level assertion — `nurseryRecipeCE`'s signature
contains `recipe, dilution` only; no third frequency-related parameter.
Verifier greps the calc.js file or inspects the function's `.length`
property. Cert 5 — structural separation, no math.

---

## REQ-126 — `applicationsPerWeek` is a positive integer

**Statement:** Every API consuming `applicationsPerWeek` (REQ-112,
REQ-113) accepts only integers in `[1, 7]`. Non-integer or out-of-range
inputs are rejected (throw or clamp-then-warn — implementation choice).
`minApplicationsPerWeek` always returns `null` or an integer in this
range; never a fractional or zero value.

**Rationale:** Operational reality — the team can't fertigate 1.5×/sem or
0.7×/sem. The discrete cadence options that work in practice are 1, 2, 3
(every other day), 4-5 (most weekdays), 7 (daily). Fractional values are
a model leak: they look like solutions but can't be executed. Better to
round up to the next integer cadence the team can actually run.

**Verification:** Runtime test — pass `applicationsPerWeek: 2.5`, assert
rejection or rounding (project picks one); pass `0` or `8`, assert
rejection. Cert 5 — input-domain assertion.

---

## Inherited specs

These cross-crop rules apply automatically — no nursery-specific check needed,
but listing them here so a reader of this file knows what's already enforced
by the verifier upstream:

- **REQ-022** — every product organicAllowed: true (CAN/CGSB-32.311)
- **REQ-028** — cert annotation on every empirical constant (visible in `data.js`)
- **REQ-029a/b/c** — ions + chemistryTags + classification table coverage
- **REQ-053** — predicted tank pH inside compartment envelope (nursery row 4.5–6.5)

If a future change to `NURSERY_PRODUCTS` introduces a new ion or chemistry
tag, the global REQ-029b / REQ-029c checks flag it before the build passes.
