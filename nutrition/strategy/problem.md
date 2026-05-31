# Problem — 2026 tomato decline

One pH-7.4 lockout crisis, three faces (not three problems).
Evidence: tissue panel
`../tomato/doc/tomato-t5-tissue-analysis-2026-05-23.md` (cert 4)
+ direct-soil CE ~1.5 → 2.6 (latest) vs ~3.0 target — climbing
back toward target, total feed recovering (caveat: direct-soil
EC is moisture-sensitive; and EC tracks salt load, not N).

| Symptom | Cause |
|---|---|
| Thin new growth | N déficient (2.27% vs 3.10) **+ Ca** (cell-wall; immobile → new growth first) |
| Flower abortion | P −90% (0.23 vs 0.50). NOT boron (B 57 ppm suff); NOT pollination (bumblebees running) |
| Botrytis (dry house) | Ca below resistance band (3.46 vs 4.5–5.5) + P+Ca wound-healing fail at scars; secondary |

P is upstream — starves root mass → throttles N + Ca uptake.
K + Ca are **uptake-limited** (abundant in solution, short in
leaf; antagonism ruled out); P the only true supply/pH-lockout
case. **N is likely both** — supply-tight *and* uptake-impaired:
the "adequate solution N" read is 6 weeks pre-leaf and nitrate is
mobile/unbuffered, so the uptake-only call is soft for N (cert 2).
See `../tomato/soil-ph/model/learnings/supply-vs-uptake-cation-test-rules-out-antagonism.md`;
aeration ruled out separately (live roots).
Implication: K/Ca ride on root recovery via P/pH (feed-side ramps
won't help); a feed-side N ramp still helps but under-delivers
until roots recover. **Missing measurement: a fresh SME** closes
the N supply-vs-uptake gap.

Decision trail: `../tomato/learnings/0001-2026-decline-single-ph-lockout-crisis.md`.
