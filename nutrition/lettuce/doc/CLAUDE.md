# nutrition/lettuce/doc — lettuce reference docs index

Primary-source docs for the salanova production crop (lab analyses, bed readings, field/seedling diagnostic photo sets). Broader nutrition context: `../../doc/CLAUDE.md`. Nursery-side docs: `../../nursery/doc/CLAUDE.md`.

---

### `sme-laitue-sous-lampes-2026-06-15.pdf`
Berger lab SME (saturated-media-extract) analysis — sample "laitue 15 juin 2026" (#605536), lettuce beds under lamps. Cert d'analyse #39580, demande 260016385, requester Catherine Sylvestre, received 2026-06-17 / completed 2026-06-19. Out-of-spec flags: pH, CE, nitrate, Ca, Mg above spec; P, Fe, Al below spec.

**Reach for:**
- The actual measured root-zone chemistry behind a salinity / pH / nutrient-lockout read on the lit lettuce beds (CE 4.01, pH 6.68, NO₃ 388 — high-salt signature matching the field tip-burn/bronzing diagnostics).
- Cross-referencing the lettuce fertigation strategy (`../strategy/fertigation-recipe.md`) against measured soil-solution K / Mg / Na / sulfate.
- Comparing against the per-bed Pulse/1:1 grid (`bed-grid-2026-06-13/`) and the tissue test `LAIT #1` driving the corrected recipe.

What it changed: `../learnings/field-sme-salinity-climbed-2026-06.md` (salt climbed April→June, over the soil-pH sulphur guardrail).

⚠️ **SME spec min/max are soilless/hydroponic ranges — do not read them as soil deficiency thresholds.** The flagged-low P (1.7) especially: lead soil P reads with Mehlich-3 + tissue, not SME. See `../../../` memory `sme-spec-ranges-dont-apply-to-soil`.

---

### `bed-grid-2026-06-13/`
Spreadsheet grid of per-bed readings, six beds (A–D Nord, E Sud, F Sans lumière): transplant date, EC 1:1 (Pulse slurry), EC peak in-soil (Pulse), pH 1:1, soil temp. Source of truth for the raw bed figures. See its own `CLAUDE.md` for the EC-scale caveat + Pulse-vs-1:1 learning.

**Reach for:** raw bed EC/pH/temp behind any salinity or setpoint-band read; which bed runs hot/salty/high-pH.

---

### `diagnostic-2026-06-06/`
First structured read of the salanova yield problem: 8 photos (seedling weight series 15 Apr–8 May + cold vs heated/lit field beds + washed bolted transplant) + heated-vs-unheated soil pH. Per-photo reads + diagnosis in its `diagnosis.md`.

**Reach for:** framing yield-recovery strategy; why the heated/lit/CO₂ bed underperforms the cold no-input bed; seedling-quality / transplant-shock story.

---

### `diagnostic-2026-06-12/`
Live-crop follow-up: 33 field/tray photos (IMG_4663–4695), salanova green + red. Aggregate read in its `diagnosis.md`; per-photo cards render via `../strategy/lettuce/diagnostic-photos.html`. Confirms field tip-burn (23/33) + two new signals (rot + chewing) at the crowded tray core.

**Reach for:** current field symptoms; tip-burn / marginal-necrosis spread; nursery (6 juin) vs field (12 juin) comparison.

---

## Conventions

Each entry: filename/dir, one-line "what + who/when", then **reach for** list. Subdir entries have their own `CLAUDE.md` — this index is the hub. Don't transcribe data — open the file when you need numbers.
