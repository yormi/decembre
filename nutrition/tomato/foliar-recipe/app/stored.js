// Hand-stored foliar recipe — single weekly tomato spray (Mn / Zn / B / Cu / Mo / Fe).
// Mix directly in 1 backpack (15 L). Origin: Climax Conseils (April 2026,
// farm info/fertigation oligos éléments tomate avril.pdf). Original 45 L
// master bi-weekly with MnSO₄ 66g, ZnSO₄ 66g, Solubore 21g, CuSO₄ 12g,
// Na molybdate 3g, Fe-EDDHA 33g. Reduced 45 L → 15 L on 2026-04-29 (without
// yucca, larger volumes drip/run off). Doses divided by 3 to hold
// concentration constant: 22/22/7/4/1 g + Fe (Cu reduced 4→2 g 2026-05-05
// per toxicity observation). Spray B (CaCl₂) retired 2026-05-06 (Ecocert
// listing unverified). Yucca surfactant not on order — coverage operates
// at 30%, doses already account for this.
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
};
