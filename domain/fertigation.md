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

- **Pool-forming** (K, Ca, Mg, P, Mn, Zn, Cu) → steered by the
  control law below. **Mg** holds a CEC pool like K/Ca but is
  **semi-mobile** — leaches faster, so lean on the conservative
  drawdown prior.

- **Mobile** (N, B, S, Mo) → excluded from the pool law; leach, no
  stable pool. Dosed to removal + tissue. N via pre-plant front-
  load; B via the tank.

- **Fe** → pool-forming by mobility, but **ungoverned**: no usable
  M3 band and M3-Fe correlates poorly with availability. Dropped
  from the pool law → dosed to removal by broadcast (front-load /
  side-dress), tissue-gated. FeSO₄ is cert-allowed with documented
  need (Fe-EDTA/DTPA chelates prohibited).


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


## Bands — field-calibrated numbers (coarse gate only)

The only M3 bands that exist are **field-calibrated**. Use them as a
**coarse regime gate** (above / within / below → don't-build /
maintain / build), **not** a precise setpoint.


| Nutrient | Optimal Range (ppm) | Notes (ppm) |
|---|---|---|
| **K** | 200-250 | <50 très pauvre → 100-150 moyen → 250-300 très riche → >300 excessivement riche |
| **P** | 31-40 | <20 très bas → 41-50 haut → 51+ très haut |
| **Ca** | 1000-2000 (approx.) | no true threshold — base-saturation / ISP driven, texture-expected from liming |
| **Mg** | derived — see [§ Mg band](#mg-band--derived-from-ca-and-k-not-fixed) | relational, not a fixed number; tissue dip → foliar, not soil |
| **Mn** | 20-50 | <10 inadequate; sufficient range 3-30 (index ≥25) |
| **Zn** | 10-50 | <2 inadequate; raise band as pH rises |
| **Cu** | 0.5-3 | <0.5 inadequate; rarely limiting on mineral soil |
| **Fe** | 20-100 (approx.) | M3-Fe poorly correlated → broadcast (front-load / side-dress), never tank-dosed |


## Mg band — derived from Ca and K, not fixed

Mg alone among the pool-formers has **no standalone field band**. Its
target is **relational** — set by the cation ratios against the
current Ca and K pools. Compute it from the live M3, don't read a
fixed number.

Ratios are **charge equivalents (meq), not ppm**. Convert:
`meq = ppm ÷ (eq.wt × 10)`; eq.wt Ca 20.0, Mg 12.2, K 39.1. M3
kg/ha ÷2 = ppm.

- **Ca:Mg 6-8:1** → `Ca/8 ≤ Mg ≤ Ca/6` (a floor *and* a ceiling).

- **K:Mg <2-3** → `Mg ≥ K/2` (floor only — excess K starves Mg).

- **Feasible window** = `[ max(Ca/8, K/2, floor) , Ca/6 ]`, absolute
  floor ≈ 0.4 meq (~50 ppm sufficiency).

**Guard, not master.** Yield tracks **absolute Mg sufficiency**, not
the ratio — Ca:Mg from 2:1 to 8:1 shows no yield effect when both are
sufficient (Kopittke & Menzies 2007). The ratio only *raises* the
target when a big K/Ca pool would crowd Mg out; it must never pull the
target **below** the ~50 ppm floor. On calcareous soil the Ca:Mg
window inflates into nonsense (below) — treat it as a flag to check,
not a dose.


### Worked from the M3 (Berger 39088, 2026-04-10)

| Bed | Ca ppm (meq) | K ppm (meq) | Mg ppm (meq) |
|---|---|---|---|
| Tomato | 5495 (27.4) | 1059 (2.71) | 823 (6.78) |
| Lettuce | 5306 (26.5) | 323 (0.83) | 467 (3.84) |

- **K:Mg** — tomato 0.40, lettuce 0.21. Both far under 2 → **no
  K-induced Mg antagonism** (Na:Mg <0.08 too → no Na antagonism).

- **Ca:Mg** — tomato **4.0:1**, lettuce **6.9:1**. Lettuce sits in
  the 6-8 window; tomato is *below* 6 → **Mg-rich vs Ca**, not
  Mg-short.

- **Ratio-derived window** (Ca/8..Ca/6): tomato 417-555 ppm, lettuce
  402-536 ppm — an **artifact of the calcareous Ca** (5300-5500 ppm,
  lime-inflated). Actual Mg clears the real ~50 ppm floor **9-16×**.

**Verdict: dose 0 Mg on both beds.** Absolute Mg is hugely sufficient
and K:Mg shows no antagonism. The tissue-Mg deficiency (LAIT #1) is
high-pH lockout / transport, not soil-Mg or cation crowding → **foliar
Mg**, never soil. Matches the live recipe (tank MgSO₄ = 0).

**Caveat — calcareous inflation.** Base cations (Ca+Mg+K+Na) sum to
≈37 meq on the tomato bed vs CEC estimated 33.1 → bases exceed CEC.
Free lime dissolves into the M3 Ca reading, so **Ca:Mg is unreliable
here**. Lean on absolute Mg + K:Mg + tissue, not Ca:Mg.


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
fertigation at full demand (pH 6.5); Fe broadcast (front-load /
side-dress) to removal; P → AMF drench;
Ca(BER) → humidity/foliar, not tank.
