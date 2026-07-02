import clsx from 'clsx';
import {Check} from 'lucide-react';
import React, {FC, useMemo, useReducer, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {BackButton, Button, PageTitle, QuizGame} from 'components';
import {recordAnswer, recordGame} from 'services/progress.service';
import {
  CONJ_TARGET,
  QUIZ_TARGET,
  TODAY_QUIZ_GAME_ID,
  getAllPackQuestions,
  getTodayStatus,
  markTodayQuizDone,
  selectTodayQuizQuestions,
} from 'services/todayPlan.service';
import {ROUTES} from 'utils/constants';

import style from './TodaySession.module.scss';

/** Rough per-step time estimates, sized so the whole plan is ~30 minutes. */
const estimateMinutes = {conj: 8, quiz: 6, vocab: (target: number) => Math.max(2, Math.round(target * 0.8))};

const TodaySession: FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [view, setView] = useState<'plan' | 'quiz'>('plan');
  // Step completion is derived from the trainers' persisted counters; bump
  // forces a re-read when we return from the embedded quiz.
  const [, bump] = useReducer((n: number) => n + 1, 0);

  const status = getTodayStatus();
  const quizPool = useMemo(getAllPackQuestions, []);

  if (view === 'quiz') {
    return (
      <div className="page animation-scale-up">
        <PageTitle title={t('todayTitle')} />
        <QuizGame
          questions={quizPool}
          wordsPerRound={QUIZ_TARGET}
          onExit={() => {
            setView('plan');
            bump();
          }}
          selectQuestions={selectTodayQuizQuestions}
          onAnswer={recordAnswer}
          onComplete={({accuracy, bestStreak}) => {
            markTodayQuizDone();
            recordGame(TODAY_QUIZ_GAME_ID, accuracy, bestStreak);
          }}
        />
      </div>
    );
  }

  const steps = [
    {
      action: () => navigate(ROUTES.PORTUGUESE_VOCAB),
      desc: t('todayStepVocabDesc', {due: status.vocab.due, new: status.vocab.newCards}),
      key: 'vocab',
      minutes: estimateMinutes.vocab(status.vocab.target),
      step: status.vocab,
      title: t('todayStepVocab'),
    },
    {
      action: () => navigate(ROUTES.PORTUGUESE_CONJUGATION),
      desc: t('todayStepConjDesc', {count: CONJ_TARGET}),
      key: 'conj',
      minutes: estimateMinutes.conj,
      step: status.conj,
      title: t('todayStepConj'),
    },
    {
      action: () => setView('quiz'),
      desc: t('todayStepQuizDesc', {count: QUIZ_TARGET}),
      key: 'quiz',
      minutes: estimateMinutes.quiz,
      step: status.quiz,
      title: t('todayStepQuiz'),
    },
  ];

  const allDone = status.doneCount === status.total;

  return (
    <div className="page animation-scale-up">
      <PageTitle title={t('todayTitle')} />
      <div className={style.Today}>
        <div className={style.Today__header}>
          <BackButton to={ROUTES.PORTUGUESE_HUB} />
          <div>
            <h1 className={style.Today__title}>{t('todayTitle')}</h1>
            <p className={style.Today__subtitle}>
              {t('todayDesc')} · {t('todayStepsLabel', {done: status.doneCount, total: status.total})}
            </p>
          </div>
        </div>

        {allDone ? (
          <div className={clsx(style.Today__celebration, 'animation-scale-up')}>
            <h2>{t('todayAllDone')}</h2>
            <p>{t('todayAllDoneDesc')}</p>
          </div>
        ) : (
          <div className={style.Today__steps}>
            {steps.map(({action, desc, key, minutes, step, title}, idx) => (
              <div key={key} className={clsx(style.Today__card, step.done && style['Today__card--done'])}>
                <span className={clsx(style.Today__card__icon, step.done && style['Today__card__icon--done'])}>
                  {step.done ? <Check size={20} /> : idx + 1}
                </span>
                <span className={style.Today__card__body}>
                  <span className={style.Today__card__title}>{title}</span>
                  <span className={style.Today__card__desc}>
                    {desc} · {t('todayEstimate', {minutes})}
                  </span>
                </span>
                {step.done ? (
                  <span className={style.Today__card__doneLabel}>{t('todayDone')}</span>
                ) : (
                  <Button color="primary" onClick={action}>
                    {t('todayStart')}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaySession;
