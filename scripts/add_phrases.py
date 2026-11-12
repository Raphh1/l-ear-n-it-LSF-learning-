#!/usr/bin/env python3
import json

PATH = '/home/raphaelcau/l-ear-n-it-LSF-learning-/lsf-api/Data/seed-phrases.json'

with open(PATH) as f:
    data = json.load(f)

additions = {
    "Sciences et découvertes": [
        {"textFr": "L'astronaute marche sur la lune.", "textLsf": "ASTRONAUTE LUNE ALLER", "difficulty": 1, "tags": ["astronomie", "espace"], "signWords": ["astronaute", "lune"]},
        {"textFr": "Avec un télescope, on peut voir les étoiles.", "textLsf": "TÉLESCOPE ÉTOILE VOIR POUVOIR", "difficulty": 2, "tags": ["astronomie", "espace"], "signWords": ["télescope", "étoile"]},
        {"textFr": "Les planètes tournent autour du soleil.", "textLsf": "PLANÈTE SOLEIL AUTOUR TOURNER", "difficulty": 2, "tags": ["astronomie", "espace"], "signWords": ["planète", "soleil"]},
        {"textFr": "La fusée part vers Mars.", "textLsf": "FUSÉE MARS PARTIR", "difficulty": 1, "tags": ["astronomie", "espace"], "signWords": ["fusée", "Mars"]},
        {"textFr": "L'univers est immense.", "textLsf": "UNIVERS IMMENSE", "difficulty": 1, "tags": ["astronomie", "espace"], "signWords": ["univers"]},
        {"textFr": "Tu as vu la comète hier soir ?", "textLsf": "HIER SOIR COMÈTE TOI VOIR", "difficulty": 2, "tags": ["astronomie", "espace"], "signWords": ["comète"]},
        {"textFr": "Le télescope montre la galaxie.", "textLsf": "TÉLESCOPE GALAXIE MONTRER", "difficulty": 2, "tags": ["astronomie", "espace"], "signWords": ["télescope", "galaxie"]},
        {"textFr": "Jupiter est plus grande que la Terre.", "textLsf": "JUPITER TERRE PLUS GRANDE", "difficulty": 2, "tags": ["astronomie", "espace"], "signWords": ["Jupiter"]},
    ],
    "Les fêtes et célébrations": [
        {"textFr": "Tu es invité à mon anniversaire.", "textLsf": "MOI ANNIVERSAIRE TOI INVITER", "difficulty": 1, "tags": ["fête", "célébration"], "signWords": ["anniversaire", "invitation"]},
        {"textFr": "Ce mariage était magnifique.", "textLsf": "MARIAGE MAGNIFIQUE", "difficulty": 1, "tags": ["fête", "célébration"], "signWords": ["mariage"]},
        {"textFr": "Je t'offre ce cadeau pour te féliciter.", "textLsf": "MOI TOI CADEAU FÉLICITATIONS OFFRIR", "difficulty": 2, "tags": ["fête", "célébration"], "signWords": ["cadeau", "félicitations"]},
        {"textFr": "On se retrouve ici pour fêter ça !", "textLsf": "ICI NOUS FÊTE VENIR", "difficulty": 1, "tags": ["fête", "célébration"], "signWords": ["fête"]},
        {"textFr": "Quelle belle rencontre ce soir !", "textLsf": "SOIR RENCONTRE BELLE", "difficulty": 1, "tags": ["fête", "célébration"], "signWords": ["rencontre"]},
        {"textFr": "Le groupe arrive bientôt.", "textLsf": "GROUPE BIENTÔT ARRIVER", "difficulty": 1, "tags": ["fête", "célébration"], "signWords": ["groupe"]},
        {"textFr": "Je me souviens de cette fête.", "textLsf": "CETTE FÊTE MOI SE SOUVENIR", "difficulty": 2, "tags": ["fête", "célébration"], "signWords": ["fête"]},
    ],
    "Parler de ses émotions": [
        {"textFr": "Je ressens beaucoup d'espoir.", "textLsf": "MOI ESPOIR BEAUCOUP RESSENTIR", "difficulty": 2, "tags": ["émotions"], "signWords": ["espoir"]},
        {"textFr": "Cette situation m'a déçu.", "textLsf": "CETTE SITUATION MOI DÉCEPTION", "difficulty": 2, "tags": ["émotions"], "signWords": ["déception"]},
        {"textFr": "J'ai de l'empathie pour toi.", "textLsf": "TOI MOI EMPATHIE AVOIR", "difficulty": 2, "tags": ["émotions"], "signWords": ["empathie"]},
        {"textFr": "Je suis plein d'enthousiasme pour ce projet.", "textLsf": "CE PROJET MOI ENTHOUSIASME AVOIR", "difficulty": 2, "tags": ["émotions"], "signWords": ["enthousiasme"]},
        {"textFr": "La nostalgie me rend triste parfois.", "textLsf": "NOSTALGIE MOI PARFOIS TRISTE", "difficulty": 2, "tags": ["émotions"], "signWords": ["nostalgie"]},
        {"textFr": "Il ne faut pas perdre espoir.", "textLsf": "ESPOIR PERDRE NE PAS", "difficulty": 2, "tags": ["émotions"], "signWords": ["espoir"]},
        {"textFr": "Je ressens une grande fierté.", "textLsf": "MOI FIERTÉ GRANDE RESSENTIR", "difficulty": 1, "tags": ["émotions"], "signWords": ["fierté"]},
    ],
    "Au travail": [
        {"textFr": "Mon salaire a augmenté ce mois-ci.", "textLsf": "CE MOIS MOI SALAIRE AUGMENTER", "difficulty": 2, "tags": ["travail", "argent"], "signWords": ["salaire"]},
        {"textFr": "Le budget du projet est dépassé.", "textLsf": "PROJET BUDGET DÉPASSER", "difficulty": 2, "tags": ["travail"], "signWords": ["budget"]},
        {"textFr": "Quelle est la date limite ?", "textLsf": "DATE LIMITE QUOI", "difficulty": 1, "tags": ["travail"], "signWords": ["délai"]},
        {"textFr": "Je travaille dans une grande entreprise.", "textLsf": "MOI GRANDE ENTREPRISE TRAVAILLER", "difficulty": 1, "tags": ["travail"], "signWords": ["entreprise"]},
        {"textFr": "Cette réunion a duré trop longtemps.", "textLsf": "CETTE RÉUNION TROP LONGTEMPS", "difficulty": 2, "tags": ["travail"], "signWords": ["réunion"]},
        {"textFr": "J'ai obtenu mon diplôme l'année dernière.", "textLsf": "ANNÉE DERNIÈRE MOI DIPLÔME AVOIR", "difficulty": 2, "tags": ["travail", "études"], "signWords": ["diplôme"]},
        {"textFr": "On cherche un collègue pour ce poste.", "textLsf": "CE POSTE COLLÈGUE CHERCHER", "difficulty": 2, "tags": ["travail"], "signWords": ["collègue"]},
    ],
    "Les achats et la mode": [
        {"textFr": "J'aime le parfum de cette crème.", "textLsf": "CETTE CRÈME PARFUM MOI AIMER", "difficulty": 2, "tags": ["mode", "beauté"], "signWords": ["parfum", "crème"]},
        {"textFr": "Tu mets du maquillage aujourd'hui ?", "textLsf": "AUJOURD'HUI TOI MAQUILLAGE METTRE", "difficulty": 1, "tags": ["mode", "beauté"], "signWords": ["maquillage"]},
        {"textFr": "Je préfère la couleur bordeaux.", "textLsf": "MOI BORDEAUX COULEUR PRÉFÉRER", "difficulty": 1, "tags": ["mode", "couleurs"], "signWords": ["bordeaux"]},
        {"textFr": "Ce magasin a des articles de qualité.", "textLsf": "CE MAGASIN ARTICLE BONNE QUALITÉ AVOIR", "difficulty": 2, "tags": ["achats"], "signWords": ["article"]},
        {"textFr": "J'achète souvent en ligne.", "textLsf": "MOI SOUVENT ACHETER EN LIGNE", "difficulty": 1, "tags": ["achats"], "signWords": ["acheter"]},
        {"textFr": "Le prix a baissé.", "textLsf": "PRIX BAISSER", "difficulty": 1, "tags": ["achats", "argent"], "signWords": ["prix"]},
        {"textFr": "Tu as une carte bancaire ?", "textLsf": "TOI CARTE BANCAIRE AVOIR", "difficulty": 1, "tags": ["achats", "argent"], "signWords": ["carte bancaire"]},
        {"textFr": "Ces chaussures sont en promotion.", "textLsf": "CES CHAUSSURES PROMOTION ÊTRE", "difficulty": 2, "tags": ["mode", "achats"], "signWords": ["réduction"]},
    ],
    "La santé et le médecin": [
        {"textFr": "J'ai mal au genou depuis hier.", "textLsf": "HIER DEPUIS MOI GENOU MAL AVOIR", "difficulty": 2, "tags": ["santé", "corps"], "signWords": ["genou"]},
        {"textFr": "Mon épaule est blessée.", "textLsf": "MOI ÉPAULE BLESSÉE", "difficulty": 1, "tags": ["santé", "corps"], "signWords": ["épaule"]},
        {"textFr": "Le médecin examine mon estomac.", "textLsf": "MÉDECIN MOI ESTOMAC EXAMINER", "difficulty": 2, "tags": ["santé", "médecin"], "signWords": ["estomac"]},
        {"textFr": "J'ai un problème au poumon.", "textLsf": "MOI POUMON PROBLÈME AVOIR", "difficulty": 2, "tags": ["santé", "corps"], "signWords": ["poumon"]},
        {"textFr": "Je souffre d'anxiété.", "textLsf": "MOI ANXIÉTÉ SOUFFRIR", "difficulty": 1, "tags": ["santé mentale"], "signWords": ["anxiété"]},
        {"textFr": "La thérapie m'a beaucoup aidé.", "textLsf": "THÉRAPIE MOI BEAUCOUP AIDER", "difficulty": 2, "tags": ["santé mentale"], "signWords": ["thérapie"]},
        {"textFr": "J'ai rendez-vous chez le médecin demain.", "textLsf": "DEMAIN MÉDECIN RENDEZ-VOUS MOI AVOIR", "difficulty": 2, "tags": ["santé", "médecin"], "signWords": ["rendez-vous"]},
    ],
    "Les transports": [
        {"textFr": "Le prochain bus passe dans dix minutes.", "textLsf": "DIX MINUTES BUS PROCHAIN PASSER", "difficulty": 2, "tags": ["transports"], "signWords": ["bus"]},
        {"textFr": "Je préfère le vélo pour aller au travail.", "textLsf": "MOI TRAVAIL ALLER VÉLO PRÉFÉRER", "difficulty": 2, "tags": ["transports"], "signWords": ["vélo"]},
        {"textFr": "L'avion décolle à 14h.", "textLsf": "AVION 14H DÉCOLLER", "difficulty": 1, "tags": ["transports"], "signWords": ["avion"]},
        {"textFr": "Il y a beaucoup de trafic ce matin.", "textLsf": "MATIN TRAFIC BEAUCOUP AVOIR", "difficulty": 2, "tags": ["transports"], "signWords": ["trafic"]},
        {"textFr": "Le taxi arrive dans cinq minutes.", "textLsf": "CINQ MINUTES TAXI ARRIVER", "difficulty": 1, "tags": ["transports"], "signWords": ["taxi"]},
        {"textFr": "Je prends le métro tous les jours.", "textLsf": "MOI CHAQUE JOUR MÉTRO PRENDRE", "difficulty": 2, "tags": ["transports"], "signWords": ["métro"]},
        {"textFr": "La voiture est en panne.", "textLsf": "VOITURE PANNE AVOIR", "difficulty": 1, "tags": ["transports"], "signWords": ["voiture"]},
    ],
    "Parler du passé": [
        {"textFr": "Avant, j'aimais beaucoup le sport.", "textLsf": "AVANT MOI SPORT BEAUCOUP AIMER", "difficulty": 2, "tags": ["passé", "souvenirs"], "signWords": ["avant", "sport"]},
        {"textFr": "Je me souviens de mon premier jour à l'école.", "textLsf": "ÉCOLE PREMIER JOUR MOI SE SOUVENIR", "difficulty": 2, "tags": ["passé", "souvenirs"], "signWords": ["école", "se souvenir"]},
        {"textFr": "Il y a longtemps, la vie était plus simple.", "textLsf": "AVANT LONGTEMPS VIE PLUS SIMPLE", "difficulty": 2, "tags": ["passé"], "signWords": ["avant"]},
        {"textFr": "J'ai appris la LSF il y a deux ans.", "textLsf": "DEUX ANS AVANT MOI LSF APPRENDRE", "difficulty": 2, "tags": ["passé", "LSF"], "signWords": ["LSF", "apprendre"]},
        {"textFr": "Ce moment était inoubliable.", "textLsf": "CE MOMENT INOUBLIABLE", "difficulty": 1, "tags": ["passé", "souvenirs"], "signWords": ["moment"]},
        {"textFr": "Avant, je ne comprenais pas la LSF.", "textLsf": "AVANT MOI LSF COMPRENDRE PAS", "difficulty": 2, "tags": ["passé", "LSF"], "signWords": ["LSF", "comprendre"]},
        {"textFr": "Ma vie a beaucoup changé depuis.", "textLsf": "MOI VIE DEPUIS BEAUCOUP CHANGER", "difficulty": 2, "tags": ["passé"], "signWords": ["vie", "changer"]},
    ],
}

for module in data:
    title = module["module"]["title"]
    if title in additions:
        new_phrases = additions[title]
        last_lesson = module["lessons"][-1]
        module["lessons"].append({
            "title": f"{title} — leçon 2",
            "description": last_lesson["description"],
            "sortOrder": last_lesson["sortOrder"] + 1,
            "xpReward": last_lesson["xpReward"] + 5,
            "phrases": new_phrases,
        })
        print(f"  + {title}: +{len(new_phrases)} phrases")

with open(PATH, 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Vérif finale
with open(PATH) as f:
    data = json.load(f)
total = sum(len(l['phrases']) for m in data for l in m['lessons'])
print(f"\nTotal: {total} phrases")
for m in data:
    n = sum(len(l['phrases']) for l in m['lessons'])
    print(f"  {m['module']['title']}: {n}")
