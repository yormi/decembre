// ─── yield-range/calc.js — Salanova nursery yield prediction (pure logic) ──
//
// Reads constants from yield-range/data.js (loaded earlier via @include).
// Pure functions — no DOM, no globals beyond reading data.js exports.
//
// REQ scope (see yield-range/spec.md):
//   REQ-063 — packed-canopy spacing decay applied via spacing_factor(d)
//   REQ-064 — NO pH-lockout multiplier (CE function depends on CE only)
//   REQ-065 — env inputs are photoperiod-weighted (var names: vpdPhotoperiodAvgGM3,
//             co2PhotoperiodAvgPpm); function never accepts a 24h average
//   REQ-066 — VPD in g/m³ (suffix _GM3)
//   REQ-067 — predictNurseryYield returns wLowG / wPredictedG / wHighG via
//             YIELD_BAND_FACTOR_LOW/HIGH
//   REQ-068 — Salanova-only (varietyKey gates the model)
//   REQ-069 — bindingConstraint surfaced on every prediction
//   REQ-070 — senescence branch + optimalHarvestDay
//   REQ-071 — bolting flag when tDayAvgC > BOLTING_TDAY_THRESHOLD_C

// piecewiseLinear(value, breakpoints): clamped linear interpolation over a
// sorted array of {x, y} points. Values below the first or above the last
// breakpoint clamp to the endpoint y. Used for every stress function.
function piecewiseLinear(value, breakpoints) {
  if (!breakpoints || !breakpoints.length) return 0;
  if (value <= breakpoints[0].x) return breakpoints[0].y;
  if (value >= breakpoints[breakpoints.length - 1].x) return breakpoints[breakpoints.length - 1].y;
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const a = breakpoints[i];
    const b = breakpoints[i + 1];
    if (value >= a.x && value <= b.x) {
      if (b.x === a.x) return a.y;
      const t = (value - a.x) / (b.x - a.x);
      return a.y + t * (b.y - a.y);
    }
  }
  return breakpoints[breakpoints.length - 1].y;
}

// f_light: photosynthetically usable light at the plant. Floor below 4
// mol/m²/d (etiolation flag handled by caller). Above 22, mild excess
// (tipburn flag). Uses DLI_per_plant, NOT DLI_bench (caller multiplies by
// spacing_factor — REQ-063).
function f_light(dliPerPlant) {
  return piecewiseLinear(dliPerPlant, F_LIGHT_BREAKPOINTS);
}

// f_Tday: daily-period mean temperature. REQ-071 bolting threshold sits
// inside this curve (26 °C — quality collapses before raw growth does).
function f_Tday(T) {
  return piecewiseLinear(T, F_TDAY_BREAKPOINTS);
}

// f_Tnight: piecewise with explicit "very high" floor (>24 → 0.6, breaks
// the linear extrapolation — high night T drives stretch + respiration loss).
function f_Tnight(T) {
  if (T > 24) return F_TNIGHT_FLOOR_HIGH;
  return piecewiseLinear(T, F_TNIGHT_BREAKPOINTS);
}

// f_CE: applied fertigation conductivity. REQ-064 — NO pH-lockout penalty.
// Above 4.5 mS/cm clips to F_CE_FLOOR_HIGH (salt stress). Luxury push 1.05
// at 2.7–3.4 keeps the natural Salanova response curve.
function f_CE(ce) {
  if (ce > 4.5) return F_CE_FLOOR_HIGH;
  return piecewiseLinear(ce, F_CE_BREAKPOINTS);
}

// f_VPD (g/m³): REQ-066. <2 floor 0.7 (Ca translocation + disease pressure);
// >11 floor 0.5 (water stress). Inside band, curve is piecewise-linear.
function f_VPD(vpd_gm3) {
  if (vpd_gm3 < 2)  return F_VPD_FLOOR_LOW_GM3;
  if (vpd_gm3 > 11) return F_VPD_FLOOR_HIGH_GM3;
  return piecewiseLinear(vpd_gm3, F_VPD_BREAKPOINTS_GM3);
}

// f_CO2: REQ-065 — photoperiod-weighted CO₂ only. Linear interpolation
// between anchored ppm levels.
function f_CO2(ppm) {
  return piecewiseLinear(ppm, F_CO2_BREAKPOINTS_PPM);
}

// REQ-063: packed-canopy spacing decay. Hardcoded curve from
// NURSERY_SPACING_PACKED. Floor ≤ 0.40 past d28.
function spacing_factor(d) {
  return piecewiseLinear(d, NURSERY_SPACING_PACKED);
}

// RootCap = cellVolumeML × SHOOT_PER_ML_SUBSTRATE (g FW). Hochmuth-anchored
// (cert 3): 35 mL → 56 g; 90 mL → 144 g; 200 mL → 320 g.
function rootCap(cellVolumeML) {
  return cellVolumeML * SHOOT_PER_ML_SUBSTRATE;
}

// ─── Top-lever sensitivity weights (rough — used only for ordering) ────────
// Not load-bearing values; used by topLevers ordering so the ranked list
// reflects "biggest realistic gain if you change this". Light is highest
// because spacing/density is the dominant lever (per spec rationale).
const STRESS_SENSITIVITY = {
  light: 1.5, Tday: 1.0, Tnight: 0.8, CE: 0.6, VPD: 0.7, CO2: 0.5,
};

// predictNurseryYield(inputs): the headline function. Daily integration of
// the logistic + senescence branches per yield-range/spec.md & derivation.md.
// Inputs object documented in yield-range/spec.md "Inputs". Returns the
// output object documented in yield-range/spec.md "Outputs".
//
// REQ-069: returns bindingConstraint identifying the dominant limiter.
// REQ-070: senescence branch + optimalHarvestDay.
// REQ-067: ±15% band via YIELD_BAND_FACTOR_LOW/HIGH.
// REQ-071: bolting flag when cycle-average T_day > BOLTING_TDAY_THRESHOLD_C.
function predictNurseryYield(inputs) {
  const i = inputs || {};
  const varietyKey      = i.varietyKey || 'salanova';
  const cellVolumeML    = i.cellVolumeML != null ? i.cellVolumeML : 35;
  const cellsPerTray    = i.cellsPerTray != null ? i.cellsPerTray : 50;
  const traysPerCohort  = i.traysPerCohort != null ? i.traysPerCohort : 50;
  const cycleDays       = i.cycleDays != null ? i.cycleDays : 28;
  const dliBenchAvg     = i.dliBenchAvg != null ? i.dliBenchAvg : DLI_BENCH_AVG_DEFAULT;
  const tDayAvgC        = i.tDayAvgC != null ? i.tDayAvgC : 24;
  const tNightAvgC      = i.tNightAvgC != null ? i.tNightAvgC : 18;
  const ceAvg           = i.ceAvg != null ? i.ceAvg : 1.8;
  const vpdPhotoperiodAvgGM3 = i.vpdPhotoperiodAvgGM3 != null ? i.vpdPhotoperiodAvgGM3 : 4.5;
  const co2PhotoperiodAvgPpm = i.co2PhotoperiodAvgPpm != null ? i.co2PhotoperiodAvgPpm : 500;
  const wInitG          = i.wInitG != null ? i.wInitG : W_INIT_FALLBACK_G;

  // REQ-068: variety library is Salanova-only. Unknown varieties fall
  // back to Salanova baseline rather than throwing — defensive default.
  const varietyFactor = (VARIETY_LIBRARY[varietyKey] || VARIETY_LIBRARY.salanova).rgrMaxFactor;

  const cap = rootCap(cellVolumeML);

  // Cycle-constant stress factors (only f_light varies day-by-day via spacing).
  const fT_day   = f_Tday(tDayAvgC);
  const fT_night = f_Tnight(tNightAvgC);
  const fCe      = f_CE(ceAvg);
  const fVpd     = f_VPD(vpdPhotoperiodAvgGM3);
  const fCo2     = f_CO2(co2PhotoperiodAvgPpm);

  // Track per-day W and the binding constraint over the cycle.
  let W = wInitG;
  let wPeak = W;
  let optimalHarvestDay = 0;
  let daysToRootCap = Infinity;
  let bindingConstraint = 'none';
  let bindingValue = Infinity;        // smaller = tighter binding
  let senescenceTriggeredAt = -1;
  // Track minimum stress factor across the cycle to identify the dominant
  // env limiter (independent of root-cap). f_light varies, so we recompute.
  const factorMins = { light: Infinity, Tday: fT_day, Tnight: fT_night, CE: fCe, VPD: fVpd, CO2: fCo2 };

  // Daily integration: REQ-070 senescence branch when growth_factor < threshold
  // AND Π_stress < threshold. Otherwise compound logistic growth.
  let dayLastPositive = 0;
  for (let d = 1; d <= cycleDays; d++) {
    const dliPerPlant = dliBenchAvg * spacing_factor(d);
    const fL = f_light(dliPerPlant);
    if (fL < factorMins.light) factorMins.light = fL;

    const piStress = fL * fT_day * fT_night * fCe * fVpd * fCo2;
    const logisticTerm = Math.max(0, 1 - W / cap);
    const growthFactor = RGR_MAX_LETTUCE_NURSERY * varietyFactor * logisticTerm * piStress;

    if (growthFactor < SENESCENCE_GROWTH_THRESH && piStress < SENESCENCE_STRESS_THRESH) {
      // Senescence: W drops by DECAY_RATE × (0.5 − Π_stress).
      const decay = DECAY_RATE * Math.max(0, SENESCENCE_STRESS_THRESH - piStress);
      W = W * (1 - decay);
      if (senescenceTriggeredAt < 0) senescenceTriggeredAt = d;
    } else {
      // Active growth: logistic with stress.
      W = W * (1 + growthFactor);
      if (W > wPeak) wPeak = W;
      // Last day where dW/dt > 0 = optimal harvest day (REQ-070).
      if (growthFactor > 0) dayLastPositive = d;
    }

    if (W >= cap * 0.95 && daysToRootCap === Infinity) daysToRootCap = d;
  }
  optimalHarvestDay = senescenceTriggeredAt > 0
    ? Math.max(0, senescenceTriggeredAt - 1)   // last day BEFORE senescence
    : dayLastPositive;

  // REQ-069: identify the binding constraint. If senescence fired before the
  // requested cycleDays, that's the binder. Else if root-cap was reached,
  // 'root'. Else the lowest-multiplier env factor.
  if (senescenceTriggeredAt > 0 && senescenceTriggeredAt <= cycleDays) {
    bindingConstraint = 'senescence';
    bindingValue = 0;
  } else if (daysToRootCap !== Infinity && daysToRootCap <= cycleDays) {
    bindingConstraint = 'root';
    bindingValue = 0;
  } else {
    let lowestKey = 'light';
    let lowestVal = Infinity;
    Object.keys(factorMins).forEach(k => {
      const v = factorMins[k];
      if (v < lowestVal) { lowestVal = v; lowestKey = k; }
    });
    bindingConstraint = lowestKey;
    bindingValue = lowestVal;
  }

  // REQ-067: prediction band. wPredicted is the weight at cycleDays (post
  // senescence if it fired); ±15% gives wLow / wHigh.
  const wPredictedG = Math.min(W, cap);
  const wLowG  = wPredictedG * YIELD_BAND_FACTOR_LOW;
  const wHighG = wPredictedG * YIELD_BAND_FACTOR_HIGH;

  // Top 3 levers: rank env factors by (1 − f) × sensitivity. Skip 'light'
  // because spacing is hardcoded packed (REQ-063) — surfacing it as a lever
  // would confuse the operator (the top-lever fix is "spread trays", which
  // is explicitly out of scope).
  const leverScores = Object.keys(factorMins)
    .filter(k => k !== 'light')
    .map(k => ({
      key: k,
      score: (1 - factorMins[k]) * (STRESS_SENSITIVITY[k] || 1.0),
      value: factorMins[k],
    }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Risk flags — match REQ-071 (bolting) plus tipburn / etiolation /
  // water_stress / disease per spec "Outputs" table.
  const riskFlags = [];
  if (ceAvg > 2.7 && vpdPhotoperiodAvgGM3 < 2) riskFlags.push('tipburn');
  if (dliBenchAvg < 8) riskFlags.push('etiolation');
  if (vpdPhotoperiodAvgGM3 > 11) riskFlags.push('water_stress');
  if (vpdPhotoperiodAvgGM3 < 2) riskFlags.push('disease');
  if (tDayAvgC > BOLTING_TDAY_THRESHOLD_C) riskFlags.push('bolting');   // REQ-071

  // regressionWarning — operator harvesting past peak (cycleDays > optimalHarvestDay).
  const regressionWarning = optimalHarvestDay > 0 && cycleDays > optimalHarvestDay;

  // Per-tray + per-cohort + g/m²/yr (REQ-076 formula).
  const yieldPerTrayG    = wPredictedG * cellsPerTray;
  const yieldPerCohortKg = (yieldPerTrayG * traysPerCohort) / 1000;
  // cycleDays → cycleWeeks → cyclesPerYear (52 / weeks). Ceiling/round to
  // nearest week to mirror what the auto-sweep and the page display use.
  const cycleWeeks = Math.max(1, Math.round(cycleDays / 7));
  const cyclesPerYear = 52 / cycleWeeks;
  const plantsPerM2 = cellsPerTray / TRAY_AREA_M2;
  const gPerM2PerYear = plantsPerM2 * wPredictedG * cyclesPerYear;

  return {
    wPredictedG,
    wPeakG: wPeak,
    wLowG,
    wHighG,
    optimalHarvestDay,
    daysToRootCap,
    bindingConstraint,
    bindingValue,
    topLevers: leverScores,
    riskFlags,
    regressionWarning,
    yieldPerTrayG,
    yieldPerCohortKg,
    gPerM2PerYear,
    // Diagnostic — surfaced for the page's auto-sweep + drift inspection.
    cycleDays,
    cycleWeeks,
    cellsPerTray,
    cellVolumeML,
    rootCapG: cap,
  };
}

// computeBestStrategy — REQ-077 auto-sweep over (plateau × stratégie nutritive).
//   plateau ∈ {32, 50}    (cellVolumeML 90 vs 35; cellsPerTray 32 vs 50)
//   strategy ∈ {actuelle, parfaite}  (CE 1.8 mS/cm vs 2.4 mS/cm)
//
// For each combination, the optimum cycle = optimalHarvestDay rounded to the
// nearest week. Each combination is evaluated AT its peak day so we don't
// recommend past-peak harvests. The combination with the highest gPerM2PerYear
// at its optimum cycle is the winner.
function computeBestStrategy(dliBenchAvg, traysPerCohort) {
  const trays = traysPerCohort != null ? traysPerCohort : 50;
  const dli   = dliBenchAvg    != null ? dliBenchAvg    : DLI_BENCH_AVG_DEFAULT;
  const STRATEGY_CE = { actuelle: 1.8, parfaite: 2.4 };

  const all4 = [];
  // Outer probe with a generous cycleDays (49) to find the peak day, then
  // a re-evaluation AT optimalHarvestDay (rounded to nearest week, ≥7d) so
  // gPerM2PerYear reflects harvesting at the peak.
  [32, 50].forEach(plateau => {
    const cellVolumeML = plateau === 32 ? 90 : 35;
    const cellsPerTray = plateau;
    Object.keys(STRATEGY_CE).forEach(strategy => {
      const ce = STRATEGY_CE[strategy];
      const probe = predictNurseryYield({
        varietyKey: 'salanova',
        cellVolumeML, cellsPerTray, traysPerCohort: trays,
        cycleDays: 49,
        dliBenchAvg: dli,
        ceAvg: ce,
        wInitG: W_INIT_GERMINATED_G,
      });
      const peakDay = Math.max(7, probe.optimalHarvestDay || 28);
      const weeksAtPeak = Math.max(1, Math.round(peakDay / 7));
      const peakDays = weeksAtPeak * 7;
      const peak = predictNurseryYield({
        varietyKey: 'salanova',
        cellVolumeML, cellsPerTray, traysPerCohort: trays,
        cycleDays: peakDays,
        dliBenchAvg: dli,
        ceAvg: ce,
        wInitG: W_INIT_GERMINATED_G,
      });
      all4.push({
        plateau, strategy,
        weeksAtPeak,
        cycleDays: peakDays,
        gPerSeedling: peak.wPredictedG,
        gPerM2PerYear: peak.gPerM2PerYear,
        bindingConstraint: peak.bindingConstraint,
      });
    });
  });

  let winner = all4[0];
  for (const c of all4) {
    if (c.gPerM2PerYear > winner.gPerM2PerYear) winner = c;
  }
  return { winner, all4 };
}
