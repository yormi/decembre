# Croquis pépinière — admin page

Admin page. Floor-plan sketch of the nursery room. French UI text.

## Contract

- **Room** 16'3" × 27' (195 × 324 in), 1 ft grid, 2 px/in

- **Fixed zones** (drawn, keep-out for racks/tables): corridor 36 in deep
  across the room and the germination room, 15 ft below the door zone (y 229–265) · door 24 × 49 in top-left · Hot Dawg heater
  33 × 17 in, unrotated top-left (125, 22), tilted 25° so its east corner
  sits at (160, 30), 6 in clearance ring, 15 ft cone along the tilt. Source:
  `domain/nursery-room.md`

- **Germination room** 154 × 116 in (landscape), drawn west of the room, top 8 in above the corridor;
  corridor's west end = its door. Items placeable there like in the room

- **Weeks**: S1 · S2 · S3 · S4a · S4b · S5 · Autre — week 4 = two irrigation
  zones (`Flood Irrigation/nursery/control.md`) · S5 = week 5 trays past the
  greenhouse xTrays

- **Items**: rack 48 × 28 in, 5 shelves of 4 trays, each shelf one week
  (new rack all Autre) ·
  table L × D in (default 72 × 30, editable 12–120) ·
  fill valve 10 in circle, one week S1–S4b or unassigned (new valve
  unassigned). Rotation 0 / 90°.

- **Default layout**: 26 racks (2 top wall, 3 left + 1 crosswise below them, 4 right, 6 central
  island 2 × 3, 5 below corridor, 5 in the germination room) + tables 80 × 22 above the island and 62 × 22 over its
  bottom row + 5 valves (S1 top wall · S3, S2 by the door · S4b, S4a top-right corner) · 3 blocked (table 62 × 22 +
  the island's 2 bottom racks). Shelves (top → bottom): top wall S1, S1 · left S1 S1 S1 S2 S2, S2, S2, crosswise
  S2 S3 S3 S3 Autre · right S4b Autre ×4, S4b, S4b, S4b S4b S4a S4a S4a · island left column S3 S3 Autre, right
  column S4a S4a Autre · below corridor Autre, S5 Autre ×4, S5, S5, S5 · germination room Autre (4 racks at y 300
  run 11 in past its south wall) → S1 13 · S2 13 · S3 13 · S4a 13 · S4b 13 · S5 16 · Autre 49. Loaded from localStorage `nursery-layout:aisle`
  when saved (a rack's single saved week → all its shelves; none → Autre; saved S4 → S4a), else the suggested layout.


## layout

- No page title; sketch card fits the viewport without scrolling; Rendement section
  (`app/admin/rendement/user-stories.md`) below it

- Sketch fills the left half (scaled to width, capped at viewport height
  minus 245 px); right half holds shelf panel + table size inputs, shelf
  counts + stats at its bottom; sketch never moves when the inputs fill;
  one column below 900 px

## interactions

- Click an item → select; shift-click → toggle in selection; drag on
  empty floor → band select (shift = additive)

- Drag selected items together, 2 in snap; each item stays wholly inside one
  room (nursery or germination), sliding along walls; crosses to the other room
  once it fits there whole

- Toolbar: **+ rack** · **+ table** · **+ vanne** · **Pivoter** · **Retirer** · **Réinitialiser** (saved layout, else
  suggested) · **Enregistrer par défaut** (localStorage: layout + Rendement inputs) → « Enregistré »
  / « Échec » 2 s

- Table size inputs (L × D) show when a table is selected; apply to all
  selected tables

- Shelf panel shows when a rack is selected: first row **Rack entier**,
  set apart by 14 px, → set every shelf of the selected racks, highlighted when every shelf of
  every selected rack has that week; then one row per shelf,
  **Tablette 1 (haut)** … **Tablette 5 (bas)**; buttons S1 · S2 · S3 · S4a · S4b · **Autre**
  → set that shelf on all selected racks; a button is highlighted when
  every selected rack has that week on that shelf; tables ignored

- Valve panel shows when a valve is selected: **Vanne de remplissage**
  S1 · S2 · S3 · S4a · S4b → set week on all selected valves; highlighted
  when every selected valve has it


## drawing

- Item colors: table `#9ab8c9` · blocked `#e06c4f`; a rack is split
  into 5 equal stripes along its length, one per shelf, top shelf first: S1 `#7fb3e6` · S2 `#c49be8` ·
  S3 `#f0b35a` · S4a `#f08cb0` · S4b `#e8607a` · Autre `#5fc9a8`; selected = white 2.5 px
  stroke; label = weeks present, in week order, joined by `+` (`S1+Autre`) /
  `table L×D`

- Valve: circle in its week color, dark ring (selected = white), label
  `S<week>`, drawn above racks;
  unassigned = grey `?`

- **Blocked** = overlaps another item, or touches corridor / door zone;
  valves never blocked, never block

- **Aisle measurements**: for each item, nearest gap to the right and
  below (≥ 12 in overlap on the shared axis), plus gap to left / top wall
  when nothing sits between; walls and neighbours of the item's own room only; shown only when 8–60 in; de-duplicated;
  valves ignored

- Stats: total · plateaux (racks × 20) · bloqués (red when > 0)

- **Tablettes / requises** (right half, bottom): per week S1–S5
  `<shelves on plan> / <required>`, required = `ceil(rack trays / 4)` at the Rendement
  inputs currently selected below (updates on every change) — rack trays = `traysByNurseryWeek[week]`, week 5 only past 16 xTrays × 9 = 144 —
  week 4 split S4a = ceil(half) · S4b = floor(half); green when ≥ required, red below;
  Autre shows its count only
