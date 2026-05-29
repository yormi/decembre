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

// Local g formatter for the step-list amount column (kg threshold at 1000 g,
// 1 decimal between 1-10 g, integer above 10 g). Sole consumer of this shape.
function fmt(g) { if (g >= 1000) return (g / 1000).toFixed(2) + ' kg'; if (g < 10 && g > 0) return g.toFixed(1) + ' g'; return Math.round(g) + ' g'; }

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
  const totalArea = getTotalArea();
  if (currentCrop === 'tomato') {
    // Fertigation page reads the locked STORED_RECIPE for the selected stage —
    // exactly what the team weighs. computeStageRecipe() is the FP target
    // generator (Block 7 drift gauge), not the operational source.
    const s = STORED_RECIPE.tomato.fertigation[currentStage] || { mgSulfate: 0, kSulfate: 0 };
    const mK = getMultK(), mM = getMultMg();
    return { mgSulfate: s.mgSulfate * mM, kSulfate: s.kSulfate * mK };
  } else {
    const scale = totalArea / 100;
    return {
      mgSulfate: LETTUCE.mgSulfate * scale,
      kSulfate: LETTUCE.kSulfate * scale,
      feSulfate: LETTUCE.feSulfate * scale,
    };
  }
}

function buildSteps() {
  const stockVol = getStockVol();
  const ratio = getRatio();
  const n = getNutrients();

  // Display the stock volume as chaudières (20 L each) rounded to the nearest
  // quarter — L + chaudières both shown was redundant; chaudières is the
  // physical action (operator fills buckets, not measures volumes).
  const buckets = Math.round((stockVol / 20) * 4) / 4;
  const bucketsString = Number.isInteger(buckets) ? String(buckets) : buckets.toString().replace('.', ',');
  const bucketLabel = buckets === 1 ? '1 chaudière' : `${bucketsString} chaudières`;
  const volumeBadge = `${bucketLabel} de 20 L`;

  // K + Mg collapsed into a single weighing-table step (2026-05-28), matching
  // the foliar spray sheet pattern. Fe stays as its own step on lettuce —
  // operationally the "en dernier" timing makes it a separate action.
  const ingredients = [
    { name: 'Sulfate de potassium 0-0-50', amount: fmt(n.kSulfate) },
    { name: 'Sulfate de magnésium',        amount: fmt(n.mgSulfate) },
  ];

  const steps = [
    { number: 1, title: 'Laver le matériel', desc: 'Rincer baril + tube/filtre d\'aspiration Dosatron + filtre aval.', why: 'Résidus = filtre obstrué & mauvaise fertilisation', acid: false },
    { number: 2, title: 'Remplir la solution', desc: '', amount: volumeBadge, acid: false },
    { number: 3, title: 'Ajouter les produits', desc: '', ingredients, acid: false },
  ];

  if (currentCrop === 'tomato') {
    steps.push(
      { number: 4, title: 'Brasser', desc: 'Mélanger jusqu\'à dissolution complète. Vérifier : aucun dépôt au fond.', acid: false },
      { number: 5, title: 'Écrire <strong>immédiatement</strong> sur Slack', desc: '<ul style="margin:4px 0 0; padding-left:18px;"><li>Poster sur <strong>#recherche-et-developpement</strong></li><li>Date, quantités</li><li>Pour analyse rapide</li></ul>', acid: false },
    );
  } else {
    steps.push(
      { number: 4, title: 'Sulfate de fer (FeSO₄·7H₂O)', desc: 'Ajouter <strong>en dernier</strong>, juste avant de fermer le baril. La solution prend une teinte vert pâle. Si elle devient brun-orange en cours de semaine = oxydation (utiliser quand même mais l\'efficacité diminue).', why: 'Recharge en fer pour les cycles laitue qui s\'étirent au-delà de 3 semaines (la pouponnière charge les plants pour ~3 semaines de production). Fe²⁺ s\'oxyde rapidement à l\'air et au pH du sol — d\'où "en dernier" + baril fermé.', amount: fmt(n.feSulfate), acid: false },
      { number: 5, title: 'Brasser', desc: 'Bien mélanger. Vérifier qu\'il n\'y a pas de dépôt au fond.', acid: false },
      { number: 6, title: 'Écrire sur #recherche-et-developpement (Slack)', desc: 'Après la préparation, poster sur <strong>#recherche-et-developpement</strong> : date, quantités. Sert de registre pour la certification biologique (Ecocert) et de suivi d\'équipe.', acid: false },
    );
  }

  document.getElementById('steps-list').innerHTML = steps.map(s => {
    let ingredientsHTML = '';
    if (s.ingredients) {
      // Visual match with the foliar spray recipe-sheet table — same row
      // shape (product name flex-1, dose right-aligned, border-bottom).
      // No data-recipe-sheet / data-recipe-product attrs to avoid inflating
      // the foliar test's [data-recipe-sheet] count.
      ingredientsHTML = '<div style="margin-top:10px;">' + s.ingredients.map(item =>
        `<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border);">
          <div style="flex:1; min-width:0;">
            <div style="font-weight:600; font-size:13px;">${item.name}</div>
          </div>
          <span class="step-amount" style="margin:0; flex-shrink:0;">${item.amount}</span>
        </div>`
      ).join('') + '</div>';
    }
    return `<li class="step-item ${s.acid ? 'step-acid' : ''}">
      <span class="step-number">${s.number}</span>
      <div class="step-title">${s.title}</div>
      ${s.desc ? `<div class="step-desc">${s.desc}</div>` : ''}
      ${s.why ? `<div style="font-size:11.5px; color:var(--text-muted); margin-top:5px; line-height:1.4;">⚠️ ${s.why}</div>` : ''}
      ${s.amount && !s.ingredients ? `<span class="step-amount">${s.amount}</span>` : ''}
      ${ingredientsHTML}
    </li>`;
  }).join('');
}
