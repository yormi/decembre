// Hand-stored fertigation recipe (PA Taillon, Climax Conseils, April 8 2026).
// Source PDF: farm info/fertigation oligos éléments tomate avril.pdf.
// T1-T5 revus 2026-06-03 : canal fertigation dépouillé à K + Mg + micros
// non-verrouillés (B + Mo). Oligos cationiques Fe / Zn / Mn / Cu retirés du
// fertigation — verrouillés à pH sol ~7,4 (inefficaces en racinaire), livrés
// en foliaire (absorption cuticulaire contourne le lockout). Mo conservé/réajouté
// 2026-06-04 : le molybdate (anionique) devient PLUS disponible à pH élevé →
// absorption racinaire élevée à 7,4, comme le bore (NaMolybdate 0,5 g tous stades,
// ~100 % demande). Bore = oligo fertigation, 10 g tous
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
  // K + Mg + B (Solubore 10 g, clé `borax`) + Mo (NaMolybdate 0,5 g). Area 382,6 m² (7 planches).
  T1: { mgSulfate: 276,  kSulfate: 410,  borax: 10, naMolybdate: 0.5 },
  T2: { mgSulfate: 873,  kSulfate: 1297, borax: 10, naMolybdate: 0.5 },
  T3: { mgSulfate: 723,  kSulfate: 1689, borax: 10, naMolybdate: 0.5 },
  T4: { mgSulfate: 1171, kSulfate: 2929, borax: 10, naMolybdate: 0.5 },
  T5: { mgSulfate: 1000, kSulfate: 5500, borax: 10, naMolybdate: 0.5 },
};
