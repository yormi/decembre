# Yield Range — app UI specs

UI contract for the Rendement admin page. Yield model:
`yield-range/domain/spec.md` (carbon-balance `predictYield`).

Admin page. Salanova. French UI text.

## Contract

- **5 inputs** (toggle groups): field spacing · labor routine · nursery
  duration (weeks) · nursery tray · thinning on/off
- **Outputs**: yearly sales, kg/week, trays-in-nursery, heads/bed (stat tiles)
  + seedling (transplant) weight, harvest weight, peak + full-cycle growth
  chart

---

## inputs

Five toggle groups, each rendered from the engine's option sets (no option
text hardcoded), state held in the `.active` button:

1. **Espacement** — `FIELD_SPACING_CONFIGS` (7 options, `6r×4"` … `3r×10"`)
2. **Récolte** — `LABOR_ROUTINES` (2/3/4 semaines); sub-label shows field days
3. **Durée pépinière** — 2/3/4/5 semaines → `nurseryDays = weeks × 7 + 1`
4. **Plateau pépinière** — `NURSERY_TRAY_CELLS` (50/32/18)
5. **Éclaircissage** — Oui / Non (checker-thin)

Derived: `thinDay = max(1, nurseryDays − 7)` (thin ~1 week before
transplant). Defaults: `4r6` · `2wk` · `5 sem` · `32` · thin on · conditions
optimales.

Every J-number on this page is a day from sowing, day 1 = the sowing day.

---

## results

Rendered from `predictYield(inputs)`:

- Four stat tiles: **Ventes / an** (`yearlySalesDollars` en k$, tronqué, green),
  **Récolte / semaine** (`kgPerWeek`), **Plateaux pépinière** (`traysInNursery`),
  **Têtes / planche** (`headsPerBed`)
- Detail rows: seedling (transplant) weight, harvest weight (+ **sénescence**
  badge when `senescingAtHarvest`), peak weight · day
- Assumptions note: transplant day, thin day (if on), bed geometry, price/kg —
  plus the uncalibrated-senescence caveat

Thousands grouped with a space; no value computed in the renderer.

---

## layout

This page runs full-width: `setPage('rendement')` puts `.container-wide`
(max 1400 px) on the app container, and drops it on every other page. The
three cards (**Configuration** · **Rendement** · **Trajectoire de
croissance**) then sit side by side in one row from 1000 px up (chart column
widest); stacked below that. `app/admin/rendement/page.css`.

---

## growth-chart

Full-cycle fresh-weight trajectory from `predictYield().trajectory`:

- x-axis **`Jours depuis semis`** (1..`nurseryDays + fieldDays`, ticks every
  7 days from day 1)
- y-axis **`Poids tête (g)`** (0 to `max(peak, fieldCap) × 1.1`)
- polyline bends at canopy closure, declines past senescence onset
- horizontal reference line at `fieldCapG`, labeled **`Plafond champ`**
- vertical marker at the transplant day, labeled **`Transplant J<day>`**
- peak dot at (`peakDay`, `peakWeightG`), labeled with the weight

---

## Inherited

Cross-app conventions (`spec — ui-language-ce-not-ec`,
`spec — url-hash-routing`, `spec — ui-language-plain-french`) apply per the
root `CLAUDE.md`. This page does not deviate. All math-model rules in
`yield-range/domain/spec.md` must hold in the underlying functions before the page
renders meaningful predictions.
