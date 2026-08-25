// ─── app/admin/rendement/logic.js — Rendement admin page ─
//
// Spec: app/admin/rendement/user-stories.md. Yield model:
// window.YieldRange.predictYield (yield-range/domain/spec.md, carbon-balance) — all
// numbers come from the engine; this file only wires inputs and maps outputs
// to markup.
//
// State held in the DOM (.active toggle buttons). Page entry: buildYieldRange.
// renderYieldRangeInputs renders the toggles once and wires one delegated
// listener; re-entries keep operator state.

function buildYieldRange() {
  renderYieldRangeInputs();
  renderYieldRange();
}

// Fixed nursery regime (no longer operator inputs): 5-week nursery on the
// sowing axis (day 1 = sowing → transplant day 36), 32-cell tray, clean
// (well-watered) conditions.
const YR_NURSERY_DAYS = 36;
const YR_TRAY_CELLS = 32;
// Thin events fire at the start of growth weeks 4 and 5 (days 22 and 29).
// Thin = re-potting into trays holding N pots (32 = no thin); areaFactor
// fed to the model is cells ÷ N.
const YR_THIN_WEEK4_DAY = 22;
const YR_THIN_WEEK5_DAY = 29;
const YR_POTS_WEEK4 = [32, 16, 10, 8, 7];
const YR_POTS_WEEK5 = [16, 10, 8, 7, 6, 5];

const YR_DEFAULTS = { spacing: '3r8', routine: '2wk', thin4: '16', thin5: '7' };

// Week 5 never re-crowds: its effective pots/tray is clamped down to week 4's.
function yrThinEvents(pots4, pots5) {
  return [
    { day: YR_THIN_WEEK4_DAY, areaFactor: YR_TRAY_CELLS / pots4 },
    { day: YR_THIN_WEEK5_DAY, areaFactor: YR_TRAY_CELLS / Math.min(pots4, pots5) },
  ];
}

// Render the four input toggle groups from the engine's option sets, then wire
// one delegated click listener. Idempotent — skips if already rendered so page
// re-entries keep operator selections.
function renderYieldRangeInputs() {
  const container = document.getElementById('yr-inputs');
  if (!container || container.dataset.wired === '1') return;
  const YR = window.YieldRange;
  if (!YR || !YR.FIELD_SPACING_CONFIGS) return;

  const group = (title, name, options) => {
    const btns = options.map(o =>
      `<button class="stage-btn${o.value === YR_DEFAULTS[name] ? ' active' : ''}" data-yr-group="${name}" data-yr-value="${o.value}">`
      + `<span class="stage-label">${o.label}</span>`
      + (o.sub ? `<span class="stage-weeks">${o.sub}</span>` : '')
      + `</button>`).join('');
    return `<div style="margin-bottom:16px;">`
      + `<div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">${title}</div>`
      + `<div class="stage-selector" style="flex-wrap:wrap;">${btns}</div></div>`;
  };

  const potsOptions = pots => pots.map(p => ({ value: String(p), label: `${p}` }));
  container.innerHTML =
    group('Espacement (planche 30 po)', 'spacing',
      YR.FIELD_SPACING_CONFIGS.map(c => ({ value: c.key, label: `${c.rows}r×${c.inRowInch}"` })))
    + group('Récolte de chaque planche', 'routine',
      YR.LABOR_ROUTINES.map(r => ({ value: r.key, label: r.label.replace('Aux ', '').replace(' semaines', ' sem'), sub: `${r.fieldDays} j` })))
    + group(`Pots / plateau semaine 4 (J${YR_THIN_WEEK4_DAY})`, 'thin4', potsOptions(YR_POTS_WEEK4))
    + group(`Pots / plateau semaine 5 (J${YR_THIN_WEEK5_DAY})`, 'thin5', potsOptions(YR_POTS_WEEK5));

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-yr-group]');
    if (!btn) return;
    const grp = btn.dataset.yrGroup;
    container.querySelectorAll(`[data-yr-group="${grp}"]`).forEach(b => b.classList.toggle('active', b === btn));
    renderYieldRange();
  });
  container.dataset.wired = '1';
}

// Read the active toggle in each group → predictYield input object. Falls back
// to the defaults when a group has no active button (first render safety).
function readYieldRangeInputs() {
  const activeValue = name => {
    const button = document.querySelector(`#yr-inputs [data-yr-group="${name}"].active`);
    return button ? button.dataset.yrValue : YR_DEFAULTS[name];
  };
  const potsWeek4 = parseInt(activeValue('thin4'), 10);
  const potsWeek5 = parseInt(activeValue('thin5'), 10);
  return {
    fieldSpacingKey: activeValue('spacing'),
    laborRoutineKey: activeValue('routine'),
    nurseryTrayCells: YR_TRAY_CELLS,
    thinEvents: yrThinEvents(potsWeek4, potsWeek5),
    potsWeek4,
    potsWeek5,
    nurseryDays: YR_NURSERY_DAYS,
  };
}

function renderYieldRange() {
  if (!window.YieldRange || !window.YieldRange.predictYield) return;
  const inputs = readYieldRangeInputs();
  const model = window.YieldRange.predictYield(inputs);
  const results = document.getElementById('yr-results');
  if (results) results.innerHTML = renderYieldResults(model);
  const chart = document.getElementById('yr-chart-container');
  if (chart) chart.innerHTML = renderYieldChart(inputs);
}

// Headline stat tiles (yearly sales · kg/week · trays · heads per bed) + a secondary detail
// list, all from the model object. fmtInt groups thousands with a space
// (locale-independent). No values computed here.
function renderYieldResults(m) {
  const fmtInt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const YR = window.YieldRange;

  const tile = (value, unit, label, accent) =>
    `<div style="flex:1; min-width:92px; background:var(--input-bg); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px 10px;">`
    + `<div style="font-family:'DM Mono',monospace; font-size:21px; font-weight:700; color:${accent || 'var(--text)'}; line-height:1.1;">${value}`
    + (unit ? `<span style="font-size:12px; font-weight:600; color:var(--text-muted);"> ${unit}</span>` : '')
    + `</div><div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); margin-top:6px;">${label}</div></div>`;

  const tiles = `<div style="display:flex; gap:8px; flex-wrap:wrap;">`
    + tile(Math.floor(m.yearlySalesDollars / 1000), "k$", 'Ventes / an', 'var(--accent-lettuce)')
    + tile(fmtInt(m.kgPerWeek), 'kg', 'Récolte / semaine')
    + tile(fmtInt(m.traysInNursery), '', 'Plateaux pépinière')
    + tile(fmtInt(m.traysSeededPerWeek), '', 'Plateaux à semer / sem')
    + tile(fmtInt(m.headsPerBed), '', 'Têtes / planche')
    + `</div>`;

  const row = (label, value) =>
    `<div style="display:flex; justify-content:space-between; align-items:baseline; padding:6px 0; border-top:1px solid var(--border);">`
    + `<span style="color:var(--text-muted);">${label}</span>`
    + `<span style="font-family:'DM Mono',monospace; color:var(--text);">${value}</span></div>`;

  const detail = `<div style="margin-top:16px; font-size:12.5px;">`
    + row('Poids semis (transplant)', `${fmtInt(m.transplantWeightG)} g`)
    + row('Poids tête récolte', `${fmtInt(m.harvestWeightG)} g`)
    + `</div>`;

  // Trays on the bench per cohort age week, from the model.
  const weekCells = m.traysByNurseryWeek.map(w =>
    `<td style="text-align:center; font-family:'DM Mono',monospace; padding:5px 4px;">${fmtInt(w.trays)}</td>`).join('');
  const weekHeaders = m.traysByNurseryWeek.map(w =>
    `<th style="text-align:center; font-weight:600; color:var(--text-muted); padding:5px 4px;">${w.week}</th>`).join('');
  const weekTable = `<div style="margin-top:16px; font-size:12px;">`
    + `<div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); margin-bottom:6px;">Plateaux par semaine de pépinière</div>`
    + `<table style="width:100%; border-collapse:collapse; border:1px solid var(--border);">`
    + `<tr style="border-bottom:1px solid var(--border);">${weekHeaders}</tr>`
    + `<tr>${weekCells}</tr></table></div>`;

  const inputs = readYieldRangeInputs();
  const note = `<div style="margin-top:12px; font-size:10.5px; color:var(--text-muted); line-height:1.5;">`
    + `Transplant J${inputs.nurseryDays} · éclaircissage ${inputs.potsWeek4} pots/plateau J${YR_THIN_WEEK4_DAY} · ${Math.min(inputs.potsWeek4, inputs.potsWeek5)} pots/plateau J${YR_THIN_WEEK5_DAY} · plateau ${YR_TRAY_CELLS} cellules · réserve semis ${Math.round(YR.NURSERY_BACKUP_FRACTION * 100)} % (comptes de plateaux) · ${YR.BED_COUNT} planches 30 po × 100 pi · ${YR.PRICE_PER_KG} $/kg.</div>`;

  return tiles + detail + weekTable + note;
}

// renderYieldChart(inputs) → SVG of the full-cycle fresh-weight trajectory
// (nursery → field): the selected pots/tray vs the default plan
// (16 semaine 4 · 7 semaine 5), skipped when the selection IS the default.
// Transplant marker, field-cap reference line, legend with harvest weight.
// From window.YieldRange.predictYield.
function renderYieldChart(inputs) {
  const YR = window.YieldRange;
  const defaultPots4 = parseInt(YR_DEFAULTS.thin4, 10);
  const defaultPots5 = parseInt(YR_DEFAULTS.thin5, 10);
  const isDefault = inputs.potsWeek4 === defaultPots4 && inputs.potsWeek5 === defaultPots5;
  const scenarios = [
    { label: 'Sélection', color: '#27874a', thinEvents: inputs.thinEvents },
    ...(isDefault ? [] : [{
      label: `Défaut ${defaultPots4}/${defaultPots5} pots`,
      color: '#8a8f98',
      thinEvents: yrThinEvents(defaultPots4, defaultPots5),
    }]),
  ].map(s => ({ ...s, model: YR.predictYield({ ...inputs, thinEvents: s.thinEvents }) }));

  const baseline = scenarios[0].model;
  const xMaximum = baseline.trajectory[baseline.trajectory.length - 1].day;
  const yMaximum = Math.max(baseline.fieldCapG, ...scenarios.flatMap(s => s.model.trajectory.map(p => p.weight_g))) * 1.08;
  const transplantDay = inputs.nurseryDays;

  const FS_TICK = 14, FS_TITLE = 15, FS_MARK = 13, FS_CAP = 12.5, FS_LEGEND = 14;
  const W = 660, H = 400, ML = 62, MR = 104, MT = 22, MB = 62;
  const plotW = W - ML - MR, plotH = H - MT - MB;
  const x = day => ML + (day - 1) / (xMaximum - 1) * plotW;
  const y = w => MT + plotH - w / yMaximum * plotH;

  const axisColor = 'var(--text-muted)', gridColor = 'var(--border)';
  const capColor = 'var(--text-muted)', markerColor = '#8a3e1e';

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; display:block; font-family:inherit;">`;

  [0, 0.25, 0.5, 0.75, 1.0].map(f => yMaximum * f).forEach(v => {
    const yy = y(v);
    svg += `<line x1="${ML}" y1="${yy}" x2="${ML + plotW}" y2="${yy}" stroke="${gridColor}" stroke-width="0.5"/>`;
    svg += `<text x="${ML - 9}" y="${yy + 5}" text-anchor="end" font-size="${FS_TICK}" fill="${axisColor}" font-family="'DM Mono',monospace">${Math.round(v)}</text>`;
  });
  for (let day = 1; day <= xMaximum; day += 7) {
    const xx = x(day);
    svg += `<line x1="${xx}" y1="${MT}" x2="${xx}" y2="${MT + plotH}" stroke="${gridColor}" stroke-width="0.5"/>`;
    svg += `<text x="${xx}" y="${MT + plotH + 20}" text-anchor="middle" font-size="${FS_TICK}" fill="${axisColor}" font-family="'DM Mono',monospace">${day}</text>`;
  }
  svg += `<line x1="${ML}" y1="${MT + plotH}" x2="${ML + plotW}" y2="${MT + plotH}" stroke="${axisColor}" stroke-width="1"/>`;
  svg += `<line x1="${ML}" y1="${MT}" x2="${ML}" y2="${MT + plotH}" stroke="${axisColor}" stroke-width="1"/>`;

  // Field-cap reference line.
  const yCap = y(baseline.fieldCapG);
  svg += `<line x1="${ML}" y1="${yCap}" x2="${ML + plotW}" y2="${yCap}" stroke="${capColor}" stroke-width="1" stroke-dasharray="4 3"/>`;
  svg += `<text x="${ML + plotW + 6}" y="${yCap + 4}" text-anchor="start" font-size="${FS_CAP}" fill="${capColor}" font-family="'DM Mono',monospace">Plafond champ</text>`;

  // Transplant marker (shared — nursery length is fixed).
  const xT = x(transplantDay);
  svg += `<line x1="${xT}" y1="${MT}" x2="${xT}" y2="${MT + plotH}" stroke="${markerColor}" stroke-width="1" stroke-dasharray="3 3"/>`;
  svg += `<text x="${xT + 5}" y="${MT + 15}" text-anchor="start" font-size="${FS_MARK}" fill="${markerColor}" font-weight="600">Transplant J${transplantDay}</text>`;

  // One trajectory per scenario (default drawn under the selection).
  [...scenarios].reverse().forEach(s => {
    const points = s.model.trajectory.map(p => `${x(p.day).toFixed(1)},${y(p.weight_g).toFixed(1)}`).join(' ');
    svg += `<polyline points="${points}" fill="none" stroke="${s.color}" stroke-width="2.5"/>`;
  });

  // Legend, top-left (curves are low there early).
  let ly = MT + 14;
  scenarios.forEach(s => {
    svg += `<line x1="${ML + 12}" y1="${ly - 4}" x2="${ML + 34}" y2="${ly - 4}" stroke="${s.color}" stroke-width="3"/>`;
    svg += `<text x="${ML + 40}" y="${ly}" text-anchor="start" font-size="${FS_LEGEND}" fill="var(--text)">${s.label} · ${Math.round(s.model.harvestWeightG)} g récolte</text>`;
    ly += 21;
  });

  // Axis titles.
  svg += `<text x="${ML + plotW / 2}" y="${H - 8}" text-anchor="middle" font-size="${FS_TITLE}" fill="${axisColor}" font-weight="600">Jours depuis semis</text>`;
  svg += `<text x="16" y="${MT + plotH / 2}" text-anchor="middle" font-size="${FS_TITLE}" fill="${axisColor}" font-weight="600" transform="rotate(-90 16 ${MT + plotH / 2})">Poids tête (g)</text>`;

  svg += `</svg>`;
  return svg;
}
