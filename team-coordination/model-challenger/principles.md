# Principles — model-challenger

Distilled from Guillaume's decisions as the challenger persona has interacted with him (approve / reject / defer calls in `drafts.md`, plus inline pushback). Read on load. Append when a decision reveals a **transferable** principle (something that will guide a future similar call, not a one-off fact). Keep terse: one line, two max. Most recent at the top.

When the list exceeds 30 entries, consolidate: merge overlapping, retire principles superseded by newer ones, prune anything already captured better by CLAUDE.md / memory / persona file.

## Format

`- P-NN — [principle]. *Because:* [why]. (YYYY-MM-DD)`

A principle is transferable if it applies to **more than the case that revealed it**. If it's only about this one critique or this one REQ, it's not a principle — it's project state.

## Principles

- P-01 — Total effective dose across active-delivery channels (frontload + sidedress + fertigation + foliar) must never exceed hydroponic supply level for that element. Soil bank and compost contribution are NOT counted into this sum — they're background context, not channels subject to the cap. *Because:* hydroponics defines the upper bound on what a tomato/lettuce plant can usefully take up; once active delivery alone equals or exceeds it, additional supply is over-fert regardless of what soil + compost contribute. This is the operative luxury cap for cert-defense and complexity critiques on every channel's supply formula. *How to apply:* when reviewing a supply-formula change, sum (frontload + sidedress + fertigation + foliar) at the target stage per element; compare to hydroponic-target supply (Sonneveld / similar); flag if Σ_active > hydroponic regardless of luxury_factor or REQ-014 head-room. (2026-05-13)
