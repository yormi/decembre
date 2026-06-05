# Derivation — soil-contribution

Live trace for REQ-tied constants in `data.js` and formulas in `calc.js`.
Rejected alternatives + historical decisions go to `learnings.md`.

---

## Weekly uptake — bank ÷ min(mass-flow, plant peak demand) — months-to-depletion-clamped-by-peak-demand, sme-soil-solution-wired-per-crop-element

The depletion-runway denominator landed in two passes:

1. **2026-05-16** — switched from "weekly demand" to "mass-flow capacity":
   `SME_ppm × transpiration_L/m²/wk`. This correctly modelled lockout
   elements (P at pH 7.4: bank drains at SME-throttled trickle, not at
   demand) but overstated depletion for over-supplied elements (Ca on the
   Ca-saturated tomato bed: bank drains at demand rate, not at the higher
   mass-flow capacity the plant doesn't use).
2. **2026-05-17** — added a min-clamp at plant peak weekly demand. The
   plant cannot draw faster than it demands even when mass-flow exceeds
   demand. Below-demand mass-flow elements (lockout regime) are unchanged
   (the clamp is a no-op there). Above-demand mass-flow elements (Ca / Mg
   on the tomato bed) now reflect honest plant-drain runway.

Math (final form):

```
mass_flow_mg_per_m2_per_wk = SME_ppm × transpiration_L_per_m2_per_week
weekly_uptake_mg_per_m2    = min(mass_flow, PLANT_PEAK_WEEKLY_DEMAND[crop][el])
runway_months              = bank_mg_per_m2 / (weekly_uptake × 4.33)
```

For turnover-bound elements (N today; `TURNOVER_BOUND_ELEMENTS`) the
function returns `null` — see § "N runway intentionally blank" below.

Mass-flow framing: the transpiration stream is the carrier that delivers
ions from soil solution to the root surface. Soluble ions at concentration
`C` ppm in the solution that the plant draws up at rate `Q` L/m²/wk are
delivered at `C × Q` mg/m²/wk. Diffusion + active transport add small
corrections that we fold into the per-element SME cert. The min-clamp
caps that delivery at the rate the plant actually pulls.

### Transpiration estimates

| Crop    | L/m²/wk | Cert | Source / band                                          |
|---------|--------:|:----:|--------------------------------------------------------|
| Tomato  | 15      | 2    | Quebec greenhouse cycle-weighted average. Peak summer 25–30; early-ramp 5–8. Sonneveld/Voogt range 0.4–2.5 mm/day × 7 = 2.8–17.5 L/m²/wk; Décembre-specific climate-band picks the upper-mid. |
| Lettuce | 4       | 2    | Salanova production cycle average. Cool months 2–3; warm 5–8. Lower than tomato (smaller leaf area, shorter cycle, denser planting). |

**Refinement trigger:** in-house transpiration log (weighing-tray or pump
totalizer ÷ planted area), or PA Taillon bench data. Once we have per-stage
transpiration, this constant can become stage-resolved without breaking
the API (replace scalar with `(crop, stage) → number` and update the
caller).

### SME readings — April 10 2026 (Berger Report 39087)

| Element | Tomato ppm | Lettuce ppm | Cert | Note                                  |
|---------|-----------:|------------:|:----:|---------------------------------------|
| N       | 45.4       | 72.6        | 4    | NO3-N + NH4-N (active mineral pool)   |
| P       | 1.1        | 0.8         | 4    | ↓ below spec 5–50 (lockout at pH 7+)  |
| K       | 292.3      | 54.4        | 4    | tomato in spec; lettuce mid-band      |
| Ca      | 238.8      | 114.4       | 4    | tomato ↑ above spec 40–200 (saturated)|
| Mg      | 79.3       | 30.2        | 4    | both in spec                          |
| Fe      | 0.86       | 0.22        | 4    | lettuce ↓ below spec 0.30             |
| Mn      | <0.03      | <0.03       | 2    | DL ceiling — recorded as 0.03         |
| Zn      | <0.03      | <0.03       | 2    | DL ceiling — recorded as 0.03         |
| B       | 0.18       | 0.17        | 4    |                                        |
| Cu      | 0.04       | 0.03        | 4    |                                        |
| Mo      | 0.02       | 0.02        | 4    |                                        |

Detection-limit handling: Mn and Zn report `<0.03` ppm on both crops. We
store 0.03 (the ceiling) — this gives a conservative *lower* runway (faster
draw than reality), which is the safe direction for a depletion warning.
When pH drops below ~6.5, Mn/Zn should climb out of lockout into the
measurable range and re-source from the new report will replace the
ceilings with direct readings.

**Refinement trigger:** next Berger SME analysis. Especially: any soil-pH
shift, post-sulfur amendment, or post-compost change.

### N runway intentionally blank — turnover-bound

The Mehlich-3 N bank (NO₃-N + NH₄-N) is a quasi-steady-state mineral
pool, not a depleting reservoir. Mineralization from soil organic matter,
compost amendments, and side-dress hydrolysis replenishes the pool on a
weekly-to-daily cadence; the displayed runway computed from `bank ÷ uptake`
would be the counterfactual "weeks until empty IF mineralization stopped"
— a scenario that doesn't materialise operationally. At the live constants
the formula reads `7 272 / (45.4 × 15 × 4.33) ≈ 2.46 months` for tomato,
which would dominate the column as the shortest runway on the grid and
mis-cue operators toward sidedress / fertigation N supplementation.

`soilMonthsToDepletion` gates at the top: `if (TURNOVER_BOUND_ELEMENTS
.includes(element)) return null`. The renderer renders `—` for `null`,
parallel to elements without bank or SME data. The pourquoi-modal
`N-not-mehlich` key explains turnover-bound framing at the row level.

N supply monitoring routes through tissue tests + compost / sidedress
mineralization accounting (not via the soil-bank runway).

**Refinement trigger:** if S enters the gap grid and is also turnover-
bound, add it to `TURNOVER_BOUND_ELEMENTS`.

### Example runway: tomato P — lockout regime (clamp no-op)

```
bank          = 55 770 mg/m²
SME           = 1.1 ppm
transp        = 15 L/m²/wk
mass-flow     = 1.1 × 15 = 16.5 mg/m²/wk
peak demand   = 660 mg/m²/wk
min(…)        = 16.5  (mass-flow binds — lockout)
runway months = 55 770 / (16.5 × 4.333…) ≈ 780 months ≈ 65 years
```

Decades-long runway flags the right thing: at pH 7.4 the soluble P pool
is throttled to a trickle, so the vault drains slowly even with a heavy
bank. Bank is not the bottleneck; pH-driven availability is. Clamp inert
here.

**Tissue validation (2026-05-23):** T5 tomato tissue panel (TOM #1,
14 mai 2026, `nutrition/doc/tissus - 2026-05-22.pdf`) shows leaf P at
0.23 % vs lab floor 0.50 % (-54 %). Under STORED at T5 the only
P pathway is the mass-flow trickle modelled here (16.5 mg/m²/wk) +
Actisol mineralization passing through the same lockout; total
supply ~67 mg/m²/wk vs 660 demand (-90 %). Severely-déficient
tissue confirms the lockout-regime prediction. The mass-flow-binds
mechanism for P is validated against peak-demand tissue (cert
3 → 4). Full delivered-vs-demand trace in
`nutrition/tomato/doc/tomato-t5-tissue-analysis-2026-05-23.md`.

### Example runway: tomato Ca — demand-bound regime (clamp binds)

```
bank          = 1 098 910 mg/m²
SME           = 238.8 ppm
transp        = 15 L/m²/wk
mass-flow     = 238.8 × 15 = 3 582 mg/m²/wk
peak demand   = 2 250 mg/m²/wk         (T5 whole-plant, plant-needs)
min(…)        = 2 250  (demand binds — Ca-saturated bed over-supplies)
runway months = 1 098 910 / (2 250 × 4.333…) ≈ 113 months ≈ 9.4 years
```

Pre-clamp formula gave 5.9 years on mass-flow capacity; the plant doesn't
actually drink that fast. Clamping at peak demand stretches the honest
runway to ~9.4 years — still long enough that no operator action follows,
which is the right read for a Ca-saturated bed.

### Example runway: tomato Mg — demand-bound regime (clamp binds)

```
bank          = 164 630 mg/m²
SME           = 79.3 ppm
transp        = 15 L/m²/wk
mass-flow     = 79.3 × 15 = 1 190 mg/m²/wk
peak demand   = 855 mg/m²/wk
min(…)        = 855  (demand binds, modestly)
runway months = 164 630 / (855 × 4.333…) ≈ 44 months ≈ 3.7 years
```

Pre-clamp gave 31.9 months (2.7 yr). Modest stretch; same read (no
operator action).

### Example runway: tomato K — mass-flow-bound (clamp no-op at our demand)

```
bank          = 211 840 mg/m²
SME           = 292.3 ppm
transp        = 15 L/m²/wk
mass-flow     = 292.3 × 15 = 4 385 mg/m²/wk
peak demand   = 6 000 mg/m²/wk         (T5 whole-plant; tomato fruit + canopy)
min(…)        = 4 385  (mass-flow binds — plant could pull more than soil delivers)
runway months = 211 840 / (4 385 × 4.333…) ≈ 11 months
```

K runway unchanged by the clamp at our T5 demand model. SME-throttled
delivery is the gate for K despite the Ca-saturation regime. K is the
element to watch on this bed — but the bank refill story comes from K₂SO₄
fertigation per `only-ca-p-participate-in-gap-chain` (Ca + P only routed via soil bank; K via active
channels).

### Lettuce: clamp inert everywhere

All wired lettuce elements sit in the lockout / mass-flow-binds regime at
the current SME × 4 L/m²/wk water uptake (lettuce mass-flow < lettuce
peak demand for every element). The lettuce row runways are unaffected
by the clamp; the formula reduces to the prior SME-throttled form.

---

## Soil-bank mg/m² conversion — bank-per-crop-mehlich3-reservoir

Two reporting conventions on the Berger Mehlich-3 panel; both convert
to mg/m² for consumer arithmetic parity with the rest of the weekly
gap chain.

**kg/ha-reported elements** (P, K, Ca, Mg, Na): `mg/m² = (kg/ha) × 100`
since `1 ha = 10 000 m²` and `1 kg = 10⁶ mg`, giving `10⁶ / 10⁴ = 100`.
Arithmetic cert 5.

**ppm-reported elements** (B, Cu, Fe, Mn, Zn, Al, N-NO3, N-NH4):
`mg/m² = ppm × SOIL_REPORT_PPM_TO_MG_PER_M2` where the constant is 200,
matching Berger's internal kg/ha = ppm × 2 convention (20 cm sample
depth × 1.0 g/cm³ effective bulk density). Cert 4 on the convention.

**Below-detection-limit values (P-04):** lab reports like `<0.1 ppm`
(lettuce B) and `<0.06 ppm` (tomato N-NH4) are stored as the DL ceiling
times the conversion factor, tagged cert 2. Yields conservative ceilings
on the depletion runway; replaced when the next reading lifts the
element into the measurable range.

**Coverage:** 10 of 11 gap-grid elements (Mo absent — not on the
Mehlich-3 panel; routes via fertigation per the nutrition — replenishment-cascade-earliest-first Mo carve-out).

---

## CONTRIBUTING scoping — only-ca-p-participate-in-gap-chain

Today's set: `{P: true, Ca: true}`. K and Mg have measured banks but are
routed via fertigation (K₂SO₄ + MgSO₄); counting them via the soil bank
would double-count weekly coverage. N has no Mehlich-3 measurement (it's
not on the Berger test). Micros not measured on Mehlich-3.

**Refinement trigger:** if pH drops below 6.5 and SME P climbs into spec
(5–50 ppm), P might exit CONTRIBUTING because the active channels can carry
it without leaning on the bank. Re-evaluate after the next Berger reading
post-sulfur amendment.
