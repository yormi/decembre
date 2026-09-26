# Croquis pépinière — admin page

Admin page. Floor-plan sketch of the nursery room. French UI text.

## Contract

- **Room** 16'3" × 27' (195 × 324 in), 1 ft grid, 2 px/in

- **Fixed zones** (drawn, keep-out for racks/tables): corridor 36 in deep
  across the room at y 240–276 · door 36 × 36 in top-left · Hot Dawg heater
  33 × 17 in, unrotated top-left (125, 22), tilted 25° so its east corner
  sits at (160, 30), 6 in clearance ring, 15 ft cone along the tilt. Source:
  `domain/nursery-room.md`

- **Items**: rack 48 × 28 in, 5 shelves of 4 trays, each shelf one cohort
  week S1–S4 or Autre (new rack all Autre) ·
  table L × D in (default 72 × 30, editable 12–120). Rotation 0 / 90°.

- **Default layout**: 21 racks (2 top wall, 4 left, 4 right, 6 central
  island 2 × 3, 5 below corridor) + 2 tables 80 × 22 above and below the
  island. All shelves Autre · 0 blocked (`working files/Flood Irrigation/pdf/more-nursery-space-layout.png`). Loaded from localStorage `nursery-layout:aisle`
  when saved (a rack's single saved week → all its shelves; none → Autre), else the suggested layout.


## layout

- No page title; whole page fits the viewport without scrolling

- Sketch fills the left half (scaled to width, capped at viewport height
  minus 245 px); right half holds shelf panel + table size inputs, shelf
  counts + stats at its bottom; sketch never moves when the inputs fill;
  one column below 900 px

## interactions

- Click an item → select; shift-click → toggle in selection; drag on
  empty floor → band select (shift = additive)

- Drag selected items together, 2 in snap, clamped inside the room

- Toolbar: **+ rack** · **+ table** · **Pivoter** · **Retirer** · **Réinitialiser** (saved layout, else
  suggested) · **Enregistrer par défaut** (localStorage) → « Enregistré »
  / « Échec » 2 s

- Table size inputs (L × D) show when a table is selected; apply to all
  selected tables

- **Rack entier** buttons S1–S4 + **Autre** (enabled with a selection) →
  set every shelf of the selected racks

- Shelf panel shows when a rack is selected: one row per shelf,
  **Tablette 1 (haut)** … **Tablette 5 (bas)**, buttons S1–S4 + **Autre**
  → set that shelf on all selected racks; a button is highlighted when
  every selected rack has that week on that shelf; tables ignored


## drawing

- Item colors: table `#9ab8c9` · blocked `#e06c4f`; a rack is split
  into 5 equal stripes along its length, one per shelf, top shelf first: S1 `#7fb3e6` · S2 `#c49be8` ·
  S3 `#f0b35a` · S4 `#f08cb0` · Autre `#5fc9a8`; selected = white 2.5 px
  stroke; label = weeks present, in week order, joined by `+` (`S1+Autre`) /
  `table L×D`

- **Blocked** = overlaps another item, or touches corridor / door zone

- **Aisle measurements**: for each item, nearest gap to the right and
  below (≥ 12 in overlap on the shared axis), plus gap to left / top wall
  when nothing sits between; shown only when 8–60 in; de-duplicated

- Stats: total · plateaux (racks × 20) · bloqués (red when > 0)

- **Tablettes / requises** (right half, bottom): per week S1–S4
  `<shelves on plan> / <required>`, required = `ceil(traysByNurseryWeek[week] / 4)`
  at the Rendement default inputs; green when ≥ required, red below;
  Autre shows its count only
