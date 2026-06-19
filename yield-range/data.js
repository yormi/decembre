// ─── yield-range/data.js — constants for the Salanova two-regime model ─
//
// Spec: yield-range/spec.md.
// Calibration anchor: yield-range/doc/yield-range-calibration-2026-spring.md.
//
// All constants live here; calc.js consumes them, model.js exposes the public API.

// logistic-growth-no-decay: cross-cultivar butterhead seedling RGR_max — conservative end
// of literature band. See yield-range/derivation.md logistic-growth-no-decay + learnings.md
// "Rejected: back-calculated RGR_max from cap-asymptote target".
const RGR_MAXIMUM_LETTUCE_NURSERY = 0.30;

const W_INIT_GERMINATED_G = 0.015;

const LED_PPFD = 200;

const DLI_SUN_OUTDOOR_QC_ANNUAL = 30;
const GH_LIGHT_TRANSMISSION_DOUBLE_POLY = 0.65;
const DLI_SUN_GH_ANNUAL_AVG_QC = DLI_SUN_OUTDOOR_QC_ANNUAL * GH_LIGHT_TRANSMISSION_DOUBLE_POLY;

// nursery-canopy-cap-by-plateau: nursery canopy mass-loading geometry.
const FOLIAGE_HEIGHT_M = 0.10;
const FOLIAGE_DENSITY_KG_PER_M3 = 82;

// field-canopy-cap-by-density: field canopy mass-loading geometry.
const FIELD_CANOPY_HEIGHT_M = 0.18;
const FIELD_FOLIAGE_DENSITY_KG_PER_M3 = 55;

// field-per-plant-dli-share: Salanova leaf-area per gram of head mass.
const LEAF_PROJECTED_AREA_M2_PER_G = 0.00035;

// nursery-canopy-cap-by-plateau: nursery cap by tray. Geometric mass-loading basis,
// area_per_cell × FOLIAGE_HEIGHT_M × FOLIAGE_DENSITY_KG_PER_M3 × 1000
// on 1020-tray frame 0.1525 m². Rationale + cert ladder in
// yield-range/derivation.md; rejected power-law extrapolation in
// yield-range/learnings.md.
const CANOPY_CAP_BY_PLATEAU = { 18: 69, 24: 52, 32: 39, 50: 25 };

// trajectory-output-shape: sanity ceiling on nurseryDays + fieldDays sum.
const TRAJECTORY_MAXIMUM_DAYS = 49;

const POTENTIAL_THRESHOLD = 0.95;

const F_LIGHT_BREAKPOINTS = [
  { x: 0,  y: 0   },
  { x: 4,  y: 0   },
  { x: 12, y: 1.0 },
  { x: 17, y: 1.0 },
  { x: 22, y: 0.7 },
  { x: 50, y: 0.7 },
];

const NURSERY_SPACING_PACKED = [
  { day: 0,  factor: 1.0  },
  { day: 14, factor: 1.0  },
  { day: 28, factor: 0.40 },
  { day: 99, factor: 0.40 },
];

const TRAY_FRAME_M2 = 0.1525;
