import type {QuizQuestion} from 'components/QuizGame/QuizGame';
import {generateUniqueArray} from 'utils/common';

/** Consecutive correct answers after which an item counts as "mastered". */
export const MASTERY_THRESHOLD = 2;

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

/**
 * Picks `count` questions, prioritising what the learner most needs to practise:
 * unseen items first, then weak (unmastered) ones, then a light review of mastered
 * ones. Ties are randomised; the final selection is shuffled so the hardest items
 * aren't always shown first.
 */
export const selectQuestions = (questions: QuizQuestion[], count: number): QuizQuestion[] => {
  const {items} = load();

  // Shuffle first so questions in the same priority bucket appear in random order.
  const shuffleOrder = generateUniqueArray(questions.length);
  const shuffled = shuffleOrder.map((i) => questions[i]);

  const bucketOf = (q: QuizQuestion): number => {
    const item = q.id ? items[q.id] : undefined;
    if (!item || item.seen === 0) return 0; // unseen
    if (item.streak < MASTERY_THRESHOLD) return 1; // weak
    return 2; // mastered
  };

  const prioritised = shuffled
    .map((q, idx) => ({bucket: bucketOf(q), idx, q}))
    .sort((a, b) => (a.bucket !== b.bucket ? a.bucket - b.bucket : a.idx - b.idx))
    .map((entry) => entry.q);

  const selected = prioritised.slice(0, Math.min(count, prioritised.length));

  // Shuffle the chosen subset so order within the round isn't predictable.
  const finalOrder = generateUniqueArray(selected.length);
  return finalOrder.map((i) => selected[i]);
};
