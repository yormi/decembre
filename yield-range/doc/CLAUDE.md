# yield-range/doc — calibration datasets index

Empirical observations that anchor the `yield-range/` math model. Co-located with the model that consumes them rather than with the crop subproject — when the model is re-fit or sanity-checked, this is the first place to look.

---

### `yield-range-calibration-2026-spring.md`
Salanova nursery cohort observations from the 2026 spring batch — Tray 50 test 1, packed end-to-end in the tomato zone. Four cohort weights logged by Jordane (d21=4 g, d28=16 g, d35=10 g, d35=12 g) plus operator notes: yellowing, mold, bolting at d35, and the heat-hypothesis quote ("trop chaud dans la serre pour faire des semis de laitue").

Reach for this when:
- Calibrating or sanity-checking the yield-range model (anchor for the 50-cell packed canopy cap, currently set to 25 g/plant under "best conditions" framing — Décembre's observed 16 g came from heat-stressed conditions, so the model expects a modest uplift).
- Justifying or revising `CANOPY_CAP_BY_PLATEAU` constants in `yield-range/data.js`.
- Back-testing any model refit against real cohort data.

Note: data was collected in the tomato zone (T_day ~24 °C), which is sub-optimal for lettuce. The current spec assumes "best non-light conditions" — observed values represent the lower bound of what the model should predict.

---

## Conventions

Each entry: filename, one-line "what it is + who/when", then a **reach-for-this-when** list. Do not transcribe the doc itself — read the source when you need the data.
