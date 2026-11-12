#!/usr/bin/env python3
"""Enrichit les modules à 8 phrases restants."""
import json

PATH = '/home/raphaelcau/l-ear-n-it-LSF-learning-/lsf-api/Data/seed-phrases.json'

with open(PATH) as f:
    data = json.load(f)

enrichments = {
    "Outils et bricolage": [
        {"textFr": "Je colle les deux planches ensemble.", "textLsf": "DEUX PLANCHE ENSEMBLE COLLER", "difficulty": 2, "tags": ["bricolage"], "signWords": ["colle"]},
        {"textFr": "Il faut visser l'écrou.", "textLsf": "ÉCROU VISSER FALLOIR", "difficulty": 1, "tags": ["bricolage", "outils"], "signWords": ["écrou"]},
        {"textFr": "Le clou est planté dans le mur.", "textLsf": "MUR CLOU PLANTER", "difficulty": 1, "tags": ["bricolage", "outils"], "signWords": ["clou"]},
        {"textFr": "Je peins le mur avec un rouleau.", "textLsf": "MOI MUR ROULEAU PEINDRE", "difficulty": 2, "tags": ["bricolage"], "signWords": ["rouleau", "peinture"]},
        {"textFr": "La vis est trop petite.", "textLsf": "VIS TROP PETITE", "difficulty": 1, "tags": ["bricolage", "outils"], "signWords": ["vis"]},
        {"textFr": "J'ai percé un trou dans le mur.", "textLsf": "MOI MUR TROU PERCER", "difficulty": 2, "tags": ["bricolage", "outils"], "signWords": ["perceuse"]},
        {"textFr": "Le pinceau est plein de peinture.", "textLsf": "PINCEAU PEINTURE PLEIN", "difficulty": 1, "tags": ["bricolage"], "signWords": ["pinceau", "peinture"]},
    ],
    "La santé mentale": [
        {"textFr": "J'ai besoin de décompresser.", "textLsf": "MOI DÉCOMPRESSER BESOIN", "difficulty": 1, "tags": ["santé mentale", "bien-être"], "signWords": ["bien-être"]},
        {"textFr": "La pleine conscience réduit le stress.", "textLsf": "STRESS PLEINE CONSCIENCE RÉDUIRE", "difficulty": 3, "tags": ["santé mentale", "bien-être"], "signWords": ["méditation"]},
        {"textFr": "Je parle à quelqu'un quand ça ne va pas.", "textLsf": "MOI ÇA VA PAS QUELQU'UN PARLER", "difficulty": 2, "tags": ["santé mentale"], "signWords": ["soutien"]},
        {"textFr": "L'addiction est une maladie.", "textLsf": "ADDICTION MALADIE", "difficulty": 1, "tags": ["santé mentale"], "signWords": ["addiction"]},
        {"textFr": "Ma phobie des araignées est forte.", "textLsf": "MOI ARAIGNÉE PHOBIE FORTE", "difficulty": 2, "tags": ["santé mentale"], "signWords": ["phobie"]},
        {"textFr": "Prendre du recul aide à réfléchir.", "textLsf": "RECUL PRENDRE RÉFLÉCHIR AIDER", "difficulty": 2, "tags": ["santé mentale", "bien-être"], "signWords": ["bien-être"]},
        {"textFr": "L'empathie est essentielle pour aider.", "textLsf": "EMPATHIE AIDER ESSENTIELLE", "difficulty": 2, "tags": ["santé mentale"], "signWords": ["empathie"]},
    ],
    "La danse et les arts": [
        {"textFr": "La valse est une danse élégante.", "textLsf": "VALSE DANSE ÉLÉGANTE", "difficulty": 1, "tags": ["danse"], "signWords": ["valse"]},
        {"textFr": "La souplesse est indispensable en ballet.", "textLsf": "BALLET SOUPLESSE INDISPENSABLE", "difficulty": 2, "tags": ["danse"], "signWords": ["souplesse", "ballet"]},
        {"textFr": "Le geste doit être précis.", "textLsf": "GESTE PRÉCIS DEVOIR", "difficulty": 1, "tags": ["danse", "arts"], "signWords": ["geste"]},
        {"textFr": "Il improvise sur scène.", "textLsf": "LUI SCÈNE IMPROVISER", "difficulty": 2, "tags": ["arts", "théâtre"], "signWords": ["improvisation", "scène"]},
        {"textFr": "Le rythme guide les danseurs.", "textLsf": "RYTHME DANSEUR GUIDER", "difficulty": 2, "tags": ["danse", "musique"], "signWords": ["rythme"]},
        {"textFr": "La scène est grande et lumineuse.", "textLsf": "SCÈNE GRANDE LUMINEUSE", "difficulty": 1, "tags": ["arts", "spectacle"], "signWords": ["scène", "spectacle"]},
        {"textFr": "On répète la chorégraphie chaque jour.", "textLsf": "CHORÉGRAPHIE CHAQUE JOUR RÉPÉTER", "difficulty": 2, "tags": ["danse"], "signWords": ["chorégraphie"]},
    ],
    "Les arts plastiques": [
        {"textFr": "Je prépare ma palette de couleurs.", "textLsf": "MOI PALETTE COULEUR PRÉPARER", "difficulty": 2, "tags": ["arts plastiques"], "signWords": ["palette"]},
        {"textFr": "Ce portrait est très ressemblant.", "textLsf": "CE PORTRAIT TRÈS RESSEMBLANT", "difficulty": 1, "tags": ["arts plastiques"], "signWords": ["portrait"]},
        {"textFr": "Le paysage est peint à l'huile.", "textLsf": "PAYSAGE HUILE PEINDRE", "difficulty": 2, "tags": ["arts plastiques"], "signWords": ["paysage", "peindre"]},
        {"textFr": "La galerie expose des artistes locaux.", "textLsf": "GALERIE ARTISTE LOCAL EXPOSER", "difficulty": 2, "tags": ["arts plastiques"], "signWords": ["galerie"]},
        {"textFr": "Je sculpte l'argile à la main.", "textLsf": "MOI ARGILE MAIN SCULPTER", "difficulty": 2, "tags": ["arts plastiques"], "signWords": ["sculpter"]},
        {"textFr": "Ce dessin est très créatif.", "textLsf": "CE DESSIN TRÈS CRÉATIF", "difficulty": 1, "tags": ["arts plastiques"], "signWords": ["dessiner", "créativité"]},
        {"textFr": "L'exposition ouvre la semaine prochaine.", "textLsf": "SEMAINE PROCHAINE EXPOSITION OUVRIR", "difficulty": 2, "tags": ["arts plastiques"], "signWords": ["exposition"]},
    ],
    "Fleurs et plantes": [
        {"textFr": "La marguerite pousse dans les champs.", "textLsf": "MARGUERITE CHAMP POUSSER", "difficulty": 2, "tags": ["fleurs", "nature"], "signWords": ["marguerite"]},
        {"textFr": "Le bambou grandit très vite.", "textLsf": "BAMBOU TRÈS VITE GRANDIR", "difficulty": 1, "tags": ["plantes"], "signWords": ["bambou"]},
        {"textFr": "L'herbe est verte après la pluie.", "textLsf": "PLUIE APRÈS HERBE VERTE", "difficulty": 1, "tags": ["plantes", "nature"], "signWords": ["herbe"]},
        {"textFr": "Le lierre grimpe le long du mur.", "textLsf": "LIERRE MUR LONG GRIMPER", "difficulty": 2, "tags": ["plantes"], "signWords": ["lierre"]},
        {"textFr": "La racine absorbe l'eau du sol.", "textLsf": "RACINE EAU SOL ABSORBER", "difficulty": 2, "tags": ["plantes"], "signWords": ["racine"]},
        {"textFr": "Le pétale de rose est doux.", "textLsf": "ROSE PÉTALE DOUX", "difficulty": 1, "tags": ["fleurs"], "signWords": ["pétale", "rose"]},
        {"textFr": "L'arbuste fleurit chaque printemps.", "textLsf": "ARBUSTE CHAQUE PRINTEMPS FLEURIR", "difficulty": 2, "tags": ["plantes", "saisons"], "signWords": ["arbuste", "printemps"]},
    ],
    "Droits et justice": [
        {"textFr": "Le gouvernement doit respecter la loi.", "textLsf": "GOUVERNEMENT LOI RESPECTER DEVOIR", "difficulty": 2, "tags": ["droits", "politique"], "signWords": ["gouvernement", "loi"]},
        {"textFr": "Le crime est puni par la loi.", "textLsf": "CRIME LOI PUNIR", "difficulty": 2, "tags": ["justice"], "signWords": ["crime", "loi"]},
        {"textFr": "Le prisonnier a été libéré.", "textLsf": "PRISONNIER LIBÉRER", "difficulty": 1, "tags": ["justice"], "signWords": ["prison"]},
        {"textFr": "L'égalité entre tous est un idéal.", "textLsf": "TOUS ÉGALITÉ IDÉAL", "difficulty": 2, "tags": ["droits", "valeurs"], "signWords": ["égalité"]},
        {"textFr": "Je suis citoyen de ce pays.", "textLsf": "MOI CE PAYS CITOYEN", "difficulty": 1, "tags": ["droits", "citoyenneté"], "signWords": ["citoyen"]},
        {"textFr": "La manifestation était pacifique.", "textLsf": "MANIFESTATION PACIFIQUE", "difficulty": 1, "tags": ["droits", "politique"], "signWords": ["manifestation"]},
        {"textFr": "La justice doit être impartiale.", "textLsf": "JUSTICE IMPARTIALE DEVOIR", "difficulty": 2, "tags": ["justice"], "signWords": ["justice"]},
    ],
    "Philosophie et valeurs": [
        {"textFr": "La responsabilité vient avec la liberté.", "textLsf": "LIBERTÉ RESPONSABILITÉ VENIR AVEC", "difficulty": 3, "tags": ["philosophie", "valeurs"], "signWords": ["responsabilité", "liberté"]},
        {"textFr": "La bienveillance transforme les relations.", "textLsf": "BIENVEILLANCE RELATION TRANSFORMER", "difficulty": 3, "tags": ["philosophie", "valeurs"], "signWords": ["bienveillance"]},
        {"textFr": "La curiosité est le moteur de l'apprentissage.", "textLsf": "CURIOSITÉ APPRENTISSAGE MOTEUR", "difficulty": 3, "tags": ["philosophie", "éducation"], "signWords": ["curiosité"]},
        {"textFr": "La justice passe avant tout.", "textLsf": "JUSTICE TOUT AVANT", "difficulty": 2, "tags": ["philosophie", "valeurs"], "signWords": ["justice"]},
        {"textFr": "Le mensonge détruit la confiance.", "textLsf": "MENSONGE CONFIANCE DÉTRUIRE", "difficulty": 2, "tags": ["philosophie", "valeurs"], "signWords": ["mensonge", "confiance"]},
        {"textFr": "La sagesse s'acquiert avec l'expérience.", "textLsf": "SAGESSE EXPÉRIENCE AVEC ACQUÉRIR", "difficulty": 3, "tags": ["philosophie"], "signWords": ["sagesse"]},
        {"textFr": "L'empathie rapproche les gens.", "textLsf": "EMPATHIE GENS RAPPROCHER", "difficulty": 2, "tags": ["philosophie", "valeurs"], "signWords": ["empathie"]},
    ],
    "L'informatique et les jeux vidéo": [
        {"textFr": "Mon score est le meilleur de la liste.", "textLsf": "MOI LISTE SCORE MEILLEUR", "difficulty": 2, "tags": ["jeux vidéo"], "signWords": ["score"]},
        {"textFr": "Ce niveau est très difficile.", "textLsf": "CE NIVEAU TRÈS DIFFICILE", "difficulty": 1, "tags": ["jeux vidéo"], "signWords": ["niveau"]},
        {"textFr": "Je joue en ligne avec des amis.", "textLsf": "MOI AMI EN LIGNE JOUER", "difficulty": 2, "tags": ["jeux vidéo"], "signWords": ["jeu vidéo"]},
        {"textFr": "L'application plante souvent.", "textLsf": "APPLICATION SOUVENT PLANTER", "difficulty": 2, "tags": ["informatique"], "signWords": ["application"]},
        {"textFr": "Je mets le fichier dans le bon dossier.", "textLsf": "MOI FICHIER BON DOSSIER METTRE", "difficulty": 2, "tags": ["informatique"], "signWords": ["fichier", "dossier"]},
        {"textFr": "Le virus a supprimé mes données.", "textLsf": "VIRUS MOI DONNÉES SUPPRIMER", "difficulty": 2, "tags": ["informatique"], "signWords": ["supprimer"]},
        {"textFr": "Je télécharge la mise à jour.", "textLsf": "MOI MISE À JOUR TÉLÉCHARGER", "difficulty": 2, "tags": ["informatique"], "signWords": ["télécharger"]},
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

# ── Nouveaux modules ──────────────────────────────────────────────────────────

last_sort = max(m["module"]["sortOrder"] for m in data)

new_modules = [
    {
        "module": {"title": "Les mathématiques", "description": "Le vocabulaire des mathématiques en LSF.", "level": 2, "sortOrder": last_sort + 1},
        "lessons": [
            {
                "title": "Opérations et formes", "description": "Addition, soustraction, formes géométriques en LSF.", "sortOrder": 1, "xpReward": 30,
                "phrases": [
                    {"textFr": "Combien font dix plus cinq ?", "textLsf": "DIX PLUS CINQ ADDITION RÉSULTAT COMBIEN", "difficulty": 2, "tags": ["maths"], "signWords": ["addition", "résultat"]},
                    {"textFr": "Divise ce nombre par deux.", "textLsf": "CE NOMBRE DEUX DIVISER", "difficulty": 2, "tags": ["maths"], "signWords": ["division"]},
                    {"textFr": "Le cercle n'a pas de coin.", "textLsf": "CERCLE COIN PAS AVOIR", "difficulty": 1, "tags": ["maths", "géométrie"], "signWords": ["cercle"]},
                    {"textFr": "Le triangle a trois côtés.", "textLsf": "TRIANGLE TROIS CÔTÉ AVOIR", "difficulty": 1, "tags": ["maths", "géométrie"], "signWords": ["triangle"]},
                    {"textFr": "Quel est le résultat de cette équation ?", "textLsf": "CETTE ÉQUATION RÉSULTAT QUOI", "difficulty": 2, "tags": ["maths"], "signWords": ["équation", "résultat"]},
                    {"textFr": "Le graphique montre une hausse.", "textLsf": "GRAPHIQUE HAUSSE MONTRER", "difficulty": 2, "tags": ["maths"], "signWords": ["graphique"]},
                    {"textFr": "Cinquante pour cent de réduction.", "textLsf": "CINQUANTE POURCENTAGE RÉDUCTION", "difficulty": 2, "tags": ["maths", "achats"], "signWords": ["pourcentage"]},
                    {"textFr": "La mesure est exacte.", "textLsf": "MESURE EXACTE", "difficulty": 1, "tags": ["maths"], "signWords": ["mesure"]},
                ]
            },
            {
                "title": "Fractions et calculs", "description": "Les fractions, pourcentages et calculs avancés.", "sortOrder": 2, "xpReward": 35,
                "phrases": [
                    {"textFr": "Multiplie par trois.", "textLsf": "TROIS MULTIPLIER", "difficulty": 1, "tags": ["maths"], "signWords": ["multiplication"]},
                    {"textFr": "Le rectangle a quatre angles droits.", "textLsf": "RECTANGLE QUATRE ANGLE DROIT AVOIR", "difficulty": 2, "tags": ["maths", "géométrie"], "signWords": ["rectangle"]},
                    {"textFr": "Le carré a quatre côtés égaux.", "textLsf": "CARRÉ QUATRE CÔTÉ ÉGAL AVOIR", "difficulty": 2, "tags": ["maths", "géométrie"], "signWords": ["carré", "égal"]},
                    {"textFr": "La soustraction donne un résultat négatif.", "textLsf": "SOUSTRACTION RÉSULTAT NÉGATIF DONNER", "difficulty": 2, "tags": ["maths"], "signWords": ["soustraction", "résultat"]},
                    {"textFr": "Je calcule la fraction.", "textLsf": "MOI FRACTION CALCULER", "difficulty": 2, "tags": ["maths"], "signWords": ["fraction"]},
                    {"textFr": "Le résultat est égal à zéro.", "textLsf": "RÉSULTAT ZÉRO ÉGAL", "difficulty": 1, "tags": ["maths"], "signWords": ["résultat", "égal"]},
                    {"textFr": "Mesure la longueur de ce rectangle.", "textLsf": "CE RECTANGLE LONGUEUR MESURER", "difficulty": 2, "tags": ["maths", "géométrie"], "signWords": ["mesure", "rectangle"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "Les insectes et petites bêtes", "description": "Les insectes et petites créatures en LSF.", "level": 1, "sortOrder": last_sort + 2},
        "lessons": [
            {
                "title": "Dans la nature", "description": "Papillons, abeilles et autres insectes en LSF.", "sortOrder": 1, "xpReward": 25,
                "phrases": [
                    {"textFr": "Le papillon se pose sur la fleur.", "textLsf": "PAPILLON FLEUR POSER", "difficulty": 1, "tags": ["insectes", "nature"], "signWords": ["papillon"]},
                    {"textFr": "L'abeille produit du miel.", "textLsf": "ABEILLE MIEL PRODUIRE", "difficulty": 1, "tags": ["insectes"], "signWords": ["abeille"]},
                    {"textFr": "La coccinelle porte sept points.", "textLsf": "COCCINELLE SEPT POINT PORTER", "difficulty": 2, "tags": ["insectes"], "signWords": ["coccinelle"]},
                    {"textFr": "Le moustique m'a piqué.", "textLsf": "MOUSTIQUE MOI PIQUER", "difficulty": 1, "tags": ["insectes"], "signWords": ["moustique"]},
                    {"textFr": "L'araignée tisse sa toile.", "textLsf": "ARAIGNÉE TOILE TISSER", "difficulty": 2, "tags": ["insectes"], "signWords": ["araignée"]},
                    {"textFr": "La fourmilière est impressionnante.", "textLsf": "FOURMILIÈRE IMPRESSIONNANTE", "difficulty": 1, "tags": ["insectes"], "signWords": ["fourmi"]},
                    {"textFr": "La guêpe peut piquer plusieurs fois.", "textLsf": "GUÊPE PLUSIEURS FOIS PIQUER POUVOIR", "difficulty": 2, "tags": ["insectes"], "signWords": ["guêpe"]},
                    {"textFr": "La luciole brille dans la nuit.", "textLsf": "NUIT LUCIOLE BRILLER", "difficulty": 1, "tags": ["insectes", "nature"], "signWords": ["luciole"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "Architecture et bâtiments", "description": "Les bâtiments et l'architecture en LSF.", "level": 2, "sortOrder": last_sort + 3},
        "lessons": [
            {
                "title": "Monuments et lieux", "description": "Cathédrales, musées, ponts — l'architecture en LSF.", "sortOrder": 1, "xpReward": 30,
                "phrases": [
                    {"textFr": "La cathédrale est très ancienne.", "textLsf": "CATHÉDRALE TRÈS ANCIENNE", "difficulty": 1, "tags": ["architecture"], "signWords": ["cathédrale"]},
                    {"textFr": "Le pont relie les deux rives.", "textLsf": "PONT DEUX RIVE RELIER", "difficulty": 2, "tags": ["architecture"], "signWords": ["pont"]},
                    {"textFr": "Le musée expose des œuvres du monde entier.", "textLsf": "MUSÉE MONDE ENTIER ŒUVRE EXPOSER", "difficulty": 3, "tags": ["architecture", "culture"], "signWords": ["musée"]},
                    {"textFr": "La bibliothèque est calme et lumineuse.", "textLsf": "BIBLIOTHÈQUE CALME LUMINEUSE", "difficulty": 1, "tags": ["architecture"], "signWords": ["bibliothèque"]},
                    {"textFr": "Le stade peut accueillir cent mille personnes.", "textLsf": "STADE CENT MILLE PERSONNE ACCUEILLIR", "difficulty": 3, "tags": ["architecture", "sports"], "signWords": ["stade"]},
                    {"textFr": "Le tunnel traverse la montagne.", "textLsf": "TUNNEL MONTAGNE TRAVERSER", "difficulty": 2, "tags": ["architecture"], "signWords": ["tunnel"]},
                    {"textFr": "Le château est entouré de douves.", "textLsf": "CHÂTEAU DOUVE ENTOURÉ", "difficulty": 2, "tags": ["architecture", "histoire"], "signWords": ["château"]},
                    {"textFr": "Le phare guide les bateaux.", "textLsf": "PHARE BATEAU GUIDER", "difficulty": 1, "tags": ["architecture"], "signWords": ["phare"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "Les matières et textures", "description": "Décrire les matières et textures en LSF.", "level": 2, "sortOrder": last_sort + 4},
        "lessons": [
            {
                "title": "Toucher et sensation", "description": "Bois, métal, tissu — les matières en LSF.", "sortOrder": 1, "xpReward": 30,
                "phrases": [
                    {"textFr": "Cette table est en bois.", "textLsf": "CETTE TABLE BOIS EN", "difficulty": 1, "tags": ["matières"], "signWords": ["bois"]},
                    {"textFr": "Le métal est froid au toucher.", "textLsf": "MÉTAL TOUCHER FROID", "difficulty": 1, "tags": ["matières", "textures"], "signWords": ["métal"]},
                    {"textFr": "Ce tissu est très doux.", "textLsf": "CE TISSU TRÈS DOUX", "difficulty": 1, "tags": ["matières", "textures"], "signWords": ["tissu", "doux"]},
                    {"textFr": "Le verre est transparent et fragile.", "textLsf": "VERRE TRANSPARENT FRAGILE", "difficulty": 1, "tags": ["matières", "textures"], "signWords": ["verre", "transparent"]},
                    {"textFr": "La pierre est rugueuse.", "textLsf": "PIERRE RUGUEUSE", "difficulty": 1, "tags": ["matières", "textures"], "signWords": ["pierre", "rugueux"]},
                    {"textFr": "Le caoutchouc est souple et résistant.", "textLsf": "CAOUTCHOUC SOUPLE RÉSISTANT", "difficulty": 2, "tags": ["matières"], "signWords": ["caoutchouc"]},
                    {"textFr": "Ce sac est lourd.", "textLsf": "CE SAC LOURD", "difficulty": 1, "tags": ["matières", "textures"], "signWords": ["lourd"]},
                    {"textFr": "Le plastique est léger mais polluant.", "textLsf": "PLASTIQUE LÉGER POLLUANT", "difficulty": 2, "tags": ["matières", "écologie"], "signWords": ["plastique", "léger"]},
                ]
            },
            {
                "title": "Températures et sensations", "description": "Chaud, froid, lisse — les sensations en LSF.", "sortOrder": 2, "xpReward": 35,
                "phrases": [
                    {"textFr": "La surface est lisse et brillante.", "textLsf": "SURFACE LISSE BRILLANTE", "difficulty": 2, "tags": ["textures"], "signWords": ["lisse"]},
                    {"textFr": "Ce métal est dur et lourd.", "textLsf": "CE MÉTAL DUR LOURD", "difficulty": 1, "tags": ["matières", "textures"], "signWords": ["dur", "lourd"]},
                    {"textFr": "La laine est douce et chaude.", "textLsf": "LAINE DOUCE CHAUDE", "difficulty": 1, "tags": ["matières", "textures"], "signWords": ["doux", "chaud"]},
                    {"textFr": "Cette planche est dure.", "textLsf": "CETTE PLANCHE DURE", "difficulty": 1, "tags": ["matières", "textures"], "signWords": ["dur"]},
                    {"textFr": "Le coussin est mou et confortable.", "textLsf": "COUSSIN MOU CONFORTABLE", "difficulty": 1, "tags": ["textures"], "signWords": ["mou"]},
                    {"textFr": "Ce sac est léger et pratique.", "textLsf": "CE SAC LÉGER PRATIQUE", "difficulty": 1, "tags": ["matières", "textures"], "signWords": ["léger"]},
                    {"textFr": "Le verre est froid au contact.", "textLsf": "VERRE CONTACT FROID", "difficulty": 1, "tags": ["matières", "textures"], "signWords": ["verre", "froid"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "Les verbes du quotidien", "description": "Les verbes courants pour s'exprimer en LSF.", "level": 2, "sortOrder": last_sort + 5},
        "lessons": [
            {
                "title": "Proposer et accepter", "description": "Les verbes d'interaction sociale en LSF.", "sortOrder": 1, "xpReward": 30,
                "phrases": [
                    {"textFr": "Je te propose une solution.", "textLsf": "MOI TOI SOLUTION PROPOSER", "difficulty": 2, "tags": ["verbes", "communication"], "signWords": ["proposer"]},
                    {"textFr": "J'accepte ta proposition.", "textLsf": "MOI TOI PROPOSITION ACCEPTER", "difficulty": 2, "tags": ["verbes", "communication"], "signWords": ["accepter"]},
                    {"textFr": "Il a refusé l'offre.", "textLsf": "LUI OFFRE REFUSER", "difficulty": 1, "tags": ["verbes"], "signWords": ["refuser"]},
                    {"textFr": "J'ai oublié son prénom.", "textLsf": "MOI LUI PRÉNOM OUBLIER", "difficulty": 1, "tags": ["verbes"], "signWords": ["oublier"]},
                    {"textFr": "Rappelle-moi demain.", "textLsf": "DEMAIN MOI RAPPELER", "difficulty": 1, "tags": ["verbes", "communication"], "signWords": ["rappeler"]},
                    {"textFr": "Il a promis de venir.", "textLsf": "LUI VENIR PROMETTRE", "difficulty": 2, "tags": ["verbes", "communication"], "signWords": ["promettre"]},
                    {"textFr": "Explique-moi ce problème.", "textLsf": "CE PROBLÈME MOI EXPLIQUER", "difficulty": 1, "tags": ["verbes", "communication"], "signWords": ["expliquer"]},
                    {"textFr": "Je partage mon avis.", "textLsf": "MOI AVIS PARTAGER", "difficulty": 1, "tags": ["verbes", "communication"], "signWords": ["partager"]},
                ]
            },
            {
                "title": "Changer et améliorer", "description": "Les verbes d'action et de transformation en LSF.", "sortOrder": 2, "xpReward": 35,
                "phrases": [
                    {"textFr": "Je veux changer de travail.", "textLsf": "MOI TRAVAIL CHANGER VOULOIR", "difficulty": 2, "tags": ["verbes"], "signWords": ["changer"]},
                    {"textFr": "Il faut améliorer ce projet.", "textLsf": "CE PROJET AMÉLIORER FALLOIR", "difficulty": 2, "tags": ["verbes"], "signWords": ["améliorer"]},
                    {"textFr": "J'admire son courage.", "textLsf": "MOI LUI COURAGE ADMIRER", "difficulty": 2, "tags": ["verbes", "émotions"], "signWords": ["admirer"]},
                    {"textFr": "Ne critique pas sans comprendre.", "textLsf": "COMPRENDRE SANS CRITIQUER PAS", "difficulty": 3, "tags": ["verbes", "communication"], "signWords": ["critiquer"]},
                    {"textFr": "Je te félicite pour ton travail.", "textLsf": "MOI TOI TRAVAIL FÉLICITER", "difficulty": 2, "tags": ["verbes", "communication"], "signWords": ["féliciter"]},
                    {"textFr": "Il m'a soutenu dans les moments difficiles.", "textLsf": "LUI MOI MOMENTS DIFFICILES SOUTENIR", "difficulty": 3, "tags": ["verbes", "émotions"], "signWords": ["soutenir"]},
                    {"textFr": "Je demande une explication.", "textLsf": "MOI EXPLICATION DEMANDER", "difficulty": 1, "tags": ["verbes", "communication"], "signWords": ["demander"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "Langues et communication", "description": "Parler des langues et de la communication en LSF.", "level": 2, "sortOrder": last_sort + 6},
        "lessons": [
            {
                "title": "Langues du monde", "description": "Les langues et leur apprentissage en LSF.", "sortOrder": 1, "xpReward": 30,
                "phrases": [
                    {"textFr": "J'apprends l'espagnol depuis un an.", "textLsf": "UN AN MOI ESPAGNOL APPRENDRE", "difficulty": 2, "tags": ["langues"], "signWords": ["espagnol"]},
                    {"textFr": "L'anglais est parlé dans le monde entier.", "textLsf": "ANGLAIS MONDE ENTIER PARLER", "difficulty": 2, "tags": ["langues"], "signWords": ["anglais"]},
                    {"textFr": "Je suis bilingue français-arabe.", "textLsf": "MOI FRANÇAIS ARABE BILINGUE", "difficulty": 2, "tags": ["langues"], "signWords": ["bilingue", "arabe"]},
                    {"textFr": "Le japonais est difficile à lire.", "textLsf": "JAPONAIS LIRE DIFFICILE", "difficulty": 2, "tags": ["langues"], "signWords": ["japonais"]},
                    {"textFr": "La traduction est un métier complexe.", "textLsf": "TRADUCTION MÉTIER COMPLEXE", "difficulty": 2, "tags": ["langues", "travail"], "signWords": ["traduction"]},
                    {"textFr": "Il a un accent allemand.", "textLsf": "LUI ALLEMAND ACCENT AVOIR", "difficulty": 2, "tags": ["langues"], "signWords": ["accent", "allemand"]},
                    {"textFr": "Le dictionnaire m'aide beaucoup.", "textLsf": "DICTIONNAIRE MOI BEAUCOUP AIDER", "difficulty": 1, "tags": ["langues", "apprentissage"], "signWords": ["dictionnaire"]},
                    {"textFr": "Le russe a un alphabet différent.", "textLsf": "RUSSE ALPHABET DIFFÉRENT AVOIR", "difficulty": 2, "tags": ["langues"], "signWords": ["russe"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "Sentiments avancés", "description": "Exprimer des émotions complexes en LSF.", "level": 3, "sortOrder": last_sort + 7},
        "lessons": [
            {
                "title": "Émotions profondes", "description": "Nostalgie, fierté, jalousie — les sentiments complexes en LSF.", "sortOrder": 1, "xpReward": 35,
                "phrases": [
                    {"textFr": "Je ressens une grande nostalgie.", "textLsf": "MOI NOSTALGIE GRANDE RESSENTIR", "difficulty": 2, "tags": ["sentiments"], "signWords": ["nostalgie"]},
                    {"textFr": "La honte m'a paralysé.", "textLsf": "HONTE MOI PARALYSER", "difficulty": 2, "tags": ["sentiments"], "signWords": ["honte"]},
                    {"textFr": "J'éprouve de la fierté pour toi.", "textLsf": "TOI MOI FIERTÉ ÉPROUVER", "difficulty": 2, "tags": ["sentiments"], "signWords": ["fierté"]},
                    {"textFr": "La jalousie est un sentiment destructeur.", "textLsf": "JALOUSIE SENTIMENT DESTRUCTEUR", "difficulty": 3, "tags": ["sentiments"], "signWords": ["jalousie"]},
                    {"textFr": "J'ai une grande compassion pour lui.", "textLsf": "LUI MOI COMPASSION GRANDE AVOIR", "difficulty": 2, "tags": ["sentiments"], "signWords": ["compassion"]},
                    {"textFr": "La déception était visible sur son visage.", "textLsf": "LUI VISAGE DÉCEPTION VISIBLE", "difficulty": 3, "tags": ["sentiments"], "signWords": ["déception"]},
                    {"textFr": "Je garde espoir malgré tout.", "textLsf": "TOUT MALGRÉ MOI ESPOIR GARDER", "difficulty": 2, "tags": ["sentiments"], "signWords": ["espoir"]},
                    {"textFr": "Le soulagement est immense.", "textLsf": "SOULAGEMENT IMMENSE", "difficulty": 1, "tags": ["sentiments"], "signWords": ["soulagement"]},
                ]
            },
            {
                "title": "Relations et émotions", "description": "Les émotions dans les relations humaines en LSF.", "sortOrder": 2, "xpReward": 40,
                "phrases": [
                    {"textFr": "Son enthousiasme est contagieux.", "textLsf": "LUI ENTHOUSIASME CONTAGIEUX", "difficulty": 2, "tags": ["sentiments"], "signWords": ["enthousiasme"]},
                    {"textFr": "Je ressens du mépris pour cette attitude.", "textLsf": "CETTE ATTITUDE MOI MÉPRIS RESSENTIR", "difficulty": 3, "tags": ["sentiments"], "signWords": ["mépris"]},
                    {"textFr": "L'envie de réussir me motive.", "textLsf": "RÉUSSIR ENVIE MOI MOTIVER", "difficulty": 2, "tags": ["sentiments", "motivation"], "signWords": ["envie"]},
                    {"textFr": "La méfiance s'est installée entre eux.", "textLsf": "EUX MÉFIANCE INSTALLER", "difficulty": 3, "tags": ["sentiments", "relations"], "signWords": ["méfiance"]},
                    {"textFr": "Le désespoir l'a envahi.", "textLsf": "LUI DÉSESPOIR ENVAHIR", "difficulty": 2, "tags": ["sentiments"], "signWords": ["désespoir"]},
                    {"textFr": "J'éprouve beaucoup d'empathie pour eux.", "textLsf": "EUX MOI EMPATHIE BEAUCOUP ÉPROUVER", "difficulty": 2, "tags": ["sentiments"], "signWords": ["empathie"]},
                    {"textFr": "Le soulagement après l'examen est immense.", "textLsf": "EXAMEN APRÈS SOULAGEMENT IMMENSE", "difficulty": 2, "tags": ["sentiments", "école"], "signWords": ["soulagement"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "La politique et la société", "description": "Le vocabulaire de la politique et de la vie en société en LSF.", "level": 3, "sortOrder": last_sort + 8},
        "lessons": [
            {
                "title": "Démocratie et institutions", "description": "Élections, gouvernement, citoyenneté en LSF.", "sortOrder": 1, "xpReward": 35,
                "phrases": [
                    {"textFr": "J'ai voté pour ce candidat.", "textLsf": "MOI CE CANDIDAT VOTER", "difficulty": 2, "tags": ["politique"], "signWords": ["vote"]},
                    {"textFr": "Le président présente son programme.", "textLsf": "PRÉSIDENT PROGRAMME PRÉSENTER", "difficulty": 2, "tags": ["politique"], "signWords": ["gouvernement"]},
                    {"textFr": "Le parlement vote les lois.", "textLsf": "PARLEMENT LOI VOTER", "difficulty": 2, "tags": ["politique", "droits"], "signWords": ["parlement", "loi"]},
                    {"textFr": "La grève a paralysé les transports.", "textLsf": "GRÈVE TRANSPORT PARALYSER", "difficulty": 2, "tags": ["politique", "société"], "signWords": ["grève"]},
                    {"textFr": "Le syndicat défend les travailleurs.", "textLsf": "SYNDICAT TRAVAILLEUR DÉFENDRE", "difficulty": 2, "tags": ["politique", "travail"], "signWords": ["syndicat"]},
                    {"textFr": "Les impôts financent les services publics.", "textLsf": "IMPÔT SERVICE PUBLIC FINANCER", "difficulty": 3, "tags": ["politique", "finances"], "signWords": ["impôt"]},
                    {"textFr": "La fraternité est une valeur républicaine.", "textLsf": "FRATERNITÉ VALEUR RÉPUBLICAINE", "difficulty": 2, "tags": ["politique", "valeurs"], "signWords": ["fraternité"]},
                    {"textFr": "L'élection a lieu en juin.", "textLsf": "JUIN ÉLECTION AVOIR LIEU", "difficulty": 2, "tags": ["politique"], "signWords": ["élection"]},
                ]
            }
        ]
    },
]

for nm in new_modules:
    data.append(nm)
    n = sum(len(l["phrases"]) for l in nm["lessons"])
    print(f"  ++ {nm['module']['title']}: {n} phrases")

with open(PATH, 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open(PATH) as f:
    data = json.load(f)
total = sum(len(l['phrases']) for m in data for l in m['lessons'])
short = [(m['module']['title'], sum(len(l['phrases']) for l in m['lessons'])) for m in data if sum(len(l['phrases']) for l in m['lessons']) < 15]
print(f"\n{'─'*55}")
print(f"  {len(data)} modules | {total} phrases au total")
if short:
    print(f"\n  Modules encore < 15 phrases :")
    for t, n in short:
        print(f"    {t}: {n}")
else:
    print("\n  Tous les modules ont 15+ phrases !")
