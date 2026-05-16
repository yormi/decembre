# Nutrient model reference — pointer index

Last compiled: 2026-05-05. Largely superseded — most tables now live in `nutrition/**/spec.md` + `derivation.md`. This file kept as a pointer index + cross-cutting tables that have no single spec home.

Cert scale: see `nutrition/tomato/plant-needs/spec.md` ("Cert scale" — canonical).

---

## Pointer index

| Topic | Canonical home |
|---|---|
| Tomato plant demand (`TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`, `TOMATO_REMOVAL`) | `nutrition/tomato/plant-needs/spec.md` + `derivation.md` |
| Tomato fertigation recipe (`TOMATO_STAGES`, K/Mg multipliers) | `nutrition/tomato/fertigation-recipe/spec.md` + `derivation.md` |
| Tomato sidedress (`TOMATO_SIDEDRESS`, `SIDEDRESS_MIN_EFF`, `phLockoutFactor_P`) | `nutrition/tomato/sidedress-recipe/spec.md` + `derivation.md` |
| Tomato foliar (`FOLIAR.tomato.A/B`, coverage, mix rules) | `nutrition/tomato/foliar-recipe/spec.md` + `derivation.md` |
| Soil contribution (SME, Mehlich, bank, mass-flow) | `nutrition/soil-contribution/spec.md` |
| Compost contribution (release, efficiency) | `nutrition/compost-contribution/spec.md` + `derivation.md` |
| Lettuce model | `nutrition/lettuce/spec.md` (scope), `nutrition/lettuce/app/spec.md` (UI) |
| Nursery (semis) | `nutrition/nursery/**` (plant-needs, fertigation, substrate-contribution, app) |
| CHANNEL_ROLE (per-element flux ownership) | `nutrition/tomato/spec.md` REQ-011 |
| Flux bounds (under-fert / luxury) | `nutrition/tomato/spec.md` REQ-013 (≥0.9×) / REQ-014 (≤1.3×) |
| CE bands per compartment | `nutrition/spec.md` REQ-024 (note: per-shot vs time-avg still ambiguous — F8 / Ch12) |
| Foliar burn cap | `nutrition/spec.md` REQ-025 |
| pH-aware effective efficiency / Cadre framework | `nutrition/spec.md` REQ-017 + REQ-018 |
| Solubility cap, mix order, Ksp pairs | `nutrition/spec.md` REQ-021 / REQ-029 / REQ-029a-c / REQ-030 / REQ-031 / REQ-032 |
| Ecocert allowlist (REQ-002 / REQ-022) | `nutrition/spec.md` |
| Solar data (`SOLAR_BY_WEEK` 1-18 + `SOLAR_BY_MONTH` fallback) | `nutrition/spec.md` REQ-009 |
| ISO week numbering | `requirements.md` REQ-008 |

---

## 1. Operational context (cross-cutting — no single spec home)

### 1.1 Site, area, equipment

| Parameter | Value | Source | Cert |
|---|---|---|---|
| Greenhouse footprint | 108 × 120 ft = 1 204 m² | baseline §Operation Overview | 5 |
| Built | summer 2025 | baseline | 5 |
| Tomato area | 7 beds × 54.7 m² = **382.9 m²** | `index.html` (`TOMATO_BED_AREA`, `TOMATO_NUM_BEDS`) | 5 |
| Lettuce area | 4.5 beds × 30.4 m² = **136.8 m²** | `index.html` (`LETTUCE_BED_AREA`, `LETTUCE_NUM_BEDS`) | 5 |
| Bed surface fraction (compost-amended) | ~520 m² | baseline §Infrastructure | 4 |
| Dosatron | D25 series, **2%** fixed | baseline + `getRatio()=2` | 5 |
| Stock barrel volume | `(weeklyL / 3) × 0.02` | `index.html` (`getStockVol`) | 5 |
| Lighting | 220 µmol/m²/s nursery; 200 µmol/m²/s lettuce; tomato sun-only | baseline | 5 |
| Irrigation target | 2 mL/(J/cm²)/m²/day | baseline | 4 |
| Certification | organic; certifier "[CONFIRM — Ecocert / Québec Vrai / other]" | baseline | 2 |

### 1.2 Crop calendars

Tomato T-stages (`getStageFromWeek`):

| Stage | ISO weeks | Duration | Phase |
|---|---|---|---|
| T1 | 51–2 | 4 wk | Établissement / démarrage |
| T2 | 3–6  | 4 wk | Croissance végétative |
| T3 | 7–9  | 3 wk | Floraison, premiers fruits |
| T4 | 10–18 | 9 wk | Production montante |
| T5 | 19–26 | 8 wk | Pleine production |

Total cycle: 28 wk (mid-Dec transplant → late July crop-out). Lettuce cycle: 7-week total (5 wk nursery + 2 wk bed; running 3-wk bed while pH is broken). 26 cycles/yr.

### 1.3 Soil crisis snapshot — April 2026 (Berger Labs)

| Bed | pH | EC | P kg/ha | K kg/ha | Ca kg/ha | Mg kg/ha | CEC |
|---|---|---|---|---|---|---|---|
| Tomato | 7.28 | 2.41 | 557.7 | 2 118.4 | 10 989.1 | 1 646.3 | 33.1 |
| Lettuce | 7.48 | 1.06 | 678.4 |   644.9 | 10 612.4 |   934.0 | 27.9 |

Cert 5 (lab data). Root cause: Savaria ORGANIMIX shrimp compost (calcitic-lime-amended), 2 in on 520 m² fall 2025 → ~2 788 kg Ca/ha. Secondary: 60 concrete sonotubes (perpetual slow Ca leach). Water analysis (Berger 39086, 2026-04-09): pH 6.26, alk 24.7 ppm CaCO₃, EC 0.10, Ca 4.8 ppm — **not the cause**.

### 1.4 What's been removed (and why)

| Removed | Date | Reason |
|---|---|---|
| Citric acid in fertigation | 2026-04-26 | Water alk 25 ppm too low; soil buffering (~140 meq/L at CEC 28) dwarfs water acid load. Sulfur is the real lever. |
| Plantiful (BioSun) | 2026-04-26 | Mechanism doesn't address Ca-saturated alkaline lockout. ~$900-1500/yr saved. |
| Sulfate oligos in fertigation (Fe, Mn, Zn, Cu, B, Mo) | 2026-04-26 | Sulfate forms precipitate at pH 7.4. Foliar handles micros until pH < 6.5. |
| Fe-EDDHA (foliar) | 2026-04-29 | Synthetic chelate NOT on CAN/CGSB-32.311. Replaced by Iron DL (then dropped 2026-05-05). |
| Lettuce foliar (entire program) | 2026-04-29 | Fe moved to nursery + production fertigation FeSO₄. |
| Foliar P | 2026-04-29 | Cuticle barrier limits uptake to 5-15%. Real fix is sulfur → unlock Mehlich P bank. |
| EZ-GRO Ocean drench | 2026-05-02 | Biofilm risk in fertigation lines; granular sidedress carries the soil N program. Still active in nursery sem 4-5. |
| Iron DL + Yucca (Foliar Spray A) | 2026-05-05 | Dropped permanently. FeSO₄ 80 g/15 L canonical; coverage fixed 0.30. |

---

## 2. Demand at target yield 1.5 kg/m²/wk, T5 (computed reference)

Computed from `TOMATO_FRUIT_EXPORT` × yield + `BIOMASS_DEMAND[T5]`. Used by F2 / REQ-014 luxury check. Source values: `nutrition/tomato/plant-needs/spec.md`.

| El | Fruit (yield × export) | Biomass (T5) | Total demand mg/m²/wk |
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

## 3. pH lockout effects (Cadre framework — `index.html:1483-1606`)

Per-nutrient fertigation efficiency at pH 7.4 vs target pH 6.2. Cross-referenced by REQ-017 / REQ-018 (`nutrition/spec.md`).

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

## 4. Active recipes — cert + Ecocert status table (cross-cutting)

| Product | In recipe | Ecocert (CAN/CGSB-32.311) | Cert | Notes |
|---|---|---|---|---|
| K₂SO₄ 0-0-50 | Fertigation T/L | ✅ allowed | 5 | std organic fertilizer |
| MgSO₄·7H₂O | Fertigation T/L | ✅ allowed | 5 | std mineral |
| FeSO₄·7H₂O 20% Fe | Lettuce fert + nursery + Spray A | ✅ allowed (Alpha Chemicals) | 4 | "ferrous sulphate on permitted iron sources list" |
| Actisol 5-3-2 | Sidedress | ✅ allowed (vérifier liste à jour) | 3 | |
| Farine de plumes 13-0-0 | Sidedress | ✅ allowed | 4 | sous-produit aviaire |
| MnSO₄ (31.5% Mn) | Foliar A | not explicitly stated in app | 2 | sulfate metals generally permitted |
| ZnSO₄ (35.5% Zn) | Foliar A | not explicitly stated in app | 2 | sulfate metals generally permitted |
| CuSO₄ (25% Cu) | Foliar A | not explicitly stated in app | 2 | annual Cu cap 4 kg/ha |
| Solubore (20.5% B) | Foliar A + fert T5 | ✅ allowed | 4 | |
| Molybdate de sodium (39.6% Mo) | Foliar A | not explicitly stated in app | 2 | unverified in code |
| CaCl₂·2H₂O 27% Ca (Teris) | Spray B | ⚠ industrial-grade SKU unverified | 2 | F9 blocking — substance allowed |
| Acadie Poisson Hydrolysé 2-4-0.5 | Nursery | ✅ allowed | 4 | |
| Acadie Algues liquides | Nursery | ✅ allowed | 4 | |
| Soufre élémentaire | Sol pH program | ✅ "autorisé sans restriction" | 5 | |
| EZ-GRO Ocean 15-1-1 | Nursery sem 4-5 (drench dropped 2026-05-02) | confirmed per label, no inline annotation | 3 | |
| Luzerne moulue 3-1-2 | Proposition only | ✅ vérifier non-OGM | 3 | |
| Frass d'insectes 3-2-3 | Proposition only | ⚠ Entosystem QC is Ecocert | 3 | |

Removed: Fe-EDDHA (2026-04-29 — not on permitted list), Iron DL + Yucca (2026-05-05 — operational simplification).

### 4.1 Ecocert annotations missing in code (gap)

Lacking explicit Ecocert annotation in immediately-relevant `index.html` comment block: **MnSO₄, ZnSO₄, CuSO₄, Molybdate de sodium** (implicitly assumed allowed; not declared), **CaCl₂ Teris grade** (F9 blocking), **EZ-GRO Ocean 15-1-1** (nursery sem 4-5).

---

## 5. Sulfur (pH program) — cross-crop summary

| Crop | Dose | Frequency | Per 100 m² | Source |
|---|---|---|---|---|
| Tomato | 1.1 kg/planche/mo | 3-4 mo | **2.0 kg/100 m²** | `index.html:384` |
| Lettuce | 1 kg/planche at retournement | 3-4 mo | **3.3 kg/100 m²** | `index.html:659` |

Baseline band 2-3 kg/100 m². Tomato low end, lettuce above upper bound — F12 (decision pending). Soufre is operational, not a flux input to the Bilan.

---

## 6. Key formulas (pointer)

| Formula | Location | Definition |
|---|---|---|
| Stock barrel volume | `getStockVol` | `(weeklyL / 3) × 0.02` (Dosatron 2%) |
| Weekly mass-flow L/m² | `weeklyMassFlowL` | `(2 × dailyJperCm² × 7) / 1000` |
| Demand | `calcNutrDemand` | `fruit_mg = yieldKgPerM2 × FRUIT_EXPORT[el].g × 1000`; `total = fruit + BIOMASS_DEMAND[stage]` |
| Supply (fert K, Mg) | `calcNutrSupply` | `(grams × pct × multiplier) / area × 1000` |
| Supply (foliar) | `calcNutrSupply` | `(g × pct) / area × 1000 × coverage` |
| Supply (sidedress) | `calcNutrSupply` | `(g × pct × min_eff) / 54.7 × 1000` |
| Supply (soil) | `soilWeeklyAvailable` | `SME_ppm × weeklyMassFlowL × transpFactor × pH-aware-eff` |
| Gap chain | Bilan | demand → soil → sidedress → fert → foliar (sequential subtraction, clamped ≥0). Reframed 2026-05-05: sidedress dropped from supply sum, feeds Banque sol bank trajectory. |
