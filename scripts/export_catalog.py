#!/usr/bin/env python3
"""
export_catalog.py — Exporte le vocabulaire de la base locale vers lsf-api/Data/seed-catalog.json.

Les scripts import_words.py / generate_modules.py écrivent directement en base : sans cet export,
une base neuve (prod) n'aurait qu'une partie des signes. Le seeder de l'API charge ce fichier.

Contenu : catégories, signes (tous, publiés ou non), modules et leçons de signes (pas les phrases,
qui ont leurs propres fichiers seed-phrases*.json). Aucune donnée utilisateur.

Usage : python3 scripts/export_catalog.py
"""
import json
from pathlib import Path

from dbconn import psql

OUT = Path(__file__).resolve().parent.parent / "lsf-api" / "Data" / "seed-catalog.json"


def query_json(sql: str):
    """La requête doit renvoyer un seul agrégat JSON."""
    raw = psql(sql).strip()
    return json.loads(raw) if raw else []


def main() -> None:
    categories = query_json("""
        SELECT coalesce(json_agg(json_build_object('name', "Name", 'slug', "Slug", 'sortOrder', "SortOrder") ORDER BY "SortOrder", "Slug"), '[]')
        FROM "Categories"
    """)

    signs = query_json("""
        SELECT coalesce(json_agg(json_build_object(
            'word', s."Word", 'slug', s."Slug", 'definition', s."Definition",
            'videoUrl', s."VideoUrl", 'gifUrl', s."GifUrl", 'thumbnailUrl', s."ThumbnailUrl",
            'categorySlug', c."Slug", 'difficulty', s."Difficulty", 'tags', s."Tags",
            'isPublished', s."IsPublished"
        ) ORDER BY s."Slug"), '[]')
        FROM "Signs" s JOIN "Categories" c ON c."Id" = s."CategoryId"
    """)

    # Modules ayant au moins une leçon de signes ; seules ces leçons sont exportées
    modules = query_json("""
        SELECT coalesce(json_agg(m ORDER BY (m->>'sortOrder')::int, m->>'title'), '[]') FROM (
            SELECT json_build_object(
                'title', mo."Title", 'description', mo."Description", 'level', mo."Level", 'sortOrder', mo."SortOrder",
                'lessons', (
                    SELECT json_agg(json_build_object(
                        'title', l."Title", 'description', l."Description", 'sortOrder', l."SortOrder",
                        'xpReward', l."XpReward", 'lessonType', l."LessonType",
                        'signSlugs', (
                            SELECT json_agg(s."Slug" ORDER BY ls."SortOrder", s."Slug")
                            FROM "LessonSigns" ls JOIN "Signs" s ON s."Id" = ls."SignId"
                            WHERE ls."LessonId" = l."Id"
                        )
                    ) ORDER BY l."SortOrder", l."Title")
                    FROM "Lessons" l
                    WHERE l."ModuleId" = mo."Id"
                      AND EXISTS (SELECT 1 FROM "LessonSigns" x WHERE x."LessonId" = l."Id")
                )
            ) AS m
            FROM "Modules" mo
            WHERE EXISTS (
                SELECT 1 FROM "Lessons" l JOIN "LessonSigns" x ON x."LessonId" = l."Id" WHERE l."ModuleId" = mo."Id"
            )
        ) t
    """)

    OUT.write_text(json.dumps({"categories": categories, "signs": signs, "modules": modules}, ensure_ascii=False, indent=1), encoding="utf-8")
    lessons = sum(len(m["lessons"]) for m in modules)
    print(f"✅ {OUT.name} : {len(categories)} catégories, {len(signs)} signes, {len(modules)} modules, {lessons} leçons")


if __name__ == "__main__":
    main()
