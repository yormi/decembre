// ═══════════════ HISTORIQUE NUTRIMENTS (admin) ═══════════════
// Renders RECIPE_HISTORY (retired recipe snapshots) most-recent-first.
// Each row expands to a "what + why" panel:
//   WHAT — before→after chips per channel, computed by diffing the retired
//          snapshot against the recipe that replaced it (the next-newer
//          entry's snapshot, or live STORED_RECIPE for the newest entry).
//          Only changed values appear, so unchanged stages stay out of view.
//   WHY  — the entry's `reason` text, split per channel where the source uses
//          (1)/(2)/(3) markers, with spec ids + code identifiers stripped.
// RECIPE_HISTORY itself is the cert audit trail — never rewritten here; all
// simplification happens at render time.
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Drop spec ids + code identifiers from audit prose so the rendered text reads
// like plain language. The source string in RECIPE_HISTORY is untouched.
const JARGON_TOKEN = /(REQ[-_]|STORED_RECIPE|FP_RECIPE|computeFoliarSupply|data\.js)/;
function stripJargon(text) {
  return String(text)
    // Drop whole parentheticals that exist only to cite a spec id / code symbol,
    // so removing the token doesn't leave a broken fragment.
    .replace(/\([^()]*\)/g, (m) => (JARGON_TOKEN.test(m) ? '' : m))
    // Then any bare leftover tokens outside parens.
    .replace(/\bREQ[-_][A-Za-z0-9_]+/g, '')
    .replace(/\bSTORED_RECIPE[.\w\[\]']*/g, '')
    .replace(/\bFP_RECIPE[.\w]*/g, '')
    .replace(/\bcomputeFoliarSupply\b/g, '')
    .replace(/\bdata\.js\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([;,.])/g, '$1')
    .replace(/[;,]\s*$/, '')
    .trim();
}

// Friendly product names for the code-style snapshot keys.
const ELEMENT_LABELS = {
  mgSulfate: 'Magnésium', kSulfate: 'Potassium', feSulfate: 'Fer',
  znSulfate: 'Zinc', mnSulfate: 'Manganèse', cuSulfate: 'Cuivre',
  borax: 'Bore', naMolybdate: 'Molybdène',
  actisol_g: 'Actisol', farine_g: 'Farine de plumes',
};
function elementLabel(key) {
  return ELEMENT_LABELS[key] || key;
}

const CHANNEL_META = {
  fertigation: { icon: '💧', label: 'Fertigation' },
  sidedress:   { icon: '🌱', label: 'Sol' },
  foliaire:    { icon: '🍃', label: 'Foliaire' },
};

// ── before→after chips ──────────────────────────────────────────────
function chip(label, before, after, unit) {
  const has = (v) => v != null && v !== '';
  const b = has(before) ? before : 0;
  const a = has(after) ? after : 0;
  const numericB = Number(b), numericA = Number(a);
  const up = numericA > numericB;
  const arrowIcon = up ? '🔺' : '🔻';
  const bg = up ? 'rgba(60,160,90,0.14)' : 'rgba(200,70,70,0.14)';
  const border = up ? 'rgba(60,160,90,0.4)' : 'rgba(200,70,70,0.4)';
  const u = unit ? ` ${unit}` : '';
  return `<span style="display:inline-flex; align-items:baseline; gap:6px; padding:3px 9px; margin:3px 4px 3px 0; border-radius:12px; background:${bg}; border:1px solid ${border}; font-family:'DM Mono',monospace; font-size:11.5px; color:var(--text); white-space:nowrap;">
    <span style="color:var(--text-muted);">${escapeHtml(label)}</span>
    <span>${escapeHtml(b)} → <strong>${escapeHtml(a)}</strong>${escapeHtml(u)}</span>
    <span>${arrowIcon}</span>
  </span>`;
}

// Diff a stage-keyed channel ({T1:{el:val},...}). Returns chips grouped by
// stage, only for elements whose value changed.
function diffStageChannel(before, after, unit) {
  before = before || {}; after = after || {};
  const stages = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
  let h = '';
  for (const stage of stages) {
    const b = before[stage] || {}, a = after[stage] || {};
    const keys = [...new Set([...Object.keys(b), ...Object.keys(a)])];
    const chips = keys
      .filter((k) => Number(b[k] || 0) !== Number(a[k] || 0))
      .map((k) => chip(elementLabel(k), b[k], a[k], unit))
      .join('');
    if (chips) {
      h += `<div style="margin:6px 0 2px;"><span style="font-family:'DM Mono',monospace; font-size:11px; color:var(--text-muted); margin-right:6px;">${escapeHtml(stage)}</span>${chips}</div>`;
    }
  }
  return h;
}

// Diff the foliaire product list (matched by product name).
function diffFoliaire(before, after) {
  const beforeProducts = (before && Array.isArray(before.A)) ? before.A : [];
  const afterProducts = (after && Array.isArray(after.A)) ? after.A : [];
  const byName = (list) => Object.fromEntries(list.map((p) => [p.name, p.master || '']));
  const b = byName(beforeProducts), a = byName(afterProducts);
  const names = [...new Set([...Object.keys(b), ...Object.keys(a)])];
  let chips = '';
  for (const name of names) {
    if (!(name in b)) {                        // added
      chips += chip(`+ ${name}`, '—', a[name] || 'ajouté');
    } else if (!(name in a)) {                 // removed
      chips += chip(name, b[name] || '', 'retiré');
    } else if (b[name] !== a[name]) {           // dose changed
      chips += chip(name, b[name], a[name]);
    }
  }
  return chips ? `<div style="margin:6px 0 2px;">${chips}</div>` : '';
}

// Split a reason string on its (1)/(2)/(3) channel markers into a preamble +
// per-channel why text. Falls back to {preamble: wholeReason} when unmarked.
function splitReasonByChannel(reason) {
  if (!reason) return { preamble: '', byChannel: {} };
  const markerMatch = reason.match(/\(1\)/);
  if (!markerMatch) return { preamble: stripJargon(reason), byChannel: {} };
  const preamble = stripJargon(reason.slice(0, markerMatch.index));
  const segments = reason.slice(markerMatch.index).split(/\(\d\)/).filter((s) => s.trim());
  // Drop the redundant channel-name lead-in ("Fertigation T5 :") — the card
  // title already names the channel.
  const dropLeadIn = (s) => s.replace(/^\s*(Fertigation|Sidedress|Foliaire|Sol)[^:]*:\s*/i, '');
  const byChannel = {};
  for (const seg of segments) {
    const clean = dropLeadIn(stripJargon(seg));
    if (/fertigation/i.test(seg)) byChannel.fertigation = clean;
    else if (/sidedress/i.test(seg)) byChannel.sidedress = clean;
    else if (/foliaire/i.test(seg)) byChannel.foliaire = clean;
  }
  return { preamble, byChannel };
}

function channelCard(channelKey, whatChips, whyText) {
  if (!whatChips && !whyText) return '';
  const meta = CHANNEL_META[channelKey];
  // Chips (the "what") are the scannable default; the per-channel "why" prose
  // tucks behind a Détails toggle so an auditor can still reach it.
  const details = whyText ? `
    <details style="margin-top:6px;">
      <summary style="cursor:pointer; user-select:none; list-style:none; font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">▸ Détails</summary>
      <div style="font-size:12px; color:var(--text-muted); line-height:1.5; margin-top:4px;">${escapeHtml(whyText)}</div>
    </details>` : '';
  return `<div style="margin-top:12px; padding:10px 12px; background:var(--card-bg,rgba(255,255,255,0.02)); border:1px solid var(--border); border-radius:var(--radius-sm);">
    <div style="font-size:13px; color:var(--text); font-weight:600; margin-bottom:4px;">${meta.icon} ${escapeHtml(meta.label)}</div>
    ${whatChips || ''}
    ${details}
  </div>`;
}

function renderWhatWhy(entry, afterSnapshot) {
  const before = entry.fullSnapshot;
  const after = afterSnapshot || {};
  const { preamble, byChannel } = splitReasonByChannel(entry.reason);

  let cards = '';
  cards += channelCard('fertigation',
    diffStageChannel(before.fertigation, after.fertigation, 'g'), byChannel.fertigation);
  cards += channelCard('sidedress',
    diffStageChannel(before.sidedress, after.sidedress, 'g'), byChannel.sidedress);
  cards += channelCard('foliaire',
    diffFoliaire(before.foliaire, after.foliaire), byChannel.foliaire);

  let h = '';
  if (preamble) {
    h += `<div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Pourquoi</div>
      <div style="font-size:13px; color:var(--text); line-height:1.5;">${escapeHtml(preamble)}</div>`;
  }
  h += cards;
  return h;
}

// Legacy entries (pre-2026-05-07) carry only a partial `snapshot` + reason.
function renderLegacy(entry) {
  let h = '';
  if (entry.reason) {
    h += `<div style="font-size:13px; color:var(--text); line-height:1.5; margin-top:4px;">${escapeHtml(stripJargon(entry.reason))}</div>`;
  }
  if (entry.replacedBy) {
    h += `<div style="font-size:12.5px; color:var(--text-muted); line-height:1.5; margin-top:8px;">→ ${escapeHtml(stripJargon(entry.replacedBy))}</div>`;
  }
  if (entry.snapshot) {
    h += `<div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin:10px 0 4px;">Snapshot partiel</div>
      <pre style="font-family:'DM Mono',monospace; font-size:11px; background:var(--input-bg); padding:8px; border-radius:4px; margin:0; overflow-x:auto; white-space:pre-wrap;">${escapeHtml(JSON.stringify(entry.snapshot, null, 2))}</pre>`;
  }
  return h;
}

function buildHistoriqueNutriments() {
  const container = document.getElementById('historique-nutriments-list');
  if (!container) return;
  const entries = [...RECIPE_HISTORY].sort((a, b) => b.retired.localeCompare(a.retired));
  const liveStored = (window.STORED_RECIPE && window.STORED_RECIPE.tomato) || {};
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
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const summaryText = stripJargon(entry.summary || entry.recipe);
    let detailBody;
    if (entry.fullSnapshot) {
      // "after" = the recipe that replaced this one: the next-newer entry's
      // snapshot, or live STORED for the most recent entry.
      const afterSnapshot = (i === 0)
        ? liveStored
        : (entries[i - 1].fullSnapshot || {});
      detailBody = renderWhatWhy(entry, afterSnapshot);
    } else {
      detailBody = renderLegacy(entry);
    }
    html += `<tr>
      <td style="${cellPad}"><span style="${dateStyle}">${escapeHtml(entry.retired)}</span></td>
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
