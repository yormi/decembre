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
clock). SG2 (N) and SG3 (Ca) are both **uptake-limited** → they
ride on SG1 (P/pH → root recovery); feed-side won't help. The
only N lever that delivers is **root-bypass** (Ocean amino-N on
the AAT/LHT channel; `sg2-nitrogen.md`), not a feed-side ramp.
N reclassification trail:
`../tomato/learnings/0003-n-reclassified-supply-tight-to-uptake-only.md`.

## Interim root-uptake levers (during the pH wait)
Bridges while sulphur slowly corrects bulk pH — raise tissue
P + vigour by *direct uptake*, NOT by moving soil available P.
Now placed in the subgoal files: **Ocean root drench → SG2**
(`sg2-nitrogen.md`), **AMF → SG1** (`sg1-free-p.md`). Ranked
stack + cert gate + sources:
`../tomato/learnings/0002-interim-root-uptake-levers-during-ph-wait.md`.

## Salt-budget rule (cross-cutting — ties SG1 + SG2)

CE is one shared budget across three taps. The sulphur fix
(SG1) generates sulfate intrinsically (S → sulfuric acid →
sulfate byproduct), so the pH cure and the salt problem are the
same lever. June SME: CE 3.96 (over the ~3.0 rail), sulfate 1787.

- **Tap A — sulphur dose: never throttle.** pH 6.9, target 6.3;
  backing off delays the root fix (the binding constraint).
- **Tap B — added K/Mg sulfate: off** (already 0 all stages).
- **Tap C — leaching irrigation: up** (dilutes/leaches sulfate).
- **Protect the CE rail via B + C, never A.**
- **Sacrifice granular N before sulphur.** Ocean leads because
  it's ~CE-free (amino-N, not nitrate salt); granular feather
  meal spends CE for no uptake gain (N is uptake-limited, not
  supply-short — see SG2).

Operating gauge: direct-pen CE before/after each drench. Flat CE
as tissue/sap N climbs = bypass working; rising CE = back off.

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
