# Domain — yield-range · light


How light reaches the Salanova canopy and turns into (or fails to
turn into) yield: bench DLI assembly, the per-plant share once
canopies overlap, the saturating DLI→growth response, the tipburn /
bolting ceiling that caps marketable yield, and the photoperiod
window.


## Model


### Bench DLI assembly


- bench DLI ← sun DLI + lamp DLI   (additive at the canopy)


- sun DLI ← clear-day-max outdoor DLI × sky-condition factor × greenhouse transmission


- lamp DLI ← fixture PPFD × photoperiod hours


- sky-condition factor spans sunny 1.0 → partly cloudy → overcast   (fraction of the clear-day max)


### Nursery propagation rack


- propagation rack = Uline wire shelving + cheap 6000K white LED   (distinct from the 200 µmol/m²/s bed fixtures)


- rack DLI ← LED PPFD × photoperiod   (sun un-budgetable → excluded from the rack DLI budget)


- stacked shelves → only the top tier sees sky; lower tiers are LED-only


- poly nursery + half-day shade → caught sun is non-uniform across tiers, a buffer on top of the LED floor


- top tier: LED + sun stack → can exceed the band on bright days   (lower tiers cannot)


- rack PPFD ← fixture count × per-fixture output × mounting proximity (< 30 cm) × canopy-hit fraction


- cheap 6000K white ≈ 1.4 µmol/J PAR


- even fixture spacing + side reflectors → higher usable PPFD than raw fixture count   (clustered fixtures → hot centre + dark corners)


### Per-plant share


- open canopy → per-plant DLI ≈ bench DLI


- canopy closure → per-plant DLI ← bench DLI × interception share   (falls toward ≈ 0.40 as neighbours overlap)


- a bench DLI reading overstates the dose a closed-canopy plant actually receives


### DLI → growth response


- DLI → growth-rate multiplier   (saturating; lettuce is a low-light crop)


- below a floor DLI → carbon gain ≈ 0


- floor → optimum : multiplier ramps up   (light-limited)


- optimum band : multiplier flat — extra DLI buys no growth


- past the optimum : multiplier declines — surplus light is not converted to yield


- the multiplier scales the expolinear growth engine   (→ yield-range · seedling weight)


### Plug light demand by age


- demand ramps with plug age → DLI past the stage optimum is wasted; on tender tissue it is stressful


- week 1 (cotyledon) : fragile, low demand — floor DLI ~8–10 mol; overshoot (> ~12) → tipburn / stress on tender cotyledons, not faster growth


- week 2+ (true leaves + roots) : cotyledon fragility passed → demand rises into the nursery plug band 12–14 mol; can run full fixtures + 16–18 h


- ≥ 2–3 wk plugs → tolerate full bed-level DLI   (the cotyledon stage is the fragile one)


### Marketable-yield ceiling


- marketable yield ceiling ← tipburn / bolting   (NOT photosynthesis — biomass would keep rising)


- tipburn ← inner-leaf Ca deficit ← growth rate outruns Ca delivery


- Ca delivery ← transpiration stream   (xylem only; weak to low-transpiring inner leaves)


- inner-canopy airflow → transpiration → Ca delivery   (airflow is the primary tipburn relief)


- Salanova dense multileaf head → still inner-canopy air → tipburn-prone


- growth rate ← DLI (× warmth)   (so raising DLI raises tipburn risk unless airflow / Ca / cool keep pace)


### Excess-light failure modes


- tipburn is the *first* over-light limit hit (→ Marketable-yield ceiling); the modes below are additional, not alternatives


- PPFD beyond photosynthetic use → photoinhibition → PSII damage → leaf bleaching / chlorosis   (onset at high PPFD; lower under co-stress heat / cold)


- radiant heat load ← fixture (HPS ≫ LED) → leaf temperature → bolting promotion + transpiration stress


- high-light stress → anthocyanin accumulation → over-reddening / bronzing   (red Salanova; a visible early over-light tell)


- excess PPFD → leaf cupping / curl / thickening; cotyledon scorch on seedlings


- plug: high PPFD → high transpiration → small-cell water draw + EC rise → root stress / stunting   (cell buffer, not the leaf, is the limit)


### Photoperiod


- lamp DLI ← photoperiod hours   (the only knob once fixture PPFD is fixed)


- long photoperiod (> ~14–16 h) → bolting promotion   (compounds with accumulated thermal time)


- 18h photoperiod is max recommended


- continuous light (~24 h) → leaf chlorosis / necrosis


### Setpoints


| Factor | Target | Band | Edge |
|---|---|---|---|
| DLI — production head | ~17 mol/m²/d | 14–20 | > ~20 → tipburn / bolting unless airflow + Ca + cool keep pace |
| DLI — propagation wk 1 (cotyledon) | ~8–10 mol/m²/d | 6–10 | > ~12 → tipburn / stress on tender cotyledons |
| DLI — nursery plug (wk 2–3) | 12–14 mol/m²/d | 8–14 | limited by small-cell water/EC buffering + tipburn, not light tolerance |
| Photoperiod | 16 h | 14–18 | > 18 → chlorosis; > ~14–16 → bolting clock runs |
| Fixture PPFD — bed | 200 µmol/m²/s | — | fixed hardware |
| Fixture — propagation rack | cheap 6000K white | — | LED-only DLI (sun excluded) |


## Boundaries


- Site light climate (clear-day-max DLI, cloud attenuation, annual mean) → root `domain.md`.


- Film transmission and LED fixture → `domain/greenhouse.md`.


- Seedling growth-weight engine (radiation use efficiency ε, expolinear curve, canopy-volume cap) → yield-range · seedling weight (`yield-range/domain/domain.md`).


## Vocabulary


**sky-condition factor** — the fraction of the clear-day-max DLI that reaches the ground under a given day's cloud cover; 1.0 on a sunny day, lower for partly cloudy, lowest overcast.


**photoinhibition** — damage to the leaf's light-capturing machinery when incoming light exceeds what photosynthesis can consume; shows as bleaching / chlorosis.


**PSII** — Photosystem II, the protein complex that splits water at the front of photosynthesis; the first casualty of photoinhibition.
