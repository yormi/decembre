// ═══════════════ DIAGNOSIS PRACTICE ═══════════════
// Training gallery for the Diagnostic page. Renders the 89-photo symptom
// review (window.DIAGNOSIS_PRACTICE_DATA) grouped by category. Admin-only
// (Diagnostic itself is admin-gated). Photos load from
// diagnostic/practice-images/<file> (build-copied into dist/).
//
// Cues are visual observations only — the source data is scrubbed of
// tissue-test numbers and farm history; this renderer adds none.

// Category metadata: label (FR), emoji, accent colour for the cause block's
// left border. Order = display order in the filter menu.
const DIAG_PRACTICE_CATS = [
  ['metal-toxicity',          'Toxicité métallique (Cu/Mn)', '🟣', '#7c5cff'],
  ['nutrient-deficiency',     'Carence nutritionnelle',      '🟡', '#c79a2e'],
  ['spray-or-mechanical',     'Brûlure de spray / mécanique','🟤', '#9a7430'],
  ['fungal-disease',          'Maladie fongique',            '🔴', '#c4552f'],
  ['bacterial-disease',       'Maladie bactérienne',         '🩸', '#c43560'],
  ['physiological-disorder',  'Désordre physiologique (BER / tip-burn)', '🔵', '#2f96c4'],
  ['pest',                    'Ravageur',                    '🐛', '#8a5cc4'],
  ['healthy',                 'Sain mais prédisposé',        '🟢', '#3e9c5c'],
  ['unusable',                'Inutilisable',                '⚪', '#777'],
];

// English severity in the source data → spelled-out French (no abbreviations).
const DIAG_PRACTICE_SEVERITY_LABEL = {
  none: 'aucune',
  mild: 'légère',
  moderate: 'modérée',
  severe: 'sévère',
};

let diagPracticeCat = null;

function diagPracticeMeta(catId) {
  return DIAG_PRACTICE_CATS.find(c => c[0] === catId);
}

function diagPracticeStars(n) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<span class="${i <= (n || 0) ? 'on' : 'off'}">★</span>`;
  }
  return stars;
}

function diagPracticeCard(card) {
  const severity = DIAG_PRACTICE_SEVERITY_LABEL[card.sev] || card.sev || '';
  const issues = card.issues.map(issue => {
    const [conf, cause, cues, cat] = issue;
    const meta = diagPracticeMeta(cat);
    const accent = meta ? meta[3] : '#777';
    const emoji = meta ? meta[2] : '';
    const cueList = (cues && cues.length)
      ? `<ul class="diag-practice-cues">${cues.map(c => `<li>${c}</li>`).join('')}</ul>`
      : '';
    return `<li class="diag-practice-issue" style="border-left-color:${accent};">
      <div class="diag-practice-issue-head">
        <span class="diag-practice-cause">${emoji} ${cause}</span>
        <span class="diag-practice-issue-conf">${conf}/5</span>
      </div>
      ${cueList}
    </li>`;
  }).join('');
  return `<div class="diag-practice-photocard">
    <img src="diagnostic/practice-images/${card.file}" loading="lazy" alt="${card.part}">
    <div class="diag-practice-body">
      <div class="diag-practice-row">
        <span class="diag-practice-stars">${diagPracticeStars(card.conf)}</span>
        <span class="diag-practice-sev">${severity}</span>
      </div>
      <div class="diag-practice-part">${card.part}</div>
      <ul class="diag-practice-issues">${issues}</ul>
    </div>
  </div>`;
}

function setDiagPracticeCat(catId) {
  diagPracticeCat = catId;
  const data = window.DIAGNOSIS_PRACTICE_DATA || [];
  document.querySelectorAll('#diag-practice-cats [data-practice-cat]').forEach(b =>
    b.classList.toggle('selected', b.dataset.practiceCat === catId));
  const meta = diagPracticeMeta(catId);
  const cards = data.filter(c => c.cat === catId).sort((a, b) => b.conf - a.conf);
  document.getElementById('diag-practice-title').textContent =
    meta ? `${meta[2]} ${meta[1]} — ${cards.length} photo${cards.length > 1 ? 's' : ''}` : '';
  document.getElementById('diag-practice-grid').innerHTML = cards.map(diagPracticeCard).join('');
}

function buildDiagnosticPractice() {
  const data = window.DIAGNOSIS_PRACTICE_DATA || [];
  // Per-category counts drive the filter chips; categories with zero photos are
  // omitted (the source review has no bacterial-disease / pest cards today).
  const counts = {};
  data.forEach(c => { counts[c.cat] = (counts[c.cat] || 0) + 1; });
  const chips = DIAG_PRACTICE_CATS.filter(c => counts[c[0]] > 0).map(c => {
    const [id, label, emoji] = c;
    return `<button class="diag-practice-cat" data-practice-cat="${id}" onclick="setDiagPracticeCat('${id}')">
      <span class="diag-practice-cat-emoji">${emoji}</span>
      <span class="diag-practice-cat-label">${label}</span>
      <span class="diag-practice-cat-count">${counts[id]}</span>
    </button>`;
  }).join('');
  document.getElementById('diag-practice-cats').innerHTML = chips;
  // Default to the first present category (largest review bucket).
  const firstPresent = DIAG_PRACTICE_CATS.find(c => counts[c[0]] > 0);
  setDiagPracticeCat(diagPracticeCat && counts[diagPracticeCat] ? diagPracticeCat : (firstPresent ? firstPresent[0] : null));
}
