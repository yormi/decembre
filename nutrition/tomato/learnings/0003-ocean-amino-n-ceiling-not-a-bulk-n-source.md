# Ocean amino-N is a signal, not a bulk-N source — the ceiling model

**Date:** 2026-06-06
**Status:** accepted — model + rejected scaling options

Can we push EZ-GRO Ocean (fish hydrolysate) hard enough to fix the
low tissue N (2.27% vs 3.10 floor) by the amino-uptake bypass,
instead of waiting on root recovery? Worked the bottleneck from
first principles. **No** — amino-N can't carry bulk tissue N at
any feasible dose. Extends [[0002-interim-root-uptake-levers-during-ph-wait]]
(Ocean rating 5 is the *root-growth signal*, not N delivery).
Cross-ref [[supply-vs-uptake-cation-test-rules-out-antagonism]],
`../../strategy/sg2-nitrogen.md`.

## The N gap (demand, root-independent)

T5 mass balance (`../sidedress-recipe/model/derivation.md`):
offtake (fruit export 1620 + biomass 2430 = 4050 mg N/m²/wk)
− compost 1100 = **gap 2.95 g N/m²/wk**. Fruit exports N whether
roots work or not → the gap doesn't change with root health; only
*delivery capacity* does.

## The cascade — drench → tissue

`tissue gain = drench × deliver(0.8) × α × assimilate(1.0)`, where
**α = race-win fraction** = the share taken up intact *before soil
microbes mineralize it to nitrate*. AAT/LHT transporter Vmax is
NOT in the chain (it's large; not the limit).

- α ≈ 0.15 in warm mineral soil (cert 2 — the +21% trials were
  peat, low microbial competition).
- Losers of the race (1−α ≈ 85%) → nitrate → the **jammed pump**
  (P-lockout) → mostly CE, no tissue gain.

## The arithmetic that kills it

- Current signal dose (15 g/day) = 11.6 g N/wk = **1% of the gap**;
  intact (×α) = **0.15% of gap**.
- Amino is structurally a **10–20% channel of total plant N — by
  biology, sick OR healthy.** Even with healthy roots the ceiling
  is ~¼ of the gap. Never the bulk route.
- To *match* the gap via amino: drench ≈ gap/α ≈ 20 g N/m²/wk ≈
  **~660× current.** To *saturate* the (depressed) root-surface
  ceiling U_max: **~67×.** Both infeasible.
- Robust to α: even α=0.5, 10× dose = ~5% of gap. The killer is
  starting at 1% of the gap — feasible scaling can't cover 100×.

## Why you can't even reach 67× — the constraint ladder

Operational/chemical limits bind far below the biological ceiling
(lowest wins):

| Constraint | Binds ~ | Mechanism |
|---|---|---|
| Biofilm / clogging | **~10×** | dissolved organic C feeds in-line bacteria; daily flush overwhelmed. A particulate **filter does NOT help** — biofilm grows downstream of it. |
| Solubility / volume | ~10–20× | can't dissolve the mass; particulates |
| CE from clawback | ~20–30× | (1−α)·dose becomes nitrate on an already-breached rail |
| Rhizosphere O₂ / osmotic | sustained high | labile-C slug → microbial bloom respires O₂ → root-zone hypoxia |
| U_max (amino saturation) | ~67× | never reached |

Fractionation (many small pulses / continuous low-conc injection)
relaxes clog + O₂ **and raises α** (roots win the race) — so the
real lever is the **concentration-time profile, not total mass**.
But the payoff stays small.

## "Some growers do all their N with fish" — resolved

Not a contradiction. They run fish as a **bulk organic-N
fertilizer** (~130× the biostim dose), relying on **microbial
mineralization → nitrate → healthy-root nitrate uptake** — NOT the
amino bypass. The "clawback to nitrate" I'd called *waste* **is
their delivery route**; it's only waste *for us* because our
nitrate pump is jammed. They manage clogging (continuous injection
+ peroxide/acid line upkeep) and cost (premium markets / bulk
pricing).

## What changes with healthy roots (the actual fix)

The nitrate pump opening is the master switch:

- Solution nitrate (already 174.7 ppm, abundant) gets **absorbed**
  → tissue N rises on the *same* feed.
- CE stops being a trap: roots draw nitrate down → the N feed is
  capped by **demand, not the CE rail**.
- K + Ca (same uptake-limit) release too → BER + disease
  resilience ease. One fix, three subgoals.
- **At that point fish-bulk-N ≡ feather-meal-bulk-N** (same
  mineralize→nitrate route); fish is just the pricier liquid. So
  even healthy, no reason to run Ocean for N.

## Conclusion / decision

- **Keep Ocean at the signal dose (~15 g/day; a few× max if
  cheap/harmless).** Do NOT scale it for tissue N — the model says
  it can't deliver.
- **Tissue N, CE-rail relief, and K/Ca all ride root recovery
  (SG1: pH→P→roots).** "More tissue N" is a *root* question, not
  an N-channel question — there is no N program that beats fixing
  the root, because the root is what's broken.
- Bulk N backbone stays feather meal (→nitrate, cheap), useful the
  moment the pump reopens.
</content>
