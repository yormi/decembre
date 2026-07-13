# Uptake-factor cert-2 defaults — literature basis

## uptake-efficiency-factor cert-2 defaults — literature basis (2026-05-15)

Defaults `PH_UPTAKE_FACTOR_AT_CURRENT_SOIL = { K: 0.90, Mg: 0.85, B: 0.80 }`. Specialist accepted the model-challenger's 2026-05-15 B2-REV mid-band numbers as defensible; refinement is tissue-anchored, not literature-anchored (triggers in `derivation.md` "Uptake-efficiency factor").

### K = 0.90 (cert 2) — Ca-K cation competition

K⁺ uptake competes with Ca²⁺ at the root cation channel. On Décembre's Ca-saturated CEC (Ca 10 989 kg/ha, ~75-85 % of CEC), literature reports 5-15 % K uptake suppression. 0.90 is conservative-middle. Magnitude at our Ca:K ratio not pinned to our soil — petiole K is the canonical refiner.

### Mg = 0.85 (cert 2) — Ca-Mg competition + dripper equilibration

Two compounding mechanisms:

1. **Cation competition.** Mg²⁺ binds more weakly than Ca²⁺ at root sites; sharper effect than K. Literature 10-20 % suppression on Ca-rich beds.
2. **Dripper-bed equilibration.** Fertigation Mg arrives concentrated at the plume; estimated 5-10 % additional discount from dripper geometry. Not shared by compost-released Mg (bed-distributed), so the factor under-discounts compost Mg slightly. Accepted at cert 2; tissue refines.

Combined literature 10-25 % range, 0.85 is mid-band.

### B = 0.80 (cert 2) — Soil B adsorption in Ca-rich beds at pH > 7

Original draft framed B discount as H₃BO₃ ↔ B(OH)₄⁻ equilibrium (pKa 9.24); at pH 7.3 borate fraction is ~1 %, so molecular-form discount is negligible — challenger acknowledged the overestimate in B2-REV. Real mechanism: **soil B adsorption** to Fe/Al oxides + Ca-borate complexes in Ca-rich high-pH soils. Literature 15-25 % adsorption discount, some sources to 35 %. 0.80 is conservative-middle. Specialist held at 0.80 (not 0.75) because: (a) Solubor hydrolyzes to H₃BO₃ in dilute solution, non-ionic and faster-equilibrating than the borate fraction the adsorption literature typically measures; (b) Ca-borate kinetics in young (first-season) compost amendments aren't well-characterized — may over-count adsorption.

### Stacked-cert caveat

All three factors compound with `COMPOST_RELEASE_PER_WEEK` (cert 2-3, Mg cert 1-2 no label data) and `TOMATO_FRUIT_EXPORT` / `BIOMASS_DEMAND` (cert 3 macros, 1-2 micros). The cert-2 × cert-2 × cert-3 stack gives a wide effective band. Block 7/8 drift gauge displays point-estimate STORED vs FP only — band not surfaced (deterministic operator prose per `feedback_no_unspecced_narrative.md`).

### Refinement priority order (when tissue data lands)

1. **Mg first** — petiole Mg in the 2026-05-11 panel; widest stacked-cert spread (Mg uptake-factor cert 2 × compost-Mg cert 1-2 × Sonneveld 0.25× ratio), so an off-band tissue read drives the largest defensible refit. Cation antagonism on the Ca-saturated bed sharpens the Mg leverage further.
2. **K second** — petiole K not always in standard panel; if present, refines 0.90. Else stays cert 2.
3. **B last** — needs dedicated foliar B test, not on cadence. 0.80 stays cert 2 longest. Qualitative signals: leaf-margin scorch (toxicity), interveinal yellowing (deficiency).

### What the factors do NOT cover

- **Micros (Mn/Zn/Cu/Fe/Mo)** — not in `computeStageRecipe`; fertigation isn't the channel at current pH (replenishment-cascade-earliest-first cascade locks to foliar). Add per-micro factors when soil pH < 7.0 makes sulfate-metal fertigation viable.
- **N** — sidedress channel. `SIDEDRESS_MIN_EFF` plays the efficiency role; whether an additional uptake-factor layer is needed on top of mineralization efficiency is a sidedress-domain decision (probably yes — Ca-rich-soil volatilization + immobilization losses).
- **P, Ca** — soil-bank-credit elements (mass-balance-derivation); fertigation resolves to zero regardless of uptake factor.
