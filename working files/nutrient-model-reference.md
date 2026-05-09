# Nutrient model reference — consolidated source-of-truth audit

Last compiled: 2026-05-05. Do not edit constants in this file — copies of values from `index.html` and `farm info/farm-baseline-updated.md`. Edits go to source.

Cert scale: 0 = pure guess, 5 = rock-solid (per CLAUDE.md / REQ-003).

---

## 1. Operational context

### 1.1 Site, area, equipment

| Parameter | Value | Source | Cert |
|---|---|---|---|
| Greenhouse footprint | 108 × 120 ft = 1 204 m² | farm-baseline §Operation Overview | 5 |
| Built | summer 2025 | baseline | 5 |
| Tomato area | 7 beds × 54.7 m² = **382.9 m²** | `index.html:1650-1651` (`TOMATO_BED_AREA`, `TOMATO_NUM_BEDS`) | 5 |
| Lettuce area | 4.5 beds × 30.4 m² = **136.8 m²** | `index.html:1652-1653` (`LETTUCE_BED_AREA`, `LETTUCE_NUM_BEDS`) | 5 |
| Bed surface fraction | ~520 m² (compost-amended) | baseline §Infrastructure | 4 |
| Dosatron | D25 series, **2%** fixed | baseline §Equipment + `index.html:2038` (`getRatio()=2`) | 5 |
| Stock barrel volume | computed = `(weeklyL / 3) × 0.02` | `index.html:2212-2215` (`getStockVol()`) | 5 |
| Lighting | 220 µmol/m²/s nursery; 200 µmol/m²/s lettuce beds; tomato sun-only | baseline | 5 |
| Irrigation target | 2 mL/(J/cm²)/m²/day | baseline + `index.html:3378` (mass-flow formula) | 4 |
| Certification | organic; certifier listed as "[CONFIRM — Ecocert / Québec Vrai / other]" | baseline §Operation | 2 |

### 1.2 Crop calendars (tomato T-stages)

`index.html:2106-2129` and `2124` (`getStageFromWeek`):

| Stage | ISO weeks | Duration | Phase |
|---|---|---|---|
| T1 | 51–2 | 4 wk | Établissement / démarrage |
| T2 | 3–6 | 4 wk | Croissance végétative |
| T3 | 7–9 | 3 wk | Floraison, premiers fruits |
| T4 | 10–18 | 9 wk | Production montante |
| T5 | 19–26 | 8 wk | Pleine production |

Total cycle: 28 wk (mid-Dec transplant → late July crop-out).

Lettuce cycle: 7-week total (5 wk nursery + 2 wk bed; running 3-wk bed while pH is broken). 26 cycles/yr (baseline).

### 1.3 Soil crisis snapshot — April 2026 (Berger Labs)

| Bed | pH | EC mmhos/cm | P kg/ha | K kg/ha | Ca kg/ha | Mg kg/ha | CEC meq/100g |
|---|---|---|---|---|---|---|---|
| Tomato | 7.28 | 2.41 | 557.7 | 2 118.4 | 10 989.1 | 1 646.3 | 33.1 |
| Lettuce | 7.48 | 1.06 | 678.4 | 644.9 | 10 612.4 | 934.0 | 27.9 |

Source: `index.html:3878-3895` (`MEHLICH_DATA`). Cert 5 (lab data).

Root cause: Savaria ORGANIMIX marin shrimp compost (calcitic-lime-amended), 2 in. on 520 m² beds fall 2025 → ~2 788 kg Ca/ha. Secondary: 60 concrete sonotubes (perpetual slow Ca leach). Source: baseline §Root Cause Diagnosis. Cert 5 (confirmed 2026-04).

Water analysis (Berger 39086, 2026-04-09): pH 6.26, alk 24.7 ppm CaCO₃, EC 0.10 mmhos/cm, Ca 4.8 ppm. **Not the cause.** `index.html:792-799` comment.

### 1.4 What's been removed (and why)

| Removed | Date | Reason | Source |
|---|---|---|---|
| Citric acid in fertigation | 2026-04-26 | Water alk 25 ppm too low; soil buffering (~140 meq/L at CEC 28) dwarfs water acid load (0.001 meq/L). Sulfur is the real lever. | `index.html:2221-2237` |
| Plantiful (BioSun) | 2026-04-26 | Kelp + Bacillus + yucca — not fulvic; mechanism doesn't address Ca-saturated alkaline lockout. ~$900-1500/yr saved. | `index.html:1700-1707` |
| Sulfate oligos in fertigation (Fe, Mn, Zn, Cu, B, Mo) | 2026-04-26 | Sulfate forms precipitate at pH 7.4. Foliar handles micros until pH < 6.5. | `index.html:1662-1682` |
| Fe-EDDHA (foliar) | 2026-04-29 | Synthetic chelate NOT on CAN/CGSB-32.311 (only ferric oxide, ferric/ferrous sulfate, iron citrate, iron tartrate permitted). Replaced by Iron DL. | `index.html:2347-2354` |
| Lettuce foliar (entire program) | 2026-04-29 | Fe moved to nursery + production fertigation FeSO₄. Foliar bypass less efficient than acidic-substrate nursery loading. | `index.html:2370-2374` |
| Foliar P | 2026-04-29 | Cuticle barrier limits uptake to 5-15%. Risk of Cu-protein gel with fish. Real fix is sulfur → unlock Mehlich P bank. | baseline §Key Decisions |
| EZ-GRO Ocean drench | 2026-05-02 | Biofilm risk in fertigation lines; granular side-dress carries the soil N program. Card markup preserved in git history. | `index.html:509-512` + REQ-004 §Remaining clean-up |

---

## 2. Plant demand

### 2.1 `TOMATO_FRUIT_EXPORT` — fruit-only export per kg fresh fruit

`index.html:3051-3063`. Derived from Yara fruit-vs-vegetative split applied to `TOMATO_REMOVAL`.

| Element | g/kg fruit | Cert | Notes |
|---|---|---|---|
| N  | 1.5    | 4 | 60% of 2.5 g/kg whole-plant |
| P  | 0.24   | 4 | 60% × 0.4 g/kg |
| K  | 2.1    | 4 | 60% × 3.5 g/kg |
| Ca | 0.075  | 4 | **5%** × 1.5 g/kg (xylem-mobile only, 95% retained in canopy) |
| Mg | 0.1    | 3 | 25% × 0.4 g/kg |
| Fe | 0.006 mg/kg | 1-2 | 60% default — data gap |
| Mn | 0.003 mg/kg | 1-2 | 60% default — data gap |
| Zn | 0.0018 mg/kg | 1-2 | 60% default — data gap |
| B  | 0.0018 mg/kg | 1-2 | 60% default — data gap |
| Cu | 0.0006 mg/kg | 1-2 | 60% default — data gap |
| Mo | 0.00003 mg/kg | 1-2 | 60% default — data gap |

### 2.2 `BIOMASS_DEMAND[stage]` — vegetative uptake mg/m²/wk

`index.html:3201-3290`. Sources: Haifa F-144 daily program + Sonneveld/Voogt ratios + ISHS 893_112 (cert 3-4 macros, 1-2 micros).

| El | T1 | T2 | T3 | T4 | T5 | Cert |
|---|---|---|---|---|---|---|
| N  |  700 | 1 050 | 1 750 | 1 275 | 1 500 | 3-4 |
| P  |  160 |   240 |   640 |   204 |   240 | 3-4 |
| K  | 2 200 | 2 950 | 4 640 | 1 785 | 2 100 | 3 |
| Ca |  560 |   840 | 1 400 | 1 817 | 2 138 | 3 |
| Mg |  175 |   265 |   440 |   383 |   450 | 3 |
| Fe |    8 |    14 |    18 |   5.1 |     6 | 1-2 |
| Mn |  2.0 |   3.5 |   4.0 |  2.55 |     3 | 1-2 |
| Zn |  1.0 |   1.8 |   2.2 |  1.53 |   1.8 | 1-2 |
| B  |  1.0 |   1.5 |   2.0 |  1.53 |   1.8 | 1-2 |
| Cu |  0.2 |   0.3 |   0.4 |  0.51 |   0.6 | 1 |
| Mo | 0.02 |  0.03 |  0.04 |0.0255 |  0.03 | 1 |

T4 = T5 × 0.85 (cert 2 — extrapolation). T5 derived top-down: `BIOMASS[T5] = TOMATO_REMOVAL × 1500 − TOMATO_FRUIT_EXPORT × 1500`. Comment at `index.html:3140-3160` documents the formula and the 0% delta at yield=1.5.

### 2.3 `TOMATO_REMOVAL` (legacy, kept for traceability)

`index.html:3012-3024`. Whole-plant uptake per kg fresh fruit.

| El | g/kg | Source notes |
|---|---|---|
| N | 2.5 | Yara 2.3 / Sonneveld 2.5 (cert 4) |
| P | 0.4 | Yara 0.18-0.36 / Sonneveld 0.57 (cert 4) |
| K | 3.5 | Yara 2.4-3.3 / Sonneveld 4.0 (cert 4) |
| Ca | 1.5 | Yara 1.54 / Sonneveld 2.65 (cert 4) |
| Mg | 0.4 | Yara 0.27-0.54 / Sonneveld 0.67 (cert 4) |
| Fe | 0.010 (mg) | est., cert 2 |
| Mn | 0.005 (mg) | est., cert 2 |
| Zn | 0.003 (mg) | est., cert 2 |
| B  | 0.003 (mg) | est., cert 2 |
| Cu | 0.001 (mg) | est., cert 2 |
| Mo | 0.00005 (mg) | est., cert 2 |

Marked DEPRECATED 2026-05-04. The Bilan no longer multiplies this by yield — it uses FRUIT_EXPORT × yield + BIOMASS_DEMAND[stage] instead.

### 2.4 Lettuce demand

**No lettuce demand model exists in the app.** `BIOMASS_DEMAND` is tomato-only (`index.html:3201`), `calcNutrDemand()` only iterates `TOMATO_FRUIT_EXPORT` keys (`index.html:3505-3519`), and `calcNutrSupply` is hardcoded to tomato (`index.html:3522` — `TOMATO_NUM_BEDS * TOMATO_BED_AREA`). The Bilan page (`#admin/nutriment`) is tomato-only by construction.

Lettuce fertigation `LETTUCE` const exists (§4.1.2) but no demand-side comparison in code.

### 2.5 Demand at target yield 1.5 kg/m²/wk, T5

Computed from §2.1 + §2.2 (mg/m²/wk):

| El | Fruit (yield × export) | Biomass (T5) | Total demand |
|---|---|---|---|
| N  | 2 250 | 1 500 | **3 750** |
| P  |   360 |   240 |   **600** |
| K  | 3 150 | 2 100 | **5 250** |
| Ca |   112 | 2 138 | **2 250** |
| Mg |   150 |   450 |   **600** |
| Fe |     9 |     6 |    **15** |
| Mn |   4.5 |     3 |   **7.5** |
| Zn |   2.7 |   1.8 |   **4.5** |
| B  |   2.7 |   1.8 |   **4.5** |
| Cu |   0.9 |   0.6 |   **1.5** |
| Mo | 0.045 |  0.03 | **0.075** |

---

## 3. Passive supply (sol)

### 3.1 SME — Saturated Media Extract (root-zone availability)

`SME_TEST_DATE = '2026-04-10'` at `index.html:3361`.

#### 3.1.1 `SME_TOMATO_PPM` (`index.html:3362-3374`)

| El | ppm | Spec range | Status | Cert |
|---|---|---|---|---|
| N (NO₃+NH₄) | 45.4 (45.0 NO₃ + 0.4 NH₄) | 35-180 / 0-20 | ✓ | 5 |
| P  | 1.1 | 5-50 | **⬇ locked** | 5 |
| K  | 292.3 | 35-300 | ✓ near top | 5 |
| Ca | 238.8 | 40-200 | **⬆ saturated** | 5 |
| Mg | 79.3 | 20-100 | ✓ | 5 |
| B  | 0.18 | 0.05-0.5 | ✓ | 5 |
| Cu | 0.04 | 0.01-0.5 | ✓ | 5 |
| Fe | 0.86 | 0.30-3 | ✓ in spec, but calcareous lockout suppresses real uptake | 5 |
| Mn | 0 (<0.03) | 0.02-3 | **⬇ locked** | 5 |
| Mo | 0.02 | 0.01-0.05 | ✓ (anion, MORE available at high pH) | 5 |
| Zn | 0 (<0.03) | 0.02-3 | **⬇ locked** | 5 |

Plus pH/EC: `SME_TOMATO_PPM_FULL = { ...SME_TOMATO_PPM, EC: 2.44, pH: 6.99 }` at `index.html:3904`.

#### 3.1.2 `SME_LETTUCE_PPM` (`index.html:3898-3902`)

| El | ppm | Status |
|---|---|---|
| pH | 7.09 | ⬆ above SME spec 5.2-6.5 |
| EC | 1.08 | ✓ |
| N  | 72.6 | ✓ |
| P  | 0.8 | **⬇ locked** |
| K  | 54.4 | ✓ |
| Ca | 114.4 | ✓ |
| Mg | 30.2 | ✓ |
| B  | 0.17 | ✓ |
| Cu | 0.03 | ✓ near floor |
| Fe | 0.22 | **⬇ below 0.30 spec** |
| Mn | 0 | **⬇ locked** |
| Mo | 0.02 | ✓ |
| Zn | 0 | **⬇ locked** |

### 3.2 Mass-flow supply model

`weeklyMassFlowL()` at `index.html:3388-3390`: `(2 mL × solar J/cm²/day × 7) / 1000` = L/m²/wk.
`soilWeeklyAvailable(elem, phLocked, transpFactor)` at `index.html:3469-3484`:
- Base supply = `SME_ppm × weeklyMassFlowL × transpFactor`
- Element-specific efficiency:
  - Fe (with `phLocked`): **0.15** (10-20% midpoint, cert 4) — note: aligned 2026-05-05; was 0.30
  - N: `0.85 × N_MINERALIZATION_BY_MONTH[month]` (cert 3, Q10≈2 from Stanford & Smith 1972)
  - All others: 1.0
- `transpFactor` floor 0.4, cap 1.0 (`index.html:3415-3419`)

`N_MINERALIZATION_BY_MONTH` (`index.html:3439-3452`): Jan/Feb/Dec 0.6 · Mar 0.8 · Apr 1.0 (baseline) · May 1.3 · Jun 1.7 · Jul/Aug 2.0 · Sep 1.5 · Oct 1.1 · Nov 0.8.

### 3.3 Mehlich-3 reservoir (`MEHLICH_DATA`, `index.html:3878-3895`)

Used by the `#admin/soltarget` page only. Not used in supply calculation (would double-count vs SME mass-flow per design — `index.html:3346-3357` comment).

| Param | Tomato 596615 | Lettuce 596617 |
|---|---|---|
| pH-Eau | 7.28 | 7.48 |
| pHbuffer (SMP) | 7.19 | 7.15 |
| EC | 2.41 | 1.06 |
| NO₃ | 36.3 | 69.4 |
| NH₄ | 0 | 2.3 |
| P | 557.7 | 678.4 |
| K | 2 118.4 | 644.9 |
| Ca | 10 989.1 | 10 612.4 |
| Mg | 1 646.3 | 934.0 |
| Na | 221.2 | 137.9 |
| B | 0.3 | 0 |
| Cu | 4.6 | 6.1 |
| Fe | 310.9 | 321.7 |
| Mn | 50.7 | 63.7 |
| Zn | 11.5 | 10.8 |
| Al | 535.4 | 782.4 |
| CEC | 33.1 | 27.9 |

### 3.4 pH lockout effects (Cadre framework — `index.html:1483-1606`)

Per-nutrient fertigation efficiency at pH 7.4 vs target pH 6.2:

| Element | pH 7.4 | pH 6.2 | Multiplier when sulfur lands | Cert |
|---|---|---|---|---|
| N (NO₃) | 70-90% | 70-90% | = | 4 |
| Mo | 70-90% | 70-90% | = (anion) | 4 |
| K (K₂SO₄) | 60-80% | 70-85% | 1.1× | 3 |
| Mg (MgSO₄) | 50-70% | 60-80% | 1.1× | 3 |
| B (Solubore) | 50-70% | 50-70% | ~ | 3 |
| N organique (poisson) | 30-60% | 30-60% | — | 3 |
| Mn (MnSO₄) | 10-30% | 50-70% | **2-3×** | 4 |
| Fe (FeSO₄) | 10-20% | 60-80% | **3-4×** | 4 |
| Zn (ZnSO₄) | 5-20% | 40-60% | **3-4×** | 4 |
| P (toute forme) | 5-15% | 30-50% | **3-4×** | 4 |

---

## 4. Channel recipes

### 4.1 Fertigation (Monday morning weekly)

#### 4.1.1 `TOMATO_STAGES` — g/wk total (over whole 382.9 m² tomato area)

`index.html:1655-1661`. Multipliers: K 1.0×, Mg 1.5× (`index.html:2039-2040`).

| Stage | MgSO₄ g/wk (×1) | K₂SO₄ g/wk | After ×1.5 Mg |
|---|---|---|---|
| T1 | 276 | 410 | 414 |
| T2 | 873 | 1 297 | 1 310 |
| T3 | 723 | 1 689 | 1 085 |
| T4 | 1 171 | 2 929 | 1 757 |
| T5 | 1 396 | 3 489 | 2 094 |

Cert: 3-4 (PA Taillon source × 1.5 multiplier toward Décembre target).

#### 4.1.2 `LETTUCE` — per 100 m² per week (over whole 136.8 m² lettuce area)

`index.html:1699`:

```
const LETTUCE = { mgSulfate: 467, kSulfate: 2996, feSulfate: 7.5 };
```

For 4.5 planches × 30.4 m² = 136.8 m² → scale ×1.368:
- K₂SO₄: 4 098 g/wk → K 1 700 g
- MgSO₄: 639 g/wk → Mg 63 g
- FeSO₄·7H₂O: 10.3 g/wk → Fe 2.05 g

Cert: 2-3 (ungrounded by demand model — see audit Finding 5).

#### 4.1.3 Nursery fertigation (Acadie products, weekly)

`index.html:2493-2546` + UI render at `index.html:872-902`. Per L of solution:
- Acadie Poisson Hydrolysé 2-4-0.5: **13 mL/L** (bumped from 10 mL/L on 2026-04-26 for tray-finishing strategy). Cert 3.
- Acadie Algues liquides: **2 mL/L**. Cert 4 (label rate).
- FeSO₄·7H₂O 20% Fe: **15 mg/L** (= 3 ppm Fe in solution, added 2026-04-29). Cert 4.

Water per tray: 1.25 L (~25 mL/cell × 50 cells). 1× per week. Cert 5.

#### 4.1.4 Mixing rules

Tomato/lettuce barrel order (`index.html:2281-2299`):
1. Wash equipment
2. Fill barrel with stock volume water
3. **K₂SO₄ first in HOT WATER** (≤100 g/L cap, dissolves slowly cold)
4. MgSO₄ (very soluble)
5. Tomato: brasser. Lettuce: add **FeSO₄·7H₂O LAST** (just before sealing — Fe²⁺ oxidizes to Fe³⁺ in hours; brown-orange color = oxidized)
6. Slack post

Nursery order (`index.html:907-917`):
1. Water
2. Poisson hydrolysé
3. Algues
4. **FeSO₄·7H₂O on precision balance** (peat acidic pH ~5.5 keeps Fe bioavailable)
5. Measure CE in bucket: target **1.9–2.6 mS/cm**
6. Top-water with rose
7. Measure CE in substrate (30-60 min after): target **1.5–2.5 mS/cm**
8. Discard remainder (fish ferments, FeSO₄ oxidizes)

### 4.2 Foliar `FOLIAR.tomato` (`index.html:2385-2405`)

Lettuce removed entirely 2026-04-29. `FOLIAR.lettuce` is undefined.

Master tank: 15 L, 1 backpack, 383 m² coverage. Application: Wed (A) and Fri (B). Window: sunrise + 30 min to min(sunrise+3h, 10:00).

#### 4.2.1 Spray A (Wed) — oligos + Fe (per 15 L master)

| Product | Dose | El % | El delivered | Cert |
|---|---|---|---|---|
| MnSO₄ (31.5% Mn) | 22 g | 0.315 | 6.93 g Mn | 4 |
| ZnSO₄ (35.5% Zn) | 22 g | 0.355 | 7.81 g Zn | 4 |
| Solubore (20.5% B) | 7 g | 0.205 | 1.44 g B | 4 |
| CuSO₄ (25% Cu) | 4 g | 0.25 | 1.0 g Cu | 4 |
| Molybdate de sodium (39.6% Mo) | 1 g | 0.396 | 0.40 g Mo | 4 |
| Iron DL (Agro-K, 5% Fe) **à recevoir** | 150 mL | 0.05 × 1.2 g/mL | 9.0 g Fe | 3 |
| FeSO₄·7H₂O **bridge until Iron DL arrives** | 80 g/15 L | 0.20 | 16 g Fe | 4 |

Origin: Climax Conseils (`farm info/fertigation oligos éléments tomate avril.pdf`). Original recipe was 45 L bi-weekly, divided by 3 → 15 L weekly to hold concentration constant + reduce drip-off without yucca (`index.html:2335-2340`).

Iron DL math (`index.html:2347-2358`): Tomato area 0.0383 ha × upper-end 4 L/ha label rate = 153 mL → rounded to 150 mL/15 L. Cert 3 (label rate, untested at this farm).

#### 4.2.2 Spray B (Fri) — Ca for BER (per 15 L master)

| Product | Dose | El % | El delivered |
|---|---|---|---|
| Chlorure de calcium (CaCl₂·2H₂O, 27% Ca) | 100 g | 0.27 | 27 g Ca |

= 1.8 g/L Ca, mid-range BER prevention. Source: Teris. Cert 3 (Ecocert input listing for Teris industrial grade NOT yet verified — `index.html:2364-2366`). CaCl₂ as a substance is permitted per CAN/CGSB-32.311.

#### 4.2.3 Mixing/contamination rules

- **"Ne jamais mélanger Spray A et Spray B"** in same backpack (`index.html:992`). Stated cause: "le fer (A) ou le calcium (B) réagit avec les autres sels et précipite, bouchant les buses."
- A↔B comment in code: "Ca²⁺ + sulfates → gypsum precipitates in tank" (`index.html:2332`).
- Yucca surfactant pending: when received, **15 mL per 15 L (1 mL/L)**, **add FIRST** (disperser); coverage 30% → 80-90% (`index.html:2376-2383`, `index.html:1228`).
- A↔B contamination warning lives in spray-selector card; B-specific gypsum note removed (`index.html:2487-2488`).

### 4.3 Side-dressing — `TOMATO_SIDEDRESS` (`index.html:3319-3325`)

g/planche/wk (planche = 54.7 m²). Source: PA Taillon recipe (cible 13.4 kg/m² Beef) × 1.5 multiplier. Cert 3.

| Stage | Actisol 5-3-2 g | Farine de plumes 13-0-0 g | Cumulative N (cycle, 7 planches) |
|---|---|---|---|
| T1 (4 wk) | 57   | 84    | — |
| T2 (4 wk) | 180  | 267   | — |
| T3 (3 wk) | 467  | 695   | — |
| T4 (9 wk) | 755  | 1 125 | — |
| T5 (8 wk) | 900  | 1 341 | — |
| **Cycle total (7 planches × 28 wk)** | **~114 kg** | **~170 kg** | ~28 kg N total = ~73 g N/m² (~65% of demand at 1.5 kg/m²/wk) |

Lettuce side-dress: **TBD** (`index.html:666-674`). Comment: "Pour l'instant, le N est livré exclusivement en pouponnière (poisson hydrolysé Acadie + Ocean 15-1-1 sem 4-5) avant transplantation. La fertigation production apporte K, Mg et FeSO₄."

#### 4.3.1 Alternative recipe (proposition) — luzerne + frass

Documented as proposition only at `index.html:514-633`. Ca −50%, P −50% goal. Pilot before deploy. Frass Ca content varies (0.5-5%) — fournisseur-fiche required before commande. Not active.

### 4.4 Sulfur (pH program)

| Crop | Dose | Frequency | Per 100 m² | Source |
|---|---|---|---|---|
| Tomato | 1.1 kg/planche/mo | 3-4 mo | **2.0 kg/100 m²** | `index.html:384` |
| Lettuce | 1 kg/planche at retournement | 3-4 mo | **3.3 kg/100 m²** | `index.html:659` |

Baseline doc says "2-3 kg/100 m²" (`farm-baseline-updated.md:261`). Tomato is at low end, lettuce at top. Both within the band but inconsistent across crops — see audit Finding 12.

Soufre is operational, not a flux input to the Bilan (`index.html:3775-3776` + REQ-004 row).

### 4.5 Bore amendment (lettuce only, pH-triggered)

`index.html:676-714`. Solubore 15 g/planche × 4.5 = ~70 g total. Triggered when pH < 7.0 (test prévu fin août 2026). One-shot, then re-test before repeat. Lettuce Mehlich B = 0 ppm (vs 0.5-1.5 cible). Not active yet.

### 4.6 Front-loading

No `FRONTLOAD` const in code. Comment at `index.html:670` mentions "Ocean 15-1-1 sem 4-5" in nursery as the de facto front-load for lettuce, but it's not a model constant.

---

## 5. Channel efficiencies

### 5.1 Fertigation oligos at pH 7.4

See §3.4 table. All sulfate-form oligos currently REMOVED from fertigation; bypass logic implicitly applies (eff 1.0 for K, Mg, etc.; oligos not in recipe).

### 5.2 Side-dress mineralization — `SIDEDRESS_MIN_EFF` (`index.html:3339-3344`)

Steady-state weekly release as fraction of weekly application. Cold soil reduces 30-50%.

| Source | Element | Efficiency |
|---|---|---|
| Actisol pellet (manure) | N | 0.60 |
| Actisol | P | 0.50 (mineralization rate; **does not include Ca-P precipitation at pH 7.4** — see Finding 7) |
| Actisol | K | 0.85 (water-soluble in pellets) |
| Farine de plumes | N | 0.75 (70-85% mineralizes in 6-8 wk, warm GH soil) |

### 5.3 Foliar coverage

`yuccaOn ? 0.80 : 0.30` (`index.html:3545`). Source: greenhouse spray-deposition lit. Cert 3-4 (`index.html:2981-2982`).

### 5.4 Fe lockout (calcareous chemistry, pH-dependent)

Soil Fe efficiency = 0.15 when pH locked (`index.html:3481`). Cert 4. Aligned 2026-05-05; was 0.30 (too generous, contradicted Cadre + field obs).

### 5.5 Transpiration factor

`transpirationFactor(current, target)` clamps `current/target` to [0.4, 1.0] (`index.html:3415-3419`). Cert 3.

---

## 6. CE bands per compartment

### 6.1 Already in app

- **Nursery solution (in bucket)**: 1.9–2.6 mS/cm (`index.html:912`). Cert 3.
- **Nursery substrate (in cell, 30-60 min post)**: 1.5–2.5 mS/cm (`index.html:914`).
- **Lettuce/Salanova pour-through bands** (`index.html:1318-1364`):
  - Germination (sem 1-2): 1.1–2.0
  - Croissance active (sem 3-4): 2.0–3.5
  - Endurcissement pré-repiquage (sem 5): 1.7–2.5
  - 150 g push (sem 5): 2.8–3.4 (deliberately above 2.7 ceiling)
  - General ceiling: 2.7 mS/cm
- **Tomate pour-through bands** (`index.html:1378-1396`):
  - Végétatif (avant nouaison): 2.8–4.2 (ceiling 4.5)
  - Fructification: 3.5–5.5 (ceiling 6.5)

Note: pour-through bands are stage-band-by-stage. They are likely substrate or root-zone CE (×1.3-1.4 conversion noted at `index.html:1300`).

### 6.2 Specified in REQ-024 (target spec, not wired)

| Compartment | Tomato T1-T2 | Tomato T3-T5 | Lettuce | Cert |
|---|---|---|---|---|
| Irrigation at dripper | 1.5–2.5 | 2.0–3.0 | 1.2–1.8 | 4 |
| Substrate (root zone, 30-60 min post) | 1.5–3.5 | 1.5–3.5 | 1.0–2.5 | 4 |
| SME (lab) | 0.75–3.5 | 0.75–3.5 | 0.75–3.5 | 5 |

### 6.3 Foliar burn cap (REQ-025, target spec)

Default cap 8.0 mS/cm tomato, 5.0 lettuce. Cert 3. Not wired.

---

## 7. Precipitation & mixing rules

### 7.1 Documented in code/baseline

- **K₂SO₄ solubility cap**: 100 g/L (cold-water binding) — `index.html:2284`. Cert 4.
- **A↔B foliar contamination**: never mix Spray A + Spray B in same backpack (`index.html:992`). Stated cause: "fer (A) ou calcium (B) réagit avec les autres sels et précipite". Comment at `index.html:2332`: "Ca²⁺ + sulfates → gypsum".
- **Mixing order foliar**: yucca first (when available); otherwise ad-hoc (no `mixOrder` constant).
- **Mixing order fertigation**: K₂SO₄ in hot water first, MgSO₄ next, FeSO₄ last (lettuce only). Documented as steps, not as constant.
- **FeSO₄ stability**: 4 h limit per REQ-032 spec; in practice add "en dernier, juste avant de fermer le baril"; barrel sealed (`index.html:1697-1698`, `index.html:2295`).

### 7.2 Time-stability (informal)

- Fertigation barrel: ≤7 days (`index.html:805`, `index.html:1697`). Cert 3.
- Nursery solution: discard immediately after use ("le poisson fermente en quelques heures et le sulfate de fer s'oxyde", `index.html:915`). Cert 4.
- No `maxStableHours` constant.

### 7.3 REQ-029 Ksp pairs (target spec, not wired)

Listed as design intent, no `KSP_PAIRS` constant. Pairs:
- Ca²⁺ × PO₄³⁻ — never co-mix
- Ca²⁺ × SO₄²⁻ — gypsum (relevant if Ca-hard water; ours isn't)
- Fe²⁺ × PO₄³⁻ — FePO₄
- Fe²⁺ × OH⁻ — pH-dependent
- Cu²⁺ × protein — never mix Cu + fish
- Fe-chelate × free Cu²⁺ — ligand swap

---

## 8. Cert ratings table — products in active recipes

Compiled from comments in `index.html` and Ecocert-status cards (`index.html:636-644` tomato sol, `index.html:716-722` lettuce sol).

| Product | In recipe | Ecocert (CAN/CGSB-32.311) | Cert | Source / notes |
|---|---|---|---|---|
| K₂SO₄ 0-0-50 | Fertigation T/L | ✅ allowed | 5 | std organic fertilizer |
| MgSO₄ (sulfate de magnésium) | Fertigation T/L | ✅ allowed | 5 | std mineral |
| FeSO₄·7H₂O 20% Fe | Lettuce fert + nursery + Spray A bridge | ✅ allowed (Alpha Chemicals/Amazon B007ODUI76) | 4 | "ferrous sulphate is on the permitted iron sources list" — `index.html:2515-2516` |
| Actisol 5-3-2 | Side-dress | ✅ allowed (à vérifier la liste à jour) | 3 | `index.html:639` |
| Farine de plumes 13-0-0 | Side-dress | ✅ allowed (sous-produit aviaire) | 4 | `index.html:640` |
| MnSO₄ (31.5% Mn) | Foliar A | not explicitly stated in app | 2 | sulfate metals generally permitted |
| ZnSO₄ (35.5% Zn) | Foliar A | not explicitly stated in app | 2 | sulfate metals generally permitted |
| CuSO₄ (25% Cu) | Foliar A | not explicitly stated in app | 2 | annual Cu cap 4 kg/ha noted (`index.html:2342-2344`) |
| Solubore (borate de sodium, 20.5% B) | Foliar A | ✅ allowed (oligo-élément) | 4 | `index.html:720` |
| Molybdate de sodium (39.6% Mo) | Foliar A | not explicitly stated in app | 2 | usual oligo, but unverified in code |
| Iron DL (Agro-K, 5% Fe) | Foliar A (à recevoir) | ✅ "manufactured to CAN/CGSB-32.310 + 32.311 — Ecocert-compliant" | 3 | `index.html:2347-2352`. Source: Agro-K via TerraLink. |
| Fe-EDDHA | (REMOVED 2026-04-29) | ❌ not on permitted list | 5 | reason for removal `index.html:2348-2350` |
| CaCl₂·2H₂O 27% Ca (Teris) | Spray B | ⚠ "Ecocert input listing not yet verified for the Teris industrial grade — confirm before scaling. CaCl₂ as a substance is permitted under CAN/CGSB-32.311." | 2 | `index.html:2364-2366` |
| Acadie Poisson Hydrolysé 2-4-0.5 | Nursery | ✅ Acadie label is Ecocert-listed | 4 | std organic input |
| Acadie Algues liquides | Nursery | ✅ Acadie label is Ecocert-listed | 4 | std organic biostim |
| Yucca surfactant (Therm-X 70 / Yucca Ag / Quillaja) | Foliar A+B (pending) | ⚠ "confirm with certifier" | 2 | baseline §Pending; `index.html:2376-2383` mentions pending order |
| Soufre élémentaire | Sol pH program | ✅ "autorisé sans restriction" | 5 | `index.html:638`, `index.html:719` |
| EZ-GRO Ocean 15-1-1 | (REMOVED 2026-05-02 from drench, still active in nursery sem 4-5) | confirmed organic per product label | 3 | `index.html:670` mentions in nursery, no Ecocert annotation in code |
| Luzerne moulue 3-1-2 | Proposition only | ✅ "matière végétale pure, vérifier non-OGM" | 3 | `index.html:641` |
| Frass d'insectes 3-2-3 | Proposition only | ⚠ "autorisé si producteur certifié Ecocert (Entosystem QC l'est)" | 3 | `index.html:642` |

### 8.1 Ecocert annotations missing in code (gap)

Products lacking explicit Ecocert annotation in the immediately-relevant comment block of `index.html`:
- **MnSO₄**, **ZnSO₄**, **CuSO₄**, **Molybdate de sodium** — no inline organic-allowed marker. Implicitly assumed allowed (sulfate metals are on permitted list), but not declared.
- **CaCl₂ Teris grade** — explicitly flagged as "not yet verified".
- **Yucca surfactant** — pending order, source not finalized.
- **EZ-GRO Ocean 15-1-1** — referenced in nursery sem 4-5 but no Ecocert annotation in `index.html`.

---

## 9. Solar data

### 9.1 `SOLAR_BY_WEEK` (`index.html:2052-2072`)

Weeks 1-18 pinned to 20-yr Quebec City weekly averages, J/cm²/wk. Cert 5 per REQ-009. Values listed in REQ-009 table.

### 9.2 `SOLAR_BY_MONTH` (`index.html:2078-2091`)

J/cm²/day fallback for weeks 19-52: Jan 600 · Feb 900 · Mar 1300 · Apr 1700 · May 2000 · Jun 2200 · Jul 2200 · Aug 1900 · Sep 1500 · Oct 1000 · Nov 650 · Dec 500. Cert 3.

### 9.3 `getSolarRad()` semantics

`index.html:2095-2101`. Returns **J/cm²/day**. Note unit mismatch:
- `SOLAR_BY_WEEK[wk]` is **per week**, divided by 7 to get day.
- `SOLAR_BY_MONTH[month]` is **per day** directly (no divide).

So at week 19+ the function falls back to monthly-day average, which is silent fallback (no UI warning surfaced). See audit Finding 10.

---

## 10. Key formulas

| Formula | Location | Definition |
|---|---|---|
| Stock barrel volume | `index.html:2212-2215` | `(weeklyL / 3) × 0.02` (Dosatron 2%) — fertilizers concentrated in first ⅓ of weekly water |
| Weekly mass-flow L/m² | `index.html:3388-3390` | `(2 × dailyJperCm² × 7) / 1000` |
| Demand | `index.html:3505-3519` | `fruit_mg = yieldKgPerM2 × FRUIT_EXPORT[el].g × 1000`; `total = fruit + BIOMASS_DEMAND[stage]` |
| Supply (fert K, Mg) | `index.html:3528-3529` | `(grams × pct × multiplier) / area × 1000` |
| Supply (foliar) | `index.html:3556-3568` | `(g × pct) / area × 1000 × coverage` |
| Supply (sidedress) | `index.html:3586-3592` | `(g × pct × min_eff) / 54.7 × 1000` |
| Supply (soil) | `index.html:3469-3484` | `SME_ppm × weeklyMassFlowL × transpFactor × pH-aware-eff` |
| Gap chain | `index.html:3689-3700` | demand → soil → sidedress → fert → foliar (sequential subtraction, clamped ≥0) |
