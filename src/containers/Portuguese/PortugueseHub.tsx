import React, {FC} from 'react';

import {GameHub, PageTitle} from 'components';
import {useTranslation} from 'react-i18next';
import {PORTUGUESE_PACKS, packPath} from 'data/packs/ptPacks';
import {getMasteryForIds} from 'services/progress.service';

const PortugueseHub: FC = () => {
  const {t} = useTranslation();

  const items = PORTUGUESE_PACKS.map((pack) => {
    const ids = pack.games.flatMap((game) => game.buildQuestions().map((q) => q.id ?? '')).filter(Boolean);
    const {mastered, total} = getMasteryForIds(ids);

    return {
      badge: `${mastered}/${total} ${t('masteredLabel')}`,
      description: t(pack.descKey),
      flag: pack.flag,
      route: packPath(pack.id),
      title: t(pack.nameKey),
    };
  });

  return (
    <div className="page animation-scale-up">
      <PageTitle title={t('portugueseHubTitle')} />
      <GameHub title={t('portugueseHubTitle')} items={items} />
    </div>
  );
};

export default PortugueseHub;
