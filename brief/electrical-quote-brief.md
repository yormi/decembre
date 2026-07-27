# Demande de soumission électrique — Décembre (brouillon d'alignement)

Draft to align on before producing the clean PDF for the
electrician. Québec City site. Three scopes, quoted as separate
line items. Hydro-Québec side handled by us (engineer already
engaged; ~400 $ pour le raccordement au triphasé en bout de rang).

**Type de soumission demandée : estimation budgétaire rapide,
précision ±10 000 $.** Pas besoin de visite détaillée ni de
soumission ferme à ce stade — un ordre de grandeur vite obtenu
vaut mieux qu'un chiffre exact dans un mois. Soumission ferme
suivra une fois le budget validé.

**Vos recommandations sont bienvenues.** Ce document décrit
notre intention, pas une conception finale — si vous voyez une
meilleure approche (calibre de transformateur, découpage des
panneaux, choix d'appareils, méthode de tranchée), proposez-la.


## Scope 1 — Nouvelle entrée 600 V, 400 A

### Ce qu'on demande

- Nouvelle entrée électrique (ou mise à niveau) **347/600 V,
  triphasé, 400 A** — service commercial Hydro-Québec.

- **Panneau de distribution 600 V, 400 A** au bâtiment principal.

- **Remplacer le panneau existant 120/240 V 200 A par un
  panneau 120/240 V 400 A**, alimenté du panneau 600 V via un
  **transformateur abaisseur ~112,5 kVA** (600 V →
  120/240 V ; 400 A × 240 V = 96 kVA). Reconnexion des
  circuits existants dans le nouveau panneau.

- **Hydro-Québec : pris en charge par nous** (ingénieur HQ déjà
  au dossier ; raccordement au triphasé ~400 $). L'électricien
  fournit le **permis RBQ** et la déclaration de travaux.

### Infos fournies avec la demande

- Triphasé disponible au bout du rang ; raccordement confirmé
  par l'ingénieur Hydro-Québec.

- Nouveau panneau **dans la grange, zone non chauffée** —
  prévoir boîtiers adaptés (condensation possible).

- Panneau 600 V et panneau 240 V **côte à côte**
  (transformateur à proximité immédiate).

- Charge existante : panneau 240 V actuel, entrée 200 A
  (liste des charges principales à joindre au PDF).

- Photos de l'entrée actuelle et du compteur (à joindre au PDF).

- Calcul de charge : côté 240 V jusqu'à 96 kVA + 160 kW
  chauffage + ~10–15 kW ventilateurs (Scope 2) + 70 kW DEL
  (Scope 3) ≈ 340 kVA — sous la capacité 347/600 V 400 A
  (~415 kVA), à faire confirmer par l'électricien.

- **Tarif visé : DP (biénergie) avec option serre** — appoint
  propane existant assure le chauffage en pointe. La biénergie
  peut demander du filage de contrôle ou un compteur
  particulier ; l'électricien coordonne le mesurage avec
  Hydro-Québec.


## Scope 2 — Chauffage 160 kW en serre (item séparé)

### Contexte

- Serre à **20 m** des panneaux.

- Distribution d'air par **conduits + tubes de polyéthylène
  perforés** (décision prise) → aérothermes de conduit
  (duct heaters) + ventilateurs, PAS des aérothermes autonomes.

### Charge et alimentation

- **160 kW** résistif, **600 V triphasé ≈ 154 A** — natif 600 V,
  pas de 2ᵉ transformateur, filage plus petit.

- 2–4 aérothermes de conduit de 40–80 kW (ex. Thermolec
  (Montréal), Chromalox) + 1–2 moteurs de ventilateur
  (~10–15 HP total, à ajouter au calcul de charge).

- **Sous-panneau 600 V dans la serre** (ex. 200 A), disjoncteurs
  par banc d'éléments.

- Alimentation **enfouie sur 20 m** ; **tranchée creusée par
  nous** — l'électricien spécifie profondeur, conduit et lit de
  sable au code, on exécute.

### Spécifications des appareils

| Spec | Valeur |
|---|---|
| Type | éléments tubulaires à ailettes (pas fil nu — air humide) |
| Gaine | Incoloy 800/840 |
| Tension | 600 V, 3φ, delta |
| Certification | cUL / CSA (requis pour inspection RBQ) |
| Boîtier | résistant à la corrosion (époxy ou inox — serre humide + poussière d'engrais) |
| Débit d'air total | ~18 000 CFM (~30 000 m³/h) pour 160 kW à ΔT 25 °C |
| Température de soufflage | **35–45 °C max** — les tubes poly tolèrent ~50 °C continu |

### Contrôle

- **Ventilateurs en marche continue 24/7** (appui aux
  ventilateurs HAF) — circuits dédiés toujours alimentés,
  séparés des circuits de chauffage.

- **Chauffage commandé par Orisha** (contrôleur de serre),
  **contact sec 24 V par étage** — Orisha offre sortie sèche ou
  mouillée ; prévoir contact sec pilotant la bobine de chaque
  contacteur. Filage de contrôle panneau ↔ Orisha au scope.

- **Étagement : une sortie Orisha par appareil/étage**
  (ex. 4 × 40 kW = 4 contacts). Orisha peut fournir une sortie
  par élément si nécessaire — nombre final d'étages à fixer
  avec le choix des appareils.

- **Signal biénergie (tarif DP)** : basculer chauffage
  électrique → propane en période de pointe ; prévoir le relais
  / contact du signal Hydro-Québec accessible à Orisha.

### Interverrouillages (au code — à inclure au scope)

- **Interrupteur de preuve de débit d'air** — chauffage
  impossible sans ventilateur en marche, même si Orisha
  demande de la chaleur. Câblé en série, indépendant d'Orisha.

- Limite haute automatique + limite de secours à
  réarmement manuel sur chaque appareil.


## Scope 3 — Éclairage DEL 70 kW, tomates (item séparé, potentiel)

### Contexte

- Projet potentiel — chiffrer maintenant pour planifier ;
  installation possiblement dans une phase ultérieure.

- Luminaires horticoles type Philips GreenPower toplighting,
  **alimentation 347 V** (ligne-neutre du service 347/600 V —
  confirmer que le service est en étoile avec neutre).

### Charge et alimentation

- **70 kW ≈ 67 A** au 600 V triphasé ; ~70–110 luminaires de
  645–1040 W répartis sur les 3 phases.

- Sous-panneau ou panneau d'éclairage 347 V dans la serre
  tomates ; circuits d'éclairage multiples.

- Emplacement : **même serre que le chauffage (Scope 2)** —
  même tranchée ; alimenter l'éclairage depuis le sous-panneau
  600 V de la serre (le dimensionner en conséquence :
  154 A chauffage + 67 A DEL + ventilateurs → **sous-panneau
  ~400 A** plutôt que 200 A). **Prévoir la tranchée et le
  conduit du Scope 2 assez gros pour ce scope dès maintenant**
  (ou un conduit de réserve) — creuser une fois.

- Contrôle : marche/arrêt par contacteur, signal Orisha
  (même principe que le chauffage).

- Note tarif DP : DEL + chauffage électrique simultanés en
  hiver
