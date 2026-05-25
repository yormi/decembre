# Yield Range — app UI specs

UI contract for the Yield Range admin page. Math model:
`yield-range/spec.md`.

Admin page. Salanova nursery only. French UI text.

## Contract

- **2 inputs**: plateau (18/24/32/50), heures DEL (0–18)
- **2 outputs**: capacité plafond (g/plant), graphique poids tête vs jours

---

## REQ-119 — Two inputs

The page provides exactly two inputs:
1. **Plateau** — toggle 18 / 24 / 32 / 50 (cells per tray)
2. **Heures DEL** — slider 0–18 (step 1, default 16)

No other operator-facing inputs.

---

## REQ-120 — Capacité plafond is shown as a labeled numeric display

The page renders the canopy ceiling as a labeled number:
`Capacité plafond: X g/plant` (where X is the math model's
`canopyCapG`). Separate display from the chart's reference line in
REQ-121.

---

## REQ-121 — Growth chart of head weight vs days from germination

The page renders a chart with:
- x-axis labeled **`Jours depuis germination`** (range 0–49, integer)
- y-axis labeled **`Poids tête (g)`**
- Data series = math model's `trajectory` output
- Horizontal reference line at `canopyCapG` (the asymptote)
- Vertical marker at `daysToPotential` when not null
- When `daysToPotential` is null, an annotation reads
  `Plein potentiel non atteint dans la fenêtre de 49 jours`

---

## REQ-132 — Clickable DLI display with f_light response modal

The page renders a clickable element showing the current bench DLI
(`DLI banc: X.X mol/m²/j`). Clicking it opens a modal showing the
`f_light` response curve as a table:

| DLI (mol/m²/j) | Multiplicateur f_light |
|---|---|
| < 4 | 0 (photosynthèse arrêtée) |
| 4 → 12 | rampe linéaire 0 → 1,0 |
| 12 – 17 | 1,0 (optimum) |
| 17 → 22 | rampe linéaire 1,0 → 0,7 (saturation) |
| ≥ 22 | 0,7 (plafond saturation) |

The modal also shows the current `dliBenchAvg` and `dliPerPlant`
values for context.

---

## REQ-133 — Peak potential day shown next to Capacité plafond

The Capacité plafond card displays both `canopyCapG` AND
`daysToPotential` in a single line: `Capacité plafond: X g/plant · pic
à J<n>` (or `pic non atteint dans la fenêtre de 49 jours` when null).

---

## REQ-134 — Bench DLI shown as integer in the page card

Bench DLI shown in the page card (`#yr-dli-value`) is rounded to the
nearest integer with `Math.round()`. The modal context line keeps one
decimal for transparency.

---

## REQ-135 — Bench DLI colour-coded by f_light zone (young-plant indicator)

The bench DLI display value (`#yr-dli-value`) text colour is set based
on `f_light(dliBenchAvg)`: green if ≥ 0.95, yellow if 0.7–0.95, red if
< 0.7. Colour updates on every `renderYieldRange` call. Colour
reflects what young, pre-canopy-closure plants (d ≤ 14) experience —
at that stage `spacing_factor = 1.0` so per-plant DLI equals bench
DLI. Late-cycle reality (per-plant after canopy closure at d ≥ 28,
bench × 0.40) is surfaced in the modal context line, not in this
colour. Mirrors the project's 3-tier convention (REQ-016).

---

## Inherited

Cross-app conventions (REQ-001, REQ-005, REQ-006, REQ-007) apply by
default per the root `CLAUDE.md` "Conventions inherited by every page"
section. This page does not deviate.

- All math-model REQs (REQ-112 to REQ-118) must be satisfied by the
  underlying functions before the page renders meaningful predictions.
