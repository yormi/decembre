# Session knowledge — multi-day work session, end-of-day 2026-05-05

Pickup document. Read this before re-engaging with `index.html`,
`requirements.md`, or the working-files audits. Cert 0-5 per CLAUDE.md.

---

## A. Operational context

Ferme Décembre is a 1 204 m² organic greenhouse (Quebec City) growing
tomatoes (382.9 m² · 7 beds), Salanova lettuce (136.8 m² · 4.5 beds), and
spinach (not modeled). Channel: grocery stores. Cert: organic, listed as
"Ecocert / Québec Vrai / other [CONFIRM]". Crisis since fall 2025: pH 7.28
(tomato) and 7.48 (lettuce), Ca-saturated (~10 600-10 989 kg/ha), with
SME P 0.8-1.1 ppm and Mn/Zn below detection. Root cause: Savaria
ORGANIMIX marin shrimp compost (calcitic-lime-amended, ~2 788 kg Ca/ha)
applied 2 in. on beds fall 2025. Secondary: 60 concrete sonotubes leaching
slowly (perpetual maintenance sulfur required).

Treatment in progress: elemental sulfur 2.0 kg/100 m² tomato monthly,
3.3 kg/100 m² lettuce per turnover. Foliar program (Wednesday Spray A
sulfates + Friday Spray B CaCl₂) carries Mn/Zn/Cu/B/Mo/Fe and BER-Ca.
Fertigation simplified to K₂SO₄ + MgSO₄ (tomato) and K₂SO₄ + MgSO₄ +
FeSO₄ (lettuce). Yucca surfactant NOT on order (decision 2026-05-05) —
foliar coverage fixed at 30%.

---

## B. Architectural decisions made

| Date | Decision | Impact / cert |
|---|---|---|
| 2026-04-26 | Drop citric acid in fertigation; sulfur is the real soil pH lever | Water alk 25 ppm vs soil buffering ~140 meq/L. Cert 5 |
| 2026-04-26 | Drop Plantiful (BioSun) | Mechanism (kelp + Bacillus + yucca) doesn't address Ca-saturated alkaline lockout. ~$900-1500/yr saved. Cert 4 |
| 2026-04-26 | Drop fertigation oligos (Fe/Mn/Zn/Cu/B/Mo sulfates) | Sulfate forms precipitate at pH 7.4. Reintroduce when soil pH < 6.5. Cert 4 |
| 2026-04-29 | Drop Fe-EDDHA (foliar) — replaced by Iron DL (Agro-K) on order | Synthetic chelate not on CAN/CGSB-32.311. Cert 5 |
| 2026-04-29 | Drop entire lettuce foliar program | Fe moved to nursery + production fertigation FeSO₄. Cert 4 |
| 2026-04-29 | Drop foliar P | Cuticle barrier limits uptake to 5-15%. Real fix is sulfur. Cert 4 |
| 2026-05-02 | EZ-GRO Ocean drench removed from program | Biofilm risk in fertigation lines; granular side-dress carries soil N. Card markup preserved in git. Cert 3 |
| 2026-05-04 | T4-T5 BIOMASS_DEMAND revised to represent FULL canopy growth (no longer ~30%/15% of T3) | Pairs with fruit-only TOMATO_FRUIT_EXPORT (no double-count). Identity holds at yield 1.5 by construction (audit Finding 1). Cert 3 |
| 2026-05-04 | TOMATO_REMOVAL deprecated on demand side | Bilan now uses fruit_export × yield + biomass_demand[stage]. Cert 4 |
| 2026-05-05 | Sidedress reframed as bank maintenance | Dropped from supply sum; used only to compute SME bank trajectory in Banque page. Closes audit Finding 14 (cross-channel double-count) and partially Finding 7 (P over-statement). Cert 3 |
| 2026-05-05 | MIXING_FACTOR_FERT = 0.5 | Fertigation contributes 50% additional to soil pool at the dripper; rest joins SME for the next reading. Cert 2-3 |
| 2026-05-05 | LUXURY_FACTOR demand cap | `supply.soil[el] = min(SME × transpiration, demand × LUXURY_FACTOR[el])`. K=1.15, Ca/Mg/N=1.10, micros=1.0. Mechanism: HAK/HKT transporter saturation + demand homeostasis. Caps the Finding-2 luxury feeding. Cert 3-4 |
| 2026-05-05 | Iron DL + yucca dropped permanently (until further notice) | FeSO₄ 80 g/15 L is canonical foliar Fe; coverage fixed at 30%. Cert 4 |
| 2026-05-05 | CuSO₄ cut 4→2 g in foliar Spray A | Cu toxicity (taches noires) observed without surfactant; droplet pooling concentrates 3-5× → 150-200 ppm Cu local. Cert 3 |
| 2026-05-05 | Cible sol + Cadre admin pages removed; Banque sol page added | Bank-trajectory view extracted from former Bilan Block 3 |
| 2026-05-05 | Bilan renamed to "Nutrition" (page slug stays `nutriment`) | UI label change only |
| 2026-05-05 | Phase 1 (data tables + computation functions) complete | PRODUCT, CHANNEL_ROLE, PH_RESPONSE, EC_FACTOR, KSP_PAIRS/SAFE, TAG_INCOMPATIBILITIES/INERT, effectiveEff, predictedCE, predictedTankPh, passiveSupplyMassFlow, channelSupply, computeRecipe wired |
| 2026-05-05 | Phase 2 (node verifier) and Phase 3 (cert/why expanders) running in parallel | Both not yet complete |
| 2026-05-05 | Sidedress P pH-lockout factor applied | `phLockoutFactor_P` zeros out Actisol P contribution at pH 7.4. Closes Finding 7 / Finding 19 / Finding 21 cluster |

---

## C. Key learnings

### C1. Mass flow ≠ uptake
At saturating SME, transporter saturation caps real uptake at
~demand × 1.1-1.15. The mass-flow potential reading is misleading
luxury — it tells you what could be delivered, not what actually is
absorbed. Cert 3-4. **Practical:** the LUXURY_FACTOR cap
(K=1.15, Ca/Mg/N=1.10, micros=1.0) is the model's response.

### C2. SME × transpiration captures all past sidedress + compost equilibrium
Sidedress mineralizes, joins the soil pool, equilibrates, shows up in the
next SME. Adding sidedress mg/m²/wk on top of (SME × transpiration) at
every render double-counts. Cert 4. **Practical:** sidedress is now
bank-maintenance, displayed in Banque sol with a 12+ week trajectory
view, not summed into the weekly supply.

### C3. Foliar bypass requires surfactant
Without yucca, droplets bead → high local concentration → burn. The
"10× margin on average uptake" math missed local hotspot toxicity. Cert 4.
**Practical:** Cu cut 4→2 g in Spray A; coverage assumed 30% (no
surfactant); Iron DL + yucca dropped from order.

### C4. Cu has the narrowest foliar safety window
Typical safe concentration ~50-200 ppm in tank; without surfactant,
droplet pooling concentrates the residue 3-5× as it dries → 150-600 ppm
local hotspot. 4 g CuSO₄/15 L was structurally too high. Cert 3.
**Practical:** 2 g/15 L = ~33 ppm tank → ~100-150 ppm local hotspot;
observed taches noires already present; monitor 1-2 weeks.

### C5. Background N flux is invisible to the SME-only model
SOM mineralization + compost ongoing release + post-SME sidedress
deliver real N to the root zone that no SME-snapshot captures.
Explains why the model's "N gap" doesn't match observed plant performance.
Cert 3. **Practical:** BACKGROUND_N_FLUX term pending; tissue test
ordered to confirm direction before tuning the constant.

### C6. K bank is depleting
Fertigation + sidedress K together don't replace the mass-flow uptake
when pH drops and K becomes more available. Roughly 36-week runway
before SME K materially drops. Cert 3. **Practical:** monitor with
periodic SME; Banque sol view tracks the trajectory for N/P/K.

### C7. First-principles methodology
The model's design pattern: demand → passive supply (with cap and
lockout) → channel role assignment → recipe per channel → constraint
check (CE, pH, Ksp, organic, solubility). **Don't start from someone
else's recipe.** Derive from biology + your environment. Cert 5
(methodology, not specific values).

---

## D. Current model state (what's wired in code)

### D1. Data tables
- `PRODUCT` (15 entries): K2SO4, MgSO4-7H2O, FeSO4-7H2O, MnSO4, ZnSO4,
  CuSO4, Solubore, NaMolybdate, CaCl2-2H2O, Actisol-5-3-2, FarinePlumes,
  AcadiePoissonHydrolyse, AcadieAlguesLiquides, EZGRO-Ocean-15-1-1,
  SoufreElementaire. Each declares `mode`, `ch`, `base`, `phClass`,
  `ions`, `chemistryTags`, `organicAllowed`, `ecFactor`, `solubilityCap_g_per_L`,
  `phContribution`, `maxStableHours`, `cert`.
- `CHANNEL_ROLE`: per-element fraction map across fertigation / sidedress
  / frontload / foliar / passive. Tomato-only. Sums target 1.0 ± 0.05.
- `PH_RESPONSE` (10 curves): soluble-cation, sulfate-metal, organic-N,
  organic-P, borate, molybdate, etc. Each is a function of soilPh.
- `EC_FACTOR`: per-product mS/cm per g/L at 20°C clean water.
- `KSP_PAIRS` (6): Ca×PO4, Ca×SO4 (gypsum), Mg×PO4, Fe×PO4, Fe×OH(pH-dep),
  Mn×OH(pH-dep). Cert 3.
- `KSP_SAFE` (49): explicit non-precipitating pairs with one-line reason
  (cartesian-product gating per REQ-029b).
- `TAG_INCOMPATIBILITIES` (4): Cu²⁺ × protein-hydrolysate (gel),
  chelate × free-Cu²⁺ (ligand swap), live-microbial × chlorinated-water,
  free-Ca²⁺ × sulfate (gypsum-on-leaf).
- `TAGS_INERT` (20): allowlisted chemistryTags with no known interaction.

### D2. Computation functions
- `effectiveEff(productName, element, soilPh, sprayPh)` — REQ-017
- `predictedCE(recipe, dilution, waterCE)` — REQ-024 prep
- `predictedTankPh(recipe, waterPh)` — REQ-053 prep
- `passiveSupplyMassFlow(crop, element, week)`
- `channelSupply(crop, stage, channel)` (per-channel, internal)
- `computeRecipe(crop, stage, channel)` — Phase 1: tomato only.
  `computeRecipe('lettuce', ...)` returns null per Finding 5.
- `LUXURY_FACTOR` (constant map)
- `MIXING_FACTOR_FERT` (constant 0.5)
- Phase-1 sanity-check console.warn block: enforces REQ-029a/b/c at
  script load (logs unclassified tags / missing Ksp pairs / missing
  ions or chemistryTags).

### D3. UI surfaces
- **Nutrition page** (admin, page slug `nutriment`): 5 blocks
  (1 needs · 2 pantry · 3 fertigation · 4 foliar · 5 missing/levers)
  + Phase 1 stored-vs-computed delta table for tomato
- **Banque sol page** (admin, page slug `banque`): bank-trajectory view
  for N/P/K, rendered from `TOMATO_SIDEDRESS` × `SIDEDRESS_MIN_EFF`
- Team-facing pages unchanged: Fertigation, Foliaire, Sol, Semaine,
  Irrigation, Diagnostic

### D4. Stored recipes (still hardcoded, not yet model-derived)
- `TOMATO_STAGES` T1-T5 (fertigation g/wk over 382.9 m²)
- `LETTUCE` per-100-m²/wk (no demand model, ungrounded — Finding 5)
- `FOLIAR.tomato.A` and `FOLIAR.tomato.B` (15 L master)
- `TOMATO_SIDEDRESS` T1-T5 (g/planche/wk)

The model can be queried for proposals via `computeRecipe(...)` but the
team-facing pages still render the stored constants. Drift between the
two is surfaced in the Nutrition page Phase 1 table.

---

## E. What's still pending

### E1. Phase 2 — node-based verifier
In progress. Replaces the script-load console.warn block with a real
test harness. Will execute the JS object graph (PRODUCT, CHANNEL_ROLE,
recipes) under node and assert REQ-013/014/015/017/022/024/029a-c/053-055.

### E2. Phase 3 — cert/why expanders in UI
In progress. Adds expanders to the Nutrition page so the team / Catherine
can see the cert rating + provenance for every constant feeding a number.
Closes REQ-003 / REQ-028 user-facing surface.

### E3. Lettuce demand model
Audit Finding 5. Gates REQ-013/014 lettuce coverage. Requires picking a
Salanova uptake source (USDA / DLF Pickseed / local trial — cert 2-3) and
adding `LETTUCE_BIOMASS_DEMAND`, `lettuceCalcNutrDemand()`, lettuce branch
in Bilan, and `computeRecipe('lettuce', ...)` non-null return.

### E4. BACKGROUND_N_FLUX term
Pending tissue test results. Will close the apparent N gap once the
direction (low / adequate / high) is confirmed. Until then, the model
under-states N supply by some unknown factor; the team's observed plant
performance is the ground truth.

### E5. Solar weeks 19-52 data
Audit Finding 10. Today (week 19+) the model is silently using
`SOLAR_BY_MONTH` (cert 3) instead of `SOLAR_BY_WEEK` (cert 5). Blocked
on user (Guillaume's 2026-05 data source for weeks 1-18 should extend).

### E6. Tissue test — ordered, awaiting results
Confirms / refutes:
- Cu toxicity diagnosis (high tissue Cu → reduce CuSO₄ further or
  remove from Spray A)
- N status (low → increase sidedress N or restore Ocean drench;
  high → cut Actisol/farine; in-band → keep recipe as is)
- Mg via K antagonism (low Mg + adequate soil Mg → K luxury feeding
  is the real bottleneck → cut K₂SO₄ multiplier)

### E7. Many REQ-XXX checks still target spec
REQ-010 through REQ-032 and REQ-053 through REQ-057 are documented as
target spec. Phase 2 verifier will close most. REQ-022 (organic) and
REQ-053 (predicted tank pH) are highest leverage.

### E8. Open questions from baseline
- OM2 pour-through pH at week 1 vs week 5
- Sulfuric acid permitted by certifier (low priority)
- Greenhouse heating + winter temperature (affects sulfur oxidation rate)
- First substrate CE reading on 13 mL/L recipe (calibrate target band)
- Tray-finishing pilot: validate 70-110 g spring/summer estimate
- CO₂ enrichment ROI: $1500-3000 capital vs 15-30% biomass increase

---

## F. Heuristics for future Claude

- **CLAUDE.md non-negotiables:** organic-only (don't even mention
  non-approved products); cert ratings on empirical claims; French CE
  not EC; plain French (no jargon — `JARGON_DENY` enforces).
- **REQ enforcement gate:** run `./scripts/check-requirements.sh` before
  declaring work done. REQ-001..009 are wired today; REQ-010+ are target
  spec.
- **Decision log via Ch1-Ch8 walkthrough:**
  - Ch1 = Option C (rewrite parseHash/syncHash via `routedStateChanged()` helper)
  - Ch2 = Option C (leave binary; document SKU-level review requirement)
  - Ch3 = Option A (5°C reference for cold-precipitation pairs)
  - Ch4 = Option B (commit to node-script verifier for REQ-010+)
  - Ch5 = Option A (headless render + DOM regex when brittleness recurs)
  - Ch6 = Option A (Catherine review pass through app text)
  - Ch7 = Option A (node-driven runtime test on pinned dates)
  - Ch8 = Option C (REQ-009 as partial-year invariant by design)
- **Pages and audiences:** team uses Fertigation / Foliaire / Sol /
  Semaine / Irrigation / Diagnostic. Admin (URL `#admin/...`) uses
  Nutrition + Banque sol + Diagnostic CE. Phase 1 model is admin-only.
- **Recipe authority:** the team-facing pages render the stored
  constants (TOMATO_STAGES, LETTUCE, FOLIAR.tomato, TOMATO_SIDEDRESS).
  The model can be queried via `computeRecipe(...)` but does not
  override the team UI. Drift surfaces on the Nutrition page Phase 1
  block.
- **Catherine review workflow:** changes go through #review Slack
  channel before team rollout. PR creation + Slack messaging delegated
  to Claude; Guillaume signals when to merge.
- **Dev server:** static-site, served via user-systemd live-server.
  Don't spawn background bash for serving — use systemd user service.
- **Sidedress is bank-maintenance:** never sum it into supply. The
  Banque sol page renders the bank trajectory (N/P/K). If you find
  yourself adding `supply.sidedress[el]` to `total[el]`, you've
  reintroduced Finding 14.
- **Lettuce is unmodeled:** any addition to the model that doesn't
  guard the tomato-only assumption will produce silently-wrong lettuce
  numbers. `calcNutrSupply` is hardcoded `TOMATO_NUM_BEDS *
  TOMATO_BED_AREA`; the Bilan tomato-only by construction.
- **Iron DL + yucca are off the order list as of 2026-05-05.** If you
  see code referencing them as pending, it's stale documentation, not
  a TODO. Foliar Fe stays on FeSO₄ 80 g/15 L. Coverage stays at 0.30.
