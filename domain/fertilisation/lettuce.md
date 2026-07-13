# Lettuce N front-load — feather-meal-only sizing

Field lettuce nitrogen, delivered as a pre-plant broadcast of
feather meal (13-0-0), re-applied on a fixed cycle. This is the
lettuce instance of the "N via pre-plant front-load" branch of the
pool-maintenance method.

**Design, not yet wired** — a sizing rule for the operator, not yet
a `calc` or spec entry. The plant-needs model still encodes
front-load N as a single 50 g/m² feather rate
(`../../nutrition/lettuce/domain/plant-needs/data.js`); this doc is
the sizing logic that should replace it.

Companions: generic method → `../fertigation.md`; uptake primitive →
`../../nutrition/lettuce/domain/plant-needs/crop-removal.md`; tissue
targets + assays → `../../nutrition/lettuce/domain/plant-needs/data.js`;
product N → `../../nutrition/lib/product-pct.js`.


## Why feather-meal-only

N is **mobile** — it leaches, forms no stable soil pool, so it is
dosed to removal (not steered by the Mehlich-3 pool law). Feather
meal is the N carrier: concentrated (13% N), organic-allowed, and
slow enough to spread its release over weeks.

The fertigation tank carries **K + B only**. Everything else rides
the soil bank. Going feather-only for N drops the incidental P /
Ca / Mg that an alfalfa + Actisol blend used to add — see Caveats.


## The two constants

- **N removed per kg fresh** = dry-matter fraction × tissue-N =
  0.05 × 0.045 = **2.25 g N / kg fresh**.

- **Available N per g feather meal** = label-N × mineralization
  fraction = 0.13 × 0.75 = **0.0975 g N / g feather**.

Both are model priors (butterhead literature, cool-soil
mineralization), not Décembre-measured. Tissue is the backstop.


## Constant-supply logic

Feather meal mineralizes over a ~4-week window. Re-applied every 2
weeks, the release tails of successive applications overlap and sum
to a **flat** N supply — but only after 2–3 applications (~4–6 weeks
of ramp). Before that the bed is still filling the pool.

At steady state the supply rate equals available-N-per-application
÷ application-interval. The release-curve shape washes out; only the
dose and the interval set the rate.


## Sizing rule

Size each application so its available N covers the N removed over
one cycle:

```
feather_meal_per_cycle (g) =
    (harvest_per_cycle_kg × 2.25  −  soil_credit_g)  ÷  0.0975
```

Ignoring the soil credit (feather covers all removal, soil = safety
margin) this collapses to:

```
feather_meal (g) = kg_fresh_harvested_this_cycle × 23.1
```

Rescale for any harvest or interval — the rule is per kg fresh
removed, area- and cycle-length-independent.


## Soil N credit

The soil supplies N by mass-flow independent of the front-load:
SME nitrate ~72.6 ppm × transpiration volume ≈ **~35–40 g N / week**
per bed. Soft — scales with transpiration (ET), which is not pinned.

Crediting it lowers the feather dose; ignoring it builds in margin.
The estimate is uncertain enough that leaning on it fully is a risk.


## Worked example — 80 kg / bed / 2 weeks

Harvest 80 kg fresh per 2-week cycle (≈ 40 kg/wk), one feather
application per cycle.

- **Removal:** 80 × 2.25 = 180 g N per cycle.

- **Full coverage** (soil ignored): 180 ÷ 0.0975 ≈ **1.85 kg
  feather / bed / 2 wk**.

- **Net of soil** (~78 g N credited over 2 wk): (180 − 78) ÷ 0.0975
  ≈ **1.05 kg / bed / 2 wk**.

- **Recommended start: ~1.5 kg / bed / 2 wk** (≈ 50 g/m² on a
  30.4 m² bed) — splits the two anchors: covers removal with a small
  margin without banking fully on the soil estimate. Then tune to
  tissue N.

Over-dosing risk cuts the other way: surplus N on lettuce drives
**nitrate accumulation** in the leaf (quality / food safety) and
soft growth. Don't stack full coverage on top of a strong soil N
reading.


## Caveats

- **Model is untested.** Both constants are literature priors with
  no Décembre tissue back-test. A leaf N (and P) panel settles the
  dose and the P risk.

- **Ramp.** Constant supply only holds after 2–3 cycles. The first
  fill runs leaner than steady state.
