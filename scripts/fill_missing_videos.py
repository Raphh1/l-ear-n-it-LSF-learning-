#!/usr/bin/env python3
"""
fill_missing_videos.py — Complète la vidéo des signes déjà en base qui n'en ont pas.

Pour chaque signe sans VideoUrl, cherche le mot sur Elix et ne garde que
l'entrée dont le nom correspond exactement au mot (pas de vidéo d'un autre mot).
Ne modifie que VideoUrl / ThumbnailUrl (et Definition si elle est vide).

Usage :
    python3 scripts/fill_missing_videos.py --dry-run
    python3 scripts/fill_missing_videos.py

Dépendances : pip install psycopg2-binary
"""

import argparse
import json
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import psycopg2

from import_words import DEFAULT_DB, ELIX_BASE, ELIX_DELAY, ELIX_TIMEOUT, slugify


def fetch_exact_video(word: str) -> dict | None:
    """Retourne {videoUrl, thumbnailUrl, definition} pour le mot exact, sinon None."""
    url = f"{ELIX_BASE}/words?{urlencode({'q': word})}"
    try:
        with urlopen(Request(url, headers={"Accept": "application/json"}), timeout=ELIX_TIMEOUT) as resp:
            data = json.loads(resp.read().decode())
    except (HTTPError, URLError, json.JSONDecodeError, OSError, TimeoutError) as e:
        print(f"  ⚠  Elix erreur réseau ({word!r}): {e}", file=sys.stderr)
        return None

    target = slugify(word)
    for entry in data.get("data") or []:
        if slugify(entry.get("name", "")) != target:
            continue
        for meaning in entry.get("meanings") or []:
            signs = meaning.get("wordSigns") or []
            if signs:
                return {
                    "videoUrl":     signs[0].get("uri"),
                    "thumbnailUrl": signs[0].get("image"),
                    "definition":   meaning.get("definition"),
                }
    return None


def main() -> None:
    parser = argparse.ArgumentParser(description="Complète les vidéos manquantes depuis Elix")
    parser.add_argument("--db", default=DEFAULT_DB, help="Chaîne de connexion PostgreSQL")
    parser.add_argument("--dry-run", action="store_true", help="Affiche sans écrire en base")
    parser.add_argument("--delay", type=float, default=ELIX_DELAY, help="Délai entre requêtes Elix")
    args = parser.parse_args()

    conn = psycopg2.connect(args.db)
    with conn.cursor() as cur:
        cur.execute("""SELECT "Id", "Word" FROM "Signs"
                        WHERE COALESCE("VideoUrl", '') = '' ORDER BY "Word" """)
        signs = cur.fetchall()

    total = len(signs)
    found: list[str] = []
    missing: list[str] = []
    print(f"{'[DRY-RUN] ' if args.dry_run else ''}{total} signe(s) sans vidéo\n")

    try:
        for i, (sign_id, word) in enumerate(signs, 1):
            result = fetch_exact_video(word)
            time.sleep(args.delay)

            if not result or not result["videoUrl"]:
                print(f"[{i}/{total}] ❌ {word}")
                missing.append(word)
                continue

            print(f"[{i}/{total}] 🎥 {word}")
            found.append(word)
            if not args.dry_run:
                with conn.cursor() as cur:
                    cur.execute(
                        """UPDATE "Signs"
                              SET "VideoUrl"     = %s,
                                  "ThumbnailUrl" = COALESCE(NULLIF("ThumbnailUrl", ''), %s),
                                  "Definition"   = COALESCE(NULLIF("Definition", ''), %s)
                            WHERE "Id" = %s""",
                        (result["videoUrl"], result["thumbnailUrl"], result["definition"], sign_id),
                    )
                conn.commit()
    except KeyboardInterrupt:
        print("\n⚠  Interrompu.")
    finally:
        conn.close()

    print(f"\n🎥 Vidéo trouvée : {len(found)}")
    print(f"❌ Toujours sans vidéo : {len(missing)}")
    if missing:
        print("   " + ", ".join(missing))


if __name__ == "__main__":
    main()
