# Domain — nutrient transport (soil bank → plant)


How a nutrient physically gets from the soil bank into the crop, and
which step in that chain caps yield.

Companions:

- Which nutrients bank vs leach → `../nutrition/soil-contribution/domain.md`

- Dosing method that acts on this model → `soil-maintenance.md`


## Model


### The journey

The chain a nutrient traverses, root-inward:

- **bank** → **solution** → **root surface** → **root** → **xylem**
  → **shoot**   (each arrow a separate rate; the slowest caps the
  whole chain)

- **bank** ↔ **solution**   (buffered exchange, both directions;
  desorption refills solution as roots draw it down)

- **solution** → **root surface**   (transport — the step with three
  parallel paths below)

- **root surface** → **inside root**   (crossing the membrane — an
  active pump, no water rides in with the ion; see below)

- **root** → **shoot**   (xylem, carried by the transpiration stream;
  phloem relocates the mobile ones afterward)


### Two pools

- **quantity** ↔ **intensity**   (linked by buffer power; quantity is
  the reservoir, intensity is what the root actually sees)

- **buffer power** drives **refill rate**   (high buffer → solution
  holds concentration as roots strip it; low buffer → intensity sags
  under load even with quantity full)

- **quantity** alone does **not** feed the root   (a full bank with
  low intensity still starves the root surface)


### Membrane crossing (root surface → inside root)

Reaching the root surface is not entry. Water and ions part ways
here — water crosses by osmosis, ions cross through selective
proteins. This holds for **every** nutrient, mass-flow or diffusion:

- **ATP** drives **proton pump** → sets up the gradient the ion
  transporters run on   (the plant spends energy)

- **proton gradient** drives **ion transporters / channels**
  (K⁺ transporters, phosphate co-transporters) → pull the ion **in
  against its concentration gradient**

- runs **independent of transpiration** — a barely-drinking root
  (night, overcast) still pumps K and P in

- lets the root hold K at **100–1000× the soil solution** — pure
  active accumulation

Consequence for the K floor: the pump is fed by **concentration at
the surface**, not by water flux → the floor works by raising
intensity, and diffusion (not mass flow) is what keeps that surface
supplied.


### Three delivery paths (solution → root surface)

Every nutrient reaches the root by one dominant path, set by how much
of it the transpiration stream carries versus how fast it diffuses:

- **root interception** — the root grows into fresh soil and meets the
  nutrient in place; a tiny share overall; matters for **P** and the
  strongly-held micronutrient cations (**Zn, Cu, Mn**); grows as roots
  — and the fungal threads of an AMF drench — reach into more soil

- **mass flow** — nutrient rides the transpiration water to the root;
  driven by **transpiration**; dominant for **N, Ca, Mg, S**

- **diffusion** — nutrient creeps down a concentration gradient
  through soil-water films; **decoupled from transpiration**; the only
  real path for **K and P**


### The diffusion bottleneck (K, P)

- **root uptake** > **diffusion supply** at peak demand → a
  **depletion shell** forms at the root skin (root strips faster than
  diffusion refills that thin zone)

- **intensity** drives **diffusion flux**   (higher bulk solution
  concentration → steeper gradient into the shell → faster refill)

- raising intensity fixes the shell, **not mass flow** — it would help
  a non-transpiring root just the same

- **P** is the extreme case: diffusion coefficient ~100–1000× lower
  than K, and no clean organic-soluble source → transport fix is
  **root reach (AMF)**, not solution concentration


### Yield limitation ladder

Yield tracks the **slowest step for the most-limiting nutrient**

| Limiting step | Symptom | Yield loss | Lever |
|---|---|---|---|
| Quantity empty | sustained deficiency | 10–40% | build the pool (front-load / broadcast) |
| Intensity low, quantity full | shows only under peak load | 5–15% | fertigation intensity floor |
| Diffusion lag (K), pool full | transient midday shortfall | 1–3% (mostly quality) | K floor (~+0.2 mS/cm) |
| Transport reach (P) | chronic, pool "full" but locked | 15–30% | AMF drench |
| pH lockout upstream | tissue-low despite in-band pool | 10–50% | soil-pH protocol |



## Invariants

- A full bank does not feed the crop by itself — only intensity at the
  root surface does.

- No nutrient crosses into the root by water flow — membrane entry is
  always an active, selective pump, running with or without
  transpiration.

- Mass flow and diffusion are independent paths; boosting solution
  concentration feeds diffusion whether or not the plant is
  transpiring.


## Boundaries

- Does **not** cover which nutrients bank vs leach (mobility) →
  `../nutrition/soil-contribution/domain.md`.

- Does **not** cover dose sizing or the control law → `soil-maintenance.md`.

- Does **not** cover pH lockout mechanics → soil-pH protocol.


## Vocabulary

**quantity** — the total exchangeable stock of a nutrient in the soil
(the bank; Mehlich-3 reads this). _Avoid_: pool size.

**intensity** — the nutrient concentration in the soil solution — what
the root surface actually sees. SME reads this. _Avoid_: solution level.

**buffer power** — how strongly the bank resists a change in intensity:
how much quantity must move to shift solution concentration. High =
solution stays topped up under uptake.

**depletion shell** — the thin, nutrient-drawn-down zone of soil water
right at the root surface, formed when uptake outruns diffusion refill.
_Avoid_: depletion zone.
