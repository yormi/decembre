# Domain — lettuce


## Model


### Transpiration & cooling

- radiation → leaf temp → leaf self-generates leaf-VPD → transpiration   (air-VPD does NOT gate it)

- air-VPD non-limiting during the day → transpiration ← min(stomatal aperture, water supply)

- water supply ← root + xylem capacity

- stomata close when water supply < evaporative demand (leaf water potential drops)

- HAF → strips leaf boundary layer → keeps leaf-VPD a live sink


### Energy balance

- absorbed radiation = transpiration + convection + re-radiation

- HAF → ↑ convection → second cooling path when transpiration is supply-limited


### Calcium

Field vs greenhouse (why field tolerates DLI 60):

- field wins both supply halves: **wind** → distribution (coupling ≈ 1) **+** **rain leaching** → keeps Ψ_osmotic high and f_Ca open

- greenhouse loses both; HAF restores distribution only — uptake needs a root-zone fix (leach Na, cut Na load, displace with Ca), not climate


#### Inner-heart tipburn

- Ca delivered to leaf through transpiration (xylem) only. No phloem redistribution

- tipburn ⇐ tip Ca demand > Ca arriving at that tip

- demand and supply run on opposite clocks — the inner tip forms mostly **at night**

- tip Ca demand ← leaf-expansion rate ← saturating(DLI)   (expansion saturates ~20–25 mol/m²/d; above that, extra DLI adds no demand — field DLI 60 ≈ greenhouse DLI 25 in demand terms, which is why the field doesn't tipburn at high light)

- night supply: Ca must arrive while the tip forms; daytime delivery does NOT bank for it — Ca is phloem-immobile, it stays in the cells that already existed by day

- inner-heart night Ca supply ← inner-leaf night transpiration ← night heart HD

- Coupling between house HD and heart HD moves from 0.2 to 0.8 with HAF (folded into c)

- transpiration-independent Ca floor ← root pressure / guttation (delivers at zero transpiration) **+** foliar Ca on the heart (bypasses xylem; limited by how well spray wets the enclosed heart)

- NOT set by root-zone Ca supply — more root Ca does not fix inner tipburn

`DLI_critical  ≈  DLI₀  +  c · HD_house_night  +  Ca_foliar`
`≈  11  +  2.5 · 4  +  0  ≈  21`

| Symbol | Meaning | Value |
|---|---|---|
| DLI₀ | Ca floor at zero transpiration (root pressure / guttation) | ~11 mol/m²/d |
| c | night transpiration → Ca slope on **house** night HD; absorbs coupling, so HAF raises it| ~2–3 (mol/m²/d)/(g/m³) |
| Ca_foliar | floor lift from foliar Ca; heart-wetting limited | 0–2 mol/m²/d |


#### Outer-margin burn (root-supply failure)

- Outer leaves are high-transpiration → NOT distribution-limited → an outer-margin burn means root uptake/supply failed, not night delivery

- Outer margin = furthest xylem terminus + highest cumulative transpiration → first tissue to fail when root supply falls short

Outer burn fires if EITHER pathway crosses:

##### Water-potential (salt + tension)

- Ψ_soil = Ψ_matric (negative tensiometer reading) + Ψ_osmotic (salt)

- Ψ_osmotic ≈ −36 × CE_porewater   [kPa per mS/cm]

- margin scorch ⇐ Ψ_soil more negative than ~−100 to −200 kPa under transpirational load   (roots can't pull water against the combined pull → margins desiccate)

Reference (Ψ_soil at 10 kPa tension; osmotic is the moving term):

| CE_porewater (mS/cm) | Ψ_osmotic (kPa) | Ψ_soil @ 10 kPa (kPa) | Status |
|---|---|---|---|
| 1.0 | −36 | −46 | safe |
| 1.5 | −54 | −64 | safe |
| 2.0 | −72 | −82 | nearing |
| 2.5 | −90 | −100 | scorch onset |
| 3.0 | −108 | −118 | scorch |
| 4.0 | −144 | −154 | scorch |

##### Cation antagonism (uptake competition)

- A full Ca pool still starves the plant if its share is crowded out

- Ca²⁺ root uptake ← competed by Na⁺, K⁺, Mg²⁺, NH₄⁺   (Na⁺, NH₄⁺ most antagonistic)

- f_Ca = Ca²⁺ / (Ca²⁺ + Na⁺ + K⁺ + Mg²⁺ + NH₄⁺) (Use SME numbers)

- margin necrosis ⇐ f_Ca below 0.10 to 0.15 


### Bolting

- Bolting ← accumulated thermal time **+** long photoperiod (days >~14–16 h promote bolting; Quebec summer ~15–16 h, can't be vented away)

- **Stress accelerates** (salt, heat, water, transplant shock) — it raises GA, effectively *lowering* the thermal-time threshold

- Drought alone won't bolt, but stress shortens the clock

- **GA (gibberellic acid)** = the proximate bolt hormone. Heat + stress raise GA → internodes elongate → bolt

- Lettuce is a *heat*-bolter. Cold does **not** induce bolting, it suppresses it → growing the plug cold (barn) is safe and protective, never a bolt risk

- A degree in the hot range drives bolting more than a degree in the cool range

- hourly weight(T) = max(0, min(T, T_infl) − T_base) + k · max(0, T − T_infl)

- bolting fires when Σ(hourly weight)/24 crosses the thermal-time threshold


| Parameter | Symbol | Value | Meaning |
|---|---|---|---|
| base temp | T_base | 4 °C | below → clock stops |
| inflection | T_infl | 20 °C | "too hot" begins |
| hot multiplier | k | 2 | each degree >20 °C counts double |
| soft ceiling | T_max | ~30 °C | above → heat damage (distinct failure); stop adding bolt-weight |
| thermal-time threshold | — | 750–1250 °C·d | accumulated weight to bolt; per-cultivar across leaf/butterhead types |



Time-to-bolt held at constant temperature (≈1000 °C·d; constant temp)

| Held temp | weight °C·d/day | Days to ~1000 °C·d |
|---|---|---|
| 16 °C (target) | 12 | ~83 |
| 20 °C (inflection) | 16 | ~63 |
| 24 °C (hot) | 24 | ~42 |


### Growth rate

- leaf-expansion rate ← DLI (saturating ~20–25 mol/m²/d) + 24 h avg temp (thermal time, same clock as bolting)

- early growth (germination → rosette) is slow; an established plant expands at peak rate → it fills new space far faster than a seedling reaches first closure

- DLI and temp each swing seasonally → unmanaged, growth rate (and so closure timing) runs slower in winter

- supplemental lamps → DLI floor ~11.5 mol/m²/d (200 µmol/m²/s × 16 h photoperiod) ≈ seedling DLI target → winter light-drift removed

- heating → steady night temp → winter cold-drift removed

- 24 h avg temp held in-band by setpoint (heating floors the winter low) → temperature is not an operative knob; among controllable inputs growth rate ← DLI alone

- both pinned → growth rate season-independent; residual is summer-*fast* (sun overshoots DLI target + warmer days, day temp uncapped), never winter-slow


### Canopy closure

- canopy closure timing ← spacing (distance to close) + growth rate (rate of closing)   (NOT root volume; growth rate per `### Growth rate`)

- before closure: yield ← intercepted light

- after closure: added leaf area → shades lower leaves → lower leaves drop below light-compensation point → senesce (source→sink flip)

- closed canopy → still humid air at base → Botrytis / mildew

- intra-canopy shade → shade-avoidance stretch (weak elongated tissue)

- heat + humidity → faster base degradation → shorter net-positive window

- a closed canopy is net-positive (top gain > base loss) for a bounded window, then net-negative

| Context | Pitch | Net-positive window | Window ends on |
|---|---|---|---|
| Plug tray | 50-cell tighter than 32-cell | 0–5 d, ≤~1 wk | stretch + base mold |
| Crop bed | ~43 heads/m² | ~2–3 wk | base rot + senescence + tipburn |

- plug tray: pitch set at sowing by cell count, then re-set by a density split — pitch is NOT fixed for the whole propagation

- density split: at first closure, pull half the plugs to a second tray → ground area per plant doubles → center-to-center spacing ×√2 (≈1.41)

- re-closure after a split runs faster than first closure: established plants at peak expansion need only ~1 leaf-area doubling, vs growing from seed

- Salanova, 32-cell → 3″ pot (Décembre lamps + heating): first closure ~3 wk from sowing → split → re-closure ~5–10 d

- worst case: closed canopy held past its net-positive window → base loss outruns top gain (net mass + quality loss)


### Light-budget biomass production


- harvestable biomass ← intercepted light, summed over all lit floor   (nursery + beds are one light budget, not two)

- kg per time ← lit floor area × canopy coverage fraction × DLI × RUE   (the production identity)

- biomass conserved nursery → bed: a transplant's mass is light captured earlier on the bench, not mass the bed makes anew

- open canopy → per-floor growth below the light cap   (uncovered floor spills incident light → wasted; per-plant growth still exponential, see `### Growth rate`)

- closed canopy → per-floor growth at the light cap, independent of plant size and density   (sustained only through the net-positive window — see `### Canopy closure`)

- canopy coverage fraction → share of incident light intercepted   (sets where per-floor growth sits between the open and closed regimes)

- DLI → biomass, saturating   (lettuce is a low-light crop; past the knee surplus light becomes tipburn / bolting, not yield — same saturation as leaf-expansion in **Inner-heart tipburn**)

- ceiling levers → raise the light cap: **DLI**, **RUE**, lit floor area (incl. vertical layers)

- coverage levers → approach the cap, never raise it: spacing, density, transplant size, cycle length, succession scheduling

- nursery function: relocates the open-canopy (low-coverage, light-wasting) phase onto a high-density small footprint → keeps beds at closed canopy


### Setpoints


#### Both stages

stage-independent

| Factor | Target | Band | Edge |
|---|---|---|---|
| CO₂ | 800–1000 ppm | 420–1200 | light hours only; >1200 diminishing |
| 24 h avg temp | 16–17 °C | 15–18 | drives the bolting clock, plug and bed alike |


#### Seedlings

plug, ~4 wk propagation.

| Factor | Target | Band | Edge |
|---|---|---|---|
| DLI | 10–12 mol/m²/d | 8–14 | >14 → stress / stretch-control |
| Media water tension | 5–10 kPa | 3–15 | brief dry-back drives rooting; never saturate |
| Soil pH (root-zone) | 6.0–6.5 | 5.5–6.5 | <5.5 → Mn/Al; >7 → Fe/Mn/P lockout |
| Soil EC (root-zone) | 1.0–1.2 mS/cm | 1.0–1.5 | young roots salt-sensitive; >1.5 → hold feed |
| Air temp — day | 18–20 °C | 16–22 | establishment warmth |
| Air temp — night | 14–16 °C | 12–17 | warmer than beds → faster establishment |
| Root-zone temp | 20–22 °C | 18–24 | warmth drives rooting; <15 → AMF inactive |
| Humidity deficit | ~3 g/m³ | 2.5–4 | run humid for the small root system; <2.5 → damping-off / Botrytis |


#### Transplant in bed

~4 wk in soil. EC by Bluelab Pulse, pH by 1:1 soil:water

| Factor | Target | Band | Edge |
|---|---|---|---|
| DLI | 14–16 mol/m²/d | 12–17 | >17 → tipburn |
| Soil water tension | 15–25 kPa | 10–30 | >30 → growth check; <10 → waterlogged |
| Soil pH (1:1) | 6.0–6.5 | 5.8–6.8 | <5.5 → Mn/Al; >7 → Fe/Mn/P lockout |
| Soil EC (Bluelab Pulse) | 1.5 mS/cm | 1.2–2.0 | salt-sensitive; >2.5 → growth loss, tipburn |
| Air temp — day | 18–21 °C | 16–22 | >24 → bolting |
| Air temp — night | 12–14 °C | 10–16 | warm night → soft heads |
| Root-zone temp | 18–21 °C | 15–24 | <15 → AMF inactive |
| Humidity deficit | ~4 g/m³ | 3–5 | <3 → too humid, Ca flow stalls + Botrytis; >6 → drier than lettuce likes |

- worst quadrant: high DLI × low humidity deficit (bright, still, humid) → fast growth + no Ca transport → tipburn

- DLI is the master driver: raising it forces CO₂, water, HD, HAF, and temp control up in step, or surplus light becomes tipburn/bolting, not yield


## Boundaries

- The soil-pH adjustment model + salinity dynamics → `soil-ph/`.

- Nutrient supply / demand → `plant-needs/`.


## Vocabulary

**Xylem** — water-conducting tissue; one-way flow root→leaf with the transpiration stream; the only path that carries calcium.

**Phloem** — sugar-conducting tissue; bidirectional; does not redistribute calcium to inner leaves.


**Crown** — the compressed stem base where all leaves attach and roots emerge; the growing point sits just above it; the site of crown/base rot in a closed humid canopy. _Avoid_: collar.


**canopy coverage fraction** — share of lit floor under closed, light-intercepting canopy; the term that converts incident light into growth at the floor level.


**RUE** — radiation use efficiency: biomass made per mol of intercepted light. _Avoid_: light-use efficiency.


**light cap** — the closed-canopy per-floor growth rate at a given DLI; the maximum rate a fully covered floor can sustain.
