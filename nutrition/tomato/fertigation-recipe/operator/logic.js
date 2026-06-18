// Fertigation-recipe — page renderer (operator-facing).
//
// Owns the per-stage step list rendered on `#page-fertigation-content`. Reads
// the locked STORED_RECIPE.tomato.fertigation for tomato (PA Taillon barrel
// values per stage) and LETTUCE (separate constant) for lettuce. Multipliers
// (`getMultK`, `getMultMg`) and shared helpers (`getSolarRad`, `getTotalArea`,
// currentCrop, currentStage) stay in app/index.html — they cross page
// boundaries.
//
// Functions: getStockVol(), getNutrients(), buildSteps().

// Stock barrel is sized to cover DAYS_PER_FILL days of Dosatron pull at
// the configured dilution ratio (2 %). Bumped 2026-05-28 from implicit
// ~2.33-day sizing (weeklyL/3) to explicit 5-day fills — operator mixes
// less often per week, bigger barrel each time.
// Formula:
//   dailyL  = (2 mL/J/cm²/m² × daily radiation × area) / 1000
//   stockL  = dailyL × DAYS_PER_FILL × (Dosatron ratio / 100)
const DAYS_PER_FILL = 5;
function getStockVol() {
  const dailyL = (2 * getSolarRad() * getTotalArea()) / 1000;
  return dailyL * DAYS_PER_FILL * (getRatio() / 100);
}

// CITRIC ACID REMOVED FROM FERTIGATION (April 26, 2026)
// Reasoning: Water analysis (Berger Labs Report 39086, April 9, 2026) showed
// alkalinity of only 24.7 ppm CaCO3 — very low. Water is NOT the cause of soil
// pH issue (compost was). Acidifying water provides only marginal benefit:
//   - Single irrigation cycle has negligible effect on root-zone pH (soil
//     buffering at CEC ~28 dwarfs water acid load: ~140 meq/L soil vs
//     0.001 meq/L water at pH 6.0)
//   - Cumulative soil pH effect is real but slow (~0.05 units/month at pH 5.8)
//   - Sulfur application is the actual soil pH lever
// Bridge strategy via foliar sprays (FeSO₄, Mn, Zn, B sulfates) directly
// bypasses lockout and is far higher leverage.
// Reference data (in case of reintroduction):
//   - Bucket test: 7g citric acid in 10L water → pH 2.7 (clean water)
//   - 50g in 60L stock with nutrients → pH 3.5 (buffered)
//   - Stock pH 2.7 at 2% Dosatron → output ~5.8
//   - Empirical dose: ~3.75 g/L of stock for ~5.8 output (TO VALIDATE)
// function getAcidG() { return 3.75 * getStockVol(); }

function getNutrients() {
  // Tomato fertigation page reads the locked STORED_RECIPE for the selected
  // stage — exactly what the team weighs. computeStageRecipe() is the FP target
  // generator (Block 7 drift gauge), not the operational source.
  const s = STORED_RECIPE.tomato.fertigation[currentStage] || { mgSulfate: 0, kSulfate: 0, borax: 0, naMolybdate: 0 };
  const mK = getMultK(), mM = getMultMg();
  // Bore (Solubore) + Mo (NaMolybdate) are unscaled — no multiplier, mirroring drift.js.
  return { mgSulfate: s.mgSulfate * mM, kSulfate: s.kSulfate * mK, borax: s.borax || 0, naMolybdate: s.naMolybdate || 0 };
}

// Lettuce weekly prep — fixed hand-set recipe (LETTUCE_FERTIGATION_RECIPE),
// no stage/solar math. Same 4-step shape as tomato: wash → weigh+mix → stir →
// dosatron line.
function buildLettuceSteps() {
  document.getElementById('steps-card-title').textContent = '🌅 Vendredi matin';
  const recipe = LETTUCE_FERTIGATION_RECIPE;
  const ingredients = [
    { name: 'Eau', amount: String(recipe.stockL), unit: 'litres', emoji: '💧' },
    ...recipe.products.map(p => ({ name: p.name, amount: p.grams.toLocaleString('fr-CA'), unit: 'g', emoji: p.emoji })),
  ];
  renderStepsList([
    { number: 1, title: 'Laver le matériel', desc: 'Rincer baril + filtre dosatron + filtre aval.', why: 'Résidus = filtre obstrué & mauvaise fertilisation', acid: false },
    { number: 2, title: 'Mélanger', desc: '', ingredients, acid: false },
    { number: 3, title: 'Brasser', desc: 'Vérifier: Aucun dépôt au fond.', acid: false },
    { number: 4, title: 'Mettre la ligne du dosatron dans le baril', desc: '', acid: false },
  ]);
}

function buildSteps() {
  if (currentCrop === 'lettuce') { buildLettuceSteps(); return; }
  if (currentFertRecipe === 'rootfix') { buildRootFixSteps(); return; }
  document.getElementById('steps-card-title').textContent = '🌅 Vendredi matin';
  const stockVol = getStockVol();
  const ratio = getRatio();
  const n = getNutrients();

  // Display the stock volume as chaudières (20 L each) rounded to the nearest
  // quarter — L + chaudières both shown was redundant; chaudières is the
  // physical action (operator fills buckets, not measures volumes).
  const buckets = Math.round((stockVol / 20) * 4) / 4;
  const bucketsString = Number.isInteger(buckets) ? String(buckets) : buckets.toString().replace('.', ',');
  const bucketUnit = (buckets === 1 ? 'chaudière' : 'chaudières') + ' de 20 L';

  // K + Mg + Bore + Molybdène collapsed into a single weighing-table step
  // (2026-05-28), matching the foliar spray sheet pattern. Weighing tiles: big
  // number + 'g' on its own line (uniform with the water tile).
  const formatNumber = v => Math.round(v).toLocaleString('fr-CA');
  // Hide any nutrient tile that weighs out to exactly 0 g (rounds to 0) — e.g.
  // K₂SO₄ + MgSO₄ since the 2026-06-05 cut. Filter on the raw gram value, not
  // the formatted string. Eau (volume) is added after the filter, never hidden.
  const nutrientTiles = [
    { name: 'Potassium', value: n.kSulfate,  emoji: '🍌' },
    { name: 'Magnésium', value: n.mgSulfate, emoji: '🧊' },
    { name: 'Solubore', value: n.borax, emoji: '🔷' },
    { name: 'Molybdène', value: n.naMolybdate, emoji: '🔶' },
  ];
  const ingredients = nutrientTiles
    .filter(t => Math.round(t.value) !== 0)
    .map(t => ({ name: t.name, amount: formatNumber(t.value), unit: 'g', emoji: t.emoji }));
  // Water fill as the first tile (💧, big bucket count + unit line).
  ingredients.unshift({ name: 'Eau', amount: bucketsString, unit: bucketUnit, emoji: '💧' });

  const steps = [
    { number: 1, title: 'Laver le matériel', desc: 'Rincer baril + filtre dosatron + filtre aval.', why: 'Résidus = filtre obstrué & mauvaise fertilisation', acid: false },
    { number: 2, title: 'Mélanger', desc: '', ingredients, acid: false },
  ];

  steps.push(
    { number: 3, title: 'Brasser', desc: 'Vérifier: Aucun dépôt au fond.', acid: false },
    { number: 4, title: 'Mettre la ligne du dosatron dans le baril', desc: '', acid: false },
  );

  renderStepsList(steps);
}

// Shared step-list renderer. Scannable tiles — same shape as the Fertilisation/sol
// recipe card (emoji / label / big mono dose), 2-col grid. No data-recipe-sheet /
// data-recipe-product attrs to avoid inflating the foliar test's count.
function renderStepsList(steps) {
  document.getElementById('steps-list').innerHTML = steps.map(s => {
    let ingredientsHTML = '';
    if (s.ingredients) {
      ingredientsHTML = '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">' + s.ingredients.map(item =>
        `<div style="background:var(--accent-active-light); border:1.5px solid var(--accent-active-border); border-radius:var(--radius-sm); padding:14px 10px; text-align:center;">
          <div style="font-size:24px; margin-bottom:6px;">${item.emoji || '·'}</div>
          <div style="font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:1.5px; color:var(--text-muted); margin-bottom:6px;">${item.name}</div>
          <div style="font-family:'DM Mono',monospace; font-size:24px; font-weight:700; color:var(--text);">${item.amount}</div>
          ${item.unit ? `<div style="font-family:'DM Mono',monospace; font-size:12px; color:var(--text-muted); margin-top:2px;">${item.unit}</div>` : ''}
        </div>`
      ).join('') + '</div>';
    }
    return `<li class="step-item ${s.acid ? 'step-acid' : ''}">
      <span class="step-number">${s.number}</span>
      <div class="step-title">${s.title}</div>
      ${s.desc ? `<div class="step-desc">${s.desc}</div>` : ''}
      ${s.why ? `<div style="font-size:11.5px; color:var(--text-muted); margin-top:5px; line-height:1.4;">⚠️ ${s.why}</div>` : ''}
      ${s.amount ? `<span class="step-amount">${s.amount}</span>` : ''}
      ${ingredientsHTML}
      ${s.noteAfter ? `<div style="font-size:11.5px; color:var(--text-muted); margin-top:8px; line-height:1.4;">${s.noteAfter}</div>` : ''}
    </li>`;
  }).join('');
}

// Root-fix drench (tomato only): fixed 15 g Ocean in 4 L, injected at 2 % on
// chapelle 1. No stage, no area/solar scaling — single fixed recipe.
function buildRootFixSteps() {
  document.getElementById('steps-card-title').textContent = 'Tout les matins avant 10am';
  const ingredients = [
    { name: 'Eau', amount: '4', unit: 'L', emoji: '💧' },
    { name: 'Ocean', amount: '15', unit: 'g', emoji: '🦀' },
  ];
  renderStepsList([
    { number: 1, title: 'Dissoudre dans un seau', ingredients, noteAfter: '⚠️ Résidu non dissous bouche les driptapes', acid: false },
    { number: 2, title: 'Mettre la ligne du dosatron dans le seau', acid: false },
    { number: 3, title: 'Partir valve <em>chapelle 1</em> — 10 min sur Orisha', acid: false },
    { number: 4, title: 'Remettre la ligne du dosatron dans le baril de fertigation', acid: false },
    { number: 5, title: 'Rincer le seau pour le lendemain', acid: false },
  ]);
}
