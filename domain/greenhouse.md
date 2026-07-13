# Domain — greenhouse


## Model


### Lighting zones

- **Greenhouse** 1—* **lighting zone** ; each zone fixes one LED PPFD.

- Greenhouse nursery table → LED **280 µmol/m²/s**

- Lettuce beds → LED **200 µmol/m²/s**

- Germination rack → **8× cheap LED, 18 h/d** → **154 µmol/m²/s** (~10 mol/m²/d)

- Nursery growth rack → **4× SunBlaster T5HO 54W + reflector, 18 h/d** on a 24" Uline shelf → **~216 µmol/m²/s** (~14 mol/m²/d)

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
| Lettuce beds | 200 µmol/m²/s | 0.72 mol/m²/d |
| Greenhouse nursery table | 280 µmol/m²/s | 1.01 mol/m²/d |
| Germination rack (8× cheap LED) | 154 µmol/m²/s | 0.55 mol/m²/d |
| Nursery growth rack (4× SunBlaster T5HO) | 216 µmol/m²/s | 0.78 mol/m²/d |


### Fixture output (PPF)

- PPF = photons leaving the fixture; PPFD = that flux once it lands per m² at canopy   (PPF fixed; PPFD falls with distance × spread)

| Fixture | PPF | Efficacy |
|---|---|---|
| HPS double-ended, ~1000–1100 W | ~2000 µmol/s | ~1.9 µmol/J |
| Cheap 6000K white LED, 20 W | ~28 µmol/s | ~1.4 µmol/J |
| SunBlaster T5HO 54W 6400K + reflector | ~72 µmol/s | ~1.3 µmol/J (est.) |

- Cheap-LED delivered (measured): **4× over 18 h → 5 mol/m²/d** (≈77 µmol/m²/s) on one Uline rack shelf. The germination rack packs **8×** onto that same shelf → ~154 µmol/m²/s → ~10 mol/m²/d.

- SunBlaster PPF is estimated (manufacturer publishes none); reflector adds ~30–40% delivered PPFD. **4× fit a 24" shelf** (~5" reflector, ~6" pitch) → ~14 mol/m²/d @18 h. Confirm with a meter before locking; nudge photoperiod, not fixture count (a 5th won't fit).


## Boundaries

- Covers the light **supply** — fixture power and how PPFD becomes DLI.

- Hands off crop DLI **targets / bands / edges** to each crop domain (e.g. `nutrition/lettuce/domain/domain.md`).


## Vocabulary

**PPF** — photosynthetic photon flux: total photons a fixture emits per second, µmol/s. A fixed fixture property; PPFD is PPF once it lands on an area.

**PPFD** — photosynthetic photon flux density: instantaneous photon arrival rate at the canopy, µmol/m²/s.

**DLI** — daily light integral: PPFD summed over the photoperiod, mol/m²/d. The day's total light dose.
