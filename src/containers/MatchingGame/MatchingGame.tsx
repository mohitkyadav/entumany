import React, {FC, useMemo} from 'react';

import {PageTitle} from 'components';
import {useTranslation} from 'react-i18next';
import {EntumanyDB} from 'services/db.service';
import {WORD_GAME_IDS, getAllGameWords, wordItemId} from 'services/wordGames.service';
import Game, {MatchGameConfig} from './Game/Game';

const MatchingGame: FC = () => {
  const {t} = useTranslation();

  // Draw from the whole dictionary, tracked under the shared `word.*` progress.
  const config: MatchGameConfig = useMemo(
    () => ({
      gameId: WORD_GAME_IDS.match,
      getItemId: wordItemId,
      pool: getAllGameWords(EntumanyDB.getInstance().database),
    }),
    [],
  );

  return (
    <div className="page animation-scale-up">
      <PageTitle title={t('matchingGameTitle')} />
      <Game config={config} />
    </div>
  );
};

export default MatchingGame;
