#!/usr/bin/env python3
"""
lexique_to_words.py — Génère words.txt depuis la base Lexique383.

1. Télécharge Lexique383 : http://www.lexique.org/databases/Lexique383/Lexique383.tsv
2. Lance : python scripts/lexique_to_words.py Lexique383.tsv

Le script se connecte à PostgreSQL pour exclure automatiquement les mots déjà importés.

Usage :
    python scripts/lexique_to_words.py Lexique383.tsv
    python scripts/lexique_to_words.py Lexique383.tsv --min-freq 5
    python scripts/lexique_to_words.py Lexique383.tsv --batch-size 300 --output scripts/words.txt
    python scripts/lexique_to_words.py Lexique383.tsv --no-db  # sans connexion DB
"""

import argparse
import os
import csv
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

try:
    import psycopg2
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False

DEFAULT_DB   = os.environ.get("LSF_DB_DSN")
BATCH_SIZE   = 200
MIN_FREQ     = 2.0   # fréquence minimale cumulée (films + livres) par million
NO_VIDEO_FILE = Path(__file__).parent / "no_video.txt"

CGRAM_LABELS = {
    "NOM": "Noms",
    "VER": "Verbes",
    "ADJ": "Adjectifs",
}

# Catégories grammaticales à inclure (ordre = ordre dans words.txt)
DEFAULT_CGRAM = ["NOM", "VER", "ADJ"]


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return re.sub(r"^-+|-+$", "", text)


def load_existing_slugs_from_db(dsn: str) -> set[str]:
    """Récupère tous les slugs déjà en base PostgreSQL."""
    conn = psycopg2.connect(dsn)
    with conn.cursor() as cur:
        cur.execute('SELECT "Slug" FROM "Signs"')
        slugs = {row[0] for row in cur.fetchall()}
    conn.close()
    return slugs


def load_existing_slugs_from_file(path: str) -> set[str]:
    """Charge les mots existants depuis un fichier texte (un mot par ligne)."""
    slugs = set()
    with open(path, encoding="utf-8") as f:
        for line in f:
            w = line.strip()
            if w and not w.startswith("#") and not w.startswith("["):
                slugs.add(slugify(w))
    return slugs


def read_lexique(path: str, cgrams: list[str], min_freq: float, existing_slugs: set[str]) -> dict[str, list[str]]:
    """
    Lit Lexique383.tsv et retourne un dict cgram -> liste de lemmes triés par fréquence.
    """
    by_cgram: dict[str, list[tuple[float, str]]] = defaultdict(list)
    seen_lemmes: set[str] = set()

    with open(path, encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            cgram = row.get("cgram", "").strip()
            if cgram not in cgrams:
                continue

            lemme = row.get("lemme", "").strip()
            if not lemme or lemme in seen_lemmes:
                continue
            seen_lemmes.add(lemme)

            # Filtres de forme : pas trop court, pas de chiffres ni apostrophes
            if len(lemme) < 3 or re.search(r"[0-9'\"()]", lemme):
                continue

            # Exclure les mots déjà en base
            if slugify(lemme) in existing_slugs:
                continue

            # Calcul de fréquence cumulée films + livres
            try:
                freq = (
                    float(row.get("freqlemfilms2") or 0)
                    + float(row.get("freqlemlivres2") or 0)
                )
            except ValueError:
                freq = 0.0

            if freq < min_freq:
                continue

            by_cgram[cgram].append((freq, lemme))

    # Trier par fréquence décroissante (les plus courants en premier = plus de chances sur Elix)
    return {
        cgram: [lemme for _, lemme in sorted(entries, reverse=True)]
        for cgram, entries in by_cgram.items()
    }


def write_words_file(output_path: str, by_cgram: dict[str, list[str]]) -> int:
    """Écrit le fichier words.txt avec une seule section par type grammatical."""
    total = 0
    with open(output_path, "w", encoding="utf-8") as f:
        for cgram, words in by_cgram.items():
            label = CGRAM_LABELS.get(cgram, cgram)
            f.write(f"\n[{label}]\n")
            for word in words:
                f.write(f"{word}\n")
            total += len(words)
    return total


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Génère words.txt depuis Lexique383.tsv",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("lexique_file", help="Chemin vers Lexique383.tsv")
    parser.add_argument("--output",     default="scripts/words.txt",   help="Fichier de sortie")
    parser.add_argument("--db",         default=DEFAULT_DB, required=DEFAULT_DB is None,             help="Chaîne de connexion PostgreSQL")
    parser.add_argument("--no-db",      action="store_true",            help="Ne pas interroger la base de données")
    parser.add_argument("--skip-file",  help="Fichier texte avec les mots à exclure (un par ligne)")
    parser.add_argument("--min-freq",   type=float, default=MIN_FREQ,   help=f"Fréquence min cumulée par million (défaut: {MIN_FREQ})")
    parser.add_argument("--batch-size", type=int,   default=BATCH_SIZE, help=f"Mots par section (défaut: {BATCH_SIZE})")
    parser.add_argument("--cgram",      nargs="+",  default=DEFAULT_CGRAM, help="Catégories grammaticales (défaut: NOM VER ADJ)")
    args = parser.parse_args()

    if not Path(args.lexique_file).exists():
        print(f"❌ Fichier introuvable : {args.lexique_file}", file=sys.stderr)
        print("   Télécharge Lexique383.tsv depuis : http://www.lexique.org/databases/Lexique383/Lexique383.tsv")
        sys.exit(1)

    # ── Charger les mots existants ──────────────────────────────────────────────
    existing_slugs: set[str] = set()

    if args.skip_file:
        existing_slugs |= load_existing_slugs_from_file(args.skip_file)
        print(f"  📂 {len(existing_slugs)} mots chargés depuis {args.skip_file}")

    # Mots déjà cherchés sur Elix sans vidéo (rempli par import_words.py)
    if NO_VIDEO_FILE.exists():
        no_video = load_existing_slugs_from_file(str(NO_VIDEO_FILE))
        existing_slugs |= no_video
        print(f"  🚫 {len(no_video)} mots sans vidéo ignorés ({NO_VIDEO_FILE.name})")

    if not args.no_db:
        if not HAS_PSYCOPG2:
            print("⚠  psycopg2 non installé — connexion DB ignorée. Lance : pip install psycopg2-binary", file=sys.stderr)
        else:
            try:
                db_slugs = load_existing_slugs_from_db(args.db)
                existing_slugs |= db_slugs
                print(f"  🗄  {len(db_slugs)} mots récupérés depuis la base de données")
            except Exception as e:
                print(f"⚠  Impossible de se connecter à la DB : {e}", file=sys.stderr)
                print("   Continue sans filtrage DB (utilise --no-db pour supprimer ce message)")

    print(f"  🚫 {len(existing_slugs)} mots exclus au total\n")

    # ── Lire Lexique ────────────────────────────────────────────────────────────
    print(f"  📖 Lecture de {args.lexique_file}...")
    by_cgram = read_lexique(args.lexique_file, args.cgram, args.min_freq, existing_slugs)

    total_new = sum(len(v) for v in by_cgram.values())
    print(f"  ✅ {total_new} nouveaux mots trouvés :")
    for cgram in args.cgram:
        label = CGRAM_LABELS.get(cgram, cgram)
        print(f"     {label}: {len(by_cgram.get(cgram, []))}")

    # ── Écrire words.txt ────────────────────────────────────────────────────────
    total_written = write_words_file(args.output, by_cgram)
    print(f"\n  📝 {total_written} mots écrits dans {args.output}")
    print(f"  ➡  Lance maintenant : python scripts/import_words.py {args.output}")


if __name__ == "__main__":
    main()
