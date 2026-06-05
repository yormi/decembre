# Soil-pH sulphur programme — handoff

**Updated:** 2026-05-30 · specialist (plant-nutrition). Scope: sonotube-free beds.
Model: `nutrition/{tomato,lettuce}/soil-ph/model/` (spec + derivation + learnings).
This doc = decision + gates + plan. Numbers/chains live in the derivations.

## Decision

Lower bed pH with **micronized elemental sulphur**, dosed off a measured
carbonate %, under EC+pH monitoring. **Calcimeter = go/no-go.** Micronized
(not bentonite) is what enables the fast cadence.

## Why — what the pH lever actually unlocks (per T5 tissue)

Not wholesale; element by element. Detail: `tomato/soil-ph/model/learnings/
what-the-ph-lever-actually-addresses-per-t5-tissue`.

| Goal | Lever | pH/sulphur role |
|---|---|---|
| **P −90 %** | pH-drawdown | **Direct.** P is *locked, not absent* — Mehlich 557 kg/ha vault vs SME 1.1 ppm |
| Drop foliar micro spray | pH-drawdown | Direct — lifts pH-suppressed root micro uptake (Fe ×0.15 lockout) |
| Botrytis / vigor | mixed | Only the **P-half** (pH→P→root mass); rest is other levers |
| N −26 % | sidedress Farine ramp | **None** |
| Ca antagonism | fertigation K/Mg trim | **None** — trim already done 2026-05-28; spent (K at floor, K₂SO₄ only organic K → S is structural). Remaining Ca: foliar Ca (in) + pH→P→roots |

Compost confirmed **stopped** (one-time lime load) → fixed carbonate pool,
no Sisyphus loop.

## Crops — lettuce leads

- **Lettuce = strongest, most *direct* case.** Photos: roots confined to the
  plug, won't colonise the calcareous bed. Bicarbonate + P-lockout (SME P 0.8)
  throttle rooting; sulphur attacks both. **Salinity cleared** (CE 1.08, Na/RAS
  low) → no backfire. Tills at every flip → faster tier + constant windows.
- **Lettuce gate:** root *browning/necrosis* in photos is NOT pH — rule out
  wet-plug anaerobism + root pathogen first. `lettuce/soil-ph/model/learnings/
  stuck-browning-roots-ph-indicated-salinity-cleared`.
- **Tomato = slower, indirect, standing-crop.** Between-cycles tilled lever, or
  biweekly-standing for a mid-crop nudge.

## Dose caps (per pass, per bed — agronomic ceiling, not target)

| Crop · bed | Tilled (bare) | Standing crop |
|---|---|---|
| Tomato (54.7 m²) | ~5.4 kg | ~2.5 kg |
| Lettuce (30.4 m²) | ~3.0 kg | ~1.4 kg |

Rates: tilled ~9.8, standing ~4.5 kg/100 m². Don't port tomato's 5.4 to lettuce (~2× over).
Product dose = elemental S ÷ 0.90 if using Tiger 90CR.

## Cadence + guardrails

- **Biweekly is the practical floor** (micronized half-life ~6–10 d; tighter
  stacks unoxidised S). Monthly = safe steady-state.
- **"≤400 lb/acre/yr" cap = throughput/H₂S default, NOT a ceiling** — replaced
  by measured guardrails.
- Gypsum salinity self-limits (CaSO₄ ~2.4 g/L; EC self-caps ~2.0–2.2 dS/m).

| | Tomato | Lettuce |
|---|---|---|
| EC stop (ECe) | ≤ 2.5 dS/m | ≤ 1.3 (salt-sensitive; check pre-transplant) |
| pH retest | 4 wk (2 wk if biweekly) | every flip / 4 wk |
| pH floor | 6.2 | 6.0 |
| Aeration | never dose a waterlogged bed (H₂S root burn) | |

**Overshoot:** buffered while carbonate remains; risk starts once it's gone.
At ≤0.1 % the buffer is thin → retest every 2 wk past wk 3.

## Timeline (tomato, ≤0.1 % carbonate, standing crop)

Full chain + signal layering: `tomato/soil-ph/model/derivation.md` § Time-to-effect.

- **Biweekly → first plant-visible signs ~2–3 months** (monthly ~6–8 mo).
  Chemical stages compress with cadence; the ~1.5–2 mo biological tail does not.
- Binding term is the **CEC-buffered drawdown** (CEC 33, cert 2), not carbonate.
- Tilled bare-bed window roughly halves it vs standing.

| Week | Signal | If absent |
|---|---|---|
| 3–4 | soil pH probe drops | **flat by wk 5 → abort, carbonate wrong** |
| 4–8 | sap / SME P rises | — |
| 8–12 | new apex growth greener | — |

Judge **new tissue only** — old deficient leaves don't recover (P phloem-mobile).

## Plan — tomato P-unlock, biweekly, standing

**Pre-flight (no sulphur until all pass):**
1. Calcimeter + buffer-pH (SMP), tomato bed → need ≤0.1 %. Higher → multi-cycle, replan.
2. Lock certified micronized S (Sulgro lead). Tiger 90CR usable but slower + cert unconfirmed.
3. Baseline: soil pH probe + one petiole-sap P.

**Program:**
4. Open **1.5 kg S/bed biweekly**, surface-band + scratch-in, water in, keep aerobic.
5. Ramp to **2.5 kg/bed** after first clean EC+pH retest.
6. Weekly pH probe + EC; skip next dose if EC → 2.5 or pH → 6.5; floor 6.2.

## Product / sourcing

**Micronized/powder only.** Speed ladder: granular < bentonite (Tiger 90CR) <
micronized (~2–4×) < 9 µm wettable (~3–5×). Bentonite→bentonite buys no speed.

| Product | Form | Price | Cert | Note |
|---|---|---|---|---|
| **Sulgro** (Sultech, AB) | micronized | distributor quote | verify OMRI/Ecocert | **best Canadian lead** — domestic, B2B-only |
| Greenway Organic (US) | micronized ≥98% | $190/50 lb | verify Ecocert/COR | US freight + duty |
| Microthiol / Kumulus DF | wettable 9 µm | ~$4.40/kg | OMRI, **fungicide label** | cheapest/fastest but off-label for soil → certifier sign-off |

Dropped: Green Earth (discontinued), Greenway 5 lb (unavailable), TerraLink +90S
(granular), Pestell (feed grade). **Cert rule:** elemental S allowed (CAN/CGSB-
32.311) but the *product* needs Ecocert/COR/CARTV listing + certifier sign-off.

## Open gates

1. **Calcimeter + buffer-pH/SMP** — the go/no-go; picks dose row + timeline.
2. **Lettuce root-browning differential** — wet-plug anaerobism vs pathogen.
3. **Root-zone target pH band** — PO gap, both crops (no slug yet).
4. **Product certificate** — Sulgro Ecocert/COR, or certifier ruling on Microthiol.
5. **Direct lettuce water-pH** — have SME 7.48 + estimated ~7.77 (cert 2).

## Cert caveats

Stoichiometry cert 5; caps cert 3; cadence 3–4; CEC drawdown + biological lag
cert 2; which calcimeter row cert 0 (unmeasured). Buffer-pH/SMP lifts the soft
terms to cert 4.
