import {createRegExp, char} from 'magic-regexp';
import {Language} from 'types/db';
import {LanguageFlags} from './constants';

export const getLangFlagsString = (languages: Language[]) => {
  const flagList = languages.map((lang) => LanguageFlags[lang]);
  return flagList.join(' ');
};

export const sanitiseTranslation = (value = '') => {
  const notImportantCharRegex = createRegExp(
    char.or('.').or(',').or("'").or('?').or(':').or('/').or('"').or('$').or('!'),
    ['g'],
  );

  const saneValue = value.trim().toLowerCase();
  saneValue.replaceAll(notImportantCharRegex, '');

  return saneValue;
};

export const psudeoInteligentTranslationVerify = (realTranslation = '', providedTranslation = '') => {
  // sanitise values
  const saneRealTranslation = sanitiseTranslation(realTranslation);
  const saneProvidedTranslation = sanitiseTranslation(providedTranslation);

  return saneRealTranslation === saneProvidedTranslation;
};
