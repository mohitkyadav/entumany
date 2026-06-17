import React, {FC, useMemo} from 'react';

import {QuizGame} from 'components';
import type {QuizQuestion} from 'components/QuizGame/QuizGame';
import germanNouns from 'data/germanNouns.json';

type GermanNoun = {
  word: string;
  article: string;
  translation: string;
};

const ARTICLE_OPTIONS = ['der', 'die', 'das', '?'];

const buildQuestions = (): QuizQuestion[] =>
  (germanNouns as GermanNoun[]).map((noun) => ({
    answer: noun.article,
    answerLabel: `${noun.article} ${noun.word}`,
    options: ARTICLE_OPTIONS,
    prompt: noun.word,
    subtitle: noun.translation,
  }));

const Game: FC = () => {
  const questions = useMemo(buildQuestions, []);

  return <QuizGame questions={questions} />;
};

export default Game;
