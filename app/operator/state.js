// Operator chrome — session state + greenhouse area constants.
//
// Loaded FIRST in the main <script> chain so every downstream consumer
// (page-recalc helpers, soil math, recipe math, supply orchestrator,
// per-crop logic.js partials) sees these bindings before its own textual
// position. Declarations use `let` (mutable session state) and `const`
// (greenhouse geometry that never changes at runtime).

const TOMATO_BED_AREA = 54.7;
const TOMATO_NUMBER_BEDS = 7;
const LETTUCE_BED_AREA = 30.4;
const LETTUCE_NUMBER_BEDS = 4.5;

// LETTUCE production fertigation (per 100 m² per week, dissolved in stock barrel).
// feSulfate 7.5 g/100 m² added 2026-04-29 as supplement for stretched cycles
// (stunted lettuce taking 4-6 weeks). Nursery Fe loading covers ~3 weeks of
// production demand; this fertigation adds maintenance Fe for the rest.
//   Math: target 1.5 ppm Fe in irrigation water at root zone.
//     Stock conc Fe = 1.5 / 0.02 (Dosatron 2%) = 75 ppm = 75 mg/L stock.
//     FeSO₄·7H₂O at 20% Fe → 75/0.20 = 375 mg/L stock = ~0.4 g/L stock (May).
//     Per 100 m² weekly stock vol varies 6-19 L by season; constant g per 100 m²
//     (matching K₂SO₄/MgSO₄ pattern) → stock conc varies 0.4-1.2 g/L FeSO₄.
//   Lockout caveat: at production bed pH 7.4, Fe²⁺ oxidizes to Fe³⁺ within hours
//     and precipitates as Fe(OH)₃. Effective root absorption ~10-20%. Per cycle
//     (6 weeks at 7.5 g/100 m²/week) = 45 g FeSO₄ = 9 g Fe applied per 100 m²,
//     of which ~1-2 g Fe absorbed by ~2500 plants = 0.4-0.8 mg Fe per plant.
//     Closes the ~0.5 mg/plant deficit between nursery loading and 6-week harvest.
//   Stability in stock: keep barrel sealed, mix Fe last (just before closing),
//     don't worry about ~10-20% loss to oxidation by end of week.
const LETTUCE = { mgSulfate: 467, kSulfate: 2996, feSulfate: 7.5 };

let currentCrop = 'tomato';
let currentStage = 'T1';
let currentPage = 'fertigation';
let currentVigor = 'low';
