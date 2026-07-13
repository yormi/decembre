// ═══════════════ DIAGNOSTIC ═══════════════
// Visual symptom guide. State is local to this page (not tied to currentCrop)
// so toggling here doesn't disrupt fertigation/foliar context.
// Source data: working files/symptomes-carences.md — keep the two in sync.
//
// Certainty scale (cert): 5 = rock-solid signature, 4 = strong but possible
// confusion with similar deficiency, 3 = rare/diagnose-by-elimination.
//
// At pH 7.4 (current crisis), Fe / Mn / Zn / P deficiencies are baseline-likely
// regardless of foliar/fertigation effort — that's why the recommended action
// is usually "verify the spray/feed is being applied" rather than "increase
// the dose," since the bottleneck is root-zone availability, not input.

const DIAG_DATA = {
  tomato: {
    locations: [
      {
        id: 'top',
        label: 'Haut du plant',
        sub: 'Jeunes feuilles, apex',
        symptoms: [
          {
            id: 't-fe',
            title: 'Apex jaune entre les nervures, nervures vert vif',
            detail: 'Jaunissement net et propre entre les nervures sur les 2-3 plus jeunes feuilles. Sévère = presque blanc.',
            cause: 'Carence en fer (Fe)',
            cert: 5,
            confirm: 'Pas de taches brunes (sinon → Mn). Le jaunissement est "propre", uniforme entre les nervures.',
            action: 'Renforcer le spray foliaire Fe (Spray A). Vérifier la couverture des jeunes feuilles. Long terme : la baisse du pH par soufre est la vraie solution — Fe est bloqué au pH 7,4.'
          },
          {
            id: 't-mn',
            title: 'Jeunes feuilles : jaunissement avec taches brunes',
            detail: 'Jaunissement entre les nervures sur jeunes feuilles à mi-canopée, avec petites taches ou mouchetures brunes/tan dans le tissu jaune. Nervures floues (pas nettes).',
            cause: 'Carence en manganèse (Mn)',
            cert: 4,
            confirm: 'La signature, c\'est les taches brunes. Fe = jaunissement propre ; Mn = jaunissement taché.',
            action: 'Vérifier que le MnSO₄ est bien dans le Spray A et que la couverture foliaire est bonne (les feuilles atteintes ne récupèrent pas — surveiller les nouvelles).'
          },
          {
            id: 't-zn',
            title: 'Nouvelles feuilles minuscules, plant compact en rosette',
            detail: 'Entre-nœuds raccourcis, feuilles étroites, malformées au sommet. Chlorose marbrée possible.',
            cause: 'Carence en zinc (Zn)',
            cert: 4,
            confirm: 'C\'est la *forme* qui révèle, pas juste la couleur. Feuilles minuscules ou déformées = signal Zn.',
            action: 'Vérifier le ZnSO₄ dans le Spray A. Vérifier la couverture du spray (mouillage uniforme des feuilles).'
          },
          {
            id: 't-cu',
            title: 'Jeunes feuilles tordues, pointes blanchies, plant flétri sans soif',
            detail: 'Feuilles enroulées sur les bords, pointes blanches/argentées, flétrissement sans stress hydrique.',
            cause: 'Carence en cuivre (Cu)',
            cert: 3,
            confirm: 'Très rare en culture au champ. Vérifier d\'abord qu\'il ne s\'agit pas d\'un problème d\'eau (irrigation, racines noyées).',
            action: 'Observer 1-2 semaines avant de réagir. Si confirmé, restaurer le CuSO₄ hebdomadaire (au lieu de bi-hebdomadaire).'
          },
          {
            id: 't-b-apex',
            title: 'L\'apex meurt, des pousses latérales prennent le relais',
            detail: 'Le bourgeon terminal noircit/sèche. La croissance reprend sur des pousses secondaires plus bas.',
            cause: 'Carence en bore (B)',
            cert: 4,
            confirm: 'Vérifier aussi les fruits (craquelures liégeuses) et les tiges (creuses). Si plusieurs signes B coïncident → certitude haute.',
            action: 'Renforcer le Solubore dans le Spray A. Ne pas couper le B de la recette tant que pas validé.'
          }
        ]
      },
      {
        id: 'mid',
        label: 'Milieu / bas',
        sub: 'Vieilles feuilles',
        symptoms: [
          {
            id: 't-mg',
            title: 'Vieilles feuilles : "sapin de Noël" entre les nervures',
            detail: 'Motif classique : jaunissement entre les nervures sur vieilles feuilles, nervures restent vertes. Sévère → tissu violet/rouge entre les nervures.',
            cause: 'Carence en magnésium (Mg)',
            cert: 5,
            confirm: 'C\'est sur les VIEILLES feuilles (le contraire de Fe). Le motif est visuel et reconnaissable une fois vu.',
            action: 'Augmenter le multiplicateur MgSO₄ dans la fertigation (actuellement 1,5×, possibilité 2×).',
            image: 'diagnostic/images/mg-deficiency-tomato-leaf.jpg'
          },
          {
            id: 't-k',
            title: 'Vieilles feuilles : bords jaunes puis bruns',
            detail: 'Nécrose marginale qui progresse de l\'extérieur vers l\'intérieur. Bords jaunissent, brunissent, sèchent.',
            cause: 'Carence en potassium (K)',
            cert: 5,
            confirm: 'Ce sont les BORDS qui partent, pas l\'intérieur. Mg = entre les nervures ; K = sur la marge.',
            action: 'Vérifier le K₂SO₄ dans la fertigation. Possiblement augmenter le multiplicateur (actuellement 1×).',
            image: 'diagnostic/images/k-deficiency-tomato-leaf.jpg'
          },
          {
            id: 't-n',
            title: 'Plant globalement pâle, vert clair partout',
            detail: 'Pâleur uniforme, croissance lente, tiges minces et fluettes, feuilles plus petites. Vieilles feuilles d\'abord.',
            cause: 'Carence en azote (N)',
            cert: 5,
            confirm: 'Pas de motif particulier — juste pâle partout. Si le pâle est concentré entre les nervures → plutôt Fe ou Mg.',
            action: 'Peu probable à votre dose actuelle (le N vient surtout du sol et des amendements). Vérifier l\'application de compost / azote organique au sol.',
            image: 'diagnostic/images/n-deficiency-tomato-leaf.jpg'
          },
          {
            id: 't-p',
            title: 'Feuilles vert terne qui virent au violacé (dessous surtout)',
            detail: 'Couleur vert terne devient violet/pourpre, surtout sur les nervures du dessous. Croissance rabougrie.',
            cause: 'Possiblement carence P — ou stress froid, stress hydrique, ou réaction normale au stress (anthocyanes)',
            cert: 3,
            confirm: 'Le violacé n\'est PAS spécifique au P. Banque de P au sol abondante (Mehlich-3 558-678 kg/ha) ; les plants scavengent généralement assez via exsudats racinaires. À diagnostiquer par élimination : froid nocturne récent ? sol détrempé ? stress autre ?',
            action: 'Vérifier d\'abord les autres causes (température nuit, irrigation, racines). Si tout normal et symptôme persiste → test foliaire (40 $) pour confirmer carence réelle avant de réagir. Le programme soufre adresse le problème de fond si vraiment confirmé.'
          },
          {
            id: 't-mo',
            title: 'Vieilles feuilles : jaunissement diffus sans motif net (rare)',
            detail: 'Pâlissement entre les nervures sur vieilles feuilles, sans motif clair "sapin de Noël".',
            cause: 'Carence en molybdène (Mo)',
            cert: 3,
            confirm: 'Très peu probable à votre pH 7,4 — Mo est plus disponible en sol alcalin. À envisager seulement si toutes les autres causes (Fe, Mg, N, K) ont été éliminées.',
            action: 'Observer. Ne pas réagir avant d\'avoir éliminé les autres causes.'
          }
        ]
      },
      {
        id: 'fruit',
        label: 'Fruits / tiges',
        sub: 'Tomates, tiges',
        symptoms: [
          {
            id: 't-ber',
            title: 'Tache noire/brune enfoncée à la base du fruit',
            detail: 'Tache circulaire, sèche, enfoncée à l\'extrémité opposée au pédoncule (côté fleur). Surtout sur premiers/gros fruits durant croissance rapide.',
            cause: 'BER (Blossom-End Rot) — translocation du Ca',
            cert: 5,
            confirm: 'Typique et reconnaissable. À ne pas confondre avec carence en B (qui donne des taches sur la peau ailleurs sur le fruit ET tiges creuses).',
            action: 'Prévention : ventilation HAF + gestion de l\'humidité matinale (le Ca xylémique suit le flux de transpiration; humidité élevée le matin freine le transport vers les jeunes fruits). Spray foliaire CaCl₂ retiré du programme 2026-05-06 (Ecocert non vérifié) — application externe événementielle si BER persiste.',
            image: 'diagnostic/images/ber-blossom-end-rot.jpg'
          },
          {
            id: 't-b-fruit',
            title: 'Fruits qui craquent (fissures radiales liégeuses)',
            detail: 'Craquelures profondes, brunes, liégeuses (pas juste des fissures de croissance superficielles).',
            cause: 'Carence en bore (B)',
            cert: 4,
            confirm: 'Vérifier aussi tiges creuses + apex qui meurt. Si plusieurs signes B → certitude.',
            action: 'Maintenir le Solubore dans le Spray A.',
            image: 'diagnostic/images/b-deficiency-tomato-fruit-corky.jpg'
          },
          {
            id: 't-b-stem',
            title: 'Tiges creuses (vide à l\'intérieur)',
            detail: 'Couper une tige principale ou latérale en travers — vide à l\'intérieur.',
            cause: 'Carence en bore (B)',
            cert: 4,
            confirm: 'Signe quasi-pathognomonique du B. Si présent, ne pas couper le B.',
            action: 'Maintenir le Solubore dans le Spray A.'
          }
        ]
      }
    ]
  },
  lettuce: {
    locations: [
      {
        id: 'core',
        label: 'Cœur / intérieur',
        sub: 'Feuilles centrales, jeunes',
        symptoms: [
          {
            id: 'l-fe',
            title: 'Cœur et jeunes feuilles internes pâles ou jaunes',
            detail: 'Feuilles du cœur jaunes/pâles, nervures restent vertes. Les feuilles externes plus âgées restent vertes.',
            cause: 'Carence en fer (Fe)',
            cert: 5,
            confirm: 'C\'est sur le CŒUR (jeune), pas sur les feuilles externes (vieilles). Si externes jaunes aussi → autres causes.',
            action: 'Augmenter FeSO₄ dans la fertigation production OU faire un spray Fe foliaire de rattrapage si symptôme aigu. Pour les semis, c\'est dans la recette pouponnière (15 mg/L FeSO₄·7H₂O).'
          },
          {
            id: 'l-tipburn',
            title: 'Bords bruns nécrotiques sur les feuilles internes (tipburn)',
            detail: 'Bords bruns, secs, nécrotiques sur les feuilles du cœur (PAS les externes).',
            cause: 'Tipburn — translocation du Ca',
            cert: 5,
            confirm: 'C\'est sur les feuilles INTERNES, pas externes. Si externes → autre cause (K).',
            action: '<strong>PAS un problème de spray</strong> — c\'est environnemental. Solutions : <ul><li>Ventilation (HAF) 24/7 pour réduire l\'humidité au cœur de la canopée</li><li>Descendre RH < 80% au lever</li><li>Croissance plus lente en dernière semaine (réduire N pour ralentir l\'absorption d\'eau)</li><li>Choix variétal : certaines Salanova plus tipburn-résistantes</li></ul>'
          },
          {
            id: 'l-zn',
            title: 'Cœur déformé, pomme qui ne se forme pas',
            detail: 'Nouvelles feuilles petites, étroites, désordonnées. Pas de structure de pomme cohérente.',
            cause: 'Carence en zinc (Zn)',
            cert: 4,
            confirm: 'Forme anormale > couleur. Distinguer du Fe (juste pâle, pas déformé).',
            action: 'Ajouter ZnSO₄ à la fertigation pouponnière, ou faire un foliaire ponctuel.'
          }
        ]
      },
      {
        id: 'inside',
        label: 'Intérieur de la pomme',
        sub: 'Visible à la coupe',
        symptoms: [
          {
            id: 'l-b-spots',
            title: 'Taches brunes éparpillées à l\'intérieur de la pomme',
            detail: 'Taches brunes distribuées dans le tissu interne (pas concentrées sur les bords comme tipburn).',
            cause: 'Carence en bore (B)',
            cert: 4,
            confirm: 'Distribué, pas marginal. Si seulement sur les bords des feuilles internes → tipburn (Ca translocation).',
            action: 'Ajouter Solubore à la fertigation pouponnière en petite quantité, ou comme spray ponctuel pré-transplantation.'
          },
          {
            id: 'l-b-hollow',
            title: 'Cœur creux (hollow heart)',
            detail: 'Vide ou tissu effondré au centre de la pomme, visible à la coupe.',
            cause: 'Carence en bore (B)',
            cert: 4,
            confirm: 'Avec les taches brunes B = certitude.',
            action: 'Ajouter Solubore à la fertigation pouponnière, ou comme spray ponctuel pré-transplantation.'
          }
        ]
      },
      {
        id: 'outer',
        label: 'Feuilles externes',
        sub: 'Vieilles feuilles enveloppes',
        symptoms: [
          {
            id: 'l-mg',
            title: 'Feuilles externes : "sapin de Noël" entre les nervures',
            detail: 'Jaunissement entre les nervures sur les feuilles plus âgées (similaire à la tomate).',
            cause: 'Carence en magnésium (Mg)',
            cert: 5,
            confirm: 'Entre les nervures, sur feuilles externes. Si sur les bords → K. Si sur cœur → Fe.',
            action: 'Augmenter MgSO₄ dans la fertigation.'
          },
          {
            id: 'l-k',
            title: 'Feuilles externes : bords bruns/jaunes',
            detail: 'Bords jaunes puis bruns, progressant vers l\'intérieur. Pomme qui ne se ferme pas bien.',
            cause: 'Carence en potassium (K)',
            cert: 5,
            confirm: 'Sur les BORDS, sur les feuilles EXTERNES. Si bords sur feuilles internes → tipburn (Ca).',
            action: 'Vérifier K₂SO₄ dans la fertigation. Augmenter si besoin.'
          },
          {
            id: 'l-mn',
            title: 'Feuilles externes pâles avec mouchetures brunes',
            detail: 'Pâlissement avec petites taches brunes éparses.',
            cause: 'Carence en manganèse (Mn)',
            cert: 4,
            confirm: 'Taches brunes = signature. Si juste pâle → Fe ou N.',
            action: 'Ajouter MnSO₄ à la fertigation pouponnière, ou spray ponctuel.'
          }
        ]
      },
      {
        id: 'whole',
        label: 'Plant entier',
        sub: 'Toute la plante',
        symptoms: [
          {
            id: 'l-n',
            title: 'Plant globalement pâle, croissance lente',
            detail: 'Pâleur uniforme, croissance ralentie, tiges fluettes. Vieilles feuilles d\'abord.',
            cause: 'Carence en azote (N)',
            cert: 5,
            confirm: 'Pas de motif spécifique. Si pâle entre les nervures → Mg ou Fe ; si pâle uniforme → N.',
            action: '<strong>CRITIQUE pour atteindre 150 g/plant à la transplantation.</strong> Vérifier la dose de poisson hydrolysé (actuellement 13 mL/L). Si insuffisant à week 4-5, augmenter ou faire fertigation 2×/semaine.'
          },
          {
            id: 'l-p',
            title: 'Plant violacé (surtout dessous des feuilles)',
            detail: 'Couleur vert terne avec teinte rouge/violet sous les feuilles externes, sur les tiges.',
            cause: 'Possiblement carence P — ou pigment variétal Salanova, stress froid, stress hydrique',
            cert: 3,
            confirm: 'Plusieurs Salanova ont du pigment rouge/violet naturel. Le violacé seul n\'est pas un diagnostic fiable de carence P. Comparer aux plants voisins de la même variété : tous violacés ou seulement certains ?',
            action: 'Vérifier d\'abord la variété (pigment normal ?), puis la CE substrat (cible 1,5-2,5 mS/cm) et le pH substrat. Si vraiment anormal → test foliaire pour confirmer avant d\'ajuster la recette poisson.'
          },
          {
            id: 'l-stunt',
            title: 'Croissance ralentie sans symptôme spécifique',
            detail: 'Plants petits et lents, pas de motif de carence visible. Diagnostic différentiel.',
            cause: 'Cause à identifier — voir actions',
            cert: 3,
            confirm: 'Pas de signature visuelle claire. Procéder par élimination.',
            action: 'Éliminer une cause à la fois : <ul><li><strong>CE pour-through</strong> : mesurer (cible 2,8–3,4 mS/cm semaine 5)</li><li><strong>N insuffisant</strong> : vérifier dose poisson</li><li><strong>Substrat trop humide / racines pourries</strong> : vérifier drainage</li><li><strong>Lumière insuffisante</strong> : vérifier supplémentation laitue (200 µmol/m²/s)</li><li><strong>Température</strong> : trop basse / trop haute</li></ul>'
          }
        ]
      }
    ]
  }
};

let diagCrop = 'tomato';
let diagLocation = null;
let diagSymptom = null;

function setDiagCrop(crop) {
  diagCrop = crop;
  diagLocation = null;
  diagSymptom = null;
  setCropBtn('diag-crop-tomato', crop === 'tomato', 'tomato');
  setCropBtn('diag-crop-lettuce', crop === 'lettuce', 'lettuce');
  // Match the global accent color to the diagnostic crop
  const r = document.documentElement.style;
  if (crop === 'tomato') {
    r.setProperty('--accent-active', 'var(--accent-tomato)');
    r.setProperty('--accent-active-light', 'var(--accent-tomato-light)');
    r.setProperty('--accent-active-border', 'var(--accent-tomato-border)');
  } else {
    r.setProperty('--accent-active', 'var(--accent-lettuce)');
    r.setProperty('--accent-active-light', 'var(--accent-lettuce-light)');
    r.setProperty('--accent-active-border', 'var(--accent-lettuce-border)');
  }
  renderDiag();
  syncHash();
}

function selectDiagLocation(locId) {
  diagLocation = locId;
  diagSymptom = null;
  renderDiag();
  // Scroll the symptom card into view so the user sees the next step
  setTimeout(() => {
    const element = document.getElementById('diag-symptom-card');
    if (element && element.style.display !== 'none') element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}

function selectDiagSymptom(sympId) {
  diagSymptom = sympId;
  renderDiag();
  setTimeout(() => {
    const element = document.getElementById('diag-result-card');
    if (element && element.style.display !== 'none') element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}

function resetDiag() {
  diagLocation = null;
  diagSymptom = null;
  renderDiag();
  document.getElementById('page-diagnostic-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderDiag() {
  const data = DIAG_DATA[diagCrop];
  // Render location chips
  const locHtml = data.locations.map(loc => {
    const sel = loc.id === diagLocation ? 'selected' : '';
    return `<button class="diag-loc-btn ${sel}" onclick="selectDiagLocation('${loc.id}')">
      <span class="diag-loc-label">${loc.label}</span>
      <span class="diag-loc-sub">${loc.sub}</span>
    </button>`;
  }).join('');
  document.getElementById('diag-locations').innerHTML = locHtml;

  // Render symptom list (only if a location is selected)
  const symptomCard = document.getElementById('diag-symptom-card');
  if (diagLocation) {
    const loc = data.locations.find(l => l.id === diagLocation);
    const symHtml = loc.symptoms.map(s => {
      const sel = s.id === diagSymptom ? 'selected' : '';
      return `<button class="diag-symptom ${sel}" onclick="selectDiagSymptom('${s.id}')">
        <div class="diag-symptom-title">${s.title}</div>
        <div class="diag-symptom-detail">${s.detail}</div>
      </button>`;
    }).join('');
    document.getElementById('diag-symptoms').innerHTML = symHtml;
    symptomCard.style.display = 'block';
  } else {
    symptomCard.style.display = 'none';
  }

  // Render result (only if a symptom is selected)
  const resultCard = document.getElementById('diag-result-card');
  if (diagSymptom) {
    const loc = data.locations.find(l => l.id === diagLocation);
    const s = loc.symptoms.find(sm => sm.id === diagSymptom);
    document.getElementById('diag-result').innerHTML = `
      <div class="diag-result-cause">${s.cause}<span class="diag-cert diag-cert-${s.cert}">Certitude ${s.cert}/5</span></div>
      ${s.image ? `<img class="diag-result-image" src="${s.image}" alt="Photo de référence : ${s.cause}" loading="lazy">` : ''}
      <div class="diag-result-section">
        <div class="diag-result-label">Comment confirmer</div>
        <div class="diag-result-text">${s.confirm}</div>
      </div>
      <div class="diag-result-section">
        <div class="diag-result-label">Action</div>
        <div class="diag-result-text">${s.action}</div>
      </div>
    `;
    resultCard.style.display = 'block';
  } else {
    resultCard.style.display = 'none';
  }
}
