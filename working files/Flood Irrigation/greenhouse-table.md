# Greenhouse table (week 5)

Shared design (flood cycle, injection stations, stock
vessels, Orisha, fill drops, shared purchases):
`common.md` § Shared design.

## Trays

- **Trays**: 15 xTrays 3×6 pi lining the existing table.

- **Per-tray leveling**: each xTray hydraulically
  independent — overflow standpipe (`tray-ports.md`,
  ≈ 2,5 po) sets each tray's own level. Only each 3×6 tray
  must be level on its own footprint (no 15-tray plane).

**Trays + port kits**

| Item | Qty | Total est. ($ CA) | Note |
|---|---|---|---|
| Tray port kits (`tray-ports.md`) | 15 | ~200 | 2 fittings + 2 screens + 2 extensions each |
| [xTrays Classic flood table, Canadian ABS](https://www.trimleaf.ca/products/xtrays-classic-flood-table-canadian-abs) | 15 | ~2 950 | 3×6 pi; single order with nursery table (min 10) |


## Fill

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

**Fill**

| Item | Qty | Total est. ($ CA) | Note |
|---|---|---|---|
| [Dosatron D14MZ10VFBPHY](https://www.kleen-ritecorp.com/p-35374-dosatron-injector-14gpm-1-100-1-10.aspx) | 1 | ~1 300 | stock A @10 % |
| Dosatron 1:100-class (D25RE2 / D14MZ2) | 1 | ~700 | stock B @1 %; landed price TBC |
| 100-mesh suction strainer | 1 | ~30 | stock B suction line |
| Inline filter | 1 | ~70 | post-injector |
| [Senninger PSR-2 10 psi, ¾ po FPT, 0,5–15 GPM (IV PR-075-L-10)](https://duboisag.com/ca_fr/regulateur-de-pression-senninger.html) | 1 | ~20 | after injectors, before fill valve; pins header at 0,7 bar; ~50 L/min = 13 GPM, inside range; Senninger 1 po starts at 20 psi — bush ¾ into the 1 po line |
| Check valve 1 po, spring | 1 | ~40 | after inline filter, before fill valve |
| Feed header: 1½ po poly line, capped far end | ~30 m (100 pi) | ~150 | fed by Orisha fill valve; upsized from 1 po — at 100 pi a 1 po header loses ~0,25 bar @50 L/min (breaks the ≥10× orifice rule vs 0,7 bar); 1½ po loses ~0,04 bar ✓ |
| Tray fill drops (`tray-drop.md`) | 15 | ~70 | 1 valve + 1,4 m tube + grommet + elbow each |
| 20 L bucket with lid | 1 | ~15 | stock B, daily mix |

On hand: 1× 200 L lidded drum (stock A), Franklin Turf Boss
pump + inline pressure controller.


## Waste

- **Drain — two lines.** Valved line: drain port
  (`tray-ports.md`) → ¾ po vinyl → 2 po × 3/4 po reducing tee → 2 po PVC
  main, ~1 % slope to the NO valve at the true low point →
  waste. 2 po carries ~100 L/min half-full vs ~50 needed
  (500 L in ~10 min); 1 po NO valve passes ~60–80 L/min —
  acceptable bottleneck. Threaded (not glued) end cap for
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

**Open:** re-evaluate drain valve size — 1 po NO valve
  (~60–80 L/min) is the drain bottleneck; a bigger main
  buys nothing until the valve grows (1½ po ≈ +100 $).

**Drain**

| Item | Qty | Total est. ($ CA) | Note |
|---|---|---|---|
| [Vinyl ¾ po ID (Active Aqua)](https://indoorfarmer.ca/products/active-aqua-black-vinyl-tubing-3-4-id) | ~9 m (15 × ~0,6 m) | ~65 | port → 2 × ¾ reducing tee |
| [Collier de serrage inox ½–¾ po, 25-pack Amazon](https://www.amazon.ca/Stainless-Steel-Clamps-Repair-Tubing/dp/B09BM21R92) | 30 (2 packs) | ~35 | 2/tray: port barb, tee ¾ branch |
| [U.S. Solid motorized ball valve 1" SS, normally open](https://www.amazon.ca/Motorized-Valve-Normally-U-S-Solid/dp/B0993GKRLT) | 1 | ~70 | fails open |
| Drain main: 2 po PVC | ~30 m (100 pi) | ~150 | along the table row, ~1 % slope to NO valve at far end |
| Reducing tees 2 po × 3/4 po | 15 | ~80 | one per tray; vinyl drop clamps onto the ¾ branch |
| Threaded end cap 2 po | 1 | ~10 | not glued — seasonal flush |
| Shared waste run: 2 po PVC, buriable (DWV/SDR-35) | ~25 m (80 pi) | ~120 | valve → drain; overflow merges just after the valve (high tee); may be buried — sand bedding, grade set by string/laser before backfill, no bellies (buried belly + frost = hidden crack); cleanout wye + riser at upstream end; keep valve + merge accessible |

**Overflow** (keep-or-skip pending; protects against a mechanically stuck fill valve)

| Item | Qty | Total est. ($ CA) | Note |
|---|---|---|---|
| [Vinyl ¾ po ID (Active Aqua)](https://indoorfarmer.ca/products/active-aqua-black-vinyl-tubing-3-4-id) | ~6 m (15 × ~0,4 m) | ~45 | port → 1½ × ¾ reducing tee |
| [Collier de serrage inox ½–¾ po, 25-pack Amazon](https://www.amazon.ca/Stainless-Steel-Clamps-Repair-Tubing/dp/B09BM21R92) | 30 (2 packs) | ~35 | 2/tray: port barb, tee ¾ branch |
| Overflow line: 1½ po PVC | ~30 m (100 pi) | ~140 | merges into waste run after the drain valve |
| Reducing tees 1½ × 1½ × ¾ po | 15 | ~60 | 1/xTray on the overflow line; vinyl drop clamps onto the ¾ branch |
