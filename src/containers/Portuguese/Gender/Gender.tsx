import React, {FC, useMemo} from 'react';

import {PageTitle, QuizGame} from 'components';
import type {QuizQuestion} from 'components/QuizGame/QuizGame';
import {useTranslation} from 'react-i18next';
import ptNouns from 'data/ptNouns.json';

type PtNoun = {
  word: string;
  gender: 'o' | 'a';
  en: string;
};

const GENDER_OPTIONS = ['o', 'a'];

const buildQuestions = (): QuizQuestion[] =>
  (ptNouns as PtNoun[]).map((noun) => ({
    answer: noun.gender,
    answerLabel: `${noun.gender} ${noun.word}`,
    options: GENDER_OPTIONS,
    prompt: noun.word,
    subtitle: noun.en,
  }));

const Gender: FC = () => {
  const {t} = useTranslation();
  const questions = useMemo(buildQuestions, []);

  return (
    <div className="page animation-scale-up">
      <PageTitle title={t('genderGameTitle')} />
      <QuizGame questions={questions} />
    </div>
  );
};

export default Gender;
