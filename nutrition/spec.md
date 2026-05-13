# Nutrition — cross-crop specs

Cross-crop nutrition specs (chemistry, products, mass-balance framing,
organic certification rules, anything not crop-specific). Each spec is
testable; the release-candidate validator (`scripts/check-requirements.sh`)
verifies them automatically before a push.

Crop-specific nutrition specs live in:

- `nutrition/tomato/spec.md` — tomato model/recipe/biology
- `nutrition/tomato/app/spec.md` — Tomato Nutrition page UI
- `nutrition/lettuce/spec.md` — Salanova post-transplant nutrition
- `nutrition/lettuce/app/spec.md` — Salanova subpage UI
- `nutrition/nursery/spec.md` — Semis laitue nutrition
- `nutrition/nursery/app/spec.md` — Semis subpage UI

Cross-crop subprojects:

- `nutrition/compost-contribution/spec.md` — weekly per-element release from past compost amendments (Savaria ORGANIMIX fall 2025). Owns `window.CompostContribution`.
- `nutrition/soil-contribution/spec.md` — weekly per-element draw from the resident Mehlich-3 soil bank + months-to-depletion runway. Owns `window.SoilContribution`.

---

## REQ-002 — Ecocert-only product mentions

**Statement:** Recommendations or product mentions surfaced to the team must
be Ecocert Canada (CAN/CGSB-32.310/311) compliant. Non-approved alternatives
should not appear in the app, even for "what-if" framing.

**Rationale:** Décembre is a certified organic operation. Surfacing
non-approved options forces the user to mentally filter every recommendation
and creates audit risk if a non-approved input gets ordered by mistake.

**Verification:** Node verifier scans non-comment lines of `index.html` against
the `FORBIDDEN_PRODUCTS` blocklist defined in `scripts/check-recipes.mjs`. Any
case-insensitive substring match fails the check. Code comments, `<!-- -->`
blocks, and traceability notes (e.g., explaining WHY a product isn't used) are
excluded. Curated list — not exhaustive; covers high-risk synthetics (urea,
mono-ammonium phosphate, di-ammonium phosphate, potassium chloride, Fe-EDTA,
glyphosate, etc.). Add new forbidden products to the blocklist as the team
encounters edge cases.

---

## REQ-009 — Weekly solar radiation matches 20-year averages

**Statement:** The `SOLAR_BY_WEEK` array in `index.html` MUST contain the
published 20-year-average weekly solar radiation values for Quebec City
greenhouse, J/cm²/week, for ISO weeks 1-18:

| Week | J/cm²/wk | Week | J/cm²/wk | Week | J/cm²/wk |
|---|---|---|---|---|---|
| 1 | 2 695 | 7 | 6 125 | 13 | 10 290 |
| 2 | 2 940 | 8 | 6 860 | 14 | 10 780 |
| 3 | 3 430 | 9 | 7 595 | 15 | 11 270 |
| 4 | 3 920 | 10 | 8 330 | 16 | 11 760 |
| 5 | 4 655 | 11 | 9 065 | 17 | 12 250 |
| 6 | 5 390 | 12 | 9 660 | 18 | 12 740 |

**Rationale:** Solar drives transpiration, which drives mass-flow uptake
in the Bilan. A 30% solar error → ~30% soil-supply error, which silently
misleads decisions. The 20-year weekly averages are the most stable
benchmark available — using them removes 50%+ errors that the previous
monthly approximation introduced (especially Jan-Feb).

**Why weekly, not monthly:** monthly averages are dominated by the
brighter end of the month. Week 1 (early Jan) at 2 695 J/cm²/wk vs the
old monthly January approximation of 4 200 — a 56% gap. By April-May the
gap narrows to ~10%, but in a per-week mass-flow model, week 1's gap
matters as much as week 18's.

**Scope today:**

- Weeks 1-18 are pinned to these 20-year values (cert 5).
- Weeks 19-52 fall back to the monthly approximation (`SOLAR_BY_MONTH`)
  until the weekly array is extended. Cert drops to 3 for those weeks.
- Source: 20-year Quebec City weekly averages, provided 2026-05.

**Verification:** `check-requirements.sh` greps `index.html` for each of
the 18 expected `value, // week N` lines. If any are missing or modified,
the check fails. Pattern per week:
`^\s+VALUE,\s*//\s*week\s+N\b` (whitespace-tolerant).

**When extending to weeks 19-52:** add the values to `SOLAR_BY_WEEK` and
extend the verification array in `check-requirements.sh`. Update the
table above.

---

# Recipe-model architecture (REQ-010 through REQ-032)

**Status: target spec, not currently wired.** REQ-010 through REQ-032 are
the spec for a first-principles recipe model (`PRODUCT`, `CHANNEL_ROLE`,
`PH_RESPONSE`, `EC_FACTOR`, `computeRecipe`, `effectiveEff`, `predictedCE`)
that doesn't exist yet. Verification scripts land as each piece of the
model lands. Until then these serve as the design contract — every
implementation step closes one or more specs.

The model splits delivery into two computation paths:

- **Flux-driven**: dose = (demand − passive supply − cross-channel supply) / efficiency.
  Examples: fertigation K, side-dress N, front-load P.
- **Concentration-driven**: dose = tank_volume × target_concentration / product_analysis.
  Examples: foliar CaCl₂ for BER, foliar Mn/Zn for lockout bypass, yucca surfactant.

These paths are verified by different specs (REQ-013/014 vs REQ-015) and
must never be conflated.

---

## REQ-010 — Recipe mode declared per product

**Statement:** Every product entry in `PRODUCT` has `mode: 'flux' | 'concentration'`.
Flux-mode products participate in the demand-supply balance (REQ-013/014).
Concentration-mode products participate in the tank-concentration envelope (REQ-015).

**Rationale:** Conflating them silently corrupts the model — pretending all
recipes are flux-driven means a well-supplied soil tells you to skip BER
spray, which fails on translocation, not flux. Splitting the math forces
honest reasoning per product.

**Verification:** Script asserts every `PRODUCT[*].mode` is set and is
one of the two values.

---

## REQ-012 — No double flux-ownership

**Statement:** For each flux-driven element, the channel fractions in
`CHANNEL_ROLE` sum to 1.0 ± 0.05.

**Rationale:** Two channels each claiming "I supply 100% of K" double-counts
the supply side; the recipe gets halved silently when both are evaluated.
Same problem if total falls short of 1.0 — the gap is invisible until tissue
test catches it.

**Verification:** Runtime test sums fractions per element, asserts within band.

---

## REQ-015 — Concentration-driven dose within efficacy/safety band

**Statement:** For every concentration-mode product in any recipe, the
in-tank concentration of its active element falls within `[efficacy_min,
safety_max]` declared in `PRODUCT[product]`.

**Rationale:** A BER spray below efficacy = wasted spray. A Cu spray above
safety = leaf burn. Flux-driven check (REQ-013) is irrelevant for these
products; they need their own envelope.

**Verification:** Runtime test reads each foliar/spot recipe, computes
[active element]/[tank volume] in g/L, asserts within band.

---

## REQ-017 — pH-aware effective efficiency

**Statement:** Soil-applied channels (fertigation, sidedress, frontload)
compute supply as `recipe_mass × base_efficiency × phResponse[phClass](currentSoilPh)`.
The `PH_RESPONSE` table contains a curve for every named `phClass`
referenced by any product.

**Rationale:** At pH 7.4, FeSO₄ is ~10% effective in soil vs Fe-EDDHA ~95%.
A model ignoring pH treats them as equivalent — they aren't. Bilan must
show the real, pH-dependent supply so the team sees the unlock land as
sulfur drops pH.

**Verification:** Script asserts `effectiveEff` function exists and
multiplies `base × phResponse[phClass](currentPh)`. Asserts every `phClass`
referenced has a `PH_RESPONSE` entry.

---

## REQ-018 — No "decorative" products at current pH

**Statement:** For every product in an active recipe, `effectiveEff(product,
element, currentSoilPh) ≥ 0.05`. Products below 5% effective efficiency
must be removed from the recipe or flagged with `decorative: { reason: '...' }`.

**Rationale:** A product delivering 4% of label dose isn't a recipe
ingredient, it's theatre. Removing it forces honesty about what's actually
feeding the plant. Reintroduction triggers automatically when pH drops and
efficiency crosses 0.05 (e.g., FeSO₄ in fertigation flips active when soil
pH reaches ~6.5).

**Verification:** Runtime test evaluates `effectiveEff` for every (recipe
product, element, currentPh); fail on any below 0.05 not flagged.

---

## REQ-019 — `PRODUCT.phClass` covers every claimed element

**Statement:** For every product in `PRODUCT`, every element in its `base`
map has a corresponding `phClass` (uniform string or per-element object).

**Rationale:** Missing `phClass` defaults to silent 1.0 or 0 depending on
implementation — both wrong. Catches the new-product-without-pH-classification
case.

**Verification:** Script parses `PRODUCT`; for each entry asserts `phClass`
covers every key in `base`.

---

## REQ-020 — Lockout gate on passive supply

**Statement:** When `currentSoilPh > 6.8`, passive soil supply for P, Mn, Zn
(Mehlich-3 bank × annual fraction) is gated to ≤ SME-derived mass-flow
value. The bank cannot "supply" more than the root zone makes available.

**Rationale:** Mehlich-3 P at 558 kg/ha implies ~1100 mg/m²/wk passive
supply naively. Reality at pH 7.4 is SME 1.1 ppm × transpiration ≈ 50 mg/m²/wk.
The model must reflect lockout, not bank.

**Verification:** Runtime test: with `currentSoilPh = 7.4`, assert passive P
supply ≤ 100 mg/m²/wk. With `currentSoilPh = 6.0`, allow up to bank-derived value.

---

## REQ-021 — Solubility cap per fertigation product

**Statement:** For every fertigation barrel recipe, in-barrel concentration
of each product ≤ `SOLUBILITY_CAP[product]` g/L water at the relevant
temperature (cold-water cap, since winter mornings are the binding case).

**Rationale:** K₂SO₄ exceeds solubility at ~100 g/L cold water. Over-cap →
undissolved residue at barrel bottom → under-dose at Dosatron + clogging
risk. Currently checked by operator memory; should be a hard model check.

**Verification:** Runtime test: barrel volume × per-stage recipe →
concentration; assert ≤ cap. Cap stored at 5°C reference, not 20°C.

---

## REQ-022 — Every product is Ecocert-allowed

**Statement:** Every entry in `PRODUCT` has `organicAllowed: true`
(CAN/CGSB-32.310/311). Build fails if any active recipe references a
product where this is false or unset.

**Rationale:** Surfaces REQ-002 in the model layer rather than as manual
review. Adding a non-allowed product fails the build, not just slips past
human review.

**Verification:** Script parses `PRODUCT`, asserts `organicAllowed: true`
on every entry referenced by any active recipe.

---

## REQ-023 — `EC_FACTOR` covers every product

**Statement:** Every product in `PRODUCT` has an entry in `EC_FACTOR`
(mS/cm per g/L, at 20°C clean water reference). Non-ionic products
(Solubore, yucca, fish hydrolysate) MUST have explicit `0.0` value with
a comment, not be missing.

**Rationale:** Missing entries default to 0, which gives the same predicted
CE as a deliberately non-ionic product. Explicit 0 = confirmed; absent = bug.

**Verification:** Script asserts every key in `PRODUCT` has a key in
`EC_FACTOR`.

---

## REQ-024 — Predicted CE within crop-stage band

**Statement:** For every fertigation recipe (crop × stage),
`predictedCE(recipe, dosatronDilution, waterCE)` falls within
`[CE_min[crop, stage], CE_max[crop, stage]]`.

Bands (mS/cm at 25°C):

| Compartment | Tomato T1-T2 | Tomato T3-T5 | Lettuce | Cert |
|---|---|---|---|---|
| Irrigation at dripper | 1.5 – 2.5 | 2.0 – 3.0 | 1.2 – 1.8 | 4 |
| Substrate (root zone, 30-60 min post) | 1.5 – 3.5 | 1.5 – 3.5 | 1.0 – 2.5 | 4 |
| SME (lab) | 0.75 – 3.5 | 0.75 – 3.5 | 0.75 – 3.5 | 5 |

**Rationale:** A recipe meeting per-element demand but pushing irrigation
CE to 4.5 mS/cm causes osmotic stress. CE envelope is independent of the
per-element check.

**Verification:** Runtime test runs `predictedCE` for every (crop, stage),
asserts within band.

---

## REQ-025 — Foliar tank CE under burn cap

**Statement:** For every foliar recipe, `predictedCE(recipe, dilution=1.0)`
< `FOLIAR_BURN_CAP[crop]`. Default cap: 8.0 mS/cm tomato, 5.0 mS/cm lettuce.
Cert 3.

**Rationale:** Salt burn on leaf surface is concentration-dependent. CaCl₂
alone in 15 L Spray B is fine; adding aggressive sulfates without checking
would not be.

**Verification:** Runtime test on each spray recipe.

---

## REQ-029 — In-tank Ksp check (precipitation guard)

**Statement:** For every recipe (any tank), the predicted concentrations of
the following cation × anion pairs stay below their solubility-product
threshold at the tank's working temperature:

| Pair | Ksp threshold (very rough, cert 3) | Where it shows up |
|---|---|---|
| Ca²⁺ × PO₄³⁻ | precipitates at almost any concentration | foliar Ca + foliar P (never co-mix) |
| Ca²⁺ × SO₄²⁻ | ~2.4 g/L combined ion mass → gypsum | fertigation if water is Ca-hard (yours isn't) |
| Mg²⁺ × PO₄³⁻ | precipitates above ~0.5 g/L combined | rare in current recipes |
| Fe²⁺ × PO₄³⁻ | low Ksp → most fertigated FeSO₄ + P → FePO₄ | fertigation iron + P (avoid both) |
| Fe²⁺ × OH⁻ (function of pH) | precipitates above pH ~6.5 in solution | stock barrel pH drift, foliar tank pH |
| Mn²⁺ × OH⁻ | precipitates above pH ~8 | rarely in recipes; relevant in soil |
| Cu²⁺ × protein | gels with fish hydrolysate | foliar Cu + fish (never co-mix) |
| Fe-chelate × free Cu²⁺ | ligand swap, Fe falls out | foliar Cu + Fe-chelate (separate sprays) |

**Rationale:** Per-element supply could pass while the recipe itself
precipitates in the tank — delivering 0% of either ingredient. The Ksp
check is a separate axis from CE envelope and from solubility cap (single
product). Without it, the model's "supply" numbers lie when both members
of a precipitating pair are in the same tank.

**Verification:** Runtime test reads `KSP_PAIRS` table, evaluates each pair
for every recipe, fails on any predicted concentration above threshold.

---

## REQ-029a — Every product declares `ions` and `chemistryTags`

**Statement:** Every entry in `PRODUCT` declares two fields:
- `ions: { ... }` — mass fraction (g per g of product) of each dissociation
  product, naming cations and anions explicitly (e.g., `Ca2+`, `Cl-`,
  `SO4-2`, `PO4-3`, `K+`, `NO3-`, `Mg2+`, `Fe2+`).
- `chemistryTags: [...]` — array of behavioral classifications drawn from a
  fixed vocabulary (`free-Ca2+`, `chelate-eddha`, `protein-hydrolysate`,
  `live-microbial`, `non-ionic`, `sulfate`, `phosphate`, `chloride`, etc.).

Build fails if either field is missing or empty.

**Rationale:** Without explicit ion declaration, a new product silently
bypasses the precipitation check (REQ-029) — its cation/anion don't appear
in any pair so nothing fires. Tags catch non-ionic interactions (Cu-protein
gel, ligand swap) that pure Ksp pair logic misses.

**Verification:** Script parses `PRODUCT`; asserts every entry has
non-empty `ions` and `chemistryTags`. Schema-shape check, not value check.

---

## REQ-029b — Every (cation × anion) pair across all products is classified

**Statement:** The union of cations declared across all `PRODUCT[*].ions` ×
the union of anions across all `PRODUCT[*].ions` produces a set of pairs.
Every pair must appear in either:
- `KSP_PAIRS` — with a precipitation threshold (g/L combined ion mass) and
  a `cert` rating, OR
- `KSP_SAFE` — explicitly marked non-precipitating with a one-line reason.

A pair appearing in neither = build fails with a message naming the missing
pair.

**Rationale:** This is the loud-failure-on-addition guarantee. Adding a
silicate-containing product would introduce a new anion `SiO3-2`; the
script forces every existing cation × silicate pair to be classified before
the build passes. Silent ungoverned pairs are eliminated by construction.

**Verification:** Script enumerates the cartesian product of declared
cations × anions, asserts each pair in `KSP_PAIRS` or `KSP_SAFE`. Diff
message names the missing pair so the operator knows exactly what to
classify.

---

## REQ-029c — Every `chemistryTags` value is classified

**Statement:** Every distinct tag appearing in any
`PRODUCT[*].chemistryTags` array must be referenced by at least one rule in
`TAG_INCOMPATIBILITIES` (as a forbidden combination component) OR appear in
`TAGS_INERT` (allowlist of tags with no known interaction, each carrying a
one-line "no known interaction with: [list]" comment).

**Rationale:** Tag rules express non-ionic chemistry (Cu²⁺ + protein →
gel, Fe-chelate + free Cu²⁺ → ligand swap, live-microbial +
chlorinated-water → kill). A new tag invented and dropped on a product
with no rule referencing it would let the product slip past the tag-based
check. This spec forces classification at addition time.

**Verification:** Script extracts the set of distinct tags used across
`PRODUCT`, asserts each appears in `TAG_INCOMPATIBILITIES` or
`TAGS_INERT`. Diff message names the unclassified tag.

---

## REQ-030 — `INCOMPATIBLE_RECIPES` declared

**Statement:** A constant `INCOMPATIBLE_RECIPES` lists pairs of recipe IDs
that must never share a tank. Examples today:
- `('foliar-tomato-A', 'foliar-tomato-B')` — Spray A sulfates + Spray B CaCl₂ → CaSO₄ haze; also Cu + Cl risk.
- Future: any fish-hydrolysate spray × any Cu spray.

The team-facing recipe page renders a "do not mix with: X, Y" warning on
each card.

**Rationale:** Mixing-order rules are operational; cross-recipe bans are
structural. Without an explicit list, "don't mix A and B" lives in operator
memory and erodes with team turnover.

**Verification:** Runtime test asserts every recipe page renders the
incompatibility warning when applicable.

---

## REQ-031 — `MIX_ORDER` declared per multi-product recipe

**Statement:** Every recipe with two or more products has a `mixOrder`
array specifying the dissolution order. The team-facing recipe page renders
the steps in this order. Defaults documented in the recipe header:

- Hot water in first
- Largest-mass salt next (K₂SO₄ before MgSO₄)
- Sulfates before chelates (chelate stability)
- Surfactant (yucca) FIRST in foliar (per current docs) — disperser
- Acidifier (if any) before chelates and sulfate metals

**Rationale:** Wrong order causes precipitation or under-dissolution even
when recipe and tank are otherwise correct. K₂SO₄ added cold = settles;
chelate added before sulfate = ligand competition. Wrong order is hard to
detect post-hoc — output looks right until the Dosatron clogs.

**Verification:** Script asserts every recipe with `products.length > 1`
has a `mixOrder` array of equal length.

---

## REQ-032 — Stock barrel time-stability

**Statement:** Every fertigation stock recipe declares a `maxStableHours`
field. The team-facing recipe page shows stock age (since last mix) and
warns if age > limit.

| Stock contents | maxStableHours | Reason | Cert |
|---|---|---|---|
| K₂SO₄ + MgSO₄ only | 168 (1 wk) | sulfates stable in clean water | 4 |
| Any Fe²⁺ (FeSO₄) | 4 | air oxidation Fe²⁺→Fe³⁺→precipitate | 4 |
| Fe-EDDHA | 168 | chelate stable across pH/time | 4 |
| Any fish hydrolysate | 24 | microbial degradation, smell | 3 |
| Mixed cation + sulfate at high conc | 48 | slow gypsum precipitation if Ca-hard water | 3 |

**Rationale:** A stock that was correct on Monday is wrong by Friday if it
contains FeSO₄ — by hour 4 most Fe is precipitated. Without time-stability
declared, the team uses an aging stock and the plant has already
been under-dosed by the time the team notices.

**Verification:** Script asserts every fertigation stock recipe has
`maxStableHours`. UI test asserts age display + threshold warning works.

---

## REQ-053 — Predicted tank pH within compartment envelope

**Statement:** For every tank recipe (fertigation stock, fertigation at dripper,
foliar, nursery), `predictedTankPh(recipe, waterPh)` falls within
`[PH_MIN[compartment], PH_MAX[compartment]]`. Each `PRODUCT` declares a
`phContribution` field (rough pH-shift per g/L in clean 20°C water; non-ionic
products explicitly 0).

Bands:

| Compartment | Min pH | Max pH | Cert | Reason |
|---|---|---|---|---|
| Foliar tank | 5.0 | 7.0 | 4 | Cuticle uptake window + leaf safety |
| Fertigation stock | 4.5 | 7.5 | 3 | < 4.5 = operator/equipment risk; > 7.5 = micro precipitation in barrel |
| Irrigation at dripper | 5.5 | 7.0 | 3 | Root uptake window for soluble cations |
| Nursery solution | 4.5 | 6.5 | 4 | Peat substrate matches |

**Rationale:** A recipe can pass per-element supply (REQ-013/014), CE envelope
(REQ-024), and precipitation Ksp (REQ-029) yet still scorch leaves (foliar pH
< 4 or > 8) or destabilize chelates in stock (pH > 7.5). Tank pH is an
independent axis from CE — same total salt mass can produce very different pH
depending on cation/anion mix.

**Verification:** Runtime test runs `predictedTankPh` for every (compartment,
active recipe), asserts within band. Schema check that every entry in
`PRODUCT` has a `phContribution` value (zero is allowed but must be explicit
per the same pattern as REQ-023's `EC_FACTOR`).

---

## REQ-054 — Chelate stability pH range respected

**Statement:** Every chelate-tagged product in `PRODUCT` declares
`stablePhRange: [min, max]`. Predicted tank pH (per REQ-053) must be inside
the range of every chelate present in the recipe; build fails otherwise.

Reference values:

| Chelate | Stable range | Cert | Notes |
|---|---|---|---|
| Fe-EDDHA | 4 – 9 | 5 | Stable across full agronomic pH |
| Fe-EDTA | 4 – 6.5 | 5 | Dissociates above 6.5 |
| Fe-DTPA | 4 – 7.5 | 4 | Stable to ~7.5 |
| Iron DL (Agro-K) | 5 – 8 (manufacturer-pending) | 3 | Confirm with supplier datasheet before reorder |

**Rationale:** Chelate destabilization silently zeroes out the chelate's
effective dose. A Spray A tank at pH 4.8 from sulfate metals carrying Iron DL
[5, 8] is applying destabilized iron — REQ-053's foliar envelope passes (4.8
is below 5.0 only marginally), but the chelate fails. Without REQ-054, the
model says "Fe delivered" while reality is "Fe precipitated in the tank."

**Verification:** Schema check — every product whose `chemistryTags` includes
a chelate tag has `stablePhRange` set. Runtime check — for every recipe,
predicted tank pH ∈ ∩ of all chelate ranges in the recipe.

---

## REQ-055 — Foliar uptake pH multiplier

**Statement:** `effectiveEff` for the foliar channel applies a
`foliarPhResponse(sprayPh)` multiplier curve, in addition to the leaf-surface
field modifiers (yucca, window timing) already specified.

Curve (cert 3):

| Spray pH | Multiplier |
|---|---|
| 4.0 | 0.5 |
| 4.5 | 0.7 |
| 5.0 | 0.9 |
| 5.5 – 6.0 | 1.0 |
| 6.5 | 0.95 |
| 7.0 | 0.85 |
| 7.5 | 0.7 |
| 8.0 | 0.5 |

**Rationale:** REQ-017 models soil pH effect on root uptake. The foliar
parallel: cuticle absorption is pH-dependent, peaking at slightly acidic.
Without this multiplier, sulfate-heavy Spray A at pH 4.5 reads as "Mn
delivered" while real uptake is ~70% of label. Curve is approximate (cuticle
studies vary by species and wax thickness) — cert 3 explicitly captures that.

**Verification:** `foliarPhResponse` function exists; `effectiveEff` for
foliar-channel products multiplies `base × foliarPhResponse(predictedTankPh)
× leafSurfaceMods`.

---

## REQ-060 — Narrative copy must not contradict current data

**Statement:** User-facing narrative copy in admin diagnostic pages (Nutrition,
Banque sol, Phase 1 comparison) MUST NOT contradict the current state of the
data tables (`PRODUCT`, `TOMATO_STAGES`, `FOLIAR.tomato.A`, `TOMATO_SIDEDRESS`,
`SME_TOMATO_PPM`, `MEHLICH_DATA`, etc.). When narrative is operationally
useful, it MUST be auto-derived from the live data state, not hand-written.

For unavoidable hand-written copy (stable domain context that doesn't depend
on changing values — e.g., "boric acid is non-ionic", "Cu has narrow safety
window"), the source MUST carry an inline `// stable — does not depend on
recipe/SME state` comment, justifying why the copy is exempt from the
auto-derivation rule.

**Examples of forbidden patterns** (these would fail REQ-060):

- "Pousser MnSO₄ à 30-40 g/15 L" — hard-codes a dose recommendation that
  conflicts with `FOLIAR.tomato.A` current value AND ignores the no-yucca
  burn cap
- "Augmenter Actisol" — predates the no-Actisol architectural decision
- "actuellement 1×" / "actuellement à 1.5×" — hard-codes a multiplier that
  shifts as fertigation logic evolves
- "rare car SME K = 292 ppm" — hard-codes a specific SME reading that
  changes after every retest

**Examples of permitted patterns** (KEEP):

- "Le boric acide est non-ionique, fonctionne au pH élevé" — chemistry,
  stable
- "Cu a la fenêtre de sécurité la plus étroite des micros" — agronomy,
  stable
- "Programme soufre = seul levier durable pour P verrouillé" — strategic
  framing, stable across recipe iterations

**Rationale:** The app's data evolves continuously (sidedress reframe,
demand cap, Cu cut, Spray B removal, Phase 1 model wiring). Hand-written
narrative orphans on every change. Coherence audit Findings 14, 21 (and
multiple operational misses since) show the cost: stale advice that
silently misleads the operator. Auto-derivation guarantees consistency by
construction; the discipline of `// stable —` comments forces explicit
classification of every remaining hand-written line.

**Verification (deferred to Phase 2.5):** Node verifier will:

- Walk all narrative-bearing rendering functions (`buildNutriment`,
  `buildBanqueSol`, `renderProposedRecipe`, `renderPhase1Comparison`)
- For each forbidden phrase pattern in a curated list (the `STALE_PHRASE`
  table — initial entries: "Pousser MnSO₄ à", "Augmenter Actisol",
  "actuellement 1×", "rare car SME K =", etc.), assert the phrase does NOT
  appear in any rendered output for the current data state
- For each `// stable —` comment, assert the surrounding code block
  contains only literal string content (no template interpolation of
  data values), confirming the "stable" claim

Until Phase 2.5 lands, this is target spec. Manual review during code
changes, plus the `STALE_PHRASE` table grown empirically as new misses are
found.

**Maintenance protocol:** When a data table or recipe constant changes
(e.g., `FOLIAR.tomato.A` Cu dose cut), the change-author MUST grep for any
narrative copy that referenced the old value and either remove it,
auto-derive it, or update the `// stable —` justification.

---

## REQ-061 — Prioritize earliest channel in replenishment chain

**Statement:** When the model allocates offtake replenishment across channels,
it must prefer the **earliest** channel in the application sequence and only
cascade to later channels for the residual gap. Order (earliest → latest):

1. **Compost** (passive mineralization from past amendments)
2. **Sidedress** (granular, weekly application — Actisol, farine de plumes)
3. **Fertigation** (active, drip-delivered — K₂SO₄, MgSO₄)
4. **Foliar spray** (rapid leaf application — Spray A micros)

Per element, each channel covers what it can; only the residual feeds the
next channel. Formula (already implemented in `computeStageRecipe` for K/Mg
and pending for foliar):

```
sidedress_remaining   = max(0, offtake − compost)
fertigation_remaining = max(0, sidedress_remaining − sidedress_supply)
foliar_remaining      = max(0, fertigation_remaining − fertigation_supply)
```

If foliar_remaining > 0, the foliar dose covers it. If 0, foliar is not
needed for that element.

**Rationale:** Earlier channels are cheaper (compost free, granular cheaper
than fertigation), less labor-intensive per week (passive vs active), and
biologically buffered (mineralization smooths short-term variance). Foliar
is the most expensive (labor + product), most precision-dependent (cuticle
absorption variance), and most disruptive to weekly workflow — should be
last resort, not first choice.

This is also why splitting offtake across multiple channels in proportion
(e.g., "70% sidedress, 30% fertigation") is wrong: it forces fertigation to
run when sidedress could have covered alone. Cascade-then-fill matches the
biology and the cost structure.

**Scope:** Applies to all macro and micro replenishment math in
`computeStageRecipe`, `computeFoliarRecipe` (when wired), and any future
recipe-derivation function. The Nutrition page block ordering already
reflects this chain visually (compost → sidedress → fertigation → foliar).

**Verification:** Node verifier should assert, per element per stage, that
`foliar_dose > 0` only when `offtake > (compost + sidedress + fertigation)`.
Currently FOLIAR.tomato.A is hand-set so this isn't yet checkable; will
activate when foliar refactor (mass-balance Phase 2) lands.

---

## REQ-062 — Single fertigation tank, single foliar spray per week

**Statement:** The team workflow allows at most ONE fertigation tank preparation
per week and at most ONE foliar spray per week. The recipe constants
`TOMATO_STAGES` (or its successor `computeStageRecipe`) and `FOLIAR.tomato`
MUST contain at most one active fertigation recipe and one active foliar
recipe respectively at any given time.

**Rationale:** Multi-tank or multi-spray workflows increase team labor (mixing
time, equipment cleanup), risk of mixing incompatibles, and audit complexity
for organic certification. The team has settled on a one-tank, one-spray
weekly cadence. Recipe expansion that violates this requires explicit
operational sign-off (and probably a new product purchase, calibration cycle,
etc.).

**Scope:** Tomato production. Lettuce nursery + production fertigation are
separate recipes (tomato vs lettuce); the constraint is per-crop-channel:
1 tomato fertigation + 1 tomato foliar + 1 lettuce fertigation per week.

**Verification:** Node verifier asserts:

- `Object.keys(FOLIAR.tomato)` filtered to spray-recipe keys (single-letter,
  array-valued) length is exactly 1, and the surviving key is `'A'`
  (currently `{ A: ... }` after Spray B retirement)
- `LETTUCE` constant exists and is flat (one production fertigation recipe;
  `feSulfate` is part of the same tank, not a separate recipe)
- `computeStageRecipe(stage)` returns exactly one tank composition per stage
  (no parallel "Spray A1 + Spray A2" patterns)

**Acceptance:** A new spray (e.g., re-introducing Spray B) requires explicit
operational sign-off — the spec failure is the gate.

---

## REQ-136 — Contribution channel return shape: `details` per element

**Statement:** Every contribution-channel function (compost release,
substrate release, sidedress supply, fertigation supply, foliar supply,
front-load supply, …) MUST return, alongside its flat per-element `mg`
map, a sibling `details` object keyed by the same elements:

```js
{
  perTray_mg: { N: 1463, P: 169, K: 228, … },     // flat numbers (existing)
  // OR perM2_mg for crop-area channels (compost, sidedress, foliar)
  details: {
    N:  { cert: 3, cap: { kind: 'damage', reason: 'Ocean dose plafonnée par CE bidon (REQ-098) — augmenter pousserait au-delà du cap', uncappedMg: 4980 } },
    P:  { cert: 3, cap: null },                    // recipe covers full P share at this channel
    K:  { cert: 4, cap: { kind: 'other', reason: 'aucun produit haute-K dans la recette nursery — ajouter K₂SO₄', uncappedMg: 0 } },
    Ca: { cert: 4, cap: { kind: 'precipitation', reason: 'Ca×PO₄ précipite à pH ≥ 7 → Ca foliaire séparé du P', uncappedMg: 95 } },
    …
  }
}
```

`details[el]`:
- `cert: number` — 0-5 transferability cert for the per-element value at
  this channel. Combines product cert × model cert; takes the minimum.
- `cap: null | { kind, constraint, limit, lever, uncappedMg }`:
  - `null` when this channel **fully covers its share** of the demand
    for this element — there is no gap to explain.
  - Non-null when this channel **may under-deliver its share** of
    demand. The cap describes *why* and *what to do*, as three
    orthogonal short strings (no prose).
  - `kind: 'damage' | 'precipitation' | 'other'`
    - `'damage'` — pushing the dose higher would harm the plant (EC
      ceiling, foliar burn cap, germination protection, root salt
      tolerance, dose-stacking past safety threshold).
    - `'precipitation'` — chemistry reduces effective supply (Ksp pair,
      tag incompatibility, pH-driven lockout precipitating the active
      ion before uptake).
    - `'other'` — operational ceiling (mineralization rate, no source
      in the recipe, channel cascade priority, labor/frequency
      ceiling, decorative-product cutoff).
  - `constraint: string` — *what kind of thing is binding*. ≤ 4 words,
    no numbers, no verbs. The category-label answer to "why can't this
    push higher?". Examples: `"Protection germination"` ·
    `"CE bidon"` · `"Précipitation Ca-P"` · `"Pas de source"`.
  - `limit: string` — *the numerical bound*. ≤ 8 words. The
    quantitative fact behind the constraint. Examples:
    `"max 9 g farine / plateau"` · `"max 3,0 mS/cm"` ·
    `"facteur 0,10 à pH ≥ 7"`.
  - `lever: string` — *the action to take*. ≤ 6 words, action verb or
    arrow first. The operator-facing instruction. Examples:
    `"↑ poisson hydrolysé"` · `"soufre → baisser pH"` ·
    `"ajouter K₂SO₄ à la recette"`.
  - `uncappedMg: number` — what the supply would be at full coverage
    (the gap-closing value). For "no source" caps where pushing isn't
    possible at all, set to the entering gap so the modal shows the
    missing amount.

No `reason` prose field. The three labelled strings carry every fact
the modal needs to render; consumers must not concatenate them at calc
time. The hover tooltip is `${constraint} · ${limit}`; the modal
renders three labelled rows (Contrainte / Limite / Levier). REQ
references do not appear in operator-facing copy — they live in the
spec and changelog only.

Backwards compatibility: existing callers reading `perTray_mg[el]` or
`perM2_mg[el]` are unaffected; `details` is a new optional sibling.

**Rationale:** The cap describes the *reason* a channel under-delivers,
not whether a number was actively reduced. Setting cap only on values
that hit a hard limit (the original 2026-05-10 morning interpretation)
left the operator without explanation when, for example, fertigation K
falls short because there's no K source in the recipe — the gap is real
and recurring, but no "limit" binds. Reframing cap as the structural
reason for under-delivery makes the emoji column readable: every gap
has a category, every category has an actionable lever (push dose
within the cap, swap to a chemistry-friendly product, add a missing
source).

**Scope:** Every flux-driven channel function. Concentration-driven
products (REQ-010) don't participate in the gap chain so they're out of
scope here, but their burn-cap math (REQ-015, REQ-025) feeds the same
`cap` structure when those products *are* exposed in a contribution
block (e.g. foliar Mn capped to burn-safe dose → `cap.kind = 'damage'`).

**Verification:** Node verifier walks every channel function exposed on
its public namespace (`window.CompostContribution.releasePerWeek`,
`window.SubstrateContributionNursery.cycleAverageReleasePerTray`,
`window.FertigationNursery.nurseryRecipeSupply`, etc.) at default
inputs; for every element with non-zero `mg`, asserts `details[el]`
exists with `cert ∈ [0, 5]` and `cap` either `null` or matching the
declared shape. Cert 5 — schema check.

---

## REQ-137 — Contribution-block gap-grid table

Every contribution channel block on every Nutrition admin page renders,
as the immediate next sibling of its recipe table (REQ-145), a 5-column
gap-grid: Él. / Manque entrant / Apport ici / Manque sortant / icon.
Color coding ✅🟢🟡🔴 by residual ratio. The grid receives a
per-element `details {cert, cap}` payload (REQ-136).

---

## REQ-138 — `Apport ici` cell + cap-emoji interactivity

**Statement:** In every contribution block (REQ-137), the `Apport ici`
cell of each element row:

1. **Is clickable per (row, column)** — every click opens a modal
   scoped to **exactly one element × one channel × one cap-context**.
   The modal MUST NOT aggregate multiple elements, multiple channels,
   or both cell + cap content. One click → one focused modal, period.
   - Click on the **value** part of the cell → "Cert" modal with:
     - The clicked element's symbol + the clicked channel's
       contribution value (in the channel's native unit, no other
       elements shown)
     - `details[el].cert` for that one element
     - A short auto-derived sentence on the cert source for that
       (channel, cert) pair only ("Cert 3 — modèle mass-balance,
       paramètres Sonneveld" or similar, pulled from a channel-level
       cert-explainer table indexed by `(channel, cert)`)
   - Hidden state in the modal MUST identify both the element and the
     channel it came from, so the same element clicked in a different
     channel's row opens a different modal instance with that
     channel's cert/source.

2. **Renders a cap emoji** when `details[el].cap` is non-null AND the
   row's *manque sortant* > 0 (this channel under-delivered for this
   element). When the channel fully covered its share (manque sortant
   = 0), no emoji renders even if a `cap` could in principle apply —
   the gap doesn't exist to explain.
   - `cap.kind === 'damage'` → 🔥
   - `cap.kind === 'precipitation'` → 💧
   - `cap.kind === 'other'` → ❗
   The emoji appears inline AFTER the numeric value, in the same cell.
   Tooltip (`title=`) carries the short reason for hover discovery.

3. **Each emoji opens its own modal** — independent from the cert
   modal in (1) and scoped to **exactly that element × that channel ×
   that cap-kind**. The modal MUST surface the `details[el].cap`
   four-field payload directly — no separate registration required by
   any caller. Layout, top to bottom:

   ```
   ┌───────────────────────────────────────────┐
   │  {el} — {channel}              cert N/5   │  header
   │  {emoji} {kind label}                     │  kind badge
   ├───────────────────────────────────────────┤
   │  {supplied} → {uncappedMg}  (+delta)      │  number delta
   ├───────────────────────────────────────────┤
   │  Contrainte ·  {cap.constraint}           │
   │  Limite     ·  {cap.limit}                │
   │  Levier     ·  {cap.lever}                │
   └───────────────────────────────────────────┘
   ```

   - **Kind label**: `🔥 Plafond plante` / `💧 Précipitation` /
     `❗ Autre plafond`.
   - **Number delta** rendered only when `uncappedMg > supplied`
     (i.e. there's a quantitative gap to show). Format:
     `${supplied} → ${uncappedMg} (+${delta})`.
   - **Three labelled rows**: each label-value pair on one line, mono
     font for the value side, dot separator between label and value.
   - **No prose paragraph.** Each `cap` field renders as-is into its
     row. No concatenation, no narrative wrap-around, no REQ
     citations in operator-facing text.

**Single source of cap copy:** the hover tooltip (`title=` attribute)
shows `${constraint} · ${limit}` (8-15 chars of constraint + the
numerical bound). Clicking opens the modal with the full 3-row
breakdown. Tooltip and modal share the same three strings — no
divergent copy paths.

**Anti-patterns (forbidden by this spec):**

- A single modal that lists all 11 elements when any one cell is
  clicked.
- A "channel summary" modal that pools cap reasons across multiple
  elements ("Mn, Zn, B all burn-capped because…"). Each element
  warrants its own click and its own modal — operator clicks the
  emoji they're curious about, gets only that element's story.
- Cell-click and emoji-click that share a single modal pane — they
  surface different question types and must be visually distinct
  (separate close, separate body, separate keying).
- Reusing the same modal markup across blocks without keying — if
  Block 2 (substrate) and Block 3 (fertigation) both have a non-null
  N cap, clicking each must open separately-keyed modals showing the
  N value in *that* block, not the same overlay reused.

**Rationale:** Per-cell granularity replaces row-level click-throughs
because the cap context is element-specific within a channel — *Mn is
burn-capped while N in the same recipe is fine*. The user is
investigating one specific question per click ("why is K's apport
shown as 228 mg here?" / "what does the 🔥 next to Cu mean?"). Pooling
multiple elements into one modal forces the operator to read prose to
extract the answer they came for. Per-(row, column) modals surface
exactly the right context at the right click target.

The three emojis are intentionally distinct so a glance at the column
shows the cap *kind distribution* across elements without opening
anything. Operators learn the icon vocabulary once and read the column
visually.

**Verification:** Node verifier:

1. Asserts the `Apport ici` cells in each contribution block carry a
   click handler keyed by **(blockId, element)** — e.g.
   `data-cell-key="nursery-fert.cell.K"` or
   `onclick="showCap('nursery-fert','K')"`. Selector must distinguish
   blocks (a Block 2 cell and a Block 3 cell for the same element key
   different modals).
2. For at least one synthetic capped element (constructed by mutating
   a recipe to trigger an EC cap, OR injecting a test `cap` payload),
   assert the cell renders the corresponding emoji AND that the emoji
   has its own click handler keyed by **(blockId, element, capKind)**
   — distinct from the cell's own handler.
3. After a synthetic click on the cell handler, assert the rendered
   modal body contains exactly one element symbol (the clicked one)
   and exactly one channel value — no enumeration of other elements.
4. After a synthetic click on the emoji handler, assert the modal
   body contains the clicked element's `cap.reason` and `uncappedMg`
   only — no list of other capped elements.
5. Asserts the modal markup exposes the auto-derived sentence — no
   hand-written interpretation strings (REQ-060 inheritance).

Cert 4 — UI assertion + behavioral test. Implementation may use
existing `showPourquoi` modal infrastructure with new key shapes
(`${blockId}.cell.${el}` for value clicks,
`${blockId}.cap.${el}.${kind}` for emoji clicks) or introduce
dedicated `showCellCert` / `showCapReason` helpers.

---

## Inherited / dependent specs

- REQ-060 — `cap.reason` strings count as narrative copy and must be
  auto-derived from the data (not hand-written per element). The cert
  explainer table is the only stable copy here; reason strings come
  out of the cap-detection function that produced the cap.
- REQ-029a/b/c — `precipitation` caps cite the Ksp pair or
  TAG_INCOMPATIBILITY rule that fired, by REQ number.
- REQ-018 — `decorative` flag (effectiveEff < 5%) maps to `cap.kind =
  'other'` with the spec ID as reason.
- Per-channel specs that introduce caps (REQ-021 fertigation
  solubility, REQ-024 CE envelope, REQ-025 foliar burn cap, REQ-098
  nursery CE cap, REQ-094 substrate front-load cap) MUST emit the
  corresponding `cap` object when their threshold binds.

---

## REQ-145 — Contribution-block recipe table

On every Nutrition admin page, each contribution channel block
(excluding the Tomato Sol soil-bank block) MUST render, between its
title and gap-grid, a 3-column table `Produit | Composition (% m/m) |
Quantité`. One row per product in the live recipe. Composition is the
product's label % as a `·`-separated string in canonical element order
(N · P · K · Ca · Mg · Fe · Mn · Zn · Cu · B · Mo), elements at 0 %
omitted. Quantité is the channel-native dose.
