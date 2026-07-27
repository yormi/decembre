# Flood trays + salinity — handoff

2026-07-26. Design conversation, nothing built or committed. Context:
automating fertigation + irrigation for Salanova seedlings, 32× 2,5 po
pots per 1020 tray, 50 g target, 3,84 L feed per tray.


## Decisions reached


**High-rise flood tray, not low-rise.**

Low-rise (~1 po sidewall) holds ~1,3–2 L over a 1020 footprint. The
feed is 3,84 L → needs two fill cycles or the back pots starve.
High-rise (~2–2,5 po) takes the whole volume in one fill.

Second reason: capillary rise. A 15 mm water film wets the bottom inch
of a 2,5 po pot and stalls → dry top, wet base, roots stay low, salt
concentrates at the surface.


**Flood contact time: 20–30 min. Not 45.**

Anoxia is a non-issue at this duration — commercial ebb-and-flood runs
10–20 min floods several times daily for whole cycles. Root damage
needs hours of saturation. Pots are not fully submerged either; the
upper profile stays aerated.

The 45 min figure floated earlier was walked back: extra diffusion
gained is negligible.


**Smaller doses do NOT solve accumulation.**

Salinity = salt in − salt out. Same total grams over the nursery
regardless of dose size. Smaller doses only soften the per-feed CE
peak and reduce surface crusting — both real, neither is the
accumulation problem.

Cannot cut total mass either: N supply 1290 vs 1120 demand ≈ 15 %
headroom, and that is the entire available cut.


**The blocker is ballast ions.**

Ocean and Acadie carry Na and Cl alongside N-P-K; kelp especially.
Plants take up the nutrients and almost none of the Na/Cl. Source
water adds bicarbonate, Ca, Mg. That residue grows monotonically with
every feed and has no exit without runoff.


**Leaching is required; flood trays cannot produce it.**

A flood tray returns or holds water — zero runoff by design. This is
the structural gap in the automation plan.


## How hydroponics handles this (reference)

| System | Salt exit |
| --- | --- |
| NFT / DWC / aeroponics | No medium — nothing accumulates |
| Recirculating | Dump-and-refill, or continuous bleed, on CE creep |
| Drain-to-waste | 20–40 % of applied volume exits every irrigation |
| Container/organic (ours) | Only if runoff is deliberately created |

Drain-to-waste is the workhorse. Growers monitor runoff CE against
feed CE: runoff ≈ feed → balanced; runoff > feed → building.

Hydro rarely needs a separate flush because inert media (rockwool,
perlite, coco) have near-zero cation exchange capacity. Our peat/
compost mix binds cations — harder to strip, and stripping it would
remove the nutrient reserve we want.

Note: full hydroponics is not an option under Canadian organic rules
(soil-based production required). Method-borrowing only.


## Two leach methods, complementary


**Overhead — top-down**

Salanova is a rosette: leaves funnel water inward to the crown, which
sits directly over the pot. Best-case canopy geometry for overhead.

Failure mode is not interception, it is **channeling** — all water
enters at one point and runs straight down the middle, bypassing the
outer substrate ring where evaporation concentrates salt.

Also loses volume to inter-pot gaps and leaves the canopy wet.


**Flood-and-dump — bottom-up**

Same trays, plain water instead of feed, dumped to waste instead of
returned.

Cycle: fill ~3,84 L → hold 20–30 min → dump to waste → repeat 2–3×
with fresh water.

This is dilution by equilibration, not displacement. ~120 mL free
water per pot against ~55 mL pore water. Perfect equilibrium would
give ~65 % removal per cycle; reality is closer to 20–30 %. Three
cycles ≈ 50–60 % of soluble salt.

Contacts the bottom, barely touches the surface layer. Acceptable —
roots occupy the mid and lower profile; the surface crust is largely
cosmetic.

Canopy-independent. This is the late-stage fallback.


## Recommended plan

1. High-rise flood trays.

2. Leach at week 1 and week 3 — both before or at canopy closure,
   when overhead geometry is still ideal. Canopy closes around week 3
   in a 4–5 week nursery.

3. If pour-through CE says a late leach is still needed, use
   flood-and-dump (canopy-proof), not overhead.

4. Do not build a late-stage overhead solution until CE data demands
   it.


## Hardware the design must add

- **Three-way valve on the tray drain** — feed return vs
  drain-to-waste. The one genuinely new piece of plumbing.

- **Never recirculate dump water.** It is the salt just removed.

- **Complete drain-back** between cycles — no residual film in the
  tray. Biggest single lever on pathogen spread.

- Match water temperature to substrate within a few degrees if the
  supply allows.


## Risk: the tray is a distribution network

*Pythium* and *Phytophthora* spread by motile zoospores that swim in
free water. One shared tray water body connects all 32 pots — one
infected pot seeds the tray in a single cycle. Property of the
hardware, not the flood duration.

Mitigation is root-side: a *Trichoderma harzianum* or *Bacillus
subtilis* drench colonizes the root surface and suppresses Pythium.
Both are CAN/CGSB-32.311 allowed in principle (RootShield, Rhapsody
and similar) — **verify the specific SKU's Ecocert listing before
ordering**.


## Water cost

3 cycles × 3,84 L ≈ 11,5 L per tray discarded. At 75 trays ≈ 860 L
per full-house leach event.


## Organic certification

No input is involved in any of this — plain water, hardware choices.
No CAN/CGSB-32.311 implication except the biocontrol SKU above, which
must be verified.


## Open questions

- **Does accumulation actually bite inside a 4–5 week nursery?**
  Untested. Run a no-leach tray and take pour-through CE at weeks 1,
  3 and 5. Flat CE → drop the leach step entirely. Climbing → the
  slope gives the interval.

- **Source water Na and Cl.** Sets how fast the ballast clock runs.
  No water report on hand.

- **Runoff CE as the instrument.** Not currently measured; it is the
  fastest read on whether the system accumulates.

- **Dump-water CE, cycle 1 vs cycle 3.** Confirms the 20–30 % per
  cycle estimate rather than assuming it.
