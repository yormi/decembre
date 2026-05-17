# Todo — nutrition/lettuce/plant-needs

## Commander's intent

PURPOSE

Lettuce plant-needs is the youngest subproject in the tree — F1 carve landed 2026-05-16 with REQs 165-169 + INV-1 wired through verifier. The carve mirrored tomato plant-needs structure but with two divergences: (a) supply lives inside plant-needs (tomato keeps supply in fertigation-recipe), (b) supply takes a `dependencies` parameter bag (per `feedback_pure_code` + `feedback_model_srp`). Per F1 verdict, both are flagged in `learnings.md` as architectural watches — easy to split sideways later. This round: walk the cert table at derivation.md:108-122 against `LETTUCE_TISSUE_DW` values (data.js read-only check), verify the canopy factor `[0.2, 0.7]` bound rationale carries a concrete observable for refinement (REQ-169 cert 3), and add a refinement trigger for the supply-watch architectural decision so a future contributor sees the "split sideways" path explicitly.

KEY TASKS

1. Cert-table triangulation: derivation.md:108-122 lists per-element cert (N/P/K/Ca/Mg cert 4 macros, micros Fe/Mn/Zn/B/Cu/Mo cert 3). spec.md:142-147 REQ-168 says "Macros: cert 4. Micros: cert 3." Source `LETTUCE_TISSUE_DW` in data.js (read-only) — confirm the table at derivation.md:68-80 with Hochmuth 1991 + Sonneveld 2009 sources triangulates. Especially: K range 6-8 % DW, cited from Hochmuth, cert 4 — verify the value pinned at 7.0 % is mid-band defensible.
2. Canopy factor `[0.2, 0.7]` bound rationale: REQ-169 spec.md:151-159 says "Bounded so stunted plants (very small currentG) keep a minimum mass-flow floor and fully-mature plants don't over-pull soil solution beyond transpiration-realistic ceilings." Cert 3. Derivation.md:52-54 has the formula. Walk for a concrete refinement trigger — "when tissue tests show what" → bounds change to what. Currently absent.
3. Supply-in-plant-needs architectural watch: `learnings.md` carries the watch ("strict mirror of tomato would keep supply OUT of plant-needs"). Walk learnings.md for the actual entry; if the watch is informational only (no refinement trigger), add one: "if lettuce gains a foliar program OR a multi-channel recipe cascade like tomato, split `calculateLettuceNutritionSupply` into a sibling `lettuce/fertigation-recipe/` subproject parallel to tomato." Per P-08 do not surface this as a Guillaume ask.
4. Supply lockout-gate defense: derivation.md:56-61 documents the phLocked gates — P/Mn/Zn → `min(mass_flow, 100 mg/m²/wk)` (cert 3, REQ-020 inherited cap) + Fe → × 0.15 (cert 3, root-reductase suppression). Cross-check REQ-020 in `nutrition/spec.md` (PO scope, read-only) — verify the cap is 100 mg/m²/wk and the Fe × 0.15 factor traces to a defensible mechanism (calcareous-soil Fe phytosiderophore reductase inhibition). Document the source in derivation.md if currently bare.
5. Frontload-N-only invariant defense: spec.md:130-134 REQ-167 says "Front-load delivers N only via feather meal × mineralization efficiency ÷ mineralization window." Derivation.md:48 + 93-100 describes feather meal frontload. Confirm consistency: are P/K/micros explicitly zeroed in the supply output, or do they default to 0 via the absence-from-frontload-formula? Walk to verify.
6. Cycle-length sensitivity: REQ-166 says doubling cycleDays halves per-element demand. Derivation.md:9-15 formula confirms. Walk for the "what if cycleDays is far outside the typical 14d range" caveat — winter slower growth, summer faster. Currently in caveats at derivation.md:147-150. Verify the caveat names a concrete observable for refinement (e.g. "if cycle stretches > 21d, re-check `LETTUCE_DM_FRACTION` on cycle-stratified samples").
7. Pending tissue-test invariant: spec.md:163-168 Pending block names the back-test. As with tomato plant-needs todo item 3, confirm the trigger is condition-based (when Salanova tissue test data lands) rather than calendar-based.

END STATE

- Cert table macros 4 / micros 3 triangulates spec ↔ derivation ↔ Hochmuth/Sonneveld values in data.js.
- Canopy factor `[0.2, 0.7]` bounds carry a concrete refinement-trigger observable.
- Supply-in-plant-needs architectural watch in learnings.md names the split-sideways trigger.
- Supply lockout gates (P/Mn/Zn cap, Fe × 0.15) documented with source mechanism in derivation.md.
- Frontload-N-only invariant explicit (P/K/micros zeroed by absence, not by gate).
- Cycle-length caveat carries concrete observable for refinement.
- Pending tissue-test invariant condition-based.

RULES OF ENGAGEMENT

- Lane: own spec.md / derivation.md / learnings.md / this todo file
- Forbidden (P-06): app/index.html, */app/logic.js, */app/page.html, dist/, calc.js, model.js, data.js, requirements.md
- Verifier scripts: may edit if REQ changes
- REQ claims: scripts/claim-req.sh <spec-path> plant-nutrition-specialist (flock race-safe)
- Changelog: one line per material change, no trimming
- Deviation from intent: only with explicit justification in report

## Items

- [x] Cert table triangulation (spec ↔ derivation ↔ data.js read-only). → triangulates cleanly. Macros cert 4 / micros cert 3 in spec REQ-168 matches derivation cert table (lines 108-122). All `LETTUCE_TISSUE_DW` values in data.js match the Hochmuth/Sonneveld source rows (N 4.5 %, P 0.5 %, K 7.0 % mid of 6-8 % Hochmuth band, Ca 1.5 %, Mg 0.4 %, micros). No edits needed.
- [x] Canopy factor bounds — concrete refinement trigger observable. → added per-bound observables to derivation.md refinement triggers: floor 0.2 lifts/drops on stunted-bed transpiration measurement (water balance); ceiling 0.7 lifts toward 1.0 only on tissue back-test at mature head (≥80 g) showing soil-mass-flow under-supplying Ca/Mg/K secondaries.
- [x] Supply-in-plant-needs architectural watch refinement trigger. → already present in learnings.md "Supply belongs in plant-needs? — accepted with watch" section (lines 49-64). Names the split-sideways trigger ("if lettuce gains a foliar program... split into `nutrition/lettuce/fertigation-recipe/`"). No edits needed.
- [x] Supply lockout-gate mechanism source documentation. → expanded derivation.md formula-supply block: P → Ca-phosphate precipitation (variscite/hydroxyapatite); Mn²⁺ → oxidation to Mn³⁺/Mn⁴⁺ oxides; Zn²⁺ → CEC adsorption + Zn-hydroxide precipitation; Fe → root ferric-chelate reductase (FRO2 family) bicarbonate inhibition at pH 7.2-7.4. Documented the 100 mg/m²/wk cap as a safety upper-bound (non-binding in current SME data state where P=0.8 ppm × canopy yields ~2 mg/m²/wk, Mn/Zn=0 per DL); aligned the Fe 0.15 factor with the tomato `soilWeeklyAvailable` branch's identical factor + mechanism.
- [x] Frontload-N-only invariant explicit (zero by absence walk). → confirmed and documented: calc.js initialises `frontload[element] = 0` for every element in `LETTUCE_TISSUE_DW` then assigns only `frontload.N` from the feather-meal formula. So P/K/Ca/Mg/micros are zero by **both** construction AND absence-from-formula. Feather-meal label is 13-0-0 so the zero is mechanistically correct, not a placeholder. Added clarifying paragraph to `LETTUCE_FRONTLOAD_DEFAULTS` section in derivation.md.
- [x] Cycle-length caveat concrete refinement trigger. → already had the cycle-stratified-DW% refinement trigger at derivation.md refinement-triggers list; tightened with explicit observable "cycle-stratified DW% drifts outside [4 %, 6 %]" matching the cert-4 source band already in `LETTUCE_DM_FRACTION` notes.
- [x] Pending tissue-test invariant condition-based reframe. → already condition-based ("When Salanova tissue test data lands..."), not calendar-based. spec.md:163-168 reads as required. No edits needed.
