# Todo — yield-range

## Commander's intent

PURPOSE

Yield-range is structurally different from the other 7 in-scope subprojects: it predicts Salanova-nursery time-to-canopy-cap (days from germination to ≥ 0.95 × canopyCapG) under best non-light conditions, packed-only, with tray size + LED hours as the only operator levers. Spec is 118 lines + a Specialist note at the bottom flagging an extension-pending state ("decision Guillaume 2026-05-16 to extend yield-range to cover nursery + field + throughput balance — model plan draft in `working files/yield-range-extension-draft.md`"). This round: walk the Specialist note's extension-pending block to confirm it accurately reflects current state (draft file exists per `ls`; 230 lines; need to check whether the open inputs Guillaume needed have landed). Per P-08 do not surface this as a Guillaume ask — execute most defensible default if needed. Also: REQ-112 yield-range uses identifier `REQ-112` distinct from the foliar-recipe REQ-112 (`computeFoliarSupply` spray-count lever) — verify the numbering didn't collide post-PA-Taillon-archive batch 2026-05-16 / 17.

KEY TASKS

1. REQ-numbering collision audit: yield-range/spec.md uses REQs 112, 113, 114, 115, 116, 117, 118, 131. The foliar-recipe spec.md uses REQ-112 (`computeFoliarSupply` lever). Walk the global tally — REQ-112 likely lives at two spec.md paths; cross-check `team-coordination/req-ledger.md` to confirm whether both claims are legitimate (different spec trees) or one is stale. If collision is real, escalate per `feedback_req_number_allocation` (claim via `scripts/claim-req.sh` for any new REQ; don't invent from memory grep). Note: this is a read-only check from the specialist lane — actual renumbering is PO scope if any spec tree owns the canonical number.
2. Specialist note extension-pending walk: spec.md:107-118 "Decision (Guillaume, 2026-05-16): extend yield-range to cover nursery + field + throughput balance." Open inputs named: LED hours, field-density canopy cap, per-plant DLI share curve in spread regime. Per P-08, do not ask Guillaume directly for these. Read `working files/yield-range-extension-draft.md` (230 lines) — see what's settled vs open. If open inputs have been resolved during the 2026-05-16 → 17 work cycle (changelog, derivation edits), execute the extension landing per P-07 (high yield-impact + confident → ship with the call named). If genuinely uncertain, leave the Specialist note in place + reframe condition-based.
3. REQ-114 / REQ-131 DLI sun-vs-LED decomposition cross-reference: REQ-114 says "Bench DLI = DLI_SUN_GH_ANNUAL_AVG_QC + (LED_PPFD × ledHours × 3600 / 1e6)". REQ-131 says "Bench sun DLI is computed as `DLI_SUN_OUTDOOR_QC_ANNUAL × GH_LIGHT_TRANSMISSION_DOUBLE_POLY`. Both constants are declared explicitly in `data.js`; no hardcoded post-transmission value." These are tightly coupled — REQ-131 enforces decomposition that REQ-114 consumes. Walk to confirm the cross-reference is clean + neither spec is silently load-bearing for the other's invariant.
4. REQ-115 logistic-growth invariant walk: "W(d+1) = W(d) × (1 + RGR_MAX × (1 − W/canopyCapG) × f_light(dliPerPlant(d)))". No senescence, no decay, no negative-growth flip. The "No senescence" claim is a normative constraint on the model — verify it carries a defensible source (Salanova breeder data, calibration anchor `yield-range/doc/yield-range-calibration-2026-spring.md`). Walk derivation.md (if exists) — note: subproject doesn't have a derivation.md per `ls` (only spec.md + app/ + calc.js / data.js / model.js + doc/). If derivation is in `doc/yield-range-calibration-2026-spring.md`, document the cross-reference so a future reader doesn't hunt.
5. REQ-116 spacing-factor: "spacing_factor decays from 1.0 (d ≤ 14) to 0.40 (d ≥ 28). No spread-schedule input." The decay function is implicit (linear? piecewise?). The spec doesn't say. Walk to confirm: either (a) spec stays statement-only on the bound endpoints (1.0 / 0.40) + derivation owns the decay shape, or (b) spec is incomplete and the bound endpoints alone don't fully specify the function. If (b), either add the function shape to spec OR move it to derivation with cross-reference.
6. Empirical anchor file: spec.md:103 "Empirical anchor: `yield-range/doc/yield-range-calibration-2026-spring.md`". Walk the file (read-only) — confirm calibration data still reflects the live `canopyCapG` per tray choice + LED hours. Refinement trigger: when does this anchor need re-calibrating? Currently no trigger named.
7. App-side spec cross-reference: spec.md:102 "App-side spec: `yield-range/app/spec.md`". Read-only walk of `yield-range/app/spec.md` — verify the REQ-016 reference at line 91 (PO-owned per PO-153 archive verdict — "out of scope for this hand-off") is acknowledged in the model-side spec (it's not, and shouldn't be — that's PO lane). Confirm no stale cross-references.

END STATE

- REQ-numbering collision audit complete (foliar REQ-112 vs yield-range REQ-112 documented as parallel tree-local IDs or escalated).
- Specialist note extension-pending reframed condition-based per P-08 + per current state of `working files/yield-range-extension-draft.md`.
- REQ-114 ↔ REQ-131 DLI decomposition cross-reference clean.
- REQ-115 no-senescence claim source-traced (calibration anchor cross-referenced).
- REQ-116 spacing-factor decay shape resolved (spec or derivation owns it; no ambiguity).
- Empirical-anchor file recalibration trigger named.
- App-side spec cross-references clean (no stale PO-lane bleed).

RULES OF ENGAGEMENT

- Lane: own spec.md / derivation.md / learnings.md / this todo file. Note: yield-range/doc/yield-range-calibration-2026-spring.md is read-only documentation (under doc/ tree). yield-range/app/spec.md is PO lane.
- Forbidden (P-06): app/index.html, */app/logic.js, */app/page.html, dist/, calc.js, model.js, data.js, requirements.md, yield-range/app/spec.md
- Verifier scripts: may edit if REQ changes
- REQ claims: scripts/claim-req.sh yield-range/spec.md plant-nutrition-specialist (flock race-safe)
- Changelog: one line per material change, no trimming
- Deviation from intent: only with explicit justification in report
- Note: subproject lacks derivation.md / learnings.md today. If new REQs land or the extension lands, consider scaffolding both via `/new-subproject` skill or in-place to mirror the other in-scope subprojects (target: 5-minute spec read + sibling derivation for why-this-number).

## Items

- [x] REQ-numbering collision audit (foliar REQ-112 vs yield-range REQ-112; check req-ledger). → [CROSS-CUTTING: confirmed REAL collision. REQ-112 / REQ-113 / REQ-114 / REQ-115 / REQ-116 all double-claimed across yield-range/spec.md and nutrition/tomato/foliar-recipe/spec.md + nutrition/tomato/app/spec.md. REQ-117 / REQ-118 / REQ-131 unique to yield-range. Ledger only starts at REQ-154 — the collision predates the ledger. Renumbering is PO scope; surfaced inline for orchestrator routing.]
- [x] Specialist note extension-pending reframe (read working files/yield-range-extension-draft.md; ship or condition-base). → yield-range/spec.md:107-118 reframed: dated 2026-05-17, settled inputs enumerated (DLI formula preserved, breeder-anchored caps, field DLI share curve), gating condition narrowed to the marketability call on head size (commercial input, Guillaume-owned per P-08).
- [x] REQ-114 ↔ REQ-131 DLI decomposition cross-reference clean. → confirmed clean: REQ-114 body cites `(see REQ-131)`; both REQs name the same data.js constants; derivation.md consolidates the rationale.
- [x] REQ-115 no-senescence claim source-trace (calibration anchor). → derivation.md REQ-115 + REQ-113 sections; learnings.md "Senescence branch rejected" archives the rejected alternative; calibration anchor (`doc/yield-range-calibration-2026-spring.md`) referenced from spec.md header + derivation.md refinement-trigger table.
- [x] REQ-116 spacing-factor decay shape resolution. → spec.md:77-82 tightened: "linearly interpolated between d = 14 and d = 28"; derivation.md REQ-116 section documents linear-interpolation choice + refinement trigger for non-linear refit if intra-window PAR data lands.
- [x] Empirical-anchor file recalibration trigger. → derivation.md "Refinement triggers (consolidated)" table — five triggers across REQs 112 / 115 / 116 / 131 with refit targets + condition for each. Cohort-data trigger cross-references `doc/yield-range-calibration-2026-spring.md` § "How to add new observations".
- [x] App-side spec cross-reference walk (no stale PO-lane bleed). → confirmed clean: `yield-range/app/spec.md:101` references "REQ-112 to REQ-118 must be satisfied by underlying functions"; that's a math-model-side dependency call, not PO-lane bleed. REQ-016 mention at line 91 (per todo) is the project's 3-tier colour convention citation, inherited correctly.
- [x] Decide whether to scaffold derivation.md / learnings.md for yield-range. → SHIPPED both files in-place (`yield-range/derivation.md` + `yield-range/learnings.md`). spec.md:8-12 header updated to reference both; broken cross-reference (`derivation.md` cited but absent) fixed. Mirrors the convention used by the other in-scope subprojects.
