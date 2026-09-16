# Croquis pépinière — admin page

Admin page. Floor-plan sketch of the nursery room. French UI text.

## Contract

- **Room** 16'3" × 27' (195 × 324 in), 1 ft grid, 2 px/in

- **Fixed zones** (drawn, keep-out for racks/tables): corridor 36 in deep
  across the room at y 240–276 · door 36 × 36 in top-left · Hot Dawg heater
  33 × 26 in at (138, 10) tilted 15°, 6 in clearance ring, 15 ft cone
  aimed 15° off straight-down

- **Items**: rack 48 × 28 in (phase 1 or 2) · table L × D in (default
  72 × 30, editable 12–120). Rotation 0 / 90°.

- **Default layout**: 21 racks (2 top wall, 4 left, 4 right, 6 central
  island 2 × 3, 5 below corridor) + 2 tables 80 × 22 above and below the
  island. 15 phase 1 · 6 phase 2 · 0 blocked. Loaded from localStorage `nursery-layout:aisle`
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


## drawing

- Item colors: phase 1 `#c9d64f` · phase 2 `#5fc9a8` · table `#9ab8c9` ·
  blocked `#e06c4f`; selected = white 2.5 px stroke; label `P1` / `P2` /
  `table L×D`

- **Blocked** = overlaps another item, or touches corridor / door zone

- **Aisle measurements**: for each item, nearest gap to the right and
  below (≥ 12 in overlap on the shared axis), plus gap to left / top wall
  when nothing sits between; shown only when 8–60 in; de-duplicated

- Stats: racks phase 1 · phase 2 · total · plateaux (racks × 20) ·
  bloqués (red when > 0)
