# plant-nutrition-specialist ← model-challenger

Approved findings from the model-challenger persona queued for the plant-nutrition-specialist to action.

Peer personas (`context-coherence`, …) route through this channel via the challenger's gatekeeping — source is stamped on each entry's `**Source:**` line.

**Workflow:**
1. **Challenger writes here** when Guillaume approves a draft finding. The finding is copied verbatim from drafts.md plus an `### Action` block stating what the specialist should do.
2. **Specialist reads this file at session start** (per `plant-nutrition-specialist.md` startup checklist).
3. **Specialist picks one request per turn**, edits spec/derivation/code/data accordingly in their own session.
4. **On completion**, specialist **moves the entry** from this file into `from-model-challenger-done.md` with a `### Specialist response` block (what was changed, file:line pointers).
5. **Challenger verifies** at next session — pass → leave in done; fail → move back here with an updated Action.

**Request schema per entry:**
- `**Source:**` originating persona + draft tag (e.g. `model-challenger B1`, `context-coherence F1`).
- `**Action:**` concrete edit(s) the specialist should make.
- `**Acceptance:**` what the originating persona will check to verify.
- Original finding body copied below the action.

---

## B1-followup — Land the un-landed code-side half of the 2026-05-17 B1 routing (autonomous-routed 2026-05-17 per [[P-12]])

**Source:** model-challenger (drafts.md 2026-05-17 yield-range/derivation.md follow-up review, two concurrent Mode A instances converged)

**Action (bundled — two un-landed data.js constants on the same approved-basis-switch axis):**
1. Update `yield-range/data.js:59` from `const CANOPY_CAP_BY_PLATEAU = { 50: 25, 32: 50, 24: 80, 18: 120 };` to `const CANOPY_CAP_BY_PLATEAU = { 50: 25, 32: 39, 24: 52, 18: 69 };`.
2. Update `yield-range/data.js:16` `RGR_MAXIMUM_LETTUCE_NURSERY` from `0.40` to `0.30` (per Guillaume-approved D1 option 2 routed in the entry below; specialist's RGR refit landed in spec.md + derivation.md + learnings.md but data.js still carries 0.40). Rewrite the surrounding comment block (`data.js:9-15`) to retire the back-calc prose (currently `"Refit anchor: best non-light conditions ... RGR_MAX = 0.40, canopyCap = 25g → asymptotes around d28 to d35. ... Cert 3, will need refit when more cohort data lands."`) and cite the new anchor pointing to `yield-range/derivation.md` trace + `learnings.md` § "Rejected: back-calculated RGR_max from cap-asymptote target".
3. Append a `working files/changelog.md` entry per CLAUDE.md "Parallel-session staleness mitigation" rule (constants added/removed qualifies as material change). Format: `YYYY-MM-DD HH:MM — yield-range/data.js: CANOPY_CAP_BY_PLATEAU landed geometric values {50:25, 32:39, 24:52, 18:69} + RGR_MAXIMUM_LETTUCE_NURSERY landed 0.30 (was 0.40); spec/derivation/learnings already on these values, closes the spec ⟂ code gap for both approved 2026-05-17 refits.`
4. `npm test` + `npm run check` — verifier matchers for the per-tray / nursery-canopy-cap / logistic-growth specs don't read numeric values today (per `scripts/check-recipes.mjs` grep), so no numeric-test regression expected; confirm both pass.

**Acceptance:**
- `grep -n "CANOPY_CAP_BY_PLATEAU" yield-range/data.js` shows the geometric values.
- `grep -n "RGR_MAXIMUM_LETTUCE_NURSERY" yield-range/data.js` shows `0.30`.
- `predictNurseryYield({plateauSize: 32, ...})` returns the geometric-cap-anchored result (39 g asymptote, not 50 g); 50-cell `daysToTransplantPotential` returns d44 (not d28-d35).
- `working files/changelog.md` has the landing entry.
- `npm test` 259/0 baseline preserved; `npm run check` 161/0 baseline preserved.

**Why (autonomous routing per [[P-12]]).** Guillaume's 2026-05-17 B1 approval already settled the basis decision (geometric over power-law); the routing entry above lists `data.js` update as action item #2. Specialist landed items #1 (spec.md amendment) + #3 (derivation prose) + #4 (refinement trigger) + part of #5 (learnings.md archival) but missed the data.js constant — single line, no fresh Guillaume decision needed. Yield-load-bearing because operator-facing tray-choice narrative (`predictNurseryYield`) continues to compute against the rejected constant; spec/derivation/learnings audit-trail reads consistent geometric basis while runtime computes the old value. Every day the gap persists, downstream commits accumulate on top of a stale constant.

---

### Original finding body (from drafts.md 2026-05-17 yield-range/derivation.md follow-up review B1)

- **What the spec assumes:** the new per-tray cert paragraph reads as a defense of value 39 g at 32-cell ("geometric physics-floor"), but `calc.js` still resolves `CANOPY_CAP_BY_PLATEAU[32]` to 50 g. The whole new prose section is internally consistent and externally divorced from the runtime.
- **What might be ignored:** operator-facing tray-choice narrative today (50-cell cap 25 g → 32-cell cap 50 g = +100 % per-plant uplift) still rides on the power-law code path. The B1-approval rationale was to retire exactly that narrative in favor of +56 % (25 → 39). Catherine's audit reads consistent spec/derivation/learnings prose; runtime computes a different number. Any extension-REQ work landing on top of this multiplies through the wrong code constant while the audit trail reads "approved 2026-05-17."
- **Cost if real:** medium-high. Yield-load-bearing on the 32-cell tray-choice today — 28 % cap overstatement at 32-cell propagates one-for-one into `daysToTransplantPotential` over-prediction (~5-7 days at 32-cell) and one-for-one into `annualYieldKg` once the extension REQs land. The longer this gap persists, the more divergent commits accumulate on top of a stale constant. The fix is mechanical (one-line constant + downstream confidence check); cost of leaving it un-landed is operationally high vs cost-to-fix near-zero.
- **Impact:** 3/5.

---

## D1-32cell — Drop 32-cell cert 3 → 2 now + queue `FOLIAGE_HEIGHT_M` independent-anchor refit (approved 2026-05-17)

**Source:** model-challenger D1 (drafts.md 2026-05-17 yield-range/derivation.md follow-up review — two concurrent Mode A instances converged on the 32-cell cert single-anchor question)

**Action (option 1 + 2 combined — Guillaume ruling 2026-05-17):**
1. **Immediate (option 1).** In `yield-range/spec.md` canopy-cap-is-ceiling paragraph + `yield-range/derivation.md` per-tray cert paragraph: drop 32-cell cap cert from **3 → 2** to match the 24/18-cell evidence base. Reword the rationale from "geometric physics-floor, defensible one density step from the breeder anchor" (which doesn't quantify why one step is OK and two aren't) to "geometric physics-floor; same single-anchor dependence as 24/18-cell — cert 2 reflects the shared evidence base. Bumps to cert 3 when `FOLIAGE_HEIGHT_M` lands on an independent measurement (refinement trigger below)."
2. **Queued (option 2).** Add a refinement-trigger row to the `yield-range/derivation.md` consolidated table: **"FOLIAGE_HEIGHT_M independent anchor"** — observable: Décembre cohort photo measurement at 50-cell d28 packed density (visual canopy-height read; cheapest path) OR a published Salanova / butterhead canopy mass-loading value at packed nursery densities (if surfaced into `nutrition/doc/`); action: refit `FOLIAGE_HEIGHT_M` to the measured value (breaks single-anchor dependence — `FOLIAGE_DENSITY_KG_PER_M3` derives from the breeder-anchored `h × ρ` product); target file: `yield-range/data.js` `FOLIAGE_HEIGHT_M` + `FOLIAGE_DENSITY_KG_PER_M3`; cert restoration: 32-cell back to cert 3 once `h` and `ρ` are independently anchored.
3. Cross-check `yield-range/learnings.md` § "Rejected: two-anchor power-law" — the "ρ = 82 kg/m³ (back-derived from the 50-cell breeder anchor)" note is the audit-trail link explaining why current `ρ` is single-anchored; add a sibling note that `FOLIAGE_HEIGHT_M = 0.10` is the unsourced second half + the refinement trigger above is the path to independent anchoring.
4. No `data.js` value change in this action (the constants `h = 0.10` / `ρ = 82` stay byte-identical until refit data lands).
5. `npm test` + `npm run check` — verifier matchers don't read cert labels; no regression expected.

**Acceptance:**
- `yield-range/spec.md` canopy-cap-is-ceiling paragraph reads 32-cell cert **2** (not 3); rationale names the shared single-anchor dependence with 24/18.
- `yield-range/derivation.md` per-tray cert paragraph mirrors the spec.md change; consolidated refinement-trigger table has the "FOLIAGE_HEIGHT_M independent anchor" row with observable + action + target file + cert restoration.
- `yield-range/learnings.md` "Rejected: two-anchor power-law" entry has the sibling note about `FOLIAGE_HEIGHT_M` unsourcedness.
- `yield-range/data.js` values byte-identical (`FOLIAGE_HEIGHT_M = 0.10`, `FOLIAGE_DENSITY_KG_PER_M3 = 82`).
- `npm test` + `npm run check` pass at current baselines.

**Why (Guillaume 2026-05-17 ruling, option 1 + option 2 combined).** Option 1 alone would relabel without addressing the structural issue (one anchor pretending to be two). Option 2 alone (refit when data lands) would let the asymmetric cert 3 vs cert 2 stand in the meantime. Combined: drop cert now (audit-trail-honest immediate move; removes the unquantified "one density step" asymmetry), AND queue the refit path explicitly (physics-honest follow-up; cert restoration is conditional on real measurement, not a heuristic). Cert 3 only earns its label when the underlying single-anchor dependence is broken — that's the [[P-15]] discipline applied symmetrically across all four per-tray rows.

**Operational stake.** Low today — value 39 g at 32-cell doesn't shift; only the cert label moves. But the cert change is read by Catherine's audit + downstream extension-REQ work as "this number is one-data-source-away from being demoted further." Which is the honest read.

---

### Original finding body (from drafts.md 2026-05-17 yield-range/derivation.md follow-up review D1)

- **Specialist's defense:** "50-cell breeder-anchored cert 3; 32-cell cert 3 (geometric physics-floor, defensible one density step from the breeder anchor); 24-cell cert 2 and 18-cell cert 2 — the constant-`h × ρ` assumption is the floor, but lettuce given more space per plant tends to grow taller and denser."
- **What I'd need to accept cert ≥ 3:** one of (a) Salanova breeder data at 32-cell (independent second-density anchor), (b) independent source for `FOLIAGE_HEIGHT_M = 0.10` at 50-cell packed density (Décembre cohort photo measurement at d28 / peer literature), (c) peer-literature canopy mass-loading value for Salanova at packed nursery densities. None cited in derivation.md or learnings.md; no Salanova breeder spec sheet in `yield-range/doc/` (checked per [[P-10]]).
- **My read:** per [[P-15]], two paths — (i) cert downgrade 32-cell → 2 (audit-trail-honest minimum-touch; matches 24/18 evidence base), or (ii) refit `FOLIAGE_HEIGHT_M` against an independent canopy-height anchor (Décembre cohort photo measurement at 50-cell d28 is the cheapest path) — breaks single-anchor dependence, lets cert 3 stand on a now-honest two-input evidence base. Guillaume's ruling: do both — (i) immediately to remove the asymmetry, (ii) queued as the path back to cert 3.
- **Impact:** 3/5.
