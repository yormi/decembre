# Soil-contribution

Specs for the model that estimates the **weekly per-element nutrient draw
from the resident soil bank** (Mehlich-3 reservoir measured by Berger
Labs — currently the April 2026 tomato bed; lettuce bed measured but not
yet wired).

This file is the *spec* (what the model must do or be). Source values,
per-element bank rationale, kg/ha → mg/m² conversion, and refinement
triggers live as inline comments in `data.js` (or are added to
`derivation.md` if/when the source-table prose grows past a few lines).

The model answers exactly one question: **"how much of element X does the
plant tap from the resident soil bank this week, and how many months
until that bank is depleted if the bank were the sole supply?"**

It does NOT answer:
- How fast the bank is being **refilled** by compost mineralization or
  granular sidedress (those have their own subprojects:
  `nutrition/compost-contribution/` and `nutrition/tomato/sidedress-recipe/`).
- The **bank trajectory** over the season under combined drawdown + add
  (that lives on the dedicated 🪨 Banque sol admin page —
  `buildBanqueSol` in `app/index.html`).
- SME × transpiration mass-flow ("what's available at the root surface
  this week given current chemistry") — that's a different physical
  question, lives in `calcNutrSupply` → `supply.soil` and feeds the
  Banque sol page.

Cross-crop scope: tomato bed is wired today; the structure is keyed by
crop so lettuce can be added with one entry once the lettuce bed's
Mehlich-3 values are ready to consume.

---

## Contract

### Inputs

Per call: `crop` (string), `element` (string), `demand_mg_per_m2_per_week`
(number).

Constants (declared in `data.js`):
- `SOIL_BANK_MG_M2[crop][el]` — Mehlich-3 reservoir in mg/m² (kg/ha × 100).
- `SOIL_CONTRIBUTING[el]` — boolean map; `true` for elements whose bank
  participates in the gap chain.
- `WEEKS_PER_MONTH` — 4.33 (= 52/12, unit conversion).

### Output

`window.SoilContribution`:

```
{
  BANK_MG_M2,           // { tomato: { P, K, Ca, Mg } }   — mg/m²
  CONTRIBUTING,         // { P: true, Ca: true }           — gap-chain participants
  WEEKS_PER_MONTH,      // 4.33
  weeklyContribution,   // (crop, el, demand_mg) → number  — mg/m²/wk drawn from bank this week
  monthsToDepletion,    // (crop, el, demand_mg) → number | null
  renderGrid,           // (gapsIn, soilMg, gapsOut, monthsToDepletion) → HTML string
}
```

`weeklyContribution(crop, el, demand_mg)`:
- Returns `min(demand_mg, BANK_MG_M2[crop][el])` if `CONTRIBUTING[el]` and
  bank data exists, else `0`.
- The `min` clamp prevents a finite bank from over-delivering in the
  corner case where weekly demand exceeds the entire reservoir.

`monthsToDepletion(crop, el, demand_mg)`:
- Returns `BANK_MG_M2[crop][el] / (demand_mg × WEEKS_PER_MONTH)` when both
  bank data and positive demand are present.
- Returns `null` otherwise — the caller renders "—" for absent runways.
- Defined for any element with bank data, **regardless** of whether
  it's in `CONTRIBUTING` — so disabled rows still surface their runway
  for operator context (K/Mg today).

`renderGrid(gapsIn, soilMg, gapsOut, monthsToDepletion)`:
- 6-column grid (Él. / Manque entrant / Apport ici / Manque sortant /
  Mois épuisement / icon). Element row order matches the canonical
  `['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo']`.
- Rows where `soilMg[el] > 0` render fully visible; rows where
  `soilMg[el] === 0` render at opacity 0.42 (disabled) and the "Apport
  ici" cell shows `—`. Manque sortant on disabled rows equals Manque
  entrant (gap passes through unchanged).
- Months column shows formatted runway (`X mois`, `Y.Z ans`, or `N ans`
  depending on magnitude) when `monthsToDepletion[el] != null`, `—` otherwise.
- Every row stays clickable via `class="pq-row" onclick="showPourquoi('soil.${el}')"`
  — disabled rows open the modal too so the operator can read *why* the
  row is disabled. Pourquoi entries are registered by the caller (page
  logic.js), not by `renderGrid`.

---

## Cert scale

Same single-cert transferability scale as `nutrition/tomato/plant-needs/spec.md`
("Cert scale" section — canonical).

---

## REQ-140 — Bank is a per-crop Mehlich-3 reservoir in mg/m²

**Statement:** `SOIL_BANK_MG_M2` is a two-level object keyed by crop slug
(`tomato`, `lettuce`, …) then by element symbol. Values are in mg/m²
(Berger Labs Mehlich-3 result × 100, since 1 kg/ha = 100 mg/m²). At least
one crop entry must be populated (the tomato bed today, sample 596614,
Berger Labs Report 39088, April 2026).

**Rationale:** Mehlich-3 reports come in kg/ha. The gap chain operates in
mg/m²/wk. Storing the bank already-converted keeps the consumer arithmetic
(`min(demand_mg, bank_mg)`) honest — no inline unit math at the call site.
Keying by crop matches the existing per-crop split in `SME_TOMATO_PPM` /
`SME_LETTUCE_PPM` and lets the spec evolve without renaming when more
crops land.

**Cert:** 4 (source data is cert 4 — Berger Labs accredited lab,
single-sample-per-bed). Conversion arithmetic is cert 5.

---

## REQ-141 — Only `CONTRIBUTING` elements participate in the gap chain

**Statement:** `weeklyContribution(crop, el, demand_mg)` returns a non-zero
value **only** when `SOIL_CONTRIBUTING[el] === true`. For all other
elements (including those with bank data, like K and Mg today), the
function returns `0` and the gap chain passes input → output unchanged.

`SOIL_CONTRIBUTING` initial state: `{ P: true, Ca: true }`. Both reservoirs
are large enough relative to weekly demand to carry the plant's full
need without external resupply for years/decades; routing them as
implicit gap-chain coverage matches the operational reality (no operator
lever turns these off).

**Rationale:** The model intentionally excludes elements where the soil
bank is *measured* but *not the binding mechanism*. K bank is large but
active fertigation (K₂SO₄) is the actual delivery channel — counting K
twice (bank + fertigation) would inflate the apparent coverage. N has
no Mehlich-3 measurement (delivered via mineralization, modeled in
compost-contribution + sidedress-recipe). Micros are not on the Berger
test. Codifying the participating set as a constant makes the contract
explicit and verifier-checkable.

**Cert:** 4 (scoping decision; revisit when soil chemistry changes —
e.g., if pH drops below 6.5 and SME P climbs into spec, P might exit
CONTRIBUTING because active channels can carry it).

---

## REQ-142 — Months-to-depletion surfaces runway for any element with bank data

**Statement:** `monthsToDepletion(crop, el, demand_mg)` returns
`BANK_MG_M2[crop][el] / (demand_mg × WEEKS_PER_MONTH)` when both
operands are positive, `null` otherwise. The runway is defined for any
element with bank data **regardless of whether the element is in
`CONTRIBUTING`** — disabled rows still surface their reservoir runway so
the operator can read context ("K bank lasts ~16 months at T5 drawdown,
but the gap chain routes K through fertigation, not the bank").

**Rationale:** The hypothetical "if the bank were the sole supply" answers
a different question from "is the bank routed in this model". Both are
operator-relevant — the runway tells you whether the bank could
plausibly carry the load if conditions changed; the routing tells you
how it's modeled today. Splitting `CONTRIBUTING` from runway availability
keeps both questions answerable from the same data.

**Cert:** 5 (structural — arithmetic over declared constants).

---

## REQ-143 — Public API on `window.SoilContribution`

**Statement:** `window.SoilContribution` exists at runtime and exposes
`BANK_MG_M2`, `CONTRIBUTING`, `WEEKS_PER_MONTH`, `weeklyContribution`,
`monthsToDepletion`, and `renderGrid`. Consumers MUST reach for the
namespace rather than the bare module-scope constants/functions so the
internals can be reshaped (e.g., adding a per-bed scaling, a seasonal
factor, or a depth-resolved bank) without breaking call sites.

**Rationale:** Same surface-area discipline as REQ-080 (CompostContribution),
REQ-097 (SubstrateContributionNursery), REQ-103 (FoliarRecipeTomato).
REQ-139 enforces the no-inline-reimplementation rule at the verifier
level for any consumer of the namespace.

**Cert:** 5 (structural).

---

## REQ-145 — Pourquoi modal interpretation strings (this spec owns the bytes)

**Statement:** The interpretation prose displayed inside the soil-bank
pourquoi modal (one per element row in Block 2) is **owned by this spec
entry**. Code calls `renderSpec('REQ-145', '<key>', { el })` to obtain
the string; it MUST NOT inline the prose at the call site. Six keys are
declared below — one per branch of the per-element interpretation
logic.

**Rationale:** REQ-144 (operator-facing prose requires declared
provenance) forbids hand-written stable strings in code. The pourquoi
modal is a diagnostic admin surface — the team uses it to read *why* a
row is disabled or contributing. Prose belongs here; the spec is the
literal source of bytes, the build pipeline injects them via
`window.SPEC_STRINGS`. Each key corresponds to a single conditional
branch in `nutrition/tomato/app/logic.js` `buildNutrimentTomato` ↔
soil block.

**Cert:** 5 — bytes are spec-declared; render is deterministic.

**Renders:** (bytes owned by REQ-145; the team-visible text lives here, nowhere else)

```render Ca
Sol Ca-saturé (racine de la crise pH 7,4) — réservoir essentiellement inépuisable à l'échelle hebdomadaire. La plante tire 100 % du Ca via le sol ; l'enjeu est la précipitation et le verrouillage, pas la disponibilité.
```

```render P
Banque P "coffre" ; même au taux de drawdown actuel, la réserve tient des années. Verrouillée au pH ≥ 7, mais reste la source dominante de P à long terme — la chimie limite, pas la masse.
```

```render K-fert-routed
K banque mesurée, SME en spec. Pas routé par ce bloc — le K circule via la fertigation (K₂SO₄) qui assure la livraison à la demande, et la banque suit via la trajectoire SME (page 🪨 Banque sol).
```

```render Mg-fert-routed
Mg banque mesurée, SME en spec. Pas routé par ce bloc — la fertigation (MgSO₄) couvre la demande hebdomadaire active.
```

```render N-not-mehlich
N n'est pas mesuré par Mehlich-3. La disponibilité vient de la minéralisation de la matière organique (compost + sidedress) — pas un stock fixe.
```

```render default-not-mehlich
${el} n'est pas mesuré sur le test Mehlich-3 actuel. Apport via les canaux actifs (compost, sidedress, fertigation, foliaire selon l'élément).
```

---

## Inherited / dependent specs

- **REQ-060** (`nutrition/spec.md`) — pourquoi interpretation strings
  registered by callers MUST be auto-derived from data or carry
  `// stable —` annotations. `renderGrid` itself emits no narrative —
  only column headers, values, and the icon. REQ-145 supersedes the
  `// stable —` escape hatch for the soil-bank modal: the prose now
  lives in this spec entry, rendered via `renderSpec()`.
- **REQ-139** (`requirements.md`) — call sites consuming the soil bank
  MUST go through `window.SoilContribution`, not redeclare the
  constants or recompute the formulas inline.
- **REQ-144** (`requirements.md`) — operator-facing prose requires
  declared provenance via `data-prose-source`. REQ-145's pourquoi
  rendering site emits `<span data-prose-source="REQ-145">…</span>`.
