# Domain — tomato nutrition (soil)


## Model


### Salinity & osmotic limit

- soluble salt load → SME CE   (CE sums ALL soluble ions, nutrient + spectator alike — not nutrient-specific)

- root-zone CE → osmotic pull at root → ↓ water uptake → ↓ cell expansion → stunted small leaves

- small leaf area → ↓ photosynthetic source → caps fruit fill under heavy load (source-limited)

- tomato salt tolerance > generic crop   (osmotic damage onset at higher CE)


### Spectator-ion load

- SO₄ → raises CE, feeds ~nothing   (full osmotic cost, no nutrition)

- soil SO₄ ← accumulates from sulfate-carrier inputs (K₂SO₄, MgSO₄, gypsum CaSO₄)

- Na → spectator too; sodicity gated by RAS, not raw Na


### Potassium — two pools, one sink

- exchangeable bank (Mehlich-3, %CEC saturation) —⟂— solution pool (SME ppm)   (distinct pools; either can mislead alone)

- fruit fill → K export   (fruit is the dominant K sink)

- K root uptake ← antagonized by Ca²⁺, Mg²⁺, Na⁺   (cation competition)

- solution K "at ceiling" ≠ surplus when export high AND bank only adequate


### pH & channel availability

- high pH → P, Fe, Mn, Zn unavailable   (cationic micros lock; P precipitates with Ca as Ca-phosphate)

- high pH → B, Mo MORE available   (anionic — opposite of cations)

- root channel gated by pH; foliar channel bypasses   (cuticular uptake sidesteps root lockout)


### Deficiency signature — K

- K phloem-mobile → deficiency shows old/lower leaves first → marginal scorch

- K deficiency → fruit: blotchy/uneven ripening, yellow shoulders, white hard internal core

- salinity → marginal leaf scorch too   (confounds the leaf read)

- fruit signs salt-immune → the K-specific diagnostic


## Boundaries

- Measurement-method semantics: SME = saturated media extract, soilless-calibrated bands; on soil it names the soluble / moisture-driven pool, NOT plant-available. Mehlich-3 = exchangeable bank. Petiole sap = live plant status.

- Stored recipes, resume gates, dosing → `fertigation-recipe/`, `sidedress-recipe/` spec.


## Vocabulary

**Spectator ion** — a dissolved ion that adds to CE and osmotic load but supplies little or no plant nutrition (e.g. SO₄, Na). _Avoid_: inert salt.
