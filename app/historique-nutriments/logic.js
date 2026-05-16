// ═══════════════ HISTORIQUE NUTRIMENTS (admin) ═══════════════
// Renders RECIPE_HISTORY (retired recipe snapshots) sorted most-recent-first
// as a date-keyed table. Each row expands to reveal a full snapshot of the
// three recipe channels (fertigation / sidedress / foliaire). Legacy entries
// without `fullSnapshot` fall back to a labeled partial-snapshot dump.
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function renderFertigationSnapshot(fert) {
  // Mirror computeStageRecipe output shape: { T1: {mgSulfate, kSulfate}, ..., T5: {...} }
  const stages = Object.keys(fert);
  if (!stages.length) return '<div style="font-size:11.5px; color:var(--text-muted);">(vide)</div>';
  const allKeys = new Set();
  for (const s of stages) for (const k of Object.keys(fert[s] || {})) allKeys.add(k);
  const cols = [...allKeys];
  let h = `<table style="width:100%; border-collapse:collapse; font-family:'DM Mono',monospace; font-size:11px;">`;
  h += `<thead><tr><th style="text-align:left; padding:4px 8px; border-bottom:1px solid var(--border); color:var(--text-muted); font-weight:500;">Stade</th>`;
  for (const c of cols) h += `<th style="text-align:right; padding:4px 8px; border-bottom:1px solid var(--border); color:var(--text-muted); font-weight:500;">${escapeHtml(c)} (g)</th>`;
  h += `</tr></thead><tbody>`;
  for (const s of stages) {
    h += `<tr><td style="padding:4px 8px; color:var(--text);">${escapeHtml(s)}</td>`;
    for (const c of cols) {
      const v = fert[s] && fert[s][c];
      h += `<td style="padding:4px 8px; text-align:right; color:var(--text);">${v == null ? '—' : escapeHtml(v)}</td>`;
    }
    h += `</tr>`;
  }
  h += `</tbody></table>`;
  return h;
}

function renderSidedressSnapshot(sd) {
  // Same shape pattern as fertigation — mirror STORED_RECIPE.tomato.sidedress.
  return renderFertigationSnapshot(sd);
}

function renderFoliaireSnapshot(fol) {
  // Mirror STORED_RECIPE.tomato.foliaire: { masterVol, backpacks, area, A: [{name, master, note?}] }
  const A = fol && Array.isArray(fol.A) ? fol.A : [];
  const meta = [];
  if (fol && fol.masterVol != null) meta.push(`master ${escapeHtml(fol.masterVol)} L`);
  if (fol && fol.backpacks != null) meta.push(`${escapeHtml(fol.backpacks)} sac(s)`);
  if (fol && fol.area) meta.push(escapeHtml(fol.area));
  let h = '';
  if (meta.length) h += `<div style="font-size:11px; color:var(--text-muted); margin-bottom:6px; font-family:'DM Mono',monospace;">${meta.join(' · ')}</div>`;
  if (!A.length) return h + `<div style="font-size:11.5px; color:var(--text-muted);">(aucun produit foliaire)</div>`;
  h += `<table style="width:100%; border-collapse:collapse; font-family:'DM Mono',monospace; font-size:11px;">`;
  h += `<thead><tr>
    <th style="text-align:left; padding:4px 8px; border-bottom:1px solid var(--border); color:var(--text-muted); font-weight:500;">Produit</th>
    <th style="text-align:right; padding:4px 8px; border-bottom:1px solid var(--border); color:var(--text-muted); font-weight:500;">Dose master</th>
  </tr></thead><tbody>`;
  for (const p of A) {
    h += `<tr>
      <td style="padding:4px 8px; color:var(--text);">${escapeHtml(p.name || '')}</td>
      <td style="padding:4px 8px; text-align:right; color:var(--text);">${escapeHtml(p.master || '—')}</td>
    </tr>`;
    if (p.note) {
      h += `<tr><td colspan="2" style="padding:0 8px 6px 8px; color:var(--text-muted); font-family:'DM Sans','DM Mono',sans-serif; font-size:11px; line-height:1.4;">${escapeHtml(p.note)}</td></tr>`;
    }
  }
  h += `</tbody></table>`;
  return h;
}

function renderFullSnapshot(fs) {
  const sect = (title, body) => `
    <div style="margin-top:12px;">
      <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">${escapeHtml(title)}</div>
      ${body}
    </div>`;
  let h = '';
  if (fs.fertigation) h += sect('Fertigation (par stade)', renderFertigationSnapshot(fs.fertigation));
  if (fs.sidedress)   h += sect('Sidedress (par stade)',   renderSidedressSnapshot(fs.sidedress));
  if (fs.foliaire)    h += sect('Foliaire',                renderFoliaireSnapshot(fs.foliaire));
  return h;
}

function buildHistoriqueNutriments() {
  const container = document.getElementById('historique-nutriments-list');
  if (!container) return;
  const entries = [...RECIPE_HISTORY].sort((a, b) => b.retired.localeCompare(a.retired));
  const dateStyle = `font-family:'DM Mono',monospace; font-size:12px; color:var(--text); white-space:nowrap;`;
  const cellPad = `padding:10px 12px; border-bottom:1px solid var(--border); vertical-align:top;`;
  let html = `<table style="width:100%; border-collapse:collapse;">
    <thead>
      <tr>
        <th style="text-align:left; padding:8px 12px; border-bottom:1px solid var(--border); color:var(--text-muted); font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:1px; width:120px;">Retirée</th>
        <th style="text-align:left; padding:8px 12px; border-bottom:1px solid var(--border); color:var(--text-muted); font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:1px;">Changement</th>
      </tr>
    </thead>
    <tbody>`;
  for (const e of entries) {
    const summaryText = e.summary || e.recipe;
    const hasFull = !!e.fullSnapshot;
    let detailBody = '';
    if (e.reason) {
      detailBody += `<div style="margin-top:4px;"><div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Raison</div><div style="font-size:12.5px; color:var(--text); line-height:1.5;">${escapeHtml(e.reason)}</div></div>`;
    }
    if (e.replacedBy) {
      detailBody += `<div style="margin-top:12px;"><div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Remplacée par</div><div style="font-size:12.5px; color:var(--text); line-height:1.5;">${escapeHtml(e.replacedBy)}</div></div>`;
    }
    if (hasFull) {
      detailBody += `<div style="margin-top:14px;"><div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Snapshot complet</div><div style="font-size:11.5px; color:var(--text); line-height:1.5;">Recette appliquée au moment du retrait — fertigation (valeur stockée verrouillée), sidedress, foliaire.</div>${renderFullSnapshot(e.fullSnapshot)}</div>`;
    } else if (e.snapshot) {
      detailBody += `<div style="margin-top:14px;">
        <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Snapshot partiel</div>
        <div style="font-size:11.5px; color:var(--text-muted); line-height:1.5; margin-bottom:6px;">Recette retirée seulement (entrée legacy — état complet des trois canaux non capturé à l'époque).</div>
        <pre style="font-family:'DM Mono',monospace; font-size:11px; background:var(--input-bg); padding:8px; border-radius:4px; margin:0; overflow-x:auto; white-space:pre-wrap;">${escapeHtml(JSON.stringify(e.snapshot, null, 2))}</pre>
      </div>`;
    }
    html += `<tr>
      <td style="${cellPad}"><span style="${dateStyle}">${escapeHtml(e.retired)}</span></td>
      <td style="${cellPad}">
        <details style="margin:0;">
          <summary style="cursor:pointer; user-select:none; list-style:none; display:flex; align-items:baseline; gap:8px; color:var(--text); font-size:13px; line-height:1.4;">
            <span style="color:var(--text-muted); font-size:10px;">▸</span>
            <span>${escapeHtml(summaryText)}</span>
          </summary>
          <div style="margin-top:10px; padding:10px 12px; background:var(--input-bg); border-radius:var(--radius-sm);">
            ${detailBody}
          </div>
        </details>
      </td>
    </tr>`;
  }
  html += `</tbody></table>`;
  container.innerHTML = html;
}
