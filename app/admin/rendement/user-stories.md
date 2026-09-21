# Yield Range — app UI specs

UI contract for the Rendement admin page. Yield model:
`yield-range/domain/spec.md` (carbon-balance `predictYield`).

Admin page. Salanova. French UI text.

## Contract

- **5 inputs** (toggle groups): field spacing · labor routine · thin week 3 ·
  thin week 4 · thin week 5
- **Fixed regime** (not operator inputs): 5-week nursery (transplant J36),
  32-cell tray, clean/well-watered conditions
- **Outputs**: yearly sales, kg/week, trays-in-nursery, heads/bed (stat tiles)
  + seedling (transplant) weight, harvest weight + full-cycle growth chart

---

## inputs

Five toggle groups, state held in the `.active` button:

1. **Espacement** — `FIELD_SPACING_CONFIGS` (7 options, `6r×4"` … `3r×10"`),
   rendered from the engine's option set
2. **Récolte** — `LABOR_ROUTINES` (2/3/4 semaines); sub-label shows field days
3. **Pots / plateau semaine 3 (J15)** — 32/16/10/8 (32 = no thin)
4. **Pots / plateau semaine 4 (J22)** — 32/16/10/8/7 (32 = no thin)
5. **Pots / plateau semaine 5 (J29)** — 16/10/8/7/6/5

Thin = re-potting into trays of N pots. Derived:
`thinEvents = [{15, 32/p3}, {22, 32/min(p3, p4)}, {29, 32/min(p3, p4, p5)}]`
— areaFactor = cells ÷ pots/tray, absolute; each week is clamped down to the
tightest earlier week (never re-crowd). Defaults: `3r8` · `2wk` · S3 16 pots ·
S4 8 pots · S5 8 pots.

Every J-number on this page is a day from sowing, day 1 = the sowing day.

---

## results

Rendered from `predictYield(inputs)`:

- Six stat tiles: **Ventes / an** (`yearlySalesDollars` en k$, tronqué, green),
  **Récolte / semaine** (`kgPerWeek`), **Plateaux pépinière** (`traysInNursery`),
  **Plateaux à semer / sem** (`traysSeededPerWeek`),
  **Racks semaines 1-4** (`ceil(Σ traysByNurseryWeek[week ≤ 4] / 20)`),
  **Têtes / planche** (`headsPerBed`)
- Detail rows: seedling (transplant) weight, harvest weight
- **Plateaux par semaine de pépinière** table: one column per nursery week
  (headers `1`..`5`, bare numbers); row 1 trays on the bench for that cohort
  age (`traysByNurseryWeek`), row 2 racks = `trays / 20`, 1 decimal, caption
  **`2ᵉ ligne : racks de 20 plateaux`**
- Assumptions note: transplant day, pots/tray + days, tray, sowing backup
  % (tray counts), bed geometry, price/kg

All tray counts (tiles + week table) include the model's
`NURSERY_BACKUP_FRACTION` sowing margin; the UI adds no math.

Thousands grouped with a space; no value computed in the renderer.

---

## layout

This page runs full-width: `setPage('rendement')` puts `.container-wide`
(no max width, 24 px side padding) on the app container, and drops it on
every other page. From 1000 px up: a 340–420 px side column holds
**Configuration** over **Rendement**; **Trajectoire de croissance** fills the
remaining width, chart capped at viewport height minus 200 px. Stacked below
1000 px. `app/admin/rendement/page.css`.

---

## growth-chart

Full-cycle fresh-weight trajectories from `predictYield().trajectory`:

- Two curves: **Sélection** (chosen pots/tray) and **Défaut 16/8/8 pots**
  (S3 16 · S4 8 · S5 8); the default curve is skipped when the selection IS the
  default
- x-axis **`Jours depuis semis`** (1..`nurseryDays + fieldDays`, ticks every
  7 days from day 1)
- y-axis **`Poids tête (g)`** (0 to `max(curves) × 1.08`)
- polyline bends at canopy closure, plateaus past the senescence stall
- red dot (`#c0392b`) on each curve at every day the canopy closes
  (`closed` flips false → true), i.e. once per packed stretch: tray,
  after each thin, in the field
- vertical marker at the transplant day, labeled **`Transplant J<day>`**
- legend shows each curve's harvest weight
- below the chart, a red-dot caption **`Fermeture de la canopée`**

- press anywhere on the plot → vertical cursor at the nearest whole day,
  labeled **`J<day>`** at its foot, a dot on each curve at that day, and the
  legend shows **`<weight> g`** at that day instead of the harvest weight;
  dragging while pressed moves the cursor; the day persists across input
  changes (clamped to the x-axis); a press outside the plot area clears it

---

## Inherited

Cross-app conventions (`spec — ui-language-ce-not-ec`,
`spec — url-hash-routing`, `spec — ui-language-plain-french`) apply per the
root `CLAUDE.md`. This page does not deviate. All math-model rules in
`yield-range/domain/spec.md` must hold in the underlying functions before the page
renders meaningful predictions.
