# Tomate — sidedress-recipe · derivation

How the model is built. Spec in `spec.md`; rejected alternatives in
`learnings.md`.

---

## Mass-balance derivation (REQ-087)

For each stage `T1..T5` and chosen product `p = SIDEDRESS_PRODUCTS[chosen]`:

```
n_offtake_mg/m²/wk  = TOMATO_FRUIT_EXPORT.N × stageYield × 1 000
                    + BIOMASS_DEMAND[stage].N
n_compost_mg/m²/wk  = CompostContribution.releasePerWeek.N × 1 000
n_needed_mg/m²/wk   = max(0, n_offtake − n_compost)
g/m²/wk             = n_needed / (p.n_pct × p.eff) / 1 000
g/planche/wk        = g/m² × SIDEDRESS_AREA_PER_PLANCHE  (rounded)
```

Product-agnostic; only `n_pct` and `eff` change. Implemented in
`calc.js` as `computeStageSidedress(stage, product)`.

---

## N-only by design

Sidedress is single-element (N) — organic-N concentrates (farine de
plumes 13-0-0, alfalfa 3-0.5-2) are the natural carrier. K / P / Ca /
Mg / micros rejected — see `learnings.md`.

Output shape carries `actisol_g`, `farine_g`, `alfalfa_g` fields;
`actisol_g` hard-zeroed by REQ-089 (Ca-bearing). `farine_g` and
`alfalfa_g` mutually exclusive — operator picks via `product` arg.

---

## Per-stage values — both Ca-free options

### Option A — `chosen = 'FarinePlumes'` (current wired default)

| Stage | stageYield kg/m²/wk | offtake N mg/m²/wk | compost N mg/m²/wk | needed mg/m²/wk | farine_g/m²/wk | farine_g/planche/wk |
|-------|---------------------|--------------------|--------------------|-----------------|----------------|---------------------|
| T1    | 0                   | 700                | 1 100              | 0               | 0              | 0                   |
| T2    | 0                   | 1 050              | 1 100              | 0               | 0              | 0                   |
| T3    | 0.3                 | 1 750 + 486 = 2 236 | 1 100              | 1 136           | 12.48          | 683                 |
| T4    | 1.0                 | 1 377 + 1 620 = 2 997 | 1 100              | 1 897           | 20.85          | 1 140               |
| T5    | 1.5                 | 1 620 + 2 430 = 4 050 | 1 100              | 2 950           | 32.42          | 1 773               |

(From `wireFpSidedress` output 2026-05-23 after FarinePlumes.eff 0.75 → 0.70 refit.)

### Option B — `chosen = 'AlfalfaMeal'` (Eco-luzerne 3-0.5-2)

Same N gap; product N % 13 → 3, eff 0.70 → 0.65 → ~4.7× more mass.

| Stage | needed mg/m²/wk | alfalfa_g/m²/wk | alfalfa_g/planche/wk |
|-------|-----------------|------------------|----------------------|
| T1    | 0               | 0                | 0                    |
| T2    | 0               | 0                | 0                    |
| T3    | 1 136           | 58.3             | 3 188                |
| T4    | 1 897           | 97.3             | 5 322                |
| T5    | 2 950           | 151.3            | 8 274                |

`g/m² = needed / (0.03 × 0.65) / 1000`. Ratio (13×0.70)/(3×0.65) ≈ 4.7×.

T1 / T2 = 0: vegetative N fully covered by compost residual. Team starts
sidedress at T3 (first fruit set), when offtake exceeds compost release.

---

## Mineralization efficiencies — `SIDEDRESS_PRODUCTS[*].eff`

Steady-state weekly availability assumes 4-8 weeks of accumulated
applications mineralizing simultaneously. Cert 2-3 — values within
ranges in Sonneveld & Voogt 2009 (Plant Nutrition of Greenhouse Crops,
ch. 8) for animal-protein products; alfalfa cert 2 from organic-N
literature.

| Product · element     | Efficiency | Cert | Note                                                                 |
|-----------------------|-----------|------|----------------------------------------------------------------------|
| `Actisol.eff` (N)     | 0.60      | 3    | Composted manure pellet, slower than feather meal (~30-60 % yr-1).   |
| `Actisol_P` (legacy)  | 0.50      | 3    | Organic P slower than N; pH 7.4 also locks part as Ca-phosphate.     |
| `Actisol_K` (legacy)  | 0.85      | 3    | K mostly water-soluble in pellets; fast release (~70-90 % organics). |
| `FarinePlumes.eff`(N) | 0.70      | 3    | Animal protein, 70-85 % mineralizes in 6-8 weeks (warm GH soil); refit to lit floor 2026-05-23 after TOM #1 T5 tissue N -27 %. |
| `AlfalfaMeal.eff` (N) | 0.65      | 2    | Plant protein, slightly slower than feather meal; cert 2 (literature). |

Décembre values within literature ranges; FarinePlumes refit from
mid-band 0.75 to floor 0.70 on 2026-05-23 (see below). Justified by
(a) consistent weekly application → steady-state stack; (b) warm
greenhouse soil during T3-T5. Cold-shoulder behavior tracked separately
in the Caveats list below (no cold-season scalar wired today).

**Per-product cert defense:**

- **FarinePlumes 0.70 (N) — cert 3.** Sonneveld & Voogt 2009 reports
  70-85 % feather-meal N release in 6-8 weeks at warm soil (≥18 °C).
  Décembre GH soil sits in that range through T3-T5; weekly stack
  delivers steady-state. Value sits at the literature floor after the
  2026-05-23 refit (was mid-band 0.75) — TOM #1 T5 tissue N 2.27 % vs
  lab floor 3.10 % (-27 %) indicated 0.75 was optimistic for Décembre
  conditions. Cert held at 3: single-cohort refit; further downward
  move gated on n ≥ 5 stage-tagged cohorts + petiole NO₃-N tracking.
- **AlfalfaMeal 0.65 (N) — cert 2.** Lower than feather meal because
  plant protein mineralizes slightly slower (C:N ~14 vs ~7 for feather
  meal). Cert 2: no Décembre operational track record yet (alfalfa
  branch non-default pending cert filing); value is literature mid-
  range pick.
- **Actisol 0.60 (N) — cert 3.** Composted manure pellet — slower
  than feather meal because the N is already partly stabilized.
  Operationally gated out by REQ-089 today; cert kept at 3 so the value
  is defensible if Ca-saturation drops and the product re-enters.

---

## Channel efficiency map (REQ-157)

`window.SidedressRecipeTomato.efficiency` (REQ-157) declares the
per-element delivery fraction the channel currently routes.

| Element | Value | Source                                                  |
|---------|-------|---------------------------------------------------------|
| N       | 0.70  | `SIDEDRESS_PRODUCTS.FarinePlumes.efficiency` (cert 3)   |

K and P absent — REQ-089 gate locks Actisol out on Ca-saturated soil
(`Actisol.ca_pct = 0.03 > 0`), so its K (0.85) and P (0.50) contributions
are zero by construction. FarinePlumes is N-only by label (13-0-0). If
Actisol re-enters the channel (soil Ca drops, REQ-089 gate releases),
this map gains K and P entries — needs a derivation update in lockstep.

**Refinement triggers:**

- **REQ-089 gate releases** → Actisol may re-enter the channel; map
  gains K (0.85) + P (0.50, possibly lower with pH-lockout multiplier).
  Concrete observable: Mehlich-3 Ca < 7 500 kg/ha (back near
  pre-greenhouse 5 956 kg/ha baseline; current 10 989 kg/ha tomato +
  10 612 kg/ha lettuce). Equivalent operator signal: base saturation
  Ca% < 70 % of CEC. Whichever resolves first on the next Berger Labs
  panel.
- **Default product swap to AlfalfaMeal** (operator decision, requires
  `/retire-recipe`) → N drops 0.75 → 0.65 (alfalfa cert 2).
- **Tissue panel persistent N under-supply** → re-examine
  `FarinePlumes.efficiency` (currently 0.70 floor of literature range
  for warm-GH conditions after the 2026-05-23 single-cohort refit;
  further downward refit gated on n ≥ 5 stage-tagged cohorts +
  petiole NO₃-N tracking).

---

## Hard-zero at T1 / T2

`n_needed = max(0, offtake − compost)`. At T1 / T2 offtake is
700-1 050 mg N/m²/wk; compost residual releases ~1 100 mg N/m²/wk →
sidedress contribution clamps to zero. Compatible with the cross-cycle
N excess at T1 / T2 declared in `ACCEPTED_EXCESSES` (declared in
`app/index.html`, REQ-014 governed by `nutrition/tomato/spec.md`):
T1.N / T2.N entries accept the residual N over-supply on the grounds
that the compost amendment cannot be undone and the bank draws down
through T3-T5. Sidedress hard-zero is the channel-side expression of
that policy — adding more N at T1 / T2 would deepen the same excess.

---

## Caveats

- **Steady-state mineralization assumed.** First 4-6 weeks ramp up as
  the stack builds. T1 dose is 0 anyway → manifests only at T3
  ramp-up, by which point stack is ~6-8 weeks old.
- **Single-product per call.** No blending in the function contract;
  run twice and sum for a 50/50 mix. Blend-optimization considered
  and rejected — archived in `learnings.md` § "Rejected: blend
  optimization".
- **Eco-luzerne organic-cert unverified at this level.** Alfalfa
  branch remains non-default until a CAN/CGSB-32.311 certificate is
  filed under `nutrition/doc/eco-luzerne-3-0-5-2/` (directory does
  not yet exist as of last scan; REQ-022 inheritance). Filesystem-
  conditioned, no calendar.
- **No cold-season scalar.** Mineralization slows ~30-50 % below 12 °C
  soil. Greenhouse stays warm through T3-T5; add temperature factor to
  `eff` if cycle extends into shoulder weather.
- **Planche area hardcoded.** `SIDEDRESS_AREA_PER_PLANCHE = 54.7 m²` =
  `TOMATO_BED_AREA`. Drift in lockstep if beds reconfigured.

---

## Refinement triggers

- **Eco-luzerne becomes default.** Triggered by CAN/CGSB-32.311
  certificate filed under `nutrition/doc/eco-luzerne-3-0-5-2/`. Mass
  dose grows ~5× (3 % vs 13 % N); re-validate inventory + storage.
  STORED swap gated by `/retire-recipe` audit cycle.
- **New Ca-bearing organic-N product surfaces.** No code change — REQ-089
  rejects automatically via `ca_pct > 0` in `SIDEDRESS_PRODUCTS` entry.
- **Tissue petiole NO₃-N outside 800-1 200 ppm.** Adjust chosen
  product's `eff` (most-uncertain input) and re-derive.
- **2026-05-23 refit — FarinePlumes.eff 0.75 → 0.70.** Single-cohort
  refit triggered by TOM #1 T5 tissue panel (leaf N 2.27 % vs lab
  floor 3.10 %, -27 % of floor). STORED at T5 (Farine 1 341 g + Actisol
  900 g per planche; Actisol gated out by REQ-089) delivered ~2.39 g
  N/m²/wk under the old 0.75 eff vs T5 demand 4.05 g N/m²/wk; tissue
  signal pointed to 0.75 being optimistic for Décembre conditions.
  Moved to lit floor 0.70 — cert held at 3 since the value still sits
  inside the Sonneveld 70-85 % band. Residual tissue gap not explained
  by eff alone; candidates: (a) cumulative shortfall from earlier
  stages (March mineralization × 0.8, April × 1.0); (b) single-sample
  variability. Further downward refit (sub-0.70) gated on n ≥ 5
  stage-tagged cohorts + petiole NO₃-N tracking. FP T5 dose shifts
  1 655 → 1 773 g/planche/wk; STORED ramp gated on `/retire-recipe`.
  Full trace in `nutrition/tomato/research/tomato-t5-tissue-analysis-2026-05-23.md`.
- **`stageYield` retunes.** Dose shifts proportionally; no model edit.
- **Compost release shifts** (REQ-079 verifier drift, or compost ages
  per `compost-contribution/spec.md` decline curve). Re-derives
  automatically.

---

## Implementation map

| File         | Owns                                                       |
|--------------|------------------------------------------------------------|
| `data.js`    | `SIDEDRESS_AREA_PER_PLANCHE`, `SIDEDRESS_PRODUCTS`, `SIDEDRESS_MIN_EFF` (derived view), `FIRST_PRINCIPLES_SIDEDRESS` skeleton |
| `calc.js`    | `computeStageSidedress(stage, product)`, `wireFpSidedress` IIFE |
| `model.js`   | `window.SidedressRecipeTomato` namespace wrapper           |
| `spec.md`    | Spec                                                       |
| `derivation.md` | This file                                               |
| `learnings.md` | Rejected alternatives, historical decisions              |

`app/index.html` load order: AFTER plant-needs (`BIOMASS_DEMAND`,
`TOMATO_FRUIT_EXPORT`), AFTER compost-contribution
(`window.CompostContribution`), AFTER `RECIPE_INPUTS` (`stageYield`),
AFTER `PRODUCT_PCT` (`FarinePlumes_N`, `Actisol_N`). Internal order:
`data.js` → `calc.js` → `model.js`. Consumers (`computeStageRecipe`
context, Banque sol page) come later.
