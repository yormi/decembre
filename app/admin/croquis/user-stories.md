# Croquis pépinière — admin page

Admin page. Floor-plan sketch of the nursery room. French UI text.

## Contract

- **Room** 16'3" × 27' (195 × 324 in), 1 ft grid, 2 px/in

- **Fixed zones** (drawn, keep-out for racks/tables): corridor 36 in deep
  across the room at y 240–276 · door 36 × 36 in top-left · Hot Dawg heater
  33 × 26 in at (138, 10) tilted 15°, 6 in clearance ring, 15 ft cone
  aimed 15° off straight-down

- **Items**: rack 48 × 28 in (phase 1 or 2, optional cohort week 1–4) ·
  table L × D in (default 72 × 30, editable 12–120). Rotation 0 / 90°.

- **Default layout**: 21 racks (2 top wall, 4 left, 4 right, 6 central
  island 2 × 3, 5 below corridor) + 2 tables 80 × 22 above and below the
  island. 14 phase 1 · 7 phase 2 · 0 blocked (phase 2 = top rack of each wall column + 2nd top-wall rack + island bottom row + 2nd and 4th below-corridor racks — `working files/Flood Irrigation/more-nursery-space-layout.png`). Loaded from localStorage `nursery-layout:aisle`
  when saved, else the suggested layout.


## interactions

- Click an item → select; shift-click → toggle in selection; drag on
  empty floor → band select (shift = additive)

- Drag selected items together, 2 in snap, clamped inside the room

- Toolbar: **+ rack** · **+ table** · **Pivoter** · **Phase 1/2**
  (racks only) · **Retirer** · **Réinitialiser** (saved layout, else
  suggested) · **Enregistrer par défaut** (localStorage) → « Enregistré »
  / « Échec » 2 s

- Table size inputs (L × D) show when a table is selected; apply to all
  selected tables

- **Semaine** buttons S1–S4 + **Aucune** (enabled with a selection) set /
  clear the cohort week on selected racks; tables ignored


## drawing

- Item colors: phase 1 `#c9d64f` · phase 2 `#5fc9a8` · table `#9ab8c9` ·
  blocked `#e06c4f`; a rack with a week takes the week color instead of
  the phase color: S1 `#7fb3e6` · S2 `#c49be8` · S3 `#f0b35a` · S4
  `#f08cb0`; selected = white 2.5 px stroke; label `P1` / `P2`, prefixed
  `S<week> · ` when set / `table L×D`

- **Blocked** = overlaps another item, or touches corridor / door zone

- **Aisle measurements**: for each item, nearest gap to the right and
  below (≥ 12 in overlap on the shared axis), plus gap to left / top wall
  when nothing sits between; shown only when 8–60 in; de-duplicated

- Stats: racks phase 1 · phase 2 · total · plateaux (racks × 20) ·
  bloqués (red when > 0) · racks S1..S4 (count per week, week color)
