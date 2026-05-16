// Soil-contribution — pure functions.
//
// Spec: nutrition/soil-contribution/spec.md
//
// Both functions are pure: same (crop, element, demand_mg) → same output.
// Inputs read from module-scope constants declared in data.js.

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

// REQ-142 — defined for any element with bank data + positive demand,
// regardless of whether it's in CONTRIBUTING. Disabled rows (K, Mg) still
// surface their runway for operator context.
function soilMonthsToDepletion(crop, element, demand_mg) {
  const bank = (SOIL_BANK_MG_M2[crop] || {})[element];
  if (!(bank > 0) || !(demand_mg > 0)) return null;
  return bank / (demand_mg * WEEKS_PER_MONTH);
}
