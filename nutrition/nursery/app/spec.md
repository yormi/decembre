# Nutrition — Semis laitue — app UI specs

UI invariants for the Semis laitue (lettuce nursery) Nutrition admin
subpage: scannable recipe headers, gap-grid tables (manque entrant /
apport ici / manque sortant) with color coding, gap-chain ordering.

Crop-side recipe specs live in `nutrition/nursery/spec.md`; chemistry /
cross-crop rules in `nutrition/spec.md`. The cross-crop URL hash routing
spec (REQ-005, in `requirements.md`) covers the subpage crop-toggle
behavior.

Cert scale (canonical): see `nutrition/tomato/plant-needs/spec.md`.

---

## REQ-130 — Block 1 (Besoins) layout

**Statement:** Block 1 renders a 3-column table — one row per demand
element, columns:

| Column | Content |
|---|---|
| **Él.** | element symbol (N, P, K, …) |
| **Par plant** | `demand[el].perPlant_mg` formatted with the canonical `fmt` helper, suffixed `mg/sem` |
| **Cert** | the per-element cert level (cert N) reading from the local nursery cert table |

No per-tray column, no per-cohort column, no DW-tissue column. Per-plant
is the operationally relevant unit for tissue-test reasoning and for
sanity-checking "does this seedling-stage demand make sense?" Per-tray
and per-cohort numbers belong in Blocks 2/3 (gap-grid contributions,
where they're already shown).

**Rationale:** Spec discipline — Block 1 had been showing five columns
(Él / Par plant / Par plateau / Par cohorte / Cert · DW tissu) on the
assumption all four would be useful. In practice the operator reads
*per-plant* to validate the demand model (does a 90 g seedling really
need 63 mg N/sem?), then immediately drops to Block 2 to see how the
gap closes. Per-tray and per-cohort are computational steps, not
display surface — they live inside the model and surface in Blocks 2/3
where the gap-chain math needs them.

---

## REQ-127 — Block 2 (Réserve substrat) layout

**Statement:** The Block 2 card body has two visual zones in this order:

1. **Recipe header** — one-line scannable summary of what the substrate
   contributes per tray (feather meal `X g/tray` + OM2 starter charge
   reference) above any table. Format:
   `<strong>Farine de plumes X g/plateau</strong> · OM2 starter charge
   (cert 2 placeholder, fiche Berger pendante).` Inline cap reminder
   when the front-load is at `LIMITS.maxFeatherMealPerTrayG`.

2. **Gap-grid table** rendered via the canonical `renderGapGrid(gapsIn,
   contrib, gapsOut, pqKeyPrefix)` function — 5 columns (Él. / Manque
   entrant / Apport ici / Manque sortant / icon), one row per element
   that has either non-zero entering gap or non-zero substrate
   contribution.

**Color coding** (inherited from `renderGapGrid`):
- ✅ when `manque sortant` ≤ 0 (covered)
- 🟢 when `manque sortant` < 30 % of `manque entrant`
- 🟡 when `manque sortant` < 70 % of `manque entrant`
- 🔴 otherwise

**Rationale:** Aligns the Semis subpage with the visual language of the
Tomato Nutrition page (Blocks 2-5 there use the same gap-chain table).
Operators read both pages; consistency reduces friction. The recipe
header above the table is the *scannable* part — what's in the bucket
without needing to read the table — and the table is the *analytical*
part. Two zones, distinct purposes.

---

## REQ-128 — Block 3 (Fertigation) layout

**Statement:** Block 3 mirrors REQ-127's two-zone layout:

1. **Recipe header** — scannable per-tray dose list (one product per
   `<strong>` block) + the per-fertigation CE and tank-pH readout with
   green/red color depending on whether the cap (REQ-098) and envelope
   (REQ-099) are met. Frequency annotation `×N/sem` from the
   `nutr-n-applications` input (REQ-122 consumer).

2. **Gap-grid table** via `renderGapGrid` — same 5-column shape as
   Block 2. The fertigation contribution column shows weekly delivery
   (per-fertigation × applicationsPerWeek), so what the user sees is
   how the chosen frequency closes the gap.

**Rationale:** The fertigation block has both the recipe (scannable
operational summary) and the per-element math (gap analysis) in one
card — the user can decide whether to push frequency up or modify the
recipe just by reading top-to-bottom. CE / pH stay in the header
because they're recipe-level constraints, not per-element gaps.

---

## REQ-129 — Gap chain order: demand → substrate → fertigation → leviers

**Statement:** The Block 2 + Block 3 + Block 4 gap chain runs in a fixed
order:

```
gapAfterDemand    = demand
gapAfterSubstrate = max(0, gapAfterDemand   − substrateContribution)
gapAfterFert      = max(0, gapAfterSubstrate − fertigationContribution)
```

Block 2 displays `(demand, substrate, gapAfterSubstrate)`.
Block 3 displays `(gapAfterSubstrate, fertigation, gapAfterFert)`.
Block 4 (leviers) reads `gapAfterFert` as residual.

The order is **substrate first, fertigation second**, NOT the other way.

**Rationale:** Substrate is a passive supply that the seedling pulls
without operator intervention — it's the "free" supply, present from
day 1. Fertigation is the *active* lever that sizes against what
remains. Reversing the order (fertigation first) would frame
fertigation as the primary supply and substrate as a top-up, which
inverts the operational meaning. The leviers card answers *"what's
still missing after both passive and active supply have been applied?"*
— that's what `gapAfterFert` represents.

---

## Inherited specs

- **REQ-005** (`requirements.md`) — URL hash routing for the crop
  sub-toggle (`#admin/nutriment/nursery`).
- **REQ-001** (`requirements.md`) — French CE in user-facing text.
- **REQ-060** (`nutrition/spec.md`) — narrative copy must not contradict
  current data; auto-derive or annotate `// stable —`.
- **REQ-136** (`nutrition/spec.md`) — every contribution channel
  function returns `details{el: {cert, cap}}` alongside its flat mg
  map. `SubstrateContributionNursery` and `FertigationNursery` MUST
  conform when REQ-136 is wired.
- **REQ-137** (`nutrition/spec.md`) — recipe header + 5-col gap-grid
  layout (Block 2 + Block 3 use this, per REQ-127 / REQ-128 above).
  REQ-127 / REQ-128 are crop-specific extensions of REQ-137.
- **REQ-138** (`nutrition/spec.md`) — Apport ici cells clickable for
  cert modal; cap emojis (🔥💧❗) clickable for cap-reason modal.
  Modal is scoped per (block, element, click target) — never aggregates
  across elements or blocks. Implementation pending; deferred until
  REQ-136 lands so the `details.cap` map is populated.
