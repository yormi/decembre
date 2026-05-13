// nutrition/nursery/fertigation/data.js
//
// Nursery weekly fertigation — product list, defaults, default recipe, caps.
//
// Three Ecocert products, all CAN/CGSB-32.311 listed:
//   - EZ-GRO Ocean 15-1-1 (Higrocorp; fish-protein hydrolysate, dry powder,
//     fully water-soluble). Primary N source. Cert 3 — manufacturer label.
//   - Acadie Poisson Hydrolysé 2-4-0.5 (Acadian Seaplants; liquid). P workhorse.
//   - Acadie Algues liquides (Acadian Seaplants; kelp extract). K + micros baseline.
//
// Mirrors the global `PRODUCT` schema shape (mode, base, ions, chemistryTags,
// ecFactor, phContribution, organicAllowed, phClass) so REQ-010, REQ-022,
// REQ-023, REQ-029a, REQ-053-schema all apply locally too.
//
// IMPORTANT — local ecFactor calibration (REQ-098 satisfaction):
// The global `PRODUCT` entries for these three products carry ecFactors at
// cert 2 (Ocean 0.8, Acadie poisson 0.5, Kelp 0.3). Field measurement of the
// CURRENT production solution (Acadie poisson 13 mL/L + Kelp 2 mL/L in 1.25 L
// tray water) reads 1.9–2.6 mS/cm — far below the global-ecFactor prediction
// of ~7.2 mS/cm. We therefore declare LOCAL ecFactor values calibrated from
// the measured solution EC, marked cert 3 (single-point calibration). The
// global values are not changed (out-of-scope per task brief). When the model
// is consolidated and tank EC datasheets land, reconcile in nutrition/spec.md.
//
// derivation.md walks the per-product math (label → elemental fractions, ion
// dissociation, ecFactor calibration, recipe sizing).

(function () {
  'use strict';

  // ─── Products ─────────────────────────────────────────────────────────
  //
  // Per-product analysis. cert annotations inline (REQ-028).
  const NURSERY_PRODUCTS = {

    'Ocean_15_1_1': {
      // EZ-GRO Ocean 15-1-1 — fish-protein hydrolysate powder.
      // Label NPK: 15-1-1 (= 15% N, 1% P₂O₅, 1% K₂O).
      // Elemental: P = 0.01 × 62/142 = 0.00437; K = 0.01 × 78/94.2 = 0.00828.
      // 80% amino acids, 65% fish-protein peptide.
      // Manufacturer hydroponics rate: 2 g/L weekly (label PDF).
      mode: 'flux',                              // REQ-010 — participates in demand-supply balance
      ch: 'nursery',
      base: { N: 0.15, P: 0.00437, K: 0.00828 }, // cert 4 — label
      phClass: { N: 'organic-N', P: 'organic-P', K: 'soluble-cation' }, // cert 3
      ions: { 'NH4+': 0.15, 'organic-matrix': 0.85 }, // amino-N dominates; cert 2
      chemistryTags: ['organic-matrix', 'protein-hydrolysate'], // cert 4
      organicAllowed: true,                      // CAN/CGSB-32.311 — fish protein hydrolysate; cert 4
      // LOCAL ecFactor calibrated from no-Ocean baseline + Ocean stress test
      // by analogy. Cert 2 — needs in-tank measurement once Ocean is in rotation.
      ecFactor: 0.20,                            // mS/cm per g/L; cert 2
      solubilityCap_g_per_L: 1000,               // miscible per label; cert 4
      // Acidifying via amino-N protonation; rough first-pass.
      phContribution: -0.15,                     // pH shift per g/L in clean 20°C water; cert 2
      maxStableHours: 24,                        // microbial degradation; cert 3
      cert: 3,
    },

    'AcadiePoisson': {
      // Acadie Poisson Hydrolysé 2-4-0.5 — liquid fish hydrolysate.
      // Label NPK: 2-4-0.5. Elemental: P = 0.04 × 62/142 = 0.0175;
      // K = 0.005 × 78/94.2 = 0.00414. Density assumed ~1.0 g/mL (cert 3,
      // typical liquid hydrolysate; 1 mL ≈ 1 g for dose math).
      mode: 'flux',
      ch: 'nursery',
      base: { N: 0.02, P: 0.0175, K: 0.00414 },  // cert 4 — label
      phClass: { N: 'organic-N', P: 'organic-P', K: 'soluble-cation' },
      ions: { 'NH4+': 0.02, 'organic-matrix': 0.98 }, // mostly amino-N; cert 2
      chemistryTags: ['organic-matrix', 'protein-hydrolysate', 'live-microbial'],
      organicAllowed: true,                      // Acadie Ecocert listed; cert 4
      // LOCAL ecFactor: measured solution EC ≈ 2.0 mS/cm at 13 mL/L (≈ 13 g/L)
      // with kelp at 2 mL/L. Solving 13 × x + 2 × 0.05 ≈ 1.9 → x ≈ 0.14.
      // Round to 0.15. Cert 3 — single-point calibration.
      ecFactor: 0.15,                            // mS/cm per g/L; cert 3
      solubilityCap_g_per_L: 1000,               // miscible; cert 4
      phContribution: -0.10,                     // mildly acidic; cert 2
      maxStableHours: 24,                        // microbial; cert 3
      cert: 3,
    },

    'AcadieKelp': {
      // Acadie Fresh Seaweed Concentrate (= Acadie Algues liquides) —
      // Ascophyllum nodosum extract from Nova Scotia. Acti-Sol datasheet
      // 2025-01: pH 7.4-8.2 (alkaline), 100% water-soluble, 13-16% organic
      // matter (amino acids, alginic acid, mannitol, fucoidan).
      // Source: nutrition/doc/Acadie Fresh Seaweed Concentrate.pdf
      // Density ~1.05 g/mL (cert 3, viscous brownish-black liquid).
      mode: 'concentration',                     // REQ-010 — concentration-driven biostimulant + nutrient blend
      ch: 'nursery',
      // Element mass fractions from datasheet typical analysis (w/w).
      // K₂O 6.0% × 0.83 = 4.98% K element. P₂O₅ <0.2% × 0.437 = <0.087% P
      // (use upper bound conservatively). Ca/Mg datasheet midpoint 0.10%.
      // Micros datasheet midpoint per element. Cert 4 — manufacturer label.
      base: {
        N:  0.006,     // 0.6% total N; cert 4
        P:  0.0009,    // <0.2% P₂O₅ → ~0.09% P element; cert 4
        K:  0.0498,    // 6.0% K₂O → 4.98% K element; cert 4
        Ca: 0.001,     // 0.05-0.15% midpoint; cert 4
        Mg: 0.001,     // 0.05-0.15% midpoint; cert 4
        Fe: 60e-6,     // 30-90 ppm midpoint; cert 4
        Mn:  7e-6,     // 3-11 ppm midpoint; cert 4
        Zn: 10e-6,     // 4-17 ppm midpoint; cert 4
        B:  30e-6,     // 20-40 ppm midpoint; cert 4
        Cu:  4e-6,     // <4 ppm upper bound; cert 4
      },
      phClass: {
        N: 'soluble-cation', P: 'soluble-cation', K: 'soluble-cation',
        Ca: 'soluble-cation', Mg: 'soluble-cation',
        Fe: 'sulfate-metal', Mn: 'sulfate-metal', Zn: 'sulfate-metal',
        B: 'non-ionic-soil', Cu: 'sulfate-metal',
      },
      ions: {
        'K+': 0.0498, 'Ca2+': 0.001, 'Mg2+': 0.001,
        'Fe2+': 60e-6, 'Mn2+': 7e-6, 'Zn2+': 10e-6, 'Cu2+': 4e-6,
        'B(OH)4-': 30e-6,
        'SO4-2': 0.013,                         // S 0.3-0.6% midpoint, treated as sulfate-equivalent
        'organic-matrix': 0.93,                 // remainder (alginate, amino acids, mannitol, fucoidan)
      },
      chemistryTags: ['organic-matrix', 'biostimulant', 'sulfate'],
      organicAllowed: true,                      // Acti-Sol Acadie line CETAB+ / CAN/CGSB-32.311 listed; cert 4
      ecFactor: 0.10,                            // mS/cm per g/L; cert 2 (calibrated from production-solution measurement window)
      solubilityCap_g_per_L: 1000,               // miscible; cert 4
      phContribution: 0.02,                     // alkaline (datasheet pH 7.4-8.2) — small positive shift; cert 2
      maxStableHours: 24,                        // cert 3
      cert: 4,                                   // datasheet-anchored
    },

  };

  // ─── Operational defaults ─────────────────────────────────────────────
  //
  // Per-tray weekly volume + applications/week. Cohort-level math (50 trays,
  // bucket vol) is sister-subproject scope; this file owns the weekly tray
  // delivery only.
  const NURSERY_FERTIGATION_DEFAULTS = {
    trayVolumeL: 1.25,                           // cert 4 — observed at Décembre
    applicationsPerWeek: 1,                      // cert 4 — observed
  };

  // ─── Default recipe at 90 g target / 35-day cycle ─────────────────────
  //
  // Sized to maximize N + P coverage within REQ-098 (CE ≤ 3.0) and REQ-099
  // (tank pH 4.5–6.5). Math walked in derivation.md. Doses are concentration
  // in the watering bucket (mL/L for liquids, g/L for the powder).
  //
  // Numbers per product (per tray, per week, in mg of element):
  //   Ocean 7.0 g/L     × 1.25 L × 0.15 N           ×1000 = 1313 mg N
  //   AcadiePoisson 6 mL/L (≈ 6 g/L) × 1.25 × 0.02  ×1000 =  150 mg N
  //   AcadieKelp 2 mL/L (≈ 2 g/L)    × 1.25 × 0.0   ×1000 =    0 mg N (negligible)
  //   ────────────────────────────────────────────────────
  //   Total                                              ≈ 1463 mg N/tray
  //
  // Predicted CE: 0.1 + 0.20×7 + 0.15×6 + 0.10×2 = 2.6 mS/cm  → REQ-098 ✓
  // Predicted pH: 7.0 + (-0.15)×7 + (-0.10)×6 + (-0.05)×2 = 5.25 → REQ-099 ✓
  //
  // Note: per-product dose units below are kept in **g/L** (label-native for
  // Ocean, and we take mL/L ≈ g/L for liquids at density ~1; documented
  // assumption). Conversion to mL/L for team-facing UI is a presentation
  // concern — sister-subproject (recipe app card) handles it.
  const NURSERY_RECIPE_DEFAULT = {
    Ocean_15_1_1: 7.0,                           // g/L (≈ label hydroponics 2 g/L × 3.5; Ecocert allowed; cert 3)
    AcadiePoisson: 6.0,                          // g/L (≈ 6 mL/L; cert 4 — 5–13 range trialed at farm)
    AcadieKelp:    2.0,                          // g/L (≈ 2 mL/L; current production rate; cert 4)
  };

  // ─── Caps + envelopes ─────────────────────────────────────────────────
  //
  // REQ-098 — solution CE at fertigation ≤ 3.0 mS/cm. Cert 3.
  // Rationale: substrate EC post-watering target 1.5–2.5 mS/cm (cert 4) +
  // some carry-up; staying ≤ 3.0 in the bucket protects week-1 trays
  // (smallest roots, most osmotic-stress-sensitive). Hard cap at 3.0.
  const NURSERY_CE_CAP_MS_CM = 3.0;

  // REQ-099 — tank pH band derived from REQ-053 nursery row.
  // [4.5, 6.5] matches peat substrate pH range. cert 4.
  const NURSERY_TANK_PH_RANGE = [4.5, 6.5];

  // ─── Expose ───────────────────────────────────────────────────────────
  // model.js wires these onto window.FertigationNursery.
  if (typeof window !== 'undefined') {
    window.__NURSERY_FERT_DATA__ = {
      NURSERY_PRODUCTS,
      NURSERY_FERTIGATION_DEFAULTS,
      NURSERY_RECIPE_DEFAULT,
      NURSERY_CE_CAP_MS_CM,
      NURSERY_TANK_PH_RANGE,
    };
  }
})();
