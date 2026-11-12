#!/usr/bin/env python3
"""
generate_modules.py — Crée des modules et leçons pour tous les signes orphelins.

Un signe "orphelin" est un signe en base qui n'est lié à aucune leçon.
Ce script les regroupe par catégorie, les découpe en leçons de N signes,
et insère les modules/leçons directement en PostgreSQL.

Usage :
    python3 scripts/generate_modules.py
    python3 scripts/generate_modules.py --dry-run        # affiche sans insérer
    python3 scripts/generate_modules.py --signs-per-lesson 8
    python3 scripts/generate_modules.py --level 2        # niveau des modules créés
    python3 scripts/generate_modules.py --category "Animaux courants"  # une seule catégorie

Dépendances : pip install psycopg2-binary
"""

import argparse
import os
import sys
import uuid

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print("❌ psycopg2 manquant. Lance : pip install psycopg2-binary", file=sys.stderr)
    sys.exit(1)

DEFAULT_DB        = os.environ.get("LSF_DB_DSN")
SIGNS_PER_LESSON  = 10
XP_BASE           = 20
XP_PER_LESSON     = 5    # XP supplémentaires par leçon dans un même module
DEFAULT_LEVEL     = 1

# Catégories avancées → niveau 2
LEVEL_2_KEYWORDS = [
    "société", "civile", "politique", "gouvernement", "justice", "droit",
    "économie", "finance", "psychologie", "philosophie", "sciences",
    "technologie", "informatique", "environnement", "écologie",
    "astronomie", "médias", "communication", "construction",
]

# Catégories expertes → niveau 3
LEVEL_3_KEYWORDS = [
    "minéraux", "géologie", "chimie", "physique", "mathématique",
]


def guess_level(category_name: str) -> int:
    name_lower = category_name.lower()
    for kw in LEVEL_3_KEYWORDS:
        if kw in name_lower:
            return 3
    for kw in LEVEL_2_KEYWORDS:
        if kw in name_lower:
            return 2
    return 1


def fetch_orphan_signs(cur, category_filter: str | None) -> dict[str, list[dict]]:
    """
    Retourne les signes qui ne sont dans aucune LessonSign,
    groupés par catégorie : { cat_name: [{ id, word, slug }, ...] }
    """
    query = """
        SELECT s."Id", s."Word", s."Slug", c."Name" AS cat_name, c."Id" AS cat_id
        FROM "Signs" s
        JOIN "Categories" c ON s."CategoryId" = c."Id"
        WHERE s."IsPublished" = true
          AND s."Id" NOT IN (SELECT "SignId" FROM "LessonSigns")
        ORDER BY c."Name", s."Word"
    """
    cur.execute(query)
    rows = cur.fetchall()

    by_cat: dict[str, list[dict]] = {}
    for row in rows:
        cat = row["cat_name"]
        if category_filter and category_filter.lower() not in cat.lower():
            continue
        if cat not in by_cat:
            by_cat[cat] = []
        by_cat[cat].append({
            "id":   row["Id"],
            "word": row["Word"],
            "slug": row["Slug"],
        })
    return by_cat


def get_next_sort_order(cur) -> int:
    cur.execute('SELECT COALESCE(MAX("SortOrder"), 0) + 1 AS next_order FROM "Modules"')
    return cur.fetchone()["next_order"]


def module_exists_for_category(cur, category_name: str) -> bool:
    """Vérifie si un module existe déjà avec le titre généré pour cette catégorie."""
    title = f"Vocabulaire : {category_name}"
    cur.execute('SELECT 1 FROM "Modules" WHERE "Title" = %s', (title,))
    return cur.fetchone() is not None


def create_module(cur, category_name: str, level: int, sort_order: int) -> int:
    cur.execute(
        """
        INSERT INTO "Modules" ("Title", "Description", "Level", "SortOrder", "IsPublished")
        VALUES (%s, %s, %s, %s, true)
        RETURNING "Id"
        """,
        (
            f"Vocabulaire : {category_name}",
            f"Apprends le vocabulaire de la catégorie « {category_name} » signe par signe.",
            level,
            sort_order,
        ),
    )
    return cur.fetchone()["Id"]


def create_lesson(cur, module_id: int, title: str, description: str,
                  sort_order: int, xp: int) -> str:
    lesson_id = str(uuid.uuid4())
    cur.execute(
        """
        INSERT INTO "Lessons" ("Id", "ModuleId", "Title", "Description", "SortOrder", "XpReward", "IsPublished")
        VALUES (%s, %s, %s, %s, %s, %s, true)
        RETURNING "Id"
        """,
        (lesson_id, module_id, title, description, sort_order, xp),
    )
    return cur.fetchone()["Id"]


def link_signs_to_lesson(cur, lesson_id: str, signs: list[dict]) -> None:
    for i, sign in enumerate(signs, 1):
        cur.execute(
            """
            INSERT INTO "LessonSigns" ("LessonId", "SignId", "SortOrder")
            VALUES (%s, %s, %s)
            ON CONFLICT DO NOTHING
            """,
            (lesson_id, sign["id"], i),
        )


def process_category(
    cur,
    category_name: str,
    signs: list[dict],
    signs_per_lesson: int,
    level_override: int | None,
    sort_order: int,
    dry_run: bool,
    min_signs: int = 4,
) -> tuple[int, int]:
    """
    Crée un module + ses leçons pour une catégorie.
    Retourne (nb_lessons, nb_signs).
    """
    if module_exists_for_category(cur, category_name):
        print(f"  ⏭  Module déjà existant pour « {category_name} », ignoré.")
        return 0, 0

    if len(signs) < min_signs:
        print(f"  ⏭  « {category_name} » : {len(signs)} signe(s) seulement (< {min_signs}), ignoré.")
        return 0, 0

    level = level_override or guess_level(category_name)

    # Découpe les signes en leçons
    chunks = [signs[i : i + signs_per_lesson] for i in range(0, len(signs), signs_per_lesson)]
    # Fusionne la dernière leçon si elle est trop petite (< 3 signes)
    if len(chunks) > 1 and len(chunks[-1]) < 3:
        chunks[-2].extend(chunks.pop())

    if dry_run:
        print(f"  📦 [{level}★] {category_name} → {len(chunks)} leçon(s), {len(signs)} signes")
        return len(chunks), len(signs)

    module_id = create_module(cur, category_name, level, sort_order)

    nb_lessons = 0
    for i, chunk in enumerate(chunks, 1):
        xp = XP_BASE + (i - 1) * XP_PER_LESSON
        if len(chunks) == 1:
            lesson_title = category_name
            lesson_desc  = f"Découvre les signes de la catégorie « {category_name} »."
        else:
            lesson_title = f"{category_name} — partie {i}"
            lesson_desc  = f"Partie {i}/{len(chunks)} du vocabulaire « {category_name} »."

        lesson_id = create_lesson(cur, module_id, lesson_title, lesson_desc, i, xp)
        link_signs_to_lesson(cur, lesson_id, chunk)
        nb_lessons += 1

    return nb_lessons, len(signs)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Crée des modules/leçons pour les signes orphelins",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--db",               default=DEFAULT_DB, required=DEFAULT_DB is None,          help="Chaîne de connexion PostgreSQL")
    parser.add_argument("--dry-run",          action="store_true",         help="Affiche sans insérer")
    parser.add_argument("--signs-per-lesson", type=int, default=SIGNS_PER_LESSON, help=f"Signes par leçon (défaut: {SIGNS_PER_LESSON})")
    parser.add_argument("--level",            type=int, choices=[1, 2, 3], help="Force un niveau pour tous les modules")
    parser.add_argument("--category",         help="Traite uniquement cette catégorie (recherche partielle)")
    parser.add_argument("--min-signs",        type=int, default=4, help="Ignore les catégories avec moins de N signes orphelins (défaut: 4)")
    args = parser.parse_args()

    print("🔌 Connexion à la base de données...")
    try:
        conn = psycopg2.connect(args.db, cursor_factory=psycopg2.extras.RealDictCursor)
    except Exception as e:
        print(f"❌ Erreur de connexion : {e}", file=sys.stderr)
        sys.exit(1)

    try:
        with conn.cursor() as cur:
            by_cat = fetch_orphan_signs(cur, args.category)

        total_signs = sum(len(v) for v in by_cat.values())
        print(f"   {total_signs} signes orphelins dans {len(by_cat)} catégories\n")

        if not by_cat:
            print("✅ Aucun signe orphelin — tout est déjà dans des leçons.")
            return

        if args.dry_run:
            print("🔍 DRY-RUN — aperçu des modules qui seraient créés :\n")

        total_modules  = 0
        total_lessons  = 0
        total_inserted = 0

        with conn.cursor() as cur:
            sort_order = get_next_sort_order(cur)

            for category_name, signs in sorted(by_cat.items()):
                nb_lessons, nb_signs = process_category(
                    cur,
                    category_name,
                    signs,
                    args.signs_per_lesson,
                    args.level,
                    sort_order,
                    args.dry_run,
                    args.min_signs,
                )
                if nb_lessons > 0:
                    total_modules  += 1
                    total_lessons  += nb_lessons
                    total_inserted += nb_signs
                    sort_order     += 1

            if not args.dry_run:
                conn.commit()

        print(f"\n{'─'*55}")
        if args.dry_run:
            print(f"  🔍 Dry-run terminé")
        else:
            print(f"  ✅ {total_modules} modules créés")
            print(f"  📖 {total_lessons} leçons créées")
            print(f"  🔤 {total_inserted} signes intégrés")
            print(f"\n  Redémarre l'API pour voir les nouveaux modules.")
        print(f"{'─'*55}")

    except Exception as e:
        conn.rollback()
        print(f"\n❌ Erreur : {e}", file=sys.stderr)
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
