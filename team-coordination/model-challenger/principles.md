# Principles — model-challenger

Distilled from Guillaume's decisions as the challenger persona has interacted with him (approve / reject / defer calls in `drafts.md`, plus inline pushback). Read on load. Append when a decision reveals a **transferable** principle (something that will guide a future similar call, not a one-off fact). Keep terse: one line, two max. Most recent at the top.

When the list exceeds 30 entries, consolidate: merge overlapping, retire principles superseded by newer ones, prune anything already captured better by CLAUDE.md / memory / persona file.

## Format

`- P-NN — [principle]. *Because:* [why]. (YYYY-MM-DD)`

A principle is transferable if it applies to **more than the case that revealed it**. If it's only about this one critique or this one REQ, it's not a principle — it's project state.

## Principles

- P-02 — When a model amendment changes the reference frame (e.g. dropping a credit term, changing what a channel "means"), don't pin the model output to the legacy calibration to preserve agreement with the prior anchor (agronomist, vendor, extension). Surface the model output as the live recommendation; frame the disagreement with the legacy anchor honestly. Diplomatic shorthand like "field correction" or "agronomist adjustment" hides category mismatches when the gap is actually the retired term reasserting itself. *Because:* Guillaume's call on the REQ-098 amendment — "keep the policy direction and forget about pleasing the agronomist." The compost-as-soil-bank reframe is policy; PA Taillon's 1 379 g Mg recommendation calibrated against the old reference frame is legacy. Pinning FP_RECIPE_T5 to PA's number while changing the model's meaning is a category collapse. *How to apply:* on any amendment that retires a term in a supply / demand / mass-balance formula, audit downstream pinned anchors (stored recipes, FP recipes, hand-locked constants). If they were calibrated against the retired version, recommend re-derivation from the new model rather than holding the legacy value. PA Taillon's *contested-call override* (per [[reference_pa_taillon.md]]) still stands on field-evidence questions — but is NOT a mandate to bend the model to his prior numerics. (2026-05-13)
- P-01 — Total effective dose across active-delivery channels (frontload + sidedress + fertigation + foliar) must never exceed hydroponic supply level for that element. Soil bank and compost contribution are NOT counted into this sum — they're background context, not channels subject to the cap. *Because:* hydroponics defines the upper bound on what a tomato/lettuce plant can usefully take up; once active delivery alone equals or exceeds it, additional supply is over-fert regardless of what soil + compost contribute. This is the operative luxury cap for cert-defense and complexity critiques on every channel's supply formula. *How to apply:* when reviewing a supply-formula change, sum (frontload + sidedress + fertigation + foliar) at the target stage per element; compare to hydroponic-target supply (Sonneveld / similar); flag if Σ_active > hydroponic regardless of luxury_factor or REQ-014 head-room. (2026-05-13)
