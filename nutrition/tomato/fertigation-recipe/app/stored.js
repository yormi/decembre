// Hand-stored fertigation recipe (PA Taillon, Climax Conseils, April 8 2026).
// Source PDF: farm info/fertigation oligos éléments tomate avril.pdf.
// Tank 170 L diluted at 2% Dosatron → 8 517 L solution/week. Area 382,6 m²
// (7 planches × 54,7 m²). Per-stage T1-T5 = grams to dissolve in the master
// tank for ONE week. Oligos constant across stages (PA's design — anchored
// on tissue baseline, not yield-scaled). K and Mg ramp with stage yield.
// T6 retired 2026-05-07 (RECIPE_HISTORY entry); T1-T5 only.
//
// EDITS REQUIRE /retire-recipe SKILL FIRST. Path `STORED_RECIPE.tomato.fertigation`
// preserved verbatim; the skill greps for this identifier.
window.STORED_RECIPE.tomato.fertigation = {
  // PA Taillon (Climax Conseils), April 8 2026.
  // Tank 170 L → 8 517 L solution at 2% injection. Area 382,6 m² (7 planches).
  // Source: farm info/fertigation oligos éléments tomate avril.pdf
  T1: { mgSulfate: 276,  kSulfate: 410,  feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9, naMolybdate: 1 },
  T2: { mgSulfate: 873,  kSulfate: 1297, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9, naMolybdate: 1 },
  T3: { mgSulfate: 723,  kSulfate: 1689, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9, naMolybdate: 1 },
  T4: { mgSulfate: 1171, kSulfate: 2929, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9, naMolybdate: 1 },
  T5: { mgSulfate: 1396, kSulfate: 3489, feSulfate: 20, znSulfate: 4, mnSulfate: 7, cuSulfate: 1, borax: 9, naMolybdate: 1 },
};
