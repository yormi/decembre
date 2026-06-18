# Protocol — salanova bed pH/EC/salt test (DRAFT v1)

Confirm/refute the salt-not-pH field diagnosis and set safe sulphur +
transplant timing. Diagnosis: `../problem.md`. Evidence:
`../../../lettuce/doc/diagnostic-2026-06-06/diagnosis.md`.

**Question it must close:** at transplant, in the top root zone, is the
bed hostile because EC (salt) is high or because pH is high — and does
the sulphur clock drive it?

**Scope:** salanova beds, 30″ top × 100 ft = 23.2 m² top, 1000 heads.
Current S practice (test assumption): 3 kg/bed/flip ≈ 129 g/m², flip
< monthly, soak (not leach) pre-transplant.

## Method — standard: 1:1 soil:water slurry

Do for all beds under light + the best bed NOT under light

1. Take dirt from 5 spots spread along the bed (e.g. both ends, middle, two between) → top root zone 0–5 cm where the plug exits.

2. Combine the 5 into one bucket → mix → break clumps.

3. Measure 1 part soil : 1 part distilled/clean water by → settle 15–20 min.

4. Read EC in the slurry with the **Bluelab Pulse**.

5. Read pH in the slurry with the **Bluelab pH pen**.

6. Log: bed **letter**, **last transplant date**, sample date, has had sulfur?, pH, EC, soil temp.


## Thresholds — interpretation anchors

Lettuce = moderately salt-sensitive.

**pH**

| Target | Caution | Source |
|---|---|---|
| 6.0–6.8 | > 7.0 | Quebec plein-sol guideline (confirm) |

**EC — 1:1 slurry band (dS/m; 1 dS/m = 1 mS/cm, Pulse reads mS/cm):**

| EC 1:1 | Read |
|---|---|
| **≤ 0.65** | **target** — no salinity yield loss |
| 0.65–1.0 | caution — onset, up to ~10% loss |
| 1.0–1.6 | act — ~10–25% bulking loss |
| > 1.6 | hostile — ≥25% loss, the salt gate |

**Basis (the band is derived, not measured-here yet):**

- Lettuce salinity threshold **ECe 1.3 dS/m**, then **13% yield loss
  per dS/m** above it (Maas-Hoffman; FAO/USDA, UF/IFAS SS117).

- 1:1 slurry reads lower than saturated-paste ECe → convert with
  **factor ~2** (range 1.8–2.1, soil-specific). 1.3 ÷ 2 ≈ **0.65**.

- ⚠️ **Factor is soil-specific — calcareous soils especially.**
  Calibrate Décembre's factor: send ONE paired sample (split: 1:1
  slurry read + lab saturated-paste ECe) → replace the ~2 with the
  measured ratio. Until then the band is an estimate.

- Sulfate from elemental S inflates EC without being a sodium problem
  → pair a high EC read with the lab Na/sulfate subset to tell
  self-applied-sulfate salt from sodium salt.


## Feeds back into

- `../problem.md` field-gate recast (salt + self-applied S, not pH).

- `../goal.md` (to write) — safe S rate/timing + transplant practice.
