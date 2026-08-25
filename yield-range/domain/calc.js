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

// ── Germination timing ───────────────────────────────────────────────

// Days from sowing to emergence at a constant nursery soil temperature.
// Thermal time: the seed fires once it has banked
// GERMINATION_THERMAL_TIME_DEGREE_DAYS above GERMINATION_BASE_TEMPERATURE_C.
// Returns null when the seed cannot fire at all — at or below the base
// temperature nothing accumulates, above the inhibition temperature it is
// thermo-dormant.
function germinationDaysFromSoilTemperature(soilTemperatureC) {
  if (soilTemperatureC <= GERMINATION_BASE_TEMPERATURE_C) return null;
  if (soilTemperatureC > GERMINATION_INHIBITION_TEMPERATURE_C) return null;
  return GERMINATION_THERMAL_TIME_DEGREE_DAYS / (soilTemperatureC - GERMINATION_BASE_TEMPERATURE_C);
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
// spaced (post-thin: area × areaFactor, canopy re-loads at field geometry).
function nurseryCapPackedFresh(cellsPerTray) {
  return (TRAY_FRAME_M2 / cellsPerTray) * FOLIAGE_HEIGHT_M * FOLIAGE_DENSITY_KG_PER_M3 * 1000;
}
function nurseryCapSpacedFresh(cellsPerTray, areaFactor) {
  return (areaFactor * TRAY_FRAME_M2 / cellsPerTray) * FIELD_CANOPY_HEIGHT_M * FIELD_FOLIAGE_DENSITY_KG_PER_M3 * 1000;
}

// ── predictYield — carbon-balance full cycle + throughput + sales ────
//
// Inputs (all required): fieldSpacingKey, laborRoutineKey, nurseryTrayCells,
// thinEvents ([{ day, areaFactor }], days ascending in [1, nurseryDays],
// factors ≥ 1 non-decreasing; [] = no thin), nurseryDays (int).
// Throws on unknown keys or out-of-range events.
//
// Growth law per step: net_dry = ε·DLI·A_ground·(1 − exp(−k·LAI)),
// LAI = W_dry·SLA/A_ground, clamped to the volume cap; once the canopy has
// been closed ≥ SENESCENCE_ONSET_DAYS, net stalls to 0 (senescence: new-leaf
// gain offset by lower-leaf loss). Canopy "closed" = LAI ≥ LAI_CLOSURE; area
// jumps (thin events, transplant) re-open it and reset the closed-day clock.
// Nursery ground area = areaFactor × base cell area, areaFactor = the latest
// thin event's factor (1 before any event) — factors are absolute, not
// compounding. ε and dry-matter fraction are STAGE-SPECIFIC: the nursery uses
// the plug DM and, when nurseryStress, the drought+heat ε (unanchored, see
// data.js); the field uses the field DM and clean ε. The DM step up at
// transplant is the rehydration lift.
function predictYield(inputs) {
  const {
    fieldSpacingKey,
    laborRoutineKey,
    nurseryTrayCells,
    thinEvents = [],
    nurseryDays,
    nurseryStress = false,
    nurserySoilTemperatureC = NURSERY_SOIL_TEMPERATURE_C,
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
  let previousEvent = { day: 0, areaFactor: 1 };
  for (const event of thinEvents) {
    if (!Number.isFinite(event.day) || event.day < 1 || event.day > nurseryDays || event.day <= previousEvent.day) {
      throw new Error(`predictYield: thinEvents days must ascend within [1, ${nurseryDays}], got ${event.day}`);
    }
    if (!Number.isFinite(event.areaFactor) || event.areaFactor < previousEvent.areaFactor) {
      throw new Error(`predictYield: thinEvents areaFactor must be ≥ 1 and non-decreasing, got ${event.areaFactor}`);
    }
    previousEvent = event;
  }

  const germinationDays = germinationDaysFromSoilTemperature(nurserySoilTemperatureC);
  if (germinationDays == null) {
    throw new Error(`predictYield: no germination at ${nurserySoilTemperatureC} °C — outside ${GERMINATION_BASE_TEMPERATURE_C}..${GERMINATION_INHIBITION_TEMPERATURE_C} °C`);
  }
  // Day 1 is sowing, so emergence lands this far along the same axis.
  const emergenceDay = 1 + germinationDays;

  const density = fieldDensityFromConfig(spacing);
  const fieldDays = routine.fieldDays;
  const bedsPerWeek = BED_COUNT / (fieldDays / 7);
  const totalDays = nurseryDays + fieldDays;

  // Area factor at a nursery day: the latest thin event's factor, absolute.
  const areaFactorAtDay = day => {
    let factor = 1;
    for (const event of thinEvents) if (day >= event.day - 1e-9) factor = event.areaFactor;
    return factor;
  };
  const finalAreaFactor = areaFactorAtDay(nurseryDays);

  const nurseryCapPackedG = nurseryCapPackedFresh(nurseryTrayCells);
  // Operative nursery cap at the final thin factor; packed when never re-spaced.
  const nurseryCapSpacedG = finalAreaFactor > 1
    ? nurseryCapSpacedFresh(nurseryTrayCells, finalAreaFactor)
    : nurseryCapPackedG;
  const fieldCapG = fieldCanopyCapByDensity(density);

  const stepsPerDay = Math.round(1 / GROWTH_STEP_DAYS);
  const totalSteps = (totalDays - 1) * stepsPerDay;

  let weightDry = EMERGENCE_DRY_MASS_G;
  let daysClosed = 0;
  // Day 1 is the sowing day, in the nursery → plug DM.
  const trajectory = [{ day: 1, weight_g: weightDry / PLUG_DRY_MATTER_FRACTION, regime: 'nursery' }];
  let transplantWeightG = null;

  for (let step = 1; step <= totalSteps; step++) {
    const day = 1 + step / stepsPerDay;
    const inNursery = day <= nurseryDays + 1e-9;
    const areaFactor = inNursery ? areaFactorAtDay(day) : 1;

    const dmFraction = inNursery ? PLUG_DRY_MATTER_FRACTION : DRY_MATTER_FRACTION;
    const radiationUseEfficiency = inNursery && nurseryStress
      ? NURSERY_STRESS_RUE
      : RADIATION_USE_EFFICIENCY;

    const areaGround = inNursery
      ? areaFactor * TRAY_FRAME_M2 / nurseryTrayCells
      : 1 / density;
    const capDry = (inNursery
      ? (areaFactor > 1 ? nurseryCapSpacedFresh(nurseryTrayCells, areaFactor) : nurseryCapPackedG)
      : fieldCapG) * dmFraction;

    const leafAreaIndex = weightDry * SPECIFIC_LEAF_AREA / areaGround;
    const interceptedFraction = 1 - Math.exp(-LEAF_AREA_EXTINCTION_K * leafAreaIndex);
    // Light the plant can actually use at its age — cotyledon/true-leaf stages
    // saturate below the target (#3), a hardened plug above it. Field ages sit
    // at the target.
    const effectiveDli = inNursery ? nurseryLightCeiling(day) : DLI_TARGET;
    // Before emergence the seed is heterotrophic: no light-driven gain. The
    // day it fires comes from thermal time, not a constant.
    const gain = day < emergenceDay
      ? 0
      : radiationUseEfficiency * effectiveDli * areaGround * interceptedFraction;
    const canopyClosed = leafAreaIndex >= LAI_CLOSURE;
    daysClosed = canopyClosed ? daysClosed + GROWTH_STEP_DAYS : 0;

    // Senescence stall: held closed past onset, net gain drops to 0 — the
    // head plateaus, it does not lose mass.
    const netDry = daysClosed >= SENESCENCE_ONSET_DAYS ? 0 : gain;

    weightDry = Math.max(0, Math.min(weightDry + netDry * GROWTH_STEP_DAYS, capDry));

    const weightFresh = weightDry / dmFraction;

    if (step % stepsPerDay === 0) {
      const dayInt = 1 + step / stepsPerDay;
      trajectory.push({ day: dayInt, weight_g: weightFresh, regime: dayInt <= nurseryDays ? 'nursery' : 'field' });
      if (dayInt === nurseryDays) transplantWeightG = weightFresh;
    }
  }

  const harvestWeightG = weightDry / DRY_MATTER_FRACTION;

  // Throughput — steady weekly rotation of the beds (Little's law).
  const headsPerBed = BED_AREA_M2 * density;
  const headsPerWeek = bedsPerWeek * headsPerBed;
  const headsPerDay = headsPerWeek / 7;
  const kgPerWeek = headsPerWeek * harvestWeightG / 1000;
  const kgPerMonth = kgPerWeek * 52 / 12;
  const kgPerYear = kgPerWeek * 52;
  const yearlySalesDollars = kgPerYear * PRICE_PER_KG;

  // Trays at a time in the nursery = heads/day × Σ (trays-per-head over age).
  // A cohort re-spaced to areaFactor× occupies areaFactor× trays from that day.
  let trayDayIntegral = 0;
  let segmentStart = 0;
  let segmentFactor = 1;
  for (const event of thinEvents) {
    trayDayIntegral += (event.day - segmentStart) * segmentFactor;
    segmentStart = event.day;
    segmentFactor = event.areaFactor;
  }
  trayDayIntegral += (nurseryDays - segmentStart) * segmentFactor;
  trayDayIntegral /= nurseryTrayCells;
  // All tray counts carry the sowing backup margin (germination misses, culls).
  const backupFactor = 1 + NURSERY_BACKUP_FRACTION;
  const traysInNursery = headsPerDay * trayDayIntegral * backupFactor;
  // Trays sown each week to feed the rotation (pre-thin, packed cells).
  const traysSeededPerWeek = headsPerWeek / nurseryTrayCells * backupFactor;
  // Trays on the bench per cohort age week (steady rotation: one cohort per
  // week; a re-spaced cohort holds areaFactor× its sown trays).
  const nurseryWeeks = Math.ceil((nurseryDays - 1) / 7);
  const traysByNurseryWeek = [];
  for (let week = 1; week <= nurseryWeeks; week++) {
    traysByNurseryWeek.push({
      week,
      trays: traysSeededPerWeek * areaFactorAtDay((week - 1) * 7 + 1),
    });
  }

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
    germinationDays,
    emergenceDay,
    trajectory,
    headsPerWeek,
    kgPerWeek,
    kgPerMonth,
    kgPerYear,
    yearlySalesDollars,
    traysInNursery,
    traysSeededPerWeek,
    traysByNurseryWeek,
  };
}
