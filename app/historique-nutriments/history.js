// ─── RECIPE_HISTORY — retired recipe snapshots, audit trail ─────────────
//
// Append-only log of retired recipes. When a stored recipe constant is
// replaced (a sidedress dose changed, a foliar product swapped, fertigation
// values re-locked at a new agronomist recommendation, etc.), capture the
// OLD version here BEFORE editing the live const.
//
// Entry shape (current):
//   {
//     retired:      'YYYY-MM-DD',
//     recipe:       'name of retired recipe / change',
//     summary:      'one-line FR description (~60 chars) — used as table label',
//     reason:       'brief why',
//     replacedBy:   'pointer to new (optional)',
//     fullSnapshot: {
//       fertigation: { T1: {...}, ..., T5: {...} },             // mirror STORED_RECIPE.tomato.fertigation verbatim — hand-stored current values (Haifa-heritage; PA Taillon recommendation is the FP target, not STORED)
//       sidedress:   { T1: {...}, ..., T5: {...} },             // mirror STORED_RECIPE.tomato.sidedress verbatim
//       foliaire:    { masterVol, backpacks, area, A: [...] },  // mirror STORED_RECIPE.tomato.foliaire verbatim
//     },
//     snapshot:     { ... }   // legacy partial — kept for retro-compat only
//   }
//
// TRIGGER (when to add an entry): edits to any of the three STORED recipe
// channels — STORED_RECIPE.tomato.fertigation, STORED_RECIPE.tomato.sidedress,
// or STORED_RECIPE.tomato.foliaire. Plant-need / model inputs (RECIPE_INPUTS,
// TOMATO_FRUIT_EXPORT, BIOMASS_DEMAND, lettuce-side constants) are NOT
// triggers — edit them freely without retiring.
//
// SNAPSHOT (what to capture): the COMPLETE applied recipe across all 3
// channels — fertigation, sidedress, foliaire. Fertigation is a hand-stored
// CONSTANT (STORED_RECIPE.tomato.fertigation) holding the team's current
// weighed values (Haifa-heritage at kSulfate / mgSulfate; PA Taillon's
// recommendation anchors the FP target, not STORED), so the snapshot reads
// it directly via structuredClone rather than re-running a computation. The
// OUTPUT (the actual K₂SO₄ / MgSO₄ / oligos doses Jordane weighs) is what
// was applied at that date and must be reproducible from the audit trail.
//
// FUTURE MAINTAINERS: before editing STORED_RECIPE.tomato.{fertigation,
// sidedress, foliaire}, capture the live state into `fullSnapshot`. Use
// `captureCurrentSnapshot()` from the browser console:
//   copy(JSON.stringify(captureCurrentSnapshot(), null, 2))
// The audit trail must reproduce what was applied at that date.
//
// Legacy entries (the four below from 2026-05-06/07) lack `fullSnapshot` —
// only the retired recipe was captured at the time. The page renders these
// with a "Snapshot partiel" label. Do not backfill — those moments have passed.
//
// This feeds the Historique des nutriments admin page (page slug 'historique-nutriments').
// It also serves as the team-visible audit trail for organic certification.
const RECIPE_HISTORY = [
  {
    retired: '2026-06-20',
    recipe: 'STORED_RECIPE.nursery.fertigation',
    summary: 'Recette semis re-dérivée anti-sel (poisson 13 → 1,5 mL/L, Océan ajouté)',
    reason: 'La recette pépinière salait les semis (leachate 5,1-5,6 mS/cm, tissu Na 3166, tip-burn, plants bloqués ~16 g) : l\'apport poisson (~2,0 mS/cm) se concentrait en cellule sans drainage. Re-dérivée pour le contrôle du sel (cible plug ~20 g, 1 apport/sem) : le N de poisson et le sel étant couplés, abaisser la cible plug à 20 g divise la demande N par deux et fait passer l\'apport sous la bande sûre. Poisson 13 → 1,5 mL/L, Océan 15-1-1 ajouté à 2 g/L (source N efficace), algues 2 → 1 mL/L, sulfate de fer inchangé (15 mg/L, ~3 ppm Fe, disponible en tourbe acide). CE cuve 2,0 → 0,85 mS/cm. Tous Ecocert CAN/CGSB-32.311. Lessivage 30-50 % par apport (protocole salt-flush). Décision Guillaume.',
    replacedBy: 'STORED_RECIPE.nursery.fertigation — Océan 2 g/L + poisson 1,5 mL/L + algues 1 mL/L + sulfate de fer 0,015 g/L (≈ par chaudière de 94 L : Eau 94 L · Océan 188 g · Poisson 141 mL · Algue 94 mL · Fer 1,4 g).',
    fullSnapshot: {
      nursery: { Ocean_15_1_1: 0, AcadiePoisson: 13, AcadieKelp: 2, IronSulfate: 0.015 },
    },
  },
  {
    retired: '2026-06-20',
    recipe: 'STORED_RECIPE.tomato.foliaire.A',
    summary: 'Acide citrique 65 g ajouté au spray A (chélation 1:1 du fer)',
    reason: 'Le spray A laissait des taches noires sur les fruits, qu\'il fallait laver avant la vente. Les taches sont des dépôts d\'oxyde ferrique : le FeSO₄·7H₂O (90 g, 0,6 %) sèche sur la peau du fruit, le Fe²⁺ s\'oxyde en Fe³⁺ et précipite en oxyde noir soudé à la cuticule. Le fruit ne tire aucun bénéfice du spray (cible = cuticule foliaire) ; tout dépôt sur fruit est pure perte à laver. Le fer reste sur le canal foliaire à dessein (pH sol ~7,4 verrouille le fer racinaire ; les chélates de fer synthétiques (EDTA/EDDHA) sont interdits CAN/CGSB-32.311). Solution : acide citrique 65 g / 15 L ≈ 1:1 molaire avec les 0,32 mol de fer. Le citrate, non volatil, reste dans le film séché et garde le fer oxydé sous forme de citrate ferrique soluble au lieu d\'un oxyde noir insoluble ; il abaisse aussi le pH cuve (cible 4,5-5,5) et améliore l\'absorption cuticulaire. Bande de tolérance 35-95 g ; CE cuve cible 4-6 mS/cm, plafond brûlure ~10. Acide citrique alimentaire validé Ecocert (issu de fermentation, CAN/CGSB-32.311) — produit fournisseur à confirmer avant achat. Décision Guillaume sur lecture spécialiste (mécanisme oxyde ferrique).',
    replacedBy: 'STORED_RECIPE.tomato.foliaire.A avec acide citrique 65 g (tous mélanges) — Mn 18 g + Zn 22 g + Fe 90 g + acide citrique 65 g (spray B CaCl₂ inchangé). Calibrer pH (4,5-5,5) et CE (4-6 mS/cm) au compteur sur un sac à dos ; ajuster la dose si taches Mn persistent (vers 95 g) ou si CE dépasse le plafond.',
    fullSnapshot: {
      fertigation: {
        T1: { mgSulfate: 0, kSulfate: 0, borax: 10, naMolybdate: 0.5 },
        T2: { mgSulfate: 0, kSulfate: 0, borax: 10, naMolybdate: 0.5 },
        T3: { mgSulfate: 0, kSulfate: 0, borax: 10, naMolybdate: 0.5 },
        T4: { mgSulfate: 0, kSulfate: 0, borax: 10, naMolybdate: 0.5 },
        T5: { mgSulfate: 0, kSulfate: 0, borax: 10, naMolybdate: 0.5 },
      },
      sidedress: {
        T1: { actisol_g: 57,  farine_g:   84 },
        T2: { actisol_g: 180, farine_g:  267 },
        T3: { actisol_g: 467, farine_g:  695 },
        T4: { actisol_g: 755, farine_g: 1125 },
        T5: { actisol_g: 0,   farine_g: 2000 },
      },
      foliaire: {
        masterVol: 15, backpacks: 1, area: '383 m²',
        A: [
          { name: 'MnSO₄ (31.5% Mn)', master: '18 g', note: 'réduit 22→18 g 2026-06-03 — ~60% demande, cap toxicité sans yucca' },
          { name: 'ZnSO₄ (35.5% Zn)', master: '22 g' },
          { name: 'FeSO₄·7H₂O (20% Fe)', master: '90 g', note: 'augmenté 80→90 g 2026-06-03 — ~95% demande (cuticule contourne lockout sol)' },
        ],
        B: [
          { name: 'CaCl₂·2H₂O', master: '100 g', note: 'Ecocert vérifié ; 2×/semaine ; sans surfactant — coverage cuticulaire ~0.15 ; bypass Ca racinaire pour défense botrytis' },
        ],
      },
    },
  },
  {
    retired: '2026-06-05',
    recipe: 'STORED_RECIPE.tomato.foliaire.A',
    summary: 'CuSO₄ retiré du foliaire (2 g → 0) — feed nutritif redondant',
    reason: 'Le cuivre foliaire était appliqué comme apport nutritif, pas comme fongicide. Le tissu lit un Cu élevé (résidu de pulvérisation probable — le Cu se lie à la cuticule et résiste au lavage labo) et le Cu sol est normal : aucune carence à nourrir. Le cuivre a la fenêtre suffisance→toxicité la plus étroite des micros et charge le sol de façon permanente (suivi par la certification organique CAN/CGSB-32.311), donc un feed sans carence a un ROI négatif. La demande en Cu est minuscule et le sol (Cu normal) couvre l\'absorption racinaire de base — arrêter le supplément ne crée pas de carence à court terme ; toute carence éventuelle apparaîtrait lentement sur la nouvelle croissance (semaines d\'avance) et se corrigerait par une petite dose ponctuelle, pas un feed permanent. Décision Guillaume sur lecture spécialiste (tissu Cu élevé + Cu sol normal).',
    replacedBy: 'STORED_RECIPE.tomato.foliaire.A sans ligne CuSO₄ — Mn + Zn + Fe seuls (spray B CaCl₂ inchangé). Surveiller la nouvelle croissance ; ré-évaluer au prochain test tissulaire.',
    fullSnapshot: {
      fertigation: {
        T1: { mgSulfate: 0, kSulfate: 0, borax: 10, naMolybdate: 0.5 },
        T2: { mgSulfate: 0, kSulfate: 0, borax: 10, naMolybdate: 0.5 },
        T3: { mgSulfate: 0, kSulfate: 0, borax: 10, naMolybdate: 0.5 },
        T4: { mgSulfate: 0, kSulfate: 0, borax: 10, naMolybdate: 0.5 },
        T5: { mgSulfate: 0, kSulfate: 0, borax: 10, naMolybdate: 0.5 },
      },
      sidedress: {
        T1: { actisol_g: 57,  farine_g:   84 },
        T2: { actisol_g: 180, farine_g:  267 },
        T3: { actisol_g: 467, farine_g:  695 },
        T4: { actisol_g: 755, farine_g: 1125 },
        T5: { actisol_g: 0,   farine_g: 2000 },
      },
      foliaire: {
        masterVol: 15, backpacks: 1, area: '383 m²',
        A: [
          { name: 'MnSO₄ (31.5% Mn)', master: '18 g', note: 'réduit 22→18 g 2026-06-03 — ~60% demande, cap toxicité sans yucca' },
          { name: 'ZnSO₄ (35.5% Zn)', master: '22 g' },
          { name: 'CuSO₄ (25% Cu)', master: '2 g', note: 'réduit 4→2 g 2026-05-05 — toxicité Cu observée (taches noires) sans yucca, local pooling concentre ~150-200 ppm Cu effective' },
          { name: 'FeSO₄·7H₂O (20% Fe)', master: '90 g', note: 'augmenté 80→90 g 2026-06-03 — ~95% demande (cuticule contourne lockout sol)' },
        ],
        B: [
          { name: 'CaCl₂·2H₂O', master: '100 g', note: 'Ecocert vérifié ; 2×/semaine ; sans surfactant — coverage cuticulaire ~0.15 ; bypass Ca racinaire pour défense botrytis' },
        ],
      },
    },
  },
  {
    retired: '2026-06-05',
    recipe: 'STORED_RECIPE.tomato.fertigation',
    summary: 'K₂SO₄ + MgSO₄ coupés à 0 tous stades (canal fertigation porte B + Mo seuls)',
    reason: 'Surplus confirmé sur les deux pools. SME 2026-06-04 (solution sol, pool immédiatement disponible) : K 301,7 ppm (≥ plafond 300), Mg 158,4 ppm (~1,6× plafond 100), CE 3,96 mmhos/cm (au-dessus du plafond 3,5). Mehlich-3 2026-04-10 (réserve échangeable) : K 7,3 % de saturation de la CEC (cible 3-5 %), Mg 18,3 % (cible 10-15 %), CEC 33 meq/100g — banque pluri-saisonnière. Aucun risque d\'approvisionnement : la plante a déjà plus de K/Mg qu\'elle n\'en absorbe. La coupe est CORRECTIVE — K₂SO₄ et MgSO₄ chargent la CE (cations + sulfate ; le sulfate solution est déjà à 1787 ppm) qui dépasse le plafond et bride l\'absorption d\'eau/nutriments. Complémentaire à la campagne soufre (Tiger ajoute du sulfate en s\'oxydant → couper les sels sulfatés fait de la place). Décline lentement (mois, pas semaines) : la CEC recharge la solution + l\'acidification déplace des cations en solution. Reprise d\'une dose d\'entretien seulement quand un SME ultérieur montre K/Mg revenus en milieu de gamme ET CE < 3,5. Décision Guillaume sur lecture spécialiste des deux analyses de sol.',
    replacedBy: 'STORED_RECIPE.tomato.fertigation.{T1..T5} = { mgSulfate: 0, kSulfate: 0, borax: 10, naMolybdate: 0.5 } — canal fertigation = bore (Solubore 10 g) + molybdène (0,5 g) seuls.',
    fullSnapshot: {
      fertigation: {
        T1: { mgSulfate: 276,  kSulfate: 410,  borax: 10, naMolybdate: 0.5 },
        T2: { mgSulfate: 873,  kSulfate: 1297, borax: 10, naMolybdate: 0.5 },
        T3: { mgSulfate: 723,  kSulfate: 1689, borax: 10, naMolybdate: 0.5 },
        T4: { mgSulfate: 1171, kSulfate: 2929, borax: 10, naMolybdate: 0.5 },
        T5: { mgSulfate: 1000, kSulfate: 5500, borax: 10, naMolybdate: 0.5 },
      },
      sidedress: {
        T1: { actisol_g: 57,  farine_g:   84 },
        T2: { actisol_g: 180, farine_g:  267 },
        T3: { actisol_g: 467, farine_g:  695 },
        T4: { actisol_g: 755, farine_g: 1125 },
        T5: { actisol_g: 0,   farine_g: 2000 },
      },
      foliaire: {
        masterVol: 15, backpacks: 1, area: '383 m²',
        A: [
          { name: 'MnSO₄ (31.5% Mn)', master: '18 g', note: 'réduit 22→18 g 2026-06-03 — ~60% demande, cap toxicité sans yucca' },
          { name: 'ZnSO₄ (35.5% Zn)', master: '22 g' },
          { name: 'CuSO₄ (25% Cu)', master: '2 g', note: 'réduit 4→2 g 2026-05-05 — toxicité Cu observée (taches noires) sans yucca, local pooling concentre ~150-200 ppm Cu effective' },
          { name: 'FeSO₄·7H₂O (20% Fe)', master: '90 g', note: 'augmenté 80→90 g 2026-06-03 — ~95% demande (cuticule contourne lockout sol)' },
        ],
        B: [
          { name: 'CaCl₂·2H₂O', master: '100 g', note: 'Ecocert vérifié ; 2×/semaine ; sans surfactant — coverage cuticulaire ~0.15 ; bypass Ca racinaire pour défense botrytis' },
        ],
      },
    },
  },
  {
    retired: '2026-06-04',
    recipe: 'STORED_RECIPE.tomato.{fertigation, foliaire}',
    summary: 'Molybdène déplacé foliaire → fertigation (NaMolybdate 1 g foliaire → 0,5 g fertigation tous stades)',
    reason: 'Correction de canal pour le molybdène. Mo avait été retiré du fertigation avec les oligos cationiques (2026-06-03) — mais Mo ne suit PAS la règle de verrouillage pH : le molybdate (MoO₄²⁻, anionique) devient PLUS disponible quand le pH monte, donc à pH sol 7,4 l\'absorption racinaire est élevée (efficacité canal 1.00), comme le bore. Il rejoint donc le bore sur le canal systémique fertigation (micros non-verrouillés = B + Mo ; foliaire = cations Fe/Mn/Zn/Cu qui ont besoin du contournement cuticulaire). Dose : foliaire portait 1 g (rembourré pour la perte de coverage ~30 % sans yucca) ; sur fertigation à ~100 % d\'efficacité, 0,5 g (cible FP, ~100 % demande) suffit. (1) FERTIGATION T1-T5 : ajout NaMolybdate 0,5 g tous stades. (2) FOLIAIRE spray A : ligne Molybdate de sodium retirée. Cert : même NaMolybdate déjà en usage, Ecocert — simple changement de canal, aucun produit nouveau. Mg/K/B, reste foliaire, sidedress inchangés.',
    replacedBy: 'STORED_RECIPE.tomato.fertigation.{T1..T5} = { mgSulfate, kSulfate, borax: 10, naMolybdate: 0.5 } ; STORED_RECIPE.tomato.foliaire.A sans ligne Molybdate (Mn 18 g, Zn 22 g, Cu 2 g, Fe 90 g).',
    fullSnapshot: {
      fertigation: {
        T1: { mgSulfate: 276,  kSulfate: 410,  borax: 10 },
        T2: { mgSulfate: 873,  kSulfate: 1297, borax: 10 },
        T3: { mgSulfate: 723,  kSulfate: 1689, borax: 10 },
        T4: { mgSulfate: 1171, kSulfate: 2929, borax: 10 },
        T5: { mgSulfate: 1000, kSulfate: 5500, borax: 10 },
      },
      sidedress: {
        T1: { actisol_g: 57,  farine_g:   84 },
        T2: { actisol_g: 180, farine_g:  267 },
        T3: { actisol_g: 467, farine_g:  695 },
        T4: { actisol_g: 755, farine_g: 1125 },
        T5: { actisol_g: 0,   farine_g: 2000 },
      },
      foliaire: {
        masterVol: 15, backpacks: 1, area: '383 m²',
        A: [
          { name: 'MnSO₄ (31.5% Mn)', master: '18 g', note: 'réduit 22→18 g 2026-06-03 — ~60% demande, cap toxicité sans yucca' },
          { name: 'ZnSO₄ (35.5% Zn)', master: '22 g' },
          { name: 'CuSO₄ (25% Cu)', master: '2 g', note: 'réduit 4→2 g 2026-05-05 — toxicité Cu observée (taches noires) sans yucca, local pooling concentre ~150-200 ppm Cu effective' },
          { name: 'Molybdate de sodium (39.6% Mo)', master: '1 g' },
          { name: 'FeSO₄·7H₂O (20% Fe)', master: '90 g', note: 'augmenté 80→90 g 2026-06-03 — ~95% demande (cuticule contourne lockout sol)' },
        ],
        B: [
          { name: 'CaCl₂·2H₂O', master: '100 g', note: 'Ecocert vérifié ; 2×/semaine ; sans surfactant — coverage cuticulaire ~0.15 ; bypass Ca racinaire pour défense botrytis' },
        ],
      },
    },
  },
  {
    retired: '2026-06-03',
    recipe: 'STORED_RECIPE.tomato.fertigation',
    summary: 'Bore fertigation Solubore 9 → 10 g tous stades',
    reason: 'Bump de bore décidé par Guillaume (appétit-risque opérateur). Tissu B au panel 2026-05-23 = 57 ppm, « suff » (plancher 31, plafond 150) — non limitant ; le 9 g (~107 % demande) tenait déjà le tissu stable. Le passage à 10 g (~119 % demande) reste loin du plafond 150 et sans enjeu cert (Solubore vérifié Ecocert 2026-05-08), mais sur-réplénit légèrement l\'offtake : surveiller le prochain panel pour dérive à la hausse (le bore s\'accumule, peu mobile, lent à lessiver). Mono-canal conservé (foliaire sans bore). Mg/K, foliaire, sidedress inchangés.',
    replacedBy: 'STORED_RECIPE.tomato.fertigation.{T1..T5} = { mgSulfate, kSulfate, borax: 10 } (Solubore 10 g).',
    fullSnapshot: {
      fertigation: {
        T1: { mgSulfate: 276,  kSulfate: 410,  borax: 9 },
        T2: { mgSulfate: 873,  kSulfate: 1297, borax: 9 },
        T3: { mgSulfate: 723,  kSulfate: 1689, borax: 9 },
        T4: { mgSulfate: 1171, kSulfate: 2929, borax: 9 },
        T5: { mgSulfate: 1000, kSulfate: 5500, borax: 9 },
      },
      sidedress: {
        T1: { actisol_g: 57,  farine_g:   84 },
        T2: { actisol_g: 180, farine_g:  267 },
        T3: { actisol_g: 467, farine_g:  695 },
        T4: { actisol_g: 755, farine_g: 1125 },
        T5: { actisol_g: 0,   farine_g: 2000 },
      },
      foliaire: {
        masterVol: 15, backpacks: 1, area: '383 m²',
        A: [
          { name: 'MnSO₄ (31.5% Mn)', master: '18 g', note: 'réduit 22→18 g 2026-06-03 — ~60% demande, cap toxicité sans yucca' },
          { name: 'ZnSO₄ (35.5% Zn)', master: '22 g' },
          { name: 'CuSO₄ (25% Cu)', master: '2 g', note: 'réduit 4→2 g 2026-05-05 — toxicité Cu observée (taches noires) sans yucca, local pooling concentre ~150-200 ppm Cu effective' },
          { name: 'Molybdate de sodium (39.6% Mo)', master: '1 g' },
          { name: 'FeSO₄·7H₂O (20% Fe)', master: '90 g', note: 'augmenté 80→90 g 2026-06-03 — ~95% demande (cuticule contourne lockout sol)' },
        ],
        B: [
          { name: 'CaCl₂·2H₂O', master: '100 g', note: 'Ecocert vérifié ; 2×/semaine ; sans surfactant — coverage cuticulaire ~0.15 ; bypass Ca racinaire pour défense botrytis' },
        ],
      },
    },
  },
  {
    retired: '2026-06-03',
    recipe: 'STORED_RECIPE.tomato.{fertigation, foliaire}',
    summary: 'Bore mono-canal : fertigation Solubore 11→9 g tous stades ; bore foliaire retiré (Solubore 7 g → 0)',
    reason: 'Réconciliation du bore sur un seul canal. Le bore était livré en double — fertigation 11 g Solubore (~131 % de la demande) ET foliaire 7 g Solubore (~50 %), soit ~180 % cumulé. Pour un nutriment à fenêtre déficience→toxicité étroite, ce surplus n\'a aucun bénéfice agronomique. (1) FERTIGATION T1-T5 : Solubore 11 → 9 g sur tous les stades — retour au dosage validé Ecocert (2026-05-08) à ~107 % de la demande T5. Le 11 g était un report de l\'ère borax (bump cicatrisation lésions 2026-05-28, alors borax 11.3 % B = ~72 % demande) qui sur-dose maintenant que le produit est Solubore (20.5 % B). (2) FOLIAIRE spray A : bore retiré entièrement (Solubore 7 g → 0). La fertigation porte le bore : borate non-ionique, efficacité canal 1.00 (non verrouillé à pH 7,4, comme le molybdate), livraison systémique par le xylème — ce qui corrige l\'immobilité phloémienne du bore foliaire. Le bore foliaire était le canal redondant et inférieur (immobile, cap brûlure, coverage 30 % sans yucca). Net : bore sur fertigation seule à ~107 % au lieu de ~180 % bi-canal. Cert : Solubore vérifié Ecocert (2026-05-08) ; aucun produit nouveau. Mg/K, oligos foliaires restants, sidedress inchangés.',
    replacedBy: 'STORED_RECIPE.tomato.fertigation.{T1..T5} = { mgSulfate, kSulfate, borax: 9 } (Solubore 9 g) ; STORED_RECIPE.tomato.foliaire.A sans ligne Solubore (Mn 18 g, Zn 22 g, Cu 2 g, Mo 1 g, Fe 90 g).',
    fullSnapshot: {
      fertigation: {
        T1: { mgSulfate: 276,  kSulfate: 410,  borax: 11 },
        T2: { mgSulfate: 873,  kSulfate: 1297, borax: 11 },
        T3: { mgSulfate: 723,  kSulfate: 1689, borax: 11 },
        T4: { mgSulfate: 1171, kSulfate: 2929, borax: 11 },
        T5: { mgSulfate: 1000, kSulfate: 5500, borax: 11 },
      },
      sidedress: {
        T1: { actisol_g: 57,  farine_g:   84 },
        T2: { actisol_g: 180, farine_g:  267 },
        T3: { actisol_g: 467, farine_g:  695 },
        T4: { actisol_g: 755, farine_g: 1125 },
        T5: { actisol_g: 0,   farine_g: 2000 },
      },
      foliaire: {
        masterVol: 15, backpacks: 1, area: '383 m²',
        A: [
          { name: 'MnSO₄ (31.5% Mn)', master: '18 g', note: 'réduit 22→18 g 2026-06-03 — ~60% demande, cap toxicité sans yucca' },
          { name: 'ZnSO₄ (35.5% Zn)', master: '22 g' },
          { name: 'Solubore (20.5% B)', master: '7 g' },
          { name: 'CuSO₄ (25% Cu)', master: '2 g', note: 'réduit 4→2 g 2026-05-05 — toxicité Cu observée (taches noires) sans yucca, local pooling concentre ~150-200 ppm Cu effective' },
          { name: 'Molybdate de sodium (39.6% Mo)', master: '1 g' },
          { name: 'FeSO₄·7H₂O (20% Fe)', master: '90 g', note: 'augmenté 80→90 g 2026-06-03 — ~95% demande (cuticule contourne lockout sol)' },
        ],
        B: [
          { name: 'CaCl₂·2H₂O', master: '100 g', note: 'Ecocert vérifié ; 2×/semaine ; sans surfactant — coverage cuticulaire ~0.15 ; bypass Ca racinaire pour défense botrytis' },
        ],
      },
    },
  },
  {
    retired: '2026-06-03',
    recipe: 'STORED_RECIPE.tomato.{fertigation, foliaire}',
    summary: 'Fertigation dépouillée K+Mg+B seul (oligos cationiques + Mo retirés, B→11 g Solubore tous stades) ; foliaire Mn 22→18 g, Fe 80→90 g',
    reason: 'Alignement du canal fertigation sur la stratégie pH-lockout. (1) FERTIGATION T1-T5 : retrait de Fe / Zn / Mn / Cu (oligos cationiques) et Mo du canal fertigation — à pH sol ~7,4 ces cations sont verrouillés en racinaire (inefficaces), ils sont livrés en foliaire où l\'absorption cuticulaire contourne le lockout. Bore conservé comme seul oligo fertigation et porté à 11 g sur tous les stades (T1-T4 : 9 → 11 g ; T5 inchangé à 11) ; produit basculé de borax (borate de sodium) vers Solubore (acide borique non-ionique, 100 % efficace à pH 7,4, sans apport de Na). Mg et K inchangés sur tous les stades. NB clé de données : la valeur B reste sous la clé `borax` (le rendu drift la libelle déjà « Solubore ») — renommer la clé en `solubore` est un suivi lane-codeur. (2) FOLIAIRE spray A : MnSO₄ 22 → 18 g (~60 % demande, cap toxicité sans yucca) ; FeSO₄·7H₂O 80 → 90 g (~95 % demande). Bore reste 2-canaux (foliaire Solubore 7 g conservé EN PLUS du fertigation — choix opérateur). Cert : Solubore vérifié Ecocert (2026-05-08) ; retraits de produits sans enjeu cert. Sidedress inchangé.',
    replacedBy: 'STORED_RECIPE.tomato.fertigation.{T1..T5} = { mgSulfate, kSulfate, borax: 11 } (Fe/Zn/Mn/Cu/Mo retirés ; borax = Solubore 11 g) ; STORED_RECIPE.tomato.foliaire.A : MnSO₄ 18 g, FeSO₄·7H₂O 90 g.',
    fullSnapshot: {
      fertigation: {
        T1: { mgSulfate: 276,  kSulfate: 410,  feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9,  naMolybdate: 1 },
        T2: { mgSulfate: 873,  kSulfate: 1297, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9,  naMolybdate: 1 },
        T3: { mgSulfate: 723,  kSulfate: 1689, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9,  naMolybdate: 1 },
        T4: { mgSulfate: 1171, kSulfate: 2929, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9,  naMolybdate: 1 },
        T5: { mgSulfate: 1000, kSulfate: 5500, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 11, naMolybdate: 1 },
      },
      sidedress: {
        T1: { actisol_g: 57,  farine_g:   84 },
        T2: { actisol_g: 180, farine_g:  267 },
        T3: { actisol_g: 467, farine_g:  695 },
        T4: { actisol_g: 755, farine_g: 1125 },
        T5: { actisol_g: 0,   farine_g: 2000 },
      },
      foliaire: {
        masterVol: 15, backpacks: 1, area: '383 m²',
        A: [
          { name: 'MnSO₄ (31.5% Mn)', master: '22 g' },
          { name: 'ZnSO₄ (35.5% Zn)', master: '22 g' },
          { name: 'Solubore (20.5% B)', master: '7 g' },
          { name: 'CuSO₄ (25% Cu)', master: '2 g', note: 'réduit 4→2 g 2026-05-05 — toxicité Cu observée (taches noires) sans yucca, local pooling concentre ~150-200 ppm Cu effective' },
          { name: 'Molybdate de sodium (39.6% Mo)', master: '1 g' },
          { name: 'FeSO₄·7H₂O (20% Fe)', master: '80 g' },
        ],
        B: [
          { name: 'CaCl₂·2H₂O', master: '100 g', note: 'Ecocert vérifié ; 2×/semaine ; sans surfactant — coverage cuticulaire ~0.15 ; bypass Ca racinaire pour défense botrytis' },
        ],
      },
    },
  },
  {
    retired: '2026-05-28',
    recipe: 'STORED_RECIPE.tomato.{fertigation, sidedress, foliaire}',
    summary: 'Stratégie anti-botrytis T5 : Mg/K coupés (antagonisme Ca), borax remis, farine bump, spray B CaCl₂ ré-ajouté',
    reason: 'Pivot stratégique : défense Ca contre botrytis + vigueur de la plante (farine ↑). (1) Fertigation T5 : MgSO₄ 2800 → 1000 g et K₂SO₄ 7000 → 5500 g — Mg et K en excès gênent l\'absorption racinaire du Ca (antagonisme cationique au membrane). Borax remis à 11 g (était retiré 2026-05-23) — B aide à la cicatrisation des lésions, bon contre la propagation botrytis. Cuve maître 170 L → 110 L sur cycle 5 jours (au lieu de 7) : assure que la dose hebdomadaire complète est livrée pendant les 5 premiers jours ; jours 6-7 fertigation à eau claire. Oligos Fe / Zn / Mn / Cu / Mo inchangés. (2) Sidedress T5 : Actisol 5-3-2 retiré (était déjà gaté par ca-aware-product-gate sur sol Ca-saturé — STORED s\'aligne désormais sur FP_RECIPE_T5) ; farine de plumes 1341 → 2000 g par planche pour vigueur additionnelle. (3) Foliaire : spray B CaCl₂·2H₂O 100 g / 15 L réintroduit (cible foliar-ce-under-burn-cap burn cap 0,67 %), 2×/semaine, sans surfactant — coverage cuticulaire ~0.15, livraison ~17 mg Ca/m²/sem, bypass des obstacles racinaires de Ca pour défense botrytis. Source CaCl₂ vérifiée Ecocert (était la raison du retrait 2026-05-06). Modèle Ca recipe (data.js + computeFoliarSupply) reste gated/todo — STORED audit-trail ouvert avant le pipeline de rendu. T1-T4 inchangés sur les trois canaux — pivot appliqué seulement au stage courant T5.',
    replacedBy: 'STORED_RECIPE.tomato.fertigation.T5 = { mgSulfate: 1000, kSulfate: 5500, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 11, naMolybdate: 1 } (cuve 110 L / 5 jours) ; STORED_RECIPE.tomato.sidedress.T5 = { actisol_g: 0, farine_g: 2000 } ; STORED_RECIPE.tomato.foliaire.B = [{ name: \'CaCl₂·2H₂O\', master: \'100 g\', note: \'Ecocert vérifié ; 2×/sem ; sans surfactant — coverage 0.15\' }].',
    fullSnapshot: {
      fertigation: {
        T1: { mgSulfate: 276,  kSulfate: 410,  feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9, naMolybdate: 1 },
        T2: { mgSulfate: 873,  kSulfate: 1297, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9, naMolybdate: 1 },
        T3: { mgSulfate: 723,  kSulfate: 1689, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9, naMolybdate: 1 },
        T4: { mgSulfate: 1171, kSulfate: 2929, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9, naMolybdate: 1 },
        T5: { mgSulfate: 2800, kSulfate: 7000, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, naMolybdate: 1 },
      },
      sidedress: {
        T1: { actisol_g: 57,  farine_g:   84 },
        T2: { actisol_g: 180, farine_g:  267 },
        T3: { actisol_g: 467, farine_g:  695 },
        T4: { actisol_g: 755, farine_g: 1125 },
        T5: { actisol_g: 900, farine_g: 1341 },
      },
      foliaire: {
        masterVol: 15, backpacks: 1, area: '383 m²',
        A: [
          { name: 'MnSO₄ (31.5% Mn)', master: '22 g' },
          { name: 'ZnSO₄ (35.5% Zn)', master: '22 g' },
          { name: 'Solubore (20.5% B)', master: '7 g' },
          { name: 'CuSO₄ (25% Cu)', master: '2 g', note: 'réduit 4→2 g 2026-05-05 — toxicité Cu observée (taches noires) sans yucca, local pooling concentre ~150-200 ppm Cu effective' },
          { name: 'Molybdate de sodium (39.6% Mo)', master: '1 g' },
          { name: 'FeSO₄·7H₂O (20% Fe)', master: '80 g' },
        ],
      },
    },
  },
  {
    retired: '2026-05-23',
    recipe: 'STORED_RECIPE.tomato.fertigation.T5',
    summary: 'T5 revu PA Taillon : MgSO₄ 1396→2800 g, K₂SO₄ 3489→7000 g, borax retiré',
    reason: 'Nouvelle recommandation PA Taillon (Climax Conseils, 2026-05-23) pour le pic de production T5 — MgSO₄ et K₂SO₄ doublés (1396 → 2800 g et 3489 → 7000 g par cycle de mélange) ; borax retiré du canal fertigation (B continue d\'être livré via le foliaire Solubore 7 g / 15 L). Oligos Fe / Zn / Mn / Cu / Mo inchangés. T1-T4 inchangés — bascule appliquée seulement au stage courant.',
    replacedBy: 'STORED_RECIPE.tomato.fertigation.T5 = { mgSulfate: 2800, kSulfate: 7000, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, naMolybdate: 1 } — borax retiré.',
    fullSnapshot: {
      fertigation: {
        T1: { mgSulfate: 276,  kSulfate: 410,  feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9, naMolybdate: 1 },
        T2: { mgSulfate: 873,  kSulfate: 1297, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9, naMolybdate: 1 },
        T3: { mgSulfate: 723,  kSulfate: 1689, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9, naMolybdate: 1 },
        T4: { mgSulfate: 1171, kSulfate: 2929, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9, naMolybdate: 1 },
        T5: { mgSulfate: 1396, kSulfate: 3489, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9, naMolybdate: 1 },
      },
      sidedress: {
        T1: { actisol_g: 57,  farine_g:   84 },
        T2: { actisol_g: 180, farine_g:  267 },
        T3: { actisol_g: 467, farine_g:  695 },
        T4: { actisol_g: 755, farine_g: 1125 },
        T5: { actisol_g: 900, farine_g: 1341 },
      },
      foliaire: {
        masterVol: 15, backpacks: 1, area: '383 m²',
        A: [
          { name: 'MnSO₄ (31.5% Mn)', master: '22 g' },
          { name: 'ZnSO₄ (35.5% Zn)', master: '22 g' },
          { name: 'Solubore (20.5% B)', master: '7 g' },
          { name: 'CuSO₄ (25% Cu)', master: '2 g', note: 'réduit 4→2 g 2026-05-05 — toxicité Cu observée (taches noires) sans yucca, local pooling concentre ~150-200 ppm Cu effective' },
          { name: 'Molybdate de sodium (39.6% Mo)', master: '1 g' },
          { name: 'FeSO₄·7H₂O (20% Fe)', master: '80 g' },
        ],
      },
    },
  },
  {
    retired: '2026-05-08',
    recipe: 'TOMATO_STAGES const (memoized snapshot of computeStageRecipe)',
    summary: 'Indirection vestigiale supprimée — computeStageRecipe() appelée directement',
    snapshot: {
      structure: 'const TOMATO_STAGES = { T1: computeStageRecipe(T1), ..., T5: computeStageRecipe(T5) }',
    },
    reason: 'Vestigial indirection from mass-balance refactor — redundant with computeStageRecipe(). Made the stored-vs-FP-drift check meaningless because stored = computed by construction. Path A cleanup: drop the const, call the function directly, retire the drift check.',
    replacedBy: 'Direct calls to computeStageRecipe(stage) at every reader site.',
  },
  {
    retired: '2026-05-07',
    recipe: 'TOMATO_STAGES.T6 + TOMATO_SIDEDRESS.T6 (fin de saison stage, weeks 24-28)',
    summary: 'Stage T6 (fin de saison, sem 24-28) supprimé — T5 étendu',
    snapshot: {
      TOMATO_STAGES_T6: { mgSulfate: 700, kSulfate: 1745 },  // pre-mass-balance values
      TOMATO_SIDEDRESS_T6: { actisol_g: 0, farine_g: 0 },
      stageYield_T6: 0.7,
      rationale: 'Implemented OAQ §4.3.2 end-of-season fertilizer reduction (~50% cut)',
    },
    reason: 'Mass-balance refactor superseded the heuristic. Plants still remove K via fruit at end-of-season — arbitrary 50% fertigation cut has no first-principles basis. T5 now runs to crop-out at sem 28.',
    replacedBy: 'T5 extended to cover weeks 19-28; mass-balance recipe applies uniformly through end of cycle.',
  },
  {
    retired: '2026-05-07',
    recipe: 'TOMATO_STAGES (hand-set Haifa-anchored values × multipliers)',
    summary: 'TOMATO_STAGES valeurs dérivées (mass-balance) au lieu de hand-set',
    snapshot: {
      T1: { mgSulfate: 276, kSulfate: 410 },
      T2: { mgSulfate: 873, kSulfate: 1297 },
      T3: { mgSulfate: 723, kSulfate: 1689 },
      T4: { mgSulfate: 1171, kSulfate: 2929 },
      T5: { mgSulfate: 1396, kSulfate: 3489 },
      T6: { mgSulfate: 700,  kSulfate: 1745 },
    },
    reason: 'Replaced by computeStageRecipe() — pure mass-balance derivation from offtake (fruit + biomass) − sidedress − compost. Hand-set values had no first-principles justification.',
    replacedBy: 'computeStageRecipe(stage) using RECIPE_INPUTS + mass-balance formula',
  },
  {
    retired: '2026-05-07',
    recipe: 'getMultK / getMultMg fertigation multipliers',
    summary: 'Multiplicateurs K (1.2×) / Mg (2.0×) ramenés à 1.0×',
    snapshot: { K: 1.2, Mg: 2.0 },
    reason: 'Reverted from policy bumps (1.2× K, 2× Mg) back to 1.0× as part of mass-balance refactor. Multipliers themselves now obsolete since TOMATO_STAGES is computed.',
    replacedBy: 'TOMATO_STAGES values now derived directly; multipliers held at 1.0 as no-ops pending removal.',
  },
  {
    retired: '2026-05-06',
    recipe: 'FOLIAR.tomato.B (CaCl₂ anti-BER spray)',
    summary: 'Spray B (CaCl₂ anti-BER) retiré',
    snapshot: { product: 'CaCl₂·2H₂O 100 g per 15 L spray, even-week alternation' },
    reason: 'Teris industrial-grade Ecocert listing not verified (audit Finding 9, ecocert-only-products). BER prevention now via ventilation + humidity management.',
    replacedBy: 'Climate control protocol on Climat page',
  },
  {
    retired: '2026-05-06',
    recipe: 'FOLIAR.tomato.A Cu dose',
    summary: 'Dose Cu réduite 4 g → 2 g par 15 L',
    snapshot: { CuSO4: '4 g per 15 L spray' },
    reason: 'Cu toxicity observed in image diagnostic; no surfactant in current Spray A so leaf burn risk higher than budget. Cut to 2 g.',
    replacedBy: 'CuSO₄ 2 g per 15 L (current STORED_RECIPE.tomato.foliaire.A)',
  },
  // Add new entries above this line as recipes are retired.
];
