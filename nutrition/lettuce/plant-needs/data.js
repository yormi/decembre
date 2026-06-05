// Salanova — plant-needs data tables.
//
// Constants extracted from app/index.html on 2026-05-16 as part of the
// nutrition/lettuce/plant-needs subproject carve-out (mirrors the
// nutrition/tomato/plant-needs structure: data + calc + model).
//
// Values unchanged from the pre-carve in-line definitions. Provenance,
// source tables, certainty rationale and refinement triggers live in
// `nutrition/lettuce/plant-needs/derivation.md`. Rejected alternatives
// (stage-based modelling, etc.) live in `learnings.md`.

// Dry-matter fraction for fresh Salanova heads. Cert 4 — butterhead literature
// (typical 4-6% DW; greenhouse-grown ≈ 5%).
const LETTUCE_DM_FRACTION = 0.05;

// Tissue concentration on DW basis (mass fraction; micros expressed via 1e-6).
// Sources: Hochmuth et al. 1991 lettuce tissue norms; Sonneveld & Voogt 2009
// Ch. 6 leafy greens. Cert 4 macros / cert 3 micros.
const LETTUCE_TISSUE_DW = {
  N:  0.045,   // 4.5% (range 4.0-5.0)
  P:  0.005,   // 0.5%
  K:  0.07,    // 7% (range 6-8)
  Ca: 0.015,   // 1.5%
  Mg: 0.004,   // 0.4%
  Fe: 200e-6,  // 200 ppm
  Mn:  50e-6,  // 50 ppm
  Zn:  40e-6,  // 40 ppm
  B:   30e-6,  // 30 ppm
  Cu:   8e-6,  // 8 ppm
  Mo: 0.5e-6,  // 0.5 ppm
};

// Front-load (feather meal pre-transplant) defaults.
//   featherMeal_g_per_m2: rate applied to each planche before transplant.
//   mineralizationWeeks: window over which the front-load releases plant-
//     available N (cert 3 — 4-6 weeks in cool greenhouse soil; assume 4 to
//     stay conservative on weekly supply).
// 50 g/m² × 13% N × 75% mineralization / 4 wk = ~1 219 mg N/m²/wk effective.
const LETTUCE_FRONTLOAD_DEFAULTS = {
  featherMeal_g_per_m2: 50,
  mineralizationWeeks:   4,
};

// SME lettuce bed (Berger sample 596616, laitue 1, 2026-04-10).
// Source: farm info/SME - 2026-04-10.pdf
// Per-element ppm with in-spec / lockout annotation per element.
const SME_LETTUCE_PPM = {
  N:  72.6,    // NO₃ 68.8 + NH₄ 3.8 (in spec range 35-180 / 0-20)
  P:   0.8,    // ↓ below norm 5-50 (lockout confirmed — same Ca-driven mechanism as tomato bed)
  K:  54.4,    // in spec 35-300, low end
  Ca: 114.4,   // in spec 40-200 — note: still Ca-saturated on Mehlich-3 (10 612 kg/ha) but SME OK
  Mg:  30.2,   // in spec 20-100, low end
  B:   0.17,   // in spec 0.05-0.5
  Cu:  0.03,   // in spec 0.01-0.5
  Fe:  0.22,   // ↓ below norm 0.30-3 (locked)
  Mn:  0,      // < 0.03 below detection — locked
  Mo:  0.02,   // in spec 0.01-0.05
  Zn:  0,      // < 0.03 below detection — locked
};
