import React, {FC} from 'react';

import {GameHub, PageTitle} from 'components';
import {useTranslation} from 'react-i18next';
import {PORTUGUESE_PACKS, PORTUGUESE_TRAINERS, packPath} from 'data/packs/ptPacks';
import {getConjugationMastery} from 'data/pt/conjugation';
import {getVocabMastery} from 'data/pt/srs';
import {getMasteryForIds} from 'services/progress.service';

const PortugueseHub: FC = () => {
  const {t} = useTranslation();

  const packItems = PORTUGUESE_PACKS.map((pack) => {
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

  const masteryByTrainer: Record<string, {mastered: number; total: number}> = {
    'pt.conjugation': getConjugationMastery(),
    'pt.vocab': getVocabMastery(),
  };

  const trainerItems = PORTUGUESE_TRAINERS.map((tr) => {
    const {mastered, total} = masteryByTrainer[tr.id] ?? {mastered: 0, total: 0};

    return {
      badge: `${mastered}/${total} ${t('masteredLabel')}`,
      description: t(tr.descKey),
      flag: tr.flag,
      route: tr.route,
      title: t(tr.nameKey),
    };
  });

  return (
    <div className="page animation-scale-up">
      <PageTitle title={t('portugueseHubTitle')} />
      <GameHub title={t('portugueseHubTitle')} items={[...packItems, ...trainerItems]} />
    </div>
  );
};

export default PortugueseHub;
