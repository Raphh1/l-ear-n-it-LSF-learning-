#!/usr/bin/env python3
"""
generate_phrases.py — Génère des phrases LSF cohérentes via l'API Claude.

Pour chaque catégorie de signes en DB, Claude génère des phrases naturelles
respectant la grammaire LSF (topic-commentaire, verbe en fin, pas d'articles).

Usage :
    python3 scripts/generate_phrases.py
    python3 scripts/generate_phrases.py --output lsf-api/Data/seed-phrases-generated.json
    python3 scripts/generate_phrases.py --append lsf-api/Data/seed-phrases.json
    python3 scripts/generate_phrases.py --dry-run       # liste les catégories sans appeler l'API
    python3 scripts/generate_phrases.py --category "Aliments et cuisine"  # une seule catégorie

Prérequis :
    pip install psycopg2-binary anthropic
    export ANTHROPIC_API_KEY=sk-ant-...
"""

import argparse
import json
import os
import sys
import time
from collections import defaultdict

try:
    import psycopg2
except ImportError:
    print("❌ psycopg2 manquant. Lance : pip install psycopg2-binary", file=sys.stderr)
    sys.exit(1)

try:
    import anthropic
except ImportError:
    print("❌ anthropic manquant. Lance : pip install anthropic", file=sys.stderr)
    sys.exit(1)

DEFAULT_DB      = os.environ.get("LSF_DB_DSN")
MODEL           = "claude-haiku-4-5-20251001"
PHRASES_PER_CAT = 12   # phrases générées par catégorie
MAX_SIGNS_SHOWN = 40   # max de signes envoyés dans le prompt (les plus courants d'abord)
DELAY_BETWEEN   = 0.5  # secondes entre chaque appel API

LSF_GRAMMAR_RULES = """
RÈGLES DE GRAMMAIRE LSF À RESPECTER ABSOLUMENT :
1. Structure de base : [MARQUEUR TEMPOREL] SUJET TOPIC VERBE [NÉGATION]
2. Pas d'articles (pas de "le", "la", "un", "une" dans la gloss LSF)
3. Pas de conjugaison : verbes à la forme de base (MANGER, ALLER, AVOIR...)
4. Pronoms : MOI, TOI, LUI, ELLE, NOUS, VOUS, EUX
5. Marqueurs temporels EN DÉBUT de phrase : HIER, AUJOURD'HUI, DEMAIN, MATIN, SOIR, MAINTENANT
6. Questions : mot interrogatif EN FIN de phrase (OÙ, QUOI, COMMENT, POURQUOI, QUAND, COMBIEN, QUI)
7. Négation : PAS après le verbe (MOI MANGER PAS)
8. Intensité : TRÈS ou BEAUCOUP avant ou après l'adjectif/verbe
9. N'utilise QUE des mots de la liste de signes fournie + les pronoms/marqueurs de base
   (MOI, TOI, LUI, ELLE, NOUS, VOUS, EUX, PAS, TRÈS, BEAUCOUP, OÙ, QUOI, COMMENT,
    POURQUOI, QUAND, COMBIEN, QUI, AVOIR, ÊTRE, ALLER, VOULOIR, AIMER, HIER,
    AUJOURD'HUI, DEMAIN, MATIN, SOIR, MAINTENANT, BIEN, MAL, ENCORE, DÉJÀ)
"""

PROMPT_TEMPLATE = """Tu es un expert en Langue des Signes Française (LSF).

Génère exactement {n} phrases pour apprendre le vocabulaire de la catégorie "{category}".

Signes disponibles dans cette catégorie : {signs}

{grammar_rules}

CONSIGNES :
- Chaque phrase doit utiliser AU MOINS UN signe de la liste ci-dessus
- Varie les structures (affirmation, question, négation, avec marqueur temporel)
- Les phrases doivent être naturelles et utiles dans la vie quotidienne
- Difficulté : 1 (simple, 3-4 signes), 2 (intermédiaire, 4-6 signes), 3 (avancé, 6+ signes)
- Génère un mélange : ~50% difficulté 1, ~35% difficulté 2, ~15% difficulté 3

Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ou après :
[
  {{
    "textFr": "phrase en français naturel",
    "textLsf": "GLOSS LSF EN MAJUSCULES",
    "difficulty": 1,
    "tags": ["tag1", "tag2"],
    "signWords": ["mot1", "mot2"]
  }}
]

"signWords" = liste des signes utilisés (en minuscules, tels qu'ils apparaissent dans la liste fournie).
"""


def fetch_signs_by_category(dsn: str, only_new: bool = False) -> dict[str, list[str]]:
    """Retourne dict catégorie -> liste de mots (triés alphabétiquement).
    only_new : ne garde que les signes utilisés dans aucune phrase."""
    conn = psycopg2.connect(dsn)
    with conn.cursor() as cur:
        cur.execute(f"""
            SELECT c."Name", s."Word"
            FROM "Signs" s
            JOIN "Categories" c ON s."CategoryId" = c."Id"
            WHERE s."IsPublished" = true
              AND s."VideoUrl" IS NOT NULL
              AND s."VideoUrl" != ''
              {'AND s."Id" NOT IN (SELECT "SignId" FROM "PhraseSigns")' if only_new else ''}
            ORDER BY c."Name", s."Word"
        """)
        rows = cur.fetchall()
    conn.close()

    result: dict[str, list[str]] = defaultdict(list)
    for cat_name, word in rows:
        result[cat_name].append(word)
    return dict(result)


def generate_phrases_for_category(
    client: anthropic.Anthropic,
    category: str,
    signs: list[str],
    n: int = PHRASES_PER_CAT,
) -> list[dict]:
    """Appelle Claude pour générer des phrases pour une catégorie."""
    signs_sample = signs[:MAX_SIGNS_SHOWN]
    signs_str = ", ".join(signs_sample)
    if len(signs) > MAX_SIGNS_SHOWN:
        signs_str += f" (+ {len(signs) - MAX_SIGNS_SHOWN} autres)"

    prompt = PROMPT_TEMPLATE.format(
        n=n,
        category=category,
        signs=signs_str,
        grammar_rules=LSF_GRAMMAR_RULES,
    )

    response = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text.strip()

    # Extrait le JSON même si Claude a ajouté du texte autour
    start = raw.find("[")
    end   = raw.rfind("]") + 1
    if start == -1 or end == 0:
        raise ValueError(f"Pas de JSON trouvé dans la réponse : {raw[:200]}")

    phrases = json.loads(raw[start:end])
    return phrases


def build_module(category: str, phrases: list[dict], sort_order: int) -> dict:
    """Construit un module avec ses leçons depuis une liste de phrases."""
    lessons = []
    chunk_size = 8

    for i in range(0, len(phrases), chunk_size):
        chunk = phrases[i : i + chunk_size]
        if not chunk:
            continue
        lesson_num = (i // chunk_size) + 1
        lessons.append({
            "title":       f"{category} — leçon {lesson_num}",
            "description": f"Construis des phrases complètes avec le vocabulaire « {category} ».",
            "sortOrder":   lesson_num,
            "xpReward":    25 + (lesson_num - 1) * 5,
            "phrases":     chunk,
        })

    return {
        "module": {
            "title":       f"Phrases : {category}",
            "description": f"Apprends à construire des phrases naturelles avec le vocabulaire de la catégorie « {category} ».",
            "level":       1,
            "sortOrder":   sort_order,
        },
        "lessons": lessons,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Génère des phrases LSF via Claude API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--db",         default=DEFAULT_DB, required=DEFAULT_DB is None,                                 help="Chaîne de connexion PostgreSQL")
    parser.add_argument("--output",     default="lsf-api/Data/seed-phrases-generated.json", help="Fichier de sortie")
    parser.add_argument("--append",     help="Ajoute au fichier existant (ex: seed-phrases.json)")
    parser.add_argument("--dry-run",    action="store_true",                                help="Liste les catégories sans appeler l'API")
    parser.add_argument("--category",   help="Traite uniquement cette catégorie")
    parser.add_argument("--phrases",    type=int, default=PHRASES_PER_CAT,                  help=f"Phrases par catégorie (défaut: {PHRASES_PER_CAT})")
    parser.add_argument("--start-sort", type=int, default=200,                              help="SortOrder de départ pour les modules")
    parser.add_argument("--skip-small", type=int, default=3,                                help="Ignore les catégories avec moins de N signes")
    parser.add_argument("--only-new-signs", action="store_true",                            help="N'utilise que les signes présents dans aucune phrase")
    args = parser.parse_args()

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key and not args.dry_run:
        print("❌ Variable ANTHROPIC_API_KEY manquante.", file=sys.stderr)
        print("   Lance : export ANTHROPIC_API_KEY=sk-ant-...", file=sys.stderr)
        sys.exit(1)

    print("🔌 Connexion à la base de données...")
    try:
        signs_by_cat = fetch_signs_by_category(args.db, args.only_new_signs)
    except Exception as e:
        print(f"❌ Erreur DB : {e}", file=sys.stderr)
        sys.exit(1)

    total_signs = sum(len(v) for v in signs_by_cat.values())
    print(f"   {total_signs} signes dans {len(signs_by_cat)} catégories\n")

    # Filtre
    if args.category:
        signs_by_cat = {k: v for k, v in signs_by_cat.items() if args.category.lower() in k.lower()}
        if not signs_by_cat:
            print(f"❌ Catégorie introuvable : {args.category}")
            sys.exit(1)

    # Exclut les catégories trop petites
    signs_by_cat = {k: v for k, v in signs_by_cat.items() if len(v) >= args.skip_small}

    categories = sorted(signs_by_cat.keys())
    print(f"📋 {len(categories)} catégories à traiter :")
    for cat in categories:
        print(f"   • {cat} ({len(signs_by_cat[cat])} signes)")

    if args.dry_run:
        est_phrases  = len(categories) * args.phrases
        est_modules  = len(categories)
        print(f"\n🔍 Dry-run — estimation : ~{est_phrases} phrases dans {est_modules} modules.")
        return

    print()
    client = anthropic.Anthropic(api_key=api_key)

    # Chargement du fichier existant si --append
    output_data = []
    output_path = args.append or args.output
    if args.append:
        try:
            with open(args.append, encoding="utf-8") as f:
                output_data = json.load(f)
            print(f"   Fichier existant : {len(output_data)} modules chargés\n")
        except FileNotFoundError:
            print(f"   Fichier {args.append} non trouvé, création...\n")
        except json.JSONDecodeError as e:
            print(f"❌ JSON invalide dans {args.append} : {e}", file=sys.stderr)
            sys.exit(1)

    sort_order   = args.start_sort
    total_ok     = 0
    total_errors = 0

    for i, category in enumerate(categories, 1):
        signs = signs_by_cat[category]
        prefix = f"[{i:>{len(str(len(categories)))}}/{len(categories)}]"
        print(f"{prefix} {category} ({len(signs)} signes)...", end=" ", flush=True)

        try:
            phrases = generate_phrases_for_category(client, category, signs, args.phrases)
            module  = build_module(category, phrases, sort_order)
            output_data.append(module)

            # Sauvegarde incrémentale après chaque catégorie
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(output_data, f, ensure_ascii=False, indent=2)

            sort_order += 1
            total_ok   += len(phrases)
            print(f"✅ {len(phrases)} phrases")

        except Exception as e:
            total_errors += 1
            print(f"❌ Erreur : {e}")

        if i < len(categories):
            time.sleep(DELAY_BETWEEN)

    print(f"\n{'─'*55}")
    print(f"  ✅ {total_ok} phrases générées")
    print(f"  ❌ {total_errors} catégories en erreur")
    print(f"  📁 Fichier : {output_path}")
    if args.append:
        print(f"  ➡  Redémarre l'API pour charger les nouvelles phrases.")


if __name__ == "__main__":
    main()
