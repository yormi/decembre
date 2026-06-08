# Protocol — sulphur pH drawdown (SG1 root-cause)

Elemental-S soil correction. Model: `../../tomato/soil-ph/model/derivation.md`.
Endpoint band: `../../tomato/soil-ph/model/learnings/define-soil-root-zone-ph-target-band.md`.

**Scope:** tomato block, 7 beds × 54.7 m². Standing crop → surface/band
(no till mid-crop). Figures are **elemental S**; **product = S ÷ 0.90** (Tiger 90CR).

## Gates — clear ALL before first pass

| Gate | Why | Status |
|---|---|---|
| Calcimeter free-carbonate % | Sets total S + feasibility. >1% = impractical mid-crop. | ⏳ ordered |
| Foliar Mn zeroed | Deeper floor (5.8) conditioned on it. | start now |
| Bed aerobic | S⁰ + waterlogged → H₂S root burn. | per-pass |

Tiger 90CR cert: ✅ Ecocert, cleared.

## Dose — per bed (54.7 m²)

- **Open:** 1.5–2.0 kg S (~1.7–2.2 kg Tiger). Not high-end blind.
- **Per-pass cap:** 2.5 kg S (acid-microzone limit near live roots).
  High end only after a clean 4-wk EC+pH check.
- Scratch in lightly. Never a concentrated band on the root mat.

## Cadence — recommended: weekly two-phase ramp

Coarse-then-fine titration steered by the weekly pen: push hard while
the carbonate buffer is thick (overshoot impossible), step down before
the unbuffered zone, coast into band. Feedback-steered → self-corrects
if carbonate is higher than assumed (coarse phase just runs longer), so
it's safe to start before the calcimeter lands.

| Phase | Dose (Tiger/bed/wk) | You're in it when |
|---|---|---|
| **Coarse** | 1.0 kg | pH ≥ ~6.8 **and** weekly Δ ≤ ~0.2 |
| **Fine** | 0.5 kg | pH < ~6.8 **or** Δ accelerates 2 wks running |
| **Stop** | 0 | pH ~6.6–6.7 — let the pipeline coast you to 6.0–6.5 |

- **Switch on rate, not just absolute pH.** pH lags buffer state — by
  the time it drops fast the buffer's already gone. The earlier warning
  is the *same dose moving pH more*: when weekly Δ jumps (e.g. 0.1–0.2 →
  0.3+), the buffer is thinning → drop to 0.5 kg now.
- **Stop short.** Quit dosing at ~6.6–6.7; committed un-oxidised S
  carries pH down the last bit. Smaller doses near the end = smaller
  carry = smaller overshoot.
- **Trigger on 2 readings, not 1** — pen noise is ±0.1; one week's wiggle
  isn't a trend. Downshift on two consecutive rising deltas.

**Fallback cadences (lower labour, no weekly pen):**
- **Monthly** 2.5 kg/bed: steady state, lag inside the 4-wk window.
- **Real accelerator = tilled bare-bed window between crops** (5.4 kg/bed,
  full 20 cm incorporation, no live-root risk) — not higher standing
  frequency.

## Guardrails — monitor, don't count

- **pH:** retest **weekly** before each dose on the ramp (every 4 weeks
  on the monthly fallback). **Stop dosing at ~6.6–6.7; aim 6.3; floor 5.8.**
  Any single week dropping **>0.4 → hold**, don't dose until the next read
  confirms where it settled.
- **EC:** root-zone ECe ≤ 2.5 dS/m (~1.0–1.2 on 1:2). Near it → skip/cut
  next. EC near cap *and* pH still high → **skip, don't push.**
  (Gypsum self-limits ~2.0–2.2; salt mostly transient.)
- **Aeration:** never dose waterlogged.
- **Mn:** foliar Mn zero through drawdown; tissue Mn next panel = stop trigger.

## Abort

pH probe unmoved by **~4–5 wk** → carbonate sink > 0.1%. **Stop, recheck
vs calcimeter. Don't dose blind.**

## Timeline (provisional, 0.1% carbonate, monthly 2.5 kg/bed)

| Signal | When |
|---|---|
| Soil pH starts dropping | ~3–4 wk |
| SME / sap P rises | ~4–8 wk |
| Visible new-apex gain | ~8–12 wk |

Total to "healthy roots + P ≥ 0.50%": ~6–8 mo monthly / ~4–5 mo biweekly.
Binding term = CEC-buffered drawdown, not oxidation. **Between-cycles
soil-prep lever, not a current-crop rescue** — judge on new growth.

## Maintenance

Concrete sonotubes leach Ca/alkalinity continuously → no finite dose
*holds* pH. In band 6.0–6.5 → maintenance holding dose, same pH/EC guardrails.

## Monitoring

- pH probe: **weekly** on the ramp / every 4 weeks on the monthly fallback.
  Same pen, same slurry method, same person each time — the *delta* is what
  steers, so consistency beats absolute accuracy. Calibrate (pH 4 + 7) each
  session; store the pen in KCl, not water.
- Tissue P: quarterly. Tissue Mn: every panel.
- EC pen: each pass, before dosing.
