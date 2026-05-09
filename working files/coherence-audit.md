# Coherence audit — nutrient model

Date: 2026-05-05. Companion to `nutrient-model-reference.md`. Cert 0-5 per CLAUDE.md.

## Summary

**21 findings.** By severity: **5 blocking** (model produces wrong action or violates organic cert) · **11 important** (model misleads but won't cause immediate harm) · **5 minor** (cleanup / cert-coverage / staleness).

**Top 3 priorities:**
1. **Finding 8** — Lettuce predicted CE during fertigation periods is ~5.9 mS/cm (above the 2.7 lettuce ceiling, 3× the 1.2-1.8 target band). Either the team is delivering above-tolerance salt loads when the barrel runs, or the model conventions are wrong. **Blocking** if the math is right.
2. **Finding 9** — `CaCl₂ Teris grade` (Spray B) Ecocert status is explicitly "not yet verified" in code, yet it is in active weekly recipe — REQ-002/REQ-022 violation. **Blocking**.
3. **Finding 2** — At T5, Bilan shows K supply ≈ 11 461 mg/m²/wk vs demand 5 250 (ratio 2.18×) and Mg ratio 4.27×. Future REQ-014 (luxury/waste guard ≤1.3×) flags both — current recipe over-feeds at peak season. **Important**.

---

## Finding 1 — Demand split-sum reconciliation passes by construction; not an independent check

**What's inconsistent:** The code comment at `index.html:3140-3160` claims `BIOMASS[T5] = TOMATO_REMOVAL × 1500 − TOMATO_FRUIT_EXPORT × 1500` so the split sum matches whole-plant ratio "exactly by construction" at yield = 1.5 kg/m²/wk. Confirmed numerically: every element shows Δ = 0%. This is *not* a sanity check — it's an identity. The "split-sum reconciliation" as written can never fail, because the right-hand side is computed from the left-hand side. The audit task asked "does it match within ±10% per element at yield 1.5?" — answer is yes, but only because the numbers were back-solved.

**Where:** `index.html:3140-3160` (comment), `index.html:3203-3290` (constants).

**Severity:** minor (model is internally consistent, just claims an independent check it doesn't actually perform)

**Options to resolve:**
- Option A: Add a real cross-check at a non-target yield (e.g., 0.5 or 2.5 kg/m²/wk). The split sum *should* drift from `TOMATO_REMOVAL × yield` because biomass is fixed per stage but fruit term scales with yield. Document the expected drift shape and use that as the actual sanity check.
  - Pros: turns a tautology into a real assertion. Catches future errors where someone edits one constant without the other.
  - Cons: requires picking a "credible drift" range (cert 2-3); not as crisp as the current "exact" claim.
- Option B: Strip the "sanity check passes" framing from the comment. State plainly: "T5 biomass values are derived from the whole-plant ratio at target yield; the identity is by construction."
  - Pros: honest. No model change.
  - Cons: removes a feel-good check.
- Option C: Pin BIOMASS[T5] independently (literature/Sonneveld vegetative ratios) and keep the cross-check as a real ±10% guard.
  - Pros: independent anchor; cross-check has teeth.
  - Cons: previous Sonneveld bottom-up gave 30-70% gap on P/K (`index.html:3168-3177`) — anchoring there reintroduces that gap.

**Recommendation:** Option B. The reconciliation as written *is* the right design for production (you want the two views to agree at target). Just stop calling it a sanity check.

---

## Finding 2 — K and Mg fertigation supplies are 2-4× T5 demand at target yield (luxury feeding)

**What's inconsistent:** With T5 recipe (K₂SO₄ 3 489 g + MgSO₄ 1 396 × 1.5 = 2 094 g per week over 382.9 m²) plus side-dress + soil mass-flow at week 18 (`SME_TOMATO_PPM` × 25.5 L/m²/wk full canopy), at yield 1.5 kg/m²/wk:

| El | Demand | Supply | Breakdown | Ratio |
|---|---|---|---|---|
| K | 5 250 | 11 461 | fert 3 781 + sd 232 + soil 7 448 | **2.18×** |
| Mg | 600 | 2 560 | fert 539 + soil 2 021 | **4.27×** |
| Ca | 2 250 | 6 106 | soil 6 085 + foliar 21 | **2.71×** |
| N | 3 750 | 4 162 | sd 2 884 + soil 1 278 | 1.11× |
| P | 600 | 136 | sd 108 + soil 28 | 0.23× (locked) |

REQ-014 (luxury/waste guard, target spec) sets the upper bound at 1.3×. K, Mg, Ca all exceed it materially. The Bilan reports these gaps as "couvert ✅" rather than flagging the over-supply.

**Where:** `index.html:1655-1660` (`TOMATO_STAGES`), `index.html:1699` (`LETTUCE`), `index.html:3613-3619` (`statusFor` only flags under-supply, not over-supply), my Python reconciliation (above).

**Severity:** important (not immediately harmful — soil K reservoir absorbs excess; but K-Mg-Ca antagonism risk is real, and REQ-014 will fail when wired)

**Options to resolve:**
- Option A: Cut K₂SO₄ multiplier toward 0.5× at T5 (recipe halved). Soil mass-flow alone supplies 7 448 mg K/m²/wk — fertigation fills the gap when soil drops. Empirically: SME K is 292 ppm = top of 35-300 spec range, no risk of K depletion in this season.
  - Pros: addresses real over-feeding; ~$200-400/yr K₂SO₄ savings; reduces irrigation CE; reduces K-Mg antagonism risk.
  - Cons: requires recalibrating after sulfur lands and pH/K equilibrium shifts; need tissue test to confirm K reserve adequacy.
- Option B: Cut MgSO₄ multiplier from 1.5× to 1.0× (back to PA Taillon baseline). Mg supply still 1 707 mg/m²/wk = 2.8× demand — still over but less pathological.
  - Pros: addresses Mg specifically, where the 1.5× multiplier appears arbitrary; removes one variable from the tuning surface.
  - Cons: doesn't fix the K problem; if Mg-K antagonism is the real bottleneck we may need MORE Mg, not less.
- Option C: Add stage-specific multipliers, only running at 1× at T5 when soil K is high; ramp back to 1.5× when SME K drops below ~150 ppm.
  - Pros: data-driven; directly responds to SME readings.
  - Cons: requires SME refresh logic; adds operational complexity (REQ-026 territory — a feedback loop).
- Option D: Leave the recipe alone, document the over-supply explicitly in the Bilan as `acceptedDeficit`-equivalent annotation ("K luxury feeding accepted to maintain pantry depth").
  - Pros: zero operational change; ack the choice.
  - Cons: REQ-014 still fails when wired; doesn't recover the input cost.

**Recommendation:** Option A or C — but only after a tissue test confirms K luxury isn't masking another issue. Don't act blindly. (Cert 3 on the over-supply finding because soil mass-flow estimate at week 18 is sensitive to the 25.5 L/m²/wk transpiration assumption.)

---

## Finding 3 — A↔B "fer + P" warning text references P, but Spray B no longer contains P

**What's inconsistent:** UI warning at `index.html:992`: "le fer (A) ou le calcium (B) réagit avec les autres sels et précipite, bouchant les buses." The cleanup-step Pourquoi at `index.html:1057`: "fer + sulfates ou Ca = précipité qui bouche la buse." The legacy "Never mix A+B (Fe+P precipitate)" framing referred to the old Spray B that contained P (~April pre-29). After 2026-04-29, Spray B is **CaCl₂ only** — no P. The actual current incompatibility is:

1. **Ca²⁺ + SO₄²⁻ → CaSO₄ (gypsum)** — A has MnSO₄/ZnSO₄/CuSO₄ as the SO₄²⁻ source. Spray B has 27 g/15 L Ca²⁺. Moderate Ksp; gypsum precipitates rapidly above ~2.4 g/L combined ion mass. With Spray A at ~3.7 g/L total salts and Spray B at 1.8 g/L Ca, mixed in one tank you'd cross the gypsum line.
2. **Fe-chelate + free Cu²⁺ → ligand swap** (relevant when Iron DL arrives — currently FeSO₄ bridge, not chelated). Mixing chelated Fe with free Cu²⁺ destabilizes the chelate.
3. **Ca²⁺ + Cl⁻** alone in B is fine (CaCl₂ is fully soluble at 5 g/L easy); the issue arises only when mixed with anion-bearing Spray A.

The current warning copy is correct in that *something* precipitates, but it cites the wrong chemistry. A team member reading "le calcium réagit avec les autres sels et précipite" gets a vague mental model.

**Where:** `index.html:992` (UI), `index.html:1057` (cleanup), `index.html:2332` (correct chemistry in code comment: "Ca²⁺ + sulfates → gypsum"), `index.html:2487-2488` (note that the spray-card chemistry note was *removed* as redundant — but the wrong-chemistry warning remained).

**Severity:** minor (operationally harmless — team won't mix A+B anyway; but documentation correctness matters for trust)

**Options to resolve:**
- Option A: Update the team-facing warning to: "Spray A contient des sulfates · Spray B contient du calcium · mélangés ils forment du gypse (CaSO₄) qui bouche les buses. Garder dans des sacs distincts."
  - Pros: correct chemistry, brief, French.
  - Cons: minor doc edit.
- Option B: Update warning to mention BOTH gypsum and (future) Fe-chelate-Cu issue: "Ne jamais mélanger : (1) le Ca de B avec les sulfates de A → gypse; (2) le Cu de A avec un chélate de Fe (quand Iron DL arrive) → échange de ligand. Sacs distincts."
  - Pros: future-proofs for Iron DL arrival.
  - Cons: longer; second mechanism is hypothetical until Iron DL is in.
- Option C: Leave it.
  - Pros: zero work.
  - Cons: cumulative misinformation; REQ-030 (`INCOMPATIBLE_RECIPES`) future spec wants explicit pair declarations — this warning is the team-facing surface of that.

**Recommendation:** Option A. Defer Fe-chelate-Cu wording until Iron DL is actually in stock.

---

## Finding 4 — Spray A (Wed) sulfates land 2 days before Spray B (Fri) CaCl₂ — wash-off / leaf-residue interaction undocumented

**What's inconsistent:** Schedule: Spray A on Wed, Spray B on Fri (`index.html:990`, `2417-2419`). Between sprays, dried Spray A residue on leaves contains sulfates (Mn, Zn, Cu). When Spray B's CaCl₂ solution lands Friday, it dissolves residue + Ca²⁺ on the same leaf surface — Ca²⁺ + SO₄²⁻ can form a thin gypsum haze on leaves. REQ-029 lists this pair explicitly. The app does not document this interaction or recommend a leaf-rinse step between sprays.

In practice it's likely benign: sulfate residue is small (a few mg/m² leaf area after coverage discount), and gypsum haze on leaves is cosmetic, not phytotoxic. But the interaction is asymmetric — applying B then A 2 days later (the alternate ordering, which doesn't currently happen) would have less risk because Ca residue is more easily washed off than sulfate residue.

**Where:** `index.html:2415-2419` (schedule), `index.html:2332` (gypsum chemistry), no documentation of the Wed→Fri residue interaction.

**Severity:** minor (cosmetic only at current doses; no observed phytotoxicity reported)

**Options to resolve:**
- Option A: Document the interaction in code comments only (not user-facing). Note: "Wed A residue × Fri B CaCl₂ → trace gypsum on leaves; benign at current 22-22-7-4-1 g doses + 30% coverage; revisit if doses scale 2-3×."
  - Pros: traceability without team-friction.
  - Cons: relies on future Claude/user to find it.
- Option B: Swap to A on Fri, B on Wed. Ca residue washes off easier than sulfate; sulfate-after-Ca avoids the haze.
  - Pros: chemically cleaner.
  - Cons: changes operational habit; might break other scheduling logic. Cert 2 on the actual benefit (no measurement).
- Option C: Leave unchanged.
  - Pros: zero change; observed harmlessness.
  - Cons: technical debt.

**Recommendation:** Option A. Effect is theoretical at current doses; document for future.

---

## Finding 5 — Lettuce demand model entirely absent — `LETTUCE` fertigation recipe is ungrounded

**What's inconsistent:** `LETTUCE = { mgSulfate: 467, kSulfate: 2996, feSulfate: 7.5 }` per 100 m²/wk (`index.html:1699`). For 136.8 m² that's:

- K₂SO₄ 4 098 g/wk → K 1 700 g/wk = **12.4 g K/m²/wk = 12 400 mg K/m²/wk**
- MgSO₄ 639 g/wk → Mg 63 g/wk = 0.46 g/m²/wk = **460 mg Mg/m²/wk**
- FeSO₄ 10.3 g/wk → Fe 2.05 g/wk = 15 mg/m²/wk

Salanova published uptake (cert 3): ~3 g K/m²/wk peak, ~0.5 g Mg/m²/wk, ~10 mg Fe/m²/wk. The K rate is **~4× a typical Salanova K demand**. There is no demand model in code (`BIOMASS_DEMAND` is tomato-only; `calcNutrSupply` hardcoded to tomato area; Bilan tomato-only). So the recipe is ungrounded and cannot be sanity-checked.

**Where:** `index.html:1699` (constant), `index.html:3201` (`BIOMASS_DEMAND` tomato-only), `index.html:3505-3519` (`calcNutrDemand` only TOMATO_FRUIT_EXPORT), `index.html:3522` (`calcNutrSupply` hardcoded `TOMATO_NUM_BEDS * TOMATO_BED_AREA`).

**Severity:** important (recipe likely over-feeds; no model to detect; ties into Finding 8 below — predicted CE on lettuce is way off-band)

**Options to resolve:**
- Option A: Add `LETTUCE_BIOMASS_DEMAND` constant + `lettuceCalcNutrDemand()` + lettuce branch in Bilan. Build minimum viable: lettuce uptake table for cycle stages (germination, croissance, finition).
  - Pros: closes the model loop; surfaces the over-feed; structurally consistent with the tomato pattern.
  - Cons: ~half-day of work; requires picking a Salanova uptake source (USDA / DLF Pickseed / local trial data — cert 2-3).
- Option B: Cut `LETTUCE.kSulfate` from 2996 to ~750 g/100 m²/wk (4× reduction) based on rough Salanova K demand. Defer demand model.
  - Pros: addresses the immediate over-feed; stops the lettuce CE issue (Finding 8).
  - Cons: still ungrounded; no way to verify; risks under-feeding the 150-200 g/plant push target.
- Option C: Document as known-deficit (not modeled), keep recipe at empirical "what worked", skip the demand model until pH is fixed and model rebuild begins.
  - Pros: minimal effort.
  - Cons: recipe stays ungrounded; CE problem stays.

**Recommendation:** Option B in the next 2 weeks (close the CE problem fast); Option A when the recipe-model REQ-010 work begins.

---

## Finding 6 — Iron coherence: 4 separate Fe channels with mismatched effective doses

**What's inconsistent:** Fe currently delivered through:

1. **Nursery fertigation FeSO₄** 15 mg/L = 1.41 g/wk for 75 trays (`index.html:2528-2530`). Acidic peat substrate → ~70-90% effective. Cert 4.
2. **Lettuce production fertigation FeSO₄** 7.5 g/100 m² (`index.html:1699`). At pH 7.4 in beds → **~10-20% effective** (`index.html:1692-1696`). 9 g Fe applied/100 m²/wk × ~15% ≈ 1.4 g Fe/100 m² absorbed. Cert 3.
3. **Foliar Spray A — Iron DL** 150 mL/15 L (cert 3) → 9 g Fe/wk for 383 m². With 30% coverage (no yucca) → ~2.7 g Fe absorbed for whole tomato area. Cert 3.
4. **Foliar Spray A — FeSO₄ bridge** 80 g/15 L when Iron DL not yet received → 16 g Fe/wk × 30% coverage → ~4.8 g Fe absorbed. Cert 4.

The lettuce fertigation FeSO₄ is acknowledged in code as ~10-20% effective (`index.html:1692-1696`). Per the Cadre framework page, FeSO₄ in fertigation at pH 7.4 is in the "do not fertigate" red zone (`index.html:1620-1626`). Yet `LETTUCE.feSulfate = 7.5` keeps it in the recipe with the rationale "cheap and useful for stretched cycles" (`index.html:1684-1696`). The framing inside the constant comment is "9 g Fe applied → 1-2 g absorbed by ~2500 plants = 0.4-0.8 mg Fe per plant. Closes the ~0.5 mg/plant deficit between nursery loading and 6-week harvest." Cert 2 on the per-plant deficit math.

The model is internally honest (acknowledges ~15% efficiency), but the recipe contains a product the Cadre framework recommends *not* fertigating.

**Where:** `index.html:1684-1696` (comment), `index.html:1699` (constant), `index.html:1620-1626` (Cadre framework "do not fertigate"), `index.html:2295` (lettuce barrel includes FeSO₄ "en dernier"), `index.html:1522` (Cadre table row showing 10-20%).

**Severity:** important (decision-coherence issue: app says "don't fertigate Fe" *and* recipe says "fertigate Fe")

**Options to resolve:**
- Option A: Drop `feSulfate` from `LETTUCE`. Rely on nursery loading + production foliar (when foliar comes back for lettuce).
  - Pros: aligns recipe with Cadre framework. Removes the ~10g/wk wasted product.
  - Cons: leaves stretched cycles (4-6 wk lettuce) with no Fe replenishment after nursery load runs out at ~3 wk. Per the comment, this closes a ~0.5 mg/plant deficit.
- Option B: Keep as is, accept ~85% waste for the 15% that lands. Document explicitly as `decorative: false, accepted: { reason: '15% × $X cheap; closes nursery-to-harvest gap until pH < 6.5' }`.
  - Pros: zero operational change; honest annotation.
  - Cons: spreads the rationale across 3 places; team mental model says "Fe doesn't fertigate" but here it does.
- Option C: Replace lettuce production FeSO₄ with re-introduced foliar Spray A on lettuce (the Spray A that was removed 2026-04-29). Cycle-tail Fe top-up via foliage at pH 5.5 leaf surface, not pH 7.4 root zone.
  - Pros: matches Cadre framework. Foliar is 3-5× more effective than fertigation at this pH.
  - Cons: reintroduces the lettuce foliar workflow, which was simplified out 2026-04-29. ~10-15 min/wk additional labor. Rationale for removal (`index.html:2370-2374`) was that nursery loading + production fertigation are sufficient for short cycles — true for ≤3 wk cycles, less so for 4-6 wk crisis-stretched cycles.

**Recommendation:** Option B until cycles return to ≤3 wk; revisit when crisis stretch ends. Add the explicit annotation as noted; current code half-acknowledges this but doesn't formalize.

---

## Finding 7 — Side-dress P (Actisol) at pH 7.4 — `SIDEDRESS_MIN_EFF.Actisol_P = 0.50` ignores Ca-P precipitation

**What's inconsistent:** `SIDEDRESS_MIN_EFF.Actisol_P = 0.50` (`index.html:3341`). Comment immediately above (`index.html:3336-3337`) says: "pH 7.4 also locks a portion of mineralized P as Ca-phosphate before plant uptake." But the constant is the same 0.50 used at any pH — the lockout is acknowledged in prose but not in math. At pH 7.4 with SME P at 1.1 ppm and Ca at 238 ppm, freshly mineralized phosphate from Actisol breakdown encounters Ca²⁺ in solution before plant uptake. Realistic effective availability is **5-15%** (per Cadre framework, `index.html:1531-1534` — "P (toute forme) 5-15%").

Mehlich-3 P bank is already 558-678 kg/ha (`index.html:3883/3891`) — massively above the 200-400 target band. Adding more P via Actisol at pH 7.4 deposits P into a reservoir that's already overflowing, in a chemistry that won't release it. The granular Actisol is N-effective and K-effective; the P term is decorative until pH drops.

REQ-018 future spec ("no decorative products at current pH") catches this when wired. REQ-020 ("lockout gate on passive supply") catches the soil P side. The side-dress P ratio (0.50) is the only place where pH lockout is *not* applied.

**Where:** `index.html:3339-3344` (`SIDEDRESS_MIN_EFF`), `index.html:3590` (`P: sd.actisol_g * PRODUCT_PCT.Actisol_P * SIDEDRESS_MIN_EFF.Actisol_P * sdAreaFactor` — no pH multiplier), `index.html:3336-3337` (acknowledged in comment, not in code).

**Severity:** important (Bilan over-states P supply from sidedress by ~3-10×; leads team to think P is partially covered when it's actually not)

**Options to resolve:**
- Option A: Multiply `SIDEDRESS_MIN_EFF.Actisol_P` by a pH-aware factor when `phLocked === true`. Use 0.20 (40% of base mineralization × ~50% precipitation loss = 0.10 effective, but Cadre says 5-15% so use 0.10 as midpoint). Recompute supply.P at sidedress accordingly.
  - Pros: Bilan becomes honest; surfaces the P deficit clearly; aligns with Cadre framework.
  - Cons: requires pH-response curve work earmarked for REQ-017; risks understating P if some fraction is taken up before precipitation.
- Option B: Accept the over-statement, document explicitly: comment says lockout, math doesn't apply it, deferred to REQ-017 implementation.
  - Pros: zero math change.
  - Cons: Bilan misleads.
- Option C: Set `Actisol_P_pH_locked = 0.05` (5% effective at pH 7.4) and `Actisol_P_pH_unlocked = 0.50`; switch on `phLocked`. Quick, no curve work.
  - Pros: surfaces the lockout; minimal code; consistent with binary `phLocked` checkbox in Bilan UI.
  - Cons: hard step rather than a curve; cert 3 on 0.05.

**Recommendation:** Option C. Match the binary `phLocked` checkbox UX and ship the honest math now; refine to a curve when REQ-017 lands.

---

## Finding 8 — Lettuce predicted CE during fertigation periods is ~5.9 mS/cm — well above the 2.7 ceiling

**What's inconsistent:** Computed predicted in-irrigation CE for lettuce fertigation, week 18 (peak season, ~12 740 J/cm²/wk):

- Weekly irrigation volume (whole 136.8 m² lettuce): ~3 486 L
- Stock barrel volume: weeklyL/3 × 0.02 = **23.2 L**
- K₂SO₄ in stock: 4 098 g / 23.2 L = **176.4 g/L stock concentration** (above 100 g/L cap → would not fully dissolve)
- Irrigation K₂SO₄ at 2% Dosatron: 3.53 g/L → ~5.3 mS/cm CE just from K₂SO₄
- Total predicted: **~5.9 mS/cm** during fertigation periods

The lettuce CE band is 1.2-1.8 mS/cm (REQ-024) with a 2.7 mS/cm tipburn ceiling (`index.html:1326`). Per-shot CE ~5.9 is **3-4× the band, 2× the ceiling**. Even time-averaged across the week (fertigated for ~⅓ of irrigation time + plain water for the rest), average is ~2.0 mS/cm — within band but at the high end.

Two interpretations:
1. The 1.2-1.8 band is **time-average** (what the substrate experiences mixing fertigated + plain water). Then current recipe is OK, sitting at ~2.0.
2. The 1.2-1.8 band is **per-shot** (what the dripper delivers when fertigation is active). Then current recipe is dangerously over-band.

REQ-024 doesn't disambiguate. Pour-through measurements (lettuce nursery shows 1.5-2.5 mS/cm substrate target) sit between. If pour-through is in band, the time-averaged interpretation holds; but a single Bluelab measurement during fertigation could read >5 mS/cm and panic the team.

Tomato T5 same calc gives ~2.3 mS/cm during fertigation, in the 2.0-3.0 band — clean.

Note also: `getStockVol` divides by 3 (`index.html:2214`). The current barrel sizing assumes the barrel runs out roughly mid-week. If the formula instead divided by 1 (full week), the stock conc would be 3× lower — ~58 g/L K₂SO₄ stock, in-line with cap, and irrigation CE ~2.0 (in band whether per-shot or time-average). The "/3" is opinionated front-loading.

**Where:** `index.html:1699` (`LETTUCE`), `index.html:2212-2215` (`getStockVol = (weeklyL/3) × 0.02`), `index.html:1326` (lettuce ceiling 2.7), my Python verification (above).

**Severity:** **blocking** if interpretation is per-shot (over-burn risk and ceiling violation); important if time-averaged (tight band). Cert 3 because the per-shot vs time-average ambiguity is a real model question, not a clear violation.

**Options to resolve:**
- Option A: Cut `LETTUCE.kSulfate` by 3× (2996 → ~1000) so per-shot CE ≈ 2.0 mS/cm. Aligns with Salanova K demand (~3 g K/m²/wk, see Finding 5).
  - Pros: solves both Finding 5 and Finding 8 in one cut. Recipe matches realistic uptake. CE in band on both interpretations.
  - Cons: assumes Salanova K demand is the tighter constraint; cert 3 on the 1 000 g/100 m² number — needs verification with a K-uptake reference.
- Option B: Keep K₂SO₄ but extend stock barrel to full week's volume (change `weeklyL/3` to `weeklyL`). Lower per-shot conc to ~58 g/L stock → 1.16 g/L irrigation → CE ~1.7. Operationally: the barrel is 3× larger; needs equipment that can hold that volume.
  - Pros: solves CE without changing nutrient delivery total; preserves K_total.
  - Cons: barrel size triples; physical infrastructure change; still over-feeds K relative to demand (Finding 5 unresolved).
- Option C: Document the per-shot vs time-average interpretation explicitly in REQ-024. Decide which one is the spec. If time-average, label the current band as 1.2-1.8 mS/cm time-averaged and create a separate per-shot band at 4-6 mS/cm.
  - Pros: unblocks the model spec; REQ-024 currently silent on this.
  - Cons: doesn't fix the recipe over-feed (Finding 5).

**Recommendation:** Option A + Option C in parallel. Cut K₂SO₄ for the recipe-side fix; clarify the band interpretation for the spec-side. Cert: do not cut the recipe without tissue test or pour-through measurement first — measure before acting.

---

## Finding 9 — CaCl₂ Teris industrial grade Ecocert status is unverified, yet in active recipe (REQ-002 / REQ-022 violation)

**What's inconsistent:** Code comment at `index.html:2364-2366`: "⚠ Ecocert input listing not yet verified for the Teris industrial grade — confirm before scaling. CaCl₂ as a substance is permitted under CAN/CGSB-32.311." The product is in `FOLIAR.tomato.B` (`index.html:2397`) with weekly application. Per CLAUDE.md's `feedback_organic_cert_flag`, every product must state CAN/CGSB-32.311 status; per REQ-002 and the future REQ-022, only Ecocert-allowed products may be in active recipes.

**Where:** `index.html:2364-2366` (comment flagging unverified), `index.html:2397` (in active recipe).

**Severity:** **blocking** (organic cert audit risk + REQ-002 violation; team is using a product whose specific commercial form has not been verified)

**Options to resolve:**
- Option A: Contact Teris (or check Ecocert input list) and confirm the specific industrial-grade product is on the input list. Add `organicAllowed: true, source: 'Teris [SKU], confirmed YYYY-MM-DD'` annotation in the recipe comment.
  - Pros: closes the gap definitively; minimal effort if confirmation comes back yes.
  - Cons: requires external lookup; if Teris industrial grade is *not* allowed, requires sourcing a different supplier (food-grade CaCl₂ from organic-input distributor — search Plant Products, Premier Tech, etc.).
- Option B: Substitute Teris with a confirmed-organic CaCl₂ source (food-grade or input-listed). Common alternatives: Bran-USA, Plant Products organic-input catalog, BioFlora.
  - Pros: removes the doubt entirely.
  - Cons: cost; sourcing time.
- Option C: Pause Spray B until verification. BER risk for tomato T3-T5 increases.
  - Pros: cleanest from a cert standpoint.
  - Cons: BER prevention lost; this is the ONLY current Ca-translocation tool given soil Ca is already saturated and the issue is xylem mobility.

**Recommendation:** Option A this week. The substance is allowed; only the specific source verification is pending. Phone call to Teris + cross-check with Québec Vrai/Ecocert input list. Cert 4 that this resolves to "yes, allowed".

---

## Finding 10 — `SOLAR_BY_WEEK` covers weeks 1-18; weeks 19+ silently fall back to `SOLAR_BY_MONTH`

**What's inconsistent:** `SOLAR_BY_WEEK` declared for weeks 1-18 (`index.html:2052-2072`). Per REQ-009, this is intentional. Today is 2026-05-05 = week 19. So **the model is currently using the monthly fallback** (`SOLAR_BY_MONTH[4] = 2000 J/cm²/day` for May).

`getSolarRad()` at `index.html:2095-2101`:
```
const wkly = SOLAR_BY_WEEK[wk];
if (wkly != null) return wkly / 7;
const month = new Date().getMonth();
return SOLAR_BY_MONTH[month];
```

The fallback is silent — no UI warning that the team is now on a less-accurate (cert 3 vs cert 5) data source. REQ-009 mentions "Cert drops to 3 for those weeks" but doesn't surface that to the user.

The current monthly value (2 000 J/cm²/day for May) is a 31-day average. Late-May days are ~25% brighter than early-May. For the mass-flow model that drives Bilan supply numbers, this means weeks 19-22 are ~25% understated; weeks 23-26 are ~25% overstated. Operationally: the team's weekly recipe doesn't change with solar (recipe is fixed per stage), but the Bilan's "soil supply" numbers shift, and the CE-prediction (Finding 8) shifts too.

**Where:** `index.html:2052-2101`, REQ-009 in `requirements.md`.

**Severity:** important (silent degradation of model accuracy starting today; affects every Bilan computation from now until weeks 19-52 are populated)

**Options to resolve:**
- Option A: Extend `SOLAR_BY_WEEK` to weeks 19-52 with the 20-yr Quebec City weekly data (Guillaume's 2026-05 data source). Keep cert 5.
  - Pros: closes the gap; one-time effort; REQ-009 path-of-least-resistance.
  - Cons: requires the data; ~30 min of data entry + REQ-009 verification update.
- Option B: Add a UI cert-rating annotation: when `wkly == null`, surface "données mensuelles (cert 3)" in the Bilan / Fertigation pages.
  - Pros: makes the cert drop visible.
  - Cons: doesn't fix the data quality; just makes the bug visible.
- Option C: Interpolate weekly from monthly using a smooth seasonal curve.
  - Pros: better than monthly; no data entry.
  - Cons: cert stays ~3 (interpolation isn't measurement); misses the actual variance.

**Recommendation:** Option A. The data is presumably in the same source Guillaume used for weeks 1-18; add it now while the rest of the season is ahead.

---

## Finding 11 — `SME_TEST_DATE = '2026-04-10'` — staleness banner exists but threshold may be too lax

**What's inconsistent:** SME staleness logic at `index.html:3740-3749`:
```
const stale = ageWeeks >= 12;
```
Today (2026-05-05) the SME is **3 weeks 4 days old** = age 25 days. Banner shows neutral grey ("il y a 3 sem."). Threshold for warning is **12 weeks**. Baseline doc says "SME retest: every 4-6 weeks (lab) — track P, Mn, Zn recovery" (`farm-baseline-updated.md:280`). Code threshold (12 wk) is 2-3× the baseline recommendation (4-6 wk).

Sulfur application typically starts within 4-6 weeks; SME should be retested 6 weeks after first sulfur, per baseline §Action Plan. The 12-week stale threshold means the code won't warn until ~2.5 months after the test, far past when the next test should already have been done.

**Where:** `index.html:3744` (threshold = 12 weeks), `farm-baseline-updated.md:280` (recommendation 4-6 weeks).

**Severity:** minor (model still works on 12-wk-old data with bounded error; but the warning UX undershoots the operational policy)

**Options to resolve:**
- Option A: Cut threshold to **6 weeks** (matches baseline upper bound). Would currently show neutral; would flip to warn around mid-June.
  - Pros: matches operational policy; surfaces the retest schedule earlier.
  - Cons: requires user training (banner appears more often).
- Option B: Two-tier: warn at 6 wk (yellow), error at 12 wk (red). UX gradient.
  - Pros: most informative.
  - Cons: more code; richer UX may not justify the complexity.
- Option C: Leave at 12 wk.
  - Pros: zero work.
  - Cons: misses the operational policy.

**Recommendation:** Option A.

---

## Finding 12 — Sulfur dose: tomato 2.0 kg/100 m², lettuce 3.3 kg/100 m² — inconsistent crops + lettuce above baseline upper bound

**What's inconsistent:** Tomato sulfur: 1.1 kg/planche × planche 54.7 m² = **2.0 kg/100 m²/mo** (`index.html:384`). Lettuce: 1 kg/planche × planche 30.4 m² = **3.3 kg/100 m²/mo** (`index.html:659`). Baseline says **2-3 kg/100 m²** (`farm-baseline-updated.md:261`). Tomato sits at lower bound; lettuce sits above the upper bound. Crops have similar starting pH (7.28 vs 7.48), similar Ca saturation, similar pHbuffer (7.19 vs 7.15). The dose ratio (1.65×) doesn't appear to match any biological argument in the comments.

The lettuce dose is delivered "au moment du retournement" (at bed turnover, ~every 2 wk in normal cycle) so the cumulative monthly dose is actually higher (~2× the per-planche number if turnovers occur 2×/mo). This makes lettuce cumulative ~6.6 kg/100 m²/mo — well above the 3 kg/100 m² monthly upper bound.

**Where:** `index.html:384` (tomato), `index.html:659` (lettuce), `farm-baseline-updated.md:261` (baseline 2-3 kg/100 m²).

**Severity:** important (over-application risk for lettuce; sulfur tox below pH 5.5 in the long term; difference between crops not justified)

**Options to resolve:**
- Option A: Standardize at 2.5 kg/100 m²/mo, applied either as 1.4 kg/planche tomato (1.4/54.7 × 100 = 2.56) OR 0.76 kg/planche lettuce (0.76/30.4 × 100 = 2.5) **per month** (not per turnover).
  - Pros: consistent across crops; mid-band per baseline; aligns the "frequency" metric with the per-month dose framing.
  - Cons: slower pH drop than current lettuce dose; need to tolerate the 6-12 mo timeline that's already accepted.
- Option B: Keep tomato at 1.1 kg/planche/mo; cut lettuce from 1 kg/planche/turnover to 0.76 kg/planche/mo (= 2.5 kg/100 m²/mo).
  - Pros: tomato unchanged; lettuce comes back into band.
  - Cons: lettuce dose doesn't match the operational rhythm of planche turnover; 0.76 kg is awkward.
- Option C: Document the discrepancy as intentional (e.g., "lettuce gets higher dose because shorter cycle = need to drop pH faster") if there's a biological argument I'm missing. Don't change.
  - Pros: zero work.
  - Cons: I can't find the argument in any of the comments. Suspect this is just a per-planche-vs-per-area unit error.

**Recommendation:** User must decide — depends on whether the higher lettuce dose was intentional. Cert 4 that current lettuce dose is above the baseline-stated upper bound; cert 2 on whether that's a problem in practice (sulfur is slow, oversupply just buffers; the worry is cumulative pH overshoot below 5.5 in 12+ mo).

---

## Finding 13 — Cert annotation coverage spotty on `BIOMASS_DEMAND` micros and PRODUCT_PCT

**What's inconsistent:** REQ-028 spec: every empirical constant carries `cert: 0-5` annotation; coverage threshold 90%. Sampled 10 numerical constants:

| Constant | Cert annotated? |
|---|---|
| `BIOMASS_DEMAND.T1.N = 700` | ✓ "cert 4" |
| `BIOMASS_DEMAND.T3.B = 2.0` | ✓ "cert 2" |
| `BIOMASS_DEMAND.T4.Cu = 0.51` | ✓ "cert 1-2" |
| `TOMATO_FRUIT_EXPORT.Ca = 1.5*0.05` | ✓ "cert 4" |
| `TOMATO_FRUIT_EXPORT.Fe = 0.010*0.60` | ✓ "cert 1-2" |
| `SIDEDRESS_MIN_EFF.Actisol_N = 0.60` | ✗ no inline cert (block-level "Cert 3" earlier) |
| `SIDEDRESS_MIN_EFF.FarinePlumes_N = 0.75` | ✗ no inline cert |
| `PRODUCT_PCT.K2SO4_K = 0.415` | ✗ no cert (label-stated, implicit cert 5) |
| `PRODUCT_PCT.Actisol_P = 0.03 * 62/142` | ✗ no cert (label calc, implicit cert 4) |
| `LETTUCE.feSulfate = 7.5` | ✗ no cert |
| `TOMATO_STAGES.T5.kSulfate = 3489` | ✗ no cert (PA Taillon × 1.5, implicit cert 3) |
| `SME_TOMATO_PPM.K = 292.3` | ✗ no inline cert (block says cert 5 for SME) |
| `MEHLICH_DATA.tomato.P = 557.7` | ✗ no inline cert (lab data, implicit cert 5) |

Coverage on this 13-element sample: 5/13 = **38%**. REQ-028 threshold is 90%. **Major gap.**

Most missing-cert constants have an *implicit* cert in a comment block above (e.g., "label-stated"), but REQ-028's verification needs inline annotation per entry.

**Where:** `index.html:3201-3290` (`BIOMASS_DEMAND` — well annotated), `index.html:3293-3310` (`PRODUCT_PCT` — no inline cert), `index.html:3319-3325` (`TOMATO_SIDEDRESS` — no inline cert), `index.html:3339-3344` (`SIDEDRESS_MIN_EFF` — block-level only), `index.html:3362-3374` (`SME_TOMATO_PPM` — block-level only), `index.html:1655-1699` (fertigation constants — no cert).

**Severity:** minor (current model works; REQ-028 is a target spec, not an active check)

**Options to resolve:**
- Option A: Add inline `// cert N` to every entry in `PRODUCT_PCT`, `TOMATO_STAGES`, `LETTUCE`, `TOMATO_SIDEDRESS`, `SIDEDRESS_MIN_EFF`, `SME_TOMATO_PPM`, `MEHLICH_DATA`.
  - Pros: closes REQ-028 cleanly; small mechanical work.
  - Cons: ~2-3 hours of careful annotation.
- Option B: Trust block-level cert annotations; update REQ-028's verification to look for `// cert N` OR `// Cert N` at block level.
  - Pros: no code change to constants.
  - Cons: weakens the spec; block-level cert can drift from per-entry reality.
- Option C: Defer until REQ-010+ recipe-model rebuild (Cert annotations would be added during the `PRODUCT` table rebuild).
  - Pros: avoid double work.
  - Cons: cert info missing in interim.

**Recommendation:** Option C — defer. The coverage check is for the future model; current code's block-level annotations are sufficient for human review.

---

## Finding 14 — Cross-channel double-counting risk for K (and possibly Mg)

**What's inconsistent:** Per REQ-012 future spec: no double flux-ownership. Today the model has no `CHANNEL_ROLE` const. Bilan adds K from 3 sources at every render (`index.html:3596-3601`, `3686-3700`):

1. Soil mass-flow (SME K 292 ppm × 25.5 L/m²/wk = 7 448 mg K/m²/wk)
2. Side-dress (Actisol K 232 mg/m²/wk at T5)
3. Fertigation (K₂SO₄ 3 781 mg K/m²/wk at T5)

**Total: 11 461 mg K/m²/wk = 218% of demand.** All three are summed without overlap accounting. Conceptually:
- The soil supply *includes* the K from previous side-dress applications that have mineralized and equilibrated into solution. If side-dress K = 232 mg/wk and SME K is 292 ppm, **side-dress K may already be reflected in SME**. So adding both = double-count.
- Same for K from the previous week's fertigation that didn't drain — leaches into the SME pool.

Side-dress K: ~232 mg/m²/wk × 0.85 efficiency = 197 mg/m²/wk effectively delivered to soil pool. This is small (~3% of soil supply), so the double-count error is bounded.

But fertigation K is much bigger (3 781 mg/m²/wk fresh) and a significant fraction enters root zone before reaching SME equilibrium (drip irrigation = direct delivery, not mediated by soil mass-flow). So fert K adds **additionally** to soil K, not double-count.

The actual dynamics:
- Soil K (SME) = static reservoir term, refreshed slowly by mineralization
- Fert K = freshly delivered to drippers, partly absorbed before mixing with soil pool, partly leaches
- Side-dress K = future soil supply (this week's release ≈ this week's mineralization, contributing to next SME reading)

The Bilan treats all three as mutually independent inputs. Side-dress K adding to soil K is plausibly double-counted (overstating ~3%). Fert K is best modeled separately. The error is probably bounded ≤10% on K, possibly higher when side-dress N gets factored in (soil N derives from compost mineralization that *includes* previous side-dress).

**Where:** `index.html:3596-3601` (`total[el] = fert + foliar + soil + sidedress`), no `CHANNEL_ROLE` constant.

**Severity:** important (model overstates total supply by ~5-15% on side-dress-coupled elements; affects priority of "is K limiting?" decisions)

**Options to resolve:**
- Option A: Build `CHANNEL_ROLE` + flux-fraction logic per REQ-011 spec. For each element, declare what fraction is owned by each channel.
  - Pros: closes the spec; surfaces double-count explicitly.
  - Cons: substantial work; needs uptake data per channel (cert 2-3).
- Option B: Acknowledge in Bilan UI: "Total = somme directe; chevauchement potentiel sol↔sidedress sur K, N." Accept the ~10% over-estimation for now.
  - Pros: minimal effort.
  - Cons: leaves the bug.
- Option C: Subtract a "side-dress-already-in-soil" factor: assume side-dress K is *already* in SME for any element where SME shows that element abundant. Practically, multiply sidedress.K by 0 when soil.K > demand. Brittle but pragmatic.
  - Pros: removes the double-count for the elements where it matters.
  - Cons: rough; cert 2.

**Recommendation:** Option B for now. Tag this as the first concrete payoff of REQ-011 implementation when the model rebuild begins.

---

## Finding 15 — REQ-012 violation: no `CHANNEL_ROLE`, so micros (Cu, Mo, B) flux-ownership is implicit

**What's inconsistent:** Cu, Mo, B currently delivered:
- Cu: only via foliar Spray A (4 g CuSO₄ × 25% = 1.0 g/wk × 30% coverage = 0.3 g effective for 383 m²)
- Mo: only foliar (1 g molybdate × 39.6% = 0.4 g/wk × 30% = 0.12 g effective)
- B: only foliar (7 g Solubore × 20.5% = 1.44 g/wk × 30% = 0.43 g effective)

Soil supplies: Cu 0.04 ppm × 25 L = 1.0 mg/m²/wk; Mo 0.02 × 25 = 0.5 mg/m²/wk; B 0.18 × 25 = 4.6 mg/m²/wk. SME data shows soil delivers these in band already. The foliar add is incremental.

Without `CHANNEL_ROLE`, "is foliar adequate for B?" is implicit. B demand at T5 is 1.8 mg/m²/wk; foliar delivers ~1.1 mg/m²/wk (cert 4, with yucca it'd be 3 mg/m²/wk); soil already delivers 4.6 — so B is over-supplied at T5 (cert 4) but only because foliar is summed with soil that *might* be lockout-affected (B is neutral boric acid, **not pH-locked** per `index.html:3368`). So this one is fine.

The structural issue is: nothing in code declares "B's primary channel is soil; foliar is supplemental"; the Bilan just sums them. This is the same shape as Finding 14 but with smaller numbers.

**Where:** Same as Finding 14 — no `CHANNEL_ROLE`.

**Severity:** minor (numbers happen to work; structural gap is the same)

**Options to resolve:** Same as Finding 14.

**Recommendation:** Defer to REQ-011 implementation. Current numbers are correct enough.

---

## Finding 16 — Yucca surfactant pending — Spray A is not executable as documented; FeSO₄ bridge is in place

**What's inconsistent:** `index.html:2356-2358`: "STATUS 2026-04-30: Iron DL still pending receipt. Tomato Spray A is currently NOT executable as written. Bridge with FeSO₄·7H₂O 80 g per 15 L until Iron DL arrives". The bridge is in code (`index.html:3552`: `feApplied_g = 80 * PRODUCT_PCT.FeSO4_Fe`). But the FOLIAR.tomato.A entry still lists "Iron DL 150 mL" as the Fe source displayed to the team (`index.html:2394`). The team-facing recipe shows Iron DL; the bridge fallback only triggers when `nutr-irondl` checkbox is unchecked in the Bilan UI. The Foliar page itself doesn't have the toggle — it just renders `FOLIAR.tomato.A` directly (`index.html:2473-2484`). So **the Foliar page tells the team to use Iron DL when in fact they should be using FeSO₄ 80 g**.

Yucca: same shape but currently ignored — the Spray A recipe doesn't include yucca at all (`FOLIAR.tomato.A` has 6 entries, none yucca). Comment says "When yucca arrives: 15 mL per 15 L master, add FIRST" but the FOLIAR const has no yucca slot to fill. The team has no signal that yucca is missing from the recipe.

**Where:** `index.html:2394` (FOLIAR shows Iron DL with note "à recevoir"), `index.html:3812` (Bilan output shows "Iron DL" or "FeSO₄ (bridge)" based on toggle), `index.html:2376-2383` (yucca described in comment but not in const).

**Severity:** **blocking** if Iron DL is not yet received — the team-facing Foliar page misleads. Probably the team knows from Slack to use FeSO₄, but the app says Iron DL.

**Options to resolve:**
- Option A: Until Iron DL arrives, replace `'Iron DL (Agro-K, 5% Fe)', master: '150 mL'` with `'FeSO₄·7H₂O (pont jusqu\'à Iron DL)', master: '80 g'` in `FOLIAR.tomato.A`. Update note.
  - Pros: team-facing page is correct.
  - Cons: requires manual swap when Iron DL arrives; could miss the swap-back.
- Option B: Add a `received` flag per product in FOLIAR; render the active substitute in `buildFoliar()`.
  - Pros: structural fix; easy to maintain.
  - Cons: changes the FOLIAR data shape.
- Option C: Banner on Foliar page: "⚠ Iron DL en attente — utiliser FeSO₄·7H₂O 80 g cette semaine. Confirmer dans Slack #recherche-et-dev".
  - Pros: minimal code; explicit.
  - Cons: relies on team reading the banner.

**Recommendation:** Option A this week (most explicit), Option B at next refactor.

For yucca: add an empty slot or banner — at least make absence visible. Since coverage logic in Bilan defaults to `cov = 0.30` when `yuccaOn` checkbox is unchecked, the model is internally honest. The Foliar recipe page just doesn't mention yucca at all.

---

## Finding 17 — "Stop watering 4 days before transplant" — operational rule in baseline, not in app UI

**What's inconsistent:** Baseline §Watering procedure (nursery): "**Stop watering 4 days before transplant** — physically separate week-5 trays" (`farm-baseline-updated.md:208`). Hardening rules ("3 days summer, 4 days spring/fall, 5-6 days winter") also in baseline. Searched `index.html` — found no mention of "Stop watering" or "4 jours avant" in nursery operational instructions. Nursery page (`index.html:907-919`) lists 9 numbered steps; none addresses pre-transplant hardening.

**Where:** `farm-baseline-updated.md:206-208` (rule), `index.html:907-919` (nursery instructions, no hardening step).

**Severity:** important (operational rule with significant agronomic impact; team probably knows from Jordane's training but the app is the canonical reference for new staff)

**Options to resolve:**
- Option A: Add a hardening card to the nursery page: "Endurcissement avant repiquage — arrêter d'arroser 4 jours avant repiquage, séparer les plateaux semaine 5".
  - Pros: closes the gap; simple card.
  - Cons: needs DLI-based formula for summer/winter variation (3-6 days range).
- Option B: Reference the baseline doc from the nursery page.
  - Pros: minimal effort.
  - Cons: extra navigation; baseline isn't in the deployed app.
- Option C: Leave it. Trust the team's training.
  - Pros: zero work.
  - Cons: new staff won't know.

**Recommendation:** Option A. Critical for tray-finishing strategy and 150 g/plant push.

---

## Finding 18 — `NUTR_BIOMASS = 1.0` is dead code, kept for "back-compat"

**What's inconsistent:** `index.html:3069`: `const NUTR_BIOMASS = 1.0;` Comment: "Legacy biomass scalar — was applied to TOMATO_REMOVAL × yield. With the FRUIT_EXPORT / BIOMASS_DEMAND split there's no double-count to scale, so this stays at 1.0 (no-op). Kept for back-compat in case any other code path references it; safe to remove once confirmed unused."

Search shows **no other code path references it** (only the declaration). It's dead code masquerading as a safety net.

**Where:** `index.html:3065-3069`.

**Severity:** minor (dead code; misleads future readers into thinking this is a knob)

**Options to resolve:**
- Option A: Remove the constant.
  - Pros: cleaner.
  - Cons: zero, confirmed unused.
- Option B: Keep with a stronger comment marker.
  - Pros: traceability.
  - Cons: dead code lingers.

**Recommendation:** Option A.

---

## Finding 19 — Side-dress P column missing pH-aware status in Bilan rendering

**What's inconsistent:** Side-dress block in Bilan (`index.html:3779-3790`) renders Actisol N + P + K with effective doses. The P value at T5 is `108 mg/m²/wk` (computed). At pH 7.4 with Ca-saturation, this P is decorative (Finding 7). The Bilan does not flag the P contribution as "decorative" — it just shows a number that gets summed into supply.P.

**Where:** `index.html:3785` (renders `supply.sidedress.P.toFixed(0)` as a normal number).

**Severity:** minor (depends on Finding 7's resolution)

**Options to resolve:** Subsumed under Finding 7. If Option A or C from Finding 7 is implemented, this becomes correct automatically.

**Recommendation:** Resolve via Finding 7.

---

## Finding 20 — `LETTUCE.feSulfate = 7.5` lacks per-element delivery breakdown in any rendered surface

**What's inconsistent:** `LETTUCE.feSulfate = 7.5` is shown in the lettuce fertigation page recipe (`index.html:2295`) as a step. It's not shown in any Bilan or Cadre rendering because the Bilan is tomato-only. So the team sees the dose, but no surface tells them whether 7.5 g/100 m² is over- or under-supplying their needs. With Finding 5 (no lettuce demand model), this isn't surprising — but it leaves the lettuce Fe an opinion-driven number.

**Where:** `index.html:1699`, `index.html:1684-1696` (justification in code comment), no rendered surface.

**Severity:** minor (subset of Finding 5)

**Options to resolve:** Subsumed under Finding 5.

**Recommendation:** Resolve via Finding 5.

---

## Finding 21 — Bilan Block 5 ("ce qui manque") lever for P contradicts the side-dress P value in Block 3

**What's inconsistent:** Block 3 (side-dress) shows `supply.sidedress.P` ≈ 108 mg/m²/wk. Block 5 lever for P (`index.html:3826`): "**Verrouillage structurel.** Seul levier durable = programme soufre. Foliar P peu efficace, fertigation P précipite à pH ≥ 7." The lever message says P is structurally locked, but Block 3 has been quietly contributing 108 mg/m²/wk to supply.P (Finding 7). The two messages don't agree.

The team sees 108 mg/m²/wk in Block 3 (Actisol P) and reads "soufre = seul levier" in Block 5. They might conclude "Actisol P is somehow getting through" or "the lever copy is wrong". Both contradict the model's actual behavior.

**Where:** `index.html:3826` (Block 5 lever copy), `index.html:3585-3592` (`supply.sidedress.P` computation that doesn't apply pH discount).

**Severity:** important (cognitive dissonance; team may interpret either Block 3 or Block 5 as wrong)

**Options to resolve:** Subsumed under Finding 7. Once side-dress P respects pH lockout, the contradiction disappears.

**Recommendation:** Resolve via Finding 7 Option C.

---

## Cross-cutting note on REQ-028 cert coverage

Quick sample of 10+ constants showed ~38% inline cert coverage. This is below the future REQ-028 threshold (90%), but block-level annotations are present in most blocks. Treat REQ-028 as deferred (Finding 13 Option C).

## Cross-cutting note on REQ-002 / REQ-022 (Ecocert annotations)

Annotated products with explicit ✅ in code: K₂SO₄, MgSO₄, FeSO₄, Actisol, farine de plumes, Solubore, soufre élémentaire, Iron DL, Acadie products (implicit), luzerne, frass (conditional).

Unverified or pending: **CaCl₂ Teris grade** (Finding 9 — blocking), **MnSO₄ / ZnSO₄ / CuSO₄ / Mo de sodium** (no explicit annotation; conventionally allowed but per CLAUDE.md should be stated), **Yucca** (pending source), **EZ-GRO Ocean** (in nursery sem 4-5; no annotation in code).

Recommend adding an Ecocert status block to the foliar comment header similar to the one on the soil page (`index.html:636-644`).
