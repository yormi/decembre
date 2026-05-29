// Operator chrome — page-recalc triggers + per-crop accessors + week/stage math.
//
// Reads session state declared in app/operator/state.js (currentCrop, currentStage)
// and the greenhouse area constants. Renderers in subproject app/logic.js files
// call these via classic-script function hoisting; inline onclick="recalc()" /
// onclick="autoStage()" reach them as window globals once the assembled script
// runs.

function recalc() {
  buildTensio();
  autoStage();
  buildSteps();
}

// Fixed parameters — kept as functions for consistency
// Dosatron ratio: 2% (D25 series, read on silver ring)
//
// Multipliers reverted to 1.0× on 2026-05-07 per first-principles audit:
// At 1.0×, fertigation T5 delivers 3.78 g K/m²/wk and 0.36 g Mg/m²/wk.
// Soil mass-flow at SME K 292 ppm × ~28 L/m²/wk × ~0.7 uptake fraction ≈
// 4.9 g K/m²/wk passive; combined with side-dress 0.23 g K/m²/wk and
// fertigation 1.0×, total K supply ≈ 8.9 g K/m²/wk = 148% of 6.0 g/m²/wk
// peak demand. Same logic for Mg: soil + 1.0× fertigation ≈ 1.26 g Mg/m²/wk
// = 147% of 0.86 g/m²/wk demand. Multipliers >1.0× ignored soil contribution
// and double-counted toward channel role; pushed total supply >180% of demand.
// Re-evaluate per element if next SSE shows soil contribution dropping (rare —
// soil bank is loading, not depleting).
function getRatio() { return 2; }
function getMultK() { return 1.0; }
function getMultMg() { return 1.0; }
function getTotalArea() { return (currentCrop === 'tomato' ? TOMATO_NUMBER_BEDS * TOMATO_BED_AREA : LETTUCE_NUMBER_BEDS * LETTUCE_BED_AREA); }
function getBedArea() { return currentCrop === 'tomato' ? TOMATO_BED_AREA : LETTUCE_BED_AREA; }

// 20-year average solar radiation by ISO week — Quebec City greenhouse,
// J/cm²/week (inside-greenhouse, glazing transmission applied).
// Source: 20-year Quebec City weekly averages (provided by Guillaume 2026-05).
// Cert 5 — these are the reference values; all weekly solar calcs derive from
// here. Validated by REQ-009 in spec.md.
//
// Weeks 19-52 not yet provided → fall back to SOLAR_BY_MONTH below until the
// array is extended.
const SOLAR_BY_WEEK = [
  null,    // week 0 (placeholder — ISO weeks start at 1)
  2695,    // week 1
  2940,    // week 2
  3430,    // week 3
  3920,    // week 4
  4655,    // week 5
  5390,    // week 6
  6125,    // week 7
  6860,    // week 8
  7595,    // week 9
  8330,    // week 10
  9065,    // week 11
  9660,    // week 12
  10290,   // week 13
  10780,   // week 14
  11270,   // week 15
  11760,   // week 16
  12250,   // week 17
  12740,   // week 18
];

// Monthly fallback — used for weeks 19-52 until the weekly array is extended.
// Calibrated against Agrométéo Québec data (kept for traceability):
//   Week of April 17-24, 2026: 11,989 J/cm²/week = 1,713/day
//   Same week 2025: 11,391 J/cm²/week = 1,627/day
const SOLAR_BY_MONTH = [
  600,   // Jan
  900,   // Feb
  1300,  // Mar
  1700,  // Apr
  2000,  // May
  2200,  // Jun
  2200,  // Jul
  1900,  // Aug
  1500,  // Sep
  1000,  // Oct
  650,   // Nov
  500,   // Dec
];

// Returns daily J/cm² for the current week. Prefers the 20-year weekly array
// (weeks 1-18 today), falls back to monthly average otherwise.
function getSolarRad() {
  const wk = getWeekNumber();
  const wkly = SOLAR_BY_WEEK[wk];
  if (wkly != null) return wkly / 7;
  const month = new Date().getMonth();
  return SOLAR_BY_MONTH[month];
}

// Auto-calculate current week number (ISO: week 1 contains Jan 4)
// and map to tomato growth stage
// Transplanted mid-December = week 51
// T1: weeks 51-2 (4 weeks), T2: 3-6, T3: 7-9, T4: 10-18, T5: 19+ (pleine production jusqu'à crop-out ~sem 28)
function getWeekNumber() {
  // ISO 8601 week number. Algorithm: jump to the Thursday of the current
  // ISO week, then count weeks since Jan 1 of that Thursday's year.
  // Why this shape: ISO weeks start Monday and the year-rollover week
  // (e.g. Dec 29 2025) belongs to week 1 of the *next* year. Using the
  // Thursday pivot handles both rules in one step.
  // Why not the previous formula: it added jan4.getDay() with Sun=0,
  // which silently shifted the result by one week whenever Jan 4 fell
  // on a Sunday (e.g. 2026 → returned 17 on Sat May 2 instead of 18).
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const dayNumber = d.getDay() || 7; // Sun=0 → treat as 7 so Mon..Sun maps to 1..7
  d.setDate(d.getDate() + 4 - dayNumber); // pivot to Thursday of current ISO week
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function getStageFromWeek(week) {
  if (week >= 51 || week <= 2) return 'T1';
  if (week <= 6) return 'T2';
  if (week <= 9) return 'T3';
  if (week <= 18) return 'T4';
  return 'T5'; // T5: weeks 19+ (runs to crop-out — variable end, no fixed week)
}

function autoStage() {
  if (currentCrop !== 'tomato') return;
  const week = getWeekNumber();
  currentStage = getStageFromWeek(week);
  document.querySelectorAll('[data-stage]').forEach(b => b.classList.toggle('active', b.dataset.stage === currentStage));
  document.getElementById('stage-auto-label').innerHTML =
    `Semaine <strong style="color:var(--text);">${week}</strong> → stade <strong style="color:var(--text);">${currentStage}</strong> (automatique)`;
}

// Nursery (semis laitue) — per-tray watering recipe.
// Fish dose: 13 mL/L (April 26, 2026 — bumped from 10 mL/L to push tray-finishing
// strategy). Reasoning: 10 mL/L delivers ~200 ppm N pulse but effective continuous
// N is much lower due to leaching → undersized for finished lettuce in trays.
// Target N production range is 150-200 ppm continuous; 13 mL/L moves us closer
// without crossing into salt-burn risk zone.
//
// EC MEASUREMENT STRATEGY (using Bluelab pen):
//   - Solution EC (in bucket): target 1.9-2.6 mS/cm. Verification step to catch
//     mixing errors. Keep this check while validating the 13 mL/L recipe over
//     a few cycles, then can be dropped once consistent.
//   - Substrate EC (in cell, 30-60 min after watering): target 1.5-2.5 mS/cm.
//     This is what plants actually experience. Should be slightly lower than
//     solution EC due to plant uptake and dilution in substrate.
//   - With top-watering (current practice), salts accumulate at cell BOTTOM
//     over time. Substrate EC trending up cycle-after-cycle = needs flush.
//   - Probe insertion: into wet (not saturated) substrate, push firmly,
//     wait 30-60s for stable reading. Average 2-3 cells per tray.
//
// Kelp stays at 2 mL/L — biostimulant, not primary nutrient source.
// Water: 1.25 L/tray = ~25 mL/cell for 50-cell trays.
//
// FeSO₄·7H₂O 15 mg/L = ~3 ppm Fe in fertigation solution (added 2026-04-29):
// Source: Alpha Chemicals (Amazon B007ODUI76), 20% Fe by mass. Organic-allowed
// per CAN/CGSB-32.311 (ferrous sulphate is on the permitted iron sources list).
//   Reason for adding here vs production foliar:
//   - Nursery substrate is acidic (peat-based, pH ~5.5-6.0) — Fe²⁺ stays
//     bioavailable to roots. Production beds at pH 7.4 lock out Fe immediately.
//   - Root uptake at acidic pH is 60-80% efficient vs ~10-15% for foliar
//     cuticle absorption. Same gram of Fe delivers 4-8× more usable Fe via
//     nursery fertigation than via production foliar spray.
//   - Loads seedlings with tissue Fe before transplant — plants enter
//     production with reserves, coast through 2-week lettuce cycle even with
//     locked-out beds.
//   - Eliminates lettuce production foliar spray entirely (no PHI, no residue
//     wash, no Cu cumulative concern, less labor).
//   Target: 3 ppm Fe in solution (standard hydroponic Fe range).
//   FeSO₄·7H₂O at 20% Fe → 3 / 0.20 = 15 mg product per L water.
//   For 75 trays × 1.25 L = 93.75 L → 1406 mg = 1.41 g of FeSO₄·7H₂O.
//   Stability: dissolved FeSO₄ oxidizes Fe²⁺ → Fe³⁺ over hours and precipitates
//   if pH drifts above ~5.5. Mix and apply same day; the team's water has low
//   alkalinity (Berger 39086, 25 ppm CaCO₃) and the FeSO₄ self-acidifies the
//   bucket to pH ~5, so no separate acid step needed.
//   EC contribution at 15 mg/L is negligible (~0.015 mS/cm) — EC targets unchanged.
function recalcNursery() {
  const element = document.getElementById('tray-count');
  if (!element) return;
  const trays = parseInt(element.value) || 1;
  const water = trays * 1.25;
  document.getElementById('out-water').textContent = water % 1 === 0 ? water : water.toFixed(1);
  document.getElementById('out-fish').textContent = Math.round(water * 13);
  document.getElementById('out-kelp').textContent = Math.round(water * 2);
  // FeSO₄·7H₂O dose: 15 mg/L → display in g (typical batch is 1-2 g)
  const feG = (water * 15) / 1000;
  document.getElementById('out-fe').textContent = feG.toFixed(2);
}
