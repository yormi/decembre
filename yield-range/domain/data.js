// ─── yield-range/domain/data.js — constants for the carbon-balance yield model ─
//
// Spec: yield-range/domain/spec.md. Calc: calc.js. Public API: model.js.
// Empirical anchor: yield-range/domain/doc/yield-range-calibration-2026-spring.md.
//
// Two concerns share this file:
//   1. Growth engine (carbon-balance) + operation geometry → predictYield.
//   2. Supplemental-lighting feasibility (sun + LED to hit DLI_TARGET) →
//      the Lumière page (app/operator/lumiere/lettuce/).

// ── Carbon-balance growth engine ─────────────────────────────────────
// dW_dry/dt = ε·DLI·A_ground·(1 − exp(−k·LAI)), LAI = W_dry·SLA/A_ground,
// clamped to the volume cap; flips to −DECLINE·W once the canopy has been
// closed past the onset. One Beer–Lambert interception term (no min knee).
// No weight anchor is currently reproduced. 5 g biggest @ d25 (50-cell,
// drought+heat) is a recorded datum only — biggest-plant basis, assumed DLI 17
// — see learnings/5g-day25-drought-heat-primary-anchor.md. The clean-regime
// datum awaiting a plug dry-matter measurement is 9.2 g @ d23, measured bench
// DLI 23.3. See derivation.md carbon-balance-growth.
const GROWTH_RGR = 0.20;                 // open-canopy exponential rate = ε·DLI·k·SLA; small-LAI limit of the curve, CLEAN (/day)
const RADIATION_USE_EFFICIENCY = 1.1;    // g dry mass / mol PAR — clean roots, well-watered
const NURSERY_STRESS_RUE = 0.85;         // effective ε under drought + high heat (nursery regime); UNANCHORED — was fitted to 5 g @ d25 at DLI 17, before the wk3+ ceiling moved to 25
const LEAF_AREA_EXTINCTION_K = 0.7;      // canopy light-extinction coefficient (Beer–Lambert)
const LAI_CLOSURE = 3;                   // LAI at which the canopy is light-limited (fi ≈ 0.88)
// Dry-matter fraction is STAGE-SPECIFIC (not one value): the plug is firm/dry,
// the field head is hydrated. The plug never reaches its volume cap, so this
// choice sets its fresh weight directly. NOT unified with the nursery lane's
// LETTUCE_NURSERY_DM_FRACTION (different consumer). See derivation.
const PLUG_DRY_MATTER_FRACTION = 0.07;   // nursery plug — firm young tissue, drier under drought
const DRY_MATTER_FRACTION = 0.045;       // field/mature head — hydrated
// Dry mass at EMERGENCE — the intercept the photosynthetic curve integrates
// from once the seed has fired. FITTED against cohort D day 12 = 0.5 g
// (stressed ε, 50-cell packed, no thin), NOT a weighed seed: a lettuce seed is
// ~1 mg, and a single ε·DLI·fi law cannot represent the heterotrophic phase
// that turns seed reserves into cotyledons. So this level still absorbs that
// phase — but its TIMING no longer is: emergence day comes out of thermal time
// below. Refit whenever GROWTH_RGR, either ε, the ceiling bands,
// SPECIFIC_LEAF_AREA, PLUG_DRY_MATTER_FRACTION or the germination constants
// move (derivation.md).
const EMERGENCE_DRY_MASS_G = 0.013;

// ── Germination timing — thermal time, not a day count ───────────────
// The seed accumulates heat above a base temperature and fires at a fixed
// thermal-time total, so time-to-emergence is an OUTPUT of soil temperature.
// Above the inhibition temperature it goes thermo-dormant and accumulates
// nothing (domain/propagation.md). cert 2 — literature values for lettuce; no
// Décembre cohort has logged a sowing→emergence interval. Refinement trigger:
// one logged emergence date with its soil temperature.
const GERMINATION_BASE_TEMPERATURE_C = 4;
const GERMINATION_THERMAL_TIME_DEGREE_DAYS = 50;
const GERMINATION_INHIBITION_TEMPERATURE_C = 24;
// Default nursery soil temperature (°C) — midpoint of the 18-21 viable
// germination band in domain/propagation.md.
const NURSERY_SOIL_TEMPERATURE_C = 19.5;
const GROWTH_STEP_DAYS = 0.05;           // integration step (days)

// Senescence — CROWDING decline once the canopy is held closed too long.
// Mechanism: self-shading past over-closure drops lower/inner leaves below
// the light compensation point → they die → mass lost. Loose-leaf Salanova
// is picked leaf-by-leaf, so a dead leaf is real yield lost. Salt is NOT
// modeled (assumed driven to safe — nursery salt-flush protocol).
// UNCALIBRATED cert 1: the only decline datum (16→10 g, d28–d35) is
// crowding + salt + heat combined (~0.066/day) → an UPPER bound on the
// crowding-only rate, not a clean anchor. 0.04 held below that ceiling;
// makes the labor-routine tradeoff directional, not exact. See derivation.md
// senescence-past-closure.
const SENESCENCE_ONSET_DAYS = 1.7;       // days canopy held closed before crowding decline starts (retuned from 7 when closure moved to LAI 3)
const SENESCENCE_DECLINE_RATE = 0.04;    // fraction of mass lost per day past onset (crowding only; ≤ 0.066 combined ceiling)

// Canopy mass-loading geometry (fresh). volume cap = area × height × density.
const FOLIAGE_HEIGHT_M = 0.10;               // packed nursery
const FOLIAGE_DENSITY_KG_PER_M3 = 82;
const FIELD_CANOPY_HEIGHT_M = 0.18;          // spaced field
const FIELD_FOLIAGE_DENSITY_KG_PER_M3 = 55;
const TRAY_FRAME_M2 = 0.1525;                // 1020 tray frame (28 × 54 cm)

// ── Operation geometry ───────────────────────────────────────────────
const IN_TO_M = 0.0254;
const BED_WIDTH_M = 30 * IN_TO_M;            // 30 in bedtop = 0.762 m
const BED_LENGTH_M = 100 * 0.3048;           // 100 ft = 30.48 m
const BED_AREA_M2 = BED_WIDTH_M * BED_LENGTH_M;   // 23.23 m²/bed
const BED_COUNT = 4;
const PRICE_PER_KG = 25;                     // $/kg (Salanova wholesale)

// Field spacing options — rows across the bedtop × in-row spacing (inches).
// Density (heads/m²) = rows / (BED_WIDTH_M × inRowSpacing_m); see
// fieldDensityFromConfig. Total kg/bed is ~flat across configs (mass-loading
// dominates); density trades head size for head count.
const FIELD_SPACING_CONFIGS = [
  { key: '6r4',  label: '6 rangs × 4 po',  rows: 6, inRowInch: 4  },
  { key: '5r5',  label: '5 rangs × 5 po',  rows: 5, inRowInch: 5  },
  { key: '5r6',  label: '5 rangs × 6 po',  rows: 5, inRowInch: 6  },
  { key: '4r6',  label: '4 rangs × 6 po',  rows: 4, inRowInch: 6  },
  { key: '4r8',  label: '4 rangs × 8 po',  rows: 4, inRowInch: 8  },
  { key: '3r8',  label: '3 rangs × 8 po',  rows: 3, inRowInch: 8  },
  { key: '3r10', label: '3 rangs × 10 po', rows: 3, inRowInch: 10 },
];

// Labor routines — how often each bed is cut. fieldDays = bed occupancy;
// beds harvested per week = BED_COUNT ÷ (fieldDays / 7).
const LABOR_ROUTINES = [
  { key: '2wk', label: 'Aux 2 semaines', fieldDays: 14, cutDays: ['lundi', 'jeudi'] },
  { key: '3wk', label: 'Aux 3 semaines', fieldDays: 21, cutDays: ['mardi', 'jeudi'] },
  { key: '4wk', label: 'Aux 4 semaines', fieldDays: 28, cutDays: ['un jour'] },
];

// Nursery tray options — cells per 1020 transport tray.
const NURSERY_TRAY_CELLS = [50, 32, 18];

// ── Supplemental-lighting feasibility (Lumière page) ─────────────────
const LED_PPFD = 200;

const DLI_SUN_OUTDOOR_QC_ANNUAL = 30;
const GH_LIGHT_TRANSMISSION_DOUBLE_POLY = 0.65;
const DLI_SUN_GH_ANNUAL_AVG_QC = DLI_SUN_OUTDOOR_QC_ANNUAL * GH_LIGHT_TRANSMISSION_DOUBLE_POLY;

// Monthly clear-day-max outdoor DLI (mol/m²/j), Quebec ~46.8°N. Reference
// truth from domain.md; consumed only by the supplemental-LED table. Jan..Dec.
const CLEAR_DAY_MAXIMUM_DLI_BY_MONTH = [14, 24, 36, 48, 56, 60, 58, 50, 38, 26, 14, 12];

// Sky-condition attenuation as a fraction of the clear-day max. cert 2.
const SKY_CONDITION_FACTORS = [
  { key: 'sunny',  label: 'Ensoleillé',              factor: 1.00 },
  { key: 'partly', label: 'Partiellement nuageux',   factor: 0.60 },
  { key: 'cloudy', label: 'Couvert',                 factor: 0.25 },
];

// DLI target (mol/m²/j) the supplemental-LED table aims for. Doubles as the
// growth engine's effective DLI — the photosynthetic optimum where the
// old f_light plateau sat, so the light response folds into ε·DLI without a
// separate saturation multiplier (derivation.md carbon-balance-growth).
const DLI_TARGET = 25;

// Usable DLI ceiling by age from sowing (day 1 = sowing).
// Young tissue saturates low:
// cotyledons tipburn above ~10-12, the ceiling climbs as leaves harden. The
// nursery growth term drives on this ceiling directly — it is what the plug
// can use, not what the LED aims for (DLI_TARGET, the lighting-feasibility
// concern). Field ages drive on DLI_TARGET. wk1/wk2 are light/domain.md
// band-tops (8-10 / 12-14); wk3+ is 25, above the band, set from the measured
// July bench DLI 23.3 a hardened plug converted without tipburn — see
// learnings/nursery-dli-ceiling-by-stage.md.
const NURSERY_DLI_CEILING_BY_WEEK = [10, 14, 25]; // wk1 cotyledon · wk2 true-leaf · wk3+ plug
function nurseryLightCeiling(dayFromSowing) {
  const week = Math.floor((dayFromSowing - 1) / 7);
  return NURSERY_DLI_CEILING_BY_WEEK[Math.min(week, NURSERY_DLI_CEILING_BY_WEEK.length - 1)];
}

// Specific leaf area (m²/g dry) — DERIVED, not free: back-solved so the
// small-LAI limit of the interception curve equals exactly GROWTH_RGR·W at the
// day-10 open-canopy anchor, which on the sowing axis is age 9 → sowing-week 2
// (days 8-14), so the usable DLI there is the week-2 ceiling — not the full
// target the cotyledon-week plug cannot use. ≈ 0.019 m²/g.
const SPECIFIC_LEAF_AREA = GROWTH_RGR / (RADIATION_USE_EFFICIENCY * NURSERY_DLI_CEILING_BY_WEEK[1] * LEAF_AREA_EXTINCTION_K);

// Maximum healthy lamp photoperiod (h). Past this, lettuce risks chlorosis
// and the bolting clock runs; a day needing more lamp than this to reach
// DLI_TARGET cannot get there healthily.
const MAXIMUM_HEALTHY_PHOTOPERIOD_HOURS = 18;
