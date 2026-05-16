// ─── DEPRECATED 2026-05-04 ──────────────────────────────────────────────────
// TOMATO_REMOVAL is the historical "whole-plant uptake per kg fruit" ratio
// (lumps fruit export AND ongoing canopy growth into one number per kg fruit).
// It double-counted vegetative growth at production stages (T4-T5) when added
// to BIOMASS_DEMAND. Replaced by the cleaner split:
//     TOMATO_FRUIT_EXPORT  → only what physically leaves in harvested fruit
//     BIOMASS_DEMAND[stage]→ ongoing canopy / new structures (growth in place)
// Kept here for traceability and as a sanity check. A future test could assert:
//     TOMATO_FRUIT_EXPORT × yield + BIOMASS_DEMAND[T5] ≈ TOMATO_REMOVAL × yield
// at production stages (within ~10%). See `calculateNutritionDemand` for the active math.
// ────────────────────────────────────────────────────────────────────────────
// Whole-plant tomato uptake per kg fresh fruit produced.
// `g` field = grams (macros) / grams converted-from-mg (micros — 0.010 = 10 mg).
//
// CALIBRATION (revised 2026-05-06): values now align toward Koller 2016 averages
// (the reference used in OAQ ligne directrice Annexe 1, MAPAQ/Taillon committee).
// Previous Yara-anchored values were ~14-22% low for N, K, Mg vs Koller mean.
// Koller 2016 tomato averages (converted from oxide forms):
//   N 2.9 g/kg · P 0.39 g/kg (P₂O₅ 0.9 × 0.437) · K 4.48 g/kg (K₂O 5.4 × 0.83) ·
//   Mg 0.5 g/kg
// We split the difference between Sonneveld and Koller for N/K (defensible
// middle), match Koller for Mg (Mg costs ~$3-5/cycle to bump and demand evidence
// is clearer). Cert 3-4 for macros.
const TOMATO_REMOVAL = {
  N:  { g: 2.7,    unit: 'g' },   // Yara 2.3, Sonneveld 2.5, Koller 2.9 — split (≥ Tier B mean 2.57)
  P:  { g: 0.44,   unit: 'g' },   // Yara 0.36, Sonneveld 0.57, Koller 0.39 — Tier B mean (REQ-033)
  K:  { g: 4.0,    unit: 'g' },   // Yara 3.3, Sonneveld 4.0, Koller 4.48 — match Sonneveld (≥ Tier B mean 3.93)
  Ca: { g: 1.5,    unit: 'g' },   // Yara 1.54, Sonneveld 2.65 (no Koller value)
  Mg: { g: 0.57,   unit: 'g' },   // Yara 0.54, Sonneveld 0.67, Koller 0.5 — Tier B mean (REQ-033)
  Fe: { g: 0.010,  unit: 'mg' },  // est. fruit DM × leaf factor; cert 2
  Mn: { g: 0.005,  unit: 'mg' },  // est.; cert 2
  Zn: { g: 0.003,  unit: 'mg' },  // est.; cert 2
  B:  { g: 0.003,  unit: 'mg' },  // est.; cert 2
  Cu: { g: 0.001,  unit: 'mg' },  // est.; cert 2
  Mo: { g: 0.00005, unit: 'mg' }, // est.; cert 2
};

// ─── TOMATO_FRUIT_EXPORT — fruit-only nutrient export per kg fresh fruit ────
//
// Replaces TOMATO_REMOVAL on the demand side of the Bilan (2026-05-04).
// Represents ONLY the nutrients that physically leave the farm in harvested
// fruit — no vegetative tissue. Pairs with BIOMASS_DEMAND[stage] (canopy +
// new structures, growth in place) to give a non-overlapping demand model:
//     demand = TOMATO_FRUIT_EXPORT × yield  +  BIOMASS_DEMAND[stage]
//
// Derivation: Yara's published fruit-vs-vegetative split applied to the
// existing whole-plant TOMATO_REMOVAL values:
//   - N, P, K:   60% to fruit, 40% retained in canopy
//   - Ca:         5% to fruit, 95% retained in canopy (Ca is xylem-mobile
//                 only; once deposited in leaves it does not redistribute)
//   - Mg:        25% to fruit, 75% retained in canopy
//   - Micros:    60% as default (data gap — extrapolated from macro split)
//
// Cert 3-4 for macros (Yara explicit on N/P/K/Ca/Mg fruit fraction).
// Cert 1-2 for micros (no published per-element split; 60% is a working
// default that should be revisited when tissue tests separate fruit vs
// leaf tissue analyses).
//
// Numerical sample: TOMATO_FRUIT_EXPORT.N = 2.7 × 0.60 = 1.62 g/kg.
// At 1.5 kg/m²/sem fruit yield → 1.62 × 1.5 × 1000 = 2 430 mg N/m²/sem
// leaving in fruit. The remaining 1 620 mg N (40% × 2.7 × 1.5 × 1000) is
// what BIOMASS_DEMAND[T5] should account for (ongoing canopy growth).
// Updated 2026-05-06 to track TOMATO_REMOVAL Koller-aligned values.
const TOMATO_FRUIT_EXPORT = {
  N:  { g: 2.7     * 0.60, unit: 'g' },   // 1.62 g/kg — Yara 60% split, cert 4
  P:  { g: 0.44    * 0.60, unit: 'g' },   // 0.264 g/kg — REQ-033 Tier B
  K:  { g: 4.0     * 0.60, unit: 'g' },   // 2.4 g/kg — cert 4
  Ca: { g: 1.5     * 0.05, unit: 'g' },   // 0.075 g/kg — Yara: ~5% of Ca in fruit, cert 4
  Mg: { g: 0.57    * 0.25, unit: 'g' },   // 0.1425 g/kg — REQ-033 Tier B (Yara 25% split, cert 3)
  Fe: { g: 0.010   * 0.60, unit: 'mg' },  // 60% default; data gap, cert 1-2
  Mn: { g: 0.005   * 0.60, unit: 'mg' },  // 60% default; data gap, cert 1-2
  Zn: { g: 0.003   * 0.60, unit: 'mg' },  // 60% default; data gap, cert 1-2
  B:  { g: 0.003   * 0.60, unit: 'mg' },  // 60% default; data gap, cert 1-2
  Cu: { g: 0.001   * 0.60, unit: 'mg' },  // 60% default; data gap, cert 1-2
  Mo: { g: 0.00005 * 0.60, unit: 'mg' },  // 60% default; data gap, cert 1-2
};

// ─── BIOMASS_DEMAND — ongoing canopy / new-structure uptake (no fruit) ─────
//
// Why this exists: TOMATO_FRUIT_EXPORT × yield handles only the nutrients
// that physically leave the farm in harvested fruit. The plant ALSO grows
// new leaves, stems, roots, trusses every week — that biomass build-out has
// real N/P/K/Ca/Mg/micros uptake that doesn't go into fruit. Without this
// term the Bilan would read "0 demand → tout couvert" at T1-T3 (no fruit)
// and would underestimate demand at T4-T5 (canopy still growing). Total
// weekly demand = TOMATO_FRUIT_EXPORT × yield + BIOMASS_DEMAND[stage].
// The two terms are non-overlapping by construction (post-2026-05-04 split).
//
// Stage definitions (Décembre tomato cycle, transplant mid-Dec → crop-out July):
//   T1: weeks 1-4  post-transplant (établissement / démarrage)
//   T2: weeks 5-8  post-transplant (croissance végétative rapide, pré-floraison)
//   T3: weeks 9-11 post-transplant (floraison, premiers fruits)
//   T4: production montante (biomass demand drops, fruit takes over)
//   T5: pleine production (residual canopy maintenance only)
//
// SOURCES (cert 0-5 noted per element below):
//   Haifa F-144 "Daniela" greenhouse tomato program — kg/ha/day per stage,
//     plant density 23,000/ha = 2.3 plants/m², expected 195 t/ha. Macros
//     N/P/K direct, Ca/Mg derived from Sonneveld-style ratios (Ca:N ≈ 0.8,
//     Mg:N ≈ 0.25 documented in Haifa technical materials). Cert 3-4.
//   Sonneveld & Voogt, Plant Nutrition of Greenhouse Crops (2009) — uptake
//     concentration framework (UC = uptake / transpiration). Used to
//     cross-validate Ca/Mg ratios. Cert 4.
//   ISHS 893_112 — hydroponic tomato vegetative uptake: peak 59-74 DAT
//     390 mg N, 246 mg K, 208 mg Ca, 153 mg Mg, 47 mg P per plant per day.
//     Confirms Haifa ramp shape. Cert 4.
//   MDPI Agriculture 11(4):292 — phenological-stage uptake by EC method.
//     Confirms order P<Mg<Ca<K<N during vegetative. Cert 3.
//   Yara crop nutrition (qualitative) — confirms Mg peak at flowering, Ca
//     steady throughout, only ~5% of Ca ends up in fruit (95% vegetative).
//
// CONVERSIONS USED (Haifa → mg/m²/wk):
//   1 kg/ha/day × 100 (ha→m²/100) ÷ 10000 ... wait, simpler:
//   1 kg/ha = 0.1 g/m² = 100 mg/m²; × 7 days = 700 mg/m²/wk per kg/ha/day.
//   So Haifa "1.0 kg N/ha/day at days 1-10" → 700 mg N/m²/wk for T1.
//
// HAIFA TABLE (raw, for traceability):
//   Days  | N kg/ha/d | P kg/ha/d | K kg/ha/d
//   1-10  | 1.00      | 0.23      | 2.41
//   11-20 | 1.00      | 0.23      | 4.82
//   21-30 | 1.00      | 0.23      | 4.22
//   31-40 | 2.00      | 0.46      | 4.22
//   41-50 | 2.50      | 0.92      | 6.63
//   51-60 | 2.50      | 1.37      | 6.63
//   61-70 | 2.50      | 0.69      | 7.23
//   71-80 | 2.50      | 0.69      | 4.82
//
// STAGE MAPPING (Haifa days → Décembre T-stages):
//   T1 ≈ days 1-20  (transplant + early veg, light-limited Quebec winter
//                    so we discount K slightly vs Haifa subtropical light)
//   T2 ≈ days 21-40 (rapid veg, pre-flowering)
//   T3 ≈ days 41-60 (flowering onset, first fruit set)
//   T4 → production montante (ongoing canopy + new truss tissue)
//   T5 → pleine production (ongoing canopy growth at peak ~90 g DW/m²/sem)
//
// T4-T5 BIOMASS DERIVATION (revised 2026-05-04, retuned 2026-05-05):
//
// RECONCILIATION METHODOLOGY — T4 and T5 are now derived top-down from the
// well-validated whole-plant Yara/Sonneveld TOMATO_REMOVAL ratio (cert 4).
// Rationale: the earlier bottom-up Sonneveld vegetative-tissue ratios
// (P=0.37×N, K=2.5×N) gave a split-sum that diverged from the whole-plant
// reference by 30-70% on P, K (up) and Ca (down). The whole-plant ratio is
// validated against published sources (Yara, Sonneveld, ISHS, MDPI) and is
// a stronger anchor than the Sonneveld canopy-only ratios at production
// stages where most uptake is fruit-driven.
//
// FORMULA (T5, per element, at target yield 1,5 kg/m²/sem):
//   target_total_mg   = TOMATO_REMOVAL[el].g × 1500    (whole-plant uptake)
//   fruit_term_mg     = TOMATO_FRUIT_EXPORT[el].g × 1500
//   BIOMASS_DEMAND[T5] = target_total_mg − fruit_term_mg
// This guarantees by construction that at 1,5 kg/m²/sem yield the split sum
// (FRUIT_EXPORT × yield + BIOMASS[T5]) equals TOMATO_REMOVAL × yield, so the
// two demand views are mutually consistent at the target. Away from the
// target yield the split sum will drift slightly from the whole-plant
// ratio — that is the correct behaviour because canopy demand is roughly
// fixed per week regardless of fruit yield, while fruit export scales
// linearly with yield.
//
// SANITY CHECK at T5, yield 1,5 kg/m²/sem (mg/m²/wk):
//   El | TOMATO_REMOVAL × 1,5 | FRUIT_EXPORT × 1,5 + BIOMASS[T5] | Δ%
//   N  | 3 750               | 2 250 + 1 500 = 3 750            | 0%
//   P  |   600               |   360 +   240 =   600            | 0%
//   K  | 5 250               | 3 150 + 2 100 = 5 250            | 0%
//   Ca | 2 250               |   112 + 2 138 = 2 250            | 0%
//   Mg |   600               |   150 +   450 =   600            | 0%
// Split-sum at T5 with 1,5 kg yield matches TOMATO_REMOVAL × 1,5 within
// ~10% on macros — cross-check passes (in fact, exact by construction).
//
// T4 = T5 × 0,85. Cert 2 — extrapolation. Rationale: T4 (production
// montante) has a slightly less mature canopy than T5 (pleine production),
// fewer parallel trusses pulling resources, and slightly slower per-week
// new-structure build-out. Picking 0,85 (rather than 0,80 or 0,90) is a
// midpoint; refine when stage-stratified weekly tissue tests come in.
//
// LEGACY BOTTOM-UP ESTIMATE (kept for traceability — was the basis before
// retuning to whole-plant reference on 2026-05-05):
//   ~3 new leaves/sem × ~7 g DW/leaf × 2,5 plants/m² ≈ 52 g DW/m²/sem (leaves)
//   40 cm stem extension × ~0,5 cm² × 0,3 g/cm³ × 2,5 plants/m² ≈ 15 g DW/m²/sem (stem)
//   ~1 new truss/sem × ~10 g DW × 2,5 plants/m² ≈ 25 g DW/m²/sem (truss tissue)
//   Total ≈ 90 g DW/m²/sem
//   × ~2,8% N for tomato vegetative tissue ≈ 2 500 mg N/m²/sem (upper bound)
// The bottom-up gave 2 500 mg N at T5 and Sonneveld vegetative ratios
// (P=0.37×N, K=2.5×N) overshot whole-plant by 30-70%. We now anchor to
// whole-plant minus fruit export as the more defensible target.
//
// Other elements (Ca, Mg, micros) follow the same TOMATO_REMOVAL minus
// TOMATO_FRUIT_EXPORT formula. Ca biomass term is large (~95% of whole-
// plant Ca stays in canopy because Ca is xylem-mobile only), Mg moderate
// (~75% in canopy). Micros: cert 1-2 because the underlying TOMATO_REMOVAL
// micros are themselves estimates and the 60% fruit-share is a default,
// not an element-specific Yara number — data gap, refine on tissue tests.
//
// CAVEAT (cert 2): Décembre is sun-only tomato in Quebec (no supplemental
// light). Haifa F-144 program is Mediterranean / subtropical. Winter-
// transplant conditions reduce transpiration ~40-60% vs Haifa baseline
// during T1-T2; this would proportionally reduce mass-flow-driven uptake
// (K, Ca, Mg, N as NO₃). The Bilan does NOT currently apply a seasonal
// scalar to BIOMASS_DEMAND — values represent "what the plant could pull
// if supply weren't limiting", which is the right framing for a demand
// model. Refine when foliar/petiole tissue tests come in.
//
// MICROS (Fe/Mn/Zn/B/Cu/Mo): no direct stage-stratified data found in
// literature. Estimated from whole-crop totals (Sonneveld guideline:
// Fe ~6 g/m²/yr, Mn ~1.5, Zn ~0.7, B ~0.7, Cu ~0.15, Mo ~0.015) split
// proportionally to biomass accumulation rate. Cert 1-2 — flag if tissue
// tests show mismatch. Vegetative phase pulls disproportionate Fe/Mn for
// chlorophyll synthesis on new leaves.
const BIOMASS_DEMAND = {
  // mg/m²/wk per element. Cert noted in inline comments.
  T1: {
    N:  700,   // Haifa days 1-20 mid; cert 4
    P:  160,   // Haifa days 1-20 mid; cert 4
    K:  2200,  // Haifa avg ~2700 discounted ~20% for QC winter light; cert 3
    Ca: 560,   // 0.8×N (Sonneveld-style ratio); cert 3
    Mg: 175,   // 0.25×N; cert 3
    Fe: 8,     // small new-leaf draw; cert 2
    Mn: 2.0,   // chlorophyll/enzyme; cert 2
    Zn: 1.0,   // hormone/enzyme; cert 2
    B:  1.0,   // cell wall, root tips; cert 2
    Cu: 0.2,   // lignin; cert 1
    Mo: 0.02,  // NO₃ reductase cofactor; cert 1
  },
  T2: {
    N:  1050,  // Haifa days 21-40 mid (1.5 kg/ha/d × 700); cert 4
    P:  240,   // Haifa days 21-40 mid (0.345 × 700); cert 4
    K:  2950,  // Haifa days 21-40 avg (4.22 × 700) discounted slightly; cert 3
    Ca: 840,   // 0.8×N; cert 3
    Mg: 265,   // 0.25×N; cert 3
    Fe: 14,    // canopy expansion peak; cert 2
    Mn: 3.5,   // cert 2
    Zn: 1.8,   // cert 2
    B:  1.5,   // cert 2
    Cu: 0.3,   // cert 1
    Mo: 0.03,  // cert 1
  },
  T3: {
    N:  1750,  // Haifa days 41-50 (2.5 × 700); cert 4
    P:  640,   // Haifa days 41-50 (0.92 × 700) — P spike at flowering; cert 4
    K:  4640,  // Haifa days 41-50 (6.63 × 700) — K ramp at flowering; cert 4
    Ca: 1400,  // 0.8×N — flowering Ca demand; cert 3
    Mg: 440,   // 0.25×N — Yara: Mg peak at flowering; cert 3
    Fe: 18,    // cert 2
    Mn: 4.0,   // cert 2
    Zn: 2.2,   // cert 2
    B:  2.0,   // critical for pollination + fruit set; cert 2
    Cu: 0.4,   // cert 1
    Mo: 0.04,  // cert 1
  },
  T4: {
    // Production montante: canopy still expanding, ongoing leaf/stem/truss
    // growth at ~85% of T5 (fewer parallel trusses, less mature canopy).
    // Values = T5 × 0,85. Cert 2 — extrapolation from T5 reconciliation.
    // Pairs with TOMATO_FRUIT_EXPORT × yield (no double-count).
    // Updated 2026-05-06 to track Koller-aligned T5 values.
    N:  1377,  // T5 × 0.85; cert 2
    P:  224,   // T5 × 0.85; cert 2 (REQ-033 Tier B)
    K:  2040,  // T5 × 0.85; cert 2
    Ca: 1817,  // T5 × 0.85; cert 2
    Mg: 545,   // T5 × 0.85; cert 2 (REQ-033 Tier B)
    Fe: 5.1,   // T5 × 0.85; cert 1-2
    Mn: 2.55,  // T5 × 0.85; cert 1-2
    Zn: 1.53,  // T5 × 0.85; cert 1-2
    B:  1.53,  // T5 × 0.85; cert 1-2
    Cu: 0.51,  // T5 × 0.85; cert 1-2
    Mo: 0.0255,// T5 × 0.85; cert 1-2
  },
  T5: {
    // Pleine production: ongoing canopy + new structures (no fruit term —
    // fruit handled by TOMATO_FRUIT_EXPORT × yield).
    //
    // Derivation (per element, anchored to whole-plant Koller-aligned ratio):
    //   BIOMASS[T5] = TOMATO_REMOVAL × 1500 − TOMATO_FRUIT_EXPORT × 1500
    // i.e. whole-plant uptake at 1,5 kg/m²/sem fruit minus the part that
    // physically leaves in fruit. At target yield this makes the split sum
    // match the whole-plant reference exactly. Cert 3 for macros (inherits
    // from TOMATO_REMOVAL), cert 1-2 for micros.
    //
    // Cross-check at yield 1,5 kg/m²/sem (split sum vs whole-plant ratio):
    //   FRUIT_EXPORT × 1,5 + BIOMASS[T5]   vs  TOMATO_REMOVAL × 1,5
    //   N : 2 430 +  1 620 = 4 050    vs  4 050  (exact)
    //   P :   396 +    264 =   660    vs    660  (exact)
    //   K : 3 600 +  2 400 = 6 000    vs  6 000  (exact)
    //   Ca:   113 +  2 138 = 2 250    vs  2 250  (exact)
    //   Mg:   214 +    641 =   855    vs    855  (exact)
    // All Δ% within ±10% — split-sum reconciliation passes by construction.
    N:  1620,  // 2.7 g/kg × 1500 − 2430 fruit; cert 3
    P:  264,   // 0.44 g/kg × 1500 − 396 fruit; cert 3 (REQ-033 Tier B)
    K:  2400,  // 4.0 g/kg × 1500 − 3600 fruit; cert 3
    Ca: 2138,  // 1.5 g/kg × 1500 − 112 fruit (~95% retained in canopy); cert 3
    Mg: 641,   // 0.57 g/kg × 1500 − 214 fruit (~75% retained); cert 3 (REQ-033 Tier B)
    Fe: 6,     // 0.010 g × 1500 − 9 fruit; cert 1-2
    Mn: 3,     // 0.005 g × 1500 − 4.5 fruit; cert 1-2
    Zn: 1.8,   // 0.003 g × 1500 − 2.7 fruit; cert 1-2
    B:  1.8,   // 0.003 g × 1500 − 2.7 fruit; cert 1-2
    Cu: 0.6,   // 0.001 g × 1500 − 0.9 fruit; cert 1-2
    Mo: 0.03,  // 0.00005 g × 1500 − 0.045 fruit; cert 1-2
  },
};

// ─── TOMATO_DEMAND_CERT — confidence in demand[stage][el] = fruit + biomass ──
//
// Total demand cert = min(TOMATO_FRUIT_EXPORT cert, BIOMASS_DEMAND[stage] cert)
// per element. Both source tables annotate cert in inline comments; values
// here mirror those annotations so the Bilan modal can surface honest cert
// per (stage, element) instead of flat "cert 3 for all".
//
// Why this matters: TOMATO_FRUIT_EXPORT for micros uses a 60% default split
// flagged "data gap, cert 1-2"; BIOMASS_DEMAND Cu/Mo are cert 1 across all
// stages. Hiding micros behind a flat cert 3 misled the user about what the
// numbers can support — tissue tests are needed before acting on micro gaps.
//
// When fruit term is 0 (T1, no harvest), the conceptually-correct cert is the
// biomass cert alone — but min(fruit_cert, biomass_cert) is a conservative
// shortcut. Acceptable: if anything it under-promises certitude at T1.
//
// 2026-05-09: scale recalibrated to single transferability cert (see
// nutrition/tomato/plant-needs/spec.md → "Cert scale"). Macros across
// T1-T3 and T5 now read cert 2 (Mediterranean hydroponic → QC organic
// is one major translation). T4 reads cert 1 (extrapolation of cert-2).
// Micros stay cert 1 (default split + extrapolated REMOVAL values).
// Tissue-test data lands ~2026-05-12 → push affected entries to cert 3.
const TOMATO_DEMAND_CERT = {
  T1: { N:2, P:2, K:2, Ca:2, Mg:2, Fe:1, Mn:1, Zn:1, B:1, Cu:1, Mo:1 },
  T2: { N:2, P:2, K:2, Ca:2, Mg:2, Fe:1, Mn:1, Zn:1, B:1, Cu:1, Mo:1 },
  T3: { N:2, P:2, K:2, Ca:2, Mg:2, Fe:1, Mn:1, Zn:1, B:1, Cu:1, Mo:1 },
  T4: { N:1, P:1, K:1, Ca:1, Mg:1, Fe:1, Mn:1, Zn:1, B:1, Cu:1, Mo:1 },
  T5: { N:2, P:2, K:2, Ca:2, Mg:2, Fe:1, Mn:1, Zn:1, B:1, Cu:1, Mo:1 },
};
