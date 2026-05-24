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

// updateStockVol() removed April 26, 2026 — stock volume now displayed inline in step 2
// Formula preserved in getStockVol(): weeklyL = (2 mL/J/cm²/m² × radiation × area × 7 days) / 1000
// Stock = (weeklyL / 3) × (Dosatron ratio / 100)
function getStockVol() {
  const weeklyL = (2 * getSolarRad() * getTotalArea() * 7) / 1000;
  return (weeklyL / 3) * (getRatio() / 100);
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

  // Always show radiation in Configuration card (moved from "Cette semaine" card)
  document.getElementById('param-radiation').textContent = getSolarRad() + ' J/cm²/jour';

  // Hide multiplier rows for lettuce (uses fixed recipe, no stage multipliers)
  if (currentCrop === 'lettuce') {
    document.getElementById('param-multipliers').style.display = 'none';
    document.getElementById('param-multipliers-mg').style.display = 'none';
  } else {
    document.getElementById('param-multipliers').style.display = '';
    document.getElementById('param-multipliers-mg').style.display = '';
  }

  // Format stock volume in 20L buckets (each barrel of input water = 20L)
  // Round up to nearest 0.5 bucket to avoid awkward fractions
  const buckets = Math.ceil((stockVol / 20) * 2) / 2;
  const bucketLabel = buckets === 1 ? '1 chaudière' : `${buckets} chaudières`;
  const volumeBadge = `${Math.round(stockVol)} L · ${bucketLabel} de 20 L`;

  const steps = [
    { number: 1, title: 'Laver le matériel', desc: 'Rincer le baril, le tube + filtre d\'aspiration du Dosatron, et le filtre en aval du Dosatron.', why: 'Résidus de la semaine précédente = précipités, dépôts microbiens, et contamination. Un filtre obstrué fausse le ratio Dosatron.', acid: false },
    { number: 2, title: 'Remplir la solution', desc: `Remplir le baril avec ${Math.round(stockVol)} L d'eau (${bucketLabel} de 20 L). C'est ⅓ du volume d'irrigation hebdomadaire — les nutriments sont concentrés dans les premiers shots de la semaine.`, amount: volumeBadge, acid: false },
    { number: 3, title: 'Sulfate de potassium 0-0-50', desc: 'Dissoudre dans l\'eau chaude d\'abord — le K₂SO₄ se dissout lentement à froid. ⚠️ Ne pas dépasser 100 g/L dans la solution — au-delà, il précipite et bouche les goutteurs.', amount: fmt(n.kSulfate), acid: false },
    { number: 4, title: 'Sulfate de magnésium', desc: 'Très soluble — mélanger directement. Le Mg est essentiel à la photosynthèse.', amount: fmt(n.mgSulfate), acid: false },
  ];

  if (currentCrop === 'tomato') {
    steps.push(
      { number: 5, title: 'Brasser', desc: 'Bien mélanger jusqu\'à dissolution complète. Vérifier qu\'il n\'y a pas de dépôt au fond.', acid: false },
      { number: 6, title: 'Écrire sur #recherche-et-developpement (Slack)', desc: 'Après la préparation, poster sur <strong>#recherche-et-developpement</strong> : date, stade, quantités. Sert de registre pour la certification biologique (Ecocert) et de suivi d\'équipe.', acid: false },
    );
  } else {
    steps.push(
      { number: 5, title: 'Sulfate de fer (FeSO₄·7H₂O)', desc: 'Ajouter <strong>en dernier</strong>, juste avant de fermer le baril. La solution prend une teinte vert pâle. Si elle devient brun-orange en cours de semaine = oxydation (utiliser quand même mais l\'efficacité diminue).', why: 'Recharge en fer pour les cycles laitue qui s\'étirent au-delà de 3 semaines (la pouponnière charge les plants pour ~3 semaines de production). Fe²⁺ s\'oxyde rapidement à l\'air et au pH du sol — d\'où "en dernier" + baril fermé.', amount: fmt(n.feSulfate), acid: false },
      { number: 6, title: 'Brasser', desc: 'Bien mélanger. Vérifier qu\'il n\'y a pas de dépôt au fond.', acid: false },
      { number: 7, title: 'Écrire sur #recherche-et-developpement (Slack)', desc: 'Après la préparation, poster sur <strong>#recherche-et-developpement</strong> : date, quantités. Sert de registre pour la certification biologique (Ecocert) et de suivi d\'équipe.', acid: false },
    );
  }

  document.getElementById('steps-list').innerHTML = steps.map(s => {
    let subHTML = '';
    if (s.sub) {
      subHTML = '<div style="margin-top:6px;">' + s.sub.map(item =>
        `<div style="display:flex; justify-content:space-between; padding:3px 0; font-size:12px;">
          <span style="color:var(--text-muted)">${item.name}</span>
          <span class="step-amount" style="margin:0;">${item.amount}</span>
        </div>`
      ).join('') + '</div>';
    }
    return `<li class="step-item ${s.acid ? 'step-acid' : ''}">
      <span class="step-number">${s.number}</span>
      <div class="step-title">${s.title}</div>
      <div class="step-desc">${s.desc}</div>
      ${s.why ? `<div style="font-size:11.5px; color:var(--text-muted); margin-top:5px; line-height:1.4;">Pourquoi : ${s.why}</div>` : ''}
      ${s.amount && !s.sub ? `<span class="step-amount">${s.amount}</span>` : ''}
      ${subHTML}
    </li>`;
  }).join('');
}
