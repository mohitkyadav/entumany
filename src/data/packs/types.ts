import type {QuizQuestion} from 'components/QuizGame/QuizGame';

export type GameMode = 'contractions' | 'gender' | 'serEstar';

export interface PackGame {
  /** Stable id, also used as the route segment and progress key, e.g. 'pt.basics.gender'. */
  id: string;
  mode: GameMode;
  titleKey: string;
  descKey: string;
  flag?: string;
  promptVariant?: 'word' | 'sentence';
  buildQuestions: () => QuizQuestion[];
}

export interface LanguagePack {
  /** Stable id, used as the route segment, e.g. 'pt-basics'. */
  id: string;
  nameKey: string;
  descKey: string;
  flag?: string;
  games: PackGame[];
}
