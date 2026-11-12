// Vérification souple de l'ordre des signes en LSF.
// L'ordre en LSF est flexible : on ne sanctionne que les règles fiables
// (repère de temps en tête, mot interrogatif en fin de phrase).
// Une règle n'est appliquée que si l'ordre de référence la respecte lui-même.

export interface OrderSign {
  id: string;
  word: string;
  slug: string;
}

export type OrderRule = 'time' | 'question';

export interface OrderCheck {
  status: 'exact' | 'valid' | 'wrong';
  broken: OrderRule[];
}

const TIME_WORDS = new Set([
  'hier', 'avant-hier', 'demain', 'après-demain', "aujourd'hui", 'maintenant', 'bientôt', "tout à l'heure",
  'matin', 'midi', 'après-midi', 'soir', 'nuit', 'semaine', 'mois', 'année', 'an', 'week-end',
  'prochain', 'prochaine', 'dernier', 'dernière', 'passé', 'futur',
  'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août',
  'septembre', 'octobre', 'novembre', 'décembre',
  'printemps', 'été', 'automne', 'hiver',
]);

const QUESTION_WORDS = new Set(['quoi', 'qui', 'où', 'comment', 'pourquoi', 'quand', 'combien', 'quel', 'quelle']);

export const RULE_HINTS: Record<OrderRule, string> = {
  time: 'En LSF, le repère de temps (HIER, DEMAIN, SOIR…) se place en début de phrase.',
  question: 'En LSF, le mot interrogatif (QUOI, OÙ, COMMENT…) se place en fin de phrase.',
};

// « mars » le mois est un repère de temps, pas la planète (signe distinct)
export function isTimeSign(s: OrderSign): boolean {
  return TIME_WORDS.has(s.word.toLowerCase()) && !s.slug.includes('planete');
}

export function isQuestionSign(s: OrderSign): boolean {
  return QUESTION_WORDS.has(s.word.toLowerCase());
}

// Les signes concernés forment-ils exactement le début (ou la fin) de la phrase ?
function formsPrefix(signs: OrderSign[], test: (s: OrderSign) => boolean): boolean {
  const n = signs.filter(test).length;
  return n > 0 && signs.slice(0, n).every(test);
}

function formsSuffix(signs: OrderSign[], test: (s: OrderSign) => boolean): boolean {
  const n = signs.filter(test).length;
  return n > 0 && signs.slice(signs.length - n).every(test);
}

export function checkOrder(built: OrderSign[], reference: OrderSign[]): OrderCheck {
  const sameSigns =
    built.length === reference.length &&
    [...built.map((s) => s.id)].sort().join() === [...reference.map((s) => s.id)].sort().join();
  if (!sameSigns) return { status: 'wrong', broken: [] };

  if (built.every((s, i) => s.id === reference[i].id)) return { status: 'exact', broken: [] };

  const broken: OrderRule[] = [];
  if (formsPrefix(reference, isTimeSign) && !formsPrefix(built, isTimeSign)) broken.push('time');
  if (formsSuffix(reference, isQuestionSign) && !formsSuffix(built, isQuestionSign)) broken.push('question');

  return { status: broken.length ? 'wrong' : 'valid', broken };
}
