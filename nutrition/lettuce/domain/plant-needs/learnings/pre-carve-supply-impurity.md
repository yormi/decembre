# Pre-carve supply impurity — `weeklyMassFlowL()`, `LETTUCE`, `PRODUCT_PCT`, `SIDEDRESS_MINIMUM_EFFICIENCY`

`calculateLettuceNutritionSupply` originally pulled four globals directly:
`weeklyMassFlowL()` (called a function reading DOM/global state),
`SME_LETTUCE_PPM` (top-level const), `LETTUCE` (recipe consts), `PRODUCT_PCT`
(analysis fractions), `SIDEDRESS_MINIMUM_EFFICIENCY.FarinePlumes_N`.

Carve-out 2026-05-16 introduced a `dependencies` parameter bag so the
function reads no globals (per `feedback_pure_code.md` + `feedback_model_srp.md`).
Callers now resolve those dependencies at the integrator boundary and pass
them in. Keeps the model testable with a sandboxed `window`.

`SME_LETTUCE_PPM` is the exception: it moves into `data.js` alongside
the other lettuce constants since it's owned by the lettuce plant-needs
subproject (Berger lettuce-bed SME, not a cross-domain dependency).
