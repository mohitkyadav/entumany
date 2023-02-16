export enum Language {
  HINDI = 'hi',
  ENGLISH = 'en',
  GERMAN = 'de',
  FRENCH = 'fr',
  SPANISH = 'es',
  ITALIAN = 'it',
  JAPANESE = 'jp',
}

export type WordEntry = {
  word: string;
  language: Language;
};

export type AppOptions = {
  language1: Language;
  language2: Language;
  perQuestionAllowedTimeInSec: number;
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
