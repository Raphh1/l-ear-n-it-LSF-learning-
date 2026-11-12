# L'ear'n it × Certification RNCP39583 — feuille de route

Date : 2026-11-12 · Statut : en attente de validation

## 1. Intention

Présenter l'ear'n it (plateforme web gamifiée d'apprentissage de la LSF) comme **projet unique de certification** du titre « Expert en développement logiciel » (RNCP39583, Ynov Bordeaux, M2 2026-2027).

Le projet est né d'une initiative personnelle : constat qu'il n'existe pas vraiment de site pour apprendre la LSF de façon ludique. Le porteur ne pratique pas la LSF.

**Verdict :** le projet a les épaules. Le code couvre déjà une grande partie de BC02. Le travail restant porte surtout sur la mise en ligne, la CI/CD, l'exploitation, le pilotage tracé et la formalisation du cadrage.

## 2. Contraintes (source : support Ynov « Modalités évaluations 26-27 » + référentiel France Compétences)

- Mise en situation professionnelle **réelle ou fictive**, livrables individuels et uniques, un seul projet pour les 4 blocs.
- Un bloc est validé si ≥ 50 % de ses compétences sont acquises **et** aucune compétence éliminatoire n'est non acquise.
- Livrables déposés sur myCertif (date limite communiquée plus tard).

| Bloc | Modalité | Date |
|---|---|---|
| BC01 Cadrer | Oral 45 min (30 + 10 échanges), devant un client fictif ou réel | 12-16/07/2027 |
| BC02 Concevoir et développer | Dossier ≤ 30 pages + code source | 19-23/07/2027 |
| BC04 Maintenir en condition opérationnelle | Dossier écrit ≤ 20 pages | 16-20/08/2027 |
| BC03 Coordonner et piloter | Oral 45 min avec démo | 06-27/09/2027 |

Disponibilité du porteur : travail hebdomadaire régulier jusqu'aux échéances. Budget : « pas trop cher ».

## 3. Décisions prises

- **Cadrage BC01 face à un commanditaire**, et non un pitch de porteur de projet. Le commanditaire est une association de familles d'enfants sourds : réelle si le contact du milieu accepte ce rôle, fictive sinon.
- **Entretien avec une personne du milieu** (association, interprète, prof de LSF, parent d'enfant sourd). Il sert de base à C1.1.1 et C1.1.2. Le porteur pense pouvoir trouver ce contact.
- **Pas de refonte d'architecture.** La stack actuelle (ASP.NET Core 8, Next.js, PostgreSQL, Docker Compose, Caddy) est conservée et justifiée a posteriori dans l'étude comparative. Le fait que le développement ait précédé le cadrage est assumé honnêtement.
- **Découpage en 4 phases** (section 5), validé par le porteur.

## 4. Choix par défaut proposés par Claude (non contestés, à confirmer)

- Hébergement : VPS unique chez un hébergeur européen (OVH, Hetzner, Scaleway…), environ 5 à 8 €/mois, plus un nom de domaine (environ 10 €/an). Cible : < 100 €/an. **Prix à revérifier.**
- Deux environnements : préprod et prod.
- CI/CD : GitHub Actions (repo `Raphh1/l-ear-n-it-LSF-learning-`).
- Suivi : GitHub Projects, sprints de 2 semaines.
- Supervision : outils gratuits ou auto-hébergés (sonde de disponibilité, logs structurés, remontée d'erreurs). Outils précis à choisir.

## 5. Phases

| Phase | Période | Contenu | Blocs nourris |
|---|---|---|---|
| 1. Fondations | nov. à déc. 2026 | Commiter le travail en attente et assainir l'historique git ; GitHub Projects en sprints ; CI (build + tests + lint) ; mise en ligne préprod/prod ; vérification de la licence Elix ; recherche du contact du milieu | BC02, BC03, BC04 |
| 2. Terrain | janv. à mars 2027 | Entretien(s) ; vérification de l'hypothèse sur le public ; bêta-testeurs ; supervision et alertes ; collecte des anomalies ; journal des versions ; une trace écrite par sprint (objectifs, écarts, arbitrages) | BC01, BC03, BC04 |
| 3. Cadrage formalisé | avr. à juin 2027 | Rédaction des 11 livrables BC01 à partir du vécu ; support de l'oral ; itérations issues des retours | BC01, BC02 |
| 4. Rendus | juil. à sept. 2027 | Oral BC01, dossier BC02, dossier BC04, oral BC03 (démo de la dernière version) | tous |

Principe directeur : chaque phase produit la matière des dossiers. Rien n'est écrit « pour l'école » sans avoir été vécu.

## 6. Correspondance avec les compétences

### BC01 — Cadrer (rien de formalisé, tout est à produire)
| Compétence | Livrable prévu | Matière |
|---|---|---|
| C1.1.1 Parties prenantes | Cartographie : porteur/dev, commanditaire (association), apprenants (proches de sourds, parents, soignants, enseignants, curieux), communauté sourde, fournisseur de contenu (Elix / Signes de sens), hébergeur, jury | Entretien + bêta |
| C1.1.2 Analyse de la demande | Compte rendu d'entretien, besoins par partie prenante, problématique, pistes de solution | Entretien |
| C1.2.1 Opportunités / menaces | SWOT incluant l'impact environnemental, la sécurité, les dépendances (Elix) | Veille + coûts réels |
| C1.2.2 Faisabilité / audit | Audit de l'existant : stack, BDD, applis concurrentes, contraintes (hébergement, volume, utilisateurs, budget, délais) | Repo + benchmark |
| C1.2.3 Risques | Registre des risques (perte de données, interruption, dégradation, sécurité) + indicateurs | Supervision phase 2 |
| C1.3.1 Veille | Méthode, outils, sources ; volet réglementaire : RGPD, RGAA, European Accessibility Act (en vigueur depuis juin 2025), licence des contenus | Veille continue |
| C1.3.2 Étude comparative | Comparaison des stacks et des hébergeurs (sécurité, système, réseau, accessibilité, environnement) | Choix existants |
| C1.4.1 Charge | Diagramme ou cahier des charges fonctionnel hiérarchisé, charge en jours-homme | Fonctionnalités existantes |
| C1.4.2 Budget | Budget prévisionnel (dev, infra, licences…) : MVP réel comparé à un projet professionnel avec équipe | Coûts réels |
| C1.5 Architecture | Schémas légendés (formalisme à choisir et justifier, par ex. C4 + UML), sécurité, éco-conception | Repo |
| C1.6 Argumentaire | Support d'oral, traitement des objections | Tout ce qui précède |

### BC02 — Concevoir et développer
- Déjà là : 14 features API, 9 modes de jeu, SRS (SM-2), badges, quêtes, rate limiting, environ 73 tests xUnit et 5 fichiers Vitest, Dockerfiles et docker-compose.
- Manque : CI, déploiement progressif, cahier de recettes, plan de correction des bogues, documentation d'exploitation, prototype et justification de l'accessibilité.

### BC03 — Piloter (le plus délicat en solo)
- Planning, indicateurs, arbitrages des écarts, comptes rendus au commanditaire avec points de validation, démo de fin.
- « Piloter l'équipe / prise en compte du handicap / besoins en compétences » : à traiter en assumant le travail solo (par ex. comment le porteur a comblé son absence de compétence en LSF, et quelle équipe faudrait-il pour un vrai projet). Approche exacte à définir.

### BC04 — Maintenir (impossible sans mise en ligne)
- Mises à jour sécurisées des dépendances, supervision et alertes, collecte des anomalies, correctif livré via CI/CD, journal des versions, améliorations tirées des indicateurs et des retours, collaboration avec le support.

## 7. Non-objectifs et anti-objectifs

- Non-objectifs : réécrire l'architecture ; ajouter des fonctionnalités de jeu juste pour en ajouter.
- Anti-objectifs (échec même si « ça marche ») : des livrables fabriqués de toutes pièces sans vécu derrière ; une appli jamais en ligne au moment du dossier BC04 ; un pilotage non tracé (sans tickets ni historique).

## 8. Risques et points ouverts

1. **Règlement spécial de la certification** (liste des compétences éliminatoires) : non disponible, à demander au responsable pédagogique. C'est la priorité.
2. **Licence des vidéos Elix** (environ 670 signes, lues directement depuis le stockage d'Elix) : vérifié le 2026-11-12. Les CGU n'accordent pas de licence ouverte. Les vidéos restent la propriété de leurs auteurs, la consultation est permise via Elix, toute reproduction exige une autorisation expresse et tout usage commercial un accord des auteurs. Un passage en CC-BY-SA avait été évoqué avec Wikimedia France en 2017, sans confirmation. → Écrire à Signes de sens (contact@elix-lsf.fr) avant toute mise en ligne publique. Signes de sens est aussi une partie prenante, voire un partenaire possible. Plan B : vidéos sous licence libre (Wikimedia Commons) ou contenu limité.
3. **Hypothèse sur le public** (majoritairement des entendants) : à confirmer par l'entretien.
4. **Contact du milieu** : à trouver en phase 1.
5. **Historique git** : 11 commits et beaucoup de modifications non commitées. À assainir dès maintenant.
6. **Mise en ligne** : actuellement bloquée par la variable `DOMAIN` du docker-compose.

## 9. Laissé à la planification

Ordre détaillé des tâches de la phase 1, choix précis des outils de supervision, formalisme des schémas, gabarits des comptes rendus de sprint, structure des dossiers BC02 et BC04.
