# Domain — tomato supplemental lighting


## Model


### Fixture → canopy light

- **Bay** 1—* **Fixture**   (a bay holds N fixtures over its floor)

- Fixture PPF → canopy PPFD ← spread over bay floor area, scaled by delivery efficiency

- fixtures = ⌈ PPFD_target × floor_area ÷ (PPF × delivery_efficiency) ⌉   (count to hit a canopy target)

- canopy PPFD set by target alone; fixture count only the means to reach it (per-cm² light independent of count)


### Electrical draw → light + heat

- Fixture efficacy → electrical power ← power = PPF ÷ efficacy

- electrical draw → PAR photons + waste heat   (one input, two outputs; ~48% / ~52% split at canopy)

- canopy fraction = efficacy × photon-energy × delivery_efficiency   (wall-plug joule → joule on leaves)

- waste heat → fights climate control   (extra cooling/venting load in the same bay)


### Photon ↔ energy

- PAR photons ↔ radiant joules ← photon-energy ≈ 0.217 J/µmol   (shifts with spectrum; red-heavy LED slightly lower)

- canopy light energy = PPFD_target × floor_area × seconds × photon-energy

- per-area form: J/cm²/day = PPFD × seconds × 0.217 ÷ 10⁴


### Cost

- electrical energy = power × fixtures × photoperiod_hours

- daily cost = electrical energy × energy_price


### Fixed quantities (VYPR 2x)

| Quantity | Value |
|---|---|
| PPF (fixture total output) | 900 µmol/s |
| Efficacy | 2.6 µmol/J |
| Power (derived) | 346 W |
| Delivery efficiency (canopy-side) | ~85% |
| Photon energy (PAR) | 0.217 J/µmol (~4.6 µmol/J) |
| Canopy fraction of draw | ~48% |


## Boundaries

- Models the energy/cost of a hypothetical tomato bay only; does not decide whether to light it, nor the sun's contribution.

- Photoperiod, energy price, bay dimensions, target PPFD are scenario inputs, not domain constants.


## Vocabulary

**PPF** — total photosynthetic photons a fixture emits per second (µmol/s); a fixture spec, not a canopy reading.

**PPFD** — photon flux density landing on the canopy (µmol/m²/s); what a plant actually receives. _Avoid_: conflating with PPF.

**Efficacy** — photons emitted per joule of electricity (µmol/J); sets a fixture's power draw and heat load.
