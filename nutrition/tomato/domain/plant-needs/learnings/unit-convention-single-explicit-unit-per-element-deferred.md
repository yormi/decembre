# Unit convention — single explicit unit per element (deferred)

`TOMATO_FRUIT_EXPORT[el].g` carries `g/kg fruit` for macros and
`mg/kg fruit` for micros; the `unit` field per entry marks which. The
`× 1000` in `calcNutrDemand` works for both only because micro values
are pre-stored in `g`-equivalent (e.g. Fe `g: 0.010` = 10 mg/kg). Brittle.
Refining to a single explicit unit per element is a candidate cleanup;
not done because the inline `unit` field documents the contract.
