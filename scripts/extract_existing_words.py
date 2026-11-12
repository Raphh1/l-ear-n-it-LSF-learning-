#!/usr/bin/env python3
"""Extract all existing words from seed data files"""
import json
import re
import sys
from pathlib import Path

def slugify(text: str) -> str:
    """Convert to slug for comparison"""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return re.sub(r"^-+|-+$", "", text)

# Load all seed files
repo_path = Path(__file__).parent.parent
existing_words = set()

for seed_file in ['seed-data.json', 'seed-data-extra.json', 'seed-data-elix.json']:
    filepath = repo_path / 'lsf-api' / 'Data' / seed_file
    if not filepath.exists():
        print(f"⚠  {seed_file} not found", file=sys.stderr)
        continue
    
    with open(filepath, encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing {seed_file}: {e}", file=sys.stderr)
            continue
    
    for category in data:
        for module in [category.get('module', {})]:
            for lesson in module.get('lessons', []):
                for sign in lesson.get('signs', []):
                    word = sign.get('word', '').lower().strip()
                    if word:
                        existing_words.add(slugify(word))

print(f"Total existing words: {len(existing_words)}")
print("\nExisting words (sorted):")
for word in sorted(existing_words):
    print(word)
