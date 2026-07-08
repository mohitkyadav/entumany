import {Language, Word} from 'types/db';

import commonWordsData from './commonWords.json';
import foodWordsData from './foodWords.json';

export interface WordPackPair {
  pt: string;
  en: string;
}

export interface WordPack {
  /** Stable id, used as the route segment and progress-id namespace, e.g. 'food'. */
  id: string;
  nameKey: string;
  descKey: string;
  flag: string;
  pairs: WordPackPair[];
}

export const WORD_PACKS: WordPack[] = [
  {
    descKey: 'foodPackDesc',
    flag: '🍽️',
    id: 'food',
    nameKey: 'foodPackName',
    pairs: foodWordsData as WordPackPair[],
  },
  {
    descKey: 'commonPackDesc',
    flag: '📚',
    id: 'common',
    nameKey: 'commonPackName',
    pairs: commonWordsData as WordPackPair[],
  },
];

export const findWordPack = (id?: string): WordPack | undefined => WORD_PACKS.find((pack) => pack.id === id);

/** Route to a pack's matching game, e.g. '/pt/match/food'. */
export const matchPackPath = (packId: string): string => `/pt/match/${packId}`;

/** Game-stats id for a pack's matching game (distinct from the dictionary `core.match`). */
export const packMatchGameId = (packId: string): string => `pt.match.${packId}`;

/**
 * Progress-store id for one word in a pack. Namespaced under `ptword.` so it can
 * never collide with dictionary words (`word.*`) or pack quiz questions.
 */
export const packWordItemId = (wordId: string): string => `ptword.${wordId}`;

/**
 * Turns a pack's PT/EN pairs into the `Word` shape the matching game consumes.
 * Each word gets a stable id (`<packId>-<index>`) so its mastery persists across
 * rounds. Only the two languages present are set; the game reads just those.
 */
export const buildPackWords = (pack: WordPack): Word[] =>
  pack.pairs.map(
    (pair, i) =>
      ({
        [Language.ENGLISH]: pair.en,
        [Language.PORTUGUESE]: pair.pt,
        wordId: `${pack.id}-${i}`,
      } as unknown as Word),
  );
