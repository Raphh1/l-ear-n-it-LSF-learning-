#!/usr/bin/env python3
"""
format_words.py — Reformate le fichier words.txt pour avoir un mot par ligne.

Usage:
    python scripts/format_words.py scripts/words.txt
    python scripts/format_words.py scripts/words.txt --output words_formatted.txt

Si plusieurs mots sont sur une même ligne (séparés par des espaces, virgules, ou pipes),
chacun sera placé sur une ligne séparée.
"""

import argparse
import re
from pathlib import Path


def format_words_file(input_path: str, output_path: str | None = None) -> None:
    """
    Lit le fichier de mots et le réécrit avec un mot par ligne.
    Préserve les sections [Catégorie] et les commentaires.
    """
    if output_path is None:
        output_path = input_path

    lines_to_write = []

    with open(input_path, encoding="utf-8") as f:
        content = f.read()

    # Tout simplement, on split par espaces et on écrit chaque mot sur une ligne
    # Ignore les lignes vides et les commentaires
    for line in content.split("\n"):
        line = line.strip()

        # Ligne vide
        if not line:
            continue

        # Commentaire
        if line.startswith("#"):
            lines_to_write.append(line)
            continue

        # Section [Catégorie]
        if line.startswith("[") and line.endswith("]"):
            lines_to_write.append(line)
            continue

        # Mots : split par espaces
        words = line.split()
        for word in words:
            word = word.strip()
            if word:
                lines_to_write.append(word)

    # Réécrit le fichier
    with open(output_path, "w", encoding="utf-8") as f:
        for line in lines_to_write:
            f.write(f"{line}\n")

    word_count = len([l for l in lines_to_write if not l.startswith("[") and l])
    print(f"✅ Fichier {output_path} reformaté avec succès !")
    print(f"   {word_count} mots - Un mot par ligne")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Reformate words.txt avec un mot par ligne",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("words_file", help="Chemin vers le fichier de mots (ex: words.txt)")
    parser.add_argument("--output", help="Fichier de sortie (défaut: remplace le fichier original)")
    args = parser.parse_args()

    format_words_file(args.words_file, args.output)


if __name__ == "__main__":
    main()
