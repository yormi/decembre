# Tomato Ca-déficience + BER — field test protocols

**Date:** 2026-05-24
**Context:** TOM #1 T5 tissue panel (14 mai 2026, lab ID TI-0025332) showed leaf Ca 3.46 % vs lab floor 4.00 %. Field signal: BER (blossom-end rot) on fruit + visible water shoots (gourmands) on vegetation. Soil-bank Ca abundant (SME 238.8 ppm; Mehlich-3 10 989 kg/ha). Full diagnostic context in `tomato-t5-tissue-analysis-2026-05-23.md`.

This doc designs the field tests that separate the candidate mechanisms.

---

## Candidate mechanisms (under investigation)

| # | Mechanism | Evidence pointing to it | Cert today |
|---|---|---|---:|
| A | P-starvation reduces root mass → less Ca-uptake surface | soil P 0.8-1.1 ppm SME (severe); tissue P -54 %; Marschner Ch. 4 mechanism | 3 |
| B | Mg / cation antagonism at root Ca²⁺ uptake | soil Mg 5.2 meq/100g (high); Ca:Mg = 4.1 (below ideal 5-7); tissue Mg mid-suff while Ca borderline | 3 |
| C | Ca uptake Vmax-saturates at root, regardless of bank size | Marschner Ch. 14 root Vmax plateau ~200-400 ppm SME; Décembre 238 ppm at plateau | 2 |
| D | Lab "déficience" not real for our cultivar (generic floor, not Salanova/tomato-specific) | research doc already flags Salanova-non-specific thresholds; literature tomato deficient < 1.2 %, sufficient > 1.5 %; 3.46 % is mid-band | 2 |
| E | Distribution-to-fruit failure under vegetative competition | BER + water shoots (water shoots = strong vegetative sinks competing with fruit for xylem water); BER mechanism is xylem-only Ca + low fruit-transpiration (cert 4 mechanism) | 4 |
| F | Transpiration-coupling deficit on passive supply | model lever currently `current_yield / target_yield`; calc estimate at full canopy ≈ 1.0; not the active bottleneck today | 3 (calc) |

E is the highest-cert mechanism on the symptom side. Tests below isolate which of A-C-F is the *upstream* contributor and confirm/refute D.

---

## Test 1 — Foliar CaCl₂ with surfactant (canopy Ca uptake + disease resistance)

**Goal reframe (2026-05-24 — operator update).** BER mostly gone. Foliar Ca's role shifts from fruit-Ca distribution rescue to two new objectives:

1. **Raise canopy tissue Ca toward modeled demand** — close the 315 mg/m²/wk canopy gap (or as much as the foliar channel can carry).
2. **Reduce fungal disease susceptibility** — particularly the stem canker documented at `nutrition/tomato/doc/stem-canker-2026-05-24/`. Mechanism: Ca pectates cross-link primary cell walls; low tissue Ca → weaker walls → easier *Botrytis cinerea* / pathogen penetration. Cert 4 mechanism (Conway / Sams / Volpin & Elad).

**Hypothesis.** Foliar Ca with surfactant raises leaf Ca, hardens cell walls, lowers new-lesion incidence. Bypasses all four root-channel obstacles (Vmax saturation, Mg antagonism, P-driven root reduction, pH cation suppression).

**What this spray does NOT do.**
- **Reverse existing lesions.** Ca is preventive of NEW infections, not curative for established cankers. Sanitation comes first (see disease-management appendix below).
- **Close the canopy gap on its own.** Even at Path C (3 sprays/wk) it only delivers 27 % of the canopy gap. Pairs with the root-side levers (Mg-cut trial, eventual pH-drop) for the rest.

**Calculation chain — Ca obstacles to dose.**

| Step | Value | mg/m²/wk | Cert |
|---|---|---:|---:|
| Ca demand T5 (1.5 kg/m²/wk target) | TOMATO_REMOVAL × 1500 | 2 250 | 3 |
| Bank potential | SME 238.8 ppm × 28 L/m²/wk | 6 686 | 3 |
| × Vmax saturation at root | 0.50 | 3 343 | 2 |
| × Mg / Ca antagonism (Ca:Mg = 4.1) | 0.80 | 2 674 | 3 |
| × Root mass reduction (P starvation) | 0.70 | 1 872 | 2 |
| × pH 7.4 cation suppression | 0.94 | 1 760 | 4 |
| **Net effective canopy delivery** | (compound 0.27 of bank, 78 % of demand) | **~1 935** | |
| **Canopy gap** | demand − delivered | **315** | |
| Fruit Ca demand (5 % of total) | TOMATO_FRUIT_EXPORT.Ca × 1.5 | 113 | 4 |
| Fruit Ca arrival (5 % of canopy × vegetative-competition 0.6) | 1 935 × 0.05 × 0.6 | 58 | 3 |
| **Fruit gap (BER lives here)** | fruit demand − arrival | **55** | 2-3 |

**Foliar burn cap math.**

CaCl₂·2H₂O EC table (cert 4 from solution tables):

| % w/v | g/L dihydrate | EC at 25 °C |
|---:|---:|---:|
| 0.3 | 3 | 5 mS/cm |
| 0.6 | 6 | 9 mS/cm |
| **0.7** | **7** | **10 mS/cm** ← chemistry — foliar-ce-under-burn-cap cap |
| 1.0 | 10 | 17 mS/cm |

**Max: 100 g CaCl₂·2H₂O per 15 L tank** (0.67 %, EC ≈ 9 mS/cm with safety margin).

**Coverage with surfactant.**

| Regime | Sulfate-metals | Ca²⁺ | Ratio |
|---|---:|---:|---:|
| No surfactant | 0.30 | 0.15 | Ca / metal ≈ 0.50 |
| With surfactant | 0.80 | **0.40** | Ca / metal ≈ 0.50 |

Ca²⁺ binds cuticle wax more than sulfate-metals; surfactant scales both regimes proportionally. Cert 2 — refits to tissue panel ±20 % correlation.

**Recommended dose.**

Per-spray delivery is fixed at the burn-cap × coverage product. The lever is **frequency**.

| Parameter | Value |
|---|---|
| CaCl₂·2H₂O per 15 L tank | **100 g** (0.67 % solution, EC ≈ 9 mS/cm) |
| Surfactant | yucca extract or Ecocert-equivalent at supplier rate |
| Tanks per spray event | 1 (covers 382.9 m² at operator-confirmed 40 mL/m² drip ceiling) |
| Target | foliage + fruit + stems indiscriminate (stems important for cell-wall hardening on disease side) |
| Delivered per spray | 71 mg Ca/m² applied × 0.40 = **28 mg Ca/m²/wk** |
| Tank — separate from oligo spray | YES (chemistry — in-tank-ksp-precipitation-guard — Ca²⁺ + SO₄²⁻ → gypsum precip) |

**Frequency paths (canopy gap 315 mg/m²/wk):**

| Path | Sprays / wk | Delivered | Canopy gap closed | Operator load |
|---|---:|---:|---:|---|
| A | 1 | 28 mg/m²/wk | 9 % | minimal |
| **B (starting point under new framing)** | **2** | **56 mg/m²/wk** | **18 %** | low |
| C (ramp if disease pressure persists) | 3 | 84 mg/m²/wk | 27 % | medium |
| Theoretical max useful | 4 | 112 mg/m²/wk | 36 % | high — diminishing returns; tissue Ca saturates |

**Read at week 2 and week 4.**
- **Tissue Ca trajectory** (leaf panel, single composite sample per row at week 4) — primary endpoint for goal 1.
- **New canker incidence** (count new lesions per row vs baseline 2026-05-24) — primary endpoint for goal 2.
- **Existing canker progression** (size of marked lesions) — secondary; expected NOT to reverse under Ca alone.

**Decision matrix at week 2.**

| Tissue / Canker | Action |
|---|---|
| Tissue Ca rising AND no new cankers | Sustain Path B (2×/wk) |
| Tissue Ca rising AND new cankers | Bump to Path C (3×/wk); reinforce sanitation + humidity levers |
| Tissue Ca flat AND no new cankers | Hold Path B; cuticle coverage may be lower than 0.40 — refit on week-4 sample |
| Tissue Ca flat AND new cankers | Bump to Path C; cuticle coverage suspect; reinforce sanitation + humidity; revisit obstacles chain (Mg cut may be needed concurrently) |

**Cost.** ~200 g CaCl₂·2H₂O / week (Path B), surfactant per supplier rate, sprayer time, 1 leaf-tissue sample at week 4. **The Ca foliar spray itself is the cheapest disease-prevention lever available — sanitation + humidity are operator-time costs, no consumable.**

**Cert effect.** Ca-foliar-with-surfactant coverage (0.40, cert 2 → 4 if tissue ±20 % correlates with predicted at week 4). Disease-prevention Ca-cell-wall mechanism (cert 4 literature → cert 3 Décembre-causal if new-canker rate drops measurably vs baseline).

**Ecocert.** CaCl₂ food-grade vendor + product certified (resolved 2026-05-24). Surfactant — yucca extract historically used at Décembre (CAN/CGSB-32.311 allowed; dropped 2026-05-05 supply chain, re-source needed) OR Ecocert-listed quillaja saponaria / equivalent.

---

### Disease-management appendix — Ca is the third lever, not the first

The stem-canker photo (2026-05-24, `nutrition/tomato/doc/stem-canker-2026-05-24/`) most plausibly shows *Botrytis cinerea* (gray mold) at a wound or mid-stem ingress point — pending PA Taillon confirmation. Foliar Ca prevents NEW infections via cell-wall hardening; it does NOT cure the existing lesion. Treatment ordering, in priority:

| Lever | Mechanism | Lead time | Cost |
|---|---|---|---|
| **1. Sanitation** — excise lesion + 2-3 cm margin to clean wood; sterilize cut tool (70 % ethanol or 10 % bleach) between cuts; remove cut tissue from the greenhouse (not the compost pile) | Removes inoculum source; prevents adjacent-plant spread | immediate | operator time only |
| **2. Humidity / ventilation** — Botrytis sporulates aggressively > 85 % RH at moderate temperature; lower nighttime RH via heating + ventilation, especially during cool damp evenings | Reduces sporulation + germination rate of remaining inoculum | days to weeks | operator time; energy cost for heating |
| **3. Foliar Ca + surfactant (this Test)** | Cell-wall hardening — Ca-pectate cross-links strengthen primary cell wall against fungal hydrolase penetration | weeks (cumulative tissue Ca rise) | low (this test) |
| **4. PA Taillon eyes on the lesion** | Differential confirmation — Botrytis vs Didymella vs Alternaria changes the disease-management recipe | days | PA visit / photo consult |
| **5. Biofungicide** (if disease pressure persists after 1-3) | Active antagonist (*Bacillus subtilis*, *Trichoderma harzianum*, *Streptomyces lydicus*) competes with pathogen on plant surface — Ecocert-allowed strains exist | weeks | product cost; varies |

This appendix is named here so future readers don't treat foliar Ca as a standalone disease lever — it's a compound effect with sanitation + humidity as the load-bearing pieces.

---

## Test 2 — Mg cut trial (B — antagonism)

**Hypothesis.** Soil Mg 5.2 meq/100g + Ca:Mg = 4.1 suppresses Ca²⁺ uptake at shared root membrane channels (LCT1 / CNGC family). Cutting Mg dose frees root sites for Ca.

**Protocol.** 4 weeks. Cut MgSO₄ fertigation 50 % (1 400 → 700 g/sem); hold everything else constant. Pre-cut baseline = 14 mai 2026 tissue panel (TOM #1).

**Read.** Tissue Mg + Ca at week 4.

**Decision matrix.**

| Tissue Mg | Tissue Ca | Read |
|---|---|---|
| holds suff | rises | B confirmed — Mg antagonism real and binding; sustain reduced Mg dose |
| drops to faible | rises | B confirmed; Mg supply tighter than soil-bank estimate suggested |
| holds suff | unchanged | B rejected — Mg isn't the binding antagonist |
| drops to faible | unchanged | B rejected and Mg headroom is smaller than thought — do not push lower |

**Cost.** 1 tissue test (~$30-50 CAD), 4 weeks.

**Cert effect.** Antagonism 3 → 4 if confirmed.

**Gate.** STORED MgSO₄ edit goes through `/retire-recipe`.

---

## Test 3 — Sucker pruning trial (E vegetative competition lever)

**NOT PRACTICAL**

**Hypothesis.** Water shoots (gourmands) divert xylem water — and the small Ca cargo it carries — away from fruit. Aggressive pruning reduces BER independent of any nutrition lever.

**Protocol.** 4 weeks. Two matched rows:

| Row | Pruning |
|---|---|
| A | Aggressive sucker removal weekly (every axil + visible water shoots) |
| B | Current regime (less aggressive) |

**Read.** BER incidence per cluster + fruit weight + vegetative mass observation at end-stem nodes (counted or photographed weekly).

**Decision matrix.**

| BER (A vs B) | Read |
|---|---|
| A < B | Vegetative competition real co-driver — combine cluster Ca spray + aggressive pruning |
| A = B | Vegetation isn't the Ca competitor in our regime — cluster spray alone is the lever |

**Cost.** Labor only.

**Cert effect.** Distribution-via-vegetative-sinks 3 → 4 if confirmed. Free lever — run in parallel with Test 1 on a different row.

---

## Test 4 — Foliar P (P-deficiency closure + indirect A test)

**NOT PRACTICAL**

**Hypothesis.** Tissue P -54 % is an independent deficiency. Closing it via foliar bypass tests two things at once: (a) does the leaf-side P shortfall resolve, (b) does tissue Ca also improve over 2-3 weeks (which would support mechanism A — P-driven root reduction limits Ca uptake).

**Protocol.** 3 weeks during T4-T5. Two matched rows:

| Row | Spray |
|---|---|
| A | Weekly foliar bone-meal extract at vendor max foliar rate, separate tank from oligo spray, + yucca surfactant |
| B | Control, no P spray |

**Viability caveat 1 — foliar delivery (2026-05-24, post-operator-input).** Décembre tank-to-area ratio is **15 L / 382.9 m² ≈ 40 mL/m²** (drip-threshold limited — operator confirms cannot push higher without runoff). At that volume, even literature-grade KH₂PO₄ at protocol 5 g/L would deliver only ~6.6 mg P/m² (cert 3) — closes ~1.7 % of the ~400 mg P/m²/wk P-gap. Ecocert-clean liquid bone-meal extract (5 % uptake, ~2-5 % P density vs KH₂PO₄'s 22.8 %) delivers ~1-2 mg P/m²/wk bare, ~9 mg P/m²/wk at tank-max + surfactant + 2×/wk — closes 0.3-4.5 % of the gap. This is not therapy. Test 4 as foliar is a positive-only diagnostic: tissue-P rise = mechanism A weakly confirmed; tissue-P unchanged = uninterpretable (cannot distinguish A-rejected from delivery-too-low).

**Viability caveat 2 — root-zone bone meal locked out at pH 7.4 (2026-05-24).** Initial pivot proposal was "switch to root-zone bone meal for grams-not-milligrams delivery." Withdrawn. Two compounding lockouts at Décembre's soil chemistry (pH 7.4, SME Ca 238 ppm, Mehlich-3 Ca ~11 000 kg/ha):

1. **Hydroxyapatite dissolution stalls above pH 7.** Bone meal IS Ca₁₀(PO₄)₆(OH)₂; its dissolution is acid-driven (fast < pH 6, near-stalled > pH 7). Soil solution already Ca-saturated → equilibrium opposes dissolution. Cert 4.
2. **Any dissolved P re-precipitates as Ca-phosphate.** Above pH ~7, soluble orthophosphate + abundant Ca²⁺ → dicalcium phosphate → octacalcium phosphate → hydroxyapatite, days-to-weeks. P-availability curves bottom around pH 6.5; at 7.4 we're in deep Ca-fixation territory. Cert 4.

Net: broadcast bone meal at pH 7.4 is ~10-20 % as P-available as the same dose at pH 6.5 (cert 3). It functions closer to a slow-release Ca source than a P source.

**Real P lever at pH 7.4 — see Test 7 below.** In-season workarounds (banded bone meal + localized acidification, PSB inoculants, acid-forming fertigation microdose) all dance around the fundamental pH problem; the actual fix is **elemental sulfur to drop pH 7.4 → 6.5**, multi-month timescale, separate workstream from the in-season Ca-BER intervention.

**Read.** Tissue P + tissue Ca at week 3 (one combined sample per row).

**Decision matrix.**

| Tissue P (A vs B) | Tissue Ca (A vs B) | Read |
|---|---|---|
| A higher (closure) | A higher | P-Ca coupling real; foliar P supports Ca; A weakly confirmed |
| A higher | unchanged | P-deficiency is leaf-side only; A rejected as primary Ca-cause; foliar P still warranted on its own |
| Both unchanged | unchanged | Foliar P uptake too low (cuticle barrier ~5-15 % for P); inconclusive on A; product/coverage refit |

**Cost.** Product (~$50-100 CAD), sprayer time, 2 tissue panels.

**Cert effect.** A 3 → 4 either direction if tissue P closes; if tissue P doesn't close, refit foliar-P delivery assumption.

**Ecocert.** This is the open question. Options ranked by certifier-allowance certainty:

| Product | Cert allowance | Cuticle uptake | Notes |
|---|---|---|---|
| Fish-bone meal liquid extract | cert 4 OMRI / CAN-CGSB allowed | low (~5 %) | Natural mineral source; vendor varies |
| Bone meal liquid extract | cert 3-4 (vendor-dependent) | low (~5 %) | Same; verify OMRI listing |
| KH₂PO₄ (monopotassium phosphate) | **NOT certified — synthetic, barred under CAN/CGSB-32.311 for Décembre** | higher (~10-15 %) | Do not deploy. Listed here only as the literature-protocol reference dose for the math below. |
| Potassium phosphite (KH₂PO₃) | cert 1-2 — often BARRED (classified as fungicide / synthetic by most organic certs) | high | Effective but risky for cert; **do not use without explicit certifier approval** |

Vendor verification BEFORE deploying. If only fish-bone / bone-meal extract is cleanly allowed, expect lower cuticle uptake → may need higher concentration or more frequent application; flag if Test 4 read is "tissue P unchanged."

**Tank compatibility.** P²⁻ + Ca²⁺ → Ca-phosphate precipitation (chemistry — in-tank-ksp-precipitation-guard). Foliar P CANNOT mix with the cluster CaCl₂ spray (Test 1). Separate spray events.

---

## Test 5 — Destructive root sample (A — root-mass reduction)

**NOT PRACTICAL**

**Hypothesis.** Severe soil P + tissue P -54 % has reduced root mass enough to limit Ca uptake surface.

**Protocol.** End of T5 (minimal future-impact window). Pull 3 plants from the tomato bed. Wash roots clean of substrate, dry 48 h at 60 °C, weigh dry root mass per plant.

**Read.** Dry root mass vs reference 2-4 g / plant for greenhouse tomato at end-T5 (cert 3 reference, Marschner Ch. 4 + extension data; varies by cultivar).

**Decision matrix.**

| Dry root mass | Read |
|---|---|
| ≥ 2 g / plant | Roots adequate; A rejected as primary cause |
| 1-2 g / plant | Roots reduced but not severely; A is a co-factor |
| < 1 g / plant | Severe root reduction; A is dominant; address P (slow lever — pH drop via sulfur, multi-month timeline) |

**Cost.** 3 plants + scale + drying oven (Décembre may already have a tissue-drying setup).

**Cert effect.** A 3 → 4 either direction.

**Prominence note (2026-05-24).** With both foliar P (Test 4) and root-zone bone meal locked out as fast P levers, Test 5 becomes **the only in-season read on mechanism A**. Promotes from "end-of-T5 if convenient" to "decision-critical fast read." If end-T5 dry root mass < 1 g/plant, A is dominant → commit to Test 7 (sulfur amendment) for next season; if ≥ 2 g/plant, A is rejected and the P-deficiency-tissue-signal is a leaf-side problem that doesn't gate Ca uptake.

---

## Test 6 — Replace yield-target proxy with a physics-anchored transpirationFactor

**Hypothesis.** Current `transpirationFactor` formula (`current_yield / target_yield`) is operator-anchored — the denominator is your guess of what you'd like, not what physics allows. Two physics-anchored replacements exist; both refute or confirm transpiration as the Ca-supply bottleneck.

### Variant 6a — Sunlight-anchored yield ratio (recommended primary)

**Formula.**

```
transpirationFactor = currentYield / theoreticalYieldFromSunlight
```

Theoretical yield from sunlight uses the standard greenhouse-crop radiation-use-efficiency relationship:

```
theoreticalYield = solar_radiation × cover_transmission × PAR_fraction
                   × canopy_interception × RUE_tomato_fresh
```

Worked example (May Décembre, 2 000 J/cm²/day = 20 MJ/m²/day, full canopy):

```
Solar inside        = 0.70 × 20  MJ/m²/day  = 14 MJ/m²/day
PAR fraction        = 0.50                  = 7 MJ PAR/m²/day
Full-canopy intercep= 0.90                  = 6.3 MJ PAR intercepted /m²/day
RUE fresh fruit     ≈ 8 g fresh / MJ PAR    (Wageningen high-tech greenhouse mid-band; cert 2 for Décembre — cultivar-specific)
                                            → 50 g/m²/day = 0.35 kg/m²/wk
```

**Pros.**
- Both inputs already collected at Décembre (sunlight via `weeklyMassFlowL()` solar input; yield via harvest scale)
- Denominator is physics, not opinion
- Free — no new instruments

**Cons / load-bearing caveats.**
- **Lag.** Fruit harvested in week N reflects intercepted radiation in weeks N-4 to N-6 (fruit-fill duration). Use rolling 4-6-week mean sunlight in the denominator, not the current week.
- **Circularity risk.** Under-yield has many causes (transpiration, nutrition, pollination, disease, pruning). Ratio < 1 doesn't isolate transpiration. Pair with the canopy-state check below.
- **RUE cultivar-specific.** Literature mid-band 6-10 g fresh/MJ PAR; refit once Décembre has a season of paired sunlight + yield data.

**Canopy-state pairing (decouples transpiration from other yield drivers):**

| Canopy observation | transpirationFactor read |
|---|---|
| Full canopy (rows touch, ground light < 10 %) | ≈ 1.0 regardless of yield ratio — canopy is transpiring at potential; under-yield is from other causes |
| Half canopy (sparse, visible ground 30-50 %) | use yield ratio directly |
| Sparse (young plants, < 30 % cover) | scale yield ratio × estimated canopy fraction |

### Variant 6b — Climate-anchored ET₀ ratio (cleanest if climate data available)

**Protocol.** 1-week measurement window:

| Datum | Source | Required |
|---|---|---|
| Daily mean T + RH | Greenhouse climate computer log (or max-min thermometer + RH card) | 7 days |
| Daily incoming solar (Rs) | Climate computer if instrumented; else clear-day proxy × cloudiness index | 7 days |
| Daily Dosatron pulse count × per-pulse volume → L / m² / day delivered | Operator log | 7 days |
| Plant count in tomato section | One-time count | 1 measurement |

**Compute.**

```
ET₀ = (Δ × Rn) / (λ × (Δ + γ))     # FAO-56 greenhouse simplification (no wind)
ETc = Kc × ET₀                      # Kc tomato T5 = 1.15 (FAO-56)
transpirationFactor = (irrigation × (1 − assumedDrainageFraction)) / ETc
```

Worked example with current model assumptions (May, 2 000 J/cm²/day, T 22 °C, 28 L/m²/wk irrigation, 25 % drainage):

```
Rs_inside  = 0.70 × 20  MJ/m²/day = 14 MJ/m²/day
Rn         = 0.65 × Rs           = 9.1 MJ/m²/day
Δ at 22°C  = 0.15 kPa/°C
γ          = 0.067 kPa/°C
λ          = 2.45 MJ/kg

ET₀ = (0.15 × 9.1) / (2.45 × 0.217) = 2.57 mm/day = 2.57 L/m²/day = 18 L/m²/wk
ETc = 1.15 × 18                     = 20.7 L/m²/wk

actualTranspiration ≈ 28 × 0.75    = 21 L/m²/wk

transpirationFactor = 21 / 20.7    ≈ 1.0
```

**Decision matrix.**

| Factor | Read |
|---|---|
| 0.9 - 1.0 | Transpiration at potential; current Ca gap NOT transpiration-driven; F latent |
| 0.6 - 0.8 | Transpiration sub-potential; investigate stomatal closure, drip uniformity, leaf area; F becomes active |
| < 0.6 | Severe transpiration deficit; water / climate is co-driver |

**Cost.** 1 week, notebook entries, no new instruments if climate computer already logs.

### Recommendation

Adopt **6a as the default** — free, uses inputs already collected, paired with canopy-state check to decouple. Adopt **6b in addition** if greenhouse climate computer is wired and logging T / RH; the two ratios cross-check each other.

Either replacement is a model improvement over the current yield-target proxy, regardless of which Ca mechanism wins.

**Cert effect.** Yield-target proxy (cert 1 — operator-anchored) → sunlight-anchored (cert 3) or FAO-56-anchored (cert 4).

---

## Run order

| Order | Test | Why this slot |
|---|---|---|
| 1 (start immediately) | Test 3 — Sucker pruning | Zero cost, zero risk, immediate start |
| 1 (start immediately) | Test 6 — Climate-based transpirationFactor | Zero cost, no inputs needed beyond what's already collected |
| 1 (start immediately) | Test 1 — Cluster CaCl₂ | Highest decision value; CaCl₂ vendor + product certified |
| 2 (parallel) | Test 2 — Mg cut | Different bed than Test 1; aligns on 4-week window; needs `/retire-recipe` for STORED Mg edit |
| 2 (decision-critical fast read on A) | Test 5 — Destructive root sample | Promoted from end-of-T5 slot; only in-season read on A after foliar+root-zone P both locked out |
| 3 (optional, positive-only diagnostic) | Test 4 — Foliar P bone-meal extract | Re-scoped — therapy ruled out by drip-limit + pH 7.4 lockout; only run if a positive tissue-P signal is wanted to weakly confirm A |
| 4 (next-season workstream) | Test 7 — Sulfur amendment | Multi-month lever; PA Taillon scoping; gated separately from in-season Ca-BER cycle |

A single tissue panel at week 4 covers Tests 1 + 2 + (4 if run) reads if you sample one composite leaf + one composite fruit from each treatment row.

---

## What changes in the model conditional on each outcome

| Test outcome | Model change |
|---|---|
| Test 1 confirms cluster Ca > foliar Ca > control | Add foliar Ca channel with **target = `fruit-cluster`** flag distinguishing from `foliage` target; coverage assumption ~5-15 % (fruit cuticle waxier than leaf); `CHANNEL_ROLE.Ca = { passive: 1.0, foliar: 1.0 }` |
| Test 2 confirms Mg-cut → Ca-rise | Add `cationAntagonism(soilCa, soilMg, soilK)` multiplier on Ca passive supply; refit MgSO₄ dose in STORED via `/retire-recipe` |
| Test 3 confirms pruning → BER drop | Document in derivation; not a code-level model change (operator-procedure lever) |
| Test 4 confirms foliar P → Ca rise | Add `rootHealthMultiplier(soilP, soilPh)` on all root-channel supply; P shortage becomes a Ca-supply multiplier |
| Test 5 confirms root mass < 1 g / plant | Cert bump on A; same model change as Test 4 confirmation; commits Test 7 (sulfur) for next season |
| Test 7 confirms pH drop → soil-P SME rise | Model `rootHealthMultiplier(soilP, soilPh)` activates as the dominant A-axis lever; `PH_RESPONSE` axis cert bumps 3 → 4 |
| Test 6 reads factor 0.9-1.0 | Confirm current diagnosis; replace `transpirationFactor` formula with FAO-56 ratio; `TRANSPIRATION_COUPLING` axis stays latent but ready |
| Test 6 reads factor < 0.7 | `TRANSPIRATION_COUPLING` becomes active contributor; investigate stomatal / drip / canopy issues at the operator level |

If multiple tests confirm, the model gains **per-element root-channel multipliers** alongside the existing `PH_RESPONSE` axis — each anchored to its own mechanism (transpiration, antagonism, root-health). All compose via multiplication; foliar bypasses all of them.

---

## Out of scope

- STORED recipe edits — gated on `/retire-recipe`, separate operator decision.
- Operator-page surfacing of BER + cluster-spray instructions — once Test 1 confirms, write spec entry first, then page renderer reads from spec.
- pH-correction strategy is **no longer out of scope** — captured as Test 7 above (multi-month, PA-Taillon-scoped, separate workstream from the in-season cycle).
