export enum Language {
  HINDI = 'hi',
  ENGLISH = 'en',
  GERMAN = 'de',
  FRENCH = 'fr',
  SPANISH = 'es',
  ITALIAN = 'it',
  JAPANESE = 'jp',
}

export const LanguageNames = {
  [Language.HINDI]: 'Hindi',
  [Language.ENGLISH]: 'English',
  [Language.GERMAN]: 'German',
  [Language.FRENCH]: 'French',
  [Language.SPANISH]: 'Spanish',
  [Language.ITALIAN]: 'Italian',
  [Language.JAPANESE]: 'Japanese',
};

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
