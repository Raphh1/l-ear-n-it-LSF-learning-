#!/usr/bin/env python3
"""
elix_meanings.py — Récupère sur Elix tous les sens et toutes les variantes vidéo de chaque signe.

Entrée  : lsf-api/Data/seed-catalog.json (généré par export_catalog.py)
Sortie  : lsf-api/Data/seed-sign-meanings.json
          { slug: [ { definition, definitionVideoUrl, definitionThumbnailUrl, isPrimary,
                      videos: [ { videoUrl, thumbnailUrl, author } ] } ] }

Le sens « principal » est celui qui contient la vidéo déjà utilisée par le signe.
Seuls les mots Elix dont le nom correspond exactement sont retenus (pas de correspondance approximative).

Les réponses sont mises en cache (scripts/.elix_cache.json) : le script peut être interrompu et relancé.
Une pause est faite entre chaque requête pour ne pas surcharger l'API Elix.

Usage : python3 scripts/elix_meanings.py [--limit N]
"""
import argparse
import json
import sys
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "lsf-api" / "Data" / "seed-catalog.json"
OUT = ROOT / "lsf-api" / "Data" / "seed-sign-meanings.json"
CACHE = Path(__file__).resolve().parent / ".elix_cache.json"
ELIX = "https://api.elix-lsf.fr/words"
PAUSE_S = 0.3
TIMEOUT_S = 20


def fetch(word: str) -> list | None:
    req = Request(f"{ELIX}?{urlencode({'q': word})}", headers={"Accept": "application/json"})
    for attempt in range(3):
        try:
            with urlopen(req, timeout=TIMEOUT_S) as resp:
                return json.loads(resp.read().decode()).get("data") or []
        except HTTPError as e:
            if e.code == 429:
                time.sleep(10 * (attempt + 1))
                continue
            print(f"  ⚠ HTTP {e.code} pour « {word} »", file=sys.stderr)
            return None
        except (URLError, TimeoutError, json.JSONDecodeError) as e:
            print(f"  ⚠ {type(e).__name__} pour « {word} »", file=sys.stderr)
            time.sleep(2)
    return None


def meanings_for(sign: dict, entries: list) -> list:
    word = sign["word"].strip().lower()
    exact = [e for e in entries if (e.get("name") or "").strip().lower() == word]
    out, seen = [], set()
    for entry in exact:
        for m in entry.get("meanings") or []:
            videos = []
            for ws in m.get("wordSigns") or []:
                uri = ws.get("uri")
                if uri and uri not in seen:
                    seen.add(uri)
                    videos.append({"videoUrl": uri, "thumbnailUrl": ws.get("image"), "author": ws.get("author")})
            if not videos:
                continue
            ds = (m.get("definitionSigns") or [{}])[0]
            out.append({
                "definition": (m.get("definition") or "").strip() or None,
                "definitionVideoUrl": ds.get("uri"),
                "definitionThumbnailUrl": ds.get("image"),
                "isPrimary": any(v["videoUrl"] == sign.get("videoUrl") for v in videos),
                "videos": videos,
            })
    # Sens principal en premier
    out.sort(key=lambda m: not m["isPrimary"])
    return out


def load_cache() -> dict:
    return json.loads(CACHE.read_text()) if CACHE.exists() else {}


def save_cache(cache: dict) -> None:
    CACHE.write_text(json.dumps(cache, ensure_ascii=False))


def fetch_missing(words: list[str], cache: dict, limit: int = 0, save: bool = True) -> None:
    """Interroge Elix pour les mots absents du cache (avec pause entre requêtes)."""
    todo = [w for w in words if w not in cache]
    print(f"{len(words)} mots, {len(words) - len(todo)} en cache, {len(todo)} à interroger")
    if limit:
        todo = todo[:limit]
    for i, w in enumerate(todo, 1):
        data = fetch(w)
        if data is not None:
            cache[w] = data
        if i % 50 == 0 or i == len(todo):
            if save:
                save_cache(cache)
            print(f"  {i}/{len(todo)}")
        time.sleep(PAUSE_S)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="nombre max de mots à interroger (test)")
    args = parser.parse_args()

    signs = [s for s in json.loads(CATALOG.read_text())["signs"] if s.get("isPublished") and s.get("videoUrl")]
    cache = load_cache()
    fetch_missing(sorted({s["word"].strip() for s in signs}), cache, args.limit)
    write_meanings(signs, cache)


def write_meanings(signs: list, cache: dict) -> None:
    """(Ré)écrit seed-sign-meanings.json pour tous les signes à partir du cache."""
    result, n_videos, n_multi = {}, 0, 0
    for s in signs:
        entries = cache.get(s["word"].strip())
        if not entries:
            continue
        ms = meanings_for(s, entries)
        if ms:
            result[s["slug"]] = ms
            count = sum(len(m["videos"]) for m in ms)
            n_videos += count
            n_multi += count > 1

    OUT.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":"), sort_keys=True), encoding="utf-8")
    print(f"✅ {OUT.name} : {len(result)} signes, {n_videos} vidéos, {n_multi} signes avec plusieurs vidéos")


if __name__ == "__main__":
    main()
