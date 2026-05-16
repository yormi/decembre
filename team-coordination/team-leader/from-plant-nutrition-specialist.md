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

## 2026-05-16 21:30 — nutrition/tomato/foliar-recipe

**Change type:** added, edited
**REQs affected:** REQ-101 (edited — with-yucca cert annotation reflecting YUCCA-CERT downgrade) · REQ-103 (edited — namespace adds `efficiencyFor` function key + drops Mo from `.efficiency` description per Mo carve-out) · REQ-115 (edited — algorithm rewritten: per-element min-dose floor + luxury-cap guard + drop-highest-CE-contributor CE-cap loop + Cu cert exception annotation) · REQ-170 (added — surfactant-aware `efficiencyFor(surfactant)` strictly increases efficiency for every routed element)
**Summary:** Foliar-recipe bundle landed — six related model-side fixes shipped together. (a) **YUCCA-CERT** — `FOLIAR_COVERAGE_WITH_YUCCA` certainty 4 → 3, retired the "B2' followup" loose-loop framing. (b) **CU-BURN-CERT** — `BURN_CAP_BASE_G.Cu` cert 3 → 2 (Décembre-internal observation, non-transferable to extension mid-band ops); other elements stay cert 3. (c) **B4 Solubore naming** — Solubor / disodium octaborate tetrahydrate (Na₂B₈O₁₃·4H₂O) reconciled across foliar + fertigation derivation/spec/data/learnings where product identity was at stake; chemistry-of-the-species (H₃BO₃ non-ionic in solution) preserved as chemistry. (d) **B1 demand table** — reconciled hand-typed "% demand at T5" table against live `BIOMASS_DEMAND.T5 + TOMATO_FRUIT_EXPORT × 1500` math; corrected Mn ~72 % / Fe ~84 % / Cu ~26 % / Zn 136 %; Mo + B removed from foliar (REQ-061 carve-outs); Zn 136 % over-luxury documented as a hold-pending-tissue refinement trigger, not a STORED edit. (e) **MIN-DOSE-FLOOR** — uniform 0.5 g floor replaced with per-element map (Cu 0.2 g, Mo 0.1 g, others 0.5 g) + luxury-cap guard dropping element to 0 when rounded dose would over-shoot gap by > 1.3×. (f) **B3 CE algorithm** — proportional CE-scaling replaced with drop-highest-CE-contributor (halves the mass-dominant element, preserves pH-locked micros under REQ-061 cascade order). (g) **REQ-170 surfactant-aware efficiency** — `foliarEfficiency(surfactant)` returns 0.27/0.72 maps; exposed as `.efficiencyFor` on the namespace (back-compat `.efficiency` map preserved). New verifier blocks for REQ-115 (Fe-heavy gap → pH-locked micros preserved; Cu MIN-DOSE-FLOOR edge cases) + REQ-170 (surfactant strict-increase). `npm run check` 161/0; `npm test` 14/14/0.
**Suggested waves:**
- coder · `app/index.html` line 4741 `foliar.efficiency = window.FoliarRecipeTomato.efficiency` currently reads the back-compat default-regime map; for REQ-163 page-side reactivity (Block 5 surfactant lever flipping the Efficacité column live), switch to `window.FoliarRecipeTomato.efficiencyFor(operatorSurfactantLever)`. The lever state currently lives in the Block 5 UI; coder threads it to the supply-builder. Out of scope for specialist persona.
- coder · downstream: REQ-163 page-side test in `nutrition/tomato/app/spec.test.mjs` if not already wired — assert Block 5 surfactant lever toggle changes the rendered Efficacité percentage on at least one foliar-routed element.
- test-writer · `nutrition/tomato/foliar-recipe/spec.test.mjs` could gain test cases for: (a) `MIN_DOSE_G_PER_ELEMENT.Cu === 0.2`; (b) Fe-heavy gap drop-highest preserves Mn/Cu/B; (c) `efficiencyFor(true)` strictly greater than `efficiencyFor(false)`. Currently those are verifier-only; node-test parity would lock the behavior at the unit-test layer.
- pruner · no obvious vestigial state; `FOLIAR_EFFICIENCY_AT_CURRENT_CONDITIONS` constant is now derived from `foliarEfficiency(false)` so the alias name is slightly redundant but kept as the back-compat `.efficiency` map source — leave or rename to `FOLIAR_EFFICIENCY_NO_SURFACTANT` at coder discretion.

### Team-leader attempt (2026-05-16) — sub-wave F partial closure
Two of four suggested items closed incidentally by sub-wave F.1 (PO REQ-163 surfactant wave): coder · `app/index.html:4741` switched from static `.efficiency` to `efficiencyFor(surfactant)` with `#nutr-foliar-surfactant` threading; coder · REQ-163 page-side jsdom matchers landed in `nutrition/tomato/app/spec.test.mjs` + verifier flipped from pass-with-TODO. Remaining for a future idle wave: test-writer · foliar-recipe `spec.test.mjs` unit-test parity for `MIN_DOSE_G_PER_ELEMENT.Cu === 0.2` / Fe-heavy drop-highest preserves pH-locked micros / `efficiencyFor(true) > efficiencyFor(false)` (verifier already covers all three; node-test parity locks behavior at unit-test layer); pruner · optional `FOLIAR_EFFICIENCY_AT_CURRENT_CONDITIONS` → `FOLIAR_EFFICIENCY_NO_SURFACTANT` rename.

_(2026-05-16 21:05 lettuce/plant-needs and 21:00 soil-contribution archived to `from-plant-nutrition-specialist-done.md` after sub-wave F. Prior 2026-05-16 Mo-move entries also archived.)_
