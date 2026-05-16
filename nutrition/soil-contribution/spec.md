# Soil-contribution

Specs for the model that estimates the **weekly per-element nutrient draw
from the resident soil bank** (Mehlich-3 reservoir, Berger Labs — April 2026
tomato bed wired; lettuce bed measured but not wired).

Answers: **"how much of element X does the plant tap from the soil bank
this week, and how many months until depletion if the bank were the sole
supply?"** Does NOT answer bank refill (see `nutrition/compost-contribution/`,
`nutrition/tomato/sidedress-recipe/`), bank trajectory (🪨 Banque sol admin
page, `buildBanqueSol`), or root-surface availability (`calcNutrSupply` →
`supply.soil`). Source values, kg/ha → mg/m² conversion, and refinement
triggers live in `data.js` comments (or `derivation.md` if they grow).
Crop-keyed structure so lettuce can wire with one entry.

---

## Contract

### Inputs

Per call: `crop` (string), `element` (string), `demand_mg_per_m2_per_week`
(number).

Constants (declared in `data.js`):
- `SOIL_BANK_MG_M2[crop][el]` — Mehlich-3 reservoir in mg/m² (kg/ha × 100).
- `SOIL_CONTRIBUTING[el]` — boolean map; `true` for elements whose bank
  participates in the gap chain.
- `WEEKS_PER_MONTH` — 4.33 (= 52/12).

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
  bank data exists, else `0`. `min` clamp prevents over-delivery when
  weekly demand exceeds the reservoir.

`monthsToDepletion(crop, el, demand_mg)`:
- Returns `BANK_MG_M2[crop][el] / (demand_mg × WEEKS_PER_MONTH)` when both
  operands are positive, `null` otherwise (caller renders "—").
- Defined for any element with bank data **regardless** of `CONTRIBUTING` —
  disabled rows surface runway for context (K/Mg today).

`renderGrid(gapsIn, soilMg, gapsOut, monthsToDepletion)`:
- 6-column grid (Él. / Manque entrant / Apport ici / Manque sortant /
  Mois épuisement / icon). Row order: `['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo']`.
- `soilMg[el] > 0` rows render fully visible; `soilMg[el] === 0` rows
  render at opacity 0.42 with "Apport ici" = `—` and Manque sortant =
  Manque entrant (gap passes through).
- Months column: `X mois`, `Y.Z ans`, or `N ans` by magnitude when
  `monthsToDepletion[el] != null`; `—` otherwise.
- Every row clickable via `class="pq-row" onclick="showPourquoi('soil.${el}')"`
  — disabled rows open the modal too. Pourquoi entries registered by
  caller (page logic.js), not `renderGrid`.

---

## Cert scale

Same single-cert transferability scale as `nutrition/tomato/plant-needs/spec.md`
("Cert scale" section — canonical).

---

## REQ-140 — Bank is a per-crop Mehlich-3 reservoir in mg/m²

**Statement:** `SOIL_BANK_MG_M2` is a two-level object keyed by crop slug
(`tomato`, `lettuce`, …) then by element symbol. Values are in mg/m²
(Mehlich-3 kg/ha × 100). At least one crop entry must be populated (tomato
bed today, sample 596614, Berger Labs Report 39088, April 2026).

**Cert:** 4 (source = Berger Labs accredited, single-sample-per-bed);
conversion arithmetic = 5.

---

## REQ-141 — Only `CONTRIBUTING` elements participate in the gap chain

**Statement:** `weeklyContribution(crop, el, demand_mg)` returns non-zero
**only** when `SOIL_CONTRIBUTING[el] === true`. Otherwise returns `0` and
the gap chain passes input → output unchanged.

`SOIL_CONTRIBUTING` initial state: `{ P: true, Ca: true }` — both reservoirs
carry weekly demand for years/decades without external resupply, no operator
lever toggles them.

**Rationale (short):** K bank is large but K is delivered via fertigation
(K₂SO₄) — counting twice would inflate coverage. N has no Mehlich-3
measurement. Micros not on Berger test.

**Cert:** 4 (revisit if pH drops below 6.5 and SME P climbs into spec — P
might exit CONTRIBUTING if active channels can carry it).

---

## REQ-142 — Months-to-depletion surfaces runway for any element with bank data

**Statement:** `monthsToDepletion(crop, el, demand_mg)` returns
`BANK_MG_M2[crop][el] / (demand_mg × WEEKS_PER_MONTH)` when both operands
are positive, `null` otherwise. Defined for any element with bank data
**regardless of `CONTRIBUTING`** — disabled rows surface reservoir runway
for context ("K bank lasts ~16 months at T5 drawdown, but routed via
fertigation").

**Cert:** 5 (structural — arithmetic over declared constants).

---

## REQ-143 — Public API on `window.SoilContribution`

**Statement:** `window.SoilContribution` exists at runtime and exposes
`BANK_MG_M2`, `CONTRIBUTING`, `WEEKS_PER_MONTH`, `weeklyContribution`,
`monthsToDepletion`, `renderGrid`. Consumers MUST reach for the namespace,
not bare module-scope constants/functions, so internals can be reshaped
(per-bed scaling, seasonal factor, depth-resolved bank) without breaking
call sites. Same discipline as REQ-080 / REQ-097 / REQ-103; REQ-139 enforces
no-inline-reimplementation at verifier level.

**Cert:** 5 (structural).

---

## REQ-145 — Pourquoi modal interpretation strings (this spec owns the bytes)

**Statement:** Soil-bank pourquoi modal prose (one per element row in
Block 2) is **owned by this spec entry**. Code calls
`renderSpec('REQ-145', '<key>', { el })`; MUST NOT inline prose at call
site. Six keys below, one per branch of per-element interpretation logic
in `nutrition/tomato/app/logic.js` `buildNutrimentTomato` ↔ soil block.
REQ-144 forbids hand-written stable strings; bytes injected via
`window.SPEC_STRINGS`.

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

- **REQ-060** (`nutrition/spec.md`) — pourquoi interpretation strings must
  be auto-derived or carry `// stable —`. `renderGrid` emits no narrative.
  REQ-145 supersedes the `// stable —` escape hatch for the soil-bank modal.
- **REQ-139** (`requirements.md`) — call sites MUST go through
  `window.SoilContribution`, not redeclare constants/formulas inline.
- **REQ-144** (`requirements.md`) — operator-facing prose requires
  `data-prose-source`. REQ-145 render emits `<span data-prose-source="REQ-145">…</span>`.
