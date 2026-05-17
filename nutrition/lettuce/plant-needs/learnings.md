# Salanova — plant-needs · learnings

Rejected alternatives, deferred refinements, methodology notes that no
longer drive a live REQ. Append-only; don't rewrite history.

---

## Stage-based modelling (T1-T5 mirror of tomato) — rejected

Considered when the lettuce subpage was first scoped (pre-2026-05-08).
Idea: mirror the tomato `BIOMASS_DEMAND[stage]` shape so Salanova would
expose `T1` (germination), `T2` (rosette), `T3` (head fill), `T4` (mature),
matching the operator UX of the tomato Bilan.

Rejected because:
- Lettuce post-transplant has no morphological discontinuity equivalent to
  tomato flowering / fruit-set. The growth curve is monotonic mass
  accumulation; binning it into 4 stages adds 3 transition rules that the
  data doesn't support.
- The 14-day post-transplant cycle is too short to operate per-stage
  reliably — a stage-aware operator decision (e.g. "reduce K at T3") would
  fire mid-week with no time to react.
- Hochmuth + Sonneveld tissue norms are cycle-averaged, not stage-resolved.
  Cert would stay at 1-2 across all bins.

Continuous post-transplant model (mass-gain × DM × tissue-concentration)
ships instead. Documented for the inevitable re-discovery in 2026-2027.

---

## Pre-carve supply impurity — `weeklyMassFlowL()`, `LETTUCE`, `PRODUCT_PCT`, `SIDEDRESS_MINIMUM_EFFICIENCY`

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

---

## Supply belongs in plant-needs? — accepted with watch

Strict mirror of `nutrition/tomato/plant-needs/` would keep plant-needs to
the demand side only and split supply into a sibling subproject (e.g.
`nutrition/lettuce/fertigation-recipe/` or `nutrition/lettuce/supply/`).

Carve-out 2026-05-16 shipped supply inside plant-needs per the F1 challenger
request's explicit action list. Reasonable today because:
- Lettuce supply is a single function (vs tomato's multi-channel recipe
  cascade across 3+ subprojects).
- The function is pure with all dependencies injected — moving it sideways
  later is a file-shuffle, not a re-design.

Watch: if lettuce gains a foliar program (yucca-return triggers a foliar
spray) or the supply function grows mode-dispatch logic, split into
`nutrition/lettuce/fertigation-recipe/` mirroring the tomato shape.

---

## Front-load mineralization window — 4 weeks (conservative)

Considered 6 weeks (literature mid-range for organic N in 15-20 °C soil).
Picked 4 weeks because:
- Conservative on weekly supply → over-estimates the rate → under-estimates
  the residual gap → operator sees the real shortfall sooner.
- Décembre's soil temp ranges 12-18 °C in lettuce season; the literature's
  warm-soil 6-week assumption doesn't hold.

Bump to 5-6 weeks if a cold-soil tissue-test panel shows N tracking
under-fed when the model says front-load is covering.

---

## Canopy factor floor 0.2 — not zero

The clamp lower bound on `canopyFactor` is 0.2, not 0. Rationale: a stunted
seedling still transpires (root pressure + osmotic flow); the soil mass-flow
channel never goes fully dry while the plant is alive. 0.2 chosen as a
defensible minimum, refine if measured stunted-plant transpiration data
contradicts.

---

## Bottom-up T1-T3 vs top-down T4-T5 — not applicable here

Tomato's methodology mismatch (Haifa-driven bottom-up early stages,
TOMATO_REMOVAL-driven top-down late stages) does not arise in lettuce
because there are no stages. Documented here only so the cross-crop
reader doesn't expect a parallel discussion.
