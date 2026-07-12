// ─── yield-range/app/logic.js — Rendement admin page ─
//
// Spec: yield-range/app/user-stories.md. Yield model:
// window.YieldRange.predictYield (yield-range/domain/spec.md, carbon-balance) — all
// numbers come from the engine; this file only wires inputs and maps outputs
// to markup. Nursery heatmap: window.YieldRange.seedlingThinningGrid().
//
// State held in the DOM (.active toggle buttons). Page entry: buildYieldRange.
// renderYieldRangeInputs renders the toggles once and wires one delegated
// listener; re-entries keep operator state.

function buildYieldRange() {
  renderYieldRangeInputs();
  renderYieldRange();
}

// Seedling-thinning heatmap. Fresh weight (g/plant) for each plateau ×
// checker-thin day × sample day, from window.YieldRange.seedlingThinningGrid()
// (merged expolinear + cap model, yield-range/domain/domain.md). Static — renders
// once from buildYieldRange. Cell shade tracks weight; ▲ marks a plant that
// hit its canopy-volume cap. No numeric values hardcoded in the renderer.
function renderSeedlingThinningTable(stressed = false) {
  const container = document.getElementById('yr-thinning-table');
  if (!container || !window.YieldRange.seedlingThinningGrid) return;
  const grid = window.YieldRange.seedlingThinningGrid(stressed);

  const maximumWeight = Math.max(...grid.rows.flatMap(r => r.cells.flatMap(c => c.weights.map(w => w.weight))));
  const fmtDay = d => (Math.round(d * 10) / 10).toString().replace('.', ',');
  // Green heatmap: alpha ramps with weight so the eye reads size at a glance.
  const cellStyle = (w) => {
    const alpha = 0.06 + 0.5 * (w.weight / maximumWeight);
    const border = w.atCap ? 'border:1px solid #1e6b2d;' : 'border:1px solid transparent;';
    return `background:rgba(30,107,45,${alpha.toFixed(3)}); ${border}`;
  };

  const cols = `grid-template-columns:1.25fr repeat(${grid.sampleDays.length}, 1fr);`;
  const conditionsLabel = grid.conditions.stressed
    ? 'chaleur + sécheresse (ancré 5 g @ J25, 50 cell.)'
    : 'optimales (bien arrosé)';
  let html = `<div style="font-size:11.5px; color:var(--text-muted); margin-bottom:12px; line-height:1.5;">`
    + `Poids frais (g/plant) · DLI <strong style="color:var(--text);">${grid.conditions.dli} mol/m²/j</strong> · conditions <strong style="color:var(--text);">${conditionsLabel}</strong> · aucun plant retiré (éclaircissage vers plus de plateaux). `
    + `<span style="color:#1e6b2d; font-weight:700;">▲</span> = plafond canopée atteint.</div>`;

  grid.rows.forEach(row => {
    // Plateau band: start area, canopy-closure day, cap packed → spaced.
    html += `<div style="margin-top:14px; margin-bottom:6px; display:flex; align-items:baseline; justify-content:space-between; gap:8px;">`
      + `<div style="font-weight:700; color:var(--text); font-size:13px;">${row.plateauSize} cellules `
      + `<span style="font-weight:400; color:var(--text-muted); font-size:11px;">(${(Math.round(row.areaIn2 * 10) / 10).toString().replace('.', ',')} po²/plant)</span></div>`
      + `<div style="font-family:'DM Mono',monospace; font-size:11px; color:var(--text-muted);">${row.closureDay == null ? 'ne ferme pas' : `ferme ~J${fmtDay(row.closureDay)}`} · plafond ${row.capPacked.toFixed(0)}→${row.capSpaced.toFixed(0)} g</div>`
      + `</div>`;

    html += `<div style="display:grid; ${cols} gap:5px 8px; font-size:12px;">`;
    // Column header: sample days.
    html += `<div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Éclaircir</div>`;
    grid.sampleDays.forEach(d => {
      html += `<div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px; text-align:right;">J${d}</div>`;
    });
    // One row per thin-day.
    row.cells.forEach(cell => {
      html += `<div style="color:var(--text); font-weight:600; align-self:center;">J${cell.thinDay}</div>`;
      cell.weights.forEach(w => {
        html += `<div style="${cellStyle(w)} border-radius:4px; padding:5px 7px; text-align:right; font-family:'DM Mono',monospace; color:var(--text);">`
          + `${w.weight.toFixed(0)}${w.atCap ? ' <span style="color:#1e6b2d;">▲</span>' : ''}</div>`;
      });
    });
    html += `</div>`;
  });

  container.innerHTML = html;
}

// Nursery-duration options (weeks). Checker-thin fires ~1 week before
// transplant, floored at day 1.
const YR_NURSERY_WEEKS = [2, 3, 4, 5];
const nurseryDaysFromWeeks = weeks => weeks * 7;
const thinDayFromNurseryDays = nurseryDays => Math.max(1, nurseryDays - 7);

// Default selections mirror the yield-range worked example. Nursery conditions
// default to 'stress' — the measured Décembre reality (drought+heat, 5 g @ d25).
const YR_DEFAULTS = { spacing: '5r6', routine: '2wk', nursery: '4', tray: '50', thin: 'on', conditions: 'stress' };

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

  container.innerHTML =
    group('Espacement (planche 30 po)', 'spacing',
      YR.FIELD_SPACING_CONFIGS.map(c => ({ value: c.key, label: `${c.rows}r×${c.inRowInch}"` })))
    + group('Récolte de chaque planche', 'routine',
      YR.LABOR_ROUTINES.map(r => ({ value: r.key, label: r.label.replace('Aux ', '').replace(' semaines', ' sem'), sub: `${r.fieldDays} j` })))
    + group('Durée pépinière', 'nursery',
      YR_NURSERY_WEEKS.map(w => ({ value: String(w), label: String(w), sub: 'sem' })))
    + group('Plateau pépinière', 'tray',
      YR.NURSERY_TRAY_CELLS.map(n => ({ value: String(n), label: String(n), sub: 'cellules' })))
    + group('Éclaircissage échiquier', 'thin',
      [{ value: 'on', label: 'Oui', sub: '≈1 sem avant' }, { value: 'off', label: 'Non', sub: '—' }])
    + group('Conditions pépinière', 'conditions',
      [{ value: 'stress', label: 'Chaleur + sécheresse', sub: 'stressé (réel)' }, { value: 'clean', label: 'Optimales', sub: 'bien arrosé' }]);

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
  const thinning = activeValue('thin') === 'on';
  const nurseryDays = nurseryDaysFromWeeks(parseInt(activeValue('nursery'), 10));
  return {
    fieldSpacingKey: activeValue('spacing'),
    laborRoutineKey: activeValue('routine'),
    nurseryTrayCells: parseInt(activeValue('tray'), 10),
    thinning,
    thinDay: thinning ? thinDayFromNurseryDays(nurseryDays) : null,
    nurseryDays,
    nurseryStress: activeValue('conditions') === 'stress',
  };
}

// Chart view: full-cycle trajectory (default) or the nursery thinning-timing
// comparison. Held in a module var — persists across input re-renders.
let yrChartMode = 'fullcycle';

function renderYieldRange() {
  if (!window.YieldRange || !window.YieldRange.predictYield) return;
  const inputs = readYieldRangeInputs();
  const model = window.YieldRange.predictYield(inputs);
  const results = document.getElementById('yr-results');
  if (results) results.innerHTML = renderYieldResults(model);
  const chart = document.getElementById('yr-chart-container');
  if (chart) {
    const svg = yrChartMode === 'thinning'
      ? renderNurseryThinningChart(inputs.nurseryTrayCells, inputs.nurseryStress)
      : renderYieldChart(inputs);
    chart.innerHTML = renderChartModeToggle(yrChartMode) + svg;
    wireChartModeToggle(chart);
  }
  renderSeedlingThinningTable(inputs.nurseryStress);
}

// Two-button toggle above the chart: full cycle ↔ nursery thinning comparison.
function renderChartModeToggle(mode) {
  const btn = (value, label) =>
    `<button class="stage-btn${value === mode ? ' active' : ''}" data-yr-chart="${value}" `
    + `style="flex:0 0 auto; padding:5px 12px;">${label}</button>`;
  return `<div style="display:flex; gap:6px; margin-bottom:10px;">`
    + btn('fullcycle', 'Plein cycle') + btn('thinning', 'Éclaircissage') + `</div>`;
}

function wireChartModeToggle(container) {
  if (container.dataset.chartWired) return;
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-yr-chart]');
    if (!btn) return;
    yrChartMode = btn.dataset.yrChart;
    renderYieldRange();
  });
  container.dataset.chartWired = '1';
}

// Headline stat tiles (yearly sales · kg/month · trays) + a secondary detail
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
    + tile(fmtInt(m.yearlySalesDollars), "$", 'Ventes / an', 'var(--accent-lettuce)')
    + tile(fmtInt(m.kgPerWeek), 'kg', 'Récolte / semaine')
    + tile(fmtInt(m.traysInNursery), '', 'Plateaux pépinière')
    + `</div>`;

  const badge = flag => flag
    ? ` <span style="font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#8a3e1e; background:#fbeee8; border:1px solid #e8c9bc; border-radius:4px; padding:1px 5px;">sénescence</span>`
    : '';
  const row = (label, value) =>
    `<div style="display:flex; justify-content:space-between; align-items:baseline; padding:6px 0; border-top:1px solid var(--border);">`
    + `<span style="color:var(--text-muted);">${label}</span>`
    + `<span style="font-family:'DM Mono',monospace; color:var(--text);">${value}</span></div>`;

  const detail = `<div style="margin-top:16px; font-size:12.5px;">`
    + row('Poids semis (transplant)', `${fmtInt(m.transplantWeightG)} g${badge(m.senescingAtTransplant)}`)
    + row('Poids tête récolte', `${fmtInt(m.harvestWeightG)} g${badge(m.senescingAtHarvest)}`)
    + row('Pic', `${fmtInt(m.peakWeightG)} g · J${m.peakDay}`)
    + `</div>`;

  const inputs = readYieldRangeInputs();
  const conditionsNote = inputs.nurseryStress
    ? 'Pépinière : chaleur + sécheresse (ancré 5 g @ J25).'
    : 'Pépinière : conditions optimales (non mesuré).';
  const note = `<div style="margin-top:12px; font-size:10.5px; color:var(--text-muted); line-height:1.5;">`
    + `Transplant J${inputs.nurseryDays}${inputs.thinning ? ` · éclaircissage J${inputs.thinDay}` : ''} · ${YR.BED_COUNT} planches 30 po × 100 pi · ${YR.PRICE_PER_KG} $/kg. `
    + `${conditionsNote} Sénescence champ non calibrée — poids absolus indicatifs.</div>`;

  return tiles + detail + note;
}

// renderYieldChart(inputs) → SVG of the full-cycle fresh-weight trajectory
// (nursery → field), four checker-thin timings overlaid (no thin · 2/3/4
// weeks): exponential ramp → linear at closure → decline past senescence.
// Transplant marker, field-cap reference line, legend with harvest weight.
// A thin timing at or past the nursery length is skipped (identical to no
// thin — no nursery days remain after it). From window.YieldRange.predictYield.
function renderYieldChart(inputs) {
  const YR = window.YieldRange;
  const scenarios = [
    { label: 'Sans éclaircir',  thinning: false, thinDay: null, color: '#8a8f98' },
    { label: 'Éclaircir 2 sem', thinning: true,  thinDay: 14,   color: '#27874a' },
    { label: 'Éclaircir 3 sem', thinning: true,  thinDay: 21,   color: '#2b6cb0' },
    { label: 'Éclaircir 4 sem', thinning: true,  thinDay: 28,   color: '#b8562a' },
  ].filter(s => !s.thinning || s.thinDay < inputs.nurseryDays)
   .map(s => ({ ...s, model: YR.predictYield({ ...inputs, thinning: s.thinning, thinDay: s.thinning ? s.thinDay : null }) }));

  const baseline = scenarios[0].model;
  const xMaximum = baseline.trajectory[baseline.trajectory.length - 1].day;
  const yMaximum = Math.max(baseline.fieldCapG, ...scenarios.flatMap(s => s.model.trajectory.map(p => p.weight_g))) * 1.08;
  const transplantDay = inputs.nurseryDays;

  const FS_TICK = 14, FS_TITLE = 15, FS_MARK = 13, FS_CAP = 12.5, FS_LEGEND = 14;
  const W = 660, H = 400, ML = 62, MR = 104, MT = 22, MB = 62;
  const plotW = W - ML - MR, plotH = H - MT - MB;
  const x = d => ML + d / xMaximum * plotW;
  const y = w => MT + plotH - w / yMaximum * plotH;

  const axisColor = 'var(--text-muted)', gridColor = 'var(--border)';
  const capColor = 'var(--text-muted)', markerColor = '#8a3e1e';

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; display:block; font-family:inherit;">`;

  [0, 0.25, 0.5, 0.75, 1.0].map(f => yMaximum * f).forEach(v => {
    const yy = y(v);
    svg += `<line x1="${ML}" y1="${yy}" x2="${ML + plotW}" y2="${yy}" stroke="${gridColor}" stroke-width="0.5"/>`;
    svg += `<text x="${ML - 9}" y="${yy + 5}" text-anchor="end" font-size="${FS_TICK}" fill="${axisColor}" font-family="'DM Mono',monospace">${Math.round(v)}</text>`;
  });
  for (let d = 0; d <= xMaximum; d += 7) {
    const xx = x(d);
    svg += `<line x1="${xx}" y1="${MT}" x2="${xx}" y2="${MT + plotH}" stroke="${gridColor}" stroke-width="0.5"/>`;
    svg += `<text x="${xx}" y="${MT + plotH + 20}" text-anchor="middle" font-size="${FS_TICK}" fill="${axisColor}" font-family="'DM Mono',monospace">${d}</text>`;
  }
  svg += `<line x1="${ML}" y1="${MT + plotH}" x2="${ML + plotW}" y2="${MT + plotH}" stroke="${axisColor}" stroke-width="1"/>`;
  svg += `<line x1="${ML}" y1="${MT}" x2="${ML}" y2="${MT + plotH}" stroke="${axisColor}" stroke-width="1"/>`;

  // Field-cap reference line.
  const yCap = y(baseline.fieldCapG);
  svg += `<line x1="${ML}" y1="${yCap}" x2="${ML + plotW}" y2="${yCap}" stroke="${capColor}" stroke-width="1" stroke-dasharray="4 3"/>`;
  svg += `<text x="${ML + plotW + 6}" y="${yCap + 4}" text-anchor="start" font-size="${FS_CAP}" fill="${capColor}" font-family="'DM Mono',monospace">Plafond champ</text>`;

  // Transplant marker (shared — nursery length is a single input).
  const xT = x(transplantDay);
  svg += `<line x1="${xT}" y1="${MT}" x2="${xT}" y2="${MT + plotH}" stroke="${markerColor}" stroke-width="1" stroke-dasharray="3 3"/>`;
  svg += `<text x="${xT + 5}" y="${MT + 15}" text-anchor="start" font-size="${FS_MARK}" fill="${markerColor}" font-weight="600">Transplant J${transplantDay}</text>`;

  // One trajectory per thinning scenario.
  scenarios.forEach(s => {
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
  svg += `<text x="${ML + plotW / 2}" y="${H - 8}" text-anchor="middle" font-size="${FS_TITLE}" fill="${axisColor}" font-weight="600">Jours depuis germination</text>`;
  svg += `<text x="16" y="${MT + plotH / 2}" text-anchor="middle" font-size="${FS_TITLE}" fill="${axisColor}" font-weight="600" transform="rotate(-90 16 ${MT + plotH / 2})">Poids tête (g)</text>`;

  svg += `</svg>`;
  return svg;
}

// renderNurseryThinningChart(plateauSize) → SVG overlaying four nursery
// growth curves for the given plateau: no thin, and checker-thin at 2 / 3 / 4
// weeks. Shows why thinning before canopy closure lifts final weight, and why
// the no-thin curve plateaus at the packed volume cap (dashed). Pure seedling
// model (window.YieldRange.seedlingTrajectory), nursery phase only.
function renderNurseryThinningChart(plateauSize, stressed = false) {
  const YR = window.YieldRange;
  const maximumDay = 42;
  const scenarios = [
    { label: 'Sans éclaircir',  thinDay: null, color: '#8a8f98' },
    { label: 'Éclaircir 2 sem', thinDay: 14,   color: '#27874a' },
    { label: 'Éclaircir 3 sem', thinDay: 21,   color: '#2b6cb0' },
    { label: 'Éclaircir 4 sem', thinDay: 28,   color: '#b8562a' },
  ];
  const series = scenarios.map(s => ({ ...s, traj: YR.seedlingTrajectory(plateauSize, s.thinDay, maximumDay, stressed) }));
  const capPacked = YR.seedlingChartModel(plateauSize, null, maximumDay, stressed).capPacked;

  const xMaximum = maximumDay;
  const yMaximum = Math.max(...series.flatMap(s => s.traj.map(p => p.weight))) * 1.08;

  // Bigger type throughout (Guillaume request): ticks 14, titles 15, legend 14.
  const FS_TICK = 14, FS_TITLE = 15, FS_LEGEND = 14, FS_CAP = 12.5;
  const W = 660, H = 400, ML = 62, MR = 28, MT = 22, MB = 62;
  const plotW = W - ML - MR, plotH = H - MT - MB;
  const x = d => ML + d / xMaximum * plotW;
  const y = w => MT + plotH - w / yMaximum * plotH;

  const axisColor = 'var(--text-muted)', gridColor = 'var(--border)', capColor = 'var(--text-muted)';
  // Downsample the 0.05-day series for a lighter polyline; the curve is smooth.
  const thin = pts => pts.filter((_, i) => i % 4 === 0).concat(pts[pts.length - 1]);

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; display:block; font-family:inherit;">`;

  [0, 0.25, 0.5, 0.75, 1.0].map(f => yMaximum * f).forEach(v => {
    const yy = y(v);
    svg += `<line x1="${ML}" y1="${yy}" x2="${ML + plotW}" y2="${yy}" stroke="${gridColor}" stroke-width="0.5"/>`;
    svg += `<text x="${ML - 9}" y="${yy + 5}" text-anchor="end" font-size="${FS_TICK}" fill="${axisColor}" font-family="'DM Mono',monospace">${Math.round(v)}</text>`;
  });
  for (let d = 0; d <= xMaximum; d += 7) {
    const xx = x(d);
    svg += `<line x1="${xx}" y1="${MT}" x2="${xx}" y2="${MT + plotH}" stroke="${gridColor}" stroke-width="0.5"/>`;
    svg += `<text x="${xx}" y="${MT + plotH + 20}" text-anchor="middle" font-size="${FS_TICK}" fill="${axisColor}" font-family="'DM Mono',monospace">${d}</text>`;
  }
  svg += `<line x1="${ML}" y1="${MT + plotH}" x2="${ML + plotW}" y2="${MT + plotH}" stroke="${axisColor}" stroke-width="1"/>`;
  svg += `<line x1="${ML}" y1="${MT}" x2="${ML}" y2="${MT + plotH}" stroke="${axisColor}" stroke-width="1"/>`;

  // Packed-cap reference (the ceiling the no-thin curve plateaus against).
  const yCap = y(capPacked);
  svg += `<line x1="${ML}" y1="${yCap}" x2="${ML + plotW}" y2="${yCap}" stroke="${capColor}" stroke-width="1" stroke-dasharray="4 3"/>`;
  svg += `<text x="${ML + plotW - 4}" y="${yCap - 6}" text-anchor="end" font-size="${FS_CAP}" fill="${capColor}" font-family="'DM Mono',monospace">Plafond plateau ${capPacked.toFixed(0)} g</text>`;

  // Four trajectory polylines.
  series.forEach(s => {
    const points = thin(s.traj).map(p => `${x(p.day).toFixed(1)},${y(p.weight).toFixed(1)}`).join(' ');
    svg += `<polyline points="${points}" fill="none" stroke="${s.color}" stroke-width="2.5"/>`;
  });

  // Legend, top-left inside the plot (curves are low there early).
  let ly = MT + 14;
  series.forEach(s => {
    svg += `<line x1="${ML + 12}" y1="${ly - 4}" x2="${ML + 34}" y2="${ly - 4}" stroke="${s.color}" stroke-width="3"/>`;
    const g35 = Math.round(s.traj.find(p => p.day >= 35 - 1e-9).weight);
    svg += `<text x="${ML + 40}" y="${ly}" text-anchor="start" font-size="${FS_LEGEND}" fill="var(--text)">${s.label} · ${g35} g @ J35</text>`;
    ly += 21;
  });

  // Axis titles.
  svg += `<text x="${ML + plotW / 2}" y="${H - 8}" text-anchor="middle" font-size="${FS_TITLE}" fill="${axisColor}" font-weight="600">Jours depuis germination</text>`;
  svg += `<text x="16" y="${MT + plotH / 2}" text-anchor="middle" font-size="${FS_TITLE}" fill="${axisColor}" font-weight="600" transform="rotate(-90 16 ${MT + plotH / 2})">Poids semis (g)</text>`;

  svg += `</svg>`;
  return svg;
}
