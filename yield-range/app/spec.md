# Yield Range — app UI specs

UI contract for the Yield Range admin page. Math model:
`yield-range/spec.md`.

Admin page. Salanova nursery only. French UI text.

## Contract

- **2 inputs**: plateau (18/24/32/50), heures DEL (0–18)
- **2 outputs**: capacité plafond (g/plant), graphique poids tête vs jours

Cert scale per `nutrition/tomato/plant-needs/spec.md`.

---

## REQ-119 — Two inputs

**Statement:** The page provides exactly two inputs:
1. **Plateau** — toggle 18 / 24 / 32 / 50 (cells per tray)
2. **Heures DEL** — slider 0–18 (step 1, default 16)

No other operator-facing inputs.

**Rationale:** Operator's only levers in this iteration. Sun is
hardcoded; other env conditions assumed best (per math-model REQ-113).

**Verification:** Deferred — wired when page lands. Trigger: scan
`#page-rendement-content` for the two named inputs only.

**Cert:** 5

---

## REQ-120 — Capacité plafond is shown as a labeled numeric display

**Statement:** The page renders the canopy ceiling as a labeled
number: `Capacité plafond: X g/plant` (where X is the math model's
`canopyCapG`). This is a separate display from the chart's reference
line in REQ-121 — the chart shows the curve approaching the ceiling;
this number names the ceiling value at a glance.

**Rationale:** The chart's asymptote is visible but not labeled with
its numeric value. Without this standalone display, the operator
must read a y-axis tick or hover over the line to know the cap.

**Verification:** Deferred — wired when page lands. Trigger: page
contains a text element matching pattern `Capacité plafond: \d+ g/plant`
with the value bound to `window.YieldRange.predictNurseryYield(...).canopyCapG`.

**Cert:** 5

---

## REQ-121 — Growth chart of head weight vs days from germination

**Statement:** The page renders a chart with:
- x-axis labeled **`Jours depuis germination`** (range 0–49, integer)
- y-axis labeled **`Poids tête (g)`**
- Data series = math model's `trajectory` output
- Horizontal reference line at `canopyCapG` (the asymptote)
- Vertical marker at `daysToPotential` when not null
- When `daysToPotential` is null, an annotation reads
  `Plein potentiel non atteint dans la fenêtre de 49 jours`

**Rationale:** Visual answer to "how long until I'm at potential?"
Explicit axis labels prevent confusion between days-from-germination
and days-from-sow / weeks. Empty-state annotation prevents silent
absence of the marker.

**Verification:** Deferred — wired when page lands. Trigger: chart
element renders; x-axis label = `Jours depuis germination`; y-axis
label = `Poids tête (g)`; data series bound to `trajectory`;
reference line bound to `canopyCapG`; marker bound to
`daysToPotential`; empty-state text rendered when `daysToPotential`
is null.

**Cert:** 5

---

## REQ-132 — Clickable DLI display with f_light response modal

**Statement:** The page renders a clickable element showing the
current bench DLI (`DLI banc: X.X mol/m²/j`). Clicking it opens a
modal showing the `f_light` response curve as a table:

| DLI (mol/m²/j) | Multiplicateur f_light |
|---|---|
| < 4 | 0 (photosynthèse arrêtée) |
| 4 → 12 | rampe linéaire 0 → 1,0 |
| 12 – 17 | 1,0 (optimum) |
| 17 → 22 | rampe linéaire 1,0 → 0,7 (saturation) |
| ≥ 22 | 0,7 (plafond saturation) |

The modal also shows the current `dliBenchAvg` and `dliPerPlant`
values for context.

**Rationale:** The operator needs to understand WHY the model behaves
as it does at edge DLI values. Hiding the f_light response in the
code makes the model opaque — when a slider change moves the
trajectory unexpectedly, the curve explains it.

**Verification:** Deferred — wired when verifier checks the DLI
element exists with click handler binding to a modal that contains
the 5 breakpoint rows (auto-rendered from
`window.YieldRange.F_LIGHT_BREAKPOINTS` per REQ-060).

**Cert:** 4

---

## REQ-133 — Peak potential day shown next to Capacité plafond

**Statement:** The Capacité plafond card displays both `canopyCapG` AND
`daysToPotential` in a single line: `Capacité plafond: X g/plant · pic
à J<n>` (or `pic non atteint dans la fenêtre de 49 jours` when null).

**Rationale:** The chart marker shows the peak day visually, but
adjacency to the cap value lets the operator compare "how much" + "how
long" without reading the chart.

**Verification:** Deferred — wired when verifier checks the
`#yr-days-to-potential` slot is bound to `daysToPotential` and renders
the number-vs-null branches.

**Cert:** 4

---

## REQ-134 — Bench DLI shown as integer in the page card

**Statement:** Bench DLI shown in the page card (`#yr-dli-value`) is
rounded to the nearest integer with `Math.round()`. The modal context
line keeps one decimal for transparency.

**Rationale:** The page-level number is a quick-read; integer is
cleaner and the variation between integer values is operationally
meaningful. The modal is the precise breakdown.

**Verification:** Deferred — wired when verifier asserts
`#yr-dli-value` text matches `^\d+$` and the modal context line keeps
the `\d+,\d` shape.

**Cert:** 5

---

## REQ-135 — Bench DLI colour-coded by f_light zone (young-plant indicator)

**Statement:** The bench DLI display value (`#yr-dli-value`) text
colour is set based on `f_light(dliBenchAvg)`: green if ≥ 0.95, yellow
if 0.7–0.95, red if < 0.7. Colour updates on every `renderYieldRange`
call. The colour reflects what **young, pre-canopy-closure plants
(d ≤ 14)** experience — at that stage `spacing_factor = 1.0` so per-plant
DLI equals bench DLI. Once the canopy closes (d ≥ 28), per-plant DLI
drops to `bench × 0.40`, and the late-cycle reality is shown in the
modal context line, not in this colour.

**Rationale:** At a glance, the operator sees whether their LED+sun
setup is good for the early growth phase. Bench DLI is what young
plants directly feel; the late-cycle reality (per-plant after canopy
closure) is a separate consideration surfaced in the modal. Mirrors the
project's 3-tier convention (REQ-016).

**Verification:** Deferred — wired when verifier reads the colour at
representative `ledHours` values (e.g. 0 → red, 16 → green, 18 →
yellow) via `window.YieldRange.f_light(window.YieldRange.dliBenchAvg(h))`
and asserts the inline `style.color` against the expected tier.
Breakpoints come from `F_LIGHT_BREAKPOINTS` per REQ-060 — no hardcoded
DLI thresholds in the UI.

**Cert:** 4

---

## Inherited

Cross-app conventions (REQ-001, REQ-005, REQ-006, REQ-007) apply by
default per the root `CLAUDE.md` "Conventions inherited by every page"
section. This page does not deviate.

- All math-model REQs (REQ-112 to REQ-118) must be satisfied by the
  underlying functions before the page renders meaningful predictions.
