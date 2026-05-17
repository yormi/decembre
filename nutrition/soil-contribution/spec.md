# Soil-contribution

Specs for the model that estimates the **weekly per-element nutrient draw
from the resident soil bank** (Mehlich-3 reservoir, Berger Labs — April 2026
tomato bed wired; lettuce bed measured but not wired).

Answers: **"how much of element X does the plant tap from the soil bank
this week, and how many months until depletion if the bank were the sole
supply?"** Does NOT answer bank refill (see `nutrition/compost-contribution/`,
`nutrition/tomato/sidedress-recipe/`) or root-surface availability
(`calculateNutritionSupply` → `supply.soil`). Source values, kg/ha → mg/m²
conversion, and refinement triggers live in `data.js` comments (or
`derivation.md` if they grow). Crop-keyed structure so lettuce can wire with
one entry.

---

## Contract

### Inputs

Per call: `crop` (string), `element` (string), and — for
`weeklyContribution` only — `demand_mg_per_m2_per_week` (number).
`monthsToDepletion(crop, element)` takes no demand argument; the runway is
SME-derived (REQ-164).

Constants (declared in `data.js`):
- `SOIL_BANK_MG_M2[crop][el]` — Mehlich-3 reservoir in mg/m² (kg/ha × 100).
- `SOIL_CONTRIBUTING[el]` — boolean map; `true` for elements whose bank
  participates in the gap chain.
- `WEEKS_PER_MONTH` — 4.33 (= 52/12).
- `SME_SOIL_SOLUTION_PPM[crop][el]` — Saturated Media Extract concentration
  in ppm (= mg/L soil solution). Berger Labs Report 39087 (April 2026).
- `TRANSPIRATION_L_PER_M2_PER_WEEK[crop]` — weekly water uptake at the
  root surface (cycle-weighted, L/m²/wk).

### Output

`window.SoilContribution`:

```
{
  BANK_MG_M2,                       // { crop: { N, P, K, Ca, Mg, Fe, Mn, Zn, B, Cu } } — mg/m²
  CONTRIBUTING,                     // { P: true, Ca: true }            — gap-chain participants
  WEEKS_PER_MONTH,                  // 4.33
  SME_SOIL_SOLUTION_PPM,            // { crop: { N, P, K, Ca, Mg, Fe, … } } — mg/L
  TRANSPIRATION_L_PER_M2_PER_WEEK,  // { crop: number }                 — L/m²/wk
  weeklyContribution,               // (crop, el, demand_mg) → number   — mg/m²/wk drawn from bank this week
  monthsToDepletion,                // (crop, el) → number | null       — SME-derived runway
  renderGrid,                       // (gapsIn, soilMg, gapsOut, monthsToDepletion) → HTML string
}
```

`weeklyContribution(crop, el, demand_mg)`:
- Returns `min(demand_mg, BANK_MG_M2[crop][el])` if `CONTRIBUTING[el]` and
  bank data exists, else `0`. `min` clamp prevents over-delivery when
  weekly demand exceeds the reservoir.

`monthsToDepletion(crop, el)`:
- Returns `BANK_MG_M2[crop][el] / (SME_SOIL_SOLUTION_PPM[crop][el] ×
  TRANSPIRATION_L_PER_M2_PER_WEEK[crop] × WEEKS_PER_MONTH)` when all three
  operands are positive, `null` otherwise (caller renders "—").
- Denominator is weekly plant uptake at measured soil-solution availability:
  SME ppm × transpiration L/m²/wk = mg/m²/wk. Low-availability elements
  (P / Mn / Zn at our pH 7.4) surface as long, throttled-draw runways
  distinct from demand-driven runways.
- Defined for any element with bank + SME data **regardless** of
  `CONTRIBUTING` — disabled rows surface runway for context (K/Mg today).

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
(`tomato`, `lettuce`, …) then by element symbol. Values are in mg/m²,
converted from the Berger lab report via two conventions: kg/ha-reported
elements (P, K, Ca, Mg) by × 100 (1 ha = 10 000 m²); ppm-reported elements
(Fe, Mn, Zn, B, Cu, N-NO3, N-NH4) by × `SOIL_REPORT_PPM_TO_MG_PER_M2`
(= 200, Berger 20 cm × 1.0 g/cm³ effective bulk density). Both crops
populated from Berger Labs Report 39088 (April 2026), samples 596615
(tomate) and 596617 (laitue). Mo absent — not measured on the Mehlich-3
panel; routes via fertigation per REQ-061. Below-detection-limit values
recorded as DL ceilings with cert 2 per P-04 (lettuce B; tomato N-NH4).

**Cert:** 4 (Berger Labs accredited, single-sample-per-bed); conversion
arithmetic = 5; DL-ceiling values cert 2.

---

## REQ-141 — Only Ca + P from the soil bank participate in the gap chain (active-channels-only K + Mg)

**Statement:** `weeklyContribution(crop, el, demand_mg)` returns non-zero
**only** when `SOIL_CONTRIBUTING[el] === true`. Otherwise returns `0` and
the gap chain passes input → output unchanged.

`SOIL_CONTRIBUTING` is fixed at `{ P: true, Ca: true }`. The choice is
architectural, not a defect in the bank-routing model:

- **Ca + P route via the soil bank.** Banks are large (Ca 11 000 kg/ha,
  P 558 kg/ha on the tomato bed) and carry weekly plant demand for
  years/decades without external resupply. Both surface in the gap-grid
  `Apport ici` column on the soil-bank contribution block.
- **K + Mg route via fertigation (K₂SO₄ + MgSO₄).** Their soil banks are
  also measured (K 2 118 kg/ha, Mg 1 646 kg/ha on the tomato bed) and
  deliver via mass-flow to the root surface (K ~4 385 mg/m²/wk, Mg
  ~1 190 mg/m²/wk at current SME × transpiration). That bank-via-mass-
  flow delivery is **not subtracted from the fertigation sizer**. The
  fertigation channel sizes against `demand − compost − sidedress`;
  soil-bank K + Mg sit outside that calculation by design. Operator-side
  headroom from bank K + Mg explains real-world tolerance to fertigation
  output that reads under REQ-013's 0.9× floor — the model is honest
  that it's sizing for the active channels only and that bank K + Mg are
  a real-but-unmodelled buffer.
- **N has no Mehlich-3 measurement of a depleting reservoir.** Bank N
  exists in the data (NO₃ + NH₄ pool) but is turnover-bound; routing N
  through the gap chain via the bank would falsely treat a quasi-steady-
  state pool as a depleting credit. N supply routes through compost
  mineralization + sidedress; tissue is the monitoring surface.
- **Micros (Fe / Mn / Zn / B / Cu / Mo) are not bank-routed.** Mehlich-3
  banks are large in mg/m² terms (Fe 62 g/m², Mn 10 g/m²) but the plant-
  available fraction is throttled by soil pH 7.4 lockout — mass-flow
  capacity sits at fractions of a mg/m²/wk for most. Foliar carries the
  active-delivery share per REQ-061 cascade (foliar bypasses root-zone
  lockout). Bank micros surface in the soil-bank gap-grid's runway
  column for context but contribute 0 to the gap chain.

**Cert:** 4 architectural choice; revisit if pH drops below 6.5 and SME
P climbs into spec (5-50 ppm) — P might exit CONTRIBUTING if active
channels (compost + sidedress + fertigation) can carry the full P
demand. Rejected alternative (subtract bank K + Mg from the fertigation
sizer; "path 1") archived in `learnings.md`.

---

## REQ-142 — Months-to-depletion = bank ÷ min(mass-flow, plant peak demand)

**Statement:** `monthsToDepletion(crop, el)` returns `null` when
`el ∈ TURNOVER_BOUND_ELEMENTS` (N today — the Mehlich-3 pool is
replenished by mineralization at quasi-steady-state; bank ÷ uptake is
a counterfactual). Otherwise returns `BANK_MG_M2[crop][el] /
(min(SME_SOIL_SOLUTION_PPM[crop][el] × TRANSPIRATION_L_PER_M2_PER_WEEK[crop],
PLANT_PEAK_WEEKLY_DEMAND_MG_PER_M2[crop][el]) × WEEKS_PER_MONTH)` when
bank + SME + transpiration are all positive, `null` otherwise.

The denominator clamps weekly uptake at the lower of (i) mass-flow
capacity — SME ppm × transpiration L/m²/wk delivered to the root surface
— and (ii) plant peak weekly demand. For lockout elements (P / Mn / Zn /
B / Cu / Fe at pH 7.4) mass-flow is below peak demand and the clamp is a
no-op; runway reads the SME-throttled form. For over-supplied elements
(Ca / Mg on the tomato bed) peak demand binds and the runway reflects the
true drain rate, not the mass-flow ceiling. Defined for any non-turnover
element with bank + SME data **regardless of `CONTRIBUTING`** — disabled
rows (K / Mg) surface reservoir runway for context.

**Cert:** 5 structural; runway values inherit the minimum cert of
`SME_SOIL_SOLUTION_PPM` (cert 4 for direct measurements, cert 2 for
<DL ceilings), `TRANSPIRATION_L_PER_M2_PER_WEEK` (cert 2 cycle-mid), and
`PLANT_PEAK_WEEKLY_DEMAND_MG_PER_M2` (cert 3 macros tomato, cert 4 macros
lettuce, cert 1-2 micros — inherits from plant-needs).

---

## REQ-143 — Public API on `window.SoilContribution`

**Statement:** `window.SoilContribution` exists at runtime and exposes
`BANK_MG_M2`, `CONTRIBUTING`, `WEEKS_PER_MONTH`, `SME_SOIL_SOLUTION_PPM`,
`TRANSPIRATION_L_PER_M2_PER_WEEK`, `weeklyContribution`,
`monthsToDepletion`, `renderGrid`. Consumers MUST reach for the namespace,
not bare module-scope constants/functions, so internals can be reshaped
(per-bed scaling, seasonal factor, depth-resolved bank) without breaking
call sites. Same discipline as REQ-080 / REQ-097 / REQ-103; REQ-139 enforces
no-inline-reimplementation at verifier level.

**Cert:** 5 (structural).

---

## REQ-164 — SME soil-solution data wired per crop, per element on the gap grid

**Statement:** `SME_SOIL_SOLUTION_PPM[crop][el]` is a two-level object
keyed by crop slug then by element symbol. Values are direct ppm readings
from Berger Labs SME analyses (Report 39087, April 2026 for the current
season). Every element row on the soil-bank gap grid (`N, P, K, Ca, Mg,
Fe, Mn, Zn, B, Cu, Mo`) MUST have an SME entry for every crop wired in
`SOIL_BANK_MG_M2` — including detection-limit ceilings recorded at the
DL value (cert 2) when the lab reports `<DL`. `TRANSPIRATION_L_PER_M2_PER_WEEK`
is a one-level object keyed by crop slug, populated for every wired crop.
Tomato and lettuce both wired today.

**Cert:** 4 for direct SME measurements; cert 2 for detection-limit
ceilings (Mn, Zn on both crops; revisit when soil pH drops below 6.5 and
those elements climb back into measurable range).

---

## REQ-145 — Pourquoi modal interpretation strings (this spec owns the bytes)

**Statement:** Soil-bank pourquoi modal prose (one per element row in
Block 2) is **owned by this spec entry**. Code calls
`renderSpec('REQ-145', '<key>', { el })`; MUST NOT inline prose at call
site. Seven keys below, one per branch of per-element interpretation
logic in `nutrition/tomato/app/logic.js` `buildNutrimentTomato` ↔ soil
block. REQ-144 forbids hand-written stable strings; bytes injected via
`window.SPEC_STRINGS`.

Element-to-key dispatcher mapping (consumer-side, mirrored here so the
spec stands alone without grepping `logic.js`):

| Element | Key | Routing rationale |
|---|---|---|
| Ca | `Ca` | CONTRIBUTING; bank-routed (REQ-141) |
| P  | `P`  | CONTRIBUTING; bank-routed despite pH-lockout (only viable channel) |
| K  | `K-fert-routed`  | measured bank; active channel = fertigation K₂SO₄ |
| Mg | `Mg-fert-routed` | measured bank; active channel = fertigation MgSO₄ |
| N  | `N-not-mehlich`  | turnover-bound; runway null (REQ-142) |
| Fe, Mn, Zn, B, Cu | `micros-foliar-routed` | measured bank, plant-available fraction throttled by pH 7.4; active channel = foliar (REQ-061 cascade; CHANNEL_ROLE in `nutrition/tomato/lib/recipe-math.js` routes Fe/Mn/Zn/Cu = `{foliar:1.0}` and B = `{foliar:0.5, passive:0.5}`) |
| Mo | `default-not-mehlich` | not on Mehlich-3 panel; active channel = fertigation Na molybdate (REQ-061 anion carve-out) |

**Cert:** 5 — bytes are spec-declared; render is deterministic.

**Renders:** (bytes owned by REQ-145; the team-visible text lives here, nowhere else)

```render Ca
Sol Ca-saturé (racine de la crise pH 7,4) — réservoir essentiellement inépuisable à l'échelle hebdomadaire. La plante tire 100 % du Ca via le sol ; l'enjeu est la précipitation et le verrouillage, pas la disponibilité.
```

```render P
Banque P "coffre" ; même au taux de drawdown actuel, la réserve tient des années. Verrouillée au pH ≥ 7, mais reste la source dominante de P à long terme — la chimie limite, pas la masse.
```

```render K-fert-routed
K banque mesurée, SME en spec. Pas routé par ce bloc — le K circule via la fertigation (K₂SO₄) qui assure la livraison à la demande, et la banque suit via la trajectoire SME.
```

```render Mg-fert-routed
Mg banque mesurée, SME en spec. Pas routé par ce bloc — la fertigation (MgSO₄) couvre la demande hebdomadaire active.
```

```render N-not-mehlich
Banque N mesurée (NO₃ + NH₄) mais le réservoir est renouvelé en continu par la minéralisation de la matière organique (compost + sidedress) — quasi-équilibre, pas un stock épuisable. Le mois d'épuisement ne s'affiche pas : c'est un contre-factuel ("si la minéralisation s'arrêtait") sans réalité opérationnelle. Le suivi N passe par tissu + bilan compost / sidedress, pas par le mois d'épuisement.
```

```render micros-foliar-routed
${el} mesuré sur Mehlich-3 — banque importante en mg/m², mais la fraction biodisponible est limitée par le verrouillage pH 7,4 racinaire (cations Fe/Mn/Zn/Cu : courbe sulfate-métal ; B : adsorption sur oxydes Fe/Al + complexes Ca-borate). Apport hebdomadaire actif via le foliaire (cascade REQ-061 — contourne le verrouillage racinaire) ; la banque sert de réserve long-terme et alimente la trajectoire d'épuisement informationnelle, pas la contribution hebdo.
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
