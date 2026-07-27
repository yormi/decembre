// Pool-maintenance control law — the poolDose() the method anticipates.
// Spec / design: domain/soil-maintenance.md. Acts on the Mehlich-3 quantity bank
// (nutrition/soil-contribution/data.js). Governs the seven pool-forming
// nutrients only; mobile (N, B, S, Mo) + Fe are excluded by the method and
// dosed elsewhere (front-load / foliar / broadcast).
//
// Pure: no I/O, no Date, no globals beyond the exported namespace. Inputs are
// pre-normalised (current ppm, weekly plant removal in mg/m²/wk); the caller
// selects the crop and converts the bank.

// The method governs exactly these. domain/soil-maintenance.md § Nutrient classification.
const POOL_FORMING_ELEMENTS = ['K', 'P', 'Ca', 'Mg', 'Mn', 'Zn', 'Cu'];

// Field-calibrated Mehlich-3 optimal bands (ppm) — coarse regime gate only,
// not a precise setpoint. domain/soil-maintenance.md § Bands. Mg is relational
// (null) — computed live from the Ca/K pools, never a fixed number.
const M3_BANDS_PPM = {
  K:  [200, 250],
  P:  [31, 40],
  Ca: [1000, 2000],
  Mg: null,
  Mn: [20, 50],
  Zn: [10, 50],
  Cu: [0.5, 3],
};

// Cation equivalent weights for the Mg ratio window. domain/soil-maintenance.md
// § Mg band (meq = ppm ÷ (eq.wt × 10)).
const CATION_EQ_WEIGHT = { Ca: 20.0, Mg: 12.2, K: 39.1 };
const MG_ABSOLUTE_FLOOR_MEQ = 0.4;  // ~50 ppm sufficiency — never dose below this

// Berger convention: mg/m² = ppm × 200 (20 cm × 1.0 g/cm³). Mirrors
// SOIL_REPORT_PPM_TO_MG_PER_M2 in data.js.
const PPM_TO_MG_PER_M2 = 200;

// Control-law horizon ≈ the re-evaluation interval. domain/soil-maintenance.md § Control law.
const HORIZON_DAYS = 100;

// K intensity floor: minimum tank K = 20% of maintenance regardless of pool
// status (feeds the diffusion shell). domain/soil-maintenance.md § Intensity floor.
const K_INTENSITY_FLOOR_FRACTION = 0.20;

// Build overshoot: when a pool sits below floor, dose = maintenance × (1 +
// this). Maintenance = weekly removal (cert 3), so the pool climbs at 25% of
// removal per week — a gentle, CE-safe, coefficient-free correction. Replaces
// the un-derivable soil-buffer-power prior (domain/soil-maintenance.md § Transfer
// coefficient). Rate rule, not a target: a deeply depleted pool refills
// slowly — acute deficiency is the foliar/AMF/broadcast lever's job, not the
// tank. Sibling of the K intensity floor (also maintenance-anchored).
const BUILD_OVER_MAINTENANCE = 0.25;

function poolPpmFromBankMg(bankMg) {
  return bankMg / PPM_TO_MG_PER_M2;
}

// Relational Mg window (ppm) from the live Ca + K pools. Floored at absolute
// sufficiency so the calcareous-Ca artifact never pulls the target down.
// domain/soil-maintenance.md § Mg band.
function magnesiumWindowPpm(caPpm, kPpm) {
  const caMeq = caPpm / (CATION_EQ_WEIGHT.Ca * 10);
  const kMeq = kPpm / (CATION_EQ_WEIGHT.K * 10);
  const lowMeq = Math.max(caMeq / 8, kMeq / 2, MG_ABSOLUTE_FLOOR_MEQ);
  const highMeq = Math.max(caMeq / 6, lowMeq);
  const toPpm = (meq) => meq * CATION_EQ_WEIGHT.Mg * 10;
  return [toPpm(lowMeq), toPpm(highMeq)];
}

// Optimal band (ppm) for an element: fixed table, or the Mg relational window
// computed from currentPpmByElement.{Ca,K}. Returns null for ungoverned.
function bandPpm(element, currentPpmByElement) {
  if (element === 'Mg') {
    return magnesiumWindowPpm(currentPpmByElement.Ca, currentPpmByElement.K);
  }
  return M3_BANDS_PPM[element] || null;
}

// Weeks for the pool to fall from its current M3 to the mid-band maintenance
// floor at the plant removal rate — the runway before a dose is due, not the
// time to hit zero. domain/soil-maintenance.md § Control law (floor = mid-band).
// Reads QUANTITY (domain/nutrient-transport.md § Two pools) — an upper bound;
// a full-but-locked pool (P) starves the root long before it reaches floor.
// weeklyUptakeMg = plant weekly removal (the drawdown prior). Returns 0 when
// the pool already sits at/below the floor (a build case), null if no uptake.
function weeksToMidBand(currentPpm, weeklyUptakeMg, midBandPpm) {
  if (!(weeklyUptakeMg > 0)) return null;
  const headroomPpm = currentPpm - midBandPpm;
  if (headroomPpm <= 0) return 0;
  return headroomPpm / (weeklyUptakeMg / PPM_TO_MG_PER_M2);
}

// Minimal weekly elemental dose (mg/m²/wk) that keeps the 100-day pool
// projection at/above the band floor, plus the K intensity floor.
// domain/soil-maintenance.md § Control law + § Intensity floor.
// Returns { dose, pool100d, gate } where gate ∈ 'hold' | 'floor' | 'build'.
function maintenanceDose(element, currentPpm, weeklyUptakeMg, band) {
  const drawdownPpmPerDay = (weeklyUptakeMg / PPM_TO_MG_PER_M2) / 7;
  const pool100d = currentPpm - drawdownPpmPerDay * HORIZON_DAYS;
  let dose = 0;
  let gate = 'hold';
  if (band) {
    const floorMid = (band[0] + band[1]) / 2;
    if (pool100d < floorMid) {
      gate = 'build';
      dose = weeklyUptakeMg * (1 + BUILD_OVER_MAINTENANCE);
    }
  }
  if (element === 'K') {
    const intensityFloor = K_INTENSITY_FLOOR_FRACTION * weeklyUptakeMg;
    if (intensityFloor > dose) {
      dose = intensityFloor;
      if (gate === 'hold') gate = 'floor';
    }
  }
  return { dose, pool100d, gate };
}

// Public API. Consumers reach for window.PoolMaintenance, never the bare
// constants — internals (per-bed scaling, measured build coefficient) can
// then be reshaped without breaking call sites.
window.PoolMaintenance = {
  POOL_FORMING_ELEMENTS,
  M3_BANDS_PPM,
  HORIZON_DAYS,
  K_INTENSITY_FLOOR_FRACTION,
  poolPpmFromBankMg,
  magnesiumWindowPpm,
  bandPpm,
  weeksToMidBand,
  maintenanceDose,
};
