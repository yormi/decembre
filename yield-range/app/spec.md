# Yield Range — app UI specs

UI contract for the Yield Range admin page (Salanova nursery yield prediction).
Math model: `yield-range/spec.md`. Source rationale + design history:
`yield-range/app/derivation.md`.

Admin page. Salanova nursery only. French UI text.

## Contract

- **4 inputs**: plateau (32/50), semaines germ→transplant (1–10),
  stratégie nutritive (actuelle/parfaite), DLI banc (5–29 mol/m²/j slider)
- **4 outputs**: rendement par plant, jour de pic de croissance,
  rendement par m² par an, stratégie optimale
- **7 read-only info values**: T jour, T nuit, VPD photopériode,
  CO₂ photopériode, seuil bolting, RootCap 50-cell, RootCap 32-cell

Cert scale per `nutrition/tomato/plant-needs/spec.md`.

---

## REQ-072 — Four inputs, four outputs

**Statement:** The page provides exactly four inputs (plateau, semaines,
stratégie nutritive, DLI banc) and exactly four outputs (rendement par
plant, jour de pic de croissance, rendement par m² par an, stratégie
optimale). The read-only info block (REQ-078) is allowed alongside but
not counted as an input or output.

**Rationale:** The page exposes only the levers the operator pulls.
Other env conditions (T, VPD, CO₂) stay hardcoded.

**Verification:** Deferred — wired when page lands. Trigger: scan
`#page-rendement-content` for the four named inputs and four named
output elements.

**Cert:** 5

---

## REQ-073 — Live output update

**Statement:** All four outputs update on every input change without
page reload or button click.

**Rationale:** Strategy comparison is the page's primary use.

**Verification:** Deferred — wired when page lands. Trigger: each input
has an `onchange`/`oninput` handler bound to the prediction recompute.

**Cert:** 5

---

## REQ-074 — Stratégie nutritive is a binary toggle

**Statement:** "Stratégie nutritive" is a binary toggle with exactly
two states: `actuelle` and `parfaite`.

**Rationale:** Operator framing ("ideal nutrition?") wraps the model's
CE-curve multiplier without forcing a numeric CE input.

**Verification:** Deferred — wired when page lands. Trigger: scan for
toggle element with both state labels.

**Cert:** 5

---

## REQ-075 — Jour de pic de croissance is a top-level output

**Statement:** "Jour de pic de croissance" surfaces the math model's
`optimalHarvestDay` as a top-level output, expressed in days from
germination.

**Rationale:** Décembre's 2026 spring batch lost 38% of mass between
d28 and d35 by harvesting past peak. Knowing when growth peaks is the
actionable counterpart to knowing predicted weight.

**Verification:** Deferred — wired when page lands. Trigger: page
renders an output element bound to `optimalHarvestDay`, displayed in
days-from-germination.

**Cert:** 5

---

## REQ-076 — Rendement par m² par an formula

**Statement:** "Rendement par m² par an" computes
`plantsPerM2 × gPerSeedling × cyclesPerYear` where
`plantsPerM2 = cellsPerTray / TRAY_AREA_M2`,
`cyclesPerYear = 52 / weeks`,
`gPerSeedling = wPredictedG`,
`TRAY_AREA_M2 = 0.149`.

**Rationale:** g/seedling is a leading indicator; g/m²/yr is the
strategic decision variable.

**Verification:** Deferred — wired when page lands. Trigger: output
value matches formula on known inputs.

**Cert:** 4 — `TRAY_AREA_M2` is approximate (32-cell shares outer
dimensions but cell layout differs slightly).

---

## REQ-077 — Stratégie optimale auto-sweep

**Statement:** "Stratégie optimale" sweeps the 4 combinations of
(plateau × stratégie nutritive). For each combination, the optimum
cycle = `optimalHarvestDay / 7` (rounded). The combination with the
highest `gPerM2PerYear` at its optimum cycle is surfaced, with both
the combination string and the value.

**Rationale:** Auto-sweep removes manual click-through across
combinations. Constraining each combination to its peak day prevents
recommending past-peak harvests.

**Verification:** Deferred — wired when page lands. Trigger: auto-sweep
evaluates exactly 4 combinations and surfaces both combination string
and `gPerM2PerYear` value.

**Cert:** 5

---

## REQ-078 — Read-only info block of fixed model assumptions

**Statement:** The page renders a read-only info block with exactly
seven items: T jour 24 °C, T nuit 18 °C, VPD photopériode 4,5 g/m³,
CO₂ photopériode 500 ppm, seuil bolting 26 °C, RootCap 50-cell 56 g,
RootCap 32-cell 144 g. Values auto-render from the spec constants —
no hardcoded HTML strings.

**Rationale:** REQ-072 keeps these conditions off the input surface.
The operator still needs to know what the model assumes.

**Verification:** Deferred — wired when page lands. Trigger: scan for
the 7 listed labels and matching numeric values; reject hardcoded
duplicates of values already declared in `yield-range/spec.md`
constants.

**Cert:** 5

---

## REQ-084 — DLI banc is a slider input

**Statement:** "DLI banc" is a numeric slider input, range 5 to 29
mol/m²/j (integer or 0.5 step), default 27,5.

**Rationale:** Quebec sun varies ~5–35 mol/m²/j across the year.
Hardcoding annual average hides the largest environmental swing.
Promoting DLI to a per-cohort input lets the operator pick a value
matching the cohort's season. Bounds: lower = deep-winter low light,
upper = annual-avg sun + LED at 18h photoperiod (above 29 the model's
`f_light` saturates anyway). Default = sun-avg + LED-16h, matches the
hardcoded value DLI-banc held before promotion.

**Verification:** Deferred — wired when page lands. Trigger: scan for
slider element with `min=5`, `max=29`, default value 27.5; bound to
the math model's `dliBenchAvg` input.

**Cert:** 5

---

## Inherited

- **REQ-001** (CE not EC in user-facing text)
- **REQ-060** (info block auto-renders from spec constants)
- All math-model REQs (**REQ-063 to REQ-071**) must be wired in code
  before the page renders meaningful predictions.
