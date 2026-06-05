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
// recipe shape (e.g., side-dress carries N, fertigation carries K/Mg, foliar
// carries micros) plus the organic-greenhouse pH-7.4 reality (Fe/Mn/Zn moved
// foliar; P delegated to passive but tagged decorative per audit Finding 7).
const CHANNEL_ROLE = {
  N:  { fertigation: 0.0, sidedress: 0.7, frontload: 0.3 },           // sidedress + nursery loading; cert 3
  P:  { sidedress: 1.0 },                                              // decorative at pH 7.4 (no-decorative-products-at-current-ph); cert 3
  K:  { fertigation: 0.7, sidedress: 0.3 },                            // K₂SO₄ + Actisol K residual; cert 3
  Mg: { fertigation: 1.0 },                                            // MgSO₄ only; cert 4
  Ca: { passive: 1.0 },                                                // soil saturated; foliar is concentration-driven (concentration-dose-within-band); cert 4
  S:  { fertigation: 1.0 },                                            // sulfate side-product; cert 3
  Fe: { foliar: 1.0 },                                                 // pH 7.4 lockout — foliar bypass; cert 4
  Mn: { foliar: 1.0 },                                                 // cert 4
  Zn: { foliar: 1.0 },                                                 // cert 4
  Cu: { foliar: 1.0 },                                                 // cert 4
  B:  { foliar: 0.5, passive: 0.5 },                                   // boric acid non-ionic, soil works; cert 3
  Mo: { foliar: 1.0 },                                                 // cert 3
};

// Browser-globals export
window.TomatoChannelRole = { CHANNEL_ROLE };
