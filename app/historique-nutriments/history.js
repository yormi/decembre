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
    retired: '2026-05-28',
    recipe: 'STORED_RECIPE.tomato.{fertigation, sidedress, foliaire}',
    summary: 'Stratégie anti-botrytis T5 : Mg/K coupés (antagonisme Ca), borax remis, farine bump, spray B CaCl₂ ré-ajouté',
    reason: 'Pivot stratégique : défense Ca contre botrytis + vigueur de la plante (farine ↑). (1) Fertigation T5 : MgSO₄ 2800 → 1000 g et K₂SO₄ 7000 → 5500 g — Mg et K en excès gênent l\'absorption racinaire du Ca (antagonisme cationique au membrane). Borax remis à 11 g (était retiré 2026-05-23) — B aide à la cicatrisation des lésions, bon contre la propagation botrytis. Cuve maître 170 L → 110 L sur cycle 5 jours (au lieu de 7) : assure que la dose hebdomadaire complète est livrée pendant les 5 premiers jours ; jours 6-7 fertigation à eau claire. Oligos Fe / Zn / Mn / Cu / Mo inchangés. (2) Sidedress T5 : Actisol 5-3-2 retiré (était déjà gaté par REQ-089 sur sol Ca-saturé — STORED s\'aligne désormais sur FP_RECIPE_T5) ; farine de plumes 1341 → 2000 g par planche pour vigueur additionnelle. (3) Foliaire : spray B CaCl₂·2H₂O 100 g / 15 L réintroduit (cible REQ-025 burn cap 0,67 %), 2×/semaine, sans surfactant — coverage cuticulaire ~0.15, livraison ~17 mg Ca/m²/sem, bypass des obstacles racinaires de Ca pour défense botrytis. Source CaCl₂ vérifiée Ecocert (était la raison du retrait 2026-05-06). Modèle Ca recipe (data.js + computeFoliarSupply) reste gated/todo — STORED audit-trail ouvert avant le pipeline de rendu. T1-T4 inchangés sur les trois canaux — pivot appliqué seulement au stage courant T5.',
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
    reason: 'Vestigial indirection from mass-balance refactor — redundant with computeStageRecipe(). Made REQ-016 (stored vs FP drift) meaningless because stored = computed by construction. Path A cleanup: drop the const, call the function directly, retire REQ-016.',
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
    reason: 'Teris industrial-grade Ecocert listing not verified (audit Finding 9, REQ-002). BER prevention now via ventilation + humidity management.',
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
