# Yield Range — app UI derivation

Source rationale, design history, and value provenance for the Yield Range
admin page. Bare normative claims live in `yield-range/app/spec.md`. This
file holds the *why-this-number* and *why-this-design*.

---

## Source for each info-block value (REQ-078)

| Item | Value | Source |
|---|---|---|
| T jour | 24 °C | Décembre tomato-zone setpoint (nursery shares the zone) |
| T nuit | 18 °C | Décembre tomato-zone setpoint |
| VPD photopériode | 4,5 g/m³ | Cycle-average inferred from May 1 2026 climate dashboard (`farm info/`) |
| CO₂ photopériode | 500 ppm | Cycle-average inferred from May 1 2026 chart: night 700–900 ppm with vents shut, day 350–450 ppm with vents open. Photoperiod-weighted ≈ 500 |
| Seuil bolting | 26 °C T jour soutenu | `BOLTING_TDAY_THRESHOLD_C` constant in `yield-range/spec.md` |
| RootCap 50-cell | 56 g | `cellVolumeML × SHOOT_PER_ML_SUBSTRATE` = 35 × 1.6 |
| RootCap 32-cell | 144 g | 90 × 1.6 |

When conditions change (e.g., nursery moves to a cooler space), update
the source constants in `yield-range/spec.md`; the info block re-renders
on next page load (REQ-060 no-narrative-drift).

---

## DLI input bounds (REQ-084)

DLI banc is a numeric slider, **5 to 29 mol/m²/j**, default **27,5**.

- **Lower bound 5**: deep-winter low-light scenario (heavy overcast,
  short days, no LED). Below this, lettuce growth is essentially
  arrested and the model isn't operationally useful.
- **Upper bound 29 = sun (16) + LED (12,96 at 18h)**:
  - Sun = `DLI_SUN_GH_ANNUAL_AVG_QC = 16` (Quebec greenhouse, ~55%
    PAR transmission, annual mean — cert 2)
  - LED at 18 h = 200 µmol/m²/s × 18 h × 3600 / 1e6 = 12,96
  - Above 29 the model's `f_light` saturates anyway (cap at 22 mol/m²/j)
- **Default 27,5 = sun (16) + LED at 16 h (11,5)** — current Décembre
  setup with LEDs running standard 16h photoperiod

DLI was previously a hardcoded model assumption (info block). Promoted
to user input on 2026-05-09 because seasonal variation (Quebec sun
ranges ~5–35 mol/m²/j across the year) is the single largest
environmental swing — operator strategy depends on when in the year
the cohort runs.

---

## Design history (what we considered and rejected)

### Espacement (spreading trays mid-cycle) — dropped

Initial proposal had an espacement input (`jamais` / `d14` / `d21`).
Operator critique: spreading trays apart only helps **edge plants** in a
50-cell grid; **interior plants stay self-shaded** regardless. Roughly
half of a 50-cell tray is interior cells, so spreading is a weak lever
that conflates two distinct operations (plant-level vs tray-level
density). Density is now driven by tray choice (32 vs 50) only — every
plant in a 32-cell benefits uniformly from the lower density.

### Transplant-readiness flag — dropped

Initial proposal had a binary `Prêt à transplanter (oui/non + raison)`
output. Operator preferred to see `jour de pic de croissance` (the day
growth peaks) directly, as a number. Cleaner read, less paternalistic.
The 80g+ readiness threshold the operator initially mentioned would
have eliminated 50-cell entirely (RootCap = 56 g) — making the choice
implicit instead lets the operator see the trade-off explicitly through
the auto-sweep output.

### Multi-stage system view (5 beds, allocation, alternate locations) — out of scope

Strategic question "how to allocate 5 lit beds + barn + low-light
nursery for max kg/year" was scoped out. Page is nursery-only. System
allocation may resurface as a separate project later.

### 8-block visual layout (REQ-075 to REQ-080 in early version) — dropped

Early app spec had an 8-block layout (Cohorte / Récolte / Trajectoire /
Contrainte / Leviers / Risques / Calibration / Hypothèses) with
detailed visual REQs. Operator critique: those were layout decisions,
not contract specs. Trimmed to bare contract REQs.

---

## REQ tally history

| Date | REQs in app spec | Note |
|---|---|---|
| 2026-05-09 morning | REQ-072 to REQ-080 (9) | Initial 8-block layout |
| 2026-05-09 noon | REQ-072 to REQ-074 (3) | Trimmed to bare contract |
| 2026-05-09 afternoon | REQ-072 to REQ-077 (6) | Strategy-tool extension |
| 2026-05-09 evening | REQ-072 to REQ-078 (7) | Info block added |
| 2026-05-09 evening | REQ-072 to REQ-078 + REQ-084 (8) | DLI promoted to input slider; new convention applied |

Yield-range range: **REQ-063 to REQ-078** (math + early app) and **REQ-084** (DLI slider). REQ-079/080 taken by compost-contribution; REQ-081/082/083 by plant-needs.

---

## Implementation map

Deferred — populated when the page lands in code. Will list:
- Container id (`page-rendement-content`)
- Input element ids and binding
- Output element ids and binding
- Auto-sweep function name
- Info-block render function name
