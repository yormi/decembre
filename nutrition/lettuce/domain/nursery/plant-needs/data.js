// Nursery plant-needs — source data.
//
// Spec:        nutrition/lettuce/domain/nursery/plant-needs/spec.md
// Derivation:  nutrition/lettuce/domain/nursery/plant-needs/derivation.md
//
// Salanova lettuce nursery seedlings raised in 2.5"-deep pots (32/tray) in a
// Berger OM2 + feather meal substrate. Seed → target weight over the cycle
// (default 35 d / 5 wk). The model answers: "how much of element X
// does a seedling need to take up this week to hit target weight T at
// density D over cycle C days?"
//
// Seedlings differ from mature heads on two axes:
//   - DW fraction higher (~7 % vs ~5 %) — younger tissue, more leaf:water
//     ratio while in active growth.
//   - Tissue concentrations slightly skewed: N higher (rapid protein
//     synthesis), Ca higher (active cell-wall building), K slightly
//     lower (less storage tissue).
//
// Source: Hochmuth 1991 (lettuce tissue critical-value norms) +
// Sonneveld & Voogt 2009 Ch. 6 (greenhouse leafy crops nutrient
// composition), seedling-stage adjustments from Décembre tissue notes.
// Cert annotations per field reflect transferability, not source quality
// alone (scale defined in nutrition/tomato/domain/plant-needs/spec.md).

// Tissue concentration on DW basis (mass fraction; micros via 1e-6).
// Used in the formula:
//   per_plant_per_wk_mg = target_g × DM × (7 / cycleDays) × tissue × 1000
// Element coverage closed at 11 elements (N, P, K, Ca, Mg + 6 micros).
// Cert 3 macros / 2 micros on the transferability scale (Hochmuth +
// Sonneveld are organic-greenhouse-adjacent; one major translation).
const LETTUCE_NURSERY_TISSUE_DW = {
  N:  0.050,    // 5.0 % — rapid protein synthesis vs mature 4.5 %; cert 3
  P:  0.005,    // 0.5 %; cert 3
  K:  0.060,    // 6.0 % — less storage tissue than mature 7 %; cert 3
  Ca: 0.020,    // 2.0 % — active cell-wall building vs mature 1.5 %; cert 3
  Mg: 0.004,    // 0.4 %; cert 3
  Fe: 200e-6,   // 200 ppm; cert 2
  Mn:  50e-6,   // 50  ppm; cert 2
  Zn:  40e-6,   // 40  ppm; cert 2
  B:   30e-6,   // 30  ppm; cert 2
  Cu:   8e-6,   // 8   ppm; cert 2
  Mo: 0.5e-6,   // 0.5 ppm; cert 2
};

// Dry-matter fraction at seedling harvest (~target weight). Higher than
// mature 5 % because young tissue is more leaf-rich and actively
// elongating. Cert 3 — Décembre-adjacent measurement on prior cohorts.
const LETTUCE_NURSERY_DM_FRACTION = 0.07;

// Default operational targets for the Décembre nursery.
//
// targetG_default       = 50 g per plant at end of cycle (default, NOT cap).
//                         Step-up 20 → 50 (2026-07-19), moving the salanova
//                         nursery from 50-cell trays to 2.5"-deep pots (32 per
//                         tray). Larger substrate volume (~200 mL vs 40 mL)
//                         drops salt density per mL, so a bigger plug fits the
//                         salt-safe CE band without a hotter feed. Realizes the
//                         "raise the plug target once salinity holds" trigger
//                         (fertigation derivation §6.5). The 20 g / 50-cell
//                         interim (2026-06-20) is retired to history, like the
//                         90 g before it. cert 2 — planned step-up, not yet
//                         field-run.
// cycleDays_default     = 35 d (5-week nursery, sowing → transplant-ready)
// cellsPerTray_default  = 32 pots/tray (2.5"-deep pot, 32 per standard tray)
// traysPerCohort_default= 50 trays/cohort (approx; pending re-measure for the
//                         2.5"-pot format — cohort sizing tracks the barrel)
// trayAreaM2            = 0.149 m² per tray (standard ≈ 11 in × 21 in; pot-tray
//                         footprint pending re-measure)
const NURSERY_TARGETS = {
  targetG_default:        50,    // cert 2 — 2.5"-pot step-up, not yet field-run (was 20 interim, 90 original)
  cycleDays_default:      35,    // cert 4
  cellsPerTray_default:   32,    // cert 3 — 2.5"-deep pot, 32 per tray
  traysPerCohort_default: 50,    // cert 2 (approx; pending 2.5"-pot cohort re-measure)
  trayAreaM2:             0.149, // cert 2 (pot-tray footprint pending re-measure)
};
