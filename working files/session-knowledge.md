# Session knowledge — pickup snapshot, 2026-05-05

Historical end-of-day snapshot. Architecture / data decisions listed here
have since been absorbed into `nutrition/**/spec.md` + `derivation.md`.
For live state read `working files/changelog.md` first.

---

## Operational context (May 2026)

1 204 m² greenhouse (Quebec City). Tomatoes 382.9 m² (7 beds), Salanova
136.8 m² (4.5 beds), spinach unmodeled. Channel: grocery.

Crisis: pH 7.28 (tomato) / 7.48 (lettuce), Ca-saturated ~10 600-10 989 kg/ha,
SME P 0.8-1.1 ppm, Mn/Zn below detection. Root cause: Savaria ORGANIMIX
marin (~2 788 kg Ca/ha, fall 2025). Secondary: 60 sonotubes (perpetual
maintenance sulfur required).

Treatment: elemental sulfur 2.0 kg/100 m² tomato monthly + 3.3 kg/100 m²
lettuce per turnover. Foliar program (Wed Spray A sulfates + Fri Spray B
CaCl₂). Fertigation = K₂SO₄ + MgSO₄ (tomato), + FeSO₄ (lettuce). Yucca
NOT on order (2026-05-05) — coverage fixed at 30%.

---

## Architectural decisions log (2026-04-26 → 2026-05-05)

| Date | Decision | Cert |
|---|---|---|
| 2026-04-26 | Drop citric acid; sulfur is the soil pH lever | 5 |
| 2026-04-26 | Drop Plantiful (BioSun) | 4 |
| 2026-04-26 | Drop fertigation oligos (precipitate at pH 7.4); reintroduce when pH < 6.5 | 4 |
| 2026-04-29 | Drop Fe-EDDHA; Iron DL on order (then dropped 2026-05-05) | 5 |
| 2026-04-29 | Drop entire lettuce foliar; Fe via nursery + production fertigation | 4 |
| 2026-04-29 | Drop foliar P (cuticle barrier 5-15%; real fix is sulfur) | 4 |
| 2026-05-02 | EZ-GRO Ocean drench removed (biofilm risk; granular sidedress carries N) | 3 |
| 2026-05-04 | T4-T5 BIOMASS_DEMAND = full canopy growth (pairs with fruit-only export, no double-count) | 3 |
| 2026-05-04 | TOMATO_REMOVAL deprecated demand-side | 4 |
| 2026-05-05 | Sidedress reframed as bank maintenance; not summed into supply | 3 |
| 2026-05-05 | MIXING_FACTOR_FERT = 0.5 | 2-3 |
| 2026-05-05 | LUXURY_FACTOR cap: K=1.15, Ca/Mg/N=1.10, micros=1.0 | 3-4 |
| 2026-05-05 | Iron DL + yucca dropped permanently. FeSO₄ 80 g/15 L canonical. Coverage 0.30. | 4 |
| 2026-05-05 | CuSO₄ cut 4 → 2 g in Spray A (droplet pooling concentrates 3-5× without surfactant) | 3 |
| 2026-05-05 | Cible sol + Cadre pages removed; Banque sol page added | — |
| 2026-05-05 | Bilan renamed to "Nutrition" (slug stays `nutriment`) | — |
| 2026-05-05 | Sidedress P pH-lockout factor applied (zeros Actisol P at pH 7.4) | — |

---

## Key learnings (load-bearing principles)

### C1. Mass flow ≠ uptake
At saturating SME, transporter saturation caps real uptake at
~demand × 1.1-1.15. Mass-flow potential is misleading luxury.
LUXURY_FACTOR is the model's response. Cert 3-4.

### C2. SME × transpiration captures past sidedress + compost equilibrium
Sidedress mineralizes, joins the soil pool, shows up in next SME. Summing
sidedress mg/m²/wk on top of (SME × transpiration) double-counts. Cert 4.
Sidedress is bank-maintenance, in Banque sol view, not weekly supply.

### C3. Foliar bypass requires surfactant
Without yucca: beads → local concentration → burn. "10× margin on average
uptake" math misses hotspot toxicity. Cert 4.

### C4. Cu narrowest foliar safety window
Safe tank ~50-200 ppm. Without surfactant, droplet pooling concentrates
residue 3-5× as it dries → 150-600 ppm local. 4 g/15 L was structurally
too high; 2 g/15 L = ~33 ppm tank → ~100-150 ppm local. Cert 3.

### C5. Background N flux invisible to SME-only model
SOM mineralization + ongoing compost release + post-SME sidedress deliver
real N no SME-snapshot captures. Explains apparent N-gap mismatch with
plant performance. BACKGROUND_N_FLUX term pending tissue test. Cert 3.

### C6. K bank depleting
Fertigation + sidedress K don't replace mass-flow uptake when pH drops.
~36-week runway before SME K materially drops. Monitor via Banque sol. Cert 3.

### C7. First-principles methodology
Demand → passive supply (with cap + lockout) → channel role → recipe per
channel → constraint check. Don't start from someone else's recipe. Cert 5.

---

## Still-open items

- **Lettuce demand model.** Audit Finding 5. Gates REQ-013/014 lettuce
  coverage. Needs `LETTUCE_BIOMASS_DEMAND` + branch in computation.
  `calcNutrSupply` hardcoded TOMATO; lettuce is unmodeled.
- **BACKGROUND_N_FLUX** — pending tissue test direction.
- **Solar weeks 19-52 data.** Audit Finding 10. Today (week 19+) silently
  using monthly fallback (cert 3) instead of weekly (cert 5).
- **Tissue test** — ordered. Validates Cu toxicity / N status / Mg-K antagonism.

## Open questions from baseline (unanswered)

- OM2 pour-through pH at week 1 vs week 5
- Sulfuric acid permitted by certifier (low priority)
- Greenhouse heating + winter temperature (affects sulfur oxidation rate)
- First substrate CE on 13 mL/L recipe (calibrate band)
- Tray-finishing pilot: validate 70-110 g spring/summer estimate
- CO₂ enrichment ROI: $1500-3000 capital vs 15-30% biomass

---

## Heuristics for future Claude

- **Sidedress is bank-maintenance**, never sum into weekly supply.
  Reintroducing `supply.sidedress[el] + total[el]` = audit Finding 14.
- **Lettuce is unmodeled.** Any model addition without TOMATO guard
  produces silently-wrong lettuce numbers.
- **Recipe authority:** team UI renders stored constants (`TOMATO_STAGES`,
  `LETTUCE`, `FOLIAR.tomato`, `TOMATO_SIDEDRESS`). Model is queried via
  `computeRecipe(...)` but doesn't override the UI. Drift surfaces on
  Nutrition page.
- **Iron DL + yucca off order (2026-05-05).** Foliar Fe = FeSO₄ 80 g/15 L.
  Coverage = 0.30. If you see code referencing pending Iron DL purchase,
  it's stale documentation.
- **Dev server:** static-site via user-systemd live-server. Don't spawn
  background bash; use systemd user service.
- **Catherine review:** changes go through #review Slack before team rollout.
