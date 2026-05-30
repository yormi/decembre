# Soil-pH sulphur programme — handoff

**Date:** 2026-05-29 · specialist (plant-nutrition) session.
Model lands in `nutrition/tomato/soil-ph/model/` + `nutrition/lettuce/soil-ph/model/` (spec + derivation + learnings). This doc = decision conclusion + open gates. Scope: sonotube-free beds only.

## The decision in one line

Lower bed pH with **micronized elemental sulphur**, dosed off a measured carbonate %, applied **monthly** under EC+pH monitoring. Form (micronized vs bentonite) is the speed lever; the calcimeter test is the go/no-go.

## Dose caps (per pass, per bed)

| Crop · bed | Tilled (bare bed) | Standing crop |
|---|---|---|
| Tomato (54.7 m²) | ~5.4 kg | ~2.5 kg/month |
| Lettuce (30.4 m²) | ~3.0 kg | ~1.4 kg/month |

- Rates: tilled ~9.8 kg/100 m², standing ~4.5 kg/100 m². Do NOT port tomato's 5.4 kg to a lettuce bed (~2× over).
- Lettuce default = **tilled-at-flip** (fast turnover); tomato default = **monthly surface**.

## Cadence

- **Monthly is safe and effective with micronized powder** (half-oxidises in ~6–10 days at 20–30 °C; mostly converted in 2–4 weeks → no runaway stacking).
- The "≤400 lb/acre/yr" annual cap is a throughput/unmonitored-grower default, NOT a hard ceiling. Replaced by measured guardrails.
- Faster than monthly (biweekly) is possible with 200/300-mesh, but retest turnaround + EC pulse recovery make ~2 weeks the practical floor.

## Guardrails (replace the annual cap)

| | Tomato | Lettuce |
|---|---|---|
| EC stop (ECe) | ≤ 2.5 dS/m | ≤ 1.3 dS/m (salt-sensitive; check pre-transplant) |
| pH retest | every 4 wk before dosing | every flip / 4 wk |
| pH floor | 6.2 | 6.0 |
| Aeration | never dose a waterlogged bed (H₂S root burn) |

Gypsum salinity self-limits (CaSO₄ solubility ~2.4 g/L; soil-solution EC self-caps ~2.0–2.2 dS/m) — salt buildup is largely a red herring on irrigated calcareous soil.

## Overshoot

While free carbonate remains, acid is buffered → can't overshoot. Overshoot risk begins only once carbonate is consumed (= the titration-pass count). Lowest-carbonate beds are the riskiest (1–3 passes); retest before each pass once carbonate is gone.

## Programme total (combined tomato + lettuce, ~520 m²)

| Calcimeter % | Total S | Read |
|---|---|---|
| ~0 / 0.1% | ~70–100 kg | feasible, 1 season |
| 0.5% | ~230 kg | multi-pass |
| 1% | ~400 kg | impractical |
| 2% | ~730 kg | manage around high pH instead |

= carbonate titration (0.32 × CaCO₃ mass) + ~68 kg post-carbonate pH-drop term. Buy ~50–100 kg to start; reorder after calcimeter + first retest.

## Product / sourcing conclusion

**Only keep micronized/powder forms.** Speed ladder (oxidation, warm moist soil): hard granular (slowest) < bentonite-degradable incl. **Tiger 90CR** (baseline, weeks–months) < micronized powder (~2–4× faster) < 9 µm wettable (~3–5×). Going bentonite→bentonite buys no speed; only the jump to micronized does.

Confirmed-existing micronized/powder products:

| Product | Maker | Form | Price / pack | Cert | Note |
|---|---|---|---|---|---|
| **Sulgro** | Sultech (Alberta) | micronized powder | distributor quote — no retail pack | verify OMRI/Ecocert | **best Canadian lead** — domestic, no freight; B2B-only, new (2026) |
| Greenway Organic Elemental Sulfur Powder | Greenway (US) | micronized ≥98% | $190 / 50 lb (currency per site selector); 1 lb $31 | verify Ecocert/COR | US-shipped → add freight + duty |
| Microthiol Disperss / Kumulus DF / Acoidal | UPL / BASF | micronized wettable 9 µm | $59.95 / 30 lb USD (~$4.40/kg) | OMRI but **fungicide label** | cheapest + fastest, but off-label for soil → certifier sign-off |

Dropped: Green Earth 300 g (discontinued, fungicide dust); Greenway 5 lb via Amazon.ca (currently unavailable); TerraLink "+90S" (granular/bentonite, not powder); Pestell 50 lb (feed/fungicide grade, not organic-listed).

**Cert rule:** elemental sulphur is allowed under CAN/CGSB-32.311 at any particle size — but the *specific product* must be on a Canada-recognized list (Ecocert/COR/CARTV), not just US-OMRI, and signed off by our certifier before first use.

## Open gates (blockers)

1. **Calcimeter / free-carbonate % (+ buffer-pH/SMP)** — go/no-go; picks the dose row + total. Nothing trustworthy without it.
2. **Direct Mehlich-3 water-pH** — have tomato 7.28; lettuce is SME 7.48 + estimated ~7.77 water (cert 2).
3. **Root-zone target pH band** — PO gap for both crops (no slug yet).
4. **Product choice + certificate** — get Sulgro distributor quote + Ecocert/COR status; or certifier ruling on Microthiol off-label.

## 2026-05-30 — scope review (sharpened against T5 tissue + field photos)

Decision unchanged; **what the programme is for** is sharpened. Durable
detail in `nutrition/tomato/soil-ph/model/learnings/what-the-ph-lever-actually-addresses-per-t5-tissue`
and `nutrition/lettuce/soil-ph/model/learnings/stuck-browning-roots-ph-indicated-salinity-cleared`.

- **pH lever reaches each goal through specific elements, not wholesale.**
  Tomato: P (direct), micros (direct — lifts pH-suppressed root uptake so
  the foliar micro spray can be retired), Ca (indirect via P→root mass).
  NOT N (sidedress ramp) and NOT the Ca cation-antagonism half. The K/Mg
  trim for that antagonism was **already done 2026-05-28** (T5 MgSO₄ 1000 g,
  K₂SO₄ 5500 g) and is now spent — K is at tissue floor and K₂SO₄ is the only
  organic soluble K, so its S over-supply is structural. Remaining Ca levers:
  foliar Ca (in) + pH→P→roots.
- **Lettuce is the strongest, most *direct* pH case** — field photos show
  roots confined to the plug, refusing to colonise the calcareous bed.
  Bicarbonate + P-lockout (SME P 0.8) directly throttle rooting; sulphur
  attacks both. **Salinity cleared** as the cause (CE 1.08, Na/RAS low) →
  sulphur won't backfire on the salt-sensitive crop.
- **New open gate (lettuce):** root *browning/necrosis* in the photos is
  NOT a pH problem — rule out wet-plug anaerobism + root pathogen before
  dosing. Sulphur does nothing for those.
- **Compost confirmed stopped** (one-time lime load) → fixed carbonate
  pool, the titration is realistic, no Sisyphus loop.

## Cert caveats on the numbers

Stoichiometry cert 5; caps cert 3 (extension lit, not tomato-specific); cadence cert 3–4; post-carbonate pH-drop term cert 2 (CEC-extrapolated); which calcimeter row cert 0 (unmeasured). A buffer-pH/SMP test converts the softest terms to cert 4.
