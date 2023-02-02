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
