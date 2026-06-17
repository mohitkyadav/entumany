import React, {FC} from 'react';

import {GameHub, PageTitle} from 'components';
import {useTranslation} from 'react-i18next';
import {Navigate, useParams} from 'react-router-dom';
import {ROUTES} from 'utils/constants';
import {findPack, gamePath} from 'data/packs/ptPacks';
import {getGameStats, getMasteryForIds} from 'services/progress.service';

const PackPage: FC = () => {
  const {t} = useTranslation();
  const {packId} = useParams();
  const pack = findPack(packId);

  if (!pack) return <Navigate to={ROUTES.PORTUGUESE_HUB} replace />;

  const items = pack.games.map((game) => {
    const ids = game
      .buildQuestions()
      .map((q) => q.id ?? '')
      .filter(Boolean);
    const {mastered, total} = getMasteryForIds(ids);
    const stats = getGameStats(game.id);
    const badge = stats
      ? `${mastered}/${total} · ${t('bestLabel')} ${stats.bestAccuracy}%`
      : `${mastered}/${total} ${t('masteredLabel')}`;

    return {
      badge,
      description: t(game.descKey),
      flag: game.flag,
      route: gamePath(pack.id, game.id),
      title: t(game.titleKey),
    };
  });

  return (
    <div className="page animation-scale-up">
      <PageTitle title={t(pack.nameKey)} />
      <GameHub title={t(pack.nameKey)} items={items} backTo={ROUTES.PORTUGUESE_HUB} />
    </div>
  );
};

export default PackPage;
