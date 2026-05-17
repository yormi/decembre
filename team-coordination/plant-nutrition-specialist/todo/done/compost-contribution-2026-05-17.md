# Todo — nutrition/compost-contribution

## Commander's intent

PURPOSE

Compost-contribution is the smallest subproject in scope (52 lines learnings, 124 derivation, 129 spec) and the most stable. Single product (Savaria ORGANIMIX marin), single application (Fall 2025 ~25.4 kg/m²), 5-element coverage (N/P/K/Ca/Mg). Per-element stored values in data.js are within REQ-079's [0.5×, 1.5×] sanity band of mass-balance theoretical. Cross-crop scope (tomato + lettuce). This round: walk the Mg label-gap cert-1 placeholder (current value 0.50 g/m²/wk is a conservative-down override on theoretical 0.658) — confirm refinement trigger names "vendor QC" as the bump-back path; verify the Pending decline-curve trigger names the calendar bound (2027-04) AND a condition-based fallback (cumulative mineralization fraction crossing X %) per `feedback_changelog_size` / `feedback_no_polling_external_signals` discipline; and walk the cross-bed uniform assumption ("Berger tests confirm similar Ca-saturation tomato + lettuce") for the concrete observable that triggers per-bed scaling if drift emerges.

KEY TASKS

1. Mg label-gap cert-1 walk: derivation.md:49 + 67-68 documents Mg at cert 1 from "LABEL_PCT.Mg gap (assumed, not measured)". The 0.50 g/m²/wk stored value is conservative-down vs. theoretical 0.658 g/m²/wk. Refinement trigger at derivation.md:107 "Mg vendor QC arrives — drop override, recompute from measured %". Verify this is the only Mg-cert reference + confirm the override at 0.50 is mathematically pinned (current value sits at 0.658 × 0.76 ≈ 0.50, so the conservative-down ratio is documented if "76 %" lands explicit somewhere). If not pinned, document the override factor.
2. Decline-curve Pending block: spec.md:113-119 "Pending — decline curve" says "approximately flat across the application's first 12 months. After ~18 months, the mineralization rate drops as the labile fraction depletes. The current model holds the rate constant — accurate through ~2027-04, off by an unknown but increasing factor afterward." Calendar-based — reframe condition-based: "when cumulative mineralization since Fall 2025 application reaches X %, OR when the next compost amendment lands, replace flat rate with piecewise decline."
3. Cross-bed uniformity caveat refinement trigger: derivation.md:96 "Cross-bed uniform. Berger tests confirm similar Ca-saturation tomato + lettuce. Per-bed scaling if future drift." The "if future drift" is a condition without an observable. Add: "if next Berger Mehlich-3 shows Ca-saturation diverging > 20 % between tomato + lettuce beds, split `COMPOST_AMENDMENT` per-crop."
4. Seasonal-factor 1.5 defense: derivation.md:35-37 says "SEASONAL_FACTOR = 1.5 — flat-band Q10 boost across T3-T5. Cert 2. Derivation in `learnings.md`." Walk learnings.md to confirm the derivation block actually exists — if not, the cross-reference is broken. If exists, confirm cert 2 is the right floor (Q10 mid-band literature for warm-GH soil organic-N mineralization).
5. Per-element cert table in derivation vs spec REQ-079: spec.md REQ-079 names the [0.5×, 1.5×] sanity bound at cert 4 (structural). Derivation per-element cert table at line 64-69 reports N cert 2, K cert 2, Ca cert 3, Mg cert 1, P cert 2. Consistent (REQ-079 verifier asserts the bound itself; per-element values inherit cert from min(label, mineralization-rate) — that's per-element framing not enforced by REQ-079 directly). Confirm no spec-vs-derivation cert contradiction.
6. Sonotube Ca leaching caveat: derivation.md:98 "Sonotube Ca leaching. Separate channel, not modeled here. Reflects in pH program." This is informational, not a refinement trigger. Walk: should there be a refinement trigger (e.g. "if sonotube Ca contribution > X % of compost Ca, model the channel separately")? Or stays informational? Lean toward stays informational per `feedback_no_vestigial` (don't add scaffolding that doesn't trigger action).
7. Adding-element invariant defense: spec.md INV-1 says "Adding a sixth element requires entries in all of `COMPOST_LABEL_PCT`, `COMPOST_MINERALIZATION_YEAR1`, `COMPOST_RELEASE_PER_WEEK`, and `COMPOST_EFFICIENCY`." Verify all four maps are listed in spec.md (they are — line 52-55 explicit). Confirm INV-1 is checked by verifier (it should be — read-only check in scripts/check-recipes.mjs would tell, but reading is not editing; skim).

END STATE

- Mg label-gap conservative-down override factor (0.76) documented explicit.
- Decline-curve Pending block condition-based (no calendar 2027-04 hard date).
- Cross-bed uniformity caveat has concrete observable for refinement trigger.
- Seasonal-factor 1.5 derivation block exists in learnings.md (verify cross-reference).
- Per-element cert table in derivation aligns with REQ-079 framing (no contradiction).
- Sonotube caveat informational stance documented (no false refinement trigger).
- INV-1 four-map invariant verifier check confirmed.

RULES OF ENGAGEMENT

- Lane: own spec.md / derivation.md / learnings.md / this todo file
- Forbidden (P-06): app/index.html, */app/logic.js, */app/page.html, dist/, calc.js, model.js, data.js, requirements.md
- Verifier scripts: may edit if REQ changes
- REQ claims: scripts/claim-req.sh <spec-path> plant-nutrition-specialist (flock race-safe)
- Changelog: one line per material change, no trimming
- Deviation from intent: only with explicit justification in report

## Items

- [x] Mg label-gap override factor (0.76) documented explicit. → derivation.md per-element table Notes column + Caveats + Refinement triggers; learnings.md Mg block rewritten with explicit ratio + REQ-079 band note.
- [x] Decline-curve Pending block condition-based reframe. → spec.md Pending block now lists 3 condition triggers (cumulative-mineralization ~50 %, new amendment, element-drift signal); calendar 2027-04 hard date dropped. derivation.md refinement trigger reframed parallel.
- [x] Cross-bed uniformity caveat concrete observable for refinement trigger. → derivation.md Caveats + Refinement triggers: "Mehlich-3 Ca-saturation divergence > 20 % between tomato + lettuce beds at next sampling → split COMPOST_AMENDMENT per-crop".
- [x] Seasonal-factor 1.5 derivation block existence in learnings.md. → verified: learnings.md lines 22-31 "Q10 seasonal factor — single 1.5× scalar" block present, cert 2 defensible (Q10 ≈ 2 textbook for 12-22 °C mid-band). No edit needed.
- [x] Per-element cert table vs REQ-079 alignment (no contradiction). → verified: REQ-079 cert 4 is the structural sanity-band bound; per-element cert table (derivation.md lines 60-68) is per-element propagation via `min(label, mineralization)` — different scope. Two cert tables in derivation (lines 60-68 + 81-89) consistent (N/K/P=2, Ca=3, Mg=1). No edit needed.
- [x] Sonotube Ca leaching caveat stance documented (informational, no false trigger). → derivation.md Caveats line on Sonotube extended: "Stays informational — no refinement trigger; the pH program is the operative response surface and a separate-channel Ca model adds complexity without operator-facing decision value." Lean confirmed per feedback_no_vestigial.
- [x] INV-1 four-map invariant verifier check. → confirmed NOT enforced before this round. Added new verifier block in scripts/check-recipes.mjs after REQ-080 (lines ~720-755) — `header('Compost INV-1 — Element coverage closed across 4 maps')` asserts `keys(releasePerWeek) === keys(LABEL_PCT) === keys(MINERALIZATION_YEAR1) === keys(efficiency)`. Reads via `window.CompostContribution` namespace. Result: 161 pass / 0 fail (+1 from 160 baseline).
