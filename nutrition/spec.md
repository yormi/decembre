# Nutrition — cross-crop specs

Cross-crop nutrition specs (chemistry, products, mass-balance framing,
organic certification rules, anything not crop-specific).

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

Recommendations or product mentions surfaced to the team must be Ecocert
Canada (CAN/CGSB-32.310/311) compliant. Non-approved alternatives must not
appear in the app, even for "what-if" framing.

---

## REQ-009 — Weekly solar radiation matches 20-year averages

The `SOLAR_BY_WEEK` array in `index.html` MUST contain the published 20-year-average
weekly solar radiation values for Quebec City greenhouse, J/cm²/week, for ISO
weeks 1-18. Weeks 19-52 fall back to the monthly approximation (`SOLAR_BY_MONTH`)
until the weekly array is extended.

| Week | J/cm²/wk | Week | J/cm²/wk | Week | J/cm²/wk |
|---|---|---|---|---|---|
| 1 | 2 695 | 7 | 6 125 | 13 | 10 290 |
| 2 | 2 940 | 8 | 6 860 | 14 | 10 780 |
| 3 | 3 430 | 9 | 7 595 | 15 | 11 270 |
| 4 | 3 920 | 10 | 8 330 | 16 | 11 760 |
| 5 | 4 655 | 11 | 9 065 | 17 | 12 250 |
| 6 | 5 390 | 12 | 9 660 | 18 | 12 740 |

---

# Recipe-model architecture (REQ-010 through REQ-032)

Target spec, not currently wired. REQ-010 through REQ-032 are the design
contract for a first-principles recipe model (`PRODUCT`, `CHANNEL_ROLE`,
`PH_RESPONSE`, `EC_FACTOR`, `computeRecipe`, `effectiveEff`, `predictedCE`).
Verification scripts land as each piece of the model lands.

Delivery splits into two computation paths:

- **Flux-driven**: dose = (demand − passive supply − cross-channel supply) / efficiency.
- **Concentration-driven**: dose = tank_volume × target_concentration / product_analysis.

---

## REQ-010 — Recipe mode declared per product

Every product entry in `PRODUCT` has `mode: 'flux' | 'concentration'`.
Flux-mode products participate in the demand-supply balance (REQ-013/014).
Concentration-mode products participate in the tank-concentration envelope
(REQ-015).

---

## REQ-012 — No double flux-ownership

For each flux-driven element, the channel fractions in `CHANNEL_ROLE` sum to
1.0 ± 0.05.

---

## REQ-015 — Concentration-driven dose within efficacy/safety band

For every concentration-mode product in any recipe, the in-tank concentration
of its active element falls within `[efficacy_min, safety_max]` declared in
`PRODUCT[product]`.

---

## REQ-017 — pH-aware effective efficiency

Soil-applied channels (fertigation, sidedress, frontload) compute supply as
`recipe_mass × base_efficiency × phResponse[phClass](currentSoilPh)`. The
`PH_RESPONSE` table contains a curve for every named `phClass` referenced by
any product.

---

## REQ-018 — No "decorative" products at current pH

For every product in an active recipe, `effectiveEff(product, element,
currentSoilPh) ≥ 0.05`. Products below 5% effective efficiency must be removed
from the recipe or flagged with `decorative: { reason: '...' }`.

---

## REQ-019 — `PRODUCT.phClass` covers every claimed element

For every product in `PRODUCT`, every element in its `base` map has a
corresponding `phClass` (uniform string or per-element object).

---

## REQ-020 — Lockout gate on passive supply

When `currentSoilPh > 6.8`, passive soil supply for P, Mn, Zn (Mehlich-3 bank
× annual fraction) is gated to ≤ SME-derived mass-flow value. The bank cannot
"supply" more than the root zone makes available.

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

---

## REQ-060 — Narrative copy must not contradict current data

User-facing narrative copy in admin diagnostic pages (Nutrition, Banque sol,
Phase 1 comparison) MUST NOT contradict the current state of the data tables
(`PRODUCT`, `TOMATO_STAGES`, `FOLIAR.tomato.A`, `TOMATO_SIDEDRESS`,
`SME_TOMATO_PPM`, `MEHLICH_DATA`, etc.). When narrative is operationally
useful, it MUST be auto-derived from the live data state, not hand-written.

For unavoidable hand-written copy (stable domain context that doesn't depend
on changing values — e.g., "boric acid is non-ionic", "Cu has narrow safety
window"), the source MUST carry an inline `// stable — does not depend on
recipe/SME state` comment, justifying why the copy is exempt from the
auto-derivation rule.

---

## REQ-061 — Prioritize earliest channel in replenishment chain

When the model allocates offtake replenishment across channels, it must prefer
the **earliest** channel in the application sequence and only cascade to later
channels for the residual gap. Order (earliest → latest):

1. **Compost** (passive mineralization from past amendments)
2. **Sidedress** (granular, weekly application — Actisol, farine de plumes)
3. **Fertigation** (active, drip-delivered — K₂SO₄, MgSO₄, Solubore, sodium molybdate)
4. **Foliar spray** (rapid leaf application — Spray A micros)

Per element, each channel covers what it can; only the residual feeds the
next channel. Formula:

```
sidedress_remaining   = max(0, offtake − compost)
fertigation_remaining = max(0, sidedress_remaining − sidedress_supply)
foliar_remaining      = max(0, fertigation_remaining − fertigation_supply)
```

If foliar_remaining > 0, the foliar dose covers it. If 0, foliar is not
needed for that element.

**Mo carve-out (2026-05-16):** The cation micros (Mn / Zn / Cu / Fe) sit on
foliar by default because at current soil pH 7.4 they're locked out at the
root and foliar bypasses that lockout. Mo is the exception — molybdate is
an anion and its plant-availability *rises* with pH rather than dropping, so
the lockout argument does not apply. Mo sits on fertigation under this rule;
foliar's Mo entry is retired. Sodium molybdate joins the fertigation barrel
at the team's smallest reliable barrel weight (0.5 g/week sodium molybdate ≈
0.5 mg Mo/m²/sem ≈ 7× peak demand, well within Mo's wide tolerance band).

---

## REQ-062 — Single fertigation tank per week

The team workflow allows at most ONE fertigation tank preparation per
week. `TOMATO_STAGES` (or its successor `computeStageRecipe`) MUST
contain at most one active fertigation recipe at any given time, and
the `LETTUCE` fertigation recipe is a flat object (one production
recipe, no parallel sub-tanks). Constraint is per-crop: 1 tomato
fertigation + 1 lettuce fertigation per week.

The previous "single foliar spray per week" clause retired 2026-05-17
(Guillaume direct ruling). Multi-spray weeks are operationally on the
table via the foliar-recipe model's `sprayCount` 1-3 lever (REQ-112);
they're useful on Mn / Zn lockout-regime weeks where foliar is the only
channel and a single weekly spray clips the gap. Foliar-frequency is
now governed by the foliar-recipe subproject (REQ-112), not by this
cross-crop workflow rule.

---

## REQ-136 — Contribution channel return shape: `details` per element

Every contribution-channel function (compost release, substrate release,
sidedress supply, fertigation supply, foliar supply, front-load supply, …)
MUST return, alongside its flat per-element `mg` map, a sibling `details`
object keyed by the same elements:

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
    for this element.
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
    no numbers, no verbs. Examples: `"Protection germination"` ·
    `"CE bidon"` · `"Précipitation Ca-P"` · `"Pas de source"`.
  - `limit: string` — *the numerical bound*. ≤ 8 words. Examples:
    `"max 9 g farine / plateau"` · `"max 3,0 mS/cm"` ·
    `"facteur 0,10 à pH ≥ 7"`.
  - `lever: string` — *the action to take*. ≤ 6 words, action verb or
    arrow first. Examples: `"↑ poisson hydrolysé"` ·
    `"soufre → baisser pH"` · `"ajouter K₂SO₄ à la recette"`.
  - `uncappedMg: number` — what the supply would be at full coverage.
    For "no source" caps where pushing isn't possible at all, set to
    the entering gap so the modal shows the missing amount.

No `reason` prose field. The three labelled strings carry every fact
the modal needs to render; consumers must not concatenate them at calc
time. The hover tooltip is `${constraint} · ${limit}`; the modal
renders three labelled rows (Contrainte / Limite / Levier). REQ
references do not appear in operator-facing copy.

Backwards compatibility: existing callers reading `perTray_mg[el]` or
`perM2_mg[el]` are unaffected; `details` is a new optional sibling.

---

## REQ-157 — Per-element channel efficiency exposure

Every contribution-channel function (compost release, substrate release,
sidedress supply, fertigation supply, foliar supply, front-load supply,
nursery substrate, nursery fertigation) MUST expose a per-element `efficiency`
map alongside its existing flat mg map (`perTray_mg` / `perM2_mg`) and
`details` payload (REQ-136). The map declares the channel's CAPABILITY: for
every element the channel is structurally able to deliver under current
soil / pH / coverage conditions, `efficiency[element]` is a number in
`[0, 1]` — the share of applied product mass that would be plant-available
for that element IF the channel were dosed for it. Elements outside the
channel's capability are absent from the map; the gap-grid renderer
(REQ-156) treats absence as `—`. Whether the channel actually doses the
element this call is reflected in the `Apport ici` column, not here.
Amended 2026-05-16 per Guillaume's direct ruling: capability view, not
per-call realized view.

---

## REQ-137 — Contribution-block gap-grid table

Every contribution channel block on every Nutrition admin page renders, as
the immediate next sibling of its recipe table (REQ-152), a 6-column
gap-grid: Él. / Manque entrant / Efficacité / Apport ici / Manque sortant /
icon. Color coding ✅🟢🟡🔴 by residual ratio. The grid receives a
per-element `details {cert, cap}` payload (REQ-136).

---

## REQ-138 — `Apport ici` cell + cap-emoji interactivity

In every contribution block (REQ-137), the `Apport ici` cell of each element
row:

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
   = 0), no emoji renders even if a `cap` could in principle apply.
   - `cap.kind === 'damage'` → 🔥
   - `cap.kind === 'precipitation'` → 💧
   - `cap.kind === 'other'` → ❗
   The emoji appears inline AFTER the numeric value, in the same cell.
   Tooltip (`title=`) carries the short reason for hover discovery.

3. **Each emoji opens its own modal** — independent from the cert
   modal in (1) and scoped to **exactly that element × that channel ×
   that cap-kind**. The modal MUST surface the `details[el].cap`
   four-field payload directly. Layout, top to bottom:

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
   - **Number delta** rendered only when `uncappedMg > supplied`.
     Format: `${supplied} → ${uncappedMg} (+${delta})`.
   - **Three labelled rows**: each label-value pair on one line, mono
     font for the value side, dot separator between label and value.
   - **No prose paragraph.** Each `cap` field renders as-is. No
     concatenation, no narrative wrap-around, no REQ citations in
     operator-facing text.

**Single source of cap copy:** the hover tooltip (`title=` attribute)
shows `${constraint} · ${limit}`. Clicking opens the modal with the
full 3-row breakdown. Tooltip and modal share the same three strings.

---

## REQ-156 — Efficacité column semantics

In every contribution-block gap-grid (REQ-137), the Efficacité cell of each
element row displays, as an integer percent, the channel's per-element
plant-available efficiency under current soil / pH / coverage conditions —
independent of whether the channel actually doses that element this call.
The cell renders `—` only when the element falls outside the channel's
capability map (the channel is structurally unable to deliver it). Amended
2026-05-16 per Guillaume's direct ruling to show capability efficiency
always, so operators see what each channel could deliver if dosed; the
`Apport ici` column carries the per-call realized mg.

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

## REQ-152 — Contribution-block recipe table

On every Nutrition admin page, each contribution channel block (excluding the
Tomato Sol soil-bank block) MUST render, between its title and gap-grid, a
3-column table `Produit | Composition (% m/m) | Quantité`. One row per product
in the live recipe. Composition is the product's label % as a `·`-separated
string in canonical element order (N · P · K · Ca · Mg · Fe · Mn · Zn · Cu ·
B · Mo), elements at 0 % omitted. Quantité is the channel-native dose.

---

## REQ-159 — Elemental mass in nutrition tables is in milligrams

Every nutrition-table column expressing an elemental-mass quantity (demand, contribution, gap, soil reservoir, supply) renders in milligrams (mg). Recipe-product mass tables — Block 7 / 8 « Recette stockée vs calculée (drift) » and any other table whose cells are product masses such as K₂SO₄ g — are out of scope; product masses remain in g or kg.

---

## REQ-160 — Column-header unit declaration

Every nutrition-table column whose cells share a unit declares that unit once in the column header. Cells contain only the numeric value (or `0`, `—`, `0 %`). Applies to all nutrition tables: contribution-block gap-grid, soil-bank block, fertigation / foliar / sidedress recipe tables, Salanova subpage tables, nursery subpage tables.

---

## REQ-161 — Bare 0 communicates coverage; no parenthetical

On the contribution-block gap-grid, the `Manque sortant` cell rendering 0 (gap closed by the channel) displays the digit `0` only — color-coded per the three-tier scheme (REQ-016) — with no `(couvert)` or equivalent annotation.

---

## REQ-162 — Mois d'épuisement on the soil-bank block: SME-availability runway

Every element row on the soil-bank block displays a Mois d'épuisement value equal to the Mehlich-3 reservoir divided by the weekly plant uptake currently sustainable at the measured SME plant-availability — the bank's runway at zero replenishment, with weekly draw throttled by current soil-solution availability.
