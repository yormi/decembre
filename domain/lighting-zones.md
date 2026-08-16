# Domain — greenhouse


## Model


### Lighting zones

- Germination rack
    - v1 → **8× cheap LED, 18 h/d** → **154 µmol/m²/s** (~10 mol/m²/d)

    - v2 → **4× Barrina T8 42W 5000K, 6" pitch, 9" above canopy, 18 h/d** on a 24" Uline shelf → **~161 µmol/m²/s** (~10.4 mol/m²/d)

    - v3 → **3× SunBlaster T5HO 54W + reflector, 18 h/d** on a 24" Uline shelf → **~162 µmol/m²/s** (~10.5 mol/m²/d)

- Nursery growth rack
    - v1 -- LEGACY → **4× SunBlaster T5HO 54W + reflector, 18 h/d** on a 24" Uline shelf → **~216 µmol/m²/s** (~14 mol/m²/d)
    - v2 → **5× Barrina T8 42W 5000K, 5" pitch, 9" above canopy, 18 h/d** on a 24" Uline shelf → **~202 µmol/m²/s** (~13.1 mol/m²/d)

- Greenhouse table (nursery use) → LED **280 µmol/m²/s**

- HPS tables (nursery wk3+) → 6 tables 3'×6' under 3× DE HPS 1100 W @ 3.5 ft, **dim 50 %, 18 h/d** → **~225 µmol/m²/s** avg (~15 mol/m²/d)
    - full power would land ~450–460 µmol/m²/s avg (~30 mol/m²/d) → over wk3 ceiling + radiant-heat risk at 3.5 ft
    - if ballast min is 60 % → ~18 mol/m²/d, still under ceiling
    - estimate from fixture PPF; confirm with pyranometer pass at plug height (center vs table edge — edges can run half of center)

- Lettuce beds → LED **200 µmol/m²/s**

- Tomato beds → no LED (sun-only)


### Light delivery

- LED PPFD → photon flux at canopy   (drives; constant while fixtures on)

- outdoor sun → ×0.65 film → greenhouse sun PPFD   (limited by double-poly transmission)

- bed DLI ← greenhouse sun DLI **+** LED DLI   (two additive sources)

- LED PPFD × run-hours → LED DLI   (integration: instantaneous flux over time)

- DLI [mol/m²/d] = PPFD [µmol/m²/s] × hours × 3600 / 1e6


### LED yield per hour

| Zone | PPFD | DLI added per run-hour |
|---|---|---|
| Germination rack  |  |  |
| -- v1 (8× cheap LED)| 154 µmol/m²/s | 0.55 mol/m²/d |
| -- v2 (4× Barrina T8 42W) | 161 µmol/m²/s | 0.58 mol/m²/d |
| -- v3 (3× SunBlaster T5HO) | 162 µmol/m²/s | 0.58 mol/m²/d |
| Nursery growth rack |  |  |
| -- v1 (4× SunBlaster T5HO) | 216 µmol/m²/s | 0.78 mol/m²/d |
| -- v2 (5× Barrina T8 42W) | 202 µmol/m²/s | 0.73 mol/m²/d |
| Greenhouse table (nursery use) | 280 µmol/m²/s | 1.01 mol/m²/d |
| HPS tables (nursery wk3+, dim 50 %) | ~225 µmol/m²/s | 0.81 mol/m²/d |
| Lettuce beds | 200 µmol/m²/s | 0.72 mol/m²/d |


### Fixture output (PPF)

- PPF = photons leaving the fixture; PPFD = that flux once it lands per m² at canopy   (PPF fixed; PPFD falls with distance × spread)

| Fixture | PPF | Efficacy |
|---|---|---|
| HPS double-ended, ~1000–1100 W | ~2000 µmol/s | ~1.9 µmol/J |
| [Barrina T5 20W 4ft 6500K](https://www.amazon.ca/-/fr/dp/B07F2WMCP2) ("cheap LED") | ~28 µmol/s | ~1.4 µmol/J |
| SunBlaster T5HO 54W 6400K + reflector | ~72 µmol/s | ~1.3 µmol/J (est.) |
| [Barrina T8 42W 4ft 5000K CRI 98](https://www.amazon.ca/-/fr/dp/B0B3CCLW5D) | ~67 µmol/s | ~1.6 µmol/J (est.) |

- We measured **4× T5 over 18 h → 5 mol/m²/d** (≈77 µmol/m²/s) on one Uline rack shelf. The germination rack packs **8×** onto that same shelf → ~154 µmol/m²/s → ~10 mol/m²/d.

- Barrina T8 sizing rides the **measured** cheap-LED row, not manufacturer PPFD: both are bare Barrina strips on the same shelf, so delivered PPFD scales by watts. 4× 20 W → 77 µmol/m²/s gives **0.96 µmol/m²/s per shelf-watt** → **40.3 µmol/m²/s (2.61 mol/m²/d @18 h) per 42 W strip**.


| Zone | Target | Fixture | Count | Watts | mol/m²/d |
|---|---|---|---|---|---|
| Germination v2 | 10 | Barrina T8 42W | 4 | 168 | 10.4 |
| Germination v3 | 10 | SunBlaster T5HO 54W | 3 | 162 | 10.5 |
| Growth v2 | 14 | Barrina T8 42W | 6 | 252 | 15.7 |


- All rack zones run **18 h/d**


## Boundaries

- Covers the light **supply** — fixture power and how PPFD becomes DLI.

- Hands off crop DLI **targets / bands / edges** to each crop domain (e.g. `lettuce/model.md`).


## Vocabulary

**PPF** — photosynthetic photon flux: total photons a fixture emits per second, µmol/s. A fixed fixture property; PPFD is PPF once it lands on an area.

**PPFD** — photosynthetic photon flux density: instantaneous photon arrival rate at the canopy, µmol/m²/s.

**DLI** — daily light integral: PPFD summed over the photoperiod, mol/m²/d. The day's total light dose.
