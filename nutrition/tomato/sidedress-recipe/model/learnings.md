# Tomate — sidedress-recipe · learnings

Rejected alternatives and historical decisions. Live REQ-tied derivation
is in `derivation.md`.

---

## Rejected: K via Actisol sidedress

Actisol 5-3-2 carries ~1.66 % K (elemental, post-K₂O conversion).
Delivering T5 K demand (~6 000 mg/m²/wk after compost + bank pull) via
sidedress would require ~5 kg/m² Actisol/wk — absurd. K stays in
fertigation (K₂SO₄ 41.5 % K, ~10× denser per g product). Independently,
Actisol carries ~3 % Ca → gated out by REQ-089 on current Ca-saturated
soil. Two independent rejections.

## Rejected: extra P via sidedress

pH-locked at 7.3-7.5 (REQ-018 no decorative products). Added P doesn't
reach the plant; Mehlich bank already saturated. Sulfur program is the
only durable P lever.

## Rejected: Ca / Mg via sidedress

Compost residual covers both (Ca over-saturated, Mg via MgSO₄
fertigation + compost). Sidedress would worsen the Ca crisis — see
REQ-089 product gate.

## Rejected: micros via sidedress

Doses are mg/m²/wk; granular delivery too imprecise. Foliar bypasses
root chemistry.

## Rejected: blend optimization (mixed-product per-stage dose)

`computeStageSidedress(stage, product)` takes one product per call by
design. Mixed-product weighting (e.g. 60 % FarinePlumes + 40 %
AlfalfaMeal for N-with-K-trickle) was considered and rejected:
(a) operator weighs one product per planche per week — two-bag mixing
adds reliability risk vs. N-gap-coverage benefit that's nil at current
chemistry (FarinePlumes is N-only by label, Eco-luzerne adds
negligible K ~0.4 % elemental per the 3-0.5-2 label);
(b) the mass-balance simplifies to two independent runs summed if a
future blend ever becomes useful — no model-shape lock-in. If a
Ca-free K-bearing organic-N product surfaces, revisit. Until then,
single-product per call stays.

## Historical: REQ-089 was Actisol-specific

Pre-2026-05-09 the gate locked `actisol_g === 0` directly. Too narrow:
any future Ca-bearing product (Selectus 4-2-5, Ca-bearing frass) would
slip through. Generalized to `ca_pct === 0` 2026-05-09.

## Historical: SIDEDRESS_MIN_EFF / `Actisol_P` / `Actisol_K` legacy keys

`SIDEDRESS_MIN_EFF` is a derived backwards-compat view kept because
`app/index.html` consumers (`calcNutrSupply`, `computeStageRecipe`,
`additionFor`) still read the legacy keys directly. `Actisol_P` (0.50)
and `Actisol_K` (0.85) efficiencies retained for the same reason —
Actisol itself is gated out at runtime but its `eff` entries remain
referenced.
