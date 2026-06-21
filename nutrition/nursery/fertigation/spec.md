# Nursery weekly fertigation — specs

Salanova lettuce nursery, 50-cell trays, weekly fertigation in the watering
bucket. Three Ecocert products: EZ-GRO Ocean 15-1-1 (powder), Acadie Poisson
Hydrolysé 2-4-0.5 (liquid), Acadie Algues liquides (liquid). Owned data:
`NURSERY_PRODUCTS`, `NURSERY_FERTIGATION_DEFAULTS`, `NURSERY_RECIPE_DEFAULT`,
`NURSERY_CE_CAP_MS_CM`, `NURSERY_TANK_PH_RANGE`. Owned functions:
`nurseryRecipeSupply`, `nurseryRecipeCE`, `nurseryRecipeTankPh`.

Cross-crop nutrition rules defer to `nutrition/spec.md`; routing to
`spec.md`. Cert scale canonical in
`nutrition/tomato/plant-needs/spec.md` (0 guess → 5 lab-grade).

---

## INV-1 — Element coverage via global classifiers

**Statement (invariant, not a numbered REQ):** Every product in
`NURSERY_PRODUCTS` declares `ions` and `chemistryTags` of the same shape as
global `PRODUCT`, so global classifiers (`KSP_PAIRS`, `KSP_SAFE`,
`TAG_INCOMPATIBILITIES`, `TAGS_INERT`) cover them without modification. A
future product introducing a new ion (silicate, phosphite) fails
nutrition/chemistry — every-cation-anion-pair-classified / every-chemistry-tag-classified at build.

---

## predicted-ce-under-nursery-cap

**Statement:** `nurseryRecipeCE(NURSERY_RECIPE_DEFAULT, 1) ≤ NURSERY_CE_CAP_MS_CM`
(= 1.0 mS/cm).

**Rationale:** Domain seedling root-zone band is target 1.0–1.2, hold feed
> 1.5 (young roots salt-sensitive; `nutrition/lettuce/domain.md`). The cell
concentrates ~1.5× above the bucket feed as it dries between weekly feeds
(cert 2 dry-down estimate), so a 1.0 bucket cap keeps the cell peak near the
1.5 hold line, targeting ~1.2. Per-feed leaching (`nutrition/nursery/protocol/salt-flush.md`)
resets weekly accumulation; pour-through EC is the cell ground truth.
Cap lowered 3.0 → 1.0 (2026-06-20) — the prior 1.5–2.5 substrate band was
rejected by the field (leachate 5+, Na 3166, tip-burn). Cert 2 — dry-down
factor not yet measured.

---

## predicted-tank-ph-in-nursery-envelope

**Statement:** `nurseryRecipeTankPh(NURSERY_RECIPE_DEFAULT)` ∈
`NURSERY_TANK_PH_RANGE` (= [4.5, 6.5]).

**Rationale:** Peat-based seedling substrate buffers in 4.5–6.5; outside
stalls microbes (>6.5) or cooks substrate (<4.5). Cert 4. `nurseryRecipeTankPh`
defaults waterPh to the real Décembre source 6.26 (Berger 2026-04-10), not a
generic 7.0 — the lean salt-control recipe adds little acid, so the source pH
is what holds the tank in band (predicted 5.83).

---

## n-supply-half-demand-floor

**Statement:** `nurseryRecipeSupply(NURSERY_RECIPE_DEFAULT, NURSERY_FERTIGATION_DEFAULTS.trayVolumeL).perTray_mg.N`
≥ `0.5 × demandPerTray_N_mg`.

`demandPerTray_N_mg` from `window.PlantNeedsNursery.demandPerTray('N')`, which
reads `targetG_default` (= 20 g since 2026-06-20) → demand ~700 mg N/tray/wk,
floor ~350 mg. If namespace not loaded, verifier falls back to inline 3 150 mg
(90 g reference — stale vs the live 20 g default; only hit if the namespace is
absent). Cert 3 — `LETTUCE_NURSERY_TISSUE_DW.N` × DW per plant × 50.

**Rationale:** N is rate-limiting macro for seedling growth on peat. <50 %
from bucket means plant eats peat starter charge (variable batch-to-batch)
or slows. 50 % is soft floor; full demand is goal once tissue tests come
back. At the 20 g target the salt-safe feed clears the floor with room
(supply ~412 mg ≥ 350).

---

## default-recipe-p-supply-half-demand

**Statement:** `nurseryRecipeSupply(NURSERY_RECIPE_DEFAULT, NURSERY_FERTIGATION_DEFAULTS.trayVolumeL).perTray_mg.P`
≥ `0.5 × demandPerTray_P_mg`. Live demand at the 20 g default ~70 mg P/tray/wk
→ floor ~35 mg; supply ~44 mg clears it. Inline fallback 315 mg (90 g
reference) only if namespace absent. Cert 3.

**Rationale:** P is second-most-important seedling macro (root
development); peat starter charge unreliable post-2-3 waterings. Acadie
poisson 2-4-0.5 is P workhorse — 1.75 % P (label 4 % P₂O₅) is 4× Ocean's.

---

## products-schema-complete-organic-only

**Statement:** Every entry in `NURSERY_PRODUCTS` has:
- `mode` ∈ {`flux`, `concentration`}        (mirrors nutrition/chemistry — recipe-mode-per-product)
- `organicAllowed: true`                    (mirrors nutrition/chemistry — every-product-ecocert-allowed)
- `ecFactor: <number>`                      (mirrors nutrition/chemistry — ec-factor-covers-every-product; explicit 0 OK)
- `phContribution: <number>`                (mirrors nutrition/chemistry — predicted-tank-ph-within-envelope schema half)
- `ions:        {…}` non-empty              (mirrors nutrition/chemistry — product-declares-ions-and-chemistry-tags)
- `chemistryTags: […]` non-empty            (mirrors nutrition/chemistry — product-declares-ions-and-chemistry-tags)

**Rationale:** Global nutrition/chemistry — every-product-ecocert-allowed / ec-factor-covers-every-product / product-declares-ions-and-chemistry-tags / predicted-tank-ph-within-envelope-schema checks scan
`PRODUCT[*]`, not `NURSERY_PRODUCTS`. `products-schema-complete-organic-only` is the local mirror that
closes the loophole. Cert 5 — pure schema check.

---

## fertigation-nursery-namespace

**Statement:** `typeof window.FertigationNursery === 'object'` and holds at
least: `NURSERY_PRODUCTS`, `NURSERY_FERTIGATION_DEFAULTS`,
`NURSERY_RECIPE_DEFAULT`, `NURSERY_CE_CAP_MS_CM`, `NURSERY_TANK_PH_RANGE`,
`nurseryRecipeSupply`, `nurseryRecipeCE`, `nurseryRecipeTankPh`.

**Rationale:** Salanova nursery admin page consumes this namespace;
silent disappearance on rename/build mis-include would blank the
fertigation card. Loud-failure by analogy to nutrition/compost-contribution — public-api-namespace-class checks. Cert 5.

---

## supply-scales-linearly-with-applications

**Statement:** `nurseryRecipeSupply(recipe, trayVolumeL, applicationsPerWeek)`
accepts a fourth integer `applicationsPerWeek ∈ [1, 7]` (default `1`) and
returns per-tray-per-week totals scaled linearly: for every element `el`,
`supply(recipe, V, N).perTray_mg[el] === N × supply(recipe, V, 1).perTray_mg[el]`
within ±0.1 %.

**Rationale:** Per-bucket EC cap (predicted-ce-under-nursery-cap, 3.0 mS/cm) caps salt load per
event. Hitting 100 % demand on elements like K (~7 g/L K₂SO₄ needed in one
shot — above EC budget) requires **frequency as a degree of freedom**, not
just dose. Splitting the recipe across multiple weekly applications keeps
each bucket under cap while multiplying weekly supply.

---

## min-applications-solves-full-coverage

**Statement:** `minApplicationsPerWeek(recipe, demandPerTray, trayVolumeL,
ceCap)` returns smallest integer `N ∈ [1, 7]` such that
`N × per_fertigation_supply[el] ≥ demandPerTray[el]` for every element
where the recipe has a non-zero source. Returns `null` when no `N ≤ 7`
satisfies all sourced elements (recipe is dose-bound; needs higher
per-bucket concentrations or different product mix). Returns `1` when
already covered.

**Rationale:** Capped at `7` (daily) — beyond is operationally implausible.
`null` signals frequency alone can't close the gap; recipe must change.

---

## elements-sourced-vs-unsourced

**Statement:** `nurseryElementsBySource(recipe, demandPerTray)` returns
`{ sourced: string[], unsourced: string[] }`. **Sourced** iff at least one
product in `recipe` has `base[el] > 0` and a non-zero dose — recipe
delivers any positive amount per fertigation. Otherwise **unsourced**.
Whether per-fert supply is *enough* (at any frequency ≤ 7) is a separate
question answered by `minApplicationsPerWeek` (`min-applications-solves-full-coverage` returns `null` for
dose-bound elements).

**Rationale:** Two distinct failure modes need different interventions:
- **sourced + dose-bound** (e.g. K at default — Ocean + Acadie + kelp all
  carry K, but per-fert × 7 < demand): increase dose (until EC binds) or
  add another K source.
- **unsourced** (e.g. Mo at default — no product carries it): frequency
  and dose irrelevant; recipe needs a new product.

Literal "any source" semantics keeps these distinguishable.

---

## ec-cap-per-fertigation-not-per-week

**Statement:** `nurseryRecipeCE(recipe, dilution)` is a function of recipe
composition and dilution only. It does NOT take `applicationsPerWeek` as
input. The cap (predicted-ce-under-nursery-cap) binds *per fertigation event*; weekly frequency
is decoupled from per-bucket salt concentration.

**Rationale:** Salt damage is *per-application* — each watering deposits a
slug at bucket EC. More events at same per-event EC ≠ higher per-event EC.
This chemistry is what makes frequency a useful degree of freedom. Mixing
the two would silently break the cap.

---

## applications-per-week-positive-integer

**Statement:** Every API consuming `applicationsPerWeek`
accepts only integers in `[1, 7]`. Non-integer or out-of-range rejected
(throw or clamp-then-warn — implementation choice). `minApplicationsPerWeek`
always returns `null` or an integer in this range; never fractional/zero.

**Rationale:** Team can't fertigate 1.5×/sem. Discrete cadences that work
in practice: 1, 2, 3 (every other day), 4-5 (most weekdays), 7 (daily).
Fractional values look like solutions but can't be executed.

---

## Inherited specs

Cross-crop rules already enforced upstream by verifier:

- **nutrition/chemistry — every-product-ecocert-allowed** — every product organicAllowed: true (CAN/CGSB-32.311)
- cert annotation on every empirical constant
- **nutrition/chemistry — product-declares-ions-and-chemistry-tags / every-cation-anion-pair-classified / every-chemistry-tag-classified** — ions + chemistryTags + classification table coverage
- **nutrition/chemistry — predicted-tank-ph-within-envelope** — predicted tank pH inside compartment envelope (nursery row 4.5–6.5)

A new ion or chemistry tag introduced in `NURSERY_PRODUCTS` is flagged by
global nutrition/chemistry — every-cation-anion-pair-classified / every-chemistry-tag-classified before build passes.
