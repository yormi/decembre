# Todo — nutrition/tomato/sidedress-recipe

## Commander's intent

PURPOSE

Sidedress-recipe is structurally simple — N-only by design, mass-balance per stage, product-agnostic algorithm with three Ca-aware product options (FarinePlumes default, AlfalfaMeal alternative, Actisol gated out by REQ-089). Spec has 4 REQs (087, 088, 089, INV-1) at 147 lines and derivation at 182 lines. This round: walk the Eco-luzerne cert-TBD gate (spec.md:144-146 names "Eco-luzerne 3-0.5-2 cert TBD pending Ecocert evaluation"; check if cert has landed and amend in place per `feedback_no_vestigial`), document the per-product cert defense for `eff` values (Sonneveld/literature anchor with cert 2-3), and verify Hard-zero T1/T2 behavior is consistent with ACCEPTED_EXCESSES in `nutrition/tomato/spec.md` so the "bank-N-for-later" exception doesn't drift.

KEY TASKS

1. Eco-luzerne cert status walk: spec.md:144-146 says "Eco-luzerne 3-0.5-2 cert **TBD** pending Ecocert evaluation in `nutrition/doc/eco-luzerne-3-0-5-2/`". Read `nutrition/doc/eco-luzerne-3-0-5-2/` (any CLAUDE.md or status file) — if cert has landed, amend spec.md in place per `feedback_no_vestigial`. If cert still pending, reframe condition-based (no calendar) + name the action when cert lands. Per P-08 do not surface a Guillaume ask on this.
2. Hard-zero T1/T2 cross-reference: derivation.md:124-128 explains T1/T2 0-output as "intentional, banking N for later, documented in ACCEPTED_EXCESSES adjacent to `nutrition/tomato/spec.md`". Cross-check the actual ACCEPTED_EXCESSES entry — is the N-banking-T1/T2 case actually documented there, or is the cross-reference stale? Per P-06 do not edit nutrition/tomato/spec.md (PO scope); flag mismatch for PO if found.
3. AlfalfaMeal "default product swap" prose reframe: derivation.md:113-115 reads "Default product swap to AlfalfaMeal (operator decision, requires `/retire-recipe`) → N drops 0.75 → 0.65 (alfalfa cert 2)." This is the post-2026-05-17 Umbrella scrub clean (operator-decision is product-swap, not STORED-pressure). Verify it's not framed as "team should swap" / "consider swapping" — should read informational only (cert-shift if swap happens, no recommendation).
4. Single-product blending caveat: derivation.md:138-139 "No blending; run twice and sum for a 50/50 mix. Blend optimization not modeled." If blending has ever been considered + rejected, that belongs in `learnings.md`, not derivation.md (cleaner separation). Walk to confirm position.
5. Mineralization-efficiency cert defense: derivation.md table at lines 79-85 names `Actisol.eff (N) = 0.60 cert 3`, `FarinePlumes.eff (N) = 0.75 cert 3`, `AlfalfaMeal.eff (N) = 0.65 cert 2`. The cert 2 on AlfalfaMeal is "literature, less Décembre experience." Confirm the cert defense for FarinePlumes 0.75 is documented as "Décembre experience" / "warm-GH steady-state" — currently at line 84 "Animal protein, 70-85 % mineralizes in 6-8 weeks (warm GH soil)" — defensible cert 3 framing. Verify nothing else in the tree carries an inconsistent cert claim on the same constant.
6. REQ-089 Ca-aware gate trigger: spec.md:115-128 + derivation.md mention REQ-089 gates Actisol out on Ca-saturated soil. Walk for the refinement trigger: "if soil Ca drops below saturation, gate releases" — currently at derivation.md:111-113. Confirm it names a concrete observable (Mehlich-3 Ca threshold? CEC saturation percent?) rather than "if Ca drops".
7. Cold-shoulder season caveat: derivation.md:88-90 + 142-143 mention "Cold shoulder seasons would reduce ~30-50 %" and "No cold-season scalar. Mineralization slows ~30-50 % below 12 °C soil." Two places carry the same caveat. If structural duplication, consolidate; if emphasis at different decision points, document the cross-reference.

END STATE

- Eco-luzerne cert status reflects current reality (landed → amended in place; still pending → condition-based).
- Hard-zero T1/T2 cross-reference to ACCEPTED_EXCESSES verified or PO-flagged.
- AlfalfaMeal product-swap prose informational (no recommendation framing).
- Blending consideration archived in learnings.md if previously deliberated.
- Mineralization-eff cert defense documented per product, consistent across spec + derivation.
- REQ-089 gate trigger names concrete observable (Mehlich-3 threshold).
- Cold-shoulder caveat consolidated.

RULES OF ENGAGEMENT

- Lane: own spec.md / derivation.md / learnings.md / this todo file
- Forbidden (P-06): app/index.html, */app/logic.js, */app/page.html, dist/, calc.js, model.js, data.js, requirements.md
- Verifier scripts: may edit if REQ changes
- REQ claims: scripts/claim-req.sh <spec-path> plant-nutrition-specialist (flock race-safe)
- Changelog: one line per material change, no trimming
- Deviation from intent: only with explicit justification in report

## Items

- [x] Eco-luzerne cert status walk + condition-based reframe if still pending. → `nutrition/doc/eco-luzerne-3-0-5-2/` directory does not exist; cert still pending. `spec.md:143-150` Inherited-specs REQ-022 bullet + `derivation.md` Caveats Eco-luzerne entry reworded filesystem-conditioned ("directory does not yet exist as of last scan", no calendar, no Guillaume nudge per P-08).
- [x] Hard-zero T1/T2 ACCEPTED_EXCESSES cross-reference verification (flag PO if stale). → Verified valid. `app/index.html:460-470` contains T1.N + T2.N ACCEPTED_EXCESSES entries matching `derivation.md:127-137` cross-reference. No edit needed.
- [x] AlfalfaMeal product-swap prose informational-only audit. → `derivation.md:118-119` reads "Default product swap to AlfalfaMeal (operator decision, requires `/retire-recipe`) → N drops 0.75 → 0.65 (alfalfa cert 2)" — already informational (cert-shift if swap, no recommendation framing). No edit.
- [x] Blending consideration → learnings.md if previously rejected. → New `learnings.md` § "Rejected: blend optimization (mixed-product per-stage dose)" added; `derivation.md:147-150` caveat re-pointed to the new learnings entry.
- [x] Mineralization-eff cert defense triangle. → `derivation.md` Mineralization-efficiencies section gained explicit per-product cert defense block (FarinePlumes 0.75 cert 3 / AlfalfaMeal 0.65 cert 2 / Actisol 0.60 cert 3) so each constant defensible from the doc alone. **CROSS-CUTTING:** `data.js:66` says "cert 4" on FarinePlumes 0.75 while `derivation.md:84` (and now the per-product defense block) says cert 3 — flagged for coder reconciliation.
- [x] REQ-089 gate trigger — concrete observable (Mehlich-3 / CEC saturation). → `derivation.md:113-116` already names "Mehlich-3 Ca < 7 500 kg/ha (back near pre-greenhouse 5 956 kg/ha baseline; current 10 989 kg/ha tomato + 10 612 kg/ha lettuce). Equivalent operator signal: base saturation Ca% < 70 % of CEC. Whichever resolves first on the next Berger Labs panel." Concrete, defensible. No edit.
- [x] Cold-shoulder season caveat consolidation. → Verified non-duplicative: `derivation.md:88-90` is a **pointer** from the Mineralization-efficiencies section into the Caveats list; the 30-50 % number itself lives only at `derivation.md:153-155`. Clean cross-reference. No edit.
