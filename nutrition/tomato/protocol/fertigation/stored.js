// Hand-stored fertigation recipe (PA Taillon, Climax Conseils, April 8 2026).
// Source PDF: farm info/fertigation oligos éléments tomate avril.pdf.
// 2026-07-11 : oligos cationiques Mn / Zn RENDUS au fertigation (sprays
// foliaires A + B retirés — /retire-recipe). pH planches redescendu à 6,5
// (EC 1:1 par poids, 9 juillet 2026, moyenne 7 planches, étendue 6,1-6,8) :
// le verrouillage racinaire des sulfates cationiques est levé (courbe
// sulfate-metal 0,10 à pH 7,4 → 0,75 à pH 6,5). Doses = demande pleine de la
// plante à efficacité canal 0,75 (aucun rabais crédit-sol, décision Guillaume) ;
// ramp par stade.
// 2026-08-23 : correctif de livraison — les lignes Mn/Zn du 2026-07-11 n'ont
// jamais paru sur la fiche opérateur (rendu 4 produits) → jamais pesées.
// Mn coupé à 0 : tissu août tenu à livraison zéro, le sol couvre à pH 6,5
// (tripwire : tissu Mn vers le plancher → réintroduire). Zn triplé (5-20 g,
// arrondis balance) : eff. 0,75 jamais mesurée + SME Zn 0,01 → essai drip
// généreux, arbitré au prochain SME + tissu (feuille remonte → drip viable ;
// SME toujours 0,01 → canal mort, bascule foliaire). Fe NON fertigé : le sol le couvre (banque 310 ppm, tissu
// suff) et le FeSO₄ s'oxyde dans la cuve maître 5 jours (Fe²⁺→Fe³⁺, colmatage
// goutteurs) — Fe routé passif ; fallback = FeSO₄ granulaire en sidedress si
// un tissu montre une carence. Cu non rendu (tissu élevé + sol normal).
// Déclencheur de révision : prochaine SME Berger à 6,5 (micros verrouillés
// remontent → réduire/annuler le drip). Historique 2026-06-03 → 2026-06-05 :
// canal dépouillé à K + Mg + micros non-verrouillés quand pH sol était ~7,4
// (Fe/Mn/Zn/Cu verrouillés, livrés en foliaire) ; Mo réajusté 2026-06-04 : le
// molybdate (anionique) est PLUS disponible à pH élevé, absorption racinaire
// élevée (NaMolybdate 0,5 g tous stades). Bore = oligo fertigation, 10 g tous
// stades (mono-canal : foliaire Solubore retiré 2026-06-03 — la fertigation
// porte le bore, borate non-ionique efficacité canal 1.00 + livraison
// systémique xylème ; 10 g ≈ 119 % demande, bump 9→10 g 2026-06-03 décidé par
// Guillaume ; produit Solubore validé Ecocert 2026-05-08).
// Produit basculé borax → Solubore (acide borique non-ionique, 100 % efficace
// à pH 7,4, sans Na). Valeur B sous la clé `borax` (le rendu drift la libelle
// déjà « Solubore » ; renommer = suivi lane-codeur). Mg/K inchangés.
// (Antérieur T5 2026-05-28 : Mg/K coupés vs botrytis, borax remis ; cuve maître
// 110 L / cycle 5 jours, Dosatron 2 % — livraison 5 j, jours 6-7 eau claire.)
// Area 382,6 m² (7 planches × 54,7 m²). Per-stage T1-T5 = grams to dissolve in
// the master tank for ONE week. K and Mg ramp with stage yield. T6 retired
// 2026-05-07 (RECIPE_HISTORY entry); T1-T5 only.
//
// EDITS REQUIRE /retire-recipe SKILL FIRST. Path `STORED_RECIPE.tomato.fertigation`
// preserved verbatim; the skill greps for this identifier.
window.STORED_RECIPE.tomato.fertigation = {
  // Zn en essai drip 3× (2026-08-23) + B (Solubore 10 g, clé `borax`)
  // + Mo (NaMolybdate 0,5 g). Mg toujours 0. Mn 0 (sol couvre à pH 6,5).
  // Fe passif (sol). Area 382,9 m² (7 planches).
  // MgSO₄ coupé à 0 le 2026-06-05 (/retire-recipe) : surplus confirmé sur les deux pools —
  // SME 2026-06-04 solution Mg 158,4 (~1,6× plafond) / CE 3,96 (>3,5) ; Mehlich-3 2026-04-10
  // Mg 18,3 % saturation CEC, banque pluri-saisonnière. Reprise d'entretien Mg gated sur
  // SME Mg milieu de gamme ET CE < 3,5.
  //
  // K₂SO₄ : remis au PLANCHER D'INTENSITÉ 20 % le 2026-08-02 (/retire-recipe). Le pool K
  // reste en large surplus (Mehlich-3 1059 ppm vs bande 200-250) — la dose n'est PAS de
  // l'entretien de pool, c'est l'axe intensité : le K n'atteint la racine que par diffusion,
  // donc un pool plein ne prévient pas la coquille d'épuisement aux pointes de demande
  // (domain/soil-maintenance.md § Intensity floor, domain/nutrient-transport.md).
  // Valeurs = computeStageRecipe(stade).kSulfate, T5 arrondi 1107 → 1100 (lisibilité
  // balance, écart 0,6 %). Le
  // plancher porte sur le prélèvement TOTAL, sans crédit compost ni sidedress : ces canaux
  // solides à libération lente ajoutent de la masse au lit, pas de la concentration dans la
  // solution du goutteur — ils ne peuvent pas se substituer au plancher de diffusion.
  // Non monotone T3 > T4 : suit BIOMASS_DEMAND (K T3 4640 vs T4 2040 mg/m²/sem) plus la
  // rampe de rendement.
  // Déclencheurs de révision : SME K solution (dimensionne le plancher précisément, bande
  // admise 10-25 %) ; CE qui grimpe → baisser ; tissu-K qui décroche → monter.
  T1: { mgSulfate: 0, kSulfate: 406,  mnSulfate: 0, znSulfate: 5,  borax: 10, naMolybdate: 0.5 },
  T2: { mgSulfate: 0, kSulfate: 544,  mnSulfate: 0, znSulfate: 8,  borax: 10, naMolybdate: 0.5 },
  T3: { mgSulfate: 0, kSulfate: 989,  mnSulfate: 0, znSulfate: 12, borax: 10, naMolybdate: 0.5 },
  T4: { mgSulfate: 0, kSulfate: 819,  mnSulfate: 0, znSulfate: 15, borax: 10, naMolybdate: 0.5 },
  T5: { mgSulfate: 0, kSulfate: 1100, mnSulfate: 0, znSulfate: 20, borax: 10, naMolybdate: 0.5 },
};
