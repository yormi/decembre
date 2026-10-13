// ─── app/admin/croquis/logic.js — Croquis pépinière admin page ─
//
// Spec: app/admin/croquis/user-stories.md. Floor-plan sketch of the nursery
// room: draggable racks / tables / fill valves, cohort week per shelf and valve,
// keep-out zones, aisle measurements.
// State: CROQUIS.items (array) + CROQUIS.selected (Set); layout persisted in
// localStorage. Page entry: buildCroquis.

// Room 16'3" × 27' = 195 × 324 in. Racks 48 × 28 in. All geometry in inches.
const CROQUIS_ROOM_WIDTH = 195;
const CROQUIS_ROOM_HEIGHT = 324;
const CROQUIS_RACK_LENGTH = 48;
const CROQUIS_RACK_DEPTH = 28;
const CROQUIS_SNAP = 2;
const CROQUIS_PIXELS_PER_INCH = 2;
const CROQUIS_TRAYS_PER_RACK = 20;
const CROQUIS_SHELVES_PER_RACK = 5;
const CROQUIS_STORAGE_KEY = 'nursery-layout:aisle';

const CROQUIS_COLORS = {
  grid: '#243029', rackEdge: '#8a9a2e',
  rackBad: '#e06c4f', text: '#e8eee6', dim: '#7d8a80', heat: '#e0904f', table: '#9ab8c9', measure: '#8fd0e8',
};
// Cohort week each shelf holds (1-3, '4a', '4b' or 'other'); fill + edge per week.
// Week 4 = two irrigation zones 4a / 4b (Flood Irrigation/nursery/control.md).
const CROQUIS_WEEKS = [1, 2, 3, '4a', '4b', 'other'];
const CROQUIS_VALVE_WEEKS = CROQUIS_WEEKS.filter(week => week !== 'other');
const CROQUIS_VALVE_SIZE = 10;
const croquisShelves = week => Array(CROQUIS_SHELVES_PER_RACK).fill(week);
const croquisParseWeek = value => /^\d+$/.test(value) ? parseInt(value, 10) : value;
const croquisWeekLabel = week => week === 'other' ? 'Autre' : `S${week}`;
const croquisIsRack = item => !item.kind;
const CROQUIS_WEEK_COLORS = {
  1: { fill: '#7fb3e6', edge: '#3f78b0' },
  2: { fill: '#c49be8', edge: '#8a5cc2' },
  3: { fill: '#f0b35a', edge: '#b87a1e' },
  '4a': { fill: '#f08cb0', edge: '#b8497a' },
  '4b': { fill: '#e8607a', edge: '#a8324a' },
  other: { fill: '#5fc9a8', edge: '#3a8a70' },
};

const CROQUIS_CORRIDOR_WIDTH = 36;
const CROQUIS_CORRIDOR_Y1 = CROQUIS_ROOM_HEIGHT - 48 - CROQUIS_CORRIDOR_WIDTH;
const CROQUIS_CORRIDOR_Y2 = CROQUIS_ROOM_HEIGHT - 48;
const CROQUIS_DOOR = { x: 0, y: 0, w: 36, h: 36 };
// Germination room west of the nursery, top 8 in above the corridor; corridor ends at its door.
const CROQUIS_GERMINATION_ROOM = { x: -154, y: CROQUIS_CORRIDOR_Y1 - 8, w: 154, h: 116 };
const CROQUIS_ROOMS = [{ x: 0, y: 0, w: CROQUIS_ROOM_WIDTH, h: CROQUIS_ROOM_HEIGHT }, CROQUIS_GERMINATION_ROOM];

// Hot Dawg HD60 placed from wall measurements (domain/nursery-room.md):
// corner nearest the east wall at (160, 30), tilted 25° clockwise, ~15 ft
// throw along the tilt. Footprint (unrotated) top-left below.
const CROQUIS_HEATER_WIDTH = 33, CROQUIS_HEATER_DEPTH = 17, CROQUIS_HEATER_ANGLE = 25;
const CROQUIS_HEATER_CLEARANCE = 6;
const CROQUIS_HEATER = { x: 125, y: 22 };
const CROQUIS_HEATER_CENTER = { x: CROQUIS_HEATER.x + CROQUIS_HEATER_WIDTH / 2, y: CROQUIS_HEATER.y + CROQUIS_HEATER_DEPTH / 2 };
const CROQUIS_HEATER_DIRECTION = { x: -0.4226, y: 0.9063 };
const CROQUIS_CONE = (() => {
  const apex = {
    x: CROQUIS_HEATER_CENTER.x + CROQUIS_HEATER_DIRECTION.x * (CROQUIS_HEATER_DEPTH / 2),
    y: CROQUIS_HEATER_CENTER.y + CROQUIS_HEATER_DIRECTION.y * (CROQUIS_HEATER_DEPTH / 2),
  };
  const direction = CROQUIS_HEATER_DIRECTION, length = 180, half = 18;
  const end = { x: apex.x + direction.x * length, y: apex.y + direction.y * length };
  return {
    apex, direction, length, half, end,
    p1: { x: end.x + direction.y * half, y: end.y - direction.x * half },
    p2: { x: end.x - direction.y * half, y: end.y + direction.x * half },
  };
})();

let croquisIdCounter = 100;

function croquisDimensions(item) {
  if (item.kind === 'valve') return { w: CROQUIS_VALVE_SIZE, h: CROQUIS_VALVE_SIZE };
  if (item.kind === 'table') {
    const length = item.tableLength ?? 72, depth = item.tableDepth ?? 30;
    return item.rotation === 90 ? { w: depth, h: length } : { w: length, h: depth };
  }
  return item.rotation === 90 ? { w: CROQUIS_RACK_DEPTH, h: CROQUIS_RACK_LENGTH } : { w: CROQUIS_RACK_LENGTH, h: CROQUIS_RACK_DEPTH };
}
function croquisOverlaps(a, b) {
  const da = croquisDimensions(a), db = croquisDimensions(b);
  return a.x < b.x + db.w && a.x + da.w > b.x && a.y < b.y + db.h && a.y + da.h > b.y;
}
function croquisInZone(item, zoneX, zoneY, zoneWidth, zoneHeight) {
  const d = croquisDimensions(item);
  return item.x < zoneX + zoneWidth && item.x + d.w > zoneX && item.y < zoneY + zoneHeight && item.y + d.h > zoneY;
}
function croquisInsideRoom(item, room) {
  const d = croquisDimensions(item);
  return item.x >= room.x && item.x + d.w <= room.x + room.w && item.y >= room.y && item.y + d.h <= room.y + room.h;
}
// Room holding the item; one straddling a wall belongs to the room under its top-left corner.
function croquisRoomOf(item) {
  return CROQUIS_ROOMS.find(room => croquisInsideRoom(item, room)) || (item.x < 0 ? CROQUIS_GERMINATION_ROOM : CROQUIS_ROOMS[0]);
}
function croquisInCorridor(item) { return croquisInZone(item, CROQUIS_GERMINATION_ROOM.x, CROQUIS_CORRIDOR_Y1, CROQUIS_ROOM_WIDTH - CROQUIS_GERMINATION_ROOM.x, CROQUIS_CORRIDOR_WIDTH); }
function croquisInDoor(item) { return croquisInZone(item, CROQUIS_DOOR.x, CROQUIS_DOOR.y, CROQUIS_DOOR.w, CROQUIS_DOOR.h); }

// 20 racks + 2 work tables (80 × 22) bracketing a 2 × 3 central island.
// Shelves top → bottom.
function croquisSuggestedLayout() {
  const rack = (x, y, rotation, shelves) => ({ id: croquisIdCounter++, x, y, rotation, shelves });
  const table = (x, y) => ({ id: croquisIdCounter++, x, y, rotation: 0, kind: 'table', tableLength: 80, tableDepth: 22 });
  const all = week => croquisShelves(week);
  return [
    rack(68, 0, 0, all(1)),
    rack(0, 46, 90, [2, 2, 1, 1, 1]), rack(0, 94, 90, all(2)),
    rack(0, 142, 90, [2, 3, 'other', 'other', 'other']), rack(0, 190, 90, all('other')),
    rack(167, 48, 90, all('4a')), rack(167, 96, 90, all('4a')), rack(167, 144, 90, all('4a')),
    rack(167, 192, 90, ['4a', 'other', 'other', 'other', 'other']),
    table(62, 52),
    rack(76, 74, 90, all(3)), rack(104, 74, 90, all('4b')),
    rack(76, 122, 90, all(3)), rack(104, 122, 90, all('4b')),
    rack(76, 170, 90, all(3)), rack(104, 170, 90, all('4b')),
    table(62, 218),
    ...[20, 48, 94, 122, 167].map(x => rack(x, 276, 90, all('other'))),
  ];
}

function croquisLoadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(CROQUIS_STORAGE_KEY));
    if (!Array.isArray(saved) || saved.length === 0) return null;
    const highestId = Math.max(...saved.map(item => item.id));
    if (highestId >= croquisIdCounter) croquisIdCounter = highestId + 1;
    // Older saves: one `week` (or none) per rack → every shelf; week 4 → 4a.
    return saved.map(item => {
      if (!croquisIsRack(item)) return item;
      const { phase, week, weeks, ...rack } = item;
      return { ...rack, shelves: (rack.shelves || croquisShelves(week || 'other')).map(shelf => shelf === 4 ? '4a' : shelf) };
    });
  } catch (error) { return null; }
}

const CROQUIS = { items: null, requiredShelves: null, selected: new Set(), saveMessage: '', band: null, drag: null, wired: false };

function buildCroquis() {
  if (!CROQUIS.items) CROQUIS.items = croquisLoadSaved() || croquisSuggestedLayout();
  if (!CROQUIS.requiredShelves && window.YieldRange && window.YieldRange.predictYield) {
    const model = window.YieldRange.predictYield(yrInputs(name => YR_DEFAULTS[name]));
    CROQUIS.requiredShelves = croquisRequiredShelves(model);
  }
  croquisWire();
  renderCroquis();
}

// Rendement model (default inputs) → { week: shelves } for weeks 1-3, 4a, 4b;
// week 4 split in halves, 4a takes the odd shelf.
function croquisRequiredShelves(model) {
  const shelves = Object.fromEntries(model.traysByNurseryWeek.filter(entry => entry.week <= 4)
    .map(entry => [entry.week, Math.ceil(entry.trays / YR_TRAYS_PER_SHELF)]));
  const { 4: weekFour, ...rest } = shelves;
  return { ...rest, '4a': Math.ceil(weekFour / 2), '4b': Math.floor(weekFour / 2) };
}

// ── Actions ──────────────────────────────────────────────────────────
function croquisClampInside(item) {
  const d = croquisDimensions(item), room = croquisRoomOf(item);
  return { ...item, x: Math.min(item.x, room.x + room.w - d.w), y: Math.min(item.y, room.y + room.h - d.h) };
}
function croquisRotate() {
  CROQUIS.items = CROQUIS.items.map(item => CROQUIS.selected.has(item.id)
    ? croquisClampInside({ ...item, rotation: item.rotation === 90 ? 0 : 90 }) : item);
  renderCroquis();
}
// Shelf index null = every shelf.
function croquisSetShelfWeek(week, shelfIndex) {
  CROQUIS.items = CROQUIS.items.map(item => CROQUIS.selected.has(item.id) && croquisIsRack(item)
    ? { ...item, shelves: item.shelves.map((current, index) => shelfIndex === null || index === shelfIndex ? week : current) } : item);
  renderCroquis();
}
function croquisAddRack() {
  const item = { id: croquisIdCounter++, x: 70, y: 6, rotation: 90, shelves: croquisShelves('other') };
  CROQUIS.items = [...CROQUIS.items, item]; CROQUIS.selected = new Set([item.id]);
  renderCroquis();
}
function croquisSetValveWeek(week) {
  CROQUIS.items = CROQUIS.items.map(item => CROQUIS.selected.has(item.id) && item.kind === 'valve' ? { ...item, week } : item);
  renderCroquis();
}
function croquisAddValve() {
  const item = { id: croquisIdCounter++, x: 70, y: 6, rotation: 0, kind: 'valve', week: null };
  CROQUIS.items = [...CROQUIS.items, item]; CROQUIS.selected = new Set([item.id]);
  renderCroquis();
}
function croquisAddTable() {
  const item = { id: croquisIdCounter++, x: 70, y: 6, rotation: 0, kind: 'table', tableLength: 72, tableDepth: 30 };
  CROQUIS.items = [...CROQUIS.items, item]; CROQUIS.selected = new Set([item.id]);
  renderCroquis();
}
function croquisRemove() {
  CROQUIS.items = CROQUIS.items.filter(item => !CROQUIS.selected.has(item.id)); CROQUIS.selected = new Set();
  renderCroquis();
}
function croquisReset() {
  CROQUIS.items = croquisLoadSaved() || croquisSuggestedLayout(); CROQUIS.selected = new Set();
  renderCroquis();
}
function croquisSave() {
  try { localStorage.setItem(CROQUIS_STORAGE_KEY, JSON.stringify(CROQUIS.items)); CROQUIS.saveMessage = 'Enregistré'; }
  catch (error) { CROQUIS.saveMessage = 'Échec'; }
  renderCroquis();
  setTimeout(() => { CROQUIS.saveMessage = ''; renderCroquisToolbar(); }, 2000);
}
function croquisEditTable(field, value) {
  const inches = Math.max(12, Math.min(120, Math.round(Number(value) || 0)));
  CROQUIS.items = CROQUIS.items.map(item => CROQUIS.selected.has(item.id) && item.kind === 'table'
    ? croquisClampInside({ ...item, [field]: inches }) : item);
  renderCroquisCanvas(); renderCroquisStats();
}

// ── Pointer handling (delegated on the canvas) ───────────────────────
function croquisPointToInches(event) {
  const svg = document.querySelector('#croquis-canvas svg');
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
  return { x: point.x / CROQUIS_PIXELS_PER_INCH, y: point.y / CROQUIS_PIXELS_PER_INCH };
}
function croquisWire() {
  if (CROQUIS.wired) return;
  CROQUIS.wired = true;
  const canvas = document.getElementById('croquis-canvas');
  canvas.addEventListener('pointerdown', event => {
    const svg = canvas.querySelector('svg');
    if (!svg) return;
    event.preventDefault();
    const point = croquisPointToInches(event);
    const group = event.target.closest('g[data-rack]');
    if (group) {
      const id = parseInt(group.dataset.rack, 10);
      const next = new Set(CROQUIS.selected);
      if (event.shiftKey) { if (next.has(id)) next.delete(id); else next.add(id); }
      else if (!next.has(id)) { next.clear(); next.add(id); }
      CROQUIS.selected = next;
      if (next.has(id)) {
        const anchor = CROQUIS.items.find(item => item.id === id);
        CROQUIS.drag = {
          id, offsetX: point.x - anchor.x, offsetY: point.y - anchor.y,
          start: Object.fromEntries(CROQUIS.items.filter(item => next.has(item.id)).map(item => [item.id, { x: item.x, y: item.y }])),
        };
      }
      renderCroquis();
    } else {
      CROQUIS.band = { x1: point.x, y1: point.y, x2: point.x, y2: point.y, moved: false, additive: event.shiftKey };
    }
    svg.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (CROQUIS.band) {
      const point = croquisPointToInches(event);
      CROQUIS.band = { ...CROQUIS.band, x2: point.x, y2: point.y, moved: true };
      renderCroquisCanvas();
      return;
    }
    if (!CROQUIS.drag) return;
    const point = croquisPointToInches(event);
    const { id, offsetX, offsetY, start } = CROQUIS.drag;
    let deltaX = Math.round((point.x - offsetX - start[id].x) / CROQUIS_SNAP) * CROQUIS_SNAP;
    let deltaY = Math.round((point.y - offsetY - start[id].y) / CROQUIS_SNAP) * CROQUIS_SNAP;
    // Every dragged item must sit wholly in a room; else slide along the walls of its current room.
    const dragged = CROQUIS.items.filter(item => start[item.id]);
    const fits = () => dragged.every(item => CROQUIS_ROOMS.some(room => croquisInsideRoom({ ...item, x: start[item.id].x + deltaX, y: start[item.id].y + deltaY }, room)));
    if (!fits()) {
      for (const item of dragged) {
        const d = croquisDimensions(item), room = croquisRoomOf(item);
        deltaX = Math.max(room.x - start[item.id].x, Math.min(room.x + room.w - d.w - start[item.id].x, deltaX));
        deltaY = Math.max(room.y - start[item.id].y, Math.min(room.y + room.h - d.h - start[item.id].y, deltaY));
      }
      if (!fits()) return;
    }
    CROQUIS.items = CROQUIS.items.map(item => start[item.id] ? { ...item, x: start[item.id].x + deltaX, y: start[item.id].y + deltaY } : item);
    renderCroquisCanvas(); renderCroquisStats();
  });
  const endPointer = () => {
    if (CROQUIS.band) {
      const band = CROQUIS.band;
      if (!band.moved) { if (!band.additive) CROQUIS.selected = new Set(); }
      else {
        const left = Math.min(band.x1, band.x2), right = Math.max(band.x1, band.x2);
        const top = Math.min(band.y1, band.y2), bottom = Math.max(band.y1, band.y2);
        const next = band.additive ? new Set(CROQUIS.selected) : new Set();
        for (const item of CROQUIS.items) {
          const d = croquisDimensions(item);
          if (item.x < right && item.x + d.w > left && item.y < bottom && item.y + d.h > top) next.add(item.id);
        }
        CROQUIS.selected = next;
      }
      CROQUIS.band = null;
      renderCroquis();
    }
    CROQUIS.drag = null;
  };
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);

  document.getElementById('croquis-toolbar').addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    ({ addRack: croquisAddRack, addTable: croquisAddTable, addValve: croquisAddValve, rotate: croquisRotate,
       remove: croquisRemove, reset: croquisReset, save: croquisSave })[button.dataset.action]();
  });
  document.getElementById('croquis-shelves').addEventListener('click', event => {
    const button = event.target.closest('button[data-shelf]');
    if (button) croquisSetShelfWeek(croquisParseWeek(button.dataset.week), button.dataset.shelf === 'all' ? null : parseInt(button.dataset.shelf, 10));
  });
  document.getElementById('croquis-valve').addEventListener('click', event => {
    const button = event.target.closest('button[data-week]');
    if (button) croquisSetValveWeek(croquisParseWeek(button.dataset.week));
  });
  document.getElementById('croquis-table-size').addEventListener('input', event => {
    if (event.target.dataset.field) croquisEditTable(event.target.dataset.field, event.target.value);
  });
}

// ── Derived: blocked set + aisle gaps (valves excluded) ──────────────
function croquisBlocked(allItems) {
  const items = allItems.filter(item => item.kind !== 'valve');
  const blocked = new Set();
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++)
      if (croquisOverlaps(items[i], items[j])) { blocked.add(items[i].id); blocked.add(items[j].id); }
  for (const item of items) if (croquisInCorridor(item) || croquisInDoor(item)) blocked.add(item.id);
  return blocked;
}
function croquisGaps(items) {
  const gaps = [];
  const boxes = items.filter(item => item.kind !== 'valve').map(item => ({ ...item, d: croquisDimensions(item) }));
  for (const a of boxes) {
    const room = croquisRoomOf(a);
    let gapX = room.x + room.w - (a.x + a.d.w), overlapY1 = a.y, overlapY2 = a.y + a.d.h;
    let gapY = room.y + room.h - (a.y + a.d.h), overlapX1 = a.x, overlapX2 = a.x + a.d.w;
    let leftClear = true, topClear = true;
    for (const b of boxes) {
      if (b.id === a.id || croquisRoomOf(b) !== room) continue;
      const vo1 = Math.max(a.y, b.y), vo2 = Math.min(a.y + a.d.h, b.y + b.d.h);
      const ho1 = Math.max(a.x, b.x), ho2 = Math.min(a.x + a.d.w, b.x + b.d.w);
      if (vo2 - vo1 > 12) {
        if (b.x >= a.x + a.d.w && b.x - (a.x + a.d.w) < gapX) { gapX = b.x - (a.x + a.d.w); overlapY1 = vo1; overlapY2 = vo2; }
        if (b.x + b.d.w <= a.x) leftClear = false;
      }
      if (ho2 - ho1 > 12) {
        if (b.y >= a.y + a.d.h && b.y - (a.y + a.d.h) < gapY) { gapY = b.y - (a.y + a.d.h); overlapX1 = ho1; overlapX2 = ho2; }
        if (b.y + b.d.h <= a.y) topClear = false;
      }
    }
    if (gapX >= 8 && gapX <= 60) gaps.push({ direction: 'h', x1: a.x + a.d.w, x2: a.x + a.d.w + gapX, y: (overlapY1 + overlapY2) / 2, inches: gapX });
    if (gapY >= 8 && gapY <= 60) gaps.push({ direction: 'v', y1: a.y + a.d.h, y2: a.y + a.d.h + gapY, x: (overlapX1 + overlapX2) / 2, inches: gapY });
    const leftGap = a.x - room.x, topGap = a.y - room.y;
    if (leftClear && leftGap >= 8 && leftGap <= 60) gaps.push({ direction: 'h', x1: room.x, x2: a.x, y: a.y + a.d.h / 2, inches: leftGap });
    if (topClear && topGap >= 8 && topGap <= 60) gaps.push({ direction: 'v', y1: room.y, y2: a.y, x: a.x + a.d.w / 2, inches: topGap });
  }
  const seen = new Set();
  return gaps.filter(gap => {
    const key = gap.direction === 'h' ? `h${gap.x1}-${gap.inches}-${Math.round(gap.y / 48)}` : `v${gap.y1}-${gap.inches}-${Math.round(gap.x / 48)}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}

// ── Render ───────────────────────────────────────────────────────────
function renderCroquis() { renderCroquisToolbar(); renderCroquisShelves(); renderCroquisValve(); renderCroquisTableSize(); renderCroquisCanvas(); renderCroquisStats(); renderCroquisShelfCounts(); }

function renderCroquisToolbar() {
  const none = CROQUIS.selected.size === 0 ? ' disabled' : '';
  const message = CROQUIS.saveMessage
    ? `<span class="croquis-save-message" style="color:${CROQUIS.saveMessage === 'Enregistré' ? CROQUIS_COLORS.rackEdge : CROQUIS_COLORS.rackBad};">${CROQUIS.saveMessage}</span>` : '';
  document.getElementById('croquis-toolbar').innerHTML =
    `<button data-action="addRack">+ rack</button><button data-action="addTable">+ table</button><button data-action="addValve">+ vanne</button>`
    + `<button data-action="rotate"${none}>Pivoter</button>`
    + `<button data-action="remove"${none}>Retirer</button><button data-action="reset">Réinitialiser</button>`
    + `<button data-action="save">Enregistrer par défaut</button>${message}`;
}

// Rack entier row, then one row per shelf, top (1) to bottom; a button is
// active when every selected rack has that week on that shelf (every shelf for Rack entier).
function renderCroquisShelves() {
  const racks = CROQUIS.items.filter(item => croquisIsRack(item) && CROQUIS.selected.has(item.id));
  const container = document.getElementById('croquis-shelves');
  if (racks.length === 0) { container.innerHTML = ''; return; }
  const wholeRack = `<div class="croquis-shelf-row croquis-whole-rack"><span class="croquis-toolbar-label">Rack entier</span>`
    + CROQUIS_WEEKS.map(week => {
      const active = racks.every(item => item.shelves.every(shelf => shelf === week));
      return `<button data-shelf="all" data-week="${week}" class="${active ? 'active' : ''}" style="background:${CROQUIS_WEEK_COLORS[week].fill};">${croquisWeekLabel(week)}</button>`;
    }).join('') + `</div>`;
  container.innerHTML = wholeRack + Array.from({ length: CROQUIS_SHELVES_PER_RACK }, (unused, shelfIndex) =>
    `<div class="croquis-shelf-row"><span class="croquis-toolbar-label">Tablette ${shelfIndex + 1}${shelfIndex === 0 ? ' (haut)' : shelfIndex === CROQUIS_SHELVES_PER_RACK - 1 ? ' (bas)' : ''}</span>`
    + CROQUIS_WEEKS.map(week => {
      const active = racks.every(item => item.shelves[shelfIndex] === week);
      return `<button data-shelf="${shelfIndex}" data-week="${week}" class="${active ? 'active' : ''}" style="background:${CROQUIS_WEEK_COLORS[week].fill};">${croquisWeekLabel(week)}</button>`;
    }).join('') + `</div>`).join('')
    + (racks.length > 1 ? `<div class="croquis-toolbar-label">${racks.length} racks</div>` : '');
}

// Week buttons for selected fill valves; active when every selected valve has it.
function renderCroquisValve() {
  const valves = CROQUIS.items.filter(item => item.kind === 'valve' && CROQUIS.selected.has(item.id));
  const container = document.getElementById('croquis-valve');
  if (valves.length === 0) { container.innerHTML = ''; return; }
  container.innerHTML = `<div class="croquis-shelf-row"><span class="croquis-toolbar-label">Vanne de remplissage</span>`
    + CROQUIS_VALVE_WEEKS.map(week => `<button data-week="${week}" class="${valves.every(item => item.week === week) ? 'active' : ''}" style="background:${CROQUIS_WEEK_COLORS[week].fill};">${croquisWeekLabel(week)}</button>`).join('')
    + `</div>` + (valves.length > 1 ? `<div class="croquis-toolbar-label">${valves.length} vannes</div>` : '');
}

function renderCroquisTableSize() {
  const tables = CROQUIS.items.filter(item => item.kind === 'table' && CROQUIS.selected.has(item.id));
  const container = document.getElementById('croquis-table-size');
  if (tables.length === 0) { container.innerHTML = ''; return; }
  container.innerHTML = `Taille de table : <input type="number" min="12" max="120" data-field="tableLength" value="${tables[0].tableLength ?? 72}"> × `
    + `<input type="number" min="12" max="120" data-field="tableDepth" value="${tables[0].tableDepth ?? 30}"> po`
    + (tables.length > 1 ? ` (${tables.length} tables)` : '');
}

function renderCroquisCanvas() {
  const PX = CROQUIS_PIXELS_PER_INCH, C = CROQUIS_COLORS, cone = CROQUIS_CONE;
  const blocked = croquisBlocked(CROQUIS.items);
  const gridLines = [];
  for (let i = 1; i * 12 < CROQUIS_ROOM_WIDTH; i++) gridLines.push(`<line x1="${i * 12 * PX}" y1="0" x2="${i * 12 * PX}" y2="${CROQUIS_ROOM_HEIGHT * PX}" stroke="${C.grid}" stroke-width="1"/>`);
  for (let i = 1; i * 12 < CROQUIS_ROOM_HEIGHT; i++) gridLines.push(`<line x1="0" y1="${i * 12 * PX}" x2="${CROQUIS_ROOM_WIDTH * PX}" y2="${i * 12 * PX}" stroke="${C.grid}" stroke-width="1"/>`);

  const G = CROQUIS_GERMINATION_ROOM;
  const germinationGrid = [];
  for (let x = G.x + 12; x < G.x + G.w; x += 12) germinationGrid.push(`<line x1="${x * PX}" y1="${G.y * PX}" x2="${x * PX}" y2="${(G.y + G.h) * PX}" stroke="${C.grid}" stroke-width="1"/>`);
  for (let y = Math.ceil(G.y / 12) * 12; y < G.y + G.h; y += 12) germinationGrid.push(`<line x1="${G.x * PX}" y1="${y * PX}" x2="${(G.x + G.w) * PX}" y2="${y * PX}" stroke="${C.grid}" stroke-width="1"/>`);
  const germinationRoom =
    `<rect x="${G.x * PX}" y="${G.y * PX}" width="${G.w * PX}" height="${G.h * PX}" fill="#1a231e" stroke="#243029"/>`
    + germinationGrid.join('')
    + `<text x="${(G.x + G.w / 2) * PX}" y="${(G.y + 16) * PX}" text-anchor="middle" font-size="10" fill="${C.dim}">salle de germination ${G.w} × ${G.h}"</text>`;

  const zones =
    `<rect x="${G.x * PX}" y="${CROQUIS_CORRIDOR_Y1 * PX}" width="${(CROQUIS_ROOM_WIDTH - G.x) * PX}" height="${CROQUIS_CORRIDOR_WIDTH * PX}" fill="#2e3a33" stroke="#4a5a50" stroke-dasharray="6 4"/>`
    + `<text x="36" y="${(CROQUIS_CORRIDOR_Y1 + CROQUIS_CORRIDOR_WIDTH / 2) * PX + 4}" font-size="10" fill="${C.dim}">corridor</text>`
    + `<rect x="-2" y="${CROQUIS_CORRIDOR_Y1 * PX}" width="5" height="${CROQUIS_CORRIDOR_WIDTH * PX}" fill="${C.text}" opacity="0.6"/>`
    + `<rect x="${CROQUIS_ROOM_WIDTH * PX - 3}" y="${CROQUIS_CORRIDOR_Y1 * PX}" width="5" height="${CROQUIS_CORRIDOR_WIDTH * PX}" fill="${C.text}" opacity="0.6"/>`
    + `<rect x="${CROQUIS_DOOR.x * PX}" y="${CROQUIS_DOOR.y * PX}" width="${CROQUIS_DOOR.w * PX}" height="${CROQUIS_DOOR.h * PX}" fill="#2e3a33" stroke="#4a5a50" stroke-dasharray="6 4"/>`
    + `<rect x="${CROQUIS_DOOR.x * PX}" y="-2" width="${CROQUIS_DOOR.w * PX}" height="5" fill="${C.text}" opacity="0.6"/>`
    + `<text x="${(CROQUIS_DOOR.x + CROQUIS_DOOR.w / 2) * PX}" y="${(CROQUIS_DOOR.y + CROQUIS_DOOR.h / 2) * PX + 4}" text-anchor="middle" font-size="9" fill="${C.dim}">porte</text>`;

  const H = CROQUIS_HEATER, HC = CROQUIS_HEATER_CENTER, HW = CROQUIS_HEATER_WIDTH, HD = CROQUIS_HEATER_DEPTH, HCL = CROQUIS_HEATER_CLEARANCE;
  const heater =
    `<polygon points="${cone.apex.x * PX},${cone.apex.y * PX} ${cone.p1.x * PX},${cone.p1.y * PX} ${cone.p2.x * PX},${cone.p2.y * PX}" fill="${C.heat}" opacity="0.13" stroke="${C.heat}" stroke-dasharray="6 4"/>`
    + `<g transform="rotate(${CROQUIS_HEATER_ANGLE} ${HC.x * PX} ${HC.y * PX})">`
    + `<rect x="${(H.x - HCL) * PX}" y="${(H.y - HCL) * PX}" width="${(HW + 2 * HCL) * PX}" height="${(HD + 2 * HCL) * PX}" fill="none" stroke="${C.heat}" stroke-dasharray="3 3" opacity="0.7"/>`
    + `<text x="${(H.x + HW + HCL + 2) * PX}" y="${(H.y + 4) * PX}" font-size="8" fill="${C.heat}">${HCL}"</text>`
    + `<rect x="${H.x * PX}" y="${H.y * PX}" width="${HW * PX}" height="${HD * PX}" fill="${C.heat}" opacity="0.85" rx="2" stroke="#a05a28"/>`
    + `<rect x="${(H.x + 2) * PX}" y="${(H.y + HD - 6) * PX}" width="${(HW - 4) * PX}" height="${4 * PX}" fill="#7a3f18" rx="1"/>`
    + `<text x="${HC.x * PX}" y="${(HC.y + 1) * PX}" text-anchor="middle" font-size="8" fill="#3a2008" font-weight="700">Hot Dawg</text></g>`
    + `<text x="${(H.x - 4) * PX}" y="${(H.y + 6) * PX}" text-anchor="end" font-size="9" fill="${C.heat}">HD60 · portée 15'</text>`;

  const items = CROQUIS.items.filter(item => item.kind !== 'valve').map(item => {
    const d = croquisDimensions(item);
    const isTable = item.kind === 'table';
    const isBlocked = blocked.has(item.id), isSelected = CROQUIS.selected.has(item.id);
    const fill = isBlocked ? C.rackBad : isTable ? C.table : 'none';
    const stroke = isSelected ? C.text : isTable ? '#5c7a8a' : CROQUIS_WEEK_COLORS[item.shelves[0]].edge;
    const label = isTable ? `table ${item.tableLength ?? 72}×${item.tableDepth ?? 30}` : CROQUIS_WEEKS.filter(week => item.shelves.includes(week)).map(croquisWeekLabel).join('+');
    // One equal stripe per shelf along the rack's length, top shelf first.
    const alongHeight = d.h > d.w, stripeLength = (alongHeight ? d.h : d.w) / CROQUIS_SHELVES_PER_RACK;
    const stripes = isTable || isBlocked ? '' : item.shelves.map((week, index) => alongHeight
      ? `<rect x="${item.x * PX}" y="${(item.y + index * stripeLength) * PX}" width="${d.w * PX}" height="${stripeLength * PX}" fill="${CROQUIS_WEEK_COLORS[week].fill}"/>`
      : `<rect x="${(item.x + index * stripeLength) * PX}" y="${item.y * PX}" width="${stripeLength * PX}" height="${d.h * PX}" fill="${CROQUIS_WEEK_COLORS[week].fill}"/>`).join('');
    return `<g data-rack="${item.id}" style="cursor:grab;">${stripes}`
      + `<rect x="${item.x * PX}" y="${item.y * PX}" width="${d.w * PX}" height="${d.h * PX}" fill="${fill}" stroke="${stroke}" stroke-width="${isSelected ? 2.5 : 1.2}" rx="2" pointer-events="all"/>`
      + `<text x="${(item.x + d.w / 2) * PX}" y="${(item.y + d.h / 2) * PX + 3}" text-anchor="middle" font-size="9" fill="${isTable ? '#1c2c36' : '#22300e'}" font-weight="700">${label}</text></g>`;
  }).join('');

  // Drawn above racks, dark ring; unassigned = grey « ? ».
  const valves = CROQUIS.items.filter(item => item.kind === 'valve').map(item => {
    const radius = CROQUIS_VALVE_SIZE / 2, isSelected = CROQUIS.selected.has(item.id);
    const fill = item.week ? CROQUIS_WEEK_COLORS[item.week].fill : C.dim;
    return `<g data-rack="${item.id}" style="cursor:grab;">`
      + `<circle cx="${(item.x + radius) * PX}" cy="${(item.y + radius) * PX}" r="${radius * PX}" fill="${fill}" stroke="${isSelected ? C.text : '#101613'}" stroke-width="${isSelected ? 2.5 : 2}"/>`
      + `<text x="${(item.x + radius) * PX}" y="${(item.y + radius) * PX + 3}" text-anchor="middle" font-size="8" fill="#1c2408" font-weight="700">${item.week ? croquisWeekLabel(item.week) : '?'}</text></g>`;
  }).join('');

  const band = CROQUIS.band && CROQUIS.band.moved
    ? `<rect x="${Math.min(CROQUIS.band.x1, CROQUIS.band.x2) * PX}" y="${Math.min(CROQUIS.band.y1, CROQUIS.band.y2) * PX}" width="${Math.abs(CROQUIS.band.x2 - CROQUIS.band.x1) * PX}" height="${Math.abs(CROQUIS.band.y2 - CROQUIS.band.y1) * PX}" fill="#8fd0e8" fill-opacity="0.22" stroke="#bfe8f7" stroke-width="2" pointer-events="none"/>` : '';

  const gaps = croquisGaps(CROQUIS.items).map(gap => gap.direction === 'h'
    ? `<g pointer-events="none"><line x1="${gap.x1 * PX}" y1="${gap.y * PX}" x2="${gap.x2 * PX}" y2="${gap.y * PX}" stroke="${C.measure}"/>`
      + `<text x="${(gap.x1 + gap.x2) / 2 * PX}" y="${gap.y * PX - 3}" text-anchor="middle" font-size="9" fill="${C.measure}" font-weight="600">${gap.inches}"</text></g>`
    : `<g pointer-events="none"><line x1="${gap.x * PX}" y1="${gap.y1 * PX}" x2="${gap.x * PX}" y2="${gap.y2 * PX}" stroke="${C.measure}"/>`
      + `<text x="${gap.x * PX + 3}" y="${(gap.y1 + gap.y2) / 2 * PX + 3}" font-size="9" fill="${C.measure}" font-weight="600">${gap.inches}"</text></g>`).join('');

  document.getElementById('croquis-canvas').innerHTML =
    `<svg viewBox="${G.x * PX} 0 ${(CROQUIS_ROOM_WIDTH - G.x) * PX} ${Math.max(CROQUIS_ROOM_HEIGHT, G.y + G.h) * PX}">${germinationRoom}<rect x="0" y="0" width="${CROQUIS_ROOM_WIDTH * PX}" height="${CROQUIS_ROOM_HEIGHT * PX}" fill="#1a231e" stroke="#243029"/>${gridLines.join('')}${zones}${heater}${items}${valves}${band}${gaps}</svg>`;
}

function renderCroquisStats() {
  const racks = CROQUIS.items.filter(croquisIsRack);
  const blockedCount = croquisBlocked(CROQUIS.items).size;
  const stat = (value, label, color) => `<div><span class="croquis-stat-value" style="color:${color};">${value}</span><span class="croquis-stat-label">${label}</span></div>`;
  document.getElementById('croquis-stats').innerHTML =
    stat(racks.length, 'total', 'var(--text)') + stat(racks.length * CROQUIS_TRAYS_PER_RACK, 'plateaux', 'var(--text)')
    + stat(blockedCount, 'bloqués', blockedCount > 0 ? CROQUIS_COLORS.rackBad : 'var(--text)');
}

// Shelves per week on the plan over shelves the Rendement defaults need
// (trays ÷ 4, rounded up); Autre has no need.
function renderCroquisShelfCounts() {
  const container = document.getElementById('croquis-shelf-counts');
  const racks = CROQUIS.items.filter(croquisIsRack);
  const rows = CROQUIS_WEEKS.map(week => {
    const have = racks.reduce((sum, item) => sum + item.shelves.filter(shelf => shelf === week).length, 0);
    const need = CROQUIS.requiredShelves ? CROQUIS.requiredShelves[week] : undefined;
    const color = need === undefined ? 'var(--text)' : have >= need ? CROQUIS_COLORS.rackEdge : CROQUIS_COLORS.rackBad;
    return `<tr><td><span class="croquis-week-chip" style="background:${CROQUIS_WEEK_COLORS[week].fill};">${croquisWeekLabel(week)}</span></td>`
      + `<td class="croquis-count" style="color:${color};">${have}${need === undefined ? '' : ` / ${need}`}</td></tr>`;
  }).join('');
  container.innerHTML = `<div class="croquis-toolbar-label">Tablettes / requises</div><table>${rows}</table>`;
}
