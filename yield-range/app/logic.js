// ─── yield-range/app/logic.js — Rendement semis admin page ─
//
// Spec: yield-range/app/spec.md (REQ-119 two inputs · REQ-120 capacité
// plafond display · REQ-121 chart with axis labels + reference line +
// marker). Math contract: yield-range/spec.md (REQ-112 to REQ-118).
//
// State held in the DOM (no module-level vars). Page entry: buildYieldRange.
// setupYieldRangeInputs is idempotent — wires listeners once across re-entries.

let _yrInputsWired = false;

function buildYieldRange() {
  // Defensive: if the inputs are already in the DOM (page render), don't
  // reset their values — re-entries (admin nav round-trip, hashchange) keep
  // operator state. setupYieldRangeInputs is idempotent.
  setupYieldRangeInputs();
  renderYieldRange();
}

function setupYieldRangeInputs() {
  if (_yrInputsWired) return;
  // Plateau toggle: button group with data-yr-plateau="18" / "24" / "32" / "50".
  document.querySelectorAll('[data-yr-plateau]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-yr-plateau]').forEach(b => b.classList.toggle('active', b === btn));
      renderYieldRange();
    });
  });
  // DEL hours slider — both 'input' (live drag) and 'change' (commit on
  // release). REQ-121 chart re-renders on every input change.
  const slider = document.getElementById('yr-led-hours');
  if (slider) {
    slider.addEventListener('input', renderYieldRange);
    slider.addEventListener('change', renderYieldRange);
  }
  _yrInputsWired = true;
}

function renderYieldRange() {
  // Read input state. Plateau toggle: the .active button's data attr.
  // Fallbacks mirror the markup defaults (50, 16).
  const activeBtn = document.querySelector('[data-yr-plateau].active');
  const plateauSize = activeBtn ? parseInt(activeBtn.dataset.yrPlateau, 10) : 50;
  const slider = document.getElementById('yr-led-hours');
  const ledHours = slider ? parseInt(slider.value, 10) : 16;

  // Update slider label.
  const labelElement = document.getElementById('yr-led-hours-label');
  if (labelElement) labelElement.textContent = `${ledHours} h`;

  // Run the math model.
  const { canopyCapG, daysToPotential, trajectory } = window.YieldRange.predictNurseryYield({ plateauSize, ledHours });

  // REQ-120: capacité plafond display.
  const capEl = document.getElementById('yr-canopy-cap');
  if (capEl) capEl.textContent = canopyCapG.toFixed(0);

  // REQ-133: daysToPotential rendered inline next to the cap value. Number
  // → "· pic à J<n>"; null → "· pic non atteint dans la fenêtre de 49 jours".
  // Empty string when the slot isn't in the DOM yet (defensive — same shape
  // as capEl above).
  const daysElement = document.getElementById('yr-days-to-potential');
  if (daysElement) {
    daysElement.textContent = (daysToPotential != null)
      ? `· pic à J${daysToPotential}`
      : `· pic non atteint dans la fenêtre de 49 jours`;
  }

  // REQ-132: clickable bench-DLI display. Recompute via the model API so
  // the page tracks any future change in the DLI formula without a UI edit.
  // REQ-134: page-card value rounded to integer for quick-read; the modal
  // context line keeps one decimal for transparency.
  // REQ-135: text colour reflects the f_light response zone at the current
  // bench DLI (green optimum / yellow ramp / red stalled or saturated).
  // Breakpoints sourced from F_LIGHT_BREAKPOINTS via f_light(); no
  // hardcoded DLI thresholds in the UI (REQ-060).
  const dliElement = document.getElementById('yr-dli-value');
  const dliBench = window.YieldRange.dliBenchAvg(ledHours);
  if (dliElement) {
    dliElement.textContent = String(Math.round(dliBench));
    const fLight = window.YieldRange.f_light(dliBench);
    // Tier thresholds: ≤5% (green), ≤30% (yellow), >30% (red) —
    // same green/yellow/red palette signals "near optimum / partial / off-band".
    let dliColor;
    if      (fLight >= 0.95) dliColor = '#1e6b2d';  // green — optimum band
    else if (fLight >= 0.70) dliColor = '#a08020';  // yellow — light-limited ramp or mild saturation
    else                     dliColor = '#b03030';  // red — stalled (<4 mol) or saturation floor
    dliElement.style.color = dliColor;
  }

  // REQ-121: chart re-render. Replace SVG markup wholesale on each call —
  // simplest approach; trajectory is 50 points so cost is negligible.
  const chartElement = document.getElementById('yr-chart-container');
  if (chartElement) chartElement.innerHTML = renderYieldRangeChart(trajectory, canopyCapG, daysToPotential);
}

// REQ-132: f_light response modal. Auto-renders the breakpoint table from
// window.YieldRange.F_LIGHT_BREAKPOINTS (REQ-060 — no hardcoded duplicate
// of the breakpoint numeric values in HTML). Descriptive labels for each
// row are kept here since they don't live in data.js.
function openDliModal() {
  const modal = document.getElementById('yr-dli-modal');
  const body  = document.getElementById('yr-dli-modal-body');
  if (!modal || !body) return;

  const bp = window.YieldRange.F_LIGHT_BREAKPOINTS || [];
  // Read current operator state for the context line. Mirrors renderYieldRange's
  // input read so the modal context stays in sync without coupling to a shared
  // state variable.
  const activeBtn = document.querySelector('[data-yr-plateau].active');
  const plateauSize = activeBtn ? parseInt(activeBtn.dataset.yrPlateau, 10) : 50;
  const slider = document.getElementById('yr-led-hours');
  const ledHours = slider ? parseInt(slider.value, 10) : 16;
  const dliBench = window.YieldRange.dliBenchAvg(ledHours);

  // Per-plant DLI at full canopy bind (d ≥ 28, packed-canopy floor 0.40 per
  // REQ-116). Surfaced for context — operator can see what fraction of
  // bench DLI an average plant actually receives once canopies overlap.
  const dliPerPlantAtBind = dliBench * 0.40;

  // Identify breakpoint roles by index, not by hardcoded x-values:
  //   bp[0]/[1]: zero floor (< 4 mol/m²/d → f_light = 0)
  //   bp[1]→[2]: linear ramp 0 → 1.0
  //   bp[2]→[3]: optimum plateau (1.0)
  //   bp[3]→[4]: saturation ramp 1.0 → 0.7
  //   bp[4]→[5]: saturation floor (0.7)
  // The labels match the f_light comment block in data.js and the spec table
  // in yield-range/app/spec.md REQ-132.
  const fmtX = v => Number.isInteger(v) ? `${v}` : v.toFixed(1);
  const fmtY = v => v.toFixed(1).replace('.', ',');
  const rows = [];
  if (bp.length >= 6) {
    rows.push({ range: `< ${fmtX(bp[1].x)}`,                              mult: `${fmtY(bp[1].y)} (photosynthèse arrêtée)` });
    rows.push({ range: `${fmtX(bp[1].x)} → ${fmtX(bp[2].x)}`,             mult: `rampe linéaire ${fmtY(bp[1].y)} → ${fmtY(bp[2].y)}` });
    rows.push({ range: `${fmtX(bp[2].x)} – ${fmtX(bp[3].x)}`,             mult: `${fmtY(bp[2].y)} (optimum)` });
    rows.push({ range: `${fmtX(bp[3].x)} → ${fmtX(bp[4].x)}`,             mult: `rampe linéaire ${fmtY(bp[3].y)} → ${fmtY(bp[4].y)} (saturation)` });
    rows.push({ range: `≥ ${fmtX(bp[4].x)}`,                              mult: `${fmtY(bp[4].y)} (plafond saturation)` });
  }

  let html = '';
  // Context line: current bench DLI (early-cycle reality, what young plants
  // feel pre-canopy-closure — the value the page colour code is anchored to)
  // + per-plant DLI at full canopy bind (late-cycle reality, what mature
  // plants get once canopies overlap).
  html += `<div style="font-size:12px; color:var(--text-muted); margin-bottom:12px; line-height:1.55;">`
       +    `DLI banc actuel <em style="font-style:normal; color:var(--text-muted);">(jeunes plants, j ≤ 14)</em> : <strong style="color:var(--text); font-family:'DM Mono',monospace;">${dliBench.toFixed(1)} mol/m²/j</strong><br>`
       +    `DLI par plant à canopée fermée <em style="font-style:normal; color:var(--text-muted);">(j ≥ 28)</em> : <strong style="color:var(--text); font-family:'DM Mono',monospace;">${dliPerPlantAtBind.toFixed(1)} mol/m²/j</strong><br>`
       +    `<em style="font-style:normal; font-size:11px;">La couleur du DLI banc reflète la condition des jeunes plants. Une fois la canopée fermée, chaque plant ne reçoit plus que ~40 % du DLI banc.</em>`
       + `</div>`;
  // Breakpoint table.
  html += `<div style="display:grid; grid-template-columns:1fr 1.4fr; gap:6px 12px; font-size:12px; line-height:1.5;">`;
  html +=   `<div style="font-weight:700; color:var(--text); padding-bottom:4px; border-bottom:1px solid var(--border);">DLI (mol/m²/j)</div>`;
  html +=   `<div style="font-weight:700; color:var(--text); padding-bottom:4px; border-bottom:1px solid var(--border);">Multiplicateur f_light</div>`;
  rows.forEach(r => {
    html += `<div style="font-family:'DM Mono',monospace; color:var(--text);">${r.range}</div>`;
    html += `<div style="color:var(--text-muted);">${r.mult}</div>`;
  });
  html += `</div>`;

  body.innerHTML = html;
  modal.classList.add('open');
}

function closeDliModal() {
  const modal = document.getElementById('yr-dli-modal');
  if (modal) modal.classList.remove('open');
}

// Close the f_light modal on Escape, mirroring the Pourquoi modal handler.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDliModal();
});

// renderYieldRangeChart(trajectory, canopyCapG, daysToPotential) → SVG markup string.
//
// REQ-121 contract:
//   - x-axis labeled "Jours depuis germination" (range 0–49, integer, ticks every 7 days)
//   - y-axis labeled "Poids tête (g)" (range 0 to canopyCapG × 1.1, auto-scale)
//   - polyline series for trajectory
//   - horizontal dashed reference line at canopyCapG, labeled "Plafond" at the right edge
//   - vertical marker at daysToPotential when not null, labeled "Pic potentiel: J<n>"
//   - when daysToPotential is null, render annotation
//     "Plein potentiel non atteint dans la fenêtre de 49 jours" inside the chart area
function renderYieldRangeChart(trajectory, canopyCapG, daysToPotential) {
  // SVG canvas + plot-area math. viewBox keeps the chart responsive within
  // its container; margins reserve room for axis labels and tick text.
  const W = 600, H = 320;
  const ML = 56, MR = 60, MT = 18, MB = 48;
  const plotW = W - ML - MR;
  const plotH = H - MT - MB;

  const xMinimum = 0;
  const xMaximum = trajectory[trajectory.length - 1].day; // 49
  const yMinimum = 0;
  const yMaximum = canopyCapG * 1.1;

  const x = day => ML + (day - xMinimum) / (xMaximum - xMinimum) * plotW;
  const y = w   => MT + plotH - (w - yMinimum) / (yMaximum - yMinimum) * plotH;

  // X ticks every 7 days (0, 7, 14, 21, 28, 35, 42, 49).
  const xTicks = [];
  for (let d = 0; d <= xMaximum; d += 7) xTicks.push(d);
  // Y ticks: 0, then evenly-spaced fractions of canopyCapG (0.25, 0.5, 0.75, 1.0).
  const yTicks = [0, canopyCapG * 0.25, canopyCapG * 0.5, canopyCapG * 0.75, canopyCapG];

  // Axis lines.
  const axisColor = 'var(--text-muted)';
  const gridColor = 'var(--border)';
  const seriesColor = 'var(--text)';
  const referenceLineColor = 'var(--text-muted)';
  const markerColor = '#8a3e1e';

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; display:block; font-family:inherit;">`;

  // Y grid + tick labels.
  yTicks.forEach(v => {
    const yy = y(v);
    svg += `<line x1="${ML}" y1="${yy}" x2="${ML + plotW}" y2="${yy}" stroke="${gridColor}" stroke-width="0.5"/>`;
    svg += `<text x="${ML - 8}" y="${yy + 4}" text-anchor="end" font-size="11" fill="${axisColor}" font-family="'DM Mono',monospace">${v.toFixed(0)}</text>`;
  });
  // X grid + tick labels.
  xTicks.forEach(d => {
    const xx = x(d);
    svg += `<line x1="${xx}" y1="${MT}" x2="${xx}" y2="${MT + plotH}" stroke="${gridColor}" stroke-width="0.5"/>`;
    svg += `<text x="${xx}" y="${MT + plotH + 16}" text-anchor="middle" font-size="11" fill="${axisColor}" font-family="'DM Mono',monospace">${d}</text>`;
  });

  // Axis lines (over grid).
  svg += `<line x1="${ML}" y1="${MT + plotH}" x2="${ML + plotW}" y2="${MT + plotH}" stroke="${axisColor}" stroke-width="1"/>`;
  svg += `<line x1="${ML}" y1="${MT}" x2="${ML}" y2="${MT + plotH}" stroke="${axisColor}" stroke-width="1"/>`;

  // Horizontal reference line at canopyCapG (REQ-121). Dashed, with a
  // "Plafond" label at the right edge.
  const yCap = y(canopyCapG);
  svg += `<line x1="${ML}" y1="${yCap}" x2="${ML + plotW}" y2="${yCap}" stroke="${referenceLineColor}" stroke-width="1" stroke-dasharray="4 3"/>`;
  svg += `<text x="${ML + plotW + 6}" y="${yCap + 4}" text-anchor="start" font-size="11" fill="${referenceLineColor}" font-family="'DM Mono',monospace">Plafond</text>`;

  // Trajectory polyline.
  const points = trajectory.map(p => `${x(p.day)},${y(p.weight_g)}`).join(' ');
  svg += `<polyline points="${points}" fill="none" stroke="${seriesColor}" stroke-width="2"/>`;

  // Vertical marker at daysToPotential (REQ-121) — or empty-state text.
  if (daysToPotential != null) {
    const xd = x(daysToPotential);
    svg += `<line x1="${xd}" y1="${MT}" x2="${xd}" y2="${MT + plotH}" stroke="${markerColor}" stroke-width="1" stroke-dasharray="3 3"/>`;
    svg += `<text x="${xd + 5}" y="${MT + 14}" text-anchor="start" font-size="11" fill="${markerColor}" font-weight="600">Pic potentiel: J${daysToPotential}</text>`;
  } else {
    svg += `<text x="${ML + plotW / 2}" y="${MT + plotH / 2}" text-anchor="middle" font-size="12" fill="${markerColor}" font-weight="600">Plein potentiel non atteint dans la fenêtre de 49 jours</text>`;
  }

  // Axis titles.
  // X-axis title — REQ-121 "Jours depuis germination".
  svg += `<text x="${ML + plotW / 2}" y="${H - 6}" text-anchor="middle" font-size="12" fill="${axisColor}" font-weight="600">Jours depuis germination</text>`;
  // Y-axis title — REQ-121 "Poids tête (g)". Rotated 90° at left margin.
  svg += `<text x="${14}" y="${MT + plotH / 2}" text-anchor="middle" font-size="12" fill="${axisColor}" font-weight="600" transform="rotate(-90 14 ${MT + plotH / 2})">Poids tête (g)</text>`;

  svg += `</svg>`;
  return svg;
}
