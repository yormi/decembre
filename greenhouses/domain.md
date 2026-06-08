# Domain — Greenhouses


## Model


### Lighting zones

- **Greenhouse** 1—* **lighting zone** ; each zone fixes one LED PPFD.

- Nursery tables → LED **220 µmol/m²/s**

- Lettuce beds → LED **200 µmol/m²/s**

- Tomato beds → no LED (sun-only)


### Light delivery

- LED PPFD → photon flux at canopy   (drives; constant while fixtures on)

- outdoor sun → ×0.55 film → greenhouse sun PPFD   (limited by double-poly transmission)

- bed DLI ← greenhouse sun DLI **+** LED DLI   (two additive sources)

- LED PPFD × run-hours → LED DLI   (integration: instantaneous flux over time)

- DLI [mol/m²/d] = PPFD [µmol/m²/s] × hours × 3600 / 1e6


### LED yield per hour

| Zone | PPFD | DLI added per run-hour |
|---|---|---|
| Lettuce beds | 200 µmol/m²/s | 0.72 mol/m²/d |
| Nursery tables | 220 µmol/m²/s | 0.79 mol/m²/d |


## Boundaries

- Covers the light **supply** — fixture power and how PPFD becomes DLI.

- Hands off crop DLI **targets / bands / edges** to each crop domain (e.g. `nutrition/lettuce/domain.md`).


## Vocabulary

**PPFD** — photosynthetic photon flux density: instantaneous photon arrival rate at the canopy, µmol/m²/s. The fixture's rated power.

**DLI** — daily light integral: PPFD summed over the photoperiod, mol/m²/d. The day's total light dose.
