// Substrate-contribution (nursery) — source data.
//
// Spec:        nutrition/lettuce/domain/nursery/substrate-contribution/spec.md
// Derivation:  nutrition/lettuce/domain/nursery/substrate-contribution/derivation.md
//
// Salanova nursery — trays of 32 × 2.5"-deep pots in Berger OM2 peat-based
// organic mix front-loaded with feather meal at potting (current convention:
// 2 cups feather meal per OM2 sac → ~34 g feather meal per tray).
//
// This file owns the per-tray weekly per-element NUTRIENT RELEASE math:
//   release = (OM2 starter charge × release curve) + (feather meal × N % × mineralization × release curve)
//
// Cert annotations per field reflect transferability, not source quality.
// Scale defined canonically in nutrition/tomato/domain/plant-needs/spec.md.

// ─── OM2 starter charge ────────────────────────────────────────────────
//
// Berger OM2 = peat-based organic germination mix (berger.ca, OMRI / Québec
// Vrai). Values below are conservative estimates from typical organic-mix
// specs — NOT OM2-measured.
//
// Web search exhausted (2026-07-19, see learnings/om2-nutrient-values-not-public.md):
// Berger publishes ZERO numeric nutrient values for OM2 — no N-P-K, no Ca/Mg,
// no micros, no EC, on any surface (product page, PDF datasheet, 2025 brochure).
// The 2025 brochure even OMITS a fertilizer starter charge from OM2's ingredient
// list (peat, perlite, vermiculite, dolomitic + calcitic limestone, wetting
// agent), while the spec page calls it a "low fertilizer starter charge" — so
// even the SIZE of the N/P/K pre-charge is unconfirmed. The N 175 placeholder
// is the shakiest: OM2's soluble-N charge may be well below it. Confirmed
// OM2-specific: incubated pH 5.2–6.0 (Berger PDF + product page) and Ca/Mg
// present via dolomitic + calcitic limestone (qualitative — no rate).
// Refinement trigger: direct Berger agronomy request for the starter-charge
// guaranteed analysis + limestone rate, or an in-house SME lab test on a real
// OM2 batch (convert SME ppm → mg/L-substrate with this mix's density/dilution).
//
// Units: ppm in fresh substrate (mg per L of substrate).
const OM2_STARTER_CHARGE_PPM = {
  N:  175,   // cert 2 — UNVERIFIED, likely overstated (brochure implies low/absent charge)
  P:  50,    // cert 2 — unverified (no public value)
  K:  150,   // cert 2 — unverified (no public value)
  Ca: 200,   // cert 2 — lime-sourced Ca confirmed present, quantity unverified
  Mg: 50,    // cert 2 — dolomitic-lime Mg confirmed present, quantity unverified
};

// Fractional release per week of the 5-week nursery cycle (week 1 .. week 5).
// Peat-based organic mix releases its labile fraction front-loaded —
// roughly half in week 1, then tapering as soluble pools deplete and the
// remaining bound fraction mineralizes slowly. Sum ≈ 1.0 (mass balance).
// Cert 2 — qualitative match to organic-mix release behaviour; refine
// with Décembre PourThru substrate EC time-series once collected.
const OM2_RELEASE_CURVE_BY_WEEK = [0.50, 0.30, 0.15, 0.05, 0.00];

// ─── Feather meal (front-load at potting) ──────────────────────────────
//
// CAN/CGSB-32.311 ✓ (animal by-product, allowed organic input).
// Label analysis 13-0-0; effectively pure organic-N source with negligible
// P / K. Mineralization in cool greenhouse peat substrate ≈ 75% over
// ~4-6 weeks — Sonneveld & Voogt; conservative 4-5 weeks for our cycle.
// Release curve: lag in week 1 (microbial colonization), peak weeks 2-3,
// tail weeks 4-5.

const FEATHER_MEAL_LABEL_PCT = {
  N: 0.13,  // 13% N label; cert 4 (manufacturer label)
};

const FEATHER_MEAL_MINERALIZATION_FRAC = 0.75;  // cert 4 — Sonneveld & Voogt

const FEATHER_MEAL_RELEASE_CURVE_BY_WEEK = [0.10, 0.25, 0.25, 0.25, 0.15];
//                                          wk1   wk2   wk3   wk4   wk5
// Sum = 1.00 — see INV-2 (mass balance). Cert 3 — shape consistent with
// cool-greenhouse organic-N mineralization profile; refine if tissue
// tests show off-stage N timing.

// ─── Tray geometry & front-load convention ─────────────────────────────
//
// 2.5"-deep pot, ~200 mL of substrate per pot × 32 pots = 6.4 L/tray.
// Cert 2 — pot volume pending brim measure; OM2 sac (50 L) fills ~7.8 trays.
const NURSERY_TRAY_SUBSTRATE_VOL_L = 6.4;

// Convention: 2 cups feather meal per 50 L OM2 sac.
//   2 cups ≈ 480 mL × ~0.55 g/mL bulk density ≈ 264 g per sac
//   1 sac fills ~7.8 trays at 6.4 L/tray
//   → 264 / 7.8 ≈ 33.8 g/tray  →  rounded to 34 g/tray
// Cert 3 — computed from operator convention; bulk density assumption
// 0.5-0.6 g/mL is the only soft lever.
const NURSERY_FEATHER_MEAL_DEFAULT_G_PER_TRAY = 34;

// ─── Hard operational ceiling — germination protection ─────────────────
//
// Salanova germinates poorly in salty substrate. Empirical ceiling was
// observed at 9 g per 1.65 L 50-cell tray = 5.45 g/L substrate — the
// binding quantity is salt density per litre, so the pot-format tray cap
// is 5.45 g/L × 6.4 L ≈ 35 g/tray (per Décembre operator note + Sonneveld
// guidance for peat substrate salt sensitivity). The model EXPOSES this so
// the consumer page can clamp the input slider; feather-meal-front-load-cap
// asserts the cap stays ≤ 35.
const LIMITS = {
  maxFeatherMealPerTrayG: 35,  // cert 3 — 5.45 g/L field ceiling rescaled to 6.4 L tray; not re-observed at pot format
};

// Per-element efficiency for the Efficacité column (efficacite-column-capability) — share of
// applied substrate-product mass that becomes plant-available across the
// 5-week nursery cycle. Time-distributed: the release-curve sum (≈ 1.0
// per INV-2 mass balance) means OM2-borne elements fully release across
// the cycle; feather-meal N additionally discounts by mineralization.
//
// Definitional choice (see derivation.md):
//   N  = FEATHER_MEAL_MINERALIZATION_FRAC × Σ(OM2_RELEASE_CURVE_BY_WEEK)
//      ≈ 0.75 × 1.0 = 0.75
//      (simplification: ignores OM2-N contribution which is small at
//       default rates; the headline number reads as the feather-meal
//       efficiency since feather meal dominates the N flux per tray)
//   P/K/Ca/Mg = Σ(OM2_RELEASE_CURVE_BY_WEEK) ≈ 1.0  (OM2-only elements;
//      the starter charge releases fully across the 5-week cycle into a
//      small, root-contact-rich peat plug, so plant-available ≈ released)
//
// Per-element cert reflects the dominant uncertainty:
//   N  cert 3 — feather-meal mineralization (Sonneveld & Voogt textbook,
//                cool-greenhouse organic-N profile); the OM2-N omission
//                drops cert from 4 to 3
//   P  cert 2 — OM2 datasheet pending (placeholder values)
//   K  cert 2 — OM2 datasheet pending
//   Ca cert 3 — limestone-buffered peat adequacy (Berger family typical)
//   Mg cert 3 — limestone-buffered peat adequacy
const NURSERY_SUBSTRATE_EFFICIENCY = {
  N:  0.75,
  P:  1.0,
  K:  1.0,
  Ca: 1.0,
  Mg: 1.0,
};
