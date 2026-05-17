// Foliar-recipe — source data.
//
// Spec:        nutrition/tomato/foliar-recipe/spec.md
// Derivation:  nutrition/tomato/foliar-recipe/derivation.md
//
// Foliar is the cuticle-uptake channel for the weekly oligo spray
// (Mn / Zn / Cu / Mo / Fe + historical Solubore + retired CaCl₂). The
// dose itself is stored in STORED_RECIPE.tomato.foliaire (locked, edits
// go through /retire-recipe); this subproject owns the *delivery model*
// — how much of the spray actually reaches the plant after the cuticle
// coverage discount.
//
// Foliar is BURN-CAP-CONSTRAINED, not mass-balance-derived. The dose is
// pinned at the maximum cuticle-safe load; this subproject computes
// delivered mg/m²/wk under the coverage discount. See derivation.md.

// Cuticle-coverage efficiency without surfactant. Cert 3 — cuticle-uptake
// literature midpoint of 25-40 % range for sulfate micros without yucca;
// not directly measured at Décembre. Cu local-pool-toxicity image is pool
// concentration, not coverage; Sentís et al. 2017 cuticle Mn penetration
// ~3 % without surfactant is absorption, not retention — 30 % blends both
// axes. Bump to cert 4 when tissue panel correlates predicted vs measured.
//
// REQ-101 reads this to compute delivered = recipe_g × element_pct ×
// 1000 / area × FOLIAR_COVERAGE_DEFAULT.
const FOLIAR_COVERAGE_DEFAULT = 0.30;

// With-yucca coverage. Cert 3 — surfactant-assisted droplet spread +
// cuticle wetting put literature uptake at 70-85 % for sulfate micros;
// pinned at 0.80 as working assumption, not measured at Décembre. Same
// three-axis caveat as FOLIAR_COVERAGE_DEFAULT: no direct Décembre
// measurement at this regime, axil-pool image (when yucca was on
// program) was pool concentration not coverage; Sentís et al. 2017
// surfactant-assisted cuticle Mn penetration ~20 % is absorption, not
// retention — 0.80 blends both axes. Currently not consumed by
// computeFoliarSupply (yucca dropped 2026-05-05, not on order); exposed
// for future toggle code if/when yucca returns. Bump to cert 4 when
// tissue panel correlates predicted vs measured under a surfactant-on
// regime.
const FOLIAR_COVERAGE_WITH_YUCCA = 0.80;

// Per-element efficiency for the Efficacité column (REQ-157, REQ-170) —
// share of applied foliar-recipe mass that becomes plant-available per
// applied gram. Surfactant-aware per REQ-170: toggling the surfactant
// lever in Block 5 (REQ-163 page-side) flips the efficiency between the
// no-surfactant and with-surfactant regimes.
//
// Formula:   efficiency(surfactant) = coverage × foliarPhResponse(sprayPh)
//   surfactant=false:  0.30 × foliarPhResponse(5.0) = 0.30 × 0.9 = 0.27
//   surfactant=true:   0.80 × foliarPhResponse(5.0) = 0.80 × 0.9 = 0.72
//
// Sulfate-dominant tank lands near pH 5.0; cuticle-uptake peak is pH
// 5.5-6.0, spray pH 5.0 sits at ~0.9 of peak. The cuticle-uptake
// mechanism doesn't differentiate by sulfate cation at this resolution
// — uniform across the 4 cation-micro oligos (Mn / Zn / Cu / Fe).
//
// Multiplier check: 0.72 / 0.27 = 2.67×, inside the 1.3-2× cuticle-
// penetration-with-surfactant band for non-systemic micros — the upper
// edge reflects yucca acting on coverage (retention × spread), not just
// penetration. Sentís et al. 2017 surfactant-assisted Mn cuticle
// penetration ratio 20 / 3 = 6.7× is the absorption axis only; our
// figure blends absorption + retention so 2.67× is conservative against
// the absorption-only ratio.
//
// Elements absent from the map:
//   B  — single-channel via fertigation (REQ-061; Solubore in the barrel).
//   Mo — retired from foliar 2026-05-16 (REQ-061 Mo carve-out). Molybdate
//        is anionic and fully available at our soil pH 7.4, so the foliar-
//        bypass argument that keeps cation micros here doesn't apply. Mo
//        moved to fertigation; the foliar spray no longer carries sodium
//        molybdate.
//
// Cert 3 — coverage constants (FOLIAR_COVERAGE_DEFAULT,
// FOLIAR_COVERAGE_WITH_YUCCA) are both cert 3; foliarPhResponse curve is
// cert 4. Effective cert min = 3. Refinement triggers in derivation.md:
// tissue panel ±20 % correlation bumps cert 3 → 4; surfactant-on regime
// needs its own tissue correlation since 0.80 isn't measured at Décembre.
function foliarEfficiency(surfactant) {
  const coverage = surfactant ? FOLIAR_COVERAGE_WITH_YUCCA : FOLIAR_COVERAGE_DEFAULT;
  // foliarPhResponse(5.0) ≈ 0.9 at the default spray tank pH; the
  // multiplier is the same regardless of surfactant.
  const sprayPhFactor = 0.9;
  const value = coverage * sprayPhFactor;
  return { Mn: value, Zn: value, Cu: value, Fe: value };
}
// Backwards-compatible default-regime alias used by callers that don't
// pass through the lever. Equivalent to foliarEfficiency(false). Kept
// to avoid breaking out-of-tree consumers; the lever-aware caller path
// goes through the function form.
const FOLIAR_EFFICIENCY_AT_CURRENT_CONDITIONS = foliarEfficiency(false);

// Tomato bed area in m². Derived from TOMATO_NUMBER_BEDS × TOMATO_BED_AREA
// (7 × 54.7 = 382.9 m²) — both declared earlier in app/index.html. We
// re-read those constants at consumer call time rather than freezing
// here, so a future bed reconfiguration only needs the upstream constants
// to update; computeFoliarSupply re-derives area on each call.
//
// (No constant declared at this scope — area is computed inline inside
// computeFoliarSupply; documented here for the spec's "AREA_M2" namespace
// key, which exposes the live value via the model.js wrapper.)

// REQ-115 — per-element burn cap (g per 15 L master tank).
// Per-element certainty (refinable when Décembre tissue + lesion log lands):
//   Fe / Mo / B — cert 3. Defensible mid-band of Sonneveld 2009, Yara
//   crop-nutrition foliar tables, university extension publications
//   (Cornell, U. Delaware, U. Missouri).
//   Cu — cert 2. Divergence BELOW extension mid-band. The 2 g value came
//   from a Décembre-internal observation on 2026-05-06 (Cu local-pool-
//   toxicity image triggered the halving from PA Taillon's original 4 g),
//   not from extension mid-band. Extension supports 0.05-0.1 % Cu solutions
//   = 7.5-15 g CuSO₄/15 L, several × Décembre's 2 g. Defensible by local
//   observation (cert 3 within Décembre); not transferable (cert 2 in
//   general — narrow Cu²⁺ enzyme-damage threshold).
//   Mn / Zn — cert 2. Divergence ABOVE extension mid-band. 22 g held since
//   the 2026-04-29 45 L → 15 L volume restructure (no Mn / Zn cut at the
//   2026-05-05 yucca drop — see `derivation.md` § historical-context).
//   No burn observed across Décembre Wednesday-AM operator timing window;
//   the 2026-05-16 Mn 22 → 18 / Zn 22 → 16 cap proposal lagged STORED
//   reality. Cap re-pinned 22 g 2026-05-17 to match live STORED. Cert 2
//   for transferability (Décembre Wednesday-AM window + Ca-saturated soil
//   regime + post-restructure concentration; not portable to ops at
//   different volumes / timing without their own observation period).
// Surfactant has no published effect on the burn-cap axis — yucca acts on
// coverage, not on max safe tank concentration; see learnings.md.
const BURN_CAP_BASE_G = {
  Mn: 22,   // MnSO₄ — Décembre-internal observation (held at 22 g post-restructure), cert 2
  Zn: 22,   // ZnSO₄ — Décembre-internal observation (held at 22 g post-restructure), cert 2
  Cu: 2,    // CuSO₄ — Décembre-internal observation (axil-pool toxicity), cert 2
  Fe: 80,   // FeSO₄·7H₂O — high-mass dose, well below tank-CE bound, cert 3
  Mo: 2,    // NaMoO₄ — wide tolerance (Sonneveld 50-200 mg/L band), cert 3
  B:  9,    // Solubore (Na₂B₈O₁₃·4H₂O, 20.5 % B) — non-ionic, cert 3
};

// REQ-115 — burn cap by element. Public via window.FoliarRecipeTomato.burnCapG.
function burnCapG(element) {
  return BURN_CAP_BASE_G[element] || 0;
}

// REQ-115 — per-element minimum dose floor (g per 15 L master tank).
// Sub-floor doses aren't reliably weighable on an organic-farm scale, so
// computeFoliarRecipeForGap clamps any ideal_g below the floor to 0
// rather than risk a 2-4× luxury feed for tiny-demand elements (Cu narrow
// toxicity is the load-bearing case — 0.2 g floor instead of 0.5 g keeps
// the algorithm from forcing 2.5× demand when ideal lands at 0.2 g). All
// values are cert 3 — operator weigh-scale resolution × per-element
// luxury-cap risk.
//
//   Mn / Zn / Fe / B — 0.5 g. Burn cap is the binding constraint, not
//     luxury (extension mid-band burn cap several × demand at floor).
//   Cu — 0.2 g. Narrow Cu²⁺ toxicity threshold; cert 2 burn-cap also
//     argues against forcing higher dose.
//   Mo — 0.1 g. Wide Sonneveld tolerance band (50-200 mg/L); tiny demand.
//     Retired from foliar 2026-05-16 (REQ-061 carve-out) but kept for
//     completeness in case Mo returns to foliar.
const MIN_DOSE_G_PER_ELEMENT = {
  Mn: 0.5,
  Zn: 0.5,
  Cu: 0.2,
  Fe: 0.5,
  Mo: 0.1,
  B:  0.5,
};
