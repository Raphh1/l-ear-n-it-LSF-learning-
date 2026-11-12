#!/usr/bin/env python3
"""
add_words.py — Ajoute de nouveaux mots (signes Elix) au catalogue.

N'écrit PAS en base : met à jour lsf-api/Data/seed-catalog.json et seed-sign-meanings.json.
Au prochain démarrage de l'API, le seeder insère les nouveaux signes, leurs leçons et leurs variantes
(en local comme en prod).

Format de scripts/words.txt :
    # commentaire
    [Animaux]                 ← catégorie des mots suivants (créée si besoin)
    chat
    chien, lapin              ← plusieurs mots séparés par , ou |
    souris (ordinateur)       ← homonyme : l'indice choisit le sens Elix dont la définition le contient
    [Général]                 ← (ou aucune section) : catégorie déduite de classification.json

Pour chaque mot :
  - seuls les mots Elix au nom exactement identique sont retenus (pas d'approximation) ;
  - la vidéo principale est la 1re du sens choisi (indice) ou du 1er sens ;
  - sans vidéo → ajouté à no_video.txt (plus jamais recherché) ;
  - déjà au catalogue (même mot ou même slug) → ignoré.
Les nouveaux signes sont rangés dans le module « Vocabulaire : <catégorie> » (créé si besoin),
en complétant la dernière leçon puis en créant des leçons « <catégorie> — partie N ».

Usage :
    python3 scripts/add_words.py            # ajoute les mots de words.txt
    python3 scripts/add_words.py --dry-run  # affiche ce qui serait ajouté, n'écrit rien
    python3 scripts/add_words.py --lexique 200  # + les 200 mots Lexique383 les plus fréquents absents du catalogue
Avec --lexique, la catégorie vient de classification.json, sinon de la nature du mot (nom, verbe, adjectif).
Ensuite : redémarrer l'API (seed), puis relancer build_phrases.py si de nouvelles phrases les utilisent.

⚠ Ne pas lancer pendant que elix_meanings.py tourne (même cache).
"""
import argparse
import csv
import json
import re
import sys
import unicodedata
from pathlib import Path

import elix_meanings as elix

SCRIPTS = Path(__file__).resolve().parent
WORDS_FILE = SCRIPTS / "words.txt"
NO_VIDEO_FILE = SCRIPTS / "no_video.txt"
CLASSIFICATION = SCRIPTS / "classification.json"
LEXIQUE = SCRIPTS / "Lexique383.tsv"
LEXIQUE_CATEGORIES = {"NOM": "Mots courants", "VER": "Verbes courants", "ADJ": "Adjectifs"}

SIGNS_PER_LESSON = 10
XP_BASE, XP_PER_LESSON = 20, 5
CAT_SORT_BASE = 200
LEVEL_2_KEYWORDS = ["société", "civile", "politique", "gouvernement", "justice", "droit", "économie", "finance",
                    "psychologie", "philosophie", "sciences", "technologie", "informatique", "environnement",
                    "écologie", "astronomie", "médias", "communication", "construction"]
LEVEL_3_KEYWORDS = ["minéraux", "géologie", "chimie", "physique", "mathématique"]


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFD", text.lower().strip())
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"[\s_-]+", "-", text).strip("-")


def guess_level(category: str) -> int:
    name = category.lower()
    if any(k in name for k in LEVEL_3_KEYWORDS):
        return 3
    return 2 if any(k in name for k in LEVEL_2_KEYWORDS) else 1


def parse_words_file(words_file: Path) -> list[tuple[str, str | None, str]]:
    """→ [(mot, indice de sens ou None, catégorie)]"""
    current, out = "Général", []
    for raw in words_file.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("[") and line.endswith("]"):
            current = line[1:-1].strip() or "Général"
            continue
        for item in re.split(r"\s*[|,]\s*", line):
            m = re.fullmatch(r"(.+?)\s*(?:\((.+)\))?", item.strip())
            if m and m.group(1):
                out.append((m.group(1).strip(), (m.group(2) or "").strip() or None, current))
    return out


def lexique_words(n: int, exclude: set[str], classification: dict) -> list[tuple[str, None, str]]:
    """Les n lemmes Lexique383 (noms, verbes, adjectifs) les plus fréquents absents de exclude."""
    best: dict[str, tuple[float, str]] = {}
    with LEXIQUE.open(encoding="utf-8") as f:
        for row in csv.DictReader(f, delimiter="\t"):
            cgram = row["cgram"]
            lemma = re.sub(r"oe(?=u|il)", "œ", row["lemme"].strip())  # Lexique écrit « coeur », Elix « cœur »
            if (cgram not in LEXIQUE_CATEGORIES or len(lemma) < 3 or lemma.lower() in exclude
                    or not re.fullmatch(r"[^\W\d_]+", lemma)):
                continue
            freq = float(row["freqlemfilms2"] or 0) + float(row["freqlemlivres"] or 0)
            if freq > best.get(lemma, (0.0, ""))[0]:
                best[lemma] = (freq, cgram)
    top = sorted(best.items(), key=lambda kv: -kv[1][0])[:n]
    return [(w, None, classification.get(w, LEXIQUE_CATEGORIES[g])) for w, (_, g) in top]


def candidate_meanings(word: str, hint: str | None, entries: list) -> list[dict]:
    """Sens Elix avec vidéo du mot exact ; filtrés par l'indice s'il y en a un (le 1er est retenu)."""
    meanings = [m for e in entries if (e.get("name") or "").strip().lower() == word.lower()
                for m in e.get("meanings") or [] if m.get("wordSigns")]
    if hint:
        h = hint.lower()
        meanings = [m for m in meanings if h in (m.get("definition") or "").lower()]
    return meanings


def lesson_slots(catalog: dict, category: str) -> tuple[dict, list]:
    """Module « Vocabulaire : <catégorie> » (créé si besoin) et sa liste de leçons."""
    title = f"Vocabulaire : {category}"
    module = next((m for m in catalog["modules"] if m["title"] == title), None)
    if module is None:
        module = {
            "title": title,
            "description": f"Apprends le vocabulaire de la catégorie « {category} » signe par signe.",
            "level": guess_level(category),
            "sortOrder": max((m["sortOrder"] for m in catalog["modules"]), default=0) + 1,
            "lessons": [],
        }
        catalog["modules"].append(module)
    return module, module["lessons"]


def place_in_lessons(catalog: dict, category: str, slugs: list[str]) -> list[str]:
    """Range les signes et renvoie les leçons touchées (« module / leçon (+n) »)."""
    module, lessons = lesson_slots(catalog, category)
    created, touched = set(), {}
    for slug in slugs:
        last = lessons[-1] if lessons else None
        if last is None or len(last["signSlugs"] or []) >= SIGNS_PER_LESSON:
            n = len(lessons) + 1
            last = {
                "title": category if n == 1 else f"{category} — partie {n}",
                "description": f"Découvre les signes de la catégorie « {category} ».",
                "sortOrder": n,
                "xpReward": XP_BASE + (n - 1) * XP_PER_LESSON,
                "lessonType": "signs",
                "signSlugs": [],
            }
            lessons.append(last)
            created.add(last["title"])
        last["signSlugs"] = (last["signSlugs"] or []) + [slug]
        touched[last["title"]] = touched.get(last["title"], 0) + 1
    return [f"{module['title']} / {t} : +{n} signe(s){' (nouvelle leçon)' if t in created else ''}"
            for t, n in touched.items()]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="n'écrit aucun fichier")
    parser.add_argument("--file", type=Path, default=WORDS_FILE, help="fichier de mots (défaut : scripts/words.txt)")
    parser.add_argument("--lexique", type=int, default=0, metavar="N",
                        help="ajoute les N mots Lexique383 les plus fréquents absents du catalogue")
    args = parser.parse_args()

    catalog = json.loads(elix.CATALOG.read_text(encoding="utf-8"))
    classification = json.loads(CLASSIFICATION.read_text(encoding="utf-8")) if CLASSIFICATION.exists() else {}
    no_video = {l.strip().lower() for l in NO_VIDEO_FILE.read_text(encoding="utf-8").splitlines()} if NO_VIDEO_FILE.exists() else set()

    known_slugs = {s["slug"] for s in catalog["signs"]}
    known_words = {s["word"].strip().lower() for s in catalog["signs"]}
    categories = {c["name"]: c for c in catalog["categories"]}

    words_file = args.file
    requests = parse_words_file(words_file)
    if args.lexique > 0:
        asked = {w.lower() for w, _, _ in requests}
        requests += lexique_words(args.lexique, known_words | no_video | asked, classification)
    if not requests:
        print("words.txt ne contient aucun mot (ou utilise --lexique N).")
        return

    todo = []
    for word, hint, cat in requests:
        slug = slugify(f"{word} {hint}" if hint else word)
        if slug in known_slugs or (not hint and word.lower() in known_words):
            print(f"  ⏭  {word}{f' ({hint})' if hint else ''} : déjà au catalogue")
        elif word.lower() in no_video and not hint:
            print(f"  ⏭  {word} : déjà connu sans vidéo (no_video.txt)")
        else:
            todo.append((word, hint, cat, slug))

    cache = elix.load_cache()
    elix.fetch_missing(sorted({w for w, _, _, _ in todo}), cache, save=not args.dry_run)

    known_videos = {s.get("videoUrl") for s in catalog["signs"] if s.get("videoUrl")}
    added, no_video_new = [], []
    failed: dict[str, list[str]] = {}   # catégorie → mots à relancer
    by_category: dict[str, list[str]] = {}
    for word, hint, cat, slug in todo:
        label = f"{word} ({hint})" if hint else word
        entries = cache.get(word)
        if entries is None:
            failed.setdefault(cat, []).append(label)
            print(f"  ⚠  {label} : erreur réseau, à relancer")
            continue
        candidates = candidate_meanings(word, hint, entries)
        meaning = candidates[0] if candidates else None
        if meaning is None:
            if hint:
                failed.setdefault(cat, []).append(label)
                print(f"  ⚠  {label} : aucun sens Elix ne contient « {hint} »")
            else:
                no_video_new.append(word)
                print(f"  ✗  {word} : pas de vidéo sur Elix")
            continue
        # Un des sens correspondants est déjà un signe du catalogue (ex. souris-ordi) : doublon
        if any(ws.get("uri") in known_videos for m in candidates for ws in m["wordSigns"]):
            print(f"  ⏭  {label} : ce signe est déjà au catalogue sous un autre nom")
            continue

        category = cat if cat != "Général" else classification.get(word, classification.get(word.lower(), "Général"))
        if category not in categories:
            categories[category] = {
                "name": category, "slug": slugify(category),
                "sortOrder": max([CAT_SORT_BASE - 1] + [c["sortOrder"] for c in catalog["categories"]]) + 1,
            }
            catalog["categories"].append(categories[category])

        video = meaning["wordSigns"][0]
        catalog["signs"].append({
            "word": word, "slug": slug, "definition": (meaning.get("definition") or "").strip() or None,
            "videoUrl": video.get("uri"), "gifUrl": None, "thumbnailUrl": video.get("image"),
            "categorySlug": categories[category]["slug"], "difficulty": 1, "tags": [], "isPublished": True,
        })
        known_slugs.add(slug)
        known_videos.add(video.get("uri"))
        by_category.setdefault(category, []).append(slug)
        added.append(slug)
        print(f"  ✅ {word}{f' ({hint})' if hint else ''} → {category}")

    new_lessons = [l for cat, slugs in by_category.items() for l in place_in_lessons(catalog, cat, slugs)]

    n_failed = sum(len(v) for v in failed.values())
    print(f"\n{len(added)} ajouté(s), {len(no_video_new)} sans vidéo, {n_failed} à relancer")
    for l in new_lessons:
        print(f"  → {l}")

    if args.dry_run:
        print("\n(dry-run : aucun fichier modifié)")
        return

    elix.CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=1), encoding="utf-8")
    elix.write_meanings([s for s in catalog["signs"] if s.get("isPublished") and s.get("videoUrl")], cache)
    if no_video_new:
        with NO_VIDEO_FILE.open("a", encoding="utf-8") as f:
            f.writelines(w + "\n" for w in no_video_new)
    # words.txt ne garde que les mots à relancer, avec leur catégorie
    if failed:
        body = "# Mots à relancer (erreur réseau ou indice introuvable)\n" + "".join(
            f"[{cat}]\n" + "\n".join(words) + "\n" for cat, words in failed.items())
    else:
        body = "# Tous les mots ont été ajoutés. Ajoute les suivants ici.\n"
    words_file.write_text(body, encoding="utf-8")
    print("\nÉtape suivante : redémarre l'API pour que le seeder insère les nouveaux signes.")


if __name__ == "__main__":
    sys.exit(main())
