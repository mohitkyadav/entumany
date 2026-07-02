import {Language, Word} from 'types/db';
import {EntumanyDB} from './db.service';
import {selectByMastery} from './progress.service';

/** Round size for the dictionary games (Play and Match). */
export const WORDS_PER_ROUND = 10;

export const WORD_GAME_IDS = {
  match: 'core.match',
  play: 'core.play',
};

/**
 * Progress-store id for a dictionary word set. Namespaced so dictionary items
 * can never collide with pack/article question ids in the shared store.
 */
export const wordItemId = (wordId: string): string => `word.${wordId}`;

export const getAllGameWords = (words: Record<string, any>): Word[] =>
  Object.keys(words)
    .map((wordId) => ({...words[wordId], wordId}))
    // A playable word set needs at least a pair of languages; editing can
    // leave single-language entries behind.
    .filter((word) => Object.keys(word).length >= 3);

/**
 * Picks a round of words for the dictionary games through the unified
 * progress engine: unseen words first, then weak ones, then mastered review.
 */
export const pickGameWords = (words: Record<string, any>): Word[] => {
  const all = getAllGameWords(words);
  return selectByMastery(all, Math.min(WORDS_PER_ROUND, all.length), (word) => wordItemId(word.wordId));
};

/**
 * The languages a word is quizzed in, ordered by the user's language settings
 * (primary first, secondary next) instead of by object-key insertion order.
 * Falls back to the entry's own language order for words that don't include
 * the configured languages.
 */
export const getWordGameLanguages = (word: Word): [Language, Language] => {
  const langs = Object.keys(word).filter((key) => key !== 'wordId') as Language[];
  const {primaryLanguage, secondaryLanguage} = EntumanyDB.getInstance().appOptions;

  const preferred = [primaryLanguage, secondaryLanguage].filter(
    (lang, i, arr) => arr.indexOf(lang) === i && langs.includes(lang),
  );
  const ordered = [...preferred, ...langs.filter((lang) => !preferred.includes(lang))];

  return [ordered[0], ordered[1]];
};
