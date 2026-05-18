# nutrition/doc — reference docs index

Primary sources for nutrition: lab reports, datasheets, agronomist correspondence. Read BEFORE relying on session memory.

Crisis context for most of these: pH 7.28-7.48 root-zone lockout (P/Mn/Zn unavailable), Ca-saturated soil, traced to Savaria ORGANIMIX marin shrimp compost (calcitic-lime-amended) applied 2 inches fall 2025. Water ruled out.

---

## Soil tests — current crisis (Berger Labs, April 2026)

### `mehlich-3 - 2026-04-10.pdf`
Report 39088. Mehlich-3 = total soil nutrient bank for tomato 2 + lettuce 2 beds. pH 7.28/7.48, Ca ~10,600-10,989 kg/ha, CEC 28-33 meq/100g, P 558-678 kg/ha (banked, locked).
**Reach for:** total soil reserves, March → April trends, whether Mehlich-3 P "vault" backs the SME-low-P read.

### `SME - 2026-04-10.pdf`
Report 39087. Saturated Media Extract = root-zone PLANT-AVAILABLE for tomato 1 + lettuce 1. Lockout evidence: SME pH 6.99/7.09 (above spec 5.2-6.5), P 0.8-1.1 ppm (below spec 5-50), Mn/Zn <0.03 ppm, Al elevated.
**Reach for:** what roots actually see, foliar-only Mn/Zn justification, baseline for future retests every 4-6 weeks.
**Caveat:** SME spec ranges are soilless/hydroponic. P "lockout" overstated; Mn/Zn lockouts real.

## Soil tests — pre-greenhouse (Agriquanta, July 2024)

### `Analyse de sol avant installation serre.pdf`
Report SOL-26419 (sample 2024_18052), tabular. pH 6.09, P 1,071, K 335, Ca 5,956, Mg 306 kg/ha, CEC 21.4 meq/100g, full micros + base saturation.
**Reach for:** pre- vs post-construction state; quantifying what compost + sonotubes added (Ca 5,956 → ~10,800; pH 6.09 → 7.4).

### `Analyse de sol avant installation serre Graphique.pdf`
Same SOL-26419 in graphical form (richesse bars: very low → very high).
**Reach for:** presenting baseline to non-technical viewers.

## Water (Berger Labs, April 2026)

### `analyse d'eau.pdf`
Report 39086. pH 6.26, alkalinity 24.68 ppm CaCO₃, EC 0.10, Ca 4.8 ppm + N-NO3/N-NH4/P/K/Cl.
**Reach for:** confirming water is NOT the crisis cause, justifying citric acid removal from fertigation, future water-acidification debates.

## Fertilizer / amendment datasheets

### `compost.pdf`
Savaria ORGANIMIX marin (formerly "Compost de crevette") datasheet, lot 3300. **Root cause amendment.** Guaranteed 0.5-0.1-0.1, 1.1% Ca, 25% OM, calcitic-lime-amended.
**Reach for:** explaining Ca saturation (~2,788 kg Ca/ha added fall 2025 from 2 in. on ~520 m²), cert status (BNQ type A, OMRI-equivalent), warning team NEVER to reapply.

### `EZ-GRO Ocean 15-1-1.pdf`
EZ-Gro Océan fish-protein hydrolysate — 15-1-1, 80 % amino acids, 65 % peptides. Application rates by crop.
**Reach for:** N-foliar/soil sourcing, comparison rates (1-2 kg/ha every 10-14 days), evaluating swap from Acadie Poisson Hydrolysé.

### `Acadie Fresh Seaweed Concentrate.pdf`
Acti-Sol datasheet, *Ascophyllum nodosum* from Nova Scotia. English-labelled version of "Acadie Algues liquides" wired into nursery fertigation as **AcadieKelp** (`nutrition/nursery/fertigation/data.js:81`). 0.6-<0.2-6.0 NPK; OM 13-16 %; Ca/Mg 0.05-0.15 %, S 0.3-0.6 %; **micros: B 20-40, Cu <4, Fe 30-90, Mn 3-11, Zn 4-17 ppm**; pH 7.4-8.2.
**Reach for:** populating missing `NURSERY_PRODUCTS.AcadieKelp.ions` micro values (Fe/Mn/Zn gap flagged 2026-05-09 15:50 changelog), validating 2 mL/L dose, evaluating kelp-only biostimulants.
⚠️ Ca 0.05-0.15 % — safe under current saturation. pH 7.4-8.2 alkaline; tank contribution negligible at 2 mL/L; flag if rate bumped. **Cert status**: `data.js` tags cert 4 ("Acadie Ecocert listed") but datasheet shows no badge — verify on Acadian Seaplants' Ecocert sheet before audit claims.

### `selectus-1-organic-4-2-5/` (Plant Products)
Granular organic 4-2-5 + 3.7 % Ca + 1.0 % Mg + 2.3 % S. Ingredients: luzerne, plume, os, sulfate K, crustacés, algue, phosphate roche, gypse. Mineralizes ~6 weeks. Rates: 6-12 kg/m³ pre-plant; 1-2 kg/10 m² garden.
- `fiche technique.pdf`
- `label.pdf` (Ca 4.5 % on label vs 3.7 % on datasheet — minor discrepancy)
- `Ecocert Canada FR EXP2026-11-13-1.pdf` — Nº 164357-20250917-1246, valid through 2026-11-13. CAN/CGSB-32.311 §4.2 **Amendement de sol**, no restrictions.
- `FDS.pdf` — non-hazardous WHMIS 2015; trace quartz (0-0.2 %).

**Reach for:** granular organic option for tomato/lettuce beds, slow-release N+K + bone-meal P.
⚠️ **Adds 3.7-4.5 % Ca + gypsum + bone meal — wrong direction for current Ca-saturated, high-pH beds.** S from gypsum is pH-neutral (exchanges Ca onto CEC). Do NOT recommend until bank drawn down + pH below 6.5; then attractive.

### Eco-luzerne 3-0.5-2 (Acti-Sol) — *no datasheet yet*
Pure alfalfa pellet, Quebec-made. 3-0.5-2 NPK, no animal by-products, no Ca. Slow N (mineralizes weeks). Referenced in `app/index.html:534+` for proposition tomato sidedress (Actisol → luzerne T1-T2; luzerne + frass 50/50 T3-T5; ~61 kg luzerne / 7 planches / cycle).

**Reach for:** low-Ca organic N comparison, building proposition sidedress, alfalfa-only top-dress.
✅ **Crisis-fit vs Selectus:** pure alfalfa = no Ca, no bone meal, no gypsum.
⚠️ Open: (a) Ecocert / CAN/CGSB-32.311 status unverified here (likely allowed). (b) Verify bag matches 3-0.5-2 (older Acti-Sol skews 3-1-2 — see `working files/nutrient-model-reference.md:507`). (c) Non-GMO source.
Drop PDFs in `nutrition/doc/eco-luzerne-3-0-5-2/` when they land.

### `Ligne directrice - fertilisation serres plein-sol.pdf`
Quebec greenhouse fertilization guidelines, plein-sol.
**Reach for:** province-specific plein-sol guidance vs soilless/hydro defaults, aligning with Quebec extension positions.

## Agronomist correspondence (PA Taillon — Climax Conseils)

### `fertigation oligos éléments tomate avril.pdf`
Email 2026-04-08. Tomato fertigation recipe, full oligo schedule (sulfate-K, sulfate-Mg, Fe sulfate 20 %, Zn 35 %, Mn 32 %, Cu 25 %, borax 15 %, Na molybdate 39.6 %), 5 stages T1-T5. Reservoir 170 L, injection 2 %, 8,517 L / 7 beds / 382.6 m².
**Reach for:** what PA prescribed BEFORE fertigation oligos dropped (Option C, April 2026 — sulfates precipitate at pH 7.4); planning reintroduction once pH < 6.5.
**Not currently in use** — historical baseline.

### `Recette fertigation oligo-éléments laitues - 1er mai 2026 PA.pdf`
Email 2026-05-01. Visit report + lettuce fertigation. Reservoir 208 L, injection 2 %, 10,410 L / 54.7 m². Sulfate-Mg, sulfate-K 0-0-50, Fe/Zn/Mn/Cu sulfates, borax, Na molybdate.
**Reach for:** validating lettuce-side fertigation changes, PA's stage-L1+ doses, tomato vs lettuce fertigation philosophy.

## Boron

### `Boron spray product.md`
One-line link to Solubore 20-B (Etidot 67) product page (foliar Spray A boron source).
**Reach for:** re-ordering boron, swapping suppliers, verifying Solubore spec for foliar dose math.

---

## Lives elsewhere

### `doc/farm-baseline-updated.md`
Farm-wide baseline (operation, infrastructure, crops, yield targets, root cause, monitoring). >70 % nutrition content but covers whole operation.
**Reach for:** quick crisis context, soil-test summary tables, active fertigation/foliar/nursery program, action-plan status. **Start here.**

### `doc/test de sol - pré-serre.pdf`
EnvironeX certificate 4016171 (July 2024). Heavy-metals soil contamination test pre-construction. Pb 23 mg/kg, others below detection.
**Reach for:** organic-cert heavy-metals baseline, soil-Pb questions. NOT for nutrition decisions.

### `doc/Logo - Décembre.png`
Branding asset.

---

## Conventions

- Lab reports: lab name + date in filename (`mehlich-3 - 2026-04-10.pdf`).
- Datasheets: manufacturer's product name.
- Agronomist emails: sender initials + date.
- When you add a doc, add a one-paragraph entry under the right category. State freshness if relevant ("NOT currently in use").
