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
// 2026-06-03 : MnSO₄ 22 → 18 g (~60% demande, cap toxicité) ; FeSO₄·7H₂O
// 80 → 90 g (~95% demande). Solubore foliaire RETIRÉ (7 g → 0) — bore
// mono-canal sur fertigation (borate non-ionique, efficacité canal 1.00,
// livraison systémique xylème) ; le bore foliaire était redondant +
// immobile phloème. Fertigation porte le bore à 9 g (~107% demande).
// 2026-06-04 : molybdène (NaMolybdate 1 g) retiré du foliaire → déplacé sur
// fertigation 0,5 g (Mo non verrouillé à pH élevé — molybdate plus dispo quand
// pH monte ; canal racinaire efficace, comme le bore).
// 2026-06-05 : CuSO₄ (2 g) RETIRÉ — feed nutritif, pas fongicide ; tissu Cu élevé
// (résidu probable) + Cu sol normal = aucune carence à nourrir. Fenêtre
// suffisance→toxicité la plus étroite des micros + charge sol permanente
// (cert-tracked) → ROI négatif. Sol (Cu normal) couvre l'absorption racinaire de base.
// Yucca surfactant not on order — A coverage operates at 30 %, B at 15 %.
//
// EDITS REQUIRE /retire-recipe SKILL FIRST. Path `STORED_RECIPE.tomato.foliaire`
// preserved verbatim; the skill greps for this identifier.
window.STORED_RECIPE.tomato.foliaire = {
  masterVol: 15, backpacks: 1, area: '383 m²',
  A: [
    { name: 'MnSO₄ (31.5% Mn)', master: '18 g', note: 'réduit 22→18 g 2026-06-03 — ~60% demande, cap toxicité sans yucca' },
    { name: 'ZnSO₄ (35.5% Zn)', master: '22 g' },
    { name: 'FeSO₄·7H₂O (20% Fe)', master: '90 g', note: 'augmenté 80→90 g 2026-06-03 — ~95% demande (cuticule contourne lockout sol)' },
  ],
  B: [
    { name: 'CaCl₂·2H₂O', master: '100 g', note: 'Ecocert vérifié ; 2×/semaine ; sans surfactant — coverage cuticulaire ~0.15 ; bypass Ca racinaire pour défense botrytis' },
  ],
};
