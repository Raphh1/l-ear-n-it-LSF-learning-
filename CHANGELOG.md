# Journal des versions

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Versions selon [SemVer](https://semver.org/lang/fr/).

## [Non publié]

## [0.1.0] - 2026-11-12

État de référence avant le premier sprint.

### Ajouté
- Dictionnaire LSF : catalogue de signes avec vidéos, sens multiples et variantes.
- Modules et leçons, constructeur de phrases.
- 9 modes de jeu : quiz, vitesse, inverse, mémoire, survie, révision, constructeur, révision SRS (SM-2), défi du jour.
- Progression : XP, niveaux, séries, badges, quêtes journalières, historique des parties, classements.
- Comptes : inscription, connexion par cookie httpOnly, mot de passe oublié, suppression de compte, révocation des sessions.
- PWA : installation, page hors ligne.
- Déploiement Docker derrière Caddy (HTTPS automatique).
- Tests unitaires : 73 côté API (xUnit), 39 côté front (Vitest).

### Problèmes connus
- 2 tests front en échec, `progressStore.test.ts` ne compile plus.
- Vidéos lues depuis Elix sans autorisation de réutilisation (voir la feuille de route de certification).
