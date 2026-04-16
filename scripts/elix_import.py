#!/usr/bin/env python3
"""
Script d'import Elix LSF → seed-data-elix.json
Usage : python scripts/elix_import.py
Output: lsf-api/src/LsfApi/Data/seed-data-elix.json

Pour chaque mot défini dans CATALOG, interroge l'API Elix pour récupérer
la vidéo et l'image du signe correspondant, puis génère un fichier JSON
compatible avec le DatabaseSeeder de LsfApi.
"""

import json
import time
import re
import unicodedata
import sys
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, quote

# ── Configuration ─────────────────────────────────────────────────────────────

ELIX_BASE = "https://api.elix-lsf.fr"
OUTPUT_PATH = Path(__file__).parent.parent / "lsf-api" / "src" / "LsfApi" / "Data" / "seed-data-elix.json"
DELAY_BETWEEN_REQUESTS = 0.4   # secondes entre chaque appel API
REQUEST_TIMEOUT = 10

# ── Catalogue des mots à importer ─────────────────────────────────────────────
# Structure : liste de catégories, chacune avec un module et des leçons.
# Chaque leçon contient une liste de mots à chercher dans Elix.

CATALOG = [
    {
        "category": {"name": "Chiffres", "slug": "chiffres", "sortOrder": 2},
        "module": {
            "title": "Les chiffres en LSF",
            "description": "Apprenez à compter et à exprimer les nombres en Langue des Signes Française.",
            "level": 1,
            "sortOrder": 2,
        },
        "lessons": [
            {
                "title": "0 à 10",
                "description": "Les premiers chiffres de zéro à dix.",
                "sortOrder": 1,
                "xpReward": 30,
                "tags": ["chiffres", "nombres"],
                "difficulty": 1,
                "words": ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix"],
            },
            {
                "title": "11 à 20",
                "description": "Les nombres de onze à vingt.",
                "sortOrder": 2,
                "xpReward": 30,
                "tags": ["chiffres", "nombres"],
                "difficulty": 1,
                "words": ["onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf", "vingt"],
            },
        ],
    },
    {
        "category": {"name": "Couleurs", "slug": "couleurs", "sortOrder": 3},
        "module": {
            "title": "Les couleurs en LSF",
            "description": "Maîtrisez le vocabulaire des couleurs en Langue des Signes Française.",
            "level": 1,
            "sortOrder": 3,
        },
        "lessons": [
            {
                "title": "Les couleurs de base",
                "description": "Rouge, bleu, vert et les autres couleurs essentielles.",
                "sortOrder": 1,
                "xpReward": 30,
                "tags": ["couleurs"],
                "difficulty": 1,
                "words": ["rouge", "bleu", "vert", "jaune", "blanc", "noir", "orange", "rose", "violet", "marron", "gris"],
            },
        ],
    },
    {
        "category": {"name": "Salutations", "slug": "salutations", "sortOrder": 4},
        "module": {
            "title": "Salutations et politesse",
            "description": "Les expressions de base pour se saluer et être poli en LSF.",
            "level": 1,
            "sortOrder": 4,
        },
        "lessons": [
            {
                "title": "Se saluer",
                "description": "Bonjour, au revoir et les formules de politesse essentielles.",
                "sortOrder": 1,
                "xpReward": 25,
                "tags": ["salutations", "politesse"],
                "difficulty": 1,
                "words": ["bonjour", "au revoir", "merci", "pardon", "oui", "non", "s'il vous plaît", "bonsoir", "bonne nuit"],
            },
            {
                "title": "Se présenter",
                "description": "Comment dire son nom, son âge et d'où on vient.",
                "sortOrder": 2,
                "xpReward": 30,
                "tags": ["salutations", "présentation"],
                "difficulty": 1,
                "words": ["nom", "prénom", "âge", "habiter", "ville", "pays", "France", "entendre", "sourd"],
            },
        ],
    },
    {
        "category": {"name": "Famille", "slug": "famille", "sortOrder": 5},
        "module": {
            "title": "La famille en LSF",
            "description": "Parlez de votre famille et de vos proches en Langue des Signes Française.",
            "level": 1,
            "sortOrder": 5,
        },
        "lessons": [
            {
                "title": "La famille proche",
                "description": "Père, mère, frère, sœur et les membres proches de la famille.",
                "sortOrder": 1,
                "xpReward": 35,
                "tags": ["famille"],
                "difficulty": 1,
                "words": ["père", "mère", "frère", "sœur", "fils", "fille", "bébé", "enfant", "mari", "femme", "famille"],
            },
            {
                "title": "La famille étendue",
                "description": "Grands-parents, oncles, tantes et cousins.",
                "sortOrder": 2,
                "xpReward": 35,
                "tags": ["famille"],
                "difficulty": 2,
                "words": ["grand-père", "grand-mère", "oncle", "tante", "cousin", "neveu", "nièce", "ami", "copain"],
            },
        ],
    },
    {
        "category": {"name": "Corps humain", "slug": "corps", "sortOrder": 6},
        "module": {
            "title": "Le corps humain",
            "description": "Apprenez à nommer les parties du corps en LSF.",
            "level": 2,
            "sortOrder": 6,
        },
        "lessons": [
            {
                "title": "La tête et le visage",
                "description": "Les parties du visage et de la tête.",
                "sortOrder": 1,
                "xpReward": 35,
                "tags": ["corps", "visage"],
                "difficulty": 2,
                "words": ["tête", "visage", "œil", "nez", "bouche", "oreille", "cheveux", "dent", "langue"],
            },
            {
                "title": "Le corps",
                "description": "Le torse, les membres et les extrémités.",
                "sortOrder": 2,
                "xpReward": 35,
                "tags": ["corps"],
                "difficulty": 2,
                "words": ["main", "bras", "jambe", "pied", "dos", "ventre", "épaule", "genou", "doigt"],
            },
        ],
    },
    {
        "category": {"name": "Animaux", "slug": "animaux", "sortOrder": 7},
        "module": {
            "title": "Les animaux en LSF",
            "description": "Découvrez les signes pour désigner les animaux en LSF.",
            "level": 2,
            "sortOrder": 7,
        },
        "lessons": [
            {
                "title": "Les animaux domestiques",
                "description": "Chien, chat et les animaux de compagnie courants.",
                "sortOrder": 1,
                "xpReward": 30,
                "tags": ["animaux"],
                "difficulty": 1,
                "words": ["chien", "chat", "lapin", "oiseau", "poisson", "hamster", "tortue", "cheval"],
            },
            {
                "title": "Les animaux sauvages",
                "description": "Lion, éléphant et les animaux que l'on trouve dans la nature.",
                "sortOrder": 2,
                "xpReward": 35,
                "tags": ["animaux"],
                "difficulty": 2,
                "words": ["lion", "éléphant", "girafe", "singe", "ours", "loup", "renard", "cerf", "dauphin", "requin"],
            },
        ],
    },
    {
        "category": {"name": "Aliments", "slug": "aliments", "sortOrder": 8},
        "module": {
            "title": "La nourriture et les boissons",
            "description": "Le vocabulaire de l'alimentation en Langue des Signes Française.",
            "level": 2,
            "sortOrder": 8,
        },
        "lessons": [
            {
                "title": "Les boissons",
                "description": "Eau, café, jus et les boissons courantes.",
                "sortOrder": 1,
                "xpReward": 30,
                "tags": ["aliments", "boissons"],
                "difficulty": 2,
                "words": ["eau", "café", "thé", "lait", "jus", "bière", "vin", "soda"],
            },
            {
                "title": "Les aliments de base",
                "description": "Pain, fromage, viande et les aliments du quotidien.",
                "sortOrder": 2,
                "xpReward": 35,
                "tags": ["aliments"],
                "difficulty": 2,
                "words": ["pain", "fromage", "viande", "poulet", "poisson", "œuf", "riz", "pâtes", "soupe", "pizza"],
            },
            {
                "title": "Les fruits et légumes",
                "description": "Pomme, carotte et les fruits et légumes courants.",
                "sortOrder": 3,
                "xpReward": 35,
                "tags": ["aliments", "fruits", "légumes"],
                "difficulty": 2,
                "words": ["pomme", "banane", "orange", "fraise", "tomate", "carotte", "salade", "champignon"],
            },
        ],
    },
    {
        "category": {"name": "Temps & Météo", "slug": "temps-meteo", "sortOrder": 9},
        "module": {
            "title": "Le temps et la météo",
            "description": "Parlez du temps qu'il fait et des jours de la semaine en LSF.",
            "level": 2,
            "sortOrder": 9,
        },
        "lessons": [
            {
                "title": "Les jours de la semaine",
                "description": "Lundi, mardi et tous les jours de la semaine.",
                "sortOrder": 1,
                "xpReward": 30,
                "tags": ["temps", "jours"],
                "difficulty": 2,
                "words": ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche", "aujourd'hui", "demain", "hier"],
            },
            {
                "title": "Les mois de l'année",
                "description": "Janvier, février et tous les mois de l'année.",
                "sortOrder": 2,
                "xpReward": 40,
                "tags": ["temps", "mois"],
                "difficulty": 2,
                "words": ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
            },
            {
                "title": "La météo",
                "description": "Soleil, pluie, neige et les conditions météo.",
                "sortOrder": 3,
                "xpReward": 30,
                "tags": ["météo"],
                "difficulty": 2,
                "words": ["soleil", "pluie", "neige", "vent", "nuage", "orage", "chaud", "froid", "beau"],
            },
        ],
    },
    {
        "category": {"name": "Émotions", "slug": "emotions", "sortOrder": 10},
        "module": {
            "title": "Les émotions et les sentiments",
            "description": "Exprimez vos émotions et vos états d'âme en Langue des Signes Française.",
            "level": 2,
            "sortOrder": 10,
        },
        "lessons": [
            {
                "title": "Les émotions de base",
                "description": "Heureux, triste, en colère et les émotions fondamentales.",
                "sortOrder": 1,
                "xpReward": 35,
                "tags": ["émotions", "sentiments"],
                "difficulty": 2,
                "words": ["heureux", "triste", "colère", "peur", "surprise", "dégoût", "amour", "fatigué", "inquiet", "jaloux"],
            },
            {
                "title": "Les états et sensations",
                "description": "Avoir faim, soif, froid ou chaud.",
                "sortOrder": 2,
                "xpReward": 30,
                "tags": ["émotions", "sensations"],
                "difficulty": 2,
                "words": ["faim", "soif", "sommeil", "malade", "mal", "bien", "beau", "laid"],
            },
        ],
    },
    {
        "category": {"name": "Maison", "slug": "maison", "sortOrder": 11},
        "module": {
            "title": "La maison et les pièces",
            "description": "Décrivez votre maison et les objets du quotidien en LSF.",
            "level": 2,
            "sortOrder": 11,
        },
        "lessons": [
            {
                "title": "Les pièces de la maison",
                "description": "Chambre, cuisine, salon et les pièces de la maison.",
                "sortOrder": 1,
                "xpReward": 35,
                "tags": ["maison", "pièces"],
                "difficulty": 2,
                "words": ["maison", "appartement", "chambre", "cuisine", "salon", "salle de bain", "jardin", "escalier", "porte", "fenêtre"],
            },
            {
                "title": "Les objets du quotidien",
                "description": "Table, chaise, téléphone et les objets courants.",
                "sortOrder": 2,
                "xpReward": 35,
                "tags": ["maison", "objets"],
                "difficulty": 2,
                "words": ["table", "chaise", "lit", "télévision", "téléphone", "ordinateur", "livre", "lampe"],
            },
        ],
    },
    {
        "category": {"name": "École & Travail", "slug": "ecole-travail", "sortOrder": 12},
        "module": {
            "title": "L'école et le travail",
            "description": "Le vocabulaire de l'école, des études et du monde du travail en LSF.",
            "level": 3,
            "sortOrder": 12,
        },
        "lessons": [
            {
                "title": "À l'école",
                "description": "Professeur, élève, classe et le vocabulaire scolaire.",
                "sortOrder": 1,
                "xpReward": 40,
                "tags": ["école", "études"],
                "difficulty": 2,
                "words": ["école", "classe", "professeur", "élève", "livre", "stylo", "crayon", "bureau", "étudier", "apprendre"],
            },
            {
                "title": "Le travail",
                "description": "Les métiers et le monde professionnel.",
                "sortOrder": 2,
                "xpReward": 45,
                "tags": ["travail", "métiers"],
                "difficulty": 3,
                "words": ["médecin", "infirmier", "pompier", "policier", "cuisinier", "architecte", "avocat", "ingénieur", "acteur", "journaliste"],
            },
        ],
    },
    {
        "category": {"name": "Transports", "slug": "transports", "sortOrder": 13},
        "module": {
            "title": "Les transports",
            "description": "Voiture, train, avion — les moyens de transport en LSF.",
            "level": 3,
            "sortOrder": 13,
        },
        "lessons": [
            {
                "title": "Les moyens de transport",
                "description": "Voiture, vélo, bus et les transports du quotidien.",
                "sortOrder": 1,
                "xpReward": 40,
                "tags": ["transports"],
                "difficulty": 2,
                "words": ["voiture", "vélo", "bus", "métro", "train", "avion", "bateau", "moto", "taxi", "marcher"],
            },
        ],
    },
    {
        "category": {"name": "Sports & Loisirs", "slug": "sports", "sortOrder": 14},
        "module": {
            "title": "Sports et loisirs",
            "description": "Le vocabulaire du sport et des activités en LSF.",
            "level": 3,
            "sortOrder": 14,
        },
        "lessons": [
            {
                "title": "Les sports",
                "description": "Football, tennis, natation et les sports populaires.",
                "sortOrder": 1,
                "xpReward": 40,
                "tags": ["sport"],
                "difficulty": 3,
                "words": ["football", "tennis", "natation", "basketball", "vélo", "course", "sport", "équipe", "match", "gagner", "perdre"],
            },
            {
                "title": "Les loisirs",
                "description": "Cinéma, musique, lecture et les activités de loisirs.",
                "sortOrder": 2,
                "xpReward": 35,
                "tags": ["loisirs"],
                "difficulty": 3,
                "words": ["cinéma", "musique", "lecture", "voyage", "photo", "danse", "théâtre", "jeu", "vacances"],
            },
        ],
    },
    {
        "category": {"name": "Vêtements", "slug": "vetements", "sortOrder": 15},
        "module": {
            "title": "Les vêtements",
            "description": "Pantalon, robe, chaussures — habiller son vocabulaire en LSF.",
            "level": 2,
            "sortOrder": 15,
        },
        "lessons": [
            {
                "title": "Les vêtements du haut",
                "description": "T-shirt, veste, manteau et les vêtements du haut du corps.",
                "sortOrder": 1,
                "xpReward": 35,
                "tags": ["vêtements"],
                "difficulty": 2,
                "words": ["chemise", "t-shirt", "pull", "veste", "manteau", "robe", "jupe", "costume", "pyjama", "imperméable"],
            },
            {
                "title": "Les vêtements du bas et accessoires",
                "description": "Pantalon, chaussures, chapeau et les accessoires.",
                "sortOrder": 2,
                "xpReward": 35,
                "tags": ["vêtements", "accessoires"],
                "difficulty": 2,
                "words": ["pantalon", "jean", "short", "chaussure", "botte", "chaussette", "chapeau", "écharpe", "gant", "lunettes", "sac"],
            },
        ],
    },
    {
        "category": {"name": "Santé", "slug": "sante", "sortOrder": 16},
        "module": {
            "title": "La santé et le corps médical",
            "description": "Médecin, hôpital, maladie — le vocabulaire de la santé en LSF.",
            "level": 3,
            "sortOrder": 16,
        },
        "lessons": [
            {
                "title": "Les maladies et symptômes",
                "description": "Fièvre, toux, douleur et les mots pour décrire son état de santé.",
                "sortOrder": 1,
                "xpReward": 40,
                "tags": ["santé", "maladie"],
                "difficulty": 3,
                "words": ["fièvre", "toux", "rhume", "grippe", "allergie", "douleur", "blessure", "opération", "médicament", "ordonnance"],
            },
            {
                "title": "L'hôpital et les soins",
                "description": "Hôpital, ambulance, urgences et les lieux de soin.",
                "sortOrder": 2,
                "xpReward": 40,
                "tags": ["santé", "hôpital"],
                "difficulty": 3,
                "words": ["hôpital", "pharmacie", "ambulance", "urgence", "chirurgien", "dentiste", "kiné", "vaccin", "sang", "radio"],
            },
        ],
    },
    {
        "category": {"name": "Ville & Lieux", "slug": "ville-lieux", "sortOrder": 17},
        "module": {
            "title": "La ville et ses lieux",
            "description": "Se repérer en ville et nommer les lieux importants en LSF.",
            "level": 2,
            "sortOrder": 17,
        },
        "lessons": [
            {
                "title": "Les lieux publics",
                "description": "Mairie, supermarché, restaurant et les lieux du quotidien.",
                "sortOrder": 1,
                "xpReward": 35,
                "tags": ["ville", "lieux"],
                "difficulty": 2,
                "words": ["supermarché", "restaurant", "boulangerie", "banque", "poste", "bibliothèque", "musée", "église", "mairie", "hôtel"],
            },
            {
                "title": "Se repérer",
                "description": "Rue, avenue, place et les mots pour s'orienter en ville.",
                "sortOrder": 2,
                "xpReward": 30,
                "tags": ["ville", "orientation"],
                "difficulty": 2,
                "words": ["rue", "avenue", "place", "pont", "quartier", "centre", "droite", "gauche", "tout droit", "loin", "proche"],
            },
        ],
    },
    {
        "category": {"name": "Nature", "slug": "nature", "sortOrder": 18},
        "module": {
            "title": "La nature et l'environnement",
            "description": "Mer, montagne, forêt — la nature en Langue des Signes Française.",
            "level": 2,
            "sortOrder": 18,
        },
        "lessons": [
            {
                "title": "Les paysages",
                "description": "Mer, montagne, rivière et les paysages naturels.",
                "sortOrder": 1,
                "xpReward": 35,
                "tags": ["nature", "paysages"],
                "difficulty": 2,
                "words": ["mer", "montagne", "rivière", "forêt", "plage", "île", "désert", "vallée", "colline", "lac"],
            },
            {
                "title": "La nature et l'environnement",
                "description": "Arbre, fleur, planète et les mots de l'environnement.",
                "sortOrder": 2,
                "xpReward": 35,
                "tags": ["nature", "environnement"],
                "difficulty": 2,
                "words": ["arbre", "fleur", "herbe", "soleil", "lune", "étoile", "planète", "terre", "air", "feu", "eau"],
            },
        ],
    },
    {
        "category": {"name": "Verbes courants", "slug": "verbes", "sortOrder": 19},
        "module": {
            "title": "Les verbes du quotidien",
            "description": "Manger, dormir, parler — les verbes essentiels pour communiquer en LSF.",
            "level": 2,
            "sortOrder": 19,
        },
        "lessons": [
            {
                "title": "Actions du quotidien",
                "description": "Manger, boire, dormir et les actions de tous les jours.",
                "sortOrder": 1,
                "xpReward": 40,
                "tags": ["verbes", "actions"],
                "difficulty": 2,
                "words": ["manger", "boire", "dormir", "marcher", "courir", "lire", "écrire", "regarder", "écouter", "travailler"],
            },
            {
                "title": "Communication et relations",
                "description": "Parler, comprendre, aimer et les verbes de relation.",
                "sortOrder": 2,
                "xpReward": 40,
                "tags": ["verbes", "communication"],
                "difficulty": 2,
                "words": ["parler", "comprendre", "demander", "répondre", "aimer", "aider", "donner", "prendre", "venir", "partir", "rester"],
            },
            {
                "title": "Verbes de mouvement",
                "description": "Entrer, sortir, monter et les verbes de déplacement.",
                "sortOrder": 3,
                "xpReward": 35,
                "tags": ["verbes", "mouvement"],
                "difficulty": 3,
                "words": ["entrer", "sortir", "monter", "descendre", "tomber", "lever", "asseoir", "arrêter", "commencer", "finir"],
            },
        ],
    },
    {
        "category": {"name": "Questions & Pronoms", "slug": "questions-pronoms", "sortOrder": 20},
        "module": {
            "title": "Questions et pronoms",
            "description": "Qui, quoi, où, quand, comment — les outils de base pour former des phrases en LSF.",
            "level": 1,
            "sortOrder": 20,
        },
        "lessons": [
            {
                "title": "Les mots interrogatifs",
                "description": "Qui, quoi, où, quand, comment et pourquoi.",
                "sortOrder": 1,
                "xpReward": 30,
                "tags": ["questions", "interrogatifs"],
                "difficulty": 1,
                "words": ["qui", "quoi", "où", "quand", "comment", "pourquoi", "combien", "lequel"],
            },
            {
                "title": "Les pronoms personnels",
                "description": "Je, tu, il, elle, nous, vous, ils — les pronoms en LSF.",
                "sortOrder": 2,
                "xpReward": 30,
                "tags": ["pronoms"],
                "difficulty": 1,
                "words": ["je", "tu", "il", "elle", "nous", "vous", "ils", "moi", "toi", "lui"],
            },
        ],
    },
    {
        "category": {"name": "Nombres avancés", "slug": "nombres-avances", "sortOrder": 21},
        "module": {
            "title": "Les grands nombres",
            "description": "De trente à un million — les nombres avancés en LSF.",
            "level": 2,
            "sortOrder": 21,
        },
        "lessons": [
            {
                "title": "30 à 100",
                "description": "Trente, quarante, cinquante jusqu'à cent.",
                "sortOrder": 1,
                "xpReward": 35,
                "tags": ["chiffres", "nombres"],
                "difficulty": 2,
                "words": ["trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingts", "quatre-vingt-dix", "cent"],
            },
            {
                "title": "Mille et plus",
                "description": "Mille, million et les grands nombres.",
                "sortOrder": 2,
                "xpReward": 30,
                "tags": ["chiffres", "nombres"],
                "difficulty": 2,
                "words": ["mille", "million", "milliard", "premier", "deuxième", "troisième", "dernier", "moitié"],
            },
        ],
    },
    {
        "category": {"name": "Shopping & Argent", "slug": "shopping-argent", "sortOrder": 22},
        "module": {
            "title": "Le shopping et l'argent",
            "description": "Acheter, payer, prix — le vocabulaire des courses et de l'argent en LSF.",
            "level": 3,
            "sortOrder": 22,
        },
        "lessons": [
            {
                "title": "Faire les courses",
                "description": "Magasin, acheter, vendre et les mots du commerce.",
                "sortOrder": 1,
                "xpReward": 40,
                "tags": ["shopping", "commerce"],
                "difficulty": 3,
                "words": ["acheter", "vendre", "payer", "prix", "cher", "gratuit", "solde", "cadeau", "carte", "caisse"],
            },
            {
                "title": "L'argent",
                "description": "Euro, monnaie, banque et les mots liés à l'argent.",
                "sortOrder": 2,
                "xpReward": 35,
                "tags": ["argent"],
                "difficulty": 3,
                "words": ["euro", "monnaie", "billet", "pièce", "banque", "compte", "riche", "pauvre", "dépenser", "économiser"],
            },
        ],
    },
    {
        "category": {"name": "Technologie", "slug": "technologie", "sortOrder": 23},
        "module": {
            "title": "La technologie et le numérique",
            "description": "Internet, téléphone, ordinateur — le vocabulaire du numérique en LSF.",
            "level": 3,
            "sortOrder": 23,
        },
        "lessons": [
            {
                "title": "Les appareils",
                "description": "Téléphone, tablette, ordinateur et les appareils du quotidien.",
                "sortOrder": 1,
                "xpReward": 40,
                "tags": ["technologie", "appareils"],
                "difficulty": 3,
                "words": ["téléphone", "ordinateur", "tablette", "télévision", "radio", "appareil photo", "imprimante", "écran", "clavier", "souris"],
            },
            {
                "title": "Internet et réseaux",
                "description": "Internet, message, vidéo et les mots du numérique.",
                "sortOrder": 2,
                "xpReward": 40,
                "tags": ["technologie", "internet"],
                "difficulty": 3,
                "words": ["internet", "message", "email", "vidéo", "photo", "application", "jeu vidéo", "réseau", "mot de passe", "chercher"],
            },
        ],
    },
    {
        "category": {"name": "Pays & Nationalités", "slug": "pays-nationalites", "sortOrder": 24},
        "module": {
            "title": "Les pays et nationalités",
            "description": "France, Allemagne, Japon — les pays du monde en LSF.",
            "level": 3,
            "sortOrder": 24,
        },
        "lessons": [
            {
                "title": "Les pays d'Europe",
                "description": "France, Espagne, Allemagne et les pays européens.",
                "sortOrder": 1,
                "xpReward": 40,
                "tags": ["pays", "europe"],
                "difficulty": 3,
                "words": ["France", "Espagne", "Allemagne", "Italie", "Angleterre", "Portugal", "Belgique", "Suisse", "Europe", "étranger"],
            },
            {
                "title": "Le monde",
                "description": "Amérique, Asie, Afrique et les continents.",
                "sortOrder": 2,
                "xpReward": 40,
                "tags": ["pays", "monde"],
                "difficulty": 3,
                "words": ["Amérique", "Asie", "Afrique", "Japon", "Chine", "Maroc", "monde", "continent", "langue", "culture"],
            },
        ],
    },
    {
        "category": {"name": "Fêtes & Occasions", "slug": "fetes-occasions", "sortOrder": 25},
        "module": {
            "title": "Fêtes et occasions spéciales",
            "description": "Noël, anniversaire, mariage — les grandes occasions en LSF.",
            "level": 2,
            "sortOrder": 25,
        },
        "lessons": [
            {
                "title": "Les fêtes",
                "description": "Noël, Pâques, Nouvel An et les fêtes de l'année.",
                "sortOrder": 1,
                "xpReward": 35,
                "tags": ["fêtes"],
                "difficulty": 2,
                "words": ["Noël", "Pâques", "anniversaire", "fête", "cadeau", "gâteau", "bougie", "champagne", "félicitations", "bonne année"],
            },
            {
                "title": "Les événements de vie",
                "description": "Mariage, naissance, diplôme et les grands moments de vie.",
                "sortOrder": 2,
                "xpReward": 35,
                "tags": ["événements"],
                "difficulty": 2,
                "words": ["mariage", "naissance", "mort", "diplôme", "retraite", "fiance", "fiançailles", "cérémonie", "invité", "souvenir"],
            },
        ],
    },
    {
        "category": {"name": "Adjectifs", "slug": "adjectifs", "sortOrder": 26},
        "module": {
            "title": "Les adjectifs essentiels",
            "description": "Grand, petit, rapide, lent — les adjectifs pour décrire le monde en LSF.",
            "level": 2,
            "sortOrder": 26,
        },
        "lessons": [
            {
                "title": "Taille et forme",
                "description": "Grand, petit, gros, mince et les adjectifs de taille.",
                "sortOrder": 1,
                "xpReward": 35,
                "tags": ["adjectifs", "description"],
                "difficulty": 2,
                "words": ["grand", "petit", "gros", "mince", "long", "court", "large", "étroit", "rond", "carré"],
            },
            {
                "title": "Qualités et défauts",
                "description": "Bon, mauvais, gentil, méchant et les adjectifs de caractère.",
                "sortOrder": 2,
                "xpReward": 35,
                "tags": ["adjectifs", "caractère"],
                "difficulty": 2,
                "words": ["bon", "mauvais", "gentil", "méchant", "intelligent", "fort", "faible", "rapide", "lent", "nouveau", "vieux"],
            },
        ],
    },
    {
        "category": {"name": "Musique & Arts", "slug": "musique-arts", "sortOrder": 27},
        "module": {
            "title": "La musique et les arts",
            "description": "Chanter, dessiner, peindre — le vocabulaire artistique en LSF.",
            "level": 3,
            "sortOrder": 27,
        },
        "lessons": [
            {
                "title": "La musique",
                "description": "Chanter, guitare, piano et le vocabulaire musical.",
                "sortOrder": 1,
                "xpReward": 40,
                "tags": ["musique"],
                "difficulty": 3,
                "words": ["chanter", "guitare", "piano", "batterie", "violon", "flûte", "concert", "chanson", "rythme", "mélodie"],
            },
            {
                "title": "Les arts visuels",
                "description": "Dessiner, peindre, sculpter et les arts plastiques.",
                "sortOrder": 2,
                "xpReward": 40,
                "tags": ["arts", "peinture"],
                "difficulty": 3,
                "words": ["dessiner", "peindre", "sculpture", "peinture", "couleur", "tableau", "exposition", "artiste", "créer", "imaginer"],
            },
        ],
    },
    {
        "category": {"name": "Cuisine & Recettes", "slug": "cuisine", "sortOrder": 30},
        "module": {"title": "La cuisine", "description": "Cuisiner, recette, ustensiles — la cuisine en LSF.", "level": 2, "sortOrder": 30},
        "lessons": [
            {"title": "Cuisiner", "description": "Couper, cuire, mélanger et les gestes en cuisine.", "sortOrder": 1, "xpReward": 35, "tags": ["cuisine"], "difficulty": 2,
             "words": ["cuisiner", "couper", "cuire", "mélanger", "bouillir", "frire", "goût", "sel", "sucre", "épice", "huile", "beurre"]},
            {"title": "Les ustensiles", "description": "Couteau, casserole, four et les ustensiles de cuisine.", "sortOrder": 2, "xpReward": 30, "tags": ["cuisine", "ustensiles"], "difficulty": 2,
             "words": ["couteau", "fourchette", "cuillère", "assiette", "verre", "casserole", "four", "poêle", "réfrigérateur", "micro-ondes"]},
        ],
    },
    {
        "category": {"name": "École — matières", "slug": "matieres-scolaires", "sortOrder": 31},
        "module": {"title": "Les matières scolaires", "description": "Mathématiques, histoire, géographie — les matières à l'école en LSF.", "level": 2, "sortOrder": 31},
        "lessons": [
            {"title": "Les matières", "description": "Maths, français, histoire et les matières scolaires.", "sortOrder": 1, "xpReward": 35, "tags": ["école", "matières"], "difficulty": 2,
             "words": ["mathématiques", "français", "histoire", "géographie", "science", "physique", "chimie", "biologie", "philosophie", "dessin", "musique", "sport"]},
            {"title": "Le travail scolaire", "description": "Exercice, devoir, examen et le travail à l'école.", "sortOrder": 2, "xpReward": 30, "tags": ["école", "travail"], "difficulty": 2,
             "words": ["exercice", "devoir", "examen", "note", "résultat", "erreur", "correct", "question", "réponse", "comprendre"]},
        ],
    },
    {
        "category": {"name": "Temps — durée", "slug": "temps-duree", "sortOrder": 32},
        "module": {"title": "La durée et le temps", "description": "Heure, minute, semaine — exprimer la durée en LSF.", "level": 2, "sortOrder": 32},
        "lessons": [
            {"title": "L'heure", "description": "Heure, minute, seconde et lire l'heure en LSF.", "sortOrder": 1, "xpReward": 30, "tags": ["temps", "heure"], "difficulty": 2,
             "words": ["heure", "minute", "seconde", "matin", "après-midi", "soir", "nuit", "midi", "minuit", "maintenant", "bientôt", "tard"]},
            {"title": "La durée", "description": "Jour, semaine, mois, année et les unités de temps.", "sortOrder": 2, "xpReward": 30, "tags": ["temps", "durée"], "difficulty": 2,
             "words": ["jour", "semaine", "mois", "année", "siècle", "longtemps", "vite", "toujours", "jamais", "souvent", "parfois"]},
        ],
    },
    {
        "category": {"name": "Communauté sourde", "slug": "communaute-sourde", "sortOrder": 33},
        "module": {"title": "La communauté sourde", "description": "Sourd, LSF, interprète — le vocabulaire propre à la communauté sourde.", "level": 1, "sortOrder": 33},
        "lessons": [
            {"title": "Surdité et LSF", "description": "Les mots essentiels autour de la surdité et de la langue des signes.", "sortOrder": 1, "xpReward": 40, "tags": ["surdité", "LSF", "communauté"], "difficulty": 1,
             "words": ["sourd", "malentendant", "entendant", "interprète", "langue des signes", "LSF", "signer", "lecture labiale", "implant", "appareillage", "communauté", "culture sourde"]},
        ],
    },
    {
        "category": {"name": "Religion & Spiritualité", "slug": "religion", "sortOrder": 28},
        "module": {
            "title": "Religion et spiritualité",
            "description": "Les mots liés à la foi, à la religion et à la spiritualité en LSF.",
            "level": 3,
            "sortOrder": 28,
        },
        "lessons": [
            {
                "title": "Les religions",
                "description": "Dieu, prière, église et les mots des grandes religions.",
                "sortOrder": 1,
                "xpReward": 40,
                "tags": ["religion"],
                "difficulty": 3,
                "words": ["Dieu", "prière", "église", "mosquée", "synagogue", "chrétien", "musulman", "juif", "bouddhiste", "croire"],
            },
        ],
    },
    {
        "category": {"name": "Politique & Société", "slug": "politique-societe", "sortOrder": 29},
        "module": {
            "title": "La politique et la société",
            "description": "Président, élection, loi — le vocabulaire civique en LSF.",
            "level": 3,
            "sortOrder": 29,
        },
        "lessons": [
            {
                "title": "La vie politique",
                "description": "Président, gouvernement, élection et les mots de la politique.",
                "sortOrder": 1,
                "xpReward": 45,
                "tags": ["politique"],
                "difficulty": 3,
                "words": ["président", "gouvernement", "loi", "élection", "vote", "parti", "ministre", "parlement", "liberté", "droit"],
            },
            {
                "title": "La société",
                "description": "Citoyen, égalité, pauvreté et les enjeux de société.",
                "sortOrder": 2,
                "xpReward": 45,
                "tags": ["société"],
                "difficulty": 3,
                "words": ["citoyen", "égalité", "pauvreté", "solidarité", "guerre", "paix", "environnement", "justice", "racisme", "handicap"],
            },
        ],
    },
    {
        "category": {"name": "Animaux de compagnie", "slug": "animaux-compagnie", "sortOrder": 36},
        "module": {
            "title": "Les animaux de compagnie",
            "description": "Chiens, chats et tous les animaux qu'on aime à la maison.",
            "level": 1,
            "sortOrder": 36,
        },
        "lessons": [
            {
                "title": "Nos animaux préférés",
                "description": "Les animaux de compagnie les plus courants.",
                "sortOrder": 1,
                "xpReward": 30,
                "tags": ["animaux", "compagnie"],
                "difficulty": 1,
                "words": ["chien", "chat", "lapin", "hamster", "perroquet", "tortue", "poisson rouge", "perruche", "furet", "canari", "cochon d'Inde", "rat", "souris", "cheval", "vétérinaire"],
            },
        ],
    },
    {
        "category": {"name": "Architecture & Bâtiments", "slug": "architecture", "sortOrder": 37},
        "module": {
            "title": "Architecture et bâtiments",
            "description": "Les bâtiments, monuments et structures que l'on rencontre en ville.",
            "level": 2,
            "sortOrder": 37,
        },
        "lessons": [
            {
                "title": "En ville",
                "description": "Les bâtiments et lieux de la vie urbaine.",
                "sortOrder": 1,
                "xpReward": 35,
                "tags": ["architecture", "ville"],
                "difficulty": 2,
                "words": ["immeuble", "pont", "tour", "cathédrale", "château", "palais", "stade", "bibliothèque", "mairie", "tribunal", "prison", "usine", "phare", "mosquée", "synagogue", "temple", "fontaine"],
            },
        ],
    },
    {
        "category": {"name": "Sciences & Biologie", "slug": "sciences", "sortOrder": 38},
        "module": {
            "title": "Sciences et biologie",
            "description": "Le vocabulaire scientifique de base en LSF.",
            "level": 2,
            "sortOrder": 38,
        },
        "lessons": [
            {
                "title": "Concepts scientifiques",
                "description": "Les termes clés de la science et de la biologie.",
                "sortOrder": 1,
                "xpReward": 40,
                "tags": ["sciences", "biologie"],
                "difficulty": 2,
                "words": ["expérience", "laboratoire", "microscope", "atome", "cellule", "ADN", "évolution", "gravité", "énergie", "lumière", "chimie", "physique", "oxygène", "température", "virus", "bactérie", "planète"],
            },
        ],
    },
    {
        "category": {"name": "Médias & Presse", "slug": "medias", "sortOrder": 39},
        "module": {
            "title": "Médias et presse",
            "description": "L'actualité, les journaux et les médias en LSF.",
            "level": 2,
            "sortOrder": 39,
        },
        "lessons": [
            {
                "title": "S'informer",
                "description": "Les médias, la presse et les sources d'information.",
                "sortOrder": 1,
                "xpReward": 35,
                "tags": ["médias", "presse"],
                "difficulty": 2,
                "words": ["journal", "magazine", "radio", "journaliste", "reportage", "actualité", "interview", "publicité", "émission", "censure", "mensonge", "vérité", "opinion", "débat", "élection", "liberté", "information"],
            },
        ],
    },
    {
        "category": {"name": "Verbes de mouvement", "slug": "verbes-mouvement", "sortOrder": 40},
        "module": {
            "title": "Verbes de mouvement",
            "description": "Les actions de déplacement et de mouvement en LSF.",
            "level": 1,
            "sortOrder": 40,
        },
        "lessons": [
            {
                "title": "Se déplacer",
                "description": "Tous les verbes pour exprimer le mouvement.",
                "sortOrder": 1,
                "xpReward": 35,
                "tags": ["verbes", "mouvement"],
                "difficulty": 1,
                "words": ["marcher", "courir", "sauter", "nager", "grimper", "tomber", "pousser", "tirer", "tourner", "s'arrêter", "entrer", "sortir", "monter", "descendre", "traverser", "reculer", "s'asseoir"],
            },
        ],
    },
    {
        "category": {"name": "Bijoux & Accessoires", "slug": "bijoux", "sortOrder": 41},
        "module": {
            "title": "Bijoux et accessoires",
            "description": "Les accessoires de mode et les bijoux en LSF.",
            "level": 1,
            "sortOrder": 41,
        },
        "lessons": [
            {
                "title": "Se parer",
                "description": "Les bijoux et accessoires du quotidien.",
                "sortOrder": 1,
                "xpReward": 25,
                "tags": ["bijoux", "mode", "accessoires"],
                "difficulty": 1,
                "words": ["bague", "bracelet", "collier", "boucle d'oreille", "montre", "sac à main", "ceinture", "chapeau", "casquette", "lunettes", "écharpe", "gants", "parapluie", "sac à dos", "portefeuille", "pendentif", "alliance"],
            },
        ],
    },
    {
        "category": {"name": "Électroménager", "slug": "electromenager", "sortOrder": 42},
        "module": {
            "title": "Électroménager et appareils",
            "description": "Les appareils électriques de la maison en LSF.",
            "level": 1,
            "sortOrder": 42,
        },
        "lessons": [
            {
                "title": "À la maison",
                "description": "Les appareils qu'on utilise au quotidien.",
                "sortOrder": 1,
                "xpReward": 30,
                "tags": ["maison", "appareils"],
                "difficulty": 1,
                "words": ["aspirateur", "lave-linge", "lave-vaisselle", "micro-ondes", "grille-pain", "bouilloire", "cafetière", "congélateur", "sèche-linge", "fer à repasser", "ventilateur", "climatiseur", "radiateur", "mixeur", "alarme"],
            },
        ],
    },
    {
        "category": {"name": "Relations sociales", "slug": "relations-sociales", "sortOrder": 43},
        "module": {
            "title": "Relations sociales",
            "description": "Les liens entre les personnes et la vie en communauté en LSF.",
            "level": 1,
            "sortOrder": 43,
        },
        "lessons": [
            {
                "title": "Les liens humains",
                "description": "Amis, voisins et les relations de la vie quotidienne.",
                "sortOrder": 1,
                "xpReward": 30,
                "tags": ["relations", "social"],
                "difficulty": 1,
                "words": ["ami", "voisin", "collègue", "inconnu", "rencontrer", "dispute", "réconciliation", "confiance", "trahison", "soutien", "solitude", "communauté", "respect", "politesse", "invitation", "rendez-vous", "félicitations"],
            },
        ],
    },
    {
        "category": {"name": "Histoire & Civilisations", "slug": "histoire", "sortOrder": 44},
        "module": {
            "title": "Histoire et civilisations",
            "description": "Les grandes périodes et civilisations de l'histoire en LSF.",
            "level": 3,
            "sortOrder": 44,
        },
        "lessons": [
            {
                "title": "Grands moments de l'histoire",
                "description": "Les mots pour parler de l'histoire et des civilisations.",
                "sortOrder": 1,
                "xpReward": 40,
                "tags": ["histoire", "civilisation"],
                "difficulty": 3,
                "words": ["roi", "reine", "empire", "révolution", "esclavage", "colonisation", "indépendance", "siècle", "Moyen Âge", "Renaissance", "résistance", "monument", "archéologie", "civilisation", "tradition", "patrimoine"],
            },
        ],
    },
    {
        "category": {"name": "Éducation Sexuelle", "slug": "education-sexuelle", "sortOrder": 45},
        "module": {
            "title": "Éducation sexuelle et santé reproductive",
            "description": "Apprenez le vocabulaire essentiel sur la sexualité, la reproduction et la santé sexuelle en Langue des Signes Française.",
            "level": 3,
            "sortOrder": 35,
        },
        "lessons": [
            {
                "title": "Anatomie et physiologie",
                "description": "Les parties du corps et les termes anatomiques liés à la reproduction.",
                "sortOrder": 1,
                "xpReward": 40,
                "tags": ["éducation sexuelle", "anatomie", "corps"],
                "difficulty": 3,
                "words": ["pénis", "vagin", "testicule", "ovaire", "utérus", "prostate", "sein", "clitoris", "scrotum", "sperme", "ovule", "menstruation", "cycle menstruel", "puberté"],
            },
            {
                "title": "Reproduction et sexualité",
                "description": "Grossesse, conception, relations sexuelles et la reproduction humaine.",
                "sortOrder": 2,
                "xpReward": 45,
                "tags": ["éducation sexuelle", "reproduction", "grossesse"],
                "difficulty": 3,
                "words": ["sexe", "rapport sexuel", "relation sexuelle", "grossesse", "enceinte", "conception", "fécondation", "embryon", "fœtus", "accouchement", "travail", "placenta", "cordon ombilical", "naissance"],
            },
            {
                "title": "Contraception et prévention",
                "description": "Les moyens de contraception et la prévention des infections sexuellement transmissibles.",
                "sortOrder": 3,
                "xpReward": 40,
                "tags": ["éducation sexuelle", "contraception", "prévention"],
                "difficulty": 3,
                "words": ["contraception", "préservatif", "pilule", "DIU", "stérilet", "implant", "injection", "vasectomie", "ligature des trompes", "infection sexuellement transmissible", "IST", "MST", "dépistage", "test"],
            },
            {
                "title": "Hygiène et santé sexuelle",
                "description": "L'hygiène personnelle, la santé et le bien-être dans une vie sexuelle.",
                "sortOrder": 4,
                "xpReward": 35,
                "tags": ["éducation sexuelle", "hygiène", "santé"],
                "difficulty": 3,
                "words": ["hygiène", "toilette", "savon", "eau", "propre", "impuissance", "frigidité", "érection", "orgasme", "plaisir", "désir", "libido", "santé sexuelle", "bien-être"],
            },
            {
                "title": "Consentement et relations saines",
                "description": "Le consentement, la communication et les relations respectueuses.",
                "sortOrder": 5,
                "xpReward": 45,
                "tags": ["éducation sexuelle", "consentement", "relations"],
                "difficulty": 3,
                "words": ["consentement", "accord", "refus", "oui", "non", "respect", "communication", "confiance", "relation", "couple", "harcèlement", "agression sexuelle", "viol", "consentir", "refuser", "discuter"],
            },
            {
                "title": "Identité et orientation sexuelle",
                "description": "L'identité de genre, l'orientation sexuelle et l'acceptation.",
                "sortOrder": 6,
                "xpReward": 40,
                "tags": ["éducation sexuelle", "identité", "orientation"],
                "difficulty": 3,
                "words": ["genre", "homme", "femme", "non-binaire", "transgenre", "cisgenre", "hétérosexuel", "homosexuel", "bisexuel", "asexuel", "pansexuel", "orientation sexuelle", "identité de genre", "coming-out", "inclusion", "diversité"],
            },
            {
                "title": "Enjeux et bien-être",
                "description": "Les enjeux liés à la sexualité et le bien-être émotionnel.",
                "sortOrder": 7,
                "xpReward": 40,
                "tags": ["éducation sexuelle", "émotions", "bien-être"],
                "difficulty": 3,
                "words": ["amour", "amitié", "respect", "égalité", "confiage", "timidité", "anxiété", "dépression", "dépister", "abus", "violence", "soutien", "psychologue", "counsellor", "éducateur", "parent"],
            },
        ],
    },
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    """Convertit un texte en slug ASCII (ex: 'Au revoir' → 'au-revoir')."""
    text = text.lower().strip()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")  # retire les accents
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text


def fetch_elix(word: str) -> dict | None:
    """Interroge l'API Elix et retourne le premier résultat pertinent."""
    url = f"{ELIX_BASE}/words?{urlencode({'q': word})}"
    try:
        req = Request(url, headers={"Accept": "application/json"})
        with urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
            data = json.loads(resp.read().decode())
    except (HTTPError, URLError, json.JSONDecodeError) as e:
        print(f"    ⚠ Erreur réseau pour '{word}': {e}", file=sys.stderr)
        return None

    words = data.get("data") or []
    if not words:
        return None

    # Cherche un mot avec des signes vidéo
    best = next(
        (w for w in words if any(m.get("wordSigns") for m in w.get("meanings", []))),
        words[0],
    )

    meanings = best.get("meanings", [])
    first_meaning = meanings[0] if meanings else {}
    definition = first_meaning.get("definition") or None

    # Collecte tous les signes de tous les meanings
    all_signs = [s for m in meanings for s in m.get("wordSigns", [])]

    video_url = all_signs[0].get("uri") if all_signs else None
    thumbnail_url = all_signs[0].get("image") if all_signs else None

    return {
        "word": best.get("name", word),
        "definition": definition,
        "videoUrl": video_url,
        "thumbnailUrl": thumbnail_url,
    }


# ── Import principal ──────────────────────────────────────────────────────────

def build_seed() -> list:
    result = []
    total_words = sum(len(l["words"]) for cat in CATALOG for l in cat["lessons"])
    done = 0

    for cat_entry in CATALOG:
        cat = cat_entry["category"]
        mod = cat_entry["module"]
        lessons_out = []

        print(f"\n📁 Catégorie : {cat['name']}")

        for lesson_def in cat_entry["lessons"]:
            signs_out = []
            print(f"  📖 Leçon : {lesson_def['title']}")

            for word in lesson_def["words"]:
                done += 1
                print(f"    [{done}/{total_words}] {word}...", end=" ", flush=True)

                elix = fetch_elix(word)
                time.sleep(DELAY_BETWEEN_REQUESTS)

                if elix and elix.get("videoUrl"):
                    print(f"✅  {elix['videoUrl'][:60]}...")
                elif elix:
                    print("⚠ pas de vidéo")
                else:
                    print("❌ introuvable")

                signs_out.append({
                    "word": elix["word"] if elix else word,
                    "slug": slugify(word),
                    "definition": elix["definition"] if elix else None,
                    "thumbnailUrl": elix["thumbnailUrl"] if elix else None,
                    "videoUrl": elix["videoUrl"] if elix else None,
                    "gifUrl": None,
                })

            lessons_out.append({
                "title": lesson_def["title"],
                "description": lesson_def.get("description"),
                "sortOrder": lesson_def["sortOrder"],
                "xpReward": lesson_def["xpReward"],
                "tags": lesson_def["tags"],
                "difficulty": lesson_def["difficulty"],
                "signs": signs_out,
            })

        result.append({
            "category": cat,
            "module": mod,
            "lessons": lessons_out,
        })

    return result


def main():
    print("=" * 60)
    print("  Import Elix LSF → seed JSON")
    print("=" * 60)
    print(f"Output : {OUTPUT_PATH}")
    print(f"Catégories : {len(CATALOG)}")
    total = sum(len(l["words"]) for cat in CATALOG for l in cat["lessons"])
    print(f"Mots à importer : {total}")
    print(f"Délai entre requêtes : {DELAY_BETWEEN_REQUESTS}s")
    print(f"Durée estimée : ~{int(total * DELAY_BETWEEN_REQUESTS // 60)}m{int(total * DELAY_BETWEEN_REQUESTS % 60)}s")
    print()

    seed = build_seed()

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(seed, f, ensure_ascii=False, indent=2)

    # Stats
    total_signs = sum(len(l["signs"]) for entry in seed for l in entry["lessons"])
    with_video = sum(1 for entry in seed for l in entry["lessons"] for s in l["signs"] if s.get("videoUrl"))
    print(f"\n{'=' * 60}")
    print(f"✅  Terminé !")
    print(f"   Signes générés : {total_signs}")
    print(f"   Avec vidéo     : {with_video} ({with_video * 100 // total_signs if total_signs else 0}%)")
    print(f"   Sans vidéo     : {total_signs - with_video}")
    print(f"   Fichier        : {OUTPUT_PATH}")
    print()
    print("Redémarre l'API pour que le seeder charge le nouveau fichier.")


if __name__ == "__main__":
    main()
