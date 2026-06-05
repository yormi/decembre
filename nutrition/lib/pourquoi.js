// "Pourquoi cette dose" modal helpers — shared by the Bilan tables across
// crops (Block 1 needs, Block 2 soil, Block 3 fert, Block 4 foliar, sidedress)
// and the soil-contribution render. Consumers: nutrition/{tomato,lettuce,
// nursery}/app/logic.js, nutrition/soil-contribution/render.js, plus inline
// onclick="showPourquoi(...)" / onclick="showCellCert(...)" attributes in
// the partial pages.
//
// Registry repopulated each builder render; keys: `${blockId}.${element}`,
// `${blockId}.cell.${element}` (apport-ici-clickable-cert-and-cap-modals cell click), `${blockId}.cap.${element}.${kind}`
// (apport-ici-clickable-cert-and-cap-modals cap-emoji click).
//
// Depends on: renderSpec (lib/spec-strings.js) — operator-prose-is-deterministic-render interpretation prose.

// Collapsed <details> "Pourquoi cette dose?" expander. Still used by
// nutrition/lettuce/app/logic.js's lever recommendation card; Bilan tables use
// the modal flow (registerPourquoi / showPourquoi) below.
function pourquoiExpander(equationHtml, pluggedHtml, interpretationHtml) {
  return '<details style="margin-top:6px; font-size:11px; color:var(--text-muted); line-height:1.5;">'
    + '<summary style="cursor:pointer; user-select:none; padding:2px 0; color:var(--text-muted); font-size:10.5px; text-transform:uppercase; letter-spacing:1px; font-weight:600;">Pourquoi cette dose?</summary>'
    + '<div style="padding:6px 10px; margin-top:4px; background:var(--input-bg); border-left:2px solid var(--border); border-radius:0 var(--radius-sm) var(--radius-sm) 0;">'
    +   '<div style="font-family:\'DM Mono\',monospace; font-size:10.5px; color:var(--text); margin-bottom:4px;">' + equationHtml + '</div>'
    +   '<div style="font-family:\'DM Mono\',monospace; font-size:10.5px; color:var(--text-muted); margin-bottom:4px;">' + pluggedHtml + '</div>'
    +   '<div style="font-size:11px; color:var(--text-muted); font-style:italic;">' + interpretationHtml + '</div>'
    + '</div>'
    + '</details>';
}

window.currentPourquoi = window.currentPourquoi || {};
function registerPourquoi(key, data) { window.currentPourquoi[key] = data; }
function showPourquoi(key) {
  const d = window.currentPourquoi[key];
  if (!d) return;
  const certHtml = (d.cert != null) ? `<span class="diag-cert diag-cert-${d.cert}">cert ${d.cert}/5</span>` : '';
  document.getElementById('pq-modal-title').innerHTML = `${d.title}${certHtml}`;
  document.getElementById('pq-modal-eq').innerHTML = d.equation || '';
  document.getElementById('pq-modal-plugged').innerHTML = d.plugged || '';

  // Interpretation: operator-prose-is-deterministic-render — must be a deterministic render of spec.
  // Accepted shapes:
  //   { requirementId, key: 'name', interpolation?: { ... } } — spec-anchored prose
  //                                                       (spec owns the bytes)
  //   undefined / null / ''                            — empty interpretation
  // Plain-string form is deprecated (operator-prose-is-deterministic-render). Pass it through with a
  // console warning so legacy registrations don't break, but new code
  // MUST use the { requirementId, key } shape.
  const interpretationElement = document.getElementById('pq-modal-interpolation');
  if (!d.interpretation) {
    interpretationElement.innerHTML = '';
    interpretationElement.removeAttribute('data-prose-source');
  } else if (typeof d.interpretation === 'object' && d.interpretation.requirementId) {
    const text = renderSpec(d.interpretation.requirementId, d.interpretation.key, d.interpretation.interpolation);
    interpretationElement.innerHTML = text;
    interpretationElement.setAttribute('data-prose-source', d.interpretation.requirementId);
  } else {
    console.warn('showPourquoi: legacy string interpretation for key', key, '— migrate to { requirementId, key } per operator-prose-is-deterministic-render');
    interpretationElement.innerHTML = String(d.interpretation);
    interpretationElement.removeAttribute('data-prose-source');
  }

  document.getElementById('pq-modal').classList.add('open');
}
function closePourquoi() {
  document.getElementById('pq-modal').classList.remove('open');
}
// Close modal on Escape key.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePourquoi();
});

// apport-ici-clickable-cert-and-cap-modals — Per-(block, element) modal for cell clicks. Reuses showPourquoi
// modal markup; the key shape is `${blockId}.cell.${element}` so each block keeps
// its own modal entry per element (no aggregation across elements/blocks).
// Falls back to legacy `${blockId}.${element}` key for tomato blocks that
// pre-date apport-ici-clickable-cert-and-cap-modals (compost.N, sidedress.K, fert.Mg, foliar.Mn, etc.).
function showCellCert(blockId, element) {
  const newKey = blockId + '.cell.' + element;
  const legacyKey = blockId + '.' + element;
  if (window.currentPourquoi) {
    if (window.currentPourquoi[newKey]) { showPourquoi(newKey); return; }
    if (window.currentPourquoi[legacyKey]) { showPourquoi(legacyKey); return; }
  }
  // Last-resort fallback so a click never feels dead.
  registerPourquoi(newKey, {
    title: element + ' — ' + blockId,
    cert: null,
    equation: '',
    plugged: 'Aucun détail enregistré pour cette cellule.',
    interpretation: '',
  });
  showPourquoi(newKey);
}

// apport-ici-clickable-cert-and-cap-modals — Per-(block, element, capKind) modal for cap-emoji clicks. Distinct
// key shape from cell modals (`${blockId}.cap.${element}.${kind}`) so cell-click
// and emoji-click never collide.
function showCapReason(blockId, element, kind) {
  const key = blockId + '.cap.' + element + '.' + kind;
  if (window.currentPourquoi && window.currentPourquoi[key]) {
    showPourquoi(key);
    return;
  }
  registerPourquoi(key, {
    title: element + ' — plafond ' + kind,
    cert: null,
    equation: '',
    plugged: 'Aucune raison de plafond enregistrée.',
    interpretation: '',
  });
  showPourquoi(key);
}
