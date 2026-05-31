# Subgoal 1 — Free P (break the pH lockout)

Parent: `goal.md`. Problem: `problem.md`. Rank 1 of 3 (root
cause); slowest clock, starts now.

## Target state

| KPI | Now | Target | Measure | Horizon |
|---|---|---|---|---|
| tissue P | 0.23 % | ≥ 0.50 % | tissue (quarterly anchor) | multi-cycle |
| soil pH (Mehlich-3 water) | 7.4 | ~6.5 | pour-through / soil probe (cheap gauge) | multi-cycle |

## Why this is #1

P is upstream. At pH 7.4 phosphate is locked as Ca-phosphate
(Mehlich-3 total 557 kg/ha vs SME available 1.1 ppm). Low P
starves root growth → throttles N + Ca uptake. Free P and the
root recovers; the other two subgoals ride on it.

## Actions

### Root-cause — elemental sulphur pH drawdown (the real fix)
- Lever: micronized/Tiger-90CR sulphur, soil-applied, lowers
  bulk pH 7.4 → ~6.5 → dissolves the Ca-P vault.
- Model + dosing: `../tomato/soil-ph/model/derivation.md`.
- Status: **gated** on a calcimeter free-carbonate reading +
  PO root-zone target band. Slow — months-to-multi-cycle,
  binding term is CEC-buffered drawdown.
- Cert: elemental S allowed; Tiger-90CR formulation cert-0
  until OMRI/Ecocert confirmed.

### Interim uptake-side — AMF inoculation (deliver P while pH waits)
- Lever: arbuscular mycorrhizal fungi; hyphae reach past the
  root P-depletion zone + pipe phosphate in via the
  tomato-specific mycorrhizal P pathway.
- Raises **tissue** P, **NOT** soil available P — does not
  break the lock, scavenges the available fraction harder.
  Mechanism + rating (4/5): `../tomato/learnings/0002-interim-root-uptake-levers-during-ph-wait.md`.
- Confidence it pays *this* crop ~45 %; at next transplant
  ~75 % (mid-crop colonisation of a surface-mat root system
  is slow). **Best deployed at next transplant**; optional
  cheap mid-crop drench in the root zone.
- Cert: **product Ecocert/OMRI check required before use.**
- Guardrail: do NOT pair with a heavy soluble-P drench —
  raising tissue P represses the AMF P pathway.
- Status: proposed; awaiting product selection + cert check.

### Considered, shelved — PSB + bone meal
- PSB can chelate/free Ca-locked P, but establishment is
  variable, freed P re-precipitates on Ca-saturated soil, and
  **bone meal is itself Ca-phosphate → re-locks at pH 7.4**.
  Low confidence (~30–40 %), most complexity. Hold / tiny
  trial only. Full reasoning: `0002-interim-root-uptake-levers`.

## Monitoring
- Tissue P — quarterly anchor (P is slow; not worth monthly).
- Soil pH probe — cheap SG1 progress gauge.
- **Judge AMF on tissue P + new-growth vigour, never on a
  re-tested SME available-P number** (it won't move until pH
  drops).

## Open questions
- Calcimeter free-carbonate % (sets sulphur dose + feasibility).
- PO soil-root-zone target pH band (sets the endpoint).
- Mid-crop AMF colonisation rate on an established surface mat.
