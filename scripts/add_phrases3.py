#!/usr/bin/env python3
"""Enrichit les modules courts + crée une grande fournée de nouveaux modules."""
import json

PATH = '/home/raphaelcau/l-ear-n-it-LSF-learning-/lsf-api/Data/seed-phrases.json'

with open(PATH) as f:
    data = json.load(f)

# ── 1. Enrichir les modules à 8 phrases ──────────────────────────────────────

enrichments = {
    "Les boissons": [
        {"textFr": "Cette eau est très fraîche.", "textLsf": "CETTE EAU TRÈS FRAÎCHE", "difficulty": 1, "tags": ["boissons"], "signWords": ["eau"]},
        {"textFr": "Je bois du champagne pour fêter.", "textLsf": "MOI FÊTER CHAMPAGNE BOIRE", "difficulty": 2, "tags": ["boissons", "fête"], "signWords": ["champagne"]},
        {"textFr": "Tu préfères le café fort ou léger ?", "textLsf": "TOI CAFÉ FORT LÉGER PRÉFÉRER", "difficulty": 2, "tags": ["boissons"], "signWords": ["café"]},
        {"textFr": "Un cocktail sans alcool s'il vous plaît.", "textLsf": "MOI COCKTAIL ALCOOL SANS VOULOIR", "difficulty": 2, "tags": ["boissons"], "signWords": ["cocktail"]},
        {"textFr": "La bière est froide.", "textLsf": "BIÈRE FROIDE", "difficulty": 1, "tags": ["boissons"], "signWords": ["bière"]},
        {"textFr": "Je bois deux litres d'eau par jour.", "textLsf": "MOI CHAQUE JOUR DEUX LITRE EAU BOIRE", "difficulty": 3, "tags": ["boissons", "santé"], "signWords": ["eau"]},
        {"textFr": "Ce vin est excellent.", "textLsf": "CE VIN EXCELLENT", "difficulty": 1, "tags": ["boissons"], "signWords": ["vin"]},
    ],
    "La musique": [
        {"textFr": "Le saxophoniste joue dans la rue.", "textLsf": "SAXOPHONE RUE JOUER", "difficulty": 2, "tags": ["musique", "instruments"], "signWords": ["saxophone"]},
        {"textFr": "J'ai appris le violon enfant.", "textLsf": "ENFANT MOI VIOLON APPRENDRE", "difficulty": 2, "tags": ["musique", "instruments"], "signWords": ["violon"]},
        {"textFr": "Le rap est ma musique préférée.", "textLsf": "MOI RAP MUSIQUE PRÉFÉRÉ", "difficulty": 1, "tags": ["musique"], "signWords": ["rap"]},
        {"textFr": "La flûte produit un son délicat.", "textLsf": "FLÛTE SON DÉLICAT PRODUIRE", "difficulty": 2, "tags": ["musique", "instruments"], "signWords": ["flûte"]},
        {"textFr": "On répète la chanson demain.", "textLsf": "DEMAIN CHANSON RÉPÉTER", "difficulty": 1, "tags": ["musique"], "signWords": ["chanson"]},
        {"textFr": "L'accordéon est typique de la musique française.", "textLsf": "ACCORDÉON MUSIQUE FRANÇAISE TYPIQUE", "difficulty": 3, "tags": ["musique", "instruments"], "signWords": ["accordéon"]},
        {"textFr": "Le rythme est trop rapide pour moi.", "textLsf": "RYTHME MOI TROP RAPIDE", "difficulty": 2, "tags": ["musique"], "signWords": ["rythme"]},
    ],
    "Le corps humain": [
        {"textFr": "J'ai des douleurs à l'articulation.", "textLsf": "MOI ARTICULATION DOULEUR AVOIR", "difficulty": 2, "tags": ["corps", "santé"], "signWords": ["articulation"]},
        {"textFr": "Le muscle du dos est tendu.", "textLsf": "DOS MUSCLE TENDU", "difficulty": 2, "tags": ["corps", "santé"], "signWords": ["muscle"]},
        {"textFr": "Mon coude est gonflé.", "textLsf": "MOI COUDE GONFLÉ", "difficulty": 1, "tags": ["corps", "santé"], "signWords": ["coude"]},
        {"textFr": "Le rein filtre les toxines.", "textLsf": "REIN TOXINE FILTRER", "difficulty": 2, "tags": ["corps", "santé"], "signWords": ["rein"]},
        {"textFr": "Je me suis cassé le poignet.", "textLsf": "MOI POIGNET CASSER", "difficulty": 1, "tags": ["corps", "santé"], "signWords": ["poignet"]},
        {"textFr": "L'estomac fait mal après ce repas.", "textLsf": "CE REPAS APRÈS ESTOMAC MAL", "difficulty": 2, "tags": ["corps", "santé"], "signWords": ["estomac"]},
        {"textFr": "Mon talon est douloureux.", "textLsf": "MOI TALON DOULOUREUX", "difficulty": 1, "tags": ["corps", "santé"], "signWords": ["talon"]},
    ],
    "Dans la cuisine": [
        {"textFr": "Fais griller le poulet au four.", "textLsf": "POULET FOUR GRILLER", "difficulty": 2, "tags": ["cuisine"], "signWords": ["griller", "four"]},
        {"textFr": "Assaisonne bien la viande.", "textLsf": "VIANDE BIEN ASSAISONNER", "difficulty": 1, "tags": ["cuisine"], "signWords": ["assaisonner"]},
        {"textFr": "Fais frire les frites dans l'huile.", "textLsf": "FRITE HUILE FRIRE", "difficulty": 2, "tags": ["cuisine"], "signWords": ["frire"]},
        {"textFr": "La recette demande trois ingrédients.", "textLsf": "RECETTE TROIS INGRÉDIENT DEMANDER", "difficulty": 2, "tags": ["cuisine"], "signWords": ["recette", "ingrédient"]},
        {"textFr": "Mets la casserole sur le feu.", "textLsf": "CASSEROLE FEU METTRE", "difficulty": 1, "tags": ["cuisine"], "signWords": ["casserole"]},
        {"textFr": "Laisse mijoter à feu doux.", "textLsf": "FEU DOUX MIJOTER", "difficulty": 2, "tags": ["cuisine"], "signWords": ["cuire"]},
        {"textFr": "Goûte avant de servir.", "textLsf": "SERVIR AVANT GOÛTER", "difficulty": 1, "tags": ["cuisine"], "signWords": ["goûter"]},
    ],
    "La communauté sourde": [
        {"textFr": "La vibration aide à ressentir la musique.", "textLsf": "VIBRATION MUSIQUE RESSENTIR AIDER", "difficulty": 3, "tags": ["communauté sourde"], "signWords": ["vibration"]},
        {"textFr": "La lecture labiale est fatigante.", "textLsf": "LECTURE LABIALE FATIGANTE", "difficulty": 2, "tags": ["communauté sourde"], "signWords": ["lecture labiale"]},
        {"textFr": "Je suis malentendant, pas sourd profond.", "textLsf": "MOI MALENTENDANT PAS SOURD PROFOND", "difficulty": 2, "tags": ["communauté sourde", "identité"], "signWords": ["malentendant", "sourd"]},
        {"textFr": "L'accessibilité progresse dans les transports.", "textLsf": "TRANSPORT ACCESSIBILITÉ PROGRESSER", "difficulty": 3, "tags": ["communauté sourde", "accessibilité"], "signWords": ["accessibilité"]},
        {"textFr": "Parle plus lentement, je lis sur les lèvres.", "textLsf": "TOI LENTEMENT PARLER LÈVRE LUI LIRE MOI", "difficulty": 3, "tags": ["communauté sourde"], "signWords": ["lecture labiale"]},
        {"textFr": "La LSF est reconnue comme langue officielle.", "textLsf": "LSF LANGUE OFFICIELLE RECONNUE", "difficulty": 2, "tags": ["communauté sourde", "LSF"], "signWords": ["LSF"]},
        {"textFr": "Je signe depuis l'enfance.", "textLsf": "MOI ENFANCE DEPUIS SIGNER", "difficulty": 2, "tags": ["communauté sourde", "LSF"], "signWords": ["LSF"]},
    ],
    "L'environnement et l'écologie": [
        {"textFr": "Les éoliennes produisent de l'énergie propre.", "textLsf": "ÉOLIENNE ÉNERGIE PROPRE PRODUIRE", "difficulty": 2, "tags": ["écologie", "énergie"], "signWords": ["éolienne"]},
        {"textFr": "Je trie mes déchets chaque jour.", "textLsf": "MOI CHAQUE JOUR DÉCHET TRIER", "difficulty": 2, "tags": ["écologie"], "signWords": ["déchet"]},
        {"textFr": "L'eau potable manque dans certains pays.", "textLsf": "CERTAINS PAYS EAU POTABLE MANQUER", "difficulty": 3, "tags": ["écologie", "eau"], "signWords": ["eau potable"]},
        {"textFr": "Réduire le plastique c'est urgent.", "textLsf": "PLASTIQUE RÉDUIRE URGENT", "difficulty": 2, "tags": ["écologie"], "signWords": ["plastique"]},
        {"textFr": "Le covoiturage réduit la pollution.", "textLsf": "COVOITURAGE POLLUTION RÉDUIRE", "difficulty": 2, "tags": ["écologie", "transports"], "signWords": ["covoiturage"]},
        {"textFr": "La déforestation détruit des espèces.", "textLsf": "DÉFORESTATION ESPÈCE DÉTRUIRE", "difficulty": 2, "tags": ["écologie"], "signWords": ["déforestation"]},
        {"textFr": "Mange moins de viande pour la planète.", "textLsf": "PLANÈTE VIANDE MOINS MANGER", "difficulty": 2, "tags": ["écologie", "alimentation"], "signWords": ["végétarien"]},
    ],
    "Les sports collectifs": [
        {"textFr": "Le rugby est un sport très physique.", "textLsf": "RUGBY SPORT TRÈS PHYSIQUE", "difficulty": 1, "tags": ["sports"], "signWords": ["rugby"]},
        {"textFr": "Le hockey se joue sur glace.", "textLsf": "HOCKEY GLACE JOUER", "difficulty": 1, "tags": ["sports"], "signWords": ["hockey"]},
        {"textFr": "Notre équipe s'entraîne deux fois par semaine.", "textLsf": "NOTRE ÉQUIPE SEMAINE DEUX FOIS ENTRAÎNER", "difficulty": 2, "tags": ["sports"], "signWords": ["équipe"]},
        {"textFr": "Le championnat commence en septembre.", "textLsf": "CHAMPIONNAT SEPTEMBRE COMMENCER", "difficulty": 2, "tags": ["sports"], "signWords": ["championnat"]},
        {"textFr": "Le volley se joue à six joueurs.", "textLsf": "VOLLEY SIX JOUEUR JOUER", "difficulty": 2, "tags": ["sports"], "signWords": ["volley"]},
        {"textFr": "Il a marqué le but de la victoire.", "textLsf": "LUI VICTOIRE BUT MARQUER", "difficulty": 2, "tags": ["sports"], "signWords": ["but", "victoire"]},
        {"textFr": "La défaite est difficile à accepter.", "textLsf": "DÉFAITE ACCEPTER DIFFICILE", "difficulty": 2, "tags": ["sports"], "signWords": ["défaite"]},
    ],
    "Positions et directions": [
        {"textFr": "Le nord est par là.", "textLsf": "NORD LÀ-BAS ÊTRE", "difficulty": 1, "tags": ["directions", "géographie"], "signWords": ["nord"]},
        {"textFr": "La banque est derrière toi.", "textLsf": "TOI DERRIÈRE BANQUE", "difficulty": 1, "tags": ["directions"], "signWords": ["derrière"]},
        {"textFr": "Mets le livre dessus.", "textLsf": "LIVRE DESSUS METTRE", "difficulty": 1, "tags": ["positions"], "signWords": ["dessus"]},
        {"textFr": "On se retrouve là-bas dans dix minutes.", "textLsf": "DIX MINUTES LÀ-BAS NOUS RETROUVER", "difficulty": 2, "tags": ["directions"], "signWords": ["là-bas"]},
        {"textFr": "Le soleil se lève à l'est.", "textLsf": "SOLEIL EST LEVER", "difficulty": 2, "tags": ["directions", "géographie"], "signWords": ["est"]},
        {"textFr": "Assieds-toi ici, à côté de moi.", "textLsf": "ICI MOI CÔTÉ ASSEOIR", "difficulty": 1, "tags": ["positions"], "signWords": ["ici"]},
        {"textFr": "Le sud de la France est chaud.", "textLsf": "FRANCE SUD CHAUD", "difficulty": 1, "tags": ["directions", "géographie"], "signWords": ["sud"]},
    ],
    "Les médias et la presse": [
        {"textFr": "J'écoute la radio le matin.", "textLsf": "MATIN MOI RADIO ÉCOUTER", "difficulty": 1, "tags": ["médias"], "signWords": ["radio"]},
        {"textFr": "Ce journal est très sérieux.", "textLsf": "CE JOURNAL TRÈS SÉRIEUX", "difficulty": 1, "tags": ["médias", "presse"], "signWords": ["journal"]},
        {"textFr": "L'interview a duré une heure.", "textLsf": "INTERVIEW UNE HEURE DURER", "difficulty": 2, "tags": ["médias"], "signWords": ["interview"]},
        {"textFr": "Les réseaux sociaux diffusent de fausses informations.", "textLsf": "RÉSEAU SOCIAL FAUSSE INFORMATION DIFFUSER", "difficulty": 3, "tags": ["médias", "réseaux sociaux"], "signWords": ["réseau social"]},
        {"textFr": "Ce documentaire est passionnant.", "textLsf": "CE DOCUMENTAIRE PASSIONNANT", "difficulty": 1, "tags": ["médias", "télévision"], "signWords": ["reportage"]},
        {"textFr": "Les abonnés de cette chaîne augmentent.", "textLsf": "CETTE CHAÎNE ABONNÉ AUGMENTER", "difficulty": 2, "tags": ["médias"], "signWords": ["chaîne", "abonné"]},
        {"textFr": "La liberté de la presse est fondamentale.", "textLsf": "PRESSE LIBERTÉ FONDAMENTALE", "difficulty": 2, "tags": ["médias", "droits"], "signWords": ["liberté"]},
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

# ── 2. Nouveaux modules ──────────────────────────────────────────────────────

last_sort = max(m["module"]["sortOrder"] for m in data)

new_modules = [
    {
        "module": {"title": "La gastronomie française", "description": "Les plats et spécialités de la cuisine française en LSF.", "level": 2, "sortOrder": last_sort + 1},
        "lessons": [
            {
                "title": "Plats et spécialités", "description": "Croissant, quiche, fondue — la gastronomie française en LSF.", "sortOrder": 1, "xpReward": 30,
                "phrases": [
                    {"textFr": "Je mange un croissant au petit-déjeuner.", "textLsf": "PETIT-DÉJEUNER MOI CROISSANT MANGER", "difficulty": 1, "tags": ["gastronomie", "nourriture"], "signWords": ["croissant"]},
                    {"textFr": "La baguette est encore chaude.", "textLsf": "BAGUETTE ENCORE CHAUDE", "difficulty": 1, "tags": ["gastronomie"], "signWords": ["baguette"]},
                    {"textFr": "Tu veux une crêpe au chocolat ?", "textLsf": "TOI CRÊPE CHOCOLAT VOULOIR", "difficulty": 1, "tags": ["gastronomie"], "signWords": ["crêpe"]},
                    {"textFr": "La quiche lorraine est délicieuse.", "textLsf": "QUICHE DÉLICIEUSE", "difficulty": 1, "tags": ["gastronomie"], "signWords": ["quiche"]},
                    {"textFr": "La fondue se partage en groupe.", "textLsf": "FONDUE GROUPE PARTAGER", "difficulty": 2, "tags": ["gastronomie"], "signWords": ["fondue"]},
                    {"textFr": "Le macaron est une pâtisserie fine.", "textLsf": "MACARON PÂTISSERIE FINE", "difficulty": 2, "tags": ["gastronomie"], "signWords": ["macaron"]},
                    {"textFr": "La soupe est chaude et réconfortante.", "textLsf": "SOUPE CHAUDE RÉCONFORTANTE", "difficulty": 1, "tags": ["gastronomie"], "signWords": ["soupe"]},
                    {"textFr": "Le foie gras se mange en entrée.", "textLsf": "FOIE GRAS ENTRÉE MANGER", "difficulty": 2, "tags": ["gastronomie"], "signWords": ["foie gras"]},
                ]
            },
            {
                "title": "Goûts et saveurs", "description": "Exprimer les goûts et les saveurs en LSF.", "sortOrder": 2, "xpReward": 35,
                "phrases": [
                    {"textFr": "Ce plat est trop épicé pour moi.", "textLsf": "CE PLAT MOI TROP ÉPICÉ", "difficulty": 2, "tags": ["gastronomie", "goûts"], "signWords": ["épicé"]},
                    {"textFr": "J'aime les saveurs sucrées-salées.", "textLsf": "MOI SUCRÉ SALÉ SAVEUR AIMER", "difficulty": 2, "tags": ["gastronomie", "goûts"], "signWords": ["salé"]},
                    {"textFr": "Ce fromage a un goût amer.", "textLsf": "CE FROMAGE GOÛT AMER", "difficulty": 2, "tags": ["gastronomie", "goûts"], "signWords": ["amer"]},
                    {"textFr": "La sauce est trop fade.", "textLsf": "SAUCE TROP FADE", "difficulty": 1, "tags": ["gastronomie", "goûts"], "signWords": ["fade"]},
                    {"textFr": "Ce dessert est fondant.", "textLsf": "CE DESSERT FONDANT", "difficulty": 1, "tags": ["gastronomie", "goûts"], "signWords": ["fondant"]},
                    {"textFr": "L'éclair au chocolat est mon préféré.", "textLsf": "MOI ÉCLAIR CHOCOLAT PRÉFÉRÉ", "difficulty": 2, "tags": ["gastronomie"], "signWords": ["éclair"]},
                    {"textFr": "La brioche est très moelleuse.", "textLsf": "BRIOCHE TRÈS MOELLEUSE", "difficulty": 1, "tags": ["gastronomie"], "signWords": ["brioche"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "Beauté et hygiène", "description": "Les produits et routines de beauté en LSF.", "level": 1, "sortOrder": last_sort + 2},
        "lessons": [
            {
                "title": "Produits du quotidien", "description": "Shampoing, dentifrice, crème — les produits de beauté en LSF.", "sortOrder": 1, "xpReward": 25,
                "phrases": [
                    {"textFr": "Je me lave les cheveux avec un shampoing doux.", "textLsf": "MOI CHEVEUX SHAMPOING DOUX LAVER", "difficulty": 2, "tags": ["beauté", "hygiène"], "signWords": ["shampoing"]},
                    {"textFr": "Tu as du dentifrice ?", "textLsf": "TOI DENTIFRICE AVOIR", "difficulty": 1, "tags": ["hygiène"], "signWords": ["dentifrice"]},
                    {"textFr": "Je mets de la crème après la douche.", "textLsf": "DOUCHE APRÈS MOI CRÈME METTRE", "difficulty": 2, "tags": ["beauté", "hygiène"], "signWords": ["crème"]},
                    {"textFr": "Ce parfum sent très bon.", "textLsf": "CE PARFUM TRÈS BON SENTIR", "difficulty": 1, "tags": ["beauté"], "signWords": ["parfum"]},
                    {"textFr": "Le rasoir est neuf.", "textLsf": "RASOIR NEUF", "difficulty": 1, "tags": ["hygiène"], "signWords": ["rasoir"]},
                    {"textFr": "Je vais chez le coiffeur demain.", "textLsf": "DEMAIN MOI COIFFEUR ALLER", "difficulty": 1, "tags": ["beauté"], "signWords": ["coiffeur"]},
                    {"textFr": "Le déodorant est dans la salle de bain.", "textLsf": "SALLE DE BAIN DÉODORANT", "difficulty": 1, "tags": ["hygiène"], "signWords": ["déodorant"]},
                    {"textFr": "Je me sèche les cheveux après la douche.", "textLsf": "DOUCHE APRÈS MOI CHEVEUX SÉCHER", "difficulty": 2, "tags": ["beauté", "hygiène"], "signWords": ["sèche-cheveux"]},
                ]
            },
            {
                "title": "Maquillage et soin", "description": "Le maquillage et les soins de beauté en LSF.", "sortOrder": 2, "xpReward": 30,
                "phrases": [
                    {"textFr": "Elle porte un maquillage discret.", "textLsf": "ELLE MAQUILLAGE DISCRET PORTER", "difficulty": 2, "tags": ["beauté", "maquillage"], "signWords": ["maquillage"]},
                    {"textFr": "La barbe lui va bien.", "textLsf": "LUI BARBE BIEN ALLER", "difficulty": 1, "tags": ["beauté"], "signWords": ["barbe"]},
                    {"textFr": "Je prends soin de ma peau.", "textLsf": "MOI PEAU SOIN PRENDRE", "difficulty": 2, "tags": ["beauté", "hygiène"], "signWords": ["crème"]},
                    {"textFr": "La coupe de cheveux courte lui va.", "textLsf": "LUI CHEVEUX COURT COUPE ALLER", "difficulty": 2, "tags": ["beauté"], "signWords": ["coiffeur"]},
                    {"textFr": "Je préfère me maquiller simplement.", "textLsf": "MOI SIMPLEMENT MAQUILLER PRÉFÉRER", "difficulty": 2, "tags": ["beauté", "maquillage"], "signWords": ["maquillage"]},
                    {"textFr": "Ce coton sert à enlever le maquillage.", "textLsf": "MAQUILLAGE ENLEVER COTON SERVIR", "difficulty": 2, "tags": ["beauté", "maquillage"], "signWords": ["coton", "maquillage"]},
                    {"textFr": "Elle sent bon le parfum.", "textLsf": "ELLE PARFUM BON SENTIR", "difficulty": 1, "tags": ["beauté"], "signWords": ["parfum"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "L'argent et les finances", "description": "Gérer son argent et parler de finances en LSF.", "level": 2, "sortOrder": last_sort + 3},
        "lessons": [
            {
                "title": "Au quotidien", "description": "Payer, acheter, économiser — les finances au quotidien en LSF.", "sortOrder": 1, "xpReward": 30,
                "phrases": [
                    {"textFr": "Je paye par carte bancaire.", "textLsf": "MOI CARTE BANCAIRE PAYER", "difficulty": 1, "tags": ["argent", "achats"], "signWords": ["carte bancaire", "payer"]},
                    {"textFr": "Le loyer est cher dans cette ville.", "textLsf": "CETTE VILLE LOYER CHER", "difficulty": 2, "tags": ["argent", "logement"], "signWords": ["loyer", "cher"]},
                    {"textFr": "J'économise chaque mois.", "textLsf": "MOI CHAQUE MOIS ÉCONOMISER", "difficulty": 1, "tags": ["argent"], "signWords": ["économiser"]},
                    {"textFr": "La facture d'électricité a augmenté.", "textLsf": "ÉLECTRICITÉ FACTURE AUGMENTER", "difficulty": 2, "tags": ["argent", "logement"], "signWords": ["facture"]},
                    {"textFr": "Je suis à la banque.", "textLsf": "MOI BANQUE ÊTRE", "difficulty": 1, "tags": ["argent"], "signWords": ["banque"]},
                    {"textFr": "Mon salaire ne suffit pas.", "textLsf": "MOI SALAIRE SUFFIRE PAS", "difficulty": 2, "tags": ["argent", "travail"], "signWords": ["salaire"]},
                    {"textFr": "Le prix a baissé en soldes.", "textLsf": "SOLDES PRIX BAISSER", "difficulty": 1, "tags": ["argent", "achats"], "signWords": ["prix"]},
                    {"textFr": "Je rembourse mon prêt chaque mois.", "textLsf": "MOI CHAQUE MOIS PRÊT REMBOURSER", "difficulty": 2, "tags": ["argent", "finances"], "signWords": ["prêt", "remboursement"]},
                ]
            },
            {
                "title": "Budget et épargne", "description": "Gérer son budget et planifier ses finances.", "sortOrder": 2, "xpReward": 35,
                "phrases": [
                    {"textFr": "J'ai établi un budget mensuel.", "textLsf": "MOI MENSUEL BUDGET ÉTABLIR", "difficulty": 2, "tags": ["argent", "budget"], "signWords": ["budget"]},
                    {"textFr": "La monnaie a changé.", "textLsf": "MONNAIE CHANGER", "difficulty": 1, "tags": ["argent"], "signWords": ["monnaie"]},
                    {"textFr": "J'investis dans des actions.", "textLsf": "MOI ACTION INVESTIR", "difficulty": 3, "tags": ["argent", "finances"], "signWords": ["budget"]},
                    {"textFr": "La dette est trop importante.", "textLsf": "DETTE TROP IMPORTANTE", "difficulty": 2, "tags": ["argent", "finances"], "signWords": ["dette"]},
                    {"textFr": "Je vends ma voiture.", "textLsf": "MOI VOITURE VENDRE", "difficulty": 1, "tags": ["argent"], "signWords": ["vendre"]},
                    {"textFr": "Le prix est gratuit pour les enfants.", "textLsf": "ENFANT GRATUIT", "difficulty": 1, "tags": ["argent", "achats"], "signWords": ["gratuit"]},
                    {"textFr": "Mon compte est dans le rouge.", "textLsf": "MOI COMPTE ROUGE", "difficulty": 2, "tags": ["argent", "finances"], "signWords": ["banque"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "Outils et bricolage", "description": "Le vocabulaire du bricolage en LSF.", "level": 2, "sortOrder": last_sort + 4},
        "lessons": [
            {
                "title": "Les outils", "description": "Marteau, tournevis, scie — les outils en LSF.", "sortOrder": 1, "xpReward": 30,
                "phrases": [
                    {"textFr": "Passe-moi le marteau.", "textLsf": "MARTEAU MOI PASSER", "difficulty": 1, "tags": ["bricolage", "outils"], "signWords": ["marteau"]},
                    {"textFr": "Je visse avec un tournevis.", "textLsf": "MOI TOURNEVIS VISSER", "difficulty": 1, "tags": ["bricolage", "outils"], "signWords": ["tournevis"]},
                    {"textFr": "La perceuse est dans la caisse.", "textLsf": "PERCEUSE CAISSE DANS", "difficulty": 2, "tags": ["bricolage", "outils"], "signWords": ["perceuse"]},
                    {"textFr": "Il faut couper la planche avec la scie.", "textLsf": "PLANCHE SCIE COUPER FALLOIR", "difficulty": 2, "tags": ["bricolage", "outils"], "signWords": ["scie"]},
                    {"textFr": "Tu as une pince ?", "textLsf": "TOI PINCE AVOIR", "difficulty": 1, "tags": ["bricolage", "outils"], "signWords": ["pince"]},
                    {"textFr": "Je peins le mur en blanc.", "textLsf": "MOI MUR BLANC PEINDRE", "difficulty": 2, "tags": ["bricolage"], "signWords": ["peinture"]},
                    {"textFr": "Le niveau indique si c'est droit.", "textLsf": "NIVEAU DROIT INDIQUER", "difficulty": 2, "tags": ["bricolage", "outils"], "signWords": ["niveau"]},
                    {"textFr": "Je ponce le bois avant de peindre.", "textLsf": "BOIS PEINDRE AVANT PONCER", "difficulty": 2, "tags": ["bricolage"], "signWords": ["poncer"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "La santé mentale", "description": "Parler de bien-être et de santé mentale en LSF.", "level": 2, "sortOrder": last_sort + 5},
        "lessons": [
            {
                "title": "Émotions et bien-être", "description": "Le vocabulaire de la santé mentale en LSF.", "sortOrder": 1, "xpReward": 30,
                "phrases": [
                    {"textFr": "Je souffre d'anxiété depuis longtemps.", "textLsf": "MOI LONGTEMPS DEPUIS ANXIÉTÉ SOUFFRIR", "difficulty": 2, "tags": ["santé mentale"], "signWords": ["anxiété"]},
                    {"textFr": "La méditation m'aide à me calmer.", "textLsf": "MÉDITATION MOI CALMER AIDER", "difficulty": 2, "tags": ["santé mentale", "bien-être"], "signWords": ["méditation"]},
                    {"textFr": "Je vois un psychologue chaque semaine.", "textLsf": "MOI CHAQUE SEMAINE PSYCHOLOGUE VOIR", "difficulty": 2, "tags": ["santé mentale"], "signWords": ["psychologue"]},
                    {"textFr": "La thérapie a changé ma vie.", "textLsf": "THÉRAPIE MOI VIE CHANGER", "difficulty": 2, "tags": ["santé mentale"], "signWords": ["thérapie"]},
                    {"textFr": "Je me sens isolé en ce moment.", "textLsf": "MAINTENANT MOI ISOLÉ SE SENTIR", "difficulty": 2, "tags": ["santé mentale"], "signWords": ["isolement"]},
                    {"textFr": "La dépression nécessite un soutien.", "textLsf": "DÉPRESSION SOUTIEN NÉCESSITER", "difficulty": 2, "tags": ["santé mentale"], "signWords": ["dépression", "soutien"]},
                    {"textFr": "J'ai confiance en moi maintenant.", "textLsf": "MAINTENANT MOI CONFIANCE EN SOI AVOIR", "difficulty": 2, "tags": ["santé mentale", "bien-être"], "signWords": ["confiance en soi"]},
                    {"textFr": "Prends soin de ton bien-être.", "textLsf": "TOI BIEN-ÊTRE SOIN PRENDRE", "difficulty": 1, "tags": ["santé mentale", "bien-être"], "signWords": ["bien-être"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "Voyage et géographie", "description": "Voyager et décrire des paysages en LSF.", "level": 2, "sortOrder": last_sort + 6},
        "lessons": [
            {
                "title": "Paysages et destinations", "description": "Montagne, océan, désert — la géographie en LSF.", "sortOrder": 1, "xpReward": 30,
                "phrases": [
                    {"textFr": "Je rêve de traverser un désert.", "textLsf": "MOI DÉSERT TRAVERSER RÊVER", "difficulty": 2, "tags": ["voyage", "géographie"], "signWords": ["désert"]},
                    {"textFr": "La montagne est couverte de neige.", "textLsf": "MONTAGNE NEIGE COUVRIR", "difficulty": 2, "tags": ["voyage", "géographie"], "signWords": ["montagne"]},
                    {"textFr": "L'océan est immense et magnifique.", "textLsf": "OCÉAN IMMENSE MAGNIFIQUE", "difficulty": 1, "tags": ["voyage", "géographie"], "signWords": ["océan"]},
                    {"textFr": "J'ai visité une île tropicale.", "textLsf": "MOI ÎLE TROPICALE VISITER", "difficulty": 2, "tags": ["voyage", "géographie"], "signWords": ["île"]},
                    {"textFr": "La cascade est impressionnante.", "textLsf": "CASCADE IMPRESSIONNANTE", "difficulty": 1, "tags": ["voyage", "géographie"], "signWords": ["cascade"]},
                    {"textFr": "Le volcan est encore actif.", "textLsf": "VOLCAN ENCORE ACTIF", "difficulty": 1, "tags": ["voyage", "géographie"], "signWords": ["volcan"]},
                    {"textFr": "La rivière traverse la vallée.", "textLsf": "RIVIÈRE VALLÉE TRAVERSER", "difficulty": 2, "tags": ["voyage", "géographie"], "signWords": ["rivière", "vallée"]},
                    {"textFr": "Je veux voir le glacier avant qu'il disparaisse.", "textLsf": "GLACIER DISPARAÎTRE AVANT MOI VOIR VOULOIR", "difficulty": 3, "tags": ["voyage", "géographie", "écologie"], "signWords": ["glacier"]},
                ]
            },
            {
                "title": "Sur la route", "description": "Préparer et vivre un voyage en LSF.", "sortOrder": 2, "xpReward": 35,
                "phrases": [
                    {"textFr": "Combien de continents as-tu visités ?", "textLsf": "TOI COMBIEN CONTINENT VISITER", "difficulty": 2, "tags": ["voyage", "géographie"], "signWords": ["continent"]},
                    {"textFr": "Le lac est très calme le matin.", "textLsf": "MATIN LAC TRÈS CALME", "difficulty": 1, "tags": ["voyage", "géographie"], "signWords": ["lac"]},
                    {"textFr": "La forêt amazonienne est gigantesque.", "textLsf": "FORÊT AMAZONIENNE GIGANTESQUE", "difficulty": 2, "tags": ["voyage", "géographie"], "signWords": ["forêt"]},
                    {"textFr": "La savane abrite de nombreux animaux.", "textLsf": "SAVANE ANIMAL NOMBREUX ABRITER", "difficulty": 3, "tags": ["voyage", "géographie"], "signWords": ["savane"]},
                    {"textFr": "Le fleuve est la frontière naturelle.", "textLsf": "FLEUVE FRONTIÈRE NATURELLE", "difficulty": 2, "tags": ["voyage", "géographie"], "signWords": ["fleuve"]},
                    {"textFr": "J'adore les plaines infinies.", "textLsf": "MOI PLAINE INFINIE ADORER", "difficulty": 2, "tags": ["voyage", "géographie"], "signWords": ["plaine"]},
                    {"textFr": "Le glacier fond à cause du réchauffement.", "textLsf": "GLACIER FONDRE CAUSE RÉCHAUFFEMENT", "difficulty": 3, "tags": ["voyage", "géographie", "écologie"], "signWords": ["glacier"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "La danse et les arts", "description": "La danse et l'expression artistique en LSF.", "level": 2, "sortOrder": last_sort + 7},
        "lessons": [
            {
                "title": "Danse et mouvement", "description": "La danse et les arts du spectacle en LSF.", "sortOrder": 1, "xpReward": 30,
                "phrases": [
                    {"textFr": "Elle danse le ballet depuis l'enfance.", "textLsf": "ELLE ENFANCE DEPUIS BALLET DANSER", "difficulty": 2, "tags": ["danse", "arts"], "signWords": ["ballet"]},
                    {"textFr": "Le hip-hop est ma danse préférée.", "textLsf": "MOI HIP-HOP DANSE PRÉFÉRÉ", "difficulty": 1, "tags": ["danse"], "signWords": ["hip-hop"]},
                    {"textFr": "La chorégraphie est magnifique.", "textLsf": "CHORÉGRAPHIE MAGNIFIQUE", "difficulty": 1, "tags": ["danse", "arts"], "signWords": ["chorégraphie"]},
                    {"textFr": "Le spectacle commence à 20h.", "textLsf": "SPECTACLE 20H COMMENCER", "difficulty": 1, "tags": ["arts", "spectacle"], "signWords": ["spectacle"]},
                    {"textFr": "Le mime exprime sans parler.", "textLsf": "MIME PARLER SANS EXPRIMER", "difficulty": 2, "tags": ["arts", "théâtre"], "signWords": ["mime"]},
                    {"textFr": "J'apprends la salsa en ce moment.", "textLsf": "MAINTENANT MOI SALSA APPRENDRE", "difficulty": 2, "tags": ["danse"], "signWords": ["salsa"]},
                    {"textFr": "L'équilibre est essentiel en danse.", "textLsf": "DANSE ÉQUILIBRE ESSENTIEL", "difficulty": 2, "tags": ["danse"], "signWords": ["équilibre", "danse"]},
                    {"textFr": "Le théâtre permet d'exprimer ses émotions.", "textLsf": "THÉÂTRE ÉMOTION EXPRIMER PERMETTRE", "difficulty": 3, "tags": ["arts", "théâtre"], "signWords": ["théâtre"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "Les arts plastiques", "description": "Peinture, sculpture et création artistique en LSF.", "level": 2, "sortOrder": last_sort + 8},
        "lessons": [
            {
                "title": "Créer et exposer", "description": "Le vocabulaire des arts plastiques en LSF.", "sortOrder": 1, "xpReward": 30,
                "phrases": [
                    {"textFr": "Je dessine un portrait au crayon.", "textLsf": "MOI PORTRAIT CRAYON DESSINER", "difficulty": 2, "tags": ["arts plastiques"], "signWords": ["dessiner", "portrait", "crayon"]},
                    {"textFr": "Elle peint un paysage à l'aquarelle.", "textLsf": "ELLE PAYSAGE AQUARELLE PEINDRE", "difficulty": 2, "tags": ["arts plastiques"], "signWords": ["peindre", "paysage", "aquarelle"]},
                    {"textFr": "La toile est encore humide.", "textLsf": "TOILE ENCORE HUMIDE", "difficulty": 1, "tags": ["arts plastiques"], "signWords": ["toile"]},
                    {"textFr": "L'exposition s'ouvre samedi.", "textLsf": "SAMEDI EXPOSITION OUVRIR", "difficulty": 1, "tags": ["arts plastiques"], "signWords": ["exposition"]},
                    {"textFr": "La sculpture en argile demande de la patience.", "textLsf": "ARGILE SCULPTURE PATIENCE DEMANDER", "difficulty": 2, "tags": ["arts plastiques"], "signWords": ["sculpter"]},
                    {"textFr": "Ce tableau abstrait est fascinant.", "textLsf": "CE TABLEAU ABSTRAIT FASCINANT", "difficulty": 2, "tags": ["arts plastiques"], "signWords": ["abstrait"]},
                    {"textFr": "Je nettoie mon pinceau après chaque couleur.", "textLsf": "MOI CHAQUE COULEUR APRÈS PINCEAU NETTOYER", "difficulty": 3, "tags": ["arts plastiques"], "signWords": ["pinceau"]},
                    {"textFr": "La galerie présente des artistes locaux.", "textLsf": "GALERIE ARTISTE LOCAL PRÉSENTER", "difficulty": 2, "tags": ["arts plastiques"], "signWords": ["galerie"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "La vie scolaire", "description": "Le vocabulaire de la vie à l'école en LSF.", "level": 1, "sortOrder": last_sort + 9},
        "lessons": [
            {
                "title": "En classe", "description": "La classe, les cours et les camarades en LSF.", "sortOrder": 1, "xpReward": 25,
                "phrases": [
                    {"textFr": "Le professeur écrit au tableau.", "textLsf": "PROFESSEUR TABLEAU ÉCRIRE", "difficulty": 1, "tags": ["école"], "signWords": ["professeur", "tableau"]},
                    {"textFr": "La récréation dure quinze minutes.", "textLsf": "RÉCRÉATION QUINZE MINUTES DURER", "difficulty": 2, "tags": ["école"], "signWords": ["récréation"]},
                    {"textFr": "Je mange à la cantine le midi.", "textLsf": "MIDI MOI CANTINE MANGER", "difficulty": 1, "tags": ["école"], "signWords": ["cantine"]},
                    {"textFr": "Les élèves écoutent le cours.", "textLsf": "ÉLÈVE COURS ÉCOUTER", "difficulty": 1, "tags": ["école"], "signWords": ["élève", "cours"]},
                    {"textFr": "Le bulletin arrive en fin de trimestre.", "textLsf": "TRIMESTRE FIN BULLETIN ARRIVER", "difficulty": 2, "tags": ["école"], "signWords": ["bulletin"]},
                    {"textFr": "Je prépare un exposé pour demain.", "textLsf": "DEMAIN MOI EXPOSÉ PRÉPARER", "difficulty": 2, "tags": ["école"], "signWords": ["exposé"]},
                    {"textFr": "J'ai raté mon contrôle.", "textLsf": "MOI CONTRÔLE RATER", "difficulty": 2, "tags": ["école"], "signWords": ["interro"]},
                    {"textFr": "Le diplôme me rend fier.", "textLsf": "DIPLÔME MOI FIER RENDRE", "difficulty": 2, "tags": ["école", "études"], "signWords": ["diplôme"]},
                ]
            },
            {
                "title": "Orientation et avenir", "description": "L'orientation scolaire et l'avenir en LSF.", "sortOrder": 2, "xpReward": 30,
                "phrases": [
                    {"textFr": "J'hésite entre deux orientations.", "textLsf": "MOI DEUX ORIENTATION HÉSITER", "difficulty": 2, "tags": ["école", "orientation"], "signWords": ["orientation"]},
                    {"textFr": "Le professeur m'aide à choisir.", "textLsf": "PROFESSEUR MOI CHOISIR AIDER", "difficulty": 1, "tags": ["école"], "signWords": ["professeur"]},
                    {"textFr": "Je veux faire des études longues.", "textLsf": "MOI ÉTUDES LONGUES FAIRE VOULOIR", "difficulty": 2, "tags": ["école", "études"], "signWords": ["études"]},
                    {"textFr": "Le redoublement n'est pas une honte.", "textLsf": "REDOUBLEMENT HONTE PAS", "difficulty": 2, "tags": ["école"], "signWords": ["redoublement"]},
                    {"textFr": "J'ai obtenu mon diplôme avec mention.", "textLsf": "MOI DIPLÔME MENTION OBTENIR", "difficulty": 2, "tags": ["école", "études"], "signWords": ["diplôme"]},
                    {"textFr": "La classe est de trente élèves.", "textLsf": "CLASSE TRENTE ÉLÈVE", "difficulty": 1, "tags": ["école"], "signWords": ["classe", "élève"]},
                    {"textFr": "Le cours de maths est difficile.", "textLsf": "MATHS COURS DIFFICILE", "difficulty": 1, "tags": ["école", "matières"], "signWords": ["cours"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "Fleurs et plantes", "description": "Les fleurs et les plantes en LSF.", "level": 1, "sortOrder": last_sort + 10},
        "lessons": [
            {
                "title": "Au jardin", "description": "Les fleurs et plantes du jardin en LSF.", "sortOrder": 1, "xpReward": 25,
                "phrases": [
                    {"textFr": "La rose est ma fleur préférée.", "textLsf": "MOI ROSE FLEUR PRÉFÉRÉ", "difficulty": 1, "tags": ["fleurs", "nature"], "signWords": ["rose"]},
                    {"textFr": "Le tournesol suit le soleil.", "textLsf": "TOURNESOL SOLEIL SUIVRE", "difficulty": 1, "tags": ["fleurs", "nature"], "signWords": ["tournesol"]},
                    {"textFr": "La lavande sent très bon.", "textLsf": "LAVANDE TRÈS BON SENTIR", "difficulty": 1, "tags": ["fleurs", "nature"], "signWords": ["lavande"]},
                    {"textFr": "Le cactus n'a pas besoin de beaucoup d'eau.", "textLsf": "CACTUS EAU BEAUCOUP BESOIN PAS", "difficulty": 2, "tags": ["plantes"], "signWords": ["cactus"]},
                    {"textFr": "La tulipe fleurit au printemps.", "textLsf": "PRINTEMPS TULIPE FLEURIR", "difficulty": 2, "tags": ["fleurs", "saisons"], "signWords": ["tulipe", "printemps"]},
                    {"textFr": "La graine devient une plante.", "textLsf": "GRAINE PLANTE DEVENIR", "difficulty": 1, "tags": ["plantes"], "signWords": ["graine"]},
                    {"textFr": "La fougère aime l'ombre et l'humidité.", "textLsf": "FOUGÈRE OMBRE HUMIDITÉ AIMER", "difficulty": 3, "tags": ["plantes"], "signWords": ["fougère"]},
                    {"textFr": "L'orchidée est une plante fragile.", "textLsf": "ORCHIDÉE PLANTE FRAGILE", "difficulty": 1, "tags": ["fleurs", "plantes"], "signWords": ["orchidée"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "Droits et justice", "description": "Le vocabulaire des droits et de la justice en LSF.", "level": 3, "sortOrder": last_sort + 11},
        "lessons": [
            {
                "title": "Loi et citoyenneté", "description": "La loi, les droits et la démocratie en LSF.", "sortOrder": 1, "xpReward": 35,
                "phrases": [
                    {"textFr": "La liberté d'expression est un droit fondamental.", "textLsf": "LIBERTÉ EXPRESSION DROIT FONDAMENTAL", "difficulty": 3, "tags": ["droits", "justice"], "signWords": ["liberté"]},
                    {"textFr": "J'ai voté aux dernières élections.", "textLsf": "MOI DERNIÈRE ÉLECTION VOTER", "difficulty": 2, "tags": ["politique", "citoyenneté"], "signWords": ["vote"]},
                    {"textFr": "La constitution protège les citoyens.", "textLsf": "CONSTITUTION CITOYEN PROTÉGER", "difficulty": 2, "tags": ["droits", "politique"], "signWords": ["constitution", "citoyen"]},
                    {"textFr": "Le tribunal a rendu son jugement.", "textLsf": "TRIBUNAL JUGEMENT RENDRE", "difficulty": 2, "tags": ["justice"], "signWords": ["tribunal", "justice"]},
                    {"textFr": "La discrimination est interdite par la loi.", "textLsf": "DISCRIMINATION LOI INTERDIRE", "difficulty": 3, "tags": ["droits", "justice"], "signWords": ["discrimination", "loi"]},
                    {"textFr": "La solidarité renforce la société.", "textLsf": "SOLIDARITÉ SOCIÉTÉ RENFORCER", "difficulty": 2, "tags": ["droits", "société"], "signWords": ["solidarité"]},
                    {"textFr": "Manifester est un droit démocratique.", "textLsf": "MANIFESTER DROIT DÉMOCRATIQUE", "difficulty": 2, "tags": ["droits", "politique"], "signWords": ["manifestation"]},
                    {"textFr": "L'égalité est inscrite dans la loi.", "textLsf": "ÉGALITÉ LOI INSCRIRE", "difficulty": 2, "tags": ["droits", "justice"], "signWords": ["égalité", "loi"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "Philosophie et valeurs", "description": "Les grandes valeurs et concepts philosophiques en LSF.", "level": 3, "sortOrder": last_sort + 12},
        "lessons": [
            {
                "title": "Valeurs humaines", "description": "Vérité, courage, justice — les valeurs en LSF.", "sortOrder": 1, "xpReward": 35,
                "phrases": [
                    {"textFr": "La vérité est toujours préférable au mensonge.", "textLsf": "VÉRITÉ MENSONGE PRÉFÉRABLE TOUJOURS", "difficulty": 3, "tags": ["philosophie", "valeurs"], "signWords": ["vérité", "mensonge"]},
                    {"textFr": "Le courage c'est agir malgré la peur.", "textLsf": "COURAGE PEUR MALGRÉ AGIR", "difficulty": 3, "tags": ["philosophie", "valeurs"], "signWords": ["courage"]},
                    {"textFr": "La patience est une grande sagesse.", "textLsf": "PATIENCE SAGESSE GRANDE", "difficulty": 2, "tags": ["philosophie", "valeurs"], "signWords": ["patience", "sagesse"]},
                    {"textFr": "Le bonheur se construit chaque jour.", "textLsf": "BONHEUR CHAQUE JOUR CONSTRUIRE", "difficulty": 2, "tags": ["philosophie", "bien-être"], "signWords": ["bonheur"]},
                    {"textFr": "Le respect mutuel est essentiel.", "textLsf": "RESPECT MUTUEL ESSENTIEL", "difficulty": 2, "tags": ["philosophie", "valeurs"], "signWords": ["respect"]},
                    {"textFr": "La générosité rend heureux.", "textLsf": "GÉNÉROSITÉ HEUREUX RENDRE", "difficulty": 2, "tags": ["philosophie", "valeurs"], "signWords": ["générosité"]},
                    {"textFr": "La confiance se gagne avec le temps.", "textLsf": "CONFIANCE TEMPS AVEC GAGNER", "difficulty": 2, "tags": ["philosophie", "valeurs"], "signWords": ["confiance"]},
                    {"textFr": "La tolérance permet de vivre ensemble.", "textLsf": "TOLÉRANCE ENSEMBLE VIVRE PERMETTRE", "difficulty": 3, "tags": ["philosophie", "société"], "signWords": ["tolérance"]},
                ]
            }
        ]
    },
    {
        "module": {"title": "L'informatique et les jeux vidéo", "description": "Le vocabulaire de l'informatique en LSF.", "level": 2, "sortOrder": last_sort + 13},
        "lessons": [
            {
                "title": "Ordinateur et logiciels", "description": "Clavier, souris, applications — l'informatique en LSF.", "sortOrder": 1, "xpReward": 30,
                "phrases": [
                    {"textFr": "Mon clavier ne fonctionne plus.", "textLsf": "MOI CLAVIER FONCTIONNER PLUS PAS", "difficulty": 2, "tags": ["informatique"], "signWords": ["clavier"]},
                    {"textFr": "Je télécharge cette application.", "textLsf": "MOI CETTE APPLICATION TÉLÉCHARGER", "difficulty": 2, "tags": ["informatique"], "signWords": ["application", "télécharger"]},
                    {"textFr": "Sauvegarde ton fichier avant de fermer.", "textLsf": "FICHIER FERMER AVANT SAUVEGARDER", "difficulty": 2, "tags": ["informatique"], "signWords": ["sauvegarder", "fichier"]},
                    {"textFr": "J'ai supprimé le mauvais dossier.", "textLsf": "MOI MAUVAIS DOSSIER SUPPRIMER", "difficulty": 2, "tags": ["informatique"], "signWords": ["supprimer", "dossier"]},
                    {"textFr": "La souris est sans fil.", "textLsf": "SOURIS SANS FIL", "difficulty": 1, "tags": ["informatique"], "signWords": ["souris"]},
                    {"textFr": "Je programme en Python.", "textLsf": "MOI PYTHON PROGRAMMER", "difficulty": 2, "tags": ["informatique"], "signWords": ["programmer"]},
                    {"textFr": "Ce jeu vidéo est au niveau cinq.", "textLsf": "CE JEU VIDÉO NIVEAU CINQ", "difficulty": 2, "tags": ["jeux vidéo"], "signWords": ["jeu vidéo", "niveau"]},
                    {"textFr": "On joue en mode multijoueur.", "textLsf": "NOUS MULTIJOUEUR MODE JOUER", "difficulty": 2, "tags": ["jeux vidéo"], "signWords": ["multijoueur"]},
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
print(f"\n{'─'*55}")
print(f"  {len(data)} modules | {total} phrases au total")
for m in data:
    n = sum(len(l['phrases']) for l in m['lessons'])
    flag = "" if n >= 15 else f"  ← {n}"
    print(f"  {m['module']['title']}: {n}{flag}")
