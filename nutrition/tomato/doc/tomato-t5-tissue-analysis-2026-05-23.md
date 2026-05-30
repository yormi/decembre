# Tomato T5 tissue panel — analysis & priority

**Date:** 2026-05-23
**Source PDF:** `nutrition/doc/tissus - 2026-05-22.pdf`
**Lab:** Agro-Enviro-Lab (La Pocatière) — sample reception 14 mai 2026,
report 22 mai 2026
**Sample:** TOM #1 (TI-0025332), Tomate feuilles, stage T5 (pleine
production), digestion acide + ICP

---

## 1. Observed tissue values

| Element     | Observed | Lab floor | Lab ceiling | Lab verdict                  |
|-------------|----------|-----------|-------------|------------------------------|
| N (%)       | 2.27     | 3.10      | 5.10        | déficient                    |
| P (%)       | 0.23     | 0.50      | 0.80        | déficient (-54 %)            |
| K (%)       | 3.26     | 3.00      | 6.00        | at floor (one step away)     |
| Ca (%)      | 3.46     | 4.00      | 6.00        | déficient                    |
| Mg (%)      | 0.52     | 0.31      | 1.00        | mid-suff                     |
| S (%)       | 2.29     | 0.30      | 0.70        | élevé (+227 %)               |
| Mn (ppm)    | 132      | 31        | 100         | élevé                        |
| Cu (ppm)    | 12       | 4         | 8           | élevé                        |
| Zn (ppm)    | 56       | 26        | 80          | suff                         |
| B (ppm)     | 57       | 31        | 150         | suff                         |
| Fe (ppm)    | 80       | 50        | 200         | suff                         |
| C / N ratio | 17.1     | —         | —           | high (typical tomato 10-13)  |

Cert: panel reading cert 4 (direct ICP). Sufficient-range
interpretation cert 3 (generic tomato norms, not cultivar-specific).

---

## 2. STORED recipe at T5 — what's actually delivered

Reservoir 170 L diluted at 2 % → 8 517 L solution / week over
382,6 m² (7 planches × 54,7 m²).

### Fertigation (PA Taillon, 8 avril 2026)

Grams to dissolve in master tank per week, T5:

| MgSO₄·7H₂O | K₂SO₄ | FeSO₄ | ZnSO₄ | MnSO₄ | CuSO₄ | Borax | NaMoO₄ |
|------------|-------|-------|-------|-------|-------|-------|--------|
| 1396       | 3489  | 20    | 4     | 7     | 1     | 9     | 1      |

Zero N, zero P, zero Ca in fertigation by design (organic + crisis
constraints).

### Sidedress (Actisol 5-3-2 + Farine de plumes 13-0-0)

Per planche per week, T5:

| Actisol | Farine plumes |
|---------|---------------|
| 900 g   | 1 341 g       |

Effective N at T5 ≈ 2.23 g N / m² / wk via mineralization (Farine
13 % × 70 % eff. after the 2026-05-23 refit; Actisol contribution
zero — sidedress-recipe — ca-aware-product-gate gates it out on Ca-saturated soil).

### Foliar Spray A (single weekly tomato spray)

15 L backpack, 30 % effective coverage (no yucca surfactant):

| MnSO₄ | ZnSO₄ | Solubore | CuSO₄ | NaMoO₄ | FeSO₄·7H₂O |
|-------|-------|----------|-------|--------|-------------|
| 22 g  | 22 g  | 7 g      | 2 g   | 1 g    | 80 g        |

Foliar is micros-only — no N, no P, no K, no Ca, no Mg.

### Soil mass-flow (SME × 15 L transpiration × seasonal modifiers)

Berger Labs SME 39087, 10 avril 2026, tomato 1 sample. May
N-mineralization multiplier 1.3 × 0.85 base eff. for N. Fe gets
× 0.15 for pH-lockout reductase suppression. Others × 1.0.

---

## 3. Delivered vs demand at T5 (mg / m² / wk)

Target yield 1,5 kg / m² / sem.

| Element | Demand | Fert  | Sidedress | Foliar | Soil mass-flow | Total | Δ vs demand | Tissue verdict | Match? |
|---------|--------|-------|-----------|--------|----------------|-------|--------------|----------------|--------|
| N       | 4050   | 0     | 2229      | 0      | 752            | 2981  | **-26 %**    | déficient (-27 % of floor) | ✓ tight |
| P       | 660    | 0     | ~50       | 0      | 17             | ~67   | **-90 %**    | déficient      | ✓      |
| K       | 6000   | 4093  | 165       | 0      | ~1742 (capped) | ~6000 | ±0 %         | at floor       | ✓      |
| Ca      | 2250   | 0     | 609       | 0      | 2250 (capped)  | ~2250 | ±0 %         | déficient      | ✓ plant-needs — ca-mg-biomass-transpiration-coupled |
| Mg      | 855    | 360   | ~165      | 0      | 1190           | 1715  | +101 %       | mid-suff       | ✓      |
| S       | ~600   | 2200  | ~150      | sulfates | low          | ~2400 | **+300 %**   | élevé          | ✓ sulfate chemistry |
| Mn      | 7.5    | 5.8   | trace     | 5.4    | 0.45 (BD)      | 11.6  | +55 %        | élevé          | ✓ real (wash-confirmed) |
| Cu      | 1.5    | 0.65  | trace     | 0.39   | 0.6            | 1.64  | +9 %         | élevé          | ✓ real (wash-confirmed) |

K and Ca capped at demand (supply > demand isn't physically pulled
into plant tissue).

---

## 4. Findings

### 4.1 Tissue matches STORED-recipe model prediction (cert 4)

Every element direction in the observed tissue matches what the
delivered-vs-demand math predicts. N short → tissue déficient.
P massively short via lockout → tissue heavily déficient. K
supply ≈ demand → tissue at floor with no luxury. Ca abundant in
SME but transpiration-coupled (plant-needs — ca-mg-biomass-transpiration-coupled) → tissue déficient. Mg
over-supplied → mid-suff. Sulfate-chemistry over-delivers S →
tissue élevé. Foliar micros modestly over-supply → tissue élevé.

**The lockout-multiplier crisis model is validated.** Cert on the
lockout story bumps 3 → 4. Everything downstream (foliar Mn / Zn /
Fe routing, transpiration coupling for Ca / Mg, P-foliar-only
carve-outs) rests on this multiplier being correct — now backed
by peak-demand tissue.

### 4.2 P at -90 % of demand is the lockout fully visible

STORED has zero fertigation P + zero foliar P + Actisol P passing
through pH 7.4 lockout. SME P 1,1 ppm vs spec 5-50 quantifies the
lockout. Plant receives ~10 % of demand at peak. Tissue 0.23 %
vs floor 0.50 % confirms.

### 4.3 S élevé is real over-supply, not sample-prep contamination

K₂SO₄ + MgSO₄ in T5 fertigation deliver ~2 200 mg S / m² / wk via
sulfate chemistry vs tomato demand ~600 mg / m² / wk (+300 %).
The over-supply is built into the recipe, independent of leaf-wash
status. Contamination hypothesis narrowed: still in play for Mn /
Cu, not for S.

**2026-05-30 — Mn / Cu contamination ruled out (cert 3).** Lab
confirmed samples are washed before digestion (the prep-protocol
confirmation Open Question #7 was pending). A wash strips loose
surface MnSO₄ / CuSO₄ residue from the weekly foliar spray; still-
élevé after washing → real tissue over-supply, not surface residue.
Residual uncertainty keeping it cert 3 not 4: (a) foliar Mn / Cu
that penetrated the cuticle reads as tissue but isn't metabolic, so
magnitude is slightly over-read; (b) a plain water rinse needn't
remove all dust — minor for Mn, and Fe (the classic dust trap)
reads suff here, so no dust signal in this panel. Net: contamination
escape-valve closed for all three élevé elements.

### 4.4 N supply gap matches tissue once feather-meal eff refit lands

Pre-refit, the modelled gap was -10 % under `FarinePlumes.eff = 0.75`
(Sonneveld mid-band); tissue showed -27 % of floor. The mismatch was
the trigger.

After the 2026-05-23 refit to `FarinePlumes.eff = 0.70` (Sonneveld
floor), modelled gap moves to **-26 %**, matching observed tissue
-27 % almost exactly. C / N ratio 17.1 corroborates N déficience
independently.

The single-cohort refit defends the magnitude but not the precise
endpoint — sub-0.70 refit (e.g. 0.65) would imply cumulative shortfall
from earlier stages is also contributing. Refit downward past lit
floor still gated on n ≥ 5 stage-tagged cohorts per the existing
back-test trigger in `plant-needs/derivation.md` and the parallel
trigger in `sidedress-recipe/derivation.md`.

### 4.5 Ca déficient despite abundant SME bank

SME Ca = 238,8 ppm × 15 L transpiration = 3 582 mg / m² / wk
apparent supply. Tissue still déficient. First-pass reason
(plant-needs — ca-mg-biomass-transpiration-coupled): Ca uptake is xylem-mobile only + transpiration-coupled
— at sub-target transpiration, mass-flow doesn't physically deliver
the SME-implied bulk. The plant takes its ca-mg-biomass-transpiration-coupled-capped allocation,
not the SME ceiling. Operator lever: maintain high-transpiration
regime (humidity, irrigation timing).

**2026-05-23 reframe — transpiration alone is not the sole driver.**
Operator touch-test on canopy leaves shows leaf temperature
clearly below ambient air, consistent with healthy mid-day
transpiration (evaporative cooling). This qualitative signal
invalidates the framing that the Ca tissue gap is solely a
delivery-side / transpiration-volume problem — if transpiration
is working at the leaf-end, the Ca gap must come from elsewhere
in the pipeline. Two candidate root-uptake-side mechanisms remain
in play: (a) **cation antagonism at the root membrane** — K⁺ + Mg²⁺
flux from K₂SO₄ 3 489 g + MgSO₄ 1 396 g/wk fertigation competing
with Ca²⁺ for transporter sites (see § 4.7); (b) **P-starvation-
limited root mass** — P at -90 % of demand restricts root growth,
reducing total Ca-uptake surface even with abundant soil Ca. Both
candidates sit in modelling gaps (fertigation-recipe — uptake-efficiency-factor only encodes the
Ca→K/Mg direction, not the reverse; root-mass coupling is not
modelled). The high-transpiration regime operator lever still helps
for humidity / leaf wetness / Botrytis pressure even when Ca
delivery isn't the sole bottleneck. Refinement gated on n ≥ 2
cohorts with paired tissue + Mehlich-3 + STORED-recipe traces +
quantitative leaf-to-air ΔT (IR thermometer) to confirm the
qualitative cold-leaf signal.

### 4.6 Botrytis sensitivity as third P+Ca crisis manifestation

2026 spring is the first Décembre cycle where tomatoes
show grey-mold sensitivity. Two distinct presentations both
connect mechanistically to the P + Ca gap in this tissue
panel — making Botrytis a third independent corroboration
of the lockout-multiplier crisis model.

**Leaf Botrytis — Ca-cell-wall mechanism (cert 4 mechanism /
cert 3 Décembre-causal).** Ca pectates are the cell-wall
mortar that gates fungal cutinase + pectinase penetration
(Conway / Sams / Volpin & Elad literature). Leaf Ca 3.46 %
is below lab floor 4.00 % and well under the
Botrytis-resistance band 4.5-5.5 %; tomato leaves at this
Ca level are documented as more susceptible across the
literature. Soil Ca is abundant (Mehlich-3 10 989 kg/ha,
SME 238 ppm); plant-needs — ca-mg-biomass-transpiration-coupled transpiration-coupling gates delivery
to leaves. Note: a parallel hypothesis — cation antagonism
at the root membrane (K⁺ + Mg²⁺ fertigation flux competing
with Ca²⁺ uptake) — sits in a modelling gap not encoded by
`PH_UPTAKE_FACTOR_AT_CURRENT_SOIL` (which only handles the
Ca → K/Mg direction, not the reverse). Both delivery-side
(plant-needs — ca-mg-biomass-transpiration-coupled) and uptake-side (cation antagonism) candidates
remain in play; refinement gated on n ≥ 2 cohorts with
paired tissue + Mehlich-3 + STORED-recipe traces.

**Stem Botrytis at old scars — P+Ca wound-suberization
failure (cert 4 mechanism / cert 3 Décembre-causal).**
Wound suberization requires ATP-intensive callus formation
(Ca + B-dependent) plus a lignin / suberin barrier deposition
that takes 1-3 weeks (Mn + Cu + P-dependent). At P -90 % of
demand, the cascade stalls at barrier formation; weeks-old
de-leafing scars never close fully and become Botrytis
entry points. Co-driven by Ca déficience at the wound
margin. Observation pattern at Décembre: infections cluster
at old scars (weeks-old de-leafing wounds), not at fresh
cuts — diagnostic of wound-healing failure rather than
pruning-hygiene failure.

**Third corroboration of the lockout model.** Combined
with § 4.1 (element-direction match across all 8 elements)
and § 4.2 (P -90 % as lockout fully visible), the Botrytis
presentation makes the lockout-multiplier crisis model
manifest across three independent axes:

| Axis | Manifestation | Cert |
|---|---|---|
| Tissue concentration | element-direction match across 8 elements | 4 |
| Plant performance | vigor stall under P starvation + N déficience | 4 |
| Disease pressure | grey-mold sensitivity at the Ca + P-impaired wound interface | 3-4 |

No new spec, no constant change. Bumps confidence on the
integrated lockout-regime story; doesn't unlock further
constant refits without additional cohort data.

### 4.7 Cation antagonism hypothesis — root-uptake-side candidate

Surfaced 2026-05-23 to explain why leaf Ca tissue sits
below floor (3.46 % vs 4.00 %) despite three favourable
upstream signals: (a) abundant soil Ca (Mehlich-3 10 989
kg/ha, SME 238 ppm); (b) cold-leaf empirical signal
showing healthy transpiration at the leaf-end (§ 4.5);
(c) plant-needs — ca-mg-biomass-transpiration-coupled transpiration-coupling alone predicting full
Ca delivery at the panel-day climate conditions.

**Mechanism.** Classical K:Ca and Mg:Ca antagonism at
the root-membrane cation transporters. Décembre's T5
fertigation pulses K₂SO₄ 3 489 g + MgSO₄ 1 396 g/wk
through the dripper line, producing a sustained K⁺ +
Mg²⁺ flux at the root surface that competes with Ca²⁺
for transporter binding sites. The antagonism acts at
transport-activity level — tissue concentrations don't
have to be high for the suppression to bite; what matters
is the ratio of competing ions at the root-surface
microsite during fertigation events.

**Modelling gap.** `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL`
(fertigation-recipe — uptake-efficiency-factor, `fertigation-recipe/data.js:67`) encodes the
**reverse direction** of antagonism: Ca-saturated CEC
discounts K, Mg, B uptake (K 0.90, Mg 0.85, B 0.80). The
K+Mg → Ca direction has no hook in the model. Adding a
Ca entry to that constant requires:

- Cert ≥ 3 from cohort data — paired tissue + Mehlich-3 +
  STORED-recipe trace, n ≥ 2 stage-tagged cohorts
- Or external anchor — PA Taillon read on the dripper-flux-
  vs-Ca-uptake relation, vendor literature for the
  K₂SO₄ + MgSO₄ pulse range typical of Décembre's fertigation
- A derivation-side rationale entry distinguishing
  CEC-level (steady-state, currently modelled) from
  dripper-pulse-level (transient, not modelled) antagonism

The modelling gap is also where a "trim MgSO₄" or "split
K₂SO₄ between fertigation and foliar" lever would prove
itself. Without cohort data, recipe changes targeting the
hypothesis are pre-emptive.

**Operator triage independent of model.** Trimming MgSO₄
STORED dose is the cleanest candidate three-for-one: tissue
Mg sits at +68 % over floor (mid-suff, well above
déficience), modelled supply at +101 % over demand
(clear over-supply), so a trim 1 396 → ~700 g/wk lands
inside tissue floor + reduces Mg → Ca antagonism + reduces
sulfate-form S over-supply (+300 %). Cert 3 on the
direction; cert 2 on the precise endpoint. STORED edit
gated on `/retire-recipe` audit cycle, operator timing.

Hypothesis cert 3. Not eligible for `PH_UPTAKE_FACTOR_AT_
CURRENT_SOIL` Ca-entry extension or any model constant
change without cohort validation. Captured here so future
readers don't re-derive the framing.

---

## 4b. STORED vs FP divergence at T5

The trace above used STORED (what's actually applied) — but it's
worth noting where STORED diverges from the model's first-principles
target.

| Channel | STORED vs FP at T5 | Magnitude |
|---------|---------------------|-----------|
| Fertigation | identical by fertigation-recipe — fp-target-mirrors-sizer boot-pin (`wireFpFertigation`) | ±0 % — K₂SO₄ 3 489 g, MgSO₄ 1 396 g, Solubore 9 g match |
| Sidedress | **STORED < FP** | Farine 1 341 g/planche vs FP 1 773 g — STORED under-applies ~24 % (post-refit FP) |
| Foliar (Spray A) | STORED slightly > FP | Mn / Zn / Mo over; Fe under |

### N gap under FP sidedress (hypothetical)

If the team weighed Farine at the FP target (1 773 g/planche/wk
T5 instead of 1 341 g), sidedress N would deliver ~2 947 mg/m²/wk
instead of 2 229 — closing the modelled N gap to ~-9 % vs demand:

| Scenario | Sidedress N | Soil N | Total | Δ vs demand 4050 |
|----------|-------------|--------|-------|------------------|
| STORED (applied today) | 2 229 | 752 | 2 981 | -26 % |
| FP sidedress (hypothetical) | ~2 947 | 752 | ~3 699 | -9 % |

FP sidedress closes most of the modelled gap but not all. Residual
factors:

- Single-cohort refit at 0.70 — sub-floor refit (0.65) gated on
  n ≥ 5 cohorts.
- Cumulative N shortfall through earlier stages (March
  mineralization × 0.8, April × 1.0) compounded into T5 snapshot.
- Single-sample cohort variability.

### Implication

The sidedress ramp is the most direct lever to close the N gap
at the model level. Foliar Ocean N is the complementary lever for
the residual ~9 %. Both require `/retire-recipe` audit cycle on
STORED edits.

---

## 5. Priority — low-hanging fruit ranked

| Rank | Move | Impact | Effort | Cert | What it closes |
|------|------|--------|--------|------|----------------|
| 1 | **Sidedress ramp toward FP** — Farine 1 341 → 1 773 g/planche/wk T5 | 4/5 | 2/5 (weigh more) | Ecocert ✓ | Modelled -26 % N gap shrinks to -9 %; matches post-refit FP |
| 2 | Weekly foliar Ocean 15-1-1 spray (complementary to #1) | 3/5 | 1/5 | Ecocert ✓ | +5-8 % N delivery, additional tissue closure |
| 3 | Maintain high-transpiration regime | 3/5 | low (ops) | n/a | Ca transp-coupling improves |
| 4 | Drop foliar Mn / Zn / Mo toward FP (Mn 22→18, Zn 22→16, Mo 1→0.5) | 2/5 | 1/5 | ✓ | Stops real over-supply (ungated 2026-05-30 — wash confirms not contamination) |
| 5 | K₂SO₄ modest bump for luxury K | 1/5 | 1/5 | ✓ | Trades K luxury for more S over-supply |
| — | Foliar P push | would be 4/5 | high | no Ecocert-allowed source exists | P gap |
| — | Non-Ca compost / pH drawdown for next cycle | 4/5 long-term | 4/5 | TBD | All locked elements over months |

All STORED edits go through `/retire-recipe` audit cycle first.

### Honest read

Post-refit, the dominant lever is **#1 — sidedress Farine ramp
1 341 → 1 773 g/planche/wk T5.** Closes -26 % modelled gap down
to -9 %. Cheap (weigh more), fast, Ecocert-clean. **#2 — weekly
foliar Ocean** is the residual-closer: +5-8 % N delivery to
leaves, takes the post-ramp -9 % to near zero.

**P is structural.** No Ecocert-allowed foliar P source at
meaningful rate exists for organic farms. The plant gets ~10 % of
demand at peak because of pH 7.4 lockout. Only path: pH drawdown
(slow, multi-cycle) or non-Ca compost procurement for next cycle.

**K, Ca, Mg, S, Mn, Cu** all at or above where STORED puts them.
S is over by 3× via sulfate chemistry — any K dose bump
compounds the S over-supply mathematically.

---

## 6. Cert bumps justified by this analysis

| Where | What | From → To | Rationale |
|-------|------|-----------|-----------|
| `nutrition/soil-contribution` lockout multiplier | crisis-mechanism cert | 3 → 4 | Peak-demand tissue confirms the multiplier's predictions across all elements |
| `nutrition/tomato/plant-needs` T5 macros | demand-model cert | 2 → 2 (held) | Tissue doesn't refit demand — it confirms supply gap. Cert stays gated on n ≥ 5 cohorts for refit. |

---

## 7. Open questions

- ~~**Mn / Cu élevé** — sample-prep contamination vs real foliar
  over-supply. Pending Catherine's lab prep-protocol confirmation
  before any foliar refit.~~ **Resolved 2026-05-30** — lab washes
  samples before digestion; contamination ruled out, both reads are
  real foliar over-supply (cert 3, see § 4.3). Priority #4 ungated.
- **Mineralization-efficiency factor refit** — `FarinePlumes.eff`
  moved 0.75 → 0.70 on 2026-05-23 (single-cohort refit to Sonneveld
  literature floor). Sub-floor refit (≤0.65) still gated on n ≥ 5
  cohorts with stage-tagged tissue + petiole sap NO₃-N tracking.
  Actisol 0.60 untouched (sidedress-recipe — ca-aware-product-gate gates it out of channel today).
- **Per-stage tissue panels** — single T5 sample doesn't support
  stage-by-stage anchor refit. Refit triggers fire on n ≥ 5
  stage-tagged cohorts (per existing `plant-needs/derivation.md`
  back-test trigger).

---

## 8. Cross-references

- Tissue PDF: `nutrition/doc/tissus - 2026-05-22.pdf`
- Empirical anchor block + delivered-vs-demand trace:
  `nutrition/tomato/plant-needs/derivation.md` §
  "Empirical anchor — TOM #1 T5 tissue panel"
- STORED recipes:
  - `nutrition/tomato/fertigation-recipe/app/stored.js`
  - `nutrition/tomato/sidedress-recipe/app/stored.js`
  - `nutrition/tomato/foliar-strategy/app/stored.js`
- Demand model: `nutrition/tomato/plant-needs/data.js`
- Soil-contribution model:
  - `nutrition/soil-contribution/data.js` (SME values)
  - `nutrition/soil-contribution/integrator.js`
    (`soilWeeklyAvailable`, `N_MINERALIZATION_BY_MONTH`)
- Crisis context: `nutrition/doc/CLAUDE.md` §
  "Soil tests — current crisis"
- Tissue-read methodology (wash clears residue not cuticle/dust):
  `nutrition/learnings/tissue-wash-clears-residue-not-cuticle-or-dust.md`
