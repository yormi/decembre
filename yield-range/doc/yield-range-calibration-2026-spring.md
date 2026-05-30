# Yield Range — Calibration data

Observed seedling weights from Décembre nursery. Source-of-truth for empirical anchors: when `RGR_MAX_LETTUCE_NURSERY` or `SHOOT_PER_ML_SUBSTRATE` change in `derivation.md`, the rationale + n trace back here. Spec in `spec.md`; formula derivation and stress-function tables in `derivation.md`.

---

## 2026 spring batch — Tray 50, test 1

**Variety:** Salanova (mixed)
**Tray:** 50-cell, peat substrate, ~33–35 mL/cell
**Sow date:** ≈ 2026-03-25 (week of; back-calculated from 21d at 2026-04-15)
**Operation:** packed end-to-end throughout cycle, no spread schedule
**Greenhouse zone:** tomato zone (Guillaume hypothesis: too warm for lettuce)

| Date | Days from sow | FW (g/plant) | Quality notes | Source | What this row teaches |
|---|---|---|---|---|---|
| 2026-04-15 | 21 (3 sem) | **4** | normal; one plant poisoned 2026-04-17 | Jordane photo log | Anchors early-phase RGR before canopy closure (d ≤ 14); model must clear ~4 g by d21 |
| 2026-04-22 | 28 (4 sem) | **16** | peak yield observed | Jordane photo log | Anchors `wPeakG` and the spacing-decay floor: 16 g at d28 fits `RootCap = 56` × ~30% headroom × (1 − W/RootCap) damping. **Sets `optimalHarvestDay ≈ 28`.** |
| 2026-04-30 | 35 (5 sem) | **10** | yellowing, white spots, plants stressed/crowded | Jordane photo log | Anchors the senescence branch: −38 % from peak → biomass loss is real, not just stalled growth. Without this row the model would only decelerate, not decline. |
| 2026-05-08 | ≈35 (5 sem) | **12** | moldy in trays, bolting; same observations as week 5 prior | Jordane photo log | Confirms the d28→d35 collapse repeats across cohorts (n=2 of 2 at d35). Bolting + low-VPD pockets are co-flagged → `f_VPD<2` + `bolting` flags both fire. |

### Operator observation (Jordane / Guillaume)

> "Début de feuilles jaunes et de blanc. Les semis manquent d'espace et
> sont stressés dans les plateaux 50. À voir si c'est mieux en 32?"
>
> "La qualité des semis n'est pas belle du tout. Les semis moisissent
> dans les plateaux, montent en fleur."
>
> "Je crois qu'il fait trop chaud dans la serre pour faire des semis de
> laitue de qualité. Ils apprécient des températures plus basses que
> les tomates. Proposition: essayer de les faire en pépinière à la place?"

→ T_day setpoint optimized for tomato (~22–26°C) likely above lettuce optimum (18–22°C). Bolting + senescence at d28→d35 consistent with chronic mild heat stress. Model flags sustained T_day > 26°C as bolting-risk trigger.

### Patterns extracted

1. **Peak yield ≈ d28 at 16 g/plant** in 50-cell packed, current zone temps.
2. **Net biomass loss d28→d35** (16 → 10–12 g): senescence dominates past
   d28, not just stalled growth. **Operationally: harvest by d28 or accept
   both yield and quality loss.**
3. **Quality regression visible at d35**: yellowing (N export from senescing
   leaves), mold (low-VPD pockets in packed canopy), bolting (heat).
4. **Implied effective RGR_max ≈ 0.30–0.35 g/g/day** in early phase
   (cert 3, derived from ~0.015 → 4 g over ~16 effective growth days
   post-germination). The current operational window (d21→d28) shows
   effective growth multiplier ~0.22/day after stress factors (cert 3).

### Calibration math (current anchor)

Logistic growth model:
```
W(d+1) = W(d) × (1 + RGR_max × (1 − W(d)/RootCap) × Π stress_factors)
```

Backed-out parameters that fit the 4 observations:

| Parameter | Value | Cert |
|---|---|---|
| `RGR_MAX_LETTUCE_NURSERY` | **0.22** (refit with corrected DLI) | 3 (calibrated 2026-05-09, n=4) |
| `DLI_BENCH_AVG` | **27.5** mol/m²/d (sun 16 + LED 11.5) | 2 (sun avg from Quebec GH literature) |
| `RootCap_50cell` | 56 g | 3 (Hochmuth-anchored) |
| Spacing closure | d21–28 | 3 (photo evidence) |
| Spacing floor | 0.40 at d30+ | 3 |
| Cycle-avg stress product | ≈ 0.76 (excl. light, which is rarely binding) | 2 |

**DLI correction note.** Initial fit (RGR_max = 0.35) assumed DLI = 11.5 (LED only) — wrong; greenhouse gets sun too. With corrected DLI ≈ 27.5 (sun 16 + LED 11.5), spacing decay no longer creates a light-starvation cliff past d18, so RGR_max refit to 0.22. Operationally d28→d35 mass loss is dominated by **bolting + heat + root-cap saturation**, not light starvation.

Starting points; refit iteratively when integration code runs against the 4 observations.

---

## How to add new observations

1. **Same conditions:** append a row to the existing batch table.
2. **Different conditions** (cell type, zone, spread schedule): start a new dated batch section. Conditions are part of the calibration key — don't pool unlike cohorts.
3. **At n ≥ 5** under matching conditions: refit `RGR_MAX_LETTUCE_NURSERY` to minimize squared residual; update spec.md constant + cert level.
4. Mark the spec calibration anchor with refit date and n.
5. **Measured FW outside ±25 % of predicted band**: investigate before refitting — likely an environmental anomaly to capture as a qualitative note, not averaged into RGR_max.

## Model behaviors not yet anchored by data

Theory + literature only — no Décembre observations:

- **Cooler-zone growth ceiling.** Whether moving lettuce out of the tomato zone recovers the d28→d35 mass loss. Bolting flag and `f_Tday` curve are predictions.
- **Spread-tray uplift.** `f_light` lift from spacing past d14 never measured here (kept off the user surface; "spread = #1 lever" prediction unverified).
- **32-cell behaviour.** 0.55 spacing-floor estimate is purely geometric; no observed weights at this density.
- **Variety differences.** `varietyRootFactor` reserved but unpopulated (library held at Salanova-only).

## Future cohorts to log

Priority order (impact × ease):

1. **32-cell, same zone** — anchors `RootCap_32cell` + tests RGR_max generalization across cell sizes.
2. **50-cell, cooler zone** (target T_day 18–22°C) — tests heat-stress hypothesis; predicted yield higher, senescence later.
3. **50-cell with spread schedule** (spread at d18) — tests `f_light` ceiling; predicted yield substantially higher (#1 lever).
4. **Different variety** (compact Salanova or another butterhead) — anchors `varietyRootFactor`, unlocks library.
