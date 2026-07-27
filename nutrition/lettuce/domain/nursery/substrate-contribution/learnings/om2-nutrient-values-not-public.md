# OM2 nutrient values are not published anywhere (2026-07-19)

## What was searched

Web workflow (`om2-nutrient-hunt`, 17 agents, 14 URLs) to find Berger OM2's
per-element nutrient supply and replace the cert-2 `OM2_STARTER_CHARGE_PPM`
placeholders (N 175 / P 50 / K 150 / Ca 200 / Mg 50, mg/L substrate).

## Outcome — no usable data

**Berger publishes zero numeric nutrient values for OM2.** Not N-P-K, not
Ca/Mg, not micros, not EC — on any surface (product page, official PDF
datasheet `om2_SeedGermination.pdf`, 2025 Germination Mixes brochure, OMRI
listing). Every numeric element figure in the corpus came from **non-OM2**
Québec/NB substrate studies on a **saturated-media-extract (SME) ppm =
mg/L-solution** basis — incompatible with the model's mg/L-substrate, and
2–6× off if naively mapped across. Do NOT fold those study ranges into the
placeholders.

## The two things it DID confirm (OM2-specific)

- **Incubated pH 5.2–6.0** — stated on both the Berger product page and the
  PDF. This is the one genuinely usable OM2 number. Note: it explains the
  operator's pour-through pH landing ~5.3 — that's near the mix's *native*
  equilibrium, not necessarily feed-driven acidification.

- **Ca and Mg present via dolomitic + calcitic limestone** — qualitative
  confirm, no rate. So "lime-buffered peat carries Ca/Mg" holds
  mechanistically; the quantity is still unknown.

## Discrepancy found

The 2025 brochure OMITS a fertilizer starter charge from OM2's ingredient
list, while the spec page calls it a "low fertilizer starter charge." So even
whether OM2 carries a meaningful N/P/K pre-charge is unconfirmed — the **N 175
placeholder is the shakiest** and may be well above the truth.

## Verdict

Placeholders stay cert 2, now flagged UNVERIFIED (not just un-refined). They
**cannot** be validated from public web. To move off cert 2:

1. Direct Berger agronomy request — starter-charge guaranteed analysis (%N-P-K),
   limestone type + rate, target EC.
2. If declined (proprietary charge — common): in-house SME lab test on a fresh
   OM2 batch, recording substrate density + dilution factor to convert
   SME ppm → mg/L-substrate.
3. The tissue test on 5-week trays at transplant remains the downstream check
   on whether the under-supply actually bites (esp. Ca → tipburn).

Until then, don't re-run the web search — it's a confirmed dead end.
