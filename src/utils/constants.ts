import {Language} from 'types/db';

export const ROUTES = {
  DASHBOARD: '/',
  EDITOR: '/new',
  PLAYGROUND: '/play',
  WORD_LIST: '/list',
};

export const MIN_WORDS_REQUIRED = 5;
export const KEY_DELIMITER = '|||';

export const LanguageNames = {
  [Language.HINDI]: 'Hindi',
  [Language.ENGLISH]: 'English',
  [Language.GERMAN]: 'German',
  [Language.FRENCH]: 'French',
  [Language.SPANISH]: 'Spanish',
  [Language.ITALIAN]: 'Italian',
  [Language.JAPANESE]: 'Japanese',
};

export const LanguageFlags = {
  [Language.HINDI]: '🇮🇳',
  [Language.ENGLISH]: '🇬🇧',
  [Language.GERMAN]: '🇩🇪',
  [Language.FRENCH]: '🇫🇷',
  [Language.SPANISH]: '🇪🇸',
  [Language.ITALIAN]: '🇮🇹',
  [Language.JAPANESE]: '🇯🇵',
};
