// Render a per-element grid showing demand / contribution / running gap.
// Used inside each channel block.
//
// `pqKeyPrefix` (optional): when provided, every row becomes clickable and
// opens the "Pourquoi cette dose" modal keyed by `${pqKeyPrefix}.${element}`.
// The block populates that registry inside buildNutriment via
// registerPourquoi(). If a key isn't registered, the row is still rendered
// but the click is a no-op.
// renderGapGrid — 6-col gap-chain grid. Cross-app contribution-block layout
// per contribution-block-gap-grid (nutrition/spec.md, amended 2026-05-15 to add Efficacité).
// Optional `details` (contribution-channel-details-payload) carries per-element {cert, cap}; when
// present, the Apport ici cell becomes clickable (apport-ici-clickable-cert-and-cap-modals) and renders
// cap emojis (🔥 damage / 💧 precipitation / ❗ other). `blockId` keys the
// per-cell + per-emoji modals so Block 2's K cell opens a different modal
// than Block 3's K cell. `efficiency` (channel-efficiency-capability-map) is a per-element map
// [0, 1]; rendered as integer % in column 3 (efficacite-column-capability), em-dash when absent.
//
// Backwards compat: details + blockId + efficiency optional. When details
// omitted, falls back to the legacy row-level pq-row click behavior.
//
// Depends on: formatMg + formatValue (nutrition/lib/format.js),
// registerPourquoi + showPourquoi + showCellCert + showCapReason
// (nutrition/lib/pourquoi.js).
function renderGapGrid(gapsIn, contrib, gapsOut, pqKeyPrefix, details, blockId, efficiency) {
  const order = ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'];
  const CAP_EMOJI = { damage: '🔥', precipitation: '💧', other: '❗' };
  const efficiencyMap = efficiency || {};
  const GRID_COLUMNS = '0.6fr 1fr 0.7fr 1fr 1fr 0.4fr';
  let html = `<div style="font-size:11.5px; margin-top:8px;">
    <div style="display:grid; grid-template-columns:${GRID_COLUMNS}; gap:4px 8px;">
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Él.</div>
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Manque entrant (mg)</div>
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Efficacité</div>
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Apport ici (mg)</div>
      <div style="font-weight:700; color:var(--text-muted); font-size:10px; text-transform:uppercase; letter-spacing:1px;">Manque sortant (mg)</div>
      <div></div>
    </div>`;
  order.forEach(element => {
    const gIn = gapsIn[element] || 0;
    const c = contrib[element] || 0;
    const gOut = gapsOut[element] || 0;
    if (gIn <= 0 && c <= 0) return; // hide rows where there's nothing to show
    const icon = gOut <= 0 ? '✅' : (gOut < gIn * 0.3 ? '🟢' : (gOut < gIn * 0.7 ? '🟡' : '🔴'));
    // Row-level click only when details NOT provided (legacy path). pq-row
    // class kept either way for the hover style.
    const rowClickable = (pqKeyPrefix && !details)
      ? `class="pq-row" onclick="showPourquoi('${pqKeyPrefix}.${element}')"`
      : `class="pq-row"`;
    // Apport ici cell — clickable per (block, element) when details + blockId given (apport-ici-clickable-cert-and-cap-modals).
    const det = (details || {})[element];
    const cellOnclick = (blockId && det) ? `onclick="showCellCert('${blockId}', '${element}')"` : '';
    const cellCursor = cellOnclick ? 'cursor:pointer; ' : '';
    // apport-ici-clickable-cert-and-cap-modals (revised 2026-05-11): emoji renders only when this channel
    // under-delivered for this element (gOut > 0). When fully covered, no
    // emoji even if a cap kind would in principle apply. The cap payload
    // has 4 short labelled fields (constraint, limit, lever, uncappedMg) —
    // no prose. Hover tooltip = "constraint · limit"; modal renders three
    // labelled rows + a number-delta line.
    let capEmoji = '';
    if (blockId && det && det.cap && gOut > 0) {
      const k = det.cap.kind;
      const emoji = CAP_EMOJI[k] || '';
      const constraint = det.cap.constraint || '';
      const limit = det.cap.limit || '';
      const lever = det.cap.lever || '';
      const tooltip = (constraint && limit) ? (constraint + ' · ' + limit) : (constraint || limit);
      const tooltipAttr = tooltip.replace(/"/g, '&quot;');
      const kindLabel = k === 'damage'        ? '🔥 Plafond plante'
                      : k === 'precipitation' ? '💧 Précipitation'
                                              : '❗ Autre plafond';
      const uncapped = Number(det.cap.uncappedMg) || 0;
      const supplied = c;
      const showDelta = (uncapped > supplied && supplied > 0);
      const deltaLine = showDelta
        ? `<div style="font-family:'DM Mono',monospace; font-size:14px; margin-bottom:10px;">`
            + `<span style="color:var(--text-muted);">${formatValue(supplied)}</span>`
            + ` <span style="color:var(--text-muted);">→</span> `
            + `<strong>${formatValue(uncapped)}</strong>`
            + ` <span style="color:var(--text-muted);">(+${formatValue(uncapped - supplied)})</span>`
          + `</div>`
        : '';
      const rowsHtml = `<div style="display:grid; grid-template-columns:auto 1fr; column-gap:14px; row-gap:6px; font-size:12.5px;">`
        + `<div style="color:var(--text-muted);">Contrainte</div><div style="font-weight:600;">${constraint}</div>`
        + `<div style="color:var(--text-muted);">Limite</div><div style="font-family:'DM Mono',monospace;">${limit}</div>`
        + `<div style="color:var(--text-muted);">Levier</div><div>${lever}</div>`
      + `</div>`;
      const subtitleHtml = `<div style="font-size:12px; color:var(--text-muted); margin-top:-4px; margin-bottom:8px;">${kindLabel}</div>`;
      registerPourquoi(blockId + '.cap.' + element + '.' + k, {
        title: element + ' — ' + blockId,
        cert: det.cert != null ? det.cert : null,
        equation: subtitleHtml,                  // kind badge under the title
        plugged: deltaLine + rowsHtml,
        interpretation: '',
      });
      capEmoji = ` <span style="cursor:pointer;" title="${tooltipAttr}" `
        + `onclick="event.stopPropagation(); showCapReason('${blockId}', '${element}', '${k}')">${emoji}</span>`;
    }
    const contributionValueString = c > 0 ? '−' + formatMg(c) : '—';
    const cellInner = `<span style="${cellCursor}font-family:'DM Mono',monospace; color:${c>0?'var(--text)':'var(--text-muted)'};">${contributionValueString}</span>${capEmoji}`;
    const efficiencyValue = efficiencyMap[element];
    const efficiencyCellText = (typeof efficiencyValue === 'number' && isFinite(efficiencyValue))
      ? Math.round(efficiencyValue * 100) + ' %'
      : '—';
    html += `<div ${rowClickable} style="display:grid; grid-template-columns:${GRID_COLUMNS}; gap:4px 8px; padding:2px 4px; border-radius:3px;">
      <div style="font-weight:600;">${element}</div>
      <div style="font-family:'DM Mono',monospace; color:var(--text-muted);">${formatMg(gIn)}</div>
      <div style="font-family:'DM Mono',monospace; color:var(--text-muted);">${efficiencyCellText}</div>
      <div ${cellOnclick} data-cell-key="${blockId || ''}.cell.${element}" style="${cellCursor}">${cellInner}</div>
      <div style="font-family:'DM Mono',monospace; font-weight:600; color:${gOut<=0?'#1e6b2d':(gOut<gIn*0.3?'#5a6b1e':'var(--text)')};">${formatMg(gOut)}</div>
      <div style="text-align:center;">${icon}</div>
    </div>`;
  });
  html += `</div>`;
  return html;
}
