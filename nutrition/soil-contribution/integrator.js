// Soil-contribution — integrator-side mass-flow helpers.
//
// Pure soil-contribution math lives in calc.js (bank × demand clamping,
// SME-throttled depletion runway). This file owns the SME × transpiration
// mass-flow path that the Bilan supply orchestrator consumes — it reads the
// session state (currentCrop) + solar lookup (getSolarRad) declared in
// app/operator/state.js + app/operator/recalc.js, so it sits at the
// integrator boundary rather than in the pure calc.js layer.
//
// Note: SME_TOMATO_PPM kept here in its legacy shape (Mn=0, Zn=0 — flat below
// detection) for byte-identical behavior of the supply orchestrator. The
// per-crop SME_SOIL_SOLUTION_PPM table in data.js uses a different convention
// (detection-limit ceiling 0.03 for Mn/Zn) — runway math reads that table,
// supply math reads this one. Refactor candidate when next Berger SME lands.

// SME (Saturated Media Extract, Berger sample 596614, tomato bed, 2026-04-10)
// reports the actual ion concentrations the plant root sees in the soil paste.
// Multiplying by weekly transpiration gives mass-flow uptake — the dominant
// nutrient delivery mechanism for ions already in solution.
//
// This replaces the earlier Mehlich-3 × annual-fraction approximation, which
// was conservative for B/Cu/Mo (treated them as 0) and overstated K demand
// gaps. SME is more honest because it captures BOTH the reservoir effect AND
// the chemistry that limits availability (lockout already shows up as low SME).
//
// Source: farm info/SME - 2026-04-10.pdf
const SME_TOMATO_PPM = {
  N:  45.4,    // NO₃ 45.0 + NH₄ 0.4 (in spec range 35-180 / 0-20)
  P:   1.1,    // ↓ below norm 5-50 (lockout confirmed)
  K:  292.3,   // in spec, near top
  Ca: 238.8,   // ↑ above norm 40-200 (Ca-saturated, root cause of crisis)
  Mg:  79.3,   // in spec
  B:    0.18,  // in spec 0.05-0.5 — neutral boric acid, not pH-locked
  Cu:   0.04,  // in spec 0.01-0.5
  Fe:   0.86,  // in spec 0.30-3 (BUT calcareous lockout suppresses real uptake; see discount)
  Mn:   0,     // < 0.03 below detection — locked
  Mo:   0.02,  // in spec 0.01-0.05 — anion, MORE available at high pH
  Zn:   0,     // < 0.03 below detection — locked
};

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

// Transpiration factor — corrects mass-flow for canopy size. Cert 3.
//
// `weeklyMassFlowL()` returns IRRIGATION volume (the formula is fertigation-
// driven). For a mature, healthy plant with full canopy, transpiration ≈ irrigation
// minus a small leaching fraction. But for a stunted plant at, say, 30% target
// yield, the canopy is much smaller and real transpiration is materially less —
// often 50-70% of irrigation. Most of the surplus water leaches past the roots
// without contributing to mass-flow uptake.
//
// Without this correction, the Bilan would systematically overstate soil supply
// for stunted plants — exactly the failure mode that perpetuates stunting (the
// model says "you have plenty of N from soil", user under-fertigates, plants
// stay stunted, model still says "you have plenty"...).
//
// Approximation: transpiration scales roughly with canopy area, which scales
// roughly with yield achievement at production stages. Floor at 0.4 because
// even tiny seedlings transpire some. Cap at 1.0 (can't exceed irrigation).
//
// More precise alternatives we're NOT using yet (cost > value at current state):
//   - Direct LAI measurement (would need leaf-area meter)
//   - Penman-Monteith from VPD + canopy resistance (overengineered for our context)
//   - Drainage-fraction monitoring on a sample bed (good idea, separate operational
//     decision — see issue R3 in the audit notes)
function transpirationFactor(currentKgM2Wk, targetKgM2Wk) {
  if (!targetKgM2Wk || targetKgM2Wk <= 0) return 1.0;
  const ratio = currentKgM2Wk / targetKgM2Wk;
  return Math.max(0.4, Math.min(1.0, ratio));
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
  const sme_ppm = SME_TOMATO_PPM[elem] || 0;
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
