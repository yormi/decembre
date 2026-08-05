# Yield Range — retired logistic calibration (2026 spring)

Provenance for the **pre-carbon-balance** fit, plus the operator observations
behind the tomato-zone heat hypothesis and the list of model behaviours still
unsupported by data.

**No weights here.** Every observation lives in `data-points.md` — cohorts A and
B are the 2026 spring batches this fit was built on.

---

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
   both yield and quality loss.** This −0.066/day is crowding **+ salt
   (Na 3166 ppm, leachate EC 5+) + heat/bolting** combined — an **upper bound**
   on the crowding-only `SENESCENCE_DECLINE_RATE` the model uses, not a clean
   anchor. Salt is being removed (nursery salt-flush); a salt-controlled held
   cohort is the trigger to refit the crowding-only rate.
3. **Quality regression visible at d35**: yellowing (N export from senescing
   leaves), mold (low-VPD pockets in packed canopy), bolting (heat).
4. **RETIRED with the logistic fit below** — implied RGR_max ≈ 0.30–0.35 g/g/day
   early phase, from ~0.015 g over ~16 "effective growth days post-germination",
   and ~0.22/day over d21→d28. Both are logistic-model quantities on a
   germination axis; neither exists in the live engine, which runs on days from
   sowing with no germination origin. Do not carry these numbers forward.

### Calibration math — RETIRED (2026-07-26)

**This section describes a model that no longer exists.** The engine is now
carbon-balance Beer–Lambert (`ε·DLI·A·(1 − exp(−k·LAI))`, `calc.js`), not
logistic. `RGR_MAX_LETTUCE_NURSERY`, `RootCap`, the spacing floor and the
stress product are **not live constants** — none appears in `data.js`. Kept as
provenance for how the numbers below were once reached; do not refit against it.

Note `DLI_BENCH_AVG = 27.5` was literature-derived (cert 2). The only *measured*
bench DLI at Décembre is 23.3 mol/m²/j — see
`data-points.md` (cohort D).

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

Starting points as of the retired logistic fit.

---

## How to add new observations

1. **Same conditions:** append a row to the existing batch table.
2. **Different conditions** (cell type, zone, spread schedule): start a new dated batch section. Conditions are part of the calibration key — don't pool unlike cohorts.
3. **At n ≥ 5** under matching conditions: refit the live growth constants (`NURSERY_STRESS_RUE`, `PLUG_DRY_MATTER_FRACTION`) to minimize squared residual; update `derivation.md` + cert level.
4. Record the refit date and n where the constant is defined.
5. **Measured FW outside ±25 % of predicted band**: investigate before refitting — likely an environmental anomaly to capture as a qualitative note, not averaged into RGR_max.

## Model behaviors not yet anchored by data

Theory + literature only — no Décembre observations:

- **Cooler-zone growth ceiling.** Whether moving lettuce out of the tomato zone recovers the late mass loss. The bolting flag and temperature curve are predictions; the growth engine carries no temperature term at all.
- **Spread-tray uplift.** `f_light` lift from spacing past d14 never measured here (kept off the user surface; "spread = #1 lever" prediction unverified).
- **32-cell behaviour.** 0.55 spacing-floor estimate is purely geometric; no observed weights at this density.
- **Variety differences.** `varietyRootFactor` reserved but unpopulated (library held at Salanova-only).

## Future cohorts to log

Priority order (impact × ease):

1. **32-cell, same zone** — tests whether the growth constants generalize across cell sizes.
2. **50-cell, cooler zone** (target T_day 18–22°C), **representative plant, n ≥ 5, plug dry-matter measured** — the cohort that would anchor the clean ε. Predicted yield higher, senescence later.
3. **50-cell with spread schedule** (spread at d18) — tests `f_light` ceiling; predicted yield substantially higher (#1 lever).
4. **Different variety** (compact Salanova or another butterhead) — anchors `varietyRootFactor`, unlocks library.
