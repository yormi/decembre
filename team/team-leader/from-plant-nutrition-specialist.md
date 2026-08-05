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

## 2026-06-05 — nutrition/tomato/fertigation-recipe + scripts/check-recipes.mjs (code-only, no spec change)

**Change type:** STORED data change (via /retire-recipe) + downstream test/render fix needed (no spec.md edit, no REQ)
**REQs affected:** none.
**Summary:** `STORED_RECIPE.tomato.fertigation` K₂SO₄ + MgSO₄ cut to 0 all stages (soil surplus — both pools confirm; corrective for over-ceiling CE). This breaks the `stored-vs-computed-drift-block` check: the Block 8 drift gauge renders FP ÷ Stored, and Stored K/Mg are now 0 → divide-by-zero on those rows. Two code-lane items: (1) repoint the verifier fixture (`scripts/check-recipes.mjs` ~line 1756) to a still-nonzero stored row so it tests render *direction* without assuming nonzero K; (2) decide + implement how Block 8 renders a zero-stored row (hide / "n/a" / guard the division) in the drift gauge render path. Admin-only gauge, invisible to the team, low impact, but currently red. STORED change + RECIPE_HISTORY snapshot + changelog already done by specialist; I did NOT edit the verifier or render (reverted a probe edit to keep footprint clean).
**Suggested waves:** coder (+ test-writer to re-green `stored-vs-computed-drift-block`)

## 2026-06-03 — nutrition/tomato/fertigation-recipe (code-only, no spec change)

**Change type:** code refactor (no spec.md edit, no REQ)
**REQs affected:** none — data-key rename + render alignment.
**Summary:** `STORED_RECIPE.tomato.fertigation` carries its boron value under the key `borax`, but the product is now Solubore (boric acid), 11 g all stages. The render path already labels this key "Solubore" (`fertigation-recipe/operator/drift.js` maps `storedFert.borax` → 'Solubore'; `historique-nutriments/logic.js` OLIGO map has `borax: 'Bore'`). Rename the live key `borax` → `solubore` so the data name matches the product. Touch points: `nutrition/tomato/protocol/fertigation/stored.js`, `drift.js`, `historique-nutriments/logic.js`. Leave existing RECIPE_HISTORY snapshots verbatim (historical record — they legitimately carry `borax`). Keep `bash scripts/check-spec.sh` green (currently bash 12/0, node 146/1 — the 1 is the pre-existing Canna `ecocert-only-products` scan, unrelated).
**Suggested waves:** coder (+ test-writer if a behavior test should pin the key name)


## 2026-07-26 — yield-range: nursery DLI ceiling wk3+ 17 → 25 (model change, spec + derivation updated)
**Change type:** model constant + growth-term rewiring; spec.md/derivation.md/domain.md updated in the same pass. No REQ (slug specs only).
**Summary:** Nursery growth now drives on `nurseryLightCeiling(day)` (wk3+ = 25) and the field on `DLI_TARGET` (17, unchanged) — `calc.js` `effectiveDli`. Basis: measured bench DLI 23.3 mol/m²/j (pyranometer, July, no LED). `5 g @ d25` demoted from anchor to data point (biggest-plant basis vs mean-plant engine; DLI was assumed). `NURSERY_STRESS_RUE = 0.85` keeps its value but is now unanchored — deliberately NOT refit until `PLUG_DRY_MATTER_FRACTION` (0.07) is measured.
**One test lane item:** `yield-range/domain/spec.test.mjs` § `senescence-past-closure` → `over-held head is flagged senescing and sits below its peak` went pass → fail. Cause: the larger transplant (13.7 → 16.4 g) pushes the field peak from d51 to d56, so the 4-week harvest now lands at peak instead of past it. The other two tests in that suite were already red before this change (`2wk near peak`, `holding longer loses weight`) — the whole senescence branch reads inverted on this branch and wants one pass, not three patches. I did not touch it: retuning `SENESCENCE_ONSET_DAYS` / `LAI_CLOSURE` while plug DM is still a guess would move the error around.
**Suggested waves:** test-writer (re-green `senescence-past-closure` as one lane, after the plug dry-matter measurement lands)

## 2026-07-26 (2) — yield-range: model day axis germination → sowing; doc/ restructured around a single data register
**Change type:** model axis change (behaviour moves) + docs restructure. No REQ.
**Summary:** New `GERMINATION_LAG_DAYS = 3` (assumed). `predictYield` and all three `seedling-thinning.js` loops now run on **days from sowing, day 1 = sowing**; growth gated until day 1 + lag; `nurseryLightCeiling` steps on tissue age (`day − 1 − lag`). `nurseryDays` / `thinDay` / `trajectory.day` are all sowing-based now — **stored operator inputs meaning "nursery days" shift by the lag in meaning**, worth a glance at any UI that passes them. One axis across code, spec, derivation and docs; no conversion anywhere.
**Docs:** new `doc/data-points.md` is the single register for every Décembre observation (data + reading context, zero interpretation). The two July cohort files I added earlier are deleted — data into the register, analysis into `derivation.md`. The spring file is now retired-logistic-fit provenance with no weights. `doc/CLAUDE.md` rewritten.
**Test lane:** suite is 22 pass / 4 fail, same count as the pre-session baseline. I fixed one pre-existing red (`small-LAI gain` read `DLI_TARGET` where SLA is derived at the week-2 ceiling). Still red, all in one cluster: `senescence-past-closure` ×3 + `a stressed transplant harvests no heavier than a clean one`. The senescence branch reads inverted on this branch (holding longer currently gains weight) and wants one deliberate pass, not local patches — best done after `PLUG_DRY_MATTER_FRACTION` is measured.
**Suggested waves:** test-writer + coder (senescence-past-closure as one lane); reviewer glance at any consumer passing `nurseryDays`.

## 2026-07-26 (3) — yield-range: germination lag removed entirely; pure sowing axis
**Change type:** model change (behaviour moves) via a 12-agent review workflow. No REQ.
**Summary:** `GERMINATION_LAG_DAYS` is gone — no constant, no growth gate, no tissue-age subtraction. `nurseryLightCeiling` steps on `floor((day − 1) / 7)`; band values unchanged. `W_INIT_GERMINATED_G = 0.015` → `INITIAL_DRY_MASS_G = 0.009`, a day-1 intercept **fitted** to cohort D day 12. Honest cost, stated in derivation.md: that intercept absorbs the heterotrophic emergence phase as a level, because one ε·DLI·fi law cannot represent it (a real 1 mg seed reaches only 0.06 g by day 12). The alternative — an emergence threshold on leaf area — was rejected: it needs a constant nobody has measured, and any value would be tuned to reinstate the delay.
**Fit moved, and not all for the better:** stressed regime vs cohort D goes 1.03× → 0.98× at day 12, **1.06× → 1.34× at day 19** (worse — the wk3+ ceiling now arrives day 15 not day 18), 0.58× → 0.66× at day 26. The adversarial numbers reviewer's verdict: neutral at best, degrades the one point the model previously got right. Day 12 is also no longer an independent check, since the intercept is fitted to it.
**Bug found in passing:** the `SPECIFIC_LEAF_AREA` comment was FALSE under the lag — sowing day 10 mapped to tissue age 6 → band index 0, not "week 2" as claimed. The rebase repairs it; index [1] unchanged.
**Gates:** `npm run check` 150/2 (pre-existing tomato reds). Suite **23 pass / 3 fail — one better than baseline**; `over-held head is flagged senescing` went green as a side effect of the shifted transplant weight. Remaining reds: `senescence-past-closure` ×2 + `a stressed transplant harvests no heavier than a clean one`. Still one lane, still best done after `PLUG_DRY_MATTER_FRACTION` is measured.
**Open, needs Guillaume:** `doc/data-points.md` still asks for germination dates and carries two "Germination date not logged" lines. Nothing consumes a germination date now. Left untouched because he hand-edits that file.
**Suggested waves:** test-writer + coder (senescence cluster); reviewer on `app/admin/rendement` chart geometry (x-scale re-anchored to day 1).

## 2026-07-26 (4) — yield-range: germination time is now MODELLED (thermal time), superseding note (3)
**Change type:** model addition — first temperature term in the growth engine. New input + two new outputs. No REQ.
**Summary:** `germinationDaysFromSoilTemperature(T) = GERMINATION_THERMAL_TIME_DEGREE_DAYS / (T − GERMINATION_BASE_TEMPERATURE_C)`; null at/below base and above `GERMINATION_INHIBITION_TEMPERATURE_C = 24` (thermo-dormancy per `domain/propagation.md`), where `predictYield` throws rather than returning a silent zero-growth run. `emergenceDay = 1 + germinationDays`; light-driven gain is zero before it. New optional input `nurserySoilTemperatureC` (default 19.5, midpoint of the 18–21 viable band); new outputs `germinationDays` and `emergenceDay`. Same treatment in all three `seedling-thinning.js` loops via `SEEDLING_EMERGENCE_DAY`.
**This is not the lag coming back.** Thermal time is a response function: 3.2 days at 19.5 °C is an *output*, and the parameters (base 4 °C, 50 °Cd) are literature values not tuned against any Décembre datum. It predicts 5.2 d at 16 °C and 3.9 d at 21 °C, so one logged emergence date refutes it. Cert 2 — not measured here. Cohort E already has a logged sowing date, so it needs only the emergence observation. The derivation's Rejected block was amended in place to draw this distinction rather than left contradicting the new code.
**Constant renamed and refit:** `INITIAL_DRY_MASS_G = 0.009` → `EMERGENCE_DRY_MASS_G = 0.013`. It is now the mass **at emergence**, not at sowing, and it had to rise because the growth window lost 3 days.
**What is still absorbed, stated in derivation.md:** when the seed fires is modelled; how much mass appears when it does is fitted. A real 1 mg seed reaches only ~0.06 g by day 12 in this engine. Closing that needs an **age-dependent `SPECIFIC_LEAF_AREA`** — young seedlings build thin cheap leaves and intercept far more light per gram than a constant SLA allows. That is the next real modelling step and is independent of this one.
**Gates:** `npm run check` 150/2 (pre-existing tomato reds). Suite **25 pass / 3 fail** — two new tests added (thermal-time monotonicity + band-edge nulls + throw; warmer soil → earlier emergence → heavier transplant). Remaining reds unchanged: `senescence-past-closure` ×2 + `a stressed transplant harvests no heavier than a clean one`.
**Note:** a mid-edit `npm run check` briefly read 138/14 — stale `dist` while files were being written, not a real regression. Re-ran clean at 150/2. The verifier reads built `dist`, so never trust a check that overlaps a write.
**Suggested waves:** modeller (age-dependent SLA — the real remaining gap); test-writer + coder (senescence cluster).
