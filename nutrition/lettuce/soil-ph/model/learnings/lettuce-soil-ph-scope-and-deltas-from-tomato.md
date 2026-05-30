# Lettuce soil-pH subproject carved; deltas from the tomato sibling

**Date:** 2026-05-29
**Status:** accepted

Lettuce beds are Ca-saturated from the same calcitic-lime (CaCO₃) compost as tomato and read **SME pH 7.48 — more alkaline than tomato (SME 6.99 / water 7.28)** (Berger 39088, sample 596617, Apr 2026). So sulphur acidification applies to lettuce too, and likely harder. Carved `nutrition/lettuce/soil-ph/model/` mirroring `nutrition/tomato/soil-ph/model/`; the sulphur chemistry is shared (owned by the tomato sibling), only lettuce-specific numbers re-anchored.

## What changed vs the tomato sibling

| Axis | Tomato | Lettuce | Why it matters |
|---|---|---|---|
| Bed area | 54.7 m² | **30.4 m²** | per-bed kg differs at the same rate |
| Block / topsoil mass | 382.9 m² / 76 580 kg | **136.8 m² / 27 360 kg** | carbonate mass + S totals scale down |
| Tilled cap (~9.8 kg/100 m²) | 5.4 kg/bed | **~3.0 kg/bed** | porting 5.4 to a lettuce bed = ~2× over the ceiling |
| Standing cap (~4.5 kg/100 m²) | 2.5 kg/bed | **~1.4 kg/bed** | rarely used — lettuce flips fast |
| EC guardrail | ECe ≤ 2.5 dS/m | **ECe ≤ 1.3 dS/m** | lettuce salt-sensitive (FAO); ~half tomato |
| pH floor | 6.2 | **6.0** | lettuce tolerates the slightly lower floor |
| Default cadence | monthly surface (long standing crop) | **tilled-at-flip** (every few weeks) | crop turnover IS the application window |

## Key lettuce-specific call

**Tilled-at-flip is the default mode, not the exception.** Lettuce's fast turnover gives a bare-bed incorporation window every few weeks — so the higher tilled dose is the normal lever, applied at each flip, with a **pre-transplant EC check** because the gypsum/EC pulse lands as fast-cycle seedlings go in.

## Cert / data gaps

- SME pH 7.48 cert 4; **no direct Mehlich-3 water pH** on file → estimated ~7.77 (cert 2) via the tomato method offset. First refinement: get a water-pH reading.
- Free carbonate **unmeasured** (cert 0) — calcimeter is the go/no-go gate, same as tomato.
- **Lettuce root-zone target pH band is a PO gap** (no analogue to the tomato `soil-root-zone-ph-band` slug). Blocks the endpoint.
- Elemental sulphur — allowed (CAN/CGSB-32.311); micronized product + certificate still to be sourced/filed.
