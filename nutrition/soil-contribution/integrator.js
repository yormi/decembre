// Soil-contribution — integrator-side mass-flow helpers.
//
// Pure soil-contribution math lives in calc.js (bank × demand clamping,
// SME-throttled depletion runway). This file owns the SME × transpiration
// mass-flow path that the Bilan supply orchestrator consumes — it reads the
// session state (currentCrop) + solar lookup (getSolarRad) declared in
// app/operator/state.js + app/operator/recalc.js, so it sits at the
// integrator boundary rather than in the pure calc.js layer.
//
// SME source-of-truth: the per-crop SME_SOIL_SOLUTION_PPM table in data.js.
// Supply read is conservative — below-detection-limit elements zero out at
// the boundary (SME_BELOW_DETECTION_ELEMENTS). Runway math reads the canonical
// table directly so the DL-ceiling convention (cert 2 per sme-soil-solution-wired-per-crop-element) stays.

// Below-detection-limit elements zeroed for supply mass-flow. At pH 7.4 the
// lab reports < 0.03 ppm for Mn / Zn on both beds; treating the DL ceiling
// as actual supply would credit ~0.45 mg/m²/wk that the plant cannot count
// on. Runway column keeps the DL ceiling (sme-soil-solution-wired-per-crop-element
// cert 2) so the operator still sees a finite — if optimistic — runway for context.
const SME_BELOW_DETECTION_ELEMENTS = new Set(['Mn', 'Zn']);

function smePpmForSupply(crop, element) {
  if (SME_BELOW_DETECTION_ELEMENTS.has(element)) return 0;
  const cropPpm = SME_SOIL_SOLUTION_PPM[crop];
  if (!cropPpm) return 0;
  return cropPpm[element] || 0;
}

// Weekly water flow through the root zone, per m².
// SAME FORMULA as the fertigation page's irrigation calculation (see line ~280
// HTML comment + getStockVol()): 2 mL/(J/cm²)/m² × solar radiation × 7 days.
// Mass-flow uptake = this volume × SME concentration to a reasonable
// approximation (drip system, minor leaching loss, mature canopy where
// transpiration ≈ irrigation). Cert 3 — uncertainty in the 2 mL/J coefficient
// is within ±20%.
//
// Why this matters: soil supply scales with the season. In May (~2000 J/cm²/day)
// the flow is ~28 L/m²/wk; in December (~500 J/cm²/day) it drops to ~7 L/m²/wk.
// The Bilan now correctly shows B/Mo/Cu coverage tightening in winter even
// though the SME concentrations are unchanged.
function weeklyMassFlowL() {
  return (2 * getSolarRad() * 7) / 1000;
}

// Transpiration factor — corrects mass-flow for canopy size. Locked at 1.0
// (2026-05-24). Cert 3.
//
// `weeklyMassFlowL()` returns IRRIGATION volume (the formula is fertigation-
// driven). For a mature, healthy plant with full canopy, transpiration ≈
// irrigation minus a small leaching fraction.
//
// Previous formula: `current_yield / target_yield` (floor 0.4, cap 1.0). Retired
// 2026-05-24 — operator-anchored (denominator was the operator's target), not
// first-principles. See `nutrition/tomato/doc/ca-ber-investigation-tests-
// 2026-05-24.md` Test 6 for the physics-anchored replacements:
//   - Variant 6a — sunlight × RUE → theoretical yield; ratio = currentYield /
//     theoreticalYield, paired with canopy-state visual override.
//   - Variant 6b — FAO-56 ET₀ vs measured irrigation; cleanest if climate
//     computer is wired.
//
// Operational value held at 1.0 until either variant ships:
//   - Tomato bed is at full canopy (rows touching) in current crop cycle.
//   - Worked example in Test 6b shows factor ≈ 1.0 at 28 L/m²/wk irrigation,
//     2 000 J/cm²/day solar, ETc 20.7 L/m²/wk, 25 % drainage overshoot.
//   - Field signal (BER + water shoots + leaf Ca déficience) traces to root-
//     side obstacles (antagonism, root mass) and distribution-to-fruit failure
//     — NOT to a transpiration shortfall. See research doc.
//
// Signature preserved for caller compatibility; arguments ignored.
function transpirationFactor(_currentKgM2Wk, _targetKgM2Wk) {
  return 1.0;
}

// Seasonal mineralization multiplier for organic N specifically. Cert 3.
//
// The SME N reading (April 2026) is a snapshot. But soil microbial N
// mineralization rate roughly doubles for every 10°C rise (Q10 ≈ 2,
// Stanford & Smith 1972). Greenhouse soil temperature swings ~12-22°C
// across the year (warmer than outside but not isothermal). Without
// scaling, we'd assume April-rate mineralization continues all summer
// (understating supply when demand is highest) and all winter
// (overstating when soil cools and microbes slow).
//
// Calibration: April = 1.0 baseline (the test month). Other months scale
// relative to it based on greenhouse soil temperature curves and Q10.
// Range 0.6 (deep winter) to 2.0 (peak summer).
//
// This applies ONLY to the N branch in soilWeeklyAvailable. Other elements
// (P, K, Ca, Mg, micros) are dissolved ions in SME — their availability
// scales with transpiration (already in weeklyMassFlowL), not with
// microbial activity.
const N_MINERALIZATION_BY_MONTH = [
  0.6,   // Jan — soil cold, microbes slow
  0.6,   // Feb
  0.8,   // Mar
  1.0,   // Apr — SME baseline (test month)
  1.3,   // May
  1.7,   // Jun
  2.0,   // Jul — peak microbial activity
  2.0,   // Aug
  1.5,   // Sep
  1.1,   // Oct
  0.8,   // Nov
  0.6,   // Dec
];

function nMineralizationFactor() {
  return N_MINERALIZATION_BY_MONTH[new Date().getMonth()];
}

// Bioavailability efficiency from SME concentration to actual root uptake.
// For ions where mass-flow is the dominant uptake mechanism (most macros + B,
// Cu, Mo at this pH), efficiency is ~100%. For Fe specifically, even when
// in solution at SME concentration, calcareous-rhizosphere chemistry suppresses
// root reductase activity and real uptake is much lower than mass-flow predicts.
// Cert 3-4. Confirmed empirically: SME shows Fe in spec (0.86 ppm) but plants
// display Fe deficiency symptoms — so the discount is real.
//
// N also gets the seasonal mineralization multiplier (above) on top of the
// base 0.85 efficiency — soil microbial activity is rate-limiting for organic
// N supply, and that activity is strongly temperature-dependent.
function soilWeeklyAvailable(elem, phLocked, transpFactor) {
  const sme_ppm = smePpmForSupply('tomato', elem);
  const tf = transpFactor || 1.0;
  // `transpFactor` (0,4-1,0) corrects mass-flow for canopy size — see
  // transpirationFactor() comment. Applies to ALL elements because they all
  // arrive at roots via the same water flow.
  const massFlow_mg = sme_ppm * weeklyMassFlowL() * tf;
  let efficiency = 1.0;
  // Fe lockout — 0,15 = midpoint of the Cadre framework page's 10-20% bypass
  // efficiency at pH 7,4. Aligned 2026-05-05; previously 0,30 was too generous
  // and contradicted both the Cadre page narrative AND field observation
  // (visible Fe chlorosis on apex despite SME Fe in spec). Cert 4.
  if (elem === 'Fe' && phLocked) efficiency = 0.15;
  else if (elem === 'N')         efficiency = 0.85 * nMineralizationFactor();
  return massFlow_mg * efficiency;
}
