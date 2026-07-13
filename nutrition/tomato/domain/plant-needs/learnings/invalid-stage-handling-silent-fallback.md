# Invalid-stage handling — silent fallback (current behaviour, may revisit)

`BIOMASS_DEMAND[undefined | 'T0' | 'T6']` returns `undefined`; `bio = … || {}`
collapses demand to fruit-export only. Acceptable today (T6 retired
2026-05-07). Throwing or returning a sentinel was considered; deferred
until a real consumer trips over the silent fallback.
