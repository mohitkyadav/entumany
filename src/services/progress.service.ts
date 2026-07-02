import type {QuizQuestion} from 'components/QuizGame/QuizGame';
import {generateUniqueArray} from 'utils/common';
import {recordActivity} from './activity.service';

/** Consecutive correct answers after which an item counts as "mastered". */
export const MASTERY_THRESHOLD = 4;

const STORAGE_KEY = 'quizProgress';

export interface ItemProgress {
  seen: number;
  correct: number;
  incorrect: number;
  streak: number;
  lastSeen: number;
}

export interface GameStats {
  timesPlayed: number;
  bestAccuracy: number;
  bestStreak: number;
  lastPlayed: number;
}

interface ProgressState {
  games: Record<string, GameStats>;
  items: Record<string, ItemProgress>;
}

const nowMs = (): number => new Date().getTime();

const emptyState = (): ProgressState => ({games: {}, items: {}});

const load = (): ProgressState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {games: parsed.games ?? {}, items: parsed.items ?? {}};
  } catch {
    return emptyState();
  }
};

const save = (state: ProgressState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const recordAnswer = (questionId: string | undefined, isCorrect: boolean): void => {
  if (!questionId) return;
  const state = load();
  const prev = state.items[questionId] ?? {correct: 0, incorrect: 0, lastSeen: 0, seen: 0, streak: 0};

  state.items[questionId] = {
    correct: prev.correct + (isCorrect ? 1 : 0),
    incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    lastSeen: nowMs(),
    seen: prev.seen + 1,
    streak: isCorrect ? prev.streak + 1 : 0,
  };
  save(state);
  recordActivity();
};

export const recordGame = (gameId: string, accuracy: number, bestStreak: number): void => {
  const state = load();
  const prev = state.games[gameId] ?? {bestAccuracy: 0, bestStreak: 0, lastPlayed: 0, timesPlayed: 0};

  state.games[gameId] = {
    bestAccuracy: Math.max(prev.bestAccuracy, accuracy),
    bestStreak: Math.max(prev.bestStreak, bestStreak),
    lastPlayed: nowMs(),
    timesPlayed: prev.timesPlayed + 1,
  };
  save(state);
};

export const getGameStats = (gameId: string): GameStats | undefined => load().games[gameId];

const isMastered = (item?: ItemProgress): boolean => !!item && item.streak >= MASTERY_THRESHOLD;

/** Returns mastered / total counts for a set of question ids. */
export const getMasteryForIds = (ids: string[]): {mastered: number; total: number} => {
  const {items} = load();
  const mastered = ids.reduce((acc, id) => acc + (isMastered(items[id]) ? 1 : 0), 0);
  return {mastered, total: ids.length};
};

const DAY_MS = 864e5;

/**
 * Days until a mastered item comes back for a refresher. Grows with the answer
 * streak (Leitner-style), so well-known items return less and less often.
 */
const reviewIntervalDays = (streak: number): number => {
  if (streak >= 7) return 30;
  if (streak === 6) return 14;
  if (streak === 5) return 7;
  return 3; // streak === MASTERY_THRESHOLD
};

/** A mastered item whose review interval has elapsed since it was last seen. */
export const isDueForReview = (item?: ItemProgress): boolean =>
  !!item && item.streak >= MASTERY_THRESHOLD && nowMs() >= item.lastSeen + reviewIntervalDays(item.streak) * DAY_MS;

/** Ids from `ids` that are due for a refresher — for composing review sessions. */
export const getDueReviewIds = (ids: string[]): string[] => {
  const {items} = load();
  return ids.filter((id) => isDueForReview(items[id]));
};

type BucketFn = (item: ItemProgress | undefined) => number;

// Regular game rounds: coverage first (unseen → weak), then due refreshers,
// then well-known items as filler.
const gameBucket: BucketFn = (item) => {
  if (!item || item.seen === 0) return 0; // unseen
  if (item.streak < MASTERY_THRESHOLD) return 1; // weak
  return isDueForReview(item) ? 2 : 3; // due for review, then fresh mastered
};

// Daily review sessions: keep learned material alive first (due → weak),
// then new items, then filler.
const reviewBucket: BucketFn = (item) => {
  if (isDueForReview(item)) return 0;
  if (item && item.seen > 0 && item.streak < MASTERY_THRESHOLD) return 1; // weak
  if (!item || item.seen === 0) return 2; // unseen
  return 3; // fresh mastered
};

const selectByBuckets = <T>(
  pool: T[],
  count: number,
  getId: (item: T) => string | undefined,
  bucketOf: BucketFn,
): T[] => {
  const {items} = load();

  // Shuffle first so items in the same priority bucket appear in random order.
  const shuffleOrder = generateUniqueArray(pool.length);
  const shuffled = shuffleOrder.map((i) => pool[i]);

  const prioritised = shuffled
    .map((entry, idx) => {
      const id = getId(entry);
      return {bucket: bucketOf(id ? items[id] : undefined), entry, idx};
    })
    .sort((a, b) => (a.bucket !== b.bucket ? a.bucket - b.bucket : a.idx - b.idx))
    .map(({entry}) => entry);

  const selected = prioritised.slice(0, Math.min(count, prioritised.length));

  // Shuffle the chosen subset so order within the round isn't predictable.
  const finalOrder = generateUniqueArray(selected.length);
  return finalOrder.map((i) => selected[i]);
};

/**
 * Picks `count` items for a regular game round: unseen items first, then weak
 * (unmastered) ones, then mastered items due for a refresher, then the rest.
 * Ties are randomised; the final selection is shuffled so the hardest items
 * aren't always shown first. Works for anything with a stable id — quiz
 * questions, dictionary words, cards.
 */
export const selectByMastery = <T>(pool: T[], count: number, getId: (item: T) => string | undefined): T[] =>
  selectByBuckets(pool, count, getId, gameBucket);

/**
 * Picks `count` items for a daily review session: due refreshers first (so
 * learned material stays learned), then weak items, then new ones.
 */
export const selectDailyReview = <T>(pool: T[], count: number, getId: (item: T) => string | undefined): T[] =>
  selectByBuckets(pool, count, getId, reviewBucket);

export const selectQuestions = (questions: QuizQuestion[], count: number): QuizQuestion[] =>
  selectByMastery(questions, count, (q) => q.id);
