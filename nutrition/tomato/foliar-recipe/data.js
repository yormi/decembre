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

// Cuticle-coverage efficiency without surfactant. Cert 4 — cuticle-uptake
// literature midpoint of 25-40 % range for sulfate micros without yucca,
// confirmed at Décembre via the Cu local-pool toxicity image (2026-05-05)
// implying ~30 % effective uptake at the rest of the leaf surface.
//
// REQ-101 reads this to compute delivered = recipe_g × element_pct ×
// 1000 / area × FOLIAR_COVERAGE_DEFAULT.
const FOLIAR_COVERAGE_DEFAULT = 0.30;

// With-yucca coverage; cert 4 — surfactant-assisted droplet spread +
// cuticle wetting jumps real uptake to 70-85 % (literature). Currently
// not consumed by computeFoliarSupply (yucca dropped 2026-05-05, not on
// order); exposed for future toggle code if/when yucca returns. The
// spec's biggest single refinement trigger.
const FOLIAR_COVERAGE_WITH_YUCCA = 0.80;

// Tomato bed area in m². Derived from TOMATO_NUM_BEDS × TOMATO_BED_AREA
// (7 × 54.7 = 382.9 m²) — both declared earlier in app/index.html. We
// re-read those constants at consumer call time rather than freezing
// here, so a future bed reconfiguration only needs the upstream constants
// to update; computeFoliarSupply re-derives area on each call.
//
// (No constant declared at this scope — area is computed inline inside
// computeFoliarSupply; documented here for the spec's "AREA_M2" namespace
// key, which exposes the live value via the model.js wrapper.)

// REQ-115 — per-element burn cap (g per 15 L master tank).
// Conservative mid-band foliar guidance (Sonneveld 2009, Yara crop nutrition
// foliar tables, university extension publications: Cornell, U. Delaware,
// U. Missouri). Cert 3 — refinable when Décembre tissue + lesion log lands.
// TODO when tissue + lesion data lands: revisit per-element values with
// observed Décembre headroom (Cu narrow, Fe wide). Surfactant has no
// published effect on the burn-cap axis — yucca acts on coverage, not on
// max safe tank concentration; see learnings.md.
const BURN_CAP_BASE_G = {
  Mn: 18,   // MnSO₄ — conservative organic-greenhouse mid-band
  Zn: 16,   // ZnSO₄
  Cu: 2,    // CuSO₄ — narrow toxicity threshold (Cu²⁺ enzyme damage)
  Fe: 80,   // FeSO₄·7H₂O — high-mass dose, well below tank-CE bound
  Mo: 1,    // NaMoO₄ — wide tolerance; seldom binding
  B:  9,    // Solubore (boric acid) — non-ionic
};

// REQ-115 — burn cap by element. Public via window.FoliarRecipeTomato.burnCapG.
// `_surfactant` parameter kept for caller-side API symmetry; surfactant has no
// effect on burn cap (coverage axis only — see learnings.md).
function burnCapG(element, _surfactant) {
  return BURN_CAP_BASE_G[element] || 0;
}
