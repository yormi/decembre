# Subgoal 2 — Nitrogen to vigour sufficiency

Parent: `goal.md`. Problem: `problem.md`. Rank 2 of 3; weeks
clock, starts now.

## Target state

| KPI | Now | Target | Measure | Horizon |
|---|---|---|---|---|
| tissue N | 2.27 % | 4–4.5 % (3.1 % = exit-crisis milestone only) | tissue | weeks |

## Why

Thin new growth. N is **both** supply-tight *and*
uptake-impaired — a feed-side ramp helps but under-delivers
until roots recover (P/pH, SG1). A fresh SME closes the
supply-vs-uptake gap.

## Two N channels — CE binds only one of them

Not all N rides the same impaired pathway:

| | Nitrate-pathway N | Ocean amino-N |
|---|---|---|
| Source | mineralized feather meal + soil nitrate | fish-hydrolysate amino acids/peptides |
| Transporter | NRT pump | AAT/LHT (separate family) |
| Reduction step | yes (nitrate reductase) | **none** — used intact |
| CE cost | full (mineral salt) | low + transient (zwitterion; soil-bound/consumed) |
| Bound by the impaired nitrate pump? | yes | **no** |

- **Nitrate pool** is capped by root uptake rate (roots impaired
  by P/pH — SG1). Past the cap it accumulates as solution salt →
  direct-pen CE toward the ~3.0 guardrail (now 2.6, headroom ≈
  0.4 mS/cm). So the **granular ramp** is CE-capped, not sized to
  the tissue deficit.
- **Ocean amino-N rides a parallel channel** that skips the
  nitrate pump *and* the reduction step; the intact-uptake
  fraction never becomes solution salt. So CE does **not** cap
  Ocean the way it caps granular — Ocean can be pushed harder
  than pure CE accounting suggests.

What still bounds Ocean (so we don't over-credit it):
- **Root surface area** — fewer roots = fewer of every
  transporter, AAT included. Amino-N escapes the pump bottleneck,
  not low root mass. (The +21 % root-DW growth effect is the
  durable half of the win.)
- **Microbial clawback** — warm biologically-active soil
  mineralizes a fraction of drenched amino acids to NH₄/NO₃
  within days; that fraction reverts to the nitrate pathway +
  full CE cost. cert 2 — intact-uptake fraction in our field
  soil is uncertain (the +21 % trials were peat substrate, less
  microbial competition).

## Actions

### Lead — Ocean fish hydrolysate, DRENCHED (bypasses the nitrate cap)
- Lever: EZ-GRO Ocean 15-1-1 fish protein hydrolysate, **root
  drench / fertigation** (not foliar).
- Why lead, not adjunct: two edges feather meal lacks — (1)
  amino-N on a **parallel uptake channel** (AAT/LHT) that skips
  the impaired nitrate pump + reduction step and barely touches
  CE; (2) **grows root** (+21 % DW) → more absorptive surface for
  *all* uptake. So Ocean delivers usable N the impaired root
  can't pull from nitrate, AND grows the root. Rating 5/5, cert 3
  (peat-trial transfer). Full mechanism: `../tomato/learnings/0002-interim-root-uptake-levers-during-ph-wait.md`.
- **Why it grows root — NOT the 1 % P₂O₅** (trivial vs the
  0.23 % tissue deficit + locked soil-P pool). The driver is the
  **peptides/amino acids acting as signals, not food**: fish-
  hydrolysate short peptides carry **auxin-/gibberellin-like
  activity** → switch on lateral-root + root-hair pathways.
  Secondary: pre-reduced N saves the carbon/energy of nitrate
  reduction → freed carbon goes to root. cert 3.
- **Rate is bound by how much amino-N the root absorbs before
  microbes claw it back** (Guillaume, 2026-05-31). The drenched
  amino acids face a race: root uptake (want) vs soil microbes
  mineralizing to nitrate (a few days, warm soil). Win → amino
  channel; lose → reverts to the CE-bound nitrate pool. Frequent
  **small** drenches keep each dose inside the window. **The
  absorbable amount isn't fixed — it scales with current root
  mass** (low now, grows on the programme → ceiling rises,
  self-reinforcing). Start conservative, expect to scale up.
- Gauge intact-uptake by **tissue/sap N rising with direct-pen
  CE staying flat** (flat CE + climbing N = amino channel working;
  CE climbing = surplus reverting to nitrate, back off the rate).
- Cert: allowed, on hand + in use.
- **Operator protocol** (dose, stock-solution, cadence, gauge for
  the 4-can/48-L-per-side setup): `protocol/ocean-root-drench.md`.

### Baseline — feather-meal sidedress (CE-gentle N floor)
- Lever: FarinePlumes granular. Role = slow-release N drip over
  6–8 wk covering steady offtake **without** spiking solution CE
  — banks reserve in granule form. T5 maintenance floor ≈
  2 950 mg N/m²/wk (offtake − compost; `../tomato/sidedress-recipe/model/derivation.md`).
- Trim only if the Ocean + granular stack pushes CE up; dose
  change is operator `/retire-recipe`, STORED, not prescribed here.
- Cert: feather meal allowed.

## Monitoring
- Tissue N (quarterly anchor).
- Petiole-sap NO₃-N (Horiba) — cheap, fast gauge between tissue
  panels (per `goal.md`).
- Direct-pen CE before/after each drench — the operating gauge:
  flat CE as sap/tissue N climbs = amino channel; rising CE =
  back off the drench rate.

## Open questions
- Fresh SME to split N supply-tight vs uptake-impaired (ordered).
- Empirical CE-bump per Ocean drench (sets the safe per-drench
  volume) — resolves on first titration, no lab needed.
