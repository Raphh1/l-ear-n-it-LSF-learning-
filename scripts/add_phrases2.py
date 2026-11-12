#!/usr/bin/env python3
"""Complète les modules courts + crée de nouveaux modules de phrases."""
import json

PATH = '/home/raphaelcau/l-ear-n-it-LSF-learning-/lsf-api/Data/seed-phrases.json'

with open(PATH) as f:
    data = json.load(f)

# ── 1. Compléter les modules à 13-14 phrases ────────────────────────────────

completions = {
    "Nourriture et repas": [
        {"textFr": "Tu veux encore du pain ?", "textLsf": "TOI PAIN ENCORE VOULOIR", "difficulty": 1, "tags": ["nourriture"], "signWords": ["pain"]},
        {"textFr": "Ce repas était délicieux.", "textLsf": "CE REPAS DÉLICIEUX", "difficulty": 1, "tags": ["nourriture"], "signWords": ["repas"]},
    ],
    "La météo et les saisons": [
        {"textFr": "Il y a du brouillard ce matin.", "textLsf": "MATIN BROUILLARD AVOIR", "difficulty": 2, "tags": ["météo"], "signWords": ["brouillard"]},
        {"textFr": "La canicule dure depuis une semaine.", "textLsf": "CANICULE UNE SEMAINE DURER", "difficulty": 2, "tags": ["météo", "saisons"], "signWords": ["canicule"]},
    ],
    "Sports et loisirs": [
        {"textFr": "L'entraîneur dirige l'équipe.", "textLsf": "ENTRAÎNEUR ÉQUIPE DIRIGER", "difficulty": 2, "tags": ["sports"], "signWords": ["entraîneur", "équipe"]},
        {"textFr": "On a gagné le match !", "textLsf": "MATCH NOUS GAGNER VICTOIRE", "difficulty": 1, "tags": ["sports"], "signWords": ["match", "victoire"]},
    ],
    "La nature et l'environnement": [
        {"textFr": "La biodiversité est menacée.", "textLsf": "BIODIVERSITÉ MENACÉE", "difficulty": 2, "tags": ["environnement"], "signWords": ["biodiversité"]},
        {"textFr": "On doit réduire nos déchets.", "textLsf": "NOUS DÉCHET RÉDUIRE DEVOIR", "difficulty": 2, "tags": ["environnement", "écologie"], "signWords": ["déchet"]},
    ],
}

for module in data:
    title = module["module"]["title"]
    if title in completions:
        module["lessons"][-1]["phrases"].extend(completions[title])
        n = sum(len(l["phrases"]) for l in module["lessons"])
        print(f"  + {title}: désormais {n} phrases")

# ── 2. Nouveaux modules ──────────────────────────────────────────────────────

last_sort = max(m["module"]["sortOrder"] for m in data)

new_modules = [
    {
        "module": {"title": "Fruits et légumes", "description": "Nommer les fruits et légumes du quotidien en LSF.", "level": 1, "sortOrder": last_sort + 1},
        "lessons": [{
            "title": "Fruits du quotidien", "description": "Les fruits les plus courants en LSF.", "sortOrder": 1, "xpReward": 25,
            "phrases": [
                {"textFr": "Je mange une pomme chaque matin.", "textLsf": "MATIN MOI POMME MANGER", "difficulty": 1, "tags": ["fruits", "nourriture"], "signWords": ["pomme"]},
                {"textFr": "Tu veux une banane ?", "textLsf": "TOI BANANE VOULOIR", "difficulty": 1, "tags": ["fruits"], "signWords": ["banane"]},
                {"textFr": "J'adore les fraises en été.", "textLsf": "ÉTÉ MOI FRAISE ADORER", "difficulty": 2, "tags": ["fruits", "saisons"], "signWords": ["fraise", "été"]},
                {"textFr": "Ce citron est très acide.", "textLsf": "CE CITRON TRÈS ACIDE", "difficulty": 1, "tags": ["fruits"], "signWords": ["citron"]},
                {"textFr": "La pastèque est parfaite en été.", "textLsf": "ÉTÉ PASTÈQUE PARFAITE", "difficulty": 2, "tags": ["fruits", "saisons"], "signWords": ["pastèque", "été"]},
                {"textFr": "Tu as du raisin ?", "textLsf": "TOI RAISIN AVOIR", "difficulty": 1, "tags": ["fruits"], "signWords": ["raisin"]},
                {"textFr": "J'ai acheté des carottes et des tomates.", "textLsf": "MOI CAROTTE TOMATE ACHETER", "difficulty": 2, "tags": ["légumes"], "signWords": ["carotte", "tomate"]},
                {"textFr": "L'ail donne beaucoup de goût.", "textLsf": "AIL GOÛT BEAUCOUP DONNER", "difficulty": 2, "tags": ["légumes", "cuisine"], "signWords": ["ail"]},
            ]
        }, {
            "title": "Légumes du marché", "description": "Les légumes les plus courants en LSF.", "sortOrder": 2, "xpReward": 30,
            "phrases": [
                {"textFr": "Le brocoli est bon pour la santé.", "textLsf": "BROCOLI SANTÉ BON", "difficulty": 1, "tags": ["légumes", "santé"], "signWords": ["brocoli"]},
                {"textFr": "Je n'aime pas les épinards.", "textLsf": "MOI ÉPINARD AIMER PAS", "difficulty": 1, "tags": ["légumes"], "signWords": ["épinard"]},
                {"textFr": "La salade est dans le frigo.", "textLsf": "SALADE FRIGO DANS", "difficulty": 1, "tags": ["légumes"], "signWords": ["salade"]},
                {"textFr": "Coupe l'oignon en petits morceaux.", "textLsf": "OIGNON PETIT MORCEAUX COUPER", "difficulty": 2, "tags": ["légumes", "cuisine"], "signWords": ["oignon"]},
                {"textFr": "La pomme de terre se prépare de mille façons.", "textLsf": "POMME DE TERRE BEAUCOUP FAÇON PRÉPARER", "difficulty": 3, "tags": ["légumes", "cuisine"], "signWords": ["pomme de terre"]},
                {"textFr": "Tu veux du poivron rouge ou vert ?", "textLsf": "TOI POIVRON ROUGE VERT VOULOIR", "difficulty": 2, "tags": ["légumes"], "signWords": ["poivron"]},
                {"textFr": "Le concombre est frais et léger.", "textLsf": "CONCOMBRE FRAIS LÉGER", "difficulty": 1, "tags": ["légumes"], "signWords": ["concombre"]},
            ]
        }]
    },
    {
        "module": {"title": "Les boissons", "description": "Parler des boissons du quotidien en LSF.", "level": 1, "sortOrder": last_sort + 2},
        "lessons": [{
            "title": "Boissons chaudes et froides", "description": "Du café au jus de fruit, les boissons en LSF.", "sortOrder": 1, "xpReward": 25,
            "phrases": [
                {"textFr": "Tu veux un café ou un thé ?", "textLsf": "TOI CAFÉ THÉ VOULOIR", "difficulty": 1, "tags": ["boissons"], "signWords": ["café", "thé"]},
                {"textFr": "Je bois du lait chaud le matin.", "textLsf": "MATIN MOI LAIT CHAUD BOIRE", "difficulty": 2, "tags": ["boissons"], "signWords": ["lait"]},
                {"textFr": "Un chocolat chaud s'il vous plaît.", "textLsf": "MOI CHOCOLAT CHAUD VOULOIR", "difficulty": 1, "tags": ["boissons"], "signWords": ["chocolat chaud"]},
                {"textFr": "Je ne bois jamais d'alcool.", "textLsf": "MOI ALCOOL JAMAIS BOIRE", "difficulty": 2, "tags": ["boissons"], "signWords": ["vin"]},
                {"textFr": "On prend une limonade ?", "textLsf": "NOUS LIMONADE PRENDRE", "difficulty": 1, "tags": ["boissons"], "signWords": ["limonade"]},
                {"textFr": "Le soda contient trop de sucre.", "textLsf": "SODA SUCRE TROP AVOIR", "difficulty": 2, "tags": ["boissons", "santé"], "signWords": ["soda"]},
                {"textFr": "J'aime beaucoup la tisane le soir.", "textLsf": "SOIR MOI TISANE BEAUCOUP AIMER", "difficulty": 2, "tags": ["boissons"], "signWords": ["tisane"]},
                {"textFr": "Tu veux du sirop avec de l'eau ?", "textLsf": "TOI SIROP EAU AVEC VOULOIR", "difficulty": 1, "tags": ["boissons"], "signWords": ["sirop"]},
            ]
        }]
    },
    {
        "module": {"title": "Les animaux", "description": "Parler des animaux en LSF.", "level": 1, "sortOrder": last_sort + 3},
        "lessons": [{
            "title": "Animaux de la ferme", "description": "Vaches, chevaux et animaux du quotidien.", "sortOrder": 1, "xpReward": 25,
            "phrases": [
                {"textFr": "La vache donne du lait.", "textLsf": "VACHE LAIT DONNER", "difficulty": 1, "tags": ["animaux", "ferme"], "signWords": ["vache", "lait"]},
                {"textFr": "Le cheval court très vite.", "textLsf": "CHEVAL TRÈS VITE COURIR", "difficulty": 1, "tags": ["animaux", "ferme"], "signWords": ["cheval"]},
                {"textFr": "Il y a des poules dans la ferme.", "textLsf": "FERME POULE AVOIR", "difficulty": 1, "tags": ["animaux", "ferme"], "signWords": ["poule"]},
                {"textFr": "Le cochon se roule dans la boue.", "textLsf": "COCHON BOUE ROULER", "difficulty": 2, "tags": ["animaux", "ferme"], "signWords": ["cochon"]},
                {"textFr": "L'agneau est tout doux.", "textLsf": "AGNEAU TRÈS DOUX", "difficulty": 1, "tags": ["animaux", "ferme"], "signWords": ["agneau"]},
                {"textFr": "Le coq chante le matin.", "textLsf": "MATIN COQ CHANTER", "difficulty": 1, "tags": ["animaux", "ferme"], "signWords": ["coq"]},
                {"textFr": "Le canard nage sur l'étang.", "textLsf": "CANARD NAGER", "difficulty": 1, "tags": ["animaux", "ferme"], "signWords": ["canard"]},
                {"textFr": "Le lapin mange des carottes.", "textLsf": "LAPIN CAROTTE MANGER", "difficulty": 1, "tags": ["animaux", "ferme"], "signWords": ["lapin", "carotte"]},
            ]
        }, {
            "title": "Animaux marins", "description": "Les créatures des océans en LSF.", "sortOrder": 2, "xpReward": 30,
            "phrases": [
                {"textFr": "Le dauphin est très intelligent.", "textLsf": "DAUPHIN TRÈS INTELLIGENT", "difficulty": 1, "tags": ["animaux", "mer"], "signWords": ["dauphin"]},
                {"textFr": "J'ai peur des requins.", "textLsf": "MOI REQUIN PEUR AVOIR", "difficulty": 1, "tags": ["animaux", "mer"], "signWords": ["requin"]},
                {"textFr": "La baleine est le plus grand animal.", "textLsf": "BALEINE ANIMAL PLUS GRAND", "difficulty": 2, "tags": ["animaux", "mer"], "signWords": ["baleine"]},
                {"textFr": "La pieuvre a huit bras.", "textLsf": "PIEUVRE HUIT BRAS AVOIR", "difficulty": 2, "tags": ["animaux", "mer"], "signWords": ["pieuvre"]},
                {"textFr": "Le pingouin ne vole pas.", "textLsf": "PINGOUIN VOLER PAS", "difficulty": 1, "tags": ["animaux", "mer"], "signWords": ["pingouin"]},
                {"textFr": "J'ai vu des dauphins en vacances.", "textLsf": "VACANCES MOI DAUPHIN VOIR", "difficulty": 2, "tags": ["animaux", "mer", "voyages"], "signWords": ["dauphin"]},
                {"textFr": "Le crabe marche de côté.", "textLsf": "CRABE CÔTÉ MARCHER", "difficulty": 2, "tags": ["animaux", "mer"], "signWords": ["crabe"]},
            ]
        }]
    },
    {
        "module": {"title": "La musique", "description": "Parler de musique et d'instruments en LSF.", "level": 1, "sortOrder": last_sort + 4},
        "lessons": [{
            "title": "Les instruments", "description": "Nommer les instruments de musique en LSF.", "sortOrder": 1, "xpReward": 25,
            "phrases": [
                {"textFr": "Je joue de la guitare depuis cinq ans.", "textLsf": "CINQ ANS MOI GUITARE JOUER", "difficulty": 2, "tags": ["musique", "instruments"], "signWords": ["guitare"]},
                {"textFr": "Elle joue du piano très bien.", "textLsf": "ELLE PIANO TRÈS BIEN JOUER", "difficulty": 2, "tags": ["musique", "instruments"], "signWords": ["piano"]},
                {"textFr": "Le violon est difficile à apprendre.", "textLsf": "VIOLON APPRENDRE DIFFICILE", "difficulty": 2, "tags": ["musique", "instruments"], "signWords": ["violon"]},
                {"textFr": "Tu aimes le jazz ou le classique ?", "textLsf": "TOI JAZZ CLASSIQUE AIMER", "difficulty": 1, "tags": ["musique"], "signWords": ["jazz", "classique"]},
                {"textFr": "Le concert commence à 20h.", "textLsf": "CONCERT 20H COMMENCER", "difficulty": 1, "tags": ["musique"], "signWords": ["concert"]},
                {"textFr": "J'adore cette mélodie.", "textLsf": "CETTE MÉLODIE MOI ADORER", "difficulty": 1, "tags": ["musique"], "signWords": ["mélodie"]},
                {"textFr": "La batterie est très bruyante.", "textLsf": "BATTERIE TRÈS BRUYANTE", "difficulty": 1, "tags": ["musique", "instruments"], "signWords": ["batterie"]},
                {"textFr": "Il joue de la trompette dans un orchestre.", "textLsf": "LUI ORCHESTRE TROMPETTE JOUER", "difficulty": 2, "tags": ["musique", "instruments"], "signWords": ["trompette"]},
            ]
        }]
    },
    {
        "module": {"title": "Le corps humain", "description": "Nommer les parties du corps en LSF.", "level": 2, "sortOrder": last_sort + 5},
        "lessons": [{
            "title": "Organes et articulations", "description": "Les parties internes et articulations du corps.", "sortOrder": 1, "xpReward": 30,
            "phrases": [
                {"textFr": "Mon genou me fait mal depuis ce matin.", "textLsf": "MATIN DEPUIS MOI GENOU MAL", "difficulty": 2, "tags": ["corps", "santé"], "signWords": ["genou"]},
                {"textFr": "Le cerveau contrôle tout le corps.", "textLsf": "CERVEAU CORPS TOUT CONTRÔLER", "difficulty": 2, "tags": ["corps", "santé"], "signWords": ["cerveau"]},
                {"textFr": "Il a eu une opération au genou.", "textLsf": "LUI GENOU OPÉRATION AVOIR", "difficulty": 2, "tags": ["corps", "santé"], "signWords": ["genou"]},
                {"textFr": "Je me suis fait mal à l'épaule.", "textLsf": "MOI ÉPAULE MAL FAIRE", "difficulty": 2, "tags": ["corps", "santé"], "signWords": ["épaule"]},
                {"textFr": "Le muscle se renforce avec le sport.", "textLsf": "MUSCLE SPORT AVEC RENFORCER", "difficulty": 2, "tags": ["corps", "sport"], "signWords": ["muscle"]},
                {"textFr": "J'ai une douleur à la cheville.", "textLsf": "MOI CHEVILLE DOULEUR AVOIR", "difficulty": 2, "tags": ["corps", "santé"], "signWords": ["cheville"]},
                {"textFr": "Le foie filtre le sang.", "textLsf": "FOIE SANG FILTRER", "difficulty": 2, "tags": ["corps", "santé"], "signWords": ["foie"]},
                {"textFr": "Le poumon permet de respirer.", "textLsf": "POUMON RESPIRER PERMETTRE", "difficulty": 1, "tags": ["corps", "santé"], "signWords": ["poumon"]},
            ]
        }]
    },
    {
        "module": {"title": "Dans la cuisine", "description": "Les gestes et techniques culinaires en LSF.", "level": 1, "sortOrder": last_sort + 6},
        "lessons": [{
            "title": "Gestes et techniques", "description": "Couper, cuire, mélanger — la cuisine en LSF.", "sortOrder": 1, "xpReward": 25,
            "phrases": [
                {"textFr": "Coupe les légumes en petits morceaux.", "textLsf": "LÉGUME PETIT MORCEAU COUPER", "difficulty": 2, "tags": ["cuisine"], "signWords": ["couper"]},
                {"textFr": "Mélange bien les ingrédients.", "textLsf": "INGRÉDIENT BIEN MÉLANGER", "difficulty": 1, "tags": ["cuisine"], "signWords": ["mélanger", "ingrédient"]},
                {"textFr": "Fais cuire à feu doux pendant vingt minutes.", "textLsf": "VINGT MINUTES FEU DOUX CUIRE", "difficulty": 3, "tags": ["cuisine"], "signWords": ["cuire"]},
                {"textFr": "Épluche les pommes de terre.", "textLsf": "POMME DE TERRE ÉPLUCHER", "difficulty": 1, "tags": ["cuisine"], "signWords": ["éplucher", "pomme de terre"]},
                {"textFr": "Verse un peu d'huile dans la poêle.", "textLsf": "POÊLE HUILE PEU VERSER", "difficulty": 2, "tags": ["cuisine"], "signWords": ["verser", "poêle"]},
                {"textFr": "Goûte et ajoute du sel si besoin.", "textLsf": "GOÛTER SEL BESOIN AJOUTER", "difficulty": 2, "tags": ["cuisine"], "signWords": ["goûter"]},
                {"textFr": "Mets le plat au four pendant trente minutes.", "textLsf": "PLAT FOUR TRENTE MINUTES METTRE", "difficulty": 2, "tags": ["cuisine"], "signWords": ["four"]},
                {"textFr": "Congèle le reste pour plus tard.", "textLsf": "RESTE PLUS TARD CONGELER", "difficulty": 2, "tags": ["cuisine"], "signWords": ["congeler"]},
            ]
        }]
    },
    {
        "module": {"title": "La communauté sourde", "description": "Comprendre et parler de la communauté sourde en LSF.", "level": 2, "sortOrder": last_sort + 7},
        "lessons": [{
            "title": "Identité et communauté", "description": "La LSF, l'identité sourde et l'inclusion.", "sortOrder": 1, "xpReward": 30,
            "phrases": [
                {"textFr": "Je suis sourd depuis la naissance.", "textLsf": "MOI NAISSANCE SOURD", "difficulty": 1, "tags": ["communauté sourde", "identité"], "signWords": ["sourd"]},
                {"textFr": "La LSF est ma langue maternelle.", "textLsf": "MOI LSF LANGUE MATERNELLE", "difficulty": 1, "tags": ["communauté sourde", "LSF"], "signWords": ["LSF"]},
                {"textFr": "L'interprète traduit en LSF.", "textLsf": "INTERPRÈTE LSF TRADUIRE", "difficulty": 2, "tags": ["communauté sourde", "LSF"], "signWords": ["interprète", "LSF"]},
                {"textFr": "Le sous-titrage est important pour l'accessibilité.", "textLsf": "SOUS-TITRAGE ACCESSIBILITÉ IMPORTANT", "difficulty": 2, "tags": ["communauté sourde", "accessibilité"], "signWords": ["sous-titrage", "accessibilité"]},
                {"textFr": "Tu connais la dactylologie ?", "textLsf": "TOI DACTYLOLOGIE CONNAÎTRE", "difficulty": 1, "tags": ["communauté sourde", "LSF"], "signWords": ["dactylologie"]},
                {"textFr": "Cette école est inclusive.", "textLsf": "CETTE ÉCOLE INCLUSIF", "difficulty": 1, "tags": ["communauté sourde", "éducation"], "signWords": ["inclusif"]},
                {"textFr": "Mon implant cochléaire m'aide beaucoup.", "textLsf": "MOI IMPLANT COCHLÉAIRE BEAUCOUP AIDER", "difficulty": 2, "tags": ["communauté sourde"], "signWords": ["implant cochléaire"]},
                {"textFr": "La communauté sourde est très soudée.", "textLsf": "COMMUNAUTÉ SOURDE TRÈS SOUDÉE", "difficulty": 2, "tags": ["communauté sourde"], "signWords": ["communauté", "sourd"]},
            ]
        }]
    },
    {
        "module": {"title": "L'environnement et l'écologie", "description": "Parler d'environnement et d'écologie en LSF.", "level": 2, "sortOrder": last_sort + 8},
        "lessons": [{
            "title": "Écologie et nature", "description": "La planète et l'environnement en LSF.", "sortOrder": 1, "xpReward": 30,
            "phrases": [
                {"textFr": "On doit protéger la biodiversité.", "textLsf": "NOUS BIODIVERSITÉ PROTÉGER DEVOIR", "difficulty": 2, "tags": ["écologie", "environnement"], "signWords": ["biodiversité"]},
                {"textFr": "Le plastique pollue les océans.", "textLsf": "PLASTIQUE OCÉAN POLLUER", "difficulty": 2, "tags": ["écologie", "environnement"], "signWords": ["plastique"]},
                {"textFr": "Je fais attention à mes déchets.", "textLsf": "MOI DÉCHET ATTENTION FAIRE", "difficulty": 2, "tags": ["écologie"], "signWords": ["déchet"]},
                {"textFr": "L'eau potable est précieuse.", "textLsf": "EAU POTABLE PRÉCIEUSE", "difficulty": 1, "tags": ["écologie", "environnement"], "signWords": ["eau potable"]},
                {"textFr": "La déforestation détruit les habitats.", "textLsf": "DÉFORESTATION HABITAT DÉTRUIRE", "difficulty": 3, "tags": ["écologie", "environnement"], "signWords": ["déforestation"]},
                {"textFr": "Je suis végétarien pour la planète.", "textLsf": "MOI PLANÈTE VÉGÉTARIEN", "difficulty": 1, "tags": ["écologie", "alimentation"], "signWords": ["végétarien"]},
                {"textFr": "On devrait faire du covoiturage.", "textLsf": "NOUS COVOITURAGE DEVOIR FAIRE", "difficulty": 2, "tags": ["écologie", "transports"], "signWords": ["covoiturage"]},
                {"textFr": "Le développement durable est l'avenir.", "textLsf": "DÉVELOPPEMENT DURABLE AVENIR", "difficulty": 2, "tags": ["écologie"], "signWords": ["développement durable"]},
            ]
        }]
    },
    {
        "module": {"title": "Les mois et les saisons", "description": "Parler du temps et des saisons en LSF.", "level": 1, "sortOrder": last_sort + 9},
        "lessons": [{
            "title": "Les mois de l'année", "description": "Janvier à décembre en LSF.", "sortOrder": 1, "xpReward": 25,
            "phrases": [
                {"textFr": "Mon anniversaire est en avril.", "textLsf": "MOI ANNIVERSAIRE AVRIL", "difficulty": 1, "tags": ["mois", "calendrier"], "signWords": ["avril", "anniversaire"]},
                {"textFr": "Les vacances commencent en juillet.", "textLsf": "VACANCES JUILLET COMMENCER", "difficulty": 1, "tags": ["mois", "vacances"], "signWords": ["juillet"]},
                {"textFr": "En décembre il fait très froid.", "textLsf": "DÉCEMBRE TRÈS FROID", "difficulty": 1, "tags": ["mois", "météo"], "signWords": ["décembre"]},
                {"textFr": "La rentrée scolaire est en septembre.", "textLsf": "RENTRÉE SCOLAIRE SEPTEMBRE", "difficulty": 2, "tags": ["mois", "école"], "signWords": ["septembre"]},
                {"textFr": "Février est le mois le plus court.", "textLsf": "FÉVRIER MOIS PLUS COURT", "difficulty": 2, "tags": ["mois", "calendrier"], "signWords": ["février"]},
                {"textFr": "En juin les journées sont longues.", "textLsf": "JUIN JOURNÉE LONGUE", "difficulty": 2, "tags": ["mois", "météo"], "signWords": ["juin"]},
                {"textFr": "Les impôts se paient en mai.", "textLsf": "MAI IMPÔT PAYER", "difficulty": 2, "tags": ["mois"], "signWords": ["mai"]},
                {"textFr": "En mars le printemps commence.", "textLsf": "MARS PRINTEMPS COMMENCER", "difficulty": 1, "tags": ["mois", "saisons"], "signWords": ["mars", "printemps"]},
            ]
        }, {
            "title": "Les quatre saisons", "description": "Le printemps, l'été, l'automne et l'hiver en LSF.", "sortOrder": 2, "xpReward": 30,
            "phrases": [
                {"textFr": "J'adore le printemps quand les fleurs poussent.", "textLsf": "PRINTEMPS FLEUR POUSSER MOI ADORER", "difficulty": 2, "tags": ["saisons"], "signWords": ["printemps"]},
                {"textFr": "En été il fait très chaud.", "textLsf": "ÉTÉ TRÈS CHAUD", "difficulty": 1, "tags": ["saisons", "météo"], "signWords": ["été"]},
                {"textFr": "En automne les feuilles changent de couleur.", "textLsf": "AUTOMNE FEUILLE COULEUR CHANGER", "difficulty": 2, "tags": ["saisons"], "signWords": ["automne"]},
                {"textFr": "L'hiver il neige dans les montagnes.", "textLsf": "HIVER MONTAGNE NEIGER", "difficulty": 2, "tags": ["saisons", "météo"], "signWords": ["hiver"]},
                {"textFr": "La vendange se fait en automne.", "textLsf": "AUTOMNE VENDANGE FAIRE", "difficulty": 2, "tags": ["saisons"], "signWords": ["automne", "vendange"]},
                {"textFr": "Le givre recouvre les vitres en hiver.", "textLsf": "HIVER GIVRE VITRE RECOUVRIR", "difficulty": 3, "tags": ["saisons", "météo"], "signWords": ["hiver", "givre"]},
                {"textFr": "Quelle est ta saison préférée ?", "textLsf": "TOI SAISON PRÉFÉRÉE QUOI", "difficulty": 1, "tags": ["saisons"], "signWords": ["saison"]},
            ]
        }]
    },
    {
        "module": {"title": "Les sports collectifs", "description": "Parler des sports d'équipe en LSF.", "level": 1, "sortOrder": last_sort + 10},
        "lessons": [{
            "title": "Équipe et match", "description": "Le vocabulaire des sports collectifs en LSF.", "sortOrder": 1, "xpReward": 25,
            "phrases": [
                {"textFr": "Notre équipe a gagné le championnat.", "textLsf": "NOTRE ÉQUIPE CHAMPIONNAT GAGNER", "difficulty": 2, "tags": ["sports", "équipe"], "signWords": ["équipe", "championnat"]},
                {"textFr": "L'arbitre a sifflé une faute.", "textLsf": "ARBITRE FAUTE SIFFLER", "difficulty": 2, "tags": ["sports"], "signWords": ["arbitre", "faute"]},
                {"textFr": "Le but a été annulé.", "textLsf": "BUT ANNULER", "difficulty": 1, "tags": ["sports"], "signWords": ["but"]},
                {"textFr": "L'entraîneur change de tactique.", "textLsf": "ENTRAÎNEUR TACTIQUE CHANGER", "difficulty": 2, "tags": ["sports"], "signWords": ["entraîneur"]},
                {"textFr": "Le match se joue dimanche.", "textLsf": "DIMANCHE MATCH JOUER", "difficulty": 1, "tags": ["sports"], "signWords": ["match"]},
                {"textFr": "On joue au handball ce soir.", "textLsf": "SOIR NOUS HANDBALL JOUER", "difficulty": 1, "tags": ["sports", "handball"], "signWords": ["handball"]},
                {"textFr": "La victoire est méritée.", "textLsf": "VICTOIRE MÉRITÉE", "difficulty": 1, "tags": ["sports"], "signWords": ["victoire"]},
                {"textFr": "Le terrain est en mauvais état.", "textLsf": "TERRAIN MAUVAIS ÉTAT AVOIR", "difficulty": 2, "tags": ["sports"], "signWords": ["terrain"]},
            ]
        }]
    },
    {
        "module": {"title": "Positions et directions", "description": "Décrire l'espace et les directions en LSF.", "level": 1, "sortOrder": last_sort + 11},
        "lessons": [{
            "title": "Gauche, droite, devant", "description": "Les positions et directions en LSF.", "sortOrder": 1, "xpReward": 25,
            "phrases": [
                {"textFr": "Tourne à gauche au prochain carrefour.", "textLsf": "PROCHAIN CARREFOUR GAUCHE TOURNER", "difficulty": 2, "tags": ["directions"], "signWords": ["gauche"]},
                {"textFr": "Le cinéma est à droite.", "textLsf": "CINÉMA DROITE ÊTRE", "difficulty": 1, "tags": ["directions"], "signWords": ["droite"]},
                {"textFr": "L'école est loin d'ici.", "textLsf": "ICI ÉCOLE LOIN", "difficulty": 1, "tags": ["directions"], "signWords": ["loin"]},
                {"textFr": "Reste devant moi, s'il te plaît.", "textLsf": "MOI DEVANT RESTER", "difficulty": 1, "tags": ["directions", "positions"], "signWords": ["devant"]},
                {"textFr": "Le chat est sous la table.", "textLsf": "CHAT TABLE DESSOUS", "difficulty": 1, "tags": ["positions"], "signWords": ["dessous"]},
                {"textFr": "L'hôtel est entre la banque et la poste.", "textLsf": "BANQUE POSTE ENTRE HÔTEL", "difficulty": 2, "tags": ["directions"], "signWords": ["entre"]},
                {"textFr": "On est au milieu de la forêt.", "textLsf": "FORÊT MILIEU NOUS ÊTRE", "difficulty": 2, "tags": ["directions"], "signWords": ["milieu"]},
                {"textFr": "Il habite près d'ici.", "textLsf": "LUI ICI PRÈS HABITER", "difficulty": 1, "tags": ["directions"], "signWords": ["près"]},
            ]
        }]
    },
    {
        "module": {"title": "Les médias et la presse", "description": "Parler des médias et de l'information en LSF.", "level": 2, "sortOrder": last_sort + 12},
        "lessons": [{
            "title": "Presse et information", "description": "Journaux, radio, télévision et réseaux sociaux en LSF.", "sortOrder": 1, "xpReward": 30,
            "phrases": [
                {"textFr": "J'ai lu cet article ce matin.", "textLsf": "MATIN MOI CET ARTICLE LIRE", "difficulty": 2, "tags": ["médias", "presse"], "signWords": ["article", "journal"]},
                {"textFr": "Ce reportage était très intéressant.", "textLsf": "CE REPORTAGE TRÈS INTÉRESSANT", "difficulty": 1, "tags": ["médias"], "signWords": ["reportage"]},
                {"textFr": "Le journaliste interviewe le président.", "textLsf": "JOURNALISTE PRÉSIDENT INTERVIEWER", "difficulty": 2, "tags": ["médias", "presse"], "signWords": ["journaliste"]},
                {"textFr": "Je regarde les actualités chaque soir.", "textLsf": "SOIR CHAQUE MOI ACTUALITÉ REGARDER", "difficulty": 2, "tags": ["médias", "télévision"], "signWords": ["actualité"]},
                {"textFr": "Cette publicité est partout.", "textLsf": "CETTE PUBLICITÉ PARTOUT", "difficulty": 1, "tags": ["médias"], "signWords": ["publicité"]},
                {"textFr": "Je m'abonne à cette chaîne.", "textLsf": "MOI CETTE CHAÎNE S'ABONNER", "difficulty": 2, "tags": ["médias", "streaming"], "signWords": ["chaîne", "abonné"]},
                {"textFr": "Le streaming remplace la télévision.", "textLsf": "STREAMING TÉLÉVISION REMPLACER", "difficulty": 2, "tags": ["médias"], "signWords": ["streaming", "télévision"]},
                {"textFr": "Les réseaux sociaux influencent l'opinion.", "textLsf": "RÉSEAU SOCIAL OPINION INFLUENCER", "difficulty": 3, "tags": ["médias", "réseaux sociaux"], "signWords": ["réseau social"]},
            ]
        }]
    },
]

# Ajouter les nouveaux modules
for nm in new_modules:
    data.append(nm)
    n = sum(len(l["phrases"]) for l in nm["lessons"])
    print(f"  ++ Nouveau module '{nm['module']['title']}': {n} phrases")

with open(PATH, 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Bilan final
with open(PATH) as f:
    data = json.load(f)
total = sum(len(l['phrases']) for m in data for l in m['lessons'])
print(f"\n{'─'*50}")
print(f"  {len(data)} modules | {total} phrases au total")
for m in data:
    n = sum(len(l['phrases']) for l in m['lessons'])
    print(f"  {m['module']['title']}: {n}")
