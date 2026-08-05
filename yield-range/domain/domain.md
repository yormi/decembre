# Domain — yield-range · seedling weight

**Day axis: days from sowing, day 1 = the sowing day.** Same axis as `doc/data-points.md`.



Fresh weight of a Salanova seedling as a function of days since
seeding: an expolinear light-limited growth engine clamped by the
canopy-volume cap. Nursery phase only.


## Model


### Light capture → biomass

- intercepted PAR → dry mass   (via radiation use efficiency ε)

- **DLI** → carbon-gain rate   (the only growth driver held in this model)

- **usable DLI is age-capped** — young tissue saturates low; nursery growth drives on the stage ceiling, stepping by week **from sowing**: 10 (cotyledon, days 1–7) → 14 (true-leaf, days 8–14) → 25 (plug, day 15 on). The field drives on `DLI_TARGET`. Light past the ceiling buys no growth, only tipburn. See `light/domain.md`.

- leaf area → light interception   (saturates at full ground cover)


### One growth curve — light interception

- growth = ε · DLI · A · **fi**   where **fi** = fraction of light the canopy intercepts

- fi = 1 − exp(−k · LAI) ; LAI = W_dry · SLA ⁄ A   (Beer–Lambert)

- open canopy (LAI small) → fi ≈ k·LAI → growth ≈ **Rm·W**, exponential   (Rm = ε·DLI·k·SLA)

- closed canopy (LAI large) → fi → 1 → growth → **ε·DLI·A**, linear

- the two are limits of ONE curve — RGR sags smoothly from Rm toward 0 as leaves fill the space; no hard exponential→linear switch

- **canopy space A** does NOT gate growth while the canopy is open (A cancels in the small-LAI limit); it gates the linear slope once fi saturates


### Canopy space bounds the seedling twice

- **closure timing** ← A : LAI reaches ≈ 3 (fi ≈ 0.88) → interception saturates → growth turns light-limited   (sets WHEN)

- **volume ceiling** ← A : fresh mass = A × areal mass-loading → growth stops   (sets the final weight)

- both edges driven by the same **A**; closure always precedes the ceiling


### Weight law

- dW_dry/dt = ε · DLI · A · (1 − exp(−k·LAI)) , clamped to the canopy-volume cap   (integrated numerically, step GROWTH_STEP_DAYS)

- LAI = W_dry · SLA ⁄ A

- fresh = dry ÷ dry-matter fraction f_dm

- canopy-volume cap = A × canopy height × foliage density   (fresh mass)


### Stress and hydration

- stress (pH/EC, or drought + high heat) → lowers ε → shallower growth + later/absent canopy closure

- the nursery drought+heat regime is the one named stress (ε 0.85, unanchored); toggled on/off, it runs slow enough that the plug may never close in the tray

- EC / drought → higher DM% (firmer, less hydrated tissue → less fresh mass per unit carbon); the plug sits at the dry end (0.07)

- rehydration at transplant (space + water) → DM% falls (0.07 → 0.045) → fresh weight lifts at equal carbon


### Crowding senescence

- canopy held closed too long → self-shading → lower/inner leaves fall below the light compensation point → they die → mass lost

- loose-leaf harvest → a dead leaf is lost sellable mass (not a whole-head downgrade), so the decline is a real biomass loss

- a packed tray held past closure senesces from crowding alone; salt and heat are separate stressors, not modeled here

- onset + rate are directional placeholders (cert 1) — the only decline datum is crowding + salt + heat combined, an upper bound on the crowding-only rate


### Thinning — density relief

- **checker-thin** → A → 2·A ; no plant removed (survivors re-spaced into more trays)

- doubled A → doubles the linear slope AND lifts the cap

- **re-fill lag** : leaves must expand into freed area → slope ramps 1× → 2× over ≈ 7 days

- spreading shifts canopy geometry packed → spaced (see mass-loading)


### Canopy mass-loading — cap geometry

| Canopy state | height | foliage density | areal cap |
|---|---|---|---|
| packed nursery | 0.10 m | 82 kg/m³ | 8.2 kg/m² |
| spaced (field) | 0.18 m | 55 kg/m³ | 9.9 kg/m² |

- cap_g = area(m²) × areal cap × 1000

- packed cap holds pre-thin; spaced cap holds once leaves re-fill the widened area


### Tray structure

- **tray** 1—* **cell** ; **cell** 1—1 **seedling**

- plateau size N (cells per 1020 tray) → area per cell = 0.1525 m² ÷ N   (drives both A-edges)


### Operative quantities

| Symbol | Meaning | Value |
|---|---|---|
| DLI | bench daily light integral | input axis |
| A | ground area per plant | input axis |
| ε | radiation use efficiency | 1.1 g dry/mol clean · 0.85 under stress (pH/EC, or the nursery drought+heat regime) — both unanchored |
| Rm | open-canopy exponential rate = ε·DLI·k·SLA ; anchored 0.20 by the day-10 open-canopy observation | 0.20 /day |
| k | canopy light-extinction coefficient (Beer–Lambert) | 0.7 |
| SLA | specific leaf area — derived: Rm ⁄ (ε · `NURSERY_DLI_CEILING_BY_WEEK[1]` · k), i.e. at the week-2 ceiling 14, not at `DLI_TARGET` | ≈ 0.0186 m²/g dry |
| f_dm | dry-matter fraction — stage-specific | plug 0.07 (nursery, firm/dry) · field head 0.045 (hydrated); steps up at transplant (rehydration). The plug never reaches its cap, so plug DM sets its fresh weight directly |
| LAI at closure | leaf-area index when canopy closes | ≈ 3 |
| re-fill lag | slope ramp window after thinning | ≈ 7 days |


## Invariants

- Fresh weight never exceeds the canopy-volume cap for the current spacing.

- Below closure, equal-DLI seedlings weigh the same regardless of A — space is unused until leaves fill it.


## Boundaries

- Covers seedling/nursery fresh weight vs days-since-seeding only.

- Does NOT cover: annual throughput (kg/year), field-regime yield, or temperature / VPD / CO₂ stress. The crowding-senescence *mechanism* is described here (it fires in a packed tray held past closure); the full-cycle engine (`spec.md`, `calc.js`) owns throughput and the field application of that same decline on this carbon-balance law. This doc is the nursery seedling-weight view feeding the chart.

- Hands off to the full-cycle integrator (`yield-range/domain/calc.js`) at transplant.


## Vocabulary

**expolinear** — growth curve that is exponential while the canopy is open, then linear once it closes; here it emerges from one Beer–Lambert interception term (fi = 1 − exp(−k·LAI)), not a switch between two formulas.

**re-fill lag** — the ≈ 7-day delay after thinning during which leaves expand into freed space before the plant captures the full widened light.

**checker-thin** — removing alternate tray cells (checkerboard) and re-spacing survivors into more trays, doubling area per plant with no plant lost.
