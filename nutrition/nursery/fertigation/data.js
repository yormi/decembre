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
// ecFactor, phContribution, organicAllowed, phClass) so recipe-mode-per-product,
// every-product-ecocert-allowed, ec-factor-covers-every-product,
// product-declares-ions-and-chemistry-tags, predicted-tank-ph-within-envelope-schema
// all apply locally too.
//
// IMPORTANT — local ecFactor calibration (predicted-ce-under-nursery-cap satisfaction):
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
  // Per-product analysis. cert annotations inline.
  const NURSERY_PRODUCTS = {

    'Ocean_15_1_1': {
      // EZ-GRO Ocean 15-1-1 — fish-protein hydrolysate powder.
      // Label NPK: 15-1-1 (= 15% N, 1% P₂O₅, 1% K₂O).
      // Elemental: P = 0.01 × 62/142 = 0.00437; K = 0.01 × 78/94.2 = 0.00828.
      // 80% amino acids, 65% fish-protein peptide.
      // Manufacturer hydroponics rate: 2 g/L weekly (label PDF).
      mode: 'flux',                              // recipe-mode-per-product — participates in demand-supply balance
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
      maximumStableHours: 24,                        // microbial degradation; cert 3
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
      maximumStableHours: 24,                        // microbial; cert 3
      cert: 3,
    },

    'AcadieKelp': {
      // Acadie Fresh Seaweed Concentrate (= Acadie Algues liquides) —
      // Ascophyllum nodosum extract from Nova Scotia. Acti-Sol datasheet
      // 2025-01: pH 7.4-8.2 (alkaline), 100% water-soluble, 13-16% organic
      // matter (amino acids, alginic acid, mannitol, fucoidan).
      // Source: nutrition/doc/Acadie Fresh Seaweed Concentrate.pdf
      // Density ~1.05 g/mL (cert 3, viscous brownish-black liquid).
      mode: 'concentration',                     // recipe-mode-per-product — concentration-driven biostimulant + nutrient blend
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
      maximumStableHours: 24,                        // cert 3
      cert: 4,                                   // datasheet-anchored
    },

    'IronSulfate': {
      // Sulfate de fer (FeSO₄·7H₂O), 20 % Fe. Bench practice: the team adds
      // ~1.4 g per 94 L bucket (≈ 0.015 g/L) for seedling iron. Works in the
      // nursery (acidic peat, tank pH ~5.8 keeps Fe²⁺ soluble) where the field
      // soil pH 7.48 would precipitate it. Folded into the model 2026-06-20 to
      // match the as-poured feed.
      mode: 'concentration',                     // simple micro salt, concentration-dosed
      ch: 'nursery',
      base: { Fe: 0.20 },                        // 20 % Fe (FeSO₄·7H₂O); cert 3 — product label
      phClass: { Fe: 'sulfate-metal' },          // cert 3
      ions: {
        'Fe2+': 0.20,                            // cert 3
        'SO4-2': 0.345,                          // SO₄ fraction of FeSO₄·7H₂O (96/278); cert 3
      },
      chemistryTags: ['sulfate'],                // cert 4 (same classifier path as kelp sulfate)
      organicAllowed: true,                      // CAN/CGSB-32.311 — iron sulfate listed; cert 4
      ecFactor: 1.2,                             // mS/cm per g/L; cert 2 (divalent-sulfate analogy; reconcile w/ global PRODUCT FeSO₄)
      solubilityCap_g_per_L: 250,                // cert 4
      phContribution: -0.10,                     // mildly acidifying (Fe²⁺ hydrolysis); cert 2
      maximumStableHours: 24,                        // cert 3
      cert: 3,
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

  // ─── Default recipe at 20 g target / 35-day cycle ─────────────────────
  //
  // Re-derived 2026-06-20 for the salt-control phase (target 20 g, 1 feed/wk).
  // Old recipe (Ocean 7 / Acadie 6 / kelp 2, CE 2.6) was sized to a 90 g plug
  // and sat just under a 3.0 cap that assumed substrate 1.5–2.5 — a band the
  // domain (root-zone 1.0–1.2, hold > 1.5) and the field (leachate 5+, Na
  // 3166, tip-burn) both reject. Lowering the plug target to 20 g halves N
  // demand, which lets the feed drop into the salt-safe band.
  // Math walked in derivation.md. Doses are concentration in the watering
  // bucket (mL/L for liquids, g/L for the powder).
  //
  // Numbers per product (per tray, per week, in mg of element):
  //   Ocean 2.0 g/L     × 1.25 L × 0.15 N          ×1000 = 375 mg N
  //   AcadiePoisson 1.5 g/L × 1.25 × 0.02          ×1000 =  37 mg N
  //   IronSulfate 0.015 g/L × 1.25 × 0.20 Fe       ×1000 = 3.75 mg Fe (~3 ppm in feed)
  //   ────────────────────────────────────────────────────
  //   Total                                              ≈ 412 mg N/tray (≥ 350 floor at 20 g)
  //
  // Predicted CE: 0.1 + 0.20×2 + 0.15×1.5 + 0.10×1 + 1.2×0.015 = 0.85 mS/cm → predicted-ce-under-nursery-cap ✓
  // Predicted pH: 6.26 + (-0.15)×2 + (-0.10)×1.5 + (0.02)×1 + (-0.10)×0.015 = 5.83 → predicted-tank-ph-in-nursery-envelope ✓
  // (CE is the bucket feed; the cell concentrates ~1.5× as it dries between
  //  weekly feeds → cell peak ~1.2, held by per-feed leaching. See salt-flush
  //  protocol + derivation.md.)
  //
  // Note: per-product dose units below are kept in **g/L** (label-native for
  // Ocean, and we take mL/L ≈ g/L for liquids at density ~1; documented
  // assumption). Conversion to mL/L for team-facing UI is a presentation
  // concern — sister-subproject (recipe app card) handles it.
  const NURSERY_RECIPE_DEFAULT = {
    Ocean_15_1_1: 2.0,                           // g/L (clears N floor at 20 g target; Ecocert allowed; cert 3)
    AcadiePoisson: 1.5,                          // g/L (≈ 1.5 mL/L; P workhorse, clears P floor; cert 3)
    AcadieKelp:    1.0,                          // g/L (≈ 1 mL/L; K + micro baseline; cert 3)
    IronSulfate:   0.015,                        // g/L (≈ 1.4 g / 94 L bench; ~3 ppm Fe; cert 3)
  };

  // ─── Caps + envelopes ─────────────────────────────────────────────────
  //
  // predicted-ce-under-nursery-cap — bucket feed CE ≤ 1.0 mS/cm. Cert 2.
  // Rationale: domain seedling root-zone band is target 1.0–1.2, hold feed
  // > 1.5 (young roots salt-sensitive; nutrition/lettuce/domain.md). The cell
  // concentrates ~1.5× above the bucket feed as it dries between weekly feeds
  // (cert 2 — dry-down estimate), so a 1.0 bucket cap keeps the cell peak near
  // the 1.5 hold line, targeting ~1.2. Per-feed leaching (salt-flush protocol)
  // resets weekly accumulation; pour-through EC is the cell ground truth.
  // Lowered 3.0 → 1.0 on 2026-06-20 (was sized to a now-rejected 1.5–2.5
  // substrate band). Hard cap at 1.0.
  const NURSERY_CE_CAP_MS_CM = 1.0;

  // predicted-tank-ph-in-nursery-envelope — tank pH band derived from predicted-tank-ph-within-envelope nursery row.
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
