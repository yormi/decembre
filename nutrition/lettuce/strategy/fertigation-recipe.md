# Field fertigation — recipe revision (tissue-led)

Coherent-action record for the field-feed stage (goal.md Stage 6/8).
Why the field fertigation moved off the screenshot recipe to a
tissue-led one. Decision basis, not a locked spec.

Scale basis: **3 600 heads** (800 × 4.5 beds), **30 → 100 g**,
**3-week** growth, **54.7 m²**, weekly batch.

Evidence: tissue `LAIT #1` (Image, 2026-06-12), SME + Mehlich-3
(Berger 39086 / 39088, 2026-04-10), water test (`../../doc/analyse
d'eau.pdf`).


## Recipe comparison

"Current practice" = the PDF recipe. The PDF grams are the **weekly**
rate; the physical batch is PDF × 5 to span 5 weeks. So weekly feed =
PDF as printed (K₂SO₄ 910 g/wk).
"Corrected" = tissue-led.

| Product | Current /wk (PDF) | Corrected /wk | Reason for change |
|---|---|---|---|
| Sulfate de potassium 0-0-50 | 910 g | **200 g** (−78%) | Tissue K 5.93% = adequate; ~1.3× over demand; more K worsens K/Mg (22 vs 11.4 ideal) |
| Sulfate de magnésium 7H₂O (root) | 142 g | **50 g** (−65%) | Heavy root Mg yet tissue Mg deficient → block is antagonism, not soil |
| Foliar Epsom (Mg) 2% | — | **weekly spray** | Bypasses Na/K root antagonism — the real Mg fix |
| Sulfate de fer 20% | 155 g | **15 g** (−90%) | Tissue Fe 89 ppm = sufficient; PDF ~75× demand |
| Sulfate de manganèse 32% | 30 g | **5 g** (−83%) | Tissue Mn 48 ppm = sufficient → maintenance |
| Sulfate de zinc 35% | 6 g | **2.7 g** (−55%) | Tissue Zn 43 ppm adequate → hold |
| Borax 15% | 20 g | **6 g** (−70%) | Tissue B 25 ppm sufficient → maintenance |
| Sulfate de cuivre 25% | 4 g | **1 g** (−75%) | Kept (operator call); tissue Cu 9 ppm adequate → maintenance |
| Molybdate de sodium | 1 g | **0** | Dropped — adds Na (master antagonist) + cert |
| Acide citrique | 410 g | **0** | Dropped — no gain on clean acidic water + fresh batch |

Net: total salt ~1 680 g/wk → ~280 g/wk (**−78%**). On a salt-stressed
crop (tissue Na 3166), the EC relief is the biggest single benefit.

**Key proof:** feeding 910 g K₂SO₄/wk (over demand) still left tissue K
at the floor (5.93%) → the limit is **uptake (Na antagonism), not
supply**. Cutting K is safe; more never got in. Monitor tissue K
doesn't dip below floor (soil K bank buffers, ~17-wk runway).


## Depletion vs availability

The point of the runway column: depletion was never the binding
constraint. The reserves are deep; the deficiencies are lockout.

| Element | Mehlich-3 reserve | Tissue status | Runway | Real constraint |
|---|---|---|---|---|
| K | 645 kg/ha (healthy) | adequate | ~17 wk | none — reserve fine, low SME = lockout |
| Mg | 934 kg/ha | deficient | ~8 yr | Na/K antagonism, not stock |
| Ca | 10 612 kg/ha | deficient | ~18 yr | pH 7.48 lockout + Na, not stock |
| P | 678 kg/ha | low-suff | ~3.4 yr | pH lockout, not stock |

Mg/Ca/P cannot be fixed by adding more to soil — the bank holds
years. Fix is foliar (bypass the lock) + lower Na + lower pH.

K reserve is healthy (645 kg/ha); the low SME K (54 ppm) was
lockout/antagonism, not a poor bank. → no reason to push K.


## No soil contribution — what the soil carries

Thought experiment: if the soil supplied nothing, fertigation would
have to cover 100% of weekly uptake. Shows how much work the soil bank
is doing. (demand basis, 3 600 heads / 3-wk)

| Product | Corrected /wk | No-soil /wk | What the soil covers |
|---|---|---|---|
| Sulfate de potassium | 200 g | ~710 g | ~3.5× — the K bank carries most |
| Sulfate de magnésium (root) | 50 g | ~170 g | mass-flow covers the rest |
| Ca source (gypsum)* | 0 | ~270 g | saturated Ca = 100% |
| P source* | 0 | 21 g P | reserve = 100% |
| N source (fish)* | 0 † | ~1 260 g | soil mineral-N + front-load |
| Sulfate de fer 20% | 15 g | ~2 g | (corrected over-supplies; soil locked) |
| Sulfate de manganèse | 5 g | ~0.7 g | same |
| Sulfate de zinc | 2.7 g | ~0.5 g | same |
| Borax 15% | 6 g | ~0.8 g | same |
| Sulfate de cuivre | 1 g | ~0.1 g | same |

\* No clean organic-soluble tank source on hand — would need a new
input. Organic-soluble Ca and P barely exist; fish-N reintroduces Na.
† N comes from feather-meal front-load, not the tank.

Reading: the **macros explode** (K ×3.5; Ca/P/N must be added from
scratch), while **micros shrink** (corrected doses are locked-soil
maintenance, already above true demand). The soil is the **main
nutrient bank**; fertigation is a top-up. A soilless organic feed
would be ~6× the mass, need three hard-to-source inputs, and bring the
Na problem back. → protect and unlock the soil; don't feed around it.


## Status + caveats

Not locked as spec; no stored lettuce fertigation channel exists yet.

Confidence: reserves C4 (measured Mehlich), removal C3 (model),
runway C3, area C2 (used 54.7 m²; runway scales linearly with area).

Model inputs still wrong in the Bilan: density (43/m² vs real ~66)
and cycle (28 d vs real 21). Fix before locking.

Demand model is literature-anchored — no Décembre tissue back-test
graduating cert. A tissue panel confirms the K call.

Foliar Ca (Ca also tissue-deficient) is a separate open lever —
organic-allowed product options not yet scoped.
