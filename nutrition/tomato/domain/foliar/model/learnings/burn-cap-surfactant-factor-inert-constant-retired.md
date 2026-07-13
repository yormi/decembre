# `BURN_CAP_SURFACTANT_FACTOR` inert constant — retired

## `BURN_CAP_SURFACTANT_FACTOR` inert constant — retired 2026-05-12

Brief intermediate state (2026-05-10 → 2026-05-12): replaced the multiplier table with `BURN_CAP_SURFACTANT_FACTOR = 1.0` as a "single operator-tunable knob" reserved for future bump. Retired 2026-05-12 — constant pinned at 1.0 is inert; surface area (constant + composer + namespace + 3 docs) signalled "this is a real knob" which it wasn't. Collapsed to direct `BURN_CAP_BASE_G[el]` return; deferred-bump TODO lives directly on `BURN_CAP_BASE_G` in `data.js`.
