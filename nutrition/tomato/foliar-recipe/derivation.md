# Tomate — foliar-recipe · derivation

How the model is built. The **spec** (what it must do or be) is in
`spec.md`. This file is everything else: framing of foliar as
burn-cap-constrained vs mass-balance-derived, why coverage is 30 %
without yucca, what dropping yucca cost the per-element delivery,
delivered-vs-demand at T5, refinement triggers, implementation map.

---

## Framing — burn-cap-constrained, not mass-balance-derived

Sidedress and fertigation are *flux-driven*: the model takes a demand,
subtracts upstream supply, and computes the dose that fills the gap
under the chosen product's chemistry. Demand goes up, dose goes up.

Foliar **doesn't work that way** at Décembre. Three constraints pin
the dose from above, not from demand:

1. **Salt burn on leaf surface** (REQ-025 cross-crop). Every gram added
   to the 15 L master tank pushes total CE; the cuticle scorches above
   ~10 mS/cm for tomato.
2. **Local-pool toxicity without surfactant** (audit Finding,
   2026-05-05). Without yucca, droplets bead and runoff concentrates in
   leaf-axil pools; effective Cu in those pools climbed ~150-200 ppm
   even at modest tank loads, producing the dark-spot toxicity image
   that triggered the 4 → 2 g Cu cut. Mn / Zn similarly capped at
   18-22 g/15 L by toxicity headroom, not by demand.
3. **Cuticle absorption ceiling**. Even within burn-safe doses,
   uptake plateaus once leaf surface is saturated. The 30 % coverage
   value (REQ-101) already builds in saturation losses; pushing dose
   further mostly adds runoff, not uptake.

So the "first-principles foliar dose" is essentially equal to the
stored recipe — both are pinned at the maximum dose that doesn't burn
or pool-tox the cuticle, then delivery is whatever cuticle can carry
out of that dose. `FP_RECIPE_T5.foliaire` mirrors
`STORED_RECIPE.tomato.foliaire` for that reason; the subproject
*models the delivery* under coverage rather than *deriving the dose*
from demand.

What the model DOES validate:

- The delivered mg/m²/wk per element under coverage discount sits in a
  band of demand (REQ-013/014 supply bound from `nutrition/tomato/spec.md`).
  Mn delivered at ~60 % of demand is acknowledged as an under-fert that
  yucca restoration would fix; Zn at ~100 %, Fe at ~95 %, Cu at ~25 %
  (toxicity-capped, accept the gap until yucca is on order).

---

## Coverage — why 0.30 without yucca

Cuticle-uptake literature spans 25-40 % efficiency for sulfate
micronutrient sprays without surfactant on tomato/cucurbit foliage
(field-spread to retention to penetration, all stacked). 30 % is the
midpoint, cert 4 — observed at Décembre via the Cu-toxicity feedback
(local pooling concentrating ~3-4× the tank concentration on the leaf
implies ~30 % of label dose is the real uptake at the rest of the leaf
surface). With yucca surfactant, the same literature jumps to 70-85 %
(droplet-spread + cuticle-wetting agent acting together); we'd pin at
`FOLIAR_COVERAGE_WITH_YUCCA = 0.80` if/when yucca returns to the
program.

The constants live in `data.js`:

```js
const FOLIAR_COVERAGE_DEFAULT     = 0.30;  // no yucca; cert 4
const FOLIAR_COVERAGE_WITH_YUCCA  = 0.80;  // surfactant-assisted; cert 4
```

`computeFoliarSupply(stage)` reads `FOLIAR_COVERAGE_DEFAULT` directly;
the with-yucca constant is exposed for future toggle code but not
currently consumed.

---

## What dropping yucca cost — historical context

Decision 2026-05-05: yucca surfactant dropped from program (not on
order, supply-chain timeline). The spray was simultaneously rebalanced
to stay burn-safe at the lower dispersion regime:

| Element | Before yucca dropped | After   | Cut       | Reason                                                    |
|---------|----------------------|---------|-----------|-----------------------------------------------------------|
| Cu      | 4 g/15 L             | 2 g/15 L | -50 %    | Cu local-pool toxicity image (dark spots in axils)        |
| Mn      | 22 g/15 L            | 18 g/15 L | -18 %   | Burn-cap headroom                                         |
| Zn      | 22 g/15 L            | 16 g/15 L | -27 %   | Burn-cap headroom                                         |
| Fe      | 80 g/15 L (FeSO₄)    | 80 g/15 L | =       | Held — Fe headroom large, no toxicity signal              |
| Solubore| 7 g/15 L             | 7 g/15 L  | =       | Held; later moved fully to fertigation 2026-05-08         |
| Mo Na   | 1 g/15 L             | 1 g/15 L  | =       | Held; wide tolerance                                      |

So the no-yucca regime cost the program ~30 % effective Cu, ~20 % Mn,
~25 % Zn at the dose level — *on top of* the coverage discount going
0.80 → 0.30. Combined effect: Mn, Zn, Cu effective uptake dropped to
~25-30 % of what the with-yucca recipe at original doses delivered.
RECIPE_HISTORY captures the 2026-05-05 retirement entry verbatim.

---

## Per-element delivered mg/m²/wk vs demand at T5

`computeFoliarSupply('T5')` numerical output, current STORED recipe
(post-2026-05-05 cuts), area = 382.9 m², coverage = 0.30:

| Element | Recipe g | Element % | Raw mg/m²/wk | × Coverage | Delivered mg/m²/wk | Demand T5 mg/m²/wk | % demand |
|---------|---------:|----------:|-------------:|-----------:|-------------------:|-------------------:|---------:|
| Mn      | 22       | 31.5 %    | 18.1         | × 0.30     | 5.4                | ~9                 | ~60 %    |
| Zn      | 22       | 35.5 %    | 20.4         | × 0.30     | 6.1                | ~6                 | ~100 %   |
| Cu      | 2        | 25.0 %    | 1.31         | × 0.30     | 0.39               | ~1.6               | ~25 %    |
| Mo      | 1        | 39.6 %    | 1.03         | × 0.30     | 0.31               | ~0.3               | ~100 %   |
| Fe      | 80       | 20.0 %    | 41.8         | × 0.30     | 12.5               | ~13                | ~95 %    |
| B       | 7        | 20.5 %    | 3.74         | × 0.30     | 1.12               | (in fertigation)   | n/a      |

(Demand values from `BIOMASS_DEMAND.T5` + `TOMATO_FRUIT_EXPORT × 1.5
kg/m²/wk` — see `nutrition/tomato/plant-needs/derivation.md`.)

Mn and Cu are the standing under-fert calls. The yucca-restoration
trigger fixes both: Mn would jump 5.4 → ~14 mg/m²/wk (~155 % demand,
back into safe luxury), Cu 0.4 → ~1.0 mg/m²/wk (~65 % demand, Cu still
toxicity-headroom-bound). Zn / Fe / Mo would over-supply slightly, but
all three sit safely within REQ-014's 1.3× luxury cap.

Solubore in foliar = 0 in the FP_RECIPE_T5 table — fertigation
exclusively owns B since 2026-05-08 (single-channel design, REQ-061
ordering). Stored recipe still carries Solubore 7 g for legacy
operational reasons; on next /retire-recipe pass it can be zeroed
without changing real B delivery (fertigation 9 g Solubore covers
demand).

---

## No-macro by design

The foliar output schema carries N / P / K / Ca / Mg as explicit zeros.
Each macro has a chemistry or physiology reason it can't be a viable
foliar channel:

- **N**: urea burns leaves; NO₃⁻ uptake by cuticle is ~0 (charged ion
  on hydrophobic surface). Foliar N at agronomically meaningful rates
  is impossible.
- **P**: cuticle barrier to phosphate ~5-15 %; in tank with Ca²⁺ from
  any source, immediate Ca-phosphate precipitation. Always failed
  REQ-018's 5 % effective floor in tomato spray pH. Single-channel
  fertigation owns P (well, conceptually — at pH 7.4 P is locked
  everywhere; bank scavenging via root exudates is the active strategy).
- **K**: cuticle uptake ~5 %, plant K demand at 6 g/m²/wk would need
  ~120 g elemental K in the tank. Hits both burn cap and tank-volume
  limits before useful uptake.
- **Ca**: Spray B (CaCl₂) was the historical foliar Ca channel for BER
  prevention; retired 2026-05-06 (Ecocert listing of Teris
  industrial-grade CaCl₂ couldn't be verified). BER now managed by
  ventilation + humidity control. Foliar Ca = 0 in current recipe.
- **Mg**: cuticle uptake low (~10 %) and competition with Ca/K; not
  worth the burn-cap headroom in a tank already loaded with sulfate
  micros. Fertigation MgSO₄ + compost residual cover demand.

The schema keeps all 11 elements (matching `TOMATO_FRUIT_EXPORT`) so
the supply chain code stays uniform; macro values being zero means
foliar contributes nothing to those rows in the Bilan, exactly as
intended.

---

## Caveats and known limitations

- **Stage-invariant recipe.** The current STORED foliar recipe is the
  same dose at T1-T5 (PA Taillon design — oligos are tissue-baseline
  anchored, not yield-scaled). `computeFoliarSupply(stage)` plumbs
  `stage` through anyway so the contract matches sidedress / fertigation
  siblings. A future per-stage spray (e.g. Mn ramp at flowering) would
  land here without changing call sites.
- **Coverage discount is global, not per-element.** In reality, larger
  cations (Cu²⁺) might penetrate the cuticle slightly differently from
  monovalent (Na molybdate). The 30 % blanket factor is a simplification;
  the dominant effect is droplet retention, which is product-agnostic.
  Per-element coverage tuning is a refinement for if/when tissue test
  data points to one element drifting.
- **No spray-pH multiplier here.** REQ-055's `foliarPhResponse(tankPh)`
  is a separate axis — captured in `effectiveEff` for the foliar
  channel inside `app/index.html`. The coverage discount in REQ-101
  is the *non*-pH part. Combining: real_uptake = label_dose × element_pct
  × coverage × foliarPhResponse(tankPh). Current spray pH ~5.0
  (sulfate-dominant) → `foliarPhResponse(5.0) ≈ 0.9`, so the
  pH-multiplier shaves another ~10 % on top of coverage. The 30 %
  number in this subproject is the coverage axis only.
- **Burn cap depends on water hardness + temp.** REQ-025's
  `FOLIAR_BURN_CAP_TOMATO = 10 mS/cm` is conservative across summer GH
  conditions. Cold-morning sprays get 1-2 mS/cm headroom; hot-afternoon
  sprays could burn closer to 8 mS/cm. Operator timing (Wednesday AM)
  pins the safer end.
- **No pH coupling.** Soil pH crisis doesn't change foliar delivery —
  cuticle uptake bypasses root chemistry. That's the whole point of the
  channel during the current crisis. When sulfur drops soil pH and
  fertigation Mn / Zn / Fe come back online (REQ-018 efficiency lifts),
  foliar moves from primary to backup, and these doses can come down
  proportionally.

---

## Refinement triggers

Update the model when:

- **Yucca decision flips.** `FOLIAR_COVERAGE_DEFAULT` 0.30 → 0.80;
  STORED doses simultaneously rebalanced via `/retire-recipe` (Cu 2 → 4
  g, Mn 18 → 22 g, Zn 16 → 22 g back to pre-2026-05-05 levels).
  Verifier pinch points: REQ-101 still passes (formula unchanged),
  REQ-025 needs re-checked at the higher Mn / Zn / Cu doses.
- **Tissue test reveals per-element drift.** Petiole micros land
  ~2026-05-12. If Mn, Zn, Fe come in within deficit-tolerance bands,
  the 30 % coverage assumption is validated at our scale; if not,
  refit (likely 25 % rather than 30 %). Cu is toxicity-bound at the
  recipe level, less coverage-sensitive.
- **Solubore moved fully to fertigation.** Already done conceptually
  (`FP_RECIPE_T5.foliar.Solubore = 0`); STORED recipe still carries
  Solubore 7 g for legacy. Next /retire-recipe pass should zero it —
  delivers ~1.1 mg B/m²/wk via foliar today, fertigation 9 g Solubore
  delivers ~4.8 mg B/m²/wk = full demand alone.
- **Soil pH drops below 7.0.** Sulfate-metal fertigation (FeSO₄, MnSO₄,
  ZnSO₄ in barrel) becomes viable. Foliar moves from primary to
  insurance — recipe loads can cut 50-70 %. The model doesn't
  auto-trigger this, but the verifier should surface it: if
  `effectiveEff(MnSO4, fertigation, currentSoilPh) ≥ 0.05`, REQ-018
  passes for fertigation Mn, and the operator decision lands in
  `/retire-recipe`.
- **Spray B reintroduces foliar Ca.** If BER persists despite
  ventilation control, foliar CaCl₂ at event-driven cadence would
  return — reactivates `foliar.Ca` row in `computeFoliarSupply`'s
  output. Verify REQ-029 Ca²⁺ × PO₄³⁻ separation (no co-mix with any
  P-bearing tank) and REQ-022 (find Ecocert-listed CaCl₂ first).

---

## Implementation map

| File                                                | Owns                                                               |
|-----------------------------------------------------|--------------------------------------------------------------------|
| `nutrition/tomato/foliar-recipe/data.js`            | `FOLIAR_COVERAGE_DEFAULT`, `FOLIAR_COVERAGE_WITH_YUCCA`, `FOLIAR_AREA_M2` (derived from `TOMATO_NUM_BEDS × TOMATO_BED_AREA`) |
| `nutrition/tomato/foliar-recipe/calc.js`            | `computeFoliarSupply(stage)`                                       |
| `nutrition/tomato/foliar-recipe/model.js`           | `window.FoliarRecipeTomato` namespace wrapper                      |
| `nutrition/tomato/foliar-recipe/spec.md`            | Spec — what the model must do or be                                |
| `nutrition/tomato/foliar-recipe/derivation.md`      | This file                                                          |

`app/index.html` includes them in dependency order: AFTER plant-needs
(needs `BIOMASS_DEMAND`, `TOMATO_FRUIT_EXPORT` for derivation cross-ref;
the function itself doesn't read demand), AFTER `STORED_RECIPE` (needs
`STORED_RECIPE.tomato.foliaire.A`), AFTER `PRODUCT_PCT` (needs
`MnSO4_Mn`, `ZnSO4_Zn`, `FeSO4_Fe`, etc.), AFTER `TOMATO_NUM_BEDS` /
`TOMATO_BED_AREA`. Order: `data.js` → `calc.js` → `model.js`. Consumers
(`calcNutrSupply`, "Recette proposée" admin card) reach for
`window.FoliarRecipeTomato.computeFoliarSupply(stage)`.

The current `calcNutrSupply` foliar block in `app/index.html`
(~line 4604-4645) is rewritten to delegate to
`computeFoliarSupply(stage)` for the stored-mode path. The FP-mode
path still reads `FP_RECIPE_T5.foliar` inline (the FP target IS the
stored values for foliar — same dose, same coverage, same delivery —
so a single fp-vs-stored comparison stays meaningful for the Block 7
drift gauge).
