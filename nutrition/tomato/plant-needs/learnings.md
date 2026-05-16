# Tomate — plant-needs · learnings

Rejected alternatives, deferred refinements, methodology notes that no
longer drive a live REQ. Append-only; don't rewrite history.

---

## Unit convention — single explicit unit per element (deferred)

`TOMATO_FRUIT_EXPORT[el].g` carries `g/kg fruit` for macros and
`mg/kg fruit` for micros; the `unit` field per entry marks which. The
`× 1000` in `calcNutrDemand` works for both only because micro values
are pre-stored in `g`-equivalent (e.g. Fe `g: 0.010` = 10 mg/kg). Brittle.
Refining to a single explicit unit per element is a candidate cleanup;
not done because the inline `unit` field documents the contract.

---

## Invalid-stage handling — silent fallback (current behaviour, may revisit)

`BIOMASS_DEMAND[undefined | 'T0' | 'T6']` returns `undefined`; `bio = … || {}`
collapses demand to fruit-export only. Acceptable today (T6 retired
2026-05-07). Throwing or returning a sentinel was considered; deferred
until a real consumer trips over the silent fallback.

---

## No N storage carry-over (deferred)

Model is per-week, no cross-week N pool. Compost residual + sidedress
mineralization smooths weekly variance in practice. A soil-N inventory
state would be needed if retained N becomes a meaningful driver — deferred
until tissue-test or yield data flags it.

---

## Bottom-up T1-T3 vs top-down T4-T5 — methodology mismatch

T1-T3 derive from Haifa F-144 (kg/ha/day tables, ~20 % QC winter
discount). T4-T5 anchor top-down off `TOMATO_REMOVAL` at 1.5 kg/m²/wk
minus fruit export. The two approaches can drift if Haifa is updated
without re-checking the T5 anchor or vice versa. Spot-check at boundary
transitions when retuning either table.

---

## v1 demand model — transpiration coupling bug

Pre-REQ-081 (applied 2026-05-09), the biomass term for every element was
multiplied by `transpFactor`. This over-scaled phloem-mobile N/P/K and
active-transport micros, which don't track instantaneous transpiration
over weekly windows. Single biggest design bug in v1.
