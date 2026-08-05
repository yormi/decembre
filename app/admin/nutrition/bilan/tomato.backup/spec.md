# Tomate — shell (admin page chrome)

UI invariants for the Tomato Nutrition admin page chrome — header inputs
(target, solarPerGram, stage, recipeMode), light-limit
ceiling, recipe-mode toggle, drift block, single-source-of-truth read.
Per-block builder specs (plant-needs) live alongside the
corresponding subproject under `<subproject>/builder/user-stories.md`. Crop-side
recipe/biology specs in `nutrition/tomato/domain/spec.md`; chemistry / cross-crop
rules in `nutrition/spec.md`.

---

## header-inputs-four-scalars

**Statement:** The Bilan accepts exactly four operator inputs in the header
card: `target` (kg/m²/wk), `solarPerGram` (J/g, default 7), `stage`
(`T1`-`T5`), `recipeMode` (`fp`|`stored`). Every
other displayed number is derived from these + source-of-truth constants.
No `current` input — the page answers "what's needed at target", not
"what's needed given current canopy".

---

## light-ceiling-from-operator-j-per-g

**Statement:** The header surfaces
`lightCeiling_kg_m2_wk = (weekly_J_cm² ÷ (solarPerGram × 1000))`, where
`solarPerGram` is read from the `nutr-solar-per-gram` input (default 7).
When `target > ceiling`, the card shifts to a warning style (orange bg +
⚠ message). No hardcoded `7000` literal in the ceiling computation.

---

## fp-recipe-mode-locks-t5

**Statement:** When `recipeMode === 'fp'`, the stage selector is forced
to `T5`. Switching off T5 while in FP mode auto-reverts mode to `stored`.
The hash router persists `recipeMode` (third path segment) so reload
keeps mode + stage as a consistent pair. Default `recipeMode = 'fp'`.

---


## block-2-pool-maintenance

**Statement:** Block 2 (`#nutr-soil`) answers "how much to dose to keep
each soil pool healthy", not "how much the bank feeds the plant". Model:
`domain/soil-maintenance.md`, implemented in `window.PoolMaintenance`
(`nutrition/soil-contribution/pool-maintenance.js`). One row per
pool-forming element (`PoolMaintenance.POOL_FORMING_ELEMENTS` — K, P, Ca,
Mg, Mn, Zn, Cu), 5 columns:

1. **El.**
2. **Current (ppm)** — `bank_mg ÷ 200`.
3. **Optimal (ppm)** — fixed field band; **Mg is relational**,
   computed live from the Ca/K pools (`magnesiumWindowPpm`).
4. **To mid-band** — weeks for the pool to fall from current M3 to the
   **mid-band floor** at the removal rate (`weeksToMidBand`), i.e. the
   runway before a dose is due — not time to zero. `0` → "Reached"
   (already at/below mid-band, a build case). Reads QUANTITY, an upper
   bound (a locked-but-full pool starves the root first —
   `domain/nutrient-transport.md`).
5. **Min dose (mg/m²/week)** — control-law output (`maintenanceDose`):
   `0` when `pool@100d ≥ mid-band`; **build = removal × 1.25** when below
   floor (maintenance-anchored, no buffer coefficient); **K carries the
   intensity floor** (20% of removal) even when over-band, marked with a
   clickable **⚓** that opens the K-floor explanation modal. No chip on
   the build or reserve rows.

The gap-chain (`soilMg → gapAfterSoil`) that feeds Blocks 3-5 is computed
independently and unchanged. Mobile (N, B, Mo) + ungoverned Fe render in
the parked Block 2b (`#nutr-soil-mobile`): two columns, **El.** + **Weekly
removal (mg/m²/week)** (`demand[el]`) — the amount leaving the system, not
a dose. Fe and Mo are pinned to **0** with an inline note (Fe soil-over-
supplied; Mo amply available at pH ≥ 6) — the soil covers offtake, no weekly
replacement. Per-element dose rule for N + B is TBD (N front-load net of
mineralization, B tank ÷ efficiency).

---

## recipe-mode-toggle-fp-left-default-right

**Statement:** The recipe-mode toggle button order is
`[First principles] [Stockée]` (left → right). "First principles"
remains in English (term-of-art, deliberately not translated). Default
selected = `fp` ⇒ "First principles" highlighted on initial render. The
products-in-play list (`nutr-products`) is **removed** from the header —
per-block product names appear inline in each Block 1-5 card body
instead.

---

## bilan-reads-source-of-truth-recipes

**Statement:** The Bilan nutriments page (admin) MUST compute its supply
numbers by reading from the same constants/recipes that drive the
team-facing Fertigation, Foliaire, and Side-dressing pages. No duplicated
dose tables. If a recipe changes on a team-facing page, the Bilan reflects
it on next render with no separate edit.

**Scope today:**

| Source page | Source-of-truth constant | Bilan binding | Status |
|---|---|---|---|
| Fertigation tomate | `computeStageRecipe(stage)` | `calcNutrSupply` calls it directly | wired |
| Foliaire (single weekly spray) | `FOLIAR.tomato.A` (label strings) | `calcNutrSupply` reads it via `computeFoliarSupply` into `supply.total` — the foliar **block was removed 2026-07-18** (sprays retired), so it is no longer a displayed gap-chain station; the channel is still summed into the total + drives `FP_RECIPE_T5.foliar` for the operator drift page. | model-only |
| ~~Foliaire Spray B (CaCl₂ anti-BER)~~ | retired 2026-05-06 — Teris industrial-grade CaCl₂ Ecocert listing was unverified (nutrition — ecocert-only-products audit risk). BER prevention now via ventilation + humidity. | n/a | removed |
| Sol — engrais sol tomate (PA Taillon × 1,5) | `TOMATO_SIDEDRESS[stage]` — Actisol 5-3-2 + farine de plumes 13-0-0 g/planche/sem per stage | `calcNutrSupply` reads it; renders as Bilan Block 3 ("Engrais sol granulaire"). Note: soil page HTML displays the same numbers — currently hand-synced; ideal future state = HTML rendered from this constant. | wired |
| Export fruit tomate | `TOMATO_FRUIT_EXPORT` — g/kg fresh fruit, fruit-only nutrient export (no vegetative tissue). Yara fruit-vs-vegetative split (N/P/K 60%, Ca 5%, Mg 25%, micros 60% default) applied to whole-plant `TOMATO_REMOVAL`. Replaces `TOMATO_REMOVAL × yield` on the demand side (2026-05-04) so it doesn't double-count canopy growth already in `BIOMASS_DEMAND`. | `calcNutrDemand(yield, stage)` reads it directly: `fruit_mg = yield × TOMATO_FRUIT_EXPORT × 1000`. | wired |
| Demande végétative tomate (T1-T5) | `BIOMASS_DEMAND[stage]` — mg/m²/sem per element per stage (build-out of canopy, roots, trusses). Sources: Haifa F-144 stage program + Sonneveld/Voogt ratios. T4-T5 revised 2026-05-04 to represent the FULL ongoing canopy growth (no longer ~30%/15% of T3) since it's now paired with the fruit-only `TOMATO_FRUIT_EXPORT`. | `calcNutrDemand(yield, stage)` adds it on top of fruit export so T1-T3 (low/no fruit) shows real demand. Bilan Block 1 renders the total in bare mg (fruit + biomasse split lives in the pourquoi modal). | wired |

**Remaining clean-up on side-dress** (low priority, future work):

- Soil page HTML still hardcodes per-stage numbers; ideally renders from
  `TOMATO_SIDEDRESS` for true single source-of-truth. Hand-synced for now —
  edits to `TOMATO_SIDEDRESS` must mirror to soil page HTML.
- Manual drench (EZ-GRO Ocean) removed 2026-05-02. If reintroduced, add
  `TOMATO_DRENCH[stage]` + `supply.drench` in `calcNutrSupply` + Block 3b
  (or merge into Block 3) in the Bilan.

---

## stored-vs-computed-drift-block

Pour chaque élément affiché dans le bloc « Recette stockée vs calculée (drift) » de la page Nutrition tomate (admin, mode T5), le ratio rendu est `recette premiers principes ÷ recette stockée`. 100 % ⇒ stockée et FP coïncident ; > 100 % ⇒ la stockée sous-fournit la cible FP ; < 100 % ⇒ la stockée sur-fournit.
