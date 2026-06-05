# Goal — tomato yield-recovery subgoals

Level under "tomato yield > lettuce yield": target states,
root-cause first. Problem framing: `problem.md`.

Each subgoal has an execution file (target state, actions,
monitoring, open questions):

| # | Subgoal | Symptom(s) | KPI | Now | Target | Measure | Horizon | File |
|---|---|---|---|---|---|---|---|---|
| 1 | Free P (break pH lockout) | abortion · botrytis · thin growth | tissue P | 0.23% | ≥0.5% | tissue; soil pH 7.4→~6.5 | multi-cycle | `sg1-free-p.md` |
| 2 | N to vigour sufficiency | thin growth | tissue N | 2.27% | 4–4.5% (3.1% = exit-crisis only) | tissue | weeks | `sg2-nitrogen.md` |
| 3 | Ca to resistance + structural band | botrytis · thin growth (stem) | tissue Ca | 3.46% | 4.5–5.5% | tissue | weeks–months | `sg3-calcium.md` |

Rank 1→2→3 by cause; **all start now** — #1 slowest (parallel
clock). SG3 (Ca) is uptake-limited → rides on SG1 (P/pH → root
recovery), feed-side won't help. SG2 (N) is likely both
supply-tight *and* uptake-impaired → a feed-side ramp helps but
under-delivers until roots recover; a fresh SME closes the gap.

## Interim root-uptake levers (during the pH wait)
Bridges while sulphur slowly corrects bulk pH — raise tissue
P + vigour by *direct uptake*, NOT by moving soil available P.
Now placed in the subgoal files: **Ocean root drench → SG2**
(`sg2-nitrogen.md`), **AMF → SG1** (`sg1-free-p.md`). Ranked
stack + cert gate + sources:
`../tomato/learnings/0002-interim-root-uptake-levers-during-ph-wait.md`.

## Non-nutrition levers (flag, not owned)
- Botrytis: biofungicide (*Bacillus subtilis* / *Gliocladium
  catenulatum* — verify Ecocert listing), HAF airflow,
  dry-morning de-leafing.
- Abortion: heat/light cap (sun-only). Pollination resolved.

## Monitoring — tissue only
Sap/SPAD/Brix rejected (too noisy). Soil pH = cheap SG1 gauge.
Soil EC (direct pen) = total-salt guardrail only (~2–3 mS/cm at
field capacity, cert 2); does NOT track N.

## Out of frame
Lettuce yield-range (lower priority, gated on head-size
marketability). Humidity/sanitation already optimised.
