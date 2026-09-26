# Greenhouse water supply — tank → fill drops (week 5)

Absolute quantities for 16 tables, 1 zone. Per-table parts: `table.md`. Waste side:
`waste.md`. Zone, schedule, Orisha: `control.md`.

## Path

- Warm tank → foot strainer → Franklin Turf Boss 1,5 HP (56 psi shutoff, self-priming,
  warm water OK; inline pressure controller starts/stops it on demand) → Dosatron A (1:10)
  → Dosatron B (1:100) → inline filter → check valve → PSR-2 10 psi → Orisha fill valve
  → 1½ po feed header, 100 pi, capped → one fill drop per table (~3,3 L/min).
- Line floats ~3–3,5 bar; the 0,7 bar preset regulator pins the header → deterministic
  orifice flow, ~53 L/min total, no tuning, no drift with filter loading.
- Orifice equalization: identical 1,4 m tubes; 1½ po header loses ~0,04 bar over 100 pi
  at 50 L/min, ≥ 10× under the tube loss. A 1 po header (~0,25 bar) fails the rule.
- Water-hammer arrestor or flex section between the fill valve and the injectors.
- Timer set from one measured drop (`../tray-fill-drop.md`).

## Station (tank → fill valve)

| Item | Qty | Note |
|---|---|---|
| Foot strainer | 1 | tank pickup |
| [Dosatron D14MZ10VFBPHY](https://www.kleen-ritecorp.com/p-35374-dosatron-injector-14gpm-1-100-1-10.aspx) | 1 | stock A @10 % |
| Dosatron 1:100-class (D25RE2 / D14MZ2) | 1 | stock B @1 %; landed price TBC |
| 100-mesh suction strainer | 1 | stock B suction line |
| Inline filter | 1 | post-injector |
| Check valve 1 po, spring | 1 | after the filter, before the fill valve |
| [Senninger PSR-2 10 psi, ¾ po FPT, 0,5–15 GPM (IV PR-075-L-10)](https://duboisag.com/ca_fr/regulateur-de-pression-senninger.html) | 1 | bush ¾ into the 1 po line; 53 L/min = 14 GPM, inside range |
| Water-hammer arrestor or flex section | 1 | |
| 20 L bucket with lid | 1 | stock B, daily mix |

On hand: 200 L lidded drum (stock A), Franklin Turf Boss pump + inline pressure controller.

## Fill valve + header

| Item | Qty | Note |
|---|---|---|
| Orisha fill valve 1 po | 1 | included with the Orisha automation (`control.md`) |
| Feed header: 1½ po poly line, capped far end | ~30 m (100 pi) | along the table row |
| Adapters 1 po → 1½ po header | 2 | valve out, header in |

Fill drops (1/table, punched in the header): `table.md` § Fill drop.

## Total

| Block | $ CA |
|---|---|
| Station | ~2 900 (Dosatrons quoted by Dubois) |
| Fill valve + header | ~160 (valve with the Orisha automation) |
| **Greenhouse supply** | **~3 060** |
