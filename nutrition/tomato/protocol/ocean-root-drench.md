# Protocol — Ocean fertigation drench (SG2 lead N lever)

Deliver amino-N on a channel that bypasses the impaired nitrate
pump, and grow root (peptide auxin/gibberellin signaling) while
the sulphur drawdown frees the soil. Weekday morning pulse + flush
via a 2% Dosatron = near-continuous signal, lines protected, no
extra labor. Mechanism + 5/5 rating: `../../tomato/learnings/0002-interim-root-uptake-levers-during-ph-wait.md`.
Rate logic + two-channel model: `../sg2-nitrogen.md`.

**Product:** EZ-GRO Ocean 15-1-1 (80% amino acids, 65% peptides),
$325 CAD / 25 kg. Cert: allowed, in use.
**Setup:** 7 beds × 54.7 m², single row, ~5 pulses/day, **2% Dosatron**.
Drip = 4×100 ft tape/bed @ 0.37 gpm/100 ft → 1.48 gpm/bed, all 7 at
once = 10.4 gpm (≈0.10 L/m²/min ≈ 39 L/min).

## Dose

- **Start rate 2 kg/ha = 77 g/crop/week** → **15 g/crop/day**
  over 5 weekdays. The N is ~1% of maintenance flux — this is a
  *signal*, not feeding.
- **Cadence: every weekday (5×/wk).** 2-day weekend gap is fine
  (peptides fade, resume Monday); don't overdose Friday to cover it.
- Step **down to 7.7 g (1 kg/ha)** if the gauge shows overshoot
  (CE climbing while sap N stalls — see below).

## Steps

**Every weekday morning before 10am**

START WITH
1. Dissolve the day's **15 g Ocean in 2.5 L** in a bucket
1. Make sure it is fully dissolved to not clog the driplines
1. Put the dosatron line in that bucket
1. Set the irrigation to run 10 min on Orisha

Le bucket devrait se vider en 5min et l'autre 5min sert à flusher les lignes pour éviter de développer du biofilm qui va boucher les driptapes

AFTER IRRIGATION OVER
1. Put the dosatron line back in the normal feed barrel
4. Rinse the tank for tomorrow to avoir nasty smells

**Weekly — gauge**
6. Read **petiole-sap N + direct-pen CE**:
   - Sap N ↑, CE flat → working; hold at 15 g.
   - **CE ↑ while sap N stalls → 2 kg/ha is overshooting; drop to 7.7 g.**

**Standing rules**
6. Ocean = **root-growth dose only**; never scale as a bulk-N source
   (~$87/kg N — bulk N stays on feather meal, `../sg2-nitrogen.md`).
7. If AMF runs too: **separate from Ocean by a few days**; no fungicide
   drench in that window.
8. Plugging defense is **not concentration** (we run ~1–2 g/L tank, far
   below the limit) — it's: dissolve fully, screen-filter downstream of
   the Dosatron (120–150 mesh), and the daily flush.

## Impact attendu
Augmentation de la vigueur en 2-4 semaines.
Rien de miraculeux. C'est une patch en attendant de réduire le pH.

## Why these numbers

- **Dose** = label biostim rate; N negligible → it's a signal.
- **Weekday-daily, not weekly** = peptides degrade in ~1–2 d; daily
  keeps the signal continuous for the root-rebuild (cert 2 on the gain).
  Amplitude plateaus (don't megadose) but continuity is a separate
  axis that helps here.
- **Starting at 2 kg/ha** (Guillaume's call) = front-loads the
  signal; risk is the extra overshoots today's low root mass →
  wasted + CE creep can blind the gauge. Mitigation = watch CE the
  first 2 wk, drop to 1 kg/ha if it climbs while sap N stalls.
- **2% Dosatron pins emitter conc** = tank ÷ 50; 15 g in 4 L =
  3.75 g/L tank → ~75 mg/L at the emitter during the dosed window.
  Trace — far below any plugging limit.

**Fallback (no clean injection):** hand-drench 5.5 g/bed weekly
(50 g/L stock, 110 mL/bed in ≤1.75 L/m² water, stem base). Never
2 full doses (amplitude plateaus, cert 3).
