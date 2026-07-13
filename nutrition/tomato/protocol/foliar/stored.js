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
// 2026-06-20 : acide citrique 65 g ajouté au spray A (≈ 1:1 molaire avec le fer)
// — le citrate garde le fer oxydé sous forme de citrate ferrique soluble dans le
// film séché au lieu d'un oxyde noir soudé à la cuticule (taches noires sur fruit
// à laver). pH cuve cible 4,5-5,5, CE 4-6 mS/cm. Ecocert (fermentation).
// Yucca surfactant not on order — A coverage operates at 30 %, B at 15 %.
//
// 2026-07-11 : DEUX SPRAYS RETIRÉS (A oligos + B Ca) — /retire-recipe, snapshot
// complet dans RECIPE_HISTORY. pH planches redescendu à 6,5 (EC 1:1, 9 juillet
// 2026) : le verrouillage racinaire pH 7,4 est levé, Fe/Mn/Zn rendus au canal
// fertigation (STORED_RECIPE.tomato.fertigation, demande pleine à eff. 0,75).
// Spray B (CaCl₂) abandonné sans remplacement : Ca sol en surplus, le Ca
// fertigation est sans effet (Ca xylème-mobile, transpiration-limité) ; rôle
// défense botrytis/chancre (pontage Ca-pectate) cessé — surveiller BER + chancre.
// Plus de spray foliaire hebdomadaire. Objet vide (aucun spray) mais conservé
// pour l'identifiant grep + restauration éventuelle event-driven (BER/chancre
// persistant → réintroduire spray B CaCl₂ ; pH remonte > 7 → réintroduire A).
//
// EDITS REQUIRE /retire-recipe SKILL FIRST. Path `STORED_RECIPE.tomato.foliaire`
// preserved verbatim; the skill greps for this identifier.
window.STORED_RECIPE.tomato.foliaire = {
  masterVol: 15, backpacks: 1, area: '383 m²',
  A: [],
  B: [],
};
