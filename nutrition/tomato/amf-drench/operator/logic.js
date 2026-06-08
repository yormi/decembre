// Racines (AMF) page renderer — operator-facing.
//
// Owns #page-amf-content. Reads AMF_DRENCH + computeAmfPasses (data.js).
// Every text node is derived from that data object; the page markup carries
// labels only. The single "now" read (highlighting the next pass) lives here,
// at the render edge — the schedule math itself stays pure in data.js.

const AMF_WEEKDAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const AMF_MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function formatAmfDate(date) {
  return `${AMF_WEEKDAYS[date.getDay()]} ${date.getDate()} ${AMF_MONTHS[date.getMonth()]}`;
}

function buildAmf() {
  const data = window.AMF_DRENCH;
  if (!data) return;
  const passes = window.computeAmfPasses(data.schedule);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextIndex = passes.findIndex((pass) => pass.date >= today);

  // Calendar — every pass, past dimmed, next highlighted.
  let calendarHtml = '';
  passes.forEach((pass, index) => {
    const isPast = nextIndex === -1 || index < nextIndex;
    const isNext = index === nextIndex;
    const marker = isPast ? '✓' : pass.n;
    const rowStyle = isNext
      ? 'background:var(--accent-active-light); border:1.5px solid var(--accent-active-border);'
      : 'border:1px solid var(--border);';
    const textColor = isPast ? 'var(--text-muted)' : 'var(--text)';
    const markerColor = isPast ? 'var(--text-muted)' : 'var(--accent-active)';
    calendarHtml += `<div style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:var(--radius-sm); margin-bottom:6px; ${rowStyle}">
      <span style="flex-shrink:0; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#fff; background:${markerColor};">${marker}</span>
      <span style="flex:1; font-size:14px; font-weight:${isNext ? '700' : '500'}; color:${textColor}; text-transform:capitalize;">${formatAmfDate(pass.date)}</span>
    </div>`;
  });
  document.getElementById('amf-calendar').innerHTML = calendarHtml;

  // Recipe tiles (emoji / label / big mono dose / unit) — same shape as the
  // fertigation page's ingredient tiles; embedded in the step flagged tiles.
  const tileColumns = data.mix.length === 1 ? '1fr' : '1fr 1fr';
  const tilesHtml =
    `<div style="display:grid; grid-template-columns:${tileColumns}; gap:10px; margin-top:10px;">` +
    data.mix.map((item) =>
      `<div style="background:var(--accent-active-light); border:1.5px solid var(--accent-active-border); border-radius:var(--radius-sm); padding:14px 10px; text-align:center;">
        <div style="font-size:24px; margin-bottom:6px;">${item.emoji}</div>
        <div style="font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:1.5px; color:var(--text-muted); margin-bottom:6px;">${item.name}</div>
        <div style="font-family:'DM Mono',monospace; font-size:24px; font-weight:700; color:var(--text);">${item.amount}</div>
        <div style="font-family:'DM Mono',monospace; font-size:12px; color:var(--text-muted); margin-top:2px;">${item.unit}</div>
      </div>`
    ).join('') + '</div>';

  // Application steps — recipe tiles render inside the step flagged `tiles`.
  let stepsHtml = '';
  data.steps.forEach((step, index) => {
    const note = step.note
      ? `<div style="font-size:11.5px; color:var(--text-muted); margin-top:5px; line-height:1.4;">${step.note}</div>`
      : '';
    stepsHtml += `<li class="step-item">
      <span class="step-number">${index + 1}</span>
      <div class="step-title">${step.title}</div>
      ${note}
      ${step.tiles ? tilesHtml : ''}
    </li>`;
  });
  document.getElementById('amf-steps').innerHTML = stepsHtml;

  // Critical don'ts.
  let warningsHtml = '';
  data.warnings.forEach((warning) => {
    warningsHtml += `<div class="warning-box" style="margin-top:0; margin-bottom:8px;"><strong>⛔ ${warning}</strong></div>`;
  });
  document.getElementById('amf-warnings').innerHTML = warningsHtml;
}

window.buildAmf = buildAmf;
