# Conventions de travail

## Branches

| Branche | Rôle |
|---|---|
| `main` | Versions stables uniquement. Chaque version est taguée (`vX.Y.Z`). |
| `develop` | Intégration du travail en cours. |
| `<type>/<n°issue>-<sujet>` | Une branche par ticket, créée depuis `develop`, par ex. `feat/12-ecran-fin-partie`. |

Chaque branche de ticket est fusionnée dans `develop` via une pull request. En fin de sprint, `develop` est fusionnée dans `main` et taguée.

## Commits

Format [Conventional Commits](https://www.conventionalcommits.org/fr/), en français :

```
type(scope): description courte à l'impératif

Pourquoi ce changement, si ce n'est pas évident.

Closes #12
```

Types : `feat`, `fix`, `test`, `refactor`, `build`, `ci`, `docs`, `chore`.

Jamais de secrets, de `.env`, de dumps SQL ni de `appsettings.Development.json` dans un commit.

## Sprints

- Durée : 2 semaines. Un sprint = un milestone GitHub, avec un objectif.
- Tableau GitHub Projects : Backlog → À faire → En cours → En revue → Terminé.
- Chaque issue porte un label de type (`feat`, `bug`, `tech`, `doc`) et une estimation en jours.
- Fin de sprint : revue écrite dans `docs/sprints/` (fait, glissé et pourquoi, enseignements), mise à jour du `CHANGELOG.md`, tag de version.

## Versions

[SemVer](https://semver.org/lang/fr/) : `MAJEUR.MINEUR.CORRECTIF`. Avant la mise en production publique, on reste en `0.x`.
