# team-leader ← plant-nutrition-specialist

Spec-change notifications from the plant-nutrition-specialist persona. Each entry names one subproject whose `spec.md` changed (REQs added, edited, or deleted) and signals to the team-leader that test / code / prune work is now pending there.

The team-leader reads this file at session start. When it processes an entry — by running the relevant wave(s) for that subproject — it cuts the entry from this file and appends it to `from-plant-nutrition-specialist-done.md` with a one-line outcome.

## Format

Append at the top (most recent first):

```
## YYYY-MM-DD HH:MM — <subproject-path-relative-to-repo>

**Change type:** added | edited | deleted (one or more)
**REQs affected:** REQ-NNN, REQ-NNN, ...
**Summary:** 1–2 sentences on what changed in the spec.
**Suggested waves:** test-writer · coder · pruner (any/all — leader decides final scope)
```

`<subproject-path>` is the directory holding the changed `spec.md`, e.g. `nutrition/tomato/fertigation-recipe`.

A single turn that touches multiple subprojects writes one entry per subproject.

## Entries

## 2026-05-17 — yield-range (REQ-115 RGR_max refit)

**Change type:** edited (derivation.md + learnings.md only; spec.md REQ-115 unchanged — pure normative formula carries no value)
**REQs affected:** REQ-115 (derivation trace + learnings audit only — value lives in `data.js`, formula in spec)
**Summary:** Refit `RGR_MAXIMUM_LETTUCE_NURSERY` 0.40 → 0.30 d⁻¹. New anchor: cross-cultivar butterhead seedling RGR_max literature (Wageningen / Hoogendoorn-line CE chambers, typical pre-canopy-closure band 0.25–0.30 d⁻¹). Conservative end of band picked because no Salanova / butterhead RGR_max primary source lives in `nutrition/doc/` (gap named per [[P-10]]). Cert stays 3 but anchor shifts from back-calculated-to-d28-d35-asymptote (rejected as circular) to cross-cultivar literature transferability under comparable regimes (DLI 25-30 mol/m²/d, day-temp ~22 °C, packed-tray seedling 0-28 d). Integrator output under the refit (scratch trace, calc.js byte-untouched): 50-cell `cap = 25 g` / `DLI = 28` / 16 LED-h → `daysToTransplantPotential = d44` (W reaches 0.95 × 25 = 23.75 g at d44, +9 to +16 days vs the prior nominal d28-d35 framing). 32-cell `cap = 39 g` → d46; 24-cell → ~d49; 18-cell → past the 49-day `TRAJECTORY_MAXIMUM_DAYS` window. At `ledHours ≤ ~8`, 50-cell also slips past window → operator surface renders `Plein potentiel non atteint` annotation (REQ-121) more frequently than under 0.40. `derivation.md` REQ-115 section rewritten — back-calc structural error named inline; missing-doc gap explicit; integrator-output timing replaces "asymptotes between d28 and d35" aspirational anchor; symmetric refinement triggers (upward + downward) per [[P-03]]. `learnings.md` gained "Rejected: back-calculated RGR_max from cap-asymptote target" — full audit trail (cap is data-anchored target; RGR_max should predict timing under cap, not be tuned to hit a target timing; 2026-spring calibration cohort's observed-stressed 0.22 → assumed best-case 0.40 was +82 % with no intermediate data point). Consolidated refinement-triggers table updated — symmetric RGR refit row added with d44 anchor; second "primary source lands" row for cert-ladder override; per-tray cap row de-coupled from RGR refit.

**Suggested waves:** **coder lane (P-06 — specialist did not touch data.js)** — `yield-range/data.js:RGR_MAXIMUM_LETTUCE_NURSERY` must swap `0.40` → `0.30`; rewrite the surrounding comment block (`data.js:9-15`) to retire the back-calc prose (currently `"Refit anchor: best non-light conditions (Π other stress = 1.0), 50-cell packed, DLI = sun(16.5) + LED(11.5) = 28.0, RGR_MAX = 0.40, canopyCap = 25g → asymptotes around d28 to d35. Matches the upper bound of \"best case\" for Décembre's observed 16g (heat-stressed, sub-optimal). Cert 3, will need refit when more cohort data lands."`) and cite the new anchor pointing to `yield-range/derivation.md` REQ-115 trace + `learnings.md` § "Rejected: back-calculated RGR_max from cap-asymptote target". · **test-writer** — no yield-range test file exists today (`find yield-range -name "*.test.mjs"` returns empty); if one lands during the extension-bundle test-writer wave, add an integrator pin at 50-cell / DLI=28 / 16 LED-h asserting `daysToTransplantPotential = 44` under `RGR = 0.30` + `cap = 25 g`. · **pruner** — sweep for stragglers citing `RGR.*0\.40` or `d28.*d35` / `d28-d35` model-prediction prose across the tree (`grep -rn "RGR.*0\.40\|d28.*d35\|d28-d35" --include='*.md' --include='*.js' --include='*.mjs'` — exclude `doc/yield-range-calibration-2026-spring.md` + `learnings.md` § heat-stressed-cohort / senescence + `derivation.md:47-51` which legitimately describe the 2026-spring cohort's observed-stressed timing, NOT the model's prediction). Most cohort-observation references (16 g @ d28 stressed, d28→d35 mass loss observed) are about real data and should stay.

**CROSS-CUTTING reminder:** Operator-side annotation `Plein potentiel non atteint dans la fenêtre de 49 jours` (REQ-121 / `app/spec.md:42`) now fires more frequently — at 18-cell always (any LED hours), at 24-cell on the boundary, at lower-LED 50-cell / 32-cell. App-spec / `app/logic.js` still uses singular `daysToPotential` (vs the 2026-05-17 split `daysToTransplantPotential` + `daysToHarvestPotential` from REQ-117); coder cascade for that rename was filed in the 2026-05-17 REQ-117/118 inbox entry below and isn't re-filed here.

_(Sub-wave J archived to `from-plant-nutrition-specialist-done.md`: 10 entries — yield-range REQ-112/172 cap-basis · REQ-117/118 amendments · REQ-171..175 extension bundle · REQ-116 hygiene · sidedress-recipe cert · fertigation-recipe Mo carve-out · soil-contribution REQ-145 micros · tomato/plant-needs Pending reframe (awareness-only) · foliar-recipe REQ-101/115 reframe · compost-contribution INV-1. Prior 2026-05-17 sub-wave I entries archived earlier.)_
