# Soil-maintenance — pool-maintenance method

Method for deriving weekly dosing from soil pools, routed across
tank / broadcast / foliar / AMF.

Companions:
- Transport mechanism (why the floor exists) → `nutrient-transport.md`
- Nutrient mobility + scope → `../nutrition/soil-contribution/domain.md
- Uptake primitive → `../nutrition/lettuce/domain/plant-needs/crop-removal.md
- Product assays → `../nutrition/lib/product-pct.js`.


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

One rule underneath: **maintain the reservoir that buffers weekly
removal; tissue is the backstop.** What differs across nutrients is
only whether that reservoir is observable.

**Mobility here = movement in the soil solution** (holds a stable
pool vs leaches through the root zone), not phloem mobility — B is
soil-mobile yet phloem-immobile.



- **Pool-forming** (K, Ca, Mg, P, Mn, Zn, Cu) — reservoir
  **observable** via M3 → the control law below gates on it.
  **Mg** holds a CEC pool like K/Ca but is **semi-mobile**
  (leaches faster) → lean on the conservative drawdown prior.

- **Off-pool** (N, B, S, Mo) — **no reservoir** to draw down.
  Rule: **replace weekly removal only if nothing else supplies it;
  else dose 0, tissue-gated.**

    - **N** → replace, via pre-plant front-load (not the tank).

    - **B** → replace 1:1 via the tank; soil B below detection,
      sole source.

    - **S** → **0** — rides in free as the sulfate counter-ion +
      the S pH program; tissue already in surplus.

    - **Mo** → **0** — soil adequate above pH 6; dosing adds Na.

- **Fe** —  **degenerate**:
    - Same replace weekly removal rule
    - Its reservoir is **unobservable**. M3-Fe correlates poorly with availability and has
  no calibrated band.
    - **Tissue-gated removal**
    - Broadcast (front-load / side-dress), never the tank (FeSO₄ oxidises in the drip line).
    - At the current pH 6.5 the lockout is relieved and the soil covers removal (bank
  310 ppm, ~86% mass-flow, tissue sufficient) → **dose 0**.
    - Acidification mobilises Fe/Mn, so the near-term risk is mild
  over-supply — the low-side gate can't catch it, so watch tissue.


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

- **Drawdown** (pool falling) ≈ removal rate. Conservative upper
  bound (ignores buffer re-supply) → errs toward dosing sooner.
  Use as the prior.

- **Build** (pool rising from a dose) = **maintenance × 1.25**.
  Maintenance = weekly removal (cert 3). Below floor, dose 25% over
  replacement → the pool climbs at 25% of removal per week. A gentle,
  CE-safe, coefficient-free correction; sibling of the K intensity
  floor (also maintenance-anchored).

**Why not a buffer-power coefficient.** Build-from-dose = soil buffer
power ("kg/ha to raise 1 ppm") is nutrient- and soil-specific, worst
for P (fixation), and **not derivable from current data**. Anchoring
build on removal (which we know) instead of buffer power (which we
don't) avoids a cert-low guess and keeps doses in a sane range.

**It's a rate rule, not a target.** It doesn't size the dose to close
the gap in a fixed horizon — a deeply depleted pool refills slowly.
That's deliberate: acute deficiency is the foliar / AMF / broadcast
lever's job, not the tank. The pool law does gentle maintenance only.


## Bands — field-calibrated numbers (they set the floor)

The only M3 bands that exist are **field-calibrated**. They are not a
precise setpoint; their job is to supply the **mid-band floor** the
control law gates on.

Gate is two-way, not three: `pool@100d ≥ floor` → hold; below → build.

**Sitting inside the band is not "maintain".** A pool in the lower half
of its band is below the mid-band floor and therefore builds. Example:
Zn at 11.5 ppm is within 10-50 but under the 30 ppm floor → build.


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


### Example worked from the M3 (Berger 39088, 2026-04-10)

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

Nutrient diffusion is a bottleneck for optimal **K and P** uptake. To fix this
we increase the concentration in solution so that the uptake never deplete the
nutrient in the thin film around the roots. That way, we never have to wait for
slow diffusion to replenish the film around the roots.

- **K** → gets a **minimum K *fertigation dose.
    - Start **minimum 20% of maintenance** (At the lettuce scale; ~+0.2 mS/cm)
    - That's ~5× what transpiration pumps. For trivial salt.
    - Minimum range 10-25%;
    - Floor Adjusment:
        - SME low → raise
        - CE creeping → lower
        - Tissue-K dip → raise

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
