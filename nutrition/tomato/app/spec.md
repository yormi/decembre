# Nutrition — tomate — app UI specs

UI invariants for the Tomato Nutrition admin page (Bilan, Block 1-7
mass-balance flow, drift gauge thresholds, recipe-source toggle behavior).
Crop-side recipe/biology specs live in `nutrition/tomato/spec.md`;
chemistry / cross-crop rules in `nutrition/spec.md`.

---

## REQ-004 — Bilan reads from source-of-truth recipes

**Statement:** The Bilan nutriments page (admin) MUST compute its supply
numbers by reading from the same constants/recipes that drive the
team-facing Fertigation, Foliaire, and Side-dressing pages. No duplicated
dose tables. If a recipe changes on a team-facing page, the Bilan reflects
it on next render with no separate edit.

**Rationale:** Two copies of a dose table inevitably drift. When they
drift, the Bilan lies — which is worse than not having it. The team
adjusts recipes on the operational pages; the Bilan is downstream.

**Scope today:**

| Source page | Source-of-truth constant | Bilan binding | Status |
|---|---|---|---|
| Fertigation tomate | `computeStageRecipe(stage)` | `calcNutrSupply` calls it directly | wired |
| Foliaire (single weekly spray) | `FOLIAR.tomato.A` (label strings, e.g., `"22 g"`) | `calcNutrSupply` parses the label strings | wired |
| ~~Foliaire Spray B (CaCl₂ anti-BER)~~ | retired 2026-05-06 — Teris industrial-grade CaCl₂ Ecocert listing was unverified (REQ-002 audit risk). BER prevention now via ventilation + humidity. | n/a | removed |
| Sol — engrais sol tomate (PA Taillon × 1,5) | `TOMATO_SIDEDRESS[stage]` — Actisol 5-3-2 + farine de plumes 13-0-0 g/planche/sem per stage | `calcNutrSupply` reads it; renders as Bilan Block 3 ("Engrais sol granulaire"). Note: soil page HTML displays the same numbers — currently hand-synced; ideal future state = HTML rendered from this constant. | wired |
| Export fruit tomate | `TOMATO_FRUIT_EXPORT` — g/kg fresh fruit, fruit-only nutrient export (no vegetative tissue). Yara fruit-vs-vegetative split (N/P/K 60%, Ca 5%, Mg 25%, micros 60% default) applied to whole-plant `TOMATO_REMOVAL`. Replaces `TOMATO_REMOVAL × yield` on the demand side (2026-05-04) so it doesn't double-count canopy growth already in `BIOMASS_DEMAND`. | `calcNutrDemand(yield, stage)` reads it directly: `fruit_mg = yield × TOMATO_FRUIT_EXPORT × 1000`. | wired |
| Demande végétative tomate (T1-T5) | `BIOMASS_DEMAND[stage]` — mg/m²/sem per element per stage (build-out of canopy, roots, trusses). Sources: Haifa F-144 stage program + Sonneveld/Voogt ratios. T4-T5 revised 2026-05-04 to represent the FULL ongoing canopy growth (no longer ~30%/15% of T3) since it's now paired with the fruit-only `TOMATO_FRUIT_EXPORT`. | `calcNutrDemand(yield, stage)` adds it on top of fruit export so T1-T3 (low/no fruit) shows real demand. Bilan Block 1 renders fruit + biomasse breakdown. | wired |
| Sol — programme soufre | inline in `<div id="page-sol-content">` HTML | **not consumed by the Bilan directly** — pH is a checkbox input (`nutr-phlocked`), not a calculated supply. The soufre schedule is operational, not a nutrient flux. | n/a |

**Verification:** `check-requirements.sh` greps `index.html` to confirm the
Bilan supply function references the source constants. If a future edit
inlines a duplicate value or stops reading from the source, the positive
checks fail. Patterns currently checked:

- `computeStageRecipe\(stage\)` (Bilan calls the stage-recipe function)
- `FOLIAR\.tomato\.A` (Bilan reads weekly spray)
- `TOMATO_SIDEDRESS\[stage\]` (Bilan reads granular side-dress)
- `BIOMASS_DEMAND\[stage\]` (Bilan reads vegetative-stage demand)
- `TOMATO_FRUIT_EXPORT\[el\]` (Bilan reads fruit-only export per kg fruit)

Negative check (no hardcoded duplicate of stage recipe values inside
the Bilan section) is left as manual review — too brittle to grep.

**Remaining clean-up on side-dress** (low priority, future work):

- The soil page HTML still hardcodes the per-stage numbers; ideally it should
  render from `TOMATO_SIDEDRESS` so there's truly ONE source-of-truth. For
  now, hand-synced. If you edit `TOMATO_SIDEDRESS`, also edit the soil page
  HTML — both must match.
- Manual drench (EZ-GRO Ocean) was removed from the program 2026-05-02. If
  reintroduced, add a `TOMATO_DRENCH[stage]` constant + `supply.drench` in
  `calcNutrSupply` + a Block 3b (or merge into Block 3) in the Bilan.
