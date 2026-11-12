#!/usr/bin/env python3
"""Finalise les 4 derniers modules à 8 phrases."""
import json

PATH = '/home/raphaelcau/l-ear-n-it-LSF-learning-/lsf-api/Data/seed-phrases.json'

with open(PATH) as f:
    data = json.load(f)

enrichments = {
    "Les insectes et petites bêtes": [
        {"textFr": "La libellule vole au-dessus de l'étang.", "textLsf": "LIBELLULE ÉTANG AU-DESSUS VOLER", "difficulty": 2, "tags": ["insectes", "nature"], "signWords": ["libellule"]},
        {"textFr": "Le ver de terre aère le sol.", "textLsf": "VER DE TERRE SOL AÉRER", "difficulty": 2, "tags": ["insectes", "nature"], "signWords": ["ver de terre"]},
        {"textFr": "L'escargot avance très lentement.", "textLsf": "ESCARGOT TRÈS LENTEMENT AVANCER", "difficulty": 1, "tags": ["insectes"], "signWords": ["escargot"]},
        {"textFr": "La mouche tourne autour de la nourriture.", "textLsf": "MOUCHE NOURRITURE AUTOUR TOURNER", "difficulty": 2, "tags": ["insectes"], "signWords": ["mouche"]},
        {"textFr": "Le scarabée est brillant et noir.", "textLsf": "SCARABÉE BRILLANT NOIR", "difficulty": 1, "tags": ["insectes"], "signWords": ["scarabée"]},
        {"textFr": "Les fourmis travaillent en équipe.", "textLsf": "FOURMI ÉQUIPE TRAVAILLER", "difficulty": 2, "tags": ["insectes"], "signWords": ["fourmi"]},
        {"textFr": "L'abeille butine les fleurs.", "textLsf": "ABEILLE FLEUR BUTINER", "difficulty": 2, "tags": ["insectes", "nature"], "signWords": ["abeille"]},
    ],
    "Architecture et bâtiments": [
        {"textFr": "L'immeuble a vingt étages.", "textLsf": "IMMEUBLE VINGT ÉTAGE AVOIR", "difficulty": 2, "tags": ["architecture"], "signWords": ["immeuble"]},
        {"textFr": "Le palais est magnifiquement décoré.", "textLsf": "PALAIS MAGNIFIQUEMENT DÉCORÉ", "difficulty": 1, "tags": ["architecture"], "signWords": ["palais"]},
        {"textFr": "La mosquée est ouverte à tous.", "textLsf": "MOSQUÉE TOUS OUVERTE", "difficulty": 1, "tags": ["architecture", "religion"], "signWords": ["mosquée"]},
        {"textFr": "La synagogue est au centre-ville.", "textLsf": "SYNAGOGUE CENTRE-VILLE ÊTRE", "difficulty": 2, "tags": ["architecture", "religion"], "signWords": ["synagogue"]},
        {"textFr": "Ce temple date de mille ans.", "textLsf": "CE TEMPLE MILLE ANS DATER", "difficulty": 2, "tags": ["architecture", "histoire"], "signWords": ["temple"]},
        {"textFr": "La tour domine toute la ville.", "textLsf": "TOUR VILLE TOUTE DOMINER", "difficulty": 2, "tags": ["architecture"], "signWords": ["tour"]},
        {"textFr": "Le musée d'art moderne est fascinant.", "textLsf": "MUSÉE ART MODERNE FASCINANT", "difficulty": 2, "tags": ["architecture", "culture"], "signWords": ["musée"]},
    ],
    "Langues et communication": [
        {"textFr": "Le chinois est la langue la plus parlée.", "textLsf": "CHINOIS LANGUE PLUS PARLÉE", "difficulty": 2, "tags": ["langues"], "signWords": ["chinois"]},
        {"textFr": "Le portugais est proche de l'espagnol.", "textLsf": "PORTUGAIS ESPAGNOL PROCHE", "difficulty": 2, "tags": ["langues"], "signWords": ["portugais", "espagnol"]},
        {"textFr": "Je connais quelques mots en russe.", "textLsf": "MOI RUSSE QUELQUES MOTS CONNAÎTRE", "difficulty": 2, "tags": ["langues"], "signWords": ["russe"]},
        {"textFr": "Ce dialecte est régional.", "textLsf": "CE DIALECTE RÉGIONAL", "difficulty": 1, "tags": ["langues"], "signWords": ["dialecte"]},
        {"textFr": "La grammaire française est complexe.", "textLsf": "FRANÇAIS GRAMMAIRE COMPLEXE", "difficulty": 2, "tags": ["langues", "apprentissage"], "signWords": ["grammaire"]},
        {"textFr": "J'utilise un dictionnaire pour traduire.", "textLsf": "MOI TRADUIRE DICTIONNAIRE UTILISER", "difficulty": 2, "tags": ["langues"], "signWords": ["dictionnaire", "traduction"]},
        {"textFr": "L'arabe s'écrit de droite à gauche.", "textLsf": "ARABE DROITE GAUCHE ÉCRIRE", "difficulty": 2, "tags": ["langues"], "signWords": ["arabe"]},
    ],
    "La politique et la société": [
        {"textFr": "Le taux d'imposition a augmenté.", "textLsf": "IMPÔT TAUX AUGMENTER", "difficulty": 2, "tags": ["politique", "finances"], "signWords": ["impôt"]},
        {"textFr": "Le commerce international crée des emplois.", "textLsf": "COMMERCE INTERNATIONAL EMPLOI CRÉER", "difficulty": 3, "tags": ["politique", "économie"], "signWords": ["commerce"]},
        {"textFr": "Le droit de vote est précieux.", "textLsf": "VOTE DROIT PRÉCIEUX", "difficulty": 2, "tags": ["politique", "droits"], "signWords": ["vote"]},
        {"textFr": "L'égalité des chances est un objectif.", "textLsf": "ÉGALITÉ CHANCES OBJECTIF", "difficulty": 2, "tags": ["politique", "société"], "signWords": ["égalité"]},
        {"textFr": "La liberté de la presse est protégée.", "textLsf": "PRESSE LIBERTÉ PROTÉGÉE", "difficulty": 2, "tags": ["politique", "droits"], "signWords": ["liberté"]},
        {"textFr": "Le citoyen a des droits et des devoirs.", "textLsf": "CITOYEN DROIT DEVOIR AVOIR", "difficulty": 2, "tags": ["politique", "citoyenneté"], "signWords": ["citoyen"]},
        {"textFr": "La fraternité unit les peuples.", "textLsf": "FRATERNITÉ PEUPLE UNIR", "difficulty": 2, "tags": ["politique", "valeurs"], "signWords": ["fraternité"]},
    ],
}

for module in data:
    title = module["module"]["title"]
    if title in enrichments:
        new_lesson = {
            "title": f"{title} — leçon 2",
            "description": module["lessons"][0]["description"],
            "sortOrder": module["lessons"][-1]["sortOrder"] + 1,
            "xpReward": module["lessons"][-1]["xpReward"] + 5,
            "phrases": enrichments[title],
        }
        module["lessons"].append(new_lesson)
        n = sum(len(l["phrases"]) for l in module["lessons"])
        print(f"  + {title}: {n} phrases")

with open(PATH, 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open(PATH) as f:
    data = json.load(f)
total = sum(len(l['phrases']) for m in data for l in m['lessons'])
short = [(m['module']['title'], sum(len(l['phrases']) for l in m['lessons'])) for m in data if sum(len(l['phrases']) for l in m['lessons']) < 15]
print(f"\n{'─'*55}")
print(f"  {len(data)} modules | {total} phrases au total")
if short:
    print(f"  Modules encore < 15 : {short}")
else:
    print("  Tous les modules ont 15+ phrases !")
