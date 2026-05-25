# Tomate — shell (admin page chrome)

UI invariants for the Tomato Nutrition admin page chrome — header inputs
(target, solarPerGram, stage, phLocked, recipeMode), light-limit
ceiling, recipe-mode toggle, drift block, single-source-of-truth read.
Per-block builder specs (plant-needs, foliar) live alongside the
corresponding subproject under `<subproject>/builder/user-stories.md`. Crop-side
recipe/biology specs in `nutrition/tomato/spec.md`; chemistry / cross-crop
rules in `nutrition/spec.md`.

---

## REQ-104 — Header inputs are exactly five scalars

**Statement:** The Bilan accepts exactly five operator inputs in the header
card: `target` (kg/m²/wk), `solarPerGram` (J/g, default 7), `stage`
(`T1`-`T5`), `phLocked` (boolean), `recipeMode` (`fp`|`stored`). Every
other displayed number is derived from these + source-of-truth constants.
No `current` input — the page answers "what's needed at target", not
"what's needed given current canopy".

---

## REQ-105 — Light ceiling derived from operator-driven J/g

**Statement:** The header surfaces
`lightCeiling_kg_m2_wk = (weekly_J_cm² ÷ (solarPerGram × 1000))`, where
`solarPerGram` is read from the `nutr-solar-per-gram` input (default 7).
When `target > ceiling`, the card shifts to a warning style (orange bg +
⚠ message). No hardcoded `7000` literal in the ceiling computation.

---

## REQ-106 — FP recipe mode locks stage to T5

**Statement:** When `recipeMode === 'fp'`, the stage selector is forced
to `T5`. Switching off T5 while in FP mode auto-reverts mode to `stored`.
The hash router persists `recipeMode` (third path segment) so reload
keeps mode + stage as a consistent pair. Default `recipeMode = 'fp'`.

---

## REQ-107 — Recipe-mode toggle: First principles on the left, default

**Statement:** The recipe-mode toggle button order is
`[First principles] [Stockée]` (left → right). "First principles"
remains in English (term-of-art, deliberately not translated). Default
selected = `fp` ⇒ "First principles" highlighted on initial render. The
products-in-play list (`nutr-products`) is **removed** from the header —
per-block product names appear inline in each Block 1-5 card body
instead.

---

## REQ-004 — Bilan reads from source-of-truth recipes

**Statement:** The Bilan nutriments page (admin) MUST compute its supply
numbers by reading from the same constants/recipes that drive the
team-facing Fertigation, Foliaire, and Side-dressing pages. No duplicated
dose tables. If a recipe changes on a team-facing page, the Bilan reflects
it on next render with no separate edit.

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

**Remaining clean-up on side-dress** (low priority, future work):

- Soil page HTML still hardcodes per-stage numbers; ideally renders from
  `TOMATO_SIDEDRESS` for true single source-of-truth. Hand-synced for now —
  edits to `TOMATO_SIDEDRESS` must mirror to soil page HTML.
- Manual drench (EZ-GRO Ocean) removed 2026-05-02. If reintroduced, add
  `TOMATO_DRENCH[stage]` + `supply.drench` in `calcNutrSupply` + Block 3b
  (or merge into Block 3) in the Bilan.

---

## REQ-153 — Bloc « Recette stockée vs calculée (drift) » : ratio FP / Stockée

Pour chaque élément affiché dans le bloc « Recette stockée vs calculée (drift) » de la page Nutrition tomate (admin, mode T5), le ratio rendu est `recette premiers principes ÷ recette stockée`. 100 % ⇒ stockée et FP coïncident ; > 100 % ⇒ la stockée sous-fournit la cible FP ; < 100 % ⇒ la stockée sur-fournit.
