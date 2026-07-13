// ─── yield-range/domain/calc.js — carbon-balance yield model ─
//
// Spec: yield-range/domain/spec.md.
// Constants: yield-range/domain/data.js. Public API: yield-range/domain/model.js.

// ── Supplemental-lighting feasibility (Lumière page) ─────────────────

// Bench sun DLI (mol/m²/j) for one sky condition: outdoor clear-day max
// attenuated by the condition factor, then by greenhouse transmission.
function benchSunDli(clearDayMaximumDli, conditionFactor) {
  return clearDayMaximumDli * conditionFactor * GH_LIGHT_TRANSMISSION_DOUBLE_POLY;
}

// Hours of 200 µmol/m²/s LED needed to lift benchSunDli to the target DLI.
// Floored at 0 (sun alone already meets the target → no supplement).
function supplementalLedHours(benchSunDli, targetDli) {
  const ledPerHour = (LED_PPFD * 3600) / 1e6;
  return Math.max(0, (targetDli - benchSunDli) / ledPerHour);
}

// DLI (mol/m²/j) delivered by the LED fixture over ledHours of runtime.
function ledDli(ledHours) {
  return (LED_PPFD * Math.max(0, ledHours) * 3600) / 1e6;
}

// ── Growth-engine geometry ───────────────────────────────────────────

// Field planting density (heads/m²) from a spacing config: rows across the
// bedtop spread over the bed width, one plant per in-row step.
function fieldDensityFromConfig(config) {
  return config.rows / (BED_WIDTH_M * config.inRowInch * IN_TO_M);
}

// Per-plant volume cap (fresh g) at field spacing: ground area × spaced
// mass-loading (height × density).
function fieldCanopyCapByDensity(fieldDensityHeadsPerM2) {
  return (1 / fieldDensityHeadsPerM2) * FIELD_CANOPY_HEIGHT_M * FIELD_FOLIAGE_DENSITY_KG_PER_M3 * 1000;
}

// Per-plant volume cap (fresh g) in the nursery tray, packed (pre-thin) and
// spaced (post checker-thin: area doubled, canopy re-loads at field geometry).
function nurseryCapPackedFresh(cellsPerTray) {
  return (TRAY_FRAME_M2 / cellsPerTray) * FOLIAGE_HEIGHT_M * FOLIAGE_DENSITY_KG_PER_M3 * 1000;
}
function nurseryCapSpacedFresh(cellsPerTray) {
  return (2 * TRAY_FRAME_M2 / cellsPerTray) * FIELD_CANOPY_HEIGHT_M * FIELD_FOLIAGE_DENSITY_KG_PER_M3 * 1000;
}

// ── predictYield — carbon-balance full cycle + throughput + sales ────
//
// Inputs (all required): fieldSpacingKey, laborRoutineKey, nurseryTrayCells,
// thinning (bool), thinDay (int|null when thinning), nurseryDays (int).
// Throws on unknown keys or out-of-range days.
//
// Growth law per step: net_dry = ε·DLI·A_ground·(1 − exp(−k·LAI)),
// LAI = W_dry·SLA/A_ground, clamped to the volume cap; once the canopy has
// been closed ≥ SENESCENCE_ONSET_DAYS, net flips to −SENESCENCE_DECLINE_RATE·W
// (senescence). Canopy "closed" = LAI ≥ LAI_CLOSURE; area jumps (checker-thin,
// transplant) and senescence shrink re-open it and reset the closed-day clock.
// ε and dry-matter fraction are STAGE-SPECIFIC: the nursery uses the plug DM
// and, when nurseryStress, the drought+heat ε (anchored to 5 g @ d25); the
// field uses the field DM and clean ε. The DM step up at transplant is the
// rehydration lift.
function predictYield(inputs) {
  const {
    fieldSpacingKey,
    laborRoutineKey,
    nurseryTrayCells,
    thinning,
    thinDay,
    nurseryDays,
    nurseryStress = false,
  } = inputs;

  const spacing = FIELD_SPACING_CONFIGS.find(c => c.key === fieldSpacingKey);
  if (!spacing) {
    throw new Error(`predictYield: unknown fieldSpacingKey ${fieldSpacingKey}`);
  }
  const routine = LABOR_ROUTINES.find(r => r.key === laborRoutineKey);
  if (!routine) {
    throw new Error(`predictYield: unknown laborRoutineKey ${laborRoutineKey}`);
  }
  if (!NURSERY_TRAY_CELLS.includes(nurseryTrayCells)) {
    throw new Error(`predictYield: nurseryTrayCells must be one of ${NURSERY_TRAY_CELLS.join(', ')}, got ${nurseryTrayCells}`);
  }
  if (!Number.isFinite(nurseryDays) || nurseryDays < 1) {
    throw new Error(`predictYield: nurseryDays must be ≥ 1, got ${nurseryDays}`);
  }
  const effectiveThinDay = thinning ? thinDay : null;
  if (effectiveThinDay != null && (!Number.isFinite(effectiveThinDay) || effectiveThinDay < 1 || effectiveThinDay > nurseryDays)) {
    throw new Error(`predictYield: thinDay must be in [1, ${nurseryDays}] when thinning, got ${effectiveThinDay}`);
  }

  const density = fieldDensityFromConfig(spacing);
  const fieldDays = routine.fieldDays;
  const bedsPerWeek = BED_COUNT / (fieldDays / 7);
  const totalDays = nurseryDays + fieldDays;

  const nurseryCapPackedG = nurseryCapPackedFresh(nurseryTrayCells);
  const nurseryCapSpacedG = nurseryCapSpacedFresh(nurseryTrayCells);
  const fieldCapG = fieldCanopyCapByDensity(density);

  const stepsPerDay = Math.round(1 / GROWTH_STEP_DAYS);
  const totalSteps = totalDays * stepsPerDay;

  let weightDry = W_INIT_GERMINATED_G;
  let daysClosed = 0;
  // Day 0 is in the nursery → plug DM.
  const trajectory = [{ day: 0, weight_g: weightDry / PLUG_DRY_MATTER_FRACTION, regime: 'nursery' }];
  let transplantWeightG = null;
  let peakWeightG = weightDry / PLUG_DRY_MATTER_FRACTION;
  let peakDay = 0;
  let nurseryPeakWeightG = weightDry / PLUG_DRY_MATTER_FRACTION;

  for (let step = 1; step <= totalSteps; step++) {
    const day = step / stepsPerDay;
    const inNursery = day <= nurseryDays + 1e-9;
    const thinned = effectiveThinDay != null && day >= effectiveThinDay - 1e-9 && inNursery;

    const dmFraction = inNursery ? PLUG_DRY_MATTER_FRACTION : DRY_MATTER_FRACTION;
    const radiationUseEfficiency = inNursery && nurseryStress
      ? NURSERY_STRESS_RUE
      : RADIATION_USE_EFFICIENCY;

    const areaGround = inNursery
      ? (thinned ? 2 : 1) * TRAY_FRAME_M2 / nurseryTrayCells
      : 1 / density;
    const capDry = (inNursery
      ? (thinned ? nurseryCapSpacedG : nurseryCapPackedG)
      : fieldCapG) * dmFraction;

    const leafAreaIndex = weightDry * SPECIFIC_LEAF_AREA / areaGround;
    const interceptedFraction = 1 - Math.exp(-LEAF_AREA_EXTINCTION_K * leafAreaIndex);
    // Light the plant can actually use at its age — cotyledon/true-leaf stages
    // saturate below the target (#3). Field ages sit at the full target.
    const effectiveDli = Math.min(DLI_TARGET, nurseryLightCeiling(day));
    const gain = radiationUseEfficiency * effectiveDli * areaGround * interceptedFraction;
    const canopyClosed = leafAreaIndex >= LAI_CLOSURE;
    daysClosed = canopyClosed ? daysClosed + GROWTH_STEP_DAYS : 0;

    const netDry = daysClosed >= SENESCENCE_ONSET_DAYS
      ? -SENESCENCE_DECLINE_RATE * weightDry
      : gain;

    weightDry = Math.max(0, Math.min(weightDry + netDry * GROWTH_STEP_DAYS, capDry));

    const weightFresh = weightDry / dmFraction;
    if (weightFresh > peakWeightG) {
      peakWeightG = weightFresh;
      peakDay = day;
    }
    if (inNursery && weightFresh > nurseryPeakWeightG) nurseryPeakWeightG = weightFresh;

    if (step % stepsPerDay === 0) {
      const dayInt = step / stepsPerDay;
      trajectory.push({ day: dayInt, weight_g: weightFresh, regime: dayInt <= nurseryDays ? 'nursery' : 'field' });
      if (dayInt === nurseryDays) transplantWeightG = weightFresh;
    }
  }

  const harvestWeightG = weightDry / DRY_MATTER_FRACTION;
  // Harvesting meaningfully past the peak — the head has lost >2% of its top
  // weight to senescence. Near-peak harvests (the 2-week routine) read false.
  const senescingAtHarvest = harvestWeightG < peakWeightG * 0.98;
  // Same test for the seedling: transplanted after it peaked in the tray
  // (a long/crowded nursery declines before transplant).
  const senescingAtTransplant = transplantWeightG < nurseryPeakWeightG * 0.98;

  // Throughput — steady weekly rotation of the beds (Little's law).
  const headsPerBed = BED_AREA_M2 * density;
  const headsPerWeek = bedsPerWeek * headsPerBed;
  const headsPerDay = headsPerWeek / 7;
  const kgPerWeek = headsPerWeek * harvestWeightG / 1000;
  const kgPerMonth = kgPerWeek * 52 / 12;
  const kgPerYear = kgPerWeek * 52;
  const yearlySalesDollars = kgPerYear * PRICE_PER_KG;

  // Trays at a time in the nursery = heads/day × Σ (trays-per-head over age).
  // Post-thin cohorts occupy 2× trays (re-spaced into more trays).
  const trayDayIntegral = effectiveThinDay != null
    ? effectiveThinDay / nurseryTrayCells + (nurseryDays - effectiveThinDay) * 2 / nurseryTrayCells
    : nurseryDays / nurseryTrayCells;
  const traysInNursery = headsPerDay * trayDayIntegral;

  return {
    density,
    fieldDays,
    bedsPerWeek,
    headsPerBed,
    nurseryCapPackedG,
    nurseryCapSpacedG,
    fieldCapG,
    transplantWeightG,
    harvestWeightG,
    peakWeightG,
    peakDay: Math.round(peakDay),
    nurseryPeakWeightG,
    senescingAtHarvest,
    senescingAtTransplant,
    trajectory,
    headsPerWeek,
    kgPerWeek,
    kgPerMonth,
    kgPerYear,
    yearlySalesDollars,
    traysInNursery,
  };
}
