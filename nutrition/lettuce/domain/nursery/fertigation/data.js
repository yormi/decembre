// nutrition/lettuce/domain/nursery/fertigation/data.js
//
// Nursery weekly fertigation — product list, defaults, default recipe, caps.
//
// Products, all CAN/CGSB-32.311 listed (micro salts allowed with conditions):
//   - EZ-GRO Ocean 15-1-1 (Higrocorp; fish-protein hydrolysate, dry powder,
//     fully water-soluble). Primary N source. Cert 3 — manufacturer label.
//   - Acadie Poisson Hydrolysé 2-4-0.5 (Acadian Seaplants; liquid). P workhorse.
//   - Sulfate de potasse 0-0-50, gypse, sulfate de magnésium (mined salts) —
//     K / Ca / Mg (2026-08-25 rebalance).
//   - Sulfate de fer (Fe) + MicroStock bottle (Mn/Zn/B/Cu).
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

    // AcadieKelp removed from the registry 2026-08-25 — dominant Na source
    // (555 of 960 mg Na per tray per cycle) for 2-18 % micro coverage; its K
    // taken over by KSulfate, micros by MicroStock. Entry in git history.

    'KSulfate': {
      // Sulfate de potasse 0-0-50 (mined; same product as tomato channel).
      // 50 % K₂O × 0.83 = 41.5 % K element.
      mode: 'flux',
      ch: 'nursery',
      base: { K: 0.415 },                        // cert 4 — label
      phClass: { K: 'soluble-cation' },          // cert 4
      ions: { 'K+': 0.415, 'SO4-2': 0.54 },      // cert 4
      chemistryTags: ['sulfate'],                // cert 4
      organicAllowed: true,                      // CAN/CGSB-32.311 — mined potassium sulfate; cert 4
      ecFactor: 1.5,                             // mS/cm per g/L; cert 2 — verify with CE meter on first bucket
      solubilityCap_g_per_L: 110,                // cert 4
      phContribution: 0,                         // neutral salt; cert 3
      maximumStableHours: 168,                   // stable mineral salt; cert 4
      cert: 4,
    },

    'Gypsum': {
      // Gypse (CaSO₄·2H₂O), 23.2 % Ca. Continuous solution Ca — the tip-burn
      // lever (better than a one-time pulse; nursery-5wk-balance decision
      // 2026-08-25). Dose 0.14 g/L sits far under the 2.4 g/L solubility and
      // the Ca2+ × SO4-2 KSP threshold (2.4 g/L combined). Slow to dissolve —
      // add first, stir.
      mode: 'flux',
      ch: 'nursery',
      base: { Ca: 0.232 },                       // cert 4 — stoichiometry
      phClass: { Ca: 'soluble-cation' },         // cert 3
      ions: { 'Ca2+': 0.232, 'SO4-2': 0.558 },   // cert 4
      chemistryTags: ['sulfate'],                // cert 4
      organicAllowed: true,                      // CAN/CGSB-32.311 — mined gypsum; cert 4
      ecFactor: 0.9,                             // mS/cm per g/L; cert 2 — verify with CE meter on first bucket
      solubilityCap_g_per_L: 2.4,                // cert 4
      phContribution: 0,                         // neutral salt; cert 3
      maximumStableHours: 168,                   // cert 4
      cert: 4,
    },

    'MgSulfate': {
      // Sulfate de magnésium (MgSO₄·7H₂O), 9.9 % Mg (same product as tomato
      // channel).
      mode: 'flux',
      ch: 'nursery',
      base: { Mg: 0.099 },                       // cert 4 — stoichiometry
      phClass: { Mg: 'soluble-cation' },         // cert 4
      ions: { 'Mg2+': 0.099, 'SO4-2': 0.39 },    // cert 4
      chemistryTags: ['sulfate'],                // cert 4
      organicAllowed: true,                      // CAN/CGSB-32.311 — mined magnesium sulfate; cert 4
      ecFactor: 0.75,                            // mS/cm per g/L; cert 2 — verify with CE meter on first bucket
      solubilityCap_g_per_L: 700,                // cert 4
      phContribution: 0,                         // neutral salt; cert 3
      maximumStableHours: 168,                   // cert 4
      cert: 4,
    },

    'MicroStock': {
      // Bouteille stock micros — 1 L of water holding MnSO₄·H₂O 3.3 g,
      // ZnSO₄·7H₂O 3.7 g, Solubor 3.1 g, CuSO₄·5H₂O 0.7 g. Dosed as a liquid
      // (mL/L ≈ g/L at density ~1.0). Per-bucket micro needs are sub-milligram
      // per tray — unweighable directly; the stock bottle is the only
      // practical gesture. Base fractions = salt g/L × element fraction ÷ 1000.
      // CAN/CGSB-32.311: Mn/Zn/Cu sulfates + sodium borate allowed WITH
      // CONDITIONS (documented deficiency) — documentation = August tissue
      // (Zn under floor) + nursery-5wk-balance; Cu logged in the copper
      // registry. Deliberately NOT tagged free-Cu2+: the Cu-protein-gel
      // incompatibility is a concentrated-foliar failure mode; at 0.07 mg/L
      // CuSO₄ in the feed the gel chemistry cannot express (trace, cert 3).
      mode: 'concentration',
      ch: 'nursery',
      base: {
        Mn: 0.00106,   // 3.3 g/L MnSO₄·H₂O × 32 % Mn; cert 3
        Zn: 0.00085,   // 3.7 g/L ZnSO₄·7H₂O × 23 % Zn; cert 3
        B:  0.00064,   // 3.1 g/L Solubor × 20.5 % B; cert 3
        Cu: 0.000175,  // 0.7 g/L CuSO₄·5H₂O × 25 % Cu; cert 3
      },
      phClass: { Mn: 'sulfate-metal', Zn: 'sulfate-metal', B: 'non-ionic-soil', Cu: 'sulfate-metal' },
      ions: {
        'Mn2+': 0.00106, 'Zn2+': 0.00085, 'Cu2+': 0.000175,
        'B(OH)4-': 0.00064,
        'Na+': 0.00034,                          // Solubor sodium (11 % of 3.1 g/L); cert 3
        'SO4-2': 0.0034,                         // summed sulfate of the three metal salts; cert 3
      },
      chemistryTags: ['sulfate'],                // cert 3 (free-Cu2+ deliberately omitted — see header note)
      organicAllowed: true,                      // all four salts CAN/CGSB-32.311 (with conditions); cert 4
      ecFactor: 0.01,                            // ~8.8 mg dissolved salt per g of stock; cert 2
      solubilityCap_g_per_L: 1000,               // dilute aqueous stock, miscible; cert 4
      phContribution: 0,                         // trace; cert 3
      maximumStableHours: 2160,                  // mineral salts in water, shaded bottle ~3 months; cert 2
      cert: 3,
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
    trayVolumeL: 2,                              // cert 3 — RETAINED volume: operator observes 120 mL/pot mostly drips to the floor; ~62 mL/pot × 32 is what the pots hold. Refine by weighing a tray before/after a feed.
    applicationsPerWeek: 5,                      // cert 3 — weekday-daily; forced by the CE cap at 2 L (3 buckets predict ~1.35 mS/cm)
  };

  // ─── Default recipe at 50 g target / 35-day cycle / 2.5"-pot ──────────
  //
  // 2026-08-25 rebalance (nursery-5wk-balance.md): N/P doses solved to exact
  // against RESIDUAL need (demand − credited front-load: feather meal 75 %
  // mineralization, OM2 charge 50 % of placeholder); K/Ca/Mg by mined salts;
  // micros by the MicroStock bottle; kelp dropped (dominant Na source).
  // 5 buckets/week at 2 L/tray retained volume — the week's K in fewer
  // buckets breaches the CE cap. Weekly clean-water flush to runoff replaces
  // the per-feed leach (nothing runs off at 62 mL/pot). Doses are bucket
  // concentrations (g/L powders, mL/L ≈ g/L liquids at density ~1).
  //
  // Per bucket (per tray, 2 L): N 102 / P 16 / K 250 / Ca 65 / Mg 12 mg
  // → weekly ×5: N 511 / P 80 / K 1 248 / Ca 325 / Mg 58 mg — each ≈ the
  // residual weekly need at the 50 g / 32-pot target. Math in derivation.md.
  //
  // Predicted CE: 0.1 + 0.20×0.29 + 0.15×0.39 + 1.5×0.29 + 0.9×0.14
  //   + 0.75×0.058 + 1.2×0.015 + 0.01×0.1 = 0.84 mS/cm → predicted-ce-under-nursery-cap ✓ (headroom 0.16)
  // Predicted pH: 6.26 − 0.15×0.29 − 0.10×0.39 − 0.10×0.015 = 6.18 → predicted-tank-ph-in-nursery-envelope ✓
  // Key order = mixing order (slow-dissolving gypsum first; renders in this
  // order on the operator + Bilan cards).
  const NURSERY_RECIPE_DEFAULT = {
    Gypsum:        0.14,                         // g/L — continuous solution Ca; dissolve FIRST, stir; cert 3
    Ocean_15_1_1:  0.29,                         // g/L — N, exact-solved on residual; cert 3
    AcadiePoisson: 0.39,                         // g/L (≈ mL/L) — P, exact-solved on residual; cert 3
    KSulfate:      0.29,                         // g/L — K workhorse (93 % of K need); cert 3
    MgSulfate:     0.058,                        // g/L — Mg residual; cert 3
    IronSulfate:   0.015,                        // g/L (≈ 1.4 g / 94 L bench; ~3 ppm Fe); cert 3
    MicroStock:    0.1,                          // g/L (≈ 10 mL / 94 L bench) — Mn/Zn/B/Cu; cert 3
  };

  // ─── Caps + envelopes ─────────────────────────────────────────────────
  //
  // predicted-ce-under-nursery-cap — bucket feed CE ≤ 1.0 mS/cm. Cert 2.
  // Rationale: domain seedling root-zone band is target 1.0–1.2, hold feed
  // > 1.5 (young roots salt-sensitive; domain/lettuce/model.md). The cell
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
