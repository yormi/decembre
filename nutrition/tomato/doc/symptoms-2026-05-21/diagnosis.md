# Symptom diagnosis — 2026-05-21 photos

**Date written:** 2026-05-24
**Photos:** `nutrition/tomato/doc/symptoms-2026-05-21/PXL_20260521_*.jpg`
**Anchors:**
- Tissue panel — `nutrition/tomato/doc/tomato-t5-tissue-analysis-2026-05-23.md` (TOM #1 T5, sampled 14 mai, reported 22 mai)
- SME/Mehlich — `nutrition/doc/SME - 2026-04-10.pdf`, `nutrition/doc/mehlich-3 - 2026-04-10.pdf`
- BER / Ca investigation — `nutrition/tomato/doc/ca-ber-investigation-tests-2026-05-24.md`
- STORED foliar Spray A — `nutrition/tomato/foliar-strategy/procedure/stored.js`

Photos taken one week before tissue report; same cohort + bed. Diagnoses pair the visual pattern with the tissue values + lockout-model predictions from § 3 of the T5 analysis.

---

## Per-photo reads

### `PXL_20260521_172613938.jpg` — interveinal chlorosis, mid-canopy, no speckling
**Lead:** early-stage Mn toxicity (continuum with photo #2). **Cert 2.**

- Pattern: interveinal yellow on basal half of leaflet, veins stay green, apex green. No necrotic spotting yet.
- Mg deficiency ruled weaker — tissue Mg 0.52 % is **mid-suff** (vs floor 0.31 %) and modelled Mg supply is **+101 %** of demand (§ 3, T5 analysis). Mg-deficiency interveinal usually requires tissue at or below floor.
- Fe deficiency ruled out — tissue Fe 80 ppm (suff); Fe-deficient interveinal hits upper/young leaves first, not mid-canopy.
- Mn-toxicity story (see photo #2) fits a continuum where this leaf is the earlier-stage version on the same plant.
- **Alternative still open:** localized Mg uptake disruption from cation antagonism (K + Mg flooding the root; see Ca/BER investigation mechanism B). Doesn't change the action — both share the same fertigation-side lever.

### `PXL_20260521_172634558.jpg` — interveinal necrosis + purple-bronze speckling
**Lead: Mn toxicity from foliar overshoot. Cert 3.**

- Pattern: bronze/purple necrotic speckling between veins across whole leaflet + neighbouring leaflets on the same compound leaf; veins stay green. **Textbook tomato Mn toxicity** (Marschner Ch. 9 — "brown spots scattered through the leaf, interveinal").
- Tissue confirms: Mn **132 ppm vs ceiling 100** (+32 %, lab flagged élevé).
- Delivery side fits: foliar Spray A delivers MnSO₄ 22 g / 15 L / wk, modelled foliar contribution **5.4 mg Mn / m² / wk** (§ 3) — alone larger than tomato Mn demand (~7.5 mg / m² / wk). Foliar bypasses pH 7.4 root lockout (REQ-194) so it lands at full availability regardless of soil chemistry.
- Soil-side Mn lockout (SME Mn < 0.03 ppm) does NOT contradict — the toxicity is **foliar-deposited Mn accumulating in leaf tissue**, not root uptake.
- **Action lever:** Mn foliar rate already at the upper edge for our spray pH (REQ-194 foliarPhResponse). First step is a STORED Spray A trim on MnSO₄ — gated on `/retire-recipe`. Confirm via next tissue panel; if Mn drops and speckling regresses on new growth, hypothesis closed.

### `PXL_20260521_172934654.jpg` — lower-leaf marginal yellow chlorosis, tip browning
**Lead: K deficiency starting. Cert 3.**

- Pattern: bright yellow apex + one margin, midblade green, tip beginning to brown. **Classic K marginal scorch** on an older/lower leaf — K is mobile and pulls from older leaves first when supply equals demand with no luxury reserve.
- Tissue: K **3.26 % at lab floor 3.00 %** — one step from déficient, no luxury reserve.
- Modelled delivery: K supply ≈ demand (§ 3, ±0 %), so there's nothing in reserve when transient demand or distribution failure occurs.
- **Anchor:** consistent with operator-side ramp on K₂SO₄ that already landed 2026-05-23 (STORED T5 K₂SO₄ 3 489 → 7 000 g, doublé; see changelog). If this photo predates the STORED ramp visibility in new growth, it should regress on leaves emerging post-ramp. Watch the next-cohort photo.

### `PXL_20260521_172940425.jpg` — tan necrotic blotch with chlorotic halo
**Lead: differential — K marginal necrosis OR early-blight (Alternaria solani). Cert 2.**

- Pattern: tan necrotic blotch ~30 % of blade with bright chlorotic halo on the right margin, plus smaller interveinal lesions left of midrib.
- **Nutrition reading (K-advanced):** progression of photo #3 — K marginal yellowing turning to necrotic blotches as the cell wall collapses. Plausible given tissue K at floor.
- **Biotic reading (Alternaria):** tan necrosis with concentric rings + chlorotic halo is the classic early-blight signature in tomato; favoured by canopy humidity + lower-leaf age. The shape in the photo is suggestive but not conclusive (concentric rings not fully resolved in the frame).
- **Action:** needs ground-truth — inspect the live leaf for concentric rings and check whether lesions cluster on lower vs mid canopy. If concentric rings visible → biotic, route to disease lane (not nutrition). If diffuse marginal-to-interveinal yellowing-then-collapsing without rings → K continuum with photo #3. PA Taillon visit + photo close-up is the cheapest disambiguator.

### `PXL_20260521_172950014.jpg` — full lower-leaf senescence next to fruit truss
**Lead: N deficiency / fruit-fill mobilization. Cert 4.**

- Pattern: lower leaf almost entirely yellow with brown midrib/marginal streaks; green retained only along basal veins; positioned directly next to a green+red fruit truss.
- Tissue: N **2.27 % vs lab floor 3.10 % (-27 %)**, déficient.
- Modelled gap (post 2026-05-23 FarinePlumes refit eff 0.75 → 0.70): N **-26 %**, matching tissue almost exactly. Textbook fruit-load N mobilization — N pulled out of lower leaves to fill fruit, lower leaves go yellow first.
- **Action lever:** sidedress ramp already #1 priority per § 5 of T5 analysis (STORED Farine ramp 1 341 → 1 773 g/planche/wk T5, gated on `/retire-recipe`). Foliar Ocean fish hydrolysate (EZ-GRO Ocean 15-1-1, `nutrition/doc/EZ-GRO Ocean 15-1-1.pdf`) is the #2 complementary lever for next-cohort tissue.

---

## What's NOT in these photos (worth flagging)

- **No Ca-deficiency leaf symptom.** Ca is leaf-immobile in tomato — Ca deficiency stays in fruit (BER) + growing tips, not blades. Tissue Ca déficient (3.46 % vs floor 4.00 %) but the photos correctly show no Ca-style apical necrosis or marginal cup. The BER fruit channel is where Ca shows up; see Ca/BER investigation.
- **No P-deficiency purple-flush.** Tomato P deficiency would show as undersurface purple/anthocyanin flush on young leaves + stunted growth. None visible here despite tissue P -54 %. Either the cultivar's anthocyanin response is muted under our conditions, or the leaves photographed weren't young enough to express it. Worth a young-tip close-up in the next photo round.

---

## Cross-photo summary

| Photo | Lead diagnosis | Cert | Lever |
|---|---|---:|---|
| #1 — `172613938` | early Mn-toxicity (or cation antagonism) | 2 | foliar Mn trim + fertigation cation rebalance |
| #2 — `172634558` | **Mn toxicity, foliar overshoot** | **3** | foliar Spray A MnSO₄ trim — `/retire-recipe` gated |
| #3 — `172934654` | K marginal — at-floor with no luxury | 3 | K ramp already landed 2026-05-23; watch new growth |
| #4 — `172940425` | K-advanced vs Alternaria — needs ground-truth | 2 | PA Taillon visit + lesion close-up |
| #5 — `172950014` | **N déficience, fruit-fill mobilization** | **4** | Farine ramp 1 341 → 1 773 g/planche/wk T5 — `/retire-recipe` gated |

**Most actionable new finding:** photos #1 + #2 surface **Mn toxicity** as a likely new mechanism — tissue Mn élevé (132 ppm) plus the bronze speckling pattern. Was not previously named in the T5 analysis (which catalogued Mn as élevé but didn't tie it to visible leaf symptoms). Suggests the foliar Spray A MnSO₄ rate is past optimum at our spray-pH × leaf-uptake combination. Worth a candidate STORED trim entry alongside the MgSO₄ trim already flagged.
