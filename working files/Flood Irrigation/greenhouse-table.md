# Greenhouse table (week 5)

Shared design (flood cycle, injection stations, stock
vessels, Orisha, fill drops, shared purchases):
`common.md` § Shared design.

## Trays

- Tray × 15 (xTrays 3×6 pi lining the existing table)

- **Per-tray leveling**: each xTray hydraulically
  independent — overflow standpipe (`tray-ports.md`,
  ≈ 2,5 po) sets each tray's own level. Only each 3×6 tray
  must be level on its own footprint (no 15-tray plane).

**Tray**

| Item | Qty | Note |
|---|---|---|
| [xTrays Classic flood table, Canadian ABS](https://www.trimleaf.ca/products/xtrays-classic-flood-table-canadian-abs) | 1 | 3×6 pi; single order with nursery table (min 10) |
| Tray port kit (`tray-ports.md`) | 1 | |


## Fill

- Station × 1
- Header × 1

- **Fill line**: warm tank → foot strainer → Franklin Turf
  Boss 1,5 HP 92980015 (56 psi shutoff — > 0,5 bar min,
  < 85 psi Dosatron ceiling; self-priming; warm water OK;
  inline pressure controller starts/stops it on demand, no
  dead-head risk) → Dosatron A → Dosatron B → inline filter
  → check valve → 10 psi preset regulator → Orisha fill
  valve → 1½ po feed header (100 pi) → one tray fill drop per
  tray (`tray-drop.md`, ~3,3 L/min). Water-hammer
  arrestor or flex section between fill valve and
  injectors.

- **Pressure**: line floats ~3–3,5 bar (pump curve at low
  draw); the 10 psi (0,7 bar) preset irrigation regulator
  (Senninger-class, dirty-water rated) pins header pressure
  → deterministic orifice flow, ~50 L/min total, no
  tuning, no drift with filter loading.

- **Orifice equalization**: identical tube lengths; tube
  loss ≥ 10× header end-to-end loss (1½ po header @50 L/min
  loses ~0,04 bar over the 100 pi run → 1,4 m tubes
  qualify; a 1 po header would lose ~0,25 bar and fail the
  rule). Timer set from one measured drop (`tray-drop.md`).

**Station** (tank → fill valve)

| Item | Qty | Note |
|---|---|---|
| [Dosatron D14MZ10VFBPHY](https://www.kleen-ritecorp.com/p-35374-dosatron-injector-14gpm-1-100-1-10.aspx) | 1 | stock A @10 % |
| Dosatron 1:100-class (D25RE2 / D14MZ2) | 1 | stock B @1 %; landed price TBC |
| 100-mesh suction strainer | 1 | stock B suction line |
| Inline filter | 1 | post-injector |
| [Senninger PSR-2 10 psi, ¾ po FPT, 0,5–15 GPM (IV PR-075-L-10)](https://duboisag.com/ca_fr/regulateur-de-pression-senninger.html) | 1 | after injectors, before fill valve; pins header at 0,7 bar; ~50 L/min = 13 GPM, inside range; Senninger 1 po starts at 20 psi — bush ¾ into the 1 po line |
| Check valve 1 po, spring | 1 | after inline filter, before fill valve |
| 20 L bucket with lid | 1 | stock B, daily mix |

On hand: 1× 200 L lidded drum (stock A), Franklin Turf Boss
pump + inline pressure controller.

**Header** (fill valve → trays)

| Item | Qty | Note |
|---|---|---|
| Feed header: 1½ po poly line, capped far end | ~30 m (100 pi) | fed by Orisha fill valve; at 100 pi a 1 po header loses ~0,25 bar @50 L/min (breaks the ≥10× orifice rule vs 0,7 bar); 1½ po loses ~0,04 bar ✓ |
| Tray fill drop (`tray-drop.md`) | 15 | 1/tray, punched in the header |


## Waste

- Drain drop × 15 (1/tray)
- Drain main × 1
- Overflow drop × 15 (1/tray)
- Overflow main × 1 (keep-or-skip pending; protects against a mechanically stuck fill valve)

- **Drain — two lines.** Valved line: drain port
  (`tray-ports.md`) → ¾ po vinyl → 2 × 2 × ¾ PVC tee → 2 po PVC
  main, ~1 % slope to the NO valve at the true low point →
  waste. 2 po carries ~100 L/min half-full vs ~50 needed
  (1 250 L in ~12 min); 1 po full-port NO valve ~130 L/min —
  the main is the limiter, not the valve. Threaded (not glued) end cap for
  seasonal flush. Overflow line: each tray's overflow port
  (`tray-ports.md`) → 1½ po
  unvalved line straight to waste — the drain valve is
  closed during fill/hold, so standpipes discharging into
  the valved main would back up and defeat the level cap;
  the bypass keeps overflow protection passive and always
  live. Geometry: the table row is ~100 pi, drain valve at
  its far end → 2 po drain main (~100 pi) and 1½ po
  overflow line (~100 pi) run in parallel along the tables;
  the overflow MERGES into the waste run just downstream of
  the NO valve (high-tee entry so drain surges can't back
  up the branch) → one shared ~80 pi run to the drain.
  Slope: continuous fall, no bellies (stagnant feed water =
  pathogen trap); ~1 % = ~30 cm over the 100 pi mains +
  ~25 cm over the shared 80 pi — if the fall isn't there,
  upsize the shared run to 3 po at ~0,5 %.

**Drain drop** (port → tee on the drain main)

| Item | Qty | Note |
|---|---|---|
| [Vinyl ¾ po ID (Active Aqua)](https://indoorfarmer.ca/products/active-aqua-black-vinyl-tubing-3-4-id) | ~0,6 m | port → tee |
| Té réduit PVC sch 40 2 × 2 × ¾ po, slip × slip × FPT (quincaillerie) | 1 | on the drain main |
| [Adaptateur mâle ¾ po MPT × ¾ po insert](https://duboisag.com/ca_fr/adaptateur-male-mpt-x-insert.html) | 1 | screws in the tee FPT, vinyl on the barb |
| [Collier de serrage inox ½–¾ po, 25-pack Amazon](https://www.amazon.ca/Stainless-Steel-Clamps-Repair-Tubing/dp/B09BM21R92) | 2 | port barb, adapter barb |

**Drain main**

| Item | Qty | Note |
|---|---|---|
| Drain main: 2 po PVC sch 40 | ~30 m (100 pi) | along the table row, ~1 % slope to NO valve at far end |
| [U.S. Solid motorized ball valve 1" SS full-port, normally open](https://www.amazon.ca/Motorized-Valve-Normally-U-S-Solid/dp/B0993GKRLT) | 1 | at the true low point; fails open |
| Threaded end cap 2 po | 1 | not glued — seasonal flush |
| Shared waste run: 2 po PVC, buriable (DWV/SDR-35) | ~25 m (80 pi) | valve → drain; overflow merges just after the valve (high tee); may be buried — sand bedding, grade set by string/laser before backfill, no bellies (buried belly + frost = hidden crack); cleanout wye + riser at upstream end; keep valve + merge accessible |
| Colle PVC + apprêt (quincaillerie) | 1 | both mains + waste run |

**Overflow drop** (port → tee on the overflow line)

| Item | Qty | Note |
|---|---|---|
| [Vinyl ¾ po ID (Active Aqua)](https://indoorfarmer.ca/products/active-aqua-black-vinyl-tubing-3-4-id) | ~0,4 m | port → tee |
| Té réduit PVC sch 40 1½ × 1½ × ¾ po, slip × slip × FPT (quincaillerie) | 1 | on the overflow line |
| [Adaptateur mâle ¾ po MPT × ¾ po insert](https://duboisag.com/ca_fr/adaptateur-male-mpt-x-insert.html) | 1 | screws in the tee FPT, vinyl on the barb |
| [Collier de serrage inox ½–¾ po, 25-pack Amazon](https://www.amazon.ca/Stainless-Steel-Clamps-Repair-Tubing/dp/B09BM21R92) | 2 | port barb, adapter barb |

**Overflow main**

| Item | Qty | Note |
|---|---|---|
| Overflow line: 1½ po PVC sch 40 | ~30 m (100 pi) | merges into waste run after the drain valve |
