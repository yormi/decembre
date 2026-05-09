// Nursery plant-needs — source data.
//
// Spec:        nutrition/nursery/plant-needs/spec.md
// Derivation:  nutrition/nursery/plant-needs/derivation.md
//
// Salanova lettuce nursery seedlings raised in 50-cell trays in a Berger
// OM2 + feather meal substrate. Seed → target weight over the cycle
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
// alone (scale defined in nutrition/tomato/plant-needs/spec.md).

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

// Default operational targets for the Décembre nursery. cert 4 —
// observed at Décembre, single greenhouse, single tray geometry.
//
// targetG_default       = 90 g per plant at end of cycle (default, NOT cap;
//                         user can override for tighter / looser schedules)
// cycleDays_default     = 35 d (5 weeks germination → transplant-ready)
// cellsPerTray_default  = 50 cells/tray (Salanova plug tray standard)
// traysPerCohort_default= 50 trays/cohort (sized to fertigation barrel)
// trayAreaM2            = 0.149 m² per tray (≈ 11 in × 21 in standard 50-cell)
const NURSERY_TARGETS = {
  targetG_default:        90,    // cert 4
  cycleDays_default:      35,    // cert 4
  cellsPerTray_default:   50,    // cert 4
  traysPerCohort_default: 50,    // cert 4 (approx; cohort sized to fertigation barrel)
  trayAreaM2:             0.149, // cert 4 (50-cell standard ≈ 11" × 21")
};
