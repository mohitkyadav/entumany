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
}

export type WordIndexKey = `${string}${typeof KEY_DELIMITER}${Language}`;

export type WordEntry = {
  word: string;
  language: Language;
};

type LanguageType = 'app' | 'primary' | 'secondary';
export type LanguageKey = `${LanguageType}Language`;

export type AppOptions = {
  perQuestionAllowedTimeInSec: number;
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
