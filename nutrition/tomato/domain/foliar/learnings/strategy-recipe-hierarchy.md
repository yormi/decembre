# Strategy contains recipes — two-level domain hierarchy

**Date:** 2026-05-24
**Status:** accepted

The foliar subproject was renamed `foliar-recipe/` → `foliar-strategy/`
because today's model handles one tank's mix (Block 5 oligo)
but Test 1 Path B adds a Ca recipe that **cannot share a tank
with the oligo mix** (Ca²⁺ × SO₄²⁻ → gypsum, in-tank-ksp-precipitation-guard). Two
recipes per stage today; more later (biofungicide is the
likely third).

The subproject directory name should describe its contents.
`foliar-recipe/` (singular) implied one recipe per subproject;
the multi-recipe reality forced one of three shapes.

## Considered

| Shape | Result |
|---|---|
| **A. Sibling `foliar-ca-recipe/`** — one subproject per recipe | Cuticle coverage, surfactant ratio, in-tank-ksp-precipitation-guard incompatibility, leaf-tolerance cap are all *the same physics regardless of which ions are in the tank*. Forking two subprojects forces the physics to live in two places (or hoist to `nutrition/chemistry/`, then forks the model too). |
| **B. Rename to `foliar-strategy/` — one subproject, many recipes** | Domain shape: one strategy per crop, many recipes per strategy. Physics lives once. Model contract changes — every consumer sees a list where they saw a scalar. **Picked.** |
| **C. Keep `foliar-recipe/`, accept term overload** | Directory name connotes "the foliar subproject"; domain term means "one tank's mix". Two senses of "recipe". Saves rename churn (~20-30 cross-refs); pays back daily in confusion. |

## Why B

The physics doesn't change by ion. Generalizing the model once
costs a contract change today and zero cost on the third tank
(biofungicide). Sibling-per-recipe duplicates the same physics
across N subprojects.

## Consequences

- Subproject directory renamed (~30 cross-refs swept this PR).
- JS namespace symbol `window.FoliarRecipeTomato` NOT renamed
  in this PR — that's coder-lane follow-up. Naming drift between
  directory (foliar-strategy/) and namespace (FoliarRecipe…) is
  flagged for next coder pass.
- STORED key `STORED_RECIPE.tomato.foliaire` unchanged (Guillaume's
  lane via `/retire-recipe`).
- See sibling [[frequency-as-model-output]] and
  [[close-gap-bounded-by-leaf-tolerance-cap]] for the
  model-shape decisions that flow from this.
