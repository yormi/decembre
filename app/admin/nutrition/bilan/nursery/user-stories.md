# Nutrition — Semis laitue — app UI specs

UI invariants for the Semis laitue (lettuce nursery) Nutrition admin
subpage: scannable recipe headers, gap-grid tables (manque entrant /
apport ici / manque sortant) with color coding, gap-chain ordering.

Crop-side recipe specs live in `nutrition/nursery/spec.md`; chemistry /
cross-crop rules in `nutrition/spec.md`. Cross-crop URL hash routing
(`spec — url-hash-routing`) covers subpage crop-toggle behavior.

---

## recette-card-layout

An operator recipe card renders above the model blocks — the as-poured
batch for one mixing bucket plus run instructions.

1. **Batch tiles** — 2-column tile grid (same idiom as the Fertigation
   operator card): a water tile (`NURSERY_BUCKET_VOLUME_L` L) first,
   then one tile per product in `NURSERY_RECIPE_DEFAULT` key order. Each
   product tile shows emoji / operator name / amount / unit. Amount =
   `recipe[product] × NURSERY_BUCKET_VOLUME_L`, rounded to 0.1. Powders
   in `g`, liquids in `mL` (per-product display metadata; mL ≈ g at
   density ~1). No amount is hardcoded — all derive from the recipe ×
   bucket volume.

2. **Run instructions** — applications/week (from
   `NURSERY_FERTIGATION_DEFAULTS.applicationsPerWeek`), target ~20 g
   plug, flush 30–50 % each feed (water to runoff), pour-through check
   (rinse if CE > 1,5). Predicted feed CE + cap + tank pH from the calc
   functions.

`NURSERY_BUCKET_VOLUME_L` is a named app-layer constant (94 L bucket the
team mixes). Doses stay in the model as g/L; this card is the only place
that scales to the bucket batch.

---

## block-1-besoins-layout

Block 1 renders a 3-column table — one row per demand element,
columns:

| Column | Content |
|---|---|
| **Él.** | element symbol (N, P, K, …) |
| **Par plant** | `demand[el].perPlant_mg` formatted with the canonical `fmt` helper, suffixed `mg/sem` |
| **Cert** | the per-element cert level (cert N) reading from the local nursery cert table |

No per-tray column, no per-cohort column, no DW-tissue column.
Per-tray and per-cohort are computational steps and surface in
Blocks 2/3 where the gap-chain math needs them.

---

## block-2-substrat-layout

The Block 2 card body has two visual zones in this order:

1. **Recipe header** — one-line scannable summary of what the substrate
   contributes per tray (feather meal `X g/tray` + OM2 starter charge
   reference) above any table. Format:
   `<strong>Farine de plumes X g/plateau</strong> · OM2 starter charge
   (cert 2 placeholder, fiche Berger pendante).` Inline cap reminder
   when the front-load is at `LIMITS.maxFeatherMealPerTrayG`.

2. **Gap-grid table** rendered via the canonical `renderGapGrid(gapsIn,
   contrib, gapsOut, pqKeyPrefix)` function — 6 columns (Él. / Manque
   entrant / Efficacité / Apport ici / Manque sortant / icon), one row
   per element that has either non-zero entering gap or non-zero
   substrate contribution.

**Color coding** (inherited from `renderGapGrid`):
- ✅ when `manque sortant` ≤ 0 (covered)
- 🟢 when `manque sortant` < 30 % of `manque entrant`
- 🟡 when `manque sortant` < 70 % of `manque entrant`
- 🔴 otherwise

---

## block-3-fertigation-layout

Block 3 mirrors `block-2-substrat-layout`'s two-zone layout:

1. **Recipe header** — scannable per-tray dose list (one product per
   `<strong>` block) + the per-fertigation CE and tank-pH readout with
   green/red color depending on whether the cap and envelope are met.
   Frequency annotation `×N/sem` from the `nutr-n-applications` input.

2. **Gap-grid table** via `renderGapGrid` — same 6-column shape as
   Block 2. The fertigation contribution column shows weekly delivery
   (per-fertigation × applicationsPerWeek).

CE / pH stay in the header because they're recipe-level constraints,
not per-element gaps.

---

## gap-chain-order

The Block 2 + Block 3 + Block 4 gap chain runs in a fixed order:

```
gapAfterDemand    = demand
gapAfterSubstrate = max(0, gapAfterDemand   − substrateContribution)
gapAfterFert      = max(0, gapAfterSubstrate − fertigationContribution)
```

Block 2 displays `(demand, substrate, gapAfterSubstrate)`.
Block 3 displays `(gapAfterSubstrate, fertigation, gapAfterFert)`.
Block 4 (leviers) reads `gapAfterFert` as residual.

The order is **substrate first, fertigation second**, NOT the other
way. Substrate is passive supply present from day 1; fertigation is
the active lever sizing against what remains.

---

## Inherited specs

- `spec — url-hash-routing` — URL hash routing for the crop
  sub-toggle (`#admin/nutriment/nursery`).
- `spec — ui-language-ce-not-ec` — French CE in user-facing text.
- `nutrition/spec — narrative-derived-from-live-data` — narrative
  copy must not contradict current data; auto-derive.
- `nutrition/spec — contribution-channel-details-payload` — every
  contribution channel function returns `details{el: {cert, cap}}`
  alongside its flat mg map. `SubstrateContributionNursery` and
  `FertigationNursery` MUST conform when wired.
- `nutrition/spec — contribution-block-gap-grid` — recipe header +
  6-col gap-grid layout (Block 2 + Block 3 use this).
  `block-2-substrat-layout` / `block-3-fertigation-layout` are
  crop-specific extensions.
- `nutrition/spec — efficacite-column-capability` — Efficacité column
  displays the share of applied product mass plant-available per
  element; `—` when no product routes the element.
- `nutrition/spec — apport-ici-clickable-cert-and-cap-modals` — Apport
  ici cells clickable for cert modal; cap emojis (🔥💧❗) clickable
  for cap-reason modal. Modal is scoped per (block, element, click
  target) — never aggregates across elements or blocks.
