import { describe, it, expect } from 'vitest';
import { checkOrder, type OrderSign } from '@/lib/lsfOrder';

const s = (word: string, slug = word): OrderSign => ({ id: slug, word, slug });

const HIER = s('hier');
const SOIR = s('soir');
const MOI = s('moi');
const TOI = s('toi');
const NOM = s('nom');
const QUOI = s('quoi');
const CINEMA = s('cinéma');
const ALLER = s('aller');

describe('checkOrder', () => {
  it("accepte l'ordre de référence comme exact", () => {
    expect(checkOrder([HIER, MOI, CINEMA, ALLER], [HIER, MOI, CINEMA, ALLER]).status).toBe('exact');
  });

  it('accepte un autre ordre qui garde le temps en tête', () => {
    expect(checkOrder([HIER, CINEMA, MOI, ALLER], [HIER, MOI, CINEMA, ALLER]).status).toBe('valid');
  });

  it("accepte les repères de temps dans n'importe quel ordre entre eux", () => {
    expect(checkOrder([SOIR, HIER, MOI, ALLER], [HIER, SOIR, MOI, ALLER]).status).toBe('valid');
  });

  it("refuse un repère de temps qui n'est pas en tête", () => {
    expect(checkOrder([MOI, HIER, CINEMA, ALLER], [HIER, MOI, CINEMA, ALLER])).toEqual({ status: 'wrong', broken: ['time'] });
  });

  it("refuse un mot interrogatif qui n'est pas à la fin", () => {
    expect(checkOrder([TOI, QUOI, NOM], [TOI, NOM, QUOI])).toEqual({ status: 'wrong', broken: ['question'] });
  });

  it('signale les deux règles cassées', () => {
    expect(checkOrder([QUOI, HIER, TOI], [HIER, TOI, QUOI]).broken).toEqual(['time', 'question']);
  });

  it("n'applique pas une règle que la référence ne respecte pas elle-même", () => {
    expect(checkOrder([HIER, MOI, ALLER], [MOI, HIER, ALLER]).status).toBe('valid');
  });

  it('ne prend pas la planète Mars pour un repère de temps', () => {
    const MARS = s('mars', 'mars-planete');
    const FUSEE = s('fusée');
    expect(checkOrder([MARS, FUSEE], [FUSEE, MARS]).status).toBe('valid');
  });

  it('refuse une phrase incomplète', () => {
    expect(checkOrder([MOI, ALLER], [MOI, CINEMA, ALLER]).status).toBe('wrong');
  });
});
