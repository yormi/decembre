# Compost-contribution · learnings

Rejected alternatives and historical decisions. Current REQ-tied
rationale lives in `derivation.md`.

---

## Mg stored value — chose 0.50 over theoretical 0.658 g/m²/wk (2026, ongoing)

Savaria label declares N / P / K / Ca but not Mg. We assumed ~0.3 %
(low-end shrimp-base compost), which yields theoretical 0.658 g/m²/wk.
Stored value held at **0.50** (~25 % below theoretical).

- Label gap → cert 1 on the underlying assumption.
- Conservative-down protects against silent under-fertigation: if
  compost Mg is absent we'd add Mg via fertigation; relying on
  assumed compost Mg silently could under-supply.
- Override removed when vendor QC confirms a measured Mg %.

---

## Q10 seasonal factor — single 1.5× scalar, not per-month curve

Textbook Q10 ≈ 2 for soil microbial activity. Greenhouse soil sits
12-22 °C across seasons; production months cluster at upper end. A
single 1.5× scalar = the mid-band of that boost vs. annual mean.

Considered per-month multipliers; deferred because the stage-aware
demand model already smooths sub-stage temporal resolution. Revisit
if Bilan ever needs week-by-week compost-flux granularity.

---

## Decline curve — flat year-1 rate v. piecewise/exponential

v1 holds release flat through ~2027-04 (18 months post-application).
Real curve drops as labile fraction depletes. Shape unknown without
measured data.

Target shape from organic-N residue literature (Stanford & Smith):
~50 % year-1, ~25 % year-2, ~12 % year-3 for high-quality compost.
Wire when operator-facing decisions depend on the late-stage curve
(spec.md → Pending).

---

## Multi-amendment handling — deferred

If a new compost amendment is applied, two options:
(a) extend `COMPOST_AMENDMENT` to a list and sum contributions, or
(b) replace the constant when the new amendment dominates.
Mass-balance formula is identical per amendment.
