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

  return value.trim().replaceAll(notImportantCharRegex, '');
};

export const psudeoInteligentTranslationVerify = (providedTranslation = '', realTranslation = '') => {
  console.log(providedTranslation, realTranslation);
  // sanitise values
  const saneProvidedTranslation = sanitiseTranslation(providedTranslation.toLowerCase());
  const saneRealTranslation = sanitiseTranslation(realTranslation.toLowerCase());

  return saneProvidedTranslation === saneRealTranslation;
};
