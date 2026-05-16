# Tomate — foliar-recipe · derivation

How the model is built. Spec in `spec.md`. Rejected alternatives and
historical hold/decision detail in `learnings.md`.

---

## Framing — burn-cap-constrained, not mass-balance-derived

Foliar dose is pinned from above by three constraints, not by demand:

1. **Salt burn on leaf surface** (REQ-025 cross-crop). Cuticle scorches
   above ~10 mS/cm tomato.
2. **Local-pool toxicity without surfactant** (audit, 2026-05-05).
   Without yucca, droplets bead; runoff concentrates in leaf axils. Cu
   axil-pool reached ~150-200 ppm → 4 → 2 g cut. Mn / Zn capped at
   18-22 g/15 L by toxicity headroom.
3. **Cuticle absorption ceiling**. Uptake plateaus once leaf surface
   saturates; REQ-101's 30 % coverage already accounts for it.

`FP_RECIPE_T5.foliaire` mirrors `STORED_RECIPE.tomato.foliaire` —
subproject *models the delivery* under coverage, doesn't *derive the
dose* from demand.

Model validates: delivered mg/m²/wk per element sits inside REQ-013/014
demand band (`nutrition/tomato/spec.md`). Mn ~60 %, Zn ~100 %, Fe ~95 %,
Cu ~25 % (Cu toxicity-capped; gap accepted until yucca returns).

---

## Coverage — why 0.30 without yucca

Cuticle-uptake literature: 25-40 % efficiency for sulfate micronutrient
sprays without surfactant on tomato/cucurbit foliage (field-spread ×
retention × penetration stacked). 30 % = midpoint, **cert 3** — working
mid-band assumption, not measured at Décembre.

Cu axil-pool toxicity image measures retention × runoff geometry, not
surface coverage. Sentís et al. *Crop Protection* 2017 reports tomato
cuticle Mn penetration ~3 % without surfactant — absorption axis,
distinct from retention. 30 % blends the two without separating them;
no tissue test correlates predicted to measured uptake yet.

Two uncertainty bands. Confidence axis: 25-40 % literature range is
~1.6× wide; cert 3 reflects working assumption inside it. Value axis:
~10× wide — if Sentís ceiling governs, `FOLIAR_COVERAGE_DEFAULT` refits
to ~0.03. Hold at 0.30 per `learnings.md` (single-cultivar study;
25-40 % mid-band defensible without contrary measurement). Downward
trigger named in refinement triggers below.

With yucca: 70-85 % literature; would pin
`FOLIAR_COVERAGE_WITH_YUCCA = 0.80` if surfactant returns. Same evidence
base; B2' downgrade pending in parallel.

```js
const FOLIAR_COVERAGE_DEFAULT     = 0.30;  // no yucca; cert 3
const FOLIAR_COVERAGE_WITH_YUCCA  = 0.80;  // surfactant-assisted; cert 4 (B2' downgrade pending)
```

`computeFoliarSupply(stage)` reads `FOLIAR_COVERAGE_DEFAULT`; with-yucca
constant exposed for future toggle, not currently consumed.

---

## Channel efficiency map (REQ-157)

`window.FoliarRecipeTomato.efficiency` (REQ-157) declares the per-element
delivery fraction at current no-yucca regime and default spray tank pH.

Formula: `efficiency = FOLIAR_COVERAGE_DEFAULT × foliarPhResponse(sprayPh)`
= `0.30 × foliarPhResponse(5.0)`
= `0.30 × 0.9`
= `0.27` uniform across Mn / Zn / Cu / Fe / Mo.

Sulfate-based oligo sprays land near pH 5.0 (cuticle-uptake peak is pH
5.5-6.0 per the `foliarPhResponse` curve); spray pH 5.0 sits at ~0.9 of
the peak. The cuticle-uptake mechanism doesn't differentiate by sulfate
cation at this resolution, so a single 0.27 value covers the six oligo
elements.

B (Solubore) is absent from the map — REQ-061 single-channel design
routes B via fertigation, not foliar. If foliar B returns (yucca-back
or spray-B-back scenarios), add `B: 0.27` to the map.

**Cert 3** — `FOLIAR_COVERAGE_DEFAULT` is cert 3 (B2 downgrade 2026-05-12,
no Décembre tissue correlation yet); `foliarPhResponse` curve is cert 4.
Effective cert min = 3. Refinement triggers:

- **Tissue panel ±20 % correlation** → cert 3 → 4 per element.
- **Yucca returns** → coverage flips 0.30 → 0.80, efficiency map updates
  to 0.72 in lockstep.
- **Sentís ceiling regime** (downward, ×0.10 ratio in tissue) → coverage
  collapses to ~0.03; efficiency drops to ~0.027 (channel becomes
  insurance-only pending soil-pH drop).

---

## What dropping yucca cost — historical context

Decision 2026-05-05: yucca dropped (supply-chain). Spray rebalanced for
burn safety at lower dispersion:

| Element | Before yucca dropped | After   | Cut       | Reason                                                    |
|---------|----------------------|---------|-----------|-----------------------------------------------------------|
| Cu      | 4 g/15 L             | 2 g/15 L | -50 %    | Cu local-pool toxicity image (dark spots in axils)        |
| Mn      | 22 g/15 L            | 18 g/15 L | -18 %   | Burn-cap headroom                                         |
| Zn      | 22 g/15 L            | 16 g/15 L | -27 %   | Burn-cap headroom                                         |
| Fe      | 80 g/15 L (FeSO₄)    | 80 g/15 L | =       | Held — Fe headroom large, no toxicity signal              |
| Solubore| 7 g/15 L             | 7 g/15 L  | =       | Held; later moved fully to fertigation 2026-05-08         |
| Mo Na   | 1 g/15 L             | 1 g/15 L  | =       | Held; wide tolerance                                      |

Net effect at dose level: ~30 % Cu, ~20 % Mn, ~25 % Zn — on top of
0.80 → 0.30 coverage drop. Combined: Mn / Zn / Cu effective uptake
~25-30 % of with-yucca + original-dose regime. RECIPE_HISTORY captures
the 2026-05-05 retirement entry verbatim.

---

## Per-element delivered mg/m²/wk vs demand at T5

`computeFoliarSupply('T5')`, current STORED (post-2026-05-05),
area = 382.9 m², coverage = 0.30:

| Element | Recipe g | Element % | Raw mg/m²/wk | × Coverage | Delivered mg/m²/wk | Demand T5 mg/m²/wk | % demand |
|---------|---------:|----------:|-------------:|-----------:|-------------------:|-------------------:|---------:|
| Mn      | 22       | 31.5 %    | 18.1         | × 0.30     | 5.4                | ~9                 | ~60 %    |
| Zn      | 22       | 35.5 %    | 20.4         | × 0.30     | 6.1                | ~6                 | ~100 %   |
| Cu      | 2        | 25.0 %    | 1.31         | × 0.30     | 0.39               | ~1.6               | ~25 %    |
| Mo      | 1        | 39.6 %    | 1.03         | × 0.30     | 0.31               | ~0.3               | ~100 %   |
| Fe      | 80       | 20.0 %    | 41.8         | × 0.30     | 12.5               | ~13                | ~95 %    |
| B       | 7        | 20.5 %    | 3.74         | × 0.30     | 1.12               | (in fertigation)   | n/a      |

(Demand from `BIOMASS_DEMAND.T5` + `TOMATO_FRUIT_EXPORT × 1.5 kg/m²/wk` —
see `nutrition/tomato/plant-needs/derivation.md`.)

Mn + Cu are the standing under-fert calls. Yucca restoration: Mn
5.4 → ~14 mg/m²/wk (~155 % demand), Cu 0.4 → ~1.0 (~65 %, still
toxicity-bound). Zn / Fe / Mo over-supply slightly, all under REQ-014's
1.3× luxury cap.

Solubore in foliar = 0 in `FP_RECIPE_T5` — fertigation owns B since
2026-05-08 (REQ-061 single-channel). STORED still carries 7 g for legacy;
next `/retire-recipe` can zero (fertigation 9 g Solubore covers demand).

---

## No-macro by design

Schema carries N / P / K / Ca / Mg as explicit zeros:

- **N**: urea burns; NO₃⁻ cuticle uptake ~0 (charged ion on hydrophobic
  surface).
- **P**: cuticle barrier ~5-15 %; Ca-phosphate precipitation in tank.
  Fails REQ-018's 5 % effective floor in spray pH. Fertigation owns P.
- **K**: cuticle ~5 %; 6 g/m²/wk demand → ~120 g elemental K in tank.
  Hits burn cap + tank-volume limits before useful uptake.
- **Ca**: Spray B (CaCl₂) retired 2026-05-06 (Teris industrial-grade
  Ecocert listing unverifiable). BER now managed by ventilation + humidity.
- **Mg**: cuticle ~10 %; competes with Ca/K; burn-cap headroom too
  costly. Fertigation MgSO₄ + compost residual cover demand.

Schema keeps all 11 elements (matching `TOMATO_FRUIT_EXPORT`) so supply
chain stays uniform.

---

## Caveats and known limitations

- **Stage-invariant recipe.** Same dose T1-T5 (PA Taillon — oligos
  tissue-baseline anchored, not yield-scaled). `stage` plumbed through
  for contract symmetry with sidedress / fertigation.
- **Coverage discount is global, not per-element.** Dominant effect is
  droplet retention (product-agnostic). Per-element tuning deferred
  until tissue data points to drift.
- **No spray-pH multiplier here.** REQ-055's `foliarPhResponse(tankPh)`
  is separate, applied in `effectiveEff` inside `app/index.html`.
  Combined: real_uptake = label_dose × element_pct × coverage ×
  foliarPhResponse(tankPh). Spray pH ~5.0 → `foliarPhResponse(5.0) ≈ 0.9`
  → another ~10 % shave. REQ-101 covers coverage axis only.
- **Burn cap depends on water hardness + temp.** REQ-025's 10 mS/cm
  conservative across summer GH. Cold-AM: +1-2 mS/cm headroom; hot-PM:
  could burn ~8 mS/cm. Wednesday-AM operator timing pins the safer end.
- **No pH coupling.** Soil pH crisis doesn't change foliar — cuticle
  bypasses root. When sulfur drops soil pH and fertigation Mn / Zn / Fe
  come back online (REQ-018), foliar → backup, doses can drop
  proportionally.

---

## Refinement triggers

- **Yucca decision flips.** `FOLIAR_COVERAGE_DEFAULT` 0.30 → 0.80; STORED
  rebalanced via `/retire-recipe` (Cu 2 → 4 g, Mn 18 → 22 g, Zn 16 → 22 g
  back to pre-2026-05-05). REQ-101 still passes (formula unchanged);
  REQ-025 re-check at higher Mn / Zn / Cu doses.
- **Tissue test reveals per-element drift.** Petiole panel (NO₃-N + Mg +
  Cu/Mn/Zn) sampled 2026-05-11. Cu toxicity-bound (less coverage-sensitive);
  Mn cleanest signal. Three paths, paired per P-03:
  - **Upward.** Measured Mn correlates predicted within ±20 % → 30 %
    coverage anchored. Raise REQ-101 cert 3 → 4 (mirror to data.js
    + parallel B2' for with-yucca).
  - **Lateral.** Correlation 30-50 % off either way → midpoint wrong for
    cultivar/climate. Refit to matched value (~25 % under, ~35 % over);
    cert stays 3.
  - **Downward (Sentís ceiling).** Measured Mn ≈ predicted × 0.10 →
    Sentís 3 % governs, retention irrelevant. `FOLIAR_COVERAGE_DEFAULT`
    refits ~0.03. Channel collapse: Zn 136 % → ~14 %, Mn ~72 % → ~7 %,
    Cu ~25 % → ~2.5 %; foliar becomes insurance. Team would need
    fertigation Mn / Zn / Cu route, depends on soil pH < ~7.0 (REQ-018 /
    `effectiveEff` gate).

  Until panel lands, REQ-101 stays cert 3 (B2 downgrade, 2026-05-12);
  hold rationale in `learnings.md`.
- **Solubore moved fully to fertigation.** Already conceptual
  (`FP_RECIPE_T5.foliar.Solubore = 0`); STORED still carries 7 g. Next
  `/retire-recipe` zeros it — delivers ~1.1 mg B/m²/wk today; fertigation
  9 g delivers ~4.8 mg/m²/wk (full demand alone).
- **Soil pH drops below 7.0.** Sulfate-metal fertigation (FeSO₄, MnSO₄,
  ZnSO₄) viable. Foliar → insurance, loads can cut 50-70 %. Verifier
  surfaces it: `effectiveEff(MnSO4, fertigation, currentSoilPh) ≥ 0.05`
  → REQ-018 passes for fertigation Mn; operator decision lands in
  `/retire-recipe`.
- **Spray B reintroduces foliar Ca.** If BER persists, foliar CaCl₂
  event-driven returns — reactivates `foliar.Ca`. Verify REQ-029 (Ca²⁺ ×
  PO₄³⁻ separation) + REQ-022 (Ecocert-listed CaCl₂).

---

## Implementation map

| File                                                | Owns                                                               |
|-----------------------------------------------------|--------------------------------------------------------------------|
| `nutrition/tomato/foliar-recipe/data.js`            | `FOLIAR_COVERAGE_DEFAULT`, `FOLIAR_COVERAGE_WITH_YUCCA`, `BURN_CAP_BASE_G`, `burnCapG(el)` (area = `TOMATO_NUM_BEDS × TOMATO_BED_AREA`, computed inline in `calc.js`) |
| `nutrition/tomato/foliar-recipe/calc.js`            | `computeFoliarSupply(stage)`                                       |
| `nutrition/tomato/foliar-recipe/model.js`           | `window.FoliarRecipeTomato` namespace wrapper                      |
| `nutrition/tomato/foliar-recipe/spec.md`            | Spec — what the model must do or be                                |
| `nutrition/tomato/foliar-recipe/derivation.md`      | This file                                                          |

`app/index.html` include order: AFTER plant-needs (`BIOMASS_DEMAND`,
`TOMATO_FRUIT_EXPORT` for cross-ref), AFTER `STORED_RECIPE`
(`STORED_RECIPE.tomato.foliaire.A`), AFTER `PRODUCT_PCT` (`MnSO4_Mn`,
`ZnSO4_Zn`, `FeSO4_Fe`, …), AFTER `TOMATO_NUM_BEDS` / `TOMATO_BED_AREA`.
Order: `data.js` → `calc.js` → `model.js`. Consumers (`calcNutrSupply`)
read `window.FoliarRecipeTomato.computeFoliarSupply(stage)`.

`calcNutrSupply` foliar block in `app/index.html` (~line 4604-4645)
delegates to `computeFoliarSupply(stage)` for stored-mode. FP-mode
still reads `FP_RECIPE_T5.foliar` inline — FP IS stored for foliar
(same dose, coverage, delivery), so single fp-vs-stored comparison
stays meaningful for Block 7 drift gauge.
