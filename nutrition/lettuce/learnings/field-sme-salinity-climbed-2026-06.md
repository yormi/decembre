# Field SME salinity climbed April→June 2026 — salt now over the soil-pH sulphur guardrail

**Date:** 2026-06-20

**Status:** accepted (single mid-season SME; first field salt reading since April)

First mid-season field SME on the lettuce beds (Berger 39580, sample 605536 "laitue 15 juin", completed 2026-06-19) vs the April baseline every other doc anchors on. Same lab, same SME method — apples to apples.

| Metric | April SME | June SME | Note |
|---|---|---|---|
| CE (mmhos/cm = dS/m) | 1.08 (596616) | **4.01** | domain *scorch* band; over SME spec max 3.5 |
| SME pH | 7.48 (596617) | **6.68** | dropped 0.8 |
| Sodium (ppm) | 40.2 | **124** | salt built up |
| Nitrate N-NO₃ (ppm) | — | **388** | 2× over spec max 180 |
| Sulfate (ppm) | — | 417 | acidifying load |

Also flagged: Ca 471, Mg 137.6 over spec; K 104 mid-band; P 1.7, Fe 0.14 below (do not act on these — SME bands are soilless; M3 + tissue lead absolute sufficiency).


## Reading

Salt **accumulated over the season** — the "CE creep → Na" the diagnosis predicted (`../strategy/problem.md`), confirmed now in the soil solution, not just tissue-inferred (tissue `LAIT #1` Na 3166). The bed also self-acidified (sulfate + fish-N nitrification both produce acidity) — SME pH fell 0.8.


## Consequences

- **Salt thesis is solution-confirmed.** The salt-cut fertigation recipe (`../strategy/fertigation-recipe.md`) was tissue-led; the field SME now independently backs it. CE 4.01 sits in the domain outer-margin *scorch* row (Ψ_soil ≈ −154 kPa) — root-zone salinity is an active constraint, not a forecast.

- **The salt is saline, not sodic — leach it; keep the sulphur program.** RAS 1.29 (low), sulfate 417, nitrate 388: the high CE is mostly leachable neutral salts (CaSO₄ from the sulphur reaction + mineralization nitrate), not sodium accumulation. So the answer is the drainage half of the program, not a stop. **Decision (Guillaume, 2026-06-20): keep the sulphur program; add a leaching protocol** (`../strategy/protocol/salt-leach.md`) — leach under the ECe ≤ 1.3 guardrail before each pass, so the gypsum-EC pulse lands on a bed within band. Sulphur titrates carbonate (source half); leaching removes the resulting salts (drainage half).

- **Supersedes the April "salinity cleared" verdict** for the current crop (`../soil-ph/model/learnings/stuck-browning-roots-ph-indicated-salinity-cleared.md` — that read was sample-dated to CE 1.08).


## Caveats

- SME paste pH runs below Mehlich/1:1 water pH (method offset ~0.3–0.8). 6.68 is a **secondary-guardrail point, not a new anchor** — the soil-pH model still anchors correction on Mehlich water pH. The calcareous/Ca-saturated picture (Ca 471) is unchanged; the pH program continues — leaching manages the salt it produces, it does not replace it.

- Single sample, single date; the report notes the sample bag was unlabelled ("sac non identifié") — minor provenance wobble.


## Considered

| Option | Result |
|---|---|
| Read 6.68 as the new pH anchor → ease the sulphur target | **Rejected** — one SME pH point; model anchors on Mehlich water pH; Ca-saturation unchanged. |
| Treat CE 4.01 as noise vs April 1.08 | **Rejected** — same lab/method, matches tissue Na + the predicted seasonal creep. |
| Pause the sulphur program (salt over guardrail) | **Rejected** (Guillaume) — salt is leachable sulfate/nitrate, RAS 1.29; keep dosing, leach to satisfy the guardrail. |
| Keep sulphur + add a leaching protocol | **Picked** — source half (S titrates carbonate) + drainage half (leach the salts). |
