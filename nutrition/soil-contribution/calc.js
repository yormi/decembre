// Soil-contribution — pure functions.
//
// Spec: nutrition/soil-contribution/spec.md
//
// Both functions are pure: same arguments → same output. Inputs read from
// module-scope constants declared in data.js.

// REQ-141 — non-contributing elements always return 0 even when bank data
// exists (K, Mg case today). The min() clamp on contributing elements
// prevents a finite bank from over-delivering in the corner case where
// weekly demand exceeds the entire reservoir.
function soilWeeklyContribution(crop, element, demand_mg) {
  if (!SOIL_CONTRIBUTING[element]) return 0;
  const bank = (SOIL_BANK_MG_M2[crop] || {})[element];
  if (!(bank > 0) || !(demand_mg > 0)) return 0;
  return Math.min(demand_mg, bank);
}

// REQ-142 + REQ-164 — depletion runway is now SME-throttled, not
// demand-throttled. Denominator = SME_ppm × transpiration_L_per_m²_per_wk
// (mg/L × L/m²/wk = mg/m²/wk) — weekly plant uptake currently sustainable
// at measured soil-solution availability. Defined for any element with
// both bank data and SME data, regardless of whether it's in CONTRIBUTING
// (disabled rows K / Mg still surface their runway for operator context).
// Returns null when either operand is missing or zero.
function soilMonthsToDepletion(crop, element) {
  const bank = (SOIL_BANK_MG_M2[crop] || {})[element];
  const smeSoilSolutionPpm = (SME_SOIL_SOLUTION_PPM[crop] || {})[element];
  const transpirationLPerWeek = TRANSPIRATION_L_PER_M2_PER_WEEK[crop];
  if (!(bank > 0)) return null;
  if (!(smeSoilSolutionPpm > 0)) return null;
  if (!(transpirationLPerWeek > 0)) return null;
  const weeklyUptakeMg = smeSoilSolutionPpm * transpirationLPerWeek;
  return bank / (weeklyUptakeMg * WEEKS_PER_MONTH);
}
