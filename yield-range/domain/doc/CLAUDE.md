# yield-range/doc — observations index

Empirical observations behind the `yield-range/` math model.

**`data-points.md` is the register.** Every measured number lives there, once,
with the context needed to read it and nothing else. Other files in this
directory hold provenance and captioned media — they point at the register and
must not restate its numbers.

**Day axis everywhere: days from sowing, day 1 = the sowing day.** The model runs
on the same axis, so no conversion is needed.

---

### `data-points.md`
The register. Nursery cohorts A–D (Salanova 50-cell): 2026 spring weights and its
second cohort, the 2026-07 drought+heat **biggest-plant** 5 g, and the 2026-07
**representative-plant** series 0.5 / 1.4 / 9.2 g with the only measured light
reading at Décembre (12 226 J/cm² over 7 days, pyranometer). Plus canopy
coverage, the 180 g field head, and the spring nursery leachate figures.

**Reach for:**
- Any Décembre number. Start here; this is the only place a weight or a light
  reading is recorded.
- Checking a cohort's basis before comparing it to the model — biggest vs
  representative, shoot-only vs whole plant, measured vs assumed DLI. Cohorts C
  and D differ on exactly this.
- The ⚠ list of problems in the data itself: two date-arithmetic errors, missing
  sowing dates, unrecorded plant-selection basis and cell occupancy.

Interpretation is deliberately absent. For model comparison, the shape gap, and
the per-cell energy balance see `../derivation.md` § carbon-balance-growth.

---

### `yield-range-calibration-2026-spring.md`
Provenance for the **retired logistic fit** — `RGR_MAX_LETTUCE_NURSERY`,
`RootCap`, spacing floors, `DLI_BENCH_AVG = 27.5` (literature, cert 2). None of it
live: the engine has been carbon-balance Beer–Lambert since. Also carries the
operator quotes behind the tomato-zone heat hypothesis and the list of model
behaviours no data supports yet.

**Reach for:**
- Why a pre-2026-07 constant has the value it does, before assuming it was fitted
  to something current.
- The tomato-zone heat hypothesis in the operators' own words.
- What is still unanchored: cooler-zone recovery, spread-tray uplift, 32-cell
  behaviour, variety differences.

Carries no weights — see `data-points.md`.

---

### `seedling-canopy-closure-2026-07-04/`
Two photos, Salanova 50-cell, 2026-07-04: bench overview (a "day-21" tray beside
"day-10" trays), and a top-down of the "day-10" trays showing bare substrate
between 2–4-leaf seedlings.

**Reach for:**
- Any argument about how fast a 50-cell canopy closes — this is coverage
  evidence, not grams.
- Cross-checking the open-canopy rate at the early nursery. See
  `../learnings/day10-open-canopy-refutes-rm-030.md`.

The day labels predate the sowing-axis convention; basis unrecorded. Coverage
figure is in `data-points.md`.

---

### `nursery-32pot-wednesday2-2026-07-22/`
Two photos, Wednesday 2026-07-22 19:28 (EXIF), Salanova on the **32-pot 2.5 in
tray**: three trays on the outdoor bench, and a top-down of one tray showing
single 2–4-leaf seedlings with wide bare substrate between pots. Bench label
"wednesday-2" = second Wednesday after sowing.

**Reach for:**
- Anything about the **current** nursery default — this is the first cohort on
  the 32-pot 2.5 in tray / 50 g target adopted 2026-07-19. Every earlier cohort
  is 50-cell and not comparable on cell volume.
- Early canopy coverage at 32-pot spacing — far more open than the 50-cell
  photos at a similar age.

No weight taken; photographic only. **Sown 2026-07-06 → day 17** — the only
cohort with a reported sowing date. See `data-points.md` § Cohort E, including
why a `wednesday-N` label must not be used to back-derive a sowing date.

---

### `nursery-wednesday3-4-50cell-2026-07-22/`
Three photos, 2026-07-22 19:28 (EXIF), Salanova at transplant-ready size: two
top-downs of a canopy closed right over the tray with leaves past its edge, and
a side view along the tray front. Covers **two** trays — bench labels
"wednesday-3" and "wednesday-4" (sown 2026-06-29 and 2026-06-22) — which look
identical at this age. Same walk-around as `nursery-32pot-wednesday2-2026-07-22/`.

**Reach for:**
- What a **transplant-ready** nursery tray looks like — the closed-canopy end of
  the nursery, opposite the open-substrate wednesday-2 photos.
- The 50-cell arm of the tray-type comparison, against Cohort E's 32-pot tray at
  the same photo date.

⚠ Not attributable per tray — both cohorts appear across the set. Tray type is
**as reported (50-cell), not as read off the photo**; the vessels resemble
Cohort E's square pots, so don't identify tray type from these images. No
weights. See `data-points.md` § Cohorts F and G.

---

### `field-cut-yield-2026-07-26/`
Two photos, 2026-07-26, one 4-row mixed-Salanova bed (green + red leaf): before
the cut with the canopy closed over the bed, and after, showing cut stubs plus
the crate of harvested leaves.

**Reach for:**
- Any argument about **yield per bed length** — this is the only such
  measurement; `headsPerBed` × head weight has no other check against it.
- Cut-and-come-again evidence: what a bed looks like immediately after a cut,
  and how much stub is left standing.

It is a **cut** yield, not whole heads — do not compare it to the 180 g head.
Loss and quality are a field read; nursery duration is a recollection, not a
logged date. Weight is in `data-points.md`.

---

### `field-head-180g-aphids-2026-07-09.jpeg`
Scale photo: one mature green-leaf/butterhead head, 180 g on the CAS scale, off a
light-supplemented bed under heavy aphid pressure.

**Reach for:**
- Sanity-checking `fieldCapG` / `harvestWeightG` at the mature end — the only
  field-harvest weight recorded; everything else is a nursery seedling.

Stressed, and time-in-bed is estimated rather than logged → a lower-ish bound.
Weight is in `data-points.md`.

---

## Conventions

- `data-points.md` holds data + reading context. Everything else points to it.
- Entries here: filename, one-line what/who/when, **reach for** list, caveats.
- Never restate a number from the register. If two files disagree, the register wins.
