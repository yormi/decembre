# Domain — lettuce


## Model


### Transpiration & cooling

- radiation → leaf temp → leaf self-generates leaf-VPD → transpiration   (air-VPD does NOT gate it)

- air-VPD non-limiting → transpiration ← min(stomatal aperture, water supply)   (limiter relocates from atmosphere to plant)

- water supply ← root + xylem capacity

- stomata close when water supply < evaporative demand (leaf water potential drops)

- HAF → strips leaf boundary layer → keeps leaf-VPD a live sink


### Energy balance

- absorbed radiation = transpiration + convection + re-radiation

- HAF → ↑ convection → second cooling path when transpiration is supply-limited


### Calcium & tipburn

- Ca delivery ← transpiration stream (xylem only; no phloem redistribution)

- inner leaves transpire little → low Ca import → tipburn

- tipburn risk ↑ with growth rate (fast leaf expansion outruns Ca delivery)

- NOT set by root-zone Ca supply — more root does not fix tipburn


### Bolting

- bolting ← accumulated thermal time ; NOT water stress

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

- time-to-bolt held at constant temperature (≈1000 °C·d; constant temp)

| Held temp | weight °C·d/day | Days to ~1000 °C·d |
|---|---|---|
| 16 °C (target) | 12 | ~83 |
| 20 °C (inflection) | 16 | ~63 |
| 24 °C (hot) | 24 | ~42 |


### Canopy closure

- leaf area expands → neighbour leaves meet → **canopy closes**

- canopy closure timing ← plant pitch (spacing) + DLI   (NOT root volume, NOT temperature)

- before closure: incident light → bare media/soil → uncaptured   (yield ← intercepted light)

- after closure: added leaf area → shades lower leaves → lower leaves drop below light-compensation point → senesce (source→sink flip)

- closed canopy → still humid air at base → Botrytis / mildew

- intra-canopy shade → shade-avoidance stretch (weak elongated tissue)

- heat + humidity → faster base degradation → shorter net-positive window

- a closed canopy is net-positive (top gain > base loss) for a bounded window, then net-negative

| Context | Pitch | Net-positive window | Window ends on |
|---|---|---|---|
| Plug tray | 50-cell tighter than 32-cell | 0–5 d, ≤~1 wk | stretch + base mold |
| Crop bed | ~43 heads/m² | ~2–3 wk | base rot + senescence + tipburn |

- plug tray: pitch fixed at sowing by cell count → closure timing set at sowing

- worst case: closed canopy held past its net-positive window → base loss outruns top gain (net mass + quality loss)


### Setpoints


#### Both stages

stage-independent

| Factor | Target | Band | Edge |
|---|---|---|---|
| CO₂ | 800–1000 ppm | 420–1200 | light hours only; >1200 diminishing |
| 24 h avg temp | 16–17 °C | 15–18 | drives the bolting clock, plug and bed alike |


#### Seedlings

plug, ~4 wk propagation. pH + EC by pour-through

| Factor | Target | Band | Edge |
|---|---|---|---|
| DLI | 10–12 mol/m²/d | 8–14 | >14 → stress / stretch-control |
| Media water tension | 5–10 kPa | 3–15 | brief dry-back drives rooting; never saturate |
| Soil pH (pour-through) | 6.0–6.5 | 5.8–6.8 | <5.5 → Mn/Al; >7 → Fe/Mn/P lockout |
| Soil EC (pour-through) | 1.0–1.2 mS/cm | 0.8–1.5 | young roots salt-sensitive; >1.5 → hold feed |
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

- Target bands live here; the soil-pH adjustment model + salinity dynamics → `soil-ph/`.

- Nutrient supply / demand → `plant-needs/`.


## Vocabulary

**Xylem** — water-conducting tissue; one-way flow root→leaf with the transpiration stream; the only path that carries calcium.

**Phloem** — sugar-conducting tissue; bidirectional; does not redistribute calcium to inner leaves.
