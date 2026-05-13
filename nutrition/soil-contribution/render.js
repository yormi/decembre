// Soil-contribution — UI render helper.
//
// Spec: nutrition/soil-contribution/spec.md
//
// Non-generic 6-column grid (Él. / Manque entrant / Apport ici / Manque
// sortant / Mois épuisement / icon) with opacity-faded disabled rows for
// elements that don't contribute to the gap chain. Lives in the subproject
// (not in app/index.html next to the generic renderGapGrid) because the
// column shape and disabled-row semantics are soil-block-specific.
//
// Pourquoi entries are registered by the caller (page logic.js) under the
// key `soil.${el}` — `renderGrid` emits the click handlers but never
// writes interpretation prose itself (REQ-060 inheritance).

function soilRenderGrid(gapsIn, soilMg, gapsOut, monthsToDepletion) {
  const order = ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'];
  const fmtMonths = (m) => {
    if (m == null) return '—';
    if (m >= 12) return (m / 12).toFixed(m >= 120 ? 0 : 1) + ' ans';
    return m.toFixed(1) + ' mois';
  };
  let html = `<div style="font-size:11.5px; margin-top:8px;">
    <div style="display:grid; grid-template-columns:0.5fr 0.9fr 0.9fr 0.9fr 0.9fr 0.4fr; gap:4px 8px;">
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Él.</div>
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Manque entrant</div>
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Apport ici</div>
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Manque sortant</div>
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Mois épuisement</div>
      <div></div>
    </div>`;
  order.forEach(el => {
    const gIn = gapsIn[el] || 0;
    const c = soilMg[el] || 0;
    const gOut = gapsOut[el] || 0;
    const contributing = c > 0;
    const opacity = contributing ? 1 : 0.42;
    const apportColor = contributing ? 'var(--text)' : 'var(--text-muted)';
    const apportStr = contributing ? '−' + fmtVal(c) : '—';
    let icon;
    if (!contributing) {
      icon = '○';
    } else if (gOut <= 0) {
      icon = '✅';
    } else if (gOut < gIn * 0.3) {
      icon = '🟢';
    } else if (gOut < gIn * 0.7) {
      icon = '🟡';
    } else {
      icon = '🔴';
    }
    const gOutStr = !contributing
      ? fmtVal(gIn)
      : (gOut <= 0 ? '0 (couvert)' : fmtVal(gOut));
    const gOutColor = !contributing
      ? 'var(--text-muted)'
      : (gOut <= 0 ? '#1e6b2d' : (gOut < gIn * 0.3 ? '#5a6b1e' : 'var(--text)'));
    const depletionStr = fmtMonths(monthsToDepletion[el]);
    html += `<div class="pq-row" onclick="showPourquoi('soil.${el}')" style="display:grid; grid-template-columns:0.5fr 0.9fr 0.9fr 0.9fr 0.9fr 0.4fr; gap:4px 8px; padding:2px 4px; border-radius:3px; opacity:${opacity};">
      <div style="font-weight:600;">${el}</div>
      <div style="font-family:'DM Mono',monospace; color:var(--text-muted);">${fmtVal(gIn)}</div>
      <div style="font-family:'DM Mono',monospace; color:${apportColor};">${apportStr}</div>
      <div style="font-family:'DM Mono',monospace; font-weight:600; color:${gOutColor};">${gOutStr}</div>
      <div style="font-family:'DM Mono',monospace; color:var(--text-muted);">${depletionStr}</div>
      <div style="text-align:center;">${icon}</div>
    </div>`;
  });
  html += `</div>`;
  return html;
}
