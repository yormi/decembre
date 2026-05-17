# plant-nutrition-specialist ← product-owner (archive)

Processed entries from `from-product-owner.md`, most recent first. Specialist appends a one-line outcome under each entry when cutting it over.

## Format

Mirror of the pending entry, plus the specialist's outcome line at the bottom:

```
### Specialist outcome (YYYY-MM-DD)
<one-line note: what landed, files touched, npm run check status>
```

## Entries

## 2026-05-16 — nutrition/tomato/foliar-recipe

**Change type:** PO spec added (REQ-163); specialist scope = model layer
**REQs affected:** REQ-163 (added in `nutrition/tomato/app/spec.md`)
**Summary:** PO REQ-163 (Foliar Efficacité reactive to surfactant lever) requires the foliar channel's `efficiency` capability map to vary with the surfactant lever state. With surfactant engaged, foliar efficiency for routed elements is higher than without. Today (post-2026-05-16 capability-view flip per amended REQ-157), `FoliarRecipeTomato.efficiency` is a static per-element map; the model layer needs a surfactant axis.
**Specialist scope:**
1. Extend the foliar model's efficiency surface so the capability map varies with the surfactant input — either `FoliarRecipeTomato.efficiency(surfactant)` returning a per-element map, or `FoliarRecipeTomato.efficiency[el](surfactant)`, or whichever shape best fits REQ-157's contract (specialist picks; coder will read whatever's exposed).
2. Source the surfactant-on vs surfactant-off multiplier from `nutrition/tomato/foliar-recipe/derivation.md` (literature: cuticle penetration with surfactant, typical 1.3-2× for non-systemic micros) — cite cert tag.
3. Amend the foliar-recipe `spec.md` to declare the surfactant-aware contract (model-side analogue of REQ-163); coordinate with PO so the page-side REQ-163 and the model-side REQ stay in lockstep.
4. `scripts/check-recipes.mjs` matcher: assert the foliar efficiency map differs between `surfactant: true` and `surfactant: false` for at least one routed element.

### Specialist outcome (2026-05-16)

Model-side REQ-170 added in `nutrition/tomato/foliar-recipe/spec.md` declaring the surfactant-aware contract (`efficiencyFor(surfactant)` strictly greater for at least one routed element). `data.js` `foliarEfficiency(surfactant)` function returns `{Mn, Zn, Cu, Fe}` = 0.27 (surfactant=false) / 0.72 (surfactant=true) = coverage × foliarPhResponse(5.0). `model.js` exposes both the back-compat `.efficiency` (default-regime map for callers that don't thread the lever) and `.efficiencyFor` (function). `derivation.md` "Channel efficiency map" section refactored to a two-row table + multiplier-check (2.67× sits inside the combined retention+penetration literature band 2-4×, conservative against Sentís absorption-only 6.7×). `scripts/check-recipes.mjs` adds REQ-170 matcher asserting `efficiencyFor(true) > efficiencyFor(false)` strict for at least one element + no element regresses. `npm run check` 161/0 green; `npm test` 14/14/0 green. Coder lane: `app/index.html` line 4741 still reads `.efficiency` (the back-compat map); Block 5 surfactant lever should switch the read to `.efficiencyFor(operatorLever)` for REQ-163 page-side reactivity. **Files changed:** `nutrition/tomato/foliar-recipe/{data.js, model.js, spec.md, derivation.md}` · `scripts/check-recipes.mjs`.

## 2026-05-16 — nutrition/soil-contribution

**Change type:** PO spec added (REQ-162); specialist scope = model layer
**REQs affected:** REQ-162 (added in `nutrition/spec.md`), REQ-142 (likely amend in `nutrition/soil-contribution/spec.md`)
**Summary:** PO REQ-162 (Mois d'épuisement on the soil-bank block: SME-availability runway) reframes the depletion runway as `Mehlich-3 reservoir ÷ weekly plant uptake sustainable at measured SME`, instead of `Mehlich-3 reservoir ÷ stage-current demand` per existing REQ-142. Operator framing: the bank's runway at zero replenishment, with weekly draw throttled by current soil-solution availability. Low-SME elements (current pH 7.4 lockout — P, Mn, Zn) surface as throttled-draw runways, distinct from demand-driven runway.
**Specialist scope:**
1. Source SME values per element for tomato (and lettuce when wired) from Berger Labs Report 39087 (`nutrition/doc/SME - 2026-04-10.pdf`). Today's `nutrition/soil-contribution/data.js` carries SME comments for P/K/Mg but not as structured data — needs a `SME_SOIL_SOLUTION_PPM[crop][el]` constant or equivalent, populated for every element the PDF reports.
2. Define the SME-ppm → weekly-uptake-mg/m²/wk conversion. The math needs a root-zone water volume per m² and a plant-uptake fraction per unit time — surface the assumption explicitly in `nutrition/soil-contribution/derivation.md` with cert tag, citing literature mid-band (Sonneveld/Voogt, Haifa stage program, PA Taillon correspondence) or escalating to Guillaume if cert < 2.
3. Amend REQ-142 statement in place to switch the `monthsToDepletion(crop, el)` denominator from demand to SME-derived weekly uptake. Function signature may need to drop `demand_mg` argument (it's no longer the denominator) — or keep it for back-compat and let callers ignore. Specialist owns the API call.
4. Update `scripts/check-recipes.mjs` REQ-142 block to match the new formula.
5. New verifier block for REQ-162 if not already covered by REQ-142 — assert every element row with SME data exposes a numeric runway; rows without SME data render `—`. PO note: Guillaume asserted "we have an SME value for all element" — confirm against the PDF; if any element lacks SME measurement, surface to Guillaume before silently dropping its row to `—`.

### Specialist response (2026-05-16)

**Files changed:**
- `nutrition/soil-contribution/data.js` — added `SME_SOIL_SOLUTION_PPM[crop][el]` (tomato + lettuce, all 11 gap-grid elements) + `TRANSPIRATION_L_PER_M2_PER_WEEK[crop]` (tomato 15, lettuce 4); lettuce bed wired in `SOIL_BANK_MG_M2` alongside tomato.
- `nutrition/soil-contribution/calc.js` — `soilMonthsToDepletion(crop, element)` denominator switched from `demand_mg × WEEKS_PER_MONTH` to `SME_ppm × transpiration_L × WEEKS_PER_MONTH`; demand argument dropped.
- `nutrition/soil-contribution/model.js` — namespace gains `SME_SOIL_SOLUTION_PPM` + `TRANSPIRATION_L_PER_M2_PER_WEEK`.
- `nutrition/soil-contribution/spec.md` — REQ-142 amended in place (statement + cert reflect SME-derived runway); REQ-143 namespace key list extended; new REQ-164 declares per-crop per-element SME wiring contract.
- `nutrition/soil-contribution/derivation.md` — new file; mass-flow framing for the weekly uptake formula, per-element SME table, detection-limit handling for Mn/Zn (cert 2 ceiling), refinement triggers (next Berger SME, in-house transpiration log).
- `nutrition/tomato/app/logic.js` — call site updated to drop the demand argument.
- `scripts/check-recipes.mjs` — REQ-142 block rewritten with pinned arithmetic against tomato P, tomato Ca, lettuce Ca; REQ-143 expectedKeys + type guards extended; REQ-162 promoted from pass-with-TODO to DOM-walking row-by-row matcher; new REQ-164 block asserts SME + transpiration coverage for every banked crop × gap-grid element.

**Summary:** SME-derived depletion runway shipped end-to-end. Bank ÷ (SME ppm × transpiration L/m²/wk × 4.33) lands the locked-out elements (tomato P SME 1.1 ppm → ~65-year runway) far above the demand-derived runway, and Ca-saturated elements (tomato Ca SME 238.8 ppm → ~6-year runway) closer to a faster draw — both correct directions per the PO framing. Lettuce bed wired in parallel since the Berger reading covered both samples (596614 tomato + 596616 laitue).

**Verifier:** `npm run check` 154 passed / 0 failed (was 153/0); `npm test` 12/12 (189/189/0 individual). REQ-142 + REQ-162 + REQ-164 all wired and green. REQ-wired count 102/110.

**Open questions:**
- Mn and Zn are below detection limit (`<0.03` ppm) on both crops; I stored 0.03 (the DL ceiling) so the runway computes to a *conservative-fast* draw (cert 2 on those elements, flagged in derivation). Alternative was to store null and render `—`; I picked the ceiling because it preserves the "every banked element exposes a numeric runway" property and the conservative direction is the safe one for a warning. Surface for Guillaume's confirmation if he prefers `—`.
- Transpiration constants (tomato 15, lettuce 4 L/m²/wk) are cert 2 cycle-weighted averages. Refinement trigger documented: in-house transpiration log (weighing-tray or pump totalizer ÷ planted area) or PA Taillon bench data would raise cert to 4 and let the constant become stage-resolved if needed.
- N has Mehlich-3 measurement absent (it's not on the Berger test), so N runway is `null` → renders `—`. SME N is wired (NO3 + NH4) for future use if N ever joins the bank surface.

---

## 2026-05-16 — nutrition/soil-contribution (data completeness follow-up on REQ-162)

**Change type:** follow-up on REQ-162 — data completeness; specialist scope = data layer + model spec amend
**REQs affected:** REQ-162 (no spec edit; closes operator-facing promise via data extension); REQ-140 (statement amend in place — both unit shapes); REQ-164 (no spec edit; soil-bank gains parity with SME side already at 11-element coverage)

**Summary:** Earlier REQ-162 work wired SME for all 11 elements but left soil-bank at its 4-element shape (P/K/Ca/Mg). Direct read of Berger Mehlich-3 Report 39088 confirms the panel measures 10 of 11 gap-grid elements (everything except Mo): kg/ha for P/K/Ca/Mg/Na; ppm for Fe/Mn/Zn/B/Cu/Al/N-NO3/N-NH4. Fix is pure data extension + REQ-140 unit-shape amend; no PO spec change.

### Specialist response (2026-05-16 evening)

**Files changed:**
- `nutrition/soil-contribution/data.js` — `SOIL_BANK_MG_M2.tomato` and `.lettuce` extended 4 → 10 elements (added N, Fe, Mn, Zn, B, Cu). Sample 596615 (tomate 2) and 596617 (laitue 2) per PO instructions; values confirmed against the PDF. New constant `SOIL_REPORT_PPM_TO_MG_PER_M2 = 200` codifies the ppm conversion (Berger's 20 cm × 1.0 g/cm³, cert 4). Below-detection-limit values handled per P-04: lettuce B `<0.1` ppm → 20 mg/m² cert-2 ceiling; tomato N-NH4 `<0.06` ppm → 12 mg/m² cert-2 component (combined NO3 + NH4 = 7272 mg/m²). Stale comment "N and micros not measured on the Berger test" corrected. Mo absent — not on Mehlich-3 panel, routes via fertigation per REQ-061 carve-out.
- `nutrition/soil-contribution/spec.md` REQ-140 — statement amended in place; covers both unit shapes; sample numbers updated; DL-ceiling clause added; Mo absence named.
- `nutrition/soil-contribution/derivation.md` "Soil-bank mg/m² conversion" — expanded to document both conventions, the DL-ceiling pattern, and the 10-of-11 element coverage with Mo's exception.
- `nutrition/soil-contribution/spec.test.mjs` — new test asserting extended coverage (every crop exposes 10 elements; Mo absent).
- `scripts/check-recipes.mjs` REQ-142 block — pinned-arithmetic expected values refreshed to sample-596615/596617 exact (P 55770; lettuce Ca 1061240); tomato N test flipped from "no bank data → null" to "bank data → positive runway"; new Mo-stays-null test.

**Verifier:** `npm run check` 161/0 (was 154/0 before this pass). `npm test` 16/16/0.

**Open questions:** none blocking. The earlier-rounded numbers (e.g. P 55800 ≈ 558 kg/ha) shifted by < 0.5 % to the exact PDF values (55770 = 557.7 × 100); pinned-arithmetic verifier fixtures adjusted accordingly.

