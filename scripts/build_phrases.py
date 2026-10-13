#!/usr/bin/env python3
"""
build_phrases.py — Transforme scripts/phrases_source.txt en fichier seed pour l'API.

Pour chaque phrase, les signWords sont déduits de la glose : chaque mot de la glose
qui existe en base (signe publié avec vidéo) est relié, dans l'ordre LSF.

Usage :
    python3 scripts/build_phrases.py              # écrit lsf-api/Data/seed-phrases-generated.json
    python3 scripts/build_phrases.py --dry-run    # rapport seulement

Le seeder charge le fichier au prochain démarrage de l'API.
"""

import argparse
import json
from pathlib import Path

import psycopg2

from import_words import DEFAULT_DB, slugify

ROOT        = Path(__file__).parent.parent
SOURCE      = Path(__file__).parent / "phrases_source.txt"
OUTPUT      = ROOT / "lsf-api" / "Data" / "seed-phrases-generated.json"
SORT_START  = 300   # sortOrder des modules générés (après les modules de phrases existants)
LESSON_SIZE = 8     # phrases par leçon
HAND_SEED   = ROOT / "lsf-api" / "Data" / "seed-phrases.json"

# Mots-outils du français non signés en LSF : ignorés lors de la liaison glose → signes
STOP = {"ce", "cette", "cet", "ces", "ça", "de", "du", "des", "d'", "se", "s'", "en", "une", "au", "aux",
        "à", "dans", "ne", "n'", "me", "m'", "te", "t'", "le", "la", "les", "l'", "y", "s'il", "plaît", "et"}

# Formes irrégulières → forme de base
LEMMA = {"belle": "beau", "bel": "beau", "nouvelle": "nouveau", "nouvel": "nouveau", "vieille": "vieux",
         "fraîche": "frais", "douce": "doux", "longue": "long", "longues": "long", "blanche": "blanc",
         "sèche": "sec", "gentille": "gentil", "fausse": "faux", "grosse": "gros", "basse": "bas",
         "va": "aller", "vais": "aller", "vont": "aller", "c'était": "être", "est": "être", "suis": "être",
         "mon": "moi", "ma": "moi", "mes": "moi", "ton": "toi", "ta": "toi", "tes": "toi",
         "notre": "nous", "nos": "nous", "votre": "vous", "vos": "vous", "yeux": "œil",
         "tous": "tout", "toute": "tout", "toutes": "tout", "ans": "an", "année": "an", "weekend": "week-end"}

# Suffixes féminins / pluriels / participes → candidats de forme de base (testés dans l'ordre)
SUFFIXES = [("euses", "eux"), ("euse", "eux"), ("ives", "if"), ("ive", "if"), ("ères", "er"), ("ère", "er"),
            ("iennes", "ien"), ("ienne", "ien"), ("ennes", "en"), ("enne", "en"), ("onnes", "on"), ("onne", "on"),
            ("elles", "el"), ("elle", "el"), ("aux", "al"), ("ées", "er"), ("ée", "er"), ("ées", "é"), ("ée", "é"),
            ("és", "er"), ("é", "er"), ("es", ""), ("e", ""), ("s", ""), ("x", "")]


def base_form(token: str, known: set[str]) -> str | None:
    """Retourne le mot en base correspondant au token (forme exacte, irrégulière ou dé-suffixée)."""
    if token in known:
        return token
    if len(token) > 3 and token[1] == "'" and token[0] in "dljmnst":   # m'expliquer → expliquer
        return base_form(token[2:], known)
    if token in LEMMA and LEMMA[token] in known:
        return LEMMA[token]
    for suf, rep in SUFFIXES:
        if token.endswith(suf) and len(token) > len(suf) + 1 and token[: -len(suf)] + rep in known:
            return token[: -len(suf)] + rep
    return None


def link_words(gloss: str, known: set[str]) -> tuple[list[str], list[str]]:
    """Glose LSF → (signWords dans l'ordre, tokens sans signe). Les expressions multi-mots sont prioritaires."""
    tokens = [t.strip("?!.,;:").lower() for t in gloss.split()]
    tokens = [t for t in tokens if t]
    words, missing, i = [], [], 0
    while i < len(tokens):
        for n in (4, 3, 2):
            expr = " ".join(tokens[i:i + n])
            if len(tokens[i:i + n]) == n and expr in known:
                words.append(expr)
                i += n
                break
        else:
            t = tokens[i]
            w = base_form(t, known)
            if w:
                words.append(w)
            elif t not in STOP:
                missing.append(t)
            i += 1
    return words, missing


def parse_source() -> dict[str, list[dict]]:
    by_cat: dict[str, list[dict]] = {}
    current = None
    lines = [l for f in sorted(SOURCE.parent.glob("phrases_source*.txt"))
             for l in f.read_text(encoding="utf-8").splitlines()]
    for raw in lines:
        line = raw.strip()
        if not line or line.startswith("# "):
            continue
        if line.startswith("## "):
            current = line[3:].strip()
            by_cat.setdefault(current, [])   # une catégorie peut apparaître plusieurs fois
            continue
        fr, lsf, diff = (p.strip() for p in line.split("|"))
        by_cat[current].append({"textFr": fr, "textLsf": lsf, "difficulty": int(diff)})
    return by_cat


def main() -> None:
    parser = argparse.ArgumentParser(description="Génère seed-phrases-generated.json")
    parser.add_argument("--db", default=DEFAULT_DB, help="Chaîne de connexion PostgreSQL")
    parser.add_argument("--dry-run", action="store_true", help="Rapport sans écrire le fichier")
    args = parser.parse_args()

    conn = psycopg2.connect(args.db)
    with conn.cursor() as cur:
        cur.execute("""SELECT lower(trim("Word")) FROM "Signs"
                        WHERE "IsPublished" AND COALESCE("VideoUrl", '') <> ''""")
        known = {r[0] for r in cur.fetchall()}
        cur.execute('SELECT "TextFr" FROM "Phrases"')
        existing_fr = {r[0] for r in cur.fetchall()}
    conn.close()

    modules, missing_tokens, weak, dup = [], {}, [], []
    for i, (cat, phrases) in enumerate(parse_source().items()):
        for p in phrases:
            p["signWords"], missing = link_words(p["textLsf"], known)
            p["tags"] = [slugify(cat)]
            for t in missing:
                missing_tokens[t] = missing_tokens.get(t, 0) + 1
            if not p["signWords"]:
                weak.append(f"{cat} : {p['textFr']}")
            if p["textFr"] in existing_fr:
                dup.append(p["textFr"])
        modules.append({
            "module": {
                "title":       f"Phrases : {cat}",
                "description": f"Construis des phrases avec le vocabulaire « {cat} ».",
                "level":       1,
                "sortOrder":   SORT_START + i,
            },
            "lessons": [{
                "title":       f"{cat} — phrases" + (f" {k // LESSON_SIZE + 1}" if k else ""),
                "description": f"Remets les signes dans l'ordre LSF avec le vocabulaire « {cat} ».",
                "sortOrder":   k // LESSON_SIZE + 1,
                "xpReward":    25,
                "phrases":     phrases[k:k + LESSON_SIZE],
            } for k in range(0, len(phrases), LESSON_SIZE)],
        })

    # Phrases écrites à la main : signWords re-déduits de la glose (on garde l'original si rien n'est relié)
    hand = json.loads(HAND_SEED.read_text(encoding="utf-8"))
    for m in hand:
        for lesson in m.get("lessons") or []:
            for p in lesson.get("phrases") or []:
                words, missing = link_words(p.get("textLsf") or "", known)
                if words:
                    p["signWords"] = words
                for t in missing:
                    missing_tokens[t] = missing_tokens.get(t, 0) + 1

    total = sum(len(l["phrases"]) for m in modules for l in m["lessons"])
    linked = sum(len(p["signWords"]) for m in modules for l in m["lessons"] for p in l["phrases"])
    print(f"{total} phrases dans {len(modules)} modules, {linked} liens vers des signes")
    print(f"Mots de glose sans signe en base ({len(missing_tokens)}) : "
          + ", ".join(f"{t}×{n}" for t, n in sorted(missing_tokens.items(), key=lambda x: -x[1])))
    if weak:
        print(f"⚠ Phrases sans aucun signe relié ({len(weak)}) :\n  " + "\n  ".join(weak))
    if dup:
        print(f"⚠ Phrases déjà en base (réutilisées telles quelles) : {dup}")

    if not args.dry_run:
        OUTPUT.write_text(json.dumps(modules, ensure_ascii=False, indent=2), encoding="utf-8")
        HAND_SEED.write_text(json.dumps(hand, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"✅ {OUTPUT.relative_to(ROOT)} écrit — redémarre l'API pour charger les phrases.")


if __name__ == "__main__":
    main()
