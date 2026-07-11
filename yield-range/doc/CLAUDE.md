# yield-range/doc — calibration datasets index

Empirical observations anchoring the `yield-range/` math model.

---

### `yield-range-calibration-2026-spring.md`
Two Salanova 50-cell nursery batches. **2026 spring** (Tray 50 test 1, packed, tomato zone): Jordane weights d21=4 g, d28=16 g, d35=10/12 g + yellowing/mold/bolting — now retired as an anchor (salt-stalled). **2026-07 drought+heat**: operator-weighed **5 g biggest @ d25**, DLI 17 — the **live primary weight anchor** for the 50-cell nursery.

**Reach for:**
- Anchoring / sanity-checking the yield-range nursery weight scale — 5 g @ d25 is the stress-reduced anchor (drought+heat); reproduced at DLI 17 by stressed ε ≈0.85 × plug DM 0.07 (see derivation `carbon-balance-growth`).
- Back-testing refits against real cohort data; the clean-condition ε is still unanchored (no well-watered 50-cell weighed).

Both batches are stressed (tomato-zone heat; drought). Clean-condition weight would run larger. See `yield-range/learnings/5g-day25-drought-heat-primary-anchor.md`.

---

### `seedling-canopy-closure-2026-07-04/`
Salanova 50-cell nursery, 2026-07-04, two photos: (1) bench overview — day-21 tray (left) beside day-10 trays (right); (2) top-down of the day-10 50-cell trays, canopy ~25% covered, bare substrate between 2–4-leaf seedlings. Same stressed cohort as the 2026-spring calibration.

**Reach for:**
- Pinning the seedling exponential rate `SEEDLING_RGR` in `yield-range/seedling-thinning.js` — day-10 open canopy → closure after day 10 → Rm≈0.20; refutes Rm=0.30 (which predicts day-8 closure).
- Any argument about how fast a 50-cell canopy closes (observed ~day 15–17 here, stressed).

Reads *canopy coverage*, not grams — resolution/angle limit precision. Stressed trays (bad soil); clean would close marginally sooner. See `yield-range/learnings/day10-open-canopy-refutes-rm-030.md`.

---

### `field-head-180g-aphids-2026-07-09.jpeg`
Single scale photo, 2026-07-09: one large green-leaf/butterhead head off a light-supplemented bed, **180 g** fresh weight on the CAS scale. Guillaume estimate **~6 weeks in the bed**; heavy aphid pressure on that bed. First mature field-harvest weight anchor (all prior anchors are nursery seedlings).

**Reach for:**
- Sanity-checking `fieldCapG` / `harvestWeightG` at the mature end — a real head lands ~180 g under supplemental light at ~6 wk field time (stressed by aphids).
- Any argument about final harvest weight vs the model's field-phase output. Caveat: **stressed** (aphid load) and field days are **estimated**, not logged from a transplant date → treat as a lower-ish bound, not a clean cap anchor.

---

## Conventions

Each entry: filename, one-line "what + who/when", then **reach for** list. Don't transcribe the doc — read the source when you need the data.
