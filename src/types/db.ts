import {KEY_DELIMITER} from 'utils/constants';

export enum Language {
  HINDI = 'hi',
  ENGLISH = 'en',
  GERMAN = 'de',
  FRENCH = 'fr',
  SPANISH = 'es',
  ITALIAN = 'it',
  JAPANESE = 'ja',
  RUSSIAN = 'ru',
  POLISH = 'pl',
  PORTUGUESE = 'pt',
}

export type WordIndexKey = `${string}${typeof KEY_DELIMITER}${Language}`;

export type WordEntry = {
  word: string;
  language: Language;
};

type LanguageType = 'app' | 'primary' | 'secondary';
export type LanguageKey = `${LanguageType}Language`;

export type AppOptions = {
  /** Max word pairs shown per matching-game round. */
  matchWordsPerRound: number;
  perQuestionAllowedTimeInSec: number;
  /** Speech-synthesis rate for word audio; 1 is normal speed. */
  speechRate: number;
} & {
  [key in LanguageKey]: Language;
};

export type GameState = {
  words: WordEntry[];
};

export type GameAnswer = {
  destLang: Language;
  inputValue: string;
  srcLang: Language;
  wordId: string;
  wasCorrectlyAnswered: boolean;
};

export type Word = {
  [key in Language]: string;
} & {
  wordId: string;
};

export type WordListItem = {
  id: string;
  word: string;
  lang: Language;
};
