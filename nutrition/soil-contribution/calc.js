// Soil-contribution — pure functions.
//
// Spec: nutrition/soil-contribution/spec.md
//
// Both functions are pure: same arguments → same output. Inputs read from
// module-scope constants declared in data.js.

// only-ca-p-participate-in-gap-chain — non-contributing elements always return 0 even when bank data
// exists (K, Mg case today). The min() clamp on contributing elements
// prevents a finite bank from over-delivering in the corner case where
// weekly demand exceeds the entire reservoir.
function soilWeeklyContribution(crop, element, demand_mg) {
  if (!SOIL_CONTRIBUTING[element]) return 0;
  const bank = (SOIL_BANK_MG_M2[crop] || {})[element];
  if (!(bank > 0) || !(demand_mg > 0)) return 0;
  return Math.min(demand_mg, bank);
}

// months-to-depletion-clamped-by-peak-demand + sme-soil-solution-wired-per-crop-element — depletion runway, clamped at min(mass-flow, plant
// peak demand). Denominator = min(SME_ppm × transpiration_L/m²/wk,
// PLANT_PEAK_WEEKLY_DEMAND_MG_PER_M2[crop][element]). The plant cannot
// draw faster than its actual demand even when soil-solution availability
// exceeds that demand; clamping at demand prevents the runway from
// pessimising for over-supplied elements (Ca / Mg on the tomato bed).
// For lockout elements (P / Mn / Zn / B / Cu / Fe at pH 7.4) mass-flow
// is below demand and the clamp is a no-op — the runway reduces to the
// SME-throttled form. Defined for any element with both bank data and
// SME data, regardless of whether it's in CONTRIBUTING (disabled rows
// K / Mg still surface their runway for operator context).
//
// Turnover-bound elements (N today; TURNOVER_BOUND_ELEMENTS) return null —
// the Mehlich-3 N pool is replenished by mineralization at quasi-steady-
// state, so the bank-÷-uptake counterfactual ("weeks until empty if
// mineralization stopped") is not operationally meaningful. The pourquoi
// modal explains the carve-out at the row level.
function soilMonthsToDepletion(crop, element) {
  if (TURNOVER_BOUND_ELEMENTS.includes(element)) return null;
  const bank = (SOIL_BANK_MG_M2[crop] || {})[element];
  const smeSoilSolutionPpm = (SME_SOIL_SOLUTION_PPM[crop] || {})[element];
  const transpirationLPerWeek = TRANSPIRATION_L_PER_M2_PER_WEEK[crop];
  if (!(bank > 0)) return null;
  if (!(smeSoilSolutionPpm > 0)) return null;
  if (!(transpirationLPerWeek > 0)) return null;
  const massFlowMg = smeSoilSolutionPpm * transpirationLPerWeek;
  const peakDemandMg = (PLANT_PEAK_WEEKLY_DEMAND_MG_PER_M2[crop] || {})[element];
  const weeklyUptakeMg = (peakDemandMg > 0)
    ? Math.min(massFlowMg, peakDemandMg)
    : massFlowMg;
  return bank / (weeklyUptakeMg * WEEKS_PER_MONTH);
}
