// ─── yield-range/calc.js — pure functions for the two-regime yield model ─
//
// Spec: yield-range/spec.md (REQ-112..118, REQ-171..175).
// Constants: yield-range/data.js. Public API: yield-range/model.js.

function piecewiseLinear(value, breakpoints) {
  if (!breakpoints || breakpoints.length === 0) return 0;
  if (value <= breakpoints[0].x) return breakpoints[0].y;
  const last = breakpoints[breakpoints.length - 1];
  if (value >= last.x) return last.y;
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const a = breakpoints[i];
    const b = breakpoints[i + 1];
    if (value >= a.x && value <= b.x) {
      if (b.x === a.x) return a.y;
      const t = (value - a.x) / (b.x - a.x);
      return a.y + t * (b.y - a.y);
    }
  }
  return last.y;
}

function f_light(dliPerPlant) {
  return piecewiseLinear(dliPerPlant, F_LIGHT_BREAKPOINTS);
}

function spacing_factor(d) {
  const bp = NURSERY_SPACING_PACKED.map(p => ({ x: p.day, y: p.factor }));
  return piecewiseLinear(d, bp);
}

function dliBenchAvg(ledHours) {
  return DLI_SUN_GH_ANNUAL_AVG_QC + (LED_PPFD * ledHours * 3600) / 1e6;
}

// REQ-173: per-plant canopy cap at field density (g).
function fieldCanopyCapByDensity(fieldDensityHeadsPerM2) {
  return (1 / fieldDensityHeadsPerM2) * FIELD_CANOPY_HEIGHT_M * FIELD_FOLIAGE_DENSITY_KG_PER_M3 * 1000;
}

// REQ-174: field per-plant DLI share with ceiling 1.0 and floor 0.40.
function perPlantDliShareField(weightG, fieldDensityHeadsPerM2) {
  const raw = 1 / (LEAF_PROJECTED_AREA_M2_PER_G * weightG * fieldDensityHeadsPerM2);
  return Math.max(0.40, Math.min(1.0, raw));
}

// predictNurseryYield — two-regime integrator + throughput-bounded annual yield.
// Inputs (all required): plateauSize, ledHours, nurseryDays, fieldDays,
// fieldDensityHeadsPerM2, nurseryAreaM2, fieldAreaM2. Throws on missing.
function predictNurseryYield(inputs) {
  const {
    plateauSize,
    ledHours,
    nurseryDays,
    fieldDays,
    fieldDensityHeadsPerM2,
    nurseryAreaM2,
    fieldAreaM2,
  } = inputs;

  const nurseryCanopyCapG = CANOPY_CAP_BY_PLATEAU[plateauSize];
  if (nurseryCanopyCapG == null) {
    throw new Error(`predictNurseryYield: unknown plateauSize ${plateauSize}; expected 18, 24, 32, or 50`);
  }
  if (!Number.isFinite(nurseryDays) || nurseryDays < 1) {
    throw new Error(`predictNurseryYield: nurseryDays must be ≥ 1, got ${nurseryDays}`);
  }
  if (!Number.isFinite(fieldDays) || fieldDays < 1) {
    throw new Error(`predictNurseryYield: fieldDays must be ≥ 1, got ${fieldDays}`);
  }
  if (!Number.isFinite(fieldDensityHeadsPerM2) || fieldDensityHeadsPerM2 <= 0) {
    throw new Error(`predictNurseryYield: fieldDensityHeadsPerM2 must be > 0, got ${fieldDensityHeadsPerM2}`);
  }
  if (!Number.isFinite(nurseryAreaM2) || nurseryAreaM2 <= 0) {
    throw new Error(`predictNurseryYield: nurseryAreaM2 must be > 0, got ${nurseryAreaM2}`);
  }
  if (!Number.isFinite(fieldAreaM2) || fieldAreaM2 <= 0) {
    throw new Error(`predictNurseryYield: fieldAreaM2 must be > 0, got ${fieldAreaM2}`);
  }

  const fieldCanopyCapG = fieldCanopyCapByDensity(fieldDensityHeadsPerM2);
  const benchDli = dliBenchAvg(ledHours);
  const totalDays = nurseryDays + fieldDays;

  let W = W_INIT_GERMINATED_G;
  const trajectory = [{ day: 0, weight_g: W, regime: 'nursery' }];
  let daysToTransplantPotential = null;
  let daysToHarvestPotential = null;
  let transplantWeightG = null;

  for (let d = 1; d <= totalDays; d++) {
    const inNursery = d <= nurseryDays;
    const cap = inNursery ? nurseryCanopyCapG : fieldCanopyCapG;
    const share = inNursery
      ? spacing_factor(d)
      : perPlantDliShareField(W, fieldDensityHeadsPerM2);
    const dliPerPlant = benchDli * share;
    const fL = f_light(dliPerPlant);
    W = W * (1 + RGR_MAXIMUM_LETTUCE_NURSERY * (1 - W / cap) * fL);
    const regime = inNursery ? 'nursery' : 'field';
    trajectory.push({ day: d, weight_g: W, regime });

    if (inNursery) {
      if (daysToTransplantPotential === null && W >= POTENTIAL_THRESHOLD * nurseryCanopyCapG) {
        daysToTransplantPotential = d;
      }
      if (d === nurseryDays) {
        transplantWeightG = W;
      }
    } else {
      if (daysToHarvestPotential === null && W >= POTENTIAL_THRESHOLD * fieldCanopyCapG) {
        daysToHarvestPotential = d;
      }
    }
  }

  const harvestWeightG = W;

  const trayCellsPerM2 = plateauSize / TRAY_FRAME_M2;
  const nurseryOutputPerDay = (nurseryAreaM2 * trayCellsPerM2) / nurseryDays;
  const fieldIntakePerDay = (fieldAreaM2 * fieldDensityHeadsPerM2) / fieldDays;
  const headsPerDay = Math.min(nurseryOutputPerDay, fieldIntakePerDay);
  const bottleneckStage = nurseryOutputPerDay <= fieldIntakePerDay ? 'nursery' : 'field';
  const annualYieldKg = headsPerDay * 365 * harvestWeightG / 1000;

  return {
    nurseryCanopyCapG,
    fieldCanopyCapG,
    transplantWeightG,
    harvestWeightG,
    daysToTransplantPotential,
    daysToHarvestPotential,
    trajectory,
    annualYieldKg,
    bottleneckStage,
  };
}
