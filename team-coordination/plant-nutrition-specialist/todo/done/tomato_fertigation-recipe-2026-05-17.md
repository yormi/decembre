# Todo — nutrition/tomato/fertigation-recipe

## Commander's intent

PURPOSE

Fertigation-recipe is the heaviest-touch subproject this batch — Stage-7 carve moved `wireFpFertigation` + `computeStageRecipe` to subproject files; the SME-bank entry adopted Path 2 (no sizer subtraction); REQ-141 active-channels-only commitment formalized in soil-contribution; Mo carve-out to fertigation landed; Solubore renaming pass cleaned product identity; PA Taillon anchor was repaired against STORED (audit-trail). This round: close the second-order hygiene that the heavy edits exposed. The derivation table at lines 67-75 reports K demand 6 000 → demand_to_bed 6 667 → kSulfate 5 568 g, but the cross-reference to REQ-013 / REQ-014 active-channels supply sum is not in the derivation — Bilan reader has to bounce to `nutrition/tomato/spec.md` to see whether the FP target reads under or over the 0.9-1.3× envelope at peak T5. Pull that cross-reference inline. Also: the inherited-spec block at fertigation-recipe/spec.md:265-276 names REQ-141 + REQ-013/014 + REQ-022 + REQ-002 + REQ-061 — verify each citation still tracks current spec text, especially REQ-141 (which just got rewritten in the Path 2 entry).

KEY TASKS

1. REQ-141 cross-reference verification: walk every reference to REQ-141 in `nutrition/tomato/fertigation-recipe/spec.md` + `derivation.md` + `learnings.md`. Confirm citations align with the new active-channels-only framing (`soil-contribution/spec.md:109-150`). The "rejected alternative in `nutrition/soil-contribution/learnings.md` for the path-1 subtract-bank-from-sizer alternative" mention in fertigation-recipe/spec.md:275-276 — verify it points to the right learnings.md entry header (currently "Path 1 — Subtract bank K + Mg from the fertigation sizer (rejected 2026-05-17)").
2. Demand-to-bed cross-reference: derivation.md lines 67-75 per-element T5 table doesn't say "this target sums with sidedress + compost + foliar to give X% of plant demand at T5; vs REQ-013 floor of 0.9× and REQ-014 cap of 1.3×, the active-channels sum reads Y." Add the cross-reference inline so a cold reader sees REQ-013/014 envelope status without bouncing.
3. PA Taillon FP-vs-STORED audit-trail walk: the spec.md:9-14 preamble + learnings.md:92 "STORED was never on this anchor (audit-trail repair 2026-05-16)" entry land together. Confirm no remaining "STORED is on PA Taillon's recommendation" prose anywhere in the subproject — grep `grep -nE "PA Taillon|Haifa-heritage" nutrition/tomato/fertigation-recipe/`. Either correctly framed (FP-only anchor + Haifa-heritage STORED) or amended in place.
4. Mo carve-out completeness: REQ-061 amendment 2026-05-16 moved Mo from foliar to fertigation. Confirm fertigation-recipe spec / derivation / data carry the Mo branch consistently — derivation.md:125 names it ("Stored-recipe moves on both channels gated on `/retire-recipe` audit") but the algorithmic detail (Mo dose at what mass? Mo not in K/Mg/B sizer formula — handled separately?) might live elsewhere. Walk and document explicitly: is Mo a STORED-only fertigation entry with no FP target, or is it derived?
5. REQ-155 uptake-factor extension: factors today are K 0.90, Mg 0.85, B 0.80 all cert 2. Walk `data.js` (read-only) to verify these are the only entries; if `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL` carries Mo / N / Ca / P / micros entries that are 1.0-defaults, document the default-1.0 carve-out in the derivation explicitly. If absent and used only for K/Mg/B branches, derivation table already correct — note as verified.
6. Solubore product-identity scrub: grep for "boric acid" / "H₃BO₃" / "17.5" in `nutrition/tomato/fertigation-recipe/`. Expected zero live references (per B4 verdict 2026-05-16); residual generic-chemistry mentions (H₃BO₃ non-ionic at pH 6.2-7.4) are correctly preserved. Confirm.
7. Refinement-trigger walk: derivation.md refinement triggers — confirm none fire on STORED-vs-FP deltas (P-13). All triggers should fire on tissue / soil-test / SME data / lab return / inventory event. The 2026-05-17 Umbrella scrub PASS suggests this is clean; confirm by grep.

END STATE

- spec.md cross-references to REQ-141 + REQ-013/014 + REQ-022 + REQ-061 + REQ-002 + REQ-098 all align with current downstream spec text.
- derivation.md per-element T5 table includes REQ-013/014 envelope status inline.
- Zero live "STORED is on PA Taillon" prose; only FP-target framing for PA Taillon's anchor.
- Mo carve-out documented at the algorithmic level (FP target / no-FP-target / STORED-only path explicit).
- REQ-155 default-1.0 carve-out documented if applicable.
- Solubor product-identity references all current; H₃BO₃ generic chemistry preserved.
- Refinement triggers all fire on tissue / soil / SME / lab / inventory; zero on STORED-vs-FP.

RULES OF ENGAGEMENT

- Lane: own spec.md / derivation.md / learnings.md / this todo file
- Forbidden (P-06): app/index.html, */app/logic.js, */app/page.html, dist/, calc.js, model.js, data.js, requirements.md
- Verifier scripts: may edit if REQ changes
- REQ claims: scripts/claim-req.sh <spec-path> plant-nutrition-specialist (flock race-safe)
- Changelog: one line per material change, no trimming
- Deviation from intent: only with explicit justification in report

## Items

- [x] REQ-141 cross-reference verification → VERIFIED. fertigation-recipe/spec.md:269-276 path-1 rejection pointer aligns with soil-contribution/learnings.md:9 heading "Path 1 — Subtract bank K + Mg from the fertigation sizer (rejected 2026-05-17)". No edits needed.
- [x] Demand-to-bed table — added active-channels-sum vs REQ-013/014 envelope subsection in derivation.md (post per-element T5 table). Shows bed-side ratio (1.11×/1.18×/1.31×) + plant-side ratio (1.00×/1.00×/1.05×) at T5 + T1-T2 Mg overshoot framing.
- [x] PA Taillon FP-vs-STORED audit-trail walk → VERIFIED clean. spec.md preamble + derivation.md L60/L208/L217 + learnings.md PA-anchor section all correctly scoped to FP target. learnings.md:92 explicit "STORED was never on this anchor". derivation.md cert-table reframed in same pass (B cert no longer named as "PA Taillon recommendation").
- [x] Mo carve-out algorithmic-level documentation → added "Mo algorithmic detail" + "Mo and the FP-pin (REQ-154)" subsections in derivation.md. spec.md amended: REQ-098 statement now says Mo bypasses mass-balance (flat 0.5 g/wk floor); REQ-099 mirrors NaMolybdate in FP shape; REQ-154 covers all four products by construction. Verifier extended for NaMolybdate equality. Function return shape updated in Contract section to {kSulfate, mgSulfate, solubore, naMolybdate}.
- [x] REQ-155 default-1.0 carve-out → documented inline in the Mo algorithmic-detail block (data.js confirmed K/Mg/B only; Mo gets default 1.00 via `uptake.X || 1` fallback in calc.js; anion, no Ca-competition argument).
- [x] Solubor product-identity scrub → grep `boric acid|17\.5` zero live hits. Only generic-chemistry "H₃BO₃ non-ionic" references kept (correct — Solubor hydrolyzes to H₃BO₃ in solution; that's product chemistry, not the product identity).
- [x] Refinement-trigger STORED-vs-FP walk → all triggers fire on tissue / soil-test / model-input / SME data / lab return / inventory event. Zero on STORED-vs-FP drift. Verified by grep on derivation.md "Refinement triggers" section (lines 213-220) + REQ-155 symmetric triggers (L102-106).
