# Décembre — Changelog

Append-only log of substantive changes (recipe edits, REQ additions, model architecture, page restructuring). Read at start of any session touching app state, especially under parallel Claude sessions.

Format: `YYYY-MM-DD HH:MM — brief description`. One line per change. Most recent at top. Keep ~10 entries; older history lives in `git log`.

## 2026-10-30

- **SME tomates chapelle 3 (2026-09-23) versée dans `nutrition/doc/`** (Agro-Enviro-Lab SO-0932654, étiquette « Serre T2 ») — **premier test de la chapelle 3 ; tous les tests tomate précédents = chapelle 1**, ne pas enchaîner en tendance. pH **7,21**, CE **0,53** ; RAS 6 ; Mn/Zn/Mo sous détection. Index `doc/CLAUDE.md` amendé.

- **Analyses sol laitue du 2026-10-20 versées dans `nutrition/doc/`** (Berger 40844 Mehlich-3 + 40845 SME, Laitue-sol). pH 6,07–6,08 (août 6,65) ; **CE SME 5,91** (août 2,30 — record, nitrate 538 + sulfate 1561) ; RAS 0,62 ; P SME 4 ; B M3 0,5 ppm toujours maigre. Index `doc/CLAUDE.md` amendé.

## 2026-10-21

- **Réserve semis laitue 10 % → 3 %** (`NURSERY_BACKUP_FRACTION`, `yield-range/domain/data.js` + spec). Décision Guillaume : 29 plateaux semés/sem au lieu de 31 (3r8, 2 planches = 900 têtes → 927 cellules). Cascade : sem. 1-2 29 · sem. 3 58 · sem. 4-5 116 ; tablettes requises S3 15 · S4a 15 · S4b 14 (croquis, auto). Build inchangé : 63 bacs inondés, 3 en surplus. Docs : `domain/lettuce/sequence.md` § Tray demand, `protocol/sequence-lettuce-full-production.md`, `Flood Irrigation/project.md` § Footprint, `schedule/timeline.md`.

## 2026-09-26

- 15:10 — **Semis : gypse 0,14 → 0,20 g/L** (`STORED_RECIPE.nursery.fertigation` + `NURSERY_RECIPE_DEFAULT`). La fertigation couvre seule le besoin Ca (464 ≥ 448 mg/plateau/sem) à crédit terreau OM2 nul. Snapshot capturé dans RECIPE_HISTORY. Nouvelle entrée spec `default-recipe-ca-covers-full-demand` + test. CE prédite 0,84 → 0,89 (plafond 1,0) ; stock A 1:10 = 2,0 g/L (≈ 400 g / 200 L). `npm run check` 151/2 (mêmes 2 rouges tomate pré-existants).

## 2026-09-14

- 21:40 — **Registre : journal de pesées hebdo été 2026, cohortes H–S** (`yield-range/domain/doc/data-points.md`). Feuille « Poids des têtes de laitue » transcrite : 4 cohortes 50-cell (semis juin, champ 4r×6") + 8 cohortes pots 3 po (semis juil–août, champ 3r×8"), semaines pépinière 3-4-5 puis champ 1-2. Première série pépinière→champ. Pots 3 po : sem 5 18-26 g, champ sem 1 20-32 g, champ sem 2 32-47 g — le modèle donne 179 / 233 g aux mêmes jours (choc de transplant absent, taux champ ~4× trop rapide). Conditions notées : problèmes d'arrosage sur toute la série, fertigation 5×/sem depuis ~2026-08-31 (cohortes P–S seulement), montaison observée, ré-espacement 2:1 en semaine 4 → passe en semaine 3 dès la cohorte S. Données seules, aucun refit. ⚠ jours de lecture non datés, base de sélection et n non notés, colonnes Max/Average hors capture.

## 2026-08-25

- **2026-08-25 — STORED_RECIPE.nursery.fertigation : rééquilibrage complet du semis (/retire-recipe, snapshot dans RECIPE_HISTORY).** Bilan 5 sem à la cible 50 g (`working files/nursery-5wk-balance.md`) : recette poisson-dominante = N/P en surplus, K −65 % / Ca −42 % / Mg −24 %, micros quasi absents, Na:Ca 70:1. Nouvelle recette : N/P à l'exact du besoin résiduel (crédits farine 75 % / OM2 50 %), K₂SO₄ + gypse + MgSO₄ (sels miniers), kelp retiré (source Na dominante) remplacé par bouteille stock micros Mn/Zn/Cu/Solubor (permis avec conditions — carence documentée : tissu août + bilan ; Cu au registre cuivre). Volume corrigé à 2 L/plateau (l'opérateur observe que 120 mL/pot dégoutte au sol) → 5 seaux/sem sous le plafond CE (prédit 0,84, headroom 0,16 ; à mesurer au premier seau — facteurs CE des sels cert 2). Rinçage hebdo à l'eau claire remplace le lessivage par apport. Page opérateur : jours (mar/mer/ven/sam/dim), recette par arrosage, carte bouteille stock ; Bilan semis suit via le modèle. Specs plancher N/P réécrites en base résiduelle ; learning `k-ca-mg-under-supply-accepted-at-default` fermé. `npm run check` : **150/2**, mêmes 2 rouges pré-existants.

## 2026-08-23

- **2026-08-23 — STORED_RECIPE.lettuce.fertigation : ZnSO₄ réintroduit à 8 g/sem (3× la dose pré-coupe, /retire-recipe, snapshot dans RECIPE_HISTORY).** Même essai drip généreux que la tomate : la coupe du 2026-07-11 a perdu sur le Zn (tissu sous plancher, SME 0,01, zéro apport depuis) ; 2,7 → 8 g ZnSO₄ par cuve hebdo (bloc 136,8 m²), coût CE nul. Miroir opérateur (`LETTUCE_FERTIGATION_RECIPE`) tenu en pas. Arbitrage au prochain panel — rotation ~6 sem : le SME sera la moitié la plus informative. ZnSO₄ Ecocert CAN/CGSB-32.311. `npm run check` : **150/2**, mêmes 2 rouges pré-existants.
- **2026-08-23 — STORED_RECIPE.tomato.fertigation : MnSO₄ coupé à 0 tous stades + ZnSO₄ triplé (T1 5 / T2 8 / T3 12 / T4 15 / T5 20 g, /retire-recipe, snapshot 3 canaux dans RECIPE_HISTORY).** Suites du correctif de livraison : (1) Mn — tissu d'août tenu à livraison zéro depuis le 2026-07-11 → le sol couvre le Mn à pH 6,5, la ligne drip nourrissait un besoin déjà comblé ; tripwire = tissu Mn vers le plancher → réintroduire. (2) Zn — efficacité canal 0,75 jamais mesurée + SME Zn 0,01 + feuille déjà déficiente → essai drip généreux 3× : feuille remonte = drip viable ; SME toujours 0,01 = canal mort, bascule foliaire. Essai mono-variable (seule ligne nouvelle en cuve). MnSO₄/ZnSO₄ Ecocert CAN/CGSB-32.311. `npm run check` : **150/2**, mêmes 2 rouges pré-existants.
- **2026-08-23 — Correctif de livraison Mn/Zn fertigation tomate : les doses stockées le 2026-07-11 n'ont jamais atteint la fiche de pesée.** La page fertigation opérateur ne rendait que 4 produits (K, Mg, Solubore, Molybdène) — les lignes MnSO₄/ZnSO₄ du STORED (retrait sprays A+B) n'ont jamais paru → très probablement jamais mises en cuve (2026-07-11 → 2026-08-23). Relit le panel d'août : le tissu Zn divisé par 2 + SME Zn 0,01 se lisent SANS apport Zn d'aucun canal (le verdict « Zn fertigé fixé par le sol » n'a jamais été testé) ; le Mn tenu sans dose confirme la voie sol ouverte à pH 6,5. Correctifs : la page rend maintenant toutes les lignes du STORED (doses < 10 g à la décimale — Mo affiche 0,5 g et non 1 g) ; entrée correctif dans `RECIPE_HISTORY` (audit cert, aucune valeur de recette changée). Essai du canal fertigation Zn effectif dès la prochaine cuve ; arbitrage drip vs foliaire au prochain SME + tissu. `npm run check` : **150/2**, mêmes 2 rouges pré-existants.

## 2026-08-20

- **2026-08-20 — Panel labo complet du 2026-08-04 versé dans `nutrition/doc/` (3 PDF + index).** Même échantillonnage pour les trois : `mehlich-3 - 2026-08-05 laitue + tomates chapelle 1.pdf` (SO-0923478 Laitue-sol / SO-0923479 Tomate-sol — P/K/Ca/Mg/S/Zn/Mn tous TR, seul B maigre ; cases pH/CEC vides à vérifier), `SME - 2026-08-05 laitue + tomates chapelle 1.pdf` (pH 6.65/6.62, CE laitue 4.01 → **2.30**, P-PO4 3/2 — remonte à peine, RAS 5/8), `tissus - 2026-08-05.pdf` (TI-0026059 tomate : déficient P/Ca/Zn ; TI-0026060 laitue : déficient P/K/Ca/Mg/Zn, **Na 3116 ppm**). Premier trio sol-banque + sol-disponible + feuille du même jour — base de la lecture avril → août.
