#!/usr/bin/env python3
"""
import_words.py — Importe des signes LSF depuis l'API Elix directement en base PostgreSQL.

Usage:
    python scripts/import_words.py words.txt
    python scripts/import_words.py words.txt --dry-run       # affiche sans insérer
    python scripts/import_words.py words.txt --no-elix       # insère sans appeler Elix (pas de vidéo)
    python scripts/import_words.py words.txt --db "host=... dbname=..."

Format de words.txt:
    # Commentaire (ligne ignorée)
    [Nom de Catégorie]   ← section : tous les mots suivants vont dans cette catégorie
    chat
    chien lapin          ← plusieurs mots par ligne séparés par des espaces → chaque mot séparé
    [Autre Catégorie]
    pain
    fromage
    ...

Si aucune section [Catégorie] n'est définie, les mots vont dans "Général".

Dépendances : pip install psycopg2-binary
"""

import argparse
import json
import re
import sys
import time
import unicodedata
import uuid
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

try:
    import psycopg2
except ImportError:
    print("❌  psycopg2 manquant. Installe-le avec :", file=sys.stderr)
    print("    pip install psycopg2-binary", file=sys.stderr)
    sys.exit(1)

# ── Configuration ──────────────────────────────────────────────────────────────

DEFAULT_DB    = "host=localhost port=5432 dbname=lsfdb user=lsfuser password=lsfpassword"
ELIX_BASE     = "https://api.elix-lsf.fr"
ELIX_DELAY    = 0.35   # secondes entre chaque appel API (respecte le rate-limit)
ELIX_TIMEOUT  = 10     # timeout requête en secondes
CAT_SORT_BASE = 200    # les nouvelles catégories reçoivent un sort_order ≥ 200

# ── Slugification ──────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    """'Au revoir !'  →  'au-revoir'"""
    text = text.lower().strip()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return re.sub(r"^-+|-+$", "", text)

# ── Lecture du fichier de mots ─────────────────────────────────────────────────

def parse_words_file(path: str) -> list[tuple[str, str]]:
    """
    Retourne une liste de (mot, nom_de_catégorie).
    Les lignes vides et commentaires (#) sont ignorés.
    Les sections [Catégorie] changent la catégorie courante.
    Plusieurs mots sur une même ligne (séparés par des espaces) sont traités séparément.
    """
    current_cat = "Général"
    result: list[tuple[str, str]] = []

    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("[") and line.endswith("]"):
                current_cat = line[1:-1].strip() or "Général"
                continue
            # Supporte plusieurs mots par ligne séparés par | ou virgule
            # (pour compatibilité simple, on traite quand même ligne par ligne en général)
            for word in re.split(r"\s*[|,]\s*", line):
                word = word.strip()
                if word:
                    result.append((word, current_cat))

    return result

# ── Appel API Elix ─────────────────────────────────────────────────────────────

def fetch_elix(word: str) -> dict | None:
    """
    Interroge l'API Elix et retourne les infos du premier signe pertinent.
    Retourne None si le mot est introuvable ou en cas d'erreur réseau.
    """
    url = f"{ELIX_BASE}/words?{urlencode({'q': word})}"
    try:
        req = Request(url, headers={"Accept": "application/json"})
        with urlopen(req, timeout=ELIX_TIMEOUT) as resp:
            data = json.loads(resp.read().decode())
    except (HTTPError, URLError, json.JSONDecodeError) as e:
        print(f"  ⚠  Elix erreur réseau ({word!r}): {e}", file=sys.stderr)
        return None

    words = data.get("data") or []
    if not words:
        return None

    # Préfère une entrée qui possède des vidéos de signe
    best = next(
        (w for w in words if any(m.get("wordSigns") for m in w.get("meanings", []))),
        words[0],
    )

    meanings   = best.get("meanings") or []
    definition = meanings[0].get("definition") if meanings else None
    all_signs  = [s for m in meanings for s in (m.get("wordSigns") or [])]

    return {
        "word":         best.get("name", word),
        "definition":   definition,
        "videoUrl":     all_signs[0].get("uri")   if all_signs else None,
        "thumbnailUrl": all_signs[0].get("image") if all_signs else None,
    }

# ── Opérations base de données ─────────────────────────────────────────────────

def get_or_create_category(cur, name: str) -> int:
    """Retourne l'id de la catégorie existante ou en crée une nouvelle."""
    slug = slugify(name)
    cur.execute('SELECT "Id" FROM "Categories" WHERE "Slug" = %s', (slug,))
    row = cur.fetchone()
    if row:
        return row[0]

    # Prochain sort_order au-delà de CAT_SORT_BASE
    cur.execute(
        'SELECT COALESCE(MAX("SortOrder"), %s) + 1 FROM "Categories" WHERE "SortOrder" >= %s',
        (CAT_SORT_BASE - 1, CAT_SORT_BASE),
    )
    sort_order = cur.fetchone()[0]

    cur.execute(
        'INSERT INTO "Categories" ("Name", "Slug", "SortOrder") VALUES (%s, %s, %s) RETURNING "Id"',
        (name, slug, sort_order),
    )
    cat_id = cur.fetchone()[0]
    print(f"    📁 Catégorie créée : {name!r} (sort_order={sort_order})")
    return cat_id


def upsert_sign(cur, word: str, slug: str, elix: dict | None, category_id: int) -> str:
    """
    Insère ou met à jour un signe.
    Retourne 'created' | 'updated' | 'skipped'.
    """
    video = elix["videoUrl"]     if elix else None
    thumb = elix["thumbnailUrl"] if elix else None
    defn  = elix["definition"]   if elix else None
    display_word = elix["word"]  if elix else word

    cur.execute('SELECT "Id", "VideoUrl" FROM "Signs" WHERE "Slug" = %s', (slug,))
    row = cur.fetchone()

    if row:
        sign_id, existing_video = row
        # Met à jour seulement si on apporte une vidéo que le signe n'avait pas
        if video and not existing_video:
            cur.execute(
                """UPDATE "Signs"
                      SET "VideoUrl"     = %s,
                          "ThumbnailUrl" = COALESCE("ThumbnailUrl", %s),
                          "Definition"   = COALESCE("Definition", %s)
                    WHERE "Id" = %s""",
                (video, thumb, defn, sign_id),
            )
            return "updated"
        return "skipped"

    cur.execute(
        """INSERT INTO "Signs"
               ("Id", "Word", "Slug", "Definition", "VideoUrl", "ThumbnailUrl", "CategoryId", "Difficulty", "Tags", "IsPublished")
           VALUES (%s, %s, %s, %s, %s, %s, %s, 1, '{}', true)""",
        (str(uuid.uuid4()), display_word, slug, defn, video, thumb, category_id),
    )
    return "created"

# ── Point d'entrée ─────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Importe des signes LSF depuis l'API Elix vers PostgreSQL",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("words_file",          help="Chemin vers le fichier de mots (ex: words.txt)")
    parser.add_argument("--db",  default=DEFAULT_DB, help="Chaîne de connexion PostgreSQL (libpq DSN)")
    parser.add_argument("--dry-run",  action="store_true", help="Simule sans écrire en base")
    parser.add_argument("--no-elix",  action="store_true", help="N'appelle pas Elix (insère sans vidéo/image)")
    parser.add_argument("--delay", type=float, default=ELIX_DELAY, help=f"Délai entre requêtes Elix (défaut: {ELIX_DELAY}s)")
    args = parser.parse_args()

    entries = parse_words_file(args.words_file)
    if not entries:
        print("⚠  Aucun mot trouvé dans le fichier.")
        return

    total = len(entries)
    tag = "[DRY-RUN] " if args.dry_run else ""
    print(f"{'─'*55}")
    print(f"  {tag}Import de {total} mot(s) — {args.words_file}")
    print(f"  Elix : {'désactivé' if args.no_elix else f'activé (délai {args.delay}s/mot)'}")
    if not args.dry_run:
        print(f"  DB   : {args.db}")
    print(f"{'─'*55}\n")

    stats = {"created": 0, "updated": 0, "skipped": 0, "elix_video": 0, "elix_nodata": 0}
    cat_cache: dict[str, int] = {}

    conn = None if args.dry_run else psycopg2.connect(args.db)

    try:
        for i, (word, cat_name) in enumerate(entries, 1):
            slug = slugify(word)
            prefix = f"[{i:>{len(str(total))}}/{total}]"

            # ── Appel Elix ──
            elix = None
            if not args.no_elix:
                elix = fetch_elix(word)
                time.sleep(args.delay)

            has_video = bool(elix and elix.get("videoUrl"))
            stats["elix_video"  if has_video else "elix_nodata"] += 1

            if args.dry_run:
                icon = "🎥" if has_video else ("📷" if elix and elix.get("thumbnailUrl") else "❌")
                print(f"{prefix} {icon}  {word!r}  [{cat_name}]")
                stats["created"] += 1
                continue

            # ── Upsert en base ──
            with conn.cursor() as cur:
                if cat_name not in cat_cache:
                    cat_cache[cat_name] = get_or_create_category(cur, cat_name)
                category_id = cat_cache[cat_name]

                action = upsert_sign(cur, word, slug, elix, category_id)
                stats[action] += 1

            conn.commit()

            action_icon = {"created": "✅", "updated": "🔄", "skipped": "–"}.get(action, "?")
            elix_icon   = "🎥" if has_video else ("📷" if elix and elix.get("thumbnailUrl") else "❌")
            print(f"{prefix} {action_icon} {elix_icon}  {word!r}  [{cat_name}]")

    except KeyboardInterrupt:
        print("\n\n⚠  Interrompu par l'utilisateur.")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

    print(f"\n{'─'*55}")
    print(f"  ✅ Créés        : {stats['created']}")
    print(f"  🔄 Mis à jour   : {stats['updated']}")
    print(f"  –  Ignorés      : {stats['skipped']}")
    print(f"  🎥 Vidéo Elix   : {stats['elix_video']}")
    print(f"  ❌ Sans vidéo   : {stats['elix_nodata']}")
    print(f"{'─'*55}")
    if not args.dry_run:
        print("  Redémarre l'API pour voir les nouveaux signes.\n")


if __name__ == "__main__":
    main()
