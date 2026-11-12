#!/usr/bin/env python3
"""
enrich_extra.py — Enrichit seed-data-extra.json avec les URLs vidéo/image d'Elix.

Pour chaque signe sans thumbnailUrl ni videoUrl, interroge l'API Elix et
met à jour le fichier JSON en place.

Usage:
    python scripts/enrich_extra.py
    python scripts/enrich_extra.py --dry-run     # affiche sans écrire
    python scripts/enrich_extra.py --delay 0.5   # ralentit les requêtes
"""

import argparse
import json
import sys
import time
import unicodedata
import re
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode

ELIX_BASE       = "https://api.elix-lsf.fr"
ELIX_TIMEOUT    = 10
DEFAULT_DELAY   = 0.4

INPUT_PATH = Path(__file__).parent.parent / "lsf-api" / "Data" / "seed-data-extra.json"


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return re.sub(r"^-+|-+$", "", text)


def fetch_elix(word: str) -> dict | None:
    url = f"{ELIX_BASE}/words?{urlencode({'q': word})}"
    try:
        req = Request(url, headers={"Accept": "application/json"})
        with urlopen(req, timeout=ELIX_TIMEOUT) as resp:
            data = json.loads(resp.read().decode())
    except (HTTPError, URLError, json.JSONDecodeError) as e:
        print(f"    ⚠  Elix erreur ({word!r}): {e}", file=sys.stderr)
        return None

    words = data.get("data") or []
    if not words:
        return None

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


def main() -> None:
    parser = argparse.ArgumentParser(description="Enrichit seed-data-extra.json via Elix")
    parser.add_argument("--dry-run", action="store_true", help="Affiche sans modifier le fichier")
    parser.add_argument("--delay",   type=float, default=DEFAULT_DELAY, help="Délai entre requêtes (s)")
    args = parser.parse_args()

    if not INPUT_PATH.exists():
        print(f"❌ Fichier introuvable : {INPUT_PATH}", file=sys.stderr)
        sys.exit(1)

    with open(INPUT_PATH, encoding="utf-8") as f:
        entries = json.load(f)

    # Comptage des signes à enrichir
    to_enrich = [
        (entry_i, lesson_i, sign_i, sign)
        for entry_i, entry in enumerate(entries)
        for lesson_i, lesson in enumerate(entry.get("lessons", []))
        for sign_i, sign in enumerate(lesson.get("signs", []))
        if not sign.get("thumbnailUrl") and not sign.get("videoUrl")
    ]

    total = len(to_enrich)
    if total == 0:
        print("✅ Tous les signes ont déjà des images. Rien à faire.")
        return

    tag = "[DRY-RUN] " if args.dry_run else ""
    print(f"{'─'*60}")
    print(f"  {tag}Enrichissement de {INPUT_PATH.name}")
    print(f"  Signes à enrichir : {total}")
    print(f"  Délai Elix        : {args.delay}s/mot")
    print(f"  Durée estimée     : ~{int(total * args.delay // 60)}m{int(total * args.delay % 60)}s")
    print(f"{'─'*60}\n")

    stats = {"ok": 0, "no_video": 0, "not_found": 0}

    for done, (entry_i, lesson_i, sign_i, sign) in enumerate(to_enrich, 1):
        word = sign.get("word", "")
        prefix = f"[{done:>{len(str(total))}}/{total}]"

        print(f"{prefix} {word!r}...", end=" ", flush=True)

        elix = fetch_elix(word)
        time.sleep(args.delay)

        if not elix:
            print("❌ introuvable")
            stats["not_found"] += 1
            continue

        has_video = bool(elix.get("videoUrl"))
        has_thumb = bool(elix.get("thumbnailUrl"))

        if not has_video and not has_thumb:
            print("⚠  pas de média")
            stats["no_video"] += 1
            continue

        icon = "🎥" if has_video else "📷"
        url_preview = (elix.get("videoUrl") or elix.get("thumbnailUrl") or "")[:55]
        print(f"{icon} {url_preview}...")
        stats["ok"] += 1

        if not args.dry_run:
            s = entries[entry_i]["lessons"][lesson_i]["signs"][sign_i]
            if elix.get("thumbnailUrl"):
                s["thumbnailUrl"] = elix["thumbnailUrl"]
            if elix.get("videoUrl"):
                s["videoUrl"] = elix["videoUrl"]
            if elix.get("definition") and not s.get("definition"):
                s["definition"] = elix["definition"]

    print(f"\n{'─'*60}")
    print(f"  🎥  Enrichis       : {stats['ok']}")
    print(f"  ⚠   Sans média     : {stats['no_video']}")
    print(f"  ❌  Introuvables   : {stats['not_found']}")
    print(f"{'─'*60}")

    if not args.dry_run and stats["ok"] > 0:
        with open(INPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(entries, f, ensure_ascii=False, indent=2)
        print(f"\n✅ Fichier mis à jour : {INPUT_PATH}")
        print("   Redémarre l'API pour que le seeder charge les nouvelles images.\n")
    elif args.dry_run:
        print("\n  (Mode dry-run — aucun fichier modifié)\n")


if __name__ == "__main__":
    main()
