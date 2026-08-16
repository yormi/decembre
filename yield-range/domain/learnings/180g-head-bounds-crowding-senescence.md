# 180 g healthy head bounds the crowding-senescence law (2026-08-12)

## Decision

The 2026-07-09 field head (180 g, healthy, 5 rangs × 6 po, ~6 weeks in bed,
July sun — `doc/data-points.md` § Field head) is adopted as a **refuting
bound** on the current senescence parameters: a canopy held closed for weeks
does not lose 4 %/day from 1,7 days after closure. Parameters are NOT refit
yet — held pending the `PLUG_DRY_MATTER_FRACTION` measurement and an
age-dependent `SPECIFIC_LEAF_AREA`, because the same observation implicates
all three constants and refitting one against unmeasured others just moves
the error.

## What the head proves

- At 232 cm²/plant the canopy re-closes within ~1–2 weeks of transplant even
  from a weak 10–20 g start → the head sat **~4 weeks closed** and came out
  healthy at 180 g. Current law (onset 1,7 d, −0,04/day) predicts collapse to
  well under closure weight — direction and magnitude both wrong.
- Carbon supply is not the issue: 232 cm² × ~27 mol/j × 0,88 × 1,1 g/mol
  ≈ 0,6 g dry/day → 4–5 closed weeks supply ~20+ g dry; 180 g fresh needs
  only ~9–13 g dry. Growth past closure continues at reduced rate; it does
  not flip negative.
- With seedling SLA + 7 % DM the head implies LAI ~8; with suspected mature
  values (SLA lower, DM 0,045–0,05) it implies LAI ~4–5. The gap is the SLA /
  DM error, not evidence of impossible leaf area.

## What it does NOT prove

- Not a growth-rate anchor: 6 estimated weeks in bed, weak transplant, aphid
  pressure — too fuzzy to fit ε or RGR against.
- Does not kill senescence as a mechanism (inner leaves can still be lost in
  a held bed); it kills the current onset + rate as *whole-head* dynamics.

## Consequences already drawn

- Post-closure engine outputs (field plateau bands, "harvest at peak day N",
  kg/bed at held densities) are biased low and not decision-grade until the
  refit.
- Pre-closure geometry (closure days, thinning schedule, densities,
  tray-demand tables in `domain/lettuce/sequence.md`) is unaffected — it is
  leaf-area geometry with photographic anchors.

## Refinement trigger

Refit `SENESCENCE_ONSET_DAYS` + `SENESCENCE_DECLINE_RATE` (and revisit
`senescence-crowding-only-loose-leaf.md`) once measured plug dry-matter
fraction and a mature-leaf SLA exist; use this head as the lower-bound check
any refit must pass: closed ≥3 weeks → still ≥180 g healthy at 232 cm².
