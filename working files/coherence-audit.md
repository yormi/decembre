# Coherence audit — nutrient model

Date: 2026-05-05. Largely superseded — most findings resolved, migrated to spec, or absorbed into `unified-backlog.md`. Kept as the historical 21-finding ledger; see resolution column.

For per-finding live status, see `unified-backlog.md` (F1-F21).

---

## Findings ledger (status as of 2026-05-16)

| # | Topic | Severity | Status |
|---|---|---|---|
| F1 | `BIOMASS_DEMAND[T5]` split-sum is identity-by-construction | minor | pending (cosmetic — strip "sanity check" framing) |
| F2 | K/Mg fertigation 2-4× T5 demand (luxury) | important | open — gated on tissue test; ties to REQ-014 (`nutrition/tomato/spec.md`) |
| F3 | A↔B foliar warning text references P (legacy) | minor | resolved pre-2026-05-05 |
| F4 | Spray A residue × Spray B CaCl₂ interaction undocumented | minor | resolved pre-2026-05-05 (comment-only) |
| F5 | Lettuce demand model entirely absent | important | open — see `nutrition/lettuce/spec.md` scope |
| F6 | Iron coherence: 4 channels mismatched | important | partial — Iron DL + yucca permanently dropped 2026-05-05; lettuce FeSO₄ still in recipe |
| F7 | Side-dress P at pH 7.4 ignored Ca-P precipitation | important | resolved 2026-05-05 — `phLockoutFactor_P` applied (see `nutrition/tomato/sidedress-recipe/spec.md` REQ-089) |
| F8 | Lettuce predicted CE ~5.9 mS/cm during fertigation | blocking | open — REQ-024 (`nutrition/spec.md`) silent on per-shot vs time-avg; see Ch12 |
| F9 | CaCl₂ Teris Ecocert SKU not verified | blocking | open — REQ-002 / REQ-022 (`nutrition/spec.md`) |
| F10 | Solar weeks 19-52 silent fallback to monthly | important | blocked on user data; see REQ-009 (`nutrition/spec.md`) |
| F11 | `SME_TEST_DATE` staleness threshold 12 wk vs baseline 4-6 wk | minor | resolved 2026-05-05 — cut to 6 wk |
| F12 | Sulfur dose: tomato 2.0 vs lettuce 3.3 kg/100 m² inconsistent | minor | open — biological argument pending |
| F13 | Cert annotation coverage ~38% (REQ-028 target 90%) | minor | deferred until recipe-model rebuild |
| F14 | Cross-channel double-counting (K, N) | important | resolved 2026-05-05 — sidedress reframed as bank-maintenance, dropped from supply sum |
| F15 | REQ-012 violation: no `CHANNEL_ROLE` for micros | minor | resolved 2026-05-05 — `CHANNEL_ROLE` added (REQ-011 `nutrition/tomato/spec.md`) |
| F16 | Yucca pending; FeSO₄ bridge active | blocking | resolved 2026-05-05 — Iron DL + yucca dropped permanently; FeSO₄ 80 g canonical; coverage fixed 0.30 |
| F17 | "Stop watering 4 days before transplant" not in app | important | open — operational rule still only in baseline doc |
| F18 | `NUTR_BIOMASS = 1.0` dead code | minor | resolved 2026-05-05 — constant deleted |
| F19 | Side-dress P column missing pH-aware status in Bilan | minor | resolved (subsumed by F7) |
| F20 | `LETTUCE.feSulfate` lacks per-element delivery surface | minor | subsumed by F5 |
| F21 | Bilan Block 5 P lever contradicts Block 3 sidedress P | important | resolved (subsumed by F7) |

---

## Top 3 priorities (live, 2026-05-05 snapshot)

1. F9 — CaCl₂ Teris Ecocert SKU verification (blocking).
2. F8 — Lettuce predicted CE ~5.9 mS/cm during fertigation (blocking if per-shot interpretation).
3. F2 — K/Mg fertigation 2-4× T5 demand (gated on tissue test).

---

## Open findings — load-bearing details

### F2 — K/Mg luxury feeding at T5

At T5 with fertigation + sidedress + soil mass-flow (yield 1.5 kg/m²/wk):

| El | Demand | Supply | Ratio |
|---|---|---|---|
| K  | 5 250 | 11 461 | 2.18× |
| Mg |   600 |  2 560 | 4.27× |
| Ca | 2 250 |  6 106 | 2.71× |
| N  | 3 750 |  4 162 | 1.11× |
| P  |   600 |    136 | 0.23× (locked) |

REQ-014 (`nutrition/tomato/spec.md`) upper bound 1.3×. K/Mg/Ca exceed. Decision deferred until tissue test confirms K luxury isn't masking another issue. Cert 3 (sensitive to 25.5 L/m²/wk transpiration assumption — Ch24 in `unified-backlog.md`).

Note: F14 reframe (2026-05-05) dropped sidedress from the supply sum; values above are pre-reframe. Post-reframe K supply ≈ 11 229 (fert + soil), Mg ≈ 2 560 — ratios still well above 1.3×.

### F5 — Lettuce demand model absent

`BIOMASS_DEMAND` is tomato-only; `calcNutrDemand` iterates `TOMATO_FRUIT_EXPORT` keys only; `calcNutrSupply` hardcoded to tomato area. `LETTUCE = { mgSulfate: 467, kSulfate: 2996, feSulfate: 7.5 }` per 100 m²/wk → K rate ~4× typical Salanova demand (~3 g K/m²/wk, cert 3). Recipe ungrounded. See `nutrition/lettuce/spec.md` for current scope.

### F6 — Lettuce fertigation FeSO₄ contradicts Cadre framework

`LETTUCE.feSulfate = 7.5` (acidic-pH bypass framework says "do not fertigate"). Internal coherence: code acknowledges ~15% efficiency but recipe keeps the product. Decision deferred — keep with explicit `decorative: false, accepted: { reason }` annotation until lettuce cycles return to ≤3 wk.

### F8 — Lettuce predicted CE ~5.9 mS/cm during fertigation

Per-shot calc (week 18, peak season): K₂SO₄ stock 176 g/L (above 100 g/L solubility cap) → irrigation 3.53 g/L → **~5.9 mS/cm** per-shot. Time-averaged across week ~2.0 mS/cm (in band). Tomato T5 same calc ~2.3 (clean). Lettuce ceiling 2.7 (REQ-024 `nutrition/spec.md`); REQ-024 silent on per-shot vs time-avg. Recommendation: cut `LETTUCE.kSulfate` 3× (2996 → ~1000) + clarify band interpretation. Don't act blindly — measure pour-through first.

### F9 — CaCl₂ Teris Ecocert SKU unverified

`index.html:2364-2366`: "Ecocert input listing not yet verified for the Teris industrial grade — confirm before scaling. CaCl₂ as a substance is permitted under CAN/CGSB-32.311." Active in `FOLIAR.tomato.B`. REQ-002 / REQ-022 violation until verified. Cert 4 that this resolves to "yes, allowed" once contacted.

### F10 — Solar weeks 19-52 silent fallback to monthly

`SOLAR_BY_WEEK` covers weeks 1-18; `getSolarRad()` falls back to `SOLAR_BY_MONTH` silently for weeks 19+. Cert drops 5 → 3 with no UI warning. As of 2026-05-05 (week 19) the model is on the fallback. Resolution: extend `SOLAR_BY_WEEK` to 52 weeks with 20-yr Quebec City data (REQ-009 `nutrition/spec.md`).

### F12 — Sulfur dose inconsistent across crops

Tomato 1.1 kg/planche/mo = 2.0 kg/100 m² (low end of 2-3 kg baseline band). Lettuce 1 kg/planche at retournement = 3.3 kg/100 m² (above upper bound; cumulative ~6.6 kg if 2 turnovers/mo). Decision pending — depends on whether higher lettuce dose was intentional (cert 2 on whether it's a practical problem; cert 4 on the band breach).

### F17 — Pre-transplant hardening rule missing from app

Baseline §Watering: "Stop watering 4 days before transplant — physically separate week-5 trays." Nursery page (`index.html:907-919`) lists 9 steps; no hardening step. Critical for tray-finishing / 150 g/plant push. Operational rule lives only in baseline doc. Resolution: add hardening card with DLI-based formula (3-6 days).

---

## Cross-cutting note — REQ-002 / REQ-022 (Ecocert coverage)

Explicitly annotated ✅ in code: K₂SO₄, MgSO₄, FeSO₄, Actisol, farine de plumes, Solubore, soufre, Iron DL (now dropped), Acadie products, luzerne, frass (conditional).

Unverified / pending: **CaCl₂ Teris grade** (F9 — blocking), **MnSO₄ / ZnSO₄ / CuSO₄ / Molybdate de sodium** (no inline annotation; conventionally allowed but unstated per CLAUDE.md `feedback_organic_cert_flag`), **Yucca** (dropped 2026-05-05), **EZ-GRO Ocean** (still in nursery sem 4-5; no annotation in code).
