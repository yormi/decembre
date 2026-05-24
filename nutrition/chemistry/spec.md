# Nutrition — chimie (specs cross-crop chemistry layer)

Chemistry-domain specs that frame product properties and tank-level behavior
shared across every crop. Owns: the `PRODUCT` catalog (composition, mode,
organic cert flag, EC factor, pH contribution, chelate stability, ions,
chemistryTags), the pH-response curves consumed by every channel's effective
efficiency, the mixing-compatibility tables (Ksp pairs, tag incompatibilities,
mix order, incompatible recipes, stock barrel time-stability), and the
tank-level prediction envelopes (CE, pH, in-tank concentration band). Cross-
crop nutrition model rules (mass-balance, channel cascade, lockout gates,
pH-aware efficiency framing) live in `nutrition/spec.md`; crop-specific
channel ownership lives in `nutrition/<crop>/channel-role.js` per
`nutrition/spec.md — channel-role coverage for every crop's demand
elements`.

---

## REQ-010 — Recipe mode declared per product

Every product entry in `PRODUCT` has `mode: 'flux' | 'concentration'`.
Flux-mode products participate in the demand-supply balance (REQ-013/014).
Concentration-mode products participate in the tank-concentration envelope
(REQ-015).

---

## REQ-015 — Concentration-driven dose within efficacy/safety band

For every concentration-mode product in any recipe, the in-tank concentration
of its active element falls within `[efficacy_min, safety_max]` declared in
`PRODUCT[product]`.

---

## REQ-019 — `PRODUCT.phClass` covers every claimed element

For every product in `PRODUCT`, every element in its `base` map has a
corresponding `phClass` (uniform string or per-element object).

---

## REQ-021 — Solubility cap per fertigation product

For every fertigation barrel recipe, in-barrel concentration of each product
≤ `SOLUBILITY_CAP[product]` g/L water at the relevant temperature (cold-water
cap, since winter mornings are the binding case).

---

## REQ-022 — Every product is Ecocert-allowed

Every entry in `PRODUCT` has `organicAllowed: true` (CAN/CGSB-32.310/311).
Build fails if any active recipe references a product where this is false or
unset.

---

## REQ-023 — `EC_FACTOR` covers every product

Every product in `PRODUCT` has an entry in `EC_FACTOR` (mS/cm per g/L, at 20°C
clean water reference). Non-ionic products (Solubore, yucca, fish hydrolysate)
MUST have explicit `0.0` value with a comment, not be missing.

---

## REQ-024 — Predicted CE within crop-stage band

For every fertigation recipe (crop × stage), `predictedCE(recipe,
dosatronDilution, waterCE)` falls within `[CE_min[crop, stage], CE_max[crop,
stage]]`.

Bands (mS/cm at 25°C):

| Compartment | Tomato T1-T2 | Tomato T3-T5 | Lettuce | Cert |
|---|---|---|---|---|
| Irrigation at dripper | 1.5 – 2.5 | 2.0 – 3.0 | 1.2 – 1.8 | 4 |
| Substrate (root zone, 30-60 min post) | 1.5 – 3.5 | 1.5 – 3.5 | 1.0 – 2.5 | 4 |
| SME (lab) | 0.75 – 3.5 | 0.75 – 3.5 | 0.75 – 3.5 | 5 |

---

## REQ-025 — Foliar tank CE under burn cap

For every foliar recipe, `predictedCE(recipe, dilution=1.0)` <
`FOLIAR_BURN_CAP[crop]`. Default cap: 8.0 mS/cm tomato, 5.0 mS/cm lettuce.
Cert 3.

---

## REQ-029 — In-tank Ksp check (precipitation guard)

For every recipe (any tank), the predicted concentrations of the following
cation × anion pairs stay below their solubility-product threshold at the
tank's working temperature:

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

---

## REQ-029a — Every product declares `ions` and `chemistryTags`

Every entry in `PRODUCT` declares two fields:
- `ions: { ... }` — mass fraction (g per g of product) of each dissociation
  product, naming cations and anions explicitly (e.g., `Ca2+`, `Cl-`,
  `SO4-2`, `PO4-3`, `K+`, `NO3-`, `Mg2+`, `Fe2+`).
- `chemistryTags: [...]` — array of behavioral classifications drawn from a
  fixed vocabulary (`free-Ca2+`, `chelate-eddha`, `protein-hydrolysate`,
  `live-microbial`, `non-ionic`, `sulfate`, `phosphate`, `chloride`, etc.).

Build fails if either field is missing or empty.

---

## REQ-029b — Every (cation × anion) pair across all products is classified

The union of cations declared across all `PRODUCT[*].ions` × the union of
anions across all `PRODUCT[*].ions` produces a set of pairs. Every pair must
appear in either:
- `KSP_PAIRS` — with a precipitation threshold (g/L combined ion mass) and
  a `cert` rating, OR
- `KSP_SAFE` — explicitly marked non-precipitating with a one-line reason.

A pair appearing in neither = build fails with a message naming the missing
pair.

---

## REQ-029c — Every `chemistryTags` value is classified

Every distinct tag appearing in any `PRODUCT[*].chemistryTags` array must be
referenced by at least one rule in `TAG_INCOMPATIBILITIES` (as a forbidden
combination component) OR appear in `TAGS_INERT` (allowlist of tags with no
known interaction, each carrying a one-line "no known interaction with: [list]"
comment).

---

## REQ-030 — `INCOMPATIBLE_RECIPES` declared

A constant `INCOMPATIBLE_RECIPES` lists pairs of recipe IDs that must never
share a tank. Examples today:
- `('foliar-tomato-A', 'foliar-tomato-B')` — Spray A sulfates + Spray B CaCl₂ → CaSO₄ haze; also Cu + Cl risk.
- Future: any fish-hydrolysate spray × any Cu spray.

The team-facing recipe page renders a "do not mix with: X, Y" warning on each
card.

---

## REQ-031 — `MIX_ORDER` declared per multi-product recipe

Every recipe with two or more products has a `mixOrder` array specifying the
dissolution order. The team-facing recipe page renders the steps in this
order. Defaults documented in the recipe header:

- Hot water in first
- Largest-mass salt next (K₂SO₄ before MgSO₄)
- Sulfates before chelates (chelate stability)
- Surfactant (yucca) FIRST in foliar (per current docs) — disperser
- Acidifier (if any) before chelates and sulfate metals

---

## REQ-032 — Stock barrel time-stability

Every fertigation stock recipe declares a `maxStableHours` field. The
team-facing recipe page shows stock age (since last mix) and warns if age >
limit.

| Stock contents | maxStableHours | Reason | Cert |
|---|---|---|---|
| K₂SO₄ + MgSO₄ only | 168 (1 wk) | sulfates stable in clean water | 4 |
| Any Fe²⁺ (FeSO₄) | 4 | air oxidation Fe²⁺→Fe³⁺→precipitate | 4 |
| Fe-EDDHA | 168 | chelate stable across pH/time | 4 |
| Any fish hydrolysate | 24 | microbial degradation, smell | 3 |
| Mixed cation + sulfate at high conc | 48 | slow gypsum precipitation if Ca-hard water | 3 |

---

## REQ-053 — Predicted tank pH within compartment envelope

For every tank recipe (fertigation stock, fertigation at dripper, foliar,
nursery), `predictedTankPh(recipe, waterPh)` falls within
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

---

## REQ-054 — Chelate stability pH range respected

Every chelate-tagged product in `PRODUCT` declares `stablePhRange: [min,
max]`. Predicted tank pH (per REQ-053) must be inside the range of every
chelate present in the recipe; build fails otherwise.

Reference values:

| Chelate | Stable range | Cert | Notes |
|---|---|---|---|
| Fe-EDDHA | 4 – 9 | 5 | Stable across full agronomic pH |
| Fe-EDTA | 4 – 6.5 | 5 | Dissociates above 6.5 |
| Fe-DTPA | 4 – 7.5 | 4 | Stable to ~7.5 |
| Iron DL (Agro-K) | 5 – 8 (manufacturer-pending) | 3 | Confirm with supplier datasheet before reorder |

---

## REQ-055 — Foliar uptake pH multiplier

`effectiveEff` for the foliar channel applies a `foliarPhResponse(sprayPh)`
multiplier curve, in addition to the leaf-surface field modifiers (yucca,
window timing) already specified.

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
