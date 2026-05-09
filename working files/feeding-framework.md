# Feeding framework — Ferme Décembre

How we think about feeding the plants. Strategic reference; updated when the
soil pH program changes phase or a channel's rationale shifts.

Last updated: 2026-05-02

---

## 1. The demand drives everything

Plants take up nutrients in proportion to their growth rate. **Yield is the
input; demand is the output.** Once we know the target yield, we know the
weekly demand for every element. Everything else is plumbing.

**Tomato whole-plant uptake per kg fresh fruit produced** (validated against
Yara + Sonneveld, 2026-05; see code comment at `TOMATO_REMOVAL` in `index.html`):

| Element | g/kg fruit | Cert |
|---|---|---|
| N  | 2.5 | 4 |
| P  | 0.4 | 4 |
| K  | 3.5 | 4 |
| Ca | 1.5 | 4 |
| Mg | 0.4 | 4 |

| Element | mg/kg fruit | Cert |
|---|---|---|
| Fe | 10   | 2 |
| Mn | 5    | 2 |
| Zn | 3    | 2 |
| B  | 3    | 2 |
| Cu | 1    | 2 |
| Mo | 0.05 | 2 |

**Demand at 1.5 kg/m²/week target** (382.9 m² tomato area, ~30 weeks production):
- N: 3.75 g/m²/wk → ~25-30 kg N for full season after compost contribution
- K: 5.25 g/m²/wk → mostly from fertigation + soil reservoir
- B: 4.5 mg/m²/wk → currently the tightest of all elements

The Bilan page (admin) computes this dynamically. Trust the Bilan, not memory.

---

## 2. The four-channel hierarchy ("the pantry")

We feed plants through four channels. The order of preference is intentional
— each has a role, and we go up the list only when forced.

### Soil reservoir = the pantry

Slow, stable, large buffer. Built up by annual amendments (compost, lime,
soufre, gypsum, rock minerals). Holds K / Ca / Mg / micros for months.
Releases N slowly via microbial mineralization. **Cheapest source of nutrients
per kg delivered (~$0.50-1.50 / kg N).**

### Side-dressing = stocking the pantry mid-season

Granular organic amendments applied between rows when the pantry runs low.
Bridges the gap between the slow soil reservoir and weekly demand peaks.
**~$2-3 / kg N delivered.** 3-5 manual passes per cycle, but no daily
maintenance — once spread, it's working.

### Fertigation = daily delivery for what the pantry can't supply at the right rate

Soluble forms in the irrigation barrel. We use this for **K₂SO₄ and MgSO₄
only** today — both are stable in solution, no biofilm, fully automated via
Dosatron. **In healthy organic soil this is also where soluble micros live**
(after pH fix, sulfate oligos go back into the barrel per the original Climax
recipe).

### Foliar = emergency / lockout workaround

What the soil and fertigation can't deliver — either because of root-zone
lockout (current state at pH 7.4) or because translocation is the limit
(Ca → BER). **Most expensive per kg actually absorbed (~$20-50 / kg N
effective)** because foliar coverage is 30% without yucca. Highest labor.

---

## 3. The maintenance-aversion principle

We are deliberately maintenance-averse. **A channel that requires daily or
weekly hand-holding is rejected unless there's no alternative.** Concrete
implications:

- **No organic N in fertigation.** Fish hydrolysate + warm dark lines = bacterial
  bloom = clogged drippers, anaerobic zones, Pythium amplification, Dosatron
  fouling. The mitigation list (UV, sub-100 µm pre-filter, weekly H₂O₂ flush,
  same-day-only mixing, line purge after every event) is too brittle for a
  small team. **Liquid fish goes through manual drench, not lines.**
- **No compost tea in fertigation** for the same reason.
- **Foliar weekly is grudgingly accepted** while pH is locked, but only because
  there's literally no other path for Mn/Zn/Fe right now. **The moment soil
  unlocks, foliar A is gone.**
- **Granular side-dressing is preferred over liquid drench** when the timing
  doesn't matter to the week — slow release smooths variance and 4 spreader
  passes / season is less labor than 8-12 manual drench events.

When a constraint is fixable (pH lockout), we exit the workaround. We don't
keep workarounds as permanent program elements.

---

## 4. The current pantry (May 2026)

From Berger Labs soil test (April 2026), translated into pantry status:

| Element | Reservoir (Mehlich-3) | Bioavailable (SME) | Pantry status |
|---|---|---|---|
| K  | 2 118 kg/ha | 292 ppm soil paste | **Overflowing.** No amendment needed. |
| Ca | 10 989 kg/ha | Saturated | **Overflowing — root cause of crisis.** Translocation, not supply, is the BER limiter. |
| Mg | 1 646 kg/ha | Adequate | Comfortable. Antagonized by Ca but not deficient. |
| P  | 558 kg/ha | **0.8-1.1 ppm** vs 5-50 spec | Physically present, **locked at root by pH**. |
| Mn / Zn / Fe | not on Mehlich | **Below detection in SME** | Locked. Foliar-only until pH drops. |
| N  | not directly tested | Compost mineralization estimated 1.5 g/m²/wk in May | **Likely insufficient** at peak demand → side-dressing required. |

**Translation:** the pantry is actually full of K / Ca / Mg / P / Mn / Zn / Fe
in absolute terms. The pH is the lock that holds half of it shut. Until the
lock comes off, we can't access P / Mn / Zn / Fe through the soil channel
at all — they're foliar-only.

---

## 5. The bypass-efficiency math (why the pH lock matters quantitatively)

Section 4 says "half the pantry is locked." This section quantifies exactly how
much. It's the math behind every "should we fertigate X?" decision and
the strategic case for the soufre program.

**The premise:** when an ion in fertigation hits the soil, it races against
soil chemistry to reach the root. The plant wins for some ions; the soil
chemistry wins for others. The split depends on ion reactivity, soil pH, and
CEC composition.

### Per-nutrient bypass efficiency at pH 7.4 (current)

How much of each fertigated ion actually reaches the plant before being
intercepted by soil chemistry. Cert 3-4 across the table — actual values
depend on soil texture, drainage, root density, irrigation timing.

| Nutrient | Bypass | What happens to the rest |
|---|---|---|
| **N (NO₃⁻)** | **70-90%** | Mobile anion, doesn't bind to soil; either taken up or leaches |
| **Mo** | **70-90%** | Favored at high pH — actually MORE available than at lower pH |
| **K (K₂SO₄)** | **60-80%** | Some leaches with SO₄, some weakly held by CEC |
| **B (Solubore)** | **50-70%** | Anion, doesn't bind; either taken up or leaches |
| **Mg (MgSO₄)** | **50-70%** | Same as K, slightly worse due to Ca competition for CEC |
| **N (organic, fish)** | **30-60%** | Microbes immobilize first, plant gets later via slow mineralization |
| **Mn (MnSO₄)** | **10-30%** | Oxidizes to MnO₂, locks into soil minerals |
| **Fe (FeSO₄)** | **10-20%** | Fe²⁺ oxidizes to Fe³⁺ within hours, precipitates as Fe(OH)₃ |
| **Zn (ZnSO₄)** | **5-20%** | Forms Zn-hydroxide and Zn-phosphate precipitates |
| **P (any form)** | **5-15%** | Precipitates immediately as Ca-phosphate at this pH |

**Pattern:** mobile anions (NO₃⁻, B, SO₄), Mo, and the cations that lose
the CEC-competition fight (K, Mg) all pass through to plants well. The
reactive cations and P get locked up — these are the four nutrients foliar
exists to bypass (Fe, Mn, Zn) plus P (which we don't even try to fertigate).

### Effect of dropping pH 7.4 → 6.2 (the soufre program)

The lockout primarily affects four nutrients. Fixing the pH multiplies
fertigation efficiency on those four; the rest barely change.

| Nutrient | At pH 7.4 | At pH 6.2 | Multiplier |
|---|---|---|---|
| **Fe** | 10-20% | 60-80% | **3-4×** |
| **Mn** | 10-30% | 50-70% | **2-3×** |
| **Zn** | 5-20% | 40-60% | **3-4×** |
| **P** | 5-15% | 30-50% | **3-4×** |
| K | 60-80% | 70-85% | 1.1× |
| Mg | 50-70% | 60-80% | 1.1× |
| N (NO₃⁻) | 70-90% | 70-90% | unchanged |
| N (organic) | 30-60% | 50-70% | 1.3× |
| B | 50-70% | 50-70% | unchanged |
| Mo | 70-90% | 50-70% | 0.8× (slightly worse, still fine) |

**Strategic consequence:** the soufre program isn't just "unlock the soil
reserves." It also makes future fertigation **3-4× more efficient on Fe,
Mn, Zn, P**. The work currently done in foliar to bypass these four
nutrients can come back into fertigation channel once pH ≤ 6.5 — that's
why section 7 ("where this goes once pH is fixed") shows foliar A being
dropped entirely.

### Operational implications

Already encoded in current operations, repeated here for traceability:

- **Fertigate** (efficiency justifies labor): K, Mg, B, Mo, organic N, SO₄
- **Marginal but kept** (cheap, some benefit): FeSO₄ in lettuce production
  fertigation — ~15% passes, but it's cheap and helps stretched cycles
- **Don't fertigate** (locked): P, Mn, Zn — the soil wins the race; foliar
  is 3-5× more efficient for these
- **Foliar's role is precisely those locked nutrients** — Fe, Mn, Zn — until
  the soufre program completes

The matching app reference is the **Cadre** admin page (`#admin/cadre`)
which renders the bypass tables visually for in-greenhouse reference.

---

## 6. The soufre program (the lock-pick)

**Goal:** drop soil pH from 7.3 to ~6.5 to unlock root uptake of P, Mn, Zn,
Fe.

**Current schedule** (started week of 2026-04-29; pH tested at 7.3 same week):

| Crop | Application | Frequency | Per m² |
|---|---|---|---|
| Tomato beds | 1.1 kg / bed (= 20 g/m²) | Monthly × 3-4 months | ~60-80 g/m² total |
| Lettuce beds | 1 kg / bed (= 33 g/m²) | At each Salanova flip × 3-4 months | ~100-130 g/m² total over the program |

Total program intensity: roughly **80-130 g elemental S / m² over 3-4 months**.

**Expected timeline** (cert 3-4 — actual response depends on soil temperature,
microbial activity, soil moisture):

- **Month 0-1 (May):** little visible pH change. Soufre microbially oxidizes
  to sulfate slowly; calcareous Ca buffers fight back. Don't panic, don't
  re-apply more aggressively.
- **Month 2-3 (June-July):** first 0.1-0.3 unit drop visible. Re-test.
- **Month 4-6 (Aug-Oct):** target 6.8-7.0 if program continues at this rate.
- **Month 6-12:** reach 6.5-6.8. P, Mn, Zn, Fe start unlocking.
- **Forever after:** maintenance applications. The 60 sonotubes leak Ca
  permanently — never stop the soufre.

**Decision points:**

- **End of July 2026:** soil re-test. If pH < 7.0, start a pilot of sulfate
  oligos in fertigation (parallel with foliar A, validate uptake via leaf
  tissue test).
- **If pH < 6.8:** drop foliar A, fully switch to fertigation oligos (PA
  Taillon's original April 2026 recipe).
- **If pH stalls > 7.1 by August:** re-evaluate. Could be soil too dry (S
  oxidation needs moisture), too cold, or dose insufficient. Consult Climax
  before doubling.

**Reality check on the 2026 tomato cycle:**

Tomatoes are scheduled for crop-out July 2026 (transplanted mid-December
2025, ~7-month cycle). The soufre program won't drop pH fast enough to
unlock the root zone *before this cycle ends*. **The current tomato crop
gets the foliar program for its remaining ~3 months. The benefit lands on
the NEXT tomato cycle starting fall 2026.**

This is not a reason to slow the soufre program — earlier intervention =
earlier unlock = better next cycle.

---

## 7. The current annual cycle (May 2026)

**Pre-plant (annual):**
- Compost: was the root cause of the crisis (Savaria ORGANIMIX added too
  much Ca). Future: gypsum + soufre, no calcitic-amended compost.
- Soufre: monthly through summer; maintenance applications indefinitely.

**Side-dress (PA Taillon × 1,5, granular weekly per stage — see Sol page):**
- Weekly per planche, both products: Actisol 5-3-2 + farine de plumes 13-0-0
- Doses ramp T1 (57 + 84 g) → T5 (900 + 1 341 g) per planche per week
- Cycle total ~28 kg N over 28 weeks across the 7 planches (~73 g N/m²)
- Source-of-truth constant: `TOMATO_SIDEDRESS` in `index.html`

**Drench manuel (removed 2026-05-02):**
- Earlier plan included manual drench of EZ-GRO Ocean 15-1-1 (5 mL/m²)
  during T4-T5 peak. Removed to simplify the operational program.
- If reintroduced: see git history of `page-sol-content` for the previous
  card markup.

**Fertigation (current, automated):**
- K₂SO₄ + MgSO₄ per stage table (TOMATO_STAGES in code), weekly
- No N (biofilm), no oligos (pH-locked)

**Foliar (current, weekly, while pH locked):**
- Spray A (Wed): Mn / Zn / B / Cu / Mo / Fe — covers what root can't
- Spray B (Fri): CaCl₂ — BER prevention

---

## 8. Where this goes once pH is fixed

Forward-looking. Trigger: sustained soil pH ≤ 6.5, validated by leaf tissue
showing adequate Fe / Mn / Zn.

| Channel | Current | Post-fix |
|---|---|---|
| Soil reservoir | Compost (over-Ca'd) | Compost (Ca-neutral) + maintenance soufre |
| Side-dressing | Actisol + farine de plumes weekly (PA Taillon × 1,5) | Same — granular base is permanent |
| Fertigation | K₂SO₄ + MgSO₄ only | K₂SO₄ + MgSO₄ + sulfate oligos (Mn / Zn / Fe / Cu / B / Mo) per Climax recipe |
| Foliar A | Weekly Wed | **Dropped.** Equipment kept for emergency/event use. |
| Foliar B (CaCl₂) | Weekly Fri | **Event-driven only** — applied during high-RH / BER-risk weeks |

**Net change:** weekly foliar cadence eliminated. ~3 hours / week of manual
spray labor recovered. Side-dressing volume unchanged (it's the permanent
backbone of organic N supply regardless of pH).

---

## 9. Cost ranking per kg N delivered

Cheapest first. Useful for any "should we add more of channel X" question.

| Channel | $ / kg N delivered | Comments |
|---|---|---|
| Soil reservoir (compost) | $0.50-1.50 | Cheapest; only as fast as mineralization allows |
| Granular side-dress (feather meal) | $2-3 | Reliable; soil-temp dependent |
| Liquid drench (fish hydrolysate, manual) | $4-6 | Fast; manual labor |
| Soluble fertigation (Chilean nitrate) | $5-7 | Fast + automated; **20% N cap, audit attention** |
| Foliar (effective, after 30% coverage) | $20-50 | Last resort; coverage is the hidden cost multiplier |

When channel choice is open, prefer the cheaper channel unless timing or
lockout forces otherwise.

---

## Cross-references

- Validated demand model: `index.html` → `TOMATO_REMOVAL` + Bilan page (`#admin/nutriment`)
- Bypass-efficiency tables (visual): `index.html` → Cadre admin page (`#admin/cadre`)
- Soil test: `farm info/mehlich-3 - 2026-04-10.pdf`, `farm info/SME - 2026-04-10.pdf`
- PA Taillon fertigation recipe: `farm info/fertigation oligos éléments tomate avril.pdf`
- Bilan source-of-truth rule: `requirements.md` REQ-004
- Symptom-driven diagnosis: `working files/symptomes-carences.md`
