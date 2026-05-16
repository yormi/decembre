# yield-range/doc — calibration datasets index

Empirical observations anchoring the `yield-range/` math model.

---

### `yield-range-calibration-2026-spring.md`
Salanova nursery cohort, 2026 spring — Tray 50 test 1, packed end-to-end in tomato zone. Cohort weights by Jordane (d21=4 g, d28=16 g, d35=10 g, d35=12 g) + notes: yellowing, mold, bolting at d35, heat-hypothesis quote ("trop chaud dans la serre pour faire des semis de laitue").

**Reach for:**
- Calibrating/sanity-checking the yield-range model (50-cell packed canopy cap, currently 25 g/plant under "best conditions"; Décembre's observed 16 g came from heat-stressed conditions → model expects modest uplift).
- Justifying / revising `CANOPY_CAP_BY_PLATEAU` in `yield-range/data.js`.
- Back-testing refits against real cohort data.

Data collected in tomato zone (T_day ~24 °C), sub-optimal for lettuce. Spec assumes "best non-light conditions" — observed values are the lower bound.

---

## Conventions

Each entry: filename, one-line "what + who/when", then **reach for** list. Don't transcribe the doc — read the source when you need the data.
