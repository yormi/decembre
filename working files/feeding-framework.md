# Feeding framework — Ferme Décembre

Strategic reference: how we think about feeding. Numeric specifics live in
the spec tree; this file holds the policy / channel-hierarchy / bypass tables
still cited from code.

Last updated: 2026-05-02.

---

## 1. Demand drives everything

Yield is the input; demand is the output. Trust the Nutrition page
(admin, `#admin/nutriment`), not memory.

Per-element demand model: `nutrition/tomato/plant-needs/spec.md` +
`derivation.md`. Removal coefficients (g/kg fruit, mg/kg fruit) and cert
ratings live there; do not duplicate here.

Demand at 1.5 kg/m²/wk target (382.9 m² tomato, ~30 weeks):
N 3.75 g/m²/wk; K 5.25 g/m²/wk; B 4.5 mg/m²/wk (tightest of all elements).

---

## 2. Four-channel hierarchy ("the pantry")

Order of preference — go up the list only when forced.

| Channel | Role | $/kg N delivered |
|---|---|---|
| Soil reservoir | Slow buffer; built by annual amendments. K/Ca/Mg/micros for months; N via slow mineralization. | $0.50-1.50 |
| Side-dressing | Granular organic between rows; bridges peak weeks. Permanent backbone of organic N supply. | $2-3 |
| Fertigation | Soluble, daily delivery via Dosatron. K₂SO₄ + MgSO₄ today; oligos return when pH ≤ 6.5. | $5-7 (Chilean nitrate ref) |
| Foliar | Emergency / lockout workaround. Bypasses soil chemistry; Ca translocation fix. | $20-50 effective |

---

## 3. Maintenance-aversion principle

A channel needing daily/weekly hand-holding is rejected unless no alternative.

- **No organic N in fertigation** — biofilm risk (fish hydrolysate + warm
  dark lines = bacterial bloom, clogged drippers, Pythium amplification,
  Dosatron fouling). Liquid fish goes through manual drench, not lines.
- **No compost tea in fertigation** — same reason.
- **Foliar weekly is grudgingly accepted** while pH is locked; dropped the
  moment soil unlocks.
- **Granular side-dressing preferred over liquid drench** when timing
  allows — 4 spreader passes/season beats 8-12 manual drenches.

---

## 4. Bypass-efficiency tables (cited from code)

Source-of-truth for `app/index.html:3607` (Fe lockout 0.15), `:3906`,
`:3949` (organic P mineralization × Ca-P precipitation). Cert 3-4.

### At pH 7.4 (current)

| Nutrient | Bypass | Mechanism |
|---|---|---|
| N (NO₃⁻) | 70-90% | Mobile anion |
| Mo | 70-90% | More available at high pH |
| K (K₂SO₄) | 60-80% | Some leaches with SO₄, some weakly CEC-held |
| B (Solubore) | 50-70% | Anion, doesn't bind |
| Mg (MgSO₄) | 50-70% | Ca competition for CEC |
| N (organic, fish) | 30-60% | Microbial immobilization first |
| Mn (MnSO₄) | 10-30% | Oxidizes to MnO₂ |
| Fe (FeSO₄) | 10-20% | Fe²⁺ → Fe³⁺ → Fe(OH)₃ precipitation |
| Zn (ZnSO₄) | 5-20% | Zn-hydroxide / Zn-phosphate precipitates |
| P (any form) | 5-15% | Ca-phosphate precipitation |

### After pH drop 7.4 → 6.2 (soufre program target)

| Nutrient | At pH 7.4 | At pH 6.2 | Multiplier |
|---|---|---|---|
| Fe | 10-20% | 60-80% | 3-4× |
| Mn | 10-30% | 50-70% | 2-3× |
| Zn | 5-20% | 40-60% | 3-4× |
| P | 5-15% | 30-50% | 3-4× |
| K | 60-80% | 70-85% | 1.1× |
| Mg | 50-70% | 60-80% | 1.1× |
| N (NO₃⁻) | 70-90% | 70-90% | unchanged |
| N (organic) | 30-60% | 50-70% | 1.3× |
| B | 50-70% | 50-70% | unchanged |
| Mo | 70-90% | 50-70% | 0.8× (still fine) |

Strategic consequence: soufre unlocks 3-4× fertigation efficiency on
Fe/Mn/Zn/P. Foliar A retires once pH ≤ 6.5.

### Operational implication

- **Fertigate** (efficiency justifies labor): K, Mg, B, Mo, organic N, SO₄
- **Marginal but kept**: FeSO₄ in lettuce production fertigation (~15%, cheap)
- **Don't fertigate** (locked): P, Mn, Zn — foliar 3-5× more efficient
- **Foliar's role**: precisely Fe / Mn / Zn until soufre program completes

---

## 5. Soufre program (the lock-pick)

**Goal:** pH 7.3 → 6.5 to unlock P, Mn, Zn, Fe.

| Crop | Per application | Frequency | Cumulative |
|---|---|---|---|
| Tomato | 1.1 kg/bed (20 g/m²) | Monthly × 3-4 mo | ~60-80 g/m² |
| Lettuce | 1 kg/bed (33 g/m²) | Per Salanova flip × 3-4 | ~100-130 g/m² |

Timeline (cert 3-4):
- Month 0-1 (May): little visible change. Don't panic.
- Month 2-3 (Jun-Jul): first 0.1-0.3 unit drop visible. Re-test.
- Month 4-6 (Aug-Oct): 6.8-7.0 if program holds.
- Month 6-12: 6.5-6.8. P/Mn/Zn/Fe start unlocking.
- Forever: maintenance for sonotube leaching.

**Decision points:**
- End-Jul 2026 re-test. If pH < 7.0 → pilot sulfate oligos in fertigation
  with tissue-test validation.
- pH < 6.8 → drop foliar A, switch to fertigation oligos (PA Taillon's
  April 2026 recipe).
- pH stalls > 7.1 by August → consult Climax before doubling dose.

**Cycle reality:** current tomato crop-out July 2026; soufre won't unlock
root zone before crop-out. Benefit lands on fall 2026 cycle.

---

## 6. Where this goes once pH is fixed

Trigger: soil pH ≤ 6.5, validated by tissue Fe/Mn/Zn.

| Channel | Current | Post-fix |
|---|---|---|
| Soil reservoir | Compost (over-Ca'd, retired) | Ca-neutral compost + maintenance soufre |
| Side-dressing | Actisol + farine de plumes weekly | Same — permanent |
| Fertigation | K₂SO₄ + MgSO₄ | + sulfate oligos (Mn/Zn/Fe/Cu/B/Mo) |
| Foliar A (Wed) | Weekly | Dropped (equipment for emergencies) |
| Foliar B (CaCl₂) | Weekly Fri | Event-driven on high-RH / BER-risk weeks |

Net: ~3 h/wk spray labor recovered.

---

## Cross-references

- Demand model: `nutrition/tomato/plant-needs/`
- Fertigation recipe (live): `nutrition/tomato/fertigation-recipe/`
- Foliar recipe (live): `nutrition/tomato/foliar-recipe/`
- Side-dressing: `nutrition/tomato/sidedress-recipe/`
- Compost contribution: `nutrition/compost-contribution/`
- Symptom-driven diagnosis: `working files/symptomes-carences.md`
- Soil tests: `nutrition/doc/`, water `farm info/`
