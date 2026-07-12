// ─── yield-range/app/light/operator/logic.js — Lumière operator page ─
//
// Supplemental-LED-hours guide for Salanova (lettuce-only supplemental
// lighting). Model: yield-range/domain/light/domain.md. Pure math lives in
// yield-range/domain/{data,calc,model}.js (window.YieldRange); this file is the
// render edge only (reads new Date at render, model functions stay pure).
//
// Page entry: buildLight (called from setPage('lumiere')).

const LIGHT_MONTH_NAMES_FR = ['janvier','février','mars','avril','mai','juin',
  'juillet','août','septembre','octobre','novembre','décembre'];

// Sky-condition column headers as icons (replaces the text labels). Keyed by
// SKY_CONDITION_FACTORS[].key; the French label rides along as a hover title.
const SKY_CONDITION_ICONS = { sunny: '☀️', partly: '⛅', cloudy: '☁️' };

function buildLight() {
  renderSupplementalLedTable();
  // Admin block: the DLI target the lamp-hours table solves for.
  const dliTargetElement = document.getElementById('light-dli-target');
  if (dliTargetElement) dliTargetElement.textContent = String(window.YieldRange.DLI_TARGET);
}

function renderSupplementalLedTable() {
  const YR = window.YieldRange;
  const container = document.getElementById('lum-suppl-table');
  if (!container) return;
  const currentMonth = new Date().getMonth();
  const options = LIGHT_MONTH_NAMES_FR.map((name, i) =>
    `<option value="${i}"${i === currentMonth ? ' selected' : ''}>${name.charAt(0).toUpperCase() + name.slice(1)}</option>`).join('');
  container.innerHTML =
    `<select id="lum-suppl-month" onchange="renderSupplementalLedMonth()" style="padding:8px 10px; font-family:inherit; font-size:13px; border:1.5px solid var(--border); border-radius:var(--radius-sm); background:var(--input-bg); color:var(--text); margin-bottom:14px;">${options}</select>`
    + `<div id="lum-suppl-values"></div>`;
  renderSupplementalLedMonth();
}

// Renders the selected month's per-condition lamp hours + shortfall warning.
function renderSupplementalLedMonth() {
  const YR = window.YieldRange;
  const target = YR.DLI_TARGET;
  const maximumHours = YR.MAXIMUM_HEALTHY_PHOTOPERIOD_HOURS;
  const conditions = YR.SKY_CONDITION_FACTORS;
  const valuesElement = document.getElementById('lum-suppl-values');
  const monthSelect = document.getElementById('lum-suppl-month');
  if (!valuesElement || !monthSelect) return;
  const monthIndex = parseInt(monthSelect.value, 10);
  const clearDayMaximum = YR.CLEAR_DAY_MAXIMUM_DLI_BY_MONTH[monthIndex];

  // 2 significant digits: integer at/above 10, one decimal below.
  const fmt = v => (v >= 10 ? String(Math.round(v)) : (Math.round(v * 10) / 10).toString().replace('.', ','));

  let monthMinimumDli = Infinity;
  let head = '', cells = '';
  conditions.forEach(cond => {
    const sunDli = YR.benchSunDli(clearDayMaximum, cond.factor);
    const idealHours = YR.supplementalLedHours(sunDli, target);
    const cappedHours = Math.min(maximumHours, idealHours);
    const achievedDli = sunDli + YR.ledDli(cappedHours);
    if (achievedDli < monthMinimumDli) monthMinimumDli = achievedDli;
    const cellText = idealHours <= 0 ? '—' : fmt(cappedHours) + ' h';
    const cellColor = idealHours <= 0 ? '#1e6b2d' : 'var(--text)';
    const icon = SKY_CONDITION_ICONS[cond.key] || cond.label;
    head += `<div title="${cond.label}" style="font-size:22px; text-align:center; line-height:1;">${icon}</div>`;
    cells += `<div style="font-family:'DM Mono',monospace; font-size:22px; font-weight:700; color:${cellColor}; text-align:center;">${cellText}</div>`;
  });

  let html = `<div style="display:grid; grid-template-columns:repeat(${conditions.length}, 1fr); gap:8px 12px; font-size:12px;">${head}${cells}</div>`;

  // Warning replaces the old DLI-min column. 0,5 mol tolerance → 16,9 clears it.
  if (monthMinimumDli < target - 0.5) {
    html += `<div style="margin-top:14px; padding:9px 11px; background:rgba(176,48,48,0.08); border:1px solid #b03030; border-radius:var(--radius-sm); font-size:12px; color:#b03030; line-height:1.5;">`
      + `⚠ Jours couverts : le DLI plafonne à <strong>${fmt(monthMinimumDli)} mol/m²/j</strong> — cible ${target} hors d'atteinte même à ${maximumHours} h de DEL.</div>`;
  }

  valuesElement.innerHTML = html;
}

window.buildLight = buildLight;
window.renderSupplementalLedMonth = renderSupplementalLedMonth;
