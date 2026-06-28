# Domain — Décembre (site)


## Model


### Site light climate (Quebec City, ~46.8°N)


- **broadband solar energy** → **PAR DLI**   (×~2 µmol PAR per J broadband: ~45% of broadband energy is PAR, ~4.6 µmol/J within the band)


**PAR DLI** — photosynthetic photons integrated over a day:


- clear-day max → monthly mean   (attenuated by cloud cover: ×0.40-0.60 May-Aug, ×0.35-0.45 Nov-Feb)



| Month | Clear-day max outdoor DLI |
|---|---|
| Jan | ~14 |
| Feb | ~24 |
| Mar | ~36 |
| Apr | ~48 |
| May | ~56 |
| Jun | ~60 |
| Jul | ~58 |
| Aug | ~50 |
| Sep | ~38 |
| Oct | ~26 |
| Nov | ~14 |
| Dec | ~12 |


- annual outdoor mean ≈ 30 mol/m²/d   (cloud-adjusted across the year; the value `yield-range` consumes as `DLI_SUN_OUTDOOR_QC_ANNUAL`)


**Broadband solar energy** — total shortwave on a horizontal surface; daily mean and day-to-day range per month (MJ/m²/d; ×100 = J/cm²/d):


| Month | Avg | Range (min–max day) |
|---|---|---|
| Jan | 5.0 | 0.8 – 10.1 |
| Feb | 8.2 | 1.3 – 15.7 |
| Mar | 12.6 | 2.1 – 22.3 |
| Apr | 16.1 | 2.4 – 28.5 |
| May | 18.7 | 3.6 – 31.4 |
| Jun | 20.3 | 3.9 – 32.5 |
| Jul | 20.1 | 4.2 – 30.8 |
| Aug | 17.5 | 2.7 – 27.4 |
| Sep | 13.6 | 1.9 – 23.2 |
| Oct | 8.0 | 1.2 – 17.4 |
| Nov | 4.8 | 0.7 – 11.3 |
| Dec | 3.5 | 0.6 – 7.3 |


- annual broadband mean ≈ 12.4 MJ/m²/d   (= 1240 J/cm²/d)


## Boundaries

- Hands off film transmission and LED addition to the **greenhouses** domain (`greenhouses/domain.md`).
