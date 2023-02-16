import {Language} from 'types/db';
import {LanguageFlags} from './constants';

export const getLangFlagsString = (languages: Language[]) => {
  const flagList = languages.map((lang) => LanguageFlags[lang]);
  return flagList.join(' ');
};
