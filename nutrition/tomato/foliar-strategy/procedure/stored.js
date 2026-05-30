// Hand-stored foliar recipe — two weekly tomato sprays (A oligos + B Ca).
// Mix directly in 1 backpack (15 L). Origin: Climax Conseils (April 2026,
// farm info/fertigation oligos éléments tomate avril.pdf). Original 45 L
// master bi-weekly with MnSO₄ 66g, ZnSO₄ 66g, Solubore 21g, CuSO₄ 12g,
// Na molybdate 3g, Fe-EDDHA 33g. Reduced 45 L → 15 L on 2026-04-29 (without
// yucca, larger volumes drip/run off). Doses divided by 3 to hold
// concentration constant: 22/22/7/4/1 g + Fe (Cu reduced 4→2 g 2026-05-05
// per toxicity observation). Spray B (CaCl₂) re-introduced 2026-05-28 —
// CaCl₂·2H₂O 100 g / 15 L (foliar-ce-under-burn-cap 0.67 %), 2×/semaine, sans
// surfactant (coverage cuticulaire ~0.15) ; bypass Ca racinaire pour
// défense botrytis. Source CaCl₂ vérifiée Ecocert (raison du retrait
// 2026-05-06 résolue). Modèle Ca recipe (data.js + computeFoliarSupply)
// reste gated/todo — STORED audit-trail ouvert avant pipeline de rendu.
// Yucca surfactant not on order — A coverage operates at 30 %, B at 15 %.
//
// EDITS REQUIRE /retire-recipe SKILL FIRST. Path `STORED_RECIPE.tomato.foliaire`
// preserved verbatim; the skill greps for this identifier.
window.STORED_RECIPE.tomato.foliaire = {
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
};
