# Protocol — lettuce, sow → harvest (DRAFT — full-scale vision)

**DRAFT / not yet run.** The full-scale 2-bed/week machine. The active
routine is the 10-ft R&D slice, and it lives in the app —
`app/operator/lettuce/LettuceRoutine.elm` (route `#laitue`). Promote
this once the R&D testbed validates the cadence.

Salanova cycle, d1 (sow) → d35 (transplant) → d49 (harvest). One
action per line. Numbers live in their canonical source — linked, not
copied.

**Continuous cadence.** Every week: sow **2 beds**' worth of 32× 2.5"
trays, harvest **2 beds**, transplant **2 beds**. Each harvested bed
is cleared and replanted the same morning (d49). Steady state = every
stage of the timeline running in parallel on staggered cohorts.

**Container transition (2026-07):** going-forward tray = **32× 2.5"
pots** (~200 mL/cell → ~6.4 L/tray). Legacy = **50-cell, 1.65 L/tray**
— the source of all currently-modelled per-tray values. Where a value
is per-tray, both are given; the 50-cell figure is legacy until the
first 2.5" tray confirms it.


## Timeline

| Day | Move / act | Zone | Light | Source |
|---|---|---|---|---|
| 1 | Sow in OM2 + feather meal | Germination rack | 8× cheap LED **off** | `../domain/lighting-zones.md` |
| ~3 | First germination sign → LED on | Germination rack | 8× cheap LED, 18 h/d → ~10 mol/m²/d | `../domain/lighting-zones.md` |
| 8 | Move trays | Nursery growth rack | 4× SunBlaster T5HO, 18 h/d → ~14 mol/m²/d | `../domain/lighting-zones.md` |
| 15 | Move to greenhouse | Greenhouse table | LED 280 µmol, sun-aligned → hold 20–25 mol/m²/d | `../domain/lighting-zones.md` |
| 28 | Checkerboard trays | Greenhouse table | — | — |
| 35 | Transplant to beds | Lettuce beds | LED 200 µmol + sun | `../domain/lighting-zones.md` |
| 49 | Harvest before 8 am → replant bed | Lettuce beds | — | — |


## d1 — Sow

- Feather-meal front-load: **2 cups / 50 L OM2 sac ≈ 5.3 g/L**
  (volume-based; germination-salt cap).

- Place trays on germination rack; **8× cheap LED off**.

- Insert soil thermometer in a representative 2.5" pot.

- Germination band: soil **18–21 °C**, water-only,
  **pour-through EC < 1**.
  → band: `../domain/propagation.md § Germination conditions`
  → method: `measure-ph-ec/seedlings.md` (pour-through)


## d3 — Germination signal

- On first germination sign → **8× cheap LED to 18 h/d**.


## d8 — Nursery growth rack

- Move trays → Uline 24" shelf, **4× SunBlaster T5HO 54W, 18 h/d**.

- Start weekly fertigation (week 2 onward).
  → recipe: `fertigation/lettuce/seedlings-week-2-to-transplant.js`
    (`STORED_RECIPE.nursery.fertigation`)


## d15 — Greenhouse table

- Move trays → greenhouse table, **LED 280 µmol/m²/s**.

- Run LED to top up sun → hold **20–25 mol/m²/d** at canopy.
  (Follow the app recipe)

- Continue weekly nursery fertigation.


## d28 — Checkerboard

- Space trays checkerboard on the table → airflow + even light as
  canopy closes.


## d35 — Transplant

- Front-load bed with the front-load recipe.
  → sizing: `../domain/fertilisation/lettuce.md`

- Drench 2.5" pots and bed before lifting.

- Transplant to lettuce beds.

- Feed switches to bed fertigation.

- After transplant → measure **EC 1:1** + **pH**.
  → method: `measure-ph-ec/bed-DRAFT.md`


## d49 — Harvest + replant

- Harvest the bed **before 8 am** (cool tissue, pre-heat).

- Clear the bed → transplant the next d35 cohort the same morning.
  (bed turns over in one step; no fallow gap)

- Run the d35 transplant steps on the freed bed.


## Boundaries

- Timeline + moves only. Fixture physics → `../domain/lighting-zones.md`.
  Germination physics + substrate cost → `../domain/propagation.md`.
  Nursery nutrient release → `../nutrition/lettuce/domain/nursery/`.
  Crop growth / DLI targets → `../domain/lettuce/model.md`.
