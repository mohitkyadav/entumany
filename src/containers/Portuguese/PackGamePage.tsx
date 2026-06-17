import React, {FC, useMemo} from 'react';

import {PageTitle, QuizGame} from 'components';
import {useTranslation} from 'react-i18next';
import {Navigate, useParams} from 'react-router-dom';
import {ROUTES} from 'utils/constants';
import {findGame} from 'data/packs/ptPacks';
import {recordAnswer, recordGame, selectQuestions} from 'services/progress.service';

const PackGamePage: FC = () => {
  const {t} = useTranslation();
  const {packId, gameId} = useParams();

  const found = useMemo(() => findGame(packId, gameId), [packId, gameId]);
  const questions = useMemo(() => found?.game.buildQuestions() ?? [], [found]);

  if (!found) return <Navigate to={ROUTES.PORTUGUESE_HUB} replace />;

  const {game} = found;

  return (
    <div className="page animation-scale-up">
      <PageTitle title={t(game.titleKey)} />
      <QuizGame
        questions={questions}
        promptVariant={game.promptVariant ?? 'word'}
        selectQuestions={selectQuestions}
        onAnswer={recordAnswer}
        onComplete={({accuracy, bestStreak}) => recordGame(game.id, accuracy, bestStreak)}
      />
    </div>
  );
};

export default PackGamePage;
