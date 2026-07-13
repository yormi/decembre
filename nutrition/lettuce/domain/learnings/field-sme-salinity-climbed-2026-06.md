# Field SME salinity climbed April → June — the salt is saline (leachable), not sodic

**Date:** 2026-06-20 (June SME report 39580, sample "laitue 15 juin", completed 2026-06-19)

**Status:** accepted — supersedes the April "salinity cleared" read for the field.

Berger SME, lettuce-under-lamps field bed. Source PDF:
`../../doc/SME - 2026-06-17 laitue.pdf`. This is the canonical field-salinity
anchor — every other file points here instead of recopying the numbers.


## What moved (April → June)

| Reading | April (39087, 596616) | June (39580) | SME spec |
|---|---|---|---|
| CE (mmhos/cm) | 1.08 | **4.01** | 0.75–3.5 |
| SME pH | ~7.48 | **6.68** | 5.2–6.5 |
| Nitrate (ppm) | — | **388** | 35–180 |
| Sulfate (ppm) | — | 417 | — |
| Na (ppm) | 40 | **124** | — |
| SAR (RAS) | 0.86 | **1.29** | — |
| P (ppm) | ~1 | 1.7 | 5–50 |
| Fe (ppm) | — | 0.14 | 0.30–3 |

CE nearly 4× April and over the top of spec; Ca 471 / Mg 137 also high. P and
Fe stay locked-low — the high-pH lockout signature persists even as pH falls.


## The salt is saline, not sodic

- **SAR 1.29 is low** — sodium is a minor player. The dissolved load is
  dominated by Ca²⁺ + sulfate + nitrate, not Na⁺.

- Source: **CaSO₄ (gypsum) from the sulphur program** (sulfate 417) +
  **nitrate 388** from fish-N mineralisation. Both soluble, both non-structural.

- **Saline ≠ sodic → it leaches.** Plain clean water carries Ca-sulfate +
  nitrate down past the root zone. No gypsum amendment needed — the soil is
  already Ca-saturated. A sodic problem would first need Ca to displace Na;
  that is not this case.


## Consequences

- **Confirms the salt thesis in solution** → validates the −78% salt cut in
  `../strategy/fertigation-recipe.md`. June proves the EC was real and climbing,
  so the EC relief that cut was chasing is the biggest single benefit.

- **Keep the sulphur program; leach, don't pause** (Guillaume). Sulphur is still
  drawing pH down (7.48 → 6.68). The salt it co-produces is leachable, so the
  answer to the EC breach is an active clean-water leach —
  `../../protocol/salt-leach-DRAFT.md` — not halting sulphur. Live EC-overshoot
  note in `../soil-ph/model/derivation.md`.

- **The April "salinity cleared" verdict is now dated** —
  `../soil-ph/model/learnings/stuck-browning-roots-ph-indicated-salinity-cleared.md`
  held for April (CE 1.08); as of June, salinity is a live field constraint.

- **pH 6.68 is a secondary guardrail, not a new anchor.** The dose model still
  anchors on Mehlich-3 water pH (SME is soilless-referenced). 6.68 tracks
  sulphur-drawdown progress; it does not re-anchor the model.


## Caveats

- SME spec ranges are soilless/hydroponic — the Ca/Mg/CE "high" flags partly
  reflect the calcareous soil, not an actionable surplus. CE, Na/SAR, and the
  pH trend are the real reads; judge P on Mehlich-3 + tissue, not SME.

- One field sample, bag unlabelled by bed (report note) — no per-bed
  resolution. Between-bed spread lives in `../doc/bed-grid-2026-06-13/`.
