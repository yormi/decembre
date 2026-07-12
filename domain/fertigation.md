# Fertigation protocol — pool-maintenance method

Cross-crop (tomato + lettuce) method for deriving weekly fertigation
from soil pools. **Design, not yet wired** — for a coder/specialist
to turn into a pure `poolDose()` calc + spec entries.

Companions: nutrient mobility + scope →
`../nutrition/soil-contribution/domain.md`; uptake primitive →
`../nutrition/lettuce/domain/plant-needs/crop-removal.md`; product
assays → `../nutrition/lib/product-pct.js`.


## Objective + scope

Keep each **pool-forming** soil nutrient in a healthy Mehlich-3
band, dosing the **minimum** fertigation that does so.

Out of scope, owned by other protocols:

- Plant sufficiency / deficiency → tissue-testing protocol.

- Root-zone pH / lockout → soil-pH protocol.

"Pool in band" is a **soil-health** claim, not a "crop is fed"
claim. Tissue is the sufficiency backstop (see Intensity floor).


## The uptake primitive

Maintenance is anchored on uptake per kg fresh harvested — area-
and yield-independent.

```
maintenance_dose[el] = yield_kg_per_wk × removal_per_kg[el]
                     ÷ channel_efficiency ÷ product_assay
```

`removal_per_kg = dry_matter_fraction × tissue_DW[el]`.


## Nutrient classification

Two regimes, set by mobility:

- **Pool-forming** (K, Ca, P, Fe, Mn, Zn, Cu) → steered by the
  control law below.

- **Mobile** (N, B, S, Mo; Mg semi-mobile) → excluded from the pool
  law; leach, no stable pool. Dosed to removal + tissue. N via
  pre-plant front-load; B via the tank.


## Control law (pool-forming nutrients)

One rule, no branches:

```
pool@100d = current_M3 − drawdown × 100d          (+ build from dose)

floor = mid-band                                  (normal)
      = lower_bound + 25% × band_width            (CE-constrained fallback)

weekly dose = the minimum that keeps pool@100d ≥ floor,
              capped by the CE ceiling
            = 0  whenever pool@100d ≥ floor at zero dose
```

- **Horizon** 100 days ≈ the re-evaluation interval.

- **CE ceiling** is a hard cap (salt-stressed crop). If holding
  mid-band needs a dose over the ceiling, drop the floor to the
  25%-into-band point; if still over, accept faster decline and
  move that nutrient to a bed-prep broadcast instead of the tank.


## Transfer coefficient (dose ↔ ΔM3)

Two directions, unequal:

- **Drawdown** (pool falling) ≈ removal rate. Conservative upper
  bound (ignores buffer re-supply) → errs toward dosing sooner.
  Use as the prior.

- **Build** (pool rising from a dose) = soil buffer power ("kg/ha
  to raise 1 ppm"), nutrient- and soil-specific, worst for P
  (fixation). Not derivable from current data; literature, cert-low.

**Measure it, don't assume it.** Monthly M3 turns ΔM3-vs-removal
into an observed quantity per cycle. Caveat: two monthly points make
a noisy slope (soil-test variance ±15-30%) — anchor on the removal
prior, nudge with measured ΔM3 (damped update), don't chase the raw
two-point line.


## Bands — the missing data

There are **no Mehlich-3 sufficiency bands for greenhouse in-ground**
anywhere:

- The Quebec plein-sol guideline (`../nutrition/doc/Ligne directrice
  - fertilisation serres plein-sol.pdf`) carries **no soil-test
  bands** — only a removal-per-kg table (Annexe 1, tuteured crops,
  no lettuce) — and states field grids can't be used for greenhouse
  (yields 3-5× higher). Its method = removal + SME/CE + tissue.

- The only M3 bands that exist are **field-calibrated** (CRAAQ
  richness classes; US extension). They read this soil as
  high-to-excessive (K 645 kg/ha = "excessivement riche"; Mg/P
  ~7-8× field veg optima).

So:

- Use field bands as a **coarse regime gate** (above / within /
  below → don't-build / maintain / build), **not** a precise
  setpoint.

- A numeric greenhouse band, if wanted, must be **constructed**:
  field band × (greenhouse yield ÷ field yield) — approximation,
  cert-low.


## Intensity floor

Some nutrients are diffusion-supplied → the pool can lag solution at
peak uptake even when full. Per Barber transport theory, only **K
and P** are diffusion-limited macros; the rest are mass-flow or
low-demand.

- **K** → gets a fertigation floor. Start **20% of maintenance**
  (≈170 g K₂SO₄/wk at the lettuce scale; ~+0.2 mS/cm). Range 10-25%;
  ~5× what mass flow delivers, at trivial salt. The floor is the
  **minimum K never drops below**, active only when the pool law
  would otherwise dose 0. SME low → raise; CE creeping → lower;
  tissue-K dip → raise.

- **P** → intensity-limited too, but **no floor**: no clean organic-
  soluble P, pool is a vault. Fix is **AMF** (mycorrhizal drench).

- **Ca, Mg** → *pseudo*-intensity. Ca uptake is mass-flow (soil
  saturated); the real limit is in-plant transport to low-
  transpiration tissue — tomato BER, lettuce tip-burn → humidity +
  foliar Ca. Mg low despite a big pool = cation antagonism (Na/K) →
  foliar Mg. **Neither is fixed by a soil floor.**

- **Fe** → never a tank floor: FeSO₄ oxidizes and clogs drippers →
  passive/foliar.


## Cadence + feedback

- **Soil M3**: quarterly until a pool nears its band, then monthly.
  Re-evaluate the 100-day slope each test; hold the dose until the
  next test.

- **SME (solution)**: the intensity gauge — sizes the K floor
  precisely when available.

- **Tissue**: the flux/sufficiency backstop. Tissue-low at an in-
  band pool → **raise that nutrient's target band** (the one
  handshake from the tissue protocol back into this model). A 3-week
  crop needs tissue cadence fast enough to catch a within-cycle
  deficit.


## Worked example — current state

**Lettuce** (100 kg fresh/wk, 136.8 m², pH 6.4): every pool-forming
macro reads above the field band → law doses **0** for Ca/Mg/P/
micros. K drains ~57% of bank per 100 d → the one active pool dose.
Result = the live recipe: **K 400 g** (CE-safe partial, also the
intensity floor; full replacement ~840 g held back for salt) +
**B 0.7 g** (mobile, tank-only source) + **N front-load**. Matches
`../nutrition/lettuce/protocol/fertigation-recipe-standing.md`.

**Tomato**: analogous. K floored; Mn/Zn already returned to
fertigation at full demand (pH 6.5); Fe passive; P → AMF drench;
Ca(BER) → humidity/foliar, not tank.


## Open tasks for the builder

- Assemble M3 band `[lower, upper]` per pool-forming nutrient (CRAAQ
  K classes + full guide / US extension for the rest); or construct
  greenhouse bands via the yield-ratio method.

- Encode `poolDose()` as a pure function (removal prior + damped ΔM3
  + floor + CE cap). Keep it pure per repo convention.

- Wire the K-floor constant (20% start) + CE ceiling per crop.

- Pre-existing debt: reconcile the per-100 m² `LETTUCE` bilan
  constant with the operator recipe (add a B term); update the
  front-load N model from 50 g/m² feather-meal-only to the real
  alfalfa (3-0-2) + actisol + feather mix.


## Certainty

- Transport theory (K/P diffusion-limited), removal primitive:
  high (textbook + matches the Quebec authority's own basis).

- K-floor 20%, 100-day horizon, constructed greenhouse bands:
  heuristic starting points, tune with SME + tissue.
