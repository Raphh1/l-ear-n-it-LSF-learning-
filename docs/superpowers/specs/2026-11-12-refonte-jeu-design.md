# Refonte du front : « menu de jeu vidéo »

Date : 2026-11-12 · Statut : validée le 2026-11-17 · Ticket : #3 (Sprint 1)
Brainstorm commencé le 2026-11-02, terminé le 2026-11-12. Maquettes : `.superpowers/brainstorm/2026-11-02-refonte-jeu/` (`game-menu.html` pour les écrans G et I, `transitions.html` pour le volet diagonal, `directions-v2.html` pour le style).

## 1. Intention

En ouvrant l'appli, on doit avoir **l'impression de jouer en apprenant**, comme devant le menu d'un jeu vidéo. Le design actuel (néo-brutaliste papier/encre) fait « déjà vu, fait par l'IA », et l'appli paraît « trop simple ». Elle doit pourtant rester compréhensible pour quelqu'un qui n'a jamais joué aux jeux vidéo.

Le porteur garde la main : si un choix ne convient pas à l'usage, on le change.

## 2. Objectifs, non-objectifs, anti-objectifs

**Objectifs**
- Une identité visuelle propre (« angles coupés ») appliquée à **toutes les pages**.
- Des mécaniques de progression visibles : étoiles, déblocage, boss, écran de fin, combos.
- Une appli aussi agréable sur téléphone que sur ordinateur.

**Non-objectifs**
- Pas de carte des niveaux (écran H écarté le 2026-11-12) : un module reste une liste de leçons.
- Pas de monnaie ni de boutique, pas de vies qui se rechargent avec le temps.
- Pas de nouveau mode de jeu, en dehors du boss.

**Anti-objectifs (échec même si « ça marche »)**
- Retomber dans les clichés : dégradés, glassmorphism, arrondis partout, ombres, blobs, écran entièrement coloré.
- Ressembler à Elix.
- Jargon de joueur incompréhensible pour un débutant.
- Bloquer un utilisateur existant hors de leçons qu'il avait déjà faites.

## 3. Direction visuelle « angles coupés » (décidée)

- Fond **blanc**. Blocs aux **couleurs saturées à plat**, coins **coupés en biais** (`clip-path`). Coins carrés partout ailleurs. Ni arrondis, ni ombres, ni dégradés.
- Palette des maquettes : orange `#FF4A1C`, bleu `#00A3E0`, magenta `#E6007E`, vert `#00A86B`, jaune `#FFCC00`, noir `#121212`, gris clair `#F1F1EE`.
- Titres en **Barlow Condensed** 800, majuscules italiques. Texte courant en **Barlow**.
- Boutons d'action **noirs inclinés** (`skewX`).
- **Transition entre les pages : volet diagonal.** Une bande noire, puis une bande colorée, balaient l'écran en biais.

## 4. Écrans et parcours

```
Accueil (menu principal) → Modules → Module (liste de leçons) → Leçon → Partie → Écran de fin
                         → Jouer (cartes de modes) → Partie
```

### 4.1 Barre de joueur (sur toutes les pages connectées)
Barre noire : badge de niveau jaune, pseudo, XP en segments inclinés avec « 340 / 500 XP », série en jours, points. Réduite sur téléphone (niveau, XP, série).

### 4.2 Accueil : menu principal (écran G, décidé)
- À gauche, la liste d'options inclinées **Continuer / Jouer / Défi du jour / Classement**, chacune avec un sous-titre clair (« Alphabet · leçon 3 », « 9 modes de jeu »…). L'option survolée ou sélectionnée s'allonge et prend sa couleur.
- À droite, un grand panneau d'aperçu de l'option sélectionnée, avec un bouton « Jouer ».
- Sur téléphone : le panneau « Continuer » en haut, sur toute la largeur, puis les autres options empilées en bandes.
- Visiteur non connecté : le même menu, avec « Commencer » (inscription) à la place de « Continuer », et sans barre de joueur.

### 4.3 Module : liste de leçons (décidé : pas de carte)
Liste dans le style angles coupés. Chaque leçon affiche ses **étoiles** (0 à 3) ou un **cadenas**. Le **boss** est la dernière entrée de la liste, verrouillé jusqu'à ce que toutes les leçons aient au moins 1 étoile.

### 4.4 Jouer : cartes de modes (écran I, décidé)
Les 9 jeux en grandes cartes colorées : numéro, nom, record personnel, difficulté (3 segments). La carte survolée grandit. Défilement horizontal sur téléphone.

### 4.5 Écran de fin de partie (décidé)
Le score défile, les étoiles tombent une à une, la barre d'XP se remplit, et un bandeau « NIVEAU SUPÉRIEUR » apparaît en cas de passage de niveau. Deux actions : rejouer, continuer.

### 4.6 Toutes les autres pages
Dictionnaire, fiche signe, favoris, profil, classement, défi du jour, révision SRS, paramètres, connexion, inscription, mot de passe oublié, réinitialisation, hors ligne : même système visuel et mêmes composants. Pas de changement de fonctionnalité.

## 5. Mécaniques de jeu (décidées)

1. **Étoiles par leçon :** 1 étoile à partir de 50 % de bonnes réponses, 2 à partir de 80 %, 3 à 100 %. On garde le meilleur résultat.
2. **Déblocage :** la leçon N+1 s'ouvre quand la leçon N a au moins 1 étoile. La première leçon de chaque module est ouverte. **Tous les modules restent ouverts.**
3. **Boss de module :** mélange de tous les signes du module, 3 vies, logique de Survie réutilisée. Il s'ouvre quand toutes les leçons du module ont au moins 1 étoile. Le réussir rapporte un badge et un bonus d'XP.
4. **Écran de fin animé** (section 4.5).
5. **Combos ×2 / ×3** sur les bonnes réponses consécutives, dans les jeux.

## 6. Décisions prises par Claude (à contester si besoin)

- **Calcul des étoiles :** précision `CorrectCount / (CorrectCount + WrongCount)`, en prenant la meilleure partie sur la leçon, **tous modes de jeu confondus**. Calcul côté API à partir des `GameScore` existants. Pas de nouvelle table pour les étoiles.
- **Comptes existants :** les étoiles sont recalculées à partir de l'historique existant. Une leçon marquée terminée (`UserLessonCompletion`) vaut **au moins 1 étoile**. Personne ne perd l'accès à ce qu'il a déjà fait.
- **Parties sans compteur d'erreurs** (par ex. mémoire) : précision calculée sur ce qui est disponible. Si rien n'est disponible, la partie ne donne pas d'étoile. À affiner au plan.
- **Seuils de combo :** ×2 après 3 bonnes réponses d'affilée, ×3 après 6. Retour à ×1 à la première erreur.
- **Micro-animations :** la bonne réponse se remplit en biais, la mauvaise tremble.
- **Vocabulaire clair :** « Niveau », « Série », « Étoiles », « Boss » (expliqué par un sous-titre), « Record ». Pas d'abréviations de joueur.
- **Accessibilité** (exigence, et argument pour la certification) :
  - toutes les animations et la transition respectent `prefers-reduced-motion` (fondu simple ou rien) ;
  - contraste AA du texte sur les aplats (texte noir sur jaune ou vert si le blanc ne passe pas) ;
  - navigation clavier dans le menu et les cartes ;
  - aucune information portée uniquement par la couleur (étoiles et cadenas ont aussi un texte accessible).
- **Doublon de routes :** `/quiz/*` et `/jeux/quiz/*` coexistent. On garde `/jeux/*` et on redirige `/quiz/*`.
- **Leçons de phrases :** mêmes règles d'étoiles et de déblocage (scores du Constructeur).
- **Défi du jour et révision SRS :** pas liés à une leçon, donc pas d'étoiles. Ils gardent leur fonctionnement.
- **Page leçon :** elle réutilise le composant des cartes de modes pour choisir le jeu sur cette leçon.
- **Verrouillage :** indicatif côté front (cadenas, pas de lien). L'API ne refuse pas un score sur une leçon verrouillée : aucun enjeu de sécurité, et ça évite de casser un lien direct.
- **Pas de mode sombre :** le fond blanc fait partie de l'identité.
- **Visiteurs non connectés :** l'accès actuel est conservé, seule la présentation change.
- **Animations :** on réutilise `framer-motion`, déjà installé. Pas de nouvelle bibliothèque.
- **Nettoyage :** à la fin, on supprime les jetons et polices de l'ancien style (Bricolage Grotesque, Atkinson Hyperlegible, couleurs papier/encre) et les composants devenus inutiles.

## 7. Contraintes

- Stack inchangée : Next.js (App Router), Tailwind (jetons dans `globals.css` via `@theme`), ASP.NET Core 8 côté API.
- Préférences du porteur : fichiers courts, composants réutilisables, expliquer chaque fichier avant de l'écrire.
- Suivi : un ticket GitHub par lot, une branche et une PR par ticket, commits conventionnels en français (voir `CONTRIBUTING.md`).
- Tests : chaque calcul côté API (étoiles, déblocage, boss) a ses tests xUnit. Les composants clés (barre de joueur, carte de mode, écran de fin) ont leurs tests Vitest.

## 8. Découpage proposé en lots (futurs tickets)

| # | Lot | Contenu |
|---|---|---|
| 1 | Socle visuel | Jetons, polices Barlow, composants de base (bloc coupé, bouton incliné, titre condensé, barre de joueur), transition volet diagonal, layout |
| 2 | API progression | Étoiles par leçon, état verrouillé/ouvert, boss disponible, exposés dans les endpoints modules et leçons, rétrocompatibilité des comptes |
| 3 | Accueil | Menu principal G (connecté et visiteur), version téléphone |
| 4 | Modules et leçons | Liste des modules, liste des leçons avec étoiles, cadenas et boss |
| 5 | Page Jouer | Cartes de modes I avec records et difficulté |
| 6 | Coquille de jeu | Combos, micro-animations, écran de fin animé, partagés par les 9 jeux |
| 7 | Boss | Mode boss (3 vies), badge, bonus d'XP |
| 8 | Autres pages | Dictionnaire, favoris, profil, classement, défi, SRS, paramètres, auth, hors ligne |
| 9 | Nettoyage | Suppression de l'ancien style, redirection `/quiz`, vérification de l'accessibilité |

Ordre : 1 et 2 d'abord (en parallèle possible), puis 3 à 7, puis 8 et 9.

## 9. Laissé au plan

Structure exacte des composants et des fichiers, forme des DTO, ordre des tâches à l'intérieur de chaque lot, difficulté affichée pour chaque mode, contenu du panneau d'aperçu pour chaque option du menu.
