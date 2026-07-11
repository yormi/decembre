// Tomato — channel ownership per element (CHANNEL_ROLE).
//
// Carved out of nutrition/tomato/lib/recipe-math.js 2026-05-23 (Phase 2
// chemistry pull-up). Stays tomato-side because the routing splits are
// crop-specific editorial decisions, not shared chemistry. Each crop owns its
// own channel-role file (option A from the locked plan).

// channel-role-coverage — Channel ownership per element.
// Tomato-only for Phase 1. Sums must hit 1.0 ± 0.05 per flux element.
// Cert 2-3 across the board: these splits are the model's editorial decisions
// about who owns delivery, not measurements. Source of opinion: the existing
// recipe shape (e.g., side-dress carries N, fertigation carries K/Mg + cation
// micros, P delegated to passive but tagged decorative per audit Finding 7).
// 2026-07-11: soil pH recovered to 6.5 (bed EC 1:1, 9 July) — the sulfate-metal
// lockout lifted, so Fe/Mn/Zn moved back foliar → fertigation (the sprays were
// retired). Cu stays foliar-routed but unfed (tissue élevé, soil normal).
const CHANNEL_ROLE = {
  N:  { fertigation: 0.0, sidedress: 0.7, frontload: 0.3 },           // sidedress + nursery loading; cert 3
  P:  { sidedress: 1.0 },                                              // decorative at pH 7.4 (no-decorative-products-at-current-ph); cert 3
  K:  { fertigation: 0.7, sidedress: 0.3 },                            // K₂SO₄ + Actisol K residual; cert 3
  Mg: { fertigation: 1.0 },                                            // MgSO₄ only; cert 4
  Ca: { passive: 1.0 },                                                // soil saturated; foliar is concentration-driven (concentration-dose-within-band); cert 4
  S:  { fertigation: 1.0 },                                            // sulfate side-product; cert 3
  Fe: { passive: 1.0 },                                                // soil-covered at pH 6.5 (310 ppm bank, SME 0.86 ppm→~86% mass-flow, tissue suff 80 ppm) + FeSO₄ oxidizes in the 5-day drip tank → not fertigated. Granular FeSO₄ sidedress = documented fallback if tissue Fe drops; cert 3
  Mn: { fertigation: 1.0 },                                            // rendu fertigation 2026-07-11 (pH sol 6,5, lockout levé, tank-stable); cert 4
  Zn: { fertigation: 1.0 },                                            // idem; cert 4
  Cu: { foliar: 1.0 },                                                 // non rendu (tissu élevé + sol normal, aucune carence); cert 4
  B:  { foliar: 0.5, passive: 0.5 },                                   // boric acid non-ionic, soil works; cert 3
  Mo: { foliar: 1.0 },                                                 // cert 3
};

// Browser-globals export
window.TomatoChannelRole = { CHANNEL_ROLE };
