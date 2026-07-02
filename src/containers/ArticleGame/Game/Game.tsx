import React, {FC, useMemo} from 'react';

import {QuizGame} from 'components';
import {GERMAN_ARTICLES_GAME_ID, buildArticleQuestions} from 'data/deArticles';
import {recordAnswer, recordGame, selectQuestions} from 'services/progress.service';
import {ROUTES} from 'utils/constants';

const Game: FC = () => {
  const questions = useMemo(buildArticleQuestions, []);

  return (
    <QuizGame
      questions={questions}
      backTo={ROUTES.GERMAN_HUB}
      selectQuestions={selectQuestions}
      onAnswer={recordAnswer}
      onComplete={({accuracy, bestStreak}) => recordGame(GERMAN_ARTICLES_GAME_ID, accuracy, bestStreak)}
    />
  );
};

export default Game;
