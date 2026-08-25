# Domain — greenhouse


## Model


### Lighting zones

| Zone | Target | Fixture | Count | Watts | PPFD | mol/m²/d |
|---|---|---|---|---|---|---|
| Germination rack | 10 |  |  |  |  |  |
| -- v1 |  | cheap LED (Barrina T5 20W) | 8 | 160 | 154 µmol/m²/s | 10 |
| -- v2 |  | Barrina T8 42W, 8" pitch | 3 | 126 | ~180 µmol/m²/s | 11.7 |
| -- v3 |  | SunBlaster T5HO 54W + reflector | 3 | 162 | ~162 µmol/m²/s | 10.5 |
| Nursery week 2 rack | 14 |  |  |  |  |  |
| -- v1 (LEGACY) |  | SunBlaster T5HO 54W + reflector | 4 | 216 | ~216 µmol/m²/s | 14 |
| -- v2 |  | Barrina T8 42W, 6" pitch | 4 | 168 | 240 µmol/m²/s (measured) | 15.6 |
| Nursery week 3 rack | 20 | Barrina T8 42W, 5" pitch | 5 | 210 | ~300 µmol/m²/s | 19.4 |
| HPS tables (nursery wk4) | 25 | DE HPS 1100 W, dim 85 % | 3 |  | ~385 µmol/m²/s avg (est. @ 3.5 ft — re-measure at 4 ft) | ~25 |
| Greenhouse table (nursery use) | 25 | LED |  |  | 280 µmol/m²/s |  |
| Lettuce beds |  | LED |  |  | 200 µmol/m²/s |  |
| Tomato beds |  | none (sun-only) |  |  |  |  |

- All rack + HPS zones run **18 h/d** ; mol/m²/d assume 18 h

- Rack zones: 24" Uline shelf, Barrina strips 9" above canopy

- HPS tables: 6 tables 3'×6' under 3 fixtures @ 4 ft; ~25 mol/m²/d is the wk3+ ceiling (max wk4 can take)
    - full power would land ~450–460 µmol/m²/s avg (~30 mol/m²/d) → over ceiling
    - 4 ft cuts radiant heat vs 3.5 ft but spills more light off table edges → avg at plug height likely below the 3.5 ft estimate
    - estimate from fixture PPF; confirm with pyranometer pass at plug height (center vs table edge — edges can run half of center)


### Fixture output (PPF)


| Fixture | PPF | Efficacy |
|---|---|---|
| HPS double-ended, ~1000–1100 W | ~2000 µmol/s | ~1.9 µmol/J |
| [Barrina T5 20W 4ft 6500K](https://www.amazon.ca/-/fr/dp/B07F2WMCP2) ("cheap LED") | ~28 µmol/s | ~1.4 µmol/J |
| SunBlaster T5HO 54W 6400K + reflector | ~72 µmol/s | ~1.3 µmol/J (est.) |
| [Barrina T8 42W 4ft 5000K CRI 98](https://www.amazon.ca/-/fr/dp/B0B3CCLW5D) | ~67 µmol/s | ~1.6 µmol/J (est.) |

- We measured **4× T5 over 18 h → 5 mol/m²/d** (≈77 µmol/m²/s) on one Uline rack shelf. 

- Barrina T8 measured directly: **4× 42 W @ 9" → 240 µmol/m²/s** on one Uline shelf → **60 µmol/m²/s (3.9 mol/m²/d @18 h) per strip** (1.43 µmol/m²/s per shelf-watt). Supersedes the T5-watt scaling (0.96 µmol/m²/s per shelf-watt), which under-read T8 by ~1.5×.



## Boundaries

- Covers the light **supply** — fixture power and how PPFD becomes DLI.

- Hands off crop DLI **targets / bands / edges** to each crop domain (e.g. `lettuce/model.md`).


## Vocabulary

**PPF** — photosynthetic photon flux: total photons a fixture emits per second, µmol/s. A fixed fixture property; PPFD is PPF once it lands on an area.

**PPFD** — photosynthetic photon flux density: instantaneous photon arrival rate at the canopy, µmol/m²/s.

**DLI** — daily light integral: PPFD summed over the photoperiod, mol/m²/d. The day's total light dose.
