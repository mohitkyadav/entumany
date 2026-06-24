import {Language} from 'types/db';

export const ROUTES = {
  ARTICLE_GAME: '/articles',
  DASHBOARD: '/',
  EDITOR: '/new',
  GERMAN_HUB: '/de',
  MATCHING_GAME: '/match',
  PLAYGROUND: '/play',
  PORTUGUESE_CONJUGATION: '/pt/conjugation',
  PORTUGUESE_GAME: '/pt/:packId/:gameId',
  PORTUGUESE_HUB: '/pt',
  PORTUGUESE_PACK: '/pt/:packId',
  PORTUGUESE_VOCAB: '/pt/vocab',
  SETTINGS: '/settings',
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
  [Language.RUSSIAN]: 'Russian',
  [Language.POLISH]: 'Polish',
  [Language.PORTUGUESE]: 'Portuguese',
};

export const LanguageFlags = {
  [Language.HINDI]: '🇮🇳',
  [Language.ENGLISH]: '🇬🇧',
  [Language.GERMAN]: '🇩🇪',
  [Language.FRENCH]: '🇫🇷',
  [Language.SPANISH]: '🇪🇸',
  [Language.ITALIAN]: '🇮🇹',
  [Language.JAPANESE]: '🇯🇵',
  [Language.RUSSIAN]: '🇷🇺',
  [Language.POLISH]: '🇵🇱',
  [Language.PORTUGUESE]: '🇵🇹',
};
