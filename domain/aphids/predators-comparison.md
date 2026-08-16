# Domain — choosing between aphid predators

Cross-agent comparison only. Per-agent detail lives in its own file.
Pest and program design: `aphids.md`.

| Agent | File |
|---|---|
| *Aphidoletes aphidimyza* | `aphidoletes.md` |
| *Chrysoperla carnea* | `chrysoperla.md` |
| *Micromus variegatus* | `micromus.md` |
| *Nabis* | `nabis.md` |
| *Adalia bipunctata* | `adalia.md` |
| *Aphidius*, *Aphelinus* | `parasitoids.md` |

Prices are Canadian quotes, 2026-08, CAD. Rates are per m² of
cropped bed.


## Model


### The two properties that decide everything

Every comparison below reduces to two questions.

**Is the shipped stage the predatory stage?**

- if yes, predation starts the day it arrives

- if no, there is a lag, and the middle step is usually a **search** — an adult must find a colony before anything eats

**Does the cohort accumulate or is it consumed?**

- **accumulates** — adults persist and reproduce → frequent small releases compound

- **consumed** — the individual feeds then pupates or dies → releases stack rather than build, and cadence should match the crop's cycle rather than be maximised

- consequence: an agent's fit is a property of the **crop cycle**, not of the agent alone. A 14-day cut crop and a season-long crop reward opposite designs
  → `aphids.md § Beds are disposable, the nursery is not`


### Speed and form

| Agent | Shipped as | Predator on the leaf | Search | Reaches a heart |
|---|---|---|---|---|
| *Chrysoperla* larvae | larvae | day 0 | crawls | no |
| *Micromus* | adults | day 0 | **flies** | no |
| *Adalia* | larvae | day 0 | crawls | no |
| *Nabis* | eggs | day 2–3 | crawls | no |
| *Chrysoperla* cord | eggs | day 3–5 | crawls | no |
| *Aphidoletes* | pupae | **day 10–14** | **flies, best searcher** | **yes** |


### Cost over 93 m² at preventive rate

| Option | Rate | Per application | Annual, weekly | Annual, fortnightly |
|---|---|---|---|---|
| *Chrysoperla* cord | 20 /m² | **$38** | **1 976** | **988** |
| *Chrysoperla* larvae | 5 /m² | $89 | 4 628 | 2 314 |
| *Micromus* | 1 /m² | $135 | 7 020 | **3 510** |
| *Nabis* | 3 /m² | ~$100 | ~5 200 | ~2 600 |
| *Adalia* | 5 /m² | ~$254 | ~13 200 | ~6 600 |

- **all suppliers label these every 2 weeks.** A weekly backbone is double the recommended rate and should be justified, not assumed

- one 2 000-egg cord over 46.5 m² — the two beds transplanted in a week — lands at **43 eggs/m²**, top of the preventive band, from a single pack with no fractional ordering


### Predator-days per dollar

The metric a cut crop rewards. Each agent written off at day 14.

| Agent | Unit price | Predator-days | **Per predator-day** |
|---|---|---|---|
| *Chrysoperla* eggs on cord | $0.019 | ~10 | **$0.0019** |
| *Chrysoperla* larvae | $0.178 | ~12 | $0.015 |
| *Micromus* adults | $1.35 | ~14 + offspring | $0.025 |
| *Nabis* eggs | $0.33 | ~11 | $0.030 |

- the cord is **8–16× cheaper per predator-day** than anything else

- **caveat: predator-days are not equal.** A *Nabis* nymph or a *Micromus* adult eats considerably more per day than a young lacewing larva. Appetite correction narrows the gap — but not by an order of magnitude


### Each wins on a different axis

| | Cord | *Chrysoperla* larvae | *Micromus* | *Nabis* |
|---|---|---|---|---|
| Weekly cost, 93 m² | **$38** | $89 | $126–182 | ~$100 |
| Waves per bed cycle | 1 | 1 | **2** | 1 |
| Dose actually delivered | **unknown** | **known** | known, then disperses | unknown |
| Commercially available now | yes | yes | yes | **not confirmed** |

- **cheapest per dollar: the cord. Strongest per week: *Micromus*. Most predictable: larvae. Fastest after the same-day pair: *Nabis*.** No option wins twice

- consequence: **the efficiency ranking and the price ranking are near-exact inverses.** That is the trade, stated plainly


### Weekly does not scale them the same way

| Agent | Cohort working life | Overlap at weekly | Weekly is |
|---|---|---|---|
| *Micromus* adults | weeks, and they reproduce | builds a standing population | **more than additive** |
| *Chrysoperla* larvae | ~10–14 d, then pupates | ~2 cohorts | roughly additive, minus crowding |
| *Chrysoperla* eggs on cord | 3–5 d lag, then ~2–3 weeks | 2–3 cohorts | **least additive** |

- **weekly favours *Micromus*** — the only one of the three where extra cadence compounds instead of stacking disposables

- **weekly penalises the egg format** — last week's larvae eat this week's eggs
  → `chrysoperla.md § Cannibalism runs through everything`

- consequence: the cost ranking narrows at weekly. The cheap option loses the most efficacy per extra dollar, the expensive one gains the most

- general rule: **weekly suits agents that accumulate, fortnightly suits agents that are consumed**


### What each does when the crop is clean

| Agent | On a clean crop | Loss |
|---|---|---|
| *Aphidoletes* | needs a colony to lay in; larvae eat aphids only | **total** |
| *Micromus* | adults persist a while on other soft-bodied prey | high |
| *Chrysoperla* larvae | generalist — thrips, whitefly nymphs, mites, each other | partial |
| *Nabis* | true generalist, sits and waits | low |

- consequence: the program is **most wasteful exactly when it is working**, and the cheapest backbone is also the agent that loses most on success

- consequence: a clean crop is not a reason to stop releasing — the population rebounds in three weeks — but the spend buys progressively less


### Fragility — how much one bad week destroys

| Failure | Cord | *Chrysoperla* larvae | *Micromus* |
|---|---|---|---|
| Missed reception day | tolerates a day | **dead — cannibalise in the box** | **dead — 48 h ceiling** |
| Shipment arrives dead | **invisible** | visible, countable | visible, countable |
| Released bunched | **severe** | moderate | low |
| A week skipped | 2–3 cohorts still out | ~2 cohorts still out | **best buffered** |
| Supplier stock-out | low | low | **already observed** |
| Cadence sensitivity | **penalised at weekly** | neutral | rewarded at weekly |

- **most fragile per week: *Micromus*** — 48 h shelf life on a live-adult product

- **least verifiable: the cord** — no farm-scale test exists for hatch rate, so a bad batch looks exactly like a good one until pack-table defects appear weeks later

- **most robust: *Chrysoperla* larvae** — you can see and count what you bought

- consequence: fragility and cost rank in opposite directions again

- consequence: **the program's real single point of failure is not the agent, it is the reception day.** Two of three options are destroyed by a missed one
  → `aphids.md § Silent killers of a release`


### Species coverage

Generalist predators have **no host specificity**. Coverage gaps come
from *access* and *body size*, not taxonomy.

| Axis | *Aphidoletes* | *Micromus* / lacewings |
|---|---|---|
| Small aphids, early instars | strong | adequate |
| Large-bodied adults | paralyses first, so size is manageable | strong |
| **Deep in a lettuce heart** | **larvae small enough to enter** | too large |
| Open canopy | strong | strong |

- *Aphidoletes* larvae **paralyse an aphid with a toxin before feeding** → species-specific defences (dropping off the plant, kicking, cornicle wax) are largely bypassed

- consequence: a predator mix has **no species-shaped hole**. A new species arriving changes nothing about what to order

- the one uneven case is *Nasonovia ribisnigri*, and the reason is **location, not species**

- consequence: parasitoids were the species-fragile part of the old design; removing them removed the species risk entirely
  → `parasitoids.md`


### Which suits a 2-week crop

Two requirements narrow the field hard: **species-agnostic**, and
**the shipped stage is the predatory stage**.

- consequence: **the program is currently built on the worst-fitting agent for its strictest crop.** *Aphidoletes* was chosen on cost and on suppressing the tomato reservoir, where a 10–14 d lag costs nothing. On a bed cut every 14 days it costs everything

- the fix is not to replace the backbone but to **match agent speed to crop cycle**:

| Zone | Cycle | Agent | Why it fits |
|---|---|---|---|
| Tomato, 557 m² | season-long, never cut | *Aphidoletes* pupae | lag irrelevant, cheapest per insect, reservoir suppression |
| Lettuce + nursery, 93 m² | 14 d, residue standard | an agent shipped **as the predator** | acts inside the window |


### Combinations

**Alternating *Micromus* and *Chrysoperla* week on week.**

| Programme | Weekly average | Annual |
|---|---|---|
| Cord alone, per-bed at transplant | $38 | **1 976** |
| *Micromus* 100 fortnightly | $67.50 | 3 510 |
| **Alternating: *Micromus* + cord** | $86.50 | **4 498** |

What it buys: something fresh every week, two independent agents,
complementary failure modes, temperature hedging.

- **but lacewing larvae are documented to damage co-released agents** → the second agent does not merely add, it subtracts from the first

- costs **more than either line alone**, plus a second supplier, order line and shelf-life regime

- consequence: **pick one**

**A spatial split** — *Micromus* in the nursery, cord on the beds —
separates them cleanly but dies on pack minimums: ~$2 400/yr to
cover a ~15 m² nursery that needs 15 insects.

**Banker plants** cannot support a heavy release. A cereal tray
carries 1 000–5 000 aphids; a 1 000-pupae release demands hundreds
of thousands.

- consequence: banker systems and heavy weekly releases are **alternative strategies, not complements**. Mixing them burns the release *and* kills the banker
  → `parasitoids.md § Banker plants`

**Intraguild predation, in general.** Generalist true bugs and
lacewing larvae both attack other beneficials.

- consequence: adding an agent can **lower** total control — the only class of decision in this program where more spending makes things worse


### Rejected without a full entry

| Agent | Why |
|---|---|
| *Hippodamia convergens*, bulk "ladybugs" | field-collected from overwintering aggregations, sold as adults in diapause. Disperse within days, may carry parasites |
| *Orius* | thrips agent; intraguild predator here |
| Hoverfly larvae (*Episyrphus*, *Sphaerophoria*) | same-day larvae, viable under a wash standard, but large and unpriced. **Open, not rejected on merit** |
| Entomopathogenic fungi | sprays cannot reach a heart the wash cannot reach either; leave cadavers; need high humidity |


## Definitions


**Diapause** — a programmed pause in development, triggered by a cue
that *predicts* a bad season rather than by current conditions. A
chilled insect restarts when it warms; a diapausing one does not.


**Intraguild predation** — a beneficial eating another beneficial.


**Mummy** — the hardened shell of a parasitized aphid, cemented to
the leaf by the wasp larva before it pupates inside.


**Host-feeding** — a parasitoid killing an aphid by feeding on it
rather than laying in it. Adds kill without adding a mummy.
