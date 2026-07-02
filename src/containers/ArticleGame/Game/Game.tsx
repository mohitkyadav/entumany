import React, {FC, useMemo} from 'react';

import {QuizGame} from 'components';
import {GERMAN_ARTICLES_GAME_ID, buildArticleQuestions} from 'data/deArticles';
import {recordAnswer, recordGame, selectQuestions} from 'services/progress.service';

const Game: FC = () => {
  const questions = useMemo(buildArticleQuestions, []);

  return (
    <QuizGame
      questions={questions}
      selectQuestions={selectQuestions}
      onAnswer={recordAnswer}
      onComplete={({accuracy, bestStreak}) => recordGame(GERMAN_ARTICLES_GAME_ID, accuracy, bestStreak)}
    />
  );
};

export default Game;
