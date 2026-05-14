# nutrition/doc — reference docs index

Primary-source documents for Ferme Décembre's nutrition work: lab reports, fertilizer/amendment datasheets, agronomist correspondence. When investigating a nutrition question (soil chemistry, fertigation, foliar program, root cause of the pH crisis, organic-cert sourcing), reach for these BEFORE relying on session memory.

The crisis context for most of these docs: pH 7.28-7.48 root-zone lockout (P/Mn/Zn unavailable), Ca-saturated soil, traced to Savaria ORGANIMIX marin shrimp compost (calcitic-lime-amended) applied 2 inches on beds fall 2025. Water analysis ruled out as cause.

---

## Soil tests — current crisis baseline (Berger Labs, April 2026)

### `mehlich-3 - 2026-04-10.pdf`
Berger Labs Report 39088. Mehlich-3 extraction = total soil nutrient bank for tomato 2 + lettuce 2 beds. Shows pH 7.28/7.48, Ca ~10,600-10,989 kg/ha (saturated), CEC 28-33 meq/100g, P 558-678 kg/ha (banked but locked), K/Mg readings.
Reach for this when: assessing total soil reserves, comparing March → April trends, deciding if Mehlich-3 P "vault" backs up the SME-shows-low-P interpretation.

### `SME - 2026-04-10.pdf`
Berger Labs Report 39087. Saturated Media Extract = root-zone PLANT-AVAILABLE nutrients for tomato 1 + lettuce 1. The lockout-evidence document: SME pH 6.99/7.09 (above spec 5.2-6.5), P 0.8-1.1 ppm (below spec 5-50), Mn/Zn <0.03 ppm (below detection), Al elevated.
Reach for this when: confirming what the roots actually see (vs. total bank), justifying foliar-only Mn/Zn strategy, baseline against future SME retests every 4-6 weeks.
Caveat: SME spec ranges are calibrated for soilless/hydroponic — see SME-spec-ranges memory note. P "lockout" is overstated; Mn/Zn lockouts are real.

## Soil tests — pre-greenhouse baseline (Agriquanta, July 2024)

### `Analyse de sol avant installation serre.pdf`
Agriquanta Report SOL-26419 (sample 2024_18052), tabular full results from before greenhouse construction. pH 6.09, P 1,071 kg/ha, K 335 kg/ha, Ca 5,956 kg/ha, Mg 306 kg/ha, CEC 21.4 meq/100g, plus micros (Cu/Mn/Zn/Fe/B/S/Na) and base saturation.
Reach for this when: comparing pre- vs post-construction soil state, quantifying what the compost + sonotubes added (Ca jumped 5,956 → ~10,800; pH 6.09 → 7.4), establishing what "normal" looked like before the crisis.

### `Analyse de sol avant installation serre Graphique.pdf`
Same SOL-26419 report in graphical/visual format (richesse interpretation: very low / low / medium / high / very high bars per parameter).
Reach for this when: presenting baseline state to non-technical viewers, eyeballing where each parameter sat on Agriquanta's scale.

## Water test (Berger Labs, April 2026)

### `analyse d'eau.pdf`
Berger Labs Report 39086. Greenhouse irrigation water analysis. pH 6.26, alkalinity 24.68 ppm CaCO₃, EC 0.10, Ca 4.8 ppm, plus N-NO3/N-NH4/P/K/Cl readings.
Reach for this when: confirming water is NOT the cause of the pH crisis (it's clean), justifying the removal of citric acid from fertigation (water alkalinity too low to matter), or before any future water-acidification debate.

## Fertilizer / amendment datasheets

### `compost.pdf`
Savaria ORGANIMIX marin (formerly "Compost de crevette") technical data sheet, lot 3300. The root-cause amendment. Shows guaranteed analysis 0.5-0.1-0.1 with 1.1% Ca, 25% organic matter, calcitic-lime-amended.
Reach for this when: explaining the root cause of the calcium saturation (~2,788 kg Ca/ha added in fall 2025 from 2-inch application on ~520 m²), confirming organic-cert status (BNQ type A, OMRI-equivalent organic input), or warning the team NEVER to reapply this product.

### `EZ-GRO Ocean 15-1-1.pdf`
EZ-Gro Océan fish-protein hydrolysate datasheet — 15-1-1 NPK, 80% amino acids, 65% peptides. Foliar/soil/hydroponic application rates by crop type.
Reach for this when: comparing/sourcing N-foliar or soil products, confirming application rates for greenhouse vegetables (1-2 kg/ha every 10-14 days), or evaluating whether to swap Acadie Poisson Hydrolysé (current nursery fish) for this alternative.

### `Acadie Fresh Seaweed Concentrate.pdf`
Acti-Sol datasheet for the ACADIE brand fresh seaweed concentrate — *Ascophyllum nodosum* from Nova Scotia, sold by Acadian Seaplants and distributed by Acti-Sol. English-labelled version of "Acadie Algues liquides" already wired into nursery fertigation as **AcadieKelp** (`nutrition/nursery/fertigation/data.js:81`). Guaranteed analysis: 0.6-<0.2-6.0 NPK; OM 13-16% (amino acids, alginic acid, mannitol, fucoidan, oligosaccharides); Ca/Mg 0.05-0.15%, S 0.3-0.6%; **micros: B 20-40, Cu <4, Fe 30-90, Mn 3-11, Zn 4-17 ppm**; product pH 7.4-8.2.
Reach for this when: populating the missing `NURSERY_PRODUCTS.AcadieKelp.ions` micro values (gap flagged in the 2026-05-09 15:50 changelog — Fe/Mn/Zn lever copy says "covered by kelp" but the nursery model shows 100% gap because micros were never quantified), validating the current 2 mL/L nursery dose against label NPK, sourcing/re-ordering the product, or evaluating kelp-only biostimulant sprays.
⚠️ **Crisis-relevant notes**: (a) Ca 0.05-0.15% — very low, safe under current Ca-saturation. (b) Product pH 7.4-8.2 (alkaline); at 2 mL/L dilution the tank-pH contribution is negligible, but worth flagging if rate is ever bumped. (c) **Organic-cert status**: `data.js` tags it cert 4 ("Acadie Ecocert listed"), but the datasheet itself does NOT print a certification badge — verify on Acadian Seaplants' Ecocert evaluation sheet before any audit-facing claim.

### `selectus-1-organic-4-2-5/` (Plant Products)
Granular organic fertilizer evaluated as a potential pre-plant or top-dress option. Contains 4 docs:
- `fiche technique.pdf` — French datasheet. Guaranteed analysis 4-2-5 NPK + 3.7% Ca, 1.0% Mg, 2.3% S. Ingredients: farine de luzerne, farine de plume, poudre d'os, sulfate de potasse de mine, farine de crustacés, extrait d'algue, phosphate de roche, gypse. Mineralizes over ~6 weeks. Rates: 6-12 kg/m³ pre-plant substrate; 1-2 kg per 10 m² garden, max once/month.
- `label.pdf` — bilingual product label (Ca declared 4.5% on label vs 3.7% on French datasheet — minor discrepancy worth noting).
- `Ecocert Canada FR EXP2026-11-13-1.pdf` — Ecocert evaluation Nº 164357-20250917-1246, valid through 2026-11-13. Listed under CAN/CGSB-32.311 §4.2 as **Amendement de sol** (soil amendment), no restrictions noted. Confirmed organic-allowed.
- `FDS.pdf` — Safety data sheet (March 2023). Non-hazardous per WHMIS 2015; trace quartz (0-0.2%, non-dusty granules).

Reach for this when: evaluating a granular organic fertilizer/amendment for tomato or lettuce beds, comparing to other top-dress products (Acti-Sol, etc.), or sourcing a slow-release N+K product with bone-meal P.

⚠️ **Crisis-relevant caveat**: this product adds 3.7-4.5% Ca + gypsum + bone meal — applying it to current Ca-saturated, high-pH beds (Ca ~10,800 kg/ha, pH 7.3-7.5) is exactly the wrong direction until the bank is drawn down and pH brought below 6.5. The S (2.3%) from gypsum is acidifying-neutral (CaSO₄ doesn't lower pH like elemental S does — it just exchanges Ca onto the CEC). Do NOT recommend as pre-plant or top-dress until soil bank/pH normalizes; once it does, the 4-2-5 + Mg + slow-release profile becomes attractive vs. fish-based alternatives.

### Eco-luzerne 3-0.5-2 (Acti-Sol) — *no datasheet in repo yet*
Granulated pure-alfalfa pellet fertilizer, Quebec-made (Acti-Sol). Guaranteed analysis 3-0.5-2 NPK — single-ingredient alfalfa meal, no animal by-products, no Ca-loading amendments. Slow-release N (mostly water-insoluble, mineralizes over weeks via microbial activity); modest K; trace P. Already referenced in `app/index.html:534+` as the alfalfa half of the proposition tomato sidedress recipe (Actisol → luzerne T1-T2; luzerne + frass 50/50 T3-T5; cycle ~61 kg luzerne / 7 planches).

Reach for this when: comparing low-Ca organic N sources, building/maintaining the proposition sidedress recipe, or evaluating alfalfa-only top-dress options for lettuce or tomato beds.

✅ **Crisis-relevant fit (vs. Selectus above)**: pure alfalfa = no Ca, no bone meal, no gypsum. Compatible with current Ca-saturated, high-pH soil — does not push the crisis worse. The N comes from plant-only protein, K from plant tissue, no calcitic carriers.

⚠️ **Open items before adoption**: (a) Ecocert / CAN/CGSB-32.311 status — likely allowed (Acti-Sol catalog is heavily certified) but **organic-cert status unverified in this repo** until the datasheet + Ecocert evaluation are dropped here. (b) Verify guaranteed analysis on the bag matches 3-0.5-2 (older Acti-Sol alfalfa skews "luzerne moulue 3-1-2" — see `working files/nutrient-model-reference.md:507`). (c) Confirm non-GMO source per existing app annotation.

When PDFs land, drop them in `nutrition/doc/eco-luzerne-3-0-5-2/` (mirroring the Selectus folder pattern) and upgrade this entry.

### `Ligne directrice - fertilisation serres plein-sol.pdf`
External reference document: Quebec guidelines for fertilization of soil-based greenhouses. Large/graphical PDF.
Reach for this when: needing province-specific guidance on plein-sol greenhouse nutrition (vs. soilless/hydro defaults), checking whether a recommendation aligns with Quebec extension service positions.

## Agronomist correspondence (PA Taillon — Climax Conseils)

### `fertigation oligos éléments tomate avril.pdf`
Email from PA Taillon dated 8 avril 2026. Tomato fertigation recipe with full oligo schedule (sulfate-K, sulfate-Mg, Fe sulfate 20%, Zn sulfate 35%, Mn sulfate 32%, Cu sulfate 25%, borax 15%, sodium molybdate 39.6%) across 5 stages (T1-T5). Reservoir 170 L, injection 2%, target 8,517 L solution / 7 beds / 382.6 m².
Reach for this when: cross-referencing what PA originally prescribed BEFORE the team dropped fertigation oligos (Option C, April 2026 — sulfate forms precipitate at pH 7.4), or when planning the reintroduction of fertigation oligos once soil pH drops below 6.5.
Note: this recipe is NOT currently in use — it's a historical/reference baseline.

### `Recette fertigation oligo-éléments laitues - 1er mai 2026 PA.pdf`
Email from PA Taillon dated 1 mai 2026. Visit report + lettuce fertigation recipe. Reservoir 208 L, injection 2%, 10,410 L solution, 54.7 m² lettuce bed reference. Recipe: sulfate-Mg, sulfate-K 0-0-50, Fe sulfate 20%, Zn sulfate 35%, Mn sulfate 32%, Cu sulfate 25%, borax 15%, Na molybdate.
Reach for this when: validating the lettuce side of any fertigation change, confirming PA's stage-L1+ doses, or comparing tomato vs. lettuce fertigation philosophies as prescribed by PA.

## Boron product reference

### `context.md`
One-line note: link to the Solubore 20-B (Etidot 67) product page used in the foliar program (Spray A). The boron source for both tomato and lettuce micronutrient sprays.
Reach for this when: re-ordering boron, swapping suppliers, or verifying the Solubore product spec used in the calculator's foliar dose math.

---

## Lives elsewhere — partial nutrition relevance

### `doc/farm-baseline-updated.md`
Farm-wide baseline (operation overview, infrastructure, crops, yield targets, root-cause diagnosis, monitoring protocol). Heavy nutrition content (>70%) but covers the whole operation, so kept in `doc/`.
Reach for this when: you need quick context on the crisis, soil test summary tables, the active fertigation/foliar/nursery program, or the action plan status. This is the single most-referenced doc — start here.

### `doc/test de sol - pré-serre.pdf`
EnvironeX certificate 4016171 (July 2024). Heavy-metals soil contamination test (As/Cd/Cr/Hg/Ni/Pb/Se) — pre-construction environmental baseline, NOT a nutrition test. Pb came in at 23 mg/kg, others below detection.
Reach for this when: needed for organic-cert paperwork (heavy metals baseline), food-safety due diligence, or if a soil-Pb question ever surfaces. NOT useful for nutrition decisions.

### `doc/Logo - Décembre.png`
Branding asset. Not nutrition-related.

---

## Conventions for adding new docs here

- Lab reports: keep the lab name + date in the filename (e.g., `mehlich-3 - 2026-04-10.pdf`).
- Datasheets: keep the manufacturer's product name as filename.
- Agronomist emails: include sender initials + date (e.g., `... 1er mai 2026 PA.pdf` for PA Taillon).
- When you add a doc, add a one-paragraph entry to this index under the right category. State certainty/freshness if relevant (e.g., "this recipe is NOT currently in use").
