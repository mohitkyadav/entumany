import {Language} from 'types/db';
import {LanguageFlags} from './constants';

export const getLangFlagsString = (languages: Language[]) => {
  const flagList = languages.map((lang) => LanguageFlags[lang]);
  return flagList.join(' ');
};

/**
 * The app-wide answer normaliser: lowercase, strip accents (NFD combining
 * marks), drop punctuation that shouldn't decide correctness, and collapse
 * whitespace. Every mode that grades typed answers compares through this.
 */
export const normalizeText = (value = ''): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.?!,:;'"’«»]/g, '')
    .trim()
    .replace(/\s+/g, ' ');

export const psudeoInteligentTranslationVerify = (realTranslation = '', providedTranslation = '') => {
  return normalizeText(realTranslation) === normalizeText(providedTranslation);
};
