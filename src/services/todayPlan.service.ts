/**
 * Composes and tracks the daily 30-minute Portuguese session ("Today").
 *
 * A plan is created once per local day and stores *baselines* — the trainers'
 * own counters at plan creation — so step completion can be derived from the
 * counters the vocab/conjugation trainers already persist, without those
 * trainers knowing anything about the session.
 */

import type {QuizQuestion} from 'components/QuizGame/QuizGame';
import {PORTUGUESE_PACKS} from 'data/packs/ptPacks';
import {CONJ_STORAGE_KEY} from 'data/pt/conjugation';
import {BUILTIN, Card, CardState, NewLog, VOCAB_STORAGE_KEY, VocabSettings, dueKeys, newAvail} from 'data/pt/srs';
import {ymd} from './activity.service';
import {selectDailyReview} from './progress.service';

const STORAGE_KEY = 'pt-today:v1';

/** Vocab reviews are capped so a due-pile after a break stays ~30min total. */
const VOCAB_TARGET_CAP = 20;
export const CONJ_TARGET = 10;
export const QUIZ_TARGET = 10;

export const TODAY_QUIZ_GAME_ID = 'pt.today.quiz';

export interface TodayPlan {
  date: string;
  vocabBase: number;
  vocabTarget: number;
  conjBase: number;
  quizDone: boolean;
}

export interface TodayStep {
  done: boolean;
  progress: number;
  target: number;
}

export interface TodayStatus {
  vocab: TodayStep & {due: number; newCards: number};
  conj: TodayStep;
  quiz: TodayStep;
  doneCount: number;
  total: number;
}

interface StoredVocab {
  cards?: Record<string, CardState>;
  custom?: Card[];
  newLog?: NewLog;
  settings?: VocabSettings;
  totalReviews?: number;
}

interface StoredConj {
  seen?: number;
}

const DEFAULT_VOCAB_SETTINGS: VocabSettings = {dir: 'recognise', goalMin: 20, mode: 'flip', newPerDay: 12};

const readJson = <T>(key: string): T => {
  try {
    return (JSON.parse(localStorage.getItem(key) ?? '{}') ?? {}) as T;
  } catch {
    return {} as T;
  }
};

const readVocab = () => {
  const raw = readJson<StoredVocab>(VOCAB_STORAGE_KEY);
  const cards = raw.cards ?? {};
  const keys = BUILTIN.concat(raw.custom ?? []).map((c) => c.pt);
  return {
    due: dueKeys(cards, keys).length,
    newCards: newAvail(raw.settings ?? DEFAULT_VOCAB_SETTINGS, raw.newLog ?? {count: 0, date: ''}),
    totalReviews: raw.totalReviews ?? 0,
  };
};

const readConjSeen = (): number => readJson<StoredConj>(CONJ_STORAGE_KEY).seen ?? 0;

const savePlan = (plan: TodayPlan): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
};

/** Today's plan — created (or rolled over) on first access each local day. */
export const getTodayPlan = (): TodayPlan => {
  const today = ymd(new Date());
  const stored = readJson<Partial<TodayPlan>>(STORAGE_KEY);
  if (stored.date === today && typeof stored.vocabBase === 'number') return stored as TodayPlan;

  const vocab = readVocab();
  const plan: TodayPlan = {
    conjBase: readConjSeen(),
    date: today,
    quizDone: false,
    vocabBase: vocab.totalReviews,
    vocabTarget: Math.min(vocab.due + vocab.newCards, VOCAB_TARGET_CAP),
  };
  savePlan(plan);
  return plan;
};

export const markTodayQuizDone = (): void => {
  savePlan({...getTodayPlan(), quizDone: true});
};

/** Live step completion, derived from the trainers' own persisted counters. */
export const getTodayStatus = (): TodayStatus => {
  const plan = getTodayPlan();
  const vocab = readVocab();

  const vocabProgress = Math.max(0, vocab.totalReviews - plan.vocabBase);
  const conjProgress = Math.max(0, readConjSeen() - plan.conjBase);

  const steps = {
    conj: {done: conjProgress >= CONJ_TARGET, progress: Math.min(conjProgress, CONJ_TARGET), target: CONJ_TARGET},
    quiz: {done: plan.quizDone, progress: plan.quizDone ? QUIZ_TARGET : 0, target: QUIZ_TARGET},
    vocab: {
      done: plan.vocabTarget === 0 || vocabProgress >= plan.vocabTarget,
      due: vocab.due,
      newCards: vocab.newCards,
      progress: Math.min(vocabProgress, plan.vocabTarget),
      target: plan.vocabTarget,
    },
  };

  const doneCount = [steps.vocab.done, steps.conj.done, steps.quiz.done].filter(Boolean).length;
  return {...steps, doneCount, total: 3};
};

/** The combined question pool of every Portuguese pack game. */
export const getAllPackQuestions = (): QuizQuestion[] =>
  PORTUGUESE_PACKS.flatMap((pack) => pack.games.flatMap((game) => game.buildQuestions()));

/** Round selector for today's quiz: due refreshers first, then weak, then new. */
export const selectTodayQuizQuestions = (questions: QuizQuestion[], count: number): QuizQuestion[] =>
  selectDailyReview(questions, count, (q) => q.id);
