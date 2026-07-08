import React, {FC, useMemo} from 'react';

import {PageTitle} from 'components';
import {useTranslation} from 'react-i18next';
import {Navigate, useParams} from 'react-router-dom';
import {buildPackWords, findWordPack, packMatchGameId, packWordItemId} from 'data/pt/wordPacks';
import {ROUTES} from 'utils/constants';

import Game, {MatchGameConfig} from '../MatchingGame/Game/Game';

const PackMatchPage: FC = () => {
  const {t} = useTranslation();
  const {packId} = useParams();
  const pack = useMemo(() => findWordPack(packId), [packId]);

  const config: MatchGameConfig | undefined = useMemo(
    () =>
      pack
        ? {
            backTo: ROUTES.PORTUGUESE_HUB,
            gameId: packMatchGameId(pack.id),
            getItemId: packWordItemId,
            pool: buildPackWords(pack),
          }
        : undefined,
    [pack],
  );

  if (!pack || !config) return <Navigate to={ROUTES.PORTUGUESE_HUB} replace />;

  return (
    <div className="page animation-scale-up">
      <PageTitle title={t(pack.nameKey)} />
      <Game config={config} />
    </div>
  );
};

export default PackMatchPage;
