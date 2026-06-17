import React, {FC, useMemo} from 'react';

import {PageTitle, QuizGame} from 'components';
import type {QuizQuestion} from 'components/QuizGame/QuizGame';
import {useTranslation} from 'react-i18next';
import serEstar from 'data/ptSerEstar.json';

type SerEstarItem = {
  sentence: string;
  en: string;
  answer: string;
  options: string[];
  explanation: string;
};

const buildQuestions = (): QuizQuestion[] =>
  (serEstar as SerEstarItem[]).map((item) => ({
    answer: item.answer,
    explanation: item.explanation,
    options: item.options,
    prompt: item.sentence,
    subtitle: item.en,
  }));

const SerEstar: FC = () => {
  const {t} = useTranslation();
  const questions = useMemo(buildQuestions, []);

  return (
    <div className="page animation-scale-up">
      <PageTitle title={t('serEstarGameTitle')} />
      <QuizGame questions={questions} promptVariant="sentence" />
    </div>
  );
};

export default SerEstar;
