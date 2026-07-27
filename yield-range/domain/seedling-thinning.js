// ─── yield-range/domain/seedling-thinning.js — merged seedling-weight model ─
//
// Domain: yield-range/domain/domain.md (expolinear light-limited engine clamped
// by the canopy-volume cap; nursery phase only).
//
// Nursery-chart view — NOT spec-tied. No weight anchor is reproduced; both
// regimes are unvalidated pending a plug dry-matter measurement. Kept out of
// calc.js so the cert-tied integrator stays clean.
//
// Day axis: DAYS FROM SOWING, day 1 = sowing day (same as calc.js and doc/).
//
// Growth law:  dW_dry/dt = ε·DLI·A_ground·(1 − exp(−k·LAI)) , LAI = W_dry·SLA/A ,
// clamped W ≤ cap. The Beer–Lambert interception makes canopy closure, thinning
// before closure, and the re-fill lag after thinning all emergent — no
// hand-tuned ramps.

// Shared with the calc.js engine (data.js is the single source) — this file
// is the nursery-chart view of the same carbon-balance law.
const SEEDLING_RGR = GROWTH_RGR;                 // open-canopy exponential rate = ε·DLI·k·SLA (clean)
const SEEDLING_RUE = RADIATION_USE_EFFICIENCY;   // g dry / mol PAR — clean, well-watered
const SEEDLING_STRESS_RUE = NURSERY_STRESS_RUE;  // drought+heat ε (unanchored)
const SEEDLING_DLI = NURSERY_DLI_CEILING_BY_WEEK[2]; // plug-stage usable DLI; growth runs on nurseryLightCeiling(day), all sampleDays (21/28/35) are sowing-week 3+
const SEEDLING_EMERGENCE_DAY = 1 + germinationDaysFromSoilTemperature(NURSERY_SOIL_TEMPERATURE_C);
const SEEDLING_DM_FRACTION = PLUG_DRY_MATTER_FRACTION; // plug DM — fresh = dry ÷ this
const SEEDLING_STEP_DAYS = GROWTH_STEP_DAYS;     // integration step
const SEEDLING_SLA = SPECIFIC_LEAF_AREA;         // specific leaf area (derived)
const SEEDLING_K = LEAF_AREA_EXTINCTION_K;       // canopy light-extinction coefficient
const SEEDLING_LAI_CLOSURE = LAI_CLOSURE;        // LAI at which the canopy is light-limited
// Effective ε for the nursery regime: drought+heat (stressed) or clean.
const seedlingRue = stressed => (stressed ? SEEDLING_STRESS_RUE : SEEDLING_RUE);

// Areal mass-loading = canopy height × foliage density. Reuses the same
// geometry constants as calc.js nurseryCapPackedFresh so the packed cap
// matches the engine exactly; spaced cap uses the field geometry.
const SEEDLING_LOAD_PACKED = FOLIAGE_HEIGHT_M * FOLIAGE_DENSITY_KG_PER_M3 * 1000;       // g/m²
const SEEDLING_LOAD_SPACED = FIELD_CANOPY_HEIGHT_M * FIELD_FOLIAGE_DENSITY_KG_PER_M3 * 1000;

// Fresh-weight cap (g) before and after a checker-thin, per plateau.
function seedlingCapPacked(plateauSize) {
  return (TRAY_FRAME_M2 / plateauSize) * SEEDLING_LOAD_PACKED;
}
function seedlingCapSpaced(plateauSize) {
  return (2 * TRAY_FRAME_M2 / plateauSize) * SEEDLING_LOAD_SPACED;
}

// Integrate fresh weight (g) to targetDay for a plateau, checker-thinning
// (area ×2) at thinDay. thinDay = null → no thin.
function seedlingWeightFresh(plateauSize, thinDay, targetDay, stressed = false) {
  const areaBase = TRAY_FRAME_M2 / plateauSize;
  const rue = seedlingRue(stressed);
  let weightDry = EMERGENCE_DRY_MASS_G;
  for (let t = 1; t <= targetDay + 1e-9; t += SEEDLING_STEP_DAYS) {
    if (t < SEEDLING_EMERGENCE_DAY) continue;
    const thinned = thinDay != null && t >= thinDay;
    const areaGround = thinned ? 2 * areaBase : areaBase;
    const capDry = (thinned ? seedlingCapSpaced(plateauSize) : seedlingCapPacked(plateauSize)) * SEEDLING_DM_FRACTION;
    const lai = weightDry * SEEDLING_SLA / areaGround;
    const grow = rue * nurseryLightCeiling(t) * areaGround * (1 - Math.exp(-SEEDLING_K * lai));
    weightDry = Math.min(weightDry + grow * SEEDLING_STEP_DAYS, capDry);
  }
  return weightDry / SEEDLING_DM_FRACTION;
}

// Fresh weight (g) at canopy closure: the weight where LAI reaches
// LAI_CLOSURE (leaf area = closure·A). spaced=true uses the post-thin doubled
// ground area. Closure always precedes the volume cap.
function seedlingClosureWeightFresh(plateauSize, spaced) {
  const areaGround = (spaced ? 2 : 1) * TRAY_FRAME_M2 / plateauSize;
  const weightDry = SEEDLING_LAI_CLOSURE * areaGround / SEEDLING_SLA;
  return weightDry / SEEDLING_DM_FRACTION;
}

// Fresh-weight series [{day, weight}] from sowing (day 1) to maximumDay, checker-
// thinning (area ×2) at thinDay (null = none). Same integrator as
// seedlingWeightFresh, sampled at every step instead of only the target day.
function seedlingTrajectory(plateauSize, thinDay, maximumDay, stressed = false) {
  const areaBase = TRAY_FRAME_M2 / plateauSize;
  const rue = seedlingRue(stressed);
  let weightDry = EMERGENCE_DRY_MASS_G;
  const series = [{ day: 1, weight: weightDry / SEEDLING_DM_FRACTION }];
  for (let t = 1 + SEEDLING_STEP_DAYS; t <= maximumDay + 1e-9; t += SEEDLING_STEP_DAYS) {
    if (t < SEEDLING_EMERGENCE_DAY) {
      series.push({ day: t, weight: weightDry / SEEDLING_DM_FRACTION });
      continue;
    }
    const thinned = thinDay != null && t >= thinDay;
    const areaGround = thinned ? 2 * areaBase : areaBase;
    const capDry = (thinned ? seedlingCapSpaced(plateauSize) : seedlingCapPacked(plateauSize)) * SEEDLING_DM_FRACTION;
    const lai = weightDry * SEEDLING_SLA / areaGround;
    const grow = rue * nurseryLightCeiling(t) * areaGround * (1 - Math.exp(-SEEDLING_K * lai));
    weightDry = Math.min(weightDry + grow * SEEDLING_STEP_DAYS, capDry);
    series.push({ day: t, weight: weightDry / SEEDLING_DM_FRACTION });
  }
  return series;
}

// Everything the Trajectoire de croissance chart renders, as numbers. The
// renderer only maps these to SVG geometry — no math on its side.
//   trajectory    — fresh-weight curve, bends at closure, jumps at thinDay
//   capPacked     — volume ceiling before thinning
//   capSpaced     — volume ceiling after checker-thin (widened + re-spaced)
//   closurePacked — weight where canopy closes at base spacing
//   closureSpaced — weight where canopy re-closes after thinning
function seedlingChartModel(plateauSize, thinDay, maximumDay, stressed = false) {
  return {
    thinDay,
    maximumDay,
    trajectory: seedlingTrajectory(plateauSize, thinDay, maximumDay, stressed),
    capPacked: seedlingCapPacked(plateauSize),
    capSpaced: seedlingCapSpaced(plateauSize),
    closurePacked: seedlingClosureWeightFresh(plateauSize, false),
    closureSpaced: seedlingClosureWeightFresh(plateauSize, true),
  };
}

// Day the canopy closes at base spacing: first day LAI reaches LAI_CLOSURE
// (leaf area fills the ground footprint). Returns null if it never closes
// within 60 days (a stressed plug may not).
function seedlingClosureDay(plateauSize, stressed = false) {
  const areaBase = TRAY_FRAME_M2 / plateauSize;
  const rue = seedlingRue(stressed);
  let weightDry = EMERGENCE_DRY_MASS_G;
  for (let t = 1; t <= 60; t += SEEDLING_STEP_DAYS) {
    const lai = weightDry * SEEDLING_SLA / areaBase;
    if (lai >= SEEDLING_LAI_CLOSURE) return t;
    if (t < SEEDLING_EMERGENCE_DAY) continue;
    const grow = rue * nurseryLightCeiling(t) * areaBase * (1 - Math.exp(-SEEDLING_K * lai));
    weightDry = weightDry + grow * SEEDLING_STEP_DAYS;
  }
  return null;
}

// Full grid for the admin card: plateaus × thin-days × sample-days, plus
// closure day and caps per plateau. Pure — the renderer adds no numbers.
function seedlingThinningGrid(stressed = false) {
  const plateaus = [50, 32, 18];
  const thinDays = [7, 14, 21];
  const sampleDays = [21, 28, 35];
  return {
    thinDays,
    sampleDays,
    conditions: { dli: SEEDLING_DLI, rgr: SEEDLING_RGR, rue: seedlingRue(stressed), dmFraction: SEEDLING_DM_FRACTION, stressed },
    rows: plateaus.map(plateauSize => {
      const areaIn2 = (TRAY_FRAME_M2 / plateauSize) / 0.00064516;
      const capSpaced = seedlingCapSpaced(plateauSize);
      return {
        plateauSize,
        areaIn2,
        closureDay: seedlingClosureDay(plateauSize, stressed),
        capPacked: seedlingCapPacked(plateauSize),
        capSpaced,
        cells: thinDays.map(thinDay => ({
          thinDay,
          weights: sampleDays.map(day => {
            const w = seedlingWeightFresh(plateauSize, thinDay, day, stressed);
            return { day, weight: w, atCap: w >= capSpaced - 0.5 };
          }),
        })),
      };
    }),
  };
}

Object.assign(window.YieldRange, {
  seedlingWeightFresh,
  seedlingClosureWeightFresh,
  seedlingTrajectory,
  seedlingChartModel,
  seedlingClosureDay,
  seedlingThinningGrid,
  SEEDLING_RGR,
  SEEDLING_RUE,
  SEEDLING_STRESS_RUE,
  SEEDLING_DLI,
  SEEDLING_DM_FRACTION,
});
