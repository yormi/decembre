// Tomato — Phase 1 recipe-chemistry model (shared library).
//
// Owns the product catalog, channel-role splits, pH-response curves, foliar
// uptake curve, precipitation/incompatibility tables, predicted CE / tank-pH
// formulas, passive mass-flow, and the first-principles recipe builder.
// Consumed by the supply orchestrator (calculateNutritionSupply), the Block 7
// drift gauge (renderPhase1Comparison), and the fertigation/foliar logic.js
// renderers.
//
// Coverage scoped to TOMATO only. Lettuce demand model deferred per
// coherence-audit Finding 5 — computeRecipe('lettuce', ...) returns null.
//
// Cert legend: each numeric carries an inline cert 0-5. cert 3 = engineered
// estimate from product class / Sonneveld / Yara / Hoagland conventions
// where exact data isn't on hand. cert 4-5 = label-stated or lab-measured.

// REQ-010, REQ-019, REQ-022, REQ-023, REQ-029a, REQ-053, REQ-054
//
// Per-product schema:
//   mode: 'flux' | 'concentration'
//   ch:   'fertigation' | 'sidedress' | 'frontload' | 'foliar' | 'nursery'
//   base: { Element: massFraction }                — g element per g product
//   phClass: string | { El: string }                — soil channels only
//   ions: { cation/anion: massFraction }            — REQ-029a
//   chemistryTags: [...]                            — REQ-029a/c
//   organicAllowed: boolean                         — REQ-022
//   ecFactor: number                                — mS/cm per g/L (REQ-023)
//   solubilityCap_g_per_L: number                   — cold water (REQ-021)
//   phContribution: number                          — pH shift per g/L in clean water (REQ-053)
//   stablePhRange: [min, max]                       — chelates only (REQ-054)
//   maximumStableHours: number                          — REQ-032
//   cert: number                                    — overall cert
//
// Notes on shortcut data:
//   - ecFactor for sulfate salts ≈ 1.3 mS/cm per g/L (Sonneveld appendix). cert 3.
//   - phContribution: K2SO4/MgSO4 ≈ neutral (small drift); transition-metal
//     sulfates (FeSO4/MnSO4/ZnSO4/CuSO4) all acidify by hydrolysis ≈ −0.2 to
//     −0.5 pH/(g/L). cert 2-3. CaCl2 mildly acidic by Ca²⁺ hydrolysis
//     ≈ −0.05/(g/L). cert 2.
//   - solubilityCap at 5°C from CRC handbook order-of-magnitude. cert 3.
const PRODUCT = {
  // ─── Pure mineral salts (fertigation + foliar) ───
  'K2SO4': {
    mode: 'flux', ch: 'fertigation',
    base: { K: 0.415 },                   // 50% K₂O × 78/94.2 = 41.5%; cert 5 (label)
    phClass: { K: 'soluble-cation' },
    ions: { 'K+': 0.448, 'SO4-2': 0.551 },// 2× 39.1/174.3 + 96/174.3; cert 4
    chemistryTags: ['sulfate', 'free-K+'],
    organicAllowed: true,                  // CAN/CGSB-32.311 §4.1; cert 5
    ecFactor: 1.34,                        // Sonneveld; cert 3
    solubilityCap_g_per_L: 100,            // cold-water binding; cert 4
    phContribution: -0.05,                 // near-neutral salt; cert 2
    maximumStableHours: 168,                   // sulfate stable in clean water; cert 4
    cert: 4,
  },
  'MgSO4-7H2O': {
    mode: 'flux', ch: 'fertigation',
    base: { Mg: 0.0986 },                  // 24.3/246.5; cert 5
    phClass: { Mg: 'soluble-cation' },
    ions: { 'Mg2+': 0.099, 'SO4-2': 0.39 },// cert 4
    chemistryTags: ['sulfate', 'free-Mg2+'],
    organicAllowed: true,                  // permitted as Epsom salt; cert 5
    ecFactor: 0.95,                        // Sonneveld; cert 3
    solubilityCap_g_per_L: 700,            // very soluble; cert 5
    phContribution: -0.02,                 // near-neutral; cert 2
    maximumStableHours: 168,                   // cert 4
    cert: 4,
  },
  'FeSO4-7H2O': {
    mode: 'flux', ch: 'fertigation',
    base: { Fe: 0.20 },                    // label; cert 5
    phClass: { Fe: 'sulfate-metal' },      // soil application is the path that matters
    ions: { 'Fe2+': 0.20, 'SO4-2': 0.345 },// cert 4
    chemistryTags: ['sulfate', 'free-Fe2+', 'transition-metal-sulfate'],
    organicAllowed: true,                  // ferrous sulphate on permitted list; cert 5
    ecFactor: 1.0,                         // sulfate salt; cert 3
    solubilityCap_g_per_L: 290,            // CRC; cert 4
    phContribution: -0.30,                 // strong acidification by Fe²⁺ hydrolysis (linear approx; real curve flattens at high conc); cert 2
    maximumStableHours: 4,                     // air oxidation Fe²⁺→Fe³⁺ (REQ-032); cert 4
    cert: 4,
  },
  'MnSO4': {
    mode: 'flux', ch: 'foliar',
    base: { Mn: 0.315 },                   // label; cert 5
    phClass: { Mn: 'sulfate-metal' },
    ions: { 'Mn2+': 0.36, 'SO4-2': 0.64 }, // anhydrous; cert 4
    chemistryTags: ['sulfate', 'free-Mn2+', 'transition-metal-sulfate'],
    organicAllowed: true,                  // sulfate metals on permitted list (oligo); cert 4
    ecFactor: 1.2,                         // cert 3
    solubilityCap_g_per_L: 520,            // very soluble; cert 4
    phContribution: -0.25,                 // mild acidification; cert 3
    maximumStableHours: 168,                   // cert 3
    cert: 4,
  },
  'ZnSO4': {
    mode: 'flux', ch: 'foliar',
    base: { Zn: 0.355 },                   // label; cert 5
    phClass: { Zn: 'sulfate-metal' },
    ions: { 'Zn2+': 0.40, 'SO4-2': 0.60 },
    chemistryTags: ['sulfate', 'free-Zn2+', 'transition-metal-sulfate'],
    organicAllowed: true,                  // cert 4
    ecFactor: 1.2,                         // cert 3
    solubilityCap_g_per_L: 580,            // cert 4
    phContribution: -0.30,                 // cert 3
    maximumStableHours: 168,                   // cert 3
    cert: 4,
  },
  'CuSO4': {
    mode: 'flux', ch: 'foliar',
    base: { Cu: 0.25 },                    // CuSO₄·5H₂O label; cert 5
    phClass: { Cu: 'sulfate-metal' },
    ions: { 'Cu2+': 0.255, 'SO4-2': 0.385 },// pentahydrate; cert 4
    chemistryTags: ['sulfate', 'free-Cu2+', 'transition-metal-sulfate'],
    organicAllowed: true,                  // capped at 4 kg/ha/yr; cert 4
    ecFactor: 1.1,                         // cert 3
    solubilityCap_g_per_L: 320,            // cert 4
    phContribution: -0.35,                 // strongest hydrolysis acidifier; cert 3
    maximumStableHours: 168,                   // cert 3
    cert: 4,
  },
  'Solubore': {
    mode: 'flux', ch: 'foliar',
    base: { B: 0.205 },                    // label; cert 5
    phClass: { B: 'borate' },
    ions: { 'Na+': 0.164, 'B(OH)4-': 0.836 },// approximated as Na+ + borate ion; cert 3
    chemistryTags: ['borate', 'non-ionic-soil'],  // boric acid is non-ionic in soil; cert 4
    organicAllowed: true,                  // cert 4
    ecFactor: 0.7,                         // weakly ionizing; cert 3
    solubilityCap_g_per_L: 60,             // borax cold-water cap; cert 4
    phContribution: 0.10,                  // mild alkalinizer; cert 3
    maximumStableHours: 168,                   // cert 3
    cert: 3,
  },
  'NaMolybdate': {
    mode: 'flux', ch: 'foliar',
    base: { Mo: 0.396 },                   // label Na₂MoO₄·2H₂O; cert 5
    phClass: { Mo: 'molybdate' },
    ions: { 'Na+': 0.19, 'MoO4-2': 0.66 }, // cert 4
    chemistryTags: ['molybdate', 'free-Na+'],
    organicAllowed: true,                  // cert 3 — conventionally listed as oligo
    ecFactor: 0.8,                         // cert 3
    solubilityCap_g_per_L: 840,            // cert 4
    phContribution: 0.05,                  // slightly basic; cert 3
    maximumStableHours: 168,                   // cert 3
    cert: 3,
  },
  // CaCl2-2H2O entry removed 2026-05-06 (Spray B retired — Teris grade
  // Ecocert listing was unverified; BER prevention now via ventilation +
  // humidity, not foliar Ca). If a confirmed-organic CaCl₂ source is
  // sourced later, restore the entry with the same shape (mode:
  // 'concentration', ch: 'foliar', ions: Ca2+/Cl-, ecFactor 2.4, cert 4).

  // ─── Granular / organic side-dress and frontload products ───
  'Actisol-5-3-2': {
    mode: 'flux', ch: 'sidedress',
    base: { N: 0.05, P: 0.03 * 62/142, K: 0.02 * 78/94.2 },// label 5-3-2 elemental; cert 4
    phClass: { N: 'organic-N', P: 'organic-P', K: 'soluble-cation' },
    ions: { 'NH4+': 0.05, 'organic-matrix': 0.95 },// rough placeholder for chemistry table; cert 2
    chemistryTags: ['organic-matrix', 'live-microbial', 'solid-granular'],
    organicAllowed: true,                  // cert 3 — vérifier liste à jour
    ecFactor: 0.0,                         // not in tank; cert 5
    solubilityCap_g_per_L: 0,              // not water-mixed; cert 5
    phContribution: 0.0,                   // not in tank; cert 5
    maximumStableHours: Infinity,              // dry granular; cert 5
    cert: 3,
  },
  'FarinePlumes': {
    mode: 'flux', ch: 'sidedress',
    base: { N: 0.13 },                     // label 13-0-0; cert 4
    phClass: { N: 'organic-N' },
    ions: { 'NH4+': 0.13, 'organic-matrix': 0.87 },// rough; cert 2
    chemistryTags: ['organic-matrix', 'protein-hydrolysate', 'solid-granular'],
    organicAllowed: true,                  // animal byproduct; cert 4
    ecFactor: 0.0,                         // cert 5
    solubilityCap_g_per_L: 0,              // cert 5
    phContribution: 0.0,                   // cert 5
    maximumStableHours: Infinity,              // dry; cert 5
    cert: 4,
  },
  'AcadiePoissonHydrolyse': {
    mode: 'flux', ch: 'nursery',
    base: { N: 0.02, P: 0.04 * 62/142, K: 0.005 * 78/94.2 },// label 2-4-0.5; cert 4
    phClass: { N: 'organic-N', P: 'organic-P', K: 'soluble-cation' },
    ions: { 'NH4+': 0.02, 'organic-matrix': 0.98 },// liquid hydrolysate, mostly amino-N; cert 2
    chemistryTags: ['organic-matrix', 'protein-hydrolysate', 'live-microbial'],
    organicAllowed: true,                  // Acadie Ecocert-listed; cert 4
    ecFactor: 0.5,                         // mostly organic; some salt content; cert 2
    solubilityCap_g_per_L: 1000,           // miscible liquid; cert 4
    phContribution: -0.1,                  // mildly acidic; cert 2
    maximumStableHours: 24,                    // microbial degradation (REQ-032); cert 3
    cert: 3,
  },
  'AcadieAlguesLiquides': {
    mode: 'concentration', ch: 'nursery',
    base: { K: 0.01 },                     // ~1% K typical kelp; cert 2
    phClass: { K: 'soluble-cation' },
    ions: { 'K+': 0.01, 'organic-matrix': 0.99 },// cert 2
    chemistryTags: ['organic-matrix', 'biostimulant'],
    organicAllowed: true,                  // Acadie Ecocert; cert 4
    ecFactor: 0.3,                         // low salt; cert 2
    solubilityCap_g_per_L: 1000,           // miscible; cert 4
    phContribution: -0.05,                 // ~neutral; cert 2
    maximumStableHours: 24,                    // cert 3
    cert: 3,
  },
  'EZGRO-Ocean-15-1-1': {
    mode: 'flux', ch: 'nursery',
    base: { N: 0.15, P: 0.01 * 62/142, K: 0.01 * 78/94.2 },// label 15-1-1; cert 4
    phClass: { N: 'organic-N', P: 'organic-P', K: 'soluble-cation' },
    ions: { 'NH4+': 0.15, 'organic-matrix': 0.85 },// fish-derived liquid; cert 2
    chemistryTags: ['organic-matrix', 'protein-hydrolysate'],
    organicAllowed: true,                  // product label confirmed; cert 3
    ecFactor: 0.8,                         // higher salt than Acadie; cert 2
    solubilityCap_g_per_L: 1000,           // miscible; cert 4
    phContribution: -0.15,                 // acidic; cert 2
    maximumStableHours: 24,                    // cert 3
    cert: 3,
  },

  // ─── Soil amendment (not in any tank) ───
  'SoufreElementaire': {
    mode: 'flux', ch: 'sidedress',
    base: { S: 0.90 },                     // ~90% S typical; cert 4 (label varies)
    phClass: { S: 'soluble-cation' },      // not really applicable; placeholder
    ions: { 'H+': 0.0001, 'SO4-2': 0.001 },// post-oxidation tokens; cert 2
    chemistryTags: ['solid-granular', 'pH-amendment'],
    organicAllowed: true,                  // unrestricted; cert 5
    ecFactor: 0.0,                         // not in tank; cert 5
    solubilityCap_g_per_L: 0,              // insoluble in water; cert 5
    phContribution: 0.0,                   // not in tank; cert 5
    maximumStableHours: Infinity,              // cert 5
    cert: 4,
  },
};

// REQ-011, REQ-012 — Channel ownership per element.
// Tomato-only for Phase 1. Sums must hit 1.0 ± 0.05 per flux element.
// Cert 2-3 across the board: these splits are the model's editorial decisions
// about who owns delivery, not measurements. Source of opinion: the existing
// recipe shape (e.g., side-dress carries N, fertigation carries K/Mg, foliar
// carries micros) plus the organic-greenhouse pH-7.4 reality (Fe/Mn/Zn moved
// foliar; P delegated to passive but tagged decorative per audit Finding 7).
const CHANNEL_ROLE = {
  N:  { fertigation: 0.0, sidedress: 0.7, frontload: 0.3 },           // sidedress + nursery loading; cert 3
  P:  { sidedress: 1.0 },                                              // decorative at pH 7.4 (REQ-018); cert 3
  K:  { fertigation: 0.7, sidedress: 0.3 },                            // K₂SO₄ + Actisol K residual; cert 3
  Mg: { fertigation: 1.0 },                                            // MgSO₄ only; cert 4
  Ca: { passive: 1.0 },                                                // soil saturated; foliar is concentration-driven (REQ-015); cert 4
  S:  { fertigation: 1.0 },                                            // sulfate side-product; cert 3
  Fe: { foliar: 1.0 },                                                 // pH 7.4 lockout — foliar bypass; cert 4
  Mn: { foliar: 1.0 },                                                 // cert 4
  Zn: { foliar: 1.0 },                                                 // cert 4
  Cu: { foliar: 1.0 },                                                 // cert 4
  B:  { foliar: 0.5, passive: 0.5 },                                   // boric acid non-ionic, soil works; cert 3
  Mo: { foliar: 1.0 },                                                 // cert 3
};

// REQ-017 — pH-aware effective efficiency curves.
// Each function takes soilPh and returns a multiplier 0..1.
// Source: Cadre framework table (see nutrient-model-reference.md §3.4) +
// Marschner soil-chemistry curves. Cert 3-4.
const PH_RESPONSE = {
  // Cation exchange + soluble salt: K, Mg, Ca all flat across agronomic pH.
  // Tiny drop above 7.5 reflects competition with Ca-saturation. cert 4
  'soluble-cation': function(ph) {
    if (ph <= 7.0) return 1.0;
    if (ph >= 8.0) return 0.85;
    return 1.0 - 0.15 * (ph - 7.0);
  },
  // Sulfate-form transition metals (Fe, Mn, Zn, Cu): sigmoid drop.
  // 1.0 at pH 6.0; 0.50 at pH 7.0; 0.10 at pH 7.4; 0.05 at pH 7.8+. cert 4
  'sulfate-metal': function(ph) {
    if (ph <= 6.0) return 1.0;
    if (ph >= 7.8) return 0.05;
    // Logistic-shaped piecewise
    if (ph <= 7.0) return 1.0 - 0.50 * (ph - 6.0);
    if (ph <= 7.4) return 0.50 - 1.00 * (ph - 7.0);    // 0.50 → 0.10
    return 0.10 - 0.125 * (ph - 7.4);                   // 0.10 → 0.05
  },
  // EDTA: stable to pH ~6.5 then collapses. cert 4
  'chelate-edta': function(ph) {
    if (ph <= 6.5) return 1.0;
    if (ph >= 7.5) return 0.10;
    return 1.0 - 0.90 * (ph - 6.5);
  },
  // EDDHA: flat across full agronomic pH. cert 5
  'chelate-eddha': function(ph) {
    return (ph >= 4.0 && ph <= 9.0) ? 1.0 : 0.5;
  },
  // DTPA: stable to ~7.5. cert 4
  'chelate-dtpa': function(ph) {
    if (ph <= 7.5) return 1.0;
    if (ph >= 8.5) return 0.20;
    return 1.0 - 0.80 * (ph - 7.5);
  },
  // Organic N mineralization: temperature-dependent, pH less so but mild
  // suppression > 7.5 from Ca saturation slowing microbes. cert 3
  'organic-N': function(ph) {
    if (ph <= 7.5) return 1.0;
    if (ph >= 8.5) return 0.7;
    return 1.0 - 0.30 * (ph - 7.5);
  },
  // Organic P mineralization × Ca-P precipitation. cert 4 (matches Cadre 5-15%).
  'organic-P': function(ph) {
    if (ph <= 6.0) return 1.0;
    if (ph >= 7.4) return 0.10;
    return 1.0 - 0.643 * (ph - 6.0);
  },
  // Borate: flat, slight rise in availability with pH up to 8 (boric acid → B(OH)4⁻). cert 3
  'borate': function(ph) {
    return 1.0;
  },
  // Molybdate: prefers alkaline (anion). cert 4
  'molybdate': function(ph) {
    if (ph <= 5.5) return 0.30;
    if (ph >= 7.0) return 1.0;
    return 0.30 + 0.467 * (ph - 5.5);
  },
  // Foliar bypass — soil pH irrelevant (different curve = foliarPhResponse for spray pH). cert 5
  'foliar-bypass': function(ph) {
    return 1.0;
  },
};

// REQ-055 — Foliar uptake pH multiplier (cuticle absorption window).
// Curve from REQ-055 table; linear interpolation between anchors. cert 3.
function foliarPhResponse(ph) {
  if (ph <= 4.0) return 0.5;
  if (ph <= 4.5) return 0.5 + (0.7 - 0.5) * (ph - 4.0) / 0.5;
  if (ph <= 5.0) return 0.7 + (0.9 - 0.7) * (ph - 4.5) / 0.5;
  if (ph <= 5.5) return 0.9 + (1.0 - 0.9) * (ph - 5.0) / 0.5;
  if (ph <= 6.0) return 1.0;
  if (ph <= 6.5) return 1.0 + (0.95 - 1.0) * (ph - 6.0) / 0.5;
  if (ph <= 7.0) return 0.95 + (0.85 - 0.95) * (ph - 6.5) / 0.5;
  if (ph <= 7.5) return 0.85 + (0.70 - 0.85) * (ph - 7.0) / 0.5;
  if (ph <= 8.0) return 0.70 + (0.50 - 0.70) * (ph - 7.5) / 0.5;
  return 0.5;
}

// REQ-029 — Cation × anion precipitation pairs.
// Threshold = combined ion mass (g/L) above which gypsum/phosphate/etc forms.
// Note: most pairs we list here involve PO4-3 and OH- which don't appear in
// our active product `ions` decls — they're documented as guidance for future
// products that introduce them. Coverage check (REQ-029b) only enumerates
// pairs from product-declared ions.
const KSP_PAIRS = [
  { cation: 'Ca2+', anion: 'PO4-3', threshold_g_per_L_combined: 0.001, cert: 5,
    note: 'precipitates near zero; never co-mix Ca + foliar P' },
  { cation: 'Ca2+', anion: 'SO4-2', threshold_g_per_L_combined: 2.4, cert: 4,
    note: 'gypsum at high concentration; relevant Spray A × Spray B if mixed' },
  { cation: 'Mg2+', anion: 'PO4-3', threshold_g_per_L_combined: 0.5, cert: 3,
    note: 'rare in our recipes' },
  { cation: 'Fe2+', anion: 'PO4-3', threshold_g_per_L_combined: 0.01, cert: 4,
    note: 'low Ksp → most fertigated FeSO₄ + P → FePO₄' },
  { cation: 'Fe2+', anion: 'OH-', threshold_function_of_pH: function(ph) { return ph > 6.5 ? 0 : Infinity; }, cert: 4,
    note: 'Fe(OH)₂ above pH 6.5; stock barrel pH drift, foliar tank pH' },
  { cation: 'Mn2+', anion: 'OH-', threshold_function_of_pH: function(ph) { return ph > 8.0 ? 0 : Infinity; }, cert: 3,
    note: 'Mn(OH)₂ above pH 8; rare in tanks, relevant in soil' },
];

// REQ-029b — Pairs from product-declared ions explicitly known not to
// precipitate in our tank conditions. Coverage requirement: every cation ×
// anion combination from the union of PRODUCT[*].ions must appear here OR
// in KSP_PAIRS. Generated from the cartesian product enumerated below.
//
// Cations declared: K+, Mg2+, Fe2+, Mn2+, Zn2+, Cu2+, Ca2+, Na+, NH4+, H+
// Anions declared:  SO4-2, Cl-, B(OH)4-, MoO4-2, organic-matrix
const KSP_SAFE = [
  // K+ × all
  { cation: 'K+', anion: 'SO4-2', reason: 'highly soluble (K₂SO₄ to ~120 g/L)' },
  { cation: 'K+', anion: 'Cl-', reason: 'KCl highly soluble' },
  { cation: 'K+', anion: 'B(OH)4-', reason: 'K-borate soluble' },
  { cation: 'K+', anion: 'MoO4-2', reason: 'K-molybdate soluble' },
  { cation: 'K+', anion: 'organic-matrix', reason: 'organic carrier, no co-dissolution mineral chemistry' },
  // Mg2+ × all
  { cation: 'Mg2+', anion: 'SO4-2', reason: 'MgSO₄ soluble to ~700 g/L' },
  { cation: 'Mg2+', anion: 'Cl-', reason: 'MgCl₂ very soluble' },
  { cation: 'Mg2+', anion: 'B(OH)4-', reason: 'Mg-borate soluble at low conc' },
  { cation: 'Mg2+', anion: 'MoO4-2', reason: 'Mg-molybdate soluble' },
  { cation: 'Mg2+', anion: 'organic-matrix', reason: 'organic carrier inert' },
  // Fe2+ × all (excluding OH-/PO4-3 which are in KSP_PAIRS but not declared in ions)
  { cation: 'Fe2+', anion: 'SO4-2', reason: 'FeSO₄ soluble to ~290 g/L; Fe²⁺ oxidation is the failure mode (REQ-032), not precipitation' },
  { cation: 'Fe2+', anion: 'Cl-', reason: 'FeCl₂ soluble' },
  { cation: 'Fe2+', anion: 'B(OH)4-', reason: 'low risk at our concs' },
  { cation: 'Fe2+', anion: 'MoO4-2', reason: 'low risk at trace Mo' },
  { cation: 'Fe2+', anion: 'organic-matrix', reason: 'organic carrier inert' },
  // Mn2+ × all
  { cation: 'Mn2+', anion: 'SO4-2', reason: 'MnSO₄ soluble to ~520 g/L' },
  { cation: 'Mn2+', anion: 'Cl-', reason: 'MnCl₂ soluble' },
  { cation: 'Mn2+', anion: 'B(OH)4-', reason: 'low risk at our concs' },
  { cation: 'Mn2+', anion: 'MoO4-2', reason: 'low risk at trace Mo' },
  { cation: 'Mn2+', anion: 'organic-matrix', reason: 'inert' },
  // Zn2+ × all
  { cation: 'Zn2+', anion: 'SO4-2', reason: 'ZnSO₄ soluble to ~580 g/L' },
  { cation: 'Zn2+', anion: 'Cl-', reason: 'ZnCl₂ very soluble' },
  { cation: 'Zn2+', anion: 'B(OH)4-', reason: 'low risk' },
  { cation: 'Zn2+', anion: 'MoO4-2', reason: 'low risk' },
  { cation: 'Zn2+', anion: 'organic-matrix', reason: 'inert' },
  // Cu2+ × all (KSP_PAIRS handles Cu-protein-gel via tags, not Ksp)
  { cation: 'Cu2+', anion: 'SO4-2', reason: 'CuSO₄ soluble to ~320 g/L' },
  { cation: 'Cu2+', anion: 'Cl-', reason: 'CuCl₂ soluble' },
  { cation: 'Cu2+', anion: 'B(OH)4-', reason: 'low risk' },
  { cation: 'Cu2+', anion: 'MoO4-2', reason: 'low risk' },
  { cation: 'Cu2+', anion: 'organic-matrix', reason: 'inert; Cu-protein gel handled by TAG_INCOMPATIBILITIES' },
  // Ca2+ × all (Ca × SO4-2 listed in KSP_PAIRS; Ca × PO4-3 not in our product ions)
  { cation: 'Ca2+', anion: 'Cl-', reason: 'CaCl₂ soluble to ~740 g/L' },
  { cation: 'Ca2+', anion: 'B(OH)4-', reason: 'low risk at trace B' },
  { cation: 'Ca2+', anion: 'MoO4-2', reason: 'CaMoO₄ low solubility but trace Mo levels keep us safe' },
  { cation: 'Ca2+', anion: 'organic-matrix', reason: 'inert' },
  // (Ca2+ × SO4-2 in KSP_PAIRS — gypsum)
  // Na+ × all
  { cation: 'Na+', anion: 'SO4-2', reason: 'Na₂SO₄ soluble' },
  { cation: 'Na+', anion: 'Cl-', reason: 'NaCl soluble' },
  { cation: 'Na+', anion: 'B(OH)4-', reason: 'Na-borate (Solubore source) soluble' },
  { cation: 'Na+', anion: 'MoO4-2', reason: 'Na-molybdate soluble' },
  { cation: 'Na+', anion: 'organic-matrix', reason: 'inert' },
  // NH4+ × all
  { cation: 'NH4+', anion: 'SO4-2', reason: '(NH₄)₂SO₄ soluble' },
  { cation: 'NH4+', anion: 'Cl-', reason: 'NH₄Cl soluble' },
  { cation: 'NH4+', anion: 'B(OH)4-', reason: 'soluble' },
  { cation: 'NH4+', anion: 'MoO4-2', reason: 'soluble' },
  { cation: 'NH4+', anion: 'organic-matrix', reason: 'inert (organic-N carriers)' },
  // H+ × all (only from elemental sulfur token; trace)
  { cation: 'H+', anion: 'SO4-2', reason: 'H₂SO₄ fully dissociated' },
  { cation: 'H+', anion: 'Cl-', reason: 'HCl fully dissociated' },
  { cation: 'H+', anion: 'B(OH)4-', reason: 'boric acid stable' },
  { cation: 'H+', anion: 'MoO4-2', reason: 'molybdic acid stable at trace' },
  { cation: 'H+', anion: 'organic-matrix', reason: 'inert' },
];

// REQ-029c — Tag interaction rules.
// Forbidden combinations + reasons (cert per row).
const TAG_INCOMPATIBILITIES = [
  { tags: ['free-Cu2+', 'protein-hydrolysate'], severity: 'forbidden',
    reason: 'Cu-protein gel — bouchage de buse', cert: 4 },
  { tags: ['chelate-Fe', 'free-Cu2+'], severity: 'forbidden',
    reason: 'ligand swap — Fe falls out of chelate', cert: 4 },
  { tags: ['chelate-Fe', 'chelate-Cu'], severity: 'caution',
    reason: 'ligand competition between chelates; separate barrels preferred', cert: 3 },
  { tags: ['live-microbial', 'transition-metal-sulfate'], severity: 'caution',
    reason: 'high metal sulfate concentration may suppress microbes', cert: 2 },
];

// REQ-029c — Tags with no known incompatibility, classified as inert.
// Every distinct tag in any PRODUCT[*].chemistryTags must appear here or in
// TAG_INCOMPATIBILITIES.
const TAGS_INERT = {
  'sulfate':                   'no known interaction with anions in our recipes; gypsum/Fe-PO₄ etc are pair-level (Ksp) not tag-level',
  'chloride':                  'soluble with all our cations',
  'free-K+':                   'no precipitation pairs in our recipes',
  'free-Mg2+':                 'no precipitation pairs in our recipes',
  'free-Fe2+':                 'oxidation handled by maximumStableHours; precipitation by Ksp pairs',
  'free-Mn2+':                 'no precipitation pairs in our active recipes',
  'free-Zn2+':                 'no precipitation pairs in our active recipes',
  'free-Cu2+':                 'precipitation pairs handled by TAG_INCOMPATIBILITIES (Cu-protein) and separate-spray rules',
  'free-Ca2+':                 'Ca×SO₄ handled by Ksp; Ca×Cl is soluble',
  'free-Na+':                  'soluble with everything',
  'transition-metal-sulfate':  'class label; per-metal interactions covered by sulfate-metal phClass and Ksp',
  'borate':                    'B(OH)₄⁻ fully soluble; non-ionic in soil',
  'non-ionic-soil':            'soil pH does not gate availability',
  'molybdate':                 'soluble; trace amounts keep Ksp safe',
  'organic-matrix':            'organic carrier; not in mineral Ksp chemistry',
  'protein-hydrolysate':       'incompatibility handled by TAG_INCOMPATIBILITIES (Cu)',
  'live-microbial':            'caution combo with high metal sulfates handled in TAG_INCOMPATIBILITIES',
  'biostimulant':              'no known mineral interaction',
  'solid-granular':            'not in tank; bypasses all tank chemistry checks',
  'pH-amendment':              'used standalone in soil; no tank chemistry',
};

// ─── INCOMPATIBLE_RECIPES — recipes that must never be mixed in the same tank ──
//
// REQ-030. Audit-trail for known incompatibilities. Empty in current state
// because Spray B (CaCl₂) was retired 2026-05-06 — that was the only
// incompatibility in active use (CaCl₂ + Fe-EDDHA → Fe-Cl precipitation /
// ligand swap; CaCl₂ + Spray A sulfates → CaSO₄ gypsum at high conc).
//
// If a future recipe is added that conflicts with an existing one, append
// here with the failure mode. The verifier (REQ-030) asserts this constant
// is declared and that each entry has {recipes: [≥2], reason: string}.
// Day-to-day enforcement is by the team reading this list.
const INCOMPATIBLE_RECIPES = [
  // Historical example (kept as documentation, commented out — does not count
  // toward verifier coverage since Spray B is retired):
  // {
  //   recipes: ['STORED_RECIPE.tomato.foliaire.A', 'STORED_RECIPE.tomato.foliaire.B (retired)'],
  //   reason: 'Fe-EDDHA in Spray A + CaCl₂ in Spray B → Ca-Fe precipitation, Fe-Cl insoluble compounds. Spray B retired 2026-05-06.',
  // },
];

// ─── MIX_ORDER — order to add products to each multi-product recipe ─────
//
// REQ-031. Order matters for two reasons:
//   1. Solubility: K₂SO₄ has low cold solubility (~120 g/L). Add first to
//      hot water; adding it after other salts can drop tank pH or cause
//      precipitation of K-containing complexes.
//   2. Stability: FeSO₄ oxidizes quickly in air (Fe²⁺ → Fe³⁺ within hours
//      — see PRODUCT['FeSO4-7H2O'].maximumStableHours = 4). Add LAST, just
//      before sealing the spray container.
//
// Verifier schema (REQ-031): array of { recipe: string, order: [productName, ...] }.
// Product names match PRODUCT keys.
const MIX_ORDER = [
  { recipe: 'fertigation.tomato',
    order: ['K2SO4', 'MgSO4-7H2O'] },
  // Spray A (Mn/Zn/B/Cu/Mo/Fe — no surfactant since 2026-05-06 yucca drop).
  // FeSO₄-7H₂O added last (oxidation) per maximumStableHours=4 on the product.
  { recipe: 'foliar.tomato.A',
    order: ['MnSO4', 'ZnSO4', 'Solubore', 'CuSO4', 'NaMolybdate', 'FeSO4-7H2O'] },
  // Lettuce production fertigation (K + Mg + Fe maintenance).
  { recipe: 'fertigation.lettuce',
    order: ['K2SO4', 'MgSO4-7H2O', 'FeSO4-7H2O'] },
];

// REQ-017, REQ-018, REQ-055 — Effective efficiency for a (product, element).
// Returns 0..1 representing fraction of label-stated mass that reaches plant.
//
// Routing rule (REQ-018):
//   - Soil/fertigation channels: apply PH_RESPONSE[phClass](soilPh).
//     Soil pH gates rhizosphere availability via Ksp / chelate stability.
//   - Foliar channel: SKIP soil-pH penalty entirely. Cuticle uptake is
//     governed by the spray tank pH (foliarPhResponse) + coverage factor.
//     Mn/Zn/Cu sulfates carry phClass:'sulfate-metal' for documentation
//     consistency, but in the foliar context that curve is irrelevant —
//     soil pH never touches the leaf surface.
//   - Verifier note: REQ-018 should pass sprayPh (or rely on the foliar
//     branch below) when checking foliar products. Calling
//     effectiveEfficiency('MnSO4','Mn', soilPh) without a foliar context would
//     STILL bypass soil-pH for foliar products by design here.
function effectiveEfficiency(productName, element, soilPh, sprayPh) {
  if (sprayPh === undefined) sprayPh = null;
  const p = PRODUCT[productName];
  if (!p || !p.base || !p.base[element]) return 0;
  const cls = (typeof p.phClass === 'string') ? p.phClass : (p.phClass || {})[element];
  const base = 1.0;                                  // efficiency, not mass fraction (mass fraction handled by p.base[element])
  let phMod = 1.0;
  let fieldMod = 1.0;
  if (p.ch === 'foliar') {
    // Foliar: soil pH irrelevant by definition (cuticle uptake bypasses
    // rhizosphere). Use foliarPhResponse(tankPh) + coverage factor only.
    fieldMod *= foliarPhResponse(sprayPh != null ? sprayPh : 5.5);
    fieldMod *= 0.30;                                // coverage factor — fixed 0.30 (no yucca per 2026-05-05 decision)
  } else {
    // Soil/fertigation: apply rhizosphere pH curve.
    if (cls && PH_RESPONSE[cls]) phMod = PH_RESPONSE[cls](soilPh);
  }
  return base * phMod * fieldMod;
}

// REQ-024 — Predicted irrigation CE at the dripper.
// recipe = { productName: gPerL_in_tank }; dilution = Dosatron ratio (e.g. 0.02).
// Returns mS/cm at 20°C reference.
function predictedCE(recipe, dilution, waterCE) {
  if (dilution === undefined) dilution = 1.0;
  if (waterCE === undefined) waterCE = 0.10;
  let CE = waterCE;
  for (const name in recipe) {
    if (!Object.prototype.hasOwnProperty.call(recipe, name)) continue;
    const p = PRODUCT[name];
    if (!p) continue;
    const gPerL = recipe[name];
    CE += (p.ecFactor || 0) * gPerL * dilution;
  }
  return CE;
}

// REQ-053 — Predicted tank pH (linear sum of phContributions × g/L).
// Rough first-pass; assumes no buffering. cert 2-3.
function predictedTankPh(recipe, waterPh) {
  if (waterPh === undefined) waterPh = 7.0;
  let pH = waterPh;
  for (const name in recipe) {
    if (!Object.prototype.hasOwnProperty.call(recipe, name)) continue;
    const p = PRODUCT[name];
    if (!p) continue;
    pH += (p.phContribution || 0) * recipe[name];
  }
  return Math.max(2.0, Math.min(12.0, pH));
}

// REQ-020 — Passive supply mass-flow (SME ppm × transpiration L/m²/wk).
// Apply LOCKOUT_GATE for P/Mn/Zn at pH > 6.8: cap at 100 mg/m²/wk for P,
// at SME-derived value (which is ~0 for Mn/Zn anyway). cert 4.
function passiveSupplyMassFlow(crop, element, week) {
  const ppm = (crop === 'tomato')
    ? smePpmForSupply('tomato', element)
    : (SME_LETTUCE_PPM && SME_LETTUCE_PPM[element]) || 0;
  const flowL = weeklyMassFlowL();
  let mass = ppm * flowL;                            // mg/m²/wk
  // Lockout gate: when pH > 6.8, P passive supply capped at 100 mg/m²/wk
  // even if Mehlich-3 bank suggests more. Mn/Zn already ~0 in SME so cap is moot.
  // Source: REQ-020 + audit Finding 7 (pH 7.4 effectively gates Ca-P precip).
  const phLocked = true;                              // Phase 1 assumption — wired to checkbox in next phase
  if (phLocked && (element === 'P' || element === 'Mn' || element === 'Zn')) {
    mass = Math.min(mass, 100);
  }
  return mass;
}

// Compute the recipe a channel SHOULD use, from first principles.
// For each element where CHANNEL_ROLE assigns this channel a fraction:
//   target_mass = (demand[stage,element] − passive[element]) × CHANNEL_ROLE[element][channel]
//   product_mass = target_mass / (efficiency × analysis)
// Output: { productName: gramsPerWeekPerArea }
//
// Phase 1 scope: tomato only. computeRecipe('lettuce', ...) → null until
// LETTUCE_BIOMASS_DEMAND lands (audit Finding 5).
// TODO: lettuce demand model
function computeRecipe(crop, stage, channel) {
  if (crop !== 'tomato') return null;
  const bio = BIOMASS_DEMAND[stage] || {};
  const fruitYield = 1.5;                             // target kg/m²/wk; Phase 1 fixed
  const demand = {};
  Object.keys(TOMATO_FRUIT_EXPORT).forEach(function(element) {
    demand[element] = (TOMATO_FRUIT_EXPORT[element].g * fruitYield * 1000) + (bio[element] || 0);
  });
  const soilPh = 7.4;                                 // Phase 1 assumption
  const sprayPh = 5.0;                                // typical sulfate-heavy Spray A
  const out = {};

  // Pick representative product per channel × element
  // Mapping (cert 3-4 — editorial choice based on the existing recipe):
  //   fertigation  K → K2SO4
  //   fertigation  Mg → MgSO4-7H2O
  //   sidedress    N → split between Actisol-5-3-2 and FarinePlumes (~40/60 by N mass)
  //   sidedress    P → Actisol-5-3-2
  //   sidedress    K → Actisol-5-3-2
  //   foliar       Mn → MnSO4
  //   foliar       Zn → ZnSO4
  //   foliar       Cu → CuSO4
  //   foliar       B → Solubore
  //   foliar       Mo → NaMolybdate
  //   foliar       Fe → FeSO4-7H2O (bridge while Iron DL pending)
  //   foliar       Ca → CaCl2-2H2O (concentration mode — not flux-computed)
  const mapping = {
    fertigation: { K: ['K2SO4'], Mg: ['MgSO4-7H2O'] },
    sidedress: {
      N: ['Actisol-5-3-2', 'FarinePlumes'],
      P: ['Actisol-5-3-2'],
      K: ['Actisol-5-3-2'],
    },
    foliar: {
      Mn: ['MnSO4'], Zn: ['ZnSO4'], Cu: ['CuSO4'],
      B:  ['Solubore'], Mo: ['NaMolybdate'], Fe: ['FeSO4-7H2O'],
    },
  };
  const channelMap = mapping[channel] || {};
  const area = TOMATO_NUMBER_BEDS * TOMATO_BED_AREA;     // 382.9 m²

  Object.keys(channelMap).forEach(function(element) {
    const role = (CHANNEL_ROLE[element] || {})[channel] || 0;
    if (role <= 0) return;
    // Subtract passive supply for elements where passive is in CHANNEL_ROLE
    const passiveRole = (CHANNEL_ROLE[element] || {}).passive || 0;
    const passive_mg_m2 = passiveRole > 0 ? passiveSupplyMassFlow('tomato', element) * passiveRole : 0;
    const need_mg_m2 = Math.max(0, demand[element] - passive_mg_m2) * role;
    if (need_mg_m2 <= 0) return;
    const products = channelMap[element];
    // Split evenly across the listed products by mass fraction
    products.forEach(function(productName) {
      const p = PRODUCT[productName];
      if (!p) return;
      const analysis = p.base[element] || 0;
      if (analysis <= 0) return;
      // Sidedress: factor in mineralization efficiency (SIDEDRESS_MINIMUM_EFFICIENCY)
      // Foliar: foliarPhResponse + 30% coverage already in effectiveEfficiency
      // Fertigation: pH response on phClass
      let efficiency;
      if (channel === 'sidedress') {
        const minimumEfficiencyKey = (productName === 'Actisol-5-3-2')
          ? (element === 'N' ? 'Actisol_N' : element === 'P' ? 'Actisol_P' : 'Actisol_K')
          : 'FarinePlumes_N';
        efficiency = (SIDEDRESS_MINIMUM_EFFICIENCY[minimumEfficiencyKey] || 0.5);     // mineralization efficiency; pH lockout for P captured separately
        if (channel === 'sidedress' && element === 'P') {
          // REQ-018: at pH 7.4 P is decorative — multiply by Cadre 0.10
          efficiency *= PH_RESPONSE['organic-P'](7.4);
        }
      } else if (channel === 'foliar') {
        efficiency = effectiveEfficiency(productName, element, soilPh, sprayPh);
        // effectiveEfficiency returns 0..1 already including coverage; that's the multiplier
        // applied to mass arriving at leaf. Divide need by it to get applied mass.
        if (efficiency <= 0) efficiency = 0.30;                     // floor — don't divide by 0
      } else if (channel === 'fertigation') {
        const cls = (typeof p.phClass === 'string') ? p.phClass : (p.phClass || {})[element];
        efficiency = cls && PH_RESPONSE[cls] ? PH_RESPONSE[cls](soilPh) : 1.0;
      } else {
        efficiency = 1.0;
      }
      // mass per m²/wk → grams across whole tomato area / share
      const share = 1.0 / products.length;
      const mass_mg_m2_wk = (need_mg_m2 * share) / Math.max(efficiency, 0.001) / analysis;
      // Convert to per-area total: for fertigation/foliar that's grams over the
      // whole tomato area; for sidedress it's grams per planche.
      let g_total;
      if (channel === 'sidedress') {
        g_total = mass_mg_m2_wk * SIDEDRESS_AREA_PER_PLANCHE / 1000;  // g/planche/wk
      } else {
        g_total = mass_mg_m2_wk * area / 1000;        // g/wk over tomato area
      }
      out[productName] = (out[productName] || 0) + g_total;
    });
  });
  return out;
}

// ─── Coverage / sanity checks for REQ-029a/b/c ───
// These run at script load time and console.warn if any product in PRODUCT
// has missing ions/tags, or any ion pair / tag is unclassified.
(function validatePhase1ModelCoverage() {
  try {
    const cations = new Set();
    const anions = new Set();
    const tags = new Set();
    const cationList = ['K+', 'Mg2+', 'Fe2+', 'Mn2+', 'Zn2+', 'Cu2+', 'Ca2+', 'Na+', 'NH4+', 'H+'];
    const anionList = ['SO4-2', 'Cl-', 'B(OH)4-', 'MoO4-2', 'organic-matrix', 'PO4-3', 'OH-', 'NO3-'];
    Object.keys(PRODUCT).forEach(function(name) {
      const p = PRODUCT[name];
      if (!p.ions || Object.keys(p.ions).length === 0) console.warn('[Phase1] missing ions:', name);
      if (!p.chemistryTags || p.chemistryTags.length === 0) console.warn('[Phase1] missing tags:', name);
      Object.keys(p.ions || {}).forEach(function(ion) {
        if (cationList.indexOf(ion) >= 0) cations.add(ion);
        else if (anionList.indexOf(ion) >= 0) anions.add(ion);
      });
      (p.chemistryTags || []).forEach(function(t) { tags.add(t); });
    });
    // REQ-029b: every cation × anion pair from declared ions must appear in KSP_PAIRS or KSP_SAFE
    const safeKey = function(c, a) { return c + '|' + a; };
    const safeSet = new Set();
    KSP_SAFE.forEach(function(s) { safeSet.add(safeKey(s.cation, s.anion)); });
    KSP_PAIRS.forEach(function(s) { safeSet.add(safeKey(s.cation, s.anion)); });
    cations.forEach(function(c) {
      anions.forEach(function(a) {
        if (!safeSet.has(safeKey(c, a))) console.warn('[Phase1] unclassified pair:', c, '×', a);
      });
    });
    // REQ-029c: every tag must appear in TAG_INCOMPATIBILITIES or TAGS_INERT
    const tagsInIncomp = new Set();
    TAG_INCOMPATIBILITIES.forEach(function(r) { (r.tags || []).forEach(function(t) { tagsInIncomp.add(t); }); });
    tags.forEach(function(t) {
      if (!tagsInIncomp.has(t) && !TAGS_INERT[t]) console.warn('[Phase1] unclassified tag:', t);
    });
  } catch (e) { console.warn('[Phase1] coverage check failed:', e); }
})();
