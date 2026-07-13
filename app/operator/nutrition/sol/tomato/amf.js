// Racines (AMF) week-card renderer — operator-facing.
//
// Renders ONE merged card into #amf-week-card on the Fertilisation (sol) page. Reads
// AMF_DRENCH + computeAmfPasses (data.js); every text node is derived from that
// data object. The single "now" read (week gating) lives here, at the render
// edge — the schedule math itself stays pure in data.js.
//
// Gating: shown only when crop = tomato AND today's calendar week (Mon–Sun)
// contains a drench pass; hidden otherwise.

function buildAmf() {
  const container = document.getElementById('amf-week-card');
  if (!container) return;

  const data = window.AMF_DRENCH;
  if (!data) return;

  // Week gate — tomato only, and only during a week holding a pass.
  const passes = window.computeAmfPasses(data.schedule);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const passThisWeek = passes.some((pass) => pass.date >= monday && pass.date <= sunday);

  if (currentCrop !== 'tomato' || !passThisWeek) {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'block';

  // Recipe tiles (emoji / label / big mono amount / unit) — same shape as the
  // fertigation page's ingredient tiles; rendered inside the step carrying them.
  const renderTiles = (tiles) =>
    `<div style="display:grid; grid-template-columns:repeat(${tiles.length}, 1fr); gap:10px; margin-top:10px;">` +
    tiles.map((item) =>
      `<div style="background:var(--accent-active-light); border:1.5px solid var(--accent-active-border); border-radius:var(--radius-sm); padding:14px 10px; text-align:center;">
        <div style="font-size:24px; margin-bottom:6px;">${item.emoji}</div>
        <div style="font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:1.5px; color:var(--text-muted); margin-bottom:6px;">${item.name}</div>
        ${item.amount ? `<div style="font-family:'DM Mono',monospace; font-size:24px; font-weight:700; color:var(--text);">${item.amount}</div>` : ''}
        ${item.unit ? `<div style="font-family:'DM Mono',monospace; font-size:12px; color:var(--text-muted); margin-top:2px;">${item.unit}</div>` : ''}
      </div>`
    ).join('') + '</div>';

  // Application steps — a step's tiles render inside it when present.
  let stepsHtml = '';
  data.steps.forEach((step, index) => {
    const note = step.note
      ? `<div style="font-size:11.5px; color:var(--text-muted); margin-top:5px; line-height:1.4;">${step.note}</div>`
      : '';
    stepsHtml += `<li class="step-item">
      <span class="step-number">${index + 1}</span>
      <div class="step-title">${step.title}</div>
      ${note}
      ${step.tiles ? renderTiles(step.tiles) : ''}
    </li>`;
  });

  // Critical don'ts.
  let warningsHtml = '';
  data.warnings.forEach((warning) => {
    warningsHtml += `<div class="warning-box" style="margin-top:0; margin-bottom:8px;"><strong>⛔ ${warning}</strong></div>`;
  });

  container.innerHTML =
    `<div class="card-title">Coup de pouce aux racines cette semaine</div>
     <div style="font-size:11.5px; color:var(--text-muted); margin-bottom:14px; line-height:1.4;">Pendant que les plastiques sont ouvert pour la fertilisation.</div>
     <ol class="steps-list" style="padding-left:28px;">${stepsHtml}</ol>
     <div style="margin-top:14px;">${warningsHtml}</div>`;
}

window.buildAmf = buildAmf;
