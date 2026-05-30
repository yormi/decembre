# Stage-based modelling (T1-T5 mirror of tomato) — rejected

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
