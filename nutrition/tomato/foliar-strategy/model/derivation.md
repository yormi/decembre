# Tomate — foliar-strategy · derivation

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
   22 g/15 L by Décembre-internal observation (no burn at this dose
   under Wednesday-AM operator timing since the 2026-04-29 restructure).
3. **Cuticle absorption ceiling**. Uptake plateaus once leaf surface
   saturates; REQ-101's 30 % coverage already accounts for it.

`FP_RECIPE_T5.foliaire` mirrors `STORED_RECIPE.tomato.foliaire` —
subproject *models the delivery* under coverage, doesn't *derive the
dose* from demand.

Model validates: delivered mg/m²/wk per element sits inside REQ-013/014
demand band. Mn ~72 %, Fe ~84 %, Cu ~26 % (Cu toxicity-capped at 2 g; gap
is structural and accepted — the narrow Cu²⁺ enzyme-damage threshold
binds), Zn ~136 % (over the 1.3× luxury cap on the foliar channel alone
— see "Per-element delivered vs demand at T5" table below for the
reconciled math).

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

With yucca: 70-85 % literature; pinned at
`FOLIAR_COVERAGE_WITH_YUCCA = 0.80` as working assumption, **cert 3** —
same evidence base as the no-yucca default: no direct Décembre
measurement at a surfactant-on regime; the historical 22/22/4 Cu/Mn/Zn
dosing under yucca didn't generate tissue-correlated retention data;
Sentís et al. 2017 surfactant-assisted Mn cuticle penetration ~20 % is
absorption, not retention. 0.80 blends both axes inside the 70-85 %
literature mid-band. Bump to cert 4 when tissue panel correlates
predicted vs measured under a surfactant-on regime.

```js
const FOLIAR_COVERAGE_DEFAULT     = 0.30;  // no yucca; cert 3
const FOLIAR_COVERAGE_WITH_YUCCA  = 0.80;  // surfactant-assisted; cert 3
```

`computeFoliarSupply(stage)` reads `FOLIAR_COVERAGE_DEFAULT`; with-yucca
constant exposed for future toggle, not currently consumed.

---

## Ca-specific cuticle coverage (Test 1 Path B, 2026-05-24)

Ca²⁺ doesn't share the cation-micro (Mn / Zn / Cu / Fe) coverage axis.
Two physical reasons: (a) divalent Ca²⁺ binds cuticle pectate at the
deposition surface and resists translocation into the lamina (Conway /
Sams cell-wall Ca-pectate retention is the disease-resistance
mechanism, also the absorption bottleneck); (b) Ca/sulfate
electrochemistry differs — no sulfate counter-ion shuttle into the
hydrated cuticle pore. Ca foliar uptake literature mid-band sits
~half the sulfate-cation-micro band; pin Ca coverage to **0.50 × the
sulfate-metal coverage** at each surfactant state.

| Surfactant | Sulfate-metals | Ca²⁺ | Ratio |
|------------|---------------:|-----:|------:|
| false      | 0.30           | 0.15 | 0.50  |
| true       | 0.80           | 0.40 | 0.50  |

```js
const FOLIAR_COVERAGE_CA_NO_SURFACTANT   = 0.15;  // cert 2
const FOLIAR_COVERAGE_CA_WITH_SURFACTANT = 0.40;  // cert 2
```

**Cert 2** for both — no Décembre tissue measurement under a Ca-foliar
regime; the 0.50 sulfate-ratio is literature-mid-band heuristic
(Schönherr 2000 cuticle Ca permeability ~10× lower than K but
surfactant-assisted regimes close the gap). Cert bump to 3 if the
Test 1 week-4 tissue panel correlates predicted within ±20 %.

**Spec status.** REQ-101 covers the per-recipe coverage axis: the
sulfate-cation-micro recipe (`FOLIAR_COVERAGE_DEFAULT` /
`FOLIAR_COVERAGE_WITH_YUCCA`) and the Ca recipe
(`FOLIAR_COVERAGE_CA_NO_SURFACTANT` /
`FOLIAR_COVERAGE_CA_WITH_SURFACTANT`) each declare their own
coverage values. Remaining gate is *implementation*: the Ca recipe
needs a `data.js` entry (target element set `{Ca}`, dose anchor
100 g/15 L CaCl₂·2H₂O, weekly leaf-tolerance cap 3 per REQ-196,
surfactant required) before `computeFoliarSupply(stage, opts, recipe)`
can route a non-zero Ca output. Until that entry lands, the function
returns `Ca: 0` and the constants above sit unused by the runtime.
Coder lane.

---

## Per-element burn cap — `BURN_CAP_BASE_G`

Maximum cuticle-safe per-element load per 15 L master tank, used by
`computeFoliarRecipeForGap` (REQ-115) to clip the per-element ideal
gram. Sourced from extension mid-band guidance (Sonneveld 2009, Yara
crop-nutrition foliar tables, Cornell / U. Delaware / U. Missouri
extension publications): 0.1-0.3 % MnSO₄, 0.05-0.1 % CuSO₄, etc.

| Element | g / 15 L | Source                                                  | Cert |
|---------|---------:|---------------------------------------------------------|-----:|
| Mn      | 22       | Décembre-internal observation (held at 22 g post-restructure, no burn) | 2 |
| Zn      | 22       | Décembre-internal observation (held at 22 g post-restructure, no burn) | 2 |
| Cu      | 2        | Décembre-internal observation 2026-05-06 (axil-pool toxicity image) | 2 |
| Fe      | 80       | Extension mid-band; high-mass dose, well below tank-CE bound | 3 |
| Mo      | 2        | Sonneveld 50-200 mg/L band; seldom binding              | 3    |
| B       | 9        | Solubore (Na₂B₈O₁₃·4H₂O, 20.5 % B); non-ionic           | 3    |
| Ca      | 100      | CaCl₂·2H₂O (27.3 % Ca); 0.67 % solution ≈ 9 mS/cm under REQ-025 tomato 10 mS/cm cap with 10 % safety margin (Test 1 Path B 2026-05-24) | 3 |

**Cu certainty exception (cert 2, divergence BELOW extension mid-band).**
The 2 g/15 L Cu value didn't come from extension mid-band — extension
guidance supports 0.05-0.1 % Cu solutions, i.e. 7.5-15 g CuSO₄/15 L,
several × Décembre's 2 g. The 2 g value came from a Décembre-internal
observation on 2026-05-06: with yucca dropped, the axil-pool image
showed Cu concentrating to ~150-200 ppm in leaf axil runoff; the
original 4 g was halved to 2 g in response. Cu has a narrow toxicity
threshold (Cu²⁺ enzyme damage); the lower local value is defensible by
Décembre observation (cert 3 within Décembre) but transferability to
other ops is unproven without multi-season tissue+lesion data (cert 2
in general).

**Mn / Zn certainty exception (cert 2, divergence ABOVE extension mid-
band).** Extension mid-band sits at Mn 18 / Zn 16 g per 15 L (the value
this table carried before 2026-05-17). STORED foliaire has carried
22 / 22 g since the 2026-04-29 45 L → 15 L volume restructure with no
burn observed under Wednesday-AM operator timing. The cap was lagging
STORED reality; pinning the cap at 22 g matches live empirical practice.
Defensible by Décembre observation (cert 3 within Décembre — multi-week
no-burn track at 22 g under the Wednesday-AM operator window since the
2026-04-29 restructure); transferability to other ops unproven without
an independent observation period (cert 2 in general — the no-burn
mechanism depends on the early-AM post-fog low-leaf-temperature
spray window, the post-restructure tank concentration regime, and the
Ca-saturated soil context; none of those carry without their own
verification).

**Refinement triggers.** (a) Once tissue + lesion data across multiple
seasons stabilizes any cap as a Décembre-empirical transferable value
for similar Ca-saturated soil ops, bump cert 3. (b) If any operator-
timing-window shift (afternoon spray, post-irrigation high-leaf-
moisture) or tank-volume shift (return to 45 L or other) introduces
burn at 22 g Mn / Zn, drop the cap to the extension mid-band (18 / 16)
and re-source. Fe / Mo / B stay at cert 3 unless tissue panel surfaces
drift outside the extension mid-band.

Surfactant has no published effect on the burn-cap axis — yucca acts on
coverage, not on max safe tank concentration. See `learnings.md` for
the rejected surfactant-multiplier on burn cap.

---

## Per-element min-dose floor — `MIN_DOSE_G_PER_ELEMENT`

The uniform 0.5 g floor that lived in `computeFoliarRecipeForGap` until
2026-05-16 was element-blind. For elements where ideal_g lands in the
0.2-0.5 g band (small-demand cation micros like Cu), the floor forced
a 2-4× luxury feed: round up to 0.5 g delivered, multiply by element_pct
and coverage to get delivered mg/m²/wk, divide by gap → 2.5× to 4× the
demand. Cu is the load-bearing case: narrow Cu²⁺ toxicity threshold
(the same threshold that drove the 2026-05-06 axil-pool-image halving
from 4 g to 2 g/15 L). Mo at 1 g/15 L (~7× demand on its wide tolerance
band) was acceptable when Mo was on foliar; post-Mo-carve-out
(REQ-061 2026-05-16) it is no longer iterated, but the per-element
floor entry stays as a "if Mo returns" placeholder.

| Element | Floor (g) | Rationale                                                         | Cert |
|---------|----------:|-------------------------------------------------------------------|-----:|
| Mn      | 0.5       | Burn cap binding, not luxury; 0.5 g delivered ≈ 0.12 mg/m²/wk    | 3    |
| Zn      | 0.5       | Burn cap binding; over-luxury already a known issue (Zn 136 %)   | 3    |
| Cu      | 0.2       | Narrow toxicity threshold — load-bearing case                    | 3    |
| Fe      | 0.5       | High-mass dose; floor never binds in practice (ideal_g large)    | 3    |
| Mo      | 0.1       | Wide Sonneveld 50-200 mg/L tolerance; placeholder if Mo returns  | 3    |
| B       | 0.5       | Single-channel via fertigation (REQ-061); placeholder for foliar fallback | 3 |

Operator weigh-scale resolution is the floor on Cu (0.2 g) — `±0.1 g` on
the team's scales is the practical limit; below that we'd round to
nothing. 0.5 g for the others reflects the same scale resolution plus
no toxicity argument to push lower.

**Luxury-cap guard.** The per-element floor catches the "too small to
measure" case (clamp to 0). The 0.5 g rounding grid catches the
"weigh-scale resolution" case (round up the dose). But a residual edge
case survives: ideal_g ≥ floor, ceiling-to-0.5 over-shoots 1.3× of gap.
Worked example with Cu (0.2 g floor, 25 % Cu, 382.9 m², 0.30 coverage):

| Cu gap (mg/m²/wk) | ideal_g | rounded | delivered | over-luxury? |
|------------------:|--------:|--------:|----------:|--------------|
| 0.03              | 0.15    | —       | 0         | no (below floor → clamp 0) |
| 0.039             | 0.20    | 0.5 g   | 0.098     | yes — 2.5× → guard fires → 0 |
| 0.10              | 0.51    | 1.0 g   | 0.196     | yes — 1.96× → guard fires → 0 |
| 0.20              | 1.02    | 1.5 g   | 0.293     | yes — 1.47× → guard fires → 0 |
| 0.30              | 1.53    | 2.0 g   | 0.392     | no — 1.30× exactly at cap |
| 0.40              | 2.04    | burn cap = 2.0 g | 0.392 | no — 0.98× under demand |

The guard fires for any Cu gap below ~0.31 mg/m²/wk; the channel
returns 0 for Cu rather than over-shooting. This trades coverage for
toxicity safety on Cu — defensible by the narrow Cu²⁺ threshold. For
other elements (wider tolerance bands), the guard rarely fires:
0.5 g floor on Mn at gap 0.05 mg/m²/wk → ideal_g 0.21 g → above floor →
0.5 g → delivered 0.123 / 0.05 = 2.5× → guard fires too. Net effect:
the algorithm refuses to dose at all when it cannot dose without
significant luxury, on any element.

---

## CE-cap algorithm — drop highest-CE-contributor first (was: proportional scaling)

When predicted tank CE exceeds REQ-025's 10 mS/cm burn cap × 0.95 safety
margin, the recipe needs reducing. The 2026-05-16 algorithm change
replaces "scale all non-zero doses proportionally" with "drop the
highest-CE-contributor first."

**Why this matters.** FeSO₄·7H₂O (80 g/15 L max) is mass-dominant in
the foliar recipe; any CE-cap event traces back to Fe in practice.
Proportional scaling penalizes all elements by the same ratio, which
strips the small-demand cation micros (Mn, Cu) first — those are
precisely the elements with no alternative channel under REQ-061
cascade order at current pH 7.4 lockout. Cu at 2 g already at the
toxicity-cap floor: a 0.95× scaling pushes it to 1.9 g; the next
0.5 g rounding drops it to 1.5 g; a third iteration zeros it via the
min-dose floor. Net effect: a CE-cap event preferentially strips the
pH-locked micros the foliar channel exists to deliver.

**Drop-highest-first** preserves the pH-locked micros while reducing
the mass-dominant element first. Algorithm: per iteration, identify
the element whose contribution to predicted CE is largest, halve its
dose (or drop to 0 if already below the per-element floor after the
halving). Loop until predicted CE ≤ target or all doses are at floor
/ 0. Bound at 4 iterations to guarantee termination.

**Why halve, not just zero.** Halving keeps Fe in play for cases where
Fe alone over-shoots CE only slightly. Zeroing-on-first-hit would
collapse the channel for moderate CE excess.

**CE contribution per element.** Estimated from
`predictedCE(recipeAsLabelArray(recipeWithOnlyEl), 1.0)` — re-runs the
tank CE function with one element at a time non-zero, then ranks by
the per-element CE. Same `predictedCE` function used for the bound
check, so this stays consistent with REQ-025's tank-CE model.

---

## Channel efficiency map (REQ-157 + REQ-170 surfactant-aware)

`window.FoliarRecipeTomato.efficiency` (REQ-157) declares the per-element
delivery fraction at the default no-surfactant regime and default spray
tank pH. `window.FoliarRecipeTomato.efficiencyFor(surfactant)` (REQ-170)
declares the same shape but reactive to the surfactant lever — the
Block 5 toggle that the page-side REQ-163 reads.

Formula: `efficiency(surfactant) = coverage × foliarPhResponse(sprayPh)`

| Surfactant | Coverage | spray-pH factor | Per-element value |
|------------|---------:|----------------:|------------------:|
| false      | 0.30     | 0.9             | 0.27              |
| true       | 0.80     | 0.9             | 0.72              |

Sulfate-based oligo sprays land near pH 5.0 (cuticle-uptake peak is pH
5.5-6.0 per the `foliarPhResponse` curve); spray pH 5.0 sits at ~0.9 of
the peak. The spray-pH factor is invariant under the surfactant lever —
surfactant acts on coverage (droplet retention × spread × cuticle
penetration), not on the spray-pH chemistry. The cuticle-uptake
mechanism doesn't differentiate by sulfate cation at this resolution,
so a single uniform value covers all four cation-micro oligos
(Mn / Zn / Cu / Fe).

Multiplier check: 0.72 / 0.27 = 2.67×. Cuticle penetration with
surfactant literature mid-band is 1.3-2× for non-systemic micros; our
ratio is above that band because yucca acts on both axes (retention +
penetration), not just penetration. Sentís et al. 2017 absorption-only
ratio 20 / 3 = 6.7× — our 2.67× is conservative against that absorption
ratio because we blend it with retention (which is a smaller ratio
under wet-film conditions, ~2× retention bump). The 2.67× sits inside
the combined-axes literature band 2-4×.

Elements absent from the map:

- **B (Solubore)** — REQ-061 single-channel design routes B via
  fertigation, not foliar. If foliar B is reinstated for a future
  spray-B-back scenario, add `B: 0.27` to the map.
- **Mo (sodium molybdate)** — retired from foliar 2026-05-16 (REQ-061
  Mo carve-out). Molybdate is anionic and fully plant-available at our
  pH 7.4, so the foliar-bypass argument that keeps cation micros here
  doesn't apply. Mo moved to the fertigation barrel at the team's
  smallest reliable weight; the foliar spray no longer carries sodium
  molybdate. The stored-recipe edit on this channel is gated on
  `/retire-recipe` audit.

**Cert 3** — `FOLIAR_COVERAGE_DEFAULT` is cert 3 (no Décembre tissue
correlation yet); `FOLIAR_COVERAGE_WITH_YUCCA` is cert 3 (no Décembre
tissue correlation yet, same evidence-base shape as the no-surfactant
default); `foliarPhResponse` curve is cert 4. Effective cert min = 3
across both regimes. Refinement triggers:

- **Tissue panel ±20 % correlation under no-surfactant regime** → cert
  3 → 4 for the no-surfactant value (0.27).
- **Tissue panel ±20 % correlation under surfactant-on regime** → cert
  3 → 4 for the with-surfactant value (0.72). Separate trigger — the
  with-surfactant value 0.80 isn't measured at Décembre, so its cert
  bump needs its own correlation period under that regime (independent
  of whether yucca specifically is the surfactant; see `learnings.md`
  § "Yucca return as a refinement trigger" for why yucca-return is not
  itself the trigger).
- **Sentís ceiling regime** (downward, ×0.10 ratio in tissue) — see §
  "Refinement triggers" below for the full collapse math. Headline:
  no-surfactant coverage collapses to ~0.03 (efficiency ~0.027);
  with-surfactant collapses by a ~×0.25 ratio to ~0.06.

---

## What dropping yucca cost — historical context

Decision 2026-05-05: yucca dropped (supply-chain). Cu cut for burn safety
at lower dispersion (axil-pool toxicity image triggered the halving).
Mn / Zn held at post-restructure values (the 2026-04-29 45 L → 15 L
restructure kept 22 g for both); Fe / Solubore / Mo also held.

| Element | Before yucca dropped | After    | Action     | Reason                                                    |
|---------|----------------------|----------|------------|-----------------------------------------------------------|
| Cu      | 4 g/15 L             | 2 g/15 L | Cut -50 %  | Cu local-pool toxicity image (dark spots in axils)        |
| Mn      | 22 g/15 L            | 22 g/15 L | Held      | No burn observed at 22 g post-restructure                 |
| Zn      | 22 g/15 L            | 22 g/15 L | Held      | No burn observed at 22 g post-restructure                 |
| Fe      | 80 g/15 L (FeSO₄)    | 80 g/15 L | Held      | Fe headroom large, no toxicity signal                     |
| Solubore| 7 g/15 L             | 7 g/15 L  | Held      | Later moved fully to fertigation 2026-05-08               |
| Mo Na   | 1 g/15 L             | 1 g/15 L  | Held      | Wide tolerance band                                       |

Net effect at dose level: Cu -50 %, Mn / Zn / Fe / Solubore / Mo
unchanged. Coverage axis: 0.80 → 0.30 (the dominant delivery hit).
Combined effective uptake hit: ~63 % of with-yucca regime on Mn / Zn /
Fe (coverage-only drop, dose held); ~19 % on Cu (coverage + half-dose).
RECIPE_HISTORY captures the 2026-05-06 Cu 4 → 2 g retirement entry
verbatim (the Mn / Zn dose hold is not a retirement event — no
RECIPE_HISTORY entry needed).

**Correction history (2026-05-17).** An earlier draft of this table
reported Mn 22 → 18 g and Zn 22 → 16 g as cuts applied at the yucca
drop. That was fabricated — no such cuts landed; STORED foliaire
carried 22 g for both continuously since the 2026-04-29 restructure
(verified by `git log -S '22' app/index.html` against the STORED
foliaire range, plus the absence of any Mn / Zn RECIPE_HISTORY entry).
The cap values (`BURN_CAP_BASE_G`) were set at extension mid-band
18 / 16 in the model layer while STORED ran 22 / 22 in the field — a
cap-vs-empirical gap reconciled 2026-05-17 by raising the cap to match
empirical reality and dropping the cert from 3 to 2 (per § "Mn / Zn
certainty exception" above). See `learnings.md` § "Mn / Zn burn caps
held at extension mid-band 18 / 16 (pre-2026-05-17)".

---

## Per-element delivered mg/m²/wk vs demand at T5

`computeFoliarSupply('T5')`, current STORED (post-2026-05-05),
area = 382.9 m², coverage = 0.30. Demand from `BIOMASS_DEMAND.T5[el] +
TOMATO_FRUIT_EXPORT[el].g × 1500` (live data in
`nutrition/tomato/plant-needs/data.js`).

Active foliar elements only (Mo retired to fertigation 2026-05-16 per
REQ-061 carve-out; B single-channel via fertigation per REQ-061):

| Element | Recipe g | Element % | Raw mg/m²/wk | × Coverage | Delivered mg/m²/wk | Demand T5 mg/m²/wk | % demand |
|---------|---------:|----------:|-------------:|-----------:|-------------------:|-------------------:|---------:|
| Mn      | 22       | 31.5 %    | 18.1         | × 0.30     | 5.43               | 7.5                | 72 %     |
| Zn      | 22       | 35.5 %    | 20.4         | × 0.30     | 6.12               | 4.5                | **136 %** |
| Cu      | 2        | 25.0 %    | 1.31         | × 0.30     | 0.39               | 1.5                | 26 %     |
| Fe      | 80       | 20.0 %    | 41.8         | × 0.30     | 12.54              | 15.0               | 84 %     |

Mn + Cu + Fe are the standing under-fert calls (foliar is the only
channel for these four cation micros under current pH 7.4 lockout per
REQ-061). Coverage 0.30 (no yucca) is the steady-state delivery regime;
yucca is not on order and is not tracked as a refinement-trigger return
path (see `learnings.md` § "Yucca return as a refinement trigger" for
the rejected dose-restoration projection).

**Zn over-luxury (136 % of demand)** is over REQ-014's 1.3× cap on the
foliar channel alone (foliar is the only Zn channel). Three options
discussed; choice = "hold, document, refine on tissue data" per P-11
(don't over-precise; soil/tissue refinement). Cutting Zn from the spray
preemptively without tissue evidence risks pushing the plant into
deficit on the one available channel; the over-luxury is a foliar
cuticle-surface phenomenon, not a soil-bank accumulation (foliar Zn
doesn't compound week-over-week the way soil-applied does). Refinement
trigger named below ("Tissue Zn signals luxury / toxicity").

Solubore in foliar = 0 (B single-channel via fertigation since
2026-05-08, REQ-061). STORED still carries 7 g for legacy; next
`/retire-recipe` can zero it (fertigation 11 g Solubore covers demand).
Sodium molybdate STORED still 1 g for legacy (Mo retired from foliar
2026-05-16; gated on `/retire-recipe`; the model returns Mo: 0
regardless of recipe contents per REQ-061 carve-out).

---

## No-macro by design

Schema carries N / P / K / Ca / Mg as explicit zeros:

- **N**: urea burns; NO₃⁻ cuticle uptake ~0 (charged ion on hydrophobic
  surface).
- **P**: cuticle barrier ~5-15 %; Ca-phosphate precipitation in tank.
  Fails REQ-018's 5 % effective floor in spray pH. Fertigation owns P.
- **K**: cuticle ~5 %; 6 g/m²/wk demand → ~120 g elemental K in tank.
  Hits burn cap + tank-volume limits before useful uptake.
- **Ca** (reactivated 2026-05-24 — Test 1 Path B): foliar CaCl₂·2H₂O +
  surfactant returns to the program. **Goals:** (a) close the
  ~315 mg/m²/wk T5 canopy gap left after root-channel obstacles
  (Vmax 0.50 × Mg antagonism 0.80 × root-mass 0.70 × pH 0.94 = net 0.27
  of soil bank delivered; full chain in
  `nutrition/tomato/doc/ca-ber-investigation-tests-2026-05-24.md`); (b)
  reduce stem-canker susceptibility via Ca-pectate cell-wall
  cross-linking (Conway/Sams; Volpin & Elad — cert 4 mechanism).
  **Dose:** 100 g CaCl₂·2H₂O per 15 L tank, 2 sprays/wk indiscriminate
  on foliage + fruit + stems, separate tank from oligo spray
  (REQ-029 — Ca²⁺ + SO₄²⁻ → gypsum precipitation). **Delivered:**
  ~56 mg Ca/m²/wk at Path B (~18 % of canopy gap; Path C 3×/wk closes
  ~27 %). **Schema status:** `computeFoliarSupply` still returns
  `Ca: 0` — Ca slot is open in handoff item 5, pending PO call on the
  schema-wiring shape (cuticle-coverage axis becoming per-element vs
  staying global). **Ecocert:** CaCl₂·2H₂O food-grade vendor + product
  certified 2026-05-24 (resolves the 2026-05-06 retirement caveat, see
  `learnings.md`). Surfactant — Ecocert-allowed yucca / quillaja /
  equivalent, vendor in operator lane.
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

- **Tissue test reveals per-element drift.** Petiole panel (NO₃-N + Mg +
  Cu/Mn/Zn). Cu toxicity-bound (less coverage-sensitive); Mn cleanest
  signal. Three paths, paired per P-03:
  - **Upward.** Measured Mn correlates predicted within ±20 % → 30 %
    coverage anchored. Raise REQ-101 cert 3 → 4 (mirror to data.js
    + parallel cert-bump for with-surfactant value 0.80 if a surfactant-
    on tissue period is also in the data).
  - **Lateral.** Correlation 30-50 % off either way → midpoint wrong for
    cultivar/climate. Refit to matched value (~25 % under, ~35 % over);
    cert stays 3.
  - **Downward (Sentís ceiling).** Measured Mn ≈ predicted × 0.10 →
    Sentís 3 % governs, retention irrelevant. `FOLIAR_COVERAGE_DEFAULT`
    refits ~0.03. Channel collapse: Zn 136 % → ~14 %, Mn ~72 % → ~7 %,
    Cu ~25 % → ~2.5 %; foliar becomes insurance. Team would need
    fertigation Mn / Zn / Cu route, depends on soil pH < ~7.0 (REQ-018 /
    `effectiveEff` gate).

  Until tissue data lands, REQ-101 stays cert 3 (no Décembre tissue
  correlation yet); hold rationale in `learnings.md`.
- **Solubor moved fully to fertigation.** Already conceptual
  (`FP_RECIPE_T5.foliar.Solubore = 0`); STORED still carries 7 g. Next
  `/retire-recipe` zeros it — delivers ~1.1 mg B/m²/wk today; fertigation
  11 g delivers ~5.89 mg/m²/wk to bed (covers T5 demand 5.625 mg/m²/wk).
- **Tissue Zn signals luxury / toxicity.** Foliar Zn delivered ~6.1 mg/m²/wk
  vs T5 demand 4.5 = 136 %, over REQ-014's 1.3× cap on the foliar channel
  alone. No soil-bank concern (foliar Zn doesn't compound week-over-week
  the way soil-applied does), no observed leaf-tip Zn-toxicity symptom to
  date, no Zn-fertigation channel available at pH 7.4. Holding 22 g/15 L
  ZnSO₄ pending: petiole-tissue Zn out of range (>120 ppm Zn DW Sonneveld
  guideline) OR leaf-tip phytotoxicity image. On either trigger, cut Zn to
  ~16 g/15 L (≈ 99 % demand) via `/retire-recipe`.
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
| `nutrition/tomato/foliar-strategy/data.js`            | `FOLIAR_COVERAGE_DEFAULT`, `FOLIAR_COVERAGE_WITH_YUCCA`, `BURN_CAP_BASE_G`, `burnCapG(el)` (area = `TOMATO_NUM_BEDS × TOMATO_BED_AREA`, computed inline in `calc.js`) |
| `nutrition/tomato/foliar-strategy/calc.js`            | `computeFoliarSupply(stage)`                                       |
| `nutrition/tomato/foliar-strategy/model.js`           | `window.FoliarRecipeTomato` namespace wrapper                      |
| `nutrition/tomato/foliar-strategy/spec.md`            | Spec — what the model must do or be                                |
| `nutrition/tomato/foliar-strategy/derivation.md`      | This file                                                          |

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
