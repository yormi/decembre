// ─── yield-range/calc.js — pure functions for the time-to-canopy-cap model ─
//
// Spec: yield-range/spec.md (REQ-112 to REQ-118).
// Constants: yield-range/data.js. Public API: yield-range/model.js.

// piecewiseLinear(value, breakpoints) — linear interpolation across an array
// of {x, y} points sorted by x. Values outside the range clamp to the nearest
// endpoint. Used by f_light directly; spacing_factor wraps it via {day, factor}.
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

// f_light(dliPerPlant) → growth multiplier in [0, 1]. Reads F_LIGHT_BREAKPOINTS.
function f_light(dliPerPlant) {
  return piecewiseLinear(dliPerPlant, F_LIGHT_BREAKPOINTS);
}

// spacing_factor(d) → fraction of bench DLI that reaches the average plant.
// REQ-116: packed-canopy curve; floor 0.40 at d ≥ 28. Walks
// NURSERY_SPACING_PACKED in {day, factor} shape (we re-key to {x, y} for
// piecewiseLinear).
function spacing_factor(d) {
  const bp = NURSERY_SPACING_PACKED.map(p => ({ x: p.day, y: p.factor }));
  return piecewiseLinear(d, bp);
}

// dliBenchAvg(ledHours) → bench-level DLI in mol/m²/d.
// REQ-114: sun (annual avg) + LED contribution.
//   LED mol = 200 µmol/m²/s × hours × 3600 s/h ÷ 1e6 µmol/mol
function dliBenchAvg(ledHours) {
  return DLI_SUN_GH_ANNUAL_AVG_QC + (LED_PPFD * ledHours * 3600) / 1e6;
}

// predictNurseryYield({ plateauSize, ledHours }) — one cohort prediction.
//
// REQ-115: daily logistic growth, no decay, no senescence.
//   W(d+1) = W(d) × (1 + RGR_MAX × (1 − W/cap) × f_light(dliPerPlant(d)))
// REQ-113: best non-light conditions — no f_Tday, f_Tnight, f_CE, f_VPD,
// f_CO2, f_pH multipliers in the daily growth term.
// REQ-112: ceiling = canopyCapG (density-driven), not root-volume cap.
// REQ-116: per-plant DLI = bench DLI × spacing_factor(d).
// REQ-117: daysToPotential = first integer d where W ≥ 0.95 × cap, else null.
// REQ-118: trajectory length = TRAJECTORY_MAX_DAYS + 1 = 50 entries (day 0..49).
function predictNurseryYield({ plateauSize, ledHours }) {
  const cap = CANOPY_CAP_BY_PLATEAU[plateauSize];
  if (cap == null) {
    throw new Error(`predictNurseryYield: unknown plateauSize ${plateauSize}; expected 32 or 50`);
  }
  const benchDli = dliBenchAvg(ledHours);
  let W = W_INIT_GERMINATED_G;
  const trajectory = [{ day: 0, weight_g: W }];
  let daysToPotential = null;
  for (let d = 1; d <= TRAJECTORY_MAX_DAYS; d++) {
    const dpp = benchDli * spacing_factor(d);
    const fL = f_light(dpp);
    // Logistic increment. No decay branch (REQ-115) — when f_light → 0 or
    // W → cap, the increment goes to zero but W never decreases.
    W = W * (1 + RGR_MAX_LETTUCE_NURSERY * (1 - W / cap) * fL);
    trajectory.push({ day: d, weight_g: W });
    if (daysToPotential === null && W >= POTENTIAL_THRESHOLD * cap) {
      daysToPotential = d;
    }
  }
  return { canopyCapG: cap, daysToPotential, trajectory };
}
