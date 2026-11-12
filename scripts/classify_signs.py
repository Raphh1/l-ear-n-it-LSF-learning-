#!/usr/bin/env python3
"""
classify_signs.py — Reclasse par thème les signes rangés dans une catégorie fourre-tout
("Noms" par défaut, créée par import_words.py) grâce à l'API Claude.

Deux étapes, pour pouvoir relire avant d'écrire en base :
    python3 scripts/classify_signs.py               # appelle Claude → scripts/classification.json
    python3 scripts/classify_signs.py --apply       # applique classification.json en base

Options :
    --from-category "Noms"   catégorie à reclasser
    --batch-size 150         mots par appel à Claude

Prérequis :
    pip install psycopg2-binary anthropic
    export ANTHROPIC_API_KEY=...   (jamais en dur dans le code)
"""

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

import psycopg2

from import_words import DEFAULT_DB, get_or_create_category, slugify

MODEL       = "claude-opus-5-5"
OUTPUT_FILE = Path(__file__).parent / "classification.json"

PROMPT = """Tu ranges du vocabulaire français par thème pour une application d'apprentissage \
de la Langue des Signes Française. Chaque thème deviendra un module de leçons, donc un thème \
doit regrouper des mots qu'on a envie d'apprendre ensemble.

Catégories existantes (réutilise-les en priorité, en recopiant le nom EXACTEMENT) :
{existing}

Nouvelles catégories déjà créées lors des lots précédents (réutilise-les aussi) :
{created}

Si aucun thème ne convient, crée une nouvelle catégorie : nom court en français, style \
"Thème & Sous-thème", assez large pour accueillir au moins une dizaine de mots. \
N'utilise jamais "Noms", "Divers", "Autres" ou "Général".

Classe chacun de ces {n} mots (recopie chaque mot exactement tel quel) :
{words}"""

SCHEMA = {
    "type": "object",
    "properties": {
        "assignments": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "word":     {"type": "string"},
                    "category": {"type": "string"},
                },
                "required": ["word", "category"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["assignments"],
    "additionalProperties": False,
}

FORBIDDEN = {"noms", "divers", "autres", "general"}


def fetch_signs(conn, category: str) -> list[str]:
    with conn.cursor() as cur:
        cur.execute(
            """SELECT s."Word" FROM "Signs" s JOIN "Categories" c ON c."Id" = s."CategoryId"
                WHERE c."Name" = %s AND s."IsPublished" ORDER BY s."Word" """,
            (category,),
        )
        return [r[0] for r in cur.fetchall()]


def fetch_existing_categories(conn, exclude: str) -> list[str]:
    with conn.cursor() as cur:
        cur.execute('SELECT DISTINCT "Name" FROM "Categories" WHERE "Name" <> %s ORDER BY "Name"', (exclude,))
        return [r[0] for r in cur.fetchall()]


def classify_batch(client, words: list[str], existing: list[str], created: list[str]) -> dict[str, str]:
    prompt = PROMPT.format(
        existing="\n".join(f"- {c}" for c in existing),
        created="\n".join(f"- {c}" for c in created) or "(aucune)",
        n=len(words),
        words="\n".join(words),
    )
    response = client.beta.messages.create(
        model=MODEL,
        max_tokens=16000,
        # Fallback serveur si le modèle refuse (paramètre pas encore typé dans le SDK installé)
        betas=["server-side-fallback-2026-07-01"],
        extra_body={"fallbacks": "default"},
        output_config={"effort": "low", "format": {"type": "json_schema", "schema": SCHEMA}},
        messages=[{"role": "user", "content": prompt}],
    )
    if response.stop_reason == "refusal":
        raise RuntimeError("requête refusée par le modèle")
    if response.stop_reason == "max_tokens":
        raise RuntimeError("réponse tronquée (max_tokens)")

    text = next(b.text for b in response.content if b.type == "text")
    wanted = set(words)
    result: dict[str, str] = {}
    for item in json.loads(text)["assignments"]:
        word, cat = item["word"], item["category"].strip()
        if word in wanted and cat and slugify(cat) not in FORBIDDEN:
            result[word] = cat
    return result


def run_classification(args) -> None:
    import anthropic

    conn = psycopg2.connect(args.db)
    words    = fetch_signs(conn, args.from_category)
    existing = fetch_existing_categories(conn, args.from_category)
    conn.close()

    if not words:
        print(f"Aucun signe publié dans « {args.from_category} ».")
        return

    # Reprise : on ne reclasse pas ce qui est déjà dans classification.json
    mapping: dict[str, str] = {}
    if OUTPUT_FILE.exists():
        mapping = json.loads(OUTPUT_FILE.read_text(encoding="utf-8"))
    todo = [w for w in words if w not in mapping]
    print(f"{len(words)} signes dans « {args.from_category} », {len(todo)} à classer "
          f"({len(existing)} catégories existantes)\n")

    client = anthropic.Anthropic()
    existing_set = set(existing)
    batches = [todo[i:i + args.batch_size] for i in range(0, len(todo), args.batch_size)]

    for i, batch in enumerate(batches, 1):
        created = sorted({c for c in mapping.values() if c not in existing_set})
        print(f"[{i}/{len(batches)}] {len(batch)} mots...", end=" ", flush=True)
        try:
            result = classify_batch(client, batch, existing, created)
        except (anthropic.APIError, RuntimeError, json.JSONDecodeError) as e:
            print(f"❌ {e}")
            continue
        mapping.update(result)
        # Sauvegarde après chaque lot (reprise possible si interruption)
        OUTPUT_FILE.write_text(json.dumps(mapping, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
        print(f"✅ {len(result)} classés")

    counts = Counter(mapping.values())
    new_cats = [c for c in counts if c not in existing_set]
    print(f"\n{len(mapping)}/{len(words)} mots classés dans {len(counts)} catégories "
          f"({len(new_cats)} nouvelles) → {OUTPUT_FILE.name}")
    for cat, n in counts.most_common():
        print(f"  {n:>4}  {cat}{'  (nouvelle)' if cat in new_cats else ''}")
    print("\nRelis le fichier puis lance : python3 scripts/classify_signs.py --apply")


def apply_classification(args) -> None:
    if not OUTPUT_FILE.exists():
        print(f"❌ {OUTPUT_FILE.name} introuvable : lance d'abord le script sans --apply.", file=sys.stderr)
        sys.exit(1)
    mapping: dict[str, str] = json.loads(OUTPUT_FILE.read_text(encoding="utf-8"))

    conn = psycopg2.connect(args.db)
    moved = 0
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "Id" FROM "Categories" WHERE "Name" = %s', (args.from_category,))
            row = cur.fetchone()
            if not row:
                print(f"❌ Catégorie « {args.from_category} » introuvable.", file=sys.stderr)
                sys.exit(1)
            source_id = row[0]

            cat_ids: dict[str, int] = {}
            for word, cat in mapping.items():
                if cat not in cat_ids:
                    # Par nom d'abord : les catégories d'origine n'ont pas toujours le slug attendu
                    cur.execute('SELECT MIN("Id") FROM "Categories" WHERE "Name" = %s', (cat,))
                    existing_id = cur.fetchone()[0]
                    cat_ids[cat] = existing_id or get_or_create_category(cur, cat)
                # Ne déplace que les signes encore dans la catégorie source
                cur.execute(
                    'UPDATE "Signs" SET "CategoryId" = %s WHERE "Word" = %s AND "CategoryId" = %s',
                    (cat_ids[cat], word, source_id),
                )
                moved += cur.rowcount
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    print(f"✅ {moved} signes déplacés vers {len(set(mapping.values()))} catégories.")
    print("➡  Lance ensuite : python3 scripts/generate_modules.py --dry-run")


def main() -> None:
    parser = argparse.ArgumentParser(description="Reclasse par thème les signes d'une catégorie fourre-tout")
    parser.add_argument("--db",            default=DEFAULT_DB, help="Chaîne de connexion PostgreSQL")
    parser.add_argument("--from-category", default="Noms",     help="Catégorie à reclasser (défaut: Noms)")
    parser.add_argument("--batch-size",    type=int, default=150, help="Mots par appel à Claude")
    parser.add_argument("--apply",         action="store_true", help=f"Applique {OUTPUT_FILE.name} en base")
    args = parser.parse_args()

    if args.apply:
        apply_classification(args)
    else:
        run_classification(args)


if __name__ == "__main__":
    main()
