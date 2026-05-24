// Chemistry — PRODUCT catalog (mineral salts + organic fertilizers + amendments).
//
// Pure data. No functions. Carved out of nutrition/tomato/lib/recipe-math.js
// 2026-05-23 (Phase 2 chemistry pull-up): catalog applies to every crop, not
// just tomato. Channel-routing decisions (tomato CHANNEL_ROLE) stayed on the
// tomato side at nutrition/tomato/channel-role.js.
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

// Browser-globals export
window.NutritionProducts = { PRODUCT };
