# Domain — aphids in a year-round greenhouse

The pest, the standard it has to meet, and how a control program is
designed around both.

Choosing between agents: `predators-comparison.md`. Per-agent
biology, rates and prices: one file each —
`aphidoletes.md` · `chrysoperla.md` · `micromus.md` · `nabis.md` ·
`adalia.md` · `parasitoids.md`.


## Model


### Why eradication is off the table

- True eradication is impossible. Sustained suppression below the damage threshold is the realistic goal.

- Aphids reproduce without mating, bearing live young on a ~7-day cycle → one surviving female rebuilds a colony in 3 weeks.

- consequence: any control that must reach *zero* to work will fail. Control must be **continuous pressure**, not an event

- consequence: one-shot measures — clean-out, crop-free break, sealing the envelope — buy weeks, not a state change. A single winged migrant resets them

- consequence: the design target is standing pressure present *before* the aphids are, so the 7-day doubling meets an equal-speed consumer


### Reproductive arithmetic

**One individual, at 20–25 °C** — typical *Myzus persicae*; varies
by species.

| | Value |
|---|---|
| Birth → adult, 4 nymphal instars | **7–10 d** |
| Reproductive adult life | 2–3 weeks |
| Total lifespan | 3–4 weeks |
| Offspring per day | 3–5 |
| **Lifetime offspring** | **~50–80** |

- parthenogenesis (no male needed) + viviparity (live young, no egg stage) → no bottleneck between generations

- telescoping generations: a nymph carries developing embryos at birth → the effective lag is shorter than the nominal cycle

- winged morphs appear under crowding → self-dispersal to clean beds inside the same house

- warm year-round house + year-round host = no diapause, no seasonal crash

**Why the population multiplies ~10×/week and not ~25×.** An adult
laying 3–5/day makes ~25 offspring in a week. A colony does not.

- **only adults reproduce, and most of a colony is not adult.** Every individual spends its first 7–10 d as a nymph producing nothing; in a fast-growing colony only ~⅓ are laying at any moment

- mortality removes part of every cohort; crowding makes winged morphs that leave instead of laying in place

- net intrinsic rate ≈ 0.3/day → doubling every ~2.3 d → **~3 doublings a week → ×8–12**

- consequence: the per-adult figure describes an individual, the ×10 a colony. Using ×25 for a colony overstates a real infestation ~3× per week

- 1 → 10 → 100 → 1 000 across three weeks. That is the arithmetic behind "one survivor rebuilds a colony in 3 weeks"

- **cold slows the clock** — roughly double the generation time at 15 °C (~14–20 d birth-to-adult)

- consequence: a crop sitting **2 weeks** in the bed spans barely more than one generation. That narrow window is Décembre's strongest structural protection


### Species that matter on greenhouse lettuce

| Species | Where on the plant | Notes |
|---|---|---|
| Currant-lettuce (*Nasonovia ribisnigri*) | deep in the heart | poorly parasitized by anything; hardest to reach with a spray |
| Green peach (*Myzus persicae*) | leaf undersides | *Aphidius colemani* host |
| Potato (*Macrosiphum euphorbiae*) | outer leaves, large-bodied | *Aphidius ervi* host |
| Foxglove (*Aulacorthum solani*) | scattered, leaf distortion | *Aphidius ervi* / *Aphelinus* host |

- species identity changes **parasitoid** choice, not **predator** choice

- consequence: a predator-based program has **no species-shaped hole**. A new species arriving changes nothing about what to order

- generalist predators differ by **access and body size**, not taxonomy — only small-bodied larvae follow *Nasonovia* into a heart

- consequence: removing parasitoids removed the species risk entirely, which is why no identification step exists
  → `parasitoids.md`


### Population suppression vs a clean pack

These are different targets and a release program only serves the
first.

- biocontrol acts on **population level** over an area; a clean pack is a **per-unit presence** standard where one insect fails the unit

- consequence: a program can cut total numbers by an order of magnitude and still leave a few percent of units carrying one insect — good biology, failed packing line

- consequence: the release program lowers how much the wash line must remove. It is not what decides whether the wash line succeeds

- what decides that is **whether the residue is attached**

- the levers that move per-unit presence, in order: **exclusion screening** (cuts arrivals), **nursery hygiene** (protects most of the cycle), **early detection**, then the release program


### What survives a bubbler wash

Décembre harvests **cut leaves** and washes them. That changes which
residue matters.

| Residue | Attached? | Washes off? |
|---|---|---|
| Live aphid | grips with legs and stylet | yes — loses grip in turbulence |
| Aphid cadaver | not attached, dries loose | yes |
| Predator larva | free-living, mobile | yes |
| Cast skin | loose | yes |
| **Parasitoid mummy** | **cemented** | **no** |

- consequence: **the parasitoids are the packing-line problem, not the aphids.** Every mummy produced is a defect the process cannot fix

- consequence: predators are preferable as a **category**, not marginally

- **field observation at Décembre: *A. colemani* mummies have never been a bubbler problem.** Attachment is a property of the mummy; reaching the pack is a property of density and of which leaves get cut. Low parasitism, or mummies on older leaves trimmed at harvest, both produce "no mummy problem" without contradicting the mechanism

- consequence: the anti-parasitoid rule is strong where mummy density is high and weak where it is low → observed pack-table history outranks the mechanism alone

- corollary: with mummies out of the picture, **"large-bodied predator" stops being a disqualifier**. Predator size only mattered under a whole-head standard

**Whole-head standard, for reference.** Nothing in the agent set
works: predator larvae and cadavers stay inside the head, and
killing an aphid there does not remove it. Exclusion netting or
Nr-gene resistance are the only levers. Not the situation here.


### Program sizing at Décembre

Rate is per m² of **cropped bed**, not greenhouse floor.

| Crop | Beds | Bed size | Bed m² |
|---|---|---|---|
| Lettuce | 4 | 30 in × 100 ft | **93** |
| Tomato | 12 | 5 ft × 100 ft | **557** |

Program area **650 m²**, year-round.

- count the **bed footprint**, not the exposed soil: the 10 in bare strip in a tomato bed is a planting dimension, and a mature canopy covers the full width and overhangs the alley plastic

- do not inflate the tomato rate for canopy height — published per-m² rates are already per m² of greenhouse floor under a full crop

- a tarped bay is out of scope: no host, no aphids, nothing for a released beneficial to eat

- **"no problem in tomatoes" is not evidence of no aphids.** Tomato has no cosmetic standard and tolerates loads far above what fails a lettuce residue check. Its threshold is economic damage; lettuce's is one insect on a leaf

- consequence: a tomato crop can look clean and still be the house's aphid source → both crops get the same rate

- **the nursery holds 5 of the lettuce crop's 7 weeks.** A bed release protects the short end of the cycle, and a plant arriving already infested defeats the 2-week advantage entirely


### Beds are disposable, the nursery is not

The 5 nursery weeks and the 2 bed weeks are different habitats and
reward opposite agents.

| | Nursery racks | Beds |
|---|---|---|
| Plants leave by | being moved intact | being cut |
| Agent on the plant at the end | travels with the transplant | goes to the wash line |
| Rewards | persistence | cheap, fast, disposable |

- **on a crop that is cut, per-individual longevity is worth almost nothing.** A nine-week predator on a fourteen-day bed delivers fourteen days. The metric is **cost per m² per 14-day window**, agent written off at harvest

- consequence: an agent established in the nursery **rides the transplant into the bed** — the only way to have a predator present on day 1 rather than day 10

- consequence: if a second lettuce agent is ever added, the nursery is where it belongs


### Cadence: weekly trip, fortnightly per bed

Blanket-weekly versus blanket-fortnightly is a false choice. Beds
are staggered, so the application can follow the bed.

- 4 lettuce beds, 14 days each, **2 transplanted every week**

- consequence: treat **only the 2 beds transplanted that week**. Each bed receives one application at **day 0 of its own cycle**, and the operator still makes one weekly trip

| | Blanket weekly | Blanket fortnightly | **Per-bed at transplant** |
|---|---|---|---|
| Area dosed weekly | 93 m² | 93 m² / 2 wk | **46.5 m²** |
| When a bed gets its cohort | random ×2 | **random** | **day 0, every time** |
| Cohort-on-cohort loss | highest | low | **none** |

- consequence: double the rate on half the area, delivered at the only moment that matters — before a colony can establish in a bed cut in 14 days

- consequence: the cannibalism discount disappears. A bed is treated once and cut; no cohort meets the next

- **cadence should match the agent, not be maximised.** Weekly suits agents that accumulate, fortnightly suits agents that are consumed
  → `predators-comparison.md § The two properties that decide everything`


### Expected efficacy of a standing release

Judgement figures, not measurements here. Baseline is no program.

| Phase | Weeks | Expected reduction |
|---|---|---|
| Ramp | 0–3 | little visible change |
| Building | 3–8 | 40–70 % |
| Steady state | 8+ | **70–90 %**, central ~80 % |

**What the ramp actually is** — two clocks, not one.

- **predator presence saturates by ~week 2.** A cohort occupies the crop ~12 d, so from the second release there are always two overlapping cohorts. That is the ceiling for a fixed weekly dose

- **aphid drawdown is the slower clock.** The standing population falls toward a new equilibrium over several weeks, because predation removes a fraction per week against a population still reproducing

- consequence: the ramp is a **prey-decline** curve, not a predator-build curve

- a *reproducing* program ramps slower — ~6 weeks — because it adds the predator's own generation time. A consumable program skips it, trading a lower ceiling for a faster ramp and faster recovery

- **the ceiling is set by immigration**, not predation → with no exclusion screening, new winged arrivals reset part of the gain every warm week

- a poor outcome (40–60 %) comes from handling, not biology

- **the reduction is unobservable without field scouting.** Treat the percentage as a planning expectation, never a claim about what happened. A pack-table residue check is the cheap substitute — it measures what matters, on product already handled, and needs no field time


### The gap a single-agent slow program leaves

- **a cohort with a 10–14 d onset leaves a colony unopposed for 2–3 weeks.** At ×10/week it reaches ×100–1 000 before the first larva arrives

- consequence: confidence in the ~80 % house-level figure is reasonable; confidence that it **never lets a colony grow** is low

- consequence: with a 2-week bed window, a colony founded at transplant reaches harvest having grown ~×100 untouched

- consequence: on lettuce a slow agent works **only if the colony is found early**

- the fix is not a stronger backbone but **matching agent speed to crop cycle**: a slow cheap agent on the season-long tomato reservoir, a fast one on the 14-day lettuce
  → `predators-comparison.md`


### Release conditions

The release is the moment the weekly spend is most fragile. Three
failures, all sun- and heat-driven.

- **heat** — a small container in direct sun overshoots air temperature badly; a dark tub can pass 40 °C while the house reads 25. Pupae die above ~35 °C sustained

- **desiccation** — a moist carrier dries, and emergence fails with it

- **light and dispersal** — released into bright light, night-active adults fly toward the glazing instead of settling into the canopy

- consequence: the rule binds hard May to September and barely at all under a dull Quebec winter

**Placement matters more than the hour.**

- a hatchery container emits adults over 3–5 days → the conditions that matter are the ones it sits in for those days, not the instant it was carried out

- real canopy shade fixes radiant heating and most of the dispersal problem; it does **not** fix desiccation, since vapour pressure deficit peaks at midday whatever the shading

- consequence: under a dense tomato canopy, midday placement is fine. Over open lettuce beds there is no shade to use, so timing or a physical cover is the only protection

- for a **flying** agent the levers invert: **when and how deep**, not where. Released on top of the canopy in daylight adults fly off; released into the canopy at dusk they settle

**Humidity is a night-time requirement.** Night-active agents emerge,
mate and lay in the dark hours.

| Step | When | Depends on |
|---|---|---|
| Emergence | dusk | carrier moisture, then air |
| Mating, flight, laying | night | night RH |
| Egg hatch, larval feeding | continuous | leaf boundary layer |

- consequence: **> 70 % overnight and 50 % by day is a working pattern**, not a problem. The requirement and the activity period coincide

- the continuous steps sit **inside the canopy boundary layer**, materially wetter than a vent-height sensor reads → measure at canopy level at night

- the real failure case is a house held dry **around the clock**, typically by night dehumidification against botrytis

- consequence: daytime venting and the predator do not conflict; night dehumidification does

- secondary risk: overnight airflow fans dry the canopy and scatter weak fliers


### Silent killers of a release

Normal greenhouse practice that quietly cancels the program.

**Sulphur.** Vaporised or dusted for powdery mildew, acutely toxic to
predatory midges and lacewing larvae, residual on the order of weeks.

- sulphur is a fungicide and miticide. Against aphids it is **weak to inert**

- consequence: it hits the predator hard and the pest barely → **the net effect on an aphid population can be worse than doing nothing.** Classic natural-enemy-suppression resurgence

- consequence: sulphur is a **negative-value input** against aphids, not a neutral cost

- **hypothesis worth checking: if sulphur ran during last year's outbreak, it may have been a cause rather than a bystander**

- spray and vaporiser are both incompatible. Mildew control needs a 7–10 d interval, so residue never clears between applications and a spray program approximates continuous exposure

- **occasional sulphur does not escape it.** One application suppresses predators 2–4 weeks; a release program takes ~3 weeks to ramp and ~8 to plateau. At an 8-week interval the program is reset at or before steady state, and 6 sprays a year holds it in the building band permanently

- an 8-week interval does not control powdery mildew either → the proposal is self-defeating in both directions

- **one roof is one airspace.** "Tomato only" is not a real boundary without curtains and separate venting; and even with perfect separation it abandons 86 % of the cropped area, which is the reservoir feeding the lettuce

**Yellow sticky cards.** They trap released predators as efficiently
as pests. Cards hung for thrips monitoring remove a share of every
release.

**Spray residues.** Soaps, oils and pyrethrin keep killing for days
to weeks. A one-off corrective spray costs several subsequent
releases.

**A broken cold chain at the last mile.** Supplier packaging protects
for transit, not for an afternoon on a sunny dock or a weekend in a
closed vehicle.


### Powdery mildew control compatible with a predator program

| Option | Mode | Persistence | Effect on predators | CAN/CGSB-32.311 |
|---|---|---|---|---|
| Sulphur | protectant film | long | **acutely toxic** | permitted |
| Potassium bicarbonate | contact eradicant | none | low chemically; the spray event dislodges larvae | active permitted — **verify formulation** |
| *Reynoutria* extract (elicitor) | induces the plant's own resistance | ~7 d, plant-side | very low — acts on plant metabolism | botanical — **status to verify** |
| *Bacillus* spp. | colonises the leaf surface | moderate | low | permitted as microbial — verify product |

- "lasting" splits into two mechanisms: a **persistent film on the leaf** or a **persistent state in the plant**. Only the first is inherently hostile, because only the first is something the insect walks through

- consequence: an elicitor is the compatible way to buy persistence — and why it cannot rescue an established infection

**How long the standing options last**

| | Elicitor | *Bacillus* |
|---|---|---|
| Protection sits | inside the plant | on the leaf surface |
| Onset | ~2–3 d | immediate |
| Useful window | ~7 d | ~7 d in a greenhouse |
| Covers new growth | **partly** — systemic | **no** |

- **the elicitor has a lag** → a schedule product, started ahead of pressure, never a rescue

- ***Bacillus* protects the leaves it landed on** → a canopy expanding weekly outgrows its own coverage

**Design rules, in priority order**

1. **Interval discipline beats product strength.** A weak product on 7 days outperforms a strong one on 8 weeks. This is the whole decision
2. Standing preventive, curative only on breakout
3. Rotate modes across the standing slot
4. **Spray tomato only** — powdery mildew is a tomato problem here, and it keeps residue off the washed crop
5. **Genetic resistance first** — *Ol*-gene tomato varieties cut the requirement at zero cost to the predators

| Slot | Product | Cadence |
|---|---|---|
| Standing, week A | elicitor | every 14 d |
| Standing, week B | *Bacillus* | every 14 d |
| Curative | potassium bicarbonate | 2 applications 5–7 d apart |

- alternating gives a spray every 7 days with each mode used every 14 — weekly coverage, rotated modes, **no tank mix**

- bicarbonate is **alkaline**, which degrades some co-applied actives and raises phytotoxicity risk → both labels must permit a mix, and a jar test plus a test-plant spray is the only honest check

- alternating beats mixing anyway: it keeps the eradicant off the crop in weeks when nothing needed killing

- **the binding constraint is labour**, not product — 557 m² of tomato canopy sprayed weekly with underside coverage. If that is not sustainable the answer is resistant varieties, not a longer interval with a harsher product

**Spray day versus release day.** A 7-day spray cycle and a 7-day
release cycle collide every week.

- a cohort occupies the crop ~12 d → **there is no week with no vulnerable stage on the leaf**. Offsetting cannot avoid the overlap, only choose which stage takes the hit

- least-bad is **spray immediately after a release**, while the incoming cohort is still in its container and the previous cohort's larvae are near the end of feeding

- cover or lift the release containers while spraying


### Cost structure of a release program

**Supplier price lists, 2026-08 (CAD)** — per-agent detail in
`predators-comparison.md`.

| Supplier | Contact | Order cut-off | Notes |
|---|---|---|---|
| **Koppert Canada** | — | — | **backbone supplier.** Cheapest *Aphidoletes* by half. Ships orders **in full** — never mix a lead-time item into a standing order |
| Anatis Bioprotection (QC) | 1-800-305-7714 · orders@anatisbioprotection.com | Thursday 21:00 EST, delivery the following week | full catalogue, dearest on the backbone |
| Natural Insect Control (ON) | — | Friday 12:00 EST, ships the following Tuesday | announced stock-outs; payment at order |
| Applied Bio-nomics (BC) | — | — | publishes formats, not prices |

- **an announced stock-out disqualifies a supplier for a standing line regardless of price** — a program with no reserve cannot absorb a missing week

- **pack size may override the calculation.** A computed dose below one sellable unit rounds up, and the delivered rate rises with it

- **a weekly curative line is the most wasteful item available** — only useful when a colony exists, cannot be stockpiled, and performs worst at the densities a blind release meets. Order on demand

- **freight is the largest lever after the backbone**, and no supplier publishes it. At the current backbone price, freight rather than insects decides the program's cost → consolidating lines onto one delivery is worth more than further shopping on unit price

- **the Thursday cut-off makes the curative slow.** A colony found on a Friday waits ~10 days, and larvae cannot be stockpiled against it → the backbone must be strong enough that nothing needs rescuing


### What a working program looks like from outside

| Signal | Reading |
|---|---|
| Each release | no feeding for ~14–21 d — nothing responds fast |
| Week 0–3 | no visible change; too early to judge |
| Week 3–8 | fewer colonies, defects still appear |
| Week 8+ | ~80 % fewer aphids; 0 defects out of 10 on most harvest days |
| Any week | the jar shows emerged adults |
| Ever | no mummies on any leaf |

Running well:

- the weekly routine takes 15 min and nobody thinks about it

- the order never changes

- the curative is ordered a handful of times a year, not monthly

- predator larvae are visible on any colony found

Not success, even when it feels like it:

- zero aphids in the crop — will not happen, and is not the target

- an empty defect log because nobody inspected


### What lowers the program's efficiency

Ranked by damage. Most are invisible — an open-loop program reports
none of them.

**Program-ending**

- sulphur, in any form, anywhere under this roof
- a broad-spectrum insecticide, including pyrethrin, soap and oil
- missing several weekly releases in a row

**Costs most of a cohort, one week at a time**

- releasing in midday sun — heat, desiccation, dispersal to the glazing
- a box left on a sunny dock, or arriving on a day nobody is there
- holding or refrigerating a shipment past its ceiling
- a dead or diapaused shipment nobody checked

**Costs a share of every release, permanently**

- yellow sticky cards in the cropped bays
- spraying mid-cycle instead of on release day
- releasing from one or two points instead of ~10
- skipping the nursery racks
- night dehumidification, or overnight fans drying the canopy

**Caps the ceiling, whatever else is done right**

- no exclusion screening → new winged arrivals every warm week
- no scouting → a colony builds unopposed until harvest finds it
- an aphid species that sits deep in a lettuce heart

**Wastes money without lowering control**

- ordering above one backbone pack a week
- a standing curative line released blind
- parasitoids, which add mummies the bubbler cannot remove


### Failure modes of a control program

- **Ordering lapse** — the release chain is weekly; one missed shipment costs ~10× population. Standing auto-ship removes the decision

- **Threshold-triggered release** — by the time counts cross a threshold the predator lead time is already lost. Releases must be calendar-driven

- **Spray intervention** — resets the predator population; aphids rebound faster than their consumers

- **Uncropped space** — no host means no aphids and nothing for a beneficial to eat. A fallow bay is outside the program, not a lightly-dosed part of it. A *cropped* unheated bay is different: cold slows aphids but slows every beneficial at least as much, so releases there follow bed temperature rather than the calendar


## Definitions


**Elicitor** — a product that switches on the plant's own defences
instead of attacking the pathogen. Protection lives in the plant, so
it partly covers new growth and cannot rescue an established
infection.

Agent-specific terms — diapause, mummy, intraguild predation,
host-feeding — are defined in `predators-comparison.md § Definitions`.
